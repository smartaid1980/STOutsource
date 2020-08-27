export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.reportTable = createReportTable({
        $tableElement: $('#table'),
        $tableWidget: $('#table-widget'),
        rightColumn: [1, 2, 3, 4],
      })

      servkit.initDatePicker(context.$startDate, context.$endDate)

      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()
        context.loadingBtn.doing()
        try {
          context.getData(context.$startDate.val(), context.$endDate.val())
        } catch (e) {
          console.warn(e)
          context.loadingBtn.done()
        }
      })
    },
    util: {
      $startDate: $('#startDate'),
      $endDate: $('#endDate'),
      $submitBtn: $('#submit'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit')),
      getData: function (startDate, endDate) {
        var context = this
        servkit.ajax(
          {
            url: 'api/backupquery/query',
            type: 'POST',
            data: {
              start_date: startDate,
              end_date: endDate,
            },
          },
          {
            success: function (data) {
              context.reportTable.drawTable(
                _.map(data, function (elem) {
                  return [
                    elem.ServCoreId,
                    elem.date,
                    elem.result,
                    moment(elem.startTsp).format('YYYY/MM/DD HH:mm:ss'),
                    moment(elem.endTsp).format('YYYY/MM/DD HH:mm:ss'),
                    elem.exception || '---',
                  ]
                })
              )
              context.loadingBtn.done()
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
