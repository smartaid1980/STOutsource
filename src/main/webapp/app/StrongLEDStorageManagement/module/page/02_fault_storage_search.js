import { getPositionStructure } from '../positionStructure.js'

export default function () {
  GoGoAppFun({
    gogo: function gogo(ctx) {
      ctx.resultReportTable = createReportTable({
        $tableElement: $('#query-result'),
        $tableWidget: $('#query-result-widget'),
      })

      // 按下搜尋
      $('#submit-btn').on('click', function (evt) {
        evt.preventDefault()
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
        let date = `create_time between '${start_date}000000' AND '${end_date}235959'`
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_storage_position_error_log',
              whereClause: `${date}`,
            }),
          },
          {
            success: function (data) {
              let ans = [],
                pairData = ctx.preCon.getPosition,
                storage = ctx.searchData

              _.each(data, (val) => {
                //篩選
                let position = pairData.filter(
                  (i) =>
                    i.store_id == val.store_id &&
                    i.store_grid_index == val.store_grid_index &&
                    i.store_cell_index == val.store_cell_index
                )

                //取storeID
                let storeID = _.pluck(position, 'store_id')[0]

                //前四層儲位
                let path = _.filter(storage.storageMap, (i) => {
                  return i.levels[ctx.levelCount - 1].db_id == storeID
                })[0]

                //最下層儲位
                let position_name = _.pluck(position, 'position_org_id')[0]

                //組合成儲位名稱
                let arr = path.idNamePath + '-' + position_name

                //錯誤狀態
                let error_status = val.error_clear == 1 ? '是' : '否'

                //創建者
                let user = _.filter(ctx.preCon.getUser, (i) => {
                  i.create_by == val.create_by
                })[0]

                return ans.push([
                  arr,
                  error_status,
                  moment(val.create_time).format('YYYY/MM/DD HH:mm:ss') ??
                    '---',
                  user ?? val.create_by,
                ])
              })
              ctx.resultReportTable.drawTable(ans)
            },
          }
        )
      })
    },
    util: {
      resultReportTable: null,
      searchData: '',
      levelCount: '',
    },
    preCondition: {
      getStorage: function (done) {
        let ctx = this
        getPositionStructure().then((instance) => {
          ctx.searchData = instance
          ctx.levelCount = instance.structure.length
          done(instance)
        })
      },
      getPosition: function (done) {
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
                'position_org_id',
              ],
            }),
          },
          {
            success: function (data) {
              servkit.initDatePicker(
                $('#startDate'),
                $('#endDate'),
                false,
                false
              )
              $('#startDate').val('')
              $('#endDate').val('')
              done(data)
            },
          }
        )
      },
      getUser(done) {
        servkit.ajax(
          {
            url: 'api/user/read',
            type: 'GET',
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
