import { InfoTable } from '../../../StrongLEDStorageManagement/module/infoTable.js'
import { select2AllowClearHelper } from '../../../../js/servtech/module/feature/customizeLibSetting.js'

export default function () {
  GoGoAppFun({
    gogo: function gogo(ctx) {
      ctx.ReportTable = createReportTable({
        $tableElement: $('#query-result'),
        $tableWidget: $('#query-result-widget'),
      })
      ctx.initInfoTable()
      // 按下查詢按鈕
      $('#submit-btn').on('click', function (evt) {
        evt.preventDefault()
        // 倉庫select
        let warehouse = $('#warehouse_select').val()
        warehouse =
          warehouse.trim().length === 0 ? '' : `AND ware_id='${warehouse}'`

        //日期 select
        let start_date = $('#startDate').val()
        start_date =
          start_date.trim().length === 0
            ? '20000101'
            : moment(start_date).format('YYYYMMDD')
        let end_date = $('#endDate').val()
        end_date =
          end_date.trim().length === 0
            ? '21000101'
            : moment(end_date).format('YYYYMMDD')

        let date = `bill_date between '${start_date}' AND '${end_date}'`

        //發料單號
        let bill_no = $('#warehouse_out_order_select').val()
        bill_no = bill_no.trim().length == 0 ? '' : `AND bill_no='${bill_no}'`

        //工單號
        let word_id = $('#work_id_select').val()
        word_id = word_id.trim().length === 0 ? '' : `AND column_1='${word_id}'`

        //線別
        let line = $('#line').val()
        line = line.trim().length == 0 ? '' : `AND column_4='${line}'`

        //領料單位
        let picking_unit = $('#picking_unit').val()
        picking_unit =
          picking_unit.trim().length == 0
            ? ''
            : `AND column_3='${picking_unit}'`

        //搜尋AJAX
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_strongled_bill_stock_out_main',
              whereClause: `${date} ${warehouse} ${bill_no} ${line} ${word_id} ${picking_unit}`,
            }),
          },
          {
            success: function (data) {
              let ans = []
              _.each(data, (val) => {
                let status
                if (val.status == 0) {
                  status = '新增'
                } else if (val.status == 1) {
                  status = '部分出庫'
                } else if (val.status == 2) {
                  status = '鎖定'
                } else if (val.status == 9) {
                  status = '已結案'
                } else {
                  status = '---'
                }

                let arr = [
                  val.bill_no || '---',
                  val.stock_out_date || '---',
                  val.remark || '---',
                  val.ware_id || '---',
                  val.column_1 || '---',
                  val.column_2 || '---',
                  val.column_3 || '---',
                  val.column_4 || '---',
                  status,
                  `<button class="btn btn-primary" name="btn_detail">檢視${i18n(
                    'Details'
                  )}</button>`,
                  val.status == 9
                    ? `<button  class="btn btn-success">${i18n(
                        'Case_Closed_Done'
                      )}</button>`
                    : `<button  class="btn btn-primary" name="btn_case_closed">${i18n(
                        'Case_Closed'
                      )}</button>`,
                ]
                return ans.push(arr)
              })
              ctx.ReportTable.drawTable(ans)
            },
          }
        )
      })

      //按下檢視明細
      $('#query-result').on('click', '[name=btn_detail]', function () {
        //產生發料單明細 上方InfoTable
        let data = $(this.closest('tr')).data('row-data')

        let dataObj = {
          bill_no: data[0],
          stock_out_date: data[1],
          remark: data[2],
          ware_id: data[3],
          column_1: data[4],
          column_2: data[5],
          column_3: data[6],
          column_4: data[7],
          status: data[8],
        }
        ctx.modalDataObj = dataObj
        ctx.DetailTable.draw(dataObj)

        //產生發料單明細 下方reportTable

        ctx.ItemTable = createReportTable({
          $tableElement: $('#item_table'),
          $tableWidget: $('#item_table_widget'),
          customBtns: [
            data[8] == '已結案'
              ? ''
              : `<button name='closed_case' class='btn btn-primary btn-lg closed_case'>結案</button>`,
          ],
        })

        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_strongled_bill_stock_out_detail',
              columns: [
                'bill_detail',
                'material_id',
                'column_1',
                'column_2',
                'column_3',
                'column_4',
                'out_qty',
                'quantity',
              ],
              whereClause: `ware_id='${
                data[3] === '---' ? '' : data[3]
              }' AND bill_no='${data[0]}'`,
            }),
          },
          {
            success(data) {
              let ans = []
              _.each(data, (val) => {
                val.out_qty == undefined ? (val.out_qty = 0) : ''
                let arr = [
                  val.bill_detail || '---',
                  val.material_id || '---',
                  val.column_1 || 0,
                  val.column_4 || '---',
                  val.column_2 || 0,
                  val.column_3 || 0,
                  val.quantity || 0,
                  val.out_qty,
                  val.quantity - val.out_qty,
                ]
                ans.push(arr)
              })
              ctx.ItemTable.drawTable(ans)
            },
          }
        )

        $('#detail-modal').modal('show')

        //modal內的結案
        ctx.BtnThis = this
        $('#detail-modal').on('click', '.closed_case', function () {
          $('#check-modal').modal('show')
        })
      })
      // 查詢結果的結案
      $('#query-result').on('click', '[name=btn_case_closed]', function () {
        $('#check-modal').modal('show')
        ctx.BtnThis = this
      })
      // 檢視明細內的結案
      $('#check-modal').on('click', '[name=check_btn]', function () {
        let tr = ctx.BtnThis.closest('tr')
        let rowData = $(tr).data('row-data')
        ctx.Do_closed_case(tr, rowData, ctx.modalDataObj)
        $('#detail-modal').modal('hide')
      })
    },
    util: {
      ReportTable: '',
      DetailTable: '',
      ItemTable: '',
      BtnThis: '',
      modalDataObj: '',
      initInfoTable: function () {
        let ctx = this
        let columns = [
          {
            title: i18n('Warehouse_Out_Order_No'),
            name: 'bill_no',
          },
          { title: i18n('Warehouse_Out_Date'), name: 'stock_out_date' },
          {
            title: i18n('Product'),
            name: 'remark',
          },
          { title: i18n('Warehouse'), name: 'ware_id' },
          {
            title: i18n('Work_ID'),
            name: 'column_1',
          },
          {
            title: i18n('Work_Number'),
            name: 'column_2',
          },
          {
            title: i18n('Picking_Unit'),
            name: 'column_3',
          },
          {
            title: i18n('Line'),
            name: 'column_4',
          },
          {
            title: i18n('Status'),
            name: 'status',
          },
        ]
        ctx.DetailTable = new InfoTable(
          document.getElementById('detail_table'),
          9,
          columns
        )
      },
      Do_closed_case(tr, rowData, dataObj = false) {
        let ctx = this
        let pks = {
          bill_no: rowData[0],
          ware_id: rowData[3],
        }

        servkit.ajax(
          {
            url: 'api/stdcrud',
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({
              tableModel:
                'com.servtech.servcloud.app.model.storage.BillStockOutMain',
              pks,
              modify_time: +moment().format('YYYYMMDDHHmmss'),
              bill_no: rowData[0],
              ware_id: rowData[3],
              status: 9,
            }),
          },
          {
            success() {
              $('#check-modal').modal('hide')
              // modal內資料改變及按鈕隱藏
              if (dataObj) {
                dataObj.status = '已結案'
                ctx.DetailTable.draw(dataObj)
                $('[name=closed_case]').hide()
              }
              // table資料改變
              rowData[8] = '已結案'
              rowData[10] = `<button  class="btn btn-success">${i18n(
                'Case_Closed_Done'
              )}</button>`
              ctx.ReportTable.table.row(tr).data(rowData).draw()
              $.smallBox({
                title: '已成功結案',
                color: '#2FA12F',
                iconSmall: 'fa fa-check',
                timeout: 4000,
              })
            },
          }
        )
      },
    },
    preCondition: {
      getSearchData(done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_strongled_bill_stock_out_main',
              columns: [
                'ware_id',
                'bill_no',
                'column_2',
                'column_3',
                'column_4',
              ],
            }),
          },
          {
            success(data) {
              //倉別
              let ware = data.map((i) => i.ware_id).filter((i) => i)
              let ware_arr = _.uniq(ware)
              ware_arr.unshift('')

              servkit.initSelectWithList(ware_arr, $('#warehouse_select'))
              $('#warehouse_select').select2({
                minimumInputLength: 0,
                allowClear: true,
                placeholder: '選擇倉別',
              })
              select2AllowClearHelper($('#warehouse_select'))

              servkit.initDatePicker(
                $('#startDate'),
                $('#endDate'),
                false,
                false
              )
              $('#startDate').val('')
              $('#endDate').val('')
              done(data)
            },
          }
        )
      },
    },
    dependencies: [
      ['/js/plugin/select2/select2.min.js'],
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
    ],
  })
}
