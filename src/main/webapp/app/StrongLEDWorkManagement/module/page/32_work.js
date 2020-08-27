import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      pageSetUp()
      ctx.initFuncs(ctx)
      ctx.initElements(ctx)
      ctx.initEvents(ctx)
    },
    util: {
      status: {
        0: `${i18n('ServTrackManagement_000026')}`,
        1: `${i18n('ServTrackManagement_000046')}`,
        2: `${i18n('ServTrackManagement_000037')}`,
        9: `${i18n('ServTrackManagement_000078')}`,
      },
      $submitBtn: $('#submit-btn'),
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $workId: $('#work-id'),
      $workStatus: $('[name="work-status"'),
      $productId: $('#product-id'),
      $detailNote: $('#detail-note'),
      $workTableWidget: $('#stk-work-table-widget'),
      $workTableBody: $('#stk-work-table-body'),
      $workTable: $('#stk-work-table'),
      $opTable: $('#stk-op-table'),
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
      $modalMaterial: $('#modal-material'),
      $deleteCheckDialog: $('<div id="deleteCheckDialog"></div>'),
      isInsertWork: false,
      insertWork: function (params) {
        var that = this
        var loadingBtn = servkit.loadingButton(
          document.querySelector('#modal-submit-btn')
        )
        loadingBtn.doing()
        try {
          servkit.ajax(
            {
              url: 'api/servtrack/work/create',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify(params),
            },
            {
              success: function (data) {
                var smallParams = {
                  color: 'green',
                  title: `${i18n('ServTrackManagement_000067')}`,
                  icon: 'fa fa-check',
                  timeout: 2000,
                }
                if (data.length) {
                  var obj = data[0]
                  var moveIn = obj.move_in
                  var remark = obj.remark
                  if (!moveIn) {
                    moveIn = `${i18n('ServTrackManagement_000054')}`
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
                    that.buttons.opBtn,
                    that.buttons.editBtn,
                    that.buttons.rejectBtn,
                    that.buttons.closeWorkBtn,
                    obj.is_edit,
                  ]
                  var node = that.$workTable
                    .DataTable()
                    .row.add(result)
                    .draw()
                    .node()
                  that.commons.bling(
                    4,
                    300,
                    $(node).find('td'),
                    'rgba(0, 255, 0, 0.2)'
                  )
                }
                that.commons.smallBox(smallParams)
                that.$modalWork.modal('toggle')
              },
              fail: function (data) {
                console.warn(data)
                var smallParams = {
                  color: 'yellow',
                  title: `${i18n('ServTrackManagement_000068')}`,
                  content: data,
                  icon: 'fa fa-sign-out',
                  timeout: 2000,
                }
                that.commons.smallBox(smallParams)
              },
            }
          )
        } catch (e) {
          console.warn(e)
        } finally {
          loadingBtn.done()
        }
      },
      updateWork: function (node, params) {
        var that = this

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
                  title: `${i18n('ServTrackManagement_000065')}`,
                  icon: 'fa fa-check',
                  timeout: 2000,
                }
                if (data.length) {
                  var obj = data[0]
                  var moveIn = obj.move_in
                  var remark = obj.remark
                  if (!moveIn) {
                    moveIn = `${i18n('ServTrackManagement_000054')}`
                  }
                  if (!remark) {
                    remark = ''
                  }
                  var node = that.updateTarget
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
                  that.commons.bling(
                    4,
                    300,
                    $(node).find('td'),
                    'rgba(0, 255, 0, 0.2)'
                  )
                  delete that.updateTarget
                }
                that.commons.smallBox(smallParams)
                that.$modalWork.modal('toggle')
              },
              fail: function (data) {
                console.warn(data)
                var smallParams = {
                  color: 'yellow',
                  title: `${i18n('ServTrackManagement_000066')}`,
                  content: data,
                  icon: 'fa fa-sign-out',
                  timeout: 2000,
                }
                that.commons.smallBox(smallParams)
              },
            }
          )
        } catch (e) {
          console.warn(e)
        } finally {
          loadingBtn.done()
        }
      },
      appendErrorCode: function (ele, selector, content) {
        var code = $('<code class="note-error"></code>')
        var dom = ele.closest(selector)[0]
        code.html(content)
        if (!dom.querySelector('code')) {
          dom.insertAdjacentHTML('beforeend', code[0].outerHTML)
        }
      },
      drawWorkTable: function () {
        var that = this
        var loadingBtn = servkit.loadingButton(
          document.querySelector('#submit-btn')
        )
        loadingBtn.doing()
        var params = {
          startDate: that.$startDate.val(),
          endDate: that.$endDate.val(),
          workId: that.commons.checkEscapeSymbol(that.$workId.val()),
          productId: that.commons.checkEscapeSymbol(that.$productId.val()),
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
          $tableElement: that.$workTable,
          $tableWidget: that.$workTableWidget,
          rightColumn: [3, 4],
          onRow: function (row) {
            $(row).find('td').eq(1).css('display', 'none')
            $(row).find('td').eq(5).css('display', 'none')
            $(row).find('td').eq(7).css('display', 'none')
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
                $(row)
                  .find('td')
                  .eq(14)
                  .html(`${i18n('ServTrackManagement_000058')}`)
                break
              case '9':
                $(row).find('td').eq(11).html('---')
                $(row).find('td').eq(12).html('---')
                $(row)
                  .find('td')
                  .eq(13)
                  .html(`${i18n('ServTrackManagement_000059')}`)
                $(row).find('td').eq(14).html('---')
                break
            }
            if (edit === 'false') {
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
          centerColumn: [11, 12, 13, 14],
          showNoData: false,
        })
        var custBtnDiv = $('<div class="col-xs-12 col-sm-6"></div')
        custBtnDiv.append(that.buttons.insertBtn)

        try {
          servkit.ajax(
            {
              url: 'api/servtrack/work/read',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify(params),
            },
            {
              success: function (data) {
                var result = _.map(data, function (obj) {
                  var moveIn = obj.move_in
                  var moveInNoOut = obj.move_in_without_out
                  if (!moveIn && !moveInNoOut) {
                    moveIn = `${i18n('ServTrackManagement_000054')}`
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
                    that.buttons.opBtn,
                    that.buttons.editBtn,
                    that.buttons.rejectBtn,
                    that.buttons.closeWorkBtn,
                    obj.is_edit,
                  ]
                })
                table.drawTable(result)
                if (result.length === 0) {
                  table.clearTable()
                }
                _.each(that.$workTable.prev().find('.hidden-xs'), function (
                  ele
                ) {
                  $(ele).css('display', 'none')
                })
                that.$workTable.prev().prepend(custBtnDiv[0].cloneNode(true))
                table.showWidget()
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
      drawOpTable: function (workId, workTime) {
        var that = this
        var processHtml = ''
        _.each(that.processFunc.getData(), function (obj) {
          if (obj.is_open === 'Y') {
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
              var code = $(tdEles[2]).find(':selected').val()
              return code
            })(),
            product_id: (function () {
              return that.$modalProductIdNote.text()
            })(),
          }
        }
        var createAndUpdateEnd = {
          3: function (td) {
            var processName
            var processCode = $(td).find(':selected').val()
            if (that.processFunc.getName(processCode)) {
              processName = that.processFunc.getName(processCode)
            }
            return processName
          },
          4: function (td) {
            var result = $(td).find('input').val()
            return '<p align="right">' + parseFloat(result).toFixed(4) + '<p>'
          },
          6: function (td, formData) {
            return (
              '<button class="btn btn-primary" name="material-btn" data-op="' +
              formData.op +
              '" data-process="' +
              formData.process_code +
              `">${i18n('Material')}</button>`
            )
          },
        }
        var read = {
          3: function (data) {
            return that.processFunc.getName(data)
          },
          4: function (data) {
            return '<p align="right">' + parseFloat(data).toFixed(4) + '<p>'
          },
          6: function (data, rowData) {
            return (
              '<button class="btn btn-primary" name="material-btn" data-op="' +
              rowData.op +
              '" data-process="' +
              rowData.process_code +
              `">${i18n('Material')}</button>`
            )
          },
        }
        servkit.crudtable({
          tableSelector: '#stk-op-table',
          hideCols: [1],
          create: {
            url: 'api/servtrack/workop/create',
            start: function (tdEles) {
              $('[name=process_code]')[0].innerHTML = processHtml
              $('select[name=process_code]').prop('selectedIndex', -1)
              pageSetUp() // for select2
              $(tdEles).eq(2).find('div').eq(0).remove()
            },
            send: createAndUpdateSend,
            end: createAndUpdateEnd,
          },
          read: {
            url:
              'api/servtrack/workop/getworkop?workId=' +
              encodeURIComponent(workId),
            end: read,
            finalDo: function () {
              if (workTime !== `${i18n('ServTrackManagement_000054')}`) {
                $('#stk-op-table-body')
                  .children()
                  .find('.stk-delete-btn, .stk-insert-btn, .stk-edit-btn')
                  .attr('disabled', 'disabled')
              }
              // 有進出站記錄，換頁、顯示多筆數、過濾行為情境上不能CUD
              $('#stk-op-table').on('draw.dt', function () {
                if (workTime !== `${i18n('ServTrackManagement_000054')}`) {
                  $('#stk-op-table-body')
                    .children()
                    .find('.stk-delete-btn, .stk-insert-btn, .stk-edit-btn')
                    .attr('disabled', 'disabled')
                }
              })
            },
          },
          update: {
            url: 'api/servtrack/workop/update',
            send: createAndUpdateSend,
            start: {
              3: function (oldTd, newTd) {
                $(newTd).find('[name=process_code]').select2()
                $(newTd).find('div').eq(0).remove()
                servkit.initSelectWithList(
                  that.preCon.getProcessList,
                  $(newTd).find('[name=process_code]')
                )
                var oldProcesssName = $(oldTd).eq(0).text()
                $(newTd)
                  .find('[name=process_code]')
                  .val(that.preCon.processName2Code[oldProcesssName])
                  .trigger('change')
              },
            },
            end: createAndUpdateEnd,
          },
          delete: {
            url: 'api/servtrack/workop/delete',
            contentFunc: function (deleteIds) {
              return (
                _.pluck(deleteIds, 'op').join(', ') +
                `&nbsp;${i18n('ServTrackManagement_000041')}`
              )
            },
            fail: function (data) {
              console.warn('delete fail: ', data)
              if (data.indexOf('FOREIGN KEY') > -1) {
                return `${i18n('ServTrackManagement_000201')}`
              } else {
                return `${i18n('ServTrackManagement_000202')}`
              }
            },
          },
          validate: {
            2: function (td) {
              var input = td.querySelector('input')
              if (input.value === '') {
                return `<br>${i18n('ServTrackManagement_000052')}`
              }

              if (!input.disabled) {
                if (
                  _.find(
                    $('#stk-op-table').DataTable().columns(0).data().eq(0),
                    function (existId) {
                      return existId.toLowerCase() === input.value.toLowerCase()
                    }
                  )
                ) {
                  return `<br>${i18n('ServTrackManagement_000038')}`
                }
              }
              if (input.value.length > 50) {
                return `${i18n('ServTrackManagement_000001')}`
              }
              // if (isNaN(input.value)) {
              //   return `${i18n('ServTrackManagement_000006')}`;
              // }
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
            3: function (td) {
              if (td.querySelector('select').value === '') {
                return `${i18n('ServTrackManagement_000029')}`
              }
            },
            4: function (td) {
              var input = td.querySelector('input')
              if (input.value === '') {
                return `${i18n('ServTrackManagement_000033')}`
              } else if (Number(input.value) === 0) {
                return `${i18n('ServTrackManagement_000082')}`
              }
              if (isNaN(input.value)) {
                return `${i18n('ServTrackManagement_000006')}`
              } else if (input.value < 0 || input.value > 999999.9999) {
                return `${i18n('ServTrackManagement_000032')}`
              }
            },
            5: function (td) {
              var input = td.querySelector('input')
              if (input.value.length > 50) {
                return `${i18n('ServTrackManagement_000001')}`
              }
            },
          },
        })
        that.$modalOp.modal('toggle')
      },
      workStatusUpdate: function (node, params, dialogParams, isClose) {
        var that = this
        var workId
        var productId
        var eQuantity
        var input

        that.$deleteCheckDialog.dialog({
          autoOpen: false,
          width: 600,
          resizable: false,
          modal: true,
          title: dialogParams.title,
          buttons: [
            {
              html: `&nbsp;${i18n('ServTrackManagement_000213')}&nbsp;`,
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
                      workId = obj.work_id
                      productId = obj.product_id
                      eQuantity = obj.e_quantity
                      input = obj.input

                      if (!moveIn) {
                        moveIn = `${i18n('ServTrackManagement_000054')}`
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
                          $(node)
                            .find('td')
                            .eq(14)
                            .html(`${i18n('ServTrackManagement_000058')}`)
                          break
                        case 9:
                          $(node).find('td').eq(11).html('---')
                          $(node).find('td').eq(12).html('---')
                          $(node)
                            .find('td')
                            .eq(13)
                            .html(`${i18n('ServTrackManagement_000059')}`)
                          $(node).find('td').eq(14).html('---')
                          break
                      }
                      that.commons.bling(
                        4,
                        300,
                        $(node).find('td'),
                        'rgba(0, 255, 0, 0.2)'
                      )

                      closeDialog.dialog('close')

                      if (isClose) {
                        var closeParam = {
                          work_id: workId,
                          product_id: productId,
                          e_quantity: eQuantity,
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
                              console.warn(data)
                            },
                            fail: function (data) {
                              console.warn(data)
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
              html: `<i class="fa fa-times"></i>&nbsp; ${i18n(
                'ServTrackManagement_000214'
              )}`,
              class: 'btn btn-default',
              click: function () {
                $(this).dialog('close')
              },
            },
          ],
        })
        that.$deleteCheckDialog.html(dialogParams.message)
        that.$deleteCheckDialog.dialog('open')
      },
      initFuncs: function (ctx) {
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
      initElements: function (ctx) {
        servkit.initDatePicker(ctx.$startDate, ctx.$endDate, true)
        ctx.$productId.html(ctx.productFunc.getSelect())
        ctx.$productId.prop('selectedIndex', -1)
        ctx.$workId.html(ctx.workFunc.getSelect())
        ctx.$workId.prop('selectedIndex', -1)
        servkit.validateForm($('#main-form'), ctx.$submitBtn)
        ctx['buttons'] = {}
        ctx.buttons.insertBtn =
          '<button class="btn btn-primary stk-insert-btn" title="add new work" style="margin-right:5px"><span class="fa fa-plus fa-lg"></span></button>'
        ctx.buttons.editBtn = `<button class="btn btn-primary stk-edit-btn" title="${i18n(
          'ServTrackManagement_000034'
        )}" style="margin-right:5px">${i18n(
          'ServTrackManagement_000034'
        )}</button>`
        ctx.buttons.opBtn = `<button class="btn btn-primary stk-op-btn" title="${i18n(
          'ServTrackManagement_000060'
        )}" style="margin-right:5px">${i18n(
          'ServTrackManagement_000060'
        )}</button>`
        ctx.buttons.rejectBtn = `<button class="btn btn-primary stk-reject-btn" title="${i18n(
          'ServTrackManagement_000078'
        )}" >${i18n('ServTrackManagement_000078')}</button>`
        ctx.buttons.closeWorkBtn = `<button class="btn btn-primary stk-close-work-btn" title="${i18n(
          'ServTrackManagement_000037'
        )}">${i18n('ServTrackManagement_000037')}</button>`
        var productActiveHtml = ''
        _.each(ctx.productFunc.getData(), function (obj) {
          if (obj.is_open === 'Y') {
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
      initEvents: function (ctx) {
        var that = this
        ctx.$submitBtn
          .on('click', function (evt) {
            evt.preventDefault()
            ctx.drawWorkTable()
          })
          .trigger('click')
        // 仿 crud table 的一些操作...
        // 點新增的按鈕
        ctx.$workTableBody.on('click', '.stk-insert-btn', function (evt) {
          evt.preventDefault()
          ctx.$modalWorkTitle.html(`${i18n('ServTrackManagement_000056')}`)
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
          $('.note-error').remove()
        })

        // 點了設定的按鈕
        ctx.$workTable.on('click', '.stk-edit-btn', function (evt) {
          evt.preventDefault()
          ctx['updateTarget'] = this.parentNode.parentNode
          var workId = $(this).parent().parent().find('td').eq(0).text()
          var productName = $(this).parent().parent().find('td').eq(2).text()
          var quantity = $(this).parent().parent().find('td').eq(3).text()
          var input = $(this).parent().parent().find('td').eq(4).text()
          var remark = $(this).parent().parent().find('td').eq(10).text()
          ctx.$modalWorkTitle.html(`${i18n('ServTrackManagement_000036')}`)
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
          $('.note-error').remove()
        })

        // 點了工序製程的按鈕
        ctx.$workTable.on('click', '.stk-op-btn', function (evt) {
          evt.preventDefault()
          ctx.workId = $(this).parent().parent().find('td').eq(0).text()
          ctx.productId = $(this).parent().parent().find('td').eq(1).text()
          ctx.productName = $(this).parent().parent().find('td').eq(2).text()
          var quantity = $(this).parent().parent().find('td').eq(3).text()
          var input = $(this).parent().parent().find('td').eq(4).text()
          var workTime = $(this).parent().parent().find('td').eq(9).text()
          ctx.$modalWorkNote.html(ctx.workId)
          ctx.$modalProductNote.html(ctx.productName)
          ctx.$modalQuantityNote.html(quantity)
          ctx.$modalInputNote.html(input)
          ctx.$modalProductIdNote.html(ctx.productId)
          if (!ctx.crudOpTable) {
            var crudTable = ctx.$modalOpTable[0].cloneNode(true)
            ctx.crudOpTable = crudTable
          } else {
            ctx.$modalOpBody.html(ctx.crudOpTable.cloneNode(true))
          }
          // 點了工序製程的按鈕
          $('#stk-op-table').on('click', '[name=material-btn]', function (e) {
            $('#modal-material-work-note').html(ctx.workId)
            $('#modal-material-product-note').html(ctx.productName)
            $('#modal-material-process-note').html(
              ctx.preCon.getProcessList[e.target.getAttribute('data-process')]
            )
            ctx.opId = e.target.getAttribute('data-op')
            $('#modal-material-op-note').html(ctx.opId)
            if (!ctx.materialCRUD) {
              ctx.materialCRUD = servkit.crudtable({
                tableSelector: '#stk-material-table',
                tableModel:
                  'com.servtech.servcloud.app.model.storage.WorkOpMaterial',
                create: {
                  url: 'api/stdcrud',
                  start: function () {
                    $('[name=material_id]')
                      .on('change', function () {
                        $('[name=material_desc]').val(
                          ctx.preCon.materials.map[this.value]
                        )
                      })
                      .trigger('change')
                  },
                },
                read: {
                  url: 'api/stdcrud',
                  whereClause: `work_id='${ctx.workId}' AND op='${ctx.opId}'`,
                  end: {
                    2: function (data, rowData) {
                      return ctx.preCon.materials.map[rowData.material_id]
                    },
                  },
                },
                update: {
                  url: 'api/stdcrud',
                },
                delete: {
                  url: 'api/stdcrud',
                },
                validate: {
                  1: function (td, table) {
                    var input = td.querySelector('select')
                    if (input.value === '') {
                      return `${i18n('ServTrackManagement_000019')}`
                    }

                    if (!input.disabled) {
                      if (
                        _.find(table.columns(0).data().eq(0), function (
                          existId
                        ) {
                          return (
                            existId.toLowerCase() === input.value.toLowerCase()
                          )
                        })
                      ) {
                        return `${i18n('ServTrackManagement_000014')}`
                      }
                    }
                  },
                  3: function (td) {
                    var input = td.querySelector('input')
                    let regStr = /^\d{1,8}$/
                    if (!regStr.test(input.value)) {
                      return `${i18n('Decimal_Alert_Info')}`
                    }
                  },
                },
              })
            }
            var sendWorkIDAndOp = function () {
              return {
                work_id: (function () {
                  return ctx.workId
                })(),
                op: (function () {
                  return ctx.opId
                })(),
              }
            }
            $('#stk-material-table').data(
              'crudTableConfig'
            ).create.send = sendWorkIDAndOp
            $('#stk-material-table').data(
              'crudTableConfig'
            ).update.send = sendWorkIDAndOp
            $('#stk-material-table').data(
              'crudTableConfig'
            ).read.whereClause = `work_id='${ctx.workId}' AND op='${ctx.opId}'`
            $('.stk-refresh-btn').trigger('click')
            ctx.$modalMaterial.modal({ keyboard: false })
            ctx.$modalMaterial.modal('show')
          })
          ctx.drawOpTable(ctx.workId, workTime)
        })

        ctx.$modalWorkSubmit.on('click', function (evt) {
          evt.preventDefault()
          ctx.$modalWork.find('.note-error').remove()
          var workId = ctx.$modalWorkId.val()
          var productId = ctx.$modalWorkPorductSelect.val()
          var eQuantity = ctx.$modalQuantity.val()
          var remark = ctx.$modalRemark.val()
          var input = ctx.$modalInput.val()
          var errorCount = 0
          var params = {
            work_id: workId,
            product_id: productId,
            e_quantity: eQuantity,
            remark: remark,
            input: input,
          }
          if (ctx.isInsertWork) {
            var table = ctx.$workTable.DataTable()
            var workIds = table
              .columns(0)
              .data()
              .reduce(function (workId) {
                return workId
              })
            if (!workId) {
              ctx.appendErrorCode(
                ctx.$modalWorkId,
                'section',
                `${i18n('ServTrackManagement_000031')}`
              )
              errorCount++
            }
            var regHalfwidth = /[\uFE30-\uFFA0]/g
            if (regHalfwidth.test(workId)) {
              ctx.appendErrorCode(
                ctx.$modalWorkId,
                'section',
                `${i18n('ServTrackManagement_000023')}`
              )
              errorCount++
            }
            if (that.commons.symbolValidation(workId)) {
              ctx.appendErrorCode(
                ctx.$modalWorkId,
                'section',
                `${i18n('ServTrackManagement_000197')}`
              )
              errorCount++
            }
            if (_.indexOf(workIds, workId) > -1) {
              ctx.appendErrorCode(
                ctx.$modalWorkId,
                'section',
                `${i18n('ServTrackManagement_000048')}`
              )
              errorCount++
            }
            if (workId.length > 50) {
              ctx.appendErrorCode(
                ctx.$modalWorkId,
                'section',
                `${i18n('ServTrackManagement_000001')}`
              )
              errorCount++
            }
            if (!productId) {
              ctx.appendErrorCode(
                ctx.$modalWorkPorductSelect,
                'section',
                `${i18n('ServTrackManagement_000030')}`
              )
              errorCount++
            }
          }
          if (!eQuantity) {
            ctx.appendErrorCode(
              ctx.$modalQuantity,
              'section',
              `${i18n('ServTrackManagement_000195')}`
            )
            errorCount++
          }
          var regPositiveInt = /^[1-9]\d*$/
          if (!regPositiveInt.test(eQuantity)) {
            ctx.appendErrorCode(
              ctx.$modalQuantity,
              'section',
              `${i18n('ServTrackManagement_000203')}`
            )
            errorCount++
          }
          if (isNaN(eQuantity)) {
            ctx.appendErrorCode(
              ctx.$modalQuantity,
              'section',
              `${i18n('ServTrackManagement_000006')}`
            )
            errorCount++
          }
          if (eQuantity.length > 10) {
            ctx.appendErrorCode(
              ctx.$modalQuantity,
              'section',
              `${i18n('ServTrackManagement_000002')}`
            )
            errorCount++
          }
          if (!input) {
            ctx.appendErrorCode(
              ctx.$modalInput,
              'section',
              `${i18n('ServTrackManagement_000196')}`
            )
            errorCount++
          }
          if (!regPositiveInt.test(input)) {
            ctx.appendErrorCode(
              ctx.$modalInput,
              'section',
              `${i18n('ServTrackManagement_000203')}`
            )
            errorCount++
          }
          if (isNaN(input)) {
            ctx.appendErrorCode(
              ctx.$modalInput,
              'section',
              `${i18n('ServTrackManagement_000006')}`
            )
            errorCount++
          }
          if (input.length > 10) {
            ctx.appendErrorCode(
              ctx.$modalInput,
              'section',
              `${i18n('ServTrackManagement_000002')}`
            )
            errorCount++
          }
          if (remark.length > 50) {
            ctx.appendErrorCode(
              ctx.$modalRemark,
              'section',
              `${i18n('ServTrackManagement_000001')}`
            )
            errorCount++
          }
          if (errorCount > 0) {
            return false
          }

          if (ctx.isInsertWork) {
            ctx.insertWork(params)
          } else {
            ctx.updateWork(ctx.updateTarget, params)
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
          dialogParams[
            'title'
          ] = `<div class='widget-header'><h4><i class='fa fa-warning'></i> ${i18n(
            'ServTrackManagement_000069'
          )} </h4></div>`
          dialogParams['message'] =
            `&nbsp;&nbsp;${i18n('ServTrackManagement_000040')} ` + workId
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
          dialogParams[
            'title'
          ] = `<div class='widget-header'><h4><i class='fa fa-warning'></i> ${i18n(
            'ServTrackManagement_000069'
          )} </h4></div>`
          dialogParams['message'] =
            `&nbsp;&nbsp;${i18n('ServTrackManagement_000039')} ` + workId
          ctx.workStatusUpdate(node, param, dialogParams, true)
        })

        ctx.$modalWork.on('keydown', function (e) {
          if (e.which === 13) {
            e.preventDefault()
            // ctx.$modalWorkSubmit.trigger('click');
          }
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
        var that = this
        servkit.ajax(
          {
            url: servkit.rootPath + '/api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_servtrack_product',
              columns: ['product_id', 'product_name', 'is_open'],
            }),
          },
          {
            success: function (data) {
              var func = that.commons.initializeDBData(data)
              func.init('product_id', 'product_name')
              done(func)
            },
            fail: function (data) {
              console.warn(data)
            },
          }
        )
      },
      works: function (done) {
        var that = this
        servkit.ajax(
          {
            url: servkit.rootPath + '/api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_servtrack_work',
              columns: ['work_id'],
              whereClause: ' 1=1 order by work_id desc limit 200',
            }),
          },
          {
            success: function (data) {
              var func = that.commons.initializeDBData(data)
              func.init('work_id', 'work_id')
              done(func)
            },
            fail: function (data) {
              console.warn(data)
            },
          }
        )
      },
      process: function (done) {
        var that = this
        servkit.ajax(
          {
            url: servkit.rootPath + '/api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_servtrack_process',
              columns: ['process_code', 'process_name', 'is_open'],
            }),
          },
          {
            success: function (data) {
              var func = that.commons.initializeDBData(data)
              func.init('process_code', 'process_name')
              done(func)
            },
            fail: function (data) {
              console.warn(data)
            },
          }
        )
      },
      materials: function (done) {
        var that = this
        servkit.ajax(
          {
            url: servkit.rootPath + '/api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_storage_material',
              columns: ['material_id', 'material_desc'],
            }),
          },
          {
            success: function (data) {
              var func = that.commons.initializeDBData(data)
              func.init('material_id', 'material_desc')
              done(func)
            },
            fail: function (data) {
              console.warn(data)
            },
          }
        )
      },
      getProcessList: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_servtrack_process',
              columns: ['process_code', 'process_name'],
              whereClause: "is_open = 'Y'",
            }),
          },
          {
            success: function (data) {
              var dataMap = {}
              _.each(data, function (elem, key) {
                dataMap[elem.process_code] = elem.process_name
              })
              done(dataMap)
            },
          }
        )
      },
      processName2Code: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_servtrack_process',
              columns: ['process_code', 'process_name'],
              whereClause: "is_open = 'Y'",
            }),
          },
          {
            success: function (data) {
              var dataMap = {}
              _.each(data, function (elem, key) {
                dataMap[elem.process_name] = elem.process_code
              })
              done(dataMap)
            },
          }
        )
      },
    },
  })
}
