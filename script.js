// Mock Database
let mockDB = [
    { rut: "12.345.678-5", nombre: "Juan P." }, // Example conflict
    { rut: "11.111.111-1", nombre: "Maria Gonzales" }
];

let importedData = [];
let hasErrors = false;

document.addEventListener('DOMContentLoaded', () => {
    renderDB();

    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const btnSave = document.getElementById('btn-save');
    const btnReset = document.getElementById('btn-reset');

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
});

function handleFile(file) {
    const reader = new FileReader();

    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Assume first sheet
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Header: 1 gives array of arrays

        processData(jsonData);
    };

    reader.readAsArrayBuffer(file);
}

function processData(rows) {
    if (rows.length < 2) return; // Empty or just header

    // Detect columns (Naïve approach: look for 'rut' and 'nombre' in first row)
    const headers = rows[0].map(h => String(h).toLowerCase());
    const rutIndex = headers.findIndex(h => h.includes('rut'));
    const nameIndex = headers.findIndex(h => h.includes('nombre') || h.includes('name'));

    if (rutIndex === -1 || nameIndex === -1) {
        alert("El archivo debe tener columnas 'RUT' y 'Nombre'");
        return;
    }

    importedData = [];
    hasErrors = false;

    // Iterate data rows
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row[rutIndex]) continue; // Skip empty rows

        const rawRut = String(row[rutIndex]);
        const rawName = String(row[nameIndex] || "");

        const rutValidation = validateRut(rawRut);
        const formattedName = formatName(rawName);

        if (!rutValidation.isValid) hasErrors = true;

        importedData.push({
            originalRut: rawRut,
            cleanRut: rutValidation.cleanRut,
            isValid: rutValidation.isValid,
            originalName: rawName,
            formattedName: formattedName,
            status: rutValidation.isValid ? 'OK' : 'Invalido'
        });
    }

    renderPreview();
}

/**
 * Valida el RUT usando el algoritmo Módulo 11 (Chileno).
 * Explicación:
 * 1. Se limpia el RUT dejando solo números y K.
 * 2. Se separa el cuerpo del Dígito Verificador (DV).
 * 3. Se invierte el cuerpo y se multiplica cada dígito por una serie (2, 3, 4, 5, 6, 7).
 * 4. Se suman los resultados y se obtiene el resto de la división por 11.
 * 5. Se calcula 11 - resto para obtener el DV esperado.
 */
function validateRut(rut) {
    // 1. Limpieza: Eliminar puntos y guiones.
    // Dejar solo números y 'k' o 'K'.
    let clean = rut.replace(/[^0-9kK]/g, '');

    if (clean.length < 2) return { isValid: false, cleanRut: clean };

    // 2. Separar cuerpo y dígito verificador
    const body = clean.slice(0, -1);
    const dv = clean.slice(-1).toUpperCase();

    // Validar que el cuerpo sean solo números
    if (!/^\d+$/.test(body)) return { isValid: false, cleanRut: clean };

    // 3. Calcular Dígito Verificador (Módulo 11)
    let suma = 0;
    let multiplicador = 2;

    // Recorrer el cuerpo de derecha a izquierda
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

    // 4. Formatear para visualización (XX.XXX.XXX-Y)
    const formatted = formatRutDots(body, dv);

    return {
        isValid: dv === dvCalculado,
        cleanRut: formatted
    };
}

function formatRutDots(body, dv) {
    // Agrega puntos y guión
    return body.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "-" + dv;
}

function formatName(name) {
    // Title Case y Trim
    if (!name) return "";
    return name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ') // Eliminar espacios dobles
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

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

        // Visual hint for deduplication
        const existing = mockDB.find(dbItem => dbItem.rut === item.cleanRut);
        let actionText = "Nuevo";
        if (existing) actionText = "Existe (Actualizar?)";
        if (!item.isValid) actionText = "Corregir RUT";

        tr.innerHTML = `
            <td class="${item.isValid ? 'status-ok' : 'status-error'}">${item.status}</td>
            <td>${item.originalRut}</td>
            <td>${item.cleanRut}</td>
            <td>${item.originalName}</td>
            <td>${item.formattedName}</td>
            <td>${actionText}</td>
        `;
        tableBody.appendChild(tr);
    });

    const btnSave = document.getElementById('btn-save');
    btnSave.disabled = hasErrors;
}

function saveToDatabase() {
    let newCount = 0;
    let updatedCount = 0;

    // Process each valid item
    for (const item of importedData) {
        if (!item.isValid) continue;

        // Lógica de Deduplicación: Buscar por RUT, no por Nombre
        const existingIndex = mockDB.findIndex(db => db.rut === item.cleanRut);

        if (existingIndex !== -1) {
            const existingRecord = mockDB[existingIndex];

            // Si existe, verificamos si el nombre es diferente
            if (existingRecord.nombre !== item.formattedName) {
                // Conflicto encontrado: Preguntar al usuario
                const userWantsUpdate = confirm(
                    `El RUT ${item.cleanRut} ya existe.\n` +
                    `Nombre actual: ${existingRecord.nombre}\n` +
                    `Nuevo nombre: ${item.formattedName}\n\n` +
                    `¿Desea actualizar el nombre?`
                );

                if (userWantsUpdate) {
                    mockDB[existingIndex].nombre = item.formattedName;
                    updatedCount++;
                }
            }
        } else {
            // Si no existe, lo creamos
            mockDB.push({
                rut: item.cleanRut,
                nombre: item.formattedName
            });
            newCount++;
        }
    }

    alert(`Proceso finalizado.\nNuevos: ${newCount}\nActualizados: ${updatedCount}`);
    renderDB();
    resetUI();
}

function renderDB() {
    document.getElementById('db-view').textContent = JSON.stringify(mockDB, null, 2);
}

function resetUI() {
    importedData = [];
    document.getElementById('file-input').value = '';
    document.querySelector('#preview-table tbody').innerHTML = '';
    document.getElementById('preview-section').classList.add('hidden');
    document.getElementById('drop-zone').classList.remove('hidden');
}
