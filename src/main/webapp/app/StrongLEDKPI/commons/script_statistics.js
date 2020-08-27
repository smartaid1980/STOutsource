var TO_FIXED_NUM = 2

class timeIntervalStatistics {
  constructor(col, type, headerName, dataLabel, nextPage, servkit) {
    this.servkit = servkit
    this.haveTarget = true
    this.haveAverage = true
    this.havePercent = true
    this.nextPage = nextPage
    this.data = []
    this.dataColor = [
      this.servkit.statusColors.online,
      this.servkit.statusColors.alarm,
      '#d4d4d4',
    ]
    this.dataShowType = ['point-line', 'line', 'dashed']
    this.col = col
    this.type = type
    this.rateName = ''
    this.headerName = headerName
    this.drawHtml()
    this.dataLabel = [
      dataLabel || '',
      i18n('Target_Value'),
      i18n('Total_Average'),
    ]
    this.bindingClickValueEvent()
    this.bindingChangePageEvent()
  }

  set data(data) {
    this.primaryData = data
    if (_.isArray(data)) {
      if (data.length <= 12) this._data = [data]
      else {
        this._data = []
        _.each(data, (val) => {
          if (Number(val[0]) % 12 === 1) this._data.push([])
          this._data[this._data.length - 1].push(val)
        })
        this.primaryData = this._data
      }
    } else if (_.isObject(data)) {
      // 主要是這個，才能達到沒有值會是null(不要null要補上0)
      this._data = [[]] // 原本長這樣 -> this._data = []
      this.primaryData = [[]] // 原本長這樣 -> this.primaryData = []
      var realData = this._data
      var primaryData = this.primaryData
      if (!this.max) this.max = []
      if (!this.min) this.min = []
      if (this.max[primaryData.length - 1])
        this.max[primaryData.length - 1] = null
      if (this.min[primaryData.length - 1])
        this.min[primaryData.length - 1] = null
      for (
        var index = 1;
        index <= Number(Object.keys(data)[Object.keys(data).length - 1]);
        index++
      ) {
        // if (index % 12 === 1) realData.push([])
        // 會補0
        // realData[realData.length - 1].push(data[index] && data[index].value ? [index, data[index].value] : [index, 0])
        // 不補0
        if (data[index] && data[index].value)
          realData[realData.length - 1].push([index, data[index].value])

        // 算最大值
        if (
          !this.max[primaryData.length - 1] ||
          this.max[primaryData.length - 1] < data[index].value
        )
          this.max[primaryData.length - 1] = data[index].value

        // 算最小值
        if (
          !this.min[primaryData.length - 1] ||
          this.min[primaryData.length - 1] > data[index].value
        )
          this.min[primaryData.length - 1] = data[index].value

        // if (index % 12 === 1) primaryData.push([])
        primaryData[primaryData.length - 1].push(
          data[index] && data[index].primary ? data[index].primary : null
        )
      }
      // if (!realData[realData.length - 1].length) {
      //   realData[realData.length - 1].push([0, 0])
      //   realData[realData.length - 1].push([Number(Object.keys(data)[Object.keys(data).length - 1]), 0])
      // }
    } else this._data = [[data]]
    this.nowIndex = 0 // 預設畫的是第一個陣列
  }
  get data() {
    return this._data
  }
  set dataLabel(dataLabel) {
    if (_.isArray(dataLabel)) this._dataLabel = dataLabel
    else {
      if (!this._dataLabel) this._dataLabel = []
      this._dataLabel[0] = dataLabel
    }
    this.drawLegend()
  }
  set dataColor(dataColor) {
    if (_.isArray(dataColor)) this._dataColor = dataColor
    else {
      if (!this._dataColor) this._dataColor = []
      this._dataColor[0] = dataColor
    }
  }
  set option(option) {
    this._option = option
  }
  set target(target) {
    this._target = target
  }
  set rateName(rateName) {
    this._rateName = rateName
  }

  drawHtml() {
    var html = []
    html.push(
      `<div class="col col-xs-12 col-sm-12 col-md-${this.col} col-lg-${this.col}">`
    )
    html.push(`  <div id="${this.type}-frame" class="chart-frame">`)
    html.push(
      `    <div class="header">${this.headerName}-<span id="${this.type}-title"></span></div>`
    )
    html.push(`    <div class="chart-body">`)
    html.push(`      <div class="chart"></div>`)
    html.push(`      <div class="chart-legend"></div>`)
    html.push(`    </div>`)
    html.push(`  </div>`)
    html.push(`</div>`)
    $('#chart').append(html.join(''))
    this.$chart = $(`#${this.type}-frame .chart-body>.chart`)
  }

