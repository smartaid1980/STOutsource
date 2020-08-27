import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      var notBindedTxt = `${i18n('No_Bundle')}`
      var notBindedOption =
        '<option value="" selected>' + notBindedTxt + '</option>'
      var createAndUpdateSend = function (tr) {
        return {
          device_id: $(tr).find('select[name=device_id]').val(),
          line_id: $(tr).find('select[name=line_id]').val(),
          //        plant_id: $(tr).find("select[name=plant_id]").val()
        }
      }
      var customLabel = function (td) {
        if ($(td).find('select').val() === '') {
          return []
        } else {
          return (
            "<span class='label label-primary' style='cursor:pointer;float:left;margin:5px;'><i class='fa fa-tag'>" +
            '</i>&nbsp;' +
            $(td).find('option:selected').text() +
            '</span>'
          )
        }
      }
      var createAndUpdateEnd = {
        4: function (td) {
          var PSW = $(td).find('input').val()
          return (
            (PSW.length ? PSW.replace(/\D|\d/g, '●') : '') +
            '<span class="hide">' +
            PSW +
            '</span>'
          )
        },
        6: customLabel,
        7: customLabel,
        //      8: customLabel
      }

      var lineMap = {}
      console.log('test')
      servkit.crudtable({
        tableSelector: '#table',
        inputTemplate: {
          handler: function (select, data) {
            var html = _.map(data, function (line) {
              lineMap[line.line_id] = line.line_name
              return (
                '<option value="' +
                line.line_id +
                '">' +
                line.line_name +
                '</option>'
              )
            })
            $(select).html(notBindedOption + html.join(''))
          },
        },
        create: {
          url: 'api/ipCam/create',
          start: function (newTr, table) {
            $(newTr).find('select[name=device_id]').prepend(notBindedOption)
            //          $(newTr).find("select[name=plant_id]").prepend(notBindedOption);
          },
          send: createAndUpdateSend,
          end: createAndUpdateEnd,
        },
        read: {
          url: 'api/ipCam/read',
          end: {
            4: function (password) {
              return (
                (password && password.length
                  ? password.replace(/\D|\d/g, '●')
                  : '') +
                '<span class="hide">' +
                password +
                '</span>'
              )
            },
            6: function (machineId) {
              return [servkit.getMachineName(machineId) || '']
            },
            7: function (lineId) {
              return [lineMap[lineId] || '']
            },
          },
        },
        update: {
          url: 'api/ipCam/update',
          start: {
            4: function (oldTd, newTd, oldTr, newTr) {
              newTd.querySelector('input').value = oldTd.querySelector(
                'span'
              ).textContent
            },
            6: function (oldTd, newTd, oldTr, newTr) {
              $(newTd).find('select[name=device_id]').prepend(notBindedOption)
              var oldMachineName = $(oldTd).text().trim()
              _.each($(newTd).find('option'), function (option) {
                if (option.textContent == oldMachineName) {
                  option.selected = true
                }
              })
            },
            7: function (oldTd, newTd, oldTr, newTr) {
              var lineName = $(oldTd).text().trim()
              _.each($(newTd).find('option'), function (option) {
                if (option.textContent == lineName) {
                  option.selected = true
                }
              })
              //          },
              //          8: function (oldTd, newTd, oldTr, newTr) {
              //            var oldPlantId = $(oldTd).text().trim();
              //            $(newTd).find('select[name=plant_id]').prepend(notBindedOption).val(oldPlantId);
            },
          },
          send: createAndUpdateSend,
          end: createAndUpdateEnd,
        },
        delete: {
          url: 'api/ipCam/delete',
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
