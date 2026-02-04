// ========================================
// DASHBOARD MODULE
// ========================================

export default class DashboardModule {
    constructor(app) {
        this.app = app;
    }

    async render(container) {
        const mockDB = this.app.getState('mockDB') || [];

        // Calculate statistics
        const totalSocios = mockDB.length;
        const stats = this.calculateStats(mockDB);

        container.innerHTML = `
      <div class="dashboard">
        <h1 class="page-title">📊 Dashboard</h1>
        
        <!-- KPI Cards -->
        <div class="kpi-grid">
          <div class="kpi-card" style="background: var(--gradient-primary);">
            <div class="kpi-icon">👥</div>
            <div class="kpi-content">
              <h3 class="kpi-value">${totalSocios}</h3>
              <p class="kpi-label">Total Socios</p>
            </div>
          </div>
          
          <div class="kpi-card" style="background: var( --gradient-secondary);">
            <div class="kpi-icon">💧</div>
            <div class="kpi-content">
              <h3 class="kpi-value">${stats.avgConsumption} m³</h3>
              <p class="kpi-label">Consumo Promedio</p>
            </div>
          </div>
          
          <div class="kpi-card" style="background: var(--gradient-success);">
            <div class="kpi-icon">💰</div>
            <div class="kpi-content">
              <h3 class="kpi-value">$${stats.totalRevenue.toLocaleString('es-CL')}</h3>
              <p class="kpi-label">Facturación Mensual</p>
            </div>
          </div>
          
          <div class="kpi-card" style="background: var(--gradient-warning);">
            <div class="kpi-icon">⚠️</div>
            <div class="kpi-content">
              <h3 class="kpi-value">${stats.pendingPayments}</h3>
              <p class="kpi-label">Pagos Pendientes</p>
            </div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="charts-row">
          <div class="card chart-container">
            <div class="card-header">
              <h3 class="card-title">Consumo Mensual (m³)</h3>
            </div>
            <div class="card-body">
              <canvas id="consumption-chart"></canvas>
            </div>
          </div>
          
          <div class="card chart-container">
            <div class="card-header">
              <h3 class="card-title">Distribución por Tramos</h3>
            </div>
            <div class="card-body">
              <canvas id="tier-chart"></canvas>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Actividad Reciente</h3>
            <button class="btn btn-sm btn-secondary" onclick="app.openTab('socios', 'Socios')">
              Ver Todos
            </button>
          </div>
          <div class="card-body">
            ${this.renderRecentActivity(mockDB)}
          </div>
        </div>
      </div>
    `;

        // Initialize charts
        this.initCharts();
    }

    calculateStats(mockDB) {
        // Mock data - in real app, this would come from backend
        return {
            avgConsumption: mockDB.length > 0 ? Math.floor(Math.random() * 50) + 10 : 0,
            totalRevenue: mockDB.length * 15000,
            pendingPayments: Math.floor(mockDB.length * 0.15)
        };
    }

    renderRecentActivity(mockDB) {
        if (mockDB.length === 0) {
            return '<p class="text-muted">No hay actividad reciente</p>';
        }

        const recent = mockDB.slice(0, 5);
        return `
      <div class="activity-list">
        ${recent.map(socio => `
          <div class="activity-item">
            <div class="activity-icon">👤</div>
            <div class="activity-content">
              <p class="activity-title">${socio.nombre}</p>
              <p class="activity-subtitle">RUT: ${socio.rut}</p>
            </div>
            <div class="activity-time">Hoy</div>
          </div>
        `).join('')}
      </div>
    `;
    }

    initCharts() {
        // Consumption Chart
        const ctxConsumption = document.getElementById('consumption-chart');
        if (ctxConsumption) {
            new Chart(ctxConsumption, {
                type: 'line',
                data: {
                    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
                    datasets: [{
                        label: 'Consumo Total',
                        data: [1200, 1350, 1150, 1400, 1300, 1500, 1450, 1600, 1550, 1700, 1650, 1800],
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // Tier Distribution Chart
        const ctxTier = document.getElementById('tier-chart');
        if (ctxTier) {
            new Chart(ctxTier, {
                type: 'doughnut',
                data: {
                    labels: ['0-10 m³', '11-20 m³', '21-30 m³', '+30 m³'],
                    datasets: [{
                        data: [35, 40, 20, 5],
                        backgroundColor: [
                            '#2ecc71',
                            '#3498db',
                            '#f1c40f',
                            '#e74c3c'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
    }
}
