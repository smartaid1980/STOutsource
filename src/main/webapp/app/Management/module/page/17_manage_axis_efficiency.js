import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.initAxisEfficiencyTable()
      // pageSetUp();
      $('#stk-axis-efficiency-table tbody').on(
        'change',
        '[name="machine_id"]',
        function (evt) {
          evt.preventDefault()
          var key = $('[name=machine_id]').val()
          var value = context.machineObj[key]
          $('[name=machine_name]').val(value)
        }
      )
    },
    util: {
      $machineId: $('[name=machine_id]'),
      $machineName: $('[name=machine_name]'),
      machineObj: {},
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
            return (
              '<span class="label label-primary" style="cursor:pointer;float:left;margin:5px;"><i class="fa fa-tag"></i>&nbsp;' +
              machineId +
              '</span>'
            )
          },
        }

        var axisData
        var axisHtml
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
              var reault = []
              _.map(data, function (data) {
                reault.push(data.device_id)
                that.machineObj[data.device_id] = data.device_name
              })
              axisData = reault
            },
            fail: function (data) {
              console.log(data)
            },
          }
        )

        servkit
          .politeCheck()
          .until(function () {
            return axisData
          })
          .thenDo(function () {
            var axisSelectHtml = ''
            _.each(axisData, function (data) {
              axisSelectHtml +=
                '<option style="padding:3px 0 3px 3px;" value="' +
                data +
                '" selected>' +
                data +
                '</option>'
            })
            axisHtml = axisSelectHtml
          })
          .tryDuration(0)
          .start()

        servkit
          .politeCheck()
          .until(function () {
            return axisHtml
          })
          .thenDo(function () {
            return axisHtml
          })
          .tryDuration(0)
          .start()

        servkit.crudtable({
          tableSelector: '#stk-axis-efficiency-table',
          create: {
            url: 'api/productionefficiency/axisefficiency/create',
            start: function (tdEles) {
              $('[name=machine_id]')[0].innerHTML = axisHtml
              $('select[name=machine_id] option:eq(0)').prop('selected', true)
              $('[name=machine_id]').change()
              pageSetUp() // for select2
            },
            send: createAndUpdateSend,
            end: createAndUpdateEnd,
          },
          read: {
            url: 'api/productionefficiency/axisefficiency/read',
          },
          update: {
            url: 'api/productionefficiency/axisefficiency/update',
            start: {
              1: function (oldTd, newTd) {
                var oldEntity = $(oldTd).eq(0).text().trim()
                $('[name=machine_id]')[0].innerHTML = axisHtml
                $('[name=machine_id] option:contains(' + oldEntity + ')').prop(
                  'selected',
                  true
                )
                $('[name=machine_id]').change()
                pageSetUp()
                $('[name=machine_id]').attr('disabled', true)
              },
              2: function (oldTd, newTd) {
                $('[name=machine_name]').attr('disabled', true)
              },
            },
            send: createAndUpdateSend,
            end: createAndUpdateEnd,
          },
          delete: {
            url: 'api/productionefficiency/axisefficiency/delete',
          },
          // excel: {
          //     url: '/api/aftersalesservice/entitybreakdown/excel'
          // },
          validate: {
            1: function (td, table) {
              var input = td.querySelector('select')
              if (input.value === '') {
                return `${i18n('Stk_Required')}`
              }

              if (!input.disabled) {
                if (
                  _.find(table.columns(0).data().eq(0), function (existId) {
                    var formValue = $(existId).text().trim()
                    return formValue === input.value.trim()
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
                return '主軸實際轉速門檻值不可等於 0 或小於 0'
              } else if (isNaN(intValue)) {
                return '請輸入數字...'
              }
            },
            4: function (td, table) {
              var input = td.querySelector('input')
              if (input.value === '') {
                return `${i18n('Stk_Required')}`
              }
              var intValue = parseInt(input.value)
              if (intValue == 0 || intValue < 0) {
                return '進給率百分比門檻值不可等於 0 或小於 0'
              } else if (isNaN(intValue)) {
                return '請輸入數字...'
              }
            },
            5: function (td, table) {
              var input = td.querySelector('input')
              if (input.value === '') {
                return `${i18n('Stk_Required')}`
              }
              var intValue = parseInt(input.value)
              if (intValue == 0 || intValue < 0) {
                return '倒數門檻值不可等於 0 或小於 0'
              } else if (isNaN(intValue)) {
                return '請輸入數字...'
              }
            },
          },
        })
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
