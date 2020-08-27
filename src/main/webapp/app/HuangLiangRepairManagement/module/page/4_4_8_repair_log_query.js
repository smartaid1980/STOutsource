export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      var report = createReportTable({
        $tableElement: $('#report-table'),
        excel: {
          fileName: 'Repair_Record',
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
          ],
        },
      })

      servkit.initDatePicker(ctx.$startDate, ctx.$endDate)
      servkit.initMachineSelect(ctx.$machineSelect)

      ctx.$submitBtn.on('click', function (evt) {
        evt.preventDefault()
        servkit.ajax(
          {
            url: 'api/huangliang/repair/read',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              startDate: ctx.$startDate.val(),
              endDate: ctx.$endDate.val(),
              machineIds: ctx.$machineSelect.val() || [],
            }),
          },
          {
            success: function (datas) {
              // alarm_code:"1234"
              // alarm_time:"2016/08/09 16:48:28"
              // care_emp_id:"user"
              // end_time:"---"
              // machine_id:"CNC3"
              // notify_time:"---"
              // repair_status:Array[0]
              // start_time:"---"
              // work_shift:"B"
              // act_repair_emp_id: "maybe undefined"
              var dataMatrix = []
              _.each(datas, function (d) {
                if (d.notify_time !== '---') {
                  var pauseTime = ctx.pauseTimeAccumulate(d)
                  d.act_repair_emp_id = ctx.commons.fillZeroTo5Digit(
                    d.act_repair_emp_id
                  )
                  dataMatrix.push([
                    /* 故障通報時間 */ d.notify_time,
                    /* 機台編號 */ servkit.getMachineName(d.machine_id) +
                      ' (' +
                      ctx.commons.priorityText(
                        ctx.preCon.priority[d.machine_id]
                      ) +
                      ')',
                    /* 班別 */ d.work_shift,
                    /* 維修人員員編 */ d.act_repair_emp_id || '---',
                    /* 維修人員姓名 */ ctx.preCon.empTable[
                      d.act_repair_emp_id
                    ] || '---',
                    /* 派工時間 */ d.dispatch_time === '---'
                      ? d.dispatch_time
                      : d.dispatch_time.substring(11),
                    /* 維修起始時間 */ d.start_time === '---'
                      ? d.start_time
                      : d.start_time.substring(11),
                    /* 維修結束時間 */ d.end_time === '---'
                      ? d.end_time
                      : d.end_time.substring(11),
                    /* 暫停時間 */ moment.utc(pauseTime).format('HH:mm:ss'),
                    /* 累計時間 */ ctx.commons.calcDuration(
                      d.start_time,
                      d.end_time,
                      pauseTime
                    ),
                    /* 故障代碼 */ ctx.alarmCodeView(d.alarm_code),
                    /* 故障代碼說明 */ ctx.alarmNoteView(
                      d.machine_id,
                      d.alarm_code
                    ),
                  ])
                }
              })

              report.clearTable()
              report.drawTable(dataMatrix)
            },
          }
        )
      })
    },

    util: {
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $machineSelect: $('#machine'),
      $submitBtn: $('#submit-btn'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),

      alarmCodeView: function (alarmCode) {
        return alarmCode.replace(/,/g, '</br>')
      },

      alarmNoteView: function (machine_id, alarmCode) {
        var codeArr = alarmCode.split(','),
          ctx = this
        return _.map(codeArr, function (code, i) {
          return ctx.commons.getAlarmDescription(machine_id, code)
        }).join(' |</br>')
      },

      pauseTimeAccumulate: function (data) {
        var pauseStartEnd = [],
          statusArr = data.repair_status

        for (var i = 0; i < statusArr.length; i++) {
          var status = statusArr[i]
          if (status.macro === '215') {
            if (i !== statusArr.length - 1) {
              pauseStartEnd.push({
                start: status.start_time,
                end: statusArr[i + 1].start_time,
              })
            } else {
              pauseStartEnd.push({
                start: status.start_time,
                end: data.end_time,
              })
            }
          }
        }

        var ms = _.reduce(
          pauseStartEnd,
          function (memo, d) {
            var startMoment = moment(d.start, 'YYYY/MM/DD HH:mm:ss'),
              endMoment = moment(d.end, 'YYYY/MM/DD HH:mm:ss')
            return memo + endMoment.diff(startMoment)
          },
          0
        )

        //        return moment.utc(ms).format("HH:mm:ss");
        return ms
      },
    },

    delayCondition: ['machineList'],
    dependencies: [
      '/js/plugin/datatables/jquery.dataTables.min.js',
      '/js/plugin/datatables/dataTables.colVis.min.js',
      '/js/plugin/datatables/dataTables.tableTools.min.js',
      '/js/plugin/datatables/dataTables.bootstrap.min.js',
      '/js/plugin/datatable-responsive/datatables.responsive.min.js',
    ],

    preCondition: {
      empTable: function (done) {
        this.commons.getEmpTable(done)
      },
      //      alarmCodeTable: function (done) {
      //        this.commons.getAlarmCodeTable(done);
      //      },
      machineCncTypeMap: function (done) {
        this.commons.machineCncTypeMap(done)
      },
      machineTypeAlarmCodeMap: function (done) {
        this.commons.machineTypeAlarmCodeMap(done)
      },
      priority: function (done) {
        this.commons.getPriority(done)
      },
    },
  })
}
