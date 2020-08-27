import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      if (ctx.isGraced) {
        var params = ctx.graceParam
        ctx.$detail.html(
          `${i18n('ServTrack_000010')} : ` +
            params.lineName +
            `  ${i18n('ServTrack_000034')} : ` +
            params.oee +
            `<p style="color: #FF0000; font-size:18px;">  (${i18n(
              'ServTrack_000038'
            )})</p>`
        )
        var dayTable = createReportTable({
          $tableElement: $('#date-table'),
          $tableWidget: $('#date-table-widget'), //reporttable.js有說明
          rightColumn: [6, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
          order: [[1, 'desc']],
          onRow: function (row, data) {
            // 產能效率(WORK_TRACKING.perf)<線別產能效率目標值(LINE.perf_sp)或
            // 良率(WORK_TRACKING.quality)<線別良率目標值(LINE.line_quality_sp)以紅字顯示
            if (parseFloat(data[14]) < parseFloat(data[13])) {
              $(row).find('td').eq(14).css('color', servkit.colors.red)
            }
            if (parseFloat(data[16]) < parseFloat(data[15])) {
              $(row).find('td').eq(16).css('color', servkit.colors.red)
            }
          },
          excel: {
            fileName: '51_production_line_plan_hit_rate',
            format: [
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
            ],
          },
        })
        var shiftTimeList = ctx.preCon.shiftTime
        ctx.drawChartAndTable(params, dayTable, shiftTimeList)
      } else {
        ctx.gogoAnother({
          appId: 'servtrack',
          funId: '50_line_one_day',
          currentTab: true,
        })
      }
    },
    util: {
      $detail: $('#detail'),
      drawChartAndTable: function (params, dayTable, shiftTimeList) {
        var that = this
        var trackingArray = []
        var trackingResult = []
        var trackingDataObject
        var trackingTableDatas
        // var params = {
        //     "startDate": '2017/06/01',
        //     "endDate": '2017/06/01',
        //     "lineId": ''
        // };
        servkit.ajax(
          {
            url: servkit.rootPath + '/api/servtrack/lineoeeday/readtracking',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(params),
          },
          {
            success: function (dbData) {
              _.map(dbData, function (data) {
                var subArray = []
                //object data for draw chart
                var workItem = {
                  start: new Date(data.move_in),
                  end: new Date(data.move_out),
                  workId: data.work_id,
                  productName: data.product_name,
                  processName: data.process_name,
                  quality: data.quality,
                  line_quality_sp: data.line_quality_sp,
                  perf: data.perf,
                  perf_sp: data.perf_sp,
                }
                //array data for draw table
                subArray.push(data.line_name)
                subArray.push(data.work_id)
                subArray.push(data.shift_day)
                subArray.push(data.product_name)
                subArray.push(data.op)
                subArray.push(data.process_name)
                subArray.push(parseFloat(data.std_hour).toFixed(4))
                subArray.push(data.user_name)
                subArray.push(parseFloat(data.op_duration).toFixed(4))
                subArray.push(data.output)
                subArray.push(data.go_quantity)
                subArray.push(data.output_sp)
                subArray.push(parseFloat(data.aval).toFixed(2))
                subArray.push(parseFloat(data.line_quality_sp).toFixed(2))
                subArray.push(parseFloat(data.quality).toFixed(2))
                subArray.push(parseFloat(data.perf_sp).toFixed(2))
                subArray.push(parseFloat(data.perf).toFixed(2))
                subArray.push(parseFloat(data.oee).toFixed(2))
                trackingArray.push(workItem)
                trackingResult.push(subArray)
              })
              trackingDataObject = {
                items: trackingArray,
              }
              trackingTableDatas = trackingResult
            },
            fail: function (data) {
              console.warn(data)
            },
          }
        )
        servkit
          .politeCheck()
          .until(function () {
            return trackingDataObject
          })
          .thenDo(function () {
            that.drawChart(trackingDataObject, shiftTimeList)
          })
          .tryDuration(0)
          .start()

        servkit
          .politeCheck()
          .until(function () {
            return trackingTableDatas
          })
          .thenDo(function () {
            dayTable.drawTable(trackingTableDatas)
            dayTable.showWidget()
          })
          .tryDuration(0)
          .start()
      },
      drawChart: function (trackingDataObject, shiftTimeList) {
        var items = trackingDataObject.items
        var margin = {
            top: 5,
            right: 20,
            bottom: 5,
            left: 20,
          },
          width = 1150 - margin.left - margin.right,
          height = 300 - margin.top - margin.bottom,
          // , miniHeight = lanes.length * 100 + 50
          miniHeight = 2 * 100 + 50

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

        var x = d3.time.scale().domain([start_time, end_time]).range([0, width])

        // var ext = d3.extent(lanes, function(d) { return d.id; });
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
            y: function () {
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
                `${i18n('ServTrack_000026')} : ` +
                  tipDateFormaat(d.start) +
                  '<br>' +
                  `${i18n('ServTrack_000037')} : ` +
                  tipDateFormaat(d.end) +
                  '<br>' +
                  `${i18n('ServTrack_000017')} : ` +
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
      },
    },
    preCondition: {
      shiftTime: function (done) {
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
              console.warn(data)
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
