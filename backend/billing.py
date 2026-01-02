from typing import List, Dict

# Configuración de Tramos (Hardcoded for now, could be in DB)
# Ejemplo:
# 0 - 10 m3: $500 por m3 (Cargo fijo incluido en el primer tramo o aparte)
# 11 - 20 m3: $1000 por m3
# > 20 m3: $2000 por m3
CARGO_FIJO = 2000

TRAMOS = [
    {"limite": 10, "precio": 500},
    {"limite": 20, "precio": 1000},
    {"limite": float("inf"), "precio": 2000},
]

def calcular_total_boleta(consumo_m3: float) -> Dict:
    """
    Calcula el total a pagar según tramos.
    Retorna un diccionario con el total y el detalle.
    """
    total = CARGO_FIJO
    detalles = [{"descripcion": "Cargo Fijo", "monto": CARGO_FIJO}]

    consumo_restante = consumo_m3
    tramo_anterior = 0

    for tramo in TRAMOS:
        if consumo_restante <= 0:
            break

        limite_actual = tramo["limite"]
        rango_tramo = limite_actual - tramo_anterior

        # Cuánto consumió en este tramo
        consumo_en_tramo = min(consumo_restante, rango_tramo)

        costo_tramo = int(consumo_en_tramo * tramo["precio"])

        if consumo_en_tramo > 0:
            detalles.append({
                "descripcion": f"Consumo {consumo_en_tramo:.1f} m3 (Tramo ${tramo['precio']})",
                "monto": costo_tramo
            })
            total += costo_tramo

        consumo_restante -= consumo_en_tramo
        tramo_anterior = limite_actual

    return {
        "total": int(total),
        "detalles": detalles
    }
