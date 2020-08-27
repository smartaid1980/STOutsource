import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      servkit.crudtable({
        tableSelector: '#store-type-table',
        tableModel: 'com.servtech.servcloud.app.model.storage.StoreType',
        create: {
          url: 'api/storage/storetype',
          finalDo: function (newRow) {
            context.storeTypeMap[JSON.parse($(newRow).attr('stk-db-id'))] = $(
              newRow
            )
              .find('td:eq(1)')
              .text()
          },
        },
        read: {
          url: 'api/stdcrud',
          end: {
            1: function (data, rowData) {
              context.storeTypeMap[rowData.store_type_id] =
                rowData.store_type_name
              return data
            },
          },
        },
        update: {
          url: 'api/stdcrud',
          end: {
            1: function (td, formData) {
              context.storeTypeMap[formData.store_type_id + '.0'] =
                formData.store_type_name
              return formData.store_type_name
            },
          },
        },
        delete: {
          url: 'api/stdcrud',
          contentFunc: function (deleteIds) {
            var dataList = _.map(deleteIds, (val) => {
              return context.storeTypeMap[val]
            }).sort()
            return `${dataList.join(', ')}, ${i18n('Sure_Delete_Data')}`
          },
        },
        validate: {
          3: function (td) {
            let input = td.querySelector('input')
            let regStr = /^[\d]+$/
            if (!regStr.test(input.value)) {
              return `${i18n('Valid_Number')}`
            }
          },
        },
      })
    },
    util: {
      storeTypeMap: {},
    },
    preCondition: {},
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
