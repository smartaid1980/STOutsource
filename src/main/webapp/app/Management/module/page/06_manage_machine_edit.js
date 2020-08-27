import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.$table.on('change', 'select[name=cnc_brands]', function (e) {
        var selectedBrand = this.value
        var paramHtmlMapData = context.paramFilter(
          context.preCon.paramList[selectedBrand],
          selectedBrand
        )
        var paramHtml = _.map(paramHtmlMapData, function (param) {
          return context.paramTrHtml(param)
        }).join('')
        $('table[name=param]').html(paramHtml)
      })

      var createAndUpdateSend = function (tdEles) {
        return {
          device_type: $(tdEles[2]).find('select').val(),
          cnc_brands: $(tdEles[3]).find('select').val(),
          param: context.table2Param(),
        }
      }
      var createAnUpdateEnd = {
        5: function (td) {
          // table 2 dl
          var param = context.table2Param()
          return context.param2Dl(param)
        },
      }

      var crudtableConfig = {
        tableModel: 'com.servtech.servcloud.module.model.DeviceCncBrand',
        tableSelector: '#stk-machine-table',
        read: {
          url: 'api/machine/readIncludeMachineInfo',
          end: {
            5: function (param) {
              if (param) {
                return context.param2Dl(param.param)
              } else {
                return ''
              }
            },
          },
        },
        create: {
          unavailable: true,
        },
        update: {
          url: 'api/machine/updateIncludeMachineInfo',
          start: {
            5: function (oldTd, newTd, oldTr, newTr, table) {
              context.dynamicParamTable(newTr)
              // dd into table
              _.each($(oldTd).find('dd'), function (dd) {
                var key = dd.className
                var value = dd.textContent
                $(newTd)
                  .find('[name=' + key + ']')
                  .val(value)
              })
            },
            2: function (oldTd, newTd) {
              context.tempMachineName = $(oldTd).text()
              $(newTd).find('input').val(context.tempMachineName)
            },
          },
          send: createAndUpdateSend,
          end: createAnUpdateEnd,
          finalDo: context.CUDFinalDos,
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
          2: function (td, table) {
            if (td.querySelector('input').value === '') {
              return `${i18n('Stk_Required')}`
            }
            var input = td.querySelector('input')
            if (
              _.find(table.columns(1).data().eq(0), function (existId) {
                return (
                  existId.toLowerCase() === input.value.toLowerCase() &&
                  existId.toLowerCase() !==
                    context.tempMachineName.toLowerCase()
                )
              })
            ) {
              return `${i18n('Stk_Pk')}`
            }
          },
        },
      }
      if (
        servtechConfig.ST_CUSTOMER &&
        servtechConfig.ST_CUSTOMER === 'shayangye'
      ) {
        crudtableConfig['customBtns'] = [
          '<button class="btn margin-right-10 btn-success" id="shayangye-sync-btn"><span class="fa fa fa-spinner fa-lg"></span></button>',
        ]
      }
      servkit.crudtable(crudtableConfig)

      $('#wid-id-0').on('click', '#shayangye-sync-btn', function (evt) {
        var loadBtn = servkit.loadingButton(this)
        var smallParams = {
          selectColor: 'yellow',
          title: '同步中 請稍後',
          icon: 'fa fa-check',
          timeout: 2000,
        }
        context.commons.smallBox(smallParams)
        try {
          loadBtn.doing()
          servkit.ajax(
            {
              url: 'api/shayangye/machine/sync',
              type: 'GET',
            },
            {
              success: function (data) {
                smallParams = {
                  selectColor: 'green',
                  title: '同步完成',
                  icon: 'fa fa-check',
                  timeout: 2000,
                }
                context.commons.smallBox(smallParams)
                console.log(data)
              },
              fail: function (data) {
                smallParams = {
                  selectColor: 'yellow',
                  title: '同步失敗',
                  icon: 'fa fa-check',
                  timeout: 2000,
                }
                context.commons.smallBox(smallParams)
                console.warn(data)
              },
            }
          )
        } catch (e) {
          console.warn(e)
        } finally {
          loadBtn.done()
        }
      })
    },
    util: {
      $table: $('#stk-machine-table'),
      CUDFinalDos: function () {
        // update machineMap
        servkit.loadMachineIds()
      },
      paramTrHtml: _.template(
        '<tr>' +
          '  <td><%= paramName %></td>' +
          '  <td><input type="text" class="form-control" <%- readonly=="true" ? "disabled" : "" %> name="<%= paramName %>" placeholder="<%= paramName %>" value="<%= defaultValue %>"/></td>' +
          '</tr>'
      ),
      dynamicParamTable: function (newTr) {
        var context = this
        var selectedBrand = $(newTr).find('select[name=cnc_brands]').val()
        var paramHtmlMapData = context.paramFilter(
          context.preCon.paramList[selectedBrand],
          selectedBrand
        )
        var paramHtml = _.map(paramHtmlMapData, function (param) {
          return context.paramTrHtml(param)
        }).join('')
        $(newTr).find('table[name=param]').html(paramHtml)
      },
      param2Dl: function (param) {
        return (
          '<dl class="dl-horizontal">' +
          _.map(param, function (value, key) {
            return (
              '<dt>' + key + '</dt><dd class="' + key + '">' + value + '</dd>'
            )
          }).join('') +
          '</dl>'
        )
      },
      table2Param: function () {
        return _.object(
          _.map($('table[name=param]').find('input:not(:disabled)'), function (
            input
          ) {
            return [input.getAttribute('name'), input.value]
          })
        )
      },
      paramFilter: function (param, brandName) {
        if (brandName != 'INDICATORLAMP_FILE') return param
        var paramHtmlMapData2 = _.filter(param, function (data) {
          if (
            data.paramName != 'CMD_FILE_PATH' &&
            data.paramName != 'RESULT_FOLDER_PATH'
          ) {
            return data
          }
        })
        return paramHtmlMapData2
      },
    },
    preCondition: {
      paramList: function (done) {
        servkit.ajax(
          {
            url: 'api/MachineEditor/getParamList',
            type: 'GET',
          },
          {
            success: function (data) {
              /*
               *{
               * "SIEMENS_CNC_OPC-UA": [
               *     {
               *         "defaultValue": "192.168.20.12",
               *         "paramName": "IP",
               *         "readonly": "false"
               *     },
               *     {
               *         "defaultValue": "4840",
               *         "paramName": "PORT",
               *         "readonly": "false"
               *     },
               *     {
               *         "defaultValue": "",
               *         "paramName": "USERNAME",
               *         "readonly": "false"
               *     },
               *     {
               *         "defaultValue": "",
               *         "paramName": "PASSWORD",
               *         "readonly": "false"
               *     }
               * ], ...
               * }
               * */
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
