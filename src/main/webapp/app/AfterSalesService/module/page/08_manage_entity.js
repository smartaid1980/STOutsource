import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.initEntityTable()

      // $('#stk-entity-type-table tbody').css("cursor", "pointer");

      $('#stk-entity-type-table tbody').on(
        'click',
        '[name=detail-btn]',
        function (evt) {
          evt.preventDefault()
          var entityID = $(this).parent().parent().find('td').eq(1).text()
          context.selEntityBreakdown(entityID, context.entityBreakdownDrawTable)
        }
      )
    },
    util: {
      initEntityTable: function () {
        function extractUserGroupText(select) {
          var result = _.reduce(
            select.options,
            function (result, option) {
              if (option.selected) {
                result.push(option.textContent)
              }
              return result
            },
            []
          )

          return result
        }

        function userHtml(userNames) {
          var html = '<div>'
          html += _.map(userNames, function (userName) {
            return (
              '<span class="label label-primary" style="cursor:pointer;display:inline-block;float:left;margin:5px 5px 0;"><i class="fa fa-tag"></i>&nbsp;' +
              userName +
              '</span>'
            )
          }).join('')
          html += '</div>'
          html += '<div style="clear:both;height:20px"></div>'
          html += '</div>'
          return html
        }
        var usergroupData
        var usergroupHtml
        servkit.ajax(
          {
            url: servkit.rootPath + '/api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'm_sys_user',
              columns: ['user_id', 'user_name'],
            }),
          },
          {
            success: function (data) {
              var result = {}
              _.map(data, function (data) {
                result[data.user_id] = data.user_name
              })
              usergroupData = result
            },
            fail: function (data) {
              console.log(data)
            },
          }
        )

        servkit
          .politeCheck()
          .until(function () {
            return usergroupData
          })
          .thenDo(function () {
            var usergroupSelectHtml = ''
            _.each(_.keys(usergroupData).sort(), function (key) {
              usergroupSelectHtml +=
                '<option value="' +
                key +
                '" >' +
                usergroupData[key] +
                '</option>'
            })
            usergroupHtml = usergroupSelectHtml
          })
          .tryDuration(0)
          .start()

        servkit
          .politeCheck()
          .until(function () {
            return usergroupHtml
          })
          .thenDo(function () {
            return usergroupHtml
          })
          .tryDuration(0)
          .start()

        servkit.crudtable({
          tableSelector: '#stk-entity-type-table',
          create: {
            url: 'api/aftersalesservice/entity/create',
            start: function (tdEles) {
              $(
                tdEles
              )[3].innerHTML = `<button disabled="disabled" class="btn btn-primary" name="detail-btn">${i18n(
                'Manage_Entity_List'
              )}</button>`
              $('[name=user_group]')[0].innerHTML = usergroupHtml
              pageSetUp() // for select2
            },
            end: {
              3: function (td) {
                var select = td.querySelector('select')
                var result = extractUserGroupText(select)
                var html = ''
                html += userHtml(result)
                return html
              },
              4: function (td) {
                var buttonHtml = `<button  class="btn btn-primary" name="detail-btn">${i18n(
                  'Manage_Entity_List'
                )}</button>`
                return buttonHtml
              },
            },
          },
          read: {
            url: 'api/aftersalesservice/entity/read',
            end: {
              4: function (td) {
                var buttonHtml = `<button class="btn btn-primary" name="detail-btn">${i18n(
                  'Manage_Entity_List'
                )}</button>`
                return buttonHtml
              },
            },
          },
          update: {
            url: 'api/aftersalesservice/entity/update',

            start: {
              3: function (oldTd, newTd) {
                $('[name=user_group]')[0].innerHTML = usergroupHtml
                var oldTdLength = $(oldTd).find('span').length
                for (var i = 0; i < oldTdLength; i++) {
                  var user = $(oldTd)
                    .find('span')
                    .eq(i)
                    .text()
                    .replace(/\s+/g, '')
                  $('[name=user_group] option:contains(' + user + ')').prop(
                    'selected',
                    true
                  )
                }
                pageSetUp()
              },
            },
            end: {
              3: function (td) {
                var select = td.querySelector('select')
                var result = extractUserGroupText(select)
                var html = ''
                html += userHtml(result)
                return html
              },
              4: function (td) {
                return `<button class="btn btn-primary" name="detail-btn">${i18n(
                  'Manage_Entity_List'
                )}</button>`
              },
            },
          },
          delete: {
            url: 'api/aftersalesservice/entity/delete',
          },
          excel: {
            url: '/api/aftersalesservice/entity/excel',
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
            3: function (td) {
              if (td.querySelector('select').value === '') {
                return `${i18n('Stk_Required')}`
              }
            },
          },
        })
      },
      selEntityBreakdown: function (entityID, callback) {
        var that = this
        var entityBreakdown
        var dataTitleHtml =
          '<tr>' +
          '<th data-class="expand">問題類別</th>' +
          '<th>細項代碼</th>' +
          '<th>問題細項</th>' +
          '</tr>'

        servkit.ajax(
          {
            url: servkit.rootPath + '/api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_aftersalesservice_entity_breakdown',
              columns: ['breakdown_id', 'entity_id', 'breakdown_name'],
            }),
          },
          {
            success: function (data) {
              var result = {}
              var result2 = []
              _.map(data, function (data) {
                if (data.entity_id === entityID) {
                  result2.push(data.entity_id)
                  result2.push(data.breakdown_name)
                  result[data.breakdown_id] = result2
                }
              })
              entityBreakdown = result
            },
            fail: function (data) {
              console.log(data)
            },
          }
        )

        servkit
          .politeCheck()
          .until(function () {
            return entityBreakdown
          })
          .thenDo(function () {
            var databodyHtml = ''

            _.map(_.keys(entityBreakdown).sort(), function (data) {
              databodyHtml +=
                '<tr>' +
                '<td>' +
                data +
                '</td>' +
                '<td>' +
                entityBreakdown[data][0] +
                '</td>' +
                '<td>' +
                entityBreakdown[data][1] +
                '</td>' +
                '</tr>'
            })
            callback.apply(that, [dataTitleHtml, databodyHtml])
          })
          .tryDuration(0)
          .start()
      },
      entityBreakdownDrawTable: function (datatitle, databody) {
        var html = '<tbody>'
        html += datatitle
        html += databody
        html += '</tbody>'
        $('#entity-result-table')[0].innerHTML = html
        $('#entity-result').modal()
      },
    },
    dependencies: [
      [
        '/js/plugin/flot/jquery.flot.cust.min.js',
        '/js/plugin/flot/jquery.flot.resize.min.js',
        '/js/plugin/flot/jquery.flot.fillbetween.min.js',
        '/js/plugin/flot/jquery.flot.orderBar.min.js',
        '/js/plugin/flot/jquery.flot.pie.min.js',
        '/js/plugin/flot/jquery.flot.tooltip.min.js',
        '/js/plugin/flot/jquery.flot.axislabels.js',
      ],
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
      ['/js/plugin/select2/select2.min.js'],
    ],
  })
}
