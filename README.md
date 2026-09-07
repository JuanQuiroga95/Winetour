# Terroir Mendoza · Winetour

Plataforma de turismo receptivo: home editorial, carrusel con pausa y controles, galerías ampliables, paquetes de 1–3 días, mapa Leaflet con nueve bodegas, cotizador y administración con editor de contenido y Kanban de solicitudes.

## Desarrollo

Requiere Node.js 20.9+ y npm. El lockfile fija las versiones instaladas.

```sh
npm ci --include=dev
cp .env.example .env.local
npm run dev
```

En Windows, usar `Copy-Item .env.example .env.local` si el archivo no existe. No sobrescribir la configuración privada existente. Abrir `http://localhost:3000`. El acceso administrativo está en `/admin`.

## Configuración privada

| Variable          | Uso                                                                                       |
| ----------------- | ----------------------------------------------------------------------------------------- |
| `DATABASE_URL`    | Connection string PostgreSQL de Neon con SSL.                                             |
| `ADMIN_USERNAME`  | Usuario de administración, inicialmente `dani.v`.                                         |
| `ADMIN_PASSWORD`  | Contraseña solicitada, configurada localmente fuera de Git. Configurar también en Vercel. |
| `SESSION_SECRET`  | Secreto aleatorio de 32 caracteres como mínimo para sesiones firmadas.                    |
| `WHATSAPP_NUMBER` | Número internacional solo con dígitos; también se puede editar en el panel.               |

Generar un secreto con `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. Nunca subir `.env.local` al repositorio. Cambiar `SESSION_SECRET` invalida las sesiones existentes. Las sesiones duran ocho horas, usan cookies HttpOnly y SameSite Strict, y HTTPS en producción. Las mutaciones administrativas exigen sesión y origen válido.

## Neon

Crear un proyecto Neon, colocar su connection string en `.env.local` y ejecutar:

```sh
npm run db:migrate
npm run db:seed
```

Se incluye la migración inicial de `regions`, `wineries`, `combos`, `quotes`, `quote_items` y `site_content`. Esta última conserva el contenido editable. El seed respeta los nueve registros y sus coordenadas solicitadas y no sobrescribe ediciones al repetirse. `npm run db:generate` genera migraciones futuras tras cambios de schema.

Sin Neon, la página y el cotizador funcionan con el catálogo inicial. El administrador permite preparar borradores locales y exportarlos, pero no publica cambios. La API responde 503 al intentar enviar una solicitud: no se simulan guardados ni se pierden leads silenciosamente.

## Administrador

- **Solicitudes:** todas las consultas, búsqueda, Kanban con arrastre o selector accesible, contacto y costos detallados. Estados: Pendiente, En Gestión, Confirmado, Cancelado.
- **Textos:** contenido de la landing, navegación y pie de página.
- **Imágenes:** carrusel principal, imagen de viaje a medida y galería; URLs HTTPS o IDs Unsplash. Las fotografías incluidas son de inspiración, no documentación de las bodegas.
- **Regiones:** nombres, descripciones e imágenes.
- **Bodegas:** altas, bajas del catálogo, coordenadas, experiencias, categorías y precios en USD. Las bodegas usadas por paquetes se deben retirar de esos paquetes antes de quitarlas.
- **Paquetes:** combinaciones, textos, fotos, duración y visitas por día.
- **Configuración:** dólar tomado por la agencia (ARS por 1 USD), costo de transfer, WhatsApp, política, colores y metadatos para buscadores.
- **Avanzado:** exportación e importación validada de todo el contenido en JSON.

Los cambios permanecen en un borrador del navegador hasta presionar **Publicar cambios**. Al publicar se guardan el contenido, bodegas, regiones y paquetes en un batch transaccional Neon. Los precios históricos se conservan en cada solicitud.

## Cotización

- Precios base en USD por persona. No se cobra ni se confirma una reserva en el sitio.
- Transfer inicial: USD 120 por día por cada grupo de hasta cuatro pasajeros, editable en el panel.
- Total USD = suma de experiencias × pasajeros + transfer.
- Equivalente ARS = total USD × dólar de referencia de la agencia, redondeado a dos decimales. No se consulta una cotización bancaria automática.
- Un valor de dólar de `0` significa “a confirmar”: no se muestra un equivalente ficticio en ARS.
- Cada solicitud guarda precios unitarios, total USD, tipo de cambio, total ARS y texto de política aceptado. Editar la cotización del dólar no modifica solicitudes anteriores.
- Fecha mínima: siete días según el calendario de Mendoza. Entre 1 y 3 días, 1–12 personas y 1–3 visitas por día. Mezclar regiones genera una advertencia de logística.
- El servidor vuelve a validar y calcular los importes desde el catálogo. La cabecera de la solicitud y las visitas se insertan atómicamente.
- WhatsApp se abre solamente después del guardado. Si el navegador bloquea la ventana, se ofrece un enlace en la confirmación. Sin un número configurado, la solicitud se guarda y se informa que el equipo contactará al viajero.

## Validación

```sh
npm run lint
npm run test
npm run build
npx playwright test
```

`lint` realiza el chequeo estricto TypeScript. Las pruebas unitarias cubren fechas, límites diarios, costos y validación del CMS. Las pruebas de navegador cubren la página, controles del carrusel, lightbox, vista móvil, cotizador, sesión y borrador administrativo. Estas pruebas de navegador están pensadas para desarrollo **sin DATABASE_URL** y requieren Chrome instalado; no deben ejecutarse contra producción. Las operaciones reales en Neon requieren una base de prueba configurada para validación de integración.

## Vercel

1. Importar `JuanQuiroga95/Winetour` como proyecto Next.js, directorio raíz `.`.
2. Agregar las variables privadas a los entornos correspondientes.
3. Ejecutar migración y seed sobre la base elegida antes de recibir solicitudes.
4. Desplegar con `npm run build`. No ejecutar migraciones ni seed en cada build.
5. Ingresar a `/admin`, configurar WhatsApp y el dólar de la agencia, y publicar cambios.

Las fotos iniciales están incluidas en `public/images`. Las nuevas URLs externas, fuentes de Google y mosaicos CARTO/OpenStreetMap requieren conexión a Internet. La lista de bodegas permanece utilizable si los mosaicos no cargan. Antes de operar, reemplazar las fotografías de inspiración por material propio y ajustar las inclusiones y tarifas de referencia.

Documentación técnica: [Next.js App Router](https://nextjs.org/docs/app), [Drizzle con Neon](https://orm.drizzle.team/docs/connect-neon), [batch transaccional](https://orm.drizzle.team/docs/batch-api).
