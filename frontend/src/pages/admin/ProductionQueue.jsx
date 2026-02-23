import { useEffect, useMemo, useState } from 'react';
import {
  FaArrowDown,
  FaArrowUp,
  FaCheck,
  FaEdit,
  FaExternalLinkAlt,
  FaPause,
  FaPlay,
  FaPlus,
  FaSpinner,
  FaStop,
  FaTrash,
  FaLayerGroup,
  FaEllipsisV,
  FaFilter,
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { cn } from '../../lib/utils';

const PRODUCTION_STATUS_OPTIONS = [
  { value: 'FILA', label: 'Na Fila' },
  { value: 'IMPRIMINDO', label: 'Imprimindo Agora' },
  { value: 'PAUSADO', label: 'Pausado' },
  { value: 'CONCLUIDO', label: 'Concluído' },
  { value: 'CANCELADO', label: 'Cancelado' },
];

const CUSTOMER_STAGE_OPTIONS = [
  { value: 'NOVO_PEDIDO', label: 'Novo Pedido' },
  { value: 'MODELAGEM', label: 'Sendo Modelado' },
  { value: 'EM_ANALISE', label: 'Em Análise' },
  { value: 'COTACAO', label: 'Cotação' },
  { value: 'VERIFICANDO_QUANTIDADE', label: 'Verificando Quantidade' },
  { value: 'AGUARDANDO_APROVACAO', label: 'Aguardando Aprovação' },
  { value: 'APROVADO_PARA_IMPRESSAO', label: 'Aprovado p/ Impressão' },
  { value: 'EM_PRODUCAO', label: 'Em Produção' },
  { value: 'FINALIZADO', label: 'Finalizado' },
  { value: 'ENTREGUE', label: 'Entregue' },
];

const initialFormData = {
  identificador: '',
  clienteNome: '',
  clienteContato: '',
  etapaCliente: 'NOVO_PEDIDO',
  produtoId: '',
  filamentoId: '',
  quantidadeTotal: 1,
  prioridade: 1,
  tempoEstimadoMinutos: '',
  observacoes: '',
  materials: [], // Support for multiple materials
};

const initialUpdateData = {
  status: 'FILA',
  etapaCliente: 'NOVO_PEDIDO',
  quantidadeImpressa: 0,
  quantidadeFalha: 0,
  clienteNome: '',
  clienteContato: '',
  observacoes: '',
};

const productionStatusStyles = {
  FILA: 'bg-gray-100 text-gray-800',
  IMPRIMINDO: 'bg-blue-100 text-blue-800',
  PAUSADO: 'bg-yellow-100 text-yellow-800',
  CONCLUIDO: 'bg-green-100 text-green-800',
  CANCELADO: 'bg-red-100 text-red-800',
};

const customerStageStyles = {
  NOVO_PEDIDO: 'bg-slate-100 text-slate-800',
  MODELAGEM: 'bg-indigo-100 text-indigo-800',
  EM_ANALISE: 'bg-violet-100 text-violet-800',
  COTACAO: 'bg-cyan-100 text-cyan-800',
  VERIFICANDO_QUANTIDADE: 'bg-orange-100 text-orange-800',
  AGUARDANDO_APROVACAO: 'bg-amber-100 text-amber-800',
  APROVADO_PARA_IMPRESSAO: 'bg-teal-100 text-teal-800',
  EM_PRODUCAO: 'bg-blue-100 text-blue-800',
  FINALIZADO: 'bg-green-100 text-green-800',
  ENTREGUE: 'bg-emerald-100 text-emerald-800',
};

const getCustomerStageLabel = (stage) =>
  CUSTOMER_STAGE_OPTIONS.find((option) => option.value === stage)?.label || stage;

const getProductionLabel = (status) =>
  PRODUCTION_STATUS_OPTIONS.find((option) => option.value === status)?.label || status;

const getProgress = (job) => {
  const success = Number(job.quantidadeImpressa || 0);
  const fail = Number(job.quantidadeFalha || 0);
  const total = Math.max(1, Number(job.quantidadeTotal || 0));
  const processed = success + fail;
  const completion = Math.min(100, (processed / total) * 100);
  const successRate = processed > 0 ? Math.round((success / processed) * 100) : 0;

  return { success, fail, total, processed, completion, successRate };
};

export default function ProductionQueue() {
  const [queue, setQueue] = useState([]);
  const [products, setProducts] = useState([]);
  const [filaments, setFilaments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  const [statusFilter, setStatusFilter] = useState('ATIVOS'); // 'ATIVOS', 'CONCLUIDO', 'CANCELADO', 'TODOS'
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);
  const [updateData, setUpdateData] = useState(initialUpdateData);

  useEffect(() => {
    fetchData();
  }, []);

  const filteredQueue = useMemo(() => {
    if (statusFilter === 'TODOS') return queue;
    if (statusFilter === 'ATIVOS') return queue.filter(job => !['CONCLUIDO', 'CANCELADO'].includes(job.status));
    return queue.filter(job => job.status === statusFilter);
  }, [queue, statusFilter]);

  const summary = useMemo(() => {
    const totalJobs = queue.length;
    const activeJobs = queue.filter((job) => ['FILA', 'IMPRIMINDO', 'PAUSADO'].includes(job.status)).length;
    const totalSuccess = queue.reduce((acc, job) => acc + Number(job.quantidadeImpressa || 0), 0);
    const totalFail = queue.reduce((acc, job) => acc + Number(job.quantidadeFalha || 0), 0);
    const completionAverage =
      totalJobs > 0
        ? Math.round(
          queue.reduce((acc, job) => acc + getProgress(job).completion, 0) / totalJobs
        )
        : 0;

    return { totalJobs, activeJobs, totalSuccess, totalFail, completionAverage };
  }, [queue]);

  const fetchData = async () => {
    try {
      const [queueRes, productsRes, filamentsRes] = await Promise.all([
        api.get('/queue'),
        api.get('/products'),
        api.get('/filaments'),
      ]);

      setQueue(queueRes.data || []);
      setProducts(productsRes.data.products || productsRes.data || []);
      setFilaments(filamentsRes.data || []);
    } catch {
      toast.error('Erro ao carregar dados da fila');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (event) => {
    event.preventDefault();

    try {
      const payload = {
        ...formData,
        produtoId: Number(formData.produtoId),
        filamentoId: formData.filamentoId ? Number(formData.filamentoId) : null,
        quantidadeTotal: Number(formData.quantidadeTotal),
        prioridade: Number(formData.prioridade),
        tempoEstimadoMinutos: formData.tempoEstimadoMinutos
          ? Number(formData.tempoEstimadoMinutos)
          : null,
      };

      await api.post('/queue', payload);
      toast.success('Tarefa adicionada à fila');
      setIsModalOpen(false);
      setFormData(initialFormData);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao adicionar tarefa');
    }
  };

  const handleUpdateSubmit = async (event) => {
    event.preventDefault();

    const success = Number(updateData.quantidadeImpressa);
    const fail = Number(updateData.quantidadeFalha);
    const total = Number(currentJob?.quantidadeTotal || 0);

    if (success + fail > total) {
      toast.error('Sucesso + Falha não pode passar da quantidade total.');
      return;
    }

    try {
      const finalPayload = {
        ...updateData,
        quantidadeImpressa: success,
        quantidadeFalha: fail,
      };

      // Auto-complete: if objective reached and status wasn't manually changed in this edit
      if (success >= total && updateData.status === currentJob.status && updateData.status !== 'CONCLUIDO') {
        finalPayload.status = 'CONCLUIDO';
      }

      await api.put(`/queue/${currentJob.id}`, finalPayload);
      toast.success('Tarefa atualizada com sucesso');
      setIsUpdateModalOpen(false);
      setCurrentJob(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao atualizar tarefa');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja remover esta tarefa da fila?')) return;

    try {
      await api.delete(`/queue/${id}`);
      toast.success('Tarefa removida com sucesso');
      fetchData();
    } catch {
      toast.error('Erro ao remover tarefa');
    }
  };

  const handleMove = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= queue.length) return;

    const nextQueue = [...queue];
    [nextQueue[index], nextQueue[targetIndex]] = [nextQueue[targetIndex], nextQueue[index]];
    setQueue(nextQueue);

    try {
      const orderData = nextQueue.map((job, i) => ({ id: job.id, posicao: i + 1 }));
      await api.put('/queue/reorder', { jobs: orderData });
      toast.success('Ordem atualizada');
    } catch {
      toast.error('Erro ao salvar nova ordem');
      fetchData();
    }
  };

  const addMaterialField = () => {
    setFormData({
      ...formData,
      materials: [...formData.materials, { filamentoId: '', pesoGasto: 0 }]
    });
  };

  const removeMaterialField = (index) => {
    const newMaterials = [...formData.materials];
    newMaterials.splice(index, 1);
    setFormData({ ...formData, materials: newMaterials });
  };

  const updateMaterialField = (index, field, value) => {
    const newMaterials = [...formData.materials];
    newMaterials[index][field] = value;
    setFormData({ ...formData, materials: newMaterials });
  };

  const openCreateModal = () => {
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const openUpdateModal = (job) => {
    setCurrentJob(job);
    setUpdateData({
      status: job.status || 'FILA',
      etapaCliente: job.etapaCliente || 'NOVO_PEDIDO',
      quantidadeImpressa: Number(job.quantidadeImpressa || 0),
      quantidadeFalha: Number(job.quantidadeFalha || 0),
      clienteNome: job.clienteNome || '',
      clienteContato: job.clienteContato || '',
      observacoes: job.observacoes || '',
    });
    setIsUpdateModalOpen(true);
  };

  const getProductionBadge = (status) => {
    const label = getProductionLabel(status);
    const style = productionStatusStyles[status] || 'bg-gray-100 text-gray-800';

    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold inline-flex items-center gap-1 ${style}`}>
        {status === 'IMPRIMINDO' && <FaPlay className="text-[10px]" />}
        {status === 'PAUSADO' && <FaPause className="text-[10px]" />}
        {status === 'CONCLUIDO' && <FaCheck className="text-[10px]" />}
        {status === 'CANCELADO' && <FaStop className="text-[10px]" />}
        {label}
      </span>
    );
  };

  const getCustomerStageBadge = (stage) => {
    const label = getCustomerStageLabel(stage);
    const style = customerStageStyles[stage] || 'bg-slate-100 text-slate-800';

    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold inline-flex items-center ${style}`}>
        {label}
      </span>
    );
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">Fila de Produção</h1>
          <p className="text-gray-500 text-sm mt-1">
            Gestão operacional por cliente e status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative group/filter">
            <Button variant="outline" className="flex items-center gap-2 h-11 px-3 sm:px-4 border-gray-200 min-w-[100px]">
              <FaFilter className="text-primary-400 shrink-0" size={14} />
              <span className="text-sm font-bold text-gray-600 truncate">
                {statusFilter === 'ATIVOS' ? 'Ativos' :
                  statusFilter === 'CONCLUIDO' ? 'Concluídos' :
                    statusFilter === 'CANCELADO' ? 'Cancelados' : 'Todos'}
              </span>
            </Button>
            <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 hidden group-hover/filter:block z-50 animate-in fade-in zoom-in duration-200">
              {[
                { label: 'Ativos', value: 'ATIVOS' },
                { label: 'Concluídos', value: 'CONCLUIDO' },
                { label: 'Cancelados', value: 'CANCELADO' },
                { label: 'Todos', value: 'TODOS' }
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={cn(
                    "w-full text-left px-4 py-2.5 text-sm font-bold transition-all",
                    statusFilter === opt.value ? "bg-primary-50 text-primary-600" : "text-gray-500 hover:bg-gray-50"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={openCreateModal} className="flex items-center gap-2 shadow-lg shadow-primary-500/20">
            <FaPlus /> Nova Tarefa
          </Button>
        </div>
      </div>

      <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Total de tarefas</p>
          <p className="text-2xl font-bold">{summary.totalJobs}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Em andamento</p>
          <p className="text-2xl font-bold text-blue-600">{summary.activeJobs}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Peças sucesso/falha</p>
          <p className="text-lg font-bold text-green-600">{summary.totalSuccess}</p>
          <p className="text-sm text-red-600">Falha: {summary.totalFail}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Progresso médio</p>
          <p className="text-2xl font-bold">{summary.completionAverage}%</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-50 overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-5 font-bold text-gray-400 text-[11px] uppercase tracking-widest">Job / Cliente</th>
                <th className="p-5 font-bold text-gray-400 text-[11px] uppercase tracking-widest">Peça / Materiais</th>
                <th className="p-5 font-bold text-gray-400 text-[11px] uppercase tracking-widest text-center">Status Cliente</th>
                <th className="p-5 font-bold text-gray-400 text-[11px] uppercase tracking-widest text-center">Produção</th>
                <th className="p-5 font-bold text-gray-400 text-[11px] uppercase tracking-widest">Progresso</th>
                <th className="p-5 font-bold text-gray-400 text-[11px] uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {queue.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-gray-400 font-medium">
                    A fila de produção está vazia.
                  </td>
                </tr>
              ) : (
                filteredQueue.map((job, index) => {
                  const progress = getProgress(job);
                  const isDone = job.status === 'CONCLUIDO' || job.status === 'CANCELADO';
                  const successWidth = Math.min(100, (progress.success / progress.total) * 100);
                  const failWidth = Math.min(100, (progress.fail / progress.total) * 100);

                  return (
                    <tr key={job.id} className={cn(
                      "group border-b border-gray-50 transition-all duration-300 hover:bg-primary-50/20",
                      isDone && "opacity-60 grayscale-[0.5]"
                    )}>
                      <td className="p-5">
                        <div className="flex flex-col">
                          <span className="font-black text-gray-800 tracking-tight group-hover:text-primary-600 transition-colors">
                            {job.identificador || `JOB-${job.id}`}
                          </span>
                          <span className="text-sm font-bold text-gray-500 mt-0.5">{job.clienteNome || 'Anônimo'}</span>
                          {job.clienteContato && (
                            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md mt-1.5 self-start font-bold uppercase tracking-tighter italic">
                              {job.clienteContato}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-5">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-700">{job.produtoNome}</span>
                            {job.produtoStlLink && (
                              <a
                                href={job.produtoStlLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-6 h-6 rounded-lg bg-primary-50 text-primary-500 flex items-center justify-center hover:bg-primary-500 hover:text-white transition-all shadow-sm"
                                title="Abrir STL"
                              >
                                <FaExternalLinkAlt size={10} />
                              </a>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1 mt-1">
                            {job.materials && job.materials.length > 0 ? (
                              job.materials.map((mat, i) => (
                                <div key={i} className="flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                                  <div className="w-2.5 h-2.5 rounded-full border border-gray-200" style={{ backgroundColor: mat.cor }} />
                                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                                    {mat.pesoGasto}g {mat.nome}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100 opacity-60">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter italic">
                                  {job.filamentoNome ? `${job.filamentoNome} (${job.filamentoCor})` : 'Padrão'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-5 text-center">
                        {getCustomerStageBadge(job.etapaCliente || 'NOVO_PEDIDO')}
                      </td>

                      <td className="p-5 text-center">
                        <div className="flex flex-col items-center gap-2">
                          {getProductionBadge(job.status)}
                          <div className="flex gap-2 text-[10px] font-black uppercase tracking-tighter">
                            <span className="text-gray-400">Objetivo: <span className="text-gray-700">{progress.total}</span></span>
                            <span className="text-green-500">Ok: {progress.success}</span>
                            <span className="text-danger">Erro: {progress.fail}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-5">
                        <div className="flex flex-col gap-1.5 min-w-[140px]">
                          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden flex shadow-inner">
                            <div
                              className="h-full bg-primary-500 transition-all duration-700 ease-out shadow-[0_0_8px_rgba(99,102,241,0.4)]"
                              style={{ width: `${successWidth}%` }}
                            />
                            <div
                              className="h-full bg-danger transition-all duration-700 ease-out"
                              style={{ width: `${failWidth}%` }}
                            />
                          </div>
                          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tighter text-gray-400">
                            <span>{progress.processed}/{progress.total} un</span>
                            <span className="text-primary-600 font-black">{Math.round(progress.completion)}% completado</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isDone && (
                            <div className="flex flex-col bg-gray-50 rounded-xl p-1">
                              <button
                                onClick={() => handleMove(index, -1)}
                                disabled={index === 0}
                                className="p-1.5 text-gray-400 hover:text-primary-500 transition-all disabled:opacity-20"
                                title="Priorizar"
                              >
                                <FaArrowUp size={12} />
                              </button>
                              <button
                                onClick={() => handleMove(index, 1)}
                                disabled={index === queue.length - 1}
                                className="p-1.5 text-gray-400 hover:text-primary-500 transition-all disabled:opacity-20"
                                title="Postergar"
                              >
                                <FaArrowDown size={12} />
                              </button>
                            </div>
                          )}
                          <button
                            onClick={() => openUpdateModal(job)}
                            className="p-3 text-primary-500 bg-primary-50 hover:bg-primary-500 hover:text-white rounded-2xl transition-all shadow-sm active:scale-95"
                            title="Atualizar Produção"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(job.id)}
                            className="p-3 text-danger bg-danger-soft hover:bg-danger hover:text-white rounded-2xl transition-all shadow-sm active:scale-95"
                            title="Remover"
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

      {/* Mobile Grid View */}
      <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredQueue.length === 0 ? (
          <div className="p-12 text-center text-gray-400 font-medium bg-white rounded-[2.5rem] border border-dashed border-gray-200 shadow-inner sm:col-span-2">
            A fila de produção está vazia.
          </div>
        ) : (
          filteredQueue.map((job, index) => {
            const progress = getProgress(job);
            const isDone = job.status === 'CONCLUIDO' || job.status === 'CANCELADO';
            const successWidth = Math.min(100, (progress.success / progress.total) * 100);
            const failWidth = Math.min(100, (progress.fail / progress.total) * 100);

            return (
              <div key={job.id} className={cn(
                "bg-white rounded-[2.5rem] p-6 shadow-xl border border-gray-50 space-y-5 transition-all duration-300",
                isDone && "opacity-70 grayscale-[0.3]"
              )}>
                <div className="flex justify-between items-start gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <h3 className="text-lg font-black text-gray-800 tracking-tight uppercase leading-none">
                      {job.identificador || `JOB-${job.id}`}
                    </h3>
                    <p className="text-sm font-bold text-primary-600">{job.clienteNome || 'Anônimo'}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Posição #{index + 1}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {getProductionBadge(job.status)}
                    {getCustomerStageBadge(job.etapaCliente)}
                  </div>
                </div>

                <div className="bg-gray-50/50 rounded-3xl p-4 border border-gray-100/50 space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-tight text-gray-500">
                    <span className="flex items-center gap-2">
                      <FaLayerGroup className="text-primary-400" />
                      {job.produtoNome}
                    </span>
                    {job.produtoStlLink && (
                      <a href={job.produtoStlLink} target="_blank" rel="noreferrer" className="text-primary-500">
                        Abrir STL
                      </a>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {job.materials && job.materials.length > 0 ? (
                      job.materials.map((mat, i) => (
                        <div key={i} className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-xl border border-gray-100 shadow-sm">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: mat.cor }} />
                          <span className="text-[10px] font-black text-gray-600 uppercase tracking-tighter">
                            {mat.pesoGasto}g {mat.nome}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-[10px] font-bold text-gray-400 italic">Material conforme cadastro do produto</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end px-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Progresso</span>
                    <span className="text-xs font-black text-gray-700 tracking-tighter">{progress.processed} de {progress.total} peças</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden flex shadow-inner border border-white">
                    <div className="h-full bg-primary-500 shadow-lg" style={{ width: `${successWidth}%` }} />
                    <div className="h-full bg-danger" style={{ width: `${failWidth}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] font-extrabold uppercase tracking-tighter px-1">
                    <span className="text-green-500">OK: {progress.success}</span>
                    <span className="text-primary-600">{Math.round(progress.completion)}%</span>
                    <span className="text-danger">Erro: {progress.fail}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  {!isDone && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleMove(index, -1)}
                        disabled={index === 0}
                        className="h-11 rounded-2xl bg-gray-50 border border-gray-100 text-gray-500 flex items-center justify-center disabled:opacity-30 active:scale-95 transition-all text-xs font-bold gap-2 uppercase tracking-widest"
                        title="Priorizar"
                      >
                        <FaArrowUp size={12} /> Priorizar
                      </button>
                      <button
                        onClick={() => handleMove(index, 1)}
                        disabled={index === queue.length - 1}
                        className="h-11 rounded-2xl bg-gray-50 border border-gray-100 text-gray-500 flex items-center justify-center disabled:opacity-30 active:scale-95 transition-all text-xs font-bold gap-2 uppercase tracking-widest"
                        title="Postergar"
                      >
                        <FaArrowDown size={12} /> Postergar
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openUpdateModal(job)}
                      className="flex-1 bg-primary-500 text-white font-black h-12 rounded-2xl shadow-lg shadow-primary-500/30 active:scale-95 transition-all text-xs uppercase tracking-wider"
                    >
                      Atualizar Produção
                    </button>
                    <button
                      onClick={() => handleDelete(job.id)}
                      className="w-12 h-12 flex items-center justify-center bg-danger-soft text-danger rounded-2xl active:scale-90 transition-all border border-danger/10"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Adicionar à Fila">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Identificador (opcional)"
              value={formData.identificador}
              onChange={(event) => setFormData({ ...formData, identificador: event.target.value })}
              hint="Se vazio, será gerado automaticamente."
            />
            <Input
              label="Cliente"
              value={formData.clienteNome}
              onChange={(event) => setFormData({ ...formData, clienteNome: event.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Contato"
              value={formData.clienteContato}
              onChange={(event) => setFormData({ ...formData, clienteContato: event.target.value })}
              placeholder="Telefone, WhatsApp ou observação rápida"
            />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Etapa do Cliente</label>
              <select
                className="w-full px-4 py-2 bg-white border border-input rounded-input focus:ring-2 focus:ring-primary focus:border-transparent"
                value={formData.etapaCliente}
                onChange={(event) => setFormData({ ...formData, etapaCliente: event.target.value })}
              >
                {CUSTOMER_STAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Produto</label>
            <select
              required
              className="w-full px-4 py-2 bg-white border border-input rounded-input focus:ring-2 focus:ring-primary focus:border-transparent"
              value={formData.produtoId}
              onChange={(event) => setFormData({ ...formData, produtoId: event.target.value })}
            >
              <option value="">Selecione um produto...</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.nome} (Peso: {product.peso}g)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-tight">Materiais / Cores (Opcional)</label>
              <button
                type="button"
                onClick={addMaterialField}
                className="text-[10px] font-black bg-primary-50 text-primary-600 px-3 py-1.5 rounded-full hover:bg-primary-500 hover:text-white transition-all uppercase tracking-widest flex items-center gap-1.5"
              >
                <FaPlus size={8} /> Adicionar Material
              </button>
            </div>

            {formData.materials.length === 0 ? (
              <div className="space-y-1">
                <select
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
                  value={formData.filamentoId}
                  onChange={(event) => setFormData({ ...formData, filamentoId: event.target.value })}
                >
                  <option value="">Não definido (conforme produto)</option>
                  {filaments
                    .filter((filament) => filament.status !== 'Esgotado')
                    .map((filament) => (
                      <option key={filament.id} value={filament.id}>
                        {filament.nome} {filament.cor ? `(${filament.cor})` : ''}
                      </option>
                    ))}
                </select>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter px-2">Padrão: usa o filamento principal ou material do produto.</p>
              </div>
            ) : (
              <div className="space-y-3 p-4 bg-gray-50 rounded-3xl border border-gray-100">
                {formData.materials.map((mat, index) => (
                  <div key={index} className="flex gap-2 items-end group animate-fade-in">
                    <div className="flex-1 space-y-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-2">Filamento</label>
                      <select
                        required
                        className="w-full px-3 py-2 bg-white border border-gray-100 shadow-sm rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                        value={mat.filamentoId}
                        onChange={(e) => updateMaterialField(index, 'filamentoId', e.target.value)}
                      >
                        <option value="">Escolha...</option>
                        {filaments.map(f => (
                          <option key={f.id} value={f.id}>{f.nome} ({f.cor || 'Sem cor'})</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-24 space-y-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-2">Gasto (g)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        className="w-full px-3 py-2 bg-white border border-gray-100 shadow-sm rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                        value={mat.pesoGasto}
                        onChange={(e) => updateMaterialField(index, 'pesoGasto', e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMaterialField(index)}
                      className="p-3 text-danger hover:bg-danger-soft rounded-xl transition-all mb-0.5"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Quantidade Total"
              type="number"
              required
              min="1"
              value={formData.quantidadeTotal}
              onChange={(event) =>
                setFormData({ ...formData, quantidadeTotal: Number(event.target.value) })
              }
            />
            <Input
              label="Tempo (min/peça)"
              type="number"
              min="1"
              value={formData.tempoEstimadoMinutos}
              onChange={(event) => setFormData({ ...formData, tempoEstimadoMinutos: event.target.value })}
            />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Prioridade</label>
              <select
                className="w-full px-4 py-2 bg-white border border-input rounded-input focus:ring-2 focus:ring-primary focus:border-transparent"
                value={formData.prioridade}
                onChange={(event) => setFormData({ ...formData, prioridade: Number(event.target.value) })}
              >
                <option value="1">Alta (1)</option>
                <option value="2">Normal (2)</option>
                <option value="3">Baixa (3)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Observações</label>
            <textarea
              className="w-full px-4 py-2 bg-white border border-input rounded-input focus:ring-2 focus:ring-primary focus:border-transparent min-h-[90px]"
              value={formData.observacoes}
              onChange={(event) => setFormData({ ...formData, observacoes: event.target.value })}
              placeholder="Detalhes para modelagem, produção ou entrega."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Adicionar</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title="Atualizar Tarefa"
      >
        <form onSubmit={handleUpdateSubmit} className="space-y-4">
          <div className="p-4 bg-blue-50 text-blue-900 rounded-lg flex flex-col gap-1 mb-4">
            <span className="font-semibold text-lg">
              {currentJob?.identificador || `JOB-${currentJob?.id || ''}`}
            </span>
            <span className="text-sm">{currentJob?.produtoNome}</span>
            <span className="text-xs">Meta: {currentJob?.quantidadeTotal} peças</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Cliente"
              value={updateData.clienteNome}
              onChange={(event) => setUpdateData({ ...updateData, clienteNome: event.target.value })}
            />
            <Input
              label="Contato"
              value={updateData.clienteContato}
              onChange={(event) => setUpdateData({ ...updateData, clienteContato: event.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Etapa do Cliente</label>
              <select
                className="w-full px-4 py-2 bg-white border border-input rounded-input focus:ring-2 focus:ring-primary focus:border-transparent"
                value={updateData.etapaCliente}
                onChange={(event) => setUpdateData({ ...updateData, etapaCliente: event.target.value })}
              >
                {CUSTOMER_STAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Status de Produção</label>
              <select
                className="w-full px-4 py-2 bg-white border border-input rounded-input focus:ring-2 focus:ring-primary focus:border-transparent"
                value={updateData.status}
                onChange={(event) => setUpdateData({ ...updateData, status: event.target.value })}
              >
                {PRODUCTION_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Peças com Sucesso"
              type="number"
              required
              min="0"
              max={currentJob?.quantidadeTotal || 1000}
              value={updateData.quantidadeImpressa}
              onChange={(event) =>
                setUpdateData({ ...updateData, quantidadeImpressa: Number(event.target.value) })
              }
              hint="Peças finalizadas corretamente."
            />

            <Input
              label="Peças com Falha"
              type="number"
              required
              min="0"
              max={currentJob?.quantidadeTotal || 1000}
              value={updateData.quantidadeFalha}
              onChange={(event) =>
                setUpdateData({ ...updateData, quantidadeFalha: Number(event.target.value) })
              }
              hint="Peças perdidas por erro de impressão."
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Observações</label>
            <textarea
              className="w-full px-4 py-2 bg-white border border-input rounded-input focus:ring-2 focus:ring-primary focus:border-transparent min-h-[90px]"
              value={updateData.observacoes}
              onChange={(event) => setUpdateData({ ...updateData, observacoes: event.target.value })}
              placeholder="Atualizações de análise, negociação, produção ou entrega."
            />
          </div>

          <div className="flex justify-between items-center text-xs text-gray-600">
            <span>
              Processadas: {Number(updateData.quantidadeImpressa || 0) + Number(updateData.quantidadeFalha || 0)}
            </span>
            <span>Meta: {currentJob?.quantidadeTotal || 0}</span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsUpdateModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Atualizar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
