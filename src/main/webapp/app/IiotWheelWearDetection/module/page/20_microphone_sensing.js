import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
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

      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()

        let timestamp = 1533090278350
        let span = 10000
        let tableData = []
        let chartData = []
        context.loadingBtn.doing()

        for (let i = 0; i < 1000; i++) {
          let data = {}
          let t = timestamp + i * span
          let dataArr = []
          data.time = new Date(t)
          data.sensor = Math.round(Math.random() * 97) + 1

          dataArr = Object.values(data)
          chartData.push(Object.values(data))
          dataArr.splice(1, 0, context.$machineSelect.val())
          dataArr[0] = context.formatTime(dataArr[0])
          tableData.push(dataArr)
        }
        context.drawChart(chartData)
        context.reportTable.drawTable(tableData)
        context.loadingBtn.done()
      })

      context.$demoBtn.on('click', function (evt) {
        evt.preventDefault()
        context.$startDate.val('2018/08/01')
        context.$endDate.val('2018/08/01')
        context.getFiles()
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
          .politeCheck('microphone_sensing')
          .until(function () {
            return ctx.sensorDataGet
          })
          .thenDo(function () {
            _.each(ctx.sensorData, function (elem, time) {
              //  console.log(time)
              //  console.log(Number(time))
              //  ComputerTime是電腦看的數字時間
              //  standardTime是轉換後好看的時間與日期
              var ComputerTime = new Date(Number(time))
              var standardTime = ctx.formatTime(ComputerTime)
              if (standardTime >= startDate && standardTime <= endDate) {
                let data = {
                  time1: ComputerTime,
                  time2: standardTime,
                  id: machineParam,
                  sensor: Number(elem.sensor),
                }
                tableData.push([data.time2, data.id, data.sensor])
                chartData.push([data.time1, data.sensor])
              }
            })
            ctx.reportTable.drawTable(tableData)
            ctx.drawChart(chartData)
            ctx.loadingBtn.done()
          })
          .tryDuration(0)
          .start()
      },
      formatTime: function (time) {
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
      getFileSensor: function (ctx) {
        let machineId = ctx.$machineSelect.val()
        servkit.ajax(
          {
            url: 'api/getdata/file',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              type: 'microphone_sensing',
              pathPattern: machineId + '/' + '/{YYYY}{MM}{DD}.csv',
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
            ctx.sensorDataGet = true
          }
        )
      },
      drawChart: function (queryData) {
        var option = {
          labels: [`${i18n('Time')}`, '麥克風感測器'],
          legend: 'always',
          colors: [servkit.colors.blue],
          series: {},
          axes: {
            y: {
              axisLabelWidth: 60,
            },
          },
          yAxisLabelWidth: 60,
          ylabel: '分貝(dB)',
          showRangeSelector: true,
        }

        option.series['分貝(dB)'] = {
          axis: 'y',
        }

        // new Dygraph(document.getElementById("dygraph"), chartData, option);
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
