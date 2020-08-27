export default function () {
  GoGoAppFun({
    gogo: function (context) {
      if (context.isGraced) {
        context.machineID = context.graceParam.machineId
        var machineData = context.graceParam.data
        context.dataLength = machineData.length
        var treatedData = context.treatedData(machineData)
        context.subCharts.push({
          chart: context.commons.smallLineChart(
            '運行電流',
            'electric',
            'updating-chart',
            [treatedData.electric, treatedData.timestamp]
          ),
          type: 'electric',
        })
        context.subscribe()
      } else {
        context.machineID = '_DIGIFAC00026D01M01'
        context.subscribe()
        context.subCharts.push({
          chart: context.commons.smallLineChart(
            '運行電流',
            'electric',
            'updating-chart'
          ),
          type: 'electric',
        })
      }
    },
    util: {
      dateFormat: 'HH:mm:ss',
      $listBox: $('#list_box'),
      machineID: '',
      preTimes: 0,
      preTimestamp: '',
      subCharts: [],
      easyPieCharts: {},
      dataLength: 0,
      subscribe: function () {
        var context = this
        servkit.subscribe('js_old_machine', {
          machines: context.machineID,
          handler: function (data) {
            var value = data[context.machineID]
            if (
              context.preTimestamp !==
              moment(value.timestamp).format(context.dateFormat)
            ) {
              // console.log(context.preTimestamp, moment(value.timestamp).format(context.dateFormat));
              context.preTimes += value.times
              context.preTimestamp = moment(value.timestamp).format(
                context.dateFormat
              )
              value.times = context.preTimes
              value.timestamp = context.preTimestamp
              context.updatePanel(value)
            }
          },
          noDataHandler: function () {
            console.log('No Data')
          },
        })
      },
      getStatusClass: function (status) {
        switch (status) {
          case '-1':
            return 'panel-heading offline'
          case '11':
            return 'panel-heading online'
          case '12':
            return 'panel-heading idle'
          case '13':
            return 'panel-heading alarm'
        }
      },
      _safePlus: function (elemValue, objValue) {
        return isNaN(parseFloat(elemValue))
          ? objValue
          : parseFloat(elemValue) + parseFloat(objValue)
      },
      updatePanel: function (data) {
        var context = this
        if (context.subCharts.length > 0) {
          _.each(context.subCharts, (chart) => {
            chart.chart.addData([data[chart.type]], data.timestamp)
            if (context.dataLength > 25) chart.chart.removeData()
          })
          context.dataLength += 1
        }
      },
      treatedData: function (data) {
        var context = this
        var result = {
          timestamp: [],
          status: [],
          electric: [],
          temperature: [],
          times: [],
        }
        _.each(data, (value) => {
          context.preTimes += value.times
          context.preTimestamp = moment(
            value.timestamp,
            'YYYY/MM/DD HH:mm:ss'
          ).format(context.dateFormat)
          result.timestamp.push(context.preTimestamp)
          result.status.push(value.status)
          result.electric.push(value.electric)
          result.temperature.push(value.temperature)
          result.times.push(context.preTimes)
        })
        return result
      },
    },
    preCondition: {
      getMachine: function (done) {
        servkit.ajax(
          {
            url: 'api/machine/read',
            type: 'GET',
          },
          {
            success: function (data) {
              done(data)
            },
          }
        )
      },
    },
    delayCondition: ['machineList'],
    dependencies: [
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
        '/js/plugin/chartjs/chart.min.js',
      ],
      [
        '/js/plugin/easy-pie-chart/jquery.easy-pie-chart.min.js',
        '/js/plugin/flot/jquery.flot.cust.min.js',
        '/js/plugin/flot/jquery.flot.resize.min.js',
        '/js/plugin/flot/jquery.flot.fillbetween.min.js',
        '/js/plugin/flot/jquery.flot.pie.min.js',
        '/js/plugin/flot/jquery.flot.tooltip.min.js',
        '/js/plugin/flot/jquery.flot.time.min.js',
        '/js/plugin/flot/jquery.flot.axislabels.js',
      ],
    ],
  })
}
