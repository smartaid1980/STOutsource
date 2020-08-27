export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      let localeMap = {
        en: 'en',
        zh: 'zh-tw',
        zh_tw: 'zh-tw',
      }
      let lang = localeMap[servkit.getCookie('lang')]
      ctx.$month.datetimepicker({
        defaultDate: moment().format('YYYY/MM'),
        viewMode: 'months',
        format: 'YYYY/MM',
        locale: lang,
      })
      servkit.initMachineSelect(ctx.$machineSelect)

      ctx.reporttable = createReportTable({
        $tableElement: $('#table'),
        $tableWidget: $('#table-widget'),
        rightColumn: [2, 3, 4, 5, 6, 7, 8],
        onDraw: function (tableData, pageData) {
          ctx.drawChart(ctx.$barChartEle, pageData)
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
            '0',
            '0',
            '0.00',
            'text',
          ],
        },
      })

      ctx.$submitBtn.on('click', function (evt) {
        evt.preventDefault()
        ctx.loadingBtn.doing()
        try {
          ctx.getData(ctx)
        } catch (error) {
          console.error(error)
          ctx.loadingBtn.done()
        }
      })
    },
    util: {
      $month: $('#month'),
      $machineSelect: $('#machine'),
      $barChartEle: $('#bar-chart'),
      $submitBtn: $('#submit-btn'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      getData: function (ctx) {
        hippo
          .newSimpleExhaler()
          .space('yield_rate_utilization')
          .index('machine_id', ctx.$machineSelect.val())
          .indexRange(
            'date',
            ctx.$month.val().replace('/', '') + '01',
            ctx.$month.val().replace('/', '') + '31'
          )
          .columns(
            'machine_id',
            'date',
            'work_shift',
            'power_millisecond',
            'operate_millisecond',
            'downtime_millisecond',
            'alarm_millisecond',
            'go_output_count',
            'ng_output_count',
            'yield_rate'
          )
          .exhale(function (exhalable) {
            var result = {}
            _.each(exhalable.exhalable, function (r) {
              let key = r.machine_id + '@@' + r.date
              if (!result[key]) {
                result[key] = r
              } else {
                result[key].power_millisecond += r.power_millisecond
                result[key].operate_millisecond += r.operate_millisecond
                result[key].downtime_millisecond += r.downtime_millisecond
                result[key].alarm_millisecond += r.alarm_millisecond
                result[key].go_output_count += r.go_output_count
                result[key].ng_output_count += r.ng_output_count
              }
            })
            ctx.reporttable.drawTable(
              _.map(result, (obj) => {
                return [
                  servkit.getMachineName(obj.machine_id),
                  obj.date.date8BitsToSlashed(),
                  obj.power_millisecond.millisecondToHHmmss(),
                  obj.operate_millisecond.millisecondToHHmmss(),
                  (
                    parseInt(obj.downtime_millisecond) +
                    parseInt(obj.alarm_millisecond)
                  ).millisecondToHHmmss(),
                  obj.go_output_count,
                  obj.ng_output_count,
                  (
                    obj.go_output_count /
                    parseInt(obj.go_output_count + obj.ng_output_count)
                  ).floatToPercentage(),
                  (
                    obj.operate_millisecond / obj.power_millisecond
                  ).floatToPercentage(),
                ]
              })
            )
            ctx.loadingBtn.done()
          })
      },
      drawChart: function ($chartEle, pageData) {
        let chartData = {
          label: '稼動率',
          data: [],
          color: servkit.colors.green,
        }
        let ticks = []
        _.each(pageData, (rowData, idx) => {
          ticks.push([idx, `${rowData[0]}<br>${rowData[1]}`])
          chartData.data.push([
            idx,
            _.last(rowData).indexOf('%') === -1
              ? 0
              : parseFloat(_.last(rowData).replace('%', '')),
          ])
        })

        $.plot($chartEle, [chartData], {
          series: {
            bars: {
              show: true,
              barWidth: 0.5,
              align: 'center',
            },
          },
          grid: {
            show: true,
            hoverable: true,
            clickable: true,
            tickColor: '#EFEFEF',
            borderWidth: 0,
            borderColor: '#EFEFEF',
          },
          xaxis: {
            ticks,
          },
          yaxis: {
            max: 100,
            axisLabel: '稼動率',
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: 'Open Sans',
          },
          tooltip: true,
          tooltipOpts: {
            content: "<div class='hide'>%x</div><span>%y.2%</span>",
            defaultTheme: false,
          },
        })
      },
    },
    delayCondition: ['machineList'],
    dependencies: [
      ['/js/plugin/bootstrap-datetimepicker/bootstrap-datetimepicker.min.js'],
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
