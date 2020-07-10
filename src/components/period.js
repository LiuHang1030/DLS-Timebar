require('../utils/canvasUtil')
const TEXT_MARGIN = 6
const LINE_STEP = 20


export default class Period {
  constructor(props) {
    Object.assign(this, {
      x: 0,
      y: 0,
      canvas: null,
      ctx: null,
      $html: null,
      periodName: '',
      startYear: undefined,
      endYear: undefined,
      origin: 'EAST' // EAST OR WEST
    }, props)
    this.createPeriod()
  }
  createPeriod() {
    // 分期由横线和文字组成
    this.drawLine(this.x, this.y)
    this.drawText(this.periodName, this.x, this.y)
  }
  drawLine(x, y) {
    const x2 = this.origin == 'EAST' ? x - LINE_STEP : x + LINE_STEP
    this.ctx.beginPath();
    this.ctx.moveTo(x, y)
    this.ctx.lineTo(x2, y)
    this.ctx.closePath()
    this.ctx.lineWidth = 1
    this.ctx.strokeStyle = '#4DECC0'
    this.ctx.stroke()
  }
  drawText(text, x, y) {
    const x2 = this.origin == 'EAST' ? x - TEXT_MARGIN : x + TEXT_MARGIN
    this.ctx.font = '12px sans-serif';
    this.ctx.strokeStyle = '#FFFFFF'
    this.ctx.textAlign = this.origin === 'EAST' ? 'right' : 'left';
    this.ctx.textBaseline = 'top';
    this.ctx.fillTextVertical(text, x2, y + TEXT_MARGIN);
  }
}