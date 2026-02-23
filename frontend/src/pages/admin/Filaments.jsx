import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { toast } from 'react-hot-toast';
import { cn } from '../../lib/utils';

export default function Filaments() {
    const [filaments, setFilaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentFilament, setCurrentFilament] = useState(null);
    const [formData, setFormData] = useState({
        nome: '',
        cor: '',
        pesoTotal: 1000,
        custoPorGrama: 0.15,
        precoPago: 150,
        pesoCarretel: 1000,
        quantidadeCarreteis: 1,
        status: 'Disponível'
    });

    useEffect(() => {
        fetchFilaments();
    }, []);

    const fetchFilaments = async () => {
        try {
            const response = await api.get('/filaments');
            setFilaments(response.data);
        } catch (error) {
            toast.error('Erro ao carregar filamentos');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentFilament) {
                await api.put(`/filaments/${currentFilament.id}`, formData);
                toast.success('Filamento atualizado com sucesso');
            } else {
                await api.post('/filaments', formData);
                toast.success('Filamento adicionado com sucesso');
            }
            setIsModalOpen(false);
            fetchFilaments();
        } catch (error) {
            toast.error('Erro ao salvar filamento');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este filamento?')) {
            try {
                await api.delete(`/filaments/${id}`);
                toast.success('Filamento excluído com sucesso');
                fetchFilaments();
            } catch (error) {
                toast.error('Erro ao excluir filamento');
            }
        }
    };

    const openModal = (filament = null) => {
        if (filament) {
            setCurrentFilament(filament);
            setFormData({
                nome: filament.nome,
                cor: filament.cor || '',
                pesoTotal: filament.pesoTotal,
                custoPorGrama: filament.custoPorGrama,
                precoPago: filament.precoPago || (filament.custoPorGrama * filament.pesoTotal),
                pesoCarretel: filament.pesoCarretel || filament.pesoTotal,
                quantidadeCarreteis: filament.quantidadeCarreteis || 1,
                status: filament.status
            });
        } else {
            setCurrentFilament(null);
            setFormData({
                nome: '',
                cor: '',
                pesoTotal: 1000,
                custoPorGrama: 0.15,
                precoPago: 150,
                pesoCarretel: 1000,
                quantidadeCarreteis: 1,
                status: 'Disponível'
            });
        }
        setIsModalOpen(true);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Disponível': return 'bg-green-100 text-green-800';
            case 'Acabando': return 'bg-yellow-100 text-yellow-800';
            case 'Esgotado': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <FaSpinner className="animate-spin text-4xl text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold font-heading">Filamentos e Materiais</h1>
                <Button onClick={() => openModal()} className="flex items-center gap-2">
                    <FaPlus /> Novo Filamento
                </Button>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="p-4 font-bold text-gray-400 text-xs uppercase tracking-wider">Material</th>
                                <th className="p-4 font-bold text-gray-400 text-xs uppercase tracking-wider">Cor</th>
                                <th className="p-4 font-bold text-gray-400 text-xs uppercase tracking-wider">Estoque</th>
                                <th className="p-4 font-bold text-gray-400 text-xs uppercase tracking-wider">Custo/g</th>
                                <th className="p-4 font-bold text-gray-400 text-xs uppercase tracking-wider text-center">Status</th>
                                <th className="p-4 font-bold text-gray-400 text-xs uppercase tracking-wider text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filaments.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">
                                        Nenhum filamento cadastrado.
                                    </td>
                                </tr>
                            ) : (
                                filaments.map((filament) => {
                                    const pesoRestante = Math.max(0, filament.pesoTotal - filament.pesoUsado);
                                    const capacidade = (filament.pesoCarretel || filament.pesoTotal) * (filament.quantidadeCarreteis || 1);
                                    const percentualRestante = Math.min(100, Math.max(0, (pesoRestante / capacidade) * 100)).toFixed(1);
                                    return (
                                        <tr key={filament.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4 font-semibold text-gray-700">{filament.nome}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    {filament.cor && (
                                                        <div
                                                            className="w-4 h-4 rounded-full border border-gray-200 shadow-sm"
                                                            style={{ backgroundColor: filament.cor }}
                                                        ></div>
                                                    )}
                                                    <span className="text-sm text-gray-600">{filament.cor || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1.5 min-w-[160px]">
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-sm font-bold text-gray-700">
                                                            {pesoRestante.toFixed(0)}g
                                                        </span>
                                                        <span className="text-[10px] font-bold text-gray-400 tracking-tight uppercase">
                                                            {percentualRestante}%
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                        <div
                                                            className={cn(
                                                                "h-full rounded-full transition-all duration-500",
                                                                Number(percentualRestante) < 20 ? "bg-danger" : "bg-primary-500"
                                                            )}
                                                            style={{ width: `${percentualRestante}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="flex justify-between items-center text-[10px] text-gray-400 font-medium">
                                                        <span>Capacidade: {capacidade}g</span>
                                                        {filament.quantidadeCarreteis > 1 && (
                                                            <span className="bg-primary-50 text-primary-600 px-1.5 py-0.5 rounded-full font-bold">
                                                                {filament.quantidadeCarreteis} unidades
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-gray-700">R$ {filament.custoPorGrama.toFixed(2)}</span>
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">R$ {(filament.custoPorGrama * 1000).toFixed(0)} / kg</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(filament.status)}`}>
                                                    {filament.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => openModal(filament)}
                                                        className="p-2 text-primary-500 hover:bg-primary-50 rounded-xl transition-colors"
                                                        title="Editar"
                                                    >
                                                        <FaEdit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(filament.id)}
                                                        className="p-2 text-danger hover:bg-danger-soft rounded-xl transition-colors"
                                                        title="Excluir"
                                                    >
                                                        <FaTrash size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden space-y-4">
                {filaments.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 bg-white rounded-3xl border border-dashed border-gray-200">
                        Nenhum filamento cadastrado.
                    </div>
                ) : (
                    filaments.map((filament) => {
                        const pesoRestante = Math.max(0, filament.pesoTotal - filament.pesoUsado);
                        const capacidade = (filament.pesoCarretel || filament.pesoTotal) * (filament.quantidadeCarreteis || 1);
                        const percentualRestante = Math.min(100, Math.max(0, (pesoRestante / capacidade) * 100)).toFixed(1);

                        return (
                            <div key={filament.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-3">
                                        {filament.cor && (
                                            <div
                                                className="w-10 h-10 rounded-2xl border border-gray-100 shadow-inner shrink-0"
                                                style={{ backgroundColor: filament.cor }}
                                            ></div>
                                        )}
                                        <div>
                                            <h3 className="font-bold text-gray-800 leading-tight">{filament.nome}</h3>
                                            <span className="text-xs text-gray-400 font-medium">{filament.cor || 'Sem cor definida'}</span>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusColor(filament.status)}`}>
                                        {filament.status}
                                    </span>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm font-extrabold text-gray-700">Stock</span>
                                        <span className="text-xs font-bold text-primary-500">{pesoRestante.toFixed(0)}g / {capacidade}g</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all duration-700",
                                                Number(percentualRestante) < 20 ? "bg-danger" : "bg-primary-500"
                                            )}
                                            style={{ width: `${percentualRestante}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                        <span>R$ {(filament.custoPorGrama * 1000).toFixed(0)}/kg</span>
                                        {filament.quantidadeCarreteis > 1 && <span>{filament.quantidadeCarreteis} carretéis</span>}
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2 border-t border-gray-50">
                                    <Button
                                        onClick={() => openModal(filament)}
                                        variant="secondary"
                                        className="flex-1 h-10 text-sm"
                                        leftIcon={<FaEdit size={14} />}
                                    >
                                        Editar
                                    </Button>
                                    <button
                                        onClick={() => handleDelete(filament.id)}
                                        className="p-3 text-danger bg-danger-soft rounded-2xl hover:brightness-95 transition-all"
                                    >
                                        <FaTrash size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentFilament ? 'Editar Filamento' : 'Novo Filamento'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Material/Nome"
                        required
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        placeholder="Ex: PLA Premium 3D Fila"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Cor</label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer p-0 overflow-hidden"
                                    value={formData.cor.startsWith('#') ? formData.cor : '#94a3b8'}
                                    onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                                />
                                <Input
                                    value={formData.cor}
                                    onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                                    placeholder="#Hex ou Nome"
                                    className="flex-1"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select
                                className="w-full px-4 py-2 bg-white border border-input rounded-input focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="Disponível">Disponível</option>
                                <option value="Acabando">Acabando</option>
                                <option value="Esgotado">Esgotado</option>
                            </select>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                        <h3 className="text-sm font-semibold text-gray-600">Calculadora de Custo (Opcional)</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Custo do Carretel (R$)"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.precoPago}
                                onChange={(e) => {
                                    const preco = Number(e.target.value);
                                    const custoG = formData.pesoCarretel > 0 ? (preco / formData.pesoCarretel) : 0;
                                    setFormData({ ...formData, precoPago: preco, custoPorGrama: Number(custoG.toFixed(4)) });
                                }}
                            />
                            <Input
                                label="Peso de 1 Carretel (g)"
                                type="number"
                                min="1"
                                value={formData.pesoCarretel}
                                onChange={(e) => {
                                    const peso = Number(e.target.value);
                                    const custoG = peso > 0 ? (formData.precoPago / peso) : 0;
                                    const nextState = {
                                        ...formData,
                                        pesoCarretel: peso,
                                        custoPorGrama: Number(custoG.toFixed(4))
                                    };
                                    if (!currentFilament) {
                                        nextState.pesoTotal = peso * formData.quantidadeCarreteis;
                                    }
                                    setFormData(nextState);
                                }}
                            />
                            <Input
                                label="Qtd de Carretéis"
                                type="number"
                                min="1"
                                value={formData.quantidadeCarreteis}
                                onChange={(e) => {
                                    const qtd = Number(e.target.value);
                                    const nextState = { ...formData, quantidadeCarreteis: qtd };
                                    if (!currentFilament) {
                                        nextState.pesoTotal = formData.pesoCarretel * qtd;
                                    }
                                    setFormData(nextState);
                                }}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Estoque Atual (g)"
                            type="number"
                            required
                            min="1"
                            step="1"
                            value={formData.pesoTotal}
                            onChange={(e) => setFormData({ ...formData, pesoTotal: Number(e.target.value) })}
                        />
                        <Input
                            label="Custo Final por Grama (R$)"
                            type="number"
                            required
                            min="0.0001"
                            step="0.0001"
                            value={formData.custoPorGrama}
                            onChange={(e) => setFormData({ ...formData, custoPorGrama: Number(e.target.value) })}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit">
                            Salvar
                        </Button>
                    </div>
                </form>
            </Modal>
        </div >
    );
}
