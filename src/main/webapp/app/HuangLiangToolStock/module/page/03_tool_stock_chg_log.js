export default function () {
  GoGoAppFun({
    gogo(context) {
      servkit.initDatePicker(context.$startDate, context.$endDate, true)
      context.calcPreconditionData()
      context.initQueryConditionForm()
      context.initQueryResultTable()
      context.initRecordForm()
      context.initMoveTable()
    },

    util: {
      $insertBtn: $(
        `<button class="btn btn-primary stk-insert-btn" title="新增"><span class="fa fa-plus fa-lg"></span></button>`
      ),
      $queryConditionForm: $('#query-condition-form'),
      $chgType: $('#chg-type'), //異動類型
      $startDate: $('#start-date'), // 日期起始
      $endDate: $('#end-date'), // 日期結束
      $areaId: $('#location-area'), // 儲存區域
      $lcnId: $('#tool-location'), // 儲存位置
      $toolType: $('#tool-type'), // 刀具類型
      $toolId: $('#tool-id'), // 刀具編碼
      $submitBtn: $('#submit-btn'), // 查詢
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      reportTable: undefined,

      $isType3: $('#isType3'),

      $selectStatus: $('#select-status'),

      $test: $('#modal-title'),

      $selectType: $('#select-type'),
      $selectSpec: $('#select-spec'),
      $selectId: $('#select-id'),

      $editNumSearch: $('#edit-num-search'),
      $editRecordForm: $('#edit-record-form'),
      $editNumTable: $('#edit-num-table'),
      $editNumMove: $('#edit-num-move-table'),

      $modalHeader: $('#modal-header'),

      $queryResultTable: $('#tool-stock-move-table-body'), // 查詢結果table
      $addStockLogModal: $('#add-stock-log-modal'), // 新增異動紀錄modal
      $goNext: $('#goNext'), // 去下一步
      $stockSelect: $('#stockSelect'), // modal-1:選擇類型的項目

      toolStatusMap: {
        0: '',
        N: '新刀',
        B: '回收刀',
      },

      chgTypeSelect: {
        0: '儲位調撥',
        2: '數量調整',
        3: '回收入庫',
        1: '外借暫用',
      },
      chgTypeSelect2: {
        // 備用
        0: '儲位調撥',
        2: '數量調整',
        3: '回收入庫',
        4: '',
        1: '外借暫用',
      },
      locationAreaMap: {
        1: '現場刀具庫',
        2: '備用刀具室',
        3: '廠外借用',
      },
      locAreaSelect: {
        0: '',
        1: '現場刀具庫',
        2: '備用刀具室',
        3: '廠外借用',
      },

      calcPreconditionData() {
        const context = this
        const { toolLocation, toolProfile } = context.preCon
        let toolLocationforN = (context.preCon.toolLocationforN = [])
        let toolLocationforB = (context.preCon.toolLocationforB = [])
        let toolLocationArea12N = (context.preCon.toolLocationArea12N = [])
        let toolLocationArea12B = (context.preCon.toolLocationArea12B = [])
        let toolLocationArea3N = (context.preCon.toolLocationArea3N = [])
        let toolLocationArea3B = (context.preCon.toolLocationArea3B = [])
        let toolSpecSet = new Set()
        let tool_location_for
        let location_area
        for (let data of toolLocation) {
          tool_location_for = data.tool_location_for
          location_area = data.location_area
          if (tool_location_for === 'N') {
            toolLocationforN.push(data)
            if (location_area === 1 || location_area === 2) {
              toolLocationArea12N.push(data)
            } else if (location_area === 3) {
              toolLocationArea3N.push(data)
            }
          } else if (tool_location_for === 'B') {
            toolLocationforB.push(data)
            if (location_area === 1 || location_area === 2) {
              toolLocationArea12B.push(data)
            } else if (location_area === 3) {
              toolLocationArea3B.push(data)
            }
          }
        }
        for (let data of toolProfile) {
          toolSpecSet.add(data.tool_spec)
        }
        context.preCon.toolSpec = Array.from(toolSpecSet)
      },

      // 首頁的查詢們
      initQueryConditionForm() {
        const context = this
        const {
          $submitBtn,
          $chgType,
          $areaId,
          $lcnId,
          $toolType,
          $toolId,
          $queryConditionForm,
          chgTypeSelect,
          locationAreaMap,
          chgTypeSelect2,
          $stockSelect,
        } = context

        // context.commons.initLocationAutoComplete($lcnId);//儲存位置
        // context.commons.initToolTypeAutoComplete($toolType);//刀具類型
        // context.commons.initToolTypeAutoComplete($toolId);//刀具編碼
        // 使用autocomplete + minLength加快載入速度
        $lcnId.autocomplete({
          source: _.chain(context.preCon.toolLocation)
            .pluck('tool_location')
            .uniq()
            .value()
            .sort(),
          minLength: 3,
        })
        $toolId.autocomplete({
          source: _.chain(context.preCon.toolProfile)
            .pluck('tool_id')
            .uniq()
            .value()
            .sort(),
          minLength: 3,
        })
        servkit.initSelectWithList(chgTypeSelect, $chgType)
        servkit.initSelectWithList(locationAreaMap, $areaId)
        servkit.initSelectWithList(chgTypeSelect2, $stockSelect) // 備用
        // servkit.initSelectWithList(chgTypeSelect, $toolType);
        servkit.initSelectWithList(['', ...context.preCon.toolType], $toolType)
        servkit.initSelectWithList(context.toolStatusMap, context.$selectStatus)
        context.initValidator()

        context.initToolTypeSelect()

        servkit.validateForm($queryConditionForm, $submitBtn)

        $submitBtn.on('click', function (e) {
          e.preventDefault()
          context.getMaterialAssignment()
        })
      },

      // 首頁長表們
      initQueryResultTable() {
        const context = this
        const { $queryResultTable } = context
        // var fm = 'factory_manager'; // 廠長
        // var fsdm = 'factory_service_deputy_manager'; // 廠務部副理群組
        var tsm = 'tool_stock' // 刀具管理廠務群組
        var smg = 'sys_manager_group' // 系統管理員群組

        var userGroup = JSON.parse(window.sessionStorage.getItem('loginInfo'))[
          'user_group'
        ]
        let $insertBtn

        var x1 = userGroup.indexOf(smg) == -1 // true:沒權限 false:有權限
        var x2 = userGroup.indexOf(tsm) == -1
        // var x3 = userGroup.indexOf(fsdm) == -1;
        // var x4 = userGroup.indexOf(fm) == -1;
        if (x1 == false || x2 == false) {
          // if (x3 == false || x4 == false && x1 == true && x2 == true) {
          $insertBtn = $(
            `<button class="btn btn-primary stk-insert-btn" title="新增"><span class="fa fa-plus fa-lg"></span></button>`
          )
        } else {
          $insertBtn = $(
            `<button class="btn btn-primary stk-insert-btn hide" title="新增"><span class="fa fa-plus fa-lg"></span></button>`
          )
        }

        const columns = [
          {
            data: 'chg_time',
            name: 'chg_time',
            render(data) {
              return data ? data.toFormatedDate() : ''
            },
          },
          {
            data: 'chg_type',
            name: 'chg_type',
            render(data, type) {
              if (type === 'selectFilter' || type === 'display') {
                return context.chgTypeSelect[data]
              } else {
                return data || ''
              }
            },
          },
          {
            data: 'buy_time',
            name: 'buy_time',
            render(data) {
              return data ? data.toFormatedDate() : ''
            },
          },
          {
            data: 'tool_id',
            name: 'tool_id',
          },
          {
            data: 'tool_status',
            name: 'tool_status',
            render(data, type) {
              if (type === 'selectFilter' || type === 'display') {
                return context.toolStatusMap[data]
              } else {
                return data || ''
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
            data: 'tool_location',
            name: 'tool_location',
          },

          {
            data: 'chg_qty',
            name: 'chg_qty',
          },
          {
            data: 'location_area',
            name: 'location_area',
            render(data, type) {
              if (type === 'selectFilter' || type === 'display') {
                return context.locAreaSelect[data]
              } else {
                return data || ''
              }
            },
          },
          {
            data: 'new_location',
            name: 'new_location',
            render(data) {
              return data || ''
            },
          },
          {
            data: 'chg_remark',
            name: 'chg_remark',
            render(data) {
              return data || ''
            },
          },
        ]
        context.queryResultTable = createReportTable({
          showNoData: true,
          $tableElement: $('#query-result-table'),
          $tableWidget: $('#query-result-widget'),
          autoWidth: false,
          excel: {
            fileName:
              '刀具庫存異動紀錄_' + moment().format('YYYYMMDDHHmmssSSSS'),
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
              'text',
              'text',
            ],
            customDataFunc: function (tableData) {
              return Array.from(tableData).map((data) => {
                return columns.map((map) => {
                  if (map.render) {
                    return map.render(data[map.name], 'display')
                  } else {
                    return data[map.name]
                  }
                })
              })
            },
          },
          order: [[3, 'desc']],
          customBtns: [$insertBtn[0]],
          columns,
        })

        $queryResultTable.on('click', '.stk-insert-btn', function (evt) {
          evt.preventDefault()
          context.addNewChangeLog()
        })
      },
      getMaterialAssignment() {
        const context = this
        const {
          $chgType,
          $startDate,
          $endDate,
          $areaId,
          $lcnId,
          $toolType,
          $toolId,
        } = context
        const chg_type = $chgType.val()
        const area_id = $areaId.val()
        const location_id = $lcnId.val()
        const tool_type = $toolType.val()
        const tool_id = $toolId.val()

        const requestMap = {
          startDate: $startDate.val(),
          endDate: $endDate.val(),
          chg_type: chg_type,
          tool_location: location_id,
          location_area: area_id,
          tool_type: tool_type,
          tool_id: tool_id,
        }

        servkit.ajax(
          {
            url: 'api/huangliangToolStock/queryStockCHG',
            type: 'GET',
            contentType: 'application/json',
            data: requestMap,
          },
          {
            success(data) {
              context.queryResultTable.drawTable(data)
              context.loadingBtn.done()
            },
            fail() {},
          }
        )
      },

      // 新增刀具異動紀錄
      addNewChangeLog() {
        const context = this

        $('#add-stock-log-modal').modal('show')
        const errorModal = $('#stockSelect').parent().parent()
        context.initSelect()
        $('#goNext').on('click', function () {
          const selectType = $('#stockSelect').val()
          if (selectType == 4) {
            let findErr = $('#modal-error').html()
            if (findErr == '請選擇異動類型') {
              // console.log('hi')
            } else {
              errorModal.append(
                '<div class="error" id="modal-error"style="color:red">請選擇異動類型</div>'
              )
            }
          } else {
            let findErr = $('#modal-error').html()
            if (findErr == '請選擇異動類型') {
              $('#modal-error').remove()
            }
            $('#add-stock-log-modal').modal('hide')
            $('#add-stock-log-modal').on('hidden.bs.modal', function () {
              $(document.body).addClass('modal-open')
            })
            context.showMaterialModal(selectType)
          }
          context.editNumTable.table.clear().draw(false)
          context.editNumMove.table.clear().draw(false)
        })
      },

      // 把打開新增異動後的 (可能曾經選過的)值 都清空初始化
      initSelect() {
        const context = this
        const {
          $selectType,
          $stockSelect,
          $selectSpec,
          $selectId,
          $selectStatus,
        } = context
        $stockSelect[0].selectedIndex = 0
        $selectType[0].selectedIndex = 0
        $selectSpec.empty()
        $selectId.val('')
        $selectStatus[0].selectedIndex = 4
      },

      // 改新增異動modal的標題 然後再打開modal
      showMaterialModal(types) {
        const context = this
        const dom = context.$modalHeader
        $(dom).find('h3').remove()
        var isType3 = types == 3
        var isType1 = types == 1 //
        isType3
          ? $('#edit-num-search').html('查詢領刀明細')
          : $('#edit-num-search').html('查詢庫存')
        isType3
          ? $('#isType3').html('回收異動數')
          : $('#isType3').html('異動數')
        isType3
          ? $('#isStock').removeClass('hide')
          : $('#isStock').addClass('hide')
        isType3
          ? $('#select-status').parent().parent().addClass('hide')
          : $('#select-status').parent().parent().removeClass('hide')
        isType1 ? $('#isLcn').html('入庫儲位') : $('#isLcn').html('儲位')
        if (types == 0) {
          dom.append(
            '<h3 class="modal-title" id="modal-title">刀具庫存異動-儲位調撥</h3>'
          )
        } else if (types == 1) {
          dom.append(
            '<h3 class="modal-title" id="modal-title">刀具庫存異動-外借暫用</h3>'
          )
        } else if (types == 2) {
          dom.append(
            '<h3 class="modal-title" id="modal-title">刀具庫存異動-數量調整</h3>'
          )
        } else if (types == 3) {
          dom.append(
            '<h3 class="modal-title" id="modal-title">刀具庫存異動-回收入庫</h3>'
          )
        }
        context.editNumMove.toggleViewMode(types)
        context.editNumTable.toggleViewMode(types)

        $('#edit-num-widget').modal('show')
      },
      // 異動查詢 + 長表
      initRecordForm() {
        const context = this
        const {
          $editRecordForm,
          $editNumSearch,
          $editNumTable,
          toolStatusMap,
        } = context
        const editRecordForm = (context.editRecordForm = new window.Form(
          $editRecordForm
        ))
        const $toolId = $(editRecordForm.elements.tool_id_select.element)
        const $toolSpec = $(editRecordForm.elements.tool_spec_select.element)
        const $toolType = $(editRecordForm.elements.tool_type_select.element)
        const getToolId = (tool_type_select, tool_spec_select) => {
          const toolProfile = _.find(context.preCon.toolProfile, (value) => {
            return (
              value.tool_type === tool_type_select &&
              value.tool_spec === tool_spec_select
            )
          })
          return toolProfile ? toolProfile.tool_id : null
        }

        self.materialToAssignNumber = 1
        const columns = [
          {
            data: 'buy_time',
            name: 'buy_time',
            render(data) {
              return data ? data.toFormatedDate() : ''
            },
          },
          {
            data: 'tool_id',
            name: 'tool_id',
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
            data: 'tool_status',
            name: 'tool_status',
            render(data, type) {
              if (type === 'selectFilter' || type === 'display') {
                return context.toolStatusMap[data]
              } else {
                return data || ''
              }
            },
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
            data: 'tool_stock',
            name: 'tool_stock',
            render(data) {
              return data ? data : '0'
            },
          },
          {
            data: 'use_tqty',
            name: 'use_tqty',
            render(data) {
              return data ? data : '0'
            },
          },
          {
            data: 'use_qty',
            name: 'use_qty',
            render(data) {
              return data ? data : '0'
            },
          },
          {
            data: 'tool_location',
            name: 'tool_location',
          },
          {
            // 新增(按鈕)
            data: null,
            name: 'in_stock',
            render() {
              return `<button class="btn btn-primary addEdit">新增</button>`
            },
          },
        ]
        context.editNumTable = createReportTable({
          showNoData: true,
          $tableElement: $editNumTable,
          // $tableWidget: $('#edit-num-widget'),
          autoWidth: false,
          order: [[0, 'desc']],
          columns,
          // onInit () {
          //   context.editNumTable.toggleViewMode = function (types) {
          //     var columnNameIndexMap = Object.fromEntries(columns.map((col, i) => [col.name, i]));
          //     var getColumnIndex = (colArr) => colArr.map(name => columnNameIndexMap[name]).sort();
          //     let isType = types.toString() == '3';
          //     let visibleCols = isType ? ['use_qty'] : ['tool_stock',];
          //     let hideCols = isType ? ['tool_stock', 'use_tqty'] : [];
          //     let typesBy = Number(types)
          //     switch (typesBy) {
          //     case 0:
          //       visibleCols.push('use_tqty');
          //       hideCols.push('use_qty');
          //       break;
          //     case 1:
          //       visibleCols.push('use_tqty');
          //       hideCols.push('use_qty');
          //       break;
          //     case 2:
          //       hideCols.push('use_tqty');
          //       hideCols.push('use_qty');
          //       break;
          //     }
          //     hideCols = getColumnIndex(hideCols);
          //     visibleCols = getColumnIndex(visibleCols);
          //     context.editNumTable.table
          //       .columns(visibleCols).visible(true)
          //       .columns(hideCols).visible(false)
          //       .draw(false)
          //   }
          // }
        })
        context.editNumTable.toggleViewMode = function (types) {
          var columnNameIndexMap = Object.fromEntries(
            columns.map((col, i) => [col.name, i])
          )
          var getColumnIndex = (colArr) =>
            colArr.map((name) => columnNameIndexMap[name]).sort()
          let isType = types.toString() == '3'
          let visibleCols = isType ? ['use_qty'] : ['tool_stock']
          let hideCols = isType ? ['tool_stock', 'use_tqty'] : []
          let typesBy = Number(types)
          switch (typesBy) {
            case 0:
              visibleCols.push('use_tqty')
              hideCols.push('use_qty')
              break
            case 1:
              visibleCols.push('use_tqty')
              hideCols.push('use_qty')
              break
            case 2:
              hideCols.push('use_tqty')
              hideCols.push('use_qty')
              break
          }
          hideCols = getColumnIndex(hideCols)
          visibleCols = getColumnIndex(visibleCols)
          context.editNumTable.table
            .columns(visibleCols)
            .visible(true)
            .columns(hideCols)
            .visible(false)
            .draw(false)
        }
        $editRecordForm
          // 選刀具類型後篩選刀具規格的選項
          .on('change', '[name=tool_type_select]', function () {
            const tool_type = this.value
            const toolSpecList = context.preCon.toolProfile.reduce((a, x) => {
              if (x.tool_type === tool_type) {
                a.push(x.tool_spec)
              }
              return a
            }, [])
            servkit.initSelectWithList(toolSpecList, $toolSpec)
            editRecordForm.setValue({
              tool_id_select: getToolId(tool_type, $toolSpec.val()),
            })
            context.$selectId.change()
          })
          // 選刀具類型和刀具規格後帶出刀具編碼
          .on('change', '[name=tool_spec_select]', function () {
            const tool_spec = this.value
            const tool_type = editRecordForm.getValue('tool_type_select')
            editRecordForm.setValue({
              tool_id_select: getToolId(tool_type, tool_spec),
            })
            context.$selectId.change()
          })
        $editNumTable.on('click', '.addEdit', function () {
          // 庫存按鈕
          context.add(this)
        })
        $editNumSearch.on('click', function (e) {
          e.preventDefault()
          context.editNumMove.table.clear().draw(false)
          context.getRecords()
        })
      },
      // 查詢庫存
      getRecords() {
        const context = this
        const tool_type_select = $('#select-type').val()
        const tool_spec_select = $('#select-spec').val()
        const tool_id_select = $('#select-id').val()
        let tool_status = $('#select-status').val()

        let types = 0
        const modTitle = $('#modal-title').selector
        const title = $(modTitle).html()
        if (title == '刀具庫存異動-儲位調撥') {
          types = 0
        } else if (title == '刀具庫存異動-外借暫用') {
          types = 1
        } else if (title == '刀具庫存異動-數量調整') {
          types = 2
        } else if (title == '刀具庫存異動-回收入庫') {
          types = 3
        }
        let whereParams = [
          tool_type_select,
          tool_spec_select,
          tool_id_select,
          tool_status,
        ]
        let whereClause =
          'tool_type=? and tool_spec=? and tool_id=? and tool_status=? '
        if (types == 3) {
          servkit.ajax(
            {
              url: 'api/getdata/db',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                table: 'a_huangliang_tool_mp_list',
                whereClause: 'tool_id = ? and uselist_status != 99 ',
                whereParams: [tool_id_select],
              }),
            },
            {
              success(data) {
                const tableData = Object.values(
                  data.reduce((a, x) => {
                    const {
                      tool_id,
                      tsup_id,
                      tool_location,
                      buy_time,
                      use_qty,
                      tool_status,
                    } = x
                    const pks = `${tsup_id}_${tool_location}_${buy_time}`
                    const type = context.preCon.toolProfile.map((obj) => {
                      if (obj.tool_id === tool_id_select) {
                        return obj.tool_type
                      }
                    })
                    var type2 = _.filter(type, function (num) {
                      return num != null
                    })
                    const spec = context.preCon.toolProfile.map((obj) => {
                      if (obj.tool_id === tool_id_select) {
                        return obj.tool_spec
                      }
                    })
                    var spec2 = _.filter(spec, function (num) {
                      return num != null
                    })
                    const lcnArea = context.preCon.toolLocation.map((obj) => {
                      if (obj.tool_location === tool_location) {
                        return obj.location_area
                      }
                    })
                    var lcnArea2 = _.filter(lcnArea, function (num) {
                      return num != null
                    })

                    if (!a[pks]) {
                      a[pks] = {
                        tool_id,
                        tsup_id,
                        tool_location,
                        buy_time,
                        use_qty,
                        tool_status,
                        tool_type: type2[0],
                        tool_spec: spec2[0],
                        location_area: lcnArea2[0],
                      }
                    } else {
                      a[pks].use_qty += use_qty
                    }
                    return a
                  }, {})
                )
                context.editNumTable.drawTable(tableData)
              },
            }
          )
        } else {
          servkit.ajax(
            {
              url: 'api/getdata/db',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                table:
                  'a_huangliang_view_tool_stock_tool_profile_tool_location',
                whereClause,
                whereParams,
              }),
            },
            {
              success(data) {
                context.editNumTable.drawTable(data)
              },
            }
          )
        }
      },

      // 新增庫存到異動表
      initMoveTable() {
        const context = this
        const { $editNumMove } = context
        const editNumMove = (context.editNumMove = new window.Form(
          $editNumMove
        ))
        var value
        const columns = [
          {
            data: 'buy_time',
            name: 'buy_time',
            render(data) {
              return data ? data.toFormatedDate() : ''
            },
          },
          {
            data: 'tool_id',
            name: 'tool_id',
          },
          {
            data: 'tool_status',
            name: 'tool_status',
            render(data, type) {
              if (type === 'selectFilter' || type === 'display') {
                return context.toolStatusMap[data]
              } else {
                return data || ''
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
            data: 'tool_location',
            name: 'tool_location',
            render(data) {
              return data || ''
            },
          },
          {
            data: 'tool_stock',
            name: 'tool_stock',
            render(data) {
              return data ? data : '0'
            },
          },
          {
            data: 'chg_qty',
            name: 'chg_qty',
            width: '10%',
            render() {
              return `<form>
              <div class="input-group" style="width: 100%;">
                <input type="text" id="chg-qty-move" name="chg_qty_move" style="padding: 3px 5px;">
              </div>
              </form>`
            },
          },
          {
            data: 'location_area',
            name: 'location_area',
            render(data, type) {
              const modTitle = $('#modal-title').selector
              const title = $(modTitle).html()
              let types
              if (title == '刀具庫存異動-儲位調撥') {
                types = 0
              } else if (title == '刀具庫存異動-外借暫用') {
                types = 1
              } else if (title == '刀具庫存異動-數量調整') {
                types = 2
              } else if (title == '刀具庫存異動-回收入庫') {
                types = 3
              }
              if (types == 0) {
                return `<select type="text" name="location_area_mov" style="padding: 3px 5px;">
                  <option value="0"></option>
                  <option value="1">現場刀具庫</option>
                  <option value="2">備用刀具室</option>
                  <option value="3">廠外借用</option>
                </select>`
              } else if (types == 1) {
                value = context.locAreaSelect[data]
                if (value == '廠外借用') {
                  return `<select type="text" name="location_area_mov" style="padding: 3px 5px;">
                    <option value="0"></option>
                    <option value="1">現場刀具庫</option>
                    <option value="2">備用刀具室</option>
                  </select>`
                } else {
                  return '廠外借用'
                }
              } else {
                if (type === 'selectFilter' || type === 'display') {
                  return context.locAreaSelect[data]
                } else {
                  return data || ''
                }
              }
            },
          },
          {
            data: 'new_location',
            name: 'new_location',
            width: '10%',
            render(data, type, rowData) {
              // 如果今天是type=3
              const modTitle = $('#modal-title').selector
              const title = $(modTitle).html()
              let types
              if (title == '刀具庫存異動-儲位調撥') {
                types = 0
              } else if (title == '刀具庫存異動-外借暫用') {
                types = 1
              } else if (title == '刀具庫存異動-數量調整') {
                types = 2
              } else if (title == '刀具庫存異動-回收入庫') {
                types = 3
              }
              if (types == 3) {
                const lcn = context.preCon.toolProfile.map((obj) => {
                  if (obj.tool_id === rowData.tool_id) {
                    return obj.tool_recloc
                  }
                })
                var lcn2 = _.filter(lcn, function (num) {
                  return num != null
                })
                return lcn2[0]
              } else if (types == 0) {
                console.log(types)
                return `<select type="text" name="new_location_mov" style="padding: 3px 5px;"></select>`
              } else if (types == 1) {
                if (rowData.location_area == 3) {
                  // 如果儲存區域 是 場外藉用
                  return `<select type="text" name="new_location_mov" style="padding: 3px 5px;"></select>`
                } else {
                  if (rowData.tool_status == 'B') {
                    return `<select type="text" name="new_location_mov" style="padding: 3px 5px;">
                  ${context.preCon.toolLocationArea3B
                    .map(
                      (obj) =>
                        `<option value=${obj.tool_location}>${obj.tool_location}</option>`
                    )
                    .join('')}
                  </select>`
                  } else {
                    return `<select type="text" name="new_location_mov" style="padding: 3px 5px;">
                  ${context.preCon.toolLocationArea3N
                    .map(
                      (obj) =>
                        `<option value=${obj.tool_location}>${obj.tool_location}</option>`
                    )
                    .join('')}
                  </select>`
                  }
                }
              } else {
                if (rowData.tool_status == 'N') {
                  return `<select type="text" name="new_location_mov" style="padding: 3px 5px;">
                  ${context.preCon.toolLocationforN
                    .map(
                      (obj) =>
                        `<option value=${obj.tool_location}>${obj.tool_location}</option>`
                    )
                    .join('')}
                  </select>`
                } else if (rowData.tool_status == 'B') {
                  return `<select type="text" name="new_location_mov" style="padding: 3px 5px;">
                  ${context.preCon.toolLocationforB
                    .map(
                      (obj) =>
                        `<option value=${obj.tool_location}>${obj.tool_location}</option>`
                    )
                    .join('')}
                  </select>`
                }
              }
            },
          },
          {
            // 儲存(按鈕)
            data: null,
            name: 'save_chg',
            render() {
              return `<button class="btn btn-success saveChg">儲存</button>`
            },
          },
          {
            // 取消(按鈕)
            data: null,
            name: 'cancel_chg',
            render() {
              return `<button class="btn btn-cancel cancelChg">取消</button>`
            },
          },
        ]
        $editNumMove
          .on('click', '.cancelChg', function () {
            // 取消異動
            context.delete(this)
          })
          .on('click', '.saveChg', function () {
            // 儲存異動
            context.save(this)
          })
          .on('change', '[name=location_area_mov]', function () {
            // 儲存區域
            const modTitle = $('#modal-title').selector
            const title = $(modTitle).html()
            let types
            if (title == '刀具庫存異動-儲位調撥') {
              types = 0
            } else if (title == '刀具庫存異動-外借暫用') {
              types = 1
            } else if (title == '刀具庫存異動-數量調整') {
              types = 2
            } else if (title == '刀具庫存異動-回收入庫') {
              types = 3
            }
            if (types == 0) {
              const location_area_2 = this.value
              const tr = this.closest('tr')
              const toolLcn = tr.children.item(10).querySelector('select')
              const $toolLcn = $(toolLcn)

              // 判斷刀具堪用程度
              let toolLocationfor = tr.children.item(2).innerText
              if (toolLocationfor == '新刀') {
                toolLocationfor = 'N'
              } else if (toolLocationfor == '回收刀') {
                toolLocationfor = 'B'
              }
              const toolLocationList = context.preCon.toolLocation.reduce(
                (a, x) => {
                  if (x.location_area == location_area_2) {
                    if (x.tool_location_for == toolLocationfor) {
                      a.push(x.tool_location)
                    }
                  }
                  return a
                },
                []
              )
              servkit.initSelectWithList(toolLocationList, $toolLcn)
            } else if (types == 1) {
              const location_area_2 = this.value
              const tr = this.closest('tr')
              const toolLcn = tr.children.item(10).querySelector('select')
              const toolArea = tr.children.item(9).querySelector('select').value
              const toolId = tr.children.item(1).innerText
              const $toolLcn = $(toolLcn)

              // 判斷刀具堪用程度
              let toolLocationfor = tr.children.item(2).innerText
              if (toolLocationfor == '新刀') {
                toolLocationfor = 'N'
              } else if (toolLocationfor == '回收刀') {
                toolLocationfor = 'B'
              }
              if (toolArea == 1) {
                $toolLcn.addClass('hide')
                const newloc = tr.children.item(10)
                const lcn = context.preCon.toolProfile.map((obj) => {
                  if (obj.tool_id === toolId) {
                    if (toolLocationfor == 'N') {
                      return obj.tool_newloc
                    } else {
                      return obj.tool_recloc
                    }
                  }
                })
                var lcn2 = _.filter(lcn, function (num) {
                  return num != null
                })
                $(newloc).append("<div class='loc'></div>")
                $(newloc).find('.loc').append(lcn2[0])
              } else {
                const newloc = tr.children.item(10)
                $toolLcn.removeClass('hide')
                if ($(newloc).find('.loc')) {
                  $(newloc).find('.loc').remove()
                }
                const toolLocationList = context.preCon.toolLocation.reduce(
                  (a, x) => {
                    if (x.location_area == location_area_2) {
                      if (x.tool_location_for == toolLocationfor) {
                        a.push(x.tool_location)
                      }
                    }
                    return a
                  },
                  []
                )
                servkit.initSelectWithList(toolLocationList, $toolLcn)
              }
            }
          })
        var columnNameIndexMap = Object.fromEntries(
          columns.map(function (col, i) {
            return [col.name, i]
          })
        )
        var getColumnIndex = function getColumnIndex(colArr) {
          return colArr
            .map(function (name) {
              return columnNameIndexMap[name]
            })
            .sort()
        }

        context.editNumMove = createReportTable({
          showNoData: true,
          $tableElement: $editNumMove,
          autoWidth: false,
          order: [[3, 'desc']],
          columns,
          // onInit() {
          //   context.editNumMove.toggleViewMode = function (types) {
          //     var columnNameIndexMap = Object.fromEntries(columns.map((col, i) => [col.name, i]));
          //     var getColumnIndex = (colArr) => colArr.map(name => columnNameIndexMap[name]).sort();
          //     let isType = types.toString() == '3';
          //     let typesBy = Number(types)
          //     let visibleCols = isType ? [] : ['tool_status', 'tool_location', 'tool_stock',];
          //     let hideCols = isType ? ['tool_status', 'tool_location', 'tool_stock'] : [];
          //     switch (typesBy) {
          //       case 0:
          //         visibleCols.push('new_location');
          //         break;
          //       case 1:
          //         visibleCols.push('new_location');
          //         break;
          //       case 2:
          //         hideCols.push('new_location');
          //         break;
          //       case 3:
          //         visibleCols.push('new_location');
          //         break;
          //     }
          //     hideCols = getColumnIndex(hideCols);
          //     visibleCols = getColumnIndex(visibleCols);
          //     context.editNumMove.table
          //       .columns(visibleCols).visible(true)
          //       .columns(hideCols).visible(false)
          //       .draw(false)
          //   }
          // }
        })
        context.editNumMove.toggleViewMode = function (types) {
          var columnNameIndexMap = Object.fromEntries(
            columns.map((col, i) => [col.name, i])
          )
          var getColumnIndex = (colArr) =>
            colArr.map((name) => columnNameIndexMap[name]).sort()
          let isType = types.toString() == '3'
          let typesBy = Number(types)
          let visibleCols = isType
            ? []
            : ['tool_status', 'tool_location', 'tool_stock']
          let hideCols = isType
            ? ['tool_status', 'tool_location', 'tool_stock']
            : []
          switch (typesBy) {
            case 0:
              visibleCols.push('new_location')
              break
            case 1:
              visibleCols.push('new_location')
              break
            case 2:
              hideCols.push('new_location')
              break
            case 3:
              visibleCols.push('new_location')
              break
          }
          hideCols = getColumnIndex(hideCols)
          visibleCols = getColumnIndex(visibleCols)
          context.editNumMove.table
            .columns(visibleCols)
            .visible(true)
            .columns(hideCols)
            .visible(false)
            .draw(false)
        }
      },

      // 數量異動的下拉：刀具類型、刀具規格
      initToolTypeSelect($select) {
        const context = this
        servkit.initSelectWithList(
          ['', ...context.preCon.toolType],
          $select || context.$selectType,
          false
        )
      },
      initToolSpecSelect($select) {
        const context = this
        servkit.initSelectWithList(
          ['', ...context.preCon.toolSpec],
          $select || context.$selectSpec,
          false
        )
      },

      // 庫存間的跑動 新增.刪除.儲存
      add(dom) {
        // 1.取得當前按的新增Data
        // 2.put 多出來的欄位
        // 3.轉移一筆筆data
        // 4.render兩個table

        const context = this
        const tr = dom.closest('tr')
        const rowData = context.editNumTable.table.row(tr).data()
        if (rowData) {
          context.editNumTable.table.row(tr).remove().draw(false)
          context.editNumMove.table.rows.add([rowData]).draw(false)
        }
      },
      delete(dom) {
        const context = this
        const tr = dom.closest('tr')
        const rowData = context.editNumMove.table.row(tr).data()
        if (rowData) {
          context.editNumMove.table.row(tr).remove().draw(false)
          context.editNumTable.table.rows.add([rowData]).draw(false)
        }
      },
      save(dom) {
        // types
        const context = this
        const tr = dom.closest('tr')
        const rowData = context.editNumMove.table.row(tr).data()

        const modTitle = $(tr).find('#modal-title').selector
        const title = $(modTitle).html()

        const buy_time = rowData.buy_time.toFormatedDatetime()
        const tool_id = rowData.tool_id
        const tool_location = rowData.tool_location
        const tsup_name = context.preCon.supplier[rowData.tsup_id]
        const chg_remark = rowData.chg_remark
        const tool_status = rowData.tool_status
        var r = /^[0-9]*[1-9][0-9]*$/ //正整數
        let types = 0

        if (title == '刀具庫存異動-儲位調撥') {
          types = 0
        } else if (title == '刀具庫存異動-外借暫用') {
          types = 1
        } else if (title == '刀具庫存異動-數量調整') {
          types = 2
        } else if (title == '刀具庫存異動-回收入庫') {
          types = 3
        }

        if (types == 3) {
          const form = tr.querySelector('form')
          let saveBtns = tr.children.item(8).firstElementChild
          let cancelBtns = tr.children.item(9).firstElementChild
          const useQty = rowData.use_qty // // 領出總數
          const intQty = parseInt(useQty) // 數字型態的 領出總數
          const recycle = tr.children.item(5).querySelector('input').value // 回收異動數
          const intRecycle = parseInt(recycle)
          const new_location = tr.children.item(7).innerText
          let isint = r.test(recycle)

          if (intRecycle <= intQty && isint == true) {
            const requestMap = {
              buy_time: buy_time,
              tool_id: tool_id,
              tool_location: tool_location,
              tsup_name: tsup_name,
              chg_type: types,
              chg_remark: chg_remark,
              tool_status: 'B',
              new_location: new_location,
              chg_qty: intRecycle,
            }
            servkit.ajax(
              {
                url: 'api/huangliangToolStock/createRecoverCHG',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(requestMap),
              },
              {
                success() {
                  const saveSuccess = tr.children.item(8)
                  const inputValue = tr.children.item(5)
                  $(saveBtns).remove()
                  $(cancelBtns).remove()
                  $(form).remove()
                  $(inputValue).children('label.error').remove()
                  $(saveSuccess).append("<div style='color:green'>已儲存</div>")
                  $(inputValue).append(intRecycle)
                },
                fail() {
                  $(saveBtns).removeClass('disabled')
                  $(cancelBtns).removeClass('disabled')
                },
              }
            )
          } else {
            return $(form)
              .validate({
                rules: {
                  chg_qty_move: {
                    required: true,
                    recycle: true,
                    max: intQty,
                    min: -1,
                  },
                },
                messages: {
                  chg_qty_move: '需小於領出總數的正整數',
                },
                errorPlacement(error, $el) {
                  const $td = $el.closest('td')
                  $td.children('.error').remove()
                  $td.append(error)
                },
              })
              .form()
          }
        } else {
          // chgNum 異動數 orichgNum 原庫存
          const chgNum = tr.children.item(8).querySelector('input').value
          const orichgNum = tr.children.item(7).innerText
          let chgNumber = Number(chgNum)

          let orichgNumber = Number(orichgNum)
          let stockMin = orichgNumber * -1

          let isint = r.test(chgNumber)
          console.log(isint)
          const form = tr.querySelector('form')

          if (types == 1) {
            let saveBtns = tr.children.item(11).firstElementChild
            let cancelBtns = tr.children.item(12).firstElementChild
            let new_location
            const oriMinNumber = parseInt(orichgNumber) * -1
            var area3 = tr.children.item(9).innerText == '廠外借用'
            let locAreaSelect
            if (area3) {
              locAreaSelect = tr.children.item(9).innerText
              new_location = tr.children.item(10).querySelector('select').value
            } else {
              locAreaSelect = tr.children.item(9).querySelector('select').value
              if (locAreaSelect == 1) {
                new_location = tr.children.item(10).innerText
              } else {
                new_location = tr.children.item(10).querySelector('select')
                  .value
              }
            }
            if (
              isint == true &&
              orichgNumber + chgNumber >= 0 &&
              chgNumber != 0 &&
              oriMinNumber <= chgNumber &&
              chgNumber <= orichgNumber &&
              locAreaSelect != '0'
            ) {
              const a = tr.children.item(8)
              let length = $(a).children.length
              const errorbool = Number(length)
              if (errorbool > 1) {
                const error = tr.querySelector('label')
                $(error).remove()
              }
              const lcnErr = tr.children.item(10)
              const hasErr = $(lcnErr).find('div').hasClass('lcn_error') // 儲位錯誤的標籤
              // 儲位相同要擋
              if (new_location == tool_location) {
                if (hasErr) {
                  // 偵測有沒有標籤
                } else {
                  $(lcnErr).append(
                    "<div class='lcn_error' style='color:red'>不得與原儲位相同</div>"
                  )
                }
              } else {
                if (hasErr) {
                  $(lcnErr).find('div.lcn_error').remove()
                }
                $(saveBtns).addClass('disabled')
                $(cancelBtns).addClass('disabled')
                const requestMap = {
                  buy_time: buy_time,
                  tool_id: tool_id,
                  tool_location: tool_location,
                  tsup_name: tsup_name,
                  chg_type: types,
                  chg_remark: chg_remark,
                  tool_status: tool_status,
                  chg_qty: chgNumber,
                  new_location: new_location,
                }
                console.log(requestMap)
                servkit.ajax(
                  {
                    url: 'api/huangliangToolStock/createBorrowCHG',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(requestMap),
                  },
                  {
                    success(data) {
                      console.log(data)
                      const saveSuccess = tr.children.item(11)
                      const inputValue = tr.children.item(8)
                      const lcnForm = tr.children
                        .item(10)
                        .querySelector('select')
                      const lcnValue = tr.children.item(10)
                      $(saveBtns).remove()
                      $(cancelBtns).remove()
                      $(form).remove()
                      $(lcnForm).remove()
                      if (area3 == false) {
                        const lcnAreaForm = tr.children
                          .item(9)
                          .querySelector('select')
                        const lcnAreaFormV = tr.children.item(9)
                        const lcnAreaValue = tr.children
                          .item(9)
                          .querySelector('select').value
                        let lcnArea = ''
                        if (lcnAreaValue == '1') {
                          lcnArea = '現場刀具庫'
                        } else if (lcnAreaValue == '2') {
                          lcnArea = '備用刀具室'
                          $(lcnValue).append(new_location)
                        }
                        $(lcnAreaForm).remove()
                        $(lcnAreaFormV).append(lcnArea)
                      } else {
                        $(lcnValue).append(new_location)
                      }
                      $(saveSuccess).append(
                        "<div style='color:green'>已儲存</div>"
                      )
                      $(inputValue).append(chgNumber)
                    },
                    fail() {
                      $(saveBtns).removeClass('disabled')
                      $(cancelBtns).removeClass('disabled')
                    },
                  }
                )
              }
            } else {
              const lcnErr = tr.children.item(10)
              const hasErr = $(lcnErr).find('div').hasClass('lcn_error')
              if (new_location == tool_location) {
                if (hasErr == false) {
                  $(lcnErr).append(
                    "<div class='lcn_error' style='color:red'>儲位錯誤</div>"
                  )
                }
              } else {
                if (hasErr) {
                  $(lcnErr).find('div.lcn_error').remove()
                }
              }
              return $(form)
                .validate({
                  rules: {
                    chg_qty_move: {
                      required: true,
                      isIntNEqZero: true,
                      recycle: true,
                      min: stockMin,
                      max: orichgNumber,
                    },
                    location_area_mov: {
                      required: true,
                      valueNotEquals: '0',
                    },
                  },
                  messages: {
                    chg_qty_move: '輸入錯誤',
                    location_area_mov: '請選擇調撥區域',
                  },

                  errorPlacement(error, $el) {
                    const $td = $el.closest('td')
                    $td.children('.error').remove()
                    $td.append(error)
                  },
                })
                .form()
            }
          } else if (types == 2) {
            //數量調整
            let saveBtns = tr.children.item(10).firstElementChild
            let cancelBtns = tr.children.item(11).firstElementChild
            let lcnSel = tr.children.item(10).querySelector('select')
            $(lcnSel).addClass('hide')
            let isint = r.test(chgNum)
            if (
              isint == true &&
              orichgNumber + chgNumber >= 0 &&
              chgNumber != 0
            ) {
              const a = tr.children.item(8) // 偵測是否讓按鈕變成disabled
              let length = $(a).children.length
              const errorbool = Number(length)
              if (errorbool > 1) {
                const error = tr.querySelector('label')
                $(error).remove()
              }
              $(saveBtns).addClass('disabled')
              $(cancelBtns).addClass('disabled')
              const requestMap = {
                buy_time: buy_time,
                tool_id: tool_id,
                tool_location: tool_location,
                tsup_name: tsup_name,
                chg_type: types,
                chg_remark: chg_remark,
                tool_status: tool_status,
                chg_qty: chgNumber,
              }
              servkit.ajax(
                {
                  url: 'api/huangliangToolStock/createQtyCHG',
                  type: 'POST',
                  contentType: 'application/json',
                  data: JSON.stringify(requestMap),
                },
                {
                  success() {
                    const saveSuccess = tr.children.item(10)
                    const inputValue = tr.children.item(8)
                    $(saveBtns).remove()
                    $(cancelBtns).remove()
                    $(form).remove()
                    $(saveSuccess).append(
                      "<div style='color:green'>已儲存</div>"
                    )
                    $(inputValue).append(chgNumber)
                  },
                  fail() {
                    $(saveBtns).removeClass('disabled')
                    $(cancelBtns).removeClass('disabled')
                  },
                }
              )
            } else {
              return $(form)
                .validate({
                  rules: {
                    chg_qty_move: {
                      required: true,
                      isIntNEqZero: true,
                      min: stockMin,
                    },
                  },
                  messages: {
                    chg_qty_move: '輸入錯誤',
                  },
                  errorPlacement(error, $el) {
                    const $td = $el.closest('td')
                    $td.children('.error').remove()
                    $td.append(error)
                  },
                })
                .form()
            }
          } else if (types == 0) {
            // 儲位調撥
            let saveBtns = tr.children.item(11).firstElementChild
            let cancelBtns = tr.children.item(12).firstElementChild
            const new_location = tr.children.item(10).querySelector('select')
              .value
            const oriMinNumber = parseInt(orichgNumber) * -1
            const locAreaSelect = tr.children.item(9).firstElementChild.value
            let isint = r.test(chgNum)
            if (
              isint == true &&
              orichgNumber + chgNumber >= 0 &&
              chgNumber != 0 &&
              oriMinNumber <= chgNumber &&
              chgNumber <= orichgNumber &&
              locAreaSelect != '0'
            ) {
              const a = tr.children.item(8)
              let length = $(a).children.length
              const errorbool = Number(length)
              if (errorbool > 1) {
                const error = tr.querySelector('label')
                $(error).remove()
              }
              const lcnErr = tr.children.item(10)
              const hasErr = $(lcnErr).find('div').hasClass('lcn_error') // 儲位錯誤的標籤
              // 儲位相同要擋
              if (new_location == tool_location) {
                if (hasErr) {
                  // 偵測有沒有標籤
                  // console.log('hi') // 什麼都不做
                } else {
                  $(lcnErr).append(
                    "<div class='lcn_error' style='color:red'>不得與原儲位相同</div>"
                  )
                }
              } else {
                if (hasErr) {
                  $(lcnErr).find('div.lcn_error').remove()
                }
                $(saveBtns).addClass('disabled')
                $(cancelBtns).addClass('disabled')
                const requestMap = {
                  buy_time: buy_time,
                  tool_id: tool_id,
                  tool_location: tool_location,
                  tsup_name: tsup_name,
                  chg_type: types,
                  chg_remark: chg_remark,
                  tool_status: tool_status,
                  chg_qty: chgNumber,
                  new_location: new_location,
                }
                servkit.ajax(
                  {
                    url: 'api/huangliangToolStock/createLocationCHG',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(requestMap),
                  },
                  {
                    success() {
                      // console.log(data)
                      const saveSuccess = tr.children.item(11)
                      const inputValue = tr.children.item(8)
                      const lcnForm = tr.children
                        .item(10)
                        .querySelector('select')
                      const lcnValue = tr.children.item(10)
                      const lcnAreaForm = tr.children
                        .item(9)
                        .querySelector('select')
                      const lcnAreaFormV = tr.children.item(9)
                      const lcnAreaValue = tr.children
                        .item(9)
                        .querySelector('select').value
                      let lcnArea = ''
                      if (lcnAreaValue == '1') {
                        lcnArea = '現場刀具庫'
                      } else if (lcnAreaValue == '2') {
                        lcnArea = '備用刀具室'
                      } else if (lcnAreaValue == '3') {
                        lcnArea = '廠外借用'
                      }
                      $(saveBtns).remove()
                      $(cancelBtns).remove()
                      $(form).remove()
                      $(lcnForm).remove()
                      $(lcnAreaForm).remove()
                      $(lcnAreaFormV).append(lcnArea)
                      $(saveSuccess).append(
                        "<div style='color:green'>已儲存</div>"
                      )
                      $(inputValue).append(chgNumber)
                      $(lcnValue).append(new_location)
                    },
                    fail() {
                      $(saveBtns).removeClass('disabled')
                      $(cancelBtns).removeClass('disabled')
                    },
                  }
                )
              }
            } else {
              const lcnErr = tr.children.item(10)
              const hasErr = $(lcnErr).find('div').hasClass('lcn_error')
              if (new_location == tool_location) {
                if (hasErr) {
                  // console.log('hi')
                } else {
                  $(lcnErr).append(
                    "<div class='lcn_error' style='color:red'>儲位錯誤</div>"
                  )
                }
              } else {
                if (hasErr) {
                  $(lcnErr).find('div.lcn_error').remove()
                }
              }
              return $(form)
                .validate({
                  rules: {
                    chg_qty_move: {
                      required: true,
                      isIntNEqZero: true,
                      recycle: true,
                      min: stockMin,
                      max: orichgNumber,
                    },
                    location_area_mov: {
                      required: true,
                      valueNotEquals: '0',
                    },
                  },
                  messages: {
                    chg_qty_move: '輸入錯誤',
                    location_area_mov: '請選擇調撥區域',
                  },

                  errorPlacement(error, $el) {
                    const $td = $el.closest('td')
                    $td.children('.error').remove()
                    $td.append(error)
                  },
                })
                .form()
            }
          }
        }
      },

      // 庫存送出前的檢查 數字部分
      initValidator() {
        $.validator.addMethod(
          'isIntNEqZero',
          function (value, element, params) {
            value = parseInt(value)
            return this.optional(element) || value != 0
          },
          '異動數不得為零'
        )
        $.validator.addMethod(
          'recycle',
          function (value, element, params) {
            return this.optional(element) || /^[1-9]\d*$/.test(value)
          },
          '請輸入正整數'
        )
        $.validator.addMethod(
          'valueNotEquals',
          function (value, element, arg) {
            return arg !== value
          },
          ''
        )
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
      toolType(done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_huangliang_tool_type',
            }),
          },
          {
            success(data) {
              done(_.pluck(data, 'tool_type'))
            },
          }
        )
      },
      // toolSpec (done) {
      //   servkit.ajax({
      //     url: 'api/getdata/db',
      //     type: 'POST',
      //     contentType: 'application/json',
      //     data: JSON.stringify({
      //       table: 'a_huangliang_tool_profile',
      //       // whereClause: 'is_open = ?',
      //       // whereParams: ['Y']
      //     })
      //   }, {
      //     success (data) {
      //       done(_.pluck(data, 'tool_spec'));
      //     }
      //   });
      // },
      toolLocation(done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_huangliang_tool_location',
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
      // toolLocationforN (done) {
      //   servkit.ajax({
      //     url: 'api/getdata/db',
      //     type: 'POST',
      //     contentType: 'application/json',
      //     data: JSON.stringify({
      //       table: 'a_huangliang_tool_location',
      //       whereClause: 'is_open = ? and tool_location_for=?',
      //       whereParams: ['Y', 'N']
      //     })
      //   }, {
      //     success (data) {
      //       done(data);
      //     }
      //   });
      // },
      // toolLocationforB (done) {
      //   servkit.ajax({
      //     url: 'api/getdata/db',
      //     type: 'POST',
      //     contentType: 'application/json',
      //     data: JSON.stringify({
      //       table: 'a_huangliang_tool_location',
      //       whereClause: 'is_open = ? and tool_location_for=?',
      //       whereParams: ['Y', 'B']
      //     })
      //   }, {
      //     success (data) {
      //       done(data);
      //     }
      //   });
      // },
      // toolLocationArea12N (done) { // 新刀的廠為借用 儲位
      //   servkit.ajax({
      //     url: 'api/getdata/db',
      //     type: 'POST',
      //     contentType: 'application/json',
      //     data: JSON.stringify({
      //       table: 'a_huangliang_tool_location',
      //       whereClause: 'is_open = ? and tool_location_for=?and location_area in (1,2)',
      //       whereParams: ['Y', 'N']
      //     })
      //   }, {
      //     success (data) {
      //       done(data);
      //     }
      //   });
      // },
      // toolLocationArea12B (done) { // 新刀的廠為借用 儲位
      //   servkit.ajax({
      //     url: 'api/getdata/db',
      //     type: 'POST',
      //     contentType: 'application/json',
      //     data: JSON.stringify({
      //       table: 'a_huangliang_tool_location',
      //       whereClause: 'is_open = ? and tool_location_for=?and location_area in (1,2)',
      //       whereParams: ['Y', 'B']
      //     })
      //   }, {
      //     success (data) {
      //       done(data);
      //     }
      //   });
      // },
      // toolLocationArea3N (done) { // 新刀的廠為借用 儲位
      //   servkit.ajax({
      //     url: 'api/getdata/db',
      //     type: 'POST',
      //     contentType: 'application/json',
      //     data: JSON.stringify({
      //       table: 'a_huangliang_tool_location',
      //       whereClause: 'is_open = ? and tool_location_for=?and location_area=?',
      //       whereParams: ['Y', 'N', '3']
      //     })
      //   }, {
      //     success (data) {
      //       done(data);
      //     }
      //   });
      // },
      // toolLocationArea3B (done) { // 新刀的廠為借用 儲位
      //   servkit.ajax({
      //     url: 'api/getdata/db',
      //     type: 'POST',
      //     contentType: 'application/json',
      //     data: JSON.stringify({
      //       table: 'a_huangliang_tool_location',
      //       whereClause: 'is_open = ? and tool_location_for=?and location_area=?',
      //       whereParams: ['Y', 'B', '3']
      //     })
      //   }, {
      //     success (data) {
      //       done(data);
      //     }
      //   });
      // },
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
    ],
  })
}
