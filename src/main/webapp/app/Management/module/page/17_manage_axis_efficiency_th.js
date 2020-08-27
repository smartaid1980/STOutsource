import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.initAxisEfficiencyTable()

      $('#stk-axis-efficiency-table tbody').on(
        'change',
        '[name="machine_id"]',
        function (evt) {
          evt.preventDefault()
          var key = $('[name=machine_id]').val()
          var value = context.preCon.queryMachine[key]
          $('[name=machine_name]').val(value)
        }
      )
    },
    util: {
      $machineId: $('[name=machine_id]'),
      $machineName: $('[name=machine_name]'),
      initAxisEfficiencyTable: function () {
        var that = this

        function createAndUpdateSend(tdEles) {
          return {
            machine_id: (function () {
              var machineId = $(tdEles[0]).find(':selected').val()
              return machineId
            })(),
          }
        }

        var createAndUpdateEnd = {
          1: function (td) {
            var machineId = $(td).find(':selected').val()
            return machineId
          },
        }

        servkit.crudtable({
          tableSelector: '#stk-axis-efficiency-table',
          create: {
            url: 'api/management/axisefficiency/create',
            start: function (tdEles) {
              $(tdEles).find('[name=machine_id]').select2()
              $('select[name=machine_id] option:eq(0)').prop('selected', true)
              $('[name=machine_id]').change()
            },
            send: createAndUpdateSend,
            end: createAndUpdateEnd,
          },
          read: {
            url: 'api/management/axisefficiency/read',
          },
          update: {
            url: 'api/management/axisefficiency/update',
            start: {
              1: function (oldTd, newTd, oldTr, newTr) {
                $(newTr).find('[name=machine_id]').select2()
                $(newTr).find('[name=machine_id]').attr('disabled', true)
                var oldEntity = $(oldTd).eq(0).text().trim()
                $(newTr).find('[name=machine_id]').select2('val', oldEntity)
                $(newTr).find('[name=machine_id]').trigger('change')
              },
            },
            send: createAndUpdateSend,
            end: createAndUpdateEnd,
          },
          delete: {
            url: 'api/management/axisefficiency/delete',
          },
          // excel: {
          //     url: '/api/aftersalesservice/entitybreakdown/excel'
          // },
          validate: {
            1: function (td, table) {
              var input = td.querySelector('select')
              if (!input.disabled) {
                var exidtMachineIdColumnsList = table.columns(1).data().eq(0)
                if (
                  _.find(exidtMachineIdColumnsList, function (existId) {
                    return existId === input.value.trim()
                  })
                ) {
                  return `${i18n('Stk_Pk')}`
                }
              }
            },
            3: function (td, table) {
              var input = td.querySelector('input')
              if (input.value === '') {
                return `${i18n('Stk_Required')}`
              }
              var intValue = parseInt(input.value)
              if (intValue == 0 || intValue < 0) {
                return `${i18n('Manage_Axis_Efficiency_0006')}`
              } else if (isNaN(intValue)) {
                return `${i18n('Manage_Axis_Efficiency_0007')}...`
              }
            },
            4: function (td, table) {
              var input = td.querySelector('input')
              if (input.value === '') {
                return `${i18n('Stk_Required')}`
              }
              var intValue = parseInt(input.value)
              if (intValue == 0 || intValue < 0) {
                return `${i18n('Manage_Axis_Efficiency_0008')}`
              } else if (isNaN(intValue)) {
                return `${i18n('Manage_Axis_Efficiency_0007')}...`
              }
            },
          },
        })
      },
    },
    preCondition: {
      queryMachine: function (done) {
        servkit.ajax(
          {
            url: servkit.rootPath + '/api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'm_device',
              columns: ['device_id', 'device_name'],
            }),
          },
          {
            success: function (data) {
              var dataMap = {}
              _.each(data, function (elem, key) {
                dataMap[elem.device_id] = elem.device_name
              })
              done(dataMap)
            },
            fail: function (data) {
              console.log(data)
            },
          }
        )
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
