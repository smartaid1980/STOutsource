import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      var createAndUpdateSend = function (tdEles) {
        var select = tdEles[2].querySelector('select')
        var appDashboardMap = context.selectToAppDashboardMap(select)
        return {
          sys_dashboards: _.mapObject(appDashboardMap, function (
            dashboardObjs
          ) {
            return _.pluck(dashboardObjs, 'dashboard_id')
          }),
        }
      }

      var createAnUpdateEnd3 = function (td) {
        var select = td.querySelector('select')
        var result = context.selectToAppDashboardMap(select)
        var html = []
        console.log(result)
        _.each(result, function (dashboardObjs) {
          if (dashboardObjs.length) {
            html.push(context.appDashboardsHtml(dashboardObjs))
          }
        })
        return html.join('')
      }

      servkit.crudtable({
        tableSelector: '#stk-dashboard-auth-table',
        inputTemplate: {
          handler: function (select, data) {
            var html = _.map(data, function (app) {
              if (app.dashboards.length) {
                var optGroup =
                  '<option style="font-weight:bold;" data-app="true" value="' +
                  app.id +
                  '">'
                optGroup += ' - ' + app.name + ' - '
                optGroup += '</option>'
                _.each(app.dashboards, function (dashboard) {
                  optGroup +=
                    '<option style="padding-left:20px;" value="' +
                    dashboard.id +
                    '">'
                  optGroup +=
                    dashboard.name.indexOf('i18n_ServCloud') >= 0
                      ? i18n(dashboard.name.replace('i18n_ServCloud_', ''))
                      : dashboard.name
                  optGroup += '</option>'
                })
                optGroup += '<option></option>'
              }
              return optGroup
            }).join('')
            $(select).html(html)
            servkit.multiselectHeightOptimization(select)
          },
        },
        create: {
          url: 'api/sysDashboardAuth/create',
          send: createAndUpdateSend,
          end: {
            3: createAnUpdateEnd3,
          },
        },
        update: {
          url: 'api/sysDashboardAuth/update',
          start: {
            3: function (oldTd, newTd) {
              // label to appFunMap
              var appDashboardMap = {}
              _.each($(oldTd).find('.label'), function (label) {
                if (label.hasAttribute('data-app-id')) {
                  appDashboardMap.lastAppId = label.getAttribute('data-app-id')
                  appDashboardMap[appDashboardMap.lastAppId] = []
                } else if (label.hasAttribute('data-dashboard-id')) {
                  appDashboardMap[appDashboardMap.lastAppId].push(
                    label.getAttribute('data-dashboard-id')
                  )
                }
              })
              delete appDashboardMap.lastAppId

              // appFunMap to select
              var lastAppId = ''
              _.each($(newTd).find('option'), function (option) {
                if (option.hasAttribute('data-app')) {
                  lastAppId = option.value
                } else if (
                  _.indexOf(appDashboardMap[lastAppId], option.value) != -1
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
          url: 'api/sysDashboardAuth/read',
          end: {
            3: function (data) {
              return _.chain(data)
                .groupBy('app_id')
                .mapObject(function (dashboardObjs) {
                  return context.appDashboardsHtml(dashboardObjs)
                })
                .values()
                .value()
                .join('')
            },
          },
        },
        delete: {
          url: 'api/sysDashboardAuth/delete',
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
    util: {
      appDashboardsHtml: function (dashboardObjs) {
        console.log(dashboardObjs)
        var appName = dashboardObjs[0].app_name
        var appId = dashboardObjs[0].app_id
        var html = []
        var dashboards = _.map(dashboardObjs, function (dashboardObj) {
          return (
            '<span class="label label-primary" data-dashboard-id="' +
            dashboardObj.dashboard_id +
            '"><i class="fa fa-tag"></i>&nbsp;' +
            (dashboardObj.dashboard_name.indexOf('i18n_ServCloud') >= 0
              ? i18n(dashboardObj.dashboard_name.replace('i18n_ServCloud_', ''))
              : dashboardObj.dashboard_name) +
            '</span>'
          )
        })

        html.push('<div>')
        html.push('<div>')
        html.push(
          '<span class="label bg-color-darken txt-color-white" data-app-id="' +
            appId +
            '"><i class="fa fa-tags"></i>&nbsp;'
        )
        html.push(appName)
        html.push('</span>')
        html.push('</div>')
        html.push('<div>')
        html.push(dashboards.join(''))
        html.push('</div>')
        html.push('<div style="clear:both;height:20px"></div>')
        html.push('</div>')
        return html.join('')
      },
      selectToAppDashboardMap: function (select) {
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
                  dashboard_id: option.value,
                  dashboard_name: option.textContent,
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
