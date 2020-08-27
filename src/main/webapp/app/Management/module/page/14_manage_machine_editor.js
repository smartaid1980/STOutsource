import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      var brandMap

      servkit.ajax(
        {
          url: 'api/MachineEditor/getParamList',
          type: 'GET',
        },
        {
          success: function (data) {
            brandMap = data
            $.each(brandMap, function (key, value) {
              $('#machine-brand').append(
                $('<option></option>').attr('value', key).text(key)
              )
            })
          },
        }
      )

      servkit.crudtable({
        tableSelector: '#stk-machine-table',
        create: {
          unavailable: true,
        },
        read: {
          url: 'api/MachineEditor/readTable',
          end: {
            4: function (data) {
              if (data && data.length) {
                data = data.join('<br>')
              }
              return data
            },
          },
          finalDo: function () {
            console.log('read finalDo!')
            $('#stk-machine-table')
              .find('tbody')
              .off('click', '.stk-edit-btn')
              .on('click', '.stk-edit-btn', function (e) {
                e.preventDefault()
                var tr = $(this).closest('tr')
                var machineID = tr.find('td').eq(1).text()
                var machineName = tr.find('td').eq(2).text()
                var machineBrand = tr.find('td').eq(3).text()
                var machineParams = {}
                _.each(tr.find('td').eq(4).html().split('<br>'), function (
                  elem
                ) {
                  machineParams[elem.split(':')[0]] = elem.split(':')[1]
                })

                $('.modal-title')
                  .text(machineName + ` ${i18n('Setting')}`)
                  .attr('machineID', machineID)
                  .attr('machineName', machineName)
                $('#machine-brand').val(machineBrand)
                dynamicSelect(machineParams)
                $('#myModal').modal('show')
              })

            $('#machine-brand').change(dynamicSelect)

            $('#save')
              .off('click')
              .on('click', function (e) {
                e.preventDefault()
                var ID = $('.modal-title').attr('machineID')
                var Name = $('.modal-title').attr('machineName')
                var brand = $('#machine-brand').val()
                var paramList = brandMap[brand]
                var param_names = []
                var param_values = []
                var first = true
                _.each(paramList, function (parameter) {
                  param_names.push(parameter.paramName)
                  param_values.push($('#' + parameter.paramName).val())
                })
                servkit.ajax(
                  {
                    url: 'api/MachineEditor/saveEdit',
                    type: 'POST',
                    tradition: true,
                    data: {
                      ID: ID,
                      name: Name,
                      brand: brand,
                      params: param_names,
                      values: param_values,
                    },
                  },
                  {
                    success: function (res) {
                      $.smallBox({
                        title: 'Done!',
                        content:
                          "<i>Device's properties have been modified!</i>",
                        color: '#84A83E',
                        iconSmall: 'fa fa-check bounce animated',
                        timeout: 4000,
                      })
                      $('.stk-refresh-btn').click()
                    },
                    fail: function (res) {
                      $.smallBox({
                        title: 'Fail!',
                        content: '<i>' + res + '</i>',
                        color: '#a90329',
                        iconSmall: 'fa fa-exclamation-triangle bounce animated',
                        timeout: 4000,
                      })
                    },
                  }
                )
              })
          },
        },
        update: {
          url: '',
        },
        delete: {
          unavailable: true,
        },
      })

      function dynamicSelect(paramObj) {
        var brand = $('#machine-brand').val()
        $('#form1').html('')
        var paramList = brandMap[brand]
        if (paramList && paramList.length) {
          _.each(paramList, function (parameter) {
            var value = paramObj[parameter.paramName] || parameter.defaultValue
            if (parameter.readonly === 'true') {
              $('#form1').append(
                "<div class='row'>" +
                  "<section class='col col-3'><h3>" +
                  parameter.paramName +
                  '(disabled)</h3></section>' +
                  "<section class='col col-8'><label class='input'><input type='text' id='" +
                  parameter.paramName +
                  "' value='" +
                  value +
                  "' disabled='disabled'></label></section>" +
                  '</div>'
              )
            } else {
              $('#form1').append(
                "<div class='row'>" +
                  "<section class='col col-3'><h3>" +
                  parameter.paramName +
                  '</h3></section>' +
                  "<section class='col col-8'><label class='input'><input type='text' id='" +
                  parameter.paramName +
                  "' value='" +
                  value +
                  "'></label></section>" +
                  '</div>'
              )
            }
          })
        }
        $('[disabled]').css({
          'background-color': '#eee',
          'cursor': 'no-drop',
        })
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
