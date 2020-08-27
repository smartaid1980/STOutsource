export default function () {
  GoGoAppFun({
    gogo(context) {
      $.validator.addMethod(
        'datetime',
        function (value, element, param) {
          return (
            this.optional(element) ||
            /^\d\d\d\d\/(0?[1-9]|1[0-2])\/(0?[1-9]|[12][0-9]|3[01]) (00|0?[0-9]|1[0-9]|2[0-3]):([0-9]|[0-5][0-9]):([0-9]|[0-5][0-9])$/.test(
              value
            )
          )
        },
        '請輸入正確的時間格式，YYYY/MM/DD HH:mm:ss'
      )
      context.initAuth()
      context.initQueryConditionForm()
      context.initQueryResultTable()
      context.initAssignmentDetailModal()
      context.initCreateAssignmentFrom()
      window.ma = context.materialAssign = window.initMaterialAssign(
        {
          isCreate: true,
          onCreate(tr) {
            const rowApi = context.queryResultTable.table.row(tr)
            rowApi
              .data(_.extend(rowApi.data(), { material_assign_count: 1 }))
              .draw(false)
          },
        },
        {
          statusMap: context.commons.statusMap,
          mstockNameMap: context.commons.mstockNameMap,
        },
        context.preCon
      )

      context.getQueryData()
    },
    util: {
      $submitBtn: $('#submit-btn'),
      $productIdInput: $('#product_id-input'),
      $orderIdInput: $('#order_id-input'),
      $machineSelect: $('#machine_id-select'),
      $startDateInput: $('#start-date'),
      $endDateInput: $('#end-date'),
      $queryConditionForm: $('#query-condition-form'),
      $queryResultTable: $('#query-result-table'),
      $confirmModal: $('#confirm-modal-widget'),
      $confirmContent: $('#confirm-content'),
      $confirmtitle: $('#confirm-title'),
      $confirmBtn: $('#confirm-yes'),
      $editDateModal: $('#edit-date-modal-widget'),
      $bindPoModal: $('#bind-po-modal-widget'),
      createAssignmentForm: {},
      queryResultTable: null,
      productionProgressTable: null,
      bindedPoTable: null,
      bindablePoTable: null,
      tempMaterialToAssignData: null,
      materialToAssignNumber: 1,
      userAuth: {},
      initAuth() {
        const context = this
        const loginInfo = JSON.parse(window.sessionStorage.getItem('loginInfo'))
        const userGroup = loginInfo.user_group || []
        const canCreateMachineAssignmentGroupList = [
          'material_stock_factory_service',
          'factory_service_deputy_manager',
          'sys_manager_group',
        ]
        const canCreateMatAssignmentGroupList = [
          'material_stock_factory_service',
          'sys_manager_group',
        ]
        const canEditExpEdateGroupList = ['factory_manager']
        const canCreateMachineAssignment =
          userGroup.findIndex((group) =>
            canCreateMachineAssignmentGroupList.includes(group)
          ) >= 0
        const canCreateMatAssignment =
          userGroup.findIndex((group) =>
            canCreateMatAssignmentGroupList.includes(group)
          ) >= 0
        const canEditExpEdate =
          userGroup.findIndex((group) =>
            canEditExpEdateGroupList.includes(group)
          ) >= 0
        context.userId = loginInfo.user_id
        Object.assign(context.userAuth, {
          canCreateMachineAssignment,
          canCreateMatAssignment,
          canEditExpEdate,
        })
      },
      initQueryConditionForm() {
        const context = this
        const {
          $submitBtn,
          $queryConditionForm,
          $machineSelect,
          $startDateInput,
          $endDateInput,
          $orderIdInput,
          $productIdInput,
        } = context

        servkit.initMachineSelect($machineSelect)
        servkit.initDatePicker($startDateInput, $endDateInput)
        context.commons.autoCompleteOrderId($orderIdInput)
        context.commons.autoCompleteProductId($productIdInput)

        servkit.validateForm($queryConditionForm, $submitBtn)
        $submitBtn.on('click', function (e) {
          e.preventDefault()
          context.getMachineAssignment()
        })
      },
      initQueryResultTable() {
        const context = this
        const { $queryResultTable, $confirmBtn } = context

        window.qrt = context.queryResultTable = createReportTable({
          $tableElement: $('#query-result-table'),
          $tableWidget: $('#query-result-widget'),
          customBtns: [
            // 2020/01/14 此處新增機台派工的功能與生產排程預排轉派工的功能類似，所以隱藏
            `<button class="btn btn-primary stk-insert-btn hidden-xs hidden-sm ${
              0 && context.userAuth.canCreateMachineAssignment ? '' : 'hide'
            }" title="機台派工"><span class="fa fa-plus fa-lg"></span></button>`,
            `<button class="btn btn-primary stk-refresh-btn" title="重新整理"><span class="fa fa-refresh fa-lg"></span></button>`,
          ],
          autoWidth: false,
          columns: [
            {
              data: 'order_id',
              name: 'mstock_name',
              width: '6%',
              render(data, type, rowData) {
                const order_id = data
                if (type === 'display' || type === 'selectFilter') {
                  return context.commons.mstockNameMap[order_id[0]]
                } else {
                  return data
                }
              },
            },
            {
              data: 'order_id',
              name: 'order_id',
              width: '6%',
            },
            {
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
              data: null,
              name: 'wo_m_time',
              width: '6%',
              render(data, type, rowData) {
                const { wo_m_time: time } = rowData
                return time ? time.toFormatedDatetime() : ''
              },
            },
            {
              data: 'product_id',
              name: 'product_id',
              width: '6%',
              render(data) {
                return data || ''
              },
            },
            {
              data: 'm_qty',
              name: 'm_qty',
              width: '6%',
            },
            {
              data: 'm_pqty',
              name: 'm_pqty',
              width: '6%',
            },
            {
              data: 'm_bqty',
              name: 'm_bqty',
              width: '6%',
            },
            {
              data: null,
              name: 'exp_mdate',
              width: '6%',
              render(data, type, rowData) {
                const { exp_mdate: time } = rowData
                return time ? time.toFormatedDate() : ''
              },
            },
            {
              data: null,
              name: 'exp_edate',
              width: '6%',
              render(data, type, rowData) {
                const { exp_edate: time } = rowData
                return time ? time.toFormatedDate() : ''
              },
            },
            {
              data: null,
              name: 'act_mdate',
              width: '6%',
              render(data, type, rowData) {
                const { act_mdate: time } = rowData
                return time ? time.toFormatedDate() : ''
              },
            },
            {
              data: null,
              name: 'act_edate',
              width: '6%',
              render(data, type, rowData) {
                const { act_edate: time } = rowData
                return time ? time.toFormatedDate() : ''
              },
            },
            {
              data: 'w_m_status',
              name: 'w_m_status',
              width: '6%',
              render(data, type) {
                if (type === 'filter' || type === 'sort') {
                  return data
                } else {
                  return context.commons.statusMap.w_m_status[data]
                }
              },
            },
            {
              data: null,
              name: 'collect_material',
              width: '6%',
              render(data, type, rowData) {
                const { w_m_status, material_assign_count } = rowData
                const isClosed = w_m_status === 9 || w_m_status === 99
                const hasCollectAssign = material_assign_count > 0
                const canAssign =
                  !isClosed &&
                  !hasCollectAssign &&
                  context.userAuth.canCreateMatAssignment
                return `<button class="btn btn-primary collect-material" ${
                  canAssign ? '' : 'disabled'
                }>派工</button>`
              },
            },
            {
              data: null,
              name: 'cancel',
              width: '6%',
              render(data, type, rowData) {
                const { w_m_status } = rowData
                const canCancel = w_m_status === 0
                return `<button class="btn btn-primary cancel-machine-assignment" ${
                  canCancel ? '' : 'disabled'
                }>取消</button>`
              },
            },
            {
              data: null,
              name: 'close',
              width: '6%',
              render(data, type, rowData) {
                const { w_m_status } = rowData
                const canClose = w_m_status === 1
                const isClosed = w_m_status === 9

                return `<button class="btn btn-primary ${
                  isClosed ? 'cancel-closed' : 'close-assignment'
                }" ${canClose || isClosed ? '' : 'disabled'}>${
                  isClosed ? '取消結案' : '結案'
                }</button>`
              },
            },
            {
              data: null,
              name: 'edit',
              width: '5%',
              render(data, type, rowData) {
                const { w_m_status } = rowData
                const canEdit = w_m_status === 0 || w_m_status === 1
                return `<button class="btn btn-xs btn-primary edit-assignment-btn" ${
                  canEdit ? '' : 'disabled'
                }><i class="fa fa-pencil"></i></button>`
              },
            },
            {
              data: null,
              name: 'detail',
              width: '5%',
              render(data, type, rowData) {
                return `<button class="btn btn-primary show-assignment-detail-btn">檢視</button>`
              },
            },
          ],
          hideCols: [0],
        })
        context.queryResultTable.fillSelectFilterOptions = function (
          isResetSelectValue
        ) {
          const { selectFilter, table: dt, config } = this
          _.each(selectFilter, (select, index) => {
            const selectValue = select.value
            const colData = dt.column(index).data().toArray()
            const hasValue = colData.includes(selectValue)
            let options = _.chain(colData).uniq().value().sort()
            if (config.columns && config.columns[index].render) {
              options = options.map((opt) => [
                opt,
                config.columns[index].render(opt, 'selectFilter'),
              ])
            }
            options.unshift(['', i18n('Filter')])
            select.innerHTML = options.map(
              (entries) =>
                `<option value="${entries[0]}">${entries[1]}</option>`
            )
            if (!isResetSelectValue && hasValue) {
              select.value = selectValue
            }
          })
        }
        servkit.initDatePicker(
          $('#edit-assignment-form').find('[name=exp_mdate]')
        )
        $('#edit-assignment-form').find('[name=exp_edate]').datetimepicker({
          format: 'YYYY/MM/DD HH:mm:ss',
        })
        servkit.initSelectWithList(
          context.preCon.user.regulate,
          $('#edit-assignment-form').find('[name=work_by]')
        )
        $queryResultTable
          .on('click', '.cancel-machine-assignment', function () {
            context.showConfirmModal('cancel-machine-assignment', this)
          })
          .on('click', '.cancel-closed', function () {
            context.showConfirmModal('cancel-closed', this)
          })
          .on('click', '.close-assignment', function () {
            context.showConfirmModal('close-assignment', this)
          })
          .on('click', '.collect-material', function () {
            context.showCollectMaterialAssignmentModal(this)
          })
          .on('click', '.edit-assignment-btn', function () {
            context.showEditAssignmentModal(this)
          })
          .on('click', '.show-assignment-detail-btn', function () {
            context.showAssignmentDetailModal(this)
          })

        $('#query-result-widget')
          .on('click', '.stk-insert-btn', function () {
            context.showCreateAssignmentModal()
          })
          .on('click', '.stk-refresh-btn', function () {
            context.getMachineAssignment()
          })

        let validator
        $('#update-assignment-btn').on('click', function () {
          if (validator) {
            validator.destroy()
          }
          validator = $('#edit-assignment-form').validate({
            rules: {
              exp_mdate: {
                required: true,
                dateISO: true,
              },
              exp_edate: {
                required: true,
                datetime: true,
              },
              m_qty: {
                required: true,
                digits: true,
                min: 1,
              },
              m_usage: {
                number: true,
                min: 0,
              },
              m_ptime: {
                number: true,
                min: 0,
              },
            },
          })
          if (validator.form()) {
            context.updateAssignment(this)
          }
        })
        $confirmBtn.on('click', function () {
          context.confirmHandler(this)
        })
      },
      initAssignmentDetailModal() {
        const context = this
        const detailColsId = [
          'order_id',
          'machine_id',
          'wo_m_time',
          'order_qty',
          'm_qty',
          'm_pqty',
          'm_bqty',
          'w_m_status',
          'exp_mdate',
          'exp_edate',
          'act_mdate',
          'act_edate',
          'm_ptime',
          'm_usage',
          'pg_seq',
          'mat_control',
          'correction_time',
          'buffer_time',
          'create_by',
          'modify_by',
          'modify_time',
        ]
        const detailColsName = [
          '訂單編號',
          '機台編號',
          '派工時間',
          '訂單數',
          '派工數量',
          '已生產數',
          '不良品數',
          '派工狀態',
          '預計生產時間',
          '預計完成時間',
          '實際生產時間',
          '實際完工時間',
          '標工',
          '單件用量',
          '製程順序',
          '材料監控',
          '校車預留時間(小時)',
          '緩衝預留時間(小時)',
          '建立者',
          '最後修改者',
          '最後修改時間',
        ]
        class AssignmentDetailTable {
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
            const rowsCount = Math.ceil(colsCount / 4)
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
                currIndex = i * 4 + j
                if (currIndex === this.detailColsName.length) {
                  th = getEl('th')
                  th.colSpan = rowsCount * 4 - this.detailColsName.length
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
              case 'w_m_status':
                result = context.commons.statusMap.w_m_status[data]
                break
              case 'wo_m_time':
              case 'exp_mdate':
              case 'exp_edate':
              case 'act_mdate':
              case 'act_edate':
              case 'modify_time':
                result = data.toFormatedDatetime()
                break
              case 'create_by':
              case 'modify_by':
                result = context.preCon.user.idNameMap[data]
                break
              default:
                result = data
            }
            if (colName === 'exp_edate' && rowData.cus_field_2) {
              const splitArr = rowData.cus_field_2.split('|')
              const lastModifyArr = splitArr[splitArr.length - 1].split(',')
              const modifyBy =
                context.preCon.user.idNameMap[lastModifyArr[0]] ||
                lastModifyArr[0]
              const modifyTime = lastModifyArr[1].dateTimeBitsToFormatted()
              result += `(${modifyBy}, ${modifyTime})`
            }
            return result
          }
        }
        context.assignmentDetailTable = new AssignmentDetailTable(
          document.getElementById('assignment-detail-table'),
          4,
          detailColsId,
          detailColsName
        )
        context.mPtimeChgLogTable = createReportTable({
          $tableElement: $('#m_ptime-chg-log-table'),
          order: [[4, 'desc']],
          orderable: false,
        })
      },
      showAssignmentDetailModal(btn) {
        const context = this
        const {
          queryResultTable,
          assignmentDetailTable,
          mPtimeChgLogTable,
        } = context
        const tr = btn.closest('tr')
        const rowData = queryResultTable.table.row(tr).data()
        const mPtimeChgLog = rowData.cus_field_1
        if (mPtimeChgLog && mPtimeChgLog.length) {
          const logArr = []
          mPtimeChgLog.split('|').forEach((log) => {
            const valueArr = log.split(',')
            // 以“|”分隔
            // 原標工(秒)、exp預計完成時間、已生產時間(含單位)、已生產數、M522=211-發生時間、m修改時間
            // 72sec,exp20200120110159,36000sec,500,211-20200106071059,m20200106080959
            const m_ptime = valueArr[0].slice(0, -3)
            const exp_edate = valueArr[1].slice(3).dateTimeBitsToFormatted()
            const m_time = valueArr[2].slice(0, -3)
            const m_qty = valueArr[3]
            const m522_time = valueArr[4].slice(4)
            const mofify_time = valueArr[5].slice(1).dateTimeBitsToFormatted()
            logArr.push([
              m_ptime,
              exp_edate,
              m_time,
              m_qty,
              m522_time === 'M'
                ? '介面修改'
                : m522_time.dateTimeBitsToFormatted(),
              mofify_time,
            ])
          })
          mPtimeChgLogTable.drawTable(logArr)
        } else {
          mPtimeChgLogTable.clearTable()
        }
        assignmentDetailTable.draw(rowData)
        $('#assignment-detail-modal-widget').modal('show')
      },
      updateAssignment(btn) {
        const context = this
        const formData = $('#edit-assignment-form')
          .find('[name]')
          .toArray()
          .reduce((a, el) => {
            const name = el.name
            const value = el.value
            if (value) {
              a[name] = value
            }
            return a
          }, {})
        const btnData = $(btn).data()
        const { rowData, tr } = btnData
        const { order_id, machine_id, wo_m_time } = rowData
        const updateData = {
          order_id,
          machine_id,
          wo_m_time: wo_m_time.toFormatedDatetime(),
        }
        // updateData.exp_mdate = rowData.exp_mdate.toFormatedDatetime();
        const isUpdateExpMDate =
          formData.exp_mdate !== rowData.exp_mdate.toFormatedDate()
        const isUpdateExpEDate =
          context.userAuth.canEditExpEdate &&
          formData.exp_edate !== rowData.exp_edate.toFormatedDatetime()
        const isUpdateWorkBy =
          formData.work_by && formData.work_by !== rowData.work_by
        const isUpdateMQty =
          formData.m_qty && Number(formData.m_qty) !== rowData.m_qty
        const isUpdateMPtime =
          formData.m_ptime && Number(formData.m_ptime) !== rowData.m_ptime
        const isUpdateMUsage =
          formData.m_usage && Number(formData.m_usage) !== rowData.m_usage
        const updateTime = moment().format('YYYYMMDDHHmmss')
        // 更新預計上線日
        if (isUpdateExpMDate) {
          updateData.exp_mdate = context.getExpectStartDate(formData.exp_mdate)
        }
        if (isUpdateExpEDate) {
          updateData.exp_edate = formData.exp_edate
          updateData.cus_field_2 =
            (rowData.cus_field_2 ? rowData.cus_field_2 + '|' : '') +
            `${context.userId},${updateTime}`
        }
        if (isUpdateWorkBy) {
          updateData.work_by = formData.work_by
        }
        if (isUpdateMQty) {
          updateData.m_qty = formData.m_qty
        }
        if (isUpdateMPtime) {
          updateData.m_ptime = formData.m_ptime
          // 原標工(秒)、exp預計完成時間、已生產時間(含單位)、已生產數、M522=211-發生時間、m修改時間
          // 72sec,exp20200120110159,36000sec,500,211-M,m20200106080959
          const productionElapseTime = Math.round(
            (+moment() - moment(rowData.act_mdate.toFormatedDatetime())) / 1000
          )
          updateData.cus_field_1 =
            (rowData.cus_field_1 ? rowData.cus_field_1 + '|' : '') +
            [
              `${rowData.m_ptime}sec`,
              `exp${rowData.exp_edate.toFormatedDatetime(
                null,
                'YYYYMMDDHHmmss'
              )}`,
              `${productionElapseTime}sec`,
              `${rowData.m_pqty}`,
              `211-M`,
              `m${updateTime}`,
            ].join(',')
        }
        if (isUpdateMUsage) {
          updateData.m_usage = formData.m_usage
        }
        // 取得預計完成時間 exp_edate
        let isFetchEndTime =
          !isUpdateExpEDate &&
          (isUpdateExpMDate || isUpdateMPtime || isUpdateMQty)
        const fetchEndTime = isFetchEndTime
          ? new Promise((res) =>
              servkit.ajax(
                {
                  url: 'api/huangliangMatStock/schedule/recommend/endtime',
                  type: 'POST',
                  contentType: 'application/json',
                  data: JSON.stringify({
                    order_id: order_id,
                    product_id: rowData.product_id,
                    exp_date: rowData.exp_date
                      .toFormatedDate()
                      .replace(/\//g, '-'),
                    order_qty: rowData.order_qty,
                    pg_seq: rowData.pg_seq,
                    machine_id: machine_id,
                    exp_mdate: formData.exp_mdate.replace(/\//g, '-'),
                    correction_time: rowData.correction_time,
                    buffer_time: rowData.buffer_time,
                    std_hour: formData.m_ptime,
                  }),
                },
                {
                  success(data) {
                    res(data.endTime)
                  },
                }
              )
            )
          : Promise.resolve()
        fetchEndTime.then((endTime) => {
          if (isFetchEndTime && endTime) {
            updateData.exp_edate = endTime
          }
          if (updateData.exp_edate) {
            new Promise((resolve) =>
              servkit.ajax(
                {
                  url: `api/getdata/db`,
                  type: 'POST',
                  contentType: 'application/json',
                  data: JSON.stringify({
                    table: 'a_huangliang_non_production',
                    whereClause: 'exp_time < ? AND exp_edate > ?',
                    whereParams: [
                      updateData.exp_edate,
                      isUpdateExpMDate
                        ? updateData.exp_mdate
                        : rowData.exp_mdate.toFormatedDatetime(),
                    ],
                    columns: ['exp_edate'],
                  }),
                },
                {
                  success(response) {
                    resolve(_.pluck(response, 'exp_edate'))
                  },
                }
              )
            ).then((include_exp_time) =>
              servkit.ajax(
                {
                  url: `api/huangliangMatStock/scheduleSort/WoMStatusScheduling`,
                  type: 'POST',
                  contentType: 'application/json',
                  data: JSON.stringify({
                    order_id: order_id,
                    wo_m_time: updateData.wo_m_time.replace(/\//g, '-'),
                    exp_mdate: isUpdateExpMDate
                      ? updateData.exp_mdate.replace(/\//g, '-')
                      : formData.exp_mdate.replace(/\//g, '-'),
                    exp_edate: updateData.exp_edate.replace(/\//g, '-'),
                    machine_id: machine_id,
                    include_exp_time,
                  }),
                },
                {
                  success(response) {
                    // TODO: 顯示衝突確認modal
                  },
                }
              )
            )
          } else {
            servkit.ajax(
              {
                url: 'api/huangliangMatStock/wo_m_status',
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(updateData),
              },
              {
                success(data) {
                  context.queryResultTable.table.row(tr).data(data).draw(false)
                  $('#edit-assignment-modal-widget').modal('hide')
                },
              }
            )
          }
        })
      },
      showEditAssignmentModal(btn) {
        const context = this
        const tr = btn.closest('tr')
        const rowData = context.queryResultTable.table.row(tr).data()
        const { w_m_status } = rowData
        $('#update-assignment-btn').data({
          rowData,
          tr,
        })
        $('#edit-assignment-form')
          .find('[name]')
          .each((i, el) => {
            const name = el.name
            if (name === 'exp_mdate') {
              el.value = rowData[name]
                ? rowData[name].toFormatedDate()
                : ''.toFormatedDate()
            } else if (name === 'exp_edate') {
              el.value = rowData[name] ? rowData[name].toFormatedDatetime() : ''
            } else {
              el.value = rowData[name] || ''
            }

            if (
              name === 'exp_mdate' ||
              name === 'm_qty' ||
              name === 'work_by'
            ) {
              el.disabled = w_m_status === 1
            }
            if (name === 'exp_edate') {
              el.disabled = !context.userAuth.canEditExpEdate
            }
          })
        $('#edit-assignment-modal-widget').modal('show')
      },
      showCreateAssignmentModal() {
        const context = this
        const {
          createAssignmentForm,
          $createAssignmentForm,
          validator,
        } = context

        createAssignmentForm.$orderId.val('')
        createAssignmentForm.$machineSelect
          .find('option:first-child')
          .prop('checked', true)
        createAssignmentForm.$productId.val('')
        createAssignmentForm.$mPtime.val('')
        createAssignmentForm.$mUsage.val('')
        createAssignmentForm.$mQty.val('')
        createAssignmentForm.$expMdate.val(String.prototype.toFormatedDate())
        createAssignmentForm.$programSeq.val('1')
        createAssignmentForm.$workBy.val('')
        $createAssignmentForm
          .find('[name=mat_control][value=Y]')
          .prop('checked', true)
        if (validator) {
          validator.destroy()
        }

        $('#create-assignment-modal-widget').modal('show')
      },
      initCreateAssignmentFrom() {
        const context = this
        const $form = (context.$createAssignmentForm = $(
          '#create-assignment-form'
        ))
        const $machineSelect = (context.createAssignmentForm.$machineSelect = $form.find(
          '[name=machine_id]'
        ))
        const $orderId = (context.createAssignmentForm.$orderId = $form.find(
          '[name=order_id]'
        ))
        const $productId = (context.createAssignmentForm.$productId = $form.find(
          '[name=product_id]'
        ))
        const $mPtime = (context.createAssignmentForm.$mPtime = $form.find(
          '[name=m_ptime]'
        ))
        const $mUsage = (context.createAssignmentForm.$mUsage = $form.find(
          '[name=m_usage]'
        ))
        const $mQty = (context.createAssignmentForm.$mQty = $form.find(
          '[name=m_qty]'
        ))
        const $programSeq = (context.createAssignmentForm.$programSeq = $form.find(
          '[name=pg_seq]'
        ))
        const $expMdate = (context.createAssignmentForm.$expMdate = $form.find(
          '[name=exp_mdate]'
        ))
        const $workBy = (context.createAssignmentForm.$workBy = $form.find(
          '[name=work_by]'
        ))
        const getProductProfileByOrderId = (order_id) => {
          const mstock_name = context.commons.mstockNameMap[order_id[0]]
          return new Promise((res) =>
            servkit.ajax(
              {
                url: 'api/getdata/db',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                  table: 'a_huangliang_view_product_profile_wo_list',
                  whereClause: 'order_id=? AND mstock_name=?',
                  whereParams: [order_id, mstock_name],
                }),
              },
              {
                success(data) {
                  res(data[0] || [])
                },
              }
            )
          )
        }
        const setValidateMsg = () => {
          $.validator.messages.maxlength = $.validator.format('長度不能超過{0}')
          $.validator.messages.minlength = $.validator.format('長度不能低於{0}')
          $.validator.messages.digits = $.validator.format('請輸入正整數')
          $.validator.messages.min = $.validator.format('最小值為{0}')
          $.validator.messages.max = $.validator.format('最大值為{0}')
          $.validator.messages.date = $.validator.format('請輸入正確的日期格式')
          $.validator.messages.number = $.validator.format('請輸入數字')
        }
        const orderIdHandler = (order_id) => {
          if (order_id.length === 11) {
            getProductProfileByOrderId(order_id).then((data) => {
              const {
                def_runtime = '',
                mat_usage = '',
                product_id = '',
                order_qty = 0,
                wo_mqty = 0,
              } = data
              const m_qty = order_qty - wo_mqty
              $productId.val(product_id)
              $mPtime.val(def_runtime)
              $mUsage.val(mat_usage)
              $mQty.val(m_qty > 0 ? m_qty : 0)
              $('#create-assignment-btn').data('woListData', data)
            })
          }
        }
        const orderIdHandlerDebounced = _.debounce(orderIdHandler, 500)
        servkit.initMachineSelect($machineSelect)
        servkit.initSelectWithList(context.preCon.user.regulate, $workBy)
        servkit.initDatePicker($expMdate)
        context.commons.autoCompleteOrderId($orderId, {
          select(event, ui) {
            const selectedOrderId = ui.item.value
            $orderId.trigger('keyup', selectedOrderId)
          },
        })
        setValidateMsg()
        $orderId.on('keyup', function (e, orderId) {
          orderIdHandlerDebounced(orderId || this.value)
        })
        $('#create-assignment-btn').on('click', function () {
          const woListData = $(this).data().woListData
          const multiprogram = woListData ? woListData.multiprogram : ''

          // validate
          context.validator = $('#create-assignment-form').validate({
            rules: {
              order_id: {
                required: true,
                minlength: 11,
                maxlength: 11,
              },
              machine_id: {
                required: true,
              },
              m_ptime: {
                number: true,
                min: 0,
              },
              m_usage: {
                number: true,
                min: 0,
              },
              m_qty: {
                required: true,
                digits: true,
                min: 1,
              },
              exp_mdate: {
                dateISO: true,
                required: true, // 為了不改API
              },
              pg_seq: _.extend(
                {
                  required: true,
                  min: 1,
                },
                multiprogram
                  ? {
                      max: multiprogram,
                    }
                  : {}
              ),
            },
          })
          if (context.validator.form()) {
            context.createAssignment()
          }
        })
      },
      getExpectStartDate(date) {
        const context = this
        const isToday = date === ''.toFormatedDate()
        // 派工日期為當天，時間用當下時間；派工日期不是當天，時間用第一班次開始時間
        return (
          date +
          ' ' +
          (isToday ? moment().format('HH:mm:ss') : context.preCon.workShift)
        )
      },
      createAssignment() {
        const context = this
        const formData = $('#create-assignment-form')
          .find('[name]')
          .toArray()
          .reduce((a, el) => {
            const name = el.name
            const value = el.value
            const type = el.type
            if (
              (type === 'radio' && el.checked) ||
              (type !== 'radio' && value)
            ) {
              a[name] = value
            }
            return a
          }, {})
        formData.exp_mdate = context.getExpectStartDate(formData.exp_mdate)
        const { machine_id, m_ptime, exp_mdate, m_qty } = formData
        const {
          $startDateInput,
          $endDateInput,
          $queryConditionForm,
          $orderIdInput,
          $productIdInput,
        } = context
        const today = String.prototype.toFormatedDate()
        // const exp_edate = context.getExpectEndDate(exp_mdate, m_ptime, m_qty);
        // exp_edate 預計完工時間由後端計算
        servkit.ajax(
          {
            url: 'api/huangliangMatStock/wo_m_status',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
          },
          {
            success(data) {
              // 調整搜尋條件，範圍要符合增加的此筆派工以顯示
              $startDateInput.val(today)
              $endDateInput.val(today)
              context.$machineSelect.val(machine_id)
              $orderIdInput.val('')
              $productIdInput.val('')
              $queryConditionForm
                .find('[name=status]')
                .each((i, el) => (el.checked = el.value === 'unclosed'))
              context.getMachineAssignment()
              $('#create-assignment-modal-widget').modal('hide')
            },
          }
        )
      },
      getMachineAssignment() {
        const context = this
        const {
          $queryConditionForm,
          $orderIdInput,
          $productIdInput,
          $machineSelect,
          $startDateInput,
          $endDateInput,
        } = context
        const status = $queryConditionForm
          .find('[name=status]:checked')
          .map((i, el) => el.value)
          .toArray()
        const order_id = $orderIdInput.val()
        const product_id = $productIdInput.val()
        const startDate = $startDateInput.val() + ' 00:00:00'
        const endDate = $endDateInput.val() + ' 23:59:59'
        const machine_id = $machineSelect.val().filter((name) => name !== 'ALL')
        const statusMap = {
          unclosed: [0, 1],
          closed: [9],
          canceled: [99],
        }
        let whereClause = `machine_id IN (${machine_id
          .map(() => '?')
          .join(',')})`
        const whereParams = [...machine_id]
        if (order_id) {
          whereClause += ' AND order_id=?'
          whereParams.push(order_id)
        }
        if (product_id) {
          whereClause += ' AND product_id=?'
          whereParams.push(product_id)
        }
        if (startDate) {
          whereClause += ' AND wo_m_time BETWEEN ? AND ?'
          whereParams.push(startDate, endDate)
        }
        if (status.length) {
          const params = _.chain(status)
            .map((status) => statusMap[status])
            .flatten()
            .value()
          whereClause += ` AND w_m_status IN (${params
            .map(() => '?')
            .join(',')})`
          whereParams.push(...params)
        }
        $('#query-result-widget')
          .find('.stk-refresh-btn span')
          .addClass('.fa-spin')
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_huangliang_view_wo_m_status_wo_list',
              whereClause,
              whereParams,
            }),
          },
          {
            success(data) {
              context.queryResultTable.drawTable(data)
            },
            always() {
              $('#query-result-widget')
                .find('.stk-refresh-btn span')
                .removeClass('.fa-spin')
            },
          }
        )
      },
      showConfirmModal(type, btn) {
        const context = this
        const {
          $confirmModal,
          $confirmBtn,
          $confirmContent,
          $confirmtitle,
        } = context
        const tr = btn.closest('tr')
        const rowData = context.queryResultTable.table.row(tr).data()

        let title = ''
        let content = ''
        switch (type) {
          case 'cancel-closed':
            content = '確定要取消結案?'
            title = '取消結案'
            break
          case 'close-assignment':
            content = '確定要結案?'
            title = '結案'
            break
          case 'cancel-machine-assignment':
            content = '確定要取消?'
            title = '取消'
            break
        }
        $confirmtitle.text(title)
        $confirmContent.text(content)
        $confirmBtn.data({
          'confirm-type': type,
          rowData,
          tr,
        })
        $confirmModal.modal('show')
      },
      confirmHandler(btn) {
        const context = this
        const btnData = $(btn).data()
        const { 'confirm-type': type, rowData, tr } = btnData
        const { order_id, machine_id, wo_m_time } = rowData
        const requestBody = {
          order_id,
          machine_id,
          wo_m_time: wo_m_time.toFormatedDatetime(),
        }

        switch (type) {
          case 'cancel-closed':
            requestBody.w_m_status = 1
            requestBody.act_edate = null
            break
          case 'close-assignment':
            requestBody.w_m_status = 9
            requestBody.act_edate = ''.toFormatedDate()
            break
          case 'cancel-machine-assignment':
            requestBody.w_m_status = 99
            break
        }
        servkit.ajax(
          {
            url: 'api/huangliangMatStock/wo_m_status',
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(requestBody),
          },
          {
            success(data) {
              context.queryResultTable.table.row(tr).data(data).draw(false)
              context.queryResultTable.fillSelectFilterOptions(false)
              context.$confirmModal.modal('hide')
            },
          }
        )
      },
      showCollectMaterialAssignmentModal(btn) {
        const context = this
        const tr = btn.closest('tr')
        const rowData = context.queryResultTable.table.row(tr).data()
        context.materialAssign.show(rowData, tr)
        return
        // const context = this;
        // const tr = btn.closest('tr');
        // const rowData = context.queryResultTable.table.row(tr).data();
        // const {
        //   machine_id,
        //   order_id
        // } = rowData;
        // const mstock_name = context.commons.mstockNameMap[order_id[0]];
        // $('#wo-to-assign').text(order_id);
        // $('#machine-to-assign').text(servkit.getMachineName(machine_id));
        // $('#collect-material-assignment-modal-widget').data('rowData', rowData);
        // $('#material-warning').empty();
        // $('#material-quantity').text(0);
        // servkit.ajax({
        //   url: 'api/huangliangMatStock/wo_m_mat',
        //   type: 'GET',
        //   data: {
        //     order_id,
        //     mstock_name
        //   }
        // }, {
        //   success (data) {
        //     context.bindedAssignableMaterial = data.binding_mats;
        //     context.unbindAssignableMaterial = data.unbinding_mats;
        //     context.drawAssignableMaterialTable();
        //     context.tempStockMaterialTable.drawTable(data.temp_stocks);
        //     context.materialToAssignTable.clearTable();
        //     $('#collect-material-assignment-modal-widget').find('[name=mat_code]').val(data.mat_codes[0]).data({ order_id });
        //     $('#collect-material-assignment-modal-widget').find('[name=is_rework]').prop('checked', true);
        //     $('#collect-material-assignment-modal-widget').find('[name=rework_size]').val('');
        //     $('#collect-material-assignment-modal-widget').modal('show');
        //     context.tempMaterialToAssignData = [];
        //     context.assignedMatTotalQty = 0;
        //     context.materialToAssignNumber = 1;
        //   }
        // })
      },
      getQueryData: function () {
        const orderId = servkit.getURLParameter('order_id')
        const time = servkit.getURLParameter('time')
        const machineId = servkit.getURLParameter('machine_id')
        if (orderId || time || machineId) {
          if (orderId) $('[name=order_id]').val(orderId)
          if (time) {
            $('[name=startDate]').val(time)
            $('[name=endDate]').val(time)
          }
          if (machineId) $('[name=machine_id]').val(machineId)
          $('[name=status]').prop('checked', true)
          $('#submit-btn').trigger('click')
        }
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
      workShift(done) {
        servkit.ajax(
          {
            url: 'api/workshift/today',
            type: 'GET',
          },
          {
            success(data) {
              done(data.find((row) => row.sequence === 1).start.split(' ')[1])
            },
          }
        )
      },
      user(done) {
        servkit.ajax(
          {
            url: 'api/user/read',
            type: 'GET',
          },
          {
            success(data) {
              const idNameMap = Object.fromEntries(
                data.map((d) => [d.user_id, d.user_name])
              )
              const regulate = Object.fromEntries(
                data
                  .filter(
                    (x) =>
                      x.sys_groups &&
                      x.sys_groups.findIndex(
                        (group) => group.group_id === 'factory_service_regulate'
                      ) >= 0
                  )
                  .map((d) => [d.user_id, d.user_name])
              )
              done({
                idNameMap,
                regulate,
                data,
              })
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
      ['/app/HuangLiangMatCollectAndSupplement/commons/materialAssign.js'],
      ['/js/plugin/bootstrap-datetimepicker/bootstrap-datetimepicker.min.js'],
    ],
  })
}
