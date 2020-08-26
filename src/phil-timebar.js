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
      renderList: []

    }, props)

    this.initial()
    this.totalTime = this.maxYear - this.minYear;
    this.mockData = this.createMockData()
    let { level1Data } = this.calculateEastPhilData()

    this.level1Data = level1Data

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
    console.log(this.getLevelData(1.1, 'EAST'))
    // 哲学家优先级一共分为[1.1, 1.2, 2, 3]四种
    var level1Data = this.getLevelData(1.1, 'EAST')
    var level2Data = this.getLevelData(1.2, 'EAST')
    var level3Data = this.getLevelData(2, 'EAST')
    var level4Data = this.getLevelData(3, 'EAST')



    // 将可以在轴上渲染的节点存放在这里，每一个新遍历的节点，需要与这个数组进行比较。
    let compareList = []

    // this.mockData.forEach((item, index) => {
    //   const gaps = item;
    //   const scale = this.unitTime[index]



    //   gaps.forEach(gap => {
    //     this.totalHeight = (this.maxYear - this.minYear) / scale * gap


    //     // 从优先级最高的节点数组开始模拟渲染，如该优先级节点的 canDraw 属性全部为 true,开始遍历下一个优先级节点列表
    //     var isLevel1Finished = level1Data.every(item => item.canDraw)
    //     var isLevel2Finished = level2Data.every(item => item.canDraw)
    //     var isLevel3Finished = level3Data.every(item => item.canDraw)
    //     var isLevel4Finished = level4Data.every(item => item.canDraw)



    //     if (!isLevel1Finished) {
    //       // 如果 level1 没有完成

    //       for (let index = 0; index < level1Data.length; index++) {

    //         const nowPhilNode = level1Data[index];

    //         // 如果已经标记为canDraw 则跳过该节点
    //         if (nowPhilNode.canDraw) continue;

    //         if (index == 0) {
    //           compareList.push(nowPhilNode)
    //           nowPhilNode.canDraw = true
    //           nowPhilNode.zoom = this.CIRCLE_DIAMETER / this.totalHeight

    //         } else {

    //           // 从第二个开始如果出现与上一个重合调整完位置后不与下一个节点重合的情况
    //           const prevPhilNode = this.findNearestNode(compareList, nowPhilNode)
    //           let isCoinCide = this.checkIsCoinCide(compareList, nowPhilNode)
    //           if (isCoinCide) {
    //             // 如果重合，需要计算当前节点偏移多少才不重合并标记为canDraw
    //             const prevNodeMaxY = parseInt(this.getYbyTime(prevPhilNode.year)) + this.CIRCLE_DIAMETER

    //             const nowNodeTranslateY = prevNodeMaxY  // 偏移后的当前节点 Y 值

    //             const nowNodeMinY = nowNodeTranslateY - (this.CIRCLE_DIAMETER / 2) // 偏移后的Y值 上顶点最小Y值
    //             const nowNodeMaxY = nowNodeTranslateY + (this.CIRCLE_DIAMETER / 2) // 偏移后的Y值 上顶点最大Y值
    //             // 获取下一个节点
    //             const nextPhilNode = level1Data[index + 1]
    //             if (nextPhilNode) {
    //               // 如果存在下一个节点，需要比较当前节点调整完位置是否与下一个重合
    //               const nextNodeMinY = parseInt(this.getYbyTime(nextPhilNode.year)) - (this.CIRCLE_DIAMETER / 2)
    //               // 如果当前节点偏移后的最大 Y 值小于下一个节点最小 Y值，即判定为不重合
    //               if (nowNodeMaxY < nextNodeMinY) {

    //                 nowPhilNode.canDraw = true
    //                 nowPhilNode.zoom = this.CIRCLE_DIAMETER / this.totalHeight
    //                 compareList.push(nowPhilNode)
    //               } else {
    //                 // 符合当前元素与上一个节点重合，但是与下个节点重合的节点
    //               }


    //             } else {
    //               // 如果不存在下一个节点，即最后一个节点
    //             }
    //           } else {
    //             // 如果不重合，直接设置为canDraw
    //             nowPhilNode.canDraw = true
    //             nowPhilNode.originZoom = this.CIRCLE_DIAMETER / this.totalHeight
    //             compareList.push(nowPhilNode)

    //           }
    //         }

    //       }
    //     } else if (!isLevel2Finished) {
    //       // console.log('跳到 level2')
    //       // console.log(level1Data)
    //       // 如果 level2 没有完成
    //     } else if (!isLevel3Finished) {
    //       // 如果 level3 没有完成
    //     } else if (!isLevel4Finished) {
    //       // 如果 level4 没有完成
    //     } else {
    //       // 所有 level 都完成模拟
    //       return;
    //     }
    //   })

    // })
    return {
      level1Data
    }
  }
  checkIsCoinCide(compareNode, nowNode, e, checkAngle = false) {
    if (checkAngle) {
      // 需要考虑角度
      if (compareNode.year < nowNode.year) {
        // prevNode
        // 当前节点与上一个节点是否重合，只需要比较当前节点的最小 Y 值是否大于上个节点的最大值  
        const prevNodeTranslate = compareNode.angle && compareNode.angle >= 0 ? compareNode.angle * 100 : 0
        const nowNodeTranslate = nowNode.angle && nowNode.angle >= 0 ? nowNode.angle * 120 : 0
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
        const nowNodeTranslate = nowNode.angle && nowNode.angle >= 0 ? nowNode.angle * 120 : 0
        const nextNodeY = parseInt(e.ruler.getYbyTime(compareNode.year)) + nextNodeTranslate
        const nowNodeY = parseInt(e.ruler.getYbyTime(nowNode.year)) + nowNodeTranslate
        const nextNodeMinY = nextNodeY - (this.CIRCLE_DIAMETER / 4)
        const nowNodeMaxY = nowNodeY + (this.CIRCLE_DIAMETER / 2)
        console.log(nowNodeMaxY + ',' + nextNodeMinY)
        // 当前节点最大 Y 值大于下一个节点最小 Y 值即判定为重合
        return nowNodeMaxY > nextNodeMinY
      }
    } else {
      // 检查两个节点是否重合
      const prevNodeY = parseInt(e.ruler.getYbyTime(compareNode.year))
      const nowNodeY = parseInt(e.ruler.getYbyTime(nowNode.year))
      const prevNodeMinY = prevNodeY - this.CIRCLE_DIAMETER
      const prevNodeMaxY = prevNodeY + this.CIRCLE_DIAMETER
      return prevNodeMinY <= nowNodeY && nowNodeY <= prevNodeMaxY
    }

  }
  getYbyTime(time) {
    let percent = (time - this.minYear) / this.totalTime;
    return percent * this.totalHeight;
  }
  getLevelData(level, originType) {
    return this.philData.filter(phil => phil.originType === originType.toUpperCase()).filter(phil => phil.importance == level).sort((m, n) => m.year < n.year).concat([])
  }

  drawAvatar(e) {
    // tab栏进行东西方哲学家筛选功能
    const { ruler, screenStartTime, screenEndTime, totalHeight } = e
    if (totalHeight) {
      const oneScreenTime = screenEndTime - screenStartTime

      this.centerPx = e.ruler.centerPx
      this.gapYear = ruler.getTimeByPixel(this.CIRCLE_DIAMETER) - ruler.getTimeByPixel(0)


      let timebarZoom = this.CIRCLE_DIAMETER / totalHeight

      // 将数据分为东西方两类


      this.level1Data.forEach((phil, index) => {
        const nowPhilNode = phil
        const { originType, year, itemName, timeStr, zoom } = nowPhilNode
        const x = originType === 'EAST' ? this.centerPx + 100 : this.centerPx - 100
        const y = e.ruler.getYbyTime(year)



        if (index == 0) {

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
          if (this.renderList.every(item => item.id !== nowPhilNode.id)) {
            this.renderList.push(nowPhilNode)
          }
        } else {
          const [prevPhilNode, nextPhilNode] = this.findNearestNode(this.renderList, nowPhilNode)
          console.log('prevPhilNode')
          console.log(prevPhilNode)
          console.log('nowPhilNode')
          console.log(nowPhilNode)
          console.log('nextPhilNode')
          console.log(nextPhilNode)
          const isPrevCoinCide = this.checkIsCoinCide(prevPhilNode, nowPhilNode, e, true)
          const isNextCoinCide = this.checkIsCoinCide(nextPhilNode, nowPhilNode, e, true)
          console.log('当前节点与上一节点是否重合' + isPrevCoinCide)
          console.log('当前节点与下一节点是否重合' + isNextCoinCide)
          if (prevPhilNode.angle && prevPhilNode.angle >= 0) {
            // 上一个节点为折线绘制
            // 查看能否直线绘制 ，如果不能，就隐藏
            const isPrevCoinCide = this.checkIsCoinCide(prevPhilNode, nowPhilNode, e, true)

            if (isPrevCoinCide) {
              const originY = parseInt(ruler.getYbyTime(nowPhilNode.year))
              const prevNodeMaxY = parseInt(ruler.getYbyTime(prevPhilNode.year)) + this.CIRCLE_DIAMETER
              const triangleHeight = prevNodeMaxY - originY
              const triangleLong = 100
              const hypotenuse = Math.sqrt((Math.pow(triangleHeight, 2) + Math.pow(triangleLong, 2)))
              const angle = (triangleHeight / hypotenuse) >= 0 ? (triangleHeight / hypotenuse) : 0
              nowPhilNode.angle = angle
              nowPhilNode.disable = true
              let hasNodeList = this.renderList.filter(item => item.id == nowPhilNode.id)
              if (hasNodeList && hasNodeList.length) {
                let index = this.renderList.findIndex(item => item.id == hasNodeList[0].id)
                this.renderList.splice(index, 1)
              }
            } else {
              // 在与上一个节点不重合的情况下，需要再看看是否与下一个节点重合
              if (nextPhilNode) {
                // 如果存在下一个渲染节点，需要检查是否重合
                const isNextCoinCide = this.checkIsCoinCide(nextPhilNode, nowPhilNode, e, true)
                if (isNextCoinCide) {
                  // 如果重合
                  // console.log('上个节点不重合，下个节点重合')
                  // console.log(nowPhilNode)
                  const originY = parseInt(ruler.getYbyTime(nowPhilNode.year))
                  const prevNodeMaxY = parseInt(ruler.getYbyTime(prevPhilNode.year)) + this.CIRCLE_DIAMETER
                  const triangleHeight = prevNodeMaxY - originY
                  const triangleLong = 100
                  const hypotenuse = Math.sqrt((Math.pow(triangleHeight, 2) + Math.pow(triangleLong, 2)))
                  const angle = (triangleHeight / hypotenuse) >= 0 ? (triangleHeight / hypotenuse) : 0
                  nowPhilNode.angle = angle
                  nowPhilNode.disable = false
                } else {
                  // console.log('上个节点不重合，下个节点不重合')
                  // console.log(nowPhilNode)
                  const originY = parseInt(ruler.getYbyTime(nowPhilNode.year))
                  const prevNodeMaxY = parseInt(ruler.getYbyTime(prevPhilNode.year)) + this.CIRCLE_DIAMETER
                  const triangleHeight = prevNodeMaxY - originY
                  const triangleLong = 100
                  const hypotenuse = Math.sqrt((Math.pow(triangleHeight, 2) + Math.pow(triangleLong, 2)))
                  const angle = (triangleHeight / hypotenuse) >= 0 ? (triangleHeight / hypotenuse) : 0
                  nowPhilNode.angle = angle
                  nowPhilNode.disable = false
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
                  if (this.renderList.every(item => item.id !== nowPhilNode.id)) {
                    this.renderList.push(nowPhilNode)
                  }
                }
              } else {
                // console.log('下个节点不存在')
                // console.log(nextPhilNode)
              }



            }
          } else {
            // 上一个节点为直线直出,或者由折线变成了直线
            // 这里还需要检查一下是否和上一个直线绘制的节点重合如果重合，需要考虑折线绘制
            const isPrevCoinCide = this.checkIsCoinCide(prevPhilNode, nowPhilNode, e)
            const isNextCoinCide = this.checkIsCoinCide(nextPhilNode, nowPhilNode, e)
            if (isPrevCoinCide) {
              // 如果重合，需要计算当前节点偏移多少才不重合并标记为canDraw

              const originY = parseInt(ruler.getYbyTime(nowPhilNode.year))
              const prevNodeMaxY = parseInt(ruler.getYbyTime(prevPhilNode.year)) + this.CIRCLE_DIAMETER
              const triangleHeight = prevNodeMaxY - originY
              const triangleLong = 100
              const hypotenuse = Math.sqrt((Math.pow(triangleHeight, 2) + Math.pow(triangleLong, 2)))
              const angle = (triangleHeight / hypotenuse) >= 0 ? (triangleHeight / hypotenuse) : 0
              nowPhilNode.angle = angle
              nowPhilNode.disable = false
              if (!prevPhilNode.disable) {
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
                if (this.renderList.every(item => item.id !== nowPhilNode.id)) {
                  this.renderList.push(nowPhilNode)
                }
              }




            } else {
              // 直出
              nowPhilNode.disable = false
              nowPhilNode.angle = 0
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
              if (this.renderList.every(item => item.id !== nowPhilNode.id)) {
                this.renderList.push(nowPhilNode)
              }
            }
          }

        }
      })

    }

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