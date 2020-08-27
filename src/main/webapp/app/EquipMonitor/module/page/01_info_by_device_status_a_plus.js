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
        //context.ipCam(machineId);

        context.$machineIdHead.html(servkit.getMachineName(machineId))
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

        //讀取參數檔
        context.getAPlusMachineParamFile(machineId, function (csv) {
          /*csv = [
            ["index", "id", "name", "desc", "position", "type", "color", "max", "zh_tw", "en", "zh"],
            [1, "aaa", "aaa", "aaa", 1, "line_chart", "---", 200, "文字", "word", "文字"],
            [2, "bbb", "bbb", "bbb", 2, "progress", "black", 100, "文字", "word", "文字"],
            [3, "bbb", "bbb", "bbb", 3, "progress", "blue", 100, "文字", "word", "文字"],
            [4, "bbb", "bbb", "bbb", 4, "progress", "blue", 100, "文字", "word", "文字"],
            [5, "bbb", "bbb", "bbb", 5, "progress", "green", 100, "文字", "word", "文字"],
            [6, "ccc", "ccc", "ccc", 6, "pie_chart", "brown", 100, "文字", "word", "文字"],
            [7, "ccc", "ccc", "ccc", 7, "pie_chart", "green", 100, "文字", "word", "文字"],
            [8, "ccc", "ccc", "ccc", 8, "pie_chart", "blue", 100, "文字", "word", "文字"],
            [9, "ccc", "ccc", "ccc", 9, "pie_chart", "black", 100, "文字", "word", "文字"],
            [10, "ddd", "ddd", "ddd", 0, "text", "---", 0, "文字", "word", "文字"],
            [11, "ddd", "ddd", "ddd", 0, "text", "---", 0, "文字", "word", "文字"],
            [12, "ddd", "ddd", "ddd", 0, "text", "---", 0, "文字", "word", "文字"],
            [13, "ddd", "ddd", "ddd", 0, "text", "---", 0, "文字", "word", "文字"],
            [14, "ddd", "ddd", "ddd", 0, "progress", "red", 100, "文字", "word", "文字"],
            [15, "ddd", "ddd", "ddd", 0, "progress", "green", 100, "文字", "word", "文字"],
            [16, "ddd", "ddd", "ddd", 0, "progress", "black", 100, "文字", "word", "文字"],
            [17, "ddd", "ddd", "ddd", 0, "progress", "blue", 100, "文字", "word", "文字"],
            [18, "ddd", "ddd", "ddd", 0, "pie_chart", "black", 100, "文字", "word", "文字"],
            [19, "ddd", "ddd", "ddd", 0, "pie_chart", "red", 100, "文字", "word", "文字"],
            [20, "ddd", "ddd", "ddd", 0, "pie_chart", "green", 100, "文字", "word", "文字"],
            [21, "ddd", "ddd", "ddd", 0, "pie_chart", "black", 100, "文字", "word", "文字"],
            [22, "ddd", "ddd", "ddd", 0, "pie_chart", "blue", 100, "文字", "word", "文字"],
            [23, "ddd", "ddd", "ddd", 0, "switch", "blue", 100, "文字", "word", "文字"],
          ];*/
          var lang = context.getCookie('lang')
          var params = []
          for (var rowIndex = 1; rowIndex < csv.length; rowIndex++) {
            var param = {}
            for (var colIndex = 0; colIndex < csv[0].length; colIndex++) {
              param[csv[0][colIndex]] = csv[rowIndex][colIndex]
            }
            param['currentI18n'] = lang
            params.push(param)
          }

          _.each(params, function (param) {
            switch (parseInt(param['position'])) {
              case 2:
                $('#link-chart2').attr('data', machineId + ';;' + param.index)
                break
              case 3:
                $('#link-chart3').attr('data', machineId + ';;' + param.index)
                break
              case 4:
                $('#link-chart4').attr('data', machineId + ';;' + param.index)
                break
              case 5:
                $('#link-chart5').attr('data', machineId + ';;' + param.index)
                break
              case 6:
                $('#link-chart6').attr('data', machineId + ';;' + param.index)
                break
              case 7:
                $('#link-chart7').attr('data', machineId + ';;' + param.index)
                break
              case 8:
                $('#link-chart8').attr('data', machineId + ';;' + param.index)
                break
              case 9:
                $('#link-chart9').attr('data', machineId + ';;' + param.index)
                break
              default:
            }
          })

          //console.log("***** ", params);

          var chartDatas = []
          var otherSize = 0
          servkit.subscribe('DeviceStatus', {
            machines: [boxId],
            dataModeling: true,
            handler: function (data) {
              //console.log('data: ', data, JSON.stringify(data));
              _.each(data, function (dataEle) {
                var commands = dataEle.listCommands()
                var notExistKeys = []
                //var setting = {machineId: machineId, dataEle: dataEle, commands: commands, notExistKeys: notExistKeys};
                var setting = {
                  machineId: machineId,
                  dataEle: dataEle,
                  commands: commands,
                  notExistKeys: notExistKeys,
                }

                //console.log("setting: ", setting);

                //更新機台狀態
                context.getDeviceStatusVal(setting, 'G_CONS()', function (
                  valueMatrix
                ) {
                  if (valueMatrix && valueMatrix[0] && valueMatrix[0][0]) {
                    var val = valueMatrix[0][0]
                    //val = _.random(11, 14).toString();
                    var $id = $('#status')
                    var css = ''
                    if (val === '11') {
                      css = 'bg-color-greenLight'
                    } else if (val === '12') {
                      css = 'bg-color-orange'
                    } else if (val === '13') {
                      css = 'bg-color-red'
                    }
                    $id.attr('class', 'badge ' + css)
                  }
                })

                var pmcDatas = context.getGPmct(setting)
                //console.log(gPmctArr);

                var other = []
                _.each(params, function (param) {
                  switch (parseInt(param['position'])) {
                    case 1:
                      context.updateLineChartData(
                        'param1',
                        chartDatas,
                        param,
                        pmcDatas
                      )
                      break
                    case 2:
                      context.updateProgress('param2', param, pmcDatas)
                      break
                    case 3:
                      context.updateProgress('param3', param, pmcDatas)
                      break
                    case 4:
                      context.updateProgress('param4', param, pmcDatas)
                      break
                    case 5:
                      context.updateProgress('param5', param, pmcDatas)
                      break
                    case 6:
                      context.updatePieChart('param6', param, pmcDatas)
                      break
                    case 7:
                      context.updatePieChart('param7', param, pmcDatas)
                      break
                    case 8:
                      context.updatePieChart('param8', param, pmcDatas)
                      break
                    case 9:
                      context.updatePieChart('param9', param, pmcDatas)
                      break
                    case 0:
                      other.push(param)
                      break
                    default:
                  }
                })

                //console.log("***** size: ", other.length);
                var remaining = other.length % 4
                if (remaining > 0) {
                  //一列四欄補齊
                  remaining = 4 - remaining
                }

                var otherColsHtml = ''
                if (otherSize !== other.length) {
                  for (
                    var index = 0;
                    index < other.length + remaining;
                    index++
                  ) {
                    var param = other[index]
                    if (param) {
                      otherColsHtml =
                        otherColsHtml +
                        '<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 show-stats">' +
                        '<a href="javascript: void(0)" class="fa fa-bar-chart-o pull-right" data="' +
                        machineId +
                        ';;' +
                        param.index +
                        '"></a>' +
                        '<div id="other' +
                        index +
                        '"></div>' +
                        '</div>'
                    } else {
                      otherColsHtml =
                        otherColsHtml +
                        '<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 show-stats">' +
                        '<div id="other' +
                        index +
                        '"></div>' +
                        '</div>'
                    }
                  }
                  $('#other').html(otherColsHtml)
                  otherSize = other.length

                  $('a.pull-right')
                    .off('click')
                    .on('click', function () {
                      var param = $(this).attr('data').split(';;')
                      var machineId = param[0]
                      var dataIndex = param[1]
                      context.gogoAnother({
                        appId: 'APlusLineChart',
                        funId: '01_realtime_line_chart_base',
                        currentTab: false,
                        graceParam: {
                          machineId: machineId,
                          index: dataIndex,
                        },
                      })
                    })
                }

                for (var index2 = 0; index2 < other.length; index2++) {
                  var type = other[index2].type
                  if (type === 'progress') {
                    context.updateProgress(
                      'other' + index2,
                      other[index2],
                      pmcDatas
                    )
                  } else if (type === 'pie_chart') {
                    context.updatePieChart(
                      'other' + index2,
                      other[index2],
                      pmcDatas
                    )
                  } else if (type === 'text') {
                    context.updateText(
                      'other' + index2,
                      other[index2],
                      pmcDatas
                    )
                  } else if (type === 'switch') {
                    context.updateSwitch(
                      'other' + index2,
                      other[index2],
                      pmcDatas
                    )
                  }
                }
              })
            },
          })
        })
      },
      util: {
        $leaveBtn: $('#leave-btn'),
        $machineIdHead: $('#machine-id-head'),
        $boxId: $('#box-id'),
        $machineId: $('#machine-id'),
        $machineName: $('#machine-name'),
        $machineController: $('#machine-controller'),
        $machineZone: $('#machine-zone'),

        colors: {
          green: 'greenLight',
          blue: 'blue',
          black: 'blueDark',
          brown: 'orangeDark',
          red: 'red',
        },

        updateLineChartData: function (chartId, chartDatas, param, datas) {
          var currentVal = datas[param.index]
          var title = param[param.currentI18n]
          // setup plot
          var options = {
            yaxis: {
              //min: param.min,
              //max: param.max
            },
            xaxis: {
              mode: 'time',
              timezone: 'browser',
              timeformat: '%H:%M:%S',
            },
            colors: ['#57889C'],
            series: {
              lines: {
                lineWidth: 1,
                fill: true,
                fillColor: {
                  colors: [
                    {
                      opacity: 0.4,
                    },
                    {
                      opacity: 0,
                    },
                  ],
                },
                steps: false,
              },
            },
          }

          if (chartDatas.length >= 100) {
            chartDatas.shift()
          }
          chartDatas.push([new Date().getTime(), currentVal])
          //console.log("+++ ", chartDatas.length);
          $.plot($('#' + chartId), [chartDatas], options)
          $('#' + chartId + '-title').text(title)
        },

        updateProgress: function (progressId, param, datas) {
          var currentVal = datas[param.index]
          var percent = parseFloat((currentVal / param.max) * 100).toFixed(1)
          var title = param[param.currentI18n]
          var color = this.colors[param.color]
          var $id = $('#' + progressId)

          if (_.isUndefined(currentVal)) {
            currentVal = '---'
          }

          if ($id.children().length === 0) {
            var html =
              '<div class="col-xs-6 col-sm-6 col-md-12 col-lg-12">' +
              '<span class="text"> ' +
              title +
              ' <span class="pull-right">' +
              currentVal +
              '/' +
              param.max +
              '</span> </span>' +
              '<div class="progress">' +
              '<div class="progress-bar bg-color-' +
              color +
              '" style="width: ' +
              percent +
              '%;"></div>' +
              '</div>' +
              '</div>'
            $id.html(html)
          } else {
            $id
              .find('span.text')
              .html(
                title +
                  ' <span class="pull-right">' +
                  currentVal +
                  '/' +
                  param.max +
                  '<span>'
              )
            $id
              .find('div.progress-bar')
              .attr('style', 'width: ' + percent + '%;')
          }
        },

        updatePieChart: function (pieChartId, param, datas) {
          var currentVal = datas[param.index]
          var percent = parseFloat((currentVal / param.max) * 100).toFixed(1)
          var title = param[param.currentI18n]
          var color = this.colors[param.color]
          var $id = $('#' + pieChartId)

          if (percent === 'NaN') {
            percent = 0
          }

          if ($id.children().length === 0) {
            var html =
              '<div class="easy-pie-chart txt-color-' +
              color +
              '" data-percent="' +
              percent +
              '" data-pie-size="50">' +
              '<span class="percent percent-sign">' +
              percent +
              '</span>' +
              '</div>' +
              '<span class="easy-pie-title"> ' +
              title +
              ' </span>'
            $id.html(html)
            pageSetUp()
          } else {
            if (_.isUndefined(currentVal)) {
              $($id.children()[0]).data('easyPieChart').update(0)
            } else {
              $($id.children()[0]).data('easyPieChart').update(percent)
            }
          }
          $($id.children()[1]).text(title)
        },

        updateText: function (textId, param, datas) {
          var currentVal = datas[param.index]
          var title = param[param.currentI18n]
          var $id = $('#' + textId)
          if (_.isUndefined(currentVal)) {
            currentVal = '---'
          }
          if ($id.children().length === 0) {
            var html =
              '<span style="font-size:14px;">' +
              title +
              '</span><br/>' +
              '<span style="font-size:16px; color:green;">' +
              currentVal +
              '</span>'
            $id.html(html)
          } else {
            $($id.children()[2]).text(currentVal)
          }
        },

        updateSwitch: function (switchId, param, datas) {
          var currentVal = datas[param.index]
          var title = param[param.currentI18n]
          var $id = $('#' + switchId)
          var css = ''
          var color = this.colors[param.color]
          //currentVal = _.random(0, 1);
          if (parseInt(currentVal) !== 0) {
            css = 'bg-color-' + color
          }
          if ($id.children().length === 0) {
            var html =
              title +
              '<br/>' +
              '<span id="status" class="badge ' +
              css +
              '">' +
              '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
              '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
              '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
              '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
              '</span>'
            $id.html(html)
          } else {
            $($id.children()[1]).attr('class', 'badge ' + css)
          }
        },

        getCookie: function (cname) {
          var name = cname + '='
          var ca = document.cookie.split(';')
          for (var i = 0; i < ca.length; i++) {
            var c = ca[i]
            while (c.charAt(0) == ' ') c = c.substring(1)
            if (c.indexOf(name) == 0) return c.substring(name.length, c.length)
          }
          return ''
        },

        getGPmct: function (setting) {
          var result = []
          if (
            setting.dataEle['data'] &&
            setting.dataEle['data']['result'] &&
            setting.dataEle['data']['result']['stringValues']
          ) {
            var stringValues = setting.dataEle['data']['result']['stringValues']
            _.each(stringValues, function (val) {
              if (val.signal.id === 'G_STRV()') {
                var values = $.parseJSON(val.values[0].array[0])
                _.each(values, function (ele) {
                  var machineId = ele[0]
                  var data = ele[1]
                  if (machineId === setting.machineId) {
                    result = $.parseJSON(data)
                  }
                })
              }
            })
          }
          return result
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
        getDeviceStatusVals: function (setting, gCodeKeys, callback) {
          //使用keys取deviceStatus內的資料
          var machineId = setting.machineId
          var dataEle = setting.dataEle
          var commands = setting.commands
          var result = {}
          _.each(gCodeKeys, function (gCodeKey) {
            if (_.contains(commands, gCodeKey)) {
              try {
                result[gCodeKey] = dataEle.getValue(gCodeKey, machineId)
              } catch (e) {
                result[gCodeKey] = 'N/A'
                console.error(e)
              }
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
        getAPlusMachineParamFile: function (machineId, callback) {
          console.log(window.sessionStorage)
          var userId = JSON.parse(window.sessionStorage.getItem('loginInfo'))[
            'user_id'
          ]
          //讀取參數檔
          servkit.ajax(
            {
              //先讀使用者的
              url: 'api/getdata/custParamFile',
              type: 'GET',
              contentType: 'application/json',
              data: {
                filePath: 'a_plus/users/' + userId + '/' + machineId + '.csv',
              },
            },
            {
              success: function (response) {
                var csv = []
                _.each(response, function (row) {
                  var cols = $.csv.toArray(row)
                  //console.log(cols);
                  csv.push(cols)
                })
                callback(csv)
              },
              fail: function (response) {
                //使用者沒設，讀預設的
                servkit.ajax(
                  {
                    url: 'api/getdata/custParamFile',
                    type: 'GET',
                    contentType: 'application/json',
                    data: {
                      filePath: 'a_plus/template/' + machineId + '.csv',
                    },
                  },
                  {
                    success: function (response) {
                      var csv = []
                      _.each(response, function (row) {
                        var cols = $.csv.toArray(row)
                        //console.log(cols);
                        csv.push(cols)
                      })
                      callback(csv)
                      /*$.smallBox({
                                      title : "Use template, machine: '" + servkit.getMachineName(machineId) + "'",
                                      content : "<i class='fa fa-clock-o'></i> <i>2 seconds ago...</i>",
                                      color : "#C79121",
                                      iconSmall : "",
                                      timeout : 60000
                                  });*/
                    },
                    fail: function (response) {
                      $.smallBox({
                        title:
                          "machine: '" +
                          servkit.getMachineName(machineId) +
                          "' msg: " +
                          response,
                        content:
                          "<i class='fa fa-clock-o'></i> <i>2 seconds ago...</i>",
                        color: '#C79121',
                        iconSmall: '',
                        timeout: 60000,
                      })
                    },
                  }
                )
              },
            }
          )
        },
      },
      delayCondition: ['machineList'],
      dependencies: [
        [
          '/js/plugin/flot/jquery.flot.cust.min.js',
          '/js/plugin/flot/jquery.flot.resize.min.js',
          '/js/plugin/flot/jquery.flot.time.min.js',
          '/js/plugin/flot/jquery.flot.tooltip.min.js',
          '/js/plugin/flot/jquery.flot.axislabels.js',
        ],
        ['/js/plugin/imagesLoaded/imagesloaded.pkgd.min.js'],
        ['/js/plugin/d3/d3.min.js', '/js/plugin/jqBullet/bullet.js'],
      ],
    })
  })()
}
