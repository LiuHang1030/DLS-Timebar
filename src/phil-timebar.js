import Canvas from './components/canvas'
import Timebar from './components/timebar'
import Avatar from './components/avatar'
import Quote from './components/quote'
// import Controller from './components/controller'
import Period from './components/period'
import { mock } from 'mockjs'


export default class PhilTimebar {
  constructor(props) {
    Object.assign(this, {
      periodData: [], // 哲学家数据
      philData: [], // 分期数据
      nowPhilData: [], // 现在可显示的哲学家数据
      nowPeriodData: [], // 现在可显示的分期数据
      CIRCLE_DIAMETER: 100,
      CIRCLE_GAP: 10,
      minYear: -800,
      maxYear: new Date().getFullYear(),
      unitTime: [40, 20, 10, 5, 2, 1],
      minUnitWidth: 16,
      maxUnitWidth: 32,
      unitWidth: 16,

    }, props)

    this.initial()
    this.totalTime = this.maxYear - this.minYear;
    this.mockData = this.createMockData()
    let { level1Data, level2Data, level3Data } = this.calculateEastPhilData()
    console.log(level1Data)
    this.level1Data = level1Data
    this.level2Data = level2Data
    this.level3Data = level3Data

    this.ruler = new Timebar({
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
        const { screenStartTime, screenEndTime } = e
        // this.nowPhilData = this.filterWithInPhilData(screenStartTime, screenEndTime)
        this.nowPeriodData = this.filterPeriodData(screenStartTime, screenEndTime)
        this.drawPeriod(e)
        this.drawAvatar(e)
        this.drawQuote(e)
      }
    })
    // this.ruler.setTimeByOffset(-800, 2000, 0.5)
    // let totalHeight = (this.maxYear - this.minYear) / 40 * 16
    // let totalTime = this.maxYear - this.minYear
    // let percent = (time - this.minYear) / totalTime / totalHeight


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

  }
  calculateEastPhilData() {

    // 哲学家优先级一共分为[1.1, 1.2, 2, 3]四种
    var level1Data = this.getLevelData(1.1, 'EAST')
    // alert(JSON.stringify(level1Data))
    var level2Data = this.getLevelData(1.2, 'EAST')
    var level3Data = this.getLevelData(2, 'EAST')
    var level4Data = this.getLevelData(3, 'EAST')
    // 将可以在轴上渲染的节点存放在这里，每一个新遍历的节点，需要与这个数组进行比较。
    let compareList = []

    this.mockData.forEach((item, index) => {
      const gaps = item;
      const scale = this.unitTime[index]



      gaps.forEach(gap => {
        this.totalHeight = (this.maxYear - this.minYear) / scale * gap


        // 从优先级最高的节点数组开始模拟渲染，如该优先级节点的 canDraw 属性全部为 true,开始遍历下一个优先级节点列表
        var isLevel1Finished = level1Data.every(item => item.canDraw)
        var isLevel2Finished = level2Data.every(item => item.canDraw)
        var isLevel3Finished = level3Data.every(item => item.canDraw)
        var isLevel4Finished = level4Data.every(item => item.canDraw)



        if (!isLevel1Finished) {
          // 如果 level1 没有完成

          for (let index = 0; index < level1Data.length; index++) {

            const nowPhilNode = level1Data[index];

            // 如果已经标记为canDraw 则跳过该节点
            if (nowPhilNode.canDraw) continue;

            if (index == 0) {
              compareList.push(nowPhilNode)
              nowPhilNode.canDraw = true
              nowPhilNode.zoom = this.CIRCLE_DIAMETER / this.totalHeight


            } else {
              // 从第二个开始如果出现与上一个重合调整完位置后不与下一个节点重合的情况
              const nearestRenderNode = this.findNearestNode(compareList, nowPhilNode)
              const isCoinCide = this.checkIsCoinCide(compareList, nowPhilNode)


              // 这里让当前节点与两个节点进行比较
              // 1. 当前节点与离的最近的已经渲染的节点查看是否重合，来决定当前节点是否可以被渲染到屏幕上
              // 2. 当前节点与同一级别，出生年份从大到小的列表中上一个节点进行比较，来获取该节点在zoom 缩放等级多少的时候可以出现与任何节点都不重合的情况。
              // 这里主要为了实现折线效果，当已知当前节点如果可被折线绘制，也知道默认 zoom 等级多少级别才可以与任何节点都不重合，可得出折线的斜率。

              // if (!nowPhilNode.zoom) {
              if (isCoinCide) {
                const prevNodeMaxY = parseInt(this.getYbyTime(nearestRenderNode.year)) + this.CIRCLE_DIAMETER
                const nowNodeTranslateY = prevNodeMaxY  // 偏移后的当前节点 Y 值
                const nowNodeMinY = nowNodeTranslateY - (this.CIRCLE_DIAMETER / 2) // 偏移后的Y值 上顶点最小Y值
                const nowNodeMaxY = nowNodeTranslateY + (this.CIRCLE_DIAMETER / 2) // 偏移后的Y值 上顶点最大Y值
                // 重合的话，需要检查上一个重合的节点是折线显示，还是直线直出
                // nowPhilNode.zoom = 


              } else {
                // 节点直出
                compareList.push(nowPhilNode)
                nowPhilNode.canDraw = true
                nowPhilNode.zoom = this.CIRCLE_DIAMETER / this.totalHeight
              }
            }

          }

        } else if (!isLevel2Finished) {
          // 如果 level2 没有完成
          console.log('compareList')
          console.log(compareList)
        } else if (!isLevel3Finished) {
          // 如果 level3 没有完成
        } else if (!isLevel4Finished) {
          // 如果 level4 没有完成
        } else {
          // 所有 level 都完成模拟
          return;
        }
      })

    })
    return {
      level1Data,
      level2Data,
      level3Data
    }
  }
  checkIsCoinCide(prev, now) {
    if (Array.isArray(prev)) {
      // 检查当前节点与compareList中的所有节点是否有重合
      let coinCideList = prev.map(phil => {
        const y = parseInt(this.getYbyTime(phil.year))
        const minY = y - this.CIRCLE_DIAMETER
        const maxY = y + this.CIRCLE_DIAMETER
        const targetY = parseInt(this.getYbyTime(now.year))
        return minY <= targetY && targetY <= maxY
      }).filter(item => item)

      if (coinCideList && coinCideList.length) {
        // 如果存在相交节点，返回重合即true
        return true
      } else {
        return false
      }
    } else {
      const y = parseInt(this.getYbyTime(prev.year))
      const minY = y - this.CIRCLE_DIAMETER
      const maxY = y + this.CIRCLE_DIAMETER
      const targetY = parseInt(this.getYbyTime(now.year))
      return minY <= targetY && targetY <= maxY
    }
  }
  getYbyTime(time) {
    let percent = (time - this.minYear) / this.totalTime;
    return percent * this.totalHeight;
  }
  getLevelData(level, originType) {
    return this.philData.filter(phil => phil.originType === originType.toUpperCase()).filter(phil => phil.importance == level).sort((m, n) => m.year > n.year)
  }

  drawAvatar(e) {
    // tab栏进行东西方哲学家筛选功能
    const { ruler, screenStartTime, screenEndTime, totalHeight } = e
    const oneScreenTime = screenEndTime - screenStartTime

    this.centerPx = e.ruler.centerPx
    this.gapYear = ruler.getTimeByPixel(this.CIRCLE_DIAMETER) - ruler.getTimeByPixel(0)


    let timebarZoom = this.CIRCLE_DIAMETER / totalHeight

    // 将数据分为东西方两类

    // 筛选出所有当前轴起止年范围内的哲学家
    // let withInEastData = this.filterWithInPhilData(eastData, screenStartTime, screenEndTime)
    // let withInWestData = this.filterWithInPhilData(westData, screenStartTime, screenEndTime)
    // console.log(withInEastData)
    // console.log(withInWestData)
    // 根据当前范围内哲学家，比较优先级筛选出可渲染哲学家数据
    // let canDrawEastData = this.filterCanDrawList(e, eastData)
    // let canDrawWestData = this.filterCanDrawList(e, westData)



    this.level1Data.forEach((phil) => {
      const { originType, year, itemName, timeStr, zoom, translateY } = phil
      const x = originType === 'EAST' ? this.centerPx + 100 : this.centerPx - 100
      const y = translateY || e.ruler.getYbyTime(year)


      if (zoom >= timebarZoom) {
        new Avatar({
          $html: this.$html,
          ctx: this.ctx,
          canvas: this.canvas,
          originType,
          philName: itemName,
          born: timeStr,
          x,
          y
        })
      }
    })

    this.level2Data.forEach((phil) => {
      const { originType, year, itemName, timeStr, zoom } = phil
      const x = originType === 'EAST' ? this.centerPx + 100 : this.centerPx - 100
      const y = e.ruler.getYbyTime(year)


      if (zoom >= timebarZoom) {
        new Avatar({
          $html: this.$html,
          ctx: this.ctx,
          canvas: this.canvas,
          originType,
          philName: itemName,
          born: timeStr,
          x,
          y
        })
      }
    })
    this.level3Data.forEach((phil) => {
      const { originType, year, itemName, timeStr, zoom } = phil
      const x = originType === 'EAST' ? this.centerPx + 100 : this.centerPx - 100
      const y = e.ruler.getYbyTime(year)


      if (zoom >= timebarZoom) {
        new Avatar({
          $html: this.$html,
          ctx: this.ctx,
          canvas: this.canvas,
          originType,
          philName: itemName,
          born: timeStr,
          x,
          y
        })
      }
    })
    // canDrawWestData.forEach((phil) => {
    //   const { originType, year, itemName, timeStr } = phil
    //   const x = originType === 'EAST' ? this.centerPx + 100 : this.centerPx - 100
    //   const y = e.ruler.getYbyTime(year)
    //   if (phil.canDraw && phil.canDraw !== 'DISABLE') {
    //     new Avatar({
    //       $html: this.$html,
    //       ctx: this.ctx,
    //       canvas: this.canvas,
    //       originType,
    //       philName: itemName,
    //       born: timeStr,
    //       x,
    //       y
    //     })
    //   }
    // })

    // let showList = this.nowPhilData.reduce(function (pre, cur) {
    //   if (filterHiddenList.every(item => item.id !== cur.id)) {
    //     pre.push(cur)
    //   }
    //   return pre;
    // }, [])
    // console.log(showList)



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
  drawQuote(e) {

  }
  /**
   * 
   * @param {String} startTime 
   * @param {String} endTime 
   * @desc 根据当前屏幕起始年 过滤不需要显示的数据
   */
  filterWithInPhilData(data, startTime, endTime) {
    // 上下溢出一部分
    const oneScreenTime = endTime - startTime
    return data.filter(item => item.year >= parseInt(startTime - oneScreenTime) && item.year <= (parseInt(endTime + oneScreenTime)))
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
  getOriginData(levelData, origin) {
    return levelData.filter(item => item.originType === origin)
  }
  /**
   * @desc 寻找离当前节点最近已渲染节点
   */
  findNearestNode(compareList, nowPhilNode) {
    let nearestItem = compareList.map(item => {
      return {
        year: Math.abs(item.year - nowPhilNode.year),
        id: item.id
      }
    }).sort((m, n) => m.year - n.year)[0]

    return compareList.filter(item => item.id == nearestItem.id)[0]
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