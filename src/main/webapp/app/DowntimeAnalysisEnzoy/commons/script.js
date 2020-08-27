exports.equipmentOptions = {
  sDom: "t<'dt-toolbar-footer'>",
  paging: false,
}
exports.equipmentDetailOptions = {
  sDom: "t<'dt-toolbar-footer'>",
  paging: false,
}
exports.workOrderOptions = {}
exports.workOrderOverallOptions = {
  sDom: 't',
  paging: false,
}
exports.workOrderDetailOptions = {
  sDom: 't',
  paging: false,
}

exports.objectToKeyValueArray = function (object, columns) {
  //object = {"device_id", "date", "product_id", "work_order_id", "power_time", "operation_time", ...}
  return _.map(columns, function (column) {
    const s1 = 0.017
    return {
      column: column.title,
      value:
        object[column.data] < s1 && object[column.data] > 0
          ? s1
          : object[column.data],
    }
  })
}
var tableCount = 0
exports.growDataTable = function ($table, columns, options, productId2Name) {
  var currTableCount = tableCount++
  var stkToolbarClass = 'stk-toolbar-' + currTableCount
  var showHideColBtn = ''

  var headerCallbackOnce = _.once(function ($thead) {
    _.each(columns, function (elem, index) {
      if (elem.dataHide) {
        $thead.find('th').eq(index).attr('data-hide', elem.dataHide)
      }
      if (elem.tooltip) {
        $thead
          .find('th')
          .eq(index)
          .append("<i class='fa fa-question-circle'></i>")
          .attr('data-original-title', elem.tooltip)
      }
    })
  })

  /***************** render datatable ******************/
  var responsiveHelper,
    breakpointDefinition = {
      tablet: 1024,
      phone: 480,
    }

  return $table.DataTable(
    $.extend(
      {
        sDom:
          "<'dt-toolbar'<'pull-right hidden-xs'<'" +
          stkToolbarClass +
          "'>>r<'pull-right hidden-xs" +
          showHideColBtn +
          "'C><>>" +
          't' +
          "<'dt-toolbar-footer'<'col-sm-6 col-xs-12 hidden-xs'i><'col-xs-12 col-sm-6'p>>",
        ordering: false,
        oColVis: {
          buttonText: 'Show / hide columns',
        },
        headerCallback: function (thead, data, start, end, display) {
          headerCallbackOnce($(thead))
        },
        preDrawCallback: function () {
          // Initialize the responsive datatables helper once.
          try {
            if (!responsiveHelper) {
              responsiveHelper = new ResponsiveDatatablesHelper(
                $table,
                breakpointDefinition
              )
            }
          } catch (e) {
            console.warn(e)
          }
        },
        rowCallback: function (row, data) {
          responsiveHelper.createExpandIcon(row)

          _.each(columns, function (column, index) {
            if (column.format)
              var val = servkit.switchDataFormat(
                column.format,
                data[column.data]
              )
            $(row)
              .find('td')
              .eq(index)
              .html(
                productId2Name !== undefined && column.data == 'product_id'
                  ? productId2Name[val]
                  : val
              )
          })
        },
        drawCallback: function (oSettings) {
          if (this.api().data().length !== 0)
            $table.closest('.jarviswidget').find('.fa-plus').click()
          responsiveHelper.respond()
          $table.find('th').tooltip({
            container: 'body',
            html: 'true',
          })
        },
      },
      options,
      { columns: columns }
    )
  )
}

