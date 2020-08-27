function substringLaneTitleJumpway(laneTitle) {
  if (laneTitle.indexOf('(') == -1) {
    return laneTitle
  } else {
    var filterSymbolTitle = laneTitle.replace('@@@', '')
    return filterSymbolTitle.substring(0, filterSymbolTitle.indexOf('('))
  }
}

function substringHightLightGoQtyJumpway(laneTitle) {
  return laneTitle.indexOf('@@@') == -1
    ? laneTitle
    : laneTitle.substring(0, laneTitle.indexOf('@@@'))
}

function checkHightLightGoQtyJumpway(laneTitle) {
  return laneTitle.indexOf('@@@') == -1 ? '' : laneTitle.split('@@@')[1]
}

function resetEndtime(startTime, endTime, eightHoursMillisecond) {
  var startTimeMillsec = new Date(startTime).getTime()
  var diffVal = new Date(endTime).getTime() - startTimeMillsec
  var quotient = diffVal / eightHoursMillisecond
  if (quotient <= 1) {
    return new Date(startTimeMillsec + eightHoursMillisecond)
  } else {
    return new Date(
      startTimeMillsec + eightHoursMillisecond * Math.ceil(quotient)
    )
  }
}

function addToLane(chart, item) {
  var name = item.lane

  if (!chart.lanes[name]) chart.lanes[name] = []

  var lane = chart.lanes[name]
  var sublane = 0
  if (!lane[sublane]) {
    lane[sublane] = []
  }

  lane[sublane].push(item)
}

function parseData(data) {
  var i = 0,
    length = data.length
  var chart = {
    lanes: {},
  }
  for (i; i < length; i++) {
    var item = data[i]

    addToLane(chart, item)
  }
  return collapseLanes(chart)
}

function collapseLanes(chart) {
  var lanes = [],
    items = [],
    laneId = 0
  var now = new Date()
  var firstLaneStart = null
  for (var laneName in chart.lanes) {
    var lane = chart.lanes[laneName]
    for (var i = 0; i < lane.length; i++) {
      var subLane = lane[i]

      if (firstLaneStart == null) {
        firstLaneStart = subLane[0].start
      }

      lanes.push({
        id: laneId,
        label: i === 0 ? laneName : '',
      })

      for (var j = 0; j < subLane.length; j++) {
        var item = subLane[j]
        var obj = {
          workId: item.workId,
          id: item.id,
          lane: laneId,
        }
        addTimeClass2Obj(item, obj, now, firstLaneStart)
        items.push(obj)
      }
      laneId++
    }
  }
  return {
    lanes: lanes,
    items: items,
  }
}
function isValidDate(d) {
  return d instanceof Date && !isNaN(d)
}

function addTimeClass2Obj(item, obj, currentTime, firstLaneStart) {
  if (isValidDate(item.start) == false && isValidDate(item.end) == false) {
    obj.start = firstLaneStart
    obj.end = firstLaneStart
    obj.class = 'trackingNoData'
  } else if (
    isValidDate(item.start) == true &&
    isValidDate(item.end) == false
  ) {
    obj.start = item.start
    obj.end = currentTime
    obj.class = 'trackingNoMoveOut'
  } else {
    obj.start = item.start
    obj.end = item.end
    obj.class = 'tracking'
  }
  return obj
}

