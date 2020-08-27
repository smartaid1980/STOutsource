function render(widget, done, machineMap) {
  var is1366 = window.innerWidth >= 1366 && window.innerWidth < 1600,
    is1600 = window.innerWidth >= 1600 && window.innerWidth < 1920,
    is1920 = window.innerWidth == 1920

  var _chartSize = widget.isRotating() ? (is1366 ? 85 : 115) : 60

  // var _dataname = "monitor_overall";
  // var _column = ["id", "name", "pic", "x", "y", "index"];
  var _prefix_overall = 'OD_'
  var _prefix_detail = 'DD_'
  var _prefix_list = 'LD_'
  var speedRateMax = 150
  var feedRateMax = 250
  // var _lastData = {};

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
      '           <div class="easy-pie-chart txt-color-blue easyPieChart" data-pie-size="<%=chartSize%>" style="height:<%=chartSize%>px; width:<%=chartSize%>px;">' +
      '               <span class="txt-color-blue txt-percent">0</span>' +
      '           </div>' +
      '       </div>' +
      '       <div class="col col-xs-6 tab-panel txt-feed">' +
      '           <div class="title">{i18n_ServCloud_Feed}</div>' +
      '           <div class="easy-pie-chart txt-color-orange easyPieChart" data-pie-size="<%=chartSize%>" style="height:<%=chartSize%>px; width:<%=chartSize%>px;">' +
      '               <span class="txt-color-orange txt-percent">0</span>' +
      '           </div>' +
      '       </div>' +
      '   </div>' +
      '   <div class="tab-text">' +
      '       <div class="tab-panel txt-program">' +
      '           <div class="title">{i18n_ServCloudr_Program}</div>' +
      '           <div class="value">B</div>' +
      '       </div>' +
      '       <div class="tab-panel txt-quantity">' +
      '           <div class="title">{i18n_ServCloud_Quantity}</div>' +
      '           <div class="value">B</div>' +
      '       </div>' +
      '       <div class="tab-panel txt-productId">' +
      '           <div class="title">{i18n_ServCloud_Product_ID}</div>' +
      '           <div class="value">B</div>' +
      '       </div>' +
      '   </div>' +
      '</div>' +
      '</div>'
  )

  function _buildDevice(data) {
    // if ($space.length) {
    //     _buildDeviceObj($space, data);
    // }
    // if(!widget.build)
    // {
    console.warn('not build')
    data.name = servkit.getMachineName(data.id)
    if (data.name.length >= 10) {
      data.name =
        '...' + data.name.substring(data.name.length - 7, data.name.length)
    }

    var $container = widget.asJquery().find('.monitor-overall')
    var $list = $container.find('.list')

    if ($list.length) {
      _buildDeviceList($list, data)
      var el = $('#' + _prefix_list + data.id)
      if (is1366) {
        el.find('.txt-quantity').addClass('hidden')
      }
    }
    $container = null
    $list = null

    // }
    // else
    // {
    // console.log("already build");
    // }
  }

  function _buildDeviceList(container, data) {
    var obj = $.extend(data, {
      prefix: _prefix_list,
      clazz: 'item card',
      chartSize: _chartSize,
    })
    $(compiled_list(obj)).appendTo(container).data('source', data)
  }

  function _updateDeviceCard(el, data) {
    var status = data.status || ''
    var speed = data.speed || 0
    var speed_rate = data.speed_rate || 0
    var feed = data.feed || 0
    var feed_rate = data.feed_rate || 0
    var program = data.program || ''
    var quantity = data.quantity || '0'
    var product_id = data.product_id || '0'
    // if(product_id.length > 8){
    //   product_id = product_id.substring(0,8) + "-" + product_id.substring(8);
    // }
    // console.log("product_id : " + product_id);
    el.removeClass('online idle alarm')
      .addClass(status)
      .find('.txt-program .value')
      .html(program || '')
      .end()
      .find('.txt-quantity .value')
      .html(quantity || '')
      .end()
      .find('.txt-productId .value')
      .html(product_id || '')

    _updateEasyPieChart(
      el.find('.txt-speed .easyPieChart'),
      parseInt(speed) || 0,
      parseInt(speed_rate) || 0,
      speedRateMax
    )
    _updateEasyPieChart(
      el.find('.txt-feed .easyPieChart'),
      parseInt(feed) || 0,
      parseInt(feed_rate) || 0,
      feedRateMax
    )
  }

  function _updateEasyPieChart(chart, oldValue, rate, max) {
    var value = Math.round(parseFloat(oldValue))
    value = _.isNaN(value) ? 0 : value
    // original easyPieChart setting
    // if (parseInt(chart.attr('data-percent')) !== rate) {
    // console.debug('val:' + value + ' rate:' + rate);
    // chart.attr('data-percent', rate);
    // chart.data('easyPieChart').update(rate);
    // chart.data('easyPieChart').disableAnimation();

    // }
    var oneHundredPercent = 100
    var percentValue3 = oneHundredPercent - rate < 0 ? max - rate : max - 100
    var percentValue2 = Math.abs(100 - rate)
    var percentValue1 =
      oneHundredPercent - rate < 0 ? rate - percentValue2 : rate

    var dataSet = [
      {
        data: percentValue1,
        color: max == speedRateMax ? '#57889c' : '#b19a6b',
      },
      {
        data: percentValue2,
        color:
          100 - percentValue1 > 0
            ? '#DDDDDD'
            : max == speedRateMax
            ? '#a2daf2'
            : '#efd8a7',
      },
      {
        data: percentValue3,
        color: '#FFFFFF',
      },
    ]

    var options = {
      series: {
        pie: {
          show: true,
          innerRadius: 0.7,
        },
      },
    }
    $.plot(chart, dataSet, options)
    if (max == speedRateMax) {
      chart.append('<span class="txt-color-blue txt-percent">0</span>')
    } else {
      chart.append('<span class="txt-color-orange txt-percent">0</span>')
    }
    chart.find('.txt-percent').text(value)
  }

  function toNumber(val) {
    var result = parseInt(val)
    if (!_.isNaN(result) && _.isNumber(result)) {
      return result
    }
    return 0
  }

  function restore(machines) {
    var title =
      "<i class='fa fa-bar-chart-o'></i> <strong>" +
      '{i18n_ServCloud_Machine_List}' +
      '-' +
      servkit.getPlantAreaName(widget.plantId) +
      '</strong>'

    widget
      .asJquery()
      .find('h2')
      .replaceWith('<h2>' + title + '</h2>')

    var $container = widget.asJquery().find('.monitor-overall')
    var $list = $container.find('.list')
    // empty
    // $space.find('.device').remove();
    $list.find('.item').remove()
    // build
    _.each(machines, function (m) {
      _buildDevice({ id: m })
    })
    pageSetUp()
    $container = null
    $list = null
  }

  // change this for more plant
  // var index = widget.parameter.plantIndex;

  // keep all draw machine id
  // var machineIdList = [];

  // save collect machine's plant id
  // var plantId = "Zone demo";

  // function getPlantId() {
  //   servkit.ajax(
  //     {
  //       url: "api/getdata/db",
  //       type: "POST",
  //       async: false,
  //       contentType: "application/json",
  //       data: JSON.stringify({
  //         table: "m_plant",
  //         columns: ["plant_id"]
  //       })
  //     },
  //     {
  //       success: function(data) {
  //         if (data.length > index) {
  //           plantId = data[index].plant_id;
  //         } else {
  //           plantId = "";
  //         }

  //         widget.title =
  //           "<i class='fa fa-bar-chart-o'></i> <strong>" +
  //           "Machine List" +
  //           "-" +
  //           plantId +
  //           "</strong>";

  //         widget
  //           .asJquery()
  //           .find("h2")
  //           .replaceWith("<h2>" + widget.title + "</h2>");
  //       }
  //     }
  //   );
  // }

  // function getMachinePlant() {
  //   // getDbData("m_plant_area", ["device_id", "plant_id"], initSearchTalbeCallback);

  //   servkit.ajax(
  //     {
  //       url: "api/plantarea/getMachinePlantArea",
  //       type: "GET",
  //       async: false,
  //       contentType: "application/json"
  //     },
  //     {
  //       success: function(data) {
  //         for (var i = 0; i < data.machines.length; ++i) {
  //           var pid = data.machines[i].plant_id;
  //           if (pid.localeCompare(plantId) == 0) {
  //             machineIdList.push(data.machines[i].device_id);
  //           }
  //         }
  //       }
  //     }
  //   );
  // }

  if (!widget.isRestored || widget._current_rotating != widget.isRotating()) {
    ;(function () {
      var $container = widget.asJquery().find('.monitor-overall')
      var $list = $container.find('.list')

      // var machineIdList = [];
      widget.build = false

      if (widget.parameter.disable) {
        // disable
        if (typeof done === 'function') {
          done()
        }
        return
      }

      // machineIdList = [];
      // getPlantId();
      // getMachinePlant();

      /*
      if (machineIdList.length == 0) // no match machine
      {
        widget.asJquery().hide();
        widget.parameter.disable = true;
        done();
        return;
      } */

      restore(widget.plantMachines)
      // size
      if (widget.isRotating()) {
        // 判斷為指定尺寸時加上判斷
        // alert('window i: ' + $w.innerWidth(true) + ' html:' + $('html').width() + ' doc:' + $(document).width());
        if (is1366) {
          // alert('1366');
          $container.addClass('w1366')
        } else if (is1600) {
          // alert('1600')
          $container.addClass('w1600')
        } else if (is1920) {
          // alert('1920')
          $container.addClass('w1920')
        } else {
          console.warn('undefined size ' + window.innerWidth || $w.width())
        }
        // 輪播時要使用大版

        $container.addClass('large')
        var $w = $(window),
          $c = $list.find('.card:first'),
          ww = $w.width(),
          wh = $w.height() * 0.85,
          cw = $c.outerWidth(true) || $c.width(),
          ch = $c.outerHeight(true) || $c.height(),
          wi = 1,
          hi = 1,
          nw = ww,
          nh = wh

        if (ww && wh && cw && ch) {
          while (cw * wi < ww) {
            wi++
          }
          while (ch * hi < wh) {
            hi++
          }

          // 是1366, 1600, 1920時，限制寬度最多顯示5台，高度最多2排，共10台
          nw = is1920 ? 1490 : cw * --wi
          nh = ch * (is1366 || is1600 || is1920 ? 2 : --hi)

          $list.width(nw)
          $list.height(nh)
        }
      } else {
        $container.removeClass('large')
        //                $list.width('auto');
        $list.css({ width: 'auto', overflow: 'hidden' })
      }

      $container = null
      $list = null
    })()
    widget._current_rotating = widget.isRotating()
  }
  widget.isRestored = true

  if (!widget.parameter.disable) {
    // disable
    _.map(machineMap, function (machineData, machineId) {
      var brand = servkit.getMachineBrand(machineId)

      if (machineId.startsWith('_')) {
        var cons = machineData['G_CONS()'][0]
        var feed = toNumber(machineData['G_ACTF()'][0])
        var speed = toNumber(machineData['G_SPMS()'][0])
        var speed_rate = toNumber(machineData['G_SPSO()'][0])
        var feed_rate = toNumber(machineData['G_FERP()'][0])
        var program = machineData['G_PRGM()'][0]
        var quantity = toNumber(machineData['G_TOCP()'][0])
        var product_id = machineData['G_PGCM()'][0].split(',')[0].split(' ')[1]
        console.log('product_id : ' + product_id)

        var flag = false

        if (
          Object.prototype.hasOwnProperty.call(
            window,
            'ST_MONITOR_USE_SHIFT_DATA'
          )
        ) {
          flag = window.ST_MONITOR_USE_SHIFT_DATA
        }

        if (Object.prototype.hasOwnProperty.call(window, 'servtechConfig')) {
          flag = servtechConfig.ST_MONITOR_USE_SHIFT_DATA
        }

        if (flag) {
          if (
            widget.shiftStatisticMap != undefined &&
            widget.shiftStatisticMap[machineId] != undefined
          ) {
            if (
              widget.shiftStatisticMap[machineId][widget.curShiftName] !=
              undefined
            ) {
              if (
                quantity >
                widget.shiftStatisticMap[machineId][widget.curShiftName]
                  .partcount
              ) {
                quantity =
                  quantity -
                  widget.shiftStatisticMap[machineId][widget.curShiftName]
                    .partcount
              } else {
                quantity = 0
              }
            } else {
              console.warn('no shift data , use original quality')
              quantity = 0
            }
          }
        }

        // indicator lamp alwayse is 0
        if (brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1) {
          quantity = 0
        }

        var _data

        // check status
        var statusClass = ''

        switch (cons) {
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
          id: machineId,
          status: statusClass,
          speed: speed,
          speed_rate: parseInt(speed_rate) || 0,
          feed: feed,
          feed_rate: parseInt(feed_rate) || 0,
          program: program,
          quantity: quantity,
          product_id: product_id,
        }

        console.log('_data : ' + _data)
        // update to memory
        //        _lastData[id] = _data;

        // update space
        var $sd = $('#' + _prefix_overall + machineId)
        if ($sd.length) {
          $sd.removeClass('online idle alarm').addClass(statusClass)
        }
        $sd = null

        // update card
        var $lc = $('#' + _prefix_list + machineId)
        if ($lc.length) {
          _updateDeviceCard($lc, _data)
        }
        $lc = null

        // update detail
        var $sdd = $('#' + _prefix_detail + machineId)
        if ($sdd.length) {
          _updateDeviceCard($sdd, _data)
        }
        $sdd = null
      }
    })
  }

  if (typeof done === 'function') {
    done()
  }
}
