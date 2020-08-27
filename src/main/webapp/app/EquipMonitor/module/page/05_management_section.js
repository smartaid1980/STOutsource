export default function () {
  GoGoAppFun({
    gogo: function (context) {
      servkit.crudtable({
        tableSelector: '#stk-section-table',
        create: {
          url: 'api/section/create',
        },
        read: {
          url: 'api/section/read',
          end: {
            3: function (data) {
              return _.map(data, function (ele) {
                return servkit.getMachineName(ele.device_id)
              })
            },
          },
        },
        update: {
          url: 'api/section/update',
        },
        delete: {
          url: 'api/section/delete',
        },
      })
    },
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
