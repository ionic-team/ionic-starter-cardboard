## Ionic Cardboard

Use Ionic, Three.js and WebGL to build a Google Cardboard app as part of the [Angular Cardboard Hackathon](https://angular.io/cardboard/). To get started, install the ionic and cordova CLI tools:

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

Substitute ios for android if you'd like to target android instead. The iOS toolchain only works on a Mac, though it can be a bit faster to get up and running with for testing.

