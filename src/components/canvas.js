import $ from 'jquery'

export default class View {
  constructor(props) {
    Object.assign(this, {
      container: '#timebar',
      width: $(window).width(),
      height: $(window).height()
    }, props)
    this.ratio = window.devicePixelRatio; // 设备像素比
    this.createCanvas()
    this._resize()
    return {
      canvas: this.canvas,
      ctx: this.ctx,
      $html: this.$html
    }
  }
  createCanvas() {
    this.$html = $(document.createElement('div'))
    this.$html.attr('class', 'dls-timebar-box')
    this.canvas = document.createElement('canvas');
    this.canvas.setAttribute('id', 'timebar')
    // this.$html.append(document.createElement('p'))
    this.$html.append(this.canvas)

    this.ctx = this.canvas.getContext('2d');
    $(this.container).append(this.$html[0]);
  }
  _resize() {
    this.canvas.width = this.$html.width() * this.ratio;
    this.canvas.height = this.$html.height() * this.ratio;
    this.centerPx = this.$html.width() / 2;
    this.centerHeight = this.$html.height() / 2;
    this.canvas.style.transformOrigin = '0 0'
    this.canvas.style.transform = `scale(${1 / this.ratio, 1 / this.ratio})`;
  }
}