exports.getProductConsumeTimeByWorkOrder = function (
  groupedData,
  macroKeys,
  byWorkOrder
) {
  function _safePlus(elemValue, objValue) {
    return isNaN(parseFloat(elemValue))
      ? objValue
      : parseFloat(elemValue) + parseFloat(objValue)
  }

  function _saveDivide(numerator, denominator) {
    //分子非數字 || 分母非數字 || 分母=0
    if (!parseFloat(numerator) || !parseFloat(denominator)) return 0
    else return numerator / denominator
  }

  //["device_id","date","product_id","work_order_id","power_time","operation_time","cutting_time","idle_time","start_tsp",
  // "end_tsp","total_time","standard_work_time","process_department","process_device","process_step","editor","ext_qty",
  // "M1","M2","M3","M4","M5","M6","M7","M8","M9","M10","M999","part_count"];
  var productConsumeTimeByWorkOrder = {}
  //{product_id@@work_order_id :[{}, ...], ...}
  _.each(groupedData, function (elem, key) {
    if (byWorkOrder && key.startsWith('LAST_IDLE')) {
      return true
    }
    //        //TODO:如果不在查詢區間內的生產間隔不要show的話再過濾
    //        if(key.startsWith("LAST_IDLE") && formJSON.startDate[0])
    //          return true;
    var tempObj = $.extend({}, elem[0])
    tempObj.device_id = servkit.getMachineName(tempObj.device_id)
    _.each(_.rest(elem), function (arrays) {
      //N3 如果N3~N8是"---"的話  有可能是忘了填，預設用上一張工單的資料替代
      tempObj.standard_work_time =
        arrays.standard_work_time === '---'
          ? tempObj.standard_work_time
          : arrays.standard_work_time
      //N4
      tempObj.process_department =
        arrays.process_department === '---'
          ? tempObj.process_department
          : arrays.process_department
      //N5
      tempObj.process_device =
        arrays.process_device === '---'
          ? tempObj.process_device
          : arrays.process_device
      //N6
      tempObj.process_step =
        arrays.process_step === '---'
          ? tempObj.process_step
          : arrays.process_step
      //N7
      tempObj.editor = arrays.editor === '---' ? tempObj.editor : arrays.editor
      //N8
      tempObj.ext_qty =
        arrays.ext_qty === '---' ? tempObj.ext_qty : arrays.ext_qty

      tempObj.power_time = _safePlus(arrays.power_time, tempObj.power_time)
      tempObj.operation_time = _safePlus(
        arrays.operation_time,
        tempObj.operation_time
      )
      tempObj.cutting_time = _safePlus(
        arrays.cutting_time,
        tempObj.cutting_time
      )
      tempObj.idle_time = _safePlus(arrays.idle_time, tempObj.idle_time)
      tempObj.part_count = _safePlus(arrays.part_count, tempObj.part_count)
      _.each(macroKeys, function (macro) {
        tempObj[macro] = _safePlus(arrays[macro], tempObj[macro])
      })
    })
    tempObj.total_time = _safePlus(tempObj.M2, tempObj.operation_time)
    tempObj.start_tsp = elem[0].start_tsp
    tempObj.end_tsp = _.last(elem).end_tsp
    //實際工時(總生產時間/產量)
    tempObj.act_work_time = _saveDivide(tempObj.total_time, tempObj.part_count)
    //實際工時/標準工時
    tempObj.work_time_ratio = _saveDivide(
      tempObj.standard_work_time,
      tempObj.act_work_time
    )
    //產量/預期顆數
    tempObj.output_ratio = _saveDivide(tempObj.part_count, tempObj.ext_qty)

    productConsumeTimeByWorkOrder[key] = tempObj
  })

  return productConsumeTimeByWorkOrder
}

