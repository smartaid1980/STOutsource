import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      servkit.crudtable({
        tableSelector: '#piller-light-table',
        tableModel:
          'com.servtech.servcloud.app.model.storage.StorePillerLightMap',
        naturalSortColumn: [0],
        create: {
          url: 'api/stdcrud',
        },
        read: {
          url: 'api/stdcrud',
          end: {
            1: function (data) {
              console.log(data, context.preCon.getStoreData[data])
              return context.preCon.getStoreData[data]
            },
          },
        },
        update: {
          unavailable: true,
        },
        delete: {
          url: 'api/stdcrud',
          start: function (deleteId) {
            deleteId.light_index = String(deleteId.light_index)
            return deleteId
          },
          contentFunc: function (deleteIds) {
            var dataList = _.map(deleteIds, (val) => {
              return context.preCon.getPillerData[val.piller_id]
            }).sort()
            return `${dataList.join(', ')}, ${i18n('Sure_Delete_Data')}`
          },
        },
        validate: {
          2: function (td, table) {
            var input = td.querySelector('input')
            if (!input.disabled) {
              if (
                _.find(
                  _.zip(
                    table.columns(0).data().eq(0),
                    table.columns(1).data().eq(0)
                  ),
                  function (existId) {
                    return (
                      existId[0].toLowerCase() ===
                        $('[name=piller_id] option:selected')
                          .text()
                          .toLowerCase() &&
                      String(existId[1]).toLowerCase() ===
                        input.value.toLowerCase()
                    )
                  }
                )
              ) {
                return `${i18n('Stk_Pk')}`
              }
            }
          },
        },
      })
    },
    preCondition: {
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
    },
    dependencies: [
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
        '/js/plugin/datatables/sorting.natural.js',
      ],
    ],
  })
}
