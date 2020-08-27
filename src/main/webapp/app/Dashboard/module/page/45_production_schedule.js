import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      pageSetUp()

      $('#style5').append(i18n('Style5')).trigger('click')

      function hashChange() {
        $('#style2').append(i18n('Style2')).trigger('click')
        $(window).off('hashchange', hashChange)
        $(window).unbind('beforeunload', hashChange)
      }
      $(window).on('hashchange', hashChange)
      $(window).bind('beforeunload', hashChange)

      // 初始環境
      context.setUpEnvironment()
      // 更新 工單排程及建議
      context.refreshWorkTable()
      // 建立 閒置原因 今/昔比對
      context.createPieChartGroup(
        'invalidPieChartGroup',
        `${i18n('Idle_Reason')}`,
        4,
        3
      )
      // 建立 不良原因 今/昔比對
      context.createPieChartGroup(
        'ngPieChartGroup',
        `${i18n('Ng_Reason')}`,
        4,
        3
      )
      // 建立 線別狀態堆疊圖
      context.createProgressChart(context.time, new Date(), 3)

      servkit
        .schedule('updateTrackingData')
        .freqMillisecond(3 * 1000)
        .action(function () {
          // 更新進出站資料後，更新 製程報工狀況表 和 線別狀態堆疊圖
          context.refreshData()
          // 更新閒置原因、不良原因資料後，更新圖和圖旁的文字
          context.getDBData()
        })
        .start()
    },
    util: {
      invalidTextMap: {
        射出成型线: {
          元料件短缺: `${i18n('Reason_Info1')}`,
          休息时间: `${i18n('Reason_Info2')}`,
          清洁料管: `${i18n('Reason_Info3')}`,
        },
        金属加工线: {
          当机: `${i18n('Reason_Info4')}`,
          治具维修: `${i18n('Reason_Info5')}`,
          停机待料: `${i18n('Reason_Info6')}`,
        },
        组装线: {
          组装件数目不一: `${i18n('Reason_Info7')}`,
          修整组装件: `${i18n('Reason_Info8')}`,
          料件未到: `${i18n('Reason_Info9')}`,
        },
      },
      ngTextMap: {
        射出成型线: {
          毛边过多: `${i18n('Reason_Info10')}`,
          气泡过多: `${i18n('Reason_Info11')}`,
          异色范围过大: `${i18n('Reason_Info12')}`,
        },
        金属加工线: {
          螺纹不均: `${i18n('Reason_Info13')}`,
          预留量过多: `${i18n('Reason_Info14')}`,
          工件硬度不足: `${i18n('Reason_Info15')}`,
        },
        组装线: {
          成品不对称: `${i18n('Reason_Info16')}`,
          组装密合度不足: `${i18n('Reason_Info17')}`,
          成品受潮: `${i18n('Reason_Info18')}`,
        },
      },
      setUpEnvironment: function () {
        // 全螢幕 及 解除全螢幕
        const widgetGrid = document.getElementById('widget-grid')
        $('.jarviswidget-fullscreen-btn').on('click', function () {
          if ($(this).find('i').hasClass('fa-expand')) {
            if (widgetGrid.requestFullscreen) widgetGrid.requestFullscreen()
            else if (widgetGrid.msRequestFullscreen)
              widgetGrid.msRequestFullscreen()
            else if (widgetGrid.mozRequestFullScreen)
              widgetGrid.mozRequestFullScreen()
            else if (widgetGrid.webkitRequestFullscreen)
              widgetGrid.webkitRequestFullscreen()
          } else {
            if (document.exitFullscreen) document.exitFullscreen()
            else if (document.msExitFullscreen) document.msExitFullscreen()
            else if (document.mozCancelFullScreen)
              document.mozCancelFullScreen()
            else if (document.webkitExitFullscreen)
              document.webkitExitFullscreen()
          }
        })

        // 取的班次時間
        this.getTimesScales()
      },
      createPieChartGroup: function (name, title, chartQty, textQty) {
        class PieChartGroup {
          constructor(title, chartQty, textQty) {
            this.title = title
            this.chartQty = chartQty
            this.textQty = textQty
            this.createHtml()
          }
          createHtml() {
            var html = []
            html.push(`<div>`)
            html.push(`  <div class="chart-group">`)
            html.push(`    <div>`)
            html.push(`      <div class="pie-chart"></div>`)
            html.push(`      <div class="chart-legend"></div>`)
            html.push(`    </div>`)
            html.push(
              `    <p>${this.title}${i18n('Statistics')}(${i18n(
                'Today_Take_Top'
              )}${this.chartQty})</p>`
            )
            html.push(`  </div>`)
            html.push(`  <div>`)
            html.push(`    <div class="title">`)
            html.push(`      ${this.title} ${i18n('Today_History_Comparison')}`)
            html.push(`      <span>(${i18n('Take_Top')}${this.textQty})</span>`)
            html.push(`    </div>`)
            html.push(`    <div class="text-group">`)
            html.push(`    </div>`)
            html.push(`  </div>`)
            html.push(`</div>`)
            $('.chart-container').append(html.join(''))
            this.$ele = $('.chart-container').children('div:last-child')
          }
          drawChart(data) {
            var dataSet = JSON.parse(
              JSON.stringify(data.slice(0, this.chartQty))
            )
            if (!dataSet.length) dataSet = [{}]
            var percentList = []
            var sum = 0
            _.each(dataSet, (d) => {
              sum += d.data
            })

            // 加上顏色
            const color = ['#D62728', '#2361FF', '#2FA12F', '#FF7F0E']
            _.each(dataSet, (d, index) => {
              d.color = color[index]
            })

            var percents = 0
            _.each(dataSet, (d, index) => {
              var percent = Math.round((d.data / sum) * 100)
              if (index === dataSet.length - 1) percent = 100 - percents
              percentList.push(percent)
              percents += percent
            })

            var option = {
              series: {
                pie: {
                  show: true,
                  label: {
                    show: true,
                    radius: 0.8,
                    formatter: function (label, series) {
                      var index = _.findIndex(dataSet, (val) => {
                        return label === val.label
                      })
                      return `<div class="chart-label">${percentList[index]}%</div>`
                    },
                    background: {
                      opacity: 0.8,
                      color: '#000',
                    },
                  },
                  stroke: {
                    width: 0.1,
                    color: '#524e4e',
                  },
                },
              },
              legend: {
                container: this.$ele.find('.chart-legend'),
                noColumns: 1,
                // labelBoxBorderColor: "#858585",
                // position: "nw"
              },
            }

            $.plot(this.$ele.find('.chart-group .pie-chart'), dataSet, option)
          }

          drawText(datas) {
            var html = []
            _.each(datas, (data) => {
              html.push(`<div>`)
              html.push(`  <div class="left">`)
              html.push(
                `    <div class="text-reason">${data.line} / ${data.reason}</div>`
              )
              html.push(`    <div class="today-percent">${data.today}%</div>`)
              html.push(`  </div>`)
              html.push(`  <div class="right">`)
              html.push(
                `    <div class="history-percent">${data.history}%</div>`
              )
              // html.push(`    <div class="link">···</div>`)
              html.push(
                `    <div class="text-reason-info">${data.info}<i class="fa-fw fa fa-warning"></i></div>`
              )
              html.push(`  </div>`)
              html.push(`</div>`)
            })
            this.$ele.find('.text-group').html(html.join(''))
          }
        }
        this[name] = new PieChartGroup(title, chartQty, textQty)
      },
      createProgressChart: function (time, now, showType) {
        class ProgressChart {
          constructor(time, now, showType) {
            this.time = time
            this.now = now
            this.showType = showType
            this.margin = {
              top: 40,
              right: 30,
              bottom: 30,
              left: 30,
            }
            this.setSVGWidthAndHeight()
          }
          set time(time) {
            this._time = time
          }
          get time() {
            return this._time
          }
          set now(now) {
            this._now = now
          }
          get now() {
            return this._now
          }
          set data(data) {
            var chartObj = this
            chartObj.startTime = []
            chartObj.endTime = []
            // 把無效資料移到後面畫
            var group = _.groupBy(data, (val) => {
              chartObj.startTime.push(new Date(val.move_in))
              chartObj.endTime.push(new Date(val.move_out))
              return !val.line_status_start
            })
            chartObj._data = group.false
              ? group.true
                ? group.true.concat(group.false)
                : group.false
              : group.true
          }
          get data() {
            return this._data
          }
          setSVGWidthAndHeight() {
            // 取得svg的長和寬
            this.svgWidth = parseInt(
              document.getElementById('progress-chart').clientWidth - 2 * 27
            )
            this.svgHeight =
              this.svgWidth / 15 < 100 ? 100 : parseInt(this.svgWidth / 15)
          }
          setWidth() {
            this.width = this.svgWidth - this.margin.right - this.margin.left
          }
          setHeight() {
            this.height = this.svgHeight - this.margin.top - this.margin.bottom
          }
          drawChart(id, index, data) {
            const chartObj = this
            if (id) chartObj.id = id
            if (index) chartObj.index = index
            if (data) chartObj.data = data
            chartObj.now = new Date()

            // 建立框框
            chartObj.ctrateChartContainer()
            // 先取得新的寬高
            this.setWidth()
            this.setHeight()
            // 建立svg
            if (
              d3
                .select(`#${chartObj.id}`)
                .select(`.${chartObj.id}-${chartObj.index}`)._groups[0][0]
            ) {
              d3.select('svg').remove()
            }
            var svg = d3
              .select(`#${chartObj.id}`)
              .select('.group-body')
              .append('svg')
              .attr('class', `${chartObj.id}-${chartObj.index}`)
              .style('width', `${chartObj.svgWidth}px`)
              .style('height', `${chartObj.svgHeight}px`)

            // 似乎要有margin
            var chart = svg
              .append('g')
              .attr(
                'transform',
                `translate(${chartObj.margin.left}, ${chartObj.margin.top})`
              )
            // <g>不能畫線所以建一個rect
            chart
              .append('rect')
              .attr('class', 'work-background')
              .attr('width', `${chartObj.width}px`)
              .attr('height', `${chartObj.height}px`)

            // 畫刻度
            // var scaleChart = chart.append('g').attr('class', 'scales-g')
            //   .attr('transform', `translate(0, ${chartObj.height})`)
            // _.each(chartObj.time, (time, key) => {
            //   var g = scaleChart.append('g')
            //     .attr('transform', `translate(${key / (time.length - 1) * chartObj.width}, 0)`)
            //   g.append('text').attr('class', 'scales-text')
            //     .text(moment(time).format('HH:mm'))
            //     .attr('x',0.5)
            //     .attr('y', 9)
            //     .attr('dy', '0.71em')
            // })

            var all = chartObj.time[chartObj.time.length - 1] - chartObj.time[0]
            // 畫過去的底色
            chart
              .append('rect')
              .attr('class', 'gone-work-background')
              .attr(
                'width',
                `${
                  (chartObj.width * (chartObj.now - chartObj.time[0])) / all
                }px`
              )
              .attr('height', `${chartObj.height - 4}px`)
              .attr('y', 1)
              .attr('x', 1)

            // 畫堆疊圖
            var dataset = []
            _.each(chartObj.data, (val, key) => {
              var start = new Date(val.move_in)
              var end = chartObj.now

              if (start.getTime() < chartObj.time[0].getTime()) {
                // 非當天進站但還沒出站的工單
                start = chartObj.time[0]
              }
              // 建資料
              var className = 'worked'
              if (val.move_out) {
                end = new Date(val.move_out)
              } else {
                className = 'working'
              }
              if (val.line_status_start) {
                className = 'invalid'
                if (!val.is_end) className = 'invalid working'
              }
              dataset.push({
                start: chartObj.getTimeText('in', start, key + 1),
                end: val.move_out
                  ? chartObj.getTimeText('out', end, key + 1)
                  : '',
                x: chartObj.getPosition(
                  chartObj.width,
                  start,
                  chartObj.time[0],
                  all
                ),
                endX: chartObj.getPosition(
                  chartObj.width,
                  end,
                  chartObj.time[0],
                  all
                ),
                width: chartObj.getPosition(chartObj.width, end, start, all),
                className: className,
                index: val.index,
              })
            })

            chart
              .selectAll()
              .data(dataset)
              .enter()
              .append('rect')
              .attr('class', (s) => s.className)
              .attr('x', (s) => s.x + 1)
              .attr('y', '1px')
              .attr('height', `${chartObj.height - 3}px`)
              .attr('width', (s) => s.width)

            // 畫下刻度(起始時間)
            var scalesStartChart = chart
              .append('g')
              .attr('class', 'scales-g')
              .attr('transform', `translate(0, ${chartObj.height})`)
            scalesStartChart
              .selectAll()
              .data(dataset)
              .enter()
              .append('g')
              .attr('transform', (s) => `translate(${s.x}, 0)`)
              .append('text')
              .attr('class', 'scales-text')
              .text((s) => s.start)
              .attr('x', 0.5)
              .attr('y', 9)
              .attr('dy', '0.71em')
            if (dataset[0].x > 50) {
              // 補上起始時間
              scalesStartChart
                .append('g')
                .attr('transform', 'translate(0, 0)')
                .append('text')
                .attr('class', 'scales-text')
                .text(moment(chartObj.time[0]).format('HH:mm'))
                .attr('x', 0.5)
                .attr('y', 9)
                .attr('dy', '0.71em')
            }
            if (all - dataset[dataset.length - 1].x > 50) {
              // 補上結束時間
              scalesStartChart
                .append('g')
                .attr('transform', `translate(${chartObj.width}, 0)`)
                .append('text')
                .attr('class', 'scales-text')
                .text(
                  moment(chartObj.time[chartObj.time.length - 1]).format(
                    'HH:mm'
                  )
                )
                .attr('x', 0.5)
                .attr('y', 9)
                .attr('dy', '0.71em')
            }
            // 畫上刻度(結束時間)
            var scaleEndChart = chart
              .append('g')
              .attr('class', 'scales-g')
              .attr(
                'transform',
                `translate(0, ${-((chartObj.height * 16) / 167 + 23.98)})`
              )
            scaleEndChart
              .selectAll()
              .data(dataset)
              .enter()
              .append('g')
              .attr('transform', (s) => `translate(${s.endX}, 0)`)
              .append('text')
              .attr('class', 'scales-text')
              .text((s) => s.end)
              .attr('x', 0.5)
              .attr('y', 9)
              .attr('dy', '0.71em')

            if (chartObj.showType !== 3) {
              // 工單資訊圈圈
              // chart.selectAll()
              //   .data(dataset)
              //   .enter()
              //   .append('circle').attr('class', 'circle')
              //   .attr('cx', (s) => s.x + (s.width / 2))
              //   .attr('cy', chartObj.height / 2)
              //   .attr('r', chartObj.height / 3)
              // 工單資訊編號
              chart
                .selectAll()
                .data(dataset)
                .enter()
                .append('text')
                .attr('class', (s) =>
                  s.className === 'working'
                    ? 'working circle-text'
                    : 'circle-text'
                )
                .text((s) => s.index)
                .attr('x', (s) => s.x + s.width / 2 - 6)
                .attr('y', chartObj.height / 1.5)
            }

            // 現在時間
            // chart
            //   .append('rect').attr('class', 'now-time-path')
            //   .attr('x', width * (chartObj.now - chartObj.time[0]) / all)
            //   .attr('y', 1)
            //   .attr('height', `${chartObj.height}px`)
            //   .attr('width', 5)

            // 現在時間說明
            chart
              .append('path')
              .attr('class', 'now-time-path')
              .attr(
                'd',
                chartObj.roundedRect(
                  (chartObj.width * (chartObj.now - chartObj.time[0])) / all -
                    21,
                  -38,
                  50,
                  30,
                  5
                )
              )
            chart
              .append('text')
              .attr('class', 'scales-text now-time')
              .text(moment(chartObj.now).format('HH:mm'))
              .attr(
                'x',
                (chartObj.width * (chartObj.now - chartObj.time[0])) / all - 20
              )
              .attr('y', -17)
          }

          ctrateChartContainer() {
            var html = []
            html.push(`<div id="${this.id}" class="group">`)
            html.push('  <div class="group-body"></div>')
            html.push('  <div class="group-bottom"></div>')
            html.push('</div>')
            $('#progress-chart').html(html.join(''))
            this.bindResizeEvent()
          }
          getTimeText(type, thisTime, key) {
            // 判斷跟下一筆資料時間是否太近
            var time = moment(thisTime).format('HH:mm')
            var closestTime
            if (this.data[key]) {
              if (type === 'in') {
                // if (new Date(this.data[key].move_in).getTime() - thisTime.getTime() < 45 * 60 * 1000)
                _.each(this.startTime, (val) => {
                  if (val.getTime() < thisTime.getTime()) closestTime = val
                })
                if (
                  closestTime &&
                  thisTime.getTime() - closestTime.getTime() < 45 * 60 * 1000
                )
                  time = ''
              }
              if (type === 'out') {
                // if (this.data[key].move_out && new Date(this.data[key].move_out).getTime() - thisTime.getTime() < 45 * 60 * 1000)
                _.each(this.endTime, (val) => {
                  if (val.getTime() < thisTime.getTime()) closestTime = val
                })
                if (
                  closestTime &&
                  thisTime.getTime() - closestTime.getTime() < 45 * 60 * 1000
                )
                  time = ''
              }
            }
            return time
          }

          getPosition(width, end, start, all) {
            var value = 0
            value = (width * (end - start)) / all
            if (value < 0) value = 0
            return value
          }
          roundedRect(x, y, width, height, radius) {
            // 時間的框框
            return (
              'M' +
              (x + radius) +
              ',' +
              y + // 起始位置
              'h' +
              (width - radius) + // ->
              'a' +
              radius +
              ',' +
              radius +
              ' 0 0 1 ' +
              radius +
              ',' +
              radius + // ⤵(有弧度)
              'v' +
              (height - 2 * radius) + // ↓
              'a' +
              radius +
              ',' +
              radius +
              ' 0 0 1 ' +
              -radius +
              ',' +
              radius + // ↵(有弧度)
              'h' +
              (radius - width / 2) + // <-
              'l' +
              (-(radius * 1.5) + ' ' + radius * 1.5) + // ↙
              'l' +
              (-(radius * 1.5) + ' ' + -(radius * 1.5)) + // ↖
              'h' +
              (radius - width / 2) + // <-
              'a' +
              radius +
              ',' +
              radius +
              ' 0 0 1 ' +
              -radius +
              ',' +
              -radius + // (有弧度)
              'v' +
              (2 * radius - height) + // ↑
              'a' +
              radius +
              ',' +
              radius +
              ' 0 0 1 ' +
              radius +
              ',' +
              -radius + // ↱(有弧度)
              'z'
            ) // 回起始位置
          }
          resize() {
            const width = this.svgWidth
            this.setSVGWidthAndHeight() // 取得目前的長寬
            // 先判斷寬有沒有改變，有改變再重畫
            if (width !== this.svgWidth) this.drawChart()
          }
          bindResizeEvent() {
            var chartObj = this
            $(`#progress-chart>#${chartObj.id}`).resize(function () {
              chartObj.resize()
            })
          }
        }
        this.progressChart = new ProgressChart(time, now, showType)
      },
      refreshData: function () {
        var ctx = this
        servkit.ajax(
          {
            url: 'api/strongled/tracking/read',
            type: 'GET',
          },
          {
            success: function (response) {
              var data = []
              // 把 進出站 和 閒置原因 合併
              _.each(response, (val) => (data = data.concat(val)))

              if (data && data[0] && data[0].isDemo) {
                // 假資料才要轉換日期
                var today, tomorrow, oldToday, oldTomorrow
                // 自動轉換demo日期
                var days = _.uniq(
                  _.flatten(
                    _.map(data, (val) => {
                      if (val.line_status_start) {
                        val.move_in = val.line_status_start
                        val.move_out = val.line_status_end
                      }
                      val.move_in = moment(new Date(val.move_in)).format(
                        'YYYY/MM/DD HH:mm:ss'
                      )
                      if (ctx.preCon.getLineData[val.line_id]) {
                        val.line_name = ctx.preCon.getLineData[val.line_id]
                      }
                      var move = [val.move_in]
                      if (val.move_out) {
                        val.move_out = moment(new Date(val.move_out)).format(
                          'YYYY/MM/DD HH:mm:ss'
                        )
                        move.push(val.move_out)
                      }
                      return move
                    })
                  )
                ).sort()

                var lastTime = new Date(days[days.length - 1])
                lastTime.setDate(new Date(ctx.time[0]).getDate())
                lastTime.setMonth(new Date(ctx.time[0]).getMonth())
                lastTime.setFullYear(new Date(ctx.time[0]).getFullYear())
                today = moment(lastTime).format('YYYY/MM/DD')
                tomorrow = moment(
                  new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000)
                ).format('YYYY/MM/DD')
                if (lastTime.getTime() >= ctx.time[0]) {
                  oldToday = days[days.length - 1].split(' ')[0]
                  oldTomorrow = moment(
                    new Date(
                      new Date(days[days.length - 1]).getTime() +
                        24 * 60 * 60 * 1000
                    )
                  ).format('YYYY/MM/DD')
                } else {
                  oldTomorrow = days[days.length - 1].split(' ')[0]
                  oldToday = moment(
                    new Date(
                      new Date(days[days.length - 1]).getTime() -
                        24 * 60 * 60 * 1000
                    )
                  ).format('YYYY/MM/DD')
                }
                // console.log(today, tomorrow, oldToday, oldTomorrow)
                _.each(data, (val) => {
                  if (val.move_in) {
                    val.move_in = val.move_in
                      .replace(oldToday, today)
                      .replace(oldTomorrow, tomorrow)
                  }
                  if (val.move_out) {
                    val.move_out = val.move_out
                      .replace(oldToday, today)
                      .replace(oldTomorrow, tomorrow)
                    if (new Date(val.move_out).getTime() > ctx.now.getTime()) {
                      // 過濾掉未來時間的資訊
                      if (val.line_status_start) {
                        val.duration_min =
                          ctx.now.getMinutes() -
                          new Date(val.line_status_start).getMinutes()
                      }
                      val.move_out = null
                    }
                  }
                })
                // console.log(allData)
                data = _.filter(data, (val) => {
                  // 過濾掉未來時間的資訊
                  return new Date(val.move_in).getTime() <= ctx.now.getTime()
                })
              } else
                _.each(data, (val) => {
                  if (val.line_status_start) {
                    val.move_in = val.line_status_start
                    val.move_out = val.line_status_end
                  }
                })

              // 分類：group -> 閒置/進出站 -> 資料(早到晚)
              var dataMap = {}
              _.each(
                data.sort(function (a, b) {
                  return (
                    new Date(a.move_in).getTime() -
                    new Date(b.move_in).getTime()
                  )
                }),
                (val) => {
                  if (!dataMap[val.group_id])
                    dataMap[val.group_id] = {
                      invalid: [],
                      tracking: [],
                    }
                  if (val.invalid_name !== undefined)
                    dataMap[val.group_id].invalid.push(val)
                  else dataMap[val.group_id].tracking.push(val)
                }
              )
              console.log(dataMap)
              var name = Object.keys(dataMap)[0]
              // 更新 製程報工狀況表
              ctx.refreshTrackingTable(dataMap[name].tracking)
              // 更新 線別狀態堆疊圖
              var lastRecord = {}
              _.each(dataMap[name].tracking, (val) => {
                if (!lastRecord.time) {
                  lastRecord.time = moment(new Date(val.move_in))
                  lastRecord.line = val.line_id
                }
                if (
                  val.move_in &&
                  moment(val.move_in).isAfter(lastRecord.time)
                ) {
                  lastRecord.time = moment(new Date(val.move_in))
                  lastRecord.line = val.line_id
                }
                if (
                  val.move_out &&
                  moment(val.move_out).isAfter(lastRecord.time)
                ) {
                  lastRecord.time = moment(new Date(val.move_out))
                  lastRecord.line = val.line_id
                }
              })
              _.each(dataMap[name].invalid, (val) => {
                if (!lastRecord.time) {
                  lastRecord.time = moment(new Date(val.move_in))
                  lastRecord.line = val.line_id
                }
                if (
                  val.move_in &&
                  moment(val.move_in).isAfter(lastRecord.time)
                ) {
                  lastRecord.time = moment(new Date(val.move_in))
                  lastRecord.line = val.line_id
                }
                if (
                  val.move_out &&
                  moment(val.move_out).isAfter(lastRecord.time)
                ) {
                  lastRecord.time = moment(new Date(val.move_out))
                  lastRecord.line = val.line_id
                }
              })

              var chartData = {
                invalid: [],
                tracking: [],
              }
              _.each(dataMap[name].tracking, (val) => {
                if (val.line_id === lastRecord.line)
                  chartData.tracking.push(val)
              })
              _.each(dataMap[name].invalid, (val) => {
                if (val.line_id === lastRecord.line) chartData.invalid.push(val)
              })
              console.log(lastRecord.line, chartData)
              $('#progress-chart-line').text(
                `(${
                  ctx.preCon.getLineData[lastRecord.line] || lastRecord.line
                })`
              )
              ctx.progressChart.drawChart(
                'a',
                0,
                chartData.tracking.concat(chartData.invalid)
              )
            },
          }
        )
      },
      getDBData: function () {
        // 取得閒置原因和不良原因資訊
        var ctx = this
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_strongled_servtrack_view_tracking_invalid_log',
              columns: ['line_id', 'move_in', 'move_out', 'invalid_name'],
            }),
          },
          {
            success: function (data) {
              var invalidData = ctx.setDataToPieChart(data, 'invalid')
              // 畫圖
              ctx.invalidPieChartGroup.drawChart(
                ctx.getOrder(invalidData).today
              )
              // 圖旁的文字
              var invalid = ctx.getDataByLine(invalidData)
              ctx.getTrackData(invalid, 'invalid', function (data) {
                ctx.invalidPieChartGroup.drawText(data.splice(0, 3))
              })
            },
          }
        )
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_servtrack_view_tracking_ng',
              columns: ['line_id', 'move_in', 'move_out', 'ng_name'],
            }),
          },
          {
            success: function (data) {
              var ngData = ctx.setDataToPieChart(data, 'ng')
              // 畫圖
              ctx.ngPieChartGroup.drawChart(ctx.getOrder(ngData).today)
              // 圖旁的文字
              var ng = ctx.getDataByLine(ngData)
              ctx.getTrackData(ng, 'ng', function (data) {
                ctx.ngPieChartGroup.drawText(data.splice(0, 3))
              })
            },
          }
        )
      },
      getTrackData: function (data, tag, callback) {
        // 拿到進出站資訊，組合文字區資訊
        var ctx = this
        var textData = data
        const lineList = _.map(textData, (val) => {
          return val.line
        })
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_servtrack_view_tracking_detail',
              columns: ['line_id', 'move_in', 'move_out'],
              whereClause: `line_id in ('${lineList.join("','")}')`,
            }),
          },
          {
            success: function (response) {
              var trackData = {}
              _.each(response, (val) => {
                if (!trackData[val.line_id])
                  trackData[val.line_id] = {
                    time: 0,
                  }
                var start = new Date(val.move_in)
                var end = val.move_out ? new Date(val.move_out) : new Date()
                trackData[val.line_id].time += end.getTime() - start.getTime()
                if (moment(start).isAfter(moment().format('YYYY/MM/DD'))) {
                  if (!trackData[val.line_id].today)
                    trackData[val.line_id].today = 0
                  trackData[val.line_id].today +=
                    end.getTime() - start.getTime()
                }
              })

              _.each(textData, (val) => {
                if (trackData[val.line].time)
                  val.history = (
                    (val.history / trackData[val.line].time) *
                    100
                  ).toFixed(1)
                if (trackData[val.line].today)
                  val.today = (
                    ((val.today || 0) / trackData[val.line].today) *
                    100
                  ).toFixed(1)
                else val.today = '0.0'
                val.line = ctx.preCon.getLineData[val.line] || '---'
                if (ctx[tag + 'TextMap'][val.line])
                  val.info = ctx[tag + 'TextMap'][val.line][val.reason] || '---'
                else val.info = '---'
              })

              if (callback)
                callback(
                  textData.sort(function (a, b) {
                    return (
                      Number(b.today) - Number(a.today) ||
                      Number(b.history) - Number(a.history)
                    )
                  })
                )
            },
          }
        )
      },
      getOrder: function (data) {
        var todayList = []
        var allList = []
        _.each(data, (d, reason) => {
          var today = 0
          var all = 0
          _.each(d, (time) => {
            if (time.today) today += time.today
            all += time.time
          })
          if (today)
            todayList.push({
              label: reason,
              data: today,
            })
          allList.push({
            label: reason,
            data: all,
          })
        })
        return {
          today: todayList.sort(function (a, b) {
            return b.data - a.data
          }),
          all: allList.sort(function (a, b) {
            return b.data - a.data
          }),
        }
      },
      getDataByLine: function (data) {
        var dataList = []
        _.each(data, (d, reason) => {
          _.each(d, (time, line) => {
            dataList.push({
              line: line,
              reason: reason,
              history: time.time,
              today: time.today || 0,
            })
          })
        })
        return dataList
      },
      setDataToPieChart: function (data, tag) {
        var dataMap = {}
        _.each(data, (val) => {
          if (!dataMap[val[tag + '_name']]) dataMap[val[tag + '_name']] = {}
          if (!dataMap[val[tag + '_name']][val.line_id])
            dataMap[val[tag + '_name']][val.line_id] = {
              time: 0,
            }
          var start = new Date(val.move_in)
          var end = val.move_out ? new Date(val.move_out) : new Date()
          dataMap[val[tag + '_name']][val.line_id].time +=
            end.getTime() - start.getTime()
          if (moment(start).isAfter(moment().format('YYYY/MM/DD'))) {
            if (!dataMap[val[tag + '_name']][val.line_id].today)
              dataMap[val[tag + '_name']][val.line_id].today = 0
            dataMap[val[tag + '_name']][val.line_id].today +=
              end.getTime() - start.getTime()
          }
        })
        return dataMap
      },
      refreshWorkTable: function () {
        var ctx = this
        $.get('app/Dashboard/demoData/work_schedule_suggestion.json', function (
          response
        ) {
          var html = []
          _.each(response, (val) => {
            html.push('<tr>')
            html.push(
              val.seq ? ctx.getWorkTableTdData(val.seq, 'td') : '<td></td>'
            )
            html.push(
              val.work_id
                ? ctx.getWorkTableTdData(val.work_id, 'td')
                : '<td></td>'
            )
            html.push(
              val.deliver_date
                ? ctx.getWorkTableTdData(val.deliver_date, 'td')
                : '<td></td>'
            )
            html.push(
              val.e_quantity
                ? ctx.getWorkTableTdData(val.e_quantity, 'td')
                : '<td></td>'
            )
            html.push(
              val.std_hour
                ? ctx.getWorkTableTdData(val.std_hour, 'td')
                : '<td></td>'
            )
            html.push(
              val.finish_date
                ? ctx.getWorkTableTdData(val.finish_date, 'td')
                : '<td></td>'
            )
            html.push(
              val.diff ? ctx.getWorkTableTdData(val.diff, 'td') : '<td></td>'
            )
            html.push(
              val.org_seq || val.adj_seq
                ? `<td>${ctx.getWorkTableTdData(
                    val.org_seq,
                    'span'
                  )} → ${ctx.getWorkTableTdData(val.adj_seq, 'span')}</td>`
                : '<td></td>'
            )
            html.push(
              val.adjusted_finish_date
                ? ctx.getWorkTableTdData(val.adjusted_finish_date, 'td')
                : '<td></td>'
            )
            html.push(
              val.remark
                ? ctx.getWorkTableTdData(val.remark, 'td')
                : '<td></td>'
            )
            html.push('</tr>')
          })
          $('#work-table tbody').html(html.join(''))
        })
      },
      getWorkTableTdData: function (data, tag) {
        // 取得 工單排程及建議 的表格內容
        var html = `<${tag}`
        if (data['color'] || data['background-color']) {
          html += ' style="'
          if (data['color']) html += `color: ${data['color']};`
          if (data['background-color'])
            html += `background-color: ${data['background-color']};`
          html += '"'
        }
        html += `>${data.value}</${tag}>`
        return html
      },
      refreshTrackingTable: function (data) {
        var html = []
        var dataList = JSON.parse(JSON.stringify(data)).sort(function (a, b) {
          return (
            new Date(b.move_out).getTime() - new Date(a.move_out).getTime() ||
            new Date(b.move_in).getTime() - new Date(a.move_in).getTime()
          )
        })

        // 最多顯示12個，不然會超出畫面
        _.each(dataList.slice(0, 10), (val, key) => {
          var yieldRate
          // 如果良率小於95要顯示紅字
          if (val.ng_quantity !== undefined && val.output !== 0) {
            yieldRate = (
              Math.round(
                ((val.output - val.ng_quantity) / val.output) * 100 * 100
              ) / 100
            ).toFixed(2)
            if (yieldRate < 95)
              yieldRate = `<span style="color: red;">${yieldRate}%</span>`
            else yieldRate += '%'
          }
          var workHtml = []
          workHtml.push(`<tr class="${val.move_out ? '' : ' working'}">`)
          workHtml.push(
            `  <td>${moment(new Date(val.move_in)).format(
              'YYYY/MM/DD HH:mm:ss'
            )}</td>`
          )
          workHtml.push(
            `  <td>${
              val.move_out
                ? moment(new Date(val.move_out)).format('YYYY/MM/DD HH:mm:ss')
                : '---'
            }</td>`
          )
          workHtml.push(`  <td>${val.line_name || '---'}</td>`)
          workHtml.push(`  <td>${val.work_id || '---'}</td>`)
          workHtml.push(`  <td>${val.output || '---'}</td>`)
          workHtml.push(
            `  <td>${
              val.ng_quantity !== undefined ? val.ng_quantity : '---'
            }</td>`
          )
          workHtml.push(
            `  <td>${(val.op || '') + ', ' + (val.process_name || '')}</td>`
          )
          workHtml.push(`  <td>${yieldRate || '---'}</td>`)
          workHtml.push(`</tr>`)
          html.push(workHtml.join(''))
        })
        $('#tracking-table tbody').html(html.join(''))
      },
      getTimesScales: function () {
        // 設定刻度區間
        var ctx = this
        var scales = 2
        ctx.time = [moment(ctx.preCon.getWorjShiftTime, 'hh:mm:ss a').toDate()]
        for (var times = 0; times < 24 / scales; times++) {
          ctx.time.push(
            new Date(ctx.time[times].getTime() + scales * 60 * 60 * 1000)
          )
        }
      },
    },
    preCondition: {
      getWorjShiftTime: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_servtrack_shift_time',
              columns: ['start_time'],
            }),
          },
          {
            success: function (data) {
              done(data[0].start_time)
            },
          }
        )
      },
      getLineData: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_servtrack_line',
              columns: ['line_id', 'line_name'],
            }),
          },
          {
            success: function (data) {
              var lineData = {}
              _.each(data, function (elem) {
                lineData[elem.line_id] = elem.line_name
              })
              done(lineData)
            },
          }
        )
      },
    },
    dependencies: [
      [
        '/js/plugin/flot/jquery.flot.cust.min.js',
        '/js/plugin/flot/jquery.flot.pie.min.js',
        '/js/plugin/flot/jquery.flot.stack.min.js',
        '/js/plugin/flot/jquery.flot.resize.min.js',
        '/js/plugin/flot/jquery.flot.time.min.js',
        '/js/plugin/flot/jquery.flot.tooltip.min.js',
        '/js/plugin/flot/jquery.flot.axislabels.js',
        '/js/plugin/flot/jquery.flot.orderBar.min.js',
      ],
      ['/js/plugin/d3/d3.v4.min.js'],
    ],
  })
}
