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
      CIRCLE_DIAMETER: 100, // 
      minYear: -800,
      maxYear: new Date().getFullYear(),
      unitTime: [40, 20, 10, 5, 2, 1],
      minUnitWidth: 16,
      maxUnitWidth: 32,
      unitWidth: 16
    }, props)

    this.initial()

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
    console.log('测试多仓库')
    // this.ruler.setTimeByOffset(-800, 2000, 0.5)
    // let totalHeight = (this.maxYear - this.minYear) / 40 * 16
    // let totalTime = this.maxYear - this.minYear
    // let percent = (time - this.minYear) / totalTime / totalHeight
    this.totalTime = this.maxYear - this.minYear;
    this.mockData = this.createMockData()
    this.calculatePhilData()
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
  calculatePhilData() {
    // 哲学家优先级一共分为1.1、1.2、2、3  四种
    var level1Data = this.getLevelData(1.1)
    var level2Data = this.getLevelData(1.2)
    var level3Data = this.getLevelData(2)
    var level4Data = this.getLevelData(3)


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

              nowPhilNode.canDraw = true
              nowPhilNode.zoom = this.CIRCLE_DIAMETER / this.totalHeight

            } else {

              // 从第二个开始只与上一个节点做比较，如果重合就调整当前节点位置
              const prevPhilNode = level1Data[index - 1]
              let isCoinCide = this.checkIsCoinCide(prevPhilNode, nowPhilNode)

              if (isCoinCide) {

                // 如果重合，需要计算当前节点偏移多少才不重合并标记为canDraw
              } else {
                // 如果不重合，直接设置为canDraw

                nowPhilNode.canDraw = true
                nowPhilNode.zoom = this.CIRCLE_DIAMETER / this.totalHeight
              }
            }

          }

        } else if (!isLevel2Finished) {
          // console.log('跳到 level2')
          // console.log(level1Data)
          // 如果 level2 没有完成
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
  }
  checkIsCoinCide(prev, now) {


    const y = parseInt(this.getYbyTime(prev.year))
    const minY = y - this.CIRCLE_DIAMETER
    const maxY = y + this.CIRCLE_DIAMETER
    const targetY = parseInt(this.getYbyTime(now.year))
    console.log(minY + ',' + targetY + ',' + maxY)
    return minY <= targetY && targetY <= maxY
  }
  getYbyTime(time) {
    let percent = (time - this.minYear) / this.totalTime;
    return percent * this.totalHeight;
  }
  getLevelData(level) {
    return this.philData.filter(phil => phil.importance == level).sort((m, n) => m.year < n.year)
  }

  drawAvatar(e) {
    // tab栏进行东西方哲学家筛选功能
    const { ruler, screenStartTime, screenEndTime } = e
    const oneScreenTime = screenEndTime - screenStartTime

    this.centerPx = e.ruler.centerPx
    this.gapYear = ruler.getTimeByPixel(this.CIRCLE_DIAMETER) - ruler.getTimeByPixel(0)
    // 将数据分为东西方两类

    // 筛选出所有当前轴起止年范围内的哲学家
    // let withInEastData = this.filterWithInPhilData(eastData, screenStartTime, screenEndTime)
    // let withInWestData = this.filterWithInPhilData(westData, screenStartTime, screenEndTime)
    // console.log(withInEastData)
    // console.log(withInWestData)
    // 根据当前范围内哲学家，比较优先级筛选出可渲染哲学家数据
    // let canDrawEastData = this.filterCanDrawList(e, eastData)
    // let canDrawWestData = this.filterCanDrawList(e, westData)


    // canDrawEastData.forEach((phil) => {
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
   * @desc 寻找离当前圆心最近的圆圈
   */
  findNearestCircle(list, index) {
    return {
      prev: list[index - 1],
      next: list[index + 1]
    }
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