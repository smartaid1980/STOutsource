import i18n from '../../../../js/servtech/module/servcloud.i18n.js'

export default function () {
  GoGoAppFun({
    gogo: function (context) {
      servkit.crudtable({
        tableSelector: '#stk-plant-table',
        create: {
          url: 'api/plantarea/create',
          start: function (newTr) {
            context.updateSelect($(newTr[2]).find('select'))
          },
          finalDo: function (row) {
            context.bling($(row).attr('stk-db-id'))
            $('#stk-plant-table')
              .closest('.widget-body')
              .find('.stk-refresh-btn')
              .trigger('click')
          },
        },
        read: {
          url: 'api/plantarea/read',
          end: {
            3: function (data) {
              return _.map(data, function (ele) {
                return servkit.getMachineName(ele.device_id)
              })
            },
          },
        },
        update: {
          url: 'api/plantarea/update',
          start: {
            3: function (oldTd, newTd) {
              context.updateSelect($(newTd).find('select'), oldTd)
            },
          },
          finalDo: function (row) {
            context.bling($(row).attr('stk-db-id'))
            $('#stk-plant-table')
              .closest('.widget-body')
              .find('.stk-refresh-btn')
              .trigger('click')
          },
        },
        delete: {
          url: 'api/plantarea/delete',
        },
        validate: {
          1: function (td, table) {
            var input = td.querySelector('input')
            var regStr = /[`~!@#$%^&*()_+={}<>|[\]\\:;'"?,./]/
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
            if (regStr.test(input.value)) {
              return `${i18n('Symbol_String')}`
            }
          },
          2: function (td) {
            var input = td.querySelector('input')
            if (input.value === '') {
              return `${i18n('Stk_Required')}`
            }
          },
        },
      })
    },
    util: {
      updateSelect: function ($select, oldTd) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'm_plant_area',
              columns: ['device_id', 'plant_id'],
            }),
            async: true,
          },
          {
            success: function (data) {
              var devicePlantMap = {}
              _.each(data, (val) => {
                devicePlantMap[val.device_id] = servkit.getPlantAreaName(
                  val.plant_id
                )
              })

              var dataList = _.map(servkit.getMachineList(), function (val) {
                return {
                  key: val,
                  name: devicePlantMap[val]
                    ? servkit.getMachineName(val) +
                      '(' +
                      devicePlantMap[val] +
                      ')'
                    : servkit.getMachineName(val),
                }
              }).sort(servkit.naturalCompareValue)

              var selectHtml = []
              _.each(dataList, function (elem) {
                selectHtml.push(
                  '<option style="padding:3px 0 3px 3px;" value="' +
                    elem.key +
                    '">' +
                    elem.name +
                    '</option>'
                )
              })

              $select.html(selectHtml.join(''))
              servkit.multiselectHeightOptimization($select[0])

              if (oldTd) {
                var trim = function (str) {
                  if (str) {
                    return str.replace(/^\s+|\s+$/, '')
                  } else {
                    return ''
                  }
                }
                var labels = $(oldTd)
                  .find('span.label')
                  .map(function () {
                    return this.value || trim(this.textContent)
                  })
                  .toArray()
                _.each($select[0].options, function (option) {
                  var optionVal = trim(option.textContent)
                  if (!optionVal) {
                    option.selected = false
                    return
                  }
                  optionVal = optionVal.slice(0, optionVal.indexOf('('))
                  option.selected = labels.indexOf(optionVal) !== -1
                })
              }
            },
          }
        )
      },
      bling: function (data) {
        var actBlingTimes = 4 * 2 + 1
        var blingCount = 1

        setTimeout(function change() {
          var $elements = $(
            "#stk-plant-table tr[stk-db-id='" + data + "']"
          ).find('td')
          if (blingCount < actBlingTimes) {
            if (blingCount++ % 2 === 0) {
              $elements.css('background-color', '')
            } else {
              $elements.css('background-color', 'rgba(0, 255, 0, 0.2)')
            }
            setTimeout(change, 300)
          }
        }, 500)
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
