define(["exports","./when-54c2dc71","./Check-6c0211bc","./Math-fc8cecf5","./Cartesian2-bddc1162"],function(t,M,i,c,m){"use strict";function d(t,i,a){if(0===t)return i*a;var e=t*t,n=e*e,s=n*e,h=s*e,u=h*e,t=u*e,a=a;return i*((1-e/4-3*n/64-5*s/256-175*h/16384-441*u/65536-4851*t/1048576)*a-(3*e/8+3*n/32+45*s/1024+105*h/4096+2205*u/131072+6237*t/524288)*Math.sin(2*a)+(15*n/256+45*s/1024+525*h/16384+1575*u/65536+155925*t/8388608)*Math.sin(4*a)-(35*s/3072+175*h/12288+3675*u/262144+13475*t/1048576)*Math.sin(6*a)+(315*h/131072+2205*u/524288+43659*t/8388608)*Math.sin(8*a)-(693*u/1310720+6237*t/5242880)*Math.sin(10*a)+1001*t/8388608*Math.sin(12*a))}function l(t,i){if(0===t)return Math.log(Math.tan(.5*(c.CesiumMath.PI_OVER_TWO+i)));var a=t*Math.sin(i);return Math.log(Math.tan(.5*(c.CesiumMath.PI_OVER_TWO+i)))-t/2*Math.log((1+a)/(1-a))}var o=new m.Cartesian3,_=new m.Cartesian3;function e(t,i,a,e){m.Cartesian3.normalize(e.cartographicToCartesian(i,_),o),m.Cartesian3.normalize(e.cartographicToCartesian(a,_),_);var n,s=e.maximumRadius,h=e.minimumRadius,u=s*s,r=h*h;t._ellipticitySquared=(u-r)/u,t._ellipticity=Math.sqrt(t._ellipticitySquared),t._start=m.Cartographic.clone(i,t._start),t._start.height=0,t._end=m.Cartographic.clone(a,t._end),t._end.height=0,t._heading=(n=t,s=i.longitude,h=i.latitude,r=a.longitude,u=a.latitude,h=l(n._ellipticity,h),u=l(n._ellipticity,u),Math.atan2(c.CesiumMath.negativePiToPi(r-s),u-h)),t._distance=(r=t,s=e.maximumRadius,u=e.minimumRadius,h=i.longitude,t=i.latitude,e=a.longitude,i=a.latitude,a=r._heading,e-=h,h=0,h=c.CesiumMath.equalsEpsilon(Math.abs(a),c.CesiumMath.PI_OVER_TWO,c.CesiumMath.EPSILON8)?s===u?s*Math.cos(t)*c.CesiumMath.negativePiToPi(e):(u=Math.sin(t),s*Math.cos(t)*c.CesiumMath.negativePiToPi(e)/Math.sqrt(1-r._ellipticitySquared*u*u)):(t=d(r._ellipticity,s,t),(d(r._ellipticity,s,i)-t)/Math.cos(a)),Math.abs(h))}function r(t,i,a,e,n,s){var h,u,r,o=n*n;return r=Math.abs(c.CesiumMath.PI_OVER_TWO-Math.abs(i))>c.CesiumMath.EPSILON8?(h=function(t,i,a){var e=t/a;if(0===i)return e;var n=e*e,s=n*e,h=s*e,u=i*i,r=u*u,o=r*u,d=o*u,l=d*u,M=l*u,c=Math.sin(2*e),m=Math.cos(2*e),_=Math.sin(4*e),g=Math.cos(4*e),p=Math.sin(6*e),C=Math.cos(6*e),t=Math.sin(8*e),a=Math.cos(8*e),i=Math.sin(10*e);return e+e*u/4+7*e*r/64+15*e*o/256+579*e*d/16384+1515*e*l/65536+16837*e*M/1048576+(3*e*r/16+45*e*o/256-e*(32*n-561)*d/4096-e*(232*n-1677)*l/16384+e*(399985-90560*n+512*h)*M/5242880)*m+(21*e*o/256+483*e*d/4096-e*(224*n-1969)*l/16384-e*(33152*n-112599)*M/1048576)*g+(151*e*d/4096+4681*e*l/65536+1479*e*M/16384-453*s*M/32768)*C+(1097*e*l/65536+42783*e*M/1048576)*a+8011*e*M/1048576*Math.cos(10*e)+(3*u/8+3*r/16+213*o/2048-3*n*o/64+255*d/4096-33*n*d/512+20861*l/524288-33*n*l/512+h*l/1024+28273*M/1048576-471*n*M/8192+9*h*M/4096)*c+(21*r/256+21*o/256+533*d/8192-21*n*d/512+197*l/4096-315*n*l/4096+584039*M/16777216-12517*n*M/131072+7*h*M/2048)*_+(151*o/6144+151*d/4096+5019*l/131072-453*n*l/16384+26965*M/786432-8607*n*M/131072)*p+(1097*d/131072+1097*l/65536+225797*M/10485760-1097*n*M/65536)*t+(8011*l/2621440+8011*M/1048576)*i+293393*M/251658240*Math.sin(12*e)}(d(n,e,t.latitude)+a*Math.cos(i),n,e),r=l(n,t.latitude),u=l(n,h),r=Math.tan(i)*(u-r),c.CesiumMath.negativePiToPi(t.longitude+r)):(h=t.latitude,r=a/(0===n?e*Math.cos(t.latitude):(n=Math.sin(t.latitude),e*Math.cos(t.latitude)/Math.sqrt(1-o*n*n))),0<i?c.CesiumMath.negativePiToPi(t.longitude+r):c.CesiumMath.negativePiToPi(t.longitude-r)),M.defined(s)?(s.longitude=r,s.latitude=h,s.height=0,s):new m.Cartographic(r,h,0)}function g(t,i,a){a=M.defaultValue(a,m.Ellipsoid.WGS84);this._ellipsoid=a,this._start=new m.Cartographic,this._end=new m.Cartographic,this._heading=void 0,this._distance=void 0,this._ellipticity=void 0,this._ellipticitySquared=void 0,M.defined(t)&&M.defined(i)&&e(this,t,i,a)}Object.defineProperties(g.prototype,{ellipsoid:{get:function(){return this._ellipsoid}},surfaceDistance:{get:function(){return this._distance}},start:{get:function(){return this._start}},end:{get:function(){return this._end}},heading:{get:function(){return this._heading}}}),g.fromStartHeadingDistance=function(t,i,a,e,n){var s=M.defaultValue(e,m.Ellipsoid.WGS84),h=s.maximumRadius,u=s.minimumRadius,h=h*h,u=u*u,h=Math.sqrt((h-u)/h),h=r(t,i=c.CesiumMath.negativePiToPi(i),a,s.maximumRadius,h);return!M.defined(n)||M.defined(e)&&!e.equals(n.ellipsoid)?new g(t,h,s):(n.setEndPoints(t,h),n)},g.prototype.setEndPoints=function(t,i){e(this,t,i,this._ellipsoid)},g.prototype.interpolateUsingFraction=function(t,i){return this.interpolateUsingSurfaceDistance(t*this._distance,i)},g.prototype.interpolateUsingSurfaceDistance=function(t,i){return r(this._start,this._heading,t,this._ellipsoid.maximumRadius,this._ellipticity,i)},g.prototype.findIntersectionWithLongitude=function(t,i){var a=this._ellipticity,e=this._heading,n=Math.abs(e),s=this._start;if(t=c.CesiumMath.negativePiToPi(t),c.CesiumMath.equalsEpsilon(Math.abs(t),Math.PI,c.CesiumMath.EPSILON14)&&(t=c.CesiumMath.sign(s.longitude)*Math.PI),M.defined(i)||(i=new m.Cartographic),Math.abs(c.CesiumMath.PI_OVER_TWO-n)<=c.CesiumMath.EPSILON8)return i.longitude=t,i.latitude=s.latitude,i.height=0,i;if(c.CesiumMath.equalsEpsilon(Math.abs(c.CesiumMath.PI_OVER_TWO-n),c.CesiumMath.PI_OVER_TWO,c.CesiumMath.EPSILON8)){if(c.CesiumMath.equalsEpsilon(t,s.longitude,c.CesiumMath.EPSILON12))return;return i.longitude=t,i.latitude=c.CesiumMath.PI_OVER_TWO*c.CesiumMath.sign(c.CesiumMath.PI_OVER_TWO-e),i.height=0,i}var h,u=s.latitude,n=a*Math.sin(u),r=Math.tan(.5*(c.CesiumMath.PI_OVER_TWO+u))*Math.exp((t-s.longitude)/Math.tan(e)),o=(1+n)/(1-n),d=s.latitude;do{h=d;var l=a*Math.sin(h),l=(1+l)/(1-l),d=2*Math.atan(r*Math.pow(l/o,a/2))-c.CesiumMath.PI_OVER_TWO}while(!c.CesiumMath.equalsEpsilon(d,h,c.CesiumMath.EPSILON12));return i.longitude=t,i.latitude=d,i.height=0,i},g.prototype.findIntersectionWithLatitude=function(t,i){var a=this._ellipticity,e=this._heading,n=this._start;if(!c.CesiumMath.equalsEpsilon(Math.abs(e),c.CesiumMath.PI_OVER_TWO,c.CesiumMath.EPSILON8)){var s=l(a,n.latitude),a=l(a,t),s=Math.tan(e)*(a-s),s=c.CesiumMath.negativePiToPi(n.longitude+s);return M.defined(i)?(i.longitude=s,i.latitude=t,i.height=0,i):new m.Cartographic(s,t,0)}},t.EllipsoidRhumbLine=g});
