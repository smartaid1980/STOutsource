import { getPositionStructure } from '../../../StrongLEDStorageManagement/module/positionStructure.js'

export default function () {
  GoGoAppFun({
    gogo(ctx) {
      servkit.initSelectWithList(
        ctx.preCon.getMaterialData,
        $('[name=material-id]')
      )
      // 原料選項
      let selectText = '' // 紀錄上次輸入文字
      $('[name=material-id]').select2({
        query(q) {
          let pageSize = 20 // or whatever pagesize
          if (selectText !== q.term) {
            // 判斷跟上次輸入的文字是不是一樣(scroll也會觸發query function)
            selectText = q.term
            servkit.ajax(
              {
                url: 'api/getdata/db',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                  table: 'a_comoss_material',
                  columns: ['material_id'],
                  whereClause: `material_id like '%${q.term}%'`,
                }),
              },
              {
                success(data) {
                  ctx.select2Data = _.map(data, (val) => {
                    return {
                      id: val.material_id,
                      text: val.material_id,
                    }
                  })
                  q.callback({
                    results: ctx.select2Data.slice(
                      (q.page - 1) * pageSize,
                      q.page * pageSize
                    ),
                    more: ctx.select2Data.length >= q.page * pageSize,
                  })
                },
              }
            )
          } // 如果跟上次輸入文字一樣就不用再查一次，直接把結果呈現即可
          else
            q.callback({
              results: ctx.select2Data.slice(
                (q.page - 1) * pageSize,
                q.page * pageSize
              ),
              more: ctx.select2Data.length >= q.page * pageSize,
            })
        },
      })

      ctx.resultReportTable = createReportTable({
        $tableElement: $('#query-result'),
        $tableWidget: $('#query-result-widget'),
      })
      $('#query-result-widget .dt-toolbar').addClass('hide')

      servkit.validateForm($('#form'), $('#submit-btn'))
      $('#submit-btn').on('click', function (evt) {
        evt.preventDefault()
        ctx.submitBtn.doing()
        const material_id = $('[name=material-id]').val()
        const thingIdList = _.chain(ctx.preCon.getMaterialThingData)
          .pick((mat_id) => mat_id === material_id)
          .keys()
          .value()

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
              whereClause: `thing_id IN ('${thingIdList.join("','")}')`,
            }),
          },
          {
            success(data) {
              ctx.resultRenderTable(data)
              ctx.submitBtn.done() // 查詢按鈕結束loading
            },
          }
        )
      })
    },
    util: {
      searchData: '',
      select2Data: [],
      resultReportTable: null,
      materialThingData: {},
      levelCount: '',
      submitBtn: servkit.loadingButton(document.querySelector('#submit-btn')), // 初始按鈕loading的功能
      resultRenderTable(data) {
        const ctx = this
        let store_id
        let grid_index
        let cell_start_index
        let material_id
        let position_id
        let idPath
        let idNamePath
        let positionIdPath

        const tableData = data.map((val) => {
          ;({ store_id, grid_index, cell_start_index } = val)
          material_id = ctx.preCon.getMaterialThingData[val.thing_id]
          position_id = ctx.searchData.getPositionIdFromDb(
            store_id,
            grid_index,
            cell_start_index
          )

          if (position_id) {
            positionIdPath = ctx.searchData.getPositionIdPath(position_id)
            idPath = positionIdPath.toString()
            idNamePath = positionIdPath.getNamePath()
          } else {
            idPath = null
            idNamePath = null
          }
          return [
            idPath ?? '---',
            idNamePath ?? '---',
            material_id ?? '---',
            val.thing_id ?? '---',
            val.thing_pcs ?? val.thing_pcs === 0 ? val.thing_pcs : '---',
          ]
        })
        ctx.resultReportTable.drawTable(tableData)
      },
    },
    preCondition: {
      getMaterialThingData(done) {
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
            success(data) {
              let materialThingData = {}
              _.each(data, function (elem) {
                materialThingData[elem.thing_id] = elem.material_id
              })
              done(materialThingData)
            },
          }
        )
      },
      getMaterialData(done) {
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
            success(data) {
              let materialData = {}
              _.each(data, function (elem) {
                materialData[elem.material_id] = elem.material_id
              })
              done(materialData)
            },
          }
        )
      },
      getStorage(done) {
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
