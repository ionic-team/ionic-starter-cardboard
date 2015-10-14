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

    ionic.Platform.fullScreen();
    if (window.StatusBar) {
      return StatusBar.hide();
    }
  });
})

.controller('AppCtrl', ['$scope', '$ionicModal', function($scope, $ionicModal) {

  $scope.data = {
    enableAwesome: true
  }

  $ionicModal.fromTemplateUrl('settings.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal
  });

  $scope.openSettings = function() {
    $scope.modal.show();
  };

  $scope.closeSettings = function() {
    $scope.modal.hide();
  };

}])

.directive('cardboardGl', [function() {

  return {
    restrict: 'E',
    link: function($scope, $element, $attr) {
      create($element[0]);
    }
  }

  function create(glFrame) {
    var scene,
        camera,
        renderer,
        element,
        container,
        effect,
        controls,
        clock,

        // Particles
        particles = new THREE.Object3D(),
        totalParticles = 200,
        maxParticleSize = 200,
        particleRotationSpeed = 0,
        particleRotationDeg = 0,
        lastColorRange = [0, 0.3],
        currentColorRange = [0, 0.3],

        // City and weather API set up
        cities = [['Sydney', '2147714'], ['New York', '5128638'], ['Tokyo', '1850147'], ['London', '2643743'], ['Mexico City', '3530597'], ['Miami', '4164138'], ['San Francisco', '5391959'], ['Rome', '3169070']],
        cityWeather = {},
        cityTimes = [],
        currentCity = 0,
        currentCityText = new THREE.TextGeometry(),
        currentCityTextMesh = new THREE.Mesh();

    init();

    function init() {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.001, 700);
      camera.position.set(0, 15, 0);
      scene.add(camera);

      renderer = new THREE.WebGLRenderer();
      element = renderer.domElement;
      container = glFrame;
      container.appendChild(element);

      effect = new THREE.StereoEffect(renderer);

      // Our initial control fallback with mouse/touch events in case DeviceOrientation is not enabled
      controls = new THREE.OrbitControls(camera, element);
      controls.target.set(
        camera.position.x + 0.15,
        camera.position.y,
        camera.position.z
      );
      controls.noPan = true;
      controls.noZoom = true;

      // Our preferred controls via DeviceOrientation
      function setOrientationControls(e) {
        if (!e.alpha) {
          return;
        }

        controls = new THREE.DeviceOrientationControls(camera, true);
        controls.connect();
        controls.update();

        element.addEventListener('click', fullscreen, false);

        window.removeEventListener('deviceorientation', setOrientationControls, true);
      }
      window.addEventListener('deviceorientation', setOrientationControls, true);

      // Lighting
      var light = new THREE.PointLight(0x999999, 2, 100);
      light.position.set(50, 50, 50);
      scene.add(light);

      var lightScene = new THREE.PointLight(0x999999, 2, 100);
      lightScene.position.set(0, 5, 0);
      scene.add(lightScene);

      var floorTexture = THREE.ImageUtils.loadTexture('img/textures/wood.jpg');
      floorTexture.wrapS = THREE.RepeatWrapping;
      floorTexture.wrapT = THREE.RepeatWrapping;
      floorTexture.repeat = new THREE.Vector2(50, 50);
      floorTexture.anisotropy = renderer.getMaxAnisotropy();

      var floorMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        specular: 0xffffff,
        shininess: 20,
        shading: THREE.FlatShading,
        map: floorTexture
      });

      var geometry = new THREE.PlaneBufferGeometry(1000, 1000);

      var floor = new THREE.Mesh(geometry, floorMaterial);
      floor.rotation.x = -Math.PI / 2;
      scene.add(floor);

      var particleTexture = THREE.ImageUtils.loadTexture('img/textures/particle.png'),
          spriteMaterial = new THREE.SpriteMaterial({
          map: particleTexture,
          color: 0xffffff
        });

      for (var i = 0; i < totalParticles; i++) {
        var sprite = new THREE.Sprite(spriteMaterial);

        sprite.scale.set(64, 64, 1.0);
        sprite.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.75);
        sprite.position.setLength(maxParticleSize * Math.random());

        sprite.material.blending = THREE.AdditiveBlending;

        particles.add(sprite);
      }
      particles.position.y = 70;
      scene.add(particles);

      adjustToWeatherConditions();

      clock = new THREE.Clock();

      animate();
    }

    function adjustToWeatherConditions() {
      var cityIDs = '';
      for (var i = 0; i < cities.length; i++) {
        cityIDs += cities[i][1];
        if (i != cities.length - 1) cityIDs += ',';
      }
      getURL('http://api.openweathermap.org/data/2.5/group?id=' + cityIDs + '&APPID=b5c0b505a8746a1b2cc6b17cdab34535', function(info) {
        cityWeather = info.list;

        lookupTimezones(0, cityWeather.length);
      });
    }

    function lookupTimezones(t, len) {
      var tz = new TimeZoneDB;

      tz.getJSON({
          key: "GPH4A5Q6NGI1",
          lat: cityWeather[t].coord.lat,
          lng: cityWeather[t].coord.lon
      }, function(timeZone){
          cityTimes.push(new Date(timeZone.timestamp * 1000));

          t++;
          if (t < len) lookupTimezones(t, len);
          else applyWeatherConditions();
      });
    }

    function applyWeatherConditions() {
      displayCurrentCityName(cities[currentCity][0]);

      var info = cityWeather[currentCity];

      particleRotationSpeed = info.wind.speed / 2; // dividing by 2 just to slow things down
      particleRotationDeg = info.wind.deg;

      var timeThere = cityTimes[currentCity] ? cityTimes[currentCity].getUTCHours() : 0,
          isDay = timeThere >= 6 && timeThere <= 18;

      if (isDay) {
        switch (info.weather[0].main) {
          case 'Clouds':
            currentColorRange = [0, 0.01];
            break;
          case 'Rain':
            currentColorRange = [0.7, 0.1];
            break;
          case 'Clear':
          default:
            currentColorRange = [0.6, 0.7];
            break;
        }
      } else {
        currentColorRange = [0.69, 0.6];
      }

      if (currentCity < cities.length-1) currentCity++;
      else currentCity = 0;

      setTimeout(applyWeatherConditions, 5000);
    }

    function displayCurrentCityName(name) {
      scene.remove(currentCityTextMesh);

      currentCityText = new THREE.TextGeometry(name, {
        size: 4,
        height: 1
      });
      currentCityTextMesh = new THREE.Mesh(currentCityText, new THREE.MeshBasicMaterial({
        color: 0xffffff, opacity: 1
      }));

      currentCityTextMesh.position.y = 10;
      currentCityTextMesh.position.z = 20;
      currentCityTextMesh.rotation.x = 0;
      currentCityTextMesh.rotation.y = -180;

      scene.add(currentCityTextMesh);
    }

    function animate() {
      var elapsedSeconds = clock.getElapsedTime(),
          particleRotationDirection = particleRotationDeg <= 180 ? -1 : 1;

      particles.rotation.y = elapsedSeconds * particleRotationSpeed * particleRotationDirection;

      // We check if the color range has changed, if so, we'll change the colours
      if (lastColorRange[0] != currentColorRange[0] && lastColorRange[1] != currentColorRange[1]) {

        for (var i = 0; i < totalParticles; i++) {
          particles.children[i].material.color.setHSL(currentColorRange[0], currentColorRange[1], (Math.random() * (0.7 - 0.2) + 0.2));
        }

        lastColorRange = currentColorRange;
      }

      requestAnimationFrame(animate);

      update(clock.getDelta());
      render(clock.getDelta());
    }

    function resize() {
      var width = container.offsetWidth;
      var height = container.offsetHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      effect.setSize(width, height);
    }

    function update(dt) {
      resize();

      camera.updateProjectionMatrix();

      controls.update(dt);
    }

    function render(dt) {
      effect.render(scene, camera);
    }

    function fullscreen() {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen();
      } else if (container.mozRequestFullScreen) {
        container.mozRequestFullScreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      }
    }

    function getURL(url, callback) {
      var xmlhttp = new XMLHttpRequest();

      xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4) {
           if (xmlhttp.status == 200){
               callback(JSON.parse(xmlhttp.responseText));
           }
           else {
               console.log('We had an error, status code: ', xmlhttp.status);
           }
        }
      }

      xmlhttp.open('GET', url, true);
      xmlhttp.send();
    }
  }
}]);
