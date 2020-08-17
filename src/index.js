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
const eastData = [{ "id": 34, "itemId": "5a0671607239a550fab5ccf8", "itemName": "老子", "abbreviation": "老子", "importance": 1.1, "originType": "EAST", "period": "先秦", "saying": null, "avatarUrl": "//img.allhistory.com/5efd51a027974b3c8b8ddcb4.png", "year": -571, "month": 0, "timeStr": "571BC", "canDraw": true }, { "id": 42, "itemId": "57eb683f0bd1becf208b4567", "itemName": "颜回", "abbreviation": "颜回", "importance": 3, "originType": "EAST", "period": "先秦", "saying": null, "avatarUrl": "//img.allhistory.com/5efe9e1327974b3c8b8ddce4.png", "year": -521, "month": 0, "timeStr": "521BC", "canDraw": false }, { "id": 40, "itemId": "58f883f655b54258e70009ee", "itemName": "曾参", "abbreviation": "曾子", "importance": 3, "originType": "EAST", "period": "先秦", "saying": null, "avatarUrl": "//img.allhistory.com/5efe96e527974b3c8b8ddcd9.png", "year": -505, "month": 0, "timeStr": "约469BC-399BC", "canDraw": false }, { "id": 41, "itemId": "5924147c55b54278ac001abb", "itemName": "杨朱", "abbreviation": "杨朱", "importance": 3, "originType": "EAST", "period": "先秦", "saying": { "id": 15, "title": "害", "content": null }, "avatarUrl": "//img.allhistory.com/5efe982627974b3c8b8ddcdb.png", "year": -440, "month": 0, "timeStr": "约469BC-399BC", "canDraw": false }, { "id": 3, "itemId": "ee", "itemName": "庄子", "abbreviation": null, "importance": 1, "originType": "EAST", "period": null, "saying": { "id": 3, "title": "hahah2", "content": null }, "avatarUrl": null, "year": -300, "month": null, "timeStr": "300BC-100", "canDraw": true }, { "id": 43, "itemId": "57e4d6360bd1be8375524e5e", "itemName": "韩非", "abbreviation": "韩非", "importance": 1.1, "originType": "EAST", "period": "", "saying": null, "avatarUrl": "//img.allhistory.com/5efe9e8a27974b3c8b8ddce7.png", "year": -280, "month": 0, "timeStr": "280BC", "canDraw": false }, { "id": 4, "itemId": "ererere", "itemName": "孟子", "abbreviation": null, "importance": 1, "originType": "EAST", "period": null, "saying": null, "avatarUrl": null, "year": -100, "month": null, "timeStr": "100BC", "canDraw": false }, { "id": 6, "itemId": "e", "itemName": "老子", "abbreviation": null, "importance": 1, "originType": "EAST", "period": null, "saying": null, "avatarUrl": null, "year": 200, "month": null, "timeStr": "200BC", "canDraw": true }, { "id": 9, "itemId": "e", "itemName": "老子", "abbreviation": null, "importance": 1, "originType": "EAST", "period": null, "saying": null, "avatarUrl": null, "year": 200, "month": null, "timeStr": "500", "canDraw": false }, { "id": 8, "itemId": "e", "itemName": "老子", "abbreviation": "1", "importance": 1, "originType": "EAST", "period": "魏晋南北朝", "saying": null, "avatarUrl": "//img.allhistory.com/5efd872527974b3c8b8ddcbd.png", "year": 500, "month": 0, "timeStr": "500", "canDraw": false }, { "id": 47, "itemId": "583fe3e7bf692840332f56a6", "itemName": "司马光", "abbreviation": "123", "importance": 3, "originType": "EAST", "period": "", "saying": null, "avatarUrl": "//img.allhistory.com/5f02e5d327974b3c8b8ddd92.png", "year": 1019, "month": 2, "timeStr": "1019", "canDraw": true }, { "id": 32, "itemId": "5910555555b542257a01e5dc", "itemName": "芥川龙之介", "abbreviation": "芥川", "importance": 1.2, "originType": "EAST", "period": "清代至近现代", "saying": { "id": 9, "title": "是", "content": null }, "avatarUrl": "//img.allhistory.com/5efd49a027974b57ada031d1.octet-stream", "year": 1662, "month": 0, "timeStr": "清康熙帝康熙元年", "canDraw": true }, { "id": 33, "itemId": "5910555555b542257a01e5dc", "itemName": "芥川龙之介", "abbreviation": "芥川", "importance": 1.2, "originType": "EAST", "period": "清代至近现代", "saying": { "id": 10, "title": "是", "content": null }, "avatarUrl": "//img.allhistory.com/5efd49a027974b57ada031d1.octet-stream", "year": 1662, "month": 0, "timeStr": "清康熙帝康熙元年", "canDraw": false }]
const westData = [{ "id": 36, "itemId": "5924182555b54278ac004402", "itemName": "邓析", "abbreviation": "邓析", "importance": 1.1, "originType": "WEST", "period": "", "saying": null, "avatarUrl": "//img.allhistory.com/5efd7f6a27974b3c8b8ddcba.png", "year": -545, "month": 0, "timeStr": "哈哈", "canDraw": false }, { "id": 37, "itemId": "580716f70bd1be8d718b4567", "itemName": "李白", "abbreviation": "对方是否", "importance": 1.1, "originType": "WEST", "period": "古希腊罗马", "saying": null, "avatarUrl": "//img.allhistory.com/5efd8f2627974b3c8b8ddcc1.png", "year": -495, "month": 0, "timeStr": "495BC", "canDraw": false }, { "id": 39, "itemId": "5a066d867239a550fab5937a", "itemName": "苏格拉底", "abbreviation": "苏格拉底", "importance": 1.2, "originType": "WEST", "period": "古希腊罗马", "saying": { "id": 13, "title": "淡黄的长裙，蓬松的头发", "content": null }, "avatarUrl": "//img.allhistory.com/5efe960127974b3c8b8ddcd6.png", "year": -470, "month": 0, "timeStr": "约469BC-399BC", "canDraw": false }, { "id": 1, "itemId": "57c8e0670bd1be9c188b4570", "itemName": "柏拉图", "abbreviation": "柏拉图", "importance": 1, "originType": "WEST", "period": "古希腊罗马", "saying": null, "avatarUrl": "//pic.evatlas.com/test-image738/a3b3795383f145dd8d276b31a11f0836", "year": -300, "month": 0, "timeStr": "300BC-100BC", "canDraw": true }, { "id": 46, "itemId": "57e2529f0bd1be7546524e63", "itemName": "卢克莱修", "abbreviation": "地方", "importance": 1.1, "originType": "WEST", "period": "古希腊罗马", "saying": { "id": 18, "title": "的是否神鼎飞丹砂第三方第三方", "content": null }, "avatarUrl": "//img.allhistory.com/5f02d8a427974b3c8b8ddd82.png", "year": -99, "month": 0, "timeStr": "111111", "canDraw": true }, { "id": 38, "itemId": "57cce5cc0bd1be1d5043609d", "itemName": "普鲁塔克", "abbreviation": "普鲁塔克", "importance": 3, "originType": "WEST", "period": "古希腊罗马", "saying": null, "avatarUrl": "//img.allhistory.com/5efdab9a27974b3c8b8ddcc7.png", "year": 55, "month": 0, "timeStr": "约469BC-399BC", "canDraw": false }, { "id": 31, "itemId": "580716f70bd1be8d718b4567", "itemName": "李白", "abbreviation": "稍等", "importance": 1.2, "originType": "WEST", "period": "中世纪", "saying": { "id": 8, "title": "名言", "content": null }, "avatarUrl": "//img.allhistory.com/5efd46c427974b71ff0f7862.blob", "year": 300, "month": 0, "timeStr": "300", "canDraw": true }, { "id": 19, "itemId": "dddd", "itemName": "xxxxxx", "abbreviation": "dd", "importance": 2, "originType": "WEST", "period": "中世纪", "saying": null, "avatarUrl": "//img.allhistory.com/5efd8f4027974b3c8b8ddcc2.png", "year": 500, "month": 10, "timeStr": "500", "canDraw": true }, { "id": 48, "itemId": "580716f70bd1be8d718b4567", "itemName": "李白", "abbreviation": "第三方", "importance": 1.2, "originType": "WEST", "period": "近代", "saying": null, "avatarUrl": "//img.allhistory.com/5f043b1a27974b3c8b8dded0.png", "year": 1662, "month": 0, "timeStr": "清康熙帝康熙元年", "canDraw": true }]
const philData = eastData.concat(westData)
const periodData = [{ "id": 1, "periodName": "先秦", "startYear": -2000, "endYear": -221, "type": "EAST" }, { "id": 2, "periodName": "两汉", "startYear": -220, "endYear": 190, "type": "EAST" }, { "id": 3, "periodName": "魏晋南北朝", "startYear": 191, "endYear": 580, "type": "EAST" }, { "id": 4, "periodName": "隋唐", "startYear": 581, "endYear": 960, "type": "EAST" }, { "id": 5, "periodName": "宋明", "startYear": 961, "endYear": 1634, "type": "EAST" }, { "id": 6, "periodName": "清代至近现代", "startYear": 1635, "endYear": null, "type": "EAST" }, { "id": 7, "periodName": "古希腊罗马", "startYear": -1000, "endYear": 180, "type": "WEST" }, { "id": 8, "periodName": "中世纪", "startYear": 181, "endYear": 1555, "type": "WEST" }, { "id": 9, "periodName": "近代", "startYear": 1556, "endYear": 1818, "type": "WEST" }, { "id": 10, "periodName": "现当代", "startYear": 1819, "endYear": null, "type": "WEST" }]
const philTimeBar = new PhilTimebar({
  philData,
  periodData
})
// Service.getPhilData().then((resp) => {
//   if (resp.code == 200) {
//     const { phils } = resp.data
//     Service.getPeriodList().then((resp) => {
//       if (resp.code === 200) {
//         const { data } = resp
//         const mockLength = 50
//         let philData = phils
//         let periodData = []
//         periodData = data
//         console.log(periodData)

//         const philTimeBar = new PhilTimebar({
//           philData,
//           periodData
//         })
//       }
//     })

//   }
// })
