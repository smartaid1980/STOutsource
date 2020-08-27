export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.reportTable = createReportTable({
        $tableElement: $('#table'),
        $tableWidget: $('#table-widget'),
        rightColumn: [5, 6, 7],
      })

      servkit.initDatePicker(context.$date)
      servkit.initSelectWithList(
        _.keys(context.preCon.getDepartMachineList),
        context.$depart
      )

      context.$depart
        .on('change', function () {
          var departMachines = {}
          _.each(
            context.preCon.getDepartMachineList[context.$depart.val()],
            function (id) {
              departMachines[id] = servkit.getMachineName(id)
            }
          )
          console.log(departMachines)
          servkit.initSelectWithList(departMachines, context.$machineSelect)
        })
        .change()

      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()
        context.loadingBtn.doing()

        //拿資料
        context.getDbData()
        context.getData()
        //拿班次
        context.getWorkShift()
        //畫表畫圖
        servkit
          .politeCheck()
          .until(function () {
            return (
              context.workShift && context.statusHistory && context.daily_report
            )
          })
          .thenDo(function () {
            context.preProcessData()
            context.preProcessDbData()
            context.reportTable.drawTable(context.tableObj)
            context.drawChart()
            context.loadingBtn.done()
          })
          .tryDuration(0)
          .start()
      })

      $('#showdemo').on('click', function (e) {
        e.preventDefault()
        // context.$date.val('2016/07/31');
        context.$date.val('2016/10/11')
        context.$depart.val('VERTICAL').change()
        // context.$machineSelect.val(["NC-09", "NC-47", "NC-55"]);
        context.$machineSelect.val(['NC-24', 'NC-25'])
        context.$submitBtn.trigger('click')
      })
    },
    util: {
      $date: $('#date'),
      $depart: $('#depart'),
      $machineSelect: $('#device'),
      $stackChart: $('#stack-chart'),
      $submitBtn: $('#submit'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit')),
      workShift: {},
      statusHistory: [],
      daily_report: [],
      MESPlotObj: {},
      plotObj: [],
      tableObj: [],
      reportTable: undefined,
      plots: [],
      MESPlot: [],
      isFirstTime: true,
      timeThreshold: 3000, //資料之間間隔多少才算離線
      idleThreshold: 30 * 60 * 1000, //前一筆與下一筆產編相同的加工狀態閒置超過多少
      getWorkShift: function () {
        var context = this
        var date = context.$date.val().replace(/\//g, '')
        context.workShift = undefined
        servkit.ajax(
          {
            url: 'api/workshift/byDateInterval',
            type: 'GET',
            data: {
              startDate: date,
              endDate: date,
            },
          },
          {
            success: function (data) {
              //data="20160401": [{"start": "2016/04/01 08:00:00","sequence": 1,"name": "早班","end": "2016/04/01 16:59:59"},{}], ...
              //先都不管日吧...
              context.workShift = _.flatten(_.toArray(data))
            },
          }
        )
      },
      //MES
      getDbData: function () {
        var context = this
        servkit.ajax(
          {
            url: 'api/getdata/db',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_aerowin_daily_report',
              columns: [
                'shift_date',
                'machine_id',
                'emp_id',
                'emp_name',
                'work_id',
                'cus_pro',
                'complete_pct',
                'time_begin_m',
                'time_end_m',
              ],
              whereClause:
                "shift_date = '" +
                context.$date.val() +
                "' AND " +
                "machine_id in ('" +
                context.$machineSelect.val().join("', '") +
                "') AND " +
                'time_begin_m < time_end_m ' +
                'order by time_begin_m',
            }),
          },
          {
            success: function (data) {
              console.log(data)
              context.daily_report = data
            },
          }
        )
      },
      //hippo
      getData: function () {
        var machineMap = {
          'NC-15': '_AEROWIN17D01M01',
          'NC-24': '_AEROWIN17D01M02',
          'NC-25': '_AEROWIN17D01M03',
          'NC-26': '_AEROWIN17D01M04',
          'NC-32': '_AEROWIN17D01M05',
          'NC-33': '_AEROWIN17D01M06',
          'NC-36': '_AEROWIN17D01M07',
          'NC-42': '_AEROWIN17D01M08',
          'NC-47': '_AEROWIN17D01M09',
          'NC-48': '_AEROWIN17D01M10',
          'NC-28': '_AEROWIN17D01M11',
          'NC-34': '_AEROWIN17D01M12',
          'NC-39': '_AEROWIN17D01M13',
          'NC-40': '_AEROWIN17D01M14',
          'NC-55': '_AEROWIN17D01M15',
          'NC-43': '_AEROWIN17D01M16',
          'NC-44': '_AEROWIN17D01M17',
          'NC-45': '_AEROWIN17D01M18',
          'NC-46': '_AEROWIN17D01M19',
          'NC-49': '_AEROWIN17D01M20',
          'NC-53': '_AEROWIN17D01M21',
          'NC-54': '_AEROWIN17D01M22',
        }
        var invert = _.invert(machineMap)
        var context = this
        context.statusHistory = undefined
        hippo
          .newSimpleExhaler()
          .space('machine_status_history_for_aerowin')
          .index(
            'machine_id',
            _.map(context.$machineSelect.val(), function (elem) {
              return machineMap[elem] || ''
            })
          )
          .indexRange('date', context.$date.val(), context.$date.val())
          .columns(
            'machine_id',
            'status',
            'start_time',
            'end_time',
            'alarm_code',
            'duration',
            'cnc_brand',
            'program_index',
            'program_name',
            'op',
            'total_spindle_current',
            'count_spindle_current',
            'max_spindle_current'
          )
          .exhale(function (exhalable) {
            context.statusHistory = exhalable.exhalable.map(function (elem) {
              elem.machine_id = invert[elem.machine_id]
              return elem
            })
          })
      },
      preProcessDbData: function () {
        var context = this
        var machineGroupData = _.groupBy(context.daily_report, 'machine_id')
        var scheduleStartTime = _.first(context.workShift).start
        var scheduleEndTime = _.last(context.workShift).end
        var lastEndTime = scheduleStartTime //將上一筆資料的結束時間預設為班次開始時間

        context.MESPlotObj = {}

        if (context.daily_report && context.daily_report.length) {
          _.each(machineGroupData, function (machineData, machineId) {
            context.MESPlotObj[machineId] = []

            _.each(machineData, function (elem, index) {
              //第一筆且不是從班次時間開始，補空白
              if (
                index == 0 &&
                moment(elem.time_begin_m) - moment(scheduleStartTime) != 0
              ) {
                context.MESPlotObj[machineId].push({
                  label: '',
                  data: [
                    [moment(elem.time_begin_m) - moment(scheduleStartTime), 0],
                  ],
                  MESData: elem,
                  color: servkit.statusColors.offline,
                })
              } //補空白
              else if (moment(elem.time_begin_m) - moment(lastEndTime) != 0) {
                context.MESPlotObj[machineId].push({
                  label: '',
                  data: [[moment(elem.time_begin_m) - moment(lastEndTime), 0]],
                  MESData: elem,
                  color: servkit.statusColors.offline,
                })
              }

              context.MESPlotObj[machineId].push({
                label:
                  moment(elem.time_begin_m).format('YYYY/MM/DD HH:mm:ss') +
                  ' ~ ' +
                  moment(elem.time_end_m).format('YYYY/MM/DD HH:mm:ss') +
                  '<br>' +
                  [elem.emp_id, elem.emp_name, elem.work_id].join(' ') +
                  '<br>' +
                  [
                    elem.cus_pro,
                    '進度: ' + (elem.complete_pct * 100).toFixed(2) + '%',
                  ].join(' '),
                data: [
                  [moment(elem.time_end_m) - moment(elem.time_begin_m), 0],
                ],
                MESData: elem,
                color: servkit.colors.purple,
              })

              lastEndTime = elem.time_end_m

              //最後一筆且結束時間不是班次結束
              if (
                index == machineData.length - 1 &&
                moment(scheduleEndTime) - moment(elem.time_end_m) != 0
              ) {
                context.MESPlotObj[machineId].push({
                  label: '',
                  data: [
                    [moment(scheduleEndTime) - moment(elem.time_end_m), 0],
                  ],
                  MESData: elem,
                  color: servkit.statusColors.offline,
                })
              }
            })
          })
        }

        console.log(context.MESPlotObj)
      },
      preProcessData: function () {
        var context = this
        //表格與畫圖用的資料
        context.plotObj = []
        context.tableObj = []

        if (context.statusHistory && context.statusHistory.length) {
          //拿開始跟結束是要補頭捕頭尾，如果班次不是連續的話就不適用
          var scheduleStartTime = _.first(this.workShift).start
          var scheduleEndTime = _.last(this.workShift).end
          var lastEndTime = scheduleStartTime //將上一筆資料的結束時間預設為班次開始時間
          var lastDevice, lastCncBrand
          var lastProcessId,
            nextProcessId,
            lastLightId,
            nextLightId,
            lastProductId,
            nextProductId //上下筆產編，若閒置時間<30且前後加工為同一產品，則將此段區間畫為加工(閒置)

          //machine_id, status, start_time, end_time, alarm_code, duration, cnc_brand
          _.each(context.statusHistory, function (elem, index) {
            //真的有這種資料嗎...
            if (
              elem.machine_id == '' ||
              servkit.getMachineLightColor(elem.status) == elem.status
            )
              return true //如果檔案是空的話就執行下一個item

            var obj = {}
            obj.deviceId = elem.machine_id
            obj.deviceName = servkit.getMachineName(elem.machine_id)
            obj.lightId = elem.status
            obj.lightName = servkit.getMachineLightName(elem.status)
            obj.start = elem.start_time.date20BitsToFormatted() //2014/07/27 21:05:11
            obj.end = elem.end_time.date20BitsToFormatted()
            obj.rawTime = elem.duration
            obj.period = elem.duration.millisecondToHHmmss()
            obj.alarmCode =
              elem.alarm_code == '-1' || elem.alarm_code == 'B'
                ? ''
                : elem.alarm_code.replace(/#/g, ',')
            obj.program_index = elem.program_index
            obj.program_name = elem.program_name
            obj.op = elem.op
            obj.total_spindle_current = elem.total_spindle_current
            obj.count_spindle_current = elem.count_spindle_current
            obj.max_spindle_current = elem.max_spindle_current
            if (context.preCon.getCncAlarmCodeMap[elem.cnc_brand]) {
              if (
                context.preCon.getCncAlarmCodeMap[elem.cnc_brand][obj.alarmCode]
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

            //所有資料的第一筆，補上第一筆資料到班次開始時間的離線資料
            if (obj.deviceId != lastDevice && !lastDevice) {
              if (obj.start != lastEndTime)
                context.createDummyObj(
                  obj.deviceId,
                  elem.cnc_brand,
                  scheduleStartTime,
                  obj.start
                )
            } //換了機台，補上前一台機台的最後一筆(最後一個狀態到班次結束時間的資料)和這一台機台的第一筆(第一個狀態到班次開始時間的資料)
            else if (obj.deviceId != lastDevice && lastDevice) {
              //補上前一台機台的最後一筆
              context.createDummyObj(
                lastDevice,
                lastCncBrand,
                lastEndTime,
                scheduleEndTime
              )
              //補上這一台機台的第一筆資料, 開始時間為前一個狀態的結束時間, 結束時間為下一個狀態的開始時間
              context.createDummyObj(
                obj.deviceId,
                elem.cnc_brand,
                scheduleStartTime,
                obj.start
              )
            } //同機台中有漏資料的話補上
            else if (
              context.getRawTime(obj.start, obj.end) > context.timeThreshold
            ) {
              //開始時間為前一個狀態的結束時間, 結束時間為下一個狀態的開始時間
              //            console.log("gap from: " + lastEndTime + " to: " + obj.start);
              context.createDummyObj(
                obj.deviceId,
                elem.cnc_brand,
                lastEndTime,
                obj.start
              )
            }

            lastDevice = obj.deviceId
            lastEndTime = obj.end
            lastCncBrand = elem.cnc_brand

            if (obj.rawTime) {
              context.plotObj.push(obj)
              //machine_id, cnc_brand, status, alarm_code, alarm_status, start_time, end_time, duration
              context.tableObj.push([
                obj.deviceName,
                elem.cnc_brand,
                obj.lightName,
                obj.alarmCode,
                obj.alarmStatus,
                obj.start,
                obj.end,
                obj.period,
              ])
            }
          })

          //補上最後一台機台最後一筆資料
          context.createDummyObj(
            lastDevice,
            lastCncBrand,
            lastEndTime,
            scheduleEndTime
          )
        } else {
          //沒有device status history的資料還是要畫MES的圖
          context.drawChart()
        }
      },
      getRawTime: function (start, end) {
        return (
          moment(end, 'YYYY/MM/DD HH:mm:ss') -
          moment(start, 'YYYY/MM/DD HH:mm:ss')
        )
      },
      createDummyObj: function (deviceId, cnc_brand, start, end) {
        var rawTime = this.getRawTime(start, end)
        if (rawTime > this.timeThreshold) {
          var leakObj = {}
          leakObj.deviceId = deviceId
          leakObj.deviceName = servkit.getMachineName(deviceId)
          leakObj.lightId = '0' //機台無資料視同離線
          leakObj.lightName = servkit.getMachineLightName('0')
          leakObj.alarmCode = ''
          leakObj.alarmStatus = ''
          leakObj.start = start //開始時間為班次開始時間
          leakObj.end = end //結束時間為下一個狀態的開始時間
          leakObj.rawTime = rawTime
          leakObj.period = rawTime.millisecondToHHmmss()
          this.plotObj.push(leakObj)
          // if ($.inArray("0", formJSON.status) !== -1)
          this.tableObj.push([
            leakObj.deviceName,
            cnc_brand,
            leakObj.lightName,
            leakObj.alarmCode,
            leakObj.alarmStatus,
            leakObj.start,
            leakObj.end,
            leakObj.period,
          ])
        }
      },
      drawChart: function () {
        this.$stackChart.html('')
        var context = this
        var dataSetList = {} //dataSetList = {machineId: [dataSet, dataSet, dataSet ...], ...}
        context.plots = []
        context.MESPlot = []
        var groupedPlotObj = _.groupBy(context.plotObj, 'deviceId')
        var plotMachineList = _.keys(groupedPlotObj)

        _.each(context.$machineSelect.val(), function (deviceId) {
          //有機聯網
          if (_.contains(plotMachineList, deviceId)) {
            var lastElem = {}
            var dataSet = []
            _.each(groupedPlotObj[deviceId], function (elem) {
              var lightId = elem.lightId
              //如果前後筆資料狀態相同
              if (lastElem.lightId && lastElem.lightId == lightId) {
                dataSet.pop() //去除前一個，因為要跟這筆合併
                elem.start = lastElem.start
              }
              var start = elem.start
              var end = elem.end
              var rawTime = context.getRawTime(start, end)
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
                myData: elem,
                color: servkit.getMachineLightColor(lightId),
              }
              lastElem = elem

              dataSet.push(obj)
            })
            dataSetList[deviceId] = dataSet
          }

          context.growStackBar(dataSetList[deviceId], deviceId)
        })

        redrawToolTip()

        $(window)
          .on('resize', redrawToolTip)
          .on('hashchange', function hashChange(evt) {
            $(window).off('resize')
            $(window).off('hashchange', hashChange)
          })
        context.isFirstTime = false
        setTimeout(function () {
          $('[data-toggle=tooltip]').tooltip({ html: true })
        }, 200)

        function redrawToolTip() {
          console.log('redrawToolTip')

          $('.valueLables').remove()
          _.each(context.MESPlot, function (plot) {
            var divPos = plot.offset()
            _.each(plot.getData(), function (plotData, index) {
              if (plotData.label !== '') {
                var MESinfo =
                  [
                    plotData.MESData.emp_id,
                    plotData.MESData.emp_name,
                    plotData.MESData.work_id,
                  ].join(' ') +
                  '<br>' +
                  [
                    plotData.MESData.cus_pro,
                    '進度: ' +
                      (plotData.MESData.complete_pct * 100).toFixed(2) +
                      '%',
                  ].join(' ')
                $(
                  '<div class="valueLables text-center" data-toggle="tooltip" title="' +
                    plotData.label +
                    '">' +
                    MESinfo +
                    '</div>'
                )
                  .css({
                    'font-size': 12,
                    'position': 'absolute',
                    'top': divPos.top + 15 + 'px',
                    'left':
                      plot.p2c({
                        x: plotData.datapoints.points[2],
                        y: 0.7,
                      }).left +
                      divPos.left +
                      10 +
                      'px',
                    'padding': '5px 0px',
                    'background-color': '#fee',
                    'opacity': 0.8,
                    'z-index': 800,
                  })
                  .appendTo('body')
                  .fadeIn(200)
              }
            })
          })
          _.each(context.plots, function (plot) {
            var divPos = plot.offset()
            var lastPgIndex = ''
            var pgBorderObj = {}
            var content,
              count = 0,
              sum = 0,
              max = 0
            _.each(plot.getData(), function (plotData, index) {
              //同一個加工程式用藍框框在一起
              var pgIndex = plotData.myData.program_index
                ? plotData.myData.program_index
                : lastPgIndex
              var pos = plot.p2c({
                x: plotData.datapoints.points[2],
                y: 0,
              }) //plotData.datapoints.points = [x(n), y(n), x(n-1)]
              if (lastPgIndex === '') {
                pgBorderObj.top = divPos.top
                pgBorderObj.left = pos.left + divPos.left
              } else if (pgIndex && pgIndex != lastPgIndex) {
                //換了加工程式
                content =
                  (pgBorderObj.myData.program_name || '---') +
                  '<br>' +
                  (pgBorderObj.myData.op == 'null'
                    ? '---'
                    : pgBorderObj.myData.op) +
                  '<br>' +
                  'AVG:' +
                  (count == 0 ? '0.00' : (sum / count).toFixed(2)) +
                  '% MAX:' +
                  max +
                  '%'
                //              pgBorderObj.paddingY = 5;//plot.height() / 2; //兩行:34 三行:51
                //              pgBorderObj.paddingX = (pos.left + divPos.left - pgBorderObj.left) / 2; //因為padding 是兩邊總長，所以要除以2
                pgBorderObj.width = pos.left + divPos.left - pgBorderObj.left
                renderPgBorder(pgBorderObj, content)

                pgBorderObj.top = divPos.top
                pgBorderObj.left = pos.left + divPos.left
                count = 0
                sum = 0
                max = 0
              } else if (index == plot.getData().length - 1) {
                //最後一個
                count += plotData.myData.count_spindle_current || 0
                sum += plotData.myData.total_spindle_current || 0
                max =
                  plotData.myData.max_spindle_current > max
                    ? plotData.myData.max_spindle_current
                    : max
                content =
                  (pgBorderObj.myData.program_name || '---') +
                  '<br>' +
                  (pgBorderObj.myData.op == 'null'
                    ? '---'
                    : pgBorderObj.myData.op) +
                  '<br>' +
                  'AVG:' +
                  (count == 0 ? '0.00' : (sum / count).toFixed(2)) +
                  '% MAX:' +
                  max +
                  '%'
                //              pgBorderObj.paddingY = 5;//plot.height() / 2;
                //              pgBorderObj.paddingX = (plot.width() + divPos.left - pgBorderObj.left) / 2; //因為padding 是兩邊總長，所以要除以2
                pgBorderObj.width =
                  plot.width() + divPos.left - pgBorderObj.left
                renderPgBorder(pgBorderObj, content)
              }

              pgBorderObj.myData = plotData.myData.program_index
                ? plotData.myData
                : pgBorderObj.myData //如果有program_index就不是createDummy產生的
              count += plotData.myData.count_spindle_current || 0
              sum += plotData.myData.total_spindle_current || 0
              max =
                plotData.myData.max_spindle_current > max
                  ? plotData.myData.max_spindle_current
                  : max
              //程式名稱 OP AVG MAX
              lastPgIndex = pgIndex
              //            // 如果狀態持續時間未超過30分鐘就不show,不然label會疊在一起
              //            if (plotData.data[0][0] > 30 * 60 * 1000) {
              //              var pos = context.isFirstTime ?
              //                  plot.p2c({
              //                    x: plotData.datapoints.points[2],
              //                    y: 0.5
              //                  }) :
              //                  plot.p2c({
              //                    x: plotData.datapoints.points[2],
              //                    y: 0.7
              //                  }); //plotData.datapoints.points = [x(n), y(n), x(n-1)]
              //              showValueLabel(pos.left + divPos.left, pos.top + divPos.top, (plotData.label.split("<br>")[2] || plotData.label.split("<br>")[0].replace("&nbsp", "")));
              //            }
            })
          })
        }

        function renderPgBorder(pgBorderObj, content) {
          var $DOM = $(
            '<div class="valueLables text-center" data-toggle="tooltip" title="' +
              content +
              '">' +
              content +
              '</div>'
          )
            .css({
              'font-size': 12,
              'position': 'absolute',
              'top': pgBorderObj.top,
              'left': pgBorderObj.left,
              'border': '2px solid blue',
              // 'padding': pgBorderObj.paddingY + 'px ' + pgBorderObj.paddingX + 'px',
              //          'padding': pgBorderObj.paddingY + 'px 0px',
              'padding': '5px 0px',
              'white-space': 'nowrap',
              'overflow': 'hidden',
              'width': pgBorderObj.width + 'px',
              //          'background-color': '#fee',
              //          'opacity': 0.80,
              'z-index': 800,
            })
            .appendTo('body')
            .fadeIn(200)

          //        if (pgBorderObj.paddingX - $DOM.width() / 2 < 0) {
          //          $DOM.text("").css({"padding": '31.5px 0px'});
          //        } else {
          //          $DOM.css({"padding": '5px 0px'});
          //        }
        }
      },
      growStackBar: function (dataSet, deviceId) {
        var context = this
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
            tickSize: [1, 'hour'], //沒有的話會變兩個小時一格
            tickFormatter: function (v, axis) {
              //沒有的話會從格林威治時間開始
              //            var date = new Date(new Date(v).getTime() + new Date().getTimezoneOffset() * 60 * 1000);
              var date = new Date(
                new Date(_.first(context.workShift).start).getTime() + v
              )

              var hours =
                date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
              var minutes =
                date.getMinutes() < 10
                  ? '0' + date.getMinutes()
                  : date.getMinutes()

              return hours + ':' + minutes
            },
          },
          yaxis: {
            ticks: [[0.5, servkit.getMachineName(deviceId)]],
          },
          grid: {
            hoverable: true,
            clickable: true,
          },
          legend: {
            show: false,
          },
          tooltip: true,
          tooltipOpts: {
            content: '%s',
            defaultTheme: false,
          },
        }

        if ($('#content').width() < 800) option.xaxis.tickSize = [2, 'hour']

        //device status history
        if (dataSet) {
          var $placeholder = $(
            "<div style='width:100%;height:100px;'></div>"
          ).attr('id', deviceId)
          context.$stackChart.append($placeholder)
          context.plots.push($.plot($placeholder, dataSet, option))
        }

        //MES
        if (context.MESPlotObj[deviceId]) {
          var $MESBar = $("<div style='width:100%;height:100px;'></div>").attr(
            'id',
            deviceId + '_MES'
          )
          context.$stackChart.append($MESBar)
          context.MESPlot.push(
            $.plot($MESBar, context.MESPlotObj[deviceId], option)
          )
        }
        //      _.each(context.MESPlotObj[deviceId], function (empPlotObj, emp_id) {
        //        var $MESBar = $("<div style='width:100%;height:100px;'></div>").attr("id", emp_id);
        //        context.$stackChart.append($MESBar);
        //        context.MESPlot.push($.plot($MESBar, empPlotObj, option));
        //      });
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
      getDepartMachineList: function (done) {
        servkit.ajax(
          {
            url: 'api/aerowin/departmachine/read',
            type: 'GET',
            contentType: 'application/json',
          },
          {
            success: function (data) {
              var departMachineMap = {}
              _.each(data, function (elem) {
                if (!departMachineMap[elem.depart_id]) {
                  departMachineMap[elem.depart_id] = []
                }
                departMachineMap[elem.depart_id].push(elem.machine_id)
              })
              done(departMachineMap)
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
    ],
  })
}
