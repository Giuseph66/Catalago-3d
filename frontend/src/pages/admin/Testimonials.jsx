import { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaPlus, FaEdit, FaTrash, FaStar } from 'react-icons/fa';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    cidade: '',
    texto: '',
    nota: '',
    fotoUrl: '',
    produtoId: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [testimonialsRes, productsRes] = await Promise.all([
        api.get('/testimonials'),
        api.get('/products?limit=100')
      ]);
      setTestimonials(testimonialsRes.data);
      setProducts(productsRes.data.products || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        nota: formData.nota ? parseInt(formData.nota) : null,
        produtoId: formData.produtoId || null
      };
      
      if (editingTestimonial) {
        await api.put(`/testimonials/${editingTestimonial.id}`, data);
      } else {
        await api.post('/testimonials', data);
      }
      setModalOpen(false);
      setEditingTestimonial(null);
      setFormData({ nome: '', cidade: '', texto: '', nota: '', fotoUrl: '', produtoId: '' });
      loadData();
    } catch (error) {
      alert('Erro ao salvar depoimento');
    }
  };

  const handleEdit = (testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      nome: testimonial.nome,
      cidade: testimonial.cidade || '',
      texto: testimonial.texto,
      nota: testimonial.nota || '',
      fotoUrl: testimonial.fotoUrl || '',
      produtoId: testimonial.produtoId || ''
    });
    setModalOpen(true);
  };

  const handleDelete = async (id, nome) => {
    if (!confirm(`Tem certeza que deseja excluir o depoimento de "${nome}"?`)) return;
    try {
      await api.delete(`/testimonials/${id}`);
      loadData();
    } catch (error) {
      alert('Erro ao excluir depoimento');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>
            Depoimentos
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>
            Gerencie os depoimentos dos clientes
          </p>
        </div>
        <Button
          leftIcon={<FaPlus />}
          onClick={() => {
            setEditingTestimonial(null);
            setFormData({ nome: '', cidade: '', texto: '', nota: '', fotoUrl: '', produtoId: '' });
            setModalOpen(true);
          }}
        >
          Novo Depoimento
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
      ) : testimonials.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <EmptyState
              icon="💬"
              title="Nenhum depoimento cadastrado"
              description="Comece adicionando depoimentos dos seus clientes."
              action={
                <Button
                  leftIcon={<FaPlus />}
                  onClick={() => {
                    setEditingTestimonial(null);
                    setFormData({ nome: '', cidade: '', texto: '', nota: '', fotoUrl: '', produtoId: '' });
                    setModalOpen(true);
                  }}
                >
                  Criar Depoimento
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
              {testimonials.length} {testimonials.length === 1 ? 'depoimento' : 'depoimentos'}
            </h2>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead className="max-w-md">Texto</TableHead>
                  <TableHead className="w-24">Nota</TableHead>
                  <TableHead className="w-24 text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testimonials.map((testimonial) => (
                  <TableRow key={testimonial.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {testimonial.fotoUrl && (
                          <img
                            src={testimonial.fotoUrl}
                            alt={testimonial.nome}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        )}
                        <span className="font-medium" style={{ color: 'var(--text)' }}>
                          {testimonial.nome}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm" style={{ color: 'var(--text-2)' }}>
                        {testimonial.cidade || '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm line-clamp-2" style={{ color: 'var(--text-2)' }}>
                        {testimonial.texto}
                      </p>
                    </TableCell>
                    <TableCell>
                      {testimonial.nota ? (
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <FaStar
                              key={i}
                              size={14}
                              style={{ color: i < testimonial.nota ? 'var(--warning)' : '#CBD5E1' }}
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm" style={{ color: 'var(--muted)' }}>—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2"
                          onClick={() => handleEdit(testimonial)}
                          aria-label="Editar"
                        >
                          <FaEdit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2 text-danger hover:bg-danger-soft"
                          onClick={() => handleDelete(testimonial.id, testimonial.nome)}
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
          setEditingTestimonial(null);
          setFormData({ nome: '', cidade: '', texto: '', nota: '', fotoUrl: '', produtoId: '' });
        }}
        title={editingTestimonial ? 'Editar Depoimento' : 'Novo Depoimento'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Nome"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            required
          />
          <Input
            label="Cidade"
            value={formData.cidade}
            onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
          />
          <Textarea
            label="Texto do Depoimento"
            value={formData.texto}
            onChange={(e) => setFormData({ ...formData, texto: e.target.value })}
            required
            rows="4"
          />
          <Input
            label="Nota (1-5)"
            type="number"
            value={formData.nota}
            onChange={(e) => setFormData({ ...formData, nota: e.target.value })}
            min="1"
            max="5"
            hint="Avaliação de 1 a 5 estrelas"
          />
          <Input
            label="Foto URL"
            type="url"
            value={formData.fotoUrl}
            onChange={(e) => setFormData({ ...formData, fotoUrl: e.target.value })}
            placeholder="https://..."
          />
          <Select
            label="Produto Relacionado"
            value={formData.produtoId}
            onChange={(e) => setFormData({ ...formData, produtoId: e.target.value })}
          >
            <option value="">Nenhum</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.nome}
              </option>
            ))}
          </Select>
          <div className="flex gap-4 justify-end pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setModalOpen(false);
                setEditingTestimonial(null);
                setFormData({ nome: '', cidade: '', texto: '', nota: '', fotoUrl: '', produtoId: '' });
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
