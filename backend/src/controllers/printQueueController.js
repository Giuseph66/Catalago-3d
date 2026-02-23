import db from '../config/database.js';

const PRODUCTION_STATUSES = ['FILA', 'IMPRIMINDO', 'PAUSADO', 'CONCLUIDO', 'CANCELADO'];
const CUSTOMER_STAGES = [
    'NOVO_PEDIDO',
    'MODELAGEM',
    'EM_ANALISE',
    'COTACAO',
    'VERIFICANDO_QUANTIDADE',
    'AGUARDANDO_APROVACAO',
    'APROVADO_PARA_IMPRESSAO',
    'EM_PRODUCAO',
    'FINALIZADO',
    'ENTREGUE',
];

const normalizeInteger = (value, fallback = 0) => {
    if (value === undefined || value === null || value === '') return fallback;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.floor(parsed) : fallback;
};

const normalizeCustomerStage = (stage) =>
    CUSTOMER_STAGES.includes(stage) ? stage : 'NOVO_PEDIDO';

const normalizeProductionStatus = (status) =>
    PRODUCTION_STATUSES.includes(status) ? status : 'FILA';

const buildFallbackIdentifier = (id) => `JOB-${String(id).padStart(6, '0')}`;

export const getQueue = async (req, res) => {
    try {
        const queue = db
            .prepare(
                `
        SELECT 
          q.*, 
          p.nome as produtoNome, 
          p.peso as produtoPeso,
          p.stlLink as produtoStlLink,
          f.nome as filamentoNome,
          f.cor as filamentoCor,
          f.custoPorGrama as filamentoCusto
        FROM print_jobs q
        LEFT JOIN products p ON q.produtoId = p.id
        LEFT JOIN filaments f ON q.filamentoId = f.id
        ORDER BY 
          CASE q.status 
            WHEN 'IMPRIMINDO' THEN 1 
            WHEN 'FILA' THEN 2 
            WHEN 'PAUSADO' THEN 3
            WHEN 'CONCLUIDO' THEN 4
            WHEN 'CANCELADO' THEN 5
            ELSE 6
          END,
          q.posicao ASC,
          q.createdAt ASC
      `
            )
            .all()
            .map((job) => {
                const materials = db.prepare('SELECT pjm.*, f.nome, f.cor FROM print_job_materials pjm JOIN filaments f ON pjm.filamentoId = f.id WHERE pjm.printJobId = ?').all(job.id);
                return {
                    ...job,
                    materials,
                    identificador: job.identificador || buildFallbackIdentifier(job.id),
                    quantidadeFalha: normalizeInteger(job.quantidadeFalha, 0),
                };
            });

        res.json(queue);
    } catch (error) {
        console.error('Erro ao buscar fila:', error);
        res.status(500).json({ error: 'Erro ao buscar fila de impressão' });
    }
};

