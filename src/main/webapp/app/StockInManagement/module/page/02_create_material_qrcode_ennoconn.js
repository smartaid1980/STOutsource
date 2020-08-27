import { InfoTable } from '../../../StrongLEDStorageManagement/module/infoTable.js'
import { select2AllowClearHelper } from '../../../../js/servtech/module/feature/customizeLibSetting.js'
import { ajax } from '../../../../js/servtech/module/servkit/ajax.js'
import {
  loadingButton,
  downloadFile,
  initSelectWithList,
  initDatePicker,
  validateForm,
} from '../../../../js/servtech/module/servkit/form.js'
import { colors } from '../../../../js/servtech/module/servkit/var.js'
import fetchCodePrefixMap from '../../../Management/module/fetchCodePrefixMap.js'
import { initPrintQrcodeBtn } from '../../../../js/servtech/module/servkit/printQrcode.js'

export default async function () {
  const codePrefixMap = await fetchCodePrefixMap()

  GoGoAppFun({
    gogo(context) {
      window.c = context
      context.main()
    },
    util: {
      codeType: 'bill_stock_in_no_and_detail',
      codePrefixMap,
      codeList: [],
      disable: true,
      create: true,
      queryLoadingBtn: loadingButton(document.querySelector('#query-btn')),
      syncLoadingBtn: null,
      detailTable: null,
      billInfoTable: null,
      createCodeReportTable: null,
      $detailTable: $('#detail-table'),
      $detailTableWidget: $('#detail-table-widget'),
      $editBillModal: $('#edit-bill-modal-widget'),
      $editBillForm: $('#edit-bill-form'),
      $updateBillBtn: $('#update-bill-btn'),
      $createCodeModal: $('#create-code-modal'),
      main() {
        const context = this
        context.initDetailRenderTable()
        context.initCreateCodeModal()
        context.initEditBillModal()
        context.updateSyncTime()
        context.initQueryForm()
      },
      initQueryForm() {
        const context = this
        validateForm($('#query-form'), $('#query-btn'))
        $('#query-btn').on('click', context.queryBill.bind(context))
      },
      queryBill(evt) {
        const context = this
        let whereClause = ''
        const status = $('#query-form').find('[name=status]:checked').val()
        const ware_id = $('#show-warehouse').val()
        const bill_no = $('#storage_number').val()
        const material_id = $('#material_id').val()
        const start_date = $('#startDate').val()
        const end_date = $('#endDate').val()

        if (evt) {
          evt.preventDefault()
        }

        context.queryLoadingBtn.doing()

        switch (status) {
          case '3': // 已入庫完成
            whereClause += `is_all_stock_in = 1`
            break
          case '2': // 已入庫一件以上，但未完成
            whereClause += `is_any_stock_in = 1 AND is_all_stock_in = 0`
            break
          case '1': // 已產生條碼，未入庫
            whereClause += `is_create_pkg_id = 1 AND is_any_stock_in = 0`
            break
          case '0': // 未產生條碼
          default:
            whereClause += `is_create_pkg_id = 0 AND is_any_stock_in = 0 AND is_all_stock_in = 0`
            break
        }

        if (ware_id) {
          whereClause += ` AND ware_id = '${ware_id}'`
        }
        if (bill_no) {
          whereClause += ` AND bill_no = '${bill_no}'`
        }
        if (material_id) {
          whereClause += ` AND material_id = '${material_id}'`
        }

        if (start_date && end_date) {
          whereClause += ` AND bill_date BETWEEN '${start_date}' AND '${end_date}'`
        } else if (start_date) {
          whereClause += ` AND bill_date >= '${start_date}'`
        } else if (end_date) {
          whereClause += ` AND bill_date <= '${end_date}'`
        }

        ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_storage_view_bill_stock_in_with_status',
              whereClause,
            }),
          },
          {
            success(data) {
              context.drawDetailTable(data)
              context.queryLoadingBtn.done()
            },
          }
        )
      },
      initEditBillModal() {
        const context = this
        const { $editBillForm, $editBillModal, $updateBillBtn } = context
        const $expDate = $editBillForm.find('[name=exp_date]')
        const $DateCode = $editBillForm.find('[name=delivery_date]')
        const updateBill = function () {
          const $updateBillBtn = $(this)
          const { tr, rowData } = $updateBillBtn.data()
          const updateData = Object.fromEntries(
            $editBillForm
              .find('[name]')
              .toArray()
              .map((el) => [el.name, el.value])
          )

          updateData.delivery_date = updateData.delivery_date.replace(/\//g, '')
          updateData.unit_qty = Number(updateData.unit_qty)
          updateData.material_sub =
            rowData.material_sub === '---' ? '' : rowData.material_sub
          // TODO: validation
          // stdcrud PUT
          // update detail table
          // update material_thing table exp_date
          // hide modal

          ajax(
            {
              url: 'api/ennoconn/bill-stock/in-and-material-thing',
              type: 'PUT',
              contentType: 'application/json',
              data: JSON.stringify(updateData),
            },
            {
              success(response) {
                const updateRowData = [...context.detailTable.getData(tr)]
                updateRowData[7] = updateData.unit_qty
                updateRowData[8] = updateData.delivery_date
                updateRowData[9] = updateData.vender_lot
                updateRowData[10] = updateData.exp_date
                updateRowData[14] = updateData.vender_pn
                context.detailTable.table.row(tr).data(updateRowData).draw()
                $editBillModal.modal('hide')
              },
            }
          )
        }
        initDatePicker($DateCode)
        initDatePicker($expDate)
        $DateCode.val('')
        $expDate.val('')
        $updateBillBtn.on('click', updateBill)
      },
      initDetailRenderTable() {
        const context = this
        const { $editBillForm, $updateBillBtn, $editBillModal } = context
        const createCode = (btn) => {
          context.codeList.length = 0
          context.showCreateCodeModal(btn, true)
        }
        const reprintCode = (btn) => {
          const rowData = context.detailTable.getObjectData(btn.closest('tr'))
          const { material_id, bill_no, bill_detail, material_sub } = rowData

          ajax(
            {
              url: 'api/getdata/db',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                table:
                  'a_strongled_view_material_thing_left_join_bill_stock_in',
                columns: ['thing_id', 'thing_pcs'],
                whereClause: `material_id='${material_id}' and bill_no='${bill_no}' and bill_detail='${bill_detail}' and material_sub='${
                  material_sub === '---' ? '' : material_sub
                }'`,
              }),
            },
            {
              success(data) {
                context.codeList.length = 0
                data.forEach(({ thing_id, thing_pcs }) =>
                  context.codeList.push([thing_id, thing_pcs])
                )
                context.showCreateCodeModal(btn, false)
              },
            }
          )
        }
        const showEditModal = (btn) => {
          const tr = btn.closest('tr')
          const rowData = context.detailTable.getObjectData(tr)

          const date = rowData.delivery_date.split('')
          date[4] = '/' + date[4]
          date[6] = '/' + date[6]
          rowData.delivery_date = date.join('')
          let name
          const prefix = codePrefixMap[context.codeType]
          const barCode = `${rowData.bill_no}/${String(rowData.bill_detail)}`
          const barCodeWithPrefix = `${prefix}@@${barCode}`
          $('#BarCode').JsBarcode(barCodeWithPrefix, {
            text: barCode,
          })
          $editBillForm.find('[name]').each((i, el) => {
            ;({ name } = el)
            if (rowData[name]) {
              el.value = rowData[name] === '---' ? '' : rowData[name]
            }
          })
          $updateBillBtn.data({
            tr,
            rowData,
          })

          $editBillModal.modal('show')
        }
        context.detailTable = createReportTable({
          $tableElement: context.$detailTable,
          $tableWidget: context.$detailTableWidget,
          order: [[1, 'asc']],
          hideCols: [14, 15, 16, 17],
          columnDefinitions: [
            {
              name: 'bill_no',
              data: 'bill_no',
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
              name: 'remark',
              data: 'remark',
            },
            {
              name: 'ware_id',
              data: 'ware_id',
            },
            {
              name: 'vender_name',
              data: 'vender_name',
            },
            {
              name: 'quantity',
              data: 'quantity',
            },
            {
              name: 'unit_qty',
              data: 'unit_qty',
            },
            {
              name: 'delivery_date',
              data: 'delivery_date',
            },
            {
              name: 'vender_lot',
              data: 'vender_lot',
            },
            {
              name: 'exp_date',
              data: 'exp_date',
            },
            {
              name: 'status',
              data: 'status',
            },
            {
              name: 'edit',
              data: 'edit',
            },
            {
              name: 'btn',
              data: 'btn',
            },
            {
              name: 'vender_pn',
              data: 'vender_pn',
            },
            {
              name: 'bill_detail',
              data: 'bill_detail',
            },
            {
              name: 'unit',
              data: 'unit',
            },
            {
              name: 'material_sub',
              data: 'material_sub',
            },
          ],
        })

        context.$detailTable
          .on('click', '.create-code', function () {
            // 叫出建立條碼modal
            createCode(this)
          })
          .on('click', '.reprint', function () {
            // 叫出列印條碼modal
            reprintCode(this)
          })
          .on('click', '.edit-bill-btn', function () {
            // 叫出編輯進貨單modal
            showEditModal(this)
          })
      },
      drawDetailTable(data) {
        var context = this
        context.detailTable.drawTable(
          data.map((val) => {
            let btn = '---'
            const canEdit = val.is_any_stock_in === 0 && val.status !== 99
            let status

            // 狀態判定
            if (val.is_create_pkg_id === 0) {
              btn = `<button class="btn btn-success create-code">${i18n(
                'Generate_Qrcode'
              )}</buttton>`
            } else if (val.is_create_pkg_id === 1) {
              btn = `<button class="btn btn-primary reprint">${i18n(
                'Reprint_Qrcode'
              )}</buttton>`
              // canEdit = false;
            }

            // 狀態為未產生條碼(0)才可以編輯進貨單
            if (
              val.is_create_pkg_id +
                val.is_any_stock_in +
                val.is_all_stock_in ==
              3
            ) {
              status = '已入庫'
            } else if (val.is_any_stock_in == 1 && val.is_all_stock_in == 0) {
              status = '已入庫一件以上，但未完成'
            } else if (
              val.is_create_pkg_id == 1 &&
              val.is_any_stock_in == 0 &&
              val.is_all_stock_in == 0
            ) {
              status = '已產生條碼未入庫'
            } else if (
              val.is_create_pkg_id +
                val.is_any_stock_in +
                val.is_all_stock_in ==
              0
            ) {
              status = '未生產條碼'
            }

            return [
              val.bill_no || '---',
              val.bill_date || '---',
              val.material_id || '---',
              val.remark || '---',
              val.ware_id || '---',
              val.vender_name || val.vender_id || '---',
              val.quantity || '---',
              val.unit_qty || '---',
              val.delivery_date || '---',
              val.vender_lot || '---',
              val.exp_date ? val.exp_date.toFormatedDate() : '---',
              status,
              `<button class='btn btn-xs btn-primary edit-bill-btn' ${
                canEdit ? '' : 'disabled'
              } title='Edit'><i class='fa fa-pencil'></i></button>`,
              btn,
              val.vender_pn || '---',
              val.bill_detail || '---',
              val.unit || '---',
              val.material_sub || '---',
            ]
          })
        )
      },
      initCreateCodeModal() {
        const context = this
        context.initInfoTable()
        context.initCodeTable()
      },
      initInfoTable() {
        const context = this
        const columns = [
          {
            title: i18n('Doc'),
            name: 'bill_no',
          },
          {
            title: i18n('Doc_Date'),
            name: 'bill_date',
          },
          {
            title: i18n('Part_No'),
            name: 'material_id',
          },
          {
            title: i18n('Specification'),
            name: 'remark',
          },
          {
            title: i18n('LotNo') + '(LotNo)',
            name: 'vender_lot',
          },
          {
            title: i18n('Quantity'),
            name: 'quantity',
          },
          {
            title: i18n('Date_Code') + '(Date Code)',
            name: 'delivery_date',
          },
          {
            title: i18n('Number_Of_Single_Piece'),
            name: 'unit_qty',
          },
        ]
        context.billInfoTable = new InfoTable(
          document.getElementById('basic-table'),
          4,
          columns
        )
      },
      initCodeTable() {
        const context = this
        context.createCodeReportTable = createReportTable({
          $tableElement: $('#create-code-table'),
          $tableWidget: $('#create-code-table-widget'),
          checkbox: true,
          showNoData: false,
          customBtns: [
            `<button id="create-code" class="btn btn-primary">${i18n(
              'Generating_Pkg-Id'
            )}</button>`,
            `<button id="print-selected-code" class="btn btn-primary">${i18n(
              'Print_Barcode_Check'
            )}</button>`,
            `<button id="print-all" class="btn btn-primary">${i18n(
              'Print_All'
            )}</button>`,
          ],
        })
        context.createCodeLoadingBtn = loadingButton(
          document.getElementById('create-code')
        )
        context.printSelectedLoadingBtn = loadingButton(
          document.getElementById('print-selected-code')
        )
        context.printAllLoadingBtn = loadingButton(
          document.getElementById('print-all')
        )

        function getAllPrintData() {
          const thingDataList = _.pluck(
            context.createCodeReportTable.table.data(),
            0
          )
          if (!thingDataList.length) {
            $.smallBox({
              sound: false,
              title: '列印失敗',
              content: '沒有可列印之條碼',
              color: colors.red,
              iconSmall: 'fa fa-times',
              timeout: 4000,
            })
            return false
          }
          return {
            'thing_id[]': thingDataList,
          }
        }
        function getSelectedPrintData() {
          var thingDataList = _.pluck(
            context.createCodeReportTable.getSelectedRow(),
            0
          )
          if (!thingDataList.length) {
            $.smallBox({
              sound: false,
              title: '列印失敗',
              content: '沒有勾選欲列印之條碼',
              color: colors.red,
              iconSmall: 'fa fa-times',
              timeout: 4000,
            })
            return false
          }
          return {
            'thing_id[]': thingDataList,
          }
        }
        if (servtechConfig.ST_ENABLE_PRINTER_PRINTING_QRCODE) {
          initPrintQrcodeBtn(document.getElementById('print-all'), () => {
            const requestData = getAllPrintData()
            if (!requestData) {
              return
            }
            return {
              url: 'api/ennoconn/material/qrcode-by-tsc',
              data: requestData,
            }
          })
          initPrintQrcodeBtn(
            document.getElementById('print-selected-code'),
            () => {
              const requestData = getSelectedPrintData()
              if (!requestData) {
                return
              }
              return {
                url: 'api/ennoconn/material/qrcode-by-tsc',
                data: requestData,
              }
            }
          )
        } else {
          downloadFile(
            '#print-all',
            '/api/ennoconn/material/qrcode',
            getAllPrintData,
            'GET'
          )
          downloadFile(
            '#print-selected-code',
            '/api/ennoconn/material/qrcode',
            getSelectedPrintData,
            'GET'
          )
        }

        $('#create-code').on('click', function () {
          const $createCodeBtn = $(this)
          const billData = context.$createCodeModal.data('rowData')
          const {
            unit,
            unit_qty,
            quantity,
            bill_no,
            bill_detail,
            material_id,
            material_sub,
            remark,
            delivery_date,
          } = billData
          const groups = Array.from(new Array(quantity), (v, i) => ({
            code_no: String(i + 1),
            thing_pcs: unit_qty.toString(),
            thing_unit: unit,
          }))
          const requestData = {
            bill_no,
            bill_detail: bill_detail.toString(),
            material_id,
            material_sub: material_sub === '---' ? '' : material_sub,
            remark,
            delivery_date,
            groups,
          }

          ajax(
            {
              url: 'api/ennoconn/material',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify(requestData),
            },
            {
              success(data) {
                context.codeList.push(
                  ...data.map((obj) => [obj.thing_id, obj.thing_pcs])
                )
                context.createCodeReportTable.drawTable(context.codeList)
                // update detailReportTable
                context.detailTable.table
                  .cell(context.$createCodeModal.data('tr'), 13)
                  .data(
                    `<button class="btn btn-primary reprint">${i18n(
                      'Reprint_Qrcode'
                    )}</button>`
                  )
                  .draw(false) // 隱藏/disable 產生Btn；show/enable 列印Btn
                $createCodeBtn.toggleClass('hide', true)
                $('#print-all').toggleClass('hide', false)
                $('#print-selected-code').toggleClass('hide', false)
              },
            }
          )
        })
      },
      showCreateCodeModal(btn, isCreate) {
        const context = this
        const tr = btn.closest('tr')
        const rowData = context.detailTable.getObjectData(tr)
        context.billInfoTable.draw(rowData)
        context.$createCodeModal.data({ rowData, tr })
        context.createCodeReportTable.toggleFeature(true)
        context.createCodeReportTable.drawTable(context.codeList)
        context.createCodeLoadingBtn.done()
        context.printSelectedLoadingBtn.done()
        context.printAllLoadingBtn.done()

        if (isCreate) {
          $('#create-code').toggleClass('hide', false)
          $('#print-all').toggleClass('hide', true)
          $('#print-selected-code').toggleClass('hide', true)
        } else {
          $('#create-code').toggleClass('hide', true)
          $('#print-all').toggleClass('hide', false)
          $('#print-selected-code').toggleClass('hide', false)
        }
        if (rowData.unit_qty !== '---' && rowData.exp_date !== '---') {
          $('#create-code-modal').modal('show')
        } else {
          $.smallBox({
            title: '產生條碼失敗',
            content: '請於綁定頁面設定到期日和單件數量',
            color: colors.red,
            iconSmall: 'fa fa-times',
            timeout: 4000,
          })
        }
      },
      updateSyncTime() {
        return new Promise((res) =>
          ajax(
            {
              url: 'api/getdata/db',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                table: 'a_strongled_synctime_stock_in',
                columns: ['max(sync_start) sync_start'],
              }),
            },
            {
              success(data) {
                const lastSyncTime =
                  data && data.length && !_.isEmpty(data[0])
                    ? data[0].sync_start.toFormatedDatetime()
                    : ''
                $('#sync-info>span').text(lastSyncTime)
                res(lastSyncTime)
              },
            }
          )
        )
      },
    },
    preCondition: {
      getSelectData(done) {
        ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_strongled_bill_stock_in',
              columns: ['ware_id', 'bill_no', 'material_id'],
            }),
          },
          {
            success(data) {
              //倉別
              const ware = data.map((i) => i.ware_id).filter((i) => i)
              const ware_arr = _.uniq(ware)
              initSelectWithList(['', ...ware_arr], $('#show-warehouse'))
              $('#show-warehouse').select2({
                minimumInputLength: 0,
                allowClear: true,
                placeholder: '選擇倉別',
              })
              select2AllowClearHelper($('#show-warehouse'))

              //入庫單號
              const bill_no = data.map((i) => i.bill_no).filter((i) => i)
              const bill_no_arr = _.uniq(bill_no)
              bill_no_arr.unshift('')

              initSelectWithList(bill_no_arr, $('#storage_number'))
              $('#storage_number').select2({
                minimumInputLength: 0,
                allowClear: true,
                placeholder: '選擇入庫單號',
              })
              select2AllowClearHelper($('#storage_number'))

              // 料號
              const material_id = data
                .map((i) => i.material_id)
                .filter((i) => i)
              const material_id_arr = _.uniq(material_id)
              material_id_arr.unshift('')

              initSelectWithList(material_id_arr, $('#material_id'))
              $('#material_id').select2({
                minimumInputLength: 0,
                allowClear: true,
                placeholder: '選擇料號',
              })
              select2AllowClearHelper($('#material_id'))

              //日期
              initDatePicker($('#startDate'), $('#endDate'), false, false)
              $('#startDate').val('')
              $('#endDate').val('')
              done(data)
            },
          }
        )
      },
    },
    dependencies: [
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
      ['/js/plugin/jsBarcode/JsBarcode.all.min.js'],
      ['/js/plugin/select2/select2.min.js'],
    ],
  })
}
