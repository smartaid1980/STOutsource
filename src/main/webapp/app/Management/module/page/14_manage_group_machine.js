import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      servkit.crudtable({
        tableSelector: '#stk-group-table',
        create: {
          unavailable: true,
        },
        read: {
          url: 'api/sysgroupmachine/read',
          end: {
            3: function (data) {
              return _.map(data, function (ele) {
                return servkit.getMachineName(ele.machine_id)
              })
            },
          },
        },
        update: {
          url: 'api/sysgroupmachine/update',
        },
        delete: {
          unavailable: true,
        },
        validate: {
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
