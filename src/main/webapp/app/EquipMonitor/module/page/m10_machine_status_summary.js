export default function () {
  $('body').removeClass('fixed-page-footer').removeClass('fixed-ribbon')

  GoGoAppFun({
    gogo(ctx) {
      ctx.deviceStatus(ctx)
    },
    util: {
      $peiChart: $('#pie-chart'),
      deviceStatus(ctx) {
        servkit.subscribe('DeviceStatus', {
          machines: servkit.getBoxList(),
          dataModeling: true,
          handler: function (data) {
            let online = 0
            let idle = 0
            let alarm = 0
            let offline = 0
            _.each(data, (ds) => {
              ds.eachMachine('G_CONS()', (multisystem) => {
                switch (multisystem[0][0]) {
                  case '11':
                    online++
                    break
                  case '12':
                    idle++
                    break
                  case '13':
                    alarm++
                    break
                  default:
                    offline++
                    break
                }
              })
            })
            if (ctx.plot) {
              ctx.updatePieChart(ctx, online, idle, alarm, offline)
            } else {
              ctx.drawPieChart(ctx, online, idle, alarm, offline)
            }
          },
        })
      },
      updatePieChart(ctx, online, idle, alarm, offline) {
        ctx.plot.setData([
          {
            label: '加工',
            data: online,
            color: servkit.statusColors.online,
          },
          {
            label: '闲置',
            data: idle,
            color: servkit.statusColors.idle,
          },
          {
            label: '警报',
            data: alarm,
            color: servkit.statusColors.alarm,
          },
          {
            label: '离线',
            data: offline,
            color: servkit.statusColors.offline,
          },
        ])
        ctx.plot.draw()
      },
      drawPieChart(ctx, online, idle, alarm, offline) {
        var pieData = [
          {
            label: '加工',
            data: online,
            color: servkit.statusColors.online,
          },
          {
            label: '闲置',
            data: idle,
            color: servkit.statusColors.idle,
          },
          {
            label: '警报',
            data: alarm,
            color: servkit.statusColors.alarm,
          },
          {
            label: '离线',
            data: offline,
            color: servkit.statusColors.offline,
          },
        ]

        ctx.plot = $.plot(ctx.$peiChart, pieData, {
          series: {
            pie: {
              show: true,
              innerRadius: 0.5,
              radius: 1,
              label: {
                show: true,
                radius: 2 / 3,
                formatter: function (label, series) {
                  return `<div style="font-size:0.8em;text-align:center;padding:4px;color:white;">
                        ${series.label}<br/>${series.data[0][1]}
                        </div>`
                },
                background: {
                  opacity: 0.8,
                  color: '#000000',
                },
              },
            },
          },
          legend: {
            show: true,
            color: '#000000',
            noColumns: 2, // number of colums in legend table
            // labelBoxBorderColor: "#000", // border color for the little label boxes
            labelFormatter: function (label, series) {
              // fn: string -> string
              return `${label}:${series.percent.toFixed(2)}%`
            },
            container: null, // container (as jQuery object) to put legend in, null means default on top of graph
            position: 'ne', // position of default legend container within plot
            margin: [5, 10], // distance from grid edge to default legend container within plot
            backgroundColor: null, // null means auto-detect
            backgroundOpacity: 0, // set to 0 to avoid background
          },
        })
      },
    },
    delayCondition: ['machineList', 'machineLightList'],
    preCondition: {},
    dependencies: [
      [
        '/js/plugin/flot/jquery.flot.cust.min.js',
        '/js/plugin/flot/jquery.flot.resize.min.js',
        '/js/plugin/flot/jquery.flot.fillbetween.min.js',
        '/js/plugin/flot/jquery.flot.pie.min.js',
        '/js/plugin/flot/jquery.flot.tooltip.min.js',
        '/js/plugin/flot/jquery.flot.stack.min.js',
        '/js/plugin/flot/jquery.flot.time.min.js',
        '/js/plugin/flot/jquery.flot.axislabels.js',
      ],
    ],
  })
}
