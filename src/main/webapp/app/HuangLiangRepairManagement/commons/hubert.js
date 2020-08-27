exports.diffTime = function (start, end) {
  if (start === '---' || end === '---') {
    return '---'
  }
  return moment
    .utc(
      moment(end, 'YYYY/MM/DD HH:mm:ss').diff(
        moment(start, 'YYYY/MM/DD HH:mm:ss')
      )
    )
    .format('HH:mm:ss')
}

exports.priorityText = function (prio) {
  switch (prio) {
    case 0:
      return '普'
    case 1:
      return '低'
    case 2:
      return '中'
    case 3:
      return '高'
    default:
      return prio
  }
}

var empTable
exports.getEmpTable = function (done) {
  if (empTable) {
    done(empTable)
  } else {
    servkit.ajax(
      {
        url: 'api/user/read',
        type: 'GET',
      },
      {
        success: function (datas) {
          empTable = _.reduce(
            datas,
            function (memo, data) {
              memo[data.user_id] = data.user_name
              return memo
            },
            {}
          )
          done(empTable)
        },
      }
    )
  }
}

var alarmCodeTable
exports.getAlarmCodeTable = function (done) {
  if (alarmCodeTable) {
    done(alarmCodeTable)
  } else {
    servkit.ajax(
      {
        url: 'api/alarm/read',
        type: 'GET',
      },
      {
        success: function (datas) {
          alarmCodeTable = _.reduce(
            datas,
            function (memo, data) {
              memo[data.alarm_id] = data.alarm_status
              return memo
            },
            {}
          )
          done(alarmCodeTable)
        },
      }
    )
  }
}

var priority
exports.getPriority = function (done) {
  if (priority) {
    done(priority)
  } else {
    servkit.ajax(
      {
        url: 'api/huangliang/repair/priority',
        type: 'GET',
      },
      {
        success: function (datas) {
          priority = _.reduce(
            datas,
            function (memo, data) {
              memo[data.machine_id] = data.priority
              return memo
            },
            {}
          )
          done(priority)
        },
      }
    )
  }
}
