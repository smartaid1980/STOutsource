import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      ctx.initialize(ctx)
      ctx.initEvents(ctx)
      if (ctx.preCon.lineFunc) {
        ctx.lineFunc = ctx.preCon.lineFunc
      }
      ctx.$modalEndDate.on('change', function () {
        var modalStartDate = ctx.$modalStartDate.val()
        var modalEndDate = ctx.$modalEndDate.val()
        var start = new Date(modalStartDate)
        var end = new Date(modalEndDate)
        if (start.getTime() > end.getTime()) {
          ctx.$modalStartDate.val(modalEndDate)
        }
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
      datepickerConfig: {
        dateFormat: 'yy/mm/dd',
        prevText: '<i class="fa fa-chevron-left"></i>',
        nextText: '<i class="fa fa-chevron-right"></i>',
      },
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      drawShiftTable: function () {
        var that = this
        that.loadingBtn.doing()
        var startDate = that.$startDate.val()
        var endDate = that.$endDate.val()
        var table = createReportTable({
          $tableElement: $('#stk-line-shift-table'),
          $tableWidget: $('#stk-line-shift-widget'),
          centerColumn: [1, 2],
          showNoData: false,
        })
        try {
          servkit.ajax(
            {
              url: 'api/servtrack/lineworkinghour/read',
              type: 'GET',
              data: {
                startDate: startDate,
                endDate: endDate,
              },
            },
            {
              success: function (data) {
                if (data.length) {
                  var result = _.map(data, function (dateStr) {
                    return [
                      that.dateTrans(dateStr),
                      "<button class='btn btn-xs btn-primary stk-edit-btn' title='Edit'><i class='fa fa-pencil'></i></button>",
                      "<button class='btn btn-xs btn-danger  stk-delete-btn' title='Delete selected rows'><span class='fa fa-trash-o'></span></button>",
                    ]
                  })
                  table.drawTable(result)
                  that.drawInsertBtn()
                  table.showWidget()
                } else {
                  table.clearTable()
                  table.drawTable(data)
                  that.drawInsertBtn()
                  table.showWidget()
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
      insertLineWorkHour: function () {
        var that = this
        var loadingBtn = servkit.loadingButton(
          document.querySelector('#modal-submit-btn')
        )
        loadingBtn.doing()
        var startDate = this.$modalStartDate.val()
        var endDate = this.$modalEndDate.val()
        var hour = this.$modalHour.val()
        var day = []
        _.each(this.$modalWeekDay, function (ele) {
          if ($(ele).prop('checked')) {
            day.push(ele.value)
          }
        })
        var params = {
          startDate: startDate,
          endDate: endDate,
          hour: hour,
          workDay: day,
        }
        try {
          servkit.ajax(
            {
              url: 'api/servtrack/lineworkinghour/create',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify(params),
            },
            {
              success: function () {
                var smallParams = {
                  color: 'green',
                  title: `${i18n('ServTrackManagement_000145')}`,
                  icon: 'fa fa-check',
                  timeout: 2000,
                }
                that.commons.smallBox(smallParams)
                that.$startDate.val(startDate)
                that.$endDate.val(endDate)
                that.drawShiftTable()
                that.preCon.lastRecordDate = endDate
                that.$insertModal.modal('toggle')
              },
              fail: function (data) {
                var smallParams = {
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
        } catch (e) {
          console.warn(e)
        } finally {
          loadingBtn.done()
        }
      },
      checkDataIsExist: function () {
        var that = this
        var startDate = this.$modalStartDate.val()
        var endDate = this.$modalEndDate.val()
        var queryStartDate
        var queryEndDate
        var dataIsExist = false
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
        var that = this
        _.each(that.$shiftDayTable.prev().find('.hidden-xs'), function (ele) {
          $(ele).css('display', 'none')
        })
        that.$shiftDayTable
          .prev()
          .prepend(
            `<div class='col-xs-12 col-sm-6'><button class='btn btn-primary stk-insert-btn' title='Add new data' style='margin-right:5px'><span class='fa fa-plus fa-lg'></span></button><nobr>${i18n(
              'ServTrackManagement_000206'
            )}</nobr></div>`
          )
      },
      dateTrans: function (str) {
        var dateStr = str.replace(/-/g, '/')
        var date = new Date(dateStr)
        var day
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
      createCrudTable: function (dateStr) {
        var that = this

        function createAndUpdateSend(tdEles) {
          return {
            shift_day: (function () {
              return that.filterBracket(tdEles[0].querySelector('input').value)
            })(),
            line_id: (function () {
              return that.filterBracket(tdEles[1].querySelector('input').value)
            })(),
          }
        }

        servkit.crudtable({
          tableSelector: '#modal-edit-table',
          create: {},
          read: {
            url: 'api/servtrack/lineworkinghour/get?shiftDay=' + dateStr,
            end: {
              1: function (data) {
                return that.dateTrans(data)
              },
              2: function (data) {
                return data + '(' + that.lineFunc.getName(data) + ')'
              },
              3: function (data) {
                return '<p align="right">' + parseFloat(data).toFixed(2) + '<p>'
              },
            },
            finalDo: that.activeCheck,
          },
          update: {
            url: 'api/servtrack/lineworkinghour/update',
            finalDo: that.activeCheck,
            send: createAndUpdateSend,
            end: {
              3: function (td) {
                var result = $(td).find('input').val()
                return (
                  '<p align="right">' + parseFloat(result).toFixed(2) + '<p>'
                )
              },
            },
          },
          delete: {},
          validate: {
            3: function (td) {
              var input = td.querySelector('input')
              var regFloat = /^[0-9]+(.[0-9]{0,2})?$/
              if (input.value === '') {
                return `${i18n('ServTrackManagement_000090')}`
              } else if (isNaN(input.value)) {
                return `${i18n('ServTrackManagement_000006')}`
              } else if (Number(input.value) > 24) {
                return `${i18n('ServTrackManagement_000126')}`
              } else if (input.value.indexOf('.') > 2) {
                return `${i18n('ServTrackManagement_000139')}`
              } else if (input.value > 24) {
                return `${i18n('ServTrackManagement_000139')}`
              } else if (input.value < 0) {
                return `${i18n('ServTrackManagement_000200')}`
              } else if (!regFloat.test(input.value)) {
                return `${i18n('ServTrackManagement_000128')}`
              }
            },
          },
        })
        that.$editModal.modal('toggle')
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
          var tdCheckBoxEle = $(trEle).find('td:first-child input')
          tdCheckBoxEle.hide()
        })
        _.each($('#modal-edit-table').find('tbody > tr'), function (trEle) {
          var tdCheckBoxEle = $(trEle).find('td:first-child input')
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
        ctx.$submitBtn
          .on('click', function (evt) {
            evt.preventDefault()
            ctx.drawShiftTable()
          })
          .trigger('click')

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
            var date = moment(new Date(ctx.preCon.lastRecordDate))
              .add(1, 'days')
              .format('YYYY/MM/DD')
            ctx.$modalStartDate.datepicker(ctx.datepickerConfig).val(date)
            ctx.$modalEndDate.datepicker(ctx.datepickerConfig).val(date)
          } else {
            ctx.$modalStartDate
              .datepicker(ctx.datepickerConfig)
              .val(moment(new Date()).format('YYYY/MM/DD'))
            ctx.$modalEndDate
              .datepicker(ctx.datepickerConfig)
              .val(moment(new Date()).format('YYYY/MM/DD'))
          }
          var db_duration_sp = ctx.preCon.lineWorkingHour[0].duration_sp
          ctx.$modalHour.val(parseFloat(db_duration_sp).toFixed(2))
          ctx.$insertModal.modal()
        })

        ctx.$modalSubmitBtn.on('click', function (evt) {
          evt.preventDefault()
          var hour = ctx.$modalHour.val()
          var section
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
              var code = section.querySelector('code')
              if (code) {
                section.removeChild(code)
              }
              ctx.checkDataIsExist()
            }
          }
        })
        ctx.$shiftDayTable.on('click', '.stk-edit-btn', function (evt) {
          evt.preventDefault()
          if (!ctx.crudModel) {
            var crudTable = ctx.$modalEditTable[0].cloneNode(true)
            ctx.crudModel = crudTable
          } else {
            ctx.$modalTableBody.html(ctx.crudModel.cloneNode(true))
          }
          var dateStr = $(this).parent().prev().text()
          var date = dateStr.substring(0, dateStr.indexOf('('))
          ctx.createCrudTable(date)
        })

        ctx.$shiftDayTable.on('click', '.stk-delete-btn', function (evt) {
          evt.preventDefault()
          var dateStr = $(this).parent().prev().prev().text()
          var date = dateStr.substring(0, dateStr.indexOf('('))
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
                  var closeDialog = $(this)
                  servkit.ajax(
                    {
                      url: 'api/servtrack/lineworkinghour/delete',
                      contentType: 'application/json',
                      type: 'DELETE',
                      data: JSON.stringify({
                        shift_day: date,
                      }),
                    },
                    {
                      success: function () {
                        var trEle = ctx.$shiftDayTable.find('tbody > tr')
                        _.each(trEle, function (tr) {
                          if (
                            $(tr).find('td').eq(0).text().indexOf(date) > -1
                          ) {
                            $(tr).remove()
                          }
                        })
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
            date + `, ${i18n('ServTrackManagement_000135')}?`
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
      },
    },
    dependencies: [
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
      lineFunc: function (done) {
        var that = this
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
              var func = that.commons.initializeDBData(data)
              func.init('line_id', 'line_name')
              done(func)
            },
          }
        )
      },
      lineWorkingHour: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_servtrack_shift_time',
              columns: ['duration_sp'],
            }),
          },
          {
            success: function (data) {
              done(data)
            },
          }
        )
      },
    },
  })
}