  drawLegend() {
    $(`#${this.type}-frame`).find('.chart-legend').empty()
    var html = []
    var colors = this._dataColor
    var dataShowType = this.dataShowType
    _.each(this._dataLabel, (legend, key) => {
      if (legend) {
        html.push(`<div>`)
        html.push(`  <div class="chart-legend-color">`)
        switch (dataShowType[key]) {
          case 'point-line':
            html.push(
              `<div class="data-hr"><div style="background-color: ${colors[key]};"></div><hr style="border-top-color: ${colors[key]};"></div>`
            )
            break
          case 'line':
            html.push(
              `<div class="target-hr"><hr style="border-top-color: ${colors[key]};"></div>`
            )
            break
          case 'dashed':
            html.push(
              `<div class="average-hr"><hr style="border-top-color: ${colors[key]};border-top-style: dashed;"></div>`
            )
            break
        }
        html.push(`  </div>`)
        html.push(`  <div class="chart-legend-label">${legend}</div>`)
        html.push(`</div>`)
      }
    })
    $(`#${this.type}-frame`).find('.chart-legend').append(html.join(''))
  }

  drawChartControl(length) {
    var html = []
    html.push(`<div class="chart-controlNav">`)
    for (var l = 0; l < length; l++)
      html.push(
        `  <a class="chart-control${
          this.nowIndex === l ? ' active' : ''
        }" rel="${l}"></a>`
      )
    html.push(`</div>`)
    $(`#${this.type}-frame`).find('.chart-legend').after(html.join(''))
  }

  drawChart(title) {
    $(`#${this.type}-frame`).find('.chart-controlNav').remove()
    if (this._data && this._data[0] && this._data[0].length)
      $(`#${this.type}-frame`).closest('.col').removeClass('hide')
    else $(`#${this.type}-frame`).closest('.col').addClass('hide')

    $(`#${this.type}-title`).text(title)
    var option = {
      yaxis: {
        max:
          this.max && this.max[this.nowIndex]
            ? Math.ceil(this.max[this.nowIndex])
            : 100,
        min:
          this.min && this.min[this.nowIndex]
            ? Math.floor(this.min[this.nowIndex])
            : 0,
        // tickSize: 20,
      },
      grid: {
        tickColor: '#cecece38',
        clickable: true,
        hoverable: true,
      },
    }
    if (this.havePercent)
      option.yaxis.tickFormatter = (val) => {
        return val.toFixed(TO_FIXED_NUM) + '%'
      }
    if (this.haveTarget)
      if (option.yaxis.max < this._target) option.yaxis.max = this._target
      else if (option.yaxis.min > this._target) option.yaxis.min = this._target

    if (this._option) _.extend(option, this._option)

    if (this._data.length > 1) this.drawChartControl(this._data.length)

    var last = this._data[this.nowIndex]
      ? this._data[this.nowIndex][this._data[this.nowIndex].length - 1]
      : null
    if (last) last = last[0]

    var d = []
    // 標準值
    if (this.haveTarget)
      d.push({
        data: [
          [12 * this.nowIndex + 1, this._target],
          [last, this._target],
        ],
        color: this._dataColor[this._dataColor.length - 2],
        lines: {
          show: true,
          lineWidth: 3,
        },
      })
    // 平均
    if (this.haveAverage) {
      var sum = 0
      var totalQuantity = 0
      _.each(this._data, (data) => {
        _.each(data, (val) => {
          if (val) sum += Number(val[1])
        })
        totalQuantity += data.length
      }) // 算總額

      var averageMap = {
        data: [
          [12 * this.nowIndex + 1, sum / totalQuantity],
          [last, sum / totalQuantity],
        ],
        points: {
          // 為了有值(tooltip)
          show: true,
          radius: 0,
        },
      }
      if (this.haveTarget) {
        // 有標準值
        averageMap.color = this._dataColor[this._dataColor.length - 1]
        averageMap.dashes = {
          show: true,
          lineWidth: 3,
        }
      } else {
        // 沒有標準值，而且顏色改成紅色
        averageMap.color = this._dataColor[this._dataColor.length - 2]
        averageMap.lines = {
          show: true,
          lineWidth: 3,
        }
      }
      d.push(averageMap)
    }
    // console.log(this._data[this.nowIndex])
    // 資料顯示
    var nowIndex = this.nowIndex
    var dataColor = this._dataColor
    var layers = this.layers
    if (this.datas)
      _.each(this.datas, (data, key) => {
        var index
        if (layers)
          index = layers.find(function (layer) {
            return layer === String(key)
          })
        if (index !== undefined)
          d.push({
            data: data[nowIndex],
            color: dataColor[key],
            lines: {
              show: true,
              lineWidth: 4,
            },
            points: {
              show: true,
              lineWidth: 6,
              fillColor: dataColor[key],
              symbol: function (ctx, x, y, radius, shadow) {
                // 增加點的大小
                ctx.arc(
                  x,
                  y,
                  radius * 1,
                  0,
                  shadow ? Math.PI : Math.PI * 2,
                  false
                )
              },
            },
          })
      })
    else
      d.push({
        data: this._data[this.nowIndex],
        color: this._dataColor[0],
        lines: {
          show: true,
          lineWidth: 4,
        },
        points: {
          show: true,
          lineWidth: 6,
          fillColor: this._dataColor[0],
          symbol: function (ctx, x, y, radius, shadow) {
            // 增加點的大小
            ctx.arc(x, y, radius * 1, 0, shadow ? Math.PI : Math.PI * 2, false)
          },
        },
      })
    // 灰點
    // d.push({
    //   data: _.map(this._data[this.nowIndex], (val) => {
    //     return val[1] === 0 ? val : null
    //   }),
    //   color: '#757575',
    //   points: {
    //     show: true,
    //     lineWidth: 6,
    //     fillColor: this.servkit.statusColors.online,
    //     symbol: function (ctx, x, y, radius, shadow) { // 增加點的大小
    //       ctx.arc(x, y, radius * 1, 0, shadow ? Math.PI : Math.PI * 2, false)
    //     }
    //   }
    // })

    // if(!option.xaxis) option.xaxis = {}
    // option.xaxis.tickSize = this._data[this.nowIndex].length
    // console.log(d, option)
    $.plot(this.$chart, d, option)
  }

