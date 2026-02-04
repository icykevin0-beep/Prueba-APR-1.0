// ========================================
// CONFIGURACION MODULE
// System settings and configuration
// ========================================

export default class ConfiguracionModule {
    constructor(app) {
        this.app = app;
    }

    async render(container) {
        container.innerHTML = `
      <div class="configuracion-module">
        <div class="module-header">
          <h1 class="page-title">⚙️ Configuración</h1>
        </div>

        <!-- APR Information -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Información del APR</h3>
            <button class="btn btn-sm btn-secondary" id="btn-edit-apr">✏️ Editar</button>
          </div>
          <div class="card-body">
            <div class="info-grid">
              <div class="info-item">
                <label>Nombre:</label>
                <p>APR Villa Los Aromos</p>
              </div>
              <div class="info-item">
                <label>RUT:</label>
                <p>76.000.000-1</p>
              </div>
              <div class="info-item">
                <label>Dirección:</label>
                <p>Camino Rural S/N, Región Metropolitana</p>
              </div>
              <div class="info-item">
                <label>Teléfono:</label>
                <p>+56 9 1234 5678</p>
              </div>
              <div class="info-item">
                <label>Email:</label>
                <p>contacto@apraromos.cl</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Tariff Configuration -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Tarifas por Tramo</h3>
            <button class="btn btn-sm btn-primary" id="btn-edit-tarifas">✏️ Modificar</button>
          </div>
          <div class="card-body">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Tramo</th>
                  <th>Desde (m³)</th>
                  <th>Hasta (m³)</th>
                  <th>Tarifa ($/m³)</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody id="tarifas-table">
                <tr>
                  <td>1</td>
                  <td>0</td>
                  <td>10</td>
                  <td>$1.000</td>
                  <td><button class="table-action-btn">✏️</button></td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>11</td>
                  <td>20</td>
                  <td>$1.500</td>
                  <td><button class="table-action-btn">✏️</button></td>
                </tr>
                <tr>
                  <td>3</td>
                  <td>21</td>
                  <td>30</td>
                  <td>$2.000</td>
                  <td><button class="table-action-btn">✏️</button></td>
                </tr>
                <tr>
                  <td>4</td>
                  <td>31</td>
                  <td>∞</td>
                  <td>$2.500</td>
                  <td><button class="table-action-btn">✏️</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- App Settings -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Preferencias de la Aplicación</h3>
          </div>
          <div class="card-body">
            <div class="settings-list">
              <div class="setting-item">
                <div class="setting-info">
                  <h4>Tema</h4>
                  <p>Cambia entre modo claro y oscuro</p>
                </div>
                <button class="btn btn-secondary btn-sm" id="btn-toggle-theme">
                  Cambiar Tema
                </button>
              </div>
              
              <div class="setting-item">
                <div class="setting-info">
                  <h4>Notificaciones</h4>
                  <p>Recibe alertas de lecturas pendientes</p>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" id="toggle-notifications">
                  <span class="toggle-slider"></span>
                </label>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <h4>Backup Automático</h4>
                  <p>Guarda automáticamente los datos localmente</p>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" id="toggle-backup" checked>
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Data Management -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Gestión de Datos</h3>
          </div>
          <div class="card-body">
            <div class="data-actions">
              <div class="data-action-item">
                <div>
                  <h4>Exportar Base de Datos</h4>
                  <p>Descarga todos los datos en formato JSON</p>
                </div>
                <button class="btn btn-secondary" id="btn-export-db">📥 Exportar</button>
              </div>
              
              <div class="data-action-item">
                <div>
                  <h4>Importar Base de Datos</h4>
                  <p>Restaura datos desde un archivo de respaldo</p>
                </div>
                <button class="btn btn-secondary" id="btn-import-db">📤 Importar</button>
                <input type="file" id="file-import-db" accept=".json" hidden>
              </div>
              
              <div class="data-action-item danger">
                <div>
                  <h4>Limpiar Datos</h4>
                  <p>Elimina todos los datos almacenados (irreversible)</p>
                </div>
                <button class="btn btn-danger" id="btn-clear-data">🗑️ Limpiar</button>
              </div>
            </div>
          </div>
        </div>

        <!-- About -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Acerca de Lumina APR</h3>
          </div>
          <div class="card-body">
            <div class="about-info">
              <p><strong>Versión:</strong> 1.0.0</p>
              <p><strong>Desarrollado por:</strong> Tu Empresa</p>
              <p><strong>Última actualización:</strong> Febrero 2026</p>
              <p class="mt-2">
                <a href="#" class="link">Términos y Condiciones</a> | 
                <a href="#" class="link">Política de Privacidad</a> | 
                <a href="#" class="link">Soporte</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    `;

        this.attachEventListeners();
    }

    attachEventListeners() {
        document.getElementById('btn-toggle-theme')?.addEventListener('click', () => {
            this.app.toggleTheme();
        });

        document.getElementById('btn-export-db')?.addEventListener('click', () => {
            this.exportDatabase();
        });

        document.getElementById('btn-import-db')?.addEventListener('click', () => {
            document.getElementById('file-import-db').click();
        });

        document.getElementById('file-import-db')?.addEventListener('change', (e) => {
            this.importDatabase(e.target.files[0]);
        });

        document.getElementById('btn-clear-data')?.addEventListener('click', () => {
            if (confirm('⚠️ ¿Estás seguro de eliminar TODOS los datos?\n\nEsta acción es IRREVERSIBLE.')) {
                if (confirm('Última confirmación: ¿Realmente deseas eliminar todo?')) {
                    localStorage.clear();
                    alert('✅ Datos eliminados. La página se recargará.');
                    window.location.reload();
                }
            }
        });

        document.getElementById('btn-edit-apr')?.addEventListener('click', () => {
            alert('🚧 Función en desarrollo\n\nPronto podrás editar la información del APR');
        });

        document.getElementById('btn-edit-tarifas')?.addEventListener('click', () => {
            alert('🚧 Función en desarrollo\n\nPronto podrás:\n- Modificar tarifas\n- Agregar nuevos tramos\n- Ver historial de cambios');
        });
    }

    exportDatabase() {
        const mockDB = this.app.getState('mockDB') || [];
        const data = {
            socios: mockDB,
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };

        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lumina_backup_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    importDatabase(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.socios && Array.isArray(data.socios)) {
                    if (confirm(`¿Importar ${data.socios.length} socios?\n\nEsto reemplazará los datos actuales.`)) {
                        this.app.setState('mockDB', data.socios);
                        localStorage.setItem('mockDB', JSON.stringify(data.socios));
                        alert('✅ Datos importados exitosamente');
                        this.render(document.getElementById('content-area'));
                    }
                } else {
                    alert('❌ Formato de archivo inválido');
                }
            } catch (error) {
                alert('❌ Error al leer el archivo: ' + error.message);
            }
        };
        reader.readAsText(file);
    }
}
