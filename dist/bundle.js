(()=>{var t,e={710:()=>{AFRAME.registerPrimitive("a-ocean",{defaultComponents:{ocean:{},rotation:{x:-90,y:0,z:0}},mappings:{width:"ocean.width",depth:"ocean.depth",density:"ocean.density",amplitude:"ocean.amplitude",amplitudeVariance:"ocean.amplitudeVariance",speed:"ocean.speed",speedVariance:"ocean.speedVariance",color:"ocean.color",opacity:"ocean.opacity"}}),AFRAME.registerComponent("ocean",{schema:{width:{default:10,min:0},depth:{default:10,min:0},density:{default:10},amplitude:{default:.1},amplitudeVariance:{default:.3},speed:{default:1},speedVariance:{default:2},color:{default:"#7AD2F7",type:"color"},opacity:{default:.8}},play:function(){console.log("p");const t=this.el,e=this.data;let i=t.components.material,n=new THREE.PlaneGeometry(e.width,e.depth,e.density,e.density);n=THREE.BufferGeometryUtils.mergeVertices(n),this.waves=[];for(let t,i=0,s=n.attributes.position.count;i<s;i++)t=n.attributes.position,this.waves.push({z:t.getZ(i),ang:Math.random()*Math.PI*2,amp:e.amplitude+Math.random()*e.amplitudeVariance,speed:(e.speed+Math.random()*e.speedVariance)/1e3});i||(i={},i.material=new THREE.MeshPhongMaterial({color:e.color,transparent:e.opacity<1,opacity:e.opacity,flatShading:!0})),this.mesh=new THREE.Mesh(n,i.material),t.setObject3D("mesh",this.mesh)},remove:function(){this.el.removeObject3D("mesh")},tick:function(t,e){if(!e)return;const i=this.mesh.geometry.attributes.position.array;for(let t=0,n=2;t<this.waves.length;t++,n+=3){const s=this.waves[t];i[n]=s.z+Math.sin(s.ang)*s.amp,s.ang+=s.speed*e}this.mesh.geometry.attributes.position.needsUpdate=!0}})},441:()=>{AFRAME.registerComponent("animate-rotation",{multiple:!0,schema:{speed:{type:"number",default:10},axe:{type:"string",default:"x"}},init:function(){},remove:function(){},update:function(){},tick:function(t,e){this.el.object3D.rotation[this.data.axe]=THREE.MathUtils.degToRad(t/this.data.speed)}})},135:()=>{if(AFRAME.registerGeometry("prism",{schema:{depth:{default:1,min:0},height:{default:1,min:0},width:{default:1,min:0}},init:function(t){const e=new THREE.Shape;e.moveTo(t.width/2,0),e.lineTo(0,t.height),e.lineTo(-t.width/2,0),e.lineTo(t.width/2,0);const i={steps:2,depth:t.depth,bevelEnabled:!1};this.geometry=new THREE.ExtrudeGeometry(e,i)}}),"undefined"==typeof AFRAME)throw new Error("Component attempted to register before AFRAME was available.");AFRAME.registerComponent("blink-controls",{schema:{button:{default:"",oneOf:["trackpad","trigger","grip","menu","thumbstick"]},startEvents:{type:"array",default:[]},endEvents:{type:"array",default:[]},collisionEntities:{default:""},hitEntity:{type:"selector"},cameraRig:{type:"selector",default:"#player"},teleportOrigin:{type:"selector",default:"#camera"},hitCylinderColor:{type:"color",default:"#4d93fd"},hitCylinderRadius:{default:.25,min:0},hitCylinderHeight:{default:.3,min:0},interval:{default:0},curveNumberPoints:{default:60,min:2},curveLineWidth:{default:.025},curveHitColor:{type:"color",default:"#4d93fd"},curveMissColor:{type:"color",default:"#ff0000"},curveShootingSpeed:{default:10,min:0},defaultPlaneSize:{default:100},landingNormal:{type:"vec3",default:{x:0,y:1,z:0}},landingMaxAngle:{default:"45",min:0,max:360},drawIncrementally:{default:!0},incrementalDrawMs:{default:300},missOpacity:{default:.8},hitOpacity:{default:.8},snapTurn:{default:!0},rotateOnTeleport:{default:!0}},init:function(){const t=this.data,e=this.el;let i;this.active=!1,this.obj=e.object3D,this.controllerPosition=new THREE.Vector3,this.hitEntityQuaternion=new THREE.Quaternion,this.teleportOriginQuaternion=new THREE.Quaternion,this.hitPoint=new THREE.Vector3,this.collisionObjectNormalMatrix=new THREE.Matrix3,this.collisionWorldNormal=new THREE.Vector3,this.rigWorldPosition=new THREE.Vector3,this.newRigWorldPosition=new THREE.Vector3,this.teleportEventDetail={oldPosition:this.rigWorldPosition,newPosition:this.newRigWorldPosition,hitPoint:this.hitPoint,rotationQuaternion:this.hitEntityQuaternion},this.hit=!1,this.prevCheckTime=void 0,this.referenceNormal=new THREE.Vector3,this.curveMissColor=new THREE.Color,this.curveHitColor=new THREE.Color,this.raycaster=new THREE.Raycaster,this.defaultPlane=this.createDefaultPlane(this.data.defaultPlaneSize),this.defaultCollisionMeshes=[this.defaultPlane];const n=this.teleportEntity=document.createElement("a-entity");if(n.classList.add("teleportRay"),n.setAttribute("visible",!1),e.sceneEl.appendChild(this.teleportEntity),this.onButtonDown=this.onButtonDown.bind(this),this.onButtonUp=this.onButtonUp.bind(this),this.handleThumbstickAxis=this.handleThumbstickAxis.bind(this),this.teleportOrigin=this.data.teleportOrigin,this.cameraRig=this.data.cameraRig,this.snapturnRotation=THREE.MathUtils.degToRad(45),this.canSnapturn=!0,this.data.startEvents.length&&this.data.endEvents.length){for(i=0;i<this.data.startEvents.length;i++)e.addEventListener(this.data.startEvents[i],this.onButtonDown);for(i=0;i<this.data.endEvents.length;i++)e.addEventListener(this.data.endEvents[i],this.onButtonUp)}else t.button?(e.addEventListener(t.button+"down",this.onButtonDown),e.addEventListener(t.button+"up",this.onButtonUp)):this.thumbstickAxisActivation=!0;e.addEventListener("thumbstickmoved",this.handleThumbstickAxis),this.queryCollisionEntities()},handleSnapturn:function(t,e){e<.5&&(this.canSnapturn=!0),this.canSnapturn&&e>.95&&(Math.abs(t-Math.PI/2)<.6?(this.cameraRig.object3D.rotateY(+this.snapturnRotation),this.canSnapturn=!1):Math.abs(t-1.5*Math.PI)<.6&&(this.cameraRig.object3D.rotateY(-this.snapturnRotation),this.canSnapturn=!1))},handleThumbstickAxis:function(t){if(void 0!==t.detail.x&&void 0!==t.detail.y){const e=Math.atan2(t.detail.x,t.detail.y)+Math.PI,i=Math.sqrt(t.detail.x**2+t.detail.y**2);this.active?(i>.95&&(this.obj.getWorldPosition(this.controllerPosition),this.controllerPosition.setComponent(1,this.hitEntity.object3D.position.y),this.hitEntity.object3D.visible=!1,this.hitEntity.object3D.lookAt(this.controllerPosition),this.hitEntity.object3D.rotateY(e),this.hitEntity.object3D.visible=!0,this.hitEntity.object3D.getWorldQuaternion(this.hitEntityQuaternion)),0===Math.abs(t.detail.x)&&0===Math.abs(t.detail.y)&&this.onButtonUp()):this.thumbstickAxisActivation&&i>.95&&(e<.5||e>5.78)?this.onButtonDown():this.data.snapTurn&&this.handleSnapturn(e,i)}},update:function(t){const e=this.data,i=AFRAME.utils.diff(e,t);this.referenceNormal.copy(e.landingNormal),this.curveMissColor.set(e.curveMissColor),this.curveHitColor.set(e.curveHitColor),(!this.line||"curveLineWidth"in i||"curveNumberPoints"in i||"type"in i)&&(this.line=this.createLine(e),this.line.material.opacity=this.data.hitOpacity,this.line.material.transparent=this.data.hitOpacity<1,this.numActivePoints=e.curveNumberPoints,this.teleportEntity.setObject3D("mesh",this.line.mesh)),e.hitEntity?this.hitEntity=e.hitEntity:(!this.hitEntity||"hitCylinderColor"in i||"hitCylinderHeight"in i||"hitCylinderRadius"in i)&&(this.hitEntity&&this.hitEntity.parentNode.removeChild(this.hitEntity),this.hitEntity=this.createHitEntity(e),this.el.sceneEl.appendChild(this.hitEntity)),this.hitEntity.setAttribute("visible",!1),e.hitEntity||this.hitEntity.lastElementChild.setAttribute("visible",e.rotateOnTeleport),"collisionEntities"in i&&this.queryCollisionEntities()},remove:function(){const t=this.el,e=this.hitEntity,i=this.teleportEntity;e&&e.parentNode.removeChild(e),i&&i.parentNode.removeChild(i),t.sceneEl.removeEventListener("child-attached",this.childAttachHandler),t.sceneEl.removeEventListener("child-detached",this.childDetachHandler)},tick:function(){const t=new THREE.Vector3,e=new THREE.Vector3,i=new THREE.Vector3(0,-9.8,0),n=new THREE.Vector3,s=new THREE.Vector3,o=new THREE.Quaternion,r=new THREE.Vector3,a=new THREE.Vector3,h=new THREE.Vector3,l=new THREE.Vector3,c=new THREE.Vector3;let d=0;return function(u,m){if(!this.active)return;if(this.data.drawIncrementally&&this.redrawLine&&(this.redrawLine=!1,d=0),d+=m,this.numActivePoints=this.data.curveNumberPoints*d/this.data.incrementalDrawMs,this.numActivePoints>this.data.curveNumberPoints&&(this.numActivePoints=this.data.curveNumberPoints),this.prevCheckTime&&u-this.prevCheckTime<this.data.interval)return;this.prevCheckTime=u,this.obj.matrixWorld.decompose(r,o,a);const p=h.set(0,0,-1).applyQuaternion(o).normalize();this.line.setDirection(c.copy(p)),this.obj.getWorldPosition(t),s.copy(t),this.teleportEntity.setAttribute("visible",!0),d<this.data.incrementalDrawMs?this.line.material.color.set(this.curveHitColor):this.line.material.color.set(this.curveMissColor),this.line.material.opacity=this.data.missOpacity,this.line.material.transparent=this.data.missOpacity<1,this.hitEntity.setAttribute("visible",!1),this.hit=!1,e.copy(p).multiplyScalar(this.data.curveShootingSpeed),this.lastDrawnIndex=0;const E=this.data.drawIncrementally?this.numActivePoints:this.line.numPoints;for(let o=0;o<E+1;o++){let r;r=o===Math.floor(E+1)?E/(this.line.numPoints-1):o/(this.line.numPoints-1);const a=this.parabolicCurveMaxRoot(t,e,i);r*=Math.max(1,1.5*a),this.parabolicCurve(t,e,i,r,n);const h=l.copy(n).sub(s).normalize();if(this.raycaster.far=h.length(),this.raycaster.set(s,h),this.lastDrawnPoint=n,this.lastDrawnIndex=o,this.checkMeshCollisions(o,s,n))break;s.copy(n)}for(let t=this.lastDrawnIndex+1;t<this.line.numPoints;t++)this.line.setPoint(t,this.lastDrawnPoint,this.lastDrawnPoint)}}(),queryCollisionEntities:function(){const t=this.data,e=this.el;if(!t.collisionEntities)return void(this.collisionEntities=[]);const i=[].slice.call(e.sceneEl.querySelectorAll(t.collisionEntities));this.collisionEntities=i,this.childAttachHandler=function(e){e.detail.el.matches(t.collisionEntities)&&i.push(e.detail.el)},e.sceneEl.addEventListener("child-attached",this.childAttachHandler),this.childDetachHandler=function(e){if(!e.detail.el.matches(t.collisionEntities))return;const n=i.indexOf(e.detail.el);-1!==n&&i.splice(n,1)},e.sceneEl.addEventListener("child-detached",this.childDetachHandler)},onButtonDown:function(){this.active=!0,this.redrawLine=!0},onButtonUp:function(){const t=new THREE.Vector3,e=[new THREE.Vector3,new THREE.Vector3],i=new THREE.Vector3;return function(n){if(!this.active)return;if(this.active=!1,this.hitEntity.setAttribute("visible",!1),this.teleportEntity.setAttribute("visible",!1),!this.hit)return;const s=this.data.cameraRig||this.el.sceneEl.camera.el;if(s.object3D.getWorldPosition(this.rigWorldPosition),this.newRigWorldPosition.copy(this.hitPoint),t.copy(this.newRigWorldPosition),s.object3D.parent&&s.object3D.parent.worldToLocal(t),s.setAttribute("position",t),this.data.rotateOnTeleport&&(this.teleportOriginQuaternion.setFromEuler(new THREE.Euler(0,this.teleportOrigin.object3D.rotation.y,0)),this.teleportOriginQuaternion.invert(),this.teleportOriginQuaternion.multiply(this.hitEntityQuaternion),this.cameraRig.object3D.setRotationFromQuaternion(this.teleportOriginQuaternion)),!this.data.cameraRig){const t=document.querySelectorAll("a-entity[tracked-controls]");for(let n=0;n<t.length;n++)t[n].object3D.getWorldPosition(i),e[n].copy(this.newRigWorldPosition).sub(this.rigWorldPosition).add(i),t[n].setAttribute("position",e[n])}this.el.emit("teleported",this.teleportEventDetail)}}(),checkMeshCollisions:function(t,e,i){let n;this.data.collisionEntities?(n=this.collisionEntities.map((function(t){return t.getObject3D("mesh")})).filter((function(t){return t})),n=n.length?n:this.defaultCollisionMeshes):n=this.defaultCollisionMeshes;const s=this.raycaster.intersectObjects(n,!0);if(s.length>0&&!this.hit&&this.isValidNormalsAngle(s[0].face.normal,s[0].object)){const i=s[0].point;this.line.material.color.set(this.curveHitColor),this.line.material.opacity=this.data.hitOpacity,this.line.material.transparent=this.data.hitOpacity<1,this.hitEntity.setAttribute("position",i),this.hitEntity.setAttribute("visible",!0),this.hit=!0,this.hitPoint.copy(s[0].point);for(let i=t;i<this.line.numPoints;i++)this.line.setPoint(i,e,this.hitPoint);return!0}return this.line.setPoint(t,e,i),!1},isValidNormalsAngle:function(t,e){this.collisionObjectNormalMatrix.getNormalMatrix(e.matrixWorld),this.collisionWorldNormal.copy(t).applyMatrix3(this.collisionObjectNormalMatrix).normalize();const i=this.referenceNormal.angleTo(this.collisionWorldNormal);return THREE.Math.RAD2DEG*i<=this.data.landingMaxAngle},parabolicCurveScalar:function(t,e,i,n){return t+e*n+.5*i*n*n},parabolicCurve:function(t,e,i,n,s){return s.x=this.parabolicCurveScalar(t.x,e.x,i.x,n),s.y=this.parabolicCurveScalar(t.y,e.y,i.y,n),s.z=this.parabolicCurveScalar(t.z,e.z,i.z,n),s},parabolicCurveMaxRoot:function(t,e,i){return(-e.y-Math.sqrt(e.y**2-.5*i.y*4*t.y))/(1*i.y)},createLine:function(t){const e="line"===t.type?2:t.curveNumberPoints;return new AFRAME.utils.RayCurve(e,t.curveLineWidth)},createHitEntity:function(t){const e=document.createElement("a-entity");e.className="hitEntity";const i=document.createElement("a-entity");i.setAttribute("geometry",{primitive:"torus",radius:t.hitCylinderRadius,radiusTubular:.01}),i.setAttribute("rotation",{x:90,y:0,z:0}),i.setAttribute("material",{shader:"flat",color:t.hitCylinderColor,side:"double",depthTest:!1}),e.appendChild(i);const n=document.createElement("a-entity");n.setAttribute("position",{x:0,y:t.hitCylinderHeight/2,z:0}),n.setAttribute("geometry",{primitive:"cylinder",segmentsHeight:1,radius:t.hitCylinderRadius,height:t.hitCylinderHeight,openEnded:!0}),n.setAttribute("material",{shader:"flat",color:t.hitCylinderColor,opacity:.5,side:"double",src:this.cylinderTexture,transparent:!0,depthTest:!1}),e.appendChild(n);const s=document.createElement("a-entity");return s.setAttribute("position",{x:0,y:.05,z:-1.5*t.hitCylinderRadius}),s.setAttribute("rotation",{x:90,y:180,z:0}),s.setAttribute("geometry",{primitive:"prism",height:.2,width:.2,depth:.05}),s.setAttribute("material",{shader:"flat",color:t.hitCylinderColor,side:"double",transparent:!0,opacity:.6,depthTest:!1}),e.appendChild(s),e},createDefaultPlane:function(t){const e=new THREE.PlaneBufferGeometry(100,100);e.rotateX(-Math.PI/2);const i=new THREE.MeshBasicMaterial({color:16776960});return new THREE.Mesh(e,i)},cylinderTexture:"url(data:image/png;base64,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)"}),AFRAME.utils.RayCurve=function(t,e){this.geometry=new THREE.BufferGeometry,this.vertices=new Float32Array(3*t*6),this.uvs=new Float32Array(2*t*6),this.width=e,this.geometry.setAttribute("position",new THREE.BufferAttribute(this.vertices,3).setUsage(THREE.DynamicDrawUsage)),this.material=new THREE.MeshBasicMaterial({side:THREE.DoubleSide,color:16711680}),this.mesh=new THREE.Mesh(this.geometry,this.material),this.mesh.frustumCulled=!1,this.mesh.vertices=this.vertices,this.direction=new THREE.Vector3,this.numPoints=t},AFRAME.utils.RayCurve.prototype={setDirection:function(t){const e=new THREE.Vector3(0,1,0);this.direction.copy(t).cross(e).normalize().multiplyScalar(this.width/2)},setWidth:function(t){this.width=t},setPoint:function(){const t=new THREE.Vector3,e=new THREE.Vector3,i=new THREE.Vector3,n=new THREE.Vector3;return function(s,o,r){t.copy(o).add(this.direction),e.copy(o).sub(this.direction),i.copy(r).add(this.direction),n.copy(r).sub(this.direction);let a=18*s;this.vertices[a++]=t.x,this.vertices[a++]=t.y,this.vertices[a++]=t.z,this.vertices[a++]=e.x,this.vertices[a++]=e.y,this.vertices[a++]=e.z,this.vertices[a++]=i.x,this.vertices[a++]=i.y,this.vertices[a++]=i.z,this.vertices[a++]=i.x,this.vertices[a++]=i.y,this.vertices[a++]=i.z,this.vertices[a++]=e.x,this.vertices[a++]=e.y,this.vertices[a++]=e.z,this.vertices[a++]=n.x,this.vertices[a++]=n.y,this.vertices[a++]=n.z,this.geometry.attributes.position.needsUpdate=!0}}()}},868:()=>{AFRAME.registerComponent("cursor-listener",{init:function(){this.el.addEventListener("click",(t=>{console.log(t)})),this.el.addEventListener("teleport",(t=>{console.log("teleport")}))}})},584:()=>{AFRAME.registerComponent("disable-in-vr",{multiple:!0,schema:{component:{type:"string",default:""}},init:function(){this.handler=()=>this.disable(),this.el.sceneEl.is("vr-mode")&&this.handler(),window.addEventListener("enter-vr",this.handler)},disable:function(){this.el.sceneEl.is("vr-mode")&&this.el.removeAttribute(this.data.component)},remove:function(){window.removeEventListener("enter-vr",this.handler)}})},827:()=>{AFRAME.registerComponent("emit-when-near",{multiple:!0,schema:{target:{type:"selector",default:"#camera-rig"},distance:{type:"number",default:1},event:{type:"string",default:"click"},eventFar:{type:"string",default:"unclick"},throttle:{type:"number",default:100}},init:function(){this.tick=AFRAME.utils.throttleTick(this.checkDist,this.data.throttle,this),this.emiting=!1},checkDist:function(){let t=new THREE.Vector3(0,0,0),e=new THREE.Vector3(0,0,0);if(this.el.object3D.getWorldPosition(t),this.data.target.object3D.getWorldPosition(e),t.distanceTo(e)<=this.data.distance){if(this.emiting)return;this.emiting=!0,this.el.emit(this.data.event,{collidingEntity:this.data.target},!1),this.data.target.emit(this.data.event,{collidingEntity:this.el},!1)}else{if(!this.emiting)return;this.el.emit(this.data.eventFar,{collidingEntity:this.data.target},!1),this.data.target.emit(this.data.eventFar,{collidingEntity:this.el},!1),this.emiting=!1}}})},687:()=>{AFRAME.registerComponent("hover-highlighter",{schema:{color:{type:"color",default:"white"}},init:function(){this.onEnter=this.onEnter.bind(this),this.onLeave=this.onLeave.bind(this),this.el.addEventListener("mouseenter",this.onEnter),this.el.addEventListener("mouseleave",this.onLeave)},onEnter:function(t){const e=t.detail.cursorEl;e.components["laser-controls"]?(this.savedColor=e.getAttribute("raycaster").lineColor,e.setAttribute("raycaster","lineColor",this.data.color)):(this.savedColor=e.getAttribute("material").color,e.setAttribute("material","color",this.data.color))},onLeave:function(t){const e=t.detail.cursorEl;e.components["laser-controls"]?e.setAttribute("raycaster","lineColor",this.savedColor):e.setAttribute("material","color",this.savedColor)},remove:function(){this.el.removeEventListener("mouseenter",this.onEnter),this.el.removeEventListener("mouseleave",this.onLeave)}})},428:()=>{AFRAME.registerPrimitive("im-box",{defaultComponents:{imbox:{}},mappings:{size:"imbox.size",color:"imbox.color"}}),AFRAME.registerComponent("imbox",{schema:{size:{type:"number",default:1},color:{type:"color",default:"black"}},init:function(){this.genVertices(),this.genShape(),this.genGeometry(),this.genMaterial(),this.genMesh()},genVertices:function(){const t=this.data.size/2;this.vertices=[],this.vertices.push(new THREE.Vector2(-t,t)),this.vertices.push(new THREE.Vector2(t,t)),this.vertices.push(new THREE.Vector2(t,-t)),this.vertices.push(new THREE.Vector2(-t,-t))},genShape:function(){this.shape=new THREE.Shape;const t=this.vertices[0];this.shape.moveTo(t.x,t.y);const e=this.vertices[1];this.shape.lineTo(e.x,e.y);const i=this.vertices[2];this.shape.lineTo(i.x,i.y);const n=this.vertices[3];this.shape.lineTo(n.x,n.y),this.shape.lineTo(t.x,t.y)},genGeometry:function(){const t={steps:1,depth:this.data.size,bevelEnabled:!1};this.geometry=new THREE.ExtrudeGeometry(this.shape,t)},genMaterial:function(){this.material=new THREE.MeshLambertMaterial({color:new THREE.Color(this.data.color)})},genMesh:function(){this.mesh=new THREE.Mesh(this.geometry,this.material),this.el.setObject3D("mesh",this.mesh)}})},444:()=>{AFRAME.registerComponent("life-like-automaton",{schema:{resolution:{type:"int",default:1024},birthRule:{type:"array",default:[3]},survivalRule:{type:"array",default:[2,3]},maxGen:{type:"int",default:1/0},probAlive:{type:"number",default:.5},genPerSec:{type:"int",default:60}},init:function(){this.generation=0,this.birthRule=new Set(this.data.birthRule.map((t=>+t))),this.survivalRule=new Set(this.data.survivalRule.map((t=>+t))),this.grid=new Uint8Array(this.data.resolution*this.data.resolution);for(let t=0;t<this.grid.length;t++)this.grid[t]=Math.random()<this.data.probAlive?1:0;this.texture=new THREE.DataTexture(this.grid,this.data.resolution,this.data.resolution),this.texture.format=THREE.RedFormat,this.texture.needsUpdate=!0,this.material=this.el.getObject3D("mesh").material=new THREE.ShaderMaterial({uniforms:{tex:{value:this.texture},time:{value:0},resolution:{value:this.resolution}},vertexShader:"\n        varying vec2 vUv;\n\n        void main() {\n          vUv = uv;\n          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n        }\n      ",fragmentShader:"\n        varying vec2 vUv;\n        uniform sampler2D tex;\n        uniform float time;\n\n        vec3 hsb2rgb(in vec3 c) {\n          vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);\n          rgb = rgb * rgb * (3.0 - 2.0 * rgb);\n          return c.z * mix(vec3(1.0), rgb, c.y);\n        }\n\n        void main() {\n          vec4 data = texture2D(tex, vUv);\n          vec2 toCenter = vec2(0.5) - vUv;\n          float radius = length(toCenter);\n\n          vec3 color = hsb2rgb(vec3(abs(cos(time / 8000.)), radius, 1.));\n          color *= vec3(data.r * 255.);\n          gl_FragColor = vec4(color, 1.0);\n        }\n      "}),this.material.side=THREE.BackSide,this.tick=AFRAME.utils.throttleTick(this.nextGen,1e3/this.data.genPerSec,this)},nextGen:function(t){if(this.generation++,this.generation>this.data.maxGen)return;const e=[];for(let t=0;t<this.grid.length;t++){let i=0;i+=this.grid[t+1]??0,i+=this.grid[t-1]??0,i+=this.grid[t+this.data.resolution]??0,i+=this.grid[t+this.data.resolution+1]??0,i+=this.grid[t+this.data.resolution-1]??0,i+=this.grid[t-this.data.resolution]??0,i+=this.grid[t-this.data.resolution+1]??0,i+=this.grid[t-this.data.resolution-1]??0,(!this.grid[t]&&this.birthRule.has(i)||this.grid[t]&&!this.survivalRule.has(i))&&e.push(t)}for(const t of e)this.grid[t]=this.grid[t]?0:1;this.material.uniforms.time.value=t,this.texture.needsUpdate=!0}})},963:()=>{AFRAME.registerComponent("listen-to",{multiple:!0,schema:{evt:{type:"string",default:"click"},target:{type:"selector"},emit:{type:"string"}},init:function(){this.data.target.addEventListener(this.data.evt,(t=>{this.el.emit(this.data.emit)}))}})},413:()=>{AFRAME.registerComponent("my-mat",{schema:{},init:function(){console.log("init"),this.material=this.el.getObject3D("mesh").material=new THREE.ShaderMaterial({uniforms:{time:{value:1}},vertexShader:"\n        uniform float time;\n\n        void main() {\n          vec3 newPosition = position * vec3(abs(cos(time/1000.)));\n          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);\n        }\n      ",fragmentShader:"\n        uniform float time;\n\n        void main() {\n          gl_FragColor = vec4(abs(cos(time/1000.)), abs(sin(time/1000.)), 0. , 1.0);\n        }\n      "})},tick:function(t){this.material.uniforms.time.value=t}})},120:()=>{AFRAME.registerComponent("on-event-set",{multiple:!0,schema:{event:{type:"string",default:"click"},attribute:{type:"string"},value:{type:"string"}},init:function(){this._onEvent=this._onEvent.bind(this),this.el.addEventListener(this.data.event,this._onEvent)},remove:function(){this.el.removeEventListener(this.data.event,this._onEvent)},_onEvent:function(t){AFRAME.utils.entity.setComponentProperty(this.el,this.data.attribute,this.data.value)}})},13:()=>{AFRAME.registerComponent("simple-navmesh-constraint",{schema:{navmesh:{default:""},fall:{default:.5},height:{default:1.6}},init:function(){this.lastPosition=new THREE.Vector3,this.el.object3D.getWorldPosition(this.lastPosition)},update:function(){const t=Array.from(document.querySelectorAll(this.data.navmesh));null===t?(console.warn("navmesh-physics: Did not match any elements"),this.objects=[]):this.objects=t.map((t=>t.object3D))},tick:function(){const t=new THREE.Vector3,e=new THREE.Vector3,i=[[0,1],[30,.4],[-30,.4],[60,.2],[-60,.2],[80,.06],[-80,.06]],n=new THREE.Vector3(0,-1,0),s=new THREE.Raycaster,o=[];let r=0;return function(a,h){const l=this.el;if(0===this.objects.length)return;if(this.el.object3D.getWorldPosition(t),0===t.distanceTo(this.lastPosition))return;let c=!1;for(const[a,d]of i)if(e.subVectors(t,this.lastPosition),e.applyAxisAngle(n,a*Math.PI/180),e.multiplyScalar(d),e.add(this.lastPosition),e.y+=.5,e.y-=this.data.height,s.set(e,n),s.far=this.data.fall>0?this.data.fall+.5:1/0,s.intersectObjects(this.objects,!0,o),o.length){const e=o[0].point;e.y+=this.data.height,t.y-(e.y-2*r)>.01?(r+=Math.max(-1*h*.001,-.5),e.y=t.y+r):r=0,l.object3D.position.copy(e),this.el.object3D.parent.worldToLocal(this.el.object3D.position),this.lastPosition.copy(e),o.splice(0),c=!0;break}c||(this.el.object3D.position.copy(this.lastPosition),this.el.object3D.parent.worldToLocal(this.el.object3D.position))}}()})},733:()=>{AFRAME.registerComponent("toggle-events",{multiple:!0,schema:{sourceEvt:{type:"string",default:"click"},evt1:{type:"string"},evt2:{type:"string"}},init:function(){this.state=0,this.el.addEventListener(this.data.sourceEvt,(t=>{0==this.state?(this.el.emit(this.data.evt1,{},!1),this.state=1):(this.el.emit(this.data.evt2,{},!1),this.state=0)}))}})},66:(t,e,i)=>{var n={"./a-ocean.js":710,"./animate-rotation.js":441,"./blink-controls.js":135,"./cursor-listener.js":868,"./disable-in-vr.js":584,"./emit-when-near.js":827,"./hover-highlighter.js":687,"./im-box.js":428,"./life-like-automaton.js":444,"./listen-to.js":963,"./my-mat.js":413,"./on-event-set.js":120,"./simple-navmesh-constraint.js":13,"./toggle-events.js":733,"components/a-ocean.js":710,"components/animate-rotation.js":441,"components/blink-controls.js":135,"components/cursor-listener.js":868,"components/disable-in-vr.js":584,"components/emit-when-near.js":827,"components/hover-highlighter.js":687,"components/im-box.js":428,"components/life-like-automaton.js":444,"components/listen-to.js":963,"components/my-mat.js":413,"components/on-event-set.js":120,"components/simple-navmesh-constraint.js":13,"components/toggle-events.js":733};function s(t){var e=o(t);return i(e)}function o(t){if(!i.o(n,t)){var e=new Error("Cannot find module '"+t+"'");throw e.code="MODULE_NOT_FOUND",e}return n[t]}s.keys=function(){return Object.keys(n)},s.resolve=o,t.exports=s,s.id=66}},i={};function n(t){var s=i[t];if(void 0!==s)return s.exports;var o=i[t]={exports:{}};return e[t](o,o.exports,n),o.exports}n.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),(t=n(66)).keys().forEach(t)})();