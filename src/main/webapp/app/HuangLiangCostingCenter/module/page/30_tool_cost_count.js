export default function () {
  GoGoAppFun({
    gogo(context) {
      context.initQueryForm()
      context.initToolTotalCostTable()
      context.initToolUseListTable()
      // context.initSearchInfo();
    },
    util: {
      $orderId: $('#order_id'),
      $productId: $('#product_id'),
      manageId: '',
      $submitBtn: $('#submit-btn'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      toolTotalCostTable: undefined,
      toolUseListTable: undefined,
      toolStatusMap: {
        N: '新刀',
        B: '回收刀',
      },
      currencyFormat(num) {
        return '$' + num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
      },
      moneyRenderer(data, type) {
        const context = this
        if (type === 'selectFilter' || type === 'display') {
          return data !== undefined ? context.currencyFormat(data) : '---'
        } else {
          return data !== undefined ? data : '---'
        }
      },
      initQueryForm() {
        const context = this
        context.commons.initOrderSampleAutocomplete(
          context.$orderId,
          context.$productId,
          context.preCon.getProductList,
          context.preCon.getSampleList
        )
        context.$submitBtn.on('click', function (evt) {
          evt.preventDefault()
          try {
            context.loadingBtn.doing()
            context.getData()
          } catch (e) {
            console.debug(e)
            context.loadingBtn.done()
          }
        })
      },
      initToolTotalCostTable() {
        const context = this
        const columns = [
          {
            name: 'order_id',
            data: 'order_id',
          },
          {
            name: 'machine_id',
            data: 'machine_id',
            render(data, type) {
              if (
                type === 'selectFilter' ||
                type === 'display' ||
                type === 'excel'
              ) {
                return servkit.getMachineName(data)
              } else {
                return data || ''
              }
            },
          },
          {
            name: 'use_qty',
            data: 'use_qty',
          },
          {
            name: 'adjust_tool_cost',
            data: 'adjust_tool_cost',
            render: context.moneyRenderer.bind(context),
          },
          {
            name: 'adjust_frame_cost',
            data: 'adjust_frame_cost',
            render: context.moneyRenderer.bind(context),
          },
          {
            name: 'adjust_total_cost',
            data: 'adjust_total_cost',
            render: context.moneyRenderer.bind(context),
          },
          {
            name: 'repair_tool_cost',
            data: 'repair_tool_cost',
            render: context.moneyRenderer.bind(context),
          },
          {
            name: 'repair_frame_cost',
            data: 'repair_frame_cost',
            render: context.moneyRenderer.bind(context),
          },
          {
            name: 'repair_total_cost',
            data: 'repair_total_cost',
            render: context.moneyRenderer.bind(context),
          },
          {
            name: 'repair_count',
            data: 'repair_count',
            render(data, type) {
              return data !== undefined ? data : '---'
            },
          },
          {
            name: 'total_cost',
            data: 'total_cost',
            render: context.moneyRenderer.bind(context),
          },
        ]
        context.toolTotalCostTable = createReportTable({
          $tableElement: $('#table'),
          $tableWidget: $('#table-widget'),
          columns,
          rightColumn: [3, 4, 5, 6, 7, 8, 10],
          excel: {
            fileName: '刀具總成本',
            format: [
              'text',
              'text',
              '0',
              '0.0',
              '0.0',
              '0.0',
              '0.0',
              '0.0',
              '0.0',
              '0',
              '0.0',
            ],
            customDataFunc: function (tableData) {
              return Array.from(tableData).map((data) => {
                return columns.map((map) => {
                  if (map.render) {
                    return map.render(data[map.name], 'excel')
                  } else {
                    return data[map.name]
                  }
                })
              })
            },
          },
        })
      },
      initToolUseListTable() {
        const context = this
        const columns = [
          {
            name: 'order_id',
            data: 'order_id',
          },
          {
            name: 'machine_id',
            data: 'machine_id',
            render(data, type) {
              if (
                type === 'selectFilter' ||
                type === 'display' ||
                type === 'excel'
              ) {
                return servkit.getMachineName(data)
              } else {
                return data || ''
              }
            },
          },
          {
            name: 'type_for',
            data: 'type_for',
            render(data, type) {
              if (
                type === 'selectFilter' ||
                type === 'display' ||
                type === 'excel'
              ) {
                return context.preCon.map.typeForMap[data] || data || ''
              } else {
                return data || ''
              }
            },
          },
          {
            name: 'tool_id',
            data: 'tool_id',
          },
          {
            name: 'tool_status',
            data: 'tool_status',
            render(data, type) {
              if (
                type === 'selectFilter' ||
                type === 'display' ||
                type === 'excel'
              ) {
                return context.toolStatusMap[data]
              } else {
                return data || ''
              }
            },
          },
          {
            name: 'adjust_use_qty',
            data: 'adjust_use_qty',
            render(data) {
              return data !== undefined ? data : ''
            },
          },
          {
            name: 'adjust_cost',
            data: 'adjust_cost',
            render: context.moneyRenderer.bind(context),
          },
          {
            name: 'repair_use_qty',
            data: 'repair_use_qty',
            render(data) {
              return data !== undefined ? data : ''
            },
          },
          {
            name: 'repair_cost',
            data: 'repair_cost',
            render: context.moneyRenderer.bind(context),
          },
          {
            name: 'total_cost',
            data: 'total_cost',
            render: context.moneyRenderer.bind(context),
          },
        ]
        context.toolUseListTable = createReportTable({
          $tableElement: $('#tool-use-list-table'),
          $tableWidget: $('#table-widget'),
          rightColumn: [6, 8, 9],
          columns,
          excel: {
            fileName: '刀具使用明細',
            format: [
              'text',
              'text',
              'text',
              'text',
              'text',
              '0',
              '0.0',
              '0',
              '0.0',
              '0.0',
              '0.0',
            ],
            customDataFunc: function (tableData) {
              return Array.from(tableData).map((data) => {
                return columns.map((map) => {
                  if (map.render) {
                    return map.render(data[map.name], 'excel')
                  } else {
                    return data[map.name]
                  }
                })
              })
            },
          },
        })
      },
      initSearchInfo() {
        const context = this
        context.searchInfo = $('#search-info')
          .find('span')
          .toArray()
          .reduce((a, el) => {
            const name = el.dataset.column
            a[name] = el
            return a
          }, {})
      },
      getData() {
        const context = this
        const { $orderId, $productId } = context
        const orderId = $orderId.val()
        const productId = $productId.val()
        // let whereClause = 'uselist_status <> 99';
        // const whereParams = [];
        let orderOrSampleObj = context.commons.getMacro523ByOrderIdOrSampleId(
          orderId,
          productId,
          context.preCon.getProductList,
          context.preCon.getSampleList
        )
        let orderList = _.pluck(orderOrSampleObj, 'order_id')
        let whereClause = `uselist_status <> 99 AND order_id IN ("${orderList.join(
          '", "'
        )}") AND is_cost = 'Y'`
        // const formData = {
        //   order_id: orderId,
        //   product_id: productId,
        // };
        // if (orderId) {
        //   whereClause += ' AND order_id = ?';
        //   whereParams.push(orderId);
        // }
        // if (productId) {
        //   whereClause += ' AND product_id = ?';
        //   whereParams.push(productId);
        // }

        // Object.entries(context.searchInfo).forEach(([name, el]) => {
        //   el.textContent = formData[name];
        // });

        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_huangliang_view_tool_cost',
              whereClause,
              // whereParams
            }),
          },
          {
            success(data) {
              // 管編alert
              if (productId) {
                context.commons.addAlertHtml(`【管編：${productId}】`)
              } else if (orderId) {
                var standard_id = _.find(
                  context.preCon.getProductList,
                  function (elem) {
                    return elem.order_id == orderId
                  }
                )
                standard_id = standard_id ? standard_id.standard_id : ''
                context.commons.addAlertHtml(`【管編：${standard_id}】`)
              }
              context.toolTotalCostTable.drawTable(
                context.calcTotalCostData(data)
              )
              context.toolUseListTable.drawTable(context.calcUseListData(data))
              context.loadingBtn.done()
            },
          }
        )
      },
      calcTotalCostData(data) {
        const groupedData = data.reduce((a, rowData) => {
          const { machine_id, order_id } = rowData
          const pk = machine_id + '-' + order_id
          if (Object.prototype.hasOwnProperty.call(a, pk)) {
            a[pk].push(rowData)
          } else {
            a[pk] = [rowData]
          }
          return a
        }, {})
        const getCostByTypeAndReason = (arr) => {
          const machine_id = arr[0].machine_id
          const order_id = arr[0].order_id
          let total_use_qty = 0
          let adjust_tool_cost = 0
          let adjust_frame_cost = 0
          let repair_tool_cost = 0
          let repair_frame_cost = 0
          const repair_tool_use_no_list = new Set()
          let use_reason
          let type_for
          let tool_use_no
          let use_qty
          let use_cost
          arr.forEach((rowData) => {
            use_reason = rowData.use_reason
            type_for = rowData.type_for
            tool_use_no = rowData.tool_use_no
            use_qty = rowData.use_qty
            use_cost = rowData.use_cost

            if (use_reason === 12 && type_for === '01') {
              total_use_qty += use_qty
              repair_tool_cost += use_cost
              repair_tool_use_no_list.add(tool_use_no)
            } else if (use_reason === 12 && type_for === '02') {
              repair_frame_cost += use_cost
              repair_tool_use_no_list.add(tool_use_no)
            } else if (use_reason === 11 && type_for === '01') {
              total_use_qty += use_qty
              adjust_tool_cost += use_cost
            } else if (use_reason === 11 && type_for === '02') {
              adjust_frame_cost += use_cost
            }
          })
          const adjust_total_cost = adjust_tool_cost + adjust_frame_cost
          const repair_total_cost = repair_tool_cost + repair_frame_cost
          const repair_count = repair_tool_use_no_list.size
          const total_cost = adjust_total_cost + repair_total_cost

          return {
            use_qty: total_use_qty,
            machine_id,
            order_id,
            adjust_tool_cost,
            adjust_frame_cost,
            adjust_total_cost,
            repair_tool_cost,
            repair_frame_cost,
            repair_total_cost,
            repair_count,
            total_cost,
          }
        }
        const totalCost = Object.entries(groupedData).map(([pk, dataArr]) => {
          return getCostByTypeAndReason(dataArr)
        })
        return totalCost
      },
      calcUseListData(data) {
        const groupedData = data.reduce((a, rowData) => {
          const { order_id, machine_id, tool_id, tool_status } = rowData
          const pk =
            tool_id + '-' + tool_status + '-' + order_id + '-' + machine_id
          if (Object.prototype.hasOwnProperty.call(a, pk)) {
            a[pk].push(rowData)
          } else {
            a[pk] = [rowData]
          }
          return a
        }, {})
        const getCostByType = (arr) => {
          const tool_id = arr[0].tool_id
          const tool_status = arr[0].tool_status
          const machine_id = arr[0].machine_id
          const order_id = arr[0].order_id
          let adjust_use_qty = 0
          let adjust_cost = 0
          let repair_use_qty = 0
          let repair_cost = 0
          let use_reason
          let use_qty
          let use_cost
          let type_for
          arr.forEach((rowData) => {
            use_reason = rowData.use_reason
            use_qty = rowData.use_qty
            use_cost = rowData.use_cost
            type_for = rowData.type_for

            if (use_reason === 12) {
              repair_use_qty += use_qty
              repair_cost += use_cost
            } else if (use_reason === 11) {
              adjust_use_qty += use_qty
              adjust_cost += use_cost
            }
          })
          const total_cost = repair_cost + adjust_cost

          return {
            tool_id,
            tool_status,
            machine_id,
            order_id,
            type_for,
            total_cost,
            adjust_use_qty,
            adjust_cost,
            repair_use_qty,
            repair_cost,
          }
        }
        const totalCost = Object.entries(groupedData).map(([pk, dataArr]) => {
          return getCostByType(dataArr)
        })
        return totalCost
      },
    },
    preCondition: {
      getProductList(done) {
        this.commons.getProductList(done)
      },
      getSampleList(done) {
        this.commons.getSampleList(done)
      },
      map(done) {
        $.get(
          './app/HuangLiangToolSetting/data/map.json?' + new Date().getTime(),
          (res) => {
            done(res)
          }
        )
      },
    },
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
