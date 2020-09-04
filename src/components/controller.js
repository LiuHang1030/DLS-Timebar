export default class Controller {
  constructor(props) {
    Object.assign(this, {
      container: document.body,
      $html: '',
      tab: true,
      slider: true,
      sliderDefaultIndex: 0,
      tabDefaultIndex: 1,
      sliderOptions: [{
        index: 0
      }, {
        index: 1
      }, {
        index: 2
      }],
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

      },
      onSliderClickHandle: () => {

      }
    }, props)
    if (this.tab) {
      this.createTab()

    }
    if (this.slider) {
      this.createSlider()
    }
    this.bind()
  }
  createTab() {
    this.$tabList = $('<ul></ul>')
    this.$tabList.addClass('tab-list')
    this.tabOptions.forEach(tab => {
      let $tab = $('<li></li>')
      $tab.addClass('tab-item')
      $tab.html(tab.text)
      $tab.attr('index', tab.index)
      if (tab.index == this.tabDefaultIndex) {
        $tab.addClass('active')
      }
      this.$tabList.append($tab)
    })

    this.container.appendChild(this.$tabList[0])
  }
  createSlider() {
    this.$sliderList = $('<ul></ul>')
    this.$sliderList.addClass('slider-list')
    let text = $(document.createElement('span'))
    text.html('重要级')
    this.$sliderList.append(text)
    this.sliderOptions.forEach(slider => {
      let $slider = $('<li></li>')
      $slider.addClass('slider-item')
      $slider.attr('index', slider.index)
      if (slider.index == this.sliderDefaultIndex) {
        $slider.addClass('active')
      }
      this.$sliderList.append($slider)
    })
    this.$html.append(this.$sliderList[0])

  }
  bind() {
    let that = this
    $('.tab-item').bind('click', function () {
      var index = $(".tab-item").index($(this));
      $('.tab-item').removeClass('active')
      $(this).addClass('active')
      that.onTabClickHandle(index)
    })
    $('.slider-item').bind('click', function () {
      var index = $(".slider-item").index($(this));
      $('.slider-item').removeClass('active')
      $(this).addClass('active')
      that.onSliderClickHandle(index)
    })
  }
}