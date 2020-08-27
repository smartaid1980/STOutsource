export default function () {
  GoGoAppFun({
    gogo: function gogo(ctx) {
      ctx.resultReportTable = createReportTable({
        $tableElement: $('#query-result'),
        $tableWidget: $('#query-result-widget'),
        order: [[0, 'desc']],
      })
      servkit.initDatePicker($('#startDate'), $('#endDate'), false, false)
      $('#query-result-widget .dt-toolbar').addClass('hide')

      $('#submit-btn').on('click', function (evt) {
        evt.preventDefault()
        let select_table
        $('[name=status]:checked').val() == 1
          ? (select_table = 'a_strongled_bill_stock_out_log')
          : (select_table = 'a_strongled_bill_stock_out_detail_log')
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: select_table,
              whereClause: `sync_end between '${$(
                '#startDate'
              ).val()} 00:00:00' AND '${$('#endDate').val()} 23:59:59'`,
            }),
          },
          {
            success: function (data) {
              let ans = []
              _.each(data, (val) => {
                let userName = _.chain(ctx.preCon.getUser)
                  .filter((i) => i.user_id === val.modify_by)
                  .map((i) => i.user_name)
                  .join('')
                  .value()
                let arr = [
                  moment(val.sync_end).format('YYYY/MM/DD HH:mm:ss'),
                  val.file_name,
                  val.quantity,
                  val.qty_success,
                  val.fail === '' ? '無失敗列數' : val.fail,
                  userName,
                ]
                return ans.push(arr)
              })
              ctx.resultReportTable.drawTable(ans)
            },
          }
        )
      })
    },
    util: {
      resultReportTable: null,
    },
    preCondition: {
      getUser(done) {
        servkit.ajax(
          {
            url: 'api/user/read',
            type: 'GET',
          },
          {
            success(data) {
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
    ],
  })
}
