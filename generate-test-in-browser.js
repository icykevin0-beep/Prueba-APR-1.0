/* 
 * INSTRUCCIONES: 
 * Copia este código completo, abre la consola del navegador (F12)
 * y pégalo. Ejecutará y descargará test_data.xlsx automáticamente.
 */

// Datos de prueba con todos los escenarios
const testData = [
    { RUT: "9.876.543-2", Nombre: "Maria Soto" },                    // Válido, nuevo
    { RUT: "12.345.678-5", Nombre: "Juan Perez Actualizado" },      // Válido, duplicado en BD
    { RUT: "11.111.111-9", Nombre: "PEDRO GOMEZ" },                 // Inválido (DV malo)
    { RUT: "46266", Nombre: "Ana Martinez" },                       // Inválido (faltan ceros)
    { RUT: "15.234.567-8", Nombre: "carlos rodriguez" },            // Válido, nuevo, capitalización
    { RUT: "12.345.678-5", Nombre: "Duplicado Interno" },           // Duplicado interno
    { RUT: "7.654.321-0", Nombre: "   Sofia   Lopez   " }           // Válido, normalización espacios
];

// Crear Excel
const ws = XLSX.utils.json_to_sheet(testData);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Socios");
XLSX.writeFile(wb, "test_data.xlsx");

console.log("✅ Archivo test_data.xlsx descargado con 7 registros");
console.log("Contiene: 4 válidos, 2 inválidos, 1 duplicado, 1 duplicado interno");
