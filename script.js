// ========================================
// GLOBAL STATE
// ========================================
let mockDB = [
    { rut: "12.345.678-5", nombre: "Juan P." },
    { rut: "11.111.111-1", nombre: "Maria Gonzales" }
];

let importedData = [];
let hasErrors = false;
let importHistory = [];

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    loadDBFromLocalStorage();
    loadHistoryFromLocalStorage();
    renderDB();
    renderHistory();

    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const btnSave = document.getElementById('btn-save');
    const btnReset = document.getElementById('btn-reset');
    const btnExportClean = document.getElementById('btn-export-clean');
    const btnExportErrors = document.getElementById('btn-export-errors');
    const btnDownloadTemplate = document.getElementById('btn-download-template');
    const btnExportDB = document.getElementById('btn-export-db');
    const btnImportDB = document.getElementById('btn-import-db');
    const dbImportInput = document.getElementById('db-import-input');
    const searchDB = document.getElementById('search-db');

    // Drag & Drop Events
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length) handleFile(files[0]);
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleFile(e.target.files[0]);
    });

    btnReset.addEventListener('click', resetUI);
    btnSave.addEventListener('click', saveToDatabase);
    btnExportClean.addEventListener('click', exportCleanExcel);
    btnExportErrors.addEventListener('click', exportErrorReport);
    btnDownloadTemplate.addEventListener('click', downloadTemplate);
    btnExportDB.addEventListener('click', exportDatabase);
    btnImportDB.addEventListener('click', () => dbImportInput.click());
    dbImportInput.addEventListener('change', importDatabase);
    searchDB.addEventListener('input', filterDB);
});

// ========================================
// FILE HANDLING
// ========================================
function handleFile(file) {
    const reader = new FileReader();

    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        processData(jsonData);
    };

    reader.readAsArrayBuffer(file);
}

function processData(rows) {
    if (rows.length < 2) return;

    const headers = rows[0].map(h => String(h).toLowerCase());
    const rutIndex = headers.findIndex(h => h.includes('rut'));
    const nameIndex = headers.findIndex(h => h.includes('nombre') || h.includes('name'));

    if (rutIndex === -1 || nameIndex === -1) {
        alert("El archivo debe tener columnas 'RUT' y 'Nombre'");
        return;
    }

    importedData = [];
    hasErrors = false;

    // Track RUTs seen in this file for internal duplicate detection
    const seenRuts = new Map();

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row[rutIndex]) continue;

        const rawRut = String(row[rutIndex]);
        const rawName = String(row[nameIndex] || "");

        const rutValidation = validateRut(rawRut);
        const formattedName = formatName(rawName);

        if (!rutValidation.isValid) {
            hasErrors = true;
            // Try auto-correction
            const suggestion = attemptRutCorrection(rawRut);
            importedData.push({
                originalRut: rawRut,
                cleanRut: rutValidation.cleanRut,
                isValid: false,
                originalName: rawName,
                formattedName: formattedName,
                status: 'Invalido',
                suggestion: suggestion,
                isInternalDuplicate: false
            });
        } else {
            // Check for internal duplicates
            const cleanRut = rutValidation.cleanRut;
            const isInternalDup = seenRuts.has(cleanRut);
            if (!isInternalDup) {
                seenRuts.set(cleanRut, true);
            }

            importedData.push({
                originalRut: rawRut,
                cleanRut: cleanRut,
                isValid: true,
                originalName: rawName,
                formattedName: formattedName,
                status: 'OK',
                suggestion: null,
                isInternalDuplicate: isInternalDup
            });
        }
    }

    renderPreview();
    renderStatistics();
    document.getElementById('duplicate-strategy-section').classList.remove('hidden');
}

