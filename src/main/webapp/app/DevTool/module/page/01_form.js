export default function () {
  GoGoAppFun({
    gogo: function (context) {
      pageSetUp()
      context.tempalteEngine = createTempalteEngine()
      servkit.initSelectWithList(
        ['option1', 'option2', 'option3'],
        $('[data-id=multipleSelect]')
      )
      servkit.initSelectWithList(
        ['create', 'update', 'delete'],
        $('[name=tableCRUDAvailable]'),
        true
      )
      context.drawAppSelect()
      servkit.initDatePicker($('[data-type=date]').find('input'), false, true)
      servkit.initDatePicker(
        $('[data-type=startEndDate]').find('input:first'),
        $('[data-type=startEndDate]').find('input:last'),
        false
      )
      $('#testEngine').on('click', function () {
        var data = Object.assign({}, context.elementData)
        context.tempalteEngine.toHtml(data)
      })

      // 設定可移動的元件
      $('#elementsBtn div').draggable({
        helper: 'clone',
      })

      // 新增widget
      $('#createWidget').on('click', function (evt) {
        evt.preventDefault()
        context.createElement(
          $('#tabs-widget'),
          'widget',
          context.tempalteEngine.setDefaultData('widget')
        )
        // 新增同時要加上可放置
        context.addDroppable($('#tabs-widget .widget-body').last())
      })

      // 新增modal
      $('#createModal').on('click', function (evt) {
        evt.preventDefault()
        context.createElement(
          $('#tabs-modal'),
          'modal',
          context.tempalteEngine.setDefaultData('modal')
        )
        // 新增同時要加上可放置
        context.addDroppable($('#tabs-modal .modal-body > .row').last())
      })

      // 元件的點選事件(可編輯)
      $('.frame')
        .on('click', '.jarviswidget', function (evt) {
          evt.preventDefault()
          context.changeFocusElement($(this), $('.widgetElementSetting'))
        })
        .on('click', '.modal-dialog', function (evt) {
          evt.preventDefault()
          if (
            $(evt.target).closest('.jarviswidget').closest('.modal-dialog')
              .length <= 0
          ) {
            context.changeFocusElement($(this), $('.modalElementSetting'))
          }
        })
        .on('click', 'section', function (evt) {
          if (evt.target.tagName !== 'OPTION') {
            evt.stopPropagation()
            context.changeFocusElement(
              $(evt.target).closest('section'),
              $('.formElementSetting')
            )
          }
        })
        .on('click', '.dataTables_wrapper', function (evt) {
          // 如果有modal的屬性k就不要有行為(不然會跳不出來)
          if (!$(evt.target).data('toggle')) {
            evt.stopPropagation()
            var tag = $(evt.target)[0].tagName
            if (!(tag === 'BUTTON' || tag === 'INPUT' || tag === 'A')) {
              context.changeFocusElement($(this), $('.tableElementSetting'))
            }
          } else {
            evt.preventDefault()
            var data = $(evt.target).data()
            var bindingTable = $(this).find('table').data('id')

            if (context.elementData[bindingTable].tableDataFrom === 'DB') {
              $(data.target).data(
                context.elementData[bindingTable].tableDataFromKey,
                $(evt.target).data(
                  context.elementData[bindingTable].tableDataFromKey
                ) || ''
              )
            } else {
              $(data.target).data('pks', $(evt.target).data('pks') || '')
            }
            $(data.target)
              .find('.modal-body')
              .find('input, select, label, div')
              .each(function () {
                var $thisElement = $(this)
                if (
                  $thisElement.data('id') &&
                  $thisElement.attr('type') !== 'radio' &&
                  $thisElement.attr('type') !== 'checkbox'
                ) {
                  var hasDefaultData = _.find(data, function (num, key) {
                    return key === $thisElement.data('bindingColumn')
                  })
                  var domTagName = $thisElement[0].tagName
                  if (domTagName === 'LABEL') {
                    $thisElement
                      .find('span')
                      .last()
                      .text(hasDefaultData || '')
                  } else if (domTagName === 'DIV') {
                    if ($thisElement.find('input').attr('type') === 'radio') {
                      if (hasDefaultData) {
                        $thisElement
                          .find('[value=' + hasDefaultData + ']')
                          .prop('checked', true)
                      } else {
                        var radioValue = _.find(
                          context.elementData[$thisElement.data('id')]
                            .formCheckBoxRadio,
                          function (val) {
                            return val.defaultCheck === true
                          }
                        )
                        $thisElement
                          .find(
                            '[value=' + radioValue.formCheckBoxRadioValue + ']'
                          )
                          .prop('checked', true)
                      }
                    } else {
                      $thisElement.find('input').each(function () {
                        var $checkbox = $(this)
                        var checkboxValue
                        if (hasDefaultData) {
                          checkboxValue = _.find(
                            hasDefaultData.toString().split(','),
                            function (val) {
                              return val === $checkbox.val()
                            }
                          )
                        } else {
                          checkboxValue = _.find(
                            context.elementData[$thisElement.data('id')]
                              .formCheckBoxRadio,
                            function (val) {
                              return val.defaultCheck === true
                            }
                          )
                          if (checkboxValue) {
                            checkboxValue = checkboxValue.formCheckBoxRadioValue
                          }
                        }
                        if (checkboxValue) {
                          $checkbox.prop('checked', true)
                        } else {
                          $checkbox.prop('checked', false)
                        }
                      })
                    }
                  } else {
                    if ($thisElement.hasClass('hasDatepicker')) {
                      if (hasDefaultData) {
                        hasDefaultData = moment(
                          new Date(hasDefaultData)
                        ).format('YYYY/MM/DD')
                      } else {
                        hasDefaultData = moment().format('YYYY/MM/DD')
                      }
                    }
                    $thisElement.val(hasDefaultData || '')
                    $thisElement.trigger('change')
                  }
                }
              })
            $(data.target)
              .find('.modal-footer')
              .find('button')
              .off('click')
              .on('click', function () {
                var $modal = $(this).closest('.modal')
                var bindingTable =
                  context.elementData[$modal.find('.modal-dialog').data('id')]
                    .modalFormButtonTableBinding
                if (bindingTable && bindingTable !== undefined) {
                  var modalData = {}
                  var APIData = {
                    url: 'api/formeditor/html/changeModalData',
                    type: 'POST',
                    contentType: 'application/json',
                  }
                  if (
                    context.elementData[bindingTable].tableDataFrom === 'DB'
                  ) {
                    modalData[
                      context.elementData[bindingTable].tableDataFromKey
                    ] = $modal.data(
                      context.elementData[bindingTable].tableDataFromKey
                    )
                    modalData.tableModel =
                      'com.servtech.servcloud.' +
                      context.elementData[bindingTable].tableDataFromTableModel
                    APIData.url = 'api/stdcrud'
                    APIData.type = 'PUT'
                  } else {
                    if ($modal.data('pks')) {
                      modalData = JSON.parse(
                        $modal
                          .data('pks')
                          .replace('{', '{"')
                          .replace(/:/g, '":"')
                          .replace(/,/g, '","')
                          .replace('}', '"}')
                      )
                    }
                    modalData.app_id =
                      context.elementData[bindingTable].tableDataFromApp
                    modalData.data_filename =
                      context.elementData[bindingTable].tableDataFromFile
                  }
                  console.log(modalData)
                  var hasKey = false
                  $modal
                    .find('.modal-body')
                    .find('input, select, div')
                    .each(function () {
                      var $thisElement = $(this)
                      if (
                        $thisElement.data('bindingColumn') &&
                        $thisElement.attr('type') !== 'radio' &&
                        $thisElement.attr('type') !== 'checkbox'
                      ) {
                        if (
                          $thisElement.data('bindingColumn') ===
                          context.elementData[bindingTable].tableDataFromKey
                        ) {
                          hasKey = true
                        }
                        if ($thisElement.hasClass('inline-group')) {
                          var values = []
                          $thisElement.find('input').each(function () {
                            if ($(this).prop('checked')) {
                              if ($(this).attr('type') === 'radio') {
                                modalData[
                                  $thisElement.data('bindingColumn')
                                ] = $(this).val()
                              } else if ($(this).attr('type') === 'checkbox') {
                                values.push($(this).val())
                              }
                            }
                          })
                          if (values.length > 0) {
                            modalData[$thisElement.data('bindingColumn')] =
                              '[' + values.toString() + ']'
                          }
                        } else {
                          modalData[
                            $thisElement.data('bindingColumn')
                          ] = $thisElement.val()
                        }
                      }
                    })
                  if (hasKey) {
                    APIData.type = 'POST'
                  }
                  console.log(modalData)
                  APIData.data = JSON.stringify(modalData)
                  servkit.ajax(APIData, {
                    success: function () {
                      $modal.modal('hide')
                      if (
                        context.elementData[bindingTable].type === 'reportTable'
                      ) {
                        context.drawReportTableByDB(
                          context.elementData[bindingTable],
                          context[bindingTable + 'reportTabble']
                        )
                      } else {
                        $(
                          '[data-id=' +
                            context.elementData[
                              $modal.find('.modal-dialog').data('id')
                            ].modalFormButtonTableBinding +
                            ']'
                        )
                          .closest('.dataTables_wrapper')
                          .find('.stk-refresh-btn')
                          .trigger('click')
                      }
                    },
                  })
                } else {
                  $modal.modal('hide')
                }
              })
          }
        })
        .on('click', '.elementDelete', function (evt) {
          evt.stopPropagation()
          context.clickRemoveElement()
        })

      // 改變框元件的設定
      $('#submit-ele-btn').on('click', function (evt) {
        evt.preventDefault()

        // 如果驗證方式選擇「數字大小」或「長度」，最大值或最小值至少要填一個
        if (
          $('[name=formValidateMax]').closest('section').hasClass('hide') ||
          $('[name=formValidateMax]').val() !== '' ||
          $('[name=formValidateMin]').val() !== ''
        ) {
          var pass = true
          var errorMsg = ''
          var $form = $(this).closest('.smart-form').find('.setting:not(.hide)')
          var ele =
            context.$thisFocus.data('id') ||
            context.$thisFocus.find('input, select').data('id')
          // select2、radio、checkbox和label element的位置不太一樣所以要另外找
          if (context.$thisFocus.data('type') === 'select2') {
            ele = context.$thisFocus.find('select').data('id')
          } else if (
            context.$thisFocus.data('type') === 'radio' ||
            context.$thisFocus.data('type') === 'checkbox'
          ) {
            ele = context.$thisFocus
              .children('div:not(.elementDelete)')
              .data('id')
          } else if (context.$thisFocus.data('type') === 'label') {
            ele = context.$thisFocus.find('label').data('id')
          } else if (context.$thisFocus.data('type') === 'hr') {
            ele = context.$thisFocus.find('hr').data('id')
          } else if (
            context.$thisFocus.data('type') === 'CRUDTable' ||
            context.$thisFocus.data('type') === 'reportTable'
          ) {
            ele = context.$thisFocus.find('table').data('id')
          }

          // 確認輸入的id有沒有重複
          if (context.$thisFocus.data('type') === 'startEndDate') {
            ele = context.$thisFocus
              .find('input:first')
              .data('id')
              .replace('start', '')
            var startId = $form.find('[name=formStartId]').val()
            var EndId = $form.find('[name=formEndId]').val()
            if (
              startId &&
              $('#' + startId).length -
                context.$thisFocus.find('#' + startId).length >
                0
            ) {
              pass = false
              errorMsg = startId + '此ID已存在'
            } else if (
              EndId &&
              $('#' + EndId).length -
                context.$thisFocus.find('#' + EndId).length >
                0
            ) {
              pass = false
              errorMsg = EndId + '此ID已存在'
            }
          } else if (
            context.$thisFocus.data('type') !== 'widget' &&
            context.$thisFocus.data('type') !== 'modal'
          ) {
            var formId = $form.find('[name=formId]').val()
            if (formId === '' && context.$thisFocus.data('type') === 'label') {
              pass = false
              errorMsg = 'Label ID不可為空'
            }
            if (
              formId &&
              $('#' + formId).length -
                context.$thisFocus.find('#' + formId).length >
                0 &&
              context.$thisFocus.data('type') !== 'radio' &&
              context.$thisFocus.data('type') !== 'checkbox'
            ) {
              pass = false
              errorMsg = formId + '此ID已存在'
            }
          } else {
            var type = context.$thisFocus.data('type')
            var FormId = $form.find('[name=' + type + 'FormId]').val()
            var ButtonId = $form.find('[name=' + type + 'ButtonId]').val()
            if ($form.find('[name=' + type + 'Form]').prop('checked')) {
              if (FormId === '') {
                pass = false
                errorMsg = 'Form ID不可為空'
              } else if (
                $('#' + FormId).length -
                  context.$thisFocus.find('#' + FormId).length >
                0
              ) {
                pass = false
                errorMsg = FormId + '此ID已存在'
              } else if (ButtonId === '') {
                pass = false
                errorMsg = 'Button ID不可為空'
              } else if (
                $('#' + ButtonId).length -
                  context.$thisFocus.find('#' + ButtonId).length >
                0
              ) {
                pass = false
                errorMsg = ButtonId + '此ID已存在'
              } else if (FormId === ButtonId) {
                pass = false
                errorMsg = '不可重複ID'
              }
            }
            if (type === 'modal') {
              var modalId = $form.find('[name=modalId]').val()
              if (modalId === '') {
                pass = false
                errorMsg = 'Form ID不可為空'
              } else if (
                $('#' + modalId).length -
                  context.$thisFocus.find('#' + modalId).length >
                  0 &&
                context.$thisFocus.attr('id') !== modalId
              ) {
                pass = false
                errorMsg = modalId + '此ID已存在'
              } else if (modalId === FormId || modalId === ButtonId) {
                pass = false
                errorMsg = '不可重複ID'
              }
            }
          }

          // 檢查只能輸入數字的地方是不是真的是數字
          if ($form.find('[name=formValidate]').val() === 'range') {
            var regRange = /^-?[0-9]+.?[0-9]*$/
            var rangemax = $form.find('[name=formValidateMax]').val()
            var rangemin = $form.find('[name=formValidateMin]').val()
            if (
              (rangemax && !regRange.test(rangemax)) ||
              (rangemin && !regRange.test(rangemin))
            ) {
              pass = false
              errorMsg = '只能輸入數值'
            }
          } else if (
            $form.find('[name=formValidate]').val() === 'lengthrange'
          ) {
            var regLengthRange = /^[1-9][0-9]*?$/
            var LengthRangemax = $form.find('[name=formValidateMax]').val()
            var LengthRangemin = $form.find('[name=formValidateMin]').val()
            if (
              (LengthRangemax && !regLengthRange.test(LengthRangemax)) ||
              (LengthRangemin && !regLengthRange.test(LengthRangemin))
            ) {
              pass = false
              errorMsg = '只能輸入大於1的正整數'
            }
          } else if ($form.find('[name=formBothLimit]').prop('checked')) {
            var regBothLimitRange = /^[1-9][0-9]*?$/
            if (
              !regBothLimitRange.test(
                $form.find('[name=formBothLimitDays]').val()
              )
            ) {
              pass = false
              errorMsg = '只能輸入大於1的正整數'
            }
          }

          // 有驗證時一定要有name而且name不可重複不然就沒用了
          if (
            $('[name=formRequired]:visible').prop('checked') ||
            $('[name=formValidate]:visible').val() ||
            $('[name=formRegSpecialChar]:visible').prop('checked') ||
            $('[name=formRegEngNum]:visible').prop('checked') ||
            $('[name=formRegChinese]:visible').prop('checked') ||
            $('[name=formReg1More]:visible').prop('checked')
          ) {
            var formName = $form.find('[name=formName]').val()
            if (
              $('[name=formStartName]:visible').length &&
              $('[name=formStartName]').val() === '' &&
              $('[name=formEndName]').val() === ''
            ) {
              pass = false
              errorMsg = '有驗證時必須設定Start Name和End Name'
            } else if (
              !$('[name=formStartName]:visible').length &&
              $('[name=formName]').val() === ''
            ) {
              pass = false
              errorMsg = '有驗證時必須設定name'
            } else if (
              formName &&
              $('[name=' + formName + ']').length -
                context.$thisFocus.find('[name=' + formName + ']').length >
                0
            ) {
              pass = false
              errorMsg = formName + '此name已存在'
            }
          }

          // radio一定要有name
          if (
            context.$thisFocus.data('type') === 'radio' &&
            $('[name=formName]').val() === ''
          ) {
            pass = false
            errorMsg = 'radio必須設定name'
          }

          // report table匯出時必須設檔名
          if (
            $('[name=tableExport]').prop('checked') &&
            $('[name=tableExportFilename]').val() === ''
          ) {
            pass = false
            errorMsg = 'report table匯出時必須設定檔名'
          }

          var regNum = /^[0-9]*$/
          if ($('[name=formRequired]:visible')) {
            if (!regNum.test($('[name=chartStandard]').val())) {
              pass = false
              errorMsg = '標準值只能輸入數字'
              $('[name=chartStandard]').val(
                context.elementData[context.$thisFocus.find('table').data('id')]
                  .chartStandard
              )
            }
          }

          // table欄位的寬度一定要數字而且加總不能大於100
          if (
            context.$thisFocus.data('type') === 'CRUDTable' ||
            context.$thisFocus.data('type') === 'reportTable'
          ) {
            var tableId = $form.find('[name=tableId]').val()
            // 確認目前這個欄位輸入的寬度是不是數字
            if (!regNum.test($('[name=tableColumnWidget]').val())) {
              pass = false
              errorMsg = '欄位寬度(%)只能輸入數字'
              $('[name=tableColumnWidget]').val(
                context.tableData[context.lastElementName].tableColumnWidget
              )
            } else if (
              tableId &&
              $('#' + tableId).length -
                context.$thisFocus.find('#' + tableId).length >
                0
            ) {
              pass = false
              errorMsg = tableId + '此ID已存在'
            } else {
              var elementList = [
                'tableColumnSearch',
                'tableColumnAlign',
                'tableColumnTitleName',
                'tableColumnName',
                'tableColumnWidget',
                'tableColumnFormatType',
                'tableColumnDataType',
                'tableColumnBtnType',
                'tableColumnText',
                'tableColumnTitle',
                'tableColumnBtnBinding',
                'tableColumnBtnBindingModal',
                'tableBtnType',
                'tableBtnText',
                'tableBtnTitle',
                'tableBtnBinding',
                'tableBtnBindingModal',
                'tableColumnInputSWitchOpen',
                'tableColumnInputSWitchClose',
                'tableColumnInputSelectBy',
                'tableColumnInputSelectDBTable',
                'tableColumnInputSelectDBColumnText',
                'tableColumnInputSelectDBColumnValue',
                'tableColumnInputSelectDBWhere',
                'tableColumnInputSelectText',
                'tableColumnInputSelectValue',
              ]
              // 先把目前的值加到暫存的資料中要從暫存的資料來判斷加總
              $.each(elementList, function (key, val) {
                var elementName, data
                var $setting = $('[name=tableColumnElement]').closest(
                  '.tableElementSetting'
                )

                var isHide = $setting
                  .find('[name=' + val + ']')
                  .closest('.col')
                  .hasClass('hide')

                if (val.search('tableBtn') >= 0) {
                  elementName = 'lastTableBtnElementName'
                  data = 'tableBtnData'
                } else if (
                  val.search('tableColumnInputSelect') >= 0 &&
                  val.search('tableColumnInputSelectDB') < 0 &&
                  val !== 'tableColumnInputSelectBy'
                ) {
                  elementName = 'lastTableEditSelectElementName'
                  data = 'tableEditSelectData'
                } else {
                  elementName = 'lastElementName'
                  data = 'tableData'
                }
                if (isHide) {
                  if (context[data][context[elementName]]) {
                    context[data][context[elementName]][val] = null
                    delete context[data][context[elementName]][val]
                  }
                } else {
                  if (
                    val === 'tableColumnBtnBinding' ||
                    val === 'tableBtnBinding' ||
                    val === 'tableColumnInputSelectBy' ||
                    val === 'tableColumnSearchSelectBy'
                  ) {
                    if (
                      val !== 'tableBtnBinding' ||
                      $('[name=tableBtnElement]').val()
                    ) {
                      context[data][context[elementName]][val] = $(
                        '[name=tableColumnElement]'
                      )
                        .closest('.tableElementSetting')
                        .find('[name=' + val + ']:checked')
                        .val()
                    }
                  } else {
                    if (
                      (val.search('tableBtn') < 0 ||
                        $('[name=tableBtnElement]').val()) &&
                      ((val !== 'tableColumnInputSelectText' &&
                        val !== 'tableColumnInputSelectValue') ||
                        $('[name=tableColumnInputSelectElement]').val())
                    ) {
                      context[data][context[elementName]][val] = $(
                        '[name=tableColumnElement]'
                      )
                        .closest('.tableElementSetting')
                        .find('[name=' + val + ']')
                        .val()
                    }
                  }
                }
              })
              var total = _.reduce(
                context.tableData,
                function (memo, num) {
                  return memo + parseInt(num.tableColumnWidget)
                },
                0
              )
              if (total > 100) {
                pass = false
                errorMsg = '欄位寬度(%)加總不可大於100'
              } else if (total < 100) {
                alert('欄位寬度(%)加總沒有100喔')
              }
            }
          }

          // 如果都符合條件就可以把設定值套用在元件上了
          if (pass) {
            context.saveNewValue($form, ele)
          } else {
            alert(errorMsg)
          }
        } else {
          alert('驗證方式選擇數字大小和長度時須填寫最大值或最小值')
        }
      })

      // 有勾form才可以設定form和button ID
      $('#settingElementForm').on(
        'change',
        '[name=widgetForm], [name=modalForm]',
        function (evt) {
          evt.preventDefault()
          if ($(this).prop('checked')) {
            var tableList = {}
            $('table')
              .closest('.dataTable')
              .each(function () {
                tableList[$(this).data('id')] = $(this).attr('id')
              })
            servkit.initSelectWithList(
              tableList,
              $('[name=' + $(this).attr('name') + 'ButtonTableBinding]')
            )
            $('[name=' + $(this).attr('name') + 'ButtonTableBinding]').prepend(
              '<option value="">none</option>'
            )
            $('[name=' + $(this).attr('name') + 'ButtonTableBinding]').val(
              context.elementData[context.$thisFocus.data('id')][
                $(this).attr('name') + 'ButtonTableBinding'
              ]
            )
            $('[name=' + $(this).attr('name') + 'Id]')
              .closest('section')
              .removeClass('hide')
          } else {
            $('[name=' + $(this).attr('name') + 'Id]')
              .closest('section')
              .addClass('hide')
          }
        }
      )

      // 驗證選擇
      $('[name=formValidate]').on('change', function () {
        // 沒有選擇的話把提示字輸入區域藏起來
        if ($(this).val() === '') {
          $('[name=formValidateInfo]').closest('section').addClass('hide')
          $('[name=formValidateInfo]').val('')
        } else {
          $('[name=formValidateInfo]').closest('section').removeClass('hide')
        }
        // 如果是數字大小或長度的時候可以輸入最大值最小值
        if ($(this).val() === 'range' || $(this).val() === 'lengthrange') {
          $('[name=formValidateMax]').closest('section').removeClass('hide')
        } else {
          $('[name=formValidateMax]').closest('section').addClass('hide')
          $('[name=formValidateMax]').val('')
          $('[name=formValidateMin]').val('')
        }
      })

      // 開始結束日期天數限制
      $('[name=formBothLimit]').on('change', function (evt) {
        evt.preventDefault()
        // 如果有要限制天數才顯示輸入區域
        if ($(this).prop('checked')) {
          $('[name=formBothLimitDays]').closest('section').removeClass('hide')
        } else {
          $('[name=formBothLimitDays]').closest('section').addClass('hide')
          $('[name=formBothLimitDays]').val('')
        }
      })

      // select選擇資料來源
      $('.setting')
        .on(
          'change',
          '[name=formSelectBy], [name=tableColumnInputSelectBy]',
          function (evt) {
            evt.preventDefault()
            var elementName = $(this).attr('name').replace('By', '')
            if ($('input[name=' + elementName + 'By]:checked').val() === 'DB') {
              $('[name=' + elementName + 'Quantity]')
                .closest('.inline-group')
                .addClass('hide')
              $('[name=' + elementName + 'DBTable]')
                .closest('.inline-group')
                .removeClass('hide')
              var selectMap = {}
              context.$thisFocus
                .closest('form')
                .find('select')
                .each(function () {
                  if (
                    $(this).data('id') !==
                    context.$thisFocus.find('select').data('id')
                  ) {
                    selectMap[$(this).data('id')] =
                      $(this).attr('id') ||
                      $(this).attr('name') ||
                      $(this).data('id')
                  }
                })
              servkit.initSelectWithList(
                selectMap,
                $('[name=formSelectBinding]')
              )
              $('[name=formSelectBinding]').prepend(
                '<option value="">none</option>'
              )
              if (context.$thisFocus.find('select').data('id')) {
                $('[name=formSelectBinding]').val(
                  context.elementData[
                    context.$thisFocus.find('select').data('id')
                  ].formSelectBinding || ''
                )
                $('[name=formSelectBindingColumn]').val(
                  context.elementData[
                    context.$thisFocus.find('select').data('id')
                  ].formSelectBindingColumn
                )
              }
            } else {
              $('[name=' + elementName + 'DBTable]')
                .closest('.inline-group')
                .addClass('hide')
              $('[name=' + elementName + 'Quantity]')
                .closest('.inline-group')
                .removeClass('hide')
            }
          }
        )
        .on(
          'change',
          '[name=formSelectQuantity], [name=tableColumnInputSelectQuantity], [name=tableColumnTextSelectQuantity]',
          function () {
            // select改變數量
            var regNum = /^[0-9]*$/
            var elementName = $(this).attr('name').replace('SelectQuantity', '')
            var dataResource = 'selectData'
            if (elementName === 'tableColumnInput') {
              dataResource = 'tableEditSelectData'
            } else if (elementName === 'tableColumnText') {
              dataResource = 'tableTextSelectData'
            }
            // 目前select的option數量
            var nowQuantity = Object.keys(context[dataResource]).length
            // 輸入的數量
            var quantity = $(this).val()
            // 找到包含所以設定option的元件最接近的那一層
            var $elementSection = $(this).closest('.inline-group')
            // 判斷是不是合理的數量
            if (regNum.test(quantity)) {
              // 執行次數為數量差
              _(Math.abs(nowQuantity - quantity)).times(function () {
                var id
                if (nowQuantity - quantity > 0) {
                  // 目前數量比輸入的多就刪掉多的部分
                  id = 'option' + Object.keys(context[dataResource]).length
                  context[dataResource][id] = null
                  delete context[dataResource][id]
                } else {
                  // 目前數量比輸入的少就補足
                  id =
                    'option' + (Object.keys(context[dataResource]).length + 1)
                  context[dataResource][id] = {}
                  context[dataResource][id][elementName + 'SelectText'] = id
                  context[dataResource][id][elementName + 'SelectValue'] = ''
                }
              })
              var lastElementName
              if (elementName === 'form') {
                lastElementName = 'lastElementName'
              } else if (elementName === 'tableColumnText') {
                lastElementName = 'lastTableTextSelectElementName'
              } else {
                lastElementName = 'lastTableEditSelectElementName'
              }
              // 設定元件值和文字的區域
              context.changeSelectSetting(
                $elementSection,
                lastElementName,
                elementName + 'SelectElement',
                context[dataResource],
                [elementName + 'SelectText', elementName + 'SelectValue']
              )
            } else {
              alert('只能輸入數字')
              // 把數量的值改成目前option的數量
              $(this).val(nowQuantity.toString())
            }
          }
        )
        .on(
          'change',
          '[name=formSelectElement], [name=tableColumnInputSelectElement], [name=tableColumnTextSelectElement]',
          function () {
            // 改變select選項名稱和值
            var $elementSection = $(this).closest('.inline-group')
            var elementName = $(this).attr('name').replace('SelectElement', '')
            var dataResource = 'selectData'
            if (elementName === 'tableColumnInput') {
              dataResource = 'tableEditSelectData'
            } else if (elementName === 'tableColumnText') {
              dataResource = 'tableTextSelectData'
            }
            var lastElementName
            if (elementName === 'form') {
              lastElementName = 'lastElementName'
            } else if (elementName === 'tableColumnText') {
              lastElementName = 'lastTableTextSelectElementName'
            } else {
              lastElementName = 'lastTableEditSelectElementName'
            }
            context.changeSelectElement(
              $elementSection,
              lastElementName,
              elementName + 'SelectElement',
              context[dataResource],
              [elementName + 'SelectText', elementName + 'SelectValue']
            )
          }
        )

      // 選擇table資料型態(button和超連結)
      $('[name=tableColumnDataType]').on('change', function (evt) {
        evt.preventDefault()
        // var thisColumnData = context.elementData[context.$thisFocus.find('table').data('id')].column[$('[name=tableColumnElement]').val()]
        var thisColumnData =
          context.tableData[$('[name=tableColumnElement]').val()]
        if ($(this).val() === 'text') {
          thisColumnData.tableColumnBtnBinding = 'none'
          $('[name=tableColumnBtnBinding]').closest('.col').addClass('hide')
          $('[name=tableColumnBtnType]').closest('.col').addClass('hide')
          $('[name=tableColumnText]').closest('.col').addClass('hide')
          $('[name=tableColumnTitle]').closest('.col').addClass('hide')
        } else {
          if ($(this).val() === 'href') {
            $('[name=tableColumnBtnType]').closest('.col').addClass('hide')
          } else if ($(this).val() === 'button') {
            $('[name=tableColumnBtnType]').closest('.col').removeClass('hide')
          }
          $('[name=tableColumnText]').closest('.col').removeClass('hide')
          $('[name=tableColumnTitle]').closest('.col').removeClass('hide')
          $('[name=tableColumnBtnBinding]').closest('.col').removeClass('hide')
        }
        if (
          !thisColumnData.tableColumnBtnBinding ||
          thisColumnData.tableColumnBtnBinding === 'none'
        ) {
          $('[name=tableColumnBtnBinding]')
            .closest('.inline-group')
            .find('[value=none]')
            .prop('checked', true)
        } else {
          $('[name=tableColumnBtnBinding]')
            .closest('.inline-group')
            .find('[value=' + thisColumnData.tableColumnBtnBinding + ']')
            .prop('checked', true)
        }
      })

      // 選擇button行為
      $('.tableElementSetting')
        .on(
          'change',
          '[name=tableColumnBtnBinding], [name=tableBtnBinding]',
          function (evt) {
            evt.preventDefault()
            if ($(this).prop('checked')) {
              var checkedName = $(this).attr('name')
              var checkedValue = $(this).val()
              $(this)
                .closest('.col')
                .find('.inline-group')
                .last()
                .find('.col')
                .each(function () {
                  if (
                    $(this).find('select, input').attr('name') ===
                    checkedName + checkedValue
                  ) {
                    $(this).removeClass('hide')
                  } else {
                    $(this).addClass('hide')
                  }
                })
              if (checkedValue === 'Modal') {
                var modalList = {}
                $('.demo-modal').each(function () {
                  modalList[$(this).attr('id')] = $(this).attr('id')
                })
                servkit.initSelectWithList(
                  modalList,
                  $('[name=' + checkedName + checkedValue + ']')
                )
              }
            }
          }
        )
        .on('change', '[name=tableColumnInputType]', function () {
          // table欄位編輯選擇為select以及switch才長出設定
          var selectName = 'tableColumnInputSelect'
          var data = 'tableEditSelectData'
          if (
            $(this).val() === 'select' ||
            $(this).val() === 'multipleSelect'
          ) {
            if (
              context.tableData[context.lastElementName][selectName + 'By'] ===
              undefined
            ) {
              context.tableData[context.lastElementName][selectName + 'By'] =
                'user'
              context.tableData[context.lastElementName][
                selectName + 'Element'
              ] = {}
            }
            $('[name=' + selectName + 'By]')
              .closest('.inline-group')
              .find(
                '[value=' +
                  context.tableData[context.lastElementName][
                    selectName + 'By'
                  ] +
                  ']'
              )
              .prop('checked', true)

            if (
              context.tableData[context.lastElementName][selectName + 'By'] ===
              'user'
            ) {
              $('[name=' + selectName + 'Quantity]').val(
                Object.keys(
                  context.tableData[context.lastElementName][
                    selectName + 'Element'
                  ]
                ).length.toString()
              )
              context[data] = Object.assign(
                {},
                context.tableData[context.lastElementName][
                  selectName + 'Element'
                ]
              )
              $('[name=' + selectName + 'Quantity]').trigger('change')
            }

            $('[name=' + selectName + 'By]').trigger('change')
            $('[name=' + selectName + 'By]')
              .closest('.col')
              .removeClass('hide')
          } else {
            $('[name=' + selectName + 'By]')
              .closest('.col')
              .addClass('hide')
          }
          if ($(this).val() === 'switch') {
            var columnName
            var hasSwitch = _.find(context.tableData, (val, key) => {
              columnName = key
              return val.tableColumnInputType === 'switch'
            })
            if (
              hasSwitch === undefined ||
              columnName === $('[name=tableColumnElement]').val()
            ) {
              $('[name=tableColumnInputSWitchOpen]').val(
                context.tableData[context.lastElementName][
                  'tableColumnInputSWitchOpen'
                ] || 'Y'
              )
              $('[name=tableColumnInputSWitchClose]').val(
                context.tableData[context.lastElementName][
                  'tableColumnInputSWitchClose'
                ] || 'N'
              )
              $('[name=tableColumnInputSWitchOpen]')
                .closest('.setting-group')
                .removeClass('hide')
            } else {
              alert('switch只能有一個')
              $('[name=tableColumnInputType]').val(
                context.tableData[context.lastElementName][
                  'tableColumnInputType'
                ]
              )
              $('[name=tableColumnInputType]').trigger('change')
            }
          } else {
            $('[name=tableColumnInputSWitchOpen]')
              .closest('.setting-group')
              .addClass('hide')
          }
        })

      // radio和checkbox改變數量
      $('[name=formCheckBoxRadioQuantity]').on('change', function () {
        var regNum = /^[0-9]*$/
        // 判斷是radio還是checkbox
        var type = context.$thisFocus.data('type')
        // 目前radio或checkbox的數量
        var nowQuantity = Object.keys(context[type + 'Data']).length
        // 輸入的數量
        var quantity = $(this).val()
        // 找到包含所以設定元件最接近的那一層
        var $elementSection = $(this).closest('section')
        // 判斷是不是合理的數量
        if (regNum.test(quantity)) {
          // 執行次數為數量差
          _(Math.abs(nowQuantity - quantity)).times(function () {
            var id
            if (nowQuantity - quantity > 0) {
              // 目前數量比輸入的多就刪掉多的部分
              id = type + Object.keys(context[type + 'Data']).length
              context[type + 'Data'][id] = null
              delete context[type + 'Data'][id]
            } else {
              // 目前數量比輸入的少就補足
              id = type + (Object.keys(context[type + 'Data']).length + 1)
              context[type + 'Data'][id] = {
                formCheckBoxRadioText: id,
                formCheckBoxRadioValue: '',
                defaultCheck: false,
              }
            }
          })
          // 設定元件值和文字的區域
          context.changeSelectSetting(
            $elementSection,
            'lastElementName',
            'formCheckBoxRadioElement',
            context[type + 'Data'],
            ['formCheckBoxRadioText', 'formCheckBoxRadioValue']
          )
          // 畫出預設勾選的選項
          context.setCheckboxRadioDefaultCheckedSelect(
            $elementSection,
            context[type + 'Data']
          )
        } else {
          alert('只能輸入數字')
          // 把數量的值改成目前radio或checkbox的數量
          $(this).val(nowQuantity.toString())
        }
      })

      // 改變radio或checkbox文字
      $('[name=formCheckBoxRadioElement]').on('change', function () {
        var $elementSection = $(this).closest('section')
        var type = context.$thisFocus.data('type')
        context.changeSelectElement(
          $elementSection,
          'lastElementName',
          'formCheckBoxRadioElement',
          context[type + 'Data'],
          ['formCheckBoxRadioText', 'formCheckBoxRadioValue']
        )
      })

      // table欄位改變數量
      $('[name=tableColumnQuantity]').on('change', function () {
        var regNum = /^[0-9]*$/
        // 目前欄位的option數量
        var nowQuantity = Object.keys(context.tableData).length
        // 輸入的數量
        var quantity = $(this).val()
        // 找到包含所以設定option的元件最接近的那一層
        var $elementSection = $(this).closest('section')
        var elementList = [
          'tableColumnSearch',
          'tableColumnAlign',
          'tableColumnTitleName',
          'tableColumnName',
          'tableColumnWidget',
          'tableColumnFormatType',
          'tableColumnDataType',
          'tableColumnBtnType',
          'tableColumnText',
          'tableColumnTitle',
          'tableColumnBtnBinding',
          'tableColumnBtnBindingModal',
          'tableColumnInputType',
          'tableColumnInputDisabled',
          'tableColumnChangeText',
        ]
        // 判斷是不是合理的數量
        if (regNum.test(quantity)) {
          // 執行次數為數量差
          _(Math.abs(nowQuantity - quantity)).times(function () {
            var id
            if (nowQuantity - quantity > 0) {
              // 目前數量比輸入的多就刪掉多的部分
              id = 'column' + Object.keys(context.tableData).length
              context.tableData[id] = null
              delete context.tableData[id]
            } else {
              // 目前數量比輸入的少就補足
              id = 'column' + (Object.keys(context.tableData).length + 1)
              context.tableData[id] = {
                tableColumnSearch: 'input',
                tableColumnAlign: 'left',
                tableColumnFormatType: 'text',
                tableColumnDataType: 'text',
                tableColumnTitleName:
                  '欄位' + (Object.keys(context.tableData).length + 1),
                tableColumnName: id,
                tableColumnWidget: '20',
                tableColumnInputDisabled: 'none',
              }
              if (context.$thisFocus.data('type') === 'CRUDTable') {
                context.tableData[id].tableColumnInputType = 'input'
              } else if (context.$thisFocus.data('type') === 'reportTable') {
                context.tableData[id].tableColumnChangeText = 'none'
              }
            }
          })

          // option選項先刪掉之前的內容再加新的並且預設選擇第一個option
          $elementSection
            .find('[name=tableColumnElement]')
            .find('option')
            .remove()
          $('[name=tableOrderColumn]').find('option').remove()
          var tableDataMap = {}
          _.each(context.tableData, function (num, ele) {
            tableDataMap[parseInt(ele.replace('column', '')) - 1] =
              num.tableColumnName
            $elementSection
              .find('[name=tableColumnElement]')
              .append(
                '<option value="' +
                  ele +
                  '">' +
                  num.tableColumnName +
                  '</option>'
              )
            $('[name=tableOrderColumn]').append(
              '<option value="' +
                (parseInt(ele.replace('column', '')) - 1) +
                '">' +
                num.tableColumnName +
                '</option>'
            )
          })
          servkit.initSelectWithList(
            tableDataMap,
            $('[name=tableExportColumns]'),
            true
          )
          servkit.initSelectWithList(tableDataMap, $('[name=chartColumn]'))
          servkit.initSelectWithList(tableDataMap, $('[name=chartXTick]'))
          servkit.initSelectWithList(tableDataMap, $('[name=chartYTick]'))
          $elementSection
            .find('[name=tableColumnElement]')
            .val(
              $elementSection
                .find('[name=tableColumnElement] option:first')
                .val()
            )
          $('[name=tableOrderColumn]').val(
            $('[name=tableOrderColumn]').find('option').first().val()
          )
          context.lastElementName = $elementSection
            .find('[name=tableColumnElement] option:selected')
            .val()
          context.setNewSelectDataToElement(
            $elementSection,
            'lastElementName',
            context.tableData,
            elementList
          )
          $('[name=tableColumnElement]').trigger('change')
        } else {
          alert('只能輸入數字')
          // 把數量的值改成目前option的數量
          $(this).val(nowQuantity.toString())
        }
      })

      // 改變table欄位選項名稱和值
      $('[name=tableColumnElement]').on('change', function () {
        var $elementSection = $(this).closest('section')
        var elementList = [
          'tableColumnSearch',
          'tableColumnAlign',
          'tableColumnTitleName',
          'tableColumnName',
          'tableColumnWidget',
          'tableColumnFormatType',
          'tableColumnDataType',
          'tableColumnBtnType',
          'tableColumnText',
          'tableColumnTitle',
          'tableColumnBtnBinding',
          'tableColumnBtnBindingModal',
          'tableColumnInputType',
          'tableColumnInputDisabled',
          'tableColumnChangeText',
        ]
        if (
          !$('[name=tableColumnInputSelectBy]').closest('.col').hasClass('hide')
        ) {
          elementList.push('tableColumnInputSelectBy')
          if (
            !$('[name=tableColumnInputSelectDBTable]')
              .closest('.inline-group')
              .hasClass('hide')
          ) {
            elementList.push('tableColumnInputSelectDBTable')
            elementList.push('tableColumnInputSelectDBColumnText')
            elementList.push('tableColumnInputSelectDBColumnValue')
            elementList.push('tableColumnInputSelectDBWhere')
          } else if (
            !$('[name=tableColumnInputSelectQuantity]')
              .closest('.inline-group')
              .hasClass('hide') &&
            $('[name=tableColumnInputSelectElement]').val()
          ) {
            $('[name=tableColumnInputSelectElement]').trigger('change')
            context.tableData[
              context.lastElementName
            ].tableColumnInputSelectElement = Object.assign(
              {},
              context.tableEditSelectData
            )
          }
        }
        if (
          !$('[name=tableColumnTextDBTable]')
            .closest('.inline-group')
            .hasClass('hide')
        ) {
          elementList.push('tableColumnTextDBTable')
          elementList.push('tableColumnTextDBColumnText')
          elementList.push('tableColumnTextDBColumnValue')
          elementList.push('tableColumnTextDBWhere')
        } else if (
          !$('[name=tableColumnTextSelectQuantity]')
            .closest('.inline-group')
            .hasClass('hide') &&
          $('[name=tableColumnTextSelectElement]').val()
        ) {
          $('[name=tableColumnTextSelectElement]').trigger('change')
          context.tableData[
            context.lastElementName
          ].tableColumnTextSelectElement = Object.assign(
            {},
            context.tableTextSelectData
          )
        }

        if (
          !$('[name=tableColumnInputSWitchOpen]')
            .closest('.setting-group')
            .hasClass('hide')
        ) {
          elementList.push('tableColumnInputSWitchOpen')
          elementList.push('tableColumnInputSWitchClose')
        }
        context.changeSelectElement(
          $elementSection,
          'lastElementName',
          'tableColumnElement',
          context.tableData,
          elementList
        )
        context.tableEditSelectData = Object.assign(
          {},
          context.tableData[context.lastElementName]
            .tableColumnInputSelectElement
        )
        context.tableTextSelectData = Object.assign(
          {},
          context.tableData[context.lastElementName]
            .tableColumnTextSelectElement
        )

        $('[name=tableColumnSearch]').trigger('change')
        $('[name=tableColumnDataType]').trigger('change')
        $('[name=tableColumnBtnBinding]').trigger('change')
        $('[name=tableColumnInputType]').trigger('change')
        $('[name=tableColumnChangeText]').trigger('change')
        if (
          context.tableData[context.lastElementName].tableColumnInputSelectBy
        ) {
          $('[name=tableColumnInputSelectBy]')
            .closest('.inline-group')
            .find(
              '[value=' +
                context.tableData[context.lastElementName]
                  .tableColumnInputSelectBy +
                ']'
            )
            .prop('checked', true)
          $('[name=tableColumnInputSelectBy]').trigger('change')
        }
      })

      // table客製化按鈕改變數量
      $('[name=tableBtnQuantity]').on('change', function () {
        var regNum = /^[0-9]*$/
        // 目前欄位的option數量
        var nowQuantity = Object.keys(context.tableBtnData).length
        // 輸入的數量
        var quantity = $(this).val()
        // 找到包含所以設定option的元件最接近的那一層
        var $elementSection = $(this).closest('.inline-group')
        var elementList = [
          'tableBtnType',
          'tableBtnText',
          'tableBtnTitle',
          'tableBtnBinding',
          'tableBtnBindingModal',
        ]
        // 判斷是不是合理的數量
        if (regNum.test(quantity)) {
          // 執行次數為數量差
          _(Math.abs(nowQuantity - quantity)).times(function () {
            var id
            if (nowQuantity - quantity > 0) {
              // 目前數量比輸入的多就刪掉多的部分
              id = 'button' + Object.keys(context.tableBtnData).length
              context.tableBtnData[id] = null
              delete context.tableBtnData[id]
            } else {
              // 目前數量比輸入的少就補足
              id = 'button' + (Object.keys(context.tableBtnData).length + 1)
              context.tableBtnData[id] = {
                tableBtnBinding: 'none',
              }
            }
          })

          // option選項先刪掉之前的內容再加新的並且預設選擇第一個option
          $elementSection.find('[name=tableBtnElement]').find('option').remove()
          _.each(context.tableBtnData, function (num, ele) {
            $elementSection
              .find('[name=tableBtnElement]')
              .append('<option value="' + ele + '">' + ele + '</option>')
          })
          $elementSection
            .find('[name=tableBtnElement]')
            .val(
              $elementSection.find('[name=tableBtnElement] option:first').val()
            )
          context.lastTableBtnElementName = $elementSection
            .find('[name=tableBtnElement] option:selected')
            .val()
          context.setNewSelectDataToElement(
            $elementSection,
            'lastTableBtnElementName',
            context.tableBtnData,
            elementList
          )
        } else {
          alert('只能輸入數字')
          // 把數量的值改成目前option的數量
          $(this).val(nowQuantity.toString())
        }
      })

      // 改變table客製化按鈕選項名稱和值
      $('[name=tableBtnElement]').on('change', function () {
        var $elementSection = $(this).closest('.inline-group')
        var elementList = [
          'tableBtnType',
          'tableBtnText',
          'tableBtnTitle',
          'tableBtnBinding',
          'tableBtnBindingModal',
        ]
        context.changeSelectElement(
          $elementSection,
          'lastTableBtnElementName',
          'tableBtnElement',
          context.tableBtnData,
          elementList
        )
        $('[name=tableBtnBinding]').trigger('change')
      })

      // table資料來源
      $('[name=tableDataFrom]').on('change', function (evt) {
        evt.preventDefault()
        if ($('input[name=tableDataFrom]:checked').val() === 'DB') {
          $('[name=tableDataFromTableModel]').val(
            context.tableData.tableDataFromTableModel
          )
          $('[name=tableDataFromKey]').val(context.tableData.tableDataFromKey)
          $('[name=tableDataFromWhere]').val(
            context.tableData.tableDataFromWhere
          )
          $('[name=tableDataFromApp]').closest('.inline-group').addClass('hide')
          $('[name=tableDataFromTableModel]')
            .closest('.inline-group')
            .removeClass('hide')
        } else {
          $('[name=tableDataFromApp]')
            .closest('.inline-group')
            .removeClass('hide')
          $('[name=tableDataFromTableModel]')
            .closest('.inline-group')
            .addClass('hide')
        }
      })

      // 換了app就應該要換function
      $('#app_id').on('change', function (evt) {
        evt.preventDefault()
        context.drawFuncSelect()
      })

      // 換了app就應該要換data/json
      $('[name=tableDataFromApp]').on('change', function (evt, fileData) {
        evt.preventDefault()
        context.drawJsonFileSelect(fileData)
      })

      // report table有勾匯出才可以設定匯出的檔名
      $('[name=tableExport]').on('change', function () {
        if ($(this).prop('checked')) {
          $('[name=tableExportFilename]')
            .closest('.inline-group')
            .removeClass('hide')
        } else {
          $('[name=tableExportFilename]')
            .closest('.inline-group')
            .addClass('hide')
        }
      })

      // 有勾繪製圖表才可以設定圖表
      $('[name=chartExists]').on('change', function () {
        if ($(this).prop('checked')) {
          $('[name=chartType]').closest('.inline-group').removeClass('hide')
        } else {
          $('[name=chartType]').closest('.inline-group').addClass('hide')
        }
        $('[name=chartType]').trigger('change')
      })

      // 有勾是否轉換文字才可以設定顯示的文字
      $('[name=tableColumnChangeText]').on('change', function () {
        if ($('input[name=tableColumnChangeText]:checked').val() === 'DB') {
          $('[name=tableColumnTextDBTable]').val(
            context.tableData[$('[name=tableColumnElement]').val()]
              .tableColumnTextDBTable
          )
          $('[name=tableColumnTextDBColumnText]').val(
            context.tableData[$('[name=tableColumnElement]').val()]
              .tableColumnTextDBColumnText
          )
          $('[name=tableColumnTextDBColumnValue]').val(
            context.tableData[$('[name=tableColumnElement]').val()]
              .tableColumnTextDBColumnValue
          )
          $('[name=tableColumnTextDBWhere]').val(
            context.tableData[$('[name=tableColumnElement]').val()]
              .tableColumnTextDBWhere
          )
          $('[name=tableColumnTextDBTable]')
            .closest('.inline-group')
            .removeClass('hide')
          $('[name=tableColumnTextSelectQuantity]')
            .closest('.inline-group')
            .addClass('hide')
        } else if (
          $('input[name=tableColumnChangeText]:checked').val() === 'user'
        ) {
          if (
            context.tableData[$('[name=tableColumnElement]').val()]
              .tableColumnTextSelectElement
          ) {
            $('[name=tableColumnTextSelectQuantity]').val(
              Object.keys(
                context.tableData[$('[name=tableColumnElement]').val()]
                  .tableColumnTextSelectElement
              ).length
            )
            context.tableTextSelectData = Object.assign(
              {},
              context.tableData[$('[name=tableColumnElement]').val()]
                .tableColumnTextSelectElement
            )
          } else {
            $('[name=tableColumnTextSelectQuantity]').val('0')
            context.tableTextSelectData = {}
          }
          $('[name=tableColumnTextSelectQuantity]').trigger('change')
          $('[name=tableColumnTextDBTable]')
            .closest('.inline-group')
            .addClass('hide')
          $('[name=tableColumnTextSelectQuantity]')
            .closest('.inline-group')
            .removeClass('hide')
        } else {
          $('[name=tableColumnTextDBTable]')
            .closest('.inline-group')
            .addClass('hide')
          $('[name=tableColumnTextSelectQuantity]')
            .closest('.inline-group')
            .addClass('hide')
        }
      })

      // 圖表為bar或line才可設定x's label, y's label和標準值
      $('[name=chartType]').on('change', function () {
        if ($(this).val() === 'bars' || $(this).val() === 'lines') {
          $('[name=chartXLabel]').closest('.col').removeClass('hide')
          $('[name=chartYLabel]').closest('.col').removeClass('hide')
          $('[name=chartStandard]').closest('.col').removeClass('hide')
        } else {
          $('[name=chartXLabel]').closest('.col').addClass('hide')
          $('[name=chartYLabel]').closest('.col').addClass('hide')
          $('[name=chartStandard]').closest('.col').addClass('hide')
        }
      })

      // 匯出
      $('#export').on('click', function (evt) {
        evt.preventDefault()
        if ($('#app_id').val() && $('#func_id').val()) {
          // 如果有輸入檔名要先確認有沒有重複
          if ($('#configFileName').val() === '') {
            context.createExport()
          } else {
            servkit.ajax(
              {
                url: 'api/formeditor/html/checkConfigFileNameExists',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                  app: $('#app_id').val(),
                  func: $('#func_id').val(),
                  name: $('#configFileName').val(),
                }),
              },
              {
                success: function (data) {
                  if (data) {
                    alert($('#configFileName').val() + '為重複名稱')
                  } else {
                    context.createExport()
                  }
                },
              }
            )
          }
        } else {
          alert('請選擇app和function')
        }
      })

      // 查詢所有config檔
      $('#import').on('click', function (evt) {
        evt.preventDefault()
        $('#allConfigFiles tbody').remove()
        servkit.ajax(
          {
            url: 'api/formeditor/html/getConfigFile',
            type: 'GET',
          },
          {
            success: function (data) {
              $('#inputFilename').text('')
              _.each(data, function (num, key) {
                $('#allConfigFiles').append(
                  '<tr><td><a href="javascript: void(0)" data-app="' +
                    key +
                    '">' +
                    key +
                    '</a></td></tr>'
                )
                $('#allConfigFiles').find('td').last().data('func', num)
              })
            },
          }
        )
      })

      // 選擇要匯入的app和function
      $('#allConfigFiles').on('click', 'tbody td', function (evt) {
        evt.preventDefault()
        var data
        $('.fa-refresh').removeClass('hide').addClass('fa-spin')
        if ($(this).data('func')) {
          data = $(this).data('func')
          $('#inputFilename').text('(' + $(this).find('a').data('app') + '/)')
          $('#inputFilename').data('app', $(this).find('a').data('app'))
          $('#allConfigFiles tbody').remove()
          _.each(data, function (num, key) {
            $('#allConfigFiles').append(
              '<tr><td><a href="javascript: void(0)" data-func="' +
                key +
                '">' +
                key +
                '</a></td></tr>'
            )
            $('#allConfigFiles').find('td').last().data('jsonFile', num)
          })
        } else if ($(this).data('jsonFile')) {
          data = $(this).data('jsonFile')
          var path = $('#inputFilename').text().replace(')', '')
          $('#inputFilename').text(path + $(this).find('a').data('func') + '/)')
          $('#inputFilename').data('func', $(this).find('a').data('func'))
          $('#allConfigFiles tbody').remove()
          _.each(data, function (num) {
            $('#allConfigFiles').append(
              '<tr><td><a href="javascript: void(0)" class="configFile" data-filename="' +
                num +
                '">' +
                num +
                '</a></td></tr>'
            )
          })
        }
        setTimeout(function () {
          $('.filename')
            .find('.fa-refresh')
            .addClass('hide')
            .removeClass('fa-spin')
        }, 500)
      })

      // 匯入
      $('#allConfigFiles').on('click', '.configFile', function (evt) {
        evt.preventDefault()
        servkit.ajax(
          {
            url: 'api/formeditor/html/getConfigData',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              app: $('#inputFilename').data('app'),
              func: $('#inputFilename').data('func'),
              file: $(this).data('filename').toString(),
            }),
          },
          {
            success: function (data) {
              // 先刪掉目前的(直接刪掉框)
              _.each(context.elementData, function (num, key) {
                if (num && (num.type === 'widget' || num.type === 'modal')) {
                  context.$thisFocus = $('[data-id=' + key + ']')
                  context.clickRemoveElement()
                }
              })
              // 排序重新初始
              context.elementOrder = {
                widget: 0,
                modal: 0,
                widgetElement: [],
                modalElement: [],
              }
              // form的數量重新算
              context.formQuantity = 0
              // 把config檔的資料放到context.elementData
              context.elementData = JSON.parse(data)
              // 把context.elementData轉成以框為單位的格式
              var newData = context.tempalteEngine.splitWidgetModal(
                Object.assign({}, context.elementData)
              )
              // 建元件
              context.reDrawElement(newData.modal)
              context.reDrawElement(newData.widget)
              // 找到目前context.elementData裡最後的元件代碼(如果要加元件需要用到)
              context.elementQuantity = _.max(
                _.map(_.allKeys(context.elementData), function (value) {
                  return parseInt(value.replace('element', ''))
                })
              )
              // 完成後把modal關掉
              $('#configFilesModal').modal('hide')
            },
          }
        )
      })

      // 下載
      servkit.downloadFile(
        '#download',
        '/api/formeditor/html/download',
        function () {
          var data = Object.assign({}, context.elementData)
          return {
            app_id: $('#app_id').val(),
            func_id: $('#func_id').val(),
            code: context.tempalteEngine.toHtml(data).replace(/\n/g, '\\n'),
          }
        }
      )

      // 滑鼠一道按鈕上時，在範例圖示加上陰影
      $('#elementsBtn').on('mouseover', 'div', function (evt) {
        evt.preventDefault()
        if (context.$lastEle) {
          context.$lastEle.removeClass('focus')
        }
        context.$lastEle = $('#elementsEx').find(
          '[data-type=' + $(this).attr('data-type').replace('Btn', '') + ']'
        )
        context.$lastEle.addClass('focus')
      })
    },
    util: {
      elementData: {},
      elementQuantity: 0,
      formQuantity: 0,
      $thisFocus: null,
      $lastEle: null,
      radioData: {},
      checkboxData: {},
      selectData: {},
      tableData: {},
      tableBtnData: {},
      tableEditSelectData: {},
      tableSearchSelectData: {},
      tableTextSelectData: {},
      changeSelectMap: {},
      elementOrder: {
        widget: 0,
        modal: 0,
        widgetElement: [],
        modalElement: [],
      }, // 排序元件用
      lastElementName: '', // 給radio, checckbox, select data, table column修改元件用
      lastTableBtnElementName: '',
      lastTableEditSelectElementName: '',
      lastTableSearchSelectElementName: '',
      lastTableTextSelectElementName: '',
      tempalteEngine: null,
      changeFocusElement: function ($newEle, $editor, byConfig) {
        // 在現在點到的元件上加陰影和設定元件編輯的值
        var ctx = this
        console.log(ctx.elementData)
        // 把$thisFocus換成剛剛點的元件
        if (ctx.$thisFocus) {
          ctx.$thisFocus.removeClass('focus')
          ctx.$thisFocus.find('.elementDelete').addClass('hide')
          if (ctx.$thisFocus.data('type') === 'startEndDate') {
            ctx.$thisFocus
              .find('div:not(.elementDelete)')
              .first()
              .css('padding-top', '0px')
          }
        }
        ctx.$thisFocus = $newEle
        ctx.$thisFocus.addClass('focus')
        ctx.$thisFocus.find('.elementDelete').first().removeClass('hide')

        // 對不同元件長出不同編輯畫面
        if (ctx.$thisFocus.data('type') === 'text') {
          $('[name=formValidate]').closest('section').removeClass('hide')
          if (
            ctx.elementData[ctx.$thisFocus.find('input').data('id')]
              .formValidate !== ''
          ) {
            $('[name=formValidateInfo]').closest('section').removeClass('hide')
          }
          $('[name=formRegDirection]').closest('section').removeClass('hide')
        } else {
          $('[name=formValidate]').closest('section').addClass('hide')
          $('[name=formValidateInfo]').closest('section').addClass('hide')
          $('[name=formRegDirection]').closest('section').addClass('hide')
          $('[name=formValidateMax]').closest('section').addClass('hide')
          $('[name=formValidate]').val('')
        }
        if (ctx.$thisFocus.data('type') === 'date') {
          $('[name=formDateConfig]').closest('section').removeClass('hide')
        } else {
          $('[name=formDateConfig]').closest('section').addClass('hide')
        }
        if (ctx.$thisFocus.data('type') === 'startEndDate') {
          if (
            ctx.elementData[
              ctx.$thisFocus
                .find('input')
                .first()
                .data('id')
                .replace('start', '')
            ].formSameLine
          ) {
            ctx.$thisFocus
              .find('div:not(.elementDelete)')
              .first()
              .css('padding-top', '17px')
          }
          $('[name=formTitle]').closest('section').addClass('hide')
          $('[name=formStartTitle]').closest('section').removeClass('hide')
          $('[name=formId]').closest('section').addClass('hide')
          $('[name=formStartId]').closest('section').removeClass('hide')
          $('[name=formName]').closest('section').addClass('hide')
          $('[name=formSameLine]').closest('section').removeClass('hide')
          $('[name=formStartName]').closest('section').removeClass('hide')
          $('[name=formBothToday]').closest('section').removeClass('hide')
          $('[name=formBothLimitDays]').closest('section').removeClass('hide')
        } else {
          $('[name=formTitle]').closest('section').removeClass('hide')
          $('[name=formStartTitle]').closest('section').addClass('hide')
          $('[name=formId]').closest('section').removeClass('hide')
          $('[name=formStartId]').closest('section').addClass('hide')
          $('[name=formName]').closest('section').removeClass('hide')
          $('[name=formSameLine]').closest('section').addClass('hide')
          $('[name=formStartName]').closest('section').addClass('hide')
          $('[name=formBothToday]').closest('section').addClass('hide')
          $('[name=formBothLimitDays]').closest('section').addClass('hide')
        }
        if (
          ctx.$thisFocus.data('type') === 'select' ||
          ctx.$thisFocus.data('type') === 'select2' ||
          ctx.$thisFocus.data('type') === 'multipleSelect'
        ) {
          $('[name=formSelectBy]').closest('section').removeClass('hide')
        } else {
          $('[name=formSelectBy]').closest('section').addClass('hide')
          ctx.selectData = {}
        }
        if (ctx.$thisFocus.data('type') === 'multipleSelect') {
          $('[name=formDefaultAll]').closest('section').removeClass('hide')
        } else {
          $('[name=formDefaultAll]').closest('section').addClass('hide')
        }
        if (
          ctx.$thisFocus.data('type') === 'radio' ||
          ctx.$thisFocus.data('type') === 'checkbox'
        ) {
          $('[name=formRequired]').closest('section').addClass('hide')
          $('[name=formId]').closest('section').addClass('hide')
          $('[name=formCheckBoxRadioQuantity]')
            .closest('section')
            .removeClass('hide')
          $('[name=formSameLine]').closest('section').removeClass('hide')
          if (ctx.$thisFocus.data('type') === 'radio') {
            $('[name=formRadioChecked]').closest('section').removeClass('hide')
            $('[name=formCheckBoxChecked]').closest('section').addClass('hide')
          } else {
            $('[name=formCheckBoxChecked]')
              .closest('section')
              .removeClass('hide')
            $('[name=formRadioChecked]').closest('section').addClass('hide')
          }
        } else {
          $('[name=formCheckBoxChecked]').closest('section').addClass('hide')
          $('[name=formRadioChecked]').closest('section').addClass('hide')
          $('[name=formRequired]').closest('section').removeClass('hide')
          $('[name=formCheckBoxRadioQuantity]')
            .closest('section')
            .addClass('hide')
          $('[name=formSameLine]').closest('section').addClass('hide')
          ctx.radioData = {}
          ctx.checkboxData = {}
        }
        if (ctx.$thisFocus.data('type') === 'label') {
          $('[name=formName]').closest('section').addClass('hide')
          $('[name=formRequired]').closest('section').addClass('hide')
          $('[name=formText]').closest('section').removeClass('hide')
        } else {
          $('[name=formName]').closest('section').removeClass('hide')
          $('[name=formText]').closest('section').addClass('hide')
        }
        if (ctx.$thisFocus.data('type') === 'hr') {
          $('[name=formTitle]').closest('section').addClass('hide')
          $('[name=formXsSize]').closest('section').addClass('hide')
          $('[name=formSmSize]').closest('section').addClass('hide')
          $('[name=formMdSize]').closest('section').addClass('hide')
          $('[name=formLgSize]').closest('section').addClass('hide')
          $('[name=formId]').closest('section').addClass('hide')
          $('[name=formName]').closest('section').addClass('hide')
          $('[name=formBindingTableColumn]').closest('section').addClass('hide')
          $('[name=formRequired]').closest('section').addClass('hide')
          $('[name=formOpacity]').closest('section').removeClass('hide')
        } else {
          $('[name=formTitle]').closest('section').removeClass('hide')
          $('[name=formXsSize]').closest('section').removeClass('hide')
          $('[name=formSmSize]').closest('section').removeClass('hide')
          $('[name=formMdSize]').closest('section').removeClass('hide')
          $('[name=formLgSize]').closest('section').removeClass('hide')
          $('[name=formOpacity]').closest('section').addClass('hide')
        }
        // 如果是含有table的widget就不能設定form
        if (
          (ctx.$thisFocus.data('type') === 'widget' ||
            ctx.$thisFocus.data('type') === 'modal') &&
          (ctx.$thisFocus.find('table').length ||
            ctx.$thisFocus.find('canvas').length)
        ) {
          $('[name=' + ctx.$thisFocus.data('type') + 'Form]')
            .closest('div')
            .addClass('hide')
        } else {
          $('[name=' + ctx.$thisFocus.data('type') + 'Form]')
            .closest('div')
            .removeClass('hide')
        }

        // crudTable才有的設定
        if (ctx.$thisFocus.data('type') === 'CRUDTable') {
          $('[name=tableColumnInputType]').closest('div').removeClass('hide')
          $('[name=tableColumnInputDisabled]')
            .closest('div')
            .removeClass('hide')
          $('[name=tableCRUDAvailable]').closest('section').removeClass('hide')
          $('[name=tableCRUDEditModal]').closest('section').removeClass('hide')
          var modalList = {}
          $('.demo-modal').each(function () {
            modalList[$(this).attr('id')] = $(this).attr('id')
          })
          servkit.initSelectWithList(modalList, $('[name=tableCRUDEditModal]'))
          $('[name=tableCRUDEditModal]').prepend(
            '<option value="">不要modal</option>'
          )
        } else {
          $('[name=tableColumnInputType]').closest('div').addClass('hide')
          $('[name=tableColumnInputDisabled]').closest('div').addClass('hide')
          $('[name=tableCRUDAvailable]').closest('section').addClass('hide')
          $('[name=tableCRUDEditModal]').closest('section').addClass('hide')
        }

        // reportTable才有的設定
        if (ctx.$thisFocus.data('type') === 'reportTable') {
          $('[name=tableExport]').closest('section').removeClass('hide')
          $('[name=chartExists]').closest('section').removeClass('hide')
          $('[name=tableColumnChangeText]').closest('.col').removeClass('hide')
          $('[name=tableColumnFormatType]').closest('.col').removeClass('hide')
        } else {
          $('[name=tableExport]').closest('section').addClass('hide')
          $('[name=chartExists]').closest('section').addClass('hide')
          $('[name=tableColumnChangeText]').closest('.col').addClass('hide')
          $('[name=tableColumnFormatType]').closest('.col').addClass('hide')
        }

        // 找到$thisfocus這個元件的設定值
        var elementList =
          ctx.elementData[
            $newEle.data('id') ||
              $newEle.find('.inline-group').data('id') ||
              $newEle.find('input, select').data('id') ||
              $newEle.find('table').data('id')
          ]
        if (ctx.$thisFocus.data('type') === 'startEndDate') {
          elementList =
            ctx.elementData[
              $newEle.find('input:first').data('id').replace('start', '')
            ]
        } else if (ctx.$thisFocus.data('type') === 'select2') {
          elementList = ctx.elementData[$newEle.find('select').data('id')]
        } else if (ctx.$thisFocus.data('type') === 'label') {
          elementList = ctx.elementData[$newEle.find('label').data('id')]
        }

        if (ctx.$thisFocus.closest('form').length) {
          var formBindingTable =
            ctx.elementData[
              ctx.$thisFocus.closest('.jarviswidget, .modal-dialog').data('id')
            ][
              ctx.$thisFocus
                .closest('.jarviswidget, .modal-dialog')
                .data('type') + 'FormButtonTableBinding'
            ]
        }

        // 找到[name=key]的那個元件把他的value改成設定值的值
        _.each(elementList, function (value, key) {
          if (value === true) {
            // checkbox勾起來，顯示widget的form和startEndDate元件限制天數的輸入區域
            $($editor)
              .find('[name=' + key + ']')
              .prop('checked', true)
            if (key === 'widgetForm' || key === 'modalForm') {
              $('[name=' + key + ']').trigger('change') // 設定widget和modal時要先重畫table select
              $($editor)
                .find('[name=' + key + 'Id]')
                .closest('section')
                .removeClass('hide')
            }
            if (key === 'formBothLimit') {
              $($editor)
                .find('[name=formBothLimitDays]')
                .closest('section')
                .removeClass('hide')
            }
            if (key === 'tableExport') {
              $($editor)
                .find('[name=tableExportFilename]')
                .closest('.inline-group')
                .removeClass('hide')
            }
            if (key === 'chartExists') {
              $($editor)
                .find('[name=chartType]')
                .closest('.inline-group')
                .removeClass('hide')
            }
          } else if (value === false) {
            // checkbox勾勾拿掉，隱藏widget的form和startEndDate元件限制天數的輸入區域
            $($editor)
              .find('[name=' + key + ']')
              .prop('checked', false)
            if (key === 'widgetForm' || key === 'modalForm') {
              $($editor)
                .find('[name=' + key + 'Id]')
                .closest('section')
                .addClass('hide')
            }
            if (key === 'formBothLimit') {
              $($editor)
                .find('[name=formBothLimitDays]')
                .closest('section')
                .addClass('hide')
            }
            if (key === 'tableExport') {
              $($editor)
                .find('[name=tableExportFilename]')
                .closest('.inline-group')
                .addClass('hide')
            }
            if (key === 'chartExists') {
              $($editor)
                .find('[name=chartType]')
                .closest('.inline-group')
                .addClass('hide')
            }
          } else if (key === 'formValidate') {
            // 驗證
            $($editor)
              .find('[name=' + key + ']')
              .val(value)
            if (value === 'lengthrange' || value === 'range') {
              $($editor)
                .find('[name=formValidateMax]')
                .closest('section')
                .removeClass('hide')
            }
          } else if (
            key === 'formRegDirection' ||
            key === 'formDateConfig' ||
            key === 'formSelectBy' ||
            key === 'tableDataFrom'
          ) {
            // 其他radio
            $($editor)
              .find('[value=' + value + ']')
              .prop('checked', true)
            if (key === 'formSelectBy' || key === 'tableDataFrom') {
              $('[name=' + key + ']').trigger('change')
            }
          } else if (
            key === 'formSelectElement' ||
            key === 'tableColumnInputSelectElement'
          ) {
            // 下拉式選單
            var elementName = key.replace('Element', '')
            // 數量
            $editor
              .find('[name=' + elementName + 'Quantity]')
              .val(Object.keys(value).length.toString())
            // 設定元件值和文字的區域
            var lastElementName
            if (key === 'formSelectElement') {
              lastElementName = 'lastElementName'
            } else {
              lastElementName = 'lastTableEditSelectElementName'
            }
            ctx.changeSelectSetting(
              $editor,
              lastElementName,
              elementName + 'Element',
              value,
              [elementName + 'Text', elementName + 'Value'],
              'selectData'
            )
          } else if (key === 'formCheckBoxRadio') {
            // checkbox和radio
            // 數量
            $editor
              .find('[name=formCheckBoxRadioQuantity]')
              .val(Object.keys(value).length.toString())
            // 設定元件值和文字的區域
            ctx.changeSelectSetting(
              $editor,
              'lastElementName',
              'formCheckBoxRadioElement',
              value,
              ['formCheckBoxRadioText', 'formCheckBoxRadioValue'],
              ctx.$thisFocus.data('type') + 'Data'
            )
            // 畫出預設勾選的選項
            ctx.setCheckboxRadioDefaultCheckedSelect($editor, value)
          } else if (key === 'column') {
            // table欄位
            // 數量
            $editor
              .find('[name=tableColumnQuantity]')
              .val(Object.keys(value).length.toString())
            ctx.tableData = Object.assign({}, value)
            $editor.find('[name=tableColumnQuantity]').trigger('change')
            // $editor.find('[name=tableColumnSearch]').trigger('change')
            $editor.find('[name=tableColumnDataType]').trigger('change')
            $editor.find('[name=tableColumnBtnBinding]').trigger('change')
            $editor.find('[name=tableColumnInputType]').trigger('change')
          } else if (key === 'tableCustomerBtn') {
            // 數量
            $editor
              .find('[name=tableBtnQuantity]')
              .val(Object.keys(value).length.toString())
            ctx.tableBtnData = Object.assign({}, value)
            $editor.find('[name=tableBtnQuantity]').trigger('change')
            $editor.find('[name=tableBtnBinding]').trigger('change')
          } else if (key === 'tableBtnBinding') {
            $editor.find('[name=tableBtnBinding]').trigger('change')
          } else if (key === 'tableDataFromApp') {
            $editor.find('[name=' + key + ']').val(value)
            $editor
              .find('[name=tableDataFromApp]')
              .trigger('change', [elementList.tableDataFromFile])
          } else if (key === 'formBindingTableColumn') {
            if (formBindingTable) {
              _.map(ctx.elementData[formBindingTable].column, (column) => {
                return column.tableColumnName
              })
              servkit.initSelectWithList(
                _.map(ctx.elementData[formBindingTable].column, (column) => {
                  return column.tableColumnName
                }),
                $editor.find('[name=formBindingTableColumn]')
              )
              $editor
                .find('[name=formBindingTableColumn]')
                .prepend('<option value="">none</option>')
              $editor.find('[name=formBindingTableColumn]').val(value)
            }
          } else {
            // 其他只要把值帶進去就可以了
            $editor.find('[name=' + key + ']').val(value)
          }
        })

        // show編輯區域(如果是匯入的就不用)
        $editor.removeClass('hide').siblings('div').addClass('hide')
        if (
          $('.editor > [role=content]').css('display') === 'none' &&
          !byConfig
        ) {
          $('.editor').find('.jarviswidget-toggle-btn').trigger('click')
        }
      },
      saveNewValue: function ($form, ele) {
        // 把設定的值存到ctx.elementData裡
        var ctx = this
        // 把編輯區域的設定值存起來
        $form
          .find('section:not(.hide)')
          .find('input:visible, select:visible')
          .each(function () {
            if ($(this).attr('type') === 'checkbox') {
              ctx.elementData[ele][$(this).attr('name')] = $(this).prop(
                'checked'
              )
              $(this).prop('checked', false)
            } else if ($(this).attr('type') === 'radio') {
              if ($(this).prop('checked')) {
                if (
                  $(this).attr('name') === 'tableColumnBtnBinding' ||
                  $(this).attr('name') === 'tableColumnInputSelectBy' ||
                  $(this).attr('name') === 'tableColumnChangeText'
                ) {
                  ctx.elementData[ele]['column'][
                    $(this)
                      .closest('section')
                      .find('[name=tableColumnElement]')
                      .val()
                  ][$(this).attr('name')] = $(this).val()
                } else if ($(this).attr('name') === 'tableBtnBinding') {
                  if (
                    ctx.elementData[ele]['tableCustomerBtn'][
                      $(this)
                        .closest('section')
                        .find('[name=tableBtnElement]')
                        .val()
                    ]
                  ) {
                    ctx.elementData[ele]['tableCustomerBtn'][
                      $(this)
                        .closest('section')
                        .find('[name=tableBtnElement]')
                        .val()
                    ]['tableBtnBinding'] = $(this).val()
                  }
                } else {
                  ctx.elementData[ele][$(this).attr('name')] = $(this).val()
                }
              }
            } else if ($(this).attr('name') === 'formCheckBoxRadioElement') {
              // checkbox和radio的元件資料
              ctx.elementData[ele]['formCheckBoxRadio'] = Object.assign(
                {},
                ctx[ctx.$thisFocus.data('type') + 'Data']
              )
            } else if ($(this).attr('name') === 'formCheckBoxRadioText') {
              // 設定現在選擇的checkbox和radio元件的文字
              if ($('[name=formCheckBoxRadioElement]').val()) {
                ctx.elementData[ele]['formCheckBoxRadio'][
                  $(this)
                    .closest('section')
                    .find('[name=formCheckBoxRadioElement]')
                    .val()
                ]['formCheckBoxRadioText'] = $(this).val()
                ctx.$thisFocus
                  .find(
                    '[data-id=' +
                      $(this)
                        .closest('section')
                        .find('[name=formCheckBoxRadioElement]')
                        .val() +
                      ']'
                  )
                  .siblings('p')
                  .text($(this).val())
              }
            } else if ($(this).attr('name') === 'formCheckBoxRadioValue') {
              // 設定現在選擇的checkbox和radio元件的值
              if ($('[name=formCheckBoxRadioElement]').val()) {
                ctx.elementData[ele]['formCheckBoxRadio'][
                  $(this)
                    .closest('section')
                    .find('[name=formCheckBoxRadioElement]')
                    .val()
                ]['formCheckBoxRadioValue'] = $(this).val()
              }
            } else if (
              $(this).attr('name') === 'formCheckBoxChecked' ||
              $(this).attr('name') === 'formRadioChecked'
            ) {
              // 設定預設勾選
              $('[name=' + $(this).attr('name') + ']')
                .find('option')
                .each(function () {
                  if ($(this).val() !== 'ALL') {
                    if ($(this).prop('selected')) {
                      ctx.elementData[ele]['formCheckBoxRadio'][
                        $(this).val()
                      ].defaultCheck = true
                    } else {
                      ctx.elementData[ele]['formCheckBoxRadio'][
                        $(this).val()
                      ].defaultCheck = false
                    }
                  }
                })
            } else if ($(this).attr('name') === 'formSelectElement') {
              // select的元件資料
              ctx.elementData[ele]['formSelectElement'] = Object.assign(
                {},
                ctx.selectData
              )
            } else if ($(this).attr('name') === 'formSelectText') {
              // 設定現在選擇的select元件的文字
              if ($('[name=formSelectElement]').val()) {
                ctx.elementData[ele]['formSelectElement'][
                  $(this)
                    .closest('section')
                    .find('[name=formSelectElement]')
                    .val()
                ]['formSelectText'] = $(this).val()
              }
            } else if ($(this).attr('name') === 'formSelectValue') {
              // 設定現在選擇的select元件的值
              if ($('[name=formSelectElement]').val()) {
                ctx.elementData[ele]['formSelectElement'][
                  $(this)
                    .closest('section')
                    .find('[name=formSelectElement]')
                    .val()
                ]['formSelectValue'] = $(this).val()
              }
            } else if ($(this).attr('name') === 'tableColumnElement') {
              // table的欄位資料
              ctx.elementData[ele]['column'] = Object.assign({}, ctx.tableData)
            } else if ($(this).attr('name') === 'tableColumnSearch') {
              // 設定現在選擇的欄位查詢方式
              if ($('[name=tableColumnElement]').val()) {
                ctx.elementData[ele]['column'][
                  $(this)
                    .closest('section')
                    .find('[name=tableColumnElement]')
                    .val()
                ]['tableColumnSearch'] = $(this).val()
              }
            } else if ($(this).attr('name') === 'tableColumnAlign') {
              // 設定現在選擇的欄位對齊方式
              if ($('[name=tableColumnElement]').val()) {
                ctx.elementData[ele]['column'][
                  $(this)
                    .closest('section')
                    .find('[name=tableColumnElement]')
                    .val()
                ]['tableColumnAlign'] = $(this).val()
              }
            } else if ($(this).attr('name') === 'tableColumnTitleName') {
              // 設定現在選擇的欄位名稱
              if ($('[name=tableColumnElement]').val()) {
                ctx.elementData[ele]['column'][
                  $(this)
                    .closest('section')
                    .find('[name=tableColumnElement]')
                    .val()
                ]['tableColumnTitleName'] = $(this).val()
              }
            } else if ($(this).attr('name') === 'tableColumnName') {
              // 設定現在選擇的欄位的name
              ctx.elementData[ele]['column'][
                $(this)
                  .closest('section')
                  .find('[name=tableColumnElement]')
                  .val()
              ]['tableColumnName'] = $(this).val()
            } else if ($(this).attr('name') === 'tableColumnWidget') {
              // 設定現在選擇的欄位寬度(%)
              if ($('[name=tableColumnElement]').val()) {
                ctx.elementData[ele]['column'][
                  $(this)
                    .closest('section')
                    .find('[name=tableColumnElement]')
                    .val()
                ]['tableColumnWidget'] = $(this).val()
              }
            } else if ($(this).attr('name') === 'tableColumnFormatType') {
              // 設定現在選擇的欄位資料格式
              if ($('[name=tableColumnElement]').val()) {
                ctx.elementData[ele]['column'][
                  $(this)
                    .closest('section')
                    .find('[name=tableColumnElement]')
                    .val()
                ]['tableColumnFormatType'] = $(this).val()
              }
            } else if ($(this).attr('name') === 'tableColumnDataType') {
              // 設定現在選擇的欄位資料樣式
              if ($('[name=tableColumnElement]').val()) {
                ctx.elementData[ele]['column'][
                  $(this)
                    .closest('section')
                    .find('[name=tableColumnElement]')
                    .val()
                ]['tableColumnDataType'] = $(this).val()
              }
            } else if ($(this).attr('name') === 'tableColumnText') {
              // 設定現在選擇的欄位按鈕的文字
              ctx.elementData[ele]['column'][
                $(this)
                  .closest('section')
                  .find('[name=tableColumnElement]')
                  .val()
              ]['tableColumnText'] = $(this).val()
            } else if ($(this).attr('name') === 'tableColumnTitle') {
              // 設定現在選擇的欄位按鈕的title
              ctx.elementData[ele]['column'][
                $(this)
                  .closest('section')
                  .find('[name=tableColumnElement]')
                  .val()
              ]['tableColumnTitle'] = $(this).val()
            } else if ($(this).attr('name') === 'tableColumnBtnType') {
              // 設定現在選擇的欄位資料按鈕的樣式
              if ($('[name=tableColumnBtnType]').val()) {
                ctx.elementData[ele]['column'][
                  $(this)
                    .closest('section')
                    .find('[name=tableColumnElement]')
                    .val()
                ]['tableColumnBtnType'] = $(this).val()
              }
            } else if ($(this).attr('name') === 'tableColumnBtnBindingModal') {
              // 設定現在選擇的欄位資料按鈕綁定的modal
              if ($('[name=tableColumnBtnBindingModal]').val()) {
                ctx.elementData[ele]['column'][
                  $(this)
                    .closest('section')
                    .find('[name=tableColumnElement]')
                    .val()
                ]['tableColumnBtnBindingModal'] = $(this).val()
              }
            } else if ($(this).attr('name') === 'tableColumnInputType') {
              // 設定現在選擇的欄位編輯樣式
              if ($('[name=tableColumnInputType]').val()) {
                ctx.elementData[ele]['column'][
                  $(this)
                    .closest('section')
                    .find('[name=tableColumnElement]')
                    .val()
                ]['tableColumnInputType'] = $(this).val()
              }
            } else if ($(this).attr('name') === 'tableColumnInputDisabled') {
              // 設定現在選擇的欄位是否可編輯
              if ($('[name=tableColumnInputDisabled]').val()) {
                ctx.elementData[ele]['column'][
                  $(this)
                    .closest('section')
                    .find('[name=tableColumnElement]')
                    .val()
                ]['tableColumnInputDisabled'] = $(this).val()
              }
            } else if ($(this).attr('name') === 'tableColumnTextDBTable') {
              // 設定現在選擇的欄位文字的DB
              if ($('[name=tableColumnTextDBTable]').val()) {
                ctx.elementData[ele]['column'][
                  $(this)
                    .closest('section')
                    .find('[name=tableColumnElement]')
                    .val()
                ]['tableColumnTextDBTable'] = $(this).val()
              }
            } else if ($(this).attr('name') === 'tableColumnTextDBColumnText') {
              // 設定現在選擇的欄位文字的DB文字的欄位
              if ($('[name=tableColumnTextDBColumnText]').val()) {
                ctx.elementData[ele]['column'][
                  $(this)
                    .closest('section')
                    .find('[name=tableColumnElement]')
                    .val()
                ]['tableColumnTextDBColumnText'] = $(this).val()
              }
            } else if (
              $(this).attr('name') === 'tableColumnTextDBColumnValue'
            ) {
              // 設定現在選擇的欄位文字的DB值的欄位
              if ($('[name=tableColumnTextDBColumnValue]').val()) {
                ctx.elementData[ele]['column'][
                  $(this)
                    .closest('section')
                    .find('[name=tableColumnElement]')
                    .val()
                ]['tableColumnTextDBColumnValue'] = $(this).val()
              }
            } else if ($(this).attr('name') === 'tableColumnTextDBWhere') {
              // 設定現在選擇的欄位文字的DB條件
              if ($('[name=tableColumnTextDBWhere]').val()) {
                ctx.elementData[ele]['column'][
                  $(this)
                    .closest('section')
                    .find('[name=tableColumnElement]')
                    .val()
                ]['tableColumnTextDBWhere'] = $(this).val()
              }
            } else if ($(this).attr('name') === 'tableBtnElement') {
              // table的客製化button資料
              ctx.elementData[ele]['tableCustomerBtn'] = Object.assign(
                {},
                ctx.tableBtnData
              )
            } else if ($(this).attr('name') === 'tableBtnText') {
              // 設定現在選擇的欄位按鈕的文字
              if (
                ctx.elementData[ele]['tableCustomerBtn'][
                  $(this)
                    .closest('section')
                    .find('[name=tableBtnElement]')
                    .val()
                ]
              ) {
                ctx.elementData[ele]['tableCustomerBtn'][
                  $(this)
                    .closest('section')
                    .find('[name=tableBtnElement]')
                    .val()
                ]['tableBtnText'] = $(this).val()
              }
            } else if ($(this).attr('name') === 'tableBtnTitle') {
              // 設定現在選擇的欄位按鈕的title
              if (
                ctx.elementData[ele]['tableCustomerBtn'][
                  $(this)
                    .closest('section')
                    .find('[name=tableBtnElement]')
                    .val()
                ]
              ) {
                ctx.elementData[ele]['tableCustomerBtn'][
                  $(this)
                    .closest('section')
                    .find('[name=tableBtnElement]')
                    .val()
                ]['tableBtnTitle'] = $(this).val()
              }
            } else if ($(this).attr('name') === 'tableBtnType') {
              // 設定現在選擇的欄位資料按鈕的樣式
              if (
                ctx.elementData[ele]['tableCustomerBtn'][
                  $(this)
                    .closest('section')
                    .find('[name=tableBtnElement]')
                    .val()
                ]
              ) {
                if ($('[name=tableBtnType]').val()) {
                  ctx.elementData[ele]['tableCustomerBtn'][
                    $(this)
                      .closest('section')
                      .find('[name=tableBtnElement]')
                      .val()
                  ]['tableBtnType'] = $(this).val()
                }
              }
            } else if ($(this).attr('name') === 'tableBtnBindingModal') {
              // 設定現在選擇的欄位資料按鈕綁定的modal
              if (
                ctx.elementData[ele]['tableCustomerBtn'][
                  $(this)
                    .closest('section')
                    .find('[name=tableBtnElement]')
                    .val()
                ]
              ) {
                if ($('[name=tableBtnBindingModal]').val()) {
                  ctx.elementData[ele]['tableCustomerBtn'][
                    $(this)
                      .closest('section')
                      .find('[name=tableBtnElement]')
                      .val()
                  ]['tableBtnBindingModal'] = $(this).val()
                }
              }
            } else if (
              $(this).attr('name') === 'tableColumnInputSelectElement'
            ) {
              // select的元件資料
              ctx.elementData[ele]['column'][
                $(this)
                  .closest('section')
                  .find('[name=tableColumnElement]')
                  .val()
              ]['tableColumnInputSelectElement'] = Object.assign(
                {},
                ctx.tableEditSelectData
              )
            } else if ($(this).attr('name') === 'tableColumnInputSelectText') {
              // 設定現在選擇的select元件的文字
              if (
                ctx.elementData[ele]['column'][
                  $(this)
                    .closest('section')
                    .find('[name=tableColumnElement]')
                    .val()
                ]['tableColumnInputSelectElement'][
                  $(this)
                    .closest('section')
                    .find('[name=tableColumnInputSelectElement]')
                    .val()
                ]
              ) {
                if ($('[name=tableColumnInputSelectText]').val()) {
                  ctx.elementData[ele]['column'][
                    $(this)
                      .closest('section')
                      .find('[name=tableColumnElement]')
                      .val()
                  ]['tableColumnInputSelectElement'][
                    $(this)
                      .closest('section')
                      .find('[name=tableColumnInputSelectElement]')
                      .val()
                  ]['tableColumnInputSelectText'] = $(this).val()
                }
              }
            } else if ($(this).attr('name') === 'tableColumnInputSelectValue') {
              // 設定現在選擇的select元件的值
              if (
                ctx.elementData[ele]['column'][
                  $(this)
                    .closest('section')
                    .find('[name=tableColumnElement]')
                    .val()
                ]['tableColumnInputSelectElement'][
                  $(this)
                    .closest('section')
                    .find('[name=tableColumnInputSelectElement]')
                    .val()
                ]
              ) {
                if ($('[name=tableColumnInputSelectValue]').val()) {
                  ctx.elementData[ele]['column'][
                    $(this)
                      .closest('section')
                      .find('[name=tableColumnElement]')
                      .val()
                  ]['tableColumnInputSelectElement'][
                    $(this)
                      .closest('section')
                      .find('[name=tableColumnInputSelectElement]')
                      .val()
                  ]['tableColumnInputSelectValue'] = $(this).val()
                }
              }
            } else if (
              $(this).attr('name') === 'tableColumnTextSelectElement'
            ) {
              // column text資料
              ctx.elementData[ele]['column'][
                $(this)
                  .closest('section')
                  .find('[name=tableColumnElement]')
                  .val()
              ]['tableColumnTextSelectElement'] = Object.assign(
                {},
                ctx.tableTextSelectData
              )
            } else if ($(this).attr('name') === 'tableColumnTextSelectText') {
              // 設定現在選擇的column text的文字
              if (
                ctx.elementData[ele]['column'][
                  $(this)
                    .closest('section')
                    .find('[name=tableColumnElement]')
                    .val()
                ]['tableColumnTextSelectElement'][
                  $(this)
                    .closest('section')
                    .find('[name=tableColumnTextSelectElement]')
                    .val()
                ]
              ) {
                if ($('[name=tableColumnTextSelectText]').val()) {
                  ctx.elementData[ele]['column'][
                    $(this)
                      .closest('section')
                      .find('[name=tableColumnElement]')
                      .val()
                  ]['tableColumnTextSelectElement'][
                    $(this)
                      .closest('section')
                      .find('[name=tableColumnTextSelectElement]')
                      .val()
                  ]['tableColumnTextSelectText'] = $(this).val()
                }
              }
            } else if ($(this).attr('name') === 'tableColumnTextSelectValue') {
              // 設定現在選擇的column text的值
              if (
                ctx.elementData[ele]['column'][
                  $(this)
                    .closest('section')
                    .find('[name=tableColumnElement]')
                    .val()
                ]['tableColumnTextSelectElement'][
                  $(this)
                    .closest('section')
                    .find('[name=tableColumnTextSelectElement]')
                    .val()
                ]
              ) {
                if ($('[name=tableColumnTextSelectValue]').val()) {
                  ctx.elementData[ele]['column'][
                    $(this)
                      .closest('section')
                      .find('[name=tableColumnElement]')
                      .val()
                  ]['tableColumnTextSelectElement'][
                    $(this)
                      .closest('section')
                      .find('[name=tableColumnTextSelectElement]')
                      .val()
                  ]['tableColumnTextSelectValue'] = $(this).val()
                }
              }
            } else {
              // 其他元件直接在ctx.elementData設定key為name, value為現在的value就可以了(select, checkbox, select, table客製化button和table's column的數量例外)
              if (
                $(this).attr('name').search('Quantity') < 0 &&
                $(this).attr('name').search('tableColumn') < 0
              ) {
                ctx.elementData[ele][$(this).attr('name')] = $(this).val()
              }
            }
          })
        $form
          .find('section:not(.hide)')
          .find('input:hidden, select:hidden')
          .each(function () {
            if ($(this).attr('type') === 'radio') {
              if ($(this).prop('checked')) {
                if (
                  $(this).attr('name') === 'tableColumnBtnBinding' ||
                  $(this).attr('name') === 'tableColumnInputSelectBy'
                ) {
                  ctx.elementData[ele]['column'][
                    $(this)
                      .closest('section')
                      .find('[name=tableColumnElement]')
                      .val()
                  ][$(this).attr('name')] = null
                  delete ctx.elementData[ele]['column'][
                    $(this)
                      .closest('section')
                      .find('[name=tableColumnElement]')
                      .val()
                  ][$(this).attr('name')]
                } else if ($(this).attr('name') === 'tableBtnBinding') {
                  if (
                    ctx.elementData[ele]['tableCustomerBtn'][
                      $(this)
                        .closest('section')
                        .find('[name=tableBtnElement]')
                        .val()
                    ]
                  ) {
                    ctx.elementData[ele]['tableCustomerBtn'][
                      $(this)
                        .closest('section')
                        .find('[name=tableBtnElement]')
                        .val()
                    ]['tableBtnBinding'] = null
                    delete ctx.elementData[ele]['tableCustomerBtn'][
                      $(this)
                        .closest('section')
                        .find('[name=tableBtnElement]')
                        .val()
                    ]['tableBtnBinding']
                  }
                } else {
                  ctx.elementData[ele][$(this).attr('name')] = null
                  delete ctx.elementData[ele][$(this).attr('name')]
                }
              }
            } else if ($(this).attr('name') === 'tableColumnText') {
              // 設定現在選擇的欄位按鈕的文字
              ctx.elementData[ele]['column'][
                $(this)
                  .closest('section')
                  .find('[name=tableColumnElement]')
                  .val()
              ]['tableColumnText'] = null
              delete ctx.elementData[ele]['column'][
                $(this)
                  .closest('section')
                  .find('[name=tableColumnElement]')
                  .val()
              ]['tableColumnText']
            } else if ($(this).attr('name') === 'tableColumnTitle') {
              // 設定現在選擇的欄位按鈕的title
              ctx.elementData[ele]['column'][
                $(this)
                  .closest('section')
                  .find('[name=tableColumnElement]')
                  .val()
              ]['tableColumnTitle'] = null
              delete ctx.elementData[ele]['column'][
                $(this)
                  .closest('section')
                  .find('[name=tableColumnElement]')
                  .val()
              ]['tableColumnTitle']
            } else if ($(this).attr('name') === 'tableColumnBtnType') {
              // 設定現在選擇的欄位資料按鈕的樣式
              ctx.elementData[ele]['column'][
                $(this)
                  .closest('section')
                  .find('[name=tableColumnElement]')
                  .val()
              ]['tableColumnBtnType'] = null
              delete ctx.elementData[ele]['column'][
                $(this)
                  .closest('section')
                  .find('[name=tableColumnElement]')
                  .val()
              ]['tableColumnBtnType']
            } else if ($(this).attr('name') === 'tableColumnBtnBindingModal') {
              // 設定現在選擇的欄位資料按鈕綁定的modal
              ctx.elementData[ele]['column'][
                $(this)
                  .closest('section')
                  .find('[name=tableColumnElement]')
                  .val()
              ]['tableColumnBtnBindingModal'] = null
              delete ctx.elementData[ele]['column'][
                $(this)
                  .closest('section')
                  .find('[name=tableColumnElement]')
                  .val()
              ]['tableColumnBtnBindingModal']
            } else if ($(this).attr('name') === 'tableColumnInputType') {
              // 設定現在選擇的欄位編輯樣式
              ctx.elementData[ele]['column'][
                $(this)
                  .closest('section')
                  .find('[name=tableColumnElement]')
                  .val()
              ]['tableColumnInputType'] = null
              delete ctx.elementData[ele]['column'][
                $(this)
                  .closest('section')
                  .find('[name=tableColumnElement]')
                  .val()
              ]['tableColumnInputType']
            } else if ($(this).attr('name') === 'tableColumnInputDisabled') {
              // 設定現在選擇的欄位是否可編輯
              ctx.elementData[ele]['column'][
                $(this)
                  .closest('section')
                  .find('[name=tableColumnElement]')
                  .val()
              ]['tableColumnInputDisabled'] = null
              delete ctx.elementData[ele]['column'][
                $(this)
                  .closest('section')
                  .find('[name=tableColumnElement]')
                  .val()
              ]['tableColumnInputDisabled']
            } else if ($(this).attr('name') === 'tableColumnTextDBTable') {
              // 設定現在選擇的欄位文字的DB
              ctx.elementData[ele]['column'][
                $(this)
                  .closest('section')
                  .find('[name=tableColumnElement]')
                  .val()
              ]['tableColumnTextDBTable'] = null
              delete ctx.elementData[ele]['column'][
                $(this)
                  .closest('section')
                  .find('[name=tableColumnElement]')
                  .val()
              ]['tableColumnTextDBTable']
            } else if ($(this).attr('name') === 'tableColumnTextDBColumnText') {
              // 設定現在選擇的欄位文字的DB文字欄位
              ctx.elementData[ele]['column'][
                $(this)
                  .closest('section')
                  .find('[name=tableColumnElement]')
                  .val()
              ]['tableColumnTextDBColumnText'] = null
              delete ctx.elementData[ele]['column'][
                $(this)
                  .closest('section')
                  .find('[name=tableColumnElement]')
                  .val()
              ]['tableColumnTextDBColumnText']
            } else if (
              $(this).attr('name') === 'tableColumnTextDBColumnValue'
            ) {
              // 設定現在選擇的欄位文字的DB值欄位
              ctx.elementData[ele]['column'][
                $(this)
                  .closest('section')
                  .find('[name=tableColumnElement]')
                  .val()
              ]['tableColumnTextDBColumnValue'] = null
              delete ctx.elementData[ele]['column'][
                $(this)
                  .closest('section')
                  .find('[name=tableColumnElement]')
                  .val()
              ]['tableColumnTextDBColumnValue']
            } else if ($(this).attr('name') === 'tableColumnTextDBWhere') {
              // 設定現在選擇的欄位文字的DB條件
              ctx.elementData[ele]['column'][
                $(this)
                  .closest('section')
                  .find('[name=tableColumnElement]')
                  .val()
              ]['tableColumnTextDBWhere'] = null
              delete ctx.elementData[ele]['column'][
                $(this)
                  .closest('section')
                  .find('[name=tableColumnElement]')
                  .val()
              ]['tableColumnTextDBWhere']
            } else if ($(this).attr('name') === 'tableBtnText') {
              // 設定現在選擇的欄位按鈕的文字
              if (
                ctx.elementData[ele]['tableCustomerBtn'][
                  $(this)
                    .closest('section')
                    .find('[name=tableBtnElement]')
                    .val()
                ]
              ) {
                ctx.elementData[ele]['tableCustomerBtn'][
                  $(this)
                    .closest('section')
                    .find('[name=tableBtnElement]')
                    .val()
                ]['tableBtnText'] = null
                delete ctx.elementData[ele]['tableCustomerBtn'][
                  $(this)
                    .closest('section')
                    .find('[name=tableBtnElement]')
                    .val()
                ]['tableBtnText']
              }
            } else if ($(this).attr('name') === 'tableBtnTitle') {
              // 設定現在選擇的欄位按鈕的title
              if (
                ctx.elementData[ele]['tableCustomerBtn'][
                  $(this)
                    .closest('section')
                    .find('[name=tableBtnElement]')
                    .val()
                ]
              ) {
                ctx.elementData[ele]['tableCustomerBtn'][
                  $(this)
                    .closest('section')
                    .find('[name=tableBtnElement]')
                    .val()
                ]['tableBtnTitle'] = null
                delete ctx.elementData[ele]['tableCustomerBtn'][
                  $(this)
                    .closest('section')
                    .find('[name=tableBtnElement]')
                    .val()
                ]['tableBtnTitle']
              }
            } else if ($(this).attr('name') === 'tableBtnType') {
              // 設定現在選擇的欄位資料按鈕的樣式
              if (
                ctx.elementData[ele]['tableCustomerBtn'][
                  $(this)
                    .closest('section')
                    .find('[name=tableBtnElement]')
                    .val()
                ]
              ) {
                ctx.elementData[ele]['tableCustomerBtn'][
                  $(this)
                    .closest('section')
                    .find('[name=tableBtnElement]')
                    .val()
                ]['tableBtnType'] = null
                delete ctx.elementData[ele]['tableCustomerBtn'][
                  $(this)
                    .closest('section')
                    .find('[name=tableBtnElement]')
                    .val()
                ]['tableBtnType']
              }
            } else if ($(this).attr('name') === 'tableBtnBindingModal') {
              // 設定現在選擇的欄位資料按鈕綁定的modal
              if (
                ctx.elementData[ele]['tableCustomerBtn'][
                  $(this)
                    .closest('section')
                    .find('[name=tableBtnElement]')
                    .val()
                ]
              ) {
                ctx.elementData[ele]['tableCustomerBtn'][
                  $(this)
                    .closest('section')
                    .find('[name=tableBtnElement]')
                    .val()
                ]['tableBtnBindingModal'] = null
                delete ctx.elementData[ele]['tableCustomerBtn'][
                  $(this)
                    .closest('section')
                    .find('[name=tableBtnElement]')
                    .val()
                ]['tableBtnBindingModal']
              }
            } else if (
              $(this).attr('name').search('tableColumnInputSelect') >= 0
            ) {
              // 設定現在選擇的select元件的文字和值
              var tableColumnInputSelectElement =
                ctx.elementData[ele]['column'][
                  $(this)
                    .closest('section')
                    .find('[name=tableColumnElement]')
                    .val()
                ]['tableColumnInputSelectElement']
              if (
                tableColumnInputSelectElement &&
                tableColumnInputSelectElement[
                  $(this)
                    .closest('section')
                    .find('[name=tableColumnInputSelectElement]')
                    .val()
                ]
              ) {
                tableColumnInputSelectElement[
                  $(this)
                    .closest('section')
                    .find('[name=tableColumnInputSelectElement]')
                    .val()
                ][$(this).attr('name')] = null
                delete tableColumnInputSelectElement[
                  $(this)
                    .closest('section')
                    .find('[name=tableColumnInputSelectElement]')
                    .val()
                ][$(this).attr('name')]
              }
            } else if (
              $(this).attr('name').search('tableColumnTextSelect') >= 0
            ) {
              // 設定現在選擇的select元件的文字和值
              var tableColumnTextSelectElement =
                ctx.elementData[ele]['column'][
                  $(this)
                    .closest('section')
                    .find('[name=tableColumnElement]')
                    .val()
                ]['tableColumnTextSelectElement']
              if (
                tableColumnTextSelectElement &&
                tableColumnTextSelectElement[
                  $(this)
                    .closest('section')
                    .find('[name=tableColumnTextSelectElement]')
                    .val()
                ]
              ) {
                tableColumnTextSelectElement[
                  $(this)
                    .closest('section')
                    .find('[name=tableColumnTextSelectElement]')
                    .val()
                ][$(this).attr('name')] = null
                delete tableColumnTextSelectElement[
                  $(this)
                    .closest('section')
                    .find('[name=tableColumnTextSelectElement]')
                    .val()
                ][$(this).attr('name')]
              }
            } else {
              if (ctx.elementData[ele][$(this).attr('name')]) {
                ctx.elementData[ele][$(this).attr('name')] = null
                delete ctx.elementData[ele][$(this).attr('name')]
              }
            }
          })

        // console.log(ctx.elementData[ele])
        // 設定元件新的值
        ctx.changeElementSetting($form, ctx.elementData[ele])

        // 把編輯區域縮起來
        $('.editor').find('.jarviswidget-toggle-btn').trigger('click')
      },
      changeElementSetting: function ($elementType, eleData) {
        // 改變框元件的設定
        var ctx = this
        var id
        // 分成widget跟element
        if ($elementType.hasClass('widgetElementSetting')) {
          // title
          ctx.$thisFocus
            .find('header > .widget-icon')
            .html(eleData['widgetIcon'])
          ctx.$thisFocus.find('header > h2').text(eleData['widgetTitle'])
          // 重新設定RWD的column
          ctx.$thisFocus.closest('article').removeClass()
          ctx.$thisFocus.closest('article').addClass('col')
          ctx.$thisFocus
            .closest('article')
            .addClass('col-xs-' + eleData['widgetXsSize'])
          ctx.$thisFocus
            .closest('article')
            .addClass('col-sm-' + eleData['widgetSmSize'])
          ctx.$thisFocus
            .closest('article')
            .addClass('col-md-' + eleData['widgetMdSize'])
          ctx.$thisFocus
            .closest('article')
            .addClass('col-lg-' + eleData['widgetLgSize'])
          // 有沒有form
          if (eleData['widgetForm']) {
            // 先把沒有form的widget droppable刪掉不然會有兩個放區塊
            if (ctx.$thisFocus.find('.widget-body').hasClass('ui-droppable')) {
              ctx.$thisFocus.find('.widget-body').droppable('destroy')
            }
            // 確認widget目前沒有form存在再加
            if (!ctx.$thisFocus.find('form').length) {
              id = ctx.formQuantity += 1
              ctx.$thisFocus.find('.widget-body').append(
                ctx.tempalteEngine.html.widgetFormHtml({
                  ID: id,
                })
              )
              ctx.$thisFocus.find('form').attr('id', eleData['widgetFormId'])
              ctx.$thisFocus
                .find('footer>button')
                .attr('id', eleData['widgetButtonId'])
              ctx.$thisFocus
                .find('#' + eleData['widgetButtonId'])
                .off('click')
                .on('click', function (evt) {
                  evt.preventDefault()
                  var tableSetting =
                    ctx.elementData[eleData['widgetFormButtonTableBinding']]
                  var criteria
                  if (tableSetting) {
                    if (tableSetting.tableDataFrom === 'DB') {
                      criteria = ctx.getTableFormDataDB($(this).closest('form'))
                      if (tableSetting.type === 'reportTable') {
                        ctx.drawReportTableByDB(
                          tableSetting,
                          ctx[tableSetting.element + 'reportTabble'],
                          criteria
                        )
                      } else if (tableSetting.type === 'CRUDTable') {
                        $('#' + tableSetting.tableId).data(
                          'crudTableConfig'
                        ).read.whereClause = criteria
                        $('#' + tableSetting.tableId)
                          .closest('.dataTables_wrapper')
                          .find('.stk-refresh-btn')
                          .trigger('click')
                      }
                    } else {
                      if (tableSetting.type === 'reportTable') {
                        ctx.drawReportTableByFile(
                          tableSetting,
                          ctx[tableSetting.element + 'reportTabble'],
                          ctx.getReportTableFormData($(this).closest('form'))
                        )
                      } else if (tableSetting.type === 'CRUDTable') {
                        criteria = ctx.getCRUDTableFormData(
                          $(this).closest('form')
                        )
                        var urlStr =
                          'api/formeditor/html/read?app_id=' +
                          tableSetting.tableDataFromApp +
                          '&data_filename=' +
                          tableSetting.tableDataFromFile
                        if (criteria !== '') {
                          urlStr += '&criteria=' + criteria
                        }
                        $('#' + tableSetting.tableId).data(
                          'crudTableConfig'
                        ).read.url = urlStr
                        $('#' + tableSetting.tableId)
                          .closest('.dataTables_wrapper')
                          .find('.stk-refresh-btn')
                          .trigger('click')
                      }
                    }
                  }
                })
              ctx.addDroppable(ctx.$thisFocus.find('fieldset > .row'))
              servkit.validateForm(
                $('#' + eleData['widgetFormId']),
                $('#' + eleData['widgetButtonId'])
              )
              // 綁送出事件(確認驗證用)
              $('.widget-body').on(
                'click',
                '[data-id=submit' + id + ']',
                function (evt) {
                  evt.preventDefault()
                }
              )
              $('[name=widgetFormId]').val('')
              $('[name=widgetButtonId]').val('')
            }
          } else {
            // 刪掉form然後在widget body加上droppable
            if (ctx.$thisFocus.find('.row').hasClass('ui-droppable')) {
              ctx.$thisFocus.find('.row').droppable('destroy')
            }
            ctx.$thisFocus.find('.widget-body > form').remove()
            ctx.addDroppable(ctx.$thisFocus.find('.widget-body'))
          }
          // 有沒有全螢幕的按鈕
          if (eleData['widgetFullsreen']) {
            ctx.$thisFocus.attr('data-widget-fullscreenbutton', 'false')
          } else {
            ctx.$thisFocus.removeAttr('data-widget-fullscreenbutton')
          }
          // 有沒有縮放的按鈕
          if (eleData['widgetToggle']) {
            ctx.$thisFocus.attr('data-widget-togglebutton', 'false')
          } else {
            ctx.$thisFocus.removeAttr('data-widget-togglebutton')
          }
        } else if ($elementType.hasClass('modalElementSetting')) {
          // title
          ctx.$thisFocus
            .find('.modal-header > .modal-title')
            .text(eleData['modalTitle'])
          // 設定modal大小
          ctx.$thisFocus.removeClass('modal-sm').removeClass('modal-lg')
          if ($('[name=modalSize]').val() !== 'md') {
            ctx.$thisFocus.addClass('modal-' + $('[name=modalSize]').val())
          }
          // 設定modal ID
          ctx.$thisFocus.attr('id', eleData['modalId'])
          // 有沒有form
          if (eleData['modalForm']) {
            // 先把沒有form的modal droppable刪掉不然會有兩個放區塊
            if (
              ctx.$thisFocus.find('.modal-body > .row').hasClass('ui-droppable')
            ) {
              ctx.$thisFocus.find('.modal-body > .row').droppable('destroy')
            }
            // 確認modal目前沒有form存在再加
            if (!ctx.$thisFocus.find('form').length) {
              id = ctx.formQuantity += 1
              ctx.$thisFocus.find('.modal-body > .row').append(
                ctx.tempalteEngine.html.modalFormHtml({
                  ID: id,
                })
              )
              // 有form才加上傳送按鈕
              ctx.$thisFocus.find('.modal-content').append(
                ctx.tempalteEngine.html.modalFooterHtml({
                  ID: id,
                })
              )
              ctx.$thisFocus.find('form').attr('id', eleData['modalFormId'])
              ctx.$thisFocus
                .find('.modal-footer > button')
                .attr('id', eleData['modalButtonId'])
              ctx.$thisFocus
                .find('.modal-footer > button')
                .text(eleData['modalButtonText'])
              ctx.addDroppable(ctx.$thisFocus.find('form'))
              servkit.validateForm(
                $('#' + eleData['modalFormId']),
                $('#' + eleData['modalButtonId'])
              )
              // 綁送出事件(確認驗證用)
              ctx.$thisFocus.on(
                'click',
                '[data-id=submit' + id + ']',
                function (evt) {
                  evt.preventDefault()
                }
              )
              $('[name=modalFormId]').val('')
              $('[name=modalButtonId]').val('')
            }
          } else {
            // 刪掉form然後在modal body加上droppable
            if (ctx.$thisFocus.find('form').hasClass('ui-droppable')) {
              ctx.$thisFocus.find('form').droppable('destroy')
            }
            ctx.$thisFocus.find('form').remove()
            ctx.$thisFocus.find('.modal-footer').remove()
            ctx.addDroppable(ctx.$thisFocus.find('.modal-body > .row'))
          }
        } else if ($elementType.hasClass('formElementSetting')) {
          // title
          ctx.$thisFocus.find('.label').html(eleData['formTitle'])
          // 重新設定RWD的column
          ctx.$thisFocus.removeClass()
          ctx.$thisFocus.addClass('focus') // 不小心連focus框框都刪掉所以要加回來
          ctx.$thisFocus.addClass('col')
          ctx.$thisFocus.addClass('col-xs-' + eleData['formXsSize'])
          ctx.$thisFocus.addClass('col-sm-' + eleData['formSmSize'])
          ctx.$thisFocus.addClass('col-md-' + eleData['formMdSize'])
          ctx.$thisFocus.addClass('col-lg-' + eleData['formLgSize'])
          // 設定ID
          if (eleData['formId']) {
            ctx.$thisFocus.find('input, select').attr('id', eleData['formId'])
          } else {
            ctx.$thisFocus.find('input, select').removeAttr('id')
          }
          // 設定name
          if (eleData['formName']) {
            ctx.$thisFocus
              .find('input, select')
              .attr('name', eleData['formName'])
          } else {
            ctx.$thisFocus.find('input, select').removeAttr('name')
          }

          // 綁定table的欄位
          if (eleData.formBindingTableColumn) {
            if (eleData.type === 'radio' || eleData.type === 'checkbox') {
              ctx.$thisFocus
                .find('.inline-group')
                .data('bindingColumn', eleData.formBindingTableColumn)
            } else if (eleData.type === 'label') {
              ctx.$thisFocus
                .find('label')
                .data('bindingColumn', eleData.formBindingTableColumn)
            } else {
              ctx.$thisFocus
                .find('input, select')
                .data('bindingColumn', eleData.formBindingTableColumn)
            }
          } else {
            if (eleData.type === 'radio' || eleData.type === 'checkbox') {
              ctx.$thisFocus.find('.inline-group').removeData('bindingColumn')
            } else if (eleData.type === 'label') {
              ctx.$thisFocus.find('label').removeData('bindingColumn')
            } else {
              ctx.$thisFocus.find('input, select').removeData('bindingColumn')
            }
          }

          // 如果元件是有起始結束的日期設定要另外設定title, id和name，另外還有設定「是否同一欄」和選擇日期的設定
          if (eleData['type'] === 'startEndDate') {
            if (eleData['formSameLine']) {
              ctx.$thisFocus.find('div:not(.elementDelete)').addClass('col')
              ctx.$thisFocus.find('div:not(.elementDelete)').addClass('col-6')
              ctx.$thisFocus.find('.col').first().css('padding-top', '17px')
            } else {
              ctx.$thisFocus.find('.col').first().css('padding-top', '0px')
              ctx.$thisFocus.find('div:not(.elementDelete)').removeClass()
            }
            ctx.$thisFocus.find('.label:first').html(eleData['formStartTitle'])
            ctx.$thisFocus.find('.label:last').html(eleData['formEndTitle'])
            ctx.$thisFocus
              .find('input:first')
              .attr('id', eleData['formStartId'])
              .attr('name', eleData['formStartName'])
            ctx.$thisFocus
              .find('input:last')
              .attr('id', eleData['formEndId'])
              .attr('name', eleData['formEndName'])
            // 選擇日期的設定先刪掉再重新加
            ctx.$thisFocus
              .find('input:first')
              .removeClass('hasDatepicker')
              .datepicker('destroy')
            ctx.$thisFocus
              .find('input:last')
              .removeClass('hasDatepicker')
              .datepicker('destroy')
            servkit.initDatePicker(
              ctx.$thisFocus.find('input:first'),
              ctx.$thisFocus.find('input:last'),
              eleData['formBothToday'],
              eleData['formBothLimit'] ? eleData['formBothLimitDays'] : false
            )
          }

          var $ele = ctx.$thisFocus.find('input, select')
          if (eleData['type'] === 'select2') {
            $ele = ctx.$thisFocus.find('select')
          }
          // 驗證
          if (
            ctx.$thisFocus.closest('form').length &&
            ctx.$thisFocus.data('type') !== 'label' &&
            ctx.$thisFocus.data('type') !== 'hr'
          ) {
            // 把rule全清掉
            $ele.each(function () {
              $(this).rules('remove')
            })
          }
          if (eleData['formRequired']) {
            // 必填
            $ele.closest('section').find('.label').addClass('st-required')
            $ele.each(function () {
              $(this).rules('add', 'required')
            })
          } else {
            // 把必填的星星拿掉
            $ele.closest('section').find('.label').removeClass('st-required')
          }
          // 驗證和其他驗證的設定
          if (
            eleData['formValidate'] ||
            eleData['formRegSpecialChar'] ||
            eleData['formRegEngNum'] ||
            eleData['formRegChinese'] ||
            eleData['formReg1More']
          ) {
            var config = {
              messages: {},
            }
            // 驗證
            var validate = eleData['formValidate']
            var validateCondition = 'true'

            // 其他驗證
            var regStr = ''
            if (eleData['formRegSpecialChar']) {
              // 特殊字元的條件
              regStr +=
                ',<>\v\\s\\u0020\\u0085\\u00A0\\u1680\\u180E\\u2000-\\u200A\\u2028\\u2029\\u202F\\u205F\\u2060\\u3000\\ufeff\\ufffe\\u0022\\u0027'
            }
            if (eleData['formRegEngNum']) {
              //英文和數字的條件
              regStr += 'a-zA-Z0-9'
            }
            if (eleData['formRegChinese']) {
              // 中文的條件
              regStr +=
                '\\u4E00-\\u9FA5\\u3105-\\u3129\\u02CA\\u02C7\\u02CB\\u02D9'
            }
            if (eleData['formRegDirection'] === 'positive') {
              //正向
              regStr = '[' + regStr + ']'
            } else if (eleData['formRegDirection'] === 'negative') {
              // 反向
              regStr = '^((?![' + regStr + ']).)$'
            }

            if (
              eleData['formRegSpecialChar'] ||
              eleData['formRegEngNum'] ||
              eleData['formRegChinese']
            ) {
              // 特殊字元、英文和數字、中文
              validate = 'pattern'
              validateCondition = regStr
            }
            if (
              eleData['formValidate'] === 'range' ||
              eleData['formValidate'] === 'lengthrange'
            ) {
              // 數字大小、長度、範圍
              if (eleData['formValidateMax'] === '') {
                validate = 'min' + eleData['formValidate'].replace('range', '')
                validateCondition = eleData['formValidateMin']
              } else if (eleData['formValidateMin'] === '') {
                validate = 'max' + eleData['formValidate'].replace('range', '')
                validateCondition = eleData['formValidateMax']
              } else {
                validate =
                  'range' + eleData['formValidate'].replace('range', '')
                validateCondition =
                  eleData['formValidateMin'] + ',' + eleData['formValidateMax']
              }
            }

            // 設定config
            if (eleData['formReg1More']) {
              // 1以上的整數
              config.digits = 'true'
              config.min = '1'
              config.messages.digits = eleData['formValidateInfo']
              config.messages.min = eleData['formValidateInfo']
            } else {
              config[validate] = validateCondition
              if (eleData['formValidateInfo']) {
                config.messages[validate] = eleData['formValidateInfo']
              }
            }
            // 加進條件
            $ele.each(function () {
              $(this).rules('add', config)
            })
          }

          // 單一日期選項先把datepicker刪掉再重新加
          if (eleData['formDateConfig']) {
            var datepickerConfig = {
              dateFormat: 'yy/mm/dd',
              prevText: '<i class="fa fa-chevron-left"></i>',
              nextText: '<i class="fa fa-chevron-right"></i>',
            }
            if (eleData['formDateConfig'] === 'formDateAfter') {
              datepickerConfig.minDate = new Date()
            } else if (eleData['formDateConfig'] === 'formDateBefore') {
              datepickerConfig.maxDate = new Date()
            }
            ctx.$thisFocus.find('input').datepicker('destroy')
            ctx.$thisFocus
              .find('input')
              .datepicker(datepickerConfig)
              .val(moment(new Date()).format('YYYY/MM/DD'))
          }

          // select元件的資料設定
          if (eleData['formSelectBy'] === 'DB') {
            // 因為ajax有非同步問題所以要先把值存起來
            var $thisFocusSelect = ctx.$thisFocus.find('select')
            var value = eleData['formSelectDBColumnValue']
            var text = eleData['formSelectDBColumnText']
            var element = ctx.$thisFocus.find('select').data('id')
            var bindingSelect = eleData['formSelectBinding']
            var bindingColumn = eleData['formSelectBindingColumn']
            var selectData = {
              table: eleData['formSelectDBTable'],
              columns: [text, value],
            }
            if (eleData['formSelectBinding']) {
              selectData.columns.push(eleData['formSelectBindingColumn'])
            }
            if (eleData['formSelectDBWhere']) {
              selectData.whereClause = eleData['formSelectDBWhere']
            }
            // 先清空(不然如果沒有資料的話會是之前的內容)
            servkit.initSelectWithList(
              {},
              $thisFocusSelect,
              eleData['formDefaultAll']
            )
            // select元件資料來源選擇為DB時去找DB資料
            servkit.ajax(
              {
                url: 'api/getdata/db',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(selectData),
              },
              {
                success: function (data) {
                  ctx.selectDataMap = {}
                  if (bindingSelect) {
                    if (eleData['type'] !== 'multipleSelect') {
                      ctx.selectDataMap._ALL = '_ALL'
                    }
                    if (ctx.changeSelectMap[element] === undefined) {
                      ctx.changeSelectMap[element] = {}
                    }
                    ctx.changeSelectMap[element][bindingSelect] = {}
                  } else {
                    ctx.changeSelectMap[element] = null
                    delete ctx.changeSelectMap[element]
                  }
                  _.each(data, function (elem) {
                    if (bindingSelect) {
                      if (
                        ctx.changeSelectMap[element][bindingSelect][
                          elem[value]
                        ] === undefined
                      ) {
                        ctx.changeSelectMap[element][bindingSelect][
                          elem[value]
                        ] = {}
                      }
                      ctx.changeSelectMap[element][bindingSelect][elem[value]][
                        elem[bindingColumn]
                      ] = null
                    }
                    ctx.selectDataMap[elem[value]] = elem[text]
                  })
                  servkit.initSelectWithList(
                    ctx.selectDataMap,
                    $thisFocusSelect,
                    eleData['formDefaultAll']
                  )
                  _.each(ctx.changeSelectMap, (elem, mapKey) => {
                    if (elem[element]) {
                      var selectData = {}
                      selectData._ALL = {}
                      _.each(elem[element], (val, key) => {
                        selectData[key] = {}
                        _.each(val, (v, k) => {
                          selectData._ALL[k] = ctx.selectDataMap[k]
                          selectData[key][k] = ctx.selectDataMap[k]
                        })
                      })

                      $('[data-id=' + mapKey + ']').on('change', function () {
                        var optionData = {}
                        if (_.isArray($(this).val())) {
                          _.each($(this).val(), (val) => {
                            _.each(selectData[val], (value, key) => {
                              optionData[key] = value
                            })
                          })
                        } else {
                          optionData = Object.assign({}, selectData[this.value])
                        }
                        servkit.initSelectWithList(
                          optionData,
                          $thisFocusSelect,
                          eleData['formDefaultAll']
                        )
                      })
                    }
                  })
                },
              }
            )
          } else if (eleData['formSelectBy'] === 'user') {
            var haveEmptyValueArray = _.filter(
              eleData['formSelectElement'],
              function (num) {
                return num.formSelectValue === ''
              }
            )
            var isFormDataValueNotAllEmpty =
              haveEmptyValueArray.length !==
                Object.keys(eleData['formSelectElement']).length &&
              haveEmptyValueArray.length !== 0
            // 只要選項裡有部分value是空的就自己畫，其他就呼叫servkit.initSelectWithList()
            if (isFormDataValueNotAllEmpty) {
              ctx.$thisFocus.find('select option').remove()
              _.each(eleData['formSelectElement'], function (num) {
                ctx.$thisFocus
                  .find('select')
                  .append(
                    '<option style="padding:3px 0 3px 3px;" value="' +
                      num.formSelectValue +
                      '">' +
                      num.formSelectText +
                      '</option>'
                  )
              })
              // 多選的全選也要自己加
              // if(eleData['type'] === 'multipleSelect') {
              //   ctx.$thisFocus.find('select').prepend('<option>ALL</option>')
              //   servkit.renderSelect(ctx.$thisFocus.find('select'), [], eleData['formDefaultAll'])
              // }
            } else {
              var dataMap = {}
              var dataList = []
              // 有value包成object，沒有的話就包成array
              _.each(eleData['formSelectElement'], function (num) {
                if (num.formSelectValue) {
                  dataMap[num.formSelectValue] = num.formSelectText
                } else {
                  dataList.push(num.formSelectText)
                }
              })
              if (dataList.length) {
                servkit.initSelectWithList(
                  dataList,
                  ctx.$thisFocus.find('select'),
                  eleData['formDefaultAll']
                )
              } else {
                servkit.initSelectWithList(
                  dataMap,
                  ctx.$thisFocus.find('select'),
                  eleData['formDefaultAll']
                )
              }
            }
          }

          // 如果元件是radiio或checkbox先把元件全刪了再加
          if (eleData['type'] === 'radio' || eleData['type'] === 'checkbox') {
            ctx.$thisFocus
              .children('div:not(.elementDelete)')
              .children('label')
              .remove()
            _.each(eleData['formCheckBoxRadio'], function (num) {
              ctx.$thisFocus.children('div:not(.elementDelete)').append(
                ctx.tempalteEngine.html[
                  'add' + ctx.$thisFocus.data('type') + 'Template'
                ]({
                  ID: eleData['formName'],
                  value: num.formCheckBoxRadioValue,
                  checked: num.defaultCheck ? 'checked' : '',
                  text: num.formCheckBoxRadioText,
                })
              )
            })

            if (eleData['formSameLine']) {
              ctx.$thisFocus
                .children('div:not(.elementDelete)')
                .removeClass('col')
              ctx.$thisFocus
                .children('div:not(.elementDelete)')
                .addClass('inline-group')
            } else {
              ctx.$thisFocus
                .children('div:not(.elementDelete)')
                .removeClass('inline-group')
              ctx.$thisFocus.children('div:not(.elementDelete)').addClass('col')
            }
          }

          if (eleData['type'] === 'label') {
            ctx.$thisFocus
              .find('label span:first-child')
              .text(eleData['formTitle'])
            ctx.$thisFocus
              .find('label span:last-child')
              .text(eleData['formText'])
            ctx.$thisFocus.find('label').attr('id', eleData['formId'])
          }

          if (eleData['type'] === 'hr') {
            ctx.$thisFocus.addClass('hr-section')
            ctx.$thisFocus.find('hr').css('opacity', eleData['formOpacity'])
          }
        } else if ($elementType.hasClass('tableElementSetting')) {
          // 因為要先把table刪掉，所以先把他爸爸存起來
          var $parent = ctx.$thisFocus.parent()
          var ele = ctx.$thisFocus.attr('id').replace('_wrapper', '')
          // modal裡的taable要加widget
          var widgetData = null
          if (ctx.$thisFocus.closest('.tab-pane').attr('id') === 'tabs-modal') {
            widgetData = ctx.elementData[ele + '_widget']
            ctx.elementData[ele + '_widget'] = null
            delete ctx.elementData[ele + '_widget']
          }
          ctx.$thisFocus.remove()
          ctx.elementData[ele] = null
          delete ctx.elementData[ele]
          if (ctx.$thisFocus.data('type') === 'CRUDTable') {
            // if (eleData.tableDataFromTableModel) {
            ctx.createTableElement($parent, eleData.type, eleData, widgetData)
            // } else {
            //   $.get('./app/' + eleData.tableDataFromApp + '/data/' + eleData.tableDataFromFile + '.json', (rep) => {
            //     eleData.key = rep.keys.length > 1 ? 'pks' : rep.keys[0]
            //     ctx.createTableElement($parent, eleData.type, eleData, widgetData)
            //   })
            // }
          } else {
            ctx.createTableElement($parent, eleData.type, eleData, widgetData)
          }
        }
      },
      changeSelectSetting: function (
        $editor,
        lastElementName,
        name,
        value,
        dataList,
        dataName
      ) {
        // 長出有「選擇元件」、「元件文字」和「元件值」的設定(select, checkbox, radio)
        var ctx = this
        // option選項先刪掉之前的內容再加新的並且預設選擇第一個option
        $editor
          .find('[name=' + name + ']')
          .find('option')
          .remove()
        _.each(value, function (num, ele) {
          if (
            name === 'formSelectElement' ||
            name === 'tableColumnInputSelectElement' ||
            name === 'tableColumnTextSelectElement'
          ) {
            $editor
              .find('[name=' + name + ']')
              .append('<option value="' + ele + '">' + ele + '</option>')
          } else {
            // checkbox和radio的選項會隨著名稱改變而改變
            $editor
              .find('[name=formCheckBoxRadioElement]')
              .append(
                '<option value="' +
                  ele +
                  '">' +
                  num.formCheckBoxRadioText +
                  '</option>'
              )
          }
        })
        $editor
          .find('[name=' + name + ']')
          .val($editor.find('[name=' + name + '] option:first').val())
        // 把ctx.lastElementName和(ctx.selectData或ctx.checkboxData或ctx.radioData)設為這個select的值(改變選項數量用)
        ctx[lastElementName] = $editor
          .find('[name=' + name + '] option:selected')
          .val()
        // 「元件文字」和「元件值」也是設定為第一個option的
        ctx.setNewSelectDataToElement($editor, lastElementName, value, dataList)
        if (dataName) {
          ctx[dataName] = Object.assign({}, value)
        }
      },
      setCheckboxRadioDefaultCheckedSelect: function ($editor, value) {
        // checkbox和radio預設勾選的設定
        var ctx = this
        var eleData = {}
        var selectedList = []
        var selectAll = true
        // 預設勾選
        _.each(value, function (num, ele) {
          // 長出預設勾選選項用
          eleData[ele] = num.formCheckBoxRadioText
          if (num.defaultCheck) {
            // 要選擇預設勾選的option
            selectedList.push(ele)
          } else {
            // 確認是不是預設全都要勾
            selectAll = false
          }
        })
        // 設定radio和checkbox的預設勾選的選項
        if (ctx.$thisFocus.data('type') === 'radio') {
          servkit.initSelectWithList(eleData, $('[name=formRadioChecked]'))
          _.each(selectedList, function (num) {
            $('[name=formRadioChecked] option[value=' + num + ']').prop(
              'selected',
              true
            )
          })
        } else {
          servkit.initSelectWithList(
            eleData,
            $('[name=formCheckBoxChecked]'),
            selectAll
          )
          if (!selectAll) {
            _.each(selectedList, function (num) {
              $('[name=formCheckBoxChecked] option[value=' + num + ']').prop(
                'selected',
                true
              )
            })
          }
        }
      },
      changeSelectElement: function (
        $editor,
        lastElement,
        name,
        value,
        dataList
      ) {
        // 當「選擇元件」改變時紀錄至暫存的data(select, checkbox, radio, table's column)
        var ctx = this
        var regNum = /^[0-9]*$/
        if (
          name === 'tableColumnElement' &&
          !regNum.test($editor.find('[name=tableColumnWidget]').val())
        ) {
          alert('欄位寬度(%)只能輸入數字')
          $editor.find('[name=tableColumnElement]').val(ctx[lastElement])
        } else {
          $.each(dataList, function (key, val) {
            if (
              $editor
                .find('[name=' + val + ']')
                .closest('.col')
                .hasClass('hide')
            ) {
              value[ctx[lastElement]][val] = null
              delete value[ctx[lastElement]][val]
            } else {
              if (
                val === 'tableColumnBtnBinding' ||
                val === 'tableBtnBinding' ||
                val === 'tableColumnInputSelectBy' ||
                val === 'tableColumnChangeText'
              ) {
                value[ctx[lastElement]][val] = $editor
                  .find('[name=' + val + ']:checked')
                  .val()
              } else {
                value[ctx[lastElement]][val] = $editor
                  .find('[name=' + val + ']')
                  .val()
              }
            }
          })
          // ctx.$thisFocus.find('[data-id=' + ctx[lastElement] + ']').siblings('p').text(value[ctx[lastElement]]['form' + name + 'Text'])
          // $(this).find('[value=' + ctx[lastElement] + ']').text(value[ctx[lastElement]]['form' + name + 'Text'])
          ctx[lastElement] = $editor
            .find('[name=' + name + '] option:selected')
            .val()
        }
        ctx.setNewSelectDataToElement($editor, lastElement, value, dataList)
      },
      setNewSelectDataToElement: function (
        $editor,
        lastElement,
        value,
        dataList
      ) {
        // 選擇時改變值
        var ctx = this
        $.each(dataList, function (key, val) {
          if (ctx[lastElement]) {
            if (
              val === 'tableColumnBtnBinding' ||
              val === 'tableBtnBinding' ||
              val === 'tableColumnInputSelectBy' ||
              val === 'tableColumnChangeText'
            ) {
              $($editor)
                .find('[value=' + value[ctx[lastElement]][val] + ']')
                .prop('checked', true)
            } else {
              $editor
                .find('[name=' + val + ']')
                .val(value[ctx[lastElement]][val])
            }
          } else if (
            $editor.find('[name=' + val + ']').attr('type') !== 'checkbox' &&
            $editor.find('[name=' + val + ']').attr('type') !== 'radio'
          ) {
            $editor.find('[name=' + val + ']').val('')
          }
        })
      },
      addDroppable: function ($area) {
        // 加上可以放置的設定(拖拉用)
        var ctx = this
        $area.droppable({
          drop: function (event, ui) {
            var type = $(ui.draggable).data('type').replace('Btn', '')
            // var data = Object.assign({}, ctx.tempalteEngine.setDefaultData(type))
            ctx.createElement(
              $(this),
              type,
              ctx.tempalteEngine.setDefaultData(type)
            )
          },
        })
      },
      createElement: function ($parent, elementType, data) {
        // 新增元件(含框)
        var ctx = this
        if (elementType !== 'reportTable' && elementType !== 'CRUDTable') {
          // 找出一般元件(或widget跟modal)
          // 只能放在form(widget跟modal還有label不算)
          if (
            elementType === 'label' ||
            ($parent.hasClass('row') &&
              $parent.parent().parent().hasClass('smart-form')) ||
            $parent.hasClass('smart-form') ||
            $parent.attr('id') === 'tabs-widget' ||
            $parent.attr('id') === 'tabs-modal'
          ) {
            // 如果有這個元件的資料就用原本的，沒有的話就叫[element+數量]
            var id = data.element || 'element' + (ctx.elementQuantity += 1)
            // 長出元件(含框)
            $parent.append(
              ctx.tempalteEngine.html[elementType + 'Template']({
                ID: id,
              })
            )
            if (elementType === 'label') {
              data.formId = id
            }
            if (elementType === 'modal' && !data.modalId) {
              data.modalId = id
            }
            if (elementType === 'checkbox' || elementType === 'radio') {
              // 先長出一個input
              if (!Object.keys(data.formCheckBoxRadio).length) {
                data.formCheckBoxRadio[elementType + '1'] = {
                  formCheckBoxRadioText: elementType + '1',
                  formCheckBoxRadioValue: '',
                  defaultCheck: false,
                }
                // 元件的name預設就是ctx.elementData的key
                data.formName = id
              }
            }
            // 之後匯出要用的排序設定[1-x就是第x個widget, 1-x.y就是第x個widget裡的第y個元件; 2-x就是第x個modal, 2-x.y就是第x個modal裡的第y個元件]
            if ($parent.attr('id') === 'tabs-widget') {
              // widget
              $parent
                .find('.jarviswidget:last')
                .data('order', ctx.elementOrder.widget)
              ctx.elementOrder.widgetElement[ctx.elementOrder.widget] = 0
              ctx.elementOrder.widget += 1
              data.order = '1-' + ctx.elementOrder.widget
            } else if ($parent.attr('id') === 'tabs-modal') {
              // modal
              $parent
                .find('.modal-dialog:last')
                .data('order', ctx.elementOrder.modal)
              ctx.elementOrder.modalElement[ctx.elementOrder.modal] = 0
              ctx.elementOrder.modal += 1
              data.order = '2-' + ctx.elementOrder.modal
            } else if ($parent.closest('[data-type=widget]').length) {
              // widget裡的元件
              var widgetOrder = $parent
                .closest('[data-type=widget]')
                .data('order')
              ctx.elementOrder.widgetElement[widgetOrder] += 1
              data.order =
                '1-' +
                (widgetOrder + 1) +
                '.' +
                ctx.elementOrder.widgetElement[widgetOrder]
            } else if ($parent.closest('[data-type=modal]').length) {
              // modal裡的元件
              var modalOrder = $parent
                .closest('[data-type=modal]')
                .data('order')
              ctx.elementOrder.modalElement[modalOrder] += 1
              data.order =
                '2-' +
                (modalOrder + 1) +
                '.' +
                ctx.elementOrder.modalElement[modalOrder]
            }
            // 要在elementData加上元件type
            data.type = elementType
            // 把這個元件的設定值加到ctx.elementData
            ctx.elementData[id] = data
            // 如果是日期元件加上datepicker
            if (elementType === 'date') {
              var datepickerConfig = {
                dateFormat: 'yy/mm/dd',
                prevText: '<i class="fa fa-chevron-left"></i>',
                nextText: '<i class="fa fa-chevron-right"></i>',
              }
              $('[data-id=' + id + ']')
                .datepicker(datepickerConfig)
                .val(moment(new Date()).format('YYYY/MM/DD'))
            }
            // 如果是有起始和結束的日期元件透過servkit.initDatePicker()加上datepicker
            if (elementType === 'startEndDate') {
              servkit.initDatePicker(
                $('[data-id=' + id + 'start' + ']'),
                $('[data-id=' + id + 'end' + ']'),
                false
              )
            }
            // 如果是select2元件加上select2的功能
            if (elementType === 'select2') {
              $('[data-id=' + id + ']').select2()
            }
          } else {
            alert(elementType + '只能放在form裡')
          }
        } else if (
          elementType === 'CRUDTable' ||
          elementType === 'reportTable'
        ) {
          if (
            $parent.length &&
            !$parent.closest('form').length &&
            $parent[0].tagName !== 'FORM'
          ) {
            if (elementType === 'CRUDTable') {
              // $.get('./app/' + data.tableDataFromApp + '/data/' + data.tableDataFromFile + '.json', (rep) => {
              //   data.key = rep.keys.length > 1 ? 'pks' : rep.keys[0]
              ctx.createTableElement($parent, elementType, data)
              // })
            } else {
              ctx.createTableElement($parent, elementType, data)
            }
          } else {
            alert(elementType + '不能放在form裡')
          }
        }
      },
      drawAppSelect: function () {
        // 匯出和table資料來源用的App select
        var ctx = this
        servkit.ajax(
          {
            url: 'api/formeditor/app/read',
            type: 'GET',
          },
          {
            success: function (data) {
              var appData = {}
              _.each(data, function (elem) {
                appData[elem.app_id] = elem.app_name
              })
              servkit.initSelectWithList(appData, $('#app_id'))
              servkit.initSelectWithList(appData, $('[name=tableDataFromApp]'))
              ctx.drawFuncSelect()
              ctx.drawJsonFileSelect()
            },
          }
        )
      },
      drawFuncSelect: function () {
        // 匯出用的func select
        servkit.ajax(
          {
            url: 'api/formeditor/func/read?app_id=' + $('#app_id').val(),
            type: 'GET',
          },
          {
            success: function (data) {
              var funcData = {}
              _.each(data, function (elem) {
                funcData[elem.func_id] = elem.func_name
              })
              servkit.initSelectWithList(funcData, $('#func_id'))
            },
          }
        )
      },
      drawJsonFileSelect: function (defaultData) {
        // table資料來源用的json file select
        servkit.ajax(
          {
            url:
              'api/formeditor/html/getTableDataFileList?app_id=' +
              $('[name=tableDataFromApp]').val(),
            type: 'GET',
          },
          {
            success: function (data) {
              servkit.initSelectWithList(data, $('[name=tableDataFromFile]'))
              if (defaultData) {
                $('[name=tableDataFromFile]').val(defaultData)
              }
            },
          }
        )
      },
      reDrawElement: function (config) {
        // 匯入之前的元件設定(以框為單位)
        var ctx = this
        _.each(config, function (num) {
          // 先建框
          ctx.createElement($('#tabs-' + num.type), num.type, num)
          // 把框的值帶到元件編輯區域
          ctx.changeFocusElement(
            $('[data-id=' + num.element + ']'),
            $('.' + num.type + 'ElementSetting'),
            true
          )
          // 改變框的設定(改成匯入的設定值)
          ctx.changeElementSetting(
            $('#settingElementForm').find('.setting:not(.hide)'),
            ctx.elementData[num.element]
          )
          _.each(num.component, function (value) {
            // 建立每一個元件
            // 建立元件
            if (num.type === 'widget') {
              if (value.type === 'CRUDTable' || value.type === 'reportTable') {
                ctx.createElement(
                  $('[data-id=' + num.element + ']').find('.widget-body'),
                  value.type,
                  value
                )
              } else {
                ctx.createElement(
                  $('[data-id=' + num.element + ']').find('.row'),
                  value.type,
                  value
                )
              }
            } else {
              if (value.type === 'CRUDTable' || value.type === 'reportTable') {
                ctx.createElement(
                  $('[data-id=' + num.element + ']').find('.row'),
                  value.type,
                  value
                )
              } else {
                ctx.createElement(
                  $('[data-id=' + num.element + ']').find('form'),
                  value.type,
                  value
                )
              }
            }
            // 把元件的值帶到元件編輯區域
            if (value.type === 'startEndDate') {
              // 如果是有起始結束的日期元件名字加上start或end
              ctx.changeFocusElement(
                $('[data-id=' + value.element + 'start]').closest('section'),
                $('.formElementSetting'),
                true
              )
            } else if (
              value.type === 'CRUDTable' ||
              value.type === 'reportTable'
            ) {
              ctx.changeFocusElement(
                $('[data-id=' + value.element + ']').closest(
                  '.dataTables_wrapper'
                ),
                $('.tableElementSetting'),
                true
              )
            } else {
              ctx.changeFocusElement(
                $('[data-id=' + value.element + ']').closest('section'),
                $('.formElementSetting'),
                true
              )
            }
            // 改變元件的設定(改成匯入的設定值)
            ctx.changeElementSetting(
              $('#settingElementForm').find('.setting:not(.hide)'),
              ctx.elementData[value.element]
            )
          })
          // 刪掉框的ctx.elementData裡子元件的資料
          num.component = null
          delete num.component
        })
        // 把focus拿掉
        if (ctx.$thisFocus) {
          ctx.$thisFocus.find('.elementDelete').addClass('hide')
          if (ctx.$thisFocus.data('type') === 'startEndDate') {
            ctx.$thisFocus
              .find('div:not(.elementDelete)')
              .first()
              .css('padding-top', '0px')
          }
          ctx.$thisFocus.removeClass('focus')
        }
      },
      removeElement: function (type, id) {
        // 刪除元件(刪除前把一些設定拿掉)
        var ctx = this
        var key = id
        if (type === 'widget') {
          if (ctx.elementData[id].widgetForm) {
            $('[data-id=' + id + ']')
              .find('form')
              .data('validateForm')
              .destroy()
          }
          $('[data-id=' + id + ']')
            .closest('article')
            .remove()
        } else if (type === 'modal') {
          $('[data-id=' + id + ']').remove()
        } else if (type === 'date') {
          $('[data-id=' + id + ']')
            .closest('input')
            .removeClass('hasDatepicker')
            .datepicker('destroy')
          $('[data-id=' + id + ']')
            .closest('section')
            .remove()
        } else if (type === 'startEndDate') {
          $('[data-id=' + id + ']')
            .closest('input')
            .removeClass('hasDatepicker')
            .datepicker('destroy')
          $('[data-id=' + id.replace('start', 'end') + ']')
            .closest('input')
            .removeClass('hasDatepicker')
            .datepicker('destroy')
          $('[data-id=' + id + ']')
            .closest('section')
            .remove()
          key = id.replace('start', '')
        } else if (type === 'select2') {
          $('[data-id=' + id + ']').select2('destroy')
          $('[data-id=' + id + ']')
            .closest('section')
            .remove()
        } else if (type === 'select' || type === 'multipleSelect') {
          $('[data-id=' + id + ']')
            .off('mousedown')
            .off('mousemove')
          $('[data-id=' + id + ']')
            .closest('section')
            .remove()
        } else {
          if (type !== 'table') {
            $('[data-id=' + id + ']')
              .closest('section')
              .remove()
          } else {
            if ($('[data-id=' + id + '_widget]').length) {
              ctx.removeElement('widget', id + '_widget')
            }
          }
        }
        ctx.elementData[key] = null
        delete ctx.elementData[key]
      },
      clickRemoveElement: function () {
        // 分成框和元件的刪除動作
        var ctx = this
        var type = ctx.$thisFocus.data('type')
        if (type === 'widget') {
          // widget刪除前先把裡面的元件刪掉
          ctx.$thisFocus
            .find('input, select, .inline-group, label, .dataTables_wrapper')
            .each(function () {
              var id = $(this).data('id')
              var type = $(this).closest('section').data('type')
              if ($(this).hasClass('dataTables_wrapper')) {
                id = $(this).find('table').data('id')
                type = $(this).find('table').data('type')
              }
              if (
                id &&
                $(this).attr('type') !== 'checkbox' &&
                $(this).attr('type') !== 'radio'
              ) {
                ctx.removeElement(type, id)
              }
            })
          // 先把droppable刪掉
          if (ctx.$thisFocus.find('.widget-body').hasClass('ui-droppable')) {
            ctx.$thisFocus.find('.widget-body').droppable('destroy')
          } else if (ctx.$thisFocus.find('.row').hasClass('ui-droppable')) {
            ctx.$thisFocus.find('.row').droppable('destroy')
          }
          ctx.removeElement(type, ctx.$thisFocus.data('id'))
        } else if (type === 'modal') {
          // widget刪除前先把裡面的元件刪掉
          ctx.$thisFocus
            .find('input, select, .inline-group, label, .dataTables_wrapper')
            .each(function () {
              var id = $(this).data('id')
              var type = $(this).closest('section').data('type')
              if ($(this).hasClass('dataTables_wrapper')) {
                id = $(this).find('table').data('id')
                type = $(this).find('table').data('type')
              }
              if (
                id &&
                $(this).attr('type') !== 'checkbox' &&
                $(this).attr('type') !== 'radio'
              ) {
                ctx.removeElement(type, id)
              }
            })
          // 先把droppable刪掉
          if (
            ctx.$thisFocus.find('.modal-body form').hasClass('ui-droppable')
          ) {
            ctx.$thisFocus.find('.modal-body form').droppable('destroy')
          } else if (
            ctx.$thisFocus.find('.modal-body .row').hasClass('ui-droppable')
          ) {
            ctx.$thisFocus.find('.modal-body .row').droppable('destroy')
          }
          ctx.removeElement(type, ctx.$thisFocus.data('id'))
        } else {
          var $deleteEle = ctx.$thisFocus.find(
            'input, select, .inline-group, .labelText, hr'
          )
          // 因為select2的select前面還有2個input所以要特別找select
          if (type === 'select2') {
            $deleteEle = ctx.$thisFocus.find('select')
          }
          ctx.removeElement(
            $deleteEle.closest('section').data('type'),
            $deleteEle.data('id')
          )
        }
      },
      createExport: function () {
        // 呼叫匯出API
        var ctx = this
        var data = Object.assign({}, ctx.elementData)
        console.log(data)
        console.log(JSON.stringify(data))
        servkit.ajax(
          {
            url: 'api/formeditor/html/export',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              app_id: $('#app_id').val(),
              func_id: $('#func_id').val(),
              config: JSON.stringify(data),
              code: ctx.tempalteEngine.toHtml(data),
              name: $('#configFileName').val(),
            }),
          },
          {
            success: function () {
              alert('成功囉~~')
            },
          }
        )
      },
      createTableElement: function ($parent, elementType, data, oldWidgetData) {
        // 繪製table
        var ctx = this
        // 如果有這個元件的資料就用原本的，沒有的話就叫[element+數量]
        var id = data.element || 'element' + (ctx.elementQuantity += 1)
        if (!data.tableId) {
          data.tableId = id
        }
        // 如果是在modal裡外面要包一層widget
        if ($parent.parent().hasClass('modal-body')) {
          $parent.append(
            ctx.tempalteEngine.html['widgetTemplate']({
              ID: id + '_widget',
            })
          )
          var widgetData = ctx.tempalteEngine.setDefaultData('widget')

          var modalOrder = $parent.closest('[data-type=modal]').data('order')
          ctx.elementOrder.modalElement[modalOrder] += 1
          data.order =
            '2-' +
            (modalOrder + 1) +
            '.' +
            ctx.elementOrder.modalElement[modalOrder]

          // 要在elementData加上元件type
          widgetData.type = 'widget'
          // 把這個元件的設定值加到ctx.elementData
          ctx.elementData[id + '_widget'] = widgetData
          // 將$parent指到.widget-body(原本是.modal-body的.row)
          arguments[0] = $parent.find('.widget-body').last()
        } else if ($parent.closest('.tab-pane').attr('id') === 'tabs-modal') {
          var modalWidgetOrder = $parent
            .closest('[data-type=modal]')
            .data('order')
          ctx.elementOrder.modalElement[modalWidgetOrder] += 1
          data.order =
            '2-' +
            (modalWidgetOrder + 1) +
            '.' +
            ctx.elementOrder.modalElement[modalWidgetOrder]
        } else {
          var widgetOrder = $parent.closest('[data-type=widget]').data('order')
          ctx.elementOrder.widgetElement[widgetOrder] += 1
          data.order =
            '1-' +
            (widgetOrder + 1) +
            '.' +
            ctx.elementOrder.widgetElement[widgetOrder]
        }
        // 有舊的就用舊的值(modal才會有)
        if (oldWidgetData) {
          // 把這個元件的設定值加到ctx.elementData
          ctx.elementData[id + '_widget'] = oldWidgetData
          $parent.closest('.jarviswidget').attr('data-id', id + '_widget')
        }

        var templateData = {
          dataID: id,
          ID: data.tableId,
        }
        if (data.tableDataFromKey) {
          templateData.pks = data.tableDataFromKey
        } else if (elementType === 'CRUDTable') {
          templateData.pks = 'pks'
        }

        // 長出table
        $parent.append(
          ctx.tempalteEngine.html[elementType + 'Template'](templateData)
        )
        // 長出thead
        $.each(data.column, function (index, value) {
          $parent.find('thead > tr:first-child').append(
            ctx.tempalteEngine.html.theadFirstTemplate[value.tableColumnSearch](
              {
                width: value.tableColumnWidget,
              }
            )
          )

          $parent.find('thead > tr:last-child').append(
            ctx.tempalteEngine.html.theadLastTemplate({
              titleName: value.tableColumnTitleName,
            })
          )
        })

        var centerColumn = []
        var rightColumn = []

        var modalList = []

        _.each(data.column, function (elem, key) {
          var colNum = parseInt(key.replace('column', ''))
          if (elementType === 'reportTable' && !data.checkbox) {
            colNum = colNum - 1
          }
          if (elem.tableColumnAlign === 'center') {
            centerColumn.push(colNum)
          } else if (elem.tableColumnAlign === 'right') {
            rightColumn.push(colNum)
          }

          if (elem.tableColumnBtnBinding === 'Modal') {
            var isModalExist = _.find(modalList, function (value) {
              return elem.tableColumnBtnBindingModal === value
            })

            if (!isModalExist && elem.tableColumnBtnBindingModal) {
              modalList.push(elem.tableColumnBtnBindingModal)
            }
          }
        })

        var config = {}

        var customerBtn = []
        _.each(data.tableCustomerBtn, function (elem) {
          var html = []
          html.push('<button class="btn')
          if (elem.tableBtnType) {
            html.push(' btn-' + elem.tableBtnType)
          }
          html.push('"')
          if (elem.tableBtnTitle) {
            html.push(' title="' + elem.tableBtnTitle + '"')
          }
          if (elem.tableBtnBinding === 'Modal' && elem.tableBtnBindingModal) {
            html.push(
              ' data-toggle="modal" data-target="#' +
                elem.tableBtnBindingModal +
                '_demo"'
            )
          }
          html.push('>')
          html.push(elem.tableBtnText)
          html.push('</button>')
          customerBtn.push(html.join(''))

          if (elem.tableBtnBinding === 'Modal') {
            var isModalExist = _.find(modalList, function (value) {
              return elem.tableBtnBindingModal === value
            })

            if (!isModalExist && elem.tableBtnBindingModal) {
              modalList.push(elem.tableBtnBindingModal)
            }
          }
        })

        if (centerColumn.length) {
          config.centerColumn = centerColumn
        }
        if (rightColumn.length) {
          config.rightColumn = rightColumn
        }
        if (Object.keys(data.tableCustomerBtn).length > 0) {
          config.customBtns = customerBtn
        }

        if (elementType === 'CRUDTable') {
          if (data.tableCRUDEditModal) {
            config.modal = {
              id: '#' + data.tableCRUDEditModal + '_demo',
            }
            modalList.push(data.tableCRUDEditModal)
            config.columns = []
            console.log(data.tableCRUDEditModal)
          } else {
            $parent
              .find('table')
              .append(ctx.tempalteEngine.html.CRUDTabletbodyTemplate())
            // 長出tbody
            $.each(data.column, function (index, value) {
              var $tbody = $parent.find('tbody > tr:first-child')
              if (
                value.tableColumnInputType === 'multipleSelect' ||
                value.tableColumnInputType === 'select'
              ) {
                $tbody.append(
                  ctx.tempalteEngine.html.tbodyTemplate.select({
                    name: value.tableColumnName,
                    isMultiple:
                      value.tableColumnInputType === 'multipleSelect'
                        ? 'multiple="multiple"'
                        : '',
                  })
                )
                if (value.tableColumnInputSelectBy === 'DB') {
                  $tbody
                    .find('td')
                    .last()
                    .find('select')
                    .first()
                    .find('option')
                    .remove()
                  $tbody
                    .find('td')
                    .last()
                    .find('select')
                    .first()
                    .attr('stk-getdata-source', 'db')
                    .attr(
                      'stk-getdata-name',
                      value.tableColumnInputSelectDBTable
                    )
                    .attr(
                      'stk-getdata-column-text',
                      value.tableColumnInputSelectDBColumnText
                    )
                    .attr(
                      'stk-getdata-column-value',
                      value.tableColumnInputSelectDBColumnValue
                    )
                  if (value.tableColumnInputSelectDBWhere) {
                    $tbody
                      .find('td')
                      .last()
                      .find('select')
                      .first()
                      .attr(
                        'stk-getdata-where',
                        value.tableColumnInputSelectDBWhere
                      )
                  }
                } else if (value.tableColumnInputSelectBy === 'user') {
                  $tbody
                    .find('td')
                    .last()
                    .find('select')
                    .first()
                    .find('option')
                    .remove()
                  _.each(value['tableColumnInputSelectElement'], function (
                    num
                  ) {
                    $tbody
                      .find('td')
                      .last()
                      .find('select')
                      .first()
                      .append(
                        '<option style="padding:3px 0 3px 3px;" value="' +
                          num.tableColumnInputSelectValue +
                          '">' +
                          num.tableColumnInputSelectText +
                          '</option>'
                      )
                  })
                }
              } else {
                $tbody.append(
                  ctx.tempalteEngine.html.tbodyTemplate[
                    value.tableColumnInputType
                  ]({
                    name: value.tableColumnName,
                    titleName: value.tableColumnTitleName,
                  })
                )
              }
              if (value.tableColumnInputDisabled === 'edit') {
                $tbody
                  .find('td')
                  .last()
                  .find('input, select, textarea')
                  .attr('stk-pk', '欄位名稱，不得重複')
              } else if (value.tableColumnInputDisabled === 'always') {
                $tbody
                  .find('td')
                  .last()
                  .find('input, select, textarea')
                  .prop('disabled', true)
              }
            })
          }

          config.tableSelector = '#' + data.tableId
          config.order = [[data.tableOrderColumn, data.tableOrderType]]
          var createAvailable = _.find(data.tableCRUDAvailable, function (num) {
            return num === 'create'
          })
          var switchIndex, switchData
          if (createAvailable !== undefined) {
            switchData = _.find(data.column, (val, key) => {
              if (val.tableColumnInputType === 'switch') {
                switchIndex = parseInt(key.replace('column', '')) - 1
              }
              return val.tableColumnInputType === 'switch'
            })
            config.create = {
              url: '',
              send: function (tdEles) {
                var sendData = {
                  app_id: (function () {
                    return data.tableDataFromApp
                  })(),
                  data_filename: (function () {
                    return data.tableDataFromFile
                  })(),
                }

                if (
                  switchData !== undefined &&
                  (switchData.tableColumnInputSWitchOpen !== 'Y' ||
                    switchData.tableColumnInputSWitchClose !== 'N')
                ) {
                  sendData[
                    data.column['column' + (switchIndex + 1)].tableColumnName
                  ] = (function () {
                    //開關預設為ON時'Y'，OFF時'N'
                    if (
                      $(tdEles[switchIndex]).find(':checkbox').prop('checked')
                    ) {
                      return switchData.tableColumnInputSWitchOpen
                    } else {
                      return switchData.tableColumnInputSWitchClose
                    }
                  })()
                }
                return sendData
              },
              end: {},
            }
          } else {
            config.create = {
              unavailable: true,
            }
          }

          config.read = {
            url: '',
            end: {},
          }

          if (data.tableDataFromWhere) {
            config.read.whereClause = data.tableDataFromWhere
          }

          var updateAvailable = _.find(data.tableCRUDAvailable, function (num) {
            return num === 'update'
          })
          if (updateAvailable !== undefined) {
            switchData = _.find(data.column, (val, key) => {
              if (val.tableColumnInputType === 'switch') {
                switchIndex = parseInt(key.replace('column', '')) - 1
              }
              return val.tableColumnInputType === 'switch'
            })

            config.update = {
              url: '',
              send: function (tdEles) {
                var sendData = {
                  app_id: (function () {
                    return data.tableDataFromApp
                  })(),
                  data_filename: (function () {
                    return data.tableDataFromFile
                  })(),
                }

                if (
                  switchData !== undefined &&
                  (switchData.tableColumnInputSWitchOpen !== 'Y' ||
                    switchData.tableColumnInputSWitchClose !== 'N')
                ) {
                  sendData[
                    data.column['column' + (switchIndex + 1)].tableColumnName
                  ] = (function () {
                    //開關預設為ON時'Y'，OFF時'N'
                    if (
                      $(tdEles[switchIndex]).find(':checkbox').prop('checked')
                    ) {
                      return switchData.tableColumnInputSWitchOpen
                    } else {
                      return switchData.tableColumnInputSWitchClose
                    }
                  })()
                }
                return sendData
              },
              end: {},
            }
          } else {
            config.update = {
              unavailable: true,
            }
          }

          var deleteAvailable = _.find(data.tableCRUDAvailable, function (num) {
            return num === 'delete'
          })
          if (deleteAvailable !== undefined) {
            config['delete'] = {
              url: '',
            }
          } else {
            config['delete'] = {
              unavailable: true,
            }
          }

          if (data.tableDataFromTableModel) {
            config.create.url = 'api/stdcrud'
            config.read.url = 'api/stdcrud'
            config.update.url = 'api/stdcrud'
            config['delete'].url = 'api/stdcrud'
            config.tableModel =
              'com.servtech.servcloud.' + data.tableDataFromTableModel
          } else {
            config.create.url = 'api/formeditor/html/create'
            config.read.url =
              'api/formeditor/html/read?app_id=' +
              data.tableDataFromApp +
              '&data_filename=' +
              data.tableDataFromFile
            config.update.url = 'api/formeditor/html/update'
            config['delete'].url =
              'api/formeditor/html/delete?app_id=' +
              data.tableDataFromApp +
              '&data_filename=' +
              data.tableDataFromFile
          }

          _.each(data.column, function (elem, key) {
            if (data.tableCRUDEditModal) {
              config.columns.push({
                data: elem.tableColumnName,
              })
            }
            var colNum = parseInt(key.replace('column', ''))

            if (elem.tableColumnDataType === 'href') {
              config.read.end[colNum] = function (data, rowData) {
                var html = []
                html.push('<a href="javascript:void(0)"')
                if (
                  elem.tableColumnBtnBinding === 'Modal' &&
                  elem.tableColumnBtnBindingModal
                ) {
                  html.push(
                    ' data-toggle="modal" data-target="#' +
                      elem.tableColumnBtnBindingModal +
                      '_demo"'
                  )
                }
                _.each(rowData, (value, key) => {
                  if (value && key === 'pks') {
                    html.push(
                      ' data-pks="' +
                        JSON.stringify(rowData.pks).replace(/"/g, '') +
                        '"'
                    )
                  } else {
                    html.push(' data-' + key + '="' + value + '"')
                  }
                })
                html.push('>')
                html.push(elem.tableColumnText || data)
                html.push('</a>')
                return html.join('')
              }
              if (createAvailable !== undefined) {
                config.create.end[colNum] = function (td, formData) {
                  var html = []
                  html.push('<a href="javascript:void(0)"')
                  if (
                    elem.tableColumnBtnBinding === 'Modal' &&
                    elem.tableColumnBtnBindingModal
                  ) {
                    html.push(
                      ' data-toggle="modal" data-target="#' +
                        elem.tableColumnBtnBindingModal +
                        '_demo"'
                    )
                  }
                  _.each(formData, (value, key) => {
                    if (value && key === 'pks') {
                      html.push(
                        ' data-pks="' +
                          JSON.stringify(formData.pks).replace(/"/g, '') +
                          '"'
                      )
                    } else {
                      html.push(' data-' + key + '="' + value + '"')
                    }
                  })
                  html.push('>')
                  html.push(
                    elem.tableColumnText || $(td).find('input, select').val()
                  )
                  html.push('</a>')
                  return html.join('')
                }
              }
              if (updateAvailable !== undefined) {
                config.update.end[colNum] = function (td, formData) {
                  var html = []
                  html.push('<a href="javascript:void(0)"')
                  if (
                    elem.tableColumnBtnBinding === 'Modal' &&
                    elem.tableColumnBtnBindingModal
                  ) {
                    html.push(
                      ' data-toggle="modal" data-target="#' +
                        elem.tableColumnBtnBindingModal +
                        '_demo"'
                    )
                  }
                  _.each(formData, (value, key) => {
                    if (value && key === 'pks') {
                      html.push(
                        ' data-pks="' +
                          JSON.stringify(formData.pks).replace(/"/g, '') +
                          '"'
                      )
                    } else {
                      html.push(' data-' + key + '="' + value + '"')
                    }
                  })
                  html.push('>')
                  html.push(
                    elem.tableColumnText || $(td).find('input, select').val()
                  )
                  html.push('</a>')
                  return html.join('')
                }
              }
            } else if (elem.tableColumnDataType === 'button') {
              config.read.end[colNum] = function (data, rowData) {
                var html = []
                html.push('<button class="btn')
                if (elem.tableColumnBtnType) {
                  html.push(' btn-' + elem.tableColumnBtnType)
                }
                html.push('"')
                if (elem.tableColumnTitle) {
                  html.push(' title="' + elem.tableColumnTitle + '"')
                }
                if (
                  elem.tableColumnBtnBinding === 'Modal' &&
                  elem.tableColumnBtnBindingModal
                ) {
                  html.push(
                    ' data-toggle="modal" data-target="#' +
                      elem.tableColumnBtnBindingModal +
                      '_demo"'
                  )
                }
                _.each(rowData, (value, key) => {
                  if (value && key === 'pks') {
                    html.push(
                      ' data-pks="' +
                        JSON.stringify(rowData.pks).replace(/"/g, '') +
                        '"'
                    )
                  } else {
                    html.push(' data-' + key + '="' + value + '"')
                  }
                })
                html.push('>')
                html.push(elem.tableColumnText || data)
                html.push('</button>')
                return html.join('')
              }
              if (createAvailable !== undefined) {
                config.create.end[colNum] = function (td, formData) {
                  var html = []
                  html.push('<button class="btn')
                  if (elem.tableColumnBtnType) {
                    html.push(' btn-' + elem.tableColumnBtnType)
                  }
                  html.push('"')
                  if (elem.tableColumnTitle) {
                    html.push(' title="' + elem.tableColumnTitle + '"')
                  }
                  if (
                    elem.tableColumnBtnBinding === 'Modal' &&
                    elem.tableColumnBtnBindingModal
                  ) {
                    html.push(
                      ' data-toggle="modal" data-target="#' +
                        elem.tableColumnBtnBindingModal +
                        '_demo"'
                    )
                  }
                  _.each(formData, (value, key) => {
                    if (value && key === 'pks') {
                      html.push(
                        ' data-pks="' +
                          JSON.stringify(formData.pks).replace(/"/g, '') +
                          '"'
                      )
                    } else {
                      html.push(' data-' + key + '="' + value + '"')
                    }
                  })
                  html.push('>')
                  html.push(
                    elem.tableColumnText || $(td).find('input, select').val()
                  )
                  html.push('</button>')
                  return html.join('')
                }
              }
              if (updateAvailable !== undefined) {
                config.update.end[colNum] = function (td, formData) {
                  var html = []
                  html.push('<button class="btn')
                  if (elem.tableColumnBtnType) {
                    html.push(' btn-' + elem.tableColumnBtnType)
                  }
                  html.push('"')
                  if (elem.tableColumnTitle) {
                    html.push(' title="' + elem.tableColumnTitle + '"')
                  }
                  if (
                    elem.tableColumnBtnBinding === 'Modal' &&
                    elem.tableColumnBtnBindingModal
                  ) {
                    html.push(
                      ' data-toggle="modal" data-target="#' +
                        elem.tableColumnBtnBindingModal +
                        '_demo"'
                    )
                  }
                  _.each(formData, (value, key) => {
                    if (value && key === 'pks') {
                      html.push(
                        ' data-pks="' +
                          JSON.stringify(formData.pks).replace(/"/g, '') +
                          '"'
                      )
                    } else {
                      html.push(' data-' + key + '="' + value + '"')
                    }
                  })
                  html.push('>')
                  html.push(
                    elem.tableColumnText || $(td).find('input, select').val()
                  )
                  html.push('</button>')
                  return html.join('')
                }
              }
            }
          })

          if (data.tableCRUDEditModal) {
            var columnMap = _.map(data.column, (value) => {
              return {
                name: value.tableColumnName,
                disable: value.tableColumnInputDisabled,
                isFormHaveEle: false,
              }
            })
            ctx.createModalWithHtml(modalList, columnMap)
            var notFormHaveEle = _.reject(columnMap, function (num) {
              return num.isFormHaveEle
            })

            if (notFormHaveEle !== undefined) {
              var nameStr = []
              _.each(notFormHaveEle, (name) => {
                nameStr.push(name.name)
              })
              alert(nameStr.join(', ') + '沒有設定')
            }
          } else {
            ctx.createModalWithHtml(modalList)
          }
          // 初始CRUD table
          servkit.crudtable(config)
        } else if (elementType === 'reportTable') {
          config.$tableElement = $('#' + data.tableId)
          config.$tableWidget = $('#' + data.tableId).closest('.jarviswidget')
          config.order = [[data.tableOrderColumn, data.tableOrderType]]

          if (data.tableExport) {
            config.excel = {}
            config.excel.fileName = data.tableExportFilename
            config.excel.format = _.map(data.column, (val) => {
              return val.tableColumnFormatType
            })
            var columnList = _.filter(data.tableExportColumns, (val) => {
              return val !== 'ALL'
            })
            config.excel.customHeaderFunc = function (tableHeader) {
              return _.filter(tableHeader, function (num, index) {
                var v = _.find(columnList, (val) => {
                  return index == val
                })
                return v !== undefined
              })
            }
            config.excel.customDataFunc = function (tableData) {
              var cloneTableData = $.extend(true, {}, tableData)
              return _.map(cloneTableData, function (elem) {
                return _.filter(elem, function (num, index) {
                  var v = _.find(columnList, (val) => {
                    return index == val
                  })
                  return v !== undefined
                })
              })
            }
          }

          if (data.chartExists) {
            if ($('#' + id + '_chart').length < 1) {
              $parent.closest('article').before(
                ctx.tempalteEngine.html.widgetTemplate({
                  ID: id + '_widget',
                })
              )

              var chartWidgetData = ctx.tempalteEngine.setDefaultData('widget')
              // 要在elementData加上元件type
              chartWidgetData.type = 'widget'
              // 把這個元件的設定值加到ctx.elementData
              ctx.elementData[id + '_widget'] = chartWidgetData

              $('[data-id=' + id + '_widget]')
                .find('.widget-body')
                .removeClass('no-padding')
                .append(
                  '<div id="' + id + '_chart" style="height: 300px;"></div>'
                )
            }
            var optionsMap = {}
            if (data.chartXTick && data.chartXTick !== undefined) {
              data.chartXTick.sort()
            }
            _.each(data, (optionElem, optionKey) => {
              optionsMap[optionKey] = optionElem
            })
            config.onDraw = function (tableData, pageData) {
              ctx.drawChart(id, pageData, optionsMap)
            }
          } else {
            if ($('#' + id + '_chart').length) {
              ctx.$thisFocus = $('#' + id + '_chart').closest('.jarviswidget')
              ctx.$thisFocus
                .find('.elementDelete')
                .removeClass('hide')
                .trigger('click')
            }
          }

          ctx.createModalWithHtml(modalList)

          // 初始report table
          ctx[id + 'reportTabble'] = createReportTable(config)
          if (data.tableDataFromTableModel) {
            data.columnList = null
            delete data.columnList
            ctx.drawReportTableByDB(data, ctx[id + 'reportTabble'])
          } else {
            ctx.drawReportTableByFile(data, ctx[id + 'reportTabble'])
          }
        }

        if ($parent.hasClass('ui-droppable')) {
          $parent.droppable('destroy')
        }

        // 要自己加上table的type(因為他是後來才長出來的)
        $parent.find('.dataTables_wrapper').attr('data-type', elementType)
        // 要在elementData加上元件type
        data.type = elementType
        // 加上辨識
        data.element = id
        // 把這個元件的設定值加到ctx.elementData
        ctx.elementData[id] = data
      },
      getReportTableFormData: function ($form) {
        var ctx = this
        var criteriaData = {}
        $form.find('input, select, .inline-group').each(function () {
          var id = $(this).data('id')
          if (
            id &&
            $(this).attr('type') !== 'checkbox' &&
            $(this).attr('type') !== 'radio'
          ) {
            id = id.replace('start', '').replace('end', '')
            criteriaData[id] = {
              bindingColumn: ctx.elementData[id].formBindingTableColumn,
              type: ctx.elementData[id].type,
            }
            if (ctx.elementData[id].type === 'startEndDate') {
              criteriaData[id].value = [
                $(this).closest('section').find('input').first().val(),
                $(this).closest('section').find('input').last().val(),
              ]
            } else if (ctx.elementData[id].type === 'radio') {
              $(this)
                .find('input')
                .each(function () {
                  if ($(this).prop('checked')) {
                    criteriaData[id].value = $(this).val()
                  }
                })
            } else if (ctx.elementData[id].type === 'checkbox') {
              criteriaData[id].value = []
              $(this)
                .find('input')
                .each(function () {
                  if ($(this).prop('checked')) {
                    criteriaData[id].value.push($(this).val())
                  }
                })
            } else {
              criteriaData[id].value = $(this).val()
            }
          }
        })
        return criteriaData
      },
      getCRUDTableFormData: function ($form) {
        var ctx = this
        var criteria = ''
        $form.find('input, select, .inline-group').each(function () {
          var id = $(this).data('id')
          if (
            id &&
            $(this).attr('type') !== 'checkbox' &&
            $(this).attr('type') !== 'radio'
          ) {
            id = id.replace('start', '').replace('end', '')
            var tableColumn = ctx.elementData[id].formBindingTableColumn
            if (tableColumn && tableColumn !== 'none') {
              if (criteria !== '') {
                criteria += '_And_'
              }
              if (ctx.elementData[id].type === 'startEndDate') {
                criteria +=
                  tableColumn +
                  '=' +
                  $(this).closest('section').find('input').first().val() +
                  '_To_' +
                  $(this).closest('section').find('input').last().val() +
                  '_Type_startEndDate'
              } else if (ctx.elementData[id].type === 'radio') {
                var radioValue
                $(this)
                  .find('input')
                  .each(function () {
                    if ($(this).prop('checked')) {
                      radioValue = $(this).val()
                    }
                  })
                criteria += tableColumn + '=' + radioValue
              } else if (ctx.elementData[id].type === 'checkbox') {
                var checkboxValue = []
                criteria += tableColumn + '=['
                $(this)
                  .find('input')
                  .each(function () {
                    if ($(this).prop('checked')) {
                      checkboxValue.push($(this).val())
                    }
                  })
                criteria += checkboxValue.join(',') + ']'
              } else {
                var value = $(this).val()
                if (_.isArray(value)) {
                  criteria += tableColumn + '=['
                  if (
                    ctx.elementData[id].type === 'multipleSelect' &&
                    value[0] === 'ALL'
                  ) {
                    value.shift()
                  }
                  criteria += value.join(',') + ']'
                } else {
                  criteria += tableColumn + '=' + value
                }
                if (ctx.elementData[id].type === 'date') {
                  criteria += '_Type_date'
                }
              }
            }
          }
        })
        return criteria
      },
      getTableFormDataDB: function ($form) {
        var ctx = this
        var criteria = ''
        $form.find('input, select, .inline-group').each(function () {
          var id = $(this).data('id')
          if (
            id &&
            $(this).attr('type') !== 'checkbox' &&
            $(this).attr('type') !== 'radio'
          ) {
            id = id.replace('start', '').replace('end', '')
            var tableColumn = ctx.elementData[id].formBindingTableColumn
            if (tableColumn && tableColumn !== 'none') {
              if (criteria !== '') {
                criteria += ' AND '
              }
              if (ctx.elementData[id].type === 'startEndDate') {
                criteria +=
                  tableColumn +
                  ' BETWEEN "' +
                  $(this).closest('section').find('input').first().val() +
                  '" AND "' +
                  $(this).closest('section').find('input').last().val() +
                  ' 23:59:59"'
              } else if (ctx.elementData[id].type === 'radio') {
                var radioValue
                $(this)
                  .find('input')
                  .each(function () {
                    if ($(this).prop('checked')) {
                      radioValue = $(this).val()
                    }
                  })
                criteria += tableColumn + '= "' + radioValue + '"'
              } else if (ctx.elementData[id].type === 'checkbox') {
                var checkboxValue = []
                criteria += tableColumn + ' IN ('
                $(this)
                  .find('input')
                  .each(function () {
                    if ($(this).prop('checked')) {
                      checkboxValue.push($(this).val())
                    }
                  })
                criteria += checkboxValue.join('","') + '")'
              } else {
                var value = $(this).val()
                if (_.isArray(value)) {
                  criteria += tableColumn + ' IN ("'
                  if (
                    ctx.elementData[id].type === 'multipleSelect' &&
                    value[0] === 'ALL'
                  ) {
                    value.shift()
                  }
                  criteria += value.join('","') + '")'
                } else if (ctx.elementData[id].type === 'date') {
                  criteria +=
                    tableColumn +
                    ' BETWEEN "' +
                    value +
                    '" AND "' +
                    value +
                    ' 23:59:59"'
                } else {
                  criteria += tableColumn + ' = "' + value + '"'
                }
              }
            }
          }
        })
        return criteria
      },
      drawReportTableByFile: function (data, table, criteriaData) {
        var ctx = this
        $.get(
          './app/' +
            data.tableDataFromApp +
            '/data/' +
            data.tableDataFromFile +
            '.json',
          (rep) => {
            ctx.tempalteEngine.getReportData(rep, criteriaData)
            var keyColumn = []
            _.each(rep.head, function (val, key) {
              var isKey = _.find(rep.keys, (keyValue) => {
                return keyValue === val
              })
              if (isKey) {
                keyColumn.push(key)
              }
            })
            var dataList = []
            var dataMap = []
            var index = 0
            _.each(data.column, (val) => {
              var colNum = _.findIndex(rep.head, (col) => {
                return col === val.tableColumnName
              })
              dataList.push(colNum === -1 ? index : colNum)
              dataMap.push(val)
              index++
            })
            data.columnList = dataList
            data.columnMap = dataMap
            var ajaxData = {}
            _.each(dataList, (col) => {
              if (
                col >= 0 &&
                dataMap[col] &&
                dataMap[col].tableColumnChangeText === 'DB'
              ) {
                servkit.ajax(
                  {
                    url: 'api/getdata/db',
                    type: 'POST',
                    async: false,
                    contentType: 'application/json',
                    data: JSON.stringify({
                      table: dataMap[col].tableColumnTextDBTable,
                      columns: [
                        dataMap[col].tableColumnTextDBColumnValue,
                        dataMap[col].tableColumnTextDBColumnText,
                      ],
                    }),
                  },
                  {
                    success: function (data) {
                      var map = {}
                      _.each(data, function (elem) {
                        map[elem[dataMap[col].tableColumnTextDBColumnValue]] =
                          elem[dataMap[col].tableColumnTextDBColumnText]
                      })
                      ajaxData[dataMap[col].tableColumnName] = map
                    },
                  }
                )
              }
            })
            table.drawTable(
              _.map(rep.data, (val) => {
                return _.map(dataList, (col) => {
                  var pks = {}
                  _.each(keyColumn, function (column) {
                    pks[rep.head[column]] = val[column]
                  })
                  if (
                    col >= 0 &&
                    dataMap[col] &&
                    dataMap[col].tableColumnChangeText === 'DB'
                  ) {
                    return ctx.reportTableData(
                      val,
                      dataMap[col],
                      ajaxData[dataMap[col].tableColumnName][val[col]],
                      pks,
                      rep.head
                    )
                  } else if (
                    col >= 0 &&
                    dataMap[col] &&
                    dataMap[col].tableColumnChangeText === 'user'
                  ) {
                    var map = {}
                    _.each(dataMap[col].tableColumnTextSelectElement, (ele) => {
                      map[ele.tableColumnTextSelectValue] =
                        ele.tableColumnTextSelectText
                    })
                    return ctx.reportTableData(
                      val,
                      dataMap[col],
                      map[val[col]],
                      pks,
                      rep.head
                    )
                  } else {
                    return ctx.reportTableData(
                      val,
                      dataMap[col],
                      val[col],
                      pks,
                      rep.head
                    )
                  }
                })
              })
            )
          }
        )
      },
      drawReportTableByDB: function (data, table, criteriaData) {
        var ctx = this
        var ajaxData = {
          tableModel: 'com.servtech.servcloud.' + data.tableDataFromTableModel,
        }
        if (criteriaData) {
          ajaxData.whereClause = criteriaData
        }
        servkit.ajax(
          {
            url: 'api/stdcrud',
            type: 'GET',
            contentType: 'application/json',
            data: ajaxData,
          },
          {
            success: function (rep) {
              var ajaxData = {}
              _.each(data.column, (col) => {
                if (col.tableColumnChangeText === 'DB') {
                  servkit.ajax(
                    {
                      url: 'api/getdata/db',
                      type: 'POST',
                      async: false,
                      contentType: 'application/json',
                      data: JSON.stringify({
                        table: col.tableColumnTextDBTable,
                        columns: [
                          col.tableColumnTextDBColumnValue,
                          col.tableColumnTextDBColumnText,
                        ],
                      }),
                    },
                    {
                      success: function (data) {
                        var map = {}
                        _.each(data, function (elem) {
                          map[elem[col.tableColumnTextDBColumnValue]] =
                            elem[col.tableColumnTextDBColumnText]
                        })
                        ajaxData[col.tableColumnName] = map
                      },
                    }
                  )
                }
              })
              table.drawTable(
                _.map(rep, (val) => {
                  return _.map(data.column, (col) => {
                    if (col.tableColumnChangeText === 'DB') {
                      return ctx.reportTableData(
                        val,
                        col,
                        ajaxData[col.tableColumnName][val[col.tableColumnName]]
                      )
                    } else if (col.tableColumnChangeText === 'user') {
                      var map = {}
                      _.each(col.tableColumnTextSelectElement, (ele) => {
                        map[ele.tableColumnTextSelectValue] =
                          ele.tableColumnTextSelectText
                      })
                      return ctx.reportTableData(
                        val,
                        col,
                        map[val[col.tableColumnName]]
                      )
                    } else {
                      return ctx.reportTableData(
                        val,
                        col,
                        val[col.tableColumnName]
                      )
                    }
                  })
                })
              )
            },
          }
        )
      },
      reportTableData: function (val, col, text, pks, head) {
        var html = []
        if (col && col.tableColumnDataType === 'href') {
          html.push('<a href="javascript:void(0)"')
          if (col.tableColumnBtnBinding === 'Modal') {
            html.push(' class="' + col.tableColumnBtnBindingModal + 'Btn"')
            html.push(
              ' data-toggle="modal" data-target="#' +
                col.tableColumnBtnBindingModal +
                '_demo'
            )
            html.push('"')
          }
          if (pks) {
            html.push(
              ' data-pks="' + JSON.stringify(pks).replace(/"/g, '') + '"'
            )
            _.each(val, (value, key) => {
              html.push(' data-' + head[key] + '="' + value + '"')
            })
          } else {
            _.each(val, (value, key) => {
              html.push(' data-' + key + '="' + value + '"')
            })
          }
          html.push('>')
          html.push(col.tableColumnText || text)
          html.push('</a>')
        } else if (col && col.tableColumnDataType === 'button') {
          html.push('<button class="btn')
          if (col.tableColumnBtnType) {
            html.push(' btn-' + col.tableColumnBtnType)
          }
          html.push(' ' + col.tableColumnBtnBindingModal + 'Btn')
          html.push('"')
          if (col.tableColumnTitle) {
            html.push(' title="' + col.tableColumnTitle + '"')
          }
          if (col.tableColumnBtnBinding === 'Modal') {
            html.push(
              ' data-toggle="modal" data-target="#' +
                col.tableColumnBtnBindingModal +
                '_demo'
            )
            html.push('"')
          }
          if (pks) {
            html.push(
              ' data-pks="' + JSON.stringify(pks).replace(/"/g, '') + '"'
            )
            _.each(val, (value, key) => {
              html.push(' data-' + head[key] + '="' + value + '"')
            })
          } else {
            _.each(val, (value, key) => {
              html.push(' data-' + key + '="' + value + '"')
            })
          }
          html.push('>')
          html.push(col.tableColumnText || text)
          html.push('</button>')
        }
        var value = text
        if (value === null || value === undefined) {
          value = ''
        }
        return html.length > 0 ? html.join('') : value
      },
      drawChart: function (id, data, optionsMap) {
        var $chart = $('#' + id + '_chart')
        var options = {
          series: {},
          xaxis: {
            tickColor: 'rgba(186,186,186,0.2)',
            axisLabelFontFamily: servkit.fonts,
            axisLabelUseCanvas: true,
            axisLabelPadding: 5,
          },
          yaxis: {
            min: 0,
            tickColor: 'rgba(186,186,186,0.2)',
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: servkit.fonts,
            axisLabelUseCanvas: true,
            axisLabelPadding: 5,
            tickDecimals: 0,
            minTickSize: 1,
          },
          legend: {
            show: true,
          },
          grid: {
            show: true,
            hoverable: true,
            clickable: true,
            tickColor: '#EFEFEF',
            borderWidth: 0,
            borderColor: '#EFEFEF',
          },
          tooltip: true,
          tooltipOpts: {
            content: '<b style="display:none;">%x</b><span>%y</span>',
            defaultTheme: false,
          },
        }

        var labelList = []
        if (optionsMap.chartXTick) {
          if (optionsMap.chartXTick[0] === 'ALL') {
            optionsMap.chartXTick.shift()
          }
          labelList = _.map(data, function (elem, index) {
            var content = ''
            for (var i = 0; i < optionsMap.chartXTick.length; i++) {
              var text = elem[parseInt(optionsMap.chartXTick[i])]
              if (content) {
                content += '<br>'
              }
              // text.length > 10 ? content += '...' + text.substr(text.length - 7) : content += text
              content += text
            }
            return [index, content]
          })
          options.xaxis.ticks = labelList
        }

        var dataList = []
        if (optionsMap.chartColumn !== null) {
          dataList = _.map(data, function (elem, index) {
            var value = parseInt(elem[parseInt(optionsMap.chartColumn)])
            return [index, value.toString() !== 'NaN' ? value : null]
          })
        }
        var chartData = [
          {
            data: dataList,
            color: servkit.colors[optionsMap.chartColor],
          },
        ]

        if (optionsMap.chartStandard) {
          chartData.push({
            data: _.map(dataList, (elem) => {
              return [elem[0], optionsMap.chartStandard]
            }),
            color: servkit.colors.red,
            lines: {
              show: true,
            },
          })
        }

        chartData[0][optionsMap.chartType] = {
          show: true,
        }

        if (optionsMap.chartType === 'bars') {
          chartData[0].bars.align = 'center'
          chartData[0].bars.barWidth = 0.5
        } else if (optionsMap.chartType === 'pie') {
          options.legend.show = false
          options.series.pie = {}
          options.series.pie.show = true
          options.series.pie.label = {
            show: true,
            radius: 0.8,
            formatter: function (label, series) {
              var text = label ? label + ' : ' : ''
              return (
                '<div style="border:1px solid grey;font-size:8pt;text-align:center;padding:5px;color:white;">' +
                text +
                Math.round(series.percent) +
                '%</div>'
              )
            },
            background: {
              opacity: 0.8,
              color: '#000',
            },
          }
          chartData = []
          _.each(dataList, (elem, key) => {
            chartData.push({
              label: labelList[key][1],
              data: elem,
              color: servkit.colors[optionsMap.chartColor],
            })
          })
        }

        if (optionsMap.chartXLabel) {
          options.xaxis.axisLabel = optionsMap.chartXLabel
        }
        if (optionsMap.chartYLabel) {
          options.yaxis.axisLabel = optionsMap.chartYLabel
        }

        $('#export_image').closest('.widget-toolbar').remove()
        if (optionsMap.chartExport) {
          $chart
            .closest('.jarviswidget')
            .find('header')
            .attr('id', id + '_chartHead')
          servkit.addmultiChartExport('#' + id + '_chartHead', [
            '#' + id + '_chart',
          ])
        }
        console.log(chartData)
        console.log(options)
        try {
          $.plot($chart, chartData, options)
        } catch (e) {
          console.warn(e)
        }
      },
      createModalWithHtml: function (modalList, columnMap) {
        var ctx = this
        _.each(modalList, function (num) {
          if ($('#' + num + '_demo').length) {
            $('#' + num + '_demo')
              .closest('.modal_demo')
              .remove()
          }
          if ($('#' + num).length > 0) {
            $('#widget-grid > .row').append(
              '<div class="modal fade modal_demo" id="' +
                num +
                '_demo_modal_frame" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true"></div>'
            )
            $('#' + num)
              .clone(true)
              .appendTo('#' + num + '_demo_modal_frame')
            var $thisModal = $('.modal_demo').find('#' + num)
            $thisModal
              .removeClass('demo-modal')
              .removeAttr('id')
              .parent()
              .attr('id', num + '_demo')
            $thisModal
              .find('form')
              .attr('id', $thisModal.find('form').attr('id') + '_demo')
            $thisModal
              .find('.modal-footer button')
              .attr(
                'id',
                $thisModal.find('.modal-footer button').attr('id') + '_demo'
              )
            $thisModal.find('.elementDelete').remove()
            $thisModal.find('input, select').each(function () {
              if ($(this).data('id')) {
                if ($(this).attr('id')) {
                  $(this).attr('id', $(this).attr('id') + '_demo')
                }
                if ($(this).closest('section').data('type') === 'date') {
                  var datepickerConfig = {
                    dateFormat: 'yy/mm/dd',
                    prevText: '<i class="fa fa-chevron-left"></i>',
                    nextText: '<i class="fa fa-chevron-right"></i>',
                    minDate: new Date(),
                  }
                  $(this)
                    .datepicker(datepickerConfig)
                    .val(moment(new Date()).format('YYYY/MM/DD'))
                } else if (
                  $(this).closest('section').data('type') === 'startEndDate'
                ) {
                  var startEndDateSetting =
                    ctx.elementData[
                      $(this).data('id').replace('start', '').replace('end', '')
                    ]
                  if (startEndDateSetting) {
                    servkit.initDatePicker(
                      $('.modal_demo').find(
                        '[data-id=' + $(this).data('id') + ']'
                      ),
                      $('.modal_demo').find(
                        '[data-id=' + $(this).data('id') + ']'
                      ),
                      startEndDateSetting['formBothToday'],
                      startEndDateSetting['formBothLimit']
                        ? startEndDateSetting['formBothLimitDays']
                        : false
                    )
                  }
                } else if (
                  $(this).closest('section').data('type') === 'select2'
                ) {
                  $(this).siblings('div').remove()
                  $(this).select2()
                }
              }
              if (columnMap !== undefined && columnMap.length) {
                var isColEle = _.findIndex(columnMap, (name) => {
                  return $(this).attr('name') === name.name
                })
                if (isColEle >= 0) {
                  if (columnMap[isColEle].disable === 'always') {
                    $(this).attr('disabled')
                  } else if (columnMap[isColEle].disable === 'edit') {
                    $(this).attr('stk-pk')
                  }
                  columnMap[isColEle].isFormHaveEle = true
                }
              }
            })
          }
        })
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
      ['/js/plugin/select2/select2.min.js'],
      [
        '/js/plugin/flot/jquery.flot.cust.min.js',
        '/js/plugin/flot/jquery.flot.resize.min.js',
        '/js/plugin/flot/jquery.flot.fillbetween.min.js',
        '/js/plugin/flot/jquery.flot.orderBar.min.js',
        '/js/plugin/flot/jquery.flot.pie.min.js',
        '/js/plugin/flot/jquery.flot.time.min.js',
        '/js/plugin/flot/jquery.flot.tooltip.min.js',
        '/js/plugin/d3/d3.v4.min.js',
        '/js/plugin/flot/jquery.flot.axislabels.js',
        '/js/plugin/flot/jquery.flot.stack.min.js',
        '/js/plugin/flot/jquery.flot.valuelabels.js',
      ],
    ],
  })
}
