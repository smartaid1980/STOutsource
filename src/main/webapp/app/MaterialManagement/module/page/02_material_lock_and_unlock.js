export default function () {
  GoGoAppFun({
    gogo: function gogo(ctx) {
      ctx.ReportTable = createReportTable({
        $tableElement: $('#query-result'),
        $tableWidget: $('#query-result-widget'),
        checkbox: true,
        customBtns: [
          `<button id="lock" class="btn btn-primary hide">勾選項目鎖定</button>`,
          `<button id="unlock" class="btn btn-primary hide">勾選項目解鎖</button>`,
        ],
      })
      // 初始化日期
      servkit.initDatePicker($('#startDate'), $('#endDate'), false, false)
      // 查詢BTN
      $('#submit-btn').on('click', function (evt) {
        evt.preventDefault()

        //鎖定radio
        let lock_radio = $('[name=status]:checked').val()
        lock_radio == 0
          ? $('#lock').removeClass('hide') && $('#unlock').addClass('hide')
          : $('#unlock').removeClass('hide') && $('#lock').addClass('hide')
        lock_radio = lock_radio == 0 ? `AND in_stock='1'` : `AND in_stock='9'`

        // 廠內料號
        let material_id = $('#material_id').val()
        material_id =
          material_id.trim().length == 0
            ? ''
            : `AND material_id='${material_id}'`

        // Date code
        let date_code = $('#date_code').val()
        date_code =
          date_code.trim().length == 0 ? '' : `AND delivery_date='${date_code}'`

        // 供應商
        let supplier = $('#supplier').val()
        supplier =
          supplier.trim().length == 0 ? '' : `AND vender_name='${supplier}'`

        // lot_no
        let lot_no = $('#lot_no').val()
        lot_no = lot_no.trim().length == 0 ? '' : `AND vender_lot='${lot_no}'`

        //日期 select
        let start_date = $('#startDate').val()
        start_date =
          start_date.trim().length === 0
            ? '20000101'
            : moment(start_date).format('YYYYMMDD')
        let end_date = $('#endDate').val()
        end_date =
          end_date.trim().length === 0
            ? '21000101'
            : moment(end_date).format('YYYYMMDD')

        let date = `exp_date between '${start_date}' AND '${end_date}'`

        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_storage_view_material_thing_join_log ',
              whereClause: `${date} ${lock_radio} ${material_id} ${date_code} ${supplier} ${lot_no}`,
            }),
          },
          {
            success: function (data) {
              let ans = []
              let position_data = ctx.preCon.getPositionData
              _.each(data, (val) => {
                let status, position, remarks

                //儲位

                //出庫的條件判定
                let stock_out_if =
                  val.store_id_to != undefined &&
                  val.store_grid_id_to != undefined &&
                  val.store_cell_id_to != undefined
                //入庫的條件判定
                let stock_in_if =
                  val.store_id_from != undefined &&
                  val.store_grid_id_from != undefined &&
                  val.store_cell_id_from != undefined

                //篩選入庫的資料
                function getPositionOut() {
                  return position_data.filter(
                    (i) =>
                      i.store_id == val.store_id_to &&
                      i.store_grid_index == val.store_grid_id_to &&
                      i.store_cell_index == val.store_cell_id_to
                  )[0]
                }
                //篩選出庫的資料
                function getPositionIn() {
                  return position_data.filter(
                    (i) =>
                      i.store_id == val.store_id_from &&
                      i.store_grid_index == val.store_grid_id_from &&
                      i.store_cell_index == val.store_cell_id_from
                  )[0]
                }

                //執行
                if (stock_out_if) {
                  position = getPositionOut()
                } else if (stock_in_if) {
                  position = getPositionIn()
                }

                //狀態
                if (val.in_stock == 0) {
                  status = '未入庫'
                } else if (val.in_stock == 1) {
                  status = '已入庫，已指定位置'
                } else if (val.in_stock == 9) {
                  status = '鎖定'
                } else if (val.in_stock == 98) {
                  status = '領出至移轉料架'
                } else {
                  status = '---'
                }

                let arr = [
                  val.thing_id || '---',
                  val.material_id || '---',
                  val.vender_name || '---',
                  val.delivery_date || '---',
                  val.vender_lot || '---',
                  val.exp_date ? val.exp_date.toFormatedDate() : '---',
                  val.ware_id || '---',
                  (position =
                    position == undefined ? '---' : position.position_name),
                  val.thing_pcs || '---',
                  status,
                  (val.status = val.status == 0 ? '---' : '鎖定'),
                ]
                return ans.push(arr)
              })
              ctx.ReportTable.drawTable(ans)
            },
          }
        )
      })
      // 鎖定
      $('#lock').click(function () {
        if (ctx.ReportTable.getSelectedRow().length) {
          let lock_check = _.uniq(
            ctx.ReportTable.getSelectedRow().map((i) => String(i[10]))
          )
          let lock_arr = ctx.ReportTable.getSelectedRow().map((i) =>
            String(i[0])
          )
          if (lock_check[0] != '鎖定' && lock_check[1] != '鎖定') {
            servkit.ajax(
              {
                url: 'api/ennoconn/material/lock',
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({ thing_ids: lock_arr }),
              },
              {
                success: function () {
                  $.smallBox({
                    title: '鎖定成功',
                    color: '#2FA12F',
                    iconSmall: 'fa fa-check',
                    timeout: 4000,
                  })
                  $('#submit-btn').click()
                },
              }
            )
          } else {
            $.smallBox({
              title: '鎖定失敗',
              content: '不能選擇備註為鎖定的項目',
              color: servkit.colors.red,
              iconSmall: 'fa fa-times',
              timeout: 4000,
            })
          }
        }
      })
      // 解鎖
      $('#unlock').click(function () {
        if (ctx.ReportTable.getSelectedRow().length) {
          let unlock_arr = ctx.ReportTable.getSelectedRow().map((i) =>
            String(i[0])
          )
          servkit.ajax(
            {
              url: 'api/ennoconn/material/unlock',
              type: 'PUT',
              contentType: 'application/json',
              data: JSON.stringify({ thing_ids: unlock_arr }),
            },
            {
              success: function (data) {
                $.smallBox({
                  title: '解鎖成功',
                  color: '#2FA12F',
                  iconSmall: 'fa fa-check',
                  timeout: 4000,
                })
                $('#submit-btn').click()
              },
            }
          )
        }
      })
    },
    util: {
      ReportTable: null,
    },
    preCondition: {
      getPositionData(done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_storage_store_position',
              columns: [
                'store_id',
                'store_grid_index',
                'store_cell_index',
                'position_name',
                'position_id',
                'position_org_id',
              ],
            }),
          },
          {
            success(data) {
              done(data)
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
