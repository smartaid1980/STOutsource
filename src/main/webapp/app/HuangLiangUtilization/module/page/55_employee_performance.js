export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.reportTable = createReportTable({
        $tableElement: $('#table'),
        $tableWidget: $('#table-widget'),
        rightColumn: [4, 5, 6],
        onDraw: function (tableData, pageData, api) {
          var dateArray = _.map(pageData, function (elem) {
            return elem[0]
          })
          $('tbody').append(
            '<tr style="font-weight:bolder;color:green;">' +
              '<td colspan="6"></td>' +
              '<td class="text-right">共' +
              _.uniq(dateArray).length +
              '天</td></tr>'
          )
        },
        excel: {
          fileName: 'EmployeePerformance',
          format: ['text', 'text', 'text', 'text', '0', '0', '0.00%'],
        },
      })

      //過濾人的時候把全部都顯示在同一頁  才有辦法正確顯示加總的天數  因為總天數是用當下那頁的資料去找unniq的日期
      context.reportTable.table.on('search.dt', function () {
        context.reportTable.table.page.len(-1)
      })

      servkit.initDatePicker(context.$startDate, context.$endDate)

      context.$userTypeRadio.on('change', function (e) {
        var user_type = $(this).val()
        servkit.initSelectWithList(
          context.preCon.getUserListByGroup[user_type],
          context.$employeeSelect
        )
      })
      context.$userTypeRadio.eq(0).change()

      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()
        try {
          context.loadingBtn.doing()
          context.getDBData()
          context.getHippoData()
          servkit
            .politeCheck()
            .until(function () {
              return context.DBData && context.hippoData
            })
            .thenDo(function () {
              context.processData()
            })
            .tryDuration(0)
            .start()
        } catch (e) {
          console.debug(e)
          context.loadingBtn.done()
        }
      })

      $('#showdemo').on('click', function (e) {
        e.preventDefault()
        context.$startDate.val('2016/07/16')
        context.$endDate.val('2016/07/17')
        context.$userNameSelect.val(['00142', '00991'])
        context.$qualityUtilization.val(0)
        context.$efficiencyUtilization.val(0)
        context.$achievedMachineCount.val(0)
        context.$submitBtn.click()
      })
    },
    util: {
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $userRadio: $('[name=user]'),
      $userTypeRadio: $('[name=user_type]'),
      $userIdInput: $('#user_id'),
      $employeeSelect: $('#employee'),
      $qualityUtilization: $('#quality_utilization'),
      $efficiencyUtilization: $('#efficiency_utilization'),
      $achievedMachineCount: $('#achieved_machine_count'),
      $carePowerMillisecond: $('#care_power_millisecond'),
      $submitBtn: $('#submit-btn'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      reportTable: undefined,
      DBData: undefined, //{date@@employee_id@@work_shift_name@@machine_id:qc}
      hippoData: undefined, //{date@@employee_id@@work_shift_name:[{}, ...]}

      getEmployeeFilter: function () {
        var context = this
        var employeeFilter
        if ($('[name=user]:checked').val() == 'user_id') {
          employeeFilter = [context.$userIdInput.val()]
        } else {
          employeeFilter = context.$employeeSelect.val()
        }
        return employeeFilter
      },
      getDBData: function () {
        var context = this
        context.DBData = undefined
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_huangliang_quality_exam_data',
              columns: [
                'date',
                'employee_id',
                'work_shift_name',
                'machine_id',
                'order_id',
                'multi_process',
                'examination_defective',
                'examination_goods',
                'qc_goods',
              ],
              whereClause:
                "date BETWEEN '" +
                context.$startDate.val() +
                "' AND '" +
                context.$endDate.val() +
                "' AND " +
                "employee_id IN ('" +
                context.getEmployeeFilter().join("', '") +
                "')",
            }),
          },
          {
            success: function (data) {
              context.DBData = {}
              var groupedData = _.groupBy(data, function (elem) {
                return [
                  moment(new Date(elem.date)).format('YYYYMMDD'),
                  elem.employee_id,
                  elem.work_shift_name,
                  elem.machine_id,
                ].join('@@')
              })
              _.each(groupedData, function (dataList, key) {
                var care_partcount = 0
                var qc_goods = 0

                _.each(dataList, function (elem) {
                  care_partcount +=
                    parseInt(elem.examination_defective) +
                    parseInt(elem.examination_goods)
                  qc_goods += parseInt(elem.qc_goods)
                })
                // 總品質稼動率：該顧車人員於該天該班次QC後良品數量/實際產量
                context.DBData[key] = qc_goods / care_partcount
              })
            },
          }
        )
      },
      getHippoData: function () {
        var context = this
        context.hippoData = undefined
        hippo
          .newSimpleExhaler()
          .space('HUL_perform')
          .index('employee_id', context.getEmployeeFilter())
          .index('machine_id', servkit.getMachineList())
          .indexRange('date', context.$startDate.val(), context.$endDate.val())
          .columns(
            'date',
            'employee_id',
            'machine_id',
            'work_shift_name',
            'care_partcount',
            'care_operate_millisecond',
            'std_second',
            'care_power_millisecond'
          )
          .exhale(function (exhalable) {
            //該日該人該班所顧的機台
            context.hippoData = exhalable
          })
      },
      processData: function () {
        var qualityUtilization = this.$qualityUtilization.val() / 100,
          efficiencyUtilization = this.$efficiencyUtilization.val() / 100,
          achievedMachineCount = this.$achievedMachineCount.val(),
          carePowerMillisecond = this.$carePowerMillisecond.val(),
          loadingBtn = this.loadingBtn,
          context = this
        loadingBtn.doing()

        console.debug(context.DBData)
        console.debug(context.hippoData.exhalable)
        // 該日該人該班，「總品質稼動率」、「效能稼動率」、「顧車通電時間」有達到目標的機台
        var achievedRecordGroupByMacro521 = _.chain(context.hippoData.exhalable)
          .filter(function (elem) {
            var key = [
              elem.date,
              elem.employee_id,
              elem.work_shift_name,
              elem.machine_id,
            ].join('@@')
            var qc = context.DBData[key] ? context.DBData[key] : 100
            // 預期產量 = 顧車運轉 / 標準工時
            var ept_partcount =
              elem.std_second == 0
                ? 0
                : elem.care_operate_millisecond / 1000 / elem.std_second
            // 效能稼動率(%) = 該顧車人員於該天該班次 實際產量 / 預期產量
            elem.efficiency_utilization =
              ept_partcount == 0 ? 0 : elem.care_partcount / ept_partcount
            return (
              qc > qualityUtilization &&
              elem.efficiency_utilization > efficiencyUtilization &&
              elem.care_power_millisecond > carePowerMillisecond
            )
          })
          .groupBy(function (elem) {
            return [elem.date, elem.employee_id, elem.work_shift_name].join(
              '@@'
            )
          })
          .value()

        // 該日該人該班，「達成機台數」有達到目標的紀錄
        _.each(achievedRecordGroupByMacro521, function (elems, key) {
          if (elems.length <= achievedMachineCount) {
            delete achievedRecordGroupByMacro521[key]
          }
        })

        console.debug(achievedRecordGroupByMacro521)

        //just to get 看管機台數
        var groupedData = _.groupBy(context.hippoData.exhalable, function (
          elem
        ) {
          return [elem.date, elem.employee_id, elem.work_shift_name].join('@@')
        })

        var tableData = []
        _.each(achievedRecordGroupByMacro521, function (elems, key) {
          var sampleElem = elems[0]

          tableData.push([
            //日期
            sampleElem.date,
            //員編
            sampleElem.employee_id,
            //姓名
            context.commons.getUserName(
              context.preCon.getUserListByGroup.all,
              sampleElem.employee_id
            ),
            //班別
            sampleElem.work_shift_name,
            //達成機台數
            elems.length,
            //看管總機台數
            groupedData[key].length,
            //達成比例
            (elems.length / groupedData[key].length).floatToPercentage(),
          ])
        })

        context.reportTable.drawTable(tableData)
        loadingBtn.done()
      },
    },
    preCondition: {
      getUserListByGroup: function (done) {
        this.commons.getUserListByGroup(done)
      },
    },
    delayCondition: ['machineList'],
    dependencies: [
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatables/dataTables.sum.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
    ],
  })
}
