/**
 * 时间轴
 * 支持，缩放拖拽
 */
import dateUtil from '../utils/dateUtil';
import timeMath from '../utils/math';

import {
  TweenLite,
  Power0
} from 'gsap';



export default class Timebar {
  constructor(props) {
    Object.assign(this, {
      $html: undefined,
      canvas: undefined,
      ctx: undefined,
      tickTime: +new Date,
      tick: 50,
      marginTop: 100,
      container: document.body,
      minYear: -800,
      maxYear: new Date().getFullYear(),
      minZoom: 0.5,
      maxZoom: 10,
      minUnitWidth: 16,
      maxUnitWidth: 32,
      totalWidth: 0,
      unitTime: 40,
      minUnitTime: 0.1, // 最小刻度
      maxUnitTime: 40, // 最大刻度
      zoomSpeed: 0.5,
      zoom: 1,
      unitWidth: 16,
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
      events: {
        'change': []
      },
      onChange: (e = {}) => {
        this.events['change'].forEach(fn => {
          fn(this, e)
        })
      },
      onClick() { },
      onRender() { },
      onAnimateFinish() { },
      store: {
        scale: 1
      }
    }, props);



    this.startUnitTime = this.unitTime; // 初始每个刻度代表10年
    this.startUnitWidth = this.unitWidth; // 刻度间隔 8px
    this.ratio = window.devicePixelRatio; // 设备像素比

    /**
     * 计算时间段长度
     */
    this.totalTime = this.maxYear - this.minYear;




    /**
     * 兼容IOS
     */
    if (window.frameElement) {
      this.onChange = function () { };
      return false;
    };


    // this.createCanvas();
    this._resize();
    this.updateTotalWidth();
    this.updateBufferYears();
    // window.requestAnimationFrame(this.render.bind(this))
    this.render();
    this.bind();


    // setTimeout(() => {
    //   this.setTimeByOffset(-500, 1000)
    // }, 3000)
  }
  createCanvas() {
    this.$html = $(document.createElement('div'))

    this.$html.attr('class', 'dls-timebar-box')
    this.canvas = document.createElement('canvas');

    this.$html.append(this.canvas)


    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.$html[0]);

  }

  _resize() {

    // console.log(this.$html.width())
    this.canvas.width = this.$html.width() * this.ratio;
    this.canvas.height = this.$html.height() * this.ratio;
    this.centerPx = this.$html.width() / 2;
    this.centerHeight = this.$html.height() / 2;
    this.canvas.style.transformOrigin = '0 0'
    this.canvas.style.transform = `scale(${1 / this.ratio, 1 / this.ratio})`;
    this.render();
    this.onChange({ resize: true });
  }

  render() {
    this.ctx.save();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.scale(this.ratio, this.ratio);
    this.ctx.translate(this.translate.x, this.translate.y)
    this.drawUnit();

    let renderData = {
      totalHeight: this.totalWidth,
      screenStartTime: this.getTimeByPixel(0),
      screenEndTime: this.getTimeByPixel(this.$html.height()),
      unitTime: this.unitTime,
      ruler: this
    }
    // window.requestAnimationFrame(this.render.bind(this))
    this.onRender(renderData);
    this.ctx.restore();


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
    let currentStartTime = this.getTimeByPixel(this.translate.y);
    let oneScreenTime = this.getTimeByPixel(this.$html.height()) - this.getTimeByPixel(0);
    this.bufferYears.min = this.getTimeByPixel(0) - oneScreenTime;
    this.bufferYears.max = this.getTimeByPixel(0) + oneScreenTime * 2;
    this.zeroX = this.getYbyTime(0);
    this.renderStartX = ((this.minYear - currentStartTime - oneScreenTime) / this.unitTime) * this.unitWidth;
  }
  drawUnit() {
    /**
     * 为了减少绘制图形数量，采用bufferMinYear & bufferMaxYear的方式绘制，范围未前后一屏；
     * 使用两个循环，分别处理小于1年与1年之后的，保证1年一定存在
     */

    this.ctx.fillStyle = '#999999';
    let loneLineCounter = 0;

    for (let i = 0; i > this.minYear; i -= this.unitTime) {
      if(i < this.bufferYears.min || i > this.bufferYears.max) {
        loneLineCounter++;
        continue;
      }
      let y = Math.floor(-(loneLineCounter + 1) * this.unitWidth + this.zeroX);
      let isLongUnit = (loneLineCounter + 1) % 10 == 0;

      this.drawLine(y, isLongUnit ? 20 : 8);

      // console.log(i)
      if (isLongUnit) {
        this.drawText(i - this.unitTime, y)
      }
      loneLineCounter++;

    }
    loneLineCounter = 0
    for (let j = 1; j < this.maxYear; j += this.unitTime) {
      // console.log(j)
      if(j < this.bufferYears.min || j > this.bufferYears.max) {
        loneLineCounter++;
        continue;
      }

      let y = Math.floor(loneLineCounter * this.unitWidth + this.zeroX);
      let isLongUnit = loneLineCounter % 10 == 0;


      let text = j - 1;
      if (j == 1) {
        text = `${j}AD`
      }

      this.drawLine(y, isLongUnit ? 20 : 8);

      if (isLongUnit) {
        this.drawText(text, y)
      }
      loneLineCounter++;
    }
    // /**
    //  * 绘制1年之前的刻度
    //  */
    // if (this.bufferYears.min < 0) {
    //   for (let i = 0; i > this.bufferYears.min; i -= this.unitTime) {

    //     let y = -(loneLineCounter + 1) * this.unitWidth + this.zeroX;
    //     let isLongUnit = (loneLineCounter + 1) % 10 == 0;

    //     this.drawLine(y, isLongUnit ? 20 : 8);

    //     // console.log(i)
    //     if (isLongUnit) {
    //       this.drawText(i - this.unitTime, y)
    //     }

    //     loneLineCounter++;
    //   }
    // }

    // loneLineCounter = 0;

    /**
     * 绘制1年之后的年份
     */
    // if (this.bufferYears.max > 0) {
    //   for (let i = 1; i < this.bufferYears.max; i += this.unitTime) {

    //     let y = loneLineCounter * this.unitWidth + this.zeroX;;
    //     let isLongUnit = loneLineCounter % 10 == 0;


    //     let text = i - 1;
    //     if (i == 1) {
    //       text = i
    //     }

    //     this.drawLine(y, isLongUnit ? 20 : 8);

    //     if (isLongUnit) {
    //       this.drawText(text, y)
    //     }

    //     loneLineCounter++;
    //   }
    // }
  }

  drawLine(y, width = 10) {

    y = Math.floor(y);

    let halfWidth = width / 2
    this.ctx.beginPath();
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = '#CAD2D6';
    this.ctx.moveTo(this.centerPx - halfWidth, y);
    this.ctx.lineTo(this.centerPx + halfWidth, y);
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

  drawText(year, y) {
    // let month = dateUtil.yearToMonth(year, 'short-en');
    // let text = Math.floor(year);

    // if (month != 'Jan.') {
    //   text += ' ' + month;
    // }
    let text = Math.floor(year);
    if(text !== text) {
      text = 1;
    }
    this.ctx.beginPath();
    this.ctx.textAlign = "center";
    this.ctx.fillText(year < 0 ? `${Math.abs(text)}BC` : text, Math.round(this.centerPx - 30), y + 3)
    this.ctx.closePath();
  }

  _fixOverFlowTranslate(y) {



    // return;
    /**
     * 设置滑动的边界，如果超出滑动边界，则使用边界值
     */
    // console.log(y)
    let startOffsetPx = this.getYbyTime(this.minYear)
    let endOffsetPx = this.getYbyTime(this.maxYear)
    if (y > startOffsetPx) {

      this.translate.y = startOffsetPx;

    } else if (-y > endOffsetPx - this.$html.height()) {
      this.translate.y = -(endOffsetPx - this.$html.height());
    } else {

      this.translate.y = y;
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
   * 传入时间轴y坐标，获取对应位置
   * @param  _y
   */
  getTimeByPixel(_y) {
    let y = _y - this.translate.y;
    let percentY = y / this.totalWidth;
    // console.log(percentX * this.totalTime + this.minYear)
    let time = percentY * this.totalTime + this.minYear;
    if (Math.floor(time) == 0) {
      time = 1;
    }
    return time;
  }

  /**
   *
   * @returns {year,month}
   */
  getDateByPixel(_y) {
    let time = this.getTimeByPixel(_y);
    return {
      year: Math.floor(time),
      month: dateUtil.yearToMonth(time),
    }
  }

  /**
   * 传入时间获取该时间在画布中的 Y
   * @param {number} time
   */
  getYbyTime(time) {
    let percent = (time - this.minYear) / this.totalTime;
    return percent * this.totalWidth;
  }

  /**
   * 传入时间，获取屏幕位置
   * @param {number} time
   */
  getScreenXbyTime(time) {
    let x = this.getYbyTime(time);
    return Math.round(x + this.translate.y);
  }

  /**
   * 获取区间的起始时间
   */
  getAreaTime() {

    let start = this.getTimeByPixel(this.centerHeight - this.startOffsetPx)
    let end = this.getTimeByPixel(this.centerHeight + this.endOffsetPx)
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
    let newY = -this.getYbyTime(time) + this.centerHeight;
    // this.$html.find($('p')).html(time)
    TweenLite.to(this.translate, animate, {
      y: newY,
      onUpdateParams: ['{ self }'],
      onUpdate: (tn) => {
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
    let currentCenterTime = this.getTimeByPixel(this.centerHeight);
    let centerTimeDelta = targetCenterTime - currentCenterTime;
    TweenLite.to(this, animate, {
      ease: Power0.easeNone,
      unitTime,
      unitWidth,
      onUpdateParams: ["{self}"],
      onUpdate: (tn) => {

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
  _touchZoom(delta) {

  }
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
    
    let centerTime = this.getTimeByPixel(this.centerHeight);
    
    /**
     * 计算缩放后的单位长度
     */
    let zoomRatio = this.maxUnitWidth / this.minUnitWidth;
    
    if (newUnitWidth > this.maxUnitWidth) {
      if (this.unitTime <= this.minUnitTime) {
        return
      }
      newUnitWidth = this.minUnitWidth;
      newUnitTime = this.unitTime  / zoomRatio;
    }


    if (newUnitWidth < this.minUnitWidth) {
      if (this.unitTime >= this.maxUnitTime) {
        return
      }
      newUnitWidth = this.maxUnitWidth;
      /**
       * 刻度: 1,2,5,10,20,40 除了5以外都为2倍关系，故5的情况特殊处理
       */
      newUnitTime = this.unitTime * zoomRatio;
    }



    /**
     * 如果缩放超过边界值，则不做任何处理，直接return
     */
    /**
     * 如果10个刻度小于一年则不再缩放
     */
    let offsetAreaDuration = this.getOffsetAreaDuration(newUnitWidth, newUnitTime);
    
    // if ((offsetAreaDuration > 0) && (offsetAreaDuration <= 1)) {
    //   return;
    // }


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
    this._fixOverFlowTranslate(this.translate.y);

    this.updateBufferYears();

    /**
     * 如果总的可选区域小于offsetAreaDuration时间跨度，则固定为时间跨度的宽度
     */
    if (offsetAreaDuration >= this.maxYear - this.minYear) {
      this.setTimeByOffset(this.minYear, this.maxYear);
    }

    // _zoom 方法中不再执行 render函数
    this.render()
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
    // e.preventDefault();

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
  _mousedown(e) {
    this.isMousedown = true;
    this.mousedownPos = {
      x: this.mousePos.x,
      y: this.mousePos.y
    };
    this.downTranslate = {
      ...this.translate
    };
    this.onClick(e)
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
      let delatY = this.mousePos.y - this.mousedownPos.y;

      let newY = this.downTranslate.y + delatY;

      /**
       * 超出边界的处理
       */
      this._fixOverFlowTranslate(newY)


      this.updateBufferYears();
      this.render();
      this.onChange(this);
    }

  }

  _mouseup(e) {
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

  _touchstart(e) {
    this.onClick(e)
    var touches = e.originalEvent.targetTouches;
    this.store.originScale = this.store.scale || 1;
    this.store.moveable = true;
    var events = touches[0];
    var events2 = touches[1];


    // let 


    this.mousedownPos = {
      x: events.clientX,
      y: events.clientY
    };
    this.downTranslate = {
      ...this.translate
    };
    if (events2) {
      this.mousedownPos = {
        x: events.clientX,
        y: events.clientY,
        x2: events2.clientX,
        y2: events2.clientY,
      };
      this.touchCenter = parseInt((events.clientY + events2.clientY) / 2)
      this.$html.find($('p')).html(this.getTimeByPixel(this.touchCenter))
    }

  }
  _touchmove(e) {
    // e.preventDefault();
    if (!this.store.moveable) {
      return;
    }

    var touches = e.originalEvent.targetTouches;

    var events = touches[0];
    var events2 = touches[1];

    if (events) {
      // 单指操作
      this.mousePos.x = events.clientX;
      this.mousePos.y = events.clientY;
      if (this.mousedownPos) {
        if (!this.draggable) {
          return;
        }
        let delatY = this.mousePos.y - this.mousedownPos.y;

        let newY = this.downTranslate.y + delatY;

        /**
         * 超出边界的处理
         */
        this._fixOverFlowTranslate(newY)
        this.updateBufferYears();
        this.render();
        this.onChange(this);
      }
    }

    if (events2) {
      // 双指操作
      if (!this.mousedownPos.x2) {
        this.mousedownPos.x2 = events2.pageX;
      }
      if (!this.mousedownPos.y2) {
        this.mousedownPos.xy = events2.pageY;
      }
      var zoom = this.getDistance({
        x: events.pageX,
        y: events.pageY
      }, {
        x: events2.pageX,
        y: events2.pageY
      }) /
        this.getDistance({
          x: this.mousedownPos.x,
          y: this.mousedownPos.y
        }, {
          x: this.mousedownPos.x2,
          y: this.mousedownPos.y2
        });
      var newScale = this.store.originScale * zoom;
      if (newScale > 3) {
        newScale = 3;
      }

      if (this.store.scale > newScale) {
        this._touchZoom(-this.touchZoomSpeed);
      } else {
        this._touchZoom(this.touchZoomSpeed);
      }
      this.store.scale = newScale;
    }
  }
  _touchend(e) {
    this.store.moveable = false;
    // this.onClick(e)
    delete this.mousedownPos.x2;
    delete this.mousedownPos.y2;
  }
  _touchZoom(delta) {


    /**
     * 定义新的参数
     */
    let newUnitWidth = this.unitWidth;
    let newUnitTime = this.unitTime;
    newUnitWidth += delta;



    /**
     * 获取现在中心时间
     */
    let centerTime = parseInt(this.getTimeByPixel(this.touchCenter));

    /**
     * 计算缩放后的单位长度
     */
    let zoomRatio = this.maxUnitWidth / this.minUnitWidth;



    if (newUnitWidth > this.maxUnitWidth) {
      if (this.unitTime <= this.minUnitTime) {
        return
      }
      newUnitWidth = this.minUnitWidth;
      newUnitTime = Math.floor(this.unitTime / zoomRatio);
    }


    if (newUnitWidth < this.minUnitWidth) {
      if (this.unitTime >= this.maxUnitTime) {
        return
      }
      newUnitWidth = this.maxUnitWidth;
      /**
       * 刻度: 1,2,5,10,20,40 除了5以外都为2倍关系，故5的情况特殊处理
       */
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
    this._fixOverFlowTranslate(this.translate.y);

    this.updateBufferYears();

    /**
     * 如果总的可选区域小于offsetAreaDuration时间跨度，则固定为时间跨度的宽度
     */
    if (offsetAreaDuration >= this.maxYear - this.minYear) {
      this.setTimeByOffset(this.minYear, this.maxYear);
    }

    // _zoom 方法中不再执行 render函数
    this.render()
    /**
     * 触发外部事件
     */
    this.onChange(this);
  }
  getDistance(start, stop) {
    return Math.hypot(stop.x - start.x, stop.y - start.y);
  }

  bind() {

    $('#timebar').on('resize.timebar', this._resize.bind(this))
    $('#timebar').on('mousemove.dls-map-timebar', this._mousemove.bind(this))
    $('#timebar').on('mouseup.dls-map-timebar', this._mouseup.bind(this))


    let mouseEventDom = $(window);
    let toucheEventDom = $('#timebar')


    toucheEventDom.on('mousewheel', this._mouseWheel.bind(this))
    toucheEventDom.on('mousedown', this._mousedown.bind(this))
    toucheEventDom.on('mouseenter', this._mouseenter.bind(this))
    toucheEventDom.on('mouseleave', this._mouseleave.bind(this))

    toucheEventDom.on('touchstart', this._touchstart.bind(this))
    toucheEventDom.on('touchmove', this._touchmove.bind(this))
    toucheEventDom.on('touchend', this._touchend.bind(this))
  }

}

