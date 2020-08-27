export default function () {
  GoGoAppFun({
    gogo(context) {
      context.initCrudTable()
      context.initEditPriceTable()
    },
    util: {
      matPropertyTable: null,
      $matPropertyTable: $('#material-profile-table'),
      $editMatPropertyModal: $('#edit-material-property-modal'),
      $editPriceTable: $('#edit-price-table'),
      matAttrUnitMap: {
        plastic: '1M',
        metal: '1KG',
      },
      matAttrMap: {
        plastic: '塑膠',
        metal: '金屬',
      },
      initCrudTable() {
        const context = this
        const { matAttrUnitMap } = context
        context.$editMatPropertyModal.on(
          'change',
          '[name=mat_att]',
          function () {
            const mat_att = this.value
            const form = this.closest('form')
            const matUnitEl = form.querySelector('[name=mat_unit]')
            matUnitEl.value = matAttrUnitMap[mat_att]
          }
        )
        context.$editMatPropertyModal.find('[name=mat_att]').change()
        context.$editMatPropertyModal
          .find('[name=mat_colornumber]')
          .colorpicker({
            format: 'hex',
          })
          .on('changeColor', function (evt) {
            const $colorBox = $(this).next()
            $colorBox.css('background', evt.color.toHex())
          })
        $('.colorpicker').css('z-index', '9999')

        context.matPropertyTable = servkit.crudtable({
          tableModel:
            'com.servtech.servcloud.app.model.huangliang_matStock.MatProfile',
          tableSelector: '#material-profile-table',
          modal: {
            id: '#edit-material-property-modal',
          },
          columns: [
            {
              data: 'mat_id',
              name: 'mat_id',
            },
            {
              data: 'mat_type',
              name: 'mat_type',
            },
            {
              data: 'mat_att',
              name: 'mat_att',
              render(data) {
                return data || ''
              },
            },
            {
              data: 'mat_unit',
              name: 'mat_unit',
              render(data) {
                return data || ''
              },
            },
            {
              data: 'mat_color',
              name: 'mat_color',
            },
            {
              data: 'mat_colornumber',
              name: 'mat_colornumber',
              render(data) {
                return `<div class="color-box" title="${data || ''}" ${
                  data ? `style="background-color: ${data}!important"` : ''
                }></div>`
              },
            },
            {
              data: 'mat_sg',
              name: 'mat_sg',
              render(data) {
                return data || ''
              },
            },
            {
              data: null,
              name: 'edit-price-btn',
              render(data, type, rowData) {
                const { mat_id, mat_unit } = rowData
                return `<button class="btn btn-primary edit-price-btn" data-mat_id="${mat_id}" data-mat_unit="${mat_unit}">單價維護</button>`
              },
            },
            {
              data: 'is_open',
              name: 'is_open',
            },
          ],
          create: {
            url: 'api/stdcrud',
            start(form, table) {
              const $form = $(form)
              const $matAtt = $form.find('[name=mat_att]')
              const $colorBox = $form.find('[name=mat_colornumber]').next()
              const $colornumber = $form.find('[name=mat_colornumber]')
              $matAtt.change()
              $colorBox.css('background-color', '#ffffff')
              $colornumber.colorpicker('setValue', '#ffffff')
              $colornumber.val('')
            },
          },
          read: {
            url: 'api/stdcrud',
          },
          update: {
            url: 'api/stdcrud',
            start: {
              3(oldTd, newTd, oldTr, newTr, table) {
                const select = newTd.querySelector('select')
                const mat_att = table.cell(oldTd).data()
                if (mat_att) {
                  select.value = _.findKey(
                    context.matAttrMap,
                    (value) => value === mat_att
                  )
                } else {
                  select.value = 'metal'
                }
                $(select).change()
              },
              4(oldTd, newTd) {
                // 屬性onchange已經有值，設定此function防止再被賦值
              },
              6(oldTd, newTd, oldTr, newTr, table) {
                const colorBoxEl = oldTd.querySelector('.color-box')
                const colorCode = colorBoxEl.title
                const isColorCodeUndefined = !colorCode.length
                const input = newTd.querySelector('input')
                const $i = $(input).next()

                $i.css(
                  'background-color',
                  isColorCodeUndefined ? '#ffffff' : colorCode
                )
                if (isColorCodeUndefined) {
                  $(input).colorpicker('setValue', '#ffffff')
                } else {
                  $(input).colorpicker('setValue', colorCode)
                }
                input.value = colorCode
              },
            },
          },
          delete: {
            url: 'api/stdcrud',
          },
          validate: {
            entityPkErrorMsg: '材料編碼已存在',
            entityPk(tdList) {
              return tdList[0].querySelector('[name=mat_id]').value
            },
            5(td, table) {
              const input = td.querySelector('input')
              const value = input.value
              if (!value) {
                return '此欄必填'
              }
            },
            6(td, table) {
              const input = td.querySelector('input')
              const value = input.value
              if (!value) {
                return '此欄必填'
              }
            },
          },
        })
      },
      initEditPriceTable() {
        const context = this
        const supplierNameArr = Object.values(context.preCon.supplierMap)
        const $supNameSelect = context.$editPriceTable.find('[name=sup_name]')
        const moneyFormatter = (data) => {
          const str = data.toString()
          const matches = str.match(/(\d+)(\.\d{1,2})?/)
          const intPart = matches[1]
          const decimalPart = matches[2]
          const isDecimal = !!decimalPart
          let result = ''
          if (isDecimal) {
            result += intPart + decimalPart.padEnd(3, '0')
          } else {
            result += intPart + '.'.padEnd(3, '0')
          }
          return result
        }
        const bindEvent = () => {
          context.$matPropertyTable.on('click', '.edit-price-btn', function () {
            editPriceBtnHandler(this)
          })
          context.$editPriceTable.on('change', '[name=sup_name]', function () {
            supNameHandler(this)
          })
        }
        const supNameHandler = (select) => {
          const sup_name = select.value
          const sup_id = Object.entries(context.preCon.supplierMap).find(
            (entry) => entry[1] === sup_name
          )[0]
          const supIdInput = select.closest('tr').querySelector('[name=sup_id]')
          supIdInput.value = sup_id
        }
        const editPriceBtnHandler = (btn) => {
          const { mat_id, mat_unit } = btn.dataset
          $('#mat_id-modal').text(mat_id)
          $('#mat_unit-modal').text(mat_unit)
          context.editPriceTable.changeReadUrl({
            whereClause: `mat_id='${mat_id}'`,
          })
          context.editPriceTable.refreshTable()
          $('#edit-price-modal').modal('show')
        }
        const hideExsitedSupplierOptions = ($select, existSupIds) => {
          let isChanged = false
          $select.children().each((i, el) => {
            const isDuplicate = existSupIds.includes(el.value)
            const $option = $(el)
            $option.prop('disabled', isDuplicate)
            if (!isChanged && !isDuplicate) {
              $option.parent().val(el.value).change()
              isChanged = true
            }
          })
        }

        servkit.initSelectWithList(supplierNameArr, $supNameSelect)
        context.editPriceTable = servkit.crudtable({
          tableModel:
            'com.servtech.servcloud.app.model.huangliang_matStock.MatPriceList',
          tableSelector: '#edit-price-table',
          read: {
            url: 'api/stdcrud',
            preventReadAtFirst: true,
            end: {
              2(data, rowData) {
                const { sup_id } = rowData
                return context.preCon.supplierMap[sup_id]
              },
              3(data, rowData) {
                return moneyFormatter(data)
              },
            },
          },
          create: {
            url: 'api/huangliangMatStock/matPrice',
            start(tdArr, table) {
              const existSupIds = context.editPriceTable.table
                .column(1)
                .data()
                .toArray()
              const $supNameSelect = $(tdArr[1]).find('[name=sup_name]')
              const $modifyInput = $(tdArr[3]).find('[name=modify_time]')
              hideExsitedSupplierOptions($supNameSelect, existSupIds)
              $supNameSelect.removeClass('form-control').select2({
                minimumInputLength: 0,
              })
              $modifyInput.val(moment().format('YYYY-MM-DD HH:mm:ss'))
            },
            send(tdEles) {
              const mat_id = $('#mat_id-modal').text()
              return {
                mat_id,
              }
            },
            end: {
              2(td, formData) {
                return td.querySelector('[name=sup_name]').value
              },
              3(td, formData) {
                const { mat_price } = formData
                return moneyFormatter(mat_price)
              },
            },
          },
          update: {
            url: 'api/huangliangMatStock/matPrice',
            start: {
              4(oldTd, newTd, oldTr, newTr, table) {
                newTd.querySelector('input').value = moment().format(
                  'YYYY-MM-DD HH:mm:ss'
                )
              },
            },
            end: {
              3(td, formData) {
                const { mat_price } = formData
                return moneyFormatter(mat_price)
              },
            },
          },
          delete: {
            url: 'api/huangliangMatStock/matPrice',
          },
          validate: {
            3(td, table) {
              const input = td.querySelector('input')
              const price = Number(input.value)
              const isNumber = _.isNumber(price)
              const isPositive = price > 0
              const hasError = !!td.querySelector('.note-error')
              if (!hasError && isNumber && !isPositive) {
                return '價格必須大於0'
              }
            },
          },
        })
        bindEvent()
      },
    },
    preCondition: {
      supplierMap(done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_huangliang_supplier',
              columns: ['sup_id', 'sup_name'],
            }),
          },
          {
            success(data) {
              done(
                data.reduce(
                  (a, map) => _.extend(a, { [map.sup_id]: map.sup_name }),
                  {}
                )
              )
            },
          }
        )
      },
    },
    dependencies: [
      ['/js/plugin/select2/select2.min.js'],
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatables/jquery.dataTables.rowReordering.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
        // 原版colorpicker有bug所以用v2最新版(支援BS3)，referenced issue: https://github.com/itsjavi/bootstrap-colorpicker/issues/24
        '/js/plugin/colorpicker/bootstrap-colorpicker-v2.5.3.min.js',
      ],
    ],
  })
}
