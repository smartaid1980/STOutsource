export default function () {
  GoGoAppFun({
    gogo(context) {
      window.c = context
      context.initQueryConditionForm()
      context.initModal()
      context.initQueryResultTable()
      context.initAffectedScheduleTable()
      context.getDayOff()
    },
    util: {
      $submitBtn: $('#submit-btn'),
      submitLoadingBtn: servkit.loadingButton(
        document.getElementById('submit-btn')
      ),
      $startDateInput: $('#start-date'),
      $endDateInput: $('#end-date'),
      $queryConditionForm: $('#query-condition-form'),
      $queryResultTable: $('#query-result-table'),
      queryResultTable: null,
      initQueryConditionForm() {
        const context = this
        const {
          $submitBtn,
          $queryConditionForm,
          $startDateInput,
          $endDateInput,
        } = context
        const CURR_YEAR = moment().format('YYYY')
        const START_DATE_OF_YEAR = `${CURR_YEAR}/01/01`
        const END_DATE_OF_YEAR = `${CURR_YEAR}/12/31`

        servkit.initDatePicker($startDateInput, $endDateInput)
        $startDateInput.val(START_DATE_OF_YEAR)
        $endDateInput.val(END_DATE_OF_YEAR)

        servkit.validateForm($queryConditionForm, $submitBtn)
        $submitBtn.on('click', function (e) {
          e.preventDefault()
          context.getDayOff()
        })
      },
      initQueryResultTable() {
        const context = this
        const { $queryResultTable } = context

        window.qrt = context.queryResultTable = createReportTable({
          $tableElement: $queryResultTable,
          $tableWidget: $('#query-result-widget'),
          customBtns: [
            `<button class="btn btn-primary stk-insert-btn hidden-xs hidden-sm" title="新增休假日"><span class="fa fa-plus fa-lg"></span></button>`,
            `<button class="btn btn-primary duplicate-day-off-btn" title="新增重複天">新增重複天</button>`,
          ],
          autoWidth: false,
          columns: [
            {
              data: 'day_off',
              name: 'day_off',
              width: '90%',
              render(data, type, rowData) {
                const day = moment(data).format('dd')
                if (type === 'display' || type === 'selectFilter') {
                  return `${data}(${day})`
                } else {
                  return data
                }
              },
            },
            {
              data: null,
              name: 'delete',
              width: '10%',
              render() {
                return `<button class="btn btn-danger delete-day-off-btn">刪除</button>`
              },
            },
          ],
        })
        $queryResultTable.on('click', '.delete-day-off-btn', function () {
          context.deleteDayOff(this)
        })
        $('#query-result-widget')
          .on('click', '.stk-insert-btn', function () {
            context.showSingleDayOffModal()
          })
          .on('click', '.duplicate-day-off-btn', function () {
            context.showDuplicatDayOffModal()
          })
      },
      initAffectedScheduleTable() {
        const context = this
        context.affectedScheduleTable = createReportTable({
          $tableElement: $('#affected-schedule-table'),
        })
      },
      initModal() {
        const context = this
        servkit.initDatePicker($('#insert-day-off-input'))
        $('#save-single-day-off-btn').on('click', function () {
          context.saveSingleDayOff()
        })
        $('#save-duplicate-day-off-btn').on('click', function () {
          context.saveDuplicateDayOff()
        })
        servkit.initDatePicker(
          $('#duplicate-start-date'),
          $('#duplicate-end-date')
        )
        servkit.initDatePicker($('#insert-day-off-input'))
      },
      saveSingleDayOff() {
        const context = this
        const validator = $('#single-day-off-form').validate({
          rules: {
            day_off: {
              required: true,
              dateISO: true,
            },
          },
        })
        if (!validator.form()) {
          return
        }

        const day_off = $('#insert-day-off-input').val().replace(/\//g, '-')
        servkit.ajax(
          {
            url: 'api/huangliangMatStock/non_production',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify([day_off]),
          },
          {
            success(data) {
              // context.queryResultTable.table.rows.add([{ day_off: day_off.replace(/-/g, '/') }]).draw(false);
              context.showWarningModal(data)
              context.getDayOff()
              $('#single-day-off-modal-widget').modal('hide')
            },
          }
        )
      },
      calcDuplicateDate(startDate, endDate, duplicateDayArr) {
        const day_off = []
        const dateFormat = 'YYYY-MM-DD'
        let currDate = moment(startDate)
        let dayOfStart = currDate.format('d')
        let currDay = dayOfStart
        let currIndex = duplicateDayArr.findIndex((day) => day === currDay)
        let nextIndex
        let delta
        let isSet = false
        if (!duplicateDayArr.includes(dayOfStart)) {
          for (let i = 0; i < duplicateDayArr.length; i++) {
            if (duplicateDayArr[i] > dayOfStart) {
              currDay = duplicateDayArr[i]
              delta = duplicateDayArr[i] - dayOfStart
              isSet = true
              break
            }
          }
          if (!isSet) {
            currDay = duplicateDayArr[0]
            delta = Number(currDay) + 7 - dayOfStart
          }
          currDate = currDate.add(delta, 'day')
        }
        while (currDate && !moment(currDate).isAfter(moment(endDate))) {
          day_off.push(currDate.format(dateFormat))
          nextIndex = currIndex + 1
          nextIndex = nextIndex > duplicateDayArr.length - 1 ? 0 : nextIndex
          currDay = duplicateDayArr[nextIndex]

          delta = duplicateDayArr[nextIndex] - duplicateDayArr[currIndex]
          if (delta <= 0) {
            delta += 7
          }
          currDate = currDate.add(delta, 'day')
          currIndex = nextIndex
        }
        return day_off
      },
      saveDuplicateDayOff() {
        const context = this
        const validator = $('#duplicate-day-off-form').validate({
          rules: {
            duplicate_start_date: {
              required: true,
              dateISO: true,
            },
            duplicate_end_date: {
              required: true,
              dateISO: true,
            },
            day: {
              required: true,
            },
          },
          errorPlacement(error, element) {
            if (element[0].name === 'day') {
              $(element).closest('.inline-group').append(error)
            } else {
              error.insertAfter(element)
            }
          },
        })
        if (!validator.form()) {
          return
        }
        const startDate = $('#duplicate-start-date').val()
        const endDate = $('#duplicate-end-date').val()
        const duplicateDayArr = $('#duplicate-day-off-form')
          .find('[name=day]:checked')
          .toArray()
          .map((el) => el.value)
        const day_off = context.calcDuplicateDate(
          startDate,
          endDate,
          duplicateDayArr
        )
        servkit.ajax(
          {
            url: 'api/huangliangMatStock/non_production',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(day_off),
          },
          {
            success(data) {
              // context.queryResultTable.table.rows.add(day_off.map(data => ({ dat_off: data.replace(/-/g, '/') }))).draw(false);
              context.showWarningModal(data)
              context.getDayOff()
              $('#duplicate-day-off-modal-widget').modal('hide')
            },
          }
        )
      },
      showWarningModal(data) {
        const context = this
        if (!data || !data.length) {
          return
        }
        const tableData = data.map((obj) => [
          obj.day_off.toFormatedDate(),
          servkit.getMachineName(obj.machine_id),
          obj.order_id,
        ])
        context.affectedScheduleTable.drawTable(tableData)
        // $('#affected-schedule-table tbody').html(data.map(obj => `<tr><td>${obj.day_off.toFormatedDate()}</td><td>${servkit.getMachineName(obj.machine_id)}</td><td>${obj.order_id}</td></tr>`).join(''));

        $('#affected-schedule-modal-widget').modal('show')
      },
      showDuplicatDayOffModal() {
        const context = this
        const validator = $('#duplicate-day-off-form').data('validator')
        if (validator) {
          validator.destroy()
        }
        $('#duplicate-start-date').val(''.toFormatedDate())
        $('#duplicate-end-date').val('')
        $('#duplicate-day-off-form').find('[name=day]').prop('checked', false)
        $('#duplicate-day-off-modal-widget').modal('show')
      },
      showSingleDayOffModal() {
        const context = this
        const validator = $('#single-day-off-form').data('validator')
        if (validator) {
          validator.destroy()
        }
        $('#insert-day-off-input').val('')
        $('#single-day-off-modal-widget').modal('show')
      },
      deleteDayOff(btn) {
        const context = this
        const { queryResultTable } = context
        const tr = btn.closest('tr')
        const rowData = queryResultTable.table.row(tr).data()
        const { day_off } = rowData
        servkit.ajax(
          {
            url: 'api/huangliangMatStock/non_production',
            type: 'DELETE',
            contentType: 'application/json',
            data: day_off.replace(/\//g, '-'),
          },
          {
            success(data) {
              context.showWarningModal(data)
              queryResultTable.table.row(tr).remove().draw(false)
            },
          }
        )
      },
      getDayOff() {
        const context = this
        const {
          $queryConditionForm,
          submitLoadingBtn,
          $startDateInput,
          $endDateInput,
          queryResultTable,
        } = context
        const startDate = $startDateInput.val()
        const endDate = $endDateInput.val()
        // const whereParams = [startDate, endDate];
        const whereClause = `day_off IS NOT NULL AND day_off BETWEEN '${startDate}' AND '${endDate}' GROUP BY day_off ORDER BY day_off DESC`
        const dateCols = ['day_off']
        const datetimeCols = ['exp_time', 'exp_edate']

        submitLoadingBtn.doing()
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_huangliang_non_production',
              whereClause,
              columns: ['day_off'],
            }),
          },
          {
            success(data) {
              let colName
              let tempObj
              // 格式化時間
              context.queryResultTable.drawTable(
                data.map((d) => {
                  tempObj = {}
                  for (colName of datetimeCols) {
                    if (Object.prototype.hasOwnProperty.call(d, colName)) {
                      tempObj[colName] = d[colName].toFormatedDatetime()
                    }
                  }
                  for (colName of dateCols) {
                    if (Object.prototype.hasOwnProperty.call(d, colName)) {
                      tempObj[colName] = d[colName].toFormatedDate()
                    }
                  }
                  return Object.assign({}, d, tempObj)
                })
              )
            },
            always() {
              submitLoadingBtn.done()
            },
          }
        )
      },
    },
    preCondition: {},
    dependencies: [
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
