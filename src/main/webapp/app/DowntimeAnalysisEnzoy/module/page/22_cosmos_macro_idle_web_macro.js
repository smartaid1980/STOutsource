import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      pageSetUp()

      servkit.addChartExport('#detailidelhead', '#equipment-detail-flot')

      var table = context.$equipmentDetailTable.DataTable({
        ordering: false,
        paging: false,
        sDom: "t<'dt-toolbar-footer'>",
        rowCallback: function (row, data) {
          $(row).find('td').eq(0).css('text-align', 'left')
          $(row)
            .find('td')
            .eq(1)
            .html(
              servkit.switchDataFormat({ type: 'floatMinutesToMS' }, data[1])
            )
        },
        drawCallback: function (oSettings) {
          if (this.api().data().length) {
            context.$equipmentDetailTable
              .closest('.jarviswidget')
              .find('.fa-plus')
              .click()
            context.drawBarChart(
              this.api().data(),
              context.$equipmentDetailFlot
            )
          }
        },
      })

      console.log(context.preCon.getMacroMap)
      if (context.preCon.getMacro) {
        servkit.initSelectWithList(
          context.preCon.getMacro,
          context.$macroSelect,
          true
        )
      }
      if (context.preCon.getAllMachine) {
        context.allMachineArr = context.preCon.getAllMachine
      }
      servkit.initDatePicker(context.$startDate, context.$endDate, true)

      context.$submit.on('click', function (evt) {
        evt.preventDefault()
        context.drawTable(table)
      })

      var showdemoConfig
      try {
        showdemoConfig = servkit.showdemoConfig[context.appId][context.funId]
      } catch (e) {
        console.warn(e)
      } finally {
        showdemoConfig = showdemoConfig || {
          startDate: '2018/06/01',
          endDate: '2018/07/09',
          machine: '_FOXCONNP01D01M005',
        }
      }
      $('#showdemo').on('click', function (e) {
        e.preventDefault()

        context.$startDate.val(showdemoConfig.startDate)
        context.$endDate.val(showdemoConfig.endDate)
        context.$submit.click()
      })
    },
    util: {
      $startDate: $('[name=startDate]'),
      $endDate: $('[name=endDate]'),
      $macroSelect: $('[name=macro-select]'),
      $submit: $('#submit'),
      $equipmentDetailTable: $('#equipment-detail-table'),
      $equipmentDetailFlot: $('#equipment-detail-flot'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit')),
      checkAlarm: false,
      allMachineArr: [],
      keyValueTHead: [
        //機台閒置細節, 製令閒置細節
        { data: 'column', title: `${i18n('Column')}`, className: 'text-left' },
        {
          data: 'value',
          title: `${i18n('Value')}`,
          className: 'text-right',
          format: { type: 'floatMinutesToMS' },
        },
      ],
      equipmentDetailColumns: [],
      equipmentDetailOptions: {
        sDom: "t<'dt-toolbar-footer'>",
        paging: false,
      },
      drawTable: function (table) {
        this.loadingBtn.doing()
        var context = this
        var startDate = this.$startDate.val()
        var endDate = this.$endDate.val()
        var macro = this.$macroSelect.val() || []
        var machines = this.allMachineArr
        try {
          hippo
            .newSimpleExhaler()
            .space('fah_product_work_by_macro_web_macro')
            .index('macro', macro)
            .index('machine_id', machines)
            .indexRange('date', startDate, endDate)
            .columns('machine_id', 'date', 'macro', 'minute')
            .exhale(function (exhalable) {
              var objMap = {}
              var result = _.chain(
                exhalable.exhalable.map(function (obj) {
                  return obj
                })
              )
                .groupBy(function (ele) {
                  return ele.macro
                })
                .value()
              result = _.map(_.keys(result), function (key) {
                var total = _.map(result[key], function (obj) {
                  return obj.minute
                })
                objMap[key] = _.reduce(total, function (memo, num) {
                  return parseFloat(memo) + parseFloat(num)
                })
              })
              var macroArr = _.map(_.pairs(objMap), function (arr) {
                if (context.preCon.getMacroMap[arr[0]] === undefined) {
                  return ['M' + arr[0], arr[1]]
                }
                return [context.preCon.getMacroMap[arr[0]], arr[1]]
              })
              if (macroArr.length) {
                macroArr.reverse()
                table.clear().rows.add(macroArr).draw()
              } else {
                $('.jarviswidget:gt(3)').find('.fa-minus').click()
                context.$equipmentDetailFlot.empty()
                table.clear().draw()
                context.commons.noDataAction()
              }
            })
        } catch (e) {
          console.warn(e)
          this.loadingBtn.done()
        } finally {
          this.loadingBtn.done()
        }
      },
      drawBarChart: function (macroData, $chart) {
        var data = _.map(macroData, function (elem, index) {
          return [elem[1], index]
        })

        $.plot($chart, [{ data: data, color: '#6595B4' }], {
          series: {
            bars: { show: true },
          },
          bars: {
            align: 'center',
            barWidth: 0.7,
            horizontal: true,
            lineWidth: 1,
          },
          xaxis: {
            axisLabel: `${i18n('Time_Minutes')}`,
            axisLabelUseCanvas: true,
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: 'Verdana, Arial',
            axisLabelPadding: 10,
            min: 0,
          },
          yaxis: {
            ticks: _.map(macroData, function (elem, index) {
              return [index, elem[0]]
            }),
          },
          grid: {
            hoverable: true,
          },
          tooltip: true,
          tooltipOpts: {
            content: '%x.2 M ',
          },
        })
      },
    },
    preCondition: {
      getMacro: function (done) {
        this.commons.macroMap(done)
      },
      getAllMachine: function (done) {
        servkit.ajax(
          {
            url: servkit.rootPath + '/api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'm_device',
              columns: ['device_id'],
            }),
          },
          {
            success: function (data) {
              var machineArr = _.map(data, function (obj) {
                return obj.device_id
              })
              done(machineArr)
            },
            fail: function (data) {
              console.log(data)
            },
          }
        )
      },
      getMacroMap: function (done) {
        servkit.ajax(
          {
            //先讀使用者的
            url: 'api/v3/macro/config/read',
            type: 'GET',
          },
          {
            success: function (response) {
              const map = _.chain(response)
                .indexBy('macro_code')
                .mapObject((value) => value.macro_code_name)
                .value()
              done(map)
            },
            fail: function (d, textStatus, error) {
              done({})
              console.error(
                'getJSON failed, status: ' + textStatus + ', error: ' + error
              )
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
    ],
  })
}
