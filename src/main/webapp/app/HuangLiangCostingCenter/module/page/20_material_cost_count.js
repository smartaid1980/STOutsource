export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.reportTable = createReportTable({
        $tableElement: $('#table'),
        $tableWidget: $('#table-widget'),
        rightColumn: [1, 2, 4, 6, 7],
        excel: {
          fileName: 'MaterialCostCount',
          format: ['text', '0', '0', 'text', '0.00', 'text', '0.00', '0'],
        },
      })
      context.reportTableDetail = createReportTable({
        $tableElement: $('#table-detail'),
        $tableWidget: $('#table-widget'),
        rightColumn: [2, 4, 6],
        excel: {
          fileName: 'MaterialCostCountDetail',
          format: ['text', 'text', '0', 'text', '0.00', 'text', '0.00'],
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
        context.loadingBtn.doing()
        try {
          context.getData(context)
        } catch (error) {
          console.error(error)
        } finally {
          context.loadingBtn.done()
        }
      })
    },
    util: {
      $orderId: $('#order_id'),
      $manageId: $('#manage_id'),
      manageId: '',
      $submitBtn: $('#submit-btn'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      reportTable: undefined,
      reportTableDetail: undefined,
      getData(ctx) {
        let orderId = ctx.$orderId.val()
        let manageId = ctx.$manageId.val()
        let orderOrSampleObj = ctx.commons.getMacro523ByOrderIdOrSampleId(
          orderId,
          manageId,
          ctx.preCon.getProductList,
          ctx.preCon.getSampleList
        )
        let orderList = _.pluck(orderOrSampleObj, 'order_id')

        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_huangliang_view_wl_wms_wmm_wmml_ms',
              columns: [
                'order_id',
                'order_qty',
                'wo_pqty',
                'mat_id',
                'type',
                'use_qty',
                'use_piece',
                'mat_length',
                'unit',
                'mat_price',
                'use_cost',
                'machine_id',
                'mat_code',
                'm_pqty',
                'wo_m_time',
                'm_mat_time',
              ],
              whereClause: `item_status="9" AND order_id IN ("${orderList.join(
                '", "'
              )}")`,
            }),
          },
          {
            success(data) {
              console.log(data)

              //管編alert
              if (data.length && manageId) {
                ctx.commons.addAlertHtml(`【管編：${manageId}】`)
              } else if (data.length && orderId) {
                var standard_id = _.find(ctx.preCon.getProductList, function (
                  elem
                ) {
                  return elem.order_id == orderId
                })
                standard_id = standard_id ? standard_id.standard_id : ''
                ctx.commons.addAlertHtml(`【管編：${standard_id}】`)
              }

              let result = {}
              let resultDetail = {}
              let wmsKeys = []
              let wmmKeys = []
              _.each(data, (obj) => {
                let {
                  order_id,
                  order_qty,
                  wo_pqty,
                  mat_id,
                  type,
                  use_qty,
                  use_piece,
                  mat_length,
                  unit,
                  mat_price,
                  machine_id,
                  mat_code,
                  m_pqty,
                  wo_m_time,
                  m_mat_time,
                } = obj
                // 材料總成本
                if (!result[order_id]) {
                  result[order_id] = {
                    /*訂單編號*/ order_id,
                    /*訂單數*/ order_qty,
                    /*生產總數量*/ wo_pqty,
                    /*材料編碼*/ mat_id,
                    /*領補料總數量*/ qty: 0,
                    /*單位*/ unit,
                    /*領補料總金額*/ cost: 0,
                    /*領補料總次數*/ count: 0,
                  }
                }
                // 各機台使用明細
                const key = [order_id, machine_id, mat_code].join('@@')
                if (!resultDetail[key]) {
                  resultDetail[key] = {
                    /*訂單編號*/ order_id,
                    /*機台名稱*/ machine_name: servkit.getMachineName(
                      machine_id
                    ),
                    /*已生產數量*/ m_pqty: 0,
                    /*材料條碼*/ mat_code,
                    /*領補料派工數*/ qty: 0,
                    /*單位*/ unit,
                    /*領補料總金額*/ cost: 0,
                  }
                }

                let qty = use_qty
                if (unit != 'KG') {
                  qty = (use_piece * mat_length.replace('mm', '')) / 1000
                }

                if (type == '3') {
                  // 退庫
                  result[order_id].qty -= qty
                  result[order_id].cost -= qty * mat_price

                  resultDetail[key].qty -= qty
                  resultDetail[key].cost -= qty * mat_price
                } else {
                  result[order_id].qty += qty
                  result[order_id].cost += qty * mat_price
                  let wmmKey = [
                    order_id,
                    machine_id,
                    wo_m_time,
                    m_mat_time,
                  ].join('@@')
                  if (wmmKeys.indexOf(wmmKey) === -1) {
                    result[order_id].count++
                    wmmKeys.push(wmmKey)
                  }

                  resultDetail[key].qty += qty
                  resultDetail[key].cost += qty * mat_price
                }

                if (wmsKeys.indexOf(key) === -1) {
                  resultDetail[key].m_pqty += m_pqty
                  wmsKeys.push(key)
                }
              })

              ctx.reportTable.drawTable(
                _.map(result, (obj) => {
                  let {
                    order_id,
                    order_qty,
                    wo_pqty,
                    mat_id,
                    qty,
                    unit,
                    cost,
                    count,
                  } = obj
                  return [
                    order_id,
                    order_qty,
                    wo_pqty,
                    mat_id,
                    qty.toFixed(2),
                    unit,
                    '$' + cost.toFixed(2),
                    count,
                  ]
                })
              )

              ctx.reportTableDetail.drawTable(
                _.map(resultDetail, (obj) => {
                  let {
                    order_id,
                    machine_name,
                    m_pqty,
                    mat_code,
                    qty,
                    unit,
                    cost,
                  } = obj
                  return [
                    order_id,
                    machine_name,
                    m_pqty,
                    mat_code,
                    qty.toFixed(2),
                    unit,
                    '$' + cost.toFixed(2),
                  ]
                })
              )
            },
          }
        )
      },
    },
    preCondition: {
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
