import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      var deviceLightIdNameMap = {}
      var deviceLightNameIdMap = {}

      initdeviceLightMapAndCrudtable()

      function initdeviceLightMapAndCrudtable() {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'm_device_light',
              columns: ['light_id', 'light_name'],
            }),
          },
          {
            success: function (data) {
              _.each(data, function (ele) {
                deviceLightIdNameMap[ele.light_id] = ele.light_name
                deviceLightNameIdMap[ele.light_name] = ele.light_id
              })
              // console.log(deviceLightIdNameMap);
              initCrudtable()
            },
          }
        )
      }

      function createAndUpdateSend(tdEles) {
        return {
          is_real_data: (function () {
            if ($(tdEles[2]).find('input:checked').length) {
              return 1
            } else {
              return 0
            }
          })(),
        }
      }

      var createAndUpdateEnd = {
        3: function (td) {
          if ($(td).find('input:checked').length) {
            return '<span class="label label-success">ON</span>'
          } else {
            return '<span class="label label-default">OFF</span>'
          }
        },
        4: function (td) {
          // console.log(td.querySelector('select').value);
          var result = ''
          switch (td.querySelector('select').value) {
            case 'B':
            case '0':
              result = deviceLightIdNameMap['0']
              break
            case '11':
              result = deviceLightIdNameMap['11']
              break
            case '12':
              result = deviceLightIdNameMap['12']
              break
            case '13':
              result = deviceLightIdNameMap['13']
              break
            case '14':
              result = deviceLightIdNameMap['14']
              break
            default:
              result = ''
          }
          return result
        },
      }

      function initCrudtable() {
        var crudtableConfig = {
          tableSelector: '#stk-machine-name-table',
          create: {
            unavailable: true,
            send: createAndUpdateSend,
            end: createAndUpdateEnd,
          },
          read: {
            url: 'api/machine/read',
            end: {
              3: function (data) {
                if (data === 1) {
                  return '<span class="label label-success">ON</span>'
                } else {
                  return '<span class="label label-default">OFF</span>'
                }
              },
              4: function (data) {
                var result = ''
                switch (data) {
                  case 'B':
                  case '0':
                    result = deviceLightIdNameMap['0']
                    break
                  case '11':
                    result = deviceLightIdNameMap['11']
                    break
                  case '12':
                    result = deviceLightIdNameMap['12']
                    break
                  case '13':
                    result = deviceLightIdNameMap['13']
                    break
                  case '14':
                    result = deviceLightIdNameMap['14']
                    break
                  default:
                    result = ''
                }
                return result
              },
            },
          },
          update: {
            url: 'api/machine/update',
            start: {
              3: function (oldTd, newTd, oldTr, newTr, table) {
                if (oldTd.textContent.indexOf('ON') !== -1) {
                  newTd.querySelector('input').checked = true
                } else {
                  newTd.querySelector('input').checked = false
                }
              },
              4: function (oldTd, newTd, oldTr, newTr, table) {
                newTd.querySelector('select').value =
                  deviceLightNameIdMap[oldTd.textContent]
              },
            },
            send: createAndUpdateSend,
            end: createAndUpdateEnd,
          },
          delete: {
            unavailable: true,
          },
          validate: {
            2: function (td) {
              if (td.querySelector('input').value === '') {
                return `${i18n('Stk_Required')}`
              }
            },
          },
        }
        servkit.crudtable(crudtableConfig)
      }
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
