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
      size: 25,
      hasShow: false
    }, props)
    this.ratio = window.devicePixelRatio; // 设备像素比
    this.centerPx = this.$html.width() / 2
    this.oppsiteSide = this.angle && this.angle >= 0 ? this.angle * 120 : 0
    this.lineData = {
      x: this.centerPx,
      x1: this.originType === 'EAST' ? this.centerPx + 35 : this.centerPx - 35,
      x2: this.originType === 'EAST' ? this.centerPx + 35 : this.centerPx - 35,
      originY: this.originY,
      y: this.y,
      opacity: 0
    }
    if (this.hasShow) {
      // 非首次出现
      this.lineData = {
        x: this.centerPx,
        x1: this.originType === 'EAST' ? this.centerPx + 35 : this.centerPx - 35,
        x2: this.originType === 'EAST' ? this.centerPx + 35 : this.centerPx - 35,
        originY: this.originY,
        y: this.y,
        opacity: 1
      }
    } else {
      // 首次出现

      this.lineData = {
        x: this.centerPx,
        x1: this.originType === 'EAST' ? this.centerPx + 35 : this.centerPx - 35,
        x2: this.originType === 'EAST' ? this.centerPx + 35 : this.centerPx - 35,
        originY: this.originY,
        y: this.y,
        opacity: 0
      }
    }
  }

  hide() {
    let newX1 = this.originType === 'EAST' ? this.centerPx + 35 : this.centerPx - 35
    let newX2 = this.originType === 'EAST' ? this.x - 35 : this.x + 35;
    let newY = this.y
    this.hasShow = false
    if (this.originType == 'EAST') {
      if (this.angle > 0) {
        // 先画折线
        TweenLite.to(this.lineData, 0.33, {
          x1: this.centerPx,
          x2: this.centerPx,
          y: this.originY,
          opacity: 0,
          onUpdateParams: ['{ self }'],
          onComplete: (tn) => {

          }
        })
      } else {
        TweenLite.to(this.lineData, 1, {
          x2: newX2,
          y: newY,
          opacity: 1,
          onUpdateParams: ['{ self }'],
          onComplete: (tn) => {

          }
        })
      }
    } else {
      if (this.angle > 0) {
        TweenLite.to(this.lineData, 1, {
          x1: newX1,
          x2: newX2,
          y: newY,
          opacity: 1,
          onUpdateParams: ['{ self }'],
          onComplete: (tn) => {

          }
        })
      } else {
        TweenLite.to(this.lineData, 1, {
          x2: this.centerPx,
          y: this.y,
          opacity: 0,
          onUpdateParams: ['{ self }'],
          onComplete: (tn) => {
          }
        })
      }
    }

    const lineMoveToX = this.originType === 'EAST' ? this.x - this.size - 3 : this.x + this.size + 3
    this.drawCircle(this.x, this.y)
    this.drawText(this.philName, this.x, this.y + this.size + 20)
    this.drawText(this.born, this.x, this.y + this.size + 35, true)
    this.drawLine(lineMoveToX, this.y, this.originY)
  }
  draw() {

    let newX1 = this.originType === 'EAST' ? this.centerPx + 35 : this.centerPx - 35
    let newX2 = this.originType === 'EAST' ? this.x - 35 : this.x + 35;
    let newY = this.y
    if (!this.hasShow) {
      if (this.originType == 'EAST') {
        if (this.angle > 0) {
          // 先画折线
          TweenLite.to(this.lineData, 0.33, {
            x1: newX1,
            x2: newX2,
            y: newY,
            opacity: 1,
            onUpdateParams: ['{ self }'],
            onComplete: (tn) => {

            }
          })
        } else {
          TweenLite.to(this.lineData, 1, {
            x2: newX2,
            y: newY,
            opacity: 1,
            onUpdateParams: ['{ self }'],
            onComplete: (tn) => {

            }
          })
        }
      } else {
        if (this.angle > 0) {
          TweenLite.to(this.lineData, 1, {
            x1: newX1,
            x2: newX2,
            y: newY,
            opacity: 1,
            onUpdateParams: ['{ self }'],
            onComplete: (tn) => {

            }
          })
        } else {
          TweenLite.to(this.lineData, 1, {
            x2: newX2,
            y: newY,
            opacity: 1,
            onUpdateParams: ['{ self }'],
            onComplete: (tn) => {
            }
          })
        }
      }
    } else {
      this.lineData.y = this.y
      this.lineData.originY = this.originY
    }
    const lineMoveToX = this.originType === 'EAST' ? this.x - this.size - 3 : this.x + this.size + 3
    this.drawCircle(this.x, this.y)
    this.drawText(this.philName, this.x, this.y + this.size + 20)
    this.drawText(this.born, this.x, this.y + this.size + 35, true)
    this.drawLine(lineMoveToX, this.y, this.originY)
  }
  drawCircle(x, y) {
    this.ctx.beginPath()
    this.ctx.lineWidth = 3;
    this.ctx.fillStyle = `rgba(255, 255, 255, ${this.lineData.opacity})`
    this.ctx.strokeStyle = `rgba(160,54,91,${this.lineData.opacity})`
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
  drawLine(x, y, originY, animate = true) {
    this.ctx.beginPath()
    var gradient = this.ctx.createLinearGradient(0, 0, 200, 0);
    gradient.addColorStop(0, "#000000");
    gradient.addColorStop(1, "#AE295B");

    this.ctx.lineWidth = 1;
    if (this.originType === 'EAST') {
      if (this.angle > 0) {

        this.ctx.moveTo(this.lineData.x, this.lineData.originY) // 起始点
        this.ctx.lineTo(this.lineData.x1, this.lineData.y) // 斜线连接
        this.ctx.lineTo(this.lineData.x2, this.lineData.y)


      } else {
        this.ctx.moveTo(this.lineData.x, this.lineData.y)
        this.ctx.lineTo(this.lineData.x2, this.lineData.y)
      }
    } else {
      if (this.angle > 0) {
        this.ctx.moveTo(this.lineData.x, this.lineData.originY) // 起始点
        this.ctx.lineTo(this.lineData.x1, this.lineData.y) // 斜线连接
        this.ctx.lineTo(this.lineData.x2, this.lineData.y)
      } else {
        this.ctx.moveTo(this.lineData.x, this.lineData.y)
        this.ctx.lineTo(this.lineData.x2, this.lineData.y)
      }
    }



    this.ctx.strokeStyle = gradient
    this.ctx.stroke()
    this.ctx.closePath()




  }
  _bind() {

  }
}