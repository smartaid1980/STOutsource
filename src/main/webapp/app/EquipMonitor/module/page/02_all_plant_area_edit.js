import i18n from '../../../../js/servtech/module/servcloud.i18n.js'

export default function () {
  GoGoAppFun({
    gogo: function (context) {
      // 建立繪製廠區位置
      context.$drawArea.append('<div id="all-plant-area"></div>')
      context.devicesQuntity = Object.keys(servkit.getPlantAreaMap()).length
      context.$AllPlantArea = $('#all-plant-area')
      if (context.devicesQuntity > 4) {
        context.$AllPlantArea.append(
          `<div class="col col-xs-12 col-sm-12 col-md-4 col-lg-3 all-devices"><div><h3>${i18n(
            'ALL_Plant_Area_Machine'
          )}</h3><div id="all"></div></div></div><div id="image" class="col col-xs-12 col-sm-12 col-md-8 col-lg-9"></div>`
        )
        for (var times = 0; times < context.devicesQuntity; times += 5) {
          context.$AllPlantArea.after('<div class="devices"><div></div></div>')
        }
      } else {
        context.$AllPlantArea.append(
          `<div class="col col-xs-12 col-sm-12 col-md-4 col-lg-3 all-devices"><div><h3>${i18n(
            'ALL_Plant_Area_Machine'
          )}</h3><div id="all"></div></div></div><div class="col col-xs-12 col-sm-12 col-md-8 col-lg-9 devices"><div></div></div>`
        )
        context.$AllPlantArea.after('<div id="image"></div>')
      }
      $('#image').append(
        '<div><img id="all-plant-bg" src="./app/EquipMonitor/img/plantArea/bkg.png"></div>'
      )
      $('#image').append(
        `<h5 id="update-utilization-info"><b>${i18n(
          'Utilization'
        )}</b><br>${i18n('Last_Update_Time')}:<span></span>`
      )
      context.plantAreaMachineMap = _.groupBy(
        servkit.getMachinePlantAreaMap(),
        'plant_id'
      )
      context.showPlantArea()
      context.buildUploadModal()

      $('.stk-upload').on('click', function () {
        if (context.$uploadModal.find(':input[name="id"]').length == 0) {
          context.$uploadModal
            .find('form')
            .prepend('<input type="hidden" name="id">')
        }
        context.$uploadModal
          .find('.dropzone')
          .removeClass('dz-started')
          .end()
          .find('.dropzone .dz-preview')
          .remove()
        context.$uploadModal.modal('show')
      })
      servkit.ajax(
        {
          url: 'api/section/read',
          type: 'GET',
          contentType: 'application/json',
        },
        {
          success: function (data) {
            $('#image').css(
              'height',
              document.getElementById('all-plant-bg').naturalHeight * 0.9
            )
            _.each(data, (val) => {
              console.log(val)
              var edit =
                '<a href="javascript: void(0);" class="utilization-rate" data-id="' +
                val.section_id +
                '" title="' +
                val.section_name +
                '"' +
                ' style="top:' +
                (val.position_top || 0) +
                '%; left:' +
                (val.position_left || 0) +
                '%;"' +
                '>' +
                '<span>' +
                val.section_name +
                '</span><br>---</a>'

              $(edit)
                .appendTo($('#image > div'))
                .draggable({
                  containment: $('.jarviswidget'),
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
                            parseFloat($(this).parent().height() + 50)
                        )
                      ).toFixed(2) + '%'
                    $(this).css('left', l)
                    $(this).css('top', t)
                  },
                })
            })
            $('#update-utilization-info > span').html(
              moment().format('YYYY/MM/DD HH:mm:ss')
            )
          },
        }
      )
      $('.stk-save').on('click', function () {
        var dataList = _.map($('.utilization-rate'), (val) => {
          return {
            section_id: $(val).attr('data-id'),
            position_left: parseFloat($(val)[0].style.left.replace('%', '')),
            position_top: parseFloat($(val)[0].style.top.replace('%', '')),
          }
        })
        servkit.ajax(
          {
            url: 'api/equipmonitor/updateSectionPosition',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(dataList),
          },
          {
            success: function () {
              alert('儲存成功!')
            },
            fail: function () {
              alert('儲存失敗!')
            },
          }
        )
      })
    },
    util: {
      $drawArea: $('#draw-area'),
      $uploadModal: $('#upload-modal'),
      $AllPlantArea: null,
      devicesQuntity: 0,
      plotList: [],
      plantAreaMachineMap: {},
      showPlantArea: function () {
        var devicesData = {}
        var ctx = this
        var index = 0
        var deviceStatus = {},
          allDeviceStatus = {
            online: 0,
            idle: 0,
            alarm: 0,
            offline: 0,
          }
        _.each(ctx.plantAreaMachineMap, (deviceList, plantId) => {
          var html = []
          var regStr = /[`~!@#$%^&*()_+={}<>|[\]\\:;'"?,./]/
          if (!regStr.test(plantId)) {
            if (!document.getElementById(plantId)) {
              var $deviceFrame = $(
                document.getElementsByClassName('devices')[
                  Math.floor(index / 5)
                ]
              ).children('div')
              html.push('<div class="device">')
              html.push(
                '<div class="device-header">' +
                  servkit.getPlantAreaName(plantId) +
                  '</div>'
              )
              html.push(
                '<div class="device-body show-plant-area-info" data-id="' +
                  plantId +
                  '"><div id="' +
                  plantId +
                  '"></div></div>'
              )
              html.push(
                '<button class="btn device-footer show-plant-area-info" data-id="' +
                  plantId +
                  `">${i18n('Show_Plant_area_Info')}</button>`
              )
              html.push('</div>')
              $deviceFrame.append(html.join('')).end()
            }
            deviceStatus = {
              online: 0,
              idle: 0,
              alarm: 0,
              offline: 0,
            }
            _.each(deviceList, (device) => {
              if (_.isArray(devicesData[device.device_id])) {
                if (devicesData[device.device_id][0][0] === '11') {
                  deviceStatus.online = deviceStatus.online + 1
                  allDeviceStatus.online = allDeviceStatus.online + 1
                } else if (devicesData[device.device_id][0][0] === '12') {
                  deviceStatus.idle = deviceStatus.idle + 1
                  allDeviceStatus.idle = allDeviceStatus.idle + 1
                } else if (devicesData[device.device_id][0][0] === '13') {
                  deviceStatus.alarm = deviceStatus.alarm + 1
                  allDeviceStatus.alarm = allDeviceStatus.alarm + 1
                } else {
                  deviceStatus.offline = deviceStatus.offline + 1
                  allDeviceStatus.offline = allDeviceStatus.offline + 1
                }
              } else {
                deviceStatus.offline = deviceStatus.offline + 1
                allDeviceStatus.offline = allDeviceStatus.offline + 1
              }
            })
            ctx.drawPlot(deviceStatus, plantId)
            index++
          }
        })
        ctx.drawPlot(allDeviceStatus, 'all')
      },
      drawPlot: function (deviceStatus, id) {
        var ctx = this
        var options = {
          series: {
            pie: {
              show: true,
              innerRadius: 0.5,
              radius: 1,
              label: {
                show: true,
                radius: 2 / 3,
                formatter: function (label, series) {
                  var count = series.data[0][1]
                  return '<div class="device-label">' + count + '</div>'
                },
              },
            },
          },
          legend: {
            show: false,
          },
        }
        var dataSet = [
          {
            label: '加工',
            data: deviceStatus.online,
            color: servkit.statusColors.online,
          },
          {
            label: '閒置',
            data: deviceStatus.idle,
            color: servkit.statusColors.idle,
          },
          {
            label: '警報',
            data: deviceStatus.alarm,
            color: servkit.statusColors.alarm,
          },
          {
            label: '關機',
            data: deviceStatus.offline,
            color: servkit.statusColors.offline,
          },
        ]
        var plot = _.find(ctx.plotList, (value) => {
          return value[0] === id
        })
        if (plot === undefined) {
          ctx.plotList.push([id, $.plot($('#' + id), dataSet, options)])
        } else {
          plot[1].setData(dataSet)
          plot[1].draw()
        }
      },
      buildUploadModal: function () {
        var ctx = this
        // upload dialog
        Dropzone.autoDiscover = false
        try {
          $('#mydropzone')
            .addClass('dropzone')
            .dropzone({
              url: 'api/equipmonitor/uploadAllPlantAreaBackground',
              addRemoveLinks: true,
              maxFilesize: 6, // MB
              acceptedFiles: '.png',
              dictDefaultMessage:
                '<span class="text-center">' +
                '<span class="font-lg visible-xs-block visible-sm-block visible-lg-block">' +
                '<span class="font-lg"><i class="fa fa-caret-right text-danger"></i> 將圖片檔拖曳至此 ' +
                '<span class="font-xs">上傳</span></span>' +
                '<span>&nbsp&nbsp</span><span class="display-inline"> (或點擊)</span></span>',
              dictResponseError: '檔案上傳失敗!',
              dictInvalidFileType: '僅支援PNG格式圖片',
              init: function () {
                this.on('success', function (file, res) {
                  switch (res.type) {
                    case 0:
                      $('#image img').attr(
                        'src',
                        './api/equipmonitor/allPlantAreaBackground?_' +
                          new Date()
                      )
                      // close upload modal
                      ctx.$uploadModal.modal('hide')
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
      },
    },
    delayCondition: ['machineList', 'machinePlantAreaList', 'plantAreaList'],
    dependencies: [
      [
        '/js/plugin/flot/jquery.flot.cust.min.js',
        '/js/plugin/flot/jquery.flot.resize.min.js',
        '/js/plugin/flot/jquery.flot.fillbetween.min.js',
        '/js/plugin/flot/jquery.flot.orderBar.min.js',
        '/js/plugin/flot/jquery.flot.pie.min.js',
        '/js/plugin/flot/jquery.flot.time.min.js',
        '/js/plugin/flot/jquery.flot.tooltip.min.js',
        '/js/plugin/d3/d3.v4.min.js',
        '/js/plugin/flot/jquery.flot.axislabels.js',
        '/js/plugin/flot/jquery.flot.stack.min.js',
        '/js/plugin/flot/jquery.flot.valuelabels.js',
      ],
      ['/js/plugin/imagesLoaded/imagesloaded.pkgd.min.js'],
      ['/js/plugin/dropzone/dropzone.min.js'],
    ],
  })
}
