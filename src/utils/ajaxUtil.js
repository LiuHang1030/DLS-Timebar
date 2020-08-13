import axios from '@ah/dls-axios'

const domainName = {
  default: '',
  technology: '__ALLHISTORY_TECHNOLOGY_HOSTNAME__'
};

async function sendRequest(url, method, params = null, config) {
  //默认配置
  config = Object.assign({
    //是否请求本地接口（api被不可被设置为本地）
    local: false,
    //是否需要方式重复操作，重复请求
    once: true,
    //是否需要序列化
    stringify: true,
    host: 'default'
  }, config);

  let hostname = domainName[config.host];
  if (!hostname) {
    hostname = domainName['default'];
  }
  //以下条件全部满足，才使用dataCenter的接口
  if (
    (url.indexOf("http") !== 0) &&
    (url.indexOf("//") !== 0) &&
    !config.local
  ) {
    url = hostname + url;

  }
  //set defer
  return new Promise((resolve, reject) => {
    axios({
      url,
      method,
      data: params ? params : null,
    }).then(response => {
      let resp = response.data
      switch (resp.code) {
        case 200:
          resolve(resp)
          break;
        case 201:
          resolve(resp);
          break;
        case 888:
          // window.vue.$store.commit('SET_ERROR_POP_UP', {
          //   show: true
          // })
          reject(resp);
          break;
        default:
          reject(resp);
      }
    }, err => {
      reject(err);
    }).catch(resp => {
      switch (resp.status) {
        case 888:
          // window.vue.$store.commit('SET_ERROR_POP_UP', {
          //   show: true
          // })
          reject(resp);
          break;
        default:
          reject(resp);
      }
    })
  });
}

export default {
  // 获取人物轴及气泡数据
  getPhilData(params) {
    return sendRequest('/api/m/phil/n/listAllPhil/v1', 'get', params)
  },
  // 获取时期接口
  getPeriodList(params) {
    return sendRequest('/api/m/phil/n/listPeriod/v1', 'get', params)
  }
}