  bindingClickValueEvent() {
    var $chart = this.$chart
    var previousPoint
    var param = this
    $chart.bind('plotclick', function (event, pos, item) {
      if (
        item &&
        (item.series.color === param.servkit.statusColors.online ||
          item.series.color === param.servkit.colors.blue)
      ) {
        var data = param.primaryData[param.nowIndex][item.datapoint[0] - 1]
        // console.log(item, data)
        var lang = servkit.getCookie('lang')
        var location = `#app/StrongLEDKPI/function/${lang}/${
          param.nextPage
        }.html?start=${data.startDate}&end=${data.endDate}&op=${$('#op')
          .val()
          .join(',')}`

        window.location = location
      }
    })

    $chart.bind('plothover', function (event, pos, item) {
      if (item) {
        $chart.css('cursor', 'pointer')
        if (previousPoint != item.dataIndex) {
          previousPoint = item.dataIndex
          $('#tooltip').remove()

          var y = item.datapoint[1].toFixed(TO_FIXED_NUM)
          var color = item.series.color

          showTooltip(
            item.pageX,
            item.pageY,
            color,
            `<strong>${y}</strong>${param.havePercent ? '%' : ''}`
          )
        }
      } else {
        $('#tooltip').remove()
        $chart.css('cursor', 'default')
        previousPoint = null
      }
    })

    function showTooltip(x, y, color, contents) {
      let fontColor = '#333'
      if (document.body.classList.contains('smart-style-5'))
        fontColor = '#dadada'
      $('<div id="tooltip">' + contents + '</div>')
        .css({
          'position': 'absolute',
          'display': 'none',
          'top': y - 35,
          'left': x - 30,
          'border': '2px solid ' + color,
          'padding': '3px',
          'font-size': '9px',
          'border-radius': '5px',
          'background-color': 'rgba(208, 208, 208, 0.18)',
          'opacity': 0.9,
          'color': fontColor,
        })
        .appendTo('body')
        .fadeIn(200)
    }
  }
  bindingChangePageEvent() {
    var data = this
    $(`#${data.type}-frame .chart-body`).on(
      'click',
      '.chart-control',
      function () {
        data.nowIndex = Number(this.getAttribute('rel'))
        data.drawChart()
      }
    )
  }
}

exports.timeIntervalStatistics = (function (global, $, _, servkit) {
  return function (col, type, headerName, dataLabel, nextPage) {
    return new timeIntervalStatistics(
      col,
      type,
      headerName,
      dataLabel,
      nextPage,
      servkit
    )
  }
})(this, $, _, servkit)

