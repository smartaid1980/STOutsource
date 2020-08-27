export default function () {
  GoGoAppFun({
    gogo: function (context) {
      servkit.crudtable({
        tableSelector: '#idle-overtime',
        tableModel:
          'com.servtech.servcloud.app.model.iiot.IiotMachineAlarmFreq',
        order: [[0, 'asc']],
        create: {
          unavailable: true,
        },
        read: {
          url: 'api/stdcrud',
          whereClause: 'alarm_type = "2"',
        },
        update: {
          url: 'api/stdcrud',
        },
        delete: {
          unavailable: true,
        },
        validate: {
          1: function (td) {
            var input = td.querySelector('input').value
            var regPositiveInt = /^[1-9]\d*$/
            if (!regPositiveInt.test(input)) {
              return '必須正整數'
            }
          },
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
