// 整線監控
exports.productionLine = (function (global, $, _, servkit) {
  var _conf = {
    debug: true,

    dataname: 'production_line',
    // root container
    container: '#space',

    // 設定
    labelSize: 5,
    // 狀態資料
    statusCommand: 'G_CONS()',
    // 狀態表
    statusMap: {
      '11': 'online',
      '12': 'idle',
      '13': 'alarm',
    },

    // show 時的格式
    widgetBody:
      '<div id="<%= id %>" class="device" style="top: <%= top %>px; left: <%= left %>px">' +
      '  <div class="device-title clearfix">' +
      '   <div class="picture"></div>' +
      '    <div class="img">' +
      '      <img src="<%= image %>" />' +
      '    </div>' +
      '    <div class="text">' +
      '      <span><%= name %></span>' +
      '    </div>' +
      '  </div>' +
      '  <div class="device-info clearfix">' +
      '    <table>' +
      '      <%= labels %>' +
      '    </table>' +
      '  </div>' +
      '</div>',

    // edit 時的格式
    editWidgetBody:
      '<div class="device draggable" style="top: 10px; left: 10px;">' +
      '  <div class="device-title clearfix">' +
      '   <div class="picture"></div>' +
      '    <div class="img">' +
      '      <img src="./app/EquipMonitor/img/machine/machine.png" />' +
      '    </div>' +
      '    <div class="text">' +
      '      <span>' +
      '        <input type="text" name="id" placeholder="id">' +
      '        <a href="javascript:void(0);" class="btn btn-xs btn-danger stk-delete" title="Delete"><i class="fa fa-times"></i></a>' +
      '      </span>' +
      '    </div>' +
      '  </div>' +
      '  <div class="device-info clearfix">' +
      '    <table>' +
      '      <%= labels %>' +
      '    </table>' +
      '  </div>' +
      '</div>',
    editWidgetLabel:
      '<tr>' +
      '  <th class="value-head"><div><input type="text" name="name" placeholder="label"></div></th>' +
      '  <td class="value-text">' +
      '    <div class="value">' +
      '      <input type="text" name="param" placeholder="param">' +
      '      <select name="type">' +
      '        <option value="text">Text</option>' +
      '        <option value="progress">Progress</option>' +
      '        <option value="accum_ms">Accumulate Milliseconds</option>' +
      '      </select>' +
      '    </div>' +
      '  </td>' +
      '</tr>',
    msg: {},
    // edit 時輸入機號的訊息
    editIdPromptMsg: '請輸入機台ID',
    // edit 時儲存成功的訊息
    editSaveSuccessMsg: '儲存成功!',
    // edit 時儲存失敗的訊息
    editSaveFailMsg: '儲存失敗!',
  }

  function ProductionLine(conf, mode) {
    var $win = $(window),
      $body = $('body')

    var $container, $bg, $loadModal, $uploadModal

    var _showCompiled, _editTemplate

    var lineId, lineName, lineObj, profile

    var boxIdList
    var machineBoxMap = {}

    /* common */
    function _changeTitle() {
      $('#lineId').html(lineName)
    }

    function _resizeContainer() {
      var bg = $bg[0]
      $container.width(bg.naturalWidth).height(bg.naturalHeight)
    }

    function _reloadBackground() {
      $bg
        .off('load')
        .one('load', function () {
          console.debug('load')
          conf.debug && console.debug('image load')
          // 依圖形重新計算容器尺寸
          _resizeContainer()
          switch (mode) {
            case 'edit':
              _loadProfile(_drawEdit)
              break
            default:
              _loadProfile(_drawShow)
              break
          }
        })
        .off('error')
        .one('error', function () {
          console.debug('error')
          switch (mode) {
            case 'edit':
              alert(conf.msg.load.noBackground)
              _showUploadModal()
              break
            default:
              alert(conf.msg.load.incomplete)
              break
          }
        })
        .attr(
          'src',
          './api/equipmonitor/productionlinebackground?id=' +
            lineId +
            '&_' +
            new Date()
        )
    }

    function _loadLine(id, name) {
      lineId = id
      lineName = name
      // title
      _changeTitle()
      // clear machine
      _clearMachine()
      // reload background
      _reloadBackground()
    }

    function _parse(data) {
      return data == '' || data.length == 0 ? null : JSON.parse(unescape(data))
    }

    function _clearMachine() {
      $container.find('.device').remove()
    }

    function _loadProfile(fn) {
      if (!_.isUndefined(lineId)) {
        servkit.ajax(
          {
            url: 'api/getdata/file',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              type: conf.dataname,
              pathPattern: '{data}',
              pathParam: {
                data: [lineId],
              },
            }),
            async: false,
          },
          {
            success: function (data) {
              // 有設定的machine
              profile = _parse(data)
              if (profile == null) {
                alert(conf.msg.load.noData)
              } else {
                console.debug(profile)
                fn(profile)
              }
            },
          }
        )
      }
    }

    function _buildEnv(cache) {
      // image
      $container.imagesLoaded(function () {
        console.debug('init image load done...')
        // 依圖形重新計算容器尺寸
        _resizeContainer()
      })
      // show Load Modal
      _showLoadModal()
    }

    function _showLoadModal() {
      servkit.ajax(
        {
          //        url: 'api/plant/read',
          url: 'api/lineMachine/read',
          type: 'GET',
        },
        {
          success: function (data) {
            lineObj = _.groupBy(data, 'line_id')
            var html = _.map(data, function (d, i) {
              return (
                '<tr><td><a class="stk-load-file" href="javascript:void(0);" data-id="' +
                d.line_id +
                '">' +
                d.line_name +
                '</a></td></tr>'
              )
            })
            $loadModal
              .find('table tbody')
              .html(html.join(''))
              .end()
              .modal('show')
          },
        }
      )
    }

    /* show start */
    function _drawShow(profile) {
      conf.debug && console.debug('draw show')

      if (_.isUndefined(_showCompiled)) {
        _showCompiled = _.template(conf.widgetBody)
      }

      var html = []
      _.each(profile.devices, function (d) {
        var labelHtml = []
        _.each(d.labels, function (l) {
          labelHtml.push(_drawShowLabel(l))
        })
        html.push(
          _showCompiled({
            id: d.id,
            name: servkit.getMachineName(d.id) || d.id,
            image: d.image,
            top: d.pos.y,
            left: d.pos.x,
            labels: labelHtml.join(''),
          })
        )
      })

      $container.find('.device').remove().end().append(html.join(''))
      // get box
      _getBox()
      // subscribe data
      _subscribeData()
    }

    function _drawShowLabel(label) {
      var html = []
      console.debug('label')
      html.push('<tr>')
      html.push('<th class="value-head"><span>' + label.name + '</span></th>')
      switch (label.value.type) {
        case 'text':
          html.push(
            '<td class="value-text dynamic-value" data-param="' +
              label.value.param +
              '"><div class="value"></div></td>'
          )
          break
        case 'progress':
          html.push(
            '<td class="value-progress dynamic-value" data-param="' +
              label.value.param +
              '"><div class="progress">' +
              '  <div class="progress-bar bg-color-teal" style="width: 0%;">0%</div>' +
              '</div></td>'
          )
          break
        case 'accum_ms':
          html.push(
            '<td class="value-text value-accum-ms dynamic-value" data-param="' +
              label.value.param +
              '"><div class="value"></div></td>'
          )
          break
        default:
          console.warn('Undefined Label Type [' + label.value.type + ']')
          break
      }
      html.push('</tr>')
      return html.join('')
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
              var boxId = box.box_id
              _.each(box.devices, function (deviceObj) {
                machineBoxMap[deviceObj.device_id] = boxId
              })
              return boxId
            })
          },
        }
      )
    }

    function _updateData(id, param, value) {
      var _self = this
      var $device = $('#' + id)
      var $dvs = $device.find('.dynamic-value[data-param="' + param + '"]')
      $dvs.each(function () {
        var $dv = $(this)
        if ($dv.hasClass('value-progress')) {
          $dv
            .find('.progress-bar')
            .html(value + '%')
            .css('width', value + '%')
        } else if ($dv.hasClass('value-accum-ms')) {
          $dv
            .find('.value')
            .html(parseInt(value).millisecondToDHHmmss() || value)
        } else {
          $dv.find('.value').html(value)
        }
      })
    }

    function _subscribeData() {
      servkit.subscribe('DeviceStatus', {
        machines: boxIdList,
        handler: function (data) {
          // console.log('=== subscribe ===')
          // console.log(data);

          // 顯示出所有命令
          var commands = data[0].listCommands()

          // 取某命令某機資料
          // data[0].getValue(command, machineId)
          _.each(profile.devices, function (device, i) {
            var machineId = device.id
            //device-title update device status
            if (_.contains(commands, conf.statusCommand)) {
              var statusAry =
                data[0].getValue(conf.statusCommand, machineId) || ''
              var status = conf.statusMap[statusAry[0]] || ''
              $('#' + machineId).attr('class', 'device ' + status)
            }

            //device-info
            _.each(device.labels, function (label, j) {
              var command = label.value.param
              if (command && command.length > 0) {
                if (_.contains(commands, command)) {
                  var value = data[0].getValue(command, machineId) || ''
                  // console.log(machineId + ':' + command + '=' + value);
                  _updateData(machineId, command, value)
                } else {
                  console.warn('COMMAND ' + command + ' not support')
                }
              }
            })
          })

          // each 某命令所有機台
          // data[0].eachMachine('G_CONS()', function (multisystem, machineId) {
          //   var id = machineId,
          //     status = multisystem;
          //   console.log('M:' + id + '>' + status);
          //   // update
          // });
        },
        dataModeling: true,
      })
    }

    function toMonitorPage(machineId) {
      var lang = servkit.getCookie('lang')
      //*** 用來辨識從監控離開時，要回哪個app的子頁面
      var hashAry = window.location.hash.split('/')
      window.location =
        '#app/EquipMonitor/function/' +
        lang +
        '/01_info.html?boxId=' +
        (machineBoxMap[machineId] || '') +
        '&machineId=' +
        (machineId || '') +
        '&cncBrand=' +
        servkit.getMachineBrand(machineId) +
        '&preAppId=' +
        hashAry[1] +
        '&prePage=' +
        hashAry[4].replace('.html', '')
    }

    function _bindShowEvent() {
      $body
        .off('click', '.stk-load')
        .on('click', '.stk-load', function () {
          _showLoadModal()
        })
        .off('click', '.stk-load-file')
        .on('click', '.stk-load-file', function () {
          var $t = $(this)
          _loadLine($t.attr('data-id'), $t.text())
          // close load modal
          $loadModal.modal('hide')
        })
    }

    function show() {
      // find containers
      $container = $(conf.container)
      $bg = $container.find('.bg')
      $loadModal = $('#load-modal')
      //to monitor page
      $container.on('click', '.device', function (e) {
        toMonitorPage(this.getAttribute('id'))
      })
      // bind events
      _bindShowEvent()
      // build enviroment
      _buildEnv(false)
    }

    /* show end */

    /* edit start */
    function _add() {
      // build tempate
      if (_.isUndefined(_editTemplate)) {
        _editTemplate = _.template(conf.editWidgetBody)({
          labels: _(conf.labelSize)
            .times(function (n) {
              return conf.editWidgetLabel
            })
            .join(''),
        })
      }
      return $(_editTemplate)
        .appendTo($container)
        .draggable({ containment: $container })
    }

    function _delete(target) {
      console.debug('delete')
      var $tar = $(target)
      if (confirm('確認刪除?')) {
        $tar.parents('.device:first').remove()
      }
    }

    function _format(data) {
      return escape(JSON.stringify(data))
    }

    function _showUploadModal() {
      if ($uploadModal.find(':input[name="id"]').length == 0) {
        $uploadModal.find('form').prepend('<input type="hidden" name="id">')
      }
      $uploadModal
        .find(':input[name="id"]')
        .val(lineId)
        .end()
        .find('.dropzone')
        .removeClass('dz-started')
        .end()
        .find('.dropzone .dz-preview')
        .remove()
      $uploadModal.modal('show')
    }

    function _save() {
      var obj = {
        id: lineId,
        title: 'Line',
        devices: [],
      }

      $container.find('.device').each(function () {
        var $device = $(this)
        var position = $device.position()

        var labels = []
        $device.find('table tr').each(function () {
          var $label = $(this)
          labels.push({
            name: $label.find(':input[name="name"]').val(),
            value: {
              type: $label.find(':input[name="type"]').val(),
              param: $label.find(':input[name="param"]').val(),
            },
          })
        })

        //TODO: only for TIMTOS
        var deviceId = $device.find(':input[name="id"]').val()
        var deviceName = servkit.getMachineName(deviceId)
        if (deviceName == 'U600' || deviceName == 'VMP40A') {
          obj.devices.push({
            id: $device.find(':input[name="id"]').val(),
            image: './img/machine/' + deviceName + '.png',
            pos: {
              x: position.left,
              y: position.top,
            },
            labels: labels,
          })
        } else {
          obj.devices.push({
            id: $device.find(':input[name="id"]').val(),
            image: './app/EquipMonitor/img/machine/machine.png',
            pos: {
              x: position.left,
              y: position.top,
            },
            labels: labels,
          })
        }
      })
      var data = {}
      data[lineId] = _format(obj)
      servkit.ajax(
        {
          url: 'api/savedata/' + conf.dataname,
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(data),
        },
        {
          success: function () {
            // success callback
            alert(conf.msg.save.success)
          },
          fail: function () {
            alert(conf.msg.save.fail)
          },
        }
      )
    }

    function _buildUploadModal() {
      console.debug('build upload modal')
      console.debug($('#mydropzone').data())
      // upload dialog
      Dropzone.autoDiscover = false
      try {
        $('#mydropzone').dropzone({
          url: 'api/equipmonitor/uploadproductionlinebackground',
          addRemoveLinks: true,
          maxFilesize: 6, // MB
          acceptedFiles: '.png',
          dictDefaultMessage:
            '<span class="text-center"><span class="font-lg visible-xs-block visible-sm-block visible-lg-block"><span class="font-lg"><i class="fa fa-caret-right text-danger"></i> {i18n_ServCloud_Monitor_Drop_File} <span class="font-xs">to upload</span></span><span>&nbsp&nbsp<h4 class="display-inline"> ({i18n_ServCloud_Monitor_Or_Click})</h4></span>',
          dictResponseError: conf.msg.upload.fail,
          dictInvalidFileType: conf.msg.upload.invalid,
          init: function () {
            this.on('success', function (file, res) {
              switch (res.type) {
                case 0:
                  _reloadBackground()
                  // close upload modal
                  $uploadModal.modal('hide')
                  break
                case 1:
                case 999:
                default:
                  var $fileResult = $(file.previewElement)
                  $fileResult.removeClass('dz-success').addClass('dz-error')
                  $fileResult
                    .find('.dz-error-message span')
                    .text(res.data)
                    .css('color', '#fff')
                    .parent()
                    .css('background-color', 'rgba(0, 0, 0, 0.8)')
                  break
              }
            })
          },
        })
      } catch (e) {
        console.warn(e)
      }
    }

    function _buildEditEnv() {
      // build upload dialog
      _buildUploadModal()
    }

    function _bindEditEvent() {
      $body
        .off('click', '.stk-load')
        .on('click', '.stk-load', function (ev) {
          _showLoadModal()
        })
        .off('click', '.stk-load-file')
        .on('click', '.stk-load-file', function (ev) {
          var $t = $(this)
          _loadLine($t.attr('data-id'), $t.text())
          // close load modal
          $loadModal.modal('hide')
        })
        .off('click', '.stk-upload')
        .on('click', '.stk-upload', function (ev) {
          _showUploadModal()
        })
        //          .off('click', '.stk-add')
        //          .on('click', '.stk-add', function (ev) {
        //            _add();
        //          })
        .off('click', '.stk-load-machines')
        .on('click', '.stk-load-machines', function (ev) {
          //            var width = 360, height = 150;
          _.each(lineObj[lineId][0].details, function (elem, index) {
            //elem: {op_seq, op_name, machine_seq, machine_id}
            var machineId = elem.machine_id
            if (!$('input[value="' + machineId + '"]').length) {
              var $machineCard = _add()
              $machineCard.find(':input[name="id"]').val(machineId)
              //                $machineCard.css({
              //                  x:0,
              //                  y:0
              //                });
            }
          })
        })
        .off('click', '.stk-save')
        .on('click', '.stk-save', function (ev) {
          _save()
        })
      $container
        .off('click', '.stk-delete')
        .on('click', '.stk-delete', function (ev) {
          _delete(this)
        })
    }

    function _drawEdit(profile) {
      _.each(profile.devices, function (d) {
        var $device = _add()
        var $labels = $device.find('table tr')
        $device.find(':input[name="id"]').val(d.id)
        $device.find('img').attr('src', d.image)
        $device.css({
          top: d.pos.y,
          left: d.pos.x,
        })
        $labels.each(function (i) {
          var $label = $(this)
          var l = d.labels[i]
          $label.find(':input[name="name"]').val(l.name)
          $label.find(':input[name="param"]').val(l.value.param)
          $label.find(':input[name="type"]').val(l.value.type)
        })
      })
    }

    function edit() {
      // find containers
      $container = $(conf.container).addClass('edit')
      $bg = $container.find('.bg')
      $loadModal = $('#load-modal')
      $uploadModal = $('#upload-modal')

      // bind events
      _bindEditEvent()
      // build edit enviroment
      _buildEditEnv()
      // build enviroment
      _buildEnv(false)
    }

    /* edit end */

    // init
    conf = $.extend(true, _conf, conf)
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
    }
  }

  return function (conf, mode) {
    return ProductionLine(conf, mode)
  }
})(this, $, _, servkit)
