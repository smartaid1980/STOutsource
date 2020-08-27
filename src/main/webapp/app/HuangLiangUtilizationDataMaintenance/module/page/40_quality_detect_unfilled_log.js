export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.reportTable = createReportTable({
        $tableElement: $('#table'),
        $tableWidget: $('#table-widget'),
        rightColumn: [7, 8, 10, 11, 12, 13, 14, 15],
        onRow: function (row, data) {
          $(row).find('td').eq(6).html(context.commons.getMultiProcess(data[6]))
          $(row)
            .find('td')
            .eq(16)
            .addClass('hide')
            .html('<span class="edit_group">' + data[16] + '</span>')
        },
      })
      servkit.initDatePicker(context.$startDate, context.$endDate)
      servkit.initSelectWithList(
        context.preCon.getShiftList,
        context.$shiftSelect
      )
      servkit.initMachineSelect(context.$machineSelect)

      context.$submitBtn.on('click', function (evt, isSetDefaultRange) {
        evt.preventDefault()

        // 帶入 三到十天前之間 所有機台 所有班次 的查詢條件
        if (isSetDefaultRange) {
          context.$startDate.val(
            moment().subtract(10, 'days').format('YYYY/MM/DD')
          )
          context.$endDate.val(
            moment().subtract(3, 'days').format('YYYY/MM/DD')
          )
          context.$shiftSelect.val(Object.values(context.preCon.getShiftList))
          context.$machineSelect.val(context.preCon.machineList)
        }

        context.getData()
      })

      // 從提示跳轉過來，帶入預設條件，查三到十天之間的未填紀錄
      if (window.isGoToUnfilledLog) {
        context.$submitBtn.trigger('click', true)
        window.isGoToUnfilledLog = undefined
      }
    },
    util: {
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $shiftSelect: $('#shift'),
      $machineSelect: $('#machine'),
      $submitBtn: $('#submit-btn'),
      reportTable: undefined,
      groupedProductList: undefined,
      groupedSampleList: undefined,

      getData: function (isSetDefaultRange) {
        var context = this,
          shiftList = context.$shiftSelect.val() || [],
          startDate = context.$startDate.val(),
          endDate = context.$endDate.val(),
          machineList = this.$machineSelect.val() || []

        var nObj = {}
        servkit.ajax(
          {
            url: 'api/huangliang/qualityExamData/getData',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              shiftList: shiftList,
              machineList: machineList,
              startDate: startDate,
              endDate: endDate,
            }),
            async: false,
          },
          {
            success: function (datas) {
              _.each(datas, function (v, k) {
                nObj[
                  moment(new Date(v.date)).format('YYYYMMDD') +
                    '/' +
                    v.employee_id +
                    '/' +
                    v.work_shift_name +
                    '/' +
                    v.machine_id +
                    '/' +
                    v.order_id +
                    '/' +
                    v.multi_process
                ] = v
              })
            },
            fail: function (res) {
              console.warn(res)
              $.smallBox({
                title: res,
                color: 'red',
                iconSmall: 'fa fa-times',
                timeout: 4000,
              })
            },
          }
        )

        hippo
          .newSimpleExhaler()
          .space('part_count_huangliang')
          .index('machine_id', context.preCon.machineList)
          .index('work_shift_name', shiftList)
          .indexRange('date', startDate, endDate)
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
            var result = null
            try {
              exhalable.exhalable = context.mergeData(exhalable.exhalable)
              result = exhalable.reduce(function (a, v) {
                var pchlData = v
                var key =
                  v.date +
                  '/' +
                  v.employee_id +
                  '/' +
                  v.work_shift_name +
                  '/' +
                  v.machine_id +
                  '/' +
                  v.order_id +
                  '/' +
                  v.multi_process
                var hqedData = nObj[key] || {}
                pchlData.employee_id = context.commons.fillZeroTo5Digit(
                  pchlData.employee_id
                )

                // 未填原因 或 未提交(沒存在db)
                if (
                  hqedData.defective_reason === '' ||
                  hqedData.defective_reason === undefined
                ) {
                  a.push([
                    pchlData.date.date8BitsToSlashed(),
                    pchlData.employee_id,
                    context.commons.getUserName(
                      context.preCon.getUserList,
                      pchlData.employee_id
                    ),
                    pchlData.work_shift_name,
                    pchlData.machine_id,
                    pchlData.order_id,
                    pchlData.multi_process,
                    pchlData.part_count,

                    hqedData.examination_defective || 0,
                    hqedData.defective_reason || '',
                    hqedData.examination_goods || pchlData.part_count,
                    hqedData.repair_first_defectives === undefined
                      ? ''
                      : hqedData.repair_first_defectives,
                    hqedData.calibration_first_defectives === undefined
                      ? ''
                      : hqedData.calibration_first_defectives,
                    hqedData.qc_partcount || pchlData.part_count,
                    hqedData.qc_defectives || '',
                    hqedData.qc_goods || pchlData.part_count,
                    hqedData.edit_group || '',
                  ])
                }
                return a
              }, [])
            } catch (e) {
              console.warn(e)
            } finally {
              context.reportTable.drawTable(result)
            }
          })
      },

      mergeData: function (exhalable) {
        // part_count_huangliang 的顆數有可能被 --- 或其他原因中斷分成兩筆，把他合併
        var groupedData = {}
        _.each(exhalable, function (elem) {
          var key = [
            elem.date,
            elem.employee_id,
            elem.work_shift_name,
            elem.machine_id,
            elem.order_id,
            elem.multi_process,
          ].join('@@')
          if (!groupedData[key]) {
            groupedData[key] = elem
          } else {
            groupedData[key].part_count += elem.part_count
          }
        })

        return _.toArray(groupedData)
      },
    },
    preCondition: {
      getShiftList: function (done) {
        this.commons.getShiftList(done)
      },
      getUserList: function (done) {
        this.commons.getUserList(done)
      },
      getProductList: function (done) {
        this.commons.getProductList(done)
      },
      getSampleList: function (done) {
        this.commons.getSampleList(done)
      },
      machineList: function (done) {
        let machineIds = []
        servkit.eachMachine((id) => machineIds.push(id))
        done(machineIds)
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
      ],
    ],
  })
}
