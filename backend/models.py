from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime

# Socio Model
class SocioBase(SQLModel):
    rut: str = Field(index=True, unique=True)
    nombre: str
    direccion: Optional[str] = None
    email: Optional[str] = None
    telefono: Optional[str] = None

class Socio(SocioBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    # New: Initial reading to avoid charging for historical consumption on first bill
    lectura_inicial: float = 0.0

    lecturas: List["Lectura"] = Relationship(back_populates="socio")

class SocioCreate(SocioBase):
    lectura_inicial: Optional[float] = 0.0

class SocioRead(SocioBase):
    id: int
    lectura_inicial: float

# Lectura Model (Meter Reading)
class LecturaBase(SQLModel):
    socio_id: int = Field(foreign_key="socio.id")
    fecha: datetime = Field(default_factory=datetime.utcnow)
    consumo_m3: float # Consumo actual en metros cúbicos
    lectura_anterior: float = 0.0
    lectura_actual: float = 0.0

class Lectura(LecturaBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    socio: Socio = Relationship(back_populates="lecturas")
    boleta: Optional["Boleta"] = Relationship(back_populates="lectura")

class LecturaCreate(SQLModel):
    socio_rut: str # Input with RUT is easier for users than ID
    lectura_actual: float

class LecturaRead(LecturaBase):
    id: int

# Boleta Model (Invoice)
class BoletaBase(SQLModel):
    lectura_id: int = Field(foreign_key="lectura.id")
    monto_total: int
    fecha_emision: datetime = Field(default_factory=datetime.utcnow)
    estado_pago: str = "PENDIENTE" # PENDIENTE, PAGADO
    track_id_sii: Optional[str] = None # For SII integration

class Boleta(BoletaBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    lectura: Lectura = Relationship(back_populates="boleta")
    detalles: List["DetalleBoleta"] = Relationship(back_populates="boleta")

class BoletaRead(BoletaBase):
    id: int
    detalles: List["DetalleBoleta"]

# Detalle Boleta (Line items)
class DetalleBoletaBase(SQLModel):
    boleta_id: int = Field(foreign_key="boleta.id")
    descripcion: str
    monto: int

class DetalleBoleta(DetalleBoletaBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    boleta: Boleta = Relationship(back_populates="detalles")

class DetalleBoletaRead(DetalleBoletaBase):
    id: int
