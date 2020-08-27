export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      servkit.validateForm($('#query-form'), $('#submit-btn'))
      servkit.initDatePicker($('#start-date'), $('#end-date'), true, false)
      servkit.initSelectWithList(
        ctx.preCon.get_m_device_list,
        $('#machine-list')
      )

      ctx.$submitBtn.on('click', function (evt) {
        evt.preventDefault()
        ctx.loadingBtn.doing()
        ctx.alarmLogRenderTable()
      })

      $('#alarm-log-table-widget').on('click', '.push-log-modalBtn', function (
        evt
      ) {
        evt.preventDefault()
        var machineId = $(this).attr('data-machine_id')
        var alarmCode = $(this).attr('data-alarm_code')
        var alarmStartTime = $(this).attr('data-alarm_start_time')
        var alarmEndTime =
          $(this).attr('data-alarm_end_time') == undefined
            ? null
            : $(this).attr('data-alarm_end_time')
        ctx.pushLogRenderTable(
          machineId,
          alarmCode,
          alarmStartTime,
          alarmEndTime
        )
      })

      ctx.alarmLogReportTable = createReportTable({
        $tableElement: $('#alarm-log-table'),
        $tableWidget: $('#alarm-log-table-widget'),
        order: [[1, 'asc']],
        excel: {
          fileName: 'alarmLog',
          format: ['text', 'text', 'text', 'text', 'text', 'text'],
          customHeaderFunc: function (tableHeader) {
            return _.filter(tableHeader, function (num, index) {
              var columnList = [3, 4, 2, 1, 0]
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
                var columnList = [3, 4, 2, 1, 0]
                var findIndex = _.find(columnList, (val) => {
                  return index == val
                })
                return findIndex !== undefined
              })
            })
          },
        },
        centerColumn: [5],
      })

      ctx.pushLogReportTable = createReportTable({
        $tableElement: $('#push-log-table'),
        $tableWidget: $('#push-log-table-widget'),
        hideCols: [2], //要隱藏的欄位，從0開始。若有checkbox欄位則從1開始
        showNoData: false,
        order: [[0, 'asc']],
      })
    },
    util: {
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $machineSelect: $('#machine-list'),
      $submitBtn: $('#submit-btn'),
      alarmLogReportTable: null,
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),

      alarmLogRenderTable: function () {
        var ctx = this
        var data = {
          alarm_start_date: ctx.$startDate.val(),
          alarm_end_date: ctx.$endDate.val(),
          machines: ctx.$machineSelect.val() || [],
        }
        servkit.ajax(
          {
            url: 'api/iiot/alarm/getHistory',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
          },
          {
            success: function (data) {
              ctx.alarmLogReportTable.drawTable(
                _.map(data, (val, key) => {
                  var dataKey = ''
                  _.each(val, (value, key) => {
                    dataKey += ' data-' + key + '= "' + value + '"'
                  })
                  return [
                    ctx.preCon.get_m_device_list[val.machine_id] === null ||
                    ctx.preCon.get_m_device_list[val.machine_id] === undefined
                      ? ''
                      : ctx.preCon.get_m_device_list[val.machine_id],
                    val.alarm_start_time === null ||
                    val.alarm_start_time === undefined
                      ? ''
                      : val.alarm_start_time,
                    val.alarm_end_time === null ||
                    val.alarm_end_time === undefined
                      ? '---'
                      : val.alarm_end_time,
                    val.alarm_type === '2' || val.alarm_end_time === null
                      ? '---'
                      : val.alarm_code,
                    val.alarm_type === '2' ? '閒置超時' : val.alarm_content,
                    '<button class="btn btn-primary push-log-modalBtn" data-toggle="modal" data-target="#push-log-modal" data-pks="{push_record:' +
                      val.machine_id +
                      '}" ' +
                      dataKey +
                      '>推播紀錄</button>',
                  ]
                })
              )
              ctx.loadingBtn.done()
            },
          }
        )
      },
      pushLogReportTable: null,
      pushLogRenderTable: function (
        machineId,
        alarmCode,
        alarmStartTime,
        alarmEndTime
      ) {
        var ctx = this
        var data = {
          alarm_start_date: alarmStartTime,
          alarm_end_date: alarmEndTime,
          machine_id: machineId,
          alarm_code: alarmCode,
        }
        servkit.ajax(
          {
            url: 'api/iiot/alarm/getTriggerList',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
          },
          {
            success: function (data) {
              if (data.length > 0) {
                ctx.pushLogReportTable.drawTable(
                  _.map(data, (val, key) => {
                    return [
                      ctx.preCon.get_m_device_list[val.machine_id] === null ||
                      ctx.preCon.get_m_device_list[val.machine_id] === undefined
                        ? ''
                        : ctx.preCon.get_m_device_list[val.machine_id],
                      val.alarm_start_time === null ||
                      val.alarm_start_time === undefined
                        ? ''
                        : val.alarm_start_time,
                      val.alarm_end_time === null ||
                      val.alarm_end_time === undefined
                        ? '---'
                        : val.alarm_end_time,
                      val.alarm_code === null || val.alarm_code === undefined
                        ? ''
                        : val.alarm_code,
                      ctx.preCon.get_watch_name_by_a_iiot_smart_watch[
                        val.watch_id
                      ] === null ||
                      ctx.preCon.get_watch_name_by_a_iiot_smart_watch[
                        val.watch_id
                      ] === undefined
                        ? ''
                        : ctx.preCon.get_watch_name_by_a_iiot_smart_watch[
                            val.watch_id
                          ],
                      val.alarm_push_time === null ||
                      val.alarm_push_time === undefined
                        ? ''
                        : val.alarm_push_time,
                    ]
                  })
                )
              } else {
                ctx.pushLogReportTable.drawTable([])
              }
            },
          }
        )
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
      get_watch_name_by_a_iiot_smart_watch: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_iiot_smart_watch',
              columns: ['watch_id', 'watch_name'],
            }),
          },
          {
            success: function (data) {
              var dataMap = {}
              _.each(data, function (elem, key) {
                dataMap[elem.watch_id] = elem.watch_name
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
        // '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
    ],
  })
}
