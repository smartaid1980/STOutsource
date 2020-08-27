exports.zoneMonitor = (function (global, $, _, servkit) {
  var _conf = {
    debug: true,
    dataname: 'zone',
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
    // show 時的格式
    widgetBody:
      '<div id="<%= id %>" class="store" style="top: <%= top %>; left: <%= left %>">' +
      '  <div>' +
      '    <div class="store-title clearfix">' +
      '      <div class="text">' +
      '        <span><%= name %></span>' +
      '        <span class="use-status"></span>' +
      '      </div>' +
      '    </div>' +
      '    <div class="store-info clearfix <%= hide %>">' +
      '      <table>' +
      '        <%= labels %>' +
      '      </table>' +
      '    </div>' +
      '  </div>' +
      '  <div class="store-img" style="width:<%= width %>;height:<%= height %>;"><img src="<%= imgsrc %>"></div>' +
      '</div>',
    // edit時顯示卡片位置
    editWidgetPostion:
      '<div class="store-info-position">' +
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
      '<div class="store draggable" style="top: 10px; left: 10px;">' +
      '  <div>' +
      '    <div class="store-title clearfix" style="width: 100%; height: 10px;">' +
      '      <div class="text">' +
      '        <span class="store_name"></span>' +
      '        <span>' +
      // '          <a href="javascript:void(0);" class="update-image icon" title="update image"><i class="fa fa-file-image-o"></i></a>' +
      '          <input type="text" class="store_id" name="id" placeholder="id">' +
      '          <a href="javascript:void(0);" class="close stk-delete icon" title="Delete">×</a>' +
      '          <a href="javascript:void(0);" class="toggle-btn icon" title="Toggle"><i class="fas fa-plus"></i></a>' +
      '        </span>' +
      '      </div>' +
      '    </div>' +
      '    <div class="store-info clearfix <%= hide %>">' +
      '      <table>' +
      '        <%= labels %>' +
      '      </table>' +
      '    </div>' +
      '    <div class="store-info-edit hide clearfix">' +
      '      <table>' +
      '        <%= editLabels %>' +
      '      </table>' +
      '    </div>' +
      '  </div>' +
      '  <div class="store-img hide">' +
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
      '<div class="store" id="<%= id %>">' +
      '  <div>' +
      '    <div class="store-title clearfix" style="width: 100%; height: 10px;">' +
      '    <%= name %>' +
      '    </div>' +
      '    <div class="store-info clearfix">' +
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

  function zoneMonitor(conf, mode) {
    // init
    var zoneConfig = $.extend(true, _conf, conf)
    var $container = $(zoneConfig.container)
    var $body = $('body')
    var $bg = $container.find('.bg')
    var $loadModal = $('#load-modal')
    var $uploadModal = $('#upload-modal')
    var $uploadStoreModal = $('#upload-store-modal')

    var zoneId = servkit.getURLParameter('id') || zoneConfig.zoneId
    var storeProfile, storeList
    var reDraw
    var zoneObj = zoneConfig.zoneObj
    var storeId, brandId
    var storeImageList = {}

    _.each(servkit.getMachineLightMap(), (light, lightKey) => {
      var style = document.createElement('style')
      style.innerHTML =
        '#space .store.' +
        zoneConfig.statusMap[lightKey] +
        ' .store-title{background-color:' +
        light.color +
        ';}'
      document.body.appendChild(style)
    })

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
      $('#zoneId').data('zoneId', zoneId)
      $('#zoneId').html(zoneConfig.zoneMap[zoneId].name || zoneId)
    }

    var _reloadBackground = function () {
      $bg
        .attr(
          'src',
          './api/equipmonitor/plantAreaBackground?id=' +
            zoneId +
            '&_' +
            new Date()
        )
        .off('load')
        .one('load', function () {
          _clearStores()
          _resizeContainer()
          _loadProfile()
        })
        .off('error')
        .one('error', function () {
          switch (mode) {
            case 'edit':
              alert(zoneConfig.msg.load.noBackground)
              _showUploadModal()
              break
            default:
              alert(zoneConfig.msg.load.incomplete)
              break
          }
        })
    }

    var _refreshProfile = function (data) {
      // 將廠區卡片設定資訊存至storeProfile
      var profile =
        data == '' || data.length == 0 ? null : JSON.parse(unescape(data))
      console.log(profile)
      if (profile == null) {
        alert(zoneConfig.msg.load.noData)
      } else {
        storeProfile = _.uniq(profile.stores, (val) => {
          return val.id
        })
      }
    }

    var _loadProfile = function () {
      // 拿廠區卡片設定檔
      if (!_.isUndefined(zoneId)) {
        servkit.ajax(
          {
            url: 'api/getdata/file',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              type: zoneConfig.dataname,
              pathPattern: '{data}',
              pathParam: {
                data: [zoneId],
              },
            }),
            async: false,
          },
          {
            success: function (data) {
              // 有設定的store
              _refreshProfile(data)
              _getStoreImage(
                _.map(zoneObj[zoneId], (val) => {
                  return val.store_id
                }),
                reDraw
              )
            },
          }
        )
      }
    }

    var _updateData = function (id, param, value) {
      // 更新廠區卡片自訂參數
      var $store = $('#' + id)
      var $dvs = $store.find('.dynamic-value[data-param="' + param + '"]')
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

    var _changeSubscribeData = function (storeList, signal) {
      var statusMap = {
        RED: 'alarm',
        YELLOW: 'idle',
        GREEN: 'online',
      }
      _.each(storeList, (val) => {
        var storeId = val
        servkit.ajax(
          {
            url: 'api/storage/store/' + storeId + '/thing',
            type: 'GET',
          },
          {
            success: function (data) {
              var all = data.store_grid_count * data.store_type_cell
              var used = 0
              _.each(data.things, (val) => {
                if (val.thing) {
                  used += val.thing.thing_cell
                }
              })
              $('#' + storeId + ' .store-title .use-status').text(
                '(' + (all - used) + '/' + all + ')'
              )
              var percent = (used / all) * 100
              if (zoneConfig.storeMap[storeId].rule) {
                _.each(
                  zoneConfig.storeMap[storeId].rule['LIGHT'],
                  (rule, key) => {
                    if (percent <= rule['MAX'] && percent >= rule['MIN']) {
                      $('#' + storeId + ' .store-title').css(
                        'background-color',
                        servkit.statusColors[statusMap[key]]
                      )
                    }
                  }
                )
              }
            },
          }
        )
      })
    }

    var _subscribeData = function (storeList, signal) {
      // 聽device status
      servkit
        .schedule('updateStoreData')
        .freqMillisecond(10 * 1000)
        .action(function () {
          _changeSubscribeData(storeList, signal)
        })
        .start()
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

    var toMonitorPage = function (storeId) {
      var lang = servkit.getCookie('lang')
      //*** 用來辨識從監控離開時，要回哪個app的子頁面
      var hashAry = window.location.hash.split('/')
      var location =
        '#app/StrongLEDMonitorManagement/function/' +
        lang +
        '/11_store.html?zoneId=' +
        (zoneId || '') +
        '&storeId=' +
        (storeId || '') +
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

    var _showLoadStoreModal = function (zoneId) {
      // 在modal顯示機台選擇
      storeList = _.filter(
        _.map(zoneConfig.zoneObj[zoneId], (val) => {
          return {
            name: val.store_id,
          }
        }).sort(servkit.naturalCompareValue)
      )

      storeList = _.map(storeList, (val) => {
        return val.name
      })

      $loadModal
        .find('.modal-header h4')
        .html(
          zoneConfig.msg.load.store +
            '【' +
            zoneConfig.zoneMap[zoneId].name +
            '】'
        )
      $loadModal.find('.modal-body .smart-form').removeClass('hide')
      $loadModal.find('.modal-footer #check-store').removeClass('hide')

      $('#storeList').remove()
      $loadModal
        .find('table')
        .addClass('hide')
        .after('<div id="storeList"></div>')
      if (storeProfile) {
        _.each(storeProfile, (val) => {
          var storeIndex = _.findIndex(storeList, (store) => {
            return val.id === store
          })
          if (storeIndex >= 0) {
            storeList.splice(storeIndex, 1)
          }
        })
      }
      var html = []
      _.each(storeList, (d) => {
        html.push('<div class="selectStoreName">')
        html.push(
          '<a class="stk-load-store-file" href="javascript:void(0);" ' +
            'data-id="' +
            d +
            '" data-name="' +
            zoneConfig.storeMap[d].name +
            '">'
        )
        html.push((zoneConfig.storeMap[d].name || d) + '<br><span>')
        html.push('</span></a></div>')
      })
      $loadModal.find('#storeList').html(html.join('')).end().modal('show')
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
              '<span class="font-lg"><i class="fa fa-caret-right text-danger"></i> ' +
              zoneConfig.msg.dropzone.info +
              '<span class="font-xs">' +
              zoneConfig.msg.dropzone.load +
              '</span></span>' +
              '<span>&nbsp&nbsp</span><span class="display-inline"> (' +
              zoneConfig.msg.dropzone.click +
              ')</span></span>',
            dictResponseError: zoneConfig.msg.upload.fail,
            dictInvalidFileType: zoneConfig.msg.upload.invalid,
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
        .val(zoneId)
        .end()
        .find('.dropzone')
        .removeClass('dz-started')
        .end()
        .find('.dropzone .dz-preview')
        .remove()
      $uploadModal.modal('show')
    }

    var _buildStoreUploadModal = function () {
      // 建立有store dropzone的modal
      // upload dialog
      Dropzone.autoDiscover = false
      try {
        $('#storedropzone')
          .addClass('dropzone')
          .dropzone({
            url: 'api/equipmonitor/uploadPlantAreaStoreImage',
            addRemoveLinks: true,
            maxFilesize: 6, // MB
            acceptedFiles: '.png',
            dictDefaultMessage:
              '<span class="text-center">' +
              '<span class="font-lg visible-xs-block visible-sm-block visible-lg-block">' +
              '<span class="font-lg"><i class="fa fa-caret-right text-danger"></i> ' +
              zoneConfig.msg.dropzone.info +
              '<span class="font-xs">' +
              zoneConfig.msg.dropzone.load +
              '</span></span>' +
              '<span>&nbsp&nbsp</span><span class="display-inline"> (' +
              zoneConfig.msg.dropzone.click +
              ')</span></span>',
            dictResponseError: zoneConfig.msg.upload.fail,
            dictInvalidFileType: zoneConfig.msg.upload.invalid,
            init: function () {
              this.on('success', function (file, res) {
                switch (res.type) {
                  case 0:
                    // close upload modal
                    var storeId = $uploadStoreModal
                      .find(':input[name=id]')
                      .val()
                    _getStoreImage([storeId], function () {
                      _changeDisplayStoreImage(storeId, true)
                      $uploadStoreModal.modal('hide')
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

    var _showStoreUploadModal = function (deivceId) {
      if ($uploadStoreModal.find(':input[name="id"]').length == 0) {
        $uploadStoreModal
          .find('form')
          .prepend('<input type="hidden" name="id">')
      }
      $uploadStoreModal
        .find(':input[name="id"]')
        .val(deivceId)
        .end()
        .find('.dropzone')
        .removeClass('dz-started')
        .end()
        .find('.dropzone .dz-preview')
        .remove()
      $uploadStoreModal.modal('show')
    }

    var _bindEditEvent = function () {
      // 廠區編輯事件綁定
      $body
        .off('click', '.stk-load')
        .on('click', '.stk-load', function () {
          _showLoadModal()
        })
        .off('click', '.zone-path') // 縮放廠區選項
        .on('click', '.zone-path', function () {
          var hide = true
          if ($(this).find('i').hasClass('fa-angle-down')) {
            hide = false
            $(this)
              .find('i')
              .removeClass('fa-angle-down')
              .addClass('fa-angle-up')
          } else {
            $(this)
              .find('i')
              .removeClass('fa-angle-up')
              .addClass('fa-angle-down')
          }
          $(this)
            .closest('tr')
            .nextAll('tr')
            .each(function () {
              if ($(this).hasClass('zone-path')) {
                return false
              } else {
                if (hide) {
                  $(this).addClass('hide')
                } else {
                  $(this).removeClass('hide')
                }
              }
            })
        })
        .off('click', '.stk-load-file') // 選擇廠區
        .on('click', '.stk-load-file', function () {
          zoneId = $(this).attr('data-id')
          _changeTitle()
          _reloadBackground()
          $container.find('.store').remove()
          // close load modal
          $loadModal.modal('hide')
        })
        .off('click', '.stk-load-stores') // 載入機台modal
        .on('click', '.stk-load-stores', function () {
          zoneId = $('#zoneId').data('zoneId')
          _changeTitle()
          _showLoadStoreModal($('#zoneId').data('zoneId'))
        })
        .off('click', '.stk-load-store-file') // 選擇載入機台
        .on('click', '.stk-load-store-file', function () {
          var $parent = $(this).closest('.selectStoreName')
          if ($parent.hasClass('store-checked')) {
            $parent.removeClass('store-checked')
          } else {
            $parent.addClass('store-checked')
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
        .off('click', '.stk-clear-stores')
        .on('click', '.stk-clear-stores', function () {
          _clearStores()
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
              .closest('.store-info-edit tbody')
              .append(zoneConfig.editWidgetLabel)
          }
        })
        .off('change', '.store_id')
        .on('change', '.store_id', function () {
          var store = $(this).closest('.store').data('store')
          var storeIndex = _.findIndex(storeProfile, (val) => {
            return val.id === store
          })
          if (storeIndex >= 0) {
            storeProfile[storeIndex].id = this.value
          }
          $(this).closest('.store').data('store', this.value)
          $(this)
            .closest('.store-title')
            .find('.store_name')
            .text(zoneConfig.storeMap[this.value].name)
        })
        .off('click', '.toggle-btn')
        .on('click', '.toggle-btn', function () {
          let $store = $(this).parents('.store')
          $store.toggleClass('toggle-close')
          let isOpen = true
          if ($store.hasClass('toggle-close')) isOpen = false
          let $inputId = $(this).prev('input[name="id"]')
          if (!isOpen) {
            var labels = getStoreLabels($store)
            var labelHtml = []
            _.each(labels, function (l) {
              labelHtml.push(_drawShowLabel(l, true))
            })
            $store.find('.store-info table').html(labelHtml)
            if (labels.length) {
              $store.find('.store-info').removeClass('hide')
            }
            $inputId.addClass('hide')
            $store.find('.update-image').addClass('hide')
            $store.find('.store-title span:first').removeClass('hide')
            $(this).find('i').addClass('fa-plus').removeClass('fa-minus')
            $store.find('.store-info-position').removeClass('edit')
            var left = 9
            if ($store.find('.store-info').hasClass('hide')) {
              left = ($store.find('.store_name').width() + 13) / 2 - 80
            }
            $store.find('.store-info-position').css('left', left)
          } else {
            if (!$.trim($($store.find('.store-info-edit tbody')).html())) {
              $store
                .find('.store-info-edit tbody')
                .append(zoneConfig.editWidgetLabel)
            }
            $store.find('.store-info').addClass('hide')
            $inputId.removeClass('hide')
            $store.find('.update-image').removeClass('hide')
            $store.find('.store-title span:first').addClass('hide')
            $(this).find('i').addClass('fa-minus').removeClass('fa-plus')
            $store.find('.store-info-position').css('left', 0)
            $store.find('.store-info-position').addClass('edit')
          }
        })
        .off('click', '.update-image')
        .on('click', '.update-image', function () {
          $('[name=storeImage').prop(
            'checked',
            $(this).closest('.store').find('.store-img img').data('image')
          )
          _showStoreUploadModal($(this).parent().find('.store_id').val())
        })

      // 新增機台
      $('#check-store').on('click', function () {
        var left = 0
        var top = 0
        if ($('#load-modal').data('cardPostion')) {
          left = $('#load-modal').data('cardPostion').left
          top = $('#load-modal').data('cardPostion').top
          $('#load-modal').removeData('cardPostion')
        }
        _.each(zoneObj[zoneId], function (elem) {
          var isChecked = _.find($('.store-checked'), (val) => {
            return $(val).children('a').data('id') === elem.store_id
          })
          if (isChecked !== undefined) {
            storeId = elem.store_id
            if (!$('input[value="' + storeId + '"]').length) {
              var cardHeight = 35
              var cardWidth = 8.5 * zoneConfig.storeMap[storeId].name.length
              if (left + cardWidth > $('#space > div').width()) {
                left = 0
                top += cardHeight + 10
              }
              if (top + cardHeight > $('#space > div').height()) {
                top = 0
              }
              var x = (left / $('#space > div').width()) * 100
              var y = (top / $('#space > div').height()) * 100
              var $storeCard = _add(elem.labels, storeId, y, x)

              storeProfile.push({
                id: storeId,
                labels: [],
                pos: {
                  x: x.toFixed(2) + '%',
                  y: y.toFixed(2) + '%',
                },
              })
              left += cardWidth + 25

              $storeCard.find('.toggle-btn').trigger('click')
            }
          }
        })
        $loadModal.modal('hide')
        $('[name=allCheck]').prop('checked', false)
      })

      // 選擇要不要機台圖
      $('[name=storeImage]').on('change', function () {
        var storeId = $uploadStoreModal.find(':input[name="id"]').val()
        var show = $('[name=storeImage]').prop('checked')
        _.each(storeProfile, (profile, key) => {
          if (storeId === profile.id) {
            if (!storeProfile[key].image) {
              storeProfile[key].image = {}
            }
            if (show) {
              storeProfile[key].image.show = true
              _getStoreImage([storeId], function () {
                _changeDisplayStoreImage(storeId, show)
              })
            } else {
              storeProfile[key].image.show = false
              _changeDisplayStoreImage(storeId, show)
            }
          }
        })
      })

      // 全部顯示或全部不顯示機台圖片
      $('.stk-stores-image').on('click', function () {
        var show = $('.stk-stores-image').data('value')
        var storeList = _.map(storeProfile, (profile) => {
          return profile.id
        })
        var changeImage = function () {
          _.each(storeProfile, (profile, key) => {
            if (!storeProfile[key].image) {
              storeProfile[key].image = {}
            }
            _changeDisplayStoreImage(profile.id, show)
            storeProfile[key].image.show = show
          })
        }
        if (show) {
          _getStoreImage(storeList, changeImage)
          $('.stk-stores-image').text('Hide All Stores Image')
        } else {
          changeImage()
          $('.stk-stores-image').text('Show All Stores Image')
        }
        $('.stk-stores-image').data('value', !show)
      })
    }

    var _bindStoreFilterEvent = function () {
      // 綁定機台過濾事件(選擇機台時)
      $loadModal.find('#storeName').on('keyup', function () {
        var data = this.value
        var html = []
        _.each(storeList, (d) => {
          if (
            data === '' ||
            zoneConfig.storeMap[d].name
              .toLowerCase()
              .search(data.toLowerCase()) >= 0
          ) {
            html.push('<div class="selectStoreName">')
            html.push(
              '<a class="stk-load-store-file" href="javascript:void(0);" data-id="' +
                d +
                '" data-name="' +
                zoneConfig.storeMap[d].name +
                '">'
            )
            html.push(zoneConfig.storeMap[d].name + '<br><span>')
            html.push('</span></a></div>')
          }
        })
        $loadModal.find('#storeList').html(html.join(''))
      })
    }

    var _bindStoreEditEvent = function () {
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
            $('#zoneId').closest('h2').addClass('hide')
          } else {
            ;(zoneId = $t.attr('data-id')), $t.text()
            // title
            _changeTitle()
            _showLoadStoreModal($t.attr('data-id'))
          }
          // close load modal
        })
        .off('click', '.stk-load-store-file') // 選擇機台
        .on('click', '.stk-load-store-file', function () {
          storeId = $(this).attr('data-id')
          $('#storeId').html(zoneConfig.storeMap[storeId].name)
          // close load modal
          $('#zoneId').closest('h2').removeClass('hide')
          $('#brandId').closest('h2').addClass('hide')
          $loadModal.modal('hide')
        })
    }

    var _showLoadModal = function () {
      $loadModal.find('.modal-body .smart-form').addClass('hide')
      $loadModal.find('.modal-footer #check-store').addClass('hide')
      $loadModal.find('.modal-body table').removeClass('hide')
      $loadModal.find('#storeName').val('')
      $('#storeList').remove()
      $loadModal.find('.modal-header h4').html(zoneConfig.msg.load.zone)
      var html = []
      // _.each(zoneConfig.zoneMap, (val, id) => {
      //   html.push('<tr><td><a class="stk-load-file" href="javascript:void(0);" data-id="' + id + '">' + val.name + '</a></td></tr>')
      // })
      var groupHtml = {}
      _.each(zoneConfig.zoneMap, (val, id) => {
        var path = val.path || ''
        path = path.replace(/\/NULL\//g, '')
        if (!groupHtml[path]) {
          groupHtml[path] = []
        }
        groupHtml[path].push(
          '<tr><td><a class="stk-load-file" href="javascript:void(0);" data-id="' +
            id +
            '">' +
            (val.name || id) +
            '</a></td></tr>'
        )
      })
      var groupList = [] // 為了自然排序
      _.each(Object.keys(groupHtml), (val) => {
        groupList.push({
          key: val,
          name: val,
        })
      })
      _.each(groupList.sort(servkit.naturalCompareValue), (path) => {
        if (path.key) {
          html.push(
            '<tr class="zone-path"><td>' +
              path.key +
              ' <i class="fa fa-angle-up"></i></td></tr>'
          )
        }
        html.push.apply(html, groupHtml[path.key])
      })
      $loadModal
        .find('table:first tbody')
        .html(html.join(''))
        .end()
        .modal('show')
      $('.zone-path').trigger('click')
    }

    var getStoreLabels = function ($store) {
      var labels = []
      $store.find('.store-info-edit table tr').each(function () {
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
      var _editTemplate = _.template(zoneConfig.editWidgetBody)({
        labels: labelHtml.join(''),
        hide: labels && labels.length ? '' : 'hide',
        editLabels: _(zoneConfig.labelSize)
          .times(function () {
            return zoneConfig.editWidgetLabel
          })
          .join(''),
      })
      var $editTemplate = $(_editTemplate)
      $editTemplate.prepend(_.template(zoneConfig.editWidgetPostion)())
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
          $(this).find('.store-info-position span.left').text(l)
          $(this).find('.store-info-position span.top').text(t)
          $(this).find('.store-info-position input.left').val(l)
          $(this).find('.store-info-position input.top').val(t)
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

      $editTemplate.data('store', id)
      $editTemplate
        .find('span.store_name')
        .text(zoneConfig.storeMap[id].name || id)
      $editTemplate.find(':input[name="id"]').val(id)
      var top = Number(y).toFixed(2)
      var left = Number(x).toFixed(2)
      $editTemplate.css({
        top: top + '%',
        left: left + '%',
      })
      $editTemplate.find('.store-info-position span.left').text(left)
      $editTemplate.find('.store-info-position span.top').text(top)
      $editTemplate.find('.store-info-position input.left').val(left)
      $editTemplate.find('.store-info-position input.top').val(top)
      return $editTemplate
    }

    var _save = function () {
      var obj = {
        id: zoneId,
        title: 'Zone',
        stores: [],
      }
      $container.find('.store').each(function () {
        var $store = $(this)
        var labels = getStoreLabels($store)

        obj.stores.push({
          id: $store.find(':input[name="id"]').val(),
          pos: {
            x: $store[0].style.left,
            y: $store[0].style.top,
          },
          labels: labels,
          image: {
            show: $store.find('.store-img img').data('image'),
            width: $store.find('.store-img input.width').val(),
            height: $store.find('.store-img input.height').val(),
          },
        })
      })
      var data = {}
      obj.stores = _.sortBy(obj.stores, 'id')
      data[zoneId] = escape(JSON.stringify(obj))
      servkit.ajax(
        {
          url: 'api/savedata/' + zoneConfig.dataname,
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(data),
        },
        {
          success: function () {
            // success callback
            alert(zoneConfig.msg.save.success)
          },
          fail: function () {
            alert(zoneConfig.msg.save.fail)
          },
        }
      )
    }

    var _delete = function (target) {
      // 刪除機台卡片
      var $tar = $(target)
      if (confirm(zoneConfig.msg.delete.confirm)) {
        var storeIndex = _.findIndex(storeProfile, (val) => {
          return val.id === $tar.closest('span').find('[name=id]').val()
        })
        if (storeIndex >= 0) {
          storeProfile.splice(storeIndex, 1)
        }
        $tar.parents('.store:first').remove()
      }
    }

    var _clearStores = function () {
      $('.store').remove()
      storeProfile = []
    }

    var _getStoreImage = function (storeList, callback) {
      // 拿到目前在cust_param裡的機台圖片
      servkit.ajax(
        {
          url: 'api/equipmonitor/getPlantAreaDevicesImage',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(storeList),
        },
        {
          success: function (data) {
            storeImageList = data
            callback()
          },
        }
      )
    }

    var _changeDisplayStoreImage = function (storeId, show, width, height) {
      // 隱藏或顯示機台圖
      var $store = $(
        '.store_name:contains(' +
          (zoneConfig.storeMap[storeId].name || storeId) +
          ')'
      ).closest('.store')
      if (show) {
        $store.find('.store-img').removeClass('hide')
        $store.find('.store-img img').attr('src', storeImageList[storeId])
        $store.find('.store-img img').load(function () {
          var imagewidth = $store.find('.store-img img').width()
          var imageheight = $store.find('.store-img img').height()
          if (width) {
            $store.find('.store-img .img-div').css('width', width + 'px')
          } else if ($store.find('.store-img input.width').val()) {
            $store
              .find('.store-img .img-div')
              .css('width', $store.find('.store-img input.width').val() + 'px')
          }
          if (height) {
            $store.find('.store-img .img-div').css('height', height + 'px')
          } else if ($store.find('.store-img input.height').val()) {
            $store
              .find('.store-img .img-div')
              .css(
                'height',
                $store.find('.store-img input.height').val() + 'px'
              )
          }
          $store.find('.store-img .img-div').resizable({
            // aspectRatio: imagewidth / imageheight,
            resize: function () {
              $store.find('.store-img input.width').val(this.clientWidth)
              $store.find('.store-img input.height').val(this.clientHeight)
            },
            stop: function () {
              $(this).css('left', '')
              $(this).css('top', '')
            },
          })
          $store
            .find('.store-img input.width')
            .val($store.find('.store-img img').width())
          $store
            .find('.store-img input.height')
            .val($store.find('.store-img img').height())
        })
      } else {
        $store.find('.store-img').addClass('hide')
        $store.find('.store-img img').attr('src', null)
        if ($store.find('.store-img .img-div').resizable()) {
          $store.find('.store-img .img-div').resizable('destroy')
        }
      }
      $store.find('.store-img img').data('image', show)
    }

    switch (mode) {
      case 'edit':
        edit()
        break
      case 'storeEdit':
        storeEdit()
        break
      default:
        show()
        break
    }

    function show() {
      //to monitor page
      $container.on('click', '.store', function () {
        toMonitorPage(this.getAttribute('id'))
      })

      // var zoneListHtml = []
      // _.each(zoneConfig.zoneMap, (val, id) => {
      //   zoneListHtml.push('<li><a href="javascript:void(0);" data-id="' + id + '">' + val.name + '</a></li>')
      // })
      // $('#zone-list').append(zoneListHtml.join(''))
      $('#zone-list').on('click', 'a', function () {
        zoneId = $(this).data('id')

        _changeTitle()
        _reloadBackground()
        _resizeContainer()
        $container.find('.store').remove()
        servkit
          .politeCheck()
          .until(function () {
            return storeProfile && $('.store').length === storeProfile.length
          })
          .thenDo(function () {
            _subscribeData(
              _.filter(
                _.map(zoneConfig.storeMap, (val, key) => {
                  if (zoneId === val.zone) {
                    return key
                  }
                }),
                (val) => {
                  return val
                }
              )
            )
          })
          .tryDuration(0)
          .start()
      })

      reDraw = function () {
        var html = []
        _.each(storeProfile, function (d) {
          var labelHtml = []
          _.each(d.labels, function (l) {
            labelHtml.push(_drawShowLabel(l))
          })
          html.push(
            _.template(zoneConfig.widgetBody)({
              id: d.id,
              name: zoneConfig.storeMap[d.id].name || d.id,
              width: d.image && d.image.width ? d.image.width + 'px' : null,
              height: d.image && d.image.height ? d.image.height + 'px' : null,
              imgsrc: d.image && d.image.show ? storeImageList[d.id] : null,
              top: d.pos.y,
              left: d.pos.x,
              hide: d.labels.length ? '' : 'hide',
              labels: labelHtml.join(''),
            })
          )
        })

        $container
          .find('.store')
          .remove()
          .end()
          .children('div')
          .append(html.join(''))
      }
    }

    function edit() {
      // find containers
      $container = $container.addClass('edit')

      reDraw = function () {
        _.each(storeProfile, function (d) {
          zoneConfig.labelSize = d.labels.length || 1
          var $store = _add(
            d.labels,
            d.id,
            d.pos.y.replace('%', ''),
            d.pos.x.replace('%', '')
          )
          var $labels = $store.find('.store-info-edit table tr')
          $labels.each(function (i) {
            var $label = $(this)
            var l = d.labels[i]
            if (l) {
              $label.find(':input[name="name"]').val(l.name)
              $label.find(':input[name="param"]').val(l.value.param)
              $label.find(':input[name="type"]').val(l.value.type)
            }
          })
          $store.find('.toggle-btn').trigger('click')
          if (d.image) {
            // 有要使用機台圖
            _changeDisplayStoreImage(
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
      _bindStoreFilterEvent()
      // build edit enviroment
      _buildUploadModal()
      _buildStoreUploadModal()
      // image
      _resizeContainer()
      // show Load Modal
      _showLoadModal()
    }

    function storeEdit() {
      // bind events
      _bindStoreEditEvent()
      _bindStoreFilterEvent()
      // build enviroment
      _showLoadModal()
    }

    return {
      getConfig: function () {
        return zoneConfig
      },
      getStoreInfo: function () {
        return {
          storeId: storeId,
          brandId: brandId,
        }
      },
    }
  }

  return function (conf, mode) {
    return zoneMonitor(conf, mode)
  }
})(this, $, _, servkit)
