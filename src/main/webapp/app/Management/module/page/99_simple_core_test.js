export default function () {
  GoGoAppFun({
    /** TODO
     * 要分辨每一天的以下時間是否一致
     * 無效時間 => alarm time, power time, operate time, cutting time, idle time, offline time
     * 稼動率 =>  power time, operate time, cutting time, idle time
     * 警報履歷 => working time, idle time, alarm time, offline time
     **/
    gogo: function (context) {
      context.init()
      context.reportTable = context.growDataTable()
      $('#submit').on('click', function (e) {
        e.preventDefault()
        context.loadingBtn.doing()
        var selectedDevice = context.$stkReportForm
          .find("[name='device']")
          .val()
        var startDate = context.$startDate.val()
        var endDate = context.$endDate.val()
        // TODO test used
        // selectedDevice = ['_DIGIFAC00026D01M01', '_DIGIFAC00026D01M02'];
        // startDate = '2018/04/01';
        // endDate = '2018/04/12';
        console.log(selectedDevice, startDate, endDate)
        context.reportTable.clearTable()
        context.compareDayData(startDate, endDate, selectedDevice)
      })
    },
    util: {
      columns: {
        date: '',
        machine: '',
        powerTime: 0,
        operationTime: 0,
        idleTime: 0,
        alarmTime: 0,
        offlineTime: 0,
      },
      loadingBtn: servkit.loadingButton(document.querySelector('#submit')),
      $stkReportForm: $('#stk-report-form'),
      $startDate: $(".datepicker[name='startDate']"),
      $endDate: $(".datepicker[name='endDate']"),
      context: this,
      $workOrderTable: $('#work-order-table'),
      init: function () {
        var context = this
        var datepickerConfig = {
          dateFormat: 'yy/mm/dd',
          prevText: '<i class="fa fa-chevron-left"></i>',
          nextText: '<i class="fa fa-chevron-right"></i>',
        }
        context.$startDate
          .datepicker(datepickerConfig)
          .val(moment(new Date()).format('YYYY/MM/DD'))
        context.$endDate
          .datepicker(datepickerConfig)
          .val(moment(new Date()).format('YYYY/MM/DD'))
        // $(".datepicker").datepicker();
        // $(".datepicker[name='endDate']").val(moment().format('YYYY/MM/DD'));
        // $(".datepicker[name='startDate']").val(moment().add(-1, 'days').format('YYYY/MM/DD'));

        servkit.initMachineSelect($('#machine'), true)
      },
      growDataTable: function () {
        var context = this
        var reportTable = createReportTable({
          $tableElement: context.$workOrderTable,
        })
        return reportTable
      },
      getDowntimeAnalysisData: function (
        startDate,
        endDate,
        selectedDevice,
        obServer
      ) {
        var context = this
        hippo
          .newSimpleExhaler()
          .space('fah_product_work')
          .index('machine_id', selectedDevice)
          .indexRange('date', startDate, endDate)
          .columns(
            'machine_id',
            'date',
            'product_id',
            'work_id',
            'power_minute',
            'operate_minute',
            'cutting_minute',
            'idle_minute',
            'start_timestamp',
            'end_timestamp',
            'total_minute',
            'standard_minute',
            'operation_department',
            'operation_device',
            'operation_step',
            'edit_person',
            'macro_idle_minute_array',
            'part'
          )
          .exhale(function (exhalable) {
            var machines = _.groupBy(exhalable.exhalable, (data) => {
              return data.machine_id
            })
            _.each(machines, function (machine, index) {
              var result = new Object()
              Object.assign(result, context.columns)
              result.date = startDate
              result.machine = index
              _.each(machine, (value) => {
                var tempAlarmTime = 0
                value.macro_idle_minute_array
                  .split('!')
                  .forEach(function (elem) {
                    if (elem.split('-')[0] === 'alarm') {
                      tempAlarmTime += parseFloat(elem.split('-')[1])
                    }
                  })
                result.powerTime += value.power_minute
                result.alarmTime += tempAlarmTime
                result.operationTime += value.operate_minute
                result.idleTime += value.idle_minute
                result.offlineTime += value.total_minute - value.power_minute
              })
              obServer.downtimeData.push(result)
            })
            obServer.downtimeAnalysisChk += 1
            obServer.checkFinish()
          })
      },
      getUtilizationData: function (
        startDate,
        endDate,
        selectedDevice,
        obServer
      ) {
        var context = this
        hippo
          .newSimpleExhaler()
          .space('utilization_time_detail')
          .index('machine_id', selectedDevice)
          .indexRange('date', startDate, startDate)
          .columns(
            'machine_id',
            'date',
            'work_shift',
            'program_name',
            'power_millisecond',
            'operate_millisecond',
            'cutting_millisecond',
            'idle_millisecond',
            'alarm_millisecond',
            'work_shift_millisecond',
            'offline_millisecond'
          )
          .exhale(function (exhalable) {
            var machines = _.groupBy(exhalable.exhalable, (data) => {
              return data.machine_id
            })
            _.each(machines, function (machine, index) {
              var result = new Object()
              Object.assign(result, context.columns)
              result.date = startDate
              result.machine = index
              _.each(machine, (value) => {
                result.powerTime += value.power_millisecond
                result.alarmTime += value.alarm_millisecond
                result.operationTime += value.operate_millisecond
                result.idleTime += value.idle_millisecond
                result.offlineTime += value.offline_millisecond
              })
              obServer.utilizationData.push(result)
            })
            obServer.utilizationTimeDetailChk += 1
            obServer.checkFinish()
          })
      },
      getMachineStatusData: function (
        startDate,
        endDate,
        selectedDevice,
        obServer
      ) {
        var context = this
        hippo
          .newSimpleExhaler()
          .space('machine_status_history')
          .index('machine_id', selectedDevice)
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
            var machines = _.groupBy(exhalable.exhalable, (data) => {
              return data.machine_id
            })
            _.each(machines, function (machine, index) {
              var result = new Object()
              Object.assign(result, context.columns)
              result.date = startDate
              result.machine = index
              _.each(machine, (value) => {
                switch (value.status) {
                  case 'B':
                    result.offlineTime += value.duration
                    break
                  case '13':
                    result.alarmTime += value.duration
                    result.powerTime += value.duration
                    break
                  case '12':
                    result.idleTime += value.duration
                    result.powerTime += value.duration
                    break
                  case '11':
                    result.operationTime += value.duration
                    result.powerTime += value.duration
                    break
                }
              })
              obServer.statusData.push(result)
            })
            obServer.machineStatusChk += 1
            obServer.checkFinish()
          })
      },
      compareDayData: function (startDate, endDate, selectedDevice) {
        var context = this
        var days = context.cutDays(startDate, endDate)
        var obServer = context.obServer(days.length, context)
        _.each(days, function (day) {
          context.getMachineStatusData(day, day, selectedDevice, obServer)
          context.getDowntimeAnalysisData(day, day, selectedDevice, obServer)
          context.getUtilizationData(day, day, selectedDevice, obServer)
        })
      },
      cutDays: function (start, end) {
        var diffDays = moment.duration(moment(end).diff(start)).asDays(),
          format = 'YYYY/MM/DD',
          tempStart = moment(start),
          cutDays = []
        cutDays.push(tempStart.format(format).toString())
        for (var i = 0; i < diffDays; i++) {
          tempStart.add(1, 'd')
          cutDays.push(tempStart.format(format).toString())
        }
        return cutDays
      },
      obServer: function (dayNum, context) {
        //觀察者，等hippo 都跑完之後將資料整理成分鐘的格式然後呼叫比較的Function
        return {
          context: context,
          machineStatusChk: 0,
          utilizationTimeDetailChk: 0,
          downtimeAnalysisChk: 0,
          dayNum: dayNum,
          statusData: [],
          utilizationData: [],
          downtimeData: [],
          checkFinish: function () {
            if (
              this.machineStatusChk === this.dayNum &&
              this.utilizationTimeDetailChk === this.dayNum &&
              this.downtimeAnalysisChk === this.dayNum
            ) {
              this.runCompare()
            }
          },
          runCompare: function () {
            var context = this.context
            this.statusData = this.mapMinutes(this.statusData)
            this.utilizationData = this.mapMinutes(this.utilizationData)
            this.downtimeData = _.map(this.downtimeData, (value) => {
              value.powerTime = parseFloat(value.powerTime.toFixed(3))
              value.operationTime = parseFloat(value.operationTime.toFixed(3))
              value.idleTime = parseFloat(value.idleTime.toFixed(3))
              value.alarmTime = parseFloat(value.alarmTime.toFixed(3))
              value.offlineTime = parseFloat(value.offlineTime.toFixed(3))
              return value
            })
            this.statusData = this.groupDateAndMachine(this.statusData)
            this.utilizationData = this.groupDateAndMachine(
              this.utilizationData
            )
            this.downtimeData = this.groupDateAndMachine(this.downtimeData)
            console.log('OBServer', this)
            context.compareAndOutput(
              this.statusData,
              this.utilizationData,
              this.downtimeData
            )
          },
          fixNum: function (num) {
            return (num / 60000).toFixed(3)
          },
          mapMinutes: function (data) {
            return _.map(data, (value) => {
              value.powerTime = parseFloat(this.fixNum(value.powerTime))
              value.operationTime = parseFloat(this.fixNum(value.operationTime))
              value.idleTime = parseFloat(this.fixNum(value.idleTime))
              value.alarmTime = parseFloat(this.fixNum(value.alarmTime))
              value.offlineTime = parseFloat(this.fixNum(value.offlineTime))
              return value
            })
          },
          groupDateAndMachine: function (data) {
            var result = _.groupBy(data, (value) => {
              return value.date + '|' + value.machine
            })
            return result
          },
        }
      },
      compareAndOutput: function (statusData, utilizationData, downtimeData) {
        var context = this
        // <th>Date</th>
        // <th>Machine</th>
        // <th>Power Time</th>
        // <th>Operation Time</th>
        // <th>Idle time</th>
        // <th>Alarm time</th>
        // <th>Offline Time</th>
        var result = _.map(statusData, (value, key) => {
          var utilization = utilizationData[key][0]
          var downtime = downtimeData[key][0]
          var status = value[0]
          result = [status.date, status.machine]
          result.push(
            context.getDataDiff(
              status.powerTime,
              utilization.powerTime,
              downtime.powerTime
            )
          )
          result.push(
            context.getDataDiff(
              status.operationTime,
              utilization.operationTime,
              downtime.operationTime
            )
          )
          result.push(
            context.getDataDiff(
              status.idleTime,
              utilization.idleTime,
              downtime.idleTime
            )
          )
          result.push(
            context.getDataDiff(
              status.alarmTime,
              utilization.alarmTime,
              downtime.alarmTime
            )
          )
          result.push(
            context.getDataDiff(
              status.offlineTime,
              utilization.offlineTime,
              downtime.offlineTime
            )
          )
          return result
        })
        context.reportTable.drawTable(result)
        context.loadingBtn.done()
      },
      getDataDiff: function (status, utilization, downtime) {
        var range = 0.5
        if (
          Math.abs(status - utilization) > range ||
          Math.abs(status - downtime) > range ||
          Math.abs(downtime - utilization) > range
        )
          return (
            '<span style="color:red">' +
            status +
            ',' +
            utilization +
            ',' +
            downtime +
            '</span>'
          )
        return (
          '<span>' + status + ', ' + utilization + ', ' + downtime + '</span>'
        )
      },
    },
    dependencies: [
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatables/jquery.dataTables.rowReordering.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
    ],
  })
}
