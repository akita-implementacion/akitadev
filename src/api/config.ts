import { initRevision } from '../data/assets';

const env = import.meta.env;

export const config = {
  apiBaseUrl: String(env.VITE_API_BASE_URL ?? '').replace(/\/$/, ''),
  usarMock: !!initRevision || env.VITE_DATA_SOURCE === 'mock' || !env.VITE_API_BASE_URL,
  refresh: (env.VITE_AUTH_REFRESH === 'cookie' ? 'cookie' : 'storage') as 'cookie' | 'storage',
  mockFallback: env.DEV && env.VITE_MOCK_FALLBACK === 'true',
  datosEjemplo: env.VITE_DATOS_EJEMPLO === 'true',
  imagenesPrueba: env.VITE_IMAGENES_PRUEBA !== 'false',
  kushki: {
    merchantId: String(env.VITE_KUSHKI_MERCHANT_ID ?? ''),
    test: env.VITE_KUSHKI_TEST !== 'false',
  },
  timeoutMs: 20000,
};
