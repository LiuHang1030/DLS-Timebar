export default class dot {
  constructor(props) {
    Object.assign(this, {
      $html: this.$html,
      canvas: null,
      ctx: null,
      x: 0,
      y: 0,
      size: 12.5,
      background: '#AE295B'
    }, props)


    this.centerPx = this.$html.width() / 2
    this.createDot()
  }
  createDot() {

  }
}