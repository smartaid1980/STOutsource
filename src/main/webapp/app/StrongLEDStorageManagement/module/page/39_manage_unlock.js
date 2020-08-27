import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      // 建立重新查詢按鈕
      var refresh = document.createElement('BUTTON')
      refresh.classList.value = 'btn btn-primary stk-refresh-btn'
      refresh.setAttribute('title', 'Refresh')
      $(refresh).append('<span class="fa fa-refresh fa-lg"></span>')

      // 建立loading button
      context.queryLodingBtn = servkit.loadingButton(refresh)

      // 建立表格物件
      context.unlockReportTable = createReportTable({
        $tableElement: $('#unlock-table'),
        $tableWidget: $('#unlock-table-widget'),
        customBtns: [refresh],
      })

      // 綁定查詢事件
      $(refresh)
        .on('click', function () {
          context.queryLodingBtn.doing()
          servkit.ajax(
            {
              url: 'api/getdata/db',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                table: 'a_strongled_bill_stock_out_main',
                columns: [
                  'bill_no',
                  'bill_date',
                  'stock_out_date',
                  'remark',
                  'ware_id',
                  'locked_by',
                ],
                whereClause: `status=2`,
              }),
            },
            {
              success: function (data) {
                context.unlockRenderTable(data)
                context.queryLodingBtn.done()
              },
            }
          )
        })
        .trigger('click')

      // 綁定「解除鎖定」按鈕
      $('#unlock-table').on('click', '.unlock-btn', function () {
        var sendData = $(this).data()
        servkit.ajax(
          {
            url: 'api/storage/billstockout/check-lock',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              user_id: JSON.parse(sessionStorage.loginInfo).user_id,
              bill_no: String(sendData.bill_no),
              model: 'web',
            }),
          },
          {
            success: function () {
              $('.stk-refresh-btn').trigger('click')
            },
          }
        )
      })
    },
    util: {
      queryLodingBtn: null,
      unlockReportTable: null,
      unlockRenderTable: function (data) {
        var ctx = this
        ctx.unlockReportTable.drawTable(
          _.map(data, (val) => {
            return [
              val.bill_no || '---',
              val.bill_date || '---',
              val.stock_out_date || '---',
              val.remark || '',
              val.ware_id || '---',
              val.locked_by || '---',
              `<button class="btn btn-primary unlock-btn" data-bill_no="${
                val.bill_no
              }" data-ware_id="${val.ware_id}">${i18n('Unlock')}</button>`,
            ]
          })
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
