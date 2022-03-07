/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/components/a-ocean.js":
/*!***********************************!*\
  !*** ./src/components/a-ocean.js ***!
  \***********************************/
/***/ (() => {

AFRAME.registerPrimitive('a-ocean', {
  defaultComponents: {
    ocean: {},
    rotation: {x: -90, y: 0, z: 0}
  },
  mappings: {
    width: 'ocean.width',
    depth: 'ocean.depth',
    density: 'ocean.density',
    amplitude: 'ocean.amplitude',
    amplitudeVariance: 'ocean.amplitudeVariance',
    speed: 'ocean.speed',
    speedVariance: 'ocean.speedVariance',
    color: 'ocean.color',
    opacity: 'ocean.opacity'
  }
});

AFRAME.registerComponent('ocean', {
  schema: {
    // Dimensions of the ocean area.
    width: {default: 10, min: 0},
    depth: {default: 10, min: 0},

    // Density of waves.
    density: {default: 10},

    // Wave amplitude and variance.
    amplitude: {default: 0.1},
    amplitudeVariance: {default: 0.3},

    // Wave speed and variance.
    speed: {default: 1},
    speedVariance: {default: 2},

    // Material.
    color: {default: '#7AD2F7', type: 'color'},
    opacity: {default: 0.8}
  },

  /**
   * Use play() instead of init(), because component mappings – unavailable as dependencies – are
   * not guaranteed to have parsed when this component is initialized.
   */
  play: function () {
    console.log('p');
    const el = this.el,
        data = this.data;
    let material = el.components.material;

    let geometry = new THREE.PlaneGeometry(data.width, data.depth, data.density, data.density);
    geometry = THREE.BufferGeometryUtils.mergeVertices(geometry);
    this.waves = [];

    for (let v, i = 0, l = geometry.attributes.position.count; i < l; i++) {
      v = geometry.attributes.position;
      this.waves.push({
        z: v.getZ(i),
        ang: Math.random() * Math.PI * 2,
        amp: data.amplitude + Math.random() * data.amplitudeVariance,
        speed: (data.speed + Math.random() * data.speedVariance) / 1000 // radians / frame
      });
    }

    if (!material) {
      material = {};
      material.material = new THREE.MeshPhongMaterial({
        color: data.color,
        transparent: data.opacity < 1,
        opacity: data.opacity,
        flatShading: true
      });
    }

    this.mesh = new THREE.Mesh(geometry, material.material);
    el.setObject3D('mesh', this.mesh);
  },

  remove: function () {
    this.el.removeObject3D('mesh');
  },

  tick: function (t, dt) {
    if (!dt) return;

    const verts = this.mesh.geometry.attributes.position.array;
    for (let i = 0, j = 2; i < this.waves.length; i++, j = j + 3) {
      const vprops = this.waves[i];
      verts[j] = vprops.z + Math.sin(vprops.ang) * vprops.amp;
      vprops.ang += vprops.speed * dt;
    }
    this.mesh.geometry.attributes.position.needsUpdate = true;
  }
});

/***/ }),

/***/ "./src/components/animate-rotation.js":
/*!********************************************!*\
  !*** ./src/components/animate-rotation.js ***!
  \********************************************/
/***/ (() => {

AFRAME.registerComponent('animate-rotation', {
  multiple: true,
  schema: {
    speed: {type: 'number', default: 10},
    axe: {type: 'string', default: 'x'}
  },
  init: function () {

  },
  remove: function () {

  },
  update: function () {

  },
  tick: function (elapsed, dt) {
    this.el.object3D.rotation[this.data.axe] = THREE.MathUtils.degToRad(elapsed / this.data.speed);
  }
})

/***/ }),

/***/ "./src/components/cursor-listener.js":
/*!*******************************************!*\
  !*** ./src/components/cursor-listener.js ***!
  \*******************************************/
/***/ (() => {

AFRAME.registerComponent('cursor-listener', {
  init: function () {
    this.el.addEventListener('click', evt => {
      console.log(evt);
    });
  }
});

/***/ }),

/***/ "./src/components/emit-when-near.js":
/*!******************************************!*\
  !*** ./src/components/emit-when-near.js ***!
  \******************************************/
/***/ (() => {

AFRAME.registerComponent('emit-when-near', {
  schema: {
    target: {type: 'selector', default: '#camera-rig'},
    distance: {type: 'number', default: 1},
    event: {type: 'string', default: 'click'},
    eventFar: {type: 'string', default: 'unclick'},
    throttle: {type: 'number', default: 100},
  },
  init: function () {
    this.tick = AFRAME.utils.throttleTick(this.checkDist, this.data.throttle, this);
    this.emiting = false;
  },
  checkDist: function () {
    let myPos = new THREE.Vector3(0, 0, 0);
    let targetPos = new THREE.Vector3(0, 0, 0);
    this.el.object3D.getWorldPosition(myPos);
    this.data.target.object3D.getWorldPosition(targetPos);
    const distanceTo = myPos.distanceTo(targetPos);
    if (distanceTo <= this.data.distance) {
      if (this.emiting) return;
      this.emiting = true;
      this.el.emit(this.data.event, {collidingEntity: this.data.target}, false);
      this.data.target.emit(this.data.event, {collidingEntity: this.el}, false);
    } else {
      if (!this.emiting) return;
      this.el.emit(this.data.eventFar, {collidingEntity: this.data.target}, false);
      this.data.target.emit(this.data.eventFar, {collidingEntity: this.el}, false);
      this.emiting = false;
    }
  }
});


/***/ }),

/***/ "./src/components/hover-highlighter.js":
/*!*********************************************!*\
  !*** ./src/components/hover-highlighter.js ***!
  \*********************************************/
/***/ (() => {

AFRAME.registerComponent('hover-highlighter', {
  schema: {
    color: {type: 'color', default: 'white'}
  },
  init: function () {
    let target = this.el;
    this.handlerOnEnter = evt => this.onEnter(evt);
    this.handlerOnLeave = evt => this.onLeave(evt);
    target.addEventListener("mouseenter", this.handlerOnEnter);
    target.addEventListener("mouseleave", this.handlerOnLeave);
  },
  onEnter: function (evt) {
    let cursor = evt.detail.cursorEl;
    this.savedColor = cursor.getAttribute("material").color;
    cursor.setAttribute("material", "color", this.data.color);
  },
  onLeave: function (evt) {
    let cursor = evt.detail.cursorEl;
    cursor.setAttribute("material", "color", this.savedColor);
  },
  remove: function () {
    let target = this.el;
    target.removeEventListener("mouseenter", this.handlerOnEnter);
    target.removeEventListener("mouseleave", this.handlerOnLeave);
  }
});

/***/ }),

/***/ "./src/components/im-box.js":
/*!**********************************!*\
  !*** ./src/components/im-box.js ***!
  \**********************************/
