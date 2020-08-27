export default function () {
  GoGoAppFun({
    gogo: function (context) {
      servkit.validateForm($('#queryID'), $('#submitBtn'))
      servkit.initDatePicker($('#startID'), $('#endID'), false, false)
      servkit.initSelectWithList(
        context.preCon.get_m_device_list,
        $('#machine')
      )
      context.tempalteEngine = createTempalteEngine()
      context.reportIDReportTable = createReportTable({
        $tableElement: $('#reportID'),
        $tableWidget: $('#reportID-widget'),
        order: [[0, 'asc']],
      })
      $('#submitBtn').on('click', function (evt) {
        evt.preventDefault()
        try {
          //拿資料
          context.getData(
            $('#startID').val(),
            $('#endID').val(),
            $('#machine').val()
          )

          //產生報表
          servkit
            .politeCheck()
            .until(function () {
              return context.cncProgramLog
            })
            .thenDo(function () {
              var tableData = _.map(context.cncProgramLog, function (elem) {
                return [
                  //機台
                  elem.machine,
                  //動作
                  elem.action,
                  //開始時間
                  elem.command_start_time,
                  //結束時間
                  elem.command_end_time,
                  //結果
                  elem.result,
                  //程式名稱
                  elem.program,
                  //修改者IP
                  elem.ip_from_pc,
                  //修改者
                  elem.create_by,
                  //修改時間
                  elem.create_time,
                ]
              })

              context.reportIDReportTable.drawTable(tableData)
            })
            .tryDuration(0)
            .start()
        } catch (e) {
          console.debug(e)
        }
      })
    },
    util: {
      tempalteEngine: null,
      reportIDReportTable: null,
      cncProgramLog: [],
      getData: function getData(startDate, endDate, machineList) {
        var context = this
        context.cncProgramLog = undefined
        hippo
          .newSimpleExhaler()
          .space('cnc_program_command_log')
          .index('machine', machineList)
          .indexRange('date', startDate, endDate)
          .columns(
            'machine',
            'action',
            'command_start_time',
            'command_end_time',
            'result',
            'program',
            'ip_from_pc',
            'create_by',
            'create_time'
          )
          .exhale(function (exhalable) {
            context.cncProgramLog = exhalable.exhalable
          })
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
