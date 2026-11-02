import { useEffect, useMemo, useState } from 'react';
import { FaChevronRight, FaCube, FaFolder, FaFolderOpen, FaLevelUpAlt, FaListUl, FaSitemap } from 'react-icons/fa';
import { formatBytes } from '../../utils/formatters';
import { cn } from '../../lib/utils';

const VIEW_KEY = 'importar-github:visao';

const normalize = (text) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function readView() {
  try {
    return localStorage.getItem(VIEW_KEY) === 'pastas' ? 'pastas' : 'arvore';
  } catch {
    return 'arvore';
  }
}

function FileIcon({ file, className }) {
  return (
    <FaCube
      size={13}
      className={cn('shrink-0', file.ext === '3mf' ? 'text-accent' : 'text-ink/45', className)}
      aria-hidden="true"
    />
  );
}

function ImportedDot({ inverted }) {
  return (
    <span
      className={cn('h-2 w-2 shrink-0 rounded-full', inverted ? 'bg-emerald-300' : 'bg-success')}
      title="Já está no catálogo"
    />
  );
}

// Modo árvore: como a barra lateral de arquivos do GitHub
function TreeFolder({ node, ctx }) {
  const open = ctx.expanded.has(node.path);
  const selected = ctx.selectedPath === node.path;
  const folders = node.list.filter((child) => child.total > 0 && !(ctx.onlyNew && ctx.imported.has(child.path)));

  return (
    <li role="treeitem" aria-expanded={open} aria-selected={selected}>
      <div className={cn('flex items-center rounded-md text-[14px]', selected ? 'bg-ink text-paper' : 'hover:bg-ink/5')}>
        <button
          type="button"
          onClick={() => ctx.toggle(node.path)}
          className="flex h-7 w-6 shrink-0 items-center justify-center"
          aria-label={open ? `Recolher ${node.name}` : `Expandir ${node.name}`}
          tabIndex={-1}
        >
          <FaChevronRight size={9} className={cn('opacity-60 transition-transform', open && 'rotate-90')} />
        </button>
        <button
          type="button"
          onClick={() => {
            ctx.onSelectFolder(node);
            if (!open || selected) ctx.toggle(node.path);
          }}
          className="flex min-w-0 flex-1 items-center gap-2 py-1 pr-2 text-left"
        >
          {open ? (
            <FaFolderOpen size={14} className={cn('shrink-0', selected ? 'text-filament' : 'text-ink/45')} />
          ) : (
            <FaFolder size={14} className={cn('shrink-0', selected ? 'text-filament' : 'text-ink/45')} />
          )}
          <span className="truncate">{node.name}</span>
          {ctx.imported.has(node.path) && <ImportedDot inverted={selected} />}
          <span className={cn('ml-auto shrink-0 text-xs tabular-nums', selected ? 'text-paper/55' : 'text-ink/40')}>
            {node.total}
          </span>
        </button>
      </div>

      {open && (folders.length > 0 || node.models.length > 0) && (
        <ul role="group" className="ml-[11px] border-l border-ink/10 pl-1">
          {folders.map((child) => (
            <TreeFolder key={child.path} node={child} ctx={ctx} />
          ))}
          {node.models.map((file) => (
            <TreeFile key={file.path} file={file} ctx={ctx} />
          ))}
        </ul>
      )}
    </li>
  );
}

function TreeFile({ file, ctx, showPath = false }) {
  const selected = ctx.selectedFile === file.path;
  return (
    <li role="treeitem" aria-selected={selected}>
      <button
        type="button"
        onClick={() => ctx.onSelectFile(file)}
        className={cn(
          'flex w-full items-center gap-2 rounded-md py-1 pl-6 pr-2 text-left text-[14px]',
          selected ? 'bg-cobalt text-paper' : 'text-ink/80 hover:bg-ink/5'
        )}
        title={file.path}
      >
        <FileIcon file={file} className={selected ? 'text-paper/80' : undefined} />
        <span className="min-w-0 flex-1">
          <span className="block truncate">{file.name}</span>
          {showPath && <span className={cn('block truncate text-xs', selected ? 'text-paper/60' : 'text-ink/40')}>{file.path}</span>}
        </span>
        <span className={cn('shrink-0 text-xs tabular-nums', selected ? 'text-paper/60' : 'text-ink/40')}>
          {formatBytes(file.size)}
        </span>
      </button>
    </li>
  );
}

