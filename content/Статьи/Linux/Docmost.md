---
date: 05/03/2025
title: docmost
tags:
  - aws
  - docker
  - Linux
  - ubuntu
  - vpn
---

# Бесплатная база знаний — Docmost
URL: https://docmost.com/ 

![](https://youtu.be/ezzYAvGsl8Y)

> [!NOTE] В данной статье
> Расскажу как можно в домашних условиях развернуть бесплатную базу знаний для совместной работы.
> Статья не подробная, а только описывает сам сервис и его поднятие
![[SCR-20250305-mimb.png]]
## Итак, что нам понадобится:
1. Доменное имя. Можно субдомен. subdomain.domain.com (опционально)
2. Публичный IP-адрес (обычно Cloud провайдеры бесплатно предоставляют)
3. Виртуальная машина, либо сетевое хранилище (как у меня)
4. Руки и голова

### Поднимаем виртуальную машину Ubuntu
По традиции начинаем с аддейтов
```
sudo su
apt update && apt upgrade -y
reboot
```

Далее установим докер 

```
sudo apt install docker.io docker-compose -y
```

Настройте пользователя для работы с Docker без sudo:

```
sudo usermod -aG docker $USER
```

После этой команды потребуется выйти и снова войти в систему, чтобы изменения вступили в силу.

Создайте директорию для Docmost и перейдите в неё:
```
mkdir ~/docmost 
cd ~/docmost
```

Создайте файл 
```
nano docker-compose.yml
```

docker-compose.yml
```
version: '3.8'

  

services:

db:

image: postgres:15

container_name: docmost-db

restart: always

environment:

POSTGRES_USER: docmost_user

POSTGRES_PASSWORD: yourpassword

POSTGRES_DB: docmost

volumes:

- pg_data:/var/lib/postgresql/data

ports:

- "5432:5432"

healthcheck:

test: ["CMD-SHELL", "pg_isready -U docmost_user -d docmost"]

interval: 10s

timeout: 5s

retries: 5

  

redis:

image: redis:latest

container_name: docmost-redis

restart: always

  

app:

image: docmost/docmost:latest

container_name: docmost

restart: always

depends_on:

db:

condition: service_healthy

redis:

condition: service_started

environment:

DATABASE_URL: "postgres://docmost_user:yourpassword@db:5432/docmost"

REDIS_URL: "redis://redis:6379"

APP_SECRET: "thisisyour32digitspasswordphrase"

MAIL_DRIVER: "smtp"

SMTP_HOST: "smtp.yandex.ru"

SMTP_PORT: "465"

SMTP_USERNAME: "notifications@skp.kz"

SMTP_PASSWORD: "applICaTi0NPa$$w0rd"

SMTP_SECURE: "true"

MAIL_FROM_ADDRESS: "notifications@skp.kz

MAIL_FROM_NAME: "docs.skp.kz"

APP_URL: "https://docs.skp.kz"

WEB_SOCKET_URL: "wss://docs.skp.kz/socket.io/"

ports:

- "8065:3000"

  

volumes:

pg_data:
```

Запускаем наш проект:

```
docker-compose up -d
```

Если все прошло успешно, то приложение должно быть доступно по 
http://ip-address:8065

Далее при желании можно прикрутить web-сервер и SSL сертификат, чтобы приложение было доступно из глобальной сети.