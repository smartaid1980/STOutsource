import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      function createAndUpdateSend(tdEles) {
        return {
          cnc_id: (function () {
            return $(tdEles[0]).find('select').val()
          })(),
          machine_type_id: (function () {
            return $(tdEles[1]).find('select').val()
          })(),
        }
      }

      var createAndUpdateEnd = {
        1: function (td, data) {
          return `<div><span class="label label-primary" style="float:left;margin:5px;"><i class="fa fa-tag"></i>&nbsp;${servkit.getBrandName(
            data.cnc_brand
          )}</span></div>`
        },
        2: function (td, data) {
          return `<div><span class="label label-primary" style="float:left;margin:5px;"><i class="fa fa-tag"></i>&nbsp;${
            ctx.preCon.machineTypeMap[data.machine_type]
          }</span></div>`
        },
      }

      initCrudtable()

      function initCrudtable() {
        var crudOption = {
          tableModel: 'com.servtech.servcloud.module.model.Alarm',
          tableSelector: '#stk-machine-name-table',
          create: {
            url: 'api/alarm/create',
            send: createAndUpdateSend,
            start: function (newTr) {
              // 預設都選'OTHER'
              $(newTr[0]).find('option[value="OTHER"]').prop('selected', true)
              $(newTr[1]).find('option[value="OTHER"]').prop('selected', true)
            },
            end: createAndUpdateEnd,
            fail: function (data) {
              if (data.indexOf('Duplicate') > -1) {
                return `${i18n('ID_Already_Exists')}`
              } else {
                return `${i18n('Exception_Msg')}`
              }
            },
          },
          read: {
            url: 'api/alarm/read',
            end: {
              1: function (data) {
                return [data.name]
              },
              2: function (data) {
                return [data.type_name]
              },
              5: function (data) {
                if (data === undefined) {
                  return ''
                } else {
                  return data
                }
              },
            },
          },
          update: {
            url: 'api/alarm/update',
            send: createAndUpdateSend,
            end: createAndUpdateEnd,
            fail: function (data) {
              return data
            },
          },
          delete: {
            url: 'api/alarm/delete',
            fail: function (data) {
              if (data.indexOf('FOREIGN KEY') > -1) {
                return '有其他table引用到此筆資料，所以無法進行刪除的動作'
              } else {
                return '例外錯誤，請聯絡系統管理員'
              }
            },
          },
          validate: {
            3: function (td, table) {
              var input = td.querySelector('input')
              if (input.value === '') {
                return `${i18n('Stk_Required')}`
              }
            },
          },
        }

        if (JSON.parse(sessionStorage.loginInfo).user_id.indexOf('@') >= 0) {
          crudOption.create = {
            url: 'api/alarm/create',
            send: createAndUpdateSend,
            start: function (newTr) {
              // 預設都選'OTHER'
              $(newTr[0]).find('option[value="OTHER"]').prop('selected', true)
              $(newTr[1]).find('option[value="OTHER"]').prop('selected', true)
            },
            end: createAndUpdateEnd,
            fail: function (data) {
              if (data.indexOf('Duplicate') > -1) {
                return `${i18n('ID_Already_Exists')}`
              } else {
                return `${i18n('Exception_Msg')}`
              }
            },
          }
          crudOption['delete'] = {
            url: 'api/alarm/delete',
            fail: function (data) {
              if (data.indexOf('FOREIGN KEY') > -1) {
                return `${i18n('Delete_FK_Error_Msg')}`
              } else {
                return `${i18n('Exception_Msg')}`
              }
            },
          }
        }
        servkit.crudtable(crudOption)
      }
    },
    preCondition: {
      machineTypeMap(done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'm_machine_type',
              columns: ['machine_type_id', 'type_name'],
            }),
          },
          {
            success: function (data) {
              done(
                _.reduce(
                  data,
                  (memo, elem) => {
                    memo[elem.machine_type_id] = elem.type_name
                    return memo
                  },
                  {}
                )
              )
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
    ],
  })
}
