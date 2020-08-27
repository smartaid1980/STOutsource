export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      servkit.validateForm($('#query-form'), $('#submit-btn'))
      $('#product_id').select2()
      servkit.initSelectWithList(
        ctx.preCon.get_a_servtrack_product_list,
        $('#product_id')
      )
      ctx.$productId.prop('selectedIndex', -1)

      $('#line_id').select2()
      servkit.initSelectWithList(
        ctx.preCon.get_a_servtrack_line_list,
        $('#line_id')
      )
      ctx.$lineId.prop('selectedIndex', -1)

      $('#work_id').select2()
      servkit.initSelectWithList(
        ctx.preCon.get_a_servtrack_work_list,
        $('#work_id')
      )
      ctx.$workId.prop('selectedIndex', -1)

      ctx.reporttableReportTable = createReportTable({
        $tableElement: $('#report-table'),
        $tableWidget: $('#report-table-widget'),
        order: [[0, 'asc']],
      })

      ctx.reporttableRenderTable(
        ctx.$productId.val(),
        ctx.$lineId.val(),
        ctx.$workId.val()
      )

      $('#submit-btn').on('click', function (evt) {
        evt.preventDefault()
        ctx.reporttableRenderTable(
          ctx.$productId.val(),
          ctx.$lineId.val(),
          ctx.$workId.val()
        )
      })
    },
    util: {
      $productId: $('#product_id'),
      $lineId: $('#line_id'),
      $workId: $('#work_id'),
      reporttableReportTable: null,
      reporttableRenderTable: function (productId, lineId, workId) {
        var ctx = this
        var data = {
          work_id: workId,
          line_id: lineId,
          product_id: productId,
        }

        servkit.ajax(
          {
            url: 'api/servtrack/tracking-no-move-out/find',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
          },
          {
            success: function (data) {
              ctx.reporttableReportTable.drawTable(
                _.map(data, (val, key) => {
                  return [
                    val.move_in === null || val.move_in === undefined
                      ? ''
                      : moment(new Date(val.move_in)).format(
                          'YYYY-MM-DD HH:mm:ss'
                        ),
                    ctx.preCon.get_line_name_by_a_servtrack_line[
                      val.line_id
                    ] === null ||
                    ctx.preCon.get_line_name_by_a_servtrack_line[
                      val.line_id
                    ] === undefined
                      ? ''
                      : ctx.preCon.get_line_name_by_a_servtrack_line[
                          val.line_id
                        ],
                    val.work_id === null || val.work_id === undefined
                      ? ''
                      : val.work_id,
                    val.op === null || val.op === undefined ? '' : val.op,
                    ctx.preCon.get_product_name_by_a_servtrack_product[
                      val.product_id
                    ] === null ||
                    ctx.preCon.get_product_name_by_a_servtrack_product[
                      val.product_id
                    ] === undefined
                      ? ''
                      : ctx.preCon.get_product_name_by_a_servtrack_product[
                          val.product_id
                        ],
                  ]
                })
              )
            },
          }
        )
      },
    },
    preCondition: {
      get_a_servtrack_product_list: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_servtrack_product',
              columns: ['product_name', 'product_id'],
            }),
          },
          {
            success: function (data) {
              var dataMap = {}
              _.each(data, function (elem, key) {
                dataMap[elem.product_id] = elem.product_name
              })
              done(dataMap)
            },
          }
        )
      },
      get_a_servtrack_line_list: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_servtrack_line',
              columns: ['line_name', 'line_id'],
            }),
          },
          {
            success: function (data) {
              var dataMap = {}
              _.each(data, function (elem, key) {
                dataMap[elem.line_id] = elem.line_name
              })
              done(dataMap)
            },
          }
        )
      },
      get_a_servtrack_work_list: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_servtrack_work',
              columns: ['work_id', 'work_id'],
            }),
          },
          {
            success: function (data) {
              var dataMap = {}
              _.each(data, function (elem, key) {
                dataMap[elem.work_id] = elem.work_id
              })
              done(dataMap)
            },
          }
        )
      },
      get_product_name_by_a_servtrack_product: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_servtrack_product',
              columns: ['product_id', 'product_name'],
            }),
          },
          {
            success: function (data) {
              var dataMap = {}
              _.each(data, function (elem, key) {
                dataMap[elem.product_id] = elem.product_name
              })
              done(dataMap)
            },
          }
        )
      },
      get_line_name_by_a_servtrack_line: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_servtrack_line',
              columns: ['line_id', 'line_name'],
            }),
          },
          {
            success: function (data) {
              var dataMap = {}
              _.each(data, function (elem, key) {
                dataMap[elem.line_id] = elem.line_name
              })
              done(dataMap)
            },
          }
        )
      },
    },
    dependencies: [
      ['/js/plugin/select2/select2.min.js'],
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