/***/ (() => {

AFRAME.registerPrimitive('im-box', {
  defaultComponents: {
    'imbox': {}
  },
  mappings: {
    size: 'imbox.size',
    color: 'imbox.color',
  }
});

AFRAME.registerComponent('imbox', {
  schema: {
    size: {type: "number", default: 1},
    color: {type: "color", default: 'black'}
  },
  init: function () {
    this.genVertices();
    this.genShape();
    this.genGeometry();
    this.genMaterial();
    this.genMesh();
  },
  genVertices: function  () {
    const half = this.data.size /2;
    this.vertices = [];
    this.vertices.push(new THREE.Vector2(-half, half));
    this.vertices.push(new THREE.Vector2(half, half));
    this.vertices.push(new THREE.Vector2(half, -half));
    this.vertices.push(new THREE.Vector2(-half, -half));
  },
  genShape: function () {
    this.shape = new THREE.Shape();

    const hg = this.vertices[0];
    this.shape.moveTo(hg.x, hg.y);

    const hd = this.vertices[1];
    this.shape.lineTo(hd.x, hd.y);

    const bd = this.vertices[2];
    this.shape.lineTo(bd.x, bd.y);

    const bl = this.vertices[3];
    this.shape.lineTo(bl.x, bl.y);

    this.shape.lineTo(hg.x, hg.y);



  },

  genGeometry: function () {

    const extrudeSettings = {
      steps: 1,
      depth: this.data.size,
      bevelEnabled: false,
    };

    this.geometry = new THREE.ExtrudeGeometry( this.shape, extrudeSettings );
  },

  genMaterial: function () {
    this.material = new THREE.MeshLambertMaterial({
       color: new THREE.Color(this.data.color)
    } );
  },

  genMesh: function () {
    this.mesh = new THREE.Mesh( this.geometry, this.material ) ;
    this.el.setObject3D('mesh', this.mesh);
  }

})


/***/ }),

/***/ "./src/components/listen-to.js":
/*!*************************************!*\
  !*** ./src/components/listen-to.js ***!
  \*************************************/
/***/ (() => {

AFRAME.registerComponent('listen-to', {
  multiple: true,
  schema: {
    evt: {type: 'string', default: 'click'},
    target: {type: 'selector'},
    emit: {type: 'string'}
  },
  init: function () {
    this.data.target.addEventListener(this.data.evt, evt => {
      this.el.emit(this.data.emit);
    })
  }
});

/***/ }),

/***/ "./src/components/on-event-set.js":
/*!****************************************!*\
  !*** ./src/components/on-event-set.js ***!
  \****************************************/
/***/ (() => {

AFRAME.registerComponent('on-event-set', {
  multiple: true,

  schema: {
    event: {type: 'string', default: 'click'},
    attribute: {type: 'string'},
    value: {type: 'string'}
  },

  init: function() {
    this._onEvent = this._onEvent.bind(this);
    this.el.addEventListener(this.data.event, this._onEvent);
  },

  remove: function() {
    this.el.removeEventListener(this.data.event, this._onEvent);
  },

  _onEvent: function(evt) {
    AFRAME.utils.entity.setComponentProperty(this.el, this.data.attribute, this.data.value);
  }

});

/***/ }),

/***/ "./src/components/simple-navmesh-constraint.js":
/*!*****************************************************!*\
  !*** ./src/components/simple-navmesh-constraint.js ***!
  \*****************************************************/
/***/ (() => {

AFRAME.registerComponent('simple-navmesh-constraint', {
  schema: {
    navmesh: {
      default: ''
    },
    fall: {
      default: 0.5
    },
    height: {
      default: 1.6
    }
  },

  init: function () {
    this.lastPosition = new THREE.Vector3();
    this.el.object3D.getWorldPosition(this.lastPosition);
  },

  update: function () {
    const els = Array.from(document.querySelectorAll(this.data.navmesh));
    if (els === null) {
      console.warn('navmesh-physics: Did not match any elements');
      this.objects = [];
    } else {
      this.objects = els.map(el => el.object3D);
    }
  },

  tick: (function () {
    const nextPosition = new THREE.Vector3();
    const tempVec = new THREE.Vector3();
    const scanPattern = [
      [0,1], // Default the next location
      [30,0.4], // A little to the side shorter range
      [-30,0.4], // A little to the side shorter range
      [60,0.2], // Moderately to the side short range
      [-60,0.2], // Moderately to the side short range
      [80,0.06], // Perpendicular very short range
      [-80,0.06], // Perpendicular very short range
    ];
    const down = new THREE.Vector3(0,-1,0);
    const raycaster = new THREE.Raycaster();
    const gravity = -1;
    const maxYVelocity = 0.5;
    const results = [];
    let yVel = 0;

    return function (time, delta) {
      const el = this.el;
      if (this.objects.length === 0) return;

      this.el.object3D.getWorldPosition(nextPosition);
      if (nextPosition.distanceTo(this.lastPosition) === 0) return;

      let didHit = false;

      // So that it does not get stuck it takes as few samples around the user and finds the most appropriate
      for (const [angle, distance] of scanPattern) {
        tempVec.subVectors(nextPosition, this.lastPosition);
        tempVec.applyAxisAngle(down, angle*Math.PI/180);
        tempVec.multiplyScalar(distance);
        tempVec.add(this.lastPosition);
        tempVec.y += maxYVelocity;
        tempVec.y -= this.data.height;
        raycaster.set(tempVec, down);
        raycaster.far = this.data.fall > 0 ? this.data.fall + maxYVelocity : Infinity;
        raycaster.intersectObjects(this.objects, true, results);
        if (results.length) {
          const hitPos = results[0].point;
          hitPos.y += this.data.height;
          if (nextPosition.y - (hitPos.y - yVel*2) > 0.01) {
            yVel += Math.max(gravity * delta * 0.001, -maxYVelocity);
            hitPos.y = nextPosition.y + yVel;
          } else {
            yVel = 0;
          }
          el.object3D.position.copy(hitPos);
          this.el.object3D.parent.worldToLocal(this.el.object3D.position);
          this.lastPosition.copy(hitPos);
          results.splice(0);
          didHit = true;
          break;
        }
      }

      if (!didHit) {
        this.el.object3D.position.copy(this.lastPosition);
        this.el.object3D.parent.worldToLocal(this.el.object3D.position);
      }
    }
  }())
});


/***/ }),

/***/ "./src/components/toggle-events.js":
/*!*****************************************!*\
  !*** ./src/components/toggle-events.js ***!
  \*****************************************/
/***/ (() => {

AFRAME.registerComponent('toggle-events', {
  multiple: true,
  schema: {
    sourceEvt: {type: 'string', default: 'click'},
    evt1: {type: 'string'},
    evt2: {type: 'string'}
  },
  init: function () {
    this.state = 0;
    this.el.addEventListener(this.data.sourceEvt, evt => {
      if (this.state == 0) {
        this.el.emit(this.data.evt1);
        this.state = 1;
      } else {
        this.el.emit(this.data.evt2);
        this.state = 0;
      }
    });
  }
});

/***/ }),

