import Canvas from './components/canvas'
import Timebar from './components/timebar'
import Avatar from './components/avatar'
import Dot from './components/dot'
import Quote from './components/quote'
import Controller from './components/controller'
import Period from './components/period'
import $ from 'jquery'
import _ from 'lodash'

const SWITCH_LINE_HEIGHT = 15


export default class PhilTimebar {
  constructor(props) {
    Object.assign(this, {
      $container: document.body,
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
      unitTime: [40, 20, 10, 5, 2, 1],
      minUnitWidth: 16,
      maxUnitWidth: 32,
      unitWidth: 16,
      renderList: [],
      level3RenderList: [],
      westRenderList: [],
      eastRenderList: [],
      tab: false,
      slider: false,
      tabIndex: 2,
      tabBarHeight: 224,
      quoteWidth: 120,
      quoteTop: document.body.clientHeight * 0.1,
      onNodeClickHandle: () => { },
      onQuoteClickHandle: () => { },
      onRender: () => { },
      onScroll: () => { }
    }, props)
    this.initial()
    this.createQuote()
    this.eastBubbles = this.bubbles.filter(item => item.originType == 'EAST')
    this.westBubbles = this.bubbles.filter(item => item.originType == 'WEST')
    this.eastWithOutLevel3 = this.getHigherLevelData(this.getOriginData('EAST'), 3)
    this.westWithOutLevel3 = this.getHigherLevelData(this.getOriginData('WEST'), 3)
    this.totalTime = this.maxYear - this.minYear;
    this.mockData = this.createMockData()
    this.runMock()




    this.timerbar = new Timebar({
      $html: this.$html,
      $container: this.$container,
      canvas: this.canvas,
      ctx: this.ctx,
      marginTop: this.tabBarHeight,
      onClick: (e) => {
        this.clearQuote()
        this.onClickHandle(e)

      },
      onScroll: (down) => {
        this.onScroll(down)
      },
      onRender: (e) => {
        const { ruler, screenStartTime, screenEndTime, totalHeight, bufferYears } = e
        this.screenStartTime = screenStartTime
        this.screenEndTime = screenEndTime
        this.ruler = ruler
        this.totalHeight = totalHeight
        this.bufferYears = bufferYears
        this.nowZoom = (screenEndTime - screenStartTime) / window.innerHeight;
        this.nowPeriodData = this.filterPeriodData(screenStartTime, screenEndTime)
        this.drawPeriod(e)
        this.calculatePosition(e)

      }
    })

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
  switchData(index) {
    this.tabIndex = index
    this.timerbar.tickerStart()
  }
  onClickHandle(e) {

    const radius = this.CIRCLE_DIAMETER / 2
    const { pageX, pageY } = e
    let clickQuote = false
    const zeroY = parseInt(this.ruler.getYbyTime(this.screenStartTime))
    // 时间轴点击回调



    let nowScreenRenderList = []

    if (this.tabIndex == 0) {
      let westRenderList = this['totalHeight' + this.totalHeight].westRenderList.filter((item) => {
        return this.screenStartTime <= item.year && item.year <= this.screenEndTime && item.canDraw
      })
      nowScreenRenderList = westRenderList
    } else if (this.tabIndex == 2) {
      let eastRenderList = this['totalHeight' + this.totalHeight].eastRenderList.filter((item) => {
        return this.screenStartTime <= item.year && item.year <= this.screenEndTime && item.canDraw
      })
      nowScreenRenderList = eastRenderList
    } else if (this.tabIndex == 1) {
      let westRenderList = this['totalHeight' + this.totalHeight].westRenderList.filter((item) => {
        return this.screenStartTime <= item.year && item.year <= this.screenEndTime && item.canDraw
      })
      let eastRenderList = this['totalHeight' + this.totalHeight].eastRenderList.filter((item) => {
        return this.screenStartTime <= item.year && item.year <= this.screenEndTime && item.canDraw
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
        this.onQuoteClickHandle(e, hasClickNodeList[0])
      } else {
        // 弹出跳转 APP 登录框
        this.onNodeClickHandle(hasClickNodeList[0])
      }
    }

  }

  createQuote() {
    this.eastQuote = $('<div></div>')
    this.westQuote = $('<div></div>')
    this.eastQuote.addClass('quote').addClass('east-quote')
    this.westQuote.addClass('quote').addClass('west-quote')
    document.body.appendChild(this.eastQuote[0])
    document.body.appendChild(this.westQuote[0])
    // this.$html.append(this.westQuote)
    // this.$html.append($(document.createElement('p')))
  }
  showQuote(nowPhilNode, pageY, content) {
    const { y, originType, saying, switchLine } = nowPhilNode
    const QUOTE_MAX_HEIGHT = 150
    const WINDOW_HEIGHT = this.$html.height()

    const zeroY = parseInt(this.ruler.getYbyTime(this.screenStartTime))
    const quoteX = originType == 'EAST' ? 20 : this.centerPx + 40
    const quoteCenterY = y + this.tabBarHeight - zeroY
    const quoteHeight = 40
    const quoteMinY = quoteCenterY - QUOTE_MAX_HEIGHT - (quoteHeight / 2)
    const quoteMaxY = switchLine ? quoteCenterY + (quoteHeight / 2) + 15 : quoteCenterY + (quoteHeight / 2)


    let $quote = $(`<div></div>`).html(content)
    $quote.addClass('phil-quote')
    $quote.css('left', quoteX)
    if (quoteCenterY + QUOTE_MAX_HEIGHT >= WINDOW_HEIGHT - 50) {
      // 大于向上显示
      $quote.css('top', quoteMinY)
      $quote.css('borderBottom', 'none')
    } else {
      $quote.css('top', quoteMaxY)
      $quote.css('borderTop', 'none')
    }
    $quote.css('height', QUOTE_MAX_HEIGHT)
    this.clearQuote()
    $('body').append($quote)
  }
  clearQuote() {
    $('body').find($('.phil-quote')).remove()
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

  runMock() {
    let eastLevel1Data = this.getLevelData(1.1, 'EAST')
    let westLevel1Data = this.getLevelData(1.1, 'WEST')
    let eastLevel2Data = this.getLevelData(1.2, 'EAST')
    let westLevel2Data = this.getLevelData(1.2, 'WEST')
    let eastLevel3Data = this.getLevelData(2, 'EAST')
    let westLevel3Data = this.getLevelData(2, 'WEST')

    let eastRenderList = []
    let westRenderList = []
    for (let index = 0; index < this.mockData.length; index++) {
      const unitTime = this.unitTime[index]
      const unitHeightList = this.mockData[index];
      for (let index = 0; index < unitHeightList.length; index++) {

        const unitHeight = unitHeightList[index];
        const totalHeight = unitHeight * ((this.maxYear - this.minYear) / unitTime);
        const zoom = this.CIRCLE_DIAMETER / totalHeight
        // 从优先级最高的节点数组开始模拟渲染，如该优先级节点的 zoom 有值,开始遍历下一个优先级节点列表
        const eastLevel1Finished = eastLevel1Data.every(item => item.zoom)
        const eastLevel3Finished = eastLevel3Data.every(item => item.zoom)
        const westLevel1Finished = westLevel1Data.every(item => item.zoom)
        const westLevel3Finished = westLevel3Data.every(item => item.zoom)
        // const level2Finished = level2Data.every(item => item.zoom)
        // const level3Finished = level3Data.every(item => item.zoom)
        // const level4Finished = level4Data.every(item => item.zoom)

        // 需要知道该节点在哪个zoom等级下可以被渲染
        if (!eastLevel1Finished || !westLevel1Finished) {
          // 将该级别节点分为东西两部分，各自分别进行在该zoom等级下进行比较 重合关系
          if (!eastLevel1Finished) {
            this.mapMockHighLevelNodeList(zoom, totalHeight, eastLevel1Data, eastRenderList)
          }
          if (!westLevel1Finished) {
            this.mapMockHighLevelNodeList(zoom, totalHeight, westLevel1Data, westRenderList)
          }
        } else if (!eastLevel3Finished || !westLevel3Finished) {
          if (!eastLevel3Finished) {
            this.mapMockLowLevelNodeList(zoom, totalHeight, eastLevel3Data, eastRenderList)

          }
          if (!westLevel3Finished) {
            this.mapMockLowLevelNodeList(zoom, totalHeight, westLevel3Data, westRenderList)
          }

        }

      }
    }

    console.log(eastLevel1Data)
    console.log(westLevel1Data.filter((item) => { return !item.zoom }))
    console.log(eastLevel3Data)
    console.log(westLevel3Data.filter((item) => { return !item.zoom }))
  }
  calculateBubbles(bubbles, nodeList, zoom, totalHeight) {
    for (let index = 0; index < bubbles.length; index++) {
      const bubble = bubbles[index];
      const hasCoinCideNodeList = this.findCoinCideNode(bubble, nodeList, totalHeight)
      if (hasCoinCideNodeList) {
        // do nothing
      } else {
        if (!bubble.zoom) {
          bubble.zoom = zoom
        }
      }
    }
  }
  findCoinCideNode(bubble, nodeList, totalHeight) {
    const bubbleNowY = this.mockGetYByTime(bubble.philYear, totalHeight)
    const bubbleMinY = bubbleNowY - this.BUBBLE_DIAMETER
    const bubbleMaxY = bubbleNowY + this.BUBBLE_DIAMETER

    return !nodeList.map(item => {
      if (bubbleMinY <= item.y && item.y <= bubbleMaxY) {
        return item
      } else {
        return false
      }
    }).every(item => !item)
  }
  mockCheckCoinCide(prevNodeY, nowNodeY) {

    const y = prevNodeY.y
    const minY = y - this.CIRCLE_DIAMETER
    const maxY = y + this.CIRCLE_DIAMETER + 50
    const targetY = nowNodeY
    const targetMinY = targetY - this.CIRCLE_DIAMETER
    return targetMinY < maxY
  }
  mockGetYByTime(time, totalHeight) {
    const totalTime = this.maxYear - this.minYear;
    let percent = (time - this.minYear) / totalTime;
    return parseInt(percent * totalHeight);
  }
  initial() {
    const { canvas, ctx, $html } = new Canvas()
    this.canvas = canvas
    this.ctx = ctx
    this.$html = $html
    this.$body = $('body')[0]
    this.ratio = window.devicePixelRatio

    this.eastLevel1Data = this.getLevelData(1.1, 'EAST')
    this.eastLevel2Data = this.getLevelData(1.2, 'EAST')
    this.eastLevel3Data = this.getLevelData(2, 'EAST')
    // this.eastLevel3Data = this.philData.filter(phil => phil.originType === 'EAST').filter(phil => phil.importance >= 2).sort((m, n) => m.year - n.year)
    this.eastLevel4Data = this.getLevelData(3, 'EAST')
    this.westLevel1Data = this.getLevelData(1.1, 'WEST')
    this.westLevel2Data = this.getLevelData(1.2, 'WEST')
    this.westLevel3Data = this.getLevelData(2, 'WEST')
    // this.westLevel3Data = this.philData.filter(phil => phil.originType === 'WEST').filter(phil => phil.importance >= 2).sort((m, n) => m.year - n.year)
    this.westLevel4Data = this.getLevelData(3, 'WEST')

  }
  drawBubble(title, desc) {
    let $container = $('<div></div>')
    $container.addClass('bubble')
    $container.html('当前节点与上一个节点是否重合，只需要比较当前节点的最小 Y 值是否大于上个节点的最大值  ')
    $('body').append($container)
  }
  checkIsCoinCide(compareNode, nowNode) {

    if (compareNode.year <= nowNode.year) {
      const y = compareNode.y
      const minY = y - this.CIRCLE_DIAMETER
      const maxY = y + this.CIRCLE_DIAMETER + 50
      const targetY = nowNode.y
      const targetMinY = targetY - this.CIRCLE_DIAMETER / 2
      return targetMinY < maxY
    } else {
      const y = compareNode.y
      const minY = y - this.CIRCLE_DIAMETER
      const maxY = y + this.CIRCLE_DIAMETER
      const targetY = nowNode.y
      const targetMaxY = targetY + this.CIRCLE_DIAMETER + 50
      return targetMaxY > minY
    }



  }
  getYbyTime(time) {
    let percent = (time - this.minYear) / this.totalTime;
    return percent * this.totalHeight;
  }
  getLevelData(level, originType) {
    const list = this.philData
    if (originType) {
      return list.filter(phil => phil.originType === originType.toUpperCase()).filter(phil => phil.importance == level).sort((m, n) => m.year - n.year)
    } else {
      return list.filter(phil => phil.importance == level).sort((m, n) => m.year - n.year)
    }

  }
  hideAvatar(avatarData) {
    if (avatarData) {
      const { originType, itemName, timeStr, x, y, originY, itemId, avatarUrl, angle } = avatarData
      window[itemId].x = x
      window[itemId].y = y
      window[itemId].originType = originType
      window[itemId].philName = itemName
      window[itemId].born = timeStr
      window[itemId].originY = originY
      window[itemId].angle = angle
      window[itemId].avatarUrl = avatarUrl
      window[itemId].hasShow = false
      // window[itemId].hide()
    }
  }
  drawAvatar(avatarData,) {
    if (avatarData) {
      const { originType, itemName, timeStr, x, y, originY, itemId, avatarUrl, angle, importance } = avatarData
      if (!window[itemId]) {
        window[itemId] = new Avatar({
          $html: this.$html,
          ctx: this.ctx,
          canvas: this.canvas,
          avatarUrl,
          originType,
          philName: itemName,
          born: timeStr,
          angle,
          importance,
          x,
          y,
          originY,
        })
        window[itemId].draw()
      } else {
        window[itemId].x = x
        window[itemId].y = y
        window[itemId].originType = originType
        window[itemId].philName = itemName
        window[itemId].born = timeStr
        window[itemId].originY = originY
        window[itemId].angle = angle
        window[itemId].avatarUrl = avatarUrl
        window[itemId].importance = importance
        // window[itemId].hasShow = true
        window[itemId].draw()
      }
    }

  }
  calculatePosition(e) {
    // tab栏进行东西方哲学家筛选功能
    const { ruler, totalHeight } = e
    if (totalHeight) {


      this.westRenderList = []
      this.eastRenderList = []
      this.centerPx = this.ruler.centerPx
      if (this['totalHeight' + totalHeight]) {

        if (this.tabIndex == 0) {
          this['totalHeight' + totalHeight].westRenderList.forEach(nowPhilNode => {
            const { itemId } = nowPhilNode
            let isWithInScreen = this.checkIsWithIn(nowPhilNode)
            if (nowPhilNode.canDraw && isWithInScreen) {
              if (nowPhilNode.saying) {
                this.drawPhilQuote(nowPhilNode)
              }
              this.drawAvatar(nowPhilNode, nowPhilNode.angle ? nowPhilNode.angle : false)
            } else {
              if (window[itemId]) {
                window[itemId].hasShow = false
                window[itemId].hide()
              }
              this.drawDot(nowPhilNode.y, nowPhilNode.zoom, this.nowZoom)
            }
          })
        } else if (this.tabIndex == 1) {
          this['totalHeight' + totalHeight].westRenderList.forEach(nowPhilNode => {
            const { itemId } = nowPhilNode
            let isWithInScreen = this.checkIsWithIn(nowPhilNode)
            if (nowPhilNode.canDraw && isWithInScreen) {
              this.drawAvatar(nowPhilNode, nowPhilNode.angle ? nowPhilNode.angle : false)
            } else {
              if (window[itemId]) {
                window[itemId].hasShow = false
                window[itemId].hide()
              }
              this.drawDot(nowPhilNode.y, nowPhilNode.zoom, this.nowZoom)
            }
          })
          this['totalHeight' + totalHeight].eastRenderList.forEach(nowPhilNode => {
            const { itemId } = nowPhilNode
            let isWithInScreen = this.checkIsWithIn(nowPhilNode)
            if (nowPhilNode.canDraw && isWithInScreen) {
              this.drawAvatar(nowPhilNode, nowPhilNode.angle ? nowPhilNode.angle : false)
            } else {
              if (window[itemId]) {
                window[itemId].hasShow = false
                window[itemId].hide()
              }
              this.drawDot(nowPhilNode.y, nowPhilNode.zoom, this.nowZoom)
            }
          })
        } else if (this.tabIndex == 2) {
          this['totalHeight' + totalHeight].eastRenderList.forEach(nowPhilNode => {
            const { itemId } = nowPhilNode
            let isWithInScreen = this.checkIsWithIn(nowPhilNode)
            if (nowPhilNode.canDraw && isWithInScreen) {
              if (nowPhilNode.saying) {
                this.drawPhilQuote(nowPhilNode)
              }
              this.drawAvatar(nowPhilNode, nowPhilNode.angle ? nowPhilNode.angle : false)
            } else {
              if (window[itemId]) {
                window[itemId].hasShow = false
                window[itemId].hide()
              }
              this.drawDot(nowPhilNode.y, nowPhilNode.zoom, this.nowZoom)
            }
          })
        }
      } else {

        this['totalHeight' + totalHeight] = {}
        this.philData.forEach(phil => {
          const { originType, year } = phil
          phil.x = originType === 'EAST' ? this.centerPx + 100 : this.centerPx - 100
          phil.y = parseInt(this.ruler.getYbyTime(year))
          phil.originY = parseInt(this.ruler.getYbyTime(year))
        })

        this.westRenderList = this.mapHighLevelNodeList('WEST')
        this.eastRenderList = this.mapHighLevelNodeList('EAST')
        this['totalHeight' + totalHeight].westRenderList = _.cloneDeep(this.westRenderList)
        this['totalHeight' + totalHeight].eastRenderList = _.cloneDeep(this.eastRenderList)
        if (this.tabIndex == 0) {
          this.westRenderList.forEach(nowPhilNode => {
            const { itemId } = nowPhilNode
            let isWithInScreen = this.checkIsWithIn(nowPhilNode)
            if (nowPhilNode.canDraw && isWithInScreen) {
              if (nowPhilNode.saying) {
                this.drawPhilQuote(nowPhilNode)
              }
              this.drawAvatar(nowPhilNode, nowPhilNode.angle ? nowPhilNode.angle : false)
            } else {
              if (window[itemId]) {
                window[itemId].hasShow = false
                window[itemId].hide()
              }
              this.drawDot(nowPhilNode.y, nowPhilNode.zoom, this.nowZoom)
            }
          })

        } else if (this.tabIndex == 1) {
          this.westRenderList.forEach(nowPhilNode => {
            const { itemId } = nowPhilNode
            let isWithInScreen = this.checkIsWithIn(nowPhilNode)
            if (nowPhilNode.canDraw && isWithInScreen) {
              this.drawAvatar(nowPhilNode, nowPhilNode.angle ? nowPhilNode.angle : false)
            } else {
              if (window[itemId]) {
                window[itemId].hasShow = false
                window[itemId].hide()
              }
              this.drawDot(nowPhilNode.y, nowPhilNode.zoom, this.nowZoom)
            }
          })
          this.eastRenderList.forEach(nowPhilNode => {
            const { itemId } = nowPhilNode
            let isWithInScreen = this.checkIsWithIn(nowPhilNode)
            if (nowPhilNode.canDraw && isWithInScreen) {
              this.drawAvatar(nowPhilNode, nowPhilNode.angle ? nowPhilNode.angle : false)
            } else {
              if (window[itemId]) {
                window[itemId].hasShow = false
                window[itemId].hide()
              }
              this.drawDot(nowPhilNode.y, nowPhilNode.zoom, this.nowZoom)
            }
          })
        } else if (this.tabIndex == 2) {
          this.eastRenderList.forEach(nowPhilNode => {
            const { itemId } = nowPhilNode
            let isWithInScreen = this.checkIsWithIn(nowPhilNode)
            if (nowPhilNode.canDraw && isWithInScreen) {
              if (nowPhilNode.saying) {
                this.drawPhilQuote(nowPhilNode)
              }
              this.drawAvatar(nowPhilNode, nowPhilNode.angle ? nowPhilNode.angle : false)
            } else {
              if (window[itemId]) {
                window[itemId].hasShow = false
                window[itemId].hide()
              }
              this.drawDot(nowPhilNode.y, nowPhilNode.zoom, this.nowZoom)
            }
          })


        }
      }
      this.eastWithInData = this.filterWithInPhilData(this.eastWithOutLevel3, this.screenStartTime, this.screenEndTime)
      this.westWithInData = this.filterWithInPhilData(this.westWithOutLevel3, this.screenStartTime, this.screenEndTime)

      if (this.tabIndex == 2) {
        if ((this.eastWithInData && !this.eastWithInData.length) || this.eastWithInData.every(item => item.canDraw)) {
          // 如果屏幕内不存在任何东方节点
          let quoteList = this.findNearestQuote(this.eastBubbles, this.screenEndTime)

          if (quoteList) {


            // 如果存在可显示的 quote
            let $content = $('<div></div>')

            let title = $(`<div class="quote-title">${quoteList.bubbleTitle}</div>`)
            $content.append(title)
            let desc = quoteList.bubbleDesc
            $content.append(`<div class="quote-content">${desc}</div>`)
            this.eastQuote.html($content)
            let quoteHeight = this.eastQuote.outerHeight()


            let canShow = this.eastWithInData.every(item => {
              let itemMinY = item.y - this.CIRCLE_DIAMETER / 2
              let itemMaxY = item.y + this.CIRCLE_DIAMETER
              return itemMinY > this.quoteTop + quoteHeight && itemMaxY < this.quoteTop
            })
            if (canShow) {
              this.eastQuote.addClass('show')
            } else {
              this.eastQuote.removeClass('show')
            }
          }

        } else {
          this.eastQuote.removeClass('show')
        }
      }
      if (this.tabIndex == 0) {
        if ((this.westWithInData && !this.westWithInData.length) || this.westWithInData.every(item => item.canDraw)) {
          // 如果屏幕内不存在任何西方节点
          let quoteList = this.findNearestQuote(this.westBubbles, this.screenEndTime)
          if (quoteList) {
            // 如果存在可显示的 quote
            let $content = $('<div></div>')
            let title = $(`<div class="quote-title">${quoteList.bubbleTitle}</div>`)
            $content.append(title)
            let desc = quoteList.bubbleDesc
            $content.append(`<div class="quote-content">${desc}</div>`)
            this.westQuote.html($content)
            let quoteHeight = this.westQuote.outerHeight()
            let canShow = this.westWithInData.every(item => {
              let itemMinY = item.y - this.CIRCLE_DIAMETER / 2
              let itemMaxY = item.y + this.CIRCLE_DIAMETER
              return itemMinY > this.quoteTop + quoteHeight && itemMaxY < this.quoteTop
            })
            if (canShow) {
              this.westQuote.addClass('show')
            } else {
              this.westQuote.removeClass('show')
            }

          }
        } else {
          this.westQuote.removeClass('show')
        }
      }


    }
  }
  checkIsWithIn(nowPhilNode) {
    const { year } = nowPhilNode
    return this.bufferYears.min <= year && year <= this.bufferYears.max
  }
  drawPhilQuote(nowPhilNode) {
    const { y, saying, originType } = nowPhilNode

    let quote = new Quote({
      $html: this.$html,
      canvas: this.canvas,
      ctx: this.ctx,
      originType,
      y,
      saying,
      centerPx: this.centerPx
    })
    nowPhilNode.switchLine = quote.switchLine
  }
  mapHighLevelNodeList(originType) {
    let renderList = originType == 'EAST' ? this.eastRenderList : this.westRenderList
    let highLevelNodeList = originType == 'EAST' ? this.eastLevel1Data : this.westLevel1Data
    let highLevelRenderList = highLevelNodeList.map((nowPhilNode, index) => {
      if (index == 0) {
        nowPhilNode.angle = 0
        nowPhilNode.canDraw = true
        if (renderList.every(item => item.id !== nowPhilNode.id)) {
          renderList.push(nowPhilNode)
        }
        return nowPhilNode
      } else {
        // 从当前级别节点索引第2个开始

        // 获取当前节点的前一个节点和下一个节点
        const [prevPhilNode, nextPhilNode] = this.findNearestNode(renderList, nowPhilNode)
        // 如果在整个同级列表中，有其他节点比当前节点年份辐射范围内，但是还没有被画出,应等待那个节点被画完再进行 draw
        const hasNotDrawNode = this.findEarlyButNotDrawNode(highLevelNodeList, renderList, nowPhilNode)
        // if (nowPhilNode.itemName == '王夫之') {
        //   console.log(nowPhilNode)
        //   console.log(prevPhilNode)

        //   console.log(hasNotDrawNode)
        // }
        if (!hasNotDrawNode) {
          // 判断当前节点是否与已渲染列表中的上下节点重合
          const isPrevCoinCide = this.checkIsCoinCide(prevPhilNode, nowPhilNode)
          // console.log(isPrevCoinCide)
          if (isPrevCoinCide && prevPhilNode.canDraw) {
            // 如果当前节点与上一个节点重合
            if (prevPhilNode.angle > 0) {
              // 如果上一个节点是折线显示中
              // 那么当前这个节点就不应被画
              nowPhilNode.canDraw = false
              nowPhilNode.hasShow = false
              this.drawDot(nowPhilNode.y, nowPhilNode.zoom, this.nowZoom)

              let hasNodeList = renderList.filter(item => item.id == nowPhilNode.id)
              if (hasNodeList && hasNodeList.length) {
                let index = renderList.findIndex(item => item.id == hasNodeList[0].id)
                renderList.splice(index, 1)
              }
              return nowPhilNode
            } else {
              // 上一个节点是直线显示
              // 需要折线处理的节点

              const angle = this.calculateNowNodeAngle(prevPhilNode, nowPhilNode)
              nowPhilNode.angle = angle
              nowPhilNode.y = angle * 120 + nowPhilNode.y
              nowPhilNode.canDraw = true
              if (renderList.every(item => item.id !== nowPhilNode.id)) {
                renderList.push(nowPhilNode)
              }
              return nowPhilNode
            }
          } else {
            // 如果当前节点与上一个节点不重合
            nowPhilNode.angle = 0
            nowPhilNode.canDraw = true
            if (renderList.every(item => item.id !== nowPhilNode.id)) {
              renderList.push(nowPhilNode)
            }
            return nowPhilNode
          }
        } else {
          // this.drawDot(nowPhilNode.y, nowPhilNode.zoom, this.nowZoom)
          nowPhilNode.canDraw = false
          nowPhilNode.hasShow = false
          let hasNodeList = renderList.filter(item => item.id == nowPhilNode.id)
          if (hasNodeList && hasNodeList.length) {
            let index = renderList.findIndex(item => item.id == hasNodeList[0].id)
            renderList.splice(index, 1)
          }
          return nowPhilNode
        }
      }
    })
    let lowLevelData = originType == 'EAST' ? this.eastLevel3Data : this.westLevel3Data
    // return highLevelRenderList
    if (highLevelRenderList.every(item => item.canDraw)) {

      let lowLevelRenderList = this.mapLowLevelNodeList(lowLevelData, renderList, highLevelNodeList)
      return highLevelRenderList.concat(lowLevelRenderList)
    } else {
      lowLevelData.forEach((item) => {
        item.canDraw = false
      })
      let hasNodeList = renderList.filter(item => {
        return item.importance == 2
      })
      if (hasNodeList && hasNodeList.length) {
        renderList = renderList.filter(item => !hasNodeList.some(ele => ele.id === item.id));
      }
      return highLevelRenderList.concat(lowLevelData)
    }
  }
  mapLowLevelNodeList(nodeList, renderList, highLevelNodeList) {

    return nodeList.map((nowPhilNode, index) => {
      // 低优先级节点 需要上下比较已经存在的节点
      const [prevPhilNode, nextPhilNode] = this.findNearestNode(renderList, nowPhilNode)
      const isPrevCoinCide = this.checkIsCoinCide(prevPhilNode, nowPhilNode)
      const isNextCoinCide = this.checkIsCoinCide(nextPhilNode, nowPhilNode)
      if (isNextCoinCide) {
        if (nextPhilNode.angle == 0) {
          nowPhilNode.canDraw = false
          let hasNodeList = renderList.filter(item => item.id == nowPhilNode.id)
          if (hasNodeList && hasNodeList.length) {
            let index = renderList.findIndex(item => item.id == hasNodeList[0].id)
            renderList.splice(index, 1)
          }
          return nowPhilNode
        } else {
          return nowPhilNode
        }

      } else {
        if (isPrevCoinCide && prevPhilNode.canDraw) {
          if (prevPhilNode.angle == 0) {
            const prevIndexPhilNode = nodeList[index - 1] || {}
            if (prevIndexPhilNode && prevIndexPhilNode.year == nowPhilNode.year) {
              const angle = this.calculateNowNodeAngle(prevIndexPhilNode, nowPhilNode)
              let cloneNowPhilNode = Object.assign({}, nowPhilNode)
              cloneNowPhilNode.angle = angle
              cloneNowPhilNode.y = angle * 120 + nowPhilNode.y
              const isPrevCoinCide = this.checkIsCoinCide(prevIndexPhilNode, cloneNowPhilNode)
              if (!isPrevCoinCide && prevPhilNode.canDraw) {
                nowPhilNode.angle = angle
                nowPhilNode.y = angle * 120 + nowPhilNode.y
                nowPhilNode.canDraw = true
                if (renderList.every(item => item.id !== nowPhilNode.id)) {
                  renderList.push(nowPhilNode)
                }
                return nowPhilNode
              } else {
                nowPhilNode.canDraw = false
                let hasNodeList = renderList.filter(item => item.id == nowPhilNode.id)
                if (hasNodeList && hasNodeList.length) {
                  let index = renderList.findIndex(item => item.id == hasNodeList[0].id)
                  renderList.splice(index, 1)
                }
                return nowPhilNode
              }
            } else {
              const angle = this.calculateNowNodeAngle(prevPhilNode, nowPhilNode)
              let cloneNowPhilNode = Object.assign({}, nowPhilNode)
              cloneNowPhilNode.angle = angle
              cloneNowPhilNode.y = angle * 120 + nowPhilNode.y

              if (!isNextCoinCide) {
                nowPhilNode.angle = angle
                nowPhilNode.y = angle * 120 + nowPhilNode.y
                nowPhilNode.canDraw = true
                if (renderList.every(item => item.id !== nowPhilNode.id)) {
                  renderList.push(nowPhilNode)
                }
                return nowPhilNode
              } else {
                nowPhilNode.canDraw = false
                let hasNodeList = renderList.filter(item => item.id == nowPhilNode.id)
                if (hasNodeList && hasNodeList.length) {
                  let index = renderList.findIndex(item => item.id == hasNodeList[0].id)
                  renderList.splice(index, 1)
                }
                return nowPhilNode
              }
            }

          } else {
            nowPhilNode.canDraw = false
            let hasNodeList = renderList.filter(item => item.id == nowPhilNode.id)
            if (hasNodeList && hasNodeList.length) {
              let index = renderList.findIndex(item => item.id == hasNodeList[0].id)
              renderList.splice(index, 1)
            }
            return nowPhilNode
          }
        } else {
          // 与上下节点都不重合
          const prevIndexPhilNode = nodeList[index - 1] || {}

          if (prevIndexPhilNode && prevIndexPhilNode.year == nowPhilNode.year) {
            const angle = this.calculateNowNodeAngle(prevIndexPhilNode, nowPhilNode)
            let cloneNowPhilNode = Object.assign({}, nowPhilNode)
            cloneNowPhilNode.angle = angle
            cloneNowPhilNode.y = angle * 120 + nowPhilNode.y
            const isPrevCoinCide = this.checkIsCoinCide(prevIndexPhilNode, cloneNowPhilNode)
            if (!isPrevCoinCide && prevIndexPhilNode.canDraw) {
              nowPhilNode.angle = angle
              nowPhilNode.y = angle * 120 + nowPhilNode.y
              nowPhilNode.canDraw = true
              if (renderList.every(item => item.id !== nowPhilNode.id)) {
                renderList.push(nowPhilNode)
              }
              return nowPhilNode
            } else {
              nowPhilNode.canDraw = false
              let hasNodeList = renderList.filter(item => item.id == nowPhilNode.id)
              if (hasNodeList && hasNodeList.length) {
                let index = renderList.findIndex(item => item.id == hasNodeList[0].id)
                renderList.splice(index, 1)
              }
              return nowPhilNode
            }
          } else {
            if (prevPhilNode.angle > 0) {
              nowPhilNode.canDraw = false
              let hasNodeList = renderList.filter(item => item.id == nowPhilNode.id)
              if (hasNodeList && hasNodeList.length) {
                let index = renderList.findIndex(item => item.id == hasNodeList[0].id)
                renderList.splice(index, 1)
              }
              return nowPhilNode
            } else {
              nowPhilNode.angle = 0
              nowPhilNode.canDraw = true
              if (renderList.every(item => item.id !== nowPhilNode.id)) {
                renderList.push(nowPhilNode)
              }
              return nowPhilNode
            }
          }



        }
      }
    })

  }
  mapMockHighLevelNodeList(zoom, totalHeight, nodelist, renderList) {

    for (let index = 0; index < nodelist.length; index++) {
      const nowPhilNode = nodelist[index];
      nowPhilNode.y = this.mockGetYByTime(nowPhilNode.year, totalHeight)

      if (index == 0) {
        if (!nowPhilNode.zoom) {
          nowPhilNode.zoom = zoom
        }
        nowPhilNode.angle = 0
        if (renderList.every(item => item.id !== nowPhilNode.id)) {
          renderList.push(nowPhilNode)
        }
      } else {
        // 从当前级别节点索引第2个开始

        // 获取当前节点的前一个节点和下一个节点
        const [prevPhilNode, nextPhilNode] = this.findNearestNode(renderList, nowPhilNode)
        // 如果在整个同级列表中，有其他节点比当前节点年份辐射范围内，但是还没有被画出,应等待那个节点被画完再进行 draw
        // 判断当前节点是否与已渲染列表中的上下节点重合
        const isPrevCoinCide = this.checkIsCoinCide(prevPhilNode, nowPhilNode)
        if (isPrevCoinCide) {
          // 如果当前节点与上一个节点重合
          if (prevPhilNode.angle > 0) {
            // 如果上一个节点是折线显示中
            // 那么当前这个节点就不应被画

          } else {
            // 上一个节点是直线显示
            // 需要折线处理的节点
            if (!nowPhilNode.zoom) {
              nowPhilNode.zoom = zoom
            }
            const angle = this.calculateNowNodeAngle(prevPhilNode, nowPhilNode)
            nowPhilNode.angle = angle
            nowPhilNode.y = angle * 120 + nowPhilNode.y

            if (renderList.every(item => item.id !== nowPhilNode.id)) {
              renderList.push(nowPhilNode)
            }
          }
        } else {
          // 如果当前节点与上一个节点不重合
          if (!nowPhilNode.zoom) {
            nowPhilNode.zoom = zoom
          }
          if (renderList.every(item => item.id !== nowPhilNode.id)) {
            renderList.push(nowPhilNode)
          }
        }
      }
    }
  }
  mapMockLowLevelNodeList(zoom, totalHeight, nodeList, renderList) {
    for (let index = 0; index < nodeList.length; index++) {
      const nowPhilNode = nodeList[index]
      nowPhilNode.y = this.mockGetYByTime(nowPhilNode.year, totalHeight)
      const [prevPhilNode, nextPhilNode] = this.findNearestNode(renderList, nowPhilNode)
      prevPhilNode.y = this.mockGetYByTime(prevPhilNode.year, totalHeight)
      nextPhilNode.y = this.mockGetYByTime(nextPhilNode.year, totalHeight)
      const isPrevCoinCide = this.checkIsCoinCide(prevPhilNode, nowPhilNode)
      const isNextCoinCide = this.checkIsCoinCide(nextPhilNode, nowPhilNode)
      if (isNextCoinCide) {
        nowPhilNode.canDraw = false
        let hasNodeList = renderList.filter(item => item.id == nowPhilNode.id)
        if (hasNodeList && hasNodeList.length) {
          let index = renderList.findIndex(item => item.id == hasNodeList[0].id)
          renderList.splice(index, 1)
        }
      } else {
        if (isPrevCoinCide) {
          if (prevPhilNode.angle == 0) {
            const angle = this.calculateNowNodeAngle(prevPhilNode, nowPhilNode)
            let cloneNowPhilNode = Object.assign({}, nowPhilNode)
            cloneNowPhilNode.angle = angle
            cloneNowPhilNode.y = angle * 120 + nowPhilNode.y
            const isNextCoinCide = this.checkIsCoinCide(nextPhilNode, cloneNowPhilNode)
            if (!isNextCoinCide) {
              nowPhilNode.angle = angle
              nowPhilNode.y = angle * 120 + nowPhilNode.y
              if (!nowPhilNode.zoom) {
                nowPhilNode.zoom = zoom
              }
              if (renderList.every(item => item.id !== nowPhilNode.id)) {
                renderList.push(nowPhilNode)
              }
            } else {
              nowPhilNode.canDraw = false
              let hasNodeList = renderList.filter(item => item.id == nowPhilNode.id)
              if (hasNodeList && hasNodeList.length) {
                let index = renderList.findIndex(item => item.id == hasNodeList[0].id)
                renderList.splice(index, 1)
              }
            }
          } else {
            let hasNodeList = renderList.filter(item => item.id == nowPhilNode.id)
            if (hasNodeList && hasNodeList.length) {
              let index = renderList.findIndex(item => item.id == hasNodeList[0].id)
              renderList.splice(index, 1)
            }
          }
        } else {
          nowPhilNode.angle = 0
          if (!nowPhilNode.zoom) {
            nowPhilNode.zoom = zoom
          }
          if (renderList.every(item => item.id !== nowPhilNode.id)) {
            renderList.push(nowPhilNode)
          }
          // const prevIndexPhilNode = nodeList[index - 1] || {}
          // if (prevPhilNode.angle > 0 || prevIndexPhilNode.angle > 0) {
          //   let hasNodeList = renderList.filter(item => item.id == nowPhilNode.id)
          //   if (hasNodeList && hasNodeList.length) {
          //     let index = renderList.findIndex(item => item.id == hasNodeList[0].id)
          //     renderList.splice(index, 1)
          //   }
          // } else {

          // }
        }
      }
    }
  }
  /**
   * 
   * @param {Object} referNode 当前节点偏移的参照节点
   * @param {Object} nowNode  当前节点
   * @param {TimeBar} e
   */
  calculateNowNodeAngle(referNode, nowNode) {
    const originY = nowNode.y
    const prevNodeMaxY = referNode.y + this.CIRCLE_DIAMETER + 50
    const triangleHeight = prevNodeMaxY - originY
    const triangleLong = 100
    const hypotenuse = Math.sqrt((Math.pow(triangleHeight, 2) + Math.pow(triangleLong, 2)))
    const angle = (triangleHeight / hypotenuse) >= 0 ? (triangleHeight / hypotenuse) : 0
    return angle
  }
  getHigherLevelData(nodeList, importance) {
    return nodeList.filter(item => item.importance < importance)
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
  drawDot(y, zoom, nowZoom) {
    new Dot({
      $html: this.$html,
      canvas: this.canvas,
      ctx: this.ctx,
      y,
      zoom,
      nowZoom
    })
  }
  drawQuote(bubble) {
    // 当前节点与顶部年份 年份的差值就是 y 的偏移量
    const translateY = parseInt(this.ruler.getYbyTime(bubble.philYear) - this.ruler.getYbyTime(this.screenStartTime))

  }
  /**
   * 
   * @param {String} startTime 
   * @param {String} endTime 
   * @desc 根据当前屏幕起始年 过滤不需要显示的数据
   */
  filterWithInPhilData(data, startTime, endTime) {
    // 上下减少一部分
    return data.filter(item => item.year >= parseInt(startTime) && item.year <= (parseInt(endTime)))
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
  /**
   * 
   * @param {String} origin EAST OR WEST
   * @desc 获取东、西方哲学家 年份从小到大排序后的数据
   */
  getOriginData(origin) {
    return this.philData.filter(item => item.originType === origin).sort((m, n) => m.year - n.year).sort((m, n) => m.importance - n.importance)
  }
  findEarlyButNotDrawNode(levelList, renderList, nowPhilNode) {

    let earlyList = levelList.filter(item => item.id !== nowPhilNode.id).filter(item => item.year <= nowPhilNode.year).filter(item => {
      // 获取当前节点辐射范围内的
      const nowPhilNodeY = nowPhilNode.y
      const nowPhilNodeMinY = nowPhilNodeY - this.CIRCLE_DIAMETER * 2
      const nowPhilNodeMaxY = nowPhilNodeY + this.CIRCLE_DIAMETER * 2
      const itemY = item.y

      return nowPhilNodeMinY <= itemY && itemY <= nowPhilNodeMaxY
    })

    return !earlyList.every(item => item.canDraw)
  }
  findNearestQuote(quoteList, screenEndTime) {
    let earlyNearestItem = quoteList.filter(item => item.philYear < screenEndTime).map(item => {
      return {
        year: Math.abs(item.philYear - screenEndTime),
        id: item.id
      }
    }).sort((m, n) => m.year - n.year)[0]
    let prevQuoteNode = earlyNearestItem ? quoteList.filter(item => item.id == earlyNearestItem.id)[0] : undefined
    return prevQuoteNode
  }
  /**
   * @desc 寻找离当前节点最近已渲染节点
   */
  findNearestNode(compareList, nowPhilNode) {
    let earlyNearestItem = compareList.filter(item => item.year < nowPhilNode.year).map(item => {
      return {
        year: Math.abs(item.year - nowPhilNode.year),
        id: item.id
      }
    }).sort((m, n) => m.year - n.year)[0]
    let latelyNearestItem = compareList.filter(item => item.year > nowPhilNode.year).map(item => {
      return {
        year: Math.abs(item.year - nowPhilNode.year),
        id: item.id
      }
    }).sort((m, n) => m.year - n.year)[0]
    // if (nowPhilNode.itemName == '阿那克萨哥拉') {
    //   console.log(nowPhilNode)
    //   console.log(compareList)
    // }
    let prevPhilNode = earlyNearestItem ? compareList.filter(item => item.id == earlyNearestItem.id)[0] : {}
    let nextPhilNode = latelyNearestItem ? compareList.filter(item => item.id == latelyNearestItem.id)[0] : {}
    return [prevPhilNode, nextPhilNode]
  }
  getMajorElement(a, b) {

    if (a.importance < b.importance) {
      return a
    } else if (a.importance > b.importance) {
      return b
    } else if (a.importance == b.importance) {
      return this.getOlderPhil(a, b) || a// 返回年份较早的或自身
    }


  }
  getOlderPhil(a, b) {
    if (a.year < b.year) {
      return a
    } else if (a.year > b.year) {
      return b
    }
  }
}