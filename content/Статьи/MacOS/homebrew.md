---
title: Homebrew
---
![[homebrew_logo.svg]]

Brew (или Homebrew) — это менеджер пакетов для macOS и Linux. Он позволяет легко устанавливать, обновлять и управлять программным обеспечением на этих операционных системах. Homebrew автоматически решает зависимости и предлагает простой способ установки нужных приложений и утилит через командную строку.

```
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

После установки выполним команду чтобы добавить brew в zsh 

```
(echo; echo 'eval "$(/opt/homebrew/bin/brew shellenv)"') >> /Users/yourusername/.zprofile
    eval "$(/opt/homebrew/bin/brew shellenv)"
```

Таким образом, команда eval $(/opt/homebrew/bin/brew shellenv) добавляет необходимые пути и переменные окружения для работы Homebrew в текущем сеансе оболочки. Это особенно полезно, если вы только что установили Homebrew и хотите сразу же использовать его без перезапуска терминала.

