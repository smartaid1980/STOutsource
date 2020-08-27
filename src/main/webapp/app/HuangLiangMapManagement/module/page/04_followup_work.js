export default function () {
  GoGoAppFun({
    gogo: function (context) {
      var loginUser = JSON.parse(window.sessionStorage.loginInfo).user_id

      // 超easy crud api
      servkit.crudtable({
        tableModel: 'com.servtech.servcloud.app.model.huangliang.FollowupWork',
        tableSelector: '#stk-table',
        create: {
          url: 'api/stdcrud',
          end: {
            3: function (td) {
              return loginUser
            },
            4: function (td) {
              return moment().format('YYYY/MM/DD HH:mm:ss')
            },
            5: function (td) {
              return loginUser
            },
            6: function (td) {
              return moment().format('YYYY/MM/DD HH:mm:ss')
            },
          },
        },
        read: {
          url: 'api/stdcrud',
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
          url: 'api/stdcrud',
          end: {
            5: function (td) {
              return loginUser
            },
            6: function (td) {
              return moment().format('YYYY/MM/DD HH:mm:ss')
            },
          },
        },
        delete: {
          url: 'api/stdcrud',
        },
        validate: {
          1: function (td, table) {
            var input = td.querySelector('input')
            if (input.value === '') {
              return '後續工程代碼必填'
            }

            if (!input.disabled) {
              if (
                _.find(table.columns(0).data().eq(0), function (existId) {
                  return existId.toLowerCase() === input.value.toLowerCase()
                })
              ) {
                return '後續工程代碼不可重複'
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
