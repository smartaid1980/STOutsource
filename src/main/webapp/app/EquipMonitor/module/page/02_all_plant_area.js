import i18n from '../../../../js/servtech/module/servcloud.i18n.js'

export default function () {
  GoGoAppFun({
    gogo: function (context) {
      pageSetUp()
      context.initMachineLight()
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
      var imageHtml = []
      imageHtml.push(
        '<div><img id="all-plant-bg" src="./app/EquipMonitor/img/plantArea/bkg.png"></div>'
      )
      imageHtml.push(
        `<h5 id="update-utilization-info"><b>${i18n('Utilization')}&nbsp;`
      )
      imageHtml.push(
        `  <i class="fa fa-info-circle" title="${i18n(
          'Last_Update_Time'
        )}：" style="cursor: pointer;"></i>`
      )
      imageHtml.push('</b><br><span>---</span></h5>')
      $('#image').append(imageHtml.join(''))
      context.plantAreaMachineMap = _.groupBy(
        _.map(servkit.getMachinePlantAreaMap(), (val, key) => {
          return {
            plant_id: val.plant_id,
            device_id: key,
          }
        }),
        'plant_id'
      )

      servkit.subscribe('DeviceStatus', {
        machines: servkit.getBoxList(),
        handler: function (data) {
          context.showPlantArea(data)
        },
        noDataHandler: function (data) {
          context.showPlantArea(data)
        },
        dataModeling: true,
        allBrand: true,
      })

      servkit
        .schedule('updateShiftData')
        .freqMillisecond(900000)
        .action(function () {
          context.reDrawUtilization()
        })
        .start()

      $('#draw-area')
        .off('click', '.show-plant-area-info') // 選擇廠區
        .on('click', '.show-plant-area-info', function () {
          var $t = $(this)
          var lang = servkit.getCookie('lang')
          var url = '#app/EquipMonitor/function/' + lang + '/02_plant_area.html'
          window.location.replace(
            url + '?id=' + $t.attr('data-id') + '&text=' + $t.attr('data-id')
          )
          // window.open(url + '?id=' + $t.attr('data-id') + '&text=' + $t.attr('data-id'), '_blank')
        })
        .off('click', '.utilization-rate') // 選擇工段
        .on('click', '.utilization-rate', function () {
          var $t = $(this)
          var lang = servkit.getCookie('lang')
          var url =
            '#app/EquipMonitor/function/' + lang + '/02_plant_area_sort.html'
          window.location.replace(url + '?id=' + $t.attr('data-id'))
          // window.open(url + '?id=' + $t.attr('data-id'), '_blank')
        })
        .off('click', '#update-utilization-info') // 顯示demo工段
        .on('click', '#update-utilization-info', function (evt) {
          evt.preventDefault()
          if (window.sessionStorage.getItem('UtilizationShowDemo') === 'true') {
            context.clickCount--
          } else {
            context.clickCount++
          }
          if (context.clickCount >= 5) {
            window.sessionStorage.setItem('UtilizationShowDemo', true)
          } else if (context.clickCount <= -5) {
            window.sessionStorage.setItem('UtilizationShowDemo', false)
          }
        })

      $('#changeStyle').on('click', function () {
        var monitorHomePage = window.location.href
        if (monitorHomePage.search('index_dark') >= 0) {
          monitorHomePage = monitorHomePage.replace('index_dark', 'index')
        } else {
          monitorHomePage = monitorHomePage.replace('index', 'index_dark')
        }
        window.location.href = monitorHomePage
      })
    },
    util: {
      $drawArea: $('#draw-area'),
      $AllPlantArea: null,
      clickCount: 0,
      devicesQuntity: 0,
      plotList: [],
      plantAreaMachineMap: {},
      getServerTime: function () {
        return $.ajax({
          url: 'api/user/loginInfo',
          async: false,
        }).getResponseHeader('Date')
      },
      initMachineLight: function () {
        //初始化燈號
        var html = `<span>${i18n('Light_Status')}:</span>&nbsp;`
        _.each(servkit.getMachineLightMap(), function (value) {
          html +=
            '<span class="btn" style="background:' +
            value.color +
            ';"></span>&nbsp;<span>' +
            value.light_name +
            '</span>&nbsp;&nbsp;&nbsp;&nbsp;'
        })
        $('#machineLigth').html(html)
      },
      updateCurShift: function (callback) {
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
                    if (Object.keys(data).length) {
                      if (data && data['name']) {
                        callback(data['name'], date)
                      }
                    } else {
                      $('#space > div').prepend(
                        `<a style="cursor: none;font-size: 1.5em;color: #636363;position: absolute;top: 72%;left: -22%;">${i18n(
                          'Currently_Not_In_Shift_Time'
                        )}</a>`
                      )
                      $('#update-utilization-info > span').html('---')
                      $('#update-utilization-info i').attr(
                        'title',
                        `${i18n('Last_Update_Time')}：` +
                          moment().format('YYYY/MM/DD HH:mm:ss')
                      )
                    }
                  },
                }
              )
            },
          }
        )
      },
      drawSection: function (machineMap) {
        servkit.ajax(
          {
            url: 'api/section/read',
            type: 'GET',
            contentType: 'application/json',
          },
          {
            success: function (data) {
              var utilizationRateHtml = []
              _.each(data, (val) => {
                var allOperate = 0
                var allPower = 0
                var rate = 0
                _.each(val.device_work_sections, (v) => {
                  if (machineMap[v.device_id]) {
                    allOperate += machineMap[v.device_id].operate
                    allPower += machineMap[v.device_id].power
                  }
                })
                if (
                  window.sessionStorage.getItem('UtilizationShowDemo') ===
                    'true' ||
                  servtechConfig.ST_ALL_PLANT_AREA_UTILIZATION_DEFAULT_DEMO ===
                    true
                ) {
                  rate =
                    (
                      Math.floor(
                        Math.random() * (val.max - val.min + 1) * 100
                      ) /
                        100 +
                      val.min
                    ).toFixed(2) + '%'
                } else {
                  if (allPower) {
                    rate = (allOperate / allPower).floatToPercentage()
                  } else {
                    rate = '---'
                  }
                }
                if (val.position_top && val.position_left) {
                  utilizationRateHtml.push(
                    '<a href="javascript: void(0);" class="utilization-rate" data-id="' +
                      val.section_id +
                      '" title="' +
                      val.section_name +
                      '"' +
                      ' style="top:' +
                      val.position_top +
                      '%; left:' +
                      val.position_left +
                      '%;"' +
                      '>' +
                      '<span>' +
                      val.section_name +
                      '</span><br>' +
                      rate +
                      '</a>'
                  )
                }
              })
              $('#image>div').prepend(utilizationRateHtml.join(''))
            },
          }
        )
      },
      showPlantArea: function (data) {
        // if ($('#image').height() !== document.getElementById('all-plant-bg').naturalHeight * 0.9) {
        //   $('#image').css('height', document.getElementById('all-plant-bg').naturalHeight * 0.9)
        // }
        var devicesData = {}
        _.each(data, (val, key) => {
          try {
            $.extend(devicesData, data[key].commandWithMachine['G_CONS()'])
          } catch (e) {
            console.warn(e)
          }
        })
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
      reDrawUtilization: function () {
        var ctx = this
        $('#draw-area #image > div > a').remove()
        try {
          ctx.updateCurShift(function (currentWorkShiftName, date) {
            hippo
              .newSimpleExhaler()
              .space('utilization_time_work_shift')
              .index('machine_id', servkit.getMachineList())
              .indexRange('date', date, date)
              .columns(
                'machine_id',
                'date',
                'work_shift',
                'operate_millisecond',
                'power_millisecond'
              )
              .exhale(function (data) {
                var machineMap = {}
                _.each(data.exhalable, (val) => {
                  if (val.work_shift === currentWorkShiftName) {
                    machineMap[val.machine_id] = {
                      operate: parseInt(val.operate_millisecond / 1000) * 1000,
                      power: parseInt(val.power_millisecond / 1000) * 1000,
                    }
                  }
                })
                ctx.drawSection(machineMap)
                machineMap = null
                hippo
                  .newSimpleExhaler()
                  .space('shiftdata_max_timestamp')
                  .index('machine_id', servkit.getMachineList())
                  .indexRange('date', date, date)
                  .columns('machine_id', 'date', 'workShift', 'max_timestamp')
                  .exhale(function (data) {
                    var times = []
                    _.each(data.exhalable, (val) => {
                      if (val.workShift === currentWorkShiftName) {
                        times.push(Number(val.max_timestamp))
                      }
                    })
                    times.sort(function (a, b) {
                      return a - b
                    })
                    var index = parseInt(times.length / 2)
                    $('#update-utilization-info > span').html(
                      times[index]
                        ? moment(times[index], 'YYYYMMDDHHmmssx').format(
                            'YYYY/MM/DD HH:mm:ss'
                          )
                        : '---'
                    )
                    $('#update-utilization-info i').attr(
                      'title',
                      `${i18n('Last_Update_Time')}：` +
                        moment().format('YYYY/MM/DD HH:mm:ss')
                    )
                  })
              })
          })
        } catch (e) {
          ctx.drawSection({})
        }
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
            label: `${i18n('Light_Working')}`,
            data: deviceStatus.online,
            color: servkit.getMachineLightMap()['11'].color,
          },
          {
            label: `${i18n('Light_Idle')}`,
            data: deviceStatus.idle,
            color: servkit.getMachineLightMap()['12'].color,
          },
          {
            label: `${i18n('Light_Alarm')}`,
            data: deviceStatus.alarm,
            color: servkit.getMachineLightMap()['13'].color,
          },
          {
            label: `${i18n('Offline')}`,
            data: deviceStatus.offline,
            color: servkit.getMachineLightMap()['0'].color,
          },
        ]
        var plot = _.find(ctx.plotList, (value) => {
          return value[0] === id
        })
        if (plot === undefined) {
          console.log(id)
          ctx.plotList.push([id, $.plot($('#' + id), dataSet, options)])
        } else {
          plot[1].setData(dataSet)
          plot[1].draw()
        }
      },
    },
    delayCondition: [
      'machineList',
      'machinePlantAreaList',
      'plantAreaList',
      'machineLightList',
    ],
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
    ],
  })
}
