export default function () {
  $('body').removeClass('fixed-page-footer').removeClass('fixed-ribbon')

  GoGoAppFun({
    gogo(ctx) {
      ctx.today = moment().format('YYYY/MM/DD')
      ctx.weekAgo = moment().subtract(3, 'day').format('YYYY/MM/DD')
      ctx.$stackWidget.append(
        `<p id="date" class="alert alert-success text-center">${ctx.weekAgo} ~ ${ctx.today}</p>`
      )
      ctx.getWorkShift(ctx.weekAgo, ctx.today, () => {
        // 拿資料
        ctx.getHippoData(ctx.weekAgo, ctx.today)
      })
    },
    util: {
      $stackWidget: $('#stack-widget'),
      workShift: {},
      statusHistory: [],
      plotObj: [],
      demoStartDate: '2019/05/04',
      demoEndDate: '2019/05/07',
      timeThreshold:
        servtechConfig.ST_TIMETHRESHOLD == undefined
          ? -1
          : servtechConfig.ST_TIMETHRESHOLD, // 資料之間間隔多少毫秒才算離線
      min: null,
      max: null,
      IOWMDemo(ctx) {
        // 拿班次
        ctx.getWorkShift(ctx.demoStartDate, ctx.demoEndDate, function () {
          // 拿資料
          ctx.getHippoData(ctx.demoStartDate, ctx.demoEndDate)
        })
      },
      getWorkShift: function (start, end, callback) {
        var ctx = this
        ctx.workShift = undefined
        servkit.ajax(
          {
            url: 'api/workshift/byDateInterval',
            type: 'GET',
            data: {
              startDate: start.replace(/\//g, ''),
              endDate: end.replace(/\//g, ''),
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
      getHippoData: function (startDate, endDate) {
        var ctx = this
        ctx.statusHistory = null
        hippo
          .newSimpleExhaler()
          .space('machine_status_history')
          .index('machine_id', servkit.getMachineList())
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
            // 如果是順德工作坊，查無資料或資料都是離線時
            // TODO: 有n個 chunk 就會重複畫 n 次，要想辦法跳出promise，還好順德現在四台只有一個chunk，時間有點趕之後再改
            if (
              servtechConfig.ST_CUSTOMER === 'IOWM' &&
              startDate !== ctx.demoStartDate &&
              endDate !== ctx.demoEndDate &&
              (exhalable.exhalable.length === 0 ||
                _.every(exhalable.exhalable, (obj) => obj.status === 'B'))
            ) {
              $('#date').text(`${ctx.demoStartDate} ~ ${ctx.demoEndDate}`)
              ctx.IOWMDemo(ctx)
            } else {
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
              ctx.preProcessData(historyByMachine)
              ctx.drawChart()
            }
          })
      },
      preProcessData: function (data) {
        var context = this

        if (data) {
          context.min = new Date(_.first(context.workShift).start)
          context.max = new Date(_.last(context.workShift).end)
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
        return $.plot($placeholder, dataSet, option)
      },
      drawChart: function () {
        var ctx = this
        var dataSetList = []
        var dataSet // dataSetList = [dataSet, dataSet, dataSet ...]
        var groupedPlotObj = _.groupBy(ctx.plotObj, 'deviceId')
        var machineList = _.keys(groupedPlotObj)
        if (Object.keys(groupedPlotObj).length) {
          _.each(groupedPlotObj, function (plot) {
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

          var stackName = `stack-chart${
            ctx.$stackWidget.find('[name=bar-chart-title]').length
          }`
          ctx.$stackWidget
            .append(`<div id="${stackName}" class="chart" style="width:98%;height:auto;cursor:pointer;">
                <h6 name="bar-chart-title" align="center">Time ( ${ctx.tickFormat} )</h6>
              </div>`)

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
    ],
  })
}
