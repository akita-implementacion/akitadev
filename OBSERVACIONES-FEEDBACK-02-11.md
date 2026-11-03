# Observaciones al Feedback R1 del 02/11/2026

Respuesta a cada punto del archivo «Feedback R1 - 02.11.2026». También incluye lo que se aplicó del paquete `akita-r1-front 02`.

Cada fila dice quién debe resolverlo:
- **Front:** se corrigió en esta versión.
- **Backend:** API o correo.
- **Gestor:** configuración en el BackOffice.
- **Negocio:** contenido o decisión del cliente.

## 1. Respuesta por punto

| ID | Pantalla | Quién | Respuesta |
|---|---|---|---|
| 1 | Beneficios · banner superior | Front ✅ · Gestor | **Front:** ya se muestran los 3 banners de marketing (Cinemark, Repsol y NCL), en el visitante y con sesión. Al tocarlos se abre el beneficio de esa marca. **Gestor:** para publicarlos desde el BackOffice, cargarlos en la sección `BENEFITS_MAIN`. Hoy la API responde 400 en esa sección; cuando tenga imágenes, reemplazan a las de ejemplo. |
| 2 | Premios · premio del mes | Gestor | La Gift Card Zara está marcada como destacada en el gestor. Hay que marcar Toyota + Crucero como premio destacado del mes. |
| 3 | Premios · sorteos de noviembre | Backend / Gestor | El front muestra lo que devuelve `GET /v1/raffles`. Las fechas sin premio llegan vacías desde la API: revisar la carga de premios por fecha. |
| 4 | Gestor · Premios y Sorteos | Backend (gestor) | Error del BackOffice. No depende del front. |
| 5 | Gestor · Beneficio Flash | Backend (gestor) | Ruta y permisos del BackOffice. No depende del front. |
| 6 | Premios · «Conoce los sorteos VIP» | Front ✅ | El enlace lleva a «Cómo funciona», a la tarjeta Sorteos VIP (no a las preguntas frecuentes). La tarjeta se resalta en amarillo para que se vea a dónde llegaste. |
| 7 | Beneficios · Destacados para ti | Cerrado | Las imágenes cargan en web y celular. |
| 8 | Beneficios · Repsol | Front ✅ · Gestor | **Front:** se agregó un buscador por nombre o comercio, sin importar tildes ni mayúsculas. Si no hay resultados, dice «No encontramos “…”» y explica que el beneficio puede no estar vigente. **Gestor:** el beneficio de Repsol estaba configurado hasta el 31/10. |
| 9 | Mi cuenta · placa | Front ✅ | El front acepta la placa con o sin guion (ABC-123 o ABC123) y la envía en mayúsculas. Falta confirmar que la API acepte los dos formatos. |
| 10 | Inicio · Beneficio Flash (visitante) | Front ✅ | Si no hay Flash cargado, la tarjeta ya no queda vacía. Muestra «Próximamente», cuándo llega (el próximo viernes, 8:00 a. m.) y el botón «Cómo funciona el Flash». |
| 11–13 | Pie · Términos, Privacidad y Cookies | Front ✅ · Negocio | **Front:** cada documento abre su propia página (`/legal/…`) y ya no vuelve al inicio. Mientras no esté el texto, la página dice que se está publicando e indica el correo de contacto. Aplica también a Bases, Cancelación y Selección de ganadores. **Negocio:** Legal debe entregar los textos o PDF; se agregan en `src/pages/publico/Legal.tsx`. |
| 14 | Inicio · Cofre (visitante) | Front ✅ | Si aún no hay cofre cargado, el botón «Ver Cofre de esta semana» se muestra igual. Abre «El Cofre llega pronto», con la cuenta regresiva al jueves 8:00 a. m. y cómo funciona. |
| 15 | Ganadores · número de orden | Por revisar | En esta versión no se muestra un número de orden de participación (solo las chances de cada ganador). Es probable que sea de la versión del desarrollador: confirmar con captura. |
| 16 | Ganadores · premio destacado | Gestor | El front destaca el premio que viene marcado como mayor. Hoy es la Gift Card Zara (marcada en el gestor); debe marcarse el auto del mes. |
| 17 | Pie · redes sociales | Negocio | Los íconos aún no tienen enlace porque faltan las URL oficiales de TikTok, Instagram, Facebook y YouTube de AKITÁ. Con ellas se completan en `src/components/layout/AppShell.tsx`. |
| 18 | Mi cuenta · «¿Necesitas ayuda?» | Front ✅ | Se reemplazó la oveja con lentes por la ilustración oficial de la agencia. |
| 19 | Suscripción · descripción de la promoción | Front ✅ · Backend | **Front:** el resumen ya no dice «Código promocional válido». Arma la descripción con los datos de la validación, por ejemplo «PRUEBALANZAMIENTO: +5 chances adicionales para el sorteo Gift Card Zara de S/ 1,000 del mié 25 nov». **Backend:** para que siempre salga completa, `POST /v1/promo-codes/validate` debe devolver la cantidad (`bonusChances`) y el sorteo (`raffle.name` y `raffle.drawDate`), o una `promoCode.description` lista para mostrar. |
| 20 | Premios · chances del código | Backend | Depende del punto 3: cuando la API devuelva el sorteo del 25/11, se verán sus chances. «Tienes N chances» usa `userChances` del sorteo, que incluye las de regalo. |
| 21 | Correo de confirmación · Lanas por referido | Backend | El correo lo envía el backend. Debe incluir las Lanas del referido, dónde verlas (Mi cuenta → Mis Lanas) y el plazo si se acreditan después. |
| 22 | Canje de Lanas por chances · misión cumplida | Front ✅ · Backend | **Front:** si el canje completa una misión, la confirmación muestra «¡Misión cumplida! +N Lanas», la misión y el saldo con la recompensa incluida. Solo aparece cuando hay una recompensa nueva. **Backend:** la respuesta de `POST /v1/raffles/{id}/chances/lanas` debe incluir `completedMissions: [{ title, rewardLanas }]`. Sin ese dato, con la API el mensaje no aparece. |

