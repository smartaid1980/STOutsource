export default function () {
  GoGoAppFun({
    gogo(context) {
      context.initQueryForm()
      context.initReportTable()
    },
    util: {
      $submitBtn: $('#submit-btn'),
      $reportTable: $('#table'),
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $chgType: $('#chg-type'),
      userGroup: JSON.parse(sessionStorage.getItem('loginInfo')).user_group,
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      reportTable: undefined,
      recordTypeMap: {
        1: '數量調整',
        2: '儲位變更',
      },
      initQueryForm() {
        const context = this
        const {
          $startDate,
          $endDate,
          recordTypeMap,
          $chgType,
          $submitBtn,
        } = context

        servkit.initDatePicker($startDate, $endDate, true)
        servkit.initSelectWithList(recordTypeMap, $chgType, true)

        servkit.validateForm($('#query-form'), $submitBtn)
        $submitBtn.on('click', function (evt) {
          evt.preventDefault()
          context.getRecordData()
        })
      },
      initReportTable() {
        const context = this
        const { recordTypeMap } = context
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
            render(data, type) {
              if (type === 'selectFilter' || type === 'display') {
                return context.preCon.supplierName[data] || data
              } else {
                return data
              }
            },
          },
          {
            name: 'mat_code',
            data: 'mat_code',
          },
          {
            name: 'shelf_time',
            data: 'shelf_time',
            render(data) {
              return data.toFormatedDatetime()
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
            name: 'chg_type',
            data: 'chg_type',
            render(data, type) {
              if (type === 'display' || type === 'selectFilter') {
                return recordTypeMap[data]
              } else {
                return data
              }
            },
          },
          {
            name: 'chg_reason',
            data: 'chg_reason',
            render(data, type) {
              return data || ''
            },
          },
          {
            name: 'chg_time',
            data: 'chg_time',
            render(data) {
              return data.toFormatedDatetime()
            },
          },
          {
            name: 'orig_qty',
            data: 'orig_qty',
          },
          {
            name: 'chg_qty',
            data: 'chg_qty',
          },
          {
            name: 'orig_location',
            data: 'orig_location',
          },
          {
            name: 'chg_location',
            data: 'chg_location',
          },
        ]
        // const excelColName = columns.slice(0, 11).map(col => col.name);
        const $excelBtn = $(
          '<a class="print-return-record btn btn-info"><span class="fa fa-file-excel-o fa-lg"></span> 列印儲位變更單</a>'
        )
        context.loadingExcelBtn = servkit.loadingButton($excelBtn[0])
        const excelUrl = '/api/huangliangMatStock/matStockChangeLog/excel'
        const getExcelParams = () => {
          const rowData = context.reportTable
            .getSelectedRow()
            .filter((rowData) => rowData.chg_type === '2')
          const dateTimeCols = ['shelf_time']
          const requestBody = rowData.map((data) => {
            return _.chain(data)
              .pick([
                'mstock_name',
                'po_no',
                'mat_code',
                'sup_id',
                'mat_length',
                'mat_color',
                'shelf_time',
                'orig_location',
                'chg_location',
              ])
              .mapObject((value, key) =>
                dateTimeCols.includes(key) ? value.toFormatedDatetime() : value
              )
              .extend({
                sup_name:
                  context.preCon.supplierName[data.sup_id] || data.sup_id,
              })
              .value()
          })
          return { data: JSON.stringify(requestBody) }
        }
        $excelBtn.on('click', function (e) {
          const selectedRowData = context.reportTable.getSelectedRow()
          const locationChangeRowData = selectedRowData.filter(
            (rowData) => rowData.chg_type === '2'
          )
          if (!selectedRowData.length) {
            return e.stopImmediatePropagation()
          }
          if (!locationChangeRowData.length) {
            $.smallBox({
              title: '錯誤',
              content: '請先勾選「儲位調整」的記錄',
              color: 'red',
              iconSmall: 'fa fa-sign-out',
              timeout: 4000,
            })
            return e.stopImmediatePropagation()
          }
        })
        servkit.downloadFile($excelBtn, excelUrl, getExcelParams)
        // $excelBtn.on('click', function () {
        //   context.downloadExcel();
        // });
        const reportTableConfig = {
          $tableElement: context.$reportTable,
          $tableWidget: $('#table-widget'),
          customBtns: [$excelBtn[0]],
          checkbox: true,
          order: [[9, 'desc']],
          autoWidth: false,
          columns,
        }

        // if (!context.qtyAdjustPermission) {
        //   reportTableConfig.hideCols.push(11);
        // }
        // if (!context.chgRecordPermission) {
        //   reportTableConfig.hideCols.push(12);
        // }
        context.reportTable = createReportTable(reportTableConfig)
      },
      getRecordData() {
        const context = this
        const { $chgType, $startDate, $endDate } = context
        const chg_type = $chgType.val().filter((val) => val !== 'ALL')
        const startDate = $startDate.val() + ' 00:00:00'
        const endDate = $endDate.val() + ' 23:59:59'
        const whereParams = []
        let whereClause = '1'

        context.loadingBtn.doing()

        if (chg_type) {
          whereClause += ` AND chg_type IN (${chg_type
            .map(() => '?')
            .join(',')})`
          whereParams.push(...chg_type)
        }
        if (startDate) {
          whereClause += ' AND chg_time BETWEEN ? AND ?'
          whereParams.push(startDate, endDate)
        }
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_huangliang_view_mat_stock_mat_stock_chg_log',
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
      downloadExcel() {
        const context = this
        const { reportTable } = context
        console.log(reportTable.getSelectedRow())
        const selectedRowData = reportTable.getSelectedRow()
        servkit.ajax(
          {
            url: 'api/huangliangMatStock/matStockChangeLog/excel',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(selectedRowData),
          },
          {
            success(data) {
              console.log(data)
            },
          }
        )
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
      supplierName(done) {
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
