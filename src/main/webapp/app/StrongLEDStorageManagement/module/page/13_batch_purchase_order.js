import { InfoTable } from '../infoTable.js'
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
      confirmMinLoadingBtn: null,
      $queryForm: $('#query-form'),
      $queryBtn: $('#query-btn'),
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      queryLoadingBtn: servkit.loadingButton(
        document.getElementById('query-btn')
      ),
      main() {
        const context = this
        context.initDetailReportTable()
        context.initBatchModal()
        context.syncErp.updateLastSyncTime()
        context.initQueryForm()
        context.drawPoData()
      },
      queryBill(isUseCached) {
        const context = this
        let status = isUseCached
          ? context.queryParam.status
          : context.$queryForm.find('[name=status]:checked').val()
        let startDate = isUseCached
          ? context.queryParam.startDate
          : context.$startDate.val().replace(/\//g, '')
        let endDate = isUseCached
          ? context.queryParam.endDate
          : context.$endDate.val().replace(/\//g, '')

        if (isUseCached) {
          context.$queryForm
            .find(`[name=status][value=${status}]`)
            .prop('checked', true)
          context.$startDate.val(startDate.toFormatedDate('YYYYMMDD'))
          context.$endDate.val(endDate.toFormatedDate('YYYYMMDD'))
        } else {
          context.queryParam = {
            status,
            startDate,
            endDate,
          }
        }

        return new Promise((res) =>
          servkit.ajax(
            {
              url: 'api/getdata/db',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                table: 'a_comoss_purchase_order',
                whereClause: `status = ${status} AND order_date BETWEEN '${startDate}' AND '${endDate}'`,
              }),
            },
            {
              success(data) {
                res(data)
              },
            }
          )
        )
      },
      drawPoData(evt, isUseCached) {
        const context = this
        if (evt) {
          evt.preventDefault()
        }
        context.queryLoadingBtn.doing()
        context.detailReportTable.clearTable()
        return context.queryBill(isUseCached).then((data) => {
          context.detailReportTable.drawTable(data)
          context.queryLoadingBtn.done()
        })
      },
      initQueryForm() {
        const context = this
        const { $queryBtn, $queryForm, $startDate, $endDate } = context

        servkit.initDatePicker($startDate, $endDate)
        servkit.validateForm($queryForm, $queryBtn)
        $queryBtn.on('click', context.drawPoData.bind(context))
      },
      initDetailReportTable() {
        const context = this
        context.detailReportTable = createReportTable({
          $tableElement: $('#detail-table'),
          $tableWidget: $('#detail-table-widget'),
          columnDefs: [
            {
              targets: [8],
              orderable: false,
            },
          ],
          customBtns: [
            `<button id="synchronize" class="btn btn-primary">${i18n(
              'Update_Purchase_Order'
            )}</button>`,
          ],
          columns: [
            {
              name: 'pur_order_type',
              data: 'pur_order_type',
            },
            {
              name: 'pur_id',
              data: 'pur_id',
            },
            {
              name: 'serial_num',
              data: 'serial_num',
            },
            {
              name: 'material_id',
              data: 'material_id',
            },
            {
              name: 'material_name',
              data: 'material_name',
            },
            {
              name: 'spec',
              data: 'spec',
            },
            {
              name: 'quantity',
              data: 'qunatity',
            },
            {
              name: 'unit',
              data: 'unit',
            },
            {
              name: 'batch',
              data: null,
              render(data, type, rowData) {
                const { status } = rowData
                const isBatched = status === 1
                if (isBatched) {
                  return `<button class="btn btn-success show-batch-btn">${i18n(
                    'Show'
                  )}</button>`
                } else {
                  return `<button class="btn btn-primary batch-btn">${i18n(
                    'Split_Batches'
                  )}</button>`
                }
              },
            },
          ],
        })

        $('#detail-table')
          .on('click', '.batch-btn', function () {
            context.showBatchModal(this, false)
          })
          .on('click', '.show-batch-btn', function () {
            context.showBatchModal(this, true)
          })
        context.syncErp = new SyncErp({
          btn: document.getElementById('synchronize'),
          syncBy: 'purchaseOrderSync',
          syncApiUrl: 'api/comoss/erpsyn/purchase-order',
          syncErpCallBack: context.drawPoData.bind(context, null, true),
        })
      },
      initBatchModal() {
        const context = this
        context.initInfoTable()
        context.initCodeTable()
        $('#save-batch-btn').on('click', function () {
          context
            .saveBatch()
            .then(() => $('#batch-modal').modal('hide'))
            .catch(() => {})
        })
      },
      initInfoTable() {
        const context = this
        const columns = [
          {
            title: i18n('Do_Not_Purchase_Orders'),
            name: 'pur_order_type',
          },
          {
            title: i18n('Purchase_Order_No'),
            name: 'pur_id',
          },
          {
            title: i18n('Purchase_Order_Number'),
            name: 'serial_num',
          },
          {
            title: i18n('Name'),
            name: 'material_id',
          },
          {
            title: i18n('Quantity'),
            name: 'qunatity',
          },
        ]
        context.billInfoTable = new InfoTable(
          document.getElementById('purchase-order-info-table'),
          4,
          columns
        )
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
        let createPackBtn
        let resetPackBtn
        let deletePackBtn
        const saveCode = function () {
          const tr = this.closest('tr')
          const $tr = $(tr)
          const rowData = context.batchTable.getData(tr)
          const quantity = +tr.querySelector('[name=thing_pcs]').value
          const unit = +tr.querySelector('[name=thing_unit]').value
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
            context.batchTable.table
              .row(tr)
              .data(
                Object.assign({}, rowData, {
                  isEdit: false,
                  isNew: false,
                  thing_pcs: quantity,
                  thing_unit: unit,
                })
              )
              .draw(false)

            context.batchTable.toggleCodeTableFunc(true)
          }
        }
        const editCode = function () {
          const tr = this.closest('tr')
          const rowData = context.batchTable.getData(tr)
          context.batchTable.clearSearch(tr)
          context.batchTable.table
            .row(tr)
            .data(
              Object.assign({}, rowData, {
                isEdit: true,
              })
            )
            .draw(false)
          context.batchTable.toggleCodeTableFunc(false)
          $(tr).find('input, button').attr('disabled', false)
        }
        const cancelEdit = function () {
          const tr = this.closest('tr')
          const rowData = context.batchTable.getData(tr)
          const { isNew } = rowData
          if (isNew) {
            context.batchTable.table.row(tr).remove().draw(false)
          } else {
            context.batchTable.table
              .row(tr)
              .data(
                Object.assign({}, rowData, {
                  isEdit: false,
                })
              )
              .draw(false)
          }
          context.batchTable.toggleCodeTableFunc(true)
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
          if (context.min) {
            const remainder = window.Decimal.mod(
              context.quantity,
              context.min
            ).toNumber()
            const dataCount = window.Decimal.div(context.quantity, context.min)
              .floor()
              .toNumber()
            for (let i = 1; i <= dataCount; i++) {
              codeList.push({
                code_no: i,
                thing_pcs: context.min,
                thing_unit: context.unit || '',
              })
            }
            if (remainder) {
              codeList.push({
                code_no: dataCount + 1,
                thing_pcs: remainder,
                thing_unit: context.unit || '',
              })
            }
          }
          context.batchTable.drawTable(codeList)
          context.toggleCodeTableFunc(true)
        }
        // 整張單拆成一批
        const divideIntoOnePack = function () {
          context.batchTable.drawTable([
            {
              code_no: 1,
              thing_pcs: context.quantity,
              thing_unit: context.unit || '',
            },
          ])

          context.toggleCodeTableFunc(true)
        }
        // 新增
        const createPack = function () {
          const origDataCount = context.batchTable.getData().length // 所有資料有幾筆
          const [[newRowTableIndex]] = context.batchTable.table.rows
            .add([
              {
                code_no: origDataCount + 1,
                isNew: true,
                isEdit: true,
                thing_unit: context.unit || '',
              },
            ])
            .toArray()
          const newTr = context.batchTable.table.row(newRowTableIndex).node()

          // 新增行要先清掉過濾條件，不然新行會消失
          context.batchTable.clearSearch(newRowTableIndex)
          context.batchTable.table.draw()
          context.batchTable.toPage(newRowTableIndex)
          context.batchTable.toggleCodeTableFunc(false)
          $(newTr).find('input, button').attr('disabled', false)
        }
        // 重置表格
        const resetPack = function () {
          context.batchTable.resetTable()
          context.batchTable.toggleCodeTableFunc(true)
        }
        // 刪除
        const deletePack = function () {
          let minus = 0
          const deleteCodeNoSet = new Set(
            _.pluck(context.batchTable.getSelectedRow(), 'code_no')
          )
          const origDataCount = context.batchTable.table.data().length
          const tableData = context.batchTable
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
          context.batchTable.drawTable(tableData)
          context.batchTable.toggleCodeTableFunc(true)
        }

        context.batchTable = createReportTable({
          $tableElement: $('#batch-table'),
          $tableWidget: $('#batch-table-widget'),
          checkbox: true,
          showNoData: false,
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
          columnDefs: [
            {
              targets: [3],
              orderable: false,
            },
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
                  ? `<input type="text" class="form-control" name="thing_unit" value="${
                      data || ''
                    }">`
                  : data || ''
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
              if (!td.querySelector('button')) {
                $(td).append(
                  '<button class="btn btn-xs btn-danger cancel"><i class="fa fa-times"></i></button>'
                )
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
        createPackBtn = document.getElementById('create')
        resetPackBtn = document.getElementById('reset')
        deletePackBtn = document.getElementById('delete')
        context.batchTable.toggleCodeTableFunc = function (isEnable) {
          $('#batch-table-widget')
            .find('input, button, select')
            .attr('disabled', !isEnable)
          $('#batch-table-widget')
            .find('.dt-toolbar-footer > div:last-child')
            .css({
              visibility: isEnable ? 'visible' : 'hidden',
            })

          $('#create-and-print').attr('disabled', !isEnable)
          $('#create-without-print').attr('disabled', !isEnable)
        }
        context.batchTable.changeRenderMode = function (isShowBatched) {
          editMinQtyPerPackBtn.classList.toggle('hide', isShowBatched)
          cancelEditMinQtyPerPackBtn.classList.toggle('hide', true)
          saveMinQtyPerPackBtn.classList.toggle('hide', true)
          divideIntoMinQtyPerPackBtn.classList.toggle('hide', isShowBatched)
          divideIntoOnePackBtn.classList.toggle('hide', isShowBatched)
          createPackBtn.classList.toggle('hide', isShowBatched)
          resetPackBtn.classList.toggle('hide', isShowBatched)
          deletePackBtn.classList.toggle('hide', isShowBatched)
          document.getElementById('min').classList.toggle('hide', isShowBatched)
          document
            .getElementById('generate-qrcode-msg')
            .classList.toggle('hide', isShowBatched)
          Array.from(
            createPackBtn.parentElement.querySelectorAll('br')
          ).forEach((el) => el.classList.toggle('hide', isShowBatched))
          $('#batch-modal .modal-footer').toggleClass('hide', isShowBatched)
          $('#batch-table-widget').find('input, select').attr('disabled', false)
          $('#batch-table-widget')
            .find('.dt-toolbar-footer > div:last-child')
            .css({
              visibility: 'visible',
            })
        }
        context.confirmMinLoadingBtn = servkit.loadingButton(
          saveMinQtyPerPackBtn
        )
        $('#batch-table')
          .on('click', '.confirm', saveCode)
          .on('click', '.edit', editCode)
          .on('click', '.cancel', cancelEdit)
          .on('keydown', '.quantity, .unit', keydownHandler)
        $(editMinQtyPerPackBtn).on('click', editMinQtyPerPack)
        $(cancelEditMinQtyPerPackBtn).on('click', cancelEditMinQtyPerPack)
        $(saveMinQtyPerPackBtn).on('click', saveMinQtyPerPack)
        $(divideIntoMinQtyPerPackBtn).on('click', divideIntoMinQtyPerPack)
        $(divideIntoOnePackBtn).on('click', divideIntoOnePack)
        $(createPackBtn).on('click', createPack)
        $(resetPackBtn).on('click', resetPack)
        $(deletePackBtn).on('click', deletePack)
      },
      showBatchModal(btn, isShowBatched) {
        const context = this
        const tr = btn.closest('tr')
        const rowData = context.detailReportTable.getData(tr)
        const $batchModal = $('#batch-modal')
        context.billInfoTable.draw(rowData)
        context.batchTable.resetTable()
        context.quantity = +rowData.qunatity
        context.unit = rowData.unit
        $('#min>span').text(context.min)
        context.batchTable.toggleCodeTableFunc(true)
        context.batchTable.clearTable()
        $('#quantity-alert').remove()
        $batchModal.data({
          tr,
          rowData,
        })
        context.batchTable.changeRenderMode(isShowBatched)
        new Promise((res) => {
          if (isShowBatched) {
            const { pur_id, pur_order_type, serial_num } = rowData

            servkit.ajax(
              {
                url: 'api/getdata/db',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                  table: 'a_comoss_view_purchase_order_schedule',
                  whereClause: `pur_id = ${pur_id} AND pur_order_type = ${pur_order_type} AND serial_num = ${serial_num}`,
                }),
              },
              {
                success(data) {
                  res(data)
                },
              }
            )
          } else {
            res()
          }
        }).then((data) => {
          if (data) {
            context.batchTable.drawTable(
              data.map((map) =>
                Object.assign(map, {
                  isSaved: true,
                  thing_unit: map.thing_unit || context.unit || '',
                })
              )
            )
          }
          $batchModal.modal('show')
        })
      },
      toggleCodeTableFunc(isEnable) {
        $('#batch-table-widget')
          .find('input, button, select')
          .attr('disabled', !isEnable)
        $('#batch-table-widget')
          .find('.dt-toolbar-footer > div:last-child')
          .css({
            visibility: isEnable ? 'visible' : 'hidden',
          })
      },
      saveBatch() {
        const context = this
        const tableData = context.batchTable.getData()
        let total = 0
        tableData.forEach(({ thing_pcs }) => {
          total = window.Decimal.add(total, +thing_pcs).toNumber()
        })
        if (total !== context.quantity) {
          if (!$('#quantity-alert').length)
            $('#batch-table-widget').append(
              `<code id="quantity-alert" class="note-error">${i18n(
                'Total_Not_Equal_quantity'
              )}</code>`
            )
          return Promise.reject()
        } else {
          if ($('#quantity-alert').length) $('#quantity-alert').remove()
          const { rowData, tr } = $('#batch-modal').data()
          var sendData = {
            pur_order_type: rowData.pur_order_type.toString(),
            pur_id: rowData.pur_id.toString(),
            serial_num: rowData.serial_num.toString(),
            material_id: rowData.material_id.toString(),
            groups: [],
          }
          _.each(tableData, (val) =>
            sendData.groups.push({
              code_no: val.code_no.toString(),
              thing_pcs: val.thing_pcs.toString(),
              thing_unit: val.thing_unit || '',
            })
          )
          return new Promise((res) =>
            servkit.ajax(
              {
                url: 'api/comoss/schedule/material',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(sendData),
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
                  context.detailReportTable.table.row(tr).remove().draw(false)
                  res()
                },
              }
            )
          )
        }
      },
    },
    preCondition: {},
    dependencies: [
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
      ['/js/plugin/decimal/decimal.min.js'],
    ],
  })
}
