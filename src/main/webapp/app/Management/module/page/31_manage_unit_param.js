export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      servkit.crudtable({
        tableSelector: '#unit-param-table',
        tableModel: 'com.servtech.servcloud.module.model.UnitParam',
        centerColumn: [8],
        create: {
          url: 'api/stdcrud',
        },
        read: {
          url: 'api/stdcrud',
        },
        update: {
          url: 'api/stdcrud',
          start: {
            10: function (oldTd, newTd, oldTr, newTr, table) {
              // preload color
              var color = oldTd.textContent
              $(newTd).find('input').val(color)
            },
          },
        },
        delete: {
          url: 'api/stdcrud',
        },
        validate: {
          5: ctx.checkThreshold,
          6: ctx.checkThreshold,
        },
      })
    },
    util: {
      checkThreshold: function () {
        var $max = $('input[name=max]')
        var $min = $('input[name=min]')
        var max = $max.val()
        var min = $min.val()
        if (max !== '' && min !== '' && Number(max) < Number(min)) {
          return '上限不可低於下限'
        }
      },
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
