export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.reportTable = createReportTable({
        $tableElement: $('#table'),
        $tableWidget: $('#table-widget'),
      })

      servkit.initDatePicker(context.$startDate, context.$endDate)
      servkit.initMachineSelect(context.$machineSelect)
      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()

        context.loadingBtn.doing()
        try {
          context.getData()
        } catch (e) {
          context.loadingBtn.done()
        }
      })
    },
    util: {
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $machineSelect: $('#machine'),
      $submitBtn: $('#submit-btn'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      reportTable: undefined,
      getData: function () {
        var machineList = this.$machineSelect.val() || [],
          loadingBtn = this.loadingBtn,
          context = this

        hippo
          .newSimpleExhaler()
          .space('HUL_N6_Grouper')
          .index('machine_id', machineList)
          .indexRange('date', this.$startDate.val(), this.$endDate.val())
          .columns(
            'timestamp',
            'logically_date',
            'work_shift_name',
            'machine_id',
            'n6',
            'macro521',
            'macro522',
            'macro523'
          )
          .exhale(function (exhalable) {
            var tableData = _.map(exhalable.exhalable, function (elem) {
              return [
                //日期
                elem.logically_date,
                //班次
                elem.work_shift_name,
                //機台
                servkit.getMachineName(elem.machine_id),
                //時間戳記
                elem.timestamp.date20BitsToFormatted(),
                //N6
                elem.n6,
                //macor521
                elem.macro521,
                //macor522
                elem.macro522,
                //macor523
                elem.macro523,
              ]
            })

            context.reportTable.drawTable(tableData)
            loadingBtn.done()
          })
      },
    },
    delayCondition: ['machineList'],
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
