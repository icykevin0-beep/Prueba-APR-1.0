// ========================================
// FACTURACION MODULE
// Billing and payment tracking
// ========================================

export default class FacturacionModule {
    constructor(app) {
        this.app = app;
    }

    async render(container) {
        const mockDB = this.app.getState('mockDB') || [];
        const mockBoletas = this.generateMockBoletas(mockDB);

        container.innerHTML = `
      <div class="facturacion-module">
        <div class="module-header">
          <h1 class="page-title">💰 Facturación y Pagos</h1>
          <div class="header-actions">
            <button class="btn btn-secondary" id="btn-export-report">📊 Exportar Reporte</button>
            <button class="btn btn-primary" id="btn-generar-boletas">+ Generar Boletas</button>
          </div>
        </div>

        <!-- Stats -->
        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-icon" style="background: var(--gradient-success);">💵</div>
            <div class="stat-content">
              <p class="stat-value">$${(mockDB.length * 15000).toLocaleString('es-CL')}</p>
              <p class="stat-label">Facturado este Mes</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: var(--gradient-primary);">✅</div>
            <div class="stat-content">
              <p class="stat-value">$${Math.floor(mockDB.length * 15000 * 0.85).toLocaleString('es-CL')}</p>
              <p class="stat-label">Cobrado</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: var(--gradient-warning);">⏳</div>
            <div class="stat-content">
              <p class="stat-value">$${Math.floor(mockDB.length * 15000 * 0.15).toLocaleString('es-CL')}</p>
              <p class="stat-label">Por Cobrar</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);">⚠️</div>
            <div class="stat-content">
              <p class="stat-value">${Math.floor(mockDB.length * 0.1)}</p>
              <p class="stat-label">Morosos</p>
            </div>
          </div>
        </div>

        <!-- Payment Status Filter -->
        <div class="card">
          <div class="card-body">
            <div class="filter-bar">
              <label>Estado de Pago:</label>
              <select id="filter-estado" class="form-select">
                <option value="all">Todos</option>
                <option value="pagado">Pagado</option>
                <option value="pendiente">Pendiente</option>
                <option value="moroso">Moroso</option>
              </select>
              
              <label>Mes:</label>
              <select id="filter-mes" class="form-select">
                <option>Febrero 2026</option>
                <option>Enero 2026</option>
                <option>Diciembre 2025</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Boletas Table -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Boletas Generadas</h3>
          </div>
          <div class="card-body">
            <table class="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>RUT</th>
                  <th>Nombre</th>
                  <th>Consumo</th>
                  <th>Monto</th>
                  <th>Estado Pago</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${mockBoletas.map((boleta, idx) => `
                  <tr>
                    <td>${idx + 1}</td>
                    <td>${boleta.rut}</td>
                    <td>${boleta.nombre}</td>
                    <td>${boleta.consumo} m³</td>
                    <td class="amount">$${boleta.monto.toLocaleString('es-CL')}</td>
                    <td>
                      <span class="badge badge-${boleta.estado === 'Pagado' ? 'success' : boleta.estado === 'Pendiente' ? 'warning' : 'error'}">
                        ${boleta.estado}
                      </span>
                    </td>
                    <td>
                      <button class="table-action-btn" title="Ver Detalle" onclick="alert('Detalle de boleta')">👁️</button>
                      <button class="table-action-btn" title="Marcar como Pagado" onclick="alert('Marcar como pagado')">✅</button>
                      <button class="table-action-btn" title="Descargar PDF" onclick="alert('Descargando PDF...')">📄</button>
                    </td>
                  </tr>
                `).join('')}
                ${mockBoletas.length === 0 ? '<tr><td colspan="7" class="empty-state">No hay boletas generadas</td></tr>' : ''}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Detalles por Tramos -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Configuración de Tarifas</h3>
          </div>
          <div class="card-body">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Tramo</th>
                  <th>Desde</th>
                  <th>Hasta</th>
                  <th>Tarifa</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Tramo 1</td>
                  <td>0 m³</td>
                  <td>10 m³</td>
                  <td>$1.000 por m³</td>
                </tr>
                <tr>
                  <td>Tramo 2</td>
                  <td>11 m³</td>
                  <td>20 m³</td>
                  <td>$1.500 por m³</td>
                </tr>
                <tr>
                  <td>Tramo 3</td>
                  <td>21 m³</td>
                  <td>30 m³</td>
                  <td>$2.000 por m³</td>
                </tr>
                <tr>
                  <td>Tramo 4</td>
                  <td>31+ m³</td>
                  <td>∞</td>
                  <td>$2.500 por m³</td>
                </tr>
              </tbody>
            </table>
            <button class="btn btn-sm btn-secondary mt-2" onclick="app.openTab('configuracion', 'Configuración')">
              Modificar Tarifas
            </button>
          </div>
        </div>
      </div>
    `;

        this.attachEventListeners();
    }

    generateMockBoletas(socios) {
        return socios.slice(0, 15).map((socio, idx) => {
            const consumo = Math.floor(Math.random() * 40) + 5;
            const monto = this.calcularMonto(consumo);
            const estados = ['Pagado', 'Pendiente', 'Moroso'];
            const estado = estados[Math.floor(Math.random() * 3)];

            return {
                rut: socio.rut,
                nombre: socio.nombre,
                consumo,
                monto,
                estado
            };
        });
    }

    calcularMonto(consumo) {
        let total = 0;
        if (consumo <= 10) {
            total = consumo * 1000;
        } else if (consumo <= 20) {
            total = 10 * 1000 + (consumo - 10) * 1500;
        } else if (consumo <= 30) {
            total = 10 * 1000 + 10 * 1500 + (consumo - 20) * 2000;
        } else {
            total = 10 * 1000 + 10 * 1500 + 10 * 2000 + (consumo - 30) * 2500;
        }
        return total;
    }

    attachEventListeners() {
        document.getElementById('btn-generar-boletas')?.addEventListener('click', () => {
            alert('🚧 Función en desarrollo\n\nPronto podrás:\n- Generar boletas automáticamente\n- Enviar por correo\n- Generar PDFs masivos');
        });

        document.getElementById('btn-export-report')?.addEventListener('click', () => {
            alert('🚧 Exportando reporte...\n\nPronto incluirá:\n- Resumen de cobros\n- Lista de morosos\n- Estadísticas detalladas');
        });
    }
}
