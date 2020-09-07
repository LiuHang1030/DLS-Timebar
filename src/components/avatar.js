import { TweenLite } from "gsap";


export default class Avatar {
  constructor(props) {
    Object.assign(this, {
      $html: this.$html,
      canvas: null,
      ctx: null,
      importance: 0,
      originType: 'EAST', // EAST OR WEST
      x: 0,
      y: 0,
      originY: 0,
      angle: 0,
      importantce: 1,
      avatarUrl: '',
      philId: '',
      philName: '',
      born: '',
      size: 25
    }, props)


    this.ratio = window.devicePixelRatio; // 设备像素比
    this.centerPx = this.$html.width() / 2
    this.oppsiteSide = this.angle && this.angle >= 0 ? this.angle * 120 : 0

  }
  draw() {
    const lineMoveToX = this.originType === 'EAST' ? this.x - this.size - 3 : this.x + this.size + 3
    this.drawCircle(this.x, this.y)
    this.drawText(this.philName, this.x, this.y + this.size + 20)
    this.drawText(this.born, this.x, this.y + this.size + 35, true)
    this.drawLine(lineMoveToX, this.y, this.originY)

  }
  drawCircle(x, y) {
    this.ctx.beginPath()
    this.ctx.lineWidth = 3;
    this.ctx.fillStyle = '#fff'
    this.ctx.strokeStyle = "#a0365b"
    this.ctx.arc(x, y, this.size, 0, Math.PI * 2, false);
    this.ctx.fill();
    this.ctx.stroke();


    if (!this.img) {
      var img = document.createElement('img')
      img.src = this.avatarUrl
      let that = this
      img.onload = () => {
        this.img = img
      }
    } else {
      let imgX = x - this.size
      let imgY = y - this.size
      this.drawRadiusImage(this.img, imgX, imgY, this.size)
    }

    // this.drawRect('I', x, y + 10)
    this.ctx.closePath()

  }
  drawText(text, x, y, born = false) {
    this.ctx.beginPath()
    this.ctx.font = '12px sans-serif';
    this.ctx.strokeStyle = born ? 'rgba(255, 255, 255, 0.1)' : '#fff'
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'bottom';
    this.ctx.fillText(text, x, y);
    this.ctx.stroke()
    this.ctx.closePath()
  }
  drawRadiusImage(img, x, y, r) {
    this.ctx.save()
    this.ctx.beginPath()
    var d = 2 * r;
    var cx = x + r;
    var cy = y + r;
    this.ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    this.ctx.clip();
    this.ctx.drawImage(img, x, y, d, d);
    this.ctx.closePath()
    this.ctx.restore()
  }
  drawRect(text, x, y, w = 50, h = 10) {
    this.ctx.beginPath()
    this.ctx.fillStyle = '#a0365b'
    this.ctx.fillRect(x - w / 2, y, w, h);
    this.ctx.strokeStyle = '#FFFFFF'
    this.ctx.fillText(text, x - w / 2, y);
    this.ctx.stroke()
    this.ctx.fill()
    this.ctx.closePath()
  }
  drawLine(x, y, originY) {
    const lineToX = this.originType === 'EAST' ? this.centerPx + 35 : this.centerPx - 35
    const lineTox2 = this.originType === 'EAST' ? this.x - 35 : this.x + 35
    this.ctx.beginPath()
    var gradient = this.ctx.createLinearGradient(0, 0, 200, 0);
    gradient.addColorStop(0, "#000000");
    gradient.addColorStop(1, "#AE295B");

    this.ctx.lineWidth = 1;
    if (this.originType === 'EAST') {
      if (this.angle > 0) {

        this.ctx.moveTo(this.centerPx, originY)
        this.ctx.lineTo(lineToX, y)
        this.ctx.lineTo(lineToX + 30, y)


      } else {
        this.ctx.moveTo(this.centerPx, this.y)
        this.ctx.lineTo(lineTox2, y)
      }
    } else {
      if (this.angle >= 0) {
        this.ctx.moveTo(this.centerPx, originY)
        this.ctx.lineTo(lineToX, y)
        this.ctx.lineTo(lineToX - 30, y)


      } else {
        this.ctx.moveTo(this.centerPx, y)
        this.ctx.lineTo(lineTox2, y)
      }
    }



    this.ctx.strokeStyle = gradient
    this.ctx.stroke()
    this.ctx.closePath()


  }
  _bind() {

  }
}