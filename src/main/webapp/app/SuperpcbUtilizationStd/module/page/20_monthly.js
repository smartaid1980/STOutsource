import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
import {
  renderPlantAndMachineSelect,
  getPlantMachineOptionMap,
} from '../../../../js/servtech/module/servkit/form.js'
export default async function () {
  const plantMachineOptionMap = await getPlantMachineOptionMap()
  GoGoAppFun({
    gogo: function (context) {
      if (servtechConfig.ST_UI_UTILIZATION_LARGEFONT) {
        $('#widget-grid').addClass('big-widget-grid')
      }
      servkit.addChartExport('#charthead', '#bar-chart-all')

      var datepickerConfig = {
          dateFormat: 'yy/mm',
          prevText: '<i class="fa fa-chevron-left"></i>',
          nextText: '<i class="fa fa-chevron-right"></i>',
        },
        reportTable = createReportTable({
          $tableElement: $('#report-table'),
          $tableWidget: $('#report-table-widget'),
          rightColumn: [2, 3, 4, 5],
          customBtns: [
            '<label class="input"><i class="icon-append glyphicon glyphicon-eye-open"></i> 稼動率小於 : <input type="text" class="day-filter"></label>',
          ],
          onDraw: function (tableData, pageData) {
            var chartConfig = {
              dataList: pageData,
              barValueIndex: [5],
              tickColor: 'black',
              xAxisLabelValueIndex: [0, 1],
              yAxisLabel: $('#month-oee1').text(),
            }
            if (servtechConfig.ST_UI_UTILIZATION_LARGEFONT) {
              var option = {
                xaxis: {
                  font: {
                    size: 20,
                    color: '#333',
                  },
                  ticks: function () {
                    return _.map(pageData, function (ele, i) {
                      var tick = _.map([0, 1, 2], function (index) {
                        return ele[index]
                      }).join('</br>')
                      return [i, tick]
                    })
                  },
                },
                yaxis: {
                  min: 0,
                  max: 100,
                  axisLabel: $('#detail-oee1').text(),
                  axisLabelFontSizePixels: 20,
                  axisLabelFontFamily:
                    'Microsoft JhengHei", Helvetica, Arial, sans-serif',
                },
              }
              context.commons.drawChart(
                context.$barChartEle,
                chartConfig,
                option
              )
            } else {
              context.commons.drawChart(context.$barChartEle, chartConfig)
            }
            $('.dataTables_length').addClass('hide')
          },
          onRow: function (row, data) {
            if (
              context.filterLine != '' &&
              parseFloat(data[5].replace('%', '')) < context.filterLine
            ) {
              $(row).css('color', 'red')
            }
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
        context.$machineSelect,
        context.appId,
        context.funId
      )

      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()

        var funcName = $('#funcName').text().replace('>', ' ')
        var denominator = $('input[name="denominator"]:checked')
          .next()
          .next()
          .text()
        var datamode = $('input[name="dataName"]:checked').next().next().text()
        var title =
          context.$startDate.val() + ' ' + funcName + ' ( ' + denominator + ' )'
        $('#bar-chart-title').text(title)

        context.renderTable(reportTable)
      })

      $('.day-filter').on('change', function (event) {
        var curFilter = $(event.target).val()
        context.filterFunc(reportTable, curFilter)
      })
    },
    util: {
      $startDate: $('#start-date'),
      $plantSelect: $('#plantAreaForm'),
      $machineSelect: $('#machine'),
      $barChartEle: $('#bar-chart'),
      $submitBtn: $('#submit-btn'),
      cutDays: function (start, end) {
        const diffDays = moment.duration(moment(end).diff(start)).asDays()
        const format = 'YYYY/MM/DD'
        const tempStart = moment(start),
          tempEnd = moment(end)
        const cutdays = []
        while (diffDays > 3) {
          if (moment.duration(moment(tempEnd).diff(tempStart)).asDays() > 3) {
            cutdays.push({
              start: tempStart.format(format).toString(),
              end: tempStart.add(2, 'days').format(format).toString(),
            })
            tempStart.add(1, 'days')
          } else {
            cutdays.push({
              start: tempStart.format(format).toString(),
              end: tempEnd.format(format).toString(),
            })
            break
          }
        }
        if (diffDays < 4)
          cutdays.push({
            start: start,
            end: end,
          })
        return cutdays
      },
      result: [],
      operSum: 0,
      cutSum0: 0,
      denominatorSum: 0,
      filterLine: 0,
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      renderTable: function (reportTable) {
        var machineList = this.$machineSelect.val() || [],
          selectedMonth = this.$startDate.val(),
          startDate = moment(selectedMonth)
            .startOf('month')
            .format('YYYY/MM/DD'),
          endDate = moment(selectedMonth).endOf('month').format('YYYY/MM/DD'),
          loadingBtn = this.loadingBtn,
          context = this,
          cutdays = context.cutDays(startDate, endDate),
          daytag = 0
        context.operSum = 0
        context.cutSum = 0
        context.denominatorSum = 0
        context.result = []
        console.log(cutdays)
        loadingBtn.doing()
        var newMashupFuc = function (
          daytag,
          cutdays,
          machineList,
          hippo,
          context,
          reportTable
        ) {
          context.commons.composeDayReport(
            cutdays[daytag].start,
            cutdays[daytag].end,
            machineList,
            context.commons.composeDayReportCallBack,
            function (dataMatrix, operSum, cutSum, denominatorSum) {
              console.log(dataMatrix)
              context.result = context.result.concat(dataMatrix)
              if (dataMatrix.length !== 0)
                reportTable.appendTable(context.result, dataMatrix)
              context.operSum += operSum
              context.cutSum += cutSum
              context.denominatorSum += denominatorSum

              console.log(
                ' sum ' + operSum + ' , ' + cutSum + ' , ' + denominatorSum
              )

              var oeetitle1 = $('#month-oee1').text()
              var oeetitel2 = $('#month-oee2').text()

              console.log('title :' + oeetitle1 + ' ' + oeetitel2)

              $('#month-info').text(
                `${i18n('10_Average')} : ` +
                  (context.operSum / context.denominatorSum).floatToPercentage()
              )
              if (daytag < cutdays.length - 1) {
                daytag += 1
                newMashupFuc(
                  daytag,
                  cutdays,
                  machineList,
                  hippo,
                  context,
                  reportTable
                )
              } else {
                loadingBtn.done()
              }
            }
          )
        }
        reportTable.table.clear()
        reportTable.showWidget()
        newMashupFuc(daytag, cutdays, machineList, hippo, context, reportTable)
      },
      filterFunc: function (table, val) {
        var context = this
        var float = 0.0
        float = parseFloat(val)
        if (isNaN(float) && val !== '') {
          $('#dialog-no-data').text('輸入內容無法判斷')
          $('#dialog-no-data').dialog('open')
        }
        context.filterLine = float
        table.table.clear()
        table.drawTable(context.result)
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
