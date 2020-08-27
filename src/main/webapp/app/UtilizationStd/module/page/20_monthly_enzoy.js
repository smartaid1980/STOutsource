import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      var datepickerConfig = {
          dateFormat: 'yy/mm',
          prevText: '<i class="fa fa-chevron-left"></i>',
          nextText: '<i class="fa fa-chevron-right"></i>',
        },
        reportTable = createReportTable({
          $tableElement: $('#report-table'),
          $tableWidget: $('#report-table-widget'),
          rightColumn: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
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
            fileName: 'UtilizationMonthly',
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
        .val(moment().format('YYYY/MM'))
      servkit.initSelectWithList(
        context.preCon.getMachineByGroup,
        context.$machineSelect
      )

      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()
        context.renderTable(reportTable)
      })
    },
    util: {
      $startDate: $('#start-date'),
      $machineSelect: $('#machine'),
      $barChartEle: $('#bar-chart'),
      $submitBtn: $('#submit-btn'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      renderTable: function (reportTable) {
        var machineList = this.$machineSelect.val() || [],
          selectedMonth = this.$startDate.val(),
          startDate = moment(selectedMonth)
            .startOf('month')
            .format('YYYY/MM/DD'),
          endDate = moment(selectedMonth).endOf('month').format('YYYY/MM/DD'),
          loadingBtn = this.loadingBtn
        loadingBtn.doing()

        this.commons.composeDayReportACHB(
          startDate,
          endDate,
          machineList,
          this.commons.composeDayReportCallBackACHB,
          function (dataMatrix) {
            reportTable.drawTable(dataMatrix)
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
