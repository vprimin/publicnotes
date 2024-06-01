# Access iCloud Drive quicker in Terminal by creating a symbolic link (symlink)


~/Library/Mobile\ Documents/com\~apple\~CloudDocs
gdfgdfg

Fortunately you can use a symbolic link or a symlink so that you could easily access your documents in iCloud Drive from Terminal with something like this:

You can do this using the `link` command or its alias `ln` from Terminal. So let’s say we’ll want to create a symlink to `iCloud` in your home folder `~`. You’ll want to run this command,

```
ln -s ~/Library/Mobile\ Documents/com\~apple\~CloudDocs ~/iCloud
```

#ohmyzsh 