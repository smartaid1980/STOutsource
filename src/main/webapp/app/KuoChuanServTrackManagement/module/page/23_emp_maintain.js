export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      pageSetUp()

      ctx.$submitBtn
        .on('click', function (evt) {
          evt.preventDefault() // 防止氣泡事件
          var staffId = ctx.$staffId.val()

          ctx.read(staffId)
        })
        .trigger('click')

      ctx.$submitClean.on('click', function (evt) {
        evt.preventDefault()
        ctx.$staffId.val('')
      })

      ctx.$tableBody.on('click', '.stk-qrcode-btn', function (evt) {
        var staffIds = []
        $('#stk-staff-table')
          .find('tbody')
          .find('tr')
          .each(function () {
            var tr = $(this)
            var checkbox = tr.find('td:first').find(':checkbox')
            if (checkbox.prop('checked') && !checkbox.prop('disabled')) {
              staffIds.push(JSON.parse(tr.attr('stk-db-id')))
            }
          })

        if (staffIds.length !== 0) {
          ctx.getQRCodedocx(staffIds)
        }
      })
    },
    util: {
      $tableBody: $('#stk-staff-table-body'),
      $table: $('#stk-staff-table'),
      $submitBtn: $('#submit-btn'),
      $submitClean: $('#submit-clean'),
      $staffId: $('#staff_id'),
      $Forms: $('#stk-file'),
      read: function (staffId) {
        var ctx = this
        var lastWage

        staffId = staffId || ''

        if (!ctx['crudTable']) {
          ctx['crudTable'] = ctx.$table[0].cloneNode(true)
        } else {
          ctx.$tableBody.html(ctx.crudTable.cloneNode(true))
        }

        function createSend(tdEles) {
          return {
            last_wage: (function () {
              return '-1'
            })(),
            is_open: (function () {
              if ($(tdEles[5]).find(':checkbox').prop('checked')) {
                return 'Y'
              } else {
                return 'N'
              }
            })(),
          }
        }

        function updateSend(tdEles) {
          return {
            last_wage: (function () {
              return lastWage
            })(),
            is_open: (function () {
              if ($(tdEles[5]).find(':checkbox').prop('checked')) {
                return 'Y'
              } else {
                return 'N'
              }
            })(),
          }
        }

        var createEnd = {
          4: function (td) {
            return '---'
          },
          5: function (td) {
            return '---'
          },
          6: function (td) {
            if ($(td).find(':checkbox').prop('checked')) {
              return '<span class="label label-success">ON</span>'
            } else {
              return '<span class="label label-default">OFF</span>'
            }
          },
        }

        //                    var updateEnd = {
        //                        4: function (td) {
        //                            return new Date().formatDate2String('yyyy/MM/dd');
        //                        },
        //                        5: function (td) {
        //                            return $(td).parents('tr').find(':text[name=staff_wage]').val();
        //                        },
        //                        6: function (td) {
        //                            if ($(td).find(':checkbox').prop('checked')) {
        //                                return '<span class="label label-success">ON</span>';
        //                            } else {
        //                                return '<span class="label label-default">OFF</span>';
        //                            }
        //                        }
        //                    };

        servkit.crudtable({
          tableSelector: '#stk-staff-table',
          create: {
            url: 'api/kuochuan/servtrack/emp/create',
            send: createSend,
            end: createEnd,
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
              'api/kuochuan/servtrack/emp/read?staff_id=' +
              encodeURIComponent(staffId),
            end: {
              4: function (data) {
                return moment(new Date(data)).format('YYYY/MM/DD')
              },
              5: function (data) {
                if (data === -1) {
                  return '---'
                } else {
                  return data
                }
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

              ctx.$tableBody
                .find('tbody')
                .find('tr')
                .each(function () {
                  var tr = $(this)
                  if (tr.find('td').eq(5).text() === '---') {
                    tr.find('td').eq(4).text('---')
                  }
                })

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
          update: {
            url: 'api/kuochuan/servtrack/emp/update',
            start: {
              3: function (oldTd, newTd, oldTr, newTr) {
                var oldInput = $(oldTd).html()
                lastWage = oldInput
                var newInput = $(
                  '<input type="text" name="staff_wage" class="form-control"/>'
                ).val(oldInput)
                $(newTd).html(newInput)
              },
              4: function (oldTd, newTd, oldTr, newTr) {
                var oldInput = $(oldTd).html()
                var newInput = $('<input type="text" class="form-control"/>')
                  .val(oldInput)
                  .prop('disabled', true)
                $(newTd).html(newInput)
              },
              5: function (oldTd, newTd, oldTr, newTr) {
                var oldInput = $(oldTd).html()
                var newInput = $('<input type="text" class="form-control"/>')
                  .val(oldInput)
                  .prop('disabled', true)
                $(newTd).html(newInput)
              },
              6: function (oldTd, newTd, oldTr, newTr) {
                if ($(oldTd).text().indexOf('OFF') !== -1) {
                  $(newTd).find(':checkbox').prop('checked', false)
                } else {
                  $(newTd).find(':checkbox').prop('checked', true)
                }
              },
            },
            send: updateSend,
            //                            end: updateEnd,
            finalDo: function () {
              ctx.$tableBody.find('.stk-refresh-btn').trigger('click')
            },
          },
          delete: {
            // unavailable: true
          },
          validate: {
            1: function (td, table) {
              var input = $(td).find(':input')
              if (input.val() === '') {
                return '<br />請填寫員工編號'
              }

              if (!input.prop('disabled')) {
                if (
                  _.find(table.columns(0).data().eq(0), function (existId) {
                    return existId === input.val()
                  })
                ) {
                  return '<br />員工編號重複'
                }
              }
              if (input.val().length > 10) {
                return '<br>長度不可超過10'
              }
              var regChinese = /^[\u4E00-\u9FA5]+$/
              if (regChinese.test(input.val())) {
                return '<br>不能有中文字'
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
                return '<br />請填寫姓名'
              }
              if ($(td).find(':input').val().length > 50) {
                return '<br>長度不可超過50'
              }
            },
            3: function (td) {
              if ($(td).find(':input').val() === '') {
                return '<br />請填寫時薪'
              }
              if (isNaN($(td).find(':input').val())) {
                return '<br />請填數字'
              }
              if ($(td).find(':input').val().length > 10) {
                return '<br>長度不可超過10'
              }
            },
          },
          customBtns: [
            '<button class="btn bg-color-blueDark txt-color-white stk-qrcode-btn" title="print QRCode" style="margin-right: 10px;"><span class="fa fa-qrcode fa-lg"></span></button>',
          ],
        })

        //                    $('button.stk-delete-btn').remove();
      },
      getQRCodedocx: function (staffIds) {
        var ctx = this
        var uuid = ((Math.random() * 10000) % 10000).toFixed(0)
        if (staffIds.lenth == 0) {
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

          var $submitForm = $('<form name="' + uuid + '""></form>')
          var iframeHtml =
            '<iframe name="download_target" style="width:0;height:0;border:0 solid #fff;""></iframe>'
          $submitForm.append(
            $('<input>').attr('name', 'staffIds').val(staffIds)
          )
          $submitForm.append($('<input>').attr('name', 'uuid').val(uuid))
          $submitForm.attr({
            action: 'api/kuochuan/servtrack/emp/printQRCode',
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
