# AKITÁ · Pendientes de backend (29/10/2026)

Actualizado con los cambios para desarrollo del 29/10 (sección 0) y la revisión UX del 29/10. Debajo siguen los pendientes del 28/10.

## 0a. Paquete del 30/10: qué falta de backend

| # | Dato | Para qué |
|---|---|---|
| 1 | **ID de usuario** | El canje del premio del Cofre por WhatsApp pide el código y el ID de usuario. Hoy se muestra `publicId` (el mismo del código de referido): confirmar qué campo es. |
| 2 | **T&C del premio del Cofre como lista** (`terms[]` o un término por línea) | «Términos y condiciones del premio» en la elección, el resultado y la vista previa. |
| 3 | **Número oficial de WhatsApp y plazo del canje** (el miércoles siguiente a la apertura) | Instrucciones del premio. Hoy el número es de ejemplo. |

---

## 0. Cambios para desarrollo del 29/10: qué falta de backend

| # | Dato | Para qué |
|---|---|---|
| 1 | **`userChances` por sorteo en `GET /v1/raffles`** (plan + compradas + canjeadas + regalo) | «Tienes N chances» en Hoy, Sorteos y el detalle del premio. Si no llega, se muestran solo las del plan. |
| 2 | **URL de las bases (PDF) por premio** | «Ver bases completas del sorteo». Hoy se usa `termAndConditionsUrl` del sorteo. Es condición para la salida en premios a nombre del ganador (auto, crucero). |
| 3 | **`instructions` en el premio del Cofre, del Flash y del beneficio** | Recuadro «Cómo canjearlo» (p. ej. canje por WhatsApp). La apertura del Cofre ya trae `instructions`. Falta definir el plazo (72 h o hasta el miércoles). |
| 4 | **`status` del cupón en `GET /v1/coupons/me`** (disponible, usado o vencido) y **`deliveryMode`** con `CONTACT` | Pestañas de Mis Cupones y «Ver cupón». Hoy, «vencido» se deduce de `expiresAt`. |
| 5 | **Cupón ya generado en el detalle del beneficio** (`activation` con código, QR y fecha) | «Ver mi cupón» con el mismo cupón y la fecha en que se generó. |
| 6 | **Formato del código de referido** | El front valida «YK-» o «AK-» + 12 letras o números (`REFERIDO` en `src/data/reglas.ts`). Confirmar que `publicId` sigue ese formato y cuántas Lanas recibe el invitado (hoy +100, de ejemplo). |
| 7 | **Ganador en las participaciones pasadas** | «Ganó X. ¡El próximo puede ser tuyo!». Hoy solo se sabe si ganó el usuario (`isWinner`). |
| 8 | **Códigos de cada chance por sorteo** | «Ver mis códigos» en Mis participaciones. |
| 9 | **Preferencias de comunicación** (`GET` / `PATCH` en el usuario) | Interruptores de Mi perfil (correo, marcas aliadas y WhatsApp). |

---

## 1. Revisión UX del 29/10: qué falta de backend

| # | Dato | Para qué |
|---|---|---|
| 1 | **Beneficios: `pasos[]` y orden de los destacados** | Hoy ya llegan `isFeatured`, `description`, `startDate`/`endDate` y `coverage`. Faltan los pasos de uso propios del comercio (si no llegan, se arman según la modalidad) y el orden de «Destacados para ti». |
| 2 | **Modalidad de uso por beneficio:** `deliveryType`, `code`, `qrValue` o `qrImageUrl`, `url`, `validFrom` y `validTo` | Cupón con QR, enlace, DNI o «Te contactamos». Hoy se usa `deliveryMethod` (`PROMO_CODE`, `REDIRECT_LINK`, `PROMO_CODE_AND_LINK`, `IN_PERSON`, `EXTERNAL`). Falta **`CONTACT`** («Te contactamos»), y que la activación devuelva el QR (hoy solo lo trae el cupón externo, en `qrUrl`). |
| 3 | **Términos del premio del Cofre y del Flash** (`terms`) | «Términos y condiciones» del premio. El Flash ya los trae; la apertura del Cofre no. |
| 4 | **Días de Cofre y Flash configurables** | Hoy son textos provisionales (jueves y viernes). Deben venir del gestor. |
| 5 | **Código promocional de chances:** tipo y cantidad de regalo | El front lee `bonusChances` (o `potentialBonus`) de `POST /v1/promo-codes/validate`. |
| 6 | **Hora de cierre de compra de chances por sorteo** | «Compra hasta …». Hoy se usa la regla de las 12:00 del día del sorteo. |
| 7 | **Banners de `LANDING_MAIN`, `BENEFITS_MAIN` y `PRIZES_LOGGED`** | Imagen web, imagen móvil, enlace y orden, cargados desde el BackOffice. `LANDING_MAIN` ya tiene una imagen en `api-dev`; `BENEFITS_MAIN` aún no. |
| 8 | **CORS en `api-dev.akita.pe` y planes de Akitá** | Siguen pendientes (ver la sección 3). |

**Otros pendientes:**
- **Cliente:** textos finales de los días de Cofre y Flash.
- **Marketing (Dani):** medidas de los banners (Inicio, Beneficios y Sorteos; web y móvil).
- **Negocio:** plazo y canal de «Te contactamos».
- **Renato:** textos de Sumar chances y del canje de beneficios.

---

## 2. ¿Hay una API para el carrusel del Inicio?

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

**Actualización 29/10:** se decidió que todos los banners son una imagen con el texto incluido. El Inicio ya muestra las imágenes de `LANDING_MAIN` (web y móvil, con su enlace); si no hay ninguna o no cargan, quedan los 3 slides del diseño.

---

## 3. Pendiente de backend (28/10)

| # | Pendiente | Para qué |
|---|---|---|
| 1 | **CORS en `api-dev.akita.pe`** | El navegador no puede llamar a la API publicada. Mientras tanto, el front sigue con el mock de Cloud Run. |
| 2 | **Planes de Akitá en `api-dev`** | `GET /v1/subscription-plans` responde listas vacías. Sin el `planId` no se puede pagar. |
| 3 | **Campos estructurados en `LANDING_MAIN` / `LANDING_MAIN_LOGGED`** | Administrar el carrusel del Inicio desde el BackOffice (sección 2). |
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
