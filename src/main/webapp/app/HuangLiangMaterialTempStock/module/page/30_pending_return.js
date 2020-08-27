export default function () {
  GoGoAppFun({
    gogo: function (context) {
      let reportTableConfig = {
        $tableElement: $('#table'),
        $tableWidget: $('#table-widget'),
        showNoData: false,
        hideCols: [12, 13],
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
          '<a class="return-and-print btn btn-info"><span class="fa fa-file-excel-o fa-lg"></span> 匯出退料單</a>'
        )[0]
        context.loadingBtn2 = servkit.loadingButton(excelBtn)

        reportTableConfig.customBtns = [excelBtn]
        reportTableConfig.checkbox = true
        context.reportTable = createReportTable(reportTableConfig)

        $(excelBtn).on('click', function (e) {
          context.materialReturn()
          // context.commons.savePDF(context);
        })
      } else {
        context.reportTable = createReportTable(reportTableConfig)
      }
      servkit.initDatePicker(context.$startDate, context.$endDate, true)
      servkit.initDatePicker(context.$checkStartDate, context.$checkEndDate)
      context.$checkStartDate.val('')
      context.$checkEndDate.val('')

      context.commons.initMstockNameSelect(context.$mrp)
      context.commons.initPONumAutoComplete(context.$po)

      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()
        context.getAllData(true)
      })
    },
    util: {
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $checkStartDate: $('#check-start-date'),
      $checkEndDate: $('#check-end-date'),
      $mrp: $('#mrp'),
      $progressBar: $('.progress-bar'),
      $po: $('#po'),
      $modal: $('.modal'),
      $submitBtn: $('#submit-btn'),
      userGroup: JSON.parse(sessionStorage.getItem('loginInfo')).user_group,
      allowActionGroup: undefined,
      actionPermission: undefined,
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      loadingBtn2: undefined,
      reportTable: undefined,
      dataKeys: [
        'shelf_time',
        'iqc_time',
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
        'mat_name',
        'iqc_ng_reason',
      ],
      getAllData: function (isShowingNoDataDialog) {
        let whereClause = 'status = ? AND (shelf_time BETWEEN ? AND ?)',
          context = this,
          status = '3', // 待退料
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
        if (context.$checkStartDate.val() && context.$checkStartDate.val()) {
          whereClause = `${whereClause} AND iqc_time BETWEEN ? AND ?`
          whereParams.push(
            context.$checkStartDate.val() + ' 00:00:00',
            context.$checkEndDate.val() + ' 23:59:59'
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
              let datas = data.map((obj) => [
                moment(obj.shelf_time).format('YYYY/MM/DD HH:mm:ss'),
                moment(obj.iqc_time).format('YYYY/MM/DD HH:mm:ss'),
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
                obj.mat_name,
                obj.iqc_ng_reason || '',
              ])
              context.reportTable.drawTable(datas)
              // window.rt = context.reportTable;
              context.loadingBtn.done()
              if (!datas.length && isShowingNoDataDialog)
                $('#dialog-no-data').dialog('open')
            },
            fail: function (data) {
              console.log(data)
            },
          }
        )
      },
      materialReturn: function () {
        let context = this,
          selectedRow = context.reportTable.getSelectedRow(),
          userId = JSON.parse(sessionStorage.getItem('loginInfo')).user_id

        if (!selectedRow.length) return
        context.loadingBtn2.doing()
        selectedRow = selectedRow.map((rowData) => {
          let data = _.object(context.dataKeys, rowData),
            pks = {
              mstock_name: data.mstock_name,
              po_no: data.po_no,
              sup_id: data.sup_id,
              mat_code: data.mat_code,
              location: data.location,
              shelf_time: data.shelf_time,
            }
          return _.extend(
            {
              return_qty: data.shelf_qty,
              return_by: userId,
            },
            pks
          )
        })

        servkit.ajax(
          {
            url: 'api/huangliangMatStock/poTempStock/matReturn',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(selectedRow),
          },
          {
            success: function (data) {
              if (data.length) {
                context.commons.savePDF(context).then(() => {
                  context.loadingBtn2.done()
                  context.getAllData()
                })
              }
            },
            fail: function (data) {
              console.log(data)
              context.loadingBtn2.done()
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
