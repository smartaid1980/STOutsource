import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
import {
  getPlantMachineOptionMap,
  renderPlantAndMachineSelect,
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
        reportTableConfig = {
          $tableElement: $('#report-table'),
          $tableWidget: $('#report-table-widget'),
          rightColumn: [2, 3, 4, 5, 6, 7, 8, 9, 10],
          customBtns: [
            '<label class="input"><i class="icon-append glyphicon glyphicon-eye-open"></i> 稼動率小於 : <input type="text" class="day-filter"></label>',
          ],
          onDraw: function (tableData, pageData) {
            var chartConfig = {
              dataList: pageData,
              barValueIndex: [9, 10],
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
              parseFloat(data[9].replace('%', '')) < context.filterLine
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
              'text',
              'text',
              '0',
              'text',
              'text',
            ],
          },
        },
        reportTable

      if (
        !servtechConfig.ST_UI_UTILIZATION_PARTCOUNT &&
        servtechConfig.ST_UI_UTILIZATION_PARTCOUNT !== undefined
      ) {
        reportTableConfig.hideCols = [8]
      }
      reportTable = createReportTable(reportTableConfig)
      reportTable.table.columns([3, 4]).visible(false)

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

      var showdemoConfig
      try {
        showdemoConfig = servkit.showdemoConfig[context.appId][context.funId]
      } catch (e) {
        console.warn(e)
      } finally {
        showdemoConfig = showdemoConfig || {
          month: '2018/07',
          plant: '__ALL',
          machines: [
            '_FOXCONNP01D01M005',
            '_FOXCONNP01D01M006',
            '_FOXCONNP01D01M007',
          ],
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
      effectiveDenominatorSum: 0,
      filterLine: 0,
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      renderTable: function (reportTable) {
        var denominator = $('input[name="denominator"]:checked').val()
        var notHideColumn = 3
        if (denominator === 'power_millisecond') {
          notHideColumn = 2
        } else if (denominator === 'natural_day') {
          notHideColumn = 4
        }
        reportTable.table
          .columns(_.without([2, 3, 4], notHideColumn))
          .visible(false)
        reportTable.table.columns(notHideColumn).visible(true)

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
        context.effectiveDenominatorSum = 0
        context.result = []
        console.log(cutdays)
        loadingBtn.doing()
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
            function (exhalable) {
              var resultGroups = {}
              exhalable.each(function (data, groupKeys) {
                var timeData = data.utws[0],
                  groupKey = timeData.machine_id + timeData.date,
                  resultGroup = resultGroups[groupKey]

                if (resultGroup) {
                  resultGroup.power_millisecond += timeData.power_millisecond
                  resultGroup.operate_millisecond +=
                    timeData.operate_millisecond
                  resultGroup.cutting_millisecond +=
                    timeData.cutting_millisecond
                  resultGroup.idle_millisecond += timeData.idle_millisecond
                  resultGroup.alarm_millisecond += timeData.alarm_millisecond
                  resultGroup.work_shift_millisecond +=
                    timeData.work_shift_millisecond
                  resultGroup.part_count += data.pcm.length
                } else {
                  resultGroup = _.pick(
                    timeData,
                    'machine_id',
                    'date',
                    'power_millisecond',
                    'operate_millisecond',
                    'cutting_millisecond',
                    'idle_millisecond',
                    'alarm_millisecond',
                    'work_shift_millisecond'
                  )
                  resultGroup.part_count = data.pcm.length
                  resultGroups[groupKey] = resultGroup
                }
              })

              var operSum = 0
              var cutSum = 0
              var denominatorSum = 0
              var effectiveDenominatorSum = 0

              var result = _.chain(resultGroups)
                .values()
                .map(function (data) {
                  var timeData = context.commons.millisecondparseInt(data)
                  var denominator = context.commons.getDenominator(timeData)

                  operSum += timeData.operate_millisecond
                  denominatorSum += context.commons.getDenominator(timeData)
                  var brand = servkit.getMachineBrand(timeData.machine_id)
                  var funcbrand = _.find(
                    servkit.getAppFuncBindingBrandMachineMap(),
                    (obj) => {
                      return (
                        obj.app_id === 'UtilizationStd' &&
                        obj.func_id == '10_daily_MW' &&
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
                    if (
                      funcbrand.not_default_key.includes('cutting_millisecond')
                    ) {
                      cutSum += timeData.cutting_millisecond
                      effectiveDenominatorSum += denominator
                    }
                    return [
                      servkit.getMachineName(timeData.machine_id),
                      timeData.date.date8BitsToSlashed(),
                      timeData.power_millisecond.millisecondToHHmmss(),
                      timeData.work_shift_millisecond.millisecondToHHmmss(),
                      (24 * 60 * 60 * 1000).millisecondToHHmmss(),
                      timeData.operate_millisecond.millisecondToHHmmss(),
                      funcbrand.not_default_key.includes('cutting_millisecond')
                        ? '---'
                        : timeData.cutting_millisecond.millisecondToHHmmss(),
                      (
                        timeData.idle_millisecond + timeData.alarm_millisecond
                      ).millisecondToHHmmss(),
                      funcbrand.not_default_key.includes('part_count')
                        ? '---'
                        : timeData.part_count,
                      (
                        timeData.operate_millisecond /
                        context.commons.getDenominator(timeData)
                      ).floatToPercentage(),
                      funcbrand.not_default_key.includes('cutting_millisecond')
                        ? '---'
                        : (
                            timeData.cutting_millisecond /
                            context.commons.getDenominator(timeData)
                          ).floatToPercentage(),
                    ]
                  } else {
                    if (
                      !(
                        brand
                          .valueOf()
                          .toUpperCase()
                          .indexOf('INDICATORLAMP') != -1
                      )
                    ) {
                      cutSum += timeData.cutting_millisecond
                      effectiveDenominatorSum += denominator
                    }
                    return [
                      servkit.getMachineName(timeData.machine_id),
                      timeData.date.date8BitsToSlashed(),
                      timeData.power_millisecond.millisecondToHHmmss(),
                      timeData.work_shift_millisecond.millisecondToHHmmss(),
                      (24 * 60 * 60 * 1000).millisecondToHHmmss(),
                      timeData.operate_millisecond.millisecondToHHmmss(),
                      brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') !=
                      -1
                        ? 'N.A.'
                        : timeData.cutting_millisecond.millisecondToHHmmss(),
                      (
                        timeData.idle_millisecond + timeData.alarm_millisecond
                      ).millisecondToHHmmss(),
                      brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') !=
                      -1
                        ? 'N.A.'
                        : timeData.part_count,
                      (
                        timeData.operate_millisecond /
                        context.commons.getDenominator(timeData)
                      ).floatToPercentage(),
                      brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') !=
                      -1
                        ? 'N.A.'
                        : (
                            timeData.cutting_millisecond /
                            context.commons.getDenominator(timeData)
                          ).floatToPercentage(),
                    ]
                  }
                })
                .value()

              context.result = context.result.concat(result)
              if (result.length !== 0)
                reportTable.appendTable(context.result, result)
              context.operSum += operSum
              context.cutSum += cutSum
              context.denominatorSum += denominatorSum
              context.effectiveDenominatorSum += effectiveDenominatorSum

              console.log(
                ' sum ' + operSum + ' , ' + cutSum + ' , ' + denominatorSum
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
                var oeetitle1 = $('#month-oee1').text()
                var oeetitel2 = $('#month-oee2').text()

                console.log('title :' + oeetitle1 + ' ' + oeetitel2)
                $('#month-info').text(
                  `${i18n('10_Average')} ` +
                    oeetitle1 +
                    ' : ' +
                    (
                      context.operSum / context.denominatorSum
                    ).floatToPercentage() +
                    ' / ' +
                    '      ' +
                    oeetitel2 +
                    ' : ' +
                    (
                      context.cutSum / context.effectiveDenominatorSum
                    ).floatToPercentage()
                )
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
        if (isNaN(float)) {
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
