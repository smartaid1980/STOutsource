export default function () {
  GoGoAppFun({
    gogo: function (context) {
      var reportTable = createReportTable({
        $tableElement: $('#report-table'),
        $tableWidget: $('#report-table-widget'),
        excel: {
          fileName: 'ToolLog',
          format: ['text', 'text', 'text', 'text', 'text'],
        },
      })

      servkit.initDatePicker(context.$startDate, context.$endDate)
      servkit.initMachineSelect(context.$machineSelect)
      servkit.initSelectWithList(context.preCon.getTool, context.$toolSelect)

      servkit.validateForm($('#main-form'), context.$submitBtn)
      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()
        context.renderTable(reportTable)
      })
    },
    util: {
      $startDate: $('[name=startDate]'),
      $endDate: $('[name=endDate]'),
      $machineSelect: $('[name=device_id]'),
      $toolSelect: $('[name=tool_id]'),
      $submitBtn: $('#submit-btn'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      renderTable: function (reportTable) {
        var ctx = this
        ctx.loadingBtn.doing()
        servkit.ajax(
          {
            url: 'api/systoollog/read',
            contentType: 'application/json',
            type: 'POST',
            data: JSON.stringify({
              startDate: ctx.$startDate.val(),
              endDate: ctx.$endDate.val(),
              machineList: ctx.$machineSelect.val(),
              toolList: ctx.$toolSelect.val(),
            }),
          },
          {
            success: function (data) {
              var toolLogList = _.map(data, (elem) => {
                return [
                  ctx.preCon.getTool[elem.tool_id],
                  servkit.getMachineName(elem.device_id),
                  elem.tool_slot,
                  moment(new Date(elem.create_time)).format(
                    'YYYY/MM/DD HH:mm:ss'
                  ),
                  elem.create_by,
                ]
              })
              reportTable.drawTable(toolLogList)
            },
          }
        )
        ctx.loadingBtn.done()
      },
    },
    preCondition: {
      getTool: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_tool',
              columns: ['tool_id', 'tool_name'],
            }),
          },
          {
            success: function (data) {
              var toolMap = {}
              _.each(data, function (elem) {
                toolMap[elem.tool_id] = elem.tool_name
              })
              done(toolMap)
            },
          }
        )
      },
    },
    dependencies: [
      [
        '/js/plugin/flot/jquery.flot.cust.min.js',
        '/js/plugin/flot/jquery.flot.resize.min.js',
        '/js/plugin/flot/jquery.flot.pie.min.js',
        '/js/plugin/flot/jquery.flot.fillbetween.min.js',
        '/js/plugin/flot/jquery.flot.tooltip.min.js',
        '/js/plugin/flot/jquery.flot.stack.min.js',
        '/js/plugin/flot/jquery.flot.time.min.js',
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
