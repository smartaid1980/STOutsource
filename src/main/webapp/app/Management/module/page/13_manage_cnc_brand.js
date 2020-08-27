import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      servkit.crudtable({
        tableSelector: '#stk-cnc-brand-table',
        create: {
          url: 'api/cncbrand/create',
        },
        read: {
          url: 'api/cncbrand/read',
          end: {
            3: function (data) {
              console.log(
                _.map(data, function (ele) {
                  return ele.name
                })
              )
              return _.map(data, function (ele) {
                console.log(ele)
                return ele.name
              })
            },
          },
        },
        update: {
          url: 'api/cncbrand/update',
        },
        delete: {
          url: 'api/cncbrand/delete',
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
