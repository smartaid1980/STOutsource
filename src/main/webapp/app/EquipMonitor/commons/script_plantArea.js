exports.plantArea = (function (global, $, _, servkit) {
  var _conf = {
    debug: true,
    dataname: 'plant_area',
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
    deivce: {
      disabled: false,
    },
    // show 時的格式
    widgetBody:
      '<div id="<%= id %>" class="device"<%= disabled %> style="top: <%= top %>; left: <%= left %>">' +
      '  <div>' +
      '    <div class="device-title clearfix">' +
      '      <div class="text">' +
      '        <span><%= name %></span>' +
      '      </div>' +
      '    </div>' +
      '    <div class="device-info clearfix <%= hide %>">' +
      '      <table>' +
      '        <%= labels %>' +
      '      </table>' +
      '    </div>' +
      '  </div>' +
      '  <div class="device-img" style="width:<%= width %>;height:<%= height %>;"><img src="<%= imgsrc %>"></div>' +
      '</div>',
    // edit時顯示卡片位置
    editWidgetPostion:
      '<div class="device-info-position">' +
      '  <p><label class="top">top</label>:<b><span class="top"></span></b>%' +
      '    <label class="left">left</label>:<b><span class="left"></span></b>%</p>' +
      '  <label class="top">top</label>' +
      '  <input type="text" class="top" placeholder="top">' +
      '  <label>%</label>' +
      '  <label class="left">left</label>' +
      '  <input type="text" class="left" placeholder="left">' +
      '  <label>%</label>' +
      '</div>',
    // edit 時的格式
    editWidgetBody:
      '<div class="device draggable" style="top: 10px; left: 10px;">' +
      '  <div>' +
      '    <div class="device-title clearfix" style="width: 100%; height: 10px;">' +
      '      <div class="text">' +
      '        <span class="device_name"></span>' +
      '        <span>' +
      '          <input type="checkbox" name="disabled"><span class="disabled-text">Disabled</span>' +
      '          <a href="javascript:void(0);" class="update-image icon" title="update image"><i class="fa fa-file-image-o"></i></a>' +
      '          <input type="text" class="device_id" name="id" placeholder="id">' +
      '          <a href="javascript:void(0);" class="close stk-delete icon" title="Delete">×</a>' +
      '          <a href="javascript:void(0);" class="toggle-btn icon" title="Toggle"><i class="fas fa-plus"></i></a>' +
      '        </span>' +
      '      </div>' +
      '    </div>' +
      '    <div class="device-info clearfix <%= hide %>">' +
      '      <table>' +
      '        <%= labels %>' +
      '      </table>' +
      '    </div>' +
      '    <div class="device-info-edit clearfix">' +
      '      <table>' +
      '        <%= editLabels %>' +
      '      </table>' +
      '    </div>' +
      '  </div>' +
      '  <div class="device-img hide">' +
      '    <div class="img-div"><img src=""></div>' +
      '    <div class="img-edit">' +
      '      <table>' +
      '        <tr>' +
      '          <td>width</td>' +
      '          <td><input type="text" class="width" placeholder="width"></td>' +
      '          <td>px</td>' +
      '        </tr>' +
      '        <tr>' +
      '          <td>height</td>' +
      '          <td><input type="text" class="height" placeholder="height"></td>' +
      '          <td>px</td>' +
      '        </tr>' +
      '      </table>' +
      '    </div>' +
      '  </div>' +
      '</div>',
    // edit 的卡片值設定
    editWidgetLabel:
      '<tr>' +
      '  <th class="value-head"><div>' +
      '    <a href="javascript:void(0);" class="btn btn-xs btn-danger deleteLabel" title="Delete"><i class="fa fa-times"></i></a>' +
      '    <input type="text" name="name" placeholder="label">' +
      '  </div></th>' +
      '  <td class="value-text">' +
      '    <div class="value">' +
      '      <input type="text" name="param" placeholder="param">' +
      '      <input type="text" name="index" placeholder="index">' +
      '      <select name="type">' +
      '        <option value="text">Text</option>' +
      '        <option value="progress">Progress</option>' +
      '        <option value="accum_ms">Accumulate Milliseconds</option>' +
      '      </select>' +
      '    </div>' +
      '  </td>' +
      '</tr>',
    sortWidgetBody:
      '<div class="device" id="<%= id %>">' +
      '  <div>' +
      '    <div class="device-title clearfix" style="width: 100%; height: 10px;">' +
      '    <%= name %>' +
      '    </div>' +
      '    <div class="device-info clearfix">' +
      '      <table>' +
      '        <tr>' +
      '          <td><%= rateName %></td>' +
      '          <td><%= rateValue %></td>' +
      '        </tr>' +
      '        <tr>' +
      '          <td><%= label %></td>' +
      '          <td class="labelValue"><%= labelValue %></td>' +
      '        </tr>' +
      '      </table>' +
      '    </div>' +
      '  </div>' +
      '</div>',
    msg: {},
    editIdPromptMsg: '請輸入機台ID', // edit 時輸入機號的訊息
    editSaveSuccessMsg: '儲存成功!', // edit 時儲存成功的訊息
    editSaveFailMsg: '儲存失敗!', // edit 時儲存失敗的訊息
  }

  function plantArea(conf, mode) {
    // init
    var plantAreaConfig = $.extend(true, _conf, conf)
    var $container = $(plantAreaConfig.container)
    var $body = $('body')
    var $bg = $container.find('.bg')
    var $loadModal = $('#load-modal')
    var $uploadModal = $('#upload-modal')
    var $uploadDeviceModal = $('#upload-device-modal')

    var plantAreaId =
      servkit.getURLParameter('id') || plantAreaConfig.plantAreaId
    var deviceProfile, deviceList
    var reDraw
    var plantAreaObj = _.groupBy(
      _.map(servkit.getMachinePlantAreaMap(), (val, key) => {
        return {
          plant_id: val.plant_id,
          device_id: key,
        }
      }),
      'plant_id'
    )
    var machineId, brandId
    var deviceImageList = {}
    var shiftData = {}

    _.each(servkit.getMachineLightMap(), (light, lightKey) => {
      var style = document.createElement('style')
      style.innerHTML =
        '#space .device.' +
        plantAreaConfig.statusMap[lightKey] +
        ' .device-title{background-color:' +
        light.color +
        ';}'
      document.body.appendChild(style)
    })

    var getShiftData = function () {
      let init = false
      servkit
        .schedule('updateShiftData')
        .freqMillisecond(15 * 60 * 1000)
        .action(function () {
          servkit.ajax(
            {
              url: 'api/workshift/nowLogicallyDate',
              type: 'GET',
              contentType: 'application/json',
            },
            {
              success: function (date) {
                servkit.ajax(
                  {
                    url: 'api/workshift/now',
                    type: 'GET',
                    contentType: 'application/json',
                  },
                  {
                    success: function (data) {
                      hippo
                        .newSimpleExhaler()
                        .space('shiftdata_for_monitor')
                        .index(
                          'machine_id',
                          _.map(deviceProfile, (d) => d.id)
                        )
                        .indexRange('date', date, date)
                        .columns(
                          'machine_id',
                          'date',
                          'work_shift',
                          'power_millisecond',
                          'oper_millisecond',
                          'cut_millisecond',
                          'partcount'
                        )
                        .exhale(function (exhalable) {
                          if (!init) {
                            _subscribeData()
                            init = true
                          }
                          _.each(
                            exhalable.exhalable,
                            (hippoData, exhalableKey) => {
                              var workShift = hippoData['work_shift']
                              if (workShift === data['name']) {
                                shiftData[hippoData.machine_id] = hippoData
                              }
                            }
                          )
                        })
                    },
                  }
                )
              },
            }
          )
        })
        .start()
    }

    var _resizeContainer = function () {
      // 依圖形重新計算容器尺寸
      $container.imagesLoaded(function () {
        var bg = $bg[0]
        if (window.outerHeight - 415 > bg.naturalHeight) {
          $container.height(window.outerHeight - 415)
        } else {
          $container.removeAttr('style')
        }
        if (
          $container.closest('.jarviswidget')[0].naturalWidth > bg.naturalWidth
        ) {
          $container.width(bg.naturalWidth)
        } else {
          $container.width($container.closest('.jarviswidget')[0].naturalWidth)
        }
      })
    }

    var _changeTitle = function () {
      $('#plantAreaId').data('plantAreaId', plantAreaId)
      $('#plantAreaId').html(servkit.getPlantAreaName(plantAreaId))
    }

    var _reloadBackground = function () {
      $bg
        .attr(
          'src',
          './api/equipmonitor/plantAreaBackground?id=' +
            plantAreaId +
            '&_' +
            new Date()
        )
        .off('load')
        .one('load', function () {
          _clearMachines()
          _resizeContainer()
          _loadProfile()
        })
        .off('error')
        .one('error', function () {
          switch (mode) {
            case 'edit':
              alert(plantAreaConfig.msg.load.noBackground)
              _showUploadModal()
              break
            default:
              alert(plantAreaConfig.msg.load.incomplete)
              break
          }
        })
    }

    var _refreshProfile = function (data) {
      // 將廠區卡片設定資訊存至deviceProfile
      var profile =
        data == '' || data.length == 0 ? null : JSON.parse(unescape(data))
      console.log(profile)
      if (profile == null) {
        alert(plantAreaConfig.msg.load.noData)
      } else {
        deviceProfile = _.uniq(profile.devices, (val) => {
          return val.id
        })
      }
    }

    var _loadProfile = function () {
      // 拿廠區卡片設定檔
      if (!_.isUndefined(plantAreaId)) {
        servkit.ajax(
          {
            url: 'api/getdata/file',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              type: plantAreaConfig.dataname,
              pathPattern: '{data}',
              pathParam: {
                data: [plantAreaId],
              },
            }),
            async: false,
          },
          {
            success: function (data) {
              // 有設定的machine
              _refreshProfile(data)
              _getDeviceImage(
                _.map(plantAreaObj[plantAreaId], (val) => {
                  return val.device_id
                }),
                reDraw
              )
              if (servtechConfig.ST_MONITOR_USE_SHIFT_DATA) getShiftData()
              else _subscribeData()
            },
          }
        )
      }
    }

    var _updateData = function (id, param, value) {
      // 更新廠區卡片自訂參數
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

    var _changeSubscribeData = function (data, machineList, signal) {
      // 顯示出所有命令
      var commands = data[0].listCommands()
      var devices = machineList
      if (devices === undefined) {
        devices = deviceProfile
      }

      // 取某命令某機資料
      _.each(devices, function (device) {
        machineId = device.id || device
        var index
        try {
          index = _.findIndex(data, (value) => {
            return value.data.from === servkit.getBoxByMachine(machineId)
          })
        } catch (e) {
          console.warn(e)
        }

        //device-title update device status
        if (_.contains(commands, plantAreaConfig.statusCommand)) {
          var statusAry = [['0']]
          var signalValue = [['---']]
          try {
            if (index >= 0) {
              statusAry =
                data[index].getMachineValue(
                  plantAreaConfig.statusCommand,
                  machineId
                ) || ''
              if (signal) {
                signalValue = data[index].getValue(signal, machineId) || ''
              }
            } else if (servkit.getMachineMap()[machineId].is_real_data === 0) {
              statusAry =
                data[0].getMachineValue(
                  plantAreaConfig.statusCommand,
                  machineId
                ) || ''
              if (signal) {
                signalValue = data[0].getValue(signal, machineId) || ''
              }
            }
          } catch (e) {
            console.warn(e)
          }
          var status = plantAreaConfig.statusMap[statusAry[0]] || ''
          $('#' + machineId).attr('class', 'device ' + status)

          if ($('.labelValue').length > 0 && signalValue[0][0] !== 'B') {
            $('#' + machineId)
              .find('.labelValue')
              .text(signalValue[0][0])
          } else {
            $('#' + machineId)
              .find('.labelValue')
              .text('---')
          }
        }

        //device-info
        _.each(device.labels, function (label) {
          var command = label.value.param
          if (command && command.length > 0) {
            if (_.contains(commands, command)) {
              var value = '---'
              try {
                if (index >= 0)
                  value =
                    data[index].getMachineValue(command, machineId)[0][0] || ''
                else if (servkit.getMachineMap()[machineId].is_real_data === 0)
                  value =
                    data[0].getMachineValue(command, machineId)[0][0] || ''
              } catch (e) {
                console.warn(e)
              }
              var changeData = {}
              // 切割值是"[\"H|0\",\"D|0\",\"T|3\",\"M|70\",\"F|9000\",\"S|0\"]"|前的是key|後的是value
              if (_.isArray(value) && value[0].toString().search(/\||:/) >= 0) {
                _.each(value, (val) => {
                  changeData[val.split(/\|| /g)[0]] = val.split(/\|| /g)[1]
                })
                value = changeData
              }

              if (
                label.value.index &&
                (_.isArray(value) || _.isObject(value))
              ) {
                value = value[label.value.index]
              }

              if (value === 'B' || !value) {
                value = '---'
              }

              if (
                value !== 'B' &&
                command === 'G_TOCP()' &&
                shiftData[machineId] &&
                shiftData[machineId].partcount
              ) {
                // 2020-07-28 為了和單機監控顯示的「加工元件總數」邏輯一致，改成當下累積顆數，未來會改成可設定要顯示哪一種形式
                // value = value - shiftData[machineId].partcount
                if (isNaN(value) || value < 0) value = 0
              }
              if (
                value !== 'B' &&
                command === 'G_CUTT()' &&
                shiftData[machineId] &&
                shiftData[machineId].cut_millisecond
              ) {
                value = value - shiftData[machineId].cut_millisecond
                if (isNaN(value) || value < 0) value = 0
              }
              if (
                value !== 'B' &&
                command === 'G_OPRT()' &&
                shiftData[machineId] &&
                shiftData[machineId].oper_millisecond
              ) {
                value = value - shiftData[machineId].oper_millisecond
                if (isNaN(value) || value < 0) value = 0
              }
              if (
                value !== 'B' &&
                command === 'G_ELCT()' &&
                shiftData[machineId] &&
                shiftData[machineId].power_millisecond
              ) {
                value = value - shiftData[machineId].power_millisecond
                if (isNaN(value) || value < 0) value = 0
              }
              _updateData(machineId, command, value)
            } else {
              console.warn('COMMAND ' + command + ' not support')
            }
          }
        })
      })
    }

    var _subscribeData = function (machineList, signal) {
      // 聽device status
      servkit.subscribe('DeviceStatus', {
        machines: servkit.getBoxList(),
        handler: function (data) {
          _changeSubscribeData(data, machineList, signal)
        },
        noDataHandler: function (data) {
          _changeSubscribeData(data, machineList, signal)
        },
        dataModeling: true,
        allBrand: true,
      })
    }

    var _drawShowLabel = function (label, preview) {
      var html = []
      html.push('<tr>')
      html.push('<th class="value-head"><span>' + label.name + '</span></th>')
      switch (label.value.type) {
        case 'text':
          html.push(
            '<td class="value-text dynamic-value" data-param="' +
              label.value.param +
              '"><div class="value">' +
              (preview ? 'Text' : '') +
              '</div></td>'
          )
          break
        case 'progress':
          html.push(
            '<td class="value-progress dynamic-value" data-param="' +
              label.value.param +
              '"><div class="progress">' +
              '  <div class="progress-bar bg-color-teal" style="width: ' +
              (preview ? '50' : '') +
              '%;">' +
              (preview ? '50' : '') +
              '%</div>' +
              '</div></td>'
          )
          break
        case 'accum_ms':
          html.push(
            '<td class="value-text value-accum-ms dynamic-value" data-param="' +
              label.value.param +
              '"><div class="value">' +
              (preview ? parseInt(5000000).millisecondToDHHmmss() : '') +
              '</div></td>'
          )
          break
        default:
          console.warn('Undefined Label Type [' + label.value.type + ']')
          break
      }
      html.push('</tr>')
      return html.join('')
    }

    var toMonitorPage = function (machineId) {
      var lang = servkit.getCookie('lang')
      //*** 用來辨識從監控離開時，要回哪個app的子頁面
      var hashAry = window.location.hash.split('/')
      var location =
        '#app/EquipMonitor/function/' +
        lang +
        '/02_machine.html?boxId=' +
        (servkit.getBoxByMachine(machineId) || '') +
        '&machineId=' +
        (machineId || '') +
        '&cncBrand=' +
        servkit.getMachineBrand(machineId) +
        '&preAppId=' +
        hashAry[1] +
        '&prePage=' +
        hashAry[4].replace('.html', '')
      if (servkit.getURLParameter('pageby')) {
        window.open(location, '_blank')
      } else {
        window.location = location
      }
    }

    var _showLoadMachineModal = function (plantAreaId) {
      // 在modal顯示機台選擇
      deviceList = _.filter(
        _.map(servkit.getMachineList(), (val) => {
          if (servkit.getPlantAreaByMachine(val) === plantAreaId) {
            return {
              name: val,
            }
          }
        }).sort(servkit.naturalCompareValue)
      )

      deviceList = _.map(deviceList, (val) => {
        return val.name
      })

      $loadModal
        .find('.modal-header h4')
        .html('選擇欲載入機台【' + servkit.getPlantAreaName(plantAreaId) + '】')
      $loadModal.find('.modal-body .smart-form').removeClass('hide')
      $loadModal.find('.modal-footer #check-machine').removeClass('hide')

      $('#deviceList').remove()
      $loadModal
        .find('table')
        .addClass('hide')
        .after('<div id="deviceList"></div>')
      if (deviceProfile) {
        _.each(deviceProfile, (val) => {
          var deviceIndex = _.findIndex(deviceList, (device) => {
            return val.id === device
          })
          if (deviceIndex >= 0) {
            deviceList.splice(deviceIndex, 1)
          }
        })
      }
      var html = []
      _.each(deviceList, (d) => {
        html.push('<div class="selectDeviceName">')

        html.push(
          '<a class="stk-load-machine-file" href="javascript:void(0);" ' +
            'data-id="' +
            d +
            '" data-name="' +
            servkit.getMachineName(d) +
            '">'
        )
        html.push(servkit.getMachineName(d) + '<br><span>')
        if (servkit.getBrandMap()[servkit.getMachineBrand(d)]) {
          html.push(servkit.getBrandMap()[servkit.getMachineBrand(d)].name)
        }
        html.push('</span></a></div>')
      })
      $loadModal.find('#deviceList').html(html.join('')).end().modal('show')
    }

    var _buildUploadModal = function () {
      // 建立有dropzone的modal
      // upload dialog
      Dropzone.autoDiscover = false
      try {
        $('#mydropzone')
          .addClass('dropzone')
          .dropzone({
            url: 'api/equipmonitor/uploadPlantAreaBackground',
            addRemoveLinks: true,
            maxFilesize: 6, // MB
            acceptedFiles: '.png',
            dictDefaultMessage:
              '<span class="text-center">' +
              '<span class="font-lg visible-xs-block visible-sm-block visible-lg-block">' +
              '<span class="font-lg"><i class="fa fa-caret-right text-danger"></i> 將圖片檔拖曳至此 ' +
              '<span class="font-xs">上傳</span></span>' +
              '<span>&nbsp&nbsp</span><span class="display-inline"> (或點擊)</span></span>',
            dictResponseError: plantAreaConfig.msg.upload.fail,
            dictInvalidFileType: plantAreaConfig.msg.upload.invalid,
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

    var _showUploadModal = function () {
      if ($uploadModal.find(':input[name="id"]').length == 0) {
        $uploadModal.find('form').prepend('<input type="hidden" name="id">')
      }
      $uploadModal
        .find(':input[name="id"]')
        .val(plantAreaId)
        .end()
        .find('.dropzone')
        .removeClass('dz-started')
        .end()
        .find('.dropzone .dz-preview')
        .remove()
      $uploadModal.modal('show')
    }

    var _buildDeviceUploadModal = function () {
      // 建立有device dropzone的modal
      // upload dialog
      Dropzone.autoDiscover = false
      try {
        $('#devicedropzone')
          .addClass('dropzone')
          .dropzone({
            url: 'api/equipmonitor/uploadPlantAreaDeviceImage',
            addRemoveLinks: true,
            maxFilesize: 6, // MB
            acceptedFiles: '.png',
            dictDefaultMessage:
              '<span class="text-center">' +
              '<span class="font-lg visible-xs-block visible-sm-block visible-lg-block">' +
              '<span class="font-lg"><i class="fa fa-caret-right text-danger"></i> 將圖片檔拖曳至此 ' +
              '<span class="font-xs">上傳</span></span>' +
              '<span>&nbsp&nbsp</span><span class="display-inline"> (或點擊)</span></span>',
            dictResponseError: plantAreaConfig.msg.upload.fail,
            dictInvalidFileType: plantAreaConfig.msg.upload.invalid,
            init: function () {
              this.on('success', function (file, res) {
                switch (res.type) {
                  case 0:
                    // close upload modal
                    var deviceId = $uploadDeviceModal
                      .find(':input[name=id]')
                      .val()
                    _getDeviceImage([deviceId], function () {
                      _changeDisplayDeviceImage(deviceId, true)
                      $uploadDeviceModal.modal('hide')
                    })
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

    var _showDeviceUploadModal = function (deivceId) {
      if ($uploadDeviceModal.find(':input[name="id"]').length == 0) {
        $uploadDeviceModal
          .find('form')
          .prepend('<input type="hidden" name="id">')
      }
      $uploadDeviceModal
        .find(':input[name="id"]')
        .val(deivceId)
        .end()
        .find('.dropzone')
        .removeClass('dz-started')
        .end()
        .find('.dropzone .dz-preview')
        .remove()
      $uploadDeviceModal.modal('show')
    }

    var _bindEditEvent = function () {
      // 廠區編輯事件綁定
      $body
        .off('click', '.stk-load')
        .on('click', '.stk-load', function () {
          _showLoadModal()
        })
        .off('click', '.stk-load-file') // 選擇廠區
        .on('click', '.stk-load-file', function () {
          plantAreaId = $(this).attr('data-id')
          _changeTitle()
          _reloadBackground()
          $container.find('.device').remove()
          // close load modal
          $loadModal.modal('hide')
        })
        .off('click', '.stk-load-machines') // 載入機台modal
        .on('click', '.stk-load-machines', function () {
          plantAreaId = $('#plantAreaId').data('plantAreaId')
          _changeTitle()
          _showLoadMachineModal($('#plantAreaId').data('plantAreaId'))
        })
        .off('click', '.stk-load-machine-file') // 選擇載入機台
        .on('click', '.stk-load-machine-file', function () {
          var $parent = $(this).closest('.selectDeviceName')
          if ($parent.hasClass('machine-checked')) {
            $parent.removeClass('machine-checked')
          } else {
            $parent.addClass('machine-checked')
          }
        })
        .off('click', '.stk-upload')
        .on('click', '.stk-upload', function () {
          _showUploadModal()
        })
        .off('click', '.stk-save')
        .on('click', '.stk-save', function () {
          _save()
        })
        .off('click', '.stk-clear-machines')
        .on('click', '.stk-clear-machines', function () {
          _clearMachines()
        })

      $container
        .off('click', '.stk-delete')
        .on('click', '.stk-delete', function () {
          _delete(this)
        })
        .off('click', '.deleteLabel')
        .on('click', '.deleteLabel', function () {
          $(this).closest('tr').remove()
        })
        .off('click', '[name=param]')
        .on('click', '[name=param]', function () {
          if ($(this).closest('tr').is(':last-child')) {
            $(this)
              .closest('.device-info-edit tbody')
              .append(plantAreaConfig.editWidgetLabel)
          }
        })
        .off('change', '.device_id')
        .on('change', '.device_id', function () {
          var device = $(this).closest('.device').data('device')
          var deviceIndex = _.findIndex(deviceProfile, (val) => {
            return val.id === device
          })
          if (deviceIndex >= 0) {
            deviceProfile[deviceIndex].id = this.value
          }
          $(this).closest('.device').data('device', this.value)
          $(this)
            .closest('.device-title')
            .find('.device_name')
            .text(servkit.getMachineName(this.value))
        })
        .off('click', '.toggle-btn')
        .on('click', '.toggle-btn', function () {
          const $device = $(this).parents('.device')
          $device.toggleClass('toggle-close')
          let isOpen = true
          if ($device.hasClass('toggle-close')) isOpen = false
          const $inputId = $(this).prev('input[name="id"]')
          if (!isOpen) {
            var labels = getDeviceLabels($device)
            var labelHtml = []
            _.each(labels, function (l) {
              labelHtml.push(_drawShowLabel(l, true))
            })
            $device.find('.device-info table').html(labelHtml)
            if (labels.length) {
              $device.find('.device-info').removeClass('hide')
            }
            $inputId.addClass('hide')
            $device.find('.disabled-text').addClass('hide')
            $device.find('.update-image').addClass('hide')
            $device.find('.device-title span:first').removeClass('hide')
            $(this).find('i').addClass('fa-plus').removeClass('fa-minus')
            $device.find('.device-info-position').removeClass('edit')
            var left = 9
            if ($device.find('.device-info').hasClass('hide')) {
              left = ($device.find('.device_name').width() + 13) / 2 - 80
            }
            $device.find('.device-info-position').css('left', left)
          } else {
            if (!$.trim($($device.find('.device-info-edit tbody')).html())) {
              $device
                .find('.device-info-edit tbody')
                .append(plantAreaConfig.editWidgetLabel)
            }
            $device.find('.device-info').addClass('hide')
            $inputId.removeClass('hide')
            $device.find('.disabled-text').removeClass('hide')
            $device.find('.update-image').removeClass('hide')
            $device.find('.device-title span:first').addClass('hide')
            $(this).find('i').addClass('fa-minus').removeClass('fa-plus')
            $device.find('.device-info-position').css('left', 0)
            $device.find('.device-info-position').addClass('edit')
          }
        })
        .off('click', '.update-image')
        .on('click', '.update-image', function () {
          $('[name=deviceImage').prop(
            'checked',
            $(this).closest('.device').find('.device-img img').data('image')
          )
          _showDeviceUploadModal($(this).parent().find('.device_id').val())
        })

      // 新增機台
      $('#check-machine').on('click', function () {
        var left = 0
        var top = 0
        if ($('#load-modal').data('cardPostion')) {
          left = $('#load-modal').data('cardPostion').left
          top = $('#load-modal').data('cardPostion').top
          $('#load-modal').removeData('cardPostion')
        }
        _.each(plantAreaObj[plantAreaId], function (elem) {
          var isChecked = _.find($('.machine-checked'), (val) => {
            return $(val).children('a').data('id') === elem.device_id
          })
          if (isChecked !== undefined) {
            machineId = elem.device_id
            if (!$('input[value="' + machineId + '"]').length) {
              var cardHeight = 35
              var cardWidth = 8.5 * servkit.getMachineName(machineId).length
              if (left + cardWidth > $('#space > div').width()) {
                left = 0
                top += cardHeight + 10
              }
              if (top + cardHeight > $('#space > div').height()) {
                top = 0
              }
              var x = (left / $('#space > div').width()) * 100
              var y = (top / $('#space > div').height()) * 100
              var $machineCard = _add(elem.labels, machineId, y, x)

              deviceProfile.push({
                id: machineId,
                labels: [],
                pos: {
                  x: x.toFixed(2) + '%',
                  y: y.toFixed(2) + '%',
                },
              })
              left += cardWidth + 25

              $machineCard.find('.toggle-btn').trigger('click')
            }
          }
        })
        $loadModal.modal('hide')
        $('[name=allCheck]').prop('checked', false)
      })

      // 選擇要不要機台圖
      $('[name=deviceImage]').on('change', function () {
        var deviceId = $uploadDeviceModal.find(':input[name="id"]').val()
        var show = $('[name=deviceImage]').prop('checked')
        _.each(deviceProfile, (profile, key) => {
          if (deviceId === profile.id) {
            if (!deviceProfile[key].image) {
              deviceProfile[key].image = {}
            }
            if (show) {
              deviceProfile[key].image.show = true
              _getDeviceImage([deviceId], function () {
                _changeDisplayDeviceImage(deviceId, show)
              })
            } else {
              deviceProfile[key].image.show = false
              _changeDisplayDeviceImage(deviceId, show)
            }
          }
        })
      })

      // 全部顯示或全部不顯示機台圖片
      $('.stk-machines-image').on('click', function () {
        var show = $('.stk-machines-image').data('value')
        var deviceList = _.map(deviceProfile, (profile) => {
          return profile.id
        })
        var changeImage = function () {
          _.each(deviceProfile, (profile, key) => {
            if (!deviceProfile[key].image) {
              deviceProfile[key].image = {}
            }
            _changeDisplayDeviceImage(profile.id, show)
            deviceProfile[key].image.show = show
          })
        }
        if (show) {
          _getDeviceImage(deviceList, changeImage)
          $('.stk-machines-image').text('Hide All Machines Image')
        } else {
          changeImage()
          $('.stk-machines-image').text('Show All Machines Image')
        }
        $('.stk-machines-image').data('value', !show)
      })
    }

    var _bindMachineFilterEvent = function () {
      // 綁定機台過濾事件(選擇機台時)
      $loadModal.find('#machineName').on('keyup', function () {
        var data = this.value
        var html = []
        _.each(deviceList, (d) => {
          if (
            data === '' ||
            servkit
              .getMachineName(d)
              .toLowerCase()
              .search(data.toLowerCase()) >= 0
          ) {
            html.push('<div class="selectDeviceName">')
            html.push(
              '<a class="stk-load-machine-file" href="javascript:void(0);" data-id="' +
                d +
                '" data-name="' +
                servkit.getMachineName(d) +
                '">'
            )
            html.push(servkit.getMachineName(d) + '<br><span>')
            if (servkit.getBrandMap()[servkit.getMachineBrand(d)]) {
              html.push(servkit.getBrandMap()[servkit.getMachineBrand(d)].name)
            }
            html.push('</span></a></div>')
          }
        })
        $loadModal.find('#deviceList').html(html.join(''))
      })
    }

    var _bindMachineEditEvent = function () {
      // 機台事件綁定
      $body
        .off('click', '.stk-load')
        .on('click', '.stk-load', function () {
          $('.others').remove()
          _showLoadModal()
        })
        .off('click', '.stk-load-file') // 選擇廠區
        .on('click', '.stk-load-file', function () {
          var $t = $(this)
          if ($t.data('by') === 'brand') {
            brandId = $t.attr('data-id')
            $loadModal.modal('hide')
            $('#brandId').closest('h2').removeClass('hide')
            $('#brandId').html(servkit.getBrandName(brandId))
            $('#plantAreaId').closest('h2').addClass('hide')
          } else {
            ;(plantAreaId = $t.attr('data-id')), $t.text()
            // title
            _changeTitle()
            _showLoadMachineModal($t.attr('data-id'))
          }
          // close load modal
        })
        .off('click', '.stk-load-machine-file') // 選擇機台
        .on('click', '.stk-load-machine-file', function () {
          machineId = $(this).attr('data-id')
          $('#machineId').html(servkit.getMachineName(machineId))
          // close load modal
          $('#plantAreaId').closest('h2').removeClass('hide')
          $('#brandId').closest('h2').addClass('hide')
          $loadModal.modal('hide')
        })
    }

    var _showLoadModal = function () {
      $loadModal.find('.modal-body .smart-form').addClass('hide')
      $loadModal.find('.modal-footer #check-machine').addClass('hide')
      $loadModal.find('.modal-body table').removeClass('hide')
      $loadModal.find('#machineName').val('')
      $('#deviceList').remove()
      var html = []
      if (plantAreaConfig.byBrand) {
        $loadModal.find('.modal-header h4').html('選擇欲載入廠區或廠牌')
        $loadModal
          .find('table:first thead')
          .html(
            '<tr><th><a href="javascript: void(0)"><i class="fa fa-plus"></i><span>廠區</span></a></th></tr>'
          )
        $loadModal
          .find('table:last thead')
          .html(
            '<tr><th><a href="javascript: void(0)"><i class="fa fa-minus"></i><span>廠牌</span></a></th></tr>'
          )
        _.each(servkit.getBrandMap(), (d, key) => {
          html.push(
            '<tr><td><a class="stk-load-file" href="javascript:void(0);" data-id="' +
              key +
              '" data-name="' +
              d.name +
              '" data-by="brand">' +
              d.name +
              '</a></td></tr>'
          )
        })
        $loadModal.find('table:last tbody').html(html.join(''))
      } else {
        $loadModal.find('.modal-header h4').html('選擇欲載入廠區')
      }
      html = []
      _.each(servkit.getPlantAreaMap(), (d) => {
        html.push(
          '<tr><td><a class="stk-load-file" href="javascript:void(0);" data-id="' +
            d.plant_id +
            '">' +
            servkit.getPlantAreaName(d.plant_id) +
            '</a></td></tr>'
        )
      })
      $loadModal
        .find('table:first tbody')
        .html(html.join(''))
        .end()
        .modal('show')
    }

    var getDeviceLabels = function ($device) {
      var labels = []
      $device.find('.device-info-edit table tr').each(function () {
        var $label = $(this)
        if (
          $label.find(':input[name="name"]').val() &&
          $label.find(':input[name="type"]').val()
        ) {
          labels.push({
            name: $label.find(':input[name="name"]').val(),
            value: {
              type: $label.find(':input[name="type"]').val(),
              param: $label.find(':input[name="param"]').val(),
              index: $label.find(':input[name="index"]').val(),
            },
          })
        }
      })

      return labels
    }

    var _add = function (labels, id, y, x) {
      // 新增機台編輯的卡片
      // build tempate
      var labelHtml = []
      _.each(labels, function (l) {
        labelHtml.push(_drawShowLabel(l, true))
      })
      var _editTemplate = _.template(plantAreaConfig.editWidgetBody)({
        labels: labelHtml.join(''),
        hide: labels && labels.length ? '' : 'hide',
        editLabels: _(plantAreaConfig.labelSize)
          .times(function () {
            return plantAreaConfig.editWidgetLabel
          })
          .join(''),
      })
      var $editTemplate = $(_editTemplate)
      $editTemplate.prepend(_.template(plantAreaConfig.editWidgetPostion)())
      $editTemplate.appendTo($container.children('div')).draggable({
        containment: $container,
        drag: function () {
          var l = (
            100 *
            parseFloat(
              $(this).position().left / parseFloat($(this).parent().width())
            )
          ).toFixed(2)
          var t = (
            100 *
            parseFloat(
              $(this).position().top / parseFloat($(this).parent().height())
            )
          ).toFixed(2)
          $(this).find('.device-info-position span.left').text(l)
          $(this).find('.device-info-position span.top').text(t)
          $(this).find('.device-info-position input.left').val(l)
          $(this).find('.device-info-position input.top').val(t)
        },
        stop: function () {
          var l =
            (
              100 *
              parseFloat(
                $(this).position().left / parseFloat($(this).parent().width())
              )
            ).toFixed(2) + '%'
          var t =
            (
              100 *
              parseFloat(
                $(this).position().top / parseFloat($(this).parent().height())
              )
            ).toFixed(2) + '%'
          $(this).css('left', l)
          $(this).css('top', t)
        },
      })

      $editTemplate.data('device', id)
      $editTemplate.find('span.device_name').text(servkit.getMachineName(id))
      $editTemplate.find(':input[name="id"]').val(id)
      var top = Number(y).toFixed(2)
      var left = Number(x).toFixed(2)
      $editTemplate.css({
        top: top + '%',
        left: left + '%',
      })
      $editTemplate.find('.device-info-position span.left').text(left)
      $editTemplate.find('.device-info-position span.top').text(top)
      $editTemplate.find('.device-info-position input.left').val(left)
      $editTemplate.find('.device-info-position input.top').val(top)
      return $editTemplate
    }

    var _save = function () {
      var obj = {
        id: plantAreaId,
        title: 'Line',
        devices: [],
      }
      $container.find('.device').each(function () {
        var $device = $(this)
        var labels = getDeviceLabels($device)

        obj.devices.push({
          disabled: $device.find(':input[name="disabled"]').prop('checked'),
          id: $device.find(':input[name="id"]').val(),
          pos: {
            x: $device[0].style.left,
            y: $device[0].style.top,
          },
          labels: labels,
          image: {
            show: $device.find('.device-img img').data('image'),
            width: $device.find('.device-img input.width').val(),
            height: $device.find('.device-img input.height').val(),
          },
        })
      })
      var data = {}
      obj.devices = _.sortBy(obj.devices, 'id')
      data[plantAreaId] = escape(JSON.stringify(obj))
      servkit.ajax(
        {
          url: 'api/savedata/' + plantAreaConfig.dataname,
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(data),
        },
        {
          success: function () {
            // success callback
            alert(plantAreaConfig.msg.save.success)
          },
          fail: function () {
            alert(plantAreaConfig.msg.save.fail)
          },
        }
      )
    }

    var _delete = function (target) {
      // 刪除機台卡片
      var $tar = $(target)
      if (confirm('確認刪除?')) {
        var deviceIndex = _.findIndex(deviceProfile, (val) => {
          return val.id === $tar.closest('span').find('[name=id]').val()
        })
        if (deviceIndex >= 0) {
          deviceProfile.splice(deviceIndex, 1)
        }
        $tar.parents('.device:first').remove()
      }
    }

    var _clearMachines = function () {
      $('.device').remove()
      deviceProfile = []
    }

    var _getDeviceImage = function (deviceList, callback) {
      // 拿到目前在cust_param裡的機台圖片
      servkit.ajax(
        {
          url: 'api/equipmonitor/getPlantAreaDevicesImage',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(deviceList),
        },
        {
          success: function (data) {
            deviceImageList = data
            callback()
          },
        }
      )
    }

    var _changeDisplayDeviceImage = function (deviceId, show, width, height) {
      // 隱藏或顯示機台圖
      var $device = $(
        '.device_name:contains(' + servkit.getMachineName(deviceId) + ')'
      ).closest('.device')
      if (show) {
        $device.find('.device-img').removeClass('hide')
        $device.find('.device-img img').attr('src', deviceImageList[deviceId])
        $device.find('.device-img img').load(function () {
          var imagewidth = $device.find('.device-img img').width()
          var imageheight = $device.find('.device-img img').height()
          if (width) {
            $device.find('.device-img .img-div').css('width', width + 'px')
          } else if ($device.find('.device-img input.width').val()) {
            $device
              .find('.device-img .img-div')
              .css(
                'width',
                $device.find('.device-img input.width').val() + 'px'
              )
          }
          if (height) {
            $device.find('.device-img .img-div').css('height', height + 'px')
          } else if ($device.find('.device-img input.height').val()) {
            $device
              .find('.device-img .img-div')
              .css(
                'height',
                $device.find('.device-img input.height').val() + 'px'
              )
          }
          $device.find('.device-img .img-div').resizable({
            // aspectRatio: imagewidth / imageheight,
            resize: function () {
              $device.find('.device-img input.width').val(this.clientWidth)
              $device.find('.device-img input.height').val(this.clientHeight)
            },
            stop: function () {
              $(this).css('left', '')
              $(this).css('top', '')
            },
          })
          $device
            .find('.device-img input.width')
            .val($device.find('.device-img img').width())
          $device
            .find('.device-img input.height')
            .val($device.find('.device-img img').height())
        })
      } else {
        $device.find('.device-img').addClass('hide')
        $device.find('.device-img img').attr('src', null)
        if ($device.find('.device-img .img-div').resizable()) {
          $device.find('.device-img .img-div').resizable('destroy')
        }
      }
      $device.find('.device-img img').data('image', show)
    }

    switch (mode) {
      case 'edit':
        edit()
        break
      case 'machineEdit':
        machineEdit()
        break
      case 'sort':
        sort()
        break
      default:
        show()
        break
    }

    function show() {
      //to monitor page
      $container.on('click', '.device', function () {
        if (!$(this).attr('disabled')) {
          toMonitorPage(this.getAttribute('id'))
        }
      })

      reDraw = function () {
        var html = []
        _.each(deviceProfile, function (d) {
          var labelHtml = []
          _.each(d.labels, function (l) {
            labelHtml.push(_drawShowLabel(l))
          })

          html.push(
            _.template(plantAreaConfig.widgetBody)({
              disabled:
                d.disabled || plantAreaConfig.deivce.disabled
                  ? ' disabled="true"'
                  : '',
              id: d.id,
              name: servkit.getMachineName(d.id) || d.id,
              width: d.image && d.image.width ? d.image.width + 'px' : null,
              height: d.image && d.image.height ? d.image.height + 'px' : null,
              imgsrc: d.image && d.image.show ? deviceImageList[d.id] : null,
              top: d.pos.y,
              left: d.pos.x,
              hide: d.labels.length ? '' : 'hide',
              labels: labelHtml.join(''),
            })
          )
        })

        $container
          .find('.device')
          .remove()
          .end()
          .children('div')
          .append(html.join(''))
      }

      _changeTitle()
      _reloadBackground()
      _resizeContainer()
      $container.find('.device').remove()
    }

    function edit() {
      // find containers
      $container = $container.addClass('edit')

      reDraw = function () {
        _.each(deviceProfile, function (d) {
          plantAreaConfig.labelSize = d.labels.length || 1
          var $device = _add(
            d.labels,
            d.id,
            d.pos.y.replace('%', ''),
            d.pos.x.replace('%', '')
          )
          var $labels = $device.find('.device-info-edit table tr')
          $labels.each(function (i) {
            var $label = $(this)
            var l = d.labels[i]
            if (l) {
              $label.find(':input[name="name"]').val(l.name)
              $label.find(':input[name="param"]').val(l.value.param)
              $label.find(':input[name="type"]').val(l.value.type)
            }
          })
          if (d.disabled) {
            $device.find('[name=disabled]').prop('checked', true)
          }
          $device.find('.toggle-btn').trigger('click')
          if (d.image) {
            // 有要使用機台圖
            _changeDisplayDeviceImage(
              d.id,
              d.image.show,
              d.image.width,
              d.image.height
            )
          }
        })
      }

      // bind events
      _bindEditEvent()
      _bindMachineFilterEvent()
      // build edit enviroment
      _buildUploadModal()
      _buildDeviceUploadModal()
      // image
      _resizeContainer()
      // show Load Modal
      _showLoadModal()
    }

    function machineEdit() {
      // bind events
      _bindMachineEditEvent()
      _bindMachineFilterEvent()
      // build enviroment
      _showLoadModal()
    }

    function sort() {
      var machineList = []
      var machineSortHtml = []
      var signal
      var label = ''
      var newTemplate = []
      var templateObject

      if (servkit.getURLParameter('pageby')) {
        var brands = servkit.getMachineBrandMap()
        var brandId = servkit.getURLParameter('brand-id')
        var firstbrand
        var rate
        var sectionData = {}

        var sectionByBrandMap = {
          CHMER_EDM_UDP: 'wireEDM',
          FANUC_CNC_FOCAS: 'machiningCenter',
          JL_GRINDER_B: 'grindingMachine',
          JL_GRINDER_HM: 'grindingMachine',
          JL_GRINDER_M: 'grindingMachine',
          MAKINO_CNC_FOCAS: 'machiningCenter',
          MAKINO_EDM_MEL: 'EDM',
          QJ_MILL_B: 'manualLathe',
          SODICK_EDM_MC: 'wireEDM',
        }

        if (brandId.includes(' ')) {
          var firstSpace = brandId.indexOf(' ')
          firstbrand = brandId.slice(0, firstSpace)
        } else {
          firstbrand = brandId
        }

        sectionData = plantAreaConfig.sectionMap[sectionByBrandMap[firstbrand]]
        $('#plantAreaId').html(sectionData.title)

        _.each(brands, function (brand, key) {
          var sameBrand
          if (servkit.getPlantAreaByMachine(key)) {
            //因為+已經被處理掉只剩空格
            if (brandId.includes(' ')) {
              sameBrand = _.find(brandId.split(' '), (val) => {
                return val === brand['cnc_id']
              })
              var firstSpace = brandId.indexOf(' ')
              firstbrand = brandId.slice(0, firstSpace)
            } else if (brand['cnc_id'] === brandId) {
              sameBrand = brandId
              firstbrand = brandId
            }

            if (sameBrand) {
              if (sameBrand.startsWith('QJ') || sameBrand.startsWith('JL')) {
                signal = 'G_MDRV04()'
                label = `${plantAreaConfig.deviceValuesName.outputPower}：`
              } else {
                signal = 'G_PRGM()'
                label = `${plantAreaConfig.deviceValuesName.mainProgramNumber}：`
              }

              if (
                window.sessionStorage.getItem('UtilizationShowDemo') === 'true'
              ) {
                rate =
                  (
                    Math.floor(
                      Math.random() *
                        (sectionData.max - sectionData.min + 1) *
                        100
                    ) /
                      100 +
                    sectionData.min
                  ).toFixed(2) + '%'
              } else if (
                key &&
                plantAreaConfig.utilization[key] &&
                plantAreaConfig.utilization[key].power !== 0
              ) {
                rate =
                  Math.floor(
                    (plantAreaConfig.utilization[key].operate /
                      plantAreaConfig.utilization[key].power) *
                      10000
                  ) /
                    100 +
                  '%'
              } else {
                rate = '---'
              }

              machineList.push(key)

              templateObject = {
                id: key,
                name: servkit.getMachineName(key),
                rateName: plantAreaConfig.deviceValuesName.utilizationRate,
                rateValue: rate,
                label: label,
                labelValue: '',
              }

              newTemplate.push(templateObject)

              // 以機台名稱順序來重新排序
              newTemplate.sort(function (a, b) {
                var front = a.name
                var back = b.name
                return front.toString().localeCompare(back)
              })
            }
          }
        })

        _.each(newTemplate, function (item) {
          machineSortHtml.push(_.template(plantAreaConfig.sortWidgetBody)(item))
        })

        $('#machine-sort').html(machineSortHtml.join(''))
        _subscribeData(machineList, signal)
      } else {
        servkit.ajax(
          {
            url: 'api/section/read',
            type: 'GET',
            contentType: 'application/json',
          },
          {
            success: function (data) {
              _.each(data, (val) => {
                if (val.section_id === servkit.getURLParameter('id')) {
                  $('#plantAreaId').html(val.section_name)
                  var rate = 0
                  var max = val.max
                  var min = val.min
                  _.each(val.device_work_sections, (v) => {
                    if (
                      window.sessionStorage.getItem('UtilizationShowDemo') ===
                        'true' ||
                      servtechConfig.ST_ALL_PLANT_AREA_UTILIZATION_DEFAULT_DEMO ===
                        true
                    ) {
                      rate =
                        (
                          Math.floor(Math.random() * (max - min + 1) * 100) /
                            100 +
                          min
                        ).toFixed(2) + '%'
                    } else if (
                      v.device_id &&
                      plantAreaConfig.utilization[v.device_id] &&
                      plantAreaConfig.utilization[v.device_id].power !== 0
                    ) {
                      rate =
                        Math.floor(
                          (plantAreaConfig.utilization[v.device_id].operate /
                            plantAreaConfig.utilization[v.device_id].power) *
                            10000
                        ) /
                          100 +
                        '%'
                    } else {
                      rate = '---'
                    }
                    templateObject = {
                      id: v.device_id,
                      name: servkit.getMachineName(v.device_id),
                      rateName:
                        plantAreaConfig.deviceValuesName.utilizationRate,
                      rateValue: rate,
                      label: label,
                      labelValue: '',
                    }
                    machineList.push(v.device_id)
                    newTemplate.push(templateObject)
                  })
                }
              })

              // 以機台名稱順序來重新排序
              newTemplate.sort(function (a, b) {
                var front = a.name
                var back = b.name
                return front.toString().localeCompare(back)
              })

              _.each(newTemplate, function (item) {
                machineSortHtml.push(
                  _.template(plantAreaConfig.sortWidgetBody)(item)
                )
              })

              $('#machine-sort').html(machineSortHtml.join(''))
              _subscribeData(machineList, signal)
            },
          }
        )
      }

      //to monitor page
      $container.on('click', '.device', function () {
        toMonitorPage(this.getAttribute('id'))
      })
    }

    return {
      getConfig: function () {
        return plantAreaConfig
      },
      getMachineInfo: function () {
        return {
          machineId: machineId,
          brandId: brandId,
        }
      },
    }
  }

  return function (conf, mode) {
    return plantArea(conf, mode)
  }
})(this, $, _, servkit)
