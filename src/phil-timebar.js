import Canvas from './components/canvas'
import Timebar from './components/timebar'
import Avatar from './components/avatar'
import Dot from './components/dot'
import Quote from './components/quote'
import Controller from './components/controller'
import Period from './components/period'
import { mock } from 'mockjs'


export default class PhilTimebar {
  constructor(props) {
    Object.assign(this, {
      periodData: [], // 哲学家数据
      philData: [], // 分期数据
      nowPhilData: [], // 现在可显示的哲学家数据
      nowPeriodData: [], // 现在可显示的分期数据
      bubbles: [],
      CIRCLE_DIAMETER: 100,
      BUBBLE_DIAMETER: 170,
      CIRCLE_GAP: 10,
      TEXT_AREA: 10,
      minYear: -800,
      maxYear: new Date().getFullYear(),
      unitTime: [40, 20, 10, 4, 2, 1],
      minUnitWidth: 16,
      maxUnitWidth: 32,
      unitWidth: 16,
      renderList: [],
      level3RenderList: [],
      westRenderList: [],
      eastRenderList: [],
      tabIndex: 1

    }, props)
    this.controller = new Controller({
      $html: this.$html,
      tab: true,
      slider: true,
      onTabClickHandle: (index) => {
        this.tabIndex = index
      }
    })
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
      canvas: this.canvas,
      ctx: this.ctx,
      minYear: this.minYear,
      maxYear: this.maxYear,
      unitTime: 40,
      minUnitWidth: this.minUnitWidth,
      maxUnitWidth: this.maxUnitWidth,
      unitWidth: this.unitWidth,
      onRender: (e) => {
        const { screenStartTime, screenEndTime, totalHeight } = e
        // this.nowPhilData = this.filterWithInPhilData(screenStartTime, screenEndTime)
        this.nowZoom = this.CIRCLE_DIAMETER / totalHeight
        this.nowPeriodData = this.filterPeriodData(screenStartTime, screenEndTime)
        this.drawPeriod(e)
        this.calculatePosition(e)
        // this.drawQuote(e)

      }
    })


    // this.ruler.setTimeByOffset(-800, 2000, 0.5)
    // let totalHeight = (this.maxYear - this.minYear) / 40 * 16
    // let totalTime = this.maxYear - this.minYear
    // let percent = (time - this.minYear) / totalTime / totalHeight


  }
  createQuote() {
    this.eastQuote = $('<div></div>')
    this.westQuote = $('<div></div>')
    this.eastQuote.addClass('quote').addClass('east-quote')
    this.westQuote.addClass('quote').addClass('west-quote')
    this.$html.append(this.eastQuote)
    this.$html.append(this.westQuote)
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

    const minY = prevNodeY - this.CIRCLE_DIAMETER
    const maxY = prevNodeY + this.CIRCLE_DIAMETER
    return minY <= nowNodeY && nowNodeY <= maxY
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

  }
  drawBubble(title, desc) {
    let $container = $('<div></div>')
    $container.addClass('bubble')
    $container.html('当前节点与上一个节点是否重合，只需要比较当前节点的最小 Y 值是否大于上个节点的最大值  ')
    $('body').append($container)
  }
  checkIsCoinCide(compareNode, nowNode, checkAngle = false) {
    if (checkAngle) {
      if (compareNode.year < nowNode.year) {

        // prevNode
        // 当前节点与上一个节点是否重合，只需要比较当前节点的最小 Y 值是否大于上个节点的最大值  
        const prevNodeTranslate = compareNode.angle && compareNode.angle >= 0 ? compareNode.angle * 100 : 0
        const nowNodeTranslate = nowNode.angle && nowNode.angle >= 0 ? nowNode.angle * 100 : 0
        const prevNodeY = compareNode.y + prevNodeTranslate
        const nowNodeY = nowNode.y + nowNodeTranslate
        const prevNodeMaxY = prevNodeY + (this.CIRCLE_DIAMETER - (this.CIRCLE_DIAMETER / 4))
        const nowNodeMinY = nowNodeY - (this.CIRCLE_DIAMETER / 4)
        // 当前节点最小 Y值小于下一个节点最大 Y 值即判定为重合
        return nowNodeMinY < prevNodeMaxY
      } else {
        // nextNode
        // 当前节点与下一个节点是否重合，只需要比较当前节点的最大 Y 值是否大于上个节点的最小值  
        const nextNodeTranslate = compareNode.angle && compareNode.angle >= 0 ? compareNode.angle * 100 : 0
        const nowNodeTranslate = nowNode.angle && nowNode.angle >= 0 ? nowNode.angle * 100 : 0
        const nextNodeY = compareNode.y + nextNodeTranslate
        const nowNodeY = nowNode.y + nowNodeTranslate
        const nextNodeMinY = nextNodeY - this.CIRCLE_DIAMETER
        const nextNodeMaxY = nextNodeY + this.CIRCLE_DIAMETER
        const nowNodeMaxY = nowNodeY + (this.CIRCLE_DIAMETER - (this.CIRCLE_DIAMETER / 4))
        // 当前节点最大 Y 值大于下一个节点最小 Y 值即判定为重合
        return nowNodeMaxY > nextNodeMinY
      }
    } else {

      const y = compareNode.y
      const minY = y - this.CIRCLE_DIAMETER
      const maxY = y + this.CIRCLE_DIAMETER
      const targetY = nowNode.y
      return minY <= targetY && targetY <= maxY
    }


  }
  getYbyTime(time) {
    let percent = (time - this.minYear) / this.totalTime;
    return percent * this.totalHeight;
  }
  getLevelData(level, originType) {
    const list = this.philData.concat([])
    if (originType) {
      return list.filter(phil => phil.originType === originType.toUpperCase()).filter(phil => phil.importance == level).sort((m, n) => m.year < n.year)
    } else {
      return list.filter(phil => phil.importance == level).sort((m, n) => m.year < n.year)
    }

  }
  drawAvatar(avatarData, angle = 0) {
    if (avatarData) {
      const { originType, itemName, timeStr, x, y, originY } = avatarData
      new Avatar({
        $html: this.$html,
        ctx: this.ctx,
        canvas: this.canvas,
        originType,
        philName: itemName,
        born: timeStr,
        angle,
        x,
        y,
        originY
      })
    }

  }
  calculatePosition(e) {
    // tab栏进行东西方哲学家筛选功能
    const { ruler, screenStartTime, screenEndTime, totalHeight } = e
    this.screenStartTime = screenStartTime
    this.screenEndTime = screenEndTime
    this.ruler = ruler
    if (totalHeight) {
      this.centerPx = e.ruler.centerPx
      this.philData.forEach(phil => {
        const { originType, year } = phil
        phil.x = originType === 'EAST' ? this.centerPx + 100 : this.centerPx - 100
        phil.y = parseInt(ruler.getYbyTime(year))
        phil.originY = parseInt(ruler.getYbyTime(year))
      })

      this.gapYear = ruler.getTimeByPixel(this.CIRCLE_DIAMETER) - ruler.getTimeByPixel(0)
      this.eastLevel1Data = this.getLevelData(1.1, 'EAST')
      this.eastLevel2Data = this.getLevelData(1.2, 'EAST')
      this.eastLevel3Data = this.getLevelData(2, 'EAST')
      this.eastLevel4Data = this.getLevelData(3, 'EAST')
      this.westLevel1Data = this.getLevelData(1.1, 'WEST')
      this.westLevel2Data = this.getLevelData(1.2, 'WEST')
      this.westLevel3Data = this.getLevelData(2, 'WEST')
      this.westLevel4Data = this.getLevelData(3, 'WEST')
      // this.westLevel3Data.forEach((nowPhilNode) => {
      //   this.drawAvatar(nowPhilNode)
      // })
      // this.mapHighLevelNodeList(this.westLevel1Data, this.westRenderList)
      // this.mapHighLevelNodeList(this.eastLevel1Data, this.renderList)
      // this.mapLowLevelNodeList(this.westLevel3Data, this.westRenderList, this.westLevel1Data)
      // this.mapLowLevelNodeList(this.eastLevel3Data, this.renderList, this.eastLevel1Data)
      this.westRenderList = []
      this.renderList = []
      let westRenderList = []
      let eastRenderList = []

      // westRenderList = this.mapHighLevelNodeList(this.westLevel1Data, this.westRenderList)
      // eastRenderList = this.mapHighLevelNodeList(this.eastLevel1Data, this.renderList)
      westRenderList = this.mapLowLevelNodeList(this.westLevel3Data, this.westRenderList, this.westLevel1Data)
      console.log(westRenderList)
      westRenderList.forEach(nowPhilNode => {
        if (nowPhilNode.canDraw) {
          this.drawAvatar(nowPhilNode, nowPhilNode.angle ? nowPhilNode.angle : false)
        } else {
          this.drawDot(nowPhilNode.y, nowPhilNode.zoom, this.nowZoom)
        }
      })
      eastRenderList.forEach(nowPhilNode => {
        if (nowPhilNode.canDraw) {
          this.drawAvatar(nowPhilNode, nowPhilNode.angle ? nowPhilNode.angle : false)
        } else {
          this.drawDot(nowPhilNode.y, nowPhilNode.zoom, this.nowZoom)
        }
      })
      // if (this.tabIndex == 0) {
      //   let renthis.mapHighLevelNodeList(this.westLevel1Data, this.westRenderList)
      //   this.mapLowLevelNodeList(this.westLevel3Data, this.westRenderList, this.westLevel1Data)
      // } else if (this.tabIndex == 1) {
      //   this.mapHighLevelNodeList(this.westLevel1Data, this.westRenderList)
      //   this.mapHighLevelNodeList(this.eastLevel1Data, this.renderList)
      //   this.mapLowLevelNodeList(this.westLevel3Data, this.westRenderList, this.westLevel1Data)
      //   this.mapLowLevelNodeList(this.eastLevel3Data, this.renderList, this.eastLevel1Data)
      // } else if (this.tabIndex == 2) {
      //   this.mapHighLevelNodeList(this.eastLevel1Data, this.renderList)
      //   this.mapLowLevelNodeList(this.eastLevel3Data, this.renderList, this.eastLevel1Data)
      // }



      let eastWithInData = this.filterWithInPhilData(this.eastWithOutLevel3, screenStartTime, screenEndTime)
      let westWithInData = this.filterWithInPhilData(this.westWithOutLevel3, screenStartTime, screenEndTime)


      // if (eastWithInData && !eastWithInData.length) {
      //   // 如果屏幕内不存在任何东方节点
      //   let quoteList = this.findNearestQuote(this.eastBubbles, this.screenEndTime)
      //   if (quoteList) {
      //     // 如果存在可显示的 quote
      //     let $content = $('<div></div>')
      //     let title = $(`<div class="quote-title">${quoteList.bubbleTitle}</div>`)
      //     $content.append(title)
      //     let desc = quoteList.bubbleDesc
      //     $content.append(`<div class="quote-content">${desc}</div>`)
      //     this.eastQuote.html($content)
      //     this.eastQuote.addClass('show')
      //   }

      // } else {
      //   this.eastQuote.removeClass('show')
      // }
      // if (westWithInData && !westWithInData.length) {
      //   // 如果屏幕内不存在任何西方节点
      //   let quoteList = this.findNearestQuote(this.westBubbles, this.screenEndTime)
      //   if (quoteList) {
      //     // 如果存在可显示的 quote
      //     let $content = $('<div></div>')
      //     let title = $(`<div class="quote-title">${quoteList.bubbleTitle}</div>`)
      //     $content.append(title)
      //     let desc = quoteList.bubbleDesc
      //     $content.append(`<div class="quote-content">${desc}</div>`)
      //     this.westQuote.html($content)
      //     this.westQuote.addClass('show')
      //   }
      // } else {
      //   this.westQuote.removeClass('show')
      // }

    }
  }
  mapHighLevelNodeList(nodeList, renderList) {
    console.log(nodeList)
    return nodeList.map((nowPhilNode, index) => {
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
        const hasNotDrawNode = this.findEarlyButNotDrawNode(nodeList, renderList, nowPhilNode)
        if (!hasNotDrawNode) {
          // 判断当前节点是否与已渲染列表中的上下节点重合
          const isPrevCoinCide = this.checkIsCoinCide(prevPhilNode, nowPhilNode)
          if (isPrevCoinCide) {
            // 如果当前节点与上一个节点重合
            if (prevPhilNode.angle > 0) {
              // 如果上一个节点是折线显示中
              // 那么当前这个节点就不应被画
              nowPhilNode.canDraw = false
              // this.drawDot(nowPhilNode.y, nowPhilNode.zoom, this.nowZoom)

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
              // this.drawAvatar(nowPhilNode, angle)
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
          let hasNodeList = renderList.filter(item => item.id == nowPhilNode.id)
          if (hasNodeList && hasNodeList.length) {
            let index = renderList.findIndex(item => item.id == hasNodeList[0].id)
            renderList.splice(index, 1)
          }
          return nowPhilNode
        }
      }

    })
  }
  mapLowLevelNodeList(nodeList, renderList, highLevelNodeList) {
    // if (highLevelNodeList.every(item => item.canDraw)) {
    return nodeList.map((nowPhilNode, index) => {
      // 低优先级节点 需要上下比较已经存在的节点
      const [prevPhilNode, nextPhilNode] = this.findNearestNode(renderList, nowPhilNode)
      const isPrevCoinCide = this.checkIsCoinCide(prevPhilNode, nowPhilNode)
      const isNextCoinCide = this.checkIsCoinCide(nextPhilNode, nowPhilNode)

      if (isPrevCoinCide && isNextCoinCide) {
        // 如果与上下节点都重合那么直接忽略
        // this.drawDot(nowPhilNode.y, nowPhilNode.zoom, this.nowZoom)
        nowPhilNode.canDraw = false
        let hasNodeList = renderList.filter(item => item.id == nowPhilNode.id)
        if (hasNodeList && hasNodeList.length) {
          let index = renderList.findIndex(item => item.id == hasNodeList[0].id)
          renderList.splice(index, 1)
        }
        return nowPhilNode
      } else {
        if (isPrevCoinCide && !isNextCoinCide) {
          // 如果与上一个级别已渲染节点重合，但是与下一个节点不重合的情况
          // 尝试折线绘制
          const angle = this.calculateNowNodeAngle(prevPhilNode, nowPhilNode)
          let cloneNowPhilNode = Object.assign({}, nowPhilNode)
          cloneNowPhilNode.angle = angle
          cloneNowPhilNode.y = angle * 120 + nowPhilNode.y
          const nextIndexPhilNode = nodeList[index + 1] || {}
          const isNextCoinCide = this.checkIsCoinCide(nextIndexPhilNode, cloneNowPhilNode)
          if (!isNextCoinCide && nextPhilNode.angle == 0 && prevPhilNode.angle == 0) {
            nowPhilNode.angle = angle
            nowPhilNode.y = angle * 120 + nowPhilNode.y
            nowPhilNode.canDraw = true
            // this.drawAvatar(nowPhilNode, angle)
            if (renderList.every(item => item.id !== nowPhilNode.id)) {
              renderList.push(nowPhilNode)
            }
            return nowPhilNode
          } else {
            // this.drawDot(nowPhilNode.y, nowPhilNode.zoom, this.nowZoom)
            nowPhilNode.canDraw = false
            let hasNodeList = renderList.filter(item => item.id == nowPhilNode.id)
            if (hasNodeList && hasNodeList.length) {
              let index = renderList.findIndex(item => item.id == hasNodeList[0].id)
              renderList.splice(index, 1)
            }
            return nowPhilNode
          }


        } else if (!isPrevCoinCide && !isNextCoinCide) {
          // 如果与上下节点都不重合
          // 尝试直线绘制
          const prevIndexPhilNode = nodeList[index - 1]
          if (prevIndexPhilNode && prevIndexPhilNode.year == nowPhilNode.year) {
            const angle = this.calculateNowNodeAngle(prevIndexPhilNode, nowPhilNode)
            let cloneNowPhilNode = Object.assign({}, nowPhilNode)
            cloneNowPhilNode.angle = angle
            cloneNowPhilNode.y = angle * 120 + nowPhilNode.y
            const isNextCoinCide = this.checkIsCoinCide(nextPhilNode, cloneNowPhilNode)
            if (!isNextCoinCide) {
              nowPhilNode.angle = angle
              nowPhilNode.y = angle * 120 + nowPhilNode.y
              nowPhilNode.canDraw = true
              // this.drawAvatar(nowPhilNode, angle)
              if (renderList.every(item => item.id !== nowPhilNode.id)) {
                renderList.push(nowPhilNode)
              }
              return nowPhilNode
            } else {
              // this.drawDot(nowPhilNode.y, nowPhilNode.zoom, this.nowZoom)
              nowPhilNode.canDraw = false
              let hasNodeList = renderList.filter(item => item.id == nowPhilNode.id)
              if (hasNodeList && hasNodeList.length) {
                let index = renderList.findIndex(item => item.id == hasNodeList[0].id)
                renderList.splice(index, 1)
              }
              return nowPhilNode
            }

          } else {
            nowPhilNode.angle = 0
            nowPhilNode.canDraw = true
            // this.drawAvatar(nowPhilNode)
            if (renderList.every(item => item.id !== nowPhilNode.id)) {
              renderList.push(nowPhilNode)
            }
            return nowPhilNode
          }


        } else if (!isPrevCoinCide && isNextCoinCide) {
          // 如果与上节点不重合，与下节点重合
          if (nextPhilNode.angle > 0) {
            nowPhilNode.angle = 0
            nowPhilNode.canDraw = true
            // this.drawAvatar(nowPhilNode)
            if (renderList.every(item => item.id !== nowPhilNode.id)) {
              renderList.push(nowPhilNode)
            }
            return nowPhilNode
          } else {
            // this.drawDot(nowPhilNode.y, nowPhilNode.zoom, this.nowZoom)
            nowPhilNode.canDraw = false
            let hasNodeList = renderList.filter(item => item.id == nowPhilNode.id)
            if (hasNodeList && hasNodeList.length) {
              let index = renderList.findIndex(item => item.id == hasNodeList[0].id)
              renderList.splice(index, 1)
            }
            return nowPhilNode
          }
        } else {
          // this.drawDot(nowPhilNode.y, nowPhilNode.zoom, this.nowZoom)
          nowPhilNode.canDraw = false
          let hasNodeList = renderList.filter(item => item.id == nowPhilNode.id)
          if (hasNodeList && hasNodeList.length) {
            let index = renderList.findIndex(item => item.id == hasNodeList[0].id)
            renderList.splice(index, 1)
          }
          return nowPhilNode
        }
      }

    })
    // } else {
    //   // nodeList.forEach(nowPhilNode => {
    //   //   this.drawDot(nowPhilNode.y, nowPhilNode.zoom, this.nowZoom)
    //   // })
    //   let hasNodeList = renderList.filter(item => {
    //     return item.importance == 2 || item.importance == 3
    //   })
    //   if (hasNodeList && hasNodeList.length) {
    //     renderList = renderList.filter(item => !hasNodeList.some(ele => ele.id === item.id));
    //   }
    // }
  }
  mapMockHighLevelNodeList(zoom, totalHeight, nodelist, renderList) {

    for (let index = 0; index < nodelist.length; index++) {
      const nowPhilNode = nodelist[index];
      // if (nowPhilNode.zoom) continue
      nowPhilNode.y = this.mockGetYByTime(nowPhilNode.year, totalHeight)

      if (index == 0) {
        if (!nowPhilNode.zoom) {
          nowPhilNode.zoom = zoom
        }
        if (renderList.every(item => item.id !== nowPhilNode.id)) {
          renderList.push(nowPhilNode)
        }
      } else {
        const [prevPhilNode, nextPhilNode] = this.findNearestNode(renderList, nowPhilNode)


        const hasNotDrawNode = this.findEarlyButNotDrawNode(nodelist, renderList, nowPhilNode)
        if (!hasNotDrawNode) {
          prevPhilNode.y = this.mockGetYByTime(prevPhilNode.year, totalHeight)
          const isPrevCoinCide = this.checkIsCoinCide(prevPhilNode, nowPhilNode)
          if (isPrevCoinCide) {
            // 如果当前节点与上一个节点重合
            if (prevPhilNode.angle > 0) {
              // 如果上一个节点是折线显示中
              // 那么当前这个节点就不应被画
              let hasNodeList = renderList.filter(item => item.id == nowPhilNode.id)
              if (hasNodeList && hasNodeList.length) {
                let index = renderList.findIndex(item => item.id == hasNodeList[0].id)
                renderList.splice(index, 1)
              }
            } else {
              // 上一个节点是直线显示
              // console.log('需要折线处理的节点')
              const angle = this.calculateNowNodeAngle(prevPhilNode, nowPhilNode)
              nowPhilNode.angle = angle
              nowPhilNode.y = angle * 120 + nowPhilNode.y
              if (!nowPhilNode.zoom) {
                nowPhilNode.zoom = zoom
              }
              if (renderList.every(item => item.id !== nowPhilNode.id)) {
                renderList.push(nowPhilNode)
              }

            }
          } else {
            // 如果当前节点与上一个节点不重合
            nowPhilNode.angle = 0
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
  }
  mapMockLowLevelNodeList(zoom, totalHeight, nodeList, renderList) {
    for (let index = 0; index < nodeList.length; index++) {
      const nowPhilNode = nodeList[index];
      nowPhilNode.y = this.mockGetYByTime(nowPhilNode.year, totalHeight)
      // 低优先级节点 需要上下比较已经存在的节点
      const [prevPhilNode, nextPhilNode] = this.findNearestNode(renderList, nowPhilNode)
      prevPhilNode.y = this.mockGetYByTime(prevPhilNode.year, totalHeight)
      nextPhilNode.y = this.mockGetYByTime(nextPhilNode.year, totalHeight)
      const isPrevCoinCide = this.checkIsCoinCide(prevPhilNode, nowPhilNode)
      const isNextCoinCide = this.checkIsCoinCide(nextPhilNode, nowPhilNode)


      if (isPrevCoinCide && isNextCoinCide) {
        // 如果与上下节点都重合那么直接忽略
        let hasNodeList = renderList.filter(item => item.id == nowPhilNode.id)
        if (hasNodeList && hasNodeList.length) {
          let index = renderList.findIndex(item => item.id == hasNodeList[0].id)
          renderList.splice(index, 1)
        }
      } else {
        if (isPrevCoinCide && !isNextCoinCide) {
          // 如果与上一个级别已渲染节点重合，但是与下一个节点不重合的情况
          // 尝试折线绘制
          const angle = this.calculateNowNodeAngle(prevPhilNode, nowPhilNode)
          let cloneNowPhilNode = Object.assign({}, nowPhilNode)
          cloneNowPhilNode.angle = angle
          cloneNowPhilNode.y = angle * 120 + nowPhilNode.y
          const nextIndexPhilNode = nodeList[index + 1] || {}
          const isNextCoinCide = this.checkIsCoinCide(nextIndexPhilNode, cloneNowPhilNode)
          if (!isNextCoinCide && nextPhilNode.angle == 0 && prevPhilNode.angle == 0) {
            nowPhilNode.angle = angle
            nowPhilNode.y = angle * 120 + nowPhilNode.y
            nowPhilNode.zoom = zoom
            if (renderList.every(item => item.id !== nowPhilNode.id)) {
              renderList.push(nowPhilNode)
            }
          } else {
            let hasNodeList = renderList.filter(item => item.id == nowPhilNode.id)
            if (hasNodeList && hasNodeList.length) {
              let index = renderList.findIndex(item => item.id == hasNodeList[0].id)
              renderList.splice(index, 1)
            }
          }


        } else if (!isPrevCoinCide && !isNextCoinCide) {
          // 如果与上下节点都不重合
          // 尝试直线绘制
          const prevIndexPhilNode = nodeList[index - 1] || {}
          if (prevIndexPhilNode && prevIndexPhilNode.year == nowPhilNode.year) {
            const angle = this.calculateNowNodeAngle(prevIndexPhilNode, nowPhilNode)
            let cloneNowPhilNode = Object.assign({}, nowPhilNode)
            cloneNowPhilNode.angle = angle
            cloneNowPhilNode.y = angle * 120 + nowPhilNode.y
            const isNextCoinCide = this.checkIsCoinCide(nextPhilNode, cloneNowPhilNode)
            if (!isNextCoinCide) {
              nowPhilNode.angle = angle
              nowPhilNode.y = angle * 120 + nowPhilNode.y
              nowPhilNode.canDraw = true
              nowPhilNode.zoom = zoom
              if (renderList.every(item => item.id !== nowPhilNode.id)) {
                renderList.push(nowPhilNode)
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
            nowPhilNode.zoom = zoom
            if (renderList.every(item => item.id !== nowPhilNode.id)) {
              renderList.push(nowPhilNode)
            }
          }


        } else if (!isPrevCoinCide && isNextCoinCide) {
          // 如果与上节点不重合，与下节点重合
          if (nextPhilNode.angle > 0) {
            nowPhilNode.angle = 0
            nowPhilNode.zoom = zoom
            if (renderList.every(item => item.id !== nowPhilNode.id)) {
              renderList.push(nowPhilNode)
            }
          } else {
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
    const prevNodeMaxY = referNode.y + this.CIRCLE_DIAMETER
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
      const nowPhilNodeMinY = nowPhilNodeY - this.CIRCLE_DIAMETER
      const nowPhilNodeMaxY = nowPhilNodeY + this.CIRCLE_DIAMETER
      const itemY = item.y

      return nowPhilNodeMinY <= itemY && itemY <= nowPhilNodeMaxY
    })

    return !earlyList.every(item => {
      // 确保每一个节点都在 renderList 中
      return renderList.findIndex(renderItem => renderItem.id == item.id) > -1
    })
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

  filterCanDrawList(e, data) {

  }
}