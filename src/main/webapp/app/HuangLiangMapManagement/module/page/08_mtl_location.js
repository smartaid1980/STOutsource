export default function () {
  GoGoAppFun({
    gogo: function () {
      servkit.crudtable({
        tableModel:
          'com.servtech.servcloud.app.model.huangliang_matStock.MatLocation',
        tableSelector: '#stk-table',
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
            var inputLocation = td.querySelector('input'),
              inputArea = $(td).next().find('input')[0],
              existArea = table.columns(1).data().eq(0),
              existLocation = table.columns(0).data().eq(0)

            if (inputLocation.value === '') {
              return '位置名稱必填'
            }
          },
          2: function (td, table) {
            var inputArea = td.querySelector('input'),
              inputLocation = $(td).prev().find('input')[0],
              existArea = table.columns(1).data().eq(0),
              existLocation = table.columns(0).data().eq(0)

            if (inputArea.value === '') {
              return '區域代碼必填'
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
        '/js/plugin/datatables/jquery.dataTables.rowReordering.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
    ],
  })
}
