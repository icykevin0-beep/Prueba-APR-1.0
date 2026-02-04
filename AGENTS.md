# Importador Masivo de Socios

## Contexto del Proyecto
Este es una aplicación web SPA (Single Page Application) para la carga masiva de socios mediante archivos Excel. Se ejecuta totalmente en el navegador (Client-Side) por privacidad y rapidez.

## Stack Tecnológico
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla).
- **Librerías**: `SheetJS` (xlsx.full.min.js) para parsear archivos Excel.
- **Persistencia**: LocalStorage del navegador para guardar la base de datos y historial.

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

## Funcionalidades de Productividad

### 📥 Exportar Excel Corregido
- Genera un archivo .xlsx con solo los datos válidos
- RUTs formateados correctamente
- Nombres normalizados en Title Case
- Excluye duplicados internos

### ⚠️ Exportar Reporte de Errores
- Archivo Excel con todos los registros inválidos
- Incluye RUT original, nombre, y descripción del error
- Muestra sugerencias de corrección automática cuando están disponibles

### 📋 Descargar Plantilla
- Genera un archivo Excel de ejemplo con el formato correcto
- Incluye ejemplos de RUTs y nombres válidos
- Para compartir con personas que envían datos

### 🔧 Auto-Corrección de RUTs
- Intenta corregir RUTs con errores comunes
- Agrega ceros faltantes al inicio
- Prueba diferentes dígitos verificadores
- Muestra sugerencias con nivel de confianza

### 📊 Estadísticas de Calidad
- Total de registros procesados
- Porcentaje de válidos vs inválidos
- Cantidad de duplicados con la BD
- Duplicados internos en el mismo archivo

### 🔄 Estrategias de Duplicados
- **Preguntar cada vez**: Confirmación manual (por defecto)
- **Siempre actualizar**: Sobrescribe nombres automáticamente
- **Nunca actualizar**: Solo agrega nuevos, no modifica existentes
- **Revisar al final**: Muestra resumen de todos los duplicados antes de decidir

### 💾 Backup y Restauración
- **Exportar BD**: Descarga archivo JSON con toda la base de datos
- **Importar BD**: Carga BD desde archivo JSON
- **Auto-save**: Guarda automáticamente en LocalStorage del navegador

### 🔍 Búsqueda en Base de Datos
- Filtro en tiempo real por RUT o nombre
- Case-insensitive
- Actualización instantánea de resultados

### ✏️ Edición Manual
- Editar nombres directamente en la tabla de BD
- Eliminar registros individuales
- Confirma antes de eliminar

### 📜 Historial de Importaciones
- Log de las últimas 10 importaciones
- Timestamp de cada operación
- Estadísticas: nuevos, actualizados, omitidos, errores
- Persiste en LocalStorage

### 📝 Edición Inline en Previsualización
- Doble click en RUT para editar
- Validación automática al modificar
- Actualiza estadísticas en tiempo real

## Comandos Útiles
- Para probar localmente: `python3 -m http.server 8000` o `npx -y http-server -p 8000`

