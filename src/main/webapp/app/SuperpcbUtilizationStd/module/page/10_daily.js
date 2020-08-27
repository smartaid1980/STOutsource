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
          dateFormat: 'yy/mm/dd',
          prevText: '<i class="fa fa-chevron-left"></i>',
          nextText: '<i class="fa fa-chevron-right"></i>',
        },
        detailTable = createReportTable({
          $tableElement: $('#detail-table'),
          $tableWidget: $('#detail-table-widget'),
          autoWidth: false,
          rightColumn: [4, 5, 6, 7],
          customBtns: [
            '<label class="input"><i class="icon-append glyphicon glyphicon-eye-open"></i> 稼動率小於 : <input type="text" class="detail-filter"></label>',
          ],
          onDraw: function (tableData, pageData) {
            var chartConfig = {
              dataList: pageData,
              tickColor: 'black',
              barValueIndex: [7],
              xAxisLabelValueIndex: [0, 1, 2],
              yAxisLabel: $('#detail-oee1').text(),
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
              parseFloat(data[7].replace('%', '')) < context.filterLine
            ) {
              $(row).css('color', 'red')
            }
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
              '0',
              'text',
              'text',
            ],
          },
        }),
        workShiftTable = createReportTable({
          $tableElement: $('#work-shift-table'),
          $tableWidget: $('#work-shift-table-widget'),
          rightColumn: [3, 4, 5, 6],
          customBtns: [
            '<label class="input"><i class="icon-append glyphicon glyphicon-eye-open"></i> 稼動率小於 : <input type="text" class="workshift-filter"></label>',
          ],
          onDraw: function (tableData, pageData) {
            var chartConfig = {
              dataList: pageData,
              tickColor: 'black',
              barValueIndex: [6],
              xAxisLabelValueIndex: [0, 1, 2],
              yAxisLabel: $('#workshift-oee1').text(),
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
                  axisLabel: $('#workshift-oee1').text(),
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
              parseFloat(data[6].replace('%', '')) < context.filterLine
            ) {
              $(row).css('color', 'red')
            }
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
              '0',
              'text',
              'text',
            ],
          },
        }),
        dayTable = createReportTable({
          $tableElement: $('#day-table'),
          $tableWidget: $('#day-table-widget'),
          rightColumn: [2, 3, 4, 5],
          customBtns: [
            '<label class="input"><i class="icon-append glyphicon glyphicon-eye-open"></i> 稼動率小於 : <input type="text" class="day-filter"></label>',
          ],
          onDraw: function (tableData, pageData) {
            var chartConfig = {
              dataList: pageData,
              tickColor: 'black',
              barValueIndex: [5],
              xAxisLabelValueIndex: [0, 1],
              yAxisLabel: $('#day-oee1').text(),
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
                      var tick = _.map([0, 1], function (index) {
                        return ele[index]
                      }).join('</br>')
                      return [i, tick]
                    })
                  },
                },
                yaxis: {
                  min: 0,
                  max: 100,
                  axisLabel: $('#day-oee1').text(),
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
            fileName: 'UtilizationDay',
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

      /*
       $("tbody").append('<tr style="font-weight:bolder;color:green;">' +
       '<td colspan="8"></td>' +
       '<td class="text-right"> ' + '平均'+ '</td>'+
       '<td id="avgEff" class="text-right"> ' + '---' + '%</td>'+
       '<td id="avgeff" class="text-right"> ' + '---' + '%</td></tr>');
       */

      context.$startDate
        .datepicker(datepickerConfig)
        .val(moment(new Date()).format('YYYY/MM/DD'))
      context.$endDate
        .datepicker(datepickerConfig)
        .val(moment(new Date()).format('YYYY/MM/DD'))
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
          context.$startDate.val() +
          ' - ' +
          context.$endDate.val() +
          ' ' +
          funcName +
          ' ( ' +
          datamode +
          ' / ' +
          denominator +
          ' )'
        $('#bar-chart-title').text(title)

        var reportType = $('input[name="dataName"]:checked').val()
        context[reportType](detailTable, workShiftTable, dayTable)
      })

      $('.detail-filter').on('change', function (event) {
        var curFilter = $(event.target).val()
        context.filterFunc(detailTable, curFilter)
      })
      $('.workshift-filter').on('change', function (event) {
        var curFilter = $(event.target).val()
        context.filterFunc(workShiftTable, curFilter)
      })
      $('.day-filter').on('change', function (event) {
        var curFilter = $(event.target).val()
        context.filterFunc(dayTable, curFilter)
      })
    },
    util: {
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $machineSelect: $('#machine'),
      $plantSelect: $('#plantAreaForm'),
      $barChartEle: $('#bar-chart'),
      $submitBtn: $('#submit-btn'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      result: [],
      dataCheck: false,
      operSum: 0,
      denominatorSum: 0,
      cutSum: 0,
      filterLine: 0,
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
      detail: function (detailTable, workShiftTable, dayTable) {
        var machineList = this.$machineSelect.val() || [],
          loadingBtn = this.loadingBtn,
          context = this,
          cutdays = context.cutDays(this.$startDate.val(), this.$endDate.val()),
          daytag = 0
        context.operSum = 0
        context.cutSum = 0
        context.denominatorSum = 0
        context.result = []
        loadingBtn.doing()
        context.dataCheck = false
        console.log(cutdays)
        // machineList = ["ALL", "_SCSDFB001D01M01", "_SCSDFB001D01M02", "_SCSDFB001D01M03", "_SCSDFB001D01M04", "_SCSDFB001D01M05"]

        var newMashupFuc = function (
          daytag,
          cutdays,
          machineList,
          hippo,
          context,
          detailTable
        ) {
          hippo
            .newSimpleExhaler()
            .space('utilization_time_detail')
            .index('machine_id', machineList)
            .indexRange('date', cutdays[daytag].start, cutdays[daytag].end)
            .columns(
              'machine_id',
              'date',
              'power_millisecond',
              'operate_millisecond',
              'idle_millisecond',
              'alarm_millisecond',
              'work_shift_millisecond',
              'program_name',
              'work_shift'
            )
            .exhale(function (exhalable) {
              var operSum = 0
              var cutSum = 0
              var denominatorSum = 0
              var result = []

              exhalable.map(function (data, groupKeys) {
                context.dataCheck = true
                if (data.length === 0) return null
                var timeData = context.commons.millisecondparseInt(data)

                operSum += timeData.operate_millisecond
                cutSum += timeData.cutting_millisecond
                denominatorSum += context.commons.getDenominator(timeData)
                // because indicator have no program and cutting time ,partcount
                // use default 0 or other value will caue customer confuse
                // so change it to N.A.
                // 2017/01/25 by jaco

                var brand = servkit.getMachineBrand(timeData.machine_id)
                var funcbrand = _.find(
                  servkit.getAppFuncBindingBrandMachineMap(),
                  (obj) => {
                    return (
                      obj.app_id === 'UtilizationStd' &&
                      obj.func_id == '10_daily' &&
                      obj.device_id === timeData.machine_id
                    )
                  }
                )
                if (
                  funcbrand != undefined &&
                  ((funcbrand.not_default_key != undefined &&
                    funcbrand.not_default_key.includes(
                      'cutting_millisecond'
                    )) ||
                    (funcbrand.not_default_key != undefined &&
                      funcbrand.not_default_key.includes('part_count')))
                ) {
                  result.push([
                    servkit.getMachineName(timeData.machine_id),
                    timeData.date.date8BitsToSlashed(),
                    timeData.work_shift,
                    brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
                      ? 'N.A.'
                      : timeData.program_name,
                    timeData.power_millisecond.millisecondToHHmmss(),
                    timeData.operate_millisecond.millisecondToHHmmss(),
                    (
                      timeData.idle_millisecond + timeData.alarm_millisecond
                    ).millisecondToHHmmss(),
                    (
                      timeData.operate_millisecond /
                      context.commons.getDenominator(timeData)
                    ).floatToPercentage(),
                  ])
                } else {
                  result.push([
                    servkit.getMachineName(timeData.machine_id),
                    timeData.date.date8BitsToSlashed(),
                    timeData.work_shift,
                    brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
                      ? 'N.A.'
                      : timeData.program_name,
                    timeData.power_millisecond.millisecondToHHmmss(),
                    timeData.operate_millisecond.millisecondToHHmmss(),
                    (
                      timeData.idle_millisecond + timeData.alarm_millisecond
                    ).millisecondToHHmmss(),
                    (
                      timeData.operate_millisecond /
                      context.commons.getDenominator(timeData)
                    ).floatToPercentage(),
                  ])
                }
              })
              context.result = context.result.concat(result)
              detailTable.appendTable(context.result, result)
              // detailTable.drawTable(result);
              context.operSum += operSum
              context.cutSum += cutSum
              context.denominatorSum += denominatorSum
              var oeetitle1 = $('#detail-oee1').text()
              var oeetitel2 = $('#detail-oee2').text() //operSum / denominatorSum cutSum

              $('#detail-info').text(
                `${i18n('10_Average')} : ` +
                  (context.operSum / context.denominatorSum).floatToPercentage()
              )
              //daytag, cutdays, machineList, hippo, context, detailTable
              if (daytag < cutdays.length - 1) {
                daytag += 1
                newMashupFuc(
                  daytag,
                  cutdays,
                  machineList,
                  hippo,
                  context,
                  detailTable
                )
              } else {
                if (!context.dataCheck) {
                  $('#dialog-no-data').dialog('open')
                  detailTable.table.clear().draw()
                }
                loadingBtn.done()
              }
            })
        }
        detailTable.table.clear()
        workShiftTable.table.clear()
        dayTable.table.clear()
        detailTable.showWidget()
        workShiftTable.hideWidget()
        dayTable.hideWidget()
        newMashupFuc(daytag, cutdays, machineList, hippo, context, detailTable)
      },
      workShift: function (detailTable, workShiftTable, dayTable) {
        var machineList = this.$machineSelect.val() || [],
          loadingBtn = this.loadingBtn,
          context = this,
          cutdays = context.cutDays(this.$startDate.val(), this.$endDate.val()),
          daytag = 0
        context.operSum = 0
        context.cutSum = 0
        context.denominatorSum = 0
        context.result = []
        loadingBtn.doing()
        console.log(cutdays)
        var newMashupFuc = function (
          daytag,
          cutdays,
          machineList,
          hippo,
          context,
          workShiftTable
        ) {
          context.commons.composeDayReport(
            cutdays[daytag].start,
            cutdays[daytag].end,
            machineList,
            function (exhalable) {
              var operSum = 0
              var cutSum = 0
              var denominatorSum = 0
              var result = []

              exhalable.map(function (data, groupKeys) {
                var timeData = context.commons.millisecondExcludMillisecond(
                  data
                )

                operSum += timeData.operate_millisecond
                cutSum += timeData.cutting_millisecond
                denominatorSum += context.commons.getDenominator(timeData)

                var brand = servkit.getMachineBrand(timeData.machine_id)
                var funcbrand = _.find(
                  servkit.getAppFuncBindingBrandMachineMap(),
                  (obj) => {
                    return (
                      obj.app_id === 'UtilizationStd' &&
                      obj.func_id == '10_daily' &&
                      obj.device_id === timeData.machine_id
                    )
                  }
                )
                if (
                  funcbrand != undefined &&
                  ((funcbrand.not_default_key != undefined &&
                    funcbrand.not_default_key.includes(
                      'cutting_millisecond'
                    )) ||
                    (funcbrand.not_default_key != undefined &&
                      funcbrand.not_default_key.includes('part_count')))
                ) {
                  result.push([
                    servkit.getMachineName(timeData.machine_id),
                    timeData.date.date8BitsToSlashed(),
                    timeData.work_shift,
                    timeData.power_millisecond.millisecondToHHmmss(),
                    timeData.operate_millisecond.millisecondToHHmmss(),
                    (
                      timeData.idle_millisecond + timeData.alarm_millisecond
                    ).millisecondToHHmmss(),
                    (
                      timeData.operate_millisecond /
                      context.commons.getDenominator(timeData)
                    ).floatToPercentage(),
                  ])
                } else {
                  result.push([
                    servkit.getMachineName(timeData.machine_id),
                    timeData.date.date8BitsToSlashed(),
                    timeData.work_shift,
                    timeData.power_millisecond.millisecondToHHmmss(),
                    timeData.operate_millisecond.millisecondToHHmmss(),
                    (
                      timeData.idle_millisecond + timeData.alarm_millisecond
                    ).millisecondToHHmmss(),
                    (
                      timeData.operate_millisecond /
                      context.commons.getDenominator(timeData)
                    ).floatToPercentage(),
                  ])
                }
              })
              context.result = context.result.concat(result)
              workShiftTable.appendTable(context.result, result)
              context.operSum += operSum
              context.cutSum += cutSum
              context.denominatorSum += denominatorSum

              var oeetitle1 = $('#workshift-oee1').text()
              var oeetitel2 = $('#workshift-oee2').text()

              $('#workshift-info').text(
                `${i18n('10_Average')} ` +
                  oeetitle1 +
                  ' : ' +
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
                  workShiftTable
                )
              } else {
                loadingBtn.done()
              }
            }
          )
        }
        detailTable.table.clear()
        workShiftTable.table.clear()
        dayTable.table.clear()
        detailTable.hideWidget()
        workShiftTable.showWidget()
        dayTable.hideWidget()
        newMashupFuc(
          daytag,
          cutdays,
          machineList,
          hippo,
          context,
          workShiftTable
        )
      },
      day: function (detailTable, workShiftTable, dayTable) {
        var machineList = this.$machineSelect.val() || [],
          loadingBtn = this.loadingBtn,
          context = this,
          cutdays = context.cutDays(this.$startDate.val(), this.$endDate.val()),
          daytag = 0
        context.operSum = 0
        context.cutSum = 0
        context.denominatorSum = 0
        context.result = []
        loadingBtn.doing()
        console.log(cutdays)
        var newMashupFuc = function (
          daytag,
          cutdays,
          machineList,
          hippo,
          context,
          dayTable
        ) {
          context.commons.composeDayReport(
            cutdays[daytag].start,
            cutdays[daytag].end,
            machineList,
            context.commons.composeDayReportCallBack,
            function (result, operSum, cutSum, denominatorSum) {
              context.result = context.result.concat(result)
              dayTable.appendTable(context.result, result)
              context.operSum += operSum
              context.cutSum += cutSum
              context.denominatorSum += denominatorSum

              //this.commons.updateAvg('#day-oee1','#day-oee2','#day-info',operSum,cutSum,denominatorSum);

              var oeetitle1 = $('#day-oee1').text()
              var oeetitel2 = $('#day-oee2').text()

              $('#day-info').text(
                `${i18n('10_Average')} ` +
                  oeetitle1 +
                  ' : ' +
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
                  dayTable
                )
              } else {
                loadingBtn.done()
              }
            }
          )
        }
        detailTable.table.clear()
        workShiftTable.table.clear()
        dayTable.table.clear()
        detailTable.hideWidget()
        workShiftTable.hideWidget()
        dayTable.showWidget()
        newMashupFuc(daytag, cutdays, machineList, hippo, context, dayTable)
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
