export default function () {
  GoGoAppFun({
    gogo(context) {
      context.initCrudTable()
    },
    util: {
      initCrudTable() {
        const context = this

        servkit.crudtable({
          tableSelector: '#stk-table',
          tableModel:
            'com.servtech.servcloud.app.model.huangliang_tool.ToolSupplier',
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
            unavailable: true,
          },
          validate: {},
        })
      },
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