// ========================================
// RUT VALIDATION & CORRECTION
// ========================================
function validateRut(rut) {
    let clean = rut.replace(/[^0-9kK]/g, '');

    if (clean.length < 2) return { isValid: false, cleanRut: clean };

    const body = clean.slice(0, -1);
    const dv = clean.slice(-1).toUpperCase();

    if (!/^\d+$/.test(body)) return { isValid: false, cleanRut: clean };

    let suma = 0;
    let multiplicador = 2;

    for (let i = body.length - 1; i >= 0; i--) {
        suma += parseInt(body.charAt(i)) * multiplicador;
        multiplicador++;
        if (multiplicador > 7) multiplicador = 2;
    }

    const resto = 11 - (suma % 11);
    let dvCalculado = '0';

    if (resto === 11) dvCalculado = '0';
    else if (resto === 10) dvCalculado = 'K';
    else dvCalculado = resto.toString();

    const formatted = formatRutDots(body, dv);

    return {
        isValid: dv === dvCalculado,
        cleanRut: formatted
    };
}

function formatRutDots(body, dv) {
    return body.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "-" + dv;
}

function formatName(name) {
    if (!name) return "";
    return name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function attemptRutCorrection(invalidRut) {
    // Remove all formatting
    let clean = invalidRut.replace(/[^0-9]/g, '');
    
    // Try padding with zeros
    for (let zeros = 1; zeros <= 3; zeros++) {
        const padded = "0".repeat(zeros) + clean;
        
        // Try all possible DVs
        for (let dv of ['0','1','2','3','4','5','6','7','8','9','K']) {
            const testRut = padded.slice(0, -1) + dv;
            const validation = validateRut(testRut);
            if (validation.isValid) {
                return { 
                    suggested: validation.cleanRut, 
                    confidence: "alta",
                    method: `Agregados ${zeros} cero(s) al inicio y DV corregido a ${dv}`
                };
            }
        }
    }
    
    // Try with current body but different DV
    const body = clean.slice(0, -1) || clean;
    for (let dv of ['0','1','2','3','4','5','6','7','8','9','K']) {
        const testRut = body + dv;
        const validation = validateRut(testRut);
        if (validation.isValid) {
            return { 
                suggested: validation.cleanRut, 
                confidence: "media",
                method: `DV corregido a ${dv}`
            };
        }
    }
    
    return null;
}

// ========================================
// STATISTICS
// ========================================
function renderStatistics() {
    const total = importedData.length;
    const valid = importedData.filter(item => item.isValid).length;
    const invalid = total - valid;
    const duplicates = importedData.filter(item => {
        const existing = mockDB.find(db => db.rut === item.cleanRut);
        return existing && item.isValid;
    }).length;
    const internalDuplicates = importedData.filter(item => item.isInternalDuplicate).length;

    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-valid').textContent = valid;
    document.getElementById('stat-valid-pct').textContent = 
        total > 0 ? `${Math.round((valid / total) * 100)}%` : '0%';
    document.getElementById('stat-invalid').textContent = invalid;
    document.getElementById('stat-invalid-pct').textContent = 
        total > 0 ? `${Math.round((invalid / total) * 100)}%` : '0%';
    document.getElementById('stat-duplicates').textContent = duplicates;
    document.getElementById('stat-internal-dup').textContent = internalDuplicates;

    document.getElementById('stats-panel').classList.remove('hidden');
}

// ========================================
// PREVIEW RENDERING
// ========================================
function renderPreview() {
    const tableBody = document.querySelector('#preview-table tbody');
    tableBody.innerHTML = '';

    document.getElementById('preview-section').classList.remove('hidden');
    document.getElementById('drop-zone').classList.add('hidden');

    importedData.forEach((item, index) => {
        const tr = document.createElement('tr');

        if (!item.isValid) {
            tr.classList.add('row-error');
        }

        const existing = mockDB.find(dbItem => dbItem.rut === item.cleanRut);
        let actionText = "Nuevo";
        if (existing) actionText = "Existe (Actualizar?)";
        if (!item.isValid) {
            if (item.suggestion) {
                actionText = `Sugerencia: ${item.suggestion.suggested}`;
            } else {
                actionText = "Corregir RUT";
            }
        }
        if (item.isInternalDuplicate) {
            actionText += " [DUP INTERNO]";
            tr.style.backgroundColor = 'rgba(230, 126, 34, 0.1)';
        }

        tr.innerHTML = `
            <td class="${item.isValid ? 'status-ok' : 'status-error'}">${item.status}</td>
            <td>${item.originalRut}</td>
            <td class="editable-cell" data-index="${index}" data-field="rut">${item.cleanRut}</td>
            <td>${item.originalName}</td>
            <td>${item.formattedName}</td>
            <td>${actionText}</td>
        `;
        tableBody.appendChild(tr);
    });

    // Add double-click edit functionality
    document.querySelectorAll('.editable-cell').forEach(cell => {
        cell.addEventListener('dblclick', handleCellEdit);
    });

    const btnSave = document.getElementById('btn-save');
    btnSave.disabled = hasErrors;
}

function handleCellEdit(e) {
    const cell = e.target;
    const index = parseInt(cell.dataset.index);
    const field = cell.dataset.field;
    const currentValue = cell.textContent;

    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentValue;
    input.className = 'cell-input';

    cell.textContent = '';
    cell.appendChild(input);
    input.focus();
    input.select();

    const saveEdit = () => {
        const newValue = input.value.trim();
        
        if (field === 'rut') {
            const validation = validateRut(newValue);
            importedData[index].cleanRut = validation.cleanRut;
            importedData[index].isValid = validation.isValid;
            importedData[index].status = validation.isValid ? 'OK' : 'Invalido';
            
            // Recalculate errors
            hasErrors = importedData.some(item => !item.isValid);
        }
        
        renderPreview();
        renderStatistics();
    };

    input.addEventListener('blur', saveEdit);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveEdit();
    });
}

