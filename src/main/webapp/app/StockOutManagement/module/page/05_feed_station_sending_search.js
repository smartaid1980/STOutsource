export default function () {
  GoGoAppFun({
    gogo: function gogo(ctx) {
      ctx.ReportTable = createReportTable({
        $tableElement: $('#query-result'),
        $tableWidget: $('#query-result-widget'),
        order: [[0, 'desc']],
      })
      // 日期
      servkit.initDatePicker($('#startDate'), $('#endDate'), false, false)
      $('#startDate').val('')
      $('#endDate').val('')

      // 按下搜尋
      $('#submit-btn').on('click', function (evt) {
        evt.preventDefault()

        //日期
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

        let date = `sync_end BETWEEN '${start_date}000000' AND '${end_date}235959'`

        //搜尋AJAX
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_storage_smt_station_log',
              whereClause: `${date}`,
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
              ctx.ReportTable.drawTable(ans)
            },
          }
        )
      })
    },
    util: {
      ReportTable: '',
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
