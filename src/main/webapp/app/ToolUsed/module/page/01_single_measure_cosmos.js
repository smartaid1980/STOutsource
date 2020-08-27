import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      pageSetUp()
      var datepickerConfig = {
          dateFormat: 'yy/mm/dd',
          prevText: '<i class="fa fa-chevron-left"></i>',
          nextText: '<i class="fa fa-chevron-right"></i>',
        },
        dayTable = createReportTable({
          $tableElement: $('#date-table'),
          $tableWidget: $('#date-table-widget'),
          rightColumn: [8],
          onDraw: function (tableData, pageData) {
            //context.drawChart(tableData);
            var chartConfig = {
              dataList: pageData,
              barValueIndex: [6], //排除率欄位
              xAxisLabelValueIndex: [0, 1, 2, 3],
              yAxisLabel: `${i18n('Cutting_Time')}(s)`,
            }
            context.drawChart(context.$barChart, chartConfig)
          },
          excel: {
            fileName: 'singleMeasureDay',
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
        }),
        summaryTable = createReportTable({
          $tableElement: $('#summary-table'),
          $tableWidget: $('#summary-table-widget'),
          rightColumn: [4],
          onDraw: function (tableData, pageData) {
            //context.drawChart(tableData);
            var chartConfig = {
              //   dataList: pageData,
              //   barValueIndex: [6], //排除率欄位
              //   xAxisLabelValueIndex: [0, 1, 2, 3],
              //   yAxisLabel: `${i18n('Cutting_Time')}(s)`
            }
            context.drawChart(context.$barChart, chartConfig)
          },
          excel: {
            fileName: 'singleMeasureDay',
            format: ['text', 'text', 'text', 'text', 'text', 'text'],
          },
        }),
        detailTable = createReportTable({
          $tableElement: $('#detail-table'),
          $tableWidget: $('#detail-table-widget'),
          // rightColumn: [1, 2, 3, 4],
          onDraw: function (tableData, pageData) {
            //context.drawChart(tableData);
            var chartConfig = {
              dataList: pageData,
              barValueIndex: [7], //排除率欄位
              xAxisLabelValueIndex: [0, 1, 2, 3, 4],
              yAxisLabel: `${i18n('Cutting_Time')}(s)`,
            }
            context.drawChart(context.$barChart, chartConfig)
          },
          excel: {
            fileName: 'singleMeasureDetail',
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
        })
      context.$startDate
        .datepicker(datepickerConfig)
        .val(moment(new Date()).format('YYYY/MM/DD'))
      context.$endDate
        .datepicker(datepickerConfig)
        .val(moment(new Date()).format('YYYY/MM/DD'))

      // context.initMachineSelect();
      // servkit.initMachineSelect(context.$machineSelect, true);

      servkit.initFuncBindMachineSelect(
        context.$machineSelect,
        context.appId,
        context.funId,
        true
      )
      context.$demoBtn.on('click', function (evt) {
        evt.preventDefault()
        context.$startDate.val('2016/06/23')
        context.$endDate.val('2016/06/29')
        $('[name=dataName]').eq(0).click()
        var reportType = $('input[name="dataName"]:checked').val()
        context[reportType](dayTable, detailTable)
      })

      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()

        var reportType = $('input[name="dataName"]:checked').val()
        context[reportType](dayTable, detailTable, summaryTable)
      })
    },
    util: {
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $machineSelect: $('#machine'),
      $submitBtn: $('#submit-btn'),
      $demoBtn: $('#showdemo'),
      $barChart: $('#bar-chart'),
      $dateRangeTitle: $('#date-range-title'),
      $machineTitle: $('#machine-title'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      //YYYY/MM/DD HH:mm:ss + 2s 以下一筆資料開始時間(2秒後)作為當前資料的結束時間
      getNextDataStartTimeAsEndTime: function (time) {
        var orgDate = new Date(time)
        var millisecond = 1000
        var newDate = new Date(orgDate.getTime() + 2 * millisecond)
        return moment(newDate).format('YYYY/MM/DD HH:mm:ss')
      },
      detail: function (dayTable, detailTable, summaryTable) {
        var that = this
        var machineList = this.$machineSelect.val() || [],
          startDate = this.$startDate.val(),
          endDate = this.$endDate.val(),
          resultData,
          loadingBtn = this.loadingBtn
        loadingBtn.doing()
        hippo
          .newSimpleExhaler()
          .space('tool_part_detail')
          .index('machine_id', machineList)
          .indexRange('date', startDate, endDate)
          .columns(
            'start_time',
            'end_time',
            'machine_id',
            'date',
            'work_shift',
            'program_name',
            'tool',
            'power_millisecond',
            'operate_millisecond',
            'cutting_millisecond',
            'idle_millisecond',
            'alarm_millisecond',
            'work_shift_millisecond'
          )
          .exhale(function (exhalable) {
            try {
              var result = exhalable.map(function (data) {
                return [
                  servkit.getMachineName(data.machine_id),
                  data.date,
                  data.work_shift,
                  data.program_name,
                  data.tool,
                  data.start_time.dateTimeBitsToFormatted(),
                  that.getNextDataStartTimeAsEndTime(
                    data.end_time.dateTimeBitsToFormatted()
                  ),
                  data.power_millisecond.millisecondToHHmmss(),
                  data.operate_millisecond.millisecondToHHmmss(),
                  data.cutting_millisecond.millisecondToHHmmss(),
                  (
                    data.idle_millisecond + data.alarm_millisecond
                  ).millisecondToHHmmss(),
                ]
              })

              resultData = result
              servkit
                .politeCheck()
                .until(function () {
                  return resultData
                })
                .thenDo(function () {
                  detailTable.drawTable(resultData)
                  dayTable.hideWidget()
                  summaryTable.hideWidget()
                  detailTable.showWidget()
                })
                .tryDuration(0)
                .start()
            } catch (e) {
              console.warn(e)
            } finally {
              loadingBtn.done()
            }
          })
      },
      summaryToolUsed: function (summaryTable) {
        var that = this

        var machineList = this.$machineSelect.val() || [],
          startDate = this.$startDate.val(),
          endDate = this.$endDate.val(),
          resultData,
          loadingBtn = this.loadingBtn
        loadingBtn.doing()
        hippo
          .newSimpleExhaler()
          .space('tool_used_summary')
          .index('machine_id', machineList)
          .indexRange('date', startDate, endDate)
          .columns(
            'machine_id',
            'program_name',
            'tool',
            'cutting_millisecond',
            'tool_change_times'
          )
          .exhale(function (exhalable) {
            try {
              var groups = _.groupBy(exhalable.exhalable, function (value) {
                return value.machine_id + value.program_name + value.tool
              })
              var result = _.map(groups, function (group, key) {
                var cutting_millisecond = 0
                var tool_change_times = 0
                _.each(group, function (num, key) {
                  cutting_millisecond += num.cutting_millisecond
                  tool_change_times += num.tool_change_times
                })
                return [
                  servkit.getMachineName(group[0].machine_id),
                  group[0].program_name,
                  group[0].tool,
                  cutting_millisecond.millisecondToHHmmss(),
                  tool_change_times,
                  (
                    cutting_millisecond / tool_change_times
                  ).millisecondToHHmmss(),
                ]
              })
              resultData = result
              servkit
                .politeCheck()
                .until(function () {
                  return resultData
                })
                .thenDo(function () {
                  summaryTable.drawTable(resultData)
                  summaryTable.showWidget()
                  that.$dateRangeTitle.html(
                    that.$startDate.val() + ' ~ ' + that.$endDate.val()
                  )
                  machineList
                  var machineNames = []
                  _.each(machineList, function (data) {
                    if (data != 'ALL') {
                      machineNames.push(servkit.getMachineName(data))
                    }
                  })
                  that.$machineTitle.html(machineNames.toString())
                })
                .tryDuration(0)
                .start()
            } catch (e) {
              console.warn(e)
            } finally {
              loadingBtn.done()
            }
          })
      },
      day: function (dayTable, workShiftTable, summaryTable) {
        var that = this
        var machineList = this.$machineSelect.val() || [],
          startDate = this.$startDate.val(),
          endDate = this.$endDate.val(),
          resultData,
          loadingBtn = this.loadingBtn
        loadingBtn.doing()

        hippo
          .newMashupExhaler()
          .space('tool_part_day:tpd')
          .index('machine_id', machineList)
          .indexRange('date', startDate, endDate)

          .space('tool_used_summary:tus')
          .index('machine_id', machineList)
          .indexRange('date', startDate, endDate)

          .column('tpd', 'machine_id')
          .column('tpd', 'date')
          .column('tpd', 'program_name')
          .column('tpd', 'tool')
          .column('tpd', 'power_millisecond')
          .column('tpd', 'operate_millisecond')
          .column('tpd', 'cutting_millisecond')
          .column('tpd', 'idle_millisecond')
          .column('tpd', 'alarm_millisecond')
          .column('tpd', 'work_shift_millisecond')

          .column('tus', 'tool_change_times')

          .mashupKey('machine_id', 'date', 'tool', 'program_name')
          .exhale(function (exhalable) {
            try {
              var result = exhalable.map(function (data) {
                var toolPartDay = data.tpd[0]
                var toolUsedSummary = data.tus[0]
                return [
                  servkit.getMachineName(toolPartDay.machine_id),
                  toolPartDay.date,
                  toolPartDay.program_name,
                  toolPartDay.tool,
                  toolPartDay.power_millisecond.millisecondToHHmmss(),
                  toolPartDay.operate_millisecond.millisecondToHHmmss(),
                  toolPartDay.cutting_millisecond.millisecondToHHmmss(),
                  (
                    toolPartDay.idle_millisecond + toolPartDay.alarm_millisecond
                  ).millisecondToHHmmss(),
                  toolUsedSummary.tool_change_times,
                ]
              })

              resultData = result
              servkit
                .politeCheck()
                .until(function () {
                  return resultData
                })
                .thenDo(function () {
                  dayTable.drawTable(resultData)
                  dayTable.showWidget()
                  workShiftTable.hideWidget()
                  that.summaryToolUsed(summaryTable)
                })
                .tryDuration(0)
                .start()
            } catch (e) {
              console.warn(e)
            } finally {
              loadingBtn.done()
            }
          })

        // hippo.newSimpleExhaler()
        //   .space("tool_part_day")
        //   .index("machine_id", machineList)
        //   .indexRange("date", startDate, endDate)
        //   .columns("machine_id",
        //     "date",
        //     "program_name",
        //     "tool",
        //     "power_millisecond",
        //     "operate_millisecond",
        //     "cutting_millisecond",
        //     "idle_millisecond",
        //     "alarm_millisecond",
        //     "work_shift_millisecond"
        //   )
        //   .exhale(function (exhalable) {
        //     try {
        //       var result = exhalable.map(function (data) {
        //         return [that.getDBObject[data.machine_id],
        //           data.date,
        //           data.program_name,
        //           data.tool,
        //           data.power_millisecond.millisecondToHHmmss(),
        //           data.operate_millisecond.millisecondToHHmmss(),
        //           data.cutting_millisecond.millisecondToHHmmss(),
        //           (data.idle_millisecond + data.alarm_millisecond).millisecondToHHmmss()
        //         ];
        //       });

        //       resultData = result;
        //       servkit.politeCheck()
        //         .until(function () {
        //           return resultData;
        //         }).thenDo(function () {

        //           dayTable.drawTable(resultData);
        //           dayTable.showWidget();
        //           workShiftTable.hideWidget();

        //         }).tryDuration(0)
        //         .start();

        //     } catch (e) {
        //       console.warn(e);
        //     } finally {
        //       loadingBtn.done();
        //     }
        //   });
      },
      drawChart: function ($chartEle, config) {
        var dataList = config.dataList,
          barValueIndex = config.barValueIndex,
          xAxisLabelValueIndex = config.xAxisLabelValueIndex,
          yAxisLabel = config.yAxisLabel,
          that = this

        if (!dataList || dataList.length === 0) {
          return
        }

        var chartDatas = _.map(barValueIndex, function (barIndex, barI) {
          return {
            data: _.map(dataList, function (row, i) {
              return [i, that.hhmmssToSecond(row[barIndex])]
            }),
            bars: {
              align: 'center',
              show: true,
              barWidth: 0.2,
              order: barI + 1,
            },
          }
        })

        $.plot($chartEle, chartDatas, {
          colors: [
            servkit.colors.green,
            servkit.colors.blue,
            servkit.colors.orange,
          ],
          grid: {
            show: true,
            hoverable: true,
            clickable: true,
            tickColor: '#EFEFEF',
            borderWidth: 0,
            borderColor: '#EFEFEF',
          },
          xaxis: {
            ticks: function () {
              return _.map(dataList, function (ele, i) {
                var tick = _.map(xAxisLabelValueIndex, function (index) {
                  return ele[index]
                }).join('</br>')
                return [i, tick]
              })
            },
          },
          yaxis: {
            min: 0,
            // max:100,
            axisLabel: yAxisLabel,
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: 'Open Sans',
          },
          legend: true,
          tooltip: true,
          tooltipOpts: {
            content: "<b style='display:none;'>%x</b><span>%y(sec.)</span>",
            defaultTheme: false,
          },
        })
      },
      hhmmssToSecond: function (val) {
        var dateArray = val.split(':')
        var hour = parseInt(dateArray[0])
        var minute = parseInt(dateArray[1])
        var second = parseInt(dateArray[2])

        var time = parseFloat((hour * 3600 + minute * 60 + second).toFixed(2))

        if (time > 0) {
          return time
        } else {
          return 0
        }
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