class defectiveResultAnalysis {
  constructor(index, col, type, rowData, dataCB, max) {
    this.index = index
    this.rowData = rowData
    this.data = []
    this.type = type
    this.col = col
    this.max = max !== undefined ? max : 6
    this.drawHtml()
    this.bindingClickValueEvent(dataCB)
  }

  set data(data) {
    var key = this._rowData[0].key
    if (_.isArray(data))
      this._data = data.sort((a, b) => {
        return b[key] - a[key]
      }) // 依大到小排序
  }
  set max(max) {
    this._max = max
  }
  set type(type) {
    this._type = type
  }
  set rowData(rowData) {
    if (_.isArray(rowData)) this._rowData = rowData
    else this._rowData = [rowData]
  }
  set child(child) {
    this._child = child
  }

  changeTableColumn(total) {
    this.showTotal = total
    this.createTable()
    this.drawTable()
  }

  drawHtml() {
    var html = []
    html.push(
      `<div class="col col-xs-12 col-sm-12 col-md-${this.col} col-lg-${this.col}">`
    )
    html.push(`  <div id="${this.index}-frame" class="chart-frame">`)
    html.push(`    <div class="header">${i18n('Layer')}${this.index + 1}</div>`)
    html.push(`    <div class="chart-body">`)
    html.push(`      <div class="chart-title">`)
    html.push(`      <span class="name"></span>`)
    html.push(
      `      <span class="title">${i18n('Analysis_by').replace(
        '[]',
        this._type
      )}</span>`
    )
    html.push(
      `      <span class="max-info">${i18n('Display_At_Most_Top')
        .replace('[]', this._type)
        .replace('[max]', this._max)}</span>`
    )
    html.push(`      </div>`)
    html.push(`      <div class="chart"></div>`)
    html.push(`    </div>`)
    html.push(`    <div class="chart-table"></div>`)
    html.push(`  </div>`)
    html.push(`</div>`)
    $('#chart').append(html.join(''))
    this.$chart = $(`#${this.index}-frame .chart-body>.chart`)
    this.createTable()
  }

  createTable() {
    var showTotal = this.showTotal
    var html = []
    html.push(`<table>`)
    html.push(`  <thead>`)
    html.push(
      `    <tr data-key="name"><th class="row-name"></th><th class="other">${i18n(
        'Other_Projects'
      )}</th>`
    )
    if (showTotal) html.push(`    <th class="total">${i18n('Total')}</th>`)
    html.push(`    </tr>`)
    html.push(`  </thead>`)
    html.push(`  <tbody>`)
    _.each(this._rowData, (row) => {
      html.push(
        `<tr data-key="${row.key}"><td class="row-name">${row.name}</td><td class="other">0</td>`
      )
      if (showTotal) html.push(`<td class="total">0</td>`)
      html.push(`</tr>`)
    })
    html.push(`  </tbody>`)
    html.push(`</table>`)
    $(`#${this.index}-frame .chart-table`).html(html.join(''))
  }

  drawChart() {
    var param = this
    var option = {
      bars: {
        align: 'center',
        barWidth: 0.25,
      },
      xaxis: {
        ticks: [],
      },
      yaxes: [
        {
          min: 0,
          tickDecimals: 0,
          tickFormatter: function (v, axis) {
            return v
          },
        },
        {
          max: 100,
          min: 0,
          position: 'right',
          tickFormatter: function (v, axis) {
            return v + '%'
          },
        },
      ],
      grid: {
        tickColor: '#cecece38',
        clickable: true,
        hoverable: true,
      },
    }

    var d = []
    var total = 0
    if (this._data.length === 1) {
      d.push([-1, -1])
      option.xaxis.ticks.push([-1, ''])
    }
    var filterCh = this.filterCh
    _.each(this._data, (val, key) => {
      if (key < param._max) {
        total += Number(val.defective)
        d.push([key, val.defective])
        var label = val.name.join('，')
        if (filterCh) label = label.replace(/[\u4e00-\u9fa5]*/, '')
        option.xaxis.ticks.push([key, label])
      }
    })
    if (filterCh) option.xaxis.labelWidth = 100
    if (this._data.length === 1) {
      d.push([1, -1])
      option.xaxis.ticks.push([1, ''])
    }
    var dataSet = [
      {
        data: d,
        color: '#33ccffcc',
        bars: {
          show: true,
        },
      },
    ]

    d = []
    var sum = 0
    _.each(this._data, (val, key) => {
      if (key < param._max) {
        sum += Number(val.defective)
        d.push([key, Number(((sum / total) * 100).toFixed(TO_FIXED_NUM))])
      }
    })
    dataSet.push({
      data: d,
      yaxis: 2,
      color: 'red',
      points: {
        show: true,
        fillColor: 'red',
      },
      lines: {
        show: true,
      },
    })

    // console.log(dataSet, option)
    var $plot = $.plot(this.$chart, dataSet, option)
    var drawValueLabel = this.drawValueLabel
    this.$chart.resize(function () {
      drawValueLabel($plot)
    })
    drawValueLabel($plot)
  }

