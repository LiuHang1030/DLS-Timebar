import Superfetch from '@ah/super-fetch'
function sendRequest(type, url, params = '', config) {
  // 默认配置
  config = Object.assign({
    encrypt: false,
    fingerprint: false,
    withCredentials: true,
    onProgress() { }
  }, config)
  const __superfetch__ = new Superfetch(config)

  // check if exist, be sure not duplication request
  return __superfetch__.ajax({
    url,
    type: type,
    data: params || null,
    headers: config.headers
  }).then(res => { return res })
}
export default {
  // 获取人物轴及气泡数据
  getPhilData(params) {
    return sendRequest('get', '/api/m/phil/n/listAllPhil/v1', params)
  },
  // 获取时期接口
  getPeriodList(params) {
    return sendRequest('get', '/api/m/phil/n/listPeriod/v1', params)
  }
}
