export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.reportTable = createReportTable({
        $tableElement: $('#table'),
        $tableWidget: $('#table-widget'),
        rightColumn: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        //        onDraw: function (tableData, pageData, api) {
        //          $("tbody").append('<tr style="font-weight:bolder;color:green;">' +
        //              '<td colspan="14" class="text-right">' + api.column(8, {page: 'current'}).data().sum().millisecondToHHmmss() +
        //              '<td class="text-right">' + api.column(8, {page: 'current'}).data().sum().millisecondToHHmmss() +
        //              '<td class="text-right">' + api.column(8, {page: 'current'}).data().sum().millisecondToHHmmss() +
        //              '</td></tr>');
        //        },
        excel: {
          fileName: 'ProductUtilization',
          format: [
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
            '0',
            '0.00%',
            '0.00%',
            '0.00%',
            'text',
          ],
        },
      })

      context.commons.initOrderSampleAutocomplete(
        context.$orderId,
        context.$sampleId,
        context.preCon.getProductList,
        context.preCon.getSampleList
      )

      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()
        context.getData()
      })

      $('#showdemo').on('click', function (e) {
        e.preventDefault()
        context.$orderId.val([])
        context.$sampleId.val([])
        context.$submitBtn.click()
      })
    },
    util: {
      $orderId: $('#order_id'),
      $sampleId: $('#sample_id'),
      $submitBtn: $('#submit-btn'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      reportTable: undefined,
      getData: function () {
        var loadingBtn = this.loadingBtn,
          context = this,
          orderId = context.$orderId.val(),
          sampleId = context.$sampleId.val()
        var orderOrSampleObj = context.commons.getMacro523ByOrderIdOrSampleId(
          orderId,
          sampleId,
          context.preCon.getProductList,
          context.preCon.getSampleList
        )
        loadingBtn.doing()

        hippo
          .newSimpleExhaler()
          .space('HUL_jia_people_product')
          .index('order_id', _.pluck(orderOrSampleObj, 'macro523'))
          .columns(
            'order_id',
            'date',
            'macro521',
            'work_shift_name',
            'machine_id',
            'care_power_millisecond',
            'care_operate_millisecond',
            'care_idle_millisecond',
            'care_partcount',
            'part_count',
            //                "expected_partcount",
            //                "piece_avg_minute",
            'multi_process',
            'operate_millisecond',
            'power_millisecond',
            'std_second',
            'logically_date'
          )
          .exhale(function (exhalable) {
            //管編alert
            if (exhalable.exhalable.length && sampleId) {
              context.commons.addAlertHtml('【管編：' + sampleId + '】')
            } else if (exhalable.exhalable.length && orderId) {
              var standard_id = _.find(context.preCon.getProductList, function (
                elem
              ) {
                return elem.order_id == orderId
              })
              standard_id = standard_id ? standard_id.standard_id : ''
              context.commons.addAlertHtml('【管編：' + standard_id + '】')
            }

            var groupedData = _.groupBy(exhalable.exhalable, function (elem) {
              return [
                elem.macro523,
                elem.date,
                elem.macro521,
                elem.work_shift_name,
                elem.machine_id,
                elem.multi_process,
              ].join('@@')
            })

            var tableData = _.map(groupedData, function (data, key) {
              var elem = _.last(data)
              var orderObj = _.find(orderOrSampleObj, function (obj) {
                return obj.macro523 == elem.order_id
              })
              var expected_partcount =
                !_.isNaN(parseFloat(elem.std_second)) && elem.std_second != 0
                  ? (
                      elem.care_operate_millisecond /
                      elem.std_second /
                      1000
                    ).toFixed(2)
                  : 0
              return [
                //訂單編號 如果是樣品的話就留空
                orderObj && orderObj.order_id ? orderObj.order_id : '',
                //日期
                elem.logically_date
                  ? elem.logically_date
                  : elem.date.whateverToDateSlashed(),
                //員編
                elem.macro521,
                //姓名
                context.commons.getUserName(
                  context.preCon.getUserList,
                  elem.macro521
                ),
                //班別
                elem.work_shift_name,
                //機台
                servkit.getMachineName(elem.machine_id),
                //顧車通電
                elem.care_power_millisecond.millisecondToHHmmss(),
                //顧車運轉
                elem.care_operate_millisecond.millisecondToHHmmss(),
                //顧車閒置
                elem.care_idle_millisecond.millisecondToHHmmss(),
                //實際產量
                elem.care_partcount,
                //機台顯示產量
                elem.part_count,
                //預期產量 = 顧車運轉/標準工時
                expected_partcount,
                //                  elem.expected_partcount.toFixed(0),
                //單顆平均生產時間 = 顧車運轉/實際產量
                (
                  elem.care_operate_millisecond / elem.care_partcount
                ).millisecondToXXmXXs(),
                //機台稼動率 = 運轉時間/通電時間
                (
                  elem.operate_millisecond / elem.power_millisecond
                ).floatToPercentage(),
                //人員稼動率 = 顧車運轉/顧車通電
                (
                  elem.care_operate_millisecond / elem.care_power_millisecond
                ).floatToPercentage(),
                //效能稼動率 = 實際產量/預期產量
                (elem.care_partcount / expected_partcount).floatToPercentage(
                  2,
                  false,
                  true
                ),
                //多次製程
                context.commons.getMultiProcess(elem.multi_process),
              ]
            })

            context.reportTable.drawTable(tableData)
            loadingBtn.done()
          })
      },
    },
    preCondition: {
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
        '/js/plugin/datatables/dataTables.sum.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
    ],
  })
}
