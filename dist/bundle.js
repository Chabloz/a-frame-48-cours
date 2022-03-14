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

/***/ "./src/components/blink-controls.js":
/*!******************************************!*\
  !*** ./src/components/blink-controls.js ***!
  \******************************************/
/***/ (() => {

/* global THREE, AFRAME  */
// aframe-blink-controls https://github.com/jure/aframe-blink-controls
// Adapted from https://github.com/fernandojsg/aframe-teleport-controls
// Additions: Teleport rotation, parabolic root calculation, bindings, fix for triangle strip draw mode
// Removals: Line teleport
// WARNING: Super early! Currently only tested with Oculus Touch controllers

AFRAME.registerGeometry('prism', {
  schema: {
    depth: { default: 1, min: 0 },
    height: { default: 1, min: 0 },
    width: { default: 1, min: 0 }
  },

  init: function (data) {
    const shape = new THREE.Shape()
    shape.moveTo(data.width / 2, 0)
    shape.lineTo(0, data.height)
    shape.lineTo(-data.width / 2, 0)
    shape.lineTo(data.width / 2, 0)

    const extrudeSettings = {
      steps: 2,
      depth: data.depth,
      bevelEnabled: false
    }
    this.geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
  }
})

// WIP: Controller bindings cheat sheet
// For HTC Vive: trackpaddown and trackpadup with axismove
// For Oculus Touch: thumbstickdown and thumbstickup, with thumbstick event and evt.detail.y and evt.detail.x
// For Valve Index (maybe): touchstart, touchend, axismove?

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.')
}

AFRAME.registerComponent('blink-controls', {
  schema: {
    // Button is a simplified startEvents & endEvents specification, e.g.
    // 'thumbstick' binds 'thumbstickdown' and 'thumbstickup' respectively
    button: { default: '', oneOf: ['trackpad', 'trigger', 'grip', 'menu', 'thumbstick'] },
    // The default teleport activation is a forward thumbstick axis,
    // but this can be changed with startEvents.
    startEvents: { type: 'array', default: [] },
    // The default teleport de-activation is a centered thumbstick axis,
    // but this can be changed with endEvents.
    endEvents: { type: 'array', default: [] },
    collisionEntities: { default: '' },
    hitEntity: { type: 'selector' },
    cameraRig: { type: 'selector', default: '#player' },
    teleportOrigin: { type: 'selector', default: '#camera' },
    hitCylinderColor: { type: 'color', default: '#4d93fd' },
    hitCylinderRadius: { default: 0.25, min: 0 },
    hitCylinderHeight: { default: 0.3, min: 0 },
    interval: { default: 0 },
    curveNumberPoints: { default: 60, min: 2 },
    curveLineWidth: { default: 0.025 },
    curveHitColor: { type: 'color', default: '#4d93fd' },
    curveMissColor: { type: 'color', default: '#ff0000' },
    curveShootingSpeed: { default: 10, min: 0 },
    defaultPlaneSize: { default: 100 },
    landingNormal: { type: 'vec3', default: { x: 0, y: 1, z: 0 } },
    landingMaxAngle: { default: '45', min: 0, max: 360 },
    drawIncrementally: { default: true },
    incrementalDrawMs: { default: 300 },
    missOpacity: { default: 0.8 },
    hitOpacity: { default: 0.8 },
    snapTurn: { default: true },
    rotateOnTeleport: { default: true }
  },

  init: function () {
    const data = this.data
    const el = this.el
    let i

    this.active = false
    this.obj = el.object3D
    this.controllerPosition = new THREE.Vector3()
    this.hitEntityQuaternion = new THREE.Quaternion()
    // teleportOrigin is headset/camera with look-controls
    this.teleportOriginQuaternion = new THREE.Quaternion()
    this.hitPoint = new THREE.Vector3()
    this.collisionObjectNormalMatrix = new THREE.Matrix3()
    this.collisionWorldNormal = new THREE.Vector3()
    this.rigWorldPosition = new THREE.Vector3()
    this.newRigWorldPosition = new THREE.Vector3()
    this.teleportEventDetail = {
      oldPosition: this.rigWorldPosition,
      newPosition: this.newRigWorldPosition,
      hitPoint: this.hitPoint,
      rotationQuaternion: this.hitEntityQuaternion
    }

    this.hit = false
    this.prevCheckTime = undefined
    this.referenceNormal = new THREE.Vector3()
    this.curveMissColor = new THREE.Color()
    this.curveHitColor = new THREE.Color()
    this.raycaster = new THREE.Raycaster()

    this.defaultPlane = this.createDefaultPlane(this.data.defaultPlaneSize)
    this.defaultCollisionMeshes = [this.defaultPlane]

    const teleportEntity = this.teleportEntity = document.createElement('a-entity')
    teleportEntity.classList.add('teleportRay')
    teleportEntity.setAttribute('visible', false)
    el.sceneEl.appendChild(this.teleportEntity)

    this.onButtonDown = this.onButtonDown.bind(this)
    this.onButtonUp = this.onButtonUp.bind(this)
    this.handleThumbstickAxis = this.handleThumbstickAxis.bind(this)

    this.teleportOrigin = this.data.teleportOrigin
    this.cameraRig = this.data.cameraRig

    this.snapturnRotation = THREE.MathUtils.degToRad(45)
    this.canSnapturn = true

    // Are startEvents and endEvents specified?
    if (this.data.startEvents.length && this.data.endEvents.length) {
      for (i = 0; i < this.data.startEvents.length; i++) {
        el.addEventListener(this.data.startEvents[i], this.onButtonDown)
      }
      for (i = 0; i < this.data.endEvents.length; i++) {
        el.addEventListener(this.data.endEvents[i], this.onButtonUp)
      }
    // Is a button for activation specified?
    } else if (data.button) {
      el.addEventListener(data.button + 'down', this.onButtonDown)
      el.addEventListener(data.button + 'up', this.onButtonUp)
    // If none of the above, default to thumbstick-axis based activation
    } else {
      this.thumbstickAxisActivation = true
    }

    el.addEventListener('thumbstickmoved', this.handleThumbstickAxis)
    this.queryCollisionEntities()
  },
  handleSnapturn: function (rotation, strength) {
    if (strength < 0.50) this.canSnapturn = true
    if (!this.canSnapturn) return
    // Only do snapturns if axis is very prominent (user intent is clear)
    // And preven further snapturns until axis returns to (close enough to) 0
    if (strength > 0.95) {
      if (Math.abs(rotation - Math.PI / 2.0) < 0.6) {
        this.cameraRig.object3D.rotateY(+this.snapturnRotation)
        this.canSnapturn = false
      } else if (Math.abs(rotation - 1.5 * Math.PI) < 0.6) {
        this.cameraRig.object3D.rotateY(-this.snapturnRotation)
        this.canSnapturn = false
      }
    }
    // if (rotation ) {
    //   this.cameraRig.object3D.rotateY(-Math.sign(x) * this.snapturnRotation)
    //   this.canSnapturn = false
    // }
  },
  handleThumbstickAxis: function (evt) {
    if (evt.detail.x !== undefined && evt.detail.y !== undefined) {
      const rotation = Math.atan2(evt.detail.x, evt.detail.y) + Math.PI
      const strength = Math.sqrt(evt.detail.x ** 2 + evt.detail.y ** 2)

      if (this.active) {
        // Only rotate if the axes are sufficiently prominent,
        // to prevent rotating in undesired/fluctuating directions.
        if (strength > 0.95) {
          this.obj.getWorldPosition(this.controllerPosition)
          this.controllerPosition.setComponent(1, this.hitEntity.object3D.position.y)
          // TODO: We set hitEntity invisible to prevent rotation glitches
          // but we could also rotate an invisible object instead and only
          // apply the final rotation to hitEntity.
          this.hitEntity.object3D.visible = false
          this.hitEntity.object3D.lookAt(this.controllerPosition)
          this.hitEntity.object3D.rotateY(rotation)
          this.hitEntity.object3D.visible = true
          this.hitEntity.object3D.getWorldQuaternion(this.hitEntityQuaternion)
        }
        if (Math.abs(evt.detail.x) === 0 && Math.abs(evt.detail.y) === 0) {
          // Disable teleport on axis return to 0 if axis (de)activation is enabled
          this.onButtonUp()
        }
        // Forward (rotation 0.0 || 6.28 is straight ahead)
        // We use half a radian left and right for some leeway
        // We also check for significant y axis movement to prevent
        // accidental teleports
      } else if (this.thumbstickAxisActivation && strength > 0.95 && (rotation < 0.50 || rotation > 5.78)) {
        // Activate (fuzzily) on forward axis if axis activation is enabled
        this.onButtonDown()
      } else if (this.data.snapTurn) {
        this.handleSnapturn(rotation, strength)
      }
    }
  },
  update: function (oldData) {
    const data = this.data
    const diff = AFRAME.utils.diff(data, oldData)

    // Update normal.
    this.referenceNormal.copy(data.landingNormal)

    // Update colors.
    this.curveMissColor.set(data.curveMissColor)
    this.curveHitColor.set(data.curveHitColor)

    // Create or update line mesh.
    if (!this.line ||
        'curveLineWidth' in diff || 'curveNumberPoints' in diff || 'type' in diff) {
      this.line = this.createLine(data)
      this.line.material.opacity = this.data.hitOpacity
      this.line.material.transparent = this.data.hitOpacity < 1
      this.numActivePoints = data.curveNumberPoints
      this.teleportEntity.setObject3D('mesh', this.line.mesh)
    }

    // Create or update hit entity.
    if (data.hitEntity) {
      this.hitEntity = data.hitEntity
    } else if (!this.hitEntity || 'hitCylinderColor' in diff || 'hitCylinderHeight' in diff ||
               'hitCylinderRadius' in diff) {
      // Remove previous entity, create new entity (could be more performant).
      if (this.hitEntity) { this.hitEntity.parentNode.removeChild(this.hitEntity) }
      this.hitEntity = this.createHitEntity(data)
      this.el.sceneEl.appendChild(this.hitEntity)
    }
    this.hitEntity.setAttribute('visible', false)

    // If it has rotation on teleport disabled hide the arrow indicating the teleportation direction
    if (!data.hitEntity) {
      this.hitEntity.lastElementChild.setAttribute('visible', data.rotateOnTeleport);
    }

    if ('collisionEntities' in diff) { this.queryCollisionEntities() }
  },

  remove: function () {
    const el = this.el
    const hitEntity = this.hitEntity
    const teleportEntity = this.teleportEntity

    if (hitEntity) { hitEntity.parentNode.removeChild(hitEntity) }
    if (teleportEntity) { teleportEntity.parentNode.removeChild(teleportEntity) }

    el.sceneEl.removeEventListener('child-attached', this.childAttachHandler)
    el.sceneEl.removeEventListener('child-detached', this.childDetachHandler)
  },

  tick: (function () {
    const p0 = new THREE.Vector3()
    const v0 = new THREE.Vector3()
    const g = -9.8
    const a = new THREE.Vector3(0, g, 0)
    const next = new THREE.Vector3()
    const last = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    const translation = new THREE.Vector3()
    const scale = new THREE.Vector3()
    const shootAngle = new THREE.Vector3()
    const lastNext = new THREE.Vector3()
    const auxDirection = new THREE.Vector3()
    let timeSinceDrawStart = 0

    return function (time, delta) {
      if (!this.active) { return }
      if (this.data.drawIncrementally && this.redrawLine) {
        this.redrawLine = false
        timeSinceDrawStart = 0
      }
      timeSinceDrawStart += delta
      this.numActivePoints = this.data.curveNumberPoints * timeSinceDrawStart / this.data.incrementalDrawMs
      if (this.numActivePoints > this.data.curveNumberPoints) {
        this.numActivePoints = this.data.curveNumberPoints
      }

      // Only check for intersection if interval time has passed.
      if (this.prevCheckTime && (time - this.prevCheckTime < this.data.interval)) { return }
      // Update check time.
      this.prevCheckTime = time

      const matrixWorld = this.obj.matrixWorld
      matrixWorld.decompose(translation, quaternion, scale)

      const direction = shootAngle.set(0, 0, -1)
        .applyQuaternion(quaternion).normalize()
      this.line.setDirection(auxDirection.copy(direction))
      this.obj.getWorldPosition(p0)

      last.copy(p0)

      // Set default status as non-hit
      this.teleportEntity.setAttribute('visible', true)

      // But use hit color until ray animation finishes
      if (timeSinceDrawStart < this.data.incrementalDrawMs) {
        this.line.material.color.set(this.curveHitColor)
      } else {
        this.line.material.color.set(this.curveMissColor)
      }
      this.line.material.opacity = this.data.missOpacity
      this.line.material.transparent = this.data.missOpacity < 1
      this.hitEntity.setAttribute('visible', false)
      this.hit = false

      v0.copy(direction).multiplyScalar(this.data.curveShootingSpeed)

      this.lastDrawnIndex = 0
      const numPoints = this.data.drawIncrementally ? this.numActivePoints : this.line.numPoints
      for (let i = 0; i < numPoints + 1; i++) {
        let t
        if (i === Math.floor(numPoints + 1)) {
          t = numPoints / (this.line.numPoints - 1)
        } else {
          t = i / (this.line.numPoints - 1)
        }
        const timeToReach0 = this.parabolicCurveMaxRoot(p0, v0, a)
        t = t * Math.max(1, 1.5 * timeToReach0)

        this.parabolicCurve(p0, v0, a, t, next)
        // Update the raycaster with the length of the current segment last->next
        const dirLastNext = lastNext.copy(next).sub(last).normalize()
        this.raycaster.far = dirLastNext.length()
        this.raycaster.set(last, dirLastNext)

        this.lastDrawnPoint = next
        this.lastDrawnIndex = i
        if (this.checkMeshCollisions(i, last, next)) { break }

        last.copy(next)
      }
      for (let j = this.lastDrawnIndex + 1; j < this.line.numPoints; j++) {
        this.line.setPoint(j, this.lastDrawnPoint, this.lastDrawnPoint)
      }
    }
  })(),

  /**
   * Run `querySelectorAll` for `collisionEntities` and maintain it with `child-attached`
   * and `child-detached` events.
   */
  queryCollisionEntities: function () {
    const data = this.data
    const el = this.el

    if (!data.collisionEntities) {
      this.collisionEntities = []
      return
    }

    const collisionEntities = [].slice.call(el.sceneEl.querySelectorAll(data.collisionEntities))
    this.collisionEntities = collisionEntities

    // Update entity list on attach.
    this.childAttachHandler = function childAttachHandler (evt) {
      if (!evt.detail.el.matches(data.collisionEntities)) { return }
      collisionEntities.push(evt.detail.el)
    }
    el.sceneEl.addEventListener('child-attached', this.childAttachHandler)

    // Update entity list on detach.
    this.childDetachHandler = function childDetachHandler (evt) {
      if (!evt.detail.el.matches(data.collisionEntities)) { return }
      const index = collisionEntities.indexOf(evt.detail.el)
      if (index === -1) { return }
      collisionEntities.splice(index, 1)
    }
    el.sceneEl.addEventListener('child-detached', this.childDetachHandler)
  },

  onButtonDown: function () {
    this.active = true
    this.redrawLine = true
  },

  /**
   * Jump!
   */
  onButtonUp: (function () {
    const newRigLocalPosition = new THREE.Vector3()
    const newHandPosition = [new THREE.Vector3(), new THREE.Vector3()] // Left and right
    const handPosition = new THREE.Vector3()

    return function (evt) {
      if (!this.active) { return }

      // Hide the hit point and the curve
      this.active = false
      this.hitEntity.setAttribute('visible', false)
      this.teleportEntity.setAttribute('visible', false)

      if (!this.hit) {
        // Button released but no hit point
        return
      }

      const rig = this.data.cameraRig || this.el.sceneEl.camera.el
      rig.object3D.getWorldPosition(this.rigWorldPosition)
      this.newRigWorldPosition.copy(this.hitPoint)

      // Finally update the rigs position
      newRigLocalPosition.copy(this.newRigWorldPosition)
      if (rig.object3D.parent) {
        rig.object3D.parent.worldToLocal(newRigLocalPosition)
      }
      rig.setAttribute('position', newRigLocalPosition)

      // Also take the headset/camera rotation itself into account
      if (this.data.rotateOnTeleport) {
        this.teleportOriginQuaternion
          .setFromEuler(new THREE.Euler(0, this.teleportOrigin.object3D.rotation.y, 0))
        this.teleportOriginQuaternion.invert()
        this.teleportOriginQuaternion.multiply(this.hitEntityQuaternion)
        // Rotate the rig based on calculated teleport origin rotation
        this.cameraRig.object3D.setRotationFromQuaternion(this.teleportOriginQuaternion)
      }

      // If a rig was not explicitly declared, look for hands and move them proportionally as well
      if (!this.data.cameraRig) {
        const hands = document.querySelectorAll('a-entity[tracked-controls]')
        for (let i = 0; i < hands.length; i++) {
          hands[i].object3D.getWorldPosition(handPosition)

          // diff = rigWorldPosition - handPosition
          // newPos = newRigWorldPosition - diff
          newHandPosition[i].copy(this.newRigWorldPosition).sub(this.rigWorldPosition).add(handPosition)
          hands[i].setAttribute('position', newHandPosition[i])
        }
      }

      this.el.emit('teleported', this.teleportEventDetail)
    }
  })(),

  /**
   * Check for raycaster intersection.
   *
   * @param {number} Line fragment point index.
   * @param {number} Last line fragment point index.
   * @param {number} Next line fragment point index.
   * @returns {boolean} true if there's an intersection.
   */
  checkMeshCollisions: function (i, last, next) {
    // @todo We should add a property to define if the collisionEntity is dynamic or static
    // If static we should do the map just once, otherwise we're recreating the array in every
    // loop when aiming.
    let meshes
    if (!this.data.collisionEntities) {
      meshes = this.defaultCollisionMeshes
    } else {
      meshes = this.collisionEntities.map(function (entity) {
        return entity.getObject3D('mesh')
      }).filter(function (n) { return n })
      meshes = meshes.length ? meshes : this.defaultCollisionMeshes
    }

    const intersects = this.raycaster.intersectObjects(meshes, true)
    if (intersects.length > 0 && !this.hit &&
        this.isValidNormalsAngle(intersects[0].face.normal, intersects[0].object)) {
      const point = intersects[0].point

      this.line.material.color.set(this.curveHitColor)
      this.line.material.opacity = this.data.hitOpacity
      this.line.material.transparent = this.data.hitOpacity < 1
      this.hitEntity.setAttribute('position', point)
      this.hitEntity.setAttribute('visible', true)

      this.hit = true
      this.hitPoint.copy(intersects[0].point)

      // If hit, just fill the rest of the points with the hit point and break the loop
      for (let j = i; j < this.line.numPoints; j++) {
        this.line.setPoint(j, last, this.hitPoint)
      }
      return true
    } else {
      this.line.setPoint(i, last, next)
      return false
    }
  },

  isValidNormalsAngle: function (collisionNormal, collisionObject) {
    this.collisionObjectNormalMatrix.getNormalMatrix(collisionObject.matrixWorld)
    this.collisionWorldNormal.copy(collisionNormal)
      .applyMatrix3(this.collisionObjectNormalMatrix).normalize()
    const angleNormals = this.referenceNormal.angleTo(this.collisionWorldNormal)
    return (THREE.Math.RAD2DEG * angleNormals <= this.data.landingMaxAngle)
  },

  // Utils
  // Parabolic motion equation, y = p0 + v0*t + 1/2at^2
  parabolicCurveScalar: function (p0, v0, a, t) {
    return p0 + v0 * t + 0.5 * a * t * t
  },

  // Parabolic motion equation applied to 3 dimensions
  parabolicCurve: function (p0, v0, a, t, out) {
    out.x = this.parabolicCurveScalar(p0.x, v0.x, a.x, t)
    out.y = this.parabolicCurveScalar(p0.y, v0.y, a.y, t)
    out.z = this.parabolicCurveScalar(p0.z, v0.z, a.z, t)
    return out
  },

  // To determine how long in terms of t we need to calculate
  parabolicCurveMaxRoot: function (p0, v0, a) {
    const root = (-v0.y - Math.sqrt(v0.y ** 2 - 4 * (0.5 * a.y) * p0.y)) / (2 * 0.5 * a.y)
    return root
  },

  createLine: function (data) {
    const numPoints = data.type === 'line' ? 2 : data.curveNumberPoints
    return new AFRAME.utils.RayCurve(numPoints, data.curveLineWidth)
  },

  /**
 * Create mesh to represent the area of intersection.
 * Default to a combination of torus and cylinder.
 */
  createHitEntity: function (data) {
    // Parent.
    const hitEntity = document.createElement('a-entity')
    hitEntity.className = 'hitEntity'

    // Torus.
    const torus = document.createElement('a-entity')
    torus.setAttribute('geometry', {
      primitive: 'torus',
      radius: data.hitCylinderRadius,
      radiusTubular: 0.01
    })
    torus.setAttribute('rotation', { x: 90, y: 0, z: 0 })
    torus.setAttribute('material', {
      shader: 'flat',
      color: data.hitCylinderColor,
      side: 'double',
      depthTest: false
    })
    hitEntity.appendChild(torus)

    // Cylinder.
    const cylinder = document.createElement('a-entity')
    cylinder.setAttribute('position', { x: 0, y: data.hitCylinderHeight / 2, z: 0 })
    cylinder.setAttribute('geometry', {
      primitive: 'cylinder',
      segmentsHeight: 1,
      radius: data.hitCylinderRadius,
      height: data.hitCylinderHeight,
      openEnded: true
    })
    cylinder.setAttribute('material', {
      shader: 'flat',
      color: data.hitCylinderColor,
      opacity: 0.5,
      side: 'double',
      src: this.cylinderTexture,
      transparent: true,
      depthTest: false
    })
    hitEntity.appendChild(cylinder)

    const pointer = document.createElement('a-entity')
    pointer.setAttribute('position', { x: 0, y: 0.05, z: data.hitCylinderRadius * -1.5 })
    pointer.setAttribute('rotation', { x: 90, y: 180, z: 0 })
    pointer.setAttribute('geometry', {
      primitive: 'prism',
      height: 0.2,
      width: 0.2,
      depth: 0.05
    })
    pointer.setAttribute('material', {
      shader: 'flat',
      color: data.hitCylinderColor,
      side: 'double',
      transparent: true,
      opacity: 0.6,
      depthTest: false
    })
    hitEntity.appendChild(pointer)

    return hitEntity
  },
  createDefaultPlane: function (size) {
    const geometry = new THREE.PlaneBufferGeometry(100, 100)
    geometry.rotateX(-Math.PI / 2)
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 })
    return new THREE.Mesh(geometry, material)
  },
  cylinderTexture: 'url(data:image/png;base64,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)'
})

