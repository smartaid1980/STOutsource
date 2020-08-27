import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      // the finalDo after 'read'
      var afterCRUD = _.once(function () {
        $('.stk-refresh-btn')
          .after(
            '<button class="btn btn-success mergeBtn" title="Update" style="margin-right:5px"><span class="fa fa-compress fa-lg"></span></button>'
          )
          .after(
            '<button class="btn btn-success restartBtn" title="restart" style="margin-right:5px"><span class="fa fa-power-off fa-lg"></span></button>'
          )

        $('.mergeBtn').on('click', function (e) {
          console.log('click!')
          e.preventDefault()
          var selectedBoxes = []
          var trs = $('#wid-manage-box')
            .find('tbody')
            .find(':checkbox:checked')
            .closest('tr')
          _.each(trs, function (tr) {
            selectedBoxes.push($(tr).find('td').eq(1).text())
          })
          if (selectedBoxes.length) {
            servkit.ajax(
              {
                url: 'api/MachineEditor/mergeMachine',
                type: 'POST',
                data: {
                  selectedBoxes: selectedBoxes,
                },
              },
              {
                success: function (res) {
                  if (res) {
                    $.smallBox({
                      title: 'Done!',
                      content: '<i>device.xml has been updated!</i>',
                      color: '#84A83E',
                      iconSmall: 'fa fa-check bounce animated',
                      timeout: 4000,
                    })
                  }
                },
              }
            )
          } else {
            $.smallBox({
              title: 'No selected boxes!',
              content: ' <i>Please select the boxes.</i>',
              color: '#a90329',
              iconSmall: 'fa fa-exclamation-triangle bounce animated',
              timeout: 4000,
            })
          }
        })
        $('.restartBtn').on('click', function (e) {
          e.preventDefault()
          var selectedBoxes = []
          var trs = $('#wid-manage-box')
            .find('tbody')
            .find(':checkbox:checked')
            .closest('tr')
          _.each(trs, function (tr) {
            selectedBoxes.push($(tr).find('td').eq(1).text())
          })
          if (selectedBoxes.length) {
            servkit.ajax(
              {
                url: 'api/MachineEditor/restart',
                type: 'POST',
                data: {
                  selectedBoxes: selectedBoxes,
                },
              },
              {
                success: function (result) {
                  console.log(result)
                  var errCode = {
                    0: 'success',
                    1: 'Set Title Fail',
                    2: 'Need Param',
                    3: 'No Lean Exist',
                    4: 'Start Fail',
                  }

                  for (var boxId in result) {
                    if (result[boxId] === 0) {
                      $.smallBox({
                        title: 'Done!',
                        content: '<i>' + boxId + ' has been restarted!</i>',
                        color: '#84A83E',
                        iconSmall: 'fa fa-check bounce animated',
                        timeout: 4000,
                      })
                    } else {
                      var exitVal = result[boxId]
                      var errMsg = 'Unknown Error'
                      exitVal in errCode && (errMsg = errCode[exitVal])
                      $.smallBox({
                        title: 'Error!',
                        content: '<i>' + boxId + ' error! : ' + errMsg + '</i>',
                        color: '#a90329',
                        iconSmall: 'fa fa-exclamation-triangle bounce animated',
                        timeout: 4000,
                      })
                    }
                  }
                },
              }
            )
          } else {
            $.smallBox({
              title: 'No selected boxes!',
              content: ' <i>Please select the boxes.</i>',
              color: '#a90329',
              iconSmall: 'fa fa-exclamation-triangle bounce animated',
              timeout: 4000,
            })
          }
        })
      })

      servkit.crudtable({
        tableSelector: '#stk-box-table',
        create: {
          unavailable: true,
        },
        read: {
          url: 'api/box/read',
          end: {
            5: function (data) {
              return _.map(data, function (ele) {
                return ele.device_name
              })
            },
          },
          finalDo: afterCRUD,
        },
        update: {
          url: 'api/box/update',
          start: {
            0: function () {
              $('tbody').off('mousedown')
            },
          },
          finalDo: function () {
            servkit.ajax(
              {
                url: 'api/mqttpool/reconnect',
                type: 'GET',
                contentType: 'application/json',
              },
              {
                success: function () {
                  console.log('MQTT reconnect successful.')
                },
              }
            )
          },
        },
        delete: {
          unavailable: true,
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
