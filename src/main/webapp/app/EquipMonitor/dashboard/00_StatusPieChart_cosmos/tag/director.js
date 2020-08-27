function render(widget, done, machineMap) {
  /*
    var curShiftSeq = "";
    //updateCurShift();

    if (!widget.shiftData) {
        widget.shiftData = {};
    }

    if (!widget.timeCount) {
        widget.timeCount = 0;
    }

    if (widget.timeCount % 900 == 0) {
        //updateCurShift();

        //updateShiftData();
        widget.timeCount = 0;

    }

    widget.timeCount += 5;

    function updateCurShift() {
        servkit.ajax({
            url: 'api/workshift/now',
            type: 'GET',
            async: false,
            contentType: 'application/json',
            async: false
        }, {
            success: function (data) {
                curShiftSeq = data.name;
            }
        });
    }

    function updateShiftData() {

        var allmachine = servkit.getMachineList();
        var today = moment().format("YYYYMMDD");

        hippo.newSimpleExhaler()
            .space("shiftdata_for_monitor")
            .index("machine_id", allmachine)
            .indexRange("date", today, today)
            .columns(
                "machine_id",
                "date",
                "work_shift",
                "power_millisecond",
                "oper_millisecond",
                "cut_millisecond",
                "partcount"
            )
            .exhale(function (exhalable) {

                var list = exhalable.exhalable;

                for (var i = 0; i < list.length; ++i) {
                    var mid = list[i].machine_id;
                    if (!widget.shiftData.hasOwnProperty(mid)) {
                        widget.shiftData[mid] = {};//shiftData[mid] = {};
                    }
                    widget.shiftData[mid][list[i].work_shift] = list[i];
                }

            });

    } */
  getCurrentShift(createTopLastOEEChart)
  function getCurrentShift(callback) {
    servkit.ajax(
      {
        url: 'api/workshift/now',
        type: 'GET',
        contentType: 'application/json',
      },
      {
        success: function success(data) {
          var currentWorkShiftName = data.name
          callback(currentWorkShiftName)
        },
      }
    )
  }

  function createTopLastOEEChart(workShift) {
    var allmachine = servkit.getMachineList()
    var today = moment().format('YYYYMMDD')

    hippo
      .newSimpleExhaler()
      .space('utilization_time_work_shift')
      .index('machine_id', allmachine)
      .indexRange('date', today, today)
      .columns(
        'machine_id',
        'date',
        'work_shift',
        'power_millisecond',
        'operate_millisecond',
        'cutting_millisecond',
        'work_shift_millisecond'
      )
      .exhale(function (exhalable) {
        var currentWorkShiftData = _.where(exhalable.exhalable, {
          work_shift: workShift,
        })
        var result = _.each(currentWorkShiftData, function (data) {
          data['machineId'] = data.machine_id
          data['machineName'] = servkit.getMachineName(data.machine_id)
          data['oee'] = parseFloat(
            (
              (data.operate_millisecond / data.work_shift_millisecond) *
              100
            ).toFixed(2)
          )
        })
        widget.shiftData = result
      })
  }

  var $pieChart = widget.asJquery().find('#device-status-pie-chart'),
    $speedChart = widget.asJquery().find('#device-status-left-top-speed'),
    $feedChart = widget.asJquery().find('#device-status-right-top-feed'),
    $oeeChart = widget.asJquery().find('#device-status-left-bottom-oee'),
    $partChart = widget.asJquery().find('#device-status-right-bottom-part'),
    $oeeTop5Chart = widget
      .asJquery()
      .find('#device-status-left-bottom-oee-top5'),
    $oeeLast5Chart = widget
      .asJquery()
      .find('#device-status-right-bottom-oee-last5')

  $pieChart.empty()
  $speedChart.empty()
  $feedChart.empty()
  $oeeChart.empty()
  $partChart.empty()
  $oeeTop5Chart.empty()
  $oeeLast5Chart.empty()

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
    $oeeTop5Chart.attr('height', windowHeight * 0.25)
    $oeeLast5Chart.attr('height', windowHeight * 0.25)

    $speedChart.attr('width', windowWidth * 0.27)
    $feedChart.attr('width', windowWidth * 0.27)
    $oeeChart.attr('width', windowWidth * 0.27)
    $partChart.attr('width', windowWidth * 0.27)
    $oeeTop5Chart.attr('width', windowWidth * 0.27)
    $oeeLast5Chart.attr('width', windowWidth * 0.27)
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

  /*
     console.log(deviceStatusData);

     var machineMap = {};
     convertDeviceStatusData(deviceStatusData,machineMap);
     console.log(machineMap);
     */

  _.map(machineMap, function (machineData, machineId) {
    if (machineId.startsWith('_')) {
      switch (machineData['G_CONS()'][0]) {
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
              machineData[0][0] +
              '」'
          )
          break
      }
    }
  })

  /*
     _.each(deviceStatusData, function(DeviceStatusType){
     DeviceStatusType.eachMachine('G_CONS()', function (multisystem, machineId) {
     if (machineId.startsWith('_')) {
     switch (multisystem[0][0]) {
     case '11':
     statusMap.online += 1;
     break;
     case '12':
     statusMap.idle += 1;
     break;
     case '13':
     statusMap.alarm += 1;
     break;
     case 'B':
     statusMap.offline += 1;
     break;
     default:
     console.warn(widget.parameter.widgetId + ': 令人匪夷所思的狀態代號 「' + multisystem[0][0] + '」');
     break;
     }
     }
     });
     });
     */

  var pieData = [
    {
      label: servkit.getMachineLightName(11),
      data: statusMap.online,
      color: servkit.statusColors.online,
    },
    {
      label: servkit.getMachineLightName(12),
      data: statusMap.idle,
      color: servkit.statusColors.idle,
    },
    {
      label: servkit.getMachineLightName(13),
      data: statusMap.alarm,
      color: servkit.statusColors.alarm,
    },
    {
      label: servkit.getMachineLightName(0),
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
                                         threshold : 0.1 */
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
    var svg = d3.select('#' + svgEleId),
      margin = {
        top: 20,
        right: 40,
        bottom: 30,
        left: 60,
      },
      width = +svg.attr('width') - margin.left - margin.right,
      height = +svg.attr('height') - margin.top - margin.bottom

    var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
      y = d3.scaleLinear().rangeRound([height, 0])

    var g = svg
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    x.domain(
      data.map(function (d) {
        return d.machineName
      })
    )

    var newYMaxVal =
      yMaxVal |
      d3.max(data, function (d) {
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

    var bars = g.selectAll('.bar').data(data)

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
    var text = g.selectAll('.bartext').data(data)

    // enter text
    text
      .enter()
      .append('text')

      // update text
      .attr('class', 'bartext')
      .attr('text-anchor', 'middle')
      .attr('x', function (d) {
        return x(d.machineName) + x.bandwidth() / 2
      })
      .attr('y', function (d) {
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

  function barChartData(machineMap) {
    /*
         console.log(deviceStatusData);

         var machineMap = {};
         convertDeviceStatusData(deviceStatusData,machineMap);
         console.log(machineMap);
         */

    var result = []
    var oprt = 0
    var elect = 0
    var tocp = 0
    var feed = 0
    var speed = 0
    _.map(machineMap, function (machineData, machineId) {
      var brand = servkit.getMachineBrand(machineId)
      if (machineId.startsWith('_')) {
        if (machineData['G_OPRT()']) oprt = toNumber(machineData['G_OPRT()'][0])
        if (machineData['G_ELCT()'])
          elect = toNumber(machineData['G_ELCT()'][0])
        if (machineData['G_TOCP()']) tocp = toNumber(machineData['G_TOCP()'][0])
        if (machineData['G_ACTF()']) feed = toNumber(machineData['G_ACTF()'][0])
        if (machineData['G_SPMS()'])
          speed = toNumber(machineData['G_SPMS()'][0])

        var flag = false

        if (
          Object.prototype.hasOwnProperty.call(
            window,
            'ST_MONITOR_USE_SHIFT_DATA'
          )
        ) {
          flag = window.ST_MONITOR_USE_SHIFT_DATA
        }

        if (Object.prototype.hasOwnProperty.call(window, 'servtechConfig')) {
          flag = servtechConfig.ST_MONITOR_USE_SHIFT_DATA
        }

        if (flag) {
          if (
            widget.shiftStatisticMap != undefined &&
            widget.shiftStatisticMap[machineId] != undefined
          ) {
            if (
              widget.shiftStatisticMap[machineId][widget.curShiftName] !=
              undefined
            ) {
              if (
                tocp >
                widget.shiftStatisticMap[machineId][widget.curShiftName]
                  .partcount
              ) {
                tocp =
                  tocp -
                  widget.shiftStatisticMap[machineId][widget.curShiftName]
                    .partcount
              } else {
                tocp = 0
              }

              if (
                oprt >
                widget.shiftStatisticMap[machineId][widget.curShiftName]
                  .oper_millisecond
              ) {
                oprt =
                  oprt -
                  widget.shiftStatisticMap[machineId][widget.curShiftName]
                    .oper_millisecond
              } else {
                oprt = 0
              }

              if (
                elect >
                widget.shiftStatisticMap[machineId][widget.curShiftName]
                  .power_millisecond
              ) {
                elect =
                  elect -
                  widget.shiftStatisticMap[machineId][widget.curShiftName]
                    .power_millisecond
              } else {
                elect = 0
              }
            } else {
              console.warn('no shift data , use original quality')
            }
          }
        }

        if (brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1) {
          tocp = 0
        }

        result.push({
          machineId: machineId,
          machineName: servkit.getMachineName(machineId),
          speed: speed, // TODO:都先拿多系統的第一個系統的值
          feed: feed,
          oee: calOee(oprt, elect),
          part: tocp,
        })
      }
    })

    // machineMap = {};
    // machineMap = null;

    return result
    /*

         var result = [];

         _.each(deviceStatusData, function(DeviceStatusType){

         DeviceStatusType.eachMachine('G_SPMS()', function (multisystem, machineId) {

         var brand = servkit.getMachineBrand(machineId);

         var oprt = toNumber(DeviceStatusType.getValue('G_OPRT()', machineId)[0][0]);
         var elect = toNumber(DeviceStatusType.getValue('G_ELCT()', machineId)[0][0]);
         var tocp = toNumber(DeviceStatusType.getValue('G_TOCP()', machineId)[0][0]);

         var id = machineId;

         if(servtechConfig.ST_MONITOR_USE_SHIFT_DATA)
         {

         if((widget.shiftData != undefined) && (widget.shiftData[id] != undefined))
         {
         if(widget.shiftData[id][curShiftSeq] != undefined)
         {
         if(tocp > widget.shiftData[id][curShiftSeq].partcount )
         {
         tocp = tocp - widget.shiftData[id][curShiftSeq].partcount
         }
         else
         {
         tocp = 0;
         }

         if(oprt > widget.shiftData[id][curShiftSeq].oper_millisecond)
         {
         oprt = oprt - widget.shiftData[id][curShiftSeq].oper_millisecond;
         }
         else
         {
         oprt = 0;
         }

         if(elect > widget.shiftData[id][curShiftSeq].power_millisecond)
         {
         elect = elect -  widget.shiftData[id][curShiftSeq].power_millisecond;
         }
         else
         {
         elect = 0;
         }
         }
         else
         {
         console.debug("no shift data , use original quality");
         }
         }
         }

         // indicator lamp alwayse is 0

         if (brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1)
         {
         tocp = 0;
         }

         result.push({
         machineId: machineId,
         machineName: servkit.getMachineName(machineId),
         speed: toNumber(multisystem[0][0]),//TODO:都先拿多系統的第一個系統的值
         feed: toNumber(DeviceStatusType.getValue('G_ACTF()', machineId)[0][0]),
         oee: calOee(oprt,elect),
         part: tocp
         });
         });
         });

         return result; */
  }

  if (widget.isRotating()) {
    var barData = barChartData(machineMap)
    // var hippoData = [{
    //   machineId: "_M01",
    //   machineName: "HV-1000",
    //   oee: 0
    // },
    // {
    //   machineId: "_M02",
    //   machineName: "FVT-1000MC",
    //   oee: "20.5"
    // },
    // {
    //   machineId: "_M03",
    //   machineName: "U-600",
    //   oee: "30.4"
    // },
    // {
    //   machineId: "_M05",
    //   machineName: "ESG-1224TD Plus",
    //   oee: "40.1"
    // },
    // {
    //   machineId: "_M06",
    //   machineName: "_M06",
    //   oee: "50.60"
    // },
    // {
    //   machineId: "_M07",
    //   machineName: "_M07",
    //   oee: "60.54"
    // },
    // {
    //   machineId: "_M08",
    //   machineName: "_M08",
    //   oee: "70.69"
    // },
    // {
    //   machineId: "_M09",
    //   machineName: "_M09",
    //   oee: "80.50"
    // },
    // {
    //   machineId: "_M11",
    //   machineName: "_M11",
    //   oee: "90.41"
    // },
    // {
    //   machineId: "_M12",
    //   machineName: "_M12",
    //   oee: "10.53"
    // }
    // ];

    var show_speed_feed = false
    var show_default_oee_part = false
    var show_oee_top_last = false

    if (
      Object.prototype.hasOwnProperty.call(window, 'ST_MONITOR_SHWO_OEE_PART')
    ) {
      show_default_oee_part = window.ST_MONITOR_SHWO_OEE_PART
    }

    if (Object.prototype.hasOwnProperty.call(window, 'servtechConfig')) {
      show_default_oee_part = servtechConfig.ST_MONITOR_SHWO_OEE_PART
    }

    if (
      Object.prototype.hasOwnProperty.call(window, 'ST_MONITOR_SHWO_SPEED_FEED')
    ) {
      show_speed_feed = window.ST_MONITOR_SHWO_SPEED_FEED
    }

    if (Object.prototype.hasOwnProperty.call(window, 'servtechConfig')) {
      show_speed_feed = servtechConfig.ST_MONITOR_SHWO_SPEED_FEED
    }

    if (
      Object.prototype.hasOwnProperty.call(
        window,
        'ST_MONITOR_SHWO_OEE_TOP_LAST'
      )
    ) {
      show_oee_top_last = window.ST_MONITOR_SHWO_OEE_TOP_LAST
    }

    if (Object.prototype.hasOwnProperty.call(window, 'servtechConfig')) {
      show_oee_top_last = servtechConfig.ST_MONITOR_SHWO_OEE_TOP_LAST
    }

    // if (show_default_oee_part) {
    //   $("#dslt").removeClass("hide");
    //   $("#dslo").removeClass("hide");
    //   $("#dsrt").removeClass("hide");
    //   $("#dslq").removeClass("hide");
    //   renderBarChart("device-status-left-bottom-oee", getTop5Data(barData, "oee"), "oee", 100.0);
    //   renderBarChart("device-status-right-bottom-part", getTop5Data(barData, "part"), "part");
    // }

    if (show_speed_feed) {
      $('#dslbs').removeClass('hide')
      $('#dsls').removeClass('hide')
      $('#dsrf').removeClass('hide')
      $('#dslf').removeClass('hide')

      renderBarChart(
        'device-status-right-top-feed',
        getTop5Data(barData, 'feed'),
        'feed'
      )
      renderBarChart(
        'device-status-left-top-speed',
        getTop5Data(barData, 'speed'),
        'speed'
      )
    }

    if (show_oee_top_last) {
      $('#dslttop5').removeClass('hide')
      $('#dsltop5').removeClass('hide')
      $('#dsrtlast5').removeClass('hide')
      $('#dsllast5').removeClass('hide')
      // getCurrentShift(createTopLastOEEChart);
      renderBarChart(
        'device-status-left-bottom-oee-top5',
        getTop5Data(widget.shiftData, 'oee'),
        'oee',
        100.0
      )
      renderBarChart(
        'device-status-right-bottom-oee-last5',
        getLast5Data(widget.shiftData, 'oee'),
        'oee',
        100.0
      )
    }
  }
  /*
     var keys = _.keys(machineMap);
     for(var i = 0; i < keys.length; ++i)
     {
     var signals = _.keys(machineMap[keys[i]]);
     for(var j = 0 ; j < signals.length ; ++j)
     {
     machineMap[keys[i]][signals[j]] = null;
     }
     machineMap[keys[i]] = null;
     } */

  // machineMap = null;

  function getTop5Data(barData, colName) {
    var data = _.chain(barData)
      .sortBy(colName)
      .filter(function (ele) {
        return ele.machineId.startsWith('_')
      })
      .last(5)
      .value()
      .reverse()
    return data
  }

  function getLast5Data(barData, colName) {
    var data = _.chain(barData)
      .sortBy(colName)
      .filter(function (ele) {
        return ele.machineId.startsWith('_')
      })
      .first(5)
      .value()
      .reverse()
    return data
  }

  if (typeof done === 'function') {
    done()
  }
}