AFRAME.utils.RayCurve = function (numPoints, width) {
  this.geometry = new THREE.BufferGeometry()
  this.vertices = new Float32Array(numPoints * 3 * 6) // 6 vertices (2 triangles) * 3 dimensions
  this.uvs = new Float32Array(numPoints * 2 * 6) // 2 uvs per vertex
  this.width = width

  this.geometry.setAttribute('position', new THREE.BufferAttribute(this.vertices, 3).setUsage(THREE.DynamicDrawUsage))

  this.material = new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
    color: 0xff0000
  })

  this.mesh = new THREE.Mesh(this.geometry, this.material)

  this.mesh.frustumCulled = false
  this.mesh.vertices = this.vertices

  this.direction = new THREE.Vector3()
  this.numPoints = numPoints
}

AFRAME.utils.RayCurve.prototype = {
  setDirection: function (direction) {
    const UP = new THREE.Vector3(0, 1, 0)
    this.direction
      .copy(direction)
      .cross(UP)
      .normalize()
      .multiplyScalar(this.width / 2)
  },

  setWidth: function (width) {
    this.width = width
  },

  setPoint: (function () {
    const posA = new THREE.Vector3()
    const posB = new THREE.Vector3()
    const posC = new THREE.Vector3()
    const posD = new THREE.Vector3()

    return function (i, last, next) {
      posA.copy(last).add(this.direction)
      posB.copy(last).sub(this.direction)

      posC.copy(next).add(this.direction)
      posD.copy(next).sub(this.direction)

      let idx = 6 * 3 * i // 6 vertices per point

      this.vertices[idx++] = posA.x
      this.vertices[idx++] = posA.y
      this.vertices[idx++] = posA.z

      this.vertices[idx++] = posB.x
      this.vertices[idx++] = posB.y
      this.vertices[idx++] = posB.z

      this.vertices[idx++] = posC.x
      this.vertices[idx++] = posC.y
      this.vertices[idx++] = posC.z

      this.vertices[idx++] = posC.x
      this.vertices[idx++] = posC.y
      this.vertices[idx++] = posC.z

      this.vertices[idx++] = posB.x
      this.vertices[idx++] = posB.y
      this.vertices[idx++] = posB.z

      this.vertices[idx++] = posD.x
      this.vertices[idx++] = posD.y
      this.vertices[idx++] = posD.z

      this.geometry.attributes.position.needsUpdate = true
    }
  })()
}

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

    this.el.addEventListener('teleport', evt => {
      console.log('teleport');
    });
  }
});

/***/ }),

/***/ "./src/components/disable-in-vr.js":
/*!*****************************************!*\
  !*** ./src/components/disable-in-vr.js ***!
  \*****************************************/
/***/ (() => {

AFRAME.registerComponent('disable-in-vr', {
  multiple: true,
  schema: {
    component: {type: 'string', default: ''},
  },
  init: function () {
    this.handler = () => this.disable();
    if (this.el.sceneEl.is('vr-mode')) this.handler();
    window.addEventListener('enter-vr', this.handler);
    // todo: re-enable the component when leaving VR
  },
  disable: function () {
    if (!this.el.sceneEl.is('vr-mode')) return;
    this.el.removeAttribute(this.data.component);
  },
  remove: function () {
    window.removeEventListener('enter-vr', this.handler);
  }
});


/***/ }),

/***/ "./src/components/emit-when-near.js":
/*!******************************************!*\
  !*** ./src/components/emit-when-near.js ***!
  \******************************************/
