

export default class Quote {
  constructor(props) {
    Object.assign(this, {
      $html: this.$html,
      canvas: null,
      ctx: null,
      x: 0,
      y: 0,
      width: 120,
      height: 40,
      angle: 0,
      radius: 50,
      originType: 'EAST',
      innerPaddingLeft: 5,
      innerPaddingTop: 5,
      outterPadding: 20,
      saying: {}
    }, props)
    this.x = this.originType == 'EAST' ? 20 : this.centerPx + 40
    this.trasnlateY = this.y - (this.height / 2)
    this.arrText = this.saying.title.split('');
    this.arrWidth = this.arrText.map((letter) => {
      return this.ctx.measureText(letter).width;
    });
    this.textWidth = this.getSum(this.arrWidth)
    this.drawPhilQuote()
  }
  drawPhilQuote() {
    this.drawText()
    this.drawRoundedRect(this.ctx, this.x, this.trasnlateY, this.width, !this.switchLine ? this.height : this.height + 15, 4)
  }
  drawRoundedRect(ctx, x, y, width, height, radius, type) {
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.36)'
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.moveTo(x, y + radius);

    ctx.arc(x + radius, y + radius, radius, Math.PI, 1.5 * Math.PI);
    ctx.arc(x + width - radius, y + radius, radius, 1.5 * Math.PI, 2 * Math.PI);
    ctx.arc(x + width - radius, y + height - radius, radius, 0, 0.5 * Math.PI);
    ctx.arc(x + radius, y + height - radius, radius, 0.5 * Math.PI, Math.PI);
    ctx.closePath();
    const method = type || 'stroke';  // 默认描边，传入fill即可填充矩形
    ctx[method]();

  };
  drawText(text, x, y) {
    this.ctx.beginPath()
    this.ctx.font = '12px sans-serif';
    this.ctx.strokeStyle = '#FFFFFF'
    this.ctx.fillStyle = '#fff'
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'bottom';
    let sumWidth = 0
    this.switchLine = false
    let boxWidth = this.width - this.innerPaddingLeft * 2 - 6
    this.arrText.forEach((letter, index) => {
      var letterWidth = this.arrWidth[index];
      sumWidth += letterWidth
      if (sumWidth > boxWidth) {
        sumWidth = 10
        this.switchLine = true
      }
      var x = this.innerPaddingLeft + sumWidth + this.x
      var y = this.innerPaddingTop + this.y + (this.switchLine ? 20 : 0)
      this.ctx.fillText(letter, x, y)
    })

    this.ctx.closePath()
  }
  getSum(arr) {
    var sum = arr.reduce(function (prev, curr, idx, arr) {
      return prev + curr;
    })
    return sum;
  }
}