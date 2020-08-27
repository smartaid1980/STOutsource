import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function gogo(context) {
      console.log('hi')
      servkit.initSelectWithList(
        Object.keys(context.preCon.module),
        $('#module-select'),
        false
      )
      $('#submit-btn').on('click', function (e) {
        e.preventDefault()
        context.module_id = $('#module-select').val()
        context.getModuleMaterial(() => context.drawMaterialTable())
      })

      context.initMaterialTable()
    },
    util: {
      moduleMaterialTable: null,
      existingMaterialTable: null,
      moduleMaterialList: null,
      deleteSavedIds: [],
      getModuleMaterial: function (callBack) {
        let context = this
        servkit.ajax(
          {
            url: 'api/strongled/getmodulematerial',
            type: 'GET',
            data: {
              module_id: context.module_id,
            },
          },
          {
            success: function (data) {
              context.moduleMaterialList = _.reduce(
                data.map((x) => _.extend(x, { isSaved: true })),
                (a, value) => {
                  a[value.mtl_id] = value
                  return a
                },
                {}
              )
              if (callBack) callBack()
            },
          }
        )
      },
      // 物料資訊
      initMaterialTable: function () {
        let context = this,
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
        context.moduleMaterialTable = createReportTable({
          $tableElement: $('#module-material'),
          $tableWidget: $('#material-information-widget'),
          showNoData: false,
          checkbox: true,
          customBtns: [delBtnHtml, addBtnHtml, refreshBtnHtml],
          onRow: function (row, data) {
            let isSaved = data[6],
              $tds = $(row).find('td'),
              $tdEdit = $tds.eq(7)
            $(row).addClass('read')

            $tdEdit
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
        context.initExistingMaterialTable()

        // disable input按enter就submit
        $('#module-material').on('keydown', 'input', function (e) {
          if (e.keyCode === 13) {
            $(this).change()
            e.preventDefault()
          }
        })

        // modal出現前清空表格
        $('#material-management-modal-widget').on('show.bs.modal', function () {
          $(this)
            .find('.form-control')
            .each((i, el) => $(el).val(''))
        })
        // modal出現前使勾選項目內外一致
        $('#existing-material-modal-widget').on('show.bs.modal', function () {
          context.existingMaterialTable.table
            .rows()
            .nodes()
            .to$()
            .each((i, row) => {
              let $nRow = $(row),
                $checkbox = $nRow.find(':checkbox'),
                mtl_id = $nRow.find('td').eq(1).text(),
                isChecked = Object.prototype.hasOwnProperty.call(
                  context.moduleMaterialList,
                  mtl_id
                )
              if ($nRow.find('td:first-child > input:checkbox').length === 0) {
                // 填入每列第一欄的 checkbox
                $checkbox = $('<input type="checkbox" />')
                $nRow.prepend($checkbox)
                $checkbox.wrap('<td></td>')
                mtl_id = $nRow.find('td').eq(1).text()
                isChecked = Object.prototype.hasOwnProperty.call(
                  context.moduleMaterialList,
                  mtl_id
                )
              }
              $checkbox.prop('checked', isChecked).prop('disabled', isChecked)
            })
        })

        // init validate rules
        $.validator.addMethod(
          'stdQtyRequired',
          $.validator.methods.required,
          '請填標準用量'
        )
        $.validator.addMethod('cNumber', $.validator.methods.number, '請填數字')
        $.validator.addClassRules('validate-std-qty', {
          stdQtyRequired: true,
          cNumber: true,
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
          let rows = Array.from(
              context.moduleMaterialTable.table.rows().nodes()
            ),
            origTableData = rows.reduce((a, el) => {
              let $tds = $(el).find('td'),
                mtl_id = $tds.eq(1).text(),
                std_qty = $tds.eq(6).find('input').val()
              if (std_qty) a[mtl_id] = std_qty
              return a
            }, {})
          for (var id in origTableData) {
            context.moduleMaterialList[id].std_qty = origTableData[id]
          }
          context.moduleMaterialList[mtl_id] = formData

          $('#material-save-btn').prop('disabled', false)
          context.canSubmitMaterialList = false
          context.drawMaterialTable()
          $('#material-management-modal-widget').modal('hide')
        })

        // reportTable內各個btn event
        $('#material-information-widget')
          // 刪除物料
          .on('click', '#delete-material', function (e) {
            let datas = context.moduleMaterialTable.getSelectedRow(),
              hasSavedData = false,
              deleteIds = datas.map((data) => {
                hasSavedData = data[6] || hasSavedData
                return {
                  id: data[0],
                  saved: data[6],
                }
              })

            // 跟已選的物料和已填的用量merge
            let rows = Array.from(
                context.moduleMaterialTable.table.rows().nodes()
              ),
              origTableData = rows.reduce((a, el) => {
                let $tds = $(el).find('td'),
                  mtl_id = $tds.eq(1).text(),
                  std_qty = $tds.eq(6).find('input').val()
                if (std_qty) a[mtl_id] = std_qty
                return a
              }, {})
            for (var id in origTableData) {
              context.moduleMaterialList[id].std_qty = origTableData[id]
            }
            console.log(datas)
            if (deleteIds.length) {
              console.log(deleteIds)
              context.moduleMaterialList = _.omit(
                context.moduleMaterialList,
                (value, key) => _.pluck(deleteIds, 'id').includes(key)
              )
              context.deleteSavedIds = _.union(
                context.deleteSavedIds,
                deleteIds.filter((id) => id.saved).map((id) => id.id)
              )
              context.drawMaterialTable()
              // 還未儲存的 或 有編輯過的物料就不能submit
              context.canSubmitMaterialList =
                Object.values(context.moduleMaterialList).findIndex(
                  (mat) => !mat.isSaved || mat.isUpdate
                ) < 0

              $('#material-save-btn').prop(
                'disabled',
                context.deleteSavedIds.length
                  ? false
                  : context.canSubmitMaterialList
              )
            }
          })
          // 重整
          .on('click', '#refresh-material', function (e) {
            $(this).find('.fa-refresh').addClass('fa-spin')

            context.deleteSavedIds.length = 0
            $('#material-save-btn').prop('disabled', true)

            context.getModuleMaterial(() => {
              context.drawMaterialTable()
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
              $td = $tr.find('td').eq(6), // std_qty和taxed_price(少了checkbox)的index都是8
              orig_value = $td.text()

            $td.html(
              `<form><input class="form-control full-width validate-std-qty" name="std_qty" type="text" value="${orig_value}" data-orig="${orig_value}" /></form>`
            )
            $tr.addClass('edit').removeClass('read')
            context.disableFeature(true, $('#module-material'))
          })
          // 儲存
          .on('click', '.update-material', function (e) {
            console.log(e.target)
            let $tr = $(this).parents('tr'),
              $td = $tr.find('td').eq(6),
              value = $td.find('input').val(),
              mtl_id = $tr.find('td').eq(1).text()

            if (!$td.find('form').validate().form()) return

            context.moduleMaterialList[mtl_id].std_qty = parseFloat(value)
            context.moduleMaterialList[mtl_id].isUpdate = true
            $td.html(value)
            console.log(context.moduleMaterialList)
            $tr.removeClass('edit').addClass('read')
            context.disableFeature(false, $('#module-material'))
            context.canSubmitMaterialList = false

            $('#material-save-btn').prop('disabled', false)
          })
          // 取消
          .on('click', '.cancel-material', function (e) {
            console.log(e.target)
            let $tr = $(this).parents('tr'),
              $td = $tr.find('td').eq(6),
              orig_data = $td.find('input').data('orig')
            $td.html(orig_data)

            $tr.removeClass('edit').addClass('read')
            context.disableFeature(false, $('#module-material'))
          })

        // 儲存按鈕
        $('#material-save-btn').on('click', (e) => context.saveMaterialList())
      },
      // 暫存編輯結果
      saveMaterialList: function () {
        let context = this,
          reportTable = context.moduleMaterialTable.table,
          mtl_id,
          std_qty,
          $row,
          $tds,
          $input

        // 驗證表格
        let isValid = context.validateColumn(reportTable, 5)
        if (!isValid) return alert(`${i18n('Form_Is_Not_Completed')}`)

        // 將已填的std_qty寫回context.materialList
        reportTable
          .rows()
          .nodes()
          .to$()
          .each((i, el) => {
            $row = $(el)
            $tds = $row.find('td')
            $input = $tds.eq(6).find('input')
            std_qty = $input.length ? $input.val() : $tds.eq(8).text()
            if (std_qty) {
              mtl_id = $tds.eq(1).text()
              context.moduleMaterialList[mtl_id].std_qty = parseFloat(std_qty)
            }
          })

        let requestBody = {
            module_id: context.module_id,
            new_mtl: [],
            old_mtl: [],
            del_mtl: context.deleteSavedIds.slice(),
            update_mtl: [],
          },
          hasNewMat = false

        for (var mat in context.moduleMaterialList) {
          // 編輯過的
          if (context.moduleMaterialList[mat].isUpdate)
            requestBody.update_mtl.push(
              _.pick(context.moduleMaterialList[mat], [
                'module_id',
                'mtl_id',
                'std_qty',
              ])
            )
          // 新增全新物料
          else if (context.moduleMaterialList[mat].newMat) {
            requestBody.new_mtl.push(context.moduleMaterialList[mat])
            hasNewMat = true
          }
          // 新增已建檔的物料
          else if (!context.moduleMaterialList[mat].isSaved)
            requestBody.old_mtl.push(context.moduleMaterialList[mat])
        }
        // return console.log(requestBody)

        servkit.ajax(
          {
            url: 'api/strongled/savemodulemateriallist',
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
      // validate reportTable
      validateColumn: function (reportTable, columnIndex) {
        let isValid = true,
          currPage = reportTable.page.info().page,
          totalpages = reportTable.page.info().pages

        // validate forms at current page
        reportTable
          .column(columnIndex, { page: 'current' })
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
              .column(columnIndex, { page: 'current' })
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
      // 新增現有物料
      initExistingMaterialTable: function () {
        let context = this

        if (!context.existingMaterialTable) {
          context.existingMaterialTable = createReportTable({
            $tableElement: $('#existing-material-list'),
            checkbox: true,
            onRow: function (row, data) {
              // const mtl_id = data[0],
              //   $tds = $(row).find('td'),
              //   $tdCheckbox = $tds.find(':checkbox')
              // if (context.moduleMaterialList) {
              //   const isChecked = Object.prototype.hasOwnProperty.call(context.moduleMaterialList, mtl_id)
              //   $tdCheckbox.prop('checked', isChecked).prop('disabled', isChecked)
              // }
            },
          })

          // 新增按鈕
          $('#existing-material-modal-widget #add-existing-material-btn').on(
            'click',
            function (e) {
              let rowData = context.existingMaterialTable.getSelectedRow()
              // console.log(rowData)
              if (rowData) {
                // merge已選物料和新增的
                if (!context.moduleMaterialList) context.moduleMaterialList = {}
                context.moduleMaterialList = _.extend(
                  rowData.reduce((a, x) => {
                    if (!a[x[0]]) {
                      a[x[0]] = {
                        mtl_id: x[0],
                        mtl_name: x[1],
                        spec: x[2],
                        unit: x[3],
                        remark: x[4],
                        isSaved: false,
                      }
                    }
                    return a
                  }, {}),
                  context.moduleMaterialList
                )

                // materialList extend 新增物料中已填入的std_qty
                let rows = Array.from(
                    context.moduleMaterialTable.table.rows().nodes()
                  ),
                  origTableData

                if (context.moduleMaterialTable.table.data().length) {
                  origTableData = rows.reduce((a, el) => {
                    let $tds = $(el).find('td'),
                      mtl_id = $tds.eq(1).text(), // 有checkbox所以index++
                      std_qty = $tds.eq(6).find('input').val()
                    if (std_qty) a[mtl_id] = std_qty // 此次新增的材料而且空格內已有填數字時才紀錄
                    return a
                  }, {})

                  // console.log(origTableData)
                  for (var mtl_id in origTableData) {
                    context.moduleMaterialList[mtl_id].std_qty =
                      origTableData[mtl_id]
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
                  mat.spec || '',
                  mat.unit || '',
                  mat.remark || '',
                ])
              )
            },
          }
        )
      },
      drawMaterialTable: function () {
        let context = this
        context.moduleMaterialTable.drawTable(
          _.map(context.moduleMaterialList, (map) => [
            map.mtl_id,
            map.mtl_name || '',
            map.spec || '',
            map.unit || '',
            map.remark || '',
            map.isSaved
              ? map.std_qty || ''
              : `<form>
              <input type="text" name="std_qty" 
                class="form-control full-width validate-std-qty" 
                value="${map.std_qty || ''}" />
              </form>`,
            map.isSaved,
          ])
        )
      },
    },
    preCondition: {
      module: function (done) {
        servkit.ajax(
          {
            url: 'api/stdcrud',
            type: 'GET',
            data: {
              tableModel:
                'com.servtech.servcloud.app.model.strongLED.MaterialModule',
            },
          },
          {
            success: function (data) {
              done(
                data.reduce((a, x) => {
                  if (!a[x.module_id]) {
                    a[x.module_id] = {}
                  }
                  a[x.module_id][x.mtl_id] = x.std_qty
                  return a
                }, {})
              )
            },
          }
        )
      },
      materialList: function (done) {
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
            success: function (data) {
              done(
                data.reduce((a, x) => {
                  a[x.mtl_id] = x
                  return a
                }, {})
              )
            },
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
