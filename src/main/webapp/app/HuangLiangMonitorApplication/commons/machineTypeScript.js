/**
 * Created with JetBrains WebStorm.
 * User: Jenny
 * Date: 2016/11/24
 * Time: 上午 10:51
 * To change this template use File | Settings | File Templates.
 */
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

    //找不到alarm code就找原生FANUC的alarm code
    alarm_description =
      machineTypeAlarmCodeMap[cnc_id][machine_type_id] &&
      machineTypeAlarmCodeMap[cnc_id][machine_type_id][alarm_id]
        ? machineTypeAlarmCodeMap[cnc_id][machine_type_id][alarm_id]
        : machineTypeAlarmCodeMap[cnc_id]['OTHER'][alarm_id] || '---'
  }

  return alarm_description
}
