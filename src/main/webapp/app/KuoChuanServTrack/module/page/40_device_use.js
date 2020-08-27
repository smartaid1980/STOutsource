export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      if (ctx.isGraced) {
        var params = ctx.graceParam
        ctx.$detail.html(
          '設備:' +
            params.lineName +
            '  設備利用度:' +
            params.oee +
            '<p style="color: #FF0000; font-size:18px;">  (紅色表示該次產能或良率過低)</p>' +
            '<p font-size:18px;"> 公式 : (總生產時間 / 班次天時間) * 100% </p>'
        )
        var queryParams = {
          shift_day: params.shift_day,
          line_id: params.line_id,
        }
        var shiftTimeList = ctx.preCon.shiftTime
        ctx.drawChartAndTable(queryParams, shiftTimeList, true)
      }

      servkit.initDatePicker(ctx.$shiftDay, null, true)
      servkit.initSelectWithList(ctx.preCon.lineMap, ctx.$selectLine)
      ctx.$selectLine.select2()
      servkit.validateForm($('#main-form'), ctx.$submitBtn)

      ctx.$submitBtn.on('click', function (evt) {
        evt.preventDefault()
        ctx.loadingBtn.doing()
        var shiftTimeList = ctx.preCon.shiftTime
        var queryParams = {
          shift_day: ctx.$shiftDay.val(),
          line_id: ctx.$selectLine.val(),
        }
        ctx.drawChartAndTable(queryParams, shiftTimeList, false)
      })
    },
    util: {
      $shiftDay: $('#shift-day'),
      $selectLine: $('#line-id'),
      $detail: $('#detail'),
      $submitBtn: $('#submit-btn'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      drawChartAndTable: function (params, shiftTimeList, isGraced) {
        try {
          var that = this
          var trackingArray = []
          var trackingResult = []
          var trackingDataObject
          var trackingTableDatas
          var readOee = false
          var param = {
            startDate: that.$shiftDay.val(),
            endDate: that.$shiftDay.val(),
            line_id: that.$selectLine.val(),
            process_code: '',
          }
          that.loadingBtn.doing()
          servkit.ajax(
            {
              url: 'api/kuochuan/servtrack/line/readtracking',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify(params),
            },
            {
              success: function (dbData) {
                console.log(dbData)
                _.map(dbData, function (data) {
                  var workItem = {
                    start: new Date(data.move_in),
                    end: new Date(data.move_out),
                    workId: data.work_id,
                    productName: data.product_id,
                    processName: data.process_step,
                    quality: data.quality,
                    line_quality_sp: data.line_quality_sp,
                    perf: data.perf,
                    perf_sp: data.perf_sp,
                  }
                  trackingArray.push(workItem)
                })
                trackingDataObject = { items: trackingArray }
              },
              fail: function (data) {
                console.log(data)
              },
            }
          )
          if (!isGraced) {
            servkit.ajax(
              {
                url: 'api/kuochuan/servtrack/oee/readoee',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(param),
              },
              {
                success: function (data) {
                  if (data.length > 0) {
                    var result = data[0]
                    that.$detail.html(
                      '設備:' +
                        result.line_name +
                        ' 設備利用度:' +
                        result.aval +
                        '% <p style="color: #FF0000; font-size:18px;">  (紅色表示該次產能或良率過低)</p>' +
                        '<p font-size:18px;"> 公式 : (總生產時間 / 班次天時間) * 100% </p>'
                    )
                  }
                  readOee = true
                },
              }
            )
          } else {
            readOee = true
          }
          servkit
            .politeCheck()
            .until(function () {
              return trackingDataObject && readOee
            })
            .thenDo(function () {
              that.drawChart(trackingDataObject, shiftTimeList)
            })
            .tryDuration(0)
            .start()
        } catch (e) {
          console.warn(e)
        } finally {
          that.loadingBtn.done()
        }
      },
      drawChart: function (trackingDataObject, shiftTimeList) {
        var that = this
        $('#swimlaneChart').html('')
        var items = trackingDataObject.items
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
          var startTime = shiftTimeList[0].start_time.split(':')
          var endTime = shiftTimeList[0].end_time.split(':')

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

          // draw the x axis
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
                return parseFloat(d.quality) > parseFloat(d.line_quality_sp) &&
                  parseFloat(d.perf) > parseFloat(d.perf_sp)
                  ? servkit.colors.green
                  : servkit.colors.red
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
                    '派工單號:' +
                    d.workId +
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
              '設備: ' +
              that.$selectLine.find('option:selected').text() +
              ' 沒有 ' +
              that.$shiftDay.val() +
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
      lineMap: function (done) {
        servkit.ajax(
          {
            url: 'api/kuochuan/servtrack/line/read',
            type: 'GET',
            data: { line_id: '' },
          },
          {
            success: function (data) {
              done(
                _.reduce(
                  data,
                  function (memo, elem) {
                    memo[elem.line_id] = elem.line_name
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
}
