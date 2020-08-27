export default function () {
  GoGoAppFun({
    gogo: function gogo(context) {
      servkit.initSelectWithList(
        context.preCon.getZoneData,
        $('[name=zone-id]')
      )
      _.each(context.preCon.getStoreData, (val, key) => {
        if (!context.zoneStoreMap[val.zone]) {
          context.zoneStoreMap[val.zone] = {}
        }
        context.zoneStoreMap[val.zone][key] = val.name
      })
      $('[name=zone-id]')
        .on('change', function () {
          servkit.initSelectWithList(
            context.zoneStoreMap[this.value],
            $('[name=store-id]')
          )
        })
        .trigger('change')
      context.resultReportTable = createReportTable({
        $tableElement: $('#query-result'),
        $tableWidget: $('#query-result-widget'),
      })
      $('#query-result-widget .dt-toolbar').addClass('hide')

      servkit.validateForm($('#form'), $('#submit-btn'))
      $('#submit-btn').on('click', function (evt) {
        evt.preventDefault()
        context.submitBtn.doing()
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
              whereClause: `store_id='${$('[name=store-id]').val()}'`,
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
      zoneStoreMap: {},
      resultReportTable: null,
      submitBtn: servkit.loadingButton(document.querySelector('#submit-btn')), // 初始按鈕loading的功能
      resultRenderTable: function (data) {
        var ctx = this
        ctx.resultReportTable.drawTable(
          _.map(data, (val) => {
            var material = ctx.preCon.getMaterialThingData[val.thing_id]
            return [
              ctx.preCon.getStoreData[val.store_id].name || '---',
              val.grid_index || val.grid_index === 0
                ? val.grid_index + 1
                : '---',
              val.cell_start_index || val.cell_start_index === 0
                ? val.cell_start_index + 1
                : '---',
              material || '---',
              ctx.preCon.getMaterialData[material] || '---',
              val.thing_id || '---',
              val.thing_pcs || val.thing_pcs === 0 ? val.thing_pcs : '---',
            ]
          })
        )
      },
    },
    preCondition: {
      getZoneData: function (done) {
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
              var zoneData = {}
              _.each(data, function (elem) {
                zoneData[elem.zone_id] = elem.zone_name
              })
              done(zoneData)
            },
          }
        )
      },
      getStoreData: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_storage_store',
              columns: ['store_id', 'store_name', 'zone_id'],
            }),
          },
          {
            success: function (data) {
              var storeData = {}
              _.each(data, function (elem) {
                storeData[elem.store_id] = {
                  name: elem.store_name,
                  zone: elem.zone_id,
                }
              })
              done(storeData)
            },
          }
        )
      },
      getMaterialThingData: function (done) {
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
              var materialThingData = {}
              _.each(data, function (elem) {
                materialThingData[elem.thing_id] = elem.material_id
              })
              done(materialThingData)
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
                materialData[elem.material_id] = elem.material_name
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