  drawValueLabel($plot) {
    var ctx = $plot.getCanvas().getContext('2d') // get the context
    var data = $plot.getData()[1].data // get your series data
    var xaxis = $plot.getXAxes()[0] // xAxis
    var yaxis = $plot.getYAxes()[1] // yAxis
    var offset = $plot.getPlotOffset() // plots offset
    ctx.font = "16px 'Segoe UI'" // set a pretty label font
    if (document.body.classList.contains('smart-style-5'))
      ctx.fillStyle = 'white'
    else ctx.fillStyle = '#333'

    for (var i = 0; i < data.length; i++) {
      var text = data[i][1] + '%'
      var metrics = ctx.measureText(text)
      var xPos = xaxis.p2c(data[i][0]) + offset.left - metrics.width / 2 // place it in the middle of the bar
      var yPos = yaxis.p2c(data[i][1]) // place at top of bar, slightly up
      if (yPos < 10) yPos += 28
      ctx.fillText(text, xPos, yPos)
    }
  }

  drawTable() {
    var $table = $(`#${this.index}-frame .chart-table`)
    $table.find('.data').remove()
    $table.find(`[data-key!=name]>.other`).text(0)
    $table.find(`[data-key!=name]>.total`).text(0)
    var max = this._max
    var other = {}
    var total = {}
    var decimal = {}
    _.each(this._data, (data, index) => {
      _.each(data, (value, key) => {
        var val = value
        if (
          !decimal[key] &&
          typeof val === 'string' &&
          /[0-9]+.[0-9]+/.test(val)
        )
          decimal[key] = true
        if (index < max) {
          if (key === 'name')
            $table
              .find(`[data-key=${key}]>.other`)
              .before(`<th class="data">${val.join('，')}</th>`)
          else {
            $table
              .find(`[data-key=${key}]>.other`)
              .before(`<td class="data">${val}</td>`)
          }
        } else {
          if (key !== 'name')
            if (!other[key]) other[key] = Number(val)
            else other[key] += Number(val)
        }
        if (key !== 'name')
          if (!total[key]) total[key] = Number(val)
          else total[key] += Number(val)
      })
    })

    var custData = this.custData
    _.each(other, (val, key) => {
      var value = val
      if (decimal[key]) value = val.toFixed(TO_FIXED_NUM)
      if (custData) value = custData(other, value, key)
      $table.find(`[data-key=${key}]>.other`).text(value)
    })
    if (this.showTotal)
      _.each(total, (val, key) => {
        var value = val
        if (decimal[key]) value = val.toFixed(TO_FIXED_NUM)
        if (custData) value = custData(total, value, key)
        $table.find(`[data-key=${key}]>.total`).text(value)
      })
  }

  refresh() {
    this.drawChart()
    this.drawTable()
    this.$chart.trigger('plotclick', 'trigger')
    if (this._child) this._child.refresh()
  }

