export default function () {
  GoGoAppFun({
    gogo(context) {
      window.c = context
      context.initAuth()
      context.initReportTable()
      context.initQueryConditionForm()
      context.initToolHistoryModal()
    },
    util: {
      $queryConditionForm: $('#query-condition-form'),
      $queryResultTable: $('#query-result-table'),
      $toolHistoryModal: $('#tool-history-modal'),
      $toolHistoryListTable: $('#tool-history-list-table'),
      $toolHistoryInfoForm: $('#tool-history-info-form'),
      $submitBtn: $('#submit-btn'),
      canCreateToolUseUserMap: null,
      mstockNameMap: {
        G: 'GOLF',
        M: '五金',
      },
      userAuth: {},
      initAuth() {
        const context = this
        const loginInfo = JSON.parse(window.sessionStorage.getItem('loginInfo'))
        const userGroup = loginInfo.user_group || []
        const canEditHistoryGroupList = [
          'sys_manager_group',
          'factory_service_regulate',
        ]
        const canEditHistory =
          userGroup.findIndex((group) =>
            canEditHistoryGroupList.includes(group)
          ) >= 0
        Object.assign(context.userAuth, {
          canEditHistory,
        })
      },
      initQueryConditionForm() {
        const context = this
        const { $queryConditionForm, $submitBtn } = context

        context.queryConditionForm = new window.Form($queryConditionForm)
        const { elements } = context.queryConditionForm
        context.canCreateToolUseUserMap = window.getCanCreateToolUseUserMap(
          context.preCon.user.data,
          'mp'
        )

        servkit.initSelectWithList(
          Object.values(context.mstockNameMap),
          $(elements.mstock_name.element)
        )
        servkit.initMachineSelect($(elements.machine_id.element))
        servkit.initDatePicker(
          $(elements.startDate.element),
          $(elements.endDate.element)
        )
        servkit.initSelectWithList(
          Object.assign({ '': '' }, context.canCreateToolUseUserMap),
          $(elements.work_by.element)
        )
        context.queryConditionForm.reset()

        servkit.validateForm($queryConditionForm, $submitBtn)
        $submitBtn.on('click', function () {
          context.getToolMpHistory()
        })
      },
      initReportTable() {
        const context = this
        const columns = [
          {
            name: 'tool_history_no',
            data: 'tool_history_no',
            render(data, type) {
              return data || ''
            },
          },
          {
            name: 'create_time',
            data: 'create_time',
            render(data, type) {
              if (type === 'selectFilter' || type === 'display') {
                return data ? data.toFormatedDatetime() : ''
              } else {
                return data || ''
              }
            },
          },
          {
            name: 'machine_id',
            data: 'machine_id',
            render(data, type) {
              if (type === 'selectFilter' || type === 'display') {
                return servkit.getMachineName(data)
              } else {
                return data || ''
              }
            },
          },
          {
            name: 'order_id',
            data: 'order_id',
            render(data, type) {
              return data || ''
            },
          },
          {
            name: 'product_id',
            data: 'product_id',
            render(data, type) {
              return data || ''
            },
          },
          {
            name: 'program_name',
            data: 'program_name',
            render(data, type) {
              return data || ''
            },
          },
          {
            name: 'work_by',
            data: 'work_by',
            render(data, type) {
              if (type === 'selectFilter' || type === 'display') {
                return context.preCon.user.idNameMap[data] || data
              } else {
                return data || ''
              }
            },
          },
          {
            name: 'tool_ptime',
            data: 'tool_ptime',
            render(data, type) {
              return data || ''
            },
          },
          {
            name: 'detail',
            data: 'detail',
            render(data) {
              return `<button class="btn btn-primary show-detail-btn" title="檢視明細"">履歷明細</button>`
            },
          },
        ]

        context.reportTable = createReportTable({
          $tableElement: $('#query-result-table'),
          $tableWidget: $('#query-result-widget'),
          autoWidth: false,
          order: [[0, 'desc']],
          columns,
        })

        $('#query-result-table').on('click', '.show-detail-btn', function () {
          context.showDetailModal(this)
        })
      },
      getToolMpHistory() {
        const context = this
        const { queryConditionForm } = context
        const queryParam = _.pick(
          queryConditionForm.getValue(),
          (value) => value && value.length
        )
        const whereParams = []
        let whereClause = 'tool_id IS NOT NULL'

        if (
          Object.prototype.hasOwnProperty.call(queryParam, 'mstock_name') &&
          queryParam.mstock_name.length === 1
        ) {
          whereClause += ` AND order_id LIKE ?`
          whereParams.push(
            _.findKey(
              context.mstockNameMap,
              (value) => value === queryParam.mstock_name[0]
            ) + '%'
          )
        }
        if (Object.prototype.hasOwnProperty.call(queryParam, 'machine_id')) {
          whereClause += ` AND machine_id IN (${Array.from(
            queryParam.machine_id,
            () => '?'
          ).join(',')})`
          whereParams.push(...queryParam.machine_id)
        }
        if (Object.prototype.hasOwnProperty.call(queryParam, 'startDate')) {
          whereClause += ' AND create_time > ?'
          whereParams.push(queryParam.startDate + ' 00:00:00')
        }
        if (Object.prototype.hasOwnProperty.call(queryParam, 'endDate')) {
          whereClause += ' AND create_time < ?'
          whereParams.push(queryParam.endDate + ' 23:59:59')
        }
        if (Object.prototype.hasOwnProperty.call(queryParam, 'product_id')) {
          whereClause += ' AND product_id = ?'
          whereParams.push(queryParam.product_id)
        }
        if (
          Object.prototype.hasOwnProperty.call(queryParam, 'tool_history_no')
        ) {
          whereClause += ' AND tool_history_no = ?'
          whereParams.push(queryParam.tool_history_no)
        }
        if (Object.prototype.hasOwnProperty.call(queryParam, 'work_by')) {
          whereClause += ' AND work_by = ?'
          whereParams.push(queryParam.work_by)
        }

        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_huangliang_view_tool_mp_history_tool_mp_his_list',
              whereClause,
              whereParams,
            }),
          },
          {
            success(data) {
              context.reportTable.drawTable(context.groupData(data))
            },
          }
        )
      },
      groupData(data) {
        return Object.values(
          data.reduce((a, x) => {
            const { tool_history_no, status } = x
            if (
              Object.prototype.hasOwnProperty.call(a, tool_history_no) &&
              Object.prototype.hasOwnProperty.call(x, 'tool_id') &&
              status === 0
            ) {
              a[tool_history_no].list.push(
                Object.assign(
                  {
                    isEdit: false,
                  },
                  x
                )
              )
            } else if (
              !Object.prototype.hasOwnProperty.call(a, tool_history_no) &&
              Object.prototype.hasOwnProperty.call(x, 'tool_id')
            ) {
              a[tool_history_no] = Object.assign(
                _.pick(x, [
                  'tool_history_no',
                  'create_time',
                  'machine_id',
                  'order_id',
                  'product_id',
                  'product_pid',
                  'program_name',
                  'work_by',
                  'tool_ptime',
                  'program_seq',
                  'produce_notice',
                  'main_chuck',
                  'second_chuck',
                  'mat_code',
                ]),
                {
                  list:
                    Object.prototype.hasOwnProperty.call(x, 'tool_id') &&
                    x.status === 0
                      ? [Object.assign({ isEdit: false }, x)]
                      : [],
                }
              )
            }
            return a
          }, {})
        )
      },
      showDetailModal(btn) {
        const context = this
        const {
          reportTable,
          toolHistoryInfoForm,
          toolHistoryListTable,
          $toolHistoryModal,
        } = context
        const tr = btn.closest('tr')
        const rowData = reportTable.table.row(tr).data()
        const detailData = rowData.list
        $toolHistoryModal.data({
          tr,
          rowData,
        })
        toolHistoryInfoForm.reset()
        toolHistoryInfoForm.setValue(
          Object.assign(rowData, {
            machine_id: rowData.machine_id
              ? servkit.getMachineName(rowData.machine_id)
              : '',
            create_time: rowData.create_time
              ? rowData.create_time.toFormatedDatetime()
              : '',
          })
        )
        toolHistoryInfoForm.toggleEditMode(false)
        toolHistoryListTable.drawTable(detailData)
        $toolHistoryModal.modal('show')
      },
      initToolHistoryModal() {
        const context = this
        const { userAuth } = context
        context.initToolHistoryInfoForm()
        context.initDetailTable()
        const $editBtn = $('#edit-tool-history-btn')

        $editBtn
          .toggleClass('hide', !userAuth.canEditHistory)
          .on('click', function () {
            context.editToolHistory()
          })
        $('#cancel-edit-btn').on('click', function () {
          context.cancelEditToolHistory()
        })
        $('#update-btn').on('click', function () {
          context.updateToolHistory()
        })
      },
      initToolHistoryInfoForm() {
        const context = this
        const toolHistoryInfoForm = new window.Form(
          context.$toolHistoryInfoForm
        )
        const canEditCols = [
          'tool_ptime',
          'main_chuck',
          'second_chuck',
          'program_name',
          'program_seq',
          'mat_code',
          'produce_notice',
          'work_by',
        ]
        servkit.initSelectWithList(
          context.canCreateToolUseUserMap,
          $(toolHistoryInfoForm.elements.work_by.element)
        )
        toolHistoryInfoForm.toggleEditMode = function (isEdit) {
          canEditCols.forEach((name) => {
            this.elements[name].element.disabled = !isEdit
          })
        }
        toolHistoryInfoForm.canEditCols = canEditCols
        toolHistoryInfoForm.getValue = function () {
          return _.chain(this.elements)
            .pick((value, key) => this.canEditCols.includes(key))
            .mapObject((el) => el.getValue())
            .value()
        }
        context.toolHistoryInfoForm = toolHistoryInfoForm

        // 新增input驗證方法
        $.validator.addMethod(
          'positiveInteger',
          function (value, element, params) {
            return this.optional(element) || /^[1-9]\d*$/.test(value)
          },
          '請輸入正整數'
        )

        $.validator.addMethod(
          'positiveNumber',
          function (value, element, params) {
            return (
              this.optional(element) ||
              /(^\d*\.?\d*[1-9]+\d*$)|(^[1-9]+\d*\.\d*$)/.test(value)
            )
          },
          '請輸入大於零的小數或整數'
        )
      },
      editToolHistory() {
        const context = this
        const {
          toolHistoryInfoForm,
          toolHistoryListTable,
          $toolHistoryModal,
        } = context

        $toolHistoryModal.toggleClass('edit-mode', true)
        toolHistoryInfoForm.toggleEditMode(true)
        toolHistoryListTable.toggleEditMode(true)
        const validator = toolHistoryInfoForm.$container.data().validator
        if (validator) {
          validator.destroy()
        }
      },
      updateToolHistory() {
        const context = this
        const {
          toolHistoryInfoForm,
          toolHistoryListTable,
          $toolHistoryModal,
          reportTable,
        } = context
        const tool_history_no = $toolHistoryModal.data('rowData')
          .tool_history_no
        const toolMpHistory = _.mapObject(
          Object.assign(toolHistoryInfoForm.getValue(), { tool_history_no }),
          (v) => v || null
        )
        const validator =
          toolHistoryInfoForm.$container.data().validator ||
          toolHistoryInfoForm.$container.validate({
            rules: {
              main_chuck: {
                positiveNumber: true,
              },
              second_chuck: {
                positiveNumber: true,
              },
              tool_ptime: {
                positiveNumber: true,
                max: 999999.99,
              },
              program_seq: {
                positiveInteger: true,
                max: 255,
              },
            },
            messages: {
              program_seq: {
                max: '製程順序不得大於{0}',
              },
              tool_ptime: {
                max: '加工秒數不得大於{0}',
              },
            },
          })
        const isValid = validator.form()
        if (!isValid) {
          return
        }

        // TODO: table不能換頁
        const toolMpHisList = toolHistoryListTable.table.data().length
          ? toolHistoryListTable.table
              .rows()
              .nodes()
              .toArray()
              .map((tr) => {
                const uselist_remark = tr.querySelector('[name=uselist_remark]')
                  .value
                const life_remark = tr.querySelector('[name=life_remark]').value
                const rowData = toolHistoryListTable.table.row(tr).data()
                return Object.assign(
                  {
                    uselist_remark,
                    life_remark,
                    tool_history_no,
                  },
                  _.pick(rowData, ['tool_id', 'tool_use_for'])
                )
              })
          : []

        servkit.ajax(
          {
            url: 'api/huangliangTool/toolhistory/updateToolMpHistory',
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({
              toolMpHistory,
              toolMpHisList,
            }),
          },
          {
            success(data) {
              const groupedData = context.groupData(data)[0]
              $toolHistoryModal.data('rowData', groupedData)
              // TODO: 填入reportTable校車人員欄位selectFilter的option
              reportTable.table
                .row($toolHistoryModal.data('tr'))
                .data(groupedData)
                .draw(false)
              $toolHistoryModal.toggleClass('edit-mode', false)
              toolHistoryInfoForm.toggleEditMode(false)
              toolHistoryListTable.drawTable(groupedData.list)
            },
          }
        )
      },
      cancelEditToolHistory() {
        const context = this
        const {
          toolHistoryInfoForm,
          toolHistoryListTable,
          $toolHistoryModal,
        } = context
        const rowData = $toolHistoryModal.data('rowData')

        $toolHistoryModal.toggleClass('edit-mode', false)
        toolHistoryInfoForm.reset()
        toolHistoryInfoForm.setValue(rowData)
        toolHistoryInfoForm.toggleEditMode(false)
        toolHistoryListTable.toggleEditMode(false)
      },
      initDetailTable() {
        const context = this
        const { $toolHistoryListTable, $toolHistoryModal } = context

        const toolUseForMap = context.preCon.toolUseFor
        const inputStr = (value = '', name, isDisabled) =>
          `<input type="text" ${
            isDisabled ? 'disabled' : ''
          } value="${value}" name="${name}" class="form-control">`
        const columns = [
          {
            name: 'tool_id',
            data: 'tool_id',
            render(data, type) {
              return data || ''
            },
          },
          {
            name: 'tool_type',
            data: 'tool_type',
            render(data, type) {
              return data || ''
            },
          },
          {
            name: 'tool_spec',
            data: 'tool_spec',
            render(data, type) {
              return data || ''
            },
          },
          {
            name: 'tsup_id',
            data: 'tsup_id',
            render(data, type, rowData) {
              if (type === 'display' || type === 'selectFilter') {
                return context.preCon.supplier[data] || data || ''
              } else {
                return data || ''
              }
            },
          },
          {
            name: 'use_qty',
            data: 'use_qty',
            render(data, type) {
              return data || ''
            },
          },
          {
            name: 'tool_use_for',
            data: 'tool_use_for',
            render(data, type, rowData) {
              if (type === 'selectFilter' || type === 'display') {
                return data ? toolUseForMap[data] || data : ''
              } else {
                return data || ''
              }
            },
          },
          {
            name: 'uselist_remark',
            data: 'uselist_remark',
            render(data, type, rowData) {
              const { isEdit } = rowData
              if (isEdit) {
                return inputStr(data, 'uselist_remark')
              } else {
                return data || ''
              }
            },
          },
          {
            name: 'life_remark',
            data: 'life_remark',
            render(data, type, rowData) {
              const { isEdit } = rowData
              if (isEdit) {
                return inputStr(data, 'life_remark')
              } else {
                return data || ''
              }
            },
          },
          {
            name: 'tool_use_no',
            data: 'tool_use_no',
            render(data, type) {
              return data || ''
            },
          },
        ]

        window.toolUseTable = context.toolHistoryListTable = createReportTable({
          $tableElement: $toolHistoryListTable,
          autoWidth: false,
          columns,
          // paging: false,
          showNoData: false,
        })
        context.toolHistoryListTable.toggleEditMode = function (isEdit) {
          const table = this.table
          if (!table.data().length) {
            return
          }
          const trArray = table.rows().nodes().toArray()
          let rowData
          let rowApi
          trArray.forEach((tr) => {
            rowApi = table.row(tr)
            rowData = rowApi.data()
            rowApi.data(Object.assign(rowData, { isEdit }))
          })
        }
      },
    },
    preCondition: {
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
              done({
                idNameMap,
                data,
              })
            },
          }
        )
      },
      toolUseFor(done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_huangliang_repair_code',
              columns: ['repair_code', 'repair_code_name', 'repair_type_id'],
            }),
          },
          {
            success(data) {
              done(
                Object.fromEntries(
                  data
                    .filter((map) => map.repair_type_id[0] !== '9')
                    .map((map) => [map.repair_code, map.repair_code_name])
                )
              )
            },
          }
        )
      },
      supplier(done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_huangliang_tool_supplier',
            }),
          },
          {
            success(data) {
              done(
                Object.fromEntries(
                  data.map((map) => [map.tsup_id, map.tsup_name])
                )
              )
            },
          }
        )
      },
    },
    dependencies: [
      ['/js/plugin/select2/select2.min.js'],
      ['/app/HuangLiangToolUse/commons/formElement.js'],
      ['/app/HuangLiangToolUse/commons/getCanCreateToolUseUserMap.js'],
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatables/jquery.dataTables.rowReordering.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
    ],
  })
}
