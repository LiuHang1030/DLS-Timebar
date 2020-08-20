import Canvas from './components/canvas'
import Timebar from './components/timebar'
import Avatar from './components/avatar'
import Quote from './components/quote'
// import Controller from './components/controller'
import Period from './components/period'


export default class PhilTimebar {
  constructor(props) {
    Object.assign(this, {
      periodData: [], // 哲学家数据
      philData: [], // 分期数据
      nowPhilData: [], // 现在可显示的哲学家数据
      nowPeriodData: [], // 现在可显示的分期数据
      CIRCLE_DIAMETER: 100,
      minYear: -800,
      maxYear: new Date().getFullYear()
    }, props)

    this.initial()

    this.ruler = new Timebar({
      $html: this.$html,
      canvas: this.canvas,
      ctx: this.ctx,
      onRender: (e) => {
        const { screenStartTime, screenEndTime } = e
        // this.nowPhilData = this.filterWithInPhilData(screenStartTime, screenEndTime)
        this.nowPeriodData = this.filterPeriodData(screenStartTime, screenEndTime)
        this.drawPeriod(e)
        this.drawAvatar(e)
        this.drawQuote(e)
      }
    })
    this.
    // this.ruler.setTimeByOffset(-800, 2000, 0.5)

  }
  initial() {
    const { canvas, ctx, $html } = new Canvas()
    this.canvas = canvas
    this.ctx = ctx
    this.$html = $html
    this.calculatePhilData()
  }
  calculatePhilData() {
    // 哲学家优先级一共分为1.1、1.2、2、3  四种
    var level1Data = this.getLevelData(1.1)
    var level2Data = this.getLevelData(1.2)
    var level3Data = this.getLevelData(2)
    var level4Data = this.getLevelData(3)





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
  /**
   * 
   * @param {Number} y1 
   * @param {Number} y2
   * @return Boolean
   * @desc 根据 y 坐标判断是否重合、默认 x 相同
   */
  checkIsCoinCide(y1, y2) {
    const CIRCLE_RADIUS = 50
    // 头像下方文字区域
    const TEXT_HEIGHT = 40
    return y2 - y1 < CIRCLE_RADIUS * 2 + TEXT_HEIGHT
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