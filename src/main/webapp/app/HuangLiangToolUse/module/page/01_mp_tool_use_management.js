export default function () {
  GoGoAppFun({
    gogo(context) {
      window.c = context
      context.initAuth()
      context.initReportTable()
      context.initQueryConditionForm()
      context.initToolUseModal()
    },
    util: {
      $queryConditionForm: $('#query-condition-form'),
      $queryResultTable: $('#query-result-table'),
      $toolUseModal: $('#tool-use-modal'),
      $toolUseTable: $('#tool-use-table'),
      $toolHistoryTable: $('#tool-history-table'),
      $submitBtn: $('#submit-btn'),
      $toolUseTitle: $('#tool-use-title'),
      $toolUseReasonSpan: $('#tool-use-reason'),
      updateLoadingBtn: servkit.loadingButton($('#update-btn')[0]),
      userId: JSON.parse(sessionStorage.getItem('loginInfo')).user_id,
      toolStock: {},
      useReasonMap: {
        11: '量產校車',
        12: '量產維修',
      },
      mstockNameMap: ['GOLF', '五金'],
      toolStatusMap: {
        N: '新刀',
        B: '回收刀',
      },
      fixForMap: {
        0: '損壞更換',
        1: '規格更換',
      },
      userAuth: {},
      initAuth() {
        const context = this
        const loginInfo = JSON.parse(window.sessionStorage.getItem('loginInfo'))
        const userGroup = loginInfo.user_group || []
        const canExportToolUseListGroupList = [
          'sys_manager_group',
          'tool_stock',
          'factory_service_deputy_manager',
          'factory_manager',
        ]
        const canEditRegulateToolUseGroupList = [
          'sys_manager_group',
          'tool_stock',
          'factory_service_regulate',
        ]
        const canEditRepairToolUseGroupList = [
          'sys_manager_group',
          'tool_stock',
          'factory_service_regulate',
          'repair',
        ]
        const canExportToolUseList =
          userGroup.findIndex((group) =>
            canExportToolUseListGroupList.includes(group)
          ) >= 0
        const canEditRegulateToolUse =
          userGroup.findIndex((group) =>
            canEditRegulateToolUseGroupList.includes(group)
          ) >= 0
        const canEditRepairToolUse =
          userGroup.findIndex((group) =>
            canEditRepairToolUseGroupList.includes(group)
          ) >= 0
        Object.assign(context.userAuth, {
          canExportToolUseList,
          canEditRegulateToolUse,
          canEditRepairToolUse,
        })
      },
      Form() {
        return this.commons.Form()
      },
      initQueryConditionForm() {
        const context = this
        const { $queryConditionForm, $submitBtn } = context
        const Form = context.Form()

        context.queryConditionForm = new Form($queryConditionForm)
        const { elements } = context.queryConditionForm
        const canCreateToolUseUserMap = context.commons.getCanCreateToolUseUserMap(
          context.preCon.user.data,
          'mp'
        )

        servkit.initSelectWithList(
          context.mstockNameMap,
          $(elements.mstock_name.element)
        )
        servkit.initMachineSelect($(elements.machine_id.element))
        servkit.initDatePicker(
          $(elements.startDate.element),
          $(elements.endDate.element)
        )
        servkit.initSelectWithList(
          Object.assign({ '': '' }, canCreateToolUseUserMap),
          $(elements.create_by.element)
        )

        servkit.validateForm($queryConditionForm, $submitBtn)
        $submitBtn.on('click', function () {
          context.getToolMpUse()
        })
      },
      initReportTable() {
        const context = this
        const { userAuth } = context
        const columns = [
          {
            name: 'create_time',
            data: 'create_time',
            render(data, type) {
              if (type === 'selectFilter' || type === 'display') {
                return data.toFormatedDate()
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
            name: 'tool_use_no',
            data: 'tool_use_no',
            render(data) {
              return data || ''
            },
          },
          {
            name: 'use_reason',
            data: 'use_reason',
            render(data, type) {
              if (type === 'selectFilter' || type === 'display') {
                return context.useReasonMap[data] || data
              } else {
                return data || ''
              }
            },
          },
          {
            name: 'order_id',
            data: 'order_id',
            render(data) {
              return data || ''
            },
          },
          {
            name: 'product_id',
            data: 'product_id',
            render(data) {
              return data || ''
            },
          },
          {
            name: 'product_pid',
            data: 'product_pid',
            render(data) {
              return data || ''
            },
          },
          {
            name: 'tool_mp_list',
            data: null,
            render(data, type) {
              return `<button class="btn btn-primary tool-mp-list">刀具明細</button>`
            },
          },
          {
            name: 'create_by',
            data: 'create_by',
            render(data, type) {
              if (type === 'selectFilter' || type === 'display') {
                return context.preCon.user.idNameMap[data] || data
              } else {
                return data || ''
              }
            },
          },
        ]
        const canCreateToolUse =
          userAuth.canEditRegulateToolUse || userAuth.canEditRepairToolUse
        const $insertBtn = $(
          `<button class="btn btn-primary stk-insert-btn hidden-xs hidden-sm ${
            canCreateToolUse ? '' : 'hide'
          }" title="建立領刀單"><span class="fa fa-plus fa-lg"></span></button>`
        )
        const $excelBtn = $(
          `<button class="btn btn-success download-excel ${
            context.userAuth.canExportToolUseList ? '' : 'hide'
          }"><span class="fa fa-file-excel-o fa-lg"></span> Excel匯出</button>`
        )
        context.searchInfo = new window.SearchInfo({
          create_time: '領刀日期',
          sum_use_cost: '刀具使用成本',
        })

        context.reportTable = createReportTable({
          $tableElement: $('#query-result-table'),
          $tableWidget: $('#query-result-widget'),
          autoWidth: false,
          order: [[0, 'desc']],
          customBtns: [
            context.searchInfo.$container[0],
            $insertBtn[0],
            $excelBtn[0],
          ],
          columns,
        })
        const excelCols = [
          ...columns.filter(
            (map) => map.name !== 'tool_mp_list' && map.name !== 'product_pid'
          ),
        ].concat([
          {
            name: 'tool_type',
            render(data) {
              return data || ''
            },
          },
          {
            name: 'tool_spec',
            render(data) {
              return data || ''
            },
          },
          {
            name: 'tool_id',
            render(data) {
              return data || ''
            },
          },
          {
            name: 'tool_use_for',
            render(data) {
              return context.preCon.repairCode.toolUseForMap[data] || data || ''
            },
          },
          {
            name: 'use_qty',
            render(data) {
              return data || 0
            },
          },
          {
            name: 'tool_status',
            render(data) {
              return context.toolStatusMap[data] || data || ''
            },
          },
          {
            name: 'tsup_id',
            render(data) {
              return context.preCon.supplier[data] || data || ''
            },
          },
          {
            name: 'buy_time',
            render(data) {
              return data ? data.toFormatedDatetime() : ''
            },
          },
          {
            name: 'use_cost',
            render(data) {
              return data || 0
            },
          },
        ])
        $excelBtn.on('click', function (e) {
          const isTableEmpty = context.reportTable.table.rows()[0].length === 0
          if (isTableEmpty) {
            e.stopImmediatePropagation()
          }
        })
        servkit.downloadCustomizedExcel($excelBtn, function () {
          const create_time = context.searchInfo.$els.create_time.text
          const sumUseCost = context.searchInfo.$els.sum_use_cost.text
          const selectedRowData = context.reportTable.table
            .rows({ order: 'applied', search: 'applied', page: 'all' })
            .data()
            .toArray()
          const expandRowData = selectedRowData.reduce((a, rowData) => {
            const { list } = rowData
            const filteredList = list.reduce((acc, listData) => {
              const { tool_id } = listData
              const toolProfile = context.preCon.toolProfile.find(
                (d) => d.tool_id === tool_id
              )
              if (toolProfile) {
                acc.push(
                  Object.assign(
                    {
                      tool_type: toolProfile.tool_type,
                      tool_spec: toolProfile.tool_spec,
                    },
                    listData
                  )
                )
              }
              return acc
            }, [])
            if (filteredList.length) {
              a.push(
                ...filteredList.map((listData) =>
                  Object.assign({}, rowData, listData)
                )
              )
            } else {
              a.push(rowData)
            }
            return a
          }, [])
          const getRowData = (map) => {
            return Array.from(excelCols).map((col) => {
              if (col.render) {
                return col.render(map[col.name], 'display')
              } else {
                return map[col.name] || ''
              }
            })
          }
          const matrices = [
            {
              x: 0,
              y: 3,
              data: expandRowData.map((data) => getRowData(data)),
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
                'text',
                'text',
                '0',
                'text',
                'text',
                'text',
                '0.00',
              ],
            },
          ]
          matrices.unshift(
            {
              x: 1,
              y: 1,
              data: [[create_time]],
              format: ['text'],
            },
            {
              x: 6,
              y: 1,
              data: [[sumUseCost]],
              format: ['0.00'],
            }
          )
          return {
            templateName: 'toolUseRecordTemplate',
            fileName: '領刀記錄' + moment().format('YYYYMMDDHHmmssSSSS'),
            matrices,
          }
        })

        $('#query-result-table').on('click', '.tool-mp-list', function () {
          const tr = this.closest('tr')
          const rowData = context.reportTable.table.row(tr).data()
          Object.assign(context.toolUse.store, {
            rowData,
            useReason: rowData.use_reason,
          })
          context.$toolUseTitle.text('領用刀具明細')
          context.$toolUseReasonSpan.text(
            ' - ' + context.useReasonMap[rowData.use_reason]
          )
          context.toolUse
            .jump(4)
            .then(() => context.$toolUseModal.modal('show'))
        })

        $insertBtn.on('click', function () {
          context.toolUse.store.rowData = null
          context.toolUse.store.useReason = null
          context.toolUse.reset()
          context.$toolUseTitle.text('領刀單建立')
          context.$toolUseReasonSpan.text('')
          $('#tool-use-modal').modal('show')
        })
      },
      getToolMpUse() {
        const context = this
        const { searchInfo, queryConditionForm } = context
        const queryParam = _.pick(
          queryConditionForm.getValue(),
          (value) => value && value.length
        )
        const searchCondition = _.pick(
          queryParam,
          (value, key) => key !== 'startDate' && key !== 'endDate'
        )

        if (
          Object.prototype.hasOwnProperty.call(queryParam, 'startDate') &&
          Object.prototype.hasOwnProperty.call(queryParam, 'endDate')
        ) {
          searchCondition.create_time =
            queryParam.startDate + ' ~ ' + queryParam.endDate
        }

        servkit.ajax(
          {
            url: 'api/huangliangTool/toolmp/queryToolMpList',
            type: 'GET',
            data: queryParam,
          },
          {
            success(data) {
              const sumUseCost = data
                .reduce((a, x) => a + Number(x.sum_use_cost), 0)
                .toFixed(2)
              searchInfo.changeCondition(
                _.extend({ sum_use_cost: sumUseCost }, searchCondition)
              )
              context.reportTable.drawTable(data)
            },
          }
        )
      },
      initToolUseModal() {
        const context = this
        const { userAuth } = context
        const Form = context.Form()
        const useReasonMap = _.pick(context.useReasonMap, (value, key) => {
          return (
            (userAuth.canEditRegulateToolUse && key === '11') ||
            (userAuth.canEditRepairToolUse && key === '12')
          )
        })
        const editUseReasonForm = document.getElementById(
          'edit-use-reason-form'
        )

        const useReasonForm = new Form(editUseReasonForm)
        const alarmTimeEl = useReasonForm.elements.alarm_time.element
        servkit.initSelectWithList(
          context.preCon.user.idNameMap,
          $(useReasonForm.elements.create_by.element)
        )
        servkit.initSelectWithList(
          useReasonMap,
          $(useReasonForm.elements.use_reason.element)
        )
        servkit.initMachineSelect($(useReasonForm.elements.machine_id.element))
        const renderAlarmTimeSelect = () => {
          const { order_id, machine_id, use_reason } = useReasonForm.getValue()
          const isRepair = use_reason === '12'
          const m523 = order_id.slice(3, -3) + '.' + order_id.slice(-3)
          const mstock_name = order_id[0]
          if (isRepair && machine_id && order_id) {
            servkit.ajax(
              {
                url: 'api/getdata/db',
                contentType: 'application/json',
                type: 'POST',
                data: JSON.stringify({
                  table: 'a_huangliang_repair_record',
                  columns: [
                    // 'n6',
                    'alarm_time',
                  ],
                  whereClause:
                    'tool_use_no IS NULL AND machine_id = ? AND m523 = ? AND n6 LIKE ? ORDER BY alarm_time DESC',
                  whereParams: [
                    machine_id,
                    Number(m523).toString(),
                    `% ${mstock_name} %`,
                  ],
                }),
              },
              {
                success(data) {
                  const alarmTimeList = _.chain(data)
                    // .filter(map => map.n6 && map.n6.split(' ')[1] === mstock_name)
                    .pluck('alarm_time')
                    .map((time) => time.toFormatedDatetime())
                    .value()
                  servkit.initSelectWithList(alarmTimeList, $(alarmTimeEl))
                },
              }
            )
          } else {
            $(alarmTimeEl).empty()
          }
          alarmTimeEl.closest('section').classList.toggle('hide', !isRepair)
        }
        const renderAlarmTimeSelectDebounced = _.debounce(
          renderAlarmTimeSelect,
          500
        )

        const toolHistoryForm = new Form(
          document.getElementById('edit-tool-history-form')
        )
        context.useReasonForm = useReasonForm
        context.toolHistoryForm = toolHistoryForm

        const resizeModal = () => {
          const windowWidth = window.innerWidth
          let modalWidth
          switch (true) {
            case windowWidth > 1642:
              modalWidth = 1642
              break
            case windowWidth > 960:
              modalWidth = windowWidth * 0.8
              break
            default:
              modalWidth = windowWidth * 0.9
              break
          }
          context.$toolUseModal.find('.modal-dialog').width(modalWidth)
        }
        resizeModal()

        $(editUseReasonForm)
          .on('change', '[name=use_reason]', function () {
            renderAlarmTimeSelectDebounced()
          })
          .on('change', '[name=machine_id]', function () {
            renderAlarmTimeSelectDebounced()
          })
          .on('change', '[name=order_id]', function () {
            renderAlarmTimeSelectDebounced()
          })
          .on('keyup', '[name=order_id]', function () {
            renderAlarmTimeSelectDebounced()
          })
        $('#edit-tool-use-btn').on('click', function () {
          context.editToolUseList()
        })
        $('#cancel-edit-btn').on('click', function () {
          context.cancelEditToolUseList()
        })
        $('#update-btn').on('click', function () {
          context.updateToolUseList()
        })
        $(document).on('resize', function () {
          resizeModal()
        })
        servkit.downloadFile(
          $('#download-tool-use-btn'),
          '/api/huangliangTool/toolhistory/excel',
          context.getDownloadParam.bind(this)
        )
        Promise.all([
          context.initToolHistoryTable(),
          context.initToolUseTable(),
        ]).then(() => {
          // 因為要將reportTable外的wrapper綁上顯示與否的class，所以要等reportTable initialize完
          context.initToolUseModule()
        })
      },
      getDownloadParam() {
        const context = this
        const { store } = context.toolUse
        const rowData = store.rowData
        const tool_use_no = rowData
          ? rowData.tool_use_no
          : store.toolUseInfo.tool_use_no.textContent
        const tool_history_no = rowData
          ? rowData.tool_history_no
          : store.toolUseInfo.tool_history_no.textContent
        const useList = context.toolUseTable.table
          .rows()
          .data()
          .toArray()
          .map((data) => {
            return _.pick(data, [
              'tool_use_for',
              'tsup_id',
              'tool_spec',
              'uselist_remark',
              'life_remark',
              'use_qty',
            ])
          })

        return {
          data: JSON.stringify({
            tool_use_no,
            tool_history_no,
            useList,
          }),
        }
      },
      editToolUseList() {
        const context = this
        const { toolUseTable, $toolUseModal } = context
        const useReason = context.toolUse.store.useReason
        const toolMpList = context.toolUse.store.toolMpList
        const { showList, hideList } = toolMpList
        context.toolUseTable.currIndex = 0
        context.toolUseTable.drawTable(
          hideList.concat(showList).map((d) => {
            return Object.assign(
              {
                no: ++context.toolUseTable.currIndex,
                isSaved: true,
                orig_qty: d.use_qty,
              },
              d
            )
          })
        )
        // modal底下按鈕的顯示
        $toolUseModal.toggleClass('edit-mode', true)
        // table filter row 和 insert Btn的顯示
        toolUseTable.toggleEditMode(true)
        // table column的顯示
        toolUseTable.toggleViewMode('update', useReason)
      },
      updateToolUseList() {
        const context = this
        const { toolUse, toolUseTable, $toolUseModal } = context
        const useReason = toolUse.store.useReason
        const {
          tool_history_no = toolUse.store.toolUseInfo.tool_history_no
            .textContent,
          tool_use_no = toolUse.store.toolUseInfo.tool_use_no.textContent,
          order_id = toolUse.store.toolUseInfo.order_id.textContent,
          machine_id = toolUse.store.toolUseInfo.machine_id.dataset.machine_id,
          use_reason = useReason,
        } = toolUse.store.rowData || {}
        let insertList = []
        const returnList = []
        const cancelList = []
        const updateList = []

        context.updateLoadingBtn.doing()

        toolUseTable.table
          .data()
          .toArray()
          .forEach((rowData) => {
            const {
              isSaved,
              isReturn,
              isCancel,
              use_qty,
              orig_qty,
              buy_time = '',
            } = rowData
            const formatedBuytime = buy_time.toFormatedDatetime()

            if (isReturn) {
              returnList.push(
                Object.assign({}, rowData, { buy_time: formatedBuytime })
              )
            } else if (isCancel) {
              cancelList.push(
                Object.assign({}, rowData, { buy_time: formatedBuytime })
              )
            } else if (!isSaved) {
              insertList.push(rowData)
            } else if (use_qty.toString() !== orig_qty.toString()) {
              updateList.push(
                Object.assign({}, rowData, { buy_time: formatedBuytime })
              )
            }
          })
        insertList = context.getInsertToolUseList(insertList)

        servkit.ajax(
          {
            url: 'api/huangliangTool/toolmp/updateToolMpList',
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({
              tool_use_no,
              tool_history_no,
              order_id,
              machine_id,
              use_reason,
              insert: insertList,
              return: returnList,
              cancel: cancelList,
              update: updateList,
            }),
          },
          {
            success(data) {
              // console.log(data.updateFail);
              context.updateLoadingBtn.done()
              context.toolStock = {}
              $toolUseModal.toggleClass('edit-mode', false)
              toolUseTable.toggleEditMode(false)
              toolUseTable.toggleViewMode('view', useReason)
              toolUse.store.warning.reset()
              context.toolUse.store.toolMpList = {
                showList: [],
                hideList: [],
              }
              data.toolMpList.forEach((map) => {
                if (map.uselist_status === 0) {
                  context.toolUse.store.toolMpList.showList.push(map)
                } else {
                  context.toolUse.store.toolMpList.hideList.push(map)
                }
              })
              toolUseTable.currIndex = 0
              toolUseTable.drawTable(
                context.toolUse.store.toolMpList.showList.map((d) => {
                  return Object.assign(
                    {
                      no: ++toolUseTable.currIndex,
                      isSaved: true,
                      orig_qty: d.use_qty,
                    },
                    d
                  )
                })
              )
            },
          }
        )
      },
      cancelEditToolUseList() {
        const context = this
        const { toolUseTable, $toolUseModal } = context
        const useReason = context.toolUse.store.useReason

        $toolUseModal.toggleClass('edit-mode', false)
        toolUseTable.toggleEditMode(false)
        toolUseTable.toggleViewMode('view', useReason)
        context.toolUse.store.warning.reset()
        // toolUseTable.table.rows().nodes().toArray().forEach(tr => {
        //   const rowApi = toolUseTable.table.row(tr);
        //   const rowData = rowApi.data();
        //   if (rowData.isSaved && rowData.uselist_status === 0) {
        //     rowApi.data(Object.assign(rowData, {
        //       use_qty: rowData.orig_qty || rowData.use_qty,
        //       isReturn: false,
        //       isCancel: false,
        //     }))
        //   } else {
        //     rowApi.remove();
        //     toolUseTable.currIndex--;
        //   }
        // });
        // toolUseTable.table.draw(false);
        toolUseTable.currIndex = 0
        toolUseTable.drawTable(
          context.toolUse.store.toolMpList.showList.map((d) => {
            return Object.assign(
              {
                no: ++toolUseTable.currIndex,
                isSaved: true,
                orig_qty: d.use_qty,
              },
              d
            )
          })
        )
      },
      initToolUseTable() {
        const context = this
        const { $toolUseTable, userAuth } = context
        const cancelRowBtnStr = `<button class="btn btn-xs btn-danger stk-cancel-btn" title="取消編輯"><i class="fa fa-times"></i></button>`
        const removeRowBtnStr = (isDisabled) =>
          `<button class="btn btn-xs btn-danger stk-delete-btn" ${
            isDisabled ? 'disabled' : ''
          } title="刪除"><i class="fa fa-times"></i></button>`
        const saveRowBtnStr = `<button class="btn btn-xs btn-success stk-save-btn" title="儲存"><i class="fa fa-save"></i></button'disabled'>`
        const typeList = context.preCon.toolType.sort()
        const optionStr = (list, selectedValue) => {
          const isArray = _.isArray(list)
          return _.map(
            list,
            (value, key) =>
              `<option value="${isArray ? value : key}" ${
                selectedValue.toString() ===
                (isArray ? value.toString() : key.toString())
                  ? 'selected'
                  : ''
              }>${value}</option>`
          ).join('')
        }
        const selectStr = (value = '', name, optionList) =>
          `<select name="${name}" class="form-control">${optionStr(
            optionList,
            value
          )}</select>`
        const toolUseForMap = context.preCon.repairCode.toolUseForMap
        const columns = [
          {
            name: 'edit',
            data: null,
            width: '4%',
            render(data, type, rowData) {
              const { isEdit, uselist_status, isSaved } = rowData
              const isDisabled = isSaved && uselist_status !== 0
              if (isEdit) {
                return saveRowBtnStr
              } else {
                return editBtnStr(isDisabled)
              }
            },
          },
          {
            name: 'no',
            data: 'no',
            width: '4%',
            render(data, type, rowData) {
              return data || ''
            },
          },
          {
            name: 'fix_for',
            data: 'fix_for',
            width: '6%',
            render(data, type, rowData) {
              if (type === 'selectFilter' || type === 'display') {
                return data !== undefined ? context.fixForMap[data] : ''
              } else {
                return data !== undefined ? data : ''
              }
            },
          },
          {
            name: 'fix_no',
            data: 'fix_no',
            width: '10%',
            render(data, type, rowData) {
              const { isEdit, isSaved } = rowData

              if (isEdit && !isSaved) {
                return selectStr(
                  data,
                  'fix_no',
                  context.preCon.repairCode.repairCodeMap
                )
              } else if (type === 'selectFilter' || type === 'display') {
                return (
                  context.preCon.repairCode.repairCodeMap[data] || data || ''
                )
              } else {
                return data || ''
              }
            },
          },
          {
            name: 'tool_type',
            data: 'tool_type',
            width: '10%',
            render(data, type, rowData) {
              const { isEdit, isSaved } = rowData

              if (isEdit && !isSaved) {
                return selectStr(data, 'tool_type', typeList)
              } else {
                return data || ''
              }
            },
          },
          {
            name: 'tool_spec',
            data: 'tool_spec',
            width: '10%',
            render(data, type, rowData) {
              const { isEdit, isSaved } = rowData

              if (isEdit && !isSaved) {
                return selectStr(
                  data,
                  'tool_spec',
                  getToolSpecOption(rowData.tool_type || typeList[0])
                )
              } else {
                return data || ''
              }
            },
          },
          {
            name: 'tool_id',
            data: 'tool_id',
            width: '4%',
            render(data, type, rowData) {
              if (data) {
                return data
              } else {
                const tool_type = rowData.tool_type || typeList[0]
                const tool_spec = getToolSpecOption(tool_type)[0]
                return getToolId(tool_type, tool_spec)
              }
            },
          },
          {
            name: 'tool_use_for',
            data: 'tool_use_for',
            width: '10%',
            render(data, type, rowData) {
              const { isEdit, isSaved } = rowData

              if (isEdit && !isSaved) {
                return selectStr(data, 'tool_use_for', toolUseForMap)
              } else if (type === 'display' || type === 'selectFilter') {
                return (
                  context.preCon.repairCode.toolUseForMap[data] || data || ''
                )
              } else {
                return data || ''
              }
            },
          },
          {
            name: 'use_qty',
            data: 'use_qty',
            width: '6%',
            render(data, type, rowData) {
              const { isEdit, isReturn, isCancel, isSaved } = rowData
              const useReason = context.toolUse.store.useReason
                ? context.toolUse.store.useReason.toString()
                : null
              const isDisabled = isReturn || isCancel

              if (
                isEdit &&
                (useReason === '11' || (useReason === '12' && !isSaved))
              ) {
                return inputStr(data, 'use_qty', isDisabled)
              } else {
                return data || ''
              }
            },
          },
          {
            name: 'tool_status',
            data: 'tool_status',
            width: '8%',
            render(data, type, rowData) {
              const { isEdit, isSaved } = rowData

              if (isEdit && !isSaved) {
                return toolStatusStr(data)
              } else if (type === 'display' || type === 'selectFilter') {
                return context.toolStatusMap[data] || data || ''
              } else {
                return data || ''
              }
            },
          },
          {
            name: 'tsup_id',
            data: 'tsup_id',
            width: '8%',
            render(data, type, rowData) {
              if (type === 'display' || type === 'selectFilter') {
                return context.preCon.supplier[data] || data || ''
              } else {
                return data || ''
              }
            },
          },
          {
            name: 'buy_time',
            data: 'buy_time',
            width: '8%',
            render(data, type, rowData) {
              return data ? data.toFormatedDatetime() : ''
            },
          },
          {
            name: 'tool_location',
            data: 'tool_location',
            width: '4%',
            render(data, type, rowData) {
              return data || ''
            },
          },
          {
            name: 'tool_stock',
            data: 'tool_stock',
            width: '4%',
            render(data, type, rowData) {
              return data === undefined ? '' : data
            },
          },
          {
            name: 'life_remark',
            data: 'life_remark',
            width: '10%',
            render(data, type, rowData) {
              const { isEdit, isSaved } = rowData
              if (isEdit && !isSaved) {
                return inputStr(data, 'life_remark')
              } else {
                return data || ''
              }
            },
          },
          {
            name: 'uselist_remark',
            data: 'uselist_remark',
            width: '10%',
            render(data, type, rowData) {
              const { isEdit, isSaved } = rowData

              if (isEdit && !isSaved) {
                return inputStr(data, 'uselist_remark')
              } else {
                return data || ''
              }
            },
          },
          {
            name: 'cancel',
            data: null,
            width: '6%',
            render(data, type, rowData) {
              const { isEdit, isSaved, isCancel, uselist_status } = rowData

              if (isEdit && isSaved) {
                return cancelListBtnStr(isCancel)
              } else {
                return isCancel || uselist_status === 1 ? '變更' : ''
              }
            },
          },
          {
            name: 'return',
            data: null,
            width: '6%',
            render(data, type, rowData) {
              const { isEdit, isSaved, isReturn, uselist_status } = rowData

              if (isEdit && isSaved) {
                return returnRowBtnStr(isReturn)
              } else {
                return isReturn || uselist_status === 99 ? '歸還' : ''
              }
            },
          },
          {
            name: 'remove',
            data: null,
            width: '4%',
            render(data, type, rowData) {
              const { isEdit, isSaved } = rowData
              const isDisabled = isSaved
              if (isEdit) {
                return cancelRowBtnStr
              } else {
                return removeRowBtnStr(isDisabled)
              }
            },
          },
        ]
        const columnNameIndexMap = Object.fromEntries(
          columns.map((col, i) => [col.name, i])
        )
        const getColumnIndex = (colArr) =>
          colArr.map((name) => columnNameIndexMap[name]).sort()
        const $insertBtn = $(
          `<button class="btn btn-primary stk-insert-btn" title="新增"><span class="fa fa-plus fa-lg"></span></button>`
        )
        const inputStr = (value = '', name, isDisabled) =>
          `<input type="text" ${
            isDisabled ? 'disabled' : ''
          } value="${value}" name="${name}" class="form-control">`
        const getToolSpecOption = (tool_type) => {
          return context.preCon.toolProfile.reduce((a, x) => {
            if (x.tool_type === tool_type) {
              a.push(x.tool_spec)
            }
            return a
          }, [])
        }
        const getToolId = (tool_type, tool_spec) => {
          const matchedTool = context.preCon.toolProfile.find(
            (map) => map.tool_type === tool_type && map.tool_spec === tool_spec
          )
          if (matchedTool) {
            return matchedTool.tool_id
          } else {
            return ''
          }
        }
        const getToolStock = (tool_id, tr) => {
          return new Promise((res) => {
            servkit.ajax(
              {
                url: 'api/huangliangTool/toolmp/getToolStock',
                type: 'GET',
                data: {
                  tool_id,
                },
              },
              {
                success(data) {
                  res(data)
                },
              }
            )
          }).then((data) => {
            data.N.stockList.sort((a, b) =>
              a.buy_time
                .toFormatedDatetime()
                .localeCompare(b.buy_time.toFormatedDatetime())
            )
            data.B.stockList.sort((a, b) =>
              a.buy_time
                .toFormatedDatetime()
                .localeCompare(b.buy_time.toFormatedDatetime())
            )
            context.toolStock[tool_id] = data
            $(tr).data({
              toolStock: data,
            })
          })
        }

        // smartAdmin的radio button在點了之後會將Table的scrollLeft歸零(回到沒有滾動的狀態)，找不出原因，所以改用原生的
        const toolStatusStr = (value) => `<label class="radio">
          <input type="radio" name="tool_status" value="N" ${
            value === 'N' ? 'checked' : ''
          }>
          新刀
        </label>
        <label class="radio">
          <input type="radio" name="tool_status" value="B" ${
            value === 'B' ? 'checked' : ''
          }>
          回收刀
        </label>`

        // const toolStatusStr = (value) => `<div class="smart-form tool-status-form">
        //   <label class="radio">
        //     <input type="radio" name="tool_status" value="N" ${value === 'N' ? 'checked' : ''} style="position: absolute;">
        //     <i></i>新刀
        //   </label>
        //   <label class="radio">
        //     <input type="radio" name="tool_status" value="B" ${value === 'B' ? 'checked' : ''} style="position: absolute;">
        //     <i></i>回收刀
        //   </label>
        // </div>`;
        const editBtnStr = (isDisabled) =>
          `<button ${
            isDisabled ? 'disabled' : ''
          } class="btn btn-xs btn-primary stk-edit-btn" title="Edit"><i class="fa fa-pencil"></i></button>`
        const returnRowBtnStr = (isActive) =>
          `<button class="btn btn-primary return-list-btn ${
            isActive ? 'active' : ''
          }" title="歸還">歸還</button>`
        const cancelListBtnStr = (isActive) =>
          `<button class="btn btn-primary cancel-list-btn ${
            isActive ? 'active' : ''
          }" title="取消刀具履歷">取消刀具履歷</button>`
        // 比較兩筆資料(Object)的特定屬性值是否相同，全部相同返回true，任一不同返回false
        const compare = (objA, objB, keyArr) =>
          keyArr.every((key) => objA[key] === objB[key])
        const useQtyValidateConfig = {
          validate() {
            const tr = this.element.closest('tr')
            const isReturnOrCancel = tr.querySelector('button.active') !== null
            const form = $(tr).data('form')
            const value = this.getValue()
            const table = context.toolUseTable.table
            const isPositiveInteger = () => /^[1-9]\d*$/.test(value)
            const isGreaterThanStock = () => {
              const isUpdateMode =
                !!context.toolUse.store.rowData ||
                context.toolUse.currStep === 4
              const rowApi = table.row(tr)
              const rowIndex = rowApi.index()
              const rowData = rowApi.data()
              const isSaved = !!rowData.isSaved
              // 新增明細時有些資訊還沒存入dataTable，只會存在畫面上，故在此一一列出
              const currRowData = {
                tool_id: table.cell(tr, 'tool_id:name').node().textContent,
                tool_use_for: form.elements.tool_use_for
                  ? form.elements.tool_use_for.getValue()
                  : rowData.tool_use_for,
                tool_status: form.elements.tool_status
                  ? form.elements.tool_status.getValue()
                  : rowData.tool_status,
                tool_stock: Number(
                  table.cell(tr, 'tool_stock:name').node().textContent
                ),
                buy_time: rowData.buy_time,
                tool_location:
                  rowData.tool_location ||
                  table.cell(tr, 'tool_location:name').node().textContent,
                tsup_id: rowData.tsup_id,
              }
              const rowCount = table.data().length
              const otherRowDatas = table
                .rows(
                  Array.from(new Array(rowCount), (v, i) => i).filter(
                    (v) => v !== rowIndex
                  )
                )
                .data()
                .toArray()

              /**
               * 因為更新明細和新增明細所顯示的庫存數意義不同所以計算比較複雜
               * 更新明細的庫存數：單筆庫存數('tool_id', 'buy_time', 'tool_location', 'tsup_id')
               * 新增明細的庫存數：合併庫存數('tool_id', 'tool_status', 'tool_location')
               * 新增明細時使用合併庫存數的原因是需要依先進先出的順序領刀，由前端規劃(util.getInsertToolUseList)
               */
              if (isUpdateMode && isSaved) {
                // 更新領刀單模式下更新明細
                // 新增明細的rowData
                const unsavedSameStockRowDatas = otherRowDatas.find(
                  (d) =>
                    compare(d, currRowData, [
                      'tool_id',
                      'tool_status',
                      'tool_location',
                    ]) && !d.isSaved
                )
                const tool_stock = unsavedSameStockRowDatas
                  ? unsavedSameStockRowDatas.tool_stock
                  : currRowData.tool_stock
                const useQtyDiff =
                  Number(value) - (rowData.orig_qty || rowData.use_qty)
                // 其他明細的總和領用數差值
                const otherRowUseQtyDiff = otherRowDatas.reduce(
                  (a, rowData) => {
                    // 有新增明細要計算合併庫存數，反之為單筆庫存數
                    if (
                      !unsavedSameStockRowDatas &&
                      compare(rowData, currRowData, [
                        'tool_id',
                        'buy_time',
                        'tool_location',
                        'tsup_id',
                      ])
                    ) {
                      return (
                        a +
                        Number(rowData.use_qty) -
                        Number(rowData.orig_qty || rowData.use_qty)
                      )
                    } else if (
                      unsavedSameStockRowDatas &&
                      compare(rowData, currRowData, [
                        'tool_id',
                        'tool_status',
                        'tool_location',
                      ])
                    ) {
                      // 新明細算領用數，舊明細算差值
                      return (
                        a +
                        Number(rowData.use_qty) -
                        (rowData.isSaved
                          ? Number(rowData.orig_qty || rowData.use_qty)
                          : 0)
                      )
                    }
                    return a
                  },
                  0
                )
                // 檢查 目前領用數是否超過單筆庫存數 和 總和領用數(包含差值)是否超過 合併庫存數(如果其他列有新增的明細) / 單筆庫存數
                return (
                  currRowData.tool_stock < useQtyDiff ||
                  tool_stock < useQtyDiff + otherRowUseQtyDiff
                )
              } else if (isUpdateMode && !isSaved) {
                // 更新領刀單模式下新增明細
                const otherRowUseQtyDiff = otherRowDatas.reduce(
                  (a, rowData) => {
                    // 同刀具編碼、堪用程度、儲位的刀具領用數要加總(同庫存)
                    if (
                      compare(rowData, currRowData, [
                        'tool_id',
                        'tool_status',
                        'tool_location',
                      ])
                    ) {
                      // 新明細算領用數，舊明細算差值(如果有修改的話)
                      return (
                        a +
                        Number(rowData.use_qty) -
                        (rowData.isSaved
                          ? Number(rowData.orig_qty || rowData.use_qty)
                          : 0)
                      )
                    }
                    return a
                  },
                  0
                )
                return (
                  currRowData.tool_stock < Number(value) + otherRowUseQtyDiff
                )
              } else {
                // 建立領刀單模式
                const otherRowUseQty = otherRowDatas.reduce((a, rowData) => {
                  // 同刀具編碼、同刀具堪用程度的刀具領用數要加總
                  if (
                    rowData.tool_id === currRowData.tool_id &&
                    rowData.tool_use_for !== currRowData.tool_use_for &&
                    rowData.tool_status === currRowData.tool_status
                  ) {
                    return a + Number(rowData.use_qty)
                  }
                  return a
                }, 0)
                return currRowData.tool_stock < Number(value) + otherRowUseQty
              }
            }

            if (isReturnOrCancel) {
              return
            } else if (!value) {
              return '此欄必填'
            } else if (!isPositiveInteger()) {
              return '請填正整數'
            } else if (isGreaterThanStock()) {
              return '領用數不可大於庫存數'
            }
          },
        }
        const toolStatusValidateConfig = {
          validate() {
            const value = this.getValue()
            if (!value) {
              return '此欄必填'
            }
          },
          errorPlacement(label) {
            this.elements.N.closest('td').appendChild(label)
          },
        }
        const toolUseForValidateConfig = {
          validate() {
            const tr = this.element.closest('tr')
            const toolIdTd = context.toolUseTable.table
              .cell(tr, 'tool_id:name')
              .node()
            const tool_id = toolIdTd.textContent
            const tool_use_for = this.getValue()
            const rowIndex = context.toolUseTable.table.row(tr).index()
            const rowNumber = context.toolUseTable.table.rows()[0].length
            const otherRowIndex = Array.from(
              new Array(rowNumber),
              (v, i) => i
            ).filter((i) => i !== rowIndex)
            const existValueArray = context.toolUseTable.table
              .rows(otherRowIndex)
              .data()
              .toArray()
            const isExist =
              existValueArray.findIndex((rowData, index) => {
                return (
                  tool_id === rowData.tool_id &&
                  tool_use_for === rowData.tool_use_for
                )
              }) >= 0

            if (isExist) {
              return '同樣的刀具編號和領刀種類已經存在'
            }
          },
          // errorPlacement (label) {
          //   this.element.closest('td').nextElementSibling.appendChild(label);
          // }
        }
        const toolSpecValidateConfig = {
          validate() {
            if (!this.getValue()) {
              return '此欄必填'
            }
          },
        }
        const validate = (tr) => {
          let form = $(tr).data('form')
          if (!form) {
            form = new (context.Form())(tr)
            $(tr).data('form', form)
          }
          const isUpdateMode = !!context.toolUse.store.rowData
          const isSaved = !!context.toolUseTable.table.row(tr).data().isSaved
          const useReason = context.toolUse.store.useReason
          let validateConfig = {}
          if (!isSaved) {
            Object.assign(validateConfig, {
              use_qty: useQtyValidateConfig,
              tool_status: toolStatusValidateConfig,
              tool_use_for: toolUseForValidateConfig,
              tool_spec: toolSpecValidateConfig,
            })
          } else if (useReason.toString() === '11') {
            Object.assign(validateConfig, {
              use_qty: useQtyValidateConfig,
            })
          }
          return form.validate(validateConfig)
        }

        $toolUseTable
          .on('click', '.stk-cancel-btn', function () {
            const tr = this.closest('tr')
            const rowApi = context.toolUseTable.table.row(tr)
            const rowData = rowApi.data()
            const isTemp = rowData.isTemp
            if (isTemp) {
              rowApi.remove().draw(false)
              context.toolUseTable.currIndex--
            } else {
              rowApi
                .data(
                  _.extend(rowData, {
                    isEdit: false,
                  })
                )
                .draw(false)
            }

            const rowIndex = rowData.historyTableRowIndex
            const historyTableRowApi = context.toolHistoryTable.table.row(
              rowIndex
            )
            if (rowData.isAddFromHistory) {
              historyTableRowApi.data(
                Object.assign(historyTableRowApi.data(), {
                  isAssign: false,
                })
              )
            }
            if (rowData.isReuse) {
              historyTableRowApi.data(
                Object.assign(historyTableRowApi.data(), {
                  isReuse: false,
                })
              )
            }
            context.toolUseTable.toggleEditRow(false, isTemp ? null : tr)
            $(tr).data('form', null)
          })
          .on('click', '.stk-delete-btn', function () {
            const tr = this.closest('tr')
            const rowApi = context.toolUseTable.table.row(tr)
            const rowIndex = rowApi.index()
            const rowData = rowApi.data()
            const deleteRowNo = rowData.no
            const rowCount = context.toolUseTable.table.data().length
            for (let i = rowCount - 1; i > rowIndex; i--) {
              const currRowApi = context.toolUseTable.table.row(i)
              const currRowData = currRowApi.data()
              currRowApi.data(
                Object.assign(currRowData, { no: currRowData.no - 1 })
              )
            }
            rowApi.remove().draw(false)
            context.toolUseTable.currIndex--
            context.toolUse.store.warning.remove(deleteRowNo, true)
            const historyTableRowIndex = rowData.historyTableRowIndex
            const historyTableRowApi = context.toolHistoryTable.table.row(
              historyTableRowIndex
            )
            if (rowData.isAddFromHistory) {
              historyTableRowApi.data(
                Object.assign(historyTableRowApi.data(), {
                  isAssign: false,
                })
              )
            }
            if (rowData.isReuse) {
              historyTableRowApi.data(
                Object.assign(historyTableRowApi.data(), {
                  isReuse: false,
                })
              )
            }
          })
          .on('click', '.stk-edit-btn', function () {
            const tr = this.closest('tr')
            const rowApi = context.toolUseTable.table.row(tr)
            const rowData = rowApi.data()
            rowApi.data(_.extend(rowData, { isEdit: true })).draw(false)
            context.toolUseTable.toggleEditRow(true)
          })
          .on('click', '.stk-save-btn', function () {
            const tr = this.closest('tr')
            if (!validate(tr)) {
              return
            }
            // const tdArray = Array.from(tr.children);
            const rowApi = context.toolUseTable.table.row(tr)
            const rowData = rowApi.data()
            const { isSaved } = rowData
            const useReason = context.toolUse.store.useReason
            const activeBtn = tr.querySelector('.active')
            const isReturn = activeBtn
              ? activeBtn.classList.contains('return-list-btn')
              : false
            const isCancel = activeBtn
              ? activeBtn.classList.contains('cancel-list-btn')
              : false
            // TODO: 查刀具履歷表中同刀具編號、領刀種類的紀錄，將其disabled
            if (isSaved) {
              // 更新明細
              const use_qty =
                useReason.toString() === '11'
                  ? Number(
                      context.toolUseTable.table
                        .cell(tr, 'use_qty:name')
                        .node()
                        .querySelector('input').value
                    )
                  : rowData.use_qty

              rowApi
                .data(
                  _.extend(rowData, {
                    isTemp: false,
                    isEdit: false,
                    use_qty,
                    isReturn,
                    isCancel,
                  })
                )
                .draw(false)
              context.toolUseTable.toggleEditRow(false, tr)
              $(tr).data('form', null)
            } else {
              // 新建明細
              // console.log('save rowData: ', tr, rowApi.data());
              const tool_type = context.toolUseTable.table
                .cell(tr, 'tool_type:name')
                .node()
                .querySelector('select').value
              const tool_spec = context.toolUseTable.table
                .cell(tr, 'tool_spec:name')
                .node()
                .querySelector('select').value
              const tool_id = context.toolUseTable.table
                .cell(tr, 'tool_id:name')
                .node().textContent
              const tool_use_for = context.toolUseTable.table
                .cell(tr, 'tool_use_for:name')
                .node()
                .querySelector('select').value
              const use_qty = Number(
                context.toolUseTable.table
                  .cell(tr, 'use_qty:name')
                  .node()
                  .querySelector('input').value
              )
              const tool_status = context.toolUseTable.table
                .cell(tr, 'tool_status:name')
                .node()
                .querySelector(':checked').value
              const tool_location = context.toolUseTable.table
                .cell(tr, 'tool_location:name')
                .node().textContent
              const tool_stock = Number(
                context.toolUseTable.table.cell(tr, 'tool_stock:name').node()
                  .textContent
              )
              const uselist_remark = context.toolUseTable.table
                .cell(tr, 'uselist_remark:name')
                .node()
                .querySelector('input').value
              const life_remark = context.toolUseTable.table
                .cell(tr, 'life_remark:name')
                .node()
                .querySelector('input').value
              const fix_no = context.toolUseTable.table
                .cell(tr, 'fix_no:name')
                .node()
                .querySelector('select').value
              const product_id = $('#tool-use-info')
                .find('[data-column=product_id]')
                .text()
              new Promise((res) => {
                servkit.ajax(
                  {
                    url: 'api/huangliangTool/toolmp/getToolHisIsExist',
                    type: 'GET',
                    data: {
                      product_id,
                      tool_id,
                    },
                  },
                  {
                    success(data) {
                      res(data)
                    },
                  }
                )
              }).then((isExist) => {
                if (isExist === 'N') {
                  context.toolUse.store.warning.render(rowData.no)
                } else {
                  context.toolUse.store.warning.remove(rowData.no)
                }
                const extendData = {
                  isTemp: false,
                  isEdit: false,
                  tool_type,
                  tool_spec,
                  tool_id,
                  tool_use_for,
                  use_qty,
                  tool_status,
                  tool_location,
                  tool_stock,
                  uselist_remark,
                  life_remark,
                }
                if (useReason.toString() === '12') {
                  extendData.fix_no = fix_no
                }
                rowApi.data(_.extend(rowData, extendData)).draw(false)
                context.toolUseTable.toggleEditRow(false, tr)
                $(tr).data('form', null)
              })
            }
          })
          .on('click', '.return-list-btn', function () {
            const tr = this.closest('tr')
            const rowApi = context.toolUseTable.table.row(tr)
            const rowData = rowApi.data()
            const useReason = context.toolUse.store.useReason.toString()
            let isReturn = this.classList.contains('active')
            this.classList.toggle('active', !isReturn)
            if (!isReturn) {
              context.toolUseTable.table
                .cell(tr, 'cancel:name')
                .node()
                .querySelector('button')
                .classList.toggle('active', false)
            }
            if (useReason === '11') {
              const useQtyInput = context.toolUseTable.table
                .cell(tr, 'use_qty:name')
                .node()
                .querySelector('input')
              useQtyInput.disabled = !isReturn
              useQtyInput.value = rowData.orig_qty
            }
          })
          .on('click', '.cancel-list-btn', function () {
            const tr = this.closest('tr')
            const rowApi = context.toolUseTable.table.row(tr)
            const rowData = rowApi.data()
            const useReason = context.toolUse.store.useReason.toString()
            const isCancel = this.classList.contains('active')
            this.classList.toggle('active', !isCancel)
            if (!isCancel) {
              context.toolUseTable.table
                .cell(tr, 'return:name')
                .node()
                .querySelector('button')
                .classList.toggle('active', false)
            }
            if (useReason === '11') {
              const useQtyInput = context.toolUseTable.table
                .cell(tr, 'use_qty:name')
                .node()
                .querySelector('input')
              useQtyInput.disabled = !isCancel
              useQtyInput.value = rowData.orig_qty
            }
          })
          .on('change', '[name=tool_type]', function () {
            const tr = this.closest('tr')
            const toolSpecEl = tr.querySelector('[name=tool_spec]')
            const $toolSpecEl = $(toolSpecEl)
            servkit.initSelectWithList(
              getToolSpecOption(this.value),
              $toolSpecEl
            )
            $toolSpecEl.select2('val', null)
            $toolSpecEl.change()
          })
          .on('change', '[name=tool_spec]', function () {
            const tr = this.closest('tr')
            const toolIdEl = context.toolUseTable.table
              .cell(tr, 'tool_id:name')
              .node()
            const toolTypeEl = context.toolUseTable.table
              .cell(tr, 'tool_type:name')
              .node()
              .querySelector('select')
            const tool_type = toolTypeEl.value
            const tool_spec = this.value
            const toolLocationEl = context.toolUseTable.table
              .cell(tr, 'tool_location:name')
              .node()
            const toolStockEl = context.toolUseTable.table
              .cell(tr, 'tool_stock:name')
              .node()
            if (tool_type && tool_spec) {
              const tool_id = getToolId(tool_type, tool_spec)
              toolIdEl.textContent = tool_id
              getToolStock(tool_id, tr).then(() => {
                const checkedToolStatusEl = tr.querySelector(
                  '[name=tool_status]:checked'
                )
                const tool_status = checkedToolStatusEl
                  ? checkedToolStatusEl.value
                  : ''
                const toolStock = context.toolStock[tool_id]
                  ? context.toolStock[tool_id][tool_status]
                  : null
                const {
                  tool_location = '',
                  sum_tool_stock: tool_stock = '',
                  stockList = [],
                } = toolStock || {}

                toolLocationEl.textContent = stockList.length
                  ? stockList[0].tool_location
                  : tool_location
                toolStockEl.textContent = tool_stock
              })
            } else {
              toolLocationEl.textContent = ''
              toolStockEl.textContent = ''
            }
          })
          .on('change', '[name=tool_status]', function () {
            const tr = this.closest('tr')
            const tool_status = this.value
            const tool_id = context.toolUseTable.table
              .cell(tr, 'tool_id:name')
              .node().textContent
            getToolStock(tool_id, tr).then(() => {
              const toolStock = context.toolStock[tool_id]
                ? context.toolStock[tool_id][tool_status]
                : null
              const {
                tool_location = '',
                sum_tool_stock: tool_stock = '',
                stockList = [],
              } = toolStock || {}
              const toolLocationEl = context.toolUseTable.table
                .cell(tr, 'tool_location:name')
                .node()
              const toolStockEl = context.toolUseTable.table
                .cell(tr, 'tool_stock:name')
                .node()
              toolLocationEl.textContent = stockList.length
                ? stockList[0].tool_location
                : tool_location
              toolStockEl.textContent = tool_stock
            })
          })

        $insertBtn.on('click', function () {
          const useReason = context.toolUse.store.useReason
          const rowData = {
            isTemp: true,
            isEdit: true,
            no: ++context.toolUseTable.currIndex,
          }
          if (useReason.toString() === '12') {
            rowData.fix_for = 1
          }

          // context.toolUse.store.warning.reset();
          context.toolUseTable.table.rows.add([rowData]).draw(false)
          context.toolUseTable.toggleEditRow(true)
        })

        return new Promise((res) => {
          window.tut = context.toolUseTable = createReportTable({
            $tableElement: $toolUseTable,
            // responsive: true,
            // scrollX: true,
            // autoWidth: true,
            pageLength: 50, // 換頁要考慮的條件比較多，所以選擇一次顯示全部，上限50筆，新增51筆會有問題
            customBtns: [$insertBtn[0]],
            columns,
            rowReorder: {
              option: {
                iIndexColumn: 1,
              },
            },
            onRow(tr, rowData) {
              // console.log(tr, rowData)
              const select = tr.querySelector('select[name=tool_spec]')
              if (!$(select).data('select2')) {
                $(select).removeClass('form-control').select2({
                  minimumInputLength: 0,
                  width: '100%',
                })
              }
            },
            // onInit () {},
          })
          $toolUseTable.parent().addClass('step step-3 step-4 hide')
          $toolUseTable.wrap('<div class="table-overflow-viewport"></div>')
          context.toolUseTable.toggleFilter = (() => {
            const $tr = $toolUseTable.find('thead tr:first')
            return (isShow) => $tr.toggleClass('hide', !isShow)
          })()
          context.toolUseTable.toggleInsertBtn = (() => {
            const $btn = $toolUseTable
              .closest('.dataTables_wrapper')
              .find('.stk-insert-btn')
            return (isShow) => $btn.toggleClass('hide', !isShow)
          })()
          context.toolUseTable.toggleEditMode = function (isEdit) {
            this.toggleFilter(!isEdit)
            this.toggleInsertBtn(isEdit)
            $('tbody', this.$tableElement).sortable(
              isEdit ? 'disable' : 'enable'
            )
          }
          context.toolUseTable.toggleEditRow = function (isEdit, tr) {
            // disable other button, filter.
            $insertBtn.prop('disabled', isEdit)
            context.toolUse.$el.nextBtn.prop('disabled', isEdit)
            $('#update-btn').prop('disabled', isEdit)
            $('#cancel-edit-btn').prop('disabled', isEdit)
            context.$toolHistoryTable
              .find('thead tr:first')
              .children()
              .children()
              .prop('disabled', isEdit)
            const otherTr = tr ? $(tr).siblings() : null
            const target = tr ? otherTr : context.$toolUseTable

            target
              .find('.stk-edit-btn:visible, .stk-delete-btn:visible')
              .each((i, el) => {
                if (isEdit) {
                  if (el.disabled) {
                    el.dataset.orig_disabled = true
                  } else {
                    el.disabled = true
                  }
                } else if (el.dataset.orig_disabled === undefined) {
                  el.disabled = false
                }
              })
            context.$toolHistoryTable.find('tbody button').each((i, el) => {
              if (isEdit) {
                if (el.disabled) {
                  el.dataset.orig_disabled = true
                } else {
                  el.disabled = true
                }
              } else {
                if (el.dataset.orig_disabled === undefined) {
                  el.disabled = false
                }
              }
            })
            context.$toolHistoryTable
              .parent()
              .find('.dt-toolbar-footer')
              .toggleClass('hide', isEdit)
          }
          context.toolUseTable.toggleViewMode = function (mode, useReason) {
            /* 
              1. save show / hide column name in specific mode
              2. mapping column name to index
              3. dataTable.visible.draw
            */
            const isRepair = useReason.toString() === '12'
            let visibleCols = isRepair ? ['fix_for', 'fix_no'] : []
            let hideCols = isRepair ? [] : ['fix_for', 'fix_no']
            switch (mode) {
              case 'view':
                visibleCols.push('tsup_id', 'buy_time')
                hideCols.push(
                  'edit',
                  'tool_stock',
                  'life_remark',
                  'uselist_remark',
                  'return',
                  'cancel',
                  'remove'
                )
                break
              case 'insert':
                visibleCols.push(
                  'edit',
                  'tool_stock',
                  'life_remark',
                  'uselist_remark',
                  'remove'
                )
                hideCols.push('tsup_id', 'buy_time', 'return', 'cancel')
                break
              case 'update':
                visibleCols.push(
                  'return',
                  'cancel',
                  'edit',
                  'tsup_id',
                  'buy_time',
                  'remove',
                  'tool_stock'
                )
                hideCols.push('life_remark', 'uselist_remark')
                break
            }
            visibleCols = getColumnIndex(visibleCols)
            hideCols = getColumnIndex(hideCols)
            this.table
              .columns(visibleCols)
              .visible(true)
              .columns(hideCols)
              .visible(false)
              .draw(false)
          }
          const $changableColumn = $('.changable-column')
          context.toolUseTable.changeColumnName = function (useReason = 11) {
            $changableColumn.text(
              useReason.toString() === '11' ? '新刀歸還儲位' : '刀具耗用更換'
            )
          }
          context.toolUseTable.currIndex = 0
          // 隱藏選擇每頁筆數和跳頁的元件
          $toolUseTable
            .closest('.dataTables_wrapper')
            .find('.dt-toolbar-footer')
            .find('.dataTables_length, .dataTables_paginate')
            .addClass('hide')
          res()
        })
      },
      initToolHistoryTable() {
        const context = this
        const { $toolHistoryTable } = context
        const columns = [
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
            name: 'program_name',
            data: 'program_name',
            render(data, type, rowData) {
              return data || ''
            },
          },
          {
            name: 'tool_type',
            data: 'tool_type',
            render(data, type, rowData) {
              return data || ''
            },
          },
          {
            name: 'tool_spec',
            data: 'tool_spec',
            render(data, type, rowData) {
              return data || ''
            },
          },
          {
            name: 'tool_id',
            data: 'tool_id',
            render(data, type, rowData) {
              return data || ''
            },
          },
          {
            name: 'tool_use_for',
            data: 'tool_use_for',
            render(data, type, rowData) {
              if (type === 'display' || type === 'selectFilter') {
                return (
                  context.preCon.repairCode.toolUseForMap[data] || data || ''
                )
              } else {
                return data || ''
              }
            },
          },
          {
            name: 'use_qty',
            data: 'use_qty',
            render(data, type, rowData) {
              return data === undefined ? '' : data
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
            name: 'life_remark',
            data: 'life_remark',
            render(data, type, rowData) {
              return data || ''
            },
          },
          {
            name: 'uselist_remark',
            data: 'uselist_remark',
            render(data, type, rowData) {
              return data || ''
            },
          },
          {
            name: 'add',
            data: null,
            render(data, type, rowData) {
              const { isAssign } = rowData
              return `<button class="btn btn-primary add-use-list-btn" title="新增" ${
                isAssign ? 'disabled' : ''
              }><span class="fa fa-plus fa-lg"></span></button>`
            },
          },
          {
            name: 'cancel',
            data: 'isCancel',
            render(data) {
              return `<button class="btn btn-primary cancel-list-btn ${
                data ? 'active' : ''
              }" title="取消刀具履歷">取消刀具履歷</button>`
            },
          },
          {
            name: 'reuse',
            data: 'isReuse',
            render(data) {
              return `<button class="btn btn-primary reuse-list-btn ${
                data ? 'active' : ''
              }" title="耗用更換">耗用更換</button>`
            },
          },
        ]
        $toolHistoryTable
          .on('click', '.add-use-list-btn', function () {
            const tr = this.closest('tr')
            const rowApi = context.toolHistoryTable.table.row(tr)
            const rowData = rowApi.data()
            rowApi
              .data(
                Object.assign(rowData, {
                  isAssign: true,
                })
              )
              .draw(false)
            const no = ++context.toolUseTable.currIndex
            context.toolUseTable.table.rows
              .add([
                Object.assign(
                  {
                    isEdit: true,
                    no,
                    isTemp: true,
                    isAddFromHistory: true,
                    historyTableRowIndex: rowApi.index(),
                  },
                  _.pick(rowData, [
                    'tool_type',
                    'tool_spec',
                    'tool_id',
                    'use_qty',
                    'tool_use_for',
                    'life_remark',
                    'uselist_remark',
                  ])
                ),
              ])
              .draw(false)
            context.toolUseTable.toggleEditRow(true)
          })
          .on('click', '.cancel-list-btn', function () {
            const tr = this.closest('tr')
            const rowApi = context.toolHistoryTable.table.row(tr)
            const currRowData = rowApi.data()
            const { isCancel, isReuse } = currRowData
            if (isReuse) {
              return
            }
            rowApi
              .data(
                Object.assign(currRowData, {
                  isCancel: !isCancel,
                })
              )
              .draw(false)
            if (isCancel) {
              context.toolUse.store.cancelList = context.toolUse.store.cancelList.filter(
                (rowData) => {
                  return !(
                    rowData.tool_id === currRowData.tool_id &&
                    rowData.tool_use_for === currRowData.tool_use_for
                  )
                }
              )
            } else {
              context.toolUse.store.cancelList.push(currRowData)
            }
          })
          .on('click', '.reuse-list-btn', function () {
            const tr = this.closest('tr')
            const rowApi = context.toolHistoryTable.table.row(tr)
            const rowData = rowApi.data()
            const { isCancel, isReuse } = rowData
            if (isCancel || isReuse) {
              return
            }
            rowApi
              .data(
                Object.assign(rowData, {
                  isReuse: !isReuse,
                })
              )
              .draw(false)
            context.toolUseTable.table.rows
              .add([
                _.extend(
                  _.pick(rowData, [
                    'tool_type',
                    'tool_spec',
                    'tool_id',
                    'tool_use_for',
                    'use_qty',
                    'uselist_remark',
                    'life_remark',
                  ]),
                  {
                    historyTableRowIndex: rowApi.index(),
                    fix_for: 0,
                    isEdit: true,
                    isTemp: true,
                    isReuse: true,
                    no: ++context.toolUseTable.currIndex,
                  }
                ),
              ])
              .draw(false)
            context.toolUseTable.toggleEditRow(true)
          })
        return new Promise((res) => {
          window.tht = context.toolHistoryTable = createReportTable({
            $tableElement: $toolHistoryTable,
            autoWidth: false,
            order: [
              [0, 'asc'],
              [4, 'asc'],
            ],
            columns,
            onInit() {
              $toolHistoryTable.parent().addClass('step step-3 hide')
              res()
            },
          })
        })
      },
      initToolUseModule() {
        /**
         * 初始化領刀模組相關物件
         */
        const context = this
        const {
          $toolUseModal,
          useReasonForm,
          toolHistoryForm,
          userAuth,
        } = context
        const StepModal = context.commons.StepModal()
        class ToolUse extends StepModal {
          constructor(config) {
            super(config)
          }
        }

        // 領刀資訊Elements
        const toolUseInfo = Array.from(
          document.getElementById('tool-use-info').children
        ).reduce((a, el) => {
          const span = el.children[0]
          const name = span.dataset.column
          a[name] = span
          return a
        }, {})

        // 例外領刀的警示
        class Warning {
          constructor($container) {
            this.$container = $container
            this.els = {}
          }
          render(no) {
            if (!Object.prototype.hasOwnProperty.call(this.els, no)) {
              const $el = $(
                `<div class="warnings" style="color: red;" data-no="${no}">* 項目 <span>${no}</span> 非刀具履歷內項目</div>`
              )
              this.$container.append($el)
              this.els[no] = $el
            }
          }
          remove(no, isRemoveTr) {
            if (!Object.prototype.hasOwnProperty.call(this.els, no)) {
              return
            }
            this.els[no].remove()
            delete this.els[no]
            if (isRemoveTr) {
              for (let [currNo] of Object.entries(this.els)) {
                if (currNo > no) {
                  this.changeNumber(currNo, currNo - 1)
                }
              }
            }
          }
          reset() {
            this.$container.empty()
            this.els = {}
          }
          changeNumber(toChange, changeTo) {
            const $el = this.els[toChange]
            $el.data('no', changeTo)
            $el.find('span').text(changeTo)
            this.els[changeTo] = $el
            delete this.els[toChange]
          }
        }
        const warning = new Warning($('#exception-tool-use-info'))

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

        // 領刀各階段的處理函式
        const hooks = {
          init: {
            useReason(res) {
              this.store.useReasonForm.reset()
              this.store.useReasonForm.setValue({
                create_by: context.userId,
              })
              this.store.useReasonForm.elements.alarm_time.element
                .closest('section')
                .classList.add('hide')
              this.store.alarm_time = ''
              res()
            },
            toolMpHistoryInfo(res) {
              const { validator } = this.store.toolHistoryForm
              if (validator) {
                validator.destroy()
              }
              res()
            },
            insertToolUseList(res) {
              /**
               * 1. 清空領刀明細Table，currIndex歸零
               * 2. 清空例外領刀警示
               * 3. 切換領刀明細table顯示模式
               * 4. 切換刀具履歷table顯示模式
               */
              const useReason = this.store.useReason
              const isRepair = useReason.toString() === '12'
              context.toolUseTable.clearTable()
              context.toolUseTable.currIndex = 0
              context.toolUseTable.toggleEditMode(true)
              context.toolUseTable.toggleViewMode('insert', useReason)
              context.toolUseTable.changeColumnName(useReason)
              this.store.warning.reset()
              context.toolHistoryTable.table
                .columns([11, 12])
                .visible(isRepair)
                .columns([10])
                .visible(!isRepair)
                .draw(false)
              res()
            },
            viewToolUseList(res) {
              /**
               * 1. 切換領刀明細table顯示模式
               * 2. 取得領刀原因(useReason) / 領刀紀錄(rowData)
               * 3. 如果有領刀紀錄(修改領刀明細)就填入領刀資訊，並且查詢領刀明細
               * 4. 根據權限 隱藏 / 顯示 修改鈕
               */
              const useReason = this.store.useReason
              const rowData = this.store.rowData
              const isRepair = useReason.toString() === '12'
              const canEdit =
                (isRepair && userAuth.canEditRepairToolUse) ||
                (!isRepair && userAuth.canEditRegulateToolUse)

              context.toolUseTable.toggleEditMode(false)
              context.toolUseTable.toggleViewMode('view', useReason)
              context.toolUseTable.changeColumnName(useReason)
              $('#edit-tool-use-btn').toggleClass('hide', !canEdit)
              if (rowData) {
                this.store.toolUseInfo.machine_id.textContent = servkit.getMachineName(
                  rowData.machine_id
                )
                this.store.toolUseInfo.machine_id.dataset.machine_id =
                  rowData.machine_id
                this.store.toolUseInfo.order_id.textContent = rowData.order_id
                this.store.toolUseInfo.product_id.textContent =
                  rowData.product_id
                this.store.toolUseInfo.product_pid.textContent =
                  rowData.product_pid
                this.store.toolUseInfo.create_by.textContent =
                  context.preCon.user.idNameMap[rowData.create_by]
                this.store.toolUseInfo.create_by.dataset.create_by =
                  rowData.create_by
                this.store.toolUseInfo.tool_history_no.textContent =
                  rowData.tool_history_no
                this.store.toolUseInfo.tool_use_no.textContent =
                  rowData.tool_use_no
                this.store.toolUseInfo.create_time.textContent =
                  rowData.create_time
                servkit.ajax(
                  {
                    url: 'api/getdata/db',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({
                      table: 'a_huangliang_view_tool_stock_tool_mp_list',
                      whereClause: 'tool_use_no = ?',
                      whereParams: [rowData.tool_use_no],
                    }),
                  },
                  {
                    success(data) {
                      context.toolUse.store.toolMpList = {
                        showList: [],
                        hideList: [],
                      }
                      data.forEach((map) => {
                        if (map.uselist_status === 0) {
                          context.toolUse.store.toolMpList.showList.push(map)
                        } else {
                          context.toolUse.store.toolMpList.hideList.push(map)
                        }
                      })
                      context.toolUseTable.currIndex = 0
                      context.toolUseTable.drawTable(
                        context.toolUse.store.toolMpList.showList.map((d) => {
                          return Object.assign(
                            {
                              no: ++context.toolUseTable.currIndex,
                              isSaved: true,
                              orig_qty: d.use_qty,
                            },
                            d
                          )
                        })
                      )
                      res()
                    },
                  }
                )
              } else {
                this.store.warning.reset()
                res()
              }
            },
          },
          validate: {
            useReason(res, rej) {
              const self = this
              const use_reason = self.store.useReasonForm.getValue('use_reason')
              const isRepair = use_reason === '12'

              self.store.useReasonForm
                .validateAsync({
                  order_id: {
                    validate() {
                      const order_id = this.getValue()
                      if (order_id) {
                        return new Promise((res) =>
                          servkit.ajax(
                            {
                              url: 'api/getdata/db',
                              type: 'POST',
                              contentType: 'application/json',
                              data: JSON.stringify({
                                table: 'a_huangliang_wo_list',
                                whereClause: 'order_id = ?',
                                whereParams: [order_id],
                              }),
                            },
                            {
                              success(data) {
                                const isExist = data.length > 0
                                res(
                                  isExist ? '' : `生產指令（${order_id}）不存在`
                                )
                              },
                            }
                          )
                        )
                      } else {
                        return Promise.resolve('此欄必填')
                      }
                    },
                  },
                  alarm_time: {
                    validate() {
                      if (isRepair) {
                        return Promise.resolve(
                          this.getValue() ? '' : '此欄必填'
                        )
                      } else {
                        return Promise.resolve()
                      }
                    },
                  },
                })
                .then((isValid) => {
                  if (isValid) {
                    res()
                  } else {
                    rej()
                  }
                })
            },
            toolMpHistoryInfo(res, rej) {
              const form = this.store.toolHistoryForm
              const validator =
                form.validator ||
                form.$container.validate({
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
              let isValid = validator.form()
              if (isValid) {
                res()
              } else {
                rej('校車資訊有誤')
              }
            },
            insertToolUseList(res, rej) {
              const dataCounts = context.toolUseTable.table.data().length
              if (dataCounts) {
                res()
              } else {
                $.smallBox({
                  sound: false,
                  title: '儲存失敗',
                  content: '請至少建立一筆刀具領用明細',
                  color: servkit.colors.red,
                  iconSmall: 'fa fa-times',
                  timeout: 4000,
                })
                rej()
              }
            },
          },
          afterValidate: {
            useReason(res, rej) {
              const self = this
              const formData = this.store.useReasonForm.getValue()
              const { order_id, machine_id, use_reason, alarm_time } = formData
              self.store.useReason = use_reason
              context.$toolUseReasonSpan.text(
                ' - ' + context.useReasonMap[use_reason]
              )
              if (use_reason === '11') {
                // 校車
                servkit.ajax(
                  {
                    url: 'api/huangliangTool/toolmp/getHistoryData',
                    type: 'GET',
                    contentType: 'application/json',
                    data: {
                      order_id,
                      machine_id,
                    },
                  },
                  {
                    success(data) {
                      if (data) {
                        const {
                          product_id,
                          product_pid,
                          tool_ptime = '',
                          mat_code = '',
                        } = data
                        self.store.toolUseInfo.machine_id.textContent = servkit.getMachineName(
                          machine_id
                        )
                        self.store.toolUseInfo.machine_id.dataset.machine_id = machine_id
                        self.store.toolUseInfo.order_id.textContent = order_id
                        self.store.toolUseInfo.product_id.textContent = product_id
                        self.store.toolUseInfo.product_pid.textContent = product_pid
                        self.store.toolHistoryForm.reset()
                        self.store.toolHistoryForm.setValue({
                          tool_ptime,
                          mat_code,
                        })
                      }
                      res()
                    },
                    fail(data) {
                      rej(
                        'fail on get latest tool mp hisotry data. errorMsg: ' +
                          data
                      )
                    },
                  }
                )
              } else {
                // 維修
                servkit.ajax(
                  {
                    url: 'api/huangliangTool/toolmp/toolMpHisList',
                    type: 'GET',
                    contentType: 'application/json',
                    data: {
                      order_id,
                      machine_id,
                    },
                  },
                  {
                    success(data) {
                      const {
                        tool_history_no,
                        product_id,
                        product_pid,
                        program_name,
                        list,
                      } = data

                      self.store.toolUseInfo.machine_id.textContent = servkit.getMachineName(
                        machine_id
                      )
                      self.store.toolUseInfo.machine_id.dataset.machine_id = machine_id
                      self.store.toolUseInfo.order_id.textContent = order_id
                      self.store.toolUseInfo.tool_history_no.textContent = tool_history_no
                      self.store.toolUseInfo.product_id.textContent = product_id
                      self.store.toolUseInfo.product_pid.textContent = product_pid
                      self.store.toolUseInfo.create_time.textContent = ''.toFormatedDate()
                      self.store.cancelList.length = 0
                      self.store.alarm_time = alarm_time
                      // 去掉刀具未啟用的資料
                      context.toolHistoryTable.drawTable(
                        list.reduce((a, record) => {
                          const toolProfile = context.preCon.toolProfile.find(
                            (data) => data.tool_id === record.tool_id
                          )
                          if (toolProfile) {
                            a.push(
                              Object.assign(
                                {
                                  tool_type: toolProfile.tool_type,
                                  tool_spec: toolProfile.tool_spec,
                                  program_name,
                                  machine_id,
                                },
                                record
                              )
                            )
                          }
                          return a
                        }, [])
                      )
                      res({ step: 3 })
                    },
                    fail(data) {
                      const isNotFound = data === 'Not found'
                      $.smallBox({
                        sound: false,
                        title: '查詢失敗',
                        content: isNotFound
                          ? '未找到相關領刀單'
                          : '請聯絡管理員',
                        color: servkit.colors.red,
                        iconSmall: 'fa fa-times',
                        timeout: 4000,
                      })
                      rej(
                        'fail on get latest tool mp hisotry data. errorMsg: ' +
                          data
                      )
                    },
                  }
                )
              }
            },
            toolMpHistoryInfo(res, rej) {
              const self = this
              const order_id = self.store.toolUseInfo.order_id.textContent
              const machine_id =
                self.store.toolUseInfo.machine_id.dataset.machine_id
              const product_id = self.store.toolUseInfo.product_id.textContent
              const formData = self.store.toolHistoryForm.getValue()
              const requestMap = {}

              _.each(formData, (value, key) => {
                if (value) {
                  requestMap[key] = value
                }
              })

              servkit.ajax(
                {
                  url: 'api/huangliangTool/toolmp/createMpHistory',
                  type: 'POST',
                  contentType: 'application/json',
                  data: JSON.stringify(
                    _.extend(
                      {
                        order_id,
                        machine_id,
                        product_id,
                      },
                      requestMap
                    )
                  ),
                },
                {
                  success(data) {
                    const { tool_history_no, list } = data
                    self.store.toolUseInfo.tool_history_no.textContent = tool_history_no
                    self.store.toolUseInfo.create_time.textContent = ''.toFormatedDate()
                    context.toolHistoryTable.drawTable(list)
                    res()
                  },
                  fail(data) {
                    rej('fail on create tool history. errorMsg: ' + data)
                  },
                }
              )
            },
            insertToolUseList(res, rej) {
              const self = this
              const list = context.getInsertToolUseList(
                context.toolUseTable.table.data().toArray()
              )
              const cancelList = self.store.cancelList
              const tool_history_no =
                self.store.toolUseInfo.tool_history_no.textContent
              const machine_id =
                self.store.toolUseInfo.machine_id.dataset.machine_id
              const order_id = self.store.toolUseInfo.order_id.textContent
              const use_reason = Number(self.store.useReason)
              const alarm_time = self.store.alarm_time

              servkit.ajax(
                {
                  url: 'api/huangliangTool/toolmp/createToolMpUse',
                  type: 'POST',
                  contentType: 'application/json',
                  data: JSON.stringify({
                    order_id,
                    machine_id,
                    tool_history_no,
                    use_reason,
                    list,
                    cancelList,
                    alarm_time,
                  }),
                },
                {
                  success({ tool_use_no, toolMpList }) {
                    self.store.toolUseInfo.tool_use_no.textContent = tool_use_no
                    context.toolStock = {}
                    context.toolUseTable.currIndex = 0
                    context.toolUse.store.toolMpList = {
                      showList: [],
                      hideList: [],
                    }
                    toolMpList.forEach((map) => {
                      if (map.uselist_status === 0) {
                        context.toolUse.store.toolMpList.showList.push(map)
                      } else {
                        context.toolUse.store.toolMpList.hideList.push(map)
                      }
                    })
                    context.toolUseTable.drawTable(
                      context.toolUse.store.toolMpList.showList.map((d) =>
                        Object.assign(
                          {
                            isSaved: true,
                            isEdit: false,
                            // uselist_status: 0,
                            orig_qty: d.use_qty,
                            no: ++context.toolUseTable.currIndex,
                          },
                          d
                        )
                      )
                    )
                    self.store.toolUseInfo.create_by.textContent =
                      context.preCon.user.idNameMap[context.userId]
                    self.store.toolUseInfo.create_by.dataset.create_by =
                      context.userId
                    res()
                  },
                  fail(data) {
                    rej('fail on create tool use. errorMsg: ' + data)
                  },
                }
              )
            },
          },
        }

        window.tu = context.toolUse = new ToolUse({
          $modal: $toolUseModal,
          $nextBtn: $('#next-step'),
          // $prevBtn: $('#prev-step'),
          // $cancelBtn: $('#cancel-step'),
          maxStep: 4,
          stepNameList: [
            'useReason', // 選擇領刀原因
            'toolMpHistoryInfo', // 填寫校車資訊(主副夾頭、材料編碼...等)
            'insertToolUseList', // 建立領刀明細
            'viewToolUseList', // 檢視領刀明細
          ],
          store: {
            useReasonForm,
            toolHistoryForm,
            toolUseInfo,
            warning,
            cancelList: [],
          },
          hooks,
        })
      },
      getInsertToolUseList(insertRowsData) {
        /**
         * 取得加上廠商和進貨時間的領刀明細，由進貨時間最早的開始領刀(先進先出)
         * 如果單筆庫存不夠領，剩餘數量就領次早進貨的庫存
         */
        const context = this
        return _.flatten(
          insertRowsData.map((rowData) => {
            const { tool_status, use_qty, tool_id } = rowData
            const toolStock = context.toolStock[tool_id]
            let leftQty = Number(use_qty)
            let useQty
            let isFirst = true
            const toolBuyInfo = []

            toolStock[tool_status].stockList.forEach((stock) => {
              if (leftQty > 0 && stock.tool_stock > 0) {
                if (stock.tool_stock >= leftQty) {
                  useQty = leftQty
                  leftQty = 0
                } else {
                  useQty = stock.tool_stock
                  leftQty -= stock.tool_stock
                }
                stock.tool_stock -= useQty
                const info = {
                  buy_time: stock.buy_time,
                  tsup_id: stock.tsup_id,
                  use_qty: useQty,
                  tool_location: stock.tool_location,
                }
                if (isFirst) {
                  Object.assign(info, { isFirst })
                  isFirst = false
                }
                toolBuyInfo.push(info)
              }
            })
            return toolBuyInfo.map((m) => Object.assign({}, rowData, m))
          })
        )
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
      repairCode(done) {
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
              const repairCodeMap = Object.fromEntries(
                data
                  .filter((map) => map.repair_type_id[0] !== '9')
                  .map((map) => [map.repair_code, map.repair_code_name])
              )
              const toolUseForMap = repairCodeMap
              done({
                repairCodeMap,
                toolUseForMap,
              })
            },
          }
        )
      },
      toolType(done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_huangliang_tool_type',
              columns: ['tool_type'],
              whereClause: 'is_open = ?',
              whereParams: ['Y'],
            }),
          },
          {
            success(data) {
              done(_.pluck(data, 'tool_type'))
            },
          }
        )
      },
      toolProfile(done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_huangliang_tool_profile',
              whereClause: 'is_open = ?',
              whereParams: ['Y'],
            }),
          },
          {
            success(data) {
              done(data)
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
              whereClause: 'is_open = ?',
              whereParams: ['Y'],
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
      ['/app/HuangLiangToolStock/commons/searchInfo.js'],
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
