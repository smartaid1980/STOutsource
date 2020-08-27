// 整廠監控
exports.monitor = (function (global, $, _, servkit) {
  var _self = this

  var _conf = {
    // app id
    currentAppId: 'EquipMonitor',
    // page
    currentPage: '',
    // 儲存的資料名稱
    dataname: 'monitor_overall',
    // 物件欄位名稱
    columns: ['id', 'name', 'pic', 'x', 'y', 'index'],
    // column title
    titles: {
      pieLeftName: 'Speed',
      pieRightName: 'Feed',
      txtFirstName: 'Program',
      txtLastName: 'Quantity',
    },

    machines: null,

    // 狀態資料
    statusCommand: 'G_CONS()',
    // 狀態表
    statusMap: {
      '11': 'online',
      '12': 'idle',
      '13': 'alarm',
    },
    // 資料的對應
    dataCommand: {
      speed: {
        column: 'G_SPMS()',
        target: 'pieLeftTxt',
      },
      speedRate: {
        column: 'G_SPSO()',
        target: 'pieLeft',
        filter: function (data) {
          var val = ((parseInt(data) || 0) / 150) * 100
          return Math.round(parseFloat(val)) || 0
        },
      },
      feed: {
        column: 'G_ACTF()',
        target: 'pieRightTxt',
      },
      feedRate: {
        column: 'G_FERP()',
        target: 'pieRight',
        filter: function (data) {
          var val = ((parseInt(data) || 0) / 250) * 100
          return Math.round(parseFloat(val)) || 0
        },
      },
      program: {
        column: 'G_PRGM()',
        target: 'txtFirst',
        filter: function (data) {
          if (
            data.length > 0 &&
            data[0].length > 0 &&
            data[0][0].indexOf('\\')
          ) {
            var tempArr = data[0][0].split('\\')
            data[0][0] = tempArr[tempArr.length - 1] //取"\"最後一個後替換
          }
          //加工程式最後結果的長度大於8則取6位數後面加3個點
          if (data.length > 0 && data[0].length > 0 && data[0][0].length >= 8) {
            if (data[0][0].length > 8) {
              data[0][0] = data[0][0].substring(0, 6) + '...'
            }
            // else{
            //   data[0][0] = data[0][0];//prdataogram[0][0].substring(0, 8);
            // }
          }
          return data
        },
      },
      quantity: {
        column: 'G_TOCP()',
        target: 'txtLast',
      },
    },

    // root container
    container: '.monitor-overall',

    // space 的背景圖
    // background: './app/EquipMonitor/img/overall/space.jpg',
    background: 'api/equipmonitor/plantBackground',
    // space 背景圖快取開關
    backgroundCache: false,
    // device 的 root
    deviceContainer: '.space',
    // device elem 的ID前綴
    devicePrefix: 'SD_',
    // device elem 的結構
    deviceHtml:
      '<div id="<%=prefix%><%=id%>" class="<%=clazz%>" style="top:<%=y%>;left:<%=x%>;z-index:<%=index%>;" data-id="<%=id%>">' +
      '<div class="picture">' +
      '</div>' +
      '<div class="info">' +
      '  <%=name%>' +
      '</div>' +
      '</div>',

    // space detail
    detailPrefix: 'SDD_',

    // card 的 root
    cardContainer: '.list',
    // card elem 的ID前綴
    cardPrefix: 'CD_',
    // card elem 的結構
    cardHtml:
      '<div id="<%=prefix%><%=id%>" class="<%=clazz%>" data-id="<%=id%>">' +
      '<div class="header">' +
      '   <div class="title"><%=name%></div>' +
      '   <div class="status"></div>' +
      '</div>' +
      '<div class="content">' +
      '  <div class="tab-chart row">' +
      '    <div class="col col-xs-6 tab-panel pie-left">' +
      '           <div class="title"><%=pieLeftName%></div>' +
      '      <div class="easy-pie-chart txt-color-blue easyPieChart" data-percent="0" data-pie-size="<%=pieSize%>">' +
      '        <span class="txt-color-blue txt-percent txt-left">0</span>' +
      '        </div>' +
      '    </div>' +
      '    <div class="col col-xs-6 tab-panel pie-right">' +
      '           <div class="title"><%=pieRightName%></div>' +
      '      <div class="easy-pie-chart txt-color-orange easyPieChart" data-percent="0" data-pie-size="<%=pieSize%>">' +
      '        <span class="txt-color-orange txt-percent txt-right">0</span>' +
      '      </div>' +
      '    </div>' +
      '  </div>' +
      '  <div class="tab-text">' +
      '    <div class="tab-panel">' +
      '      <div class="title"><%=txtFirstName%></div>' +
      '      <div class="value txt-first">B</div>' +
      '    </div>' +
      '    <div class="tab-panel">' +
      '      <div class="title"><%=txtLastName%></div>' +
      '      <div class="value txt-last">B</div>' +
      '    </div>' +
      '  </div>' +
      '</div>' +
      '</div>',
    cardPieSize: 60,

    // edit 時 option 的 root
    editOptionContainer: '.option',
    // edit 時 device elem 的結構
    editDeviceHtml:
      '<div class="device work draggable" style="top:<%=y%>;left:<%=x%>;z-index:<%=index%>;">' +
      '<div class="picture">' +
      '</div>' +
      '<div class="info">' +
      '  <%=name%>' +
      '</div>' +
      '<div class="opt">' +
      '<i class="glyphicon glyphicon-remove act-remove"></i>' +
      '<i class="glyphicon glyphicon-edit act-edit"></i>' +
      '</div>' +
      '</div>',
    // edit 時 device 預設資料
    editProto: {
      id: 'M00',
      name: 'M00',
      pic: './app/EquipMonitor/img/3d/device.png',
      x: 0 + '%',
      y: 0 + '%',
      index: 1,
    },
    // edit 無 id時的序號產生
    editIdGen: function (i) {
      return 'M' + ('00' + i).substr(-2)
    },
    // edit 時輸入機號的訊息
    editIdPromptMsg: '請輸入機台ID',
    // edit 時儲存成功的訊息
    editSaveSuccessMsg: '儲存成功!',
    // edit 時儲存失敗的訊息
    editSaveFailMsg: '儲存失敗!',
  }

  function MonitorOverall(conf, mode) {
    var $container, $space, $list, $option

    var boxIdList = [],
      machines,
      sysMachines,
      machineBoxMapping = {},
      subscribeBoxIndex = {}

    var _lastData

    function _buildDevice(container, data) {
      if (String(data.x).indexOf('%') < 0 && String(data.x).indexOf('px') < 0) {
        data.x += 'px'
      }
      if (String(data.y).indexOf('%') < 0 && String(data.y).indexOf('px') < 0) {
        data.y += 'px'
      }
      var obj = $.extend({ prefix: conf.devicePrefix, clazz: 'device' }, data)
      var $device = $(conf.deviceCompiled(obj))
        .appendTo(container)
        .data('source', data)
      if ($device.is('.draggable')) {
        $device
          .draggable({
            containment: '#monitor-panel .space',
            stop: function () {
              var l =
                (
                  100 *
                  parseFloat(
                    $(this).position().left /
                      parseFloat($(this).parent().width())
                  )
                ).toFixed(2) + '%'
              var t =
                (
                  100 *
                  parseFloat(
                    $(this).position().top /
                      parseFloat($(this).parent().height())
                  )
                ).toFixed(2) + '%'
              $(this).css('left', l)
              $(this).css('top', t)
            },
          })
          .attr('id', data.id)
      }
    }

    function _buildCard(container, data) {
      var obj = $.extend(
        {
          prefix: conf.cardPrefix,
          clazz: 'item card',
          pieSize: conf.cardPieSize,
        },
        conf.titles,
        data
      )
      $(conf.cardCompiled(obj)).appendTo(container).data('source', data)
    }

    function _buildDeviceHoverDetail(container, data) {
      var obj = $.extend(
        {
          prefix: conf.detailPrefix,
          clazz: 'card detail',
          pieSize: conf.cardPieSize,
        },
        conf.titles,
        data
      )
      var $d
      // remove
      container.find('.detail').remove()
      // build
      $d = $(conf.cardCompiled(obj)).appendTo(container)
      // init easy pie chart
      pageSetUp()
      // update infomation
      if (!_.isUndefined(_lastData)) {
        if ($d.attr('data-id')) {
          _updateCard($d.attr('data-id'), _lastData)
        }
      }
    }

    function _removeDeviceHoverDetail(container) {
      container.find('.detail').remove()
    }

    function _updateStatus(id, clz) {
      var allStatus = _.map(conf.statusMap, function (v, k) {
        return v
      }).join(' ')
      // update device
      $('#' + conf.devicePrefix + id + ':visible')
        .removeClass(allStatus)
        .addClass(clz)
      // update detail
      $('#' + conf.detailPrefix + id + ':visible')
        .removeClass(allStatus)
        .addClass(clz)
      // update card
      $('#' + conf.cardPrefix + id + ':visible')
        .removeClass(allStatus)
        .addClass(clz)
    }

    function _updateCard(id, src) {
      var els = [
        '#' + conf.cardPrefix + id + ':visible',
        '#' + conf.detailPrefix + id + ':visible',
      ]

      var boxIdIndex = subscribeBoxIndex[machineBoxMapping[id]]

      _.each(conf.dataCommand, function (c, i) {
        var column = c['column'],
          target = c['target'],
          filter = c['filter']
        var ori = src[boxIdIndex].getValue(column, id),
          val = _.isFunction(filter) ? filter.apply(this, [ori]) : ori
        _.each(els, function (el) {
          var $el = $(el)
          if ($el.length) {
            _updateCardValue($el, target, val)
          }
        })
      })
    }

    function _updateCardValue(el, target, value) {
      switch (target) {
        case 'pieLeft':
          _updatePieChart(el, 'pie-left', value || 0)
          break
        case 'pieRight':
          _updatePieChart(el, 'pie-right', value || 0)
          break
        case 'pieLeftTxt':
          _updateTxt(el, 'txt-left', value || 0)
          break
        case 'pieRightTxt':
          _updateTxt(el, 'txt-right', value || 0)
          break
        case 'txtFirst':
          _updateTxt(el, 'txt-first', value || '')
          break
        case 'txtLast':
          _updateTxt(el, 'txt-last', value || '')
          break
        default:
          alert('unknow target:' + target)
      }
    }

    function _updatePieChart(el, selector, rate) {
      var chart = el.find('.' + selector + ' .easyPieChart')

      if (parseInt(chart.attr('data-percent')) !== rate) {
        // console.debug('val:' + value + ' rate:' + rate);
        chart.attr('data-percent', rate)
        chart.data('easyPieChart').update(rate)
      }
    }

    function _updateTxt(el, selector, value) {
      el.find('.' + selector).text(value[0][0] == 'B' ? 0 : value[0][0])
    }

    function _clear(el) {
      el.find('.device, .detail, .card').remove()
    }

    function _parse(data) {
      var res = []
      _.each(data, function (ele) {
        var obj = {}
        _.each(ele, function (val, i) {
          obj[conf.columns[i]] = val
        })
        res.push(obj)
      })
      return res
    }

    function _restore(el, machines, type) {
      // build devices
      if (el.length) {
        // empty
        _clear(el)
        // build
        _.each(machines, function (m, i) {
          try {
            m.name = servkit.getMachineName(m.id)
          } catch (e) {
            console.warn(e)
          }
          switch (type) {
            case 'device':
              _buildDevice(el, m)
              break
            case 'card':
              _buildCard(el, m)
              break
            default:
              alert('undefined type:' + type)
              break
          }
        })
        // init
        pageSetUp()
        $('.bg').trigger('resize')
      }
    }

    function _listSysMachines() {
      var sms = []
      // get system machine
      servkit.eachMachine(function (id, name) {
        if (id.startsWith('_')) {
          sms.push({
            id: id,
            name: name,
          })
        }
      })
      return sms
    }

    function _listMachine() {
      var ms
      // get setting
      servkit.ajax(
        {
          url: 'api/getdata/file',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
            type: conf.dataname,
            pathPattern: '{data}',
            pathParam: {
              data: ['data'],
            },
          }),
          async: false,
        },
        {
          success: function (data) {
            // 有設定的machine
            ms = _parse(data)
          },
        }
      )
      return ms
    }

    // 過濾顯示機台
    function _filter(machines) {
      // hide all device
      _hideAll()
      // show select machine
      _.each(machines, function (machine) {
        _showDevice(machine)
        _showCard(machine)
      })
    }

    function _hideDevice(id) {
      $('#' + conf.devicePrefix + id).addClass('hide')
    }

    function _hideCard(id) {
      $('#' + conf.cardPrefix + id).addClass('hide')
    }

    // 隱藏所有機台
    function _hideAll() {
      // hide all device
      $space.find('.device').addClass('hide')
      // hide all card
      $list.find('.card').addClass('hide')
    }

    function _showDevice(id) {
      $('#' + conf.devicePrefix + id).removeClass('hide')
    }

    function _showCard(id) {
      $('#' + conf.cardPrefix + id).removeClass('hide')
    }

    // 顯示所有機台
    function _showAll() {
      // show all device
      $space.find('.device').removeClass('hide')
      // show all card
      $list.find('.card').removeClass('hide')
    }

    /* show start */

    function _bindEvent() {
      var selectors = [
        conf.deviceContainer + ' .device',
        conf.cardContainer + ' .card .header .title',
      ]

      $container
        .on('click', selectors.join(','), function (ev) {
          var $device = $(this)
          var boxId = boxIdList[0], // 為什麼一定是拿第一台BOX?
            machineId = $device.is('.device')
              ? $device.attr('data-id')
              : $device.parents('.card:first').attr('data-id'),
            cncBrand = servkit.getMachineBrand(machineId)
          var paramObj = {
            machineId: machineId,
            boxId: boxId, //預設值，當db內無此機台綁定關係時，用這個...
            cncBrand: cncBrand,
          }
          if (!cncBrand.startsWith('JL')) {
            toMonitorPage(paramObj) //進入監控頁面(找到machine綁定的box)
          }
        })
        .on('mouseenter', conf.deviceContainer + ' .device', function (ev) {
          //TODO 強哥說暫時關閉
          //var $device = $(this);
          //_buildDeviceHoverDetail($space, $device.data('source'));
        })
        .on('mouseleave', conf.deviceContainer + ' .device', function (ev) {
          _removeDeviceHoverDetail($space)
        })
    }

    function _buildMachines() {
      // get data
      machines = _listMachine()
      sysMachines = _listSysMachines()
      // restore
      _restore($space, machines, 'device')
      _restore($list, sysMachines, 'card')
    }

    function _getBox() {
      servkit.ajax(
        {
          url: 'api/box/read',
          type: 'GET',
          async: false,
        },
        {
          success: function (datas) {
            boxIdList = _.map(datas, function (box) {
              return box.box_id
            })
            _.each(datas, function (data) {
              var boxId = data.box_id
              _.each(data.devices, function (device) {
                var deviceId = device.device_id
                machineBoxMapping[deviceId] = boxId
              })
            })
          },
        }
      )
    }

    function _subscribeData() {
      servkit.subscribe('DeviceStatus', {
        machines: boxIdList,
        handler: function (data) {
          // console.log(data);

          // 顯示出所有命令
          // console.log(data[0].listCommands());

          // 取某命令某機資料
          // data[0].getValue(command, machineId)
          //console.log(data.length);
          // each 某命令所有機台
          for (var boxIdIndex = 0; boxIdIndex < data.length; boxIdIndex++) {
            var boxId = data[boxIdIndex].data.machine //subscribeBoxIndex
            subscribeBoxIndex[boxId] = boxIdIndex
            data[boxIdIndex].eachMachine(conf.statusCommand, function (
              multisystem,
              machineId
            ) {
              var id = machineId,
                status = multisystem
              //console.log("*** id: ", machineId);
              // console.debug('M:' + id);
              // update status
              _updateStatus(id, conf.statusMap[status] || '')
              // update card
              _updateCard(id, data)
              // update to memory
              _lastData = data
            })
          }
        },
        dataModeling: true,
      })
    }

    function getCookie(cname) {
      var name = cname + '='
      var ca = document.cookie.split(';')
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i]
        while (c.charAt(0) == ' ') c = c.substring(1)
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length)
      }
      return ''
    }

    //to monitor page
    function toMonitorPage(paramObj) {
      servkit.ajax(
        {
          //找machine綁定的box
          url: 'api/getdata/db',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
            table: 'm_device_box',
            columns: ['box_id'],
            whereClause: 'device_id = ?',
            whereParams: [paramObj.machineId],
          }),
        },
        {
          success: function (data) {
            var lang = getCookie('lang')
            //*** 用來辨識從監控離開時，要回哪個app的子頁面
            var preAppId = conf.currentAppId,
              prePage = conf.currentPage
            // console.log(data);
            if (data.length > 0) {
              //找到machine綁定的box
              paramObj.boxId = data[0].box_id //替換
            }
            var goBackHref = '#app/EquipMonitor/function/' + lang + '/'

            if (servkit.configUseDeviceStatus()) {
              //現在分成使用deviceStatus監控和一般送命令給box的監控
              goBackHref = goBackHref + '01_info_by_device_status.html'
            } else {
              goBackHref = goBackHref + '01_info.html'
            }
            goBackHref =
              goBackHref +
              '?boxId=' +
              paramObj.boxId +
              '&machineId=' +
              paramObj.machineId +
              '&cncBrand=' +
              paramObj.cncBrand +
              '&preAppId=' +
              preAppId +
              '&prePage=' +
              prePage
            //檢查沒有廠牌或OTHER、IndicatorLampFile、INDICATORLAMP_ICP_TET_PD6就不進入監控頁面
            if (
              paramObj.cncBrand === undefined ||
              paramObj.cncBrand.trim() === 'OTHER' ||
              paramObj.cncBrand.trim() === 'INDICATORLAMP_FILE' ||
              paramObj.cncBrand.trim() === 'INDICATORLAMP_ICP_TET_PD6'
            ) {
              $.smallBox({
                title:
                  i18n('Machine') +
                  " '" +
                  servkit.getMachineName(paramObj.machineId) +
                  "' Unable to monitor",
                content:
                  "<i class='fa fa-clock-o'></i> <i>2 seconds ago...</i>",
                color: '#C46A69',
                iconSmall: 'fa fa-warning swing animated',
                timeout: 4000,
              })
              return
            }
            window.location = goBackHref
          },
        }
      )
    }

    function show() {
      // find containers
      $container = $(conf.container).removeClass('edit')
      $space = $container.find(conf.deviceContainer)
      $list = $container.find(conf.cardContainer)

      // build compiled
      conf.deviceCompiled = _.template(conf.deviceHtml)
      conf.cardCompiled = _.template(conf.cardHtml)

      // build enviroment
      _buildEnv(conf.backgroundCache)
      // bind events
      _bindEvent()
      _resizeDevice()
      // build machines
      _buildMachines()
      // get boxs (sync)
      _getBox()
      //console.log("***** machineBoxMapping: ", machineBoxMapping);
      // subscribe data
      _subscribeData()
    }

    /* show end */

    /* edit start */

    function _imgLoaded(img) {
      return (
        img.complete &&
        typeof img.naturalWidth !== 'undefined' &&
        img.naturalWidth !== 0
      )
    }

    function _spaceSize(container, img) {
      container.width(img.naturalWidth)
      container.height(img.naturalHeight)
    }

    function _wrapForEdit(ms) {
      var w = 70,
        h = 50,
        mw = $space.width() - 70,
        sx = 20,
        x = sx,
        y = 20

      _.each(ms, function (m, i) {
        ms[i] = $.extend({}, conf.editProto, m, { x: x, y: y, index: i++ })

        // compute next
        x += w
        if (x > mw) {
          x = sx
          y += h
        }
      })
      return ms
    }

    function _format(data) {
      var str = []
      _.each(data, function (obj) {
        str.push(
          _.map(obj, function (num, key) {
            return num
          })
        )
      })
      return str.join('\r\n')
    }

    function _save(el) {
      var sms = []
      ;(el || $space).find('.device').each(function (i) {
        var $d = $(this)
        var index = i + 1,
          id = $d.attr('id'),
          name = conf.editIdGen(index),
          pic = './app/EquipMonitor/img/3d/device.png',
          pos = $d.position(),
          x = $d[0].style.left,
          y = $d[0].style.top

        sms.push({
          id: id || name,
          name: name,
          pic: pic,
          x: x,
          y: y,
          index: index,
        })
      })
      servkit.ajax(
        {
          url: 'api/savedata/' + conf.dataname,
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
            data: _format(sms),
          }),
        },
        {
          success: function () {
            // success callback
            alert(conf.editSaveSuccessMsg)
          },
          fail: function () {
            alert(conf.editSaveFailMsg)
          },
        }
      )
    }

    function _reloadImage(img) {
      var $img = $(img)
      var src = $img.attr('src')
      src =
        (src.indexOf('?') > 0 ? src.substr(0, src.indexOf('?')) : src) +
        '?_' +
        new Date().getTime()
      $img.attr('src', src)
    }

    function _buildEnv(cache) {
      if ($space.length) {
        var $bg = $space.find('img.bg')
        // check is reload
        if (!cache) {
          _reloadImage($bg)
        }
        // resize
        // if (_imgLoaded($bg[0])) {
        //   _spaceSize($space, $bg[0]);
        // } else {
        //   $bg.load(function() {
        //     _spaceSize($space, $bg[0]);
        //   });
        // }
      }
    }

    function _resizeDevice() {
      $('.bg').on('resize', function () {
        var bodyWidth = $('body').width()
        $space.find('.picture').css('background-size', bodyWidth / 40)
        $space.find('.picture').css('width', bodyWidth / 40)
        $space.find('.picture').css('height', bodyWidth / 40 / 3)
      })
    }

    function _bindEditEvent() {
      $option
        .on('click', '.act-add', function (ev) {
          ev.preventDefault()
          _buildDevice($space, conf.editProto)
          $('.bg').trigger('resize')
        })
        .on('click', '.act-clear', function (ev) {
          ev.preventDefault()
          _clear($space)
        })
        .on('click', '.act-save', function (ev) {
          ev.preventDefault()
          _save($space)
        })
        .on('click', '.act-restore', function (ev) {
          ev.preventDefault()
          machines = _listMachine()
          _restore($space, machines, 'device')
        })
        .on('click', '.act-list', function (ev) {
          ev.preventDefault()
          sysMachines = sysMachines || _listSysMachines()
          var ms = _wrapForEdit(sysMachines)
          _restore($space, ms, 'device')
        })

      $container
        .on('click', '.act-remove', function (ev) {
          ev.preventDefault()
          $(this).parents('.device:first').remove()
        })
        .on('click', '.act-edit', function (ev) {
          ev.preventDefault()
          var $device = $(this).parents('.device:first')
          var id = prompt(conf.editIdPromptMsg, $device.attr('id') || ''),
            name
          try {
            name = servkit.getMachineName(id)
          } catch (e) {
            console.warn(e)
          }
          $device
            .attr('id', id == '' ? conf.editIdGen(0) : id)
            .find('.info')
            .html(name || id)
        })
    }

    function edit() {
      // find containers
      $container = $(conf.container).addClass('edit')
      $space = $(conf.deviceContainer)
      $option = $(conf.editOptionContainer)

      // build compiled
      conf.deviceCompiled = _.template(conf.editDeviceHtml)

      // build enviroment
      _buildEnv(false)

      // bind events
      _bindEditEvent()
      _resizeDevice()
    }

    /* edit end */

    // init
    conf = $.extend(_conf, conf)
    switch (mode) {
      case 'edit':
        edit()
        break
      default:
        show()
        break
    }

    // public method
    // this.rebuildEditEnv = _buildEnv;
    return {
      getConfig: function () {
        return conf
      },
      reloadEditEnv: _buildEnv,
      showAll: _showAll,
      hideAll: _hideAll,
      filter: _filter,
    }
  }

  return function (conf, mode) {
    return MonitorOverall(conf, mode)
  }
})(this, $, _, servkit)