  bindingClickValueEvent(dataCB) {
    var $chart = this.$chart
    var previousPoint, previousLine
    var param = this
    $chart.bind('plotclick', function (event, pos, item) {
      if (
        ((item && item.series.bars.show) || pos === 'trigger') &&
        param._child
      ) {
        var index = pos === 'trigger' ? 0 : item.dataIndex
        if (param._data.length === 1) index = 0

        if (param._child.$chart.length)
          param._child.$chart
            .closest('.chart-body')
            .find('.chart-title .name')
            .text('')

        var data = param._data[index]
        if (data) {
          // 被選擇的名稱顯示在子圖的標題上
          if (param._child.$chart.length && data.name)
            param._child.$chart
              .closest('.chart-body')
              .find('.chart-title .name')
              .text(data.name.join('，') + ' —')
          data = data.child
        }
        param._child.data = dataCB(data)

        if (param._child) param._child.refresh()
      }
    })

    $chart.bind('plothover', function (event, pos, item) {
      if (item) {
        $chart.css('cursor', 'pointer')
        if (
          previousPoint != item.dataIndex ||
          previousLine !== item.series.yaxis.n
        ) {
          previousPoint = item.dataIndex
          previousLine = item.series.yaxis.n
          $('#tooltip').remove()
          var color = item.series.color
          if (item.series.bars.show)
            showTooltip(
              item.pageX + 20,
              item.pageY,
              color,
              `<strong>${item.datapoint[1]}</strong>`
            )
          else {
            var y = item.datapoint[1].toFixed(TO_FIXED_NUM)
            showTooltip(item.pageX, item.pageY, color, `<strong>${y}</strong>%`)
          }
        }
      } else {
        $('#tooltip').remove()
        $chart.css('cursor', 'default')
        previousPoint = null
      }
    })

    function showTooltip(x, y, color, contents) {
      let fontColor = '#333'
      if (document.body.classList.contains('smart-style-5'))
        fontColor = '#dadada'
      $('<div id="tooltip">' + contents + '</div>')
        .css({
          'position': 'absolute',
          'display': 'none',
          'top': y - 35,
          'left': x - 30,
          'border': '2px solid ' + color,
          'padding': '3px',
          'font-size': '9px',
          'border-radius': '5px',
          'background-color': 'rgba(208, 208, 208, 0.18)',
          'opacity': 0.9,
          'color': fontColor,
        })
        .appendTo('body')
        .fadeIn(200)
    }
  }
}
exports.defectiveResultAnalysis = (function (global, $, _, servkit) {
  return function (index, col, type, rowData, dataCB, max) {
    return new defectiveResultAnalysis(index, col, type, rowData, dataCB, max)
  }
})(this, $, _, servkit)

class efficiencyAnalysis {
  constructor(index, col, type, rowData, dataCB, max) {
    this.index = index
    this.rowData = rowData
    this.data = []
    this.type = type
    this.col = col
    this.max = max !== undefined ? max : 6
    this.reverse = false
    this.drawHtml()
    this.bindingClickValueEvent(dataCB)
  }

  set data(data) {
    if (this.sortKey) {
      var reverse = this.reverse
      var key = this.sortKey
      if (_.isArray(data))
        this._data = data.sort((a, b) => {
          return reverse ? a[key] - b[key] : b[key] - a[key]
        }) // 依大到小排序
    } else this._data = data
  }
  set max(max) {
    this._max = max
  }
  set type(type) {
    this._type = type
  }
  set rowData(rowData) {
    if (_.isArray(rowData)) this._rowData = rowData
    else this._rowData = [rowData]
  }
  set child(child) {
    this._child = child
  }
  set dataLabel(dataLabel) {
    if (_.isArray(dataLabel)) this._dataLabel = dataLabel
    else {
      if (!this._dataLabel) this._dataLabel = []
      this._dataLabel[0] = dataLabel
    }
    this.drawLegend()
  }

  changeTableColumn(other, total) {
    this.showOhter = other
    this.showTotal = total
    this.createTable()
    this.drawTable()
  }

  drawHtml() {
    var html = []
    html.push(
      `<div class="col col-xs-12 col-sm-12 col-md-${this.col} col-lg-${this.col}">`
    )
    html.push(`  <div id="${this.index}-frame" class="chart-frame">`)
    html.push(`    <div class="header">${i18n('Layer')}${this.index + 1}</div>`)
    html.push(`    <div class="chart-body">`)
    html.push(`      <div class="chart-title">`)
    html.push(`      <span class="name"></span>`)
    html.push(
      `      <span class="title">${i18n('Analysis_by').replace(
        '[]',
        this._type
      )}</span>`
    )
    html.push(
      `      <span class="max-info">${i18n('Display_At_Most_Top')
        .replace('[]', this._type)
        .replace('[max]', this._max)}</span>`
    )
    html.push(`      </div>`)
    html.push(`      <div class="chart"></div>`)
    html.push(`      <div class="chart-legend"></div>`)
    html.push(`    </div>`)
    html.push(`    <div class="chart-table"></div>`)
    html.push(`  </div>`)
    html.push(`</div>`)
    $('#chart').append(html.join(''))
    this.$chart = $(`#${this.index}-frame .chart-body>.chart`)
    this.createTable()
  }

