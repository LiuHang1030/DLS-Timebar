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
      CIRCLE_DIAMETER: 150,
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
    const { ruler, screenStartTime, screenEndTime } = e
    const oneScreenTime = screenEndTime - screenStartTime
    this.centerPx = e.ruler.centerPx
    this.gapYear = ruler.getTimeByPixel(this.CIRCLE_DIAMETER) - ruler.getTimeByPixel(0)
    // 将数据分为东西方两类
    let eastData = this.getOriginData('EAST')
    let westData = this.getOriginData('WEST')
    // 筛选出所有当前轴起止年范围内的哲学家
    let withInEastData = this.filterWithInPhilData(eastData, screenStartTime - this.gapYear * 2, screenEndTime + this.gapYear * 2)
    let withInWestData = this.filterWithInPhilData(westData, screenStartTime - this.gapYear * 2, screenEndTime + this.gapYear * 2)
    // 根据当前范围内哲学家，比较优先级筛选出可渲染哲学家数据
    let canDrawEastData = this.filterCanDrawList(e, withInEastData)
    let canDrawWestData = this.filterCanDrawList(e, withInWestData)

    canDrawEastData.forEach((phil) => {
      const { originType, year, itemName, timeStr } = phil
      const x = originType === 'EAST' ? this.centerPx + 100 : this.centerPx - 100
      const y = e.ruler.getYbyTime(year)

      if (phil.canDraw && phil.canDraw !== 'DISABLE') {
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
      if (phil.canDraw && phil.canDraw !== 'DISABLE') {
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
    return this.philData.filter(item => item.originType === origin).sort((m, n) => m.year - n.year)
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
      return this.getOlderPhil(a, b) || b // 返回年份较早的或自身
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

    // const { ruler } = e
    // // 实时计算，当前一个哲学家节点在时间轴上覆盖多少年


    // let needCheckList = []
    // console.log(data)
    // // 自上而下，遍历所有东、西方哲学家节点，两两比较那个优先级更大
    // for (let index = 0; index < data.length; index++) {
    //   const nowElement = data[index];
    //   nowElement.canDraw = false

    //   const nextElement = data[index + 1] || undefined


    //   const { year, id, importance } = nowElement

    //   if (nextElement) {
    //     // 如果当前节点下面存在节点，则检查是否是重合关系
    //     // 判定条件为下一个节点是否在当前节点顶点到当前节点圆心 + 一个圆直径的范围内。

    //     const nextYear = nextElement.year
    //     const minYear = year - (this.gapYear / 2)
    //     const maxYear = year + this.gapYear


    //     if (minYear <= nextYear && nextYear <= maxYear) {
    //       // 有重合关系

    //       let major = this.getMajorElement(nowElement, nextElement)
    //       if (major.itemId == nowElement.itemId) {
    //         // 只负责控制当前节点是否显示
    //         needCheckList.push(major)
    //       }
    //       console.log('有重合关系')
    //       console.log(nowElement)
    //       console.log(nextElement)
    //       console.log('胜出')
    //       console.log(major)
    //     } else {
    //       // 不存在重合关系
    //       needCheckList.push(nowElement)
    //     }
    //   }
    //   else {
    //     // 如果是最后一个节点、或者只有一个节点时候
    //     needCheckList.push(nowElement)
    //   }
    // }
    // console.log('needCheckList')
    // needCheckList = needCheckList.sort((m, n) => (m.importance - n.importance))
    // console.log(needCheckList)
    // // 再次遍历一遍，保证优先级低但是无重合的元素，不被优先显示
    // for (let index = 0; index < needCheckList.length; index++) {
    //   const nowElement = needCheckList[index];
    //   const { year } = nowElement

    //   if (index == 0) {
    //     nowElement.canDraw = true
    //   } else {
    //     // 第二个开始每一个与上一个节点比较
    //     const prevElement = needCheckList[index - 1]
    //     const minYear = year - (this.gapYear / 2)
    //     const maxYear = year + this.gapYear
    //     if (minYear <= prevElement.year && prevElement.year <= maxYear) {
    //       // 与上一个有重合
    //       console.log(`${nowElement.itemName}和${prevElement.itemName}有重合`)
    //       nowElement.canDraw = false
    //     } else {
    //       console.log(`${nowElement.itemName}和${prevElement.itemName}没重合`)
    //       nowElement.canDraw = true
    //     }
    //   }
    // 判断是否存在当前视窗内是否存在优先级比当前节点高，但是还没有被显示的节点，如果存在，隐藏当前节点。
    // const largerElement = data.filter(item => item.id !== nowElement.id).filter(item => item.importance < nowElement.importance).filter(item => !item.canDraw)

    // if (largerElement && largerElement.length) {
    //   // 如果存在比当前元素优先级高并且不可 draw 的情况下，隐藏该节点
    //   nowElement.canDraw = false
    // } else {
    //   nowElement.canDraw = true
    // }
    // }
    // return data.filter(item => item.canDraw)
    let { ruler } = e
    let needCheckList = []

    data.forEach((element) => {
      let { year, id, importance } = element
      // 遍历每一个节点，获取该节点的 x,y 信息
      const y = ruler.getYbyTime(year)
      const maxYear = year + this.gapYear
      const minYear = year - this.gapYear

      // 缩小检索范围，获取所有与当前节点有相交关系的其他节点
      let coinCideElement = data.filter(item => item.id !== id).filter(item => {
        return minYear <= item.year && item.year <= maxYear
      })

      // console.log(element.itemName)
      // console.log(coinCideElement)
      if (coinCideElement && coinCideElement.length) {
        let tempList = []
        coinCideElement.forEach((subItem) => {
          let major = this.getMajorElement(element, subItem)
          tempList.push(major)
        })
        // console.log(tempList)
        if (tempList.every(tempItem => tempItem.id == id)) {
          // 这里有 bug
          element.canDraw = true
          // needCheckList.push(element)
        } else {
          element.canDraw = false
        }
      } else {
        // 如果不存在相邻重合节点
        needCheckList.push(element)
      }
    })
    if (needCheckList && needCheckList.length) {
      needCheckList.forEach(noCoinItem => {
        const index = data.findIndex((item) => item.id == noCoinItem.id)
        let hasMoreImportantElement = data.find(item => (item.importance < noCoinItem.importance && !item.canDraw))
        if (hasMoreImportantElement) {
          data[index].canDraw = false
        } else {
          data[index].canDraw = true
        }
      })
    }
    // console.log(data)
    // console.log(data.filter(item => item.canDraw))
    return data.filter(item => item.canDraw)
  }
}