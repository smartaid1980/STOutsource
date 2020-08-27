export default function () {
  GoGoAppFun({
    gogo: function (context) {
      var datepickerConfig = {
        dateFormat: 'yy/mm/dd',
        prevText: '<i class="fa fa-chevron-left"></i>',
        nextText: '<i class="fa fa-chevron-right"></i>',
      }
      var dayTable = createReportTable({
        $tableElement: $('#day-table'),
        $tableWidget: $('#day-table-widget'),
        rightColumn: [9, 10, 11, 12, 13, 14],
        onDraw: function (tableData, pageData) {
          $('.dataTables_length').addClass('hide')
        },
        excel: {
          fileName: 'ProductDaily',
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

      // should fixed in the futrue
      context.initDepartIdSelect()

      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()

        var title = context.$startDate.val() + ' - ' + context.$endDate.val()
        console.log(title)

        context.day(dayTable, {
          departId: context.$departIdSelect.val(),
          startDate: context.$startDate.val(),
          endDate: context.$endDate.val(),
        })
      })
    },
    util: {
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $departIdSelect: $('#depart-id'),
      $plantSelect: $('#plantAreaForm'),
      $submitBtn: $('#submit-btn'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),

      initDepartIdSelect: function () {
        // var departIdSelectHtml = '';
        /* servkit.eachMachine(function (id, name) {
            departIdSelectHtml += '<option value="' + id + '">' + name + '</option>';
          }); */

        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_aerowin_depart_machine',
              columns: ['depart_id'],
            }),
          },
          {
            success: function (data) {
              console.log('***** ', data)
              var buildSelect = ''
              var map = {}
              _.each(data, function (ele) {
                var departId = ele['depart_id']
                map[departId] = departId
              })
              _.each(map, function (ele) {
                buildSelect =
                  buildSelect +
                  '<option value="' +
                  ele +
                  '">' +
                  ele +
                  '</option>'
              })
              console.log(buildSelect)
              $('#depart-id').append(buildSelect)
            },
            fail: function (data) {},
          }
        )

        // this.$departIdSelect.append(departIdSelectHtml);
      },
      day: function (dayTable, params) {
        var loadingBtn = this.loadingBtn
        loadingBtn.doing()
        servkit.ajax(
          {
            url: 'api/aerowin/dailyreport/dailyreportByDepartRange',
            type: 'GET',
            contentType: 'application/json',
            data: params,
          },
          {
            success: function (data) {
              var shiftNameMap = {
                A: '早',
                B: '中',
                C: '晚',
              }
              console.log(data)
              var result = []
              _.each(data, function (ele) {
                result.push([
                  ele.shift_date,
                  ele.depart_id,
                  shiftNameMap[ele.shift],
                  ele.emp_id,
                  ele.emp_name,
                  ele.machine_id,
                  ele.machine_name,
                  ele.work_id,
                  ele.product_name || '---',
                  ele.quantity_esp,
                  ele.op,
                  ele.quantity_in === 0 ? '-' : ele.quantity_in,
                  ele.go_no,
                  ele.ng_no,
                  ele.labor_hour_real.toFixed(2),
                ])
              })
              dayTable.drawTable(result)

              dayTable.showWidget()
              loadingBtn.done()
            },
            fail: function (data) {},
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
