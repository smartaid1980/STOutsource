import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      if (ctx.preCon.authWithBindCount) {
        ctx.MAX_AUTH = ctx.preCon.authWithBindCount['maxAuth']
        ctx.MAX_BIND = ctx.preCon.authWithBindCount['maxBind']
        $('#detail-info').text(
          `${i18n('ServTrackManagement_000089')} : ` + ctx.MAX_AUTH
        )
      }
      if (ctx.preCon.licenseCheck) {
        var status = ctx.preCon.licenseCheck.active
        var msg
        var msgCode = ctx.preCon.licenseCheck.message_code
        if (msgCode === '208') {
          msg = `${i18n('ServTrackManagement_000208')}`
        } else if (msgCode === '209') {
          msg = `${i18n('ServTrackManagement_000209')}`
        } else if (msgCode === '210') {
          msg = `${i18n('ServTrackManagement_000210')}`
        }
        var smallParams
        if (status) {
          smallParams = {
            color: 'green',
            title: msg,
            icon: 'fa fa-check',
            timeout: 2000,
          }
          ctx.commons.smallBox(smallParams)
        } else {
          smallParams = {
            color: 'yellow',
            title: msg,
            icon: 'fa fa-check',
            timeout: 2000,
          }
          ctx.commons.smallBox(smallParams)
        }
      }

      function createAndUpdateSend(tdEles) {
        return {
          is_open: (function () {
            if ($(tdEles[2]).find('input:checked').length) {
              return 'Y'
            } else {
              return 'N'
            }
          })(),
        }
      }
      var createAndUpdateEnd = {
        3: function (td) {
          if ($(td).find('input:checked').length) {
            return '<span class="label label-success" style="cursor:pointer">ON</span>'
          } else {
            return '<span class="label label-default" style="cursor:pointer">OFF</span>'
          }
        },
      }

      servkit.crudtable({
        tableSelector: '#table',
        create: {
          // url: 'api/servtrack/managementline/create',
          // send: createAndUpdateSend,
          // end: createAndUpdateEnd
        },
        read: {
          url: 'api/servtrack/tableauthority/read',
          end: {
            3: function (data) {
              if (data === 'Y') {
                return '<span class="label label-success" style="cursor:pointer">ON</span>'
              } else {
                return '<span class="label label-default" style="cursor:pointer">OFF</span>'
              }
            },
          },
        },
        update: {
          url: 'api/servtrack/tableauthority/update',
          start: {
            3: function (oldTd, newTd) {
              if (oldTd.textContent.indexOf('ON') != 0) {
                newTd.querySelector('input').checked = false
              } else {
                newTd.querySelector('input').checked = true
              }
            },
          },
          send: createAndUpdateSend,
          end: createAndUpdateEnd,
        },
        delete: {
          unavailable: true,
          // url: 'api/managementline/delete'
        },
        validate: {
          2: function (td) {
            if (td.querySelector('input').value === '') {
              return `${i18n('ServTrackManagement_000090')}`
            }
          },
          3: function (td) {
            var key = $(td).prev().prev().find('input').get(0).value
            var val = td.querySelector('input').value
            if (val == 'on') {
              val = 'ON'
            } else {
              val = 'OFF'
            }
            var authCount = 0
            _.each($('#table').DataTable().data(), function (data) {
              if ($(data[2]).text() == 'ON') {
                authCount++
              }
              if (data[0] == key && $(data[2]).text() == val) {
                authCount--
              }
            })
            if (authCount >= ctx.MAX_AUTH) {
              return `${i18n('ServTrackManagement_000083')}`
            }
          },
        },
      })
      $('#table').closest('div').find('div > .stk-delete-btn').hide()
      $('#table').closest('div').find('div > .stk-insert-btn').hide()
    },
    util: {
      MAX_AUTH: 0,
      MAX_BIND: 0,
      AUTH_STATUS: {},
    },
    preCondition: {
      authWithBindCount: function (done) {
        servkit.ajax(
          {
            url: 'api/servtrack/tableauthority/getauthcount',
            type: 'GET',
          },
          {
            success: function (data) {
              done(data)
            },
          }
        )
      },
      licenseCheck: function (done) {
        servkit.ajax(
          {
            url: 'api/servtrack/tableauthority/getstatus',
            type: 'GET',
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