  drawLegend() {
    $(`#${this.index}-frame`).find('.chart-legend').empty()
    var html = []
    var colors = this.chartColors
    var dataShowType = this.dataShowType
    _.each(this._dataLabel, (legend, key) => {
      if (legend) {
        html.push(`<div>`)
        html.push(`  <div class="chart-legend-color">`)
        switch (dataShowType[key]) {
          case 'point-line':
            html.push(
              `<div class="point-line-icon"><div style="background-color: ${colors[key]};"></div><hr style="border-top-color: ${colors[key]};"></div>`
            )
            break
          case 'line':
            html.push(
              `<div class="line-icon"><hr style="border-top-color: ${colors[key]};"></div>`
            )
            break
          case 'dashed':
            html.push(
              `<div class="dashed-icon"><hr style="border-top-color: ${colors[key]};border-top-style: dashed;"></div>`
            )
            break
          case 'bar':
            html.push(
              `<div class="bar-icon"><hr style="background: ${colors[key]};"></div>`
            )
            break
        }
        html.push(`  </div>`)
        html.push(`  <div class="chart-legend-label">${legend}</div>`)
        html.push(`</div>`)
      }
    })
    $(`#${this.index}-frame`).find('.chart-legend').append(html.join(''))
  }

  createTable() {
    var showOhter = this.showOhter
    var showTotal = this.showTotal
    var html = []
    html.push(`<table>`)
    html.push(`  <thead>`)
    html.push(
      `    <tr data-key="name"><th width="30px"></th><th class="row-name" width="50px"></th>`
    )
    if (showOhter)
      html.push(`    <th class="other">${i18n('Other_Projects')}</th>`)
    if (showTotal) html.push(`    <th class="total">${i18n('Total')}</th>`)
    html.push(`    </tr>`)
    html.push(`  </thead>`)
    html.push(`  <tbody>`)
    var rowLength = this._rowData.length
    _.each(this._rowData, (row, key) => {
      html.push(`<tr data-key="${row.key}">`)
      if (!key)
        html.push(
          `  <td class="rows-title" rowspan="${rowLength}">${i18n(
            'Human_Time'
          )}</td>`
        )
      html.push(`  <td class="row-name">${row.name}</td>`)
      if (showOhter) html.push(`  <td class="other">0</td>`)
      if (showTotal) html.push(`  <td class="total">0</td>`)
      html.push(`</tr>`)
    })
    html.push(`  </tbody>`)
    html.push(`</table>`)
    $(`#${this.index}-frame .chart-table`).html(html.join(''))
  }

  drawChart() {
    var param = this
    var option = {
      // series: {
      //   valueLabels: {
      //     show: true
      //   }
      // },
      xaxis: {
        ticks: [],
      },
      yaxis: {
        tickFormatter: function (v, axis) {
          return v.toFixed(TO_FIXED_NUM) + '%'
        },
      },
      grid: {
        tickColor: '#cecece38',
        clickable: true,
        hoverable: true,
      },
    }

    var dataSet = []
    var max, min
    _.each(this.chartKeys, (chartKey, index) => {
      var d = []
      if (param.dataShowType[index] === 'bar' && param._data.length === 1) {
        d.push([-1, -1])
        option.xaxis.ticks.push([-1, ''])
      }
      var filterCh = param.filterCh
      _.each(param._data, (val, key) => {
        if (key < param._max) {
          if (!max || Number(val[chartKey]) > max) max = Number(val[chartKey])
          if (!min || Number(val[chartKey]) < min) min = Number(val[chartKey])
          d.push([key, val[chartKey]])
          var label = val.name.join('，')
          if (filterCh) label = label.replace(/[\u4e00-\u9fa5]*/, '')
          option.xaxis.ticks.push([key, label])
        }
      })
      if (filterCh) option.xaxis.labelWidth = 100
      if (param.dataShowType[index] === 'bar' && param._data.length === 1) {
        d.push([1, -1])
        option.xaxis.ticks.push([1, ''])
      }

      if (d.length) {
        var data = {
          data: d,
          color: param.chartColors[index],
        }
        if (param.dataShowType[index] === 'bar') {
          data.bars = {
            show: true,
            barWidth: 0.2,
            // align: 'left',
            order: index + 1,
          }
          // if (!index) data.bars.align = 'right'
        }
        if (param.dataShowType[index] === 'line') {
          if (data.data.length < 2)
            // 如果只有一筆資料改用點呈現
            data.points = {
              show: true,
              fillColor: param.chartColors[index],
            }
          else
            data.lines = {
              show: true,
            }
        }

        dataSet.push(data)
      }
    })
    // console.log(this._data)
    option.yaxis.max = Math.ceil(max)
    option.yaxis.min = Math.floor(min)
    // 如果最大值跟最小值相同，就把間距拉寬一點，不然值會擠在下面
    if (option.yaxis.max === option.yaxis.min) {
      option.yaxis.max = option.yaxis.max + 1
      option.yaxis.min = option.yaxis.min - 1
    }
    // console.log(option.yaxis.max, option.yaxis.min)

    // console.log(dataSet, option)
    $.plot(this.$chart, dataSet, option)
  }

