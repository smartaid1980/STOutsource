export default function () {
  GoGoAppFun({
    gogo(context) {
      context.initAuth()
      context.initCrudTable()
      context.initEditPriceTable()
    },
    util: {
      $toolType: $('#tool-type'),
      $newToolLocation: $('#tool_newloc'),
      $recycleToolLocation: $('#tool_recloc'),
      $editPriceTable: $('#edit-price-table'),
      userAuth: {},
      initAuth() {
        const context = this
        const loginInfo = JSON.parse(window.sessionStorage.getItem('loginInfo'))
        const userGroup = loginInfo.user_group || []
        const canCreateToolGroupList = ['sys_manager_group', 'tool_stock']
        const canEditToolGroupList = canCreateToolGroupList
        const canEditToolPriceGroupList = canCreateToolGroupList
        const canCreateTool =
          userGroup.findIndex((group) =>
            canCreateToolGroupList.includes(group)
          ) >= 0
        const canEditTool =
          userGroup.findIndex((group) =>
            canEditToolGroupList.includes(group)
          ) >= 0
        const canEditToolPrice =
          userGroup.findIndex((group) =>
            canEditToolPriceGroupList.includes(group)
          ) >= 0
        Object.assign(context.userAuth, {
          canCreateTool,
          canEditTool,
          canEditToolPrice,
        })
      },
      initDataTablePipeline() {
        const context = this

        $.fn.dataTable.pipeline = (opts, requestParam, customCallback) => {
          // Configuration options
          const conf = $.extend(
            {
              pages: 5, // number of pages to cache
              url: '', // script url
              data: null, // function or object with parameters to send to the server, matching how `ajax.data` works in DataTables
              method: 'GET', // Ajax HTTP method
            },
            opts
          )

          // Private variables for storing the cache
          let cacheLower = -1
          let cacheUpper = null
          let cacheLastRequest = null
          let cacheLastJson = null

          return (request, drawCallback, settings) => {
            let isAjax
            let requestStart = request.start
            let drawStart = request.start
            let requestLength = request.length
            let requestEnd = requestStart + requestLength

            const isFirstRequest = cacheLower < 0
            const isRequestOutOfCached =
              requestStart < cacheLower || requestEnd > cacheUpper
            // Properties changed. Ordering, Searching, Columns.
            const isOrderChanged = cacheLastRequest
              ? JSON.stringify(request.order) !==
                JSON.stringify(cacheLastRequest.order)
              : false
            const isColumnsChanged = cacheLastRequest
              ? JSON.stringify(request.columns) !==
                JSON.stringify(cacheLastRequest.columns)
              : false
            const isSearchChanged = cacheLastRequest
              ? JSON.stringify(request.search) !==
                JSON.stringify(cacheLastRequest.search)
              : false

            if (settings.clearCache) {
              // API requested that the cache be cleared
              isAjax = true
              settings.clearCache = false
            } else if (isFirstRequest || isRequestOutOfCached) {
              isAjax = true
            } else if (isOrderChanged || isColumnsChanged || isSearchChanged) {
              isAjax = true
            } else {
              isAjax = false
            }

            // Store the request for checking next time around
            cacheLastRequest = $.extend(true, {}, request)

            if (isAjax) {
              // 向後端要資料：查詢條件超過範圍、排序改變、過濾條件改變、第一次查詢、欄位變動、強制重繪
              if (requestStart < cacheLower) {
                requestStart = requestStart - requestLength * (conf.pages - 1)

                if (requestStart < 0) {
                  requestStart = 0
                }
              }

              cacheLower = requestStart
              cacheUpper = requestStart + requestLength * conf.pages

              request.start = requestStart
              request.length = requestLength * conf.pages
              Object.assign(request, requestParam)

              // Provide the same `data` options as DataTables.
              if (typeof conf.data === 'function') {
                // As a function it is executed with the data object as an arg
                // for manipulation. If an object is returned, it is used as the
                // data object to submit
                const d = conf.data(request)
                if (d) {
                  $.extend(request, d)
                }
              } else if ($.isPlainObject(conf.data)) {
                // As an object, the data given extends the default
                $.extend(request, conf.data)
              }

              settings.jqXHR = $.ajax({
                type: conf.method,
                url: conf.url,
                data: conf.method === 'GET' ? request : JSON.stringify(request),
                contentType: 'application/json',
                dataType: 'json',
                cache: false,
                success(data) {
                  const json = data.data
                  cacheLastJson = $.extend(true, {}, json)

                  if (cacheLower !== drawStart) {
                    json.data.splice(0, drawStart - cacheLower)
                  }
                  if (requestLength >= -1) {
                    json.data.splice(requestLength, json.data.length)
                  }
                  drawCallback(json)
                  if (customCallback) {
                    customCallback(json)
                  }
                },
              })
            } else if (context.toolProfileTable.isDrawWithCache) {
              // 用緩存的資料畫
              const json = $.extend(true, {}, cacheLastJson)
              json.draw = request.draw // Update the echo for each response
              json.data.splice(0, requestStart - cacheLower)
              json.data.splice(requestLength, json.data.length)
              drawCallback(json)
            } else {
              // 手動改變表格資料，從tableAPI取得資料，需塞回緩存，不然換頁再回來還是沒有改變；Update / Create會走到這邊，因為建完沒有再向後端要資料
              // TODO: Update後，crudTable會塞入selectOptions，但是是用目前顯示頁面的資料，需要改變crudTable
              const currentPageData = context.toolProfileTable.table
                .rows({ page: 'current' })
                .data()
                .toArray()
              const { pk } = conf
              const newCreateData = currentPageData.filter(
                (data) => data.isNewCreate
              )
              const currentPageDataMap = _.indexBy(currentPageData, pk)
              const { data: cachedData } = cacheLastJson
              const pagingData = []
              cachedData.forEach((data) => {
                if (
                  Object.prototype.hasOwnProperty.call(
                    currentPageDataMap,
                    data[pk]
                  )
                ) {
                  Object.assign(data, currentPageDataMap[data[pk]])
                  pagingData.push(data)
                }
              })
              pagingData.push(...newCreateData)
              drawCallback(
                Object.assign({}, cacheLastJson, {
                  data: pagingData,
                  draw: request.draw,
                })
              )
            }
          }
        }

        // Register an API method that will empty the pipelined data, forcing an Ajax
        // fetch on the next draw (i.e. `table.clearPipeline().draw()`)
        $.fn.dataTable.Api.register('clearPipeline()', function () {
          return this.iterator('table', function (settings) {
            settings.clearCache = true
          })
        })
        // $.fn.dataTable.Api.register('changeIsDrawWithCache', function () {
        //   return this.iterator('table', function (settings) {
        //     settings.isDrawWithCache = !settings.isDrawWithCache;
        //   })
        // });
      },
      initCrudTable() {
        const context = this
        const {
          $toolType,
          $newToolLocation,
          $recycleToolLocation,
          userAuth,
        } = context
        const hideCols = userAuth.canEditToolPrice ? [] : [8]
        const newToolLocationList = context.preCon.toolLocation.N.filter(
          (d) => d[1] === 'Y'
        ).map((ar) => ar[0])
        const recycleToolLocationList = context.preCon.toolLocation.B.filter(
          (d) => d[1] === 'Y'
        ).map((ar) => ar[0])

        servkit.initSelectWithList(
          Object.keys(context.preCon.toolType),
          $toolType
        )
        servkit.initSelectWithList(newToolLocationList, $newToolLocation)
        servkit.initSelectWithList(
          recycleToolLocationList,
          $recycleToolLocation
        )
        $newToolLocation.select2({
          minimumInputLength: 0,
          width: '100%',
        })
        $recycleToolLocation.select2({
          minimumInputLength: 0,
          width: '100%',
        })

        const validateToolSpecType = (td, table) => {
          const form = td.closest('form')
          const currToolSpec = form.querySelector('[name=tool_spec]').value
          const currToolType = form.querySelector('[name=tool_type]').value
          const currToolTool = form.querySelector('[name=tool_id]').value
          const isCreate = form.getAttribute('stk-create') === 'true'
          // const isDuplicate = table.data().toArray().findIndex(rowData => {
          //   const {
          //     tool_spec,
          //     tool_type,
          //     tool_id
          //   } = rowData;
          //   return tool_spec === currToolSpec && tool_type === currToolType && (isCreate || tool_id !== currToolTool);
          // }) >= 0;
          return new Promise((res) => {
            let whereClause = 'tool_spec = ? AND tool_type = ?'
            let whereParams = [currToolSpec, currToolType]
            if (!isCreate) {
              whereClause += ' AND tool_id <> ?'
              whereParams.push(currToolTool)
            }
            servkit.ajax(
              {
                url: 'api/getdata/db',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                  table: 'a_huangliang_tool_profile',
                  columns: ['tool_id'],
                  whereClause,
                  whereParams,
                }),
              },
              {
                success(data) {
                  res(data.length ? '此刀具類型規格已有其他刀具編碼' : '')
                },
              }
            )
          })
        }
        const columns = [
          {
            data: 'tool_id',
            name: 'tool_id',
            render(data) {
              return data || ''
            },
          },
          {
            data: 'tool_type',
            name: 'tool_type',
            render(data) {
              return data || ''
            },
          },
          {
            data: 'tool_spec',
            name: 'tool_spec',
            render(data) {
              return data || ''
            },
          },
          {
            data: 'tool_ss',
            name: 'tool_ss',
            render(data) {
              return data === 0 ? 0 : data || ''
            },
          },
          {
            data: 'use_mark',
            name: 'use_mark',
            render(data) {
              return data || ''
            },
          },
          {
            data: 'tool_newloc',
            name: 'tool_newloc',
            render(data) {
              return data || ''
            },
          },
          {
            data: 'tool_recloc',
            name: 'tool_recloc',
            render(data) {
              return data || ''
            },
          },
          {
            data: null,
            name: 'edit_price_btn',
            render(data, type, rowData) {
              const { tool_id } = rowData
              return `<button class="btn btn-primary edit-price-btn" data-tool_id="${tool_id}">單價維護</button>`
            },
          },
          {
            data: 'is_open',
            name: 'is_open',
            render(data, type) {
              if (type === 'display') {
                return `<span class='label label-${
                  data === 'Y' ? 'success' : 'default'
                }'>${data === 'Y' ? 'ON' : 'OFF'}</span>`
              } else {
                return data
              }
            },
          },
        ]
        const selectColumn = $('#stk-table')
          .find('thead>tr:nth-child(1)>th')
          .toArray()
          .reduce((a, x, i) => {
            if ($(x).find('select').length) {
              a.push(i)
            }
            return a
          }, [])
          .map((index) => columns[index].name)
        context.initDataTablePipeline()
        context.toolProfileTable = servkit.crudtable({
          tableModel:
            'com.servtech.servcloud.app.model.huangliang_tool.ToolProfile',
          tableSelector: '#stk-table',
          modal: {
            id: '#edit-tool-property-modal',
          },
          columns,
          hideCols,
          create: {
            unavailable: !userAuth.canCreateTool,
            url: 'api/stdcrud',
            start(form, table) {
              context.$toolType[0].disabled = false
              $newToolLocation.select2('val', null)
              $recycleToolLocation.select2('val', null)
              context.toolProfileTable.isDrawWithCache = false
            },
            send() {
              return {
                isNewCreate: true,
              }
            },
            end: {
              6(td, formData) {
                return formData.tool_newloc
              },
              7(td, formData) {
                return formData.tool_recloc
              },
              9(td, formData) {
                return formData.is_open
              },
            },
            finalDo() {
              context.toolProfileTable.isDrawWithCache = true
            },
          },
          read: {
            url: 'api/stdcrud',
            preventReadAtFirst: true,
            // dataset: 500,
          },
          update: {
            unavailable: !userAuth.canEditTool,
            url: 'api/stdcrud',
            start: {
              2(oldTd, newTd, oldTr, newTr, table) {
                const select = newTd.querySelector('select')
                const value = table.cell(oldTd).data()
                select.disabled = true
                select.value = value
              },
              6(oldTd, newTd, oldTr, newTr, table) {
                const value = table.cell(oldTd).data()
                $newToolLocation.select2('val', value)
              },
              7(oldTd, newTd, oldTr, newTr, table) {
                const value = table.cell(oldTd).data()
                $recycleToolLocation.select2('val', value)
              },
            },
            end: {
              6(td, formData) {
                context.toolProfileTable.isDrawWithCache = false
                return formData.tool_newloc
              },
              7(td, formData) {
                return formData.tool_recloc
              },
              9(td, formData) {
                return formData.is_open
              },
            },
            finalDo() {
              context.toolProfileTable.isDrawWithCache = true
            },
          },
          delete: {
            unavailable: true,
          },
          validate: {
            entityPkErrorMsg: '刀具編碼已存在',
            entityPk(tdList) {
              return tdList[0].querySelector('input').value
            },
            async: {
              pk(entityPkValue) {
                return new Promise((res) => {
                  servkit.ajax(
                    {
                      url: 'api/getdata/db',
                      type: 'POST',
                      contentType: 'application/json',
                      data: JSON.stringify({
                        table: 'a_huangliang_tool_profile',
                        whereClause: 'tool_id = ?',
                        columns: ['tool_id'],
                        whereParams: [entityPkValue],
                      }),
                    },
                    {
                      success(data) {
                        res(!!data.length)
                      },
                    }
                  )
                })
              },
              2(td, table) {
                return validateToolSpecType(td, table)
              },
              3(td, table) {
                return validateToolSpecType(td, table)
              },
            },
            1(td, table) {
              const input = td.querySelector('input')
              const tool_type = td
                .closest('form')
                .querySelector('[name=tool_type]').value
              const tool_id = input.value
              const type_rule = tool_id.slice(0, 2)
              const isEqual =
                context.preCon.toolType[tool_type].type_rule === type_rule
              if (!isEqual) {
                return `編碼規則"${type_rule}"與刀具類型設定"${context.preCon.toolType[tool_type].type_rule}"不一致`
              }
            },
          },
          onDraw(tableData, pageData, api) {
            let rowData
            // 防止沒資料顯示的情況(還是會有一行空白行)
            if (api.data().length) {
              api
                .rows()
                .nodes()
                .toArray()
                .forEach((el) => {
                  rowData = api.row(el).data()
                  el.setAttribute('stk-db-id', rowData.tool_id)
                  $(el).data('rowData', rowData)
                })
            }
          },
          serverSide: true, // 加上serverSide才可以用ajax畫
          ajax: $.fn.dataTable.pipeline(
            {
              url: 'api/stdcrud/paging',
              method: 'POST',
              pk: 'tool_id',
            },
            {
              tableModel:
                'com.servtech.servcloud.app.model.huangliang_tool.ToolProfile',
              tableName: 'a_huangliang_tool_profile',
              selectColumn,
            },
            (data) => {
              context.fillSelectOption(columns, data)
            }
          ),
        })
        context.toolProfileTable.isDrawWithCache = true
      },
      fillSelectOption(columns, data) {
        const context = this
        if (context.toolProfileTable) {
          const searchValue = context.toolProfileTable.table
            .columns()
            .search()
            .toArray()
          _.forEach(context.toolProfileTable.selectFilter, (el, i) => {
            const colName = columns[i].name
            // 將null值變成空字串
            let hasEmptyString = false
            let hasNull = false
            let options = data.selectOption[colName].filter((val) => {
              if (val === '') {
                hasEmptyString = true
              } else if (val === null) {
                hasNull = true
              }
              return val !== null
            })
            if (hasNull && !hasEmptyString) {
              options.push('')
            }
            options = options.sort().map((opt) => {
              return `<option value="${
                opt === '' ? '__empty_string__' : opt
              }" ${
                searchValue[i] !== '' &&
                searchValue[i].slice(1, searchValue[i].length - 1) ===
                  opt.toString()
                  ? 'selected'
                  : ''
              }>${opt}</option>`
            })
            options.unshift(`<option value="">${i18n('Filter')}</option>`)
            $(el).html(options.join(''))
          })
        }
      },
      initEditPriceTable() {
        const context = this
        const supplierNameArr = _.chain(context.preCon.supplierMap)
          .pick((value) => value.is_open === 'Y')
          .map((value) => value.tsup_name)
          .value()
        const $supNameSelect = context.$editPriceTable.find('[name=tsup_name]')
        const readUrl = 'api/huangliangToolSetting/toolPrice'
        const moneyFormatter = (data) => {
          const str = data.toString()
          const matches = str.match(/(\d+)(\.\d{1,2})?/)
          const intPart = matches[1]
          const decimalPart = matches[2]
          const isDecimal = !!decimalPart
          let result = ''
          if (isDecimal) {
            result += intPart + decimalPart.padEnd(3, '0')
          } else {
            result += intPart + '.'.padEnd(3, '0')
          }
          return result
        }
        const bindEvent = () => {
          $('#stk-table').on('click', '.edit-price-btn', function () {
            editPriceBtnHandler(this)
          })
          context.$editPriceTable.on('change', '[name=tsup_name]', function () {
            supNameHandler(this)
          })
        }
        const supNameHandler = (select) => {
          const tsup_name = select.value
          const tsup_id = _.findKey(
            context.preCon.supplierMap,
            (value) => value.tsup_name === tsup_name
          )
          const supIdInput = select
            .closest('tr')
            .querySelector('[name=tsup_id]')
          supIdInput.value = tsup_id
        }
        const editPriceBtnHandler = (btn) => {
          const { tool_id } = btn.dataset
          $('#tool_id-modal').text(tool_id)
          // readUrl不是crud會跳過extend whereClause，所以只能自行組成QueryString
          context.editPriceTable.changeReadUrl({
            url: readUrl + `?tool_id=${tool_id}&tsup_id=`,
          })
          context.editPriceTable.refreshTable().then(() => {
            $('#edit-price-modal').modal('show')
          })
        }
        const hideExsitedSupplierOptions = ($select, existSupIds) => {
          let isChanged = false
          $select.children().each((i, el) => {
            const isDuplicate = existSupIds.includes(el.value)
            const $option = $(el)
            $option.toggle(!isDuplicate)
            if (!isChanged && !isDuplicate) {
              $option.parent().val(el.value).change()
              isChanged = true
            }
          })
        }

        servkit.initSelectWithList(supplierNameArr, $supNameSelect)
        context.editPriceTable = servkit.crudtable({
          tableModel:
            'com.servtech.servcloud.app.model.huangliang_tool.ToolPrice',
          tableSelector: '#edit-price-table',
          read: {
            url: readUrl,
            preventReadAtFirst: true,
            end: {
              2(data, rowData) {
                const { tsup_id } = rowData
                return context.preCon.supplierMap[tsup_id].tsup_name
              },
              3(data, rowData) {
                return moneyFormatter(data)
              },
              4(data) {
                return data.toFormatedDatetime()
              },
            },
          },
          create: {
            url: 'api/stdcrud',
            start(tdArr, table) {
              const existSupIds = context.editPriceTable.table
                .column(1)
                .data()
                .toArray()
              const $supNameSelect = $(tdArr[1]).find('[name=tsup_name]')
              const $createInput = $(tdArr[3]).find('[name=create_time]')
              hideExsitedSupplierOptions($supNameSelect, existSupIds)
              $createInput.val(moment().format('YYYY-MM-DD HH:mm:ss'))
            },
            send(tdEles) {
              const tool_id = $('#tool_id-modal').text()
              return {
                tool_id,
              }
            },
            end: {
              3(td, formData) {
                const { tool_price } = formData
                return moneyFormatter(tool_price)
              },
            },
          },
          update: {
            // API，不能用crud因為方法固定了，但是修改單價會是新增一筆，create_time也是PK
            url: 'api/huangliangToolSetting/toolPrice',
            start: {
              2(oldTd, newTd, oldTr, newTr, table) {
                const select = newTd.querySelector('select')
                const value = table.cell(oldTd).data()
                select.disabled = true
                select.value = value
              },
              4(oldTd, newTd, oldTr, newTr, table) {
                newTd.querySelector('input').value = moment().format(
                  'YYYY-MM-DD HH:mm:ss'
                )
              },
            },
            send(tdEles) {
              return {
                tool_price: Number(tdEles[2].querySelector('input').value),
              }
            },
            end: {
              3(td, formData) {
                const { tool_price } = formData
                return moneyFormatter(tool_price)
              },
            },
          },
          delete: {
            unavailable: true,
          },
          validate: {
            3(td, table) {
              const input = td.querySelector('input')
              const price = Number(input.value)
              const isNumber = _.isNumber(price)
              const isPositive = price > 0
              const hasError = !!td.querySelector('.note-error')
              if (!hasError && isNumber && !isPositive) {
                return '價格必須大於0'
              }
              if (price >= 10000) {
                return '價格不得大於10000'
              }
            },
          },
        })
        bindEvent()
      },
    },
    preCondition: {
      toolType(done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_huangliang_tool_type',
              columns: ['tool_type', 'type_rule'],
              whereClause: 'is_open=?',
              whereParams: ['Y'],
            }),
          },
          {
            success(data) {
              done(_.indexBy(data, 'tool_type'))
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
              columns: ['tool_location', 'tool_location_for', 'is_open'],
            }),
          },
          {
            success(data) {
              done(
                data.reduce((a, x) => {
                  const { tool_location_for, tool_location, is_open } = x
                  if (a[tool_location_for]) {
                    a[tool_location_for].push([tool_location, is_open])
                  } else {
                    a[tool_location_for] = [[tool_location, is_open]]
                  }
                  return a
                }, {})
              )
            },
          }
        )
      },
      supplierMap(done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_huangliang_tool_supplier',
              columns: ['tsup_id', 'tsup_name', 'is_open'],
            }),
          },
          {
            success(data) {
              done(_.indexBy(data, 'tsup_id'))
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
        '/js/plugin/datatables/jquery.dataTables.rowReordering.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
      ['/js/plugin/select2/select2.min.js'],
    ],
  })
}
