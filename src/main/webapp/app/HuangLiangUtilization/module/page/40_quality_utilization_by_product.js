export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.reportTable = createReportTable({
        $tableElement: $('#table'),
        $tableWidget: $('#table-widget'),
        rightColumn: [7, 8, 9],
        onDraw: function (tableData, pageData, api) {
          $('tbody').append(
            '<tr style="font-weight:bolder;color:green;">' +
              '<td colspan="9">產品平均品質稼動率</td>' +
              '<td class="text-right">' +
              context.productAvgQualityUtilization +
              '</td></tr>'
          )
        },
        excel: {
          fileName: 'QualityUtilizationByProduct',
          format: [
            'text',
            'text',
            'text',
            'text',
            'text',
            'text',
            'text',
            '0',
            '0.00%',
            '0.00%',
          ],
        },
      })

      context.commons.initOrderSampleAutocomplete(
        context.$orderId,
        context.$manageId,
        context.preCon.getProductList,
        context.preCon.getSampleList
      )

      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()

        try {
          context.loadingBtn.doing()
          var orderOrSampleObj = context.getorderOrSampleObj()
          var macro523List = _.pluck(orderOrSampleObj, 'macro523')
          var manageId =
            context.$manageId.val() || _.first(orderOrSampleObj).standard_id
          context.getDBQCData(macro523List)
          context.getHippoData(macro523List)
          servkit
            .politeCheck()
            .until(function () {
              return context.DBData && context.hippoData
            })
            .thenDo(function () {
              context.processData(orderOrSampleObj, manageId)
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
        context.$userNameSelect.val(['00142', '01234'])
        context.$submitBtn.click()
      })
    },
    util: {
      $orderId: $('#order_id'),
      $manageId: $('#manage_id'),
      $submitBtn: $('#submit-btn'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      reportTable: undefined,
      DBData: undefined,
      hippoData: undefined,
      productAvgQualityUtilization: 0,

      getorderOrSampleObj: function () {
        var context = this,
          orderId = context.$orderId.val(),
          sampleId = context.$manageId.val()
        return context.commons.getMacro523ByOrderIdOrSampleId(
          orderId,
          sampleId,
          context.preCon.getProductList,
          context.preCon.getSampleList
        )
      },
      getDBQCData: function (macro523List) {
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
                'qc_goods',
              ],
              whereClause: "order_id IN ('" + macro523List.join("', '") + "') ",
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
      getHippoData: function (macro523List) {
        var context = this
        context.hippoData = undefined

        hippo
          .newSimpleExhaler()
          .space('HUL_jia_quality_product')
          .index('order_id', macro523List)
          .columns(
            'order_id',
            'multi_process',
            'date',
            'work_shift_name',
            'machine_id',
            'employee_id',
            'care_partcount',
            'utilization'
          )
          .exhale(function (exhalable) {
            //年少不懂事欄位名稱沒統一QQ
            context.hippoData = exhalable.exhalable
          })
      },
      processData: function (orderOrSampleObj, manageId) {
        var context = this
        var orderQcGoods = 0
        var orderCarePartcount = 0
        context.productAvgQualityUtilization = 0

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
          if (groupedDBData[key]) {
            groupedData[key] = _.extend(hippoDatas[0], groupedDBData[key][0])
          } else {
            groupedData[key] = hippoDatas[0]
          }
        })

        console.log(groupedData)

        //管編alert
        context.commons.addAlertHtml('【管編：' + manageId + '】')

        var tableData = _.map(groupedData, function (elem, key) {
          orderQcGoods += elem.qc_goods || elem.care_partcount
          orderCarePartcount += elem.care_partcount
          var orderObj = _.find(orderOrSampleObj, function (obj) {
            return obj.macro523 == elem.order_id
          })
          return [
            //訂單號碼
            orderObj.order_id || '',
            // 多次製程
            context.commons.getMultiProcess(elem.multi_process),
            // 日期
            elem.date,
            // 班別
            elem.work_shift_name,
            // 機台
            servkit.getMachineName(elem.machine_id),
            // 員編
            elem.employee_id,
            // 人員姓名
            context.commons.getUserName(
              context.preCon.getUserList,
              elem.employee_id
            ),
            // 實際產量
            elem.care_partcount,
            // 機台稼動率 = 運轉時間/通電時間
            elem.utilization.floatToPercentage(),
            // 總品質稼動率 = QC後良品數量 / 實際數量 DB沒有qc_goods就是沒輸入過不良品，良率100%
            elem.qc_goods
              ? (elem.qc_goods / elem.care_partcount).floatToPercentage()
              : '100.00%',
          ]
        })
        context.productAvgQualityUtilization = (
          orderQcGoods / orderCarePartcount
        ).floatToPercentage()
        context.reportTable.drawTable(tableData)
        context.loadingBtn.done()
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
