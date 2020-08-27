export default function () {
  GoGoAppFun({
    gogo: function (context) {
      servkit.crudtable({
        tableSelector: '#sending-setting',
        tableModel: 'com.servtech.servcloud.app.model.cosmos.MailServer',
        order: [[0, 'asc']],
        create: {
          url: 'api/stdcrud',
          finalDo() {
            // 只能設定一個 mail server
            $('.stk-insert-btn').addClass('hide')
          },
        },
        read: {
          url: 'api/stdcrud',
          end: {
            2(data) {
              // 只能設定一個 mail server
              $('.stk-insert-btn').addClass('hide')
              return data
            },
          },
        },
        update: {
          url: 'api/stdcrud',
        },
        delete: {
          url: 'api/stdcrud',
          finalDo() {
            $('.stk-insert-btn').removeClass('hide')
          },
        },
        validate: {
          1(td) {
            let ip = $(td).find('input').val()
            let reg_IP = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/
            let reg_DN = /^((?:(?:(?:\w[.\-+]?)*)\w)+)((?:(?:(?:\w[.\-+]?){0,62})\w)+)\.(\w{2,6})$/
            if (!reg_IP.test(ip) && !reg_DN.test(ip)) {
              return `Invalid IP format.`
            }
          },
          2(td) {
            let port = $(td).find('input').val()
            let reg = /^([0-9]{1,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/
            if (!reg.test(port)) {
              return `Invalid port format.`
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
