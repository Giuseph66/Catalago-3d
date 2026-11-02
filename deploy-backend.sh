#!/usr/bin/env bash
set -Eeuo pipefail

root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
host="${CATALOGO_SSH_HOST:-kali@192.168.0.35}"
mode="${1:---deploy}"
case "$mode" in
  --help|-h)
    echo 'Uso: ./deploy-backend.sh [--deploy|--auto|--status|--disable-auto]'
    echo '--deploy: atualiza origin/main; --auto: atualiza e consulta GitHub a cada minuto.'
    echo '--status: consulta serviço/API; --disable-auto: desativa somente atualização automática.'
    echo 'Acesso: chave SSH; host configurável por CATALOGO_SSH_HOST.'
    exit 0 ;;
  --deploy|--auto|--status|--disable-auto) ;;
  *) echo "Opção inválida: $mode" >&2; exit 2 ;;
esac
[[ $# -le 1 ]] || { echo 'Informe somente uma opção.' >&2; exit 2; }
ssh_options=(-o BatchMode=yes -o ConnectTimeout=10)

if [[ "$mode" == --status || "$mode" == --disable-auto ]]; then
  ssh "${ssh_options[@]}" "$host" "bash ~/.local/lib/catalogo-3d/deploy-backend.sh $mode"
  exit
fi

# Publica apenas o mecanismo de deploy. O código da aplicação vem do GitHub.
remote_tmp="$(ssh "${ssh_options[@]}" "$host" \
  'mkdir -p ~/.local/lib/catalogo-3d && mktemp ~/.local/lib/catalogo-3d/.deploy.XXXXXX')"
trap 'ssh "${ssh_options[@]}" "$host" "rm -f -- $remote_tmp" >/dev/null 2>&1 || true' EXIT
scp "${ssh_options[@]}" "$root/scripts/deploy-backend-remote.sh" "$host:$remote_tmp"
ssh "${ssh_options[@]}" "$host" \
  "chmod 700 $remote_tmp && mv -f -- $remote_tmp ~/.local/lib/catalogo-3d/deploy-backend.sh && bash ~/.local/lib/catalogo-3d/deploy-backend.sh $mode"
