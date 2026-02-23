import { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ nome: '', slug: '', icone: '' });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, formData);
      } else {
        await api.post('/categories', formData);
      }
      setModalOpen(false);
      setEditingCategory(null);
      setFormData({ nome: '', slug: '', icone: '' });
      loadCategories();
    } catch (error) {
      alert('Erro ao salvar categoria');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ nome: category.nome, slug: category.slug, icone: category.icone || '' });
    setModalOpen(true);
  };

  const handleDelete = async (id, nome) => {
    if (!confirm(`Tem certeza que deseja excluir "${nome}"?`)) return;
    try {
      await api.delete(`/categories/${id}`);
      loadCategories();
    } catch (error) {
      alert('Erro ao excluir categoria');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>
            Categorias
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>
            Organize os produtos em categorias
          </p>
        </div>
        <Button
          leftIcon={<FaPlus />}
          onClick={() => {
            setEditingCategory(null);
            setFormData({ nome: '', slug: '', icone: '' });
            setModalOpen(true);
          }}
        >
          Nova Categoria
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <EmptyState
              icon="📁"
              title="Nenhuma categoria cadastrada"
              description="Comece criando sua primeira categoria."
              action={
                <Button
                  leftIcon={<FaPlus />}
                  onClick={() => {
                    setEditingCategory(null);
                    setFormData({ nome: '', slug: '', icone: '' });
                    setModalOpen(true);
                  }}
                >
                  Criar Categoria
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="hidden md:block">
            <Card className="rounded-3xl overflow-hidden border-none shadow-xl shadow-gray-200/50">
              <CardHeader className="bg-white border-b border-gray-50 px-8 py-6">
                <h2 className="text-xl font-extrabold text-gray-800">
                  {categories.length} {categories.length === 1 ? 'Categoria' : 'Categorias'}
                </h2>
              </CardHeader>
              <CardContent className="p-0 bg-white">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/30">
                      <TableHead className="py-5 px-8 font-bold text-gray-400 text-[11px] uppercase tracking-widest" style={{ width: '100px' }}>Ícone</TableHead>
                      <TableHead className="py-5 px-4 font-bold text-gray-400 text-[11px] uppercase tracking-widest">Nome da Categoria</TableHead>
                      <TableHead className="py-5 px-4 font-bold text-gray-400 text-[11px] uppercase tracking-widest">Slug / URL</TableHead>
                      <TableHead className="py-5 px-8 font-bold text-gray-400 text-[11px] uppercase tracking-widest text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id} className="hover:bg-primary-50/30 transition-colors border-b border-gray-50 last:border-0 group">
                        <TableCell className="py-4 px-8">
                          <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                            {category.icone || '📁'}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-4 font-bold text-gray-800 text-base">{category.nome}</TableCell>
                        <TableCell className="py-4 px-4">
                          <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 italic">
                            {category.slug}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 px-8 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(category)}
                              className="p-2.5 text-primary-500 bg-primary-50 hover:bg-primary-500 hover:text-white rounded-xl transition-all shadow-sm"
                              title="Editar"
                            >
                              <FaEdit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(category.id, category.nome)}
                              className="p-2.5 text-danger bg-danger-soft hover:bg-danger hover:text-white rounded-xl transition-all shadow-sm"
                              aria-label="Excluir"
                            >
                              <FaTrash size={16} />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div className="md:hidden grid grid-cols-1 gap-4">
            {categories.map((category) => (
              <div key={category.id} className="bg-white rounded-[2.5rem] p-5 shadow-xl shadow-gray-200/30 border border-gray-50 flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center text-3xl shadow-inner border border-gray-100 shrink-0">
                  {category.icone || '📁'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-gray-800 text-lg leading-tight truncate uppercase tracking-tight">{category.nome}</h3>
                  <p className="text-[10px] font-bold text-gray-400 mt-0.5 truncate italic">/{category.slug}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-3 bg-primary-50 text-primary-600 rounded-2xl active:scale-90 transition-all"
                  >
                    <FaEdit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id, category.nome)}
                    className="p-3 bg-danger-soft text-danger rounded-2xl active:scale-90 transition-all"
                  >
                    <FaTrash size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingCategory(null);
          setFormData({ nome: '', slug: '', icone: '' });
        }}
        title={editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Nome"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            required
          />
          <Input
            label="Slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="Auto-gerado do nome"
            hint="URL amigável (ex: decoracao)"
          />
          <Input
            label="Ícone (emoji)"
            value={formData.icone}
            onChange={(e) => setFormData({ ...formData, icone: e.target.value })}
            placeholder="ex: 🎨"
            hint="Emoji que aparecerá nos cards de categoria"
          />
          <div className="flex gap-4 justify-end pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setModalOpen(false);
                setEditingCategory(null);
                setFormData({ nome: '', slug: '', icone: '' });
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">
              Salvar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
