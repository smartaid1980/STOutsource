export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      servkit.initDatePicker(ctx.$startDate, ctx.$endDate)
      servkit.initMachineSelect(ctx.$machineSelect)

      ctx.reporttable = createReportTable({
        $tableElement: $('#detail-table'),
        $tableWidget: $('#detail-table-widget'),
        rightColumn: [3, 4, 5, 6, 7, 8, 9],
        onDraw: function (tableData, pageData) {
          ctx.drawChart(ctx.$barChartEle, pageData)
        },
        excel: {
          fileName: 'UtilizationDaily',
          format: [
            'text',
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
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $machineSelect: $('#machine'),
      $barChartEle: $('#bar-chart'),
      $submitBtn: $('#submit-btn'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      getData: function (ctx) {
        hippo
          .newSimpleExhaler()
          .space('yield_rate_utilization')
          .index('machine_id', ctx.$machineSelect.val())
          .indexRange('date', ctx.$startDate.val(), ctx.$endDate.val())
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
            var result = _.map(exhalable.exhalable, function (r) {
              return [
                servkit.getMachineName(r.machine_id),
                r.date.date8BitsToSlashed(),
                r.work_shift,
                r.power_millisecond.millisecondToHHmmss(),
                r.operate_millisecond.millisecondToHHmmss(),
                (
                  parseInt(r.downtime_millisecond) +
                  parseInt(r.alarm_millisecond)
                ).millisecondToHHmmss(),
                r.go_output_count,
                r.ng_output_count,
                r.yield_rate.floatToPercentage(),
                (
                  r.operate_millisecond / r.power_millisecond
                ).floatToPercentage(),
              ]
            })
            ctx.reporttable.drawTable(result)
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
          ticks.push([idx, `${rowData[0]}<br>${rowData[1]}<br>${rowData[2]}`])
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
