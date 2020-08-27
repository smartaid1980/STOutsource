import { getPositionStructure } from '../positionStructure.js'
import { select2AllowClearHelper } from '../../../../js/servtech/module/feature/customizeLibSetting.js'
export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      ctx.initTable()
    },
    util: {
      path: '',
      idNamePath: '',
      searchData: '',
      crudtable: '',
      initTable: function () {
        let ctx = this
        ctx.crudtable = servkit.crudtable({
          tableModel: 'com.servtech.servcloud.app.model.ennoconn.ErrorList',
          tableSelector: '#stk-table',
          hideCols: [2, 3, 4, 5],
          create: {
            url: 'api/stdcrud',
            start: function () {
              let ErrorList = []

              //抓全部的idNamePath
              let idNamePath = _.pluck(
                ctx.path.reduce((a, b) => {
                  return a.concat(b)
                }),
                'idNamePath'
              )

              //給儲位的中文 給position store值
              function getPosition(value) {
                let p_id = _.chain(ctx.idNamePath)
                  .filter((i) => i.idNamePath == value)
                  .map((i) => i.db_id)
                  .value()
                  .join()
                $("[name='position_id']").val(p_id)

                let store = _.chain(ctx.preCon.Position)
                  .filter((i) => i.position_id == p_id)
                  .value()
                store = store[0]
                $("[name='store_id']").val(store.store_id)
                $("[name='store_grid_index']").val(store.store_grid_index)
                $("[name='store_cell_index']").val(store.store_cell_index)
              }

              //抓現有的錯誤儲位 避免新增相同的儲位
              servkit.ajax(
                {
                  url: 'api/getdata/db',
                  type: 'POST',
                  contentType: 'application/json',
                  data: JSON.stringify({
                    table: 'a_storage_position_error_list',
                    columns: ['position_id'],
                  }),
                },
                {
                  success: function (data) {
                    data = _.pluck(data, 'position_id')

                    //將錯誤儲位的position id 轉成名稱
                    _.each(data, (val) => {
                      let ErrorPosition = _.chain(ctx.idNamePath)
                        .filter((i) => i.db_id == val)
                        .map((i) => i.idNamePath)
                        .value()
                        .join()
                      return ErrorList.push(ErrorPosition)
                    })

                    //將已存在的錯誤儲位 從select選項排除
                    idNamePath = _.difference(idNamePath, ErrorList)

                    //初始化select
                    servkit.initSelectWithList(
                      idNamePath,
                      $("select[name='position_name']")
                    )
                    $("select[name='position_name']").select2({
                      minimumInputLength: 0,
                      allowClear: true,
                      placeholder: '選擇儲位',
                    })
                    select2AllowClearHelper($("select[name='position_name']"))

                    //先抓第一筆來改變 position store
                    getPosition(
                      $("select[name='position_name'] option").eq(0).val()
                    )
                  },
                }
              )

              //更改選項時 position store 會一起變更
              $("select[name='position_name']").on('change', function () {
                getPosition(this.value)
              })
            },
            end: {
              1: function (td, formData) {
                return (td = formData.position_name)
              },
            },
          },
          read: {
            url: 'api/stdcrud',
            end: {
              1: function (data, rowData) {
                return (data = _.chain(ctx.idNamePath)
                  .filter((i) => i.db_id == rowData.position_id)
                  .map((i) => i.idNamePath)
                  .value()
                  .join())
              },
            },
          },
          update: {
            url: 'api/stdcrud',
            unavailable: true,
          },
          delete: {
            url: 'api/stdcrud',
          },
        })
      },
    },
    preCondition: {
      Position: function (done) {
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
      Storage: function (done) {
        let ctx = this
        getPositionStructure().then((instance) => {
          ctx.searchData = instance
          //抓全部儲位資料
          ctx.path = _.map(instance.storageMap, (i) => {
            return i.position
          })
          //合併成一個陣列
          ctx.idNamePath = ctx.path.reduce((a, b) => {
            return a.concat(b)
          })
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
