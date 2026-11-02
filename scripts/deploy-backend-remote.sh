#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

repo="$HOME/progetos/Catalago-3d"
backend="$repo/backend"
state="$HOME/.local/state/catalogo-3d"
unit_dir="$HOME/.config/systemd/user"
service=catalogo-3d-backend.service
timer=catalogo-3d-deploy.timer
mode="${1:---deploy}"
mkdir -p "$state"

health() {
  curl --fail --silent --show-error --max-time 5 http://127.0.0.1:3066/api/health
}
wait_health() {
  for ((attempt=0; attempt<20; attempt++)); do
    if systemctl --user is-active --quiet "$service" && health >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  return 1
}
case "$mode" in
  --status)
    git -C "$repo" log -1 --format='Commit: %h %s'
    systemctl --user is-active "$service" || true
    systemctl --user list-timers "$timer" --no-pager
    health
    printf '\n'
    exit ;;
  --disable-auto)
    systemctl --user disable --now "$timer"
    echo 'Atualização automática desativada. Backend continua rodando.'
    exit ;;
  --deploy|--auto) ;;
  *) echo "Opção inválida: $mode" >&2; exit 2 ;;
esac

exec 9>"$state/deploy.lock"
flock -n 9 || { echo 'Outro deploy já está em execução.' >&2; exit 1; }
cd "$repo"
[[ "$(git branch --show-current)" == main ]] || { echo 'Servidor deve estar em main.' >&2; exit 1; }
[[ -z "$(git status --porcelain --untracked-files=no)" ]] || {
  echo 'Alterações versionadas no servidor: resolva antes do deploy.' >&2
  exit 1
}
export GIT_TERMINAL_PROMPT=0
git -c core.sshCommand='ssh -o BatchMode=yes -o ConnectTimeout=10' fetch --quiet origin main
previous="$(git rev-parse HEAD)"
target="$(git rev-parse origin/main)"
git merge-base --is-ancestor "$previous" "$target" || {
  echo 'Histórico divergiu. Deploy automático interrompido.' >&2; exit 1;
}

install_service() {
  mkdir -p "$unit_dir"
  cat >"$unit_dir/$service" <<EOF
[Unit]
Description=Backend Catálogo 3D
After=network.target

[Service]
Type=simple
WorkingDirectory=$backend
ExecStart=$(command -v node) $backend/src/server.js
Restart=on-failure
RestartSec=3
TimeoutStopSec=15
StandardOutput=append:$backend/server.log
StandardError=append:$backend/server.log

[Install]
WantedBy=default.target
EOF
  systemctl --user daemon-reload
  # Migra somente a árvore npm/node cujo PID e diretório são deste backend.
  python3 - "$backend" <<'PY'
import os, pathlib, signal, sys, time
base = pathlib.Path(sys.argv[1]).resolve()
pidfile = base / '.pid_node'
processes = {}
for p in pathlib.Path('/proc').iterdir():
    if not p.name.isdigit():
        continue
    try:
        stat = (p / 'stat').read_text().rsplit(')', 1)[1].split()
        processes[int(p.name)] = (int(stat[1]), (p / 'cwd').resolve(), (p / 'cmdline').read_bytes())
    except (OSError, ValueError):
        pass
roots = []
if pidfile.exists():
    pid = int(pidfile.read_text().strip())
    info = processes.get(pid)
    if info and info[1] == base and (b'npm' in info[2] or b'node' in info[2]):
        roots.append(pid)
    elif info:
        raise SystemExit('PID salvo pertence a outro processo; migração interrompida.')
victims = list(roots)
for pid in victims:
    victims.extend(p for p, info in processes.items() if info[0] == pid and p not in victims)
for pid in victims:
    try:
        os.kill(pid, signal.SIGTERM)
    except ProcessLookupError:
        pass
for _ in range(100):
    if not any(pathlib.Path(f'/proc/{p}').exists() for p in victims):
        break
    time.sleep(.1)
PY
  # O atalho XFCE existente passa a iniciar o mesmo serviço, evitando duplicatas.
  printf '#!/usr/bin/env bash\nexec systemctl --user start catalogo-3d-backend.service\n' >"$backend/inicia.sh"
  chmod 700 "$backend/inicia.sh"
  systemctl --user enable "$service"
}

