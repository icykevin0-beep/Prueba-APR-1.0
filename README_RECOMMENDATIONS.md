# Recomendaciones Técnicas y de Negocio (README 2.0)

Este documento detalla las consideraciones avanzadas para llevar este sistema a producción real, especialmente en lo referente a la integración con el SII y el modelo de cobros.

## 1. Integración Real con SII (Servicio de Impuestos Internos)

Para que el sistema emita boletas electrónicas válidas en Chile, no basta con generar un PDF. Se requiere un proceso criptográfico y de comunicación con los servidores del SII.

### Requisitos:
1.  **Certificado Digital (.p12)**: Debes adquirir un certificado digital a nombre del representante legal del APR.
2.  **CAF (Código de Autorización de Folios)**: El SII entrega archivos XML con rangos de folios autorizados. El sistema debe administrar estos folios.
3.  **Librería de Firma**: Recomiendo usar librerías específicas de facturación electrónica chilena en Python. Una opción popular y open source es `lxml` para manipular los XML y `signxml` (o implementaciones específicas como `libdte` en PHP, aunque en Python hay wrappers).

### Flujo Real:
1.  Generar el XML del DTE (Documento Tributario Electrónico).
2.  Firmar el XML con el Certificado Digital.
3.  Crear un "Sobre" (EnvíoDTE) y firmarlo.
4.  Enviar el Sobre al SII vía POST (Upload).
5.  Recibir el `TRACKID`.
6.  Consultar el estado del `TRACKID` hasta que sea "ACEPTADO".

**Recomendación**: Para no reinventar la rueda, considera usar una API intermedia de facturación (como LibreDTE, Haulmer, o SimpleBoleta) que exponga una API REST simple. Tu backend enviaría un JSON a ellos, y ellos se encargan de la criptografía y el XML SOAP del SII.

## 2. Fórmulas de Cálculo por Tramos (Tarifas)

El sistema actual implementa un cobro escalonado simple. Sin embargo, los APR suelen tener estructuras más complejas reguladas.

### Modelo Implementado (Billing.py):
```python
Total = Cargo_Fijo + (Consumo_Tramo_1 * Precio_1) + (Consumo_Tramo_2 * Precio_2) ...
```

### Recomendaciones para Tarifas Reales:
1.  **Subsidios**: Muchos usuarios de APR tienen subsidio estatal (el Estado paga una parte de los primeros 15m3). Deberías agregar un campo `porcentaje_subsidio` al modelo `Socio` y descontarlo del total antes de generar la boleta.
2.  **Sobreconsumo**: Definir claramente los tramos de sobreconsumo (generalmente sobre 40m3 en verano se castiga con tarifas más altas).
3.  **Alcantarillado**: Si el APR también gestiona alcantarillado, suele ser un % del consumo de agua potable o un cargo fijo adicional.

## 3. Base de Datos (Supabase vs Local)

Mencionaste **Supabase**. Es una elección excelente porque te da PostgreSQL + Auth + Realtime API "gratis".

### Migración a Supabase:
El código actual usa `SQLModel`, que es compatible con PostgreSQL. Para migrar:
1.  Crea un proyecto en Supabase.
2.  Obtén la `DB_CONNECTION_STRING` (postgresql://postgres:password@db.supabase.co:5432/postgres).
3.  Cambia la variable `sqlite_url` en `backend/database.py` por la string de conexión de Supabase (requiere instalar `psycopg2`).
4.  ¡Listo! El código funcionará igual, pero los datos estarán en la nube.

## 4. Seguridad
- Implementar autenticación (JWT) para que solo administradores puedan ingresar lecturas.
- Backups automáticos de la base de datos (Supabase lo hace solo).