exports.getProductConsumeTimeByWorkOrderForPhone = function (
  groupedData,
  macroKeys,
  byWorkOrder
) {
  function _safePlus(elemValue, objValue) {
    return isNaN(parseFloat(elemValue))
      ? objValue
      : parseFloat(elemValue) + parseFloat(objValue)
  }

  function _saveDivide(numerator, denominator) {
    //分子非數字 || 分母非數字 || 分母=0
    if (!parseFloat(numerator) || !parseFloat(denominator)) return 0
    else return numerator / denominator
  }

  //["device_id","date","product_id","work_order_id","power_time","operation_time","cutting_time","idle_time","start_tsp",
  // "end_tsp","total_time","standard_work_time","process_department","process_device","process_step","editor","ext_qty",
  // "M1","M2","M3","M4","M5","M6","M7","M8","M9","M10","M999","part_count"];
  var productConsumeTimeByWorkOrder = {}
  //{product_id@@work_order_id :[{}, ...], ...}
  _.each(groupedData, function (elem, key) {
    if (byWorkOrder && key.startsWith('LAST_IDLE')) {
      return true
    }
    //        //TODO:如果不在查詢區間內的生產間隔不要show的話再過濾
    //        if(key.startsWith("LAST_IDLE") && formJSON.startDate[0])
    //          return true;
    var tempObj = $.extend({}, elem[0])
    _.each(_.rest(elem), function (arrays) {
      //N3 如果N3~N8是"---"的話  有可能是忘了填，預設用上一張工單的資料替代
      tempObj.standard_work_time =
        arrays.standard_work_time === '---'
          ? tempObj.standard_work_time
          : arrays.standard_work_time
      //N4
      tempObj.process_department =
        arrays.process_department === '---'
          ? tempObj.process_department
          : arrays.process_department
      //N5
      tempObj.process_device =
        arrays.process_device === '---'
          ? tempObj.process_device
          : arrays.process_device
      //N6
      tempObj.process_step =
        arrays.process_step === '---'
          ? tempObj.process_step
          : arrays.process_step
      //N7
      tempObj.editor = arrays.editor === '---' ? tempObj.editor : arrays.editor
      //N8
      tempObj.ext_qty =
        arrays.ext_qty === '---' ? tempObj.ext_qty : arrays.ext_qty

      tempObj.power_time = _safePlus(arrays.power_time, tempObj.power_time)
      tempObj.operation_time = _safePlus(
        arrays.operation_time,
        tempObj.operation_time
      )
      tempObj.cutting_time = _safePlus(
        arrays.cutting_time,
        tempObj.cutting_time
      )
      tempObj.idle_time = _safePlus(arrays.idle_time, tempObj.idle_time)
      tempObj.part_count = _safePlus(arrays.part_count, tempObj.part_count)
      tempObj.total_time = _safePlus(arrays.total_time, tempObj.total_time)
      _.each(macroKeys, function (macro) {
        tempObj[macro] = _safePlus(arrays[macro], tempObj[macro])
      })
    })

    tempObj.start_tsp = elem[0].start_tsp
    tempObj.end_tsp = _.last(elem).end_tsp
    //實際工時(總生產時間/產量)
    tempObj.act_work_time = _saveDivide(tempObj.total_time, tempObj.part_count)
    //實際工時/標準工時
    tempObj.work_time_ratio = _saveDivide(
      tempObj.standard_work_time,
      tempObj.act_work_time
    )
    //產量/預期顆數
    tempObj.output_ratio = _saveDivide(tempObj.part_count, tempObj.ext_qty)

    productConsumeTimeByWorkOrder[key] = tempObj
  })

  return productConsumeTimeByWorkOrder
}

