export default class Timebar {
  constructor(props) {
    Object.assign(this, {
      minYear: -5000,
      maxYear: 2500,
      container: document.body,
      unitTime: 10,
      unitWidth: 8,
      zoomSpeed: 0.5,
      draggable: true,
      mousePos: {
        x: 0,
        y: 0
      },
      translate: {
        x: 0,
        y: 0
      }
    }, props)

    this.radio = window.devicePixelRatio

    this.initialUnitTime = this.unitTime
    this.initialUnitWidth = this.unitWidth

    this.totalTime = this.maxYear - this.minYear


    this.createCanvas()
    this._resize()
    this._bind()
  }

  createCanvas() {

    this.canvas = document.createElement('canvas')

    this.ctx = this.canvas.getContext('2d')

    this.container.appendChild(this.canvas)
  }
  _resize() {

    this.$html = $(window)

    // 2倍于设备宽高，避免出现模糊
    this.canvas.width = this.$html.width() * this.radio
    this.canvas.height = this.$html.height() * this.radio

    this.canvas.style.transformOrigin = '0 0'
    this.canvas.style.transform = `scale(${1 / this.radio, 1 / this.radio})`

  }
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.save()
    this.ctx.scale(this.radio, this.radio)
    this.ctx.translate(this.translate.x, this.translate.y)
    this.drawUnit()
    this.ctx.restore();
  }
  drawUnit() {
    this.ctx.strokeStyle = '#CAD2D6';
    this.ctx.fillStyle = '#999999';
    let loneLineCounter = 0;
  }
  _setTranslate(y) {
    this.translate.y = y
  }
  _mousedown(e) {
    this.isMousedown = true;
    this.mousedownPos = {
      x: this.mousePos.x,
      y: this.mousePos.y
    };
    // 保存拖拽进度
    this.downTranslate = {
      ...this.translate
    };
  }
  _mousemove(e) {
    this.mousePos.x = e.clientX;
    this.mousePos.y = e.clientY;

    if (this.isMousedown) {
      if (!this.draggable) {
        return
      }

      let deltaY = this.mousePos.y - this.mousedownPos.y

      let newY = this.downTranslate.y + deltaY

      console.log(newY)

      this._setTranslate(newY)
    }
  }
  _mouseup(e) {
    this.isMousedown = false;
  }
  _bind() {

    $(window).on('mousemove', this._mousemove.bind(this))

    let mouseEventDom = $(window)

    mouseEventDom.on('mousedown', this._mousedown.bind(this))
    mouseEventDom.on('mouseup', this._mouseup.bind(this))

  }
}