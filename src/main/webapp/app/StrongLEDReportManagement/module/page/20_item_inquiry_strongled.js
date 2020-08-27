export default function () {
  GoGoAppFun({
    gogo: function gogo(context) {
      servkit.initSelectWithList(
        context.preCon.getMaterialData,
        $('[name=material-id]')
      )

      // 原料選項
      var selectText = '' // 紀錄上次輸入文字
      $('[name=material-id]').select2({
        query: function (q) {
          var pageSize = 20 // or whatever pagesize
          if (selectText !== q.term) {
            // 判斷跟上次輸入的文字是不是一樣(scroll也會觸發query function)
            selectText = q.term
            servkit.ajax(
              {
                url: 'api/storage/material',
                type: 'GET',
                data: {
                  whereclause: `ProdID like '%${q.term}%'`,
                },
              },
              {
                success: function (data) {
                  context.select2Data = _.map(data, (val) => {
                    return {
                      id: val.material_id,
                      text: val.material_id,
                    }
                  })
                  q.callback({
                    results: context.select2Data.slice(
                      (q.page - 1) * pageSize,
                      q.page * pageSize
                    ),
                    more: context.select2Data.length >= q.page * pageSize,
                  })
                },
              }
            )
          } // 如果跟上次輸入文字一樣就不用再查一次，直接把結果呈現即可
          else
            q.callback({
              results: context.select2Data.slice(
                (q.page - 1) * pageSize,
                q.page * pageSize
              ),
              more: context.select2Data.length >= q.page * pageSize,
            })
        },
      })

      context.resultReportTable = createReportTable({
        $tableElement: $('#query-result'),
        $tableWidget: $('#query-result-widget'),
      })
      $('#query-result-widget .dt-toolbar').addClass('hide')
      context.changeToMaterialThingData()

      servkit.validateForm($('#form'), $('#submit-btn'))
      $('#submit-btn').on('click', function (evt) {
        evt.preventDefault()
        context.submitBtn.doing()
        var thingIdList =
          context.materialThingData[$('[name=material-id]').val()]
        if (thingIdList) {
          thingIdList = thingIdList.join("','")
        }
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_storage_store_thing_map',
              columns: [
                'store_id',
                'grid_index',
                'cell_start_index',
                'thing_id',
                'thing_pcs',
              ],
              whereClause: `thing_id in ('${thingIdList}')`,
            }),
          },
          {
            success: function (data) {
              context.resultRenderTable(data)
              context.submitBtn.done() // 查詢按鈕結束loading
            },
          }
        )
      })
    },
    util: {
      select2Data: [],
      resultReportTable: null,
      materialThingData: {},
      submitBtn: servkit.loadingButton(document.querySelector('#submit-btn')), // 初始按鈕loading的功能
      changeToMaterialThingData: function () {
        var ctx = this
        _.each(ctx.preCon.getThingMaterialData, (val, key) => {
          if (!ctx.materialThingData[val]) {
            ctx.materialThingData[val] = []
          }
          ctx.materialThingData[val].push(key)
        })
      },
      resultRenderTable: function (data) {
        var ctx = this
        ctx.resultReportTable.drawTable(
          _.map(data, (val) => {
            var material = ctx.preCon.getThingMaterialData[val.thing_id]
            var storePath = ctx.commons.getStorePath(
              val.store_id,
              val.grid_index,
              val.cell_start_index
            )
            return [
              storePath.id || '---',
              storePath.name || '---',
              material || '---',
              val.thing_id || '---',
              val.thing_pcs || val.thing_pcs === 0 ? val.thing_pcs : '---',
            ]
          })
        )
      },
    },
    preCondition: {
      getStoreStrucData: function (done) {
        this.commons.getStoreStrucData(done)
      },
      getStorePositionMap: function (done) {
        this.commons.getStorePositionMap(done)
      },
      getStoreData: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_storage_store',
              columns: ['store_id', 'store_name'],
            }),
          },
          {
            success: function (data) {
              var storeData = {}
              _.each(data, function (elem) {
                storeData[elem.store_id] = elem.store_name
              })
              done(storeData)
            },
          }
        )
      },
      getThingMaterialData: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_storage_material_thing',
              columns: ['thing_id', 'material_id'],
            }),
          },
          {
            success: function (data) {
              var thingMaterialData = {}
              _.each(data, function (elem) {
                thingMaterialData[elem.thing_id] = elem.material_id
              })
              done(thingMaterialData)
            },
          }
        )
      },
      getMaterialData: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_storage_material',
              columns: ['material_id', 'material_name'],
            }),
          },
          {
            success: function (data) {
              var materialData = {}
              _.each(data, function (elem) {
                materialData[elem.material_id] = elem.material_id
              })
              done(materialData)
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
      ['/js/plugin/select2/select2.min.js'],
    ],
  })
}
