export default function () {
  GoGoAppFun({
    gogo: function () {
      servkit.crudtable({
        tableModel:
          'com.servtech.servcloud.app.model.huangliang_matStock.MatLength',
        tableSelector: '#stk-table',
        // centerColumn: [1, 2],
        create: {
          url: 'api/stdcrud',
        },
        read: {
          url: 'api/stdcrud',
        },
        update: {
          url: 'api/stdcrud',
        },
        delete: {
          url: 'api/stdcrud',
        },
        validate: {
          1: function (td, table) {
            var input = td.querySelector('input')
            if (input.value === '') {
              return '材料長度必填'
            }

            if (!input.disabled) {
              if (
                _.find(table.columns(0).data().eq(0), function (existId) {
                  return existId.toLowerCase() === input.value.toLowerCase()
                })
              ) {
                return '材料長度不可重複'
              }
            }
          },
        },
      })
    },
    dependencies: [
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatables/jquery.dataTables.rowReordering.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
    ],
  })
}
