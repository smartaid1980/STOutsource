export default function () {
  GoGoAppFun({
    gogo: function (context) {
      var datepickerConfig = {
        dateFormat: 'yy/mm/dd',
        prevText: '<i class="fa fa-chevron-left"></i>',
        nextText: '<i class="fa fa-chevron-right"></i>',
      }
      context.reporttable = createReportTable({
        $tableElement: $('#table'),
        $tableWidget: $('#table-widget'),
        rightColumn: [6, 7, 8, 9, 10, 11, 12],
      })

      context.$date
        .datepicker(datepickerConfig)
        .val(moment().format('YYYY/MM/DD'))
      servkit.initMachineSelect(context.$machineSelect)
      servkit.initSelectWithList(
        context.preCon.getShiftList,
        context.$shiftSelect
      )

      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()
        context.loadingBtn.doing()
        context.getData()
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
      $shiftSelect: $('#shift'),
      $submitBtn: $('#submit-btn'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      reporttable: undefined,
      getData: function () {
        var context = this

        hippo
          .newSimpleExhaler()
          .space('part_count_merged')
          .index('machine_id', [context.$machineSelect.val()])
          .indexRange('date', context.$date.val(), context.$date.val())
          .columns(
            'machine_id',
            //elem.date,
            'work_shift',
            'macro521',
            'macro522',
            'macro523',
            'op',
            //"std_minute",
            'part_count',
            'first_timestamp',
            'first_on_timestamp',
            'last_on_timestamp',
            'last_timestamp',
            'operate_millisecond'
          )
          .exhale(function (exhalable) {
            var shift = context.$shiftSelect.val()
            var exhalableFilteredByShift = _.filter(
              exhalable.exhalable,
              function (elem) {
                return elem.work_shift == shift
              }
            )
            var tableData = _.map(exhalableFilteredByShift, function (elem) {
              var orderOrSampleObj = context.commons.getOrderIdOrSampleId(
                context.preCon.getGroupedProductList,
                context.preCon.getGroupedProductList,
                elem.macro523
              )
              elem.macro521 = context.commons.fillZeroTo5Digit(elem.macro521)
              return [
                //機台
                servkit.getMachineName(elem.machine_id),
                //班次
                elem.work_shift,
                //elem.date,
                //人員編號
                elem.macro521,
                //人員姓名
                context.commons.getUserName(
                  context.preCon.getUserList,
                  elem.macro521
                ),
                //訂單
                orderOrSampleObj.order_id,
                //管編
                orderOrSampleObj.sample_id,
                //製程
                elem.op,
                //                  (elem.std_minute ? elem.std_minute.toFixed(2) : elem.std_minute),
                elem.part_count,
                elem.first_timestamp.date20BitsToFormatted(),
                elem.first_on_timestamp.date20BitsToFormatted(),
                elem.last_on_timestamp.date20BitsToFormatted(),
                elem.last_timestamp.date20BitsToFormatted(),
                elem.operate_millisecond.millisecondToXXmXXs(),
              ]
            })

            context.reporttable.drawTable(tableData)
            context.loadingBtn.done()
          })
      },
    },
    preCondition: {
      getUserList: function (done) {
        this.commons.getUserList(done)
      },
      getShiftList: function (done) {
        this.commons.getShiftList(done)
      },
      getGroupedProductList: function (done) {
        this.commons.getGroupedProductList(done)
      },
      getGroupedSampleList: function (done) {
        this.commons.getGroupedProductList(done)
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