needs_service=false
[[ -f "$unit_dir/$service" ]] || needs_service=true
if [[ "$previous" != "$target" ]] || "$needs_service"; then
  backup="$state/backups/$(date -u +%Y%m%dT%H%M%S)-${previous:0:12}"
  mkdir -p "$backup"
  git archive HEAD >"$backup/source.tar"
  cp "$backend/.env" "$backup/backend.env"
  [[ ! -f "$backend/inicia.sh" ]] || cp -p "$backend/inicia.sh" "$backup/inicia.sh"
  printf '%s\n' "$previous" >"$backup/commit"
  # dotenv resolve o mesmo DB_PATH da aplicação; SQLite faz backup consistente online.
  (cd "$backend" && BACKUP_DIR="$backup" node --input-type=module <<'JS'
import dotenv from 'dotenv';
import Database from 'better-sqlite3';
import path from 'node:path';
dotenv.config();
const db = new Database(path.resolve(process.env.DB_PATH || './database.sqlite'), { readonly: true });
try { await db.backup(path.join(process.env.BACKUP_DIR, 'database.sqlite')); }
finally { db.close(); }
JS
  )
  echo "Backup: $backup"
  stage="$(mktemp -d "$state/stage.XXXXXX")"
  trap 'rm -rf -- "$stage"' EXIT
  git archive "$target" backend | tar -xf - -C "$stage"
  dependencies=false
  if ! cmp -s "$backend/package-lock.json" "$stage/backend/package-lock.json" || \
     ! cmp -s "$backend/package.json" "$stage/backend/package.json"; then
    (cd "$stage/backend" && npm ci --omit=dev --no-audit --no-fund)
    dependencies=true
  fi
  # Sintaxe e módulos nativos são preparados antes de parar o serviço atual.
  while IFS= read -r -d '' file; do node --check "$file"; done < <(find "$stage/backend/src" -name '*.js' -print0)
  "$needs_service" && install_service
  systemctl --user stop "$service"
  rollback() {
    trap - ERR
    echo "Deploy falhou. Retornando ao commit $previous. Backup: $backup" >&2
    systemctl --user stop "$service" || true
    git reset --keep "$previous"
    if "$dependencies" && [[ -d "$backup/node_modules" ]]; then
      rm -rf -- "$backend/node_modules"
      mv "$backup/node_modules" "$backend/node_modules"
    fi
    # Banco não é restaurado automaticamente: preserva gravações e evita perda de dados.
    systemctl --user start "$service"
    wait_health || echo 'Rollback exige intervenção; consulte server.log.' >&2
    exit 1
  }
  trap rollback ERR
  git -c core.hooksPath=/dev/null merge --quiet --ff-only "$target"
  if "$dependencies"; then
    mv "$backend/node_modules" "$backup/node_modules"
    mv "$stage/backend/node_modules" "$backend/node_modules"
  fi
  systemctl --user start "$service"
  wait_health
  trap - ERR
  printf '%s\n' "$target" >"$state/deployed-commit"
  echo "Backend atualizado: ${target:0:12}"
else
  systemctl --user start "$service"
  wait_health
  echo "Backend já atualizado: ${target:0:12}"
fi

if [[ "$mode" == --auto ]]; then
  cat >"$unit_dir/catalogo-3d-deploy.service" <<EOF
[Unit]
Description=Atualizar backend Catálogo 3D pelo GitHub
After=network-online.target

[Service]
Type=oneshot
ExecStart=/bin/bash $HOME/.local/lib/catalogo-3d/deploy-backend.sh --deploy
TimeoutStartSec=300
EOF
  cat >"$unit_dir/$timer" <<'EOF'
[Unit]
Description=Consultar GitHub do Catálogo 3D a cada minuto

[Timer]
OnBootSec=90
OnUnitInactiveSec=60
Unit=catalogo-3d-deploy.service

[Install]
WantedBy=timers.target
EOF
  systemctl --user daemon-reload
  systemctl --user enable --now "$timer"
  echo 'Atualização automática ativada: origin/main, a cada minuto.'
fi
