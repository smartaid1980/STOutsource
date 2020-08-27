// 將 utilization_time_work_shift 和 part_count_merged 混搭出來的資料整理成「日期」報表
exports.composeDayReport = function (
  startDate,
  endDate,
  machineList,
  callback,
  cbincb
) {
  hippo
    .newMashupExhaler()
    .space('utilization_time_work_shift:utws')
    .index('machine_id', machineList)
    .indexRange('date', startDate, endDate)

    .space('part_count_merged:pcm')
    .index('machine_id', machineList)
    .indexRange('date', startDate, endDate)

    .column('utws', 'machine_id')
    .column('utws', 'date')
    .column('utws', 'work_shift')
    .column('utws', 'power_millisecond')
    .column('utws', 'operate_millisecond')
    .column('utws', 'cutting_millisecond')
    .column('utws', 'idle_millisecond')
    .column('utws', 'alarm_millisecond')
    .column('utws', 'work_shift_millisecond')

    .column('pcm', 'part_count')
    .column('pcm', 'operate_millisecond')

    .mashupKey('machine_id', 'date', 'work_shift')
    .exhale(function (exhalable) {
      if (cbincb) {
        callback(exhalable, cbincb)
      } else {
        callback(exhalable)
      }
    })
}

exports.composeMonthReport = function (
  startDate,
  endDate,
  machineList,
  callback,
  cbincb
) {
  hippo
    .newMashupExhaler()
    .space('utilization_month:utws')
    .index('machine_id', machineList)
    .indexRange('date', startDate, endDate)

    .space('part_count_monthly:pcm')
    .index('machine_id', machineList)
    .indexRange('date', startDate, endDate)

    .column('utws', 'machine_id')
    .column('utws', 'date')
    .column('utws', 'power_millisecond')
    .column('utws', 'operate_millisecond')
    .column('utws', 'cutting_millisecond')
    .column('utws', 'idle_millisecond')
    .column('utws', 'alarm_millisecond')
    .column('utws', 'work_shift_millisecond')

    .column('pcm', 'part_count')
    .column('pcm', 'operate_millisecond')

    .mashupKey('machine_id', 'date')
    .exhale(function (exhalable) {
      if (cbincb) {
        callback(exhalable, cbincb)
      } else {
        callback(exhalable)
      }
    })
}

exports.composeDayReportACHB = function (
  startDate,
  endDate,
  machineList,
  callback,
  cbincb
) {
  hippo
    .newMashupExhaler()
    .space('utilization_time_work_shift:utws')
    .index('machine_id', machineList)
    .indexRange('date', startDate, endDate)

    .space('part_count_merged:pcm')
    .index('machine_id', machineList)
    .indexRange('date', startDate, endDate)

    .space('utilization_invalid_time_work_shift:uitws')
    .index('machine_id', machineList)
    .indexRange('date', startDate, endDate)

    .column('utws', 'machine_id')
    .column('utws', 'date')
    .column('utws', 'work_shift')
    .column('utws', 'power_millisecond')
    .column('utws', 'operate_millisecond')
    .column('utws', 'cutting_millisecond')
    .column('utws', 'idle_millisecond')
    .column('utws', 'alarm_millisecond')
    .column('utws', 'work_shift_millisecond')

    .column('pcm', 'part_count')
    .column('pcm', 'operate_millisecond')

    .column('uitws', 'invalid_millisecond')
    .column('uitws', 'operate_duration')
    .column('uitws', 'other_duration')

    .mashupKey('machine_id', 'date', 'work_shift')
    .exhale(function (exhalable) {
      if (cbincb) {
        callback(exhalable, cbincb)
      } else {
        callback(exhalable)
      }
    })
}

