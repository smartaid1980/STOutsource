import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      function createAndUpdateSend(tdEles) {
        return {
          is_close: (function () {
            return $(tdEles[6]).find('input:checked').length
          })(),
        }
      }

      var deletes

      servkit.crudtable({
        tableModel: 'com.servtech.servcloud.module.model.SysUser',
        tableSelector: '#stk-user-table',
        create: {
          url: 'api/user/create',
          send: createAndUpdateSend,
          end: {
            1: function (td) {
              var value = $(td).find('input').val()
              if (servtechConfig.ST_AUTO_BINDING_USER_DASHBOAED_GROUP) {
                // 自動綁定輪播看板
                servkit.ajax(
                  {
                    url: 'api/management/sysUserDashboardGroup/create',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({
                      user_id: value,
                    }),
                  },
                  {
                    success: function (data) {
                      console.log(data)
                    },
                  }
                )
              }
              return value
            },
          },
        },
        read: {
          url: 'api/user/read',
          end: {
            6: function (data) {
              return _.pluck(data, 'group_name')
            },
          },
        },
        update: {
          url: 'api/user/update',
          send: createAndUpdateSend,
        },
        delete: {
          url: 'api/user/delete',
          contentFunc: function (deleteIds) {
            deletes = deleteIds
            return deleteIds.join(', ') + ', ' + i18n('Sure_Delete_Data')
          },
          finalDo: function () {
            if (
              servtechConfig.ST_AUTO_BINDING_USER_DASHBOAED_GROUP &&
              deletes
            ) {
              // 自動綁定輪播看板
              servkit.ajax(
                {
                  url: 'api/management/sysUserDashboardGroup/delete',
                  type: 'DELETE',
                  contentType: 'application/json',
                  data: JSON.stringify([deletes]),
                },
                {
                  success: function () {},
                }
              )
            }
          },
        },
        validate: {
          1: function (td, table) {
            var input = td.querySelector('input')
            if (input.value === '') {
              return `${i18n('Stk_Required')}`
            } else if (
              !input.value.startsWith('@st@') &&
              input.value.indexOf('@') !== -1
            ) {
              // 超級管理員自己要可以改
              return `${i18n('No_@')}`
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
            if (input.value.length > 20) {
              return `${i18n('Max_Length_20')}`
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
