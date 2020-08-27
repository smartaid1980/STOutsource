import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      console.log('hi')
      var weekdays = [
        `${i18n('Sunday')}`,
        `${i18n('Monday')}`,
        `${i18n('Tuesday')}`,
        `${i18n('Wednesday')}`,
        `${i18n('Thursday')}`,
        `${i18n('Friday')}`,
        `${i18n('Saturday')}`,
      ]
      var type = {
        weekday: `${i18n('Week')}`,
        date: `${i18n('Date')}`,
      }
      var shiftTimesTableViewHead =
        '<table id="inbox-table" class="table table-striped table-hover"><tbody>'
      var shiftTimesTableViewTail = '</tbody></table>'
      const MILLISECONDS_A_DAY = 60 * 60 * 24 * 1000

      function createAndUpdateSend(tdEles) {
        var type = $(tdEles[2]).find('input[type=radio]:checked').val()
        return {
          id: JSON.parse(tdEles[0].parentNode.getAttribute('stk-db-id')),
          type: type,
          work_shift_childs: (function () {
            if (type === 'weekday') {
              return _.map(
                $(tdEles[3]).find('input[type=checkbox]:checked').toArray(),
                function (e) {
                  return e.value
                }
              )
            } else {
              return _.chain($('input.datepicker').toArray())
                .map(function (e) {
                  return e.value
                })
                .filter(function (e) {
                  return e !== ''
                })
                .value()
            }
          })(),
          work_shift_times: (function () {
            return _.chain($(tdEles[4]).find('.inline-group').toArray())
              .map(function (e) {
                var $e = $(e)
                var inputEles = $e.find('input').toArray()
                return {
                  sequence: $e.find('.badge').text(),
                  name: inputEles[0].value,
                  start: inputEles[1].value,
                  end: inputEles[2].value,
                  is_open: inputEles[3].checked ? '1' : '0',
                }
              })
              .filter(function (e) {
                return e.name !== '' && e.start !== '' && e.end !== ''
              })
              .value()
          })(),
        }
      }

      function initDatepicker(parent) {
        var $datePicker = $('.datepicker')
        if (parent) {
          $datePicker = $(parent).find('.datepicker')
        }
        $datePicker.each(function (i, e) {
          $(e).datepicker({
            dateFormat: 'yy/mm/dd',
            prevText: '<i class="fa fa-chevron-left"></i>',
            nextText: '<i class="fa fa-chevron-right"></i>',
          })
        })
      }

      function initClockpicker(parent) {
        var $clockPicker = $('.clockpicker')
        if (parent) {
          $clockPicker = $(parent).find('.clockpicker')
        }
        $clockPicker.each(function (i, e) {
          $(e).clockpicker({
            placement: 'left',
            donetext: 'Done',
          })
        })
      }

      function bindWorkShiftChildsEvent(workShiftChildTd) {
        $(workShiftChildTd)
          .on('focus', '.input-group', function (e) {
            if (!this.nextElementSibling) {
              var newInputGroup = this.cloneNode(true)
              $(newInputGroup).find('input').val('')
              this.parentNode.appendChild(newInputGroup)
              $('.datepicker:last')
                .removeClass('hasDatepicker')
                .removeAttr('id')
                .datepicker({
                  dateFormat: 'yy/mm/dd',
                  prevText: '<i class="fa fa-chevron-left"></i>',
                  nextText: '<i class="fa fa-chevron-right"></i>',
                })
            }
          })
          .on('mouseenter', '.input-group', function (e) {
            $(this).find('.fa-times-circle-o').show()
          })
          .on('mouseleave', '.input-group', function (e) {
            $(this).find('.fa-times-circle-o').hide()
          })
          .on('click', '.fa-times-circle-o', function (e) {
            if (this.parentNode.parentNode.children.length > 1) {
              this.parentNode.parentNode.removeChild(this.parentNode)
            }
          })
      }

      function bindWorkShiftTimesEvent(workShiftTimeTd) {
        $(workShiftTimeTd)
          .on('focus', '.inline-group', function (e) {
            if (!this.nextElementSibling) {
              var newInputGroup = this.cloneNode(true)
              this.parentNode.appendChild(newInputGroup)

              var $newInputGroup = $(newInputGroup)
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
              var $seqEle = $newInputGroup.find('.badge')
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
              var nextEleSib = this.parentNode.nextElementSibling
              this.parentNode.parentNode.removeChild(this.parentNode)
              while (nextEleSib) {
                nextEleSib.querySelector('.badge').textContent =
                  parseInt(nextEleSib.querySelector('.badge').textContent) - 1
                nextEleSib = nextEleSib.nextElementSibling
              }
            }
          })
      }

      var createAndUpdateEnd = {
        2: function (td) {
          return td.querySelector('textarea').value
        },
        3: function (td) {
          var val = td.querySelector('input:checked').value
          if (val === 'weekday') return type.weekday
          if (val === 'date') return type.date
          return ''
        },
        4: function (td) {
          var weekdayDiv = td.querySelector('.weekday-type')
          var dateDiv = td.querySelector('.date-type')
          if (!weekdayDiv.hasAttribute('hidden')) {
            return _.map(
              weekdayDiv.querySelectorAll('input:checked'),
              function (e) {
                return (
                  '<span class="label label-primary stk-weekday" data-value="' +
                  e.value +
                  '" style="cursor:pointer;float:left;margin:5px;">' +
                  weekdays[e.value] +
                  '</span>'
                )
              }
            ).join('')
          }
          if (!dateDiv.hasAttribute('hidden')) {
            return _.chain(dateDiv.querySelectorAll('input'))
              .map(function (e) {
                return e.value === ''
                  ? ''
                  : '<span class="label label-primary stk-date" data-value="' +
                      e.value +
                      '" style="cursor:pointer;display:inline-block;margin:5px;">' +
                      e.value +
                      '</span>'
              })
              .value()
              .join('')
          }
        },
        5: function (td) {
          var result = _.chain(td.querySelectorAll('.inline-group'))
            .map(function (e) {
              var $e = $(e)
              var inputArray = $e.find('input').toArray()
              if (
                inputArray[0].value === '' &&
                inputArray[1].value === '' &&
                inputArray[2].value === ''
              ) {
                return ''
              }
              return shiftTimesView(
                $e.find('.badge').text(),
                inputArray[0].value,
                inputArray[1].value,
                inputArray[2].value,
                $e.find('[name=is_open]').prop('checked')
              )
            })
            .value()
          result.unshift(shiftTimesTableViewHead)
          result.push(shiftTimesTableViewTail)
          return result.join('')
        },
      }

      function typeChangeEventBind(typeTd, workShiftChildTd) {
        $(typeTd)
          .find('input[name="type"]:radio')
          .on('change', function (e) {
            $(workShiftChildTd).find('[hidden]').removeAttr('hidden')
            if ($(this).val() === 'weekday') {
              $(workShiftChildTd).find('div.date-type').attr('hidden', 'hidden')
            } else {
              $(workShiftChildTd)
                .find('div.weekday-type')
                .attr('hidden', 'hidden')
            }
          })
      }

      function shiftTimesView(seq, name, start, end, is_open) {
        return (
          '<tr>' +
          '<td class="inbox-table-icon" style="width:15%;">' +
          '<span class="label label-default">' +
          seq +
          '</span>' +
          '</td>' +
          '<td class="inbox-data-form" style="width:20%;">' +
          '<div class="text-center">' +
          name +
          '</div>' +
          '</td>' +
          '<td class="inbox-data-form" style="width:40%;">' +
          '<div>' +
          start +
          ' ~ ' +
          end +
          '</div>' +
          '</td>' +
          '<td class="inbox-data-form" style="width:20%;">' +
          '<div>' +
          `<span class='label label-${is_open ? 'success' : 'default'}'>${
            is_open ? 'ON' : 'OFF'
          }</span>` +
          '</div>' +
          '</td>' +
          '</tr>'
        )
      }

      function disableWeekdayIfExists() {
        var existWeekdays = _.uniq(
          $('.stk-weekday').map(function (i, e) {
            return e.dataset.value
          })
        )

        // 先全開
        $('input[name="work_shift_childs"]').each(function (i, e) {
          $(e).attr('disabled', false)
        })

        // 再把已存在關閉
        _.each(existWeekdays, function (e) {
          $('input[name="work_shift_childs"][value="' + e + '"]').attr(
            'disabled',
            true
          )
        })
      }

      servkit.crudtable({
        tableModel: 'com.servtech.servcloud.module.model.WorkShiftGroup',
        tableSelector: '#stk-work-shift-table',
        create: {
          url: 'api/workshift/create',
          start: function (tdEles) {
            typeChangeEventBind(tdEles[2], tdEles[3])

            initDatepicker()
            initClockpicker()

            bindWorkShiftChildsEvent(tdEles[3])
            bindWorkShiftTimesEvent(tdEles[4])

            disableWeekdayIfExists()
          },
          send: createAndUpdateSend,
          end: createAndUpdateEnd,
        },
        read: {
          url: 'api/workshift/read',
          end: {
            3: function (data) {
              if (data === 'weekday') {
                return type.weekday
              }
              if (data === 'date') {
                return type.date
              }
              return ''
            },
            4: function (data) {
              if (data[0].weekday || data[0].weekday === 0) {
                data.sort(function (a, b) {
                  return a.weekday - b.weekday
                })
                return _.map(data, function (e) {
                  return (
                    '<span class="label label-primary stk-weekday" data-value="' +
                    e.weekday +
                    '" style="cursor:pointer;float:left;margin:5px;">' +
                    weekdays[e.weekday] +
                    '</span>'
                  )
                }).join('')
              } else {
                data.sort(function (a, b) {
                  return a.date.localeCompare(b.date)
                })
                return _.map(data, function (e) {
                  return (
                    '<span class="label label-primary stk-date" data-value="' +
                    e.date +
                    '" style="cursor:pointer;display:inline-block;margin:5px;">' +
                    e.date +
                    '</span>'
                  )
                }).join('')
              }
            },
            5: function (data) {
              var result = _.map(
                data.sort(function (a, b) {
                  return a.sequence - b.sequence
                }),
                function (e) {
                  return shiftTimesView(
                    e.sequence,
                    e.name,
                    e.start,
                    e.end,
                    e.is_open === '1'
                  )
                }
              )
              result.unshift(shiftTimesTableViewHead)
              result.push(shiftTimesTableViewTail)
              return result.join('')
            },
          },
        },
        update: {
          url: 'api/workshift/update',
          start: {
            2: function (oldTd, newTd) {
              newTd.querySelector('textarea').value = oldTd.textContent
            },
            3: function (oldTd, newTd, oldTr, newTr) {
              var val = oldTd.textContent
              if (val === type.weekday) {
                newTd.querySelector('input[value=weekday]').checked = true
              }
              if (val === type.date) {
                newTd.querySelector('input[value=date]').checked = true
              }
              typeChangeEventBind(newTd, newTr.querySelector('td:nth-child(5)'))
              $(newTd)
                .find(':radio')
                .on('change', () => {
                  disableWeekdayIfExists()
                })
            },
            4: function (oldTd, newTd) {
              var values = _.map(oldTd.querySelectorAll('span'), function (e) {
                return e.textContent
              })
              var inputGroupCloneTemp = newTd.querySelector('.input-group')
              var checkboxs
              var dateTypeDiv = newTd.querySelector('.date-type')
              if (values[0].indexOf('/') !== -1) {
                if (values.length > 2) {
                  _.each(_.range(values.length - 2), function () {
                    dateTypeDiv.appendChild(inputGroupCloneTemp.cloneNode(true))
                  })
                }
                _.each(dateTypeDiv.querySelectorAll('input'), function (e, i) {
                  e.value = values[i] || ''
                })
                $(newTd).find('.weekday-type').attr('hidden', 'hidden')
                $(dateTypeDiv).removeAttr('hidden')
              } else {
                checkboxs = newTd.querySelectorAll('input[type=checkbox]')
                _.each(values, function (e) {
                  switch (e) {
                    case weekdays[0]:
                      checkboxs[0].checked = true
                      break
                    case weekdays[1]:
                      checkboxs[1].checked = true
                      break
                    case weekdays[2]:
                      checkboxs[2].checked = true
                      break
                    case weekdays[3]:
                      checkboxs[3].checked = true
                      break
                    case weekdays[4]:
                      checkboxs[4].checked = true
                      break
                    case weekdays[5]:
                      checkboxs[5].checked = true
                      break
                    case weekdays[6]:
                      checkboxs[6].checked = true
                      break
                  }
                })
              }

              initDatepicker(newTd)
              bindWorkShiftChildsEvent(newTd)

              disableWeekdayIfExists()
            },
            5: function (oldTd, newTd) {
              var values = _.map(oldTd.querySelectorAll('tr'), function (tr) {
                var $tdEles = $(tr).find('td')
                var startEnd = $tdEles[2]
                  .querySelector('div')
                  .textContent.split(' ~ ')
                return [
                  $tdEles[0].querySelector('span').textContent,
                  $tdEles[1].querySelector('div').textContent,
                  startEnd[0],
                  startEnd[1],
                  $tdEles[3].querySelector('div').textContent,
                ]
              })
              if (values.length > 2) {
                var inputGroupCloneTemp = newTd.querySelector('.inline-group')
                let cloneNode
                var workShifTimesDiv = newTd.querySelector(
                  'div[name=work_shift_times]'
                )
                _.each(_.range(values.length - 2), function (i) {
                  cloneNode = inputGroupCloneTemp.cloneNode(true)
                  workShifTimesDiv.appendChild(cloneNode)
                  const el = cloneNode.querySelector('[name=is_open]')
                  const id = el.id
                  const no = +id.split('-')[2]
                  const newId = id.replace(/(?<=-)\d+$/, no + 2 + i)
                  el.id = newId
                  el.nextElementSibling.setAttribute('for', newId)
                })
              }
              _.each(newTd.querySelectorAll('.inline-group'), function (e, i) {
                if (values[i]) {
                  e.querySelector('.badge').textContent = values[i][0]
                  var inputEles = e.querySelectorAll('input')
                  inputEles[0].value = values[i][1]
                  inputEles[1].value = values[i][2]
                  inputEles[2].value = values[i][3]
                  inputEles[3].checked = values[i][4] === 'ON'
                }
              })

              initClockpicker(newTd)
              bindWorkShiftTimesEvent(newTd)
            },
          },
          send: createAndUpdateSend,
          end: createAndUpdateEnd,
        },
        delete: {
          url: 'api/workshift/delete',
          contentFunc: function (deleteIds) {
            // deletNames = []
            // _.each($('tr'), function (tr) {
            //   _.each(deleteIds, function (deleteId) {
            //     if ($(tr).attr('stk-db-id') === JSON.stringify(deleteId)) {
            //       console.log($(tr).find('td'))
            //       deletNames.push($($(tr).find('td')[1]).text())
            //     }
            //   })
            // })
            return i18n('Sure_Delete_Data')
          },
        },
        validate: {
          1: function (td) {
            if (td.querySelector('input').value === '') {
              return `${i18n('Stk_Required')}`
            }
          },
          4: function (td) {
            var $dateType = $('.date-type')
            if (!$dateType.attr('hidden')) {
              var existDates = _.uniq(
                $('.stk-date').map(function (i, e) {
                  return e.dataset.value
                })
              )
              var inputDates = $dateType
                .find('.datepicker')
                .map(function (i, e) {
                  return e.value
                })

              var duplicateDates = _.intersection(existDates, inputDates)

              if (
                _.every(inputDates, function (e) {
                  return e === ''
                })
              ) {
                return `${i18n('Stk_Required')}`
              }

              if (duplicateDates.length) {
                return (
                  duplicateDates.join(', ') + ` ${i18n('Stk_Date_Duplicate')}`
                )
              }
            } else {
              var checked = $('input[name="work_shift_childs"]').map(function (
                i,
                e
              ) {
                return $(e).prop('checked')
              })

              if (
                _.every(checked, function (e) {
                  return !e
                })
              ) {
                return `${i18n('Stk_Required')}`
              }
            }
          },
          5: function (td) {
            var emptyInputEle = _.chain(td.querySelectorAll('input[type=text]'))
              .initial(3) // 最後三個空欄也沒差
              .find(function (inputEle) {
                return inputEle.value === ''
              })
              .value()
            if (emptyInputEle) {
              return `${i18n('Stk_Required')}`
            }

            var clockpickerEles = td.querySelectorAll('.clockpicker')
            var clockpickerVals = _.chain(clockpickerEles)
              .map(function (ele) {
                return ele.value
              })
              .filter(function (ele) {
                return ele !== ''
              })
              .value()
            var lastPickerVal = clockpickerVals[clockpickerVals.length - 1]
            var validateResult = _.reduce(
              clockpickerVals,
              function (memo, ele, i) {
                if (memo.valid) {
                  if (
                    ele.length < 6 &&
                    /\d\d:\d\d/.test(ele) &&
                    moment(ele, 'HH:mm').isValid()
                  ) {
                    if (ele.localeCompare(memo.pretime) < 0) {
                      memo.crossdayCount++
                      if (memo.crossdayCount > 1) {
                        memo.valid = false
                        memo.msg = `${i18n('Invalid_Time_Range')}`
                      }
                    }
                    memo.pretime = ele
                  } else {
                    memo.valid = false
                    memo.msg = `${i18n('Invalid_Time_Format')}`
                  }
                }
                return memo
              },
              {
                pretime: lastPickerVal,
                crossdayCount: 0,
                valid: true,
                msg: '',
              }
            )
            let spanMilliseconds
            let totalMilliseconds = 0

            for (let i = 0, len = clockpickerVals.length; i < len; i = i + 2) {
              spanMilliseconds =
                moment(clockpickerVals[i + 1], 'HH:mm') -
                moment(clockpickerVals[i], 'HH:mm')
              if (spanMilliseconds < 0) {
                spanMilliseconds += MILLISECONDS_A_DAY
              }
              totalMilliseconds += spanMilliseconds
            }

            if (!validateResult.valid) {
              return validateResult.msg
            }
            if (totalMilliseconds !== MILLISECONDS_A_DAY) {
              return '請將班次設滿24小時，空白的時間設不啟用即可'
            }
            // 防止班別名稱重複
            let classNames = []
            let errorMsg = {
              chk: false,
              msg: i18n('Repeat_Name'),
            }
            _.each($('.inbox-badge'), function (span) {
              let name = $(span.parentNode).find('input').val()
              if (name != '') {
                if (_.contains(classNames, name)) errorMsg.chk = true
                classNames.push(name)
              }
            })
            if (errorMsg.chk) return errorMsg.msg
          },
        },
      }) // end of crudtable
    },
    dependencies: [
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
      ['/js/plugin/clockpicker/clockpicker.min.js'],
    ],
  })
}
