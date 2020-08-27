import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.initRepairTable()
    },
    util: {
      initRepairTable: function () {
        servkit.crudtable({
          tableSelector: '#stk-product-table',
          create: {
            url: 'api/aftersalesservice/repairassign/create',
          },
          read: {
            url: 'api/aftersalesservice/repairassign/read',
          },
          update: {
            url: 'api/aftersalesservice/repairassign/update',
          },
          delete: {
            url: 'api/aftersalesservice/repairassign/delete',
          },
          excel: {
            url: '/api/aftersalesservice/repairassign/excel',
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
    },
    dependencies: [
      [
        '/js/plugin/flot/jquery.flot.cust.min.js',
        '/js/plugin/flot/jquery.flot.resize.min.js',
        '/js/plugin/flot/jquery.flot.fillbetween.min.js',
        '/js/plugin/flot/jquery.flot.orderBar.min.js',
        '/js/plugin/flot/jquery.flot.pie.min.js',
        '/js/plugin/flot/jquery.flot.tooltip.min.js',
        '/js/plugin/flot/jquery.flot.axislabels.js',
      ],
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