// Modo pastas: como a listagem de um diretório no GitHub
function FolderListing({ tree, index, cwd, setCwd, ctx, repoName }) {
  const node = index.get(cwd) || tree;
  const parts = cwd ? cwd.split('/') : [];
  const folders = node.list.filter((child) => child.total > 0 && !(ctx.onlyNew && ctx.imported.has(child.path)));

  const open = (child) => {
    setCwd(child.path);
    ctx.onSelectFolder(child);
  };

  return (
    <div>
      <nav aria-label="Caminho" className="flex flex-wrap items-center gap-1 border-b border-border px-3 py-2.5 text-sm">
        <button type="button" onClick={() => setCwd('')} className="font-semibold text-cobalt hover:underline">
          {repoName}
        </button>
        {parts.map((part, i) => {
          const path = parts.slice(0, i + 1).join('/');
          const last = i === parts.length - 1;
          return (
            <span key={path} className="flex items-center gap-1">
              <span className="text-ink/30">/</span>
              {last ? (
                <span className="font-semibold">{part}</span>
              ) : (
                <button type="button" onClick={() => setCwd(path)} className="text-cobalt hover:underline">
                  {part}
                </button>
              )}
            </span>
          );
        })}
      </nav>

      <ul className="divide-y divide-ink/[0.07]">
        {cwd && (
          <li>
            <button
              type="button"
              onClick={() => setCwd(parts.slice(0, -1).join('/'))}
              className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-ink/60 hover:bg-ink/5"
            >
              <FaLevelUpAlt size={12} className="shrink-0 -scale-x-100" />
              ..
            </button>
          </li>
        )}
        {folders.map((child) => {
          const selected = ctx.selectedPath === child.path;
          return (
            <li key={child.path}>
              <button
                type="button"
                onClick={() => open(child)}
                className={cn('flex w-full items-center gap-3 px-3 py-2 text-left text-sm', selected ? 'bg-ink/[0.06] font-semibold' : 'hover:bg-ink/5')}
              >
                <FaFolder size={14} className="shrink-0 text-ink/45" />
                <span className="truncate">{child.name}</span>
                {ctx.imported.has(child.path) && <ImportedDot />}
                <span className="ml-auto shrink-0 text-xs text-ink/45">
                  {child.total} {child.total === 1 ? 'modelo' : 'modelos'}
                </span>
              </button>
            </li>
          );
        })}
        {node.models.map((file) => {
          const selected = ctx.selectedFile === file.path;
          return (
            <li key={file.path}>
              <button
                type="button"
                onClick={() => ctx.onSelectFile(file)}
                className={cn('flex w-full items-center gap-3 px-3 py-2 text-left text-sm', selected ? 'bg-cobalt text-paper' : 'hover:bg-ink/5')}
              >
                <FileIcon file={file} className={selected ? 'text-paper/80' : undefined} />
                <span className="truncate">{file.name}</span>
                <span className={cn('ml-auto shrink-0 text-xs tabular-nums', selected ? 'text-paper/60' : 'text-ink/45')}>
                  {formatBytes(file.size)}
                </span>
              </button>
            </li>
          );
        })}
        {folders.length === 0 && node.models.length === 0 && (
          <li className="px-3 py-4 text-sm text-ink/55">Nada para mostrar nesta pasta.</li>
        )}
      </ul>
    </div>
  );
}

