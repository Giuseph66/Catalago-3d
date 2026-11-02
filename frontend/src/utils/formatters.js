export function formatPrice(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

export function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 0).replace('.', ',')} MB`;
}

export function formatWeight(grams) {
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(2)} kg`;
  }
  return `${grams} g`;
}

/**
 * Normaliza URLs de mídia para garantir HTTPS e domínio correto
 * @param {string} url - URL da mídia (pode ser HTTP, localhost, ou relativa)
 * @returns {string} - URL normalizada com HTTPS e domínio correto
 */
export function normalizeMediaUrl(url) {
  if (!url) return url;
  console.log('🔍 NormalizeMediaUrl: URL recebida:', url);
  // Obter a URL base da API
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  // Extrair o domínio base (remover /api apenas se for no final)
  let apiBaseUrl = apiUrl.replace(/\/api$/, '').trim();
  console.log('🔍 NormalizeMediaUrl: API base URL:', apiBaseUrl);
  // Garantir que tem protocolo
  if (!apiBaseUrl.startsWith('http://') && !apiBaseUrl.startsWith('https://')) {
    apiBaseUrl = 'http://' + apiBaseUrl;
  }
  
  // Se estiver em HTTPS e a base for HTTP, converter
  if (typeof window !== 'undefined' && window.location.protocol === 'https:' && apiBaseUrl.startsWith('http://')) {
    apiBaseUrl = apiBaseUrl.replace('http://', 'https://');
  }
  
  // Se já for uma URL completa
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Se contiver localhost ou 127.0.0.1, substituir pelo domínio da API
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
      try {
        const urlObj = new URL(url);
        const apiUrlObj = new URL(apiBaseUrl);
        // Substituir host e protocolo
        urlObj.host = apiUrlObj.host;
        urlObj.protocol = apiUrlObj.protocol;
        return urlObj.toString();
      } catch (e) {
        console.error('Erro ao normalizar URL:', e, url);
        // Fallback: substituir localhost manualmente
        return url.replace(/http:\/\/localhost:\d+/, apiBaseUrl)
                  .replace(/https:\/\/localhost:\d+/, apiBaseUrl)
                  .replace(/http:\/\/127\.0\.0\.1:\d+/, apiBaseUrl);
      }
    }
    
    // Se estiver em HTTPS e a URL for HTTP, converter
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && url.startsWith('http://')) {
      return url.replace('http://', 'https://');
    }
    console.log('🔍 NormalizeMediaUrl: URL normalizada:', url);
    return url;
  }
  
  // Se for uma URL relativa (começa com /uploads)
  if (url.startsWith('/uploads')) {
    return `${apiBaseUrl}${url}`;
  }
  
  return url;
}