/***/ (() => {

AFRAME.registerComponent('emit-when-near', {
  multiple: true,
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
    this.onEnter = this.onEnter.bind(this);
    this.onLeave = this.onLeave.bind(this);
    this.el.addEventListener('mouseenter', this.onEnter);
    this.el.addEventListener('mouseleave', this.onLeave);
  },

  onEnter: function (evt) {
    const cursor = evt.detail.cursorEl;
    const isLaser = cursor.components['laser-controls'] ? true : false;

    if (isLaser) {
      this.savedColor = cursor.getAttribute('raycaster').lineColor;
      cursor.setAttribute('raycaster', 'lineColor',  this.data.color);
    } else {
      this.savedColor = cursor.getAttribute('material').color;
      cursor.setAttribute('material', 'color',  this.data.color);
    }
  },

  onLeave: function (evt) {
    const cursor = evt.detail.cursorEl;
    const isLaser = cursor.components['laser-controls'] ? true : false;

    if (isLaser) {
      cursor.setAttribute('raycaster', 'lineColor',  this.savedColor);
    } else {
      cursor.setAttribute('material', 'color',  this.savedColor);
    }
  },

  remove: function () {
    this.el.removeEventListener('mouseenter', this.onEnter);
    this.el.removeEventListener('mouseleave', this.onLeave);
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

// from AdaRoseCanon xr-boilerplate https://github.com/AdaRoseCannon/aframe-xr-boilerplate
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
        this.el.emit(this.data.evt1, {}, false);
        this.state = 1;
      } else {
        this.el.emit(this.data.evt2, {}, false);
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
	"./blink-controls.js": "./src/components/blink-controls.js",
	"./cursor-listener.js": "./src/components/cursor-listener.js",
	"./disable-in-vr.js": "./src/components/disable-in-vr.js",
	"./emit-when-near.js": "./src/components/emit-when-near.js",
	"./hover-highlighter.js": "./src/components/hover-highlighter.js",
	"./im-box.js": "./src/components/im-box.js",
	"./listen-to.js": "./src/components/listen-to.js",
	"./on-event-set.js": "./src/components/on-event-set.js",
	"./simple-navmesh-constraint.js": "./src/components/simple-navmesh-constraint.js",
	"./toggle-events.js": "./src/components/toggle-events.js",
	"components/a-ocean.js": "./src/components/a-ocean.js",
	"components/animate-rotation.js": "./src/components/animate-rotation.js",
	"components/blink-controls.js": "./src/components/blink-controls.js",
	"components/cursor-listener.js": "./src/components/cursor-listener.js",
	"components/disable-in-vr.js": "./src/components/disable-in-vr.js",
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsZUFBZTtBQUNmLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxvQkFBb0I7QUFDaEMsWUFBWSxvQkFBb0I7QUFDaEM7QUFDQTtBQUNBLGNBQWMsWUFBWTtBQUMxQjtBQUNBO0FBQ0EsZ0JBQWdCLGFBQWE7QUFDN0Isd0JBQXdCLGFBQWE7QUFDckM7QUFDQTtBQUNBLFlBQVksV0FBVztBQUN2QixvQkFBb0IsV0FBVztBQUMvQjtBQUNBO0FBQ0EsWUFBWSxrQ0FBa0M7QUFDOUMsY0FBYztBQUNkLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwrREFBK0QsT0FBTztBQUN0RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkJBQTJCLHVCQUF1QjtBQUNsRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOzs7Ozs7Ozs7O0FDN0ZEO0FBQ0E7QUFDQTtBQUNBLFlBQVksNEJBQTRCO0FBQ3hDLFVBQVU7QUFDVixHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7Ozs7Ozs7OztBQ2xCRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhLG9CQUFvQjtBQUNqQyxjQUFjLG9CQUFvQjtBQUNsQyxhQUFhO0FBQ2IsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYywyRUFBMkU7QUFDekY7QUFDQTtBQUNBLG1CQUFtQiw0QkFBNEI7QUFDL0M7QUFDQTtBQUNBLGlCQUFpQiw0QkFBNEI7QUFDN0MseUJBQXlCLGFBQWE7QUFDdEMsaUJBQWlCLGtCQUFrQjtBQUNuQyxpQkFBaUIsc0NBQXNDO0FBQ3ZELHNCQUFzQixzQ0FBc0M7QUFDNUQsd0JBQXdCLG1DQUFtQztBQUMzRCx5QkFBeUIsdUJBQXVCO0FBQ2hELHlCQUF5QixzQkFBc0I7QUFDL0MsZ0JBQWdCLFlBQVk7QUFDNUIseUJBQXlCLHFCQUFxQjtBQUM5QyxzQkFBc0IsZ0JBQWdCO0FBQ3RDLHFCQUFxQixtQ0FBbUM7QUFDeEQsc0JBQXNCLG1DQUFtQztBQUN6RCwwQkFBMEIscUJBQXFCO0FBQy9DLHdCQUF3QixjQUFjO0FBQ3RDLHFCQUFxQix5QkFBeUIsb0JBQW9CO0FBQ2xFLHVCQUF1QixpQ0FBaUM7QUFDeEQseUJBQXlCLGVBQWU7QUFDeEMseUJBQXlCLGNBQWM7QUFDdkMsbUJBQW1CLGNBQWM7QUFDakMsa0JBQWtCLGNBQWM7QUFDaEMsZ0JBQWdCLGVBQWU7QUFDL0Isd0JBQXdCO0FBQ3hCLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0Isa0NBQWtDO0FBQ3BEO0FBQ0E7QUFDQSxrQkFBa0IsZ0NBQWdDO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBLDRCQUE0QjtBQUM1QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVDQUF1QztBQUN2QyxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCLDBCQUEwQjtBQUMxQjtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBCQUEwQjtBQUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0ZBQW9GO0FBQ3BGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsbUJBQW1CO0FBQ3pDO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVEQUF1RDtBQUN2RDtBQUNBO0FBQ0E7QUFDQSw0Q0FBNEMseUJBQXlCO0FBQ3JFO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDREQUE0RDtBQUM1RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0REFBNEQ7QUFDNUQ7QUFDQSwwQkFBMEI7QUFDMUI7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMEJBQTBCO0FBQzFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0Isa0JBQWtCO0FBQzFDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhLFFBQVE7QUFDckIsYUFBYSxRQUFRO0FBQ3JCLGFBQWEsUUFBUTtBQUNyQixlQUFlLFNBQVM7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0EsT0FBTyx3QkFBd0IsVUFBVTtBQUN6QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IseUJBQXlCO0FBQy9DO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLHFDQUFxQyxtQkFBbUI7QUFDeEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdDQUF3QywyQ0FBMkM7QUFDbkY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsdUNBQXVDLGlEQUFpRDtBQUN4Rix1Q0FBdUMscUJBQXFCO0FBQzVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLG1EQUFtRCxpQkFBaUI7QUFDcEU7QUFDQSxHQUFHO0FBQ0gsdUNBQXVDO0FBQ3ZDLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7Ozs7Ozs7Ozs7QUM3cEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLENBQUM7Ozs7Ozs7Ozs7QUNWRDtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsNEJBQTRCO0FBQzVDLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxDQUFDOzs7Ozs7Ozs7OztBQ2xCRDtBQUNBO0FBQ0E7QUFDQSxhQUFhLHlDQUF5QztBQUN0RCxlQUFlLDJCQUEyQjtBQUMxQyxZQUFZLGlDQUFpQztBQUM3QyxlQUFlLG1DQUFtQztBQUNsRCxlQUFlLDZCQUE2QjtBQUM1QyxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFDQUFxQyxrQ0FBa0M7QUFDdkUsOENBQThDLHlCQUF5QjtBQUN2RSxNQUFNO0FBQ047QUFDQSx3Q0FBd0Msa0NBQWtDO0FBQzFFLGlEQUFpRCx5QkFBeUI7QUFDMUU7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7Ozs7Ozs7Ozs7QUMvQkQ7QUFDQTtBQUNBLFlBQVk7QUFDWixHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7Ozs7Ozs7Ozs7QUN4Q0Q7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFdBQVcsMkJBQTJCO0FBQ3RDLFlBQVk7QUFDWixHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOzs7Ozs7Ozs7OztBQ3pFRDtBQUNBO0FBQ0E7QUFDQSxVQUFVLGlDQUFpQztBQUMzQyxhQUFhLGlCQUFpQjtBQUM5QixXQUFXO0FBQ1gsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLENBQUM7Ozs7Ozs7Ozs7QUNaRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksaUNBQWlDO0FBQzdDLGdCQUFnQixlQUFlO0FBQy9CLFlBQVk7QUFDWixHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOzs7Ozs7Ozs7O0FDdEJEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0gsQ0FBQzs7Ozs7Ozs7Ozs7QUM1RkQ7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLGlDQUFpQztBQUNqRCxXQUFXLGVBQWU7QUFDMUIsV0FBVztBQUNYLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVDQUF1QztBQUN2QztBQUNBLFFBQVE7QUFDUix1Q0FBdUM7QUFDdkM7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLENBQUM7Ozs7Ozs7Ozs7QUNuQkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7VUM3Q0E7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7Ozs7Ozs7Ozs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVSxtREFBK0MsRSIsInNvdXJjZXMiOlsid2VicGFjazovL2FmcmFtZS13ZWJwYWNrLWJvaWxlcnBsYXRlLy4vc3JjL2NvbXBvbmVudHMvYS1vY2Vhbi5qcyIsIndlYnBhY2s6Ly9hZnJhbWUtd2VicGFjay1ib2lsZXJwbGF0ZS8uL3NyYy9jb21wb25lbnRzL2FuaW1hdGUtcm90YXRpb24uanMiLCJ3ZWJwYWNrOi8vYWZyYW1lLXdlYnBhY2stYm9pbGVycGxhdGUvLi9zcmMvY29tcG9uZW50cy9ibGluay1jb250cm9scy5qcyIsIndlYnBhY2s6Ly9hZnJhbWUtd2VicGFjay1ib2lsZXJwbGF0ZS8uL3NyYy9jb21wb25lbnRzL2N1cnNvci1saXN0ZW5lci5qcyIsIndlYnBhY2s6Ly9hZnJhbWUtd2VicGFjay1ib2lsZXJwbGF0ZS8uL3NyYy9jb21wb25lbnRzL2Rpc2FibGUtaW4tdnIuanMiLCJ3ZWJwYWNrOi8vYWZyYW1lLXdlYnBhY2stYm9pbGVycGxhdGUvLi9zcmMvY29tcG9uZW50cy9lbWl0LXdoZW4tbmVhci5qcyIsIndlYnBhY2s6Ly9hZnJhbWUtd2VicGFjay1ib2lsZXJwbGF0ZS8uL3NyYy9jb21wb25lbnRzL2hvdmVyLWhpZ2hsaWdodGVyLmpzIiwid2VicGFjazovL2FmcmFtZS13ZWJwYWNrLWJvaWxlcnBsYXRlLy4vc3JjL2NvbXBvbmVudHMvaW0tYm94LmpzIiwid2VicGFjazovL2FmcmFtZS13ZWJwYWNrLWJvaWxlcnBsYXRlLy4vc3JjL2NvbXBvbmVudHMvbGlzdGVuLXRvLmpzIiwid2VicGFjazovL2FmcmFtZS13ZWJwYWNrLWJvaWxlcnBsYXRlLy4vc3JjL2NvbXBvbmVudHMvb24tZXZlbnQtc2V0LmpzIiwid2VicGFjazovL2FmcmFtZS13ZWJwYWNrLWJvaWxlcnBsYXRlLy4vc3JjL2NvbXBvbmVudHMvc2ltcGxlLW5hdm1lc2gtY29uc3RyYWludC5qcyIsIndlYnBhY2s6Ly9hZnJhbWUtd2VicGFjay1ib2lsZXJwbGF0ZS8uL3NyYy9jb21wb25lbnRzL3RvZ2dsZS1ldmVudHMuanMiLCJ3ZWJwYWNrOi8vYWZyYW1lLXdlYnBhY2stYm9pbGVycGxhdGUvLi9zcmMvY29tcG9uZW50c3xzeW5jfG5vbnJlY3Vyc2l2ZXwvLmpzJCIsIndlYnBhY2s6Ly9hZnJhbWUtd2VicGFjay1ib2lsZXJwbGF0ZS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9hZnJhbWUtd2VicGFjay1ib2lsZXJwbGF0ZS93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2FmcmFtZS13ZWJwYWNrLWJvaWxlcnBsYXRlLy4vc3JjL21haW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiQUZSQU1FLnJlZ2lzdGVyUHJpbWl0aXZlKCdhLW9jZWFuJywge1xyXG4gIGRlZmF1bHRDb21wb25lbnRzOiB7XHJcbiAgICBvY2Vhbjoge30sXHJcbiAgICByb3RhdGlvbjoge3g6IC05MCwgeTogMCwgejogMH1cclxuICB9LFxyXG4gIG1hcHBpbmdzOiB7XHJcbiAgICB3aWR0aDogJ29jZWFuLndpZHRoJyxcclxuICAgIGRlcHRoOiAnb2NlYW4uZGVwdGgnLFxyXG4gICAgZGVuc2l0eTogJ29jZWFuLmRlbnNpdHknLFxyXG4gICAgYW1wbGl0dWRlOiAnb2NlYW4uYW1wbGl0dWRlJyxcclxuICAgIGFtcGxpdHVkZVZhcmlhbmNlOiAnb2NlYW4uYW1wbGl0dWRlVmFyaWFuY2UnLFxyXG4gICAgc3BlZWQ6ICdvY2Vhbi5zcGVlZCcsXHJcbiAgICBzcGVlZFZhcmlhbmNlOiAnb2NlYW4uc3BlZWRWYXJpYW5jZScsXHJcbiAgICBjb2xvcjogJ29jZWFuLmNvbG9yJyxcclxuICAgIG9wYWNpdHk6ICdvY2Vhbi5vcGFjaXR5J1xyXG4gIH1cclxufSk7XHJcblxyXG5BRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ29jZWFuJywge1xyXG4gIHNjaGVtYToge1xyXG4gICAgLy8gRGltZW5zaW9ucyBvZiB0aGUgb2NlYW4gYXJlYS5cclxuICAgIHdpZHRoOiB7ZGVmYXVsdDogMTAsIG1pbjogMH0sXHJcbiAgICBkZXB0aDoge2RlZmF1bHQ6IDEwLCBtaW46IDB9LFxyXG5cclxuICAgIC8vIERlbnNpdHkgb2Ygd2F2ZXMuXHJcbiAgICBkZW5zaXR5OiB7ZGVmYXVsdDogMTB9LFxyXG5cclxuICAgIC8vIFdhdmUgYW1wbGl0dWRlIGFuZCB2YXJpYW5jZS5cclxuICAgIGFtcGxpdHVkZToge2RlZmF1bHQ6IDAuMX0sXHJcbiAgICBhbXBsaXR1ZGVWYXJpYW5jZToge2RlZmF1bHQ6IDAuM30sXHJcblxyXG4gICAgLy8gV2F2ZSBzcGVlZCBhbmQgdmFyaWFuY2UuXHJcbiAgICBzcGVlZDoge2RlZmF1bHQ6IDF9LFxyXG4gICAgc3BlZWRWYXJpYW5jZToge2RlZmF1bHQ6IDJ9LFxyXG5cclxuICAgIC8vIE1hdGVyaWFsLlxyXG4gICAgY29sb3I6IHtkZWZhdWx0OiAnIzdBRDJGNycsIHR5cGU6ICdjb2xvcid9LFxyXG4gICAgb3BhY2l0eToge2RlZmF1bHQ6IDAuOH1cclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBVc2UgcGxheSgpIGluc3RlYWQgb2YgaW5pdCgpLCBiZWNhdXNlIGNvbXBvbmVudCBtYXBwaW5ncyDigJMgdW5hdmFpbGFibGUgYXMgZGVwZW5kZW5jaWVzIOKAkyBhcmVcclxuICAgKiBub3QgZ3VhcmFudGVlZCB0byBoYXZlIHBhcnNlZCB3aGVuIHRoaXMgY29tcG9uZW50IGlzIGluaXRpYWxpemVkLlxyXG4gICAqL1xyXG4gIHBsYXk6IGZ1bmN0aW9uICgpIHtcclxuICAgIGNvbnNvbGUubG9nKCdwJyk7XHJcbiAgICBjb25zdCBlbCA9IHRoaXMuZWwsXHJcbiAgICAgICAgZGF0YSA9IHRoaXMuZGF0YTtcclxuICAgIGxldCBtYXRlcmlhbCA9IGVsLmNvbXBvbmVudHMubWF0ZXJpYWw7XHJcblxyXG4gICAgbGV0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoZGF0YS53aWR0aCwgZGF0YS5kZXB0aCwgZGF0YS5kZW5zaXR5LCBkYXRhLmRlbnNpdHkpO1xyXG4gICAgZ2VvbWV0cnkgPSBUSFJFRS5CdWZmZXJHZW9tZXRyeVV0aWxzLm1lcmdlVmVydGljZXMoZ2VvbWV0cnkpO1xyXG4gICAgdGhpcy53YXZlcyA9IFtdO1xyXG5cclxuICAgIGZvciAobGV0IHYsIGkgPSAwLCBsID0gZ2VvbWV0cnkuYXR0cmlidXRlcy5wb3NpdGlvbi5jb3VudDsgaSA8IGw7IGkrKykge1xyXG4gICAgICB2ID0gZ2VvbWV0cnkuYXR0cmlidXRlcy5wb3NpdGlvbjtcclxuICAgICAgdGhpcy53YXZlcy5wdXNoKHtcclxuICAgICAgICB6OiB2LmdldFooaSksXHJcbiAgICAgICAgYW5nOiBNYXRoLnJhbmRvbSgpICogTWF0aC5QSSAqIDIsXHJcbiAgICAgICAgYW1wOiBkYXRhLmFtcGxpdHVkZSArIE1hdGgucmFuZG9tKCkgKiBkYXRhLmFtcGxpdHVkZVZhcmlhbmNlLFxyXG4gICAgICAgIHNwZWVkOiAoZGF0YS5zcGVlZCArIE1hdGgucmFuZG9tKCkgKiBkYXRhLnNwZWVkVmFyaWFuY2UpIC8gMTAwMCAvLyByYWRpYW5zIC8gZnJhbWVcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFtYXRlcmlhbCkge1xyXG4gICAgICBtYXRlcmlhbCA9IHt9O1xyXG4gICAgICBtYXRlcmlhbC5tYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XHJcbiAgICAgICAgY29sb3I6IGRhdGEuY29sb3IsXHJcbiAgICAgICAgdHJhbnNwYXJlbnQ6IGRhdGEub3BhY2l0eSA8IDEsXHJcbiAgICAgICAgb3BhY2l0eTogZGF0YS5vcGFjaXR5LFxyXG4gICAgICAgIGZsYXRTaGFkaW5nOiB0cnVlXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbC5tYXRlcmlhbCk7XHJcbiAgICBlbC5zZXRPYmplY3QzRCgnbWVzaCcsIHRoaXMubWVzaCk7XHJcbiAgfSxcclxuXHJcbiAgcmVtb3ZlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLmVsLnJlbW92ZU9iamVjdDNEKCdtZXNoJyk7XHJcbiAgfSxcclxuXHJcbiAgdGljazogZnVuY3Rpb24gKHQsIGR0KSB7XHJcbiAgICBpZiAoIWR0KSByZXR1cm47XHJcblxyXG4gICAgY29uc3QgdmVydHMgPSB0aGlzLm1lc2guZ2VvbWV0cnkuYXR0cmlidXRlcy5wb3NpdGlvbi5hcnJheTtcclxuICAgIGZvciAobGV0IGkgPSAwLCBqID0gMjsgaSA8IHRoaXMud2F2ZXMubGVuZ3RoOyBpKyssIGogPSBqICsgMykge1xyXG4gICAgICBjb25zdCB2cHJvcHMgPSB0aGlzLndhdmVzW2ldO1xyXG4gICAgICB2ZXJ0c1tqXSA9IHZwcm9wcy56ICsgTWF0aC5zaW4odnByb3BzLmFuZykgKiB2cHJvcHMuYW1wO1xyXG4gICAgICB2cHJvcHMuYW5nICs9IHZwcm9wcy5zcGVlZCAqIGR0O1xyXG4gICAgfVxyXG4gICAgdGhpcy5tZXNoLmdlb21ldHJ5LmF0dHJpYnV0ZXMucG9zaXRpb24ubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gIH1cclxufSk7IiwiQUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KCdhbmltYXRlLXJvdGF0aW9uJywge1xyXG4gIG11bHRpcGxlOiB0cnVlLFxyXG4gIHNjaGVtYToge1xyXG4gICAgc3BlZWQ6IHt0eXBlOiAnbnVtYmVyJywgZGVmYXVsdDogMTB9LFxyXG4gICAgYXhlOiB7dHlwZTogJ3N0cmluZycsIGRlZmF1bHQ6ICd4J31cclxuICB9LFxyXG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgfSxcclxuICByZW1vdmU6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgfSxcclxuICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgfSxcclxuICB0aWNrOiBmdW5jdGlvbiAoZWxhcHNlZCwgZHQpIHtcclxuICAgIHRoaXMuZWwub2JqZWN0M0Qucm90YXRpb25bdGhpcy5kYXRhLmF4ZV0gPSBUSFJFRS5NYXRoVXRpbHMuZGVnVG9SYWQoZWxhcHNlZCAvIHRoaXMuZGF0YS5zcGVlZCk7XHJcbiAgfVxyXG59KSIsIi8qIGdsb2JhbCBUSFJFRSwgQUZSQU1FICAqL1xyXG4vLyBhZnJhbWUtYmxpbmstY29udHJvbHMgaHR0cHM6Ly9naXRodWIuY29tL2p1cmUvYWZyYW1lLWJsaW5rLWNvbnRyb2xzXHJcbi8vIEFkYXB0ZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vZmVybmFuZG9qc2cvYWZyYW1lLXRlbGVwb3J0LWNvbnRyb2xzXHJcbi8vIEFkZGl0aW9uczogVGVsZXBvcnQgcm90YXRpb24sIHBhcmFib2xpYyByb290IGNhbGN1bGF0aW9uLCBiaW5kaW5ncywgZml4IGZvciB0cmlhbmdsZSBzdHJpcCBkcmF3IG1vZGVcclxuLy8gUmVtb3ZhbHM6IExpbmUgdGVsZXBvcnRcclxuLy8gV0FSTklORzogU3VwZXIgZWFybHkhIEN1cnJlbnRseSBvbmx5IHRlc3RlZCB3aXRoIE9jdWx1cyBUb3VjaCBjb250cm9sbGVyc1xyXG5cclxuQUZSQU1FLnJlZ2lzdGVyR2VvbWV0cnkoJ3ByaXNtJywge1xyXG4gIHNjaGVtYToge1xyXG4gICAgZGVwdGg6IHsgZGVmYXVsdDogMSwgbWluOiAwIH0sXHJcbiAgICBoZWlnaHQ6IHsgZGVmYXVsdDogMSwgbWluOiAwIH0sXHJcbiAgICB3aWR0aDogeyBkZWZhdWx0OiAxLCBtaW46IDAgfVxyXG4gIH0sXHJcblxyXG4gIGluaXQ6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICBjb25zdCBzaGFwZSA9IG5ldyBUSFJFRS5TaGFwZSgpXHJcbiAgICBzaGFwZS5tb3ZlVG8oZGF0YS53aWR0aCAvIDIsIDApXHJcbiAgICBzaGFwZS5saW5lVG8oMCwgZGF0YS5oZWlnaHQpXHJcbiAgICBzaGFwZS5saW5lVG8oLWRhdGEud2lkdGggLyAyLCAwKVxyXG4gICAgc2hhcGUubGluZVRvKGRhdGEud2lkdGggLyAyLCAwKVxyXG5cclxuICAgIGNvbnN0IGV4dHJ1ZGVTZXR0aW5ncyA9IHtcclxuICAgICAgc3RlcHM6IDIsXHJcbiAgICAgIGRlcHRoOiBkYXRhLmRlcHRoLFxyXG4gICAgICBiZXZlbEVuYWJsZWQ6IGZhbHNlXHJcbiAgICB9XHJcbiAgICB0aGlzLmdlb21ldHJ5ID0gbmV3IFRIUkVFLkV4dHJ1ZGVHZW9tZXRyeShzaGFwZSwgZXh0cnVkZVNldHRpbmdzKVxyXG4gIH1cclxufSlcclxuXHJcbi8vIFdJUDogQ29udHJvbGxlciBiaW5kaW5ncyBjaGVhdCBzaGVldFxyXG4vLyBGb3IgSFRDIFZpdmU6IHRyYWNrcGFkZG93biBhbmQgdHJhY2twYWR1cCB3aXRoIGF4aXNtb3ZlXHJcbi8vIEZvciBPY3VsdXMgVG91Y2g6IHRodW1ic3RpY2tkb3duIGFuZCB0aHVtYnN0aWNrdXAsIHdpdGggdGh1bWJzdGljayBldmVudCBhbmQgZXZ0LmRldGFpbC55IGFuZCBldnQuZGV0YWlsLnhcclxuLy8gRm9yIFZhbHZlIEluZGV4IChtYXliZSk6IHRvdWNoc3RhcnQsIHRvdWNoZW5kLCBheGlzbW92ZT9cclxuXHJcbmlmICh0eXBlb2YgQUZSQU1FID09PSAndW5kZWZpbmVkJykge1xyXG4gIHRocm93IG5ldyBFcnJvcignQ29tcG9uZW50IGF0dGVtcHRlZCB0byByZWdpc3RlciBiZWZvcmUgQUZSQU1FIHdhcyBhdmFpbGFibGUuJylcclxufVxyXG5cclxuQUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KCdibGluay1jb250cm9scycsIHtcclxuICBzY2hlbWE6IHtcclxuICAgIC8vIEJ1dHRvbiBpcyBhIHNpbXBsaWZpZWQgc3RhcnRFdmVudHMgJiBlbmRFdmVudHMgc3BlY2lmaWNhdGlvbiwgZS5nLlxyXG4gICAgLy8gJ3RodW1ic3RpY2snIGJpbmRzICd0aHVtYnN0aWNrZG93bicgYW5kICd0aHVtYnN0aWNrdXAnIHJlc3BlY3RpdmVseVxyXG4gICAgYnV0dG9uOiB7IGRlZmF1bHQ6ICcnLCBvbmVPZjogWyd0cmFja3BhZCcsICd0cmlnZ2VyJywgJ2dyaXAnLCAnbWVudScsICd0aHVtYnN0aWNrJ10gfSxcclxuICAgIC8vIFRoZSBkZWZhdWx0IHRlbGVwb3J0IGFjdGl2YXRpb24gaXMgYSBmb3J3YXJkIHRodW1ic3RpY2sgYXhpcyxcclxuICAgIC8vIGJ1dCB0aGlzIGNhbiBiZSBjaGFuZ2VkIHdpdGggc3RhcnRFdmVudHMuXHJcbiAgICBzdGFydEV2ZW50czogeyB0eXBlOiAnYXJyYXknLCBkZWZhdWx0OiBbXSB9LFxyXG4gICAgLy8gVGhlIGRlZmF1bHQgdGVsZXBvcnQgZGUtYWN0aXZhdGlvbiBpcyBhIGNlbnRlcmVkIHRodW1ic3RpY2sgYXhpcyxcclxuICAgIC8vIGJ1dCB0aGlzIGNhbiBiZSBjaGFuZ2VkIHdpdGggZW5kRXZlbnRzLlxyXG4gICAgZW5kRXZlbnRzOiB7IHR5cGU6ICdhcnJheScsIGRlZmF1bHQ6IFtdIH0sXHJcbiAgICBjb2xsaXNpb25FbnRpdGllczogeyBkZWZhdWx0OiAnJyB9LFxyXG4gICAgaGl0RW50aXR5OiB7IHR5cGU6ICdzZWxlY3RvcicgfSxcclxuICAgIGNhbWVyYVJpZzogeyB0eXBlOiAnc2VsZWN0b3InLCBkZWZhdWx0OiAnI3BsYXllcicgfSxcclxuICAgIHRlbGVwb3J0T3JpZ2luOiB7IHR5cGU6ICdzZWxlY3RvcicsIGRlZmF1bHQ6ICcjY2FtZXJhJyB9LFxyXG4gICAgaGl0Q3lsaW5kZXJDb2xvcjogeyB0eXBlOiAnY29sb3InLCBkZWZhdWx0OiAnIzRkOTNmZCcgfSxcclxuICAgIGhpdEN5bGluZGVyUmFkaXVzOiB7IGRlZmF1bHQ6IDAuMjUsIG1pbjogMCB9LFxyXG4gICAgaGl0Q3lsaW5kZXJIZWlnaHQ6IHsgZGVmYXVsdDogMC4zLCBtaW46IDAgfSxcclxuICAgIGludGVydmFsOiB7IGRlZmF1bHQ6IDAgfSxcclxuICAgIGN1cnZlTnVtYmVyUG9pbnRzOiB7IGRlZmF1bHQ6IDYwLCBtaW46IDIgfSxcclxuICAgIGN1cnZlTGluZVdpZHRoOiB7IGRlZmF1bHQ6IDAuMDI1IH0sXHJcbiAgICBjdXJ2ZUhpdENvbG9yOiB7IHR5cGU6ICdjb2xvcicsIGRlZmF1bHQ6ICcjNGQ5M2ZkJyB9LFxyXG4gICAgY3VydmVNaXNzQ29sb3I6IHsgdHlwZTogJ2NvbG9yJywgZGVmYXVsdDogJyNmZjAwMDAnIH0sXHJcbiAgICBjdXJ2ZVNob290aW5nU3BlZWQ6IHsgZGVmYXVsdDogMTAsIG1pbjogMCB9LFxyXG4gICAgZGVmYXVsdFBsYW5lU2l6ZTogeyBkZWZhdWx0OiAxMDAgfSxcclxuICAgIGxhbmRpbmdOb3JtYWw6IHsgdHlwZTogJ3ZlYzMnLCBkZWZhdWx0OiB7IHg6IDAsIHk6IDEsIHo6IDAgfSB9LFxyXG4gICAgbGFuZGluZ01heEFuZ2xlOiB7IGRlZmF1bHQ6ICc0NScsIG1pbjogMCwgbWF4OiAzNjAgfSxcclxuICAgIGRyYXdJbmNyZW1lbnRhbGx5OiB7IGRlZmF1bHQ6IHRydWUgfSxcclxuICAgIGluY3JlbWVudGFsRHJhd01zOiB7IGRlZmF1bHQ6IDMwMCB9LFxyXG4gICAgbWlzc09wYWNpdHk6IHsgZGVmYXVsdDogMC44IH0sXHJcbiAgICBoaXRPcGFjaXR5OiB7IGRlZmF1bHQ6IDAuOCB9LFxyXG4gICAgc25hcFR1cm46IHsgZGVmYXVsdDogdHJ1ZSB9LFxyXG4gICAgcm90YXRlT25UZWxlcG9ydDogeyBkZWZhdWx0OiB0cnVlIH1cclxuICB9LFxyXG5cclxuICBpbml0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICBjb25zdCBkYXRhID0gdGhpcy5kYXRhXHJcbiAgICBjb25zdCBlbCA9IHRoaXMuZWxcclxuICAgIGxldCBpXHJcblxyXG4gICAgdGhpcy5hY3RpdmUgPSBmYWxzZVxyXG4gICAgdGhpcy5vYmogPSBlbC5vYmplY3QzRFxyXG4gICAgdGhpcy5jb250cm9sbGVyUG9zaXRpb24gPSBuZXcgVEhSRUUuVmVjdG9yMygpXHJcbiAgICB0aGlzLmhpdEVudGl0eVF1YXRlcm5pb24gPSBuZXcgVEhSRUUuUXVhdGVybmlvbigpXHJcbiAgICAvLyB0ZWxlcG9ydE9yaWdpbiBpcyBoZWFkc2V0L2NhbWVyYSB3aXRoIGxvb2stY29udHJvbHNcclxuICAgIHRoaXMudGVsZXBvcnRPcmlnaW5RdWF0ZXJuaW9uID0gbmV3IFRIUkVFLlF1YXRlcm5pb24oKVxyXG4gICAgdGhpcy5oaXRQb2ludCA9IG5ldyBUSFJFRS5WZWN0b3IzKClcclxuICAgIHRoaXMuY29sbGlzaW9uT2JqZWN0Tm9ybWFsTWF0cml4ID0gbmV3IFRIUkVFLk1hdHJpeDMoKVxyXG4gICAgdGhpcy5jb2xsaXNpb25Xb3JsZE5vcm1hbCA9IG5ldyBUSFJFRS5WZWN0b3IzKClcclxuICAgIHRoaXMucmlnV29ybGRQb3NpdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKClcclxuICAgIHRoaXMubmV3UmlnV29ybGRQb3NpdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKClcclxuICAgIHRoaXMudGVsZXBvcnRFdmVudERldGFpbCA9IHtcclxuICAgICAgb2xkUG9zaXRpb246IHRoaXMucmlnV29ybGRQb3NpdGlvbixcclxuICAgICAgbmV3UG9zaXRpb246IHRoaXMubmV3UmlnV29ybGRQb3NpdGlvbixcclxuICAgICAgaGl0UG9pbnQ6IHRoaXMuaGl0UG9pbnQsXHJcbiAgICAgIHJvdGF0aW9uUXVhdGVybmlvbjogdGhpcy5oaXRFbnRpdHlRdWF0ZXJuaW9uXHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5oaXQgPSBmYWxzZVxyXG4gICAgdGhpcy5wcmV2Q2hlY2tUaW1lID0gdW5kZWZpbmVkXHJcbiAgICB0aGlzLnJlZmVyZW5jZU5vcm1hbCA9IG5ldyBUSFJFRS5WZWN0b3IzKClcclxuICAgIHRoaXMuY3VydmVNaXNzQ29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoKVxyXG4gICAgdGhpcy5jdXJ2ZUhpdENvbG9yID0gbmV3IFRIUkVFLkNvbG9yKClcclxuICAgIHRoaXMucmF5Y2FzdGVyID0gbmV3IFRIUkVFLlJheWNhc3RlcigpXHJcblxyXG4gICAgdGhpcy5kZWZhdWx0UGxhbmUgPSB0aGlzLmNyZWF0ZURlZmF1bHRQbGFuZSh0aGlzLmRhdGEuZGVmYXVsdFBsYW5lU2l6ZSlcclxuICAgIHRoaXMuZGVmYXVsdENvbGxpc2lvbk1lc2hlcyA9IFt0aGlzLmRlZmF1bHRQbGFuZV1cclxuXHJcbiAgICBjb25zdCB0ZWxlcG9ydEVudGl0eSA9IHRoaXMudGVsZXBvcnRFbnRpdHkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhLWVudGl0eScpXHJcbiAgICB0ZWxlcG9ydEVudGl0eS5jbGFzc0xpc3QuYWRkKCd0ZWxlcG9ydFJheScpXHJcbiAgICB0ZWxlcG9ydEVudGl0eS5zZXRBdHRyaWJ1dGUoJ3Zpc2libGUnLCBmYWxzZSlcclxuICAgIGVsLnNjZW5lRWwuYXBwZW5kQ2hpbGQodGhpcy50ZWxlcG9ydEVudGl0eSlcclxuXHJcbiAgICB0aGlzLm9uQnV0dG9uRG93biA9IHRoaXMub25CdXR0b25Eb3duLmJpbmQodGhpcylcclxuICAgIHRoaXMub25CdXR0b25VcCA9IHRoaXMub25CdXR0b25VcC5iaW5kKHRoaXMpXHJcbiAgICB0aGlzLmhhbmRsZVRodW1ic3RpY2tBeGlzID0gdGhpcy5oYW5kbGVUaHVtYnN0aWNrQXhpcy5iaW5kKHRoaXMpXHJcblxyXG4gICAgdGhpcy50ZWxlcG9ydE9yaWdpbiA9IHRoaXMuZGF0YS50ZWxlcG9ydE9yaWdpblxyXG4gICAgdGhpcy5jYW1lcmFSaWcgPSB0aGlzLmRhdGEuY2FtZXJhUmlnXHJcblxyXG4gICAgdGhpcy5zbmFwdHVyblJvdGF0aW9uID0gVEhSRUUuTWF0aFV0aWxzLmRlZ1RvUmFkKDQ1KVxyXG4gICAgdGhpcy5jYW5TbmFwdHVybiA9IHRydWVcclxuXHJcbiAgICAvLyBBcmUgc3RhcnRFdmVudHMgYW5kIGVuZEV2ZW50cyBzcGVjaWZpZWQ/XHJcbiAgICBpZiAodGhpcy5kYXRhLnN0YXJ0RXZlbnRzLmxlbmd0aCAmJiB0aGlzLmRhdGEuZW5kRXZlbnRzLmxlbmd0aCkge1xyXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5kYXRhLnN0YXJ0RXZlbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcih0aGlzLmRhdGEuc3RhcnRFdmVudHNbaV0sIHRoaXMub25CdXR0b25Eb3duKVxyXG4gICAgICB9XHJcbiAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLmRhdGEuZW5kRXZlbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcih0aGlzLmRhdGEuZW5kRXZlbnRzW2ldLCB0aGlzLm9uQnV0dG9uVXApXHJcbiAgICAgIH1cclxuICAgIC8vIElzIGEgYnV0dG9uIGZvciBhY3RpdmF0aW9uIHNwZWNpZmllZD9cclxuICAgIH0gZWxzZSBpZiAoZGF0YS5idXR0b24pIHtcclxuICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihkYXRhLmJ1dHRvbiArICdkb3duJywgdGhpcy5vbkJ1dHRvbkRvd24pXHJcbiAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoZGF0YS5idXR0b24gKyAndXAnLCB0aGlzLm9uQnV0dG9uVXApXHJcbiAgICAvLyBJZiBub25lIG9mIHRoZSBhYm92ZSwgZGVmYXVsdCB0byB0aHVtYnN0aWNrLWF4aXMgYmFzZWQgYWN0aXZhdGlvblxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy50aHVtYnN0aWNrQXhpc0FjdGl2YXRpb24gPSB0cnVlXHJcbiAgICB9XHJcblxyXG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcigndGh1bWJzdGlja21vdmVkJywgdGhpcy5oYW5kbGVUaHVtYnN0aWNrQXhpcylcclxuICAgIHRoaXMucXVlcnlDb2xsaXNpb25FbnRpdGllcygpXHJcbiAgfSxcclxuICBoYW5kbGVTbmFwdHVybjogZnVuY3Rpb24gKHJvdGF0aW9uLCBzdHJlbmd0aCkge1xyXG4gICAgaWYgKHN0cmVuZ3RoIDwgMC41MCkgdGhpcy5jYW5TbmFwdHVybiA9IHRydWVcclxuICAgIGlmICghdGhpcy5jYW5TbmFwdHVybikgcmV0dXJuXHJcbiAgICAvLyBPbmx5IGRvIHNuYXB0dXJucyBpZiBheGlzIGlzIHZlcnkgcHJvbWluZW50ICh1c2VyIGludGVudCBpcyBjbGVhcilcclxuICAgIC8vIEFuZCBwcmV2ZW4gZnVydGhlciBzbmFwdHVybnMgdW50aWwgYXhpcyByZXR1cm5zIHRvIChjbG9zZSBlbm91Z2ggdG8pIDBcclxuICAgIGlmIChzdHJlbmd0aCA+IDAuOTUpIHtcclxuICAgICAgaWYgKE1hdGguYWJzKHJvdGF0aW9uIC0gTWF0aC5QSSAvIDIuMCkgPCAwLjYpIHtcclxuICAgICAgICB0aGlzLmNhbWVyYVJpZy5vYmplY3QzRC5yb3RhdGVZKCt0aGlzLnNuYXB0dXJuUm90YXRpb24pXHJcbiAgICAgICAgdGhpcy5jYW5TbmFwdHVybiA9IGZhbHNlXHJcbiAgICAgIH0gZWxzZSBpZiAoTWF0aC5hYnMocm90YXRpb24gLSAxLjUgKiBNYXRoLlBJKSA8IDAuNikge1xyXG4gICAgICAgIHRoaXMuY2FtZXJhUmlnLm9iamVjdDNELnJvdGF0ZVkoLXRoaXMuc25hcHR1cm5Sb3RhdGlvbilcclxuICAgICAgICB0aGlzLmNhblNuYXB0dXJuID0gZmFsc2VcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8gaWYgKHJvdGF0aW9uICkge1xyXG4gICAgLy8gICB0aGlzLmNhbWVyYVJpZy5vYmplY3QzRC5yb3RhdGVZKC1NYXRoLnNpZ24oeCkgKiB0aGlzLnNuYXB0dXJuUm90YXRpb24pXHJcbiAgICAvLyAgIHRoaXMuY2FuU25hcHR1cm4gPSBmYWxzZVxyXG4gICAgLy8gfVxyXG4gIH0sXHJcbiAgaGFuZGxlVGh1bWJzdGlja0F4aXM6IGZ1bmN0aW9uIChldnQpIHtcclxuICAgIGlmIChldnQuZGV0YWlsLnggIT09IHVuZGVmaW5lZCAmJiBldnQuZGV0YWlsLnkgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICBjb25zdCByb3RhdGlvbiA9IE1hdGguYXRhbjIoZXZ0LmRldGFpbC54LCBldnQuZGV0YWlsLnkpICsgTWF0aC5QSVxyXG4gICAgICBjb25zdCBzdHJlbmd0aCA9IE1hdGguc3FydChldnQuZGV0YWlsLnggKiogMiArIGV2dC5kZXRhaWwueSAqKiAyKVxyXG5cclxuICAgICAgaWYgKHRoaXMuYWN0aXZlKSB7XHJcbiAgICAgICAgLy8gT25seSByb3RhdGUgaWYgdGhlIGF4ZXMgYXJlIHN1ZmZpY2llbnRseSBwcm9taW5lbnQsXHJcbiAgICAgICAgLy8gdG8gcHJldmVudCByb3RhdGluZyBpbiB1bmRlc2lyZWQvZmx1Y3R1YXRpbmcgZGlyZWN0aW9ucy5cclxuICAgICAgICBpZiAoc3RyZW5ndGggPiAwLjk1KSB7XHJcbiAgICAgICAgICB0aGlzLm9iai5nZXRXb3JsZFBvc2l0aW9uKHRoaXMuY29udHJvbGxlclBvc2l0aW9uKVxyXG4gICAgICAgICAgdGhpcy5jb250cm9sbGVyUG9zaXRpb24uc2V0Q29tcG9uZW50KDEsIHRoaXMuaGl0RW50aXR5Lm9iamVjdDNELnBvc2l0aW9uLnkpXHJcbiAgICAgICAgICAvLyBUT0RPOiBXZSBzZXQgaGl0RW50aXR5IGludmlzaWJsZSB0byBwcmV2ZW50IHJvdGF0aW9uIGdsaXRjaGVzXHJcbiAgICAgICAgICAvLyBidXQgd2UgY291bGQgYWxzbyByb3RhdGUgYW4gaW52aXNpYmxlIG9iamVjdCBpbnN0ZWFkIGFuZCBvbmx5XHJcbiAgICAgICAgICAvLyBhcHBseSB0aGUgZmluYWwgcm90YXRpb24gdG8gaGl0RW50aXR5LlxyXG4gICAgICAgICAgdGhpcy5oaXRFbnRpdHkub2JqZWN0M0QudmlzaWJsZSA9IGZhbHNlXHJcbiAgICAgICAgICB0aGlzLmhpdEVudGl0eS5vYmplY3QzRC5sb29rQXQodGhpcy5jb250cm9sbGVyUG9zaXRpb24pXHJcbiAgICAgICAgICB0aGlzLmhpdEVudGl0eS5vYmplY3QzRC5yb3RhdGVZKHJvdGF0aW9uKVxyXG4gICAgICAgICAgdGhpcy5oaXRFbnRpdHkub2JqZWN0M0QudmlzaWJsZSA9IHRydWVcclxuICAgICAgICAgIHRoaXMuaGl0RW50aXR5Lm9iamVjdDNELmdldFdvcmxkUXVhdGVybmlvbih0aGlzLmhpdEVudGl0eVF1YXRlcm5pb24pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChNYXRoLmFicyhldnQuZGV0YWlsLngpID09PSAwICYmIE1hdGguYWJzKGV2dC5kZXRhaWwueSkgPT09IDApIHtcclxuICAgICAgICAgIC8vIERpc2FibGUgdGVsZXBvcnQgb24gYXhpcyByZXR1cm4gdG8gMCBpZiBheGlzIChkZSlhY3RpdmF0aW9uIGlzIGVuYWJsZWRcclxuICAgICAgICAgIHRoaXMub25CdXR0b25VcCgpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIEZvcndhcmQgKHJvdGF0aW9uIDAuMCB8fCA2LjI4IGlzIHN0cmFpZ2h0IGFoZWFkKVxyXG4gICAgICAgIC8vIFdlIHVzZSBoYWxmIGEgcmFkaWFuIGxlZnQgYW5kIHJpZ2h0IGZvciBzb21lIGxlZXdheVxyXG4gICAgICAgIC8vIFdlIGFsc28gY2hlY2sgZm9yIHNpZ25pZmljYW50IHkgYXhpcyBtb3ZlbWVudCB0byBwcmV2ZW50XHJcbiAgICAgICAgLy8gYWNjaWRlbnRhbCB0ZWxlcG9ydHNcclxuICAgICAgfSBlbHNlIGlmICh0aGlzLnRodW1ic3RpY2tBeGlzQWN0aXZhdGlvbiAmJiBzdHJlbmd0aCA+IDAuOTUgJiYgKHJvdGF0aW9uIDwgMC41MCB8fCByb3RhdGlvbiA+IDUuNzgpKSB7XHJcbiAgICAgICAgLy8gQWN0aXZhdGUgKGZ1enppbHkpIG9uIGZvcndhcmQgYXhpcyBpZiBheGlzIGFjdGl2YXRpb24gaXMgZW5hYmxlZFxyXG4gICAgICAgIHRoaXMub25CdXR0b25Eb3duKClcclxuICAgICAgfSBlbHNlIGlmICh0aGlzLmRhdGEuc25hcFR1cm4pIHtcclxuICAgICAgICB0aGlzLmhhbmRsZVNuYXB0dXJuKHJvdGF0aW9uLCBzdHJlbmd0aClcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgdXBkYXRlOiBmdW5jdGlvbiAob2xkRGF0YSkge1xyXG4gICAgY29uc3QgZGF0YSA9IHRoaXMuZGF0YVxyXG4gICAgY29uc3QgZGlmZiA9IEFGUkFNRS51dGlscy5kaWZmKGRhdGEsIG9sZERhdGEpXHJcblxyXG4gICAgLy8gVXBkYXRlIG5vcm1hbC5cclxuICAgIHRoaXMucmVmZXJlbmNlTm9ybWFsLmNvcHkoZGF0YS5sYW5kaW5nTm9ybWFsKVxyXG5cclxuICAgIC8vIFVwZGF0ZSBjb2xvcnMuXHJcbiAgICB0aGlzLmN1cnZlTWlzc0NvbG9yLnNldChkYXRhLmN1cnZlTWlzc0NvbG9yKVxyXG4gICAgdGhpcy5jdXJ2ZUhpdENvbG9yLnNldChkYXRhLmN1cnZlSGl0Q29sb3IpXHJcblxyXG4gICAgLy8gQ3JlYXRlIG9yIHVwZGF0ZSBsaW5lIG1lc2guXHJcbiAgICBpZiAoIXRoaXMubGluZSB8fFxyXG4gICAgICAgICdjdXJ2ZUxpbmVXaWR0aCcgaW4gZGlmZiB8fCAnY3VydmVOdW1iZXJQb2ludHMnIGluIGRpZmYgfHwgJ3R5cGUnIGluIGRpZmYpIHtcclxuICAgICAgdGhpcy5saW5lID0gdGhpcy5jcmVhdGVMaW5lKGRhdGEpXHJcbiAgICAgIHRoaXMubGluZS5tYXRlcmlhbC5vcGFjaXR5ID0gdGhpcy5kYXRhLmhpdE9wYWNpdHlcclxuICAgICAgdGhpcy5saW5lLm1hdGVyaWFsLnRyYW5zcGFyZW50ID0gdGhpcy5kYXRhLmhpdE9wYWNpdHkgPCAxXHJcbiAgICAgIHRoaXMubnVtQWN0aXZlUG9pbnRzID0gZGF0YS5jdXJ2ZU51bWJlclBvaW50c1xyXG4gICAgICB0aGlzLnRlbGVwb3J0RW50aXR5LnNldE9iamVjdDNEKCdtZXNoJywgdGhpcy5saW5lLm1lc2gpXHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ3JlYXRlIG9yIHVwZGF0ZSBoaXQgZW50aXR5LlxyXG4gICAgaWYgKGRhdGEuaGl0RW50aXR5KSB7XHJcbiAgICAgIHRoaXMuaGl0RW50aXR5ID0gZGF0YS5oaXRFbnRpdHlcclxuICAgIH0gZWxzZSBpZiAoIXRoaXMuaGl0RW50aXR5IHx8ICdoaXRDeWxpbmRlckNvbG9yJyBpbiBkaWZmIHx8ICdoaXRDeWxpbmRlckhlaWdodCcgaW4gZGlmZiB8fFxyXG4gICAgICAgICAgICAgICAnaGl0Q3lsaW5kZXJSYWRpdXMnIGluIGRpZmYpIHtcclxuICAgICAgLy8gUmVtb3ZlIHByZXZpb3VzIGVudGl0eSwgY3JlYXRlIG5ldyBlbnRpdHkgKGNvdWxkIGJlIG1vcmUgcGVyZm9ybWFudCkuXHJcbiAgICAgIGlmICh0aGlzLmhpdEVudGl0eSkgeyB0aGlzLmhpdEVudGl0eS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuaGl0RW50aXR5KSB9XHJcbiAgICAgIHRoaXMuaGl0RW50aXR5ID0gdGhpcy5jcmVhdGVIaXRFbnRpdHkoZGF0YSlcclxuICAgICAgdGhpcy5lbC5zY2VuZUVsLmFwcGVuZENoaWxkKHRoaXMuaGl0RW50aXR5KVxyXG4gICAgfVxyXG4gICAgdGhpcy5oaXRFbnRpdHkuc2V0QXR0cmlidXRlKCd2aXNpYmxlJywgZmFsc2UpXHJcblxyXG4gICAgLy8gSWYgaXQgaGFzIHJvdGF0aW9uIG9uIHRlbGVwb3J0IGRpc2FibGVkIGhpZGUgdGhlIGFycm93IGluZGljYXRpbmcgdGhlIHRlbGVwb3J0YXRpb24gZGlyZWN0aW9uXHJcbiAgICBpZiAoIWRhdGEuaGl0RW50aXR5KSB7XHJcbiAgICAgIHRoaXMuaGl0RW50aXR5Lmxhc3RFbGVtZW50Q2hpbGQuc2V0QXR0cmlidXRlKCd2aXNpYmxlJywgZGF0YS5yb3RhdGVPblRlbGVwb3J0KTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoJ2NvbGxpc2lvbkVudGl0aWVzJyBpbiBkaWZmKSB7IHRoaXMucXVlcnlDb2xsaXNpb25FbnRpdGllcygpIH1cclxuICB9LFxyXG5cclxuICByZW1vdmU6IGZ1bmN0aW9uICgpIHtcclxuICAgIGNvbnN0IGVsID0gdGhpcy5lbFxyXG4gICAgY29uc3QgaGl0RW50aXR5ID0gdGhpcy5oaXRFbnRpdHlcclxuICAgIGNvbnN0IHRlbGVwb3J0RW50aXR5ID0gdGhpcy50ZWxlcG9ydEVudGl0eVxyXG5cclxuICAgIGlmIChoaXRFbnRpdHkpIHsgaGl0RW50aXR5LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoaGl0RW50aXR5KSB9XHJcbiAgICBpZiAodGVsZXBvcnRFbnRpdHkpIHsgdGVsZXBvcnRFbnRpdHkucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0ZWxlcG9ydEVudGl0eSkgfVxyXG5cclxuICAgIGVsLnNjZW5lRWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2hpbGQtYXR0YWNoZWQnLCB0aGlzLmNoaWxkQXR0YWNoSGFuZGxlcilcclxuICAgIGVsLnNjZW5lRWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2hpbGQtZGV0YWNoZWQnLCB0aGlzLmNoaWxkRGV0YWNoSGFuZGxlcilcclxuICB9LFxyXG5cclxuICB0aWNrOiAoZnVuY3Rpb24gKCkge1xyXG4gICAgY29uc3QgcDAgPSBuZXcgVEhSRUUuVmVjdG9yMygpXHJcbiAgICBjb25zdCB2MCA9IG5ldyBUSFJFRS5WZWN0b3IzKClcclxuICAgIGNvbnN0IGcgPSAtOS44XHJcbiAgICBjb25zdCBhID0gbmV3IFRIUkVFLlZlY3RvcjMoMCwgZywgMClcclxuICAgIGNvbnN0IG5leHQgPSBuZXcgVEhSRUUuVmVjdG9yMygpXHJcbiAgICBjb25zdCBsYXN0ID0gbmV3IFRIUkVFLlZlY3RvcjMoKVxyXG4gICAgY29uc3QgcXVhdGVybmlvbiA9IG5ldyBUSFJFRS5RdWF0ZXJuaW9uKClcclxuICAgIGNvbnN0IHRyYW5zbGF0aW9uID0gbmV3IFRIUkVFLlZlY3RvcjMoKVxyXG4gICAgY29uc3Qgc2NhbGUgPSBuZXcgVEhSRUUuVmVjdG9yMygpXHJcbiAgICBjb25zdCBzaG9vdEFuZ2xlID0gbmV3IFRIUkVFLlZlY3RvcjMoKVxyXG4gICAgY29uc3QgbGFzdE5leHQgPSBuZXcgVEhSRUUuVmVjdG9yMygpXHJcbiAgICBjb25zdCBhdXhEaXJlY3Rpb24gPSBuZXcgVEhSRUUuVmVjdG9yMygpXHJcbiAgICBsZXQgdGltZVNpbmNlRHJhd1N0YXJ0ID0gMFxyXG5cclxuICAgIHJldHVybiBmdW5jdGlvbiAodGltZSwgZGVsdGEpIHtcclxuICAgICAgaWYgKCF0aGlzLmFjdGl2ZSkgeyByZXR1cm4gfVxyXG4gICAgICBpZiAodGhpcy5kYXRhLmRyYXdJbmNyZW1lbnRhbGx5ICYmIHRoaXMucmVkcmF3TGluZSkge1xyXG4gICAgICAgIHRoaXMucmVkcmF3TGluZSA9IGZhbHNlXHJcbiAgICAgICAgdGltZVNpbmNlRHJhd1N0YXJ0ID0gMFxyXG4gICAgICB9XHJcbiAgICAgIHRpbWVTaW5jZURyYXdTdGFydCArPSBkZWx0YVxyXG4gICAgICB0aGlzLm51bUFjdGl2ZVBvaW50cyA9IHRoaXMuZGF0YS5jdXJ2ZU51bWJlclBvaW50cyAqIHRpbWVTaW5jZURyYXdTdGFydCAvIHRoaXMuZGF0YS5pbmNyZW1lbnRhbERyYXdNc1xyXG4gICAgICBpZiAodGhpcy5udW1BY3RpdmVQb2ludHMgPiB0aGlzLmRhdGEuY3VydmVOdW1iZXJQb2ludHMpIHtcclxuICAgICAgICB0aGlzLm51bUFjdGl2ZVBvaW50cyA9IHRoaXMuZGF0YS5jdXJ2ZU51bWJlclBvaW50c1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBPbmx5IGNoZWNrIGZvciBpbnRlcnNlY3Rpb24gaWYgaW50ZXJ2YWwgdGltZSBoYXMgcGFzc2VkLlxyXG4gICAgICBpZiAodGhpcy5wcmV2Q2hlY2tUaW1lICYmICh0aW1lIC0gdGhpcy5wcmV2Q2hlY2tUaW1lIDwgdGhpcy5kYXRhLmludGVydmFsKSkgeyByZXR1cm4gfVxyXG4gICAgICAvLyBVcGRhdGUgY2hlY2sgdGltZS5cclxuICAgICAgdGhpcy5wcmV2Q2hlY2tUaW1lID0gdGltZVxyXG5cclxuICAgICAgY29uc3QgbWF0cml4V29ybGQgPSB0aGlzLm9iai5tYXRyaXhXb3JsZFxyXG4gICAgICBtYXRyaXhXb3JsZC5kZWNvbXBvc2UodHJhbnNsYXRpb24sIHF1YXRlcm5pb24sIHNjYWxlKVxyXG5cclxuICAgICAgY29uc3QgZGlyZWN0aW9uID0gc2hvb3RBbmdsZS5zZXQoMCwgMCwgLTEpXHJcbiAgICAgICAgLmFwcGx5UXVhdGVybmlvbihxdWF0ZXJuaW9uKS5ub3JtYWxpemUoKVxyXG4gICAgICB0aGlzLmxpbmUuc2V0RGlyZWN0aW9uKGF1eERpcmVjdGlvbi5jb3B5KGRpcmVjdGlvbikpXHJcbiAgICAgIHRoaXMub2JqLmdldFdvcmxkUG9zaXRpb24ocDApXHJcblxyXG4gICAgICBsYXN0LmNvcHkocDApXHJcblxyXG4gICAgICAvLyBTZXQgZGVmYXVsdCBzdGF0dXMgYXMgbm9uLWhpdFxyXG4gICAgICB0aGlzLnRlbGVwb3J0RW50aXR5LnNldEF0dHJpYnV0ZSgndmlzaWJsZScsIHRydWUpXHJcblxyXG4gICAgICAvLyBCdXQgdXNlIGhpdCBjb2xvciB1bnRpbCByYXkgYW5pbWF0aW9uIGZpbmlzaGVzXHJcbiAgICAgIGlmICh0aW1lU2luY2VEcmF3U3RhcnQgPCB0aGlzLmRhdGEuaW5jcmVtZW50YWxEcmF3TXMpIHtcclxuICAgICAgICB0aGlzLmxpbmUubWF0ZXJpYWwuY29sb3Iuc2V0KHRoaXMuY3VydmVIaXRDb2xvcilcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmxpbmUubWF0ZXJpYWwuY29sb3Iuc2V0KHRoaXMuY3VydmVNaXNzQ29sb3IpXHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5saW5lLm1hdGVyaWFsLm9wYWNpdHkgPSB0aGlzLmRhdGEubWlzc09wYWNpdHlcclxuICAgICAgdGhpcy5saW5lLm1hdGVyaWFsLnRyYW5zcGFyZW50ID0gdGhpcy5kYXRhLm1pc3NPcGFjaXR5IDwgMVxyXG4gICAgICB0aGlzLmhpdEVudGl0eS5zZXRBdHRyaWJ1dGUoJ3Zpc2libGUnLCBmYWxzZSlcclxuICAgICAgdGhpcy5oaXQgPSBmYWxzZVxyXG5cclxuICAgICAgdjAuY29weShkaXJlY3Rpb24pLm11bHRpcGx5U2NhbGFyKHRoaXMuZGF0YS5jdXJ2ZVNob290aW5nU3BlZWQpXHJcblxyXG4gICAgICB0aGlzLmxhc3REcmF3bkluZGV4ID0gMFxyXG4gICAgICBjb25zdCBudW1Qb2ludHMgPSB0aGlzLmRhdGEuZHJhd0luY3JlbWVudGFsbHkgPyB0aGlzLm51bUFjdGl2ZVBvaW50cyA6IHRoaXMubGluZS5udW1Qb2ludHNcclxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1Qb2ludHMgKyAxOyBpKyspIHtcclxuICAgICAgICBsZXQgdFxyXG4gICAgICAgIGlmIChpID09PSBNYXRoLmZsb29yKG51bVBvaW50cyArIDEpKSB7XHJcbiAgICAgICAgICB0ID0gbnVtUG9pbnRzIC8gKHRoaXMubGluZS5udW1Qb2ludHMgLSAxKVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0ID0gaSAvICh0aGlzLmxpbmUubnVtUG9pbnRzIC0gMSlcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgdGltZVRvUmVhY2gwID0gdGhpcy5wYXJhYm9saWNDdXJ2ZU1heFJvb3QocDAsIHYwLCBhKVxyXG4gICAgICAgIHQgPSB0ICogTWF0aC5tYXgoMSwgMS41ICogdGltZVRvUmVhY2gwKVxyXG5cclxuICAgICAgICB0aGlzLnBhcmFib2xpY0N1cnZlKHAwLCB2MCwgYSwgdCwgbmV4dClcclxuICAgICAgICAvLyBVcGRhdGUgdGhlIHJheWNhc3RlciB3aXRoIHRoZSBsZW5ndGggb2YgdGhlIGN1cnJlbnQgc2VnbWVudCBsYXN0LT5uZXh0XHJcbiAgICAgICAgY29uc3QgZGlyTGFzdE5leHQgPSBsYXN0TmV4dC5jb3B5KG5leHQpLnN1YihsYXN0KS5ub3JtYWxpemUoKVxyXG4gICAgICAgIHRoaXMucmF5Y2FzdGVyLmZhciA9IGRpckxhc3ROZXh0Lmxlbmd0aCgpXHJcbiAgICAgICAgdGhpcy5yYXljYXN0ZXIuc2V0KGxhc3QsIGRpckxhc3ROZXh0KVxyXG5cclxuICAgICAgICB0aGlzLmxhc3REcmF3blBvaW50ID0gbmV4dFxyXG4gICAgICAgIHRoaXMubGFzdERyYXduSW5kZXggPSBpXHJcbiAgICAgICAgaWYgKHRoaXMuY2hlY2tNZXNoQ29sbGlzaW9ucyhpLCBsYXN0LCBuZXh0KSkgeyBicmVhayB9XHJcblxyXG4gICAgICAgIGxhc3QuY29weShuZXh0KVxyXG4gICAgICB9XHJcbiAgICAgIGZvciAobGV0IGogPSB0aGlzLmxhc3REcmF3bkluZGV4ICsgMTsgaiA8IHRoaXMubGluZS5udW1Qb2ludHM7IGorKykge1xyXG4gICAgICAgIHRoaXMubGluZS5zZXRQb2ludChqLCB0aGlzLmxhc3REcmF3blBvaW50LCB0aGlzLmxhc3REcmF3blBvaW50KVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSkoKSxcclxuXHJcbiAgLyoqXHJcbiAgICogUnVuIGBxdWVyeVNlbGVjdG9yQWxsYCBmb3IgYGNvbGxpc2lvbkVudGl0aWVzYCBhbmQgbWFpbnRhaW4gaXQgd2l0aCBgY2hpbGQtYXR0YWNoZWRgXHJcbiAgICogYW5kIGBjaGlsZC1kZXRhY2hlZGAgZXZlbnRzLlxyXG4gICAqL1xyXG4gIHF1ZXJ5Q29sbGlzaW9uRW50aXRpZXM6IGZ1bmN0aW9uICgpIHtcclxuICAgIGNvbnN0IGRhdGEgPSB0aGlzLmRhdGFcclxuICAgIGNvbnN0IGVsID0gdGhpcy5lbFxyXG5cclxuICAgIGlmICghZGF0YS5jb2xsaXNpb25FbnRpdGllcykge1xyXG4gICAgICB0aGlzLmNvbGxpc2lvbkVudGl0aWVzID0gW11cclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgY29sbGlzaW9uRW50aXRpZXMgPSBbXS5zbGljZS5jYWxsKGVsLnNjZW5lRWwucXVlcnlTZWxlY3RvckFsbChkYXRhLmNvbGxpc2lvbkVudGl0aWVzKSlcclxuICAgIHRoaXMuY29sbGlzaW9uRW50aXRpZXMgPSBjb2xsaXNpb25FbnRpdGllc1xyXG5cclxuICAgIC8vIFVwZGF0ZSBlbnRpdHkgbGlzdCBvbiBhdHRhY2guXHJcbiAgICB0aGlzLmNoaWxkQXR0YWNoSGFuZGxlciA9IGZ1bmN0aW9uIGNoaWxkQXR0YWNoSGFuZGxlciAoZXZ0KSB7XHJcbiAgICAgIGlmICghZXZ0LmRldGFpbC5lbC5tYXRjaGVzKGRhdGEuY29sbGlzaW9uRW50aXRpZXMpKSB7IHJldHVybiB9XHJcbiAgICAgIGNvbGxpc2lvbkVudGl0aWVzLnB1c2goZXZ0LmRldGFpbC5lbClcclxuICAgIH1cclxuICAgIGVsLnNjZW5lRWwuYWRkRXZlbnRMaXN0ZW5lcignY2hpbGQtYXR0YWNoZWQnLCB0aGlzLmNoaWxkQXR0YWNoSGFuZGxlcilcclxuXHJcbiAgICAvLyBVcGRhdGUgZW50aXR5IGxpc3Qgb24gZGV0YWNoLlxyXG4gICAgdGhpcy5jaGlsZERldGFjaEhhbmRsZXIgPSBmdW5jdGlvbiBjaGlsZERldGFjaEhhbmRsZXIgKGV2dCkge1xyXG4gICAgICBpZiAoIWV2dC5kZXRhaWwuZWwubWF0Y2hlcyhkYXRhLmNvbGxpc2lvbkVudGl0aWVzKSkgeyByZXR1cm4gfVxyXG4gICAgICBjb25zdCBpbmRleCA9IGNvbGxpc2lvbkVudGl0aWVzLmluZGV4T2YoZXZ0LmRldGFpbC5lbClcclxuICAgICAgaWYgKGluZGV4ID09PSAtMSkgeyByZXR1cm4gfVxyXG4gICAgICBjb2xsaXNpb25FbnRpdGllcy5zcGxpY2UoaW5kZXgsIDEpXHJcbiAgICB9XHJcbiAgICBlbC5zY2VuZUVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NoaWxkLWRldGFjaGVkJywgdGhpcy5jaGlsZERldGFjaEhhbmRsZXIpXHJcbiAgfSxcclxuXHJcbiAgb25CdXR0b25Eb3duOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLmFjdGl2ZSA9IHRydWVcclxuICAgIHRoaXMucmVkcmF3TGluZSA9IHRydWVcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBKdW1wIVxyXG4gICAqL1xyXG4gIG9uQnV0dG9uVXA6IChmdW5jdGlvbiAoKSB7XHJcbiAgICBjb25zdCBuZXdSaWdMb2NhbFBvc2l0aW9uID0gbmV3IFRIUkVFLlZlY3RvcjMoKVxyXG4gICAgY29uc3QgbmV3SGFuZFBvc2l0aW9uID0gW25ldyBUSFJFRS5WZWN0b3IzKCksIG5ldyBUSFJFRS5WZWN0b3IzKCldIC8vIExlZnQgYW5kIHJpZ2h0XHJcbiAgICBjb25zdCBoYW5kUG9zaXRpb24gPSBuZXcgVEhSRUUuVmVjdG9yMygpXHJcblxyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChldnQpIHtcclxuICAgICAgaWYgKCF0aGlzLmFjdGl2ZSkgeyByZXR1cm4gfVxyXG5cclxuICAgICAgLy8gSGlkZSB0aGUgaGl0IHBvaW50IGFuZCB0aGUgY3VydmVcclxuICAgICAgdGhpcy5hY3RpdmUgPSBmYWxzZVxyXG4gICAgICB0aGlzLmhpdEVudGl0eS5zZXRBdHRyaWJ1dGUoJ3Zpc2libGUnLCBmYWxzZSlcclxuICAgICAgdGhpcy50ZWxlcG9ydEVudGl0eS5zZXRBdHRyaWJ1dGUoJ3Zpc2libGUnLCBmYWxzZSlcclxuXHJcbiAgICAgIGlmICghdGhpcy5oaXQpIHtcclxuICAgICAgICAvLyBCdXR0b24gcmVsZWFzZWQgYnV0IG5vIGhpdCBwb2ludFxyXG4gICAgICAgIHJldHVyblxyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCByaWcgPSB0aGlzLmRhdGEuY2FtZXJhUmlnIHx8IHRoaXMuZWwuc2NlbmVFbC5jYW1lcmEuZWxcclxuICAgICAgcmlnLm9iamVjdDNELmdldFdvcmxkUG9zaXRpb24odGhpcy5yaWdXb3JsZFBvc2l0aW9uKVxyXG4gICAgICB0aGlzLm5ld1JpZ1dvcmxkUG9zaXRpb24uY29weSh0aGlzLmhpdFBvaW50KVxyXG5cclxuICAgICAgLy8gRmluYWxseSB1cGRhdGUgdGhlIHJpZ3MgcG9zaXRpb25cclxuICAgICAgbmV3UmlnTG9jYWxQb3NpdGlvbi5jb3B5KHRoaXMubmV3UmlnV29ybGRQb3NpdGlvbilcclxuICAgICAgaWYgKHJpZy5vYmplY3QzRC5wYXJlbnQpIHtcclxuICAgICAgICByaWcub2JqZWN0M0QucGFyZW50LndvcmxkVG9Mb2NhbChuZXdSaWdMb2NhbFBvc2l0aW9uKVxyXG4gICAgICB9XHJcbiAgICAgIHJpZy5zZXRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJywgbmV3UmlnTG9jYWxQb3NpdGlvbilcclxuXHJcbiAgICAgIC8vIEFsc28gdGFrZSB0aGUgaGVhZHNldC9jYW1lcmEgcm90YXRpb24gaXRzZWxmIGludG8gYWNjb3VudFxyXG4gICAgICBpZiAodGhpcy5kYXRhLnJvdGF0ZU9uVGVsZXBvcnQpIHtcclxuICAgICAgICB0aGlzLnRlbGVwb3J0T3JpZ2luUXVhdGVybmlvblxyXG4gICAgICAgICAgLnNldEZyb21FdWxlcihuZXcgVEhSRUUuRXVsZXIoMCwgdGhpcy50ZWxlcG9ydE9yaWdpbi5vYmplY3QzRC5yb3RhdGlvbi55LCAwKSlcclxuICAgICAgICB0aGlzLnRlbGVwb3J0T3JpZ2luUXVhdGVybmlvbi5pbnZlcnQoKVxyXG4gICAgICAgIHRoaXMudGVsZXBvcnRPcmlnaW5RdWF0ZXJuaW9uLm11bHRpcGx5KHRoaXMuaGl0RW50aXR5UXVhdGVybmlvbilcclxuICAgICAgICAvLyBSb3RhdGUgdGhlIHJpZyBiYXNlZCBvbiBjYWxjdWxhdGVkIHRlbGVwb3J0IG9yaWdpbiByb3RhdGlvblxyXG4gICAgICAgIHRoaXMuY2FtZXJhUmlnLm9iamVjdDNELnNldFJvdGF0aW9uRnJvbVF1YXRlcm5pb24odGhpcy50ZWxlcG9ydE9yaWdpblF1YXRlcm5pb24pXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIElmIGEgcmlnIHdhcyBub3QgZXhwbGljaXRseSBkZWNsYXJlZCwgbG9vayBmb3IgaGFuZHMgYW5kIG1vdmUgdGhlbSBwcm9wb3J0aW9uYWxseSBhcyB3ZWxsXHJcbiAgICAgIGlmICghdGhpcy5kYXRhLmNhbWVyYVJpZykge1xyXG4gICAgICAgIGNvbnN0IGhhbmRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnYS1lbnRpdHlbdHJhY2tlZC1jb250cm9sc10nKVxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaGFuZHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgIGhhbmRzW2ldLm9iamVjdDNELmdldFdvcmxkUG9zaXRpb24oaGFuZFBvc2l0aW9uKVxyXG5cclxuICAgICAgICAgIC8vIGRpZmYgPSByaWdXb3JsZFBvc2l0aW9uIC0gaGFuZFBvc2l0aW9uXHJcbiAgICAgICAgICAvLyBuZXdQb3MgPSBuZXdSaWdXb3JsZFBvc2l0aW9uIC0gZGlmZlxyXG4gICAgICAgICAgbmV3SGFuZFBvc2l0aW9uW2ldLmNvcHkodGhpcy5uZXdSaWdXb3JsZFBvc2l0aW9uKS5zdWIodGhpcy5yaWdXb3JsZFBvc2l0aW9uKS5hZGQoaGFuZFBvc2l0aW9uKVxyXG4gICAgICAgICAgaGFuZHNbaV0uc2V0QXR0cmlidXRlKCdwb3NpdGlvbicsIG5ld0hhbmRQb3NpdGlvbltpXSlcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuZWwuZW1pdCgndGVsZXBvcnRlZCcsIHRoaXMudGVsZXBvcnRFdmVudERldGFpbClcclxuICAgIH1cclxuICB9KSgpLFxyXG5cclxuICAvKipcclxuICAgKiBDaGVjayBmb3IgcmF5Y2FzdGVyIGludGVyc2VjdGlvbi5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBMaW5lIGZyYWdtZW50IHBvaW50IGluZGV4LlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBMYXN0IGxpbmUgZnJhZ21lbnQgcG9pbnQgaW5kZXguXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IE5leHQgbGluZSBmcmFnbWVudCBwb2ludCBpbmRleC5cclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGVyZSdzIGFuIGludGVyc2VjdGlvbi5cclxuICAgKi9cclxuICBjaGVja01lc2hDb2xsaXNpb25zOiBmdW5jdGlvbiAoaSwgbGFzdCwgbmV4dCkge1xyXG4gICAgLy8gQHRvZG8gV2Ugc2hvdWxkIGFkZCBhIHByb3BlcnR5IHRvIGRlZmluZSBpZiB0aGUgY29sbGlzaW9uRW50aXR5IGlzIGR5bmFtaWMgb3Igc3RhdGljXHJcbiAgICAvLyBJZiBzdGF0aWMgd2Ugc2hvdWxkIGRvIHRoZSBtYXAganVzdCBvbmNlLCBvdGhlcndpc2Ugd2UncmUgcmVjcmVhdGluZyB0aGUgYXJyYXkgaW4gZXZlcnlcclxuICAgIC8vIGxvb3Agd2hlbiBhaW1pbmcuXHJcbiAgICBsZXQgbWVzaGVzXHJcbiAgICBpZiAoIXRoaXMuZGF0YS5jb2xsaXNpb25FbnRpdGllcykge1xyXG4gICAgICBtZXNoZXMgPSB0aGlzLmRlZmF1bHRDb2xsaXNpb25NZXNoZXNcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIG1lc2hlcyA9IHRoaXMuY29sbGlzaW9uRW50aXRpZXMubWFwKGZ1bmN0aW9uIChlbnRpdHkpIHtcclxuICAgICAgICByZXR1cm4gZW50aXR5LmdldE9iamVjdDNEKCdtZXNoJylcclxuICAgICAgfSkuZmlsdGVyKGZ1bmN0aW9uIChuKSB7IHJldHVybiBuIH0pXHJcbiAgICAgIG1lc2hlcyA9IG1lc2hlcy5sZW5ndGggPyBtZXNoZXMgOiB0aGlzLmRlZmF1bHRDb2xsaXNpb25NZXNoZXNcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBpbnRlcnNlY3RzID0gdGhpcy5yYXljYXN0ZXIuaW50ZXJzZWN0T2JqZWN0cyhtZXNoZXMsIHRydWUpXHJcbiAgICBpZiAoaW50ZXJzZWN0cy5sZW5ndGggPiAwICYmICF0aGlzLmhpdCAmJlxyXG4gICAgICAgIHRoaXMuaXNWYWxpZE5vcm1hbHNBbmdsZShpbnRlcnNlY3RzWzBdLmZhY2Uubm9ybWFsLCBpbnRlcnNlY3RzWzBdLm9iamVjdCkpIHtcclxuICAgICAgY29uc3QgcG9pbnQgPSBpbnRlcnNlY3RzWzBdLnBvaW50XHJcblxyXG4gICAgICB0aGlzLmxpbmUubWF0ZXJpYWwuY29sb3Iuc2V0KHRoaXMuY3VydmVIaXRDb2xvcilcclxuICAgICAgdGhpcy5saW5lLm1hdGVyaWFsLm9wYWNpdHkgPSB0aGlzLmRhdGEuaGl0T3BhY2l0eVxyXG4gICAgICB0aGlzLmxpbmUubWF0ZXJpYWwudHJhbnNwYXJlbnQgPSB0aGlzLmRhdGEuaGl0T3BhY2l0eSA8IDFcclxuICAgICAgdGhpcy5oaXRFbnRpdHkuc2V0QXR0cmlidXRlKCdwb3NpdGlvbicsIHBvaW50KVxyXG4gICAgICB0aGlzLmhpdEVudGl0eS5zZXRBdHRyaWJ1dGUoJ3Zpc2libGUnLCB0cnVlKVxyXG5cclxuICAgICAgdGhpcy5oaXQgPSB0cnVlXHJcbiAgICAgIHRoaXMuaGl0UG9pbnQuY29weShpbnRlcnNlY3RzWzBdLnBvaW50KVxyXG5cclxuICAgICAgLy8gSWYgaGl0LCBqdXN0IGZpbGwgdGhlIHJlc3Qgb2YgdGhlIHBvaW50cyB3aXRoIHRoZSBoaXQgcG9pbnQgYW5kIGJyZWFrIHRoZSBsb29wXHJcbiAgICAgIGZvciAobGV0IGogPSBpOyBqIDwgdGhpcy5saW5lLm51bVBvaW50czsgaisrKSB7XHJcbiAgICAgICAgdGhpcy5saW5lLnNldFBvaW50KGosIGxhc3QsIHRoaXMuaGl0UG9pbnQpXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHRydWVcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMubGluZS5zZXRQb2ludChpLCBsYXN0LCBuZXh0KVxyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH1cclxuICB9LFxyXG5cclxuICBpc1ZhbGlkTm9ybWFsc0FuZ2xlOiBmdW5jdGlvbiAoY29sbGlzaW9uTm9ybWFsLCBjb2xsaXNpb25PYmplY3QpIHtcclxuICAgIHRoaXMuY29sbGlzaW9uT2JqZWN0Tm9ybWFsTWF0cml4LmdldE5vcm1hbE1hdHJpeChjb2xsaXNpb25PYmplY3QubWF0cml4V29ybGQpXHJcbiAgICB0aGlzLmNvbGxpc2lvbldvcmxkTm9ybWFsLmNvcHkoY29sbGlzaW9uTm9ybWFsKVxyXG4gICAgICAuYXBwbHlNYXRyaXgzKHRoaXMuY29sbGlzaW9uT2JqZWN0Tm9ybWFsTWF0cml4KS5ub3JtYWxpemUoKVxyXG4gICAgY29uc3QgYW5nbGVOb3JtYWxzID0gdGhpcy5yZWZlcmVuY2VOb3JtYWwuYW5nbGVUbyh0aGlzLmNvbGxpc2lvbldvcmxkTm9ybWFsKVxyXG4gICAgcmV0dXJuIChUSFJFRS5NYXRoLlJBRDJERUcgKiBhbmdsZU5vcm1hbHMgPD0gdGhpcy5kYXRhLmxhbmRpbmdNYXhBbmdsZSlcclxuICB9LFxyXG5cclxuICAvLyBVdGlsc1xyXG4gIC8vIFBhcmFib2xpYyBtb3Rpb24gZXF1YXRpb24sIHkgPSBwMCArIHYwKnQgKyAxLzJhdF4yXHJcbiAgcGFyYWJvbGljQ3VydmVTY2FsYXI6IGZ1bmN0aW9uIChwMCwgdjAsIGEsIHQpIHtcclxuICAgIHJldHVybiBwMCArIHYwICogdCArIDAuNSAqIGEgKiB0ICogdFxyXG4gIH0sXHJcblxyXG4gIC8vIFBhcmFib2xpYyBtb3Rpb24gZXF1YXRpb24gYXBwbGllZCB0byAzIGRpbWVuc2lvbnNcclxuICBwYXJhYm9saWNDdXJ2ZTogZnVuY3Rpb24gKHAwLCB2MCwgYSwgdCwgb3V0KSB7XHJcbiAgICBvdXQueCA9IHRoaXMucGFyYWJvbGljQ3VydmVTY2FsYXIocDAueCwgdjAueCwgYS54LCB0KVxyXG4gICAgb3V0LnkgPSB0aGlzLnBhcmFib2xpY0N1cnZlU2NhbGFyKHAwLnksIHYwLnksIGEueSwgdClcclxuICAgIG91dC56ID0gdGhpcy5wYXJhYm9saWNDdXJ2ZVNjYWxhcihwMC56LCB2MC56LCBhLnosIHQpXHJcbiAgICByZXR1cm4gb3V0XHJcbiAgfSxcclxuXHJcbiAgLy8gVG8gZGV0ZXJtaW5lIGhvdyBsb25nIGluIHRlcm1zIG9mIHQgd2UgbmVlZCB0byBjYWxjdWxhdGVcclxuICBwYXJhYm9saWNDdXJ2ZU1heFJvb3Q6IGZ1bmN0aW9uIChwMCwgdjAsIGEpIHtcclxuICAgIGNvbnN0IHJvb3QgPSAoLXYwLnkgLSBNYXRoLnNxcnQodjAueSAqKiAyIC0gNCAqICgwLjUgKiBhLnkpICogcDAueSkpIC8gKDIgKiAwLjUgKiBhLnkpXHJcbiAgICByZXR1cm4gcm9vdFxyXG4gIH0sXHJcblxyXG4gIGNyZWF0ZUxpbmU6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICBjb25zdCBudW1Qb2ludHMgPSBkYXRhLnR5cGUgPT09ICdsaW5lJyA/IDIgOiBkYXRhLmN1cnZlTnVtYmVyUG9pbnRzXHJcbiAgICByZXR1cm4gbmV3IEFGUkFNRS51dGlscy5SYXlDdXJ2ZShudW1Qb2ludHMsIGRhdGEuY3VydmVMaW5lV2lkdGgpXHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAqIENyZWF0ZSBtZXNoIHRvIHJlcHJlc2VudCB0aGUgYXJlYSBvZiBpbnRlcnNlY3Rpb24uXHJcbiAqIERlZmF1bHQgdG8gYSBjb21iaW5hdGlvbiBvZiB0b3J1cyBhbmQgY3lsaW5kZXIuXHJcbiAqL1xyXG4gIGNyZWF0ZUhpdEVudGl0eTogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgIC8vIFBhcmVudC5cclxuICAgIGNvbnN0IGhpdEVudGl0eSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EtZW50aXR5JylcclxuICAgIGhpdEVudGl0eS5jbGFzc05hbWUgPSAnaGl0RW50aXR5J1xyXG5cclxuICAgIC8vIFRvcnVzLlxyXG4gICAgY29uc3QgdG9ydXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhLWVudGl0eScpXHJcbiAgICB0b3J1cy5zZXRBdHRyaWJ1dGUoJ2dlb21ldHJ5Jywge1xyXG4gICAgICBwcmltaXRpdmU6ICd0b3J1cycsXHJcbiAgICAgIHJhZGl1czogZGF0YS5oaXRDeWxpbmRlclJhZGl1cyxcclxuICAgICAgcmFkaXVzVHVidWxhcjogMC4wMVxyXG4gICAgfSlcclxuICAgIHRvcnVzLnNldEF0dHJpYnV0ZSgncm90YXRpb24nLCB7IHg6IDkwLCB5OiAwLCB6OiAwIH0pXHJcbiAgICB0b3J1cy5zZXRBdHRyaWJ1dGUoJ21hdGVyaWFsJywge1xyXG4gICAgICBzaGFkZXI6ICdmbGF0JyxcclxuICAgICAgY29sb3I6IGRhdGEuaGl0Q3lsaW5kZXJDb2xvcixcclxuICAgICAgc2lkZTogJ2RvdWJsZScsXHJcbiAgICAgIGRlcHRoVGVzdDogZmFsc2VcclxuICAgIH0pXHJcbiAgICBoaXRFbnRpdHkuYXBwZW5kQ2hpbGQodG9ydXMpXHJcblxyXG4gICAgLy8gQ3lsaW5kZXIuXHJcbiAgICBjb25zdCBjeWxpbmRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EtZW50aXR5JylcclxuICAgIGN5bGluZGVyLnNldEF0dHJpYnV0ZSgncG9zaXRpb24nLCB7IHg6IDAsIHk6IGRhdGEuaGl0Q3lsaW5kZXJIZWlnaHQgLyAyLCB6OiAwIH0pXHJcbiAgICBjeWxpbmRlci5zZXRBdHRyaWJ1dGUoJ2dlb21ldHJ5Jywge1xyXG4gICAgICBwcmltaXRpdmU6ICdjeWxpbmRlcicsXHJcbiAgICAgIHNlZ21lbnRzSGVpZ2h0OiAxLFxyXG4gICAgICByYWRpdXM6IGRhdGEuaGl0Q3lsaW5kZXJSYWRpdXMsXHJcbiAgICAgIGhlaWdodDogZGF0YS5oaXRDeWxpbmRlckhlaWdodCxcclxuICAgICAgb3BlbkVuZGVkOiB0cnVlXHJcbiAgICB9KVxyXG4gICAgY3lsaW5kZXIuc2V0QXR0cmlidXRlKCdtYXRlcmlhbCcsIHtcclxuICAgICAgc2hhZGVyOiAnZmxhdCcsXHJcbiAgICAgIGNvbG9yOiBkYXRhLmhpdEN5bGluZGVyQ29sb3IsXHJcbiAgICAgIG9wYWNpdHk6IDAuNSxcclxuICAgICAgc2lkZTogJ2RvdWJsZScsXHJcbiAgICAgIHNyYzogdGhpcy5jeWxpbmRlclRleHR1cmUsXHJcbiAgICAgIHRyYW5zcGFyZW50OiB0cnVlLFxyXG4gICAgICBkZXB0aFRlc3Q6IGZhbHNlXHJcbiAgICB9KVxyXG4gICAgaGl0RW50aXR5LmFwcGVuZENoaWxkKGN5bGluZGVyKVxyXG5cclxuICAgIGNvbnN0IHBvaW50ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhLWVudGl0eScpXHJcbiAgICBwb2ludGVyLnNldEF0dHJpYnV0ZSgncG9zaXRpb24nLCB7IHg6IDAsIHk6IDAuMDUsIHo6IGRhdGEuaGl0Q3lsaW5kZXJSYWRpdXMgKiAtMS41IH0pXHJcbiAgICBwb2ludGVyLnNldEF0dHJpYnV0ZSgncm90YXRpb24nLCB7IHg6IDkwLCB5OiAxODAsIHo6IDAgfSlcclxuICAgIHBvaW50ZXIuc2V0QXR0cmlidXRlKCdnZW9tZXRyeScsIHtcclxuICAgICAgcHJpbWl0aXZlOiAncHJpc20nLFxyXG4gICAgICBoZWlnaHQ6IDAuMixcclxuICAgICAgd2lkdGg6IDAuMixcclxuICAgICAgZGVwdGg6IDAuMDVcclxuICAgIH0pXHJcbiAgICBwb2ludGVyLnNldEF0dHJpYnV0ZSgnbWF0ZXJpYWwnLCB7XHJcbiAgICAgIHNoYWRlcjogJ2ZsYXQnLFxyXG4gICAgICBjb2xvcjogZGF0YS5oaXRDeWxpbmRlckNvbG9yLFxyXG4gICAgICBzaWRlOiAnZG91YmxlJyxcclxuICAgICAgdHJhbnNwYXJlbnQ6IHRydWUsXHJcbiAgICAgIG9wYWNpdHk6IDAuNixcclxuICAgICAgZGVwdGhUZXN0OiBmYWxzZVxyXG4gICAgfSlcclxuICAgIGhpdEVudGl0eS5hcHBlbmRDaGlsZChwb2ludGVyKVxyXG5cclxuICAgIHJldHVybiBoaXRFbnRpdHlcclxuICB9LFxyXG4gIGNyZWF0ZURlZmF1bHRQbGFuZTogZnVuY3Rpb24gKHNpemUpIHtcclxuICAgIGNvbnN0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lQnVmZmVyR2VvbWV0cnkoMTAwLCAxMDApXHJcbiAgICBnZW9tZXRyeS5yb3RhdGVYKC1NYXRoLlBJIC8gMilcclxuICAgIGNvbnN0IG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgY29sb3I6IDB4ZmZmZjAwIH0pXHJcbiAgICByZXR1cm4gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKVxyXG4gIH0sXHJcbiAgY3lsaW5kZXJUZXh0dXJlOiAndXJsKGRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQUVBQUFBUUNBWUFBQURYbnhXM0FBQUFDWEJJV1hNQUFBc1RBQUFMRXdFQW1wd1lBQUFLVDJsRFExQlFhRzkwYjNOb2IzQWdTVU5ESUhCeWIyWnBiR1VBQUhqYW5WTm5WRlBwRmozMzN2UkNTNGlBbEV0dlVoVUlJRkpDaTRBVWtTWXFJUWtRU29naG9ka1ZVY0VSUlVVRUc4aWdpQU9Pam9DTUZWRXNESW9LMkFma0lhS09nNk9JaXNyNzRYdWphOWE4OStiTi9yWFhQdWVzODUyenp3ZkFDQXlXU0ROUk5ZQU1xVUllRWVDRHg4VEc0ZVF1UUlFS0pIQUFFQWl6WkNGei9TTUJBUGgrUER3cklzQUh2Z0FCZU5NTENBREFUWnZBTUJ5SC93L3FRcGxjQVlDRUFjQjBrVGhMQ0lBVUFFQjZqa0ttQUVCR0FZQ2RtQ1pUQUtBRUFHRExZMkxqQUZBdEFHQW5mK2JUQUlDZCtKbDdBUUJibENFVkFhQ1JBQ0FUWlloRUFHZzdBS3pQVm9wRkFGZ3dBQlJtUzhRNUFOZ3RBREJKVjJaSUFMQzNBTURPRUF1eUFBZ01BREJSaUlVcEFBUjdBR0RJSXlONEFJU1pBQlJHOGxjODhTdXVFT2NxQUFCNG1iSTh1U1E1UllGYkNDMXhCMWRYTGg0b3pra1hLeFEyWVFKaG1rQXV3bm1aR1RLQk5BL2c4OHdBQUtDUkZSSGdnL1A5ZU00T3JzN09ObzYyRGw4dDZyOEcveUppWXVQKzVjK3JjRUFBQU9GMGZ0SCtMQyt6R29BN0JvQnQvcUlsN2dSb1hndWdkZmVMWnJJUFFMVUFvT25hVi9OdytINDhQRVdoa0xuWjJlWGs1TmhLeEVKYlljcFhmZjVud2wvQVYvMXMrWDQ4L1BmMTRMN2lKSUV5WFlGSEJQamd3c3owVEtVY3o1SUpoR0xjNW85SC9MY0wvL3dkMHlMRVNXSzVXQ29VNDFFU2NZNUVtb3p6TXFVaWlVS1NLY1VsMHY5azR0OHMrd00rM3pVQXNHbytBWHVSTGFoZFl3UDJTeWNRV0hUQTR2Y0FBUEs3YjhIVUtBZ0RnR2lENGM5My8rOC8vVWVnSlFDQVprbVNjUUFBWGtRa0xsVEtzei9IQ0FBQVJLQ0JLckJCRy9UQkdDekFCaHpCQmR6QkMveGdOb1JDSk1UQ1FoQkNDbVNBSEhKZ0theUNRaWlHemJBZEttQXYxRUFkTk1CUmFJYVRjQTR1d2xXNERqMXdEL3BoQ0o3QktMeUJDUVJCeUFnVFlTSGFpQUZpaWxnampnZ1htWVg0SWNGSUJCS0xKQ0RKaUJSUklrdVJOVWd4VW9wVUlGVklIZkk5Y2dJNWgxeEd1cEU3eUFBeWd2eUd2RWN4bElHeVVUM1VETFZEdWFnM0dvUkdvZ3ZRWkhReG1vOFdvSnZRY3JRYVBZdzJvZWZRcTJnUDJvOCtROGN3d09nWUJ6UEViREF1eHNOQ3NUZ3NDWk5qeTdFaXJBeXJ4aHF3VnF3RHU0bjFZOCt4ZHdRU2dVWEFDVFlFZDBJZ1lSNUJTRmhNV0U3WVNLZ2dIQ1EwRWRvSk53a0RoRkhDSnlLVHFFdTBKcm9SK2NRWVlqSXhoMWhJTENQV0VvOFRMeEI3aUVQRU55UVNpVU15SjdtUUFrbXhwRlRTRXRKRzBtNVNJK2tzcVpzMFNCb2prOG5hWkd1eUJ6bVVMQ0FyeUlYa25lVEQ1RFBrRytRaDhsc0tuV0pBY2FUNFUrSW9Vc3BxU2hubEVPVTA1UVpsbURKQlZhT2FVdDJvb1ZRUk5ZOWFRcTJodGxLdlVZZW9FelIxbWpuTmd4WkpTNld0b3BYVEdtZ1hhUGRwcitoMHVoSGRsUjVPbDlCWDBzdnBSK2lYNkFQMGR3d05oaFdEeDRobktCbWJHQWNZWnhsM0dLK1lUS1laMDRzWngxUXdOekhybU9lWkQ1bHZWVmdxdGlwOEZaSEtDcFZLbFNhVkd5b3ZWS21xcHFyZXFndFY4MVhMVkkrcFhsTjlya1pWTTFQanFRblVscXRWcXAxUTYxTWJVMmVwTzZpSHFtZW9iMVEvcEg1Wi9Za0dXY05NdzA5RHBGR2dzVi9qdk1ZZ0MyTVpzM2dzSVdzTnE0WjFnVFhFSnJITjJYeDJLcnVZL1IyN2l6MnFxYUU1UXpOS00xZXpVdk9VWmo4SDQ1aHgrSngwVGdubktLZVg4MzZLM2hUdktlSXBHNlkwVExreFpWeHJxcGFYbGxpclNLdFJxMGZydlRhdTdhZWRwcjFGdTFuN2dRNUJ4MG9uWENkSFo0L09CWjNuVTlsVDNhY0tweFpOUFRyMXJpNnFhNlVib2J0RWQ3OXVwKzZZbnI1ZWdKNU1iNmZlZWIzbitoeDlMLzFVL1czNnAvVkhERmdHc3d3a0J0c016aGc4eFRWeGJ6d2RMOGZiOFZGRFhjTkFRNlZobFdHWDRZU1J1ZEU4bzlWR2pVWVBqR25HWE9NazQyM0diY2FqSmdZbUlTWkxUZXBON3BwU1RibW1LYVk3VER0TXg4M016YUxOMXBrMW16MHgxekxubStlYjE1dmZ0MkJhZUZvc3RxaTJ1R1ZKc3VSYXBsbnV0cnh1aFZvNVdhVllWVnBkczBhdG5hMGwxcnV0dTZjUnA3bE9rMDZybnRabnc3RHh0c20ycWJjWnNPWFlCdHV1dG0yMmZXRm5ZaGRudDhXdXcrNlR2Wk45dW4yTi9UMEhEWWZaRHFzZFdoMStjN1J5RkRwV090NmF6cHp1UDMzRjlKYnBMMmRZenhEUDJEUGp0aFBMS2NScG5WT2IwMGRuRjJlNWM0UHppSXVKUzRMTExwYytMcHNieHQzSXZlUktkUFZ4WGVGNjB2V2RtN09id3UybzI2L3VOdTVwN29mY244dzBueW1lV1ROejBNUElRK0JSNWRFL0M1K1ZNR3Zmckg1UFEwK0JaN1huSXk5akw1RlhyZGV3dDZWM3F2ZGg3eGMrOWo1eW4rTSs0enczM2pMZVdWL01OOEMzeUxmTFQ4TnZubCtGMzBOL0kvOWsvM3IvMFFDbmdDVUJad09KZ1VHQld3TDcrSHA4SWIrT1B6cmJaZmF5MmUxQmpLQzVRUlZCajRLdGd1WEJyU0ZveU95UXJTSDM1NWpPa2M1cERvVlFmdWpXMEFkaDVtR0x3MzRNSjRXSGhWZUdQNDV3aUZnYTBUR1hOWGZSM0VOejMwVDZSSlpFM3B0bk1VODVyeTFLTlNvK3FpNXFQTm8zdWpTNlA4WXVabG5NMVZpZFdFbHNTeHc1TGlxdU5tNXN2dC84N2ZPSDRwM2lDK043RjVndnlGMXdlYUhPd3ZTRnB4YXBMaElzT3BaQVRJaE9PSlR3UVJBcXFCYU1KZklUZHlXT0NubkNIY0puSWkvUk50R0kyRU5jS2g1TzhrZ3FUWHFTN0pHOE5Ya2t4VE9sTE9XNWhDZXBrTHhNRFV6ZG16cWVGcHAySUcweVBUcTlNWU9Ta1pCeFFxb2hUWk8yWitwbjVtWjJ5NnhsaGJMK3hXNkx0eThlbFFmSmE3T1FyQVZaTFFxMlFxYm9WRm9vMXlvSHNtZGxWMmEvelluS09aYXJuaXZON2N5enl0dVFONXp2bi8vdEVzSVM0WksycFlaTFZ5MGRXT2E5ckdvNXNqeHhlZHNLNHhVRks0WldCcXc4dUlxMkttM1ZUNnZ0VjVldWZyMG1lazFyZ1Y3QnlvTEJ0UUZyNnd0VkN1V0ZmZXZjMSsxZFQxZ3ZXZCsxWWZxR25ScytGWW1LcmhUYkY1Y1ZmOWdvM0hqbEc0ZHZ5citaM0pTMHFhdkV1V1RQWnRKbTZlYmVMWjViRHBhcWwrYVhEbTROMmRxMERkOVd0TzMxOWtYYkw1Zk5LTnU3ZzdaRHVhTy9QTGk4WmFmSnpzMDdQMVNrVlBSVStsUTI3dExkdFdIWCtHN1I3aHQ3dlBZMDdOWGJXN3ozL1Q3SnZ0dFZBVlZOMVdiVlpmdEorN1AzUDY2SnF1bjRsdnR0WGExT2JYSHR4d1BTQS8wSEl3NjIxN25VMVIzU1BWUlNqOVlyNjBjT3h4KysvcDN2ZHkwTk5nMVZqWnpHNGlOd1JIbms2ZmNKMy9jZURUcmFkb3g3ck9FSDB4OTJIV2NkTDJwQ212S2FScHRUbXZ0YllsdTZUOHcrMGRicTNucjhSOXNmRDV3MFBGbDVTdk5VeVduYTZZTFRrMmZ5ejR5ZGxaMTlmaTc1M0dEYm9yWjc1MlBPMzJvUGIrKzZFSFRoMGtYL2krYzd2RHZPWFBLNGRQS3kyK1VUVjdoWG1xODZYMjNxZE9vOC9wUFRUOGU3bkx1YXJybGNhN251ZXIyMWUyYjM2UnVlTjg3ZDlMMTU4UmIvMXRXZU9UM2R2Zk42Yi9mRjkvWGZGdDErY2lmOXpzdTcyWGNuN3EyOFQ3eGY5RUR0UWRsRDNZZlZQMXYrM05qdjNIOXF3SGVnODlIY1IvY0doWVBQL3BIMWp3OURCWStaajh1R0RZYnJuamcrT1RuaVAzTDk2ZnluUTg5a3p5YWVGLzZpL3N1dUZ4WXZmdmpWNjlmTzBaalJvWmZ5bDVPL2JYeWwvZXJBNnhtdjI4YkN4aDYreVhnek1WNzBWdnZ0d1hmY2R4M3ZvOThQVCtSOElIOG8vMmo1c2ZWVDBLZjdreG1Uay84RUE1anovR016TGRzQUFBQWdZMGhTVFFBQWVpVUFBSUNEQUFENS93QUFnT2tBQUhVd0FBRHFZQUFBT3BnQUFCZHZrbC9GUmdBQUFESkpSRUZVZU5wRXg3RU5nREFBQXpBckswSkE2ZjhYOW9ld2xjV1N0VTF3Qkdkd0IwOHdnamVZbTc5amMybmJZSDBEQUMvK0NPUkp4TzVmQUFBQUFFbEZUa1N1UW1DQyknXHJcbn0pXHJcblxyXG5BRlJBTUUudXRpbHMuUmF5Q3VydmUgPSBmdW5jdGlvbiAobnVtUG9pbnRzLCB3aWR0aCkge1xyXG4gIHRoaXMuZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQnVmZmVyR2VvbWV0cnkoKVxyXG4gIHRoaXMudmVydGljZXMgPSBuZXcgRmxvYXQzMkFycmF5KG51bVBvaW50cyAqIDMgKiA2KSAvLyA2IHZlcnRpY2VzICgyIHRyaWFuZ2xlcykgKiAzIGRpbWVuc2lvbnNcclxuICB0aGlzLnV2cyA9IG5ldyBGbG9hdDMyQXJyYXkobnVtUG9pbnRzICogMiAqIDYpIC8vIDIgdXZzIHBlciB2ZXJ0ZXhcclxuICB0aGlzLndpZHRoID0gd2lkdGhcclxuXHJcbiAgdGhpcy5nZW9tZXRyeS5zZXRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJywgbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZSh0aGlzLnZlcnRpY2VzLCAzKS5zZXRVc2FnZShUSFJFRS5EeW5hbWljRHJhd1VzYWdlKSlcclxuXHJcbiAgdGhpcy5tYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7XHJcbiAgICBzaWRlOiBUSFJFRS5Eb3VibGVTaWRlLFxyXG4gICAgY29sb3I6IDB4ZmYwMDAwXHJcbiAgfSlcclxuXHJcbiAgdGhpcy5tZXNoID0gbmV3IFRIUkVFLk1lc2godGhpcy5nZW9tZXRyeSwgdGhpcy5tYXRlcmlhbClcclxuXHJcbiAgdGhpcy5tZXNoLmZydXN0dW1DdWxsZWQgPSBmYWxzZVxyXG4gIHRoaXMubWVzaC52ZXJ0aWNlcyA9IHRoaXMudmVydGljZXNcclxuXHJcbiAgdGhpcy5kaXJlY3Rpb24gPSBuZXcgVEhSRUUuVmVjdG9yMygpXHJcbiAgdGhpcy5udW1Qb2ludHMgPSBudW1Qb2ludHNcclxufVxyXG5cclxuQUZSQU1FLnV0aWxzLlJheUN1cnZlLnByb3RvdHlwZSA9IHtcclxuICBzZXREaXJlY3Rpb246IGZ1bmN0aW9uIChkaXJlY3Rpb24pIHtcclxuICAgIGNvbnN0IFVQID0gbmV3IFRIUkVFLlZlY3RvcjMoMCwgMSwgMClcclxuICAgIHRoaXMuZGlyZWN0aW9uXHJcbiAgICAgIC5jb3B5KGRpcmVjdGlvbilcclxuICAgICAgLmNyb3NzKFVQKVxyXG4gICAgICAubm9ybWFsaXplKClcclxuICAgICAgLm11bHRpcGx5U2NhbGFyKHRoaXMud2lkdGggLyAyKVxyXG4gIH0sXHJcblxyXG4gIHNldFdpZHRoOiBmdW5jdGlvbiAod2lkdGgpIHtcclxuICAgIHRoaXMud2lkdGggPSB3aWR0aFxyXG4gIH0sXHJcblxyXG4gIHNldFBvaW50OiAoZnVuY3Rpb24gKCkge1xyXG4gICAgY29uc3QgcG9zQSA9IG5ldyBUSFJFRS5WZWN0b3IzKClcclxuICAgIGNvbnN0IHBvc0IgPSBuZXcgVEhSRUUuVmVjdG9yMygpXHJcbiAgICBjb25zdCBwb3NDID0gbmV3IFRIUkVFLlZlY3RvcjMoKVxyXG4gICAgY29uc3QgcG9zRCA9IG5ldyBUSFJFRS5WZWN0b3IzKClcclxuXHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKGksIGxhc3QsIG5leHQpIHtcclxuICAgICAgcG9zQS5jb3B5KGxhc3QpLmFkZCh0aGlzLmRpcmVjdGlvbilcclxuICAgICAgcG9zQi5jb3B5KGxhc3QpLnN1Yih0aGlzLmRpcmVjdGlvbilcclxuXHJcbiAgICAgIHBvc0MuY29weShuZXh0KS5hZGQodGhpcy5kaXJlY3Rpb24pXHJcbiAgICAgIHBvc0QuY29weShuZXh0KS5zdWIodGhpcy5kaXJlY3Rpb24pXHJcblxyXG4gICAgICBsZXQgaWR4ID0gNiAqIDMgKiBpIC8vIDYgdmVydGljZXMgcGVyIHBvaW50XHJcblxyXG4gICAgICB0aGlzLnZlcnRpY2VzW2lkeCsrXSA9IHBvc0EueFxyXG4gICAgICB0aGlzLnZlcnRpY2VzW2lkeCsrXSA9IHBvc0EueVxyXG4gICAgICB0aGlzLnZlcnRpY2VzW2lkeCsrXSA9IHBvc0EuelxyXG5cclxuICAgICAgdGhpcy52ZXJ0aWNlc1tpZHgrK10gPSBwb3NCLnhcclxuICAgICAgdGhpcy52ZXJ0aWNlc1tpZHgrK10gPSBwb3NCLnlcclxuICAgICAgdGhpcy52ZXJ0aWNlc1tpZHgrK10gPSBwb3NCLnpcclxuXHJcbiAgICAgIHRoaXMudmVydGljZXNbaWR4KytdID0gcG9zQy54XHJcbiAgICAgIHRoaXMudmVydGljZXNbaWR4KytdID0gcG9zQy55XHJcbiAgICAgIHRoaXMudmVydGljZXNbaWR4KytdID0gcG9zQy56XHJcblxyXG4gICAgICB0aGlzLnZlcnRpY2VzW2lkeCsrXSA9IHBvc0MueFxyXG4gICAgICB0aGlzLnZlcnRpY2VzW2lkeCsrXSA9IHBvc0MueVxyXG4gICAgICB0aGlzLnZlcnRpY2VzW2lkeCsrXSA9IHBvc0MuelxyXG5cclxuICAgICAgdGhpcy52ZXJ0aWNlc1tpZHgrK10gPSBwb3NCLnhcclxuICAgICAgdGhpcy52ZXJ0aWNlc1tpZHgrK10gPSBwb3NCLnlcclxuICAgICAgdGhpcy52ZXJ0aWNlc1tpZHgrK10gPSBwb3NCLnpcclxuXHJcbiAgICAgIHRoaXMudmVydGljZXNbaWR4KytdID0gcG9zRC54XHJcbiAgICAgIHRoaXMudmVydGljZXNbaWR4KytdID0gcG9zRC55XHJcbiAgICAgIHRoaXMudmVydGljZXNbaWR4KytdID0gcG9zRC56XHJcblxyXG4gICAgICB0aGlzLmdlb21ldHJ5LmF0dHJpYnV0ZXMucG9zaXRpb24ubmVlZHNVcGRhdGUgPSB0cnVlXHJcbiAgICB9XHJcbiAgfSkoKVxyXG59IiwiQUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KCdjdXJzb3ItbGlzdGVuZXInLCB7XHJcbiAgaW5pdDogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2dCA9PiB7XHJcbiAgICAgIGNvbnNvbGUubG9nKGV2dCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3RlbGVwb3J0JywgZXZ0ID0+IHtcclxuICAgICAgY29uc29sZS5sb2coJ3RlbGVwb3J0Jyk7XHJcbiAgICB9KTtcclxuICB9XHJcbn0pOyIsIkFGUkFNRS5yZWdpc3RlckNvbXBvbmVudCgnZGlzYWJsZS1pbi12cicsIHtcclxuICBtdWx0aXBsZTogdHJ1ZSxcclxuICBzY2hlbWE6IHtcclxuICAgIGNvbXBvbmVudDoge3R5cGU6ICdzdHJpbmcnLCBkZWZhdWx0OiAnJ30sXHJcbiAgfSxcclxuICBpbml0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLmhhbmRsZXIgPSAoKSA9PiB0aGlzLmRpc2FibGUoKTtcclxuICAgIGlmICh0aGlzLmVsLnNjZW5lRWwuaXMoJ3ZyLW1vZGUnKSkgdGhpcy5oYW5kbGVyKCk7XHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignZW50ZXItdnInLCB0aGlzLmhhbmRsZXIpO1xyXG4gICAgLy8gdG9kbzogcmUtZW5hYmxlIHRoZSBjb21wb25lbnQgd2hlbiBsZWF2aW5nIFZSXHJcbiAgfSxcclxuICBkaXNhYmxlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAoIXRoaXMuZWwuc2NlbmVFbC5pcygndnItbW9kZScpKSByZXR1cm47XHJcbiAgICB0aGlzLmVsLnJlbW92ZUF0dHJpYnV0ZSh0aGlzLmRhdGEuY29tcG9uZW50KTtcclxuICB9LFxyXG4gIHJlbW92ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2VudGVyLXZyJywgdGhpcy5oYW5kbGVyKTtcclxuICB9XHJcbn0pO1xyXG4iLCJBRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ2VtaXQtd2hlbi1uZWFyJywge1xyXG4gIG11bHRpcGxlOiB0cnVlLFxyXG4gIHNjaGVtYToge1xyXG4gICAgdGFyZ2V0OiB7dHlwZTogJ3NlbGVjdG9yJywgZGVmYXVsdDogJyNjYW1lcmEtcmlnJ30sXHJcbiAgICBkaXN0YW5jZToge3R5cGU6ICdudW1iZXInLCBkZWZhdWx0OiAxfSxcclxuICAgIGV2ZW50OiB7dHlwZTogJ3N0cmluZycsIGRlZmF1bHQ6ICdjbGljayd9LFxyXG4gICAgZXZlbnRGYXI6IHt0eXBlOiAnc3RyaW5nJywgZGVmYXVsdDogJ3VuY2xpY2snfSxcclxuICAgIHRocm90dGxlOiB7dHlwZTogJ251bWJlcicsIGRlZmF1bHQ6IDEwMH0sXHJcbiAgfSxcclxuICBpbml0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLnRpY2sgPSBBRlJBTUUudXRpbHMudGhyb3R0bGVUaWNrKHRoaXMuY2hlY2tEaXN0LCB0aGlzLmRhdGEudGhyb3R0bGUsIHRoaXMpO1xyXG4gICAgdGhpcy5lbWl0aW5nID0gZmFsc2U7XHJcbiAgfSxcclxuICBjaGVja0Rpc3Q6IGZ1bmN0aW9uICgpIHtcclxuICAgIGxldCBteVBvcyA9IG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApO1xyXG4gICAgbGV0IHRhcmdldFBvcyA9IG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApO1xyXG4gICAgdGhpcy5lbC5vYmplY3QzRC5nZXRXb3JsZFBvc2l0aW9uKG15UG9zKTtcclxuICAgIHRoaXMuZGF0YS50YXJnZXQub2JqZWN0M0QuZ2V0V29ybGRQb3NpdGlvbih0YXJnZXRQb3MpO1xyXG4gICAgY29uc3QgZGlzdGFuY2VUbyA9IG15UG9zLmRpc3RhbmNlVG8odGFyZ2V0UG9zKTtcclxuICAgIGlmIChkaXN0YW5jZVRvIDw9IHRoaXMuZGF0YS5kaXN0YW5jZSkge1xyXG4gICAgICBpZiAodGhpcy5lbWl0aW5nKSByZXR1cm47XHJcbiAgICAgIHRoaXMuZW1pdGluZyA9IHRydWU7XHJcbiAgICAgIHRoaXMuZWwuZW1pdCh0aGlzLmRhdGEuZXZlbnQsIHtjb2xsaWRpbmdFbnRpdHk6IHRoaXMuZGF0YS50YXJnZXR9LCBmYWxzZSk7XHJcbiAgICAgIHRoaXMuZGF0YS50YXJnZXQuZW1pdCh0aGlzLmRhdGEuZXZlbnQsIHtjb2xsaWRpbmdFbnRpdHk6IHRoaXMuZWx9LCBmYWxzZSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAoIXRoaXMuZW1pdGluZykgcmV0dXJuO1xyXG4gICAgICB0aGlzLmVsLmVtaXQodGhpcy5kYXRhLmV2ZW50RmFyLCB7Y29sbGlkaW5nRW50aXR5OiB0aGlzLmRhdGEudGFyZ2V0fSwgZmFsc2UpO1xyXG4gICAgICB0aGlzLmRhdGEudGFyZ2V0LmVtaXQodGhpcy5kYXRhLmV2ZW50RmFyLCB7Y29sbGlkaW5nRW50aXR5OiB0aGlzLmVsfSwgZmFsc2UpO1xyXG4gICAgICB0aGlzLmVtaXRpbmcgPSBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG4iLCJBRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ2hvdmVyLWhpZ2hsaWdodGVyJywge1xyXG4gIHNjaGVtYToge1xyXG4gICAgY29sb3I6IHt0eXBlOiAnY29sb3InLCBkZWZhdWx0OiAnd2hpdGUnfVxyXG4gIH0sXHJcbiAgaW5pdDogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5vbkVudGVyID0gdGhpcy5vbkVudGVyLmJpbmQodGhpcyk7XHJcbiAgICB0aGlzLm9uTGVhdmUgPSB0aGlzLm9uTGVhdmUuYmluZCh0aGlzKTtcclxuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsIHRoaXMub25FbnRlcik7XHJcbiAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCB0aGlzLm9uTGVhdmUpO1xyXG4gIH0sXHJcblxyXG4gIG9uRW50ZXI6IGZ1bmN0aW9uIChldnQpIHtcclxuICAgIGNvbnN0IGN1cnNvciA9IGV2dC5kZXRhaWwuY3Vyc29yRWw7XHJcbiAgICBjb25zdCBpc0xhc2VyID0gY3Vyc29yLmNvbXBvbmVudHNbJ2xhc2VyLWNvbnRyb2xzJ10gPyB0cnVlIDogZmFsc2U7XHJcblxyXG4gICAgaWYgKGlzTGFzZXIpIHtcclxuICAgICAgdGhpcy5zYXZlZENvbG9yID0gY3Vyc29yLmdldEF0dHJpYnV0ZSgncmF5Y2FzdGVyJykubGluZUNvbG9yO1xyXG4gICAgICBjdXJzb3Iuc2V0QXR0cmlidXRlKCdyYXljYXN0ZXInLCAnbGluZUNvbG9yJywgIHRoaXMuZGF0YS5jb2xvcik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnNhdmVkQ29sb3IgPSBjdXJzb3IuZ2V0QXR0cmlidXRlKCdtYXRlcmlhbCcpLmNvbG9yO1xyXG4gICAgICBjdXJzb3Iuc2V0QXR0cmlidXRlKCdtYXRlcmlhbCcsICdjb2xvcicsICB0aGlzLmRhdGEuY29sb3IpO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIG9uTGVhdmU6IGZ1bmN0aW9uIChldnQpIHtcclxuICAgIGNvbnN0IGN1cnNvciA9IGV2dC5kZXRhaWwuY3Vyc29yRWw7XHJcbiAgICBjb25zdCBpc0xhc2VyID0gY3Vyc29yLmNvbXBvbmVudHNbJ2xhc2VyLWNvbnRyb2xzJ10gPyB0cnVlIDogZmFsc2U7XHJcblxyXG4gICAgaWYgKGlzTGFzZXIpIHtcclxuICAgICAgY3Vyc29yLnNldEF0dHJpYnV0ZSgncmF5Y2FzdGVyJywgJ2xpbmVDb2xvcicsICB0aGlzLnNhdmVkQ29sb3IpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY3Vyc29yLnNldEF0dHJpYnV0ZSgnbWF0ZXJpYWwnLCAnY29sb3InLCAgdGhpcy5zYXZlZENvbG9yKTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICByZW1vdmU6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsIHRoaXMub25FbnRlcik7XHJcbiAgICB0aGlzLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCB0aGlzLm9uTGVhdmUpO1xyXG4gIH1cclxuXHJcbn0pOyIsIkFGUkFNRS5yZWdpc3RlclByaW1pdGl2ZSgnaW0tYm94Jywge1xyXG4gIGRlZmF1bHRDb21wb25lbnRzOiB7XHJcbiAgICAnaW1ib3gnOiB7fVxyXG4gIH0sXHJcbiAgbWFwcGluZ3M6IHtcclxuICAgIHNpemU6ICdpbWJveC5zaXplJyxcclxuICAgIGNvbG9yOiAnaW1ib3guY29sb3InLFxyXG4gIH1cclxufSk7XHJcblxyXG5BRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ2ltYm94Jywge1xyXG4gIHNjaGVtYToge1xyXG4gICAgc2l6ZToge3R5cGU6IFwibnVtYmVyXCIsIGRlZmF1bHQ6IDF9LFxyXG4gICAgY29sb3I6IHt0eXBlOiBcImNvbG9yXCIsIGRlZmF1bHQ6ICdibGFjayd9XHJcbiAgfSxcclxuICBpbml0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLmdlblZlcnRpY2VzKCk7XHJcbiAgICB0aGlzLmdlblNoYXBlKCk7XHJcbiAgICB0aGlzLmdlbkdlb21ldHJ5KCk7XHJcbiAgICB0aGlzLmdlbk1hdGVyaWFsKCk7XHJcbiAgICB0aGlzLmdlbk1lc2goKTtcclxuICB9LFxyXG4gIGdlblZlcnRpY2VzOiBmdW5jdGlvbiAgKCkge1xyXG4gICAgY29uc3QgaGFsZiA9IHRoaXMuZGF0YS5zaXplIC8yO1xyXG4gICAgdGhpcy52ZXJ0aWNlcyA9IFtdO1xyXG4gICAgdGhpcy52ZXJ0aWNlcy5wdXNoKG5ldyBUSFJFRS5WZWN0b3IyKC1oYWxmLCBoYWxmKSk7XHJcbiAgICB0aGlzLnZlcnRpY2VzLnB1c2gobmV3IFRIUkVFLlZlY3RvcjIoaGFsZiwgaGFsZikpO1xyXG4gICAgdGhpcy52ZXJ0aWNlcy5wdXNoKG5ldyBUSFJFRS5WZWN0b3IyKGhhbGYsIC1oYWxmKSk7XHJcbiAgICB0aGlzLnZlcnRpY2VzLnB1c2gobmV3IFRIUkVFLlZlY3RvcjIoLWhhbGYsIC1oYWxmKSk7XHJcbiAgfSxcclxuICBnZW5TaGFwZTogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5zaGFwZSA9IG5ldyBUSFJFRS5TaGFwZSgpO1xyXG5cclxuICAgIGNvbnN0IGhnID0gdGhpcy52ZXJ0aWNlc1swXTtcclxuICAgIHRoaXMuc2hhcGUubW92ZVRvKGhnLngsIGhnLnkpO1xyXG5cclxuICAgIGNvbnN0IGhkID0gdGhpcy52ZXJ0aWNlc1sxXTtcclxuICAgIHRoaXMuc2hhcGUubGluZVRvKGhkLngsIGhkLnkpO1xyXG5cclxuICAgIGNvbnN0IGJkID0gdGhpcy52ZXJ0aWNlc1syXTtcclxuICAgIHRoaXMuc2hhcGUubGluZVRvKGJkLngsIGJkLnkpO1xyXG5cclxuICAgIGNvbnN0IGJsID0gdGhpcy52ZXJ0aWNlc1szXTtcclxuICAgIHRoaXMuc2hhcGUubGluZVRvKGJsLngsIGJsLnkpO1xyXG5cclxuICAgIHRoaXMuc2hhcGUubGluZVRvKGhnLngsIGhnLnkpO1xyXG5cclxuXHJcblxyXG4gIH0sXHJcblxyXG4gIGdlbkdlb21ldHJ5OiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgY29uc3QgZXh0cnVkZVNldHRpbmdzID0ge1xyXG4gICAgICBzdGVwczogMSxcclxuICAgICAgZGVwdGg6IHRoaXMuZGF0YS5zaXplLFxyXG4gICAgICBiZXZlbEVuYWJsZWQ6IGZhbHNlLFxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLmdlb21ldHJ5ID0gbmV3IFRIUkVFLkV4dHJ1ZGVHZW9tZXRyeSggdGhpcy5zaGFwZSwgZXh0cnVkZVNldHRpbmdzICk7XHJcbiAgfSxcclxuXHJcbiAgZ2VuTWF0ZXJpYWw6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMubWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaExhbWJlcnRNYXRlcmlhbCh7XHJcbiAgICAgICBjb2xvcjogbmV3IFRIUkVFLkNvbG9yKHRoaXMuZGF0YS5jb2xvcilcclxuICAgIH0gKTtcclxuICB9LFxyXG5cclxuICBnZW5NZXNoOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLm1lc2ggPSBuZXcgVEhSRUUuTWVzaCggdGhpcy5nZW9tZXRyeSwgdGhpcy5tYXRlcmlhbCApIDtcclxuICAgIHRoaXMuZWwuc2V0T2JqZWN0M0QoJ21lc2gnLCB0aGlzLm1lc2gpO1xyXG4gIH1cclxuXHJcbn0pXHJcbiIsIkFGUkFNRS5yZWdpc3RlckNvbXBvbmVudCgnbGlzdGVuLXRvJywge1xyXG4gIG11bHRpcGxlOiB0cnVlLFxyXG4gIHNjaGVtYToge1xyXG4gICAgZXZ0OiB7dHlwZTogJ3N0cmluZycsIGRlZmF1bHQ6ICdjbGljayd9LFxyXG4gICAgdGFyZ2V0OiB7dHlwZTogJ3NlbGVjdG9yJ30sXHJcbiAgICBlbWl0OiB7dHlwZTogJ3N0cmluZyd9XHJcbiAgfSxcclxuICBpbml0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLmRhdGEudGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIodGhpcy5kYXRhLmV2dCwgZXZ0ID0+IHtcclxuICAgICAgdGhpcy5lbC5lbWl0KHRoaXMuZGF0YS5lbWl0KTtcclxuICAgIH0pXHJcbiAgfVxyXG59KTsiLCJBRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ29uLWV2ZW50LXNldCcsIHtcclxuICBtdWx0aXBsZTogdHJ1ZSxcclxuXHJcbiAgc2NoZW1hOiB7XHJcbiAgICBldmVudDoge3R5cGU6ICdzdHJpbmcnLCBkZWZhdWx0OiAnY2xpY2snfSxcclxuICAgIGF0dHJpYnV0ZToge3R5cGU6ICdzdHJpbmcnfSxcclxuICAgIHZhbHVlOiB7dHlwZTogJ3N0cmluZyd9XHJcbiAgfSxcclxuXHJcbiAgaW5pdDogZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLl9vbkV2ZW50ID0gdGhpcy5fb25FdmVudC5iaW5kKHRoaXMpO1xyXG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKHRoaXMuZGF0YS5ldmVudCwgdGhpcy5fb25FdmVudCk7XHJcbiAgfSxcclxuXHJcbiAgcmVtb3ZlOiBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcih0aGlzLmRhdGEuZXZlbnQsIHRoaXMuX29uRXZlbnQpO1xyXG4gIH0sXHJcblxyXG4gIF9vbkV2ZW50OiBmdW5jdGlvbihldnQpIHtcclxuICAgIEFGUkFNRS51dGlscy5lbnRpdHkuc2V0Q29tcG9uZW50UHJvcGVydHkodGhpcy5lbCwgdGhpcy5kYXRhLmF0dHJpYnV0ZSwgdGhpcy5kYXRhLnZhbHVlKTtcclxuICB9XHJcblxyXG59KTsiLCIvLyBmcm9tIEFkYVJvc2VDYW5vbiB4ci1ib2lsZXJwbGF0ZSBodHRwczovL2dpdGh1Yi5jb20vQWRhUm9zZUNhbm5vbi9hZnJhbWUteHItYm9pbGVycGxhdGVcclxuQUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KCdzaW1wbGUtbmF2bWVzaC1jb25zdHJhaW50Jywge1xyXG4gIHNjaGVtYToge1xyXG4gICAgbmF2bWVzaDoge1xyXG4gICAgICBkZWZhdWx0OiAnJ1xyXG4gICAgfSxcclxuICAgIGZhbGw6IHtcclxuICAgICAgZGVmYXVsdDogMC41XHJcbiAgICB9LFxyXG4gICAgaGVpZ2h0OiB7XHJcbiAgICAgIGRlZmF1bHQ6IDEuNlxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMubGFzdFBvc2l0aW9uID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcclxuICAgIHRoaXMuZWwub2JqZWN0M0QuZ2V0V29ybGRQb3NpdGlvbih0aGlzLmxhc3RQb3NpdGlvbik7XHJcbiAgfSxcclxuXHJcbiAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICBjb25zdCBlbHMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5kYXRhLm5hdm1lc2gpKTtcclxuICAgIGlmIChlbHMgPT09IG51bGwpIHtcclxuICAgICAgY29uc29sZS53YXJuKCduYXZtZXNoLXBoeXNpY3M6IERpZCBub3QgbWF0Y2ggYW55IGVsZW1lbnRzJyk7XHJcbiAgICAgIHRoaXMub2JqZWN0cyA9IFtdO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5vYmplY3RzID0gZWxzLm1hcChlbCA9PiBlbC5vYmplY3QzRCk7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgdGljazogKGZ1bmN0aW9uICgpIHtcclxuICAgIGNvbnN0IG5leHRQb3NpdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XHJcbiAgICBjb25zdCB0ZW1wVmVjID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcclxuICAgIGNvbnN0IHNjYW5QYXR0ZXJuID0gW1xyXG4gICAgICBbMCwxXSwgLy8gRGVmYXVsdCB0aGUgbmV4dCBsb2NhdGlvblxyXG4gICAgICBbMzAsMC40XSwgLy8gQSBsaXR0bGUgdG8gdGhlIHNpZGUgc2hvcnRlciByYW5nZVxyXG4gICAgICBbLTMwLDAuNF0sIC8vIEEgbGl0dGxlIHRvIHRoZSBzaWRlIHNob3J0ZXIgcmFuZ2VcclxuICAgICAgWzYwLDAuMl0sIC8vIE1vZGVyYXRlbHkgdG8gdGhlIHNpZGUgc2hvcnQgcmFuZ2VcclxuICAgICAgWy02MCwwLjJdLCAvLyBNb2RlcmF0ZWx5IHRvIHRoZSBzaWRlIHNob3J0IHJhbmdlXHJcbiAgICAgIFs4MCwwLjA2XSwgLy8gUGVycGVuZGljdWxhciB2ZXJ5IHNob3J0IHJhbmdlXHJcbiAgICAgIFstODAsMC4wNl0sIC8vIFBlcnBlbmRpY3VsYXIgdmVyeSBzaG9ydCByYW5nZVxyXG4gICAgXTtcclxuICAgIGNvbnN0IGRvd24gPSBuZXcgVEhSRUUuVmVjdG9yMygwLC0xLDApO1xyXG4gICAgY29uc3QgcmF5Y2FzdGVyID0gbmV3IFRIUkVFLlJheWNhc3RlcigpO1xyXG4gICAgY29uc3QgZ3Jhdml0eSA9IC0xO1xyXG4gICAgY29uc3QgbWF4WVZlbG9jaXR5ID0gMC41O1xyXG4gICAgY29uc3QgcmVzdWx0cyA9IFtdO1xyXG4gICAgbGV0IHlWZWwgPSAwO1xyXG5cclxuICAgIHJldHVybiBmdW5jdGlvbiAodGltZSwgZGVsdGEpIHtcclxuICAgICAgY29uc3QgZWwgPSB0aGlzLmVsO1xyXG4gICAgICBpZiAodGhpcy5vYmplY3RzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xyXG5cclxuICAgICAgdGhpcy5lbC5vYmplY3QzRC5nZXRXb3JsZFBvc2l0aW9uKG5leHRQb3NpdGlvbik7XHJcbiAgICAgIGlmIChuZXh0UG9zaXRpb24uZGlzdGFuY2VUbyh0aGlzLmxhc3RQb3NpdGlvbikgPT09IDApIHJldHVybjtcclxuXHJcbiAgICAgIGxldCBkaWRIaXQgPSBmYWxzZTtcclxuXHJcbiAgICAgIC8vIFNvIHRoYXQgaXQgZG9lcyBub3QgZ2V0IHN0dWNrIGl0IHRha2VzIGFzIGZldyBzYW1wbGVzIGFyb3VuZCB0aGUgdXNlciBhbmQgZmluZHMgdGhlIG1vc3QgYXBwcm9wcmlhdGVcclxuICAgICAgZm9yIChjb25zdCBbYW5nbGUsIGRpc3RhbmNlXSBvZiBzY2FuUGF0dGVybikge1xyXG4gICAgICAgIHRlbXBWZWMuc3ViVmVjdG9ycyhuZXh0UG9zaXRpb24sIHRoaXMubGFzdFBvc2l0aW9uKTtcclxuICAgICAgICB0ZW1wVmVjLmFwcGx5QXhpc0FuZ2xlKGRvd24sIGFuZ2xlKk1hdGguUEkvMTgwKTtcclxuICAgICAgICB0ZW1wVmVjLm11bHRpcGx5U2NhbGFyKGRpc3RhbmNlKTtcclxuICAgICAgICB0ZW1wVmVjLmFkZCh0aGlzLmxhc3RQb3NpdGlvbik7XHJcbiAgICAgICAgdGVtcFZlYy55ICs9IG1heFlWZWxvY2l0eTtcclxuICAgICAgICB0ZW1wVmVjLnkgLT0gdGhpcy5kYXRhLmhlaWdodDtcclxuICAgICAgICByYXljYXN0ZXIuc2V0KHRlbXBWZWMsIGRvd24pO1xyXG4gICAgICAgIHJheWNhc3Rlci5mYXIgPSB0aGlzLmRhdGEuZmFsbCA+IDAgPyB0aGlzLmRhdGEuZmFsbCArIG1heFlWZWxvY2l0eSA6IEluZmluaXR5O1xyXG4gICAgICAgIHJheWNhc3Rlci5pbnRlcnNlY3RPYmplY3RzKHRoaXMub2JqZWN0cywgdHJ1ZSwgcmVzdWx0cyk7XHJcbiAgICAgICAgaWYgKHJlc3VsdHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICBjb25zdCBoaXRQb3MgPSByZXN1bHRzWzBdLnBvaW50O1xyXG4gICAgICAgICAgaGl0UG9zLnkgKz0gdGhpcy5kYXRhLmhlaWdodDtcclxuICAgICAgICAgIGlmIChuZXh0UG9zaXRpb24ueSAtIChoaXRQb3MueSAtIHlWZWwqMikgPiAwLjAxKSB7XHJcbiAgICAgICAgICAgIHlWZWwgKz0gTWF0aC5tYXgoZ3Jhdml0eSAqIGRlbHRhICogMC4wMDEsIC1tYXhZVmVsb2NpdHkpO1xyXG4gICAgICAgICAgICBoaXRQb3MueSA9IG5leHRQb3NpdGlvbi55ICsgeVZlbDtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHlWZWwgPSAwO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWwub2JqZWN0M0QucG9zaXRpb24uY29weShoaXRQb3MpO1xyXG4gICAgICAgICAgdGhpcy5lbC5vYmplY3QzRC5wYXJlbnQud29ybGRUb0xvY2FsKHRoaXMuZWwub2JqZWN0M0QucG9zaXRpb24pO1xyXG4gICAgICAgICAgdGhpcy5sYXN0UG9zaXRpb24uY29weShoaXRQb3MpO1xyXG4gICAgICAgICAgcmVzdWx0cy5zcGxpY2UoMCk7XHJcbiAgICAgICAgICBkaWRIaXQgPSB0cnVlO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIWRpZEhpdCkge1xyXG4gICAgICAgIHRoaXMuZWwub2JqZWN0M0QucG9zaXRpb24uY29weSh0aGlzLmxhc3RQb3NpdGlvbik7XHJcbiAgICAgICAgdGhpcy5lbC5vYmplY3QzRC5wYXJlbnQud29ybGRUb0xvY2FsKHRoaXMuZWwub2JqZWN0M0QucG9zaXRpb24pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSgpKVxyXG59KTtcclxuIiwiQUZSQU1FLnJlZ2lzdGVyQ29tcG9uZW50KCd0b2dnbGUtZXZlbnRzJywge1xyXG4gIG11bHRpcGxlOiB0cnVlLFxyXG4gIHNjaGVtYToge1xyXG4gICAgc291cmNlRXZ0OiB7dHlwZTogJ3N0cmluZycsIGRlZmF1bHQ6ICdjbGljayd9LFxyXG4gICAgZXZ0MToge3R5cGU6ICdzdHJpbmcnfSxcclxuICAgIGV2dDI6IHt0eXBlOiAnc3RyaW5nJ31cclxuICB9LFxyXG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuc3RhdGUgPSAwO1xyXG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKHRoaXMuZGF0YS5zb3VyY2VFdnQsIGV2dCA9PiB7XHJcbiAgICAgIGlmICh0aGlzLnN0YXRlID09IDApIHtcclxuICAgICAgICB0aGlzLmVsLmVtaXQodGhpcy5kYXRhLmV2dDEsIHt9LCBmYWxzZSk7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IDE7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5lbC5lbWl0KHRoaXMuZGF0YS5ldnQyLCB7fSwgZmFsc2UpO1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSAwO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcbn0pOyIsInZhciBtYXAgPSB7XG5cdFwiLi9hLW9jZWFuLmpzXCI6IFwiLi9zcmMvY29tcG9uZW50cy9hLW9jZWFuLmpzXCIsXG5cdFwiLi9hbmltYXRlLXJvdGF0aW9uLmpzXCI6IFwiLi9zcmMvY29tcG9uZW50cy9hbmltYXRlLXJvdGF0aW9uLmpzXCIsXG5cdFwiLi9ibGluay1jb250cm9scy5qc1wiOiBcIi4vc3JjL2NvbXBvbmVudHMvYmxpbmstY29udHJvbHMuanNcIixcblx0XCIuL2N1cnNvci1saXN0ZW5lci5qc1wiOiBcIi4vc3JjL2NvbXBvbmVudHMvY3Vyc29yLWxpc3RlbmVyLmpzXCIsXG5cdFwiLi9kaXNhYmxlLWluLXZyLmpzXCI6IFwiLi9zcmMvY29tcG9uZW50cy9kaXNhYmxlLWluLXZyLmpzXCIsXG5cdFwiLi9lbWl0LXdoZW4tbmVhci5qc1wiOiBcIi4vc3JjL2NvbXBvbmVudHMvZW1pdC13aGVuLW5lYXIuanNcIixcblx0XCIuL2hvdmVyLWhpZ2hsaWdodGVyLmpzXCI6IFwiLi9zcmMvY29tcG9uZW50cy9ob3Zlci1oaWdobGlnaHRlci5qc1wiLFxuXHRcIi4vaW0tYm94LmpzXCI6IFwiLi9zcmMvY29tcG9uZW50cy9pbS1ib3guanNcIixcblx0XCIuL2xpc3Rlbi10by5qc1wiOiBcIi4vc3JjL2NvbXBvbmVudHMvbGlzdGVuLXRvLmpzXCIsXG5cdFwiLi9vbi1ldmVudC1zZXQuanNcIjogXCIuL3NyYy9jb21wb25lbnRzL29uLWV2ZW50LXNldC5qc1wiLFxuXHRcIi4vc2ltcGxlLW5hdm1lc2gtY29uc3RyYWludC5qc1wiOiBcIi4vc3JjL2NvbXBvbmVudHMvc2ltcGxlLW5hdm1lc2gtY29uc3RyYWludC5qc1wiLFxuXHRcIi4vdG9nZ2xlLWV2ZW50cy5qc1wiOiBcIi4vc3JjL2NvbXBvbmVudHMvdG9nZ2xlLWV2ZW50cy5qc1wiLFxuXHRcImNvbXBvbmVudHMvYS1vY2Vhbi5qc1wiOiBcIi4vc3JjL2NvbXBvbmVudHMvYS1vY2Vhbi5qc1wiLFxuXHRcImNvbXBvbmVudHMvYW5pbWF0ZS1yb3RhdGlvbi5qc1wiOiBcIi4vc3JjL2NvbXBvbmVudHMvYW5pbWF0ZS1yb3RhdGlvbi5qc1wiLFxuXHRcImNvbXBvbmVudHMvYmxpbmstY29udHJvbHMuanNcIjogXCIuL3NyYy9jb21wb25lbnRzL2JsaW5rLWNvbnRyb2xzLmpzXCIsXG5cdFwiY29tcG9uZW50cy9jdXJzb3ItbGlzdGVuZXIuanNcIjogXCIuL3NyYy9jb21wb25lbnRzL2N1cnNvci1saXN0ZW5lci5qc1wiLFxuXHRcImNvbXBvbmVudHMvZGlzYWJsZS1pbi12ci5qc1wiOiBcIi4vc3JjL2NvbXBvbmVudHMvZGlzYWJsZS1pbi12ci5qc1wiLFxuXHRcImNvbXBvbmVudHMvZW1pdC13aGVuLW5lYXIuanNcIjogXCIuL3NyYy9jb21wb25lbnRzL2VtaXQtd2hlbi1uZWFyLmpzXCIsXG5cdFwiY29tcG9uZW50cy9ob3Zlci1oaWdobGlnaHRlci5qc1wiOiBcIi4vc3JjL2NvbXBvbmVudHMvaG92ZXItaGlnaGxpZ2h0ZXIuanNcIixcblx0XCJjb21wb25lbnRzL2ltLWJveC5qc1wiOiBcIi4vc3JjL2NvbXBvbmVudHMvaW0tYm94LmpzXCIsXG5cdFwiY29tcG9uZW50cy9saXN0ZW4tdG8uanNcIjogXCIuL3NyYy9jb21wb25lbnRzL2xpc3Rlbi10by5qc1wiLFxuXHRcImNvbXBvbmVudHMvb24tZXZlbnQtc2V0LmpzXCI6IFwiLi9zcmMvY29tcG9uZW50cy9vbi1ldmVudC1zZXQuanNcIixcblx0XCJjb21wb25lbnRzL3NpbXBsZS1uYXZtZXNoLWNvbnN0cmFpbnQuanNcIjogXCIuL3NyYy9jb21wb25lbnRzL3NpbXBsZS1uYXZtZXNoLWNvbnN0cmFpbnQuanNcIixcblx0XCJjb21wb25lbnRzL3RvZ2dsZS1ldmVudHMuanNcIjogXCIuL3NyYy9jb21wb25lbnRzL3RvZ2dsZS1ldmVudHMuanNcIlxufTtcblxuXG5mdW5jdGlvbiB3ZWJwYWNrQ29udGV4dChyZXEpIHtcblx0dmFyIGlkID0gd2VicGFja0NvbnRleHRSZXNvbHZlKHJlcSk7XG5cdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKGlkKTtcbn1cbmZ1bmN0aW9uIHdlYnBhY2tDb250ZXh0UmVzb2x2ZShyZXEpIHtcblx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhtYXAsIHJlcSkpIHtcblx0XHR2YXIgZSA9IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIgKyByZXEgKyBcIidcIik7XG5cdFx0ZS5jb2RlID0gJ01PRFVMRV9OT1RfRk9VTkQnO1xuXHRcdHRocm93IGU7XG5cdH1cblx0cmV0dXJuIG1hcFtyZXFdO1xufVxud2VicGFja0NvbnRleHQua2V5cyA9IGZ1bmN0aW9uIHdlYnBhY2tDb250ZXh0S2V5cygpIHtcblx0cmV0dXJuIE9iamVjdC5rZXlzKG1hcCk7XG59O1xud2VicGFja0NvbnRleHQucmVzb2x2ZSA9IHdlYnBhY2tDb250ZXh0UmVzb2x2ZTtcbm1vZHVsZS5leHBvcnRzID0gd2VicGFja0NvbnRleHQ7XG53ZWJwYWNrQ29udGV4dC5pZCA9IFwiLi9zcmMvY29tcG9uZW50cyBzeW5jIFxcXFwuanMkXCI7IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCJcclxuZnVuY3Rpb24gaW1wb3J0QWxsKHIpIHtcclxuICByLmtleXMoKS5mb3JFYWNoKHIpO1xyXG59XHJcblxyXG5pbXBvcnRBbGwocmVxdWlyZS5jb250ZXh0KCcuL2NvbXBvbmVudHMnLCBmYWxzZSwgL1xcLmpzJC8pKTsiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=