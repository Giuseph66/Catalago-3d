import { useState, useEffect, useRef } from 'react';
import { IoChevronBack, IoChevronForward, IoClose } from 'react-icons/io5';
import { FaPlay } from 'react-icons/fa';
import { normalizeMediaUrl } from '../../utils/formatters';

export default function ProductViewer({ media, productName }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const videoRef = useRef(null);
  const lightboxVideoRef = useRef(null);

  if (!media || media.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-200 rounded-xl flex items-center justify-center">
        <span className="text-gray-400">Sem imagens</span>
      </div>
    );
  }

  const selectedMedia = media[selectedIndex] || media[0];

  const nextMedia = () => {
    setSelectedIndex((prev) => (prev + 1) % media.length);
  };

  const prevMedia = () => {
    setSelectedIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (lightboxOpen) {
        if (e.key === 'ArrowLeft') {
          setLightboxIndex((prev) => (prev - 1 + media.length) % media.length);
        } else if (e.key === 'ArrowRight') {
          setLightboxIndex((prev) => (prev + 1) % media.length);
        } else if (e.key === 'Escape') {
          closeLightbox();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [lightboxOpen, media.length]);

  // Auto-play vídeo quando o índice muda
  useEffect(() => {
    if (videoRef.current && selectedMedia?.tipo === 'video') {
      videoRef.current.play().catch(err => {
        // Ignora erros de autoplay (alguns navegadores bloqueiam)
        console.log('Autoplay bloqueado pelo navegador');
      });
    }
  }, [selectedIndex, selectedMedia]);

  // Auto-play vídeo no lightbox quando o índice muda
  useEffect(() => {
    if (lightboxVideoRef.current && media[lightboxIndex]?.tipo === 'video') {
      lightboxVideoRef.current.play().catch(err => {
        console.log('Autoplay bloqueado pelo navegador no lightbox');
      });
    }
  }, [lightboxIndex, media]);

  return (
    <>
      <div className="relative">
        {/* Mídia principal */}
        <div className="relative w-full h-96 md:h-[500px] bg-gray-100 rounded-xl overflow-hidden group">
          {selectedMedia.tipo === 'video' ? (
            <video
              ref={videoRef}
              src={normalizeMediaUrl(selectedMedia.url)}
              controls
              autoPlay
              muted
              playsInline
              className="w-full h-full object-contain"
            >
              Seu navegador não suporta vídeo.
            </video>
          ) : (
            <img
              src={normalizeMediaUrl(selectedMedia.url)}
              alt={productName}
              className="w-full h-full object-contain cursor-zoom-in"
              onClick={() => openLightbox(selectedIndex)}
            />
          )}

          {/* Navegação */}
          {media.length > 1 && (
            <>
              <button
                onClick={prevMedia}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity opacity-0 group-hover:opacity-100"
                aria-label="Anterior"
              >
                <IoChevronBack size={24} />
              </button>
              <button
                onClick={nextMedia}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity opacity-0 group-hover:opacity-100"
                aria-label="Próximo"
              >
                <IoChevronForward size={24} />
              </button>
            </>
          )}

          {/* Indicador de tipo */}
          {selectedMedia.tipo === 'gif' && (
            <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
              GIF
            </div>
          )}
        </div>

        {/* Miniaturas */}
        {media.length > 1 && (
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {media.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setSelectedIndex(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                  index === selectedIndex
                    ? 'border-primary-500 scale-105'
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                {item.tipo === 'video' ? (
                  <div className="relative w-full h-full bg-gray-200">
                    <FaPlay className="absolute inset-0 m-auto text-gray-600" size={20} />
                  </div>
                ) : (
                  <img
                    src={normalizeMediaUrl(item.url)}
                    alt={`${productName} - ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            aria-label="Fechar"
          >
            <IoClose size={32} />
          </button>

          <div className="relative max-w-7xl max-h-full" onClick={(e) => e.stopPropagation()}>
            {media[lightboxIndex].tipo === 'video' ? (
              <video
                ref={lightboxVideoRef}
                src={normalizeMediaUrl(media[lightboxIndex].url)}
                controls
                autoPlay
                muted
                playsInline
                className="max-w-full max-h-[90vh]"
              />
            ) : (
              <img
                src={normalizeMediaUrl(media[lightboxIndex].url)}
                alt={productName}
                className="max-w-full max-h-[90vh] object-contain"
              />
            )}

            {media.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((prev) => (prev - 1 + media.length) % media.length);
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-20 text-white p-3 rounded-full hover:bg-opacity-30"
                  aria-label="Anterior"
                >
                  <IoChevronBack size={24} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((prev) => (prev + 1) % media.length);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-20 text-white p-3 rounded-full hover:bg-opacity-30"
                  aria-label="Próximo"
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

