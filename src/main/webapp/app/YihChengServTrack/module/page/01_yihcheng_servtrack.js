export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      $('#stop_page').hide()
      $('#outbound_page').hide()
      //畫面JS by Mike

      $('.btn_color').click(function () {
        this.classList.add('active')
        $('.btn_color').each((i, el) => {
          if (el !== this) {
            el.classList.remove('active')
          }
        })
      })

      $('#fullscreen-btn').click(function () {
        const container = document.getElementById('widget-grid')
        const isFullScreen = container.classList.contains('fullscreen')
        if (isFullScreen) {
          document.webkitExitFullscreen()
        } else {
          container.webkitRequestFullscreen()
        }
        container.classList.toggle('fullscreen', !isFullScreen)
        this.classList.toggle('btn-danger', !isFullScreen)
        this.classList.toggle('btn-info', isFullScreen)
        this.firstElementChild.classList.toggle('fa-times', !isFullScreen)
        this.firstElementChild.classList.toggle('fa-expand', isFullScreen)
      })

      //進站頁面區----------------------------------------------------------------------------------

      //確認進站
      $('#dispatch_btn').click(function (e) {
        e.preventDefault()
        const mold_id = [],
          tool_id = []
        _.each($('[name=mold_number]'), (i) => {
          if (i.value) {
            mold_id.push(i.value)
          }
        })
        _.each($('[name=tool_number]'), (i) => {
          if (i.value) {
            tool_id.push(i.value)
          }
        })
        const reg = /^\d+/
        console.log(mold_id, tool_id)
        const emp_id = []
        $('[name=Employee_ID]').val().split(',')
        _.each($('[name=Employee_ID]').val().split(','), (val) => {
          return emp_id.push(reg.exec(val)[0])
        })
        console.log(emp_id)
        servkit.ajax(
          {
            url: 'api/yihcheng/tracking/in',
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({
              move_in: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
              line_id: $('#line').val(),
              shift_day: $('#Shift_Day').val().replace(/\//g, '-'),
              shift: $('[name=shift]:checked').val(),
              work_id: 'M11-20063046',
              op: $('#Work_Order_Process').val(),
              create_by: 'admin',
              staff_id: $('#Number_Of_People').text(),
              mold_id_list: mold_id,
              tool_id_list: tool_id,
              employee_id_list: emp_id,
            }),
          },
          {
            success: function () {
              _.each($('#inbound_page').find('input'), (i) => {
                if (i.type === 'radio') {
                  i.checked = false
                } else {
                  i.value = ''
                }
              })
              $('[name=Employee_ID]').select2('value', '')
              ctx.Update_invalid_data()
              $.smallBox({
                title: '進站成功',
                color: '#2FA12F',
                iconSmall: 'fa fa-check',
                timeout: 4000,
              })

              $('#outbound_btn').click()
            },
          }
        )
      })

      // 線別及班次

      $('#line').change(function () {
        // now_time
        const three_day_ago = moment(
          new Date(new Date().setDate(new Date().getDate() - 3))
        ).format('YYYY/MM/DD')
        const three_day = moment(
          new Date(new Date().setDate(new Date().getDate() + 3))
        ).format('YYYY/MM/DD')
        const getTime = moment(new Date()).format('HH:mm:ss')
        // 前後三天班次資料
        const shiftData = ctx.preCon.shift_time.filter(
          (i) =>
            i.line_id === $(this).val() &&
            i.shift_day.toFormatedDate() <= three_day &&
            i.shift_day.toFormatedDate() >= three_day_ago
        )
        if (shiftData.length > 0) {
          // 設定當天日期與班次
          const today_shift = shiftData.filter(
            (i) =>
              i.shift_day.toFormatedDate() ===
              moment(new Date()).format('YYYY/MM/DD')
          )
          // 當天日期
          const today = today_shift[0].shift_day
          $('#Shift_Day').val(today.toFormatedDate())

          // 當天班次
          const sort_shift = today_shift.sort((a, b) => a.sequence - b.sequence)
          let last_sequence = sort_shift[sort_shift.length - 1].sequence
          // last_sequence = 0
          $('#inbound_shift').empty()
          _.each(sort_shift, (i) => {
            $('#inbound_shift')
              .append(` <div class="col col-xs-12 col-sm-12 col-md-6 col-lg-2">
          <label class="radio">
            <input
              name="shift"
              type="radio"
              value="${i.shift}"
              data-sequence="${i.sequence}"
              disabled
            />
            <i></i>${i.shift}</label
          >
        </div>`)
          })

          // 當下班次 checked
          const shift_checked = sort_shift.filter((i) =>
            getTime >= i.start_time.toFormatedTime() &&
            getTime < i.end_time.toFormatedTime() === '00:00:00'
              ? '24:00:00'
              : i.end_time.toFormatedTime()
          )

          _.each($('[name=shift]'), (i) => {
            if (i.value === shift_checked[0].shift) {
              $(i).prop('checked', true)
            }
          })
          ctx.now_sequence = Number(shift_checked[0].sequence)

          // 上一班次
          $('#prev_shift').click(function () {
            if (ctx.now_sequence != 1) {
              _.each($('[name=shift]'), (i) => {
                if (i.dataset.sequence == ctx.now_sequence - 1) {
                  $(i).prop('checked', true)
                }
              })
              ctx.now_sequence -= 1
            } else {
              const prev_day = moment(
                new Date(
                  new Date($('#Shift_Day').val()).setDate(
                    new Date($('#Shift_Day').val()).getDate() - 1
                  )
                )
              ).format('YYYY/MM/DD')

              const today_shift = shiftData.filter(
                (i) => i.shift_day.toFormatedDate() === prev_day
              )
              if (today_shift.length > 0) {
                // 當天日期
                $('#Shift_Day').val(today_shift[0].shift_day.toFormatedDate())

                // 當天班次
                const sort_shift = today_shift.sort(
                  (a, b) => a.sequence - b.sequence
                )
                last_sequence = sort_shift[sort_shift.length - 1].sequence
                $('#inbound_shift').empty()
                _.each(sort_shift, (i) => {
                  $('#inbound_shift')
                    .append(` <div class="col col-xs-12 col-sm-12 col-md-6 col-lg-2">
          <label class="radio">
            <input
              name="shift"
              type="radio"
              value="${i.shift}"
              data-sequence="${i.sequence}"
            />
            <i></i>${i.shift}</label
          >
        </div>`)
                })

                _.each($('[name=shift]'), (i) => {
                  if (i.value === sort_shift[sort_shift.length - 1].shift) {
                    $(i).prop('checked', true)
                  }
                })
                ctx.now_sequence = Number(
                  sort_shift[sort_shift.length - 1].sequence
                )
              } else {
                $.smallBox({
                  title: '班次顯示不可超過前後三日',
                  color: servkit.colors.red,
                  iconSmall: 'fa fa-times',
                  timeout: 4000,
                })
              }
            }
          })

          // 下一班次
          $('#next_shift').click(function () {
            if (ctx.now_sequence < last_sequence) {
              _.each($('[name=shift]'), (i) => {
                if (i.dataset.sequence == ctx.now_sequence + 1) {
                  $(i).prop('checked', true)
                }
              })
              ctx.now_sequence += 1
            } else {
              const next_day = moment(
                new Date(
                  new Date($('#Shift_Day').val()).setDate(
                    new Date($('#Shift_Day').val()).getDate() + 1
                  )
                )
              ).format('YYYY/MM/DD')

              const today_shift = shiftData.filter(
                (i) => i.shift_day.toFormatedDate() === next_day
              )
              if (today_shift.length > 0) {
                // 當天日期
                $('#Shift_Day').val(today_shift[0].shift_day.toFormatedDate())

                // 當天班次
                const sort_shift = today_shift.sort(
                  (a, b) => a.sequence - b.sequence
                )
                last_sequence = sort_shift[sort_shift.length - 1].sequence
                $('#inbound_shift').empty()
                _.each(sort_shift, (i) => {
                  $('#inbound_shift')
                    .append(` <div class="col col-xs-12 col-sm-12 col-md-6 col-lg-2">
          <label class="radio">
            <input
              name="shift"
              type="radio"
              value="${i.shift}"
              data-sequence="${i.sequence}"
            />
            <i></i>${i.shift}</label
          >
        </div>`)
                })

                _.each($('[name=shift]'), (i) => {
                  if (i.value === sort_shift[0].shift) {
                    $(i).prop('checked', true)
                  }
                })
                ctx.now_sequence = Number(sort_shift[0].sequence)
              } else {
                $.smallBox({
                  title: '班次顯示不可超過前後三日',
                  color: servkit.colors.red,
                  iconSmall: 'fa fa-times',
                  timeout: 4000,
                })
              }
            }
          })
        } else {
          $.smallBox({
            title: '請先設定該線當日班次',
            color: servkit.colors.red,
            iconSmall: 'fa fa-times',
            timeout: 4000,
          })
        }
      })
      // 直接點選radio 選班次
      $('#inbound_shift').on('click', '[name=shift]', function () {
        console.log(this.dataset.sequence)
        console.log('12')
        ctx.now_sequence = Number(this.dataset.sequence)
      })

      // 自動增加輸入框

      $('#mold_group')
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
            this.parentNode.parentNode.removeChild(this.parentNode)
          }
        })

      $('#tool_group')
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
        .on('mouseenter', '.inline-group', function () {
          $(this).find('.fa-times-circle-o').show()
        })
        .on('mouseleave', '.inline-group', function () {
          $(this).find('.fa-times-circle-o').hide()
        })
        .on('click', '.fa-times-circle-o', function () {
          if (this.parentNode.parentNode.children.length > 1) {
            this.parentNode.parentNode.removeChild(this.parentNode)
          }
        })

      // 出站用 report table
      ctx.outboundTable = createReportTable({
        $tableElement: $('#outbound_result'),
        $tableWidget: $('#outbound_widget'),
        hideCols: [5],
        showNoData: false,
      })

      // 列印製令與箱單 report table
      ctx.printTable = createReportTable({
        $tableElement: $('#product_order_table'),
        $tableWidget: $('#product_order_widget'),
        customBtns: [
          `<button style="width: 20rem;" class="btn btn-primary" id="print_all">全部${i18n(
            'Print'
          )}</button>`,
        ],
        showNoData: false,
        hideCols: [11],
      })

      //工序製程 report table
      ctx.process_table = createReportTable({
        $tableElement: $('#process_table'),
        $tableWidget: $('#process_widget'),
        showNoData: false,
      })

      ctx.inbound()

      // 切換到進站功能
      $('#inbound_btn').click(function (e) {
        e.preventDefault()
        ctx.Update_invalid_data()
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_servtrack_line',
            }),
          },
          {
            success: function (data) {
              const open_line = data.filter((i) => i.is_open !== 'N')
              const line_id = _.pluck(open_line, 'line_id')
              let invalid_line = ctx.invalid_status.filter(
                (i) => i.line_status == 2
              )
              invalid_line = _.pluck(invalid_line, 'line_id')
              const line = _.difference(line_id, invalid_line)
              servkit.initSelect2WithData($('#line'), line, true, {
                minimumInputLength: 0,
                allowClear: true,
                placeholder: i18n('Line'),
              })
            },
          }
        )

        $('#stop_page').hide()
        $('#outbound_page').hide()
        $('#inbound_page').show()
      })

      // 暫停頁面區------------------------------------------------------------------------------

      // 暫停用 report table
      ctx.stopTable = createReportTable({
        $tableElement: $('#stop_result'),
        $tableWidget: $('#stop_widget'),
        showNoData: false,
      })

      // 暫停線別資料
      ctx.Update_invalid_data()

      // 暫停頁面顯示
      $('#stop_btn').click(function (e) {
        e.preventDefault()
        ctx.Update_invalid_data()
        $('#inbound_page').hide()
        $('#outbound_page').hide()
        $('#stop_page').show()
      })

      // 按下暫停 送出API
      $('#fault_description_confirm').click(function (e) {
        e.preventDefault()
        servkit.ajax(
          {
            url: 'api/yihcheng/tracking/line-status',
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({
              line_id: ctx.stopRowData[0],
              invalid_id: ctx.invalid_id,
              invalid_text: $('#invalid_text').val(),
              modify_by: 'admin',
            }),
          },
          {
            success() {
              ctx.Update_invalid_data()
              $('#invalid_text').val('')
              $('#fault_modal').modal('hide')
              $('#stop_suspension_modal').modal('hide')
              $.smallBox({
                title: '此線別已暫停',
                color: servkit.colors.red,
                iconSmall: 'fa fa-times',
                timeout: 4000,
              })
            },
          }
        )
      })

      // 按下恢復 送出API
      $('#stop_result').on('click', '[name=resume_detail]', function (e) {
        e.preventDefault()
        const rowData = $(this).closest('tr').data('row-data')

        servkit.ajax(
          {
            url: 'api/yihcheng/tracking/line-status',
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({
              line_id: rowData[0],
              // invalid_id: ctx.invalid_id,
              // invalid_text: $('#invalid_text').val(),
              modify_by: 'admin',
            }),
          },
          {
            success() {
              ctx.Update_invalid_data()
              $('#fault_modal').modal('hide')
              $('#stop_suspension_modal').modal('hide')
              $.smallBox({
                title: '此線別已恢復執行',
                color: '#2FA12F',
                iconSmall: 'fa fa-check',
                timeout: 4000,
              })
            },
          }
        )
      })

      // 出站頁面區-------------------------------------------------------------------------

      // 顯示功能
      $('#outbound_btn').click(function (e) {
        e.preventDefault()
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_yihcheng_view_work_map',
              // columns: ['work_id', 'product_id', 'op', 'process_code'],
            }),
          },
          {
            success: function (data) {
              ctx.work_map = data
              console.log(ctx.work_map)
            },
          }
        )
        $('#inbound_page').hide()
        $('#stop_page').hide()
        $('#outbound_page').show()
      })

      // 點選出站
      $('#outbound_result').on('click', '[name=outbound_detail]', function () {
        const rowData = $(this.closest('tr')).data('row-data')
        ctx.outboundRowdata = rowData
        console.log(ctx.work_map)
        // let product_name = ctx.work_map.filter(
        //   (i) => i.product_id === rowData[5]
        // )
        // if (product_name.length > 0) {
        //   product_name = product_name[0].product_name
        // } else {
        //   product_name = ''
        // }

        $('.bad_product_line').text(`線別:${rowData[1]}`)
        $('.bad_product_line').next().text(`產品編號:${rowData[5]}`)
        // $('.bad_product_line').next().next().text(`產品編號:${product_name}`)
        $('.bad_product_work').text(`工單:${rowData[2]}`)
        $('.bad_product_work').next().text(`製程:${rowData[3]}`)

        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_servtrack_view_nomoveout',
            }),
          },
          {
            success: function (data) {
              const bad_products_code = data.filter(
                (i) =>
                  i.move_in.toFormatedDatetime() === rowData[0] &&
                  i.line_id === rowData[1] &&
                  i.work_id === rowData[2] &&
                  i.op === rowData[3]
              )
              const ng_code = ctx.preCon.ng_product_process.filter(
                (i) =>
                  i.process_code === bad_products_code[0].process_code &&
                  i.is_open === 'Y'
              )

              console.log(ng_code)
              $('#bad_product_div').show()
              if (ng_code.length !== 0) {
                ctx.outbound_process_code = ng_code[0].process_code
                let text = ''
                _.each(ng_code, (val) => {
                  const bad_product_info = `<div>
                  <span style="display:inline-flex;width:250px">${
                    val.ng_name
                  }(${val.ng_type == 1 ? '報廢' : '可維修'})</span>
                  <input
                    name="bad_product"
                    type="text"
                    style="width: 300px; display: initial; "
                    class="form-control"
                    data-ng_code='${val.ng_code}'
                  />
                </div>`

                  return (text += bad_product_info)
                })
                $('#bad_product_number').empty()
                $('#bad_product_number').append(
                  `<div
                style="
                  width: 35%;
                  display: flex;
                  justify-content: space-around;
                ">
                <span>原因</span>
                <span>數量</span>
                </div>` + text
                )
              }

              //--------------------
              $('#outbound_modal').modal('show')
            },
          }
        )
      })
      // $('[name=outbound_detail]').click(function () {})

      // 不良數modal
      $('#pick_bad').click(() => {
        $('#bad_product_modal').modal('show')
      })
      $('#bad_product_modal').on('hidden.bs.modal', () => {
        $('body').addClass('modal-open')
      })

      // 確認不良數 算出良品 不良
      $('#confirm_bad_product').click(() => {
        ctx.ng_products_obj = []
        ctx.ng_products_quantity = 0
        _.each($('[name=bad_product]'), (i) => {
          const bg_obj = {
            ng_code: i.dataset.ng_code,
            ng_quantity: i.value,
          }
          ctx.ng_products_obj.push(bg_obj)
          ctx.ng_products_quantity += Number(i.value)
          console.log(bg_obj)
        })
        $('#bad_product_go_quantity').text(
          `${
            Number($('#output').val()) - ctx.ng_products_quantity < 0
              ? 0
              : Number($('#output').val()) - ctx.ng_products_quantity
          }`
        )
        $('#bad_product_modal').modal('hide')
        $('#outbound_modal').addClass('modal-open')
      })

      //
      $('#output').change(function () {
        if (Number($('#output').val()) >= ctx.ng_products_quantity) {
          $('#bad_product_go_quantity').text(
            `${Number($('#output').val()) - ctx.ng_products_quantity}`
          )
        } else {
          $.smallBox({
            title: '產量不可小於不良品數',
            color: servkit.colors.red,
            iconSmall: 'fa fa-times',
            timeout: 4000,
          })
        }
      })

      // 點選不良返修checkbox 顯示輸入框
      $('#repair_checkbox').click(function () {
        const status = $(this).is(':checked')
        if (status) {
          const op_list = []
          const op = ctx.work_map.filter(
            (i) =>
              i.work_id === ctx.outboundRowdata[2] &&
              i.product_id === ctx.outboundRowdata[5] &&
              i.op === ctx.outboundRowdata[3]
          )
          if (op.length) {
            _.each(op, (val) => {
              op_list.push(`${val.op} ${val.process_code}`)
            })
          }
          servkit.initSelect2WithData($('[name= op_process]'), op_list, true, {
            minimumInputLength: 0,
            placeholder: i18n('Work_Order_Process'),
          })

          $('[name= repair_select]').show()
        } else {
          $('[name=repair_select]').hide()
        }
      })

      // 新增選項
      $('#repair').on('click', '.add_option', function () {
        $('#repair').append(`   <div
        name="repair_select"
        style="margin: 0 0 20px 30px;">
  
        <span>返修數</span>
        <input
          type="text"
          class="form-control"
          style="width: 100px; display: initial;padding-top:12px;"
        />
        <div style="width: 250px; display: inline-table;">
        <input name="op_process" type="hidden" class="full-width"> </input>
      </div>
      <button class="btn btn-primary stk-insert-btn hidden-xs hidden-sm add_option">
        <span class="fa fa-plus fa-lg">
        </span>
      </button>
        <button class="btn btn-danger stk-insert-btn hidden-xs hidden-sm remove_option"  >
          <span class="fa fa-times fa-lg">
          </span>
        </button>
      </div>`)

        const op_list = []

        const op = ctx.work_map.filter(
          (i) =>
            i.work_id === ctx.outboundRowdata[2] &&
            i.product_id === ctx.outboundRowdata[5] &&
            i.op === ctx.outboundRowdata[3]
        )
        const group_op = _.groupBy(ctx.work_map, 'work_id')
        console.log(group_op)
        if (op.length) {
          _.each(op, (val) => {
            op_list.push(`${val.op} ${val.process_code}`)
          })
        }
        const new_select = $(this).closest('div').next()[0]
        servkit.initSelect2WithData(
          $(new_select).find('input[type=hidden]'),
          op_list,
          true,
          {
            minimumInputLength: 0,
            placeholder: i18n('Work_Order_Process'),
          }
        )
      })
      //刪除選項行
      $('#repair').on('click', '.remove_option', function () {
        if ($('#repair').find('[name=repair_select]').length > 1) {
          $(this).closest('div').remove()
        }
      })

      // 送出製令
      $('#confirm_product_order').click(() => {
        // 不良返修拆批
        if ($('#repair_checkbox').is(':checked')) {
          const repair_info = []
          _.each($('[name=repair_select]'), (i) => {
            const arr = {}
            _.each($(i).find('input'), (val, key) => {
              if (key === 0 && val.value !== '') {
                arr.new_work_qty = val.value
              }
              if (key === 2 && val.value !== '') {
                const reg = /^.+\s/
                arr.op = reg.exec(val.value)[0].trim()
              }
            })
            repair_info.push(arr)
          })

          servkit.ajax(
            {
              url: 'api/yihcheng/split-batch/for-ng',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                work_id: ctx.outboundRowdata[2],
                op: ctx.outboundRowdata[3],
                lot_purpose: '2',
                op_list: repair_info,
              }),
            },
            {
              success: function (data) {
                console.log(data + '123')
              },
            }
          )

          console.log(repair_info)
        }

        // 部分拆批
        if ($('#part_unpacking').is(':checked')) {
          if (
            $('#same_unpacking').is(':checked') &&
            Number($('#same_unpacking_index').val()) > 0
          ) {
            const split_data = {
              new_work_qty: Number($('#same_unpacking_index').val()),
              work_id: ctx.outboundRowdata[2],
              lot_purpose: 3,
              op: ctx.outboundRowdata[3],
            }
            servkit.ajax(
              {
                url: 'api/yihcheng/split-batch',
                type: 'GET',
                contentType: 'application/json',
                data: split_data,
              },
              {
                success: function (data) {
                  console.log(data)
                },
              }
            )
          } else if (
            $('#next_unpacking').is(':checked') &&
            Number($('#next_unpacking_index').val()) > 0
          ) {
            const split_data = {
              new_work_qty: Number($('#next_unpacking_index').val()),
              work_id: ctx.outboundRowdata[2],
              lot_purpose: 4,
              op: ctx.outboundRowdata[3],
            }
            servkit.ajax(
              {
                url: 'api/yihcheng/split-batch',
                type: 'GET',
                contentType: 'application/json',
                data: split_data,
              },
              {
                success: function (data) {
                  console.log(data)
                },
              }
            )
          } else {
            $.smallBox({
              title: '拆批數量請填寫大於0的數字',
              color: servkit.colors.red,
              iconSmall: 'fa fa-times',
              timeout: 4000,
            })
          }
        }

        // 出站API發送
        servkit.ajax(
          {
            url: 'api/yihcheng/tracking/out',
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({
              move_in: ctx.outboundRowdata[0].replace(/\//g, '-'),
              line_id: ctx.outboundRowdata[1],
              work_id: ctx.outboundRowdata[2],
              op: ctx.outboundRowdata[3],
              process_code: ctx.outbound_process_code,
              qty_fai: $('#qty_fai').val(),
              output: $('#output').val(),
              ng_quantity_sum: String(ctx.ng_products_quantity),
              move_out: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
              create_by: 'admin',
              tracking_ng: ctx.ng_products_obj,
            }),
          },
          {
            success() {
              $.smallBox({
                title: '出站成功',
                color: '#2FA12F',
                iconSmall: 'fa fa-check',
                timeout: 4000,
              })

              // 顯示列印畫面

              servkit.ajax(
                {
                  url: 'api/getdata/db',
                  type: 'POST',
                  contentType: 'application/json',
                  data: JSON.stringify({
                    table: 'a_yihcheng_view_work_map',
                  }),
                },
                {
                  success: function (data) {
                    console.log(data)
                    const reg = new RegExp(`^${ctx.outboundRowdata[2]}`, 'g')
                    const work_tracking_data = data.filter(
                      (i) =>
                        i.work_id.match(reg) && i.op === ctx.outboundRowdata[3]
                    )
                    const process = `<button name='process' class='btn btn-primary'>${i18n(
                      'ServTrackManagement_000060'
                    )}</button>`
                    const print = `<button name='print' class='btn btn-primary'>${i18n(
                      'Print'
                    )}</button>`
                    const ans = []
                    _.each(work_tracking_data, (val) => {
                      let lot_purpose = '---'
                      if (val.lot_purpose == 1) {
                        lot_purpose = '生產前拆批'
                      } else if (val.lot_purpose == 2) {
                        lot_purpose = '不良返修'
                      } else if (val.lot_purpose == 3) {
                        lot_purpose = '部分出站(同工序)'
                      } else if (val.lot_purpose == 4) {
                        lot_purpose = '部分出站(次工序)'
                      }

                      const arr = [
                        val.work_id,
                        val.parent_id ?? '---',
                        val.product_id,
                        val.po,
                        val.po_item,
                        val.e_quantity,
                        val.op_start,
                        val.first_move_in.toFormatedDatetime() || '未開工',
                        lot_purpose,
                        process,
                        print,
                        val.input,
                      ]

                      return ans.push(arr)
                    })
                    ctx.printTable.drawTable(ans)
                    console.log(work_tracking_data)
                    $('#print_product_order').modal('show')
                  },
                }
              )
            },
          }
        )

        // 工序製程
        $('#print_product_order').on('click', '[name=process]', function () {
          const rowData = $(this.closest('tr')).data('row-data')

          console.log(rowData)
          $('#process_modal_work').text(rowData[0])
          $('#process_modal_product').text(rowData[2])
          $('#process_modal_output').text(rowData[5])
          $('#process_modal_initial_output').text(rowData[11])

          const process_filter = _.groupBy(ctx.work_map, 'work_id')

          const ans = []
          _.each(process_filter[rowData[0]], (val) => {
            const arr = [
              val.op || '---',
              val.process_code || '---',
              val.std_hour || '---',
              val.remark || '---',
            ]
            return ans.push(arr)
          })
          ctx.process_table.drawTable(ans)
          $('#modal-process').modal('show')
        })
      })

      // 起始畫面在出站
      $('#outbound_btn').click()

      //-------------------------------------------------------------------------------------
      // 切換功能時 按鍵變色
      // $('.btn_color').click(function () {
      //   const color = 'rgb(62, 144, 212)'
      //   if (color === $(this).css('background-color')) {
      //     $('.btn_color').siblings().css('background-color', color)
      //     $(this).css('background-color', 'darkblue')
      //   }
      // })

      // ctx.print_order()
    },
    util: {
      stopTable: '',
      outboundTable: '',
      printTable: '',
      process_table: '',
      stopRowData: '',
      invalid_id: '',
      user_name: '',
      invalid_status: '',
      groupedStopData: '',
      ng_products_obj: [],
      ng_products_quantity: 0,
      now_sequence: 0,
      outboundRowdata: '',
      outbound_process_code: '',
      work_map: '',
      inbound: function () {
        const ctx = this

        // 增加員工時 改變人數
        $('[name=Employee_ID]').change(function () {
          const employee_number = $(this).val().split(',')
          $('#Number_Of_People').text(
            $(this).val().length ? employee_number.length : 0
          )
        })
      },
      // 畫table
      stop: function (group_data) {
        const ctx = this
        const StopBtn = `<button style="width: 20rem;" class="btn btn-primary" name="stop_detail">${i18n(
          'Stop'
        )}</button>`
        const ResumeBtn = `<button style="width: 20rem;" class="btn btn-primary" name="resume_detail">${i18n(
          'Resume'
        )}</button>`
        const ans = []
        const stopData = group_data
        if (stopData.length > 0) {
          _.each(stopData, (val) => {
            const arr = [
              val.line_id,
              val.line_status === '1' ? '執行中' : '暫停中',
              val.invalid_text ?? '',
              val.line_status === '1' ? StopBtn : ResumeBtn,
            ]
            return ans.push(arr)
          })
        } else {
          $.smallBox({
            title: '無線別資料 請至進站作業新增',
            color: servkit.colors.red,
            iconSmall: 'fa fa-times',
            timeout: 4000,
          })
        }
        console.log(ans)
        ctx.stopTable.drawTable(ans)

        //點選暫停
        $('[name=stop_detail]').click(function (e) {
          e.preventDefault()
          // 填入資料 並顯示 modal
          const rowData = $(this.closest('tr')).data('row-data')
          ctx.stopRowData = rowData
          $('#stop_line_id').text('線別:' + rowData[0])
          $('#stop_suspension_modal').modal('show')
        })

        //點選故障原因btn並顯示填寫原因modal
        $('#stop_suspension_modal').on(
          'click',
          '[name=fault_description]',
          function () {
            $('#fault_title').text($(this).text())
            ctx.invalid_id = $(this).val()
            $('#fault_modal').modal('show')
          }
        )
      },
      //畫table
      outbound: function () {
        const ctx = this
        const btn = `<button style="width: 20rem;" class="btn btn-primary" name="outbound_detail">${i18n(
          'Outbound'
        )}</button>`
        const ans = []
        console.log(ctx.invalid_status)
        const invalid_line = _.pluck(
          ctx.invalid_status.filter((i) => i.line_status === '2'),
          'line_id'
        )

        servkit.ajax(
          {
            url: 'api/servtrack/tracking-no-move-out/find',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({}),
          },
          {
            success: function (data) {
              _.each(data, (val) => {
                if (invalid_line.length > 0) {
                  _.each(invalid_line, (i) => {
                    if (val.line_id === i) {
                      const arr = [
                        val.move_in.toFormatedDatetime(),
                        val.line_id,
                        val.work_id,
                        val.op,
                        '此線暫停中',
                        val.product_id,
                      ]
                      ans.push(arr)
                    } else {
                      const arr = [
                        val.move_in.toFormatedDatetime(),
                        val.line_id,
                        val.work_id,
                        val.op,
                        btn,
                        val.product_id,
                      ]
                      ans.push(arr)
                    }
                  })
                } else {
                  const arr = [
                    val.move_in.toFormatedDatetime(),
                    val.line_id,
                    val.work_id,
                    val.op,
                    btn,
                    val.product_id,
                  ]
                  ans.push(arr)
                }
              })
              ctx.outboundTable.drawTable(ans)
            },
          }
        )

        // $('#insert_row').hide()

        // 部份出站拆批radio
        $('#part_unpacking').click(function () {
          $('.unpacking').show()
        })

        // 正常出站radio
        $('#normal_outbound').click(function () {
          $('.unpacking').hide()
        })
      },
      // print_order: function () {
      //   $('#confirm_product_order').click(() => {
      //     $('#print_product_order').modal('show')
      //   })
      // },
      Update_invalid_data: function () {
        const ctx = this
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_yihcheng_invalid_line_status_log',
              columns: ['line_id', 'line_status', 'invalid_id', 'invalid_text'],
              whereClause: 'line_status_end IS NULL GROUP BY line_id',
            }),
          },
          {
            success: function (data) {
              ctx.invalid_status = data
              ctx.stop(data)
              ctx.outbound(data)
            },
          }
        )
      },
    },
    preCondition: {
      shift_time: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_yihcheng_line_shift_time',
            }),
          },
          {
            success: function (data) {
              done(data)
            },
          }
        )
      },
      employee: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_yihcheng_employee',
            }),
          },
          {
            success: function (data) {
              const IDandName = []
              _.each(data, (val) => {
                return IDandName.push(`${val.emp_id} ${val.emp_name}`)
              })
              // const emp_id = _.uniq(_.pluck(data, 'emp_id'))
              servkit.initSelect2WithData(
                $('[name=Employee_ID]'),
                IDandName,
                true,
                {
                  minimumInputLength: 0,
                  allowClear: true,
                  placeholder: i18n('Employee_ID'),
                  multiple: true,
                }
              )
              done(data)
            },
          }
        )
      },
      work_tracking_detail: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_servtrack_view_tracking_detail',
            }),
          },
          {
            success: function (data) {
              done(data)
            },
          }
        )
      },
      // not_outbound_data: function (done) {
      //   servkit.ajax(
      //     {
      //       url: 'api/servtrack/tracking-no-move-out/find',
      //       type: 'POST',
      //       contentType: 'application/json',
      //       data: JSON.stringify({}),
      //     },
      //     {
      //       success: function (data) {
      //         done(data)
      //       },
      //     }
      //   )
      // },
      work_map: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_yihcheng_view_work_map',
              // columns: ['work_id', 'product_id', 'op', 'process_code'],
            }),
          },
          {
            success: function (data) {
              const ctx = this
              ctx.work_map = data
              done(data)
            },
          }
        )
      },
      ng_products: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_yihcheng_view_work_tracking_ng_process_ng',
            }),
          },
          {
            success: function (data) {
              done(data)
            },
          }
        )
      },
      ng_product_process: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: ' a_servtrack_view_processng',
            }),
          },
          {
            success: function (data) {
              console.log(data)
              done(data)
            },
          }
        )
      },
      work_nomoveout: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_servtrack_view_nomoveout',
            }),
          },
          {
            success: function (data) {
              console.log(data)
              done(data)
            },
          }
        )
      },
      // user: function (done) {
      //   servkit.ajax(
      //     {
      //       url: 'api/user/read',
      //       type: 'GET',
      //       contentType: 'application/json',
      //     },
      //     {
      //       success: function (data) {
      //         console.log(data)
      //         done(data)
      //       },
      //     }
      //   )
      // },
    },
    dependencies: [
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
      ['/js/plugin/select2/select2.min.js'],
    ],
  })
}
