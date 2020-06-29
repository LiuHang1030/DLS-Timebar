import Timebar from '../src/index.js'


export default class Philtimebar {
  constructor(props) {
    Object.assign(this, {
      container: document.body
    }, props)
    this.createTimebar()
    // this.createAvatar()
    // this.createController()
    // this._bind()
  }

  createTimebar() {
    this.ruler = new Timebar({
      onRender: e => {

      }
    })
  }
  createAvatar() {
    const scene = new Scene({
      container: this.container,
      width: $(window).width(),
      height: $(window).height(),
    });
    const test = new Sprite();
    test.attr({
      anchor: 0.5,

      bgcolor: '#f4f2e6',
      borderRadius: 120,
    });
    const bglayer = scene.layer('bg', {
      handleEvent: false,
    });

    bglayer.append(test);
  }
}