exports.composeDayReportCallBack = function (exhalable, callback) {
  var resultGroups = {}
  exhalable.each(function (data, groupKeys) {
    var timeData = data.utws[0],
      groupKey = timeData.machine_id + timeData.date,
      resultGroup = resultGroups[groupKey]

    if (resultGroup) {
      resultGroup.power_millisecond += timeData.power_millisecond
      resultGroup.operate_millisecond += timeData.operate_millisecond
      resultGroup.cutting_millisecond += timeData.cutting_millisecond
      resultGroup.idle_millisecond += timeData.idle_millisecond
      resultGroup.alarm_millisecond += timeData.alarm_millisecond
      resultGroup.work_shift_millisecond += timeData.work_shift_millisecond
      resultGroup.part_count += data.pcm.length
    } else {
      resultGroup = _.pick(
        timeData,
        'machine_id',
        'date',
        'power_millisecond',
        'operate_millisecond',
        'cutting_millisecond',
        'idle_millisecond',
        'alarm_millisecond',
        'work_shift_millisecond'
      )
      resultGroup.part_count = data.pcm.length
      resultGroups[groupKey] = resultGroup
    }
  })

  var operSum = 0
  var cutSum = 0
  var denominatorSum = 0

  var result = _.chain(resultGroups)
    .values()
    .map(function (timeData) {
      timeData = millisecondExcludMillisecond(timeData)

      operSum += timeData.operate_millisecond
      cutSum += timeData.cutting_millisecond
      denominatorSum += getDenominator(timeData)
      var brand = servkit.getMachineBrand(timeData.machine_id)
      return [
        servkit.getMachineName(timeData.machine_id),
        timeData.date.date8BitsToSlashed(),
        timeData.power_millisecond.millisecondToHHmmss(),
        timeData.operate_millisecond.millisecondToHHmmss(),
        brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
          ? 'N.A.'
          : timeData.cutting_millisecond.millisecondToHHmmss(),
        (
          timeData.idle_millisecond + timeData.alarm_millisecond
        ).millisecondToHHmmss(),
        brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
          ? 'N.A.'
          : timeData.part_count,
        (
          timeData.operate_millisecond / getDenominator(timeData)
        ).floatToPercentage(),
        brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
          ? 'N.A.'
          : (
              timeData.cutting_millisecond / getDenominator(timeData)
            ).floatToPercentage(),
      ]
    })
    .value()

  callback(result, operSum, cutSum, denominatorSum)
}

exports.composeMonthReportCallBack = function (exhalable, callback) {
  var resultGroups = {}
  exhalable.each(function (data, groupKeys) {
    var timeData = data.utws[0],
      groupKey = timeData.machine_id + timeData.date,
      resultGroup = resultGroups[groupKey]

    if (resultGroup) {
      resultGroup.power_millisecond += timeData.power_millisecond
      resultGroup.operate_millisecond += timeData.operate_millisecond
      resultGroup.cutting_millisecond += timeData.cutting_millisecond
      resultGroup.idle_millisecond += timeData.idle_millisecond
      resultGroup.alarm_millisecond += timeData.alarm_millisecond
      resultGroup.work_shift_millisecond += timeData.work_shift_millisecond
      resultGroup.part_count += data.pcm.length
    } else {
      resultGroup = _.pick(
        timeData,
        'machine_id',
        'date',
        'power_millisecond',
        'operate_millisecond',
        'cutting_millisecond',
        'idle_millisecond',
        'alarm_millisecond',
        'work_shift_millisecond'
      )
      resultGroup.part_count = data.pcm.length
      resultGroups[groupKey] = resultGroup
    }
  })

  var operSum = 0
  var cutSum = 0
  var denominatorSum = 0

  var result = _.chain(resultGroups)
    .values()
    .map(function (timeData) {
      timeData = millisecondExcludMillisecond(timeData)

      operSum += timeData.operate_millisecond
      cutSum += timeData.cutting_millisecond
      denominatorSum += getDenominator(timeData)
      var brand = servkit.getMachineBrand(timeData.machine_id)
      return [
        servkit.getMachineName(timeData.machine_id),
        timeData.date.date8BitsToSlashed(),
        timeData.power_millisecond.millisecondToHHmmss(),
        timeData.operate_millisecond.millisecondToHHmmss(),
        brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
          ? 'N.A.'
          : timeData.cutting_millisecond.millisecondToHHmmss(),
        (
          timeData.idle_millisecond + timeData.alarm_millisecond
        ).millisecondToHHmmss(),
        brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
          ? 'N.A.'
          : timeData.part_count,
        (
          timeData.operate_millisecond / getDenominator(timeData)
        ).floatToPercentage(),
        brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
          ? 'N.A.'
          : (
              timeData.cutting_millisecond / getDenominator(timeData)
            ).floatToPercentage(),
      ]
    })
    .value()

  callback(result, operSum, cutSum, denominatorSum)
}

