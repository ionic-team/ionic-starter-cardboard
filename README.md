## Ionic Cardboard

Use Ionic, Three.js and WebGL to build a Google Cardboard app. To get started, install the ionic and cordova CLI tools:

```bash
$ sudo npm install -g ionic cordova
$ ionic start myApp cardboard
```

Next, we should modify the `config.xml` file to force the app to be in landscape mode. Add this line anywhere inside of `<widget>`:

```xml
  <preference name="orientation" value="landscape" />
```

Then, to run it, cd into `myApp` and run:

```bash
$ ionic platform add ios
$ ionic build ios
$ ionic emulate ios
```

Substitute ios for android if not on a Mac, but if you can, the ios development toolchain is a lot easier to work with until you need to do anything custom to Android.

## Issues
Issues have been disabled on this repo, if you do find an issue or have a question consider posting it on the [Ionic Forum](http://forum.ionicframework.com/).  Or else if there is truly an error, follow our guidelines for [submitting an issue](http://ionicframework.com/contribute/#issues) to the main Ionic repository. On the other hand, pull requests are welcome here!
