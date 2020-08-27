export function basicElement(tagName, option = {}) {
  const el = document.createElement(tagName)
  const elementOption =
    option instanceof ElementOption ? option : new ElementOption(option)

  el.id = elementOption.id
  el.classList.add(...elementOption.className)
  el.textContent = elementOption.text
  Object.entries(elementOption.attributes).forEach(([key, val]) =>
    el.setAttribute(key, val)
  )
  Object.entries(elementOption.dataset).forEach(
    ([key, val]) => (el.dataset[key] = val)
  )

  return el
}

export function ElementOption(option = {}) {
  this.id = option.id || ''
  this.className = option.className || []
  this.text = option.text || ''
  this.attributes = option.attributes || {}
  this.dataset = option.dataset || {}
}
