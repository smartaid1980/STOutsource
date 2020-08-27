export default function () {
  GoGoAppFun({
    gogo: function gogo(ctx) {
      ctx.ReportTable = createReportTable({
        $tableElement: $('#query-result'),
        $tableWidget: $('#query-result-widget'),
      })

      // modal內的report table
      ctx.DetailTable = createReportTable({
        $tableElement: $('#detail_table'),
        $tableWidget: $('#detail_table_widget'),
        customBtns: [
          `<h3 id='material_id_table' class=''>主件料號:</h3> </br>`,
          `<h3 id='line_table'>線別:</h3>`,
        ],
      })

      //查詢
      $('#submit-btn').on('click', function (evt) {
        evt.preventDefault()

        // 料站表編號
        let feed_station_id = $('#feed_station_id').val()
        feed_station_id =
          feed_station_id.trim().length == 0
            ? ''
            : `AND smt_stn_id='${feed_station_id}'`

        // 主件料號
        let material_id = $('#material_id').val()
        material_id =
          material_id.trim().length == 0
            ? ''
            : `AND material_id='${material_id}'`

        // 原料料號
        let PCA = $('#PCA').val()
        PCA = PCA.trim().length == 0 ? '' : `AND material_pca='${PCA}'`

        // 線別
        let line = $('#Line').val()
        line = line.trim().length == 0 ? '' : `AND line='${line}'`

        // sql group by
        let group = $('#feed_station_id').val()
        group = group == '' ? group : `group by '${group}'`

        //搜尋AJAX
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_storage_view_feed_station_record_query_log',
              whereClause: `1 ${feed_station_id} ${material_id} ${PCA} ${line} ${group}`,
            }),
          },
          {
            success: function (data) {
              let ans = []
              _.each(data, (val) => {
                let arr = [
                  val.material_pca,
                  val.line,
                  val.version,
                  val.issue_day ? val.issue_day.toFormatedDate() : '---',
                  `<button name='btn_log' class="btn btn-primary">檢視明細</button>`,
                ]
                return ans.push(arr)
              })
              ctx.ReportTable.drawTable(ans)
            },
          }
        )
      })

      //按下檢視明細
      $('#query-result').on('click', '[name=btn_log]', function () {
        let tr_data = $(this.closest('tr')).data('row-data')
        $('#material_id_table').text(`主件料號 : ${tr_data[0]}`)
        $('#line_table').text(`線別 : ${tr_data[1]}`)

        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_storage_smt_station_detail',
              whereClause: `smt_stn_id LIKE '${tr_data[0]}%'`,
            }),
          },
          {
            success: function (data) {
              let ans = []
              _.each(data, (val) => {
                let arr = [
                  val.material_id ?? '---',
                  val.machine ?? '---',
                  val.machine_type ?? '---',
                  val.program ?? '---',
                  val.track ?? '---',
                  val.sub_track ?? '---',
                  val.spec ?? '---',
                  val.feeder_type ?? '---',
                  val.location ?? '---',
                  val.qty_pcs ?? '---',
                ]
                return ans.push(arr)
              })
              ctx.DetailTable.drawTable(ans)
            },
          }
        )

        $('#detail-modal').modal('show')
      })
    },
    util: {
      ReportTable: '',
      DetailTable: '',
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