//kevin用來送主要資訊der監控命令用der
exports.monitorCmd = function (config) {
  //參數格式  config: {boxId: "", machineId: "", callback: function()}
  var singleMonitorCmd = {
    //box監控命令(單系統)
    name: 'cnc_Information',
    cycleType: 'count',
    cycleValue: -1,
    timeout: 1800000,
    items: [
      { signal: { id: 'G_SYSC' }, collect: { waitMs: 1000, count: 1 } }, //系統個數 (***重要，用來辨識有幾個系統)
      { signal: { id: 'G_POSM' }, collect: { waitMs: 1000, count: 1 } }, //機械座標
      { signal: { id: 'G_POSR' }, collect: { waitMs: 1000, count: 1 } }, //相對座標
      { signal: { id: 'G_POSA' }, collect: { waitMs: 1000, count: 1 } }, //絕對座標
      { signal: { id: 'G_POSD' }, collect: { waitMs: 1000, count: 1 } }, //剩餘距離
      { signal: { id: 'G_ELCT' }, collect: { waitMs: 1000, count: 1 } }, //通電時間
      { signal: { id: 'G_CUTT' }, collect: { waitMs: 1000, count: 1 } }, //切削時間
      { signal: { id: 'G_OPRT' }, collect: { waitMs: 1000, count: 1 } }, //運轉時間
      { signal: { id: 'G_CYCT' }, collect: { waitMs: 1000, count: 1 } }, //循環時間
      { signal: { id: 'G_PSCP' }, collect: { waitMs: 1000, count: 1 } }, //加工零件數
      { signal: { id: 'G_TOCP' }, collect: { waitMs: 1000, count: 1 } }, //加工零件總數
      { signal: { id: 'G_USCP' }, collect: { waitMs: 1000, count: 1 } }, //所需零件數
      { signal: { id: 'G_MODA' }, collect: { waitMs: 1000, count: 1 } }, //G code; Modal code
      { signal: { id: 'G_EXEP' }, collect: { waitMs: 1000, count: 1 } }, //目前執行單節
      { signal: { id: 'G_ACTS' }, collect: { waitMs: 1000, count: 1 } }, //主軸實際轉速
      { signal: { id: 'G_SPMS' }, collect: { waitMs: 1000, count: 1 } }, //主軸命令轉速
      { signal: { id: 'G_SPSO' }, collect: { waitMs: 1000, count: 1 } }, //主軸轉速百分比
      { signal: { id: 'G_STAT' }, collect: { waitMs: 1000, count: 1 } }, //控制器端狀態
      { signal: { id: 'G_PRGR' }, collect: { waitMs: 1000, count: 1 } }, //執行中程式號碼
      { signal: { id: 'G_PRGM' }, collect: { waitMs: 1000, count: 1 } }, //主程式號碼
      { signal: { id: 'G_SEQN' }, collect: { waitMs: 1000, count: 1 } }, //目前執行序列號
      { signal: { id: 'G_SRNE' }, collect: { waitMs: 1000, count: 1 } }, //伺服軸名稱
      { signal: { id: 'G_PSUT' }, collect: { waitMs: 1000, count: 1 } }, //座標單位
      { signal: { id: 'G_FRUT' }, collect: { waitMs: 1000, count: 1 } }, //進給率單位
      { signal: { id: 'G_ACTF' }, collect: { waitMs: 1000, count: 1 } }, //實際進給率
      { signal: { id: 'G_FERP' }, collect: { waitMs: 1000, count: 1 } }, //進給率百分比
      { signal: { id: 'G_SRMC' }, collect: { waitMs: 1000, count: 1 } }, //伺服軸負載
      { signal: { id: 'G_SPMC' }, collect: { waitMs: 1000, count: 1 } }, //主軸負載
    ],
  }

  //送監控命令
  servkit.monitor({
    type: 'MONITOR',
    boxId: config.boxId,
    machineId: config.machineId,
    monitorCmd: singleMonitorCmd, //先做單系統就好~
    monitorCmdVersion: 'v1.0',
    //monitorParams: monitorParams,
    customCallback: function (data) {
      //客製化
      //console.log("---------------------");
      //console.log(JSON.stringify(data));
      //console.log("---------------------");
      config.callback(data)
    },
  })
}