exports.composeDayReportCallBackACHB = function (exhalable, callback) {
  var resultGroups = {}
  var result = []

  exhalable.each(function (data, groupKeys) {
    var timeData = data.utws[0]
    if (timeData) {
      var invalid_millisecond =
        data.uitws[0] && _.isNumber(data.uitws[0].invalid_millisecond)
          ? data.uitws[0].invalid_millisecond
          : 0
      var operate_duration =
        data.uitws[0] && _.isNumber(data.uitws[0].operate_duration)
          ? data.uitws[0].operate_duration
          : 0
      var other_duration =
        data.uitws[0] && _.isNumber(data.uitws[0].other_duration)
          ? data.uitws[0].other_duration
          : 0
      var groupKey = timeData.machine_id + timeData.date
      var resultGroup = resultGroups[groupKey]

      if (resultGroup) {
        resultGroup.power_millisecond += timeData.power_millisecond
        resultGroup.operate_millisecond += timeData.operate_millisecond
        resultGroup.cutting_millisecond += timeData.cutting_millisecond
        resultGroup.idle_millisecond += timeData.idle_millisecond
        resultGroup.alarm_millisecond += timeData.alarm_millisecond
        resultGroup.work_shift_millisecond += timeData.work_shift_millisecond
        resultGroup.invalid_millisecond += invalid_millisecond
        resultGroup.operate_duration += operate_duration
        resultGroup.other_duration += other_duration
        resultGroup.part_count += data.pcm.length
      } else {
        resultGroup = _.pick(
          timeData,
          'machine_id',
          'date',
          'power_millisecond',
          'operate_millisecond',
          'cutting_millisecond',
          'idle_millisecond',
          'alarm_millisecond',
          'work_shift_millisecond'
        )
        resultGroup.invalid_millisecond = invalid_millisecond
        resultGroup.operate_duration = operate_duration
        resultGroup.other_duration = other_duration
        resultGroup.part_count = data.pcm.length
        resultGroups[groupKey] = resultGroup
      }
    }
  })

  result = _.chain(resultGroups)
    .values()
    .map(function (timeData) {
      timeData = millisecondExcludMillisecond(timeData)
      var date = timeData.date.date8BitsToSlashed()
      return [
        servkit.getMachineName(timeData.machine_id),
        date,
        timeData.power_millisecond.millisecondToHHmmss(),
        timeData.operate_millisecond.millisecondToHHmmss(),
        timeData.cutting_millisecond.millisecondToHHmmss(),
        (
          timeData.idle_millisecond + timeData.alarm_millisecond
        ).millisecondToHHmmss(),
        moment(date) > moment('2017/03/17')
          ? 'N.A'
          : timeData.invalid_millisecond.millisecondToHHmmss(),
        moment(date) < moment('2017/03/17')
          ? 'N.A'
          : timeData.operate_duration.millisecondToHHmmss(),
        moment(date) < moment('2017/03/17')
          ? 'N.A'
          : timeData.other_duration.millisecondToHHmmss(),
        timeData.part_count,
        (
          timeData.operate_millisecond / timeData.work_shift_millisecond
        ).floatToPercentage(),
        (
          timeData.cutting_millisecond / timeData.work_shift_millisecond
        ).floatToPercentage(),
        moment(date) > moment('2017/03/17')
          ? 'N.A'
          : (
              timeData.operate_millisecond /
              (timeData.operate_millisecond + timeData.invalid_millisecond)
            ).floatToPercentage(),
        moment(date) < moment('2017/03/17')
          ? 'N.A'
          : (
              (timeData.operate_millisecond - timeData.operate_duration) /
              (timeData.operate_millisecond -
                timeData.operate_duration +
                timeData.other_duration)
            ).floatToPercentage(),
      ]
    })
    .value()

  callback(result)
}

function aaa() {
  console('aaa')
}

function timeDataNormalize(millisecond) {
  return parseInt(millisecond / 1000) * 1000
}

function getDenominator(timeData) {
  var denominator = $('input[name="denominator"]:checked').val()
  switch (denominator) {
    case 'power_millisecond':
      return timeData.power_millisecond
    case 'natural_day':
      return 24 * 60 * 60 * 1000
    default:
      return timeData.work_shift_millisecond
  }
}

exports.getDenominator = function (timeData) {
  return getDenominator(timeData)
}