exports.drawLaneChart = function (processDatas, switchTag) {
  var data = parseData(processDatas),
    lanes = data.lanes,
    items = data.items,
    oneDayMillisecond = 24 * 60 * 60 * 1000,
    twoDaysMillisecond = oneDayMillisecond * 2,
    oneYearMillisecond = oneDayMillisecond * 365,
    threeWeeksMillisecond = oneDayMillisecond * 21,
    eightHoursMillisecond = 8 * 60 * 60 * 1000,
    sixteenHoursMillisecond = eightHoursMillisecond * 2

  var margin = {
      top: 15,
      right: 100,
      bottom: 15,
      left: 250,
    },
    customizedHight = lanes.length * 25 + lanes.length * 40 + 60,
    width = 1250 - margin.left - margin.right,
    height = customizedHight - margin.top - margin.bottom,
    miniHeight = lanes.length * 20,
    mainHeight = lanes.length * 35

  var x

  if (switchTag == 'digitrack') {
    x = d3.time
      .scale()
      .domain([
        d3.min(items, function (d) {
          return d.start
        }),
        d3.max(items, function (d) {
          return d.end
        }),
      ])
      .range([0, width])
  } else {
    x = d3.time
      .scale()
      .domain([
        d3.time.day(
          d3.min(items, function (d) {
            return d.start
          })
        ),
        new Date(
          d3
            .max(items, function (d) {
              return d.end
            })
            .getTime() + oneDayMillisecond
        ),
      ])
      .range([0, width])
  }

  var x1 = d3.time.scale().range([0, width])
  var ext = d3.extent(lanes, function (d) {
    return d.id
  })
  var y1 = d3.scale
    .linear()
    .domain([ext[0], ext[1] + 1])
    .range([0, mainHeight])
  var y2 = d3.scale
    .linear()
    .domain([ext[0], ext[1] + 1])
    .range([0, miniHeight])

  var chart = d3
    .select('#swimlaneChart')
    .append('svg:svg')
    .attr('width', width + margin.right + margin.left)
    .attr('height', height + margin.top + margin.bottom + 10)
    .attr('class', 'd3chart')

  chart
    .append('defs')
    .append('clipPath')
    .attr('id', 'clip')
    .append('rect')
    .attr('width', width)
    .attr('height', mainHeight)

  var main = chart
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')') // 控制圖表位置 CSS3
    .attr('width', width)
    .attr('height', mainHeight)
    .attr('class', 'main')

  var mini = chart
    .append('g')
    .attr(
      'transform',
      'translate(' + margin.left + ',' + (mainHeight + 60) + ')'
    )
    .attr('width', width)
    .attr('height', miniHeight)
    .attr('class', 'mini')

  // draw the lanes for the main chart
  // 管圖表中對應標籤的橫線
  main
    .append('g')
    .selectAll('.laneLines')
    .data(lanes)
    .enter()
    .append('line')
    .attr('x1', 0)
    .attr('y1', function (d) {
      return d3.round(y1(d.id)) + 0.5
    })
    .attr('x2', width)
    .attr('y2', function (d) {
      return d3.round(y1(d.id)) + 0.5
    })
    .attr('stroke', function (d) {
      return d.label === '' ? 'white' : 'lightgray'
    })

  // 管左邊文字標籤
  main
    .append('g')
    .selectAll('.laneText')
    .data(lanes)
    .enter()
    .append('text')
    .text(function (d) {
      return substringLaneTitleJumpway(d.label)
    })
    .attr('x', -10)
    .attr('y', function (d) {
      return y1(d.id + 0.5)
    })
    .attr('dy', '0.5ex')
    .attr('text-anchor', 'end')
    .attr('class', 'laneText')

  // draw the lanes for the mini chart
  mini
    .append('g')
    .selectAll('.laneLines')
    .data(lanes)
    .enter()
    .append('line')
    .attr('x1', 0)
    .attr('y1', function (d) {
      return d3.round(y2(d.id)) + 0.5
    })
    .attr('x2', width)
    .attr('y2', function (d) {
      return d3.round(y2(d.id)) + 0.5
    })
    .attr('stroke', function (d) {
      return d.label === '' ? 'white' : 'lightgray'
    })

  mini
    .append('g')
    .selectAll('.laneText')
    .data(lanes)
    .enter()
    .append('text')
    .text(function (d) {
      return substringHightLightGoQtyJumpway(d.label)
    })
    .attr('x', -10)
    .attr('y', function (d) {
      return y2(d.id + 0.5)
    })
    .attr('dy', '0.5ex')
    .attr('text-anchor', 'end')
    .attr('class', 'laneText')
    .append('tspan')
    .style('fill', 'red')
    .text(function (d) {
      return checkHightLightGoQtyJumpway(d.label)
    })

  // draw the x axis
  var xDateAxis = d3.svg
    .axis()
    .scale(x)
    .orient('bottom')
    .ticks(d3.time.mondays, 1)
    .tickFormat(d3.time.format('%d'))
    .tickSize(-miniHeight, 0, 0)

  var x1DateAxis = d3.svg
    .axis()
    .scale(x1)
    .orient('bottom')
    .ticks(d3.time.days, 1)
    .tickFormat(d3.time.format('%m/%d'))
    .tickSize(-mainHeight, 0, 0)

  var xMonthAxis = d3.svg
    .axis()
    .scale(x)
    .orient('top')
    .ticks(d3.time.months, 1)
    .tickFormat(d3.time.format('%Y/%m'))
    .tickSize(15, 0, 0)

  var x1MonthAxis = d3.svg
    .axis()
    .scale(x1)
    .orient('top')
    // .ticks(d3.time.days, 1)
    .ticks(d3.time.mondays, 1)
    .tickFormat(d3.time.format('%Y/%m - Week %W'))
    .tickSize(10, 0, 0)

  main
    .append('g')
    .attr('transform', 'translate(0,' + mainHeight + ')')
    .attr('class', 'main axis date')
    .call(x1DateAxis)

  main
    .append('g')
    .attr('transform', 'translate(0,0.5)')
    .attr('class', 'main axis month')
    .call(x1DateAxis)
    .selectAll('text')
    .attr('dx', 5)
    .attr('dy', 12)

  mini
    .append('g')
    .attr('transform', 'translate(0,' + miniHeight + ')')
    .attr('class', 'axis date')
    .call(xDateAxis)

  mini
    .append('g')
    .attr('transform', 'translate(0,0.5)')
    .attr('class', 'axis month')
    .call(xMonthAxis)
    .selectAll('text')
    .attr('dx', 30)
    .attr('dy', 12)

  // 前後框線
  mini
    .append('line')
    .attr('x1', 0)
    .attr('y1', 0)
    .attr('x2', 0)
    .attr('y2', miniHeight)
    .attr('class', 'frameLine')

  mini
    .append('line')
    .attr('x1', width)
    .attr('y1', 0)
    .attr('x2', width)
    .attr('y2', miniHeight)
    .attr('class', 'frameLine')

  // draw the items
  var itemRects = main.append('g').attr('clip-path', 'url(#clip)')

  mini
    .append('g')
    .selectAll('miniItems')
    .data(getPaths(items))
    .enter()
    .append('path')
    .attr('class', function (d) {
      return 'miniItem ' + d.class
    })
    .attr('d', function (d) {
      return d.path
    })

  // invisible hit area to move around the selection window 移動到任意選擇地方
  mini
    .append('rect')
    .attr('pointer-events', 'painted')
    .attr('width', width)
    .attr('height', miniHeight)
    .attr('visibility', 'hidden')
    .on('mouseup', moveBrush)

  var startTime = d3.min(items, function (d) {
    return d.start
  })
  var endTime = new Date(
    d3
      .min(items, function (d) {
        return d.start
      })
      .getTime() + eightHoursMillisecond
  )

  // draw the selection area
  var brush = d3.svg
    .brush()
    .x(x)
    .extent([startTime, endTime])
    .on('brush', display)

  mini
    .append('g')
    .attr('class', 'x brush')
    .call(brush)
    .selectAll('rect')
    .attr('y', 1)
    .attr('height', miniHeight - 1)

  // 移除十字圈選放大功能
  // mini.selectAll('rect.background').remove();
  display()

  function display() {
    var rects, minExtent, maxExtent
    if (switchTag == 'digitrack') {
      ;(minExtent = brush.extent()[0]),
        (maxExtent = resetEndtime(
          brush.extent()[0],
          brush.extent()[1],
          eightHoursMillisecond
        ))
    } else {
      minExtent = d3.time.day(brush.extent()[0])
      maxExtent = d3.time.day(brush.extent()[1])
    }

    var visItems = items.filter(function (d) {
      return d.start < maxExtent && d.end > minExtent
    })

    mini.select('.brush').call(brush.extent([minExtent, maxExtent]))

    x1.domain([minExtent, maxExtent])

    if (maxExtent - minExtent > threeWeeksMillisecond) {
      x1MonthAxis.ticks(d3.time.mondays, 1).tickFormat(d3.time.format('%Y/%m'))
      x1DateAxis
        .ticks(d3.time.mondays, 1)
        .tickFormat(d3.time.format('%b - Week %W'))
    } else if (
      maxExtent - minExtent >
      (switchTag == 'digitrack' ? oneDayMillisecond : twoDaysMillisecond)
    ) {
      x1MonthAxis.ticks(d3.time.mondays, 1).tickFormat(d3.time.format('%Y/%m'))
      x1DateAxis.ticks(d3.time.days, 1).tickFormat(d3.time.format('%m/%d'))
    } else if (
      switchTag == 'digitrack' &&
      maxExtent - minExtent > sixteenHoursMillisecond
    ) {
      x1MonthAxis.ticks(d3.time.days, 1).tickFormat(d3.time.format('%m/%d'))
      x1DateAxis.ticks(d3.time.hours, 4).tickFormat(d3.time.format('%H:%M'))
    } else {
      x1MonthAxis.ticks(d3.time.days, 1).tickFormat(d3.time.format('%m/%d'))
      x1DateAxis
        .ticks(d3.time.hours, switchTag == 'digitrack' ? 1 : 4)
        .tickFormat(d3.time.format('%H:%M'))
    }

    // update the axis
    main.select('.main.axis.date').call(x1DateAxis)
    main
      .select('.main.axis.month')
      .call(x1MonthAxis)
      .selectAll('text')
      .attr('dx', 26) // main axis month 標籤移動設定
      .attr('dy', 10)

    // upate the item rects
    rects = itemRects
      .selectAll('rect')
      .data(visItems, function (d) {
        return d.id
      })
      .attr('x', function (d) {
        return x1(d.start)
      })
      .attr('width', function (d) {
        return x1(d.end) - x1(d.start)
      })

    rects
      .enter()
      .append('rect')
      .attr('x', function (d) {
        return x1(d.start)
      })
      .attr('y', function (d) {
        return y1(d.lane) + 0.1 * y1(1) + 0.5
      })
      .attr('width', function (d) {
        return x1(d.end) - x1(d.start)
      })
      .attr('height', function () {
        return 0.8 * y1(1)
      })
      .attr('class', function (d) {
        return 'mainItem ' + d.class
      })

    rects.exit().remove()
  }

  function moveBrush() {
    var origin = d3.mouse(this),
      point = x.invert(origin[0]),
      halfExtent =
        (brush.extent()[1].getTime() - brush.extent()[0].getTime()) / 2,
      start = new Date(point.getTime() - halfExtent),
      end = new Date(point.getTime() + halfExtent)

    brush.extent([start, end])
    display()
  }

  // generates a single path for each item class in the mini display
  // ugly - but draws mini 2x faster than append lines or line generator
  // is there a better way to do a bunch of lines as a single path with d3?
  function getPaths(items) {
    var paths = {},
      d,
      offset = 0.5 * y2(1) + 0.5,
      result = []
    for (var i = 0; i < items.length; i++) {
      d = items[i]
      if (!paths[d.class]) paths[d.class] = ''
      paths[d.class] += [
        'M',
        x(d.start),
        y2(d.lane) + offset,
        'H',
        x(d.end),
      ].join(' ')
    }

    for (var className in paths) {
      result.push({
        class: className,
        path: paths[className],
      })
    }

    return result
  }
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

