export default function () {
  GoGoAppFun({
    gogo: function (context) {
      let reportTableConfig = {
        $tableElement: $('#table'),
        $tableWidget: $('#table-widget'),
        showNoData: true,
        hideCols: [13],
      }
      // 可操作群組: 品管
      context.allowActionGroup = [context.commons.matStockGroup.qc]
      context.actionPermission = _.intersection(
        context.allowActionGroup,
        context.userGroup
      ).length
        ? true
        : false
      if (context.actionPermission) {
        const excelBtn = $(
          '<a class="print-return-record btn btn-info"><span class="fa fa-file-excel-o fa-lg"></span> 補印退料單</a>'
        )[0]
        context.loadingBtn2 = servkit.loadingButton(excelBtn)
        reportTableConfig.customBtns = [excelBtn]
        reportTableConfig.checkbox = true
        context.reportTable = createReportTable(reportTableConfig)
        $(excelBtn).on('click', function (e) {
          if (!context.reportTable.getSelectedRow().length) return
          context.loadingBtn2.doing()
          context.commons
            .savePDF(context)
            .then(() => context.loadingBtn2.done())
        })
      } else {
        context.reportTable = createReportTable(reportTableConfig)
      }
      servkit.initDatePicker(context.$startDate, context.$endDate, true)
      servkit.initDatePicker(context.$returnStartDate, context.$returnEndDate)
      context.$returnStartDate.val('')
      context.$returnEndDate.val('')

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
      $returnStartDate: $('#return-start-date'),
      $returnEndDate: $('#return-end-date'),
      $submitBtn: $('#submit-btn'),
      $mrp: $('#mrp'),
      $po: $('#po'),
      $progressBar: $('.progress-bar'),
      $modal: $('.modal'),
      userGroup: JSON.parse(sessionStorage.getItem('loginInfo')).user_group,
      allowActionGroup: undefined,
      actionPermission: undefined,
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      loadingBtn2: undefined,
      $onlyExcel: undefined,
      tableHeader: undefined,
      reportTable: undefined,
      dataKeys: [
        'return_time',
        'iqc_ng_reason',
        'mstock_name',
        'po_no',
        'sup_id',
        'mat_code',
        'mat_od',
        'mat_length',
        'mat_color',
        'location',
        'shelf_qty',
        'shelf_time',
        'shelf_by',
        'mat_name',
      ],

      getAllData: function () {
        let whereClause = 'status = ? AND (shelf_time BETWEEN ? AND ?)',
          context = this,
          status = '5', // 已退料
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
        if (context.$returnStartDate.val() && context.$returnStartDate.val()) {
          whereClause = `${whereClause} AND return_time BETWEEN ? AND ?`
          whereParams.push(
            context.$returnStartDate.val() + ' 00:00:00',
            context.$returnEndDate.val() + ' 23:59:59'
          )
        }

        servkit.ajax(
          {
            url: servkit.rootPath + '/api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_huangliang_view_po_temp_stock_po_file',
              columns: context.dataKeys,
              whereClause: whereClause,
              whereParams: whereParams,
            }),
          },
          {
            success: function (data) {
              context.reportTable.drawTable(
                data.map((obj) => [
                  moment(obj.return_time).format('YYYY/MM/DD HH:mm:ss'),
                  obj.iqc_ng_reason || '',
                  obj.mstock_name,
                  obj.po_no,
                  obj.sup_id,
                  obj.mat_code,
                  obj.mat_od || '',
                  obj.mat_length || '',
                  obj.mat_color || '',
                  obj.location,
                  obj.shelf_qty,
                  moment(obj.shelf_time).format('YYYY/MM/DD HH:mm:ss'),
                  context.preCon.userName[obj.shelf_by] || obj.shelf_by || '',
                  obj.mat_name,
                ])
              )
              context.loadingBtn.done()
            },
            fail: function (data) {
              // context.loadingBtn.done();
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
