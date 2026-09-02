#!/usr/bin/env bash
# Развёртывание с рабочей машины. Требует Git Bash и ssh-ключ от сервера.
#
#   scripts/deploy-from-local.sh /путь/к/ssh-ключу
#
# Переносит текущее рабочее дерево на сервер и запускает там сборку.
# Незакоммиченные изменения тоже уедут — сначала коммит и push, потом деплой,
# иначе на сервере окажется не то, что лежит в гите.
set -euo pipefail

KEY=${1:-${OBLIK_SSH_KEY:-}}
HOST=${OBLIK_HOST:-ubuntu@62.84.121.162}
[ -n "$KEY" ] || { echo "укажите путь к ssh-ключу: $0 /путь/к/ключу"; exit 1; }

cd "$(dirname "$0")/.."

if [ -n "$(git status --porcelain)" ]; then
  echo "внимание: в рабочем дереве есть незакоммиченные изменения —"
  git status --short
  echo "они уедут на сервер, но в гит не попадут."
fi

echo "==> перенос дерева на $HOST"
tar -czf - --exclude=./node_modules --exclude=./.next --exclude=./data --exclude=./.env . \
  | ssh -i "$KEY" "$HOST" 'tar -xzf - -C /srv/oblik'

echo "==> сборка на сервере"
ssh -i "$KEY" "$HOST" 'chmod +x /srv/oblik/scripts/deploy.sh && /srv/oblik/scripts/deploy.sh'

echo "==> проверка снаружи"
curl -fsS -o /dev/null -m 30 -w "https://oblik.space/ -> HTTP %{http_code}\n" https://oblik.space/
