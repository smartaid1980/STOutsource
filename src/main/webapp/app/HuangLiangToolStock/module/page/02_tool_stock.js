export default function () {
  GoGoAppFun({
    gogo(context) {
      context.initQueryConditionForm()
      context.initQueryResultTable()
    },
    util: {
      $submitBtn: $('#submit-btn'),
      $clearBtn: $('#clear-btn'),
      $toolTypeSelect: $('#tool-type'),
      $toolLocation: $('#tool-location'),
      $locationArea: $('#location-area'),
      $typeForSelect: $('#type-for'),
      $toolId: $('#tool-id'),
      $toolSpec: $('#tool-spec'),
      $queryConditionForm: $('#query-condition-form'),
      $queryResultTable: $('#query-result-table'),
      queryResultTable: null,
      locationAreaMap: {
        1: '現場刀具庫',
        2: '備用刀具室',
        3: '廠外借用',
      },
      toolStatusMap: {
        N: '新刀',
        B: '回收刀',
      },
      initQueryConditionForm() {
        const context = this
        const {
          $submitBtn,
          $queryConditionForm,
          $toolTypeSelect,
          $typeForSelect,
          typeForList,
          locationAreaMap,
          $locationArea,
          $toolLocation,
          $toolId,
          $toolSpec,
          $clearBtn,
        } = context
        const toolTypeSet = new Set(context.preCon.toolType)
        let toolIdList = []
        let toolSpecSet = new Set()
        let toolSpecList

        context.preCon.toolProfile.forEach((data) => {
          if (toolTypeSet.has(data.tool_type)) {
            toolIdList.push(data.tool_id)
            toolSpecSet.add(data.tool_spec)
          }
        })

        toolSpecList = Array.from(toolSpecSet).sort()

        context.queryConditionForm = new window.Form($queryConditionForm)
        servkit.initSelectWithList(
          ['', ...context.preCon.toolType],
          $toolTypeSelect
        )
        servkit.initSelectWithList(
          context.preCon.map.typeForMap,
          $typeForSelect
        )
        servkit.initSelectWithList(locationAreaMap, $locationArea)
        servkit.initSelectWithList(
          _.pluck(context.preCon.toolLocation, 'tool_location'),
          $toolLocation
        )
        $toolId.autocomplete({
          source: toolIdList,
          minLength: 3,
        })
        $toolSpec.select2({
          minimumInputLength: 0,
          width: '100%',
          placeholder: '先選擇刀具類型以提供篩選結果', // select裡一定要有一個option才會出現，用空值的option
        })
        $toolSpec.select2('val', null)
        const els = context.queryConditionForm.elements
        els.tool_id.$element = $(els.tool_id.element)
        els.tool_id.reset = function () {
          this.$element.select2('val', null)
        }
        els.tool_spec.$element = $(els.tool_spec.element)
        els.tool_spec.reset = function () {
          this.$element.select2('val', null)
        }
        els.tool_status.reset = function () {
          Object.values(this.elements).forEach((el) => (el.checked = true))
        }
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

        servkit.validateForm($queryConditionForm, $submitBtn)
        $submitBtn.on('click', function (e) {
          e.preventDefault()
          context.getStock()
        })
        $clearBtn.on('click', function (e) {
          e.preventDefault()
          context.queryConditionForm.reset()
        })
      },
      initQueryResultTable() {
        const context = this
        const { $queryResultTable } = context
        const columns = [
          {
            data: 'type_for',
            name: 'type_for',
            render(data, type) {
              if (type === 'selectFilter' || type === 'display') {
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
              if (type === 'selectFilter' || type === 'display') {
                return context.preCon.supplier[data] || data
              } else {
                return data || ''
              }
            },
          },
          {
            data: 'tool_status',
            name: 'tool_status',
            render(data, type) {
              if (type === 'selectFilter' || type === 'display') {
                return context.toolStatusMap[data] || data
              } else {
                return data || ''
              }
            },
          },
          {
            data: 'location_area',
            name: 'location_area',
            render(data, type) {
              if (type === 'selectFilter' || type === 'display') {
                return context.locationAreaMap[data]
              } else {
                return data || ''
              }
            },
          },
          {
            data: 'tool_location',
            name: 'tool_location',
          },
          {
            data: 'tool_stock',
            name: 'tool_stock',
          },
          {
            data: 'use_mark',
            name: 'use_mark',
          },
        ]
        window.qrt = context.queryResultTable = createReportTable({
          $tableElement: $queryResultTable,
          $tableWidget: $('#query-result-widget'),
          autoWidth: false,
          order: [[1, 'asc']],
          // checkbox: true,
          columns,
          excel: {
            fileName: '刀具庫存',
            format: [
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
        })
      },
      getStock() {
        const context = this
        const {
          $toolTypeSelect,
          $toolLocation,
          $locationArea,
          $typeForSelect,
          $toolId,
          $toolSpec,
          $queryConditionForm,
        } = context
        const tool_id = $toolId.val()
        const tool_type = $toolTypeSelect.val()
        const type_for = $typeForSelect.val()
          ? $typeForSelect.val().filter((v) => v !== 'ALL')
          : ''
        const tool_spec = $toolSpec.val()
        const tool_location = $toolLocation.val()
          ? $toolLocation.val().filter((v) => v !== 'ALL')
          : ''
        const location_area = $locationArea.val()
          ? $locationArea.val().filter((v) => v !== 'ALL')
          : ''
        const tool_status = $queryConditionForm
          .find('[name=tool_status]:checked')
          .toArray()
          .map((el) => el.value)
        const whereParams = ['Y', 'Y']

        // 刀具編碼以及刀具類型都要啟用而且加總庫存數要大於零
        let whereClause =
          'tool_stock > 0 AND tool_profile_is_open = ? AND tool_type_is_open = ?'

        if (tool_id) {
          whereClause += ' AND tool_id = ?'
          whereParams.push(tool_id)
        }
        if (tool_type) {
          whereClause += ' AND tool_type = ?'
          whereParams.push(tool_type)
        }
        if (tool_spec) {
          whereClause += ' AND tool_spec = ?'
          whereParams.push(tool_spec)
        }
        if (tool_location && tool_location.length) {
          whereClause += ` AND tool_location IN (${tool_location
            .map(() => '?')
            .join(',')})`
          whereParams.push(...tool_location)
        }
        if (type_for && type_for.length) {
          whereClause += ` AND type_for IN (${type_for
            .map(() => '?')
            .join(',')})`
          whereParams.push(...type_for)
        }
        if (location_area && location_area.length) {
          whereClause += ` AND location_area IN (${location_area
            .map(() => '?')
            .join(',')})`
          whereParams.push(...location_area)
        }
        if (tool_status && tool_status.length) {
          whereClause += ` AND tool_status IN (${tool_status
            .map(() => '?')
            .join(',')})`
          whereParams.push(...tool_status)
        }

        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_huangliang_view_tool_stock',
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
