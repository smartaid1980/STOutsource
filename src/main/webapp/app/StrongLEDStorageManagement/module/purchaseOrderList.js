class PurchaseOrder {
  constructor() {
    this.poData = null
  }
  async _init() {
    this.poData = await this.getData()
    return this
  }
  getData() {
    return new Promise((res) =>
      servkit.ajax(
        {
          url: 'api/getdata/db',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
            table: 'a_comoss_view_purchase_order_is_scheduled',
          }),
        },
        {
          success(data) {
            res(data.map((d) => Object.assign(d, { pur_id: d.pur_id.trim() })))
          },
        }
      )
    )
  }
  getPurIdList() {
    return this.poData
      ? Array.from(new Set(_.pluck(this.poData, 'pur_id')))
      : []
  }
  getTypeAndSerialList(pur_id) {
    const poList = this.poData
      ? this.poData.filter((map) => map.pur_id === pur_id)
      : []
    return _.chain(poList)
      .groupBy('pur_order_type')
      .mapObject((mapList) => _.pluck(mapList, 'serial_num'))
      .value()
  }
  initQueryFormEls(purIdInput, purOrderTypeSelect, serialNumSelect) {
    const self = this
    self.purIdInput = purIdInput
    self.purOrderTypeSelect = purOrderTypeSelect
    self.serialNumSelect = serialNumSelect
    $(purIdInput).on(
      'keyup',
      _.debounce(function () {
        const pur_id = this.value
        const typeAndSerialList = (self.typeAndSerialList = self.getTypeAndSerialList(
          pur_id
        ))
        servkit.initSelectWithList(
          Object.keys(typeAndSerialList),
          $(purOrderTypeSelect)
        )
        $(purOrderTypeSelect).change()
      }, 500)
    )
    $(purOrderTypeSelect).on('change', function () {
      const { typeAndSerialList } = self
      const pur_order_type = this.value
      const serialNumList = typeAndSerialList[pur_order_type] || ''
      servkit.initSelectWithList(serialNumList, $(serialNumSelect))
    })
  }
}
const getPurchaseOrder = (() => {
  let result
  return () => {
    if (result) {
      return Promise.resolve(result)
    } else {
      result = new PurchaseOrder()
      return result._init()
    }
  }
})()

export { getPurchaseOrder }
