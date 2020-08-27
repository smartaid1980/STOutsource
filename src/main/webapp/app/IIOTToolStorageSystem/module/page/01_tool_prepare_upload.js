export default function () {
  GoGoAppFun({
    gogo: function (context) {
      // 初始modal裡的表格
      var hideLine = false
      context.prepReportTable = createReportTable({
        $tableElement: $('#prep-table'),
        $tableWidget: $('#prep-table-widget'),
        checkbox: true,
        onDraw: function () {
          if (!hideLine && context.prepReportTable) {
            context.prepReportTable.table.columns([3]).visible(false)
            hideLine = true
          }
          $('.stk-all-checkbox').attr('disabled', true)
        },
      })
      context.prepReportTable.table.columns([3]).visible(false)

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

      // 點擊「選擇」後跳出modal
      $('#status-table').on('click', '.choice', function () {
        const ncName = $(this).data('nc_name')
        $('#nc_name').text(ncName)

        // 紀錄有哪些位置
        var pos = []
        $(this)
          .closest('tr')
          .find('.full.tocheck')
          .each(function () {
            pos.push($(this).data('id'))
          })
        $('#confirm-btn')
          .data('position', pos)
          .data('move_in', $(this).data('move_in'))

        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_iiot_tool_prep',
              columns: [
                'tool_prep_id',
                'nc_name',
                'create_time',
                'modify_time',
              ],
              whereClause: `nc_name='${ncName}' AND status=0`,
            }),
          },
          {
            success: function (data) {
              context.prepRenderTable(data)
              $('#prep-modal').modal('show')
            },
          }
        )
      })

      // 勾選備刀單
      $('#prep-table').on('change', 'input[type=checkbox]', function () {
        context.prepReportTable.table
          .rows()
          .nodes()
          .to$()
          .removeClass('clicked')
        context.prepReportTable.table
          .rows()
          .nodes()
          .to$()
          .find(':checkbox')
          .prop('checked', false)
        $(this).prop('checked', true)
        $(this).closest('tr').addClass('clicked')
      })

      // 選擇上架備刀單
      $('#confirm-btn').on('click', function () {
        const selectedList = context.prepReportTable.getSelectedRow()
        if (selectedList.length) {
          context.modalLoadBtn.doing()
          var prepId = selectedList[0][3]
          if (prepId) prepId = moment(prepId).format('YYYY-MM-DD HH:mm:ss')
          const position = $(this).data('position')
          var moveIn = $(this).data('move_in')
          if (moveIn) moveIn = moment(moveIn).format('YYYY-MM-DD HH:mm:ss')
          var count = 0
          _.each(position, (pos) => {
            servkit.ajax(
              {
                url: 'api/iiot/tool/preparelist/updatePrep',
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({
                  tool_prep_id: prepId,
                  tool_stored: context.shelf + '_' + pos,
                  move_in: moment(
                    $(`.pos[data-id=${pos}]`).data('move_in')
                  ).format('YYYY-MM-DD HH:mm:ss'),
                }),
              },
              {
                success: function () {
                  count++
                },
              }
            )
          })

          servkit
            .politeCheck()
            .until(function () {
              return count === position.length
            })
            .thenDo(function () {
              $('#prep-modal').modal('hide')
              $('.refresh-btn').trigger('click')
            })
            .tryDuration(0)
            .start()
        }
      })

      // 關掉modal後要把loading button停掉
      $('#prep-modal').on('hidden.bs.modal', function (e) {
        context.modalLoadBtn.done()
      })
    },
    util: {
      posQty: 20,
      layerQty: 6,
      shelf: null,
      shelfData: [],
      loadBtn: servkit.loadingButton(document.querySelector('.refresh-btn')),
      modalLoadBtn: servkit.loadingButton(
        document.querySelector('#confirm-btn')
      ),
      prepReportTable: null,
      prepRenderTable: function (data) {
        this.prepReportTable.drawTable(
          _.map(data, (val) => {
            return [
              val.nc_name || '',
              val.create_time
                ? moment(val.create_time).format('YYYY/MM/DD HH:mm:ss')
                : '---',
              val.modify_time
                ? moment(val.modify_time).format('YYYY/MM/DD HH:mm:ss')
                : '---',
              val.tool_prep_id
                ? moment(val.tool_prep_id).format('YYYY/MM/DD HH:mm:ss')
                : '',
            ]
          })
        )
      },
      createTable: function () {
        const qty = this.posQty
        const $table = $('#status-table')
        var tableList = []

        // 畫header
        tableList.push('<thead>')
        tableList.push('<tr>')
        tableList.push('<th><div>備刀單</div></th>')
        tableList.push('<th><div>儲位</div></th>')
        _.times(qty, (n) => tableList.push(`<th><div>${n + 1}</div></th>`))
        tableList.push('</tr>')
        tableList.push('</thead>')

        // 畫body
        tableList.push('<tbody>')
        _.times(this.layerQty, (layerN) => {
          tableList.push(`<tr data-layer="${layerN + 1}">`)
          tableList.push(
            `<td><button class="btn btn-success choice hide">選擇</button></td>`
          )
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
                  .attr('data-nc_name', val.nc_name)
                  .attr('data-move_in', val.move_in)
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

        // 顯示/隱藏備刀單的「選擇」按鈕
        $('tbody tr').each(function () {
          var tochecks = $(this).find('.full.tocheck').length
          if (tochecks) $(this).find('.choice').removeClass('hide')
          else $(this).find('.choice').addClass('hide')
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
