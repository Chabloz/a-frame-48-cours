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