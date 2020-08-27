import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      servkit.addChartExport('#machineidlehead', '#equipment-flot')
      servkit.addChartExport('#detailidelhead', '#equipment-detail-flot')
      servkit.addChartExport('#piecharthead', '#stk-pie-chart')

      var macroObj = context.preCon.getMacroMap
      var commons = context.commons
      var macroKeys = []
      var productConsumeTime = [], //{}
        productConsumeTimeByWorkOrder = {} //{product_id@@work_order_id :[{}, ...], ...}

      var equipmentTable = commons.growDataTable(
        context.$equipmentTable,
        context.equipmentColumns,
        commons.equipmentOptions
      ) //機台閒置
      var equipmentDetailTable = commons.growDataTable(
        context.$equipmentDetailTable,
        context.keyValueTHead,
        commons.equipmentDetailOptions
      ) //機台閒置細節
      var workOrderTable = commons.growDataTable(
        context.$workOrderTable,
        context.workOrderColumns,
        commons.workOrderOptions
      ) //製令閒置
      var workOrderOverallTable = commons.growDataTable(
        context.$workOrderOverallTable,
        context.workOrderOverallColumns,
        commons.workOrderOverallOptions
      ) //製令總覽
      var workOrderDetailTable = commons.growDataTable(
        context.$workOrderDetailTable,
        context.keyValueTHead,
        commons.workOrderDetailOptions
      ) //製令閒置細節

      pageSetUp()
      context.init()
      context.demo(context)
      context.equipmentExcel()
      commons.workOrderExcel(workOrderTable)
      commons.workOrderOverallExcel(workOrderOverallTable)
      commons.workOrderDetailExcel(workOrderDetailTable)

      // for detail table
      function format(d) {
        // `d` is the original data object for the row
        return (
          '<p><table id="workoveralldetail" class="table table-striped table-bordered table-hover" >' +
          '<thead>' +
          '<tr>' +
          `<th><b>${i18n('N4')}</b></th>` +
          `<th><b>${i18n('N5')}</b></th>` +
          `<th><b>${i18n('N6')}</b></th>` +
          `<th><b>${i18n('N7_peter')}</b></th>` +
          '</tr>' +
          '</thead>' +
          '<tr>' +
          '<td>' +
          d.process_department +
          '</td>' +
          '<td>' +
          d.process_device +
          '</td>' +
          '<td>' +
          d.process_step +
          '</td>' +
          '<td>' +
          d.editor +
          '</td>' +
          '</tr>' +
          '</table></p>'
        )
      }

      $('#work-order-overall-table tbody').on(
        'click',
        'td.details-control',
        function () {
          var tr = $(this).closest('tr')
          var row = workOrderOverallTable.row(tr)
          if (row.child.isShown()) {
            // This row is already open - close it
            row.child.hide()
            tr.removeClass('shown')
          } else {
            // Open this row
            row.child(format(row.data())).show()
            tr.addClass('shown')
          }
        }
      )

      $('#submit').on('click', function (e) {
        e.preventDefault()
        context.loadingBtn.doing()
        // console.log("If alarm exist : " + context.checkAlarmindex());
        var selectedDevice = context.$stkReportForm
          .find("[name='device']")
          .val()
        var startdate = context.$stkReportForm.find("[name='startDate']").val()
        var enddate = context.$stkReportForm.find("[name='endDate']").val()
        var macroPath =
          'app/' +
          document.location.hash.split('/').slice(1, 4).join('/') +
          '/macro.json'
        var checkIfNewAlarm =
          _.find(_.values(context.preCon.getKeys), (str) => {
            return str == 'alarm_minute'
          }) !== undefined
        // console.log(checkIfNewAlarm);

        productConsumeTime = []
        productConsumeTimeByWorkOrder = {}

        $.getJSON(macroPath).done(function (macroObj) {
          var start = startdate.replace(/\//g, '')
          var end = enddate.replace(/\//g, '')
          servkit.ajax(
            {
              url: 'api/downtimeanalysis/machineidle/getworkshiftrange',
              type: 'GET',
              data: {
                startDate: start,
                endDate: end,
              },
            },
            {
              success: function (shiftData) {
                var totalShiftTime = 0
                var hippoInstans = hippo
                  .newSimpleExhaler()
                  .space('fah_product_work')
                  .index('machine_id', [selectedDevice])
                  .indexRange('date', startdate, enddate)
                  .columns(
                    'machine_id',
                    'date',
                    'product_id',
                    'work_id',
                    'power_minute',
                    'operate_minute',
                    'cutting_minute',
                    'idle_minute',
                    'start_timestamp',
                    'end_timestamp',
                    'total_minute',
                    'standard_minute',
                    'operation_department',
                    'operation_device',
                    'operation_step',
                    'edit_person',
                    'macro_idle_minute_array',
                    'part'
                  )
                // 確認新舊報表要得key
                if (checkIfNewAlarm)
                  hippoInstans.param.addColumns(['alarm_minute'])
                hippoInstans.exhale(function (exhalable) {
                  var pid_oid_key = ''
                  for (var i = 0; i < exhalable.exhalable.length; ++i) {
                    var list = exhalable.exhalable[i]
                    var item = context.buildItem(list)

                    // 解析 macro
                    context.newMacroobj.check = true
                    context.newMacroobj = context.newMacroobj.setData(
                      list.macro_idle_minute_array,
                      context.newMacroobj
                    )
                    context.equipmentDetailColumns =
                      context.newMacroobj.equipmentDetailColumns
                    context.workOrderDetailColumns =
                      context.newMacroobj.equipmentDetailColumns
                    macroKeys = _.keys(context.newMacroobj.data)
                    _.each(macroKeys, function (value) {
                      item[value] = context.newMacroobj.data[value]
                    })
                    // 新報表要加總 alarm 到idle time 要確認他是有值
                    // console.log(checkIfNewAlarm && list.alarm_minute !== undefined);
                    if (checkIfNewAlarm && list.alarm_minute !== undefined) {
                      item.alarm_time = list.alarm_minute
                      item.idle_time += _.isNaN(parseFloat(item.alarm_time))
                        ? 0
                        : parseFloat(item.alarm_time)
                    }
                    productConsumeTime.push(item)
                    pid_oid_key = item.product_id + '@@' + item.work_order_id

                    if (!productConsumeTimeByWorkOrder[pid_oid_key]) {
                      productConsumeTimeByWorkOrder[pid_oid_key] = []
                    }
                    var pitem = context.buildPItem(item)
                    pitem.act_work_time = context._safeDivide(
                      pitem.total_time,
                      item.ext_qty
                    )
                    pitem.work_time_ratio = context._safeDivide(
                      pitem.standard_work_time,
                      item.act_work_time
                    )
                    pitem.ext_qty = context._safeDivide(
                      pitem.total_time,
                      item.standard_work_time
                    )
                    pitem.output_ratio = context._safeDivide(
                      pitem.part_count,
                      item.ext_qty
                    )

                    _.each(macroKeys, function (value) {
                      pitem[value] = context.newMacroobj.data[value]
                    })

                    productConsumeTimeByWorkOrder[pid_oid_key].push(pitem)
                  }
                  productConsumeTime = context.getProductConsumeTime(
                    productConsumeTime,
                    context.equipmentDetailColumns
                  )
                  productConsumeTimeByWorkOrder = commons.getProductConsumeTimeByWorkOrderForPhoneDigiFAC(
                    productConsumeTimeByWorkOrder,
                    macroKeys
                  )

                  _.each(shiftData, function (date) {
                    _.each(date, function (shift) {
                      totalShiftTime += shift.totalMillisecond
                    })
                  })
                  if (_.keys(productConsumeTime).length !== 0) {
                    $('.jarviswidget:gt(3)').find('.fa-minus').click() //collapse last three widgets
                    productConsumeTime.off_time =
                      totalShiftTime / 60000 - productConsumeTime.power_time
                    equipmentTable.clear().rows.add([productConsumeTime]).draw()
                    equipmentDetailTable
                      .clear()
                      .rows.add(
                        commons
                          .objectToKeyValueArray(
                            productConsumeTime,
                            context.equipmentDetailColumns
                          )
                          .reverse()
                      )
                      .draw()
                    workOrderTable
                      .clear()
                      .rows.add(_.values(productConsumeTimeByWorkOrder))
                      .draw()

                    context.drawBarChart(
                      productConsumeTime,
                      context.equipmentColumns,
                      context.$equipmentChart
                    )
                    context.drawBarChart(
                      productConsumeTime,
                      context.equipmentDetailColumns,
                      context.$equipmentDetailChart
                    )
                  } else {
                    commons.noDataAction()
                  }
                })
              },
              fail: function (data) {
                console.log(data)
              },
            }
          )
        })
        context.loadingBtn.done()
      })

      context.$workOrderTable.on('click', 'tr', function (e) {
        e.preventDefault()

        var rowData = workOrderTable.row(this).data()
        var key = rowData.product_id + '@@' + rowData.work_order_id
        var data = productConsumeTimeByWorkOrder[key]

        workOrderOverallTable.clear().rows.add([data]).draw()
        // console.log(context.workOrderDetailColumns,data)
        workOrderDetailTable
          .clear()
          .rows.add(
            commons.objectToKeyValueArray(data, context.workOrderDetailColumns)
          )
          .draw()
        commons.workOrderDetailPieChart(
          data,
          macroKeys,
          context.$workOrderDetailChart
        )
      })

      // context.$stkReportForm.find("[name='device']").val("_L470ERICD01M01");
      // context.$stkReportForm.find("[name='startDate']").val('2018/04/01');
      // context.$stkReportForm.find("[name='endDate']").val('2018/04/20')
    },
    util: {
      $stkReportForm: $('#stk-report-form'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit')),
      $equipmentTable: $('#equipment-table'), //機台閒置
      $equipmentDetailTable: $('#equipment-detail-table'), //機台閒置細節
      $workOrderTable: $('#work-order-table'), //製令閒置
      $workOrderOverallTable: $('#work-order-overall-table'), //製令總覽
      $workOrderDetailTable: $('#work-order-detail-table'), //製令閒置細節
      $equipmentChart: $('#equipment-flot'), //機台閒置
      $equipmentDetailChart: $('#equipment-detail-flot'), //機台閒置細節
      $workOrderDetailChart: $('#stk-pie-chart'),
      $workOrderDetailChartWidget: $('#pie-chart-widget'),
      keyValueTHead: [
        //機台閒置細節, 製令閒置細節
        {
          data: 'column',
          title: `${i18n('Column')}`,
          className: 'text-left',
        },
        {
          data: 'value',
          title: `${i18n('Value')}`,
          className: 'text-right',
          format: {
            type: 'floatMinutesToMS',
          },
        },
      ],
      equipmentColumns: [
        //機台閒置
        {
          data: 'power_time',
          title: `${i18n('Total_Power_Time')}`,
          format: {
            type: 'floatMinutesToMS',
          },
        },
        {
          data: 'operation_time',
          title: `${i18n('Total_Operation_Time')}`,
          format: {
            type: 'floatMinutesToMS',
          },
        },
        {
          data: 'cutting_time',
          title: `${i18n('Total_Cutting_Time')}`,
          format: {
            type: 'floatMinutesToMS',
          },
        },
        {
          data: 'idle_time',
          title: i18n('Total_Downtime'),
          format: {
            type: 'floatMinutesToMS',
          },
        },
      ],
      equipmentDetailColumns: [],
      workOrderColumns: [
        //製令閒置
        {
          data: 'device_id',
          title: `${i18n('Machine')}`,
        },
        {
          data: 'product_id',
          title: `${i18n('N1')}`,
          format: {
            type: 'LAST_IDLE',
          },
          tooltip: `${i18n('N1_Tooltip_peter')}`,
        },
        {
          data: 'work_order_id',
          title: `${i18n('N2')}`,
          format: {
            type: 'LAST_IDLE',
          },
        },
        {
          data: 'M2',
          title: `${i18n('M2')}`,
          format: {
            type: 'floatMinutesToMS',
          },
        },
        {
          data: 'operation_time',
          title: `${i18n('Operation_Time')}`,
          format: {
            type: 'floatMinutesToMS',
          },
        },
        {
          data: 'idle_time',
          title: `${i18n('Downtime')}`,
          format: {
            type: 'floatMinutesToMS',
          },
        },
      ],
      workOrderOverallColumns: [
        //製令總覽
        {
          className: 'details-control',
          data: null,
          orderable: false,
          defaultContent: '',
        }, // for detail control
        {
          data: 'product_id',
          title: `${i18n('N1')}`,
          format: {
            type: 'LAST_IDLE',
          },
        },
        {
          data: 'work_order_id',
          title: `${i18n('N2')}`,
          format: {
            type: 'LAST_IDLE',
          },
        },
        {
          data: 'start_tsp',
          title: `${i18n('Start_Time')}`,
          format: {
            type: 'time',
          },
          dataHide: 'phone,tablet',
        },
        {
          data: 'end_tsp',
          title: `${i18n('End_Time')}`,
          format: {
            type: 'time',
          },
          dataHide: 'phone,tablet',
        },
        {
          data: 'total_time',
          title: `${i18n('Total_Process_Time')}`,
          format: {
            type: 'floatMinutesToMS',
          },
        },
        //{data: "process_department", title: "Processing Department(N4)", dataHide: "phone,tablet"},
        //{data: "process_device", title: "Processing Machine(N5)", dataHide: "phone,tablet"},
        //{data: "process_step", title: "Processing Step(N6)", dataHide: "phone,tablet"},
        //{data: "editor", title: "Editor(7)", dataHide: "phone,tablet"},
        {
          data: 'standard_work_time',
          title: `${i18n('N3_peter')}`,
          dataHide: 'phone',
          format: {
            type: 'floatMinutesToMS',
          },
        },
        {
          data: 'act_work_time',
          title: `${i18n('Act_Work_Time_peter')}`,
          dataHide: 'phone',
          format: {
            type: 'floatMinutesToMS',
          },
          tooltip:
            `${i18n('Total_Process_Time')}` +
            ' / ' +
            `${i18n('Part_Count_peter')}`,
        },
        {
          data: 'work_time_ratio',
          title: `${i18n('Work_Time_Ratiio_peter')}`,
          format: {
            type: 'percentage',
            digit: 2,
          },
          tooltip:
            `${i18n('Act_Work_Time_peter')}` + ' / ' + `${i18n('N3_peter')}`,
        },
        {
          data: 'ext_qty',
          title: `${i18n('Ext_Qty_peter')}`,
          dataHide: 'phone',
        }, //改為N8
        {
          data: 'part_count',
          title: `${i18n('Part_Count_peter')}`,
          dataHide: 'phone',
        },
        {
          data: 'output_ratio',
          title: `${i18n('Achievement_peter')}`,
          format: {
            type: 'percentage',
            digit: 2,
          },
          tooltip:
            `${i18n('Part_Count_peter')}` + ' / ' + `${i18n('Ext_Qty_peter')}`,
        },
      ],
      workOrderDetailColumns: [],
      workShiftObj: {},
      newMacroobj: {
        check: false,
        data: [],
        equipmentDetailColumns: [],
        setData: function (macros, newMacro) {
          newMacro.data = {}
          newMacro.equipmentDetailColumns = []
          var alarm = 0.0
          var m4Index = 0
          macros.split('!').forEach(function (elem, index) {
            //如果是alarm 把它暫存起來 加到M4
            if (elem.split('-')[0] === 'alarm') {
              alarm = elem.split('-')[1]
            } else if (elem !== '') {
              if (elem.split('-')[0] === 'M4') {
                m4Index = elem.split('-')[0]
              }
              newMacro.equipmentDetailColumns.push({
                data: elem.split('-')[0],
                title: i18n(elem.split('-')[0]),
                format: { type: 'floatMinutesToMS' },
              })
              newMacro.data[elem.split('-')[0]] = elem.split('-')[1]
            }
          })
          newMacro.data[m4Index] =
            parseFloat(newMacro.data[m4Index]) + parseFloat(alarm)
          return newMacro
        },
      },
      init: function () {
        $('.datepicker').datepicker()
        $(".datepicker[name='endDate']").val(moment().format('YYYY/MM/DD'))
        $(".datepicker[name='startDate']").val(
          moment().add(-1, 'days').format('YYYY/MM/DD')
        )

        var machineSelectHtml = []
        servkit.eachMachine(function (id, name) {
          machineSelectHtml.push(
            '<option value="' + id + '">' + name + '</option>'
          )
        })
        $('select[name=device]').append(machineSelectHtml.join(''))
      },
      demo: function (context) {
        var $stkReportForm = this.$stkReportForm

        var showdemoConfig
        try {
          showdemoConfig = servkit.showdemoConfig[context.appId][context.funId]
        } catch (e) {
          console.warn(e)
        } finally {
          showdemoConfig = showdemoConfig || {
            startDate: '2016/03/13',
            endDate: '2016/03/15',
            machine: 'Machine01',
          }
        }

        $('#showdemo').on('click', function (e) {
          e.preventDefault()
          $stkReportForm.find('[name=startDate]').val(showdemoConfig.startDate)
          $stkReportForm.find('[name=endDate]').val(showdemoConfig.endDate)
          $stkReportForm.find('[name=device]').val(showdemoConfig.machine)
          $('#submit').click()
        })
      },
      getProductConsumeTime: function (productConsumeTime, macroKeys) {
        var result = {}
        var safePlus = this._safePlus
        _.each(productConsumeTime, function (elem, index) {
          if (index === 0) {
            result = _.extend(result, elem, {
              production_blank: 0,
            })
          } else {
            result.power_time = safePlus(elem.power_time, result.power_time)
            result.operation_time = safePlus(
              elem.operation_time,
              result.operation_time
            )
            result.cutting_time = safePlus(
              elem.cutting_time,
              result.cutting_time
            )
            result.idle_time = safePlus(elem.idle_time, result.idle_time)
            _.each(macroKeys, function (macro) {
              result[macro.data] = safePlus(
                elem[macro.data],
                result[macro.data]
              )
            })
          }
        })

        return result
      },
      drawBarChart: function (productConsumeTime, columns, $chart) {
        var data = _.map(columns, function (elem, index) {
          return [productConsumeTime[elem.data], index]
        })

        $.plot(
          $chart,
          [
            {
              data: data,
              color: '#6595B4',
            },
          ],
          {
            series: {
              bars: {
                show: true,
              },
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
              ticks: _.map(columns, function (elem, index) {
                return [index, elem.title]
              }),
            },
            grid: {
              hoverable: true,
            },
            tooltip: true,
            tooltipOpts: {
              content: '%x.2 M ',
            },
          }
        )
      },
      equipmentExcel: function () {
        var $equipmentTable = this.$equipmentTable
        var $equipmentDetailTable = this.$equipmentDetailTable
        var equipmentDetailColumns = this.equipmentDetailColumns
        //download excel
        servkit.downloadCustomizedExcel($('.equipment-excel-btn'), function () {
          return {
            templateName: 'empty',
            fileName:
              'downtimeAnalysisEquipment_' +
              moment().format('YYYYMMDDHHmmssSSSS'),
            matrices: [
              {
                x: 0,
                y: 0,
                data: [
                  [
                    $('[name=startDate]').val() +
                      ' - ' +
                      $('[name=endDate]').val(),
                    servkit.getMachineName($('[name=device]').val()),
                  ],
                ],
                format: ['text', 'text'],
              },
              {
                x: 0,
                y: 1,
                data: [
                  _.map($equipmentTable.find('th'), function (th) {
                    return $(th).text()
                  }),
                  _.map($equipmentTable.find('td'), function (td) {
                    return $(td).text()
                  }),
                ],
                format: ['text', 'text', 'text', 'text', 'text'],
              },
              {
                x: 0,
                y: 3,
                data: [
                  _.map($equipmentDetailTable.find('td:even'), function (td) {
                    return $(td).text()
                  }).reverse(),
                  _.map($equipmentDetailTable.find('td:odd'), function (td) {
                    return $(td).text()
                  }).reverse(),
                ],
                format: _.times(equipmentDetailColumns.length, function () {
                  return 'text'
                }),
              },
            ],
          }
        })
      },
      _safePlus: function (elemValue, objValue) {
        return isNaN(parseFloat(elemValue))
          ? objValue
          : parseFloat(elemValue) + parseFloat(objValue)
      },
      _safeDivide: function (a, b) {
        if (!parseFloat(a) || !parseFloat(b)) return 0
        else return (a / b).toFixed(4)
      },
      buildItem: function (list) {
        var item = {
          device_id: list.machine_id,
          date: list.date,
          product_id: list.product_id,
          work_order_id: list.work_id,
          power_time: list.power_minute,
          operation_time: list.operate_minute,
          cutting_time: list.cutting_minute,
          idle_time: list.idle_minute,
          start_tsp: list.start_timestamp,
          end_tsp: list.end_timestamp,
          total_time: list.total_minute,
          standard_work_time: list.standard_minute,
          process_department: list.operation_department,
          process_device: list.operation_device,
          process_step: list.operation_step,
          editor: list.edit_person,
          ext_qty: list.part,
        }
        return item
      },
      buildPItem: function (item) {
        return {
          device_id: item.device_id,
          product_id: item.product_id,
          work_order_id: item.work_order_id,
          operation_time: item.operation_time,
          idle_time: item.idle_time,
          start_tsp: item.start_tsp,
          end_tsp: item.end_tsp,
          power_time: item.power_time,
          cutting_time: item.cutting_time,
          total_time: item.total_time,
          process_department: item.process_department,
          process_device: item.process_device,
          process_step: item.process_step,
          editor: item.editor,
          standard_work_time: item.standard_work_time,
          part_count: item.ext_qty,
        }
      },
    },
    delayCondition: ['machineList'],
    preCondition: {
      getKeys: function (done) {
        servkit.ajax(
          {
            url: 'api/hippo/getKeys',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              space: 'fah_product_work',
            }),
          },
          {
            success: function (data) {
              done(data)
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
