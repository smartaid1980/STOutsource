export default function () {
  GoGoAppFun({
    gogo(context) {
      context.initAuth()
      context.initQueryConditionForm()
      context.initQueryResultTable()
      context.initRecordForm()
    },
    util: {
      $clearBtn: $('#clear-btn'),
      $submitBtn: $('#submit-btn'),
      $toolTypeSelect: $('#tool-type'),
      $typeForSelect: $('#type-for'),
      $tsupSelect: $('#tsup-id'),
      $toolId: $('#tool-id'),
      $toolSpec: $('#tool-spec'),
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $queryConditionForm: $('#query-condition-form'),
      $queryResultTable: $('#query-result-table'),
      $editRecordModal: $('#edit-record-modal'),
      $editRecordForm: $('#edit-record-form'),
      $saveRecordBtn: $('#save-record'),
      queryResultTable: null,
      toolPriceMap: {},
      editableColumn: ['total_cost', 'remark'],
      userAuth: {},
      initAuth() {
        const context = this
        const loginInfo = JSON.parse(window.sessionStorage.getItem('loginInfo'))
        const userGroup = loginInfo.user_group || []
        const canCreateRecordGroupList = ['sys_manager_group', 'tool_stock']
        const canEditRecordGroupList = canCreateRecordGroupList
        const canExportRecordGroupList = canCreateRecordGroupList.concat([
          'factory_service_deputy_manager',
          'factory_manager',
        ])
        const canCreateRecord =
          userGroup.findIndex((group) =>
            canCreateRecordGroupList.includes(group)
          ) >= 0
        const canEditRecord =
          userGroup.findIndex((group) =>
            canEditRecordGroupList.includes(group)
          ) >= 0
        const canExportRecord =
          userGroup.findIndex((group) =>
            canExportRecordGroupList.includes(group)
          ) >= 0
        Object.assign(context.userAuth, {
          canCreateRecord,
          canEditRecord,
          canExportRecord,
        })
      },
      initQueryConditionForm() {
        const context = this
        const {
          $clearBtn,
          $submitBtn,
          $queryConditionForm,
          $tsupSelect,
          $toolTypeSelect,
          $typeForSelect,
          $startDate,
          $endDate,
          $toolId,
          $toolSpec,
        } = context
        const today = ''.toFormatedDate()
        const yesterday = moment().subtract(1, 'days').format('YYYY/MM/DD')
        let toolIdList = []
        let toolSpecSet = new Set()
        let toolSpecList

        context.preCon.toolProfile.forEach((data) => {
          toolIdList.push(data.tool_id)
          toolSpecSet.add(data.tool_spec)
        })

        toolSpecList = Array.from(toolSpecSet).sort()

        context.queryConditionForm = new window.Form($queryConditionForm)
        const els = context.queryConditionForm.elements
        servkit.initSelectWithList(
          _.extend({ '': '' }, context.preCon.supplier),
          $tsupSelect
        )
        servkit.initSelectWithList(
          ['', ...context.preCon.toolType],
          $toolTypeSelect
        )
        servkit.initSelectWithList(
          context.preCon.map.typeForMap,
          $typeForSelect
        )
        $toolId.autocomplete({
          source: toolIdList,
          minLength: 3,
        })
        $toolSpec.select2({
          minimumInputLength: 0,
          width: '100%',
          placeholder: '先選擇刀具類型以提供篩選結果',
        })
        $toolSpec.select2('val', null)
        $toolTypeSelect.on('change', function () {
          const toolType = this.value
          const isSelectType = toolType !== ''
          const filteredSpecSet = new Set(
            _.pluck(
              context.preCon.toolProfile.filter(
                (data) => data.tool_type === toolType
              ),
              'tool_spec'
            )
          )
          if (!filteredSpecSet.has('')) {
            filteredSpecSet.add('')
          }
          servkit.initSelectWithList(
            isSelectType ? Array.from(filteredSpecSet) : [''],
            $toolSpec
          )
          $toolSpec.select2('val', null)
        })
        servkit.initDatePicker($startDate, $endDate)

        els.startDate.reset = function (date = yesterday) {
          this.setValue(date)
        }
        els.endDate.reset = function (date = today) {
          this.setValue(date)
        }
        els.tool_id.$element = $(els.tool_id.element)
        els.tool_id.reset = function () {
          this.$element.select2('val', null)
        }
        els.tool_spec.$element = $(els.tool_spec.element)
        els.tool_spec.reset = function () {
          this.$element.select2('val', null)
        }
        servkit.validateForm($queryConditionForm, $submitBtn)
        $submitBtn.on('click', function (e) {
          e.preventDefault()
          context.getRecords()
        })
        $clearBtn.on('click', function (e) {
          e.preventDefault()
          context.queryConditionForm.reset()
        })
      },
      initQueryResultTable() {
        const context = this
        const { $queryResultTable, userAuth } = context
        const $excelBtn = $(
          `<button class="btn btn-success download-excel"><span class="fa fa-file-excel-o fa-lg"></span> Excel匯出</button>`
        )
        const $insertBtn = $(
          `<button class="btn btn-primary stk-insert-btn" title="新增"><span class="fa fa-plus fa-lg"></span></button>`
        )
        const SearchInfo = context.commons.SearchInfo()
        const hideCols = userAuth.canEditRecord ? [] : [11]
        const customBtns = []

        context.searchInfo = new SearchInfo({
          buy_time: '進貨日期',
          tool_id: '刀具編碼',
          tsup_id: '廠商',
          tool_type: '刀具類型',
          tool_spec: '刀具規格',
          type_for: '成本分類',
          total_cost: '進貨總金額',
        })
        customBtns.push(context.searchInfo.$container[0])

        if (userAuth.canCreateRecord) {
          customBtns.push($insertBtn[0])
        }
        if (userAuth.canExportRecord) {
          customBtns.push($excelBtn[0])
        }

        const columns = [
          {
            data: 'buy_time',
            name: 'buy_time',
            render(data, type) {
              if (type === 'selectFilter' || type === 'display') {
                return data.toFormatedDate()
              } else {
                return data.toFormatedDatetime()
              }
            },
          },
          {
            data: 'type_for',
            name: 'type_for',
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
            data: 'tool_id',
            name: 'tool_id',
          },
          {
            data: 'tsup_id',
            name: 'tsup_id',
            render(data, type) {
              if (type === 'display' || type === 'selectFilter') {
                return context.preCon.supplier[data]
              } else {
                return data
              }
            },
          },
          {
            data: 'tool_type',
            name: 'tool_type',
          },
          {
            data: 'tool_spec',
            name: 'tool_spec',
          },
          {
            data: 'buy_qty',
            name: 'buy_qty',
          },
          {
            data: 'unit_price',
            name: 'unit_price',
          },
          {
            data: 'total_cost',
            name: 'total_cost',
          },
          {
            data: 'remark',
            name: 'remark',
          },
          {
            data: 'tool_location',
            name: 'tool_location',
          },
          {
            data: null,
            name: 'edit',
            render() {
              return '<button class="btn btn-success edit-record">修改</button>'
            },
          },
        ]
        window.qrt = context.queryResultTable = createReportTable({
          $tableElement: $queryResultTable,
          $tableWidget: $('#query-result-widget'),
          autoWidth: false,
          order: [[0, 'asc']],
          customBtns,
          hideCols,
          columns,
        })
        $insertBtn.on('click', function () {
          context.showRecordModal(true)
        })
        $queryResultTable.on('click', '.edit-record', function () {
          context.showRecordModal(false, this)
        })
        servkit.downloadCustomizedExcel($excelBtn, function () {
          const buy_time = context.searchInfo.$els.buy_time.text
          const totalCostSum = context.searchInfo.$els.total_cost.text
          const selectedRowData = context.queryResultTable.table
            .rows({ order: 'applied', search: 'applied', page: 'all' })
            .data()
            .toArray()
          const columnsOrder = _.pluck(columns, 'name').slice(0, 11)
          const getRowData = (map) => {
            let value
            return columnsOrder.map((name) => {
              value = map[name]
              switch (name) {
                case 'buy_time':
                  value = value.toFormatedDate()
                  break
                case 'tsup_id':
                  value = context.preCon.supplier[value]
                  break
                case 'type_for':
                  value = context.preCon.map.typeForMap[value]
                  break
              }
              return value
            })
          }
          const matrices = [
            {
              x: 0,
              y: 3,
              data: selectedRowData.map((data) => getRowData(data)),
              format: [
                'text',
                'text',
                'text',
                'text',
                'text',
                'text',
                '0.00',
                '0.00',
                '0.00',
                'text',
                'text',
              ],
            },
          ]
          matrices.unshift(
            {
              x: 4,
              y: 1,
              data: [[buy_time]],
              format: ['text'],
            },
            {
              x: 8,
              y: 1,
              data: [[totalCostSum]],
              format: ['0.00'],
            }
          )
          return {
            templateName: 'toolPurchaseRecordTemplate',
            fileName: '刀具進貨記錄' + moment().format('YYYYMMDDHHmmssSSSS'),
            matrices,
          }
        })
      },
      getRecords() {
        const context = this
        const { searchInfo, queryConditionForm } = context
        const formData = queryConditionForm.getValue()
        const { tool_id, tsup_id, tool_type, type_for, tool_spec } = formData
        const startDate = formData.startDate + ' 00:00:00'
        const endDate = formData.endDate + ' 23:59:59'
        const whereParams = []
        const searchCondition = {}
        let whereClause = '1'

        if (tool_id) {
          whereClause += ' AND tool_id = ?'
          whereParams.push(tool_id)
          searchCondition.tool_id = tool_id
        }
        if (tool_type) {
          whereClause += ' AND tool_type = ?'
          whereParams.push(tool_type)
          searchCondition.tool_type = tool_type
        }
        if (tool_spec) {
          whereClause += ' AND tool_spec = ?'
          whereParams.push(tool_spec)
          searchCondition.tool_spec = tool_spec
        }
        if (tsup_id) {
          whereClause += ' AND tsup_id = ?'
          whereParams.push(tsup_id)
          searchCondition.tsup_id = tsup_id
        }
        if (type_for && type_for.length) {
          whereClause += ` AND type_for IN (${type_for
            .map(() => '?')
            .join(',')})`
          whereParams.push(...type_for)
          searchCondition.type_for = type_for.map(
            (d) => context.preCon.map.typeForMap[d]
          )
        }
        if (startDate && endDate) {
          whereClause += ' AND buy_time BETWEEN ? AND ?'
          whereParams.push(startDate, endDate)
          searchCondition.buy_time =
            startDate.toFormatedDate() + ' - ' + endDate.toFormatedDate()
        }

        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_huangliang_view_tool_buy_profile_type_stock',
              whereClause,
              whereParams,
            }),
          },
          {
            success(data) {
              const totalCostSum = data.reduce(
                (a, x) => a + Number(x.total_cost),
                0
              )
              searchInfo.changeCondition(
                _.extend({ total_cost: totalCostSum }, searchCondition)
              )
              context.queryResultTable.drawTable(data)
            },
          }
        )
      },
      initRecordForm() {
        const context = this
        const { $editRecordForm, $saveRecordBtn, toolPriceMap } = context
        const editRecordForm = (context.editRecordForm = new window.Form(
          $editRecordForm
        ))
        const $toolSpec = $(editRecordForm.elements.tool_spec.element)
        const $toolType = $(editRecordForm.elements.tool_type.element)
        const $toolId = $(editRecordForm.elements.tool_id.element)
        const $tsupId = $(editRecordForm.elements.tsup_id.element)
        const $newToolLocation = $(
          editRecordForm.elements.new_tool_location.element
        )
        const $backupToolLocation = $(
          editRecordForm.elements.backup_tool_location.element
        )
        const $unitPrice = $(editRecordForm.elements.unit_price.element)
        const getToolId = (tool_type, tool_spec) => {
          const toolProfile = _.find(context.preCon.toolProfile, (value) => {
            return (
              value.tool_type === tool_type && value.tool_spec === tool_spec
            )
          })
          return toolProfile ? toolProfile.tool_id : null
        }
        const getToolPrice = (tool_id, tsup_id) => {
          if (tool_id && tsup_id) {
            const id = tool_id + tsup_id
            const isCached = Object.prototype.hasOwnProperty.call(
              toolPriceMap,
              id
            )
            let latestPrice
            return new Promise((res) => {
              if (isCached) {
                latestPrice = toolPriceMap[id]
                res()
              } else {
                servkit.ajax(
                  {
                    url: 'api/getdata/db',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({
                      table: 'a_huangliang_tool_price',
                      columns: ['tool_price'],
                      whereClause:
                        'tool_id = ? AND tsup_id = ? ORDER BY create_time DESC',
                      whereParams: [tool_id, tsup_id],
                    }),
                  },
                  {
                    success(data) {
                      latestPrice = data.length ? data[0].tool_price : ''
                      toolPriceMap[tool_id + tsup_id] = latestPrice
                      res()
                    },
                  }
                )
              }
            }).then(() => {
              editRecordForm.setValue({
                unit_price: latestPrice,
              })
              $unitPrice.change()
            })
          }
        }
        const calcTotalPrice = () => {
          const unit_price = Number(editRecordForm.getValue('unit_price'))
          const buy_qty = Number(editRecordForm.getValue('buy_qty'))
          if (
            !isNaN(unit_price) &&
            unit_price > 0 &&
            !isNaN(buy_qty) &&
            buy_qty > 0
          ) {
            const total_cost = unit_price * buy_qty
            editRecordForm.setValue({
              total_cost: total_cost.toFixed(2),
            })
          }
        }
        context.initValidator()
        servkit.initSelectWithList(
          context.preCon.toolLocation,
          $backupToolLocation
        )
        servkit.initSelectWithList(context.preCon.toolType, $toolType)
        $toolSpec.select2({
          minimumInputLength: 0,
          width: '100%',
        })
        servkit.initSelectWithList(context.preCon.supplier, $tsupId)
        servkit.initDatePicker($(editRecordForm.elements.buy_time.element))
        $saveRecordBtn.on('click', function () {
          const { isInsert, rowData } = $(this).data()
          if (isInsert) {
            context.insertRecord()
          } else {
            context.updateRecord(rowData)
          }
        })
        $editRecordForm
          // 選刀具類型後篩選刀具規格的選項
          .on('change', '[name=tool_type]', function () {
            const tool_type = this.value
            const toolSpecList = context.preCon.toolProfile.reduce((a, x) => {
              if (x.tool_type === tool_type) {
                a.push(x.tool_spec)
              }
              return a
            }, [])
            servkit.initSelectWithList(toolSpecList, $toolSpec)
            $toolSpec.select2('val', null)
            // editRecordForm.setValue({
            //   tool_id: getToolId(tool_type, $toolSpec.val())
            // });
            // $toolId.change()
          })
          // 選刀具類型和刀具規格後帶出刀具編碼
          .on('change', '[name=tool_spec]', function () {
            const tool_spec = this.value
            const tool_type = editRecordForm.getValue('tool_type')
            editRecordForm.setValue({
              tool_id: getToolId(tool_type, tool_spec),
            })
            $toolId.change()
          })
          // 有刀具編碼和廠商代碼就call API取得單價，填入後檢查若已填數就要填入總金額
          // 有了刀具編碼，將設定的預設新刀儲位填入
          .on('change', '[name=tool_id]', function () {
            const tool_id = this.value
            const tsup_id = $tsupId.val()
            const newToolLocation = _.find(
              context.preCon.toolProfile,
              (value) => value.tool_id === tool_id
            ).tool_newloc
            getToolPrice(tool_id, tsup_id)
            $newToolLocation.val(newToolLocation || '')
          })
          .on('change', '[name=tsup_id]', function () {
            const tsup_id = this.value
            const tool_id = $toolId.val()
            getToolPrice(tool_id, tsup_id)
          })
          // 刀具儲位點了預設新刀儲位radio button，就要disable備用刀具室的select；反之亦然
          .on('change', '[name=tool_location]', function () {
            const tool_location = this.value
            const isNew = tool_location === 'new'
            $backupToolLocation.prop('disabled', isNew)
          })
          // keyup數量或是金額就要計算總金額填入
          .on('keyup', '[name=unit_price]', function () {
            calcTotalPrice()
          })
          .on('keyup', '[name=buy_qty]', function () {
            calcTotalPrice()
          })
      },
      showRecordModal(isInsert, btn) {
        const context = this
        const {
          queryResultTable,
          $editRecordForm,
          $editRecordModal,
          editableColumn,
          $saveRecordBtn,
        } = context
        const rowData = isInsert
          ? {}
          : queryResultTable.table.row(btn.closest('tr')).data()
        const validator = $editRecordForm.data('validator')
        if (validator) {
          validator.destroy()
        }

        if (isInsert) {
          $editRecordForm.find('[name]').each((i, el) => {
            const isRadio = el.type === 'radio'
            const name = el.name
            if (isRadio) {
              el.checked = false
            } else {
              el.value = ''
            }
            if (name === 'tool_id' || name === 'new_tool_location') {
              el.readOnly = true
            }
            if (name === 'tool_type') {
              $(el).change()
            }
            el.disabled = false
          })
        } else {
          let isEditable
          _.each(rowData, (value, key) => {
            const $input = $editRecordForm.find(`[name=${key}]`)
            const type = $input.length ? $input[0].type : ''
            const name = $input.length ? $input[0].name : ''
            const isTimeColumn = name === 'buy_time'
            isEditable = editableColumn.includes(key)
            if ($input && type !== 'radio') {
              $input.val(isTimeColumn ? value.toFormatedDate() : value)
              $input.prop('disabled', !isEditable)
            }
          })
          $editRecordForm.find('[name=tool_type]').change()
          $editRecordForm
            .find('[name=tool_spec]')
            .select2('val', rowData.tool_spec)
          const isDefaultLocation =
            rowData.tool_location === rowData.tool_newloc
          $editRecordForm.find('[name=tool_location]').each((i, el) => {
            const value = el.value
            switch (value) {
              case 'new':
                el.checked = isDefaultLocation
                break
              case 'backup':
                el.checked = !isDefaultLocation
                break
            }
            el.disabled = true
          })
          $editRecordForm
            .find('[name=new_tool_location]')
            .prop('disabled', true)
            .val(isDefaultLocation ? rowData.tool_location : '')
          $editRecordForm
            .find('[name=backup_tool_location]')
            .prop('disabled', true)
            .val(isDefaultLocation ? '' : rowData.tool_location)
        }
        $saveRecordBtn.data({
          isInsert,
          rowData,
        })
        $editRecordModal.modal('show')
      },
      insertRecord() {
        const context = this
        const {
          $editRecordForm,
          $editRecordModal,
          $tsupSelect,
          $toolTypeSelect,
          $toolSpec,
          $typeForSelect,
          $toolId,
          $startDate,
          $endDate,
        } = context
        const isValid = context.validateRecordForm()
        if (!isValid) {
          return
        }
        const requestMap = Object.fromEntries(
          $editRecordForm
            .find('[data-insert]')
            .toArray()
            .map((el) => {
              return [el.name, el.value]
            })
        )
        const buy_time_date = requestMap.buy_time
        const buy_time = buy_time_date + moment().format(' HH:mm:ss')
        const checkedValue = $editRecordForm
          .find('[name=tool_location]:checked')
          .val()
        let tool_location
        switch (checkedValue) {
          case 'new':
            tool_location = $editRecordForm
              .find('[name=new_tool_location]')
              .val()
            break
          case 'backup':
            tool_location = $editRecordForm
              .find('[name=backup_tool_location]')
              .val()
            break
          default:
            tool_location = ''
            break
        }
        Object.assign(requestMap, {
          tool_location,
          buy_time,
        })

        servkit.ajax(
          {
            url: 'api/huangliangToolStock/insertToolBuyToolStock',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(requestMap),
          },
          {
            success(data) {
              $tsupSelect.val('')
              $toolTypeSelect.val('')
              $toolSpec.val('')
              $typeForSelect.val('')
              $toolId.val('')
              $startDate.val(buy_time_date)
              $endDate.val(buy_time_date)
              context.getRecords()
              $editRecordModal.modal('hide')
            },
          }
        )
      },
      updateRecord(rowData) {
        const context = this
        const { $editRecordForm, $editRecordModal } = context
        const isValid = context.validateRecordForm()
        if (!isValid) {
          return
        }
        const { buy_time, tsup_id, tool_id } = rowData
        const pks = {
          buy_time: buy_time.toFormatedDatetime(),
          tsup_id,
          tool_id,
        }
        const requestMap = _.extend(
          {
            tableModel:
              'com.servtech.servcloud.app.model.huangliang_tool.ToolBuy',
            total_cost: $editRecordForm.find('[name=total_cost]').val(),
            remark: $editRecordForm.find('[name=remark]').val(),
          },
          pks,
          { pks }
        )
        servkit.ajax(
          {
            url: 'api/stdcrud',
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(requestMap),
          },
          {
            success(data) {
              context.getRecords()
              $editRecordModal.modal('hide')
            },
          }
        )
      },
      initValidator() {
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

        $.validator.addMethod(
          'date',
          function (value, element, params) {
            return (
              this.optional(element) ||
              /^[1-2]\d{3}\/[0-1]\d\/[0-3]\d$/.test(value)
            )
          },
          '請輸入正確的日期' + '：YYYY/MM/DD'
        )
      },
      validateRecordForm() {
        const context = this
        const { $editRecordForm } = context
        const rules = {
          buy_time: {
            required: true,
            dateISO: true,
          },
          tsup_id: 'required',
          tool_id: 'required',
          tool_type: 'required',
          tool_spec: 'required',
          unit_price: {
            required: true,
            positiveNumber: true,
            max: 1e16,
          },
          buy_qty: {
            required: true,
            positiveInteger: true,
          },
          total_cost: {
            required: true,
            positiveNumber: true,
            max: 1e16,
          },
          tool_location: 'required',
          new_tool_location: {
            required: {
              depends(el) {
                return el.closest('.row').querySelector('[name=tool_location]')
                  .checked
              },
            },
          },
          backup_tool_location: {
            required: {
              depends(el) {
                return el.closest('.row').querySelector('[name=tool_location]')
                  .checked
              },
            },
          },
        }
        const messages = {
          tool_location: '請先點選儲位類型，再選儲位',
          new_tool_location: '請選擇儲位',
          backup_tool_location: '請選擇儲位',
          unit_price: {
            max: '單價整數位數不得大於16位',
          },
          total_cost: {
            max: '總金額整數位數不得大於16位',
          },
        }
        return $editRecordForm
          .validate({
            rules,
            messages,
            errorPlacement(error, $el) {
              $el.closest('label.input').append(error)
            },
          })
          .form()
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
              table: 'a_huangliang_tool_supplier',
              whereClause: 'is_open = ?',
              whereParams: ['Y'],
            }),
          },
          {
            success(data) {
              done(
                Object.fromEntries(data.map((d) => [d.tsup_id, d.tsup_name]))
              )
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
              whereClause: 'is_open = ? ORDER BY tool_id ASC',
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
      toolLocation(done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_huangliang_tool_location',
              whereClause:
                'is_open = ? AND tool_location_for = ? AND location_area = ?',
              whereParams: ['Y', 'N', 2],
            }),
          },
          {
            success(data) {
              done(_.pluck(data, 'tool_location'))
            },
          }
        )
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
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
      ['/app/HuangLiangToolUse/commons/formElement.js'],
      [
        '/js/plugin/select2/select2.min.js',
        '/js/plugin/select2/i18n/select2_locale_zh-TW.js',
      ],
    ],
  })
}
