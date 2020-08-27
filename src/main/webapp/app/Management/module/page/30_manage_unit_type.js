export default function () {
  GoGoAppFun({
    gogo: function () {
      servkit.crudtable({
        tableSelector: '#unit-type-table',
        tableModel: 'com.servtech.servcloud.module.model.UnitType',
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
        validate: {
          // 0: function (td, table) {}
        },
      })
    },
    util: {},
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
