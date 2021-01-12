var rainStatus = false;
var cloudyStatus = false;
var rainDropEntityList = [];
var rainDropPool = [];
var cloudEntityList = [];
var WIND_VERLOCITY = [0, 0, 0];
var MAX_CLOUD = 50;
var MAX_RAINDROP_PER_TICK = 50;
var TOTAL_RAIN_DROP = 3000;

function startup(Cesium) {
    console.log("startUp");
    // Cesium.BingMapsApi.defaultKey = "zzWjk21MKE6PA3dnArsG~mXUlKXIqFe8nByQlxoCiPw~AkVQrb4F729BlIgUx5FmvX4VSpoomW7YLR5MU2pPwIVoGbXpcREF8OXD12gAcZNC";
    Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1MDc0NTFhOC0zZjMxLTQ5NzctYjJmMy0yNzM0YTRhNDg3MmUiLCJpZCI6NzU4LCJpYXQiOjE2MDIxMzI1Mzd9.cLlRg9IJeBwtZUcG5qnBGKH0wM9cax6ArZrTvcNMMjk"
    // cesium viewer define
    var viewer = new Cesium.Viewer('cesiumContainer', {
        scene3DOnly: true,
        selectionIndicator: false,
        shouldAnimate: true,
    });

    // get scene, canvas, camera variables
    var scene = viewer.scene;
    var canvas = viewer.canvas;
    var camera = viewer.camera;

    // set canvas attribute
    // canvas.setAttribute('tabindex', '0'); // needed to put focus on the canvas
    // canvas.onclick = function () {
    //     canvas.focus();
    // };
    var entities = viewer.entities;
    entities.add({
        position : Cesium.Cartesian3.fromDegrees(105.782284, 21.039170),
        model : {
        uri : '6.5.glb',
        name : 'dhqg'
    }});
    
    var promise = Cesium.GeoJsonDataSource.load('../../SampleData/dhqg_road.json');
        promise.then(function(promise) 
        {   
            // add datasource to cesium viewer
            viewer.dataSources.add(promise);
            // get data entities
            var entities = promise.entities.values;
            // check each entity:
            //  case road: set gray color.
            for (var i = 0; i < entities.length; i++) 
            {  
                var entity = entities[i];
                // set material
                
                if ( entity.properties.name == 'Road' )
                {
                    entity.polygon.material = Cesium.Color.GRAY;
                    entity.polygon.outlineColor = Cesium.Color.GRAY;
                    //console.log(entity.polygon.material);
                }
            }
            //enableDefaultEventHandler(true );
            // camera fly to view pos
            //viewer.flyTo(promise);

        }).otherwise(function(error)
        {
                //Display any errrors encountered while loading.
                window.alert(error);
        });
    var flags = new Object();
    //
    function normalize(number, max, min, deltaTime) {
        var add = (Math.random() > 0.5) ? 1 : -1;

        if (number < max || number > min) {
            return number + add * Math.random() * (max - min) * deltaTime / 1000;
        } else {
            if (number > max) return max;
            if (number < min) return min;
        }

    }
    //
    var raindropModel = {
                uri: '../3d_model/raindrop.gltf',
                minimumPixelSize: 6,
                maximumScale: 0.5,
                scale: 0.008
            };
    function createModelRaindrop(viewer, Cesium, x, y, z) {
        var position = Cesium.Cartesian3.fromDegrees(x, y, z);
        var heading = Cesium.Math.toRadians(0);
        var pitch = Cesium.Math.toRadians(0);
        var roll = Cesium.Math.toRadians(-90);
        var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
        var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);

        var entity = viewer.entities.add({
            name: 'Raindrop',
            position: position,
            orientation: orientation,
            model: raindropModel,
            statistic: {
                verlocity: Math.random() * 10 + 25,
                x: x,
                y: y,
                z: z
            }

        });
        // entity.position.setInterpolationOptions({
        //     interpolationDegree: 1,
        //     interpolationAlgorithm: Cesium.LinearApproximation
        // });
        rainDropEntityList.push(entity);
    }

    function spamCloudRandomly(count) {
        var privotPosition = [105.7814, 21.0370];
        var Y = 0.00395; //fromY
        var X = 0.00202; //fromX
        for (var i = 0; i < count; i++) {
            createModelCloud(viewer, Cesium, privotPosition[0] + Math.random() * X, privotPosition[1] + Math.random() * Y, 100 - Math.random() * 10);
        }
    }

    function spamRaindropRandomly(count) {
        if (count > MAX_RAINDROP_PER_TICK) {
            count = MAX_RAINDROP_PER_TICK;
        }
        var privotPosition = [105.7814, 21.0370];
        var height = 0.00395; //fromY
        var width = 0.00202; //fromX
        for (var i = 0; i < count; i++) {
            if (rainDropPool.length > 0) {
                var entity = rainDropPool.pop();
                entity.show = true;
                rainDropEntityList.push(entity);
            } else {
                createModelRaindrop(viewer, Cesium, privotPosition[0] + Math.random() * width, privotPosition[1] + Math.random() * height, 100);
            }
        }

    }

    function resetRaindrop(entity) {
        var privotPosition = [105.7814, 21.0370];
        var height = 0.00395; //fromY
        var width = 0.00202; //fromX
        entity.statistic.x = privotPosition[0] + Math.random() * width;
        entity.statistic.y = privotPosition[1] + Math.random() * height;
        entity.statistic.z = 100;
        entity.statistic.verlocity = Math.random() * 10 + 25;
        Cesium.Cartesian3.fromDegrees(entity.statistic.x, entity.statistic.y, entity.statistic.z, Cesium.Ellipsoid.WGS84, entity.position);
        entity.position.setValue(entity.position, 0);
    }
    //createModelCloud(viewer, Cesium, 100);
    // spamRaindropRandomly();

    viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER;

    var lastTimeAnimation = -1;
    var lastTimeSpaming = -1;
    var debug = true;

    viewer.clock.onTick.addEventListener(function () {
        if (lastTimeAnimation == -1 || lastTimeSpaming == -1) {
            lastTimeAnimation = Date.now();
            lastTimeSpaming = Date.now();
            return;
        }

        var deltaTime = Date.now() - lastTimeAnimation;
        if (deltaTime > 22) {
            deltaTime = deltaTime / 1000;
            var i = rainDropEntityList.length;

            while (i--) {
                var entity = rainDropEntityList[i];
                var statistic = entity.statistic;
                if (statistic.z == 0) {
                    entity.show = false;
                    rainDropPool.push(entity);
                    resetRaindrop(entity);
                    rainDropEntityList.splice(i, 1);
                    continue;
                }
                statistic.verlocity = statistic.verlocity + 9.8 * deltaTime;
                var dz = 0.5 * deltaTime * deltaTime * 9.8 + statistic.verlocity * deltaTime;
                var dx = WIND_VERLOCITY[0] * deltaTime;
                var dy = WIND_VERLOCITY[1] * deltaTime;
                statistic.z = statistic.z - dz;
                statistic.y = statistic.y + dy;
                statistic.x = statistic.x + dx;

                if (statistic.z < 0) {
                    statistic.z = 0;
                }


                Cesium.Cartesian3.fromDegrees(statistic.x, statistic.y, statistic.z, Cesium.Ellipsoid.WGS84, entity.position);
                entity.position.setValue(entity.position, 0);
            }

            lastTimeAnimation = Date.now();
        }
        if (Date.now() - lastTimeSpaming > 333) {

            if (cloudyStatus) {
                if (cloudEntityList.length <= 0) {
                    spamCloudRandomly(MAX_CLOUD);
                }
            } else {
                for (var i = 0; i < cloudEntityList.length; i++) {
                    viewer.entities.remove(cloudEntityList[i]);
                }
                cloudEntityList = [];
            }//end cloud spamming

            if (rainDropEntityList.length <= TOTAL_RAIN_DROP) {
                if (rainStatus) {
                    spamRaindropRandomly(TOTAL_RAIN_DROP - rainDropEntityList.length);

                }

            }
            lastTimeSpaming = Date.now();
        }
    });

    Sandcastle.addToolbarButton('VNU Campus', function () {
        // promise allow to preload datasource before use
            enableDefaultEventHandler(true);
            viewer.zoomTo(viewer.entities);
    });

    Sandcastle.addToolbarButton('Visit mode', function () {
        var ellipsoid = scene.globe.ellipsoid;

        // define a global variable for camera control input handler:
        var handler = new Cesium.ScreenSpaceEventHandler(canvas);
        enableDefaultEventHandler(false);
        var startMousePosition;
        var mousePosition;
        // set flag
        flags.looking = false;
        flags.moveForward = false;
        flags.moveBackward = false;
        flags.moveUp = false;
        flags.moveDown = false;
        flags.moveLeft = false;
        flags.moveRight = false;
        // keyboard pressed:
        handler.setInputAction(function(movement) {
            flags.looking = true;
            mousePosition = startMousePosition = Cesium.Cartesian3.clone(movement.position);
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
        
        
        // keyboard released:
        handler.setInputAction(function(position) {
            flags.looking = false;
        }, Cesium.ScreenSpaceEventType.LEFT_UP);
        function getFlagForKeyCode(keyCode) {
            switch (keyCode) {
            case 38:
                return 'moveForward';
            case 40:
                return 'moveBackward';
            case 'F'.charCodeAt(0):
                return 'moveUp';
            case 'L'.charCodeAt(0):
                return 'moveDown';
            case 39:
                return 'moveRight';
            case 37:
                return 'moveLeft';
            default:
                return undefined;
            }
        }
        document.addEventListener('keydown', function(e) {
            var flagName = getFlagForKeyCode(e.keyCode);
            if (typeof flagName !== 'undefined') {
                flags[flagName] = true;
            }
        }, false);

        document.addEventListener('keyup', function(e) {
            var flagName = getFlagForKeyCode(e.keyCode);
            if (typeof flagName !== 'undefined') {
                flags[flagName] = false;
            }
        }, false);
        viewer.clock.onTick.addEventListener(function(clock) {
            if (flags.looking) {
                var width = canvas.clientWidth;
                var height = canvas.clientHeight;

                // Coordinate (0.0, 0.0) will be where the mouse was clicked.
                var x = (mousePosition.x - startMousePosition.x) / width;
                var y = -(mousePosition.y - startMousePosition.y) / height;

                var lookFactor = 0.05;
                camera.lookRight(x * lookFactor);
                camera.lookUp(y * lookFactor);
            }
            var moveRate = 1;
            var rotateRate = Math.PI / 120.0;
            if (flags.moveForward) {
                camera.moveForward(moveRate);
            }
            if (flags.moveBackward) {
                camera.moveBackward(moveRate);
            }
            if (flags.moveUp) {
                camera.moveUp(moveRate);
            }
            if (flags.moveDown) {
                camera.moveDown(moveRate);
            }
            if (flags.moveLeft) {
                camera.lookLeft(rotateRate);
            }
            if (flags.moveRight) {
                camera.lookRight(rotateRate);
            }
        });
        // set camera to groud view:
        camera.flyTo({
            destination : Cesium.Cartesian3.fromDegrees(105.7821141, 21.0364531, 2.0),
            orientation: {
                heading : Cesium.Math.toRadians(0.0), // value is 0.0 (north)
                pitch : Cesium.Math.toRadians(0),    // viewer is parallel to earth surface
                roll : 0.0                             // default value
            }
        });
    });

    // enable or disable the default event handlers
    function enableDefaultEventHandler(isEabled) {
        scene.screenSpaceCameraController.enableRotate = isEabled;
        scene.screenSpaceCameraController.enableTranslate = isEabled;
        scene.screenSpaceCameraController.enableZoom = isEabled;
        scene.screenSpaceCameraController.enableTilt = isEabled;
        scene.screenSpaceCameraController.enableLook = isEabled;
    }
    var videoElement = document.getElementById('trailer');
    Sandcastle.addToggleButton('Video guidelines', false, function(checked) {
        if (checked){
            videoElement.style.display = '';
        } else {
            videoElement.style.display = 'none';
        }
    });
    viewer.scene.renderError.addEventListener(function() {
        if(!videoElement.paused){
            videoElement.pause();
        }
        viewer.cesiumWidget.showErrorPanel('This browser does not support cross-origin WebGL video textures.', '', '');
    });

    function createModelCloud(viewer, Cesium, x, y, z) {
        var position = Cesium.Cartesian3.fromDegrees(x, y, z);
        var heading = Cesium.Math.toRadians(135 - Math.random() * 60);
        var pitch = 0;
        var roll = 0;
        var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
        var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
        var modelCloud = {
            uri: '../3d_model/clould_3d.gltf',
            minimumPixelSize: 128,
            maximumScale: 10
        };

        cloudEntity = viewer.entities.add({
            name: 'Cloud',
            position: position,
            orientation: orientation,
            model: modelCloud,
            statistic: {
                verlocity: 0,
                x: x,
                y: y,
                z: z
            }
        });
        cloudEntityList.push(cloudEntity);
    }

    Sandcastle.addToggleButton('Weather', false, function(checked) {
        if (checked){
            getWeatherInfo(function(weather){
                console.log(weather);
                //cloudyStatus = true;
                // viewer.shadows = true;
                rainStatus = true;
                // cloudyStatus = true;
                if (isRain(weather)) rainStatus = true;
                else if (isCloudy(weather)) cloudyStatus = true;
                else if (isStormy(weather)) 
                {
                    cloudyStatus = true;
                    rainStatus = true;
                }
                else viewer.shadows = true;
                console.log("Rainy: ", isRain(weather));
                console.log("Cloudy: ", isCloudy(weather));
                console.log("Stormy: ", isStormy(weather));
            })
        } else {
            rainStatus = false;
            cloudyStatus = false;
            viewer.shadows = false;
        }
    });

    var pin_track = new Array();
    function addPin(surfacePosition, name, description) {
        if (Cesium.defined(surfacePosition)) {
            //var distance = camera.position;
            pin_track[name] = viewer.entities.add({
                name: name,
                description: description,
                position: surfacePosition,
                billboard: {
                    image: pinBuilder.fromText(name, Cesium.Color.ROYALBLUE, 48).toDataURL(),
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                }
            });
        }
    }

    var pinBuilder = new Cesium.PinBuilder();

    var tc_D2 = Cesium.Cartesian3.fromDegrees(105.781687, 21.037585, 55);
    var tc_htnvd = Cesium.Cartesian3.fromDegrees(105.781416, 21.037386, 15);
    var tc_sunwa = Cesium.Cartesian3.fromDegrees(105.782309, 21.037378, 25);
    var tc_b2 = Cesium.Cartesian3.fromDegrees(105.782470, 21.037568, 27);
    var tc_g3 = Cesium.Cartesian3.fromDegrees(105.782104, 21.038120, 12);
    var tc_e3 = Cesium.Cartesian3.fromDegrees(105.782659, 21.038298, 48);
    var tc_e4 = Cesium.Cartesian3.fromDegrees(105.782893, 21.038087, 48);
    var tc_e1 = Cesium.Cartesian3.fromDegrees(105.782633, 21.037905, 48);
    var tc_e2 = Cesium.Cartesian3.fromDegrees(105.782499, 21.038080, 42);
    var tc_g7 = Cesium.Cartesian3.fromDegrees(105.781457, 21.038445, 31);
    var tc_b3 = Cesium.Cartesian3.fromDegrees(105.782026, 21.038443, 31);
    var tc_g2 = Cesium.Cartesian3.fromDegrees(105.783401, 21.038049, 25);
    var tc_c1t = Cesium.Cartesian3.fromDegrees(105.783350, 21.038407, 40);
    var tc_a2 = Cesium.Cartesian3.fromDegrees(105.783231, 21.039277, 55);
    var tc_a1 = Cesium.Cartesian3.fromDegrees(105.783236, 21.039732, 48);
    var tc_a3 = Cesium.Cartesian3.fromDegrees(105.782743, 21.039159, 25);
    var tc_a4 = Cesium.Cartesian3.fromDegrees(105.782781, 21.039748, 22);
    var tc_a5 = Cesium.Cartesian3.fromDegrees(105.782992, 21.039825, 22);
    var tc_cnn = Cesium.Cartesian3.fromDegrees(105.783093, 21.040225, 28);
    var tc_ntc = Cesium.Cartesian3.fromDegrees(105.781599, 21.040010, 32);
    var tc_kyd = Cesium.Cartesian3.fromDegrees(105.781540, 21.040313, 37);
    var tc_ktx = Cesium.Cartesian3.fromDegrees(105.781923, 21.040496, 37);
    var tc_ktxA = Cesium.Cartesian3.fromDegrees(105.781433, 21.040610, 37);
    var tc_ktxB = Cesium.Cartesian3.fromDegrees(105.782224, 21.040357, 37);
    var tc_ktxC = Cesium.Cartesian3.fromDegrees(105.782157, 21.040682, 37);
    var tc_shb = Cesium.Cartesian3.fromDegrees(105.781249, 21.038109, 17);
    var tc_g8 = Cesium.Cartesian3.fromDegrees(105.781482, 21.038266, 19);
    var tc_gd2 = Cesium.Cartesian3.fromDegrees(105.783042, 21.040750, 23);
    var tc_c1 = Cesium.Cartesian3.fromDegrees(105.781674, 21.039324, 30);
    var tc_c2 = Cesium.Cartesian3.fromDegrees(105.781583, 21.038678, 21);
    var tc_c3 = Cesium.Cartesian3.fromDegrees(105.781998, 21.038979, 21);
    var tc_c4 = Cesium.Cartesian3.fromDegrees(105.782226, 21.038691, 14);
    var tc_c5 = Cesium.Cartesian3.fromDegrees(105.782183, 21.039231, 16);
    var tc_c6 = Cesium.Cartesian3.fromDegrees(105.781384, 21.038971, 15);
    var tc_g5 = Cesium.Cartesian3.fromDegrees(105.781453, 21.037806, 15);

    var arr_location = [tc_D2, tc_htnvd, tc_sunwa, tc_b2, tc_g3, tc_e3, tc_e4,
                        tc_e1, tc_e2, tc_g7, tc_b3, tc_g2, tc_c1t, tc_a1, tc_a2,
                        tc_a3, tc_a4, tc_a5, tc_cnn, tc_ntc, tc_kyd, tc_ktx, tc_shb, 
                        tc_g8, tc_gd2, tc_c1, tc_c2, tc_c3, tc_c4, tc_c5, tc_c6,  
                        tc_ktxA, tc_ktxB, tc_ktxC, tc_g5];
    var arr_name = ["D2", "D1", "G1", "B2", "G3", "E3", "E4", "E1", "E2",
                    "G7", "B3", "G2", "C1T", "A1", "A2", "A3", "A4", "A5",
                    "A6", "A7", "Y1", "KTX", "B1", "G8", "GD2", "C1", "C2",
                    "C3", "C4", "C5", "C6", "14A", "14B", "14C", "G5"];

    var arr_desc = [des_ndh, des_htnvd, des_sunwa, des_b2, des_g3, des_e3, des_e4,
                    des_e1, des_e2, des_g7, des_b3, des_g2, des_c1t, des_a1, des_a2,
                    des_a3, des_a4, des_a5, des_cnn, des_ntc, des_kyd, des_ktx,  des_shb, 
                    des_g8, des_gd2, des_c1, des_c2, des_c3, des_c4, des_c5, des_c6, 
                    des_ktxA, des_ktxB, des_ktxC, des_g5];

    console.log(arr_location.length, arr_name.length, arr_desc.length)
    Sandcastle.addToggleButton('Buildings Information', false, function(checked) {
        if (checked){

            for (var i = 0; i < arr_location.length; i++){
                addPin(arr_location[i], arr_name[i], arr_desc[i])
            }
        } else {
            for (var i = 0; i < arr_location.length; i++){
                viewer.entities.remove(pin_track[arr_name[i]]);   
            }
        }
    });
    function getWeatherInfo(callback) {
        var apiLink = "http://dataservice.accuweather.com/currentconditions/v1/353412?apikey=0lIuBSYx4VjH7ZrviYZhKinOq9FZnUQh";
        $.get(apiLink, function (data) {
             weather = data[0].WeatherText;
            callback(weather);
            });
    }
    // window.setInterval(function(){
    //   /// call your function here
    // }, 5000);
    function isRain(weather) {
        return weather.toLowerCase().indexOf("rain") >= 0 || weather.toLowerCase().indexOf("storm") >= 0;
    }

    function isCloudy(weather) {
        return weather.toLowerCase().indexOf("cloud") >= 0;
    }

    function isWindy(weather) {
        return weather.toLowerCase().indexOf("wind") >= 0;
    }
    function isStormy(weather) {
        return weather.toLowerCase().indexOf("storm") >= 0;
    }

    var aqiWeatherDisplay = document.createElement("div");

    function getAQI (callback) {
        var apiLink = "http://api.airvisual.com/v2/nearest_city?key=25e95e2b-579d-48c2-b339-5096e24efcb2"
        $.get(apiLink, function (data) {
            // aqius = data.current.pollution.aqius;
            aqius = data.data.current.pollution;
            weather = data.data.current.weather
            callback(aqius, weather);
        });
    }

    
    getAQI (function (aqius, weather) {
        var msg = "<h4> Air Quality Index </h4>";
        msg += "AQI - US: " + aqius.aqius + "</br>";
        msg += "AQI - CN: " + aqius.aqicn + "</br>";
        msg += "<h4> Weather Index </h4>";
        msg += "Humidity: " + weather.hu + "</br>";
        msg += "Pressure: " + weather.pr + "</br>";
        msg += "Temperature: " + weather.tp + "</br>";
        msg += "Wind Speed: " + weather.ws + "</br>";

        aqiWeatherDisplay.innerHTML = msg;
    });
    aqiWeatherDisplay.style.background = "rgba(42, 42, 42, 0.7)";
    aqiWeatherDisplay.style.padding = "5px 5px";
    document.getElementById("toolbar").appendChild(aqiWeatherDisplay);

    viewer.scene.globe.enableLighting = true;
    Sandcastle.finishedLoading();
}
