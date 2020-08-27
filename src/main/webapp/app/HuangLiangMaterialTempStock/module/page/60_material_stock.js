export default function () {
  GoGoAppFun({
    gogo(context) {
      context.initAuth()
      context.initQueryForm()
      context.initReportTable()
      context.initRecordTable()
      context.initAdjustModal()
      context.bindEvent()
    },
    util: {
      $submitBtn: $('#submit-btn'),
      $mrp: $('#mrp'),
      $material: $('#material'),
      $modalAdjust: $('#modal-adjust'),
      $modalRecord: $('.modal-record'),
      $location: $('#location'),
      $reportTable: $('#table'),
      $matInfos: $('#modal-adjust').find('.mat-info'),
      userGroup:
        JSON.parse(sessionStorage.getItem('loginInfo')).user_group || [],
      allowQtyAdjustGroup: undefined,
      allowChgRecordGroup: undefined,
      qtyAdjustPermission: undefined,
      chgRecordPermission: undefined,
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      chgRecordTable: undefined,
      reportTable: undefined,
      recordTypeMap: {
        1: '數量',
        2: '儲位',
      },
      initAuth() {
        const context = this
        // 可做「數量修改」群組: 廠務
        context.allowQtyAdjustGroup = [
          context.commons.matStockGroup.mis,
          context.commons.matStockGroup.fs,
        ]
        context.qtyAdjustPermission = _.intersection(
          context.allowQtyAdjustGroup,
          context.userGroup
        ).length
          ? true
          : false

        // 可做「異動記錄查詢」群組: 廠務、MIS、高階主管
        context.allowChgRecordGroup = [
          context.commons.matStockGroup.fs,
          context.commons.matStockGroup.mis,
          context.commons.matStockGroup.tm,
        ]
        context.chgRecordPermission = _.intersection(
          context.allowChgRecordGroup,
          context.userGroup
        ).length
          ? true
          : false

        const canChgRecordLocationGroupList = [
          'material_stock_factory_service',
          'sys_manager_group',
        ]
        context.canChgRecordLocation =
          context.userGroup.findIndex((group) =>
            canChgRecordLocationGroupList.includes(group)
          ) >= 0
      },
      initQueryForm() {
        const context = this
        context.commons.initMstockNameSelect(context.$mrp)
        context.initMaterialSelect()
        context.initLocationSelect()

        context.$submitBtn.on('click', function (evt) {
          evt.preventDefault()
          context.getMatStockData()
        })
      },
      initReportTable() {
        const context = this
        const columns = [
          {
            name: 'mstock_name',
            data: 'mstock_name',
          },
          {
            name: 'po_no',
            data: 'po_no',
          },
          {
            name: 'sup_id',
            data: 'sup_id',
          },
          {
            name: 'mat_code',
            data: 'mat_code',
          },
          {
            name: 'mat_id',
            data: 'mat_id',
          },
          {
            name: 'mat_od',
            data: 'mat_od',
            render(data) {
              return data || ''
            },
          },
          {
            name: 'mat_length',
            data: 'mat_length',
            render(data) {
              return data || ''
            },
          },
          {
            name: 'mat_color',
            data: 'mat_color',
            render(data) {
              return data || ''
            },
          },
          {
            name: 'location',
            data: 'location',
          },
          {
            name: 'mstock_qty',
            data: 'mstock_qty',
          },
          {
            name: 'mrp_bcode',
            data: 'mrp_bcode',
            render(data) {
              return data || ''
            },
          },
          {
            name: 'shelf_time',
            data: 'shelf_time',
            render(data) {
              return data.toFormatedDatetime()
            },
          },
          {
            name: 'adjust_qty',
            data: null,
            render(data, type, rowData) {
              return `<button class="btn btn-primary qty-adjust">設定</button>`
            },
          },
          {
            name: 'adjust_location',
            data: null,
            render(data, type, rowData) {
              return `<button class="btn btn-primary location-adjust">變更</button>`
            },
          },
          {
            name: 'adjustment_record',
            data: null,
            render(data, type, rowData) {
              return `<button class="btn btn-primary chg-record">異動紀錄</button>`
            },
          },
        ]
        const excelColName = columns.slice(0, 12).map((col) => col.name)
        const reportTableConfig = {
          $tableElement: context.$reportTable,
          $tableWidget: $('#table-widget'),
          hideCols: [],
          order: [[11, 'desc']],
          autoWidth: false,
          columns,
          excel: {
            fileName: 'MaterialStock',
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
              '0.00',
              'text',
              'text',
            ],
            customDataFunc(tableData) {
              // tableData為dataTable的物件，需轉為陣列
              return Array.from(tableData).map((data) => {
                return excelColName.map((key) =>
                  key === 'shelf_time'
                    ? data[key].toFormatedDatetime()
                    : data[key]
                )
              })
            },
            customHeaderFunc(header) {
              return header.slice(0, 12)
            },
          },
        }

        if (!context.qtyAdjustPermission) {
          reportTableConfig.hideCols.push(12)
        }
        if (!context.chgRecordPermission) {
          reportTableConfig.hideCols.push(13)
        }
        if (!context.canChgRecordLocation) {
          reportTableConfig.hideCols.push(14)
        }
        context.reportTable = createReportTable(reportTableConfig)
      },
      initAdjustModal() {
        const context = this
        context.initChgReasonSelect()
        context.initLocationSelect($('.chg-location'))
      },
      initRecordTable() {
        const context = this
        context.chgRecordTable = createReportTable({
          $tableElement: $('#chg-record-table'),
          autoWidth: false,
          showNoData: false,
          order: [[9, 'desc']],
        })
      },
      getMatStockData() {
        const context = this
        const mstock_name = context.$mrp.val()
        const mat_id = context.$material.val()
        const location = context.$location.val()
        const whereParams = []
        let whereClause = '1'

        context.loadingBtn.doing()

        if (mstock_name) {
          whereClause += ' AND mstock_name = ?'
          whereParams.push(mstock_name)
        }
        if (mat_id) {
          whereClause += ' AND mat_id = ?'
          whereParams.push(mat_id)
        }
        if (location) {
          whereClause += ' AND location IN ('
          location
            .filter((v) => v !== 'ALL')
            .forEach((v) => {
              whereClause += '?,'
              whereParams.push(v)
            })
          whereClause = whereClause.slice(0, -1) + ')'
        }

        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_huangliang_mat_stock',
              whereClause: whereClause,
              whereParams: whereParams,
            }),
          },
          {
            success(data) {
              context.reportTable.drawTable(data)
              context.loadingBtn.done()
            },
            fail(data) {
              console.log(data)
            },
          }
        )
      },
      bindEvent() {
        const context = this
        context.$reportTable
          .on('click', '.qty-adjust', function (e) {
            e.preventDefault()
            context.showAdjustmentModal(this)
          })
          .on('click', '.location-adjust', function (e) {
            e.preventDefault()
            context.showAdjustmentModal(this)
          })
          .on('click', '.chg-record', function (e) {
            e.preventDefault()
            context.showChgRecordModal(this)
          })

        context.$modalAdjust.on('click', '#adjust-confirm', function (e) {
          e.preventDefault()
          const isAdjustQty = context.$modalAdjust.hasClass('qty')
          if (isAdjustQty) {
            context.qtyAdjust()
          } else {
            context.locationAdjust()
          }
        })
      },
      showAdjustmentModal(btn) {
        const context = this
        const { $matInfos, $modalAdjust } = context
        const isQty = btn.classList.contains('qty-adjust')
        const tr = btn.closest('tr')
        const rowData = context.reportTable.table.row(tr).data()
        const { unit = '' } = rowData
        $matInfos.each((i, el) => {
          const name = $(el).data('name')
          if (name === 'shelf_time') {
            el.textContent = rowData[name].toFormatedDatetime()
          } else {
            el.textContent = rowData[name] || ''
          }
        })
        $modalAdjust.toggleClass('qty', isQty)
        $modalAdjust.toggleClass('location', !isQty)
        $modalAdjust.find('.orig-qty').text(rowData.mstock_qty + ' KG')
        $modalAdjust.data({
          rowData,
          tr,
        })
        $modalAdjust.find('.unit').text(unit)
        if (isQty) {
          $modalAdjust.find('.chg-qty').val('').attr('placeholder', unit)
        } else {
          $modalAdjust.find('.chg-location').val('')
        }
        $('#qty-incorrect').addClass('hide')
        $modalAdjust.modal('show')
      },
      qtyAdjust() {
        const context = this
        const rowData = context.$modalAdjust.data('rowData')
        const tr = context.$modalAdjust.data('tr')
        const pks = {
          shelf_time: rowData.shelf_time.toFormatedDatetime(),
          mat_code: rowData.mat_code,
        }
        const chgQty = context.$modalAdjust.find('.chg-qty').val()
        const chgReason = context.$modalAdjust.find('.chg-reason').val()

        // input qty validate
        if (!chgQty) {
          $('#qty-incorrect').removeClass('hide')
          return
        }

        servkit.ajax(
          {
            url: 'api/huangliangMatStock/poTempStock/chgMatQty',
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(
              _.extend(
                {
                  mstock_name: rowData.mstock_name,
                  po_no: rowData.po_no,
                  sup_id: rowData.sup_id,
                  location: rowData.location,
                  chg_qty: chgQty,
                  orig_qty: rowData.mstock_qty,
                  chg_type: '1',
                  chg_reason: chgReason,
                  unit: rowData.unit || '',
                },
                pks
              )
            ),
          },
          {
            success() {
              context.reportTable.table
                .cell(tr, 'mstock_qty:name')
                .data(Number(chgQty))
                .draw(false)
              // console.log(context.reportTable.table.row(tr).data())
              // context.$submitBtn.trigger('click');
              context.$modalAdjust.modal('hide')
            },
            fail(data) {
              console.log(data)
            },
          }
        )
      },
      locationAdjust() {
        const context = this
        const rowData = context.$modalAdjust.data('rowData')
        const tr = context.$modalAdjust.data('tr')
        const pks = {
          shelf_time: rowData.shelf_time.toFormatedDatetime(),
          mat_code: rowData.mat_code,
        }
        const chgLocation = context.$modalAdjust.find('.chg-location').val()

        servkit.ajax(
          {
            url: 'api/huangliangMatStock/poTempStock/chgMatLocation',
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(
              _.extend(
                {
                  chg_location: chgLocation,
                  orig_location: rowData.location,
                  chg_reason: '儲位空間調整',
                  chg_time: moment().format('YYYY/MM/DD HH:mm:ss'),
                  mstock_qty: rowData.mstock_qty,
                  sup_id: rowData.sup_id,
                  mstock_name: rowData.mstock_name,
                  po_no: rowData.po_no,
                  chg_type: '2',
                },
                pks
              )
            ),
          },
          {
            success() {
              // console.log(data);
              context.reportTable.table
                .cell(tr, 'location:name')
                .data(chgLocation)
                .draw(false)
              // console.log(context.reportTable.table.row(tr).data())
              context.$modalAdjust.modal('hide')
            },
            fail(data) {
              console.log(data)
            },
          }
        )
      },
      insertLog(rowData) {
        return new Promise((res) => {
          servkit.ajax(
            {
              url: 'api/stdcrud',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify(
                _.extend(
                  {
                    tableModel:
                      'com.servtech.servcloud.app.model.huangliang_matStock.MatStockChangeLog',
                  },
                  rowData
                )
              ),
            },
            {
              success(data) {
                res(data)
              },
              fail(data) {
                console.log(data)
              },
            }
          )
        })
      },
      showChgRecordModal(btn) {
        const context = this
        const { $modalAdjust } = context
        const tr = btn.closest('tr')
        const rowData = context.reportTable.table.row(tr).data()
        const pks = _.chain(rowData)
          .pick(['mstock_name', 'po_no', 'sup_id', 'mat_code'])
          .extend({ shelf_time: rowData.shelf_time.toFormatedDatetime() })
          .value()
        const whereParams = []
        let whereClause = '1'

        _.forEach(pks, (value, key) => {
          whereClause += ` AND ${key} = ?`
          whereParams.push(value)
        })

        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_huangliang_mat_stock_chg_log',
              whereClause,
              whereParams,
            }),
          },
          {
            success(data) {
              if (data.length === 0) {
                context.chgRecordTable.clearTable()
              } else {
                context.chgRecordTable.drawTable(
                  data.map((obj) => [
                    obj.mstock_name,
                    obj.mat_code,
                    obj.po_no,
                    context.recordTypeMap[obj.chg_type],
                    obj.orig_location,
                    obj.chg_location,
                    obj.orig_qty !== undefined ? obj.orig_qty : '',
                    obj.chg_qty !== undefined ? obj.chg_qty : '',
                    obj.chg_reason,
                    moment(obj.chg_time).format('YYYY/MM/DD HH:mm:ss'),
                    context.preCon.userName[obj.chg_by] || obj.chg_by || '',
                  ])
                )
              }
              context.$modalRecord.modal('show')
            },
            fail(data) {
              console.log(data)
            },
          }
        )
      },
      initMaterialSelect($select) {
        const context = this
        servkit.initSelectWithList(
          ['', ...context.preCon.matId],
          $select || context.$material,
          false
        )
      },
      initLocationSelect($select) {
        const context = this
        servkit.initSelectWithList(
          context.preCon.location,
          $select || context.$location,
          false
        )
      },
      initChgReasonSelect() {
        const context = this
        const options = ['領料', '補料', '退貨', '退還', '數量錯誤']
        servkit.initSelectWithList(options, $('.chg-reason'))
      },
    },
    preCondition: {
      userName(done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'm_sys_user',
              columns: ['user_id', 'user_name'],
            }),
          },
          {
            success(data) {
              done(
                Object.fromEntries(data.map((d) => [d.user_id, d.user_name]))
              )
            },
          }
        )
      },
      location(done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_huangliang_mat_location',
              columns: ['location'],
            }),
          },
          {
            success(data) {
              done(_.pluck(data, 'location').sort())
            },
          }
        )
      },
      matId(done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_huangliang_mat_profile',
              columns: ['mat_id'],
            }),
          },
          {
            success(data) {
              done(
                _.pluck(data, 'mat_id')
                  .filter((id) => id !== '通用')
                  .sort()
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
