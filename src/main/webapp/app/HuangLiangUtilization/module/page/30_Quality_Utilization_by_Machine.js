export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.reportTable = createReportTable({
        $tableElement: $('#table'),
        $tableWidget: $('#table-widget'),
        rightColumn: [8, 9, 10, 11, 12, 13, 14, 15],
        excel: {
          fileName: 'QualityUtilizationByMachine',
          format: [
            'text',
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
            '0.00%',
            '0',
            '0',
            '0',
            '0.00%',
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
      servkit.initSelectWithList(
        context.preCon.getShiftList,
        context.$shiftSelect
      )
      servkit.initMachineSelect(context.$machineSelect)

      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()

        try {
          context.loadingBtn.doing()
          context.getDBQCData()
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
        context.$startDate.val('2016/08/01')
        context.$endDate.val('2016/08/13')
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
      $shiftSelect: $('#shift'),
      $machineSelect: $('#machine'),
      $submitBtn: $('#submit-btn'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      reportTable: undefined,
      groupedProductList: undefined,
      groupedSampleList: undefined,
      getDBQCData: function () {
        var context = this
        context.DBData = undefined

        servkit.ajax(
          {
            url: 'api/huangliang/qualityExamData/getData',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              shiftList: context.$shiftSelect.val(),
              machineList: context.$machineSelect.val(),
              startDate: context.$startDate.val(),
              endDate: context.$endDate.val(),
            }),
          },
          {
            success: function (data) {
              context.DBData = _.map(data, function (elem) {
                elem.date = moment(new Date(elem.date)).format('YYYYMMDD')
                return elem
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
              context.loadingBtn.done()
            },
          }
        )
      },
      getHippoData: function () {
        var context = this
        context.hippoData = undefined

        hippo
          .newSimpleExhaler()
          .space('part_count_huangliang')
          .index('machine_id', context.$machineSelect.val())
          .index('work_shift_name', context.$shiftSelect.val())
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
            context.hippoData = exhalable.exhalable
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

        console.debug(groupedData)

        var tableData = _.map(groupedData, function (elem, key) {
          var orderObj = context.commons.getOrderIdOrSampleId(
            context.groupedProductList,
            context.groupedSampleList,
            elem.order_id
          )
          elem.defectives = elem.defectives || 0
          elem.qc_defectives = elem.qc_defectives || 0
          elem.examination_goods = elem.examination_goods || elem.part_count
          elem.qc_partcount = elem.qc_partcount || elem.part_count
          elem.qc_goods = elem.qc_goods || elem.part_count
          return [
            /*(hippo)日期*/ elem.date,
            /*(hippo)員編*/ elem.employee_id,
            /*(hippo)人員姓名*/ context.commons.getUserName(
              context.preCon.getUserList,
              elem.employee_id
            ),
            /*(hippo)班別*/ elem.work_shift_name,
            /*(hippo)機台*/ servkit.getMachineName(elem.machine_id),
            /*(hippo)訂單號碼*/ orderObj.order_id,
            /*(hippo)管編*/ orderObj.sample_id,
            /*(hippo)多次製程*/ context.commons.getMultiProcess(
              elem.multi_process
            ),
            /*(hippo)實際產量*/ elem.part_count,
            /*(DB)例檢不良品*/ elem.examination_defective || 0,
            /*(DB)例檢良品*/ elem.examination_goods,
            /*(DB)例檢品質稼動率*/ (
              elem.examination_goods / elem.part_count
            ).floatToPercentage(),
            /*(DB)QC總數量*/ elem.qc_partcount,
            /*(DB)QC不良品*/ elem.qc_defectives || 0,
            /*(DB)QC後良品數量*/ elem.qc_goods,
            /*(DB)總品質稼動率*/ (
              elem.qc_goods / elem.part_count
            ).floatToPercentage(),
          ]
        })

        context.reportTable.drawTable(tableData)
        context.loadingBtn.done()
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
