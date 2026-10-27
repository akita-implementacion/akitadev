# AKITÁ · Front-end web (R1)

React 18 + TypeScript + Vite 5 + Tailwind 3 + React Router 6 (HashRouter). Sitio estático y responsive (móvil y web).

## Requisitos

- Node.js 18 o superior.

## Levantar el proyecto

```bash
npm install
npm run dev       # http://localhost:5173 (usa .env.development)
npm run build     # genera dist/
npm run preview   # sirve dist/
```

En desarrollo, el sitio consume la API de prueba en Cloud Run.

Para ver el prototipo sin backend, crea un archivo `.env.development.local` con este contenido:

```
VITE_DATA_SOURCE=mock
```

Con eso cualquier correo y contraseña válidos inician sesión.

## Variables de entorno

| Variable | Uso |
|---|---|
| `VITE_API_BASE_URL` | URL base de la API. |
| `VITE_DATA_SOURCE` | `api` (consume la API) o `mock` (datos locales de `src/data/mock.ts`). |
| `VITE_AUTH_REFRESH` | `storage` (refresh token en `sessionStorage`) o `cookie` (cookie httpOnly del backend). |
| `VITE_MOCK_FALLBACK` | `true`: usa los datos locales si un endpoint falla (solo en desarrollo). |
| `VITE_DATOS_EJEMPLO` | `true`: muestra datos de ejemplo cuando la API responde vacío. En producción, `false`. |
| `VITE_IMAGENES_PRUEBA` | `true`: muestra imágenes de prueba cuando la API no trae imagen o no carga. En producción, `false`. |
| `VITE_KUSHKI_MERCHANT_ID` / `VITE_KUSHKI_TEST` | Credencial pública de Kushki y modo de pruebas. |

Producción: ver `.env.example`.

## Dónde está la integración con la API

| Archivo | Contenido |
|---|---|
| `src/api/config.ts` | Lectura de las variables de entorno. |
| `src/api/client.ts` | Cliente HTTP: token, refresh, errores e idempotencia. |
| `src/api/servicios.ts` | Todos los endpoints que usa el sitio. |
| `src/api/tipos.ts` | Tipos de las respuestas. |
| `src/data/adaptadores.ts` | Conversión de las respuestas al formato de la interfaz. |
| `src/data/datos.ts` | Hooks que usan las páginas. |

Lo que falta del lado de backend está en `PENDIENTES-BACKEND.md`.