## 2. Paquete `akita-r1-front 02`: aplicado

- **Banners reales de marketing** (web 2400×350, móvil 786×600) en Beneficios, con sesión y sin sesión.
  - **Móvil:** el alto respeta la proporción del banner.
  - **Web:** entre 1024 y 1365 px el alto baja proporcionalmente para que se vea todo el contenido.
  - **Sorteos:** queda solo su cabecera hasta que lleguen banners de premios.
- **Buscador de beneficios** y mensaje cuando la búsqueda no encuentra nada.
- **«Próximamente»** para el Flash y el Cofre del visitante.
- **Resaltado de la tarjeta** a la que llegas en «Cómo funciona».
- **«¡Misión cumplida!»** al canjear Lanas por chances.
- **Descripción de la promoción** en el pago y en la confirmación.

## 3. Pendientes para cerrar

| Para | Qué |
|---|---|
| **Gestor** | Marcar Toyota + Crucero como premio destacado del mes. Cargar los banners en `BENEFITS_MAIN`. Revisar los premios de noviembre. Corregir el error de Premios y Sorteos y el acceso al Beneficio Flash. |
| **Backend** | `completedMissions` en el canje con Lanas. Sorteo y cantidad en la validación del código promocional. Lanas por referido en el correo de confirmación. Confirmar que la placa se acepte con y sin guion. |
| **Backend y marketing** | Unificar las medidas de banners: el BackOffice indicó 1200×400 (web) y 800×600 (móvil); marketing entrega 2400×350 y 786×600. El front ya muestra bien las de marketing. |
| **Negocio y Legal** | Textos o PDF de Términos, Privacidad, Cookies, Bases, Cancelación y Selección de ganadores. URL de las redes sociales. |

---

## 4. Histórico de ganadores con filtro por año y mes (03/11, paquete `akita-r1-front03`)

- **Filtro:** dos desplegables, «Año» y «Mes». Solo ofrecen los años y meses que tienen sorteos.
  - **Datos reales:** hoy van de setiembre de 2025 a octubre de 2026 (61 sorteos y 528 ganadores).
  - **Esta semana:** está en el año actual. Si todavía no hubo sorteo esta semana, se abre el mes más reciente.
  - **Al cambiar de año:** se abre su mes más reciente.
- **Resumen:** «Setiembre 2025 · 4 sorteos», y debajo 4 fechas por vez con «Ver N sorteos más».
- **Tarjeta de cada fecha:** «MIÉ 24 SET 2025 · 1.686 PARTICIPANTES». El año aparece solo cuando no es el actual. Muestra los ganadores con «★ GANADOR» y el premio destacado primero.
- **«Ver participantes»:** igual que en el sitio publicado, abre la lista pública con búsqueda por código. No muestra número de orden (ID 15).
- **API:**
  - El histórico usa `GET /v1/raffles/winners/history`, que pagina de a 50 como máximo, así que hoy son 11 llamadas en paralelo. **Sugerido a backend:** filtro por año y mes (o un rango de fechas) para pedir solo el mes elegido.
  - El total de participantes sale de `GET /v1/raffles/{id}/participation` y solo existe en los sorteos con lista publicada.
