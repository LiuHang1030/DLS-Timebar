import Canvas from './components/canvas'
import Timebar from './components/timebar'
import Avatar from './components/avatar'
import Quote from './components/quote'
import Period from './components/period'


export default class PhilTimebar {
  constructor(props) {
    Object.assign(this, {
      periodData: [], // 哲学家数据
      philData: [], // 分期数据
      nowPhilData: [], // 现在可显示的哲学家数据
      nowPeriodData: [] // 现在可显示的分期数据
    }, props)

    this.initial()

    this.ruler = new Timebar({
      $html: this.$html,
      canvas: this.canvas,
      ctx: this.ctx,
      onRender: (e) => {
        const { screenStartTime, screenEndTime } = e
        this.nowPhilData = this.filterPhilData(screenStartTime, screenEndTime)
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
    this.hiddenList = []
    this.centerPx = e.ruler.centerPx

    let eastData = this.nowPhilData.filter((item) => item.originType == 'EAST')
    let westData = this.nowPhilData.filter((item) => item.originType == 'WEST')
    eastData.forEach((item, index) => {
      const x = index % 2 == 0 ? this.centerPx + 100 : this.centerPx + 200
      item.x = x
    })
    westData.forEach((item, index) => {
      const x = index % 2 == 0 ? this.centerPx - 100 : this.centerPx - 200
      item.x = x
    })


    this.filterCanDrawList(e)
    let filterHiddenList = Array.from(new Set(this.hiddenList))
    // console.log(filterHiddenList)
    let showList = this.nowPhilData.reduce(function (pre, cur) {
      if (filterHiddenList.every(item => item.id !== cur.id)) {
        pre.push(cur)
      }
      return pre;
    }, [])
    // console.log(showList)
    showList.forEach((phil) => {
      const { originType, year, itemName, timeStr } = phil
      const x = originType === 'EAST' ? this.centerPx + 100 : this.centerPx - 100
      const y = e.ruler.getYbyTime(year)
      if (phil.canDraw == true) {
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
  filterPhilData(startTime, endTime) {
    return this.philData.filter(item => item.year > startTime || item.year < endTime).sort((m, n) => m.year - n.year)
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
    return this.nowPhilData.filter(item => item.originType === origin).sort((m, n) => m.year - n.year)
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
  compareImportance(a, b) {

    if (a.importance < b.importance) {
      return b
    } else if (a.importance > b.importance) {
      return a
    } else if (a.importance == b.importance) {
      return this.getOlderPhil(a, b)
    }


  }
  getOlderPhil(a, b) {
    if (a.year < b.year) {
      return b
    } else if (a.year > b.year) {
      return a
    }
  }

  filterCanDrawList(e) {
    const { screenStartTime, screenEndTime } = e
    const CIRCLE_DIAMETER = 130
    // 获取一个圆在当前时间轴中占多少年
    const gapYear = e.ruler.getTimeByPixel(CIRCLE_DIAMETER) - e.ruler.getTimeByPixel(0)

    this.nowPhilData.forEach((item, index) => {
      let { originType, year, id } = item
      // 遍历每一个节点，获取该节点的 x,y 信息
      const y = e.ruler.getYbyTime(year)
      const maxYear = year + gapYear
      const minYear = year - gapYear
      // 默认都 canDraw
      item.canDraw = true
      // 重合节点列表
      let coinCideList = []

      // // 缩小检索范围：在当前元素上下溢出1个gapYear的才进行对比、非自己、同一orginType
      let filtedData = this.nowPhilData.filter(item => item.originType === originType).filter(item => item.id !== id).filter(item => {
        return minYear <= item.year && item.year <= maxYear
      })
      for (let i = 0; i < filtedData.length; i++) {
        const other = filtedData[i];
        const otherY = e.ruler.getYbyTime(other.year)
        // 当前节点与其他节点比对，查看两者是否有重合
        const isCoinCide = year < filtedData[i].year ? this.checkIsCoinCide(y, otherY) : this.checkIsCoinCide(otherY, y)
        if (isCoinCide) {
          // 如果两者有重合，不同级别优先显示优先级高的节点，同级节点优先显示年份较早的节点
          let hiddenItem = this.compareImportance(other, item)
          if (hiddenItem) {
            coinCideList.push(hiddenItem)
            hiddenItem.canDraw = false
          }
        }
      }
      // console.log(coinCideList)
      if (!coinCideList.length) {
        const nowItem = item
        // console.log(`${nowItem.itemName}与任何相邻节点没有重合关系`)
        // 如果当前节点与任何节点都没有重合关系，需要判断所有大于他优先级的 节点都 canDraw为 true 的情况下，才能设置 canDraw 为 true
        const moreImportanceList = this.nowPhilData.filter((item) => item.importance < nowItem.importance)
        const nowItemCanDraw = moreImportanceList.every((item) => item.canDraw == true)
        if (nowItemCanDraw) {
          nowItem.canDraw = true
        } else {
          nowItem.canDraw = false
        }
      } else {
        this.hiddenList = this.hiddenList.concat(coinCideList)
        // console.log(`${item.itemName}有重合关系的是`)
        // console.log(coinCideList)
      }
    })
  }
}