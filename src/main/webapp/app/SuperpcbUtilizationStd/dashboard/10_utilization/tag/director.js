function render(widget, done, machineMap) {
  var $timeFrequency = $('#utilization-time span:last')
  $timeFrequency.html(
    $timeFrequency
      .html()
      .replace('30', servtechConfig.ST_DEVICESTATUS_FREQUNECY / 1000)
  )
  var now = widget.commons.dateTimezone(8)
  $('#utilization-time span:first').html(moment(now).format('HH:mm:ss'))
  var today = moment(now).format('YYYY/MM/DD')

  widget.commons.dashboardComposeDayReport(
    servkit.getMachineList(),
    today,
    today,
    function (exhalable) {
      var resultGroups = {}
      servkit.ajax(
        {
          url: 'api/workshift/today',
          type: 'GET',
          contentType: 'application/json',
        },
        {
          success: function (data) {
            var workShiftStartTime = _.find(data, (val) => {
              return val.sequence === 1
            })

            exhalable.each(function (data) {
              var groupKey = data.machine_id + data.date,
                resultGroup = resultGroups[groupKey]
              if (resultGroup) {
                resultGroup.operate_millisecond += data.operate_millisecond
              } else {
                resultGroup = _.pick(
                  data,
                  'machine_id',
                  'date',
                  'operate_millisecond'
                )
                resultGroups[groupKey] = resultGroup
              }
            })
            var result = _.chain(resultGroups)
              .values()
              .map(function (timeData) {
                var data = widget.commons.millisecondparseInt(timeData)
                return [
                  servkit.getBrandName(
                    servkit.getMachineBrand(data.machine_id)
                  ),
                  servkit.getMachineName(data.machine_id),
                  (
                    data.operate_millisecond /
                    (moment(now) - moment(workShiftStartTime.start))
                  ).floatToPercentage(),
                ]
              })
              .value()

            var dataList = []
            dataList = _.map(result, function (elem, index) {
              var value = parseFloat(elem[2])
              return [index, value.toString() !== 'NaN' ? value : null]
            })
            var labelList = _.map(result, function (elem, index) {
              var content = ''
              var chartXTick = [0, 1]
              for (var i = 0; i < chartXTick.length; i++) {
                var text = elem[parseFloat(chartXTick[i])]
                if (content) {
                  content += '<br>'
                }
                content += text
              }
              return [index, content]
            })
            var chartData = [
              {
                data: dataList,
                color: servkit.colors['green'],
              },
            ]
            if (chartData[0]) {
              chartData[0]['bars'] = {
                show: true,
              }
            }
            chartData[0].bars.align = 'center'
            chartData[0].bars.barWidth = 0.5
            if (widget.dayPlot) {
              widget.dayPlot.setData(chartData)
              widget.dayPlot.draw()
            } else {
              var option = {
                xaxis: {
                  ticks: labelList,
                  min: -0.5,
                  max: 1.5,
                  labelWidth: 250,
                },
                yaxis: {
                  axisLabel: '{i18n_ServCloud_Utilization}',
                  min: 0,
                },
                tooltip: true,
                tooltipOpts: {
                  content: "<b style='display:none;'>%x</b><span>%y.2%</span>",
                  defaultTheme: false,
                },
              }
              widget.dayPlot = drawDashboardChart(
                $('#day-bar-chart'),
                chartData,
                option
              )
            }
          },
        }
      )
    }
  )

  widget.commons.dashboardComposeDayReport(
    servkit.getMachineList(),
    moment(today).startOf('month').format('YYYY/MM/DD'),
    moment(now).format('YYYY/MM/DD'),
    function (exhalable) {
      var firstDate = moment(today).startOf('month').format('YYYYMMDD')
      servkit.ajax(
        {
          url: 'api/workshift/byDateInterval',
          type: 'GET',
          contentType: 'application/json',
          data: {
            startDate: firstDate,
            endDate: firstDate,
          },
        },
        {
          success: function (data) {
            var workShiftStartTime
            if (data) {
              workShiftStartTime = _.find(data[firstDate], (val) => {
                return val.sequence === 1
              })
            }
            var resultGroups = {}
            exhalable.each(function (data) {
              var groupKey = data.machine_id,
                resultGroup = resultGroups[groupKey]
              if (resultGroup) {
                resultGroup.operate_millisecond += data.operate_millisecond
              } else {
                resultGroup = _.pick(
                  data,
                  'machine_id',
                  'date',
                  'operate_millisecond'
                )
                resultGroups[groupKey] = resultGroup
              }
            })
            var result = _.chain(resultGroups)
              .values()
              .map(function (timeData) {
                var data = widget.commons.millisecondparseInt(timeData)
                return [
                  servkit.getBrandName(
                    servkit.getMachineBrand(data.machine_id)
                  ),
                  servkit.getMachineName(data.machine_id),
                  (
                    data.operate_millisecond /
                    (moment(now) - moment(workShiftStartTime.start))
                  ).floatToPercentage(),
                ]
              })
              .value()

            var dataList = []
            dataList = _.map(result, function (elem, index) {
              var value = parseFloat(elem[2])
              return [index, value.toString() !== 'NaN' ? value : null]
            })
            var labelList = _.map(result, function (elem, index) {
              var content = ''
              var chartXTick = [0, 1]
              for (var i = 0; i < chartXTick.length; i++) {
                var text = elem[parseFloat(chartXTick[i])]
                if (content) {
                  content += '<br>'
                }
                content += text
              }
              return [index, content]
            })

            var chartData = [
              {
                data: dataList,
                color: servkit.colors['blue'],
              },
            ]
            if (chartData[0]) {
              chartData[0]['bars'] = {
                show: true,
              }
            }
            chartData[0].bars.align = 'center'
            chartData[0].bars.barWidth = 0.5
            if (widget.monthPlot) {
              widget.monthPlot.setData(chartData)
              widget.monthPlot.draw()
            } else {
              var option = {
                xaxis: {
                  ticks: labelList,
                  min: -0.5,
                  max: 1.5,
                  labelWidth: 250,
                },
                yaxis: {
                  axisLabel: '{i18n_ServCloud_Utilization}',
                  min: 0,
                },
                tooltip: true,
                tooltipOpts: {
                  content: "<b style='display:none;'>%x</b><span>%y.2%</span>",
                  defaultTheme: false,
                },
              }
              widget.monthPlot = drawDashboardChart(
                $('#month-bar-chart'),
                chartData,
                option
              )
            }
          },
        }
      )
    }
  )

  function drawDashboardChart($chart, data, option) {
    var options = {
      xaxis: {
        tickColor: 'rgba(186,186,186,0.2)',
        axisLabelFontFamily: servkit.fonts,
        axisLabelUseCanvas: true,
        axisLabelPadding: 5,
      },
      yaxis: {
        min: 0,
        tickColor: 'rgba(186,186,186,0.2)',
        axisLabelFontSizePixels: 12,
        axisLabelFontFamily: servkit.fonts,
        axisLabelUseCanvas: true,
        axisLabelPadding: 5,
        tickDecimals: 0,
        minTickSize: 1,
        defaultValue: 0,
      },
      legend: {
        show: true,
      },
      grid: {
        show: true,
        hoverable: true,
        clickable: true,
        tickColor: '#EFEFEF',
        borderWidth: 0,
        borderColor: '#EFEFEF',
      },
      tooltip: true,
      tooltipOpts: {
        content: '<b style="display:none;">%x</b><span>%y</span>',
        defaultTheme: false,
      },
    }
    return $.plot($chart, data, _.extend(options, option))
  }

  if (typeof done === 'function') {
    done()
  }
}
