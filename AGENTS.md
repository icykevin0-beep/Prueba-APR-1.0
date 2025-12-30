# Importador Masivo de Socios

## Contexto del Proyecto
Este es una aplicación web SPA (Single Page Application) para la carga masiva de socios mediante archivos Excel. Se ejecuta totalmente en el navegador (Client-Side) por privacidad y rapidez.

## Stack Tecnológico
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla).
- **Librerías**: `SheetJS` (xlsx.full.min.js) para parsear archivos Excel.

## Reglas Críticas de Negocio

### 1. Identificador Único: RUT
- El **RUT (Rol Único Tributario)** es la única llave válida para identificar a una persona.
- **Validación**: Se debe usar estrictamente el algoritmo **Módulo 11 Chileno**.
  - Si el dígito verificador no coincide, el registro es inválido.
  - El sistema debe bloquear la importación si hay RUTs inválidos.
- **Formato**: Internamente se maneja limpio (sin puntos, con guion). Visualmente se muestra formateado (12.345.678-K).

### 2. Normalización de Nombres
- Los nombres deben guardarse siempre en **Title Case** (ej: "JUAN PEREZ" -> "Juan Perez").
- Se deben eliminar espacios al inicio, final y múltiples espacios intermedios.

### 3. Estrategia de Deduplicación
- **Nunca** comparar por nombre para detectar duplicados.
- Buscar siempre por RUT en la base de datos (`mockDB`).
- **Conflicto**: Si el RUT existe pero el nombre es diferente:
  - **Acción**: Preguntar explícitamente al usuario (Confirmación) si desea actualizar el nombre.
  - No sobrescribir automáticamente.

## Comandos Útiles
- Para probar localmente: `python3 -m http.server 8000`
