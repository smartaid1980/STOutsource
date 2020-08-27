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

exports.drawLaneChart = function (processDatas) {
  var data = processDatas,
    lanes = data.lanes,
    items = data.items,
    now = new Date(),
    aDayMillisecond = 104800000

  var margin = { top: 20, right: 100, bottom: 15, left: 100 },
    width = 950 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom,
    miniHeight = lanes.length * 12 + 50,
    mainHeight = height - miniHeight - 50

  var x = d3.time
    .scale()
    // .domain([d3.time.sunday(d3.min(items, function(d) { return d.start; })),
    //          d3.max(items, function(d) { return d.end; })])
    // .domain([d3.min(items, function(d) { return d.start; }),
    //          d3.max(items, function(d) { return d.end; })])
    .domain([
      d3.min(items, function (d) {
        return d.start
      }),
      new Date(
        d3
          .max(items, function (d) {
            return d.end
          })
          .getTime() + aDayMillisecond
      ),
    ])
    .range([0, width])

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
    .attr('height', height + margin.top + margin.bottom)
    .attr('class', 'chart')

  chart
    .append('defs')
    .append('clipPath')
    .attr('id', 'clip')
    .append('rect')
    .attr('width', width)
    .attr('height', mainHeight)

  var main = chart
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')') //控制圖表位置 CSS3
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
  main
    .append('g')
    .selectAll('.laneLines') //管圖表中對應標籤的橫線
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

  main
    .append('g')
    .selectAll('.laneText') //管左邊文字標籤
    .data(lanes)
    .enter()
    .append('text')
    .text(function (d) {
      return d.label
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
      return d.label
    })
    .attr('x', -10)
    .attr('y', function (d) {
      return y2(d.id + 0.5)
    })
    .attr('dy', '0.5ex')
    .attr('text-anchor', 'end')
    .attr('class', 'laneText')

  // draw the x axis
  var xDateAxis = d3.svg
    .axis()
    .scale(x)
    .orient('bottom')
    // .ticks(d3.time.mondays, (x.domain()[1] - x.domain()[0]) > 15552e6 ? 2 : 1) //判斷資料區間來做調整
    .ticks(d3.time.wednesdays, 1)
    .tickFormat(d3.time.format('%Y/%m/%d'))
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
    .tickFormat(d3.time.format('%b %Y'))
    .tickSize(15, 0, 0)

  var x1MonthAxis = d3.svg
    .axis()
    .scale(x1)
    .orient('top')
    // .ticks(d3.time.days, 1)
    .ticks(d3.time.mondays, 1)
    .tickFormat(d3.time.format('%b - Week %W'))
    .tickSize(10, 0, 0)

  main
    .append('g')
    .attr('transform', 'translate(0,' + mainHeight + ')')
    .attr('class', 'main axis date')
    .call(x1DateAxis)

  // main.append('g')
  //     .attr('transform', 'translate(0,0.5)')
  //     .attr('class', 'main axis month')
  //     .call(x1MonthAxis)
  //     .selectAll('text')
  //         .attr('dx', 5)
  //         .attr('dy', 12);

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
    .attr('dx', 25)
    .attr('dy', 12)

  // draw a line representing today's date
  // main.append('line')
  //     .attr('y1', 0)
  //     .attr('y2', mainHeight)
  //     .attr('class', 'main todayLine')
  //     .attr('clip-path', 'url(#clip)');

  //前後框線
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

  // draw the selection area
  var brush = d3.svg
    .brush()
    .x(x)
    // .extent([d3.time.monday(now),d3.time.saturday.ceil(now)])
    // .extent([d3.min(items, function(d) { return d.start; }),
    //          new Date(d3.min(items, function(d) { return d.start; }).getTime() + 54800000)
    //        ])
    .extent([
      d3.min(items, function (d) {
        return d.start
      }),
      new Date(
        d3
          .min(items, function (d) {
            return d.start
          })
          .getTime() + aDayMillisecond
      ),
    ])
    .on('brush', display)

  mini
    .append('g')
    .attr('class', 'x brush')
    .call(brush)
    .selectAll('rect')
    .attr('y', 1)
    .attr('height', miniHeight - 1)

  mini.selectAll('rect.background').remove()
  display()

  function display() {
    var rects,
      labels,
      minExtent = d3.time.day(brush.extent()[0]),
      maxExtent = d3.time.day(brush.extent()[1]),
      visItems = items.filter(function (d) {
        return d.start < maxExtent && d.end > minExtent
      })
    mini.select('.brush').call(brush.extent([minExtent, maxExtent]))

    x1.domain([minExtent, maxExtent])

    if (maxExtent - minExtent > 1468800000) {
      //毫秒
      x1DateAxis
        .ticks(d3.time.wednesdays, 1)
        .tickFormat(d3.time.format('%m/%d'))
      // x1MonthAxis.ticks(d3.time.mondays, 1).tickFormat(d3.time.format('%b - Week %W'));
    } else if (maxExtent - minExtent > 172800000) {
      x1DateAxis.ticks(d3.time.days, 1).tickFormat(d3.time.format('%m/%d'))
      // x1MonthAxis.ticks(d3.time.mondays, 1).tickFormat(d3.time.format('%b - Week %W'));
    } else {
      x1DateAxis.ticks(d3.time.hours, 4).tickFormat(d3.time.format('%I %p'))
      x1MonthAxis.ticks(d3.time.days, 1).tickFormat(d3.time.format('%b %e'))
    }

    // shift the today line
    main
      .select('.main.todayLine')
      .attr('x1', x1(now) + 0.5)
      .attr('x2', x1(now) + 0.5)

    // update the axis
    main.select('.main.axis.date').call(x1DateAxis)
    main
      .select('.main.axis.month')
      .call(x1MonthAxis)
      .selectAll('text')
      .attr('dx', 50) //main axis month 標籤移動設定
      .attr('dy', 12)

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
      .attr('height', function (d) {
        return 0.8 * y1(1)
      })
      .attr('class', function (d) {
        return 'mainItem ' + d.class
      })

    rects.exit().remove()

    // update the item labels
    // labels = itemRects.selectAll('text')
    //     .data(visItems, function (d) { return d.id; })
    //     .attr('x', function(d) { return x1(Math.max(d.start, minExtent)) + 2; });

    // labels.enter().append('text')
    // .text(function (d) { return 'Item\n\n\n\n Id: ' + d.id; })
    // .attr('x', function(d) { return x1(Math.max(d.start, minExtent)) + 2; })
    // .attr('y', function(d) { return y1(d.lane) + .4 * y1(1) + 0.5; })
    // .attr('text-anchor', 'start')
    // .attr('class', 'itemLabel');

    // labels.exit().remove();
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
      result.push({ class: className, path: paths[className] })
    }

    return result
  }
}

//clear form
;(function () {
  $('#content').on('click touchend', '[name=submit-clean]', (e) => {
    e.preventDefault()

    $(e.target)
      .closest('form')
      .find('input[type=text]')
      .val('')
      .end()
      .find('select')
      .prop('selectedIndex', -1)
      .end()
      .find('select.select2')
      .select2('val', -1)
      .end()
      .find(':checkbox, :radio')
      .prop('checked', false)
  })
})()
