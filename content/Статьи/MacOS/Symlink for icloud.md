---
title: Ярлык for iCloud
tags:
  - MacOS
---
Я люблю упорядочивать файлы и папки в том числе в своем iCloud и использую для этого [[Midnight Commander]]

По умолчанию эта папка расположена в MacOS по адресу:
`~/Library/Mobile\ Documents/com\~apple\~CloudDocs`

И добираться до нее из терминала очень долго и не удобно.
Для решения этой задачи можно просто создать ярлык (symlink) выполнив следующую команду.

```
ln -s ~/Library/Mobile\ Documents/com\~apple\~CloudDocs ~/iCloud
```
Это создаст ярлык в вашей домашней директории пользователя