function appendAverage(operSum, cutSum, denominatorSum) {
  $('tbody').append(
    '<tr style="font-weight:bolder;color:green;">' +
      '<td colspan="8"></td>' +
      '<td class="text-right"> ' +
      '平均' +
      '</td>' +
      '<td id="avgEff" class="text-right"> ' +
      '---' +
      '%</td>' +
      '<td id="avgeff" class="text-right"> ' +
      '---' +
      '%</td></tr>'
  )
}

function millisecondExcludMillisecond(timeData) {
  timeData.power_millisecond = timeDataNormalize(timeData.power_millisecond)
  timeData.operate_millisecond = timeDataNormalize(timeData.operate_millisecond)
  timeData.cutting_millisecond = timeDataNormalize(timeData.cutting_millisecond)
  timeData.idle_millisecond = timeDataNormalize(timeData.idle_millisecond)
  timeData.alarm_millisecond = timeDataNormalize(timeData.alarm_millisecond)
  timeData.work_shift_millisecond = timeDataNormalize(
    timeData.work_shift_millisecond
  )
  return timeData
}

exports.millisecondExcludMillisecond = function (timeData) {
  return millisecondExcludMillisecond(timeData)
}

exports.drawChart = function ($chartEle, config) {
  var dataList = config.dataList,
    barValueIndex = config.barValueIndex,
    xAxisLabelValueIndex = config.xAxisLabelValueIndex,
    yAxisLabel = config.yAxisLabel

  // modify by jaco @ 2016/8/20
  // to avoid pre query have data ,but this time have no data
  // orignal won't redraw,add empty to clear prev result
  if (!dataList || dataList.length === 0) {
    $chartEle.empty()
    return
  }

  var chartDatas = _.map(barValueIndex, function (barIndex, barI) {
    return {
      data: _.map(dataList, function (row, i) {
        return [i, row[barIndex].percentageToFloat()]
      }),
      bars: {
        show: true,
        barWidth: 0.2,
        order: barI + 1,
      },
    }
  })
  $.plot($chartEle, chartDatas, {
    colors: [
      servkit.colors.blue,
      servkit.colors.green,
      servkit.colors.orange,
      servkit.colors.purple,
    ],
    grid: {
      show: true,
      hoverable: true,
      clickable: true,
      tickColor: '#EFEFEF',
      borderWidth: 0,
      borderColor: '#EFEFEF',
    },
    xaxis: {
      ticks: function () {
        return _.map(dataList, function (ele, i) {
          var tick = _.map(xAxisLabelValueIndex, function (index) {
            return ele[index]
          }).join('</br>')
          return [i, tick]
        })
      },
    },
    yaxis: {
      min: 0,
      max: 100,
      axisLabel: yAxisLabel,
      axisLabelFontSizePixels: 12,
      axisLabelFontFamily: 'Open Sans',
    },
    legend: true,
    tooltip: true,
    tooltipOpts: {
      content: "<b style='display:none;'>%x</b><span>%y.2%</span>",
      defaultTheme: false,
    },
  })
}

