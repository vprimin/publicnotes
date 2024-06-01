Запускаем команду в терминале
```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

или еще проще, скачиваем .pkg файл и запускаем
https://github.com/Homebrew/brew/releases 

Далее добавляем brew в PATH

```
(echo; echo 'eval "$(/opt/homebrew/bin/brew shellenv)"') >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```
