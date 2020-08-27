export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.reportTable = createReportTable({
        $tableElement: $('#table'),
        $tableWidget: $('#table-widget'),
      })

      servkit.initDatePicker(context.$startDate, context.$endDate)
      servkit.initMachineSelect(context.$machineSelect, true)
      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()

        context.loadingBtn.doing()
        try {
          context.getData()
        } catch (e) {
          context.loadingBtn.done()
        }
      })

      if (new Date() - new Date(sessionStorage.loginTime) < 5000) {
        context.$submitBtn.click()
      }
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
          .space('add_sulfur_setting_grouper')
          .index('machine_id', machineList)
          .indexRange('date', this.$startDate.val(), this.$endDate.val())
          .columns('timestamp', 'machine_id', 'old_G_FSST', 'new_G_FSST')
          .exhale(function (exhalable) {
            var tableData = _.chain(exhalable.exhalable)
              // .filter(function(elems, index) {
              //   return elem.old_G_FSST != "---";
              // })
              .map(function (elem) {
                return [
                  //更動時間
                  elem.timestamp.date20BitsToFormatted(),
                  //機台
                  servkit.getMachineName(elem.machine_id),
                  //更改前加硫(T7)設定值
                  elem.old_G_FSST,
                  //更改後加硫(T7)設定值
                  elem.new_G_FSST,
                ]
              })
              .value()

            // TODO: 如果查詢區間內T7都沒有變化的話會查無資料

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
