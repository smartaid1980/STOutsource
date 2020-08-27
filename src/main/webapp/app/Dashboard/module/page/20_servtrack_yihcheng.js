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
import {
  initSelectWithList,
  loadingButton,
} from '../../../../js/servtech/module/servkit/form.js'
import { colors } from '../../../../js/servtech/module/servkit/var.js'
import { hippo } from '../../../../js/servtech/module/servcloud.hippo.js'
import {
  getMachineList,
  getBoxList,
} from '../../../../js/servtech/module/servkit/machine.js'
import { subscribe } from '../../../../js/servtech/module/servkit/broadcaster.js'

export default async function () {
  const shiftStartTime = await fetchDbData('a_servtrack_shift_time', {
    columns: ['start_time'],
  }).then((data) => data[0].start_time)
  const lineData = await fetchDbData('a_servtrack_line', {
    columns: ['line_id', 'line_name', 'device_id'],
  })
  const lineMachineMap = Object.fromEntries(
    lineData.map(({ line_id, line_name: machine_id }) => [line_id, machine_id])
  )
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
      lineMachineMap,
      spinner: null,
      isPlaying: false, // 是否正在播放
      selectedGroupId: null, // 要顯示的群組
      groupLineTable: null,
      trackingSchedule: null,
      dashboardSchedule: null,
      startPlayLoadingBtn: loadingButton(
        document.getElementById('rotate-start')
      ),
      widgetGridEl: document.getElementById('widget-grid'),
      dashboardRefreshingSpanInSec: 10,
      updateTrackingDataInSec: 60,
      nextSlideIndex: null,
      carouselWidgetEl: document.getElementById('dashboard-widget'),
      carouselWidgetBodyEl: document.getElementById('dashboard-widget-body'),
      $lineGroupTable: $('#line-group-table'),
      $lineContainer: $('#dashboard-widget-body>.line-container'),
      lineRenderderList: [],
      groupLineMap: {},
      trackingDataMap: null,
      drawingLineOrder: null,
      groupedHippoData: null,
      currMachineDataMap: Object.fromEntries(
        getMachineList().map((machineId) => [
          machineId,
          { lastProduceTime: null, partCountAcc: null },
        ])
      ),
      updateTrackingDataPromise: null,
      main() {
        const context = this
        context.initSpinner()
        context.initGroupLineTable()
        context.initDashboard()
        context.setTrackingSchedule()
        context.setDashboardSchedule()
        context.subscribeDeviceStatus()
      },
      initSpinner() {
        const context = this

        // 頻率設定
        context.spinner = $('#refresh-freq-spinner').spinner({
          min: 1,
          spin(event, ui) {
            context.dashboardSchedule.setFreqMillisecond(ui.value * 1000)
          },
        })
        context.dashboardRefreshingSpanInSec = context.spinner.spinner('value')
      },
      // 建立群組跟產線的CRUD table
      initGroupLineTable() {
        const context = this
        const $lineSelect = context.$lineGroupTable.find(
          'tbody select[name=lines]'
        )
        initSelectWithList(lineMap, $lineSelect)

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
              const tableData = context.groupLineTable.table
                .rows()
                .nodes()
                .toArray()
                .map((el) => $(el).data('rowData'))
              tableData.forEach((groupData) => {
                context.groupLineMap[groupData.group_id] = naturalSort(
                  groupData.lines,
                  (line_id) => lineMap[line_id] || line_id
                )
              })
              if (context.isPlaying) {
                context.trackingSchedule.stop()
                context.trackingSchedule.start()
              }
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
          onDraw() {
            context.$lineGroupTable
              .find('thead input.stk-delete-all-checkbox')
              .hide()
          },
        })
        context.$lineGroupTable
          .find('tbody')
          .on('click', 'input[type=checkbox]', function () {
            if (!this.checked) {
              return
            }
            const selectedRow = context.groupLineTable.getSelectedRow()
            if (selectedRow && selectedRow.length > 1) {
              selectedRow.forEach((tr) => {
                const checkbox = tr.querySelector('input[type=checkbox]')
                if (checkbox && checkbox.checked && checkbox !== this) {
                  checkbox.checked = false
                }
              })
            }
          })
      },
      subscribeDeviceStatus() {
        const context = this
        subscribe('DeviceStatus', {
          machines: getBoxList(),
          dataModeling: true,
          handler: context.updateDeviceStatus.bind(context),
        })
      },
      updateDeviceStatus(data) {
        const context = this
        const deviceStatus = data[0]
        const currentTime = ''.toFormatedDatetime()
        _.each(
          deviceStatus.commandWithMachine['G_TOCP()'],
          (val, machineId) => {
            const currPartCount = val[0][0]
            if (currPartCount === 'B') {
              context.currMachineDataMap[machineId].partCountAcc = null
            } else {
              context.currMachineDataMap[machineId].partCountAcc = Number(
                currPartCount
              )
              context.currMachineDataMap[
                machineId
              ].lastProduceTime = currentTime
            }
          }
        )
      },
      // 更新報工站資料
      setTrackingSchedule() {
        const context = this
        context.trackingSchedule = new Schedule('updateTrackingData')
          .freqMillisecond(context.updateTrackingDataInSec * 1000)
          .action(() => {
            context.updateTrackingDataPromise = context.updateTrackingData(
              context
            )
          })
          .start(true)
      },
      async updateTrackingData() {
        const context = this
        const lineIdList = context.groupLineMap[context.selectedGroupId]
        const trackingData = await context.fetchTrackingData(lineIdList)
        if (!trackingData || !trackingData.length) {
          context.groupedHippoData = null
          return
        }
        const groupedTrackingData = _.chain(trackingData)
          .groupBy('line_id')
          .mapObject((dataList) => dataList[0])
          .value()
        const machineIdList = _.pluck(
          Object.values(groupedTrackingData),
          'device_id'
        )
        const earliestMoveInDate = _.pluck(
          Object.values(groupedTrackingData),
          'move_in'
        )
          .reduce((a, x) => (moment(a).isBefore(x) ? a : x), '')
          .toFormatedDate()
        const hippoData = await context.fetchHippoData(
          machineIdList,
          earliestMoveInDate
        )
        const groupedHippoData = _.groupBy(hippoData.exhalable, 'machine_id')
        _.each(groupedTrackingData, (data, line_id) => {
          const { device_id, move_in } = data
          const partCountAccAtMoveIn = _.sortBy(
            groupedHippoData[device_id],
            'first_timestamp'
          ).find(({ first_timestamp }) =>
            moment(first_timestamp.slice(0, 14), 'YYYYMMDDHHmmss').isAfter(
              moment(move_in)
            )
          )?.part_count
          data.partCountAccAtMoveIn = partCountAccAtMoveIn
        })
        context.groupedHippoData = groupedHippoData
        Object.assign(context.trackingDataMap, groupedTrackingData)
      },
      fetchTrackingData(lineIdList) {
        return fetchDbData('a_yihcheng_view_work_tracking_detail', {
          whereClause: `move_out IS NULL AND line_id IN ('${lineIdList.join(
            "', '"
          )}') ORDER BY move_in ASC`,
        })
      },
      fetchHippoData(machineIdList, startDate) {
        const currDate = moment().format('YYYYMMDD')
        return hippo
          .newSimpleExhaler()
          .space('part_count_merged')
          .index('machine_id', machineIdList)
          .indexRange('date', startDate, currDate)
          .columns(
            'group_id',
            'machine_id',
            'date',
            'work_shift',
            'program_name',
            'op',
            'product_id',
            'std_minute',
            'part_count',
            'first_timestamp',
            'last_timestamp',
            'first_on_timestamp',
            'last_on_timestamp',
            'operate_millisecond'
          )
          .exhale()
      },
      // 看板換頁
      setDashboardSchedule() {
        const context = this
        context.dashboardSchedule = new Schedule('updateStoreData')
          .freqMillisecond(context.dashboardRefreshingSpanInSec * 1000)
          .action(context.renderSlide.bind(context))
          .start(true)
      },
      renderSlide() {
        const context = this
        const { drawingLineOrder } = context
        let { nextSlideIndex } = context
        const dataLen = drawingLineOrder.length
        const orderIndexList = []

        if (context.drawingLineOrder[context.nextSlideIndex]) {
          if (dataLen > 1) {
            for (let i = 0; i < 2; i++) {
              orderIndexList.push(nextSlideIndex)
              nextSlideIndex++
              if (nextSlideIndex > dataLen - 1) {
                nextSlideIndex = 0
              }
            }
          } else {
            orderIndexList.push(nextSlideIndex, null)
          }

          orderIndexList.forEach((orderIndex, index) => {
            const lineId =
              orderIndex === null ? null : context.drawingLineOrder[orderIndex]
            const trackingData =
              lineId === null ? undefined : context.trackingDataMap[lineId]
            context.lineRenderderList[index].update(
              context.toRenderData(trackingData)
            )
          })
          // 播放狀態改變 index 以顯示下一頁，停止狀態則持續刷新同一頁
          if (!context.isPlaying) {
            context.nextSlideIndex -= 2
            if (context.nextSlideIndex < 0) {
              context.nextSlideIndex += dataLen
            }
          }
        }
      },
      initLineRenderer() {
        const context = this
        const { $lineContainer } = context
        class LineRenderer {
          constructor($container) {
            this.$container = $container
            this.data = null
            this.$lineInfo = $container.children('.line-info')
            this.$lineOutput = $container.children('.line-output')
            this.$lineStatus = this.$lineInfo.children('.line-status')
            this.$statusIcon = this.$lineStatus.find('.round')
            this.$lineName = this.$lineStatus.children('.line-name')
            this.$lineDetail = this.$lineInfo.children('.line-detail')
            this.$workId = this.$lineDetail.find('.work-id')
            this.$productId = this.$lineDetail.find('.product-id')
            this.$productName = this.$lineDetail.find('.product-name')
            this.$productDesc = this.$lineDetail.find('.product-desc')
            this.$processName = this.$lineDetail.find('.process-name')
            this.$outputMain = this.$lineOutput.children('.output-main')
            this.$otherInfo = this.$lineOutput.children('.other-info')
            this.$theoryOutput = this.$outputMain
              .children('.theory-output')
              .children('.main-output-value')
            this.$actualOutput = this.$outputMain
              .children('.actual-output')
              .children('.main-output-value')
            this.$qtyToProduce = this.$otherInfo
              .children('.qty-to-produce')
              .children('.other-info-value')
            this.$lastProduceTime = this.$otherInfo
              .children('.last-produce-time')
              .children('.other-info-value')
          }
          update(data) {
            this.data = data
            this.isWorking = data.isWorking
            this.$lineName.text(data.line_name || '---')
            this.$theoryOutput.text(data.theoryOutput || '---')
            this.$actualOutput.text(data.actualOutput || '---')
            this.$qtyToProduce.text(data.qtyToProduce || '---')
            this.$lastProduceTime.text(
              data.lastProduceTime
                ? data.lastProduceTime.toFormatedTime()
                : '---'
            )
            this.updateStatus()
            this.updateDetail(data)
          }
          updateStatus() {
            const { isWorking } = this
            this.$statusIcon
              .toggleClass('play', isWorking)
              .toggleClass('pause', !isWorking)
              .children('i')
              .toggleClass('fa-play', isWorking)
              .toggleClass('fa-pause', !isWorking)
          }
          updateDetail(data) {
            this.$workId
              .text(data.work_id || '---')
              .toggleClass(
                'font-smaller',
                Boolean(data.work_id && data.work_id.length > 14)
              )
            this.$productId
              .text(data.product_id || '---')
              .toggleClass(
                'font-smaller',
                Boolean(data.product_id && data.product_id.length > 14)
              )
            this.$productName
              .text(data.product_name || '---')
              .toggleClass(
                'font-smaller',
                Boolean(data.product_name && data.product_name.length > 14)
              )
            this.$productDesc
              .text(data.product_desc || '---')
              .toggleClass(
                'font-smaller',
                Boolean(data.product_desc && data.product_desc.length > 14)
              )
            this.$processName
              .text(data.process_name || '---')
              .toggleClass(
                'font-smaller',
                Boolean(data.process_name && data.process_name.length > 14)
              )
          }
        }
        for (let i = 0; i < 2; i++) {
          context.lineRenderderList.push(new LineRenderer($lineContainer.eq(i)))
        }
      },
      toRenderData(data = {}) {
        const context = this
        const {
          device_id,
          line_name,
          work_id,
          product_id,
          product_name,
          product_desc,
          process_name,
          move_in,
          std_hour,
          partCountAccAtMoveIn,
          output_exp: qtyToProduce,
        } = data
        const currMachineData = device_id
          ? context.currMachineDataMap[device_id]
          : {}
        const { lastProduceTime, partCountAcc } = currMachineData
        const theoryOutput = lastProduceTime
          ? (new Date(lastProduceTime).getTime() -
              moment(move_in).toDate().getTime()) *
            std_hour
          : undefined
        let actualOutput = null

        if (
          partCountAcc !== null &&
          partCountAccAtMoveIn &&
          context.groupedHippoData
        ) {
          // 區間內可能多次歸零，只能一筆一筆算出差值再累加
          const hippoDataSortByTime = _.sortBy(
            context.groupedHippoData[device_id],
            'first_timestamp'
          )
          const indexOfWorkStart = hippoDataSortByTime.findIndex(
            ({ first_timestamp }) =>
              moment(first_timestamp.slice(0, 14), 'YYYYMMDDHHmmss').isAfter(
                moment(move_in)
              )
          )
          const hippoDataInWorkingTime = hippoDataSortByTime.slice(
            indexOfWorkStart
          )
          const partCountInWorkingTime = [
            ..._.pluck(hippoDataInWorkingTime, 'part_count'),
            partCountAcc,
          ]
          const indexListOfReset = partCountInWorkingTime.reduce(
            (a, partCount, i) => {
              const prevPartCount =
                i === 0 ? null : partCountInWorkingTime[i - 1]
              if (prevPartCount !== null && prevPartCount > partCount) {
                a.push(i)
              }
              return a
            },
            []
          )
          const indexListOfResetWithBoundary = [
            0,
            ...indexListOfReset,
            partCountInWorkingTime.length,
          ]
          const partCountDataSplitByReset = indexListOfResetWithBoundary.reduce(
            (a, x, i) => {
              if (i !== indexListOfResetWithBoundary.length - 1) {
                a.push(
                  partCountInWorkingTime.slice(
                    x,
                    indexListOfResetWithBoundary[i + 1]
                  )
                )
              }
              return a
            },
            []
          )
          actualOutput = partCountDataSplitByReset
            .map((list) => list[list.length - 1] - list[0])
            .reduce((a, x) => a + x)
        }

        return {
          isWorking: !_.isEmpty(data),
          line_name,
          work_id,
          product_id,
          product_name,
          product_desc,
          process_name,
          theoryOutput,
          actualOutput,
          qtyToProduce,
          lastProduceTime,
        }
      },
      // 建立開始輪播、結束輪播的事件綁定
      initDashboard() {
        const context = this

        context.initLineRenderer()

        $('#rotate-start').on('click', context.playCarousel.bind(context))
        $('#rotate-end').on('click', context.exitCarousel.bind(context))
        $('#rotate-pause').on('click', context.pauseCarousel.bind(context))
        $('#rotate-forward').on('click', context.toNextSlide.bind(context))
        $('#rotate-backward').on('click', context.toPrevSlide.bind(context))
      },
      // 開始輪播
      playCarousel() {
        const context = this
        context.startPlayLoadingBtn.doing()
        // 只能選一個群組
        context.selectedGroupId = _.pluck(
          context.groupLineTable.getSelectedRowData(),
          0
        )?.[0]
        if (!context.selectedGroupId) {
          context.startPlayLoadingBtn.done()
          return
        }
        context.drawingLineOrder = context.groupLineMap[context.selectedGroupId]
        context.trackingDataMap = Object.fromEntries(
          context.drawingLineOrder.map((line_id) => [line_id])
        )

        context.nextSlideIndex = 0
        context.isPlaying = true
        context.trackingSchedule.start()
        context.updateTrackingDataPromise
          .then(() => {
            context.startPlayLoadingBtn.done()
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
            context.dashboardSchedule.start()
          })
          .catch((err) => {
            context.startPlayLoadingBtn.done()
            console.warn(err)
            $.smallBox({
              sound: false,
              title: '發生錯誤',
              content: '請聯絡管理員',
              color: colors.red,
              iconSmall: 'fa fa-times',
              timeout: 4000,
            })
          })
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

        context.trackingSchedule.stop()
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
            context.nextSlideIndex =
              context.groupLineMap[context.selectedGroupId].length - 1
          }
        }
      },
      // 下一個
      toNextSlide() {
        const context = this
        context.dashboardSchedule.stop()
        if (!context.isPlaying) {
          context.nextSlideIndex++
          if (
            context.nextSlideIndex >=
            context.groupLineMap[context.selectedGroupId].length
          ) {
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
            context.groupLineMap[context.selectedGroupId].length -
            prevSlideIndex
        } else {
          context.nextSlideIndex = prevSlideIndex
        }
        context.dashboardSchedule.start()
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
    ],
  })
}
