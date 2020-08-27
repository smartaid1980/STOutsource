export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      servkit.validateForm($('#query-form'), $('#submit-btn'))
      servkit.initDatePicker($('#start-date'), $('#end-date'), true, false)
      servkit.initSelectWithList(ctx.preCon.get_m_device_list, $('#machine'))
      ctx.$machine.val('')
      ctx.tempalteEngine = createTempalteEngine()
      ctx.tooltrackingTableReportTable = createReportTable({
        $tableElement: $('#tool-tracking-table'),
        $tableWidget: $('#tool-tracking-table-widget'),
        order: [[0, 'asc']],
        excel: {
          fileName: 'tool_used_resume',
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
          ],
          customHeaderFunc: function (tableHeader) {
            return _.filter(tableHeader, function (num, index) {
              var columnList = [8, 1, 4, 0, 6, 7, 2, 5, 3]
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
                var columnList = [8, 1, 4, 0, 6, 7, 2, 5, 3]
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
      tempalteEngine: null,
      tooltrackingTableReportTable: null,
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $holderId: $('#holder-id'),
      $toolCode: $('#tool-code'),
      $machine: $('#machine'),
      $submitBtn: $('#submit-btn'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      tooltrackingTableRenderTable: function () {
        var ctx = this
        let loadingBtn = ctx.loadingBtn
        loadingBtn.doing()
        servkit.ajax(
          {
            url:
              'api/iiot/tool/report/queryTrackingResume?startDate=' +
              ctx.$startDate.val() +
              '&endDate=' +
              ctx.$endDate.val() +
              '&machineId=' +
              ctx.$machine.val() +
              '&toolCode=' +
              ctx.$toolCode.val() +
              '&holderId=' +
              ctx.$holderId.val(),
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
                    val.work_date === null || val.work_date === undefined
                      ? ''
                      : val.work_date,
                    val.nc_name === null || val.nc_name === undefined
                      ? ''
                      : val.nc_name,
                    val.tool_no === null || val.tool_no === undefined
                      ? ''
                      : val.tool_no,
                    val.holder_id === null || val.holder_id === undefined
                      ? ''
                      : val.holder_id,
                    val.tool_id === null || val.tool_id === undefined
                      ? ''
                      : val.tool_id,
                    val.work_start_time === null ||
                    val.work_start_time === undefined
                      ? ''
                      : val.work_start_time,
                    val.work_end_time === null ||
                    val.work_end_time === undefined
                      ? ''
                      : val.work_end_time,
                    val.cutting_time === null || val.cutting_time === undefined
                      ? ''
                      : val.cutting_time,
                  ]
                })
              )
            },
          }
        )
        loadingBtn.done()
      },
    },
    preCondition: {
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
      getToolCode: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_iiot_tool_erp_sync',
              columns: ['tool_code'],
            }),
          },
          {
            success: function (data) {
              var dataMap = {}
              _.each(data, function (elem, key) {
                dataMap[elem.tool_code] = elem.tool_code
              })
              done(dataMap)
            },
          }
        )
      },
      getHolderId: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_iiot_tool_holder_list',
              columns: ['holder_id', 'dept_id'],
            }),
          },
          {
            success: function (data) {
              var dataMap = {}
              _.each(data, function (elem, key) {
                dataMap[elem.holder_id] = elem.dept_id + ':' + elem.holder_id
              })
              done(dataMap)
            },
          }
        )
      },
    },
    dependencies: [
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
