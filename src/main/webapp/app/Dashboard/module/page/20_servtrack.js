import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
import GoGoAppFun from '../../../../js/servtech/module/servcloud.gogoappfun.js'
import {
  fetchDbData,
  ajax,
} from '../../../../js/servtech/module/servkit/ajax.js'
import { crudtable } from '../../../../js/servtech/module/table/crudTable.js'
import Schedule from '../../../../js/servtech/module/servkit/Schedule.js'
import { servtechConfig } from '../../../../js/servtech/module/servtech.config.js'
import { naturalSort } from '../../../../js/servtech/module/servkit/util.js'

export default async function () {
  const shiftStartTime = await fetchDbData('a_servtrack_shift_time', {
    columns: ['start_time'],
  }).then((data) => data[0].start_time)
  const lineData = await fetchDbData('a_servtrack_line', {
    columns: ['line_id', 'line_name'],
  })
  const lineMap = Object.fromEntries(
    lineData.map(({ line_id, line_name }) => [line_id, line_name])
  )
  GoGoAppFun({
    gogo(context) {
      window.c = context
      context.main()
    },
    util: {
      shiftStartTime,
      lineData,
      lineMap,
      // 報工狀態堆疊圖的大小
      svgWidth: 1080,
      svgHeight: 100,
      // 一頁最多幾條產線
      maxLine: 3, // 每頁最多行數
      maxCard: 5, // 每列最多卡片數
      /**
       * 顯示模式 SLIDE_MODE
       * 1: 一條產線一個報工狀態堆疊圖，一個畫面最多三條線
       * 2: 一條產線一至多個報工狀態堆疊圖，一個畫面最多三條線
       * 3(default): 一條產線一個報工狀態堆疊圖(多筆覆蓋)，有表格，一頁一條產線
       */
      SLIDE_MODE: 3, // 1: 原始，2: 多行，3: 單行多筆覆蓋
      now: new Date(), // 現在時間
      spinner: null,
      isPlaying: true, // 是否播放
      isShowingInvalidTime:
        servtechConfig.ST_TRACK_DASHBOAED_INVALID_TIME ?? true, // 要不要顯示無效原因的表
      trackingDataMap: {},
      drawOrder: [], // 繪製順序
      filteredDrawOrder: [], // 繪製順序(過濾group後)
      selectedGroupIdList: null, // 要顯示的群組
      style: 'light',
      groupLineTable: null,
      trackingSchedule: null,
      dashboardSchedule: null,
      timeTicks: null,
      widgetGridEl: document.getElementById('widget-grid'),
      dashboardRefreshingSpanInSec: 10,
      nextSlideIndex: null,
      carouselWidgetEl: document.getElementById('dashboard-widget'),
      carouselWidgetBodyEl: document.getElementById('dashboard-widget-body'),
      main() {
        const context = this
        context.initGroupLineTable()
        context.initDashboard()
        context.getTimeTicks()

        // 設定顯示樣式(資料樣式)
        $(context.carouselWidgetEl).attr('data-show-type', context.SLIDE_MODE)
        if (context.SLIDE_MODE === 3) {
          context.maxLine = 1
        }

        // 頻率設定
        context.spinner = $('#refresh-freq-spinner').spinner({
          min: 1,
          spin(event, ui) {
            context.dashboardSchedule.setFreqMillisecond(ui.value * 1000)
          },
        })
        context.dashboardRefreshingSpanInSec = context.spinner.spinner('value')

        // 重新計算寬高
        $(context.carouselWidgetEl).resize(
          _.debounce(() => context.updateSvgSize(), 1000)
        )

        // 調整版面樣式，亮/暗
        $('#style-list').on('click', 'a', function () {
          const style = $(this).attr('data-style')
          $(context.carouselWidgetEl).attr('data-style', style)
          context.style = style
          if (context.dashboardSchedule) {
            context.dashboardSchedule.stop()
            context.dashboardSchedule.start()
          }
          $('#style').text(this.innerText)
        })

        if (document.body.classList.contains('smart-style-2'))
          $('#style-list a[data-style=light]').trigger('click')
        $('#style2').on('click', function () {
          $('#style-list a[data-style=light]').trigger('click')
        })
        if (document.body.classList.contains('smart-style-5'))
          $('#style-list a[data-style=dark]').trigger('click')
        $('#style5').on('click', function () {
          $('#style-list a[data-style=dark]').trigger('click')
        })
      },
      // 建立群組跟產線的CRUD table
      initGroupLineTable() {
        const context = this
        context.groupLineTable = crudtable({
          tableSelector: '#line-group-table',
          read: {
            url: 'api/strongLED/groupLine/read?hideClose=true',
            end: {
              3(lineIdList) {
                return naturalSort(
                  lineIdList.map((line_id) => lineMap[line_id])
                )
              },
            },
            finalDo() {
              // 需要 checkbox 但不要刪除功能，所以每次 Read 都要隱藏
              $('.stk-delete-btn').addClass('hide')
              if (!context.trackingSchedule) {
                context.setTrackingSchedule()
              }
              context.trackingSchedule.stop()
              context.trackingSchedule.start()
            },
          },
          create: {
            unavailable: true,
          },
          update: {
            unavailable: true,
          },
          delete: {
            url: '',
          },
        })
      },
      // 更新報工站資料
      setTrackingSchedule() {
        const context = this
        context.trackingSchedule = new Schedule('updateTrackingData')
          .freqMillisecond(60 * 1000)
          .action(async function () {
            const trackingData = await context.fetchTrackingData()
            let allData = Object.values(trackingData).flat()
            const isDemoData = allData[0] && allData[0].is_demo
            let quota

            if (isDemoData) {
              // 假資料才要轉換日期
              var today, tomorrow, oldToday, oldTomorrow
              // 自動轉換demo日期
              var days = _.uniq(
                _.flatten(
                  _.map(allData, (val) => {
                    if (val.line_status_start) {
                      val.move_in = val.line_status_start
                      val.move_out = val.line_status_end
                    }
                    val.move_in = moment(new Date(val.move_in)).format(
                      'YYYY/MM/DD HH:mm:ss'
                    )
                    if (lineMap[val.line_id]) {
                      val.line_name = lineMap[val.line_id]
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
              lastTime.setDate(new Date(context.timeTicks[0]).getDate())
              lastTime.setMonth(new Date(context.timeTicks[0]).getMonth())
              lastTime.setFullYear(new Date(context.timeTicks[0]).getFullYear())
              today = moment(lastTime).format('YYYY/MM/DD')
              tomorrow = moment(
                new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000)
              ).format('YYYY/MM/DD')
              if (lastTime.getTime() >= context.timeTicks[0]) {
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
              _.each(allData, (val) => {
                if (val.move_in) {
                  val.move_in = val.move_in
                    .replace(oldToday, today)
                    .replace(oldTomorrow, tomorrow)
                }
                if (val.move_out) {
                  val.move_out = val.move_out
                    .replace(oldToday, today)
                    .replace(oldTomorrow, tomorrow)
                  if (
                    new Date(val.move_out).getTime() > context.now.getTime()
                  ) {
                    // 過濾掉未來時間的資訊
                    if (val.line_status_start) {
                      val.duration_min =
                        context.now.getMinutes() -
                        new Date(val.line_status_start).getMinutes()
                    }
                    val.move_out = null
                  }
                }
              })
              // console.log(allData)
              allData = _.filter(allData, (val) => {
                // 過濾掉未來時間的資訊
                return new Date(val.move_in).getTime() <= context.now.getTime()
              })
            } else {
              allData.forEach((data) => {
                // invalidLineStatus data
                if (data.line_status_start) {
                  data.move_in = data.line_status_start
                  data.move_out = data.line_status_end
                }
              })
            }

            context.drawOrder.length = 0
            const groupedGroupData = _.groupBy(allData, 'group_id')
            naturalSort(
              Object.entries(groupedGroupData),
              ([, groupDataList]) =>
                groupDataList.find((data) => data.group_name)?.group_name
            ).forEach(([group_id, groupData]) => {
              context.trackingDataMap[group_id] = _.groupBy(
                groupData,
                'line_id'
              )
              context.count = context.maxLine // 剩餘可以畫的行數
              naturalSort(
                Object.entries(context.trackingDataMap[group_id]),
                ([line_id, lineDataList]) =>
                  lineDataList.find((data) => data.line_name)?.group_name ||
                  lineMap[line_id]
              ).forEach(([line_id, lineDataList]) => {
                if (context.maxLine === context.count) {
                  // 每頁第一筆
                  context.drawOrder.push({
                    group: group_id,
                    line: [],
                  })
                }
                if (
                  context.trackingDataMap[group_id][line_id].length <=
                  context.maxCard
                ) {
                  quota = context.count - 1
                } else {
                  quota =
                    context.count -
                    Math.ceil(
                      Number(
                        context.trackingDataMap[group_id][line_id].length /
                          context.maxCard
                      )
                    )
                }
                context.drawOrder[context.drawOrder.length - 1].line.push(
                  line_id
                )
                if (quota <= 0) {
                  quota = context.maxLine
                }
                context.count = quota
              })
            })
            if (!context.dashboardSchedule) {
              context.setDashboardSchedule()
            }
          })
          .start()
      },
      fetchTrackingData() {
        return new Promise((res, rej) =>
          ajax(
            {
              url: 'api/strongled/tracking/read',
              type: 'GET',
            },
            {
              success(data) {
                res(data)
              },
            }
          )
        )
      },
      // 看板換頁
      setDashboardSchedule() {
        const context = this
        context.dashboardSchedule = new Schedule('updateStoreData')
          .freqMillisecond(context.dashboardRefreshingSpanInSec * 1000)
          .action(context.renderSlide.bind(context))
          .start()

        context.dashboardSchedule.stop() // 先暫停
      },
      renderSlide() {
        const context = this
        context.now = new Date(moment().utc(8).format('YYYY/MM/DD HH:mm:ss'))
        $(context.carouselWidgetBodyEl).empty()

        context.filteredDrawOrder = context.drawOrder.filter((order) =>
          context.selectedGroupIdList.includes(order.group)
        )

        if (context.filteredDrawOrder[context.nextSlideIndex]) {
          const groupId =
            context.filteredDrawOrder[context.nextSlideIndex].group

          context.filteredDrawOrder[context.nextSlideIndex].line.forEach(
            (lineId) => {
              context.drawGroup(groupId, lineId)
            }
          )
          // 播放狀態改變 index 以顯示下一頁，停止狀態則持續刷新同一頁
          if (context.isPlaying) {
            context.nextSlideIndex++
            if (context.nextSlideIndex >= context.filteredDrawOrder.length) {
              context.nextSlideIndex = 0
            }
          }
        }
      },
      // 建立開始輪播、結束輪播的事件綁定
      initDashboard() {
        const context = this
        $('#rotate-start').on('click', context.playCarousel.bind(context))
        $('#rotate-end').on('click', context.exitCarousel.bind(context))
        $('#rotate-pause').on('click', context.pauseCarousel.bind(context))
        $('#rotate-forward').on('click', context.toNextSlide.bind(context))
        $('#rotate-backward').on('click', context.toPrevSlide.bind(context))
      },
      // 開始輪播
      playCarousel() {
        const context = this
        context.selectedGroupIdList = _.pluck(
          context.groupLineTable.getSelectedRowData(),
          0
        )
        if (!context.selectedGroupIdList.length) {
          return
        }
        $('#group-table').addClass('hide')
        $(context.carouselWidgetEl)
          .children('.jarviswidget')
          .attr('id', 'jarviswidget-fullscreen-mode')
        if (context.widgetGridEl.webkitRequestFullscreen) {
          context.widgetGridEl.webkitRequestFullscreen()
        } else if (context.widgetGridEl.mozRequestFullScreen) {
          context.widgetGridEl.mozRequestFullScreen()
        }
        $(context.carouselWidgetEl).removeClass('hide')

        context.updateSvgSize()
        context.dashboardSchedule.stop()
        context.nextSlideIndex = 0
        context.isPlaying = true
        context.dashboardSchedule.start()
      },
      // 結束輪播
      exitCarousel() {
        const context = this
        $(context.carouselWidgetEl)
          .addClass('hide')
          .children('.jarviswidget')
          .removeAttr('id', 'jarviswidget-fullscreen-mode')
        if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen()
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen()
        }
        $('#group-table').removeClass('hide')
        context.isPlaying = false
        context.dashboardSchedule.stop()
        $('#rotate-pause>i').removeClass('fa-play').addClass('fa-pause')
      },
      // 暫停(停在同一頁，但仍會定時刷新) / 繼續(繼續輪播不同頁)
      pauseCarousel() {
        const context = this
        const { isPlaying } = context

        $('#rotate-pause>i')
          .toggleClass('fa-play', isPlaying)
          .toggleClass('fa-pause', !isPlaying)

        context.isPlaying = !isPlaying

        if (isPlaying) {
          context.nextSlideIndex-- // 現在畫的頁數
          if (context.nextSlideIndex < 0) {
            // 最後一頁跟倒數最後一頁
            context.nextSlideIndex = context.filteredDrawOrder.length - 1
          }
        }
      },
      // 下一個
      toNextSlide() {
        const context = this
        context.dashboardSchedule.stop()
        if (!context.isPlaying) {
          context.nextSlideIndex++
          if (context.nextSlideIndex >= context.filteredDrawOrder.length) {
            context.nextSlideIndex = 0
          }
        }
        context.dashboardSchedule.start()
      },
      // 上一個
      toPrevSlide() {
        const context = this
        // 現在畫的頁數
        const currSlideIndex =
          context.nextSlideIndex - (context.isPlaying ? 1 : 0)
        const prevSlideIndex = currSlideIndex - 1

        context.dashboardSchedule.stop()

        if (prevSlideIndex < 0) {
          context.nextSlideIndex =
            context.filteredDrawOrder.length - prevSlideIndex
        } else {
          context.nextSlideIndex = prevSlideIndex
        }
        context.dashboardSchedule.start()
      },
      updateSvgSize() {
        const context = this
        const carouselWidth = context.carouselWidgetBodyEl.clientWidth
        if (carouselWidth < 54) {
          return
        }
        context.svgWidth = Math.floor(Number(carouselWidth - 2 * 27))
        context.svgHeight =
          context.svgWidth / 15 < 100
            ? 100
            : Math.floor(Number(context.svgWidth / 15))
      },
      // 畫甘特圖
      drawWorkLineChart(primaryData, groupId, lineId, times) {
        const context = this
        const margin = {
          top: 40,
          right: 30,
          bottom: 30,
          left: 30,
        }
        const width = context.svgWidth - margin.right - margin.left
        const height = context.svgHeight - margin.top - margin.bottom

        const startTimeList = primaryData
          .map((val) => new Date(val.move_in))
          .sort()
        const endTimeList = primaryData
          .map((val) => new Date(val.move_out))
          .sort()

        // 把無效資料移到後面畫
        const data = [...primaryData].sort((a, b) => {
          if (a.line_status_start && !b.line_status_start) {
            return 1
          } else if (b.line_status_start && !a.line_status_start) {
            return -1
          } else {
            return 0
          }
        })

        // 建立svg
        // if(d3.select(`#group${groupId}`).select('svg')._groups.length) {
        if (
          d3
            .select(`#group${groupId}-line${lineId}`)
            .select(`.group${groupId}-line${lineId}-${times}`)._groups[0][0]
        ) {
          d3.select('svg').remove()
        }
        var svg = d3
          .select(`#group${groupId}-line${lineId}`)
          .select('.group-body')
          .append('svg')
          .attr('class', `group${groupId}-line${lineId}-${times}`)
          .style('width', `${context.svgWidth}px`)
          .style('height', `${context.svgHeight}px`)

        // 似乎要有margin
        var chart = svg
          .append('g')
          .attr('transform', `translate(${margin.left}, ${margin.top})`)
        // <g>不能畫線所以建一個rect
        chart
          .append('rect')
          .attr('class', 'work-background')
          .attr('width', `${width}px`)
          .attr('height', `${height}px`)

        // 畫刻度
        // var scaleChart = chart.append('g').attr('class', 'scales-g')
        //   .attr('transform', `translate(0, ${height})`)
        // _.each(ctx.time, (time, key) => {
        //   var g = scaleChart.append('g')
        //     .attr('transform', `translate(${key / (ctx.time.length - 1) * width}, 0)`)
        //   g.append('text').attr('class', 'scales-text')
        //     .text(moment(time).format('HH:mm'))
        //     .attr('x',0.5)
        //     .attr('y', 9)
        //     .attr('dy', '0.71em')
        // })

        // 畫過去(第一班班次起始時間到現在)的底色
        const totalMsInShiftDay =
          context.timeTicks[context.timeTicks.length - 1] - context.timeTicks[0]
        const elapsedTimeFromShiftStart = context.now - context.timeTicks[0]
        const elapsedTimeBarLength =
          (width * elapsedTimeFromShiftStart) / totalMsInShiftDay
        chart
          .append('rect')
          .attr('class', 'gone-work-background')
          .attr('width', `${elapsedTimeBarLength}px`)
          .attr('height', `${height - 4}px`)
          .attr('y', 1)
          .attr('x', 1)

        function getTimeText(type, thisTime, key) {
          // 判斷跟下一筆資料時間是否太近
          var time = moment(thisTime).format('HH:mm')
          var closestTime
          if (data[key]) {
            if (type === 'in') {
              // if (new Date(data[key].move_in).getTime() - thisTime.getTime() < 35 * 60 * 1000)
              _.each(startTimeList, (val) => {
                if (val.getTime() < thisTime.getTime()) closestTime = val
              })
              if (
                closestTime &&
                thisTime.getTime() - closestTime.getTime() < 35 * 60 * 1000
              )
                time = ''
            }
            if (type === 'out') {
              // if (data[key].move_out && new Date(data[key].move_out).getTime() - thisTime.getTime() < 35 * 60 * 1000)
              _.each(endTimeList, (val) => {
                if (val.getTime() < thisTime.getTime()) closestTime = val
              })
              if (
                closestTime &&
                thisTime.getTime() - closestTime.getTime() < 35 * 60 * 1000
              )
                time = ''
            }
          }
          return time
        }

        function getPosition(width, end, start, all) {
          var value = 0
          value = (width * (end - start)) / all
          if (value < 0) value = 0
          return value
        }

        // 畫堆疊圖
        var dataset = []
        data.forEach((val, key) => {
          var start = new Date(val.move_in)
          var end = context.now

          if (start.getTime() < context.timeTicks[0].getTime()) {
            // 非當天進站但還沒出站的工單
            start = context.timeTicks[0]
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
            start: getTimeText('in', start, key + 1),
            end: val.move_out ? getTimeText('out', end, key + 1) : '',
            x: getPosition(
              width,
              start,
              context.timeTicks[0],
              totalMsInShiftDay
            ),
            endX: getPosition(
              width,
              end,
              context.timeTicks[0],
              totalMsInShiftDay
            ),
            width: getPosition(width, end, start, totalMsInShiftDay),
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
          .attr('height', `${height - 3}px`)
          .attr('width', (s) => s.width)

        // 畫下刻度(起始時間)
        var scalesStartChart = chart
          .append('g')
          .attr('class', 'scales-g')
          .attr('transform', `translate(0, ${height})`)
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
            .text(moment(context.timeTicks[0]).format('HH:mm'))
            .attr('x', 0.5)
            .attr('y', 9)
            .attr('dy', '0.71em')
        }
        if (totalMsInShiftDay - dataset[dataset.length - 1].x > 50) {
          // 補上結束時間
          scalesStartChart
            .append('g')
            .attr('transform', `translate(${width}, 0)`)
            .append('text')
            .attr('class', 'scales-text')
            .text(
              moment(context.timeTicks[context.timeTicks.length - 1]).format(
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
          .attr('transform', `translate(0, ${-((height * 16) / 167 + 23.98)})`)
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

        if (context.SLIDE_MODE !== 3) {
          // 工單資訊圈圈
          // chart.selectAll()
          //   .data(dataset)
          //   .enter()
          //   .append('circle').attr('class', 'circle')
          //   .attr('cx', (s) => s.x + (s.width / 2))
          //   .attr('cy', height / 2)
          //   .attr('r', height / 3)
          // 工單資訊編號
          chart
            .selectAll()
            .data(dataset)
            .enter()
            .append('text')
            .attr('class', (s) =>
              s.className === 'working' ? 'working circle-text' : 'circle-text'
            )
            .text((s) => s.index)
            .attr('x', (s) => s.x + s.width / 2 - 6)
            .attr('y', height / 1.5)
        }

        // 現在時間
        // chart
        //   .append('rect').attr('class', 'now-time-path')
        //   .attr('x', width * (ctx.now - ctx.time[0]) / all)
        //   .attr('y', 1)
        //   .attr('height', `${height}px`)
        //   .attr('width', 5)

        // 現在時間說明
        chart
          .append('path')
          .attr('class', 'now-time-path')
          .attr(
            'd',
            roundedRect(
              (width * (context.now - context.timeTicks[0])) /
                totalMsInShiftDay -
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
          .text(moment(context.now).format('HH:mm'))
          .attr(
            'x',
            (width * (context.now - context.timeTicks[0])) / totalMsInShiftDay -
              20
          )
          .attr('y', -17)

        function roundedRect(x, y, width, height, radius) {
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
      },
      // 畫群組/產線
      drawGroup(groupId, lineId) {
        const context = this
        const lineDataList = context.trackingDataMap[groupId][lineId]
        const lineData = []
        const nowTime = new Date(context.now.getTime() + 60 * 1000).getTime()
        const cardList = []
        const workTableList = []
        const invalidTableList = []
        const workTableGrid = context.isShowingInvalidTime ? 8 : 12
        const isShowInvalidTable = context.isShowingInvalidTime
        const groupName = lineDataList.find((data) => data.group_name)
          ?.group_name
        const lineName = lineDataList.find((data) => data.line_name)?.line_name
        let dataIndex = 0 // 卡片數字
        let lastTime = 0
        let index = 0

        let sortedLineDataList
        if (context.SLIDE_MODE === 3) {
          sortedLineDataList = [...lineDataList].sort(
            (a, b) =>
              new Date(b.move_in).getTime() - new Date(a.move_in).getTime()
          )
        } else {
          sortedLineDataList = [...lineDataList].sort(
            (a, b) =>
              new Date(a.move_in).getTime() - new Date(b.move_in).getTime()
          )
        }
        sortedLineDataList.forEach((val, key) => {
          // 同步生產分行顯示
          if (context.SLIDE_MODE === 2) {
            lastTime = nowTime
            if (key > 0 && !val.line_status_start) {
              for (var i = 0; i < lineData.length; i++) {
                if (
                  lineData[i].length &&
                  lineData[i][lineData[i].length - 1].move_out &&
                  new Date(
                    lineData[i][lineData[i].length - 1].move_out
                  ).getTime() < new Date(val.move_in).getTime()
                ) {
                  if (
                    new Date(
                      lineData[i][lineData[i].length - 1].move_out
                    ).getTime() < lastTime
                  ) {
                    lastTime = new Date(
                      lineData[i][lineData[i].length - 1].move_out
                    ).getTime()
                    index = i
                  }
                }
              }
              if (lastTime === nowTime) {
                index++
              }
            }
          }
          if (!lineData[index]) {
            lineData.push([])
          }

          if (
            ((context.SLIDE_MODE !== 3 ||
              (context.SLIDE_MODE === 3 && !context.isShowingInvalidTime)) &&
              !val.line_status_start) ||
            (context.SLIDE_MODE === 3 && context.isShowingInvalidTime)
          ) {
            if (
              !val.line_status_start ||
              (val.line_status_start &&
                !_.find(lineData, (d) => {
                  return (
                    d.invalid_name === val.invalid_name &&
                    d.line_status_start === val.line_status_start
                  )
                }))
            ) {
              // 過濾不同工單造成的相同無效原因
              dataIndex++
              val.index = dataIndex
              lineData[index].push(val)
            }
          }

          if (context.SLIDE_MODE === 3) {
            if (val.line_status_start) {
              if (invalidTableList.length < 25) {
                // 無效原因表
                const invalidHtml = `<tr class="${
                  val.is_end ? '' : ' working'
                }">
                  <td>${val.invalid_name}</td>
                  <td>${
                    val.line_status_start
                      ? moment(new Date(val.line_status_start)).format(
                          'HH:mm:ss'
                        )
                      : '---'
                  }</td>
                  <td>${
                    val.duration_min === 0
                      ? `< 30 ${i18n('Second')}`
                      : val.duration_min
                  }</td>
                </tr>`
                if (
                  !_.find(invalidTableList, (table) => {
                    return table === invalidHtml
                  })
                ) {
                  // 過濾不同工單造成的相同無效原因
                  invalidTableList.push(invalidHtml)
                }
              }
            } else {
              if (workTableList.length < 25) {
                // 工單表
                var workHtml = `<tr class="${val.move_out ? '' : ' working'}">
                  <td>${moment(new Date(val.move_in)).format(
                    'YYYY/MM/DD HH:mm:ss'
                  )}</td>
                  <td>${
                    val.move_out
                      ? moment(new Date(val.move_out)).format(
                          'YYYY/MM/DD HH:mm:ss'
                        )
                      : '---'
                  }</td>
                  <td>${val.work_id || '---'}</td>
                  <td>${val.product_name || '---'}</td>
                  <td>${(val.op || '') + ', ' + (val.process_name || '')}</td>
                  <td>${val.output || '---'}</td>
                  <td>${
                    val.ng_quantity !== undefined ? val.ng_quantity : '---'
                  }</td>
                  <td>${
                    val.ng_quantity !== undefined && val.output !== 0
                      ? (
                          Math.round(
                            ((val.output - val.ng_quantity) / val.output) *
                              100 *
                              100
                          ) / 100
                        ).toFixed(2) + '%'
                      : '---'
                  }</td>
                </tr>`
                workTableList.push(workHtml)
              }
            }
          } else {
            if (!val.line_status_start) {
              // 工單卡片
              var cardHtml = []
              cardHtml.push(
                `<div class="card${val.move_out ? '' : ' working'}">`
              )
              cardHtml.push(`  <div class="card-number">${dataIndex}</div>`)
              cardHtml.push('  <div class="card-info">')
              cardHtml.push(`    <span>${i18n('Work')}：${val.work_id}</span>`)
              cardHtml.push(
                `    <span>${i18n('Product_Number')}：${
                  val.product_name
                }</span>`
              )
              if (context.SLIDE_MODE === 3) {
                cardHtml.push(
                  `    <span>${i18n('Work_Start_time')}：${moment(
                    new Date(val.move_in)
                  ).format('HH:mm:ss')}</span>`
                )
                cardHtml.push(
                  `    <span>${i18n('Work_End_time')}：${
                    val.move_out
                      ? moment(new Date(val.move_out)).format('HH:mm:ss')
                      : '---'
                  }</span>`
                )
              }
              cardHtml.push('  </div>')
              cardHtml.push('</div>')
              cardList.push(cardHtml.join(''))
            }
          }
        })
        const workTableHtmlStr = `<div class="col-xs-12 col-sm-12 col-md-${workTableGrid} col-md-${workTableGrid}">
          <table class="work-table">
            <thead>
              <tr>
                <th width="13%">${i18n('Move_In_Time')}</th>
                <th width="13%">${i18n('Move_Out_Time')}</th>
                <th width="10%">${i18n('Work')}</th>
                <th width="37%">${i18n('Product')}</th>
                <th width="12%">${i18n('Process')}</th>
                <th width="5%">${i18n('Output')}</th>
                <th width="5%">${i18n('Adverse_Number')}</th>
                <th width="5%">${i18n('Yield')}</th>
              </tr>
            </thead>
            <tbody>
              ${workTableList.join('')}
            </tbody>
          </table>
        </div>`
        const invalidTableHtmlStr = `<div class="col-xs-12 col-sm-12 col-md-4 col-md-4">
          <table class="invalid-table">
            <thead>
              <tr>
                <th width="34%">${i18n('Invalid_Reason')}</th>
                <th width="33%">${i18n('Start_Time')}</th>
                <th width="33%">${i18n('Cumulative_Minute')}</th>
              </tr>
            </thead>
            <tbody>
              ${invalidTableList.join('')}
            </tbody>
          </table>
        </div>`
        const tableHtmlStr =
          workTableHtmlStr + (isShowInvalidTable ? invalidTableHtmlStr : '')
        const groupHtmlId = `group${groupId}-line${lineId}`
        const groupHtmlTitle = `${groupName} / ${lineName || lineMap[lineId]}`
        const groupHtmlStr = `<div id="${groupHtmlId}" class="group">
            <span class="group-title">${groupHtmlTitle}</span>
          <div class="group-body"></div>
          <div class="group-bottom">${
            context.SLIDE_MODE === 3 ? tableHtmlStr : cardList.join('')
          }</div>
        </div>`
        $(context.carouselWidgetBodyEl).append(groupHtmlStr)
        // console.log(lineData)
        _.each(lineData, (val, key) => {
          context.drawWorkLineChart(
            val.sort(function (a, b) {
              return (
                new Date(a.move_in).getTime() - new Date(b.move_in).getTime()
              )
            }),
            groupId,
            lineId,
            key
          )
        })
      },
      // 設定刻度區間
      getTimeTicks() {
        const context = this
        const hourPerTick = 2
        const tickCount = 24 / hourPerTick
        const timeTicks = []
        for (let i = 0; i <= tickCount; i++) {
          timeTicks.push(
            moment(shiftStartTime, 'hh:mm:ss a').add(hourPerTick * i, 'hours')
          )
        }
        context.timeTicks = timeTicks.map((m) => m.toDate())
        return context.timeTicks
      },
    },
    preCondition: {},
    dependencies: [
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
      ['/js/plugin/d3/d3.v4.min.js'],
    ],
  })
}
