exports.superpcbPlantArea = (function (global, $, _, servkit) {
  var _conf = {
    container: '#plant-area-space', // root container
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
    // show 時的格式
    widgetBody:
      '<div id="<%= id %>" data-page-name="<%= pageName %>" class="device" style="top: <%= top %>; left: <%= left %>">' +
      '  <div class="device-title clearfix">' +
      '    <div class="text">' +
      '      <span><%= name %></span>' +
      '    </div>' +
      '  </div>' +
      '  <div class="picture"></div>' +
      '</div>',
  }

  function dateTimezone(offset) {
    // 建立現在時間的物件
    var d = new Date()
    // 取得 UTC time
    var utc = d.getTime() + d.getTimezoneOffset() * 60000
    // 新增不同時區的日期資料
    return new Date(utc + 3600000 * offset)
  }

  function superpcbPlantArea(conf) {
    // init
    var superpcbPlantAreaConfig = $.extend(true, _conf, conf)
    var $container = $(superpcbPlantAreaConfig.container)
    var $bg = $container.find('.bg')
    var devices = servkit.getMachineList()

    var _loadEnv = function () {
      $bg.attr(
        'src',
        './app/SuperpcbEquipMonitor/img/plant_area_background.png'
      )

      var html = []
      html.push(
        _.template(superpcbPlantAreaConfig.widgetBody)({
          id: devices[0],
          pageName: 'outer_layer_treatment',
          name: '外層前處理',
          top: '29%',
          left: '25%',
        })
      )
      html.push(
        _.template(superpcbPlantAreaConfig.widgetBody)({
          id: devices[1],
          pageName: 'DI_exposure_machine',
          name: 'DI曝光機',
          top: '37%',
          left: '84%',
        })
      )
      $container
        .find('.device')
        .remove()
        .end()
        .children('div')
        .append(html.join(''))
    }

    var _changeSubscribeData = function (data) {
      // 取某命令某機資料
      _.each(devices, function (device) {
        //device-title update device status
        var statusAry = '0'
        try {
          statusAry = data[device][superpcbPlantAreaConfig.statusCommand]
        } catch (e) {
          // console.warn(e)
        }
        var status = superpcbPlantAreaConfig.statusMap[statusAry] || ''
        $('#plant-area-space')
          .find('#' + device)
          .attr('class', 'device ' + status)
      })
    }

    var _subscribeData = function () {
      // 聽device status
      servkit.subscribe('DeviceStatus', {
        machines: servkit.getBoxList(),
        handler: function (data) {
          var machineMap = {}
          servkit.convertDeviceStatusPb2Map(data, machineMap)
          _changeSubscribeData(machineMap)
        },
        noDataHandler: function (data) {
          var machineMap = {}
          servkit.convertDeviceStatusPb2Map(data, machineMap)
          _changeSubscribeData(machineMap)
        },
      })
    }

    var toMonitorPage = function (machineId) {
      var lang = servkit.getCookie('lang')
      //*** 用來辨識從監控離開時，要回哪個app的子頁面
      window.location =
        '#app/SuperpcbEquipMonitor/function/' +
        lang +
        '/20_' +
        machineId +
        '.html'
    }

    if (
      superpcbPlantAreaConfig.source &&
      Object.keys(superpcbPlantAreaConfig.source).length
    ) {
      _changeSubscribeData(superpcbPlantAreaConfig.source)
      $('#plant-area-time span:last').removeClass('hide')
      $('#plant-area-time span:first').html(
        moment(dateTimezone(8)).format('HH:mm:ss')
      )
      $(window).on('hashchange', function hashChange() {
        superpcbPlantAreaConfig.source = undefined
        $(window).off('hashchange', hashChange)
      })
    } else {
      _loadEnv()
      _subscribeData()
      $('#plant-area-time span:last').addClass('hide')
      var loginTime = global.sessionStorage.getItem('loginTime') || ''
      if (loginTime) {
        loginTime = loginTime.split(' ')[1]
      }
      $('#plant-area-time span:first').html(loginTime)
    }

    return {
      getConfig: function () {
        return superpcbPlantAreaConfig
      },
    }
  }

  return function (conf) {
    return superpcbPlantArea(conf)
  }
})(this, $, _, servkit)
