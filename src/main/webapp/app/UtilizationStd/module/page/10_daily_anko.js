import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
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
              yAxisLabel: `${i18n('Utilization')}`,
            }
            context.commons.drawChart(context.$barChartEle, chartConfig)
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
      1
      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()

        //        var reportType = $('input[name="dataName"]:checked').val();
        //        context[reportType](detailTable, workShiftTable, dayTable);
        context['detail'](detailTable)
      })

      var a = {
        a: 1,
        b: 2,
        c: function (x, y) {},
      }
      var b = [1, 2, 3]
      a.b
      a.c(5, 9)
      b[2]
      a['c'](5, 9)

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
        var machineSelectHtml = ''
        servkit.eachMachine(function (id, name) {
          machineSelectHtml +=
            '<option style="padding:3px 0 3px 3px;" value="' +
            id +
            '" selected>' +
            name +
            '</option>'
        })
        this.$machineSelect.append(machineSelectHtml)
        servkit.multiselectHeightOptimization(this.$machineSelect[0])
        this.$machineSelect
          .on('mousedown', servkit.multiselectWithoutCtrlMouseDown)
          .on('mousemove', servkit.multiselectWithoutCtrlMouseMove)
      },
      detail: function (detailTable) {
        var machineList = this.$machineSelect.val() || [],
          startDate = this.$startDate.val(),
          endDate = this.$endDate.val(),
          loadingBtn = this.loadingBtn
        loadingBtn.doing()

        servkit.ajax(
          {
            url: 'api/getdata/file',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              type: 'oee_anko',
              pathPattern: '{machine}/{YYYY}/{MM}/{YYYY}{MM}{DD}.csv',
              pathParam: {
                machine: machineList,
              },
              startDate: startDate,
              endDate: endDate,
            }),
          },
          {
            success: function (response) {
              console.log(response)
              // [
              //     ['CNC1', '20160601', '1234.00', '1000.00', '0.33'],
              //     ['CNC1', '20160602', '1266.00', '1011.00', '0.66']
              // ]
              var result = _.map(response, function (r) {
                return [
                  r[0],
                  r[1],
                  r[2],
                  r[3],
                  parseFloat(r[4]).floatToPercentage(),
                ]
              })
              detailTable.drawTable(result)
              detailTable.showWidget()
              loadingBtn.done()
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