export const createJob = async (req, res) => {
    const {
        produtoId,
        filamentoId,
        quantidadeTotal,
        prioridade,
        tempoEstimadoMinutos,
        clienteNome,
        clienteContato,
        etapaCliente,
        observacoes,
        identificador,
        materials,
    } = req.body;

    try {
        const normalizedProdutoId = normalizeInteger(produtoId, 0);
        const normalizedFilamentoId = normalizeInteger(filamentoId, 0);
        const normalizedQuantidadeTotal = Math.max(1, normalizeInteger(quantidadeTotal, 1));
        const normalizedPrioridade = Math.max(1, normalizeInteger(prioridade, 1));
        const normalizedTempo = normalizeInteger(tempoEstimadoMinutos, 0);

        if (!normalizedProdutoId) {
            return res.status(400).json({ error: 'Produto é obrigatório' });
        }

        const productExists = db.prepare('SELECT id FROM products WHERE id = ?').get(normalizedProdutoId);
        if (!productExists) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }

        if (normalizedFilamentoId) {
            const filamentExists = db.prepare('SELECT id FROM filaments WHERE id = ?').get(normalizedFilamentoId);
            if (!filamentExists) {
                return res.status(404).json({ error: 'Filamento não encontrado' });
            }
        }

        const normalizedIdentifier = String(identificador || '').trim().toUpperCase();
        if (normalizedIdentifier) {
            const duplicated = db
                .prepare('SELECT id FROM print_jobs WHERE UPPER(identificador) = ?')
                .get(normalizedIdentifier);
            if (duplicated) {
                return res.status(409).json({ error: 'Identificador já está em uso' });
            }
        }

        const lastJob = db.prepare('SELECT MAX(posicao) as maxPos FROM print_jobs').get();
        const nextPos = (lastJob?.maxPos || 0) + 1;

        const stmt = db.prepare(`
      INSERT INTO print_jobs (
        produtoId,
        filamentoId,
        quantidadeTotal,
        quantidadeImpressa,
        quantidadeFalha,
        prioridade,
        tempoEstimadoMinutos,
        posicao,
        clienteNome,
        clienteContato,
        etapaCliente,
        observacoes,
        identificador
      )
      VALUES (?, ?, ?, 0, 0, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        const info = stmt.run(
            normalizedProdutoId,
            normalizedFilamentoId || null,
            normalizedQuantidadeTotal,
            normalizedPrioridade,
            normalizedTempo || null,
            nextPos,
            String(clienteNome || '').trim() || null,
            String(clienteContato || '').trim() || null,
            normalizeCustomerStage(etapaCliente),
            String(observacoes || '').trim() || null,
            normalizedIdentifier || null
        );

        const jobId = Number(info.lastInsertRowid);
        if (!normalizedIdentifier) {
            db.prepare('UPDATE print_jobs SET identificador = ? WHERE id = ?')
                .run(buildFallbackIdentifier(jobId), jobId);
        }

        // Save multi-materials if provided
        if (materials && Array.isArray(materials)) {
            const matStmt = db.prepare('INSERT INTO print_job_materials (printJobId, filamentoId, pesoGasto) VALUES (?, ?, ?)');
            for (const mat of materials) {
                matStmt.run(jobId, mat.filamentoId, mat.pesoGasto);
            }
        }

        const newJob = db.prepare('SELECT * FROM print_jobs WHERE id = ?').get(jobId);
        res.status(201).json(newJob);
    } catch (error) {
        console.error('Erro ao adicionar tarefa:', error);
        res.status(400).json({ error: 'Erro ao adicionar à fila' });
    }
};

export const updateJobStatus = async (req, res) => {
    const { id } = req.params;
    const {
        status,
        etapaCliente,
        quantidadeImpressa,
        quantidadeFalha,
        observacoes,
        clienteNome,
        clienteContato,
    } = req.body;

    try {
        const currentJob = db.prepare('SELECT * FROM print_jobs WHERE id = ?').get(id);
        if (!currentJob) {
            return res.status(404).json({ error: 'Tarefa não encontrada' });
        }

        const nextStatus = status ? normalizeProductionStatus(status) : currentJob.status;
        const nextCustomerStage = etapaCliente
            ? normalizeCustomerStage(etapaCliente)
            : normalizeCustomerStage(currentJob.etapaCliente);

        const nextSuccessQuantity = Math.max(
            0,
            normalizeInteger(
                quantidadeImpressa,
                normalizeInteger(currentJob.quantidadeImpressa, 0)
            )
        );

        const nextFailQuantity = Math.max(
            0,
            normalizeInteger(
                quantidadeFalha,
                normalizeInteger(currentJob.quantidadeFalha, 0)
            )
        );

        const totalProduced = nextSuccessQuantity + nextFailQuantity;
        if (totalProduced > currentJob.quantidadeTotal) {
            return res.status(400).json({ error: 'Soma de sucesso + falha não pode passar da meta total' });
        }

        let dataInicio = currentJob.dataInicio;
        let dataConclusao = currentJob.dataConclusao;

        if (nextStatus === 'IMPRIMINDO' && !dataInicio) {
            dataInicio = new Date().toISOString();
        }

        if ((nextStatus === 'CONCLUIDO' || totalProduced === currentJob.quantidadeTotal) && !dataConclusao) {
            dataConclusao = new Date().toISOString();
        }

        const normalizedClientName =
            clienteNome === undefined ? currentJob.clienteNome : String(clienteNome || '').trim() || null;
        const normalizedClientContact =
            clienteContato === undefined ? currentJob.clienteContato : String(clienteContato || '').trim() || null;
        const normalizedNotes =
            observacoes === undefined ? currentJob.observacoes : String(observacoes || '').trim() || null;

        const stmt = db.prepare(`
      UPDATE print_jobs 
      SET status = ?, 
          etapaCliente = ?,
          quantidadeImpressa = ?,
          quantidadeFalha = ?,
          clienteNome = ?,
          clienteContato = ?,
          observacoes = ?,
          dataInicio = ?,
          dataConclusao = ?,
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

        stmt.run(
            nextStatus,
            nextCustomerStage,
            nextSuccessQuantity,
            nextFailQuantity,
            normalizedClientName,
            normalizedClientContact,
            normalizedNotes,
            dataInicio,
            dataConclusao,
            id
        );

        const previousProcessed =
            normalizeInteger(currentJob.quantidadeImpressa, 0) + normalizeInteger(currentJob.quantidadeFalha, 0);
        const newProcessed = nextSuccessQuantity + nextFailQuantity;
        const deltaProcessed = newProcessed - previousProcessed;

        if (deltaProcessed > 0) {
            // Check for multi-materials first
            const jobMaterials = db.prepare('SELECT * FROM print_job_materials WHERE printJobId = ?').all(id);

            if (jobMaterials.length > 0) {
                for (const mat of jobMaterials) {
                    const pesoConsumido = mat.pesoGasto * deltaProcessed;
                    db.prepare('UPDATE filaments SET pesoUsado = pesoUsado + ? WHERE id = ?').run(pesoConsumido, mat.filamentoId);
                }
            } else if (currentJob.filamentoId) {
                // Fallback to legacy single filament
                const product = db.prepare('SELECT peso FROM products WHERE id = ?').get(currentJob.produtoId);
                if (product) {
                    const pesoConsumido = product.peso * deltaProcessed;
                    db.prepare('UPDATE filaments SET pesoUsado = pesoUsado + ? WHERE id = ?').run(pesoConsumido, currentJob.filamentoId);
                }
            }
        } else if (deltaProcessed < 0) {
            // Logic for rolling back stock if quantity decreases (optional, but good for consistency)
            const jobMaterials = db.prepare('SELECT * FROM print_job_materials WHERE printJobId = ?').all(id);
            if (jobMaterials.length > 0) {
                for (const mat of jobMaterials) {
                    const pesoEstorno = mat.pesoGasto * Math.abs(deltaProcessed);
                    db.prepare('UPDATE filaments SET pesoUsado = MAX(0, pesoUsado - ?) WHERE id = ?').run(pesoEstorno, mat.filamentoId);
                }
            } else if (currentJob.filamentoId) {
                const product = db.prepare('SELECT peso FROM products WHERE id = ?').get(currentJob.produtoId);
                if (product) {
                    const pesoEstorno = product.peso * Math.abs(deltaProcessed);
                    db.prepare('UPDATE filaments SET pesoUsado = MAX(0, pesoUsado - ?) WHERE id = ?').run(pesoEstorno, currentJob.filamentoId);
                }
            }
        }

        const updatedJob = db.prepare('SELECT * FROM print_jobs WHERE id = ?').get(id);
        res.json(updatedJob);
    } catch (error) {
        console.error('Erro ao atualizar tarefa:', error);
        res.status(400).json({ error: 'Erro ao atualizar tarefa' });
    }
};

