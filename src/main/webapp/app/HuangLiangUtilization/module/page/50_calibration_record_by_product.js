export default function () {
  GoGoAppFun({
    gogo: function (context) {
      console.log('test')
      context.reportTable = createReportTable({
        $tableElement: $('#table'),
        $tableWidget: $('#table-widget'),
        order: [[0, 'desc']],
        rightColumn: [4, 5, 6, 7, 8, 9, 10],
        onDraw: function (tableData, pageData, api) {
          //.HHmmssToMillisecond()
          $('tbody').append(
            '<tr style="font-weight:bolder;color:green;">' +
              '<td colspan="6">Total: </td>' +
              '<td class="text-right">' +
              _.reduce(
                api.column(6, { page: 'current' }).data(),
                function (memo, elem) {
                  return memo + elem.HHmmssToMillisecond()
                },
                0
              ).millisecondToHHmmss() +
              '</td><td colspan="4"></td></tr>'
          )
        },
        excel: {
          fileName: 'RegulateRecordByProduct',
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

      context.commons.initOrderSampleAutocomplete(
        context.$orderId,
        context.$sampleId,
        context.preCon.getProductList,
        context.preCon.getSampleList
      )

      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()
        try {
          context.loadingBtn.doing()
          var orderOrSampleObj = context.getMacro523ByOrderIdOrSampleId()
          context.isDBDataGet = context.isHippoDataGet = false
          context.getDBData(orderOrSampleObj)
          context.getHippoData(orderOrSampleObj)
          servkit
            .politeCheck()
            .until(function () {
              return context.isDBDataGet && context.isHippoDataGet
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
        context.$orderId.val('')
        context.$sampleId.val('')
        context.$submitBtn.click()
      })
    },
    util: {
      $orderId: $('#order_id'),
      $sampleId: $('#sample_id'),
      $submitBtn: $('#submit-btn'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      reportTable: undefined,
      groupedProductList: undefined,
      groupedSampleList: undefined,
      DBData: undefined, //order_id@@multi_process@@machine_id@@employee_id
      hippoData: undefined,
      isDBDataGet: false,
      isHippoDataGet: false,

      getMacro523ByOrderIdOrSampleId: function () {
        var context = this,
          orderId = context.$orderId.val(),
          sampleId = context.$sampleId.val()
        return context.commons.getMacro523ByOrderIdOrSampleId(
          orderId,
          sampleId,
          context.preCon.getProductList,
          context.preCon.getSampleList
        )
      },

      getDBData: function (orderOrSampleObj) {
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
                'qc_defectives',
                'calibration_first_defectives',
              ],
              whereClause:
                "order_id in ('" +
                _.pluck(orderOrSampleObj, 'macro523').join("', '") +
                "')",
            }),
          },
          {
            success: function (data) {
              context.DBData = {}
              var groupedData = _.groupBy(data, function (elem) {
                return [
                  elem.order_id,
                  elem.multi_process,
                  elem.machine_id,
                ].join('@@')
              })

              _.each(groupedData, function (dataList, key) {
                context.DBData[key] = _.reduce(
                  dataList,
                  function (memo, elem) {
                    memo.defectives +=
                      (parseInt(elem.examination_defective) || 0) +
                      (parseInt(elem.qc_defectives) || 0)
                    // 全都沒有編輯過就為0
                    if (elem.calibration_first_defectives !== undefined)
                      memo.calibration_first_defectives +=
                        elem.calibration_first_defectives
                    return memo
                  },
                  {
                    defectives: 0,
                    calibration_first_defectives: 0,
                  }
                )
              })
              context.isDBDataGet = true
            },
          }
        )
      },

      getHippoData: function (orderOrSampleObj) {
        var context = this
        context.hippoData = undefined

        hippo
          .newMashupExhaler()
          .space('HUL_die_change_product:dcp')
          .index('order_id', _.pluck(orderOrSampleObj, 'macro523'))

          .space('HUL_jia_quality_product:jqp')
          .index('order_id', _.pluck(orderOrSampleObj, 'macro523'))

          .column('dcp', 'order_id')
          .column('dcp', 'multi_process')
          .column('dcp', 'machine_id')
          .column('dcp', 'macro521')
          .column('dcp', 'std_minute')
          .column('dcp', 'regulate_start')
          .column('dcp', 'regulate_end')
          .column('dcp', 'regulate_time')

          .column('jqp', 'order_id')
          .column('jqp', 'multi_process')
          .column('jqp', 'work_shift_name')
          .column('jqp', 'machine_id')
          .column('jqp', 'care_partcount')
          .mashupKey('order_id', 'machine_id', 'multi_process')
          .exhale(function (exhalable) {
            console.log(exhalable.exhalable)
            var dcpObjs = []
            _.each(exhalable.exhalable, function (elem) {
              var dcpObj = elem.HUL_die_change_product[0]
              if (dcpObj) {
                dcpObj.care_partcount = _.reduce(
                  elem.HUL_jia_quality_product,
                  function (memo, jqp) {
                    return memo + parseInt(jqp.care_partcount)
                  },
                  0
                )
                dcpObjs.push(dcpObj)
              }
            })
            context.hippoData = context.filterGroup(dcpObjs)
            context.isHippoDataGet = true
          })

        //      hippo.newSimpleExhaler()
        //          .space("HUL_die_change_product")
        //          .index("order_id", _.pluck(orderOrSampleObj, "macro523"))
        //          .columns(
        //              "order_id",
        //              "multi_process",
        //              "machine_id",
        //              "macro521",
        //              "std_minute",
        //              "care_partcount",
        //              "regulate_start",
        //              "regulate_end",
        //              "regulate_time"
        //          )
        //          .exhale(function (exhalable) {
        //            context.hippoData = context.filterGroup(exhalable.exhalable);
        //          });
      },
      filterGroup: function (exhalable) {
        var context = this
        //廠務校車、研發校車，僅可查詢自己的紀錄
        var queryGroup = [
            context.commons.factory_service_regulate,
            context.commons.rd_regulate,
          ],
          //admin, 高階主管，廠務部副理，業務副理，研發副理，業務副課，研發副課，製一課課長，製二課課長，可查詢所有人
          noLimitGroup = [
            context.commons.sys_super_admin_group,
            context.commons.sys_manager_group,
            context.commons.top_manager,
            context.commons.factory_service_deputy_manager,
            context.commons.sales_manager,
            context.commons.rd_manager,
            context.commons.sales_deputy_manager,
            context.commons.rd_deputy_manager,
            context.commons.process_manager_1,
            context.commons.process_manager_2,
          ]

        var userGroupList = JSON.parse(sessionStorage.loginInfo).user_group
        var userId = JSON.parse(sessionStorage.loginInfo).user_id
        //不包含可查詢全部的群組，僅包含查詢自己的群組
        if (
          !_.intersection(userGroupList, noLimitGroup).length &&
          _.intersection(userGroupList, queryGroup).length
        ) {
          console.log('can only query self.')
          exhalable = _.filter(exhalable, function (elem) {
            elem.macro521 = context.commons.fillZeroTo5Digit(elem.macro521)
            return elem.macro521 == userId
          })
        }

        return exhalable
      },
      processData: function () {
        var loadingBtn = this.loadingBtn,
          context = this,
          orderId = context.$orderId.val(),
          sampleId = context.$sampleId.val()

        //管編alert
        if (!_.isEmpty(context.hippoData) && sampleId) {
          context.commons.addAlertHtml('【管編：' + sampleId + '】')
        } else if (!_.isEmpty(context.hippoData) && orderId) {
          var standard_id = _.find(context.preCon.getProductList, function (
            elem
          ) {
            return elem.order_id == orderId
          })
          standard_id = standard_id ? standard_id.standard_id : ''
          context.commons.addAlertHtml('【管編：' + standard_id + '】')
        }

        var tableData = _.map(context.hippoData, function (elem) {
          //可能有多個校車人員
          var regulators = _.contains(elem.macro521, '#')
            ? _.map(_.uniq(elem.macro521.split('#')), function (macro521) {
                var employeeId = context.commons.fillZeroTo5Digit(macro521)
                return context.commons.getUserName(
                  context.preCon.getUserList,
                  employeeId
                )
              }).join(', ')
            : context.commons.getUserName(
                context.preCon.getUserList,
                elem.macro521
              )

          var key = [elem.order_id, elem.multi_process, elem.machine_id].join(
            '@@'
          )

          var qc = context.DBData[key]
              ? (
                  (elem.care_partcount - context.DBData[key].defectives) /
                  elem.care_partcount
                ).floatToPercentage()
              : '100.00%',
            orderObj = context.commons.getOrderIdOrSampleId(
              context.groupedProductList,
              context.groupedSampleList,
              elem.order_id
            ),
            // 沒有編輯過就顯示0
            calibration_first_defectives = context.DBData[key]
              ? context.DBData[key].calibration_first_defectives
              : 0
          return [
            //訂單編號
            orderObj.order_id,
            //多次製程
            context.commons.getMultiProcess(elem.multi_process),
            //機台
            servkit.getMachineName(elem.machine_id),
            //校車人員
            regulators,
            //校車開始時間
            elem.regulate_start.date20BitsToFormatted(),
            //校車結束時間
            elem.regulate_end.date20BitsToFormatted(),
            //校車累積時間, 為了算加總就不先處理顯示的格式
            elem.regulate_time.millisecondToHHmmss(),
            //校車首車不良品
            calibration_first_defectives,
            //單顆生產時間(秒)
            elem.std_minute.toFixed(0),
            //生產總顆數(實際產量)
            elem.care_partcount,
            //總品質稼動率
            qc,
          ]
        })

        context.reportTable.drawTable(tableData)
        loadingBtn.done()
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
