# AKITÁ · Pendientes de backend (27/10/2026)

Actualizado con la respuesta de backend del 27/10 y los ajustes RF del 27/10.

## 1. Bloquean pasar a la API publicada

| Pendiente | Detalle | Quién |
|---|---|---|
| **CORS en `api-dev.akita.pe`** | La API no devuelve `Access-Control-Allow-Origin`, así que el navegador bloquea las llamadas. Hay que permitir `http://localhost:5173` y el dominio publicado del front. Mientras tanto, el front sigue apuntando al mock de Cloud Run. | Backend / DevOps |
| **Planes de Akitá en `api-dev`** | `GET /v1/subscription-plans` responde `{"MONTHLY":[],"SEMESTRAL":[],"ANNUAL":[]}`. Sin los planes, el pago no encuentra el `planId`. | Backend |
| **Kushki de staging y producción** | Faltan los *public merchant id* de esos ambientes. | Kushki / DevOps |

## 2. Datos que piden los ajustes RF del 27/10

| Dato | Para qué |
|---|---|
| **Listado público de sorteos** | Las páginas públicas (Inicio, Premios). Hoy el front usa `GET /v1/raffles`. |
| **Marca de premio del mes** en el sorteo | Mostrarlo siempre primero, aunque haya sorteos semanales antes. |
| **Fecha y `cutOffTime` por sorteo** | «Activa tu plan antes del [fecha], 11:59 a. m.» y el estado «La participación en este sorteo ya cerró». |
| **Vista previa pública de Cofre y Flash** | Stock por opción (premio o Lanas, beneficio o Lanas), «elegir hasta» y «usar hasta». Sugerencia: `GET /v1/chest/preview` y `GET /v1/benefits/flash/preview`. |
| **Estado «plan vencido»** en `GET /v1/users` | Mostrar «Reactiva tu plan» y pasar directo al pago. Hoy se deduce: hay `subscription`, pero `hasSubscription` es falso. |
| **Estado de una transacción** | Consultar un pago pendiente antes de permitir otro intento. Se necesita el estado por operación e idempotencia. |
| **Fecha real de vigencia** del plan | «Próxima renovación» o «Activo hasta» en la confirmación y en el éxito. |
| **Tipo y alcance de cada promoción** en `POST /v1/promo-codes/validate` | Mostrar el descuento o las Lanas que da el código. |
| **Consentimientos por separado** | El registro ya envía `consentSubscribeOffers`, `consentShareDataWithPartners`, `consentReceivePersonalizedPromotions` y `consentAcceptedPrivacyPolicy`. Confirmar que se guardan por separado. |
| **Reglas del código de Yape** | Vigencia y límites según la integración actual de YOKI. |
| **Pago único con tarjeta** | Semestral y anual con la renovación apagada se envían con `isConcurrent: false`. Confirmar que se cobra una sola vez. |

## 3. Otros pendientes

| Pendiente | Quién |
|---|---|
| `renewableUntil` y ofertas para subir de plan en los planes de Akitá | Negocio |
| Banner de `BENEFITS_MAIN` (carga en el BackOffice) | Negocio |
| Límite por IP del Libro de Reclamaciones sin `x-client-ip` | Backend |
| Recompensa del referido frente a la HU07 | Negocio |
| Consentimientos que mencionan a Mall360 | Legal |
| Qué ve «Mi plan y pagos» un plan sin renovación | Negocio |
| Correo antes de cada cobro | Runatech |

## 4. Ya integrado en el front

- **Planes:** el `planId` se toma de `GET /v1/subscription-plans` al pagar.
- **Ganadores:** el historial y la búsqueda por código usan `GET /v1/raffles/winners/history`.
- **Mis Cupones:** usa `GET /v1/coupons/me`. Si la ruta responde 404, usa el endpoint anterior.
- **Banners:** con 404 de `BENEFITS_MAIN` no se muestra carrusel.
- **Login:** sin Google ni Facebook.
- **Notificaciones:** la campana queda oculta en el R1.
- **Refresh token:** se envía en el body y se guarda en `sessionStorage`.
