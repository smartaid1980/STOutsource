import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      ctx.initialize(ctx)
      ctx.initEvents(ctx)
      ctx.$modalEndDate.on('change', function () {
        const modalStartDate = ctx.$modalStartDate.val()
        const modalEndDate = ctx.$modalEndDate.val()
        const start = new Date(modalStartDate)
        const end = new Date(modalEndDate)
        if (start.getTime() > end.getTime()) {
          ctx.$modalStartDate.val(modalEndDate)
        }
      })

      ctx.reportTable = createReportTable({
        $tableElement: $('#stk-line-shift-table'),
        $tableWidget: $('#stk-line-shift-widget'),
        centerColumn: [1, 2],
        // hideCols: [3],
        customBtns: [
          `<button class='btn btn-primary stk-insert-btn' title='Add new data'><span class='fa fa-plus fa-lg'></span></button>`,
          `<nobr>功能說明 : 新增要計入稼動率的班次日期與應工作時數，並可依各線別調整任意日期之工作時數</nobr>`,
        ],
        showNoData: false,
      })

      ctx.line_hour_reportTable = createReportTable({
        $tableElement: $('#line_hour_edit_table'),
        $tableWidget: $('#line_hour_edit_widget'),
      })
    },
    util: {
      $form: $('#myForm'),
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $submitBtn: $('#submit-btn'),
      $clearBtn: $('#clear-btn'),
      $shiftDayTable: $('#stk-line-shift-table'),
      $shiftDayTablePrev: $('#line-shift-prev'),
      $insertModal: $('#add-line-hour'),
      $insertModalContent: $('#add-line-hour-content'),
      $editModal: $('#line-hour-edit'),
      $addModalForm: $('#modal-form'),
      $modalStartDate: $('#modal-start-date'),
      $modalEndDate: $('#modal-end-date'),
      $modalHour: $('#modal-line-hour'),
      $modalWeekDay: $('[name="week-day"]'),
      $modalSubmitBtn: $('#modal-submit-btn'),
      $modalEditTable: $('#modal-edit-table'),
      $modalTableBody: $('#modal-table-body'),
      $deleteCheckDialog: $('<div id="deleteCheckDialog"></div>'),
      $alertMessage: $('#alertMessage'),
      $alertModal: $('#alertModal'),
      $alertSubmit: $('#alert-submit-btn'),
      $alertCancel: $('#alert-cancel-btn'),
      reportTable: '',
      line_hour_reportTable: '',
      line_shift_data: '',
      datepickerConfig: {
        dateFormat: 'yy/mm/dd',
        prevText: '<i class="fa fa-chevron-left"></i>',
        nextText: '<i class="fa fa-chevron-right"></i>',
      },
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      initClock: function () {
        const $clockPicker = $('#modal-form').find('.clockpicker')
        $('#add-line-hour').css('z-index', 1000)
        $clockPicker.each(function (i, e) {
          $(e).clockpicker({
            placement: 'left',
            donetext: 'Done',
          })
        })
      },
      drawShiftTable: function () {
        const that = this
        that.loadingBtn.doing()
        const startDate = that.$startDate.val()
        const endDate = that.$endDate.val()

        try {
          servkit.ajax(
            {
              url: 'api/getdata/db',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                table: 'a_yihcheng_view_line_shift_time_and_working_hour',
                whereClause: `shift_day between '${startDate}' AND '${endDate}'`,
              }),
            },
            {
              success: function (data) {
                if (data.length) {
                  that.line_shift_data = data
                  const shift_view = ''
                  const ans = []
                  // const groupedData = _.groupBy(
                  //   data,
                  //   (val) => val.shift_day.toFormatedDate() + '||' + val.line_id
                  // )
                  const shift_day = _.uniq(_.pluck(data, 'shift_day'))
                  _.each(shift_day, (i) => {
                    // _.each(i, (val) => {
                    //   const shift = `
                    //   <table name="inbox-table" class="table table-striped table-hover">
                    //   <tbody>
                    //   <tr>
                    //   <td class="inbox-table-icon" style="width: 15%;">
                    //   <span class="label label-default">${val.sequence}</span>
                    //   </td>
                    //   <td class="inbox-data-form" style="width: 20%;">
                    //   <div class="text-center">${val.shift}</div>
                    //   </td>
                    //   <td class="inbox-data-form" style="width: 40%;">
                    //   <div>${val.start_time.toFormatedTime()}~${val.end_time.toFormatedTime()}</div></td><td class="inbox-data-form" style="width: 20%;">
                    //   <div>
                    //   </div>
                    //   </td>
                    //   </tr>
                    //   </tbody>
                    //   </table>
                    //   `
                    //   return (shift_view += shift)
                    // })
                    const arr = [
                      that.dateTrans(i.toFormatedDate()),
                      "<button class='btn btn-xs btn-primary stk-edit-btn' title='Edit'><i class='fa fa-pencil'></i></button>",
                      "<button class='btn btn-xs btn-danger  stk-delete-btn' title='Delete selected rows'><span class='fa fa-trash-o'></span></button>",
                      i[0].line_id,
                    ]
                    // shift_view = ''
                    return ans.push(arr)
                  })
                  that.reportTable.drawTable(ans)
                  // that.drawInsertBtn()
                  that.reportTable.showWidget()
                } else {
                  that.reportTable.clearTable()
                  that.reportTable.drawTable(data)
                  // that.drawInsertBtn()
                  that.reportTable.showWidget()
                }
              },
              fail: function (data) {
                console.warn(data)
              },
            }
          )
        } catch (e) {
          console.warn(e)
        } finally {
          that.loadingBtn.done()
        }
      },
      insertLineWorkHour: function (ctx) {
        const that = this
        const loadingBtn = servkit.loadingButton(
          document.querySelector('#modal-submit-btn')
        )
        loadingBtn.doing()
        const startDate = this.$modalStartDate.val()
        const endDate = this.$modalEndDate.val()
        const hour = this.$modalHour.val()
        const day = []
        const reg = /^[0-9]+(.[0-9]{0,2})?$/
        _.each(this.$modalWeekDay, function (ele) {
          if ($(ele).prop('checked')) {
            day.push(ele.value)
          }
        })
        const params = {
          startDate: startDate,
          endDate: endDate,
          hour: hour,
          workDay: day,
        }
        const ans = []
        const shift_div = $('#shift_time_setting').children()
        _.each(shift_div, (val) => {
          const sequence = $(val).find('.badge').text()
          const shift_input = $(val).find('input')
          const arr = []
          _.each(shift_input, (i) => {
            return arr.push($(i).val())
          })
          return ans.push({
            shift: arr[0],
            start_time: arr[1],
            end_time: arr[2],
            sequence: sequence,
          })
        })
        try {
          if (hour > 0 && hour <= 24 && reg.test(hour)) {
            servkit.ajax(
              {
                url: 'api/servtrack/lineworkinghour/create',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(params),
              },
              {
                success: function () {
                  const smallParams = {
                    color: 'green',
                    title: `${i18n('ServTrackManagement_000145')}`,
                    icon: 'fa fa-check',
                    timeout: 2000,
                  }
                  servkit.ajax(
                    {
                      url: 'api/yihcheng/shift-time/insert-line-shift-time',
                      type: 'PUT',
                      contentType: 'application/json',
                      data: JSON.stringify({
                        start_time: startDate,
                        end_time: endDate,
                        line_shift_time_list: ans,
                      }),
                    },
                    {
                      success: function () {
                        that.commons.smallBox(smallParams)
                        that.$startDate.val(startDate)
                        that.$endDate.val(endDate)
                        that.drawShiftTable()
                        that.preCon.lastRecordDate = endDate
                        that.$insertModal.modal('toggle')
                        that.get_new_insert_line_shift_data()
                        loadingBtn.done()
                      },
                    }
                  )
                },
                fail: function (data) {
                  const smallParams = {
                    color: 'yellow',
                    title: `${i18n('ServTrackManagement_000143')}`,
                    icon: 'fa fa-sign-out',
                    timeout: 2000,
                  }
                  that.commons.smallBox(smallParams)

                  console.warn(data)
                },
              }
            )
          } else {
            $.smallBox({
              title: '生產工時請輸入1~24之內的數字',
              color: servkit.colors.red,
              iconSmall: 'fa fa-times',
              timeout: 4000,
            })
          }
        } catch (e) {
          console.warn(e)
        } finally {
          loadingBtn.done()
        }
      },
      checkDataIsExist: function () {
        const that = this
        const startDate = this.$modalStartDate.val()
        const endDate = this.$modalEndDate.val()
        let queryStartDate
        let queryEndDate
        let dataIsExist = false
        servkit.ajax(
          {
            url:
              'api/servtrack/lineworkinghour/read?startDate=' +
              startDate +
              '&endDate=' +
              endDate,
            type: 'GET',
          },
          {
            success: function (data) {
              if (data.length > 0) {
                queryStartDate = data[0]
                queryEndDate = data[data.length - 1]
                dataIsExist = true
              }
              if (dataIsExist) {
                that.$alertMessage.html(
                  queryStartDate +
                    '~' +
                    queryEndDate +
                    ` ${i18n('ServTrackManagement_000211')}`
                )
                that.$alertModal.modal()
              } else {
                that.insertLineWorkHour()
              }
            },
          }
        )
      },
      drawInsertBtn: function () {
        const that = this
        _.each(that.$shiftDayTable.prev().find('.hidden-xs'), function (ele) {
          $(ele).css('display', 'none')
        })
        that.$shiftDayTable.prev().prepend(
          `<button class='btn btn-primary stk-insert-btn' title='Add new data' style='margin-right:5px'><span class='fa fa-plus fa-lg'></span></button>
            <nobr>功能說明 : 新增要計入稼動率的班次日期與應工作時數，並可依各線別調整任意日期之工作時數</nobr>`
        )
      },
      dateTrans: function (str) {
        const dateStr = str.replace(/-/g, '/')
        const date = new Date(dateStr)
        let day
        switch (date.getDay()) {
          case 0:
            day = `${i18n('ServTrackManagement_000155')}`
            break
          case 1:
            day = `${i18n('ServTrackManagement_000161')}`
            break
          case 2:
            day = `${i18n('ServTrackManagement_000159')}`
            break
          case 3:
            day = `${i18n('ServTrackManagement_000160')}`
            break
          case 4:
            day = `${i18n('ServTrackManagement_000156')}`
            break
          case 5:
            day = `${i18n('ServTrackManagement_000158')}`
            break
          case 6:
            day = `${i18n('ServTrackManagement_000157')}`
        }
        return dateStr + day
      },

      activeCheck: function () {
        $('#modal-edit-table')
          .closest('div')
          .find('div > .stk-delete-btn')
          .hide()
        $('#modal-edit-table')
          .closest('div')
          .find('div > .stk-insert-btn')
          .hide()
        _.each($('#modal-edit-table').find('thead > tr'), function (trEle) {
          const tdCheckBoxEle = $(trEle).find('td:first-child input')
          tdCheckBoxEle.hide()
        })
        _.each($('#modal-edit-table').find('tbody > tr'), function (trEle) {
          const tdCheckBoxEle = $(trEle).find('td:first-child input')
          tdCheckBoxEle.hide()
        })
      },
      filterBracket: function (str) {
        return str.substring(0, str.indexOf('('))
      },
      initialize: function (ctx) {
        servkit.initDatePicker(ctx.$startDate, ctx.$endDate, true)
        servkit.initDatePicker(ctx.$modalStartDate, ctx.$modalEndDate, true)
        servkit.validateForm(ctx.$form, ctx.$submitBtn)
      },
      initEvents: function (ctx) {
        ctx.$submitBtn.on('click', function (evt) {
          evt.preventDefault()
          ctx.drawShiftTable(ctx)
        })
        // .trigger('click')

        ctx.$clearBtn.on('click', function (evt) {
          evt.preventDefault()
          ctx.$form[0].reset()
          ctx.$startDate
            .datepicker(ctx.datepickerConfig)
            .val(moment(new Date()).format('YYYY/MM/DD'))
          ctx.$endDate
            .datepicker(ctx.datepickerConfig)
            .val(moment(new Date()).format('YYYY/MM/DD'))
        })

        ctx.$shiftDayTablePrev.on('click', '.stk-insert-btn', function (evt) {
          evt.preventDefault()
          ctx.$addModalForm[0].reset()
          if (ctx.preCon.lastRecordDate) {
            const date = moment(new Date(ctx.preCon.lastRecordDate))
              .add(1, 'days')
              .format('YYYY/MM/DD')
            ctx.$modalStartDate.datepicker(ctx.datepickerConfig).val()
            ctx.$modalEndDate.datepicker(ctx.datepickerConfig).val()
          } else {
            ctx.$modalStartDate
              .datepicker(ctx.datepickerConfig)
              .val(moment(new Date()).format('YYYY/MM/DD'))
            ctx.$modalEndDate
              .datepicker(ctx.datepickerConfig)
              .val(moment(new Date()).format('YYYY/MM/DD'))
          }
          const db_duration_sp = ctx.preCon.shift_time[0].duration_sp
          ctx.$modalHour.val(parseFloat(db_duration_sp).toFixed(2))
          ctx.initClock()
          ctx.bindWorkShiftTimesEvent('#shift_time_setting')
          ctx.$insertModal.modal()
        })

        ctx.$modalSubmitBtn.on('click', function (evt) {
          evt.preventDefault()
          const hour = ctx.$modalHour.val()
          let section
          if (isNaN(hour)) {
            section = ctx.$modalHour.closest('section')[0]
            if (!section.querySelector('code')) {
              section.insertAdjacentHTML(
                'beforeend',
                `<code class='note-error'>${i18n(
                  'ServTrackManagement_000131'
                )}</code>`
              )
            } else {
              section.querySelector(
                'code'
              ).innerHTML = `<code class='note-error'>${i18n(
                'ServTrackManagement_000131'
              )}</code>`
            }
          } else if (Number(hour) < 0) {
            section = ctx.$modalHour.closest('section')[0]
            if (!section.querySelector('code')) {
              section.insertAdjacentHTML(
                'beforeend',
                `<code class='note-error'>${i18n(
                  'ServTrackManagement_000200'
                )}</code>`
              )
            } else {
              section.querySelector(
                'code'
              ).innerHTML = `<code class='note-error'>${i18n(
                'ServTrackManagement_000200'
              )}</code>`
            }
          } else {
            if (Number(hour) > 24) {
              section = ctx.$modalHour.closest('section')[0]
              if (!section.querySelector('code')) {
                section.insertAdjacentHTML(
                  'beforeend',
                  `<code class='note-error'>${i18n(
                    'ServTrackManagement_000138'
                  )}</code>`
                )
              } else {
                section.querySelector(
                  'code'
                ).innerHTML = `<code class='note-error'>${i18n(
                  'ServTrackManagement_000138'
                )}</code>`
              }
            } else {
              section = ctx.$modalHour.closest('section')[0]
              const code = section.querySelector('code')
              if (code) {
                section.removeChild(code)
              }
              ctx.checkDataIsExist()
            }
          }
        })
        ctx.$shiftDayTable.on('click', '.stk-edit-btn', function (evt) {
          evt.preventDefault()

          const rowData = $(this).closest('tr').data('row-data')
          const edit_data = ctx.line_shift_data.filter(
            (i) => ctx.dateTrans(i.shift_day.toFormatedDate()) === rowData[0]
          )
          const groupedData = _.groupBy(edit_data, (val) => val.line_id)

          let shift_view = ''
          const ans = []
          _.each(groupedData, (i) => {
            // _.each(i, (val) => {
            //   const shift = `
            //   <div
            //       class="inline-group"
            //       style="width: 300px; margin: 10px 0; position: relative;"
            //     >
            //       <i
            //         class="fa fa-lg fa-times-circle-o"
            //         style="
            //           position: absolute;
            //           top: -5px;
            //           left: -5px;
            //           z-index: 3;
            //           display: none;
            //         "
            //       ></i>
            //       <div class="input-group" style="display: table;">
            //         <span
            //           class="badge inbox-badge"
            //           style="
            //             position: absolute;
            //             top: -5px;
            //             right: -20px;
            //           "
            //           >${val.sequence}</span
            //         >
            //         <input
            //           class="form-control"
            //           type="text"
            //           placeholder="${i18n('Shift_Name')}"
            //           value="${val.shift}"
            //         />
            //         <span class="input-group-addon">
            //           <i class="fa fa-bookmark-o"></i>
            //         </span>
            //       </div>
            //       <div class="input-group" style="display: table;">
            //         <input
            //           class="form-control clockpicker"
            //           type="text"
            //           placeholder="${i18n('Start_Time')}"
            //           data-autoclose="true"
            //           value="${val.start_time.toFormatedTime()}"
            //         />
            //         <span class="input-group-addon">
            //           <i class="fa fa-clock-o"></i>
            //         </span>
            //       </div>
            //       <div class="input-group" style="display: table;">
            //         <input
            //           class="form-control clockpicker"
            //           type="text"
            //           placeholder="${i18n('End_Time')}"
            //           data-autoclose="true"
            //           value="${val.end_time.toFormatedTime()}"
            //         />
            //         <span class="input-group-addon">
            //           <i class="fa fa-clock-o"></i>
            //         </span>
            //       </div>
            //     </div>`
            //   return (shift_view += shift)
            // })
            const arr = [
              i[0].shift_day.toFormatedDate(),
              i[0].line_id,
              // shift_view,
              `<span name="edit_duration_sp" >${i[0].duration_sp}</span>`,
              `<button class="btn btn-success" id="success_edit_btn">${i18n(
                'ServTrackManagement_000204'
              )}</button>`,
            ]
            shift_view = ''
            return ans.push(arr)
          })

          ctx.line_hour_reportTable.drawTable(ans)
          const $clockPicker = $('#line_hour_edit_table').find('.clockpicker')
          $clockPicker.each(function (i, e) {
            $(e).clockpicker({
              placement: 'left',
              donetext: 'Done',
            })
          })
          $('#line-hour-edit').css('z-index', 1000)
          ctx.bindWorkShiftTimesEvent(
            $('[name=edit_duration_sp]').closest('td').prev()
          )
          $('#line-hour-edit').modal('show')
        })

        ctx.$shiftDayTable.on('click', '.stk-delete-btn', function (evt) {
          evt.preventDefault()
          const rowData = $(this).closest('tr').data('row-data')
          console.log(rowData)
          ctx.$deleteCheckDialog.dialog({
            autoOpen: false,
            width: 600,
            resizable: false,
            modal: true,
            title: `<div class='widget-header'><h4><i class='fa fa-warning'></i> ${i18n(
              'ServTrackManagement_000148'
            )} </h4></div>`,
            buttons: [
              {
                html: `<i class="fa fa-trash-o"></i>&nbsp; ${i18n(
                  'ServTrackManagement_000042'
                )}`,
                class: 'btn btn-danger',
                click: function () {
                  const closeDialog = $(this)
                  servkit.ajax(
                    {
                      url: 'api/yihcheng/shift-time/delete-line-shift-time',
                      contentType: 'application/json',
                      type: 'DELETE',
                      data: JSON.stringify({
                        shift_day: rowData[0].replace(/\(.\)$/g, ''),
                      }),
                    },
                    {
                      success: function () {
                        $.smallBox({
                          title: '刪除成功',
                          color: servkit.colors.green,
                          iconSmall: 'fa fa-check',
                          timeout: 4000,
                        })
                        ctx.drawShiftTable()
                        ctx.get_new_insert_line_shift_data()
                        closeDialog.dialog('close')
                      },
                    }
                  )
                },
              },
              {
                html: `<i class="fa fa-times"></i>&nbsp; ${i18n(
                  'ServTrackManagement_000078'
                )}`,
                class: 'btn btn-default',
                click: function () {
                  $(this).dialog('close')
                },
              },
            ],
          })
          ctx.$deleteCheckDialog.html(
            rowData[0] + `, ${i18n('ServTrackManagement_000135')}?`
          )
          ctx.$deleteCheckDialog.dialog('open')
        })
        ctx.$modalTableBody.on('draw.dt', '#modal-edit-table', function (evt) {
          evt.preventDefault()
          ctx.activeCheck()
        })
        ctx.$insertModal.on('keydown', function (e) {
          if (e.which == 13) {
            e.preventDefault()
            // ctx.$modalSubmitBtn.trigger('click');
          }
        })
        ctx.$alertSubmit.on('click', function () {
          ctx.insertLineWorkHour()
        })
        ctx.$alertCancel.on('click', function () {
          alert(`${i18n('ServTrackManagement_000212')}`)
        })
        $('#line_hour_edit_table').on('click', '#success_edit_btn', (e) => {
          e.preventDefault()
          const shift_td = $('#success_edit_btn').closest('td').prev().prev()
          const rowData = $('#success_edit_btn').closest('tr').data('row-data')
          const shift_div = shift_td.children()
          const ans = []
          const reg = /^[0-9]+(.[0-9]{0,2})?$/
          const new_duration_sp = $('[name=edit_duration_sp]').val()
          if (
            new_duration_sp > 0 &&
            new_duration_sp <= 24 &&
            reg.test(new_duration_sp)
          ) {
            _.each(shift_div, (val) => {
              const sequence = $(val).find('.badge').text()
              const shift_input = $(val).find('input')
              const arr = []
              _.each(shift_input, (i) => {
                return arr.push($(i).val())
              })
              return ans.push({
                shift_day: rowData[0].replace(/\(.\)$/g, ''),
                line_id: rowData[1],
                shift: arr[0],
                start_time: arr[1],
                end_time: arr[2],
                sequence: sequence,
                duration_sp: Number(new_duration_sp),
              })
            })
            servkit.ajax(
              {
                url: 'api/yihcheng/shift-time/update-line-shift-time',
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(ans),
              },
              {
                success: function () {
                  $.smallBox({
                    title: '修改成功',
                    color: servkit.colors.green,
                    iconSmall: 'fa fa-check',
                    timeout: 4000,
                  })
                  ctx.drawShiftTable()
                  ctx.get_new_insert_line_shift_data()
                  $('#line-hour-edit').modal('hide')
                },
              }
            )
          } else {
            $.smallBox({
              title: '生產工時請輸入1~24之內的數字',
              color: servkit.colors.red,
              iconSmall: 'fa fa-times',
              timeout: 4000,
            })
          }
        })
      },
      get_new_insert_line_shift_data: function () {
        const ctx = this
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_yihcheng_view_line_shift_time_and_working_hour',
            }),
          },
          {
            success: function (data) {
              ctx.line_shift_data = data
            },
          }
        )
      },
      bindWorkShiftTimesEvent: function (workShiftTimeTd) {
        $(workShiftTimeTd)
          .on('focus', '.inline-group', function (e) {
            if (!this.nextElementSibling) {
              const newInputGroup = this.cloneNode(true)
              this.parentNode.appendChild(newInputGroup)

              const $newInputGroup = $(newInputGroup)
              const $inputs = $newInputGroup.find('input')
              $inputs.toArray().forEach((el) => {
                if (el.name === 'is_open') {
                  const id = el.id
                  const no = +id.split('-')[2]
                  const newId = id.replace(/(?<=-)\d+$/, no + 1)
                  el.id = newId
                  el.nextElementSibling.setAttribute('for', newId)
                  el.checked = true
                } else {
                  el.value = ''
                }
              })
              const $seqEle = $newInputGroup.find('.badge')
              $seqEle.text(parseInt($seqEle.text()) + 1)
              $newInputGroup.find('.clockpicker').each(function (i, e) {
                $(e).clockpicker({
                  placement: 'left',
                  dontext: 'Done',
                })
              })
            }
          })
          .on('mouseenter', '.inline-group', function (e) {
            $(this).find('.fa-times-circle-o').show()
          })
          .on('mouseleave', '.inline-group', function (e) {
            $(this).find('.fa-times-circle-o').hide()
          })
          .on('click', '.fa-times-circle-o', function (e) {
            if (this.parentNode.parentNode.children.length > 1) {
              let nextEleSib = this.parentNode.nextElementSibling
              this.parentNode.parentNode.removeChild(this.parentNode)
              while (nextEleSib) {
                nextEleSib.querySelector('.badge').textContent =
                  parseInt(nextEleSib.querySelector('.badge').textContent) - 1
                nextEleSib = nextEleSib.nextElementSibling
              }
            }
          })
      },
    },
    dependencies: [
      ['/js/plugin/clockpicker/clockpicker.min.js'],
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
    ],
    preCondition: {
      lastRecordDate: function (done) {
        servkit.ajax(
          {
            url: 'api/servtrack/lineworkinghour/getlastdate',
            type: 'GET',
          },
          {
            success: function (data) {
              done(data)
            },
          }
        )
      },
      shift_time: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_yihcheng_view_shift_time',
            }),
          },
          {
            success: function (data) {
              let index = 1
              _.each(data, (val) => {
                if (val.is_open === 'Y') {
                  $('#shift_time_setting').append(`
                  <div
                      class="inline-group"
                      style="width: 300px; margin: 10px 0; position: relative;"
                    >
                      <i
                        class="fa fa-lg fa-times-circle-o"
                        style="
                          position: absolute;
                          top: -5px;
                          left: -5px;
                          z-index: 3;
                          display: none;
                        "
                      ></i>
                      <div class="input-group" style="display: table;">
                        <span
                          class="badge inbox-badge"
                          style="
                            position: absolute;
                            top: -5px;
                            right: -20px;
                            width: 15px;
                            height: 14px;
                          "
                          >${index++}</span
                        >
                        <input
                          class="form-control"
                          type="text"
                          placeholder="${i18n('Shift_Name')}"
                          value="${val.shift}"
                        />
                        <span class="input-group-addon">
                          <i class="fa fa-bookmark-o"></i>
                        </span>
                      </div>
                      <div class="input-group" style="display: table;">
                        <input
                          class="form-control clockpicker"
                          type="text"
                          placeholder="${i18n('Start_Time')}"
                          data-autoclose="true"
                          value="${val.start_time.toFormatedTime()}"
                        />
                        <span class="input-group-addon">
                          <i class="fa fa-clock-o"></i>
                        </span>
                      </div>
                      <div class="input-group" style="display: table;">
                        <input
                          class="form-control clockpicker"
                          type="text"
                          placeholder="${i18n('End_Time')}"
                          data-autoclose="true"
                          value="${val.end_time.toFormatedTime()}"
                        />
                        <span class="input-group-addon">
                          <i class="fa fa-clock-o"></i>
                        </span>
                      </div>
                    </div>`)
                }
              })
              done(data)
            },
          }
        )
      },
    },
  })
}
