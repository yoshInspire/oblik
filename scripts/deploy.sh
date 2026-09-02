#!/usr/bin/env bash
# Развёртывание на сервере: /srv/oblik, сервис oblik.service, nginx на oblik.space
# Приложение собирается заранее, поэтому git pull сам по себе ничего не меняет —
# после каждого обновления нужны пересборка и перезапуск.
set -euo pipefail

APP_DIR=${APP_DIR:-/srv/oblik}
cd "$APP_DIR"

echo "==> git pull"
git pull --ff-only

echo "==> npm ci"
npm ci --no-audit --no-fund

echo "==> build"
npm run build

echo "==> restart"
sudo systemctl restart oblik
sleep 4
systemctl is-active --quiet oblik || { echo "сервис не поднялся"; journalctl -u oblik -n 30 --no-pager; exit 1; }

curl -fsS -o /dev/null -w "локальная проверка: HTTP %{http_code}\n" http://127.0.0.1:3000/
echo "готово: $(git log --oneline -1)"
