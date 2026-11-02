import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { IoChevronBack, IoChevronForward, IoClose } from 'react-icons/io5';
import { FaPlay } from 'react-icons/fa';
import { formatBytes, normalizeMediaUrl } from '../../utils/formatters';

const ModelViewer = lazy(() => import('../three/ModelViewer'));
const AUTO_LOAD_BYTES = 8 * 1024 * 1024;

// Aba 3D: o arquivo vem direto do GitHub; arquivos grandes só baixam quando a pessoa pede
function ModelPanel({ modelo, productName }) {
  const [carregar, setCarregar] = useState(!modelo.tamanho || modelo.tamanho <= AUTO_LOAD_BYTES);
  const ext = (modelo.arquivo || '').split('.').pop().toLowerCase();

  if (!carregar) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-cobalt p-6 text-center text-paper">
        <p className="font-display text-4xl font-extrabold">{productName} em 3D</p>
        <button
          type="button"
          onClick={() => setCarregar(true)}
          className="h-12 rounded-full bg-paper px-6 font-display text-xl font-extrabold text-cobalt hover:bg-white"
        >
          Abrir o modelo ({formatBytes(modelo.tamanho)})
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-cobalt">
      <Suspense fallback={null}>
        <ModelViewer url={modelo.url} ext={ext} className="absolute inset-0" />
      </Suspense>
      <p className="pointer-events-none absolute bottom-3 left-4 font-serif text-sm italic text-paper/75">
        Arraste para girar. Use dois dedos ou a roda do mouse para aproximar.
      </p>
    </div>
  );
}
import { cn } from '../../lib/utils';

export default function ProductViewer({ media: fotos, modelo, productName }) {
  const media = modelo ? [...(fotos || []), { id: 'modelo-3d', tipo: '3d' }] : fotos;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const videoRef = useRef(null);
  const lightboxVideoRef = useRef(null);
  const total = media?.length || 0;
  const selectedMedia = media?.[selectedIndex] || media?.[0];

  useEffect(() => {
    if (!lightboxOpen) return undefined;
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') setLightboxIndex((prev) => (prev - 1 + total) % total);
      else if (e.key === 'ArrowRight') setLightboxIndex((prev) => (prev + 1) % total);
      else if (e.key === 'Escape') setLightboxOpen(false);
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [lightboxOpen, total]);

  // Auto-play vídeo quando o índice muda (navegadores podem bloquear)
  useEffect(() => {
    if (videoRef.current && selectedMedia?.tipo === 'video') {
      videoRef.current.play().catch(() => {});
    }
  }, [selectedIndex, selectedMedia]);

  useEffect(() => {
    if (lightboxVideoRef.current && media?.[lightboxIndex]?.tipo === 'video') {
      lightboxVideoRef.current.play().catch(() => {});
    }
  }, [lightboxIndex, media]);

  if (total === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center bg-[#DADDE2] font-serif text-lg italic text-ink/45">
        Fotos em breve
      </div>
    );
  }

  const step = (delta) => setSelectedIndex((prev) => (prev + delta + total) % total);
  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      <div className="group relative aspect-square w-full overflow-hidden bg-[#DADDE2] lg:aspect-[6/5]">
        {selectedMedia.tipo === '3d' ? (
          <ModelPanel modelo={modelo} productName={productName} />
        ) : selectedMedia.tipo === 'video' ? (
          <video
            ref={videoRef}
            src={normalizeMediaUrl(selectedMedia.url)}
            controls
            autoPlay
            muted
            playsInline
            className="h-full w-full object-contain"
          >
            Seu navegador não suporta vídeo.
          </video>
        ) : (
          <button
            type="button"
            onClick={() => openLightbox(selectedIndex)}
            className="h-full w-full cursor-zoom-in"
            aria-label="Ampliar foto"
          >
            <img src={normalizeMediaUrl(selectedMedia.url)} alt={productName} className="h-full w-full object-contain" />
          </button>
        )}

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-paper/90 text-ink shadow-sm transition-opacity hover:bg-paper md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
              aria-label="Foto anterior"
            >
              <IoChevronBack size={22} />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-paper/90 text-ink shadow-sm transition-opacity hover:bg-paper md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
              aria-label="Próxima foto"
            >
              <IoChevronForward size={22} />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-ink/75 px-3 py-1 font-serif text-sm text-paper">
              {selectedIndex + 1} de {total}
            </span>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {media.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-label={`Ver mídia ${index + 1}`}
              aria-current={index === selectedIndex}
              className={cn(
                'h-20 w-20 flex-shrink-0 overflow-hidden bg-[#DADDE2] ring-offset-2 ring-offset-paper transition',
                index === selectedIndex ? 'ring-2 ring-cobalt' : 'opacity-70 hover:opacity-100'
              )}
            >
              {item.tipo === '3d' ? (
                <span className="flex h-full w-full items-center justify-center bg-cobalt font-display text-2xl font-black text-paper">
                  3D
                </span>
              ) : item.tipo === 'video' ? (
                <span className="flex h-full w-full items-center justify-center text-ink/60">
                  <FaPlay size={18} />
                </span>
              ) : (
                <img src={normalizeMediaUrl(item.url)} alt="" className="h-full w-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95 p-4"
          onClick={() => setLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`Fotos de ${productName}`}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 z-10 rounded-full p-2 text-paper hover:bg-paper/10"
            aria-label="Fechar"
          >
            <IoClose size={30} />
          </button>

          <div className="relative max-h-full max-w-7xl" onClick={(e) => e.stopPropagation()}>
            {media[lightboxIndex].tipo === 'video' ? (
              <video
                ref={lightboxVideoRef}
                src={normalizeMediaUrl(media[lightboxIndex].url)}
                controls
                autoPlay
                muted
                playsInline
                className="max-h-[90vh] max-w-full"
              />
            ) : (
              <img
                src={normalizeMediaUrl(media[lightboxIndex].url)}
                alt={productName}
                className="max-h-[90vh] max-w-full object-contain"
              />
            )}

            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setLightboxIndex((prev) => (prev - 1 + total) % total)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-paper/15 p-3 text-paper hover:bg-paper/30"
                  aria-label="Foto anterior"
                >
                  <IoChevronBack size={24} />
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxIndex((prev) => (prev + 1) % total)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-paper/15 p-3 text-paper hover:bg-paper/30"
                  aria-label="Próxima foto"
                >
                  <IoChevronForward size={24} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
