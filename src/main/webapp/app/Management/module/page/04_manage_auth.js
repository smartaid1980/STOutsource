import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      function appFuncsHtml(funcObjs) {
        var appName = funcObjs[0].app_name
        var appId = funcObjs[0].app_id

        var html = '<div>'
        html += '<div>'
        html +=
          '<span class="label bg-color-darken txt-color-white" data-app-id="' +
          appId +
          '" style="cursor:pointer;"><i class="fa fa-tags"></i>&nbsp;'
        html += appName
        html += '</span>'
        html += '</div>'
        html += '<div>'
        html += _.map(funcObjs, function (funcObj) {
          return (
            '<span class="label label-primary" data-func-id="' +
            funcObj.func_id +
            '" style="cursor:pointer;display:inline-block;float:left;margin:5px 5px 0;"><i class="fa fa-tag"></i>&nbsp;' +
            funcObj.func_name +
            '</span>'
          )
        }).join('')
        html += '</div>'
        html += '<div style="clear:both;height:20px"></div>'
        html += '</div>'
        return html
      }

      function selectToAppFuncMap(select) {
        var result = _.reduce(
          select.options,
          function (result, option) {
            if (option.getAttribute('data-app')) {
              result[option.value] = []
              result.lastAppId = option.value
              result.lastAppName = option.textContent.substring(
                3,
                option.textContent.length - 3
              )
            } else {
              if (option.selected && option.value != '') {
                result[result.lastAppId].push({
                  app_id: result.lastAppId,
                  app_name: result.lastAppName,
                  func_id: option.value,
                  func_name: option.textContent,
                })
              }
            }
            return result
          },
          {}
        )
        delete result.lastAppId
        delete result.lastAppName
        return result
      }

      var createAndUpdateSend = function (tdEles) {
        var select = tdEles[2].querySelector('select')
        var appFuncMap = selectToAppFuncMap(select)
        return {
          sys_funcs: _.mapObject(appFuncMap, function (funcObjs, appId) {
            return _.pluck(funcObjs, 'func_id')
          }),
        }
      }

      var createAnUpdateEnd3 = function (td) {
        var select = td.querySelector('select')
        var result = selectToAppFuncMap(select)
        var html = []
        _.each(result, function (funcObjs, appId) {
          if (funcObjs.length) {
            html.push(appFuncsHtml(funcObjs))
          }
        })
        return html.join('')
      }

      servkit.crudtable({
        tableSelector: '#stk-auth-table',
        inputTemplate: {
          handler: function (select, data) {
            var html = _.map(data, function (app) {
              var optGroup =
                '<option style="font-weight:bold;" data-app="true" value="' +
                app.id +
                '">'
              optGroup += ' - ' + app.name + ' - '
              optGroup += '</option>'
              _.each(app.funcs, function (func) {
                optGroup +=
                  '<option style="padding-left:20px;" value="' + func.id + '">'
                optGroup += func.name
                optGroup += '</option>'
              })
              optGroup += '<option></option>'
              return optGroup
            }).join('')
            $(select).html(html)
            servkit.multiselectHeightOptimization(select)
          },
        },
        create: {
          url: 'api/sysauth/create',
          send: createAndUpdateSend,
          end: {
            3: createAnUpdateEnd3,
          },
        },
        update: {
          url: 'api/sysauth/update',
          start: {
            3: function (oldTd, newTd, oldTr, newTr, table) {
              // label to appFunMap
              var appFuncMap = {}
              _.each($(oldTd).find('.label'), function (label) {
                if (label.hasAttribute('data-app-id')) {
                  appFuncMap.lastAppId = label.getAttribute('data-app-id')
                  appFuncMap[appFuncMap.lastAppId] = []
                } else if (label.hasAttribute('data-func-id')) {
                  appFuncMap[appFuncMap.lastAppId].push(
                    label.getAttribute('data-func-id')
                  )
                }
              })
              delete appFuncMap.lastAppId

              // appFunMap to select
              var lastAppId = ''
              _.each($(newTd).find('option'), function (option) {
                if (option.hasAttribute('data-app')) {
                  lastAppId = option.value
                } else if (
                  _.indexOf(appFuncMap[lastAppId], option.value) != -1
                ) {
                  option.selected = true
                }
              })
            },
          },
          send: createAndUpdateSend,
          end: {
            3: createAnUpdateEnd3,
          },
        },
        read: {
          url: 'api/sysauth/read',
          end: {
            3: function (data) {
              return _.chain(data)
                .groupBy('app_id')
                .mapObject(function (funcObjs, app_id) {
                  return appFuncsHtml(funcObjs)
                })
                .values()
                .value()
                .join('')
            },
          },
        },
        delete: {
          url: 'api/sysauth/delete',
        },
        validate: {
          1: function (td, table) {
            var input = td.querySelector('input')
            if (input.value === '') {
              return `${i18n('Stk_Required')}`
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
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
    ],
  })
}
