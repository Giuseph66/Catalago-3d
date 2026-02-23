import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { FaPlus, FaEdit, FaTrash, FaImage, FaSearch } from 'react-icons/fa';
import { formatPrice, normalizeMediaUrl } from '../../utils/formatters';
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
        <div className="space-y-4">
          <div className="hidden md:block">
            <Card className="rounded-3xl overflow-hidden border-none shadow-xl shadow-gray-200/50">
              <CardHeader className="bg-white border-b border-gray-50 px-8 py-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-extrabold text-gray-800">
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'Produto' : 'Produtos'}
                  </h2>
                </div>
              </CardHeader>
              <CardContent className="p-0 bg-white">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/30">
                      <TableHead className="py-5 px-8 font-bold text-gray-400 text-[11px] uppercase tracking-widest" style={{ width: '130px' }}>Imagem</TableHead>
                      <TableHead className="py-5 px-4 font-bold text-gray-400 text-[11px] uppercase tracking-widest">Produto / Detalhes</TableHead>
                      <TableHead className="py-5 px-4 font-bold text-gray-400 text-[11px] uppercase tracking-widest" style={{ width: '140px' }}>Preço / Peso</TableHead>
                      <TableHead className="py-5 px-4 font-bold text-gray-400 text-[11px] uppercase tracking-widest" style={{ width: '160px' }}>Status</TableHead>
                      <TableHead className="py-5 px-8 font-bold text-gray-400 text-[11px] uppercase tracking-widest text-right">Controle</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => {
                      const capa = product.media?.find(m => m.isCapa) || product.media?.[0];
                      return (
                        <TableRow key={product.id} className="hover:bg-primary-50/30 transition-colors border-b border-gray-50 last:border-0 group">
                          <TableCell className="py-4 px-8">
                            <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-md group-hover:scale-105 transition-transform duration-300">
                              {capa ? (
                                <img
                                  src={normalizeMediaUrl(capa.url)}
                                  alt={product.nome}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                  <FaImage className="text-gray-300" size={24} />
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-800 text-base group-hover:text-primary-600 transition-colors">
                                  {product.nome}
                                </span>
                                {product.destaque && (
                                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse shadow-[0_0_8px_rgba(251,146,60,0.6)]" title="Destaque" />
                                )}
                              </div>
                              {product.descricaoCurta && (
                                <p className="text-xs text-gray-400 font-medium line-clamp-1 italic">
                                  {product.descricaoCurta}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-4">
                            <div className="flex flex-col">
                              <span className="text-lg font-black text-primary-600 tracking-tight">
                                {formatPrice(product.preco || 0)}
                              </span>
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                {product.peso}g peso bruto
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-4">
                            <button
                              onClick={() => handleToggleStatus(product)}
                              className="group/badge transition-transform active:scale-95"
                            >
                              <Badge
                                className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full shadow-sm group-hover/badge:shadow-md transition-all"
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
                          <TableCell className="py-4 px-8 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                to={`/admin/produtos/${product.id}`}
                                className="p-2.5 text-primary-500 bg-primary-50 hover:bg-primary-500 hover:text-white rounded-xl transition-all shadow-sm"
                                title="Editar"
                              >
                                <FaEdit size={16} />
                              </Link>
                              <button
                                onClick={() => handleDelete(product.id, product.nome)}
                                className="p-2.5 text-danger bg-danger-soft hover:bg-danger hover:text-white rounded-xl transition-all shadow-sm"
                                aria-label="Excluir"
                              >
                                <FaTrash size={16} />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Mobile Grid */}
          <div className="md:hidden grid grid-cols-1 gap-4">
            {filteredProducts.map((product) => {
              const capa = product.media?.find(m => m.isCapa) || product.media?.[0];
              return (
                <div key={product.id} className="bg-white rounded-[2.5rem] p-5 shadow-xl shadow-gray-200/30 border border-gray-50 space-y-4">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-lg shrink-0 border-2 border-white">
                      {capa ? (
                        <img
                          src={normalizeMediaUrl(capa.url)}
                          alt={product.nome}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <FaImage className="text-gray-300" size={32} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-extrabold text-gray-800 text-lg leading-tight uppercase tracking-tight">{product.nome}</h3>
                        {product.destaque && <span className="text-orange-500">★</span>}
                      </div>
                      <Badge
                        className="px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase rounded-lg"
                        variant={
                          product.status === PRODUCT_STATUS.PRONTA_ENTREGA
                            ? BADGE_VARIANTS.PRONTA_ENTREGA
                            : BADGE_VARIANTS.SOB_ENCOMENDA
                        }
                      >
                        {product.status === PRODUCT_STATUS.PRONTA_ENTREGA ? 'Pronta Entrega' : 'Sob Encomenda'}
                      </Badge>
                      <div className="flex items-baseline gap-1 pt-1">
                        <span className="text-xl font-black text-primary-600">{formatPrice(product.preco || 0)}</span>
                        <span className="text-[10px] font-bold text-gray-400">{product.peso}g</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-gray-50">
                    <Button
                      as={Link}
                      to={`/admin/produtos/${product.id}`}
                      variant="secondary"
                      className="flex-1 rounded-2xl h-11 text-sm font-bold"
                      leftIcon={<FaEdit />}
                    >
                      Editar
                    </Button>
                    <button
                      onClick={() => handleDelete(product.id, product.nome)}
                      className="p-3 bg-danger-soft text-danger rounded-2xl hover:brightness-95 transition-all"
                    >
                      <FaTrash size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
