import { ajax } from './servkit/ajax.js'
import servkit from './servkit/servkit.js'
import { getCookie } from './servkit/util.js'

function initIIOT() {
  // 若有未確認的通知，顯示最新一筆，可點選更多，連結至提醒通知查詢功能
  // 顯示警報結束時間是否為NULL(alarm_end_time NULL)且最後修改時間(modify_time)最新的一筆
  function showAlert() {
    $('#divSmallBoxes').html('')

    ajax(
      {
        url: 'api/getdata/db',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          table: 'a_iiot_machine_alarm_log',
          columns: [
            'DATE_FORMAT(alarm_log_id,"%Y-%m-%d %H:%i:%s") AS alarm_log_id',
            'machine_id',
            'alarm_content',
          ],
          whereClause:
            'alarm_end_time is Null AND alarm_type = "3" ORDER BY modify_time LIMIT 1',
        }),
      },
      {
        success(data) {
          if (data.length) {
            $.smallBox({
              title: '警報通知',
              content: `機台CM-92 ${data[0].alarm_content} <br>
            通知時間 : ${data[0].alarm_log_id}
            <p class='text-align-right'>
              <a id="IIOT-confirm" data-machine-id="${data[0].machine_id}" data-log-id="${data[0].alarm_log_id}" data-content="${data[0].alarm_content}" class="btn btn-success btn-sm">確認</a>
              </p>`,
              color: servkit.colors.red,
              icon: 'fa fa-bell swing animated',
            })

            $('#IIOT-confirm').on('click', function () {
              const logId = $(this).data('log-id')
              const machineId = $(this).data('machine-id')
              const content = $(this).data('content')
              const currentTime = moment(new Date()).format(
                'YYYY-MM-DD HH:mm:ss'
              )
              $.SmartMessageBox(
                {
                  title: '確認關閉通知',
                  content: `<h5>機台CM-92 ${content}</h5><h5 class="bg-color-red " style="display: table-cell;">關閉後，將不再提醒</h5>`,
                  buttons: '[取消][確認]',
                },
                function (ButtonPressed) {
                  if (ButtonPressed === '確認') {
                    ajax(
                      {
                        url: 'api/iiot/alarm/update',
                        contentType: 'application/json',
                        type: 'PUT',
                        data: JSON.stringify({
                          alarm_log_id: logId,
                          machine_id: machineId,
                          alarm_end_time: currentTime,
                        }),
                      },
                      {
                        success() {
                          // console.info(data)
                        },
                      }
                    )
                  }
                }
              )
            })
          }
        },
      }
    )
  }
  if (location.hash !== '#applist.html') {
    showAlert()
  }
  $(window).on('hashchange', showAlert)
}
function initAPlus() {
  //A+機台警報
  $('#header').append(
    '<div id="aplus-alarm-alert" style="display:none; position:fixed; z-index:999; top:0; left:50%;">' +
      '<span class="badge bg-color-red" data-toggle="modal" data-target="#alarm-msg-modal"><h5><i class="fa fa-warning"></i>&nbsp;Alarm</h5></span>' +
      //'<a href="' + servkit.rootPath + '/index.html#app/APlusAlarmDiagnosis/function/' + getCookie('lang') + '/02_alarm_log.html"><span class="badge bg-color-red"><h5><i class="fa fa-warning"></i>&nbsp;Alarm</h5></span><a>' +
      '</div>'
  )
  $('html').append(
    '<div id="alarm-msg-modal" class="modal fade" role="dialog">' +
      '<div class="modal-dialog modal-lg" style="width:95%">' +
      '<div class="modal-content">' +
      '<div class="modal-header">' +
      '<button type="button" class="close" data-dismiss="modal">&times;</button>' +
      '<h4 class="modal-title"><i class="fa fa-warning"></i> Alarm message</h4>' +
      '</div>' +
      '<div class="modal-body">' +
      //'<a id="to-alarm-log" class="btn btn-success" href="' + servkit.rootPath + '/index.html#app/APlusAlarmDiagnosis/function/' + getCookie('lang') + '/02_alarm_log.html">前往故障診斷紀錄查詢頁面</a>' +
      //'<br/><br/>' +
      '<div style="height:200px; overflow:auto;">' +
      '<table id="alarm-msg-table" class="table"></table>' +
      '</div>' +
      '</div>' +
      '<div class="modal-footer">' +
      '<button type="button" class="btn btn-default" data-dismiss="modal"><i class="fa fa-times"></i></button>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>'
  )
  $('#alarm-msg-modal').modal({
    backdrop: true,
  })
  $('#alarm-msg-modal').modal('hide')

  var $aplusAlarmAlert = $('#aplus-alarm-alert')
  var getAlarm = function () {
    ajax(
      {
        url: 'api/aplus/alarmdiagnosis/getAlarm',
        type: 'GET',
        contentType: 'application/json',
        data: '',
      },
      {
        success(data) {
          //console.log('data', data);
          if (Object.keys(data).length === 0) {
            $aplusAlarmAlert.hide()
          } else {
            $aplusAlarmAlert.show()
            $('#alarm-msg-table').html('')
            var alarmTableHtml =
              '<tr><th>機台</th><th>故障代碼</th><th>診斷結果</th><th>前往故障診斷紀錄查詢頁面</th></tr>'
            _.each(data, function (errorMsg) {
              //for(var index=0; index<50; index++){
              //    alarmTableHtml = alarmTableHtml + '<tr><td>' + servkit.getMachineName(errorMsg.machineId) + '</td><td>' + errorMsg.alarmId + '</td><td>' + errorMsg.result + '</td></tr>'
              //}
              alarmTableHtml =
                alarmTableHtml +
                '<tr><td>' +
                servkit.getMachineName(errorMsg.machineId) +
                '</td><td>' +
                errorMsg.alarmId +
                '</td><td>' +
                errorMsg.result +
                '</td><td><a class="btn btn-success to-alarm-log" href="' +
                servkit.rootPath +
                '/index.html#app/APlusAlarmDiagnosis/function/' +
                getCookie('lang') +
                '/02_alarm_log.html?alarmId=' +
                errorMsg.alarmId +
                '&machineId=' +
                errorMsg.machineId +
                '">前往</a></td></tr>'
            })
            $('#alarm-msg-table').html(alarmTableHtml)
          }

          $('.to-alarm-log')
            .off('click')
            .on('click', function () {
              $('#alarm-msg-modal').modal('hide')
            })
        },
      }
    )
  }
  getAlarm()
  setInterval(function () {
    getAlarm()
  }, 5000)

  //----------------------------------------------

  //A+缺陷通報
  $('#header').append(
    '<div id="aplus-alarm-alert-defect" style="display:none; position:fixed; z-index:999; top:0; left:30%;">' +
      '<span class="badge bg-color-red" data-toggle="modal" data-target="#alarm-defect-msg-modal"><h5><i class="fa fa-warning"></i>&nbsp;缺陷通報</h5></span>' +
      //'<a href="' + servkit.rootPath + '/index.html#app/APlusAlarmDiagnosis/function/' + getCookie('lang') + '/02_alarm_log.html"><span class="badge bg-color-red"><h5><i class="fa fa-warning"></i>&nbsp;Alarm</h5></span><a>' +
      '</div>'
  )
  $('html').append(
    '<div id="alarm-defect-msg-modal" class="modal fade" role="dialog">' +
      '<div class="modal-dialog modal-lg" style="width:95%">' +
      '<div class="modal-content">' +
      '<div class="modal-header">' +
      '<button type="button" class="close" data-dismiss="modal">&times;</button>' +
      '<h4 class="modal-title"><i class="fa fa-warning"></i> 缺陷異常設備通報</h4>' +
      '</div>' +
      '<div class="modal-body">' +
      '<div style="height:200px; overflow:auto;">' +
      '<table id="alarm-defect-msg-table" class="table"></table>' +
      '</div>' +
      '</div>' +
      '<div class="modal-footer">' +
      '<button type="button" class="btn btn-default" data-dismiss="modal"><i class="fa fa-times"></i></button>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>'
  )
  $('#alarm-defect-msg-modal').modal({
    backdrop: true,
  })
  $('#alarm-defect-msg-modal').modal('hide')
  var $aplusAlarmAlertDefect = $('#aplus-alarm-alert-defect')

  //$aplusAlarmAlertDefect.show();
  var getDefectAlarm = function getAlarm() {
    var today = moment().format('YYYY/MM/DD')
    //var today = '2018/10/03'
    ajax(
      {
        url: 'api/aplus/defect/getDefectHistoryByRange',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          startDate: today,
          endDate: today,
        }),
      },
      {
        success: function success(data) {
          //console.log('data', data);
          if (Object.keys(data).length === 0) {
            $aplusAlarmAlertDefect.hide()
          } else {
            $aplusAlarmAlertDefect.show()
            $('#alarm-defect-msg-table').html('')
            var alarmTableHtml =
              '<tr><th>缺陷類別</th><th>今日累積異常次數</th><th>關聯設備</th></tr>'
            var map = {}
            var detailMap = {}
            _.each(data, function (errorMsg) {
              //for(var index=0; index<50; index++){
              //    alarmTableHtml = alarmTableHtml + '<tr><td>' + servkit.getMachineName(errorMsg.machineId) + '</td><td>' + errorMsg.alarmId + '</td><td>' + errorMsg.result + '</td></tr>'
              //}
              //alarmTableHtml = alarmTableHtml + '<tr><td>' + servkit.getMachineName(errorMsg.machineId) + '</td><td>' + errorMsg.alarmId + '</td><td>' + errorMsg.result + '</td><td><a class="btn btn-success to-alarm-log-defect" href="' + servkit.rootPath + '/index.html#app/APlusAlarmDiagnosis/function/' + getCookie('lang') + '/02_alarm_log.html?alarmId=' + errorMsg.alarmId + '&machineId=' + errorMsg.machineId + '">前往</a></td></tr>';
              if (map[errorMsg.defect_type]) {
                map[errorMsg.defect_type] =
                  map[errorMsg.defect_type] + parseInt(errorMsg.defect_count)
                detailMap[errorMsg.defect_type][
                  errorMsg.machine_id
                ] = servkit.getMachineName(errorMsg.machine_id)
              } else {
                map[errorMsg.defect_type] = parseInt(errorMsg.defect_count)
                detailMap[errorMsg.defect_type] = {}
                detailMap[errorMsg.defect_type][
                  errorMsg.machine_id
                ] = servkit.getMachineName(errorMsg.machine_id)
              }
              //console.log(errorMsg);
            })

            _.each(map, function (count, type) {
              var machines = ''
              var first = true
              _.each(detailMap[type], function (machineName) {
                if (first) {
                  machines = machineName
                  first = false
                } else {
                  machines = machines + ', ' + machineName
                }
              })
              alarmTableHtml =
                alarmTableHtml +
                '<tr><td>' +
                type +
                '</td><td>' +
                count +
                '</td><td>' +
                machines +
                '</td></tr>'
            })

            //console.log('map', map);
            //console.log('detailMap', detailMap);
            $('#alarm-defect-msg-table').html(alarmTableHtml)
          }
        },
      }
    )
  }
  getDefectAlarm()
  setInterval(function () {
    getDefectAlarm()
  }, 60000)
}

