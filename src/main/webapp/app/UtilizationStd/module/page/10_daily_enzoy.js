import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      var datepickerConfig = {
          dateFormat: 'yy/mm/dd',
          prevText: '<i class="fa fa-chevron-left"></i>',
          nextText: '<i class="fa fa-chevron-right"></i>',
        },
        detailTable = createReportTable({
          $tableElement: $('#detail-table'),
          $tableWidget: $('#detail-table-widget'),
          rightColumn: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
          onDraw: function (tableData, pageData) {
            var chartConfig = {
              dataList: pageData,
              barValueIndex: [12, 13, 14, 15],
              xAxisLabelValueIndex: [0, 1, 2],
              yAxisLabel: `${i18n('Utilization')}`,
            }
            context.commons.drawChart(context.$barChartEle, chartConfig)
          },
          excel: {
            fileName: 'UtilizationDetail',
            format: [
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              '0',
              'text',
              'text',
              'text',
              'text',
            ],
          },
        }),
        workShiftTable = createReportTable({
          $tableElement: $('#work-shift-table'),
          $tableWidget: $('#work-shift-table-widget'),
          rightColumn: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
          onDraw: function (tableData, pageData) {
            var chartConfig = {
              dataList: pageData,
              barValueIndex: [11, 12, 13, 14],
              xAxisLabelValueIndex: [0, 1, 2],
              yAxisLabel: `${i18n('Utilization')}`,
            }
            context.commons.drawChart(context.$barChartEle, chartConfig)
          },
          excel: {
            fileName: 'UtilizationWorkShift',
            format: [
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              '0',
              'text',
              'text',
              'text',
              'text',
            ],
          },
        }),
        dayTable = createReportTable({
          $tableElement: $('#day-table'),
          $tableWidget: $('#day-table-widget'),
          rightColumn: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
          onDraw: function (tableData, pageData) {
            var chartConfig = {
              dataList: pageData,
              barValueIndex: [10, 11, 12, 13],
              xAxisLabelValueIndex: [0, 1],
              yAxisLabel: `${i18n('Utilization')}`,
            }
            context.commons.drawChart(context.$barChartEle, chartConfig)
          },
          excel: {
            fileName: 'UtilizationDay',
            format: [
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              '0',
              'text',
              'text',
              'text',
              'text',
            ],
          },
        })

      context.$startDate
        .datepicker(datepickerConfig)
        .val(moment().format('YYYY/MM/DD'))
      context.$endDate
        .datepicker(datepickerConfig)
        .val(moment().format('YYYY/MM/DD'))
      servkit.initSelectWithList(
        context.preCon.getMachineByGroup,
        context.$machineSelect
      )

      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()

        try {
          context.loadingBtn.doing()
          var reportType = $('input[name="dataName"]:checked').val()
          context[reportType](detailTable, workShiftTable, dayTable)
        } catch (e) {
          context.loadingBtn.done()
        }
      })

      $('#showdemo').on('click', function (e) {
        e.preventDefault()
        context.$startDate.val('2016/04/01')
        context.$endDate.val('2016/04/19')
        context.$machineSelect.val(['Machine01', 'Machine02', 'Machine03'])
        context.$submitBtn.trigger('click')
      })
    },
    util: {
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $machineSelect: $('#machine'),
      $barChartEle: $('#bar-chart'),
      $submitBtn: $('#submit-btn'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      detail: function (detailTable, workShiftTable, dayTable) {
        var machineList = this.$machineSelect.val() || [],
          loadingBtn = this.loadingBtn

        hippo
          .newMashupExhaler()
          .space('utilization_time_detail:utd')
          .index('machine_id', machineList)
          .indexRange('date', this.$startDate.val(), this.$endDate.val())

          .space('part_count_merged:pcm')
          .index('machine_id', machineList)
          .indexRange('date', this.$startDate.val(), this.$endDate.val())

          .space('utilization_invalid_time_detail:uitd')
          .index('machine_id', machineList)
          .indexRange('date', this.$startDate.val(), this.$endDate.val())

          .column('utd', 'machine_id')
          .column('utd', 'date')
          .column('utd', 'work_shift')
          .column('utd', 'program_name')
          .column('utd', 'power_millisecond')
          .column('utd', 'operate_millisecond')
          .column('utd', 'cutting_millisecond')
          .column('utd', 'idle_millisecond')
          .column('utd', 'alarm_millisecond')
          .column('utd', 'work_shift_millisecond')

          .column('pcm', 'part_count')
          .column('pcm', 'operate_millisecond')

          .column('uitd', 'invalid_millisecond')
          .column('uitd', 'operate_duration')
          .column('uitd', 'other_duration')

          .mashupKey('group_id', 'machine_id', 'date', 'work_shift')
          .exhale(function (exhalable) {
            var result = []
            exhalable.each(function (data, groupKeys) {
              var timeData = data.utd[0]
              var invalid_millisecond =
                data.uitd[0] && _.isNumber(data.uitd[0].invalid_millisecond)
                  ? data.uitd[0].invalid_millisecond
                  : 0
              var operate_duration =
                data.uitd[0] && _.isNumber(data.uitd[0].operate_duration)
                  ? data.uitd[0].operate_duration
                  : 0
              var other_duration =
                data.uitd[0] && _.isNumber(data.uitd[0].other_duration)
                  ? data.uitd[0].other_duration
                  : 0
              if (timeData) {
                var date = timeData.date.date8BitsToSlashed()
                result.push([
                  servkit.getMachineName(timeData.machine_id),
                  date,
                  timeData.work_shift,
                  timeData.program_name,
                  timeData.power_millisecond.millisecondToHHmmss(),
                  timeData.operate_millisecond.millisecondToHHmmss(),
                  timeData.cutting_millisecond.millisecondToHHmmss(),
                  (
                    timeData.idle_millisecond + timeData.alarm_millisecond
                  ).millisecondToHHmmss(),
                  moment(date) > moment('2017/03/17')
                    ? 'N.A'
                    : invalid_millisecond.millisecondToHHmmss(),
                  moment(date) < moment('2017/03/17')
                    ? 'N.A'
                    : operate_duration.millisecondToHHmmss(),
                  moment(date) < moment('2017/03/17')
                    ? 'N.A'
                    : other_duration.millisecondToHHmmss(),
                  data.pcm.length,
                  (
                    timeData.operate_millisecond /
                    timeData.work_shift_millisecond
                  ).floatToPercentage(),
                  (
                    timeData.cutting_millisecond /
                    timeData.work_shift_millisecond
                  ).floatToPercentage(),
                  moment(date) > moment('2017/03/17')
                    ? 'N.A'
                    : (
                        timeData.operate_millisecond /
                        (timeData.operate_millisecond + invalid_millisecond)
                      ).floatToPercentage(),
                  moment(date) < moment('2017/03/17')
                    ? 'N.A'
                    : (
                        (timeData.operate_millisecond - operate_duration) /
                        (timeData.operate_millisecond -
                          operate_duration +
                          other_duration)
                      ).floatToPercentage(),
                ])
              }
            })
            detailTable.drawTable(result)

            detailTable.showWidget()
            workShiftTable.hideWidget()
            dayTable.hideWidget()

            loadingBtn.done()
          })
      },
      workShift: function (detailTable, workShiftTable, dayTable) {
        var machineList = this.$machineSelect.val() || [],
          loadingBtn = this.loadingBtn

        this.commons.composeDayReportACHB(
          this.$startDate.val(),
          this.$endDate.val(),
          machineList,
          function (exhalable) {
            var result = []
            exhalable.each(function (data, groupKeys) {
              var timeData = data.utws[0]
              var invalid_millisecond =
                data.uitws[0] && _.isNumber(data.uitws[0].invalid_millisecond)
                  ? data.uitws[0].invalid_millisecond
                  : 0
              var operate_duration =
                data.uitws[0] && _.isNumber(data.uitws[0].operate_duration)
                  ? data.uitws[0].operate_duration
                  : 0
              var other_duration =
                data.uitws[0] && _.isNumber(data.uitws[0].other_duration)
                  ? data.uitws[0].other_duration
                  : 0
              if (timeData) {
                var date = timeData.date.date8BitsToSlashed()
                result.push([
                  servkit.getMachineName(timeData.machine_id),
                  date,
                  timeData.work_shift,
                  timeData.power_millisecond.millisecondToHHmmss(),
                  timeData.operate_millisecond.millisecondToHHmmss(),
                  timeData.cutting_millisecond.millisecondToHHmmss(),
                  (
                    timeData.idle_millisecond + timeData.alarm_millisecond
                  ).millisecondToHHmmss(),
                  moment(date) > moment('2017/03/17')
                    ? 'N.A'
                    : invalid_millisecond.millisecondToHHmmss(),
                  moment(date) < moment('2017/03/17')
                    ? 'N.A'
                    : operate_duration.millisecondToHHmmss(),
                  moment(date) < moment('2017/03/17')
                    ? 'N.A'
                    : other_duration.millisecondToHHmmss(),
                  data.pcm.length,
                  (
                    timeData.operate_millisecond /
                    timeData.work_shift_millisecond
                  ).floatToPercentage(),
                  (
                    timeData.cutting_millisecond /
                    timeData.work_shift_millisecond
                  ).floatToPercentage(),
                  moment(date) > moment('2017/03/17')
                    ? 'N.A'
                    : (
                        timeData.operate_millisecond /
                        (timeData.operate_millisecond + invalid_millisecond)
                      ).floatToPercentage(),
                  moment(date) < moment('2017/03/17')
                    ? 'N.A'
                    : (
                        (timeData.operate_millisecond - operate_duration) /
                        (timeData.operate_millisecond -
                          operate_duration +
                          other_duration)
                      ).floatToPercentage(),
                ])
              }
            })
            workShiftTable.drawTable(result)

            detailTable.hideWidget()
            workShiftTable.showWidget()
            dayTable.hideWidget()

            loadingBtn.done()
          }
        )
      },
      day: function (detailTable, workShiftTable, dayTable) {
        var machineList = this.$machineSelect.val() || [],
          startDate = this.$startDate.val(),
          endDate = this.$endDate.val(),
          loadingBtn = this.loadingBtn

        this.commons.composeDayReportACHB(
          startDate,
          endDate,
          machineList,
          this.commons.composeDayReportCallBackACHB,
          function (result) {
            dayTable.drawTable(result)

            detailTable.hideWidget()
            workShiftTable.hideWidget()
            dayTable.showWidget()

            loadingBtn.done()
          }
        )
      },
    },
    delayCondition: ['machineList'],
    preCondition: {
      getMachineByGroup: function (done) {
        //{machineId1: machineName1, ...}
        this.commons.getMachineByGroup(done)
      },
    },
    dependencies: [
      [
        '/js/plugin/flot/jquery.flot.cust.min.js',
        '/js/plugin/flot/jquery.flot.resize.min.js',
        '/js/plugin/flot/jquery.flot.fillbetween.min.js',
        '/js/plugin/flot/jquery.flot.orderBar.min.js',
        '/js/plugin/flot/jquery.flot.pie.min.js',
        '/js/plugin/flot/jquery.flot.tooltip.min.js',
        '/js/plugin/flot/jquery.flot.axislabels.js',
      ],
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
