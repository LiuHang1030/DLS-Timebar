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
      TEXT_AREA: 10,
      minYear: -800,
      maxYear: new Date().getFullYear(),
      unitTime: [40, 20, 10, 5, 2, 1],
      minUnitWidth: 16,
      maxUnitWidth: 32,
      unitWidth: 16,
      renderList: [],
      westRenderList: []

    }, props)

    this.initial()
    this.totalTime = this.maxYear - this.minYear;
    this.mockData = this.createMockData()
    // let { eastLevel1Data } = this.calculateEastPhilData()
    // let { westLevel1Data } = this.calculateWestPhilData()
    // this.eastLevel1Data = eastLevel1Data
    // this.westLevel1Data = westLevel1Data
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
      philData: this.philData,
      onRender: (e) => {
        const { screenStartTime, screenEndTime } = e
        // this.nowPhilData = this.filterWithInPhilData(screenStartTime, screenEndTime)
        this.nowPeriodData = this.filterPeriodData(screenStartTime, screenEndTime)
        this.drawPeriod(e)
        this.calculatePosition(e)
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
  checkIsCoinCide(compareNode, nowNode, e, checkAngle = false) {
    if (checkAngle) {
      if (compareNode.year < nowNode.year) {
        // prevNode
        // 当前节点与上一个节点是否重合，只需要比较当前节点的最小 Y 值是否大于上个节点的最大值  
        const prevNodeTranslate = compareNode.angle && compareNode.angle >= 0 ? compareNode.angle * 100 : 0
        const nowNodeTranslate = nowNode.angle && nowNode.angle >= 0 ? nowNode.angle * 100 : 0
        const prevNodeY = parseInt(e.ruler.getYbyTime(compareNode.year)) + prevNodeTranslate
        const nowNodeY = parseInt(e.ruler.getYbyTime(nowNode.year)) + nowNodeTranslate
        const prevNodeMaxY = prevNodeY + (this.CIRCLE_DIAMETER - (this.CIRCLE_DIAMETER / 4))
        const nowNodeMinY = nowNodeY - (this.CIRCLE_DIAMETER / 4)
        // 当前节点最小 Y值小于下一个节点最大 Y 值即判定为重合
        return nowNodeMinY < prevNodeMaxY
      } else {
        // nextNode
        // 当前节点与下一个节点是否重合，只需要比较当前节点的最大 Y 值是否大于上个节点的最小值  
        const nextNodeTranslate = compareNode.angle && compareNode.angle >= 0 ? compareNode.angle * 100 : 0
        const nowNodeTranslate = nowNode.angle && nowNode.angle >= 0 ? nowNode.angle * 100 : 0
        const nextNodeY = parseInt(e.ruler.getYbyTime(compareNode.year)) + nextNodeTranslate
        const nowNodeY = parseInt(e.ruler.getYbyTime(nowNode.year)) + nowNodeTranslate
        const nextNodeMinY = nextNodeY - this.CIRCLE_DIAMETER
        const nextNodeMaxY = nextNodeY + this.CIRCLE_DIAMETER
        const nowNodeMaxY = nowNodeY + (this.CIRCLE_DIAMETER - (this.CIRCLE_DIAMETER / 4))
        // 当前节点最大 Y 值大于下一个节点最小 Y 值即判定为重合
        return nowNodeMaxY > nextNodeMinY
      }
    } else {
      const y = parseInt(e.ruler.getYbyTime(compareNode.year))
      const minY = y - this.CIRCLE_DIAMETER
      const maxY = y + this.CIRCLE_DIAMETER
      const targetY = parseInt(e.ruler.getYbyTime(nowNode.year))
      return minY <= targetY && targetY <= maxY
    }


  }
  getYbyTime(time) {
    let percent = (time - this.minYear) / this.totalTime;
    return percent * this.totalHeight;
  }
  getLevelData(level, originType) {
    return this.philData.filter(phil => phil.originType === originType.toUpperCase()).filter(phil => phil.importance == level).sort((m, n) => m.year < n.year).concat([])
  }
  drawAvatar(avatarData, angle = 0) {
    if (avatarData) {
      const { originType, itemName, timeStr, x, y } = avatarData
      new Avatar({
        $html: this.$html,
        ctx: this.ctx,
        canvas: this.canvas,
        originType,
        philName: itemName,
        born: timeStr,
        angle,
        x,
        y
      })
    }

  }
  calculatePosition(e) {
    // tab栏进行东西方哲学家筛选功能
    const { ruler, screenStartTime, screenEndTime, totalHeight } = e
    if (totalHeight) {
      const oneScreenTime = screenEndTime - screenStartTime

      this.centerPx = e.ruler.centerPx
      this.gapYear = ruler.getTimeByPixel(this.CIRCLE_DIAMETER) - ruler.getTimeByPixel(0)

      this.philData.forEach(phil => {
        const { originType, year } = phil
        phil.x = originType === 'EAST' ? this.centerPx + 100 : this.centerPx - 100
        phil.y = parseInt(ruler.getYbyTime(year))
      })
      // this.westLevel1Data.forEach((phil, index) => {
      //   const nowPhilNode = phil
      //   const { originType, year, itemName, timeStr, zoom } = nowPhilNode
      //   const x = originType === 'EAST' ? this.centerPx + 100 : this.centerPx - 100
      //   const y = e.ruler.getYbyTime(year)
      //   let avatarData = {
      //     originType,
      //     itemName,
      //     timeStr,
      //     x,
      //     y
      //   }

      //   if (index == 0) {
      //     nowPhilNode.angle = 0
      //     this.drawAvatar(avatarData)
      //     if (this.westRenderList.every(item => item.id !== nowPhilNode.id)) {
      //       this.westRenderList.push(nowPhilNode)
      //     }
      //   } else {
      //     // 从当前级别节点索引第2个开始

      //     // 获取当前节点的前一个节点和下一个节点
      //     const [prevPhilNode, nextPhilNode] = this.findNearestNode(this.westRenderList, nowPhilNode)
      //     // 如果在整个同级列表中，有其他节点比当前节点年份辐射范围内，但是还没有被画出,应等待那个节点被画完再进行 draw
      //     const hasNotDrawNode = this.findEarlyButNotDrawNode(this.westLevel1Data, this.westRenderList, nowPhilNode, e)
      //     if (!hasNotDrawNode) {
      //       // 判断当前节点是否与已渲染列表中的上下节点重合
      //       const isPrevCoinCide = this.checkIsCoinCide(prevPhilNode, nowPhilNode, e, true)
      //       const isNextCoinCide = this.checkIsCoinCide(nextPhilNode, nowPhilNode, e, true)

      //       if (isPrevCoinCide) {
      //         // 如果当前节点与上一个节点重合
      //         if (prevPhilNode.angle > 0) {
      //           // 如果上一个节点是折线显示中
      //           // 那么当前这个节点就不应被画
      //           let hasNodeList = this.westRenderList.filter(item => item.id == nowPhilNode.id)
      //           if (hasNodeList && hasNodeList.length) {
      //             let index = this.westRenderList.findIndex(item => item.id == hasNodeList[0].id)
      //             this.westRenderList.splice(index, 1)
      //           }
      //         } else {
      //           // 上一个节点是直线显示
      //           const angle = this.calculateNowNodeAngle(prevPhilNode, nowPhilNode, e)
      //           nowPhilNode.angle = angle
      //           this.drawAvatar(avatarData, angle)
      //           if (this.westRenderList.every(item => item.id !== nowPhilNode.id)) {
      //             this.westRenderList.push(nowPhilNode)
      //           }

      //         }
      //       } else {
      //         // 如果当前节点与上一个节点不重合
      //         nowPhilNode.angle = 0
      //         this.drawAvatar(avatarData)
      //         if (this.westRenderList.every(item => item.id !== nowPhilNode.id)) {
      //           this.westRenderList.push(nowPhilNode)
      //         }
      //       }
      //     }
      //   }
      // })
      // this.eastLevel1Data.forEach((phil, index) => {
      //   const nowPhilNode = phil
      //   const { originType, year, itemName, timeStr, zoom } = nowPhilNode
      //   const x = originType === 'EAST' ? this.centerPx + 100 : this.centerPx - 100
      //   const y = e.ruler.getYbyTime(year)
      //   let avatarData = {
      //     originType,
      //     itemName,
      //     timeStr,
      //     x,
      //     y
      //   }

      //   if (index == 0) {
      //     nowPhilNode.angle = 0
      //     this.drawAvatar(avatarData)
      //     if (this.renderList.every(item => item.id !== nowPhilNode.id)) {
      //       this.renderList.push(nowPhilNode)
      //     }
      //   } else {
      //     // 从当前级别节点索引第2个开始

      //     // 获取当前节点的前一个节点和下一个节点
      //     const [prevPhilNode, nextPhilNode] = this.findNearestNode(this.renderList, nowPhilNode)
      //     // 如果在整个同级列表中，有其他节点比当前节点年份辐射范围内，但是还没有被画出,应等待那个节点被画完再进行 draw
      //     const hasNotDrawNode = this.findEarlyButNotDrawNode(this.eastLevel1Data, this.renderList, nowPhilNode, e)
      //     if (!hasNotDrawNode) {
      //       // 判断当前节点是否与已渲染列表中的上下节点重合
      //       const isPrevCoinCide = this.checkIsCoinCide(prevPhilNode, nowPhilNode, e, true)
      //       const isNextCoinCide = this.checkIsCoinCide(nextPhilNode, nowPhilNode, e, true)

      //       if (isPrevCoinCide) {
      //         // 如果当前节点与上一个节点重合
      //         if (prevPhilNode.angle > 0) {
      //           // 如果上一个节点是折线显示中
      //           // 那么当前这个节点就不应被画
      //           let hasNodeList = this.renderList.filter(item => item.id == nowPhilNode.id)
      //           if (hasNodeList && hasNodeList.length) {
      //             let index = this.renderList.findIndex(item => item.id == hasNodeList[0].id)
      //             this.renderList.splice(index, 1)
      //           }
      //         } else {
      //           // 上一个节点是直线显示
      //           const angle = this.calculateNowNodeAngle(prevPhilNode, nowPhilNode, e)
      //           nowPhilNode.angle = angle
      //           this.drawAvatar(avatarData, angle)
      //           if (this.renderList.every(item => item.id !== nowPhilNode.id)) {
      //             this.renderList.push(nowPhilNode)
      //           }

      //         }
      //       } else {
      //         // 如果当前节点与上一个节点不重合
      //         nowPhilNode.angle = 0
      //         this.drawAvatar(avatarData)
      //         if (this.renderList.every(item => item.id !== nowPhilNode.id)) {
      //           this.renderList.push(nowPhilNode)
      //         }
      //       }
      //     } else {
      //       let hasNodeList = this.renderList.filter(item => item.id == nowPhilNode.id)
      //       if (hasNodeList && hasNodeList.length) {
      //         let index = this.renderList.findIndex(item => item.id == hasNodeList[0].id)
      //         this.renderList.splice(index, 1)
      //       }
      //     }
      //   }
      // })

    }
  }
  /**
   * 
   * @param {Object} referNode 当前节点偏移的参照节点
   * @param {Object} nowNode  当前节点
   * @param {TimeBar} e
   */
  calculateNowNodeAngle(referNode, nowNode, e) {
    const { ruler } = e
    const originY = parseInt(ruler.getYbyTime(nowNode.year))
    const prevNodeMaxY = parseInt(ruler.getYbyTime(referNode.year)) + this.CIRCLE_DIAMETER
    const triangleHeight = prevNodeMaxY - originY
    const triangleLong = 100
    const hypotenuse = Math.sqrt((Math.pow(triangleHeight, 2) + Math.pow(triangleLong, 2)))
    const angle = (triangleHeight / hypotenuse) >= 0 ? (triangleHeight / hypotenuse) : 0
    return angle
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
  findEarlyButNotDrawNode(levelList, renderList, nowPhilNode, e) {
    const { ruler } = e
    let earlyList = levelList.filter(item => item.id !== nowPhilNode.id).filter(item => item.year < nowPhilNode.year).filter(item => {
      // 获取当前节点辐射范围内的
      const nowPhilNodeY = parseInt(ruler.getYbyTime(nowPhilNode.year))
      const nowPhilNodeMinY = nowPhilNodeY - this.CIRCLE_DIAMETER
      const nowPhilNodeMaxY = nowPhilNodeY + this.CIRCLE_DIAMETER
      const itemY = parseInt(ruler.getYbyTime(item.year))

      return nowPhilNodeMinY <= itemY && itemY <= nowPhilNodeMaxY
    })
    return !earlyList.every(item => {
      // 确保每一个节点都在 renderList 中
      return renderList.findIndex(renderItem => renderItem.id == item.id) > -1
    })
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