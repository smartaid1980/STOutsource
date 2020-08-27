import { getPositionStructure } from '../../../StrongLEDStorageManagement/module/positionStructure.js'

export default function () {
  GoGoAppFun({
    gogo(ctx) {
      ctx.resultReportTable = createReportTable({
        $tableElement: $('#query-result'),
        $tableWidget: $('#query-result-widget'),
      })
      servkit.initDatePicker($('#startDate'), $('#endDate'), false, false)
      $('#query-result-widget .dt-toolbar').addClass('hide')

      ctx.searchData.initQueryPositionSelects(
        $('#show-level'),
        $('#level-option')
      )

      servkit.validateForm($('#form'), $('#submit-btn'))

      $('#submit-btn').on('click', function (evt) {
        evt.preventDefault()
        let reg = new RegExp(`^${$('#level-option').val()}`, 'g')
        let arr = _.chain(ctx.searchData.storageMap)
          .filter((i) => i.idPath.match(reg))
          .map((i) => i.levels[ctx.levelCount - 1].db_id)
          .value()
        servkit.ajax(
          {
            url: 'api/stdcrud',
            type: 'GET',
            data: {
              tableModel: 'com.servtech.servcloud.app.model.storage.Log',
              whereClause: `store_id IN ('${arr.join(
                "','"
              )}') AND log_time between '${$(
                '#startDate'
              ).val()} 00:00:00' AND '${$('#endDate').val()} 23:59:59'`,
            },
          },
          {
            success(data) {
              ctx.resultRenderTable(data)
            },
          }
        )
      })
    },
    util: {
      searchData: null,
      resultReportTable: null,
      levelCount: null,
      typeMap: {
        '1': i18n('Warehousing'),
        '2': i18n('A_Library'),
      },
      resultRenderTable(data) {
        const ctx = this
        let store_id
        let store_grid_index
        let store_cell_index
        let material_id
        let position_id
        let idPath
        let idNamePath
        let positionIdPath

        const tableData = data.map((val) => {
          ;({ store_id, store_grid_index, store_cell_index } = val)
          material_id = ctx.preCon.getMaterialThingData[val.thing_id]
          position_id = ctx.searchData.getPositionIdFromDb(
            store_id,
            store_grid_index,
            store_cell_index
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
            val.log_time
              ? moment(val.log_time).format('YYYY/MM/DD HH:mm:ss')
              : '---',
            idPath ?? '---',
            idNamePath ?? '---',
            material_id ?? '---',
            val.thing_id ?? '---',
            ctx.preCon.getSenderData[val.sender_id] ?? '---',
            ctx.typeMap[val.log_type] ?? '---',
            val.log_count,
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
      getSenderData(done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_storage_sender',
              columns: ['sender_id', 'sender_name'],
            }),
          },
          {
            success(data) {
              let senderData = {}
              _.each(data, function (elem) {
                senderData[elem.sender_id] = elem.sender_name
              })
              done(senderData)
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
      ['/js/plugin/dropzone/dropzone.min.js'],
    ],
  })
}
