import {
  getPlantMachineOptionMap,
  renderPlantAndMachineSelect,
} from '../../../../js/servtech/module/servkit/form.js'

export default async function () {
  const plantMachineOptionMap = await getPlantMachineOptionMap()
  GoGoAppFun({
    gogo: function (context) {
      servkit.addChartExport('#charthead', '#bar-chart-all')
      $('input[name="dataName"]:checked').parent().parent().parent().hide()
      var datepickerConfig = {
        dateFormat: 'yy/mm/dd',
        prevText: '<i class="fa fa-chevron-left"></i>',
        nextText: '<i class="fa fa-chevron-right"></i>',
      }
      var workShiftTable = createReportTable({
        $tableElement: $('#work-shift-table'),
        $tableWidget: $('#work-shift-table-widget'),
        rightColumn: [3, 4, 5, 6, 7, 8, 9, 10],
        excel: {
          fileName: 'UtilizationWorkShift',
          format: [
            'text',
            'text',
            'text',
            'text',
            'text',
            'text',
            'text',
            'text',
            'text',
            'text',
            'text',
            'text',
            'text',
            'text',
          ],
        },
      })

      context.$startDate
        .datepicker(datepickerConfig)
        .val(moment(new Date()).format('YYYY/MM/DD'))
      context.$endDate
        .datepicker(datepickerConfig)
        .val(moment(new Date()).format('YYYY/MM/DD'))
      renderPlantAndMachineSelect(
        plantMachineOptionMap,
        context.$plantSelect,
        context.$machineSelect
      )

      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()
        var funcName = $('#funcName').text().replace('>', ' ')
        var denominator = $('input[name="denominator"]:checked')
          .next()
          .next()
          .text()
        var datamode = $('input[name="dataName"]:checked').next().next().text()
        var title =
          context.$startDate.val() +
          ' - ' +
          context.$endDate.val() +
          ' ' +
          funcName +
          ' ( ' +
          datamode +
          ' / ' +
          denominator +
          ' )'
        $('#bar-chart-title').text(title)
        context.labelColorDes()
        var reportType = $('input[name="dataName"]:checked').val()
        context[reportType](workShiftTable)
      })
    },
    util: {
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $machineSelect: $('#machine'),
      $plantSelect: $('#plantAreaForm'),
      $barChart: $('#bar-chart'),
      $submitBtn: $('#submit-btn'),
      $labelColor: $('[name=labelColor]'), // OEE

      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      date8BitsToMilliSecond: function (date8bits) {
        var year = date8bits.substring(0, 4)
        var month = date8bits.substring(4, 6) - 1
        var day = date8bits.substring(6, 8)
        return new Date(year, month, day).getTime()
      },
      strSplitByComma: function (machineArr) {
        var str = ''
        var lastIndex = machineArr.length - 1
        _.each(machineArr, function (machine) {
          if (machineArr[lastIndex] != machine) {
            str += '"' + machine + '", '
          } else {
            str += '"' + machine + '"'
          }
        })
        return str
      },
      drawLineChart: function (sumOEEByMachineAndDate) {
        var context = this
        var dataset = []
        var colors = [
          '#e66113',
          '#5e498e',
          '#f4b600',
          '#029390',
          '#add401',
          '#6cb831',
          '#01a437',
          '#019342',
          '#fef701',
          '#0173bc',
          '#035c9e',
          '#f28a17',
          '#C71585',
          '#9400D3',
          '#8B4513',
          '#2F4F4F',
          '#0000CD',
          '#00CED1',
          '#696969',
          '#778899',
        ]
        var ticks = []
        var indexMap = []
        var data1 = {}
        var maxOEE = 0
        var checkTick = new Set()
        _.each(sumOEEByMachineAndDate, function (machineData, index) {
          var label = index.split('|')
          var machineName = label[0]
          var date = label[1]
          var dateMilliSecond = context.date8BitsToMilliSecond(date)

          indexMap.push(index)
          var avgUPTime = 0
          var avgAvailability = 0
          var avgPerformance = 0
          var avgQuality = 0
          if (machineData.avaMinusDown == 0 || machineData.availableTime == 0) {
            avgUPTime = 0.0
          } else {
            avgUPTime = machineData.avaMinusDown / machineData.availableTime
          }

          if (
            machineData.avaMinusDownMinusOff == 0 ||
            machineData.availableTime == 0
          ) {
            avgAvailability = 0.0
          } else {
            avgAvailability =
              machineData.avaMinusDownMinusOff / machineData.availableTime
          }

          if (
            machineData.n3MultPartCountVal == 0 ||
            machineData.avaMinusDownMinusOff == 0
          ) {
            avgPerformance = 0.0
          } else {
            avgPerformance =
              machineData.n3MultPartCountVal / machineData.avaMinusDownMinusOff
          }

          if (machineData.goodCount == 0 || machineData.partCount == 0) {
            avgQuality = 0.0
          } else {
            avgQuality = machineData.goodCount / machineData.partCount
          }

          var oee =
            avgUPTime * avgAvailability * avgPerformance * avgQuality * 100
          if (Number(maxOEE) < Number(oee)) {
            maxOEE = oee
          }
          var arrlist = [dateMilliSecond, oee]
          if (data1[machineName] == null) {
            data1[machineName] = {
              arr: [],
            }
          }
          data1[machineName].arr.push(arrlist)
          if (!checkTick.has(date)) {
            ticks.push([
              dateMilliSecond,
              date.substring(4, 6) + '/' + date.substring(6, 8),
            ])
            checkTick.add(date)
          }
        })
        console.log('maxOEE : ' + Math.ceil(maxOEE / 100) * 100)
        _.each(data1, function (data, index) {
          // if (dataset.length == 0) {
          dataset.push({
            label: index,
            data: data1[index].arr,
            color: colors[dataset.length],
            points: {
              symbol: 'circle',
            },
            fillColor: colors[dataset.length],
          })
        })
        // 日期區間超過一個月時，部分不顯示
        var ticksAutoSize = []
        if (ticks.length > 31) {
          _.each(ticks, (val, index) => {
            if (index % ((ticks.length / 15) | 0) === 0)
              ticksAutoSize.push(ticks[index])
            else ticksAutoSize.push([ticks[index][0], ''])
          })
        }

        var options = {
          lines: {
            show: true,
            lineWidth: 3,
          },
          points: {
            show: true,
            lineWidth: 4,
            symbol: function (ctx, x, y, radius, shadow) {
              // 增加點的大小
              ctx.arc(
                x,
                y,
                radius * 1,
                0,
                shadow ? Math.PI : Math.PI * 2,
                false
              )
            },
          },
          xaxis: {
            tickDecimals: 0,
            ticks: ticksAutoSize.length ? ticksAutoSize : ticks,
          },
          yaxes: [
            {
              min: 0,
              max: maxOEE < 100 ? 100 : Math.ceil(maxOEE / 100) * 100,
              tickDecimals: 2,
              tickFormatter: function (v, axis) {
                return v + '%'
              },
            },
          ],
          grid: {
            hoverable: true,
          },
          tooltip: true,
          tooltipOpts: {
            content: "<b style='display:none;'>%x</b><span>%y.2</span>",
            defaultTheme: false,
          },
          legend: {
            show: false,
          },
        }
        this.$lineplot = $.plot(this.$barChart, dataset, options)
        this.drawLineChartValueLabel(this.$lineplot)
        this.drawLegend(
          $('#bar-chart').closest('.chart-containar'),
          colors,
          data1
        )
        // context.labelMachineDes(data1, colors);
      },
      drawLegend($containar, colors, data1) {
        $containar.find('.chart-legend').empty()
        var count = 0
        var html = []
        _.each(data1, (data, index) => {
          if (data) {
            html.push(`<div>`)
            html.push(`  <div class="chart-legend-color">`)
            html.push(
              `     <div class="data-hr"><div style="background-color: ${colors[count]};"></div><hr style="border-top-color: ${colors[count]};"></div>`
            )
            html.push(`  </div>`)
            html.push(`  <div class="chart-legend-label">${index}</div>`)
            html.push(`</div>`)
            count++
          }
        })
        $containar.find('.chart-legend').append(html.join(''))
      },
      drawLineChartValueLabel($plot) {
        var ctx = $plot.getCanvas().getContext('2d') // get the context
        var xaxis = $plot.getXAxes()[0] // xAxis
        var yaxis = $plot.getYAxes()[0] // yAxis
        var offset = $plot.getPlotOffset() // plots offset
        ctx.font = "1.2rem 'Microsoft JhengHei'" // set a pretty label font

        var max = 0
        var checkData = {}
        _.each($plot.getData(), (layer, key) => {
          var data = $plot.getData()[key].data // get your series data
          for (var i = 0; i < data.length; i++) {
            var text = data[i][1]
            var index = data[i][0]
            if (Number(text) > max) max = Number(text)
            if (!checkData[index]) checkData[index] = []
            checkData[index].push({
              layerKey: key,
              index: i,
              value: Number(text).toFixed(2),
            })
          }
        })
        var spacing = max / 10
        _.each(checkData, (val) => {
          var list = val.sort((a, b) => b.value - a.value)
          _.each(list, (data, index) => {
            var draw = false
            if (list[index - 1]) {
              if (list[index - 1].value - data.value > spacing) draw = true
            } else draw = true
            if (draw) {
              var chartData = $plot.getData()[data.layerKey].data // get your series data
              var metrics = ctx.measureText(data.value)
              var xPos =
                xaxis.p2c(chartData[data.index][0]) +
                offset.left -
                metrics.width / 2 // place it in the middle of the bar
              var yPos = yaxis.p2c(chartData[data.index][1]) // place at top of bar, slightly up
              ctx.fillText(data.value + '%', xPos, yPos)
            }
          })
        })
      },
      labelColorDes: function () {
        this.$labelColor.html('<span>OEE</span>')
      },
      labelMachineDes: function (data1, colors) {
        var htmlStr = ''
        var count = 0
        _.each(data1, function (data, index) {
          htmlStr +=
            '<span class="btn" style="background:' +
            colors[count] +
            ';"></span>&nbsp;' +
            '<span>' +
            index +
            '</span>&nbsp;&nbsp;&nbsp;&nbsp;'
          count++
        })
        this.$labelMachine.html(htmlStr)
      },
      workShift: function (workShiftTable) {
        var context = this,
          machineList = context.$machineSelect.val() || [],
          loadingBtn = context.loadingBtn,
          startDate = context.$startDate.val(),
          endDate = context.$endDate.val()
        loadingBtn.doing()
        var macroMap

        var allmachine = servkit.getMachineList()
        var splitMachineList = context.strSplitByComma(allmachine)

        // var program_multiple_map = {};
        // servkit.ajax({
        //   url: 'api/getdata/custParamFile',
        //   type: 'GET',
        //   contentType: 'application/json',
        //   data: {
        //     filePath: "../magic_full/program_info_list.csv"
        //   }
        // }, {
        //   success: function (response) {

        //     _.each(response, function (str) {
        //       var info = str.split(",");
        //       var file_program_name = info[0];
        //       var count = info[info.length - 1];
        //       if (count !== "1") {
        //         program_multiple_map[file_program_name] = count;
        //       }
        //     })

        //取得marco.json
        servkit.ajax(
          {
            url: 'api/getdata/custParamJsonFile',
            type: 'GET',
            contentType: 'application/json',
            data: {
              filePath: 'param/macro.json',
            },
          },
          {
            success: function (response) {
              macroMap = JSON.parse(response)
              hippo
                .newSimpleExhaler()
                .space('product_work_utilization')
                .index('machine_id', allmachine)
                .indexRange('date', startDate, endDate)
                .columns(
                  'machine_id',
                  'program_name',
                  'date',
                  'work_shift',
                  'power',
                  'part',
                  'n3',
                  'macro_idle_minute_array'
                )
                .exhale(function (exhalable) {
                  var groupData = _.groupBy(exhalable.exhalable, function (
                    obj
                  ) {
                    return (
                      obj.machine_id + ',' + obj.date + ',' + obj.work_shift
                    )
                  })

                  var NGQuantityDataGroup = {}
                  var whereClause =
                    '(date BETWEEN "' + startDate + '" AND "' + endDate + '") '
                  if (allmachine.length > 0) {
                    whereClause +=
                      'AND machine_id IN (' + splitMachineList + ')'
                  }
                  servkit.ajax(
                    {
                      url: 'api/getdata/db',
                      type: 'POST',
                      contentType: 'application/json',
                      data: JSON.stringify({
                        table: 'a_cosmos_program_production',
                        columns: [
                          'DATE_FORMAT(date,"%Y%m%d") AS date',
                          'work_shift',
                          'machine_id',
                          'ng_quantity',
                        ],
                        whereClause: whereClause,
                      }),
                    },
                    {
                      success: function (data) {
                        _.each(data, function (elem) {
                          var keys =
                            elem.machine_id +
                            ',' +
                            elem.date +
                            ',' +
                            elem.work_shift

                          NGQuantityDataGroup[keys] = {
                            ng_quantity:
                              NGQuantityDataGroup[keys] == undefined
                                ? elem.ng_quantity
                                : NGQuantityDataGroup[keys].ng_quantity +
                                  elem.ng_quantity,
                          }
                        })
                      },
                    }
                  )

                  var shiftStartEnd = {}
                  const timeFormat =
                    'DATE_FORMAT(${name},"%H:%i:%s") AS ${name}'
                  servkit.ajax(
                    {
                      url: 'api/getdata/db',
                      type: 'POST',
                      contentType: 'application/json',
                      data: JSON.stringify({
                        table: 'm_work_shift_time',
                        columns: [
                          'name',
                          timeFormat.replace(/\$\{name\}/g, 'start'),
                          timeFormat.replace(/\$\{name\}/g, 'end'),
                        ],
                      }),
                    },
                    {
                      success: function (data) {
                        _.each(data, function (obj) {
                          shiftStartEnd[obj.name] = {
                            start: obj.start,
                            end: obj.end,
                          }
                        })
                      },
                    }
                  )
                  var powerTimeDays = {}
                  var performanceDays = {}
                  var downTimeDays = {}
                  _.map(groupData, function (arrObj, key) {
                    var sumDownTimeType2And3 = 0
                    var sumDownTimeType3 = 0
                    var powerTime = 0
                    var n3MultPartCount = 0
                    var partCount = 0
                    _.each(arrObj, function (obj) {
                      var power = obj.power
                      var n3 = obj.n3
                      var part = obj.part
                      partCount += part
                      n3MultPartCount += n3 * part
                      powerTime += power
                      var downTime = JSON.parse(obj.macro_idle_minute_array)

                      for (var idlecode in downTime) {
                        if (macroMap[idlecode]) {
                          if (
                            macroMap[idlecode]['cal_status'] ===
                            '2. General invalid time'
                          ) {
                            sumDownTimeType2And3 += downTime[idlecode]
                          }
                          if (
                            macroMap[idlecode]['cal_status'] ===
                            '3. Special invalid time'
                          ) {
                            sumDownTimeType2And3 += downTime[idlecode]
                            sumDownTimeType3 += downTime[idlecode]
                          }
                        }
                      }
                      powerTimeDays[key] = {
                        power_time: powerTime,
                      }
                      performanceDays[key] = {
                        n3_mult_part_count: n3MultPartCount,
                        part_count: partCount,
                      }
                      downTimeDays[key] = {
                        down_time_type_2and3: sumDownTimeType2And3,
                        down_time_type_3: sumDownTimeType3,
                      }
                    })
                  })

                  // 取得各班次時間區間
                  context.commons.composeDayReport(
                    startDate,
                    endDate,
                    machineList,
                    function (exhalable) {
                      servkit.ajax(
                        {
                          url:
                            'api/downtimeanalysis/machineidle/getworkshiftrange',
                          type: 'GET',
                          data: {
                            startDate: context.$startDate
                              .val()
                              .replace(/\//g, ''),
                            endDate: context.$endDate.val().replace(/\//g, ''),
                          },
                        },
                        {
                          success: function (shiftData) {
                            var sumAvailable = 0
                            var sumAvaMinusDown = 0
                            var sumAvaMinusDownMinusOff = 0
                            var sumN3MultPartCount = 0
                            var sumGoodCount = 0
                            var sumPartCount = 0
                            var sumOEEByMachineAndDate = {}
                            var today = moment().format('YYYYMMDD')
                            var result = []
                            exhalable.map(function (data, groupKeys) {
                              var timeYet = false
                              if (groupKeys[1] == today) {
                                var now = moment().format('YYYY/MM/DD HH:mm:ss')
                                // console.log("moment('2019/12/27 14:00:00').isBefore(" + groupKeys[2] + "班) : " + moment('2019/12/27 14:00:00').isBefore(moment().format("YYYY/MM/DD") + " " + shiftStartEnd[groupKeys[2]].start));
                                if (
                                  moment(now).isBefore(
                                    moment().format('YYYY/MM/DD') +
                                      ' ' +
                                      shiftStartEnd[groupKeys[2]].start
                                  )
                                ) {
                                  timeYet = true
                                }
                              }
                              if (data.utws.length > 0 && !timeYet) {
                                var powerTimeDay =
                                  powerTimeDays[groupKeys] == undefined
                                    ? {
                                        power_time: 0,
                                      }
                                    : powerTimeDays[groupKeys]

                                var n3MultPartCountDay =
                                  performanceDays[groupKeys] == undefined
                                    ? {
                                        n3_mult_part_count: 0,
                                        part_count: 0,
                                      }
                                    : performanceDays[groupKeys]

                                var downTimeDay =
                                  downTimeDays[groupKeys] == undefined
                                    ? {
                                        down_time_type_2and3: 0,
                                        down_time_type_3: 0,
                                        // down_time_m2: 0,
                                        // down_time_m3: 0
                                      }
                                    : downTimeDays[groupKeys]

                                var ngQuantityData =
                                  NGQuantityDataGroup[groupKeys] == undefined
                                    ? {
                                        ng_quantity: 0,
                                      }
                                    : NGQuantityDataGroup[groupKeys]

                                var powerTimeVal = powerTimeDay.power_time
                                var n3MultPartCountVal =
                                  n3MultPartCountDay.n3_mult_part_count
                                var partCount = n3MultPartCountDay.part_count
                                var downTime = downTimeDay.down_time_type_2and3
                                var ngQuantity = ngQuantityData.ng_quantity

                                var mergeDownTimeData = _.extend(
                                  data.utws[0],
                                  downTime
                                )
                                var timeData = context.commons.millisecondExcludMillisecond(
                                  mergeDownTimeData
                                )

                                var availableTime
                                _.each(shiftData[timeData.date], function (
                                  shift
                                ) {
                                  if (shift.name == timeData.work_shift) {
                                    availableTime =
                                      shift.totalMillisecond + 1000
                                  }
                                })
                                var avaMinusDown =
                                  availableTime - downTimeDay.down_time_type_3
                                var avaMinusDownMinusOff =
                                  availableTime -
                                  downTimeDay.down_time_type_2and3 -
                                  (availableTime - powerTimeVal)
                                var goodCount = partCount - ngQuantity
                                sumAvailable += availableTime
                                sumAvaMinusDown += avaMinusDown
                                sumAvaMinusDownMinusOff += avaMinusDownMinusOff
                                sumN3MultPartCount += n3MultPartCountVal
                                sumPartCount += partCount
                                sumGoodCount += goodCount

                                var UP =
                                  avaMinusDown == 0
                                    ? 0.0
                                    : avaMinusDown / availableTime
                                var A =
                                  avaMinusDownMinusOff == 0
                                    ? 0.0
                                    : avaMinusDownMinusOff / availableTime
                                if (
                                  n3MultPartCountVal == 0 ||
                                  avaMinusDownMinusOff == 0
                                ) {
                                  var P = 0.0
                                } else {
                                  P = n3MultPartCountVal / avaMinusDownMinusOff
                                }
                                if (goodCount == 0 || partCount == 0) {
                                  var Q = 0.0
                                } else {
                                  Q = goodCount / partCount
                                }
                                // var brand = servkit.getMachineBrand(timeData.machine_id);
                                result.push([
                                  servkit.getMachineName(timeData.machine_id),
                                  timeData.date.date8BitsToSlashed(),
                                  timeData.work_shift,
                                  UP.floatToPercentage(),
                                  A.floatToPercentage(),
                                  (P * 100.0).toFixed(2) + '%',
                                  partCount,
                                  ngQuantity,
                                  (Q * 100.0).toFixed(2) + '%',
                                  (UP * A * P * Q * 100).toFixed(2) + '%',
                                ])
                                // console.log("machine name = " + context.getMachineName(groupKeys[0]))
                                var machineNameWithDate =
                                  servkit.getMachineName(groupKeys[0]) +
                                  '|' +
                                  timeData.date
                                sumOEEByMachineAndDate[machineNameWithDate] = {
                                  avaMinusDown:
                                    sumOEEByMachineAndDate[
                                      machineNameWithDate
                                    ] == undefined
                                      ? avaMinusDown
                                      : sumOEEByMachineAndDate[
                                          machineNameWithDate
                                        ].avaMinusDown + avaMinusDown,
                                  avaMinusDownMinusOff:
                                    sumOEEByMachineAndDate[
                                      machineNameWithDate
                                    ] == undefined
                                      ? avaMinusDownMinusOff
                                      : sumOEEByMachineAndDate[
                                          machineNameWithDate
                                        ].avaMinusDownMinusOff +
                                        avaMinusDownMinusOff,
                                  availableTime:
                                    sumOEEByMachineAndDate[
                                      machineNameWithDate
                                    ] == undefined
                                      ? availableTime
                                      : sumOEEByMachineAndDate[
                                          machineNameWithDate
                                        ].availableTime + availableTime,
                                  n3MultPartCountVal:
                                    sumOEEByMachineAndDate[
                                      machineNameWithDate
                                    ] == undefined
                                      ? n3MultPartCountVal
                                      : sumOEEByMachineAndDate[
                                          machineNameWithDate
                                        ].n3MultPartCountVal +
                                        n3MultPartCountVal,
                                  goodCount:
                                    sumOEEByMachineAndDate[
                                      machineNameWithDate
                                    ] == undefined
                                      ? goodCount
                                      : sumOEEByMachineAndDate[
                                          machineNameWithDate
                                        ].goodCount + goodCount,
                                  partCount:
                                    sumOEEByMachineAndDate[
                                      machineNameWithDate
                                    ] == undefined
                                      ? partCount
                                      : sumOEEByMachineAndDate[
                                          machineNameWithDate
                                        ].partCount + partCount,
                                }
                              }
                            })
                            console.log(result)
                            workShiftTable.drawTable(result)
                            var AVGOEE =
                              (sumAvaMinusDown / sumAvailable) *
                              (sumAvaMinusDownMinusOff / sumAvailable) *
                              (sumN3MultPartCount / sumAvaMinusDownMinusOff) *
                              (sumGoodCount / sumPartCount)
                            console.log('平均稼動率 : ' + AVGOEE)
                            // context.drawChart(result, sumOEEByMachine, (AVGOEE * 100).toFixed(2));
                            var avgOeePercentage =
                              AVGOEE == 0 ? 0.0 : (AVGOEE * 100).toFixed(2)
                            context.drawLineChart(sumOEEByMachineAndDate)
                            $('#workshift-info').text(
                              'Avg .OEE : ' + avgOeePercentage + ' %'
                            )
                            workShiftTable.showWidget()

                            loadingBtn.done()
                          },
                          fail: function (data) {},
                        }
                      )
                    }
                  )
                })
            },
            fail: function (response) {
              console.warn(response)
            },
          }
        )
      },
      // });
      // }
    },
    preCondition: {},
    delayCondition: ['machineList'],
    dependencies: [
      [
        '/js/plugin/flot/jquery.flot.cust.min.js',
        '/js/plugin/flot/jquery.flot.resize.min.js',
        // "/js/plugin/flot/jquery.flot.time.min.js",
        '/js/plugin/flot/jquery.flot.fillbetween.min.js',
        '/js/plugin/flot/jquery.flot.orderBar.min.js',
        '/js/plugin/flot/jquery.flot.tooltip.min.js',
        '/js/plugin/flot/jquery.flot.symbol.min.js',
        '/js/plugin/flot/jquery.flot.axislabels.js',
        '/js/plugin/flot/jquery.flot.stack.min.js',
        '/js/servtech/cosmos/jquery.flot.valuelabels-2.2.0.js',
      ],
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
    ],
  })
}
