import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      pageSetUp()

      // if (ctx.preCon.lines) {
      //   ctx.$queryLineId.html(ctx.preCon.lines.getSelect());
      //   ctx.$queryLineId.prop('selectedIndex', -1);
      // }

      ctx.$submitBtn
        .on('click', function (evt) {
          evt.preventDefault()
          if (!ctx['crudTable']) {
            ctx['crudTable'] = ctx.$table[0].cloneNode(true)
          } else {
            ctx.$tableBody.html(ctx.crudTable.cloneNode(true))
          }
          ctx.drawTable()
        })
        .trigger('click')

      ctx.$clearBtn.on('click', function (evt) {
        evt.preventDefault()
        ctx.$form[0].reset()
      })

      //* ************** Custom *****************
      // crudtable.js 額外 客製 按鈕們  的事件處理
      // 把 QRCode btn 綁 事件
      ctx.$tableBody.on('click', '.stk-qrcode-btn', function () {
        var qrCodeArr = []

        var table = $('#stk-line-table').data('crudTable')
        for (let row = 0; row < table.data().length; row++) {
          var trEle = table.rows(row).nodes().to$()
          if (
            trEle.find(':checkbox').prop('checked') &&
            trEle.find(':checkbox').css('display') !== 'none'
          ) {
            qrCodeArr.push(trEle.find('td:nth-child(2)').text())
          }
        }
        ctx.getQRCodedocx(qrCodeArr)
      })

      ctx.$tableBody.on('draw.dt', '#stk-line-table', function (evt) {
        evt.preventDefault()
        ctx.activeCheck()
      })
    },
    util: {
      $tableBody: $('#line-table-body'),
      $table: $('#stk-line-table'),
      $Forms: $('#stk-file'),
      $queryLineId: $('#query-line-id'),
      $submitBtn: $('#submit-btn'),
      $clearBtn: $('#clear-btn'),
      $form: $('#query-form'),
      drawTable: function () {
        var that = this
        var lineId = that.commons.checkEscapeSymbol(that.$queryLineId.val())

        function createAndUpdateSend(tdEles) {
          return {
            is_open: (function () {
              if ($(tdEles[5]).find('input:checked').length) {
                return 'Y'
              } else {
                return 'N'
              }
            })(),
          }
        }
        var createAndUpdateEnd = {
          3: function (td) {
            var result = $(td).find('input').val()
            return '<p align="right">' + parseFloat(result).toFixed(2) + '<p>'
          },
          4: function (td) {
            var result = $(td).find('input').val()
            return '<p align="right">' + parseFloat(result).toFixed(2) + '<p>'
          },
          5: function (td) {
            var result = $(td).find('input').val()
            return '<p align="right">' + parseFloat(result).toFixed(2) + '<p>'
          },
          6: function (td) {
            if ($(td).find('input:checked').length) {
              return '<span class="label label-success" style="cursor:pointer">ON</span>'
            } else {
              return '<span class="label label-default" style="cursor:pointer">OFF</span>'
            }
          },
        }

        servkit.crudtable({
          tableSelector: '#stk-line-table',
          create: {
            url: 'api/servtrack/managementline/create',
            send: createAndUpdateSend,
            end: createAndUpdateEnd,
          },
          read: {
            url:
              'api/servtrack/managementline/read?line_id=' +
              encodeURIComponent(lineId),
            end: {
              3: function (data) {
                return '<p align="right">' + parseFloat(data).toFixed(2) + '<p>'
              },
              4: function (data) {
                return '<p align="right">' + parseFloat(data).toFixed(2) + '<p>'
              },
              5: function (data) {
                return '<p align="right">' + parseFloat(data).toFixed(2) + '<p>'
              },
              6: function (data) {
                if (data === 'Y') {
                  return '<span class="label label-success" style="cursor:pointer">ON</span>'
                } else {
                  return '<span class="label label-default" style="cursor:pointer">OFF</span>'
                }
              },
            },
            finalDo: that.activeCheck,
          },
          update: {
            url: 'api/servtrack/managementline/update',
            start: {
              6: function (oldTd, newTd) {
                if (oldTd.textContent.indexOf('ON') != 0) {
                  newTd.querySelector('input').checked = false
                } else {
                  newTd.querySelector('input').checked = true
                }
              },
            },
            send: createAndUpdateSend,
            end: createAndUpdateEnd,
          },
          delete: {
            // unavailable : true
            // url: 'api/managementline/delete'
          },
          validate: {
            1: function (td, table) {
              var input = td.querySelector('input')
              if (input.value === '') {
                return `${i18n('ServTrackManagement_000019')}`
              }

              if (!input.disabled) {
                if (
                  _.find(table.columns(0).data().eq(0), function (existId) {
                    return existId.toLowerCase() === input.value.toLowerCase()
                  })
                ) {
                  return `${i18n('ServTrackManagement_000014')}`
                }
              }
              if (input.value.length > 50) {
                return `<br>${i18n('ServTrackManagement_000001')}`
              }
              var regChinese = /^[\u4E00-\u9FA5]+$/
              if (regChinese.test(input.value)) {
                return `<br>${i18n('ServTrackManagement_000022')}`
              }
              var regHalfwidth = /[^\x20-\xff]/g
              if (regHalfwidth.test(input.value)) {
                return `${i18n('ServTrackManagement_000024')}`
              }
              if (that.commons.symbolValidation(input.value)) {
                return `${i18n('ServTrackManagement_000197')}`
              }
            },
            2: function (td) {
              var input = td.querySelector('input')
              if (input.value === '') {
                return `${i18n('ServTrackManagement_000019')}`
              }
              if (input.value.length > 50) {
                return `${i18n('ServTrackManagement_000001')}`
              }
              var regHalfwidth = /[\uFE30-\uFFA0]/g
              if (regHalfwidth.test(input.value)) {
                return `${i18n('ServTrackManagement_000023')}`
              }
              if (that.commons.symbolValidation(input.value)) {
                return `${i18n('ServTrackManagement_000197')}`
              }
            },
            3: function (td) {
              var input = td.querySelector('input')
              if (input.value === '') {
                return `${i18n('ServTrackManagement_000005')}`
              } else if (isNaN(input.value)) {
                return `${i18n('ServTrackManagement_000006')}`
              } else if (input.value < 0 || input.value > 100) {
                return `${i18n('ServTrackManagement_000004')}`
              }
            },
            4: function (td) {
              var input = td.querySelector('input')
              if (input.value === '') {
                return `${i18n('ServTrackManagement_000005')}`
              } else if (isNaN(input.value)) {
                return `${i18n('ServTrackManagement_000006')}`
              } else if (input.value < 0 || input.value > 100) {
                return `${i18n('ServTrackManagement_000004')}`
              }
            },
            5: function (td) {
              var input = td.querySelector('input')
              if (input.value === '') {
                return `${i18n('ServTrackManagement_000005')}`
              } else if (isNaN(input.value)) {
                return `${i18n('ServTrackManagement_000006')}`
              } else if (input.value < 0 || input.value > 100) {
                return `${i18n('ServTrackManagement_000004')}`
              }
            },
          },
          customBtns: [
            "<button class='btn bg-color-blueDark txt-color-white stk-qrcode-btn' title='print QRCode' style='margin-right:10px'><span class='fa fa-qrcode fa-lg'></span></button>",
          ],
        })

        // QRCODE Btn 如果點選 編輯的話 要 disabled , 然後如果是點其它的要把他還原成可以點
        $('#stk-line-table > tbody').on(
          'click',
          '.stk-edit-btn,.stk-cancel-btn,.stk-save-btn',
          function (evt) {
            var name = evt.target.className
            if (
              name.indexOf('stk-edit-btn') > 1 ||
              name.indexOf('fa-pencil') > 1
            ) {
              $('#stk-line-table')
                .closest('div')
                .find('div > .stk-qrcode-btn')
                .prop('disabled', true)
            } else {
              $('#stk-line-table')
                .closest('div')
                .find('div > .stk-qrcode-btn')
                .prop('disabled', false)
            }
          }
        )
      },
      activeCheck: function () {
        $('#stk-line-table').closest('div').find('div > .stk-delete-btn').hide()
        _.each($('#stk-line-table').find('tbody > tr'), function (trEle) {
          var tdCheckBoxEle = $(trEle).find('td:first-child input')
          var type = $(trEle).find('td:nth-child(7)').text()
          if (type !== 'ON') {
            tdCheckBoxEle.hide()
          } else {
            tdCheckBoxEle.show()
          }
        })
      },
      getQRCodedocx: function (lineIds) {
        var that = this
        var uuid = that.commons.uuidGenerator(32)
        if (!lineIds.length) {
          that.commons.bling(
            5,
            100,
            $('#stk-line-table').find(
              'thead tr:nth-child(2) td:first-child,tbody tr td:first-child'
            ),
            'rgba(255, 0, 0, 0.2)'
          )
          $.smallBox({
            title: `${i18n('ServTrackManagement_000003')}`,
            content: '<i class="fa fa-clock-o"></i> <i>2 seconds ago...</i>',
            color: '#C79121',
            iconSmall: 'fa fa-warning shake animated',
            timeout: 2000,
          })
        } else {
          $.smallBox({
            title: 'Please Wait...',
            content: '<i class="fa fa-clock-o"></i> <i>2 seconds ago...</i>',
            color: '#739E73',
            iconSmall: 'fa fa-warning shake animated',
            timeout: 2000,
          })
          var $submitForm = $('<form name="' + uuid + '""></form>'),
            iframeHtml =
              '<iframe name="download_target" style="width:0;height:0;border:0px solid #fff;""></iframe>'
          $submitForm.append($('<input>').attr('name', 'lineIds').val(lineIds))
          $submitForm.append($('<input>').attr('name', 'uuid').val(uuid))
          $submitForm.attr({
            action: 'api/servtrack/managementline/printQRCode',
            method: 'post',
            target: 'download_target',
          })
          that.$Forms.append($submitForm.hide())
          $submitForm.append(iframeHtml)
          document.querySelector('[name="' + uuid + '"]').submit()
        }
      },
    },
    dependencies: [
      ['/js/plugin/select2/select2.min.js'],
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
    ],
    preCondition: {
      lines: function (done) {
        var that = this
        servkit.ajax(
          {
            url: servkit.rootPath + '/api/getdata/db',
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
              func.init('line_id', 'line_id')
              done(func)
            },
            fail: function (data) {
              console.warn(data)
            },
          }
        )
      },
    },
  })
}
