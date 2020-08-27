export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.reportTable = createReportTable({
        $tableElement: $('#table'),
        $tableWidget: $('#table-widget'),
        onRow: function (row, data) {
          if (context.isUnusualMap[data[0] + '@@' + data[1]]) {
            $(row).addClass('danger')
          }
        },
      })

      servkit.initDatePicker(context.$startDate, context.$endDate)
      servkit.initMachineSelect(context.$machineSelect)
      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()
        context.getData()
      })

      $('#showdemo').on('click', function (e) {
        e.preventDefault()
        context.$startDate.val('2016/07/13')
        context.$endDate.val('2016/07/19')
        context.$machineSelect.val([
          '_HULPLATFORM01D01M01',
          '_HULPLATFORM01D01M02',
        ])
        context.$submitBtn.click()
      })
    },
    util: {
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $machineSelect: $('#machine'),
      $submitBtn: $('#submit-btn'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      reportTable: undefined,
      isUnusualMap: {},
      getData: function () {
        var machineList = this.$machineSelect.val() || [],
          loadingBtn = this.loadingBtn,
          context = this
        loadingBtn.doing()

        hippo
          .newSimpleExhaler()
          .space('HUL_macro_monitor')
          .index('machine_id', machineList)
          .indexRange('date', this.$startDate.val(), this.$endDate.val())
          .columns(
            'timestamp',
            'machine_id',
            'status',
            'macro522',
            'inconsistent',
            'overtime'
          )
          .exhale(function (exhalable) {
            context.isUnusualMap = {}
            var tableData = _.map(exhalable.exhalable, function (elem) {
              var timestamp = elem.timestamp.date20BitsToFormatted()
              var machineName = servkit.getMachineName(elem.machine_id)

              //macro與狀態不一致 且 狀態發生到macro改變超過5分鐘
              context.isUnusualMap[timestamp + '@@' + machineName] =
                elem.inconsistent && elem.overtime

              return [
                timestamp,
                machineName,
                servkit.getMachineLightName(elem.status),
                elem.macro522 +
                  ' (' +
                  (context.preCon.downtimeCode[elem.macro522] || '---') +
                  ')',
              ]
            })

            context.reportTable.drawTable(tableData)
            loadingBtn.done()
          })
      },
    },
    preCondition: {
      downtimeCode: function (done) {
        servkit.ajax(
          {
            url: 'api/downtimeCode/read',
            type: 'GET',
            contentType: 'application/json',
          },
          {
            success: function (data) {
              var downtimeCode = _.reduce(
                data,
                function (memo, elem) {
                  memo[elem.downtime_code] = elem.downtime_code_name
                  return memo
                },
                {}
              )
              done(downtimeCode)
            },
          }
        )
      },
    },
    delayCondition: ['machineList', 'machineLightList'],
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