exports.getProductConsumeTimeByWorkOrderForPhoneDigiFAC = function (
  groupedData,
  macroKeys,
  byWorkOrder
) {
  function _safePlus(elemValue, objValue) {
    const a = isNaN(parseFloat(elemValue)) ? 0.0 : parseFloat(elemValue)
    const b = isNaN(parseFloat(objValue)) ? 0.0 : parseFloat(objValue)
    return a + b
  }

  function _saveDivide(numerator, denominator) {
    //分子非數字 || 分母非數字 || 分母=0
    if (!parseFloat(numerator) || !parseFloat(denominator)) return 0
    else return numerator / denominator
  }
  //["device_id","date","product_id","work_order_id","power_time","operation_time","cutting_time","idle_time","start_tsp",
  // "end_tsp","total_time","standard_work_time","process_department","process_device","process_step","editor","ext_qty",
  // "M1","M2","M3","M4","M5","M6","M7","M8","M9","M10","M999","part_count"];
  var productConsumeTimeByWorkOrder = {}
  //{product_id@@work_order_id :[{}, ...], ...}
  _.each(groupedData, function (elem, key) {
    // console.log(`----------------${key}----------------`)

    if (byWorkOrder && key.startsWith('LAST_IDLE')) {
      return true
    }
    //        //TODO:如果不在查詢區間內的生產間隔不要show的話再過濾
    //        if(key.startsWith("LAST_IDLE") && formJSON.startDate[0])
    //          return true;
    var tempObj = $.extend({}, elem[0])
    tempObj.device_id = servkit.getMachineName(tempObj.device_id)
    _.each(_.rest(elem), function (arrays) {
      //N3 如果N3~N8是"---"的話  有可能是忘了填，預設用上一張工單的資料替代
      tempObj.standard_work_time =
        arrays.standard_work_time === '---'
          ? tempObj.standard_work_time
          : arrays.standard_work_time
      //N4
      tempObj.process_department =
        arrays.process_department === '---'
          ? tempObj.process_department
          : arrays.process_department
      //N5
      tempObj.process_device =
        arrays.process_device === '---'
          ? tempObj.process_device
          : arrays.process_device
      //N6
      tempObj.process_step =
        arrays.process_step === '---'
          ? tempObj.process_step
          : arrays.process_step
      //N7
      tempObj.editor = arrays.editor === '---' ? tempObj.editor : arrays.editor
      //N8
      // tempObj.ext_qty = _safePlus(arrays.ext_qty, tempObj.ext_qty); //arrays.ext_qty === "---" ? tempObj.ext_qty : arrays.ext_qty;

      tempObj.power_time = _safePlus(arrays.power_time, tempObj.power_time)
      tempObj.operation_time = _safePlus(
        arrays.operation_time,
        tempObj.operation_time
      )
      tempObj.cutting_time = _safePlus(
        arrays.cutting_time,
        tempObj.cutting_time
      )
      tempObj.idle_time = _safePlus(arrays.idle_time, tempObj.idle_time)
      tempObj.part_count = _safePlus(arrays.part_count, tempObj.part_count)
      tempObj.total_time = _safePlus(arrays.total_time, tempObj.total_time)
      // console.log(`total time : ${tempObj.total_time}`)
      _.each(macroKeys, function (macro) {
        tempObj[macro] = _safePlus(arrays[macro], tempObj[macro])
      })
    })
    tempObj.ext_qty = _saveDivide(
      tempObj.total_time,
      tempObj.standard_work_time
    ).toFixed(2)
    tempObj.start_tsp = elem[0].start_tsp
    tempObj.end_tsp = _.last(elem).end_tsp
    //實際工時(總生產時間/產量)
    tempObj.act_work_time = _saveDivide(tempObj.total_time, tempObj.part_count)
    //實際工時/標準工時
    tempObj.work_time_ratio = _saveDivide(
      tempObj.standard_work_time,
      tempObj.act_work_time
    )
    //產量/預期顆數
    tempObj.output_ratio = _saveDivide(tempObj.part_count, tempObj.ext_qty)

    productConsumeTimeByWorkOrder[key] = tempObj
  })

  return productConsumeTimeByWorkOrder
}

