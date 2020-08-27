class InfoTable {
  constructor(table, colsInRow, columns) {
    this.table = table
    this.colsInRow = colsInRow
    this.columns = columns
    this.columnsMap = {}
    this._render()
  }
  _render() {
    const colsCount = this.columns.length
    const rowsCount = Math.ceil(colsCount / this.colsInRow)
    const fragment = document.createDocumentFragment()
    const getEl = (el) => document.createElement(el)
    let tbody = this.table.querySelector('tbody')
    let titleTr
    let valueTr
    let th
    let td
    let currIndex

    if (!tbody) {
      tbody = document.createElement('tbody')
      this.table.appendChild(tbody)
    }
    for (let i = 0; i < rowsCount; i++) {
      titleTr = getEl('tr')
      valueTr = getEl('tr')
      for (let j = 0; j < this.colsInRow; j++) {
        currIndex = i * this.colsInRow + j
        if (currIndex === this.columns.length) {
          th = getEl('th')
          th.colSpan = rowsCount * this.colsInRow - this.columns.length
          td = getEl('td')
          td.colSpan = th.colSpan
          titleTr.appendChild(th)
          valueTr.appendChild(td)
          break
        } else {
          th = getEl('th')
          th.textContent = this.columns[currIndex].title
          td = getEl('td')
          td.dataset.colName = this.columns[currIndex].name
          this.columnsMap[this.columns[currIndex].name] = td
          titleTr.appendChild(th)
          valueTr.appendChild(td)
        }
      }
      fragment.appendChild(titleTr)
      fragment.appendChild(valueTr)
    }
    tbody.appendChild(fragment)
  }
  draw(rowData) {
    let colName
    for (let td of Object.values(this.columnsMap)) {
      colName = td.dataset.colName
      td.textContent = Object.prototype.hasOwnProperty.call(rowData, colName)
        ? this.dataTransfer(rowData[colName], colName, rowData)
        : '---'
    }
  }
  // 初始化要改寫的資料轉換方法
  dataTransfer(data, colName, rowData) {
    return data
  }
}
export { InfoTable }
