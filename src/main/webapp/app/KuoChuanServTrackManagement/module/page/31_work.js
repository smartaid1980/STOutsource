export default function () {
  ;(function () {
    function initializeDBData(DbData) {
      function Obj(data) {
        this.data = data
        this.map = {}
      }

      Obj.prototype.getData = function () {
        return this.data
      }
      Obj.prototype.getMap = function () {
        return this.map
      }
      Obj.prototype.init = function (key, val) {
        var that = this
        var html = ''
        _.each(this.data, function (record) {
          that.map[record[key]] = record[val]
          html +=
            '<option style="padding:3px 0 3px 3px;" value="' +
            record[key] +
            '">' +
            record[val] +
            '</option>'
        })
        that.selectHtml = html
      }

      Obj.prototype.getName = function (key) {
        return this.map[key]
      }
      Obj.prototype.getSelect = function () {
        return this.selectHtml
      }
      return new Obj(DbData)
    }

    function smallBox(params) {
      var smallBoxColor = {
        green: '#739E73',
        red: '#C46A69',
        yellow: '#C79121',
      }
      var content = params.content
      if (!content) {
        content = ''
      }
      $.smallBox({
        title: params.title,
        content:
          "<i class='fa fa-clock-o'></i>" + content + '<i>1 seconds ago...</i>',
        color: smallBoxColor[params.color],
        iconSmall: params.icon,
        timeout: params.timeout,
      })
    }

    function bling(blingTimes, frequency, $elements, color) {
      blingTimes = blingTimes * 2 + 1
      var blingCount = 1

      setTimeout(function change() {
        if (blingCount < blingTimes) {
          if (blingCount++ % 2 === 0) {
            $elements.css('background-color', '')
          } else {
            $elements.css('background-color', color)
          }
          setTimeout(change, frequency)
        }
      }, 0)
    }

    function uuidGenerator(len, radix) {
      // var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
      var chars = '0123456789abcdefghijklmnopqrstuvwxyz'.split('')
      var uuid = [],
        i
      radix = radix || chars.length

      if (len) {
        for (i = 0; i < len; i++) uuid[i] = chars[0 | (Math.random() * radix)]
      } else {
        var r

        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-'
        uuid[14] = '4'

        for (i = 0; i < 36; i++) {
          if (!uuid[i]) {
            r = 0 | (Math.random() * 16)
            uuid[i] = chars[i == 19 ? (r & 0x3) | 0x8 : r]
          }
        }
      }

      return uuid.join('')
    }

    GoGoAppFun({
      gogo: function (ctx) {
        pageSetUp()

        ctx.initFuncs()
        ctx.initElements()
        ctx.initEvents()
      },
      util: {
        status: {
          0: '開立',
          1: '生產中',
          2: '結案',
          9: '取消',
        },
        $submitBtn: $('#submit-btn'),
        $submitClean: $('#submit-clean'),
        $startDate: $('#start-date'),
        $endDate: $('#end-date'),
        $workId: $('#work-id'),
        $workStatus: $('[name="work-status"]'),
        $productId: $('#product-id'),
        $detailNote: $('#detail-note'),
        $workTableWidget: $('#stk-work-table-widget'),
        $workTableBody: $('#stk-work-table-body'),
        $workTable: $('#stk-work-table'),
        $modalWork: $('#modal-work'),
        $modalWorkTitle: $('#modal-work-title'),
        $modalWorkId: $('#modal-work-id'),
        $modalWorkPorductSelect: $('#modal-work-product'),
        $modalQuantity: $('#modal-quantity'),
        $modalInput: $('#modal-input'),
        $modalRemark: $('#modal-remark'),
        $modalWorkSubmit: $('#modal-submit-btn'),
        $modalWorkForm: $('#modal-work-form'),
        $modalWorkNote: $('#modal-work-note'),
        $modalProductNote: $('#modal-product-note'),
        $modalQuantityNote: $('#modal-quantity-note'),
        $modalInputNote: $('#modal-input-note'),
        $modalOp: $('#modal-op'),
        $modalOpBody: $('#stk-op-table-body'),
        $modalOpTable: $('#stk-op-table'),
        $modalProductIdNote: $('#modal-product-id-note'),
        $deleteCheckDialog: $('<div id="deleteCheckDialog"></div>'),
        isInsertWork: false,
        insertWork: function (params) {
          var ctx = this
          var loadingBtn = servkit.loadingButton(
            document.querySelector('#modal-submit-btn')
          )
          loadingBtn.doing()
          try {
            servkit.ajax(
              {
                url: 'api/kuochuan/servtrack/work/create',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(params),
              },
              {
                success: function (data) {
                  var smallParams = {
                    color: 'green',
                    title: '工單新增成功',
                    icon: 'fa fa-check',
                    timeout: 2000,
                  }

                  if (data.length) {
                    var obj = data[0]
                    var moveIn = obj.move_in
                    var remark = obj.remark
                    if (!moveIn) {
                      moveIn = '未開工'
                    }
                    if (!remark) {
                      remark = ''
                    }

                    var result = [
                      obj.work_id,
                      obj.product_id,
                      obj.product_name,
                      obj.e_quantity,
                      obj.input,
                      obj.status_id,
                      obj.create_time,
                      obj.user_id,
                      obj.user_name,
                      moveIn,
                      remark,
                      ctx.buttons.opBtn,
                      ctx.buttons.editBtn,
                      ctx.buttons.rejectBtn,
                      ctx.buttons.closeWorkBtn,
                      obj.is_edit,
                    ]
                    var node = ctx.$workTable
                      .DataTable()
                      .row.add(result)
                      .draw()
                      .node()
                    bling(4, 300, $(node).find('td'), 'rgba(0, 255, 0, 0.2)')
                  }
                  smallBox(smallParams)
                  ctx.$modalWork.modal('toggle')
                },
                fail: function (data) {
                  console.warn(data)
                  var smallParams = {
                    color: 'yellow',
                    title: '工單新增失敗',
                    content: data,
                    icon: 'fa fa-sign-out',
                    timeout: 2000,
                  }
                  smallBox(smallParams)
                },
              }
            )
          } catch (e) {
            console.log(e)
          } finally {
            loadingBtn.done()
          }
        },
        updateWork: function (node, params) {
          var ctx = this

          var loadingBtn = servkit.loadingButton(
            document.querySelector('#modal-submit-btn')
          )
          loadingBtn.doing()
          try {
            servkit.ajax(
              {
                url: 'api/servtrack/work/update',
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(params),
              },
              {
                success: function (data) {
                  var smallParams = {
                    color: 'green',
                    title: '工單更新成功',
                    icon: 'fa fa-check',
                    timeout: 2000,
                  }
                  if (data.length) {
                    var obj = data[0]
                    var moveIn = obj.move_in
                    var remark = obj.remark
                    if (!moveIn) {
                      moveIn = '未開工'
                    }
                    if (!remark) {
                      remark = ''
                    }
                    var node = ctx.updateTarget
                    $(node).find('td').eq(0).html(obj.work_id)
                    $(node).find('td').eq(1).html(obj.product_id)
                    $(node).find('td').eq(2).html(obj.product_name)
                    $(node).find('td').eq(3).html(obj.e_quantity)
                    $(node).find('td').eq(4).html(obj.input)
                    $(node).find('td').eq(5).html(obj.status_id)
                    $(node).find('td').eq(6).html(obj.create_time)
                    $(node).find('td').eq(7).html(obj.user_id)
                    $(node).find('td').eq(8).html(obj.user_name)
                    $(node).find('td').eq(9).html(obj.moveIn)
                    $(node).find('td').eq(10).html(obj.remark)
                    bling(4, 300, $(node).find('td'), 'rgba(0, 255, 0, 0.2)')
                    delete ctx.updateTarget
                  }
                  smallBox(smallParams)
                  ctx.$modalWork.modal('toggle')
                },
                fail: function (data) {
                  console.warn(data)
                  var smallParams = {
                    color: 'yellow',
                    title: '工單更新失敗',
                    content: data,
                    icon: 'fa fa-sign-out',
                    timeout: 2000,
                  }
                  smallBox(smallParams)
                },
              }
            )
          } catch (e) {
            console.log(e)
          } finally {
            loadingBtn.done()
          }
        },
        appendErrorCode: function (ele, selector, content, check) {
          var ctx = this
          var code = $('<code class="note-error"></code>')
          var dom = ele.closest(selector)[0]
          if (check) {
            code.html(content)
            if (!dom.querySelector('code')) {
              dom.insertAdjacentHTML('beforeend', code[0].outerHTML)
            }
          } else {
            var node = dom.querySelector('code')
            if (node) {
              dom.removeChild(node)
            }
          }
        },
        drawWorkTable: function (isFirst) {
          var ctx = this
          var loadingBtn = servkit.loadingButton(
            document.querySelector('#submit-btn')
          )
          loadingBtn.doing()
          var params = {
            startDate: ctx.$startDate.val(),
            endDate: ctx.$endDate.val(),
            workId: ctx.$workId.val(),
            productId: ctx.$productId.val(),
            status: [],
          }
          _.each(this.$workStatus, function (ele) {
            if ($(ele).prop('checked')) {
              if (ele.value === '999') {
                params.status.push('0')
                params.status.push('1')
              } else {
                params.status.push(ele.value)
              }
            }
          })
          var table = createReportTable({
            $tableElement: ctx.$workTable,
            $tableWidget: ctx.$workTableWidget,
            onRow: function (row, data) {
              $(row).find('td').eq(1).css('display', 'none')
              $(row).find('td').eq(5).css('display', 'none')
              $(row).find('td').eq(7).css('display', 'none')
              $(row).find('td').eq(10).css('display', 'none')
              $(row).find('td').eq(15).css('display', 'none')
              var edit = $(row).find('td').eq(15).text()
              var statusId = $(row).find('td').eq(5).text()
              switch (statusId) {
                case '0':
                  $(row).find('td').eq(14).html('---')
                  break
                case '1':
                  $(row).find('td').eq(11).html('---')
                  $(row).find('td').eq(12).html('---')
                  $(row).find('td').eq(13).html('---')
                  break
                case '2':
                  $(row).find('td').eq(12).html('---')
                  $(row).find('td').eq(13).html('---')
                  $(row).find('td').eq(14).html('已結案')
                  break
                case '9':
                  $(row).find('td').eq(12).html('---')
                  $(row).find('td').eq(12).html('---')
                  $(row).find('td').eq(13).html('已取消')
                  $(row).find('td').eq(14).html('---')
                  break
              }
              if (edit == 'false') {
                $(row)
                  .find('td')
                  .eq(11)
                  .find('button')
                  .attr('disabled', 'disabled')
                $(row)
                  .find('td')
                  .eq(12)
                  .find('button')
                  .attr('disabled', 'disabled')
                $(row)
                  .find('td')
                  .eq(13)
                  .find('button')
                  .attr('disabled', 'disabled')
                $(row)
                  .find('td')
                  .eq(14)
                  .find('button')
                  .attr('disabled', 'disabled')
              }
            },
            onDraw: function (tableData, pageData) {},
            centerColumn: [11, 12, 13, 14],
          })
          var custBtnDiv = $('<div class="col-xs-12 col-sm-6"></div>')
          custBtnDiv.append(ctx.buttons.insertBtn)

          try {
            servkit.ajax(
              {
                url: 'api/kuochuan/servtrack/work/read',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(params),
              },
              {
                success: function (data) {
                  var result = _.map(data, function (obj) {
                    var isCanEdit =
                      JSON.parse(sessionStorage.loginInfo).user_id ===
                      obj.user_id
                    var moveIn = obj.move_in
                    var moveInNoOut = obj.move_in_without_out
                    if (!moveIn && !moveInNoOut) {
                      moveIn = '未開工'
                    } else if (!moveIn && moveInNoOut) {
                      moveIn = moment(moveInNoOut).format('YYYY/MM/DD HH:mm:ss')
                    }
                    var remark = obj.remark
                    if (!remark) {
                      remark = ''
                    }
                    return [
                      obj.work_id,
                      obj.product_id,
                      obj.product_name,
                      obj.e_quantity,
                      obj.input,
                      obj.status_id,
                      obj.create_time,
                      obj.user_id,
                      obj.user_name,
                      moveIn,
                      remark,
                      ctx.buttons.opBtn,
                      isCanEdit ? ctx.buttons.editBtn : '---',
                      isCanEdit ? ctx.buttons.rejectBtn : '---',
                      ctx.buttons.closeWorkBtn,
                      obj.is_edit,
                    ]
                  })
                  table.drawTable(result)
                  _.each(ctx.$workTable.prev().find('.hidden-xs'), function (
                    ele
                  ) {
                    $(ele).css('display', 'none')
                  })
                  ctx.$workTable.prev().prepend(custBtnDiv[0].cloneNode(true))
                  table.showWidget()
                  if (isFirst) {
                    $('.ui-dialog-titlebar-close').trigger('click')
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
            loadingBtn.done()
          }
        },
        drawOpTable: function (workId, productId) {
          var ctx = this
          var processHtml = ''
          _.each(ctx.processFunc.getData(), function (obj) {
            if (obj.is_open == 'Y') {
              processHtml +=
                '<option style="padding:3px 0 3px 3px;" value="' +
                obj.process_code +
                '">' +
                obj.process_name +
                '</option>'
            }
          })

          function createAndUpdateSend(tdEles) {
            return {
              work_id: (function () {
                return workId
              })(),
              process_code: (function () {
                var code = $(tdEles[1]).find(':selected').val()
                return code
              })(),
              product_id: (function () {
                return productId
              })(),
            }
          }
          var createAndUpdateEnd = {
            2: function (td) {
              var processName = $(td).find(':selected').val()
              if (ctx.processFunc.getName(processName)) {
                processName = ctx.processFunc.getName(processName)
              }
              return processName
            },
            4: function (td) {
              // because kuochuan time unit is sec not minutes
              return parseFloat($(td).find(':text').val()).toFixed(1)
            },
          }
          var read = {
            2: function (data) {
              if (ctx.processFunc.getName(data)) {
                return ctx.processFunc.getName(data)
              } else {
                return data
              }
            },
            4: function (data) {
              return (parseFloat(data) * 60).toFixed(1)
            },
          }
          servkit.crudtable({
            tableSelector: '#stk-op-table',
            create: {
              url: 'api/kuochuan/servtrack/workop/create',
              start: function (tdEles) {
                $('[name=process_code]')[0].innerHTML = processHtml
                $('select[name=process_code]').prop('selectedIndex', -1)
                pageSetUp() // for select2
                $(tdEles).eq(1).find('div').eq(0).remove()
                $(tdEles).eq(5).hide()
              },
              send: createAndUpdateSend,
              end: createAndUpdateEnd,
              finalDo: function () {
                $('#stk-op-table-body')
                  .find('tbody')
                  .find('tr')
                  .each(function () {
                    var tr = $(this)
                    tr.find('td').eq(6).hide()
                    if (tr.find('td').eq(6).html().indexOf('1') != -1) {
                      tr.find('td:first').find(':checkbox').remove()
                      tr.find('.stk-edit-btn').hide()
                    }
                  })
              },
            },
            read: {
              url:
                'api/kuochuan/servtrack/workop/read?work_id=' +
                encodeURIComponent(workId),
              end: read,
              finalDo: function () {
                $('#stk-op-table-body')
                  .find('tbody')
                  .find('tr')
                  .each(function () {
                    var tr = $(this)
                    tr.find('td').eq(6).hide()
                    if (tr.find('td').eq(6).html().indexOf('1') != -1) {
                      tr.find('td:first').find(':checkbox').remove()
                      tr.find('.stk-edit-btn').hide()
                    }
                  })
              },
            },
            update: {
              url: 'api/kuochuan/servtrack/workop/update',
              send: createAndUpdateSend,
              start: {
                2: function (oldTd, newTd) {
                  var oldCode = $(oldTd).eq(0).text()
                  $('[name=process_code]')[0].innerHTML = processHtml
                  $(
                    '[name=process_code] option:contains("' + oldCode + '")'
                  ).prop('selected', true)
                  pageSetUp()
                  $(newTd).find('div').eq(0).remove()
                },
                6: function (oldTd, newTd) {
                  $(newTd).hide()
                },
              },
              end: createAndUpdateEnd,
              finalDo: function () {
                $('#stk-op-table-body')
                  .find('tbody')
                  .find('tr')
                  .each(function () {
                    var tr = $(this)
                    tr.find('td').eq(6).hide()
                    if (tr.find('td').eq(6).html().indexOf('1') != -1) {
                      tr.find('td:first').find(':checkbox').remove()
                      tr.find('.stk-edit-btn').hide()
                    }
                  })
              },
            },
            delete: {},
            validate: {
              1: function (td) {
                var input = td.querySelector('input')
                if (input.value === '') {
                  return '<br />請填寫工序'
                }

                if (!input.disabled) {
                  if (
                    _.find(
                      $('#stk-op-table').DataTable().columns(0).data().eq(0),
                      function (existId) {
                        return (
                          existId.toLowerCase() === input.value.toLowerCase()
                        )
                      }
                    )
                  ) {
                    return '<br />工序重複'
                  }
                }

                //                                if (input.value.length > 10) {
                //                                    return '<br />長度不可超過10';
                //                                }
                //                                if (isNaN(input.value)) {
                //                                    return '<br />請填數字';
                //                                }
                var regChinese = /^[\u4E00-\u9FA5]+$/
                if (regChinese.test(input.value)) {
                  return '<br>不能有中文字'
                }
                // var regHalfwidth = /[^\x00-\xff]/g;
                // if (regHalfwidth.test(input.value)) {
                //   return '<br />不可輸入全形字元';
                // }
                var regQuestion = /[?]+/
                if (regQuestion.test(input.value)) {
                  return '<br />特殊符號僅包含~!@#$%^&*()_+=-`/\\.[]{}'
                }
                var regSymbol = /[^a-zA-Z0-9~@#%&_=\-`()+!$*^/.[]{}]+/
                if (regSymbol.test(input.value)) {
                  return '<br />特殊符號僅包含~!@#$%^&*()_+=-`/\\.[]{}'
                }
              },
              2: function (td) {
                if (td.querySelector('select').value === '') {
                  return '<br />請選擇製程'
                }
              },
              3: function (td) {
                var input = td.querySelector('input')

                if (input.value === '') {
                  return '<br />請填寫站別'
                }

                var regChinese = /^[\u4E00-\u9FA5]+$/
                if (regChinese.test(input.value)) {
                  return '<br>不能有中文字'
                }
                // var regHalfwidth = /[^\x00-\xff]/g;
                // if (regHalfwidth.test(input.value)) {
                //   return '<br />不可輸入全形字元';
                // }
                var regQuestion = /[?]+/
                if (regQuestion.test(input.value)) {
                  return '<br />特殊符號僅包含~!@#$%^&*()_+=-`/\\.[]{}'
                }
                var regSymbol = /[^a-zA-Z0-9~@#%&_=\-`()+!$*^/.[]{}]+/
                if (regSymbol.test(input.value)) {
                  return '<br />特殊符號僅包含~!@#$%^&*()_+=-`/\\.[]{}'
                }
              },
              4: function (td) {
                var input = td.querySelector('input')
                if (input.value === '') {
                  return '<br />請填寫單件標工'
                }
                if (isNaN(input.value)) {
                  return '<br />請填數字'
                }
                if (Number(input.value) === 0) {
                  return '<br />不可為0'
                }
                var regFloat = /^[0-9]+(.[0-9]{0,4})?$/
                if (isNaN(input.value)) {
                  return '<br />請填數字'
                } else if (0 > input.value || input.value > 999999.9999) {
                  return '<br />請輸入0 ~ 999999.9999範圍的值'
                }
              },
              5: function (td) {
                var input = td.querySelector('input')
                if (input.value.length > 50) {
                  return '<br />長度不可超過50'
                }
              },
            },
            customBtns: [
              "<button class='btn btn-danger stk-delete2-btn'  style='margin-right:10px'><span class='fa fa-trash-o fa-lg'></span></button>",
            ],
          })
          $('#stk-op-table').closest('div').find('div > .stk-delete-btn').hide()

          ctx.$modalOp.modal('toggle')
        },
        workStatusUpdate: function (node, params, dialogParams, isClose) {
          var ctx = this
          var work_id, product_id, e_quantity, input

          ctx.$deleteCheckDialog.dialog({
            autoOpen: false,
            width: 600,
            resizable: false,
            modal: true,
            title: dialogParams.title,
            buttons: [
              {
                html: '<i class="fa fa-trash-o"></i>&nbsp; 確定',
                class: 'btn btn-danger',
                click: function () {
                  var closeDialog = $(this)
                  servkit.ajax(
                    {
                      url: 'api/servtrack/work/update',
                      contentType: 'application/json',
                      type: 'PUT',
                      data: JSON.stringify(params),
                    },
                    {
                      success: function (data) {
                        var obj = data[0]
                        var moveIn = obj.move_in
                        var remark = obj.remark
                        work_id = obj.work_id
                        product_id = obj.product_id
                        e_quantity = obj.e_quantity
                        input = obj.input

                        if (!moveIn) {
                          moveIn = '未開工'
                        }
                        if (!remark) {
                          remark = ''
                        }
                        $(node).find('td').eq(0).html(obj.work_id)
                        $(node).find('td').eq(1).html(obj.product_id)
                        $(node).find('td').eq(2).html(obj.product_name)
                        $(node).find('td').eq(3).html(obj.e_quantity)
                        $(node).find('td').eq(4).html(obj.input)
                        $(node).find('td').eq(5).html(obj.status_id)
                        $(node).find('td').eq(6).html(obj.create_time)
                        $(node).find('td').eq(7).html(obj.user_id)
                        $(node).find('td').eq(8).html(obj.user_name)
                        $(node).find('td').eq(9).html(obj.moveIn)
                        $(node).find('td').eq(10).html(obj.remark)
                        switch (obj.status_id) {
                          case 0:
                            $(node).find('td').eq(14).html('---')
                            break
                          case 1:
                            $(node).find('td').eq(11).html('---')
                            $(node).find('td').eq(12).html('---')
                            $(node).find('td').eq(13).html('---')
                            break
                          case 2:
                            $(node).find('td').eq(12).html('---')
                            $(node).find('td').eq(13).html('---')
                            $(node).find('td').eq(14).html('已結案')
                            break
                          case 9:
                            $(node).find('td').eq(12).html('---')
                            $(node).find('td').eq(12).html('---')
                            $(node).find('td').eq(13).html('已取消')
                            $(node).find('td').eq(14).html('---')
                            break
                        }
                        bling(
                          4,
                          300,
                          $(node).find('td'),
                          'rgba(0, 255, 0, 0.2)'
                        )

                        closeDialog.dialog('close')

                        if (isClose) {
                          var closeParam = {
                            work_id: work_id,
                            product_id: product_id,
                            e_quantity: e_quantity,
                            input: input,
                            status_id: 2,
                          }
                          servkit.ajax(
                            {
                              url: 'api/servtrack/work/calculate',
                              type: 'PUT',
                              contentType: 'application/json',
                              data: JSON.stringify(closeParam),
                            },
                            {
                              success: function (data) {
                                console.log(data)
                              },
                              fail: function (data) {
                                console.log(data)
                              },
                            }
                          )
                        }
                      },
                    }
                  )
                },
              },
              {
                html: '<i class="fa fa-times"></i>&nbsp; 取消',
                class: 'btn btn-default',
                click: function () {
                  $(this).dialog('close')
                },
              },
            ],
          })
          ctx.$deleteCheckDialog.html(dialogParams.message)
          ctx.$deleteCheckDialog.dialog('open')
        },
        initFuncs: function () {
          var ctx = this
          if (ctx.preCon.products) {
            ctx['productFunc'] = ctx.preCon.products
          }
          if (ctx.preCon.works) {
            ctx['workFunc'] = ctx.preCon.works
          }

          if (ctx.preCon.process) {
            ctx['processFunc'] = ctx.preCon.process
          }
        },
        initElements: function () {
          var ctx = this
          servkit.initDatePicker(ctx.$startDate, ctx.$endDate, true)
          ctx.$productId.html(ctx.productFunc.getSelect())
          ctx.$productId.prop('selectedIndex', -1)
          ctx.$workId.html(ctx.workFunc.getSelect())
          ctx.$workId.prop('selectedIndex', -1)
          servkit.validateForm($('#main-form'), ctx.$submitBtn)
          ctx['buttons'] = {}
          ctx.buttons.insertBtn =
            '<button class="btn btn-primary stk-insert-btn" title="add new work" style="margin-right:5px"><span class="fa fa-plus fa-lg"></span></button>'
          ctx.buttons.editBtn =
            '<button class="btn btn-primary stk-edit-btn" title="修改" style="margin-right:5px">修改</button>'
          ctx.buttons.opBtn =
            '<button class="btn btn-primary stk-op-btn" title="工序製程" style="margin-right:5px">工序製程</button>'
          ctx.buttons.rejectBtn =
            '<button class="btn btn-primary stk-reject-btn" title="取消" >取消</button>'
          ctx.buttons.closeWorkBtn =
            '<button class="btn btn-primary stk-close-work-btn" title="結案">結案</button>'
          var productActiveHtml = ''
          _.each(ctx.productFunc.getData(), function (obj) {
            if (obj.is_open == 'Y') {
              productActiveHtml +=
                '<option style="padding:3px 0 3px 3px;" value="' +
                obj.product_id +
                '">' +
                obj.product_name +
                '</option>'
            }
          })
          ctx.$modalWorkPorductSelect.html(productActiveHtml)
          ctx.$modalWorkPorductSelect.prop('selectedIndex', -1)
        },
        initEvents: function () {
          var ctx = this
          ctx.$submitBtn
            .on('click', function (evt, isFirst) {
              evt.preventDefault()
              ctx.drawWorkTable(isFirst)
            })
            .trigger('click', [true])
          // 仿 crud table 的一些操作...
          //點新增的按鈕
          ctx.$workTableBody.on('click', '.stk-insert-btn', function (evt) {
            evt.preventDefault()
            ctx.$modalWorkTitle.html('新增派工單')
            ctx.isInsertWork = true
            ctx.$modalWork.modal('toggle')
            if (ctx.$modalWorkId.prop('disabled')) {
              ctx.$modalWorkId.prop('disabled', false)
            }
            if (ctx.$modalWorkPorductSelect.prop('disabled')) {
              ctx.$modalWorkPorductSelect.prop('disabled', false)
            }
            ctx.$modalWorkForm[0].reset()
            ctx.$modalWorkPorductSelect.prop('selectedIndex', -1)
            pageSetUp()
          })

          //點了修改的按鈕
          ctx.$workTable.on('click', '.stk-edit-btn', function (evt) {
            evt.preventDefault()
            ctx['updateTarget'] = this.parentNode.parentNode
            var workId = $(this).parent().parent().find('td').eq(0).text()
            var productName = $(this).parent().parent().find('td').eq(2).text()
            var quantity = $(this).parent().parent().find('td').eq(3).text()
            var input = $(this).parent().parent().find('td').eq(4).text()
            var remark = $(this).parent().parent().find('td').eq(10).text()
            ctx.$modalWorkTitle.html('編輯派工單')
            ctx.isInsertWork = false
            ctx.$modalWorkId.val(workId)
            ctx.$modalQuantity.val(quantity)
            ctx.$modalInput.val(input)
            ctx.$modalRemark.val(remark)
            ctx.$modalWorkPorductSelect
              .find('option:contains("' + productName + '")')
              .prop('selected', true)
            pageSetUp()
            ctx.$modalWork.modal('toggle')
            ctx.$modalWorkId.prop('disabled', true)
            ctx.$modalWorkPorductSelect.prop('disabled', true)
          })

          //點了工序製程的按鈕
          ctx.$workTable.on('click', '.stk-op-btn', function (evt) {
            evt.preventDefault()
            var workId = $(this).parent().parent().find('td').eq(0).text()
            var productName = $(this).parent().parent().find('td').eq(2).text()
            var quantity = $(this).parent().parent().find('td').eq(3).text()
            var input = $(this).parent().parent().find('td').eq(4).text()
            var productId = $(this).parent().parent().find('td').eq(1).text()
            ctx.$modalWorkNote.html(workId)
            ctx.$modalProductNote.html(productName)
            ctx.$modalQuantityNote.html(quantity)
            ctx.$modalInputNote.html(input)
            ctx.$modalProductIdNote.html(productId)
            if (!ctx.crudOpTable) {
              var crudTable = ctx.$modalOpTable[0].cloneNode(true)
              ctx.crudOpTable = crudTable
            } else {
              ctx.$modalOpBody.html(ctx.crudOpTable.cloneNode(true))
            }
            ctx.drawOpTable(workId, productId)
          })
          ctx.$modalWorkSubmit.on('click', function (evt) {
            evt.preventDefault()
            var work_id = ctx.$modalWorkId.val()
            var product_id = ctx.$modalWorkPorductSelect.val()
            var e_quantity = ctx.$modalQuantity.val()
            var remark = ctx.$modalRemark.val()
            var input = ctx.$modalInput.val()
            //                        if (isNaN(e_quantity)) {
            //                            ctx.appendErrorCode(ctx.$modalQuantity, 'section', '請填數字', true);
            //                            return false;
            //                        } else {
            //                            ctx.appendErrorCode(ctx.$modalQuantity, 'section', '請填數字', false);
            //                        }
            //                        if (isNaN(input)) {
            //                            ctx.appendErrorCode(ctx.$modalInput, 'section', '請填數字', true);
            //                            return false;
            //                        } else {
            //                            ctx.appendErrorCode(ctx.$modalInput, 'section', '請填數字', false);
            //                        }
            if (isNaN(e_quantity)) {
              ctx.appendErrorCode(
                ctx.$modalQuantity,
                'section',
                '請填數字',
                true
              )
              return false
            } else {
              ctx.appendErrorCode(
                ctx.$modalQuantity,
                'section',
                '請填數字',
                false
              )
            }
            if (e_quantity.length > 10) {
              ctx.appendErrorCode(
                ctx.$modalQuantity,
                'section',
                '長度不可超過10',
                true
              )
              return false
            } else {
              ctx.appendErrorCode(
                ctx.$modalQuantity,
                'section',
                '長度不可超過10',
                false
              )
            }
            if (isNaN(input)) {
              ctx.appendErrorCode(ctx.$modalInput, 'section', '請填數字', true)
              return false
            } else {
              ctx.appendErrorCode(ctx.$modalInput, 'section', '請填數字', false)
            }
            if (input.length > 10) {
              ctx.appendErrorCode(
                ctx.$modalInput,
                'section',
                '長度不可超過10',
                true
              )
              return false
            } else {
              ctx.appendErrorCode(
                ctx.$modalInput,
                'section',
                '長度不可超過10',
                false
              )
            }
            if (remark.length > 50) {
              ctx.appendErrorCode(
                ctx.$modalRemark,
                'section',
                '長度不可超過50',
                true
              )
              return false
            } else {
              ctx.appendErrorCode(
                ctx.$modalRemark,
                'section',
                '長度不可超過50',
                false
              )
            }
            var params = {
              work_id: work_id,
              product_id: product_id,
              e_quantity: e_quantity,
              remark: remark,
              input: input,
            }
            if (ctx.isInsertWork) {
              var table = ctx.$workTable.DataTable()
              let isInsert = true
              var workIds = table
                .columns(0)
                .data()
                .reduce(function (workId) {
                  return workId
                })
              //                            if (_.indexOf(workIds, work_id) > -1) {
              //                                ctx.appendErrorCode(ctx.$modalWorkId, 'section', '派工單號已存在', true);
              //                                return false;
              //                            } else {
              //                                ctx.appendErrorCode(ctx.$modalWorkId, 'section', '派工單號已存在', false);
              //                            }
              //                            if (!product_id) {
              //                                ctx.appendErrorCode(ctx.$modalWorkPorductSelect, 'section', '請選擇品項', true);
              //                                return false;
              //                            } else {
              //                                ctx.appendErrorCode(ctx.$modalWorkPorductSelect, 'section', '請選擇品項', false);
              //                            }
              if (!work_id) {
                ctx.appendErrorCode(
                  ctx.$modalWorkId,
                  'section',
                  '請輸入派工單編號',
                  true
                )
                return false
              } else {
                ctx.appendErrorCode(
                  ctx.$modalWorkId,
                  'section',
                  '請輸入派工單編號',
                  false
                )
              }
              var regHalfwidth = /[\uFE30-\uFFA0]/g
              if (regHalfwidth.test(work_id)) {
                ctx.appendErrorCode(
                  ctx.$modalWorkId,
                  'section',
                  '不可輸入全形字母數字',
                  true
                )
                return false
              } else {
                ctx.appendErrorCode(
                  ctx.$modalWorkId,
                  'section',
                  '不可輸入全形字母數字',
                  false
                )
              }
              var regQuestion = /[?]+/
              if (regQuestion.test(work_id)) {
                ctx.appendErrorCode(
                  ctx.$modalWorkId,
                  'section',
                  '特殊符號僅包含~!@#$%^&*()_+=-`/\\.[]{}',
                  true
                )
                return false
              } else {
                ctx.appendErrorCode(
                  ctx.$modalWorkId,
                  'section',
                  '特殊符號僅包含~!@#$%^&*()_+=-`/\\.[]{}',
                  false
                )
              }
              var regSymbol = /[^\u4E00-\u9FA5a-zA-Z0-9~@#%&_=\-`()+!$*^/.[]{}]+/
              if (regSymbol.test(work_id)) {
                ctx.appendErrorCode(
                  ctx.$modalWorkId,
                  'section',
                  '特殊符號僅包含~!@#$%^&*()_+=-`/\\.[]{}',
                  true
                )
                return false
              } else {
                ctx.appendErrorCode(
                  ctx.$modalWorkId,
                  'section',
                  '特殊符號僅包含~!@#$%^&*()_+=-`/\\.[]{}',
                  false
                )
              }
              if (_.indexOf(workIds, work_id) > -1) {
                ctx.appendErrorCode(
                  ctx.$modalWorkId,
                  'section',
                  '派工單號已存在',
                  true
                )
                return false
              } else {
                ctx.appendErrorCode(
                  ctx.$modalWorkId,
                  'section',
                  '派工單號已存在',
                  false
                )
              }
              if (work_id.length > 20) {
                ctx.appendErrorCode(
                  ctx.$modalWorkId,
                  'section',
                  '長度不可超過20',
                  true
                )
              } else {
                ctx.appendErrorCode(
                  ctx.$modalWorkId,
                  'section',
                  '長度不可超過20',
                  false
                )
              }
              if (!product_id) {
                ctx.appendErrorCode(
                  ctx.$modalWorkPorductSelect,
                  'section',
                  '請選擇產品',
                  true
                )
                return false
              } else {
                ctx.appendErrorCode(
                  ctx.$modalWorkPorductSelect,
                  'section',
                  '請選擇產品',
                  false
                )
              }
            }
            if (ctx.isInsertWork) {
              ctx.insertWork(params)
            } else {
              ctx.updateWork(ctx.updateTarget, params)
            }
          })

          ctx.$modalOpBody.on('click', '.stk-delete2-btn', function (evt) {
            evt.preventDefault()
            var work_id = ctx.$modalWorkNote.text()
            var trArr = []
            var opArr = []

            _.each($('#stk-op-table').find('tbody > tr'), function (trEle) {
              var tdCheckBoxEle = $(trEle).find('td:first-child input')
              if ($(tdCheckBoxEle).prop('checked')) {
                trArr.push(trEle)
                opArr.push($(trEle).find('td').eq(1).text())
              }
            })
            if (!opArr.length) {
              bling(
                5,
                100,
                ctx.$modalOpTable.find(
                  'thead tr:nth-child(2) td:first-child,tbody tr td:first-child'
                ),
                'rgba(255, 0, 0, 0.2)'
              )
            } else {
              ctx.$deleteCheckDialog.dialog({
                autoOpen: false,
                width: 600,
                resizable: false,
                modal: true,
                title:
                  "<div class='widget-header'><h4><i class='fa fa-warning'></i> 刪除工序 </h4></div>",
                buttons: [
                  {
                    html: '<i class="fa fa-trash-o"></i>&nbsp; 確定',
                    class: 'btn btn-danger',
                    click: function () {
                      var closeDialog = $(this)
                      servkit.ajax(
                        {
                          url: 'api/kuochuan/servtrack/workop/delete',
                          contentType: 'application/json',
                          type: 'DELETE',
                          data: JSON.stringify({
                            work_id: work_id,
                            op: opArr,
                          }),
                        },
                        {
                          success: function (data) {
                            _.each(trArr, function (ele) {
                              $(ele).remove()
                            })
                            closeDialog.dialog('close')
                          },
                        }
                      )
                    },
                  },
                  {
                    html: '<i class="fa fa-times"></i>&nbsp; 取消',
                    class: 'btn btn-default',
                    click: function () {
                      $(this).dialog('close')
                    },
                  },
                ],
              })
              ctx.$deleteCheckDialog.html('確定要刪除' + opArr + ' 工序嗎 ?')
              ctx.$deleteCheckDialog.dialog('open')
            }
          })

          ctx.$workTable.on('click', '.stk-reject-btn', function (evt) {
            evt.preventDefault()
            var node = this.parentNode.parentNode
            var workId = $(this).parent().parent().find('td').eq(0).text()
            var dialogParams = {}
            var param = {
              work_id: workId,
              status_id: 9,
            }
            dialogParams['title'] =
              "<div class='widget-header'><h4><i class='fa fa-warning'></i> 工單取消 </h4></div>"
            dialogParams['message'] = workId + '&nbsp;&nbsp;確定要取消嗎 ?'
            ctx.workStatusUpdate(node, param, dialogParams, false)
          })
          ctx.$workTable.on('click', '.stk-close-work-btn', function (evt) {
            evt.preventDefault()
            var node = this.parentNode.parentNode
            var workId = $(this).parent().parent().find('td').eq(0).text()
            var dialogParams = {}
            var param = {
              work_id: workId,
              status_id: 2,
            }
            dialogParams['title'] =
              "<div class='widget-header'><h4><i class='fa fa-warning'></i> 工單結案 </h4></div>"
            dialogParams['message'] = workId + '&nbsp;&nbsp;確定要結案嗎 ?'
            ctx.workStatusUpdate(node, param, dialogParams, true)
          })
        },
      },
      dependencies: [
        [
          '/js/plugin/flot/jquery.flot.cust.min.js',
          '/js/plugin/flot/jquery.flot.resize.min.js',
          '/js/plugin/flot/jquery.flot.fillbetween.min.js',
          '/js/plugin/flot/jquery.flot.orderBar.min.js',
          '/js/plugin/flot/jquery.flot.pie.min.js',
          '/js/plugin/flot/jquery.flot.tooltip.min.js',
          '/js/plugin/flot/jquery.flot.symbol.min.js',
          '/js/plugin/flot/jquery.flot.axislabels.js',
          '/js/plugin/flot/jquery.flot.dashes.min.js',
        ],
        [
          '/js/plugin/datatables/jquery.dataTables.min.js',
          '/js/plugin/datatables/dataTables.colVis.min.js',
          '/js/plugin/datatables/dataTables.tableTools.min.js',
          '/js/plugin/datatables/dataTables.bootstrap.min.js',
          '/js/plugin/datatable-responsive/datatables.responsive.min.js',
        ],
        ['/js/plugin/select2/select2.min.js'],
      ],
      preCondition: {
        products: function (done) {
          var ctx = this
          servkit.ajax(
            {
              url: servkit.rootPath + '/api/getdata/db',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                table: 'a_kuochuan_servtrack_view_product',
                columns: ['product_id', 'product_name', 'is_open'],
                whereClause: 'product_id <> ?',
                whereParams: ['invalid_work'],
              }),
            },
            {
              success: function (data) {
                var func = initializeDBData(data)
                func.init('product_id', 'product_name')
                done(func)
              },
              fail: function (data) {
                console.log(data)
              },
            }
          )
        },
        works: function (done) {
          var ctx = this
          servkit.ajax(
            {
              url: servkit.rootPath + '/api/getdata/db',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                table: 'a_servtrack_work',
                columns: ['work_id'],
                whereClause: ' work_id <> ? order by work_id desc limit 200',
                whereParams: ['INVALID_WORK'],
              }),
            },
            {
              success: function (data) {
                var func = initializeDBData(data)
                func.init('work_id', 'work_id')
                done(func)
              },
              fail: function (data) {
                console.log(data)
              },
            }
          )
        },
        process: function (done) {
          var ctx = this
          servkit.ajax(
            {
              url: servkit.rootPath + '/api/getdata/db',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                table: 'a_servtrack_process',
                columns: ['process_code', 'process_name', 'is_open'],
                whereClause: 'process_code <> ?',
                whereParams: ['invalid'],
              }),
            },
            {
              success: function (data) {
                var func = initializeDBData(data)
                func.init('process_code', 'process_name')
                done(func)
              },
              fail: function (data) {
                console.log(data)
              },
            }
          )
        },
      },
    })
  })()
}
