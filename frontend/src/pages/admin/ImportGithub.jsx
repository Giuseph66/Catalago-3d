import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaGithub, FaSyncAlt } from 'react-icons/fa';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Skeleton } from '../../components/ui/Skeleton';
import RepoBrowser from '../../components/admin/RepoBrowser';
import { formatBytes } from '../../utils/formatters';
import { PRODUCT_STATUS } from '../../lib/constants';
import { cn } from '../../lib/utils';

const ModelViewer = lazy(() => import('../../components/three/ModelViewer'));

const MODEL_EXTENSIONS = ['stl', '3mf', 'obj'];
const AUTO_LOAD_BYTES = 25 * 1024 * 1024;
const PLA_DENSITY = 1.24; // g/cm³
const FILL_FACTOR = 0.35; // paredes + ~15% de preenchimento, aproximado
const PREVIEW_COLORS = ['#FF5A1F', '#F4F4F2', '#2340C8', '#1C1C1E', '#F6C445', '#2F9E62', '#F29BB8'];
// Pastas que costumam ser versão ou parte de outra peça: o nome vem da pasta de cima
const GENERIC_FOLDER = /^(v\d+(\.\d+)?|normal|novo|nova|final|comprado|montavel|montável|stls?|files|arquivos|partes|parts|body|head|multicolor)$/i;

const slugify = (text) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const tidy = (text) => {
  const clean = text.replace(/[_-]+/g, ' ').replace(/[?]/g, '').replace(/\s+/g, ' ').trim();
  return clean.charAt(0).toUpperCase() + clean.slice(1);
};

function suggestName(path) {
  const parts = path.split('/');
  const last = parts.at(-1);
  if (GENERIC_FOLDER.test(last) && parts.length > 1) return tidy(`${parts.at(-2)} ${last}`);
  return tidy(last);
}

function suggestCategory(path) {
  const parts = path.split('/');
  if (slugify(parts[0]) === 'decoracoes') return parts.length > 2 ? tidy(parts[1]) : 'Decorações';
  return tidy(parts[0]);
}

function buildTree(files) {
  const root = { path: '', name: '', depth: -1, children: new Map(), models: [] };
  const index = new Map([['', root]]);
  for (const file of files) {
    if (!MODEL_EXTENSIONS.includes(file.ext)) continue;
    const parts = file.path.split('/');
    let node = root;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!node.children.has(parts[i])) {
        node.children.set(parts[i], {
          path: parts.slice(0, i + 1).join('/'),
          name: parts[i],
          depth: i,
          children: new Map(),
          models: [],
        });
        index.set(parts.slice(0, i + 1).join('/'), node.children.get(parts[i]));
      }
      node = node.children.get(parts[i]);
    }
    node.models.push({ ...file, name: parts.at(-1) });
  }
  const finalize = (node) => {
    node.total = node.models.length;
    node.list = [...node.children.values()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    node.list.forEach((child) => {
      node.total += finalize(child);
    });
    return node.total;
  };
  finalize(root);
  root.index = index;
  return root;
}

function collectModels(node) {
  return [...node.models, ...node.list.flatMap(collectModels)];
}

function flatten(node, out = []) {
  node.list.forEach((child) => {
    out.push(child);
    flatten(child, out);
  });
  return out;
}

// Arquivo que abre primeiro: STL antes de 3MF, o maior que ainda carrega rápido
function pickMainModel(models) {
  const ranked = [...models].sort((a, b) => {
    if ((a.ext === 'stl') !== (b.ext === 'stl')) return a.ext === 'stl' ? -1 : 1;
    const aFits = a.size <= AUTO_LOAD_BYTES;
    const bFits = b.size <= AUTO_LOAD_BYTES;
    if (aFits !== bFits) return aFits ? -1 : 1;
    return aFits ? b.size - a.size : a.size - b.size;
  });
  return ranked[0];
}

