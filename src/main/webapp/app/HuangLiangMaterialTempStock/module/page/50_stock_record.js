export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.reportTable = createReportTable({
        $tableElement: $('#table'),
        $tableWidget: $('#table-widget'),
        excel: {
          fileName: 'StockMaterialRecord',
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
            'text',
            'text',
            'text',
            'text',
          ],
        },
      })
      servkit.initDatePicker(context.$startDate, context.$endDate, true)

      context.commons.initMstockNameSelect(context.$mrp)
      context.commons.initPONumAutoComplete(context.$po)

      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()
        context.getAllData()
      })
    },
    util: {
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $submitBtn: $('#submit-btn'),
      $mrp: $('#mrp'),
      $po: $('#po'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      reportTable: undefined,

      getAllData: function () {
        let whereClause = 'status = ? AND (mstock_time BETWEEN ? AND ?)',
          context = this,
          status = '4', // 已入庫
          whereParams = [
            status,
            context.$startDate.val() + ' 00:00:00',
            context.$endDate.val() + ' 23:59:59',
          ]

        context.loadingBtn.doing()

        if (context.$mrp.val()) {
          whereClause = `mstock_name = ? AND ${whereClause}`
          whereParams.unshift(context.$mrp.val())
        }
        if (context.$po.val()) {
          whereClause = `po_no = ? AND ${whereClause}`
          whereParams.unshift(context.$po.val())
        }

        servkit.ajax(
          {
            url: servkit.rootPath + '/api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_huangliang_po_temp_stock',
              whereClause: whereClause,
              whereParams: whereParams,
            }),
          },
          {
            success: function (data) {
              context.reportTable.drawTable(
                data.map((obj) => [
                  moment(obj.mstock_time).format('YYYY/MM/DD HH:mm:ss'),
                  obj.mstock_name,
                  obj.po_no,
                  obj.sup_id,
                  obj.mat_code,
                  obj.mat_od || '',
                  obj.mat_length || '',
                  obj.mat_color || '',
                  obj.location,
                  obj.shelf_qty,
                  obj.mrp_bcode || '',
                  moment(obj.shelf_time).format('YYYY/MM/DD HH:mm:ss'),
                  context.preCon.userName[obj.shelf_by] || obj.shelf_by || '',
                  moment(obj.iqc_time).format('YYYY/MM/DD HH:mm:ss'),
                  context.preCon.userName[obj.iqc_by] || obj.iqc_by || '',
                  obj.iqc_result,
                ])
              )
              context.loadingBtn.done()
            },
            fail: function (data) {
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
