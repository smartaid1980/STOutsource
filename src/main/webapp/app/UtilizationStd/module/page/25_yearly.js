import {
  getPlantMachineOptionMap,
  renderPlantAndMachineSelect,
} from '../../../../js/servtech/module/servkit/form.js'

export default async function () {
  const plantMachineOptionMap = await getPlantMachineOptionMap()
  GoGoAppFun({
    gogo: function (context) {
      servkit.addChartExport('#charthead', '#bar-chart')

      var datepickerConfig = {
        dateFormat: 'yy/mm',
        prevText: '<i class="fa fa-chevron-left"></i>',
        nextText: '<i class="fa fa-chevron-right"></i>',
      }

      var reportTable = createReportTable({
        $tableElement: $('#report-table'),
        $tableWidget: $('#report-table-widget'),
        rightColumn: [1, 2, 3, 4, 5, 6, 7],
        onDraw: function (tableData, pageData) {
          var chartConfig = {
            dataList: pageData,
            barValueIndex: [6, 7],
            tickColor: 'black',
            xAxisLabelValueIndex: [0],
            yAxisLabel: $('#month-oee1').text(),
          }
          context.commons.drawChart(context.$barChartEle, chartConfig)

          $('.dataTables_length').addClass('hide')
        },
        excel: {
          fileName: 'UtilizationAnnual',
          format: [
            'text',
            'text',
            'text',
            'text',
            'text',
            'text',
            '0',
            'text',
            'text',
          ],
        },
      })

      context.$startDate
        .datepicker(datepickerConfig)
        .val(moment(new Date()).format('YYYY/MM'))
      renderPlantAndMachineSelect(
        plantMachineOptionMap,
        context.$plantSelect,
        context.$machineSelect
      )

      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()

        var funcName = servkit.appMap[context.appId][context.funId].func_name
        var denominator = $('input[name="denominator"]:checked')
          .next()
          .next()
          .text()
        var title =
          context.$startDate.val() +
          ' ' +
          funcName.replace(/^\d+ /g, '') +
          ' ( ' +
          denominator +
          ' )'
        $('#bar-chart-title').text(title)

        context.renderTable(reportTable)
      })

      var showdemoConfig
      try {
        showdemoConfig = servkit.showdemoConfig[context.appId][context.funId]
      } catch (e) {
        console.warn(e)
      } finally {
        showdemoConfig = showdemoConfig || {
          month: '2016/04',
          plant: '__ALL',
          machines: ['Machine01', 'Machine02', 'Machine03'],
        }
      }
      $('#showdemo').on('click', function (e) {
        e.preventDefault()

        context.$startDate.val(showdemoConfig.month)
        context.$plantSelect.val(showdemoConfig.plant)
        context.$plantSelect.change()
        context.$machineSelect.val(showdemoConfig.machines)
        context.$submitBtn.click()
      })
    },
    util: {
      $startDate: $('#start-date'),
      $plantSelect: $('#plantAreaForm'),
      $machineSelect: $('#machine'),
      $barChartEle: $('#bar-chart'),
      $submitBtn: $('#submit-btn'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      renderTable: function (reportTable) {
        var machineList = this.$machineSelect.val() || []
        var selectedMonth = this.$startDate.val()
        var startDate = moment(selectedMonth)
          .startOf('month')
          .format('YYYY/MM/DD')
        var endDate = moment(selectedMonth).endOf('month').format('YYYY/MM/DD')
        var loadingBtn = this.loadingBtn
        loadingBtn.doing()

        this.commons.composeMonthReport(
          startDate,
          endDate,
          machineList,
          this.commons.composeMonthReportCallBack,
          function (dataMatrix, operSum, cutSum, denominatorSum) {
            reportTable.drawTable(dataMatrix)
            var oeetitle1 = $('#month-oee1').text()
            var oeetitel2 = $('#month-oee2').text()

            $('#month-info').text(
              'Avg. ' +
                oeetitle1 +
                ' : ' +
                (operSum / denominatorSum).floatToPercentage() +
                ' / ' +
                '      ' +
                oeetitel2 +
                ' : ' +
                (cutSum / denominatorSum).floatToPercentage()
            )

            loadingBtn.done()
          }
        )
      },
    },
    preCondition: {},
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
