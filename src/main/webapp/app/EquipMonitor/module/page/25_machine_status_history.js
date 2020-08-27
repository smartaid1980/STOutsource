import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.reportTable = createReportTable({
        $tableElement: $('#table'),
        $tableWidget: $('#table-widget'),
        rightColumn: [5, 6, 7],
        serverSide: true, // 加上serverSide才可以用ajax畫
        ajax: function (data, callback) {
          // 等到使用者觸發才會去畫欄位，此方法已脫離reporttable的機制(reporttable的callback會沒作用)
          var out = []
          var temp = context.tableObj
          $('#table .hasinput>input[type=text], #table .hasinput>select').each(
            function (index) {
              var value = this.value
              if (value) {
                if (this.nodeName === 'SELECT') {
                  var regExSearch =
                    value === ''
                      ? ''
                      : '^' +
                        value
                          .toString()
                          .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
                        '$'
                  if (regExSearch) {
                    temp = temp.filter(function (row) {
                      return new RegExp(regExSearch).test(row[index])
                    })
                  }
                } else {
                  temp = temp.filter(function (row) {
                    return row[index].indexOf(value) >= 0
                  })
                }
              }
            }
          )
          for (
            var i = data.start, ien = data.start + data.length;
            i < ien;
            i++
          ) {
            if (temp[i]) {
              out.push(temp[i])
            }
          }
          callback({
            draw: data.draw,
            data: out,
            recordsTotal: temp.length,
            recordsFiltered: temp.length,
          })
        },
        excel: {
          fileName: 'Machine Status History',
          format: [
            'text',
            'text',
            'text',
            'text',
            'text',
            'text',
            'text',
            'text',
          ],
          customDataFunc: function () {
            return context.tableObj
          },
        },
      })

      servkit.addmultiChartExport('#charthead', context.stackChartArr)
      servkit.initDatePicker(context.$startDate, context.$endDate, 1, 7)
      servkit.initFuncBindMachineSelect(
        context.$machineSelect,
        context.appId,
        context.funId
      )
      context.initClockPicker()
      $('[name=type]')
        .on('change', (e) => {
          if ($('#shift-day').prop('checked')) {
            context.$startTime.val('').attr('disabled', 'disabled')
            context.$endTime.val('').attr('disabled', 'disabled')
          } else {
            context.$startTime.removeAttr('disabled')
            context.$endTime.removeAttr('disabled')
          }
        })
        .trigger('change')

      var lastValidSelection = null
      context.$machineSelect.on('click', function (e) {
        var machineVal = $(this).val()
        // because servtank basic will have 400 machines
        // and "ALL" will be count , so use 401
        // by jaco , 2017/10/13
        if (machineVal && machineVal.length > 401) {
          window.alert(`${i18n('Machine_Number_Limit')}`)
          $(this).val(lastValidSelection)
        } else {
          lastValidSelection = machineVal
        }
      })

      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()
        context.loadingBtn.doing()

        // clear canvas
        // context.stackChartArr = [''];
        context.reportTable.clearTable()

        // 拿班次
        context.getWorkShift(
          context.$startDate.val(),
          context.$endDate.val(),
          function () {
            // 拿資料
            context.getData(
              context.$startDate.val(),
              context.$endDate.val(),
              context.$machineSelect.val()
            )
          }
        )
      })

      $('#natural-day').on('click', function (evt) {
        if ($('#natural-day').prop('checked')) {
          context.$startTime.val('00:00')
          context.$endTime.val('23:59')
        }
      })

      context.showDemo(context)

      if (servtechConfig.ST_CUSTOMER === 'IOWM') {
        context.$startDate.val(moment().subtract(3, 'day').format('YYYY/MM/DD'))
        context.$endDate.val(moment().format('YYYY/MM/DD'))
      }
    },
    util: {
      $shiftDay: $('#shift-day'),
      $naturalDat: $('#natrual-day'),
      $startDate: $('#start-date'),
      $startTime: $('#start-time'),
      $endDate: $('#end-date'),
      $endTime: $('#end-time'),
      $machineSelect: $('#device'),
      $stackWidget: $('#stack-widget'),
      $submitBtn: $('#submit'),
      demoStartDate: '2019/05/04',
      demoEndDate: '2019/05/07',
      loadingBtn: servkit.loadingButton(document.querySelector('#submit')),
      workShift: {},
      statusHistory: [],
      plotObj: [],
      tableObj: [],
      stackChartArr: [],
      reportTable: null,
      timeThreshold:
        servtechConfig.ST_TIMETHRESHOLD == undefined
          ? -1
          : servtechConfig.ST_TIMETHRESHOLD, // 資料之間間隔多少毫秒才算離線
      min: null,
      max: null,
      initClockPicker: function () {
        $('.clockpicker').clockpicker({
          align: 'right',
          autoclose: true,
          placement: 'bottom',
          donetext: 'Done',
        })
      },
      IOWMDemo(ctx) {
        // 拿班次
        ctx.getWorkShift(ctx.demoStartDate, ctx.demoEndDate, function () {
          // 拿資料
          ctx.getData(
            ctx.demoStartDate,
            ctx.demoEndDate,
            ctx.$machineSelect.val()
          )
        })
      },
      getWorkShift: function (startDate, endDate, callback) {
        var ctx = this
        ctx.workShift = undefined
        startDate = startDate.replace(/\//g, '')
        endDate = endDate.replace(/\//g, '')
        servkit.ajax(
          {
            url: 'api/workshift/byDateInterval',
            type: 'GET',
            data: {
              startDate: startDate,
              endDate: endDate,
            },
          },
          {
            success: function (data) {
              // data={"20160401": [{"start": "2016/04/01 08:00:00","sequence": 1,"name": "早班","end": "2016/04/01 16:59:59"},{}], ...}
              // 先都不管日吧...
              ctx.workShift = _.flatten(_.toArray(data))
              if (callback) {
                callback()
              }
            },
          }
        )
      },
      getData: function (startDate, endDate, machineList) {
        var ctx = this
        ctx.statusHistory = null
        ctx.min = null
        ctx.max = null
        let isNaturalDay = $('#natural-day').prop('checked')
        var start = isNaturalDay
          ? moment(startDate).add(-1, 'day').format('YYYY/MM/DD')
          : startDate
        if (isNaturalDay) {
          ctx.min = new Date(startDate + ' ' + ctx.$startTime.val() + ':00.000')
          ctx.max = new Date(endDate + ' ' + ctx.$endTime.val() + ':59.999')
        }
        $('#dialog-no-data').html('')
        var hippoTimes = 0
        var truthHippoTimes = 0
        // 表格用的資料
        ctx.tableObj = []
        $('#progress-percent').html(0)
        $('#progress').css('width', '0.1%')
        $('#progress').closest('.col').removeClass('hide')
        var machines = _.without(machineList, 'ALL')
        if (machines == null) {
          // 未選等於全選
          ctx.$machineSelect.find('option').prop('selected', 'selected')
          machines = ctx.$machineSelect.val()
        }
        if (servtechConfig.ST_CUSTOMER === 'IOWM') {
          machines = [
            '_IOEM_20190502D01M01',
            '_IOEM_20190502D01M02',
            '_IOEM_20190502D01M03',
          ]
        }
        ctx.stackChartArr.splice(0, ctx.stackChartArr.length)
        ctx.$stackWidget.empty()
        for (
          var machineIndex = 0;
          machineIndex < machines.length;
          machineIndex += 10
        ) {
          hippoTimes++
          // 先建畫圖的div
          var stackName = `stack-chart${hippoTimes}`
          ctx.$stackWidget.append(
            `<div id="${stackName}" class="chart" style="width:98%;height:auto;cursor:pointer;"></div>`
          )
          ctx.stackChartArr.push('#' + stackName) // 存入匯出圖表的陣列
          ctx
            .getHippoData(
              start,
              endDate,
              isNaturalDay,
              machines.slice(machineIndex, machineIndex + 10),
              stackName
            )
            .then((data) => {
              if (Object.keys(data.data).length === 0)
                ctx.stackChartArr.splice(
                  ctx.stackChartArr.indexOf('#' + data.stackName),
                  1
                )
              // 畫圖用的資料
              ctx.plotObj = []
              truthHippoTimes++
              var progress = function (percent) {
                setTimeout(function () {
                  $('#progress-percent').html(percent)
                  $('#progress').css('width', percent + '%')
                  if (percent === '100.00') {
                    setTimeout(function () {
                      $('#progress').closest('.col').addClass('hide')
                      ctx.reportTable.appendTable(ctx.tableObj, [])
                      ctx.loadingBtn.done()
                    }, 1000)
                  }
                }, 200)
              }

              progress(((truthHippoTimes / hippoTimes) * 100).toFixed(2))
              ctx.preProcessData(data.data)
              ctx.reportTable.table.draw()
              ctx.drawChart(data.stackName)
            })
            .catch((reason) => {
              if (
                servtechConfig.ST_CUSTOMER === 'IOWM' &&
                startDate !== ctx.demoStartDate &&
                endDate !== ctx.demoEndDate
              ) {
                console.warn('Go with demo.')
                ctx.$startDate.val(ctx.demoStartDate)
                ctx.$endDate.val(ctx.demoEndDate)
                ctx.IOWMDemo(ctx)
              }
              return false
            })
        }
      },
      getHippoData: function (
        startDate,
        endDate,
        isNaturalDay,
        machineList,
        stackName
      ) {
        var ctx = this
        return new Promise((resolve, reject) => {
          hippo
            .newSimpleExhaler()
            .space('machine_status_history')
            .index('machine_id', machineList)
            // 如果查詢有細到時間就往前找一天，解決加上時間之後的跨班議題，ex: 9/21 01:00 可能屬於9/20的C班
            .indexRange('date', startDate, endDate)
            .columns(
              'machine_id',
              'status',
              'start_time',
              'end_time',
              'alarm_code',
              'duration',
              'cnc_brand'
            )
            .exhale(function (exhalable) {
              if (exhalable.message) {
                $('#dialog-no-data').html(
                  $('#dialog-no-data').html() + '<br>' + exhalable.message
                )
              }
              var historyByMachine = _.groupBy(
                exhalable.exhalable,
                'machine_id'
              )
              //分解出離線狀態的時間
              var tempHistory = {}
              _.each(historyByMachine, (dataList, machineId) => {
                let lastEndTime = null
                _.each(dataList, (elem) => {
                  let startTime = new Date(
                    elem.start_time.date20BitsToFormatted()
                  )
                  if (ctx.timeThreshold != -1)
                    if (
                      lastEndTime &&
                      startTime.getTime() - lastEndTime.getTime() >
                        ctx.timeThreshold
                    ) {
                      if (tempHistory[machineId] === undefined)
                        tempHistory[machineId] = []
                      tempHistory[machineId].push(
                        ctx.createOfflineobj(elem, lastEndTime, startTime)
                      )
                      lastEndTime = null
                    }
                  elem.status = elem.status === 'B' ? '0' : elem.status
                  elem.start_time =
                    lastEndTime ||
                    new Date(elem.start_time.date20BitsToFormatted())
                  elem.end_time = new Date(
                    elem.end_time.date20BitsToFormatted()
                  )
                  lastEndTime = elem.end_time
                  if (tempHistory[machineId] === undefined)
                    tempHistory[machineId] = []
                  tempHistory[machineId].push(elem)
                })
                lastEndTime = null
              })
              historyByMachine = tempHistory

              // 有選時間就要過濾，否則依本來的行為以班次起訖為準
              if (isNaturalDay) {
                // 過濾細到時分秒
                historyByMachine = _.mapObject(
                  historyByMachine,
                  (dataList, machineId) => {
                    return _.filter(dataList, (elem) => {
                      return (
                        (ctx.min <= elem.start_time &&
                          elem.start_time <= ctx.max) ||
                        (ctx.min < elem.end_time && elem.end_time < ctx.max) ||
                        (elem.start_time < ctx.min && ctx.max < elem.end_time)
                      )
                    })
                  }
                )
              }
              resolve({
                stackName: stackName,
                data: historyByMachine,
              })
            })
        })
      },
      preProcessData: function (data) {
        var context = this

        if (data) {
          context.min =
            context.min || new Date(_.first(context.workShift).start)
          context.max = context.max || new Date(_.last(context.workShift).end)
          // machine_id, status, start_time, end_time, alarm_code, duration, cnc_brand
          _.each(data, function (dataList, machineId) {
            // if (elem.machine_id === '' || servkit.getMachineLightColor(elem.status) === elem.status) return true // 如果檔案是空的話就執行下一個item
            if (dataList.length === 0) return
            let firstData = _.first(dataList)
            // 補上min到第一筆資料的離線資料
            context.createDummyObj(
              machineId,
              firstData.cnc_brand,
              context.min,
              firstData.start_time
            )

            _.each(dataList, (elem) => {
              var obj = {}
              obj.deviceId = elem.machine_id
              obj.deviceName = servkit.getMachineName(elem.machine_id)
              obj.cnc_brand = elem.cnc_brand
              obj.lightId = elem.status
              obj.lightName = servkit.getMachineLightName(elem.status)
              obj.start =
                elem.start_time < context.min
                  ? moment(context.min).format('YYYY/MM/DD HH:mm:ss')
                  : moment(elem.start_time).format('YYYY/MM/DD HH:mm:ss')
              obj.end =
                elem.end_time > context.max
                  ? moment(context.max).format('YYYY/MM/DD HH:mm:ss')
                  : moment(elem.end_time).format('YYYY/MM/DD HH:mm:ss')
              obj.rawTime = context.getRawTime(obj.start, obj.end)
              obj.period = obj.rawTime.millisecondToHHmmss()
              obj.alarmCode =
                elem.alarm_code === '-1' || elem.alarm_code === 'B'
                  ? ''
                  : elem.alarm_code.replace(/#/g, ',')
              if (context.preCon.getCncAlarmCodeMap[elem.cnc_brand]) {
                if (
                  context.preCon.getCncAlarmCodeMap[elem.cnc_brand][
                    obj.alarmCode
                  ]
                ) {
                  obj.alarmStatus =
                    context.preCon.getCncAlarmCodeMap[elem.cnc_brand][
                      obj.alarmCode
                    ]
                } else if (obj.alarmCode.includes(',')) {
                  obj.alarmStatus = _.map(obj.alarmCode.split(','), function (
                    code
                  ) {
                    return (
                      context.preCon.getCncAlarmCodeMap[elem.cnc_brand][code] ||
                      code
                    )
                  }).join(',')
                } else {
                  obj.alarmStatus = '---'
                }
              } else {
                obj.alarmStatus = '---'
              }

              if (obj.rawTime > 0) {
                context.plotObj.push(obj)
                // machine_id, cnc_brand, status, alarm_code, alarm_status, start_time, end_time, duration
                context.tableObj.push([
                  obj.deviceName,
                  obj.cnc_brand,
                  obj.lightName,
                  obj.alarmCode == 'null' ? '' : obj.alarmCode,
                  obj.alarmStatus,
                  obj.start,
                  obj.end,
                  obj.period,
                ])
              }
            })

            // 補上最後一筆資料
            context.createDummyObj(
              machineId,
              firstData.cnc_brand,
              _.last(dataList).end_time,
              context.max
            )
          })
        }
      },
      getRawTime: function (start, end) {
        return moment(end) - moment(start)
      },
      createDummyObj: function (deviceId, cncBrand, start, end) {
        var rawTime = this.getRawTime(start, end)
        if (rawTime > 0) {
          var leakObj = {}
          leakObj.deviceId = deviceId
          leakObj.deviceName = servkit.getMachineName(deviceId)
          leakObj.cnc_brand = cncBrand
          leakObj.lightId = '0' // 機台無資料視同離線
          leakObj.lightName = servkit.getMachineLightName('0')
          leakObj.alarmCode = ''
          leakObj.alarmStatus = ''
          leakObj.start = moment(start).format('YYYY/MM/DD HH:mm:ss')
          leakObj.end = moment(end).format('YYYY/MM/DD HH:mm:ss')
          leakObj.rawTime = rawTime
          leakObj.period = rawTime.millisecondToHHmmss()
          this.plotObj.push(leakObj)
          this.tableObj.push([
            leakObj.deviceName,
            leakObj.cnc_brand,
            leakObj.lightName,
            leakObj.alarmCode == 'null' ? '' : leakObj.alarmCode,
            leakObj.alarmStatus,
            leakObj.start,
            leakObj.end,
            leakObj.period,
          ])
        }
      },
      createOfflineobj: function (elem, start, end) {
        var obj = Object.assign({}, elem)
        obj.status = '0'
        obj.start_time = moment(start).format('YYYY/MM/DD HH:mm:ss')
        obj.end_time = moment(end).format('YYYY/MM/DD HH:mm:ss')
        obj.alarm_code = ''
        obj.alarmStatus = ''
        obj.lightId = '0'
        obj.rawTime = this.getRawTime(start, end)
        obj.lightName = servkit.getMachineLightName('0')
        obj.period = obj.rawTime.millisecondToHHmmss()
        return obj
      },
      growStackBar: function ($target, dataSet, deviceId, tickSize) {
        var context = this
        var $placeholder = $(
          "<div style='width:100%;height:100px;'></div>"
        ).attr('name', 'placeholder')
        $target.append($placeholder)
        var option = {
          series: {
            stack: true,
            bars: {
              show: true,
            },
          },
          bars: {
            lineWidth: 0.5,
            barWidth: 1,
            horizontal: true,
          },
          xaxis: {
            mode: 'time',
            // axisLabel: 'Time ( ' + context.tickFormat + ' )',
            tickSize: tickSize, // 沒有的話會變兩個小時一格
            tickFormatter: function (v, axis) {
              // 沒有的話會從格林威治時間開始
              return moment(context.min).add(v).format(context.tickFormat)
            },
          },
          yaxis: {
            ticks: function () {
              let machineName = servkit.getMachineName(deviceId)
              machineName =
                machineName.length > 20
                  ? '...' + machineName.substring(machineName.length - 17)
                  : machineName
              return [[0.5, machineName]]
            },
          },
          grid: {
            hoverable: true,
          },
          legend: {
            show: true,
            position: 'ne',
            container: 'machineName',
          },
          tooltip: true,
          tooltipOpts: {
            content: '%s',
            defaultTheme: false,
          },
        }

        // if (document.body.clientWidth < 800) {
        //   option.xaxis.tickSize = [2, 'hour']
        // }

        return $.plot($placeholder, dataSet, option)
      },
      drawChart: function (stackName) {
        var ctx = this
        var dataSetList = []
        var dataSet // dataSetList = [dataSet, dataSet, dataSet ...]
        var groupedPlotObj = _.groupBy(ctx.plotObj, 'deviceId')
        var machineList = _.keys(groupedPlotObj)
        if (Object.keys(groupedPlotObj).length) {
          _.each(groupedPlotObj, function (plot, deviceId) {
            var lastElem = {}
            dataSet = []
            _.each(plot, function (elem) {
              var lightId = elem.lightId
              // 如果前後筆資料狀態相同
              if (lastElem.lightId && lastElem.lightId === lightId) {
                dataSet.pop() // 去除前一個，因為要跟這筆合併
                elem.start = lastElem.start
              }
              var start = elem.start
              var end = elem.end
              var rawTime = ctx.getRawTime(start, end)
              var offSetPeriod = rawTime.millisecondToHHmmss()

              var obj = {
                label:
                  '&nbsp' +
                  servkit.getMachineLightName(lightId) +
                  '<br>' +
                  start +
                  ' ~ ' +
                  end +
                  '<br>' +
                  offSetPeriod,
                data: [[rawTime, 0]],
                color: servkit.getMachineLightColor(lightId),
              }
              lastElem = elem

              dataSet.push(obj)
            })
            dataSetList.push(dataSet)
          })

          var tickSize = ctx.calcTickSize()

          $(`#${stackName}`).append(
            `<h6 name="bar-chart-title" align="center">Time ( ${ctx.tickFormat} )</h6>`
          )

          _.each(dataSetList, function (dataSet, index) {
            ctx.growStackBar(
              $(`#${stackName}`),
              dataSet,
              machineList[index],
              tickSize
            )
          })
          tickSize = null
        }
        $('.flot-y-axis .flot-tick-label').css('text-align', 'left')
      },
      calcTickSize: function () {
        var duration = moment.duration(this.max - 59999 - this.min)
        if (moment.duration(1, 'day') < duration) {
          this.tickFormat = 'MM/DD'
          return [1, 'day']
        } else if (
          moment.duration(12, 'hour') < duration &&
          duration <= moment.duration(24, 'hour')
        ) {
          this.tickFormat = 'HH:mm'
          return [1, 'hour']
        } else if (
          moment.duration(6, 'hour') < duration &&
          duration <= moment.duration(12, 'hour')
        ) {
          this.tickFormat = 'HH:mm'
          return [30, 'minute']
        } else if (
          moment.duration(3, 'hour') < duration &&
          duration <= moment.duration(6, 'hour')
        ) {
          this.tickFormat = 'HH:mm'
          return [15, 'minute']
        } else if (
          moment.duration(1, 'hour') < duration &&
          duration <= moment.duration(3, 'hour')
        ) {
          this.tickFormat = 'HH:mm'
          return [7, 'minute']
        } else if (
          moment.duration(30, 'minute') < duration &&
          duration <= moment.duration(60, 'minute')
        ) {
          this.tickFormat = 'mm:ss'
          return [2, 'minute']
        } else if (
          moment.duration(15, 'minute') < duration &&
          duration <= moment.duration(30, 'minute')
        ) {
          this.tickFormat = 'mm:ss'
          return [1, 'minute']
        } else if (
          moment.duration(1, 'minute') < duration &&
          duration <= moment.duration(15, 'minute')
        ) {
          this.tickFormat = 'mm:ss'
          return [30, 'second']
        } else {
          this.tickFormat = 'mm:ss'
          return [5, 'second']
        }
      },
      showDemo: function (context) {
        var showdemoConfig
        try {
          showdemoConfig = servkit.showdemoConfig[context.appId][context.funId]
        } catch (e) {
          console.warn(e)
        } finally {
          showdemoConfig = showdemoConfig || {
            startDate: '2018/07/01',
            endDate: '2018/07/08',
            machines: [
              '_FOXCONNP01D01M001',
              '_FOXCONNP01D01M002',
              '_FOXCONNP01D01M003',
              '_FOXCONNP01D01M004',
            ],
          }
        }
        $('#showdemo').on('click', function (e) {
          e.preventDefault()

          context.$startDate.val(showdemoConfig.startDate)
          context.$endDate.val(showdemoConfig.endDate)
          context.$machineSelect.val(showdemoConfig.machines)
          context.$submitBtn.click()
        })
      },
    },
    delayCondition: ['machineList', 'machineLightList'],
    preCondition: {
      getCncAlarmCodeMap: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'm_alarm',
              columns: ['alarm_id', 'cnc_id', 'alarm_status'],
            }),
          },
          {
            success: function (data) {
              var cncAlarmCodeMap = {}
              _.each(data, function (elem) {
                if (!cncAlarmCodeMap[elem.cnc_id]) {
                  cncAlarmCodeMap[elem.cnc_id] = {}
                }
                cncAlarmCodeMap[elem.cnc_id][elem.alarm_id] = elem.alarm_status
              })
              done(cncAlarmCodeMap)
            },
          }
        )
      },
    },
    dependencies: [
      [
        '/js/plugin/flot/jquery.flot.cust.min.js',
        '/js/plugin/flot/jquery.flot.resize.min.js',
        '/js/plugin/flot/jquery.flot.fillbetween.min.js',
        '/js/plugin/flot/jquery.flot.pie.min.js',
        '/js/plugin/flot/jquery.flot.tooltip.min.js',
        '/js/plugin/flot/jquery.flot.stack.min.js',
        '/js/plugin/flot/jquery.flot.time.min.js',
        '/js/plugin/flot/jquery.flot.axislabels.js',
      ],
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
      ['/js/plugin/clockpicker/clockpicker.min.js'],
    ],
  })
}
