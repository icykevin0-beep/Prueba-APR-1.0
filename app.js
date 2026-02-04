// ========================================
// LUMINA APR - CORE APPLICATION
// Tab Manager + Module Router + State
// ========================================

class LuminaApp {
    constructor() {
        this.tabs = [];
        this.activeTabId = null;
        this.modules = {};
        this.state = {
            currentAPR: null,
            user: null,
            mockDB: [],
            theme: 'light'
        };

        this.init();
    }

    init() {
        this.loadStateFromStorage();
        this.registerServiceWorker();
        this.setupEventListeners();
        this.loadTheme();

        // Open dashboard by default
        this.openTab('dashboard', 'Dashboard');
    }

    // ========================================
    // SERVICE WORKER REGISTRATION
    // ========================================
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/service-worker.js');
                console.log('[Lumina] Service Worker registered:', registration.scope);

                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New version available
                            this.showUpdateNotification();
                        }
                    });
                });
            } catch (error) {
                console.error('[Lumina] Service Worker registration failed:', error);
            }
        }
    }

    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
      <p>Nueva versión disponible</p>
      <button onclick="window.location.reload()">Actualizar</button>
    `;
        document.body.appendChild(notification);
    }

    // ========================================
    // TAB MANAGEMENT
    // ========================================
    openTab(moduleId, title) {
        // Check if tab already exists
        const existingTab = this.tabs.find(t => t.moduleId === moduleId);
        if (existingTab) {
            this.switchTab(existingTab.id);
            return;
        }

        // Create new tab
        const tabId = `tab-${Date.now()}`;
        const tab = {
            id: tabId,
            moduleId: moduleId,
            title: title
        };

        this.tabs.push(tab);
        this.activeTabId = tabId;

        this.renderTabs();
        this.loadModule(moduleId);
    }

    closeTab(tabId) {
        const index = this.tabs.findIndex(t => t.id === tabId);
        if (index === -1) return;

        this.tabs.splice(index, 1);

        // If closing active tab, switch to another
        if (this.activeTabId === tabId) {
            if (this.tabs.length > 0) {
                const newActiveTab = this.tabs[Math.max(0, index - 1)];
                this.switchTab(newActiveTab.id);
            } else {
                this.activeTabId = null;
                this.clearContentArea();
            }
        }

        this.renderTabs();
    }

    switchTab(tabId) {
        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab) return;

        this.activeTabId = tabId;
        this.renderTabs();
        this.loadModule(tab.moduleId);
    }

    renderTabs() {
        const tabBar = document.getElementById('tab-bar');
        if (!tabBar) return;

        if (this.tabs.length === 0) {
            tabBar.innerHTML = '<div class="no-tabs">No hay pestañas abiertas</div>';
            return;
        }

        tabBar.innerHTML = this.tabs.map(tab => `
      <div class="tab ${tab.id === this.activeTabId ? 'active' : ''}" 
           data-tab-id="${tab.id}">
        <span class="tab-title">${tab.title}</span>
        <button class="tab-close" onclick="app.closeTab('${tab.id}')">×</button>
      </div>
    `).join('');

        // Add click listeners
        tabBar.querySelectorAll('.tab').forEach(tabEl => {
            tabEl.addEventListener('click', (e) => {
                if (!e.target.classList.contains('tab-close')) {
                    this.switchTab(tabEl.dataset.tabId);
                }
            });
        });
    }

    // ========================================
    // MODULE LOADING
    // ========================================
    async loadModule(moduleId) {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        // Show loading
        contentArea.innerHTML = '<div class="loading">Cargando módulo...</div>';

        try {
            // Check if module already loaded
            if (!this.modules[moduleId]) {
                // Dynamically import module
                const module = await import(`./modules/${moduleId}.js`);
                this.modules[moduleId] = new module.default(this);
            }

            // Render module
            const moduleInstance = this.modules[moduleId];
            contentArea.innerHTML = '';
            await moduleInstance.render(contentArea);
        } catch (error) {
            console.error(`[Lumina] Error loading module ${moduleId}:`, error);
            contentArea.innerHTML = `
        <div class="error-message">
          <h2>Error al cargar módulo</h2>
          <p>${error.message}</p>
        </div>
      `;
        }
    }

    clearContentArea() {
        const contentArea = document.getElementById('content-area');
        if (contentArea) {
            contentArea.innerHTML = '<div class="empty-state">Selecciona un módulo del menú lateral</div>';
        }
    }

    // ========================================
    // STATE MANAGEMENT
    // ========================================
    setState(key, value) {
        this.state[key] = value;
        this.saveStateToStorage();
    }

    getState(key) {
        return this.state[key];
    }

    saveStateToStorage() {
        localStorage.setItem('lumina-state', JSON.stringify(this.state));
    }

    loadStateFromStorage() {
        const stored = localStorage.getItem('lumina-state');
        if (stored) {
            try {
                this.state = { ...this.state, ...JSON.parse(stored) };
            } catch (e) {
                console.error('[Lumina] Error loading state:', e);
            }
        }

        // Load mockDB separately for backward compatibility
        const mockDB = localStorage.getItem('mockDB');
        if (mockDB) {
            try {
                this.state.mockDB = JSON.parse(mockDB);
            } catch (e) {
                console.error('[Lumina] Error loading mockDB:', e);
            }
        }
    }

    // ========================================
    // THEME MANAGEMENT
    // ========================================
    loadTheme() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedTheme = this.state.theme;

        if (savedTheme === 'dark' || (savedTheme === 'auto' && prefersDark)) {
            document.body.classList.add('dark-mode');
        }
    }

    toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        this.setState('theme', isDark ? 'dark' : 'light');
    }

    // ========================================
    // EVENT LISTENERS
    // ========================================
    setupEventListeners() {
        // Sidebar navigation
        document.querySelectorAll('[data-module]').forEach(menuItem => {
            menuItem.addEventListener('click', () => {
                const moduleId = menuItem.dataset.module;
                const title = menuItem.textContent.trim();
                this.openTab(moduleId, title);
            });
        });

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Hamburger menu for mobile
        const hamburger = document.getElementById('hamburger');
        const sidebar = document.querySelector('.sidebar');
        if (hamburger && sidebar) {
            hamburger.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
        }
    }
}

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new LuminaApp();
});
