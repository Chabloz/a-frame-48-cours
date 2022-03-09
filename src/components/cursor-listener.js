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