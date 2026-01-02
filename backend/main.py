from fastapi import FastAPI, HTTPException, Depends, Query
from sqlmodel import Session, select
from typing import List

from backend.database import create_db_and_tables, get_session
from backend.models import (
    Socio, SocioCreate, SocioRead,
    Lectura, LecturaCreate, LecturaRead,
    Boleta, BoletaRead, DetalleBoleta
)
from backend.utils import validate_rut, clean_rut, format_rut
from backend.billing import calcular_total_boleta
from backend.sii import SIIService

app = FastAPI(
    title="API Importador Masivo de Socios APR",
    description="Backend brutal para gestión de agua potable rural.",
    version="1.0.0"
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

# --- SOCIOS ENDPOINTS ---

@app.post("/socios/", response_model=SocioRead)
def create_socio(socio: SocioCreate, session: Session = Depends(get_session)):
    # 1. Validar RUT
    if not validate_rut(socio.rut):
        raise HTTPException(status_code=400, detail="RUT inválido")

    # 2. Limpiar RUT (Standardize)
    socio.rut = format_rut(clean_rut(socio.rut))

    # 3. Check duplicate
    existing_socio = session.exec(select(Socio).where(Socio.rut == socio.rut)).first()
    if existing_socio:
        raise HTTPException(status_code=400, detail="El RUT ya está registrado")

    # 4. Save
    db_socio = Socio.from_orm(socio)
    session.add(db_socio)
    session.commit()
    session.refresh(db_socio)
    return db_socio

@app.get("/socios/", response_model=List[SocioRead])
def read_socios(offset: int = 0, limit: int = 100, session: Session = Depends(get_session)):
    socios = session.exec(select(Socio).offset(offset).limit(limit)).all()
    return socios

@app.get("/socios/{rut}", response_model=SocioRead)
def read_socio(rut: str, session: Session = Depends(get_session)):
    # Try to find by input string, if not clean it
    socio = session.exec(select(Socio).where(Socio.rut == rut)).first()
    if not socio:
        clean = format_rut(clean_rut(rut))
        socio = session.exec(select(Socio).where(Socio.rut == clean)).first()

    if not socio:
        raise HTTPException(status_code=404, detail="Socio no encontrado")
    return socio

# --- LECTURAS & BILLING ENDPOINTS ---

@app.post("/lecturas/", response_model=BoletaRead)
def create_lectura(lectura_in: LecturaCreate, session: Session = Depends(get_session)):
    """
    Ingresa una lectura, calcula el consumo, genera la boleta y 'envía' al SII.
    """
    # 1. Find Socio
    clean_rut_input = format_rut(clean_rut(lectura_in.socio_rut))
    socio = session.exec(select(Socio).where(Socio.rut == clean_rut_input)).first()
    if not socio:
        raise HTTPException(status_code=404, detail=f"Socio con RUT {lectura_in.socio_rut} no encontrado")

    # 2. Get previous reading to calc consumption
    #    Look for the last reading in DB. If none, use 'lectura_inicial' from Socio.
    last_lectura = session.exec(
        select(Lectura).where(Lectura.socio_id == socio.id).order_by(Lectura.fecha.desc())
    ).first()

    lectura_anterior = last_lectura.lectura_actual if last_lectura else socio.lectura_inicial

    if lectura_in.lectura_actual < lectura_anterior:
        raise HTTPException(
            status_code=400,
            detail=f"La lectura actual ({lectura_in.lectura_actual}) no puede ser menor a la anterior ({lectura_anterior})"
        )

    consumo = lectura_in.lectura_actual - lectura_anterior

    # 3. Create Lectura Record
    db_lectura = Lectura(
        socio_id=socio.id,
        consumo_m3=consumo,
        lectura_anterior=lectura_anterior,
        lectura_actual=lectura_in.lectura_actual
    )
    session.add(db_lectura)
    session.commit()
    session.refresh(db_lectura)

    # 4. Calculate Bill
    calculo = calcular_total_boleta(consumo)

    # 5. Create Boleta Record
    db_boleta = Boleta(
        lectura_id=db_lectura.id,
        monto_total=calculo["total"]
    )
    session.add(db_boleta)
    session.commit()
    session.refresh(db_boleta)

    # 6. Create Details
    for det in calculo["detalles"]:
        detalle = DetalleBoleta(
            boleta_id=db_boleta.id,
            descripcion=det["descripcion"],
            monto=det["monto"]
        )
        session.add(detalle)

    # 7. Simulate SII Interaction
    sii_response = SIIService.generar_boleta_electronica(
        rut_emisor="76.000.000-1", # Example APR RUT
        rut_receptor=socio.rut,
        monto=db_boleta.monto_total,
        detalles=calculo["detalles"]
    )

    db_boleta.track_id_sii = sii_response["track_id"]
    session.add(db_boleta)
    session.commit()
    session.refresh(db_boleta)

    return db_boleta

@app.get("/boletas/{boleta_id}", response_model=BoletaRead)
def read_boleta(boleta_id: int, session: Session = Depends(get_session)):
    boleta = session.get(Boleta, boleta_id)
    if not boleta:
        raise HTTPException(status_code=404, detail="Boleta no encontrada")
    return boleta
