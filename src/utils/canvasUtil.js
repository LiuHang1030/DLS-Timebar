CanvasRenderingContext2D.prototype.fillTextVertical = function (text, x, y) {
  var context = this;
  var canvas = context.canvas;

  var arrText = text.split('');
  var arrWidth = arrText.map(function (letter) {
    return context.measureText(letter).width;
  });

  var align = context.textAlign;
  var baseline = context.textBaseline;

  if (align == 'left') {
    x = x + Math.max.apply(null, arrWidth) / 2;
  } else if (align == 'right') {
    x = x - Math.max.apply(null, arrWidth) / 2;
  }
  if (baseline == 'bottom' || baseline == 'alphabetic' || baseline == 'ideographic') {
    y = y - arrWidth[0] / 2;
  } else if (baseline == 'top' || baseline == 'hanging') {
    y = y + arrWidth[0] / 2;
  }
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  // 开始逐字绘制
  arrText.forEach(function (letter, index) {
    // 确定下一个字符的纵坐标位置
    var letterWidth = arrWidth[index];
    // 是否需要旋转判断
    var code = letter.charCodeAt(0);
    if (code <= 256) {
      context.translate(x, y);
      // 英文字符，旋转90°
      context.rotate(90 * Math.PI / 180);
      context.translate(-x, -y);
    } else if (index > 0 && text.charCodeAt(index - 1) < 256) {
      // y修正
      y = y + arrWidth[index - 1] / 2;
    }
    context.fillText(letter, x, y);
    // 旋转坐标系还原成初始态
    // context.setTransform(1, 0, 0, 1, 0, 0);
    // 确定下一个字符的纵坐标位置
    var letterWidth = arrWidth[index];
    y = y + letterWidth;
  });
  // 水平垂直对齐方式还原
  context.textAlign = align;
  context.textBaseline = baseline;
};
CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
  if (w < 2 * r) { r = w / 2; }
  if (h < 2 * r) { r = h / 2; }
  this.beginPath();
  this.moveTo(x + r, y);
  this.arcTo(x + w, y, x + w, y + h, r);
  this.arcTo(x + w, y + h, x, y + h, r);
  this.arcTo(x, y + h, x, y, r);
  this.arcTo(x, y, x + w, y, r);
  this.closePath();
  return this;
}