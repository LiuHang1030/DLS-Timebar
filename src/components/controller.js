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
      }],
      onTabClickHandle: () => {

      }
    }, props)
    if (this.tab) {
      this.createTab()
      this.bind()
    }
    if (this.slider) {
      this.createSlider()
    }
  }
  createTab() {
    this.$tabList = $('<ul></ul>')
    this.$tabList.addClass('tab-list')
    this.tabOptions.forEach(tab => {
      let $tab = $('<li></li>')
      $tab.addClass('tab-item')
      $tab.html(tab.text)
      $tab.attr('index', tab.index)
      if (tab.index == this.defaultIndex) {
        $tab.addClass('active')
      }
      this.$tabList.append($tab)
    })

    this.container.appendChild(this.$tabList[0])
  }
  createSlider() {

  }
  bind() {
    let that = this
    $('.tab-item').bind('click', function () {
      var index = $(".tab-item").index($(this));
      $('.tab-item').removeClass('active')
      $(this).addClass('active')
      that.onTabClickHandle(index)
    })
  }
}