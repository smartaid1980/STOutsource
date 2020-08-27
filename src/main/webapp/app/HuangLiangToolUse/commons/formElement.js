;((global, exports) => {
  class Form {
    constructor(container) {
      if (jQuery && container instanceof jQuery) {
        this.$container = container
        this.container = container[0]
      } else if (container instanceof Element) {
        this.container = container
        this.$container = $(container)
      }
      this.initElements()
    }
    initElements() {
      this.elements = Array.from(
        this.container.querySelectorAll('input, select')
      ).reduce((a, el) => {
        const name = el.name
        const isExist = Object.prototype.hasOwnProperty.call(a, name)
        const nodeName = el.nodeName
        const type = el.type

        if (nodeName === 'INPUT' && (type === 'radio' || type === 'checkbox')) {
          if (!isExist) {
            a[name] = el.type === 'radio' ? new Radio(name) : new Checkbox(name)
          }
          a[name].add(el)
        } else if (nodeName === 'INPUT') {
          a[name] = new FormElement(el)
        } else if (nodeName === 'SELECT') {
          a[name] = el.multiple ? new MultipleSelect(el) : new Select(el)
        }
        return a
      }, {})
    }
    setValue(value) {
      const self = this
      const isObject =
        Object.prototype.toString.call(value) === '[object Object]'
      if (!isObject) {
        return
      }
      Object.entries(value).forEach(([name, v]) => {
        if (Object.prototype.hasOwnProperty.call(self.elements, name)) {
          self.elements[name].setValue(v)
        }
      })
    }
    getValue(name) {
      const result = {}
      if (name) {
        return this.elements[name].getValue()
      }
      for (let [name, element] of Object.entries(this.elements)) {
        result[name] = element.getValue()
      }
      return result
    }
    reset() {
      Object.values(this.elements).forEach((el) => el.reset())
      Array.from(this.container.querySelectorAll('label.error')).forEach((el) =>
        el.remove()
      )
    }
    validate(config) {
      const self = this
      // config是空的也會回傳true，表示沒有需要驗證的
      return Object.entries(config)
        .map(([name, fieldConfig]) => {
          const el = self.elements[name]
          if (el) {
            return el.validate(fieldConfig)
          } else {
            return true
          }
        })
        .every((isValid) => isValid)
    }
    validateAsync(config) {
      const self = this
      // config是空的也會回傳true，表示沒有需要驗證的
      return Promise.all(
        Object.entries(config).map(([name, fieldConfig]) => {
          const el = self.elements[name]
          if (el) {
            return new Promise((res) => el.validateAsync(fieldConfig, res))
          } else {
            return Promise.resolve()
          }
        })
      ).then(([...isValidList]) => isValidList.every((isValid) => isValid))
    }
  }
  class FormElement {
    constructor(element) {
      this.element = element
    }
    setValue(value) {
      this.element.value = value
    }
    getValue() {
      return this.element.value
    }
    reset() {
      this.element.value = ''
    }
    validate(fieldConfig) {
      const { validate, errorPlacement } = fieldConfig
      let errorMsg = ''
      if (Object.prototype.toString.call(validate) === '[object Function]') {
        errorMsg = validate.call(this)
      }
      if (errorPlacement) {
        this.errorPlacement = errorPlacement
      }
      this.renderErrorMsg(errorMsg)
      return !errorMsg
    }
    validateAsync(fieldConfig, res) {
      const self = this
      const { validate, errorPlacement } = fieldConfig
      return validate.call(this).then((errorMsg) => {
        if (errorPlacement) {
          self.errorPlacement = errorPlacement
        }
        this.renderErrorMsg(errorMsg)
        res(!errorMsg)
      })
    }
    renderErrorMsg(msg) {
      const { errorLabel } = this
      if (msg && errorLabel) {
        errorLabel.textContent = msg
      } else if (msg) {
        const label = document.createElement('label')
        label.classList.add('error')
        label.style.color = 'red'
        label.textContent = msg
        this.errorLabel = label
        if (this.errorPlacement) {
          this.errorPlacement.call(this, label)
        } else {
          this.element.insertAdjacentElement('afterend', label)
        }
      } else if (errorLabel) {
        errorLabel.remove()
        this.errorLabel = null
      }
    }
  }
  class Select extends FormElement {
    constructor(element) {
      super(element)
    }
    reset(isEmpty) {
      if (isEmpty) {
        this.element.value = ''
      } else if (this.element.options.length) {
        this.element.options[0].selected = true
      }
    }
  }
  class MultipleSelect extends Select {
    constructor(element) {
      super(element)
    }
    setValue(valueArray) {
      const cloneValue = [...valueArray]
      let isExist
      let index
      Array.from(this.element.options).forEach((option) => {
        index = cloneValue.findIndex((v) => v === option.value)
        isExist = index >= 0
        option.selected = isExist
        if (isExist) {
          cloneValue.splice(index, 1)
        }
      })
    }
    getValue() {
      return Array.from(this.element.selectedOptions)
        .map((option) => option.value)
        .filter((v) => v !== 'ALL')
    }
    reset(isSelectAll) {
      Array.from(this.element.options).forEach(
        (op) => (op.selected = !!isSelectAll)
      )
    }
  }
  class Radio extends FormElement {
    constructor(name) {
      super()
      this.elements = {}
      this.name = name
    }
    add(element) {
      const value = element.value
      this.elements[value] = element
    }
    getValue() {
      const checkedEl = Object.values(this.elements).find((el) => el.checked)
      return checkedEl ? checkedEl.value : null
    }
    setValue(value) {
      Object.values(this.elements).forEach((el) => {
        el.checked = el.value === value
      })
    }
    reset() {
      Object.values(this.elements).forEach((el) => (el.checked = false))
    }
  }
  class Checkbox extends FormElement {
    constructor(name) {
      super()
      this.elements = {}
      this.name = name
    }
    add(element) {
      const value = element.value
      this.elements[value] = element
    }
    getValue() {
      return Object.values(this.elements).reduce(
        (a, el) => (el.checked ? [...a, el.value] : a),
        []
      )
    }
    setValue(valueArray) {
      Object.values(this.elements).forEach((el) => {
        el.checked = valueArray.includes(el.value)
      })
    }
    reset(isSelectAll) {
      Object.values(this.elements).forEach((el) => (el.checked = !!isSelectAll))
    }
  }
  if (exports) {
    exports.Form = () => Form
  } else {
    global.Form = Form
  }
})(window, typeof exports === 'undefined' ? null : exports)
