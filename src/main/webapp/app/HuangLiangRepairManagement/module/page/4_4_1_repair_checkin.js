export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      ctx.shiftList = ctx.preCon.getShiftList
      ctx.initCalendar()
      ctx.initAuth()

      //setup date and time
      setInterval(function () {
        $('#timestmap').text(moment(new Date()).format('YYYY/MM/DD HH:mm:ss'))
      }, 1000)

      ctx.$checkInBtn.on('click', function (evt) {
        ctx.clickEvent(evt, ctx)
      })
      ctx.$checkOutBtn.on('click', function (evt) {
        ctx.clickEvent(evt, ctx)
      })
    },
    util: {
      $calendar: $('#calendar'),
      $userId: $('#user_id'),
      $password: $('#password'),
      $checkInBtn: $('#check-in-btn'),
      $checkOutBtn: $('#check-out-btn'),
      loadingBtnEdit: servkit.loadingButton(
        document.querySelector('#check-in-btn')
      ),
      flag: false,
      initAuth: function () {
        var ctx = this
        //admin與維修人員才可報到
        var checkInGroup = [
          ctx.commons.sys_super_admin_group,
          ctx.commons.sys_manager_group,
          ctx.commons.repair,
        ]

        var userGroupList = JSON.parse(sessionStorage.loginInfo).user_group
        if (_.intersection(userGroupList, checkInGroup).length > 0) {
          $('#check-in-widget').removeClass('hide')
        }
      },
      initCalendar: function () {
        var ctx = this

        ctx.$calendar.fullCalendar({
          lang: 'zh-tw',
          header: {
            left: 'title',
            center: 'basicWeek',
            right: 'prev,next',
          },
          editable: true,
          height: 760,
          defaultView: 'agendaWeek',
          allDaySlot: false,
          slotDuration: { hours: 8 },
          events: function (start, end, timezone, callback) {
            console.log('events')
            ctx.$calendar.fullCalendar('removeEvents')
            ctx.getCheckInHistoryEvents(
              start.format('YYYY/MM/DD HH:mm:ss'),
              end.format('YYYY/MM/DD HH:mm:ss'),
              ctx.shiftList,
              callback
            )
          },
          windowResize: function () {
            ctx.$calendar.fullCalendar('refetchEvents')
          },
          viewRender: function () {
            $('.fc-axis.fc-time.fc-widget-content')
              .addClass('text-center')
              .find('span')
              .each(function (index, ele) {
                var shiftObj = ctx.shiftList[index]
                $(ele).html(
                  [
                    shiftObj.name,
                    moment(shiftObj.start).format('HH:mm:ss') +
                      ' - ' +
                      moment(shiftObj.end).format('HH:mm:ss'),
                    '可報到時間',
                    moment(shiftObj.checkinStart).format('HH:mm:ss') +
                      ' - ' +
                      moment(shiftObj.checkinEnd).format('HH:mm:ss'),
                  ].join('</br>')
                )
              })

            $(
              '.fc-axis, .fc-axis.fc-widget-header, .fc-axis.fc-widget-content'
            ).width('107px')
            $('.fc-slats table').height('717px')
          },
          eventRender: function (event, element) {
            element.attr('data-top', event.top)
            element.attr('data-bottom', event.bottom)
          },
          eventAfterAllRender: function () {
            // console.log("eventAfterAllRender");
            $('.fc-content .fc-time').remove()

            $('.fc-time-grid-event').each(function (index, elem) {
              var top = $(elem).attr('data-top')
              var bottom = $(elem).attr('data-bottom')

              $(elem).css({
                left: '0%',
                right: '0%',
                top: top + 'px',
                bottom: bottom + 'px',
                margin: '5px 10px 1px 0px',
              })
            })
          },
        })

        /* hide default buttons */
        $('.fc-right, .fc-center').hide()

        $('#calendar-buttons')
          .on('click', '#btn-prev', function () {
            $('.fc-prev-button').click()
            return false
          })
          .on('click', '#btn-next', function () {
            $('.fc-next-button').click()
            return false
          })
      },
      clickEvent: function (evt, ctx) {
        evt.preventDefault()
        ctx.loadingBtnEdit.doing()
        try {
          servkit.ajax(
            {
              url: `api/huangliang/repairEmpCheckIn/${evt.currentTarget.dataset.action}`,
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                user_id: ctx.$userId.val(),
                password: ctx.$password.val(),
              }),
            },
            {
              success: function (data) {
                $('#calendar').fullCalendar('refetchEvents')

                $.smallBox({
                  sound: false, //不要音效
                  title: data.user_name + data.msg,
                  content: "<i class='fa fa-clock-o'></i> <i>1秒前...</i>",
                  color: servkit.colors.green,
                  icon: 'fa fa-check',
                  timeout: 4000,
                })
              },
              fail: function (data) {
                $.smallBox({
                  sound: false, //不要音效
                  title: data,
                  content: "<i class='fa fa-clock-o'></i> <i>1秒前...</i>",
                  color: servkit.colors.red,
                  icon: 'fa fa-times',
                  timeout: 4000,
                })
              },
            }
          )
        } catch (e) {
          console.warn(e)
        } finally {
          ctx.loadingBtnEdit.done()
        }
      },
      getCheckInHistoryEvents: function (startDate, endDate, shiftList, cb) {
        servkit.ajax(
          {
            url: 'api/huangliang/repairEmpCheckIn/read',
            type: 'POST',
            dataType: 'json',
            data: {
              start_date: startDate,
              end_date: endDate,
            },
          },
          {
            success: function (data) {
              var groupByDateShift = _.groupBy(data, function (elem) {
                return elem.logically_date + '@@' + elem.work_shift_name
              })
              var events = []
              _.each(groupByDateShift, function (groupData) {
                _.each(groupData, function (checkInData, index) {
                  var shiftSeq = _.find(shiftList, function (shiftObj) {
                    return shiftObj.name == checkInData.work_shift_name
                  }).sequence
                  var top = (shiftSeq - 1) * 240 + index * 45
                  var bottom = (top + 45) * -1
                  events.push({
                    top: top,
                    bottom: bottom,
                    title: `${checkInData.user_name}
                    ${moment(checkInData.check_in_tsp).format('HH:mm:ss')} ~ ${
                      checkInData.check_out_tsp
                        ? moment(checkInData.check_out_tsp).format('HH:mm:ss')
                        : ''
                    }`,
                    start: checkInData.work_shift_start,
                    end: checkInData.work_shift_end,
                    editable: false,
                  })
                })
              })

              cb(events)
            },
          }
        )
      },
    },
    preCondition: {
      getShiftList: function (done) {
        servkit.ajax(
          {
            url: 'api/workshift/today',
            type: 'GET',
            contentType: 'application/json',
          },
          {
            success: function (data) {
              done(
                _.sortBy(data, function (shiftObj) {
                  shiftObj.checkinStart = moment(shiftObj.start)
                    .add(-30, 'minute')
                    .format('YYYY/MM/DD HH:mm:ss')
                  shiftObj.checkinEnd = moment(shiftObj.end)
                    .add(-30, 'minute')
                    .format('YYYY/MM/DD HH:mm:ss')
                  return shiftObj.sequence
                })
              )
            },
          }
        )
      },
    },
    dependencies: [['/js/plugin/fullcalendar/jquery.fullcalendar.min.js']],
  })
}
