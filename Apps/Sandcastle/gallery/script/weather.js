var resetCameraFunction = function () {
  scene.camera.setView({
    destination: new Cesium.Cartesian3(
      277096.634865404,
      5647834.481964232,
      2985563.7039122293
    ),
    orientation: {
      heading: 4.731089976107251,
      pitch: -0.32003481981370063,
    },
  });
};
resetCameraFunction();


var rainParticleSize = 15.0;
var rainRadius = 100000.0;
var rainImageSize = new Cesium.Cartesian2(
  rainParticleSize,
  rainParticleSize * 2.0
);

var rainSystem;

var rainGravityScratch = new Cesium.Cartesian3();
var rainUpdate = function (particle, dt) {
  rainGravityScratch = Cesium.Cartesian3.normalize(
    particle.position,
    rainGravityScratch
  );
  rainGravityScratch = Cesium.Cartesian3.multiplyByScalar(
    rainGravityScratch,
    -1050.0,
    rainGravityScratch
  );

  particle.position = Cesium.Cartesian3.add(
    particle.position,
    rainGravityScratch,
    particle.position
  );

  var distance = Cesium.Cartesian3.distance(
    scene.camera.position,
    particle.position
  );
  if (distance > rainRadius) {
    particle.endColor.alpha = 0.0;
  } else {
    particle.endColor.alpha =
      rainSystem.endColor.alpha / (distance / rainRadius + 0.1);
  }
};

rainSystem = new Cesium.ParticleSystem({
  modelMatrix: new Cesium.Matrix4.fromTranslation(
    scene.camera.position
  ),
  speed: -1.0,
  lifetime: 15.0,
  emitter: new Cesium.SphereEmitter(rainRadius),
  startScale: 1.0,
  endScale: 0.0,
  image: "../SampleData/circular_particle.png",
  emissionRate: 9000.0,
  startColor: new Cesium.Color(0.27, 0.5, 0.7, 0.0),
  endColor: new Cesium.Color(0.27, 0.5, 0.7, 0.98),
  imageSize: rainImageSize,
  updateCallback: rainUpdate,
});
scene.primitives.add(rainSystem);

// button
Sandcastle.addToolbarButton("Reset Camera", resetCameraFunction);

// drop down
var options = [
  {
    text: "Snow",
    onselect: function () {
      rainSystem.show = false;
      snowSystem.show = true;

      scene.skyAtmosphere.hueShift = -0.8;
      scene.skyAtmosphere.saturationShift = -0.7;
      scene.skyAtmosphere.brightnessShift = -0.33;

      scene.fog.density = 0.001;
      scene.fog.minimumBrightness = 0.8;
    },
  },
  {
    text: "Rain",
    onselect: function () {
      rainSystem.show = true;
      snowSystem.show = false;

      scene.skyAtmosphere.hueShift = -0.97;
      scene.skyAtmosphere.saturationShift = 0.25;
      scene.skyAtmosphere.brightnessShift = -0.4;

      scene.fog.density = 0.00025;
      scene.fog.minimumBrightness = 0.01;
    },
  },
];
Sandcastle.addToolbarMenu(options);