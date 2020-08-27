export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.reportTable = createReportTable({
        $tableElement: $('#table'),
        $tableWidget: $('#table-widget'),
        centerColumn: [0, 1],
        rightColumn: [2],
      })
      servkit.initDatePicker(context.$startDate, context.$endDate)
      servkit.initMachineSelect(context.$machineSelect)

      context.$demoBtn.on('click', function (evt) {
        evt.preventDefault()
        context.sensorDataGet = false //先將sensorDataGet改回false
        context.getFiles()
      })

      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()
        context.$startDate.val('2018/08/01')
        context.$endDate.val('2018/08/01')
        let tableData = []
        let chartData = []
        let timestamp = 1533090278350
        let span = 60000
        context.loadingBtn.doing()
        for (var i = 0; i <= 1000; i++) {
          let data = {}
          var dataArr = []
          data.time = new Date(timestamp + i * span)
          data.ultrasonic = Math.round(Math.random() * 21 + 30)
          dataArr = Object.values(data)
          chartData.push(Object.values(data))
          dataArr.splice(1, 0, context.$machineSelect.val())
          dataArr[0] = context.formatTime(dataArr[0])
          tableData.push(dataArr)
        }
        if (dataArr) {
          context.drawChart(chartData)
          context.reportTable.drawTable(tableData)
          context.loadingBtn.done()
        }
      })
    },
    util: {
      $startDate: $('#startDate'),
      $endDate: $('#endDate'),
      $machineSelect: $('#machine'),
      $dygraph: $('#dygraph'),
      $table: $('#table'),
      $chartWidget: $('#chartWidget'),
      $tableWidget: $('#tableWidget'),
      $submitBtn: $('#submit-btn'),
      $demoBtn: $('#showdemo'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      sensorData: {},
      sensorDataGet: false,
      getFiles: function () {
        var ctx = this
        var startDate = ctx.$startDate.val() + ' 00:00:00'
        var endDate = ctx.$endDate.val() + ' 23:59:59'
        var machineParam = ctx.$machineSelect.val()
        var tableData = []
        var chartData = []

        ctx.loadingBtn.doing()
        ctx.getFileSensor(ctx)

        servkit
          .politeCheck('ultrasonic_sensing')
          .until(function () {
            return ctx.sensorDataGet
          })
          .thenDo(function () {
            _.each(ctx.sensorData, function (elem, time) {
              // ComputerTime 1533090278350
              // standardTime Wed Aug 01 2018 10:24:38 GMT+0800 (台北標準時間)
              var computerTime = new Date(Number(time))
              var standardTime = ctx.formatTime(computerTime)
              if (standardTime >= startDate && standardTime <= endDate) {
                var obj = {
                  id: machineParam,
                  time: computerTime,
                  standardTime: standardTime,
                  sensor: Number(elem.sensor),
                }
                tableData.push([obj.standardTime, obj.id, obj.sensor])
                chartData.push([obj.time, obj.sensor])
              }
            })
            ctx.reportTable.drawTable(tableData)
            ctx.drawChart(chartData)
            ctx.loadingBtn.done()
          })
          .tryDuration(0)
          .start()
      },
      getFileSensor: function (ctx) {
        let machineId = ctx.$machineSelect.val()
        servkit.ajax(
          {
            url: 'api/getdata/file',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              type: 'ultrasonic_sensing',
              pathPattern: machineId + '/{YYYY}{MM}{DD}.csv',
              startDate: ctx.$startDate.val(),
              endDate: ctx.$endDate.val(),
            }),
          },
          function (datas) {
            _.each(datas, function (data) {
              data = _.map(data, function (elem, index) {
                if (index == 0) {
                  return servkit.switchDataFormat(
                    {
                      type: 'time',
                    },
                    elem
                  )
                } else {
                  return elem
                }
              })
              var obj = _.object(['time', 'sensor'], data)
              ctx.sensorData[obj.time] = obj
            })
            ctx.sensorDataGet = true //如有正確取的資料，則改為true
          }
        )
      },
      formatTime: function (time) {
        // time的格式為 Wed Aug 01 2018 10:24:38 GMT+0800 (台北標準時間)
        var year = time.getFullYear()
        var month =
          time.getMonth() + 1 < 10
            ? '0' + (time.getMonth() + 1)
            : time.getMonth() + 1
        var date = time.getDate() < 10 ? '0' + time.getDate() : time.getDate()
        var hour =
          time.getHours() < 10 ? '0' + time.getHours() : time.getHours()
        var min =
          time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes()
        var fullDate = `${year}/${month}/${date} ${hour}:${min}`
        return fullDate
      },
      drawChart: function (queryData) {
        var option = {
          labels: ['時間', 'Ultrasonic'],
          legend: 'always',
          colors: [servkit.colors.blue],
          series: {},
          rollPeriod: 7,
          valueRange: [30, 55],
          axes: {
            y: {
              axisLabelWidth: 60,
            },
          },
          yAxisLabelWidth: 60,
          ylabel: 'Hz',
          showRangeSelector: true,
        }

        option.series['Hz'] = {
          axis: 'y',
        }

        new Dygraph(document.getElementById('dygraph'), queryData, option)
      },
    },
    delayCondition: ['machineList'],
    dependencies: [
      ['/js/plugin/dygraphs/dygraph-combined.min.js'],
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
