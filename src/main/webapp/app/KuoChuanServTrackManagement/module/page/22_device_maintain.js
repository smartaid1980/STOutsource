export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      pageSetUp()

      ctx.$submitBtn
        .on('click', function (evt) {
          evt.preventDefault() // 防止氣泡事件
          var lineId = ctx.$lineId.val()

          ctx.read(lineId)
        })
        .trigger('click')

      ctx.$submitClean.on('click', function (evt) {
        evt.preventDefault()
        ctx.$lineId.val('')
      })

      ctx.$tableBody.on('click', '.stk-qrcode-btn', function (evt) {
        var lineIds = []
        $('#stk-line-table')
          .find('tbody')
          .find('tr')
          .each(function () {
            var tr = $(this)
            var checkbox = tr.find('td:first').find(':checkbox')
            if (checkbox.prop('checked') && !checkbox.prop('disabled')) {
              lineIds.push(JSON.parse(tr.attr('stk-db-id')))
            }
          })

        if (lineIds.length != 0) {
          ctx.getQRCodedocx(lineIds)
        }
      })
    },
    util: {
      $tableBody: $('#stk-line-table-body'),
      $table: $('#stk-line-table'),
      $submitBtn: $('#submit-btn'),
      $submitClean: $('#submit-clean'),
      $lineId: $('#line_id'),
      $Forms: $('#stk-file'),
      read: function (lineId) {
        var ctx = this

        lineId = lineId || ''

        if (!ctx['crudTable']) {
          ctx['crudTable'] = ctx.$table[0].cloneNode(true)
        } else {
          ctx.$tableBody.html(ctx.crudTable.cloneNode(true))
        }

        function createAndUpdateSend(tdEles) {
          return {
            is_open: (function () {
              if ($(tdEles[5]).find(':checkbox').prop('checked')) {
                return 'Y'
              } else {
                return 'N'
              }
            })(),
          }
        }

        var createAndUpdateEnd = {
          3: function (td) {
            return parseFloat($(td).find(':text').val()).toFixed(2)
          },
          4: function (td) {
            return parseFloat($(td).find(':text').val()).toFixed(2)
          },
          5: function (td) {
            return parseFloat($(td).find(':text').val()).toFixed(2)
          },
          6: function (td) {
            if ($(td).find(':checkbox').prop('checked')) {
              return '<span class="label label-success">ON</span>'
            } else {
              return '<span class="label label-default">OFF</span>'
            }
          },
        }

        servkit.crudtable({
          tableSelector: '#stk-line-table',
          create: {
            url: 'api/kuochuan/servtrack/line/create',
            send: createAndUpdateSend,
            end: createAndUpdateEnd,
            finalDo: function () {
              ctx.$table
                .find('tbody')
                .find('tr')
                .each(function () {
                  var tr = $(this)
                  if (tr.find('td').eq(6).html().indexOf('OFF') != -1) {
                    tr.find('td:first')
                      .find(':checkbox')
                      .prop('disabled', true)
                      .hide()
                  } else {
                    tr.find('td:first')
                      .find(':checkbox')
                      .prop('disabled', false)
                      .show()
                  }
                })
            },
          },
          read: {
            url:
              'api/kuochuan/servtrack/line/read?line_id=' +
              encodeURIComponent(lineId),
            end: {
              3: function (data) {
                return parseFloat(data).toFixed(2)
              },
              4: function (data) {
                return parseFloat(data).toFixed(2)
              },
              5: function (data) {
                return parseFloat(data).toFixed(2)
              },
              6: function (data) {
                if (data === 'Y') {
                  return '<span class="label label-success">ON</span>'
                } else {
                  return '<span class="label label-default">OFF</span>'
                }
              },
            },
            finalDo: function () {
              $('button.stk-delete-btn').remove()
              ctx.$table
                .find('tbody')
                .find('tr')
                .each(function () {
                  var tr = $(this)
                  if (tr.find('td').eq(6).html().indexOf('OFF') != -1) {
                    tr.find('td:first')
                      .find(':checkbox')
                      .prop('disabled', true)
                      .hide()
                  } else {
                    tr.find('td:first')
                      .find(':checkbox')
                      .prop('disabled', false)
                      .show()
                  }
                })
            },
          },
          update: {
            url: 'api/servtrack/managementline/update',
            start: {
              6: function (oldTd, newTd, oldTr, newTr) {
                if ($(oldTd).text().indexOf('OFF') !== -1) {
                  $(newTd).find(':checkbox').prop('checked', false)
                } else {
                  $(newTd).find(':checkbox').prop('checked', true)
                }
              },
            },
            send: createAndUpdateSend,
            end: createAndUpdateEnd,
            finalDo: function () {
              ctx.$table
                .find('tbody')
                .find('tr')
                .each(function () {
                  var tr = $(this)
                  if (tr.find('td').eq(6).html().indexOf('OFF') !== -1) {
                    tr.find('td:first')
                      .find(':checkbox')
                      .prop('disabled', true)
                      .hide()
                  } else {
                    tr.find('td:first')
                      .find(':checkbox')
                      .prop('disabled', false)
                      .show()
                  }
                })
            },
          },
          delete: {
            // unavailable: true
          },
          validate: {
            1: function (td, table) {
              var input = $(td).find(':input')
              if (input.val() === '') {
                return '<br />請填寫設備編號'
              }

              if (!input.prop('disabled')) {
                if (
                  _.find(table.columns(0).data().eq(0), function (existId) {
                    return existId === input.val()
                  })
                ) {
                  return '<br />設備編號重複'
                }
              }

              var regChinese = /^[\u4E00-\u9FA5]+$/
              if (regChinese.test(input.val())) {
                return '<br />不能有中文字'
              }
              // var regHalfwidth = /[^\x00-\xff]/g
              // if (regHalfwidth.test(input.val())) {
              //   return '<br />不可輸入全形字元'
              // }
              var regQuestion = /[?]+/
              if (regQuestion.test(input.val())) {
                return '<br />特殊符號僅包含~!@#$%^&*()_+=-`/\\.[]{}'
              }
              var regSymbol = /[^a-zA-Z0-9~@#%&_=\-`()+!$*^/.[]{}]+/
              if (regSymbol.test(input.val())) {
                return '<br />特殊符號僅包含~!@#$%^&*()_+=-`/\\.[]{}'
              }
            },
            2: function (td) {
              if ($(td).find(':input').val() === '') {
                return '<br />請填寫設備名稱'
              }
            },
            3: function (td) {
              if ($(td).find(':input').val() === '') {
                return '<br />請填目標值'
              } else if (isNaN($(td).find(':input').val())) {
                return '<br />請填數字'
              } else {
                var val = parseFloat($(td).find(':input').val())
                if (val < 0 || val > 100) {
                  return '<br />請輸入0 ~ 100範圍的值'
                }
              }
            },
            4: function (td) {
              if ($(td).find(':input').val() === '') {
                return '<br />請填目標值'
              } else if (isNaN($(td).find(':input').val())) {
                return '<br />請填數字'
              } else {
                var val = parseFloat($(td).find(':input').val())
                if (val < 0 || val > 100) {
                  return '<br />請輸入0 ~ 100範圍的值'
                }
              }
            },
            5: function (td) {
              if ($(td).find(':input').val() === '') {
                return '<br />請填目標值'
              } else if (isNaN($(td).find(':input').val())) {
                return '<br />請填數字'
              } else {
                var val = parseFloat($(td).find(':input').val())
                if (val < 0 || val > 100) {
                  return '<br />請輸入0 ~ 100範圍的值'
                }
              }
            },
          },
          customBtns: [
            '<button class="btn bg-color-blueDark txt-color-white stk-qrcode-btn" title="print QRCode" style="margin-right: 10px;"><span class="fa fa-qrcode fa-lg"></span></button>',
          ],
        })
      },
      getQRCodedocx: function (lineIds) {
        var ctx = this
        var uuid = ((Math.random() * 10000) % 10000).toFixed(0)
        if (lineIds.lenth == 0) {
          $.smallBox({
            title: '請選取需列印的QRCode...',
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
              '<iframe name="download_target" style="width:0;height:0;border:0 solid #fff;""></iframe>'
          $submitForm.append($('<input>').attr('name', 'lineIds').val(lineIds))
          $submitForm.append($('<input>').attr('name', 'uuid').val(uuid))
          $submitForm.attr({
            action: 'api/servtrack/managementline/printQRCode',
            method: 'post',
            target: 'download_target',
          })

          ctx.$Forms.append($submitForm.hide())
          $submitForm.append(iframeHtml)

          document.querySelector('[name="' + uuid + '"]').submit()
        }
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
  })
}
