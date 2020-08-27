export default function () {
  GoGoAppFun({
    gogo: function () {
      servkit.crudtable({
        tableSelector: '#sender-table',
        tableModel: 'com.servtech.servcloud.app.model.storage.Sender',
        create: {
          unavailable: true,
        },
        read: {
          url: 'api/stdcrud',
          end: {
            4: function (data) {
              if (data === 'Y') {
                return '<span class="label label-success">ON</span>'
              } else {
                return '<span class="label label-default">OFF</span>'
              }
            },
          },
        },
        update: {
          url: 'api/stdcrud',
          end: {
            4: function (td) {
              if ($(td).find(':checkbox').prop('checked')) {
                return '<span class="label label-success">ON</span>'
              } else {
                return '<span class="label label-default">OFF</span>'
              }
            },
          },
        },
        delete: {
          unavailable: true,
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
