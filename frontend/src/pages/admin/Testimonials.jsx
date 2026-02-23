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
import { cn } from '../../lib/utils';

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
        <div className="space-y-4">
          <div className="hidden md:block">
            <Card className="rounded-3xl overflow-hidden border-none shadow-xl shadow-gray-200/50">
              <CardHeader className="bg-white border-b border-gray-50 px-8 py-6">
                <h2 className="text-xl font-extrabold text-gray-800">
                  {testimonials.length} {testimonials.length === 1 ? 'Depoimento' : 'Depoimentos'}
                </h2>
              </CardHeader>
              <CardContent className="p-0 bg-white">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/30">
                      <TableHead className="py-5 px-8 font-bold text-gray-400 text-[11px] uppercase tracking-widest">Cliente</TableHead>
                      <TableHead className="py-5 px-4 font-bold text-gray-400 text-[11px] uppercase tracking-widest">Localização</TableHead>
                      <TableHead className="py-5 px-4 font-bold text-gray-400 text-[11px] uppercase tracking-widest">Depoimento</TableHead>
                      <TableHead className="py-5 px-4 font-bold text-gray-400 text-[11px] uppercase tracking-widest">Nota</TableHead>
                      <TableHead className="py-5 px-8 font-bold text-gray-400 text-[11px] uppercase tracking-widest text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testimonials.map((testimonial) => (
                      <TableRow key={testimonial.id} className="hover:bg-primary-50/30 transition-colors border-b border-gray-50 last:border-0 group">
                        <TableCell className="py-4 px-8">
                          <div className="flex items-center gap-3">
                            {testimonial.fotoUrl ? (
                              <img
                                src={testimonial.fotoUrl}
                                alt={testimonial.nome}
                                className="w-10 h-10 rounded-full object-cover border-2 border-primary-50 group-hover:scale-110 transition-transform"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold border-2 border-white shadow-sm">
                                {testimonial.nome.charAt(0)}
                              </div>
                            )}
                            <span className="font-bold text-gray-800 text-base">{testimonial.nome}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-4">
                          <span className="text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 uppercase tracking-tighter">
                            {testimonial.cidade || 'Não informada'}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 px-4">
                          <p className="text-sm font-medium text-gray-500 line-clamp-2 max-w-xs italic group-hover:text-gray-700 transition-colors">
                            "{testimonial.texto}"
                          </p>
                        </TableCell>
                        <TableCell className="py-4 px-4">
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <FaStar
                                key={i}
                                size={12}
                                className={i < (testimonial.nota || 0) ? "text-orange-400" : "text-gray-200"}
                              />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-8 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(testimonial)}
                              className="p-2.5 text-primary-500 bg-primary-50 hover:bg-primary-500 hover:text-white rounded-xl transition-all shadow-sm"
                              title="Editar"
                            >
                              <FaEdit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(testimonial.id, testimonial.nome)}
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
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-gray-200/30 border border-gray-50 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {testimonial.fotoUrl ? (
                      <img
                        src={testimonial.fotoUrl}
                        alt={testimonial.nome}
                        className="w-12 h-12 rounded-full object-cover border-2 border-primary-50"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold border-2 border-white shadow-inner">
                        {testimonial.nome.charAt(0)}
                      </div>
                    )}
                    <div className="space-y-0.5">
                      <h3 className="font-extrabold text-gray-800 text-lg leading-none uppercase tracking-tight">{testimonial.nome}</h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{testimonial.cidade || 'Global'}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <FaStar
                          key={i}
                          size={10}
                          className={i < (testimonial.nota || 0) ? "text-orange-400" : "text-gray-100"}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50/50 rounded-3xl p-4 border border-gray-100/50 relative">
                  <span className="absolute -top-2 -left-1 text-4xl text-primary-200/50 font-serif leading-none">“</span>
                  <p className="text-sm font-medium text-gray-600 leading-relaxed italic relative z-10">
                    {testimonial.texto}
                  </p>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleEdit(testimonial)}
                    className="flex-1 bg-primary-500 text-white font-black h-12 rounded-2xl shadow-lg shadow-primary-500/30 active:scale-95 transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <FaEdit /> Editar
                  </button>
                  <button
                    onClick={() => handleDelete(testimonial.id, testimonial.nome)}
                    className="p-3 bg-danger-soft text-danger rounded-2xl active:scale-90 transition-all font-bold"
                  >
                    <FaTrash size={18} />
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
