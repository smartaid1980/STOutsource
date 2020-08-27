export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.reportTable = createReportTable({
        $tableElement: $('#table'),
        $tableWidget: $('#table-widget'),
        rightColumn: [2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 15, 16],
        onDraw() {
          context.drawChart(context)
        },
        excel: {
          fileName: 'WorkOrderCostCount',
          format: [
            'text',
            'text',
            '0',
            '0',
            '0',
            'text',
            '0.00',
            '0',
            '0.00',
            '0.00',
            '0.00',
            'text',
            '0.00',
            '0.00',
            '0.00',
            'text',
            '0.00',
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

        $('#chart-widget-body').empty()
        context.loadingBtn.doing()
        try {
          let orderId = context.$orderId.val()
          let manageId = context.$manageId.val()
          let orderOrSampleObj = context.commons.getMacro523ByOrderIdOrSampleId(
            orderId,
            manageId,
            context.preCon.getProductList,
            context.preCon.getSampleList
          )
          let orderList = _.pluck(orderOrSampleObj, 'order_id')

          Promise.all([
            context.getDBData(context, orderList),
            context.getHippoData(context, orderOrSampleObj),
          ]).then((values) => {
            // 管編alert
            if (manageId) {
              context.commons.addAlertHtml(`【管編：${manageId}】`)
            } else if (orderId) {
              var standard_id = _.find(context.preCon.getProductList, function (
                elem
              ) {
                return elem.order_id == orderId
              })
              standard_id = standard_id ? standard_id.standard_id : ''
              context.commons.addAlertHtml(`【管編：${standard_id}】`)
            }

            context.$chartWidgetBody.empty()
            console.log(values)

            let result = {}
            let wmsKeys = []
            let tmlKeys = []
            let wmmlKeys = []
            _.each(values[0], (obj) => {
              let {
                order_id,
                type,
                mat_use_qty,
                use_piece,
                mat_length,
                unit,
                mat_price,
                machine_id,
                wo_m_time,
                m_pqty,
                m_qty,
                m_bqty,
                m_mat_time,
                shelf_time,
                type_for,
                tool_use_no,
                buy_time,
                tool_id,
                tsup_id,
                tool_location,
                tool_use_for,
                tool_use_qty,
                tool_cost,
                quoted_by,
                quote_price,
                process_cost,
              } = obj

              let m523 =
                order_id.slice(0, 1) +
                order_id.slice(3, 8) +
                '.' +
                order_id.slice(8, 11)
              while (m523.endsWith('0')) {
                // 因為控制器那邊把m523當數字讀取，所以會把小數點後的零去掉
                m523 = m523.slice(0, -1)
              }
              let key = m523 + '@@' + machine_id
              // 材料總成本
              if (!result[key]) {
                let cncCost = values[1][key]
                  ? (
                      (values[1][key].cncCostTotalTime / 60000) *
                      process_cost
                    ).toFixed(2)
                  : '---'
                let cncCostTime = values[1][key]
                  ? values[1][key].prefix +
                    values[1][key].cncCostTotalTime.millisecondToDHMS()
                  : '---'
                result[key] = {
                  /*訂單編號*/ order_id,
                  /*機台編號*/ machine_id: servkit.getMachineName(machine_id),
                  /*機台派工數*/ m_qty: 0,
                  /*生產數*/ m_pqty: 0,
                  /*生產不良數*/ m_bqty: 0,
                  /*CNC成本總時間*/ cncCostTime,
                  /*CNC加工總金額*/ cncCost,
                  /*刀具使用總數*/ tool_use_qty: 0,
                  /*刀具成本總金額*/ tool_cost: 0,
                  /*材料使用總數量*/ qty: 0,
                  /*材料單位*/ unit,
                  /*材料成本總金額*/ mat_cost: 0,
                  /*訂單總成本*/ total_cost: 0,
                  /*單顆加工成本*/ unit_cost: 0,
                  /*報價業務人員*/ quoted_by,
                  /*單顆報價金額*/ quote_price,
                  /*差異比%*/ diff_ratio: 0,
                }
              }

              // wo_m_status
              let wmsKey = `${order_id}@@${machine_id}@@${wo_m_time}`
              if (wmsKeys.indexOf(wmsKey) === -1) {
                result[key].m_qty += m_qty
                result[key].m_pqty += m_pqty
                result[key].m_bqty += m_bqty
                wmsKeys.push(wmsKey)
              }

              let tmlKey = `${tool_use_no}@@${buy_time}@@${tool_id}@@${tsup_id}@@${tool_location}@@${tool_use_for}`
              if (tmlKeys.indexOf(tmlKey) === -1) {
                //刀具使用總數: 加總狀態非取消且成本分類為刀具的量產領刀明細領刀數量
                if (type_for == '01') {
                  result[key].tool_use_qty += tool_use_qty
                }
                // 刀具成本總金額: 加總狀態非取消的量產量產領刀明細使用成本
                result[key].tool_cost += tool_cost
                tmlKeys.push(tmlKey)
              }

              let wmmlKey = `${order_id}@@${machine_id}@@${wo_m_time}@@${m_mat_time}@@${shelf_time}`
              if (wmmlKeys.indexOf(wmmlKey) === -1) {
                // 材料使用總數量: 金屬類：加總領料、補料use_qty，扣除退庫的use_qty。加總領料、補料的use_piece* mat_length/1000，扣除退庫的use_piece* mat_length/1000。
                let qty = mat_use_qty
                if (unit != 'KG') {
                  qty = (use_piece * mat_length.replace('mm', '')) / 1000
                }
                if (type == '3') {
                  // 退庫
                  result[key].qty -= qty
                  result[key].mat_cost -= qty * mat_price
                } else {
                  result[key].qty += qty
                  result[key].mat_cost += qty * mat_price
                  result[key].count++
                }
                wmmlKeys.push(wmmlKey)
              }
            })

            context.chartData = {}
            context.reportTable.drawTable(
              _.map(result, (obj) => {
                let {
                  order_id,
                  machine_id,
                  m_qty,
                  m_pqty,
                  m_bqty,
                  cncCostTime,
                  cncCost,
                  tool_use_qty,
                  tool_cost,
                  qty,
                  unit,
                  mat_cost,
                  total_cost,
                  unit_cost,
                  quoted_by,
                  quote_price,
                  diff_ratio,
                } = obj
                // 實際訂單總成本：實際CNC設備成本＋實際刀具成本總金額+實際材料使用總金額
                total_cost =
                  cncCost === '---'
                    ? parseFloat(tool_cost) + parseFloat(mat_cost)
                    : parseFloat(cncCost) +
                      parseFloat(tool_cost) +
                      parseFloat(mat_cost)
                // 實際單顆加工成本：實際訂單總成本/(實際生產數量-實際生產不良數)
                unit_cost =
                  m_pqty == m_bqty
                    ? '---'
                    : (total_cost / (m_pqty - m_bqty)).toFixed(2)
                // 差異比%：（單顆報價金額-實際單顆加工成本）/單顆報價金額 (允許負數)
                diff_ratio = quote_price
                  ? ((quote_price - unit_cost) / quote_price).floatToPercentage(
                      2,
                      true
                    )
                  : '---'

                if (context.chartData[order_id]) {
                  context.chartData[order_id].cncCost += cncCost
                  context.chartData[order_id].tool_cost += tool_cost
                  context.chartData[order_id].mat_cost += mat_cost
                } else {
                  context.chartData[order_id] = { cncCost, tool_cost, mat_cost }
                }
                return [
                  order_id,
                  machine_id,
                  m_qty,
                  m_pqty,
                  m_bqty,
                  cncCostTime,
                  cncCost,
                  tool_use_qty,
                  tool_cost,
                  qty.toFixed(2),
                  unit,
                  mat_cost.toFixed(2),
                  total_cost.toFixed(2),
                  unit_cost,
                  quoted_by,
                  quote_price,
                  diff_ratio,
                ]
              })
            )

            context.loadingBtn.done()
          })
        } catch (error) {
          console.error(error)
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
      $chartWidgetBody: $('#chart-widget-body'),
      reportTable: undefined,
      reportTableDetail: undefined,
      getHippoData: async (ctx, orderOrSampleObj) => {
        const costCountMap = await ctx.commons.getDateData(
          _.pluck(orderOrSampleObj, 'macro523')
        )
        return new Promise((res) =>
          hippo
            .newSimpleExhaler()
            .space('HUL_cost_count')
            .index('order_id', _.uniq(_.pluck(costCountMap, 'order_id')))
            .index('machine_id', _.uniq(_.pluck(costCountMap, 'machine_id')))
            .index('dates', _.uniq(_.pluck(costCountMap, 'date')).sort()) // 不排時序會亂掉
            .columns(
              'order_id',
              'machine_id',
              'date',
              'start_time',
              'end_time',
              'duration',
              'm522'
            )
            .exhale(function (data) {
              let cncCostMap = {}
              let hippoDateFormat = 'YYYYMMDDHHmmss'
              // 該單在該機台加工的紀錄
              let orderMachineMap = _.groupBy(
                data.exhalable,
                (elem) => `${elem.order_id}@@${elem.machine_id}`
              )
              _.each(orderMachineMap, (records, key) => {
                let first300,
                  last103,
                  isOrderStart = false
                let [orderTotalTime, waitTillEight, cncCostTotalTime] = [
                  0,
                  0,
                  0,
                ] //訂單花費總時間, 機台下線待機時間, CNC成本總時間
                _.each(records, (obj) => {
                  let m522 = obj.m522
                  if (!first300 && m522 === '300') {
                    // find first
                    first300 = moment(obj.start_time, hippoDateFormat)
                    isOrderStart = true
                  } else if (m522 === '103') {
                    // find last
                    last103 = moment(obj.start_time, hippoDateFormat)
                    isOrderStart = false
                  }

                  if (isOrderStart) {
                    // 300~103
                    orderTotalTime += parseInt(obj.duration)
                  }
                })

                cncCostTotalTime = orderTotalTime
                if (last103) {
                  // 103~隔天早上八點
                  let eight = moment(last103.format('YYYY/MM/DD') + ' 08:00:00')
                  waitTillEight = eight - last103
                  waitTillEight =
                    waitTillEight < 0
                      ? waitTillEight + 24 * 60 * 60 * 1000
                      : waitTillEight
                  cncCostTotalTime += parseInt(waitTillEight) // 300~103~隔天早上八點
                }
                let prefix = last103 ? '' : '*' //若訂單尚未結束，訂單花費總時間、CNC成本總時間、量產時間前墜加上'*'表示還會增加
                cncCostMap[key] = {
                  prefix,
                  cncCostTotalTime,
                }
              })
              res(cncCostMap)
            })
        )
      },
      getDBData(ctx, orderList) {
        return new Promise((res) => {
          servkit.ajax(
            {
              url: 'api/getdata/db',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                table:
                  'a_huangliang_view_wl_wms_wmm_wmml_ms as v1 left JOIN a_huangliang_view_tool_cost as v2 on v1.order_id=v2.order_id and v1.machine_id = v2.machine_id JOIN a_huangliang_mac_list as t3 on v2.machine_id = t3.machine_id',
                columns: [
                  'v1.order_id',
                  'v1.type',
                  'v1.use_qty as mat_use_qty',
                  'v1.use_piece',
                  'v1.mat_length',
                  'v1.unit',
                  'v1.mat_price',
                  'v1.machine_id',
                  'v1.wo_m_time',
                  'v1.m_mat_time',
                  'v1.shelf_time',
                  'v1.m_qty',
                  'v1.m_pqty',
                  'v1.m_bqty',
                  'v2.type_for',
                  'v2.tool_use_no',
                  'v2.buy_time',
                  'v2.tool_id',
                  'v2.tsup_id',
                  'v2.tool_location',
                  'v2.tool_use_for',
                  'v2.use_qty as tool_use_qty',
                  'v2.use_cost as tool_cost',
                  'v1.quoted_by',
                  'v1.quote_price',
                  't3.process_cost',
                ],
                whereClause: `v1.item_status="9" AND v2.uselist_status <> 99 AND v1.order_id IN ("${orderList.join(
                  '", "'
                )}")`,
              }),
            },
            {
              success(data) {
                res(data)
              },
            }
          )
        })
      },
      drawChart(ctx) {
        _.each(ctx.chartData, (obj, order_id) => {
          let $orderPie = $(`<div id="${order_id}" style="width: 280px;height: 320px; padding: 10px;">
            <div class="text-center font-xl">${order_id}</div>
            <div class="chart" style="width: 230px;height: 230px;"></div>
            </div>`)
          ctx.$chartWidgetBody.append($orderPie)

          var pieData = [
            {
              label: 'CNC',
              data: parseFloat(obj.cncCost).toFixed(2),
              color: servkit.colors.blue,
            },
            {
              label: '刀具',
              data: parseFloat(obj.tool_cost).toFixed(2),
              color: servkit.colors.green,
            },
            {
              label: '材料',
              data: parseFloat(obj.mat_cost).toFixed(2),
              color: servkit.colors.yellow,
            },
          ]
          $.plot($orderPie.find('.chart'), pieData, {
            series: {
              pie: {
                show: true,
                radius: 1,
                label: {
                  show: true,
                  radius: 2 / 3,
                  formatter: function (label, series) {
                    var cost = series.data[0][1]
                    if (Math.round(series.percent) < 2) {
                      return ''
                    } else {
                      return `<div style="font-size:0.8em;text-align:center;padding:3px;color:white;">
                          ${series.label}<br/>${Math.round(
                        series.percent
                      )}%<br/>${cost}
                        </div>`
                    }
                  },
                  background: {
                    opacity: 0.5,
                    color: '#000',
                  },
                },
              },
            },
            legend: {
              show: false,
            },
          })
        })
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
        '/js/plugin/flot/jquery.flot.cust.min.js',
        '/js/plugin/flot/jquery.flot.resize.min.js',
        '/js/plugin/flot/jquery.flot.fillbetween.min.js',
        '/js/plugin/flot/jquery.flot.orderBar.min.js',
        '/js/plugin/flot/jquery.flot.pie.min.js',
        '/js/plugin/flot/jquery.flot.tooltip.min.js',
        '/js/plugin/flot/jquery.flot.axislabels.js',
      ],
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