/***/ "./src/components sync \\.js$":
/*!*************************************************!*\
  !*** ./src/components/ sync nonrecursive \.js$ ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var map = {
	"./a-ocean.js": "./src/components/a-ocean.js",
	"./animate-rotation.js": "./src/components/animate-rotation.js",
	"./cursor-listener.js": "./src/components/cursor-listener.js",
	"./emit-when-near.js": "./src/components/emit-when-near.js",
	"./hover-highlighter.js": "./src/components/hover-highlighter.js",
	"./im-box.js": "./src/components/im-box.js",
	"./listen-to.js": "./src/components/listen-to.js",
	"./on-event-set.js": "./src/components/on-event-set.js",
	"./simple-navmesh-constraint.js": "./src/components/simple-navmesh-constraint.js",
	"./toggle-events.js": "./src/components/toggle-events.js",
	"components/a-ocean.js": "./src/components/a-ocean.js",
	"components/animate-rotation.js": "./src/components/animate-rotation.js",
	"components/cursor-listener.js": "./src/components/cursor-listener.js",
	"components/emit-when-near.js": "./src/components/emit-when-near.js",
	"components/hover-highlighter.js": "./src/components/hover-highlighter.js",
	"components/im-box.js": "./src/components/im-box.js",
	"components/listen-to.js": "./src/components/listen-to.js",
	"components/on-event-set.js": "./src/components/on-event-set.js",
	"components/simple-navmesh-constraint.js": "./src/components/simple-navmesh-constraint.js",
	"components/toggle-events.js": "./src/components/toggle-events.js"
};


function webpackContext(req) {
	var id = webpackContextResolve(req);
	return __webpack_require__(id);
}
function webpackContextResolve(req) {
	if(!__webpack_require__.o(map, req)) {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	}
	return map[req];
}
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = "./src/components sync \\.js$";

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!*********************!*\
  !*** ./src/main.js ***!
  \*********************/

function importAll(r) {
  r.keys().forEach(r);
}

