import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      var commons = context.commons
      //    var folderStruct = context.folderStruct;
      var graceParam = context.graceParam || undefined
      var tooltipOtherMacros, otherMacroObj
      var macroPath =
        'app/' +
        document.location.hash.split('/').slice(1, 4).join('/') +
        '/macro.json'
      $.getJSON(macroPath)
        .done(function (macroObj) {
          var productConsumeTimeByWorkOrder = {}, //{product_id@@work_order_id :[{}, ...], ...}
            productConsumeTimeHeader = [
              'device_id',
              'date',
              'product_id',
              'work_order_id',
              'power_time',
              'operation_time', //5
              'cutting_time',
              'idle_time',
              'start_tsp',
              'end_tsp',
              'total_time',
              'standard_work_time',
              'process_department', //12
              'process_device',
              'process_step',
              'editor',
              'ext_qty',
            ].concat(_.keys(macroObj), ['part_count'])
          _.each(macroObj, function (key, value) {
            context.workOrderDetailColumns.push({
              data: value,
              title: key,
              format: { type: 'floatMinutesToMS' },
            })
          })
          var workOrderTable = commons.growDataTable(
            context.$workOrderTable,
            context.workOrderColumns,
            commons.workOrderOptions
          ) //製令閒置
          var workOrderOverallTable = commons.growDataTable(
            context.$workOrderOverallTable,
            context.workOrderOverallColumns,
            commons.workOrderOverallOptions
          ) //製令總覽
          var workOrderDetailTable = commons.growDataTable(
            context.$workOrderDetailTable,
            context.keyValueTHead,
            commons.workOrderDetailOptions
          ) //製令閒置細節

          pageSetUp()
          context.init()
          context.demo(context)
          context.equipmentExcel()
          commons.workOrderExcel(workOrderTable)
          commons.workOrderOverallExcel(workOrderOverallTable)
          commons.workOrderDetailExcel(workOrderDetailTable)

          $('#submit').on('click', function (e) {
            e.preventDefault()
            context.loadingBtn.doing()

            var productId = [context.$productId.val()]
            var workOrder = [context.$workOrder.val()]
            var folderStruct = context.folderStruct

            if (productId[0] === '' && workOrder[0] === '') {
              productId = _.keys(folderStruct)
              workOrder = _.flatten(_.values(folderStruct))
            } else if (productId[0] === '') {
              productId = _.keys(folderStruct)
            } else if (workOrder[0] === '') {
              workOrder = folderStruct[productId]
            }

            servkit.ajax(
              {
                url: 'api/getdata/file',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                  type: 'product_consume_time_by_work_order',
                  pathPattern:
                    '{machineList}/{productId}/{workOrderId}/{productId}@@{workOrderId}.csv',
                  pathParam: {
                    machineList: (function () {
                      var machineList = []
                      servkit.eachMachine(function (machineId) {
                        machineList.push(machineId)
                      })
                      return machineList
                    })(),
                    productId: _.uniq(productId),
                    workOrderId: _.uniq(workOrder),
                  },
                }),
              },
              {
                success: function (data) {
                  productConsumeTimeByWorkOrder = _.chain(data)
                    .map(function (elem) {
                      var partCount = elem.pop()
                      var macroArray = parseMacro(elem.pop())
                      return _.object(
                        productConsumeTimeHeader,
                        elem.concat(macroArray, partCount)
                      )
                    })
                    .groupBy(function (obj) {
                      return obj.product_id + '@@' + obj.work_order_id
                    })
                    .value()

                  if (_.keys(productConsumeTimeByWorkOrder).length !== 0) {
                    $('.jarviswidget:gt(1)').find('.fa-minus').click() //collapse last three widgets
                    productConsumeTimeByWorkOrder = commons.getProductConsumeTimeByWorkOrder(
                      productConsumeTimeByWorkOrder,
                      _.keys(macroObj),
                      true
                    )
                    console.log(productConsumeTimeByWorkOrder)
                    workOrderTable
                      .clear()
                      .rows.add(_.values(productConsumeTimeByWorkOrder))
                      .draw()
                  } else {
                    commons.noDataAction()
                  }

                  context.loadingBtn.done()
                },
                fail: function (data, textStatus, jqXHR) {
                  console.log(textStatus)
                },
              }
            )
          })

          context.$workOrderTable.on('click', 'tr', function (e) {
            e.preventDefault()

            var rowData = workOrderTable.row(this).data()
            var key = rowData.product_id + '@@' + rowData.work_order_id
            var data = productConsumeTimeByWorkOrder[key]

            workOrderOverallTable.clear().rows.add([data]).draw()
            workOrderDetailTable
              .clear()
              .rows.add(
                commons.objectToKeyValueArray(
                  data,
                  context.workOrderDetailColumns
                )
              )
              .draw()
            commons.workOrderDetailPieChart(
              data,
              _.keys(macroObj),
              context.$workOrderDetailChart
            )
          })

          function parseMacro(macros, productConsumeTimeObj) {
            var macroArray = [],
              macroMap = {},
              //M1, M2, ...M999
              macroId = _.keys(macroObj),
              otherMacroSum = 0

            //MO-37.90245!M3-12.96068!O834-83.264 => {"M1": "0.000", "O834": "83.264"...}
            macros.split('!').forEach(function (elem, index) {
              if (elem !== '') {
                macroMap[elem.split('-')[0]] = elem.split('-')[1]
              }
            })

            //沒出現的無效代碼補0
            _.each(macroId, function (elem) {
              if (macroMap[elem]) {
                macroArray.push(macroMap[elem])
              } else {
                macroArray.push('0.000')
              }
            })

            if (productConsumeTimeObj && macros !== '') {
              //for productConsumeTime
              //otherMacroObj = {MO:93.255, O834:83.264}
              //將未定義的 macro 加總到 otherMacroObj 中
              _.each(_.difference(_.keys(macroMap), macroId), function (
                otherMacro
              ) {
                otherMacroSum += parseFloat(macroMap[otherMacro])
                if (!productConsumeTimeObj[2].startsWith('LAST_IDLE'))
                  //生產間隔的macro要另外加總，所以不是生產間隔才把macro加到細項中，不然加到others裡面就扣不掉了
                  otherMacroObj[otherMacro] = otherMacroObj[otherMacro]
                    ? otherMacroObj[otherMacro] +
                      parseFloat(macroMap[otherMacro])
                    : parseFloat(macroMap[otherMacro])
              })
            } else if (!productConsumeTimeObj && macros !== '') {
              //for productConsumeTimeByWorkOrder
              _.each(_.difference(_.keys(macroMap), macroId), function (
                otherMacro
              ) {
                otherMacroSum += parseFloat(macroMap[otherMacro])
              })
            }
            //M999 改成其他了，所以直接把不在事先定義的macro的閒置時間規於M999(最後一個macro)裡
            macroArray[macroArray.length - 1] = otherMacroSum

            return macroArray
          }
        })
        .fail(function (d, textStatus, error) {
          console.error(
            'getJSON failed, status: ' + textStatus + ', error: ' + error
          )
        })
    },
    util: {
      $stkReportForm: $('#stk-report-form'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit')),
      $productId: $('[name=product_id]'),
      $workOrder: $('[name=work_order_id]'),
      $workOrderTable: $('#work-order-table'), //製令閒置
      $workOrderOverallTable: $('#work-order-overall-table'), //製令總覽
      $workOrderDetailTable: $('#work-order-detail-table'), //製令閒置細節
      $workOrderDetailChart: $('#stk-pie-chart'),
      $workOrderDetailChartWidget: $('#pie-chart-widget'),
      keyValueTHead: [
        //機台閒置細節, 製令閒置細節
        { data: 'column', title: `${i18n('Column')}`, className: 'text-left' },
        {
          data: 'value',
          title: `${i18n('Value')}`,
          className: 'text-right',
          format: { type: 'floatMinutesToMS' },
        },
      ],
      workOrderColumns: [
        //製令閒置
        { data: 'device_id', title: `${i18n('Machine')}` },
        {
          data: 'product_id',
          title: `${i18n('N1')}`,
          format: { type: 'LAST_IDLE' },
          tooltip: `${i18n('N1_Tooltip')}`,
        },
        {
          data: 'work_order_id',
          title: `${i18n('N2')}`,
          format: { type: 'LAST_IDLE' },
        },
        {
          data: 'M2',
          title: `${i18n('M2')}`,
          format: { type: 'floatMinutesToMS' },
        },
        {
          data: 'operation_time',
          title: `${i18n('Operation_Time')}`,
          format: { type: 'floatMinutesToMS' },
        },
        {
          data: 'idle_time',
          title: `${i18n('Downtime')}`,
          format: { type: 'floatMinutesToMS' },
        },
      ],
      workOrderOverallColumns: [
        //製令總覽
        {
          data: 'product_id',
          title: `${i18n('N1')}`,
          format: { type: 'LAST_IDLE' },
        },
        {
          data: 'work_order_id',
          title: `${i18n('N2')}`,
          format: { type: 'LAST_IDLE' },
        },
        {
          data: 'start_tsp',
          title: `${i18n('Start_Time')}`,
          format: { type: 'time' },
          dataHide: 'phone,tablet',
        },
        {
          data: 'end_tsp',
          title: `${i18n('End_Time')}`,
          format: { type: 'time' },
          dataHide: 'phone,tablet',
        },
        {
          data: 'total_time',
          title: `${i18n('Total_Process_Time')}`,
          format: { type: 'floatMinutesToMS' },
        },
        {
          data: 'process_department',
          title: `${i18n('N4')}`,
          dataHide: 'phone,tablet',
        },
        {
          data: 'process_device',
          title: `${i18n('N5')}`,
          dataHide: 'phone,tablet',
        },
        {
          data: 'process_step',
          title: `${i18n('N6')}`,
          dataHide: 'phone,tablet',
        },
        { data: 'editor', title: `${i18n('N7')}`, dataHide: 'phone,tablet' },
        {
          data: 'standard_work_time',
          title: `${i18n('N3')}`,
          dataHide: 'phone',
          format: { type: 'floatMinutesToMS' },
        },
        {
          data: 'act_work_time',
          title: `${i18n('Act_Work_Time')}`,
          dataHide: 'phone',
          format: { type: 'floatMinutesToMS' },
          tooltip: `${i18n('Total_Process_Time')} / ${i18n('Part_Count')}`,
        },
        {
          data: 'work_time_ratio',
          title: `${i18n('Work_Time_Ratiio')}`,
          format: { type: 'percentage', digit: 2 },
          tooltip: `${i18n('Act_Work_Time')} / ${i18n('N3')}`,
        },
        { data: 'ext_qty', title: `${i18n('Ext_Qty')}`, dataHide: 'phone' }, //改為N8
        {
          data: 'part_count',
          title: `${i18n('Part_Count')}`,
          dataHide: 'phone',
        },
        {
          data: 'output_ratio',
          title: `${i18n('Achievement')}`,
          format: { type: 'percentage', digit: 2 },
          tooltip: `${i18n('Part_Count')} / ${i18n('Ext_Qty')}`,
        },
      ],
      workOrderDetailColumns: [
        //製令閒置細節
        //      {data: "M1", title: `${i18n('M1')}`},
        //      {data: "M2", title: `${i18n('M2')}`},
        //      {data: "M3", title: `${i18n('M3')}`},
        //      {data: "M4", title: `${i18n('M4')}`},
        //      {data: "M5", title: `${i18n('M5')}`},
        //      {data: "M6", title: `${i18n('M6')}`},
        //      {data: "M7", title: `${i18n('M7')}`},
        //      {data: "M8", title: `${i18n('M8')}`},
        //      {data: "M9", title: `${i18n('M9')}`},
        //      {data: "M10", title: `${i18n('M10')}`},
        //      {data: "M999", title: `${i18n('M999')}`}
        //      {data:"others", title:i18n_appware_downtimeAnalysis_others}
      ],
      productConsumTimeByWorkOrder: {}, //{"product@@workOrder":{...}, ...}
      folderStruct: {},
      init: function () {
        var $productId = this.$productId
        var $workOrder = this.$workOrder
        var folderStruct = this.folderStruct

        servkit.ajax(
          {
            url: 'api/datafolder/structure',
            type: 'GET',
            contentType: 'application/json',
            data: { dataName: 'product_consume_time_by_work_order' },
          },
          {
            success: function (data) {
              //"{"CNC1":{"405003530 G":{"51020150422003":["405003530 G@@51020150422003.csv"]},
              //          "L-60004":{"510-20150723006":["L-60004@@510-20150723006.csv"]}},
              //  "CNC2":{"405003530 G":{"510 20150422003":["405003530 G@@510 20150422003.csv"]},
              //          "405011511 -C":{"510- 20141204001":["405011511 -C@@510- 20141204001.csv"]},
              //          "405011511 C":{"510 20150421004":["405011511 C@@510 20150421004.csv"]}}}"
              servkit.eachMachine(function (device_id) {
                var productIdArray = _.keys(data[device_id])
                _.each(productIdArray, function (productId) {
                  if (folderStruct[productId]) {
                    //如果產編已經存在
                    folderStruct[productId] = folderStruct[productId].concat(
                      _.keys(data[device_id][productId])
                    )
                  } else {
                    //該產編下所有製令
                    folderStruct[productId] = _.keys(data[device_id][productId])
                  }
                })
              })
              console.log(folderStruct)

              $productId.autocomplete({
                source: _.keys(folderStruct),
              })

              $workOrder.on('focus', function () {
                if (folderStruct[$productId.val()]) {
                  //如果產編存在
                  $workOrder.autocomplete({
                    source: folderStruct[$productId.val()],
                  })
                } else {
                  $workOrder.autocomplete('destroy')
                }
              })
            },
            fail: function (data, textStatus, jqXHR) {
              console.log(textStatus)
            },
          }
        )
      },
      demo: function (e) {
        var $stkReportForm = this.$stkReportForm
        $('#showdemo').on('click', function (e) {
          e.preventDefault()
          $stkReportForm.find('[name=product_id]').val('405003604')
          $stkReportForm.find('[name=work_order_id]').val('51020160112001')
          $('#submit').click()
        })
      },
      _safePlus: function (elemValue, objValue) {
        return isNaN(parseFloat(elemValue))
          ? objValue
          : parseFloat(elemValue) + parseFloat(objValue)
      },
    },
    delayCondition: ['machineList'],
    dependencies: [
      [
        '/js/plugin/flot/jquery.flot.cust.min.js',
        '/js/plugin/flot/jquery.flot.resize.min.js',
        '/js/plugin/flot/jquery.flot.fillbetween.min.js',
        '/js/plugin/flot/jquery.flot.pie.min.js',
        '/js/plugin/flot/jquery.flot.tooltip.min.js',
        '/js/plugin/flot/jquery.flot.axislabels.js',
      ],
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
