import Service from '../src/utils/ajaxUtil'
import PhilTimebar from './phil-timebar'


// const mockLength = 20
// let philData = []
// let periodData = []
// for (let i = 0; i < mockLength; i++) {
//   philData.push(Mock.mock({
//     'importance': Random.pick([1, 2, 3]),
//     'itemName': Random.cname(),
//     'originType': Random.pick(['WEST', 'EAST']),
//     'year|-1200-2000': -1200,
//     'avatarUrl': Random.rgb(),
//     'period': '所属时期'
//   }))
// }
// const philTimeBar = new PhilTimebar({
//   philData,
//   periodData
// })
Service.getPhilData().then((resp) => {
  if (resp.code == 200) {
    const { phils } = resp.data
    Service.getPeriodList().then((resp) => {
      if (resp.code === 200) {
        const { data } = resp
        const mockLength = 50
        let philData = phils
        let periodData = []
        periodData = data


        const philTimeBar = new PhilTimebar({
          philData,
          periodData
        })
      }
    })

  }
})
