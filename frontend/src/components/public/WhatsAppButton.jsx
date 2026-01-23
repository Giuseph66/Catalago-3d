import { FaWhatsapp } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function WhatsAppButton({ product, className = '' }) {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    api.get('/config').then(res => setConfig(res.data)).catch(() => {});
  }, []);

  if (!config?.whatsappNumero) return null;

  const handleClick = () => {
    const cidade = 'Sinop-MT';
    let mensagem = config.whatsappTemplate || 'Olá! Vi o produto {NOME} no seu catálogo. Sou de {CIDADE}. Ele está disponível? Gostaria de comprar/combinar entrega em Sinop–MT.';
    
    if (product) {
      mensagem = product.mensagemWhatsAppTemplate || mensagem;
      mensagem = mensagem.replace('{NOME}', product.nome || 'este produto');
      mensagem = mensagem.replace('{CIDADE}', cidade);
      
      if (product.status === 'SOB_ENCOMENDA') {
        mensagem += ' Entendo que é sob encomenda. Qual o prazo?';
      }
    } else {
      mensagem = mensagem.replace('{NOME}', 'seus produtos');
      mensagem = mensagem.replace('{CIDADE}', cidade);
    }

    const encodedMessage = encodeURIComponent(mensagem);
    const cleanNumber = config.whatsappNumero.replace(/\D/g, '');
    const url = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
    
    window.open(url, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className={`fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-all hover:scale-110 z-50 ${className}`}
      aria-label="Chamar no WhatsApp"
    >
      <FaWhatsapp size={28} />
    </button>
  );
}

