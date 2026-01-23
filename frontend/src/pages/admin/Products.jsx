import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { FaPlus, FaEdit, FaTrash, FaImage, FaSearch } from 'react-icons/fa';
import { formatPrice } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { BADGE_VARIANTS, PRODUCT_STATUS } from '../../lib/constants';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await api.get('/products?limit=100');
      setProducts(res.data.products || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, nome) => {
    if (!confirm(`Tem certeza que deseja excluir "${nome}"?`)) return;

    try {
      await api.delete(`/products/${id}`);
      loadProducts();
    } catch (error) {
      alert('Erro ao excluir produto');
    }
  };

  const handleToggleStatus = async (product) => {
    const newStatus = product.status === PRODUCT_STATUS.PRONTA_ENTREGA
      ? PRODUCT_STATUS.SOB_ENCOMENDA
      : PRODUCT_STATUS.PRONTA_ENTREGA;

    try {
      await api.put(`/products/${product.id}`, {
        status: newStatus
      });
      setProducts(products.map(p =>
        p.id === product.id ? { ...p, status: newStatus } : p
      ));
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status do produto');
    }
  };

  const filteredProducts = products.filter(p =>
    !search ||
    p.nome.toLowerCase().includes(search.toLowerCase()) ||
    p.descricaoCurta?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>
            Produtos
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>
            Gerencie todos os produtos do catálogo
          </p>
        </div>
        <Button
          as={Link}
          to="/admin/produtos/novo"
          leftIcon={<FaPlus />}
        >
          Novo Produto
        </Button>
      </div>

      {/* Busca */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: 'var(--muted)' }} size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar produtos por nome ou descrição..."
              className="input-base pl-10 w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <EmptyState
              icon="📦"
              title={search ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}
              description={search ? "Tente ajustar sua busca." : "Comece criando seu primeiro produto."}
              action={
                !search && (
                  <Button as={Link} to="/admin/produtos/novo" leftIcon={<FaPlus />}>
                    Criar Produto
                  </Button>
                )
              }
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
                {filteredProducts.length} {filteredProducts.length === 1 ? 'produto' : 'produtos'}
              </h2>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead style={{ width: '115px' }}>Imagem</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead style={{ width: '120px' }}>Preço</TableHead>
                  <TableHead style={{ width: '150px' }}>Status</TableHead>
                  <TableHead style={{ width: '100px' }} className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const capa = product.media?.find(m => m.isCapa) || product.media?.[0];
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        {capa ? (
                          <img
                            src={capa.url}
                            alt={product.nome}
                            className="w-16 h-16 object-cover rounded-input"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-input flex items-center justify-center" style={{ backgroundColor: '#F1F5F9' }}>
                            <FaImage style={{ color: 'var(--muted)' }} size={20} />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {product.destaque && (
                            <span style={{ color: 'var(--warning)' }} title="Produto em destaque">★</span>
                          )}
                          <span className="font-medium" style={{ color: 'var(--text)' }}>
                            {product.nome}
                          </span>
                        </div>
                        {product.descricaoCurta && (
                          <p className="text-sm mt-1 line-clamp-1" style={{ color: 'var(--text-2)' }}>
                            {product.descricaoCurta}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold" style={{ color: 'var(--primary)' }}>
                          {formatPrice(product.preco || product.peso)}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--muted)' }}>
                          {product.peso}g
                        </div>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleToggleStatus(product)}
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                          title="Clique para alterar o status"
                        >
                          <Badge
                            variant={
                              product.status === PRODUCT_STATUS.PRONTA_ENTREGA
                                ? BADGE_VARIANTS.PRONTA_ENTREGA
                                : BADGE_VARIANTS.SOB_ENCOMENDA
                            }
                          >
                            {product.status === PRODUCT_STATUS.PRONTA_ENTREGA ? 'Pronta Entrega' : 'Sob Encomenda'}
                          </Badge>
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            as={Link}
                            to={`/admin/produtos/${product.id}`}
                            variant="ghost"
                            size="sm"
                            className="p-2"
                            aria-label="Editar"
                          >
                            <FaEdit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-2 text-danger hover:bg-danger-soft"
                            onClick={() => handleDelete(product.id, product.nome)}
                            aria-label="Excluir"
                          >
                            <FaTrash size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
