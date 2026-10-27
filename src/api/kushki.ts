import { ApiError } from './client';
import { config } from './config';

type Tarjeta = { numero: string; venc: string; cvv: string; titular: string };
type KushkiSdk = new (o: { merchantId: string; inTestEnvironment: boolean }) => {
  requestToken: (b: unknown, cb: (r: { token?: string; code?: string; message?: string }) => void) => void;
  requestSubscriptionToken: (b: unknown, cb: (r: { token?: string; code?: string; message?: string }) => void) => void;
};

let sdk: Promise<KushkiSdk> | null = null;
function cargarSdk(): Promise<KushkiSdk> {
  sdk ??= new Promise((ok, mal) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.kushkipagos.com/kushki.min.js';
    s.async = true;
    s.onload = () => ((window as any).Kushki ? ok((window as any).Kushki) : mal(new Error('SDK Kushki no disponible')));
    s.onerror = () => { sdk = null; mal(new Error('No se pudo cargar Kushki')); };
    document.head.appendChild(s);
  });
  return sdk;
}

export async function tokenizarTarjeta(t: Tarjeta, monto: number, recurrente: boolean): Promise<string> {
  if (!config.kushki.merchantId) throw new ApiError(0, 'KUSHKI_NO_CONFIGURADO', 'Falta VITE_KUSHKI_MERCHANT_ID');
  const Kushki = await cargarSdk();
  const k = new Kushki({ merchantId: config.kushki.merchantId, inTestEnvironment: config.kushki.test });
  const [mes, anio] = t.venc.split('/');
  const card = { name: t.titular, number: t.numero.replace(/\s/g, ''), cvc: t.cvv, expiryMonth: mes, expiryYear: anio };
  return new Promise((ok, mal) => {
    const cb = (r: { token?: string; code?: string; message?: string }) =>
      r.token ? ok(r.token) : mal(new ApiError(0, r.code ?? 'KUSHKI_ERROR', r.message ?? 'No pudimos validar tu tarjeta.'));
    if (recurrente) k.requestSubscriptionToken({ card, currency: 'PEN' }, cb);
    else k.requestToken({ amount: monto, currency: 'PEN', card }, cb);
  });
}
