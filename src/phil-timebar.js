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
      CIRCLE_DIAMETER: 130,
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
  }
  initial() {
    const { canvas, ctx, $html } = new Canvas()
    this.canvas = canvas
    this.ctx = ctx
    this.$html = $html
  }

  drawAvatar(e) {
    // tab栏进行东西方哲学家筛选功能
    const { screenStartTime, screenEndTime } = e
    this.centerPx = e.ruler.centerPx
    // 将数据分为东西方两类
    let eastData = this.getOriginData('EAST')
    let westData = this.getOriginData('WEST')
    console.log(westData)
    // 筛选出所有当前轴起止年范围内的哲学家
    let withInEastData = this.filterWithInPhilData(eastData, screenStartTime * 2, screenEndTime * 2)
    let withInWestData = this.filterWithInPhilData(westData, screenStartTime * 2, screenEndTime * 2)

    // 根据当前范围内哲学家，比较优先级筛选出可渲染哲学家数据
    let canDrawEastData = this.filterCanDrawList(e, withInEastData)
    let canDrawWestData = this.filterCanDrawList(e, withInWestData)

    canDrawEastData.forEach((phil) => {
      const { canDraw, originType, year, itemName, timeStr } = phil
      const x = originType === 'EAST' ? this.centerPx + 100 : this.centerPx - 100
      const y = e.ruler.getYbyTime(year)
      if (canDraw) {
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
    canDrawWestData.forEach((phil) => {
      const { originType, year, itemName, timeStr } = phil
      const x = originType === 'EAST' ? this.centerPx + 100 : this.centerPx - 100
      const y = e.ruler.getYbyTime(year)
      if (phil.canDraw) {
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
    return data.filter(item => item.year >= startTime && item.year <= endTime)
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
    return this.philData.filter(item => item.originType === origin).sort((m, n) => m.importance - n.importance)
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
      return this.getOlderPhil(a, b) || a // 返回年份较早的或自身
    }


  }
  getOlderPhil(a, b) {
    if (a.year < b.year) {
      return b
    } else if (a.year > b.year) {
      return a
    }
  }

  filterCanDrawList(e, data) {

    const { ruler } = e
    // 实时计算，当前一个哲学家节点在时间轴上覆盖多少年
    const gapYear = ruler.getTimeByPixel(this.CIRCLE_DIAMETER) - ruler.getTimeByPixel(0)
    let noCoinCideList = []
    let coinCideList = []
    data.forEach((element) => {
      let { year, id, importance } = element
      // 遍历每一个节点，获取该节点的 x,y 信息
      const y = ruler.getYbyTime(year)
      const maxYear = year + gapYear
      const minYear = year - gapYear

      // 缩小检索范围，获取所有与当前节点有相交关系的其他节点
      let coinCideElement = data.filter(item => item.id !== id).filter(item => {
        return minYear <= item.year && item.year <= maxYear
      })
      if (coinCideElement && coinCideElement.length) {
        let tempList = []
        coinCideElement.forEach((subItem) => {
          let major = this.getMajorElement(element, subItem)
          tempList.push(major)
        })
        if (tempList.every(tempItem => tempItem.id == id)) {
          // 这里有 bug
          element.canDraw = true
        } else {
          element.canDraw = false
        }
      } else {
        // 如果不存在相邻重合节点
        noCoinCideList.push(element)
      }
    })
    if (noCoinCideList && noCoinCideList.length) {
      noCoinCideList.forEach((noCoinItem) => {
        const index = data.findIndex((item) => item.id == noCoinItem.id)
        let hasMoreImportantElement = data.find(item => item.importance < noCoinItem.importance && !item.candraw)
        if (hasMoreImportantElement) {
          data[index].canDraw = false
        } else {
          data[index].canDraw = true
        }
      })
    }
    return data
  }
}