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



    this.centerPx = this.$html.width() / 2
    this.oppsiteSide = this.angle && this.angle >= 0 ? this.angle * 120 : 0
    this.createAvatar()
  }
  createAvatar() {
    const lineMoveToX = this.originType === 'EAST' ? this.x - this.size - 3 : this.x + this.size + 3
    this.drawCircle(this.x, this.y)
    this.drawText(this.philName, this.x, this.y + this.size + 20)
    this.drawText(this.born, this.x, this.y + this.size + 35)
    this.drawLine(lineMoveToX, this.y, this.originY)
  }
  drawCircle(x, y) {
    this.ctx.beginPath();
    this.ctx.lineWidth = 2;
    this.ctx.fillStyle = '#fff'
    this.ctx.strokeStyle = "#a0365b"
    this.ctx.arc(x, y, this.size, 0, Math.PI * 2, false);
    this.ctx.fill();
    this.ctx.stroke();
    // this.drawRect('I', x, y)
    this.ctx.closePath();
    // var img = new Image();
    // img.src = '//pic.allhistory.com/T1hyYCB_hT1RCvBVdK.png?ch=604&cw=604&cx=107&cy=0&w=100&h=100';

    // img.onload = () => {
    //   this.drawRadiusImage(img, x, y, 100)
    // }


    this.ctx.stroke()
  }
  drawText(text, x, y) {
    this.ctx.font = '12px sans-serif';
    this.ctx.strokeStyle = '#FFFFFF'
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'bottom';
    this.ctx.fillText(text, x, y);
  }
  drawRadiusImage(img, x, y, r) {
    this.ctx.save();
    var d = 2 * r;
    var cx = x + r;
    var cy = y + r;
    this.ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    this.ctx.clip();
    this.ctx.drawImage(img, x, y, d, d);
    this.ctx.restore();
  }
  drawRect(text, x, y, w = 80, h = 20) {
    this.ctx.save()
    this.ctx.fillStyle = '#a0365b'
    this.ctx.fillRect(x - w / 2, y + 28, w, h);
    this.ctx.restore()
    // this.ctx.fillText(importance, x, y);
  }
  drawLine(x, y, originY) {
    const lineToX = this.originType === 'EAST' ? this.centerPx + 35 : this.centerPx - 35
    const lineTox2 = this.originType === 'EAST' ? this.x - 35 : this.x + 35
    var gradient = this.ctx.createLinearGradient(0, 0, 200, 0);
    gradient.addColorStop(0, "#000000");
    gradient.addColorStop(1, "#AE295B");
    this.ctx.save()

    this.ctx.lineWidth = 1;
    this.ctx.fillStyle = 'yellow'
    if (this.originType === 'EAST') {
      if (this.angle > 0) {
        this.ctx.beginPath()
        this.ctx.moveTo(this.centerPx, originY)
        this.ctx.lineTo(lineToX, y)
        this.ctx.lineTo(lineToX + 30, y)


      } else {
        this.ctx.beginPath()
        this.ctx.moveTo(this.centerPx, this.y)
        this.ctx.lineTo(lineTox2, y)
        this.ctx.closePath()
      }
    } else {
      if (this.angle >= 0) {
        this.ctx.beginPath()
        this.ctx.moveTo(this.centerPx, originY)
        this.ctx.lineTo(lineToX, y)
        this.ctx.lineTo(lineToX - 30, y)


      } else {
        this.ctx.beginPath()
        this.ctx.moveTo(this.centerPx, y)
        this.ctx.lineTo(lineTox2, y)
        this.ctx.closePath()
      }
    }



    this.ctx.strokeStyle = gradient
    this.ctx.stroke()
    this.ctx.closePath()
    this.ctx.restore()


  }
  _bind() {

  }
}