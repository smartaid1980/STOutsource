export default function () {
  GoGoAppFun({
    gogo: function (context) {
      servkit.initSelectWithList(context.preCon.getApp, $('#app'))
      servkit.crudtable({
        tableSelector: '#stk-func-table',
        tableModel: 'com.servtech.servcloud.module.model.SysFunc',
        hideCols: [2],
        create: {
          url: 'api/formeditor/func/create',
          send: function (tdEles) {
            return {
              app_id: () => $('#app').val()(),
              func_name: () => $(tdEles[1]).val()(),
              user_id: () =>
                JSON.parse(window.window.sessionStorage.loginInfo).user_id(),
            }
          },
        },
        read: {
          url: 'api/formeditor/func/read?app_id=' + $('#app').val(),
        },
        update: {
          url: 'api/stdcrud',
          start: {
            2(oldTd, newTd) {
              newTd.setAttribute('disable', 'disabled')
            },
          },
          send(tdEles) {
            return {
              app_id: () => $('#app').val()(),
              func_name: () => $(tdEles[1]).val()(),
            }
          },
        },
        delete: {
          unavailable: true,
        },
        validate: {
          1: function (td, table) {
            let input = td.querySelector('input')
            if (input.value === '') {
              return '此欄位必填'
            } else if (!input.disabled) {
              if (
                _.find(table.columns(0).data().eq(0), function (existId) {
                  return existId === input.value
                })
              ) {
                return '索引欄位，不得重複'
              }
            }
          },
          3: function (td) {
            let input = td.querySelector('input')
            if (input.value === '') {
              return '此欄位必填'
            }
          },
        },
      })
      $('#app').on('change', function (evt) {
        evt.preventDefault()
        $('#stk-func-table').data('crudTableConfig').read.url =
          'api/formeditor/func/read?app_id=' + $('#app').val()
        $('#stk-func-table')
          .closest('div')
          .find('.stk-refresh-btn')
          .trigger('click')
      })
    },
    preCondition: {
      getApp: function (done) {
        servkit.ajax(
          {
            url: 'api/formeditor/app/read',
            type: 'GET',
          },
          {
            success: function (data) {
              var appData = {}
              _.each(data, function (elem) {
                appData[elem.app_id] = elem.app_name
              })
              done(appData)
            },
          }
        )
      },
    },
    dependencies: [
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
      ['/js/plugin/dropzone/dropzone.min.js'],
    ],
  })
}
