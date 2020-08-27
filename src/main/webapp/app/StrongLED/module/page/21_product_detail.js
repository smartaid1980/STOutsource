import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      console.log('hi')

      var callback = null

      // init 群組權限
      servkit.initSelectWithList(
        context.preCon.getUserName,
        $('select[name="create_by"]')
      )
      servkit.initDatePicker($('.date'), null, false, false)
      context.commons.initValidationSetting()
      window.rfqform = context.rfqForm = context.commons.createRfqForm(
        context.preCon.rfqColumnConfig,
        '#custom-rfq-column'
      )
      context.rfqForm.columnsMap['series'].toggleDisable(true)
      context.rfqForm.columnsMap['model_number'].toggleDisable(true)
      window.rfqview = context.rfqView = context.commons.createRfqView(
        context.preCon.rfqColumnConfig,
        '#custom-rfq-column-view'
      )
      context.commons.initRfqForm(
        context,
        '#custom-rfq-column',
        context.rfqForm
      )

      // init 詢價單內容
      $('#demand-list-information-widget footer #submit-demand-list')
        .text(`${i18n('Store')}`)
        .data('is-edit', true)
        .hide()

      $('#demand-list-information-widget footer')
        .find('#cancel-edit-demand-list')
        .hide()
        .end()
        // 送出
        .on('click', '#submit-demand-list', function (evt) {
          let $submitBtn = $(this)
          evt.preventDefault()
          context.saveDemandListData($submitBtn)
        })
        // 編輯
        .on('click', '#edit-demand-list', function (evt) {
          let $editBtn = $(this),
            $cancelBtn = $editBtn.next(),
            $submitBtn = $editBtn.prev()

          context.renderDemandListData(true)
          $('#rfq-detail').addClass('editable')

          $cancelBtn.show()
          $editBtn.hide()
          $submitBtn.show()
        })
        // 取消編輯
        .on('click', '#cancel-edit-demand-list', function (evt) {
          let $cancelBtn = $(this),
            $editBtn = $cancelBtn.prev(),
            $submitBtn = $editBtn.prev()

          $('#rfq-detail').removeClass('editable')
          $cancelBtn.hide()
          $editBtn.show()
          $submitBtn.hide()
        })

      // 進入頁面即載入詢價單內容
      context.getDemandListData(callback)

      // init 物料資訊表格
      context.initMaterialTable()

      // 回上一頁，帶回查詢條件
      context.$leaveBtn.on('click', function () {
        var lang = servkit.getCookie('lang')
        window.location =
          '#app/StrongLED/function/' + lang + '/20_product_management.html'
      })
    },
    util: {
      rfqContent: null,
      $matchedRfqTable: null,
      rfqMaterialTable: null,
      existingMaterialTable: null,
      materialList: null,
      requestDiscountHistoryTable: null,
      quoteHistoryTable: null,
      deleteSavedIds: [],
      form_id: servkit.getURLParameter('formId'),
      status: servkit.getURLParameter('status'),
      quote_status: null,
      $leaveBtn: $('#leave-btn'),
      $marketCoef: $('#market-coef'),
      $produceCoef: $('#produce-coef'),
      $mtlCost: $('#mtl-cost'),
      canSubmitMaterialList: false,
      groupAuth: {},
      // 物料資訊
      initMaterialTable: function () {
        let ctx = this,
          status = ctx.status,
          delBtnHtml = `<button class="btn btn-danger" id="delete-material" title="delete"><span class="fa fa-trash-o fa-lg"></span> ${i18n(
            'Delete'
          )}</button>`,
          addBtnHtml = `<div id="add-material" class="btn-group">
                    <button class="btn dropdown-toggle btn-success" data-toggle="dropdown" title="add">
                        <span class='fa fa-plus fa-lg'></span> ${i18n(
                          'New'
                        )} <i class="fa fa-caret-down"></i>
                    </button>
                    <ul class="dropdown-menu">
                      <li>
                        <a id="add-mat" style="cursor: pointer;" data-toggle="modal" data-target="#material-management-modal-widget">${i18n(
                          'New_Material'
                        )}</a>
                      </li>
                      <li>
                        <a id="add-existing-mat" style="cursor: pointer;" data-toggle="modal" data-target="#existing-material-modal-widget">${i18n(
                          'Add_Existing_Materials'
                        )}</a>
                      </li>
                    </ul>
                  </div>`,
          refreshBtnHtml = `<button class="btn btn-primary" id="refresh-material" title="Refresh"><span class="fa fa-refresh fa-lg"></span> ${i18n(
            'Reforming'
          )}</button>`

        // init reportTable
        // 綁新增物料事件
        ctx.rfqMaterialTable = createReportTable({
          $tableElement: $('#rfq-material'),
          $tableWidget: $('#material-information-widget'),
          showNoData: false,
          checkbox: true,
          customBtns: [delBtnHtml, addBtnHtml, refreshBtnHtml],
          onRow: function (row, data) {
            let isSaved = data[10]
            // console.log(isSaved)
            $(row).addClass('read')

            $(row)
              .find('td')
              .eq(11)
              .html(
                `<button class="btn btn-xs btn-primary edit-material" title="edit" ${
                  isSaved ? '' : 'disabled'
                }><span class="fa fa-pencil"></span></button>
              <button class="btn btn-xs btn-success update-material" title="update"><i class="fa fa-save"></i></button>`
              )
              .end()
              .eq(0)
              .append(
                `<button class='btn btn-xs btn-danger cancel-material' title='Cancel'><i class='fa fa-times'></i></button>`
              )
          },
        })

        ctx.initExistingMaterialTable()

        // disable input按enter就submit
        $('#rfq-material').on('keydown', 'input', function (e) {
          if (e.keyCode === 13) {
            $(this).change()
            e.preventDefault()
          }
        })

        // 進入頁面即載入merge的物料資訊
        ctx.getRfqMaterial(() => ctx.drawMaterialTable())

        // modal出現前清空表格
        $('#material-management-modal-widget').on('show.bs.modal', function () {
          $(this)
            .find('.form-control')
            .each((i, el) => $(el).val(''))
        })
        // modal出現前使勾選項目內外一致
        $('#existing-material-modal-widget').on('show.bs.modal', function () {
          ctx.existingMaterialTable.table
            .rows()
            .nodes()
            .to$()
            .each((i, row) => {
              let checkbox = $(row).find(':checkbox'),
                mtl_id = $(row).find('td').eq(1).text()
              if (ctx.materialList[mtl_id]) {
                checkbox.prop('checked', true)
                // if (ctx.materialList[mtl_id].isSaved) checkbox.prop('disabled', true)
              } else checkbox.prop('checked', false)
            })
        })

        // init validate rules
        $.validator.addMethod(
          'stdQtyRequired',
          $.validator.methods.required,
          '請填標準用量'
        )
        $.validator.addMethod(
          'taxedPriceRequired',
          $.validator.methods.required,
          '請填含稅單價'
        )
        $.validator.addMethod('cNumber', $.validator.methods.number, '請填數字')
        $.validator.addClassRules('validate-std-qty', {
          stdQtyRequired: true,
          cNumber: true,
        })
        $.validator.addClassRules('validate-taxed-price', {
          taxedPriceRequired: true,
          cNumber: true,
        })

        // 計算各物料小計
        $('#rfq-material').on('change', 'tbody .form-control', function (e) {
          let name = this.name,
            taxed_price,
            std_qty
          switch (name) {
            case 'taxed_price':
              taxed_price = parseFloat($(this).val() || 0)
              std_qty = parseFloat(
                $(this).parents('td').prev().find('input').val() || 0
              )
              $(this)
                .parents('td')
                .next()
                .text((taxed_price * std_qty).toFixed(4))
              break
            case 'std_qty':
              std_qty = parseFloat($(this).val() || 0)
              taxed_price = parseFloat(
                $(this).parents('td').next().find('input').val() || 0
              )
              $(this)
                .parents('td')
                .next()
                .next()
                .text((taxed_price * std_qty).toFixed(4))
              break
          }
        })

        // 新建物料
        $('#add-material-btn').on('click', function (e) {
          let mtl_id = new Date().getTime().toString(),
            formData = {
              newMat: true,
              isSaved: false,
              mtl_id,
            }

          $('#material-management-modal-widget .modal-body .form-control').each(
            (i, el) => {
              formData[el.name] = el.value
            }
          )
          console.log(formData)

          // 跟已選的物料和已填的用量merge
          let rows = Array.from(ctx.rfqMaterialTable.table.rows().nodes()),
            origTableData = rows.reduce((a, el) => {
              let $tds = $(el).find('td'),
                mtl_id = $tds.eq(1).text(), // 有checkbox所以index++
                std_qty = $tds.eq(8).find('input').val(),
                taxed_price = $tds.eq(9).find('input').val()
              a[mtl_id] = {
                std_qty,
                taxed_price,
              }
              // if (std_qty) a[mtl_id] = std_qty // 此次新增的材料而且空格內已有填數字時才紀錄
              // if (taxed_price) a[mtl_id] = std_qty // 此次新增的材料而且空格內已有填數字時才紀錄
              return a
            }, {})

          // console.log(origTableData)
          for (var id in origTableData) {
            if (origTableData[id].std_qty)
              ctx.materialList[id].std_qty = origTableData[id].std_qty
            if (origTableData[id].taxed_price)
              ctx.materialList[id].taxed_price = origTableData[id].taxed_price
          }
          ctx.materialList[mtl_id] = formData

          $('#material-save-btn').prop('disabled', false)
          ctx.canSubmitMaterialList = false
          ctx.drawMaterialTable()
          $('#material-management-modal-widget').modal('hide')
        })

        // reportTable內各個btn event
        $('#material-information-widget')
          // 刪除物料
          .on('click', '#delete-material', function (e) {
            let datas = ctx.rfqMaterialTable.getSelectedRow(),
              hasSavedData = false,
              deleteIds = datas.map((data) => {
                hasSavedData = data[10] || hasSavedData
                return {
                  id: data[0],
                  saved: data[10],
                }
              })

            // 跟已選的物料和已填的用量merge
            let rows = Array.from(ctx.rfqMaterialTable.table.rows().nodes()),
              origTableData = rows.reduce((a, el) => {
                let $tds = $(el).find('td'),
                  mtl_id = $tds.eq(1).text(), // 有checkbox所以index++
                  std_qty = $tds.eq(8).find('input').val(),
                  taxed_price = $tds.eq(9).find('input').val()
                a[mtl_id] = {
                  std_qty,
                  taxed_price,
                }
                // if (std_qty) a[mtl_id] = std_qty // 此次新增的材料而且空格內已有填數字時才紀錄
                // if (taxed_price) a[mtl_id] = std_qty // 此次新增的材料而且空格內已有填數字時才紀錄
                return a
              }, {})

            // console.log(origTableData)
            for (var id in origTableData) {
              if (origTableData[id].std_qty)
                ctx.materialList[id].std_qty = origTableData[id].std_qty
              if (origTableData[id].taxed_price)
                ctx.materialList[id].taxed_price = origTableData[id].taxed_price
            }
            console.log(datas)
            if (deleteIds.length) {
              console.log(deleteIds)
              ctx.materialList = _.omit(ctx.materialList, (value, key) =>
                _.pluck(deleteIds, 'id').includes(key)
              )
              ctx.deleteSavedIds = _.union(
                ctx.deleteSavedIds,
                deleteIds.filter((id) => id.saved).map((id) => id.id)
              )
              ctx.drawMaterialTable()
              // 還未儲存的 或 有編輯過的物料就不能submit
              ctx.canSubmitMaterialList =
                Object.values(ctx.materialList).findIndex(
                  (mat) => !mat.isSaved || mat.isUpdate
                ) < 0

              $('#material-save-btn').prop(
                'disabled',
                ctx.deleteSavedIds.length ? false : ctx.canSubmitMaterialList
              )
            }
          })
          // 重整
          .on('click', '#refresh-material', function (e) {
            $(this).find('.fa-refresh').addClass('fa-spin')

            ctx.deleteSavedIds.length = 0

            ctx.getRfqMaterial(() => {
              ctx.drawMaterialTable()
              setTimeout(
                () => $(this).find('.fa-refresh').removeClass('fa-spin'),
                500
              )
            })
          })
          // 編輯
          .on('click', '.edit-material', function (e) {
            console.log(e.target)
            let $tr = $(this).parents('tr'),
              $std_qty = $tr.find('td').eq(8),
              $taxed_price = $tr.find('td').eq(9),
              orig_std_qty = $std_qty.text(),
              orig_taxed_price = $taxed_price.text()

            $std_qty.html(
              `<form><input class="form-control full-width validate-std-qty" name="std_qty" type="text" value="${orig_std_qty}" data-orig="${orig_std_qty}" /></form>`
            )
            $taxed_price.html(
              `<form><input class="form-control full-width validate-taxed-price" name="taxed_price" type="text" value="${orig_taxed_price}" data-orig="${orig_taxed_price}" /></form>`
            )
            $tr.addClass('edit').removeClass('read')
            ctx.disableFeature(true, $('#rfq-material'))
          })
          // 儲存
          .on('click', '.update-material', function (e) {
            console.log(e.target)
            let $tr = $(this).parents('tr'),
              $std_qty = $tr.find('td').eq(8),
              $taxed_price = $tr.find('td').eq(9),
              std_qty = $std_qty.find('input').val(),
              taxed_price = $taxed_price.find('input').val(),
              form_id = $tr.find('td').eq(1).text()

            if (
              !$std_qty.find('form').validate().form() ||
              !$taxed_price.find('form').validate().form()
            )
              return

            ctx.materialList[form_id].std_qty = parseFloat(std_qty)
            ctx.materialList[form_id].taxed_price = parseFloat(taxed_price)
            ctx.materialList[form_id].isUpdate = true
            $std_qty.html(std_qty)
            $taxed_price.html(taxed_price)
            console.log(ctx.materialList)
            $tr.removeClass('edit').addClass('read')
            ctx.disableFeature(false, $('#rfq-material'))
            ctx.canSubmitMaterialList = false

            $('#material-save-btn').prop('disabled', false)
          })
          // 取消
          .on('click', '.cancel-material', function (e) {
            console.log(e.target)
            let $tr = $(this).parents('tr'),
              $std_qty = $tr.find('td').eq(8),
              $taxed_price = $tr.find('td').eq(9),
              orig_std_qty = $std_qty.find('input').data('orig'),
              orig_taxed_price = $taxed_price.find('input').data('orig')
            $std_qty.html(orig_std_qty)
            $taxed_price.html(orig_taxed_price)

            let total = parseFloat(orig_std_qty) * parseFloat(orig_taxed_price)

            $taxed_price.next().text(total.toFixed(4))

            $tr.removeClass('edit').addClass('read')
            ctx.disableFeature(false, $('#rfq-material'))
          })

        // // 送出按鈕
        // $('#material-confirm-btn').on('click', (e) => ctx.submitMaterialList())
        // 儲存按鈕
        $('#material-save-btn').on('click', (e) => ctx.saveMaterialList())
      },
      // 暫存編輯結果
      saveMaterialList: function () {
        let context = this

        let reportTable = context.rfqMaterialTable.table,
          mtl_id,
          std_qty,
          taxed_price,
          $row,
          $tds,
          $input

        // 驗證表格
        let isValid = context.validateColumn(reportTable)
        if (!isValid) return alert(`${i18n('Form_Is_Not_Completed')}`)

        // 將已填的std_qty, taxed_price寫回context.materialList
        reportTable
          .rows()
          .nodes()
          .to$()
          .each((i, el) => {
            $row = $(el)
            $tds = $row.find('td')
            $input = $tds.eq(8).find('input')
            std_qty = $input.length ? $input.val() : $tds.eq(8).text()
            $input = $tds.eq(9).find('input')
            taxed_price = $input.length ? $input.val() : $tds.eq(9).text()
            mtl_id = $tds.eq(1).text()
            if (std_qty) {
              context.materialList[mtl_id].std_qty = parseFloat(std_qty)
            }
            if (taxed_price) {
              context.materialList[mtl_id].taxed_price = parseFloat(taxed_price)
            }
          })

        let requestBody = {
            form_id: context.form_id,
            new_mtl: [],
            old_mtl: [],
            del_mtl: context.deleteSavedIds.slice(),
            update_mtl: [],
          },
          hasNewMat = false

        for (var mat in context.materialList) {
          // 編輯過的
          if (context.materialList[mat].isUpdate)
            requestBody.update_mtl.push(
              _.pick(context.materialList[mat], [
                'form_id',
                'mtl_id',
                'std_qty',
                'taxed_price',
              ])
            )
          // 新增全新物料
          else if (context.materialList[mat].newMat) {
            requestBody.new_mtl.push(context.materialList[mat])
            hasNewMat = true
          }
          // 新增已建檔的物料
          else if (!context.materialList[mat].isSaved)
            requestBody.old_mtl.push(context.materialList[mat])
        }
        // return console.log(requestBody)

        servkit.ajax(
          {
            url: 'api/strongled/savebomlist',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(requestBody),
          },
          {
            success: function (data) {
              $('#material-save-btn').prop('disabled', true)
              context.deleteSavedIds.length = 0
              $('#refresh-material').click()
              if (hasNewMat) context.initExistingMaterialTable()
            },
          }
        )
      },
      // 編輯模式時disable其他功能
      disableFeature: function (disabled, $table) {
        // sort
        $table
          .find('thead > tr:first-child .form-control')
          .attr('disabled', disabled)
        // checkbox
        $table.find(':checkbox').attr('disabled', disabled)
        // footer
        $table
          .parent()
          .find(".dt-toolbar input[type='search'], .dt-toolbar-footer select")
          .attr('disabled', disabled)
        // btns, except save & cancel
        $table
          .parent()
          .parent()
          .find('.btn:not(.cancel-material, .update-material)')
          .each((i, el) => {
            let $el = $(el)
            if (disabled) {
              $el.data('disabled', $el.prop('disabled'))
              $el.attr('disabled', true)
            } else {
              $el.attr('disabled', $el.data('disabled'))
            }
          })
        // pagination
        $table
          .parent()
          .find('.dt-toolbar-footer > div:last-child')
          .css({
            visibility: disabled ? 'hidden' : 'visible',
          })
      },
      // 畫物料資訊的表(根據context.materialList)
      drawMaterialTable: function () {
        let context = this,
          stdQty = function (isSaved, std_qty) {
            let input = `<form>
                <input type="text" name="std_qty" 
                  class="form-control full-width validate-std-qty" 
                  value="${std_qty || ''}" />
                </form>`
            return isSaved ? std_qty || '' : input
          },
          taxed_price = function (isSaved, taxed_price) {
            let input = `<form>
                <input type="text" name="taxed_price" 
                  class="form-control full-width validate-taxed-price" 
                  value="${taxed_price || ''}"/>
                </form>`
            return isSaved ? taxed_price || '' : input
          }

        context.rfqMaterialTable.drawTable(
          Object.values(context.materialList).map((d) => [
            d.mtl_id || '',
            d.mtl_name || '',
            d.mtl_type || '',
            d.spec || '',
            d.unit || '',
            d.remark || '',
            d.process || '',
            stdQty(d.isSaved, d.std_qty),
            taxed_price(d.isSaved, d.taxed_price),
            ((d.std_qty || 0) * (d.taxed_price || 0)).toFixed(4),
            d.isSaved && d.taxed_price !== undefined,
          ])
        )
      },
      // 取得此詢價單的物料
      getRfqMaterial: function (callback) {
        let context = this,
          hasEmptyValue = false

        servkit.ajax(
          {
            url: 'api/strongled/rfqmaterial',
            type: 'GET',
            data: {
              form_id: context.form_id,
            },
          },
          {
            success: function (data) {
              context.materialList = data.reduce((a, x) => {
                hasEmptyValue =
                  x.std_qty === undefined ||
                  x.taxed_price === undefined ||
                  hasEmptyValue
                a[x.mtl_id] = _.extend(x, { isSaved: true })
                return a
              }, {})
              context.canSubmitMaterialList = !hasEmptyValue

              $('#material-save-btn').prop(
                'disabled',
                !data.length || !hasEmptyValue
              )

              // console.log(context.materialList)
              if (callback) callback()
            },
          }
        )
      },
      // 新增現有物料
      initExistingMaterialTable: function () {
        let context = this

        if (!context.existingMaterialTable) {
          context.existingMaterialTable = createReportTable({
            $tableElement: $('#existing-material-list'),
            checkbox: true,
          })

          // 新增按鈕
          $('#existing-material-modal-widget #add-existing-material-btn').on(
            'click',
            function (e) {
              let rowData = context.existingMaterialTable.getSelectedRow()
              // console.log(rowData)
              if (rowData) {
                // merge已選物料和新增的
                if (!context.materialList) context.materialList = {}
                context.materialList = _.extend(
                  rowData.reduce((a, x) => {
                    if (!a[x[0]]) {
                      a[x[0]] = {
                        mtl_id: x[0],
                        mtl_name: x[1],
                        mtl_type: x[2],
                        spec: x[3],
                        unit: x[4],
                        remark: x[5],
                        process: x[6],
                        isSaved: false,
                      }
                    }
                    return a
                  }, {}),
                  context.materialList
                )

                // materialList extend 新增物料中已填入的std_qty
                let rows = Array.from(
                    context.rfqMaterialTable.table.rows().nodes()
                  ),
                  origTableData

                if (context.rfqMaterialTable.table.data().length) {
                  origTableData = rows.reduce((a, el) => {
                    let $tds = $(el).find('td'),
                      mtl_id = $tds.eq(1).text(), // 有checkbox所以index++
                      std_qty = $tds.eq(8).find('input').val(),
                      taxed_price = $tds.eq(9).find('input').val()
                    a[mtl_id] = {
                      std_qty,
                      taxed_price,
                    }
                    // if (std_qty) a[mtl_id] = std_qty // 此次新增的材料而且空格內已有填數字時才紀錄
                    // if (taxed_price) a[mtl_id] = std_qty // 此次新增的材料而且空格內已有填數字時才紀錄
                    return a
                  }, {})

                  // console.log(origTableData)
                  for (var mtl_id in origTableData) {
                    if (origTableData[mtl_id].std_qty)
                      context.materialList[mtl_id].std_qty =
                        origTableData[mtl_id].std_qty
                    if (origTableData[mtl_id].taxed_price)
                      context.materialList[mtl_id].taxed_price =
                        origTableData[mtl_id].taxed_price
                  }
                }

                $('#material-save-btn').prop('disabled', false)

                // drawTable
                context.drawMaterialTable()

                $('#existing-material-modal-widget').modal('hide')
              }
            }
          )
        }
        servkit.ajax(
          {
            url: 'api/stdcrud',
            type: 'GET',
            data: {
              tableModel:
                'com.servtech.servcloud.app.model.strongLED.MaterialList',
            },
          },
          {
            success: function (materialList) {
              context.existingMaterialTable.drawTable(
                materialList.map((mat) => [
                  mat.mtl_id || '',
                  mat.mtl_name || '',
                  mat.mtl_type || '',
                  mat.spec || '',
                  mat.unit || '',
                  mat.remark || '',
                  mat.process || '',
                ])
              )
            },
          }
        )
      },
      // validate reportTable
      validateColumn: function (reportTable) {
        let isValid = true,
          currPage = reportTable.page.info().page,
          totalpages = reportTable.page.info().pages

        reportTable
          .rows({ page: 'current' })
          .nodes()
          .to$()
          .find('form')
          .each((i, el) => {
            isValid = $(el).validate().form() && isValid
            // console.log(isValid)
          })
        if (!isValid) return false

        // validate forms at the other pages, validation goes whole page a time, page will stop while not passing the valiation at the first time.
        for (var k = 0; k < totalpages; k++) {
          if (k !== currPage && isValid) {
            reportTable.page(k).draw(false)
            reportTable
              .column(7, { page: 'current' })
              .nodes()
              .to$()
              .find('form')
              .each((i, el) => {
                // console.log(el);
                isValid = $(el).validate().form() && isValid
              })
            reportTable
              .column(8, { page: 'current' })
              .nodes()
              .to$()
              .find('form')
              .each((i, el) => {
                // console.log(el);
                isValid = $(el).validate().form() && isValid
              })
          }
          if (!isValid) return false
        }
        return true
      },

      // 查詢價單內容
      getDemandListData: function (callback) {
        var context = this
        servkit.ajax(
          {
            url: 'api/strongled/wholerfq',
            type: 'GET',
            data: {
              form_id: context.form_id,
            },
          },
          {
            success: function (data) {
              context.rfqContent = data
              context.renderDemandListData()
              if (callback) callback()
            },
          }
        )
      },
      // 顯示詢價單內容
      renderDemandListData: function (isEditMode) {
        let column,
          $el,
          value,
          user_name,
          context = this,
          formTypeMap = {
            2: `${i18n('Inquiry_Order')}`,
          }

        if (isEditMode) {
          $(
            '#rfq-detail-edit>fieldset:not([id=custom-rfq-column]) .value'
          ).each((i, el) => {
            $el = $(el)
            column = $el.find('.form-control')[0].name
            switch (column) {
              case 'create_time':
              case 'close_time':
                value = context.rfqContent[column]
                  ? moment(new Date(context.rfqContent[column])).format(
                      'YYYY/MM/DD HH:mm:ss'
                    )
                  : ''
                break
              case 'st_lead_time':
              case 'st_po_time':
                value = context.rfqContent[column]
                  ? moment(context.rfqContent[column], 'MMM DD, YYYY').format(
                      'YYYY/MM/DD'
                    )
                  : ''
                break
              case 'form_type':
                value = '2'
                break
              case 'reason':
                value = ''
                break
              default:
                value = context.rfqContent[column]
                break
            }
            $el.find('.form-control').val(value === undefined ? '' : value)
          })
          context.rfqForm.setValue(context.rfqContent)
        } else {
          let lampTypeMap = {
            '0': '点光源',
            '1': '一般灯',
          }
          $(
            '#rfq-detail-view fieldset:visible:not(#custom-rfq-column-view) .value'
          ).each((i, el) => {
            $el = $(el)
            column = $el.data('column')
            switch (column) {
              case 'create_time':
              case 'close_time':
                value = context.rfqContent[column]
                  ? moment(new Date(context.rfqContent[column])).format(
                      'YYYY/MM/DD HH:mm:ss'
                    )
                  : ''
                break
              case 'st_lead_time':
              case 'st_po_time':
                value = context.rfqContent[column]
                  ? moment(context.rfqContent[column], 'MMM DD, YYYY').format(
                      'YYYY/MM/DD'
                    )
                  : ''
                break
              case 'form_type':
                value =
                  formTypeMap[context.rfqContent[column]] ||
                  `${i18n('Inquiry_Order')}`
                break
              case 'create_by':
                user_name =
                  context.preCon.getUserName[context.rfqContent[column]]
                value = user_name ? user_name : context.rfqContent[column]
                break
              default:
                value = context.rfqContent[column]
                break
            }

            $el.text(value === undefined ? '' : value)
          })
          context.rfqView.setValue(
            _.extend(
              { lamp_type: lampTypeMap[context.rfqContent['lamp_type']] },
              context.rfqContent
            )
          )
        }
      },
      // 儲存詢價單內容
      saveDemandListData: function ($submitBtn) {
        let context = this,
          formData = {
            is_log: true,
            form_id: context.form_id,
          },
          $editBtn = $submitBtn.next(),
          $cancelBtn = $editBtn.next()

        context.validator = $('#rfq-detail').validate({
          errorPlacement: function (error, $el) {
            $el.closest('.value').append(error)
          },
        })
        if (!context.validator.form())
          return alert(`${i18n('Form_Is_Not_Completed')}`)
        formData = _.extend(context.getRfqFormValue(), formData)
        formData.po_qty = parseFloat(formData.po_qty).toFixed(3)
        _.each(
          context.preCon.getSeriesData[context.rfqContent.series][
            context.rfqContent.model_number
          ],
          (value, key) => {
            if (key !== 'order') {
              if (!formData[key]) formData[key] = null
            }
          }
        )

        // UPDATE InquiryContent
        servkit.ajax(
          {
            url: 'api/strongled/saverfq',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
          },
          {
            success: function (data) {
              context.getDemandListData()
              $('#rfq-detail').removeClass('editable')
              $submitBtn.data('is-edit', false).text(`${i18n('Send_Out')}`)
              $editBtn.show()
              $cancelBtn.hide()
            },
          }
        )
      },
    },
    preCondition: {
      getUserName: function (done) {
        servkit.ajax(
          {
            url: 'api/user/read',
            type: 'GET',
            data: {
              tableModel: 'com.servtech.servcloud.module.model.SysUser',
            },
          },
          {
            success: function (data) {
              var userData = {}
              _.each(data, (elem) => {
                userData[elem.user_id] = elem.user_name
              })
              done(userData)
            },
          }
        )
      },
      getSeriesData: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_strongled_rfq_columns',
              columns: ['series', 'model', 'content'],
            }),
          },
          {
            success: function (data) {
              var seriesData = {}
              _.each(data, (val) => {
                if (!seriesData[val.series]) {
                  seriesData[val.series] = {}
                }
                seriesData[val.series][val.model] = JSON.parse(val.content)
              })
              done(seriesData)
            },
          }
        )
      },
      lightAngleMap: function (done) {
        $.get(
          './app/StrongLED/data/lightAngleMap.json?' + new Date().getTime(),
          (res) => {
            done(res)
          }
        )
      },
      rfqColumnConfig: function (done) {
        $.get(
          './app/StrongLED/data/rfqColumnConfig.json?' + new Date().getTime(),
          (res) => {
            done(res)
          }
        )
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
