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
      level3RenderList: [],
      westRenderList: []

    }, props)

    this.initial()
    this.totalTime = this.maxYear - this.minYear;
    this.mockData = this.createMockData()
    this.runMock()

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
        this.calculatePosition(e)
        this.drawQuote(e)
        // this.drawDot(e)
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
  runMock() {
    let eastLevel1Data = this.getLevelData(1.1, 'EAST')
    let westLevel1Data = this.getLevelData(1.1, 'WEST')
    let eastLevel2Data = this.getLevelData(1.2, 'EAST')
    let westLevel2Data = this.getLevelData(1.2, 'WEST')
    let eastLevel3Data = this.getLevelData(2, 'EAST')
    let westLevel3Data = this.getLevelData(2, 'WEST')
    let eastLevel4Data = this.getLevelData(3, 'EAST')
    let westLevel4Data = this.getLevelData(3, 'WEST')
    for (let index = 0; index < this.mockData.length; index++) {
      const unitTime = this.unitTime[index]
      const unitHeightList = this.mockData[index];
      for (let index = 0; index < unitHeightList.length; index++) {

        const unitHeight = unitHeightList[index];
        const totalHeight = unitHeight * ((this.maxYear - this.minYear) / unitTime);
        const zoom = this.CIRCLE_DIAMETER / totalHeight

        // 从优先级最高的节点数组开始模拟渲染，如该优先级节点的 zoom 有值,开始遍历下一个优先级节点列表

        const eastLevel1Finished = eastLevel1Data.every(item => item.zoom)
        const westLevel1Finished = westLevel1Data.every(item => item.zoom)
        // const level2Finished = level2Data.every(item => item.zoom)
        // const level3Finished = level3Data.every(item => item.zoom)
        // const level4Finished = level4Data.every(item => item.zoom)

        // 需要知道该节点在哪个zoom等级下可以被渲染
        if (!eastLevel1Finished || !westLevel1Finished) {
          // 将该级别节点分为东西两部分，各自分别进行在该zoom等级下进行比较 重合关系
          if (!eastLevel1Finished) {
            for (let index = 0; index < eastLevel1Data.length; index++) {
              const nowPhilNode = eastLevel1Data[index];
              const y = this.mockGetYByTime(nowPhilNode.year, totalHeight)
              console.log(y)
              console.log(nowPhilNode.itemName)

            }

          }
          if (!westLevel1Finished) {
            for (let index = 0; index < westLevel1Data.length; index++) {
              const nowPhilNode = westLevel1Data[index];
              const y = this.mockGetYByTime(nowPhilNode.year, totalHeight)
              console.log(y)
              console.log(nowPhilNode.itemName)

            }
          }
        }

      }
    }
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
    if (originType) {
      return this.philData.filter(phil => phil.originType === originType.toUpperCase()).filter(phil => phil.importance == level).sort((m, n) => m.year < n.year).concat([])
    } else {
      return this.philData.filter(phil => phil.importance == level).sort((m, n) => m.year < n.year).concat([])
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



      this.eastLevel1Data.forEach((nowPhilNode, index) => {
        if (index == 0) {
          nowPhilNode.angle = 0
          nowPhilNode.canDraw = true
          this.drawAvatar(nowPhilNode)
          if (this.renderList.every(item => item.id !== nowPhilNode.id)) {
            this.renderList.push(nowPhilNode)
          }
        } else {
          // 从当前级别节点索引第2个开始

          // 获取当前节点的前一个节点和下一个节点
          const [prevPhilNode, nextPhilNode] = this.findNearestNode(this.renderList, nowPhilNode)

          // 如果在整个同级列表中，有其他节点比当前节点年份辐射范围内，但是还没有被画出,应等待那个节点被画完再进行 draw
          const hasNotDrawNode = this.findEarlyButNotDrawNode(this.eastLevel1Data, this.renderList, nowPhilNode)
          if (!hasNotDrawNode) {
            // 判断当前节点是否与已渲染列表中的上下节点重合
            const isPrevCoinCide = this.checkIsCoinCide(prevPhilNode, nowPhilNode)
            if (isPrevCoinCide) {

              // 如果当前节点与上一个节点重合
              if (prevPhilNode.angle > 0) {
                // 如果上一个节点是折线显示中
                // 那么当前这个节点就不应被画
                nowPhilNode.canDraw = false
                let hasNodeList = this.renderList.filter(item => item.id == nowPhilNode.id)
                if (hasNodeList && hasNodeList.length) {
                  let index = this.renderList.findIndex(item => item.id == hasNodeList[0].id)
                  this.renderList.splice(index, 1)
                }
              } else {
                // 上一个节点是直线显示
                // console.log('需要折线处理的节点')
                const angle = this.calculateNowNodeAngle(prevPhilNode, nowPhilNode)
                nowPhilNode.angle = angle
                nowPhilNode.y = angle * 120 + nowPhilNode.y
                nowPhilNode.canDraw = true
                this.drawAvatar(nowPhilNode, angle)
                if (this.renderList.every(item => item.id !== nowPhilNode.id)) {
                  this.renderList.push(nowPhilNode)
                }

              }
            } else {
              // 如果当前节点与上一个节点不重合
              // console.log('不重合')
              // console.log(prevPhilNode)
              // console.log(nowPhilNode)
              // 外层判断是否重合没有考虑上一个节点是否有折线显示情况，这里再次做校验
              const isRealCoinCide = this.checkIsCoinCide(prevPhilNode, nowPhilNode)
              if (isRealCoinCide) {
                // 考虑折线后还是重叠
                nowPhilNode.canDraw = false
              } else {
                nowPhilNode.angle = 0
                nowPhilNode.canDraw = true
                this.drawAvatar(nowPhilNode)
                if (this.renderList.every(item => item.id !== nowPhilNode.id)) {
                  this.renderList.push(nowPhilNode)
                }
              }

            }
          } else {
            nowPhilNode.canDraw = false
            let hasNodeList = this.renderList.filter(item => item.id == nowPhilNode.id)
            if (hasNodeList && hasNodeList.length) {
              let index = this.renderList.findIndex(item => item.id == hasNodeList[0].id)
              this.renderList.splice(index, 1)
            }
          }
        }

      })

      console.log(this.renderList)
      if (this.renderList.length == this.eastLevel1Data.length) {
        this.eastLevel3Data.forEach((nowPhilNode, index) => {
          const [prevPhilNode, nextPhilNode] = this.findNearestNode(this.renderList, nowPhilNode)
          const isPrevCoinCide = this.checkIsCoinCide(prevPhilNode, nowPhilNode)
          const isNextCoinCide = this.checkIsCoinCide(nextPhilNode, nowPhilNode)
          const hasNotDrawNode = this.findEarlyButNotDrawNode(this.eastLevel3Data, this.renderList, nowPhilNode)


          console.log('--------')
          console.log(prevPhilNode)
          console.log(nowPhilNode)
          console.log(`${nowPhilNode.itemName}和${prevPhilNode.itemName}是否重合${isPrevCoinCide}`)
          console.log(nextPhilNode)
          console.log(`${nowPhilNode.itemName}和${nextPhilNode.itemName}是否重合${isNextCoinCide}`)
          // console.log(hasNotDrawNode)
        })
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
    const oneScreenTime = 50
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
  getOriginData(origin) {
    return this.philData.filter(item => item.originType === origin).sort((m, n) => m.year - n.year).sort((m, n) => m.importance - n.importance)
  }
  findEarlyButNotDrawNode(levelList, renderList, nowPhilNode) {

    let earlyList = levelList.filter(item => item.id !== nowPhilNode.id).filter(item => item.year < nowPhilNode.year).filter(item => {
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