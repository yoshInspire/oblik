#!/usr/bin/env bash
# Серверная часть развёртывания. Запускается на сервере, в /srv/oblik.
# Код сюда кладёт scripts/deploy-from-local.sh с рабочей машины: сервер не
# может тянуть с GitHub — тот отвечает 401 на git-fetch с этого адреса.
# Если в репозиторий добавить deploy-ключ, здесь появится git pull --ff-only.
set -euo pipefail

APP_DIR=${APP_DIR:-/srv/oblik}
cd "$APP_DIR"

echo "==> npm ci"
npm ci --no-audit --no-fund

echo "==> build"
npm run build

echo "==> restart"
sudo systemctl restart oblik
sleep 5
systemctl is-active --quiet oblik || {
  echo "сервис не поднялся:"; journalctl -u oblik -n 40 --no-pager; exit 1
}

curl -fsS -o /dev/null -w "локальная проверка: HTTP %{http_code}\n" http://127.0.0.1:3000/
echo "развёрнуто: $(git log --oneline -1)"