function initCSU() {
  // 若有未確認的通知，顯示最新一筆，可點選更多，連結至提醒通知查詢功能
  // 顯示是否確認為否(is_close.N)且最後修改時間(modify_time)最新的一筆
  let showAlert = function () {
    $('#divSmallBoxes').html('')
    ajax(
      {
        url: 'api/getdata/db',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          table: 'a_chengshiu_alert_log',
          columns: ['log_id', 'content'],
          whereClause: 'is_close = "N" ORDER BY modify_time LIMIT 1',
        }),
      },
      {
        success: function (data) {
          if (data.length) {
            $.smallBox({
              title: '警報通知',
              content: `${data[0].content} <p class='text-align-right'>
              <a id="CSU-confirm" data-log-id="${data[0].log_id}" data-content="${data[0].content}" class="btn btn-success btn-sm">確認</a>
              <a href='${servkit.rootPath}/index.html#app/CSUMonitoringReport/function/zh_tw/99_alertNotificationQuery.html' class='btn btn-primary btn-sm'>更多</a>
              </p>`,
              color: servkit.colors.red,
              icon: 'fa fa-bell swing animated',
            })

            $('#CSU-confirm').on('click', function () {
              let logId = $(this).data('log-id')
              let content = $(this).data('content')
              $.SmartMessageBox(
                {
                  title: '確認關閉通知',
                  content: `<h5>${content}</h5><h5 class="bg-color-red " style="display: table-cell;">關閉後，將不再提醒</h5>`,
                  buttons: '[取消][確認]',
                },
                function (ButtonPressed) {
                  if (ButtonPressed === '確認') {
                    ajax(
                      {
                        url: 'api/chengshiu/alertlog/confirm',
                        type: 'POST',
                        data: {
                          logId: logId,
                        },
                      },
                      {
                        success: () => {
                          // console.info(data)
                        },
                      }
                    )
                  }
                }
              )
            })
          }
        },
      }
    )
  }
  if (location.hash !== '#applist.html') {
    showAlert()
  }
  $(window).on('hashchange', showAlert)

  if (JSON.parse(window.sessionStorage.loginInfo).user_id === 'admin') {
    let $btn = $(`<div id="csu-reset" class="btn-header transparent pull-right">
      <span> <a href="javascript:void(0);" title="回復平台預設"><i class="fa fa-undo"></i></a> </span>
    </div>`)
    $btn.on('click', function () {
      let r = window.confirm('目前工廠資料將會回復預設，確定要回復平台預設值？')
      if (!r) {
        return
      }
      $btn.find('i').addClass('fa-spin')
      ajax(
        {
          url: 'api/chengshiu/resetdb/reset',
          type: 'GET',
        },
        {
          success: function (data) {
            $.smallBox({
              title: data,
              color: servkit.colors.green,
              // sound_file: 'voice_off',
              timeout: 4000,
            })
          },
          error: function (data) {
            $.smallBox({
              title: data,
              color: servkit.colors.red,
              // sound_file: 'voice_off',
              timeout: 4000,
            })
          },
          always: function () {
            $btn.find('i').removeClass('fa-spin')
          },
        }
      )
    })
    $('#header>.pull-right').prepend($btn)
  }
}

export { initAPlus, initCSU, initIIOT }
