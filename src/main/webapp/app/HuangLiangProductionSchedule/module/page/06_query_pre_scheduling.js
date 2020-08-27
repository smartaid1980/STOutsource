export default function () {
  GoGoAppFun({
    gogo(context) {
      context.initQueryConditionForm()
      context.initQueryResultTable()
      context.initAssignmentDetailModal()
    },
    util: {
      $submitBtn: $('#submit-btn'),
      $orderIdInput: $('#order_id-input'),
      $startDateInput: $('#start-date'),
      $endDateInput: $('#end-date'),
      $queryConditionForm: $('#query-condition-form'),
      $queryResultTable: $('#query-result-table'),
      queryResultTable: null,
      datetimeCols: ['exp_mdate', 'exp_edate', 'schedule_time'],
      dateCols: ['exp_date'],
      initQueryConditionForm() {
        const context = this
        const {
          $submitBtn,
          $queryConditionForm,
          $startDateInput,
          $endDateInput,
          $orderIdInput,
        } = context
        const oneMonthBeforeToday = moment()
          .subtract(1, 'months')
          .format('YYYY/MM/DD')
        servkit.initDatePicker($startDateInput, $endDateInput)
        $startDateInput.val(oneMonthBeforeToday)
        context.commons.autoCompleteOrderId($orderIdInput)

        servkit.validateForm($queryConditionForm, $submitBtn)
        $submitBtn.on('click', function (e) {
          e.preventDefault()
          context.getPreScheduling()
        })
      },
      initQueryResultTable() {
        const context = this
        const { $queryResultTable } = context

        window.qrt = context.queryResultTable = createReportTable({
          $tableElement: $('#query-result-table'),
          $tableWidget: $('#query-result-widget'),
          autoWidth: false,
          columns: [
            {
              data: 'order_id',
              name: 'order_id',
              width: '12%',
            },
            {
              data: 'machine_id',
              name: 'machine_id',
              width: '10%',
              render(data, type) {
                if (type === 'display' || type === 'selectFilter') {
                  return servkit.getMachineName(data)
                } else {
                  return data
                }
              },
            },
            {
              data: 'schedule_time',
              name: 'schedule_time',
              width: '12%',
            },
            {
              data: 'order_qty',
              name: 'order_qty',
              width: '8%',
            },
            {
              data: 'schedule_quantity',
              name: 'schedule_quantity',
              width: '8%',
            },
            {
              data: 'exp_mdate',
              name: 'exp_mdate',
              width: '12%',
            },
            {
              data: 'exp_edate',
              name: 'exp_edate',
              width: '12%',
            },
            {
              data: 'exp_date',
              name: 'exp_date',
              width: '10%',
            },
            {
              data: 'm_ptime',
              name: 'm_ptime',
              width: '10%',
            },
            {
              data: null,
              name: 'detail',
              width: '5%',
              render(data, type, rowData) {
                return `<button class="btn btn-primary show-detail-btn">檢視</button>`
              },
            },
          ],
        })
        $queryResultTable.on('click', '.show-detail-btn', function () {
          context.showDetailModal(this)
        })
      },
      initAssignmentDetailModal() {
        const context = this
        const detailColsId = [
          'order_id',
          'machine_id',
          'order_qty',
          'schedule_time',
          'schedule_status',
          'exp_date',
          'schedule_quantity',
          'exp_mdate',
          'm_ptime',
          'exp_edate',
          'm_usage',
          'correction_time',
          'pg_seq',
          'buffer_time',
        ]
        const detailColsName = [
          '訂單編號',
          '機台編號',
          '訂單總數',
          '預排時間',
          '狀態',
          '預計交期',
          '預排數',
          '預計開始時間',
          '標工',
          '預計完成時間',
          '單件用量',
          '校車預留時間(小時)',
          '製程順序',
          '緩衝預留時間(小時)',
        ]
        class DetailTable {
          constructor(table, colsInRow, detailColsId, detailColsName) {
            this.table = table
            this.colsInRow = colsInRow
            this.detailColsId = detailColsId
            this.detailColsName = detailColsName
            this.columnsMap = {}
            this._render()
          }
          _render() {
            const colsCount = Object.keys(this.detailColsId).length
            const rowsCount = Math.ceil(colsCount / this.colsInRow)
            const fragment = document.createDocumentFragment()
            const getEl = (el) => document.createElement(el)
            const tbody = this.table.querySelector('tbody')
            let titleTr
            let valueTr
            let th
            let td
            let currIndex
            for (let i = 0; i < rowsCount; i++) {
              titleTr = getEl('tr')
              valueTr = getEl('tr')
              for (let j = 0; j < this.colsInRow; j++) {
                currIndex = i * this.colsInRow + j
                if (currIndex === this.detailColsName.length) {
                  th = getEl('th')
                  th.colSpan =
                    rowsCount * this.colsInRow - this.detailColsName.length
                  td = getEl('td')
                  td.colSpan = th.colSpan
                  titleTr.appendChild(th)
                  valueTr.appendChild(td)
                  break
                } else {
                  th = getEl('th')
                  th.textContent = this.detailColsName[currIndex]
                  td = getEl('td')
                  td.dataset.colName = this.detailColsId[currIndex]
                  this.columnsMap[this.detailColsId[currIndex]] = td
                  titleTr.appendChild(th)
                  valueTr.appendChild(td)
                }
              }
              fragment.appendChild(titleTr)
              fragment.appendChild(valueTr)
            }
            tbody.appendChild(fragment)
          }
          draw(rowData) {
            let colName
            for (let td of Object.values(this.columnsMap)) {
              colName = td.dataset.colName
              td.textContent = Object.prototype.hasOwnProperty.call(
                rowData,
                colName
              )
                ? this.dataTransfer(rowData[colName], colName, rowData)
                : '---'
            }
          }
          dataTransfer(data, colName, rowData) {
            let result
            switch (colName) {
              case 'machine_id':
                result = servkit.getMachineName(data)
                break
              case 'schedule_status':
                result = context.commons.statusMap.schedule_status[data]
                break
              case 'schedule_time':
              case 'exp_mdate':
              case 'exp_edate':
                result = data.toFormatedDatetime()
                break
              case 'exp_date':
                result = data.toFormatedDate()
                break
              default:
                result = data
            }
            return result
          }
        }
        context.scheduleDetailTable = new DetailTable(
          document.getElementById('schedule-detail-table'),
          2,
          detailColsId,
          detailColsName
        )
      },
      showDetailModal(btn) {
        const context = this
        const { queryResultTable, scheduleDetailTable } = context
        const tr = btn.closest('tr')
        const rowData = queryResultTable.table.row(tr).data()
        scheduleDetailTable.draw(rowData)
        $('#schedule-detail-modal-widget').modal('show')
      },
      getPreScheduling() {
        const context = this
        const {
          $queryConditionForm,
          $orderIdInput,
          $startDateInput,
          $endDateInput,
          dateCols,
          datetimeCols,
        } = context
        let schedule_status = $queryConditionForm
          .find('[name=schedule_status]:checked')
          .map((i, el) => Number(el.value))
          .toArray()
        const order_id = $orderIdInput.val()
        const startDate = $startDateInput.val()
        const endDate = $endDateInput.val()
        const whereParams = []
        let whereClause = `schedule_time IS NOT NULL`
        if (order_id) {
          whereClause += ' AND order_id = ?'
          whereParams.push(order_id)
        }
        if (startDate) {
          whereClause += ' AND schedule_time BETWEEN ? AND ?'
          whereParams.push(startDate + ' 00:00:00', endDate + ' 23:59:59')
        }
        if (!schedule_status.length) {
          $queryConditionForm
            .find('[name=schedule_status]')
            .prop('checked', true)
          schedule_status = $queryConditionForm
            .find('[name=schedule_status]:checked')
            .map((i, el) => Number(el.value))
            .toArray()
        }
        whereClause += ` AND schedule_status IN (${new Array(
          schedule_status.length
        )
          .fill('?')
          .join(',')})`
        whereParams.push(...schedule_status)
        $('#query-result-widget')
          .find('.stk-refresh-btn span')
          .addClass('.fa-spin')
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_huangliang_view_wo_list_production_scheduling',
              whereClause,
              whereParams,
            }),
          },
          {
            success(data) {
              let colName
              let tempObj
              // 格式化時間
              context.queryResultTable.drawTable(
                data.map((d) => {
                  tempObj = {}
                  for (colName of datetimeCols) {
                    if (Object.prototype.hasOwnProperty.call(d, colName)) {
                      tempObj[colName] = d[colName].toFormatedDatetime()
                    }
                  }
                  for (colName of dateCols) {
                    if (Object.prototype.hasOwnProperty.call(d, colName)) {
                      tempObj[colName] = d[colName].toFormatedDate()
                    }
                  }
                  return Object.assign({}, d, tempObj)
                })
              )
            },
            always() {
              $('#query-result-widget')
                .find('.stk-refresh-btn span')
                .removeClass('.fa-spin')
            },
          }
        )
      },
    },
    preCondition: {},
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
