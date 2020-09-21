import Canvas from './components/canvas'
import Timebar from './components/timebar'
import Avatar from './components/avatar'
import Dot from './components/dot'
import Quote from './components/quote'
import Controller from './components/controller'
import Period from './components/period'
import getLayOut from './components/layout'

import {
  TweenLite,
} from 'gsap';

const SWITCH_LINE_HEIGHT = 15


export default class PhilTimebar {
  constructor(props) {
    Object.assign(this, {
      periodData: [], // 哲学家数据
      philData: [], // 分期数据
      nowPhilData: [], // 现在可显示的哲学家数据
      nowPeriodData: [], // 现在可显示的分期数据
      bubbles: [],
      CIRCLE_DIAMETER: 50,
      BUBBLE_DIAMETER: 170,
      CIRCLE_GAP: 10,
      TEXT_AREA: 10,
      minYear: -800,
      maxYear: new Date().getFullYear(),
      unitTime: [40, 20, 10, 5, 2.5, 1, 0.5, 0.1],
      minUnitWidth: 24,
      maxUnitWidth: 48,
      unitWidth: 24,
      renderList: [],
      level3RenderList: [],
      westRenderList: [],
      eastRenderList: [],
      tabIndex: 1,
      timebarTranslateY: 50,
      tabBarHeight: 0,
      quoteWidth: 120,
      NODE_HEIGHT: 120,
      avatarAssets: {},
      verticalLine: true
    }, props)
    this.initial()
    this.createQuote()
    this.eastBubbles = this.bubbles.filter(item => item.originType == 'EAST')
    this.westBubbles = this.bubbles.filter(item => item.originType == 'WEST')
    this.totalTime = this.maxYear - this.minYear;
    console.log(this.philData)
    this.philDataEast = getLayOut({ nodes: this.philData.filter(node => node.originType == 'EAST'), minYear: this.minYear, maxYear: this.maxYear, radius: this.NODE_HEIGHT });
    this.philDataWest = getLayOut({ nodes: this.philData.filter(node => node.originType == 'WEST'), minYear: this.minYear, maxYear: this.maxYear, radius: this.NODE_HEIGHT });




    this.controller = new Controller({
      $html: this.$html,
      canvas: this.canvas,
      ctx: this.ctx,
      tab: false,
      slider: true,
      onSliderClickHandle: (index) => {
        this.switchImportantce(index)
      }
    })
    this.philData = this.philDataEast.concat(this.philDataWest)

    this.timerbar = new Timebar({
      $html: this.$html,
      canvas: this.canvas,
      ctx: this.ctx,
      minYear: this.minYear,
      maxYear: this.maxYear,
      unitTime: 40,
      minUnitWidth: this.minUnitWidth,
      maxUnitWidth: this.maxUnitWidth,
      unitWidth: this.unitWidth,
      onClick: (e) => {
        this.clearQuote()
        this.onClickHandle(e)
      },
      onRender: (e) => {
        const { ruler, screenStartTime, screenEndTime, totalHeight } = e
        this.screenStartTime = screenStartTime
        this.screenEndTime = screenEndTime
        this.ruler = ruler
        this.totalHeight = totalHeight
        this.nowPeriodData = this.filterPeriodData(screenStartTime, screenEndTime)
        this.drawPeriod(e)
        this.zoomLevel = (screenEndTime - screenStartTime) / window.innerHeight;
        // console.log(this.zoomLevel)
        this.calculatePosition()
      }
    })
    const { level1, level2, level3 } = this.getMinZoom()

  }
  getMinZoom() {
    let level1MinZoomLevel = this.philData.filter(node => node.importance == 1.1).sort((m, n) => m.layout.zoom - n.layout.zoom)
    let level2MinZoomLevel = this.philData.filter(node => node.importance == 2).sort((m, n) => m.layout.zoom - n.layout.zoom)
    let level3MinZoomLevel = this.philData.filter(node => node.importance == 3).sort((m, n) => m.layout && m.layout.zoom - n.layout && n.layout.zoom)

    let level1MinZoom = window.innerHeight * level1MinZoomLevel[level1MinZoomLevel.length - 1].layout.zoom
    let level2MinZoom = window.innerHeight * level2MinZoomLevel[level2MinZoomLevel.length - 1].layout.zoom
    let level3MinZoom = window.innerHeight * level3MinZoomLevel[level2MinZoomLevel.length - 1].layout.zoom
    let level1 = {}
    let level2 = {}
    let level3 = {}
    // 根据 zoom 求当前 unitTime unitWidth
    let level = 1
    for (let index = 0; index < this.unitTime.length; index++) {
      const unitTime = this.unitTime[index];
      if (level > 3) return
      for (let unitWidth = this.minUnitWidth; unitWidth <= this.maxUnitWidth; unitWidth += 1) {
        let divide = window.innerHeight / unitWidth
        switch (level) {
          case 1:
            if (divide * unitTime < level1MinZoom) {
              level1 = {
                unitTime,
                unitWidth
              }
              level++
            }
            break;
          case 2:
            if (divide * unitTime < level2MinZoom) {
              level2 = {
                unitTime,
                unitWidth
              }
              level++
            }
          case 3:
            if (divide * unitTime < level3MinZoom) {
              level3 = {
                unitTime,
                unitWidth
              }
            }
            break;
        }
      }
    }
    return [level1, level2, level3]
  }
  onClickHandle(e) {

    const radius = this.CIRCLE_DIAMETER / 2
    const { pageX, pageY } = e
    let clickQuote = false
    const zeroY = parseInt(this.ruler.getYbyTime(this.screenStartTime))
    // 时间轴点击回调
    let nowScreenRenderList = []

    if (this.tabIndex == 0) {
      let westRenderList = this.philDataWest.filter((item) => {
        return this.screenStartTime <= item.year && item.year <= this.screenEndTime && item.layout && item.layout.zoom > this.zoomLevel
      })
      nowScreenRenderList = westRenderList
    } else if (this.tabIndex == 2) {
      let eastRenderList = this.philDataEast.filter((item) => {
        return this.screenStartTime <= item.year && item.year <= this.screenEndTime && item.layout && item.layout.zoom > this.zoomLevel
      })
      nowScreenRenderList = eastRenderList
    } else if (this.tabIndex == 1) {
      let eastRenderList = this.philDataEast.filter((item) => {
        return this.screenStartTime <= item.year && item.year <= this.screenEndTime && item.layout && item.layout.zoom > this.zoomLevel
      })

      let westRenderList = this.philDataWest.filter((item) => {
        return this.screenStartTime <= item.year && item.year <= this.screenEndTime && item.layout && item.layout.zoom > this.zoomLevel
      })
      nowScreenRenderList = eastRenderList.concat(westRenderList)
    }

    let hasClickNodeList = nowScreenRenderList.filter((item) => {
      const { originType, switchLine } = item


      const x = item.x
      const y = item.y - zeroY + this.tabBarHeight



      if (this.tabIndex == 0 || this.tabIndex == 2) {

        const quoteX = originType == 'EAST' ? 20 : this.centerPx + 40
        const quoteY = item.y + this.tabBarHeight - zeroY
        const quoteHeight = 40

        const quoteMinX = quoteX
        const quoteMaxX = quoteX + this.quoteWidth
        // switchLine 为 true 需要扩大范围
        const quoteMinY = quoteY - (quoteHeight / 2)
        const quoteMaxY = switchLine ? quoteY + (quoteHeight / 2) + SWITCH_LINE_HEIGHT : quoteY + quoteHeight / 2

        const xWithInQuote = quoteMinX <= pageX && pageX <= quoteMaxX
        const yWithInQuote = quoteMinY <= pageY && pageY <= quoteMaxY


        const minY = y - radius
        const maxY = y + radius
        const minX = x - radius
        const maxX = x + radius

        const xWithIn = minX <= pageX && pageX <= maxX
        const yWithIn = minY <= pageY && pageY <= maxY
        if (xWithInQuote && yWithInQuote) {
          clickQuote = true
        }

        return (xWithInQuote && yWithInQuote) || (xWithIn && yWithIn)
      } else {

        const minY = y - radius
        const maxY = y + radius
        const minX = x - radius
        const maxX = x + radius
        const xWithIn = minX <= pageX && pageX <= maxX
        const yWithIn = minY <= pageY && pageY <= maxY

        return xWithIn && yWithIn
      }


    })
    if (hasClickNodeList && hasClickNodeList.length) {
      if (clickQuote) {
        // this.onQuoteClickHandle(e, hasClickNodeList[0])
        console.log(hasClickNodeList[0])
      } else {
        // 弹出跳转 APP 登录框
        console.log(hasClickNodeList[0])
        // this.onNodeClickHandle(hasClickNodeList[0])
      }
    }
  }
  switchImportantce(index) {
    const zoomData = this.getMinZoom()
    const { unitTime, unitWidth } = zoomData[index]
    const startTime = this.screenStartTime
    const endTime = this.screenEndTime
    this.timerbar.zoomToSelectedOffset(startTime, endTime, unitTime, unitWidth, 1)
  }
  createQuote() {
    this.eastQuote = $('<div></div>')
    this.westQuote = $('<div></div>')
    this.eastQuote.addClass('quote').addClass('east-quote')
    this.westQuote.addClass('quote').addClass('west-quote')
    this.$html.append(this.eastQuote)
    this.$html.append(this.westQuote)
    // this.$html.append($(document.createElement('p')))
  }
  showQuote(nowPhilNode) {
    const { y, originType, saying, switchLine } = nowPhilNode
    const QUOTE_MAX_HEIGHT = 150
    const radius = this.CIRCLE_DIAMETER / 2
    const WINDOW_HEIGHT = this.$html.height()
    const zeroY = parseInt(this.ruler.getYbyTime(this.screenStartTime))
    const quoteX = originType == 'EAST' ? 20 : this.centerPx + 40
    const quoteCenterY = y - zeroY
    const quoteHeight = 40
    const quoteMinY = quoteCenterY - (quoteHeight / 2) - QUOTE_MAX_HEIGHT
    const quoteMaxY = switchLine ? quoteCenterY + quoteHeight / 2 + 15 : quoteCenterY + quoteHeight / 2


    let $quote = $(`<div>${saying.title}</div>`)
    $quote.addClass('phil-quote')
    $quote.css('left', quoteX)
    if (y + QUOTE_MAX_HEIGHT >= WINDOW_HEIGHT) {
      $quote.css('top', quoteMinY)
      $quote.css('borderBottom', 'none')
    } else {
      $quote.css('top', quoteMaxY)
      $quote.css('borderTop', 'none')
    }
    $quote.css('height', QUOTE_MAX_HEIGHT)
    this.clearQuote()
    this.$html.append($quote)
  }
  clearQuote() {
    this.$html.find($('.phil-quote')).remove()
  }
  createMockData() {
    let mockData = []

    for (let index = 0; index < this.unitTime.length; index++) {

      let list = []
      let begin = this.minUnitWidth
      let end = this.maxUnitWidth
      let delta = 0.5

      while (begin <= end) {
        list.push(begin)
        begin += delta
      }
      mockData.push(list)
    }
    return mockData
  }
  initial() {
    const { canvas, ctx, $html } = new Canvas()
    this.canvas = canvas
    this.ctx = ctx
    this.$html = $html
    if (this.verticalLine) {
      let $verticalLine = $(document.createElement('div'))
      $verticalLine.css('width', 1)
      $verticalLine.css('height', this.$html.height())
      $verticalLine.css('background-color', 'rgba(151, 151, 151, 0.5)')
      $verticalLine.css('position', 'absolute')
      $verticalLine.css('left', this.$html.width() / 2 - 0.5)
      $verticalLine.css('top', 0)
      this.$html.append($verticalLine)
    }
    this.$body = $('body')[0]
    this.ratio = window.devicePixelRatio

    this.initBubble();
  }
  initBubble() {
    /**
    position: fixed;
    width: calc(50% - 40px);
    top: 50%;
    height: 100px;
    background: red;
    transform: translateY(-50%);
    left: 20px;
     */
    this.bubbleLeft = document.createElement('div');
    this.bubbleLeft.className = 'bubble-left';
    this.bubbleLeft.style.position = 'fixed';
    this.bubbleLeft.style.width = 'calc(50% - 40px)';
    this.bubbleLeft.style.top = '50%';
    this.bubbleLeft.style.left = '20px';
    this.bubbleLeft.style.maxHeight = '600px';
    this.bubbleLeft.style.transform = 'translateY(-50%)';
    this.bubbleLeft.style.border = '1px solid #ffffff';
    this.bubbleLeft.style.borderRadius = '6px';
    this.bubbleLeft.style.opacity = '0';
    this.bubbleLeft.style.boxSizing = 'border-box';
    this.bubbleLeft.style.padding = '8px';
    this.bubbleLeft.style.color = '#ffffff';
    document.body.appendChild(this.bubbleLeft);


    this.bubbleRight = document.createElement('div');
    this.bubbleRight.className = 'bubble-right';
    this.bubbleRight.style.position = 'fixed';
    this.bubbleRight.style.width = 'calc(50% - 40px)';
    this.bubbleRight.style.top = '50%';
    this.bubbleRight.style.right = '20px';
    this.bubbleLeft.style.maxHeight = '600px';
    this.bubbleRight.style.transform = 'translateY(-50%)';
    this.bubbleRight.style.border = '1px solid #ffffff';
    this.bubbleRight.style.borderRadius = '6px';
    this.bubbleRight.style.opacity = '0';
    this.bubbleRight.style.boxSizing = 'border-box';
    this.bubbleRight.style.padding = '8px';
    this.bubbleRight.style.color = '#ffffff';
    document.body.appendChild(this.bubbleRight);

  }
  drawAvatar(avatarData, angle = 0) {
    if (avatarData) {
      const { originType, abbreviation, timeStr, x, y, originY, itemId, avatarUrl, importance } = avatarData
      if (!window[itemId]) {
        window[itemId] = new Avatar({
          $html: this.$html,
          ctx: this.ctx,
          canvas: this.canvas,
          avatarUrl,
          originType,
          philName: abbreviation,
          born: timeStr,
          angle,
          x,
          y,
          originY,
          importance,
          avatarAssets: this.avatarAssets
        })
        window[itemId].draw()
      } else {
        window[itemId].x = x
        window[itemId].y = y
        window[itemId].originType = originType
        window[itemId].philName = abbreviation
        window[itemId].timeStr = timeStr
        window[itemId].originY = originY
        window[itemId].avatarUrl = avatarUrl
        window[itemId].importance = importance
        window[itemId].draw()
      }
    }

  }