  drawTable() {
    var $table = $(`#${this.index}-frame .chart-table`)
    $table.find('.data').remove()
    $table.find(`[data-key!=name]>.other`).text(0)
    $table.find(`[data-key!=name]>.total`).text(0)
    var max = this._max
    var other = {}
    var total = {}
    var decimal = {}
    _.each(this._data, (data, index) => {
      _.each(data, (value, key) => {
        var val = value
        if (
          !decimal[key] &&
          typeof val === 'string' &&
          /[0-9]+.[0-9]+/.test(val)
        )
          decimal[key] = true
        if (index < max) {
          var html = `<td class="data">${val}</td>`
          if (key === 'name') html = `<th class="data">${val.join('，')}</th>`
          if ($table.find(`[data-key=${key}]>.data`).length)
            $table.find(`[data-key=${key}]>.data:last`).after(html)
          else $table.find(`[data-key=${key}]>.row-name`).after(html)
        } else {
          if (key !== 'name')
            if (!other[key]) other[key] = Number(val)
            else other[key] += Number(val)
        }
        if (key !== 'name')
          if (!total[key]) total[key] = Number(val)
          else total[key] += Number(val)
      })
    })

    _.each(other, (val, key) => {
      var value = val
      if (decimal[key]) value = val.toFixed(TO_FIXED_NUM)
      $table.find(`[data-key=${key}]>.other`).text(value)
    })
    if (this.showTotal)
      _.each(total, (val, key) => {
        var value = val
        if (decimal[key]) value = val.toFixed(TO_FIXED_NUM)
        $table.find(`[data-key=${key}]>.total`).text(value)
      })
  }

  refresh() {
    this.drawChart()
    this.drawTable()
    this.$chart.trigger('plotclick', 'trigger')
    if (this._child) this._child.refresh()
  }

  bindingClickValueEvent(dataCB) {
    var $chart = this.$chart
    var previousPoint, previousLine
    var param = this
    $chart.bind('plotclick', function (event, pos, item) {
      if ((item || pos === 'trigger') && param._child) {
        var index = pos === 'trigger' ? 0 : item.dataIndex
        if (param._data.length === 1) index = 0

        if (param._child.$chart.length)
          param._child.$chart
            .closest('.chart-body')
            .find('.chart-title .name')
            .text('')

        var data = param._data[index]
        if (data) {
          // 被選擇的名稱顯示在子圖的標題上
          if (param._child.$chart.length && data.name)
            param._child.$chart
              .closest('.chart-body')
              .find('.chart-title .name')
              .text(data.name.join('，') + ' —')
          data = data.child
        }
        param._child.data = dataCB(data)

        if (param._child) param._child.refresh()
      }
    })

    $chart.bind('plothover', function (event, pos, item) {
      if (item) {
        $chart.css('cursor', 'pointer')
        if (
          previousPoint != item.dataIndex ||
          previousLine !== item.series.yaxis.n
        ) {
          previousPoint = item.dataIndex
          previousLine = item.series.yaxis.n
          $('#tooltip').remove()
          var color = item.series.color
          if (item.series.bars.show)
            showTooltip(
              item.pageX + 20,
              item.pageY,
              color,
              `<strong>${item.datapoint[1]}</strong>`
            )
          else {
            var y = item.datapoint[1].toFixed(TO_FIXED_NUM)
            showTooltip(item.pageX, item.pageY, color, `<strong>${y}</strong>%`)
          }
        }
      } else {
        $('#tooltip').remove()
        $chart.css('cursor', 'default')
        previousPoint = null
      }
    })

    function showTooltip(x, y, color, contents) {
      let fontColor = '#333'
      if (document.body.classList.contains('smart-style-5'))
        fontColor = '#dadada'
      $('<div id="tooltip">' + contents + '</div>')
        .css({
          'position': 'absolute',
          'display': 'none',
          'top': y - 35,
          'left': x - 30,
          'border': '2px solid ' + color,
          'padding': '3px',
          'font-size': '9px',
          'border-radius': '5px',
          'background-color': 'rgba(208, 208, 208, 0.18)',
          'opacity': 0.9,
          'color': fontColor,
        })
        .appendTo('body')
        .fadeIn(200)
    }
  }
}
exports.efficiencyAnalysis = (function (global, $, _, servkit) {
  return function (index, col, type, rowData, dataCB, max) {
    return new efficiencyAnalysis(index, col, type, rowData, dataCB, max)
  }
})(this, $, _, servkit)
