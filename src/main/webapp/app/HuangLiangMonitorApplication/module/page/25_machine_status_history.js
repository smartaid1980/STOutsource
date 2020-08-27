export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.reportTable = createReportTable({
        $tableElement: $('#table'),
        $tableWidget: $('#table-widget'),
        rightColumn: [5, 6, 7],
        onDraw: function (tableData, pageData) {
          context.drawChart()
        },
      })

      servkit.initDatePicker(context.$startDate, context.$endDate)
      servkit.initMachineSelect(context.$machineSelect)
      context.$machineSelect.find('option').removeAttr('selected')

      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()
        context.loadingBtn.doing()

        //拿資料
        context.getData(
          context.$startDate.val(),
          context.$endDate.val(),
          context.$machineSelect.val()
        )
        //拿班次
        context.getWorkShift(context.$startDate.val(), context.$endDate.val())
        //畫表畫圖
        servkit
          .politeCheck()
          .until(function () {
            return context.workShift && context.statusHistory
          })
          .thenDo(function () {
            context.preProcessData()
            //            console.log(context.tableObj);
            //            console.log(context.plotObj);
            context.reportTable.drawTable(context.tableObj)
            context.loadingBtn.done()
          })
          .tryDuration(0)
          .start()
      })

      $('#showdemo').on('click', function (e) {
        e.preventDefault()
        context.$startDate.val('2016/04/01')
        context.$endDate.val('2016/04/09')
        context.$machineSelect.val(['CNC1', 'CNC2', 'CNC3'])
        context.$submitBtn.trigger('click')
      })
    },
    util: {
      $startDate: $('#startDate'),
      $endDate: $('#endDate'),
      $machineSelect: $('#device'),
      $stackChart: $('#stack-chart'),
      $submitBtn: $('#submit'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit')),
      workShift: {},
      statusHistory: [],
      plotObj: [],
      tableObj: [],
      reportTable: undefined,
      timeThreshold: 4000, //資料之間間隔多少才算離線(微秒?毫秒吧?)
      getWorkShift: function (startDate, endDate) {
        var context = this
        context.workShift = undefined
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
              //data="20160401": [{"start": "2016/04/01 08:00:00","sequence": 1,"name": "早班","end": "2016/04/01 16:59:59"},{}], ...
              //先都不管日吧...
              context.workShift = _.flatten(_.toArray(data))
            },
          }
        )
      },
      getData: function (startDate, endDate, machineList) {
        var context = this
        context.statusHistory = undefined
        hippo
          .newSimpleExhaler()
          .space('machine_status_history')
          .index('machine_id', machineList)
          .indexRange('date', startDate, endDate)
          .columns(
            'machine_id',
            'status',
            'start_time',
            'end_time',
            'alarm_code',
            'duration',
            'cnc_brand',
            'macro522'
          )
          .exhale(function (exhalable) {
            context.statusHistory = exhalable.exhalable
          })
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

          //machine_id, status, start_time, end_time, alarm_code, duration, cnc_brand
          _.each(context.statusHistory, function (elem, index) {
            elem.status = elem.status == 'B' ? '0' : elem.status
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
            obj.macro522 = elem.macro522
            if (elem.status == 13) {
              obj.alarmCode = elem.alarm_code
              obj.alarmStatus = context.alarmNoteView(
                elem.machine_id,
                elem.alarm_code
              )
            } else {
              obj.alarmCode = ''
              obj.alarmStatus = ''
            }

            if (obj.deviceId != lastDevice && !lastDevice) {
              //所有資料的第一筆，補上第一筆資料到班次開始時間的離線資料

              if (obj.start != lastEndTime)
                context.createDummyObj(
                  obj.deviceId,
                  elem.cnc_brand,
                  scheduleStartTime,
                  obj.start
                )
            } else if (obj.deviceId != lastDevice && lastDevice) {
              //換了機台，補上前一台機台的最後一筆(最後一個狀態到班次結束時間的資料)和下一台機台的第一筆(第一個狀態到班次開始時間的資料)

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
            } else if (
              context.getRawTime(obj.start, obj.end) > context.timeThreshold
            ) {
              //同機台中有漏資料的話補上

              //開始時間為前一個狀態的結束時間, 結束時間為下一個狀態的開始時間
              console.log('gap from: ' + lastEndTime + ' to: ' + obj.start)
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

            //          if (obj.rawTime) {
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
              obj.macro522,
            ])
            //          }
          })

          //補上最後一台機台最後一筆資料
          context.createDummyObj(
            lastDevice,
            lastCncBrand,
            lastEndTime,
            scheduleEndTime
          )
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
            '',
          ])
        }
      },
      growStackBar: function (dataSet, deviceId, tickSize) {
        var context = this
        var $placeholder = $(
          "<div style='width:100%;height:100px;'></div>"
        ).attr('name', 'placeholder')
        this.$stackChart.append($placeholder)
        //var xMin = new Date(dataSet[0].label.split("<br>")[1].split(" ~")[0]).getTime(); //第一筆開始時間的毫秒

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
            tickSize: tickSize, //沒有的話會變兩個小時一格
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

        if (document.body.clientWidth < 800) option.xaxis.tickSize = [2, 'hour']

        return $.plot($placeholder, dataSet, option)
      },
      drawChart: function () {
        this.$stackChart.html('')
        var context = this
        var dataSetList = []
        var dataSet //dataSetList = [dataSet, dataSet, dataSet ...]
        var plots = []
        var groupedPlotObj = _.groupBy(context.plotObj, 'deviceId')
        var machineList = _.keys(groupedPlotObj)

        _.each(groupedPlotObj, function (plot, deviceId) {
          var lastElem = {}
          dataSet = []
          _.each(plot, function (elem) {
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
                offSetPeriod +
                (elem.macro522 ? '<br>' + elem.macro522 : ''),
              data: [[rawTime, 0]],
              color: servkit.getMachineLightColor(lightId),
            }
            lastElem = elem

            dataSet.push(obj)
          })
          dataSetList.push(dataSet)
        })

        //      console.log(dataSetList);

        var tickSize =
          context.$startDate.val() == context.$endDate.val()
            ? [1, 'hour']
            : [1, 'day']
        _.each(dataSetList, function (elem, index) {
          plots.push(context.growStackBar(elem, machineList[index], tickSize))
        })
      },
      alarmNoteView: function (machine_id, alarmCode) {
        var codeArr = alarmCode.split(','),
          context = this
        return _.map(codeArr, function (code, i) {
          return context.commons.getAlarmDescription(machine_id, code)
        }).join(' |</br>')
      },
    },
    delayCondition: ['machineList', 'machineLightList'],
    preCondition: {
      machineCncTypeMap: function (done) {
        this.commons.machineCncTypeMap(done)
      },
      machineTypeAlarmCodeMap: function (done) {
        this.commons.machineTypeAlarmCodeMap(done)
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
