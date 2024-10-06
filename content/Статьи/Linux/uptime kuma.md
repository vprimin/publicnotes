---
title: uptime kuma
tags:
  - "#monitoring"
  - Linux
  - docker
---
![](https://youtu.be/Fv-srHz4GsU)

> [!NOTE] В данной статье приводится пример установки на AWS EC2
# Регистрируем тенант на aws

 1. Идем в Network & Security > Security Groups > Create security group 
inbound rules: открываем входящие порты TCP: 22, 80, 443, 3001

2. Далее Instances > Launch Instances > Ubuntu 24.04 t2.micro

3. Назначаем IP
4. Запускаем машину, подключаемся по ssh
5. [[docker|устанавливаем docker]]
## Устанавливаем uptime kuma
в docker контейнере
Сначала создадим volume 
```
docker volume create uptime-kuma-data
```
Потом ставим
```
docker run -d -p 3001:3001 --name uptime-kuma -v uptime-kuma-data:/app/data louislam/uptime-kuma
```
Далее проверяем наш uptime kuma должен быть доступен по адресу
http://ваш-ip-адрес:3001
Можете просто убедиться что страница открывается, далее
## Установим NGINX и certbot
### Nginx
Нам понадобится веб-сервер nginx для проксирования портов и certbot для установки ssl сертификатов
```
sudo apt install nginx python3-certbot-nginx -y
```
Далее создадим файл конфигурации нашего сайта nginx пока что только по http
```
sudo nano /etc/nginx/sites-available/kuma
```
вставим следующее содержимое, не забываем менять 'kuma.skp.kz' на ваши значения

```
server {
    listen 80;
    server_name kuma.skp.kz;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

включаем конфигурацию сайта

```
sudo ln -s /etc/nginx/sites-available/kuma /etc/nginx/sites-enabled/
```

Удаляем сайт по умолчанию

```
sudo rm /etc/nginx/sites-available/default
sudo rm /etc/nginx/sites-enabled/default
```
проверяем синтаксис на ошибки 
```
sudo nginx -t
```

и перезапускаем веб-сервер

```
sudo systemctl reload nginx
```
### Установим SSL сертификаты
```
sudo certbot --nginx -d kuma.skp.kz
```
Вводим адрес электронной почты, затем отвечаем Y, на следующий вопрос - N

Далее нам придется заново отредактировать конфигурацию сайта уже с учетом выданных нам сертификатам

```
sudo nano /etc/nginx/sites-available/kuma
```

Меняем содержимое файла на следующее (меняем kuma.skp.kz на ваши)
```
server {
    listen 80;
    server_name kuma.skp.kz;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name kuma.skp.kz;

    ssl_certificate /etc/letsencrypt/live/kuma.skp.kz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/kuma.skp.kz/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers "ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256";
    ssl_session_timeout 1d;
    ssl_session_cache shared:MozSSL:10m;  # about 40000 sessions
    ssl_session_tickets off;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Проверяем
```
sudo nginx -t
```
Перезагружаем веб сервер
```
sudo systemctl reload nginx
```

Готово.  Сервис uptime kuma должен будет доступен по https://вашсуб.домен.com

## Настроим Telegram
Для настройки уведомлений в телеграм нам понадобиться бот 'BotFather'

![[Pasted image 20240805182316.png]]

Добавляем. Пишем ему
/newbot  - он спросит имя бота - вводим любое с '_bot' на конце
Далее он выдаст вам API Token - сохраните его так как он вам понадобиться в будущем для настройки уведомлений. 
Также можете разворачивать другие инстанции локально в других сетях и использовать те же самые токены для подключения.