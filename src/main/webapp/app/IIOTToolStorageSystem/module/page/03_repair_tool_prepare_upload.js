export default function () {
  GoGoAppFun({
    gogo: function (context) {
      // 初始元件
      servkit.initDatePicker($('#start-date'), $('#end-date'), true, false)
      $('#shelf').on('change', function () {
        context.shelf = this.value
        servkit.initSelectWithList(
          Object.keys(context.preCon.getLocations[context.shelf]),
          $('#layer')
        )
        $('#layer').trigger('change')
      })
      servkit.initSelectWithList(
        Object.keys(context.preCon.getLocations),
        $('#shelf')
      )
      $('#shelf').trigger('change')

      context.toolTableReportTable = createReportTable({
        $tableElement: $('#tool-table'),
        $tableWidget: $('#tool-table-widget'),
        checkbox: true,
        order: [[0, 'desc']],
        customBtns: [
          '<div id="query-info"><div>查詢時間：<span id="query-time"></span></div><div>儲位：<span id="query-location"></span></div></div>',
          '<button id="bind" class="btn btn-primary">綁定備刀單</button>',
        ],
        onDraw: function () {
          $('.stk-all-checkbox').attr('disabled', true)
          if (!context.bindLoadBtn && document.querySelector('#bind')) {
            context.bindLoadBtn = servkit.loadingButton(
              document.querySelector('#bind')
            )
          }
        },
      })
      context.prepReportTable = createReportTable({
        $tableElement: $('#prep-table'),
        $tableWidget: $('#prep-table-widget'),
        checkbox: true,
        onDraw: function () {
          $('.stk-all-checkbox').attr('disabled', true)
        },
      })

      // 查詢
      servkit.validateForm($('#query-form'), $('#submit-btn'))
      $('#submit-btn').on('click', function (evt) {
        evt.preventDefault()
        context.loadingBtn.doing()
        const start = $('#start-date').val()
        const end = $('#end-date').val()
        context.position = _.without($('#position').val(), 'ALL')
        context.layer = $('#layer').val()

        $('#query-time').text(start + '~' + end)
        $('#query-location').text(context.shelf + '_' + context.layer)

        let whereClause = `tool_prep_id is null`
        whereClause += ` AND shelf_id='${context.shelf}'`
        whereClause += ` AND layer_id='${context.layer}'`
        // whereClause += ` AND position_id in ('${context.position.join('\',\'')}')`
        whereClause += ` AND move_in>='${start} 00:00:00' AND move_in<='${end} 23:59:59'`
        whereClause += ` order by move_in desc`
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_iiot_view_tool_on_store_tool_shelf',
              columns: [
                'shelf_id',
                'layer_id',
                'position_id',
                'move_in',
                'move_out',
                'tool_id',
                'tool_no',
                'nc_name',
              ],
              whereClause: whereClause,
            }),
          },
          {
            success: function (data) {
              context.toolTableRenderTable(data)
              context.loadingBtn.done()
            },
          }
        )
      })

      // 勾選刀具上架時間
      $('#tool-table').on('change', 'input[type=checkbox]', function () {
        context.toolTableReportTable.table
          .rows()
          .nodes()
          .to$()
          .removeClass('clicked')
        context.toolTableReportTable.table
          .rows()
          .nodes()
          .to$()
          .find(':checkbox')
          .prop('checked', false)
        $(this).prop('checked', true)
        $(this).closest('tr').addClass('clicked')
      })

      // 點擊「綁定備刀單」後跳出modal
      $('#tool-table-widget').on('click', '#bind', function () {
        context.bindLoadBtn.doing()
        const selectedList = context.toolTableReportTable.getSelectedRow()
        if (selectedList.length) {
          const ncName = selectedList[0][3]
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
                context.modalLoadBtn.done()
                context.prepRenderTable(data)
                context.bindLoadBtn.done()
                $('#prep-modal').modal('show')
              },
            }
          )
        } else context.bindLoadBtn.done()
      })

      // 選擇上架備刀單
      $('#confirm-btn').on('click', function () {
        context.modalLoadBtn.doing()
        const selectedList = context.prepReportTable.getSelectedRow()
        if (selectedList.length) {
          var prepId = selectedList[0][3]
          if (prepId) prepId = moment(prepId).format('YYYY-MM-DD HH:mm:ss')
          var count = 0
          const position =
            context.resultList[
              context.toolTableReportTable.getSelectedRow()[0][4]
            ]
          console.log(position)
          _.each(position, (pos) => {
            servkit.ajax(
              {
                url: 'api/iiot/tool/preparelist/updatePrep',
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({
                  tool_prep_id: prepId,
                  tool_stored:
                    pos.shelf_id + '_' + pos.layer_id + '_' + pos.position_id,
                  move_in: moment(pos.move_in).format('YYYY-MM-DD HH:mm:ss'),
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
              context.modalLoadBtn.done()
              $('#prep-modal').modal('hide')
              $('#submit-btn').trigger('click')
            })
            .tryDuration(0)
            .start()
        } else context.modalLoadBtn.done()
      })
    },
    util: {
      shelf: null,
      layer: null,
      position: [],
      resultList: {},
      bindLoadBtn: null,
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      modalLoadBtn: servkit.loadingButton(
        document.querySelector('#confirm-btn')
      ),
      toolTableReportTable: null,
      toolTableRenderTable: function (data) {
        const ctx = this
        ctx.resultList = {}
        let result = []
        let time
        _.each(data, (val) => {
          if (!time || moment(time).diff(val.move_in, 'minutes') > 10) {
            result.push([
              val.move_in ? val.move_in.toFormatedDatetime() : '---',
              val.move_out ? val.move_out.toFormatedDatetime() : '---',
              (val.shelf_id || '') + '_' + (val.layer_id || ''),
              val.nc_name,
              result.length,
            ])
          }
          if (!ctx.resultList[result.length - 1])
            ctx.resultList[result.length - 1] = []
          ctx.resultList[result.length - 1].push(val)
          time = val.move_in
        })
        this.toolTableReportTable.drawTable(result)
      },
      prepReportTable: null,
      prepRenderTable: function (data) {
        this.prepReportTable.drawTable(
          _.map(data, (val) => {
            return [
              val.nc_name,
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
    },
    preCondition: {
      getLocations: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_iiot_tool_shelf',
              columns: ['shelf_id', 'layer_id', 'position_id'],
            }),
          },
          {
            success: function (data) {
              var locationMap = {}
              _.each(data, (val) => {
                if (!locationMap[val.shelf_id]) locationMap[val.shelf_id] = {}
                if (!locationMap[val.shelf_id][val.layer_id])
                  locationMap[val.shelf_id][val.layer_id] = []
                locationMap[val.shelf_id][val.layer_id].push(val.position_id)
              })
              done(locationMap)
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
