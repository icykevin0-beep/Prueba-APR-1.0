// ==========================================
// LECTURAS MODULE
// Meter readings and consumption tracking
// ========================================

export default class LecturasModule {
    constructor(app) {
        this.app = app;
    }

    async render(container) {
        const mockDB = this.app.getState('mockDB') || [];

        container.innerHTML = `
      <div class="lecturas-module">
        <div class="module-header">
          <h1 class="page-title">📈 Lecturas de Medidores</h1>
          <div class="header-actions">
            <button class="btn btn-secondary" id="btn-import-lecturas">📥 Importar Masivo</button>
            <button class="btn btn-primary" id="btn-nueva-lectura">+ Nueva Lectura</button>
          </div>
        </div>

        <!-- Period Selector -->
        <div class="card">
          <div class="card-body">
            <div class="period-selector">
              <label>Período:</label>
              <select id="select-periodo" class="form-select">
                <option>Febrero 2026</option>
                <option>Enero 2026</option>
                <option>Diciembre 2025</option>
              </select>
              <button class="btn btn-primary btn-sm" id="btn-procesar-periodo">
                Procesar Período
              </button>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-icon" style="background: var(--gradient-primary);">📊</div>
            <div class="stat-content">
              <p class="stat-value">${mockDB.length}</p>
              <p class="stat-label">Lecturas Pendientes</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: var(--gradient-success);">✅</div>
            <div class="stat-content">
              <p class="stat-value">0</p>
              <p class="stat-label">Completadas</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: var(--gradient-secondary);">💧</div>
            <div class="stat-content">
              <p class="stat-value">0 m³</p>
              <p class="stat-label">Consumo Total</p>
            </div>
          </div>
        </div>

        <!-- Lecturas Table -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Socios sin Lectura</h3>
          </div>
          <div class="card-body">
            <table class="data-table">
              <thead>
                <tr>
                  <th>RUT</th>
                  <th>Nombre</th>
                  <th>Última Lectura</th>
                  <th>Consumo Prom.</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${mockDB.slice(0, 10).map(socio => `
                  <tr>
                    <td>${socio.rut}</td>
                    <td>${socio.nombre}</td>
                    <td><span class="badge badge-warning">Sin lectura</span></td>
                    <td>-</td>
                    <td>
                      <button class="btn btn-sm btn-primary" onclick="alert('Función próximamente')">
                        📝 Registrar
                      </button>
                    </td>
                  </tr>
                `).join('')}
                ${mockDB.length === 0 ? '<tr><td colspan="5" class="empty-state">No hay socios registrados</td></tr>' : ''}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

        this.attachEventListeners();
    }

    attachEventListeners() {
        document.getElementById('btn-nueva-lectura')?.addEventListener('click', () => {
            alert('🚧 Función en desarrollo\n\nPronto podrás:\n- Registrar lecturas individuales\n- Ver historial de consumo\n- Detectar consumos anormales');
        });

        document.getElementById('btn-import-lecturas')?.addEventListener('click', () => {
            alert('🚧 Función en desarrollo\n\nPronto podrás importar lecturas masivas desde Excel');
        });

        document.getElementById('btn-procesar-periodo')?.addEventListener('click', () => {
            alert('🚧 Función en desarrollo\n\nPronto podrás procesar todo el período y generar boletas automáticamente');
        });
    }
}
