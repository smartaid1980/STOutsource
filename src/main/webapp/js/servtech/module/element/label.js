import { basicElement, ElementOption } from './basic.js'

export const labelColorMap = {
  default: 'grey',
  success: 'green',
  primary: 'blue',
  warning: 'yellow',
  info: 'lightblue',
  danger: 'red',
}

export function colorLabel(type, option) {
  const elementOption = new ElementOption(option)

  elementOption.className.push('label', `label-${type}`)
  return basicElement('span', elementOption)
}
