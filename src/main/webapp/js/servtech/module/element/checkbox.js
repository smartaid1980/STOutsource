import { basicElement } from './basic.js'

export function checkbox(option = {}) {
  const checkboxOption = new CheckboxOption(option)
  const label = basicElement('label', {
    className: ['toggle'],
  })
  const input = basicElement('input', {
    attributes: {
      type: 'checkbox',
      name: checkboxOption.name,
      id: checkboxOption.id,
    },
  })
  const i = basicElement('i', {
    dataset: {
      swchonText: checkboxOption.switchText.on,
      swchoffText: checkboxOption.switchText.off,
    },
  })
  if (checkboxOption.checked) {
    input.setAttributes('checked', 'checked')
  }
  label.textContent = option.text || ''
  label.insertAdjacentElement('afterBegin', i)
  label.insertAdjacentElement('afterBegin', input)
  return label
}

function CheckboxOption(option = {}) {
  this.id = option.id || ''
  this.className = option.className || []
  this.name = option.name || ''
  this.checked = option.checked || false
  this.text = option.text || ''
  this.switchText = Object.assign(
    {
      on: 'ON',
      off: 'OFF',
    },
    option.switchText || {}
  )
}
