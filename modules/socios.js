// ========================================
// SOCIOS MODULE
// Complete partner management with Excel import
// ========================================

export default class SociosModule {
    constructor(app) {
        this.app = app;
        this.importedData = [];
        this.hasErrors = false;
    }

    async render(container) {
        const mockDB = this.app.getState('mockDB') || [];

        container.innerHTML = `
      <div class="socios-module">
        <div class="module-header">
          <h1 class="page-title">👥 Gestión de Socios</h1>
          <div class="header-actions">
            <button class="btn btn-secondary" id="btn-import-excel">📥 Importar Excel</button>
            <button class="btn btn-primary" id="btn-add-socio">+ Nuevo Socio</button>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-icon" style="background: var(--gradient-primary);">👥</div>
            <div class="stat-content">
              <p class="stat-value">${mockDB.length}</p>
              <p class="stat-label">Total Socios</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: var(--gradient-success);">✅</div>
            <div class="stat-content">
              <p class="stat-value">${mockDB.length}</p>
              <p class="stat-label">Activos</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: var(--gradient-warning);">⚠️</div>
            <div class="stat-content">
              <p class="stat-value">0</p>
              <p class="stat-label">Morosos</p>
            </div>
          </div>
        </div>

        <!-- Search and Filters -->
        <div class="card">
          <div class="card-body">
            <div class="search-bar">
              <input type="text" 
                     id="search-socios" 
                     placeholder="🔍 Buscar por RUT o nombre..." 
                     class="search-input">
            </div>
          </div>
        </div>

        <!-- Socios Table -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Lista de Socios</h3>
            <div class="table-actions">
              <button class="btn btn-sm btn-secondary" id="btn-export-excel">📊 Exportar Excel</button>
            </div>
          </div>
          <div class="card-body">
            <div class="table-wrapper" id="socios-table-container">
              ${this.renderTable(mockDB)}
            </div>
          </div>
        </div>
      </div>
    `;

        this.attachEventListeners();
    }

    renderTable(socios) {
        if (socios.length === 0) {
            return '<p class="empty-state">No hay socios registrados. Importa un archivo Excel o agrega manualmente.</p>';
        }

        return `
      <table class="data-table">
        <thead>
          <tr>
            <th>RUT</th>
            <th>Nombre</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${socios.map(socio => `
            <tr>
              <td>${socio.rut}</td>
              <td>${socio.nombre}</td>
              <td><span class="badge badge-success">Activo</span></td>
              <td>
                <button class="table-action-btn edit" data-rut="${socio.rut}">✏️</button>
                <button class="table-action-btn delete" data-rut="${socio.rut}">🗑️</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    }

