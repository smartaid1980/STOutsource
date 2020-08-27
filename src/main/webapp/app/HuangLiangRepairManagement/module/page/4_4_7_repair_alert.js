export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      var datepickerConfig = {
          dateFormat: 'yy/mm/dd',
          prevText: '<i class="fa fa-chevron-left"></i>',
          nextText: '<i class="fa fa-chevron-right"></i>',
        },
        report = createReportTable({
          $tableElement: $('#report-table'),
          onRow: function (row, data) {
            // 故障 -> 通報 超過五分鐘要嗨賴
            if (data[6].localeCompare('00:05:00') > 0) {
              $(row)
                .find('td')
                .eq(6)
                .css({ 'background-color': 'red', 'color': 'white' })
            }

            // 通報 -> 維修 超過 30 分鐘要嗨賴，跟看板一樣
            if (data[10].localeCompare('00:30:00') > 0) {
              $(row)
                .find('td')
                .eq(10)
                .css({ 'background-color': 'red', 'color': 'white' })
            }
          },
          excel: {
            fileName: 'Notify_Record',
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
            ],
          },
        })

      ctx.$startDate
        .datepicker(datepickerConfig)
        .val(moment().format('YYYY/MM/DD'))
      ctx.$endDate
        .datepicker(datepickerConfig)
        .val(moment().format('YYYY/MM/DD'))
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
              var dataMatrix = _.map(datas, function (d) {
                d.care_emp_id = ctx.commons.fillZeroTo5Digit(d.care_emp_id)
                d.act_repair_emp_id = ctx.commons.fillZeroTo5Digit(
                  d.act_repair_emp_id
                )

                return [
                  /* 0.警報發生時間 */ d.alarm_time,
                  /* 1.機台編號 */ servkit.getMachineName(d.machine_id) +
                    ' (' +
                    ctx.commons.priorityText(
                      ctx.preCon.priority[d.machine_id]
                    ) +
                    ')',
                  /* 2.班別 */ d.work_shift,
                  /* 3.顧車人員員編 */ d.care_emp_id,
                  /* 4.顧車人員姓名 */ ctx.preCon.getUserList[d.care_emp_id] ||
                    '---',
                  // /* 故障發生時間 */ d.alarm_time.substring(11),
                  /* 5.故障通報時間 */ d.notify_time === '---'
                    ? d.notify_time
                    : d.notify_time.substring(11) +
                      (d.notify_time.startsWith('2100/01/01')
                        ? '(不正常中斷)'
                        : ''),
                  /* 6.故障→通報時間 */ d.notify_time.startsWith('2100/01/01')
                    ? '---'
                    : ctx.commons.diffTime(d.alarm_time, d.notify_time),
                  /* 7.維修人員員編 */ d.act_repair_emp_id || '---',
                  /* 8.維修人員姓名 */ ctx.preCon.getUserList[
                    d.act_repair_emp_id
                  ] || '---',
                  /* 9.開始維修時間 */ d.start_time === '---'
                    ? d.start_time
                    : d.start_time.substring(11) +
                      (d.start_time.startsWith('2100/01/01')
                        ? '(不正常中斷)'
                        : ''),
                  /* 10.通報→維修時間 */ d.start_time.startsWith('2100/01/01')
                    ? '---'
                    : ctx.commons.diffTime(d.notify_time, d.start_time),
                ]
              })

              report.clearTable()
              report.drawTable(dataMatrix)

              //            // 超過五分鐘要嗨賴
              //            $('#report-table tbody td:nth-child(8)')
              //              .each(function(i, e) {
              //                var comparer = e.textContent.localeCompare('00:05:00');
              //                e.style.backgroundColor = comparer >= 0 ? 'red' : '';
              //                e.style.color = comparer >= 0 ? 'white' : '';
              //              });
              //
              //            // 這個要 30 分鐘，跟看板一樣
              //            $('#report-table tbody td:nth-child(12)')
              //              .each(function(i, e) {
              //                var comparer = e.textContent.localeCompare('00:30:00');
              //                e.style.backgroundColor = comparer >= 0 ? 'red' : '';
              //                e.style.color = comparer >= 0 ? 'white' : '';
              //              });
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
      getUserList: function (done) {
        this.commons.getUserList(done)
      },
      priority: function (done) {
        this.commons.getPriority(done)
      },
    },
  })
}
