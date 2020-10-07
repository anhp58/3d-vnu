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

    function normalize(number, max, min, deltaTime) {
        var add = (Math.random() > 0.5) ? 1 : -1;

        if (number < max || number > min) {
            return number + add * Math.random() * (max - min) * deltaTime / 1000;
        } else {
            if (number > max) return max;
            if (number < min) return min;
        }

    }
    var raindropModel = {
        uri: '../3d_model/raindrop.gltf',
        minimumPixelSize: 6,
        maximumScale: 0.5,
        scale: 0.008
    };



    function computeRainPath(interval, x, y, z) {
        var property = new Cesium.SampledPositionProperty();
        var startTime = Cesium.JulianDate.now(new Cesium.JulianDate());
        var i = 0;
        var defaultVerlocity = 0.5;
        while (true) {
            z = z - defaultVerlocity * i - 2.8 * i * i;
            var time = Cesium.JulianDate.addSeconds(startTime, i, new Cesium.JulianDate());
            var pos3d = Cesium.Cartesian3.fromDegrees(x, y, z);
            property.addSample(time, pos3d);
            i++;
            if (z < 0) break;
        }
        return property;
    }
    function createModelRaindrop(viewer, Cesium, x, y, z) {
        var position = Cesium.Cartesian3.fromDegrees(x, y, z);
        var heading = Cesium.Math.toRadians(0);
        var pitch = Cesium.Math.toRadians(0);
        var roll = Cesium.Math.toRadians(-90);
        var orientation = Cesium.Transforms.headingPitchRollQuaternion(
            position, heading, pitch, roll);

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

    function createModelCloud(viewer, Cesium, x, y, z) {
        var position = Cesium.Cartesian3.fromDegrees(x, y, z);
        var heading = Cesium.Math.toRadians(135 - Math.random() * 60);
        var pitch = 0;
        var roll = 0;
        var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, heading, pitch, roll);
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

    var rainnyBtn = Sandcastle.addToggleButton("Rainy", false, function (checked) {
        console.log("Rain checked: " + checked);
        rainStatus = checked;
    }, 'sub_toolbar');
    var cloudyBtn = Sandcastle.addToggleButton("Cloudy", false, function (checked) {
        console.log("Cloudy checked: " + checked);
        cloudyStatus = checked;
    }, 'sub_toolbar');
    var windyBtn = Sandcastle.addToggleButton("Windy", false, function (checked) {
        if (checked) {
            WIND_VERLOCITY = [0.00015, 0.00015, 0];
        } else {
            WIND_VERLOCITY = [0, 0, 0];
        }
    }, 'sub_toolbar');
    var realTimeBtn = Sandcastle.addToggleButton("Weather realtime", false, function (checked) {
        if (checked) {
            queryWeather(function (weather) {
                rainStatus = isRain(weather);
                rainnyBtn.checked = rainStatus;

                cloudyStatus = isCloudy(weather);
                cloudyBtn.checked = cloudyStatus;

                if (isWindy(weather)) WIND_VERLOCITY = [0.00015, 0.00015, 0];
                else WIND_VERLOCITY = [0, 0, 0];
                alert(weather);
            })
        } else {
            rainnyBtn.checked = false;
            cloudyBtn.checked = false;

            WIND_VERLOCITY = [0, 0, 0];
            rainStatus = false;
            cloudyStatus = false;
        }
    }, 'sub_toolbar');


    viewer.scene.globe.enableLighting = true;


    Sandcastle.finishedLoading();
}

function isRain(weather) {
    return weather.toLowerCase().indexOf("rain") >= 0 || weather.indexOf("shower") >= 0;
}

function isCloudy(weather) {
    return weather.toLowerCase().indexOf("cloudy") >= 0;
}

function isWindy(weather) {
    return weather.toLowerCase().indexOf("windy") >= 0;
}

function queryWeather(callback) {
    $.get("https://query.yahooapis.com/v1/public/yql?q=select * from weather.forecast where woeid in (select woeid from geo.places(1) where text='ha noi')&format=json"
        , function (data) {
            var weather = data.query.results.channel.item.condition.text;
            callback(weather);
        });
}
// 0	tornado
// 1	tropical storm
// 2	hurricane
// 3	severe thunderstorms
// 4	thunderstorms
// 5	mixed rain and snow
// 6	mixed rain and sleet
// 7	mixed snow and sleet
// 8	freezing drizzle
// 9	drizzle
// 10	freezing rain
// 11	showers
// 12	showers
// 13	snow flurries
// 14	light snow showers
// 15	blowing snow
// 16	snow
// 17	hail
// 18	sleet
// 19	dust
// 20	foggy
// 21	haze
// 22	smoky
// 23	blustery
// 24	windy
// 25	cold
// 26	cloudy
// 27	mostly cloudy (night)
// 28	mostly cloudy (day)
// 29	partly cloudy (night)
// 30	partly cloudy (day)
// 31	clear (night)
// 32	sunny
// 33	fair (night)
// 34	fair (day)
// 35	mixed rain and hail
// 36	hot
// 37	isolated thunderstorms
// 38	scattered thunderstorms
// 39	scattered thunderstorms
// 40	scattered showers
// 41	heavy snow
// 42	scattered snow showers
// 43	heavy snow
// 44	partly cloudy
// 45	thundershowers
// 46	snow showers
// 47	isolated thundershowers
