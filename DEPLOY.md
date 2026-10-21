# Инструкция по развертыванию МотоЖурнал (MotoLedger) на публичном сервере

МотоЖурнал оптимизирован для развертывания в Docker в виде сверхлегкого контейнера (всего ~140–150 МБ) благодаря режиму `output: "standalone"` в Next.js.

---

## 📋 Требования к серверу

- Любой Linux VPS / VDS (Ubuntu 22.04 / 24.04, Debian 12 и др.)
- Минимальные ресурсы: 1 vCPU, 1 GB RAM (комфортно для сборки и работы)
- Установленные **Docker** и **Docker Compose**
- Доменное имя с DNS A-записью, направленной на IP вашего сервера

> **Важно для PWA:** Чтобы приложение можно было установить на смартфон («Добавить на экран “Домой”») и оно работало офлайн, публичный доступ обязательно должен работать по **HTTPS**.

---

## 🚀 Вариант 1: Быстрый запуск через Docker Compose (Рекомендуемый)

### 1. Клонируйте репозиторий на сервер
```bash
git clone <URL_ВАШЕГО_РЕПОЗИТОРИЯ> moto-ledger
cd moto-ledger
```

### 2. Создайте файл окружения `.env`
Скопируйте шаблон:
```bash
cp .env.example .env
```
При необходимости отредактируйте `.env`:
```bash
# Порт, на котором будет слушать приложение на хосте
HOST_PORT=3000

# Опционально: Ключ Google Gemini для AI-поиска спецификаций по мануалам
GEMINI_API_KEY=ваш_боевой_api_ключ_здесь
```

### 3. Соберите и запустите контейнер
```bash
docker compose up -d --build
```

### 4. Проверьте статус
```bash
# Проверить логи контейнера
docker compose logs -f

# Проверить статус здоровья контейнера
docker compose ps
```
Приложение будет доступно на `http://IP_СЕРВЕРА:3000`.

---

## 🔒 Настройка HTTPS и домена

### Способ А: Caddy (Самый быстрый и простой способ с авто-SSL)
Caddy автоматически за 10 секунд выпускает и продлевает бесплатные сертификаты Let's Encrypt.

1. Установите Caddy на сервер:
   ```bash
   sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
   sudo apt update && sudo apt install -y caddy
   ```
2. Скопируйте готовый конфиг из репозитория:
   ```bash
   sudo cp deploy/caddy/Caddyfile /etc/caddy/Caddyfile
   ```
3. Замените `moto.yourdomain.com` в `/etc/caddy/Caddyfile` на ваш реальный домен.
4. Перезапустите Caddy:
   ```bash
   sudo systemctl restart caddy
   ```
Всё! Сайт открывается по HTTPS с валидным SSL-сертификатом.

---

### Способ Б: Nginx + Certbot
Если на сервере уже используется Nginx:

1. Скопируйте конфигурационный файл:
   ```bash
   sudo cp deploy/nginx/moto-ledger.conf /etc/nginx/sites-available/moto-ledger.conf
   ```
2. Укажите ваш домен в конфиге:
   ```bash
   sudo sed -i 's/moto.yourdomain.com/ваш.домен.com/g' /etc/nginx/sites-available/moto-ledger.conf
   sudo ln -s /etc/nginx/sites-available/moto-ledger.conf /etc/nginx/sites-enabled/
   ```
3. Выпустите бесплатный сертификат через Certbot:
   ```bash
   sudo certbot --nginx -d ваш.домен.com
   ```
4. Проверьте и перезапустите Nginx:
   ```bash
   sudo nginx -t && sudo systemctl reload nginx
   ```

---

## 🔄 Обновление приложения на сервере

Чтобы обновить сервис после коммитов в Git:
```bash
cd moto-ledger
git pull origin main
docker compose up -d --build
```
Downtime при обновлении составляет всего пару секунд благодаря предварительной сборке нового образа.

---

## 📦 Развертывание через PaaS (Coolify / Dokku / Portainer)

Если вы используете **Coolify**, **Dokku** или **CapRover**:
1. Создайте новое приложение из Git-репозитория.
2. В качестве типа сборки выберите **Dockerfile**.
3. Добавьте переменную окружения `GEMINI_API_KEY` (при наличии).
4. Укажите внутренний порт приложения: `3000`.
5. PaaS автоматически настроит домен, HTTPS и перезапуск контейнера.

---

## 💾 Резервные копии данных

- Данные гаража (список техники, моточасы, пробеги, записи ТО) сохраняются локально на клиентских устройствах и синхронизируются через IndexedDB/LocalStorage.
- В приложении встроена кнопка **«Резервная копия»** (JSON-экспорт/импорт в 1 клик).
- Поделившиеся пресетами пользователи сохраняют общедоступные пресеты в локальное хранилище и кэш сессии.
