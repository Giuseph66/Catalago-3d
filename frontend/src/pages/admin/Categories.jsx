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
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
              {categories.length} {categories.length === 1 ? 'categoria' : 'categorias'}
            </h2>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead style={{ width: '80px' }}>Ícone</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead style={{ width: '100px' }} className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <span className="text-2xl">{category.icone || '—'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium" style={{ color: 'var(--text)' }}>
                        {category.nome}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm" style={{ color: 'var(--text-2)' }}>
                        {category.slug}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2"
                          onClick={() => handleEdit(category)}
                          aria-label="Editar"
                        >
                          <FaEdit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2 text-danger hover:bg-danger-soft"
                          onClick={() => handleDelete(category.id, category.nome)}
                          aria-label="Excluir"
                        >
                          <FaTrash size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
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
