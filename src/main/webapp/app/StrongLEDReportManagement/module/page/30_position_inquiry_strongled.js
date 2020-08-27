import { getPositionStructure } from '../../../StrongLEDStorageManagement/module/positionStructure.js'
import { validateForm } from '../../../../js/servtech/module/servkit/form.js'
import { ajax } from '../../../../js/servtech/module/servkit/ajax.js'

export default function () {
  GoGoAppFun({
    gogo(ctx) {
      window.c = ctx
      ctx.main()
    },
    util: {
      resultReportTable: null,
      searchData: null,
      levelCount: null,
      main() {
        const ctx = this

        ctx.resultReportTable = createReportTable({
          $tableElement: $('#query-result'),
          $tableWidget: $('#query-result-widget'),
        })
        $('#query-result-widget .dt-toolbar').addClass('hide')

        ctx.searchData.initQueryPositionSelects(
          $('#show-level'),
          $('#level-option')
        )

        validateForm($('#form'), $('#submit-btn'))

        $('#submit-btn').on('click', function (evt) {
          ctx.submitHandler(evt)
        })
      },
      submitHandler(evt) {
        const ctx = this
        const levelOptionVal = $('#level-option').val()

        evt.preventDefault()
        const reg = new RegExp(`^${levelOptionVal}`, 'g')
        const storeIdList = _.chain(ctx.searchData.storageMap)
          .filter((data) => data.idPath.match(reg))
          .map((data) => data.levels[ctx.levelCount - 1]?.db_id)
          .compact()
          .uniq()
          .value()

        ajax(
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
              whereClause: `store_id IN ('${storeIdList.join("','")}')`,
            }),
          },
          {
            success(data) {
              ctx.resultRenderTable(data)
            },
          }
        )
      },
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
        ajax(
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
