export default function () {
  GoGoAppFun({
    gogo: function gogo(context) {
      console.log('hi')
      context.initSelect()
      servkit.initSelectWithList(
        context.preCon.columnI18n,
        $('select[name=field]'),
        false
      )
      servkit.initSelectWithList(
        context.preCon.module,
        $('select[name=module]'),
        false
      )
      $('#submit-btn').on('click', function (e) {
        e.preventDefault()
        context.$treeContainer.removeClass('editable')
        $('#quit-edit-tree').hide()
        $('#edit-tree').show()
        $('#save-tree').hide()
        context.getTree(() => context.refreshTree())
      })
      context.initTreeView()

      // servkit.validateForm($('#add-module-form'), $('#add-module-btn'))
      $('#add-module-btn').on('click', function (e) {
        e.preventDefault()
        let moduleValidator = $('#add-module-form').validate({
          errorPlacement: function (error, element) {
            $('#add-module-form .error-msg').html(error)
          },
        })
        if (!moduleValidator.form()) return
        moduleValidator.destroy()

        let module = $('#add-module-form select[name=module]').val(),
          count = $('#add-module-form input[name=module-count]').val(),
          allModule = $('#module-display').data('module') || []
        allModule.push({
          id: module,
          count,
          isModule: true,
        })
        $('#module-display').data('module', allModule)
        $('#module-display').append(context.moduleTag(module, count))
        servkit.initSelectWithList(
          _.difference(
            context.preCon.module,
            allModule.filter((x) => x.isModule).map((x) => x.id)
          ),
          $('#add-module-form select[name=module]'),
          false
        )
      })
      // servkit.validateForm($('#add-material-form'), $('#add-material-btn'))
      $('#add-material-btn').on('click', function (e) {
        e.preventDefault()
        let materialValidator = $('#add-material-form').validate({
          errorPlacement: function (error, element) {
            $('#add-material-form .error-msg').html(error)
          },
        })
        if (!materialValidator.form()) return
        materialValidator.destroy()

        let material = $('#add-material-form select[name=material]').val(),
          count = $('#add-material-form input[name=material-count]').val(),
          allModule = $('#module-display').data('module') || []
        allModule.push({
          id: material,
          count,
          isModule: false,
        })
        $('#module-display').data('module', allModule)
        $('#module-display').append(context.moduleTag(material, count))
        servkit.initSelectWithList(
          _.difference(
            context.preCon.materialList,
            allModule.filter((x) => !x.isModule).map((x) => x.id)
          ),
          $('#add-material-form select[name=material]'),
          false
        )
      })
      $('#module-display').on('click', '.remove-module-btn', function (e) {
        let moduleId = $(this).closest('label').data('module-id').toString(),
          isModule,
          allModule = $('#module-display')
            .data('module')
            .filter((m) => {
              if (m.id === moduleId) {
                isModule = m.isModule
              }
              return m.id !== moduleId
            })
        $('#module-display').data('module', allModule)
        $(this).closest('label').remove()
        if (isModule) {
          servkit.initSelectWithList(
            _.difference(
              context.preCon.module,
              allModule.filter((x) => x.isModule).map((x) => x.id)
            ),
            $('#add-module-form select[name=module]'),
            false
          )
        } else {
          servkit.initSelectWithList(
            _.difference(
              context.preCon.materialList,
              allModule.filter((x) => !x.isModule).map((x) => x.id)
            ),
            $('#add-material-form select[name=material]'),
            false
          )
        }
      })
    },
    util: {
      tree: null,
      tempTree: null,
      $treeContainer: $('#tree-container'),
      moduleTag: (module, count) =>
        `<label class="label label-primary" data-module-id="${module}">${count} * ${module} <span class="remove-module-btn"><i class="fa fa-times"></i></span></div>`,

      getTree: function (callback) {
        let context = this,
          tree = {
            field: 'control_way',
            單色常亮: {
              field: 'lamp_length',
              1000: {
                field: 'lamp_bead_number',
                72: {
                  '6灯四電阻': 12,
                },
                60: {
                  '6灯四電阻': 10,
                },
                48: {
                  '6灯四電阻': 8,
                },
                36: {
                  '6灯四電阻': 6,
                },
                30: {
                  '5灯七電阻': 6,
                },
              },
              500: {
                field: 'lamp_bead_number',
                36: {
                  '6灯四電阻': 6,
                },
                30: {
                  '6灯四電阻': 5,
                },
                24: {
                  '6灯四電阻': 4,
                },
                12: {
                  '6灯四電阻': 2,
                },
              },
              300: {
                field: 'lamp_bead_number',
                18: {
                  '6灯四電阻': 3,
                },
                15: {
                  '6灯四電阻': 4,
                },
                12: {
                  '6灯四電阻': 2,
                },
                9: {
                  '6灯四電阻': 3,
                },
              },
              250: {
                field: 'lamp_bead_number',
                12: {
                  '6灯四電阻': 2,
                },
                9: {
                  '6灯四電阻': 3,
                },
                6: {
                  '6灯四電阻': 1,
                },
              },
            },
            DMX: {
              field: 'lamp_length',
              1000: {
                field: 'lamp_bead_number',
                96: {
                  'field': 'composition',
                  '48RGB_48W': {
                    field: 'segmentation',
                    16: {
                      'SL01C': 16,
                      '8279': 2,
                    },
                    8: {
                      SL01C: 8,
                    },
                    4: {
                      SL01C: 4,
                    },
                    2: {
                      SL01C: 2,
                    },
                  },
                },
                72: {
                  'field': 'composition',
                  '48RGB_24W': {
                    field: 'segmentation',
                    12: {
                      'SL01C': 12,
                      '三極管': 12,
                      '8279': 2,
                    },
                    8: {
                      'SL01C': 8,
                      '三極管': 8,
                      '8279': 2,
                    },
                    4: {
                      SL01C: 8,
                      三極管: 4,
                    },
                    2: {
                      SL01C: 2,
                      三極管: 28,
                    },
                  },
                  '72N_72L': {
                    field: 'segmentation',
                    24: {
                      'SL01C': 24,
                      '8279': 2,
                    },
                    18: {
                      'SL01C': 18,
                      '8279': 2,
                    },
                    12: {
                      SL01C: 12,
                    },
                    6: {
                      SL01C: 6,
                      三極管: 24,
                    },
                    4: {
                      SL01C: 4,
                      三極管: 24,
                    },
                    3: {
                      SL01C: 3,
                      三極管: 24,
                    },
                    2: {
                      SL01C: 2,
                      三極管: 24,
                    },
                    1: {
                      SL01C: 1,
                      三極管: 24,
                    },
                  },
                  '全彩': {
                    field: 'segmentation',
                    24: {
                      'SL01C': 24,
                      '8279': 1,
                    },
                    12: {
                      SL01C: 12,
                    },
                    6: {
                      SL01C: 12,
                    },
                    4: {
                      SL01C: 4,
                      三極管: 36,
                    },
                    3: {
                      SL01C: 3,
                      三極管: 36,
                    },
                    2: {
                      SL01C: 2,
                      三極管: 36,
                    },
                    1: {
                      SL01C: 1,
                      三極管: 36,
                    },
                  },
                  '單色': {
                    field: 'segmentation',
                    24: {
                      'SL01C': 24,
                      '8279': 2,
                    },
                    12: {
                      SL01C: 12,
                    },
                    6: {
                      SL01C: 6,
                      三極管: 12,
                    },
                    4: {
                      SL01C: 4,
                      三極管: 12,
                    },
                    3: {
                      SL01C: 3,
                      三極管: 12,
                    },
                    2: {
                      SL01C: 2,
                      三極管: 12,
                    },
                    1: {
                      SL01C: 1,
                      三極管: 12,
                    },
                  },
                },
                60: {
                  'field': 'composition',
                  'RGB_W': {
                    field: 'segmentation',
                    10: {
                      'SL01C': 10,
                      '三極管': 10,
                      '8279': 2,
                    },
                    5: {
                      SL01C: 5,
                      三極管: 5,
                    },
                    1: {
                      SL01C: 1,
                      三極管: 20,
                    },
                  },
                  '全彩': {
                    field: 'segmentation',
                    20: {
                      'SL01C': 20,
                      '8279': 2,
                    },
                    10: {
                      SL01C: 10,
                    },
                    3: {
                      SL01C: 3,
                      三極管: 36,
                    },
                    1: {
                      SL01C: 1,
                      三極管: 30,
                    },
                  },
                  '30N_30L': {
                    field: 'segmentation',
                    5: {
                      SL01C: 5,
                      三極管: 10,
                    },
                    1: {
                      SL01C: 1,
                      三極管: 10,
                    },
                  },
                  '單色': {
                    field: 'segmentation',
                    10: {
                      SL01C: 10,
                    },
                    5: {
                      SL01C: 5,
                      三極管: 10,
                    },
                  },
                  'RGBW四合一': {
                    field: 'segmentation',
                    10: {
                      SL01C: 10,
                    },
                    5: {
                      SL01C: 10,
                    },
                    1: {
                      SL01C: 1,
                      三極管: 40,
                    },
                  },
                },
                48: {
                  'field': 'composition',
                  'RGBW四合一': {
                    field: 'segmentation',
                    8: {
                      SL01C: 8,
                    },
                    4: {
                      SL01C: 8,
                    },
                    2: {
                      SL01C: 1,
                      三極管: 32,
                    },
                    1: {
                      SL01C: 1,
                      三極管: 32,
                    },
                  },
                  '24RGB_24W': {
                    field: 'segmentation',
                    8: {
                      'SL01C': 8,
                      '三極管': 8,
                      '8279': 1,
                    },
                    4: {
                      SL01C: 4,
                      三極管: 4,
                    },
                    2: {
                      SL01C: 2,
                      三極管: 16,
                    },
                    1: {
                      SL01C: 1,
                      三極管: 16,
                    },
                  },
                  '全彩': {
                    field: 'segmentation',
                    16: {
                      'SL01C': 16,
                      '8279': 1,
                    },
                    8: {
                      SL01C: 8,
                    },
                    4: {
                      SL01C: 8,
                    },
                    2: {
                      SL01C: 2,
                      三極管: 24,
                    },
                    1: {
                      SL01C: 1,
                      三極管: 24,
                    },
                  },
                  '單色': {
                    field: 'segmentation',
                    16: {
                      'SL01C': 16,
                      '8279': 1,
                    },
                    8: {
                      SL01C: 8,
                    },
                    4: {
                      SL01C: 4,
                      三極管: 8,
                    },
                    2: {
                      SL01C: 2,
                      三極管: 8,
                    },
                    1: {
                      SL01C: 1,
                      三極管: 8,
                    },
                  },
                },
                36: {
                  'field': 'composition',
                  '全彩': {
                    field: 'segmentation',
                    6: {
                      SL01C: 6,
                    },
                    3: {
                      SL01C: 3,
                      三極管: 12,
                    },
                    2: {
                      SL01C: 2,
                      三極管: 12,
                    },
                    1: {
                      SL01C: 1,
                      三極管: 12,
                    },
                  },
                  '單色': {
                    field: 'segmentation',
                    6: {
                      SL01C: 6,
                    },
                    3: {
                      SL01C: 3,
                      三極管: 6,
                    },
                    2: {
                      SL01C: 2,
                      三極管: 6,
                    },
                    1: {
                      SL01C: 1,
                      三極管: 6,
                    },
                  },
                  'RGBW四合一': {
                    field: 'segmentation',
                    6: {
                      SL01C: 6,
                    },
                    3: {
                      SL01C: 6,
                    },
                    1: {
                      SL01C: 1,
                      三極管: 24,
                    },
                  },
                  '18RGB_18W': {
                    field: 'segmentation',
                    6: {
                      'SL01C': 6,
                      '8279': 1,
                    },
                    3: {
                      SL01C: 3,
                    },
                    1: {
                      SL01C: 1,
                      三極管: 16,
                    },
                  },
                },
                30: {
                  'field': 'composition',
                  '單色': {
                    field: 'segmentation',
                    5: {
                      SL01C: 5,
                    },
                    1: {
                      SL01C: 1,
                      三極管: 6,
                    },
                  },
                  '全彩': {
                    field: 'segmentation',
                    5: {
                      SL01C: 5,
                    },
                    1: {
                      SL01C: 1,
                      三極管: 18,
                    },
                  },
                  'RGBW四合一': {
                    field: 'segmentation',
                    5: {
                      SL01C: 5,
                    },
                    1: {
                      SL01C: 1,
                      三極管: 20,
                    },
                  },
                  '15RGB_15W': {
                    field: 'segmentation',
                    3: {
                      SL01C: 3,
                      三極管: 3,
                    },
                    1: {
                      SL01C: 1,
                      三極管: 12,
                    },
                  },
                },
              },
            },
          },
          series = $('#series-select').val(),
          model_number = $('#model-select').val()

        context.series = series
        context.model_number = model_number

        servkit.ajax(
          {
            url: 'api/stdcrud',
            type: 'GET',
            data: {
              tableModel:
                'com.servtech.servcloud.app.model.strongLED.MaterialModuleRule',
              whereClause: `model_number='${model_number}'`,
            },
          },
          {
            success: function (data) {
              console.log(data[0])
              if (data.length) {
                context.tree = JSON.parse(data[0].rule)
              } else {
                context.tree = { field: 'model_number' }
                context.tree[model_number] = tree
              }
              if (callback) callback()
            },
          }
        )
      },
      refreshTree: function () {
        let context = this,
          btns = (isParent, isFirst) =>
            (!isParent
              ? ''
              : ` <button class="btn btn-primary btn-xs plus-node" title="{增加}"><i class="fa fa-plus"></i></button>`) +
            (isFirst
              ? ''
              : ` <button class="btn btn-danger btn-xs remove-node" title="{刪除}"><i class="fa fa-times"></i></button>`) +
            (isParent
              ? ` <button class="btn btn-default btn-xs fold-node" title="{底下全部摺疊}"><i class="fa fa-folder"></i></button>
          <button class="btn btn-default btn-xs unfold-node" title="{底下全部展開}"><i class="fa fa-folder-open"></i></button>`
              : ''),
          li = function (obj, field, path) {
            let layer = path === '' ? 0 : path.split('>').length,
              isClose,
              isChildrenClose

            switch (layer) {
              case 0:
                isClose = false
                isChildrenClose = false
                break
              case 1:
                isClose = false
                isChildrenClose = true
                break
              default:
                isClose = true
                isChildrenClose = true
            }
            return _.reduce(
              obj,
              (a, value, key) => {
                if (field) {
                  a +=
                    key !== 'field'
                      ? `<li class="parent_li" role="treeitem" style="${
                          isClose ? 'display: none;' : ''
                        }">
                  <span title="${
                    isChildrenClose ? '{展開}' : '{摺疊}'
                  }" data-path="${path === '' ? key : path + '>' + key}">
                    <i class="fa fa-lg ${
                      isChildrenClose ? 'icon-plus-sign' : 'icon-minus-sign'
                    }"></i>
                    ${key}(${context.preCon.columnI18n[field] || field})
                    ${btns(true, layer === 0)}
                  </span>${ul(obj[key], path === '' ? key : path + '>' + key)}
                </li>`
                      : ''
                } else {
                  a += `<li style="${
                    isClose ? 'display: none;' : ''
                  }"><span data-path="${
                    path === '' ? key : path + '>' + key
                  }">${value + ' * ' + key} </span></li>`
                }
                return a
              },
              ''
            )
          },
          ul = function (obj, path) {
            let field = obj.field
            return `<ul role="${path === '' ? 'tree' : 'group'}">${li(
              obj,
              field,
              path ? path : ''
            )}</ul>`
          }

        context.$treeContainer.html(ul(context.tree))
      },
      initTreeView: function () {
        let context = this
        $('#rule-tree-widget')
          .on('click', '#edit-tree', function (a) {
            context.$treeContainer.addClass('editable')
            $('#quit-edit-tree').show()
            $('#save-tree').show()
            $(this).hide()
            context.tempTree = JSON.parse(JSON.stringify(context.tree))
          })
          .on('click', '#quit-edit-tree', function (a) {
            context.$treeContainer.removeClass('editable')
            $('#edit-tree').show()
            $('#save-tree').hide()
            $(this).hide()
            context.refreshTree()
          })
          .on('click', '#save-tree', function (a) {
            let emptyLeaves = context.getEmptyLeaves(context.tempTree),
              $saveTree = $(this)
            console.log(emptyLeaves)
            if (emptyLeaves.length) {
              alert(
                '以下節點底下是空的，請新增完模組再儲存\n' +
                  emptyLeaves.join('\n')
              )
            } else {
              servkit.ajax(
                {
                  url: 'api/stdcrud',
                  type: 'PUT',
                  contentType: 'application/json',
                  data: JSON.stringify({
                    tableModel:
                      'com.servtech.servcloud.app.model.strongLED.MaterialModuleRule',
                    model_number: context.model_number,
                    rule: JSON.stringify(context.tempTree),
                  }),
                },
                {
                  success: function (data) {
                    context.$treeContainer.removeClass('editable')
                    $('#quit-edit-tree').hide()
                    $('#edit-tree').show()
                    $saveTree.hide()
                    context.tree = context.tempTree
                    console.log(data, '成功儲存rule')
                  },
                }
              )
            }
          })
        $('select[name=field]').on('change', function (e) {
          const field = this.value,
            columnConfig =
              context.modelMap[context.series][context.model_number][field],
            htmlType = columnConfig.htmlType,
            $containerOfValue = $('#s1 .value')
          let options,
            siblingValues,
            currentMap = context.tempTree,
            path = $('#add-node-modal-widget').data('path')

          path = path.split('>')
          path.forEach((x) => {
            currentMap = currentMap[x]
          })
          siblingValues = Object.keys(_.omit(currentMap, 'field'))
          $('#confirm-add-btn').data({ siblingValues, htmlType })

          switch (htmlType) {
            case 'radio':
              $containerOfValue.html(`<div class="smart-form"><div class="inline-group">
              <label class="radio">
                <input type="radio" name="radio" value="是" class="required" ${
                  siblingValues.includes('是') ? 'disabled' : ''
                }>
                <i></i>是</label>
              <label class="radio">
                <input type="radio" name="radio" value="否" ${
                  siblingValues.includes('否') ? 'disabled' : ''
                }>
                <i></i>否</label>
              </div></div>`)
              break
            case 'custom':
              $containerOfValue.html(`<input type="text" 
            class="form-control required ${columnConfig.validationClass.join(
              ' '
            )}"
            name="custom"
            ${
              columnConfig.maxLength
                ? 'data-rule-maxlength="' + columnConfig.maxLength + '"'
                : ''
            }>`)
              break
            case 'list_custom':
              options =
                _.reduce(
                  _.difference(columnConfig.options, siblingValues),
                  (a, value, key, colleciton) => {
                    return (
                      a +
                      `<option value="${
                        _.isArray(colleciton) ? value : key
                      }">${value}</option>`
                    )
                  },
                  ''
                ) +
                '<option value="custom">' +
                i18n('Custom') +
                '</option>'
              $containerOfValue.html(`<select name="list_custom-1" class="form-control customizable required">
               ${options}
              </select>
              <input name="list_custom-2" type="text" 
                class="form-control ${
                  columnConfig.validationClass
                    ? columnConfig.validationClass.join(' ')
                    : ''
                }" 
                ${
                  columnConfig.maxLength
                    ? 'data-rule-maxlength="' + columnConfig.maxLength + '"'
                    : ''
                }>`)
              break
            case 'list':
              options = _.reduce(
                _.difference(columnConfig.options, siblingValues),
                (a, value, key, colleciton) => {
                  return (
                    a +
                    `<option value="${
                      _.isArray(colleciton) ? value : key
                    }">${value}</option>`
                  )
                },
                ''
              )
              $containerOfValue.html(
                `<select name="list" class="form-control only-list required">${options}</select>`
              )
              break
          }
        })
        $('#s1 .value').on('change', '[name=list_custom-1]', function (e) {
          const value = this.value,
            isCustom = value === 'custom',
            $select = $(this)

          $select.parent().toggleClass('custom', isCustom)

          if (isCustom && $select.hasClass('required')) {
            $select.removeClass('required').next().addClass('required')
          } else if (!isCustom && $select.next().hasClass('required')) {
            $select.addClass('required').next().removeClass('required')
          }

          $select.next().val('')
        })
        context.$treeContainer
          .on('click', 'li:has(ul) > span', function (a) {
            var b = $(this).parent('li.parent_li').find(' > ul > li')
            if (b.is(':visible')) {
              b.hide('fast')
              $(this)
                .attr('title', '{展開}')
                .find(' > i')
                .addClass('icon-plus-sign')
                .removeClass('icon-minus-sign')
            } else {
              b.show('fast')
              $(this)
                .attr('title', '{摺疊}')
                .find(' > i')
                .addClass('icon-minus-sign')
                .removeClass('icon-plus-sign')
            }
            // a.stopImmediatePropagation()
          })
          .on('click', '.plus-node', function (a) {
            console.log('+')
            let path = $(this).parent('span').data('path'),
              childrenField,
              currentMap = context.tempTree,
              existOptions,
              leftOptions,
              fields = []
            $('#confirm-add-btn').data('$ul', $(this).parent().next())
            path.split('>').forEach((x) => {
              fields.push(currentMap.field)
              currentMap = currentMap[x]
            })
            $('#add-node-modal-widget').data('path', path).modal('show')
            if (_.isEmpty(currentMap)) {
              $('a[href=#s1]').click().show()
              $('a[href=#s2]').show()
              // module
              // servkit.initSelectWithList(context.preCon.module, $('select[name=module]'), false)
              servkit.initSelectWithList(
                context.preCon.module,
                $('#add-module-form select[name=module]'),
                false
              )
              servkit.initSelectWithList(
                context.preCon.materialList,
                $('#add-material-form select[name=material]'),
                false
              )
              $('#add-module-form input[name=module-count]').val('')
              $('#add-material-form input[name=material-count]').val('')
              $('#module-display').empty().data('module', [])
              // rule
              servkit.initSelectWithList(
                _.omit(context.preCon.columnI18n, fields),
                $('select[name=field]')
              )
              $('select[name=field]').prop('disabled', false).change()
            } else {
              childrenField = currentMap.field

              // 規則
              if (childrenField) {
                $('a[href=#s1]').click().show()
                $('a[href=#s2]').hide()
                servkit.initSelectWithList(
                  _.pick(context.preCon.columnI18n, childrenField),
                  $('select[name=field]')
                )
                $('select[name=field]').prop('disabled', true).change()

                // existOptions = Object.keys(_.omit(currentMap, 'field'))
                // leftOptions = _.difference(context.modelMap[context.series][context.model_number][childrenField].options, existOptions)
                // servkit.initSelectWithList(leftOptions, $('select[name=val]'))
              }
              // 模組
              else {
                // $('select[name=field]').val('').prop('disabled', false)
                $('a[href=#s2]').click().show()
                $('a[href=#s1]').hide()
                const allModule = _.reduce(
                  currentMap,
                  function (a, value, key) {
                    a.push({
                      id: key,
                      count: value,
                      isModule: context.preCon.module.includes(key),
                    })
                    return a
                  },
                  []
                )
                servkit.initSelectWithList(
                  _.difference(
                    context.preCon.module,
                    allModule.filter((x) => x.isModule).map((x) => x.id)
                  ),
                  $('#add-module-form select[name=module]'),
                  false
                )
                servkit.initSelectWithList(
                  _.difference(
                    context.preCon.materialList,
                    allModule.filter((x) => !x.isModule).map((x) => x.id)
                  ),
                  $('#add-material-form select[name=material]'),
                  false
                )
                $('#add-module-form input[name=module-count]').val('')
                $('#add-material-form input[name=material-count]').val('')
                $('#module-display')
                  .html(allModule.map((x) => context.moduleTag(x.id, x.count)))
                  .data('module', allModule)
              }
            }
            a.stopImmediatePropagation()
          })
          .on('click', '.remove-node', function (a) {
            console.log('-')
            // context.removeNode()
            let path = $(this).parent('span').data('path'),
              node = $(this).closest('li')
            $('#remove-node-modal-widget')
              .data({
                path,
                node,
              })
              .modal('show')
            a.stopImmediatePropagation()
          })
          .on('click', '.fold-node', function (a) {
            $(this)
              .closest('li')
              .find('span')
              .each((i, el) => {
                if ($(el).find('i').hasClass('icon-minus-sign')) $(el).click()
              })
            a.stopImmediatePropagation()
          })
          .on('click', '.unfold-node', function (a) {
            $(this)
              .closest('li')
              .find('span')
              .each((i, el) => {
                if ($(el).find('i').hasClass('icon-plus-sign')) $(el).click()
              })
            a.stopImmediatePropagation()
          })

        $('#confirm-add-btn').on('click', function (e) {
          let tabIndex = $('#myTab1').find('li.active').index(),
            path = $('#add-node-modal-widget').data('path'),
            currentMap = context.getCurrentMapByPath(path, context.tempTree),
            $ul = $(this).data('$ul')

          console.log(path)
          // 篩選條件
          if (tabIndex === 0) {
            let siblingValues = $(this).data('siblingValues'),
              htmlType = $(this).data('htmlType'),
              value
            switch (htmlType) {
              case 'custom':
                value = $('#s1 .value [name=custom]').val()
                break
              case 'list_custom':
                value = $('#s1 .value [name=list_custom-1]').val()
                value =
                  value === 'custom'
                    ? value
                    : $('#s1 .value [name=list_custom-2]').val()
                break
              case 'list':
                value = $('#s1 .value [name=list]').val()
                break
              case 'radio':
                value = $('#s1 .value [name=radio]:checked').val()
                break
            }
            if (siblingValues.includes(value))
              return alert('{' + value + '} 已被設定過，請填其他數值')
            if (!value) return alert('已經沒有可設定的數值囉')
            if (_.isEmpty(currentMap))
              currentMap['field'] = $('#s1 [name=field]').val()
            currentMap[value] = {}
            $ul.append(`<li class="parent_li" role="treeitem">
              <span title="{摺疊}" data-path="${
                path === '' ? value : path + '>' + value
              }">
                <i class="fa fa-lg icon-minus-sign"></i>
                ${value}(${$('#s1 [name=field] option:checked').text()})
                <button class="btn btn-primary btn-xs plus-node" title="{增加}"><i class="fa fa-plus"></i></button> 
                <button class="btn btn-danger btn-xs remove-node" title="{刪除}"><i class="fa fa-times"></i></button> 
                <button class="btn btn-default btn-xs fold-node" title="{底下全部摺疊}"><i class="fa fa-folder"></i></button>
                <button class="btn btn-default btn-xs unfold-node" title="{底下全部展開}"><i class="fa fa-folder-open"></i></button>
              </span>
              <ul role="group"></ul>
            </li>`)
          }
          // 模組
          else if (tabIndex === 1) {
            let allModule = $('#module-display').data('module')
            for (var mdl of allModule) {
              currentMap[mdl.id] = mdl.count
            }
            console.log(allModule, currentMap, context.tempTree)
            $ul.html(
              _.reduce(
                currentMap,
                (a, value, key) =>
                  a +
                  `<li 
              style="">
              <span data-path="${path === '' ? key : path + '>' + key}">${
                    value + ' * ' + key
                  } </span>
              </li>`,
                ''
              )
            )
          }
          // context.refreshTree()
          $('#add-node-modal-widget').modal('hide')
        })
        $('#confirm-remove-btn').on('click', function (e) {
          let { node, path } = $('#remove-node-modal-widget').data(),
            obj = context.tempTree,
            length
          console.log(node, path)
          node.remove()
          path = path.split('>')
          length = path.length
          for (var i = 0; i < length - 1; i++) {
            obj = obj[path[i]]
          }
          delete obj[path[length - 1]]
          if (Object.keys(obj).length === 1) delete obj['field']
          console.log('remove: ' + path.join('>'), context.tempTree)
          $('#remove-node-modal-widget').modal('hide')
        })
      },
      getEmptyLeaves: function (obj) {
        let context = this,
          result = [],
          traverse = function (obj, path) {
            let currentPath = path || [],
              field
            if (Object.prototype.hasOwnProperty.call(obj, 'field')) {
              field = obj.field
              for (let key in _.omit(obj, 'field')) {
                // traverse(obj[key], currentPath.concat(`${key}`)) // 沒加欄位名稱
                traverse(
                  obj[key],
                  currentPath.concat(
                    `${key}(${i18n(context.preCon.columnI18n[field])})`
                  )
                ) // 加欄位名稱
              }
            } else if (_.isEmpty(obj) && currentPath.length) {
              result.push(currentPath.join('>'))
            }
          }
        traverse(obj)
        return result
      },
      getCurrentMapByPath: function (path, obj) {
        let context = this,
          current = obj ? obj : context.tree
        path.split('>').forEach((x) => {
          current = current[x]
        })
        return current
      },
      initSelect: function () {
        let context = this

        context.seriesList = _.chain(context.preCon.columnInfo)
          .pluck('series')
          .uniq()
          .sort()
          .value()
        context.modelMap = context.preCon.columnInfo.reduce((a, x) => {
          if (Object.prototype.hasOwnProperty.call(a, x.series)) {
            a[x.series][x.model] = JSON.parse(x.content)
            a[x.series].modelList.push(x.model)
          } else {
            a[x.series] = {
              modelList: [x.model],
            }
            a[x.series][x.model] = JSON.parse(x.content)
          }
          return a
        }, {})
        $('#series-select').html(
          context.seriesList
            .map((m) => `<option value="${m}">${m}</option>`)
            .join('')
        )
        console.log(context.seriesList)
        $('#series-select')
          .on('change', function (e) {
            let series = $(this).val(),
              modelList = context.modelMap[series].modelList
            $('#model-select').html(
              modelList
                .map((m) => `<option value="${m}">${m}</option>`)
                .join('')
            )
          })
          .change()
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
              done(_.uniq(data.map((x) => x.module_id)))
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
              done(_.uniq(data.map((x) => x.mtl_id)))
            },
          }
        )
      },
      columnInfo: function (done) {
        servkit.ajax(
          {
            url: 'api/stdcrud',
            type: 'GET',
            data: {
              tableModel:
                'com.servtech.servcloud.app.model.strongLED.RfqColumns',
            },
          },
          {
            success: function (data) {
              done(data)
            },
          }
        )
      },
      columnI18n: function (done) {
        $.get(
          'app/StrongLED/data/rfqColumnI18nIdMap.json?' + new Date().getTime(),
          (data) => {
            done(
              _.reduce(
                data,
                (a, value, key) => {
                  a[key] = i18n(value)
                  return a
                },
                {}
              )
            )
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
