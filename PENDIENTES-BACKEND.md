# AKITÁ · Pendientes de backend (28/10/2026)

Actualizado con la revisión UX del 28/10. Anteriores: ajustes RF y respuesta de backend del 27/10.

## 1. ¿Hay una API para el carrusel del Inicio?

**Sí, pero solo de imágenes.** Es `GET /v1/banners/public?section=…`. Las secciones las administra el BackOffice.

| Sección | Para qué | En `api-dev.akita.pe` (28/10) |
|---|---|---|
| `LANDING_MAIN` | Carrusel del Inicio sin sesión | **200**, con 1 imagen activa (web y móvil, en CloudFront). |
| `LANDING_MAIN_LOGGED` | Carrusel del Inicio con sesión | **200**, con 1 imagen activa. |
| `LANDING_PRIZES` | Página Premios | 200, sin imágenes. |
| `LANDING_WINNERS` | Página Ganadores | 404 (sin banner). |
| `POPUP_INITIAL` | Aviso al entrar | 404 (sin banner). |

**Qué devuelve cada imagen:** `desktopUrl`, `mobileUrl`, `linkUrl`, `isExternal` y `position`, más `autoAdvance` e `intervalSeconds` por sección. Es una **imagen completa**, con el texto ya dentro.

**Por qué hoy no alimenta el carrusel del diseño:** los slides del RF tienen piezas que la web arma por separado, y la regla de imágenes del 28/10 pide «sin texto dentro de la imagen». Cada slide lleva:
- etiqueta;
- título de 2 líneas;
- texto de apoyo y su versión corta;
- precio o dato destacado;
- botón con su destino;
- imagen recortada y color de fondo;
- en el premio del mes, la fecha del sorteo y el cierre.

**Opciones:**
1. **Que backend agregue campos al banner:** `etiqueta`, `titulo`, `bajada`, `bajadaCorta`, `dato`, `cta`, `colorFondo` y la imagen recortada. Así el BackOffice administra los 3 slides con el diseño actual.
2. **Mostrar las imágenes de `LANDING_MAIN` como slides extra** (imagen completa con enlace), como ya se hace en Sorteos y Beneficios. Es rápido, pero esas imágenes traen el texto dentro, contra la regla del 28/10.

Hoy el sitio usa los 3 slides del diseño, con el premio del mes y su fecha calculados. El slide del premio del mes toma el nombre y la foto del sorteo destacado.

---

## 2. Pendiente de backend

| # | Pendiente | Para qué |
|---|---|---|
| 1 | **CORS en `api-dev.akita.pe`** | El navegador no puede llamar a la API publicada. Mientras tanto, el front sigue con el mock de Cloud Run. |
| 2 | **Planes de Akitá en `api-dev`** | `GET /v1/subscription-plans` responde listas vacías. Sin el `planId` no se puede pagar. |
| 3 | **Campos estructurados en `LANDING_MAIN` / `LANDING_MAIN_LOGGED`** | Administrar el carrusel del Inicio desde el BackOffice (sección 1). |
| 4 | **Marca de premio grande del mes** | Cómo se marca en el gestor (pregunta del LEEME del 28/10). Hoy se usa el sorteo destacado y la fecha del último miércoles del mes. |
| 5 | **Fecha y `cutOffTime` por sorteo** | «Activa tu plan antes del…» y el estado cerrado. |
| 6 | **`GET /v1/subscriptions/me`** con periodo, método (tarjeta o Yape), `autoRenew` y fecha de vigencia | «Se renueva el» o «Activo hasta» en Mi cuenta. Hoy se deduce de `GET /v1/users`: `isConcurrent`, `renewDate`/`endDate` y `paymentGateway`. |
| 7 | **Fecha real de vigencia al pagar** | Texto de la renovación en el pago, en la confirmación y en el éxito. Hoy se calcula desde la fecha de pago. |
| 8 | **Tipo y cantidad de cada promoción** en `POST /v1/promo-codes/validate` | Hoy los códigos dan **chances**. Se necesita `tipo` (chances o descuento) y la cantidad. El front ya lee `bonusChances` y `message`. |
| 9 | **Vista previa pública de Cofre y Flash** (stock por opción, «elegir hasta» y «usar hasta») | Tarjetas sin plan. Hoy usan datos de ejemplo. |
| 10 | **Estado «plan vencido»** | «Reactiva tu plan». Hoy se deduce. |
| 11 | **Estado de la transacción** | Pago pendiente antes de reintentar. |
| 12 | **Kushki de staging y producción** | Merchant id (Kushki / DevOps). |
| 13 | **Límite por IP del Libro de Reclamaciones** | Tomar la IP de la conexión, sin `x-client-ip`. |

**Negocio y Legal:**
- Renato debe validar los textos nuevos: slides, código promocional y rechazo.
- Recompensa del referido frente a la HU07.
- Consentimientos que mencionan a Mall360.
- Ofertas para subir de plan y `renewableUntil`.
- Banner de `BENEFITS_MAIN`.

**Marketing:**
- Las medidas para reemplazar las imágenes están en `AKITA-R1-medidas-imagenes.pdf`.
- Se reemplazan con el mismo nombre de archivo en `public/img/` (y las ovejas de pestaña en `public/assets/`).

**Para el R2:** al terminar de pagar, el header debe pasar al de suscriptor, sin «Suscríbete» ni el menú de visitante.
