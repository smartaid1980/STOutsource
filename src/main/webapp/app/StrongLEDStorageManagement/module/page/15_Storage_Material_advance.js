import { getPurchaseOrder } from '../purchaseOrderList.js'
import { getPositionStructure } from '../positionStructure.js'

export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      ctx.initSelect()
      let a
      //改變採購單號
      $('#pur_id').on('change', function () {
        ctx.pur_id = this.value
      })

      //改變採購單別
      $('#show_pur').on('change', function () {
        ctx.pur_order = this.value
        ctx.pur_num = $('#pur_num option').eq(0).val()
      })

      //改變採購單序號
      $('#pur_num').on('change', function () {
        ctx.pur_num = this.value
      })
      // report table
      ctx.reportTable = createReportTable({
        $tableElement: $('#detail-table'),
        $tableWidget: $('#detail-table-widget'),
        customBtns: [
          `<h3 id='report_id'></h3>`,
          `<h3 id='report_order'></h3>`,
          `<h3 id='report_num'></h3>`,
          `<h3 id='report_materia_id'></h3>`,
        ],
        checkbox: false,
      })
      //送出查詢條件
      servkit.validateForm($('#query-form'), $('#query-btn'))
      $('#query-btn').click((e) => {
        e.preventDefault()
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_comoss_view_schedule_vs_stock_in',
              columns: null,
              whereClause: `pur_id = ${ctx.pur_id} AND pur_type = ${ctx.pur_order} AND serial_num = ${ctx.pur_num} AND (log_type = 1 OR log_type IS NULL)`,
            }),
          },
          {
            success: function (data) {
              ctx.renderTable(data, ctx.pur_id, ctx.pur_order, ctx.pur_num)
            },
          }
        )
      })
    },
    util: {
      reportTable: '',
      searchData: '',
      pur_order: '',
      pur_id: '',
      pur_num: '',
      material_id: '',
      positionData: '',
      pairData: '',
      renderTable: function (data, id, type, num) {
        let ctx = this
        // data[2].pur_id = '200103333',`200217020`
        ctx.material_id = _.uniq(_.pluck(data, 'material_id')).join('')
        let ans = []
        _.each(data, (value) => {
          let storage = ctx.positionData.getPositionIdPath(value.position_id)
          if (storage !== null) {
            storage.toString()
          }

          //預排儲位並確認三個值是否為 undefined 會變NaN 不是NaN在檢驗
          let schedule_storage = _.isNaN(
            value.schedule_store_id +
              value.schedule_store_grid_index +
              value.schedule_store_cell_index
          )

          let schedule_positionId
          if (!schedule_storage) {
            schedule_positionId = ctx.positionData.getPositionIdPath(
              _.chain(ctx.preCon.getPairData)
                .filter(
                  (i) =>
                    i.store_id == value.schedule_store_id &&
                    i.store_grid_index == value.schedule_store_grid_index &&
                    i.store_cell_index == value.schedule_store_cell_index
                )
                .map((i) => i.position_id)
                .join()
                .value()
            )
          }
          //reportTable 顯示畫面用陣列
          let arr = [
            (value.bill_no = value.bill_no || '無入庫資料'),
            (value.bill_detail = value.bill_detail || '無入庫資料'),
            (value.bill_stock_in_class =
              value.bill_stock_in_class || '無入庫資料'),
            (value.thing_id = value.thing_id || '無入庫資料'),
            (value.schedule_thing_id = value.schedule_thing_id || '無預排資料'),
            `${storage || '無入庫資料'}`,
            `${
              schedule_positionId == null
                ? (schedule_storage = '無預排資料')
                : (schedule_storage = schedule_positionId.toString())
            }`,
            `${
              value.log_time === undefined
                ? '無入庫資料'
                : value.log_time.toFormatedDatetime()
            }`,
            `${
              value.exp_date === undefined
                ? '無預排資料'
                : value.exp_date.toFormatedDate()
            }${
              value.exp_edate === undefined
                ? ''
                : '~' + value.exp_edate.toFormatedDate()
            }`,
            (value.thing_pcs = value.thing_pcs || '無入庫資料'),
            (value.schedule_thing_pcs =
              value.schedule_thing_pcs || '無預排資料'),
          ]
          ans.push(arr)
        })
        $('#report_id').text(`採購單號: ${id || '無比對資料'}`)
        $('#report_order').text(`採購單別: ${type || '無比對資料'}`)
        $('#report_num').text(`採購單序號: ${num || '無比對資料'}`)
        $('#report_materia_id').text(`品號: ${ctx.material_id || '無比對資料'}`)
        ctx.reportTable.drawTable(ans)
      },
      initSelect: function () {
        let ctx = this
        let pur_id = $('#query-form').find('input[id=pur_id]'),
          show_pur = $('#query-form').find('select[id=show_pur]'),
          pur_num = $('#query-form').find('select[id=pur_num]')
        ctx.searchData.initQueryFormEls(pur_id[0], show_pur[0], pur_num[0])
      },
    },
    preCondition: {
      getPairData: function (done) {
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
                'position_id',
              ],
            }),
          },
          {
            success: function (data) {
              done(data)
            },
          }
        )
      },
      initSearch: function (done) {
        getPositionStructure().then((instance) => {
          let ctx = this
          ctx.positionData = instance
          done(instance)
        })
      },
      queryFunction: function (done) {
        getPurchaseOrder().then((instance) => {
          let ctx = this
          ctx.searchData = instance
          done(instance)
        })
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
      ['/js/plugin/select2/select2.min.js'],
    ],
  })
}
