export default function () {
  GoGoAppFun({
    gogo(context) {
      context.initAuth()
      context.initQueryConditionForm()
      context.initQueryResultTable()
      context.initEditWoListModal()
      context.initProductionProgressTable()
      context.initBindablePoTable()
      context.initBindedPoTable()
    },
    util: {
      $submitBtn: $('#submit-btn'),
      $mstockSelect: $('#mstock_name-select'),
      $productIdInput: $('#product_id-input'),
      $orderIdInput: $('#order_id-input'),
      $queryConditionForm: $('#query-condition-form'),
      $queryResultTable: $('#query-result-table'),
      $confirmModal: $('#confirm-modal-widget'),
      $confirmContent: $('#confirm-content'),
      $confirmtitle: $('#confirm-title'),
      $confirmBtn: $('#confirm-yes'),
      $productionProgressModal: $('#production-progress-modal-widget'),
      $productionProgressBarContainer: $('#production-progress-bar-container'),
      $productionProgressTable: $('#production-progress-table'),
      $productionProgressTitle: $('#production-progress-title'),
      $editWoListModal: $('#edit-wo-list-modal-widget'),
      $editWoListForm: $('#edit-wo-list-form'),
      $updateWoListBtn: $('#save-wo-list'),
      $bindPoModal: $('#bind-po-modal-widget'),
      queryResultTable: null,
      productionProgressTable: null,
      bindedPoTable: null,
      bindablePoTable: null,
      matUnitMap: {
        '1KG': 'KG',
        '1M': '支',
      },
      userAuth: {},
      initAuth() {
        const context = this
        const loginInfo = JSON.parse(window.sessionStorage.getItem('loginInfo'))
        const userGroup = loginInfo.user_group || []
        const canEditExpDateGroupList = [
          'material_stock_production_management',
          'factory_service_deputy_manager',
          'sys_manager_group',
          'sales_deputy_manager',
          'sales_manager',
        ]
        const canEditQuoteSecondsGroupList = [
          'sys_manager_group',
          'sales_deputy_manager',
          'sales_manager',
        ]
        const canEditExpDate =
          userGroup.findIndex((group) =>
            canEditExpDateGroupList.includes(group)
          ) >= 0
        const canEditQuoteSeconds =
          userGroup.findIndex((group) =>
            canEditQuoteSecondsGroupList.includes(group)
          ) >= 0
        Object.assign(context.userAuth, {
          canEditExpDate,
          canEditQuoteSeconds,
        })
      },
      initQueryConditionForm() {
        const context = this
        const {
          $submitBtn,
          $queryConditionForm,
          $mstockSelect,
          $orderIdInput,
          $productIdInput,
        } = context

        servkit.initSelectWithList(
          Object.values(context.commons.mstockNameMap),
          $mstockSelect,
          false
        )
        context.commons.autoCompleteOrderId($orderIdInput)
        context.commons.autoCompleteProductId($productIdInput)

        servkit.validateForm($queryConditionForm, $submitBtn)
        $submitBtn.on('click', function (e) {
          e.preventDefault()
          context.getOrderList()
        })
      },
      initQueryResultTable() {
        const context = this
        const { $queryResultTable, $confirmBtn } = context

        window.qrt = context.queryResultTable = createReportTable({
          $tableElement: $('#query-result-table'),
          $tableWidget: $('#query-result-widget'),
          columns: [
            {
              data: 'order_id',
              name: 'order_id',
            },
            {
              data: 'product_id',
              name: 'product_id',
            },
            {
              data: 'customer_id',
              name: 'customer_id',
            },
            {
              data: 'product_pid',
              name: 'product_pid',
            },
            {
              data: 'exp_date',
              name: 'exp_date',
              render(data, type, rowData) {
                const date = data ? data.toFormatedDate() : ''
                const { wo_status } = rowData
                const canEdit =
                  wo_status === 0 && context.userAuth.canEditExpDate
                return (
                  date +
                  (canEdit
                    ? `<button class="btn btn-xs btn-primary edit-exp-date-btn pull-right" title="Edit"><i class="fa fa-pencil"></i></button>`
                    : '')
                )
              },
            },
            {
              data: 'quote_seconds',
              name: 'quote_seconds',
              render(data, type, rowData) {
                const { wo_status } = rowData
                const canEdit =
                  wo_status === 0 && context.userAuth.canEditQuoteSeconds
                return (
                  (data || '') +
                  (canEdit
                    ? `<button class="btn btn-xs btn-primary edit-quote-seconds-btn pull-right" title="Edit"><i class="fa fa-pencil"></i></button>`
                    : '')
                )
              },
            },
            {
              data: 'quote_price',
              name: 'quote_price',
              render(data, type, rowData) {
                const { wo_status } = rowData
                const canEdit = wo_status === 0
                return (
                  (data ? data.toFixed(2) : '') +
                  (canEdit
                    ? `<button class="btn btn-xs btn-primary edit-quote-price-btn pull-right" title="Edit"><i class="fa fa-pencil"></i></button>`
                    : '')
                )
              },
            },
            {
              data: 'order_qty',
              name: 'order_qty',
            },
            {
              data: 'wo_pqty',
              name: 'wo_pqty',
            },
            {
              data: 'wo_bqty',
              name: 'wo_bqty',
            },
            {
              data: 'wo_mqty',
              name: 'wo_mqty',
            },
            {
              data: 'multiprogram',
              name: 'multiprogram',
              render(data, type, rowData) {
                const { wo_status } = rowData
                const canEdit = wo_status === 0
                return (
                  (data || '') +
                  (canEdit
                    ? `<button class="btn btn-xs btn-primary edit-multiprogram-btn pull-right" title="Edit"><i class="fa fa-pencil"></i></button>`
                    : '')
                )
              },
            },
            {
              data: null,
              name: 'production_progress',
              render(data, type, rowData) {
                const { order_id } = rowData
                return `<button class="btn btn-primary show-progress-modal" data-order_id="${order_id}">進度圖</button>`
              },
            },
            {
              data: 'wo_status',
              name: 'wo_status',
              render(data, type) {
                if (type === 'display' || type === 'selectFilter') {
                  return context.commons.statusMap.wo_status[data]
                } else {
                  return data
                }
              },
            },
            {
              data: null,
              name: 'bind_po',
              render(data, type, rowData) {
                const { wo_status, order_id, product_id } = rowData
                const isClosed = wo_status === 9
                return `<button class="btn btn-primary bind-po" ${
                  isClosed ? 'disabled' : ''
                } data-product_id="${product_id}" data-order_id="${order_id}">明細</button>`
              },
            },
            {
              data: null,
              name: 'cancel',
              render(data, type, rowData) {
                const { wo_status } = rowData
                const canCancel = wo_status === 0
                return `<button class="btn btn-primary cancel-wo" ${
                  canCancel ? '' : 'disabled'
                }>取消</button>`
              },
            },
            {
              data: null,
              name: 'close',
              render(data, type, rowData) {
                const { wo_status } = rowData
                const canClose = [1, 2].includes(wo_status)
                const isClosed = wo_status === 9
                return `<button class="btn btn-primary ${
                  isClosed ? 'cancel-closed-wo' : 'close-wo'
                }" ${canClose || isClosed ? '' : 'disabled'}>${
                  isClosed ? '取消結案' : '結案'
                }</button>`
              },
            },
          ],
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

        $queryResultTable
          .on('click', '.bind-po', function () {
            context.showBindPoModal(this)
          })
          .on('click', '.cancel-wo', function () {
            context.showConfirmModal('cancel-wo', this)
          })
          .on('click', '.cancel-closed-wo', function () {
            context.showConfirmModal('cancel-closed-wo', this)
          })
          .on('click', '.close-wo', function () {
            context.showConfirmModal('close-wo', this)
          })
          .on('click', '.show-progress-modal', function () {
            context.showProgressModal(this)
          })
          .on('click', '.edit-exp-date-btn', function () {
            context.showEditWoListModal('exp_date', this)
          })
          .on('click', '.edit-multiprogram-btn', function () {
            context.showEditWoListModal('multiprogram', this)
          })
          .on('click', '.edit-quote-seconds-btn', function () {
            context.showEditWoListModal('quote_seconds', this)
          })
          .on('click', '.edit-quote-price-btn', function () {
            context.showEditWoListModal('quote_price', this)
          })

        $confirmBtn.on('click', function () {
          context.confirmHandler(this)
        })
      },
      initEditWoListModal() {
        const context = this
        const { $editWoListModal, $editWoListForm, $updateWoListBtn } = context
        const columnNameMap = {
          exp_date: '期望交期',
          quote_seconds: '報價秒數',
          quote_price: '單顆報價',
          multiprogram: '多製程加工',
        }

        $editWoListForm.sectionElementMap = {
          exp_date: document.getElementById('edit-exp-date'),
          quote_seconds: document.getElementById('edit-quote-seconds'),
          multiprogram: document.getElementById('edit-multiprogram'),
          quote_price: document.getElementById('edit-quote-price'),
        }
        $editWoListForm.inputElementMap = _.mapObject(
          $editWoListForm.sectionElementMap,
          (section) => section.querySelector('input')
        )
        servkit.initDatePicker($($editWoListForm.inputElementMap.exp_date))
        $editWoListForm.toggleMode = function (type) {
          this.editMode = type
          Object.entries(this.sectionElementMap).forEach(([name, el]) => {
            el.classList.toggle('hide', name !== type)
          })
        }
        $editWoListModal.$columnName = $('#edit-column-name')
        $editWoListModal.toggleMode = function (type) {
          this.$columnName.text(columnNameMap[type])
        }
        $updateWoListBtn.on('click', function () {
          context.updateWoList(this)
        })
        $.validator.messages.maxlength = $.validator.format('長度不能超過{0}')
        $.validator.messages.minlength = $.validator.format('長度不能低於{0}')
        $.validator.messages.digits = $.validator.format('請輸入正整數')
        $.validator.messages.min = $.validator.format('最小值為{0}')
        $.validator.messages.max = $.validator.format('最大值為{0}')
        $.validator.messages.date = $.validator.format('請輸入正確的日期格式')
        $.validator.messages.dateISO = $.validator.format(
          '請輸入正確的日期格式'
        )
        $.validator.messages.number = $.validator.format('請輸入數字')
      },
      showEditWoListModal(type, btn) {
        const context = this
        const { $editWoListModal, $editWoListForm, $updateWoListBtn } = context
        const tr = btn.closest('tr')
        const columnName = type
        const validator = $editWoListForm.data('validator')
        const rowData = context.queryResultTable.table.row(tr).data()
        let value = rowData[columnName] || ''
        if (columnName === 'exp_date') {
          value = value
            ? value.toFormatedDate()
            : String.prototype.toFormatedDate()
        }
        return new Promise((res) => {
          // 如果沒有值則填入product_profile.multiprogram作預設值
          if (columnName === 'multiprogram' && !value) {
            const { product_id, product_pid, order_id } = rowData
            const mstock_name = context.commons.mstockNameMap[order_id[0]]
            servkit.ajax(
              {
                url: 'api/getdata/db',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                  table: 'a_huangliang_product_profile',
                  whereClause:
                    'product_id = ? AND product_pid = ? AND mstock_name = ?',
                  whereParams: [product_id, product_pid, mstock_name],
                }),
              },
              {
                success(data) {
                  res(data)
                },
              }
            )
          } else {
            res()
          }
        }).then((dataArray) => {
          if (validator) {
            validator.destroy()
          }
          $editWoListForm.toggleMode(type)
          $editWoListModal.toggleMode(type)
          $editWoListForm.inputElementMap[columnName].value =
            dataArray && dataArray.length
              ? dataArray[0].multiprogram || 1
              : value
          $updateWoListBtn.data('tr', tr)
          $editWoListModal.modal('show')
        })
      },
      updateWoList(btn) {
        const context = this
        const { $editWoListForm, $editWoListModal } = context
        const columnName = $editWoListForm.editMode
        let value = $editWoListForm.inputElementMap[columnName].value
        const tr = $(btn).data('tr')
        const order_id = context.queryResultTable.table
          .cell(tr, 'order_id:name')
          .data()
        const validateConfig = {
          rules: {},
        }
        const userId = JSON.parse(sessionStorage.getItem('loginInfo')).user_id
        const isUpdateQuotedBy =
          columnName === 'quote_seconds' || columnName === 'quote_price'
        switch (columnName) {
          case 'exp_date':
            Object.assign(validateConfig.rules, {
              exp_date: {
                required: true,
                dateISO: true,
              },
            })
            break
          case 'quote_seconds':
            Object.assign(validateConfig.rules, {
              quote_seconds: {
                required: true,
                number: true,
                min: 1,
              },
            })
            break
          case 'multiprogram':
            Object.assign(validateConfig.rules, {
              multiprogram: {
                required: true,
                digits: true,
                min: 1,
              },
            })
            break
          case 'quote_price':
            Object.assign(validateConfig.rules, {
              multiprogram: {
                required: true,
                number: true,
              },
            })
            break
        }
        if (!$editWoListForm.validate(validateConfig).form()) {
          return
        }
        if (columnName === 'quote_price') {
          value = Number(value)
        }
        const requestBody = {
          tableModel:
            'com.servtech.servcloud.app.model.huangliang_matStock.WoList',
          order_id,
          [columnName]: value,
        }
        if (isUpdateQuotedBy) {
          requestBody.quoted_by = userId
        }
        servkit.ajax(
          {
            url: 'api/stdcrud',
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(requestBody),
          },
          {
            success(data) {
              context.queryResultTable.table
                .cell(tr, `${columnName}:name`)
                .data(value)
                .draw(false)
              $editWoListModal.modal('hide')
            },
          }
        )
      },
      getOrderList() {
        const context = this
        const {
          $queryConditionForm,
          $orderIdInput,
          $productIdInput,
          $mstockSelect,
        } = context
        const orderStatus = $queryConditionForm
          .find('[name=order_status]:checked')
          .map((i, el) => el.value)
          .toArray()
        const order_id = $orderIdInput.val()
        const product_id = $productIdInput.val()
        const mstock_name = $mstockSelect.val().filter((name) => name !== 'ALL')
        const orderStatusMap = {
          unclosed: [0, 1, 2],
          closed: [9],
          canceled: [99],
        }
        let whereClause = ''
        const whereParams = []
        if (order_id) {
          whereClause = 'order_id=?'
          whereParams.push(order_id)
        } else if (mstock_name.length === 1) {
          whereClause = 'order_id LIKE ?'
          whereParams.push(
            _.findKey(
              context.commons.mstockNameMap,
              (value) => value === mstock_name[0]
            ) + '%'
          )
        } else {
          whereClause = '1'
        }
        if (product_id) {
          whereClause += ' AND product_id=?'
          whereParams.push(product_id)
        }
        if (orderStatus.length) {
          const params = _.chain(orderStatus)
            .map((status) => orderStatusMap[status])
            .flatten()
            .value()
          whereClause += ` AND wo_status IN (${params
            .map(() => '?')
            .join(',')})`
          whereParams.push(...params)
        }
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_huangliang_wo_list',
              whereClause,
              whereParams,
            }),
          },
          {
            success(data) {
              context.queryResultTable.drawTable(data)
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
        const order_id = context.queryResultTable.table.row(tr).data().order_id
        let title = ''
        let content = ''
        switch (type) {
          case 'cancel-closed-wo':
            content = '確定要取消結案?'
            title = '取消結案'
            break
          case 'close-wo':
            content = '確定要結案?'
            title = '結案'
            break
          case 'cancel-wo':
            content = '確定要取消?'
            title = '取消'
            break
        }
        $confirmtitle.text(title)
        $confirmContent.text(content)
        $confirmBtn.data({
          'confirm-type': type,
          order_id,
          tr,
        })
        $confirmModal.modal('show')
      },
      confirmHandler(btn) {
        const context = this
        const btnData = $(btn).data()
        const { 'confirm-type': type, order_id, tr } = btnData

        if (type === 'close-wo') {
          context.closeWo(order_id, tr)
        } else if (type === 'cancel-closed-wo') {
          context.cancelClosedWo(order_id, tr)
        } else if (type === 'cancel-wo') {
          context.cancelWo(order_id, tr)
        }
      },
      showProgressModal(btn) {
        const context = this
        const order_id = $(btn).data('order_id')
        const tr = btn.closest('tr')
        const rowData = context.queryResultTable.table.row(tr).data()
        const { wo_pqty, wo_bqty, wo_mqty } = rowData

        context.$productionProgressTitle.text(
          `生產指令：${order_id} / 派工數： ${wo_mqty} / 生產總數： ${wo_pqty} / 不良品數： ${wo_bqty}`
        )
        context
          .getMachineProduction(order_id)
          .then((data) => {
            if (data && data.length) {
              const processedData = context.calcProductionProgress(data)
              return Promise.all([
                context.drawProgressBar(processedData),
                context.drawProgressTable(processedData),
              ])
            } else {
              context.$productionProgressBarContainer.empty()
              context.productionProgressTable.clearTable()
            }
          })
          .finally(() => {
            context.$productionProgressModal.modal('show')
          })
      },
      getMachineProduction(order_id) {
        return new Promise((res) => {
          servkit.ajax(
            {
              url: 'api/getdata/db',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                table: 'a_huangliang_wo_m_status',
                whereClause: 'order_id=?',
                whereParams: [order_id],
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
      calcProductionProgress(data) {
        let progress
        return data.map((record) => {
          const { m_qty, m_pqty, m_bqty } = record

          progress = m_qty
            ? (((m_pqty - m_bqty) / m_qty) * 100).toFixed(1)
            : '0.0'
          return _.extend(record, { progress })
        })
      },
      drawProgressBar(processedData) {
        const context = this
        const getBarContainer = (data) =>
          $(`<section>
          <h5 style="display: flex; justify-content: space-between;">
            <span>${servkit.getMachineName(data.machine_id)} 生產數: ${
            data.m_pqty
          } / 不良數: ${data.m_bqty} / 派工數: ${data.m_qty}</span>
            <span>${data.progress}%</span>
          </h5>
            <div class="progress ${
              Number(data.progress) >= 100 ? 'highlight' : ''
            }">
                <div class="progress-bar bg-color-greenLight" role="progressbar" style="width: ${
                  Number(data.progress) > 100 ? 100 : data.progress
                }%;">
                </div>
            </div>
        </section>`)
        context.$productionProgressBarContainer
          .empty()
          .append(...processedData.map((data) => getBarContainer(data)))
      },
      initProductionProgressTable() {
        const context = this
        context.productionProgressTable = createReportTable({
          $tableElement: context.$productionProgressTable,
          showNoData: false,
          columns: [
            {
              data: 'machine_id',
              name: 'machine_id',
              render(data, type, rowData) {
                return servkit.getMachineName(data)
              },
            },
            {
              data: 'wo_m_time',
              name: 'wo_m_time',
              render(data) {
                return data ? data.toFormatedDatetime() : ''
              },
            },
            {
              data: 'm_qty',
              name: 'm_qty',
            },
            {
              data: 'm_pqty',
              name: 'm_pqty',
            },
            {
              data: 'm_bqty',
              name: 'm_bqty',
            },
            {
              data: 'exp_mdate',
              name: 'exp_mdate',
              render(data) {
                return data ? data.toFormatedDate() : ''
              },
            },
            {
              data: 'act_mdate',
              name: 'act_mdate',
              render(data) {
                return data ? data.toFormatedDate() : ''
              },
            },
            {
              data: 'progress',
              name: 'progress',
              render(data) {
                return data + '%'
              },
            },
            {
              data: 'pg_seq',
              name: 'pg_seq',
              render(data) {
                return data || ''
              },
            },
          ],
        })
      },
      drawProgressTable(data) {
        const context = this
        context.productionProgressTable.drawTable(data)
      },
      closeWo(order_id, tr) {
        const context = this
        servkit.ajax(
          {
            url: 'api/huangliangMatStock/wo_list/close',
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({
              order_id,
            }),
          },
          {
            success(data) {
              const isSuccess = _.isObject(data)
              if (!isSuccess) {
                $.smallBox({
                  title: '有未結案之機台派工記錄，請確認機台派工記錄已全部結案',
                  color: 'red',
                  iconSmall: 'fa fa-sign-out',
                  timeout: 4000,
                })
              } else {
                context.queryResultTable.table.row(tr).data(data).draw(false)
                context.queryResultTable.fillSelectFilterOptions(false)
              }
              context.$confirmModal.modal('hide')
            },
          }
        )
      },
      cancelClosedWo(order_id, tr) {
        const context = this
        servkit.ajax(
          {
            url: 'api/huangliangMatStock/wo_list/restart',
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({
              order_id,
            }),
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
      cancelWo(order_id, tr) {
        const context = this
        servkit.ajax(
          {
            url: 'api/huangliangMatStock/wo_list/cancel',
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({
              order_id,
            }),
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
      showBindPoModal(btn) {
        const context = this
        const { order_id, product_id } = btn.dataset
        const mstock_name = context.commons.mstockNameMap[order_id[0]]

        $('#wo-to-bind').text(order_id)
        context
          .getWoPoBinding(order_id)
          .then((data) => {
            const hasBindedPo = !!data.length
            if (hasBindedPo) {
              const lastBindingRecord = data[0]
              const { mat_code: lastBindingMatCode } = lastBindingRecord
              $('#mat-code-filter').val(lastBindingMatCode)
              context.bindedPoTable.drawTable(data)
              return context.getPoFileByMatCode(lastBindingMatCode, order_id)
            } else {
              context.bindedPoTable.clearTable()
              return context.getPoFileByProductId(
                product_id,
                mstock_name,
                order_id
              )
            }
          })
          .then((data = []) => {
            context.bindablePoTable.drawTable(data)
            context.$bindPoModal.modal('show')
          })
      },
      getWoPoBinding(order_id) {
        const context = this
        return new Promise((res) => {
          servkit.ajax(
            {
              url: 'api/getdata/db',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                table: 'a_huangliang_wo_po_binding',
                whereClause: 'order_id=? ORDER BY create_time DESC',
                whereParams: [order_id],
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
      getPoFileByMatCode(mat_code, order_id) {
        const context = this
        const mstock_name = context.commons.mstockNameMap[order_id[0]]
        return new Promise((res) => {
          // 可綁定的採購單(採購數量大於已綁數量)會排除已被此張單綁定的
          servkit.ajax(
            {
              url: 'api/huangliangMatStock/wo_po_binding',
              type: 'GET',
              contentType: 'application/json',
              data: {
                order_id,
                mat_code,
                mstock_name,
              },
            },
            {
              success(data) {
                res(data)
              },
            }
          )
        })
      },
      getPoFileByProductId(product_id, mstock_name, order_id) {
        const context = this
        const getMatCode = (mat_id, mat_shape, mat_dim) => {
          // mat_code 外徑整數部分不足兩位時前面補零，小數部份不足一位或沒有小數時後面補上.0
          const matDimMatchResult = mat_dim.toString().match(/^(\d+)(\.\d+)*$/)
          let matDimIntegerPart = matDimMatchResult[1]
          let matDimDecimalPart = matDimMatchResult[2]
          matDimIntegerPart =
            (matDimIntegerPart.length === 1 ? '0' : '') + matDimIntegerPart
          matDimDecimalPart = matDimDecimalPart ? matDimDecimalPart : '.0'
          const matDimFormated = matDimIntegerPart + matDimDecimalPart
          const matCode = `M-${mat_id}-${mat_shape}-${matDimFormated}`
          return mat_shape && mat_dim ? matCode : ''
        }

        return new Promise((res) => {
          const whereClause = 'product_id=? AND mstock_name=?'
          const whereParams = [product_id, mstock_name]
          servkit.ajax(
            {
              url: 'api/getdata/db',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                table: 'a_huangliang_product_profile',
                whereClause,
                whereParams,
              }),
            },
            {
              success(data) {
                res(data)
              },
            }
          )
        }).then((data) => {
          const isProductProfileAllSet =
            data.length &&
            data[0].mat_id &&
            data[0].mstock_name &&
            data[0].mat_shape &&
            data[0].mat_dim
          if (isProductProfileAllSet) {
            const { mat_id, mstock_name, mat_shape, mat_dim } = data[0]
            const matCode = getMatCode(mat_id, mat_shape, mat_dim)
            $('#mat-code-filter').val(matCode)

            return new Promise((res) => {
              servkit.ajax(
                {
                  url: 'api/huangliangMatStock/wo_po_binding',
                  type: 'GET',
                  data: {
                    mstock_name,
                    order_id,
                    mat_code: matCode,
                  },
                },
                {
                  success(data) {
                    res(data)
                  },
                }
              )
            })
          } else {
            $('#mat-code-filter').val('')
            $.smallBox({
              title: '錯誤',
              content: '請先至「管編生產條件設定」設定使用材料、外徑和形狀',
              color: 'red',
              iconSmall: 'fa fa-sign-out',
              timeout: 4000,
            })
            return new Promise((res) => res())
          }
        })
      },
      validateBindQty(bind_qty, rowData) {
        const context = this
        const numberErrorMsg = '請填大於零的數字'
        const quantityErrorMsg = '超過可綁定數量'
        const getErrorLabel = (type) => {
          let label = ''
          switch (type) {
            case 'number':
              label = `<label class="error" data-error-type="number">${numberErrorMsg}</label>`
              break
            case 'quantity':
              label = `<label class="error" data-error-type="quantity">${quantityErrorMsg}</label>`
              break
          }
          return label
        }
        const validateNumber = (value) => {
          const num = Number(value)
          return !isNaN(num) && num > 0
        }
        const validateQuantity = (value, legalQuntity) =>
          Number(value) <= legalQuntity
        let isNumber = false
        let isLegalQuantity = false
        let td
        let errorLabel
        let labelErrorType
        let bindable_qty
        return (input) => {
          bindable_qty = context.bindablePoTable.table
            .cell(input.closest('tr'), 'bindable_qty:name')
            .data()
          isNumber = validateNumber(input.value)
          isLegalQuantity = validateQuantity(input.value, bindable_qty)
          td = input.closest('td')
          errorLabel = td.querySelector('.error')
          labelErrorType = errorLabel ? errorLabel.dataset.errorType : null
          if (errorLabel) {
            errorLabel.remove()
          }
          if (!isNumber) {
            input.insertAdjacentHTML('afterend', getErrorLabel('number'))
          } else if (!isLegalQuantity) {
            input.insertAdjacentHTML('afterend', getErrorLabel('quantity'))
          }

          return isNumber && isLegalQuantity
        }
      },
      initBindedPoTable() {
        const context = this
        context.bindedPoTable = createReportTable({
          $tableElement: $('#binded-po-table'),
          showNoData: false,
          columns: [
            {
              name: 'mstock_name',
              data: 'mstock_name',
            },
            {
              name: 'po_no',
              data: 'po_no',
            },
            {
              name: 'create_time',
              data: 'create_time',
              render(data) {
                return data.toFormatedDatetime()
              },
            },
            {
              name: 'mat_code',
              data: 'mat_code',
            },
            {
              name: 'bind_qty',
              data: 'bind_qty',
              render(data) {
                const editBtn = `<button class="btn btn-xs btn-primary stk-edit-btn pull-right" title="Edit"><i class="fa fa-pencil"></i></button>`
                const inputGroup = `<div class="input-group">
                  <input type="text" class="form-control" value="${data}">
                  <div class="input-group-btn">
                    <button class="btn btn-danger stk-cancel-btn" title="Cancel"><i class="fa fa-times"></i></button>
                    <button class="btn btn-success stk-save-btn" title="Save"><i class="fa fa-save"></i></button>
                  </div>
                </div>`
                const span = `<span class="bind-qty-display">${data}</span>`
                return span + editBtn + inputGroup
              },
            },
            {
              name: 'unit',
              data: null,
              render(data, type, rowData) {
                const { mat_code } = rowData
                const mat_id = mat_code.split('-')[1]
                const mat_unit = context.preCon.matUnit[mat_id]
                  ? context.preCon.matUnit[mat_id].mat_unit
                  : ''
                return context.matUnitMap[mat_unit] || mat_unit
              },
            },
            {
              name: 'use_qty',
              data: 'use_qty',
            },
            {
              name: 'w_p_status',
              data: 'w_p_status',
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
        $('#binded-po-table')
          .on('click', '.stk-edit-btn', function () {
            const td = this.closest('td')
            const bind_qty = td.querySelector('.bind-qty-display').textContent
            td.querySelector('input').value = bind_qty
            $(td).addClass('edit')
          })
          .on('click', '.stk-cancel-btn', function () {
            const td = this.closest('td')
            $(td).find('.error').remove()
            $(td).removeClass('edit')
          })
          .on('click', '.stk-save-btn', function () {
            const td = this.closest('td')
            const input = td.querySelector('input')
            const bind_qty = input.value
            const tr = this.closest('tr')
            const rowData = context.bindedPoTable.table.row(tr).data()
            const pks = _.pick(rowData, [
              'order_id',
              'mstock_name',
              'po_no',
              'mat_code',
              'sup_id',
            ])
            const $errorLabel = $(td).find('.error')
            if (isNaN(Number(bind_qty)) || Number(bind_qty) <= 0) {
              if (!$errorLabel.length) {
                $(td).append('<label class="error">請填大於零的數字</label>')
              }
              return
            }
            $errorLabel.remove()
            servkit.ajax(
              {
                url: 'api/huangliangMatStock/wo_po_binding',
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(_.extend({ bind_qty }, pks)),
              },
              {
                success(data) {
                  const { po_file, wo_po_binding } = data
                  $(td).removeClass('edit')
                  context.bindedPoTable.table
                    .row(tr)
                    .data(wo_po_binding)
                    .draw(false)
                },
                fail(data) {
                  let errorMsg = ''
                  if (_.isObject(data)) {
                    errorMsg = data.errorMsg
                  } else {
                    errorMsg = '修改失敗，請聯絡系統管理員'
                    console.warn('修改失敗', data)
                  }
                  $.smallBox({
                    title: errorMsg,
                    color: 'red',
                    iconSmall: 'fa fa-sign-out',
                    timeout: 4000,
                  })
                },
              }
            )
          })
      },
      initBindablePoTable() {
        const context = this
        const renderPoFile = (mat_code) => {
          const order_id = $('#wo-to-bind').text()
          context.getPoFileByMatCode(mat_code, order_id).then((data) => {
            context.bindablePoTable.drawTable(data)
          })
        }
        const renderPoFileDebounced = _.debounce(renderPoFile, 500)
        const validateBindQty = (() => {
          const numberErrorMsg = '請填大於零的數字'
          const quantityErrorMsg = '超過可綁定數量'
          const getErrorLabel = (type) => {
            let label = ''
            switch (type) {
              case 'number':
                label = `<label class="error" data-error-type="number">${numberErrorMsg}</label>`
                break
              case 'quantity':
                label = `<label class="error" data-error-type="quantity">${quantityErrorMsg}</label>`
                break
            }
            return label
          }
          const validateNumber = (value) => {
            const num = Number(value)
            return !isNaN(num) && num > 0
          }
          const validateQuantity = (value, legalQuntity) =>
            Number(value) <= legalQuntity
          let isNumber = false
          let isLegalQuantity = false
          let td
          let errorLabel
          let labelErrorType
          let bindable_qty
          return (input) => {
            bindable_qty = context.bindablePoTable.table
              .cell(input.closest('tr'), 'bindable_qty:name')
              .data()
            isNumber = validateNumber(input.value)
            isLegalQuantity = validateQuantity(input.value, bindable_qty)
            td = input.closest('td')
            errorLabel = td.querySelector('.error')
            labelErrorType = errorLabel ? errorLabel.dataset.errorType : null
            if (errorLabel) {
              errorLabel.remove()
            }
            if (!isNumber) {
              input.insertAdjacentHTML('afterend', getErrorLabel('number'))
            } else if (!isLegalQuantity) {
              input.insertAdjacentHTML('afterend', getErrorLabel('quantity'))
            }

            return isNumber && isLegalQuantity
          }
        })()
        const bindPo = (trArr, inputArr) => {
          const requestBody = {
            order_id: $('#wo-to-bind').text(),
            pos: [],
          }
          let input
          let bind_qty
          let rowData
          trArr.forEach((tr, i) => {
            input = inputArr[i]
            rowData = context.bindablePoTable.table.row(tr).data()
            bind_qty = input.value
            requestBody.pos.push(
              _.extend(
                { bind_qty },
                _.pick(rowData, [
                  'mat_code',
                  'po_no',
                  'mstock_name',
                  'sup_id',
                  'unit',
                ])
              )
            )
          })
          return new Promise((res) =>
            servkit.ajax(
              {
                url: 'api/huangliangMatStock/wo_po_binding',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(requestBody),
              },
              {
                success(data) {
                  res(data)
                },
              }
            )
          )
        }
        context.bindablePoTable = createReportTable({
          $tableElement: $('#bindable-po-table'),
          showNoData: false,
          customBtns: [
            `<button class="btn btn-primary" id="bind-po-btn">綁定</button>`,
            `<input type="text" id="mat-code-filter" class="form-control margin-bottom-5" placeholder="請輸入材料條碼以查找">`,
          ],
          checkbox: true,
          columns: [
            {
              name: 'mstock_name',
              data: 'mstock_name',
            },
            {
              name: 'po_no',
              data: 'po_no',
            },
            {
              name: 'mat_code',
              data: 'mat_code',
            },
            {
              name: 'po_qty',
              data: 'po_qty',
            },
            {
              name: 'bindable_qty',
              data(rowData) {
                const { bind_qty, po_qty } = rowData
                const bindable_qty = Number(po_qty) - Number(bind_qty)
                return bindable_qty
              },
            },
            {
              name: 'binding_qty',
              data: null,
              render(data, type, rowData) {
                return '<input type="text" class="form-control">'
              },
            },
            {
              name: 'unit',
              data: null,
              render(data, type, rowData) {
                const { mat_code } = rowData
                const mat_id = mat_code.split('-')[1]
                const mat_unit = context.preCon.matUnit[mat_id].mat_unit
                return mat_unit ? context.matUnitMap[mat_unit] : ''
              },
            },
            {
              name: 'pass_qty',
              data: 'pass_qty',
            },
            {
              name: 'use_qty',
              data: 'use_qty',
            },
          ],
        })
        context.$bindPoModal
          .on('keyup', '#mat-code-filter', function () {
            const mat_code = this.value
            renderPoFileDebounced(mat_code)
          })
          .on('click', '#bind-po-btn', function () {
            const selectedRow = $('#bindable-po-table')
              .find('tbody tr')
              .toArray()
              .filter((tr) => tr.querySelector('input[type=checkbox]').checked)
            const inputs = selectedRow.map((tr) =>
              tr.querySelector('input[type=text]')
            )
            const allValid = inputs
              .map((input) => validateBindQty(input))
              .every((b) => b)
            // TODO: 4.1.2.3 若以有其他生產指令以綁定該採購單，予以「警示」但不擋綁定功能(待確認)
            if (selectedRow.length && allValid) {
              bindPo(selectedRow, inputs)
                .then((data) => {
                  const { bindingData, bindedOrderId } = data
                  const mat_code = $('#mat-code-filter').val()
                  const order_id = $('#wo-to-bind').text()
                  context.bindedPoTable.drawTable(bindingData)
                  bindedOrderId.forEach((data) => {
                    if (data.orderIds.length) {
                      $.smallBox({
                        title: `採購單${data.po_no}已被其他生產指令綁定`,
                        content: `${_.pluck(data.orderIds, 'order_id').join(
                          ',\n'
                        )}`,
                        color: 'red',
                        //timeout: 8000,
                        iconSmall: 'fa fa-warning swing animated',
                      })
                    }
                  })
                  return context.getPoFileByMatCode(mat_code, order_id)
                })
                .then((data) => {
                  context.bindablePoTable.drawTable(data)
                })
            }
          })
      },
    },
    preCondition: {
      matUnit(done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_huangliang_mat_profile',
              columns: ['mat_id', 'mat_unit'],
            }),
          },
          {
            success(data) {
              done(_.indexBy(data, 'mat_id'))
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
