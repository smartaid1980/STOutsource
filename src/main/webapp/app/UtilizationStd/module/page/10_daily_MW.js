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
          dateFormat: 'yy/mm/dd',
          prevText: '<i class="fa fa-chevron-left"></i>',
          nextText: '<i class="fa fa-chevron-right"></i>',
        },
        detailTableConfig = {
          $tableElement: $('#detail-table'),
          $tableWidget: $('#detail-table-widget'),
          autoWidth: false,
          rightColumn: [4, 5, 6, 7, 8, 9, 10, 11, 12],
          customBtns: [
            '<label class="input"><i class="icon-append glyphicon glyphicon-eye-open"></i> 稼動率小於 : <input type="text" class="detail-filter"></label>',
          ],
          onDraw: function (tableData, pageData) {
            var chartConfig = {
              dataList: pageData,
              tickColor: 'black',
              barValueIndex: [11, 12],
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
              parseFloat(data[11].replace('%', '')) < context.filterLine
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
              'text',
              'text',
              '0',
              'text',
              'text',
            ],
          },
        },
        workShiftTableConfig = {
          $tableElement: $('#work-shift-table'),
          $tableWidget: $('#work-shift-table-widget'),
          rightColumn: [3, 4, 5, 6, 7, 8, 9, 10, 11],
          customBtns: [
            '<label class="input"><i class="icon-append glyphicon glyphicon-eye-open"></i> 稼動率小於 : <input type="text" class="workshift-filter"></label>',
          ],
          onDraw: function (tableData, pageData) {
            var chartConfig = {
              dataList: pageData,
              tickColor: 'black',
              barValueIndex: [10, 11],
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
              parseFloat(data[10].replace('%', '')) < context.filterLine
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
              'text',
              'text',
              '0',
              'text',
              'text',
            ],
          },
        },
        dayTableConfig = {
          $tableElement: $('#day-table'),
          $tableWidget: $('#day-table-widget'),
          rightColumn: [2, 3, 4, 5, 6, 7, 8, 9, 10],
          customBtns: [
            '<label class="input"><i class="icon-append glyphicon glyphicon-eye-open"></i> 稼動率小於 : <input type="text" class="day-filter"></label>',
          ],
          onDraw: function (tableData, pageData) {
            var chartConfig = {
              dataList: pageData,
              tickColor: 'black',
              barValueIndex: [9, 10],
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
              parseFloat(data[9].replace('%', '')) < context.filterLine
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
              'text',
              'text',
              '0',
              'text',
              'text',
            ],
          },
        },
        detailTable,
        workShiftTable,
        dayTable

      if (
        !servtechConfig.ST_UI_UTILIZATION_PARTCOUNT &&
        servtechConfig.ST_UI_UTILIZATION_PARTCOUNT !== undefined
      ) {
        detailTableConfig.hideCols = [10]
        workShiftTableConfig.hideCols = [9]
        dayTableConfig.hideCols = [8]
      }
      detailTable = createReportTable(detailTableConfig)
      workShiftTable = createReportTable(workShiftTableConfig)
      dayTable = createReportTable(dayTableConfig)
      detailTable.table.columns([5, 6]).visible(false)
      workShiftTable.table.columns([4, 5]).visible(false)
      dayTable.table.columns([3, 4]).visible(false)
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

      var showdemoConfig
      try {
        showdemoConfig = servkit.showdemoConfig[context.appId][context.funId]
      } catch (e) {
        console.warn(e)
      } finally {
        showdemoConfig = showdemoConfig || {
          startDate: '2018/06/01',
          endDate: '2018/07/08',
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

        context.$startDate.val(showdemoConfig.startDate)
        context.$endDate.val(showdemoConfig.endDate)
        $('[name=dataName]').eq(0).click()
        context.$plantSelect.val(showdemoConfig.plant)
        context.$plantSelect.change()
        context.$machineSelect.val(showdemoConfig.machines)
        context.$submitBtn.click()
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
      effectiveDenominatorSum: 0,
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
      hideColumns: function (thisTable, column) {
        var denominator = $('input[name="denominator"]:checked').val()
        var notHideColumn = column + 1
        if (denominator === 'power_millisecond') {
          notHideColumn = column
        } else if (denominator === 'natural_day') {
          notHideColumn = column + 2
        }
        thisTable.table
          .columns(_.without([column, column + 1, column + 2], notHideColumn))
          .visible(false)
        thisTable.table.columns(notHideColumn).visible(true)
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
        context.effectiveDenominatorSum = 0
        context.result = []
        loadingBtn.doing()
        context.dataCheck = false
        console.log(cutdays)
        // machineList = ["ALL", "_SCSDFB001D01M01", "_SCSDFB001D01M02", "_SCSDFB001D01M03", "_SCSDFB001D01M04", "_SCSDFB001D01M05"]
        this.hideColumns(detailTable, 4)
        var newMashupFuc = function (
          daytag,
          cutdays,
          machineList,
          hippo,
          context,
          detailTable
        ) {
          hippo
            .newMashupExhaler()
            .space('utilization_time_detail:utd')
            .index('machine_id', machineList)
            .indexRange('date', cutdays[daytag].start, cutdays[daytag].end)

            .space('part_count_merged:pcm')
            .index('machine_id', machineList)
            .indexRange('date', cutdays[daytag].start, cutdays[daytag].end)

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

            .mashupKey('group_id', 'machine_id', 'date', 'work_shift')
            .exhale(function (exhalable) {
              var operSum = 0
              var cutSum = 0
              var denominatorSum = 0
              var effectiveDenominatorSum = 0
              var result = []

              exhalable.map(function (data, groupKeys) {
                context.dataCheck = true
                if (data.utd.length === 0) return null
                var timeData = context.commons.millisecondparseInt(data.utd[0])
                var denominator = context.commons.getDenominator(timeData)

                operSum += timeData.operate_millisecond
                denominatorSum += denominator
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
                    !funcbrand.not_default_key.includes('cutting_millisecond')
                  ) {
                    cutSum += timeData.cutting_millisecond
                    effectiveDenominatorSum += denominator
                  }
                  result.push([
                    servkit.getMachineName(timeData.machine_id),
                    timeData.date.date8BitsToSlashed(),
                    timeData.work_shift,
                    brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
                      ? 'N.A.'
                      : timeData.program_name,
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
                      : data.pcm.length,
                    (
                      timeData.operate_millisecond / denominator
                    ).floatToPercentage(),
                    funcbrand.not_default_key.includes('cutting_millisecond')
                      ? '---'
                      : (
                          timeData.cutting_millisecond / denominator
                        ).floatToPercentage(),
                  ])
                } else {
                  if (
                    !(
                      brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') !=
                      -1
                    )
                  ) {
                    cutSum += timeData.cutting_millisecond
                    effectiveDenominatorSum += denominator
                  }
                  result.push([
                    servkit.getMachineName(timeData.machine_id),
                    timeData.date.date8BitsToSlashed(),
                    timeData.work_shift,
                    brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
                      ? 'N.A.'
                      : timeData.program_name,
                    timeData.power_millisecond.millisecondToHHmmss(),
                    timeData.work_shift_millisecond.millisecondToHHmmss(),
                    (24 * 60 * 60 * 1000).millisecondToHHmmss(),
                    timeData.operate_millisecond.millisecondToHHmmss(),
                    brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
                      ? 'N.A.'
                      : timeData.cutting_millisecond.millisecondToHHmmss(),
                    (
                      timeData.idle_millisecond + timeData.alarm_millisecond
                    ).millisecondToHHmmss(),
                    brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
                      ? 'N.A.'
                      : data.pcm.length,
                    (
                      timeData.operate_millisecond / denominator
                    ).floatToPercentage(),
                    brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
                      ? 'N.A.'
                      : (
                          timeData.cutting_millisecond / denominator
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
              context.effectiveDenominatorSum += effectiveDenominatorSum
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
                var oeetitle1 = $('#detail-oee1').text()
                var oeetitel2 = $('#detail-oee2').text() //operSum / denominatorSum cutSum

                $('#detail-info').text(
                  `${i18n('10_Average')} ` +
                    oeetitle1 +
                    ' : ' +
                    (
                      context.operSum / context.denominatorSum
                    ).floatToPercentage() +
                    ' / ' +
                    '       ' +
                    oeetitel2 +
                    ' : ' +
                    (
                      context.cutSum / context.effectiveDenominatorSum
                    ).floatToPercentage()
                )
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
        context.effectiveDenominatorSum = 0
        context.result = []
        loadingBtn.doing()
        console.log(cutdays)
        this.hideColumns(workShiftTable, 3)
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
              var effectiveDenominatorSum = 0
              var result = []

              exhalable.map(function (data, groupKeys) {
                var timeData = context.commons.millisecondExcludMillisecond(
                  data.utws[0]
                )
                var denominator = context.commons.getDenominator(timeData)

                operSum += timeData.operate_millisecond
                denominatorSum += denominator

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
                  result.push([
                    servkit.getMachineName(timeData.machine_id),
                    timeData.date.date8BitsToSlashed(),
                    timeData.work_shift,
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
                      : data.pcm.length,
                    (
                      timeData.operate_millisecond / denominator
                    ).floatToPercentage(),
                    funcbrand.not_default_key.includes('cutting_millisecond')
                      ? '---'
                      : (
                          timeData.cutting_millisecond / denominator
                        ).floatToPercentage(),
                  ])
                } else {
                  if (
                    !(
                      brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') !=
                      -1
                    )
                  ) {
                    cutSum += timeData.cutting_millisecond
                    effectiveDenominatorSum += denominator
                  }
                  result.push([
                    servkit.getMachineName(timeData.machine_id),
                    timeData.date.date8BitsToSlashed(),
                    timeData.work_shift,
                    timeData.power_millisecond.millisecondToHHmmss(),
                    timeData.work_shift_millisecond.millisecondToHHmmss(),
                    (24 * 60 * 60 * 1000).millisecondToHHmmss(),
                    timeData.operate_millisecond.millisecondToHHmmss(),
                    brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
                      ? 'N.A.'
                      : timeData.cutting_millisecond.millisecondToHHmmss(),
                    (
                      timeData.idle_millisecond + timeData.alarm_millisecond
                    ).millisecondToHHmmss(),
                    brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
                      ? 'N.A.'
                      : data.pcm.length,
                    (
                      timeData.operate_millisecond / denominator
                    ).floatToPercentage(),
                    brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
                      ? 'N.A.'
                      : (
                          timeData.cutting_millisecond / denominator
                        ).floatToPercentage(),
                  ])
                }
              })
              context.result = context.result.concat(result)
              workShiftTable.appendTable(context.result, result)
              context.operSum += operSum
              context.cutSum += cutSum
              context.denominatorSum += denominatorSum
              context.effectiveDenominatorSum += effectiveDenominatorSum

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
                var oeetitle1 = $('#workshift-oee1').text()
                var oeetitel2 = $('#workshift-oee2').text()

                $('#workshift-info').text(
                  `${i18n('10_Average')} ` +
                    oeetitle1 +
                    ' : ' +
                    (
                      context.operSum / context.denominatorSum
                    ).floatToPercentage() +
                    ' / ' +
                    '       ' +
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
        context.effectiveDenominatorSum = 0
        context.result = []
        loadingBtn.doing()
        console.log(cutdays)
        this.hideColumns(dayTable, 2)
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
              dayTable.appendTable(context.result, result)
              context.operSum += operSum
              context.cutSum += cutSum
              context.denominatorSum += denominatorSum
              context.effectiveDenominatorSum += effectiveDenominatorSum

              //this.commons.updateAvg('#day-oee1','#day-oee2','#day-info',operSum,cutSum,denominatorSum);

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
                var oeetitle1 = $('#day-oee1').text()
                var oeetitel2 = $('#day-oee2').text()

                $('#day-info').text(
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
