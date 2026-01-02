def validate_rut(rut: str) -> bool:
    """
    Valida un RUT chileno.
    Retorna True si es válido, False si no.
    """
    rut = rut.replace(".", "").replace("-", "")
    if len(rut) < 2:
        return False

    cuerpo = rut[:-1]
    dv = rut[-1].upper()

    # Validar que el cuerpo sean solo números
    if not cuerpo.isdigit():
        return False

    # Algoritmo Módulo 11
    suma = 0
    multiplicador = 2

    for i in range(len(cuerpo) - 1, -1, -1):
        suma += int(cuerpo[i]) * multiplicador
        multiplicador += 1
        if multiplicador > 7:
            multiplicador = 2

    resto = 11 - (suma % 11)
    if resto == 11:
        dv_calculado = '0'
    elif resto == 10:
        dv_calculado = 'K'
    else:
        dv_calculado = str(resto)

    return dv == dv_calculado

def format_rut(rut: str) -> str:
    """
    Formatea un RUT a XX.XXX.XXX-Y
    """
    rut = rut.replace(".", "").replace("-", "")
    if len(rut) < 2:
        return rut

    cuerpo = rut[:-1]
    dv = rut[-1].upper()

    # Add dots
    reversed_cuerpo = cuerpo[::-1]
    parts = [reversed_cuerpo[i:i+3] for i in range(0, len(reversed_cuerpo), 3)]
    formatted_cuerpo = ".".join(parts)[::-1]

    return f"{formatted_cuerpo}-{dv}"

def clean_rut(rut: str) -> str:
    """
    Retorna el RUT sin puntos ni guión, con K mayúscula.
    """
    rut = rut.replace(".", "").replace("-", "")
    return rut[:-1] + rut[-1].upper()
