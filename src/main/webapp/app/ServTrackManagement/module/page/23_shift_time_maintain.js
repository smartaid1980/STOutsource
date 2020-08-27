import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
import GoGoAppFun from '../../../../js/servtech/module/servcloud.gogoappfun.js'
import { ajax } from '../../../../js/servtech/module/servkit/ajax.js'

export default function () {
  const MS_PER_DAY = 24 * 60 * 60 * 1000
  const MS_PER_HOUR = 60 * 60 * 1000
  GoGoAppFun({
    gogo(ctx) {
      ctx.shift_reportTable = createReportTable({
        $tableElement: $('#shift_time_table'),
        $tableWidget: $('#shift_time_widget'),
        columns: [
          {
            width: '25%',
          },
          {
            width: '45%',
          },
          {
            width: '20%',
          },
          {
            width: '10%',
          },
        ],
      })

      ctx.shift_edit_reportTable = createReportTable({
        $tableElement: $('#shift_edit_table'),
        $tableWidget: $('#shift_edit_widget'),
        columns: [
          {
            width: '25%',
          },
          {
            width: '45%',
          },
          {
            width: '20%',
          },
          {
            width: '10%',
          },
        ],
      })

      // 初始化頁面

      function drawShiftTable() {
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
            success(data) {
              ctx.shift_data = data

              const EditBtn = `<button class="btn btn-primary" id="edit_btn">${i18n(
                'ServTrackManagement_000204'
              )}</button>`

              let shift_view = ''
              _.each(ctx.shift_data, (val) => {
                const shift = `
                <table name="inbox-table" class="table table-striped table-hover">
                  <tbody>
                    <tr>
                      <td class="inbox-table-icon" style="width: 15%;">
                        <span class="label label-default">${val.sequence}</span>
                      </td>
                      <td class="inbox-data-form" style="width: 20%;">
                        <div class="text-center">${val.shift}</div>
                      </td>
                      <td class="inbox-data-form" style="width: 40%;">
                        <div>${val.start_time.toFormatedTime(
                          undefined,
                          'HH:mm'
                        )}~${val.end_time.toFormatedTime(
                  undefined,
                  'HH:mm'
                )}</div>
                      </td>
                      <td class="inbox-data-form" style="width: 20%;">
                        <div>
                          <span class="label ${
                            val.is_open === 'Y'
                              ? 'label-success'
                              : 'label-default'
                          } label-default">${
                  val.is_open === 'Y' ? 'ON' : 'OFF'
                }</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                `
                return (shift_view += shift)
              })

              ctx.shift_reportTable.drawTable([
                [
                  ctx.shift_data[0].work_start_time.toFormatedTime(
                    undefined,
                    'HH:mm'
                  ),
                  shift_view,
                  ctx.shift_data[0].duration_sp,
                  EditBtn,
                ],
              ])

              $('#edit_btn').click(function (e) {
                e.preventDefault()
                const rowData = $(this.closest('tr')).data('row-data')
                ctx.edit_row_data = rowData
                drawEditTable()
                $('#shift_time_widget').hide()
                $('#shift_edit_widget').find('code').remove()
                $('#shift_edit_widget').show()
              })
            },
          }
        )
      }

      // 執行
      drawShiftTable()

      // 編輯頁面

      function drawEditTable() {
        let datePicker = '' + '</div>'

        const SuccessBtn = `<button class="btn btn-success" id="success_btn" style="margin-bottom:20px">完成${i18n(
          'ServTrackManagement_000204'
        )}</button>`

        const CancelBtn = `<button class="btn btn-danger" id="cancel_btn">取消${i18n(
          'ServTrackManagement_000204'
        )}</button>`

        _.each(ctx.shift_data, (val) => {
          const edit = `<div
            class="inline-group"
            style="position: relative; margin: 15px 0 10px 15px;"
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
                style="position: absolute; top: -5px; right: -20px;"
                >${val.sequence}</span
              >
              <input
                class="form-control"
                type="text"
                placeholder="${i18n('Shift_Name')}"
                name="shift"
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
                name="start_time"
                value="${val.start_time.toFormatedTime(undefined, 'HH:mm')}"
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
                name="end_time"
                value="${val.end_time.toFormatedTime(undefined, 'HH:mm')}"
              />
              <span class="input-group-addon">
                <i class="fa fa-clock-o"></i>
              </span>
            </div>

            <div class="input-group" style="display: table;">
              <span class="onoffswitch">
                <input
                  type="checkbox"
                  class="onoffswitch-checkbox"
                  id="isopen-onoffswitch-${val.sequence}"
                  name="is_open"
                  value='${val.is_open}'
                />
                <label
                  class="onoffswitch-label"
                  for="isopen-onoffswitch-${val.sequence}"
                >
                  <span
                    class="onoffswitch-inner"
                    data-swchon-text="ON"
                    data-swchoff-text="OFF"
                  ></span>
                  <span class="onoffswitch-switch"></span>
                </label>
              </span>
            </div>
          </div>`

          return (datePicker += edit)
        })

        ctx.shift_edit_reportTable.drawTable([
          [
            `<div class="input-group" style="display: table;">
            <input
              class="form-control clockpicker full-width"
              type="text"
              data-autoclose="true"
              id='edit_shift_clock'
              value="${ctx.edit_row_data[0]}"
            />
            <span class="input-group-addon"
              ><i class="fa fa-clock-o"></i
            ></span>
          </div>`,
            datePicker,
            `<input type="text" class="form-control full-width" value="${ctx.edit_row_data[2]}" id="edit_duration_sp" />`,
            SuccessBtn + '<br>' + CancelBtn,
          ],
        ])
        $('.clockpicker').clockpicker({
          placement: 'right',
          donetext: 'Done',
        })

        const td = $('.inline-group').closest('td')

        const set_checked = td.find('input[type=checkbox]')
        _.each(set_checked, (i) => {
          if ($(i).val() === 'Y') {
            $(i).prop('checked', true)
          } else {
            $(i).prop('checked', false)
          }
        })

        td.on('focus', '.inline-group', function () {
          const hasNextGroup = Boolean(
            this.nextElementSibling &&
              this.nextElementSibling.classList.contains('inline-group')
          )
          if (!hasNextGroup) {
            const newInputGroup = this.cloneNode(true)
            this.insertAdjacentElement('afterend', newInputGroup)

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
            $seqEle.text(Number($seqEle.text()) + 1)
            $newInputGroup.find('.clockpicker').each(function (i, e) {
              $(e).clockpicker({
                placement: 'right',
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
            const shift_length = td.find('.inline-group').length
            if (shift_length > 1) {
              let nextEleSib = this.parentNode.nextElementSibling
              this.parentNode.parentNode.removeChild(this.parentNode)
              while (
                nextEleSib &&
                nextEleSib.classList.contains('inline-group')
              ) {
                nextEleSib.querySelector('.badge').textContent =
                  Number(nextEleSib.querySelector('.badge').textContent) - 1
                nextEleSib = nextEleSib.nextElementSibling
              }
            }
          })
      }
      function validateShiftTime(shiftTimeArr, duration, start_time, $td) {
        const shiftCount = shiftTimeArr.length
        let errorMsg
        // 排除最後一個群組，不填也沒關係
        if (
          shiftTimeArr.some(
            (obj) =>
              !obj.start_time || !obj.end_time || !obj.shift || !obj.is_open
          )
        ) {
          errorMsg = `${i18n('Stk_Required')}`
        } else if (
          !shiftTimeArr.every(
            (obj) =>
              moment(obj.start_time, 'HH:mm').isValid() &&
              moment(obj.end_time, 'HH:mm').isValid()
          )
        ) {
          errorMsg = `時間格式有誤`
        } else if (
          shiftTimeArr
            .filter((obj) => obj.is_open === 'Y')
            .reduce((a, x) => {
              const endTimeMs =
                x.end_time === '00:00'
                  ? moment('24:00', 'HH:mm').toDate().getTime()
                  : moment(x.end_time, 'HH:mm').toDate().getTime()
              const startTimeMs = moment(x.start_time, 'HH:mm')
                .toDate()
                .getTime()
              const shiftSpanInMs = endTimeMs - startTimeMs
              return (
                a +
                (shiftSpanInMs < 0 ? shiftSpanInMs + MS_PER_DAY : shiftSpanInMs)
              )
            }, 0) !==
          Number(duration) * MS_PER_HOUR
        ) {
          errorMsg = '啟用的班次時間總長與應上班時間不一致'
        } else if (shiftTimeArr[0].start_time !== start_time) {
          errorMsg = '第一班的起始時間與班次起始時間不一致'
        } else if (
          _.chain(shiftTimeArr).pluck('shift').uniq().value().length !==
          shiftCount
        ) {
          errorMsg = '班次名稱不能重複'
        } else if (
          shiftTimeArr.reduce(
            (a, x) =>
              a +
              moment(x.end_time, 'HH:mm').isBefore(
                moment(x.start_time, 'HH:mm')
              ),
            0
          ) > 1
        ) {
          errorMsg = `班次時間總長不能超過 24 小時`
        } else if (
          shiftTimeArr
            .map((obj) => [obj.start_time, obj.end_time])
            .flat()
            .reduce((a, time, i, arr) => {
              const prevTime = i === 0 ? arr[arr.length - 1] : arr[i - 1]
              if (time.localeCompare(prevTime) < 0) {
                return a + 1
              } else {
                return a
              }
            }, 0) > 1
        ) {
          errorMsg = `班次時間不能重疊`
        }
        if (errorMsg) {
          $td.append(`<code style="color: red;">${errorMsg}</code>`)
          return false
        } else {
          return true
        }
        // const clockpickerEles = $td[0].querySelectorAll('.clockpicker')
        // const clockpickerVals = _.chain(clockpickerEles)
        //   .map(function (ele) {
        //     return ele.value
        //   })
        //   .filter(function (ele) {
        //     return ele !== ''
        //   })
        //   .value()
        // var lastPickerVal = clockpickerVals[clockpickerVals.length - 1]
        // var validateResult = _.reduce(
        //   clockpickerVals,
        //   function (memo, ele, i) {
        //     if (memo.valid) {
        //       if (
        //         ele.length < 6 &&
        //         /\d\d:\d\d/.test(ele) &&
        //         moment(ele, 'HH:mm').isValid()
        //       ) {
        //         if (ele.localeCompare(memo.pretime) < 0) {
        //           memo.crossdayCount++
        //           if (memo.crossdayCount > 1) {
        //             memo.valid = false
        //             memo.msg = `${i18n('Invalid_Time_Range')}`
        //           }
        //         }
        //         memo.pretime = ele
        //       } else {
        //         memo.valid = false
        //         memo.msg = `${i18n('Invalid_Time_Format')}`
        //       }
        //     }
        //     return memo
        //   },
        //   {
        //     pretime: lastPickerVal,
        //     crossdayCount: 0,
        //     valid: true,
        //     msg: '',
        //   }
        // )
        // let spanMilliseconds
        // let totalMilliseconds = 0

        // for (let i = 0, len = clockpickerVals.length; i < len; i = i + 2) {
        //   spanMilliseconds =
        //     moment(clockpickerVals[i + 1], 'HH:mm') -
        //     moment(clockpickerVals[i], 'HH:mm')
        //   if (spanMilliseconds < 0) {
        //     spanMilliseconds += MILLISECONDS_A_DAY
        //   }
        //   totalMilliseconds += spanMilliseconds
        // }

        // if (!validateResult.valid) {
        //   return validateResult.msg
        // }
        // if (totalMilliseconds !== MILLISECONDS_A_DAY) {
        //   return '請將班次設滿24小時，空白的時間設不啟用即可'
        // }
        // // 防止班別名稱重複
        // const classNames = []
        // const errorMsg = {
        //   chk: false,
        //   msg: i18n('Repeat_Name'),
        // }
        // _.each($('.inbox-badge'), function (span) {
        //   const name = $(span.parentNode).find('input').val()
        //   if (name != '') {
        //     if (_.contains(classNames, name)) errorMsg.chk = true
        //     classNames.push(name)
        //   }
        // })
        // if (errorMsg.chk) return errorMsg.msg
      }
      function validateStartTime(val, $td) {
        const formatedVal = val
          .split(':')
          .map((v) => v.padStart(2, '0'))
          .join('')
        const isValid = moment(formatedVal, 'HHmm').isValid()
        if (!isValid) {
          const errorMsg = '請輸入正確的時間格式 HH:mm'
          $td.append(`<code style="color: red;">${errorMsg}</code>`)
        }
        return isValid
      }
      function validateDuration(val, $td) {
        const regFloat = /^[0-9]+(.[0-9]{0,2})?$/
        let errorMsg
        if (val === '') {
          errorMsg = `${i18n('ServTrackManagement_000019')}`
        } else if (isNaN(val)) {
          errorMsg = `${i18n('ServTrackManagement_000006')}`
        } else if (Number(val) > 24) {
          errorMsg = `${i18n('ServTrackManagement_000126')}`
        } else if (Number(val) <= 0) {
          errorMsg = '請輸入大於零的數字'
        } else if (!regFloat.test(val)) {
          errorMsg = `${i18n('ServTrackManagement_000128')}`
        }
        if (errorMsg) {
          $td.append(`<code style="color: red;">${errorMsg}</code>`)
          return false
        } else {
          return true
        }
      }
      // 按鈕
      $('#shift_edit_table').on('click', '#success_btn', function (e) {
        e.preventDefault()
        $('#shift_edit_widget').find('code').remove()
        const $shiftTimeTd = $('.inline-group').closest('td')
        const $shiftGroup = $shiftTimeTd.find('.inline-group')
        let shift_time_shift_list = $shiftGroup.toArray().map((groupEl) => {
          const $groupEl = $(groupEl)
          const sequence = $(groupEl).find('.badge').text()
          const shift = $groupEl.find('[name=shift]').val()
          const start_time = $groupEl.find('[name=start_time]').val()
          const end_time = $groupEl.find('[name=end_time]').val()
          const is_open = $groupEl.find('[name=is_open]').prop('checked')
            ? 'Y'
            : 'N'

          return {
            shift,
            start_time,
            end_time,
            is_open,
            sequence,
          }
        })
        const shiftCount = shift_time_shift_list.length
        const lastGroupData = shift_time_shift_list[shiftCount - 1]
        const isLastGroupEmpty =
          !lastGroupData.start_time &&
          !lastGroupData.end_time &&
          !lastGroupData.shift
        // 如果最後一個班次都沒有填值，則不採計
        if (isLastGroupEmpty && shiftCount > 1) {
          shift_time_shift_list = shift_time_shift_list.slice(0, -1)
        }
        const duration_sp = Number($('#edit_duration_sp').val())
        const ori_start_time = ctx.edit_row_data[0] + ':00'
        const curr_start_time = $('#edit_shift_clock').val()
        // 補上秒數
        const new_start_time = curr_start_time + ':00'
        // curr_start_time === ori_start_time && curr_start_time.length === 8
        //   ? ori_start_time
        //   : curr_start_time + ':00'
        const isDurationValid = validateDuration(
          duration_sp,
          $('#edit_duration_sp').closest('td')
        )
        const isStartTimeValid = validateStartTime(
          new_start_time,
          $('#edit_shift_clock').closest('td')
        )
        const isShiftTimeValid = validateShiftTime(
          shift_time_shift_list,
          duration_sp,
          curr_start_time,
          $($shiftTimeTd)
        )
        if (!isDurationValid || !isStartTimeValid || !isShiftTimeValid) {
          return
        }
        ajax(
          {
            url: 'api/yihcheng/shift-time/update-and-insert-shift-time-shift',
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({
              duration_sp,
              ori_start_time,
              new_start_time,
              shift_time_shift_list,
            }),
          },
          {
            success() {
              drawShiftTable()
              $('#shift_time_widget').show()
              $('#shift_edit_widget').hide()
              $.smallBox({
                title: '編輯成功',
                color: '#2FA12F',
                iconSmall: 'fa fa-check',
                timeout: 4000,
              })
            },
          }
        )
      })
      $('#shift_edit_table').on('click', '#cancel_btn', function (e) {
        e.preventDefault()
        $('#shift_time_widget').show()
        $('#shift_edit_widget').hide()
      })
    },
    // gogo (ctx) {
    //   var createAndUpdateEnd = {
    //     2 (td) {
    //       return '<p align="right">' + 'hello' + '<p>'
    //     },
    //     3 (td) {
    //       var result = $(td).find('input').val()
    //       return '<p align="right">' + parseFloat(result).toFixed(2) + '<p>'
    //     },
    //   }
    // function bindWorkShiftTimesEvent(workShiftTimeTd) {
    //   $(workShiftTimeTd)
    //     .on('focus', '.inline-group', function (e) {
    //       if (!this.nextElementSibling) {
    //         var newInputGroup = this.cloneNode(true)
    //         this.parentNode.appendChild(newInputGroup)

    //         var $newInputGroup = $(newInputGroup)
    //         const $inputs = $newInputGroup.find('input')
    //         $inputs.toArray().forEach((el) => {
    //           if (el.name === 'is_open') {
    //             const id = el.id
    //             const no = +id.split('-')[2]
    //             const newId = id.replace(/(?<=-)\d+$/, no + 1)
    //             el.id = newId
    //             el.nextElementSibling.setAttribute('for', newId)
    //             el.checked = true
    //           } else {
    //             el.value = ''
    //           }
    //         })
    //         var $seqEle = $newInputGroup.find('.badge')
    //         $seqEle.text(parseInt($seqEle.text()) + 1)
    //         $newInputGroup.find('.clockpicker').each(function (i, e) {
    //           $(e).clockpicker({
    //             placement: 'right',
    //             dontext: 'Done',
    //           })
    //         })
    //       }
    //     })
    //     .on('mouseenter', '.inline-group', function (e) {
    //       $(this).find('.fa-times-circle-o').show()
    //     })
    //     .on('mouseleave', '.inline-group', function (e) {
    //       $(this).find('.fa-times-circle-o').hide()
    //     })
    //     .on('click', '.fa-times-circle-o', function (e) {
    //       if (this.parentNode.parentNode.children.length > 1) {
    //         var nextEleSib = this.parentNode.nextElementSibling
    //         this.parentNode.parentNode.removeChild(this.parentNode)
    //         while (nextEleSib) {
    //           nextEleSib.querySelector('.badge').textContent =
    //             parseInt(nextEleSib.querySelector('.badge').textContent) - 1
    //           nextEleSib = nextEleSib.nextElementSibling
    //         }
    //       }
    //     })
    // }
    //   servkit.crudtable({
    //     tableSelector: '#stk-work-shift-table',
    //     create: {
    //       unavailable: true,
    //       url: 'api/servtrack/shifttime/create',
    //       start: ctx.initDatepicker,
    //       end: createAndUpdateEnd,
    //     },
    //     read: {
    //       url: 'api/servtrack/shifttime/read',
    //       end: {
    //         2 (data) {
    //           const status = 'OFF'
    //           return `
    //           <table id="inbox-table" class="table table-striped table-hover">
    //           <tbody>
    //           <tr>
    //           <td class="inbox-table-icon" style="width: 15%;">
    //           <span class="label label-default">1</span>
    //           </td>
    //           <td class="inbox-data-form" style="width: 20%;">
    //           <div class="text-center">A</div>
    //           </td>
    //           <td class="inbox-data-form" style="width: 40%;">
    //           <div>00:00 ~ 12:00</div></td><td class="inbox-data-form" style="width: 20%;">
    //           <div>
    //           <span class="label ${
    //             status === 'ON' ? 'label-success' : 'label-default'
    //           } label-default">${status}</span>
    //           </div>
    //           </td>
    //           </tr>
    //           </tbody>
    //           </table>`
    //         },
    //         3 (data) {
    //           return '<p align="right">' + parseFloat(data).toFixed(2) + '<p>'
    //         },
    //       },
    //       finalDo: ctx.activeCheck,
    //     },
    //     update: {
    //       url: 'api/yihcheng/shift-time/update-and-insert-shift-time-shift',
    //       start: {
    //         1 (oldTd, newTd) {
    //           ctx.initDatepicker(newTd)
    //           $(newTd).find('[name=start_time]').val(oldTd.textContent)
    //         },
    //         2 (oldTd, newTd) {
    //           let value = $(oldTd)
    //             .find('div')
    //             .toArray()
    //             .map((i) => i.innerText)
    //           const splitTime = value[1].split(' ~ ')
    //           value = [value[0], splitTime[0], splitTime[1], value[2]]
    //           const newTdValue = $(newTd).find('input').toArray()
    //           value.map((i, key) => (newTdValue[key].value = i))
    //           value[3] === 'ON'
    //             ? $(newTdValue[3]).prop('checked', true)
    //             : $(newTdValue[3]).prop('checked', false)
    //           ctx.initDatepicker(newTd)
    //           // $(newTd).find('[name=start_time]').val(oldTd.textContent)
    //           bindWorkShiftTimesEvent(newTd)
    //         },
    //       },
    //       end: createAndUpdateEnd,
    //     },
    //     delete: {
    //       unavailable: true,
    //     },
    //     validate: {
    //       1 (td) {
    //         var input = td.querySelector('input')
    //         if (input.value === '') {
    //           return `${i18n('ServTrackManagement_000019')}`
    //         }
    //       },
    //       3 (td) {
    //         var input = td.querySelector('input')
    //         var regFloat = /^[0-9]+(.[0-9]{0,2})?$/
    //         if (input.value === '') {
    //           return `${i18n('ServTrackManagement_000090')}`
    //         } else if (isNaN(input.value)) {
    //           return `${i18n('ServTrackManagement_000006')}`
    //         } else if (Number(input.value) > 24) {
    //           return `${i18n('ServTrackManagement_000126')}`
    //         } else if (!regFloat.test(input.value)) {
    //           return `${i18n('ServTrackManagement_000128')}`
    //         }
    //       },
    //     },
    //   })

    //   $('.dt-toolbar').hide()
    //   $('#stk-work-shift-table')
    //     .closest('div')
    //     .find('div > .stk-delete-btn')
    //     .hide()
    //   $('#stk-work-shift-table')
    //     .closest('div')
    //     .find('div > .stk-insert-btn')
    //     .hide()
    //   $('#stk-work-shift-table')
    //     .closest('div')
    //     .find('div > .stk-refresh-btn')
    //     .hide()
    //   $('#stk-work-shift-table > thead')
    //     .find('tr')
    //     .eq(1)
    //     .find('tr')
    //     .eq(0)
    //     .html('')
    // },
    util: {
      shift_data: '',
      shift_reportTable: '',
      shift_edit_reportTable: '',
      edit_row_data: '',
      // initDatepicker (parent) {
      //   var $clockPicker = $('.clockpicker')
      //   if (parent) {
      //     $clockPicker = $(parent).find('.clockpicker')
      //   }

      //   $clockPicker.each(function (i, e) {
      //     $(e).clockpicker({
      //       placement: 'left',
      //       donetext: 'Done',
      //     })
      //   })
      // },
      // activeCheck () {
      //   _.each($('#stk-work-shift-table').find('tbody > tr'), function (trEle) {
      //     var tdCheckBoxEle = $(trEle).find('td:first-child input')
      //     tdCheckBoxEle.hide()
      //     _.each(
      //       document.querySelectorAll('.stk-delete-all-checkbox'),
      //       function (ele) {
      //         ele.style.display = 'none'
      //       }
      //     )
      //   })
      // },
    },
    preCondition: {
      // shift_time_data (done) {
      //   servkit.ajax(
      //     {
      //       url: 'api/getdata/db',
      //       type: 'POST',
      //       contentType: 'application/json',
      //       data: JSON.stringify({
      //         table: 'a_yihcheng_view_shift_time',
      //       }),
      //     },
      //     {
      //       success (data) {
      //         console.log(data)
      //         done(data)
      //       },
      //     }
      //   )
      // },
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
  })
}
