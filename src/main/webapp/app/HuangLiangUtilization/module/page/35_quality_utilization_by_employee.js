export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.reportTable = createReportTable({
        $tableElement: $('#table'),
        $tableWidget: $('#table-widget'),
        rightColumn: [6, 7],
        excel: {
          fileName: 'QualityUtilizationByPeople',
          format: [
            'text',
            'text',
            'text',
            'text',
            'text',
            'text',
            '0',
            '0.00%',
            'text',
          ],
        },
      })

      console.log('test')

      //TODO: 把commons的getProductList 多加一個 getGroupedProductList
      context.groupedProductList = _.groupBy(
        context.preCon.getProductList,
        'macro523'
      )
      context.groupedSampleList = _.groupBy(
        context.preCon.getSampleList,
        'macro523'
      )

      servkit.initDatePicker(context.$startDate, context.$endDate)
      servkit.initMachineSelect(context.$machineSelect)
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
        context.$machineSelect.val(['_HULPLATFORM01D01M01'])
        context.$employeeSelect.val(['00142', '01234'])
        context.$submitBtn.click()
      })

      context.commons.testMachineBtn()
    },
    util: {
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $userRadio: $('[name=user]'),
      $userTypeRadio: $('[name=user_type]'),
      $userIdInput: $('#user_id'),
      $employeeSelect: $('#employee'),
      $machineSelect: $('#machine'),
      $submitBtn: $('#submit-btn'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      reportTable: undefined,
      groupedProductList: undefined,
      groupedSampleList: undefined,
      DBData: undefined,
      hippoData: undefined,
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
        var employeeFilter = context.getEmployeeFilter()
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
                'qc_goods',
              ],
              whereClause:
                "date BETWEEN '" +
                context.$startDate.val() +
                "' AND '" +
                context.$endDate.val() +
                "' AND " +
                "employee_id IN ('" +
                employeeFilter.join("', '") +
                "') AND " +
                "machine_id IN ('" +
                context.$machineSelect.val().join("', '") +
                "')",
            }),
          },
          {
            success: function (data) {
              context.DBData = _.map(data, function (elem) {
                elem.date = moment(new Date(elem.date)).format('YYYYMMDD')
                return elem
              })
            },
          }
        )
      },
      getHippoData: function () {
        var context = this
        var employeeFilter = context.getEmployeeFilter()
        context.hippoData = undefined

        hippo
          .newSimpleExhaler()
          .space('part_count_huangliang')
          .index('machine_id', context.$machineSelect.val())
          .index('work_shift_name', _.keys(context.preCon.getShiftList))
          .indexRange('date', context.$startDate.val(), context.$endDate.val())
          .columns(
            'date',
            'employee_id',
            'work_shift_name',
            'machine_id',
            'order_id',
            'multi_process',
            'part_count'
          )
          .exhale(function (exhalable) {
            context.hippoData = _.filter(exhalable.exhalable, function (elem) {
              return _.contains(employeeFilter, elem.employee_id)
            })
          })
      },
      processData: function () {
        var context = this
        var groupedHippoData = _.groupBy(context.hippoData, function (elem) {
          return [
            elem.date,
            elem.employee_id,
            elem.work_shift_name,
            elem.machine_id,
            elem.order_id,
            elem.multi_process,
          ].join('@@')
        })
        var groupedDBData = _.groupBy(context.DBData, function (elem) {
          return [
            elem.date,
            elem.employee_id,
            elem.work_shift_name,
            elem.machine_id,
            elem.order_id,
            elem.multi_process,
          ].join('@@')
        })
        var groupedData = {}
        _.each(groupedHippoData, function (hippoDatas, key) {
          //同一個單位可能有多筆，也許是被"---"隔開的，要把顆數加總
          var sumedHippoData = hippoDatas[0]
          sumedHippoData.part_count = _.reduce(
            hippoDatas,
            function (memo, elem) {
              return memo + elem.part_count
            },
            0
          )

          if (groupedDBData[key]) {
            groupedData[key] = _.extend(sumedHippoData, groupedDBData[key][0])
          } else {
            groupedData[key] = sumedHippoData
          }
        })

        console.log(groupedData)

        var tableData = _.map(groupedData, function (elem, key) {
          var orderObj = context.commons.getOrderIdOrSampleId(
            context.groupedProductList,
            context.groupedSampleList,
            elem.order_id
          )
          return [
            // 日期
            elem.date,
            // 員編
            elem.employee_id,
            // 人員姓名
            context.commons.getUserName(
              context.preCon.getUserListByGroup.all,
              elem.employee_id
            ),
            // 班別
            elem.work_shift_name,
            // 機台
            servkit.getMachineName(elem.machine_id),
            //訂單號碼
            orderObj.order_id,
            // 實際產量
            elem.part_count,
            // 總品質稼動率 = QC後良品數量 / 實際數量 DB沒有qc_goods就是沒輸入過不良品，良率100%
            elem.qc_goods
              ? (elem.qc_goods / elem.part_count).floatToPercentage()
              : '100.00%',
            // 多次製程
            context.commons.getMultiProcess(elem.multi_process),
          ]
        })
        context.reportTable.drawTable(tableData)
        context.loadingBtn.done()
      },
    },
    preCondition: {
      getUserListByGroup: function (done) {
        this.commons.getUserListByGroup(done)
      },
      getProductList: function (done) {
        this.commons.getProductList(done)
      },
      getSampleList: function (done) {
        this.commons.getSampleList(done)
      },
      getShiftList: function (done) {
        this.commons.getShiftList(done)
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
