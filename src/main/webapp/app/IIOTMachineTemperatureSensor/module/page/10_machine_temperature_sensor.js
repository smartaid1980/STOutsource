import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.reportTable = createReportTable({
        $tableElement: $('#table'),
        $tableWidget: $('#table-widget'),
        centerColumn: [0, 1],
        rightColumn: [2, 3, 4],
      })
      servkit.initDatePicker(context.$startDate, context.$endDate)
      servkit.initMachineSelect(context.$machineSelect)

      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()
        let timestamp = 1535299200000
        let span = 10000
        let tableData = []
        let chartData = []
        context.loadingBtn.doing()

        for (let i = 0; i < 1000; i++) {
          let data = {}
          let t = timestamp + i * span
          let dataArr = []
          data.time = new Date(t)
          data.temperature_1 = Math.round(Math.random() * 5 * 10) / 10 + 30
          data.temperature_2 = Math.round(Math.random() * 8 * 10) / 10 + 35
          data.temperature_3 = Math.round(Math.random() * 2 * 10) / 10 + 25
          dataArr = Object.values(data)
          chartData.push(Object.values(data))

          dataArr.splice(1, 0, context.$machineSelect.val())
          dataArr[0] = context.formatTime(dataArr[0])

          tableData.push(dataArr)
        }
        // console.log(chartData)
        // console.log(tableData)
        context.drawChart(chartData)
        context.reportTable.drawTable(tableData)
        context.loadingBtn.done()
      })

      context.$demoBtn.on('click', function (evt) {
        evt.preventDefault()
        context.$startDate.val('2018/07/01')
        context.$endDate.val('2018/07/01')
        context.getFiles()
      })
    },
    util: {
      $startDate: $('#startDate'),
      $endDate: $('#endDate'),
      $machineSelect: $('#machine'),
      $powerSelect: $('#power'),
      $cncSelect: $('#cnc'),
      $dygraph: $('#dygraph'),
      $table: $('#table'),
      $chartWidget: $('#chartWidget'),
      $tableWidget: $('#tableWidget'),
      $submitBtn: $('#submit-btn'),
      $demoBtn: $('#showdemo'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      powerData: {},
      cncData: {},
      sensorData1: {},
      sensorData2: {},
      sensorData3: {},
      tempDataGet: [false, false, false],
      getFiles: function () {
        var ctx = this
        var tableData = []
        var chartData = []

        ctx.loadingBtn.doing()
        ctx.getFileSensor(ctx, 1)
        ctx.getFileSensor(ctx, 2)
        ctx.getFileSensor(ctx, 3)

        servkit
          .politeCheck('machine_temperature_sensor')
          .until(function () {
            for (let i = 0; i < ctx.tempDataGet.length; i++) {
              if (!ctx.tempDataGet[i]) return false
            }
            return true
          })
          .thenDo(function () {
            _.each(ctx.sensorData1, function (elem, time) {
              let data = {
                  time: time,
                },
                dataArr = []
              for (let i = 1; i <= 3; i++) {
                data['temperature_' + i] =
                  ctx['sensorData' + i][time].temperature
              }
              dataArr = Object.values(data)
              dataArr.splice(1, 0, ctx.$machineSelect.val())
              tableData.push(dataArr)
              data.time = ctx.formatTime(data.time)
              chartData.push(Object.values(data))
            })
            ctx.reportTable.drawTable(tableData)
            ctx.drawChart(chartData)

            ctx.loadingBtn.done()
          })
          .tryDuration(0)
          .start()
      },
      formatTime: function (time) {
        if (time instanceof Date) {
          let date = '',
            StrTime = ''

          date =
            time.getFullYear() +
            '/' +
            ('0' + (time.getMonth() + 1)).slice(-2) +
            '/' +
            ('0' + time.getDate()).slice(-2)
          StrTime =
            ('0' + time.getHours()).slice(-2) +
            ':' +
            ('0' + time.getMinutes()).slice(-2) +
            ':' +
            ('0' + time.getSeconds()).slice(-2)
          return date + ' ' + StrTime
        } else {
          let timeArr = time.slice(0, -3).split(' ')
          timeArr = timeArr.map((x, i) => {
            if (i === 0) return x.split('/')
            else return x.split(':')
          })
          timeArr = timeArr[0].concat(timeArr[1])
          return new Date(...timeArr)
        }
      },
      getFileSensor: function (ctx, sensorNum) {
        let machineId = ctx.$machineSelect.val(),
          sensor = 'sensor' + sensorNum

        servkit.ajax(
          {
            url: 'api/getdata/file',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              type: 'machine_temperature_sensor',
              pathPattern: machineId + '/' + sensor + '/{YYYY}{MM}{DD}.csv',
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
                  return parseFloat(elem).toFixed(1)
                }
              })
              var obj = _.object(['time', 'temperature'], data)
              ctx['sensorData' + sensorNum][obj.time] = obj
            })
            ctx.tempDataGet[sensorNum - 1] = true
          }
        )
      },
      drawChart: function (queryData) {
        var option = {
          labels: [`${i18n('Time')}`, '溫感器1', '溫感器2', '溫感器3'],
          legend: 'always',
          colors: [
            servkit.colors.green,
            servkit.colors.blue,
            servkit.colors.red,
          ],
          series: {},
          axes: {
            y: {},
          },
          yAxisLabelWidth: 60,
          ylabel: '溫度(℃)',
          showRangeSelector: true,
        }

        option.series['溫度(℃)'] = {
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
