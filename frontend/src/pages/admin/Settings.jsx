import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { FaSave } from 'react-icons/fa';

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    precoPorGrama: '1.00',
    whatsappNumero: '',
    whatsappTemplate: '',
    linkLojaMercadoLivre: '',
    localizacao: 'Sinop – Mato Grosso',
    politicaLocal: 'Entregas locais sem frete / combine pelo WhatsApp'
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const res = await api.get('/config/admin');
      setFormData({
        precoPorGrama: res.data.precoPorGrama || '1.00',
        whatsappNumero: res.data.whatsappNumero || '',
        whatsappTemplate: res.data.whatsappTemplate || '',
        linkLojaMercadoLivre: res.data.linkLojaMercadoLivre || '',
        localizacao: res.data.localizacao || 'Sinop – Mato Grosso',
        politicaLocal: res.data.politicaLocal || 'Entregas locais sem frete / combine pelo WhatsApp'
      });
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/config', formData);
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      alert('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Skeleton className="h-10 w-64 mb-6" />
        <Card>
          <CardContent className="p-6 space-y-6">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>
          Configurações
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-2)' }}>
          Configure as opções gerais do sistema
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Preços</h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <Input
              label="Preço por Grama (R$)"
              type="number"
              step="0.01"
              value={formData.precoPorGrama}
              onChange={(e) => setFormData({ ...formData, precoPorGrama: e.target.value })}
              required
              hint="Usado para calcular o preço automaticamente quando não houver preço personalizado"
            />
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>WhatsApp</h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <Input
              label="Número do WhatsApp"
              type="text"
              value={formData.whatsappNumero}
              onChange={(e) => setFormData({ ...formData, whatsappNumero: e.target.value })}
              placeholder="5566999999999"
              hint="Formato: código do país + DDD + número (sem espaços ou caracteres especiais)"
            />
            <Textarea
              label="Template WhatsApp"
              value={formData.whatsappTemplate}
              onChange={(e) => setFormData({ ...formData, whatsappTemplate: e.target.value })}
              rows="4"
              placeholder="Use {NOME} para o nome do produto e {CIDADE} para a cidade"
              hint="Variáveis disponíveis: {NOME} (nome do produto), {CIDADE} (cidade do cliente)"
            />
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Mercado Livre</h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <Input
              label="Link da Loja no Mercado Livre"
              type="url"
              value={formData.linkLojaMercadoLivre}
              onChange={(e) => setFormData({ ...formData, linkLojaMercadoLivre: e.target.value })}
              placeholder="https://www.mercadolivre.com.br/loja-exemplo"
              hint="Link padrão usado quando o produto não tem link específico"
            />
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Localização</h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <Input
              label="Localização"
              value={formData.localizacao}
              onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
              hint="Exibida na home e páginas de produto"
            />
            <Textarea
              label="Política Local"
              value={formData.politicaLocal}
              onChange={(e) => setFormData({ ...formData, politicaLocal: e.target.value })}
              rows="2"
              hint="Texto sobre entregas locais e políticas"
            />
          </CardContent>
        </Card>

        <div className="mt-8 flex justify-end">
          <Button
            type="submit"
            disabled={saving}
            loading={saving}
            leftIcon={<FaSave />}
          >
            Salvar Configurações
          </Button>
        </div>
      </form>
    </div>
  );
}
