import { useState } from 'react';
import api from '../../services/api';
import { FaUpload, FaTrash, FaStar, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { normalizeMediaUrl } from '../../utils/formatters';

export default function MediaUploader({ productId, media, onMediaChange }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log('📤 MediaUploader: Iniciando upload...', { productId, fileName: file.name, fileSize: file.size });
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post(`/products/${productId}/media`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('✅ MediaUploader: Upload bem-sucedido:', res.data);
      onMediaChange([...media, res.data]);
    } catch (error) {
      console.error('❌ MediaUploader: Erro no upload:', error);
      alert('Erro ao fazer upload: ' + (error.response?.data?.error || error.message));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (mediaId) => {
    if (!confirm('Tem certeza que deseja excluir esta mídia?')) return;

    try {
      await api.delete(`/products/${productId}/media/${mediaId}`);
      onMediaChange(media.filter(m => m.id !== mediaId));
    } catch (error) {
      alert('Erro ao excluir mídia');
    }
  };

  const handleSetCapa = async (mediaId) => {
    try {
      await api.put(`/products/${productId}/media/${mediaId}/capa`);
      const updated = media.map(m => ({
        ...m,
        isCapa: m.id === mediaId ? 1 : 0
      }));
      onMediaChange(updated);
    } catch (error) {
      alert('Erro ao definir capa');
    }
  };

  const handleReorder = async (mediaId, direction) => {
    const index = media.findIndex(m => m.id === mediaId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= media.length) return;

    const newMedia = [...media];
    [newMedia[index], newMedia[newIndex]] = [newMedia[newIndex], newMedia[index]];

    const mediaIds = newMedia.map(m => m.id);
    try {
      await api.put(`/products/${productId}/media/reorder`, { mediaIds });
      onMediaChange(newMedia);
    } catch (error) {
      alert('Erro ao reordenar');
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2">Mídias</label>
      
      <div className="mb-4">
        <label className="cursor-pointer inline-flex items-center gap-2 btn-primary">
          <FaUpload />
          {uploading ? 'Enviando...' : 'Upload de Mídia'}
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {media.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {media.map((item, index) => (
            <div key={item.id} className="relative group">
              {item.tipo === 'video' ? (
                <video src={normalizeMediaUrl(item.url)} className="w-full h-32 object-cover rounded-xl" />
              ) : (
                <img src={normalizeMediaUrl(item.url)} alt={`Mídia ${index + 1}`} className="w-full h-32 object-cover rounded-xl" />
              )}
              
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => handleSetCapa(item.id)}
                  className="p-2 rounded-xl text-white hover:bg-opacity-100"
                  style={{ backgroundColor: item.isCapa ? 'var(--warning)' : 'rgba(255, 255, 255, 0.2)' }}
                  title="Marcar como capa"
                >
                  <FaStar />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 rounded bg-red-500 text-white hover:bg-red-600"
                  title="Excluir"
                >
                  <FaTrash />
                </button>
                {index > 0 && (
                  <button
                    onClick={() => handleReorder(item.id, 'up')}
                    className="p-2 rounded bg-white bg-opacity-20 text-white hover:bg-opacity-100"
                    title="Mover para cima"
                  >
                    <FaArrowUp />
                  </button>
                )}
                {index < media.length - 1 && (
                  <button
                    onClick={() => handleReorder(item.id, 'down')}
                    className="p-2 rounded bg-white bg-opacity-20 text-white hover:bg-opacity-100"
                    title="Mover para baixo"
                  >
                    <FaArrowDown />
                  </button>
                )}
              </div>
              
              {item.isCapa && (
                <div className="absolute top-2 left-2 text-white text-xs px-2 py-1 rounded-xl" style={{ backgroundColor: 'var(--warning)' }}>
                  Capa
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

