# Backend - Importador Masivo de Socios APR

Este es el backend "brutal" solicitado para la gestión de socios, lecturas y facturación de un sistema de Agua Potable Rural (APR).

## Características

*   **FastAPI**: Framework moderno y de alto rendimiento.
*   **SQLModel (SQLAlchemy)**: ORM robusto compatible con SQLite (por defecto) y PostgreSQL (fácil migración a Supabase).
*   **Validación de RUT**: Implementación estricta del algoritmo Módulo 11 (portado de la versión JS).
*   **Cálculo de Tarifas por Tramos**: Sistema flexible de cobro escalonado.
*   **Simulación SII**: Estructura lista para integrar facturación electrónica.

## Instalación y Ejecución

1.  **Requisitos**: Python 3.10+
2.  **Instalar dependencias**:
    ```bash
    pip install -r backend/requirements.txt
    ```
3.  **Ejecutar el servidor**:
    ```bash
    uvicorn backend.main:app --reload
    ```
    El servidor correrá en `http://127.0.0.1:8000`.

## Documentación API

Una vez corriendo, visita:
*   **Swagger UI**: `http://127.0.0.1:8000/docs` (Interfaz interactiva brutal)
*   **Redoc**: `http://127.0.0.1:8000/redoc`

## Estructura del Proyecto

*   `backend/main.py`: Punto de entrada de la API y rutas.
*   `backend/models.py`: Modelos de base de datos (Socio, Lectura, Boleta).
*   `backend/billing.py`: Lógica de negocio para cálculo de tarifas.
*   `backend/sii.py`: Servicio mock para integración con Impuestos Internos.
*   `backend/utils.py`: Herramientas de validación (RUT).
*   `backend/database.py`: Configuración de la conexión a DB.
