;(function (widget, done, deviceStatusData) {
  var curShiftSeq = ''
  updateCurShift()

  if (!widget.shiftData) {
    widget.shiftData = {}
  }

  if (!widget.timeCount) {
    widget.timeCount = 0
  }

  if (widget.timeCount % 900 == 0) {
    //updateCurShift();

    updateShiftData()
    widget.timeCount = 0
  }

  widget.timeCount += 5

  function updateCurShift() {
    servkit.ajax(
      {
        url: 'api/workshift/now',
        type: 'GET',
        async: false,
        contentType: 'application/json',
      },
      {
        success: function (data) {
          curShiftSeq = data.name
        },
      }
    )
  }

  function updateShiftData() {
    var allmachine = servkit.getMachineList()
    var today = moment().format('YYYYMMDD')

    hippo
      .newSimpleExhaler()
      .space('shiftdata_for_monitor')
      .index('machine_id', allmachine)
      .indexRange('date', today, today)
      .columns(
        'machine_id',
        'date',
        'work_shift',
        'power_millisecond',
        'oper_millisecond',
        'cut_millisecond',
        'partcount'
      )
      .exhale(function (exhalable) {
        var list = exhalable.exhalable

        for (var i = 0; i < list.length; ++i) {
          var mid = list[i].machine_id
          if (!Object.prototype.hasOwnProperty.call(widget.shiftData, mid)) {
            widget.shiftData[mid] = {} //shiftData[mid] = {};
          }
          widget.shiftData[mid][list[i].work_shift] = list[i]
        }
      })
  }

  var $pieChart = widget.asJquery().find('#device-status-pie-chart'),
    $speedChart = widget.asJquery().find('#device-status-left-top-speed'),
    $feedChart = widget.asJquery().find('#device-status-right-top-feed'),
    $oeeChart = widget.asJquery().find('#device-status-left-bottom-oee'),
    $partChart = widget.asJquery().find('#device-status-right-bottom-part')

  $pieChart.empty()
  $speedChart.empty()
  $feedChart.empty()
  $oeeChart.empty()
  $partChart.empty()

  if (widget.isRotating()) {
    var windowHeight = $(window).height(),
      windowWidth = $(window).width()

    $pieChart.css({
      width: windowWidth * 0.97,
      height: windowHeight * 0.4,
      marginTop: 100,
    })

    widget.asJquery().find('.device-status-left-top').show()
    widget.asJquery().find('.device-status-right-top').show()
    widget.asJquery().find('.device-status-left-bottom').show()
    widget.asJquery().find('.device-status-right-bottom').show()
    $speedChart.attr('height', windowHeight * 0.25)
    $feedChart.attr('height', windowHeight * 0.25)
    $oeeChart.attr('height', windowHeight * 0.25)
    $partChart.attr('height', windowHeight * 0.25)

    $speedChart.attr('width', windowWidth * 0.27)
    $feedChart.attr('width', windowWidth * 0.27)
    $oeeChart.attr('width', windowWidth * 0.27)
    $partChart.attr('width', windowWidth * 0.27)
  } else {
    $pieChart.css({
      width: '',
      height: '',
      marginTop: '',
    })

    widget.asJquery().find('.device-status-left-top').hide()
    widget.asJquery().find('.device-status-right-top').hide()
    widget.asJquery().find('.device-status-left-bottom').hide()
    widget.asJquery().find('.device-status-right-bottom').hide()
  }

  var statusMap = {
    online: 0,
    idle: 0,
    alarm: 0,
    offline: 0,
  }

  _.each(deviceStatusData, function (DeviceStatusType) {
    DeviceStatusType.eachMachine('G_CONS()', function (multisystem, machineId) {
      if (machineId.startsWith('_')) {
        switch (multisystem[0][0]) {
          case '11':
            statusMap.online += 1
            break
          case '12':
            statusMap.idle += 1
            break
          case '13':
            statusMap.alarm += 1
            break
          case 'B':
            statusMap.offline += 1
            break
          default:
            console.warn(
              widget.parameter.widgetId +
                ': 令人匪夷所思的狀態代號 「' +
                multisystem[0][0] +
                '」'
            )
            break
        }
      }
    })
  })

  var pieData = [
    {
      label: 'online',
      data: statusMap.online,
      color: servkit.statusColors.online,
    },
    {
      label: 'idle',
      data: statusMap.idle,
      color: servkit.statusColors.idle,
    },
    {
      label: 'alarm',
      data: statusMap.alarm,
      color: servkit.statusColors.alarm,
    },
    {
      label: 'offline',
      data: statusMap.offline,
      color: servkit.statusColors.offline,
    },
  ]

  $.plot($pieChart, pieData, {
    series: {
      pie: {
        show: true,
        innerRadius: 0.5,
        radius: 1,
        label: {
          show: true,
          radius: 2 / 3,
          formatter: function (label, series) {
            var count = series.data[0][1],
              fontSize = widget.isRotating() ? '1.3em' : '0.8em'
            return (
              '<div style="font-size:' +
              fontSize +
              ';text-align:center;padding:4px;color:white;">' +
              label +
              '<br/>' +
              Math.round(series.percent) +
              '% (' +
              count +
              ')' +
              '</div>'
            )
          },
          background: {
            opacity: 0.5,
            color: '#000',
          } /*,
          threshold : 0.1*/,
        },
      },
    },
    legend: {
      show: false,
      noColumns: 1, // number of colums in legend table
      labelFormatter: null, // fn: string -> string
      labelBoxBorderColor: '#000', // border color for the little label boxes
      container: null, // container (as jQuery object) to put legend in, null means default on top of graph
      position: 'ne', // position of default legend container within plot
      margin: [5, 10], // distance from grid edge to default legend container within plot
      backgroundColor: '#efefef', // null means auto-detect
      backgroundOpacity: 1, // set to 0 to avoid background
    },
    grid: {
      hoverable: true,
      clickable: true,
    },
  })

  function renderBarChart(svgEleId, data, colName, yMaxVal) {
    var prevFiveData = _.chain(data)
      .sortBy(colName)
      .filter(function (ele) {
        return ele.machineId.startsWith('_')
      })
      .last(5)
      .value()
      .reverse()

    var svg = d3.select('#' + svgEleId),
      margin = { top: 20, right: 40, bottom: 30, left: 60 },
      width = +svg.attr('width') - margin.left - margin.right,
      height = +svg.attr('height') - margin.top - margin.bottom

    var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
      y = d3.scaleLinear().rangeRound([height, 0])

    var g = svg
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    x.domain(
      prevFiveData.map(function (d) {
        return d.machineName
      })
    )

    var newYMaxVal =
      yMaxVal |
      d3.max(prevFiveData, function (d) {
        return d[colName]
      })
    y.domain([0, newYMaxVal])

    g.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-10)')

    g.append('g')
      .attr('class', 'axis axis--y')
      .call(d3.axisLeft(y))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '0.71em')
      .attr('text-anchor', 'end')
      .text('Frequency')

    var bars = g.selectAll('.bar').data(prevFiveData)

    // enter bar
    bars
      .enter()
      .append('rect')

      // update bar
      .attr('class', 'bar')
      .attr('x', function (d) {
        return x(d.machineName)
      })
      .attr('y', function (d) {
        return y(d[colName])
      })
      .attr('width', x.bandwidth())
      .attr('height', function (d) {
        return Math.max(0, height - y(d[colName]))
      })

    // exit bar
    bars.exit().remove()

    var yTextPadding = -5
    var text = g.selectAll('.bartext').data(prevFiveData)

    // enter text
    text
      .enter()
      .append('text')

      // update text
      .attr('class', 'bartext')
      .attr('text-anchor', 'middle')
      .attr('x', function (d, i) {
        return x(d.machineName) + x.bandwidth() / 2
      })
      .attr('y', function (d, i) {
        return y(d[colName]) + yTextPadding
      })
      .text(function (d) {
        return d[colName]
      })

    // exit text
    text.exit().remove()
  }

  function toNumber(val) {
    var result = parseInt(val)
    if (!_.isNaN(result) && _.isNumber(result)) {
      return result
    }
    return 0
  }

  function calOee(oper, power) {
    if (power <= 0) {
      return 0
    } else if (power < oper) {
      return 100.0
    } else {
      return parseFloat(((oper / power) * 100).toFixed(2))
    }
  }

  function barChartData() {
    var result = []

    _.each(deviceStatusData, function (DeviceStatusType) {
      DeviceStatusType.eachMachine('G_SPMS()', function (
        multisystem,
        machineId
      ) {
        var brand = servkit.getMachineBrand(machineId)

        var oprt = toNumber(
          DeviceStatusType.getValue('G_OPRT()', machineId)[0][0]
        )
        var elect = toNumber(
          DeviceStatusType.getValue('G_ELCT()', machineId)[0][0]
        )
        var tocp = toNumber(
          DeviceStatusType.getValue('G_TOCP()', machineId)[0][0]
        )

        var id = machineId

        if (servtechConfig.ST_MONITOR_USE_SHIFT_DATA) {
          if (
            widget.shiftData != undefined &&
            widget.shiftData[id] != undefined
          ) {
            if (widget.shiftData[id][curShiftSeq] != undefined) {
              if (tocp > widget.shiftData[id][curShiftSeq].partcount) {
                tocp = tocp - widget.shiftData[id][curShiftSeq].partcount
              } else {
                tocp = 0
              }

              if (oprt > widget.shiftData[id][curShiftSeq].oper_millisecond) {
                oprt = oprt - widget.shiftData[id][curShiftSeq].oper_millisecond
              } else {
                oprt = 0
              }

              if (elect > widget.shiftData[id][curShiftSeq].power_millisecond) {
                elect =
                  elect - widget.shiftData[id][curShiftSeq].power_millisecond
              } else {
                elect = 0
              }
            } else {
              console.debug('no shift data , use original quality')
            }
          }
        }

        // indicator lamp alwayse is 0

        if (brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1) {
          tocp = 0
        }

        result.push({
          machineId: machineId,
          machineName: servkit.getMachineName(machineId),
          speed: toNumber(multisystem[0][0]), //TODO:都先拿多系統的第一個系統的值
          feed: toNumber(
            DeviceStatusType.getValue('G_ACTF()', machineId)[0][0]
          ),
          oee: calOee(oprt, elect),
          part: tocp,
        })
      })
    })

    return result
  }

  if (widget.isRotating()) {
    var barData = barChartData()
    renderBarChart('device-status-left-bottom-oee', barData, 'oee', 100.0)
    renderBarChart('device-status-right-bottom-part', barData, 'part')

    if (servtechConfig.ST_MONITOR_SHWO_SPEED_FEED) {
      $('#dslbs').removeClass('hide')
      $('#dsls').removeClass('hide')
      $('#dsrf').removeClass('hide')
      $('#dslf').removeClass('hide')

      renderBarChart('device-status-right-top-feed', barData, 'feed')
      renderBarChart('device-status-left-top-speed', barData, 'speed')
    }
  }

  done()
})