export default function RepoBrowser({ tree, index, repoName, imported, selectedPath, selectedFile, onSelectFolder, onSelectFile }) {
  const [view, setView] = useState(readView);
  const [query, setQuery] = useState('');
  const [onlyNew, setOnlyNew] = useState(false);
  const [expanded, setExpanded] = useState(() => new Set());
  const [cwd, setCwd] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(VIEW_KEY, view);
    } catch {
      // sem armazenamento: só não lembra a escolha
    }
  }, [view]);

  // Ao escolher algo, a árvore abre até ele e a listagem vai para a pasta dele
  useEffect(() => {
    if (!selectedPath) return;
    setExpanded((prev) => {
      const next = new Set(prev);
      const parts = selectedPath.split('/');
      for (let i = 1; i < parts.length; i++) next.add(parts.slice(0, i).join('/'));
      return next;
    });
  }, [selectedPath]);

  const toggle = (path) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });

  const ctx = { expanded, toggle, imported, onlyNew, selectedPath, selectedFile, onSelectFolder, onSelectFile };

  const results = useMemo(() => {
    const term = normalize(query.trim());
    if (!term) return null;
    const folders = [];
    const files = [];
    for (const node of index.values()) {
      if (!node.path || node.total === 0) continue;
      if (onlyNew && imported.has(node.path)) continue;
      if (normalize(node.name).includes(term)) folders.push(node);
      node.models.forEach((file) => {
        if (normalize(file.name).includes(term)) files.push(file);
      });
    }
    return { folders: folders.slice(0, 80), files: files.slice(0, 120) };
  }, [query, index, onlyNew, imported]);

  const rootFolders = tree.list.filter((child) => child.total > 0 && !(onlyNew && imported.has(child.path)));

  return (
    <div>
      <div className="space-y-3 border-b border-border p-3">
        <div className="grid grid-cols-2 rounded-full bg-ink/[0.06] p-1 text-sm font-medium" role="tablist" aria-label="Modo de visualização">
          {[
            { id: 'arvore', label: 'Árvore', icon: FaSitemap },
            { id: 'pastas', label: 'Pastas', icon: FaListUl },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={view === id}
              onClick={() => setView(id)}
              className={cn(
                'flex items-center justify-center gap-2 rounded-full py-1.5 transition-colors',
                view === id ? 'bg-white text-ink shadow-sm' : 'text-ink/55 hover:text-ink'
              )}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Procurar pasta ou arquivo"
          className="input-base"
          aria-label="Procurar pasta ou arquivo"
        />
        <label className="flex items-center gap-2 text-sm text-ink/70">
          <input type="checkbox" checked={onlyNew} onChange={(e) => setOnlyNew(e.target.checked)} className="accent-cobalt" />
          Esconder o que já está no catálogo
        </label>
      </div>

      <div className="max-h-[65vh] overflow-y-auto">
        {results ? (
          <ul className="p-2" aria-label="Resultados da busca">
            {results.folders.length === 0 && results.files.length === 0 && (
              <li className="p-3 text-sm text-ink/55">Nada encontrado para “{query}”.</li>
            )}
            {results.folders.map((node) => (
              <li key={node.path}>
                <button
                  type="button"
                  onClick={() => {
                    onSelectFolder(node);
                    setCwd(node.path);
                    setQuery('');
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[14px] hover:bg-ink/5"
                >
                  <FaFolder size={14} className="shrink-0 text-ink/45" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{node.name}</span>
                    <span className="block truncate text-xs text-ink/40">{node.path}</span>
                  </span>
                  <span className="shrink-0 text-xs text-ink/40">{node.total}</span>
                </button>
              </li>
            ))}
            {results.files.map((file) => (
              <TreeFile key={file.path} file={file} ctx={ctx} showPath />
            ))}
          </ul>
        ) : view === 'arvore' ? (
          <ul role="tree" aria-label="Arquivos do repositório" className="p-2">
            {rootFolders.map((node) => (
              <TreeFolder key={node.path} node={node} ctx={ctx} />
            ))}
          </ul>
        ) : (
          <FolderListing tree={tree} index={index} cwd={cwd} setCwd={setCwd} ctx={ctx} repoName={repoName} />
        )}
      </div>
    </div>
  );
}
