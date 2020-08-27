function render(widget, done, deviceStatusData) {
  // if (!widget.is3D) {
  //   if (widget.isRotating()) {
  //     widget.asJquery().find('.widget-body').addClass('three-d-box');
  //     widget.is3D = true;
  //   }
  // } else {
  //   if (!widget.isRotating()) {
  //     delete widget.is3D;
  //     widget.asJquery().find('.widget-body').removeClass('three-d-box');
  //   }
  // }

  var $pieChart = widget.asJquery().find('#device-status-pie-chart'),
    $speedChart = widget.asJquery().find('#device-status-left-top-speed'),
    $feedChart = widget.asJquery().find('#device-status-right-top-feed'),
    $oeeChart = widget.asJquery().find('#device-status-left-bottom-oee'),
    $partChart = widget.asJquery().find('#device-status-right-bottom-part')

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

  console.log(deviceStatusData)
  //  deviceStatusData[0].eachMachine('G_CONS()', function (multisystem, machineId) {...}));
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

  //  deviceStatusData[0].eachMachine('G_CONS()', function (multisystem, machineId) {
  //    if (machineId.startsWith('_')) {
  //      switch (multisystem[0][0]) {
  //        case '11':
  //          statusMap.online += 1;
  //          break;
  //        case '12':
  //          statusMap.idle += 1;
  //          break;
  //        case '13':
  //          statusMap.alarm += 1;
  //          break;
  //        case 'B':
  //          statusMap.offline += 1;
  //          break;
  //        default:
  //          console.warn(widget.parameter.widgetId + ': 令人匪夷所思的狀態代號 「' + multisystem[0][0] + '」');
  //          break;
  //      }
  //    }
  //  });

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
          },
          /*,
                    threshold : 0.1*/
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

  function renderBarChart(canvasEle, data, colName) {
    var prevFiveData = _.chain(data)
      .sortBy(colName)
      .filter(function (ele) {
        return ele.machineId.startsWith('_')
      })
      .last(5)
      .value()
      .reverse()

    // console.log(colName);
    // console.log(prevFiveData);

    var barOptions = {
      // Boolean - Determines whether to draw tooltips on the canvas or not
      showTooltips: false,
      //Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
      scaleBeginAtZero: true,
      //Boolean - Whether grid lines are shown across the chart
      scaleShowGridLines: true,
      //String - Colour of the grid lines
      scaleGridLineColor: 'rgba(0,0,0,.05)',
      //Number - Width of the grid lines
      scaleGridLineWidth: 1,
      //Boolean - If there is a stroke on each bar
      barShowStroke: false,
      //Number - Pixel width of the bar stroke
      barStrokeWidth: 1,
      //Number - Spacing between each of the X value sets
      barValueSpacing: 5,
      //Number - Spacing between data sets within X values
      barDatasetSpacing: 1,
      //Boolean - Re-draw chart on page resize
      responsive: false,
      animation: false,
      //String - A legend template
      legendTemplate:
        '<ul class="<%=name.toLowerCase()%>-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].lineColor%>"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>',
    }

    var barData = {
      labels: _.pluck(prevFiveData, 'machineName'),
      datasets: [
        // {
        //   label: "My First dataset",
        //   fillColor: "rgba(220,220,220,0.5)",
        //   strokeColor: "rgba(220,220,220,0.8)",
        //   highlightFill: "rgba(220,220,220,0.75)",
        //   highlightStroke: "rgba(220,220,220,1)",
        //   data: _.pluck(prevFiveData, colName)
        // },
        {
          label: 'My Second dataset',
          fillColor: servkit.colors.blue,
          //          fillColor: "rgba(151,187,205,0.5)",
          // strokeColor: "rgba(151,187,205,0.8)",
          highlightFill: 'rgba(151,187,205,0.75)',
          highlightStroke: 'rgba(151,187,205,1)',
          data: _.pluck(prevFiveData, colName),
        },
      ],
    }

    // render chart
    var ctx = canvasEle.getContext('2d')
    var myNewChart_2 = new window.Chart(ctx).Bar(barData, barOptions)
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
    } else {
      return ((oper / power) * 100).toFixed(2)
    }
  }

  function barChartData() {
    var result = []

    _.each(deviceStatusData, function (DeviceStatusType) {
      DeviceStatusType.eachMachine('G_SPMS()', function (
        multisystem,
        machineId
      ) {
        result.push({
          machineId: machineId,
          machineName: servkit.getMachineName(machineId),
          speed: toNumber(multisystem[0][0]), //TODO:都先拿多系統的第一個系統的值
          feed: toNumber(
            DeviceStatusType.getValue('G_ACTF()', machineId)[0][0]
          ),
          oee: calOee(
            toNumber(DeviceStatusType.getValue('G_OPRT()', machineId)[0][0]),
            toNumber(DeviceStatusType.getValue('G_ELCT()', machineId)[0][0])
          ),
          part: toNumber(
            DeviceStatusType.getValue('G_TOCP()', machineId)[0][0]
          ),
        })
      })
    })

    //    deviceStatusData[0].eachMachine('G_SPMS()', function (multisystem, machineId) {
    //      result.push({
    //        machineId: machineId,
    //        machineName: servkit.getMachineName(machineId),
    //        speed: toNumber(multisystem[0][0]),
    //        feed: toNumber(deviceStatusData[0].getValue('G_ACTF()', machineId)[0][0]),
    //        oee: calOee(toNumber(deviceStatusData[0].getValue('G_OPRT()', machineId)[0][0]), toNumber(deviceStatusData[0].getValue('G_ELCT()', machineId)[0][0])),
    //        part: toNumber(deviceStatusData[0].getValue('G_TOCP()', machineId)[0][0])
    //      });
    //    });

    // console.log(result);
    return result
  }

  if (widget.isRotating()) {
    var barData = barChartData()

    renderBarChart($speedChart[0], barData, 'speed')
    renderBarChart($feedChart[0], barData, 'feed')
    renderBarChart($oeeChart[0], barData, 'oee')
    renderBarChart($partChart[0], barData, 'part')
  }

  done()
}
