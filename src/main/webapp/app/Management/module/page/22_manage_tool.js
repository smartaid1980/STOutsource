import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function () {
      function createAndUpdateSend(tdEles) {
        return {
          is_enable: (function () {
            if ($(tdEles[5]).find('input:checked').length) {
              return 1
            } else {
              return 0
            }
          })(),
        }
      }

      var createAndUpdateEnd = {
        3: function (td) {
          return td.querySelector('select').value
            ? td.querySelector('select').options[
                td.querySelector('select').selectedIndex
              ].innerHTML
            : ''
        },
        6: function (td) {
          if ($(td).find('input:checked').length) {
            return '<span class="label label-success" style="cursor:pointer">ON</span>'
          } else {
            return '<span class="label label-default" style="cursor:pointer">OFF</span>'
          }
        },
      }
      servkit.crudtable({
        tableSelector: '#stk-tool-table',
        create: {
          url: 'api/systool/create',
          send: createAndUpdateSend,
          end: createAndUpdateEnd,
        },
        read: {
          url: 'api/systool/read',
          end: {
            3: function (data) {
              if (data) {
                return servkit.getMachineName(data)
              } else {
                return ''
              }
            },
            6: function (data) {
              if (data === 1) {
                return '<span class="label label-success" style="cursor:pointer">ON</span>'
              } else {
                return '<span class="label label-default" style="cursor:pointer">OFF</span>'
              }
            },
          },
        },
        update: {
          url: 'api/systool/update',
          start: {
            6: function (oldTd, newTd) {
              if (oldTd.textContent.indexOf('ON') !== -1) {
                newTd.querySelector('input').checked = true
              } else {
                newTd.querySelector('input').checked = false
              }
            },
          },
          send: createAndUpdateSend,
          end: createAndUpdateEnd,
        },
        delete: {
          url: 'api/systool/delete',
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
          4: function (td, table) {
            var input = td.querySelector('input')
            if (
              _.find(
                _.zip(
                  table.columns(2).data().eq(0),
                  table.columns(3).data().eq(0)
                ),
                function (existId, index) {
                  var sameToolSlot = input.value
                    ? existId[1] === input.value
                    : false
                  var sameDevice = $('[name=device_id]').val()
                    ? existId[0] === $('[name=device_id]').val()
                    : false
                  var sameTool =
                    table.columns(0).data().eq(0)[index] ===
                    $('[name=tool_id]').val()
                  return sameToolSlot && sameDevice && !sameTool
                }
              )
            ) {
              return `${i18n('Stk_Device_Slot')}`
            }
          },
        },
      })
    },
    delayCondition: ['machineList'],
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
