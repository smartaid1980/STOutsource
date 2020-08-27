export default function () {
  GoGoAppFun({
    gogo: function (context) {
      console.log('hi')
      context.initAuth()
      context.initModal()
      context.initReportTable()
      context.initQueryForm()
    },
    util: {
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $submitBtn: $('#submit-btn'),
      $mrp: $('#mrp'),
      $po: $('#po'),
      $modal: $('.modal'),
      loginInfo: JSON.parse(sessionStorage.getItem('loginInfo')),
      $btnModalClose: $('.modal .btn-close'),
      allowActionGroup: undefined,
      actionPermission: undefined,
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      reportTable: undefined,
      initAuth() {
        const context = this
        // 可操作群組: 廠務、生管
        context.allowActionGroup = [
          context.commons.matStockGroup.fs,
          context.commons.matStockGroup.pm,
        ]
        context.actionPermission = _.intersection(
          context.allowActionGroup,
          context.loginInfo.user_group
        ).length
          ? true
          : false
      },
      initReportTable() {
        const context = this
        const hideCols = []
        const columns = [
          {
            name: 'shelf_time',
            data: 'shelf_time',
          },
          {
            name: 'iqc_time',
            data: 'iqc_time',
          },
          {
            name: 'mstock_name',
            data: 'mstock_name',
          },
          {
            name: 'po_no',
            data: 'po_no',
          },
          {
            name: 'sup_id',
            data: 'sup_id',
          },
          {
            name: 'mat_code',
            data: 'mat_code',
          },
          {
            name: 'mat_od',
            data: 'mat_od',
          },
          {
            name: 'mat_length',
            data: 'mat_length',
          },
          {
            name: 'location',
            data: 'location',
          },
          {
            name: 'shelf_qty',
            data: 'shelf_qty',
          },
          {
            name: 'iqc_by',
            data: 'iqc_by',
          },
          {
            name: 'iqc_result',
            data: 'iqc_result',
            render(data, type, rowData) {
              const isNg = data === 'NG'
              return `<button class="btn btn-light btn-detail ${
                isNg ? 'btn-ng' : 'btn-ok'
              }">${isNg ? 'NG' : 'OK'}</button>`
            },
          },
          {
            name: 'return',
            data: null,
            render(data, type, rowData) {
              const { iqc_result } = rowData
              const isNg = iqc_result === 'NG'
              return isNg
                ? '<button class="btn btn-warning btn-action btn-return">退料</button>'
                : ''
            },
          },
          {
            name: 'stock',
            data: null,
            render(data, type, rowData) {
              return '<button class="btn btn-primary btn-action btn-stock">入庫</button>'
            },
          },
        ]
        const excelColName = columns.slice(0, 12).map((col) => col.name)
        if (!context.actionPermission) {
          hideCols.push(12, 13)
        }
        context.reportTable = createReportTable({
          $tableElement: $('#table'),
          $tableWidget: $('#table-widget'),
          centerColumn: [11, 12, 13],
          showNoData: false,
          hideCols,
          columns,
          excel: {
            fileName: 'PendingStockMaterial',
            format: [
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              '0.00',
              'text',
              'text',
            ],
            customDataFunc(tableData) {
              // tableData為dataTable的物件，需轉為陣列
              return Array.from(tableData).map((data) => {
                return excelColName.map((key) => data[key])
              })
            },
            customHeaderFunc(header) {
              return header.slice(0, 12)
            },
          },
        })

        // 查看驗料資訊
        $('#table').on('click', '.btn-detail', function (e) {
          e.preventDefault()
          context.showModal(this)
        })
        if (context.actionPermission) {
          // 退料 或 入庫
          $('#table').on('click', '.btn-action', function (e) {
            e.preventDefault()
            const isReturn = this.classList.contains('btn-return')
            const tr = this.closest('tr')
            const rowData = context.reportTable.table.row(tr).data()
            context.actionDispatcher(isReturn, rowData, tr)
          })

          context.$modal.on('click', '.btn-action', function (e) {
            e.preventDefault()
            const isReturn = e.currentTarget.classList.contains('btn-return')
            const { rowData, tr } = context.$modal.data()
            context.actionDispatcher(isReturn, rowData, tr)
          })
        }
      },
      initModal() {
        const context = this
        if (!context.actionPermission) {
          context.$btnModalClose
            .removeClass('hide')
            .on('click', function (e) {
              context.$modal.modal('hide')
            })
            .siblings()
            .each((i, btn) => $(btn).addClass('hide'))
        }
      },
      initQueryForm() {
        const context = this
        servkit.initDatePicker(context.$startDate, context.$endDate, true)
        context.commons.initMstockNameSelect(context.$mrp)
        context.commons.initPONumAutoComplete(context.$po)
        context.$submitBtn.on('click', function (evt) {
          evt.preventDefault()
          context.getTempStockData(true)
        })
      },
      getTempStockData(isShowingNoDataDialog) {
        const context = this
        let whereClause = 'status = ? AND iqc_time BETWEEN ? AND ?'
        let status = '2' // 待入庫
        const whereParams = [
          status,
          context.$startDate.val() + ' 00:00:00',
          context.$endDate.val() + ' 23:59:59',
        ]
        const mstock_name = context.$mrp.val()
        const po_no = context.$po.val()

        context.loadingBtn.doing()

        if (mstock_name) {
          whereClause += ` AND mstock_name = ?`
          whereParams.push(mstock_name)
        }
        if (po_no) {
          whereClause += ` AND po_no = ?`
          whereParams.push(po_no)
        }

        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_huangliang_po_temp_stock',
              whereClause,
              whereParams,
            }),
          },
          {
            success(data) {
              const dataTimeCols = ['shelf_time', 'iqc_time']
              context.reportTable.drawTable(
                data.map((d) =>
                  _.mapObject(d, (value, key) => {
                    if (key === 'iqc_by' || key === 'shelf_by') {
                      return context.preCon.userName[value] || value
                    } else {
                      return dataTimeCols.includes(key)
                        ? value.toFormatedDatetime()
                        : value
                    }
                  })
                )
              )
              context.loadingBtn.done()
              if (!data.length && isShowingNoDataDialog) {
                $('#dialog-no-data').dialog('open')
              }
            },
            fail: function (data) {
              console.log(data)
            },
          }
        )
      },
      showModal(btn) {
        const context = this
        const tr = btn.closest('tr')
        const rowData = context.reportTable.table.row(tr).data()
        const mat_id = rowData.mat_code.split('-')[1]
        const iqcItemInfoTds = this.$modal.find('table:first tbody td[name]')
        const iqcDetailTable = this.$modal.find('table').eq(1)
        const iqcDetailTds = iqcDetailTable.find('tbody td[name]')
        const $returnBtn = this.$modal.find('.btn-return')
        const iqcStatusCols = [
          'iqc_mat_id',
          'iqc_od',
          'iqc_length',
          'iqc_location',
          'iqc_quality',
        ]
        const iqcFeedbackCols = ['iqc_od_val', 'iqc_length_val']

        // 驗料項目
        iqcItemInfoTds.each((i, td) => {
          const $td = $(td)
          const name = $td.attr('name')
          let value = rowData[name] || ''
          if (name === 'iqc_result') {
            $td.css('color', value === 'NG' ? 'red' : '#3b9ff3')
          }
          td.textContent = value
        })
        // 材料詳細資訊
        iqcDetailTds.each((i, td) => {
          const $td = $(td)
          const name = $td.attr('name')
          let value = rowData[name] || ''
          if (iqcStatusCols.includes(name)) {
            $td.css('color', value === 'NG' ? 'red' : '#3b9ff3')
          }
          if (iqcFeedbackCols.includes(name)) {
            $td.css('color', 'red')
            value = rowData[name.replace('_val', '')] === 'NG' ? value : ''
          }
          if (name === 'mat_id') {
            value = mat_id
          }
          td.textContent = value
        })
        // 驗料OK就拿掉退料按鈕
        if (context.actionPermission) {
          $returnBtn.toggleClass('hide', rowData.iqc_result === 'OK')
        }
        context.$modal.data({ rowData, tr }).modal('show')
      },
      actionDispatcher(isReturn, rowData, tr) {
        const context = this
        if (isReturn) {
          context.returnMat(rowData, tr)
        } else {
          context.stockMat(rowData, tr)
        }
      },
      returnMat(rowData, tr) {
        const context = this
        const pks = _.pick(rowData, [
          'mstock_name',
          'po_no',
          'sup_id',
          'mat_code',
          'location',
          'shelf_time',
        ])
        const requestBody = _.extend(
          {
            tableModel:
              'com.servtech.servcloud.app.model.huangliang_matStock.PoTempStock',
            pks,
            status: '3',
          },
          pks
        )
        const isModalOn = context.$modal.hasClass('in')
        const mat_id = rowData.mat_code.split('-')[1]
        const updateTempStockRecord = new Promise((resolve) => {
          servkit.ajax(
            {
              url: 'api/stdcrud',
              type: 'PUT',
              contentType: 'application/json',
              data: JSON.stringify(requestBody),
            },
            {
              success: function (data) {
                resolve()
              },
              fail: function (data) {
                console.log(data)
              },
            }
          )
        })
        // 退料後手機推播退料通知給品管
        const sendReturnNotice = () => {
          servkit.ajax(
            {
              url: 'api/huangliangMatStock/poTempStock/returnNotice',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify(
                _.extend(
                  {
                    mat_id,
                  },
                  pks
                )
              ),
            },
            {
              success: function (data) {
                context.reportTable.table.row(tr).remove().draw(false)
                if (isModalOn) {
                  context.$modal.modal('hide')
                }
                $.smallBox({
                  title: '退料成功',
                  color: 'green',
                  iconSmall: 'fa fa-check',
                  timeout: 4000,
                })
              },
              fail: function (data) {
                console.log(data)
              },
            }
          )
        }
        updateTempStockRecord.then(() => sendReturnNotice())
      },
      stockMat(rowData, tr) {
        const context = this
        const userId = context.loginInfo.user_id
        const isModalOn = context.$modal.hasClass('in')
        const pks = _.pick(rowData, [
          'mstock_name',
          'po_no',
          'sup_id',
          'mat_code',
          'location',
          'shelf_time',
        ])
        servkit.ajax(
          {
            url: 'api/huangliangMatStock/poFile/inStock',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(pks),
          },
          {
            success: function (data) {
              context.reportTable.table.row(tr).remove().draw(false)
              if (isModalOn) {
                context.$modal.modal('hide')
              }
              $.smallBox({
                title: '入庫成功',
                color: 'green',
                iconSmall: 'fa fa-check',
                timeout: 4000,
              })
            },
            fail: function (data) {
              console.log(data)
            },
          }
        )
      },
    },
    preCondition: {
      userName(done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'm_sys_user',
              columns: ['user_id', 'user_name'],
            }),
          },
          {
            success(data) {
              done(
                Object.fromEntries(data.map((d) => [d.user_id, d.user_name]))
              )
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