// 使用BasePlatform長crud table的方式
exports.custDatatables = function (config) {
  var $table = config.selector
  var headColumns = config.headColumns
  var options = config.options
  var complexHeaderHtml = config.complexHeaderHtml
  var customDownloadSetting = config.customDownload
  /***************** render table html ******************/
  var html = []
  html.push('<thead>')
  var hasFilterCol = false
  _.each(headColumns, function (elem) {
    // 看是否要增加filter column
    if (elem.notFilterCol) {
      hasFilterCol = true
    }
  })
  if (hasFilterCol) {
    html.push('<tr>')
    _.each(headColumns, function (elem) {
      // 在header上加上一列 filter column
      if (elem.notFilterCol) {
        html.push(
          '<th><input filterkey="' +
            elem.key +
            '" style="display:none;" type="text" class="form-control" placeholder="Filter" /></th>'
        )
      } else {
        html.push(
          '<th><input filterkey="' +
            elem.key +
            '" type="text" class="form-control" placeholder="Filter" /></th>'
        )
      }
    })
    html.push('</tr>')
  }
  if (complexHeaderHtml) {
    // filter和真正的header中間加入客製化的複雜header (為了讓header多層)
    html.push(complexHeaderHtml)
  }
  html.push('<tr>')
  _.each(headColumns, function (elem) {
    var temp = '<th'
    temp = temp + " key='" + elem.key + "' "
    temp = elem.notData
      ? temp + " not-data='" + elem.notData + "' "
      : temp + " not-data='false'"
    temp = elem.dataHide ? temp + " data-hide='" + elem.dataHide + "'" : temp
    temp = elem.custAttr ? temp + ' ' + elem.custAttr + ' ' : temp //自訂義attr
    temp = elem.tooltip
      ? temp +
        " headtooltip='true' data-placement='top' data-original-title='" +
        elem.tooltip +
        " '> <i class='fa fa-question-circle'></i> &nbsp;"
      : temp + '>'
    html.push(temp + elem.name + '</th>')
  })
  html.push('</tr></thead><tbody></tbody>')

  $table.html(html.join(''))
  /***************** render datatable ******************/
  function setupDataTable() {
    var responsiveHelper,
      breakpointDefinition = {
        tablet: 1024,
        phone: 480,
      }
    $table.dataTable().fnDestroy() //清掉舊的
    $table.DataTable(
      $.extend(
        {},
        {
          sDom:
            options.sDom ||
            't' +
              "<'dt-toolbar-footer'<'col-sm-6 col-xs-12 hidden-xs'i><'col-xs-12 col-sm-6'p>>",
          //          autoWidth: false,
          headerCallback: function (thead, data, start, end, display) {
            $(thead).find('th').removeClass('sorting_asc')
          },
          preDrawCallback: function () {
            // Initialize the responsive datatables helper once.
            if (!responsiveHelper) {
              responsiveHelper = new ResponsiveDatatablesHelper(
                $table,
                breakpointDefinition
              )
            }
          },
          rowCallback: function (nRow) {
            responsiveHelper.createExpandIcon(nRow)
          },
          drawCallback: function (oSettings) {
            responsiveHelper.respond()
            $table.find('th').tooltip({
              container: 'body',
            })
            $('[rel=popover-hover], [data-rel=popover-hover]').popover({
              trigger: 'hover',
            })
            $('[headtooltip="true"]').tooltip()
          },
        },
        options
      )
    )

    $table.find('thead th > input[type=text]').on('keyup change', function () {
      $table
        .DataTable()
        .column($(this).parent().index() + ':visible')
        .search(this.value)
        .draw()
    })
  }

  setupDataTable()
}

exports.smallBox = function (params) {
  var smallBoxColor = {
    green: '#739E73',
    red: '#C46A69',
    yellow: '#C79121',
  }
  var content = params.content
  if (!content) {
    content = ''
  }
  $.smallBox({
    title: params.title,
    content:
      "<i class='fa fa-clock-o'></i>" + content + '<i>1 seconds ago...</i>',
    color: smallBoxColor[params.color],
    iconSmall: params.icon,
    timeout: params.timeout,
  })
}

exports.bling = function (blingTimes, frequency, $elements, color) {
  blingTimes = blingTimes * 2 + 1
  var blingCount = 1

  setTimeout(function change() {
    if (blingCount < blingTimes) {
      if (blingCount++ % 2 === 0) {
        $elements.css('background-color', '')
      } else {
        $elements.css('background-color', color)
      }
      setTimeout(change, frequency)
    }
  }, 0)
}

exports.getDataFromDB = function (config, callback) {
  var that = this
  var getData
  $.ajax({
    url: servkit.rootPath + '/api/getdata/db',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({
      table: config.tableName,
      columns: config.columns,
    }),
  }).done(function (data) {
    if (data.type === 0) {
      getData = data.data
    }
  })
  servkit
    .politeCheck()
    .until(function () {
      return getData
    })
    .thenDo(function () {
      that.getDBObject[config.objKey] = getData
      callback && typeof callback === 'function' && callback()
    })
    .tryDuration(0)
    .start()
}

exports.initializeDBData = function (DbData) {
  function Obj(data) {
    this.data = data
    this.map = {}
  }

  Obj.prototype.getData = function () {
    return this.data
  }
  Obj.prototype.getMap = function () {
    return this.map
  }
  Obj.prototype.init = function (key, val) {
    var that = this
    var html = ''
    _.each(this.data, function (record) {
      that.map[record[key]] = record[val]
      html +=
        '<option style="padding:3px 0 3px 3px;" value="' +
        record[key] +
        '">' +
        record[val] +
        '</option>'
    })
    that.selectHtml = html
  }

  Obj.prototype.getName = function (key) {
    return this.map[key]
  }
  Obj.prototype.getSelect = function () {
    return this.selectHtml
  }
  return new Obj(DbData)
}

