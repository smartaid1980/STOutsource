export default function () {
  GoGoAppFun({
    gogo: function () {
      servkit.crudtable({
        tableSelector: '#stk-pg-table',
        rightColumn: [],
        create: {
          url: 'api/zebra/config/create',
        },
        read: {
          url: 'api/zebra/config/read',
        },
        update: {
          url: 'api/zebra/config/update',
        },
        delete: {
          url: 'api/zebra/config/delete',
        },
        validate: {},
      })
    },
    util: {},
    preCondition: {
      // calInfo: function (done) {
      //   servkit.ajax({
      //     url: "api/info/calcMachineInfo",
      //     type: 'GET',
      //     contentType: 'application/json',
      //   }, { success: function (data) { done(data) } })
      // }
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
      ['/js/plugin/bootstrap-datetimepicker/bootstrap-datetimepicker.min.js'],
    ],
  })
}
