export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      servkit.validateForm($('#query-form'), $('#submit-btn'))
      servkit.initDatePicker($('#start-date'), $('#end-date'), true, false)
      $('#nc-name').select2()
      servkit.initSelectWithList(
        ctx.preCon.get_a_iiot_tool_nc_list,
        $('#nc-name')
      )
      servkit.initSelectWithList(ctx.preCon.get_m_device_list, $('#machine'))
      ctx.$ncName.select2('val', '')
      ctx.$machine.val('')
      ctx.tooltrackingTableReportTable = createReportTable({
        $tableElement: $('#tool-tracking-table'),
        $tableWidget: $('#tool-tracking-table-widget'),
        order: [[0, 'asc']],
        excel: {
          fileName: 'tool_work_record',
          format: ['text', 'text', 'text', 'text', 'text', 'text'],
          customHeaderFunc: function (tableHeader) {
            return _.filter(tableHeader, function (num, index) {
              var columnList = [3, 0, 4, 5, 1, 2]
              var findIndex = _.find(columnList, (val) => {
                return index == val
              })
              return findIndex !== undefined
            })
          },
          customDataFunc: function (tableData) {
            var cloneTableData = $.extend(true, {}, tableData)
            return _.map(cloneTableData, function (elem) {
              return _.filter(elem, function (num, index) {
                var columnList = [3, 0, 4, 5, 1, 2]
                var findIndex = _.find(columnList, (val) => {
                  return index == val
                })
                return findIndex !== undefined
              })
            })
          },
        },
      })

      ctx.$submitBtn.on('click', function () {
        ctx.tooltrackingTableRenderTable()
      })
    },
    util: {
      tooltrackingTableReportTable: null,
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $ncName: $('#nc-name'),
      $machine: $('#machine'),
      $submitBtn: $('#submit-btn'),
      tooltrackingTableRenderTable: function () {
        var ctx = this
        servkit.ajax(
          {
            url:
              'api/iiot/tool/report/queryToolTracking?startDate=' +
              ctx.$startDate.val() +
              '&endDate=' +
              ctx.$endDate.val() +
              '&machineId=' +
              ctx.$machine.val() +
              '&ncName=' +
              ctx.$ncName.val(),
            type: 'GET',
            contentType: 'application/json',
          },
          {
            success: function (data) {
              ctx.tooltrackingTableReportTable.drawTable(
                _.map(data, (val, key) => {
                  return [
                    ctx.preCon.get_m_device_list[val.machine_id] === null ||
                    ctx.preCon.get_m_device_list[val.machine_id] === undefined
                      ? ''
                      : ctx.preCon.get_m_device_list[val.machine_id],
                    val.nc_name === null || val.nc_name === undefined
                      ? ''
                      : val.nc_name,
                    val.tool_no === null || val.tool_no === undefined
                      ? ''
                      : val.tool_no,
                    val.holder_id === null || val.holder_id === undefined
                      ? ''
                      : val.holder_id,
                    val.move_in === null || val.move_in === undefined
                      ? ''
                      : val.move_in,
                    val.move_out === null || val.move_out === undefined
                      ? ''
                      : val.move_out,
                    val.work_barcode === null || val.work_barcode === undefined
                      ? ''
                      : val.work_barcode,
                  ]
                })
              )
            },
          }
        )
      },
    },
    preCondition: {
      get_a_iiot_tool_nc_list: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_iiot_tool_nc',
              columns: ['nc_name'],
            }),
          },
          {
            success: function (data) {
              var dataMap = {}
              _.each(data, function (elem, key) {
                dataMap[elem.nc_name] = elem.nc_name
              })
              done(dataMap)
            },
          }
        )
      },
      get_m_device_list: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'm_device',
              columns: ['device_name', 'device_id'],
            }),
          },
          {
            success: function (data) {
              var dataMap = {}
              _.each(data, function (elem, key) {
                dataMap[elem.device_id] = elem.device_name
              })
              done(dataMap)
            },
          }
        )
      },
    },
    dependencies: [
      ['/js/plugin/select2/select2.min.js'],
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
