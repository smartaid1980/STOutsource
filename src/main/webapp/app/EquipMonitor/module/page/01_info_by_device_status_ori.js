export default function () {
  ;(function () {
    GoGoAppFun({
      gogo: function (context) {
        pageSetUp()

        var monitorCount = 0

        var currentWorkShiftPowerTime //班次的通電累計
        var currentWorkShiftOperTime //班次的運轉累計
        var currentWorkShiftCutTime //班次的切削累計

        var currentWorkShiftName //班次名稱
        var currentWorkShiftPartCount //班次的partcount

        var theHref = location.href
        var boxId = context.getURLParameter('boxId', theHref)
        var machineId = context.getURLParameter('machineId', theHref)
        var machineName = servkit.getMachineName(machineId)
        var cncBrand = context.getURLParameter('cncBrand', theHref)
        //若不是廠區要返回上一頁，需要帶他屬於哪個app的哪一頁，才有辦法導回去
        var preAppId = context.getURLParameter('preAppId', theHref)
        var prePage = context.getURLParameter('prePage', theHref)

        var deviceStatusLightObj = {}
        context.getDeviceStatusLight(function (data) {
          _.each(data, function (value) {
            deviceStatusLightObj[value.light_id] = value
          })
        })

        /* ip cam */
        context.ipCam(machineId)

        context.$machineIdHead.html(machineId)
        context.$boxId.html(boxId)
        context.$machineId.html(machineId) //機號
        context.$machineName.html(machineName)
        context.$machineController.html(cncBrand) //控制器
        context.getZone(machineId, function (zoneId) {
          context.$machineZone.html(servkit.getPlantAreaName(zoneId))
        })

        context.$leaveBtn.on('click', function (e) {
          //離開頁面要跳回哪一頁的判斷
          e.preventDefault()
          context.leavePage(preAppId, prePage)
        })

        servkit.subscribe('DeviceStatus', {
          machines: [boxId],
          dataModeling: true,
          handler: function (data) {
            //console.log('data: ', data, JSON.stringify(data));
            if (servkit.configUseShiftdata()) {
              //是否使用班次時間去減資料
              monitorCount++
              //console.log(monitorCount);
              if (monitorCount % context.workshiftUpdateFreq == 1) {
                //console.log("--- updateCurShift: ", monitorCount);
                updateCurShift(updateShiftData, machineId)
              }
            }
            _.each(data, function (dataEle) {
              var commands = dataEle.listCommands()
              var notExistKeys = []
              var setting = {
                machineId: machineId,
                dataEle: dataEle,
                commands: commands,
                notExistKeys: notExistKeys,
              }

              //getDbData("m_device_light", ["light_id", "light_name", "color"], machineLightCallback);
              context.setDeviceStatusLight(
                setting,
                'G_CONS()',
                'G_CONS',
                deviceStatusLightObj
              )

              //G_PSUT(): 絕對座標單位
              context.setSingleVal2id(setting, 'G_PSUT()', 'G_PSUT')
              //G_USCP(): 加工元件請求
              context.setSingleVal2id(setting, 'G_USCP()', 'G_USCP')
              //G_PSCP(): 加工元件數量
              context.setSingleVal2id(setting, 'G_PSCP()', 'G_PSCP')
              //G_PRGM(): 程式名稱
              context.setSingleVal2id(setting, 'G_PRGM()', 'G_PRGM')
              //G_SEQN(): 行號
              context.setSingleVal2id(setting, 'G_SEQN()', 'G_SEQN')
              //G_EXEP(): 執行單節
              context.setSingleVal2id(setting, 'G_EXEP()', 'G_EXEP')

              //G_NONG(T): 沒有GXX的Modal code: T
              context.setSingleVal2id(setting, 'G_NONG(T)', 'G_NONG_T')
              //G_NONG(M): 沒有GXX的Modal code: M
              context.setSingleVal2id(setting, 'G_NONG(M)', 'G_NONG_M')
              //G_NONG(F): 沒有GXX的Modal code: F
              context.setSingleVal2id(setting, 'G_NONG(F)', 'G_NONG_F')
              //G_NONG(S): 沒有GXX的Modal code: S
              context.setSingleVal2id(setting, 'G_NONG(S)', 'G_NONG_S')

              //G_POSA(): 絕對座標
              //G_POSM(): 機械座標
              //G_POSR(): 相對座標
              //G_POSD(): 剩餘距離
              context.setCoordinate2id(setting, 'coordinate-table')

              //G_FERP(): 伺服軸進給率百分比
              context.setEasyPieChart(setting, 'G_FERP()', 'G_FERP')
              //G_SPSO(): 主軸轉速百分比
              context.setEasyPieChart(setting, 'G_SPSO()', 'G_SPSO')

              //G_ACTF(): 伺服軸實際進給率
              context.setProgress2id(
                setting,
                'G_ACTF()',
                'G_ACTF',
                context.progressMax
              )
              context.setSingleVal2id(setting, 'G_ACTF()', 'G_ACTF_VAL') //文字部分
              //G_ACTS(): 主軸實際轉速
              context.setProgress2id(
                setting,
                'G_ACTS()',
                'G_ACTS',
                context.progressMax
              )
              context.setSingleVal2id(setting, 'G_ACTS()', 'G_ACTS_VAL') //文字部分

              //G_SRMC(): 伺服軸負載
              //G_SPMS(): 主軸命令轉速
              //G_SPMC(): 主軸負載

              var currentWorkShift = {
                currentWorkShiftPowerTime: currentWorkShiftPowerTime,
                currentWorkShiftOperTime: currentWorkShiftOperTime,
                currentWorkShiftCutTime: currentWorkShiftCutTime,
                currentWorkShiftPartCount: currentWorkShiftPartCount,
              }

              //console.log('currentWorkShift: ', currentWorkShift);
              context.setTimeVal2id(
                setting,
                'G_ELCT()',
                'G_ELCT',
                context.showUnit,
                currentWorkShift
              ) //通電時間
              context.setTimeVal2id(
                setting,
                'G_CUTT()',
                'G_CUTT',
                context.showUnit,
                currentWorkShift
              ) //切削時間
              context.setTimeVal2id(
                setting,
                'G_CYCT()',
                'G_CYCT',
                context.showUnit,
                currentWorkShift
              ) //循環時間
              context.setTimeVal2id(
                setting,
                'G_OPRT()',
                'G_OPRT',
                context.showUnit,
                currentWorkShift
              ) //運轉時間

              context.setCountVal2id(
                setting,
                'G_TOCP()',
                'G_TOCP',
                currentWorkShift
              ) //加工元件總數

              //若Box沒送的話，就會有不存在的參數，列印出來方便除錯
              if (notExistKeys.length > 0) {
                console.warn('find not exist keys: ', notExistKeys)
              }
            })
          },
        })

        //*** 根據班次去減値
        function updateCurShift(callback, machineId) {
          servkit.ajax(
            {
              url: 'api/workshift/now',
              type: 'GET',
              contentType: 'application/json',
            },
            {
              success: function (data) {
                if (data && data['start'] && data['name']) {
                  var startTime = data['start']
                  currentWorkShiftName = data['name']
                  callback(machineId, startTime)
                }
              },
            }
          )
        }

        function updateShiftData(machineId, startTime) {
          //console.log(machineId);
          var todayStr = moment().format('YYYYMMDD')
          //****test start****
          //machineId = "_SBD01M01"
          //todayStr = "20160715"
          //****test end****
          if (currentWorkShiftName) {
            hippo
              .newSimpleExhaler()
              .space('shiftdata_for_monitor')
              .index('machine_id', [machineId])
              .indexRange('date', todayStr, todayStr)
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
                var find = false
                var list = exhalable.exhalable
                _.each(list, function (ele) {
                  var workShift = ele['work_shift']
                  if (workShift == currentWorkShiftName) {
                    currentWorkShiftPowerTime = parseInt(
                      ele['power_millisecond']
                    )
                    currentWorkShiftOperTime = parseInt(ele['oper_millisecond'])
                    currentWorkShiftCutTime = parseInt(ele['cut_millisecond'])

                    currentWorkShiftPartCount = parseInt(ele['partcount'])

                    find = true //有找到
                    return false
                  }
                })

                if (find) {
                  //有找到hippo班次的值
                  $('.workshift-name').html(
                    ' ( Workshift: ' + currentWorkShiftName + ')'
                  )
                  $('.workshift-part-count').html(
                    ' ( Start: ' + currentWorkShiftPartCount + ')'
                  )
                } else {
                  $('.workshift-name').html('')
                  $('.workshift-part-count').html('')
                }
              })
          }
        }
      },
      util: {
        showUnit: 'hour', //時間轉換最大單位
        workshiftUpdateFreq: 600,
        progressMax: 12000,

        $leaveBtn: $('#leave-btn'),
        $machineIdHead: $('#machine-id-head'),
        $boxId: $('#box-id'),
        $machineId: $('#machine-id'),
        $machineName: $('#machine-name'),
        $machineController: $('#machine-controller'),
        $machineZone: $('#machine-zone'),

        ipCam: function (machineId) {
          // Jenny der ip cam
          $('#main').removeClass('margin-right')
          var $body = $body
          servkit.ajax(
            {
              url: 'api/ipCam/query',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                device_id: machineId,
              }),
            },
            {
              success: function (data) {
                if (!_.isEmpty(data)) {
                  servkit.ipCamDrawer().attach(data.ip)
                }
              },
            }
          )
        },

        leavePage: function (preAppId, prePage) {
          //返回上一頁
          var lang = servkit.getCookie('lang')
          var monitorHomePage =
            '#app/EquipMonitor/function/' + lang + '/02_plant_area_monitor.html'
          console.log(preAppId, prePage, preAppId != 'null', preAppId != null)
          if (preAppId != null && prePage != null) {
            if (preAppId != 'null' && prePage != 'null') {
              monitorHomePage =
                '#app/' +
                preAppId +
                '/function/' +
                lang +
                '/' +
                prePage +
                '.html'
            }
          }
          console.log('monitorHomePage: ' + monitorHomePage)
          window.location.href = monitorHomePage
        },
        getDeviceStatusLight: function (callback) {
          //取得燈號顏色
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
              success: function (data) {
                callback(data)
              },
            }
          )
        },
        setDeviceStatusLight: function (
          setting,
          gCodeKey,
          htmlId,
          deviceStatusLightObj
        ) {
          //更新燈號
          this.getDeviceStatusVal(setting, gCodeKey, function (valueMatrix) {
            //console.log(gCodeKey + ':', value, htmlId);
            if (valueMatrix[0] && valueMatrix[0][0]) {
              var val = valueMatrix[0][0]
              if (!_.isEmpty(deviceStatusLightObj)) {
                console.log('deviceStatusLightObj: ', deviceStatusLightObj)
                if (deviceStatusLightObj[val]) {
                  $('#' + htmlId).attr(
                    'style',
                    'background: ' + deviceStatusLightObj[val].color
                  )
                } else {
                  console.warn('not default this light: ', val)
                }
              }
            }
          })
        },
        getDeviceStatusVals: function (setting, gCodeKeys, callback) {
          //使用keys取deviceStatus內的資料
          var machineId = setting.machineId
          var dataEle = setting.dataEle
          var commands = setting.commands
          var result = {}
          _.each(gCodeKeys, function (gCodeKey) {
            if (_.contains(commands, gCodeKey)) {
              result[gCodeKey] = dataEle.getValue(gCodeKey, machineId)
            } else {
              setting.notExistKeys.push(gCodeKey)
            }
          })
          callback(result)
        },
        getDeviceStatusVal: function (setting, gCodeKey, callback) {
          //使用key取deviceStatus內的資料
          this.getDeviceStatusVals(setting, [gCodeKey], function (result) {
            callback(result[gCodeKey])
          })
        },
        setSingleVal2id: function (setting, gCodeKey, htmlId) {
          //更新id上的值
          this.getDeviceStatusVal(setting, gCodeKey, function (valueMatrix) {
            //console.log(gCodeKey + ':', value, htmlId);
            var val
            if (valueMatrix && valueMatrix[0] && valueMatrix[0][0]) {
              val = valueMatrix[0][0]
            } else {
              val = 'N/A'
            }
            $('#' + htmlId).html(val)
          })
        },
        setTimeVal2id: function (
          setting,
          gCodeKey,
          htmlId,
          showUnit,
          currentWorkShift
        ) {
          //更新id上的值(時間)
          var that = this
          this.getDeviceStatusVal(setting, gCodeKey, function (valueMatrix) {
            //console.log(gCodeKey + ':', valueMatrix, htmlId);
            var val
            if (valueMatrix && valueMatrix[0] && valueMatrix[0][0]) {
              var code = gCodeKey.replace('()', '')
              val = that.convertTime(
                parseInt(valueMatrix[0][0]),
                {
                  showUnit: showUnit,
                  code: code,
                },
                currentWorkShift
              )
            } else {
              val = 'N/A'
            }
            $('#' + htmlId).html(val)
          })
        },
        setCountVal2id: function (setting, gCodeKey, htmlId, currentWorkShift) {
          //更新id上的值(part count專用)
          var that = this
          this.getDeviceStatusVal(setting, gCodeKey, function (valueMatrix) {
            //console.log(gCodeKey + ':', valueMatrix, htmlId);
            var val
            if (valueMatrix && valueMatrix[0] && valueMatrix[0][0]) {
              var code = gCodeKey.replace('()', '')
              val = that.convertPartCount(
                parseInt(valueMatrix[0][0]),
                currentWorkShift
              )
            } else {
              val = 'N/A'
            }
            $('#' + htmlId).html(val)
          })
        },
        setEasyPieChart: function (setting, gCodeKey, htmlId) {
          //更新id上easy pie chart的值
          this.getDeviceStatusVal(setting, gCodeKey, function (valueMatrix) {
            //console.log(gCodeKey + ':', htmlId, valueMatrix);
            if (valueMatrix && valueMatrix[0] && valueMatrix[0][0]) {
              var val = valueMatrix[0][0]
              $('#' + htmlId)
                .data('easyPieChart')
                .update(val)
            }
          })
        },
        setProgress2id: function (setting, gCodeKey, htmlId, progressMax) {
          //更新id上progress的值(progressMax: 進度條最大値)
          this.getDeviceStatusVal(setting, gCodeKey, function (valueMatrix) {
            //console.log(gCodeKey + ':', htmlId, valueMatrix);
            if (valueMatrix && valueMatrix[0] && valueMatrix[0][0]) {
              var val = valueMatrix[0][0]
              if (_.isNumber(parseInt(val))) {
                var intVal = parseInt(val)
                var pct
                if (intVal > 0) {
                  pct = (intVal / progressMax) * 100
                } else {
                  pct = 0
                }
                //pct = _.random(0, 100);
                $('#' + htmlId).attr('style', 'width: ' + pct + '%')
              }
            }
          })
        },
        setCoordinate2id(setting, htmlId) {
          //
          //G_SRNE():有哪些軸
          //G_POSA(): 絕對座標
          //G_POSM(): 機械座標
          //G_POSR(): 相對座標
          //G_POSD(): 剩餘距離
          var defaultRowSize = 2
          var that = this
          this.getDeviceStatusVals(
            setting,
            ['G_SRNE()', 'G_POSA()', 'G_POSM()', 'G_POSR()', 'G_POSD()'],
            function (result) {
              //console.log("*** :", result, JSON.stringify(result));
              var tableHtml =
                '<tr><td></td><td class="head">絕對</td><td class="head">機械</td><td class="head">相對</td><td class="head">距離</td></tr>'
              if (result['G_SRNE()'] && result['G_SRNE()'][0]) {
                var gSrneArr = that.string2Arr(result['G_SRNE()'][0][0])
                var gSrneSize = gSrneArr.length

                var gPosaArr = that.string2Arr(result['G_POSA()'][0][0])
                var gPosmArr = that.string2Arr(result['G_POSM()'][0][0])
                var gPosrArr = that.string2Arr(result['G_POSR()'][0][0])
                var gPosdArr = that.string2Arr(result['G_POSD()'][0][0])

                for (var index = 0; index < gSrneSize; index++) {
                  tableHtml =
                    tableHtml +
                    '<tr><td class="head">' +
                    gSrneArr[index] +
                    '<td class="value text-center">' +
                    gPosaArr[index] +
                    '</td>' +
                    '<td class="value text-center">' +
                    gPosmArr[index] +
                    '</td>' +
                    '<td class="value text-center">' +
                    gPosrArr[index] +
                    '</td>' +
                    '<td class="value text-center">' +
                    gPosdArr[index] +
                    '</td></tr>'
                }
                if (gSrneSize < defaultRowSize) {
                  for (var count = gSrneSize; count < defaultRowSize; count++) {
                    tableHtml =
                      tableHtml +
                      '<tr><td class="head">---</td><td class="value text-center">---</td><td class="value text-center">---</td><td class="value text-center">---</td><td class="value text-center">---</td></tr>'
                  }
                }
              } else {
                //沒有就使用空的table
                for (var count2 = 0; count2 < defaultRowSize; count2++) {
                  tableHtml =
                    tableHtml +
                    '<tr><td class="head">---</td><td class="value text-center">---</td><td class="value text-center">---</td><td class="value text-center">---</td><td class="value text-center">---</td></tr>'
                }
              }
              $('#' + htmlId).html(tableHtml)
            }
          )
        },
        string2Arr: function (str) {
          //因為Sam送過來的不是正規的json，所以要自己parse
          if (str) {
            return str.replace('[', '').replace(']', '').split(',')
          } else {
            console.warn(str, ' can not to arr...')
            return []
          }
        },
        getZone: function (machineId, callback) {
          servkit.ajax(
            {
              //取廠區
              url: 'api/getdata/db',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                table: 'm_plant_area',
                columns: ['device_id', 'plant_id'],
                whereClause: 'device_id = ?',
                whereParams: [machineId],
              }),
            },
            {
              success: function (data) {
                if (data[0]) {
                  //YA~有資料
                  callback(data[0]['plant_id']) //廠區
                } else {
                  callback('') //沒有值QQ
                }
              },
              fail: function (data) {
                console.warn('get MachineType fail:', data)
              },
            }
          )
        },
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
        convertTime: function (value, params, currentWorkShift) {
          //value是milliSecond
          //不是數值就使用 --
          if (!_.isNumber(value)) {
            switch (params.showUnit) {
              case 'day':
                t = '-- D -- H -- M -- S '
                break
              case 'hour':
                t = '-- H -- M -- S '
                break
              case 'min':
                t = '-- M -- S '
                break
              case 'second':
                t = '-- S '
                break
              default:
                console.warn('目前尚未定義此種 showUnit = ' + params.showUnit)
            }
            return t
          }
          //根據code去減 (*** 但是需要configUseShiftdata開關有開啟)
          if (servkit.configUseShiftdata() && params['code']) {
            switch (params['code']) {
              case 'G_ELCT': //班次的通電累計
                if (currentWorkShift.currentWorkShiftPowerTime) {
                  var diff = value - currentWorkShift.currentWorkShiftPowerTime
                  if (diff > 0) {
                    value = diff
                  } else {
                    value = 0
                  }
                  //console.log("currentWorkShiftPowerTime: ", currentWorkShiftPowerTime, value);
                } else {
                  //沒班次時間就預設0
                  value = 0
                }
                break
              case 'G_OPRT': //班次的運轉累計
                if (currentWorkShift.currentWorkShiftOperTime) {
                  var diff2 = value - currentWorkShift.currentWorkShiftOperTime
                  if (diff2 > 0) {
                    value = diff2
                  } else {
                    value = 0
                  }
                  //console.log("currentWorkShiftOperTime: ", currentWorkShiftOperTime, value);
                } else {
                  //沒班次時間就預設0
                  value = 0
                }
                break
              case 'G_CUTT': //班次的切削累計
                if (currentWorkShift.currentWorkShiftCutTime) {
                  var diff3 = value - currentWorkShift.currentWorkShiftCutTime
                  if (diff3 > 0) {
                    value = diff3
                  } else {
                    value = 0
                  }
                  //console.log("currentWorkShiftCutTime: ", currentWorkShiftCutTime, value);
                } else {
                  //沒班次時間就預設0
                  value = 0
                }
                break
              default:
              //不處理
            }
          }

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

          if (params.showUnit) {
            var t = ''
            switch (params.showUnit) {
              case 'day':
                t =
                  day +
                  ' D ' +
                  hourTemp +
                  ' H ' +
                  minTemp +
                  ' M ' +
                  secondTemp +
                  ' S '
                break
              case 'hour':
                t = hour + ' H ' + minTemp + ' M ' + secondTemp + ' S '
                break
              case 'min':
                t = min + ' M ' + secondTemp + ' S '
                break
              case 'second':
                t = second + ' S '
                break
              default:
                console.warn('目前尚未定義此種 showUnit = ' + params.showUnit)
            }
          } else {
            t = day + 'D' + hourTemp + 'H' + minTemp + 'M' + secondTemp + 'S'
          }
          return t
        },
        convertPartCount: function (value, currentWorkShift) {
          //不是數值就使用 --
          if (!_.isNumber(value)) {
            return '--'
          }
          //console.log("*****: ", value);
          if (currentWorkShift.currentWorkShiftPartCount) {
            var diff = value - currentWorkShift.currentWorkShiftPartCount
            if (diff > 0) {
              value = diff
            } else {
              value = 0
            }
          }
          return value
        },
      },
      delayCondition: ['machineList'],
      dependencies: [
        ['/js/plugin/imagesLoaded/imagesloaded.pkgd.min.js'],
        ['/js/plugin/d3/d3.min.js', '/js/plugin/jqBullet/bullet.js'],
      ],
    })
  })()
}