exports.getProductConsumeTime = function (productConsumeTime, macroKeys) {
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
      result.cutting_time = safePlus(elem.cutting_time, result.cutting_time)
      result.idle_time = safePlus(elem.idle_time, result.idle_time)
      _.each(macroKeys, function (macro) {
        result[macro.data] = safePlus(elem[macro.data], result[macro.data])
      })
    }
  })
  // 修正精度誤差的問題 讓他不能突破盲腸
  let totalMacroS = 0.0
  let mKey = ''
  let mTime = 0.0
  _.each(macroKeys, (key) => {
    totalMacroS = safePlus(Math.floor(result[key.data] * 60), totalMacroS)
    if (result[key.data] > mTime) {
      mKey = key.data
      mTime = result[key.data]
    }
  })
  const diff = result.idle_time * 60 - totalMacroS
  if (diff > 0) {
    result[mKey] = safePlus(mTime, (diff / 60).toFixed(5))
  }
  //test
  let hour = 0.0
  let minute = 0.0
  _.each(macroKeys, (key) => {
    hour += Math.floor(result[key.data])
    minute += result[key.data] % 1
  })
  // console.log(`idle = ${result.idle_time} ,hour = ${hour}, minute = ${minute}`)
  return result
}

exports.workOrderDetailPieChart = function (
  productIdWorkOrderData,
  macroKeys,
  $chart
) {
  var otherTime = productIdWorkOrderData.idle_time,
    //    macro = ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "M9", "M10", "M999"],//, "others"
    data = []

  _.each(macroKeys, function (macro) {
    var obj = {}
    obj.label = macro
    obj.data = productIdWorkOrderData[macro]
    otherTime -= parseFloat(productIdWorkOrderData[macro])
    data.push(obj)
  })
  // console.log("otherTime");
  // console.log(Math.round(otherTime));

  if (
    _.some(data, function (elem) {
      return elem.data != 0
    })
  ) {
    $chart.closest('.jarviswidget').find('.fa-plus').click() //打開來畫圖
  } else {
    $chart.closest('.jarviswidget').find('.fa-minus').click() //關起來不show圖
  }

  $.plot($chart, data, {
    series: {
      pie: {
        show: true,
        innerRadius: 0.5,
        radius: 1,
        label: {
          show: true,
          radius: 0.8,
          formatter: function (label, series) {
            if (series.percent > 4) {
              return (
                '<div style="font-size:11px;text-align:center;padding:4px;">' +
                series.label +
                '<br/>' +
                series.percent.toFixed(2) +
                '%</div>'
              )
            } else if (series.percent > 0.1) {
              return (
                '<div style="font-size:11px;text-align:center;padding:4px;">' +
                series.label +
                '</div>'
              )
            } else {
              return ''
            }
          },
        },
      },
    },
    legend: {
      show: true,
      noColumns: 1, // number of colums in legend table
      labelFormatter: function (label, series) {
        // fn: string -> string
        // series is the series object for the label
        if (_.isNaN(series.percent)) {
          return '<div></div>' + label + '  :    ' + 0.0 + '%'
        }
        return (
          '<div></div>' + label + '  :    ' + series.percent.toFixed(2) + '%'
        )
      },
      labelBoxBorderColor: null, // border color for the little label boxes
      container: null, // container (as jQuery object) to put legend in, null means default on top of graph
      position: 'ne', // position of default legend container within plot
      margin: [5, 10], // distance from grid edge to default legend container within plot
      backgroundColor: '#efefef', // null means auto-detect
      backgroundOpacity: 1, // set to 0 to avoid background
    },
    grid: {
      hoverable: true,
    },
    tooltip: true,
    tooltipOpts: {
      content: '%y.2 M ',
    },
  })
  $('.legendColorBox').switchClass('legendColorBox', 'legendColorBoxs')
}

