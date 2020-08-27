exports.DIExposureMachine = (function (global, $, _, servkit) {
  var _conf = {
    container: '#space', // root container
    labelSize: 5, // 設定
    statusCommand: 'G_CONS()', // 狀態資料
    statusMap: {
      // 狀態表
      '11': 'online',
      '12': 'idle',
      '13': 'alarm',
      '0': 'offline',
      'B': 'offline',
    },
  }

  function dateTimezone(offset) {
    // 建立現在時間的物件
    var d = new Date()
    // 取得 UTC time
    var utc = d.getTime() + d.getTimezoneOffset() * 60000
    // 新增不同時區的日期資料
    return new Date(utc + 3600000 * offset)
  }

  function DIExposureMachine(conf) {
    // init
    var DIExposureMachineConfig = $.extend(true, _conf, conf)
    var $container = $(DIExposureMachineConfig.container)
    var $bg = $container.find('.bg')
    var device = servkit.getMachineList()[1]
    // var Historydate = '1'
    // $("#param11 .value").val('text',Historydate);
    // $("#param11 .value2").val('text',Historydate);

    var _loadEnv = function () {
      $bg.attr('src', './app/SuperpcbEquipMonitor/img/di_exposure.png')
      $('#status').html(servkit.getMachineName(device))
    }

    var updateProgress = function (id, value) {
      var regNum = /^[0-9.+-]+$/
      var percent = 0
      $container.find('#' + id + ' .active-value').html(value)
      if (regNum.test(value)) {
        percent = parseFloat((value / 5000) * 100).toFixed(1)
        if (parseFloat(value) > 5000) {
          $container
            .find('#' + id)
            .find('div.progress-bar')
            .addClass('bg-color-red')
          $container
            .find('#' + id)
            .find('div.progress-bar')
            .removeClass('bg-color-blue')
          $container
            .find('#' + id)
            .find('span.active-progress-value')
            .addClass('active_red')
        } else {
          $container
            .find('#' + id)
            .find('div.progress-bar')
            .removeClass('bg-color-red')
          $container
            .find('#' + id)
            .find('div.progress-bar')
            .addClass('bg-color-blue')
          $container
            .find('#' + id)
            .find('span.active-progress-value')
            .removeClass('active_red')
        }
      }
      $container
        .find('#' + id)
        .find('div.progress-bar')
        .attr('style', 'width: ' + percent + '%;')
    }

    var _updateShiftStatistic = function () {
      //從Hippo取得歷史資料
      hippo
        .newSimpleExhaler()
        .space('utilization_time_work_shift')
        .index('machine_id', [device])
        .indexRange('date', '20180402', '20180430')
        .columns('date', 'machine_id', 'power_millisecond', 'idle_millisecond')
        .exhale(function (data) {
          var list = data.exhalable
          var i = list.length - 1
          var datas = list[i]

          // 欄位到時候依照正確的格式修改

          var param11 = datas.date //起始時間
          var param12 = datas.date //結束時間
          var param13 = datas.machine_id
          var param14 = datas.power_millisecond
          var param16 = datas.idle_millisecond

          var A1 = document.querySelector('#param11 .value')
          if (param11 !== A1) {
            $('#space2').find('#param11').find('.value').text(param11)
            $('#space2').find('#param11').find('.value2').text(param12)
            $('#space2').find('#param13').find('.value').text(param13)
            $('#space2').find('#param14').find('.value').text(param14)
            $('#space2').find('#param16').find('.value').text(param16)
          }
        })
    }

    var _updateHistoryData = function () {
      servkit.ajax(
        {
          url: 'api/superpcb/history',
          type: 'GET',
          data: {
            machine_id: device,
          },
        },
        {
          success: function (data) {
            var startTime = '---'
            var endTime = '---'
            if (data['Start Time']) {
              startTime = moment(data['Start Time'], 'YYYYMMDDHHmmss').format(
                'YYYY/MM/DD HH:mm:ss'
              )
            }
            if (data['End Time']) {
              endTime = moment(data['End Time'], 'YYYYMMDDHHmmss').format(
                'YYYY/MM/DD HH:mm:ss'
              )
            }
            $('#space2').find('#param11').find('.value').text(startTime)
            $('#space2').find('#param11').find('.value2').text(endTime)
            $('#space2')
              .find('#param13')
              .find('.value')
              .text(data['Job Name'] || '---')
            $('#space2')
              .find('#param14')
              .find('.value')
              .text(data['Resist'] || '---')
            $('#space2')
              .find('#param16')
              .find('.value')
              .text(data['Panel Count'] || '---')
          },
        }
      )
    }

    var _changeSubscribeData = function (data) {
      // 取某命令某機資料
      //device-title update device status
      var statusValue = '0'
      var param1 = 0
      var param2 = 0
      var param3 = 0
      var param4 = 0
      var param5 = 0
      var param6 = 0
      var param7 = 0
      var param8 = 0
      var param9 = 0
      var param10 = 0
      var param15 = 0
      try {
        statusValue = data[device][DIExposureMachineConfig.statusCommand]
      } catch (e) {
        // console.warn(e)
      }
      try {
        param1 = data[device]['G_EXP01()'][0]
      } catch (e) {
        // console.warn(e)
      }
      try {
        param2 = data[device]['G_EXP02()'][0]
      } catch (e) {
        // console.warn(e)
      }
      try {
        param3 = data[device]['G_EXP03()'][0]
      } catch (e) {
        // console.warn(e)
      }
      try {
        param4 = data[device]['G_EXP10()'][0]
      } catch (e) {
        // console.warn(e)
      }
      try {
        param5 = data[device]['G_EXP04()'][0]
      } catch (e) {
        // console.warn(e)
      }
      try {
        param6 = data[device]['G_EXP05()'][0]
      } catch (e) {
        // console.warn(e)
      }
      try {
        param7 = data[device]['G_EXP06()'][0]
      } catch (e) {
        // console.warn(e)
      }
      try {
        param8 = data[device]['G_EXP07()'][0]
      } catch (e) {
        // console.warn(e)
      }
      try {
        param9 = data[device]['G_EXP08()'][0]
      } catch (e) {
        // console.warn(e)
      }
      try {
        param10 = data[device]['G_EXP09()'][0]
      } catch (e) {
        // console.warn(e)
      }
      try {
        param15 = data[device]['G_DATM()'][0]
      } catch (e) {
        // console.warn(e)
      }
      var status = DIExposureMachineConfig.statusMap[statusValue] || ''
      $container.find('#status').attr('class', 'device ' + status)
      $container
        .find('#param1 .value')
        .html(!param1 || param1 === 'B' ? '---' : param1)
      $container
        .find('#param2 .active-value')
        .html(!param2 || param2 === 'B' ? '---' : param2)
      $container
        .find('#param3 .active-value')
        .html(!param3 || param3 === 'B' ? '---' : param3)
      $container
        .find('#param4 .active-value')
        .html(!param4 || param4 === 'B' ? '---' : param4)
      $container
        .find('#param5 .active-value')
        .html(!param5 || param5 === 'B' ? '---' : param5)
      $container
        .find('#param6 .active-value')
        .html(!param6 || param6 === 'B' ? '---' : param6)
      updateProgress('param7', !param7 || param7 === 'B' ? 0 : Number(param7))
      updateProgress('param8', !param8 || param8 === 'B' ? 0 : Number(param8))
      updateProgress('param9', !param9 || param9 === 'B' ? 0 : Number(param9))
      updateProgress(
        'param10',
        !param10 || param10 === 'B' ? 0 : Number(param10)
      )
      $container
        .find('#param15 .value')
        .html(
          !param15 || param15 === 'B'
            ? '---'
            : moment(param15, 'YYYYMMDDHHmmss').format('HH:mm:ss')
        )
      // $container.find('#param15 span:first span').html((param15 || '---').moment().format('hh:mm:ss'))

      $('#exposure-time span:first').html(
        moment(dateTimezone(8)).format('HH:mm:ss')
      )
    }

    var _subscribeData = function () {
      // 聽device status
      servkit.subscribe('DeviceStatus', {
        machines: servkit.getBoxList(),
        handler: function (data) {
          var machineMap = {}
          servkit.convertDeviceStatusPb2Map(data, machineMap)
          _changeSubscribeData(machineMap)
          _updateHistoryData()
        },
        noDataHandler: function (data) {
          var machineMap = {}
          servkit.convertDeviceStatusPb2Map(data, machineMap)
          _changeSubscribeData(machineMap)
          _updateHistoryData()
        },
      })
    }

    if (
      DIExposureMachineConfig.source &&
      Object.keys(DIExposureMachineConfig.source).length
    ) {
      _changeSubscribeData(DIExposureMachineConfig.source)
      _updateHistoryData()
      $(window).on('hashchange', function hashChange() {
        DIExposureMachineConfig.source = undefined
        $(window).off('hashchange', hashChange)
      })
    } else {
      //to monitor page
      $('#exposure-leave-btn').on('click', function () {
        window.location.href =
          '#app/SuperpcbEquipMonitor/function/' +
          servkit.getCookie('lang') +
          '/10_plant_area.html'
      })
      _subscribeData()
      // _updateShiftStatistic();
    }

    _loadEnv()

    return {
      getConfig: function () {
        return DIExposureMachineConfig
      },
    }
  }

  return function (conf) {
    return DIExposureMachine(conf)
  }
})(this, $, _, servkit)