export default function ImportGithub() {
  const [library, setLibrary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [model, setModel] = useState(null);
  const [forceLoad, setForceLoad] = useState(false);
  const [previewColor, setPreviewColor] = useState(PREVIEW_COLORS[0]);
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (refresh = false) => {
    setLoading(true);
    setError('');
    try {
      const [libraryRes, categoriesRes] = await Promise.all([
        api.get(`/library${refresh ? '?refresh=1' : ''}`),
        api.get('/categories'),
      ]);
      setLibrary(libraryRes.data);
      setCategories(categoriesRes.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Não foi possível ler o repositório do GitHub.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const tree = useMemo(() => (library ? buildTree(library.files) : null), [library]);
  const importedByPath = useMemo(
    () => new Map((library?.produtos || []).map((produto) => [produto.stlPath, produto])),
    [library]
  );

  const folderModels = useMemo(() => (selected ? collectModels(selected) : []), [selected]);
  const produto = selected ? importedByPath.get(selected.path) : null;

  const selectFolder = (node, file = null) => {
    const models = collectModels(node);
    setSelected(node);
    setModel(file || pickMainModel(models));
    setForceLoad(false);
    setStats(null);
    const categoria = suggestCategory(node.path);
    const existente = categories.find((c) => c.slug === slugify(categoria));
    setForm({
      nome: suggestName(node.path),
      categoria: existente ? existente.slug : `nova:${categoria}`,
      peso: '',
      preco: '',
      status: PRODUCT_STATUS.SOB_ENCOMENDA,
      descricaoCurta: '',
      publicar: false,
    });
  };

  // Arquivo dentro da pasta escolhida só troca o modelo; fora dela, a pasta do arquivo vira a seleção
  const selectFile = (file) => {
    const inside = selected && file.path.startsWith(`${selected.path}/`);
    if (inside) {
      setModel(file);
      setForceLoad(false);
      setStats(null);
      return;
    }
    const folder = tree.index.get(file.path.split('/').slice(0, -1).join('/'));
    if (folder) selectFolder(folder, file);
  };

  const handleStats = useCallback((next) => {
    setStats(next);
    const estimado = Math.max(1, Math.round(next.volume * PLA_DENSITY * FILL_FACTOR));
    setForm((prev) => (prev && !prev.peso ? { ...prev, peso: String(estimado) } : prev));
  }, []);

  const pesoSolido = stats ? Math.round(stats.volume * PLA_DENSITY) : null;
  const canLoad = model && (model.size <= AUTO_LOAD_BYTES || forceLoad);
  const modelUrl = model ? library.rawBase + model.path.split('/').map(encodeURIComponent).join('/') : null;
  const folderUrl = selected
    ? `${library.repoUrl}/tree/${library.branch}/${selected.path.split('/').map(encodeURIComponent).join('/')}`
    : null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.nome.trim()) {
      toast.error('Dê um nome ao produto.');
      return;
    }
    if (!(parseInt(form.peso) >= 1)) {
      toast.error('Informe o peso em gramas (pelo menos 1 g).');
      return;
    }
    setSaving(true);
    try {
      let categoriaSlug = form.categoria;
      if (form.categoria.startsWith('nova:')) {
        const nome = form.categoria.slice(5);
        const res = await api.post('/categories', { nome });
        categoriaSlug = res.data.slug;
        setCategories((prev) => [...prev, res.data]);
      }
      const cm = (mm) => (mm ? Math.round(mm) / 10 : null);
      const res = await api.post('/products', {
        nome: form.nome.trim(),
        peso: parseInt(form.peso),
        preco: form.preco ? parseFloat(form.preco.replace(',', '.')) : null,
        status: form.status,
        descricaoCurta: form.descricaoCurta.trim() || null,
        categorias: categoriaSlug ? [categoriaSlug] : [],
        altura: cm(stats?.altura),
        largura: cm(stats?.largura),
        profundidade: cm(stats?.profundidade),
        material: 'PLA',
        stlLink: folderUrl,
        stlPath: selected.path,
        modeloArquivo: model?.path || null,
        modeloTamanho: model?.size || null,
        publicado: form.publicar,
      });
      setLibrary((prev) => ({
        ...prev,
        produtos: [...prev.produtos, { ...res.data, stlPath: selected.path }],
      }));
      toast.success(form.publicar ? 'Produto criado e publicado.' : 'Rascunho criado. Revise e publique quando quiser.');
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Não foi possível criar o produto.');
    } finally {
      setSaving(false);
    }
  };

  const importedCount = library?.produtos.length || 0;
  const folderCount = tree ? flatten(tree).filter((node) => node.models.length > 0).length : 0;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-[3px] border-ink pb-4">
        <div>
          <h1>Importar do GitHub</h1>
          {library && (
            <p className="mt-2 font-serif text-lg text-ink/60">
              {folderCount} pastas com modelos em{' '}
              <a href={library.repoUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-ink">
                {library.repo}
              </a>
              . {importedCount === 0 ? 'Nenhuma importada ainda.' : `${importedCount} já no catálogo.`}
            </p>
          )}
        </div>
        <Button variant="outline" onClick={() => load(true)} disabled={loading} leftIcon={<FaSyncAlt size={12} />}>
          Atualizar lista
        </Button>
      </div>

      {error && (
        <div className="mt-6 rounded-card border border-danger/40 bg-danger-soft p-4 text-danger" role="alert">
          {error}{' '}
          <button type="button" onClick={() => load(true)} className="font-semibold underline">
            Tentar de novo
          </button>
        </div>
      )}

      {loading && !library ? (
        <div className="mt-8 grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
          <Skeleton className="h-[480px]" />
          <Skeleton className="h-[480px]" />
        </div>
      ) : (
        library && (
          <div className="mt-8 grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
            <aside className="self-start rounded-card border border-border bg-white lg:sticky lg:top-6">
              <RepoBrowser
                tree={tree}
                index={tree.index}
                repoName={library.repo.split('/').pop()}
                imported={importedByPath}
                selectedPath={selected?.path}
                selectedFile={model?.path}
                onSelectFolder={(node) => selectFolder(node)}
                onSelectFile={selectFile}
              />
            </aside>

            {!selected ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center rounded-card border border-dashed border-ink/20 p-10 text-center">
                <p className="font-display text-4xl font-extrabold">Escolha uma pasta</p>
                <p className="mt-2 max-w-sm font-serif text-lg text-ink/60">
                  O modelo abre em 3D aqui, com as medidas calculadas a partir do arquivo.
                </p>
              </div>
            ) : (
              <section className="min-w-0">
                <p className="truncate text-sm text-ink/50">{selected.path}</p>
                <div className="mt-1 flex flex-wrap items-baseline justify-between gap-3">
                  <h2 className="text-4xl">{suggestName(selected.path)}</h2>
                  <a
                    href={folderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-ink/60 hover:text-ink"
                  >
                    <FaGithub /> Abrir no GitHub
                  </a>
                </div>

                <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-card bg-cobalt text-paper">
                  {model && canLoad ? (
                    <Suspense fallback={null}>
                      <ModelViewer
                        key={model.path}
                        url={modelUrl}
                        ext={model.ext}
                        color={previewColor}
                        onStats={handleStats}
                        className="absolute inset-0"
                      />
                    </Suspense>
                  ) : model ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
                      <p className="font-serif text-lg">Este arquivo tem {formatBytes(model.size)} e pode demorar para abrir.</p>
                      <button
                        type="button"
                        onClick={() => setForceLoad(true)}
                        className="h-11 rounded-full bg-paper px-6 font-display text-lg font-extrabold text-cobalt hover:bg-white"
                      >
                        Abrir mesmo assim
                      </button>
                    </div>
                  ) : null}
                  {model && (
                    <p className="pointer-events-none absolute left-4 top-3 max-w-[70%] truncate text-sm text-paper/75">
                      {model.name} ({formatBytes(model.size)})
                    </p>
                  )}
                  <div className="absolute bottom-3 left-3 flex gap-1.5 rounded-full bg-ink/35 p-1.5 backdrop-blur" role="radiogroup" aria-label="Cor da prévia">
                    {PREVIEW_COLORS.map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        role="radio"
                        aria-checked={previewColor === hex}
                        aria-label={`Prévia na cor ${hex}`}
                        onClick={() => setPreviewColor(hex)}
                        className={cn('h-6 w-6 rounded-full ring-paper ring-offset-1 ring-offset-transparent', previewColor === hex && 'ring-2')}
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </div>

                {folderModels.length > 1 && (
                  <div className="mt-3 flex max-h-28 flex-wrap gap-2 overflow-y-auto">
                    {folderModels.map((file) => (
                      <button
                        key={file.path}
                        type="button"
                        onClick={() => {
                          setModel(file);
                          setForceLoad(false);
                          setStats(null);
                        }}
                        className={cn(
                          'rounded-full border px-3 py-1 text-sm',
                          model?.path === file.path ? 'border-ink bg-ink text-paper' : 'border-ink/15 hover:border-ink/40'
                        )}
                        title={file.path}
                      >
                        {file.name} <span className="opacity-60">{formatBytes(file.size)}</span>
                      </button>
                    ))}
                  </div>
                )}

                <dl className="mt-6 grid grid-cols-3 border-y border-ink/10">
                  <div className="py-3 pr-3">
                    <dt className="text-xs text-ink/55">Medidas (L × P × A)</dt>
                    <dd className="mt-0.5 font-medium tabular-nums">
                      {stats ? `${Math.round(stats.largura)} × ${Math.round(stats.profundidade)} × ${Math.round(stats.altura)} mm` : '—'}
                    </dd>
                  </div>
                  <div className="border-l border-ink/10 px-3 py-3">
                    <dt className="text-xs text-ink/55">Volume</dt>
                    <dd className="mt-0.5 font-medium tabular-nums">{stats ? `${stats.volume.toFixed(1).replace('.', ',')} cm³` : '—'}</dd>
                  </div>
                  <div className="border-l border-ink/10 px-3 py-3">
                    <dt className="text-xs text-ink/55">Peso se fosse maciço</dt>
                    <dd className="mt-0.5 font-medium tabular-nums">{pesoSolido !== null ? `${pesoSolido} g` : '—'}</dd>
                  </div>
                </dl>

                {produto ? (
                  <div className="mt-6 rounded-card border border-border bg-white p-5">
                    <p className="font-medium">
                      Esta pasta já está no catálogo como <strong>{produto.nome}</strong>
                      {produto.publicado === false || produto.publicado === 0 ? ' (rascunho).' : '.'}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      <Button as={Link} to={`/admin/produtos/${produto.id}`} size="sm">
                        Editar produto
                      </Button>
                      <Button as="a" href={`/produto/${produto.slug}`} target="_blank" rel="noopener noreferrer" size="sm" variant="outline">
                        Ver no site
                      </Button>
                    </div>
                  </div>
                ) : (
                  form && (
                    <form onSubmit={handleSubmit} className="mt-6 grid gap-5 rounded-card border border-border bg-white p-5 md:grid-cols-2">
                      <Input
                        label="Nome no catálogo"
                        value={form.nome}
                        onChange={(e) => setForm({ ...form, nome: e.target.value })}
                        required
                      />
                      <Select
                        label="Categoria"
                        value={form.categoria}
                        onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                      >
                        <option value="">Sem categoria</option>
                        {form.categoria.startsWith('nova:') && (
                          <option value={form.categoria}>Criar “{form.categoria.slice(5)}”</option>
                        )}
                        {categories.map((category) => (
                          <option key={category.id} value={category.slug}>
                            {category.nome}
                          </option>
                        ))}
                      </Select>
                      <Input
                        label="Peso (g)"
                        type="number"
                        min="1"
                        value={form.peso}
                        onChange={(e) => setForm({ ...form, peso: e.target.value })}
                        hint={stats ? 'Estimativa com preenchimento comum. Confira no fatiador.' : 'Abra o modelo para estimar.'}
                        required
                      />
                      <Input
                        label="Preço (R$)"
                        inputMode="decimal"
                        value={form.preco}
                        onChange={(e) => setForm({ ...form, preco: e.target.value })}
                        hint="Vazio usa o preço por grama das configurações."
                      />
                      <Select
                        label="Disponibilidade"
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                      >
                        <option value={PRODUCT_STATUS.SOB_ENCOMENDA}>Sob encomenda</option>
                        <option value={PRODUCT_STATUS.PRONTA_ENTREGA}>Pronta entrega</option>
                      </Select>
                      <div className="md:col-span-2">
                        <Textarea
                          label="Descrição curta"
                          rows={2}
                          value={form.descricaoCurta}
                          onChange={(e) => setForm({ ...form, descricaoCurta: e.target.value })}
                        />
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-4 md:col-span-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={form.publicar}
                            onChange={(e) => setForm({ ...form, publicar: e.target.checked })}
                            className="accent-cobalt"
                          />
                          Publicar no site agora (sem marcar, fica como rascunho)
                        </label>
                        <Button type="submit" loading={saving} disabled={saving}>
                          {form.publicar ? 'Criar e publicar' : 'Criar rascunho'}
                        </Button>
                      </div>
                    </form>
                  )
                )}
              </section>
            )}
          </div>
        )
      )}
    </div>
  );
}
