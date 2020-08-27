function render(widget, done, data) {
  var _status

  var _chartSize = widget.isRotating() ? 115 : 60

  var _dataname = 'monitor_overall'
  var _column = ['id', 'name', 'pic', 'x', 'y', 'index']
  var _prefix_overall = 'OD_'
  var _prefix_detail = 'DD_'
  var _prefix_list = 'LD_'

  var _lastData = {}

  // var compiled_overall = _.template('<div id="<%=prefix%><%=id%>" class="<%=clazz%>" style="top:<%=y%>px;left:<%=x%>px;z-index:<%=index%>;" data-id="<%=id%>">' +
  //     '<div class="picture">' +
  //     // '    <img src="<%=pic%>">' +
  //     '</div>' +
  //     // '<div class="status"></div>' +
  //     '<div class="info">' +
  //     '   <%=name%>' +
  //     '</div>' +
  //     '</div>');

  var compiled_list = _.template(
    '<div id="<%=prefix%><%=id%>" class="<%=clazz%>" data-id="<%=id%>">' +
      '<div class="header">' +
      '<div class="title"><%=name%></div>' +
      '<div class="status"></div>' +
      '</div>' +
      '<div class="content">' +
      '   <div class="tab-chart row">' +
      '       <div class="col col-xs-6 tab-panel txt-speed">' +
      '           <div class="title">{i18n_ServCloud_Speed}</div>' +
      '           <div class="easy-pie-chart txt-color-blue easyPieChart" data-percent="0" data-pie-size="<%=chartSize%>">' +
      '               <span class="txt-color-blue txt-percent">0</span>' +
      '       </div>' +
      '       </div>' +
      '       <div class="col col-xs-6 tab-panel txt-feed">' +
      '           <div class="title">{i18n_ServCloud_Feed}</div>' +
      '           <div class="easy-pie-chart txt-color-orange easyPieChart" data-percent="0" data-pie-size="<%=chartSize%>">' +
      '               <span class="txt-color-orange txt-percent">0</span>' +
      '           </div>' +
      '       </div>' +
      '   </div>' +
      '   <div class="tab-text">' +
      '       <div class="tab-panel txt-program">' +
      '           <div class="title">{i18n_ServCloud_Program}</div>' +
      '           <div class="value">B</div>' +
      '       </div>' +
      '       <div class="tab-panel txt-quantity">' +
      '           <div class="title">{i18n_ServCloud_Quantity}</div>' +
      '           <div class="value">B</div>' +
      '       </div>' +
      '   </div>' +
      '</div>' +
      '</div>'
  )

  var machines

  // var $panel = $('#monitor-panel');
  // var $space = $panel.find('.space');
  var $container = widget.asJquery().find('.monitor-overall')
  var $list = $container.find('.list')

  function _buildDevice(data) {
    data.name = servkit.getMachineName(data.id)
    // if ($space.length) {
    //     _buildDeviceObj($space, data);
    // }
    if ($list.length) {
      _buildDeviceList($list, data)
    }
  }

  // function _buildDeviceObj(container, data) {
  //     var obj = $.extend(data, {prefix: _prefix_overall, clazz: 'device'});
  //     $(compiled_overall(obj)).appendTo(container)
  //         .data('source', data);
  // }

  function _buildDeviceList(container, data) {
    var obj = $.extend(data, {
      prefix: _prefix_list,
      clazz: 'item card',
      chartSize: _chartSize,
    })
    $(compiled_list(obj)).appendTo(container).data('source', data)
  }

  // function _buildDeviceHoverDetail(container, data) {
  //     var obj = $.extend(data, {prefix: _prefix_detail, clazz: 'card detail'});
  //     var $d;
  //     container.find('.card').remove();
  //     $d = $(compiled_list(obj)).appendTo(container);
  //     pageSetUp();
  //     _updateDeviceCard($d, _lastData[obj.id] || {});
  // }

  // function _removeDeviceHoverDetail(container) {
  //     container.find('.card').remove();
  // }

  function _updateDeviceCard(el, data) {
    var status = data.status || ''
    var speed = data.speed || 0
    var speed_rate = data.speed_rate || 0
    var feed = data.feed || 0
    var feed_rate = data.feed_rate || 0
    var program = data.program || ''
    var quantity = data.quantity || ''

    el.removeClass('online idle alarm')
      .addClass(status)
      .find('.txt-program .value')
      .html(program || '')
      .end()
      .find('.txt-quantity .value')
      .html(quantity || '')

    _updateEasyPieChart(
      el.find('.txt-speed .easyPieChart'),
      parseInt(speed) || 0,
      parseInt(speed_rate) || 0
    )
    _updateEasyPieChart(
      el.find('.txt-feed .easyPieChart'),
      parseInt(feed) || 0,
      parseInt(feed_rate) || 0
    )
  }

  function _updateEasyPieChart(chart, value, rate) {
    value = Math.round(parseFloat(value))
    value = _.isNaN(value) ? 0 : value
    // if (parseInt(chart.attr('data-percent')) !== rate) {
    // console.debug('val:' + value + ' rate:' + rate);
    chart.attr('data-percent', rate)
    chart.data('easyPieChart').update(rate)
    chart.find('.txt-percent').text(value)
    // }
  }

  // function _parse(data) {
  //     var res = [];
  //     _.each(data, function(ele){
  //         var obj = {};
  //         _.each(ele, function(val, i){
  //             obj[_column[i]] = val;
  //         });
  //         res.push(obj);
  //     });
  //     return res;
  // }

  function restore(machines) {
    // empty
    // $space.find('.device').remove();
    $list.find('.item').remove()
    // build
    _.each(machines, function (m, i) {
      _buildDevice({
        id: m,
      })
    })
    pageSetUp()
  }

  // events
  // $panel
  //     .on('click', '.space .device', function(ev){
  //         var $device = $(this);
  //         var boxId = boxIdList[0],
  //             machineId = $device.attr('data-id'),
  //             cncBrand = 'FANUC';
  //         window.location = '#app/EquipMonitor/function/zh_tw/01_info.html' +
  //             '?boxId=' + boxIdList[0] + '&machineId=' + machineId + '&cncBrand=' + cncBrand;
  //     })
  //     .on('mouseenter', '.space .device', function(ev){
  //         var $device = $(this);
  //         _buildDeviceHoverDetail($space, $device.data('source'));
  //     })
  //     .on('mouseleave', '.space .device', function(ev){
  //         _removeDeviceHoverDetail($space);
  //     })
  //     .on('click', '.list .item .header .title', function(ev){
  //         var $device = $(this).parents('.item:first');
  //         var boxId = boxIdList[0],
  //             machineId = $device.attr('data-id'),
  //             cncBrand = 'FANUC';
  //         window.location = '#app/EquipMonitor/function/zh_tw/01_info.html' +
  //             '?boxId=' + boxIdList[0] + '&machineId=' + machineId + '&cncBrand=' + cncBrand;
  //     });

  // restore
  // servkit.ajax({
  //     url: 'api/getdata/file',
  //     type: 'POST',
  //     contentType: 'application/json',
  //     data: JSON.stringify({
  //         type: _dataname,
  //         pathPattern: "{data}",
  //         pathParam: {
  //             data: ["data"]
  //         }
  //     })
  // }, {
  //     success: function (data) {
  //         machines = _parse(data);
  //         // data 長這樣
  //         restore(machines);
  //     }
  // });
  if (!widget.isRestored || widget._current_rotating != widget.isRotating()) {
    ;(function () {
      var machineIdList = []
      servkit.eachMachine(function (id) {
        if (id.startsWith('_')) {
          machineIdList.push(id)
        }
      })
      restore(machineIdList)
      // size
      if (widget.isRotating()) {
        $container.addClass('large')
        var $c = $list.find('.card:first'),
          $w = $(window),
          ww = $w.width(),
          wh = $w.height() * 0.85,
          cw = $c.outerWidth(true) || $c.width(),
          ch = $c.outerHeight(true) || $c.height(),
          wi = 1,
          hi = 1
        if (ww && wh && cw && ch) {
          while (cw * wi < ww) {
            wi++
          }
          while (ch * hi < wh) {
            hi++
          }
          $list.width(cw * --wi)
          $list.height(ch * --hi)
        }
      } else {
        $container.removeClass('large')
        $list.width('auto')
      }
    })()
    widget._current_rotating = widget.isRotating()
  }
  widget.isRestored = true

  // get box
  // var boxIdList;
  // servkit.ajax({
  //     url: 'api/box/read',
  //     type: 'GET',
  //     async: false
  // }, {
  //     success: function (datas) {
  //         boxIdList = _.map(datas, function (box) {
  //             return box.box_id;
  //         });
  //     }
  // });

  // get data
  // 註冊 DeviceStatus
  // servkit.subscribe('DeviceStatus', {
  //     machines: boxIdList,
  //     handler: function (data) {
  // console.log(data);

  // 顯示出所有命令
  // console.log(data[0].listCommands());

  // 取某命令某機資料
  // data[0].getValue(command, machineId)

  // each 某命令所有機台
  _.each(data, function (DeviceStatusType) {
    DeviceStatusType.eachMachine('G_CONS()', function (multisystem, machineId) {
      var id = machineId
      var status = multisystem[0][0]

      var speed = DeviceStatusType.getValue('G_SPMS()', id)[0][0]
      var speed_rate = DeviceStatusType.getValue('G_SPSO()', id)[0][0]
      // var speed = Math.floor(Math.random() * 10000);
      // var speed_rate = Math.floor(Math.random() * 150);

      var feed = DeviceStatusType.getValue('G_ACTF()', id)[0][0]
      var feed_rate = DeviceStatusType.getValue('G_FERP()', id)[0][0]
      // var feed = Math.floor(Math.random() * 10000);
      // var feed_rate = Math.floor(Math.random() * 250);

      var program = DeviceStatusType.getValue('G_PRGM()', id)[0][0]
      var quantity = DeviceStatusType.getValue('G_TOCP()', id)[0][0]
      var _data

      // check status
      var statusClass = ''

      switch (status) {
        case '11':
          statusClass = 'online'
          break
        case '12':
          statusClass = 'idle'
          break
        case '13':
          statusClass = 'alarm'
          break
        default:
          break
      }

      // data
      _data = {
        id: id,
        status: statusClass,
        speed: speed,
        speed_rate: ((parseInt(speed_rate) || 0) / 150) * 100,
        feed: feed,
        feed_rate: ((parseInt(feed_rate) || 0) / 250) * 100,
        program: program,
        quantity: quantity,
      }

      // console.debug(data);
      // console.debug(_data);

      // update to memory
      _lastData[id] = _data

      // console.debug(id + ' s:' + status + ' sp:' + speed + ' f:' + feed + ' p:' + program + ' q:' + quantity + ' > '+ statusClass);

      // update space
      var $sd = $('#' + _prefix_overall + id)
      if ($sd.length) {
        $sd.removeClass('online idle alarm').addClass(statusClass)
      }

      // update card
      var $lc = $('#' + _prefix_list + id)
      if ($lc.length) {
        _updateDeviceCard($lc, _data)
        // $lc.removeClass('online idle alarm').addClass(statusClass)
        //  .find('.txt-program .value').html(program || '')
        //  .end()
        //  .find('.txt-quantity .value').html(quantity || '');

        // _updateEasyPieChart($lc.find('.txt-speed .easyPieChart'), parseInt(speed) || 0);
        // _updateEasyPieChart($lc.find('.txt-feed .easyPieChart'), parseInt(feed) || 0);
      }

      // update detail
      var $sdd = $('#' + _prefix_detail + id)
      if ($sdd.length) {
        _updateDeviceCard($sdd, _data)
        // $sdd.removeClass('online idle alarm').addClass(statusClass)
        //  .find('.txt-program .value').html(program || '')
        //  .end()
        //  .find('.txt-quantity .value').html(quantity || '');

        // _updateEasyPieChart($sdd.find('.txt-speed .easyPieChart'), parseInt(speed) || 0);
        // _updateEasyPieChart($sdd.find('.txt-feed .easyPieChart'), parseInt(feed) || 0);
      }
    })
  })
  //            data[0].eachMachine('G_CONS()', function (multisystem, machineId) {
  //                var id = machineId;
  //                var status = multisystem;
  //                var speed = data[0].getValue('G_SPMS()', id)[0][0];
  //                var speed_rate = data[0].getValue('G_SPSO()', id)[0][0];
  //                // var speed = Math.floor(Math.random() * 10000);
  //                // var speed_rate = Math.floor(Math.random() * 150);
  //
  //                var feed = data[0].getValue('G_ACTF()', id)[0][0];
  //                var feed_rate = data[0].getValue('G_FERP()', id)[0][0];
  //                // var feed = Math.floor(Math.random() * 10000);
  //                // var feed_rate = Math.floor(Math.random() * 250);
  //
  //                var program = data[0].getValue('G_PRGM()', id)[0][0];
  //                var quantity = data[0].getValue('G_TOCP()', id)[0][0];
  //                var _data;
  //
  //                // check status
  //                var statusClass = '';
  //
  //                switch(status[0][0]) {
  //                    case '11':
  //                        statusClass = 'online';
  //                        break;
  //                    case '12':
  //                        statusClass = 'idle';
  //                        break;
  //                    case '13':
  //                        statusClass = 'alarm';
  //                        break;
  //                    default:
  //                        break;
  //                }
  //
  //                // data
  //                _data = {
  //                    id: id,
  //                    status: statusClass,
  //                    speed: speed,
  //                    speed_rate: ((parseInt(speed_rate) || 0) / 150) * 100,
  //                    feed: feed,
  //                    feed_rate: ((parseInt(feed_rate) || 0) / 250) * 100,
  //                    program: program,
  //                    quantity: quantity
  //                };
  //
  //                // console.debug(data);
  //                // console.debug(_data);
  //
  //                // update to memory
  //                _lastData[id] = _data;
  //
  //                // console.debug(id + ' s:' + status + ' sp:' + speed + ' f:' + feed + ' p:' + program + ' q:' + quantity + ' > '+ statusClass);
  //
  //                // update space
  //                var $sd = $('#' + _prefix_overall + id);
  //                if ($sd.length) {
  //                    $sd.removeClass('online idle alarm').addClass(statusClass);
  //                }
  //
  //                // update card
  //                var $lc = $('#' + _prefix_list + id);
  //                if ($lc.length) {
  //                    _updateDeviceCard($lc, _data);
  //                    // $lc.removeClass('online idle alarm').addClass(statusClass)
  //                    //  .find('.txt-program .value').html(program || '')
  //                    //  .end()
  //                    //  .find('.txt-quantity .value').html(quantity || '');
  //
  //                    // _updateEasyPieChart($lc.find('.txt-speed .easyPieChart'), parseInt(speed) || 0);
  //                    // _updateEasyPieChart($lc.find('.txt-feed .easyPieChart'), parseInt(feed) || 0);
  //                }
  //
  //                // update detail
  //                var $sdd = $('#' + _prefix_detail + id);
  //                if ($sdd.length) {
  //                    _updateDeviceCard($sdd, _data);
  //                    // $sdd.removeClass('online idle alarm').addClass(statusClass)
  //                    //  .find('.txt-program .value').html(program || '')
  //                    //  .end()
  //                    //  .find('.txt-quantity .value').html(quantity || '');
  //
  //                    // _updateEasyPieChart($sdd.find('.txt-speed .easyPieChart'), parseInt(speed) || 0);
  //                    // _updateEasyPieChart($sdd.find('.txt-feed .easyPieChart'), parseInt(feed) || 0);
  //                }
  //            });
  //     },
  //     dataModeling: true
  // });

  done()
}
