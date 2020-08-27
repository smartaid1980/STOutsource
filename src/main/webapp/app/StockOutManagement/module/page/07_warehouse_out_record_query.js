import { select2AllowClearHelper } from '../../../../js/servtech/module/feature/customizeLibSetting.js'
export default function () {
  GoGoAppFun({
    gogo: function gogo(ctx) {
      ctx.ReportTable = createReportTable({
        $tableElement: $('#query-result'),
        $tableWidget: $('#query-result-widget'),
        checkbox: true,
        customBtns: [
          `<button id='no_export' class='btn btn-primary'>轉出勾選項目，不註記轉出</button>`,
          `<button id='export'  class='btn btn-success'>轉出勾選項目，註記轉出</button>`,
        ],
        hideCols: [11],
      })
      //查詢
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

        let date = `bill_date BETWEEN '${start_date}' AND '${end_date}'`

        //出庫單號select
        let bill_no_out = $('#bill_no_out_select').val()
        bill_no_out =
          bill_no_out.trim().length === 0 ? '' : `AND bill_no='${bill_no_out}'`

        //PKGID
        let pkgid = $('#pkgid').val()
        pkgid = pkgid.trim().length == 0 ? '' : `AND thing_id='${pkgid}'`

        //出庫方式 select
        let bill_out_type = $('#warehouse_out_type_select').val()
        bill_out_type =
          bill_out_type == 0
            ? `AND situation !='11' AND situation !='12'`
            : `AND situation='${bill_out_type}'`

        //註記轉出 radio transferred_out
        let transferred_out = $('[name=transferred_out]:checked').val()
        transferred_out =
          transferred_out == 'Y'
            ? `AND is_export='${transferred_out}'`
            : `AND is_export='N'`

        //搜尋AJAX
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_ennoconn_view_thing_log_bill_stock_in',
              whereClause: `${date} ${warehouse} ${bill_no_out} ${pkgid} ${bill_out_type} ${transferred_out}`,
            }),
          },
          {
            success: function (data) {
              let ans = []
              _.each(data, (val) => {
                let situation
                if (val.situation == 21) {
                  situation = '發料單出庫'
                } else if (val.situation == 22) {
                  situation = '料站表出庫'
                } else if (val.situation == 23) {
                  situation = '繼料出庫'
                } else if (val.situation == 24) {
                  situation = '手動查詢出庫'
                } else if (val.situation == 25) {
                  situation = '鎖定物料出庫'
                } else if (val.situation == 26) {
                  situation = '物料移轉出庫'
                } else {
                  situation = '---'
                }

                let arr = [
                  moment(val.log_time).format('YYYY/MM/DD HH:mm:ss') || '---',
                  val.thing_id || '---',
                  val.material_id || '---',
                  val.thing_pcs || '---',
                  val.vender_name || '---',
                  val.delivery_date || '---',
                  val.vender_lot || '---',
                  val.ware_id || '---',
                  situation,
                  val.bill_no_out || '---',
                  (val.is_export = val.is_export === 'N' ? '否' : '是'),
                  val.log_id,
                ]
                return ans.push(arr)
              })
              ctx.ReportTable.drawTable(ans)
            },
          }
        )
      })

      //不註記轉出的btn
      servkit.downloadExcel($('#no_export'), () => {
        let data_arr = ctx.ReportTable.getSelectedRow()
        if (data_arr.length !== 0) {
          let tableHeader = _.map(
            $('#query-result').find('thead tr:nth-of-type(2) *'),
            function (e) {
              return e.textContent.trim()
            }
          ).filter((i) => i)

          let matrix_arr = _.map(data_arr, (val) => {
            return val.filter((i, index) => index < 11)
          })

          return {
            fileName: '入庫紀錄' + moment().format('YYYYMMDDHHmmss'),
            format: tableHeader.map(() => 'text'),
            header: tableHeader,
            matrix: matrix_arr,
          }
        } else {
          $.smallBox({
            sound: false,
            title: '轉出失敗',
            content: '沒有勾選欲轉出之條碼',
            color: servkit.colors.red,
            iconSmall: 'fa fa-times',
            timeout: 4000,
          })
        }
      })

      //註記轉出的btn
      servkit.downloadExcel($('#export'), () => {
        if (ctx.ReportTable.getSelectedRow().length !== 0) {
          let tableHeader = _.map(
            $('#query-result').find('thead tr:nth-of-type(2) *'),
            function (e) {
              return e.textContent.trim()
            }
          ).filter((i) => i)

          let log_id_arr = ctx.ReportTable.getSelectedRow().map((i) =>
            String(i[11])
          )
          //發給後端改資料 改變畫面的元素
          servkit.ajax(
            {
              url: 'api/ennoconn/thing-log',
              type: 'PUT',
              contentType: 'application/json',
              data: JSON.stringify({ logs: log_id_arr }),
            },
            {
              success: function () {
                _.each(ctx.ReportTable.getSelectedTrArray(), (val) => {
                  val.cells[11].innerHTML = '是'
                  val.cells[11].innerTEXT = '是'
                })
              },
            }
          )
          let matrix = _.map(ctx.ReportTable.getSelectedRow(), (val) => {
            return val.filter((i, index) => index < 11)
          })
          matrix.map((i) => (i[10] = '是'))
          return {
            fileName: '出庫紀錄' + moment().format('YYYYMMDDHHmmss'),
            format: tableHeader.map(() => 'text'),
            header: tableHeader,
            matrix: matrix,
          }
        } else {
          $.smallBox({
            sound: false,
            title: '轉出失敗',
            content: '沒有勾選欲轉出之條碼',
            color: servkit.colors.red,
            iconSmall: 'fa fa-times',
            timeout: 4000,
          })
        }
      })
    },
    util: {
      ReportTable: '',
    },
    preCondition: {
      getSearchData(done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_ennoconn_view_thing_log_bill_stock_in',
              columns: ['ware_id', 'bill_no', 'bill_no_out', 'thing_id'],
            }),
          },
          {
            success(data) {
              //搜尋條件

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

              //出庫
              let bill_no_out = data.map((i) => i.bill_no_out).filter((i) => i)
              let bill_no_out_arr = _.uniq(bill_no_out)
              bill_no_out_arr.unshift('')
              bill_no_out =
                bill_no_out.length === 0 ? ['目前無出庫單資料'] : bill_no_out
              servkit.initSelectWithList(
                bill_no_out_arr,
                $('#bill_no_out_select')
              )
              $('#bill_no_out_select').select2({
                minimumInputLength: 0,
                allowClear: true,
                placeholder: '選擇出庫單號',
              })
              select2AllowClearHelper($('#bill_no_out_select'))

              // let pkgid = data.map((i) => i.thing_id);
              // servkit.initSelectWithList(_.uniq(pkgid), $("#pkgid"));
              // $("#pkgid").select2().select2("val", "");

              // 日期
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