// ========================================
// SAVE TO DATABASE
// ========================================
function saveToDatabase() {
    const dupMode = document.getElementById('dup-mode').value;
    let newCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    const duplicatesToReview = [];

    for (const item of importedData) {
        if (!item.isValid) continue;
        if (item.isInternalDuplicate) {
            skippedCount++;
            continue; // Skip internal duplicates
        }

        const existingIndex = mockDB.findIndex(db => db.rut === item.cleanRut);

        if (existingIndex !== -1) {
            const existingRecord = mockDB[existingIndex];

            if (existingRecord.nombre !== item.formattedName) {
                if (dupMode === 'ask') {
                    const userWantsUpdate = confirm(
                        `El RUT ${item.cleanRut} ya existe.\n` +
                        `Nombre actual: ${existingRecord.nombre}\n` +
                        `Nuevo nombre: ${item.formattedName}\n\n` +
                        `¿Desea actualizar el nombre?`
                    );

                    if (userWantsUpdate) {
                        mockDB[existingIndex].nombre = item.formattedName;
                        updatedCount++;
                    } else {
                        skippedCount++;
                    }
                } else if (dupMode === 'always-update') {
                    mockDB[existingIndex].nombre = item.formattedName;
                    updatedCount++;
                } else if (dupMode === 'never-update') {
                    skippedCount++;
                } else if (dupMode === 'review') {
                    duplicatesToReview.push({
                        rut: item.cleanRut,
                        currentName: existingRecord.nombre,
                        newName: item.formattedName,
                        index: existingIndex
                    });
                }
            } else {
                skippedCount++; // Same name, no change needed
            }
        } else {
            mockDB.push({
                rut: item.cleanRut,
                nombre: item.formattedName
            });
            newCount++;
        }
    }

    // Handle review mode
    if (dupMode === 'review' && duplicatesToReview.length > 0) {
        const reviewMessage = duplicatesToReview.map(dup => 
            `${dup.rut}: ${dup.currentName} → ${dup.newName}`
        ).join('\n');
        
        const updateAll = confirm(
            `Se encontraron ${duplicatesToReview.length} duplicado(s) con nombres diferentes:\n\n` +
            reviewMessage +
            `\n\n¿Actualizar todos estos nombres?`
        );

        if (updateAll) {
            duplicatesToReview.forEach(dup => {
                mockDB[dup.index].nombre = dup.newName;
                updatedCount++;
            });
        } else {
            skippedCount += duplicatesToReview.length;
        }
    }

    // Log to history
    addToHistory({
        nuevos: newCount,
        actualizados: updatedCount,
        omitidos: skippedCount,
        total: importedData.length,
        errores: importedData.filter(i => !i.isValid).length
    });

    alert(`Proceso finalizado.\nNuevos: ${newCount}\nActualizados: ${updatedCount}\nOmitidos: ${skippedCount}`);
    
    saveDBToLocalStorage();
    renderDB();
    resetUI();
}