importAll(__webpack_require__("./src/components sync \\.js$"));
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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V0FBVyxlQUFlO0FBQzFCLFdBQVc7QUFDWCxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLENBQUM7Ozs7Ozs7Ozs7QUNuQkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O1VDekNBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBOzs7Ozs7Ozs7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVUsbURBQStDLEUiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hZnJhbWUtd2VicGFjay1ib2lsZXJwbGF0ZS8uL3NyYy9jb21wb25lbnRzL2Etb2NlYW4uanMiLCJ3ZWJwYWNrOi8vYWZyYW1lLXdlYnBhY2stYm9pbGVycGxhdGUvLi9zcmMvY29tcG9uZW50cy9hbmltYXRlLXJvdGF0aW9uLmpzIiwid2VicGFjazovL2FmcmFtZS13ZWJwYWNrLWJvaWxlcnBsYXRlLy4vc3JjL2NvbXBvbmVudHMvY3Vyc29yLWxpc3RlbmVyLmpzIiwid2VicGFjazovL2FmcmFtZS13ZWJwYWNrLWJvaWxlcnBsYXRlLy4vc3JjL2NvbXBvbmVudHMvZW1pdC13aGVuLW5lYXIuanMiLCJ3ZWJwYWNrOi8vYWZyYW1lLXdlYnBhY2stYm9pbGVycGxhdGUvLi9zcmMvY29tcG9uZW50cy9ob3Zlci1oaWdobGlnaHRlci5qcyIsIndlYnBhY2s6Ly9hZnJhbWUtd2VicGFjay1ib2lsZXJwbGF0ZS8uL3NyYy9jb21wb25lbnRzL2ltLWJveC5qcyIsIndlYnBhY2s6Ly9hZnJhbWUtd2VicGFjay1ib2lsZXJwbGF0ZS8uL3NyYy9jb21wb25lbnRzL2xpc3Rlbi10by5qcyIsIndlYnBhY2s6Ly9hZnJhbWUtd2VicGFjay1ib2lsZXJwbGF0ZS8uL3NyYy9jb21wb25lbnRzL29uLWV2ZW50LXNldC5qcyIsIndlYnBhY2s6Ly9hZnJhbWUtd2VicGFjay1ib2lsZXJwbGF0ZS8uL3NyYy9jb21wb25lbnRzL3NpbXBsZS1uYXZtZXNoLWNvbnN0cmFpbnQuanMiLCJ3ZWJwYWNrOi8vYWZyYW1lLXdlYnBhY2stYm9pbGVycGxhdGUvLi9zcmMvY29tcG9uZW50cy90b2dnbGUtZXZlbnRzLmpzIiwid2VicGFjazovL2FmcmFtZS13ZWJwYWNrLWJvaWxlcnBsYXRlLy4vc3JjL2NvbXBvbmVudHN8c3luY3xub25yZWN1cnNpdmV8Ly5qcyQiLCJ3ZWJwYWNrOi8vYWZyYW1lLXdlYnBhY2stYm9pbGVycGxhdGUvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vYWZyYW1lLXdlYnBhY2stYm9pbGVycGxhdGUvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9hZnJhbWUtd2VicGFjay1ib2lsZXJwbGF0ZS8uL3NyYy9tYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIkFGUkFNRS5yZWdpc3RlclByaW1pdGl2ZSgnYS1vY2VhbicsIHtcclxuICBkZWZhdWx0Q29tcG9uZW50czoge1xyXG4gICAgb2NlYW46IHt9LFxyXG4gICAgcm90YXRpb246IHt4OiAtOTAsIHk6IDAsIHo6IDB9XHJcbiAgfSxcclxuICBtYXBwaW5nczoge1xyXG4gICAgd2lkdGg6ICdvY2Vhbi53aWR0aCcsXHJcbiAgICBkZXB0aDogJ29jZWFuLmRlcHRoJyxcclxuICAgIGRlbnNpdHk6ICdvY2Vhbi5kZW5zaXR5JyxcclxuICAgIGFtcGxpdHVkZTogJ29jZWFuLmFtcGxpdHVkZScsXHJcbiAgICBhbXBsaXR1ZGVWYXJpYW5jZTogJ29jZWFuLmFtcGxpdHVkZVZhcmlhbmNlJyxcclxuICAgIHNwZWVkOiAnb2NlYW4uc3BlZWQnLFxyXG4gICAgc3BlZWRWYXJpYW5jZTogJ29jZWFuLnNwZWVkVmFyaWFuY2UnLFxyXG4gICAgY29sb3I6ICdvY2Vhbi5jb2xvcicsXHJcbiAgICBvcGFjaXR5OiAnb2NlYW4ub3BhY2l0eSdcclxuICB9XHJcbn0pO1xyXG5cclxuQUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KCdvY2VhbicsIHtcclxuICBzY2hlbWE6IHtcclxuICAgIC8vIERpbWVuc2lvbnMgb2YgdGhlIG9jZWFuIGFyZWEuXHJcbiAgICB3aWR0aDoge2RlZmF1bHQ6IDEwLCBtaW46IDB9LFxyXG4gICAgZGVwdGg6IHtkZWZhdWx0OiAxMCwgbWluOiAwfSxcclxuXHJcbiAgICAvLyBEZW5zaXR5IG9mIHdhdmVzLlxyXG4gICAgZGVuc2l0eToge2RlZmF1bHQ6IDEwfSxcclxuXHJcbiAgICAvLyBXYXZlIGFtcGxpdHVkZSBhbmQgdmFyaWFuY2UuXHJcbiAgICBhbXBsaXR1ZGU6IHtkZWZhdWx0OiAwLjF9LFxyXG4gICAgYW1wbGl0dWRlVmFyaWFuY2U6IHtkZWZhdWx0OiAwLjN9LFxyXG5cclxuICAgIC8vIFdhdmUgc3BlZWQgYW5kIHZhcmlhbmNlLlxyXG4gICAgc3BlZWQ6IHtkZWZhdWx0OiAxfSxcclxuICAgIHNwZWVkVmFyaWFuY2U6IHtkZWZhdWx0OiAyfSxcclxuXHJcbiAgICAvLyBNYXRlcmlhbC5cclxuICAgIGNvbG9yOiB7ZGVmYXVsdDogJyM3QUQyRjcnLCB0eXBlOiAnY29sb3InfSxcclxuICAgIG9wYWNpdHk6IHtkZWZhdWx0OiAwLjh9XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogVXNlIHBsYXkoKSBpbnN0ZWFkIG9mIGluaXQoKSwgYmVjYXVzZSBjb21wb25lbnQgbWFwcGluZ3Mg4oCTIHVuYXZhaWxhYmxlIGFzIGRlcGVuZGVuY2llcyDigJMgYXJlXHJcbiAgICogbm90IGd1YXJhbnRlZWQgdG8gaGF2ZSBwYXJzZWQgd2hlbiB0aGlzIGNvbXBvbmVudCBpcyBpbml0aWFsaXplZC5cclxuICAgKi9cclxuICBwbGF5OiBmdW5jdGlvbiAoKSB7XHJcbiAgICBjb25zb2xlLmxvZygncCcpO1xyXG4gICAgY29uc3QgZWwgPSB0aGlzLmVsLFxyXG4gICAgICAgIGRhdGEgPSB0aGlzLmRhdGE7XHJcbiAgICBsZXQgbWF0ZXJpYWwgPSBlbC5jb21wb25lbnRzLm1hdGVyaWFsO1xyXG5cclxuICAgIGxldCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KGRhdGEud2lkdGgsIGRhdGEuZGVwdGgsIGRhdGEuZGVuc2l0eSwgZGF0YS5kZW5zaXR5KTtcclxuICAgIGdlb21ldHJ5ID0gVEhSRUUuQnVmZmVyR2VvbWV0cnlVdGlscy5tZXJnZVZlcnRpY2VzKGdlb21ldHJ5KTtcclxuICAgIHRoaXMud2F2ZXMgPSBbXTtcclxuXHJcbiAgICBmb3IgKGxldCB2LCBpID0gMCwgbCA9IGdlb21ldHJ5LmF0dHJpYnV0ZXMucG9zaXRpb24uY291bnQ7IGkgPCBsOyBpKyspIHtcclxuICAgICAgdiA9IGdlb21ldHJ5LmF0dHJpYnV0ZXMucG9zaXRpb247XHJcbiAgICAgIHRoaXMud2F2ZXMucHVzaCh7XHJcbiAgICAgICAgejogdi5nZXRaKGkpLFxyXG4gICAgICAgIGFuZzogTWF0aC5yYW5kb20oKSAqIE1hdGguUEkgKiAyLFxyXG4gICAgICAgIGFtcDogZGF0YS5hbXBsaXR1ZGUgKyBNYXRoLnJhbmRvbSgpICogZGF0YS5hbXBsaXR1ZGVWYXJpYW5jZSxcclxuICAgICAgICBzcGVlZDogKGRhdGEuc3BlZWQgKyBNYXRoLnJhbmRvbSgpICogZGF0YS5zcGVlZFZhcmlhbmNlKSAvIDEwMDAgLy8gcmFkaWFucyAvIGZyYW1lXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghbWF0ZXJpYWwpIHtcclxuICAgICAgbWF0ZXJpYWwgPSB7fTtcclxuICAgICAgbWF0ZXJpYWwubWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xyXG4gICAgICAgIGNvbG9yOiBkYXRhLmNvbG9yLFxyXG4gICAgICAgIHRyYW5zcGFyZW50OiBkYXRhLm9wYWNpdHkgPCAxLFxyXG4gICAgICAgIG9wYWNpdHk6IGRhdGEub3BhY2l0eSxcclxuICAgICAgICBmbGF0U2hhZGluZzogdHJ1ZVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLm1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwubWF0ZXJpYWwpO1xyXG4gICAgZWwuc2V0T2JqZWN0M0QoJ21lc2gnLCB0aGlzLm1lc2gpO1xyXG4gIH0sXHJcblxyXG4gIHJlbW92ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5lbC5yZW1vdmVPYmplY3QzRCgnbWVzaCcpO1xyXG4gIH0sXHJcblxyXG4gIHRpY2s6IGZ1bmN0aW9uICh0LCBkdCkge1xyXG4gICAgaWYgKCFkdCkgcmV0dXJuO1xyXG5cclxuICAgIGNvbnN0IHZlcnRzID0gdGhpcy5tZXNoLmdlb21ldHJ5LmF0dHJpYnV0ZXMucG9zaXRpb24uYXJyYXk7XHJcbiAgICBmb3IgKGxldCBpID0gMCwgaiA9IDI7IGkgPCB0aGlzLndhdmVzLmxlbmd0aDsgaSsrLCBqID0gaiArIDMpIHtcclxuICAgICAgY29uc3QgdnByb3BzID0gdGhpcy53YXZlc1tpXTtcclxuICAgICAgdmVydHNbal0gPSB2cHJvcHMueiArIE1hdGguc2luKHZwcm9wcy5hbmcpICogdnByb3BzLmFtcDtcclxuICAgICAgdnByb3BzLmFuZyArPSB2cHJvcHMuc3BlZWQgKiBkdDtcclxuICAgIH1cclxuICAgIHRoaXMubWVzaC5nZW9tZXRyeS5hdHRyaWJ1dGVzLnBvc2l0aW9uLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICB9XHJcbn0pOyIsIkFGUkFNRS5yZWdpc3RlckNvbXBvbmVudCgnYW5pbWF0ZS1yb3RhdGlvbicsIHtcclxuICBtdWx0aXBsZTogdHJ1ZSxcclxuICBzY2hlbWE6IHtcclxuICAgIHNwZWVkOiB7dHlwZTogJ251bWJlcicsIGRlZmF1bHQ6IDEwfSxcclxuICAgIGF4ZToge3R5cGU6ICdzdHJpbmcnLCBkZWZhdWx0OiAneCd9XHJcbiAgfSxcclxuICBpbml0OiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gIH0sXHJcbiAgcmVtb3ZlOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gIH0sXHJcbiAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gIH0sXHJcbiAgdGljazogZnVuY3Rpb24gKGVsYXBzZWQsIGR0KSB7XHJcbiAgICB0aGlzLmVsLm9iamVjdDNELnJvdGF0aW9uW3RoaXMuZGF0YS5heGVdID0gVEhSRUUuTWF0aFV0aWxzLmRlZ1RvUmFkKGVsYXBzZWQgLyB0aGlzLmRhdGEuc3BlZWQpO1xyXG4gIH1cclxufSkiLCJBRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ2N1cnNvci1saXN0ZW5lcicsIHtcclxuICBpbml0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZ0ID0+IHtcclxuICAgICAgY29uc29sZS5sb2coZXZ0KTtcclxuICAgIH0pO1xyXG4gIH1cclxufSk7IiwiQUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KCdlbWl0LXdoZW4tbmVhcicsIHtcclxuICBzY2hlbWE6IHtcclxuICAgIHRhcmdldDoge3R5cGU6ICdzZWxlY3RvcicsIGRlZmF1bHQ6ICcjY2FtZXJhLXJpZyd9LFxyXG4gICAgZGlzdGFuY2U6IHt0eXBlOiAnbnVtYmVyJywgZGVmYXVsdDogMX0sXHJcbiAgICBldmVudDoge3R5cGU6ICdzdHJpbmcnLCBkZWZhdWx0OiAnY2xpY2snfSxcclxuICAgIGV2ZW50RmFyOiB7dHlwZTogJ3N0cmluZycsIGRlZmF1bHQ6ICd1bmNsaWNrJ30sXHJcbiAgICB0aHJvdHRsZToge3R5cGU6ICdudW1iZXInLCBkZWZhdWx0OiAxMDB9LFxyXG4gIH0sXHJcbiAgaW5pdDogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy50aWNrID0gQUZSQU1FLnV0aWxzLnRocm90dGxlVGljayh0aGlzLmNoZWNrRGlzdCwgdGhpcy5kYXRhLnRocm90dGxlLCB0aGlzKTtcclxuICAgIHRoaXMuZW1pdGluZyA9IGZhbHNlO1xyXG4gIH0sXHJcbiAgY2hlY2tEaXN0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICBsZXQgbXlQb3MgPSBuZXcgVEhSRUUuVmVjdG9yMygwLCAwLCAwKTtcclxuICAgIGxldCB0YXJnZXRQb3MgPSBuZXcgVEhSRUUuVmVjdG9yMygwLCAwLCAwKTtcclxuICAgIHRoaXMuZWwub2JqZWN0M0QuZ2V0V29ybGRQb3NpdGlvbihteVBvcyk7XHJcbiAgICB0aGlzLmRhdGEudGFyZ2V0Lm9iamVjdDNELmdldFdvcmxkUG9zaXRpb24odGFyZ2V0UG9zKTtcclxuICAgIGNvbnN0IGRpc3RhbmNlVG8gPSBteVBvcy5kaXN0YW5jZVRvKHRhcmdldFBvcyk7XHJcbiAgICBpZiAoZGlzdGFuY2VUbyA8PSB0aGlzLmRhdGEuZGlzdGFuY2UpIHtcclxuICAgICAgaWYgKHRoaXMuZW1pdGluZykgcmV0dXJuO1xyXG4gICAgICB0aGlzLmVtaXRpbmcgPSB0cnVlO1xyXG4gICAgICB0aGlzLmVsLmVtaXQodGhpcy5kYXRhLmV2ZW50LCB7Y29sbGlkaW5nRW50aXR5OiB0aGlzLmRhdGEudGFyZ2V0fSwgZmFsc2UpO1xyXG4gICAgICB0aGlzLmRhdGEudGFyZ2V0LmVtaXQodGhpcy5kYXRhLmV2ZW50LCB7Y29sbGlkaW5nRW50aXR5OiB0aGlzLmVsfSwgZmFsc2UpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKCF0aGlzLmVtaXRpbmcpIHJldHVybjtcclxuICAgICAgdGhpcy5lbC5lbWl0KHRoaXMuZGF0YS5ldmVudEZhciwge2NvbGxpZGluZ0VudGl0eTogdGhpcy5kYXRhLnRhcmdldH0sIGZhbHNlKTtcclxuICAgICAgdGhpcy5kYXRhLnRhcmdldC5lbWl0KHRoaXMuZGF0YS5ldmVudEZhciwge2NvbGxpZGluZ0VudGl0eTogdGhpcy5lbH0sIGZhbHNlKTtcclxuICAgICAgdGhpcy5lbWl0aW5nID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG59KTtcclxuIiwiQUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KCdob3Zlci1oaWdobGlnaHRlcicsIHtcclxuICBzY2hlbWE6IHtcclxuICAgIGNvbG9yOiB7dHlwZTogJ2NvbG9yJywgZGVmYXVsdDogJ3doaXRlJ31cclxuICB9LFxyXG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgIGxldCB0YXJnZXQgPSB0aGlzLmVsO1xyXG4gICAgdGhpcy5oYW5kbGVyT25FbnRlciA9IGV2dCA9PiB0aGlzLm9uRW50ZXIoZXZ0KTtcclxuICAgIHRoaXMuaGFuZGxlck9uTGVhdmUgPSBldnQgPT4gdGhpcy5vbkxlYXZlKGV2dCk7XHJcbiAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgdGhpcy5oYW5kbGVyT25FbnRlcik7XHJcbiAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgdGhpcy5oYW5kbGVyT25MZWF2ZSk7XHJcbiAgfSxcclxuICBvbkVudGVyOiBmdW5jdGlvbiAoZXZ0KSB7XHJcbiAgICBsZXQgY3Vyc29yID0gZXZ0LmRldGFpbC5jdXJzb3JFbDtcclxuICAgIHRoaXMuc2F2ZWRDb2xvciA9IGN1cnNvci5nZXRBdHRyaWJ1dGUoXCJtYXRlcmlhbFwiKS5jb2xvcjtcclxuICAgIGN1cnNvci5zZXRBdHRyaWJ1dGUoXCJtYXRlcmlhbFwiLCBcImNvbG9yXCIsIHRoaXMuZGF0YS5jb2xvcik7XHJcbiAgfSxcclxuICBvbkxlYXZlOiBmdW5jdGlvbiAoZXZ0KSB7XHJcbiAgICBsZXQgY3Vyc29yID0gZXZ0LmRldGFpbC5jdXJzb3JFbDtcclxuICAgIGN1cnNvci5zZXRBdHRyaWJ1dGUoXCJtYXRlcmlhbFwiLCBcImNvbG9yXCIsIHRoaXMuc2F2ZWRDb2xvcik7XHJcbiAgfSxcclxuICByZW1vdmU6IGZ1bmN0aW9uICgpIHtcclxuICAgIGxldCB0YXJnZXQgPSB0aGlzLmVsO1xyXG4gICAgdGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsIHRoaXMuaGFuZGxlck9uRW50ZXIpO1xyXG4gICAgdGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIHRoaXMuaGFuZGxlck9uTGVhdmUpO1xyXG4gIH1cclxufSk7IiwiQUZSQU1FLnJlZ2lzdGVyUHJpbWl0aXZlKCdpbS1ib3gnLCB7XHJcbiAgZGVmYXVsdENvbXBvbmVudHM6IHtcclxuICAgICdpbWJveCc6IHt9XHJcbiAgfSxcclxuICBtYXBwaW5nczoge1xyXG4gICAgc2l6ZTogJ2ltYm94LnNpemUnLFxyXG4gICAgY29sb3I6ICdpbWJveC5jb2xvcicsXHJcbiAgfVxyXG59KTtcclxuXHJcbkFGUkFNRS5yZWdpc3RlckNvbXBvbmVudCgnaW1ib3gnLCB7XHJcbiAgc2NoZW1hOiB7XHJcbiAgICBzaXplOiB7dHlwZTogXCJudW1iZXJcIiwgZGVmYXVsdDogMX0sXHJcbiAgICBjb2xvcjoge3R5cGU6IFwiY29sb3JcIiwgZGVmYXVsdDogJ2JsYWNrJ31cclxuICB9LFxyXG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuZ2VuVmVydGljZXMoKTtcclxuICAgIHRoaXMuZ2VuU2hhcGUoKTtcclxuICAgIHRoaXMuZ2VuR2VvbWV0cnkoKTtcclxuICAgIHRoaXMuZ2VuTWF0ZXJpYWwoKTtcclxuICAgIHRoaXMuZ2VuTWVzaCgpO1xyXG4gIH0sXHJcbiAgZ2VuVmVydGljZXM6IGZ1bmN0aW9uICAoKSB7XHJcbiAgICBjb25zdCBoYWxmID0gdGhpcy5kYXRhLnNpemUgLzI7XHJcbiAgICB0aGlzLnZlcnRpY2VzID0gW107XHJcbiAgICB0aGlzLnZlcnRpY2VzLnB1c2gobmV3IFRIUkVFLlZlY3RvcjIoLWhhbGYsIGhhbGYpKTtcclxuICAgIHRoaXMudmVydGljZXMucHVzaChuZXcgVEhSRUUuVmVjdG9yMihoYWxmLCBoYWxmKSk7XHJcbiAgICB0aGlzLnZlcnRpY2VzLnB1c2gobmV3IFRIUkVFLlZlY3RvcjIoaGFsZiwgLWhhbGYpKTtcclxuICAgIHRoaXMudmVydGljZXMucHVzaChuZXcgVEhSRUUuVmVjdG9yMigtaGFsZiwgLWhhbGYpKTtcclxuICB9LFxyXG4gIGdlblNoYXBlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLnNoYXBlID0gbmV3IFRIUkVFLlNoYXBlKCk7XHJcblxyXG4gICAgY29uc3QgaGcgPSB0aGlzLnZlcnRpY2VzWzBdO1xyXG4gICAgdGhpcy5zaGFwZS5tb3ZlVG8oaGcueCwgaGcueSk7XHJcblxyXG4gICAgY29uc3QgaGQgPSB0aGlzLnZlcnRpY2VzWzFdO1xyXG4gICAgdGhpcy5zaGFwZS5saW5lVG8oaGQueCwgaGQueSk7XHJcblxyXG4gICAgY29uc3QgYmQgPSB0aGlzLnZlcnRpY2VzWzJdO1xyXG4gICAgdGhpcy5zaGFwZS5saW5lVG8oYmQueCwgYmQueSk7XHJcblxyXG4gICAgY29uc3QgYmwgPSB0aGlzLnZlcnRpY2VzWzNdO1xyXG4gICAgdGhpcy5zaGFwZS5saW5lVG8oYmwueCwgYmwueSk7XHJcblxyXG4gICAgdGhpcy5zaGFwZS5saW5lVG8oaGcueCwgaGcueSk7XHJcblxyXG5cclxuXHJcbiAgfSxcclxuXHJcbiAgZ2VuR2VvbWV0cnk6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICBjb25zdCBleHRydWRlU2V0dGluZ3MgPSB7XHJcbiAgICAgIHN0ZXBzOiAxLFxyXG4gICAgICBkZXB0aDogdGhpcy5kYXRhLnNpemUsXHJcbiAgICAgIGJldmVsRW5hYmxlZDogZmFsc2UsXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuZ2VvbWV0cnkgPSBuZXcgVEhSRUUuRXh0cnVkZUdlb21ldHJ5KCB0aGlzLnNoYXBlLCBleHRydWRlU2V0dGluZ3MgKTtcclxuICB9LFxyXG5cclxuICBnZW5NYXRlcmlhbDogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5tYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoTGFtYmVydE1hdGVyaWFsKHtcclxuICAgICAgIGNvbG9yOiBuZXcgVEhSRUUuQ29sb3IodGhpcy5kYXRhLmNvbG9yKVxyXG4gICAgfSApO1xyXG4gIH0sXHJcblxyXG4gIGdlbk1lc2g6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMubWVzaCA9IG5ldyBUSFJFRS5NZXNoKCB0aGlzLmdlb21ldHJ5LCB0aGlzLm1hdGVyaWFsICkgO1xyXG4gICAgdGhpcy5lbC5zZXRPYmplY3QzRCgnbWVzaCcsIHRoaXMubWVzaCk7XHJcbiAgfVxyXG5cclxufSlcclxuIiwiQUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KCdsaXN0ZW4tdG8nLCB7XHJcbiAgbXVsdGlwbGU6IHRydWUsXHJcbiAgc2NoZW1hOiB7XHJcbiAgICBldnQ6IHt0eXBlOiAnc3RyaW5nJywgZGVmYXVsdDogJ2NsaWNrJ30sXHJcbiAgICB0YXJnZXQ6IHt0eXBlOiAnc2VsZWN0b3InfSxcclxuICAgIGVtaXQ6IHt0eXBlOiAnc3RyaW5nJ31cclxuICB9LFxyXG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuZGF0YS50YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcih0aGlzLmRhdGEuZXZ0LCBldnQgPT4ge1xyXG4gICAgICB0aGlzLmVsLmVtaXQodGhpcy5kYXRhLmVtaXQpO1xyXG4gICAgfSlcclxuICB9XHJcbn0pOyIsIkFGUkFNRS5yZWdpc3RlckNvbXBvbmVudCgnb24tZXZlbnQtc2V0Jywge1xyXG4gIG11bHRpcGxlOiB0cnVlLFxyXG5cclxuICBzY2hlbWE6IHtcclxuICAgIGV2ZW50OiB7dHlwZTogJ3N0cmluZycsIGRlZmF1bHQ6ICdjbGljayd9LFxyXG4gICAgYXR0cmlidXRlOiB7dHlwZTogJ3N0cmluZyd9LFxyXG4gICAgdmFsdWU6IHt0eXBlOiAnc3RyaW5nJ31cclxuICB9LFxyXG5cclxuICBpbml0OiBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuX29uRXZlbnQgPSB0aGlzLl9vbkV2ZW50LmJpbmQodGhpcyk7XHJcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIodGhpcy5kYXRhLmV2ZW50LCB0aGlzLl9vbkV2ZW50KTtcclxuICB9LFxyXG5cclxuICByZW1vdmU6IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKHRoaXMuZGF0YS5ldmVudCwgdGhpcy5fb25FdmVudCk7XHJcbiAgfSxcclxuXHJcbiAgX29uRXZlbnQ6IGZ1bmN0aW9uKGV2dCkge1xyXG4gICAgQUZSQU1FLnV0aWxzLmVudGl0eS5zZXRDb21wb25lbnRQcm9wZXJ0eSh0aGlzLmVsLCB0aGlzLmRhdGEuYXR0cmlidXRlLCB0aGlzLmRhdGEudmFsdWUpO1xyXG4gIH1cclxuXHJcbn0pOyIsIkFGUkFNRS5yZWdpc3RlckNvbXBvbmVudCgnc2ltcGxlLW5hdm1lc2gtY29uc3RyYWludCcsIHtcclxuICBzY2hlbWE6IHtcclxuICAgIG5hdm1lc2g6IHtcclxuICAgICAgZGVmYXVsdDogJydcclxuICAgIH0sXHJcbiAgICBmYWxsOiB7XHJcbiAgICAgIGRlZmF1bHQ6IDAuNVxyXG4gICAgfSxcclxuICAgIGhlaWdodDoge1xyXG4gICAgICBkZWZhdWx0OiAxLjZcclxuICAgIH1cclxuICB9LFxyXG5cclxuICBpbml0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLmxhc3RQb3NpdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XHJcbiAgICB0aGlzLmVsLm9iamVjdDNELmdldFdvcmxkUG9zaXRpb24odGhpcy5sYXN0UG9zaXRpb24pO1xyXG4gIH0sXHJcblxyXG4gIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgY29uc3QgZWxzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuZGF0YS5uYXZtZXNoKSk7XHJcbiAgICBpZiAoZWxzID09PSBudWxsKSB7XHJcbiAgICAgIGNvbnNvbGUud2FybignbmF2bWVzaC1waHlzaWNzOiBEaWQgbm90IG1hdGNoIGFueSBlbGVtZW50cycpO1xyXG4gICAgICB0aGlzLm9iamVjdHMgPSBbXTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMub2JqZWN0cyA9IGVscy5tYXAoZWwgPT4gZWwub2JqZWN0M0QpO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIHRpY2s6IChmdW5jdGlvbiAoKSB7XHJcbiAgICBjb25zdCBuZXh0UG9zaXRpb24gPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xyXG4gICAgY29uc3QgdGVtcFZlYyA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XHJcbiAgICBjb25zdCBzY2FuUGF0dGVybiA9IFtcclxuICAgICAgWzAsMV0sIC8vIERlZmF1bHQgdGhlIG5leHQgbG9jYXRpb25cclxuICAgICAgWzMwLDAuNF0sIC8vIEEgbGl0dGxlIHRvIHRoZSBzaWRlIHNob3J0ZXIgcmFuZ2VcclxuICAgICAgWy0zMCwwLjRdLCAvLyBBIGxpdHRsZSB0byB0aGUgc2lkZSBzaG9ydGVyIHJhbmdlXHJcbiAgICAgIFs2MCwwLjJdLCAvLyBNb2RlcmF0ZWx5IHRvIHRoZSBzaWRlIHNob3J0IHJhbmdlXHJcbiAgICAgIFstNjAsMC4yXSwgLy8gTW9kZXJhdGVseSB0byB0aGUgc2lkZSBzaG9ydCByYW5nZVxyXG4gICAgICBbODAsMC4wNl0sIC8vIFBlcnBlbmRpY3VsYXIgdmVyeSBzaG9ydCByYW5nZVxyXG4gICAgICBbLTgwLDAuMDZdLCAvLyBQZXJwZW5kaWN1bGFyIHZlcnkgc2hvcnQgcmFuZ2VcclxuICAgIF07XHJcbiAgICBjb25zdCBkb3duID0gbmV3IFRIUkVFLlZlY3RvcjMoMCwtMSwwKTtcclxuICAgIGNvbnN0IHJheWNhc3RlciA9IG5ldyBUSFJFRS5SYXljYXN0ZXIoKTtcclxuICAgIGNvbnN0IGdyYXZpdHkgPSAtMTtcclxuICAgIGNvbnN0IG1heFlWZWxvY2l0eSA9IDAuNTtcclxuICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcclxuICAgIGxldCB5VmVsID0gMDtcclxuXHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRpbWUsIGRlbHRhKSB7XHJcbiAgICAgIGNvbnN0IGVsID0gdGhpcy5lbDtcclxuICAgICAgaWYgKHRoaXMub2JqZWN0cy5sZW5ndGggPT09IDApIHJldHVybjtcclxuXHJcbiAgICAgIHRoaXMuZWwub2JqZWN0M0QuZ2V0V29ybGRQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xyXG4gICAgICBpZiAobmV4dFBvc2l0aW9uLmRpc3RhbmNlVG8odGhpcy5sYXN0UG9zaXRpb24pID09PSAwKSByZXR1cm47XHJcblxyXG4gICAgICBsZXQgZGlkSGl0ID0gZmFsc2U7XHJcblxyXG4gICAgICAvLyBTbyB0aGF0IGl0IGRvZXMgbm90IGdldCBzdHVjayBpdCB0YWtlcyBhcyBmZXcgc2FtcGxlcyBhcm91bmQgdGhlIHVzZXIgYW5kIGZpbmRzIHRoZSBtb3N0IGFwcHJvcHJpYXRlXHJcbiAgICAgIGZvciAoY29uc3QgW2FuZ2xlLCBkaXN0YW5jZV0gb2Ygc2NhblBhdHRlcm4pIHtcclxuICAgICAgICB0ZW1wVmVjLnN1YlZlY3RvcnMobmV4dFBvc2l0aW9uLCB0aGlzLmxhc3RQb3NpdGlvbik7XHJcbiAgICAgICAgdGVtcFZlYy5hcHBseUF4aXNBbmdsZShkb3duLCBhbmdsZSpNYXRoLlBJLzE4MCk7XHJcbiAgICAgICAgdGVtcFZlYy5tdWx0aXBseVNjYWxhcihkaXN0YW5jZSk7XHJcbiAgICAgICAgdGVtcFZlYy5hZGQodGhpcy5sYXN0UG9zaXRpb24pO1xyXG4gICAgICAgIHRlbXBWZWMueSArPSBtYXhZVmVsb2NpdHk7XHJcbiAgICAgICAgdGVtcFZlYy55IC09IHRoaXMuZGF0YS5oZWlnaHQ7XHJcbiAgICAgICAgcmF5Y2FzdGVyLnNldCh0ZW1wVmVjLCBkb3duKTtcclxuICAgICAgICByYXljYXN0ZXIuZmFyID0gdGhpcy5kYXRhLmZhbGwgPiAwID8gdGhpcy5kYXRhLmZhbGwgKyBtYXhZVmVsb2NpdHkgOiBJbmZpbml0eTtcclxuICAgICAgICByYXljYXN0ZXIuaW50ZXJzZWN0T2JqZWN0cyh0aGlzLm9iamVjdHMsIHRydWUsIHJlc3VsdHMpO1xyXG4gICAgICAgIGlmIChyZXN1bHRzLmxlbmd0aCkge1xyXG4gICAgICAgICAgY29uc3QgaGl0UG9zID0gcmVzdWx0c1swXS5wb2ludDtcclxuICAgICAgICAgIGhpdFBvcy55ICs9IHRoaXMuZGF0YS5oZWlnaHQ7XHJcbiAgICAgICAgICBpZiAobmV4dFBvc2l0aW9uLnkgLSAoaGl0UG9zLnkgLSB5VmVsKjIpID4gMC4wMSkge1xyXG4gICAgICAgICAgICB5VmVsICs9IE1hdGgubWF4KGdyYXZpdHkgKiBkZWx0YSAqIDAuMDAxLCAtbWF4WVZlbG9jaXR5KTtcclxuICAgICAgICAgICAgaGl0UG9zLnkgPSBuZXh0UG9zaXRpb24ueSArIHlWZWw7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB5VmVsID0gMDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsLm9iamVjdDNELnBvc2l0aW9uLmNvcHkoaGl0UG9zKTtcclxuICAgICAgICAgIHRoaXMuZWwub2JqZWN0M0QucGFyZW50LndvcmxkVG9Mb2NhbCh0aGlzLmVsLm9iamVjdDNELnBvc2l0aW9uKTtcclxuICAgICAgICAgIHRoaXMubGFzdFBvc2l0aW9uLmNvcHkoaGl0UG9zKTtcclxuICAgICAgICAgIHJlc3VsdHMuc3BsaWNlKDApO1xyXG4gICAgICAgICAgZGlkSGl0ID0gdHJ1ZTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCFkaWRIaXQpIHtcclxuICAgICAgICB0aGlzLmVsLm9iamVjdDNELnBvc2l0aW9uLmNvcHkodGhpcy5sYXN0UG9zaXRpb24pO1xyXG4gICAgICAgIHRoaXMuZWwub2JqZWN0M0QucGFyZW50LndvcmxkVG9Mb2NhbCh0aGlzLmVsLm9iamVjdDNELnBvc2l0aW9uKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0oKSlcclxufSk7XHJcbiIsIkFGUkFNRS5yZWdpc3RlckNvbXBvbmVudCgndG9nZ2xlLWV2ZW50cycsIHtcclxuICBtdWx0aXBsZTogdHJ1ZSxcclxuICBzY2hlbWE6IHtcclxuICAgIHNvdXJjZUV2dDoge3R5cGU6ICdzdHJpbmcnLCBkZWZhdWx0OiAnY2xpY2snfSxcclxuICAgIGV2dDE6IHt0eXBlOiAnc3RyaW5nJ30sXHJcbiAgICBldnQyOiB7dHlwZTogJ3N0cmluZyd9XHJcbiAgfSxcclxuICBpbml0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLnN0YXRlID0gMDtcclxuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcih0aGlzLmRhdGEuc291cmNlRXZ0LCBldnQgPT4ge1xyXG4gICAgICBpZiAodGhpcy5zdGF0ZSA9PSAwKSB7XHJcbiAgICAgICAgdGhpcy5lbC5lbWl0KHRoaXMuZGF0YS5ldnQxKTtcclxuICAgICAgICB0aGlzLnN0YXRlID0gMTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmVsLmVtaXQodGhpcy5kYXRhLmV2dDIpO1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSAwO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcbn0pOyIsInZhciBtYXAgPSB7XG5cdFwiLi9hLW9jZWFuLmpzXCI6IFwiLi9zcmMvY29tcG9uZW50cy9hLW9jZWFuLmpzXCIsXG5cdFwiLi9hbmltYXRlLXJvdGF0aW9uLmpzXCI6IFwiLi9zcmMvY29tcG9uZW50cy9hbmltYXRlLXJvdGF0aW9uLmpzXCIsXG5cdFwiLi9jdXJzb3ItbGlzdGVuZXIuanNcIjogXCIuL3NyYy9jb21wb25lbnRzL2N1cnNvci1saXN0ZW5lci5qc1wiLFxuXHRcIi4vZW1pdC13aGVuLW5lYXIuanNcIjogXCIuL3NyYy9jb21wb25lbnRzL2VtaXQtd2hlbi1uZWFyLmpzXCIsXG5cdFwiLi9ob3Zlci1oaWdobGlnaHRlci5qc1wiOiBcIi4vc3JjL2NvbXBvbmVudHMvaG92ZXItaGlnaGxpZ2h0ZXIuanNcIixcblx0XCIuL2ltLWJveC5qc1wiOiBcIi4vc3JjL2NvbXBvbmVudHMvaW0tYm94LmpzXCIsXG5cdFwiLi9saXN0ZW4tdG8uanNcIjogXCIuL3NyYy9jb21wb25lbnRzL2xpc3Rlbi10by5qc1wiLFxuXHRcIi4vb24tZXZlbnQtc2V0LmpzXCI6IFwiLi9zcmMvY29tcG9uZW50cy9vbi1ldmVudC1zZXQuanNcIixcblx0XCIuL3NpbXBsZS1uYXZtZXNoLWNvbnN0cmFpbnQuanNcIjogXCIuL3NyYy9jb21wb25lbnRzL3NpbXBsZS1uYXZtZXNoLWNvbnN0cmFpbnQuanNcIixcblx0XCIuL3RvZ2dsZS1ldmVudHMuanNcIjogXCIuL3NyYy9jb21wb25lbnRzL3RvZ2dsZS1ldmVudHMuanNcIixcblx0XCJjb21wb25lbnRzL2Etb2NlYW4uanNcIjogXCIuL3NyYy9jb21wb25lbnRzL2Etb2NlYW4uanNcIixcblx0XCJjb21wb25lbnRzL2FuaW1hdGUtcm90YXRpb24uanNcIjogXCIuL3NyYy9jb21wb25lbnRzL2FuaW1hdGUtcm90YXRpb24uanNcIixcblx0XCJjb21wb25lbnRzL2N1cnNvci1saXN0ZW5lci5qc1wiOiBcIi4vc3JjL2NvbXBvbmVudHMvY3Vyc29yLWxpc3RlbmVyLmpzXCIsXG5cdFwiY29tcG9uZW50cy9lbWl0LXdoZW4tbmVhci5qc1wiOiBcIi4vc3JjL2NvbXBvbmVudHMvZW1pdC13aGVuLW5lYXIuanNcIixcblx0XCJjb21wb25lbnRzL2hvdmVyLWhpZ2hsaWdodGVyLmpzXCI6IFwiLi9zcmMvY29tcG9uZW50cy9ob3Zlci1oaWdobGlnaHRlci5qc1wiLFxuXHRcImNvbXBvbmVudHMvaW0tYm94LmpzXCI6IFwiLi9zcmMvY29tcG9uZW50cy9pbS1ib3guanNcIixcblx0XCJjb21wb25lbnRzL2xpc3Rlbi10by5qc1wiOiBcIi4vc3JjL2NvbXBvbmVudHMvbGlzdGVuLXRvLmpzXCIsXG5cdFwiY29tcG9uZW50cy9vbi1ldmVudC1zZXQuanNcIjogXCIuL3NyYy9jb21wb25lbnRzL29uLWV2ZW50LXNldC5qc1wiLFxuXHRcImNvbXBvbmVudHMvc2ltcGxlLW5hdm1lc2gtY29uc3RyYWludC5qc1wiOiBcIi4vc3JjL2NvbXBvbmVudHMvc2ltcGxlLW5hdm1lc2gtY29uc3RyYWludC5qc1wiLFxuXHRcImNvbXBvbmVudHMvdG9nZ2xlLWV2ZW50cy5qc1wiOiBcIi4vc3JjL2NvbXBvbmVudHMvdG9nZ2xlLWV2ZW50cy5qc1wiXG59O1xuXG5cbmZ1bmN0aW9uIHdlYnBhY2tDb250ZXh0KHJlcSkge1xuXHR2YXIgaWQgPSB3ZWJwYWNrQ29udGV4dFJlc29sdmUocmVxKTtcblx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oaWQpO1xufVxuZnVuY3Rpb24gd2VicGFja0NvbnRleHRSZXNvbHZlKHJlcSkge1xuXHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKG1hcCwgcmVxKSkge1xuXHRcdHZhciBlID0gbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIiArIHJlcSArIFwiJ1wiKTtcblx0XHRlLmNvZGUgPSAnTU9EVUxFX05PVF9GT1VORCc7XG5cdFx0dGhyb3cgZTtcblx0fVxuXHRyZXR1cm4gbWFwW3JlcV07XG59XG53ZWJwYWNrQ29udGV4dC5rZXlzID0gZnVuY3Rpb24gd2VicGFja0NvbnRleHRLZXlzKCkge1xuXHRyZXR1cm4gT2JqZWN0LmtleXMobWFwKTtcbn07XG53ZWJwYWNrQ29udGV4dC5yZXNvbHZlID0gd2VicGFja0NvbnRleHRSZXNvbHZlO1xubW9kdWxlLmV4cG9ydHMgPSB3ZWJwYWNrQ29udGV4dDtcbndlYnBhY2tDb250ZXh0LmlkID0gXCIuL3NyYy9jb21wb25lbnRzIHN5bmMgXFxcXC5qcyRcIjsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIlxyXG5mdW5jdGlvbiBpbXBvcnRBbGwocikge1xyXG4gIHIua2V5cygpLmZvckVhY2gocik7XHJcbn1cclxuXHJcbmltcG9ydEFsbChyZXF1aXJlLmNvbnRleHQoJy4vY29tcG9uZW50cycsIGZhbHNlLCAvXFwuanMkLykpOyJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==