exports.alarmCodeMapAnko = (function () {
  var cache

  return function (done) {
    if (cache) {
      done(cache)
    } else {
      var cncMap
      servkit.ajax(
        {
          url: 'api/getdata/db',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
            table: 'm_cnc_brand',
            columns: ['cnc_id', 'name'],
          }),
        },
        {
          success: function (data) {
            cncMap = {}
            _.each(data, function (elem) {
              cncMap[elem.cnc_id] = elem.name
            })
          },
        }
      )

      servkit.ajax(
        {
          url: 'api/getdata/db',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
            table: 'm_alarm',
            columns: ['alarm_id', 'cnc_id', 'alarm_status'],
          }),
        },
        {
          success: function (data) {
            var MITSUBISHI_TYPE = '1'
            var HITACHI_TYPE = '2'
            var MACHINE_1_TYPE = '01'
            var MACHINE_2_TYPE = '02'
            var MITSUBISHI_ID = 'Mitsubishi'
            var HITACHI_ID = 'Hitachi'
            var ANKO_ID = 'Anko'
            var trueAlarmMap = {}

            servkit
              .politeCheck()
              .until(function () {
                return cncMap
              })
              .thenDo(function () {
                _.each(data, function (ele) {
                  var currentAlarmKey = ele.alarm_id
                  if (ele.cnc_id == MITSUBISHI_ID || ele.cnc_id == HITACHI_ID) {
                    if (ele.alarm_id.toString().length == 1) {
                      //湊齊三碼
                      currentAlarmKey = '00' + currentAlarmKey
                    } else if (ele.alarm_id.toString().length == 2) {
                      //湊齊三碼
                      currentAlarmKey = '0' + currentAlarmKey
                    }

                    if (ele.cnc_id == MITSUBISHI_ID) {
                      //三菱變頻器
                      currentAlarmKey = MITSUBISHI_TYPE + currentAlarmKey // 加上1碼type變四碼
                    } else {
                      //日立變頻器
                      currentAlarmKey = HITACHI_TYPE + currentAlarmKey // 加上1碼type變四碼
                    }
                  } else if (ele.cnc_id == ANKO_ID) {
                    //安口的機台
                    //保持原來的
                  } else {
                    currentAlarmKey = '' //
                  }

                  if (currentAlarmKey != '') {
                    var trueAlarmVal10 = parseInt(ele.alarm_id)
                    var trueAlarmVal16 = trueAlarmVal10
                      .toString(16)
                      .toUpperCase() //十六進位
                    if (trueAlarmVal16.length == 1) {
                      trueAlarmVal16 = '0' + trueAlarmVal16
                    }
                    trueAlarmMap[currentAlarmKey] = {
                      cncId: ele.cnc_id,
                      cncName: cncMap[ele.cnc_id],
                      alarm10: trueAlarmVal10.toString(),
                      alarm16: trueAlarmVal16,
                      alarmStatus: ele['alarm_status'],
                    }
                  }
                })
                cache = trueAlarmMap
                done(cache)
              })
              .tryDuration(0)
              .start()
          },
        }
      )
    }
  }
})()

exports.alarmCodeMap = (function () {
  var alarmCodeMap
  return function (done) {
    if (alarmCodeMap) {
      done(alarmCodeMap)
    } else {
      servkit.ajax(
        {
          url: 'api/getdata/db',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
            table: 'm_alarm',
            columns: ['alarm_id', 'cnc_id', 'alarm_status', 'description'],
          }),
        },
        {
          success: function (data) {
            var cncList = _.pluck(data, 'cnc_id')
            alarmCodeMap = {}
            _.each(cncList, function (cncId) {
              alarmCodeMap[cncId] = {}
              _.each(data, function (elem) {
                alarmCodeMap[cncId][elem.alarm_id] = {
                  status: elem.alarm_status,
                  desc: elem.description,
                }
              })
            })
            done(alarmCodeMap)
          },
        }
      )
    }
  }
})()
