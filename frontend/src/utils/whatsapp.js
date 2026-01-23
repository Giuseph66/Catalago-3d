export function generateWhatsAppLink(nomeProduto, cidade = 'Sinop-MT', status, whatsappNumero, template) {
  // Validar e converter whatsappNumero para string
  if (!whatsappNumero) {
    console.warn('Número do WhatsApp não configurado');
    return '#';
  }

  // Garantir que é string
  const numeroStr = String(whatsappNumero).trim();
  if (!numeroStr || numeroStr === '') {
    console.warn('Número do WhatsApp inválido');
    return '#';
  }

  let mensagem = template || 'Olá! Vi o produto {NOME} no seu catálogo. Sou de {CIDADE}. Ele está disponível? Gostaria de comprar/combinar entrega em Sinop–MT.';
  
  mensagem = mensagem.replace('{NOME}', nomeProduto || 'este produto');
  mensagem = mensagem.replace('{CIDADE}', cidade || 'Sinop-MT');

  if (status === 'SOB_ENCOMENDA') {
    mensagem += ' Entendo que é sob encomenda. Qual o prazo?';
  }

  const encodedMessage = encodeURIComponent(mensagem);
  const cleanNumber = numeroStr.replace(/\D/g, '');
  
  if (!cleanNumber || cleanNumber === '') {
    console.warn('Número do WhatsApp inválido após limpeza');
    return '#';
  }
  
  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
}

