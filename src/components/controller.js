export default class Controller {
  constructor(props) {
    Object.assign(this, {
      container: document.body,
      tab: true,
      slider: true,
      defaultIndex: 1,
      tabOptions: [{
        text: '西方',
        index: 0
      }, {
        text: '世界',
        index: 1
      }, {
        text: '中国',
        index: 2
      }]
    }, props)
    if (this.tab) {
      this.createTab()
    }
    if (this.slider) {
      this.createSlider()
    }
  }
  createTab() {
    // let $tabList = $('<ul></ul>')
    // $tabList.addClass('tab-list')
    // tabOptions.forEach(tab => {
    //   let $tab = $('<li></li>')
    //   $tab.addClass('tab-item')
    //   $tab.html(tab.text)
    //   $tab.attr('index', tab.text)
    // })
  }
  createSlider() {

  }
}