exports.timestamp2dateValue = function (value, showUnit) {
  //因為月不準..所以只算到日
  var second = Number(value) / 1000
  var min = second / 60
  var hour = min / 60
  var day = hour / 24

  //整數處理
  second = Math.floor(second)
  min = Math.floor(min)
  hour = Math.floor(hour)
  day = Math.floor(day)

  var hourTemp = hour % 24
  var minTemp = min % 60
  var secondTemp = second % 60

  if (hourTemp.toString().length <= 1) {
    hourTemp = '0' + hourTemp
  }
  if (minTemp.toString().length <= 1) {
    minTemp = '0' + minTemp
  }
  if (secondTemp.toString().length <= 1) {
    secondTemp = '0' + secondTemp
  }

  if (showUnit) {
    var t = {}
    switch (showUnit) {
      case 'day':
        //t = day + " D " + hourTemp + " H " + minTemp + " M " + secondTemp + " S ";
        t = { day: day, hour: hourTemp, min: minTemp, second: secondTemp }
        break
      case 'hour':
        //t = hour + " H " + minTemp + " M " + secondTemp + " S ";
        t = { day: '', hour: hour, min: minTemp, second: secondTemp }
        break
      case 'min':
        //t = min + " M " + secondTemp + " S ";
        t = { day: '', hour: '', min: min, second: secondTemp }
        break
      case 'second':
        //t = second + " S ";
        t = { day: '', hour: '', min: '', second: second }
        break
      default:
        console.warn('目前尚未定義此種 showUnit = ' + showUnit)
    }
  } else {
    //t = day + "D" + hourTemp + "H" + minTemp + "M" + secondTemp + "S";
    t = { day: day, hour: hourTemp, min: minTemp, second: secondTemp }
  }
  return t
}
