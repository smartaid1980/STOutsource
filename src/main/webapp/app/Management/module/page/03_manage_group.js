import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      servkit.crudtable({
        tableSelector: '#stk-group-table',
        create: {
          url: 'api/sysgroup/create',
        },
        read: {
          url: 'api/sysgroup/read',
          end: {
            3: function (data) {
              return _.map(data, function (ele) {
                return ele.user_name
              })
            },
            4: function (data) {
              return _.map(data, function (ele) {
                return ele.auth_name
              })
            },
          },
        },
        update: {
          url: 'api/sysgroup/update',
        },
        delete: {
          url: 'api/sysgroup/delete',
        },
        validate: {
          1: function (td, table) {
            var input = td.querySelector('input')
            if (input.value === '') {
              return `${i18n('Stk_Required')}`
            }

            if (!input.disabled) {
              if (
                _.find(table.columns(0).data().eq(0), function (existId) {
                  return existId.toLowerCase() === input.value.toLowerCase()
                })
              ) {
                return `${i18n('Stk_Pk')}`
              }
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
