import { loadingButton } from '../servkit/form.js'
import { basicElement, ElementOption } from './basic.js'

export function awesomeIcon(className, option = {}, iconSizeClass) {
  const elementOption = new ElementOption(option)
  elementOption.className.push('fa', className)
  if (iconSizeClass) {
    elementOption.className.push(iconSizeClass)
  }
  return basicElement('i', elementOption)
}
export function button(option = {}) {
  return basicElement('button', new ElementOption(option))
}
export function iconButton(option = {}, iconClassName, iconSizeClass) {
  const btn = button(option)
  if (option.text) {
    btn.textContent = ' ' + btn.textContent
  }
  btn.insertAdjacentElement(
    'afterBegin',
    awesomeIcon(iconClassName, iconSizeClass)
  )
  loadingButton(btn)
  return btn
}
export function refreshButton(option = {}) {
  const elementOption = new ElementOption(option)
  elementOption.className.push('btn', 'btn-primary')
  return iconButton(elementOption, 'fa-refresh')
}
export function createButton(option = {}) {
  const elementOption = new ElementOption(
    Object.assign(option, {
      attributes: {
        title: i18n('Add'),
      },
    })
  )
  elementOption.className.push('btn', 'btn-primary', 'btn-xs')
  return iconButton(elementOption, 'fa-plus')
}
export function editButton(option = {}) {
  const elementOption = new ElementOption(
    Object.assign(option, {
      attributes: {
        title: i18n('Edit'),
      },
    })
  )
  elementOption.className.push('btn', 'btn-primary', 'btn-xs')
  return iconButton(elementOption, 'fa-pencil')
}
export function deleteButton(option = {}) {
  const elementOption = new ElementOption(
    Object.assign(option, {
      attributes: {
        title: i18n('Delete'),
      },
    })
  )
  elementOption.className.push('btn', 'btn-danger', 'btn-xs')
  return iconButton(elementOption, 'fa-times')
}
export function uploadButton(option = {}) {
  const elementOption = new ElementOption(option)
  elementOption.className.push('btn', 'btn-primary')
  return iconButton(elementOption, 'fa-upload')
}
