export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.reportTable = createReportTable({
        $tableElement: $('#table'),
        $tableWidget: $('#table-widget'),
        rightColumn: [7, 8, 9, 10, 11, 12, 13, 14, 15],
        excel: {
          fileName: 'EmployeeUtilizationByMachine',
          format: [
            'text',
            'text',
            'text',
            'text',
            'text',
            'text',
            'text',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0.00',
            '0.00%',
            '0.00%',
            'text',
          ],
        },
      })

      context.groupedProductList = _.groupBy(
        context.preCon.getProductList,
        'macro523'
      )
      context.groupedSampleList = _.groupBy(
        context.preCon.getSampleList,
        'macro523'
      )

      servkit.initDatePicker(context.$startDate, context.$endDate)
      //      servkit.initSelectWithList(context.preCon.getUserList, context.$userNameSelect);
      servkit.initMachineSelect(context.$machineSelect)

      context.$userTypeRadio.on('change', function (e) {
        servkit.initSelectWithList(
          context.preCon.getUserListByGroup[$(this).val()],
          context.$employeeSelect
        )
      })
      context.$userTypeRadio.eq(0).change()

      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()
        context.getData()
      })

      $('#showdemo').on('click', function (e) {
        e.preventDefault()
        context.$startDate.val('2016/07/25')
        context.$endDate.val('2016/07/29')
        context.$machineSelect.val([
          '_HULPLATFORM01D01M53',
          '_HULPLATFORM01D01M113',
        ])
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
      getData: function () {
        var machineList = this.$machineSelect.val() || []
        var loadingBtn = this.loadingBtn
        var context = this
        loadingBtn.doing()

        var employeeFilter
        // 因為M521在rawdata裡前面的0會不見，所以建的資料夾也是沒有0的員編，為了讓hippo取的到值，要把使用者查詢的員編都當整數查
        //        if ($("[name=user]:checked").val() == "user_id") {
        //          employeeFilter = [context.$userIdInput.val()];
        //        } else {
        //          employeeFilter = context.$employeeSelect.val();
        //        }
        if ($('[name=user]:checked').val() === 'user_id') {
          employeeFilter = [context.$userIdInput.val()]
        } else {
          employeeFilter = context.$employeeSelect.val()
        }

        hippo
          .newSimpleExhaler()
          .space('HUL_jia_people')
          .index('machine_id', machineList)
          .index('macro521', employeeFilter)
          .indexRange('date', this.$startDate.val(), this.$endDate.val())
          .columns(
            'date',
            'macro521',
            'work_shift_name',
            'machine_id',
            'order_id',
            'care_power_millisecond',
            'care_operate_millisecond',
            'care_idle_millisecond',
            'care_partcount',
            'part_count',
            // 'expected_partcount',
            'piece_avg_minute',
            // 'employee_oee',
            // 'efficiency_oee',
            'multi_process',
            'std_second',
            'logically_date'
          )
          .exhale(function (exhalable) {
            console.debug(exhalable.exhalable)
            var tableData = _.map(exhalable.exhalable, function (elem) {
              elem.macro521 = context.commons.fillZeroTo5Digit(elem.macro521)
              var orderObj = context.commons.getOrderIdOrSampleId(
                context.groupedProductList,
                context.groupedSampleList,
                elem.order_id
              )
              var expPartCount =
                !_.isNaN(parseFloat(elem.std_second)) && elem.std_second !== 0
                  ? (
                      elem.care_operate_millisecond /
                      elem.std_second /
                      1000
                    ).toFixed(2)
                  : 0
              elem = context.reasonValue(elem)
              return [
                // 日期
                elem.logically_date
                  ? elem.logically_date
                  : elem.date.whateverToDateSlashed(),
                // 員編
                elem.macro521,
                // 姓名
                context.commons.getUserName(
                  context.preCon.getUserListByGroup.all,
                  elem.macro521
                ),
                // 班別
                elem.work_shift_name,
                // 機台
                servkit.getMachineName(elem.machine_id),
                // 訂單號碼
                orderObj.order_id,
                // 管編
                orderObj.sample_id,
                // 顧車通電
                elem.care_power_millisecond.millisecondToHHmmss(),
                // 顧車運轉
                elem.care_operate_millisecond.millisecondToHHmmss(),
                // 顧車閒置
                elem.care_idle_millisecond.millisecondToHHmmss(),
                // 實際產量
                elem.care_partcount,
                // 機台顯示產量
                elem.part_count,
                // 預期產量 = 顧車運轉/標準工時
                expPartCount,
                // 單顆平均生產時間 = 顧車運轉/實際產量
                (
                  elem.care_operate_millisecond / elem.care_partcount
                ).millisecondToXXmXXs(),
                // 人員稼動率 = 顧車運轉 / 顧車通電
                (
                  elem.care_operate_millisecond / elem.care_power_millisecond
                ).floatToPercentage(),
                // 效能稼動率 = 實際產量 / 預期產量
                (elem.care_partcount / expPartCount).floatToPercentage(),
                // 多次製程
                context.commons.getMultiProcess(elem.multi_process),
              ]
            })

            context.reportTable.drawTable(tableData)
            loadingBtn.done()
          })
      },
      reasonValue: function (elem) {
        // 通電不超過班次時間(8小時)
        var SHIFT_TIME_IN_MILLISECOND = 8 * 60 * 60 * 1000
        elem.care_power_millisecond =
          elem.care_power_millisecond > SHIFT_TIME_IN_MILLISECOND
            ? SHIFT_TIME_IN_MILLISECOND
            : elem.care_power_millisecond
        elem.care_operate_millisecond =
          elem.care_operate_millisecond > SHIFT_TIME_IN_MILLISECOND
            ? SHIFT_TIME_IN_MILLISECOND
            : elem.care_operate_millisecond
        elem.care_idle_millisecond =
          elem.care_idle_millisecond > SHIFT_TIME_IN_MILLISECOND
            ? SHIFT_TIME_IN_MILLISECOND
            : elem.care_idle_millisecond

        return elem
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