exports.workOrderExcel = function (workOrderTable) {
  var $workOrderTable = $('#work-order-table')
  var ctx = this
  servkit.downloadCustomizedExcel($('.work-order-excel-btn'), function () {
    return {
      templateName: 'empty',
      fileName:
        'downtimeAnalysisWorkOrder_' + moment().format('YYYYMMDDHHmmssSSSS'),
      matrices: (function () {
        var result = [
          {
            x: 0,
            y: 1,
            data: [_.map($workOrderTable.find('th'), (th) => $(th).text())],
            format: _.map($workOrderTable.find('th'), () => 'text'),
          },
          {
            x: 0,
            y: 2,
            data:
              $workOrderTable.find('th').length === 6
                ? _.map(workOrderTable.data(), (elem) => {
                    return [
                      servkit.getMachineName(elem.device_id),
                      elem.product_id,
                      elem.work_order_id,
                      servkit.switchDataFormat(
                        { type: 'floatMinutesToMS' },
                        elem.M2
                      ),
                      servkit.switchDataFormat(
                        { type: 'floatMinutesToMS' },
                        elem.operation_time
                      ),
                      servkit.switchDataFormat(
                        { type: 'floatMinutesToMS' },
                        elem.idle_time
                      ),
                    ]
                  })
                : _.map(workOrderTable.data(), (elem) => {
                    return [
                      servkit.getMachineName(elem.device_id),
                      elem.product_id,
                      elem.work_order_id,
                      elem.start_tsp.includes('/')
                        ? elem.start_tsp
                        : moment(elem.start_tsp, 'YYYYMMDDHHmmss').format(
                            'YYYY/MM/DD HH:mm:ss'
                          ),
                      elem.end_tsp.includes('/')
                        ? elem.end_tsp
                        : moment(elem.end_tsp, 'YYYYMMDDHHmmss').format(
                            'YYYY/MM/DD HH:mm:ss'
                          ),
                      servkit.switchDataFormat(
                        { type: 'floatMinutesToMS' },
                        elem.M2
                      ),
                      servkit.switchDataFormat(
                        { type: 'floatMinutesToMS' },
                        elem.power_time
                      ),
                      servkit.switchDataFormat(
                        { type: 'floatMinutesToMS' },
                        elem.operation_time
                      ),
                      servkit.switchDataFormat(
                        { type: 'floatMinutesToMS' },
                        elem.idle_time
                      ),
                      servkit.switchDataFormat(
                        { type: 'floatMinutesToMS' },
                        elem.standard_work_time
                      ),
                      servkit.switchDataFormat(
                        { type: 'floatMinutesToMS' },
                        elem.act_work_time
                      ),
                      servkit.switchDataFormat(
                        { type: 'percentage', digit: 2 },
                        elem.work_time_ratio
                      ),
                      elem.ext_qty,
                      elem.part_count,
                      servkit.switchDataFormat(
                        { type: 'percentage', digit: 2 },
                        elem.output_ratio
                      ),
                      elem.editor,
                    ]
                  }),
            format: _.times($workOrderTable.find('th').length, () => 'text'),
          },
        ]

        if (
          $('[name=startDate]').length !== 0 &&
          $('[name=device]').val().length < 2
        ) {
          result = result.concat([
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
          ])
        }

        console.log(result)
        return result
      })(),
    }
  })
}

