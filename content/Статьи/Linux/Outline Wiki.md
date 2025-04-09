---
date: 09/04/2025
title: Outline Wiki
---
![[outline.png]]

> [!NOTE] Уровень сложности: выше среднего
> В этой статье и видео я показываю как развернуть Wiki Outline в Docker. 
> В данном, конкретном примере прокси сервер находится на AWS EC2, а само приложение развернуто на обычном компьютере под управлением Windows 10 с установленным бесплатным гипервизором MS Hyper-V 
> Обе виртуальные машины объедененны в одну локальную сеть с помощью сервиса Tailscale. 
# Cтек
![[stek.png]]
Что нам понадобится
1. Машина на Ubuntu (24.04) физическая либо виртуальная - 2 шт
2. Публичный IP адрес
3. Доменное DNS имя (можно третьего уровня my.domain.com)
4. Руки и голова

![[SCR-20250409-kanu.png]]
## Подгототавливаем Ubuntu

```
sudo su
apt update && apt upgrade -y
reboot
```

Открываем (пробрасываем) порты: 
80 - для http,
81 - для Nginx Proxy Manager
443 - для SSL
## Cтавим Docker
Вводим по очереди команды
```
sudo apt install -y docker.io docker-compose
sudo systemctl enable docker
sudo systemctl start docker
```
Далее сделаем так чтобы docker можно было запускать не из под root,вводим по очереди
```
sudo usermod -aG docker $USER
newgrp docker
docker ps
docker-compose --version
```
### Cсоздаем обшую сеть Docker

```
docker network create nginx_proxy
```
## Ставим Nginx Proxy Manager
```
mkdir -p ~/nginx-proxy-manager
cd ~/nginx-proxy-manager
nano docker-compose.yml
```

Содержимое docker-compose.yml
```
version: '3'
services:
  app:
    image: 'jc21/nginx-proxy-manager:latest'
    container_name: nginx-proxy-manager
    restart: always
    ports:
      - '80:80'
      - '81:81'      # Панель управления
      - '443:443'
    volumes:
      - ./data:/data
      - ./letsencrypt:/etc/letsencrypt
    networks:
      - nginx_proxy

networks:
  nginx_proxy:
    external: true
```

Взлетаем, настраиваем:
```
docker-compose up -d
```
http://ваш-ip-адрес:81
Логин
```
admin@example.com
```
Пароль:
```
changeme
```

## Ставим Pocket-ID
```
mkdir -p ~/pocket-id
cd ~/pocket-id
```
Потом качаем вот эти файлы туда:
```
 curl -O https://raw.githubusercontent.com/pocket-id/pocket-id/main/docker-compose.yml

 curl -o .env https://raw.githubusercontent.com/pocket-id/pocket-id/main/.env.example
```

редактируем .env файл меняем значение PUBLIC APP URL на свое и меняем значение TRUST_PROXY=true

```
nano .env
```

Должно быть что то вроде
```
# See the documentation for more information: https://pocket-id.org/docs/configuration/environment-variables
PUBLIC_APP_URL=https://id.primin.garden # тут меняете на свое
TRUST_PROXY=false
MAXMIND_LICENSE_KEY=
PUID=1000
PGID=1000
```

Далее редактируем docker-compose.yml файл меняем содержимое на вот это:

```
version: '3'

services:
  pocket-id:
    image: ghcr.io/pocket-id/pocket-id
    container_name: pocket-id
    restart: unless-stopped
    env_file: .env
    volumes:
      - "./data:/app/backend/data"
    healthcheck:
      test: "curl -f http://localhost/health"
      interval: 1m30s
      timeout: 5s
      retries: 2
      start_period: 10s
    networks:
      - nginx_proxy

networks:
  nginx_proxy:
    external: true
```

Взлетаем, смотрим:
```
docker-compose up -d
```

Pocket-id стартует довольно долго, примерно одну минуту. Поэтому выжидаем, можете мониторить состояние командой `docker ps` до тех пор пока не увидите статус "healthy"

