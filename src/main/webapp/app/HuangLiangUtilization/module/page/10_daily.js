import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      var detailTable = createReportTable({
          $tableElement: $('#detail-table'),
          $tableWidget: $('#detail-table-widget'),
          rightColumn: [4, 5, 6, 7, 8, 9, 10],
          onDraw: function (tableData, pageData) {
            var chartConfig = {
              dataList: pageData,
              barValueIndex: [9, 10],
              label: ['機台稼動率', `${i18n('Effective_Utiliziation')}`],
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
              'text',
              'text',
            ],
          },
        }),
        workShiftTable = createReportTable({
          $tableElement: $('#work-shift-table'),
          $tableWidget: $('#work-shift-table-widget'),
          rightColumn: [3, 4, 5, 6, 7, 8, 9],
          onDraw: function (tableData, pageData) {
            var chartConfig = {
              dataList: pageData,
              barValueIndex: [8, 9],
              label: ['機台稼動率', `${i18n('Effective_Utiliziation')}`],
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
            ],
          },
        }),
        dayTable = createReportTable({
          $tableElement: $('#day-table'),
          $tableWidget: $('#day-table-widget'),
          rightColumn: [2, 3, 4, 5, 6, 7, 8],
          onDraw: function (tableData, pageData) {
            var chartConfig = {
              dataList: pageData,
              barValueIndex: [7, 8],
              label: ['機台稼動率', `${i18n('Effective_Utiliziation')}`],
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
            ],
          },
        })

      servkit.initDatePicker(context.$startDate, context.$endDate)
      servkit.initMachineSelect(context.$machineSelect)
      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()
        var reportType = $('input[name="dataName"]:checked').val()
        context[reportType](detailTable, workShiftTable, dayTable)
      })

      $('#showdemo').on('click', function (e) {
        e.preventDefault()
        context.$startDate.val('2016/04/01')
        context.$endDate.val('2016/04/19')
        $('[name=dataName]').eq(2).click()
        context.$machineSelect.val(['Machine01', 'Machine02', 'Machine03'])
        context.$submitBtn.click()
      })

      context.commons.testMachineBtn()
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
          loadingBtn = this.loadingBtn,
          context = this
        loadingBtn.doing()

        hippo
          .newSimpleExhaler()
          .space('huangliang_utilization_time_detail')
          .index('machine_id', machineList)
          .indexRange('date', this.$startDate.val(), this.$endDate.val())
          .columns(
            'machine_id',
            'date',
            'work_shift_name',
            'program',
            'power_millisecond',
            'operate_millisecond',
            'cutting_millisecond',
            'downtime_millisecond',
            'offline_millisecond',
            'work_shift_millisecond'
          )
          .exhale(function (exhalable) {
            var result = exhalable.map(function (timeData, groupKeys) {
              timeData = context.commons.millisecondExcludMillisecond(timeData)

              return [
                servkit.getMachineName(timeData.machine_id),
                timeData.date.date8BitsToSlashed(),
                timeData.work_shift_name,
                timeData.program,
                timeData.power_millisecond.millisecondToHHmmss(),
                timeData.operate_millisecond.millisecondToHHmmss(),
                timeData.cutting_millisecond.millisecondToHHmmss(),
                timeData.downtime_millisecond.millisecondToHHmmss(),
                (
                  timeData.cutting_millisecond / timeData.operate_millisecond
                ).floatToPercentage(),
                (
                  timeData.operate_millisecond /
                  context.commons.getDenominator(timeData)
                ).floatToPercentage(),
                (
                  timeData.cutting_millisecond /
                  context.commons.getDenominator(timeData)
                ).floatToPercentage(),
              ]
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
          loadingBtn = this.loadingBtn,
          context = this
        loadingBtn.doing()

        this.commons.composeDayReport(
          this.$startDate.val(),
          this.$endDate.val(),
          machineList,
          function (exhalable) {
            var result = exhalable.map(function (timeData, groupKeys) {
              timeData = context.commons.millisecondExcludMillisecond(timeData)

              return [
                servkit.getMachineName(timeData.machine_id),
                timeData.date.date8BitsToSlashed(),
                timeData.work_shift_name,
                timeData.power_millisecond.millisecondToHHmmss(),
                timeData.operate_millisecond.millisecondToHHmmss(),
                timeData.cutting_millisecond.millisecondToHHmmss(),
                timeData.downtime_millisecond.millisecondToHHmmss(),
                (
                  timeData.cutting_millisecond / timeData.operate_millisecond
                ).floatToPercentage(),
                (
                  timeData.operate_millisecond /
                  context.commons.getDenominator(timeData)
                ).floatToPercentage(),
                (
                  timeData.cutting_millisecond /
                  context.commons.getDenominator(timeData)
                ).floatToPercentage(),
              ]
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
        loadingBtn.doing()

        this.commons.composeDayReport(
          startDate,
          endDate,
          machineList,
          this.commons.composeDayReportCallBack,
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
