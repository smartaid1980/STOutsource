import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      pageSetUp()
      context.drawSection({})
      console.log(
        moment(new Date(context.getServerTime()).getTime()).format(
          'YYYY/MM/DD HH:mm:ss'
        )
      )
      $('.page-title').addClass('hide')
      context.initMachineLight()
      var brand = null
      _.each(servkit.getMachineBrandMap(), (val, key) => {
        if (
          context.sectionByBrandMap[val.cnc_id] &&
          servkit.getPlantAreaByMachine(key)
        ) {
          if (
            !context.sectionMap[context.sectionByBrandMap[val.cnc_id]].machine
          ) {
            context.sectionMap[context.sectionByBrandMap[val.cnc_id]].brand = []
            context.sectionMap[
              context.sectionByBrandMap[val.cnc_id]
            ].machine = []
          }
          if (brand !== val.cnc_id) {
            context.sectionMap[
              context.sectionByBrandMap[val.cnc_id]
            ].brand.push(val.cnc_id)
            brand = val.cnc_id
          }
          context.sectionMap[
            context.sectionByBrandMap[val.cnc_id]
          ].machine.push(key)
        }
      })
      context.plantAreaMachineMap = _.groupBy(
        _.map(servkit.getMachinePlantAreaMap(), (val, key) => {
          return {
            plant_id: val.plant_id,
            device_id: key,
          }
        }),
        'plant_id'
      )

      $('#update-utilization-info').on('click', function (evt) {
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
      context.reDrawUtilization()

      var times = new Date(context.getServerTime()).getTime() % 3600000
      if (times <= 60 * 1000) {
        times = 60 * 1000 - times
      } else if (times > 60 * 1000 && times <= 11 * 60 * 1000) {
        times = 11 * 60 * 1000 - times
      } else if (times > 11 * 60 * 1000 && times <= 21 * 60 * 1000) {
        times = 21 * 60 * 1000 - times
      } else if (times > 21 * 60 * 1000 && times <= 31 * 60 * 1000) {
        times = 31 * 60 * 1000 - times
      } else if (times > 31 * 60 * 1000 && times <= 41 * 60 * 1000) {
        times = 41 * 60 * 1000 - times
      } else if (times > 41 * 60 * 1000 && times <= 51 * 60 * 1000) {
        times = 51 * 60 * 1000 - times
      } else {
        times = 60 * 60 * 1000 - times + 60 * 1000
      }
      var timeoutObj = setTimeout(function () {
        servkit
          .schedule('updateShiftData')
          .freqMillisecond(10 * 60 * 1000)
          .action(function () {
            context.reDrawUtilization()
          })
          .start()
      }, times)

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

      $('body')
        .off('click', '.stk-load-file') // 選擇廠區
        .on('click', '.stk-load-file', function () {
          var $t = $(this)
          var lang = servkit.getCookie('lang')
          var url = '#app/EquipMonitor/function/' + lang + '/02_plant_area.html'
          // window.location.replace(url + '?id=' + $t.attr('data-id') + '&text=' + $t.find('span:last').text() + '&pageby=v1')
          window.open(
            url +
              '?id=' +
              $t.attr('data-id') +
              '&text=' +
              $t.find('span:last').text() +
              '&pageby=v1',
            '_blank'
          )
        })
        .off('click', '.utilizationRate') // 選擇工段
        .on('click', '.utilizationRate', function () {
          var $t = $(this)
          var lang = servkit.getCookie('lang')
          var url =
            '#app/EquipMonitor/function/' + lang + '/02_plant_area_sort.html'
          // window.location.replace(url + '?brand-id=' + $t.attr('data-id') + '&pageby=v1')
          window.open(
            url + '?brand-id=' + $t.attr('data-id') + '&pageby=v1',
            '_blank'
          )
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

      $(window).on('hashchange', function hashChange() {
        clearTimeout(timeoutObj)
        $('.page-footer #login-time').text(
          $('.page-footer #login-time').text().split('.')[0]
        )
      })
    },
    util: {
      $loadWidget: $('#loadWidget'),
      plotList: {},
      plantAreaMachineMap: {},
      clickCount: 0,
      date: null,
      sectionByBrandMap: {
        CHMER_EDM_UDP: 'wireEDM',
        FANUC_CNC_FOCAS: 'machiningCenter',
        JL_GRINDER_B: 'grindingMachine',
        JL_GRINDER_HM: 'grindingMachine',
        JL_GRINDER_M: 'grindingMachine',
        MAKINO_CNC_FOCAS: 'machiningCenter',
        MAKINO_EDM_MEL: 'EDM',
        QJ_MILL_B: 'manualLathe',
        SODICK_EDM_MC: 'wireEDM',
      },
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
        var ctx = this
        console.log(
          'shift ' +
            moment(new Date(ctx.getServerTime()).getTime()).format(
              'YYYY/MM/DD HH:mm:ss'
            ) +
            '     now ' +
            moment(new Date().getTime()).format('YYYY/MM/DD HH:mm:ss')
        )
        servkit.ajax(
          {
            url: 'api/workshift/nowLogicallyDate',
            type: 'GET',
            contentType: 'application/json',
          },
          {
            success: function (date) {
              ctx.date = date
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
                          moment(ctx.getServerTime()).format(
                            'YYYY/MM/DD HH:mm:ss'
                          )
                      )
                    }
                  },
                }
              )
            },
          }
        )
      },
      reDrawUtilization: function () {
        var ctx = this
        $('#space > div > a').remove()
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
                  //if (val.work_shift === currentWorkShiftName) {
                  if (machineMap[val.machine_id]) {
                    machineMap[val.machine_id].operate +=
                      parseInt(val.operate_millisecond / 1000) * 1000
                    machineMap[val.machine_id].power +=
                      parseInt(val.power_millisecond / 1000) * 1000
                  } else {
                    machineMap[val.machine_id] = {
                      operate: parseInt(val.operate_millisecond / 1000) * 1000,
                      power: parseInt(val.power_millisecond / 1000) * 1000,
                    }
                  }
                  //}
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
                        moment(ctx.getServerTime()).format(
                          'YYYY/MM/DD HH:mm:ss'
                        )
                    )
                  })
              })
          })
        } catch (e) {
          ctx.drawSection({})
        }
      },
      sectionMap: {
        wireEDM: {
          // 水加工線切割
          top: '76%',
          left: '78%',
          max: 50,
          min: 40,
          title: `${i18n('Wire_EDM')}`,
        },
        machiningCenter: {
          // 加工中心
          top: '73%',
          left: '16%',
          max: 70,
          min: 60,
          title: `${i18n('Machining_Center')}`,
        },
        EDM: {
          // 放電加工
          top: '35%',
          left: '6%',
          max: 50,
          min: 40,
          title: `${i18n('EDM')}`,
        },
        manualLathe: {
          // 傳統銑床
          top: '14%',
          left: '72%',
          max: 24,
          min: 16,
          title: `${i18n('Manual_Lathe')}`,
        },
        grindingMachine: {
          // 平面磨床
          top: '3%',
          left: '11%',
          max: 60,
          min: 50,
          title: `${i18n('Grinding_Machine')}`,
        },
      },
      drawSection: function (machineMap) {
        var ctx = this
        var utilizationRateHtml = []
        var time = new Date(ctx.getServerTime())
        var startTime
        if (ctx.date) {
          startTime = new Date(
            ctx.date.slice(0, 4) +
              '/' +
              ctx.date.slice(4, 6) +
              '/' +
              ctx.date.slice(6, 8) +
              ' 08:00:00'
          )
        } else {
          startTime = new Date(
            String(time.getFullYear()) +
              '/' +
              String(time.getMonth() + 1) +
              '/' +
              String(time.getDate()) +
              ' 08:00:00'
          )
        }
        _.each(ctx.sectionMap, (val) => {
          var allOperate = 0
          var allPower = 0
          var rate = 0
          _.each(val.machine, function (v) {
            if (machineMap[v]) {
              allOperate += machineMap[v].operate
              // allPower += machineMap[v].power
            }
          })
          if (val.machine) {
            allPower =
              parseInt((time.getTime() - startTime.getTime()) / 1000) *
              1000 *
              Object.keys(val.machine).length
          }

          if (window.sessionStorage.getItem('UtilizationShowDemo') === 'true') {
            rate =
              (
                Math.floor(Math.random() * (val.max - val.min + 1) * 100) /
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

          utilizationRateHtml.push(
            '<a href="javascript: void(0);" class="utilizationRate" data-id="' +
              (val.brand ? val.brand.join('+') : '') +
              '" title="' +
              val.title +
              '"' +
              ' style="top:' +
              val.top +
              '; left:' +
              val.left +
              ';"' +
              '>' +
              '<span>' +
              val.title +
              '</span><br>' +
              rate +
              '</a>'
          )
        })
        $('#space > div').prepend(utilizationRateHtml.join(''))
      },
      showPlantArea: function (data) {
        var devicesData = {}
        _.each(data, (val, key) => {
          try {
            $.extend(devicesData, data[key].commandWithMachine['G_CONS()'])
          } catch (e) {
            // console.warn(e)
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
          if (!ctx.$loadWidget.find('table tbody').find('#' + plantId).length) {
            if (index % 5 === 0) {
              ctx.$loadWidget
                .children('table')
                .children('tbody')
                .append('<tr></tr>')
            }
            html.push('<td>')
            html.push(
              '<a class="stk-load-file" href="javascript:void(0);" data-id="' +
                plantId +
                '">'
            )
            html.push(
              '<div id="' +
                plantId +
                '" class="chart" style="height: 100px; width: 100px;"></div>'
            )
            html.push('<span>' + servkit.getPlantAreaName(plantId) + '</span>')
            html.push('</a></td>')
            ctx.$loadWidget
              .children('table')
              .children('tbody')
              .children('tr:last')
              .append(html.join(''))
              .end()
          }
          deviceStatus = {
            online: 0,
            idle: 0,
            alarm: 0,
            offline: 0,
          }
          _.each(deviceList, (device) => {
            if (_.isArray(devicesData[device.device_id])) {
              if (devicesData[device.device_id][0]) {
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
            } else {
              deviceStatus.offline = deviceStatus.offline + 1
              allDeviceStatus.offline = allDeviceStatus.offline + 1
            }
          })
          ctx.drawPlot(deviceStatus, plantId)
          index++
        })
        deviceStatus = null
        ctx.drawPlot(allDeviceStatus, 'all_machine')
        $('.page-footer #login-time').text(
          $('.page-footer #login-time').text().split('.')[0] +
            '.' +
            $('#all_machine').length +
            $('#all_machine canvas.flot-overlay').length +
            $('#all_machine canvas.flot-base').length
        )
        allDeviceStatus = null
        devicesData = null
        //if (ctx.$loadWidget.find('table td').length % 3 && Object.keys(ctx.plantAreaMachineMap).length > 3) {
        //  _.times(3 - ctx.$loadWidget.find('table td').length % 3, () => {
        //    ctx.$loadWidget.find('table tr:last').append('<td></td>')
        //  })
        //}
      },
      drawPlot: function (deviceStatus, id) {
        var ctx = this
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
                  return (
                    '<div style="text-align:center;padding:4px;color:#444;font-weight:bold;font-size:18px!important;">' +
                    count +
                    '</div>'
                  )
                },
              },
            },
          },
          legend: {
            show: false,
          },
        }
        if (ctx.plotList[id]) {
          ctx.plotList[id].destroy()
        }
        ctx.plotList[id] = $.plot($('#' + id), dataSet, options)
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
