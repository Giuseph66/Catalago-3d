import { useEffect, useMemo, useState } from 'react';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { Switch } from '../../components/ui/Switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { cn } from '../../lib/utils';

const initialFormData = {
  nome: '',
  email: '',
  password: '',
  confirmPassword: '',
  isActive: true,
};

const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString('pt-BR');
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const { user: authUser } = useAuth();

  const isEditing = useMemo(() => Boolean(editingUser), [editingUser]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data || []);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);
    setFormData(initialFormData);
    setError('');
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData(initialFormData);
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (selectedUser) => {
    setEditingUser(selectedUser);
    setFormData({
      nome: selectedUser.nome || '',
      email: selectedUser.email || '',
      password: '',
      confirmPassword: '',
      isActive: selectedUser.isActive,
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (formData.password && formData.password !== formData.confirmPassword) {
        setError('As senhas não conferem');
        setSaving(false);
        return;
      }

      if (isEditing) {
        const payload = {
          nome: formData.nome,
          email: formData.email,
          isActive: formData.isActive,
        };

        if (formData.password) {
          payload.password = formData.password;
        }

        await api.put(`/auth/users/${editingUser.id}`, payload);
        setFeedback('Usuário atualizado com sucesso');
      } else {
        await api.post('/auth/register', {
          nome: formData.nome,
          email: formData.email,
          password: formData.password,
        });
        setFeedback('Usuário criado com sucesso');
      }

      closeModal();
      await loadUsers();
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
        requestError.response?.data?.errors?.[0]?.msg ||
        'Erro ao salvar usuário'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (selectedUser) => {
    if (!window.confirm(`Tem certeza que deseja excluir "${selectedUser.email}"?`)) return;

    try {
      await api.delete(`/auth/users/${selectedUser.id}`);
      setFeedback('Usuário excluído com sucesso');
      await loadUsers();
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Erro ao excluir usuário');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>
            Usuários
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>
            Gerencie os acessos ao painel administrativo
          </p>
        </div>
        <Button leftIcon={<FaPlus />} onClick={openCreateModal}>
          Novo Usuário
        </Button>
      </div>

      {feedback && (
        <div
          className="mb-6 px-4 py-3 rounded-input text-sm"
          style={{
            backgroundColor: 'var(--success-soft)',
            color: 'var(--success)',
            border: '1px solid var(--success)',
          }}
        >
          {feedback}
        </div>
      )}

      {error && !modalOpen && (
        <div
          className="mb-6 px-4 py-3 rounded-input text-sm"
          style={{
            backgroundColor: 'var(--danger-soft)',
            color: 'var(--danger)',
            border: '1px solid var(--danger)',
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <Card>
          <CardContent className="p-6 space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : users.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <EmptyState
              icon="👤"
              title="Nenhum usuário cadastrado"
              description="Crie o primeiro usuário para acessar o painel."
              action={
                <Button leftIcon={<FaPlus />} onClick={openCreateModal}>
                  Criar Usuário
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
                  {users.length} {users.length === 1 ? 'Usuário' : 'Usuários'}
                </h2>
              </CardHeader>
              <CardContent className="p-0 bg-white">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/30">
                      <TableHead className="py-5 px-8 font-bold text-gray-400 text-[11px] uppercase tracking-widest">Usuário</TableHead>
                      <TableHead className="py-5 px-4 font-bold text-gray-400 text-[11px] uppercase tracking-widest">Email</TableHead>
                      <TableHead className="py-5 px-4 font-bold text-gray-400 text-[11px] uppercase tracking-widest">Status / Acesso</TableHead>
                      <TableHead className="py-5 px-4 font-bold text-gray-400 text-[11px] uppercase tracking-widest">Criado em</TableHead>
                      <TableHead className="py-5 px-8 font-bold text-gray-400 text-[11px] uppercase tracking-widest text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((row) => {
                      const isCurrentUser = row.id === authUser?.id;
                      return (
                        <TableRow key={row.id} className="hover:bg-primary-50/30 transition-colors border-b border-gray-50 last:border-0 group">
                          <TableCell className="py-4 px-8">
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-800 text-base group-hover:text-primary-600 transition-colors">
                                {row.nome || 'Sem nome'}
                              </span>
                              {isCurrentUser && (
                                <span className="text-[9px] font-black uppercase tracking-widest text-primary-500 mt-0.5">Sua Conta</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-4 font-medium text-gray-500">{row.email}</TableCell>
                          <TableCell className="py-4 px-4">
                            <span
                              className={cn(
                                "text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider",
                                row.isActive
                                  ? "bg-green-50 text-green-600 border border-green-100"
                                  : "bg-danger-soft text-danger border border-red-100"
                              )}
                            >
                              {row.isActive ? 'Ativo' : 'Inativo'}
                            </span>
                          </TableCell>
                          <TableCell className="py-4 px-4 text-xs font-bold text-gray-400 italic">
                            {formatDateTime(row.createdAt)}
                          </TableCell>
                          <TableCell className="py-4 px-8 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditModal(row)}
                                className="p-2.5 text-primary-500 bg-primary-50 hover:bg-primary-500 hover:text-white rounded-xl transition-all shadow-sm"
                                title="Editar"
                              >
                                <FaEdit size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(row)}
                                className="p-2.5 text-danger bg-danger-soft hover:bg-danger hover:text-white rounded-xl transition-all shadow-sm disabled:opacity-20"
                                aria-label="Excluir"
                                disabled={isCurrentUser}
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

          <div className="md:hidden grid grid-cols-1 gap-4">
            {users.map((row) => {
              const isCurrentUser = row.id === authUser?.id;
              return (
                <div key={row.id} className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-gray-200/30 border border-gray-50 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-gray-800 text-lg leading-tight uppercase tracking-tight flex items-center gap-2">
                        {row.nome || 'Sem nome'}
                        {isCurrentUser && <span className="w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />}
                      </h3>
                      <p className="text-sm font-bold text-gray-400 italic">{row.email}</p>
                    </div>
                    <span
                      className={cn(
                        "text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest",
                        row.isActive ? "bg-green-50 text-green-600" : "bg-danger-soft text-danger"
                      )}
                    >
                      {row.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                    <span className="text-[10px] font-bold text-gray-300 uppercase italic">{formatDateTime(row.createdAt)}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(row)}
                        className="p-3 bg-primary-50 text-primary-600 rounded-2xl active:scale-90 transition-all"
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(row)}
                        disabled={isCurrentUser}
                        className="p-3 bg-danger-soft text-danger rounded-2xl active:scale-90 transition-all disabled:opacity-20"
                      >
                        <FaTrash size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={isEditing ? 'Editar Usuário' : 'Novo Usuário'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div
              className="px-4 py-3 rounded-input text-sm"
              style={{
                backgroundColor: 'var(--danger-soft)',
                color: 'var(--danger)',
                border: '1px solid var(--danger)',
              }}
              role="alert"
            >
              {error}
            </div>
          )}

          <Input
            label="Nome"
            value={formData.nome}
            onChange={(event) => setFormData({ ...formData, nome: event.target.value })}
            required
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(event) => setFormData({ ...formData, email: event.target.value })}
            required
          />

          <Input
            label={isEditing ? 'Nova senha (opcional)' : 'Senha'}
            type="password"
            value={formData.password}
            onChange={(event) => setFormData({ ...formData, password: event.target.value })}
            required={!isEditing}
            hint="Mínimo de 6 caracteres"
          />

          <Input
            label={isEditing ? 'Confirmar nova senha' : 'Confirmar senha'}
            type="password"
            value={formData.confirmPassword}
            onChange={(event) => setFormData({ ...formData, confirmPassword: event.target.value })}
            required={!isEditing || Boolean(formData.password)}
          />

          {isEditing && (
            <Switch
              checked={formData.isActive}
              onChange={(checked) => setFormData({ ...formData, isActive: checked })}
              label="Usuário ativo"
              hint="Usuários inativos não conseguem fazer login."
            />
          )}

          <div className="flex gap-4 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={closeModal} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving} disabled={saving}>
              {isEditing ? 'Salvar alterações' : 'Criar usuário'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
