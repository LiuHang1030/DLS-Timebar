import { TweenLite } from "gsap";

export default class Avatar {
  constructor(props) {
    Object.assign(this, {
      $html: this.$html,
      canvas: null,
      ctx: null,
      importance: 1,
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
      hasShow: false,
      numWidth: 5,
      numHeight: 8,
    }, props)
    this.importance = parseInt(this.importance)
    this.outterCircle = document.createElement('img')
    this.outterCircle.src = '../../static/avatar@2x.png'
    this.importanceImage = document.createElement('img')
    this.importanceImage.src = `../../static/${this.importance}@2x.png`
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
          x2: this.originType === 'EAST' ? this.centerPx + 35 : this.centerPx - 35,
          y: this.originY,
          opacity: 0,
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
    } else {
      if (this.angle > 0) {
        TweenLite.to(this.lineData, 1, {
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
          x2: this.centerPx,
          y: this.y,
          opacity: 0,
          onUpdateParams: ['{ self }'],
          onComplete: (tn) => {
          }
        })
      }
    }
    // const lineMoveToX = this.originType === 'EAST' ? this.x - this.size - 3 : this.x + this.size + 3
    // this.drawCircle(this.x, this.y)
    // this.drawText(this.philName, this.x, this.y + this.size + 20)
    // this.drawText(this.born, this.x, this.y + this.size + 35, true)
    // this.drawLine(lineMoveToX, this.y, this.originY)
  }
  draw() {
    let newX1 = this.originType === 'EAST' ? this.centerPx + 35 : this.centerPx - 35
    let newX2 = this.originType === 'EAST' ? this.x - 35 : this.x + 35;
    let newY = this.y
    if (!this.hasShow) {
      this.hasShow = true
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
              this.hasShow = true
              this.drawing = false

            }
          })
        } else {
          TweenLite.to(this.lineData, 1, {
            x2: newX2,
            y: newY,
            opacity: 1,
            onUpdateParams: ['{ self }'],
            onComplete: (tn) => {
              this.hasShow = true
              this.drawing = false

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
              this.hasShow = true
              this.drawing = false
            }
          })
        } else {
          TweenLite.to(this.lineData, 1, {
            x2: newX2,
            y: newY,
            opacity: 1,
            onUpdateParams: ['{ self }'],
            onComplete: (tn) => {
              this.hasShow = true
              this.drawing = false

            }
          })
        }
      }

    } else {
      this.lineData.y = this.y
      this.lineData.originY = this.originY
    }
    const lineMoveToX = this.originType === 'EAST' ? this.x - this.size - 3 : this.x + this.size + 3


    // if (this.cacheAvatar) {
    //   this.ctx.drawImage(this.cacheAvatar, this.x, this.y, 2 * this.size, 2 * this.size)
    // } else {
    //   this.cacheAvatar = this.createCacheAvatar()
    // }
    this.drawCircle(this.ctx, this.x, this.y)
    this.drawText(this.ctx, this.philName, this.x, this.y + this.size + 20)
    this.drawText(this.ctx, this.born, this.x, this.y + this.size + 35, true, 9)
    this.drawLine(this.ctx, lineMoveToX, this.y, this.originY)
  }
  createCacheAvatar() {
    this.cacheCanvas = document.createElement("canvas");
    this.cacheCtx = this.cacheCanvas.getContext("2d");
    this.cacheCtx.save()
    this.cacheCanvas.width = 2 * this.size * this.ratio;
    this.cacheCanvas.height = 2 * this.size * this.ratio;
    this.cacheCanvas.style.transformOrigin = '0 0'
    this.cacheCanvas.style.transform = `scale(${1 / this.ratio, 1 / this.ratio})`;
    this.drawCircle(this.cacheCtx, this.x, this.y)
    this.drawText(this.cacheCtx, this.philName, this.x, this.y + this.size + 20)
    this.drawText(this.cacheCtx, this.born, this.x, this.y + this.size + 35, true)
    this.drawText(this.cacheCtx, this.philName, this.x, this.y + this.size + 20)
    this.cacheCtx.restore()
    return this.cacheCanvas
  }

  drawCircle(ctx, x, y) {
    ctx.save()
    ctx.beginPath()
    ctx.lineWidth = 0;
    ctx.fillStyle = `rgba(255, 255, 255, ${this.lineData.opacity})`
    // ctx.strokeStyle = `rgba(160,54,91,${this.lineData.opacity})`

    ctx.arc(x, y, this.size - 2, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.stroke();
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
      this.drawRadiusImage(ctx, this.img, imgX, imgY, this.size)
      this.ctx.drawImage(this.outterCircle, x - this.size, y - this.size, this.size * 2, this.size * 2)
      this.ctx.drawImage(this.importanceImage, x - this.numWidth / 2, y + this.size - 9, this.numWidth, this.numHeight)
    }
    ctx.closePath()
    ctx.restore()


  }

  drawText(ctx, text, x, y, born = false, fontSize = 12) {
    ctx.save()
    ctx.beginPath()
    ctx.font = `${fontSize}px sans-serif`;
    ctx.fillStyle = `rgb(255, 255, 255)`
    ctx.strokeStyle = born ? 'rgba(255, 255, 255, 0.1)' : '#fff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom';
    ctx.fillText(text, x, y);
    ctx.stroke()
    ctx.closePath()
    ctx.restore()
  }
  drawRadiusImage(ctx, img, x, y, r) {
    ctx.beginPath()
    var d = 2 * r;
    var cx = x + r;
    var cy = y + r;
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.clip();
    ctx.drawImage(img, x, y, d, d);
    ctx.closePath()
  }
  drawRect(ctx, text, x, y, w = 40, h = 7) {
    ctx.beginPath()
    ctx.strokeStyle = '#FFFFFF'
    ctx.fillText(text, x, y + 12);
    ctx.stroke()
    ctx.fill()
    ctx.closePath()
  }
  drawLine(x, y, originY, animate = true) {
    this.ctx.save()
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
    this.ctx.restore()




  }
  _bind() {

  }
}