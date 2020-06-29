/**
 * 时间轴
 * 支持，缩放拖拽
 */
import dateUtil from './utils/dateUtil';
import timeMath from './utils/math';

import {
  TweenLite,
  Power0
} from 'gsap';

export default class Timebar {

  // events = {
  //   'change': []
  // };

  constructor(props) {
    Object.assign(this, {
      tickTime: +new Date,
      tick: 50,
      container: document.body,
      minYear: -5000,
      maxYear: 2500,
      minZoom: 0.5,
      maxZoom: 10,
      minUnitWidth: 8,
      maxUnitWidth: 16,
      totalWidth: 0,
      unitTime: 10,
      zoomSpeed: 0.5,
      zoom: 1,
      unitWidth: 8,
      mousePos: {
        x: 0,
        y: 0,
        clientX: 0,
        clientY: 0
      },
      downTranslate: {
        x: 0,
        y: 0
      },
      translate: {
        x: 0,
        y: 0
      },
      /**
       * bufferYear
       * 用于减少绘制内容数量， 降低render性能损耗
       * bufferMinYear 绘制起始数值
       * bufferMaxYear 绘制结束数值
       */
      bufferYears: {
        min: 0,
        max: 0,
      },

      /**
       * 滑动前后的阈值， 正常左侧starttime位置最多可以滑动到中间位置
       * startOffsetPx将会减少这个值，使之
       */
      endOffsetPx: 0,
      startOffsetPx: 0,
      offsetAreaDuration: 0,
      scalable: true,
      draggable: true,
      onChange: (e = {}) => {
        // this.events['change'].forEach(fn => {
        //   fn(this, e)
        // })
      },
      onRender() { },
      onAnimateFinish() { }
    }, props);




    this.startUnitTime = this.unitTime; // 初始每个刻度代表10年
    this.startUnitWidth = this.unitWidth; // 刻度间隔 8px
    this.ratio = window.devicePixelRatio; // 设备像素比

    /**
     * 计算时间段长度
     */
    this.totalTime = this.maxYear - this.minYear;

    this.createCanvas();

    /**
     * 兼容IOS
     */
    if (window.frameElement) {
      this.onChange = function () { };
      return false;
    };

    this._resize();
    this.updateTotalWidth();
    this.updateBufferYears();



    this.render();
    this.bind();

  }

  createCanvas() {
    this.canvas = document.createElement('canvas');

    this.$html = $(window)

    this.ctx = this.canvas.getContext('2d');

    this.container.appendChild(this.canvas);

  }

  _resize() {

    // console.log(this.$html.width())
    this.canvas.width = this.$html.width() * this.ratio;
    this.canvas.height = this.$html.height() * this.ratio;
    this.centerPx = this.$html.width() / 2;
    this.canvas.style.transformOrigin = '0 0'
    this.canvas.style.transform = `scale(${1 / this.ratio, 1 / this.ratio})`;
    this.render();
    this.onChange({ resize: true });
  }

  render() {

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.width)

    this.ctx.save();
    this.ctx.scale(this.ratio, this.ratio);
    this.ctx.translate(this.translate.x, this.translate.y)

    this.drawUnit();
    this.drawDisable();
    this.ctx.restore();

