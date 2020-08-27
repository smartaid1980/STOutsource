export default function () {
  ;(function () {
    GoGoAppFun({
      gogo: function (ctx) {
        pageSetUp()
        ctx.initElements()
        servkit.validateForm($('#main-form'), ctx.$searchBtn)
        ctx.initFuncs()
        ctx.initEvents()
      },
      util: {
        $shiftDay: $('#shift-day'),
        $searchBtn: $('#submit-btn'),
        $cleanBtn: $('#submit-clean'),
        $staffId: $('#staff-id'),
        $dataTableWidget: $('#data-table-widget'),
        $dataTableBody: $('#data-table-body'),
        $detail: $('#detail'),
        $chart: $('#swimlaneChart'),
        datepickerConfig: {
          dateFormat: 'yy-mm-dd',
          prevText: '<i class="fa fa-chevron-left"></i>',
          nextText: '<i class="fa fa-chevron-right"></i>',
        },
        initFuncs: function () {
          var ctx = this
          if (ctx.preCon.shiftTime) {
            ctx['shiftTime'] = ctx.preCon.shiftTime
          }
          //                    if (ctx.preCon.staffs) {
          //                        ctx['staffFunc'] = ctx.preCon.staffs;
          //                    }
        },
        initEvents: function () {
          var ctx = this
          ctx.$searchBtn.on('click', function (evt) {
            var params = {
              shift_day: ctx.$shiftDay.val(),
              staff_id: ctx.$staffId.val() || '',
            }
            ctx.drawChart(params)
            return false
          })

          //                    ctx.$cleanBtn.on('click', function (evt) {
          //                        ctx.$shiftDay.val(moment().format('YYYY-MM-DD'));
          //                        ctx.$staffId.prop('selectedIndex', 0);
          //                        pageSetUp();
          //                        return false;
          //                    });
        },
        initElements: function () {
          var ctx = this
          ctx.$shiftDay
            .datepicker(ctx.datepickerConfig)
            .val(moment().format('YYYY-MM-DD'))
          servkit.initSelectWithList(ctx.preCon.staffs, ctx.$staffId)
          ctx.$staffId.select2()
        },
        drawChart: function (params) {
          var ctx = this
          servkit.ajax(
            {
              url: 'api/kuochuan/servtrack/emp/readempuse',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify(params),
            },
            {
              success: function (data) {
                var array = []
                var workingHour = 0
                var moveHour = 0
                _.map(data, function (obj) {
                  //object data for draw chart
                  workingHour = obj.working_hour
                  var moveIn = new Date(obj.move_in)
                  var moveOut = new Date(obj.move_out)

                  moveHour += moveOut.getTime() - moveIn.getTime()
                  var item = {
                    start: new Date(obj.move_in),
                    end: new Date(obj.move_out),
                    workId: obj.work_id,
                    staffId: obj.staff_id,
                    staff_name: obj.staff_name,
                    line_name: obj.line_name,
                    productName: obj.product_name,
                    processName: obj.process_step,
                    quality: obj.quality,
                    line_quality_sp: obj.line_quality_sp,
                    perf: obj.perf,
                    perf_sp: obj.perf_sp,
                  }
                  array.push(item)
                })

                if (array.length) {
                  ctx.detail(workingHour, moveHour / (1000 * 60 * 60))
                }
                var empUseDataObject = { items: array }
                ctx._drawChart(empUseDataObject)
              },
              fail: function (data) {
                console.warn(data)
              },
            }
          )
        },
        detail: function (workingHour, moveHour) {
          var ctx = this
          ctx.$detail.html(
            ctx.$shiftDay.val() +
              '，' +
              ctx.$staffId.find('option:selected').text() +
              '，當日無效總時間：' +
              (workingHour - moveHour).toFixed(2) +
              '，當日有效時數比率：' +
              ((moveHour / workingHour) * 100).toFixed(2) +
              '%(' +
              moveHour.toFixed(2) +
              '/' +
              workingHour +
              ')'
          )
        },
        _drawChart: function (empUseDataObject) {
          var ctx = this
          ctx.$chart.empty()
          var items = empUseDataObject.items
          if (items.length) {
            var margin = { top: 5, right: 20, bottom: 5, left: 20 },
              width = 1150 - margin.left - margin.right,
              height = 300 - margin.top - margin.bottom,
              // , miniHeight = lanes.length * 100 + 50
              miniHeight = 2 * 100 + 50,
              mainHeight = height - miniHeight - 50

            var dataYear = items[0].start.getFullYear()
            var dataMonth = items[0].start.getMonth()
            var dataDate = items[0].start.getDate()
            var startTime = ctx.shiftTime[0].start_time.split(':')
            var endTime = ctx.shiftTime[0].end_time.split(':')

            var start_time = new Date(
              dataYear,
              dataMonth,
              dataDate,
              startTime[0],
              startTime[1]
            )
            var end_time = new Date(
              dataYear,
              dataMonth,
              dataDate,
              endTime[0],
              endTime[1]
            )
            if (start_time.getTime() > end_time.getTime()) {
              end_time = new Date(
                dataYear,
                dataMonth,
                dataDate + 1,
                endTime[0],
                endTime[1]
              )
            }

            var x = d3.time
              .scale()
              //                            .domain([new Date(dataYear, dataMonth, dataDate, 8, 0, 0),new Date(dataYear, dataMonth, dataDate, 22, 0, 0)])
              .domain([start_time, end_time])
              .range([0, width])

            var x1 = d3.time.scale().range([0, width])

            // var ext = d3.extent(lanes, function(d) { return d.id; });
            var y1 = d3.scale.linear().domain([0, 2]).range([0, mainHeight])
            var y2 = d3.scale.linear().domain([0, 2]).range([0, miniHeight])
            // var y1 = d3.scale.linear().domain([ext[0], ext[1] + 1]).range([0, mainHeight]);
            // var y2 = d3.scale.linear().domain([ext[0], ext[1] + 1]).range([0, miniHeight]);

            var chart = d3
              .select('#swimlaneChart')
              .append('svg:svg')
              .attr('width', width + margin.right + margin.left)
              .attr('height', height + margin.top + margin.bottom)
              .attr('class', 'swimlaneChart')

            var mini = chart
              .append('g')
              // .attr('transform', 'translate(' + margin.left + ',' + (mainHeight + 60) + ')')
              .attr(
                'transform',
                'translate(' + margin.left + ',' + margin.top + ')'
              )
              .attr('width', width)
              .attr('height', miniHeight)
              .attr('class', 'mini')

            // draw the x axis 畫X軸
            var xDateAxis = d3.svg
              .axis()
              .scale(x)
              .orient('bottom')
              // .ticks(d3.time.mondays, (x.domain()[1] - x.domain()[0]) > 15552e6 ? 2 : 1)
              .ticks(d3.time.hour, 1)
              .tickFormat(d3.time.format('%H:%M'))
              .tickSize(6, 0, 0)

            var xMonthAxis = d3.svg
              .axis()
              .scale(x)
              .orient('top')
              .ticks(d3.time.months, 1)
              .tickFormat(d3.time.format('%b %Y'))
              .tickSize(15, 0, 0)

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
              .attr('dx', 5)
              .attr('dy', 12)

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

            mini
              .selectAll('rect')
              .data(items)
              .enter()
              .append('rect')
              .attr({
                fill: function (d) {
                  var color = servkit.colors.red
                  if (d.workId == 'INVALID_WORK') {
                    color = servkit.colors.blue
                  } else if (
                    parseFloat(d.quality) > parseFloat(d.line_quality_sp) &&
                    parseFloat(d.perf) > parseFloat(d.perf_sp)
                  ) {
                    color = servkit.colors.green
                  }
                  return color
                  //                                    return ((d.quality - d.line_quality_sp) > 0 || (d.perf - d.perf_sp) > 0) ? servkit.colors.green : servkit.colors.red;
                  //                                    return ((parseFloat(d.quality) > parseFloat(d.line_quality_sp)) && (parseFloat(d.perf) > parseFloat(d.perf_sp))) ? servkit.colors.green : servkit.colors.red;
                },
                width: function (d) {
                  return x(d.end) - x(d.start)
                },
                height: miniHeight,
                x: function (d) {
                  return x(d.start)
                },
                y: function (d) {
                  // var offset = .5 * y2(1) + 0.5;
                  return y2(0)
                },
              })
              .attr('stroke', 'black')
              .on('mouseover', function (d) {
                var xPosition = parseFloat(d3.select(this).attr('x'))
                var yPosition = parseFloat(d3.select(this).attr('y'))
                var tipDateFormaat = d3.time.format('%Y-%m-%d %H:%M:%S')
                //Update the tooltip position and value
                d3.select('#tooltip')
                  .style('left', xPosition + 'px')
                  .style('top', yPosition + 'px')
                  .select('#value')
                  .html(
                    '開始:' +
                      tipDateFormaat(d.start) +
                      '<br>' +
                      '結束:' +
                      tipDateFormaat(d.end) +
                      '<br>' +
                      (d.workId == 'INVALID_WORK'
                        ? d.line_name
                        : '派工單號:' + d.workId) +
                      '<br>' +
                      d.productName +
                      '|' +
                      d.processName
                  )
                // .text("測試"+ d.start+'<br>');

                //Show the tooltip
                d3.select('#tooltip').classed('hidden', false)
              })
              .on('mouseout', function () {
                //Hide the tooltip
                d3.select('#tooltip').classed('hidden', true)
              })
          } else {
            $.smallBox({
              title:
                '人員: ' +
                ctx.$staffId.find('option:selected').text() +
                ' 沒有 ' +
                ctx.$shiftDay.val() +
                ' 的資料...',
              content: "<i class='fa fa-clock-o'></i> <i>1 seconds ago...</i>",
              color: '#C79121',
              iconSmall: 'fa fa-sign-out',
              timeout: 2000,
            })
          }
        },
      },
      preCondition: {
        shiftTime: function (done) {
          var that = this
          servkit.ajax(
            {
              url: servkit.rootPath + '/api/servtrack/shifttime/read',
              type: 'GET',
              contentType: 'application/json',
            },
            {
              success: function (data) {
                done(data)
              },
              fail: function (data) {
                console.log(data)
              },
            }
          )
        },
        staffs: function (done) {
          var ctx = this
          servkit.ajax(
            {
              url: servkit.rootPath + '/api/getdata/db',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                table: 'a_kuochuan_servtrack_staff',
                columns: ['staff_id', 'staff_name'],
              }),
            },
            {
              success: function (data) {
                done(
                  _.reduce(
                    data,
                    function (memo, elem) {
                      memo[elem.staff_id] = elem.staff_name
                      return memo
                    },
                    {}
                  )
                )
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
          '/js/plugin/flot/jquery.flot.orderBar.min.js',
          '/js/plugin/flot/jquery.flot.pie.min.js',
          '/js/plugin/flot/jquery.flot.tooltip.min.js',
          // "/js/plugin/flot/jquery.flot.tooltip-0.9.0.min.js",
          '/js/plugin/flot/jquery.flot.symbol.min.js',
          '/js/plugin/flot/jquery.flot.axislabels.js',
          '/js/plugin/flot/jquery.flot.time.min.js',
          '/js/plugin/flot/jquery.flot.stack.min.js',
        ],
        [
          '/js/plugin/datatables/jquery.dataTables.min.js',
          '/js/plugin/datatables/dataTables.colVis.min.js',
          '/js/plugin/datatables/dataTables.tableTools.min.js',
          '/js/plugin/datatables/dataTables.bootstrap.min.js',
          '/js/plugin/datatable-responsive/datatables.responsive.min.js',
        ],
        ['/js/plugin/d3/d3.min.js'],
      ],
    })
  })()
}
