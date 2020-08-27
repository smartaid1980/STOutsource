import { InfoTable } from '../infoTable.js'
import { getPositionStructure } from '../positionStructure.js'
import { SyncErp } from '../syncErp.js'

export default function () {
  GoGoAppFun({
    gogo(context) {
      window.c = context
      context.main()
    },
    util: {
      quantity: 0,
      min: 100,
      unit: '',
      codeList: [],
      materialPositionCache: {},
      loadingBtn: servkit.loadingButton(document.querySelector('#query-btn')),
      confirmMinLoadingBtn: null,
      createPrintloadingBtn: servkit.loadingButton(
        document.querySelector('#create-and-print')
      ),
      createloadingBtn: servkit.loadingButton(
        document.querySelector('#create-without-print')
      ),
      autoPrint: false,
      main() {
        const context = this
        context.initDetailReportTable()
        context.initCreateCodeModal()
        context.syncErp.updateLastSyncTime()
        context.initQueryForm()
      },
      initQueryForm() {
        const context = this
        servkit.validateForm($('#query-form'), $('#query-btn'))
        $('#query-btn').on('click', context.queryBill.bind(context)).click()
      },
      queryBill(evt) {
        const context = this
        if (evt) {
          evt.preventDefault()
        }
        context.loadingBtn.doing()
        const status = $('[name=status]:checked').val()
        let whereClause =
          'AND (in_stock = 0 OR in_stock IS NULL) GROUP BY bill_no, bill_detail, bill_column_1'
        // 所有未入庫
        if (status === '2') {
          whereClause = `bill_status IN ('0', '1') ` + whereClause
        }
        // 已/未產生條碼、未入庫
        else {
          whereClause = `bill_status = '${status}' ` + whereClause
        }

        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_comoss_view_bill_stock_in_left_join_material_thing',
              whereClause,
            }),
          },
          {
            success(data) {
              context.renderDetailTable(data)
              context.loadingBtn.done()
            },
          }
        )
      },
      initDetailReportTable() {
        const context = this
        context.detailReportTable = createReportTable({
          $tableElement: $('#detail-table'),
          $tableWidget: $('#detail-table-widget'),
          order: [[0, 'desc']],
          customBtns: [
            `<button id="synchronize" class="btn btn-primary">${i18n(
              'Refresh_Purchase_Order'
            )}</button>`,
          ],
          columnDefs: [
            {
              targets: [6],
              type: 'num-cust',
            },
            {
              targets: [7],
              orderable: false,
            },
          ],
          columnDefinitions: [
            {
              name: 'bill_no',
              data: 'bill_no',
            },
            {
              name: 'bill_column_1', // 進貨單別
              data: 'bill_column_1',
            },
            {
              name: 'bill_detail',
              data: 'bill_detail',
            },
            {
              name: 'bill_date',
              data: 'bill_date',
            },
            {
              name: 'material_id',
              data: 'material_id',
            },
            {
              name: 'material_desc',
              data: 'material_desc',
            },
            {
              name: 'quantity',
              data: 'quantity',
            },
            {
              name: 'edit',
              data: 'edit',
            },
            {
              name: 'material_sub',
              data: 'material_sub',
            },
            {
              name: 'unit',
              data: 'unit',
            },
            {
              name: 'delivery_date',
              data: 'delivery_date',
            },
            {
              name: 'remark',
              data: 'remark',
            },
            {
              name: 'bill_column_2', // 採購單別
              data: 'bill_column_2',
            },
            {
              name: 'bill_column_3', // 採購單號
              data: 'bill_column_3',
            },
            {
              name: 'bill_column_4', // 採購單序號
              data: 'bill_column_4',
            },
          ],
        })
        $('#detail-table')
          // 叫出建立條碼modal
          .on('click', '.create-code', function () {
            const btn = this
            const tr = btn.closest('tr')
            const rowData = context.detailReportTable.getObjectData(tr)
            context
              .fetchScheduleThingData(rowData)
              .then(() => context.showCreateCodeModal(btn, false))
          })
          // 叫出列印條碼modal
          .on('click', '.reprint', function () {
            const btn = this
            const tr = btn.closest('tr')
            const rowData = context.detailReportTable.getObjectData(tr)
            context
              .fetchThingData(rowData)
              .then(() => context.showCreateCodeModal(btn, true))
          })

        context.syncErp = new SyncErp({
          btn: document.getElementById('synchronize'),
          syncBy: 'billStockInSync',
          syncApiUrl: 'api/comoss/erpsyn',
          syncErpCallBack() {
            context.queryBill()
          },
        })
      },
      renderDetailTable(data) {
        const context = this
        context.detailReportTable.drawTable(
          _.map(data, (val) => {
            let btnHtml
            switch (val.bill_status) {
              case 0:
                btnHtml = `<button class="btn btn-success create-code">${i18n(
                  'Generate_Qrcode'
                )}</buttton>`
                break
              case 1:
                btnHtml = `<button class="btn btn-primary reprint">${i18n(
                  'Reprint_Qrcode'
                )}</buttton>`
                break
            }
            return [
              val.bill_no || '---',
              val.bill_column_1,
              val.bill_detail || '---',
              val.bill_date || '---',
              // !val.material_sub || val.material_sub === "0000"
              //   ? "---"
              //   : val.material_sub,
              val.material_id || '---',
              val.material_desc || '---',
              val.quantity || '---',
              btnHtml,
              val.material_sub,
              val.material_unit,
              val.delivery_date || '---',
              val.remark,
              val.bill_column_2,
              val.bill_column_3,
              val.bill_column_4,
            ]
          })
        )
      },
      fetchScheduleThingData(detailTableRowData) {
        const context = this
        const {
          bill_column_2: pur_order_type,
          bill_column_3: pur_id,
          bill_column_4: serial_num,
          quantity,
          unit,
        } = detailTableRowData
        context.codeList = []
        context.createPrintloadingBtn.done()
        context.createloadingBtn.done()
        context.unit = unit
        return new Promise((res) =>
          servkit.ajax(
            {
              url: 'api/getdata/db',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                table: 'a_comoss_view_schedule_thing_stock_in_thing', // schedule thing left join thing
                whereClause: `pur_type='${pur_order_type}' and pur_id='${pur_id}' and serial_num='${serial_num}'`,
              }),
            },
            {
              success(data) {
                let schedule_position
                let schedule_position_id
                let stock_time_range
                let thing_pcs
                let quantityLeft = quantity

                context.scheduleThingData = data.reduce(
                  (a, map) => {
                    if (map.thing_id) {
                      a.batched.push(map)
                    } else {
                      map.schedule_position_id = schedule_position_id = map.schedule_store_id
                        ? context.preCon.positionStructure.getPositionIdFromDb(
                            map.schedule_store_id,
                            map.schedule_store_grid_index,
                            map.schedule_store_cell_index
                          )
                        : null
                      map.schedule_position = schedule_position = schedule_position_id
                        ? context.preCon.positionStructure.getPositionIdPath(
                            schedule_position_id
                          )
                        : null
                      map.stock_time_range = stock_time_range = map.exp_date
                        ? `${map.exp_date.toFormatedDate()} ~ ${map.exp_edate.toFormatedDate()}`
                        : null
                      a.unbatched.push(map)
                    }
                    return a
                  },
                  {
                    batched: [],
                    unbatched: [],
                  }
                )

                context.codeList = context.scheduleThingData.unbatched.reduce(
                  (a, map, i) => {
                    if (quantityLeft > 0) {
                      ;({
                        schedule_position,
                        schedule_position_id,
                        stock_time_range,
                      } = map)
                      thing_pcs =
                        quantityLeft >= map.schedule_thing_pcs
                          ? map.schedule_thing_pcs
                          : quantityLeft
                      quantityLeft -= thing_pcs
                      a.push({
                        code_no: i + 1,
                        thing_pcs,
                        thing_unit:
                          map.schedule_thing_unit || context.unit || '',
                        stock_time_range,
                        schedule_position,
                        schedule_position_id,
                        position: schedule_position,
                        position_id: schedule_position_id,
                        schedule_thing_id: map.schedule_thing_id,
                      })
                    }
                    return a
                  },
                  []
                )
                res()
              },
            }
          )
        )
      },
      fetchThingData(detailTableRowData) {
        const context = this
        let stock_time_range
        let position_id
        let schedule_position_id
        let schedule_position
        return new Promise((res) =>
          servkit.ajax(
            {
              url: 'api/getdata/db',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                table: 'a_comoss_view_thing_schedule_thing', // thing left join schedule thing
                whereClause: 'column2 = ? AND bill_no = ? AND bill_detail = ?',
                whereParams: [
                  detailTableRowData.bill_column_1,
                  detailTableRowData.bill_no,
                  detailTableRowData.bill_detail,
                ],
              }),
            },
            {
              success(data) {
                context.codeList = []
                data.forEach((map) => {
                  schedule_position_id = map.schedule_store_id
                    ? context.preCon.positionStructure.getPositionIdFromDb(
                        map.schedule_store_id,
                        map.schedule_store_grid_index,
                        map.schedule_store_cell_index
                      )
                    : null
                  schedule_position = schedule_position_id
                    ? context.preCon.positionStructure.getPositionIdPath(
                        schedule_position_id
                      )
                    : null
                  stock_time_range = map.exp_date
                    ? `${map.exp_date.toFormatedDate()} ~ ${map.exp_edate.toFormatedDate()}`
                    : null
                  position_id =
                    map.column1 && map.column1 !== '-1' ? map.column1 : null
                  context.codeList.push(
                    Object.assign(map, {
                      stock_time_range,
                      schedule_position,
                      schedule_position_id,
                      position: position_id
                        ? context.preCon.positionStructure.getPositionIdPath(
                            position_id
                          )
                        : null,
                      position_id,
                      isSaved: true,
                    })
                  )
                })
                res()
              },
            }
          )
        )
      },
      initCreateCodeModal() {
        const context = this
        context.initInfoTable()
        context.initCodeTable()
        context.initMatStoreRecordTable()

        $('#create-and-print').on('click', function () {
          context.saveThingData('createPrintloadingBtn', function () {
            context.autoPrint = true
            $('#print').trigger('click')
            context.createPrintloadingBtn.done()
            $('#create-code-modal').modal('hide')
            $('#query-btn').trigger('click')
          })
        })
        $('#create-without-print').on('click', function () {
          context.saveThingData('createloadingBtn', function () {
            context.createloadingBtn.done()
            $('#create-code-modal').modal('hide')
            $('#query-btn').trigger('click')
          })
        })
      },
      initInfoTable() {
        const context = this
        const columns = [
          {
            title: i18n('No._Jinhuo_Dan'),
            name: 'bill_no',
          },
          {
            title: i18n('Item_Number'),
            name: 'material_id',
          },
          {
            title: i18n('Specification'),
            name: 'material_desc',
          },
          {
            title: i18n('Quantity'),
            name: 'quantity',
          },
          {
            title: i18n('Prepaid_Date'),
            name: 'delivery_date',
          },
        ]
        context.billInfoTable = new InfoTable(
          document.getElementById('basic-table'),
          5,
          columns
        )
      },
      initMatStoreRecordTable() {
        const context = this
        context.matStoreRecordTable = createReportTable({
          $tableElement: $('#material-store-record-table'),
          $tableWidget: $('#material-store-record-table-widget'),
          showNoData: false,
          columns: [
            {
              name: 'section',
              data: 'section',
            },
            {
              name: 'level',
              data: 'level',
            },
            {
              name: 'position',
              data: 'position',
            },
            {
              name: 'pur_id',
              data: 'pur_id',
              render(data) {
                return data || ''
              },
            },
            {
              name: 'log_time',
              data: 'log_time',
            },
            {
              name: 'store_material',
              data: 'store_material',
              render(data = {}) {
                return Object.entries(data)
                  .map(
                    ([material_id, { thing_pcs, thing_unit }]) =>
                      `${material_id}／${thing_pcs} ${thing_unit}`
                  )
                  .join('<br>')
              },
            },
          ],
        })
      },
      getMatStoreRecord(material_id) {
        const context = this
        return new Promise((res) =>
          servkit.ajax(
            {
              url: 'api/getdata/db',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                table: 'a_storage_view_material_stock_in_record',
                whereClause: 'log_material_id = ?',
                whereParams: [material_id],
              }),
            },
            {
              success(response) {
                res(
                  response.map((map) => {
                    const positionData = context.preCon.storePosition.find(
                      (data) => {
                        return (
                          data.store_id === map.store_id &&
                          data.store_grid_index === map.store_grid_index &&
                          data.store_cell_index === map.store_cell_index
                        )
                      }
                    )
                    const position_id = positionData
                      ? positionData.position_id
                      : ''

                    return Object.assign(
                      map,
                      {
                        log_time: map.log_time.toFormatedDatetime(),
                      },
                      context.preCon.positionStructure.getPositionIdPath(
                        position_id
                      )
                    )
                  })
                )
              },
            }
          )
        )
      },
      groupMatStoreRecord(data) {
        return _.chain(data)
          .groupBy((map) => {
            return `${map.store_id}||${map.store_grid_index}||${map.store_cell_index}||${map.log_time}`
          })
          .values()
          .sort((a, b) => +new Date(b[0].log_time) - +new Date(a[0].log_time))
          .first(3)
          .map((list) =>
            list.reduce((a, x) => {
              if (_.isEmpty(a)) {
                Object.assign(
                  a,
                  _.pick(x, [
                    'section',
                    'level',
                    'position',
                    'log_time',
                    'pur_id',
                  ])
                )
                a.store_material = x.material_id
                  ? {
                      [x.material_id]: {
                        thing_pcs: x.thing_pcs,
                        thing_unit: x.thing_unit || '',
                      },
                    }
                  : {}
              } else if (x.material_id && a.store_material[x.material_id]) {
                a.store_material[x.material_id].thing_pcs = window.Decimal.add(
                  a.store_material[x.material_id].thing_pcs,
                  x.thing_pcs
                ).toNumber()
              } else if (x.material_id) {
                a.store_material[x.material_id] = {
                  thing_pcs: x.thing_pcs,
                  thing_unit: x.thing_unit || '',
                }
              }
              return a
            }, {})
          )
          .value()
      },
      initCodeTable() {
        const context = this
        let editMinQtyPerPackBtn
        let saveMinQtyPerPackBtn
        let minQtyPerPackInput
        let minQtyPerPackSpan
        let minQtyPerPackErrorMsgEl
        let cancelEditMinQtyPerPackBtn
        let divideIntoMinQtyPerPackBtn
        let divideIntoOnePackBtn
        let divideByScheduledBtn
        let createPackBtn
        let resetPackBtn
        let deletePackBtn
        let printCodeBtn
        const saveCode = function () {
          const tr = this.closest('tr')
          const $tr = $(tr)
          const rowData = context.createCodeReportTable.getData(tr)
          const quantity = +tr.querySelector('[name=thing_pcs]').value
          const unit = tr.querySelector('[name=thing_unit]').value
          const position_id = tr.querySelector('[name=position_id]').value
          const position = context.preCon.positionStructure.getPositionIdPath(
            position_id
          )
          const isErrorMsgVisible = !!$tr.find('td:eq(2) .note-error').length
          if (isNaN(quantity)) {
            if (!isErrorMsgVisible) {
              $tr
                .find('td:eq(2)')
                .append(
                  `<code class="note-error">${i18n(
                    'Positive_Integer_Alert'
                  )}</code>`
                )
            }
          } else {
            if (isErrorMsgVisible) {
              $tr.find('td:eq(2) .note-error').remove()
            }
            context.createCodeReportTable.table
              .row(tr)
              .data(
                Object.assign({}, rowData, {
                  isEdit: false,
                  isNew: false,
                  thing_pcs: quantity,
                  thing_unit: unit,
                  position_id,
                  position,
                })
              )
              .draw(false)
            context.createCodeReportTable.toggleCodeTableFunc(true)
          }
        }
        const editCode = function () {
          const tr = this.closest('tr')
          const rowData = context.createCodeReportTable.getData(tr)
          context.createCodeReportTable.table
            .row(tr)
            .data(
              Object.assign({}, rowData, {
                isEdit: true,
              })
            )
            .draw(false)
          context.createCodeReportTable.toggleCodeTableFunc(false)
          $(tr).find('input, button, select').prop('disabled', false)
          $(tr).find('input[name=thing_unit]').prop('disabled', true)
        }
        const cancelEdit = function () {
          const tr = this.closest('tr')
          const rowData = context.createCodeReportTable.getData(tr)
          const { isNew } = rowData
          if (isNew) {
            context.createCodeReportTable.table.row(tr).remove().draw(false)
          } else {
            context.createCodeReportTable.table
              .row(tr)
              .data(
                Object.assign({}, rowData, {
                  isEdit: false,
                })
              )
              .draw(false)
          }
          context.createCodeReportTable.toggleCodeTableFunc(true)
        }
        const keydownHandler = function (e) {
          if (e.which === 13) {
            $(this).closest('tr').find('.confirm').trigger('click') // 觸發新增
            return false // 擋住預設行為
          }
        }
        const toggleElements = (
          elArr = [
            minQtyPerPackSpan,
            editMinQtyPerPackBtn,
            minQtyPerPackInput,
            saveMinQtyPerPackBtn,
            cancelEditMinQtyPerPackBtn,
          ]
        ) => {
          elArr.forEach((el) => {
            el.classList.toggle('hide', !el.classList.contains('hide'))
          })
        }
        // 切換最小包裝數(顯示編輯模式)
        const editMinQtyPerPack = function () {
          minQtyPerPackInput.value = minQtyPerPackSpan.textContent
          toggleElements()
        }
        // 取消修改最小包裝數
        const cancelEditMinQtyPerPack = function () {
          minQtyPerPackErrorMsgEl.textContent = ''
          toggleElements()
        }
        // 確認修改最小包裝數
        const saveMinQtyPerPack = function () {
          if (isNaN(minQtyPerPackInput.value)) {
            minQtyPerPackErrorMsgEl.textContent = i18n('Positive_Integer_Alert')
          } else {
            context.confirmMinLoadingBtn.doing()
            context.min = Number(minQtyPerPackInput.value)
            minQtyPerPackErrorMsgEl.textContent = ''
            minQtyPerPackSpan.textContent = context.min
            toggleElements()
            context.confirmMinLoadingBtn.done()
          }
        }
        // 以最小包裝量拆批
        const divideIntoMinQtyPerPack = function () {
          const codeList = []
          let scheduleData
          let newRowData
          let code_no
          if (context.min) {
            const remainder = window.Decimal.mod(
              context.quantity,
              context.min
            ).toNumber()
            const dataCount = window.Decimal.div(context.quantity, context.min)
              .floor()
              .toNumber()
            for (let i = 1; i <= dataCount; i++) {
              code_no = i
              scheduleData =
                context.scheduleThingData.unbatched[code_no - 1] || {}
              newRowData = Object.assign(
                {
                  code_no,
                  thing_pcs: context.min,
                  thing_unit: context.unit || '',
                  position_id: scheduleData.schedule_position_id || null,
                  position: scheduleData.schedule_position || null,
                },
                _.pick(scheduleData, [
                  'schedule_position',
                  'schedule_position_id',
                  'stock_time_range',
                  'schedule_thing_id',
                ])
              )
              codeList.push(newRowData)
            }
            if (remainder) {
              code_no = dataCount + 1
              scheduleData =
                context.scheduleThingData.unbatched[code_no - 1] || {}
              newRowData = Object.assign(
                {
                  code_no,
                  thing_pcs: remainder,
                  thing_unit: context.unit || '',
                  position_id: scheduleData.schedule_position_id || null,
                  position: scheduleData.schedule_position || null,
                },
                _.pick(scheduleData, [
                  'schedule_position',
                  'schedule_position_id',
                  'stock_time_range',
                  'schedule_thing_id',
                ])
              )
              codeList.push(newRowData)
            }
          }
          context.createCodeReportTable.drawTable(codeList)
          context.toggleCodeTableFunc(true)
        }
        // 以預排結果拆批
        const divideBySchedule = function () {
          let schedule_position
          let schedule_position_id
          let quantityLeft
          let thing_pcs
          let stock_time_range

          context.scheduleThingData.unbatched.reduce((a, map, i) => {
            if (quantityLeft > 0) {
              ;({
                schedule_position_id,
                schedule_position,
                stock_time_range,
              } = map)
              thing_pcs =
                quantityLeft >= map.schedule_thing_pcs
                  ? map.schedule_thing_pcs
                  : quantityLeft
              quantityLeft -= thing_pcs
              a.push({
                code_no: i + 1,
                thing_pcs,
                thing_unit: map.schedule_thing_unit || context.unit || '',
                stock_time_range,
                schedule_position,
                schedule_position_id,
                position: schedule_position,
                position_id: schedule_position_id,
                schedule_thing_id: map.schedule_thing_id,
              })
            }
            return a
          }, [])
          context.createCodeReportTable.drawTable(context.codeList)
        }
        // 整張單拆成一批
        const divideIntoOnePack = function () {
          const code_no = 1
          const scheduleData =
            context.scheduleThingData.unbatched[code_no - 1] || {}
          const newRowData = Object.assign(
            {
              code_no,
              thing_pcs: context.quantity,
              thing_unit: context.unit || '',
              position_id: scheduleData.schedule_position_id || null,
              position: scheduleData.schedule_position || null,
            },
            _.pick(scheduleData, [
              'schedule_position',
              'schedule_position_id',
              'stock_time_range',
              'schedule_thing_id',
            ])
          )
          context.createCodeReportTable.drawTable([newRowData])

          context.toggleCodeTableFunc(true)
        }
        const createPack = function () {
          const origDataCount = context.createCodeReportTable.getData().length // 所有資料有幾筆
          const code_no = origDataCount + 1
          const scheduleData =
            context.scheduleThingData.unbatched[code_no - 1] || {}
          const newRowData = Object.assign(
            {
              code_no,
              isNew: true,
              isEdit: true,
              position_id: scheduleData.schedule_position_id || null,
              position: scheduleData.schedule_position || null,
              thing_unit: context.unit || '',
            },
            _.pick(scheduleData, [
              'schedule_position',
              'schedule_position_id',
              'stock_time_range',
              'schedule_thing_id',
            ])
          )
          const [
            [newRowTableIndex],
          ] = context.createCodeReportTable.table.rows
            .add([newRowData])
            .toArray()
          // 新增行要先清掉過濾條件，不然新行會消失
          context.createCodeReportTable.clearSearch()
          const dataCountPerPage = context.createCodeReportTable.table.page.info()
            .length
          const newRowDisplayIndex = context.createCodeReportTable.table
            .rows()
            .indexes()
            .toArray()
            .findIndex((i) => i === newRowTableIndex)
          const pageIndex = Math.floor(
            (newRowDisplayIndex + 1) / dataCountPerPage
          )
          const newTr = context.createCodeReportTable.table
            .row(newRowTableIndex)
            .node()
          context.createCodeReportTable.table.page(pageIndex).draw(false)
          context.createCodeReportTable.toggleCodeTableFunc(false)
          $(newTr).find('input, button, select').attr('disabled', false)
          $(newTr).find('input[name=thing_unit]').prop('disabled', true)
        }
        const resetPack = function () {
          context.createCodeReportTable.resetTable()
          context.createCodeReportTable.toggleCodeTableFunc(true)
        }
        const deletePack = function () {
          let minus = 0
          const deleteCodeNoSet = new Set(
            _.pluck(context.createCodeReportTable.getSelectedRow(), 'code_no')
          )
          const origDataCount = context.createCodeReportTable.table.data()
            .length
          const tableData = context.createCodeReportTable
            .getData()
            .sort((a, b) => a.code_no - b.code_no)
            .filter(({ code_no }) => !deleteCodeNoSet.has(code_no))
          for (let i = 0; i < origDataCount; i++) {
            if (deleteCodeNoSet.has(i + 1)) {
              minus++
            } else if (tableData[i - minus]) {
              tableData[i - minus].code_no -= minus
            }
          }

          context.createCodeReportTable.drawTable(tableData)
          context.createCodeReportTable.toggleCodeTableFunc(true)
        }

        context.createCodeReportTable = createReportTable({
          $tableElement: $('#create-code-table'),
          $tableWidget: $('#create-code-table-widget'),
          checkbox: true,
          showNoData: false,
          columnDefs: [
            {
              targets: [6],
              orderable: false,
            },
          ],
          customBtns: [
            `<span id="min">${i18n('Packing_Amount')}：<span></span></span>`,
            '<input type="text" id="min-input" class="form-control hide">',
            `<button id="change-min" class="btn btn-primary">${i18n(
              'Change_Min_Packing_Amount'
            )}</button>`,
            `<button id="min-cancel" class="btn btn-default hide">${i18n(
              'Cancel'
            )}</button>`,
            `<button id="min-confirm" class="btn btn-primary hide">${i18n(
              'Confirm'
            )}</button>`,
            '<code id="min-alert" class="note-error"></code>',
            '<br>',
            `<span id="generate-qrcode-msg">${i18n(
              'Generate_Qrcode'
            )}：</span>`,
            `<button id="by-min" class="btn btn-success">${i18n(
              'Generated_With_Min_Packing_Amount'
            )}</button>`,
            `<button id="by-all" class="btn btn-success">${i18n(
              'Generated_A_Whole_Batch'
            )}</button>`,
            `<button id="by-schedule" class="btn btn-success">${i18n(
              '以預排拆批'
            )}</button>`,
            '<br>',
            `<button id="create" class="btn btn-primary">${i18n(
              'Add'
            )}</button>`,
            `<button id="reset" class="btn btn-success">${i18n(
              'Reset'
            )}</button>`,
            `<button id="delete" class="btn btn-danger">${i18n(
              'Delete'
            )}</button>`,
            '<button id="print" class="btn bg-color-blueDark txt-color-white hide"><span class="fa fa-qrcode fa-lg"></span></button>',
          ],
          columns: [
            {
              name: 'code_no',
              data: 'code_no',
            },
            {
              name: 'thing_pcs',
              data: 'thing_pcs',
              render(data, type, rowData) {
                const { isEdit } = rowData
                return isEdit
                  ? `<input type="text" class="form-control" name="thing_pcs" value="${
                      data || ''
                    }">`
                  : data || ''
              },
            },
            {
              name: 'thing_unit',
              data: 'thing_unit',
              render(data, type, rowData) {
                const { isEdit } = rowData
                return isEdit
                  ? `<input type="text" class="form-control" name="thing_unit" disabled value="${
                      data || ''
                    }">`
                  : data || ''
              },
            },
            {
              name: 'stock_time_range',
              data: 'stock_time_range',
              render(data) {
                return data || '無預排資料'
              },
            },
            {
              name: 'schedule_position',
              data: 'schedule_position',
              render(data) {
                return data ? data.toString() : '無預排資料'
              },
            },
            {
              name: 'position',
              data: 'position',
              render(data, type, rowData) {
                const { isEdit, schedule_position } = rowData
                const isIdenticalToSchdedulePostion =
                  data && schedule_position
                    ? data.toString() === schedule_position.toString()
                    : false
                return isEdit
                  ? `<select name="position_id" class="form-control full-width"></select>`
                  : data
                  ? `<span ${
                      !isIdenticalToSchdedulePostion ? 'style="color:red"' : ''
                    }>${data.toString()}</span>`
                  : ''
              },
            },
            {
              name: 'edit',
              data: null,
              render(data, type, rowData) {
                const { isEdit, isSaved } = rowData
                return isEdit
                  ? `<button class="btn btn-primary confirm">${i18n(
                      'Confirm'
                    )}</button>`
                  : `<button class="btn btn-success edit" ${
                      isSaved ? 'disabled' : ''
                    }>${i18n('Edit')}</button>`
              },
            },
          ],
          onRow(tr, rowData) {
            const td = tr.querySelector('td:first-child')
            const cb = td.querySelector('input[type=checkbox]')
            let cancelBtn
            if (rowData.isEdit) {
              cb.classList.add('hide')
              $(td).append(
                '<button class="btn btn-xs btn-danger cancel"><i class="fa fa-times"></i></button>'
              )
              const $positionId = $(tr).find('[name=position_id]')
              servkit.initSelectWithList(
                context.selectablePostionMap,
                $positionId
              )
              if (rowData.position) {
                const position_id = context.preCon.positionStructure.getPositionIdFromIdPath(
                  rowData.position
                )
                $positionId.val(position_id)
              }
            } else {
              cb.classList.remove('hide')
              cancelBtn = td.querySelector('button')
              if (cancelBtn) {
                cancelBtn.remove()
              }
            }
          },
        })
        editMinQtyPerPackBtn = document.getElementById('change-min')
        saveMinQtyPerPackBtn = document.getElementById('min-confirm')
        minQtyPerPackInput = document.getElementById('min-input')
        minQtyPerPackSpan = document.getElementById('min').querySelector('span')
        minQtyPerPackErrorMsgEl = document.getElementById('min-alert')
        cancelEditMinQtyPerPackBtn = document.getElementById('min-cancel')
        divideIntoMinQtyPerPackBtn = document.getElementById('by-min')
        divideIntoOnePackBtn = document.getElementById('by-all')
        divideByScheduledBtn = document.getElementById('by-schedule')
        createPackBtn = document.getElementById('create')
        resetPackBtn = document.getElementById('reset')
        deletePackBtn = document.getElementById('delete')
        printCodeBtn = document.getElementById('print')
        context.createCodeReportTable.toggleCodeTableFunc = function (
          isEnable
        ) {
          $('#create-code-table-widget')
            .find('input, button, select')
            .attr('disabled', !isEnable)
          $('#create-code-table-widget')
            .find('.dt-toolbar-footer > div:last-child')
            .css({
              visibility: isEnable ? 'visible' : 'hidden',
            })

          $('#create-and-print').attr('disabled', !isEnable)
          $('#create-without-print').attr('disabled', !isEnable)
        }
        context.createCodeReportTable.changeRenderMode = function (isReprint) {
          editMinQtyPerPackBtn.classList.toggle('hide', isReprint)
          cancelEditMinQtyPerPackBtn.classList.toggle('hide', true)
          saveMinQtyPerPackBtn.classList.toggle('hide', true)
          divideIntoMinQtyPerPackBtn.classList.toggle('hide', isReprint)
          divideIntoOnePackBtn.classList.toggle('hide', isReprint)
          createPackBtn.classList.toggle('hide', isReprint)
          resetPackBtn.classList.toggle('hide', isReprint)
          deletePackBtn.classList.toggle('hide', isReprint)
          printCodeBtn.classList.toggle('hide', !isReprint)
          divideByScheduledBtn.classList.toggle('hide', isReprint)
          document.getElementById('min').classList.toggle('hide', isReprint)
          document
            .getElementById('generate-qrcode-msg')
            .classList.toggle('hide', isReprint)
          Array.from(
            createPackBtn.parentElement.querySelectorAll('br')
          ).forEach((el) => el.classList.toggle('hide', isReprint))
          $('#create-code-modal .modal-footer').toggleClass('hide', isReprint)
          $('#create-code-table-widget')
            .find('input, select')
            .attr('disabled', false)
          $('#create-code-table-widget')
            .find('.dt-toolbar-footer > div:last-child')
            .css({
              visibility: 'visible',
            })
        }
        context.confirmMinLoadingBtn = servkit.loadingButton(
          saveMinQtyPerPackBtn
        )
        servkit.downloadFile(
          '#print',
          '/api/storage/material/qrcode',
          function () {
            const thingData = []
            // 列印全部
            if (context.autoPrint) {
              thingData.push(..._.pluck(context.codeList, 'thing_id'))
            } else {
              context.createCodeReportTable
                .getSelectedRow()
                .forEach(({ thing_id }) => {
                  thingData.push(thing_id)
                })
            }
            return {
              'thing_id[]': thingData,
            }
          },
          'GET'
        )
        $('#create-code-table')
          .on('click', '.confirm', saveCode)
          .on('click', '.edit', editCode)
          .on('click', '.cancel', cancelEdit)
          .on('keydown', '.quantity, .unit', keydownHandler)
        $(editMinQtyPerPackBtn).on('click', editMinQtyPerPack)
        $(cancelEditMinQtyPerPackBtn).on('click', cancelEditMinQtyPerPack)
        $(saveMinQtyPerPackBtn).on('click', saveMinQtyPerPack)
        $(divideIntoMinQtyPerPackBtn).on('click', divideIntoMinQtyPerPack)
        $(divideIntoOnePackBtn).on('click', divideIntoOnePack)
        $(divideByScheduledBtn).on('click', divideBySchedule)
        $(createPackBtn).on('click', createPack)
        $(resetPackBtn).on('click', resetPack)
        $(deletePackBtn).on('click', deletePack)
      },
      getSelectablePostionMap(material_id) {
        const context = this
        const { materialPositionCache } = context
        if (materialPositionCache[material_id]) {
          return Promise.resolve(materialPositionCache[material_id])
        } else {
          return new Promise((res) =>
            servkit.ajax(
              {
                url: 'api/getdata/db',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                  table: 'a_comoss_material_position',
                  whereClause: 'material_id = ? AND status = 1',
                  whereParams: [material_id],
                }),
              },
              {
                success(response) {
                  res(
                    (materialPositionCache[material_id] = response.reduce(
                      (a, x) => {
                        const { store_id, grid_index, cell_index } = x
                        const position_id = context.preCon.positionStructure.getPositionIdFromDb(
                          store_id,
                          grid_index,
                          cell_index
                        )
                        const position = context.preCon.positionStructure.getPositionIdPath(
                          position_id
                        )
                        a[position_id] = position.toString()
                        return a
                      },
                      {}
                    ))
                  )
                },
              }
            )
          )
        }
      },
      showCreateCodeModal(btn, isReprint) {
        const context = this
        const tr = btn.closest('tr')
        const rowData = context.detailReportTable.getObjectData(tr)
        const $createCodeModal = $('#create-code-modal')
        context.unit = rowData.unit
        context.billInfoTable.draw(rowData)
        context.createCodeReportTable.resetTable()

        return Promise.all([
          context.getMatStoreRecord(rowData.material_id),
          isReprint
            ? Promise.resolve()
            : context.getSelectablePostionMap(rowData.material_id),
        ]).then(([matStoreRecord, selectablePostionMap]) => {
          context.matStoreRecordTable.drawTable(
            context.groupMatStoreRecord(matStoreRecord)
          )
          context.selectablePostionMap = selectablePostionMap
          if (!isReprint && _.isEmpty(selectablePostionMap)) {
            const appInfo =
              servkit.appMap.StrongLEDStorageManagement[
                '31_storage_location_setting'
              ]
            $.smallBox({
              sound: false,
              title: i18n('This_Material_Is_Placed_No_Storage_Spaces'),
              content: `${i18n('Go_To')} "${appInfo.app_name}" > "${
                appInfo.func_name
              }" ${i18n('Set_Up')}`,
              color: servkit.colors.red,
              iconSmall: 'fa fa-times',
              timeout: 4000,
            })
          }
          $createCodeModal.data({
            tr,
            rowData,
          })
          context.quantity = +rowData.quantity
          $('#min>span').text(context.min)
          context.createCodeReportTable.toggleCodeTableFunc(true)
          context.createCodeReportTable.drawTable(context.codeList)
          context.createCodeReportTable.changeRenderMode(isReprint)
          $createCodeModal.modal('show')
        })
      },
      toggleCodeTableFunc(isEnable) {
        $('#create-code-table-widget')
          .find('input, button, select')
          .attr('disabled', !isEnable)
        $('#create-code-table-widget')
          .find('.dt-toolbar-footer > div:last-child')
          .css({
            visibility: isEnable ? 'visible' : 'hidden',
          })
      },
      saveThingData(loadingBtnName, cb) {
        const context = this
        const tableData = context.createCodeReportTable.getData()
        const isValid = context.validateThingData(tableData)
        const { rowData: billData } = $('#create-code-modal').data()
        let requestParam

        if (!isValid) {
          return
        }

        context[loadingBtnName].doing()
        requestParam = {
          bill_no: billData.bill_no.toString(),
          bill_detail: billData.bill_detail.toString(),
          material_id: billData.material_id.toString(),
          material_sub: billData.material_sub.toString(),
          column1: billData.bill_column_1.toString(),
          remark: billData.remark.toString(),
          delivery_date: billData.delivery_date.toString(),
          groups: tableData.map((val) => ({
            code_no: val.code_no.toString(),
            thing_pcs: val.thing_pcs.toString(),
            thing_unit: val.thing_unit || '',
            position_id: val.position_id,
            schedule_thing_id: val.schedule_thing_id,
          })),
        }

        return new Promise((res) =>
          servkit.ajax(
            {
              url: 'api/comoss/material',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify(requestParam),
            },
            {
              success(reponse) {
                context.codeList = tableData
                context.codeList.forEach((data) => {
                  const responseData = reponse.find(
                    (d) => d.code_no.toString() === data.code_no.toString()
                  )
                  if (responseData) {
                    data.thing_id = responseData.thing_id
                  }
                })
                res()
              },
            }
          )
        ).then(() => {
          if (cb) {
            cb()
          } else {
            $('#create-code-modal').modal('hide')
          }
        })
      },
      validateThingData(tableData) {
        const context = this
        let totalQty = 0
        let hasEmptyPosition = false

        tableData.forEach(({ thing_pcs, position_id }) => {
          totalQty = window.Decimal.add(totalQty, +thing_pcs).toNumber()
          if (!position_id) {
            hasEmptyPosition = true
          }
        })
        $('#create-code-table-widget').find('.note-error').remove()
        if (totalQty !== context.quantity || hasEmptyPosition) {
          $('#create-code-table-widget').append(
            `<code class="note-error">${
              hasEmptyPosition
                ? i18n('Need_To_Specify_The_Storage_Spaces')
                : i18n('Total_Not_Equal_quantity')
            }</code>`
          )
          return false
        } else {
          return true
        }
      },
    },
    preCondition: {
      storePosition(done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_storage_store_position',
              columns: [
                'position_id',
                'position_name',
                'store_id',
                'store_grid_index',
                'store_cell_index',
              ],
              // whereClause: 'GROUP BY material_type'
            }),
          },
          {
            success(data) {
              done(data)
            },
          }
        )
      },
      positionStructure(done) {
        getPositionStructure().then((instance) => done(instance))
      },
    },
    dependencies: [
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
        '/js/plugin/datatables/plugin/sort.number.cust.js',
      ],
      ['/js/plugin/decimal/decimal.min.js'],
    ],
  })
}
