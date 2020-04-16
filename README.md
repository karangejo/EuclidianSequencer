# EuclidianSequencer
Midi Sequencer for Euclidian rythms

Created with Electron and Node.js uses the midi library 

# Installation
clone the repo and ```cd``` into the directory then run:
```bash
npm install
```
then chose the correct script from package.json to run according to your operating system
```json
"package-mac": "electron-packager . --overwrite --platform=darwin --arch=x64 --icon=assets/icons/mac/icon.icns --prune=true --out=release-builds",

"package-win": "electron-packager . euSeq --overwrite --asar=true --platform=win32 --arch=ia32 --icon=assets/icons/win/icon.ico --prune=true --out=release-builds --version-string.CompanyName=CE --version-string.FileDescription=CE --version-string.ProductName=\"Euclidian Beat Sequencer\"",

"package-linux": "electron-packager . euSeq --overwrite --asar=true --platform=linux --arch=x64 --icon=assets/icons/png/icon.png --prune=true --out=release-builds",

"build": "electron-packager . euSeq --icon=assets/icons/png/icon.png prune=true",

"package": "asar pack euSeq-linux-x64/resources/app/ euSeq-linux-x64/resources/app.asar"
```
For example: If you are on linux you would run:
```bash
npm run package-linux
```
you may have to tweak these scripts to get everything working. For more info please refer to the [electron docs](https://www.electronjs.org/docs), and the [electron packager github](https://github.com/electron/electron-packager).I have tested on ubuntu 16 only.

For more info on Euclidian Rhythms please check out [this paper](http://cgm.cs.mcgill.ca/~godfried/publications/banff.pdf).
