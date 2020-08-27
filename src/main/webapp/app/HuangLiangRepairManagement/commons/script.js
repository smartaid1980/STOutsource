//廠務助理
exports.factory_service_assistant = 'factory_service_assistant'
//廠務部副理群組
exports.factory_service_deputy_manager = 'factory_service_deputy_manager'
//廠務校車群組
exports.factory_service_regulate = 'factory_service_regulate'
//組長
exports.leader = 'leader'
//管理部助理
exports.management_assistant = 'management_assistant'
//製一副課長群組
exports.process_deputy_manager_1 = 'process_deputy_manager_1'
//製二副課長群組
exports.process_deputy_manager_2 = 'process_deputy_manager_2'
//製一課長群組
exports.process_manager_1 = 'process_manager_1'
//製二課長群組
exports.process_manager_2 = 'process_manager_2'
//研發副課長群組
exports.rd_deputy_manager = 'rd_deputy_manager'
//研發副理群組
exports.rd_manager = 'rd_manager'
//研發校車
exports.rd_regulate = 'rd_regulate'
//維修人員
exports.repair = 'repair'
//業務副課長群組
exports.sales_deputy_manager = 'sales_deputy_manager'
//業務副理群組
exports.sales_manager = 'sales_manager'
//高階主管群組
exports.top_manager = 'top_manager'
//系統管理員群組
exports.sys_manager_group = 'sys_manager_group'
//超級管理員群組
exports.sys_super_admin_group = 'sys_super_admin_group'
//廠長群組
exports.factory_manager = 'factory_manager'

//machineTypeAlarmCodeTable[cnc_id][machine_type_id][alarm_id] = description || alarm_status
var machineTypeAlarmCodeMap
exports.machineTypeAlarmCodeMap = function (done) {
  if (machineTypeAlarmCodeMap) {
    done(machineTypeAlarmCodeMap)
  } else {
    servkit.ajax(
      {
        url: 'api/getdata/db',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          table: 'm_alarm',
          columns: [
            'alarm_id',
            'cnc_id',
            'machine_type_id',
            'alarm_status',
            'description',
          ],
        }),
      },
      {
        success: function (datas) {
          machineTypeAlarmCodeMap = _.reduce(
            datas,
            function (memo, data) {
              if (!memo[data.cnc_id]) {
                memo[data.cnc_id] = {}
              }
              if (!memo[data.cnc_id][data.machine_type_id]) {
                memo[data.cnc_id][data.machine_type_id] = {}
              }

              memo[data.cnc_id][data.machine_type_id][data.alarm_id] =
                data.description || data.alarm_status
              return memo
            },
            {}
          )
          done(machineTypeAlarmCodeMap)
        },
      }
    )
  }
}

//machineCncTypeMap[machine_id] = {cnc_id:cnc_id, machine_type_id, machine_type_id}
var machineCncTypeMap
exports.machineCncTypeMap = function (done) {
  if (machineCncTypeMap) {
    done(machineCncTypeMap)
  } else {
    servkit.ajax(
      {
        url: 'api/machine/read',
        method: 'GET',
      },
      {
        success: function (datas) {
          machineCncTypeMap = _.reduce(
            datas,
            function (memo, data) {
              if (!memo[data.device_id]) {
                memo[data.device_id] = {}
              }
              memo[data.device_id] = {
                cnc_id: data.device_cnc_brands[0].cnc_id,
                machine_type_id: data.device_type,
              }
              return memo
            },
            {}
          )
          done(machineCncTypeMap)
        },
      }
    )
  }
}

exports.getAlarmDescription = function (machine_id, alarm_id) {
  var alarm_description = '---'
  if (machineCncTypeMap && machineTypeAlarmCodeMap) {
    var cnc_id = machineCncTypeMap[machine_id].cnc_id
    var machine_type_id = machineCncTypeMap[machine_id].machine_type_id

    try {
      //找不到alarm code就找原生FANUC的alarm code
      alarm_description =
        machineTypeAlarmCodeMap[cnc_id][machine_type_id][alarm_id] ||
        machineTypeAlarmCodeMap[cnc_id]['OTHER'][alarm_id] ||
        '---'
    } catch (e) {
      console.warn(
        'No ' + alarm_id + ' in [' + cnc_id + '][' + machine_type_id + ']'
      )
      console.warn(e)
    }
  }

  return alarm_description
}

exports.getUserList = (function () {
  var cachedUser
  return function (done) {
    if (cachedUser) {
      done(cachedUser)
    } else {
      hippo
        .newSimpleExhaler()
        .space('HUL_care_employees')
        .index('customer_id', ['HuangLiang'])
        .columns('employee_id', 'employee_name')
        .exhale(function (exhalable) {
          cachedUser = {}
          _.each(exhalable.exhalable, function (elem) {
            cachedUser[elem.employee_id] = elem.employee_name
          })
        })

      servkit.ajax(
        {
          url: 'api/user/read',
          type: 'GET',
          contentType: 'application/json',
        },
        {
          success: function (data) {
            servkit
              .politeCheck()
              .until(function () {
                return cachedUser
              })
              .thenDo(function () {
                _.each(data, function (sysUser) {
                  cachedUser[sysUser.user_id] = sysUser.user_name
                })
                done(cachedUser)
              })
              .tryDuration(0)
              .start()
          },
        }
      )
    }
  }
})()

exports.fillZeroTo5Digit = function (userId) {
  if (!_.isNaN(parseInt(userId))) {
    while (userId.length < 5) {
      userId = '0' + userId
    }
  }
  return userId
}

exports.getUserName = function (userGroupList, macro521) {
  while (macro521.length < 5) {
    macro521 = '0' + macro521
  }
  return userGroupList[macro521] || macro521
}

exports.calcDuration = function (start, end, pause) {
  if (start === '---' || end === '---') {
    return '---'
  }
  return moment
    .utc(
      moment(end, 'YYYY/MM/DD HH:mm:ss').diff(
        moment(start, 'YYYY/MM/DD HH:mm:ss')
      ) - pause
    )
    .format('HH:mm:ss')
}
