import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      pageSetUp()
      //最高溫度 (當分母)
      var _MAX_TEMPERATURE = 250

      var allBox = []
      var machineBrandMap = {}
      var lightMap = {}
      var machineIdMap = {}

      var theHref = location.href
      var CURRENT_BOX_ID = context.getURLParameter('boxId', theHref)
      var CURRENT_MACHINE_ID = context.getURLParameter('machineId', theHref)
      var CURRENT_CNC_BRAND = context.getURLParameter('cncBrand', theHref)

      $('#boxId').text(CURRENT_BOX_ID)
      $('#machineIdHead').text(servkit.getMachineName(CURRENT_MACHINE_ID))
      $('#machineId').text(CURRENT_MACHINE_ID)
      $('#machineName').text(servkit.getMachineName(CURRENT_MACHINE_ID))

      var lang = servkit.getCookie('lang')
      var locationParams =
        '?boxId=' +
        CURRENT_BOX_ID +
        '&machineId=' +
        CURRENT_MACHINE_ID +
        '&cncBrand=' +
        CURRENT_CNC_BRAND +
        '&preAppId=EquipMonitor&prePage=02_plant_area_monitor_cho'

      $('#leave').on('click', function () {
        window.location =
          '#app/EquipMonitor/function/' +
          lang +
          '/02_plant_area_monitor_cho.html' +
          locationParams
      })

      readData()

      function readData() {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'm_device_box',
              columns: ['device_id', 'box_id'],
            }),
          },
          {
            success: function (data) {
              var matrix = []
              _.each(data, function (ele) {
                console.log(ele)
              })
              updateStatus()
            },
            fail: function (data) {
              context.commons.smallBox({
                selectColor: 'red',
                title: 'Query失敗',
                icon: 'fa fa-sign-out',
                timeout: 2000,
              })
            },
          }
        )
      }

      function updateStatus() {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'm_box',
              columns: ['box_id'],
            }),
          },
          {
            success: function (boxIds) {
              servkit.ajax(
                {
                  url: 'api/getdata/db',
                  type: 'POST',
                  contentType: 'application/json',
                  data: JSON.stringify({
                    table: 'm_device_cnc_brand',
                    columns: ['device_id', 'cnc_id'],
                  }),
                },
                {
                  success: function (brandIds) {
                    servkit.ajax(
                      {
                        url: 'api/getdata/db',
                        type: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify({
                          table: 'm_device_light',
                          columns: ['light_id', 'light_name', 'color'],
                        }),
                      },
                      {
                        success: function (lights) {
                          var machineLigthDec = `<span>${i18n(
                            'Light_Status'
                          )}:</span>&nbsp;`
                          //console.log("boxIds: ", boxIds, " brandIds: ", brandIds);
                          _.each(boxIds, function (ele) {
                            allBox.push(ele['box_id'])
                          })
                          _.each(brandIds, function (ele) {
                            machineBrandMap[ele['device_id']] = ele['cnc_id']
                          })
                          _.each(lights, function (ele) {
                            lightMap[ele['light_id']] = ele['color']
                            machineLigthDec =
                              machineLigthDec +
                              '<span class="btn" style="background:' +
                              ele['color'] +
                              ';"></span>&nbsp;<span>' +
                              ele['light_name'] +
                              '</span>&nbsp;&nbsp;&nbsp;&nbsp;'
                          })
                          $('#machineLigth').html(machineLigthDec)
                          //console.log("allBox: ", allBox, machineBrandMap);
                          servkit.subscribe('DeviceStatus', {
                            machines: allBox,
                            dataModeling: true,
                            handler: function (data) {
                              _.each(data, function (dataEle) {
                                // 狀態
                                dataEle.eachMachine('G_CONS()', function (
                                  multisystem,
                                  machineId
                                ) {
                                  //console.log(multisystem, machineId);
                                  if (CURRENT_MACHINE_ID == machineId) {
                                    var singleSystem = multisystem[0]
                                    //$("#" + machineId + "-light").attr("style", "background:" + lightMap[singleSystem[0]]);
                                    gCons(singleSystem)
                                  }
                                })
                                //警報
                                dataEle.eachMachine('G_ALAM()', function (
                                  multisystem,
                                  machineId
                                ) {
                                  if (CURRENT_MACHINE_ID == machineId) {
                                    var singleSystem = multisystem[0]
                                  }
                                })
                                //當日產量
                                dataEle.eachMachine('G_PSCP()', function (
                                  multisystem,
                                  machineId
                                ) {
                                  if (CURRENT_MACHINE_ID == machineId) {
                                    var singleSystem = multisystem[0]
                                    $('#G_PSCP').html(singleSystem)
                                  }
                                })
                                //上熱盤實際溫度
                                dataEle.eachMachine('G_UPAT()', function (
                                  multisystem,
                                  machineId
                                ) {
                                  if (CURRENT_MACHINE_ID == machineId) {
                                    var singleSystem = multisystem[0]
                                    //singleSystem = _.random(130, 180);
                                    var value = parseFloat(singleSystem)
                                    var pct = 0
                                    if (_.isFinite(value)) {
                                      pct = parseInt(
                                        (value / _MAX_TEMPERATURE) * 100
                                      )
                                      $('#G_UPAT-bar').html(parseInt(value))
                                    } else {
                                      $('#G_UPAT-bar').html('0')
                                    }
                                    $('#G_UPAT-bar').attr(
                                      'style',
                                      'height:' + (pct + 10) + '%'
                                    )
                                    $('#G_UPAT').html(singleSystem)
                                  }
                                })
                                //上熱盤設定溫度
                                dataEle.eachMachine('G_UPST()', function (
                                  multisystem,
                                  machineId
                                ) {
                                  if (CURRENT_MACHINE_ID == machineId) {
                                    var singleSystem = multisystem[0]
                                    var value = parseFloat(singleSystem)
                                    var pct = 0
                                    if (_.isFinite(value)) {
                                      pct = parseInt(
                                        (value / _MAX_TEMPERATURE) * 100
                                      )
                                      $('#G_UPST-bar').html(parseInt(value))
                                    } else {
                                      $('#G_UPST-bar').html('0')
                                    }
                                    $('#G_UPST-bar').attr(
                                      'style',
                                      'height:' + (pct + 10) + '%'
                                    )
                                    $('#G_UPST').html(singleSystem)
                                  }
                                })
                                //下熱盤實際溫度
                                dataEle.eachMachine('G_LPAT()', function (
                                  multisystem,
                                  machineId
                                ) {
                                  if (CURRENT_MACHINE_ID == machineId) {
                                    var singleSystem = multisystem[0]
                                    var value = parseFloat(singleSystem)
                                    var pct = 0
                                    if (_.isFinite(value)) {
                                      pct = parseInt(
                                        (value / _MAX_TEMPERATURE) * 100
                                      )
                                      $('#G_LPAT-bar').html(parseInt(value))
                                    } else {
                                      $('#G_LPAT-bar').html('0')
                                    }
                                    $('#G_LPAT-bar').attr(
                                      'style',
                                      'height:' + (pct + 10) + '%'
                                    )
                                    $('#G_LPAT').html(singleSystem)
                                  }
                                })
                                //下熱盤設定溫度
                                dataEle.eachMachine('G_LPST()', function (
                                  multisystem,
                                  machineId
                                ) {
                                  if (CURRENT_MACHINE_ID == machineId) {
                                    var singleSystem = multisystem[0]
                                    var value = parseFloat(singleSystem)
                                    var pct = 0
                                    if (_.isFinite(value)) {
                                      pct = parseInt(
                                        (value / _MAX_TEMPERATURE) * 100
                                      )
                                      $('#G_LPST-bar').html(parseInt(value))
                                    } else {
                                      $('#G_LPST-bar').html('0')
                                    }
                                    $('#G_LPST-bar').attr(
                                      'style',
                                      'height:' + (pct + 10) + '%'
                                    )
                                    $('#G_LPST').html(singleSystem)
                                  }
                                })
                                //主機壓力(實際)
                                dataEle.eachMachine('G_ACTP()', function (
                                  multisystem,
                                  machineId
                                ) {
                                  if (CURRENT_MACHINE_ID == machineId) {
                                    var singleSystem = multisystem[0]
                                    $('#G_ACTP').html(singleSystem)
                                  }
                                })
                                //一次排氣壓力
                                dataEle.eachMachine('G_FEXP()', function (
                                  multisystem,
                                  machineId
                                ) {
                                  if (CURRENT_MACHINE_ID == machineId) {
                                    var singleSystem = multisystem[0]
                                    $('#G_FEXP').html(singleSystem)
                                  }
                                })
                                //一次加硫壓力
                                dataEle.eachMachine('G_FASP()', function (
                                  multisystem,
                                  machineId
                                ) {
                                  if (CURRENT_MACHINE_ID == machineId) {
                                    var singleSystem = multisystem[0]
                                    $('#G_FASP').html(singleSystem)
                                  }
                                })
                                //一次加硫實際時間
                                dataEle.eachMachine('G_FSAT()', function (
                                  multisystem,
                                  machineId
                                ) {
                                  if (CURRENT_MACHINE_ID == machineId) {
                                    var singleSystem = multisystem[0]
                                    $('#G_FSAT').html(
                                      toTimeFormat(singleSystem)
                                    )
                                  }
                                })
                                //一次加硫設定時間
                                dataEle.eachMachine('G_FSST()', function (
                                  multisystem,
                                  machineId
                                ) {
                                  if (CURRENT_MACHINE_ID == machineId) {
                                    var singleSystem = multisystem[0]
                                    $('#G_FSST').html(
                                      toTimeFormat(singleSystem)
                                    )
                                  }
                                })

                                // Fill all progress bars with animation
                                //$('.progress-bar').progressbar({display_text : 'fill'});
                              })
                            },
                          })
                        },
                        fail: function (data) {
                          context.commons.smallBox({
                            selectColor: 'red',
                            title: 'Query machine light fail...',
                            icon: 'fa fa-sign-out',
                            timeout: 2000,
                          })
                        },
                      }
                    )
                  },
                  fail: function (data) {
                    context.commons.smallBox({
                      selectColor: 'red',
                      title: 'Query cnc brand fail...',
                      icon: 'fa fa-sign-out',
                      timeout: 2000,
                    })
                  },
                }
              )
            },
            fail: function (data) {
              context.commons.smallBox({
                selectColor: 'red',
                title: 'Query boxId fail...',
                icon: 'fa fa-sign-out',
                timeout: 2000,
              })
            },
          }
        )
      }

      //變更機台狀態燈號
      function gCons(status) {
        if (status == 'B') {
          status = '0'
        }
        //"light_id", "color"
        var color = lightMap[status]
        if (color != undefined) {
          $('#G_CONS').attr('style', 'background:' + color)
          //$machineLightName.html(" " + lightNameMap[status]);
        } else {
          $('#G_CONS').attr('style', 'background:#f3f3f3')
          //$machineLightName.html(" ---");
        }
      }

      function toTimeFormat(sec) {
        var second = parseInt(sec)
        //console.log("second: ", second);
        if (!_.isFinite(second)) {
          return '-- H -- M -- S '
        }

        //因為月不準..所以只算到日
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
        return hour + ' H ' + minTemp + ' M ' + secondTemp + ' S '
      }
    },
    util: {
      getURLParameter: function (name, url) {
        //location.href
        return (
          decodeURIComponent(
            (new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(
              url
            ) || [null, ''])[1].replace(/\+/g, '%20')
          ) || null
        )
      },
    },
    delayCondition: ['machineList'],
    dependencies: [
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
      [
        '/js/plugin/jquery-validate/jquery.validate.min.js',
        '/js/plugin/masked-input/jquery.maskedinput.min.js',
        '/js/plugin/bootstrap-progressbar/bootstrap-progressbar.min.js',
      ],
    ],
  })
}
