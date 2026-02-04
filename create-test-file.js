const XLSX = require('xlsx');

// Create test data with various scenarios
const testData = [
    // Header row
    ["RUT", "Nombre"],
    // Valid, new
    ["9.876.543-2", "Maria Soto"],
    // Valid, duplicate with BD (12.345.678-5 exists as "Juan P.")
    ["12.345.678-5", "Juan Perez Actualizado"],
    // Invalid - wrong DV
    ["11.111.111-9", "PEDRO GOMEZ"],
    // Invalid - missing zeros, should suggest correction
    ["46266", "Ana Martinez"],
    // Valid, new
    ["15.234.567-8", "carlos rodriguez"],
    // Internal duplicate (same as row 3)
    ["12.345.678-5", "Otro Nombre"],
    // Valid, new
    ["7.654.321-0", "   Sofia   Lopez   "]
];

// Create workbook and worksheet
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet(testData);

// Add worksheet to workbook
XLSX.utils.book_append_sheet(wb, ws, "Socios");

// Write file
XLSX.writeFile(wb, "test_import.xlsx");

console.log("✅ Archivo test_import.xlsx creado con 7 registros de prueba");
console.log("- 4 válidos (2 nuevos, 1 duplicado, 1 duplicado interno)");
console.log("- 2 inválidos con sugerencia de corrección");
console.log("- 1 con normalización de espacios");
