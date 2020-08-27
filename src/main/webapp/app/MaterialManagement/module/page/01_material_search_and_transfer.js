import { InfoTable } from '../../../StrongLEDStorageManagement/module/infoTable.js'
import { select2AllowClearHelper } from '../../../../js/servtech/module/feature/customizeLibSetting.js'
export default function () {
  GoGoAppFun({
    gogo: function gogo(ctx) {
      ctx.ReportTable = createReportTable({
        $tableElement: $('#query-result'),
        $tableWidget: $('#query-result-widget'),
        // hideCols: [12],
        customBtns: [
          `<button id="export_excel" class="btn btn-primary">轉出Excel</button>`,
        ],
      })
      ctx.initInfoTable()

      //入庫狀態checkbox全選
      $('[name=select_all]').click(() => {
        let status = $('[name=select_all]').is(':checked')
        $('[name=storage_status]').prop('checked', status)
      })

      // 按下查詢按鈕
      $('#submit-btn').on('click', function (evt) {
        evt.preventDefault()
        //狀態
        let checkbox_arr = []
        $('[name=storage_status]:checked').each(function () {
          checkbox_arr.push(this.value)
        })
        if (checkbox_arr.length != 0) {
          checkbox_arr = checkbox_arr.reduce(
            (a, b) => a + `'` + b + `'` + ` ,`,
            ''
          )
          checkbox_arr =
            'AND in_stock IN (' +
            checkbox_arr.substring(0, checkbox_arr.length - 1) +
            ')'
        } else {
          checkbox_arr = ''
        }

        // 倉庫select
        let warehouse = $('#warehouse_select').val()
        warehouse = warehouse == null ? '' : `ware_id='${warehouse}'`

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

        let date = `AND exp_date between '${start_date}' AND '${end_date}'`

        // 供應商料號
        let vender_pn = $('#vender_pn').val()
        vender_pn =
          vender_pn.trim().length == 0 ? '' : `AND vender_pn='${vender_pn}'`

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

        //搜尋AJAX
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_storage_view_material_thing_join_log',
              whereClause: `${warehouse} ${date} ${vender_pn} ${material_id} ${date_code} ${supplier} ${lot_no} ${checkbox_arr}`,
            }),
          },
          {
            success: function (data) {
              if (data.length <= 3000) {
                ctx.SearchData = data
                let position_data = ctx.preCon.getPositionData
                let ans = []
                _.each(data, (val) => {
                  let status, position

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
                  } else if (val.in_stock == 99) {
                    status = '領出'
                  } else {
                    status = '---'
                  }
                  let arr = [
                    val.thing_id || '---',
                    (val.stock_in_time = val.stock_in_time
                      ? moment(val.stock_in_time).format('YYYY/MM/DD HH:mm:ss')
                      : '---'),
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
                    `<button name='btn_log' class="btn btn-primary">檢視</button>`,
                  ]
                  return ans.push(arr)
                })
                ctx.ReportTable.drawTable(ans)
              } else {
                $.smallBox({
                  title: '查詢筆數過多',
                  content: `目前搜尋筆數為${data.length}筆 ， 請利用搜尋條件將筆數減少至3000筆以下`,
                  color: servkit.colors.red,
                  iconSmall: 'fa fa-times',
                  timeout: 4000,
                })
              }
            },
          }
        )
      })

      //按下檢視明細
      $('#query-result').on('click', '[name=btn_log]', function () {
        //產生發料單明細 上方InfoTable
        let tr_data = $(this.closest('tr')).data('row-data')
        let dataObj = ctx.infoTableObj.reduce((obj, value, index) => {
          obj[value] = tr_data[index]
          return obj
        }, {})
        ctx.modalDataObj = dataObj
        ctx.DetailTable.draw(dataObj)

        // //產生發料單明細 下方reportTable

        ctx.ItemTable = createReportTable({
          $tableElement: $('#item_table'),
          $tableWidget: $('#item_table_widget'),
          showNoData: false,
        })

        servkit.ajax(
          {
            url: 'api/ennoconn/thing-log',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              whereClause: `thing_id='${dataObj.thing_id}'`,
            }),
          },
          {
            success(data) {
              ctx.record_drawTable(data, dataObj, tr_data, ctx)
            },
          }
        )

        $('#detail-modal').modal('show')
      })

      //按下轉出excel
      servkit.downloadExcel($('#export_excel'), () => {
        let tableHeader = _.map(
          $('#query-result').find('thead tr:nth-of-type(2) *'),
          function (e) {
            return e.textContent.trim()
          }
        ).filter((i, index) => i && index < 11)

        let matrix = Array.from(ctx.ReportTable.table.data())

        return {
          fileName: '物件紀錄' + moment().format('YYYYMMDDHHmmss'),
          format: tableHeader.map(() => 'text'),
          header: tableHeader,
          matrix: matrix.map((i) => i.filter((i, index) => index < 11)),
        }
      })
    },
    util: {
      ReportTable: '',
      DetailTable: '',
      ItemTable: '',
      SearchData: '',
      infoTableObj: '',
      positionData: '',
      initInfoTable: function () {
        let ctx = this
        let columns = [
          {
            title: i18n('Pkg-Id'),
            name: 'thing_id',
          },
          { title: i18n('Storage_Date'), name: 'bill_date' },
          {
            title: i18n('Part_No') + '(CPN)',
            name: 'material_id',
          },
          { title: i18n('Supplier_Name'), name: 'vender_name' },
          {
            title: i18n('Date_Code') + '(Date Code)',
            name: 'delivery_date',
          },
          {
            title: i18n('LotNo'),
            name: 'vender_lot',
          },
          {
            title: i18n('Expiry_Date'),
            name: 'bill_exp_date',
          },
          {
            title: i18n('Warehouse'),
            name: 'ware_id',
          },
          {
            title: i18n('Storage_Spaces'),
            name: 'storage_spaces',
          },
          {
            title: i18n('Quantity'),
            name: 'quantity',
          },
          {
            title: i18n('Status'),
            name: 'status',
          },
        ]
        ctx.infoTableObj = _.pluck(columns, 'name')
        ctx.DetailTable = new InfoTable(
          document.getElementById('detail_table'),
          11,
          columns
        )
      },
      record_drawTable: function (data, dataObj) {
        let ctx = this
        let ans = []
        _.each(data, (val) => {
          //出入庫方式
          let situation
          if (val.situation == 21) {
            situation = '發料單出庫'
          } else if (val.situation == 22) {
            situation = '料站表出庫'
          } else if (val.situation == 23) {
            situation = '繼料出庫'
          } else if (val.situation == 24) {
            situation = '手動查詢出庫'
          } else if (val.situation == 25) {
            situation = '鎖定物料出庫'
          } else if (val.situation == 26) {
            situation = '物料移轉出庫'
          } else if (val.situation == 27) {
            situation = '物料移轉料架出庫'
          } else if (val.situation == 11) {
            situation = '非餘料入庫'
          } else if (val.situation == 12) {
            situation = '餘料退回'
          } else if (val.situation == 13) {
            situation = '物料移轉自動入庫'
          } else {
            situation = '---'
          }
          //出入庫儲位 & preCon的資料
          let stock_in_warehouse = dataObj.ware_id,
            stock_out_warehouse = dataObj.ware_id,
            stock_in_position = '---',
            stock_out_position = '---',
            position,
            store = ctx.preCon.getStoreData,
            position_data = ctx.preCon.getPositionData
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
          //篩選出庫的資料
          const getStockOutPosition = () => {
            return position_data.filter(
              (i) =>
                i.store_id == val.store_id_to &&
                i.store_grid_index == val.store_grid_id_to &&
                i.store_cell_index == val.store_cell_id_to
            )[0]
          }
          //篩選入庫的資料
          const getStockInPosition = () => {
            return position_data.filter(
              (i) =>
                i.store_id == val.store_id_from &&
                i.store_grid_index == val.store_grid_id_from &&
                i.store_cell_index == val.store_cell_id_from
            )[0]
          }
          // 三個條件
          if (stock_out_if && stock_in_if) {
            //出入庫都有
            let position_out = getStockOutPosition(),
              position_in = getStockInPosition(),
              //篩選
              store_out_data = store.filter(
                (i) => i.store_id == position_out.store_id
              )[0],
              store_in_data = store.filter(
                (i) => i.store_id == position_in.store_id
              )[0]
            //兩個儲位都給值
            stock_out_position =
              store_out_data.store_org_id + '-' + position_out.position_org_id
            stock_in_position =
              store_in_data.store_org_id + '-' + position_in.position_org_id
          } else if (stock_out_if) {
            //只有出庫
            position = getStockOutPosition()
            let store_data = store.filter(
              (i) => i.store_id == position.store_id
            )[0]
            stock_in_position =
              store_data.store_org_id + '-' + position.position_org_id
            stock_out_warehouse = '---'
          } else if (stock_in_if) {
            //只有入庫
            position = getStockInPosition()
            let store_data = store.filter(
              (i) => i.store_id == position.store_id
            )[0]
            stock_out_position =
              store_data.store_org_id + '-' + position.position_org_id
            stock_in_warehouse = '---'
          }

          let arr = [
            (val.create_time = val.create_time
              ? moment(val.create_time).format('YYYY/MM/DD HH:mm:ss')
              : '---'),
            situation,
            val.bill_no_in || '---',
            val.bill_no_out || '---',
            val.smt_stn_id || '---',
            stock_in_warehouse,
            stock_in_position,
            stock_out_warehouse,
            stock_out_position,
            val.thing_pcs,
            (val.is_export = val.is_export == 'Y' ? '是' : '否'),
          ]
          ans.push(arr)
        })
        ctx.ItemTable.drawTable(ans)
      },
    },
    preCondition: {
      getSearchData(done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_strongled_bill_stock_in',
            }),
          },
          {
            success(data) {
              //倉庫select
              let ware = data.map((i) => i.ware_id).filter((i) => i)
              let ware_arr = _.uniq(ware)

              servkit.initSelectWithList(ware_arr, $('#warehouse_select'))
              $('#warehouse_select').select2()

              //日期
              servkit.initDatePicker(
                $('#startDate'),
                $('#endDate'),
                false,
                false
              )
              $('#startDate').val('')
              $('#endDate').val('')

              //供應商料號
              let vender_pn = data.map((i) => i.vender_pn).filter((i) => i)
              let vender_pn_arr = _.uniq(vender_pn)
              vender_pn_arr.unshift('')

              servkit.initSelectWithList(vender_pn_arr, $('#vender_pn'))
              $('#vender_pn').select2({
                minimumInputLength: 0,
                allowClear: true,
                placeholder: '選擇供應商料號',
              })
              select2AllowClearHelper($('#vender_pn'))

              //廠內料號
              let material_id = data.map((i) => i.material_id).filter((i) => i)
              let material_id_arr = _.uniq(material_id)
              material_id_arr.unshift('')

              servkit.initSelectWithList(material_id_arr, $('#material_id'))
              $('#material_id').select2({
                minimumInputLength: 0,
                allowClear: true,
                placeholder: '選擇廠內料號',
              })
              select2AllowClearHelper($('#material_id'))

              done(data)
            },
          }
        )
      },
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
      getStoreData(done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_storage_store',
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
