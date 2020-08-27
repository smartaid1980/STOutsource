export default function () {
  GoGoAppFun({
    gogo(context) {
      context.initAuth()
      context.initQueryResultTable()
      context.initWoPoBindingTable()
      context.initWoPoBindingMatStockTable()
      window.ma = context.materialAssign = context.commons.initMaterialAssign(
        {
          isCreate: true,
          isSupplement: true,
          onCreate(tr) {
            context.getMatConsumeStatus()
          },
        },
        {
          statusMap: context.commons.statusMap,
          mstockNameMap: context.commons.mstockNameMap,
        },
        context.preCon
      )
    },
    util: {
      matUnit: null,
      initQueryResultTableSwitch: false,
      queryLodingBtn: null,
      queryResultTable: null,
      woPoBindingTable: null,
      woPoBindingMatStockTable: null,
      matUnitMap: {
        '1M': '支',
        '1KG': 'KG',
      },
      userAuth: {},
      initAuth() {
        const context = this
        const loginInfo = JSON.parse(window.sessionStorage.getItem('loginInfo'))
        const userGroup = loginInfo.user_group || []
        const canCreateMatAssignmentGroupList = [
          'material_stock_factory_service',
          'sys_manager_group',
        ]
        const canCreateMatAssignment =
          userGroup.findIndex((group) =>
            canCreateMatAssignmentGroupList.includes(group)
          ) >= 0
        Object.assign(context.userAuth, {
          canCreateMatAssignment,
        })
      },
      initQueryResultTable() {
        const context = this
        const MINUTES_OF_TWO_DAYS = 60 * 48
        const MINUTES_OF_ONE_AND_HALF_DAYS = 60 * 36

        // 建立重新查詢按鈕
        var refresh = document.createElement('BUTTON')
        refresh.classList.value = 'btn btn-primary stk-refresh-btn'
        refresh.setAttribute('title', '重新整理')
        $(refresh).append('<span class="fa fa-refresh fa-lg"></span>')

        // 建立loading button
        context.queryLodingBtn = servkit.loadingButton(refresh)

        // 重新查詢事件
        $(refresh).on('click', function () {
          context.getMatConsumeStatus()
        })
        window.setTimeout(() => $(refresh).trigger('click'), 500)

        // 初始材料耗用狀況表格
        context.queryResultTable = createReportTable({
          $tableElement: $('#query-result-table'),
          $tableWidget: $('#query-result-widget'),
          customBtns: [refresh],
          // centerColumn: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
          columns: [
            {
              // 機台
              data: 'machine_id',
              name: 'machine_id',
              width: '6%',
              render(data, type) {
                if (type === 'display' || type === 'selectFilter') {
                  return servkit.getMachineName(data)
                } else {
                  return data
                }
              },
            },
            {
              // 生產指令
              data: 'order_id',
              name: 'order_id',
              width: '6%',
            },
            {
              // 管編
              data: 'product_id',
              name: 'product_id',
              width: '6%',
            },
            {
              // 派工數
              data: 'm_qty',
              name: 'm_qty',
              width: '6%',
              render(data) {
                return data !== undefined ? data.numberWithCommas() : '---'
              },
            },
            {
              // 生產數
              data: 'm_pqty',
              name: 'm_pqty',
              width: '6%',
              render(data) {
                return data !== undefined ? data.numberWithCommas() : '---'
              },
            },
            {
              // 不良數
              data: 'm_bqty',
              name: 'm_bqty',
              width: '6%',
              render(data) {
                return data !== undefined ? data.numberWithCommas() : '---'
              },
            },
            {
              // 材料
              data: 'mat_code',
              name: 'mat_code',
              width: '6%',
            },
            {
              // 材料耗用狀況
              data(rowData) {
                const { feeding_count: feeding, place_count: place } = rowData
                return (feeding || '---') + '/' + (place || '---')
              },
              name: 'feeding_status',
              width: '6%',
            },
            {
              // 剩餘材料耗用時間
              data: 'feeding_time',
              name: 'feeding_time',
              width: '6%',
              render(data, type, rowData) {
                const { feeding_time: time } = rowData
                return `<span data-time="${time}"></span>${
                  time !== undefined
                    ? (time * 60 * 1000).millisecondToDHMS('M')
                    : '---'
                }`
              },
            },
            {
              // 材料監控
              data: 'mat_control',
              name: 'mat_control',
              width: '6%',
            },
            {
              // 加工方式
              data: 'process',
              name: 'process',
              width: '6%',
              render(data, type) {
                if (data === '無程式註解' && type === 'display') {
                  return '<span style="color:red">無程式註解</span>'
                }
                return data || ''
              },
            },
            {
              // 庫存狀況(按鈕)
              data: null,
              name: 'in_stock',
              width: '6%',
              render(data, type, rowData) {
                return `<button class="btn btn-primary inStock">庫存</button>`
              },
            },
            {
              // 補料派工(按鈕)
              data: null,
              name: 'feeding',
              width: '5%',
              render(data, type, rowData) {
                return `<button class="btn btn-primary feeding ${
                  context.userAuth.canCreateMatAssignment ? '' : 'hide'
                }">補料派工</button>`
              },
            },
          ],
          onRow(row, rowData) {
            // 取得剩餘材料耗用時間
            const time = rowData.feeding_time
            let renderType

            // 判斷是否需要highlight
            if (time < MINUTES_OF_ONE_AND_HALF_DAYS) {
              renderType = 'alarm'
            } else if (time < MINUTES_OF_TWO_DAYS) {
              renderType = 'alert'
            }
            if (renderType) {
              $(row).find('td:eq(8)').addClass(renderType)
            }
          },
        })

        // 表格裡事件
        $('#query-result-table')
          .on('click', '.inStock', function () {
            // 庫存按鈕
            context.showStateModal(this)
          })
          .on('click', '.feeding', function () {
            // 派工補料按鈕
            context.showMaterialAssignmentModal(this)
          })
      },
      initWoPoBindingTable() {
        const context = this

        // 初始綁定記錄狀況表格
        context.woPoBindingTable = createReportTable({
          $tableElement: $('#wo-po-binding-table'),
          $tableWidget: $('#wo-po-binding-widget'),
          columns: [
            {
              // 材料庫
              data: 'mstock_name',
              name: 'mstock_name',
              width: '6%',
            },
            {
              // 採購單號
              data: 'po_no',
              name: 'po_no',
              width: '6%',
            },
            {
              // 廠商
              data: 'sup_id',
              name: 'sup_id',
              width: '6%',
            },
            {
              // 材料條碼
              data: 'mat_code',
              name: 'mat_code',
              width: '6%',
            },
            {
              // 已綁定數量
              data: 'bind_qty',
              name: 'bind_qty',
              width: '6%',
            },
            {
              // 單位
              data: 'unit',
              name: 'mat_unit',
              width: '6%',
              render(data) {
                return data
              },
            },
            {
              // 綁定已領
              data: 'use_qty',
              name: 'use_qty',
              width: '6%',
            },
            {
              // 狀態
              data: 'w_p_status',
              name: 'w_p_status',
              width: '6%',
              render(data, type) {
                if (type === 'display' || type === 'selectFilter') {
                  return context.commons.statusMap.w_p_status[data]
                } else {
                  return data
                }
              },
            },
          ],
        })
      },
      initWoPoBindingMatStockTable() {
        const context = this

        // 初始領物料派工綁定物料表格
        context.woPoBindingMatStockTable = createReportTable({
          $tableElement: $('#wo-po-binding-mat-stock-table'),
          $tableWidget: $('#wo-po-binding-mat-stock-widget'),
          columns: [
            {
              // 材料庫
              data: 'mat_stock',
              name: 'mat_stock',
              width: '6%',
            },
            {
              // 採購單號
              data: 'po_no',
              name: 'po_no',
              width: '6%',
            },
            {
              // 上架時間
              data: 'shelf_time',
              name: 'shelf_time',
              width: '6%',
              render(data) {
                return data.toFormatedDatetime()
              },
            },
            {
              // 廠商
              data: 'sup_id',
              name: 'sup_id',
              width: '6%',
            },
            {
              // 材料條碼
              data: 'mat_code',
              name: 'mat_code',
              width: '6%',
            },
            {
              // 位置
              data: 'location',
              name: 'location',
              width: '6%',
            },
            {
              // 長度
              data: 'mat_length',
              name: 'mat_length',
              width: '6%',
            },
            {
              // 庫存
              data(rowData) {
                const { stock_piece: piece, stock_qty: qty, unit } = rowData
                const isPlastic = unit === '支'
                return `${piece}支` + (isPlastic ? '' : ` / ${qty.round(2)}KG`)
              },
              name: 'stock',
              width: '6%',
            },
          ],
        })
        $('#wo-po-binding-widget').find('.dt-toolbar').addClass('hide')
      },
      getMatConsumeStatus() {
        const context = this

        // 重新查詢按鈕開始轉動
        context.queryLodingBtn.doing()

        // 查詢材料耗用狀況
        servkit.ajax(
          {
            url: 'api/huangliangMatStock/woMMatList/useState2',
            type: 'GET',
          },
          {
            success(data) {
              // 重新繪製材料耗用狀況表格
              context.queryResultTable.drawTable(
                data.map((d) =>
                  d.process ? d : Object.assign(d, { process: '無程式註解' })
                )
              )
            },
            always() {
              // 重新查詢按鈕停止轉動
              context.queryLodingBtn.done()
            },
          }
        )
      },
      showStateModal(dom) {
        // 取得這筆資料
        const rowData = this.queryResultTable.table
          .row(dom.closest('tr'))
          .data()
        this.getBindStock(rowData.order_id, function () {
          $('#state-modal-widget').modal('show')
        })
      },
      getBindStock(orderId, cb) {
        const context = this

        // 查詢材料耗用狀況
        servkit.ajax(
          {
            url: 'api/huangliangMatStock/woMMatList/getBindStock',
            type: 'GET',
            data: {
              order_id: orderId,
            },
          },
          {
            success(data) {
              const { po_file, stock_info } = data
              const unitMap = {}
              let unit
              // 重新繪製材料耗用狀況表格
              context.woPoBindingTable.drawTable(
                po_file.map((poFile) => {
                  const { mat_code, mat_unit } = poFile
                  if (unitMap[mat_code]) {
                    unit = unitMap[mat_code]
                  } else {
                    unit = unitMap[mat_code] = context.matUnitMap[mat_unit]
                  }
                  return Object.assign(
                    {
                      unit,
                    },
                    poFile
                  )
                })
              )
              // context.matUnit = data.mat_unit;
              context.woPoBindingMatStockTable.drawTable(
                stock_info.map((data) => {
                  const { mat_code } = data
                  unit = unitMap[mat_code]
                  return _.extend({ unit }, data)
                })
              )

              if (cb) cb()
            },
          }
        )
      },
      showMaterialAssignmentModal(dom) {
        const context = this
        // 取得這筆資料
        const tr = dom.closest('tr')
        const rowData = context.queryResultTable.table.row(tr).data()
        context.materialAssign.show(rowData, tr)
      },
    },
    preCondition: {
      supplier(done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_huangliang_supplier',
              columns: ['sup_id', 'sup_name'],
            }),
          },
          {
            success(data) {
              done(Object.fromEntries(data.map((d) => [d.sup_id, d.sup_name])))
            },
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
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
    ],
  })
}
