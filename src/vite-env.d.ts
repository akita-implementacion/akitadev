/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_DATA_SOURCE?: 'api' | 'mock';
  readonly VITE_AUTH_REFRESH?: 'storage' | 'cookie';
  readonly VITE_MOCK_FALLBACK?: string;
  readonly VITE_DATOS_EJEMPLO?: string;
  readonly VITE_IMAGENES_PRUEBA?: string;
  readonly VITE_KUSHKI_MERCHANT_ID?: string;
  readonly VITE_KUSHKI_TEST?: string;
}
