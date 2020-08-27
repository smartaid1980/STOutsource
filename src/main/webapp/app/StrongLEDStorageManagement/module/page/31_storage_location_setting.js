import { getPositionStructure } from '../positionStructure.js'

export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      ctx.initTable()

      ctx.searchData.initQueryPositionSelects(
        $('#show-level'),
        $('#level-option')
      )

      //送出查詢資料
      $('#submit-btn').click((e) => {
        e.preventDefault()
        const selectedIdPath = $('#level-option').val()
        let reg = new RegExp(`^${selectedIdPath}`, 'g')
        let arr = _.chain(ctx.searchData.storageMap)
          .filter((i) => i.idPath.match(reg))
          .map((i) => i.levels[ctx.levelCount - 1].db_id)
          .value()
        let params = {
          whereClause: `store_id IN ('${arr.join("','")}')`,
        }
        ctx.ctable.changeReadUrl(false, params)
        ctx.ctable.refreshTable()
      })
      //改變儲位編碼
      $('#stk-table').on('change', "select[name='store_view']", function () {
        ctx.tableStore = this.value
        ctx.ChangeMaterial_id(this.value)
      })
      //改變品號
      $('#stk-table').on('change', "select[name='material_id']", function () {
        ctx.ChangeDescAndType(this.value)
      })
    },
    util: {
      material_id_data: '',
      zoneData: '',
      searchData: '',
      storePairData: '',
      levelData: '',
      levelCount: '',
      tableStore: '',
      updateTable: function (ctx = this) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_comoss_material_position',
              columns: ['store_id', 'grid_index', 'cell_index', 'material_id'],
            }),
          },
          {
            success: function (data) {
              ctx.levelData = data
            },
          }
        )
      },
      ChangeMaterial_id: function (data) {
        $("select[name='store_id'] option").remove()
        $("select[name='grid_index'] option").remove()
        $("select[name='cell_index'] option").remove()
        $("select[name='material_id'] option").remove()
        let ctx = this
        //隱藏的三格
        let hide_arr = _.chain(ctx.storePairData)
          .filter((i) => i.position_id == data)
          .value()
        _.each(hide_arr, (value) => {
          $("select[name='store_id']").append(
            `<option style="padding:3px 0 3px 3px;" value="${value.store_id}">${value.store_id}</option>`
          )
          $("select[name='grid_index']").append(
            `<option style="padding:3px 0 3px 3px;" value="${value.store_grid_index}">${value.store_grid_index}</option>`
          )
          $("select[name='cell_index']").append(
            `<option style="padding:3px 0 3px 3px;" value="${value.store_cell_index}">${value.store_cell_index}</option>`
          )
        })
        // 品號篩選
        let material_arr = _.chain(ctx.levelData)
          .filter(
            (i) =>
              i.store_id == $("select[name='store_id'] option").eq(0).val() &&
              i.grid_index ==
                $("select[name='grid_index'] option").eq(0).val() &&
              i.cell_index == $("select[name='cell_index'] option").eq(0).val()
          )
          .map((i) => i.material_id)
          .sort()
          .value()
        let arr = _.difference(
          _.pluck(ctx.material_id_data, 'material_id'),
          material_arr
        )
        if (arr.length === 0) {
          $("select[name='material_id']").append(
            `<option style="padding:3px 0 3px 3px;" value="">目前沒有符合品號</option>`
          )
          $('.stk-save-btn').attr('disabled', true)
        } else {
          servkit.initSelectWithList(arr, $("select[name='material_id']"))
          $('.stk-save-btn').attr('disabled', false)
        }
        $('#select2-chosen-2').text(
          $("select[name='material_id'] option").eq(0).val()
        )
        ctx.ChangeDescAndType()
      },
      ChangeDescAndType: function (data) {
        let ctx = this,
          id = $("select[name='material_id'] option").eq(0).val()
        if (id == '') {
          $("input[name='material_desc']").val('')
          $("input[name='material_type']").val('')
        } else {
          if (data) {
            _.each(ctx.material_id_data, (value) => {
              if (value.material_id == data) {
                $("input[name='material_desc']").val(value.material_desc)
                $("input[name='material_type']").val(value.material_type)
              }
            })
          } else {
            _.each(ctx.material_id_data, (value) => {
              if (value.material_id == id) {
                $("input[name='material_desc']").val(value.material_desc)
                $("input[name='material_type']").val(value.material_type)
              }
            })
          }
        }
      },
      initTable: function () {
        let ctx = this
        const ctable = (ctx.ctable = servkit.crudtable({
          tableModel:
            'com.servtech.servcloud.app.model.comoss.ComossMaterialPosition',
          tableSelector: '#stk-table',
          hideCols: [2, 3, 4],
          create: {
            url: 'api/stdcrud',
            start: function () {
              //品號
              let material_id = ctx.material_id_data.map((i) => i.material_id)
              servkit.initSelectWithList(
                material_id,
                $("select[name='material_id']")
              )

              //顯示在畫面的儲位編碼
              _.each(ctx.storePairData, (val) => {
                let arr_positionID = ctx.searchData.getPositionIdPath(
                  val.position_id
                )

                if (arr_positionID !== null) {
                  $("select[name='store_view']").append(
                    `<option style="padding:3px 0 3px 3px;" value="${
                      val.position_id
                    }">${arr_positionID.toString()}</option>`
                  )
                }
              })
              $("select[name='store_view']").select2()

              //隱藏的三格
              ctx.tableStore = $("select[name='store_view'] option").eq(0).val()
              let hide_arr = _.chain(ctx.storePairData)
                .filter((i) => i.position_id == ctx.tableStore)
                .value()
              _.each(hide_arr, (value) => {
                $("select[name='store_id']").append(
                  `<option style="padding:3px 0 3px 3px;" value="${value.store_id}">${value.store_id}</option>`
                )
                $("select[name='grid_index']").append(
                  `<option style="padding:3px 0 3px 3px;" value="${value.store_grid_index}">${value.store_grid_index}</option>`
                )
                $("select[name='cell_index']").append(
                  `<option style="padding:3px 0 3px 3px;" value="${value.store_cell_index}">${value.store_cell_index}</option>`
                )
              })
              //品號初始化 && 篩選品號
              let material_arr = _.chain(ctx.levelData)
                .filter(
                  (i) =>
                    i.store_id ==
                      $("select[name='store_id'] option").eq(0).val() &&
                    i.grid_index ==
                      $("select[name='grid_index'] option").eq(0).val() &&
                    i.cell_index ==
                      $("select[name='cell_index'] option").eq(0).val()
                )
                .map((i) => i.material_id)
                .sort()
                .value()
              let arr = _.difference(
                _.pluck(ctx.material_id_data, 'material_id'),
                material_arr
              )
              if (arr.length === 0) {
                $("select[name='material_id'] option").remove()
                $("select[name='material_id']").append(
                  `<option style="padding:3px 0 3px 3px;" value="">目前沒有符合品號</option>`
                )
                $('.stk-save-btn').attr('disabled', true)
              } else {
                $("select[name='material_id'] option").remove()
                servkit.initSelectWithList(arr, $("select[name='material_id']"))
                $("select[name='material_id']").select2()
                $('.stk-save-btn').attr('disabled', false)
              }
              //規格及可放置類型初始化
              let id = $("select[name='material_id'] option").eq(0).val()
              _.each(ctx.material_id_data, (value) => {
                if (value.material_id == id) {
                  $("input[name='material_desc']").val(value.material_desc)
                  $("input[name='material_type']").val(value.material_type)
                }
              })
            },
            send: function (tdEles) {
              return {
                status: (function () {
                  //開關預設為ON時'Y'，OFF時'N'
                  if ($(tdEles[7]).find(':checkbox').prop('checked')) {
                    return 1
                  } else {
                    return 0
                  }
                })(),
              }
            },
            end: {
              1: function (td) {
                let arr_positionID = ctx.searchData
                  .getPositionIdPath(ctx.tableStore)
                  .toString()

                td = arr_positionID
                return td
              },
              6: function (td, formData) {
                td = formData.material_id
                return td
              },
            },
            finalDo: function () {
              ctx.updateTable()
            },
          },
          read: {
            url: 'api/stdcrud',
            preventReadAtFirst: true,
            end: {
              1: function (data, rowData) {
                let arr = ctx.searchData
                  .getPositionIdPath(
                    _.chain(ctx.storePairData)
                      .filter(
                        (i) =>
                          i.store_id == rowData.store_id &&
                          i.store_grid_index == rowData.grid_index &&
                          i.store_cell_index == rowData.cell_index
                      )
                      .map((i) => i.position_id)
                      .join()
                      .value()
                  )
                  .toString()
                return (data = arr)
              },
              5: function (data, rowData) {
                ctx.material_id_data.map((i) => {
                  if (rowData.material_id === i.material_id) {
                    data = i.material_type
                  }
                })
                return data
              },
              7: function (data, rowData) {
                ctx.material_id_data.map((i) => {
                  if (rowData.material_id === i.material_id) {
                    data = i.material_desc
                  }
                })
                return data
              },
            },
          },
          update: {
            url: 'api/stdcrud',
            start: {
              1: function (oldTd, newTd) {
                let data = $(oldTd).text()
                $(newTd)
                  .children()
                  .append(
                    `<option style="padding:3px 0 3px 3px;" value="${data}">${data}</option>`
                  )
                $(newTd)
                  .children()
                  .addClass('form-control')
                  .prop('disabled', true)
              },
              2: function (oldTd, newTd) {
                let data = $(oldTd).text()
                $(newTd)
                  .children()
                  .append(
                    `<option style="padding:3px 0 3px 3px;" value="${data}">${data}</option>`
                  )
                $(newTd).children().prop('disabled', true)
              },
              3: function (oldTd, newTd) {
                let data = $(oldTd).text()
                $(newTd).children().find('option').remove()
                $(newTd)
                  .children()
                  .append(
                    `<option style="padding:3px 0 3px 3px;" value="${data}">${data}</option>`
                  )
                $(newTd).children().prop('disabled', true)
              },
              4: function (oldTd, newTd) {
                let data = $(oldTd).text()
                $(newTd)
                  .children()
                  .append(
                    `<option style="padding:3px 0 3px 3px;" value="${data}">${data}</option>`
                  )
                $(newTd).children().prop('disabled', true)
              },
              6: function (oldTd, newTd) {
                let data = $(oldTd).text()
                $(newTd)
                  .children()
                  .append(
                    `<option style="padding:3px 0 3px 3px;" value="${data}">${data}</option>`
                  )
                $(newTd)
                  .children()
                  .addClass('form-control')
                  .prop('disabled', true)
              },
            },
            send: function (tdEles) {
              return {
                status: (function () {
                  //開關預設為ON時'Y'，OFF時'N'
                  if ($(tdEles[7]).find(':checkbox').prop('checked')) {
                    return 1
                  } else {
                    return 0
                  }
                })(),
              }
            },
          },
          delete: {
            url: 'api/stdcrud',
            start: function (deleteId) {
              deleteId.grid_index = String(deleteId.grid_index)
              deleteId.cell_index = String(deleteId.cell_index)
              return deleteId
            },
            finalDo: function () {
              ctx.updateTable()
            },
          },
        }))
      },
    },
    preCondition: {
      getMaterialData: function (done) {
        let ctx = this
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_comoss_material',
              columns: ['material_id', 'material_type', 'material_desc'],
            }),
          },
          {
            success: function (data) {
              ctx.material_id_data = data
              done(data)
            },
          }
        )
      },
      getZoneData: function (done) {
        let ctx = this
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_storage_zone',
              columns: ['zone_id', 'zone_name'],
            }),
          },
          {
            success: function (data) {
              ctx.zoneData = data
              done(data)
            },
          }
        )
      },
      getLevelData: function (done) {
        let ctx = this
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_comoss_material_position',
              columns: ['store_id', 'grid_index', 'cell_index', 'material_id'],
            }),
          },
          {
            success: function (data) {
              ctx.levelData = data
              done(data)
            },
          }
        )
      },
      getStoreIDtoPair: function (done) {
        let ctx = this
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
              ctx.storePairData = data
              done(data)
            },
          }
        )
      },
      getStorage: function (done) {
        let ctx = this
        getPositionStructure().then((instance) => {
          ctx.searchData = instance
          ctx.levelCount = instance.structure.length
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
