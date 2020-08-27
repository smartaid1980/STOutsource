export default function () {
  GoGoAppFun({
    gogo: function (context) {
      var datepickerConfig = {
          dateFormat: 'yy/mm/dd',
          prevText: '<i class="fa fa-chevron-left"></i>',
          nextText: '<i class="fa fa-chevron-right"></i>',
        },
        dayTable = createReportTable({
          $tableElement: $('#date-table'),
          $tableWidget: $('#date-table-widget'),
          // rightColumn: [1, 2, 3, 4],
          onDraw: function (tableData, pageData) {
            //context.drawChart(tableData);
            var chartConfig = {
              dataList: pageData,
              barValueIndex: [6], //排除率欄位
              xAxisLabelValueIndex: [0, 1, 2, 3],
              yAxisLabel: '切削時間(s)',
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
            ],
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
              yAxisLabel: '切削時間(s)',
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

      servkit.initMachineSelect(context.$machineSelect)
      servkit.initDatePicker(context.$startDate, context.$endDate)

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
        context[reportType](dayTable, detailTable)
      })
    },
    util: {
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $machineSelect: $('#machine'),
      $submitBtn: $('#submit-btn'),
      $demoBtn: $('#showdemo'),
      $barChart: $('#bar-chart'),
      getDBObject: {},
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      detail: function (dayTable, detailTable) {
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
                  data.end_time.dateTimeBitsToFormatted(),
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
      day: function (dayTable, workShiftTable) {
        var that = this
        var machineList = this.$machineSelect.val() || [],
          startDate = this.$startDate.val(),
          endDate = this.$endDate.val(),
          resultData,
          loadingBtn = this.loadingBtn
        loadingBtn.doing()
        hippo
          .newSimpleExhaler()
          .space('tool_part_day')
          .index('machine_id', machineList)
          .indexRange('date', startDate, endDate)
          .columns(
            'machine_id',
            'date',
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
                  that.getDBObject[data.machine_id],
                  data.date,
                  data.program_name,
                  data.tool,
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
                  dayTable.drawTable(resultData)
                  dayTable.showWidget()
                  workShiftTable.hideWidget()
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
            content: "<b style='display:none;'>%x</b><span>%y.2(秒)</span>",
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
