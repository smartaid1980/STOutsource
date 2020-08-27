export default function () {
  'use strict'
  console.log('123')
  $('body').removeClass('fixed-page-footer').removeClass('fixed-ribbon')

  GoGoAppFun({
    gogo: function gogo(ctx) {
      ctx.today = moment().format('YYYY/MM/DD')
      ctx.monthAgo = moment().subtract(1, 'months').format('YYYY/MM/DD')
      ctx.$byMachineChart.append(
        `<p class="alert alert-success text-center">${ctx.monthAgo} ~ ${ctx.today}</p>`
      )
      ctx.$byCodeChart.append(
        `<p class="alert alert-success text-center">${ctx.monthAgo} ~ ${ctx.today}</p>`
      )
      ctx.getData()
    },
    util: {
      $byMachineChart: $('#by-machine'),
      $byCodeChart: $('#by-code'),
      options: {
        series: {
          bars: {
            show: true,
            barWidth: 0.5,
            align: 'center',
          },
          valueLabels: {
            show: true,
            showTextLabel: true,
            yoffset: -1,
            align: 'center',
            font: '9pt ' + servkit.fonts,
          },
        },
        xaxis: {
          font: {
            size: 10,
            family: servkit.fonts,
            color: '#000000',
          },
          axisLabelUseCanvas: true,
          axisLabelFontFamily: servkit.fonts,
          axisLabelColour: '#000000',
          // axisLabelPadding: 5,
          labelWidth: 15,
          labelHeight: 120,
        },
        yaxis: {
          min: 0,
          font: {
            size: 10,
            family: servkit.fonts,
            color: '#000000',
          },
          axisLabelUseCanvas: true,
          axisLabelFontSizePixels: 12,
          axisLabelFontFamily: servkit.fonts,
          axisLabelColour: '#000000',
          axisLabelPadding: 5,
          tickDecimals: 0,
          minTickSize: 1,
        },
        legend: {
          show: false,
        },
      },
      getData: function getData() {
        var ctx = this
        hippo
          .newSimpleExhaler()
          .space('alarm_code_count')
          .index('machine_id', servkit.getMachineList())
          .indexRange('date', ctx.monthAgo, ctx.today)
          .columns('machine_id', 'alarm_code', 'count', 'date', 'cnc_id')
          .exhale(function (data) {
            _.each(data.exhalable, (obj) => {
              obj.alarm_code = obj.alarm_code.replace('NA', '999')
            })
            var machineAlarms = _.groupBy(data.exhalable, 'machine_id')
            var codeAlarms = {}
            _.each(data.exhalable, function (record) {
              var codes = record.alarm_code.split(',')
              _.each(codes, function (code) {
                if (code !== '-1') {
                  if (!codeAlarms[code]) {
                    codeAlarms[code] = []
                  }
                  codeAlarms[code].push(record)
                }
              })
            })

            ctx.drawByMachineChart(machineAlarms, ctx)
            ctx.drawByCodeChart(codeAlarms, ctx)
          })
      },
      drawByMachineChart: function drawByMachineChart(machineAlarms, ctx) {
        var machineList = _.keys(machineAlarms)
        for (var i = 0; i < machineList.length; i += 10) {
          var ticks = []
          var plotData = []
          var $canvas = $(
            '<div style="margin:auto;width:95%;height:350px"></div>'
          )
          ctx.$byMachineChart.append($canvas).append('<hr class="simple">')

          for (var j = 0; j < 10 && machineList[i + j]; j++) {
            var machineId = machineList[i + j]
            var machineName = servkit.getMachineName(machineId)
            let count = _.reduce(
              machineAlarms[machineId],
              (memo, obj) => {
                memo += obj.count
                return memo
              },
              0
            )
            ticks.push([j, machineName])
            plotData.push({
              data: [[j, count]],
              label: machineName,
              color: servkit.statusColors.alarm,
            })
          }

          ctx.options.xaxis.axisLabel = '機台'
          ctx.options.xaxis.labelHeight = 40
          ctx.options.xaxis.ticks = ticks
          ctx.options.yaxis.axisLabel = '次數'

          $.plot($canvas, plotData, ctx.options)
        }
      },
      drawByCodeChart: function drawByCodeChart(codeAlarms, ctx) {
        var codeList = _.keys(codeAlarms)
        for (var i = 0; i < codeList.length; i += 10) {
          var ticks = []
          var plotData = []
          var $canvas = $(
            '<div style="margin:auto;width:95%;height:350px"></div>'
          )
          ctx.$byCodeChart.append($canvas).append('<hr class="simple">')

          for (var j = 0; j < 10 && codeList[i + j]; j++) {
            var alarmId = codeList[i + j]
            ticks.push([j, alarmId])
            let count = _.reduce(
              codeAlarms[alarmId],
              (memo, obj) => {
                memo += obj.count
                return memo
              },
              0
            )
            plotData.push({
              data: [[j, count]],
              label: alarmId,
              color: servkit.statusColors.alarm,
            })
          }

          ctx.options.xaxis.axisLabel = '警報代碼'
          ctx.options.xaxis.labelHeight = 40
          ctx.options.xaxis.ticks = ticks
          ctx.options.yaxis.axisLabel = '次數'
          $.plot($canvas, plotData, ctx.options)
        }
      },
    },
    delayCondition: ['machineList'],
    dependencies: [
      [
        '/js/plugin/flot/jquery.flot.cust.min.js',
        '/js/plugin/flot/jquery.flot.axislabels.js',
        '/js/plugin/flot/jquery.flot.valuelabels.js',
      ],
    ],
  })
}
