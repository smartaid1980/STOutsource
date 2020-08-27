export default function () {
  GoGoAppFun({
    gogo: function gogo(context) {
      servkit.crudtable({
        tableModel: 'com.servtech.servcloud.app.model.strongLED.MaterialList',
        tableSelector: '#material-list',
        create: {
          url: 'api/stdcrud',
          end: {},
        },
        read: {
          url: 'api/stdcrud',
          end: {},
        },
        update: {
          url: 'api/stdcrud',
          end: {},
        },
        delete: {
          url: 'api/stdcrud',
        },
        // validate: {
        //   1: function (td, table) {
        //     var input = td.querySelector('input')
        //     if (input.value === '') {
        //       return '維修類型代碼必填'
        //     }

        //     if (!input.disabled) {
        //       if (_.find(table.columns(0).data().eq(0), function (existId) {
        //         return existId.toLowerCase() === input.value.toLowerCase()
        //       })) {
        //         return '維修類型代碼不可重複'
        //       }
        //     }
        //   }
        // }
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