exports.workOrderOverallExcel = function (workOrderOverallTable) {
  var $workOrderOverallTable = $('#work-order-overall-table')
  servkit.downloadCustomizedExcel(
    $('.work-order-overall-excel-btn'),
    function () {
      if (!$('#workoveralldetail').length) {
        // 小table 要幫他打開才會連N4~N7都下載到
        $workOrderOverallTable.find('tbody td:first').click()
      }
      return {
        templateName: 'empty',
        fileName:
          'downtimeAnalysisWorkOrderOverall_' +
          moment().format('YYYYMMDDHHmmssSSSS'),
        matrices: [
          {
            x: 0,
            y: 0,
            data: [
              _.map(
                $workOrderOverallTable.find('th:not(:first)'),
                (th) => th.textContent
              ),
            ], // 去掉第一個因為是空格
            format: _.times(
              $workOrderOverallTable.find('th:not(:first)').length,
              () => 'text'
            ),
          },
          {
            x: 0,
            y: 1,
            data: _.map(workOrderOverallTable.data(), (elem) => [
              elem.product_id,
              elem.work_order_id,
              elem.start_tsp.includes('/')
                ? elem.start_tsp
                : moment(elem.start_tsp, 'YYYYMMDDHHmmss').format(
                    'YYYY/MM/DD HH:mm:ss'
                  ),
              elem.end_tsp.includes('/')
                ? elem.end_tsp
                : moment(elem.end_tsp, 'YYYYMMDDHHmmss').format(
                    'YYYY/MM/DD HH:mm:ss'
                  ),
              servkit.switchDataFormat(
                { type: 'floatMinutesToMS' },
                elem.power_time
              ),
              servkit.switchDataFormat(
                { type: 'floatMinutesToMS' },
                elem.standard_work_time
              ),
              servkit.switchDataFormat(
                { type: 'floatMinutesToMS' },
                elem.act_work_time
              ),
              servkit.switchDataFormat(
                { type: 'percentage', digit: 2 },
                elem.work_time_ratio
              ),
              elem.ext_qty,
              elem.part_count,
              servkit.switchDataFormat(
                { type: 'percentage', digit: 2 },
                elem.output_ratio
              ),
              elem.process_department,
              elem.process_device,
              elem.process_step,
              elem.editor,
            ]),
            format: _.times(
              $workOrderOverallTable.find('th:not(:first)').length,
              () => 'text'
            ),
          },
        ],
      }
    }
  )
}

exports.workOrderDetailExcel = function (workOrderDetailTable) {
  var $workOrderOverallTable = $('#work-order-overall-table')
  var $workOrderDetailTable = $('#work-order-detail-table')
  servkit.downloadCustomizedExcel(
    $('.work-order-detail-excel-btn'),
    function () {
      return {
        templateName: 'empty',
        fileName:
          'downtimeAnalysisWorkOrderOverall_' +
          moment().format('YYYYMMDDHHmmssSSSS'),
        matrices: [
          {
            x: 0,
            y: 0,
            data: [
              [
                $workOrderOverallTable.find('th').eq(0).text(),
                $workOrderOverallTable.find('td').eq(0).text(),
                $workOrderOverallTable.find('th').eq(1).text(),
                $workOrderOverallTable.find('td').eq(1).text(),
              ],
            ],
            format: ['text', 'text', 'text', 'text'],
          },
          {
            x: 0,
            y: 1,
            data: _.map($workOrderDetailTable.find('tr'), function (tr) {
              return [
                $(tr).find('th, td').eq(0).text(),
                $(tr).find('th, td').eq(1).text(),
              ]
            }),
            format: ['text', 'text'],
          },
        ],
      }
    }
  )
}

exports.noDataAction = function () {
  $('.jarviswidget:gt(0)').find('.fa-minus').click() //collapse all widgets
  // 佈署查無資料時的提示視窗
  if ($('#dialog-no-data').length === 0) {
    $('#content').append(
      $('<div id="dialog-no-data" title="Dialog No Data"></div>')
    )
    $('#dialog-no-data').dialog({
      autoOpen: false,
      width: 200,
      resizable: false,
      modal: true,
      title: 'No Data',
      buttons: [
        {
          html: '<i class="fa fa-frown-o"></i>&nbsp; OK',
          class: 'btn btn-default',
          click: function () {
            $(this).dialog('close')
          },
        },
      ],
    })
  }

  // 顯示提示
  $('#dialog-no-data').dialog('open')
}

exports.macroMap = (function () {
  var macroMap = null
  return function (done) {
    if (macroMap) {
      done(macroMap)
    } else {
      servkit.ajax(
        {
          url: 'api/v3/macro/config/read',
          type: 'GET',
        },
        {
          success: function (data) {
            macroMap = _.chain(data)
              .indexBy('macro_code')
              .mapObject((value) => value.macro_code_name)
              .value()
            done(macroMap)
          },
          fail: function (error) {
            console.warn(error)
            done(macroMap)
          },
        }
      )
    }
  }
})()
