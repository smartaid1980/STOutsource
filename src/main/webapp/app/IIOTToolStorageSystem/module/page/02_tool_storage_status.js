export default function () {
  GoGoAppFun({
    gogo: function (context) {
      // 換儲架
      $('#shelf a').on('click', function () {
        $('#shelf li.active').removeClass('active')
        $(this).closest('li').addClass('active')
        context.shelf = $(this).data('shelf')
        context.refreshTable()
      })
      $('#shelf li:first a').trigger('click')

      context.createTable() // 畫table

      // 查詢資料
      $('.refresh-btn')
        .on('click', function () {
          context.loadBtn.doing()
          $('#refresh-time').text(moment().format('YYYY/MM/DD HH:mm:ss'))
          servkit.ajax(
            {
              url: 'api/getdata/db',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                table: 'a_iiot_view_tool_shelf_tool_on_store',
                columns: [
                  'shelf_id',
                  'layer_id',
                  'position_id',
                  'tool_no',
                  'tool_id',
                  'nc_name',
                  'move_in',
                  'status',
                ],
              }),
            },
            {
              success: function (data) {
                context.shelfData = data
                context.refreshTable()
                context.loadBtn.done()
              },
            }
          )
        })
        .trigger('click')
    },
    util: {
      posQty: 20,
      layerQty: 6,
      shelf: null,
      shelfData: [],
      loadBtn: servkit.loadingButton(document.querySelector('.refresh-btn')),
      createTable: function () {
        const qty = this.posQty
        const $table = $('#status-table')
        var tableList = []

        // 畫header
        tableList.push('<thead>')
        tableList.push('<tr>')
        tableList.push('<th><div>儲位</div></th>')
        _.times(qty, (n) => tableList.push(`<th><div>${n + 1}</div></th>`))
        tableList.push('</tr>')
        tableList.push('</thead>')

        // 畫body
        tableList.push('<tbody>')
        _.times(this.layerQty, (layerN) => {
          tableList.push(`<tr data-layer="${layerN + 1}">`)
          tableList.push(`<td>${layerN + 1}</td>`)
          _.times(qty, (n) =>
            tableList.push(
              `<td class="pos" data-id="${layerN + 1}_${n + 1}"></td>`
            )
          )
          tableList.push(`</tr>`)
        })
        tableList.push('</tbody>')

        $table.append(tableList.join(''))
      },
      refreshTable: function () {
        const shelf = this.shelf
        const toolMap = this.preCon.getTools

        // 清空表格
        $('.pos').text('空').removeClass('full tocheck').addClass('empty')

        // 更新儲架狀態
        _.each(this.shelfData, (val) => {
          if (val.shelf_id === shelf) {
            // 只顯示目前選擇的儲架
            const pos = val.layer_id + '_' + val.position_id
            if (val.status === 1) {
              if (!val.tool_id) {
                $(`.pos[data-id=${pos}]`)
                  .text('T' + val.tool_no)
                  .removeClass('empty')
                  .addClass('full tocheck')
                $(`.pos[data-id=${pos}]`)
                  .closest('tr')
                  .find('.choice')
                  .data('nc_name', val.nc_name)
                  .data('move_in', val.move_in)
              } else
                $(`.pos[data-id=${pos}]`)
                  .text(toolMap[val.tool_id] || val.tool_id)
                  .removeClass('empty')
                  .addClass('full')
            }
          }
        })
      },
    },
    preCondition: {
      getTools: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_iiot_tool',
              columns: ['tool_id', 'tool_code'],
            }),
          },
          {
            success: function (data) {
              var toolMap = {}
              _.each(data, (val) => (toolMap[val.tool_id] = val.tool_id))
              done(toolMap)
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
