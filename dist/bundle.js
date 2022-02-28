/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/components/a-test.js":
/*!**********************************!*\
  !*** ./src/components/a-test.js ***!
  \**********************************/
/***/ (() => {

AFRAME.registerPrimitive('a-test', {
  defaultComponents: {
    'mytest': {}
  },
  mappings: {

  }
});

AFRAME.registerComponent('mytest', {
  schema: {

  },
  init: function () {
    this.genAll();
  },
  genAll: function () {
    this.genVertices();
    this.genShape();
    this.genGeometry();
    this.genMaterial();
    this.genMesh();
  },
  genVertices: function () {
    this.vertices = [];
    for (let i = 0; i < 6; i++ ) {
      let angle_rad = 1.0471975511965976 * i; // (Math.PI / 180) * 60 * i
      this.vertices.push(new THREE.Vector2(1 * Math.cos(angle_rad), 1 * Math.sin(angle_rad)));
    }
  },
  genShape: function() {
    this.shape = new THREE.Shape();
    this.shape.moveTo(this.vertices[0].x, this.vertices[0].y);
    for (let i = 1; i < 6; i++) this.shape.lineTo(this.vertices[i].x, this.vertices[i].y);
    this.shape.lineTo(this.vertices[0].x, this.vertices[0].y);
  },
  genGeometry: function() {
    this.geometrySettings = {
      depth: 3,
      bevelEnabled: false,
      bevelSegments: 1,
      steps: 1,
      bevelSize: 1 / 20,
      bevelThickness: 1 / 20
    };
    this.geometry = new THREE.ExtrudeGeometry(this.shape, this.geometrySettings);
  },
  genMaterial: function () {
    this.material = new THREE.MeshLambertMaterial({color: new THREE.Color('red')});
  },
  genMesh: function() {
    this.mesh =  new THREE.Mesh(this.geometry, this.material);
    this.mesh.rotateOnAxis(new THREE.Vector3(-1, 0, 0), Math.PI / 2);
    this.el.setObject3D('mesh', this.mesh);
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

/* global AFRAME, THREE */

/* Constrain an object to a navmesh, for example place this element after wasd-controls like so:
`wasd-controls navmesh-physics="#navmesh-el"`
*/
AFRAME.registerComponent('simple-navmesh-constraint', {
  schema: {
    navmesh: {
      default: ''
    },
    fall: {
      default: 0.5
    },
    height: {
      default: 1.8
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
	"./a-test.js": "./src/components/a-test.js",
	"./animate-rotation.js": "./src/components/animate-rotation.js",
	"./cursor-listener.js": "./src/components/cursor-listener.js",
	"./emit-when-near.js": "./src/components/emit-when-near.js",
	"./hover-highlighter.js": "./src/components/hover-highlighter.js",
	"./im-box.js": "./src/components/im-box.js",
	"./listen-to.js": "./src/components/listen-to.js",
	"./on-event-set.js": "./src/components/on-event-set.js",
	"./simple-navmesh-constraint.js": "./src/components/simple-navmesh-constraint.js",
	"./toggle-events.js": "./src/components/toggle-events.js",
	"components/a-test.js": "./src/components/a-test.js",
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDSDtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7Ozs7Ozs7Ozs7QUN0QkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNILENBQUM7Ozs7Ozs7Ozs7O0FDaEdEO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixpQ0FBaUM7QUFDakQsV0FBVyxlQUFlO0FBQzFCLFdBQVc7QUFDWCxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLENBQUM7Ozs7Ozs7Ozs7QUNuQkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O1VDekNBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBOzs7Ozs7Ozs7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVUsbURBQStDLEUiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hZnJhbWUtd2VicGFjay1ib2lsZXJwbGF0ZS8uL3NyYy9jb21wb25lbnRzL2EtdGVzdC5qcyIsIndlYnBhY2s6Ly9hZnJhbWUtd2VicGFjay1ib2lsZXJwbGF0ZS8uL3NyYy9jb21wb25lbnRzL2FuaW1hdGUtcm90YXRpb24uanMiLCJ3ZWJwYWNrOi8vYWZyYW1lLXdlYnBhY2stYm9pbGVycGxhdGUvLi9zcmMvY29tcG9uZW50cy9jdXJzb3ItbGlzdGVuZXIuanMiLCJ3ZWJwYWNrOi8vYWZyYW1lLXdlYnBhY2stYm9pbGVycGxhdGUvLi9zcmMvY29tcG9uZW50cy9lbWl0LXdoZW4tbmVhci5qcyIsIndlYnBhY2s6Ly9hZnJhbWUtd2VicGFjay1ib2lsZXJwbGF0ZS8uL3NyYy9jb21wb25lbnRzL2hvdmVyLWhpZ2hsaWdodGVyLmpzIiwid2VicGFjazovL2FmcmFtZS13ZWJwYWNrLWJvaWxlcnBsYXRlLy4vc3JjL2NvbXBvbmVudHMvaW0tYm94LmpzIiwid2VicGFjazovL2FmcmFtZS13ZWJwYWNrLWJvaWxlcnBsYXRlLy4vc3JjL2NvbXBvbmVudHMvbGlzdGVuLXRvLmpzIiwid2VicGFjazovL2FmcmFtZS13ZWJwYWNrLWJvaWxlcnBsYXRlLy4vc3JjL2NvbXBvbmVudHMvb24tZXZlbnQtc2V0LmpzIiwid2VicGFjazovL2FmcmFtZS13ZWJwYWNrLWJvaWxlcnBsYXRlLy4vc3JjL2NvbXBvbmVudHMvc2ltcGxlLW5hdm1lc2gtY29uc3RyYWludC5qcyIsIndlYnBhY2s6Ly9hZnJhbWUtd2VicGFjay1ib2lsZXJwbGF0ZS8uL3NyYy9jb21wb25lbnRzL3RvZ2dsZS1ldmVudHMuanMiLCJ3ZWJwYWNrOi8vYWZyYW1lLXdlYnBhY2stYm9pbGVycGxhdGUvLi9zcmMvY29tcG9uZW50c3xzeW5jfG5vbnJlY3Vyc2l2ZXwvLmpzJCIsIndlYnBhY2s6Ly9hZnJhbWUtd2VicGFjay1ib2lsZXJwbGF0ZS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9hZnJhbWUtd2VicGFjay1ib2lsZXJwbGF0ZS93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2FmcmFtZS13ZWJwYWNrLWJvaWxlcnBsYXRlLy4vc3JjL21haW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiQUZSQU1FLnJlZ2lzdGVyUHJpbWl0aXZlKCdhLXRlc3QnLCB7XHJcbiAgZGVmYXVsdENvbXBvbmVudHM6IHtcclxuICAgICdteXRlc3QnOiB7fVxyXG4gIH0sXHJcbiAgbWFwcGluZ3M6IHtcclxuXHJcbiAgfVxyXG59KTtcclxuXHJcbkFGUkFNRS5yZWdpc3RlckNvbXBvbmVudCgnbXl0ZXN0Jywge1xyXG4gIHNjaGVtYToge1xyXG5cclxuICB9LFxyXG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuZ2VuQWxsKCk7XHJcbiAgfSxcclxuICBnZW5BbGw6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuZ2VuVmVydGljZXMoKTtcclxuICAgIHRoaXMuZ2VuU2hhcGUoKTtcclxuICAgIHRoaXMuZ2VuR2VvbWV0cnkoKTtcclxuICAgIHRoaXMuZ2VuTWF0ZXJpYWwoKTtcclxuICAgIHRoaXMuZ2VuTWVzaCgpO1xyXG4gIH0sXHJcbiAgZ2VuVmVydGljZXM6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMudmVydGljZXMgPSBbXTtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNjsgaSsrICkge1xyXG4gICAgICBsZXQgYW5nbGVfcmFkID0gMS4wNDcxOTc1NTExOTY1OTc2ICogaTsgLy8gKE1hdGguUEkgLyAxODApICogNjAgKiBpXHJcbiAgICAgIHRoaXMudmVydGljZXMucHVzaChuZXcgVEhSRUUuVmVjdG9yMigxICogTWF0aC5jb3MoYW5nbGVfcmFkKSwgMSAqIE1hdGguc2luKGFuZ2xlX3JhZCkpKTtcclxuICAgIH1cclxuICB9LFxyXG4gIGdlblNoYXBlOiBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuc2hhcGUgPSBuZXcgVEhSRUUuU2hhcGUoKTtcclxuICAgIHRoaXMuc2hhcGUubW92ZVRvKHRoaXMudmVydGljZXNbMF0ueCwgdGhpcy52ZXJ0aWNlc1swXS55KTtcclxuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgNjsgaSsrKSB0aGlzLnNoYXBlLmxpbmVUbyh0aGlzLnZlcnRpY2VzW2ldLngsIHRoaXMudmVydGljZXNbaV0ueSk7XHJcbiAgICB0aGlzLnNoYXBlLmxpbmVUbyh0aGlzLnZlcnRpY2VzWzBdLngsIHRoaXMudmVydGljZXNbMF0ueSk7XHJcbiAgfSxcclxuICBnZW5HZW9tZXRyeTogZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmdlb21ldHJ5U2V0dGluZ3MgPSB7XHJcbiAgICAgIGRlcHRoOiAzLFxyXG4gICAgICBiZXZlbEVuYWJsZWQ6IGZhbHNlLFxyXG4gICAgICBiZXZlbFNlZ21lbnRzOiAxLFxyXG4gICAgICBzdGVwczogMSxcclxuICAgICAgYmV2ZWxTaXplOiAxIC8gMjAsXHJcbiAgICAgIGJldmVsVGhpY2tuZXNzOiAxIC8gMjBcclxuICAgIH07XHJcbiAgICB0aGlzLmdlb21ldHJ5ID0gbmV3IFRIUkVFLkV4dHJ1ZGVHZW9tZXRyeSh0aGlzLnNoYXBlLCB0aGlzLmdlb21ldHJ5U2V0dGluZ3MpO1xyXG4gIH0sXHJcbiAgZ2VuTWF0ZXJpYWw6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMubWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaExhbWJlcnRNYXRlcmlhbCh7Y29sb3I6IG5ldyBUSFJFRS5Db2xvcigncmVkJyl9KTtcclxuICB9LFxyXG4gIGdlbk1lc2g6IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5tZXNoID0gIG5ldyBUSFJFRS5NZXNoKHRoaXMuZ2VvbWV0cnksIHRoaXMubWF0ZXJpYWwpO1xyXG4gICAgdGhpcy5tZXNoLnJvdGF0ZU9uQXhpcyhuZXcgVEhSRUUuVmVjdG9yMygtMSwgMCwgMCksIE1hdGguUEkgLyAyKTtcclxuICAgIHRoaXMuZWwuc2V0T2JqZWN0M0QoJ21lc2gnLCB0aGlzLm1lc2gpO1xyXG4gIH1cclxufSk7IiwiQUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KCdhbmltYXRlLXJvdGF0aW9uJywge1xyXG4gIG11bHRpcGxlOiB0cnVlLFxyXG4gIHNjaGVtYToge1xyXG4gICAgc3BlZWQ6IHt0eXBlOiAnbnVtYmVyJywgZGVmYXVsdDogMTB9LFxyXG4gICAgYXhlOiB7dHlwZTogJ3N0cmluZycsIGRlZmF1bHQ6ICd4J31cclxuICB9LFxyXG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgfSxcclxuICByZW1vdmU6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgfSxcclxuICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgfSxcclxuICB0aWNrOiBmdW5jdGlvbiAoZWxhcHNlZCwgZHQpIHtcclxuICAgIHRoaXMuZWwub2JqZWN0M0Qucm90YXRpb25bdGhpcy5kYXRhLmF4ZV0gPSBUSFJFRS5NYXRoVXRpbHMuZGVnVG9SYWQoZWxhcHNlZCAvIHRoaXMuZGF0YS5zcGVlZCk7XHJcbiAgfVxyXG59KSIsIkFGUkFNRS5yZWdpc3RlckNvbXBvbmVudCgnY3Vyc29yLWxpc3RlbmVyJywge1xyXG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldnQgPT4ge1xyXG4gICAgICBjb25zb2xlLmxvZyhldnQpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG59KTsiLCJBRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ2VtaXQtd2hlbi1uZWFyJywge1xyXG4gIHNjaGVtYToge1xyXG4gICAgdGFyZ2V0OiB7dHlwZTogJ3NlbGVjdG9yJywgZGVmYXVsdDogJyNjYW1lcmEtcmlnJ30sXHJcbiAgICBkaXN0YW5jZToge3R5cGU6ICdudW1iZXInLCBkZWZhdWx0OiAxfSxcclxuICAgIGV2ZW50OiB7dHlwZTogJ3N0cmluZycsIGRlZmF1bHQ6ICdjbGljayd9LFxyXG4gICAgZXZlbnRGYXI6IHt0eXBlOiAnc3RyaW5nJywgZGVmYXVsdDogJ3VuY2xpY2snfSxcclxuICAgIHRocm90dGxlOiB7dHlwZTogJ251bWJlcicsIGRlZmF1bHQ6IDEwMH0sXHJcbiAgfSxcclxuICBpbml0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLnRpY2sgPSBBRlJBTUUudXRpbHMudGhyb3R0bGVUaWNrKHRoaXMuY2hlY2tEaXN0LCB0aGlzLmRhdGEudGhyb3R0bGUsIHRoaXMpO1xyXG4gICAgdGhpcy5lbWl0aW5nID0gZmFsc2U7XHJcbiAgfSxcclxuICBjaGVja0Rpc3Q6IGZ1bmN0aW9uICgpIHtcclxuICAgIGxldCBteVBvcyA9IG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApO1xyXG4gICAgbGV0IHRhcmdldFBvcyA9IG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApO1xyXG4gICAgdGhpcy5lbC5vYmplY3QzRC5nZXRXb3JsZFBvc2l0aW9uKG15UG9zKTtcclxuICAgIHRoaXMuZGF0YS50YXJnZXQub2JqZWN0M0QuZ2V0V29ybGRQb3NpdGlvbih0YXJnZXRQb3MpO1xyXG4gICAgY29uc3QgZGlzdGFuY2VUbyA9IG15UG9zLmRpc3RhbmNlVG8odGFyZ2V0UG9zKTtcclxuICAgIGlmIChkaXN0YW5jZVRvIDw9IHRoaXMuZGF0YS5kaXN0YW5jZSkge1xyXG4gICAgICBpZiAodGhpcy5lbWl0aW5nKSByZXR1cm47XHJcbiAgICAgIHRoaXMuZW1pdGluZyA9IHRydWU7XHJcbiAgICAgIHRoaXMuZWwuZW1pdCh0aGlzLmRhdGEuZXZlbnQsIHtjb2xsaWRpbmdFbnRpdHk6IHRoaXMuZGF0YS50YXJnZXR9LCBmYWxzZSk7XHJcbiAgICAgIHRoaXMuZGF0YS50YXJnZXQuZW1pdCh0aGlzLmRhdGEuZXZlbnQsIHtjb2xsaWRpbmdFbnRpdHk6IHRoaXMuZWx9LCBmYWxzZSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAoIXRoaXMuZW1pdGluZykgcmV0dXJuO1xyXG4gICAgICB0aGlzLmVsLmVtaXQodGhpcy5kYXRhLmV2ZW50RmFyLCB7Y29sbGlkaW5nRW50aXR5OiB0aGlzLmRhdGEudGFyZ2V0fSwgZmFsc2UpO1xyXG4gICAgICB0aGlzLmRhdGEudGFyZ2V0LmVtaXQodGhpcy5kYXRhLmV2ZW50RmFyLCB7Y29sbGlkaW5nRW50aXR5OiB0aGlzLmVsfSwgZmFsc2UpO1xyXG4gICAgICB0aGlzLmVtaXRpbmcgPSBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG4iLCJBRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ2hvdmVyLWhpZ2hsaWdodGVyJywge1xyXG4gIHNjaGVtYToge1xyXG4gICAgY29sb3I6IHt0eXBlOiAnY29sb3InLCBkZWZhdWx0OiAnd2hpdGUnfVxyXG4gIH0sXHJcbiAgaW5pdDogZnVuY3Rpb24gKCkge1xyXG4gICAgbGV0IHRhcmdldCA9IHRoaXMuZWw7XHJcbiAgICB0aGlzLmhhbmRsZXJPbkVudGVyID0gZXZ0ID0+IHRoaXMub25FbnRlcihldnQpO1xyXG4gICAgdGhpcy5oYW5kbGVyT25MZWF2ZSA9IGV2dCA9PiB0aGlzLm9uTGVhdmUoZXZ0KTtcclxuICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCB0aGlzLmhhbmRsZXJPbkVudGVyKTtcclxuICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCB0aGlzLmhhbmRsZXJPbkxlYXZlKTtcclxuICB9LFxyXG4gIG9uRW50ZXI6IGZ1bmN0aW9uIChldnQpIHtcclxuICAgIGxldCBjdXJzb3IgPSBldnQuZGV0YWlsLmN1cnNvckVsO1xyXG4gICAgdGhpcy5zYXZlZENvbG9yID0gY3Vyc29yLmdldEF0dHJpYnV0ZShcIm1hdGVyaWFsXCIpLmNvbG9yO1xyXG4gICAgY3Vyc29yLnNldEF0dHJpYnV0ZShcIm1hdGVyaWFsXCIsIFwiY29sb3JcIiwgdGhpcy5kYXRhLmNvbG9yKTtcclxuICB9LFxyXG4gIG9uTGVhdmU6IGZ1bmN0aW9uIChldnQpIHtcclxuICAgIGxldCBjdXJzb3IgPSBldnQuZGV0YWlsLmN1cnNvckVsO1xyXG4gICAgY3Vyc29yLnNldEF0dHJpYnV0ZShcIm1hdGVyaWFsXCIsIFwiY29sb3JcIiwgdGhpcy5zYXZlZENvbG9yKTtcclxuICB9LFxyXG4gIHJlbW92ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgbGV0IHRhcmdldCA9IHRoaXMuZWw7XHJcbiAgICB0YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgdGhpcy5oYW5kbGVyT25FbnRlcik7XHJcbiAgICB0YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgdGhpcy5oYW5kbGVyT25MZWF2ZSk7XHJcbiAgfVxyXG59KTsiLCJBRlJBTUUucmVnaXN0ZXJQcmltaXRpdmUoJ2ltLWJveCcsIHtcclxuICBkZWZhdWx0Q29tcG9uZW50czoge1xyXG4gICAgJ2ltYm94Jzoge31cclxuICB9LFxyXG4gIG1hcHBpbmdzOiB7XHJcbiAgICBzaXplOiAnaW1ib3guc2l6ZScsXHJcbiAgICBjb2xvcjogJ2ltYm94LmNvbG9yJyxcclxuICB9XHJcbn0pO1xyXG5cclxuQUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KCdpbWJveCcsIHtcclxuICBzY2hlbWE6IHtcclxuICAgIHNpemU6IHt0eXBlOiBcIm51bWJlclwiLCBkZWZhdWx0OiAxfSxcclxuICAgIGNvbG9yOiB7dHlwZTogXCJjb2xvclwiLCBkZWZhdWx0OiAnYmxhY2snfVxyXG4gIH0sXHJcbiAgaW5pdDogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5nZW5WZXJ0aWNlcygpO1xyXG4gICAgdGhpcy5nZW5TaGFwZSgpO1xyXG4gICAgdGhpcy5nZW5HZW9tZXRyeSgpO1xyXG4gICAgdGhpcy5nZW5NYXRlcmlhbCgpO1xyXG4gICAgdGhpcy5nZW5NZXNoKCk7XHJcbiAgfSxcclxuICBnZW5WZXJ0aWNlczogZnVuY3Rpb24gICgpIHtcclxuICAgIGNvbnN0IGhhbGYgPSB0aGlzLmRhdGEuc2l6ZSAvMjtcclxuICAgIHRoaXMudmVydGljZXMgPSBbXTtcclxuICAgIHRoaXMudmVydGljZXMucHVzaChuZXcgVEhSRUUuVmVjdG9yMigtaGFsZiwgaGFsZikpO1xyXG4gICAgdGhpcy52ZXJ0aWNlcy5wdXNoKG5ldyBUSFJFRS5WZWN0b3IyKGhhbGYsIGhhbGYpKTtcclxuICAgIHRoaXMudmVydGljZXMucHVzaChuZXcgVEhSRUUuVmVjdG9yMihoYWxmLCAtaGFsZikpO1xyXG4gICAgdGhpcy52ZXJ0aWNlcy5wdXNoKG5ldyBUSFJFRS5WZWN0b3IyKC1oYWxmLCAtaGFsZikpO1xyXG4gIH0sXHJcbiAgZ2VuU2hhcGU6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuc2hhcGUgPSBuZXcgVEhSRUUuU2hhcGUoKTtcclxuXHJcbiAgICBjb25zdCBoZyA9IHRoaXMudmVydGljZXNbMF07XHJcbiAgICB0aGlzLnNoYXBlLm1vdmVUbyhoZy54LCBoZy55KTtcclxuXHJcbiAgICBjb25zdCBoZCA9IHRoaXMudmVydGljZXNbMV07XHJcbiAgICB0aGlzLnNoYXBlLmxpbmVUbyhoZC54LCBoZC55KTtcclxuXHJcbiAgICBjb25zdCBiZCA9IHRoaXMudmVydGljZXNbMl07XHJcbiAgICB0aGlzLnNoYXBlLmxpbmVUbyhiZC54LCBiZC55KTtcclxuXHJcbiAgICBjb25zdCBibCA9IHRoaXMudmVydGljZXNbM107XHJcbiAgICB0aGlzLnNoYXBlLmxpbmVUbyhibC54LCBibC55KTtcclxuXHJcbiAgICB0aGlzLnNoYXBlLmxpbmVUbyhoZy54LCBoZy55KTtcclxuXHJcblxyXG5cclxuICB9LFxyXG5cclxuICBnZW5HZW9tZXRyeTogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgIGNvbnN0IGV4dHJ1ZGVTZXR0aW5ncyA9IHtcclxuICAgICAgc3RlcHM6IDEsXHJcbiAgICAgIGRlcHRoOiB0aGlzLmRhdGEuc2l6ZSxcclxuICAgICAgYmV2ZWxFbmFibGVkOiBmYWxzZSxcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5nZW9tZXRyeSA9IG5ldyBUSFJFRS5FeHRydWRlR2VvbWV0cnkoIHRoaXMuc2hhcGUsIGV4dHJ1ZGVTZXR0aW5ncyApO1xyXG4gIH0sXHJcblxyXG4gIGdlbk1hdGVyaWFsOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLm1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hMYW1iZXJ0TWF0ZXJpYWwoe1xyXG4gICAgICAgY29sb3I6IG5ldyBUSFJFRS5Db2xvcih0aGlzLmRhdGEuY29sb3IpXHJcbiAgICB9ICk7XHJcbiAgfSxcclxuXHJcbiAgZ2VuTWVzaDogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5tZXNoID0gbmV3IFRIUkVFLk1lc2goIHRoaXMuZ2VvbWV0cnksIHRoaXMubWF0ZXJpYWwgKSA7XHJcbiAgICB0aGlzLmVsLnNldE9iamVjdDNEKCdtZXNoJywgdGhpcy5tZXNoKTtcclxuICB9XHJcblxyXG59KVxyXG4iLCJBRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ2xpc3Rlbi10bycsIHtcclxuICBtdWx0aXBsZTogdHJ1ZSxcclxuICBzY2hlbWE6IHtcclxuICAgIGV2dDoge3R5cGU6ICdzdHJpbmcnLCBkZWZhdWx0OiAnY2xpY2snfSxcclxuICAgIHRhcmdldDoge3R5cGU6ICdzZWxlY3Rvcid9LFxyXG4gICAgZW1pdDoge3R5cGU6ICdzdHJpbmcnfVxyXG4gIH0sXHJcbiAgaW5pdDogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5kYXRhLnRhcmdldC5hZGRFdmVudExpc3RlbmVyKHRoaXMuZGF0YS5ldnQsIGV2dCA9PiB7XHJcbiAgICAgIHRoaXMuZWwuZW1pdCh0aGlzLmRhdGEuZW1pdCk7XHJcbiAgICB9KVxyXG4gIH1cclxufSk7IiwiQUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KCdvbi1ldmVudC1zZXQnLCB7XHJcbiAgbXVsdGlwbGU6IHRydWUsXHJcblxyXG4gIHNjaGVtYToge1xyXG4gICAgZXZlbnQ6IHt0eXBlOiAnc3RyaW5nJywgZGVmYXVsdDogJ2NsaWNrJ30sXHJcbiAgICBhdHRyaWJ1dGU6IHt0eXBlOiAnc3RyaW5nJ30sXHJcbiAgICB2YWx1ZToge3R5cGU6ICdzdHJpbmcnfVxyXG4gIH0sXHJcblxyXG4gIGluaXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5fb25FdmVudCA9IHRoaXMuX29uRXZlbnQuYmluZCh0aGlzKTtcclxuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcih0aGlzLmRhdGEuZXZlbnQsIHRoaXMuX29uRXZlbnQpO1xyXG4gIH0sXHJcblxyXG4gIHJlbW92ZTogZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIodGhpcy5kYXRhLmV2ZW50LCB0aGlzLl9vbkV2ZW50KTtcclxuICB9LFxyXG5cclxuICBfb25FdmVudDogZnVuY3Rpb24oZXZ0KSB7XHJcbiAgICBBRlJBTUUudXRpbHMuZW50aXR5LnNldENvbXBvbmVudFByb3BlcnR5KHRoaXMuZWwsIHRoaXMuZGF0YS5hdHRyaWJ1dGUsIHRoaXMuZGF0YS52YWx1ZSk7XHJcbiAgfVxyXG5cclxufSk7IiwiLyogZ2xvYmFsIEFGUkFNRSwgVEhSRUUgKi9cclxuXHJcbi8qIENvbnN0cmFpbiBhbiBvYmplY3QgdG8gYSBuYXZtZXNoLCBmb3IgZXhhbXBsZSBwbGFjZSB0aGlzIGVsZW1lbnQgYWZ0ZXIgd2FzZC1jb250cm9scyBsaWtlIHNvOlxyXG5gd2FzZC1jb250cm9scyBuYXZtZXNoLXBoeXNpY3M9XCIjbmF2bWVzaC1lbFwiYFxyXG4qL1xyXG5BRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ3NpbXBsZS1uYXZtZXNoLWNvbnN0cmFpbnQnLCB7XHJcbiAgc2NoZW1hOiB7XHJcbiAgICBuYXZtZXNoOiB7XHJcbiAgICAgIGRlZmF1bHQ6ICcnXHJcbiAgICB9LFxyXG4gICAgZmFsbDoge1xyXG4gICAgICBkZWZhdWx0OiAwLjVcclxuICAgIH0sXHJcbiAgICBoZWlnaHQ6IHtcclxuICAgICAgZGVmYXVsdDogMS44XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgaW5pdDogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5sYXN0UG9zaXRpb24gPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xyXG4gICAgdGhpcy5lbC5vYmplY3QzRC5nZXRXb3JsZFBvc2l0aW9uKHRoaXMubGFzdFBvc2l0aW9uKTtcclxuICB9LFxyXG5cclxuICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcclxuICAgIGNvbnN0IGVscyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLmRhdGEubmF2bWVzaCkpO1xyXG4gICAgaWYgKGVscyA9PT0gbnVsbCkge1xyXG4gICAgICBjb25zb2xlLndhcm4oJ25hdm1lc2gtcGh5c2ljczogRGlkIG5vdCBtYXRjaCBhbnkgZWxlbWVudHMnKTtcclxuICAgICAgdGhpcy5vYmplY3RzID0gW107XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLm9iamVjdHMgPSBlbHMubWFwKGVsID0+IGVsLm9iamVjdDNEKTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICB0aWNrOiAoZnVuY3Rpb24gKCkge1xyXG4gICAgY29uc3QgbmV4dFBvc2l0aW9uID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcclxuICAgIGNvbnN0IHRlbXBWZWMgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xyXG4gICAgY29uc3Qgc2NhblBhdHRlcm4gPSBbXHJcbiAgICAgIFswLDFdLCAvLyBEZWZhdWx0IHRoZSBuZXh0IGxvY2F0aW9uXHJcbiAgICAgIFszMCwwLjRdLCAvLyBBIGxpdHRsZSB0byB0aGUgc2lkZSBzaG9ydGVyIHJhbmdlXHJcbiAgICAgIFstMzAsMC40XSwgLy8gQSBsaXR0bGUgdG8gdGhlIHNpZGUgc2hvcnRlciByYW5nZVxyXG4gICAgICBbNjAsMC4yXSwgLy8gTW9kZXJhdGVseSB0byB0aGUgc2lkZSBzaG9ydCByYW5nZVxyXG4gICAgICBbLTYwLDAuMl0sIC8vIE1vZGVyYXRlbHkgdG8gdGhlIHNpZGUgc2hvcnQgcmFuZ2VcclxuICAgICAgWzgwLDAuMDZdLCAvLyBQZXJwZW5kaWN1bGFyIHZlcnkgc2hvcnQgcmFuZ2VcclxuICAgICAgWy04MCwwLjA2XSwgLy8gUGVycGVuZGljdWxhciB2ZXJ5IHNob3J0IHJhbmdlXHJcbiAgICBdO1xyXG4gICAgY29uc3QgZG93biA9IG5ldyBUSFJFRS5WZWN0b3IzKDAsLTEsMCk7XHJcbiAgICBjb25zdCByYXljYXN0ZXIgPSBuZXcgVEhSRUUuUmF5Y2FzdGVyKCk7XHJcbiAgICBjb25zdCBncmF2aXR5ID0gLTE7XHJcbiAgICBjb25zdCBtYXhZVmVsb2NpdHkgPSAwLjU7XHJcbiAgICBjb25zdCByZXN1bHRzID0gW107XHJcbiAgICBsZXQgeVZlbCA9IDA7XHJcblxyXG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0aW1lLCBkZWx0YSkge1xyXG4gICAgICBjb25zdCBlbCA9IHRoaXMuZWw7XHJcbiAgICAgIGlmICh0aGlzLm9iamVjdHMubGVuZ3RoID09PSAwKSByZXR1cm47XHJcblxyXG4gICAgICB0aGlzLmVsLm9iamVjdDNELmdldFdvcmxkUG9zaXRpb24obmV4dFBvc2l0aW9uKTtcclxuICAgICAgaWYgKG5leHRQb3NpdGlvbi5kaXN0YW5jZVRvKHRoaXMubGFzdFBvc2l0aW9uKSA9PT0gMCkgcmV0dXJuO1xyXG5cclxuICAgICAgbGV0IGRpZEhpdCA9IGZhbHNlO1xyXG5cclxuICAgICAgLy8gU28gdGhhdCBpdCBkb2VzIG5vdCBnZXQgc3R1Y2sgaXQgdGFrZXMgYXMgZmV3IHNhbXBsZXMgYXJvdW5kIHRoZSB1c2VyIGFuZCBmaW5kcyB0aGUgbW9zdCBhcHByb3ByaWF0ZVxyXG4gICAgICBmb3IgKGNvbnN0IFthbmdsZSwgZGlzdGFuY2VdIG9mIHNjYW5QYXR0ZXJuKSB7XHJcbiAgICAgICAgdGVtcFZlYy5zdWJWZWN0b3JzKG5leHRQb3NpdGlvbiwgdGhpcy5sYXN0UG9zaXRpb24pO1xyXG4gICAgICAgIHRlbXBWZWMuYXBwbHlBeGlzQW5nbGUoZG93biwgYW5nbGUqTWF0aC5QSS8xODApO1xyXG4gICAgICAgIHRlbXBWZWMubXVsdGlwbHlTY2FsYXIoZGlzdGFuY2UpO1xyXG4gICAgICAgIHRlbXBWZWMuYWRkKHRoaXMubGFzdFBvc2l0aW9uKTtcclxuICAgICAgICB0ZW1wVmVjLnkgKz0gbWF4WVZlbG9jaXR5O1xyXG4gICAgICAgIHRlbXBWZWMueSAtPSB0aGlzLmRhdGEuaGVpZ2h0O1xyXG4gICAgICAgIHJheWNhc3Rlci5zZXQodGVtcFZlYywgZG93bik7XHJcbiAgICAgICAgcmF5Y2FzdGVyLmZhciA9IHRoaXMuZGF0YS5mYWxsID4gMCA/IHRoaXMuZGF0YS5mYWxsICsgbWF4WVZlbG9jaXR5IDogSW5maW5pdHk7XHJcbiAgICAgICAgcmF5Y2FzdGVyLmludGVyc2VjdE9iamVjdHModGhpcy5vYmplY3RzLCB0cnVlLCByZXN1bHRzKTtcclxuICAgICAgICBpZiAocmVzdWx0cy5sZW5ndGgpIHtcclxuICAgICAgICAgIGNvbnN0IGhpdFBvcyA9IHJlc3VsdHNbMF0ucG9pbnQ7XHJcbiAgICAgICAgICBoaXRQb3MueSArPSB0aGlzLmRhdGEuaGVpZ2h0O1xyXG4gICAgICAgICAgaWYgKG5leHRQb3NpdGlvbi55IC0gKGhpdFBvcy55IC0geVZlbCoyKSA+IDAuMDEpIHtcclxuICAgICAgICAgICAgeVZlbCArPSBNYXRoLm1heChncmF2aXR5ICogZGVsdGEgKiAwLjAwMSwgLW1heFlWZWxvY2l0eSk7XHJcbiAgICAgICAgICAgIGhpdFBvcy55ID0gbmV4dFBvc2l0aW9uLnkgKyB5VmVsO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgeVZlbCA9IDA7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbC5vYmplY3QzRC5wb3NpdGlvbi5jb3B5KGhpdFBvcyk7XHJcbiAgICAgICAgICB0aGlzLmVsLm9iamVjdDNELnBhcmVudC53b3JsZFRvTG9jYWwodGhpcy5lbC5vYmplY3QzRC5wb3NpdGlvbik7XHJcbiAgICAgICAgICB0aGlzLmxhc3RQb3NpdGlvbi5jb3B5KGhpdFBvcyk7XHJcbiAgICAgICAgICByZXN1bHRzLnNwbGljZSgwKTtcclxuICAgICAgICAgIGRpZEhpdCA9IHRydWU7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghZGlkSGl0KSB7XHJcbiAgICAgICAgdGhpcy5lbC5vYmplY3QzRC5wb3NpdGlvbi5jb3B5KHRoaXMubGFzdFBvc2l0aW9uKTtcclxuICAgICAgICB0aGlzLmVsLm9iamVjdDNELnBhcmVudC53b3JsZFRvTG9jYWwodGhpcy5lbC5vYmplY3QzRC5wb3NpdGlvbik7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9KCkpXHJcbn0pO1xyXG4iLCJBRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ3RvZ2dsZS1ldmVudHMnLCB7XHJcbiAgbXVsdGlwbGU6IHRydWUsXHJcbiAgc2NoZW1hOiB7XHJcbiAgICBzb3VyY2VFdnQ6IHt0eXBlOiAnc3RyaW5nJywgZGVmYXVsdDogJ2NsaWNrJ30sXHJcbiAgICBldnQxOiB7dHlwZTogJ3N0cmluZyd9LFxyXG4gICAgZXZ0Mjoge3R5cGU6ICdzdHJpbmcnfVxyXG4gIH0sXHJcbiAgaW5pdDogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5zdGF0ZSA9IDA7XHJcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIodGhpcy5kYXRhLnNvdXJjZUV2dCwgZXZ0ID0+IHtcclxuICAgICAgaWYgKHRoaXMuc3RhdGUgPT0gMCkge1xyXG4gICAgICAgIHRoaXMuZWwuZW1pdCh0aGlzLmRhdGEuZXZ0MSk7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IDE7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5lbC5lbWl0KHRoaXMuZGF0YS5ldnQyKTtcclxuICAgICAgICB0aGlzLnN0YXRlID0gMDtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG59KTsiLCJ2YXIgbWFwID0ge1xuXHRcIi4vYS10ZXN0LmpzXCI6IFwiLi9zcmMvY29tcG9uZW50cy9hLXRlc3QuanNcIixcblx0XCIuL2FuaW1hdGUtcm90YXRpb24uanNcIjogXCIuL3NyYy9jb21wb25lbnRzL2FuaW1hdGUtcm90YXRpb24uanNcIixcblx0XCIuL2N1cnNvci1saXN0ZW5lci5qc1wiOiBcIi4vc3JjL2NvbXBvbmVudHMvY3Vyc29yLWxpc3RlbmVyLmpzXCIsXG5cdFwiLi9lbWl0LXdoZW4tbmVhci5qc1wiOiBcIi4vc3JjL2NvbXBvbmVudHMvZW1pdC13aGVuLW5lYXIuanNcIixcblx0XCIuL2hvdmVyLWhpZ2hsaWdodGVyLmpzXCI6IFwiLi9zcmMvY29tcG9uZW50cy9ob3Zlci1oaWdobGlnaHRlci5qc1wiLFxuXHRcIi4vaW0tYm94LmpzXCI6IFwiLi9zcmMvY29tcG9uZW50cy9pbS1ib3guanNcIixcblx0XCIuL2xpc3Rlbi10by5qc1wiOiBcIi4vc3JjL2NvbXBvbmVudHMvbGlzdGVuLXRvLmpzXCIsXG5cdFwiLi9vbi1ldmVudC1zZXQuanNcIjogXCIuL3NyYy9jb21wb25lbnRzL29uLWV2ZW50LXNldC5qc1wiLFxuXHRcIi4vc2ltcGxlLW5hdm1lc2gtY29uc3RyYWludC5qc1wiOiBcIi4vc3JjL2NvbXBvbmVudHMvc2ltcGxlLW5hdm1lc2gtY29uc3RyYWludC5qc1wiLFxuXHRcIi4vdG9nZ2xlLWV2ZW50cy5qc1wiOiBcIi4vc3JjL2NvbXBvbmVudHMvdG9nZ2xlLWV2ZW50cy5qc1wiLFxuXHRcImNvbXBvbmVudHMvYS10ZXN0LmpzXCI6IFwiLi9zcmMvY29tcG9uZW50cy9hLXRlc3QuanNcIixcblx0XCJjb21wb25lbnRzL2FuaW1hdGUtcm90YXRpb24uanNcIjogXCIuL3NyYy9jb21wb25lbnRzL2FuaW1hdGUtcm90YXRpb24uanNcIixcblx0XCJjb21wb25lbnRzL2N1cnNvci1saXN0ZW5lci5qc1wiOiBcIi4vc3JjL2NvbXBvbmVudHMvY3Vyc29yLWxpc3RlbmVyLmpzXCIsXG5cdFwiY29tcG9uZW50cy9lbWl0LXdoZW4tbmVhci5qc1wiOiBcIi4vc3JjL2NvbXBvbmVudHMvZW1pdC13aGVuLW5lYXIuanNcIixcblx0XCJjb21wb25lbnRzL2hvdmVyLWhpZ2hsaWdodGVyLmpzXCI6IFwiLi9zcmMvY29tcG9uZW50cy9ob3Zlci1oaWdobGlnaHRlci5qc1wiLFxuXHRcImNvbXBvbmVudHMvaW0tYm94LmpzXCI6IFwiLi9zcmMvY29tcG9uZW50cy9pbS1ib3guanNcIixcblx0XCJjb21wb25lbnRzL2xpc3Rlbi10by5qc1wiOiBcIi4vc3JjL2NvbXBvbmVudHMvbGlzdGVuLXRvLmpzXCIsXG5cdFwiY29tcG9uZW50cy9vbi1ldmVudC1zZXQuanNcIjogXCIuL3NyYy9jb21wb25lbnRzL29uLWV2ZW50LXNldC5qc1wiLFxuXHRcImNvbXBvbmVudHMvc2ltcGxlLW5hdm1lc2gtY29uc3RyYWludC5qc1wiOiBcIi4vc3JjL2NvbXBvbmVudHMvc2ltcGxlLW5hdm1lc2gtY29uc3RyYWludC5qc1wiLFxuXHRcImNvbXBvbmVudHMvdG9nZ2xlLWV2ZW50cy5qc1wiOiBcIi4vc3JjL2NvbXBvbmVudHMvdG9nZ2xlLWV2ZW50cy5qc1wiXG59O1xuXG5cbmZ1bmN0aW9uIHdlYnBhY2tDb250ZXh0KHJlcSkge1xuXHR2YXIgaWQgPSB3ZWJwYWNrQ29udGV4dFJlc29sdmUocmVxKTtcblx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oaWQpO1xufVxuZnVuY3Rpb24gd2VicGFja0NvbnRleHRSZXNvbHZlKHJlcSkge1xuXHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKG1hcCwgcmVxKSkge1xuXHRcdHZhciBlID0gbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIiArIHJlcSArIFwiJ1wiKTtcblx0XHRlLmNvZGUgPSAnTU9EVUxFX05PVF9GT1VORCc7XG5cdFx0dGhyb3cgZTtcblx0fVxuXHRyZXR1cm4gbWFwW3JlcV07XG59XG53ZWJwYWNrQ29udGV4dC5rZXlzID0gZnVuY3Rpb24gd2VicGFja0NvbnRleHRLZXlzKCkge1xuXHRyZXR1cm4gT2JqZWN0LmtleXMobWFwKTtcbn07XG53ZWJwYWNrQ29udGV4dC5yZXNvbHZlID0gd2VicGFja0NvbnRleHRSZXNvbHZlO1xubW9kdWxlLmV4cG9ydHMgPSB3ZWJwYWNrQ29udGV4dDtcbndlYnBhY2tDb250ZXh0LmlkID0gXCIuL3NyYy9jb21wb25lbnRzIHN5bmMgXFxcXC5qcyRcIjsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIlxyXG5mdW5jdGlvbiBpbXBvcnRBbGwocikge1xyXG4gIHIua2V5cygpLmZvckVhY2gocik7XHJcbn1cclxuXHJcbmltcG9ydEFsbChyZXF1aXJlLmNvbnRleHQoJy4vY29tcG9uZW50cycsIGZhbHNlLCAvXFwuanMkLykpOyJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==