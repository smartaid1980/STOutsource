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
          rightColumn: [3, 4, 5, 6, 7, 8, 9],
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
            table.drawTable(
              _.map(exhalable.exhalable, function (elem) {
                return [
                  servkit.getMachineName(elem.machine_id),
                  //              elem.date,
                  elem.work_shift,
                  elem.program_name,
                  elem.op,
                  // elem.product_id,
                  // (elem.std_minute ? elem.std_minute.toFixed(2) : elem.std_minute),
                  elem.part_count,
                  elem.first_timestamp.date20BitsToFormatted(),
                  elem.first_on_timestamp.date20BitsToFormatted(),
                  elem.last_on_timestamp.date20BitsToFormatted(),
                  elem.last_timestamp.date20BitsToFormatted(),
                  elem.operate_millisecond.millisecondToXXmXXs(),
                ]
              })
            )
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
          .newSimpleExhaler()
          .space('part_count_merged')
          .index('machine_id', machineList)
          .indexRange('date', date, date)
          .columns(
            'machine_id',
            //            "date",
            'work_shift',
            'program_name',
            'op',
            'product_id',
            'std_minute',
            'part_count',
            'first_timestamp',
            'first_on_timestamp',
            'last_on_timestamp',
            'last_timestamp',
            'operate_millisecond'
          )
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
