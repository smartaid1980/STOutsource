import i18n from '../../../../js/servtech/module/servcloud.i18n.js'

export default function () {
  GoGoAppFun({
    gogo(context) {
      console.log('hi')
      context.commons.initDataTable()
      context.userAuth = context.preCon.userAuth
      context.initRfqForm().then(() => {
        context.getDemandListData(() => {
          context.initSimilarlyTable.call(context)
          context.initPriceConfirmWidget.call(context)
        })
      })
      context.initMaterialTable()
      // 確認詢價單已被取消，返回上一頁
      context.$rfqCanceledModal = context.commons.initRfqCanceledModal(() => {
        context.goPreviousPage()
      })
      // 回上一頁，帶回查詢條件
      context.$leaveBtn.on('click', function (e) {
        e.preventDefault()
        context.goPreviousPage()
      })
    },
    util: {
      rfqContent: null,
      $matchedRfqTable: null,
      rfqMaterialTable: null,
      existingMaterialTable: null,
      materialList: null,
      requestDiscountHistoryTable: null,
      quoteHistoryTable: null,
      deleteSavedIds: [],
      mtlSearchCondition: {
        isChanged: false,
        mtl_name: '',
        mtl_id: '',
      },
      form_id: servkit.getURLParameter('formId'),
      status: servkit.getURLParameter('status'),
      quote_status: null,
      $leaveBtn: $('#leave-btn'),
      $poQty: $('#po_qty'),
      $marketCoef: $('#market-coef'),
      $produceCoef: $('#produce-coef'),
      $mtlCost: $('#mtl-cost'),
      $materialSaveBtn: $('#material-save-btn'),
      $materialConfirmBtn: $('#material-confirm-btn'),
      $rfqCanceledModal: null,
      canSubmitMaterialList: false,
      $materialTable: $('#rfq-material'),
      $materialWidget: $('#material-information-widget'),
      userAuth: {},
      goPreviousPage() {
        const lang = servkit.getCookie('lang')
        const URIParameter = decodeURIComponent(location.hash)
          .match(/\?(.+)/)[1]
          .split('&')
          .reduce((a, x) => {
            const keyValuePair = x.split('=')
            const key = keyValuePair[0]
            const value = keyValuePair[1]
            a[key] = value
            return a
          }, {})
        const hasParam = !_.isEmpty(URIParameter)
        const hasProjectId = Object.prototype.hasOwnProperty.call(
          URIParameter,
          'projectId'
        )
        const targetPageName = hasProjectId
          ? '14_project_rfq_list'
          : '10_query_rfq'
        const encodedURIParam = hasProjectId
          ? $.param(_.pick(URIParameter, 'projectId'))
          : $.param(_.pick(URIParameter, ['start', 'end', 'type', 'id']))
        window.location = `#app/StrongLED/function/${lang}/${targetPageName}.html${
          hasParam ? `?${encodedURIParam}` : ''
        }`
      },
      // 物料資訊
      getStructureId() {
        const context = this
        return context.$materialWidget
          .find('.filter-material.active')
          .data('structure-id')
      },
      fillRfqMaterialInfo() {
        const context = this
        const { form_id } = context
        const getRfqStatusLog = new Promise((res) => {
          servkit.ajax(
            {
              url: 'api/stdcrud',
              type: 'GET',
              data: {
                tableModel:
                  'com.servtech.servcloud.app.model.strongLED.RfqStatusLog',
                whereClause: `form_id='${form_id}' AND previous_status=1 ORDER BY create_time DESC`,
              },
            },
            {
              success(data) {
                res(data)
              },
            }
          )
        })
        const getRfqModule = new Promise((res) => {
          servkit.ajax(
            {
              url: 'api/strongled/getmodule',
              type: 'GET',
              data: {
                form_id,
              },
            },
            {
              success(data) {
                res(data)
              },
            }
          )
        })
        const $stdProduct = $('#material-alert-std-product')
        const $module = $('#material-alert-module')
        Promise.all([getRfqStatusLog, getRfqModule]).then(
          ([logs, moduleList]) => {
            if (logs.length) {
              const latestLog = logs[0]
              const isStandardProduct = latestLog.changed_status === 41
              const stdProductInfo = isStandardProduct
                ? `${i18n('Standard_Products')}`
                : `${i18n('Non-Standard_Products')}`
              const moduleInfo = moduleList
                ? `有(${_.map(
                    moduleList,
                    (count, module_id) => count + '*' + module_id
                  ).join('+')})`
                : `${i18n('None')}`
              $stdProduct.html(stdProductInfo)
              $module.html(moduleInfo)
            } else {
              $stdProduct.empty()
              $module.empty()
            }
          }
        )
      },
      initMaterialTable() {
        const context = this
        const { userAuth, $materialWidget, $materialTable } = context
        const { structureIds } = context.preCon
        const { ATTRITION_RATE } = context.commons.CONSTANTS
        const delBtnHtml = `<button class="btn btn-danger" id="delete-material" title="delete"><span class="fa fa-trash-o fa-lg"></span> ${i18n(
          'Delete'
        )}</button>`
        const addBtnHtml = `<div id="add-material" class="btn-group">
                  <button class="btn dropdown-toggle btn-success" data-toggle="dropdown" title="add">
                      <span class='fa fa-plus fa-lg'></span> ${i18n(
                        'New'
                      )} <i class="fa fa-caret-down" aria-hidden="true"></i>
                  </button>
                  <ul class="dropdown-menu">
                    <li>
                      <a id="add-mat" style="cursor: pointer;" data-toggle="modal" data-target="#material-management-modal-widget">${i18n(
                        'New_Material'
                      )}</a>
                    </li>
                    <li>
                      <a id="add-existing-mat" style="cursor: pointer;" data-toggle="modal" data-target="#existing-material-modal-widget">${i18n(
                        'Add_Existing_Materials'
                      )}</a>
                    </li>
                  </ul>
                </div>`
        const refreshBtnHtml = `<button class="btn btn-primary" id="refresh-material" title="Refresh"><span class="fa fa-refresh fa-lg"></span> ${i18n(
          'Reforming'
        )}</button>`
        const editBtnHtml = (isSaved) =>
          `<button class="btn btn-xs btn-primary edit-material" title="edit" ${
            isSaved ? '' : 'disabled'
          }><span class="fa fa-pencil"></span></button>`
        const cancelBtnHtml = `<button class='btn btn-xs btn-danger cancel-material' title='Cancel'><i class='fa fa-times' aria-hidden="true"></i></button>`
        const updateBtnHtml = `<button class="btn btn-xs btn-success update-material margin-right-5" title="update"><i class="fa fa-save" aria-hidden="true"></i></button>`
        const materialTableConfig = {
          $tableElement: $materialTable,
          $tableWidget: $materialWidget,
          showNoData: false,
        }
        const $mtlBtns = $('#material-btns')
        const filterBtns = _.map(
          structureIds,
          (name, id) =>
            `<button class="btn btn-default filter-material ${
              id === 'lamp_bead' ? 'active' : ''
            }" data-structure-id="${id}" title="filter"><span class="fa fa-filter"></span> ${name}</button>`
        )
        const $mtlCostInfo = $('#mtl-cost-info')
        const mtlCostInfo = (structureIds) =>
          `${i18n('Cost_of_Material')}＝${_.map(structureIds, (name, id) => {
            return `${name}( <span class="mtl-cost-subgroup" data-structure-id="${id}">0</span> )`
          }).join('＋')}＝<span id="mtl-cost-total">0</span>`
        const {
          canSeeRfqMaterial: canSeeMaterialTable,
          canSeeMaterialTotalCost,
          canEditRfqMaterialQty: canEditStdQty,
          canEditRfqMaterialPrice: canEditTaxedPrice,
          canCreateRfqMaterial: canCreate,
          canDeleteRfqMaterial: canDelete,
          canUpdateRfqMaterial: canUpdate,
        } = userAuth
        const isRdOrRdLeader = userAuth.rd || userAuth.rdLeader
        const reviseTypeMsgMap = {
          0: `${i18n('Manually_Add')}`,
          1: `${i18n('Manually_Modify')}`,
        }
        const customBtns = (() => {
          const result = []
          if (canDelete) {
            result.push(delBtnHtml)
          }
          if (canCreate) {
            result.push(addBtnHtml)
          }
          return [...result, refreshBtnHtml, '<br>', ...filterBtns]
        })()
        const columns = [
          {
            title: `${i18n('Item_Number')}`,
            name: 'mtl_id',
            data: 'mtl_id',
            width: '15%',
            render: {
              _: 'display',
              sort: 'filter',
              filter: 'filter',
            },
            filterType: 'input',
          },
          {
            title: `${i18n('Item_Name')}`,
            name: 'mtl_name',
            data: 'mtl_name',
            width: '5%',
            render: {
              _: 'display',
              sort: 'filter',
              filter: 'filter',
            },
            filterType: 'select',
          },
          {
            title: `${i18n('Specification')}`,
            name: 'spec',
            data: 'spec',
            width: '40%',
            render: {
              _: 'display',
              sort: 'filter',
              filter: 'filter',
            },
            filterType: 'input',
          },
          {
            title: `${i18n('Unit')}`,
            name: 'unit',
            data: 'unit',
            width: '3%',
            render: {
              _: 'display',
              sort: 'filter',
              filter: 'filter',
            },
            filterType: 'select',
          },
          {
            title: `${i18n('Remark')}`,
            name: 'remark',
            data: 'remark',
            width: '5%',
            render: {
              _: 'display',
              sort: 'filter',
              filter: 'filter',
            },
            filterType: 'input',
          },
          {
            title: `${i18n('Crafts')}`,
            name: 'process',
            data: 'process',
            width: '5%',
            render: {
              _: 'display',
              sort: 'filter',
              filter: 'filter',
            },
            filterType: 'select',
          },
          {
            title: `${i18n('The_Standard_Amount')}`,
            name: 'std_qty',
            data: 'std_qty',
            width: '4%',
            render: {
              _: 'display',
              sort: 'filter',
              filter: 'filter',
            },
          },
          {
            title: `${i18n('Tax_Price')}`,
            name: 'taxed_price',
            data: 'taxed_price',
            width: '4%',
            render: {
              _: 'display',
              sort: 'filter',
              filter: 'filter',
            },
          },
          {
            title: `${i18n('Subtotal')}`,
            name: 'subtotal',
            data: null,
            width: '5%',
            render(data, type, rowData) {
              const std_qty = rowData.std_qty.orig || 0
              const taxed_price = rowData.taxed_price.orig || 0
              const subtotal = std_qty * taxed_price * ATTRITION_RATE
              return subtotal.toFixed(4)
            },
          },
          {
            title: `${i18n('System_Notes')}`,
            name: 'system_notes',
            data: null,
            width: '5%',
            render(data, type, rowData) {
              const { revise_type, std_qty, erp_info } = rowData
              const hasReviseLog = revise_type !== undefined
              const isStdQtyEmpty = std_qty === ''
              let result
              if (isRdOrRdLeader) {
                if (hasReviseLog) {
                  result = `<span style="color:red;">${reviseTypeMsgMap[revise_type]}</span>`
                } else if (isStdQtyEmpty) {
                  result = '---'
                } else {
                  result = `${i18n('New_System')}`
                }
              } else {
                if (hasReviseLog) {
                  result = `<span style="color:red;">${reviseTypeMsgMap[revise_type]}</span>`
                } else if (erp_info && erp_info.type === '0') {
                  // 正規化時間，isBefore一定要兩邊時間格式一致(calendar方法的格式變異很大，不適用)
                  const stdBillDate = moment(
                    erp_info.billDate,
                    'YYYYMMDD'
                  ).format('YYYY-MM-DD')
                  result = `${i18n(
                    'Date_Of_Purchase'
                  )}：${stdBillDate}<br>${i18n('No._Jinhuo_Dan')}：${
                    erp_info.billNo
                  }`
                } else {
                  result = `${i18n('No_Information')}`
                }
              }
              return result
            },
          },
          {
            title: `${i18n('Edit')}`,
            name: 'edit',
            data: null,
            width: '3%',
            render(data, type, rowData) {
              const { isSaved } = rowData
              let result
              if (canUpdate && canDelete) {
                result = editBtnHtml(isSaved) + updateBtnHtml
              } else if (canUpdate && !canDelete) {
                result = editBtnHtml(isSaved) + cancelBtnHtml + updateBtnHtml
              } else {
                result = ''
              }
              return result
            },
          },
        ]
        const hideCols = (() => {
          const hideColNames = []
          if (isRdOrRdLeader) {
            hideColNames.push('taxed_price')
            hideColNames.push('subtotal')
          }
          if (!canUpdate) {
            hideColNames.push('edit')
          }
          return columns.reduce((a, value, key) => {
            const isHide = hideColNames.includes(value.name)
            return isHide ? [...a, key] : a
          }, [])
        })()
        if (!canSeeMaterialTable) {
          $materialWidget.hide()
          return
        }
        if (canSeeMaterialTotalCost) {
          $mtlCostInfo.html(mtlCostInfo(structureIds))
        } else {
          $mtlCostInfo.hide()
        }
        context.fillRfqMaterialInfo()
        context.commons.fillTableFilter($materialTable, columns)
        context.commons.fillTableTitle($materialTable, columns)
        window.rmt = context.rfqMaterialTable = createReportTable(
          //context.commons.createMtlTable(
          _.extend(materialTableConfig, {
            checkbox: canDelete,
            hideCols,
            customBtns,
            columns,
            autoWidth: false,
            onRow(row, data) {
              const { erp_info, revise_type } = data
              const $row = $(row)
              const hasReviseLog = revise_type !== undefined
              const hasCancelBtn =
                $row.find('td:nth-child(1) .cancel-material').length > 0
              let isBillDateExpired = false
              if (!isRdOrRdLeader) {
                if (erp_info && erp_info.type === '0') {
                  const stdBillDate = moment(
                    erp_info.billDate,
                    'YYYYMMDD'
                  ).format('YYYY-MM-DD')
                  isBillDateExpired = moment(stdBillDate).isBefore(
                    moment().subtract(90, 'days').format('YYYY-MM-DD')
                  )
                } else if (!hasReviseLog) {
                  isBillDateExpired = true
                }
              }
              if (canUpdate) {
                $row.addClass('read')
              }
              if (canDelete && !hasCancelBtn) {
                $row.find('td:nth-child(1)').append(cancelBtnHtml)
              }
              $row.toggleClass('emphasize-row', isBillDateExpired)
            },
          })
        )
        if (canCreate) {
          context.initExistingMaterialTable()
          context.initAddNewMaterialTable()
        }
        if (!canCreate && !canUpdate && !canDelete) {
          $mtlBtns.hide()
        }
        context.bindMaterialTableEvent()
        context.getRfqMaterial(() => context.drawMaterialTable())
      },
      drawMaterialTable(mtlList) {
        const context = this
        const { $materialWidget, userAuth } = context
        const isRd = userAuth.rd || userAuth.rdLeader
        const isCalcMtlCost = !isRd
        const activeStructureId = context.getStructureId()
        const materialList =
          mtlList || context.materialList[activeStructureId] || {}
        const isHideMtlWidget =
          userAuth.assistant &&
          _.every(context.materialList, (map) => _.isEmpty(map))
        if (isHideMtlWidget) {
          $materialWidget.hide()
        } else {
          context.mtlListTableData = context.preProcessMtlData(
            Object.values(materialList)
          )
          const tableData = Object.values(context.mtlListTableData)
          context.commons.fillFilterOptions(tableData, context.rfqMaterialTable)
          context.rfqMaterialTable.table.clear().rows.add(tableData).draw()
          // context.rfqMaterialTable.rt.table.clear().rows.add(tableData).draw();
          if (isCalcMtlCost) {
            context.calcMtlCostByStructure()
            context.renderTotalMtlCost()
          }
        }
      },
      preProcessMtlData(data) {
        const std_qty = ({ isSaved, std_qty }) =>
          isSaved
            ? std_qty || ''
            : `<form>
            <input type="text" name="std_qty" 
              class="form-control full-width required vld-pos-num" 
              value="${std_qty || ''}" />
          </form>`
        const taxed_price = (taxed_price) =>
          taxed_price
            ? taxed_price || ''
            : `<form>
            <input type="text" name="taxed_price" 
              class="form-control full-width required vld-pos-num" 
              value="${taxed_price || ''}"/>
          </form>`
        const getMtlMap = (map) => ({
          mtl_id: {
            display: map.mtl_id || '',
            orig: map.mtl_id || '',
            filter: map.mtl_id || '',
          },
          mtl_name: {
            display: map.mtl_name || '',
            orig: map.mtl_name || '',
            filter: map.mtl_name || '',
          },
          spec: {
            display: map.spec || '',
            orig: map.spec || '',
            filter: map.spec || '',
          },
          unit: {
            display: map.unit || '',
            orig: map.unit || '',
            filter: map.unit || '',
          },
          remark: {
            display: map.remark || '',
            orig: map.remark || '',
            filter: map.remark || '',
          },
          process: {
            display: map.process || '',
            orig: map.process || '',
            filter: map.process || '',
          },
          std_qty: {
            display: std_qty({
              std_qty: map.std_qty,
              isSaved: map.isSaved,
            }),
            orig: map.std_qty || '',
            filter: map.std_qty || '',
          },
          taxed_price: {
            display: taxed_price(map.taxed_price),
            orig: map.taxed_price || '',
            filter: map.taxed_price || '',
          },
          erp_info: map.erp_info ? JSON.parse(map.erp_info) : undefined,
        })

        if (_.isArray(data)) {
          return data.reduce((a, map) => {
            a[map.mtl_id] = _.extend({}, map, getMtlMap(map))
            return a
          }, {})
        } else {
          return _.extend({}, data, getMtlMap(data))
        }
      },
      getRfqMaterial(callback) {
        const context = this
        const {
          form_id,
          userAuth,
          $materialConfirmBtn,
          $materialSaveBtn,
        } = context
        const isRd = userAuth.rd || userAuth.rdLeader
        const role = isRd ? 'rd' : 'pc'
        let hasEmptyValue = false

        servkit.ajax(
          {
            url: 'api/strongled/rfqMaterialStructureLog',
            type: 'GET',
            data: {
              form_id,
              role,
            },
          },
          {
            success(data) {
              context.materialList = data.reduce(
                (a, map) => {
                  const { structure_id, std_qty, taxed_price, mtl_id } = map
                  hasEmptyValue =
                    (isRd
                      ? std_qty === undefined
                      : taxed_price === undefined) || hasEmptyValue
                  a[structure_id][mtl_id] = _.extend(map, {
                    isSaved: true,
                  })
                  return a
                },
                _.mapObject(context.preCon.structureIds, () => ({}))
              )
              const canSubmitMaterial = data.length && !hasEmptyValue
              const canSaveMaterial = data.length && hasEmptyValue
              context.canSubmitMaterialList = !hasEmptyValue
              $materialConfirmBtn.prop('disabled', !canSubmitMaterial)
              $materialSaveBtn.prop('disabled', !canSaveMaterial)
              if (callback) {
                callback()
              }
            },
          }
        )
      },
      calcMtlCostByStructure(structure_id) {
        const context = this
        const mtlCostMap =
          context.mtlCostMap || _.extend({}, context.preCon.structureIds)
        const { ATTRITION_RATE } = context.commons.CONSTANTS
        const $container = $('#mtl-cost-info')
        let priceTBD
        if (structure_id) {
          let total = 0
          _.each(context.materialList[structure_id], (mtl) => {
            priceTBD = context.materialPriceTBD[structure_id][mtl.mtl_id]
            if (mtl.taxed_price !== undefined) {
              const subtotal =
                Number(mtl.taxed_price) * Number(mtl.std_qty) * ATTRITION_RATE
              total += subtotal
            } else if (priceTBD !== undefined) {
              total += priceTBD * Number(mtl.std_qty) * ATTRITION_RATE
            }
          })
          mtlCostMap[structure_id].cost = total
          mtlCostMap.total.cost = _.reduce(
            mtlCostMap,
            (a, map, id) => {
              if (id === 'total') {
                return a
              }
              return a + map.cost
            },
            0
          )
        } else {
          if (!context.mtlCostMap) {
            for (const id in mtlCostMap) {
              mtlCostMap[id] = {
                $el: $container.find(`[data-structure-id=${id}]`),
                cost: 0,
              }
            }
            mtlCostMap.total = {
              $el: $('#mtl-cost-total'),
              cost: 0,
            }
          } else {
            for (const id in mtlCostMap) {
              mtlCostMap[id].cost = 0
            }
          }
          _.each(context.materialList, (mtls, structure_id) => {
            _.each(mtls, (mtl, mtl_id) => {
              if (context.materialPriceTBD) {
                priceTBD = context.materialPriceTBD[structure_id][mtl_id]
              }
              if (mtl.taxed_price !== undefined) {
                const subtotal =
                  Number(mtl.taxed_price) * Number(mtl.std_qty) * ATTRITION_RATE
                mtlCostMap[structure_id].cost += subtotal
                mtlCostMap.total.cost += subtotal
              } else if (priceTBD !== undefined) {
                const subtotal = priceTBD * Number(mtl.std_qty) * ATTRITION_RATE
                mtlCostMap[structure_id].cost += subtotal
                mtlCostMap.total.cost += subtotal
              }
            })
          })
          context.mtlCostMap = mtlCostMap
        }
      },
      renderTotalMtlCost(structure_id) {
        const context = this
        let $el
        let cost
        if (structure_id) {
          context.mtlCostMap.total.$el.html(
            context.mtlCostMap.total.cost.toFixed(4)
          )
          context.mtlCostMap[structure_id].$el.html(
            context.mtlCostMap[structure_id].cost.toFixed(4)
          )
        } else {
          for (const id in context.mtlCostMap) {
            $el = context.mtlCostMap[id].$el
            cost = context.mtlCostMap[id].cost
            if (cost) {
              cost = cost.toFixed(4)
            }
            $el.html(cost)
          }
        }
      },
      bindMaterialTableEvent() {
        const context = this
        const { $materialWidget, $materialTable } = context
        const { ATTRITION_RATE } = context.commons.CONSTANTS
        const $mtlBtns = $('#material-btns')
        const priceHandler = (input) => {
          const structure_id = context.getStructureId()
          const $tr = $(input).parents('tr')
          const rowData = context.rfqMaterialTable.table.row($tr).data()
          const mtl_id = rowData.mtl_id.orig
          const std_qty = rowData.std_qty.orig
          const $subtotal = context.rfqMaterialTable.table
            .cell($tr, 'subtotal:name')
            .nodes()
            .to$()
          const taxed_price = Number(input.value)
          if (!isNaN(taxed_price)) {
            $subtotal.html((std_qty * taxed_price * ATTRITION_RATE).toFixed(4))
            if (!context.materialPriceTBD) {
              context.materialPriceTBD = _.reduce(
                context.preCon.structureIds,
                (a, name, id) => {
                  a[id] = {}
                  return a
                },
                {}
              )
            }
            context.materialPriceTBD[structure_id][mtl_id] = taxed_price
            context.calcMtlCostByStructure(structure_id)
            context.renderTotalMtlCost(structure_id)
          }
        }

        $materialTable
          .on('change', 'input[name="taxed_price"]', function (e) {
            e.preventDefault()
            priceHandler(this)
          })
          .on('keyup', 'input[name="taxed_price"]', function (e) {
            e.preventDefault()
            priceHandler(this)
          })
          .on('keydown', 'input', function (e) {
            if (e.keyCode === 13) {
              $(this).change()
              e.preventDefault()
            }
          })

        $materialWidget
          .on('click', '#delete-material', function (e) {
            e.preventDefault()
            context.deleteMaterial()
          })
          .on('click', '#refresh-material', function (e) {
            e.preventDefault()
            context.refreshMaterialTable($(this))
          })
          .on('click', '.edit-material', function (e) {
            e.preventDefault()
            context.editMaterial($(this))
          })
          .on('click', '.update-material', function (e) {
            e.preventDefault()
            context.updateMaterial($(this))
          })
          .on('click', '.cancel-material', function (e) {
            e.preventDefault()
            context.cancelEditMaterial($(this))
          })
          .on('click', '.filter-material', function (e) {
            e.preventDefault()
            context.filterMaterial($(this))
          })

        $mtlBtns
          .on('click', '#material-confirm-btn', function (e) {
            e.preventDefault()
            context.submitMaterialList()
          })
          .on('click', '#material-save-btn', function (e) {
            e.preventDefault()
            if (context.userAuth.rd || context.userAuth.rdLeader) {
              context.saveBomList()
            } else {
              context.saveBomPrice()
            }
          })
      },
      filterMaterial($thisBtn) {
        // const newStructureId = $thisBtn.data('structure-id');
        const context = this
        const { $materialWidget } = context
        const $origActiveBtn = $materialWidget.find('.filter-material.active')
        const origStructureId = $origActiveBtn.data('structure-id')
        $origActiveBtn.removeClass('active')
        $thisBtn.addClass('active')
        const canEditStdQty =
          (context.userAuth.rd && context.rfqContent.status === '6') ||
          (context.userAuth.rdLeader && context.rfqContent.status === '11')
        const canEditTaxedPrice =
          (context.userAuth.procurement &&
            context.rfqContent.status === '16') ||
          (context.userAuth.procurementLeader &&
            context.rfqContent.status === '21')
        const isRdOrRdLeader = context.userAuth.rd || context.userAuth.rdLeader
        // TODO: 檢查若當前結構有已填的值，alert "為避免此次編輯結果遺失，請先儲存"，或是confirm "系統發現有未儲存的編輯資料，確定要切換結構?"
        // TODO: mergeUnsaveData
        // if (canEditStdQty || canEditTaxedPrice) {
        //   context.rfqMaterialTable.table.rows({ page: 'current' }).nodes().to$().each((i, tr) => {
        //     const $tds = $(tr).find('td');
        //     const mtl_id = $tds.eq(canEditStdQty ? 1 : 0).text();
        //     const dataToSave = $tds.eq(7).find('input').val();
        //     if (dataToSave) {
        //       context.materialList[mtl_id][canEditStdQty ? 'std_qty' : 'taxed_price'] = dataToSave;
        //     }
        //   })
        // }
        context.drawMaterialTable()
        // context.drawMaterialTable(_.pick(context.materialList, (value) => {
        //   return value.structure_id === structureId;
        // }));
      },
      hasEmptyValue(cols = []) {
        const context = this
        let result = false
        _.each(context.materialList, (mtls) => {
          _.each(mtls, (mtl) => {
            result =
              result || cols.some((colName) => mtl[colName] === undefined)
          })
        })
        return result
      },
      saveBomList() {
        const context = this
        const { $materialSaveBtn, $materialConfirmBtn, form_id } = context
        context.commons.checkIsRfqCanceled({
          form_id,
          uncancelCallback() {
            const reportTable = context.rfqMaterialTable.table
            const structure_id = context.getStructureId()
            const isValid = context.validateColumn(reportTable, ['std_qty'])
            if (!isValid) {
              return alert(`${i18n('Form_Is_Not_Completed')}`)
            }
            const requestBody = {
              form_id: context.form_id,
              new_mtl: [],
              old_mtl: [],
              del_mtl: context.deleteSavedIds.slice(),
              update_mtl: [],
              role: 'rd',
            }
            let hasNewMat = false
            context.mergeColValueToMap(
              'std_qty',
              reportTable,
              context.materialList[structure_id]
            )
            _.each(context.materialList[structure_id], (map) => {
              if (map.isUpdate) {
                requestBody.update_mtl.push(
                  _.pick(map, ['std_qty', 'mtl_id', 'form_id'])
                )
              } else if (map.newMat) {
                requestBody.new_mtl.push(
                  _.pick(map, [
                    'std_qty',
                    'mtl_id',
                    'process',
                    'unit',
                    'spec',
                    'mtl_name',
                    'structure_id',
                    'remark',
                  ])
                )
                hasNewMat = true
              } else if (!map.isSaved) {
                requestBody.old_mtl.push(
                  _.pick(map, ['std_qty', 'mtl_id', 'structure_id'])
                )
              }
            })
            servkit.ajax(
              {
                url: 'api/strongled/savebomlist',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(requestBody),
              },
              {
                success() {
                  // TODO: 檢查其他結構的物料是否有空值
                  $materialConfirmBtn.prop(
                    'disabled',
                    context.hasEmptyValue(['std_qty'])
                  )
                  $materialSaveBtn.prop('disabled', true)
                  context.deleteSavedIds.length = 0
                  $('#refresh-material').click()
                  if (hasNewMat) {
                    context.existingMaterialTable.redraw()
                  }
                },
              }
            )
          },
          canceledCallback() {
            context.$rfqCanceledModal.modal('show')
          },
        })
      },
      saveBomPrice() {
        const context = this
        const { $materialSaveBtn, $materialConfirmBtn, form_id } = context
        context.commons.checkIsRfqCanceled({
          form_id,
          uncancelCallback() {
            const reportTable = context.rfqMaterialTable.table
            const structure_id = context.getStructureId()
            let hasEmptyValue = false
            let $input
            let taxed_price
            let mtl_id
            const isValid = context.validateColumn(reportTable, ['taxed_price'])
            if (!isValid) {
              return alert(`${i18n('Form_Is_Not_Completed')}`)
            }
            context.mergeColValueToMap(
              'taxed_price',
              reportTable,
              context.materialList[structure_id]
            )
            reportTable
              .column('taxed_price:name')
              .nodes()
              .each((td) => {
                $input = $(td).find('input')
                taxed_price = $input.val()
                if (!taxed_price) {
                  hasEmptyValue = true
                }
                if ($input.length) {
                  mtl_id = reportTable.row($(td).closest('tr')).data().mtl_id
                    .orig
                  context.materialList[structure_id][mtl_id].isNewFill = true
                }
              })
            const datas = Object.values(context.materialList[structure_id])
              .filter(
                (data) => data.taxed_price && (data.isUpdate || data.isNewFill)
              )
              .map((data) =>
                _.extend(
                  {
                    type: data.isUpdate ? 'update' : 'new',
                  },
                  _.pick(data, ['form_id', 'mtl_id', 'taxed_price'])
                )
              )
            if (datas.length) {
              servkit.ajax(
                {
                  url: 'api/strongled/savebomprice',
                  type: 'PUT',
                  contentType: 'application/json',
                  data: JSON.stringify({
                    role: 'pc',
                    datas,
                  }),
                },
                {
                  success() {
                    // TODO: 檢查其他結構的物料是否有空值
                    $materialSaveBtn.prop('disabled', !hasEmptyValue)
                    $materialConfirmBtn.prop(
                      'disabled',
                      context.hasEmptyValue()
                    )
                    context.getRfqMaterial(() => context.drawMaterialTable())
                  },
                }
              )
            }
          },
          canceledCallback() {
            context.$rfqCanceledModal.modal('show')
          },
        })
      },
      mergeColValueToMap(colName, table, map) {
        let $input
        let value
        let mtl_id
        let $tr
        table
          .column(colName + ':name')
          .nodes()
          .each((td) => {
            $input = $(td).find('input')
            value = $input.length ? $input.val() : undefined
            $tr = $(td).parent()
            if (value) {
              mtl_id = table.row($tr).data().mtl_id.orig
              map[mtl_id][colName] = parseFloat(value)
            }
          })
      },
      deleteMaterial() {
        const context = this
        const { $materialSaveBtn, $materialConfirmBtn } = context
        const deleteSavedIds = []
        const deleteUnsavedIds = []
        const deleteRowIndexes = []
        const structure_id = context.getStructureId()
        let isChecked
        let trApi
        let rowIndex
        let rowData
        context.rfqMaterialTable.table
          .rows()
          .nodes()
          .each((tr) => {
            isChecked = $(tr).find(':checked').length > 0
            if (isChecked) {
              trApi = context.rfqMaterialTable.table.row(tr)
              rowIndex = trApi.index()
              rowData = trApi.data()
              deleteRowIndexes.push(rowIndex)
              if (rowData.isSaved) {
                deleteSavedIds.push(rowData.mtl_id.orig)
              } else {
                deleteUnsavedIds.push(rowData.mtl_id.orig)
              }
            }
          })
        if (deleteRowIndexes.length) {
          // TODO: mtlListTableData應該也要omit
          context.materialList[structure_id] = _.omit(
            context.materialList[structure_id],
            (value, key) =>
              deleteSavedIds.includes(key) || deleteUnsavedIds.includes(key)
          )
          context.deleteSavedIds = _.union(
            context.deleteSavedIds,
            deleteSavedIds
          )
          // context.drawMaterialTable();
          context.rfqMaterialTable.table
            .rows(deleteRowIndexes)
            .remove()
            .draw(false)
          // 還未儲存的 或 有編輯過的物料就不能submit
          context.canSubmitMaterialList =
            Object.values(context.materialList[structure_id]).findIndex(
              (mat) => !mat.isSaved || mat.isUpdate
            ) < 0
          $materialConfirmBtn.prop(
            'disabled',
            context.deleteSavedIds.length
              ? true
              : !context.canSubmitMaterialList
          )
          $materialSaveBtn.prop(
            'disabled',
            context.deleteSavedIds.length
              ? false
              : context.canSubmitMaterialList
          )
        }
      },
      refreshMaterialTable($thisBtn) {
        const context = this
        $thisBtn.find('.fa-refresh').addClass('fa-spin')
        context.deleteSavedIds.length = 0
        context.getRfqMaterial(() => {
          context.drawMaterialTable()
          setTimeout(
            () => $thisBtn.find('.fa-refresh').removeClass('fa-spin'),
            500
          )
        })
      },
      editMaterial($thisBtn) {
        const context = this
        const { $materialTable } = context
        const $tr = $thisBtn.parents('tr')
        const isRd = context.userAuth.rd || context.userAuth.rdLeader
        const colName = isRd ? 'std_qty' : 'taxed_price'
        const cell = context.rfqMaterialTable.table.cell($tr, colName + ':name')
        const $td = cell.nodes().to$()
        const orig_value = cell.data().orig
        $td.html(
          `<form><input class="form-control full-width required vld-pos-num" name="${colName}" type="text" value="${orig_value}" data-orig="${orig_value}" /></form>`
        )
        $tr.addClass('edit').removeClass('read')
        context.commons.disableFeature(true, $materialTable)
      },
      updateMaterial($thisBtn) {
        const context = this
        const {
          $materialSaveBtn,
          $materialConfirmBtn,
          userAuth,
          materialList,
          rfqMaterialTable,
          $materialTable,
        } = context
        const $tr = $thisBtn.parents('tr')
        const isRd = userAuth.rd || userAuth.rdLeader
        const colName = isRd ? 'std_qty' : 'taxed_price'
        const cell = rfqMaterialTable.table.cell($tr, colName + ':name')
        const $cell = cell.nodes().to$()
        const value = parseFloat($cell.find('input').val())
        const mtl_id = rfqMaterialTable.table.cell($tr, 'mtl_id:name').data()
          .orig
        const isValid = $cell.find('form').validate().form()
        const structure_id = context.getStructureId()
        if (!isValid) {
          return
        }
        if (isRd) {
          materialList[structure_id][mtl_id].std_qty = value
        } else {
          materialList[structure_id][mtl_id].taxed_price = value
          context.calcMtlCostByStructure(structure_id)
          context.renderTotalMtlCost(structure_id)
        }
        materialList[structure_id][mtl_id].isUpdate = true
        cell
          .data({
            display: value,
            filter: value,
            orig: value,
          })
          .draw(false)
        $tr.removeClass('edit').addClass('read')
        context.commons.disableFeature(false, $materialTable)
        context.canSubmitMaterialList = false
        $materialConfirmBtn.prop('disabled', true)
        $materialSaveBtn.prop('disabled', false)
      },
      cancelEditMaterial($thisBtn) {
        const context = this
        const { $materialTable, userAuth, rfqMaterialTable } = context
        const { ATTRITION_RATE } = context.commons.CONSTANTS
        const $tr = $thisBtn.parents('tr')
        const isRd = userAuth.rd || userAuth.rdLeader
        const colName = isRd ? 'std_qty' : 'taxed_price'
        const cell = rfqMaterialTable.table.cell($tr, colName + ':name')
        const $cell = cell.nodes().to$()
        const orig_data = $cell.find('input').data('orig')
        $cell.html(orig_data)
        if (!isRd) {
          const std_qty = rfqMaterialTable.table
            .cell($tr, 'std_qty:name')
            .data().orig
          const subtotal =
            parseFloat(std_qty) * parseFloat(orig_data) * ATTRITION_RATE
          rfqMaterialTable.table
            .cell($tr, 'subtotal:name')
            .nodes()
            .to$()
            .text(subtotal.toFixed(4))
        }
        $tr.removeClass('edit').addClass('read')
        context.commons.disableFeature(false, $materialTable)
      },
      submitMaterialList() {
        const context = this
        const { form_id, userAuth } = context
        context.commons.checkIsRfqCanceled({
          form_id,
          uncancelCallback() {
            if (userAuth.rd) {
              servkit.ajax(
                {
                  url: `api/strongled/changestatus`,
                  type: 'POST',
                  contentType: 'application/json',
                  data: JSON.stringify({
                    form_id,
                    status: 11,
                  }),
                },
                {
                  success() {
                    context.goPreviousPage()
                  },
                }
              )
            }
            if (userAuth.procurement) {
              const mtl_cost = Number($('#mtl-cost-total').text())
              servkit.ajax(
                {
                  url: `api/strongled/changestatus`,
                  type: 'POST',
                  contentType: 'application/json',
                  data: JSON.stringify({
                    form_id,
                    status: 26, // TODO: 加入採購主管則改成21
                    mtl_cost,
                    has_bom_list: true,
                  }),
                },
                {
                  success() {
                    context.goPreviousPage()
                  },
                }
              )
            }
            if (userAuth.rdLeader) {
              servkit.ajax(
                {
                  url: `api/strongled/updateMeterialCurrentPriceByFormId`,
                  type: 'PUT',
                  contentType: 'application/json',
                  data: JSON.stringify({
                    form_id,
                  }),
                },
                {
                  success() {
                    context.goPreviousPage()
                  },
                  fail() {
                    // 測試和開發環境接舊的API
                    servkit.ajax(
                      {
                        url: `api/strongled/submitbomlist`,
                        type: 'PUT',
                        contentType: 'application/json',
                        data: JSON.stringify({
                          form_id,
                        }),
                      },
                      {
                        success() {
                          context.goPreviousPage()
                        },
                      }
                    )
                  },
                }
              )
            }
          },
          canceledCallback() {
            context.$rfqCanceledModal.modal('show')
          },
        })
      },
      initDataTablePipeline() {
        const context = this
        $.fn.dataTable.pipeline = (opts) => {
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
            const drawStart = request.start
            const requestLength = request.length
            const requestEnd = requestStart + requestLength

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
            } else if (context.mtlSearchCondition.isChanged) {
              isAjax = true
            } else {
              isAjax = false
            }

            // Store the request for checking next time around
            cacheLastRequest = $.extend(true, {}, request)

            if (isAjax) {
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

              if (context.mtlSearchCondition.isChanged) {
                request.mtlId = context.mtlSearchCondition.mtl_id
                request.mtlName = context.mtlSearchCondition.mtl_name
              } else {
                request.mtlId = ''
                request.mtlName = ''
              }

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
                data: request,
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
                },
              })
            } else {
              const json = $.extend(true, {}, cacheLastJson)
              json.draw = request.draw // Update the echo for each response
              json.data.splice(0, requestStart - cacheLower)
              json.data.splice(requestLength, json.data.length)
              drawCallback(json)
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
      },
      initExistingMaterialTable() {
        const context = this
        const { $materialSaveBtn, $materialConfirmBtn } = context
        const $tableElement = $('#existing-material-list')
        const $tableWidget = $('#existing-material-modal-widget')
        const initAddMaterialList = ($container, config) => {
          const { onRemove } = config

          class List {
            constructor({ $container, onRemove }) {
              const self = this
              this.list = {}
              this.$container = $container
              this.onRemove = onRemove
              $container.on('click', '.remove-label', function () {
                self.remove($(this).parent())
              })
            }
            add(id, value) {
              if (id) {
                _.extend(this.list, {
                  [id]: value,
                })
                this.$container.append(this.getLabelStr(id))
              }
            }
            has(id) {
              let result
              if (id) {
                result = Object.prototype.hasOwnProperty.call(this.list, id)
              } else {
                result = false
              }
              return result
            }
            getLabelStr(text) {
              return `<label class="label label-primary" data-title="${text}">${text}<span class="remove-label"><i class='fa fa-times' aria-hidden="true"></i><span></label>`
            }
            remove($label) {
              const id = $label.data('title').toString()
              this.list = _.omit(this.list, id)
              $label.remove()
              if (this.onRemove) {
                this.onRemove()
              }
            }
            draw() {
              this.$container.html(
                Object.keys(this.list)
                  .map((id) => this.getLabelStr(id))
                  .join('')
              )
            }
            reset() {
              this.list = {}
              this.$container.empty()
            }
          }
          return new List({
            $container,
            onRemove,
          })
        }
        const existingMaterialToAdd = initAddMaterialList(
          $('#add-material-list').find('div'),
          {
            onRemove() {
              disableAddBtnCurrentPage(context.existingMaterialTable.table)
            },
          }
        )
        const disableAddBtnCurrentPage = (table) => {
          const structure_id = context.getStructureId()
          let hasMaterial
          table
            .rows({
              page: 'current',
            })
            .nodes()
            .each((tr) => {
              const rowData = table.row(tr).data()
              const mtl_id = rowData.mtl_id
              const $td = table.cell(tr, 'add_btn:name').nodes().to$()
              hasMaterial =
                Object.prototype.hasOwnProperty.call(
                  context.materialList[structure_id],
                  mtl_id
                ) || existingMaterialToAdd.has(mtl_id)
              $td.find('button').prop('disabled', hasMaterial)
            })
        }
        const getMaterialName = () => {
          const fillOptions = (data) => {
            const options = _.chain(data)
              .map((mtlMap) => mtlMap.mtl_name)
              .uniq()
              .value()
              .map((name) => `<option value="${name}">${name}</option>`)
            $('#filter-mtl-name').append(options)
          }

          servkit.ajax(
            {
              url: 'api/strongled/material/uniqMtlName',
              type: 'GET',
            },
            {
              success(data) {
                fillOptions(data)
              },
              fail() {
                servkit.ajax(
                  {
                    url: 'api/getdata/db',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({
                      table: 'a_strongled_material_list',
                      columns: ['mtl_name'],
                      whereClause: '1 GROUP BY mtl_name',
                    }),
                  },
                  {
                    success(data) {
                      fillOptions(data)
                    },
                  }
                )
              },
            }
          )
        }
        const bindEvents = () => {
          $tableWidget
            // modal show, 使已有物料不能再選
            .on('show.bs.modal', function () {
              existingMaterialToAdd.reset()
              disableAddBtnCurrentPage(context.existingMaterialTable.table)
            })
            // 選擇物料
            .on('click', '.add-single-mtl', function () {
              const $btn = $(this)
              const $tr = $btn.closest('tr')
              const rowData = context.existingMaterialTable.table
                .row($tr)
                .data()
              const { mtl_id } = rowData
              existingMaterialToAdd.add(mtl_id, rowData)
              $btn.prop('disabled', true)
            })
            // 新增物料
            .on('click', '#add-existing-material-btn', function () {
              const structure_id = context.getStructureId()
              // TODO: 此處的context.existingMaterial[mtl_id]，若為分頁顯示就不一定有
              const rowData = _.mapObject(existingMaterialToAdd.list, (map) =>
                _.extend(
                  {
                    isSaved: false,
                    structure_id,
                  },
                  map
                )
              )
              if (!_.isEmpty(rowData)) {
                // merge已選物料和新增的
                if (!context.materialList) {
                  context.materialList = {
                    [structure_id]: {},
                  }
                }
                _.extend(context.materialList[structure_id], rowData)
                context.rfqMaterialTable.table.rows
                  .add(
                    Object.values(
                      context.preProcessMtlData(Object.values(rowData))
                    )
                  )
                  .draw(false)
                $materialConfirmBtn.prop('disabled', true)
                $materialSaveBtn.prop('disabled', false)
                $('#existing-material-modal-widget').modal('hide')
              }
            })
            // 查詢
            .on('click', '#submit-filter-condition', function () {
              _.extend(context.mtlSearchCondition, {
                isChanged: true,
                mtl_name: $('#filter-mtl-name').val(),
                mtl_id: $('#filter-mtl-id').val(),
              })
              context.existingMaterialTable.table.draw()
            })
        }
        const url = context.commons.CONSTANTS.dev
          ? 'api/strongled/getmtllist'
          : 'api/strongled/material'

        context.initDataTablePipeline()
        context.existingMaterialTable = createReportTable({
          $tableElement,
          $tableWidget,
          autoWidth: false,
          lengthChange: false,
          columnDefs: [
            {
              orderable: false,
              targets: '_all',
            },
          ],
          columns: [
            {
              title: `${i18n('Item_Number')}`,
              name: 'mtl_id',
              data: 'mtl_id',
              width: '23%',
              render(data) {
                return data || ''
              },
            },
            {
              title: `${i18n('Item_Name')}`,
              name: 'mtl_name',
              data: 'mtl_name',
              width: '10%',
              render(data) {
                return data || ''
              },
            },
            {
              title: `${i18n('Specification')}`,
              name: 'spec',
              data: 'spec',
              width: '40%',
              render(data) {
                return data || ''
              },
            },
            {
              title: `${i18n('Unit')}`,
              name: 'unit',
              data: 'unit',
              width: '7%',
              render(data) {
                return data || ''
              },
            },
            {
              title: `${i18n('Remark')}`,
              name: 'remark',
              data: 'remark',
              width: '7%',
              render(data) {
                return data || ''
              },
            },
            {
              title: `${i18n('Crafts')}`,
              name: 'process',
              data: 'process',
              width: '7%',
              render(data) {
                return data || ''
              },
            },
            {
              title: `${i18n('New')}`,
              name: 'add_btn',
              data: null,
              width: '5%',
              render(data, type, rowData) {
                const structure_id = context.getStructureId()
                const isInRfqMtlList = (mtl_id) =>
                  context.materialList
                    ? Object.prototype.hasOwnProperty.call(
                        context.materialList[structure_id],
                        mtl_id
                      )
                    : false
                const isInMtlAddingList = (mtl_id) =>
                  existingMaterialToAdd.has(mtl_id)
                const isDisableAddBtn = (mtl_id) =>
                  isInRfqMtlList(mtl_id) || isInMtlAddingList(mtl_id)
                const addBtn = (mtl_id) =>
                  `<button class="btn btn-primary add-single-mtl" data-mtl-id="${mtl_id}" ${
                    isDisableAddBtn(mtl_id) ? 'disabled' : ''
                  }><span class='fa fa-plus fa-lg'></span></button>`
                return addBtn(rowData.mtl_id)
              },
            },
          ],
          serverSide: true, // 加上serverSide才可以用ajax畫
          ajax: $.fn.dataTable.pipeline({
            url,
          }),
        })
        context.existingMaterialTable.redraw = () => {
          $('#filter-mtl-name').val('')
          $('#filter-mtl-id').val('')
          $('#submit-filter-condition').click()
        }
        window.em = context.existingMaterialTable

        bindEvents()
        getMaterialName()
      },
      initAddNewMaterialTable() {
        const context = this
        const { $materialSaveBtn, $materialConfirmBtn } = context

        // modal出現前清空表格
        $('#material-management-modal-widget').on('show.bs.modal', function () {
          if (context.addNewMtlFormValidator) {
            context.addNewMtlFormValidator.destroy()
          }
          $(this)
            .find('.form-control')
            .each((i, el) => $(el).val(''))
        })
        // 新建物料
        $('#add-material-btn').on('click', function () {
          const mtl_id = new Date().getTime().toString()
          const structure_id = context.getStructureId()
          const formData = {
            newMat: true,
            isSaved: false,
            structure_id,
            mtl_id,
          }
          context.addNewMtlFormValidator = $(
            '#material-management-modal'
          ).validate()
          if (!context.addNewMtlFormValidator.form()) {
            return
          }
          $('#material-management-modal-widget')
            .find('.modal-body .form-control')
            .each((i, el) => {
              formData[el.name] = el.value
            })
          context.materialList[structure_id][mtl_id] = formData
          $materialConfirmBtn.prop('disabled', true)
          $materialSaveBtn.prop('disabled', false)
          context.canSubmitMaterialList = false
          context.rfqMaterialTable.table.rows
            .add([context.preProcessMtlData(formData)])
            .draw(false)
          $('#material-management-modal-widget').modal('hide')
        })
      },
      validateColumn(reportTable, colNameArray) {
        let isValid = true
        const pageInfo = reportTable.page.info()
        const { page: currPage, pages: totalpages } = pageInfo.page
        let $form
        const validate = () => {
          reportTable
            .columns(
              colNameArray.map((col) => col + ':name'),
              {
                page: 'current',
              }
            )
            .nodes()
            .to$()
            .each((i, cells) => {
              cells.forEach((cell) => {
                $form = $(cell).find('form')
                if ($form.length) {
                  isValid = $form.validate().form() && isValid
                }
              })
            })
        }
        // validate forms at current page
        validate()
        if (!isValid) {
          return false
        }
        // validate forms at the other pages, validation goes whole page a time, page will stop while not passing the valiation at the first time.
        for (var k = 0; k < totalpages; k++) {
          if (k !== currPage && isValid) {
            reportTable.page(k).draw(false)
            validate()
          }
          if (!isValid) {
            return false
          }
        }
        return true
      },
      // 詢價單
      getDemandListData(callback) {
        var context = this
        servkit.ajax(
          {
            url: 'api/strongled/wholerfq',
            type: 'GET',
            data: {
              form_id: context.form_id,
            },
          },
          {
            success(data) {
              context.rfqContent = data
              context.quote_status = data.quote_status
              context.renderDemandListData()
              if (callback) callback()
            },
          }
        )
      },
      renderDemandListData(isEditMode) {
        let column,
          $el,
          value,
          user_name,
          context = this,
          formTypeMap = {
            2: `${i18n('Inquiry_Order')}`,
          }

        if (isEditMode) {
          $(
            '#rfq-detail-edit>fieldset:not([id=custom-rfq-column]) .value'
          ).each((i, el) => {
            $el = $(el)
            column = $el.find('.form-control')[0].name
            switch (column) {
              case 'create_time':
                value = context.rfqContent[column]
                  ? moment(new Date(context.rfqContent[column])).format(
                      'YYYY/MM/DD HH:mm:ss'
                    )
                  : ''
                break
              case 'st_lead_time':
              case 'st_po_time':
                value = context.rfqContent[column]
                  ? moment(context.rfqContent[column], 'MMM DD, YYYY').format(
                      'YYYY/MM/DD'
                    )
                  : ''
                break
              case 'form_type':
                value = '2'
                break
              case 'reason':
                value = ''
                break
              default:
                value = context.rfqContent[column]
                break
            }
            $el
              .find('.form-control')
              .val(value === undefined ? '' : value)
              .end()
              .prev()
              .toggleClass(
                'updated',
                context.rfqContent.changed_column.includes(column)
              )
          })
          context.rfqForm.setValue(
            _.extend({}, context.rfqContent, {
              // light_brand: context.rfqContent['light_brand'].split('&').filter(s => s.includes('品牌')).join('&'),
            })
          )
          for (var id in context.rfqForm.columnsMap) {
            context.rfqForm.columnsMap[id].$label.toggleClass(
              'updated',
              context.rfqContent.changed_column.includes(id)
            )
          }
          for (id in context.rfqForm.subGroupMap) {
            context.rfqForm.subGroupMap[id].$container
              .find('.group-subtitle')
              .toggleClass(
                'updated',
                context.rfqContent.changed_column.includes(id)
              )
          }
        } else {
          const lampTypeMap = {
            '0': '点光源',
            '1': '洗墙灯/线条灯',
            '2': '投光灯',
          }
          $(
            '#rfq-detail-view fieldset:visible:not(#custom-rfq-column-view) .value'
          ).each((i, el) => {
            $el = $(el)
            column = $el.data('column')
            switch (column) {
              case 'create_time':
                value = context.rfqContent[column]
                  ? moment(new Date(context.rfqContent[column])).format(
                      'YYYY/MM/DD HH:mm:ss'
                    )
                  : ''
                break
              case 'st_lead_time':
              case 'st_po_time':
                value = context.rfqContent[column]
                  ? moment(context.rfqContent[column], 'MMM DD, YYYY').format(
                      'YYYY/MM/DD'
                    )
                  : ''
                break
              case 'form_type':
                value =
                  formTypeMap[context.rfqContent[column]] ||
                  `${i18n('Inquiry_Order')}`
                break
              case 'create_by':
                user_name =
                  context.preCon.getUserName[context.rfqContent[column]]
                value = user_name ? user_name : context.rfqContent[column]
                break
              default:
                value = context.rfqContent[column]
                break
            }

            $el
              .text(value === undefined ? '' : value)
              .prev()
              .toggleClass(
                'updated',
                context.rfqContent.changed_column.includes(column)
              )
          })
          context.rfqView.setValue(
            _.extend({}, context.rfqContent, {
              lamp_type: lampTypeMap[context.rfqContent['lamp_type']],
            })
          )
          for (id in context.rfqView.columnsMap) {
            context.rfqView.columnsMap[id].$label.toggleClass(
              'updated',
              context.rfqContent.changed_column.includes(id)
            )
          }
          for (id in context.rfqView.subGroupMap) {
            context.rfqView.subGroupMap[id].$container
              .find('.group-subtitle')
              .toggleClass(
                'updated',
                context.rfqContent.changed_column.includes(id)
              )
          }
        }
      },
      getRfqFormValue() {
        const context = this
        const data = context.rfqForm.getValue()

        $('#rfq-detail-edit fieldset:visible:not(#custom-rfq-column)').each(
          (i, el) => {
            $(el)
              .find('.form-control')
              .each((i, element) => {
                if (element.value) data[element.name] = element.value
              })
          }
        )

        return data
      },
      saveDemandListData($submitBtn) {
        const context = this
        const { form_id } = context
        const formData = {
          is_log:
            ((context.userAuth.account || context.userAuth.accountAst) &&
              context.status !== '0') ||
            context.userAuth.presale,
          form_id: context.form_id,
        }
        const $editBtn = $submitBtn.next()
        const $cancelBtn = $editBtn.next()
        const isTempSave = context.status === '0'
        context.commons.checkIsRfqCanceled({
          form_id,
          uncancelCallback() {
            // 暫存不用檢查資料
            if (isTempSave) {
              Object.assign(formData, context.getRfqFormValue())
              // 沒填的欄位補上null
              _.each(context.preCon.rfqColumnConfig, (value, key) => {
                if (
                  key !== 'order' &&
                  !Object.prototype.hasOwnProperty.call(formData, key)
                ) {
                  formData[key] = null
                }
              })
            } else {
              context.validator = $('#rfq-detail').validate({
                errorPlacement(error, $el) {
                  $el.closest('.value').append(error)
                },
              })
              const isValid = context.validator.form()
              if (!isValid) {
                return alert(`${i18n('Form_Is_Not_Completed')}`)
              }
              Object.assign(formData, context.getRfqFormValue())
              formData.po_qty = parseFloat(formData.po_qty).toFixed(3)
              // 沒填的欄位補上null
              _.each(context.preCon.rfqColumnConfig, (value, key) => {
                if (
                  key !== 'order' &&
                  !Object.prototype.hasOwnProperty.call(formData, key)
                ) {
                  formData[key] = null
                }
              })
            }
            servkit.ajax(
              {
                url: 'api/strongled/saverfq',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(formData),
              },
              {
                success() {
                  context.getDemandListData()
                  $('#rfq-detail').removeClass('editable')
                  $submitBtn.data('is-edit', false).text(`${i18n('Send_Out')}`)
                  $editBtn.show()
                  $cancelBtn.hide()
                },
              }
            )
          },
          canceledCallback() {
            context.$rfqCanceledModal.modal('show')
          },
        })
      },
      confirmDemandList() {
        const context = this
        const { rfqContent, form_id } = context
        const columnInfo = context.preCon.rfqColumnConfig
        const getMaterialByRuleMap = () => {
          const ruleMap = context.preCon.brandModelTempMtlMap
          const brand = rfqContent.light_brand
            .split('&')
            .reduce((a, brandStr) => {
              const brandArr = brandStr.split('=')
              const subColumnId = brandArr[0].split('_')[0]
              const isBrand = brandArr[0].split('_')[1] === '品牌'
              if (!a[subColumnId]) {
                a[subColumnId] = {}
              }
              a[subColumnId][isBrand ? 'lamp_bead_brand' : 'lamp_bead_model'] =
                brandArr[1]
              return a
            }, {})
          const model_number = rfqContent.model_number
          const color_temperature = ((color_temperature) => {
            return color_temperature
              ? color_temperature.split('&').map((s) => s.split('=')[1])
              : null
          })(rfqContent.color_temperature)
          const lamp_bead_number = rfqContent.lamp_bead_number
          const watt = rfqContent.watt
          const singlePower = Number(watt) / Number(lamp_bead_number)
          let single_power_class
          if (singlePower <= 0.5) {
            single_power_class = 's'
          } else if ((singlePower > 0.5) & (singlePower <= 1)) {
            single_power_class = 'm'
          } else if (singlePower > 1) {
            single_power_class = 'l'
          }
          const requestParams = {
            single_power_class,
            model_number,
          }
          let currentMap = ruleMap
          let field = currentMap.field
          const mtlMap = {}
          const lamp_beads_composition = rfqContent.lamp_beads_composition
          const multiplierMap = lamp_beads_composition
            .split('+')
            .reduce((a, x) => {
              const matchObj = x.match(/(^\d*)([A-Z]+)/)
              const coef = matchObj[1]
              const subColumnId = matchObj[2]
              if (coef) {
                if (subColumnId === 'N' || subColumnId === 'L') {
                  a['W'] = Number(coef)
                } else {
                  a[subColumnId] = Number(coef)
                }
              }
              return a
            }, {})
          while (currentMap && field !== 'lamp_bead_type') {
            currentMap = currentMap[requestParams[field]]
            field = currentMap.field
          }
          const lampBeadTypeMap = currentMap
          _.each(brand, (brandModelMap, lamp_bead_type) => {
            mtlMap[lamp_bead_type] = {}
            currentMap = lampBeadTypeMap
            requestParams.lamp_bead_brand = brandModelMap.lamp_bead_brand
            requestParams.lamp_bead_model = brandModelMap.lamp_bead_model
            currentMap = currentMap[lamp_bead_type]
            field = currentMap.field
            if (field === 'model_number') {
              const isOthers = !Object.prototype.hasOwnProperty.call(
                currentMap,
                requestParams.model_number
              )
              currentMap =
                currentMap[isOthers ? 'others' : requestParams.model_number]
              field = currentMap.field
            }
            if (field === 'color_temperature') {
              const colorTempMap = currentMap
              color_temperature.forEach((temp) => {
                currentMap = colorTempMap
                currentMap = currentMap[temp]
                field = currentMap.field
                while (currentMap && field) {
                  currentMap = currentMap[requestParams[field]]
                  field = currentMap.field
                }
                const multiplier = multiplierMap[lamp_bead_type]
                if (currentMap) {
                  _.each(currentMap, (qty, mtl_id) => {
                    mtlMap[lamp_bead_type][mtl_id] = qty * multiplier
                  })
                }
              })
            } else {
              while (currentMap && field) {
                currentMap = currentMap[requestParams[field]]
                field = currentMap.field
              }
              const multiplier = multiplierMap[lamp_bead_type]
              if (currentMap) {
                _.each(currentMap, (qty, mtl_id) => {
                  mtlMap[lamp_bead_type][mtl_id] = qty * multiplier
                })
              }
            }
          })
          return mtlMap
        }
        context.commons.checkIsRfqCanceled({
          form_id,
          uncancelCallback() {
            if (context.userAuth.account || context.userAuth.accountAst) {
              if (context.status === '0') {
                $('#edit-demand-list').click()
                context.validator = $('#rfq-detail').validate({
                  errorPlacement(error, $el) {
                    $el.closest('.value').append(error)
                  },
                })
                if (!context.validator.form()) {
                  return alert(`${i18n('Form_Is_Not_Completed')}`)
                }
              }
              servkit.ajax(
                {
                  url: 'api/strongled/changestatus',
                  type: 'POST',
                  contentType: 'application/json',
                  data: JSON.stringify({
                    form_id: context.form_id,
                    status: 1,
                    quote_status: 30,
                  }),
                },
                {
                  success() {
                    context.goPreviousPage()
                  },
                }
              )
            } else if (context.userAuth.presale) {
              const column = _.chain(columnInfo)
                .pick((val) => val.required)
                .map((val, key) => key)
                .value()
                .concat(['series', 'model_number'])
              const mtlMap = _.reduce(
                getMaterialByRuleMap(),
                (a, map) => {
                  _.each(map, (qty, mtl_id) => {
                    if (a[mtl_id]) {
                      a[mtl_id] += qty
                    } else {
                      a[mtl_id] = qty
                    }
                  })
                  return a
                },
                {}
              )
              servkit.ajax(
                {
                  url: 'api/strongled/confirmrfq',
                  type: 'PUT',
                  contentType: 'application/json',
                  data: JSON.stringify({
                    form_id: context.form_id,
                    column, // 標品需比較的欄位
                    mtlMap,
                  }),
                },
                {
                  success() {
                    context.goPreviousPage()
                  },
                }
              )
            }
          },
          canceledCallback() {
            context.$rfqCanceledModal.modal('show')
          },
        })
      },
      initRfqForm() {
        const context = this
        const { canEditSeriesAndModel, canEditRfq } = context.userAuth

        servkit.initSelectWithList(
          context.preCon.getUserName,
          $('select[name="create_by"]')
        )
        servkit.initDatePicker($('.date'), null, false, false)
        context.commons.initValidationSetting()
        return context.commons
          .createRfqForm('#custom-rfq-column')
          .then((rfqForm) => {
            window.rfqform = context.rfqForm = rfqForm
            context.rfqForm.columnsMap['series'].toggleDisable(
              !canEditSeriesAndModel
            )
            context.rfqForm.columnsMap['model_number'].toggleDisable(
              !canEditSeriesAndModel
            )
            return context.commons.createRfqView('#custom-rfq-column-view')
          })
          .then((rfqView) => {
            window.rfqview = context.rfqView = rfqView
          })
          .then(() => {
            // 修改詢價單
            const $editRfqButtonsPanel = $(
              '#demand-list-information-widget footer'
            )
            const isTempSave = canEditRfq && context.status === '0'
            $('#rfq-detail-edit')
              .find('[name=reason]')
              .parent()
              .toggle(!isTempSave)
              .prev()
              .toggle(!isTempSave)
            if (canEditRfq) {
              $editRfqButtonsPanel
                .find('#cancel-edit-demand-list')
                .hide()
                .end()
                .on('click', '#submit-demand-list', function (evt) {
                  evt.preventDefault()
                  const $submitBtn = $(this)
                  const isEdit = $submitBtn.data('is-edit')
                  if (isEdit) {
                    context.saveDemandListData($submitBtn)
                  } else {
                    context.confirmDemandList($submitBtn)
                  }
                })
                .on('click', '#edit-demand-list', function (evt) {
                  evt.preventDefault()
                  context.editRfq($(this))
                })
                .on('click', '#cancel-edit-demand-list', function (evt) {
                  evt.preventDefault()
                  context.cancelEditRfq($(this))
                })
            } else {
              $editRfqButtonsPanel.hide()
            }
          })
      },
      editRfq($editBtn) {
        const context = this,
          $cancelBtn = $editBtn.next(),
          $submitBtn = $editBtn.prev()

        context.renderDemandListData(true)
        $('#rfq-detail').addClass('editable')
        if (context.validator && context.validator.errorList.length) {
          context.validator.destroy()
        }
        $cancelBtn.show()
        $editBtn.hide()
        $submitBtn.text(`${i18n('Store')}`).data('is-edit', true)
      },
      cancelEditRfq($cancelBtn) {
        const $editBtn = $cancelBtn.prev()
        const $submitBtn = $editBtn.prev()
        $('#rfq-detail').removeClass('editable')
        $cancelBtn.hide()
        $editBtn.show()
        $submitBtn.text(`${i18n('Send_Out')}`).data('is-edit', false)
      },
      // 標品查詢結果
      initSimilarlyTable() {
        const context = this
        const { $materialWidget } = context
        const $tableElement = $('#matched-rfq')
        const $tableWidget = $('#matched-rfq-widget')
        const downloadCostFile = (() => {
          let hiddenFormId
          let $submitForm
          const iframeHtml =
            '<iframe name="download_target" style="width:0;height:0;border:0px solid #fff;"></iframe>'
          return ($this) => {
            const html = $this.html()
            const name = html.split('/')[3]
            const path = html.replace('/' + name, '')
            const url = 'api/queryRFQ/getFile'
            const param = {
              file_name: name,
              file_path: path,
            }
            if (hiddenFormId) {
              $(`#${hiddenFormId}`).remove()
            }
            hiddenFormId =
              'hiddenFormId' + moment().format('YYYYMMDDHHmmssSSSS')
            $submitForm = $(`<form id="${hiddenFormId}"></form>`)
            _.each(param, (value, key) => {
              $submitForm.append($('<input>').attr('name', key).val(value))
            })
            $submitForm.attr({
              action: servkit.rootPath + '/' + url,
              method: 'GET',
              target: 'download_target',
            })
            $this.after($submitForm.hide())
            $submitForm.append(iframeHtml)
            document.querySelector('#' + hiddenFormId).submit()
          }
        })()
        const selectReferenceRfq = () => {
          const $tr = $tableElement.find('tbody :checked').closest('tr')
          if (!$tr.length) {
            $tableElement.addClass('bling')
            return setTimeout(() => $tableElement.removeClass('bling'), 1000)
          }
          const rowData = context.$matchedRfqTable.table.row($tr).data()
          const { form_id, mtl_cost, produce_coef } = rowData

          servkit.ajax(
            {
              url: 'api/strongled/rfqMaterialStructureLog',
              type: 'GET',
              data: {
                form_id,
                role: 'pc',
              },
            },
            {
              success(data) {
                $materialWidget.show()
                context.drawMaterialTable(
                  data.map((x) =>
                    _.extend(
                      {
                        isSaved: true,
                      },
                      x
                    )
                  )
                )
              },
            }
          )
          context.$mtlCost.text(mtl_cost)
          context.$produceCoef.text(produce_coef)
          context.calcRecommendedPrice()
        }
        const bindEvent = () => {
          const $table = $('#matched-rfq')
          const $selectAllCheckbox = $table.find('thead :checkbox')
          // 隱藏全選，改成單選
          $selectAllCheckbox.hide()
          $table
            .on('click', 'tbody :checkbox', function () {
              const cb = this
              const isChecked = cb.checked
              if (isChecked) {
                $table.find('tbody :checked').each((i, el) => {
                  if (el !== cb) {
                    el.checked = false
                  }
                })
              }
            })
            .on('click', '.btn-download', function (e) {
              e.preventDefault()
              downloadCostFile($(this))
            })
          // 選定標品
          $('#pick-rfq').on('click', function (e) {
            e.preventDefault()
            selectReferenceRfq()
          })
        }
        const getMatchedField = (fieldsMap) => {
          const matchAr = _.map(fieldsMap, (value, key) => {
            return `${i18n(
              context.preCon.rfqColumnConfig[key].i18n
            )}：<span style="color:red;">${
              value || `${i18n('This_Option_Is_Not')}`
            }</span>`
          })
          return matchAr.join('<br>')
        }
        if (!context.userAuth.canSeeSimilarProductTable) {
          $tableWidget.addClass('hide')
          return
        }
        const columns = [
          {
            name: 'form_id',
            title: `${i18n('RFQ_Number')}`,
            data: 'form_id',
            width: '10%',
            filterType: 'input',
          },
          {
            name: 'product_info',
            title: `${i18n('Product_Description')}`,
            data: null,
            width: '15%',
            render(data, type, rowData) {
              const {
                model_number,
                color_temperature,
                lamp_length,
                watt,
              } = rowData
              return `${i18n('Lighting_Model')}： ${model_number || '--'}<br>
                ${i18n('Color_Temperature_Value')}： ${
                color_temperature
                  ? color_temperature.replace(/&/g, '、').replace(/=/g, '_')
                  : '--'
              }<br>
                ${i18n('Lighting_Length')}： ${lamp_length || '--'}<br>
                ${i18n('Lighting_Power')}： ${watt || '--'}`
            },
            filterType: 'input',
          },
          {
            name: 'cus_id',
            title: `${i18n('clients_name')}`,
            data: 'cus_id',
            width: '15%',
            filterType: 'input',
          },
          {
            name: 'mtl_cost',
            title: `${i18n('Cost_of_Material')}`,
            data: 'mtl_cost',
            type: 'num',
            width: '8%',
            filterType: 'input',
          },
          {
            name: 'produce_coef',
            title: `${i18n('Factory_profit')}`,
            data: 'produce_coef',
            type: 'num',
            width: '8%',
            filterType: 'input',
          },
          {
            name: 'market_coef',
            title: `${i18n('Market_profits')}`,
            data: 'market_coef',
            type: 'num',
            width: '8%',
            filterType: 'input',
          },
          {
            name: 'quote',
            title: `${i18n('Quoted_price')}`,
            data: 'quote',
            type: 'num',
            width: '8%',
            filterType: 'input',
          },
          {
            name: 'matched_fields',
            title: `${i18n('Compare_match_field')}`,
            data: null,
            width: '15%',
            render(data, type, rowData) {
              return getMatchedField(
                context.compareFields.reduce((a, field) => {
                  if (rowData[field]) {
                    a[field] = rowData[field]
                  } else {
                    a[field] = null
                  }
                  return a
                }, {})
              )
            },
            filterType: 'input',
          },
          {
            name: 'bom_file',
            title: `${i18n('Cost_Analysis_Archives')}`,
            data: null,
            width: '30%',
            render(data, type, rowData) {
              const value = rowData.bom_file_path + rowData.bom_file_name || ''
              if (type === 'display') {
                return `<a href="" class="btn-download">${value}</a>`
              } else {
                return data
              }
            },
          },
        ]
        const unorderableCols = ['product_info', 'matched_fields', 'bom_file']
        context.commons.fillTableFilter($tableElement, columns)
        context.commons.fillTableTitle($tableElement, columns)
        context.$matchedRfqTable = createReportTable({
          $tableElement,
          $tableWidget,
          columns,
          columnDefs: [
            {
              orderable: false,
              targets: unorderableCols.map((name) =>
                context.commons.getColumnIndex(name, columns)
              ),
            },
          ],
          order: [[context.commons.getColumnIndex('quote', columns), 'asc']],
          showNoData: false,
          checkbox: true,
          hideCols: ['bom_file'].map((name) =>
            context.commons.getColumnIndex(name, columns)
          ), // TODO: 成本分析檔案的去留
          customBtns: [
            `<button disabled class="btn btn-primary" id="pick-rfq">${i18n(
              'Selected_Standard_Products'
            )}</button>`,
          ],
          onInit() {
            const status = context.rfqContent.status
            const isFillMarketCoef =
              context.userAuth.assistant && (status === 36 || status === 41)
            const isStdProduct = status === 41
            if (isFillMarketCoef && isStdProduct) {
              $('#pick-rfq').prop('disabled', false)
              $('#price-alert').removeClass('hide')
            }
            bindEvent()
            context.getSimilarRfq()
          },
        })
      },
      getSimilarRfq() {
        const context = this
        const $tableWidget = $('#matched-rfq-widget')
        if (context.status === '0') {
          $tableWidget.addClass('hide')
          return
        }
        const column = _.chain(context.preCon.rfqColumnConfig)
          .pick((value) => value.required)
          .keys()
          .value()
        context.compareFields = column
        servkit.ajax(
          {
            url: 'api/strongled/getsimilarrfq',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              form_id: context.form_id,
              column,
            }),
          },
          {
            success(data) {
              if (data.length) {
                $('#compared-columns').text(
                  column
                    .map(
                      (col) =>
                        i18n(context.preCon.rfqColumnConfig[col].i18n) || ''
                    )
                    .join(' / ')
                )
                context.commons.fillFilterOptions(
                  data,
                  context.$matchedRfqTable
                )
                context.$matchedRfqTable.table.clear().rows.add(data).draw()
              } else {
                $tableWidget.addClass('hide')
              }
            },
          }
        )
      },
      // 報價確認
      initPriceConfirmWidget() {
        const context = this
        const { form_id, rfqContent } = context
        const $priceConfirmWidget = $('#price-confirm-widget')
        const initQuoteHistoryTable = () => {
          const columns = [
            {
              title: `${i18n('Time')}`,
              name: 'create_time',
              data: 'create_time',
              width: '30%',
              type: 'date',
              render(data) {
                return data || ''
              },
            },
            {
              title: `${i18n('Quoted_price')}`,
              name: 'quote',
              data: 'quote',
              width: '20%',
              type: 'num',
              render(data) {
                return data || ''
              },
            },
            {
              title: `${i18n('Remark')}`,
              name: 'reason',
              data: 'reason',
              width: '50%',
              render(data) {
                return data || ''
              },
            },
          ]
          context.quoteHistoryTable = createReportTable({
            $tableElement: $('#quote-history-table'),
            showNoData: false,
            columns,
            order: [
              [context.commons.getColumnIndex('create_time', columns), 'desc'],
            ],
          })
        }
        const initRequestDiscountHistoryTable = () => {
          const columns = [
            {
              title: `${i18n('Time')}`,
              name: 'create_time',
              data: 'create_time',
              width: '20%',
              type: 'date',
              render(data) {
                return data || ''
              },
            },
            {
              title: `${i18n('Quoted_price')}`,
              name: 'quote',
              data: 'quote',
              width: '15%',
              type: 'num',
              render(data) {
                return data || ''
              },
            },
            {
              title: `${i18n('The_Reason')}`,
              name: 'reason',
              data: 'reason',
              width: '40%',
              render(data) {
                return data || ''
              },
            },
            {
              title: `${i18n('Requester')}`,
              name: 'create_by',
              data: 'create_by',
              width: '25%',
              render(data) {
                return context.preCon.getUserName[data] || data || ''
              },
            },
          ]
          context.requestDiscountHistoryTable = createReportTable({
            $tableElement: $('#request-discount-history-table'),
            showNoData: false,
            columns,
            order: [
              [context.commons.getColumnIndex('create_time', columns), 'desc'],
            ],
          })
        }
        const bindEvent = () => {
          const editQuote = () => {
            const $form = $('#edit-quote-form')
            const $quote = $form.find('input[name="quote"]')
            const $remark = $form.find('input[name="remark"]')
            const quote = parseFloat($quote.val())
            const remark = $remark.val()
            const isQuoteOutofRange = quote > 999999
            if (isQuoteOutofRange) {
              return alert(
                `${i18n('Offer_Can_Not_Be_Greater_Than_One_Million')}`
              )
            }
            context.commons.checkIsRfqCanceled({
              form_id,
              uncancelCallback() {
                servkit.ajax(
                  {
                    url: 'api/strongled/editquote',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({
                      quote_status: 1,
                      form_id: context.form_id,
                      quote,
                      remark,
                    }),
                  },
                  {
                    success() {
                      $('#quote').text(quote)
                      $('#edit-quote-modal-widget').modal('hide')
                      $('#show-edit-price-modal-btn').hide()
                    },
                  }
                )
              },
              canceledCallback() {
                $('#edit-quote-modal-widget').modal('hide')
                context.$rfqCanceledModal.modal('show')
              },
            })
          }
          const confirmQuote = () => {
            const $produce_coef = context.$produceCoef.find('input')
            const $market_coef = context.$marketCoef.find('input')
            const $quote = $('#quote')
            const mtl_cost = parseFloat(context.$mtlCost.text())
            const produce_coef = $produce_coef.length
              ? parseFloat($produce_coef.val())
              : parseFloat(context.$produceCoef.text())
            const market_coef = $market_coef.length
              ? parseFloat($market_coef.val())
              : parseFloat(context.$marketCoef.text())
            const po_qty = context.rfqContent.po_qty
            const quote =
              context.rfqContent.quote ||
              Math.round(mtl_cost * produce_coef * market_coef * po_qty)
            const isRecommendQuote = !context.rfqContent.quote
            const isQuoteOutofRange = isRecommendQuote && quote > 999999
            let requestBody
            if (Number.isNaN(mtl_cost)) {
              return alert(`${i18n('Please_Select_Standard_Products')}`)
            }
            if (isQuoteOutofRange) {
              return alert(
                `${i18n('Offer_Can_Not_Be_Greater_Than_One_Million')}`
              )
            }
            if (isFillMarketCoef) {
              requestBody = {
                mtl_cost,
                produce_coef,
                market_coef,
                quote,
                form_id,
                status: context.quote_status === 99 ? 99 : 98,
                quote_status: context.quote_status === 99 ? 99 : 1,
              }
            }
            if (isFillProduceCoef) {
              requestBody = {
                status: 36,
                quote_status: context.quote_status,
                produce_coef,
                form_id,
              }
            }
            context.commons.checkIsRfqCanceled({
              form_id,
              uncancelCallback() {
                servkit.ajax(
                  {
                    url: 'api/strongled/changestatus',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(requestBody),
                  },
                  {
                    success() {
                      // 若填市場利潤且是建議報價(無提前編輯報價)，記錄報價
                      if (isFillMarketCoef && isRecommendQuote) {
                        servkit.ajax(
                          {
                            url: 'api/stdcrud',
                            type: 'POST',
                            contentType: 'application/json',
                            data: JSON.stringify({
                              tableModel:
                                'com.servtech.servcloud.app.model.strongLED.QuotationLog',
                              remark: `${i18n('Offer_Suggestions')}`,
                              form_id,
                              quote,
                            }),
                          },
                          {
                            success() {
                              context.goPreviousPage()
                            },
                          }
                        )
                      } else {
                        context.goPreviousPage()
                      }
                    },
                  }
                )
              },
              canceledCallback() {
                context.$rfqCanceledModal.modal('show')
              },
            })
          }
          const isRequestingDiscount = context.quote_status === 20
          const changeToRequestDiscountTab = () =>
            $('#widget-tab-1 a[href="#tab2"]').click()
          const getAndDrawQuotationLog = () => {
            servkit.ajax(
              {
                url: 'api/stdcrud',
                type: 'GET',
                data: {
                  tableModel:
                    'com.servtech.servcloud.app.model.strongLED.QuotationLog',
                  whereClause: `form_id='${form_id}'`,
                },
              },
              {
                success(data) {
                  context.quoteHistoryTable.table.clear().rows.add(data).draw()
                },
              }
            )
          }
          const getAndDrawRequestDiscountLog = () => {
            servkit.ajax(
              {
                url: 'api/stdcrud',
                type: 'GET',
                data: {
                  tableModel:
                    'com.servtech.servcloud.app.model.strongLED.RequestDiscountLog',
                  whereClause: `form_id='${form_id}'`,
                },
              },
              {
                success(data) {
                  context.requestDiscountHistoryTable.table
                    .clear()
                    .rows.add(data)
                    .draw()
                },
              }
            )
          }
          $('#quote-history-modal-widget').on('show.bs.modal', function () {
            if (isRequestingDiscount) {
              changeToRequestDiscountTab()
            }
            getAndDrawQuotationLog()
            getAndDrawRequestDiscountLog()
          })
          $('#edit-quote-modal-widget').on('show.bs.modal', function () {
            const quote = $('#quote').text()
            // let recommendQuote = $('#price').text();
            // const po_qty = context.rfqContent.po_qty || 1;
            // recommendQuote = recommendQuote !== '---' ? Number(recommendQuote) : '';
            // quote = quote ? Number(quote) : (recommendQuote * po_qty);
            $('#edit-quote-form')
              .find('input[name="quote"]')
              .val(quote)
              .end()
              .find('input[name="remark"]')
              .val('')
          })
          $priceConfirmWidget
            .on('keydown', 'input', function (e) {
              // enter後就submit改成onchange來算出報價
              if (e.keyCode === 13) {
                $(this).change()
                e.preventDefault()
              }
            })
            .on('change', 'input', function (e) {
              e.preventDefault()
              context.calcRecommendedPrice()
            })
            .on('keyup', 'input', function (e) {
              e.preventDefault()
              context.calcRecommendedPrice()
            })

          servkit.validateForm($('#edit-quote-form'), $('#edit-quote-btn'))
          $('#edit-quote-btn').on('click', editQuote)
          servkit.validateForm($('#price-confirm'), $('#price-confirm-btn'))
          $('#price-confirm-btn').on('click', confirmQuote)
        }
        const {
          mtl_cost = '',
          produce_coef = '',
          market_coef = '',
          quote = '',
          status,
          quote_status,
          po_qty = '',
        } = rfqContent
        const isFillMarketCoef =
          context.userAuth.assistant && (status === 36 || status === 41)
        const isFillProduceCoef = context.userAuth.financial && status === 26
        const isStdProduct = status === 41
        const canEditQuote =
          context.userAuth.canEditQuote &&
          status >= 16 &&
          status !== 99 &&
          quote_status !== 10 &&
          quote_status !== 1

        if (context.userAuth.canSeePriceConfirmWidget) {
          context.$mtlCost.html(mtl_cost)
          context.$poQty.text(po_qty)

          context.$produceCoef.html(
            isFillProduceCoef
              ? `<input name="produce-coef" class="required vld-pos-num" type="text">`
              : produce_coef
          )
          context.$marketCoef.html(
            isFillMarketCoef
              ? `<input name="market-coef" class="required vld-pos-num" type="text">`
              : market_coef
          )
          $('#price-confirm footer').toggle(
            isFillProduceCoef || isFillMarketCoef || canEditQuote
          )
          $('#show-edit-price-modal-btn').toggle(canEditQuote)
          if (context.userAuth.canSeeQuoteRecords) {
            $('#show-quote-history-modal-btn').removeClass('hide')
            initRequestDiscountHistoryTable()
            initQuoteHistoryTable()
          }
          if (context.userAuth.canSeeQuote) {
            $('#quote').text(quote)
          } else {
            $('#quote').parent().hide()
          }
          if (!isFillMarketCoef && !isFillProduceCoef) {
            $('#price-confirm-btn').hide()
          }
          bindEvent()
          context.calcRecommendedPrice()
        } else {
          $priceConfirmWidget.addClass('hide')
        }
      },
      calcRecommendedPrice() {
        const context = this
        const $produce_coef = context.$produceCoef.find('input')
        const $market_coef = context.$marketCoef.find('input')
        const $recommendQuote = $('#price')
        const $quote = $('#quote')
        const po_qty = context.rfqContent.po_qty || 1
        let mtl_cost = context.$mtlCost.text()
        let produce_coef = $produce_coef.length
          ? $produce_coef.val()
          : context.$produceCoef.text()
        let market_coef = $market_coef.length
          ? $market_coef.val()
          : context.$marketCoef.text()
        let recommendQuote

        mtl_cost = mtl_cost === '' ? 0 : parseFloat(mtl_cost)
        produce_coef = produce_coef === '' ? 1 : parseFloat(produce_coef)
        market_coef = market_coef === '' ? 1 : parseFloat(market_coef)
        recommendQuote = mtl_cost * produce_coef * market_coef
        $recommendQuote.text(recommendQuote ? recommendQuote.toFixed() : '---')
        if (!context.rfqContent.quote) {
          $quote.text(
            recommendQuote ? (recommendQuote * po_qty).toFixed() : '---'
          )
        }
      },
    },
    preCondition: {
      getUserName(done) {
        servkit.ajax(
          {
            url: 'api/user/read',
            type: 'GET',
            data: {
              tableModel: 'com.servtech.servcloud.module.model.SysUser',
            },
          },
          {
            success(data) {
              var userData = {}
              _.each(data, (elem) => {
                userData[elem.user_id] = elem.user_name
              })
              done(userData)
            },
          }
        )
      },
      userAuth(done) {
        const context = this
        const { status } = context
        context.commons.initAuth(done, status)
      },
      rfqColumnConfig(done) {
        $.get(
          './app/StrongLED/data/rfqColumnConfig.json?' + new Date().getTime(),
          (res) => {
            done(res)
          }
        )
      },
      brandModelTempMtlMap(done) {
        $.get(
          './app/StrongLED/data/brandModelTempMtlMap.json?' +
            new Date().getTime(),
          (res) => {
            done(res)
          }
        )
      },
      structureIds(done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_strongled_product_structure',
              columns: ['structure_id', 'structure_name'],
              whereClause: '1 ORDER BY structure_id ASC',
            }),
          },
          {
            success(data) {
              let id
              let name
              done(
                data.reduce((a, map) => {
                  id = map.structure_id
                  name = map.structure_name
                  a[id] = name
                  return a
                }, {})
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
