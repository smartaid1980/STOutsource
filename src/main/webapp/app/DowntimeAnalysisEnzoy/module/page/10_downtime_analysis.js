import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      servkit.addChartExport('#machineidlehead', '#equipment-flot')
      servkit.addChartExport('#detailidelhead', '#equipment-detail-flot')
      servkit.addChartExport('#piecharthead', '#stk-pie-chart')

      //    var macroObj = context.preCon.getMacroMap;
      var commons = context.commons

      var otherMacroObj
      var productConsumeTime = [], //{}
        productConsumeTimeByWorkOrder = {}, //{product_id@@work_order_id :[{}, ...], ...}
        productConsumeTimeHeader = [
          'device_id',
          'date',
          'product_id',
          'work_order_id',
          'power_time',
          'operation_time', //5
          'cutting_time',
          'idle_time',
          'start_tsp',
          'end_tsp',
          'total_time',
          'standard_work_time',
          'process_department', //12
          'process_device',
          'process_step',
          'editor',
          'ext_qty',
          'M1',
          'M2',
          'M3',
          'M4',
          'M5',
          'M6',
          'M7',
          'M8',
          'M9',
          'M10',
          'M999',
          'part_count',
        ]
      //    _.each(macroObj, function (key, value) {
      //      context.equipmentDetailColumns.push({data: value, title: key, format: {type: "floatMinutesToMS"}});
      //      context.workOrderDetailColumns.push({data: value, title: key, format: {type: "floatMinutesToMS"}});
      //    });
      //    context.equipmentDetailColumns.push({data: "production_blank", title: `${i18n('Production_Blank')}`, format: {type: "floatMinutesToMS"}});

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

      $('#submit').on('click', function (e) {
        e.preventDefault()
        context.loadingBtn.doing()

        otherMacroObj = {}
        var selectedDevice = context.$stkReportForm
          .find("[name='device']")
          .val()
        servkit.ajax(
          {
            url: 'api/getdata/file',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              type: 'product_consume_time2',
              pathPattern: selectedDevice + '/{YYYY}/{MM}/{YYYY}{MM}{DD}.csv',
              startDate: context.$stkReportForm
                .find("[name='startDate']")
                .val(),
              endDate: context.$stkReportForm.find("[name='endDate']").val(),
            }),
          },
          {
            success: function (data) {
              productConsumeTime = _.map(data, function (elem) {
                var partCount = elem.pop()
                var macroArray = parseMacro(elem.pop(), elem)
                return _.object(
                  productConsumeTimeHeader,
                  elem.concat(macroArray, partCount)
                )
              })

              servkit.ajax(
                {
                  url: 'api/getdata/file',
                  type: 'POST',
                  contentType: 'application/json',
                  data: JSON.stringify({
                    type: 'product_consume_time_by_work_order',
                    pathPattern:
                      selectedDevice +
                      '/{productId}/{workOrderId}/{productId}@@{workOrderId}.csv',
                    pathParam: {
                      productId: _.uniq(
                        _.pluck(productConsumeTime, 'product_id')
                      ),
                      workOrderId: _.uniq(
                        _.pluck(productConsumeTime, 'work_order_id')
                      ),
                    },
                  }),
                },
                {
                  success: function (data) {
                    productConsumeTimeByWorkOrder = _.chain(data)
                      .map(function (elem) {
                        var partCount = elem.pop()
                        var macroArray = parseMacro(elem.pop())
                        return _.object(
                          productConsumeTimeHeader,
                          elem.concat(macroArray, partCount)
                        )
                      })
                      .groupBy(function (obj) {
                        return obj.product_id + '@@' + obj.work_order_id
                      })
                      .value()

                    productConsumeTime = context.getProductConsumeTime(
                      productConsumeTime,
                      context.macroKeys
                    )
                    //todo 計算程式應該要把LAST_IDLE歸到下一張工單，整個都錯了QQ  砍掉重練比較快
                    productConsumeTimeByWorkOrder = commons.getProductConsumeTimeByWorkOrder(
                      productConsumeTimeByWorkOrder,
                      context.macroKeys
                    )

                    if (_.keys(productConsumeTime).length !== 0) {
                      $('.jarviswidget:gt(3)').find('.fa-minus').click() //collapse last three widgets
                      equipmentTable
                        .clear()
                        .rows.add([productConsumeTime])
                        .draw()
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

                      //M999(other) tooltip
                      //                        if (_.keys(otherMacroObj).length !== 0) {
                      //                          var otherMacroTooltip = "";
                      //                          _.each(otherMacroObj, function (value, key) {
                      //                            key = key === "MO" ? "others" : key;
                      //                            otherMacroTooltip += key + " : " + servkit.switchDataFormat({type: "floatMinutesToMS"}, value) + "<br>";
                      //                          });
                      //                          context.$equipmentDetailTable.find("td").eq(2)
                      //                              .append("<i class='fa fa-question-circle'></i>")
                      //                              .tooltip({container: "body", html: "true", title: otherMacroTooltip});
                      //                        }
                    } else {
                      commons.noDataAction()
                    }
                    context.loadingBtn.done()
                  },
                  fail: function (data, textStatus) {
                    console.warn(textStatus)
                  },
                }
              )
            },
            fail: function (data, textStatus) {
              console.warn(textStatus)
            },
          }
        )
      })

      context.$workOrderTable.on('click', 'tr', function (e) {
        e.preventDefault()

        var rowData = workOrderTable.row(this).data()
        var key = rowData.product_id + '@@' + rowData.work_order_id
        var data = productConsumeTimeByWorkOrder[key]

        workOrderOverallTable.clear().rows.add([data]).draw()
        workOrderDetailTable
          .clear()
          .rows.add(
            commons.objectToKeyValueArray(data, context.workOrderDetailColumns)
          )
          .draw()
        commons.workOrderDetailPieChart(
          data,
          context.macroKeys,
          context.$workOrderDetailChart
        )
      })

      function parseMacro(macros, productConsumeTimeObj) {
        var macroArray = [],
          macroMap = {},
          //M1, M2, ...M999
          macroId = context.macroKeys,
          otherMacroSum = 0

        //MO-37.90245!M3-12.96068!O834-83.264 => {"M1": "0.000", "O834": "83.264"...}
        macros.split('!').forEach(function (elem) {
          if (elem !== '') {
            macroMap[elem.split('-')[0]] = elem.split('-')[1]
          }
        })

        //沒出現的無效代碼補0
        _.each(macroId, function (elem) {
          if (macroMap[elem]) {
            macroArray.push(macroMap[elem])
          } else {
            macroArray.push('0.000')
          }
        })

        if (productConsumeTimeObj && macros !== '') {
          //for productConsumeTime
          //otherMacroObj = {MO:93.255, O834:83.264}
          //將未定義的 macro 加總到 otherMacroObj 中
          _.each(_.difference(_.keys(macroMap), macroId), function (
            otherMacro
          ) {
            otherMacroSum += parseFloat(macroMap[otherMacro])
            if (!productConsumeTimeObj[2].startsWith('LAST_IDLE'))
              //生產間隔的macro要另外加總，所以不是生產間隔才把macro加到細項中，不然加到others裡面就扣不掉了
              otherMacroObj[otherMacro] = otherMacroObj[otherMacro]
                ? otherMacroObj[otherMacro] + parseFloat(macroMap[otherMacro])
                : parseFloat(macroMap[otherMacro])
          })
        } else if (!productConsumeTimeObj && macros !== '') {
          //for productConsumeTimeByWorkOrder
          _.each(_.difference(_.keys(macroMap), macroId), function (
            otherMacro
          ) {
            otherMacroSum += parseFloat(macroMap[otherMacro])
          })
        }
        //M999 改成其他了，所以直接把不在事先定義的macro的閒置時間規於M999(最後一個macro)裡
        macroArray[macroArray.length - 1] =
          parseFloat(macroArray[macroArray.length - 1]) +
          parseFloat(otherMacroSum)

        return macroArray
      }
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
          tooltip: `${i18n('Macro_Tooltip')}`,
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
          title: `${i18n('Total_Downtime')}`,
          format: {
            type: 'floatMinutesToMS',
          },
        },
      ],
      equipmentDetailColumns: [
        //機台閒置細節
        {
          data: 'M1',
          title: `${i18n('M1')}`,
          format: {
            type: 'floatMinutesToMS',
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
          data: 'M3',
          title: `${i18n('M3')}`,
          format: {
            type: 'floatMinutesToMS',
          },
        },
        {
          data: 'M4',
          title: `${i18n('M4')}`,
          format: {
            type: 'floatMinutesToMS',
          },
        },
        {
          data: 'M5',
          title: `${i18n('M5')}`,
          format: {
            type: 'floatMinutesToMS',
          },
        },
        {
          data: 'M6',
          title: `${i18n('M6')}`,
          format: {
            type: 'floatMinutesToMS',
          },
        },
        {
          data: 'M7',
          title: `${i18n('M7')}`,
          format: {
            type: 'floatMinutesToMS',
          },
        },
        {
          data: 'M8',
          title: `${i18n('M8')}`,
          format: {
            type: 'floatMinutesToMS',
          },
        },
        {
          data: 'M9',
          title: `${i18n('M9')}`,
          format: {
            type: 'floatMinutesToMS',
          },
        },
        {
          data: 'M10',
          title: `${i18n('M10')}`,
          format: {
            type: 'floatMinutesToMS',
          },
        },
        {
          data: 'M999',
          title: `${i18n('M999')}`,
          format: {
            type: 'floatMinutesToMS',
          },
        },
        {
          data: 'production_blank',
          title: `${i18n('Production_Blank')}`,
          format: {
            type: 'floatMinutesToMS',
          },
        },
        //      {data: "production_blank", title: `${i18n('Production_Blank')}`}
      ],
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
          tooltip: `${i18n('N1_Tooltip')}`,
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
        {
          data: 'process_department',
          title: `${i18n('N4')}`,
          dataHide: 'phone,tablet',
        },
        {
          data: 'process_device',
          title: `${i18n('N5')}`,
          dataHide: 'phone,tablet',
        },
        {
          data: 'process_step',
          title: `${i18n('N6')}`,
          dataHide: 'phone,tablet',
        },
        {
          data: 'editor',
          title: `${i18n('N7')}`,
          dataHide: 'phone,tablet',
        },
        {
          data: 'standard_work_time',
          title: `${i18n('N3')}`,
          dataHide: 'phone',
          format: {
            type: 'floatMinutesToMS',
          },
        },
        {
          data: 'act_work_time',
          title: `${i18n('Act_Work_Time')}`,
          dataHide: 'phone',
          format: {
            type: 'floatMinutesToMS',
          },
          tooltip: `${i18n('Total_Process_Time')} / ${i18n('Part_Count')}`,
        },
        {
          data: 'work_time_ratio',
          title: `${i18n('Work_Time_Ratiio')}`,
          format: {
            type: 'percentage',
            digit: 2,
          },
          tooltip: `${i18n('Act_Work_Time')} / ${i18n('N3')}`,
        },
        {
          data: 'ext_qty',
          title: `${i18n('Ext_Qty')}`,
          dataHide: 'phone',
        }, //改為N8
        {
          data: 'part_count',
          title: `${i18n('Part_Count')}`,
          dataHide: 'phone',
        },
        {
          data: 'output_ratio',
          title: `${i18n('Achievement')}`,
          format: {
            type: 'percentage',
            digit: 2,
          },
          tooltip: `${i18n('Part_Count')} / ${i18n('Ext_Qty')}`,
        },
      ],
      workOrderDetailColumns: [
        //製令閒置細節
        {
          data: 'M1',
          title: `${i18n('M1')}`,
          format: {
            type: 'floatMinutesToMS',
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
          data: 'M3',
          title: `${i18n('M3')}`,
          format: {
            type: 'floatMinutesToMS',
          },
        },
        {
          data: 'M4',
          title: `${i18n('M4')}`,
          format: {
            type: 'floatMinutesToMS',
          },
        },
        {
          data: 'M5',
          title: `${i18n('M5')}`,
          format: {
            type: 'floatMinutesToMS',
          },
        },
        {
          data: 'M6',
          title: `${i18n('M6')}`,
          format: {
            type: 'floatMinutesToMS',
          },
        },
        {
          data: 'M7',
          title: `${i18n('M7')}`,
          format: {
            type: 'floatMinutesToMS',
          },
        },
        {
          data: 'M8',
          title: `${i18n('M8')}`,
          format: {
            type: 'floatMinutesToMS',
          },
        },
        {
          data: 'M9',
          title: `${i18n('M9')}`,
          format: {
            type: 'floatMinutesToMS',
          },
        },
        {
          data: 'M10',
          title: `${i18n('M10')}`,
          format: {
            type: 'floatMinutesToMS',
          },
        },
        {
          data: 'M999',
          title: `${i18n('M999')}`,
          format: {
            type: 'floatMinutesToMS',
          },
        },
      ],
      macroKeys: [
        'M1',
        'M2',
        'M3',
        'M4',
        'M5',
        'M6',
        'M7',
        'M8',
        'M9',
        'M10',
        'M999',
      ],
      init: function () {
        $('.datepicker').datepicker()
        $(".datepicker[name='endDate']").val(moment().format('YYYY/MM/DD'))
        $(".datepicker[name='startDate']").val(
          moment().add(-1, 'days').format('YYYY/MM/DD')
        )

        servkit.initSelectWithList(
          this.preCon.getMachineByGroup,
          $('select[name=device]')
        )

        //      var machineSelectHtml = [];
        //      servkit.eachMachine(function (id, name) {
        //        machineSelectHtml.push('<option value="' + id + '">' + name + '</option>');
        //      });
        //      $("select[name=device]").append(machineSelectHtml.join(''));
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
              result[macro] = safePlus(elem[macro], result[macro])
            })
          }

          //如果是生產間隔，要把剛才加到各macro上的時間減回來並
          // 歸類到production_blank，以及otherMacroObj中的細項
          if (elem.product_id.startsWith('LAST_IDLE')) {
            _.each(macroKeys, function (macro) {
              //M1~M999
              if (!isNaN(parseFloat(elem[macro]))) {
                result[macro] =
                  parseFloat(result[macro]) - parseFloat(elem[macro])
                result.production_blank =
                  parseFloat(result.production_blank) + parseFloat(elem[macro])
              }
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
              axisLabel: 'Time(minutes)',
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
                format: ['text', 'text', 'text', 'text'],
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
    },
    delayCondition: ['machineList'],
    preCondition: {
      //    getMacroMap: function (done) {
      //      var macroPath = "app/" + document.location.hash.split('/').slice(1, 4).join("/") + "/macro.json";
      //      $.getJSON(macroPath)
      //          .done(function (macroObj) {
      //            done(macroObj);
      //          })
      //          .fail(function (d, textStatus, error) {
      //            done({});
      //            console.error("getJSON failed, status: " + textStatus + ", error: " + error);
      //          });
      //    },
      getMachineByGroup: function (done) {
        //{machineId1: machineName1, ...}
        this.commons.getMachineByGroup(done)
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
