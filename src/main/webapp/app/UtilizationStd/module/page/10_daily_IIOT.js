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
          rightColumn: [3, 4, 5, 6, 7, 8, 9],
          onDraw: function (tableData, pageData) {
            var chartConfig = {
              dataList: pageData,
              tickColor: 'black',
              barValueIndex: [8, 9],
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
              '0',
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
              tickColor: 'black',
              barValueIndex: [7, 8],
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
        var machineList = this.$machineSelect.val() || [],
          loadingBtn = this.loadingBtn,
          context = this
        loadingBtn.doing()

        hippo
          .newMashupExhaler()
          .space('utilization_time_detail:utd')
          .index('machine_id', machineList)
          .indexRange('date', this.$startDate.val(), this.$endDate.val())

          .space('utilization_time_detail_pure_comment:comment')
          .index('machine_id', machineList)
          .indexRange('date', this.$startDate.val(), this.$endDate.val())

          .space('part_count_merged:pcm')
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

          .column('comment', 'pure_comment')

          .mashupKey('group_id', 'machine_id', 'date', 'work_shift')
          .exhale(function (exhalable) {
            var operSum = 0
            var cutSum = 0
            var denominatorSum = 0
            var result = []

            exhalable.map(function (data, groupKeys) {
              if (data.utd.length == 0) {
                console.log(data)
                return null
              }

              var timeData = context.commons.millisecondExcludMillisecond(
                data.utd[0]
              )

              operSum += timeData.operate_millisecond
              cutSum += timeData.cutting_millisecond
              denominatorSum += context.commons.getDenominator(timeData)
              // because indicator have no program and cutting time ,partcount
              // use default 0 or other value will caue customer confuse
              // so change it to N.A.
              // 2017/01/25 by jaco

              var brand = servkit.getMachineBrand(timeData.machine_id)

              result.push([
                servkit.getMachineName(timeData.machine_id),
                timeData.date.date8BitsToSlashed(),
                timeData.work_shift,
                data.comment.length > 0 ? data.comment[0].pure_comment : 'N.A.',
                timeData.power_millisecond.millisecondToHHmmss(),
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
                  timeData.operate_millisecond /
                  context.commons.getDenominator(timeData)
                ).floatToPercentage(),
                brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
                  ? 'N.A.'
                  : (
                      timeData.cutting_millisecond /
                      context.commons.getDenominator(timeData)
                    ).floatToPercentage(),
              ])
            })

            detailTable.drawTable(result)

            var oeetitle1 = $('#detail-oee1').text()
            var oeetitel2 = $('#detail-oee2').text()

            $('#detail-info').text(
              'Avg. ' +
                oeetitle1 +
                ' : ' +
                (operSum / denominatorSum).floatToPercentage() +
                ' / ' +
                '       ' +
                oeetitel2 +
                ' : ' +
                (cutSum / denominatorSum).floatToPercentage()
            )

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
            var operSum = 0
            var cutSum = 0
            var denominatorSum = 0

            var result = exhalable.map(function (data, groupKeys) {
              var timeData = context.commons.millisecondExcludMillisecond(
                data.utws[0]
              )

              operSum += timeData.operate_millisecond
              cutSum += timeData.cutting_millisecond
              denominatorSum += context.commons.getDenominator(timeData)

              var brand = servkit.getMachineBrand(timeData.machine_id)

              return [
                servkit.getMachineName(timeData.machine_id),
                timeData.date.date8BitsToSlashed(),
                timeData.work_shift,
                timeData.power_millisecond.millisecondToHHmmss(),
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
                  timeData.operate_millisecond /
                  context.commons.getDenominator(timeData)
                ).floatToPercentage(),
                brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
                  ? 'N.A.'
                  : (
                      timeData.cutting_millisecond /
                      context.commons.getDenominator(timeData)
                    ).floatToPercentage(),
              ]
            })

            workShiftTable.drawTable(result)

            var oeetitle1 = $('#workshift-oee1').text()
            var oeetitel2 = $('#workshift-oee2').text()

            $('#workshift-info').text(
              'Avg. ' +
                oeetitle1 +
                ' : ' +
                (operSum / denominatorSum).floatToPercentage() +
                ' / ' +
                '       ' +
                oeetitel2 +
                ' : ' +
                (cutSum / denominatorSum).floatToPercentage()
            )

            detailTable.hideWidget()
            workShiftTable.showWidget()
            dayTable.hideWidget()

            loadingBtn.done()
          }
        )
        //        hippo.newMashupExhaler()
        //             .space("utilization_time_work_shift:utws")
        //             .index("machine_id", machineList)
        //             .indexRange("date", this.$startDate.val(), this.$endDate.val())
        //
        //             .space("part_count_merged:pcm")
        //             .index("machine_id", machineList)
        //             .indexRange("date", this.$startDate.val(), this.$endDate.val())
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
        //             });
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
          function (result, operSum, cutSum, denominatorSum) {
            dayTable.drawTable(result)

            //this.commons.updateAvg('#day-oee1','#day-oee2','#day-info',operSum,cutSum,denominatorSum);

            var oeetitle1 = $('#day-oee1').text()
            var oeetitel2 = $('#day-oee2').text()

            $('#day-info').text(
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

            detailTable.hideWidget()
            workShiftTable.hideWidget()
            dayTable.showWidget()

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
