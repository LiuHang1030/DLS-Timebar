export default class dot {
  constructor(props) {
    Object.assign(this, {
      $html: this.$html,
      canvas: null,
      ctx: null,
      x: 0,
      y: 0,
      zoom: 0,
      nowZoom: 0,
      size: 6,
    }, props)


    this.centerPx = this.$html.width() / 2
    this.x = this.centerPx
    /**
     * 0.3 = 1.7a + b
     * 1 = zoom * a + b
     * 
     * 求解a, b
     */
    this.alpha = (0.7 * this.nowZoom + 0.3 * this.zoom - 1.7) / (this.zoom - 1.7)
    this.createDot()
  }
  createDot() {
    this.drawCircle(this.x, this.y)
  }
  drawCircle(x, y) {
    this.ctx.beginPath();
    this.ctx.fillStyle = `rgba(174,41,91,${this.alpha})`
    this.ctx.arc(x, y, this.size, 0, Math.PI * 2, false);
    this.ctx.fill();
    this.ctx.closePath();
  }
}