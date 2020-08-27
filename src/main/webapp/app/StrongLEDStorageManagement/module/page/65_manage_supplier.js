export default function () {
  GoGoAppFun({
    gogo: function (context) {
      servkit.crudtable({
        tableSelector: '#supplier-table',
        tableModel: 'com.servtech.servcloud.app.model.storage.Supplier',
        create: {
          url: 'api/storage/supplier',
          finalDo: function (newRow) {
            context.supplierMap[JSON.parse($(newRow).attr('stk-db-id'))] = $(
              newRow
            )
              .find('td:eq(2)')
              .text()
          },
        },
        read: {
          url: 'api/stdcrud',
          end: {
            1: function (data, rowData) {
              context.supplierMap[rowData.supplier_id] = rowData.supplier_name
              return data
            },
          },
        },
        update: {
          url: 'api/stdcrud',
          end: {
            1: function (td, formData) {
              context.supplierMap[formData.supplier_id] = formData.supplier_name
              return formData.supplier_org_id
            },
          },
        },
        delete: {
          url: 'api/stdcrud',
          contentFunc: function (deleteIds) {
            var dataList = _.map(deleteIds, (val) => {
              return context.supplierMap[val]
            }).sort()
            return `${dataList.join(', ')}, ${i18n('Sure_Delete_Data')}`
          },
        },
      })
    },
    util: {
      supplierMap: {},
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
