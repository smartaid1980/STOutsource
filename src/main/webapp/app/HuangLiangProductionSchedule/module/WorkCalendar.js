import {
  DATE_FORMAT,
  DATE_DAY_FORMAT,
  TIME_FORMAT,
  MILLISECONDS_PER_DAY,
  DATETIME_FORMAT,
} from './constans.js'
import { context } from './page/04_pre_scheduling.js'

function getWorkCalendar() {
  class WorkCalendar extends window.FullCalendar.Calendar {
    constructor(ele, options = {}) {
      super(
        ele,
        Object.assign(
          {
            plugins: ['interaction', 'resourceTimeline'],
            contentHeight: 'auto',
            aspectRatio: 1.5,
            header: {
              left: 'today prev,next',
              right: 'dayView,shiftView',
            },
            defaultView: 'shiftView',
            datesAboveResources: true,
            resourceAreaWidth: '15%',
            nowIndicator: true, // 顯示現在的線
            resourceColumns: [
              // 資源欄位名稱，每一個橫條都是一項資源
              {
                group: true, // 是否群組化(跨欄顯示)
                labelText: '機台',
                field: 'name', // resource[field]來判斷是否為同一種資源
              },
              {
                labelText: '功能',
                field: 'title', // resource[field]來判斷是否為同一種資源
              },
            ],
            slotLabelFormat: [
              {
                // 為了拿到年的資訊
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              }, // top level of text
              {
                hour: 'numeric',
              }, // lower level of text
            ],
            views: {
              dayView: {
                type: 'resourceTimeline',
                buttonText: '天',
                duration: {
                  days: 7, // 預設一次顯示7天
                },
                slotDuration: '24:00:00', // 間格時間為8小時
              },
              shiftView: {
                type: 'resourceTimeline',
                buttonText: '班次',
                duration: {
                  days: 7, // 預設一次顯示7天
                },
                slotDuration: context.SHIFT_DURATION_FORMATTED, // 間格時間為8小時
              },
              hourView: {
                type: 'resourceTimeline',
                buttonText: '小時',
                duration: {
                  days: 7, // 預設一次顯示7天
                },
                slotDuration: '00:30:00',
              },
            },
            editable: true,
            eventDurationEditable: false, // 不可以調整事件長度
            droppable: true, // this allows things to be dropped onto the calendar
            // 外部元件拖入calendar。非量產時間、生產指令
            drop(info) {
              console.log(info)
              const { draggedEl } = info
              const dropInfo = {
                machine_id: info.resource._resource.extendedProps.key,
                start: info.date,
                end: moment(info.date).add(8, 'hours'),
              }
              const isInsertNonProduction = draggedEl.id === 'insert-non-p'
              if (isInsertNonProduction) {
                // 非量產時間
                context.showNonProductionModal({
                  machine_id: dropInfo.machine_id,
                  exp_time: WorkCalendar.toShiftTime(dropInfo.start),
                  exp_edate: WorkCalendar.toShiftTime(dropInfo.end),
                })
              } else {
                // 預排
                const orderId = $(draggedEl).data('order_id')
                const data = context.woList.getData(orderId)
                if (!data.exp_date) {
                  $.smallBox({
                    title: '無預計交期',
                    content: '請生管於「生產指令狀態查詢」維護',
                    color: servkit.statusColors.alarm,
                    timeout: 4000,
                  })
                  return
                }
                context.editScheduleModal.changeStatus('create-schedule')
                context.editScheduleModal
                  .fillFormData([Object.assign({}, data, dropInfo)])
                  .then(() => {
                    context.editScheduleModal.$modal.modal('show')
                  })
              }
            },
            eventClick(info) {
              console.log(info)
              let id = info.event.id
              const dashSplit = id.split('-')
              id = id
                .replace('-nonProduction-main', '')
                .replace('-productionScheduling-main', '')
                .replace('-woMStatus-main', '')
              if (
                dashSplit[dashSplit.length - 1] === 'main' &&
                info.el.classList.contains('clickable')
              ) {
                // 必須有-才是建立的事件，沒有的話表示是source(可拖拉區域)
                const eventType = dashSplit[dashSplit.length - 2]
                const isRemove = this.isToRemove(info)
                let data
                switch (eventType) {
                  case 'nonProduction': // 非量產時間 - 黃色
                    data = context.nonProduction.getData(id)
                    if (isRemove) {
                      context.showCancelScheduleModal(null, data)
                    } else {
                      context.showNonProductionModal(data)
                    }
                    break
                  case 'productionScheduling': // 預排 - 藍色
                    data = context.productionScheduling.getData(id)
                    if (isRemove) {
                      context.showCancelScheduleModal(data.order_id, data)
                    } else {
                      var correctionEvent = this.getEventById(
                        id + '-productionScheduling-correction'
                      )
                      var mainEvent = this.getEventById(
                        id + '-productionScheduling-main'
                      )
                      context.productionScheduling.editType = 'edit' // 更新目前預排狀態
                      context.editScheduleModal.changeStatus('view-schedule')
                      context.editScheduleModal
                        .fillFormData([
                          Object.assign({}, data, {
                            start: correctionEvent.start,
                            end: mainEvent.end,
                          }),
                        ])
                        .then(() => {
                          context.editScheduleModal.$modal.modal('show')
                        })
                    }
                    break
                  case 'woMStatus': // 派工(未有實際開工日) - 綠色
                    data = context.woMStatus.getData(id)
                    var lang = servkit.getCookie('lang')
                    var url =
                      '#app/HuangLiangProductionSchedule/function/' +
                      lang +
                      '/03_machine_assignment.html'
                    var time = moment(data.wo_m_time).format('YYYY/MM/DD')
                    window.open(
                      `${url}?order_id=${data.order_id}&time=${time}&machine_id=${data.machine_id}`,
                      '_blank'
                    )
                    break
                  case 'act': // 派工(有實際開工日) - 咖啡色
                    break
                  case 'quality': // 良品與顆數 - 深綠色(小)
                    break
                }
              }
            },
            eventDragStart(info) {
              $(info.el).prev('a.fc-event.correction').addClass('hide')
              $(info.el).next('a.fc-event.buffer').addClass('hide')
            },
            eventDragStop(info) {
              $(info.el).prev('a.fc-event.correction').removeClass('hide')
              $(info.el).next('a.fc-event.buffer').removeClass('hide')
            },
            // 拖拉事件，只有非量產時間可拖拉
            eventDrop(info) {
              const id = info.event.id
              const type = id.split('-')[id.split('-').length - 1]
              const changeResource = info.newResource
              const machine_id = info.event.constraint.replace(
                'nonProduction',
                ''
              )
              const data = context.nonProduction.getData(
                id.replace('-nonProduction-main', '')
              )
              const exp_time = WorkCalendar.toShiftTime(
                info.event.start,
                DATETIME_FORMAT
              )
              const exp_edate = WorkCalendar.toShiftTime(
                info.event.end,
                DATETIME_FORMAT
              )
              console.log(id, type, changeResource, info)

              context.nonProduction
                .isOverlapped(machine_id, exp_time, exp_edate, data)
                .then((isOverlapped) => {
                  if (isOverlapped) {
                    $.smallBox({
                      title: '非量產時間不可重疊',
                      color: servkit.statusColors.alarm,
                      timeout: 4000,
                    })
                    info.revert()
                  } else if (data) {
                    context.nonProduction.saveNonProduction(
                      data,
                      {
                        machine_id,
                        exp_time: WorkCalendar.toShiftTime(
                          info.event.start,
                          DATETIME_FORMAT
                        ),
                        exp_edate: WorkCalendar.toShiftTime(
                          info.event.end,
                          DATETIME_FORMAT
                        ),
                        duration:
                          (+info.event.end - +info.event.start) /
                          (60 * 60 * 1000),
                      },
                      info
                    )
                  }
                })
            },
            viewSkeletonRender(view) {
              // 透過view button繪製
              this.refreshCalendar()
            },
            datesRender(view) {
              // 透過render繪製
              this.refreshCalendar()
            },
            eventRender(info) {
              // 顯示tooltip(詳細資訊)、建立刪除按鈕
              const description = info.event.extendedProps.description
              if (description) info.el.setAttribute('title', description)
              const $ele = $(info.el)
              if (
                $ele.hasClass('clickable') &&
                $ele.find('.remove').length === 0
              ) {
                if (
                  info.event.id.endsWith('-nonProduction-main') ||
                  info.event.id.endsWith('-productionScheduling-main')
                )
                  $ele.append(
                    '<a class="remove"><i class="fa fa-times"></i></a>'
                  )
              }
            },
          },
          options
        )
      )
      this.init()
      this.indexMap = {
        0: '非量產時間',
        1: '預排',
        2: '機台派工',
        3: '實際進度',
      }
    }
    init() {
      const self = this
      // 設定生產指令拖拉功能
      new window.FullCalendarInteraction.Draggable(
        document.getElementById('wo-list-result'),
        {
          itemSelector: '.card',
          eventData(eventEl) {
            return {
              create: false,
              title: $(eventEl).find('div:first').text(),
              color: '#ffffffad', // 白色
              borderColor: '#4a89c7', // 藍色
              duration: context.SHIFT_DURATION_FORMATTED,
              constraint: 'productionScheduling',
            }
          },
        }
      )
      // 設定停機設定拖拉功能
      new window.FullCalendarInteraction.Draggable(
        document.getElementById('query-schedule-frame'),
        {
          itemSelector: '#insert-non-p',
          eventData(eventEl) {
            return {
              create: false,
              title: $(eventEl).find('div:first').text(),
              color: '#ffffffad', // 白色
              borderColor: '#d2b24d', // 褐色
              duration: context.SHIFT_DURATION_FORMATTED,
              constraint: {
                resourceIds: _.map(
                  context.machineMap,
                  (val, key) => key + 'index' + 0
                ), // constrain dragging to these
              },
            }
          },
        }
      )

      // 透過fullcalendar套件往前一周、往後一周
      $('#calendar').on('click', '.fc-left', function (evt) {
        // return
        const buttonClassList = [
          'fc-today-button',
          'fc-prev-button',
          'fc-icon-chevron-left',
          'fc-next-button',
          'fc-icon-chevron-right',
        ]
        const isClickOnBtn =
          _.intersection(Array.from(evt.target.classList), buttonClassList)
            .length > 0
        if (isClickOnBtn) {
          $('#start-date').val(
            moment(self.view.currentStart).format(DATE_FORMAT)
          )
          $('#end-date').val(
            moment(self.view.currentEnd).subtract(1, 'days').format(DATE_FORMAT)
          )
          $('#query-schedule-btn').trigger('click') // 重新查詢排程資料
        }
      })
    }
    refreshCalendar() {
      // 強制把calendar的顯示
      const $timeAreaHeader = $('.fc-widget-header.fc-time-area')
      const $spanInDateHeader = $timeAreaHeader.find('tr:first-child span')
      const $spanInShiftHeader = $timeAreaHeader.find('tr:nth-child(2) span')
      const viewType = this.view.type
      let $el
      // 修改日期顯示方式
      $spanInDateHeader.each((i, el) => {
        $el = $(el)
        if (!$el.data('date')) {
          $el.data('date', el.textContent)
        }
        el.textContent = moment($el.data('date')).format(DATE_DAY_FORMAT)
      })
      // 將時間修改為班次，e.g. 起始時間從00:00變08:00
      if (viewType === 'shiftView') {
        $spanInShiftHeader.each((i, el) => {
          $el = $(el)
          const th = el.closest('th')
          const index = $(th).index()
          const remainder = index % 3
          el.textContent = context.preCon.getShift[remainder].name
        })
      } else if (viewType === 'hourView') {
        $spanInShiftHeader.each((i, el) => {
          el.innerHTML = moment(el.textContent, TIME_FORMAT)
            .add(context.SHIFT_TIME_OFFSET_TO_CALENDAR_TIME, 'hours')
            .locale('en')
            .format(TIME_FORMAT)
        })
      }
      // 隱藏授權訊息
      $('.fc-license-message').addClass('hide')
      // 以天顯示時，把班次名稱(第二列)拿掉
      if ($('.fc-dayView-view').length) {
        $('.fc-head .fc-time-area table tbody tr:eq(1)').remove()
      }
    }
    resetCalendar(start, end, machineList) {
      // 重新建立calendar事件
      // start跟end為date object
      // 調整開始日期
      this.gotoDate(start)
      // 調整顯示區間
      var views = this.getOption('views')
      views.dayView.duration.days = Math.ceil(
        Math.abs(start - end) / MILLISECONDS_PER_DAY + 1
      )
      views.shiftView.duration.days = Math.ceil(
        Math.abs(start - end) / MILLISECONDS_PER_DAY + 1
      )
      views.hourView.duration.days = Math.ceil(
        Math.abs(start - end) / MILLISECONDS_PER_DAY + 1
      )
      this.setOption('views', views)

      // 刪掉事件(避免已經不存在的事件殘留)
      _.each(this.getEvents(), (e) => e.remove())
      // 刪掉resource(避免已經不存在的resource殘留)
      _.each(this.getResources(), (e) => e.remove())

      // 調整事件範圍
      this.addEvent({
        // 新增範圍
        id: 'productionScheduling',
        groupId: 'productionScheduling', // 可拖拉至其他機台
        start: new Date(moment(start).subtract(1, 'years')), // 把可放的範圍往前拉1年
        end: new Date(moment(end).add(1, 'years')), // 把可放的範圍往後拉1年
        rendering: 'background',
        color: '#3b9ff352',
        resourceIds: _.map(servkit.getMachineList(), (val) => {
          return val + 'index' + 1
        }),
      })

      _.each(machineList, (machine) => {
        const value = context.machineMap[machine]
        // 調整停機事件範圍(by 機台)
        this.addEvent({
          // 新增後能移動的範圍(只能在相同機台上調整)
          id: 'nonProduction' + machine,
          groupId: 'nonProduction' + machine,
          start: new Date(moment(start).subtract(1, 'years')), // 把可放的範圍往前拉1年
          end: new Date(moment(end).add(1, 'years')), // 把可放的範圍往後拉1年
          rendering: 'background',
          color: '#d2b24d52',
          resourceId: machine + 'index' + 0,
        })
        // 調整機台派工事件範圍(by 機台)
        this.addEvent({
          // 新增後能移動的範圍(只能在相同機台上調整)
          id: 'woMStatus' + machine,
          groupId: 'woMStatus' + machine,
          start: new Date(moment(start).subtract(1, 'years')), // 把可放的範圍往前拉1年
          end: new Date(moment(end).add(1, 'years')), // 把可放的範圍往後拉1年
          rendering: 'background',
          color: 'white',
          resourceId: machine + 'index' + 2,
        })
        // 加上不同狀態(resource)，一台機台就會建4個resoure
        _.times(4, (num) => {
          var data = {
            id: machine + 'index' + num,
            key: machine,
            name: value.device_name + '\n(' + value.mac_type + ')',
            title: this.indexMap[num],
          }
          if (!num) data.type = value.mac_type
          this.addResource(data)
        })
      })
    }
    isToRemove(info) {
      // 確認是否為要刪除的行為，如果是一併做刪除的行為
      return (
        info.jsEvent &&
        ['fa fa-times', 'remove'].includes(info.jsEvent.target.className)
      )
    }
  }
  return WorkCalendar
}

export { getWorkCalendar }
