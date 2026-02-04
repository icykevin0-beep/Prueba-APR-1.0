# 💧 Lumina APR - Sistema de Gestión de Agua Potable Rural

**Progressive Web App (PWA)** moderna para la gestión integral de sistemas de Agua Potable Rural.

## ✨ Características

### 📊 Dashboard
- KPIs en tiempo real (socios, consumo, facturación)
- Gráficos interactivos con Chart.js
- Resumen de actividad reciente

### 👥 Gestión de Socios
- ✅ Importación masiva desde Excel
- ✅ Validación automática de RUT chileno (Módulo 11)
- ✅ CRUD completo (Crear, Editar, Eliminar)
- ✅ Búsqueda y filtros
- ✅ Exportación a Excel

### 📈 Lecturas de Medidores
- Registro de lecturas por período
- Historial de consumo
- Detección de consumos anormales

### 💰 Facturación
- Sistema de cobro por tramos configurables
- Seguimiento de pagos
- Reporte de morosidad
- Generación de boletas

### ⚙️ Configuración
- Tarifas personalizables por tramo
- Datos del APR
- Tema claro/oscuro automático
- Backup y restauración de datos

## 🚀 Instalación Local

### Opción 1: Servidor Simple (Recomendado)

```bash
# Con Node.js instalado
npx -y http-server -p8080

# Con Python
python -m http.server 8080
```

Abre `http://localhost:8080` en tu navegador.

### Opción 2: Extensión Live Server (VS Code)

1. Instala la extensión "Live Server"
2. Click derecho en `index.html` → "Open with Live Server"

## 📱 Instalar como PWA

### En Chrome Desktop:
1. Abre la aplicación en Chrome
2. Click en el ícono de instalación en la barra de direcciones
3. Confirma "Instalar"

### En Chrome Android:
1. Abre la aplicación en Chrome
2. Menú → "Add to Home Screen"
3. La app se instalará como aplicación nativa

### En Safari iOS:
1. Abre la aplicación en Safari
2. Toca el botón "Compartir"
3. "Add to Home Screen"

## 🎨 Tecnologías

- **Frontend**: HTML5, CSS3 (Design System moderno), JavaScript ES6+
- **PWA**: Service Worker, Web App Manifest
- **Gráficos**: Chart.js 4.4.0
- **Excel**: SheetJS (xlsx.full.min.js)
- **Backend**: FastAPI (Python) - Opcional

## 📂 Estructura del Proyecto

```
Apr software/
├── index.html          # Página principal
├── style.css           # Sistema de diseño completo
├── app.js              # Core: Tab Manager, Service Worker
├── script.js           # Utilidades (validación RUT, etc.)
├── manifest.json       # Configuración PWA
├── service-worker.js   # Offline support
├── icons/              # Íconos PWA (192px, 512px)
├── modules/            # Módulos de la aplicación
│   ├── dashboard.js
│   ├── socios.js
│   ├── lecturas.js
│   ├── facturacion.js
│   └── configuracion.js
└── backend/            # API FastAPI (opcional)
    ├── main.py
    ├── models.py
    ├── billing.py
    └── requirements.txt
```

## 🔧 Backend (Opcional)

Si quieres usar el backend para cálculos y base de datos real:

```bash
# Instalar dependencias
pip install -r backend/requirements.txt

# Ejecutar servidor
uvicorn backend.main:app --reload
```

API disponible en `http://localhost:8000/docs`

## 🌐 Deploy en Producción

### Frontend (Vercel - GRATIS)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Backend (Railway - Plan Gratuito)

1. Conecta tu repositorio a Railway.app
2. Selecciona el directorio `backend`
3. Railway detecta automáticamente FastAPI
4. Deploy automático

## 💾 Datos

- **Almacenamiento**: LocalStorage del navegador
- **Capacidad**: ~5-10MB
- **Respaldo**: Exportar/Importar JSON desde Configuración

## 🎯 Próximas Funcionalidades

- [ ] Autenticación con JWT
- [ ] Multi-tenant (múltiples APR)
- [ ] Sistema de pagos con Stripe
- [ ] Notificaciones push
- [ ] Sincronización con backend en tiempo real
- [ ] Generación de PDFs para boletas
- [ ] Envío automático de correos

## 📝 Licencia

Desarrollado para gestión de APR. Personalizable según necesidades.

---

**¿Necesitas ayuda?** Abre un issue o contacta al desarrollador.

💧 **Lumina APR** - Gestión inteligente de agua rural
