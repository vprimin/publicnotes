---
title: owncloud
date: 12/07/2024
tags:
  - Linux
  - owncloud
  - ubuntu
---

![[Pasted image 20240712150204.png|500]]

> [!NOTE] Вместо предисловия
> Эта история началась с того, что завалялся на полке 8 Тб жесткий диск. Вообще я больше предпочитаю NAS в виде Synology либо QNAP. Но так как под рукой были только свободное время и желание решил развернуть на базе виртуальной машины. 
> Кроме [Owncloud](https://owncloud.com/) есть еще [FileCloud](https://www.filecloud.com/) и [NextCloud](https://nextcloud.com/). Может быть они вам больше понравятся. Мне owncloud приглянулся за чистоту дизайна.


# Установка на базе Ubuntu 24.04 Server
Сначала начнем с классического обновления системы
```
sudo su
apt update
apt upgrade -y
reboot
```
После перезагрузки установим веб-сервер и СУБД
```
sudo su
apt install apache2 mariadb-server -y
systemctl enable --now apache2
systemctl status apache2 --no-page -l
```
owncloud также требует модуль php7.4 установим
```
add-apt-repository ppa:ondrej/php
apt update
sudo apt install php7.4 php7.4-{opcache,gd,curl,mysqlnd,intl,json,ldap,mbstring,mysqlnd,xml,zip} -y
```

Выполним установку СУБД
`sudo mysql_secure_installation`
Отвечаем на вопросы:
```
Switch to unix_socet_authentication: n
Change the root password: n
Remove anonynous users: y
Disallow login remotely: y
Remove test database and access to it: y
Reload privilege tables now: y
```

Далее созданим базу данных и пользователя.
```
sudo mysql -u root -p
CREATE DATABASE owncloud;
CREATE USER 'ownclouduser'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON owncloud.* TO 'ownclouduser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Замените значения пароля 'password' на свои так как тут предоставлены тестовые

Далее скачаем и распакуем owncloud
```
wget https://download.owncloud.com/server/stable/owncloud-complete-latest.tar.bz2
tar -xvf owncloud-complete-latest.tar.bz2
sudo mv owncloud /var/www/html/
sudo chown -R www-data: /var/www/html/owncloud
```

Далее создадим конфигурационный файл для веб сервера
`sudo nano /etc/apache2/sites-available/owncloud.conf`
Вставим в него следующее содержимое, замените айпи адрес на свой
```
<VirtualHost *:80>
  ServerAdmin admin@example.com
  DocumentRoot /var/www/html/owncloud
  ServerName 192.168.151.18
  Alias / "/var/www/html/owncloud/"

  <Directory /var/www/html/owncloud/>
    Options +FollowSymlinks
    AllowOverride All

    <IfModule mod_dav.c>
      Dav off
    </IfModule>

    SetEnv HOME /var/www/html/owncloud
    SetEnv HTTP_HOME /var/www/html/owncloud
  </Directory>

  ErrorLog ${APACHE_LOG_DIR}/owncloud_error.log
  CustomLog ${APACHE_LOG_DIR}/owncloud_access.log combined
</VirtualHost>
```
Замените значения 'example.com' и 'your-domain.com' на свои.
Перезагружаем сервер командой `reboot`
Проверим доступность сервера по адресу http://ваш-ip/owncloud

Если все прошло хорошо, то система предложит создать учетную запись администратора. Для подключения к БД вводим значения которые использовали ранее.

## Делаем короткий URL
Даллее отредактируем файл настрое owncloud чтобы наш веб сервер отрабатывал http://ip/. вместо http://ip/owncloud
`sudo nano /var/www/html/owncloud/config/config.php`
заменим значение 
`'overwrite.cli.url' => 'http://localhost/'`

Далле займемся ssl сертификатами чтобы наш сайт был доступен через 443 порт

Для этого нам понадобиться DNS A-запись в виде site.com либо cloud.site.com а также пробросить порты на маршрутизаторе до вашего хоста. Как это делать в данной статье пропускается.

## Подключаем SSL
Установим службу sertbot
`sudo apt install certbot python3-certbot-apache -y`

Далее запустим процедуру регистрации сертификатов 
`sudo certbot --apache`

Даллее нужно будет добавить пути к сертификатам в настройках веб-сервера

`sudo nano /etc/apache2/sites-available/owncloud.conf`
замените значения drive.skp.kz на свои

```
<IfModule mod_ssl.c>
<VirtualHost *:443>
  ServerAdmin admin@example.com
  DocumentRoot /var/www/html/owncloud
  ServerName drive.skp.kz
  Alias / "/var/www/html/owncloud/"

  <Directory /var/www/html/owncloud/>
    Options +FollowSymlinks
    AllowOverride All

    <IfModule mod_dav.c>
      Dav off
    </IfModule>

    SetEnv HOME /var/www/html/owncloud
    SetEnv HTTP_HOME /var/www/html/owncloud
  </Directory>

  ErrorLog ${APACHE_LOG_DIR}/owncloud_error.log
  CustomLog ${APACHE_LOG_DIR}/owncloud_access.log combined

  SSLEngine on
  SSLCertificateFile /etc/letsencrypt/live/drive.skp.kz/fullchain.pem
  SSLCertificateKeyFile /etc/letsencrypt/live/drive.skp.kz/privkey.pem
  Include /etc/letsencrypt/options-ssl-apache.conf

</VirtualHost>
</IfModule>
```

Далее в настройках owncloud нужно будет добавить наш домен в доверенные
Отредактируем файл /var/www/html/owncloud/config/config.php и добавтие в него строчку
```
'trusted_domains' =>
array (
  0 => 'localhost',
  1 => '192.168.151.19',
  3 => 'drive.skp.kz'
),
```

## Кастомизация