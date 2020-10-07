
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
    // cesium viewer define
    var viewer = new Cesium.Viewer('cesiumContainer', {
        scene3DOnly: true,
        selectionIndicator: false
    });
    // viewer.terrainProvider = new Cesium.CesiumTerrainProvider({
    //     url : 'https://assets.agi.com/stk-terrain/world',
    //     requestWaterMask : false,
    //     requestVertexNormals : true
    // });

    // get scene, canvas, camera variables
    var scene = viewer.scene;
    var canvas = viewer.canvas;
    var camera = viewer.camera;


    // set canvas attribute
    canvas.setAttribute('tabindex', '0'); // needed to put focus on the canvas
    canvas.onclick = function () {
        canvas.focus();
    };

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
			//	case building: build it up to it's height.
			//	case road: set gray color.
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

    var substring = "rain";
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
    // add building polygon json data source:

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
		
		// mouse moved:
		// handler.setInputAction(function(movement) {
		// 	mousePosition = movement.endPosition;
		// }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
		
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

    Sandcastle.addToggleButton('Weather', false, function(checked) {
	    if (checked){
      		getWeatherInfo(function(weather){
                console.log(weather);
                //cloudyStatus = true;
                viewer.shadows = true;
                // rainStatus = true;
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
            rainStatus = true;
            cloudyStatus = true;
            viewer.shadows = true;
        }
	});
    var pinBuilder = new Cesium.PinBuilder();
    Sandcastle.addToggleButton('Buildings Information', false, function(checked) {
        if (checked){
            addPin(tc_D2, "D2", des_ndh);
            addPin(tc_htnvd, "D1", des_htnvd);
            addPin(tc_sunwa, "G1", des_sunwa);
            addPin(tc_b2, "B2", des_b2);
            addPin(tc_g3, "G3", des_g3);
            addPin(tc_e3, "E3", des_e3);
            addPin(tc_e4, "E4", des_e4);
            addPin(tc_e1, "E1", des_e1);
            addPin(tc_e2, "E2", des_e2);
            addPin(tc_g7, "G7", des_g7);
            addPin(tc_b3, "B3", des_b3);
            addPin(tc_g2, "G2", des_g2);
            addPin(tc_c1t, "C1T", des_c1t);
            addPin(tc_a1, "A1", des_a1);
            addPin(tc_a2, "A2", des_a2);
            addPin(tc_a3, "A3", des_a3);
            addPin(tc_a4, "A4", des_a4);
            addPin(tc_a5, "A5", des_a5);
            addPin(tc_cnn, "A6", des_cnn);
            addPin(tc_ntc, "A7", des_ntc);
            addPin(tc_kyd, "Y1", des_kyd);
            addPin(tc_ktx, "KTX", des_ktx);
            addPin(tc_shb, "B1", des_shb);
            addPin(tc_g8, "G8", des_g8);
            addPin(tc_gd2, "GD2", des_gd2);
            addPin(tc_c1, "C1", des_c1);
            addPin(tc_c2, "C2", des_c2);
            addPin(tc_c3, "C3", des_c3);
            addPin(tc_c4, "C4", des_c4);
            addPin(tc_c5, "C5", des_c5);
            addPin(tc_c6, "C6", des_c6);
            addPin(tc_ktxA, "14A", des_ktxA);
            addPin(tc_ktxB, "14B", des_ktxB);
            addPin(tc_ktxC, "14C", des_ktxC);
            addPin(tc_g5, "G5", des_g5);
        } else {
            viewer.entities.remove(pin_track['D2']);
            viewer.entities.remove(pin_track['D1']);
            viewer.entities.remove(pin_track['G1']);
            viewer.entities.remove(pin_track['B2']);
            viewer.entities.remove(pin_track['G3']);
            viewer.entities.remove(pin_track['E3']);
            viewer.entities.remove(pin_track['E4']);
            viewer.entities.remove(pin_track['E1']);
            viewer.entities.remove(pin_track['E2']);
            viewer.entities.remove(pin_track['G7']);
            viewer.entities.remove(pin_track['B3']);
            viewer.entities.remove(pin_track['G2']);
            viewer.entities.remove(pin_track['C1T']);
            viewer.entities.remove(pin_track['A1']);
            viewer.entities.remove(pin_track['A2']);
            viewer.entities.remove(pin_track['A3']);
            viewer.entities.remove(pin_track['A4']);
            viewer.entities.remove(pin_track['A5']);
            viewer.entities.remove(pin_track['A6']);
            viewer.entities.remove(pin_track['A7']);
            viewer.entities.remove(pin_track['Y1']);
            viewer.entities.remove(pin_track['KTX']);
            viewer.entities.remove(pin_track['B1']);
            viewer.entities.remove(pin_track['G8']);
            viewer.entities.remove(pin_track['GD2']);
            viewer.entities.remove(pin_track['C1']);
            viewer.entities.remove(pin_track['C2']);
            viewer.entities.remove(pin_track['C3']);
            viewer.entities.remove(pin_track['C4']);
            viewer.entities.remove(pin_track['C5']);
            viewer.entities.remove(pin_track['C6']);
            viewer.entities.remove(pin_track['14A']);
            viewer.entities.remove(pin_track['14B']);
            viewer.entities.remove(pin_track['14A']);
            viewer.entities.remove(pin_track['14C']);
            viewer.entities.remove(pin_track['G5']);
            console.log(viewer.entities.remove(pin_track['G5']));
            // viewer.entities.remove(pin_track['14A']);
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
    viewer.scene.globe.enableLighting = true;
    Sandcastle.finishedLoading();
}
