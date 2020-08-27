export default function () {
  GoGoAppFun({
    gogo: function () {
      servkit.crudtable({
        tableModel: 'com.servtech.servcloud.module.model.MachineType',
        tableSelector: '#stk-machine-type-table',
        hideCols: [2],
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
      })
    },
    dependencies: [
      '/js/plugin/datatables/jquery.dataTables.min.js',
      '/js/plugin/datatables/dataTables.colVis.min.js',
      '/js/plugin/datatables/dataTables.tableTools.min.js',
      '/js/plugin/datatables/dataTables.bootstrap.min.js',
      '/js/plugin/datatable-responsive/datatables.responsive.min.js',
    ],
  })
}
