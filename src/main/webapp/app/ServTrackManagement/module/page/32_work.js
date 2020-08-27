import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
import servkit from '../../../../js/servtech/module/servkit/servkit.js'
export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      // report table
      ctx.reportTable = createReportTable({
        $tableElement: $('#query-result'),
        $tableWidget: $('#query-result-widget'),
        hideCols: [14, 15],
        customBtns: [
          `<button id='sync_erp' class='btn btn-primary'>${i18n(
            'Synchronize_ERP'
          )}</button>`,
        ],
      })

      // 日期初始化
      ctx.DatePicker()

      // 工序製程 report table
      ctx.process_table = createReportTable({
        $tableElement: $('#process_table'),
        $tableWidget: $('#process_widget'),
      })

      // 拆批內的report table
      ctx.work_table = createReportTable({
        $tableElement: $('#work_table'),
        $tableWidget: $('#work_widget'),
      })

      // 查詢
      $('#submit-btn').click(function (evt) {
        evt.preventDefault()
        const loadingBtn = servkit.loadingButton(
          document.querySelector('#submit-btn')
        )
        loadingBtn.doing()

        // 訂單序號資料
        let po_item = _.pluck(ctx.preCon.works, 'po_item')
        po_item = _.uniq(po_item.sort((a, b) => a - b))

        // 工作中心select
        let division = $('#division').val()
        const reg = /^...../
        division =
          division.length === 0 ? '' : `AND division_id='${reg.exec(division)}'`

        // 訂單編號
        let order = $('#order').val()
        order = order.length === 0 ? '' : `AND po='${order}'`

        // 訂單序號
        let order_number_start = $('#order_number_start').val()
        let order_number_end = $('#order_number_end').val()

        order_number_start =
          order_number_start.length === 0 ? po_item[0] : order_number_start

        order_number_end =
          order_number_end.length === 0
            ? po_item[po_item.length - 1]
            : order_number_end
        const order_number = `AND po_item BETWEEN '${order_number_start}' and '${order_number_end}'`

        // 日期select
        let start_date = $('#startDate').val()
        start_date =
          start_date.length === 0
            ? '20000101'
            : moment(start_date).format('YYYYMMDD')

        let end_date = $('#endDate').val()
        end_date =
          end_date.length === 0
            ? '21000101'
            : moment(end_date).format('YYYYMMDD')

        const date = `AND exp_start_date >='${start_date}' AND exp_end_date <='${end_date}'`

        // 工單狀態
        let checkbox_arr = []
        $('[name=work-status]:checked').each(function () {
          checkbox_arr.push(this.value)
        })
        if (checkbox_arr.length != 0) {
          checkbox_arr = checkbox_arr.reduce(
            (a, b) => a + `'` + b + `'` + ` ,`,
            ''
          )
          checkbox_arr =
            'AND status_id IN (' +
            checkbox_arr.substring(0, checkbox_arr.length - 1) +
            ')'
        } else {
          checkbox_arr = ''
        }

        // 派工單號
        let work_id = $('#work-id').val()
        work_id = work_id.length === 0 ? '' : `AND work_id='${work_id}'`

        // 產品名稱
        let product_id = $('#product-id').val()
        product_id =
          product_id.length === 0 ? '' : `AND product_name='${product_id}'`

        // 畫table
        ctx.drawTable = function () {
          servkit.ajax(
            {
              url: 'api/getdata/db',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                table: 'a_yihcheng_view_work_map',
                whereClause: `1 ${order} ${order_number} ${date} ${checkbox_arr} ${work_id} ${product_id} ${division}`,
              }),
            },
            {
              success: function (data) {
                const ans = []
                const process = `<button name='process' class='btn btn-primary'>${i18n(
                  'ServTrackManagement_000060'
                )}</button>`
                const unpacking = `<button name='unpacking' class='btn btn-primary'>${i18n(
                  'Unpacking'
                )}</button>`
                const print = `<button name='print' class='btn btn-primary'>${i18n(
                  'Print'
                )}</button>`
                _.each(data, (val) => {
                  const arr = [
                    val.work_id || '---',
                    val.parent_id || '---',
                    val.product_name || '---',
                    val.po || '---',
                    val.po_item || '---',
                    val.e_quantity || '---',
                    val.op_start || '---',
                    (val.is_order = val.is_order === 'Y' ? '是' : '否'),
                    val.exp_start_date.toFormatedDate() || '未開工',
                    val.create_by || '---',
                    val.lot_purpose || '---',
                    process,
                    unpacking,
                    // val.exp_start_date ? '' : unpacking,
                    print,
                    val.input || '---',
                    val.product_id || '---',
                  ]
                  return ans.push(arr)
                })
                ctx.reportTable.drawTable(ans)
                loadingBtn.done()
              },
            }
          )
        }
        ctx.drawTable()
      })

      // 畫table

      // 同步ERP
      $('#sync_erp').click(() => {
        const loadingBtn = servkit.loadingButton(
          document.querySelector('#sync_erp')
        )
        loadingBtn.doing()
        servkit.ajax(
          {
            url: 'api/yihcheng/erpsyn/work',
            type: 'GET',
            contentType: 'application/json',
          },
          {
            success: function () {
              loadingBtn.done()
            },
          }
        )
      })

      // 工序製程
      $('#query-result').on('click', '[name=process]', function () {
        const rowData = $(this.closest('tr')).data('row-data')

        $('#process_modal_work').text(rowData[0])
        $('#process_modal_product').text(rowData[2])
        $('#process_modal_output').text(rowData[5])
        $('#process_modal_initial_output').text(rowData[14])

        const process_filter = ctx.preCon.process_op.filter(
          (i) => i.product_id === rowData[15]
        )
        const ans = []
        _.each(process_filter, (val) => {
          const arr = [
            val.op || '---',
            val.process_code || '---',
            val.std_hour || '---',
            val.remark || '---',
          ]
          return ans.push(arr)
        })
        ctx.process_table.drawTable(ans)
        $('#modal-process').modal('show')
      })

      // 拆批
      $('#query-result').on('click', '[name=unpacking]', function () {
        const trData = $(this.closest('tr')).data('row-data')
        ctx.trData = trData

        const data = ctx.preCon.works.filter((i) => i.work_id === trData[0])[0]
        const reg = new RegExp(`^${trData[0]}_`, 'g')
        const new_work_id = _.pluck(
          ctx.preCon.works.filter((i) => i.work_id.match(reg)),
          'work_id'
        )

        const ans = []
        if (new_work_id.length === 0) {
          ans.push(1)
        } else {
          _.each(new_work_id, (val) => {
            const reg2 = /_[0-9]+$/
            return ans.push(Number(reg2.exec(val)[0].replace('_', '')) + 1)
          })
        }

        ctx.work_index = Math.max(...ans)
        if (String(ctx.work_index).length < 3) {
          ctx.work_index =
            String(ctx.work_index).length === 2
              ? trData[0] + '_0' + String(ctx.work_index)
              : trData[0] + '_00' + String(ctx.work_index)
        }

        $('#modal-work-id').text(ctx.work_index)
        $('#modal-work-product').text(trData[2])

        ctx.work_table.drawTable([
          [
            data.po || '---',
            data.product_process || '---',
            data.work_class_name || '---',
            data.edn || '---',
            data.dept_name || '---',
            data.exp_start_date ? data.exp_start_date.toFormatedDate() : '---',
            data.exp_end_date ? data.exp_end_date.toFormatedDate() : '---',
            data.work_date ? data.work_date.toFormatedDate() : '---',
            data.unit || '---',
            data.customer_id || '---',
            (data.is_order = data.is_order === 'Y' ? '是' : '否'),
          ],
        ])
        $('#unpacking_modal').modal('show')
      })

      // 提交拆批數量
      $('#modal-submit-btn').click(function () {
        const reg = /\D/g
        const ValNotNumber = reg.test($('#modal-quantity').val())

        if ($('#modal-quantity').val() > ctx.trData[5]) {
          $.smallBox({
            title: '標準產量不可大於預估產量',
            color: servkit.colors.red,
            iconSmall: 'fa fa-times',
            timeout: 4000,
          })
        } else if (ValNotNumber) {
          $.smallBox({
            title: '產量請輸入數字',
            color: servkit.colors.red,
            iconSmall: 'fa fa-times',
            timeout: 4000,
          })
        } else {
          const loadingBtn = servkit.loadingButton(
            document.querySelector('#modal-submit-btn')
          )
          loadingBtn.doing()
          const split_data = {
            new_work_id: ctx.work_index,
            new_work_qty: Number($('#modal-quantity').val()),
            work_id: ctx.trData[0],
            lot_purpose: 1,
            remark: $('#modal-description').val(),
          }
          servkit.ajax(
            {
              url: 'api/yihcheng/split-batch',
              type: 'GET',
              contentType: 'application/json',
              data: split_data,
            },
            {
              success: function () {
                ctx.drawTable()
                loadingBtn.done()
                $('#unpacking_modal').modal('hide')
              },
            }
          )
        }
      })

      //列印
      $('#query-result').on('click', '[name=print]', function () {
        console.log('123')
        // servkit.ajax(
        //   {
        //     url: 'api/yihcheng/excel/download-pdf',
        //     type: 'GET',
        //     contentType: 'application/json',
        //     // data: ,
        //   },
        //   {
        //     success: function (data) {
        //       console.log(data)
        //     },
        //   }
        // )
      })
    },
    util: {
      reportTable: '',
      DatePicker: function () {
        servkit.initDatePicker($('#startDate'), $('#endDate'), true)
        $('#startDate').val('')
        $('#endDate').val('')
      },
      process_table: '',
      work_table: '',
      po_item: '',
      e_quantity: '',
      work_index: '',
      trData: '',
      drawTable: '',
    },
    dependencies: [
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
      ['/js/plugin/select2/select2.min.js'],
    ],
    preCondition: {
      works: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_yihcheng_view_work_map',
            }),
          },
          {
            success: function (data) {
              // 初始化派工單號
              const works = _.uniq(_.pluck(data, 'work_id'))
              servkit.initSelect2WithData($('#work-id'), works, true, {
                minimumInputLength: 0,
                allowClear: true,
                placeholder: i18n('ServTrackManagement_000049'),
              })
              // 初始化產品名稱
              const product_name = _.pluck(data, 'product_name')
              servkit.initSelect2WithData(
                $('#product-id'),
                _.uniq(product_name),
                true,
                {
                  minimumInputLength: 0,
                  allowClear: true,
                  placeholder: i18n('ServTrackManagement_000043'),
                }
              )
              //初始化工作中心
              let division_id = []
              // const reg = /^.....\s/g
              _.each(data, (val) => {
                division_id.push(`${val.division_id}  ${val.division_name}`)
              })
              // let division_id = _.pluck(data, 'division_id')
              division_id = _.uniq(division_id)
              servkit.initSelect2WithData($('#division'), division_id, true, {
                minimumInputLength: 0,
                allowClear: true,
                placeholder: i18n('Work_Center'),
              })
              done(data)
            },
          }
        )
      },
      process: function (done) {
        var that = this
        servkit.ajax(
          {
            url: servkit.rootPath + '/api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_servtrack_process',
              columns: ['process_code', 'process_name'],
            }),
          },
          {
            success: function (data) {
              var func = that.commons.initializeDBData(data)
              func.init('process_code', 'process_name')
              done(func)
            },
          }
        )
      },
      process_op: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_servtrack_product_op',
            }),
          },
          {
            success: function (data) {
              done(data)
            },
          }
        )
      },
    },
  })
}