exports.composeDayReportForCosmos = function (
  startDate,
  endDate,
  machineList,
  callback,
  cbincb
) {
  hippo
    .newMashupExhaler()
    .space('utilization_time_work_shift:utws')
    .index('machine_id', machineList)
    .indexRange('date', startDate, endDate)

    .space('part_count_merged:pcm')
    .index('machine_id', machineList)
    .indexRange('date', startDate, endDate)

    .column('utws', 'machine_id')
    .column('utws', 'date')
    .column('utws', 'work_shift')
    .column('utws', 'power_millisecond')
    .column('utws', 'operate_millisecond')
    .column('utws', 'cutting_millisecond')
    .column('utws', 'idle_millisecond')
    .column('utws', 'alarm_millisecond')
    .column('utws', 'work_shift_millisecond')

    .column('pcm', 'part_count')
    .column('pcm', 'operate_millisecond')

    .mashupKey('machine_id', 'date', 'work_shift')
    .exhale(function (exhalable) {
      if (cbincb) {
        callback(exhalable, startDate, endDate, cbincb)
      } else {
        callback(exhalable)
      }
    })
}

exports.composeDayReportCallBackForCosmos = function (
  exhalable,
  startDate,
  endDate,
  callback
) {
  var resultGroups = {}
  exhalable.each(function (data, groupKeys) {
    var timeData = data.utws[0],
      groupKey = timeData.machine_id + timeData.date,
      resultGroup = resultGroups[groupKey]

    if (resultGroup) {
      resultGroup.power_millisecond += timeData.power_millisecond
      resultGroup.operate_millisecond += timeData.operate_millisecond
      resultGroup.cutting_millisecond += timeData.cutting_millisecond
      resultGroup.idle_millisecond += timeData.idle_millisecond
      resultGroup.alarm_millisecond += timeData.alarm_millisecond
      resultGroup.work_shift_millisecond += timeData.work_shift_millisecond
      resultGroup.part_count += data.pcm.length
    } else {
      resultGroup = _.pick(
        timeData,
        'machine_id',
        'date',
        'power_millisecond',
        'operate_millisecond',
        'cutting_millisecond',
        'idle_millisecond',
        'alarm_millisecond',
        'work_shift_millisecond'
      )
      resultGroup.part_count = data.pcm.length
      resultGroups[groupKey] = resultGroup
    }
  })

  var operSum = 0
  var cutSum = 0
  var denominatorSum = 0
  servkit.ajax(
    {
      url: 'api/downtimeanalysis/machineidle/getworkshiftrange',
      type: 'GET',
      data: {
        startDate: startDate.replace(/\//g, ''),
        endDate: endDate.replace(/\//g, ''),
      },
    },
    {
      success: function (shiftData) {
        var result = _.chain(resultGroups)
          .values()
          .map(function (timeData) {
            var totalTime = 0
            timeData = millisecondExcludMillisecond(timeData)
            _.each(shiftData[timeData.date], function (shift) {
              totalTime += shift.totalMillisecond + 1000
            })
            if (totalTime - timeData.power_millisecond < 0) {
              totalTime = 0
            } else {
              totalTime = totalTime - timeData.power_millisecond
            }
            console.log(totalTime)
            operSum += timeData.operate_millisecond
            cutSum += timeData.cutting_millisecond
            denominatorSum += getDenominator(timeData)
            var brand = servkit.getMachineBrand(timeData.machine_id)
            return [
              servkit.getMachineName(timeData.machine_id),
              timeData.date.date8BitsToSlashed(),
              timeData.power_millisecond.millisecondToHHmmss(),
              timeData.operate_millisecond.millisecondToHHmmss(),
              brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
                ? 'N.A.'
                : timeData.cutting_millisecond.millisecondToHHmmss(),
              (
                timeData.idle_millisecond + timeData.alarm_millisecond
              ).millisecondToHHmmss(),
              totalTime.millisecondToHHmmss(),
              brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
                ? 'N.A.'
                : timeData.part_count,
              (
                timeData.operate_millisecond / getDenominator(timeData)
              ).floatToPercentage(),
              brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
                ? 'N.A.'
                : (
                    timeData.cutting_millisecond / getDenominator(timeData)
                  ).floatToPercentage(),
            ]
          })
          .value()

        callback(result, operSum, cutSum, denominatorSum)
      },
      fail: function (data) {},
    }
  )
}

exports.composeDayReportTank = function (
  startDate,
  endDate,
  machineList,
  callback,
  cbincb
) {
  hippo
    .newMashupExhaler()
    .space('utilization_time_work_shift:utws')
    .index('machine_id', machineList)
    .indexRange('date', startDate, endDate)

    .space('part_count_merged_total:pcm')
    .index('machine_id', machineList)
    .indexRange('date', startDate, endDate)

    .column('utws', 'machine_id')
    .column('utws', 'date')
    .column('utws', 'work_shift')
    .column('utws', 'power_millisecond')
    .column('utws', 'operate_millisecond')
    .column('utws', 'cutting_millisecond')
    .column('utws', 'idle_millisecond')
    .column('utws', 'alarm_millisecond')
    .column('utws', 'work_shift_millisecond')

    .column('pcm', 'part_count')

    .mashupKey('machine_id', 'date', 'work_shift')
    .exhale(function (exhalable) {
      if (cbincb) {
        callback(exhalable, cbincb)
      } else {
        callback(exhalable)
      }
    })
}

exports.composeDayReportTankCallBack = function (exhalable, callback) {
  var resultGroups = {}
  exhalable.each(function (data, groupKeys) {
    var timeData = data.utws[0],
      partCountData = 0,
      groupKey = timeData.machine_id + timeData.date,
      resultGroup = resultGroups[groupKey]
    _.each(data.pcm, function (obj) {
      partCountData += obj.part_count
    })
    if (resultGroup) {
      resultGroup.power_millisecond += timeData.power_millisecond
      resultGroup.operate_millisecond += timeData.operate_millisecond
      resultGroup.cutting_millisecond += timeData.cutting_millisecond
      resultGroup.idle_millisecond += timeData.idle_millisecond
      resultGroup.alarm_millisecond += timeData.alarm_millisecond
      resultGroup.work_shift_millisecond += timeData.work_shift_millisecond
      resultGroup.part_count += partCountData
    } else {
      resultGroup = _.pick(
        timeData,
        'machine_id',
        'date',
        'power_millisecond',
        'operate_millisecond',
        'cutting_millisecond',
        'idle_millisecond',
        'alarm_millisecond',
        'work_shift_millisecond'
      )
      resultGroup.part_count = partCountData
      resultGroups[groupKey] = resultGroup
    }
  })

  var operSum = 0
  var cutSum = 0
  var denominatorSum = 0

  var result = _.chain(resultGroups)
    .values()
    .map(function (timeData) {
      timeData = millisecondExcludMillisecond(timeData)

      operSum += timeData.operate_millisecond
      cutSum += timeData.cutting_millisecond
      denominatorSum += getDenominator(timeData)
      var brand = servkit.getMachineBrand(timeData.machine_id)
      return [
        servkit.getMachineName(timeData.machine_id),
        timeData.date.date8BitsToSlashed(),
        timeData.power_millisecond.millisecondToHHmmss(),
        timeData.operate_millisecond.millisecondToHHmmss(),
        brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
          ? 'N.A.'
          : timeData.cutting_millisecond.millisecondToHHmmss(),
        (
          timeData.idle_millisecond + timeData.alarm_millisecond
        ).millisecondToHHmmss(),
        brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
          ? 'N.A.'
          : timeData.part_count,
        (
          timeData.operate_millisecond / getDenominator(timeData)
        ).floatToPercentage(),
        brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
          ? 'N.A.'
          : (
              timeData.cutting_millisecond / getDenominator(timeData)
            ).floatToPercentage(),
      ]
    })
    .value()

  callback(result, operSum, cutSum, denominatorSum)
}

exports.initializeDBData = function (DbData) {
  function Obj(data) {
    this.data = data
    this.map = {}
  }

  Obj.prototype.getData = function () {
    return this.data
  }
  Obj.prototype.getMap = function () {
    return this.map
  }
  Obj.prototype.init = function (key, val) {
    var that = this
    var html = ''
    _.each(this.data, function (record) {
      that.map[record[key]] = record[val]
      html +=
        '<option style="padding:3px 0 3px 3px;" value="' +
        record[key] +
        '">' +
        record[val] +
        '</option>'
    })
    that.selectHtml = html
  }

  Obj.prototype.getName = function (key) {
    return this.map[key]
  }
  Obj.prototype.getSelect = function () {
    return this.selectHtml
  }
  return new Obj(DbData)
}
