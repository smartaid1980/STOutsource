export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.reportTable = createReportTable({
        $tableElement: $('#table'),
        $tableWidget: $('#table-widget'),
        excel: {
          fileName: 'PendingIQCMaterial',
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
        let whereClause = 'status = ? AND shelf_time BETWEEN ? AND ?',
          status = '1', // 待驗料
          whereParams = [
            status,
            this.$startDate.val() + ' 00:00:00',
            this.$endDate.val() + ' 23:59:59',
          ],
          context = this

        context.loadingBtn.doing()

        // 採購單號和資料庫為選填
        if (this.$mrp.val()) {
          whereClause = `mstock_name = ? AND ${whereClause}`
          whereParams.unshift(this.$mrp.val())
        }
        if (this.$po.val()) {
          whereClause = `po_no = ? AND ${whereClause}`
          whereParams.unshift(this.$po.val())
        }

        servkit.ajax(
          {
            url: servkit.rootPath + '/api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_huangliang_po_temp_stock',
              columns: [
                'shelf_time',
                'mstock_name',
                'po_no',
                'sup_id',
                'mat_code',
                'mat_od',
                'mat_length',
                'mat_color',
                'location',
                'shelf_qty',
                'shelf_by',
              ],
              whereClause: whereClause,
              whereParams: whereParams,
            }),
          },
          {
            success: function (data) {
              // console.log(data[0].shelf_time); // Oct 31, 2018 6:00:00 PM
              let datas = data.map((obj) => [
                moment(obj.shelf_time).format('YYYY/MM/DD HH:mm:ss'),
                obj.mstock_name,
                obj.po_no,
                obj.sup_id,
                obj.mat_code,
                obj.mat_od || '',
                obj.mat_length || '',
                obj.mat_color || '',
                obj.location,
                obj.shelf_qty,
                context.preCon.userName[obj.shelf_by] || obj.shelf_by || '',
              ])
              context.reportTable.drawTable(datas)
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
