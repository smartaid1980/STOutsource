export default function () {
  GoGoAppFun({
    gogo: function (context) {
      var datepickerConfig = {
          dateFormat: 'yy/mm/dd',
          prevText: '<i class="fa fa-chevron-left"></i>',
          nextText: '<i class="fa fa-chevron-right"></i>',
        },
        table = createReportTable({
          $tableElement: $('#table'),
          $tableWidget: $('#table-widget'),
          rightColumn: [4, 5, 6, 7],
          excel: {
            fileName: 'PartCountMerged',
            format: [
              'text',
              'text',
              'text',
              'text',
              '0',
              'text',
              'text',
              'text',
            ],
          },
        })

      servkit.initDatePicker(context.$date)
      servkit.initSelectWithList(
        context.preCon.getMachineByGroup,
        context.$machineSelect
      )

      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()
        context.loadingBtn.doing()

        context.getData(
          context.$machineSelect.val(),
          context.$date.val(),
          function (exhalable) {
            const tableData = []
            let start_part_count
            Object.values(exhalable.exhalable).forEach(
              ({ shiftdata_for_monitor, part_count_merged }) => {
                start_part_count = shiftdata_for_monitor[0].partcount
                part_count_merged.forEach((data) => {
                  tableData.push([
                    servkit.getMachineName(data.machine_id),
                    //              data.date,
                    data.work_shift,
                    data.program_name,
                    // data.op,
                    data.product_id,
                    // (data.std_minute ? data.std_minute.toFixed(2) : data.std_minute),
                    data.part_count - start_part_count + 1,
                    // data.first_timestamp.date20BitsToFormatted(),
                    data.first_on_timestamp.date20BitsToFormatted(),
                    context.getNextDataStartTimeAsEndTime(
                      data.last_on_timestamp.date20BitsToFormatted()
                    ),
                    // data.last_timestamp.date20BitsToFormatted(),
                    data.operate_millisecond.millisecondToXXmXXs(),
                  ])
                })
              }
            )
            table.drawTable(tableData)
            table.showWidget()
            context.loadingBtn.done()
          }
        )
      })

      $('#showdemo').on('click', function (e) {
        e.preventDefault()
        context.$date.val('2016/04/15')
        context.$machineSelect.val(['Machine01', 'Machine02', 'Machine03'])
        context.$submitBtn.trigger('click')
      })
    },
    util: {
      $date: $('#date'),
      $machineSelect: $('#machine'),
      $submitBtn: $('#submit-btn'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      //YYYY/MM/DD HH:mm:ss + 2s 以下一筆資料開始時間(2秒後)作為當前資料的結束時間
      getNextDataStartTimeAsEndTime: function (time) {
        var orgDate = new Date(time)
        var millisecond = 1000
        var newDate = new Date(orgDate.getTime() + 2 * millisecond)
        return moment(newDate).format('YYYY/MM/DD HH:mm:ss')
      },
      initMachineSelect: function () {
        var machineSelectHtml = ''
        servkit.eachMachine(function (id, name) {
          machineSelectHtml +=
            '<option style="padding:3px 0 3px 3px;" value="' +
            id +
            '" selected>' +
            name +
            '</option>'
        })
        this.$machineSelect.append(machineSelectHtml)
        servkit.multiselectHeightOptimization(this.$machineSelect[0])
        this.$machineSelect
          .on('mousedown', servkit.multiselectWithoutCtrlMouseDown)
          .on('mousemove', servkit.multiselectWithoutCtrlMouseMove)
      },
      getData: function (machineList, date, callback) {
        hippo
          .newMashupExhaler()
          .space('shiftdata_for_monitor')

          .index('machine_id', machineList)
          .indexRange('date', date, date)

          .space('part_count_merged')
          .index('machine_id', machineList)
          .indexRange('date', date, date)
          .column('part_count_merged', 'machine_id')
          //            "date")
          .column('part_count_merged', 'work_shift')
          .column('part_count_merged', 'program_name')
          .column('part_count_merged', 'op')
          .column('part_count_merged', 'product_id')
          .column('part_count_merged', 'std_minute')
          .column('part_count_merged', 'part_count')
          .column('part_count_merged', 'first_timestamp')
          .column('part_count_merged', 'first_on_timestamp')
          .column('part_count_merged', 'last_on_timestamp')
          .column('part_count_merged', 'last_timestamp')
          .column('part_count_merged', 'operate_millisecond')
          .column('shiftdata_for_monitor', 'partcount')
          .mashupKey('machine_id', 'date', 'work_shift')
          .exhale(function (exhalable) {
            if (callback) {
              callback(exhalable)
            }
          })
      },
    },
    delayCondition: ['machineList'],
    preCondition: {
      getMachineByGroup: function (done) {
        this.commons.getMachineByGroup(done)
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
