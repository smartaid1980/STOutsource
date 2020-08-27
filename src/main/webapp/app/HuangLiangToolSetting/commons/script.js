const insertFilter = (tr, columnConfig) => {
  const fragment = document.createDocumentFragment()
  const selectNode = document.createElement('select')
  const inputNode = document.createElement('input')
  let thNode = document.createElement('th')
  thNode.classList.add('hasinput')
  selectNode.classList.add('form-control')
  inputNode.classList.add('form-control')
  inputNode.type = 'text'
  columnConfig.forEach((map) => {
    const { filterType, width } = map
    let cloneNode = thNode.cloneNode(true)
    switch (filterType) {
      case 'input':
        cloneNode.appendChild(inputNode.cloneNode(true))
        break
      case 'select':
        cloneNode.appendChild(selectNode.cloneNode(true))
        break
    }
    cloneNode.style.width = width
    fragment.appendChild(cloneNode)
  })
  tr.appendChild(fragment)
}
const insertTitle = (tr, columnConfig) => {
  const fragment = document.createDocumentFragment()
  const th = document.createElement('th')
  columnConfig.forEach((map) => {
    const { title } = map
    th.textContent = title
    fragment.appendChild(th.cloneNode(true))
  })
  tr.appendChild(fragment)
}
exports.insertFilter = insertFilter
exports.insertTitle = insertTitle
