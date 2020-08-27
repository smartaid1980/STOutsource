export default function () {
  GoGoAppFun({
    gogo: function (context) {
      var loningUser = JSON.parse(window.sessionStorage.loginInfo).user_id

      servkit.crudtable({
        tableSelector: '#stk-table',
        create: {
          url: 'api/downtimeCode/create',
          end: {
            3: function (data) {
              return loningUser
            },
            4: function (data) {
              return moment(data).format('YYYY/MM/DD HH:mm:ss')
            },
            5: function (data) {
              return ''
            },
            6: function (data) {
              return ''
            },
          },
        },
        read: {
          url: 'api/downtimeCode/read',
          end: {
            4: function (data) {
              return moment(data).format('YYYY/MM/DD HH:mm:ss')
            },
            5: function (data) {
              return data || ''
            },
            6: function (data) {
              return data ? moment(data).format('YYYY/MM/DD HH:mm:ss') : ''
            },
          },
        },
        update: {
          url: 'api/downtimeCode/update',
          end: {
            5: function (data) {
              return loningUser
            },
            6: function (data) {
              return moment(data).format('YYYY/MM/DD HH:mm:ss')
            },
          },
        },
        delete: {
          url: 'api/downtimeCode/delete',
        },
        validate: {
          1: function (td, table) {
            var input = td.querySelector('input')
            if (input.value === '') {
              return '故障代碼必填'
            }

            if (!input.disabled) {
              if (
                _.find(table.columns(0).data().eq(0), function (existId) {
                  return existId.toLowerCase() === input.value.toLowerCase()
                })
              ) {
                return '故障代碼不可重複'
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
        '/js/plugin/datatables/jquery.dataTables.rowReordering.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
    ],
  })
}
