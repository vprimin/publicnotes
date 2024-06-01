## Рецепт приготовления

- [ ] system>identity
- [ ] admin user-off  skp user-on (system-users)
- [ ] (ip-services) www доступ - off  winbox  change  port (ip-services)
- [ ] update до последней версии
- [ ] Создать шаблоны сертификатов из командной строки
- [ ] Создать  коревой  сертификат.  И еще  два.
- [ ] подписать  сертификаты
- [ ] Экспортируем сертификаты
- [ ] Скачиваем в папку с openvpn три файла 1).key 2)ca-certificate 3)сlient sert
- [ ] _переименовываем .key в_  client.key
- [ ] запускаем cmd от админа переходим в папку bin Open vpn
- [ ] делаем openssl.exe rsa -in client.key -out client.key (снимаем защиту)
- [ ] собираем .ovpn файл с помощью notepad++ _ca-certificate сlient sert .key
- [ ] создаем ip-pool 10.0.0.25-10.0.0.100 (например)
- [ ] создаем ppp-profile указываем pool (еще вкладка протокол) encryption-yes_
- [ ] включаем ovpn server  (указываем профиль, сертификат сервера )сhipeer =null
- [ ] создаем правило firewall input tcp 1194 (action-accept
***

==Вводи эти команды по одной!!!==
##  создаем шаблоны
%%вводим команды по одной%%
```
/certificate
add name=ca-template common-name=ovpn.local days-valid=3650 key-size=2048 key-usage=crl-sign,key-cert-sign

/certificate add name=server-template common-name=server.ovpn.local days-valid=3650 key-size=2048 key-usage=digital-signature,key-encipherment,tls-server

/certificate add name=client-template common-name=client.ovpn.local days-valid=3650 key-size=2048 key-usage=tls-client
```
## подписываем сертификаты из шаблонов

```
/certificate sign ca-template name=ca-certificate

/certificate sign server-template name=server-certificate ca=ca-certificate

/certificate sign client-template name=client-certificate ca=ca-certificate
```
## экспортируем сертификаты в files

```
/certificate export-certificate ca-certificate export-passphrase=""

/certificate export-certificate server-certificate export-passphrase=""
/certificate export-certificate client-certificate export-passphrase=123456789
```

Скачиваем в папку 'C:\Program Files\OpenVPN\bin'  client-certificate.key и переимновываем в client.key с openVPN Делаем  снятие пароля через командрую строку.  запускаем cmd.exe от  админа   и  вводим команду

`openssl.exe rsa -in client.key -out client.key`

Открываем конфигурационный файл .ovpn  c помощью блокнота (Notepad +) и вставляем солдержимое ключей а так же указываем маршрут назначения

Настраиваем файрвол
Создаем пул адресов для OpenVPN
Cоздаем профиль подключения (скриншоты)
Создаем пользователя (secrets)
Включаем  OpenVPN

![[Pasted image 20240530074652.png|350]]