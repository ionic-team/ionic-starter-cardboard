// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs).
    // The reason we default this to hidden is that native apps don't usually show an accessory bar, at
    // least on iOS. It's a dead giveaway that an app is using a Web View. However, it's sometimes
    // useful especially with forms, though we would prefer giving the user a little more room
    // to interact with the app.
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // Set the statusbar to use the default style, tweak this to
      // remove the status bar on iOS or change it to use white instead of dark colors.
      StatusBar.styleDefault();
    }
  });
})

.controller('AppCtrl', ['$scope', function($scope) {
  var self = this;

  var lastMagneticHeading = 0;

  function compass(heading) {
    var data = angular.extend({
      alpha: heading.magneticHeading,
      magneticHeading: heading.webkitCompassHeading || heading.alpha
    }, heading);

    var pictureWidth = self.imageWidth;
    //var rest = data.magneticHeading - lastMagneticHeading;

    //if (rest >= 6 || rest <= -6) {
      var picturePosition = Math.abs(Math.round(pictureWidth / 360 * data.magneticHeading));

      self.picturePosition = picturePosition;

      lastMagneticHeading = data.magneticHeading;
    //}

    $scope.$apply();
  }

  function compassErr(err) {
    console.error('Unable to get compass heading', err);
  }

  if(!navigator.compass) {
    window.addEventListener('deviceorientation', compass);
  } else {
    navigator.compass.watchHeading(compass, compassErr, { frequency: 50 });
  }

  this.getTransition = function() {
    if(this.picturePosition <= 50 && this.picturePosition >= 0 || this.picturePosition <= this.imageWidth && this.picturePosition >= (this.imageWidth - 50)) {
      return "none";
    } else {
      return "0.9s linear";
    }
  };

  this.getPanStyle = function() {

    var image = new Image();

    image.onload = function () {
      self.imageWidth = image.width;
    };

    image.src = "img/panorama.jpg";

    console.log('bgPosition', this.picturePosition);

    return {
      width: '100%',
      height: window.innerHeight + "px",
      backgroundPosition: "-" + this.picturePosition + 'px 490px',
      backgroundImage: "url(" + image.src + ")",
      backgroundSize: this.imageWidth + "px 774px",
      transition: this.getTransition(),
      transform: "translate3d(0, 0, 0)"
    };
  }
}])
