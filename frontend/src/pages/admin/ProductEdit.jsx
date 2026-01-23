import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MediaUploader from '../../components/admin/MediaUploader';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Switch } from '../../components/ui/Switch';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { PRODUCT_STATUS } from '../../lib/constants';
import { FaSave, FaTimes } from 'react-icons/fa';

export default function AdminProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'novo' || !id || id === 'undefined';
  const actionsRef = useRef(null);

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [media, setMedia] = useState([]);
  
  const [formData, setFormData] = useState({
    nome: '',
    slug: '',
    descricaoCurta: '',
    descricaoCompleta: '',
    peso: '',
    altura: '',
    largura: '',
    profundidade: '',
    material: '',
    cor: '',
    preco: '',
    categorias: [],
    tags: '',
    status: PRODUCT_STATUS.PRONTA_ENTREGA,
    destaque: false,
    linkMercadoLivre: '',
    mensagemWhatsAppTemplate: '',
    historiaTitulo: '',
    historiaTexto: '',
  });

  useEffect(() => {
    loadCategories();
    // Se tiver um ID válido (não é 'novo' nem 'undefined'), carrega o produto
    if (id && id !== 'undefined' && id !== 'novo') {
      loadProduct();
    } else {
      setLoading(false);
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const loadProduct = async () => {
    if (!id || id === 'undefined' || id === 'novo') {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get(`/products/admin/${id}`);
      const product = res.data;
      
      const precoParaForm = product.precoOriginal != null && product.precoOriginal !== '' 
        ? product.precoOriginal 
        : '';
      
      setFormData({
        nome: product.nome || '',
        slug: product.slug || '',
        descricaoCurta: product.descricaoCurta || '',
        descricaoCompleta: product.descricaoCompleta || '',
        peso: product.peso || '',
        altura: product.altura || '',
        largura: product.largura || '',
        profundidade: product.profundidade || '',
        material: product.material || '',
        cor: product.cor || '',
        preco: precoParaForm,
        categorias: product.categorias || [],
        tags: (product.tags || []).join(', '),
        status: product.status || PRODUCT_STATUS.PRONTA_ENTREGA,
        destaque: product.destaque || false,
        linkMercadoLivre: product.linkMercadoLivre || '',
        mensagemWhatsAppTemplate: product.mensagemWhatsAppTemplate || '',
        historiaTitulo: product.historiaTitulo || '',
        historiaTexto: product.historiaTexto || '',
      });
      
      setMedia(product.media || []);
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
      alert('Erro ao carregar produto');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    let precoValue = null;
    if (formData.preco !== null && formData.preco !== undefined && formData.preco !== '') {
      const precoStr = String(formData.preco).trim();
      if (precoStr !== '') {
        const precoNum = parseFloat(precoStr);
        if (!isNaN(precoNum) && precoNum > 0) {
          precoValue = precoNum;
        }
      }
    }
    
    const data = {
      ...formData,
      preco: precoValue,
      categorias: formData.categorias,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
    };

    try {
      if (isNew) {
        const res = await api.post('/products', data);
        navigate(`/admin/produtos/${res.data.id}`);
      } else {
        if (!id || id === 'undefined') {
          alert('ID do produto inválido');
          return;
        }
        await api.put(`/products/${id}`, data);
        navigate('/admin/produtos');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar produto: ' + (error.response?.data?.error || 'Erro desconhecido'));
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
    <div className="pb-24">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>
          {isNew ? 'Novo Produto' : 'Editar Produto'}
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-2)' }}>
          {isNew ? 'Preencha os dados do novo produto' : 'Atualize as informações do produto'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seção 1: Básico */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Informações Básicas</h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Nome do Produto"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
                hint="Nome que aparecerá no catálogo"
              />
              <Input
                label="Slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="Auto-gerado do nome"
                hint="URL amigável (ex: produto-exemplo)"
              />
            </div>
          </CardContent>
        </Card>

        {/* Seção 2: Características Físicas */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Características Físicas</h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Peso (gramas)"
                type="number"
                value={formData.peso}
                onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
                required
                min="1"
                hint="Peso em gramas do produto"
              />
              <Input
                label="Altura (cm)"
                type="number"
                step="0.1"
                value={formData.altura}
                onChange={(e) => setFormData({ ...formData, altura: e.target.value })}
                min="0"
                placeholder="Ex: 15.5"
                hint="Altura do produto em centímetros"
              />
              <Input
                label="Largura (cm)"
                type="number"
                step="0.1"
                value={formData.largura}
                onChange={(e) => setFormData({ ...formData, largura: e.target.value })}
                min="0"
                placeholder="Ex: 20.0"
                hint="Largura do produto em centímetros"
              />
              <Input
                label="Profundidade (cm)"
                type="number"
                step="0.1"
                value={formData.profundidade}
                onChange={(e) => setFormData({ ...formData, profundidade: e.target.value })}
                min="0"
                placeholder="Ex: 10.5"
                hint="Profundidade do produto em centímetros"
              />
              <Input
                label="Material"
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                placeholder="Ex: PLA, PETG, ABS, Resina"
                hint="Tipo de material usado na impressão"
              />
              <Input
                label="Cor"
                value={formData.cor}
                onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                placeholder="Ex: Branco, Preto, Transparente"
                hint="Cor principal do produto"
              />
            </div>
          </CardContent>
        </Card>

        {/* Seção 3: Preço e Status */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Preço e Status</h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <Input
              label="Preço Personalizado (R$)"
              type="number"
              step="0.01"
              value={formData.preco}
              onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
              min="0"
              placeholder="Deixe vazio para calcular pelo peso"
              hint="Opcional - se vazio, calcula automaticamente"
            />
            <div className="flex items-center gap-6">
              <Switch
                checked={formData.status === PRODUCT_STATUS.PRONTA_ENTREGA}
                onChange={(checked) => setFormData({
                  ...formData,
                  status: checked ? PRODUCT_STATUS.PRONTA_ENTREGA : PRODUCT_STATUS.SOB_ENCOMENDA
                })}
                label="Pronta Entrega"
                hint="Desmarque para 'Sob Encomenda'"
              />
              <Switch
                checked={formData.destaque}
                onChange={(checked) => setFormData({ ...formData, destaque: checked })}
                label="Produto em Destaque"
                hint="Aparecerá na home"
              />
            </div>
          </CardContent>
        </Card>

        {/* Seção 4: Descrições */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Descrições</h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <Textarea
              label="Descrição Curta"
              value={formData.descricaoCurta}
              onChange={(e) => setFormData({ ...formData, descricaoCurta: e.target.value })}
              rows="3"
              hint="Aparece nos cards e listagens"
            />
            <Textarea
              label="Descrição Completa"
              value={formData.descricaoCompleta}
              onChange={(e) => setFormData({ ...formData, descricaoCompleta: e.target.value })}
              rows="6"
              hint="Descrição detalhada na página do produto"
            />
          </CardContent>
        </Card>

        {/* Seção 5: Categorias e Tags */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Organização</h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text)' }}>
                  Categorias
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-input p-4" style={{ borderColor: 'var(--border)' }}>
                  {categories.length === 0 ? (
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>Nenhuma categoria cadastrada</p>
                  ) : (
                    categories.map((cat) => (
                      <label key={cat.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.categorias.includes(cat.slug)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                categorias: [...formData.categorias, cat.slug]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                categorias: formData.categorias.filter(c => c !== cat.slug)
                              });
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        <span className="text-sm" style={{ color: 'var(--text)' }}>{cat.nome}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
              <Input
                label="Tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="ex: decorativo, mesa, escritório"
                hint="Separadas por vírgula"
              />
            </div>
          </CardContent>
        </Card>

        {/* Seção 6: Links e Integrações */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Links e Integrações</h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <Input
              label="Link Mercado Livre"
              type="url"
              value={formData.linkMercadoLivre}
              onChange={(e) => setFormData({ ...formData, linkMercadoLivre: e.target.value })}
              placeholder="https://produto.mercadolivre.com.br/..."
              hint="Link direto para o produto no Mercado Livre"
            />
            <Textarea
              label="Template WhatsApp (opcional)"
              value={formData.mensagemWhatsAppTemplate}
              onChange={(e) => setFormData({ ...formData, mensagemWhatsAppTemplate: e.target.value })}
              rows="3"
              placeholder="Deixe vazio para usar o template padrão"
              hint="Use {NOME} e {CIDADE} como variáveis"
            />
          </CardContent>
        </Card>

        {/* Seção 7: História/Caso de Uso */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>História / Caso de Uso</h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <Input
              label="Título"
              value={formData.historiaTitulo}
              onChange={(e) => setFormData({ ...formData, historiaTitulo: e.target.value })}
              placeholder="Onde fica incrível?"
            />
            <Textarea
              label="Texto"
              value={formData.historiaTexto}
              onChange={(e) => setFormData({ ...formData, historiaTexto: e.target.value })}
              rows="5"
              hint="Conte onde e como o produto pode ser usado"
            />
          </CardContent>
        </Card>

        {/* Seção 8: Mídias */}
        {id && id !== 'undefined' && id !== 'novo' && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Mídias</h2>
            </CardHeader>
            <CardContent>
              <MediaUploader
                productId={id}
                media={media}
                onMediaChange={setMedia}
              />
            </CardContent>
          </Card>
        )}
        {isNew && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Mídias</h2>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8" style={{ color: 'var(--text-2)' }}>
                <p className="mb-2">Salve o produto primeiro para adicionar mídias</p>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  Após salvar, você será redirecionado para a página de edição onde poderá fazer upload de imagens e vídeos.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sticky Actions Bar */}
        <div
          ref={actionsRef}
          className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white py-4 px-4 sm:px-6 lg:px-8"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="container mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-end gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/admin/produtos')}
              leftIcon={<FaTimes />}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={saving}
              leftIcon={<FaSave />}
            >
              {saving ? 'Salvando...' : 'Salvar Produto'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
