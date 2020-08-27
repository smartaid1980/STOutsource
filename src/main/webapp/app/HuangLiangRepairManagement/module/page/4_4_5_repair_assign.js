export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      $('input[type=radio][name=a2]').on('change', function (evt) {
        var url =
          $(this).val() === '1'
            ? 'api/huangliang/repair/notDispatch'
            : 'api/huangliang/repair/notRepair'

        servkit.ajax(
          { url: url, type: 'GET' },
          {
            success: function (datas) {
              ctx.refreshTable(datas)
            },
          }
        )
      })

      ctx.$tableBody.on('click', '.save-btn', function (evt) {
        var machineId = this.getAttribute('data-machine-id'),
          alarmTime = this.getAttribute('data-alarm-time'),
          $this = $(this),
          userSelected = $this.parent().prev().find('select').val(),
          url =
            $('#collapse_query input:checked').val() === '1'
              ? 'api/huangliang/repair/specifyRepairEmp'
              : 'api/huangliang/repair/reSpecifyRepairEmp'

        if (userSelected === ctx.nonSelectVal) {
          alert('請選擇維修人員再進行儲存！')
          return
        }

        servkit.ajax(
          {
            url: url,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              repairRecord: {
                machine_id: machineId,
                alarm_time: alarmTime,
                repair_emp_id: userSelected,
              },
              repairEmpStatus: {
                user_id: userSelected,
                start_time: moment().format('YYYY/MM/DD HH:mm:ss'),
                machine_id: machineId,
                priority: ctx.preCon.priority[machineId],
                alarm_time: alarmTime,
              },
            }),
          },
          {
            success: function () {
              $this.attr('disabled', true).text('已派')
            },
          }
        )
      })

      // 觸發未派工自動查
      $($('input[type=radio][name=a2]')[0]).trigger('change')
    },

    util: {
      $tableBody: $('#collapse_table tbody'),
      nonSelectVal: '---',

      getRepairEmpSelection: function (repairEmpId) {
        return (
          '<select>' +
          '<option value="' +
          this.nonSelectVal +
          '">請選擇</option>' +
          _.map(this.preCon.checkInEmps, function (emp) {
            return (
              '<option value="' +
              emp.user_id +
              '"' +
              (repairEmpId === emp.user_id ? ' selected="selected"' : '') +
              '>' +
              emp.user_name +
              '</option>'
            )
          }).join('') +
          '</select>'
        )
      },

      refreshTable: function (datas) {
        var that = this

        var htmlContent = _.map(datas, function (data) {
          data.care_emp_id = that.commons.fillZeroTo5Digit(data.care_emp_id)
          return (
            '<tr>' +
            '<td>' +
            data.alarm_time.substring(0, 10) +
            '</td>' +
            '<td>' +
            servkit.getMachineName(data.machine_id) +
            ' (' +
            that.commons.priorityText(that.preCon.priority[data.machine_id]) +
            ')' +
            '</td>' +
            '<td>' +
            data.work_shift +
            '</td>' +
            '<td>' +
            data.care_emp_id +
            '</td>' +
            '<td>' +
            (that.preCon.getUserList[data.care_emp_id] || data.care_emp_id) +
            '</td>' +
            '<td>' +
            data.alarm_time.substring(11) +
            '</td>' +
            '<td>' +
            data.notify_time.substring(11) +
            '</td>' +
            '<td>' +
            that.getRepairEmpSelection(data.repair_emp_id) +
            '</td>' +
            '<td>' +
            '<button class="btn btn-primary btn-xs save-btn" ' +
            'data-alarm-time="' +
            data.alarm_time +
            '" ' +
            'data-machine-id="' +
            data.machine_id +
            '">' +
            '儲存</button>' +
            '</td>' +
            '</tr>'
          )
        }).join('')

        if (htmlContent.length === 0) {
          htmlContent =
            '<tr><td colspan="12" style="font-size: 3em; text-align: center;" >沒資料</td></tr>'
        }

        this.$tableBody.html(htmlContent)
      },
    },

    delayCondition: ['machineList'],
    preCondition: {
      checkInEmps: function (done) {
        servkit.ajax(
          {
            url: 'api/huangliang/repairEmpCheckIn/currentEmp',
            type: 'GET',
          },
          {
            success: function (datas) {
              done(datas)
            },
          }
        )
      },
      priority: function (done) {
        this.commons.getPriority(done)
      },
      getUserList: function (done) {
        this.commons.getUserList(done)
      },
    },
  })
}
