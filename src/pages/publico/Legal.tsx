import { Link, useParams } from 'react-router-dom';
import { Hero } from '../../components/layout/Hero';

export const DOCUMENTOS_LEGALES = [
  { slug: 'terminos', titulo: 'Términos y condiciones', url: '' },
  { slug: 'privacidad', titulo: 'Política de privacidad', url: '' },
  { slug: 'cookies', titulo: 'Políticas de cookies', url: '' },
  { slug: 'bases', titulo: 'Bases de cada sorteo', url: '' },
  { slug: 'cancelacion', titulo: 'Política de cancelación', url: '' },
  { slug: 'seleccion-ganadores', titulo: 'Método de selección de ganadores', url: '' },
];

export default function Legal() {
  const { doc } = useParams();
  const d = DOCUMENTOS_LEGALES.find((x) => x.slug === doc) ?? DOCUMENTOS_LEGALES[0];
  return (
    <>
      <Hero publico color="#FFD400" titulo={d.titulo} bajada="Documento legal de AKITÁ." />
      <div className="mx-auto flex max-w-[880px] flex-col gap-6 px-6 py-8 lg:px-16 lg:py-12">
        {d.url ? (
          <a href={d.url} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 w-fit items-center rounded-pill bg-cafe px-6 text-[15px] font-bold text-n0">Ver documento completo</a>
        ) : (
          <div className="flex flex-col gap-2 rounded-2xl bg-n0 p-5 lg:p-6">
            <p className="text-[17px] font-extrabold text-cafe">Estamos terminando de publicar este documento</p>
            <p className="text-[15px] leading-[22px] text-n60">
              Si necesitas consultarlo ahora, escríbenos a <a href="mailto:contacto@akita.pe" className="font-bold text-cafe underline">contacto@akita.pe</a> y te lo enviamos.
              {d.slug === 'bases' && <> Las bases de cada premio también están en su detalle, en <Link to="/sorteos" className="font-bold text-cafe underline">Premios</Link>.</>}
            </p>
          </div>
        )}
        <nav aria-label="Otros documentos" className="flex flex-col gap-2">
          <p className="text-sm font-bold text-n60">Otros documentos</p>
          <div className="flex flex-wrap gap-2">
            {DOCUMENTOS_LEGALES.filter((x) => x.slug !== d.slug).map((x) => (
              <Link key={x.slug} to={`/legal/${x.slug}`} className="rounded-pill bg-n0 px-4 py-2 text-sm font-semibold text-cafe">{x.titulo}</Link>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
}
