export default function () {
  GoGoAppFun({
    gogo: function () {
      servkit.crudtable({
        tableModel: 'com.servtech.servcloud.app.model.comoss.ComossMaterial',
        tableSelector: '#stk-machine-type-table',
        hideCols: [0, 7, 8],
        create: {
          unavailable: true,
        },
        read: {
          url: 'api/stdcrud',
          type: 'GET',
        },
        update: {
          unavailable: true,
        },
        delete: {
          unavailable: true,
        },
      })
    },
    util: {},
    dependencies: [
      '/js/plugin/datatables/jquery.dataTables.min.js',
      '/js/plugin/datatables/dataTables.colVis.min.js',
      '/js/plugin/datatables/dataTables.tableTools.min.js',
      '/js/plugin/datatables/dataTables.bootstrap.min.js',
      '/js/plugin/datatable-responsive/datatables.responsive.min.js',
    ],
  })
}
