export default function () {
  GoGoAppFun({
    gogo: function (context) {
      servkit.crudtable({
        tableSelector: '#zone-table',
        tableModel: 'com.servtech.servcloud.app.model.storage.Zone',
        create: {
          url: 'api/storage/zone',
          send: function () {
            return {
              zone_x_len: (function () {
                return 0
              })(),
              zone_y_len: (function () {
                return 0
              })(),
            }
          },
          finalDo: function (newRow) {
            context.zoneMap[JSON.parse($(newRow).attr('stk-db-id'))] = $(newRow)
              .find('td:eq(1)')
              .text()
          },
        },
        read: {
          url: 'api/stdcrud',
          end: {
            1: function (data, rowData) {
              context.zoneMap[rowData.zone_id] = rowData.zone_name
              return data
            },
          },
        },
        update: {
          url: 'api/stdcrud',
          end: {
            1: function (td, formData) {
              context.zoneMap[formData.zone_id] = formData.zone_name
              return formData.zone_name
            },
          },
        },
        delete: {
          url: 'api/stdcrud',
          contentFunc: function (deleteIds) {
            var dataList = _.map(deleteIds, (val) => {
              return context.zoneMap[val]
            }).sort()
            return `${dataList.join(', ')}, ${i18n('Sure_Delete_Data')}`
          },
        },
      })
    },
    util: {
      zoneMap: {},
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
