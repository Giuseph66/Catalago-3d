// Repositório de modelos 3D (STL/3MF) usado pela importação de produtos
const MODEL_EXTENSIONS = ['stl', '3mf', 'obj'];
const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp'];
const CACHE_MS = 10 * 60 * 1000;

let cache = null;

export function repoConfig() {
  const repo = (process.env.GITHUB_REPO || 'Giuseph66/impressoes').trim();
  const branch = (process.env.GITHUB_BRANCH || 'main').trim();
  return {
    repo,
    branch,
    repoUrl: `https://github.com/${repo}`,
    rawBase: `https://raw.githubusercontent.com/${repo}/${branch}/`,
  };
}

const encodePath = (path) => path.split('/').map(encodeURIComponent).join('/');

export function rawUrl(path) {
  return path ? repoConfig().rawBase + encodePath(path) : null;
}

export function treeUrl(path) {
  const { repoUrl, branch } = repoConfig();
  return `${repoUrl}/tree/${branch}/${encodePath(path)}`;
}

function extensionOf(path) {
  const name = path.split('/').pop();
  return name.includes('.') ? name.split('.').pop().toLowerCase() : '';
}

// Uma chamada à API devolve a árvore inteira; o cache evita o limite de 60 req/h sem token
export async function fetchRepoFiles({ refresh = false } = {}) {
  const { repo, branch } = repoConfig();
  if (!refresh && cache && cache.key === `${repo}@${branch}` && Date.now() - cache.at < CACHE_MS) {
    return cache.data;
  }

  const headers = { 'User-Agent': 'catalogo-3d', Accept: 'application/vnd.github+json' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  const response = await fetch(
    `https://api.github.com/repos/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
    { headers }
  );
  if (!response.ok) {
    const detail = response.status === 403 || response.status === 429
      ? 'Limite de requisições do GitHub atingido. Tente em alguns minutos ou configure GITHUB_TOKEN.'
      : `GitHub respondeu ${response.status} para ${repo}@${branch}.`;
    throw new Error(detail);
  }

  const body = await response.json();
  const files = body.tree
    .filter((item) => item.type === 'blob')
    .map((item) => ({ path: item.path, size: item.size, ext: extensionOf(item.path) }))
    .filter((file) => MODEL_EXTENSIONS.includes(file.ext) || IMAGE_EXTENSIONS.includes(file.ext));

  const data = { files, truncated: Boolean(body.truncated), fetchedAt: new Date().toISOString() };
  cache = { key: `${repo}@${branch}`, at: Date.now(), data };
  return data;
}