    attachEventListeners() {
        // Import Excel
        document.getElementById('btn-import-excel')?.addEventListener('click', () => {
            this.showExcelImportModal();
        });

        // Add Socio
        document.getElementById('btn-add-socio')?.addEventListener('click', () => {
            this.showAddSocioModal();
        });

        // Search
        document.getElementById('search-socios')?.addEventListener('input', (e) => {
            this.filterSocios(e.target.value);
        });

        // Export Excel
        document.getElementById('btn-export-excel')?.addEventListener('click', () => {
            this.exportToExcel();
        });

        // Table Actions
        document.querySelectorAll('.table-action-btn.edit').forEach(btn => {
            btn.addEventListener('click', () => {
                const rut = btn.dataset.rut;
                this.editSocio(rut);
            });
        });

        document.querySelectorAll('.table-action-btn.delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const rut = btn.dataset.rut;
                this.deleteSocio(rut);
            });
        });
    }

    showExcelImportModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h2>Importar desde Excel</h2>
          <button class="modal-close" id="close-import-modal">×</button>
        </div>
        <div class="modal-body">
          <div class="upload-zone" id="upload-zone">
            <div class="upload-icon">📄</div>
            <p>Arrastra tu archivo Excel (.xlsx) aquí</p>
            <p class="upload-hint">o haz clic para seleccionar</p>
            <input type="file" id="excel-file-input" accept=".xlsx" hidden>
          </div>
          <div class="import-instructions">
            <h4>Instrucciones:</h4>
            <ul>
              <li>El archivo debe tener columnas "RUT" y "Nombre"</li>
              <li>Los RUTs deben ser válidos (dígito verificador correcto)</li>
              <li>Se detectarán y reportarán duplicados automáticamente</li>
            </ul>
            <button class="btn btn-secondary btn-sm" id="btn-download-template">
              📋 Descargar Plantilla
            </button>
          </div>
        </div>
      </div>
    `;

        document.body.appendChild(modal);

        // Event Listeners
        modal.querySelector('#close-import-modal').addEventListener('click', () => {
            modal.remove();
        });

        const uploadZone = modal.querySelector('#upload-zone');
        const fileInput = modal.querySelector('#excel-file-input');

        uploadZone.addEventListener('click', () => fileInput.click());

        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });

        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
                this.handleExcelFile(e.dataTransfer.files[0], modal);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                this.handleExcelFile(e.target.files[0], modal);
            }
        });

        modal.querySelector('#btn-download-template').addEventListener('click', () => {
            this.downloadTemplate();
        });
    }

    handleExcelFile(file, modal) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            // Process data using existing logic from script.js
            this.processExcelData(jsonData, modal);
        };
        reader.readAsArrayBuffer(file);
    }

    processExcelData(rows, modal) {
        if (rows.length < 2) {
            alert('El archivo está vacío');
            return;
        }

        const headers = rows[0].map(h => String(h).toLowerCase());
        const rutIndex = headers.findIndex(h => h.includes('rut'));
        const nameIndex = headers.findIndex(h => h.includes('nombre'));

        if (rutIndex === -1 || nameIndex === -1) {
            alert('El archivo debe tener columnas "RUT" y "Nombre"');
            return;
        }

        this.importedData = [];
        this.hasErrors = false;
        const seenRuts = new Map();

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row[rutIndex]) continue;

            const rawRut = String(row[rutIndex]);
            const raw Name = String(row[nameIndex] || '');
            const rutValidation = this.validateRut(rawRut);
            const formattedName = this.formatName(rawName);

            if (!rutValidation.isValid) {
                this.hasErrors = true;
                this.importedData.push({
                    rut: rawRut,
                    nombre: rawName,
                    valid: false,
                    error: 'RUT inválido'
                });
            } else {
                const cleanRut = rutValidation.cleanRut;
                const isDuplicate = seenRuts.has(cleanRut);

                if (!isDuplicate) {
                    seenRuts.set(cleanRut, true);
                }

                this.importedData.push({
                    rut: cleanRut,
                    nombre: formattedName,
                    valid: true,
                    isDuplicate
                });
            }
        }

        // Show preview modal
        this.showImportPreview(modal);
    }

    showImportPreview(parentModal) {
        parentModal.remove();

        const validData = this.importedData.filter(d => d.valid && !d.isDuplicate);
        const errors = this.importedData.filter(d => !d.valid);
        const duplicates = this.importedData.filter(d => d.isDuplicate);

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
      <div class="modal modal-lg">
        <div class="modal-header">
          <h2>Previsualización de Importación</h2>
          <button class="modal-close" id="close-preview">×</button>
        </div>
        <div class="modal-body">
          <div class="import-stats">
            <div class="import-stat valid">
              <p class="stat-value">${validData.length}</p>
              <p class="stat-label">Válidos</p>
            </div>
            <div class="import-stat error">
              <p class="stat-value">${errors.length}</p>
              <p class="stat-label">Errores</p>
            </div>
            <div class="import-stat duplicate">
              <p class="stat-value">${duplicates.length}</p>
              <p class="stat-label">Duplicados</p>
            </div>
          </div>
          
          ${errors.length > 0 ? `
            <div class="alert alert-warning">
              ⚠️ Hay ${errors.length} registros con errores que no se importarán
            </div>
          ` : ''}
          
          <div class="preview-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Estado</th>
                  <th>RUT</th>
                  <th>Nombre</th>
                </tr>
              </thead>
              <tbody>
                ${this.importedData.slice(0, 50).map(item => `
                  <tr class="${!item.valid ? 'row-error' : item.isDuplicate ? 'row-warning' : ''}">
                    <td>
                      ${item.valid
                ? (item.isDuplicate ? '<span class="badge badge-warning">Duplicado</span>' : '<span class="badge badge-success">OK</span>')
                : '<span class="badge badge-error">Error</span>'}
                    </td>
                    <td>${item.rut}</td>
                    <td>${item.nombre}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            ${this.importedData.length > 50 ? `<p class="text-muted">Mostrando 50 de ${this.importedData.length} registros</p>` : ''}
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="cancel-import">Cancelar</button>
          <button class="btn btn-primary" id="confirm-import" ${this.hasErrors ? 'disabled' : ''}>
            Importar ${validData.length} Socios
          </button>
        </div>
      </div>
    `;

        document.body.appendChild(modal);

        modal.querySelector('#close-preview').addEventListener('click', () => modal.remove());
        modal.querySelector('#cancel-import').addEventListener('click', () => modal.remove());
        modal.querySelector('#confirm-import')?.addEventListener('click', () => {
            this.confirmImport();
            modal.remove();
        });
    }

    confirmImport() {
        const validData = this.importedData.filter(d => d.valid && !d.isDuplicate);
        const mockDB = this.app.getState('mockDB') || [];

        validData.forEach(item => {
            mockDB.push({ rut: item.rut, nombre: item.nombre });
        });

        this.app.setState('mockDB', mockDB);
        localStorage.setItem('mockDB', JSON.stringify(mockDB));

        alert(`✅ ${validData.length} socios importados exitosamente`);

        // Refresh view
        this.render(document.getElementById('content-area'));
    }

    showAddSocioModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h2>Nuevo Socio</h2>
          <button class="modal-close" id="close-add-modal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>RUT</label>
            <input type="text" id="input-rut" placeholder="12.345.678-5" class="form-input">
            <small class="form-hint">Formato: 12.345.678-5</small>
          </div>
          <div class="form-group">
            <label>Nombre Completo</label>
            <input type="text" id="input-nombre" placeholder="Juan Pérez" class="form-input">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="cancel-add">Cancelar</button>
          <button class="btn btn-primary" id="save-socio">Guardar</button>
        </div>
      </div>
    `;

        document.body.appendChild(modal);

        modal.querySelector('#close-add-modal').addEventListener('click', () => modal.remove());
        modal.querySelector('#cancel-add').addEventListener('click', () => modal.remove());
        modal.querySelector('#save-socio').addEventListener('click', () => {
            const rut = modal.querySelector('#input-rut').value;
            const nombre = modal.querySelector('#input-nombre').value;

            const validation = this.validateRut(rut);
            if (!validation.isValid) {
                alert('RUT inválido');
                return;
            }

            const mockDB = this.app.getState('mockDB') || [];
            mockDB.push({ rut: validation.cleanRut, nombre: this.formatName(nombre) });
            this.app.setState('mockDB', mockDB);
            localStorage.setItem('mockDB', JSON.stringify(mockDB));

            modal.remove();
            this.render(document.getElementById('content-area'));
        });
    }

    editSocio(rut) {
        const mockDB = this.app.getState('mockDB') || [];
        const socio = mockDB.find(s => s.rut === rut);
        if (!socio) return;

        const newName = prompt(`Editar nombre para ${rut}:`, socio.nombre);
        if (newName && newName.trim()) {
            socio.nombre = this.formatName(newName);
            this.app.setState('mockDB', mockDB);
            localStorage.setItem('mockDB', JSON.stringify(mockDB));
            this.render(document.getElementById('content-area'));
        }
    }

    deleteSocio(rut) {
        if (!confirm(`¿Eliminar socio con RUT ${rut}?`)) return;

        const mockDB = this.app.getState('mockDB') || [];
        const index = mockDB.findIndex(s => s.rut === rut);
        if (index !== -1) {
            mockDB.splice(index, 1);
            this.app.setState('mockDB', mockDB);
            localStorage.setItem('mockDB', JSON.stringify(mockDB));
            this.render(document.getElementById('content-area'));
        }
    }

    filterSocios(query) {
        const mockDB = this.app.getState('mockDB') || [];
        const filtered = query
            ? mockDB.filter(s =>
                s.rut.toLowerCase().includes(query.toLowerCase()) ||
                s.nombre.toLowerCase().includes(query.toLowerCase())
            )
            : mockDB;

        document.getElementById('socios-table-container').innerHTML = this.renderTable(filtered);
        this.attachEventListeners();
    }

    exportToExcel() {
        const mockDB = this.app.getState('mockDB') || [];
        const worksheet = XLSX.utils.json_to_sheet(mockDB.map(s => ({ RUT: s.rut, Nombre: s.nombre })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Socios');
        XLSX.writeFile(workbook, `socios_${new Date().toISOString().slice(0, 10)}.xlsx`);
    }

    downloadTemplate() {
        const data = [
            { RUT: '12.345.678-5', Nombre: 'Juan Pérez' },
            { RUT: '11.111.111-1', Nombre: 'María González' },
            { RUT: '9.876.543-2', Nombre: 'Pedro Soto' }
        ];
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla');
        XLSX.writeFile(workbook, 'plantilla_socios.xlsx');
    }

    // Helper functions (from script.js)
    validateRut(rut) {
        let clean = rut.replace(/[^0-9kK]/g, '');
        if (clean.length < 2) return { isValid: false, cleanRut: clean };

        const body = clean.slice(0, -1);
        const dv = clean.slice(-1).toUpperCase();
        if (!/^\d+$/.test(body)) return { isValid: false, cleanRut: clean };

        let suma = 0, multiplicador = 2;
        for (let i = body.length - 1; i >= 0; i--) {
            suma += parseInt(body.charAt(i)) * multiplicador;
            multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
        }

        const resto = 11 - (suma % 11);
        const dvCalculado = resto === 11 ? '0' : resto === 10 ? 'K' : resto.toString();
        const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + dv;

        return { isValid: dv === dvCalculado, cleanRut: formatted };
    }

    formatName(name) {
        if (!name) return '';
        return name.trim().toLowerCase().replace(/\s+/g, ' ').split(' ')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
}
