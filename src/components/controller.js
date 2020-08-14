export default class Controller {
  constructor(props) {
    Object.assign(this, {
      container: document.body,
      tab: true,
      slider: true
    }, props)
    if (this.tab) {
      this.createTab()
    }
    if (this.slider) {
      this.createSlider()
    }
  }
  createTab() {
    this.$html = 
  }
  createSlider() {

  }
}