// ========================================
// DATABASE RENDERING & SEARCH
// ========================================
function renderDB(filteredData = null) {
    const container = document.getElementById('db-table-container');
    const dataToRender = filteredData || mockDB;

    if (dataToRender.length === 0) {
        container.innerHTML = '<p style="padding: 20px; text-align: center; color: #7f8c8d;">No hay registros en la base de datos</p>';
        return;
    }

    const table = document.createElement('table');
    table.id = 'db-table';

    table.innerHTML = `
        <thead>
            <tr>
                <th>RUT</th>
                <th>Nombre</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            ${dataToRender.map((record, index) => `
                <tr>
                    <td>${record.rut}</td>
                    <td>${record.nombre}</td>
                    <td>
                        <button class="db-action-btn edit" onclick="editDBRecord('${record.rut}')">✏️ Editar</button>
                        <button class="db-action-btn delete" onclick="deleteDBRecord('${record.rut}')">🗑️ Eliminar</button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;

    container.innerHTML = '';
    container.appendChild(table);
}

function filterDB(e) {
    const query = e.target.value.toLowerCase().trim();
    
    if (!query) {
        renderDB();
        return;
    }

    const filtered = mockDB.filter(record => 
        record.rut.toLowerCase().includes(query) || 
        record.nombre.toLowerCase().includes(query)
    );

    renderDB(filtered);
}

function editDBRecord(rut) {
    const record = mockDB.find(r => r.rut === rut);
    if (!record) return;

    const newName = prompt(`Editar nombre para RUT ${rut}:`, record.nombre);
    if (newName && newName.trim()) {
        record.nombre = formatName(newName);
        saveDBToLocalStorage();
        renderDB();
    }
}

function deleteDBRecord(rut) {
    const confirmed = confirm(`¿Está seguro de eliminar el registro con RUT ${rut}?`);
    if (confirmed) {
        const index = mockDB.findIndex(r => r.rut === rut);
        if (index !== -1) {
            mockDB.splice(index, 1);
            saveDBToLocalStorage();
            renderDB();
        }
    }
}

// ========================================
// EXPORT FUNCTIONS
// ========================================
function exportCleanExcel() {
    const validData = importedData.filter(item => item.isValid && !item.isInternalDuplicate);
    
    if (validData.length === 0) {
        alert('No hay datos válidos para exportar');
        return;
    }

    const worksheet = XLSX.utils.json_to_sheet(
        validData.map(item => ({
            RUT: item.cleanRut,
            Nombre: item.formattedName
        }))
    );
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Datos Limpios");
    XLSX.writeFile(workbook, `socios_corregidos_${getTimestamp()}.xlsx`);
}

function exportErrorReport() {
    const errorData = importedData.filter(item => !item.isValid);
    
    if (errorData.length === 0) {
        alert('No hay errores para reportar');
        return;
    }

    const worksheet = XLSX.utils.json_to_sheet(
        errorData.map(item => ({
            "RUT Original": item.originalRut,
            "Nombre": item.originalName,
            "Error": "RUT inválido - dígito verificador incorrecto",
            "Sugerencia": item.suggestion ? item.suggestion.suggested : "N/A",
            "Método": item.suggestion ? item.suggestion.method : "N/A"
        }))
    );
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Errores");
    XLSX.writeFile(workbook, `errores_importacion_${getTimestamp()}.xlsx`);
}

