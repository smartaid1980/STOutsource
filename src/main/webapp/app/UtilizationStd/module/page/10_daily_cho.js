export default function () {
  GoGoAppFun({
    gogo: function (context) {},
    util: {},
    delayCondition: ['machineList'],
    dependencies: [],
  })
  GoGoAppFun({
    gogo: function (context) {
      var datepickerConfig = {
          dateFormat: 'yy/mm/dd',
          prevText: '<i class="fa fa-chevron-left"></i>',
          nextText: '<i class="fa fa-chevron-right"></i>',
        },
        detailTable = createReportTable({
          $tableElement: $('#detail-table'),
          $tableWidget: $('#detail-table-widget'),
          rightColumn: [2, 3, 4],
          onDraw: function (tableData, pageData) {
            var chartConfig = {
              dataList: pageData,
              barValueIndex: [4],
              xAxisLabelValueIndex: [0, 1],
              yAxisLabel: '稼動率',
            }
            context.drawChart(context.$barChartEle, chartConfig)
          },
          excel: {
            fileName: 'UtilizationDetail',
            format: ['text', 'text', 'text', 'text', 'text'],
          },
        })

      context.$startDate
        .datepicker(datepickerConfig)
        .val(moment(new Date()).format('YYYY/MM/DD'))
      context.$endDate
        .datepicker(datepickerConfig)
        .val(moment(new Date()).format('YYYY/MM/DD'))

      context.initMachineSelect()

      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()

        //        var reportType = $('input[name="dataName"]:checked').val();
        //        context[reportType](detailTable, workShiftTable, dayTable);
        context['detail'](detailTable)
      })

      /*$("#showdemo").on('click', function(e){
        e.preventDefault();
        context.$startDate.val("2016/06/01");
        context.$endDate.val("2016/06/06");
        $("[name=dataName]").eq(2).click();
        //context.$machineSelect.val(["Machine01", "Machine02", "Machine03"]);
        context.$machineSelect.val(["CNC1"]);
        context.$submitBtn.click();
      }).trigger('click');*/
    },
    util: {
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $machineSelect: $('#machine'),
      $barChartEle: $('#bar-chart'),
      $submitBtn: $('#submit-btn'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      initMachineSelect: function () {
        //var machineSelectHtml = '<option>ALL</option>';
        var machineMap = {}
        servkit.eachMachine(function (id, name) {
          //machineSelectHtml += '<option style="padding:3px 0 3px 3px;" value="' + id + '" selected>' + name + '</option>';
          machineMap[id] = name
        })
        //console.log('machineMap', machineMap);
        servkit.initSelectWithList(machineMap, this.$machineSelect)
        //this.$machineSelect.append(machineSelectHtml);
        //servkit.multiselectHeightOptimization(this.$machineSelect[0]);
        //this.$machineSelect.on("mousedown", servkit.multiselectWithoutCtrlMouseDown)
        //  .on("mousemove", servkit.multiselectWithoutCtrlMouseMove);
      },
      detail: function (detailTable) {
        var machineList = this.$machineSelect.val() || [],
          startDate = this.$startDate.val(),
          endDate = this.$endDate.val(),
          loadingBtn = this.loadingBtn
        loadingBtn.doing()

        hippo
          .newSimpleExhaler()
          .space('oee_cho')
          .index('machine_id', machineList)
          .indexRange('date', startDate, endDate)
          .columns(
            'machine_id',
            'date',
            'power_duration',
            'operate_duration',
            'utilization_rate'
          )
          .exhale(function (exhalable) {
            console.log(exhalable.exhalable)
            var result = _.map(exhalable.exhalable, function (r) {
              return [
                servkit.getMachineName(r.machine_id),
                r.date.date8BitsToSlashed(),
                r.power_duration.millisecondToHHmmss(),
                r.operate_duration.millisecondToHHmmss(),
                parseFloat(r.utilization_rate).floatToPercentage(),
              ]
            })
            detailTable.drawTable(result)
            detailTable.showWidget()
            loadingBtn.done()
          })
      },
      timestamp2time: function (timestamp) {
        return timestamp.millisecondToHHmmss()
      },
      drawChart: function ($chartEle, config) {
        var dataList = config.dataList,
          barValueIndex = config.barValueIndex,
          xAxisLabelValueIndex = config.xAxisLabelValueIndex,
          yAxisLabel = config.yAxisLabel

        // modify by jaco @ 2016/8/20
        // to avoid pre query have data ,but this time have no data
        // orignal won't redraw,add empty to clear prev result
        if (!dataList || dataList.length === 0) {
          $chartEle.empty()
          return
        }

        var chartDatas = _.map(barValueIndex, function (barIndex, barI) {
          return {
            data: _.map(dataList, function (row, i) {
              return [i, row[barIndex].percentageToFloat()]
            }),
            bars: {
              show: true,
              align: 'center',
              barWidth: 0.2,
              order: barI + 1,
            },
          }
        })
        $.plot($chartEle, chartDatas, {
          colors: [
            servkit.colors.blue,
            servkit.colors.green,
            servkit.colors.orange,
            servkit.colors.purple,
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
            max: 100,
            axisLabel: yAxisLabel,
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: 'Open Sans',
          },
          legend: true,
          tooltip: true,
          tooltipOpts: {
            content: "<b style='display:none;'>%x</b><span>%y.2%</span>",
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
