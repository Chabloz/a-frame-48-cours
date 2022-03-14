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
