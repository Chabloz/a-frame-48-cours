AFRAME.registerComponent('my-mat', {

  schema: {

  },

  init: function () {
    console.log('init');

    this.material = this.el.getObject3D('mesh').material = new THREE.ShaderMaterial({

      uniforms: {
        time: {value: 1.0}
      },

      vertexShader: `
        uniform float time;

        void main() {
          vec3 newPosition = position * vec3(abs(cos(time/1000.)));
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
      `,

      fragmentShader: `
        uniform float time;

        void main() {
          gl_FragColor = vec4(abs(cos(time/1000.)), abs(sin(time/1000.)), 0. , 1.0);
        }
      `

    });
  },

  tick: function(elapsedT) {
    this.material.uniforms.time.value = elapsedT;
  }

});