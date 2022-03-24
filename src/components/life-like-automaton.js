AFRAME.registerComponent('life-like-automaton', {

  schema: {
    resolution: {type: 'int', default: 1024},
    birthRule: {type: 'array', default: [3]},
    survivalRule: {type: 'array', default: [2, 3]},
    maxGen: {type: 'int', default: Infinity},
    probAlive: {type: 'number', default: 0.5},
    genPerSec: {type: 'int', default: 60},
  },

  init: function () {
    this.generation = 0;
    this.birthRule = new Set(this.data.birthRule.map(n => +n));
    this.survivalRule = new Set(this.data.survivalRule.map(n => +n));

    // Build of the initial grid of the GoL automaton (data saved on the red channel)
    this.grid = new Uint8Array(this.data.resolution * this.data.resolution);
    for (let i = 0; i < this.grid.length; i++) {
      this.grid[i] = Math.random() < this.data.probAlive ? 1 : 0;
    }

    this.texture = new THREE.DataTexture(this.grid, this.data.resolution, this.data.resolution);
    this.texture.format = THREE.RedFormat;
    this.texture.needsUpdate = true;

    this.material = this.el.getObject3D('mesh').material = new THREE.ShaderMaterial({

      uniforms: {
        tex: {value: this.texture},
        time: {value: 0},
        resolution: {value: this.resolution}
      },

      vertexShader: `
        varying vec2 vUv;

        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,

      fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D tex;
        uniform float time;

        vec3 hsb2rgb(in vec3 c) {
          vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
          rgb = rgb * rgb * (3.0 - 2.0 * rgb);
          return c.z * mix(vec3(1.0), rgb, c.y);
        }

        void main() {
          vec4 data = texture2D(tex, vUv);
          vec2 toCenter = vec2(0.5) - vUv;
          float radius = length(toCenter);

          vec3 color = hsb2rgb(vec3(abs(cos(time / 8000.)), radius, 1.));
          color *= vec3(data.r * 255.);
          gl_FragColor = vec4(color, 1.0);
        }
      `

    });
    this.material.side = THREE.BackSide;

    this.tick = AFRAME.utils.throttleTick(this.nextGen, 1000/this.data.genPerSec, this);

  },

  nextGen: function (elapsedT) {
    this.generation++;
    if (this.generation > this.data.maxGen) return;

    const toSwitch = [];
    for (let i = 0; i < this.grid.length; i++) {
      let n = 0;
      n += this.grid[i + 1] ?? 0;
      n += this.grid[i - 1] ?? 0;
      n += this.grid[i + this.data.resolution] ?? 0;
      n += this.grid[i + this.data.resolution + 1] ?? 0;
      n += this.grid[i + this.data.resolution - 1] ?? 0;
      n += this.grid[i - this.data.resolution] ?? 0;
      n += this.grid[i - this.data.resolution + 1] ?? 0;
      n += this.grid[i - this.data.resolution - 1] ?? 0;
      if ((!this.grid[i] && this.birthRule.has(n)) || (this.grid[i] && !this.survivalRule.has(n))) {
        toSwitch.push(i);
      }
    }
    for (const i of toSwitch) {
      this.grid[i] = this.grid[i] ? 0 : 1;
    }
    this.material.uniforms.time.value = elapsedT;
    this.texture.needsUpdate = true;
  }

});