    this.onRender(this);
  }

  /**
   * 更新当前状态总宽度
   */
  updateTotalWidth() {
    this.totalWidth = this.unitWidth * ((this.maxYear - this.minYear) / this.unitTime);
  }


  /**
   * 根据当前状态更新bufferYears
   */
  updateBufferYears() {
    let currentStartTime = this.getTimeByPixel(this.translate.x);
    let oneScreenTime = this.getTimeByPixel(this.$html.width()) - this.getTimeByPixel(0);
    this.bufferYears.min = this.getTimeByPixel(0) - oneScreenTime;
    this.bufferYears.max = this.getTimeByPixel(0) + oneScreenTime * 2;
    this.zeroX = this.getXbyTime(0);
    this.renderStartX = ((this.minYear - currentStartTime - oneScreenTime) / this.unitTime) * this.unitWidth;
  }


  drawUnit() {
    /**
     * 为了减少绘制图形数量，采用bufferMinYear & bufferMaxYear的方式绘制，范围未前后一屏；
     * 使用两个循环，分别处理小于1年与1年之后的，保证1年一定存在
     */

    this.ctx.strokeStyle = '#CAD2D6';
    this.ctx.fillStyle = '#999999';
    let loneLineCounter = 0;


    /**
     * 绘制1年之前的刻度
     */
    if (this.bufferYears.min < 0) {
      for (let i = 0; i > this.bufferYears.min; i -= this.unitTime) {

        let x = -(loneLineCounter + 1) * this.unitWidth + this.zeroX;
        let isLongUnit = (loneLineCounter + 1) % 10 == 0;

        this.drawLine(x, isLongUnit ? 20 : 10);

        // console.log(i)
        if (isLongUnit) {
          this.drawText(i - this.unitTime, x)
        }

        loneLineCounter++;
      }
    }

    loneLineCounter = 0;

    /**
     * 绘制1年之后的年份
     */
    if (this.bufferYears.max > 0) {
      for (let i = 1; i < this.bufferYears.max; i += this.unitTime) {

        let x = loneLineCounter * this.unitWidth + this.zeroX;;
        let isLongUnit = loneLineCounter % 10 == 0;


        let text = i - 1;
        if (i == 1) {
          text = i
        }

        this.drawLine(x, isLongUnit ? 20 : 8);

        if (isLongUnit) {
          this.drawText(text, x)
        }

        loneLineCounter++;
      }
    }
  }

  drawLine(x, height = 10) {
    x = Math.floor(x);

    this.ctx.beginPath();
    this.ctx.lineWidth = 1;
    this.ctx.moveTo(x, 0);
    this.ctx.lineTo(x, height);
    this.ctx.stroke();
    this.ctx.closePath();
  }

  drawDisable() {

    let height = this.$html.height();
    /**
     * draw disable front
     */

    this.ctx.globalAlpha = 0.5
    this.ctx.beginPath();
    this.ctx.fillStyle = '#999';
    this.ctx.rect(-this.translate.x, 0, this.translate.x, height);
    this.ctx.fill()
    this.ctx.closePath();


    /**
     * draw disable after
     */
    let overflowX = -this.translate.x + this.$html.width() - this.totalWidth;
    this.ctx.beginPath();

    this.ctx.fillStyle = '#999';
    this.ctx.rect(this.totalWidth, 0, overflowX, height);
    this.ctx.fill()
    this.ctx.closePath();
  }

  drawText(year, x, y = 31) {
    let month = dateUtil.yearToMonth(year, 'short-en');
    let text = Math.floor(year);

    if (month != 'Jan.') {
      text += ' ' + month;
    }
    this.ctx.beginPath();
    this.ctx.textAlign = "center";
    this.ctx.fillText(text, Math.round(x), y + 6)
    this.ctx.closePath();
  }

  _fixOverFlowTranslate(x) {


    // return;
    /**
     * 设置滑动的边界，如果超出滑动边界，则使用边界值
     */
    console.log('startOffsetPx' + this.startOffsetPx)
    if (x > this.centerPx - this.startOffsetPx) {

      this.translate.x = this.centerPx - this.startOffsetPx;

    } else if (-x > this.totalWidth - this.centerPx - this.endOffsetPx) {

      this.translate.x = -this.totalWidth + this.centerPx + this.endOffsetPx
    } else {

      this.translate.x = x;
    }

    // console.log(x, this.centerPx, this.startOffsetPx);
  }


  /**
   * 如果设置了 startoffsetpx 或者 endoffsetpx，获取area的时间
   */
  getOffsetAreaDuration(unitWidth = this.unitWidth, unitTime = this.unitTime) {
    return ((this.startOffsetPx + this.endOffsetPx) / unitWidth) * unitTime;
  }


  /**
   * 传入时间轴x坐标，获取对应位置
   * @param  _x
   */
  getTimeByPixel(_x) {
    let x = _x - this.translate.x;

    let percentX = x / this.totalWidth;


    // console.log(percentX * this.totalTime + this.minYear)
    let time = percentX * this.totalTime + this.minYear;
    if (Math.floor(time) == 0) {
      time = 1;
    }
    return time;
  }

  /**
   *
   * @returns {year,month}
   */
  getDateByPixel(_x) {
    let time = this.getTimeByPixel(_x);
    return {
      year: Math.floor(time),
      month: dateUtil.yearToMonth(time),
    }
  }

  /**
   * 传入时间获取该时间在画布中的 X
   * @param {number} time
   */
  getXbyTime(time) {
    let percent = (time - this.minYear) / this.totalTime;
    return percent * this.totalWidth;
  }

  /**
   * 传入时间，获取屏幕位置
   * @param {number} time
   */
  getScreenXbyTime(time) {
    let x = this.getXbyTime(time);
    return Math.round(x + this.translate.x);
  }

  /**
   * 获取区间的起始时间
   */
  getAreaTime() {
    let start = this.getTimeByPixel(this.centerPx - this.startOffsetPx)
    let end = this.getTimeByPixel(this.centerPx + this.endOffsetPx)

    return {
      start,
      end
    };
  }

  /**
   * 
   * @param {*} time 
   * @param {*} animate 
   * @param {*} duration 
   * @param {*} cb 
   */
  setCenterByTime(time, animate = 0, duration = true, cb = false) {

    if (duration) {
      let selectedDuration = this.getOffsetAreaDuration();

      /**
       * 如果是最小值的话
       */
      if ((time - selectedDuration / 2) <= this.minYear) {
        time = this.minYear + selectedDuration / 2;
      }

      /**
       * 如果是最大值的话
       */
      if ((time + selectedDuration / 2) >= this.maxYear) {
        time = this.maxYear - selectedDuration / 2;
      }
    }

    let newX = -this.getXbyTime(time) + this.centerPx;


    TweenLite.to(this.translate, animate, {
      x: newX,
      onUpdate: () => {
        this.updateBufferYears();
        this.render();
        if (cb) {
          cb()
        } else {
          this.onChange({ time: time });
        }
      }
    })


  }

  /**
   * 设置startoffset and endoffset 时间
   * @param {time} startTime
   * @param {time} endTime
   * 根据初始的 unitTime & unitWidth 推导出当先start time end time 以及选区范围的unitTime 与 unitWidth
   */
  setTimeByOffset(startTime, endTime, animate = 0, cb = false) {

    if (startTime == 1) {
      startTime = 0
    };
    if (endTime == 1) {
      endTime = 0
    };

    let {
      newUnitTime,
      newUnitWidth
    } = timeMath.calcUnitBySelectedOffset(this, startTime, endTime);

    this._zoomToSelectedOffset(startTime, endTime, newUnitTime, newUnitWidth, animate, cb)


  }

  /**
   * 设置时间轴缩放，通过起始时间以及宽度缩放。
   * @param {*} startTime
   * @param {*} endTime
   * @param {*} width
   */
  setTimeByWidth(startTime, endTime, width = window.innerWidth) {

    let duration = endTime - startTime;

    /**
     * 如果时间小于10年则不执行
     */
    if (duration < 10) {
      return;
    }

    let {
      newUnitTime,
      newUnitWidth
    } = timeMath.calcUnitBySelectedOffset(this, startTime, endTime, width);
    this._zoomToSelectedOffset(startTime, endTime, newUnitTime, newUnitWidth, 0)
  }

  /**
   * 增加事件
   * @param {string} event
   * @param {function} fn
   */
  addEvent(event = 'change', fn) {
    this.events[event].push(fn);
  }

  hide() {
    this.html.style.display = 'none';
  }

  /**
   * 缩放到，按照offset计算的区域
   * 根据现在中心时间，和目标中心时间差，进行移动。
   */
  _zoomToSelectedOffset(startTime, endTime, unitTime, unitWidth, animate = 0, cb) {


    let targetCenterTime = startTime + (endTime - startTime) / 2;
    let currentCenterTime = this.getTimeByPixel(this.centerPx);
    let centerTimeDelta = targetCenterTime - currentCenterTime;

    TweenLite.to(this, animate, {
      ease: Power0.easeNone,
      unitTime,
      unitWidth,
      onUpdateParams: ['{self}'],
      onUpdate: tn => {

        let animateProcess = tn.progress();
        let centerTime = centerTimeDelta * animateProcess + currentCenterTime;
        this.updateTotalWidth();
        this.updateBufferYears();
        this.setCenterByTime(centerTime, 0, true, cb);
        this.render()

        if (cb) {
          cb()
        } else {
          this.onChange();
        }
      }
    })

  }

  /**
   * 缩放
   * @param {number} delta
   */
  _zoom(delta) {
    /**
     * 定义新的参数
     */
    let newUnitWidth = this.unitWidth;
    let newUnitTime = this.unitTime;

    newUnitWidth += delta;


    /**
     * 获取现在中心时间
     */
    let centerTime = this.getTimeByPixel(this.centerPx);

    /**
     * 计算缩放后的单位长度
     */
    let zoomRatio = this.maxUnitWidth / this.minUnitWidth;



    if (newUnitWidth > this.maxUnitWidth) {
      newUnitWidth = this.minUnitWidth;
      newUnitTime = this.unitTime / zoomRatio;
    }

    if (newUnitWidth < this.minUnitWidth) {
      newUnitWidth = this.maxUnitWidth;
      newUnitTime = this.unitTime * zoomRatio;
    }


    /**
     * 如果缩放超过边界值，则不做任何处理，直接return
     */
    /**
     * 如果10个刻度小于一年则不再缩放
     */
    let offsetAreaDuration = this.getOffsetAreaDuration(newUnitWidth, newUnitTime);

    if ((offsetAreaDuration > 0) && (offsetAreaDuration <= 1)) {
      return;
    }


    /**
     * 更新数值
     */
    this.unitTime = newUnitTime;
    this.unitWidth = newUnitWidth;


    /**
     * 更新总长度
     */
    this.updateTotalWidth();


    this.setCenterByTime(centerTime);
    this._fixOverFlowTranslate(this.translate.x);

    this.updateBufferYears();

    /**
     * 如果总的可选区域小于offsetAreaDuration时间跨度，则固定为时间跨度的宽度
     */
    if (offsetAreaDuration >= this.maxYear - this.minYear) {
      this.setTimeByOffset(this.minYear, this.maxYear);
    }

    // console.log(this.bufferYears, this.renderStartX, this.translate.x, this.unitTime, this.unitWidth);
    this.render();

    /**
     * 触发外部事件
     */
    this.onChange(this);
  }
  /**
   * zoom event
   */
  _mouseWheel(e) {

    if (!this.scalable) {
      return;
    }
    e.preventDefault();

    let {
      deltaY
    } = e.originalEvent;

    if (deltaY < 0) {
      this._zoom(-this.zoomSpeed);
    } else {
      this._zoom(this.zoomSpeed);
    }

  }


  /**
   * mousedown event
   */
  _mousedown() {
    this.isMousedown = true;
    this.mousedownPos = {
      x: this.mousePos.x,
      y: this.mousePos.y
    };
    console.log(this.mousedownPos)
    this.downTranslate = {
      ...this.translate
    };
    console.log(this.downTranslate)
  }

  /**
   * mousemove event
   */
  _mousemove(e) {
    /**
     * 更新鼠标位置
     */
    this.mousePos.x = e.clientX;
    this.mousePos.y = e.clientY;


    if (this.mousedownPos) {

      if (!this.draggable) {
        return;
      }
      let delatX = this.mousePos.x - this.mousedownPos.x;

      let newX = this.downTranslate.x + delatX;

      /**
       * 超出边界的处理
       */
      this._fixOverFlowTranslate(newX)


      this.updateBufferYears();
      this.render();
      this.onChange(this);
    }


  }

  _mouseup() {
    this.mousedownPos = false;
  }

  /**
   * mouseenter
   */
  _mouseenter(e) {
    this.$html.toggleClass('hover', true)
  }
  _mouseleave(e) {
    this.$html.toggleClass('hover', false)
  }



  bind() {

    $(window).on('resize.timebar', this._resize.bind(this))
    $(window).on('mousemove.dls-map-timebar', this._mousemove.bind(this))
    $(window).on('mouseup.dls-map-timebar', this._mouseup.bind(this))


    let mouseEventDom = this.$html;



    mouseEventDom.on('mousewheel', this._mouseWheel.bind(this))
    mouseEventDom.on('mousedown', this._mousedown.bind(this))
    mouseEventDom.on('mouseenter', this._mouseenter.bind(this))
    mouseEventDom.on('mouseleave', this._mouseleave.bind(this))
  }

}

