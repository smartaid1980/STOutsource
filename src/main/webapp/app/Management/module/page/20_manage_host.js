import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      servkit.crudtable({
        tableSelector: '#stk-host-table',
        create: {
          unavailable: true,
        },
        read: {
          url: 'api/tank/master/host/get',
        },
        update: {
          url: 'api/tank/master/host/update',
        },
        delete: {
          unavailable: true,
        },
        validate: {
          1: function (td, table) {
            if (td.querySelector('input').value === '') {
              return `${i18n('Stk_Required')}`
            }
          },
          2: function (td) {
            if (td.querySelector('input').value === '') {
              return `${i18n('Stk_Required')}`
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
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
    ],
  })
}
