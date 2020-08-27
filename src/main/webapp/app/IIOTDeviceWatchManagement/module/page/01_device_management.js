export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      ctx.showSystemUpdateAlarmTime()

      function createAndUpdateSend(tdEles) {
        return {
          cnc_brand: (function () {
            var machineId = $(tdEles[1]).find(':selected').val()
            var cncId = ctx.preCon.queryDeviceBrand[machineId]
            return cncId
          })(),
          group_id: (function () {
            var deptId = $(tdEles[2]).find(':selected').val()
            var groupId = ctx.preCon.queryDeptMachineGp[deptId].group_id
            return groupId
          })(),
          machine_name: (function () {
            var machineId = $(tdEles[1]).find(':selected').val()
            var machineName = ctx.preCon.queryDeviceId2Name[machineId]
            return machineName
          })(),
          dept_name: (function () {
            var deptId = $(tdEles[2]).find(':selected').val()
            var deptName = ctx.preCon.queryDept[deptId]
            return deptName
          })(),
        }
      }

      servkit.crudtable({
        tableSelector: '#device-watch-management',
        tableModel: 'com.servtech.servcloud.app.model.iiot.IiotDeptMachine',
        hideCols: [1, 5, 6, 7],
        order: [[0, 'asc']],
        create: {
          url: 'api/stdcrud',
          start: function (newTr, table) {
            $('[name=cnc_brand]').val(' ')
            $('[name=group_id]').val(' ')
            $('[name=machine_name]').val(' ')
            $('[name=dept_name]').val(' ')
          },
          send: createAndUpdateSend,
        },
        read: {
          url: 'api/stdcrud',
        },
        update: {
          url: 'api/stdcrud',
          send: createAndUpdateSend,
        },
        delete: {
          url: 'api/stdcrud',
        },
        validate: {
          2: function (td, table) {
            var deviceName2Id = _.invert(ctx.preCon.queryDeviceId2Name)
            var input = td.querySelector('select')
            if (!input.disabled) {
              if (
                _.find(table.columns(1).data().eq(0), function (existId) {
                  return (
                    deviceName2Id[existId].toLowerCase() ===
                    input.value.toLowerCase()
                  )
                })
              ) {
                return '機台重複'
              }
            }
          },
        },
      })
    },
    util: {
      $updateEnableAlarmTime: $('#update-enable-alarm-time'),
      showSystemUpdateAlarmTime: function () {
        var ctx = this
        var html =
          '<font style="color:' +
          servkit.colors.red +
          ';">前次系統排程更新開啟機台告警時間: ' +
          (ctx.preCon.systemJobLog[0] === undefined
            ? '排程尚未更新'
            : ctx.preCon.systemJobLog[0]['end_time']) +
          '</font>'
        ctx.$updateEnableAlarmTime.html(html)
      },
    },
    preCondition: {
      queryDeptMachineGp: function (done) {
        servkit.ajax(
          {
            url: servkit.rootPath + '/api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_iiot_dept_machine_gp',
              columns: ['dept_id', 'group_id'],
              whereClause: 'is_open = "Y"',
            }),
          },
          {
            success: function (data) {
              var dept2GpMap = _.indexBy(data, 'dept_id')
              done(dept2GpMap)
            },
            fail: function (data) {
              console.warn(data)
            },
          }
        )
      },
      systemJobLog: function (done) {
        servkit.ajax(
          {
            url: servkit.rootPath + '/api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_iiot_system_job_log',
              columns: [
                'system_job_id',
                'DATE_FORMAT(end_time,"%Y-%m-%d %H:%i:%s") AS end_time',
              ],
              whereClause:
                'system_job_id LIKE "%enable_alarm%" order by end_time desc limit 1',
            }),
          },
          {
            success: function (data) {
              done(data)
            },
            fail: function (data) {
              console.warn(data)
            },
          }
        )
      },
      queryDeviceId2Name: function (done) {
        servkit.ajax(
          {
            url: servkit.rootPath + '/api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'm_device',
              columns: ['device_id', 'device_name'],
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
            fail: function (data) {
              console.warn(data)
            },
          }
        )
      },
      queryDept: function (done) {
        servkit.ajax(
          {
            url: servkit.rootPath + '/api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_iiot_dept',
              columns: ['dept_id', 'dept_name'],
              whereClause: 'is_open = "Y"',
            }),
          },
          {
            success: function (data) {
              var dataMap = {}
              _.each(data, function (elem, key) {
                dataMap[elem.dept_id] = elem.dept_name
              })
              done(dataMap)
            },
            fail: function (data) {
              console.warn(data)
            },
          }
        )
      },
      queryDeviceBrand: function (done) {
        servkit.ajax(
          {
            url: servkit.rootPath + '/api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'm_device_cnc_brand',
              columns: ['device_id', 'cnc_id'],
            }),
          },
          {
            success: function (data) {
              var dataMap = {}
              _.each(data, function (elem, key) {
                dataMap[elem.device_id] = elem.cnc_id
              })
              done(dataMap)
            },
            fail: function (data) {
              console.warn(data)
            },
          }
        )
      },
      queryDeptMachine: function (done) {
        servkit.ajax(
          {
            url: servkit.rootPath + '/api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_iiot_dept_machine',
              columns: ['machine_id', 'dept_id'],
            }),
          },
          {
            success: function (data) {
              var dataMap = {}
              _.each(data, function (elem, key) {
                dataMap[elem.machine_id] = elem.dept_id
              })
              done(dataMap)
            },
            fail: function (data) {
              console.warn(data)
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
