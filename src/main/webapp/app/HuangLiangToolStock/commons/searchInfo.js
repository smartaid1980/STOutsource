;((global, exports) => {
  class SearchInfo {
    constructor(conditionMap) {
      this._init(conditionMap)
    }
    _init(conditionMap) {
      const $container = $(`<h3 id="search-info" style="margin: 10px;"></h3>`)
      const $els = _.mapObject(
        conditionMap,
        (value, key) => new Condition(key, value)
      )
      _.each($els, (condition) => $container.append(condition.$container))
      this.$container = $container
      this.$els = $els
    }
    changeCondition(condition) {
      this.condition = condition
      this.render()
    }
    render() {
      const self = this
      let isShow
      _.each(this.$els, (condition, key) => {
        isShow = Object.prototype.hasOwnProperty.call(this.condition, key)
        if (isShow) {
          condition.changeText(this.condition[key])
        }
        condition.toggle(isShow)
      })
    }
  }
  class Condition {
    constructor(key, name) {
      const item = this.getItem(key, name)
      this.$container = item.$container
      this.$text = item.$text
      this.text = ''
    }
    getItem(key, name) {
      const $container = $(`<span class="${key} hide">${name}：</span>`)
      const $text = $('<span></span>')
      $container.append($text)
      return {
        $container,
        $text,
      }
    }
    changeText(text) {
      if (this.text !== text) {
        this.text = text
        this.$text.text(text)
      }
    }
    hide() {
      this.$container.addClass('hide')
    }
    show() {
      this.$container.removeClass('hide')
    }
    toggle(isShow) {
      this.$container.toggleClass('hide', !isShow)
    }
  }
  if (exports) {
    exports.SearchInfo = () => SearchInfo
  } else {
    global.SearchInfo = SearchInfo
  }
})(window, typeof exports === 'undefined' ? null : exports)