  drawNodes(direction = 'EAST', drawQuote = false) {
    let before = -1;
    let nodesDrawCount = 0;
    this.philData.forEach(node => {
      if (node.layout
        && node.originType === direction
        && node.year >= this.ruler.bufferYears.min
        && node.year <= this.ruler.bufferYears.max
      ) {
        let y = (node.year - this.minYear) / this.zoomLevel;

        node.originY = y;
        if (node.layout.zoom >= this.zoomLevel) {
          if (before !== -1) {
            if (y - before >= (this.NODE_HEIGHT)) {
              node.y = y;
            }
            else {
              node.y = before + this.NODE_HEIGHT;
            }
          }
          else {
            node.y = y;
          }
          node.x = direction === 'EAST' ? this.centerPx + 100 : this.centerPx - 100;
          before = node.y;
          this.drawAvatar(node, node.y - node.originY)

          if (drawQuote) {
            let quote = new Quote({
              $html: this.$html,
              canvas: this.canvas,
              ctx: this.ctx,
              originType: node.originType,
              y: node.y,
              saying: node.saying || {},
              centerPx: this.centerPx
            })
            node.switchLine = quote.switchLine
          }
          nodesDrawCount++;
        }
        else {
          new Dot({
            $html: this.$html,
            canvas: this.canvas,
            ctx: this.ctx,
            y: node.originY,
            zoom: node.layout.zoom,
            nowZoom: this.zoomLevel
          })
        }
      }
    })
    if (nodesDrawCount == 0) {
      this.drawBubbles(direction)
    }
    else {
      this.hideBubbles(direction)
    }
  }
  hideBubbles(direction) {
    if (direction === 'WEST') {
      TweenLite.to(this.bubbleLeft, 0.3, {
        opacity: 0
      }, {
        onFinish: () => {
          this.bubbleLeft.style.display = 'none'
        }
      })

    }
    else {
      TweenLite.to(this.bubbleRight, 0.3, {
        opacity: 0
      }, {
        onFinish: () => {
          this.bubbleRight.style.display = 'none'
        }
      })
    }
  }
  drawBubbles(direction = 'WEST') {
    for (let i = 0; i < this.bubbles.length; i++) {
      let bubble = this.bubbles[i];
      if (bubble.philYear <= this.screenEndTime && bubble.philYear >= this.screenStartTime) {
        if (direction === 'WEST') {
          this.bubbleLeft.innerHTML = bubble.bubbleDesc;
          this.bubbleLeft.style.display = 'block'
          TweenLite.to(this.bubbleLeft, 1, { opacity: 1 })
        }
        else {
          this.bubbleRight.innerHTML = bubble.bubbleDesc;
          this.bubbleRight.style.display = 'block'
          TweenLite.to(this.bubbleRight, 1, { opacity: 1 })
        }
      }
    }
  }
  calculatePosition(e) {
    // tab栏进行东西方哲学家筛选功能
    if (this.totalHeight) {
      this.centerPx = this.ruler.centerPx
      this.gapYear = this.ruler.getTimeByPixel(this.CIRCLE_DIAMETER) - this.ruler.getTimeByPixel(0)

      if (this.tabIndex == 0) {
        this.drawNodes('WEST', true);
      } else if (this.tabIndex == 1) {
        this.drawNodes('WEST');
        this.drawNodes('EAST');
      } else if (this.tabIndex == 2) {
        this.drawNodes('EAST', true);
      }
    }
  }
  drawPeriod(e) {
    this.nowPeriodData.forEach((period) => {
      const { periodName, startYear, endYear, type } = period
      const x = type === 'EAST' ? this.$html.width() : 0
      const y = e.ruler.getYbyTime(startYear)
      new Period({
        $html: this.$html,
        canvas: this.canvas,
        ctx: this.ctx,
        periodName,
        startYear,
        endYear,
        origin: type,
        x,
        y
      })
    })
  }
  /**
   * 
   * @param {String} startTime 
   * @param {String} endTime 
   * @desc 根据当前屏幕起始年 过滤不需要显示的分期数据
   */
  filterPeriodData(startTime, endTime) {
    // 分期标识显示逻辑不同于哲学家头像显示逻辑
    return this.periodData.filter(item => item.startYear > startTime || item.endYear < endTime)
  }
}