function downloadTemplate() {
    const templateData = [
        { RUT: "12.345.678-5", Nombre: "Juan Pérez" },
        { RUT: "11.111.111-1", Nombre: "María González" },
        { RUT: "9.876.543-2", Nombre: "Pedro Soto" }
    ];
    
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Plantilla");
    XLSX.writeFile(workbook, "plantilla_socios.xlsx");
}

function exportDatabase() {
    const dataStr = JSON.stringify(mockDB, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_bd_${getTimestamp()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function importDatabase(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const imported = JSON.parse(event.target.result);
            if (Array.isArray(imported)) {
                const confirmed = confirm(
                    `¿Está seguro de reemplazar la base de datos actual?\n` +
                    `Registros actuales: ${mockDB.length}\n` +
                    `Registros a importar: ${imported.length}`
                );
                
                if (confirmed) {
                    mockDB = imported;
                    saveDBToLocalStorage();
                    renderDB();
                    alert('Base de datos importada exitosamente');
                }
            } else {
                alert('Formato de archivo inválido');
            }
        } catch (err) {
            alert('Error al leer el archivo: ' + err.message);
        }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
}

// ========================================
// HISTORY
// ========================================
function addToHistory(stats) {
    const entry = {
        timestamp: new Date().toISOString(),
        ...stats
    };
    importHistory.unshift(entry); // Add to beginning
    
    // Keep only last 10 entries
    if (importHistory.length > 10) {
        importHistory = importHistory.slice(0, 10);
    }
    
    saveHistoryToLocalStorage();
    renderHistory();
}

function renderHistory() {
    if (importHistory.length === 0) {
        document.getElementById('history-section').classList.add('hidden');
        return;
    }

    document.getElementById('history-section').classList.remove('hidden');
    const container = document.getElementById('history-log');
    
    container.innerHTML = importHistory.map(entry => {
        const date = new Date(entry.timestamp);
        const hasErrors = entry.errores > 0;
        
        return `
            <div class="history-item ${hasErrors ? 'with-errors' : ''}">
                <div class="history-timestamp">${date.toLocaleString('es-CL')}</div>
                <div class="history-details">
                    Total procesados: ${entry.total} | 
                    Nuevos: ${entry.nuevos} | 
                    Actualizados: ${entry.actualizados} | 
                    Omitidos: ${entry.omitidos} | 
                    Errores: ${entry.errores}
                </div>
            </div>
        `;
    }).join('');
}

// ========================================
// LOCAL STORAGE
// ========================================
function saveDBToLocalStorage() {
    localStorage.setItem('mockDB', JSON.stringify(mockDB));
}

function loadDBFromLocalStorage() {
    const stored = localStorage.getItem('mockDB');
    if (stored) {
        try {
            mockDB = JSON.parse(stored);
        } catch (e) {
            console.error('Error loading DB from localStorage:', e);
        }
    }
}

function saveHistoryToLocalStorage() {
    localStorage.setItem('importHistory', JSON.stringify(importHistory));
}

function loadHistoryFromLocalStorage() {
    const stored = localStorage.getItem('importHistory');
    if (stored) {
        try {
            importHistory = JSON.parse(stored);
        } catch (e) {
            console.error('Error loading history from localStorage:', e);
        }
    }
}

// ========================================
// UTILITIES
// ========================================
function resetUI() {
    importedData = [];
    hasErrors = false;
    document.getElementById('file-input').value = '';
    document.querySelector('#preview-table tbody').innerHTML = '';
    document.getElementById('preview-section').classList.add('hidden');
    document.getElementById('stats-panel').classList.add('hidden');
    document.getElementById('duplicate-strategy-section').classList.add('hidden');
    document.getElementById('drop-zone').classList.remove('hidden');
}

function getTimestamp() {
    return new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
}
