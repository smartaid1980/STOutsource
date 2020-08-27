import {
  getPlantMachineOptionMap,
  renderPlantAndMachineSelect,
} from '../../../../js/servtech/module/servkit/form.js'

export default async function () {
  const plantMachineOptionMap = await getPlantMachineOptionMap()
  GoGoAppFun({
    gogo: function (context) {
      servkit.addChartExport('#charthead', '#bar-chart-all')

      var datepickerConfig = {
          dateFormat: 'yy/mm/dd',
          prevText: '<i class="fa fa-chevron-left"></i>',
          nextText: '<i class="fa fa-chevron-right"></i>',
        },
        detailTable = createReportTable({
          $tableElement: $('#detail-table'),
          $tableWidget: $('#detail-table-widget'),
          rightColumn: [4, 5, 6, 7, 8, 9, 10],
          onDraw: function (tableData, pageData) {
            var chartConfig = {
              dataList: pageData,
              tickColor: 'black',
              barValueIndex: [9, 10],
              xAxisLabelValueIndex: [0, 1, 2],
              yAxisLabel: $('#detail-oee1').text(),
            }
            context.commons.drawChart(context.$barChartEle, chartConfig)

            $('.dataTables_length').addClass('hide')
          },
          excel: {
            fileName: 'Machine Status History',
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
              'text',
              'text',
              'text',
            ],
          },
        }),
        workShiftTable = createReportTable({
          $tableElement: $('#work-shift-table'),
          $tableWidget: $('#work-shift-table-widget'),
          rightColumn: [3, 4, 5, 6, 7, 11, 12, 13, 14, 15, 16],
          onDraw: function (tableData, pageData) {
            var chartConfig = {
              dataList: pageData,
              tickColor: 'black',
              barValueIndex: [15, 16],
              xAxisLabelValueIndex: [0, 1, 2],
              yAxisLabel: $('#workshift-oee1').text(),
            }
            context.commons.drawChart(context.$barChartEle, chartConfig)

            $('.dataTables_length').addClass('hide')
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
              'text',
              'text',
              '0',
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
          rightColumn: [2, 3, 4, 5, 6, 7, 8, 9],
          onDraw: function (tableData, pageData) {
            var chartConfig = {
              dataList: pageData,
              tickColor: 'black',
              barValueIndex: [8, 9],
              xAxisLabelValueIndex: [0, 1],
              yAxisLabel: $('#day-oee1').text(),
            }
            context.commons.drawChart(context.$barChartEle, chartConfig)

            $('.dataTables_length').addClass('hide')
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
              '0',
              'text',
              'text',
              'text',
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
        context.$machineSelect
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
          startDate: '2016/04/01',
          endDate: '2016/04/19',
          plant: '__ALL',
          machines: ['Machine01', 'Machine02', 'Machine03'],
        }
      }
      $('#showdemo').on('click', function (e) {
        e.preventDefault()

        context.$startDate.val(showdemoConfig.startDate)
        context.$endDate.val(showdemoConfig.endDate)
        $('[name=dataName]').eq(2).click()
        context.$plantSelect.val(showdemoConfig.plant)
        context.$plantSelect.change()
        context.$machineSelect.val(showdemoConfig.machines)
        context.$submitBtn.click()
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
      detail: function (detailTable, workShiftTable, dayTable) {
        var context = this,
          startDate = context.$startDate.val(),
          endDate = context.$endDate.val(),
          machineList = context.$machineSelect.val() || [],
          loadingBtn = context.loadingBtn,
          productInfoMap = context.preCon.productInfo
        loadingBtn.doing()

        hippo
          .newMashupExhaler()
          .space('utilization_time_detail:utd')
          .index('machine_id', machineList)
          .indexRange('date', startDate, endDate)

          .space('part_count_merged:pcm')
          .index('machine_id', machineList)
          .indexRange('date', startDate, endDate)

          .space('product_work_utilization:pwu')
          .index('machine_id', machineList)
          .indexRange('date', startDate, endDate)

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

          .column('pwu', 'macro_idle_minute_array')

          .mashupKey('group_id', 'machine_id', 'date', 'work_shift')
          .exhale(function (exhalable) {
            var operSum = 0
            var cutSum = 0
            var downTimeSum = 0
            var denominatorSum = 0

            var result = exhalable.map(function (data, groupKeys) {
              if (!data.utd.length == 0) {
                var downTime = {}
                if (!data.pwu.length == 0) {
                  var macroIdle = JSON.parse(
                    data.pwu[0].macro_idle_minute_array
                  )
                  downTime.down_time_m2 =
                    macroIdle[2] == null ? 0 : macroIdle[2]
                  downTime.down_time_m3 =
                    macroIdle[3] == null ? 0 : macroIdle[3]
                } else {
                  downTime.down_time_m2 = 0
                  downTime.down_time_m3 = 0
                }

                var mergeDownTimeData = _.extend(data.utd[0], downTime)
                var timeData = context.commons.millisecondparseInt(
                  mergeDownTimeData
                )
                operSum += timeData.operate_millisecond
                cutSum += timeData.cutting_millisecond
                downTimeSum += timeData.down_time_m2 + timeData.down_time_m3
                denominatorSum += context.commons.getDenominator(timeData)
                // because indicator have no program and cutting time ,partcount
                // use default 0 or other value will caue customer confuse
                // so change it to N.A.
                // 2017/01/25 by jaco

                var brand = servkit.getMachineBrand(timeData.machine_id)
                var key =
                  timeData.machine_id + timeData.work_shift + timeData.date
                return [
                  servkit.getMachineName(timeData.machine_id),
                  timeData.date.date8BitsToSlashed(),
                  timeData.work_shift,
                  brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
                    ? 'N.A.'
                    : timeData.program_name,
                  timeData.power_millisecond.millisecondToHHmmss(),
                  timeData.operate_millisecond.millisecondToHHmmss(),
                  brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
                    ? 'N.A.'
                    : timeData.cutting_millisecond.millisecondToHHmmss(),
                  (
                    timeData.idle_millisecond + timeData.alarm_millisecond
                  ).millisecondToHHmmss(),
                  productInfoMap[key] == null
                    ? 'N.A.'
                    : productInfoMap[key].staff_name,
                  productInfoMap[key] == null
                    ? 'N.A.'
                    : productInfoMap[key].order_id,
                  productInfoMap[key] == null
                    ? 'N.A.'
                    : productInfoMap[key].part_id,
                  productInfoMap[key] == null
                    ? 'N.A.'
                    : productInfoMap[key].std_hours,
                  brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
                    ? 'N.A.'
                    : data.pcm.length,
                  productInfoMap[key] == null
                    ? 'N.A.'
                    : productInfoMap[key].ng_quantity,
                  brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') !=
                    -1 || productInfoMap[key] == null
                    ? 'N.A.'
                    : data.pcm.length - productInfoMap[key].ng_quantity,
                  (
                    timeData.operate_millisecond /
                    context.commons.getDenominator(timeData)
                  ).floatToPercentage(),
                  brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
                    ? 'N.A.'
                    : (
                        timeData.cutting_millisecond /
                        context.commons.getDenominator(timeData)
                      ).floatToPercentage(),
                  timeData.down_time_m2.millisecondToHHmmss(),
                  timeData.down_time_m3.millisecondToHHmmss(),
                  (
                    (timeData.operate_millisecond +
                      timeData.down_time_m2 +
                      timeData.down_time_m3) /
                    context.commons.getDenominator(timeData)
                  ).floatToPercentage(),
                ]
              }
            })

            result = result.filter(function (element) {
              return element !== undefined
            })

            detailTable.drawTable(result)

            var oeetitle1 = $('#detail-oee1').text()
            var oeetitel2 = $('#detail-oee2').text()
            var oeetitel3 = $('#detail-oee3').text()

            $('#detail-info').text(
              'Avg. ' +
                oeetitle1 +
                ' : ' +
                (operSum / denominatorSum).floatToPercentage() +
                ' / ' +
                '       ' +
                oeetitel2 +
                ' : ' +
                (cutSum / denominatorSum).floatToPercentage() +
                ' / ' +
                '       ' +
                oeetitel3 +
                ' : ' +
                ((operSum + downTimeSum) / denominatorSum).floatToPercentage()
            )

            detailTable.showWidget()
            workShiftTable.hideWidget()
            dayTable.hideWidget()

            loadingBtn.done()
          })
      },
      workShift: function (detailTable, workShiftTable, dayTable) {
        var context = this,
          machineList = context.$machineSelect.val() || [],
          loadingBtn = context.loadingBtn,
          startDate = context.$startDate.val(),
          endDate = context.$endDate.val(),
          productInfoMap = context.preCon.productInfo
        loadingBtn.doing()

        var allmachine = servkit.getMachineList()
        hippo
          .newSimpleExhaler()
          .space('product_work_utilization')
          .index('machine_id', allmachine)
          .indexRange('date', startDate, endDate)
          .columns(
            'machine_id',
            'date',
            'work_shift',
            'macro_idle_minute_array'
          )
          .exhale(function (exhalable) {
            var groupData = _.groupBy(exhalable.exhalable, function (obj) {
              return obj.machine_id + ',' + obj.date + ',' + obj.work_shift
            })
            var downTimeDays = {}
            _.map(groupData, function (arrObj, key) {
              var sumDownTimeM2 = 0
              var sumDownTimeM3 = 0
              _.each(arrObj, function (obj) {
                var downTime = JSON.parse(obj.macro_idle_minute_array)
                sumDownTimeM2 += downTime[2] == null ? 0 : downTime[2]
                sumDownTimeM3 += downTime[3] == null ? 0 : downTime[3]
              })
              downTimeDays[key] = {
                down_time_m2: sumDownTimeM2,
                down_time_m3: sumDownTimeM3,
              }
            })

            context.commons.composeDayReport(
              startDate,
              endDate,
              machineList,
              function (exhalable) {
                servkit.ajax(
                  {
                    url: 'api/downtimeanalysis/machineidle/getworkshiftrange',
                    type: 'GET',
                    data: {
                      startDate: context.$startDate.val().replace(/\//g, ''),
                      endDate: context.$endDate.val().replace(/\//g, ''),
                    },
                  },
                  {
                    success: function (shiftData) {
                      var operSum = 0
                      var cutSum = 0
                      var downTimeSum = 0
                      var denominatorSum = 0
                      var result = exhalable.map(function (data, groupKeys) {
                        var mergeDownTimeData = _.extend(
                          data.utws[0],
                          downTimeDays[groupKeys]
                        )
                        var timeData = context.commons.millisecondExcludMillisecond(
                          mergeDownTimeData
                        )
                        var shiftTime
                        _.each(shiftData[timeData.date], function (shift) {
                          if (shift.name == timeData.work_shift) {
                            shiftTime = shift.totalMillisecond + 1000
                          }
                        })
                        if (shiftTime - timeData.power_millisecond < 0) {
                          shiftTime = 0
                        } else {
                          shiftTime = shiftTime - timeData.power_millisecond
                        }
                        operSum += timeData.operate_millisecond
                        cutSum += timeData.cutting_millisecond
                        downTimeSum +=
                          timeData.down_time_m2 + timeData.down_time_m3
                        denominatorSum += context.commons.getDenominator(
                          timeData
                        )

                        var brand = servkit.getMachineBrand(timeData.machine_id)
                        var key =
                          timeData.machine_id +
                          timeData.work_shift +
                          timeData.date
                        return [
                          servkit.getMachineName(timeData.machine_id),
                          timeData.date.date8BitsToSlashed(),
                          timeData.work_shift,
                          timeData.power_millisecond.millisecondToHHmmss(),
                          timeData.operate_millisecond.millisecondToHHmmss(),
                          brand
                            .valueOf()
                            .toUpperCase()
                            .indexOf('INDICATORLAMP') != -1
                            ? 'N.A.'
                            : timeData.cutting_millisecond.millisecondToHHmmss(),
                          (
                            timeData.idle_millisecond +
                            timeData.alarm_millisecond
                          ).millisecondToHHmmss(),
                          shiftTime.millisecondToHHmmss(),
                          productInfoMap[key] == null
                            ? 'N.A.'
                            : productInfoMap[key].staff_name,
                          productInfoMap[key] == null
                            ? 'N.A.'
                            : productInfoMap[key].order_id,
                          productInfoMap[key] == null
                            ? 'N.A.'
                            : productInfoMap[key].part_id,
                          productInfoMap[key] == null
                            ? 'N.A.'
                            : productInfoMap[key].std_hours,
                          brand
                            .valueOf()
                            .toUpperCase()
                            .indexOf('INDICATORLAMP') != -1
                            ? 'N.A.'
                            : data.pcm.length,
                          productInfoMap[key] == null
                            ? 'N.A.'
                            : productInfoMap[key].ng_quantity,
                          brand
                            .valueOf()
                            .toUpperCase()
                            .indexOf('INDICATORLAMP') != -1 ||
                          productInfoMap[key] == null
                            ? 'N.A.'
                            : data.pcm.length - productInfoMap[key].ng_quantity,
                          (
                            timeData.operate_millisecond /
                            context.commons.getDenominator(timeData)
                          ).floatToPercentage(),
                          brand
                            .valueOf()
                            .toUpperCase()
                            .indexOf('INDICATORLAMP') != -1
                            ? 'N.A.'
                            : (
                                timeData.cutting_millisecond /
                                context.commons.getDenominator(timeData)
                              ).floatToPercentage(),
                          timeData.down_time_m2.millisecondToHHmmss(),
                          timeData.down_time_m3.millisecondToHHmmss(),
                          (
                            (timeData.operate_millisecond +
                              timeData.down_time_m2 +
                              timeData.down_time_m3) /
                            context.commons.getDenominator(timeData)
                          ).floatToPercentage(),
                        ]
                      })

                      workShiftTable.drawTable(result)

                      var oeetitle1 = $('#workshift-oee1').text()
                      var oeetitel2 = $('#workshift-oee2').text()
                      var oeetitel3 = $('#workshift-oee3').text()

                      $('#workshift-info').text(
                        'Avg. ' +
                          oeetitle1 +
                          ' : ' +
                          (operSum / denominatorSum).floatToPercentage() +
                          ' / ' +
                          '       ' +
                          oeetitel2 +
                          ' : ' +
                          (cutSum / denominatorSum).floatToPercentage() +
                          ' / ' +
                          '       ' +
                          oeetitel3 +
                          ' : ' +
                          (
                            (operSum + downTimeSum) /
                            denominatorSum
                          ).floatToPercentage()
                      )
                      detailTable.hideWidget()
                      workShiftTable.showWidget()
                      dayTable.hideWidget()

                      loadingBtn.done()
                    },
                    fail: function (data) {},
                  }
                )

                //        hippo.newMashupExhaler()
                //             .space("utilization_time_work_shift:utws")
                //             .index("machine_id", machineList)
                //             .indexRange("date", that.$startDate.val(), that.$endDate.val())
                //
                //             .space("part_count_merged:pcm")
                //             .index("machine_id", machineList)
                //             .indexRange("date", context.$startDate.val(), context.$endDate.val())
                //
                //             .column("utws", "machine_id")
                //             .column("utws", "date")
                //             .column("utws", "work_shift")
                //             .column("utws", "power_millisecond")
                //             .column("utws", "operate_millisecond")
                //             .column("utws", "cutting_millisecond")
                //             .column("utws", "idle_millisecond")
                //             .column("utws", "alarm_millisecond")
                //             .column("utws", "work_shift_millisecond")
                //
                //             .column("pcm", "part_count")
                //             .column("pcm", "operate_millisecond")
                //
                //             .mashupKey("machine_id", "date", "work_shift")
                //             .exhale(function (exhalable) {
                //               var result = exhalable.map(function (data, groupKeys) {
                //                              var timeData = data.utws[0];
                //                              return [
                //                                      servkit.getMachineName(timeData.machine_id),
                //                                      timeData.date.date8BitsToSlashed(),
                //                                      timeData.work_shift,
                //                                      timeData.power_millisecond.millisecondToHHmmss(),
                //                                      timeData.operate_millisecond.millisecondToHHmmss(),
                //                                      timeData.cutting_millisecond.millisecondToHHmmss(),
                //                                      (timeData.idle_millisecond + timeData.alarm_millisecond).millisecondToHHmmss(),
                //                                      data.pcm.length,
                //                                      (timeData.operate_millisecond / timeData.work_shift_millisecond).floatToPercentage(),
                //                                      (timeData.cutting_millisecond / timeData.work_shift_millisecond).floatToPercentage()
                //                                     ];
                //                            });
                //                workShiftTable.drawTable(result);
                //
                //                detailTable.hideWidget();
                //                workShiftTable.showWidget();
                //                dayTable.hideWidget();
                //
                //                loadingBtn.done();
              }
            )
          })
      },
      day: function (detailTable, workShiftTable, dayTable) {
        var context = this
        var machineList = context.$machineSelect.val() || [],
          startDate = context.$startDate.val(),
          endDate = context.$endDate.val(),
          loadingBtn = context.loadingBtn
        loadingBtn.doing()

        var allmachine = servkit.getMachineList()
        hippo
          .newSimpleExhaler()
          .space('product_work_utilization')
          .index('machine_id', allmachine)
          .indexRange('date', startDate, endDate)
          .columns(
            'machine_id',
            'date',
            'work_shift',
            'macro_idle_minute_array'
          )
          .exhale(function (exhalable) {
            var groupData = _.groupBy(exhalable.exhalable, function (obj) {
              return obj.machine_id + obj.date
            })
            var downTimeDays = {}
            _.map(groupData, function (arrObj, key) {
              var sumDownTimeM2 = 0
              var sumDownTimeM3 = 0
              _.each(arrObj, function (obj) {
                var downTime = JSON.parse(obj.macro_idle_minute_array)
                sumDownTimeM2 += downTime[2] == null ? 0 : downTime[2]
                sumDownTimeM3 += downTime[3] == null ? 0 : downTime[3]
              })
              downTimeDays[key] = {
                down_time_m2: sumDownTimeM2,
                down_time_m3: sumDownTimeM3,
              }
            })
            context.commons.composeDayReportForCosmos(
              startDate,
              endDate,
              machineList,
              context.commons.composeDayReportCallBackForCosmos,
              function (result, operSum, cutSum, denominatorSum, downTimeSum) {
                dayTable.drawTable(result)

                //this.commons.updateAvg('#day-oee1','#day-oee2','#day-info',operSum,cutSum,denominatorSum);

                var oeetitle1 = $('#day-oee1').text()
                var oeetitel2 = $('#day-oee2').text()
                var oeetitel3 = $('#day-oee3').text()

                $('#day-info').text(
                  'Avg. ' +
                    oeetitle1 +
                    ' : ' +
                    (operSum / denominatorSum).floatToPercentage() +
                    ' / ' +
                    '      ' +
                    oeetitel2 +
                    ' : ' +
                    (cutSum / denominatorSum).floatToPercentage() +
                    ' / ' +
                    '      ' +
                    oeetitel3 +
                    ' : ' +
                    (
                      (operSum + downTimeSum) /
                      denominatorSum
                    ).floatToPercentage()
                )
                detailTable.hideWidget()
                workShiftTable.hideWidget()
                dayTable.showWidget()

                loadingBtn.done()
              },
              downTimeDays
            )
          })
      },
    },
    preCondition: {
      productInfo: function (done) {
        servkit.ajax(
          {
            url: 'api/cosmos/product/readall',
            type: 'GET',
            contentType: 'application/json',
          },
          {
            success: function (data) {
              var map = {}
              _.map(data, function (elem) {
                var key = elem.machine_id + elem.work_shift + elem.date
                map[key] = elem
              })
              done(map)
            },
            fail: function (data) {
              console.warn(data)
            },
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
