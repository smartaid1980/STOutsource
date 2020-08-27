export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      if (ctx.preCon.appFuncMap) {
        _.each(ctx.preCon.appFuncMap, function (data) {
          if (
            Object.prototype.hasOwnProperty.call(servkit.appMap, data.app_id) &&
            Object.prototype.hasOwnProperty.call(
              servkit.appMap[data.app_id],
              data.func_id
            )
          ) {
            ctx.funcIdName[data.func_id] =
              servkit.appMap[data.app_id][data.func_id]['func_name'] +
              ' | ' +
              data.func_id
          }
        })
      }
      if (servkit.appMap) {
        _.map(servkit.appMap, function (obj, key) {
          ctx.appSelectHtml +=
            '<option style="padding:3px 0 3px 3px;" value="' +
            key +
            '">' +
            _.filter(obj)[0]['app_name'] +
            '</option>'
        })
      }

      servkit.crudtable({
        tableSelector: '#element4',
        tableModel: 'com.servtech.servcloud.app.model.shzbg.AppFuncBrand',
        order: [[0, 'asc']],
        create: {
          url: 'api/stdcrud',
          start: function (newTr, table) {
            var groupAppFunc = _.groupBy(ctx.preCon.appFuncMap, 'app_id')

            $('[name="app_id')[0].innerHTML = ctx.appSelectHtml
            var appId = $('[name="app_id').find(':selected').val()
            ctx.innerFuncSelectHtml(appId, ctx.funcSelectHtml, groupAppFunc)

            $('[name="app_id').on('change', function (evt) {
              appId = $('[name="app_id').find(':selected').val()
              ctx.innerFuncSelectHtml(appId, ctx.funcSelectHtml, groupAppFunc)
            })

            $('[name="not_default_key')[0].innerHTML =
              ctx.innerDeviceFuncValueView
          },
          send(tdList) {
            const notDefaultKey = $(tdList[3])
              .find('[name=not_default_key]')
              .val()
            if (!notDefaultKey) {
              return {
                not_default_key: null,
              }
            }
            return {}
          },
        },
        read: {
          url: 'api/stdcrud',
          end: {
            1: function (data) {
              var result
              var filteredApp = _.filter(servkit.appMap[data])
              result = filteredApp[0]['app_name']
              return result
            },
            2: function (data) {
              return ctx.funcIdName[data]
            },
            4: function (data) {
              var result
              if (data == '') {
                result = '無設定'
              } else if (data == 'part_count') {
                result = '產出顯示---'
              } else if (data == 'cutting_millisecond') {
                result = '切削時間顯示---'
              } else if (data == 'cutting_millisecond,part_count') {
                result = '切削時間與產出顯示---'
              } else {
                result = '無設定'
              }
              return result
            },
          },
        },
        update: {
          unavailable: true,
        },
        delete: {
          url: 'api/stdcrud',
        },
      })
    },
    util: {
      funcSelectHtml: '',
      appSelectHtml: '',
      funcIdName: {},
      appMap: {},
      innerFuncSelectHtml: function (appId, funcSelectHtml, appFuncMap) {
        var ctx = this
        if (appFuncMap) {
          _.map(servkit.appMap[appId], function (obj, key) {
            funcSelectHtml +=
              '<option style="padding:3px 0 3px 3px;" value="' +
              key +
              '">' +
              obj['func_name'] +
              ' | ' +
              key +
              '</option>'
          })
          $('[name="func_id')[0].innerHTML = funcSelectHtml
          funcSelectHtml = ''
        }
      },
      innerDeviceFuncValueView:
        '<option style="padding:3px 0 3px 3px;" value="">無設定</option>' +
        '<option style="padding:3px 0 3px 3px;" value="part_count">產出顯示---</option>' +
        '<option style="padding:3px 0 3px 3px;" value="cutting_millisecond">切削時間顯示---</option>' +
        '<option style="padding:3px 0 3px 3px;" value="cutting_millisecond,part_count">切削時間與產出顯示---</option>',
    },
    preCondition: {
      appFuncMap: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'm_sys_func',
              columns: ['app_id', 'func_id', 'func_name'],
            }),
          },
          {
            success: function (data) {
              done(data)
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