export const deleteJob = async (req, res) => {
    const { id } = req.params;

    try {
        db.prepare('DELETE FROM print_job_materials WHERE printJobId = ?').run(id);
        const result = db.prepare('DELETE FROM print_jobs WHERE id = ?').run(id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Tarefa não encontrada' });
        }

        res.json({ message: 'Tarefa removida da fila' });
    } catch (error) {
        console.error('Erro ao remover tarefa:', error);
        res.status(500).json({ error: 'Erro ao remover tarefa' });
    }
};

export const updateQueueOrder = async (req, res) => {
    const { jobs } = req.body;

    if (!Array.isArray(jobs)) {
        return res.status(400).json({ error: 'Formato inválido para reordenação' });
    }

    try {
        const updateStmt = db.prepare('UPDATE print_jobs SET posicao = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?');

        const transaction = db.transaction((jobsToUpdate) => {
            for (const job of jobsToUpdate) {
                const id = normalizeInteger(job.id, 0);
                const posicao = normalizeInteger(job.posicao, 0);
                if (id > 0 && posicao > 0) {
                    updateStmt.run(posicao, id);
                }
            }
        });

        transaction(jobs);
        res.json({ message: 'Ordem da fila atualizada com sucesso' });
    } catch (error) {
        console.error('Erro ao reordenar fila:', error);
        res.status(400).json({ error: 'Erro ao atualizar ordem da fila' });
    }
};
