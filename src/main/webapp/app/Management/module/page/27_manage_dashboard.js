import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      servkit.crudtable({
        tableModel: 'com.servtech.servcloud.module.model.SysDashboard',
        tableSelector: '#manage-dashboard-table',
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
        validate: {
          1: function (td, table) {
            var input = td.querySelector('input')
            if (input.value === '') {
              return `${i18n('Stk_Required')}`
            }

            // if (!input.disabled) {
            //   if (_.find(table.columns(0).data().eq(0), function (existId) {
            //     return existId.toLowerCase() === input.value.toLowerCase()
            //   })) {
            //     return `${i18n('Stk_Pk')}`
            //   }
            // }
          },
          2: function (td) {
            if (td.querySelector('input').value === '') {
              return `${i18n('Stk_Required')}`
            }
          },
          3: function (td, table) {
            var input = td.querySelector('select')
            if (
              _.find(
                _.zip(
                  table.columns(0).data().eq(0),
                  table.columns(2).data().eq(0)
                ),
                function (existId) {
                  return (
                    existId[0].toLowerCase() ===
                      $('[name=dashboard_id]').val().toLowerCase() &&
                    existId[1].toLowerCase() ===
                      $(input).find('option:selected').text().toLowerCase()
                  )
                }
              )
            ) {
              return `${i18n('Stk_Pk')}`
            }
          },
        },
      })
    },
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