// clear form
;(function () {
  $('#content').on('click touchend', '[name=submit-clean]', function (e) {
    e.preventDefault()

    $(e.target)
      .closest('form')
      .find('input')
      .each((i, el) => {
        if ($(el).data('select2')) {
          $(el).select2('val', '')
        } else if (el.type === 'text') {
          el.value = ''
        }
      })
      .end()
      .find('select')
      .each((i, el) => {
        if ($(el).data('select2')) {
          $(el).select2('val', '')
        } else {
          $(el).prop('selectedIndex', -1)
        }
      })
      .end()
      .find(':checkbox, :radio')
      .prop('checked', false)
  })
})()

// 查詢sql的key結尾若為跳脫字元(反斜線)會導致sql語法錯誤
// 因此單反斜線用雙反斜線取代，才能正常顯示單反斜線

exports.checkEscapeSymbol = function (str) {
  var temp
  var result
  if (str === null) {
    return str
  } else {
    temp = str.replace(/\\/g, '\\\\')
    result = temp.replace(/'/g, "\\'")
    return result
  }
}

exports.dynamicDemo = function (ctx) {
  var settings = {
    '10_product_process_quality': {
      '#startDate': moment().add('-11', 'day').format('YYYY/MM/DD'),
      '#endDate': moment().add('-2', 'day').format('YYYY/MM/DD'),
      '#productName': 'and630_1m', // 轉接器-A型
    },
    '20_work_quality': {
      '#startDate': moment().add('-11', 'day').format('YYYY/MM/DD'),
      '#endDate': moment().add('-2', 'day').format('YYYY/MM/DD'),
      "[name='work-status']": 2, // 結案
    },
    '30_work_process': {
      '#startDate': moment().add('-11', 'day').format('YYYY/MM/DD'),
      '#endDate': moment().add('-2', 'day').format('YYYY/MM/DD'),
      "[name='work-status']": 2, // 結案
      '#product-id': 'Ckey_AD_01', //標準零件
    },
    '40_line_oee': {
      '#startDate': moment().add('-11', 'day').format('YYYY/MM/DD'),
      '#endDate': moment().add('-10', 'day').format('YYYY/MM/DD'),
      '#type_process': 'process', // 製程
      '#process': 'd_all', // 射出成型
    },
    '50_line_oee_day': {
      '#start-date': moment().add('-11', 'day').format('YYYY/MM/DD'),
      '#end-date': moment().add('-10', 'day').format('YYYY/MM/DD'),
      '#line-id': 'BM03', // 線別: 注射機03
    },
    '60_operating_performance_strongled': {
      '#startDate': moment().add('-9', 'day').format('YYYY/MM/DD'),
      '#endDate': moment().add('-2', 'day').format('YYYY/MM/DD'),
    },
  }

  if (servtechConfig.ST_UI_SHOW_TRACK_DEMO && settings[ctx.funId]) {
    // add btn
    $('#submit-btn').after(
      `<button id="dynamic-demo-btn" class="btn btn-success"> Show demo</button>`
    )
    $('#dynamic-demo-btn').on('click', (evt) => {
      evt.preventDefault()
      _.each(settings[ctx.funId], (val, selector) => {
        if ($(selector).is(':radio')) {
          $(selector).prop('checked', 'checked')
        } else {
          $(selector).val(val)
        }
        if ($(selector).hasClass('select2')) {
          $(selector).trigger('change.select2')
        }
      })
      $('#submit-btn').click()
    })
  }
}