Далее делаем SSL сертификат с помощью Nginx Proxy Manager, указываем порт 80. и ip/имя хоста `pocket-id`
заходим по URL: https://id.вашдомен.com/login/setup и делаем первоначальную настройку. Добавляем passkeys. Создаем OIDC приложение указываем callback 
URL: https://kb.yousite.com/auth/oidc.callback 
копируем значения  OIDC_CLIENT_ID и OIDC_CLIENT_SECRET куда нибудь во временный файл.

## Tailscale (optional)
Если ваша машина с Outline находится на том же сервере, то этот шаг можете пропустить. Если как и у меня она находится в другой сети без публичного IP тогда этот шаг можете выполнить как показано в видео.
# Outline

```
mkdir -p ~/outline
cd ~/outline
nano docker-compose.yml
```

Пример docker-compose.yml
```
version: "3.8"

services:
  outline:
    image: outlinewiki/outline:latest
    restart: always
    depends_on:
      - postgres
      - redis
    ports:
      - "3000:3000"
    environment:
      # Основные настройки
      - URL=https://kb.primin.garden
      - PORT=3000
      - HOST=0.0.0.0
      - FORCE_HTTPS=true

      # Авторизация (только через OIDC)
      - ENABLE_EMAIL_SIGNIN=false
      - ENABLE_OIDC=true
      - OIDC_CLIENT_ID= # вставляем из pocket-id
      - OIDC_CLIENT_SECRET= # вставляем из pocket-id
      - OIDC_AUTH_URI=https://id.primin.garden/authorize
      - OIDC_TOKEN_URI=https://id.primin.garden/api/oidc/token
      - OIDC_USERINFO_URI=https://id.primin.garden/api/oidc/userinfo
      - OIDC_ISSUER=https://id.primin.garden
      - OIDC_REDIRECT_URI=https://kb.primin.garden/auth/oidc.callback
      - OIDC_DISPLAY_NAME=Pocket ID
      - OIDC_SCOPES=openid email profile
      - OIDC_TOKEN_AUTH_METHOD=client_secret_post

      # База данных
      - DATABASE_URL=postgres://outline:password@postgres:5432/outline?sslmode=disable
      - REDIS_URL=redis://redis:6379

      # Секретные ключи
      - SECRET_KEY=60aefb0eada60e99aa439d8314e75fe5e73286d25855a8607d4fb43b8fdea904
      - UTILS_SECRET=f4008a727722ff2e31fd55ed7cb5eb1b6e7b84aace0c3f723d335d793535ed57

      # Почта (можно отключить, но оставим для уведомлений)
      - SMTP_HOST=smtp.yandex.ru
      - SMTP_PORT=465
      - SMTP_USERNAME=effector@skp.kz
      - SMTP_PASSWORD=app-password
      - SMTP_FROM_EMAIL=effector@skp.kz

      # Локальное хранилище файлов
      - FILE_STORAGE=local
      - FILE_STORAGE_UPLOADS=local
      - FILE_STORAGE_DATA_DIR=/var/lib/outline/uploads
      - FILE_STORAGE_UPLOAD_MAX_SIZE=52428800

    volumes:
      - ./uploads:/var/lib/outline/uploads

  postgres:
    image: postgres:14
    restart: always
    environment:
      POSTGRES_USER: outline
      POSTGRES_PASSWORD: password
      POSTGRES_DB: outline
    volumes:
      - postgres-data:/var/lib/postgresql/data

  redis:
    image: redis:alpine
    restart: always
    volumes:
      - redis-data:/data

volumes:
  postgres-data:
  redis-data:
  uploads:
```
# Не забываем про отказо-устройчивость
Если вы планируете развертывать это приложение в продакшне, то не забудьте подумать о резервном копировании вашего блока с данными. Это может быть любой инструмент. Главное чтобы он был и работал.

## Ссылки:
[^1]: Ссылки на дополнительные статьи по теме
https://blog.gurucomputing.com.au/Outline%20Knowledgebase%20Deployment/

