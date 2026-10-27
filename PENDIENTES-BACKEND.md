# AKITÁ · Pendientes de backend (27/10/2026)

**Para:** equipo de backend.
**API revisada:** `https://back-mock-980046560569.us-central1.run.app`, probada el 27/10.
**Cómo leer la tabla:** cada punto dice qué falta, qué hace hoy el sitio mientras tanto y el endpoint involucrado.

---

## 1. Bloquean funciones del sitio

| # | Tema | Endpoint | Qué falta | Qué hace hoy el sitio |
|---|---|---|---|---|
| 1 | **Planes de suscripción** | `GET /v1/subscription-plans` | Responde `{}`. Debe devolver LANITA, LANOTA y LANAZA por periodo (`MONTHLY`, `SEMESTRAL`, `ANNUAL`) con `id`, precio y `origin`. | Usa su tabla de precios. **Sin el `planId` real no se puede pagar la suscripción.** |
| 2 | **Historial de ganadores** | `GET /v1/raffles/winners/history` | **404**: la ruta no existe en el mock. Se necesita paginado y con búsqueda por código público. | Ganadores muestra datos de ejemplo. |
| 3 | **Kushki staging y producción** | — | Faltan los *public merchant id* de esos ambientes. Hoy solo está el de pruebas. | Con el id de pruebas se puede pagar con tarjeta nueva. |
| 4 | **Imágenes** | Beneficios, marcas, sorteos, ganadores y banners | Las URLs no existen: `cdn.akita.pe/...`, `assets.yoki.pe/...` y `example.com/...`. | Muestra imágenes de prueba (se apagan con `VITE_IMAGENES_PRUEBA=false`). Los banners que no cargan no se muestran. |
| 5 | **Banner de Beneficios** | `GET /v1/banners/public?section=BENEFITS_MAIN` | **400**: `BENEFITS_MAIN` no está entre los valores permitidos (HU21). | Beneficios muestra los banners de marca de ejemplo. |

## 2. Datos que faltan en respuestas existentes

| # | Tema | Endpoint | Qué falta |
|---|---|---|---|
| 6 | **Origen del plan** | `GET /v1/users` → `subscription` | `origin` (`YOKI` \| `AKITA`) y `renewableUntil`. El sitio ya muestra la etiqueta «Plan YOKI» si llega `origin`. |
| 7 | **Cofre** | `GET /v1/chest/me`, `POST /v1/chest/me/openings` | `cycleStock` (`total`, `delivered`, `remaining`) y `opening.rewardImageUrl`. El sitio ya los lee. |
| 8 | **Ofertas para subir de plan** | `GET /v1/subscriptions/upgrade-offers` | Ofertas para los planes de Akitá. Hoy llegan `offers: []`, así que «Subir de plan» queda oculto. Lo define negocio. |
| 9 | **Ganadores del sorteo** | `GET /v1/raffles/winners?date=` | El mock devuelve datos de relleno (`"hour de ejemplo"`, fechas de 2025). Se necesitan datos reales para validar. |
| 10 | **Corte** | `GET /v1/configurations` | `textCutOffTime` llega como texto de ejemplo. El sitio usa 12:00 (hora de Lima) del día del sorteo. |

## 3. Endpoints nuevos que pide el diseño

| # | Tema | Qué se necesita |
|---|---|---|
| 11 | **Notificaciones** | El ícono de campana del encabezado no tiene endpoint (`/v1/notifications` responde 404). Se necesita listar y marcar como leídas. |
| 12 | **Login con Google y Facebook** | El diseño los muestra en «Inicia sesión». No hay OAuth en la API (decisión D5 del 25/10). Hoy los botones avisan «Muy pronto». Si se mantiene la decisión, se quitan. |
| 13 | **Mis Cupones (R2)** | `GET /v1/coupons/me` reemplazará a `GET /v1/lana-redemptions/mine`. |

## 4. Infraestructura

| # | Tema | Qué falta |
|---|---|---|
| 14 | **Mock de Cloud Run** | Regenerarlo desde el OpenAPI de `release_1-ccm`: le faltan rutas (punto 2), los planes (punto 1) y datos reales. |
| 15 | **Límite por IP del Libro de Reclamaciones** | El sitio es estático y no puede enviar `x-client-ip` en `POST /v1/complaints`. Backend debería tomar la IP de la conexión o de un proxy. |
| 16 | **Refresh token** | Hoy se guarda en `sessionStorage`. Cuando backend emita la cookie httpOnly, se cambia con `VITE_AUTH_REFRESH=cookie`. |

## 5. Formatos a unificar (no bloquean)

- **Fechas:** algunas llegan en `DD/MM/YYYY` (beneficios, historial de pagos, ganadores) y otras en ISO.
- **Montos:** algunos llegan como texto con espacio no separable («S/ 75.00»), en `upgrade-offers`.
- **Nombres de campos con errores:** `termAndConditionsUrl` (sin «s») en `/v1/raffles` y `oportunitiesPerRaffle`.
- **Categorías:** el `categoryId` de beneficios no coincide con `/v1/benefit-categories`.

El sitio ya maneja todas estas variantes. Si se unifican, avisar para quitar los ajustes.
