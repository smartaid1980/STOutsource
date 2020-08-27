;(function (global, $, _) {
  function TempalteEngine() {
    this.toHtmlgogo = []
    this.toHtmlutil = []
    this.toHtmldependencies = []
    this.toHtmlpreCondition = []
    this.dbTableList = []
    this.tableColByDB = []
    this.select2Exist = false
    this.tableExist = false
    this.chartExist = false
  }

  function clear(tempalteEngine) {
    tempalteEngine.toHtmlgogo = []
    tempalteEngine.toHtmlutil = []
    tempalteEngine.toHtmldependencies = []
    tempalteEngine.toHtmlpreCondition = []
    tempalteEngine.dbTableList = []
    tempalteEngine.tableColByDB = []
    tempalteEngine.select2Exist = false
    tempalteEngine.tableExist = false
    tempalteEngine.chartExist = false
  }

  function orderElement(list, data) {
    // 排序元件
    // 以widget分element
    var elementList = _.groupBy(list, function (num) {
      return num.order.charAt(2)
    })
    // widget內部的排序
    _.each(elementList, function (value) {
      data.push(
        _.groupBy(value, function (num) {
          return num.order.indexOf('.') !== -1
        }).false[0]
      )
      var widgetElements = _.groupBy(value, function (num) {
        return num.order.indexOf('.') !== -1
      }).true

      data[data.length - 1].component = []
      // 排序元件
      _.each(widgetElements, function (num) {
        num.newOrder = parseInt(num.order.replace(data.order + '.', ''))
        data[data.length - 1].component.push(num)
      })
    })
    return data
  }

  function splitWidgetModal(config) {
    // 元件分成widget和modal
    var list = []
    var data = {
      widget: [],
      modal: [],
    }

    data.modalWidget = _.pick(config, function (num, key) {
      return key.search('_widget') >= 0
    })

    var conf = _.omit(config, function (num, key) {
      return key.search('_widget') >= 0
    })

    // 找到widget
    list = _.groupBy(conf, function (num, key) {
      num.element = key
      return num.order.indexOf('1-') !== -1
    }).true
    orderElement(list, data.widget)

    // 找到modal
    list = _.groupBy(conf, function (num, key) {
      num.element = key
      return num.order.indexOf('1-') !== -1
    }).false
    orderElement(list, data.modal)
    return data
  }

  function drawWidget(config, tempalteEngine, allConfig) {
    // 畫widget
    var widgetCode = []

    widgetCode.push('<!-- NEW WIDGET START -->\n')
    if (!config.modalWidget) {
      widgetCode.push(
        '<article class="col col-xs-' +
          config.widgetXsSize +
          ' col-sm-' +
          config.widgetSmSize +
          ' col-md-' +
          config.widgetMdSize +
          ' col-lg-' +
          config.widgetLgSize +
          '">\n'
      )
    }

    // widget的框
    widgetCode.push('<div class="jarviswidget jarviswidget-color-darken" ')
    var tableId = _.find(config.component, function (num) {
      return num.type === 'reportTable' || num.type === 'CRUDTable'
    })
    if (tableId) {
      widgetCode.push('id="' + tableId.tableId + '-widget" ')
    }
    if (!config.widgetFullsreen) {
      widgetCode.push('data-widget-fullscreenbutton="false" ')
    }
    if (!config.widgetToggle) {
      widgetCode.push('data-widget-togglebutton="false"')
    }
    if (config.widgetFullsreen || config.widgetToggle) {
      tempalteEngine.toHtmlgogo.push('pageSetUp()\n')
    }
    widgetCode.push('>\n')

    // widget header and body
    if (config.chartId) {
      widgetCode.push(
        '<header id="' +
          config.chartId +
          'head">\n<span class="widget-icon"> ' +
          config.widgetIcon +
          ' </span>\n'
      )
      widgetCode.push('<h2>' + config.widgetTitle + '</h2>\n</header>\n')
      widgetCode.push('<div>\n<div class="widget-body">\n')
      widgetCode.push(
        '<div id="' +
          config.chartId +
          '" style="width: 100%; height: 300px;"></div>\n'
      )
    } else {
      widgetCode.push(
        '<header>\n<span class="widget-icon"> ' +
          config.widgetIcon +
          ' </span>\n'
      )
      widgetCode.push('<h2>' + config.widgetTitle + '</h2>\n</header>\n')
      widgetCode.push('<div>\n<div class="widget-body no-padding">\n')
    }
    if (config.widgetForm) {
      tempalteEngine.toHtmlgogo.push(
        "servkit.validateForm($('#" +
          config.widgetFormId +
          "'), $('#" +
          config.widgetButtonId +
          "'))\n"
      )
      setFormBinding(allConfig, 'widget', config, tempalteEngine)
      widgetCode.push(
        '<form class="smart-form" id="' +
          config.widgetFormId +
          '" novalidate="novalidate">\n'
      )
      widgetCode.push('<fieldset>\n<div class="row">\n')
      _.each(config.component, function (elem) {
        widgetCode.push(
          '<section class="col col-xs-' +
            elem.formXsSize +
            ' col-sm-' +
            elem.formSmSize +
            ' col-md-' +
            elem.formMdSize +
            ' col-lg-' +
            elem.formLgSize +
            '">\n'
        )
        if (elem.type === 'text') {
          widgetCode.push.apply(widgetCode, drawText(elem, tempalteEngine))
        } else if (elem.type === 'date') {
          widgetCode.push.apply(widgetCode, drawDate(elem, tempalteEngine))
        } else if (elem.type === 'startEndDate') {
          widgetCode.push.apply(
            widgetCode,
            drawStartEndDate(elem, tempalteEngine)
          )
        } else if (elem.type === 'select') {
          widgetCode.push.apply(widgetCode, drawSelect(elem, tempalteEngine))
        } else if (elem.type === 'select2') {
          widgetCode.push.apply(widgetCode, drawSelect2(elem, tempalteEngine))
        } else if (elem.type === 'multipleSelect') {
          widgetCode.push.apply(
            widgetCode,
            drawMultipleSelect(elem, tempalteEngine)
          )
        } else if (elem.type === 'radio') {
          widgetCode.push.apply(widgetCode, drawRadio(elem, tempalteEngine))
        } else if (elem.type === 'checkbox') {
          widgetCode.push.apply(widgetCode, drawCheckbox(elem, tempalteEngine))
        } else if (elem.type === 'label') {
          widgetCode.push.apply(widgetCode, drawLabel(elem))
        } else if (elem.type === 'hr') {
          widgetCode.push.apply(widgetCode, drawHr(elem))
        }
        widgetCode.push('</section>\n')
      })
      widgetCode.push('</div>\n</fieldset>\n')
      widgetCode.push(
        '<footer>\n<button id="' +
          config.widgetButtonId +
          '" class="btn btn-primary">送出</button>\n</footer>\n</form>\n'
      )
    } else {
      _.each(config.component, function (elem) {
        if (elem.type === 'CRUDTable' || elem.type === 'reportTable') {
          if (elem.chartExists) {
            var chartConfig = Object.assign(
              {},
              allConfig[elem.element + '_widget']
            )
            chartConfig.chartId = elem.tableId + '_chart'
            widgetCode.unshift.apply(
              widgetCode,
              drawWidget(chartConfig, tempalteEngine)
            )
          }
          widgetCode.push.apply(
            widgetCode,
            drawTable(elem, tempalteEngine, allConfig)
          )
        } else if (elem.type === 'label') {
          widgetCode.push(
            '<section class="col col-xs-' +
              elem.formXsSize +
              ' col-sm-' +
              elem.formSmSize +
              ' col-md-' +
              elem.formMdSize +
              ' col-lg-' +
              elem.formLgSize +
              '">\n'
          )
          widgetCode.push.apply(widgetCode, drawLabel(elem))
          widgetCode.push('</section>\n')
        }
      })
    }
    widgetCode.push('</div>\n</div>\n</div>\n')
    if (!config.modalWidget) {
      widgetCode.push('</article>\n<!-- WIDGET END -->\n')
    }
    return widgetCode
  }

  function drawModal(config, tempalteEngine, widgetConfig, allConfig) {
    // 畫modal
    var modalCode = []

    modalCode.push(
      '<div class="modal fade" id="' +
        config.modalId +
        '" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">\n'
    )

    // modal的框
    modalCode.push('<div class="modal-dialog')
    if (config.modalSize !== 'md') {
      modalCode.push(' modal-' + config.modalSize)
    }
    modalCode.push('">\n<div class="modal-content">\n')

    // modal header
    modalCode.push('<div class="modal-header">\n')
    modalCode.push(
      '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>\n'
    )
    modalCode.push(
      '<h4 class="modal-title">' + config.modalTitle + '</h4>\n</div>\n'
    )

    // modal body
    modalCode.push('<div class="modal-body">\n')
    if (config.modalForm) {
      tempalteEngine.toHtmlgogo.push(
        "servkit.validateForm($('#" +
          config.modalFormId +
          "'), $('#" +
          config.modalButtonId +
          "'))\n"
      )
      setFormBinding(allConfig, 'modal', config, tempalteEngine)
      modalCode.push(
        '<div class="row">\n<form class="smart-form" id="' +
          config.modalFormId +
          '" novalidate="novalidate">\n'
      )
      _.each(config.component, function (elem) {
        modalCode.push(
          '<section class="col col-xs-' +
            elem.formXsSize +
            ' col-sm-' +
            elem.formSmSize +
            ' col-md-' +
            elem.formMdSize +
            ' col-lg-' +
            elem.formLgSize +
            '">\n'
        )
        if (elem.type === 'text') {
          modalCode.push.apply(modalCode, drawText(elem, tempalteEngine))
        } else if (elem.type === 'date') {
          modalCode.push.apply(modalCode, drawDate(elem, tempalteEngine))
        } else if (elem.type === 'startEndDate') {
          modalCode.push.apply(
            modalCode,
            drawStartEndDate(elem, tempalteEngine)
          )
        } else if (elem.type === 'select') {
          modalCode.push.apply(modalCode, drawSelect(elem, tempalteEngine))
        } else if (elem.type === 'select2') {
          modalCode.push.apply(modalCode, drawSelect2(elem, tempalteEngine))
        } else if (elem.type === 'multipleSelect') {
          modalCode.push.apply(
            modalCode,
            drawMultipleSelect(elem, tempalteEngine)
          )
        } else if (elem.type === 'radio') {
          modalCode.push.apply(modalCode, drawRadio(elem, tempalteEngine))
        } else if (elem.type === 'checkbox') {
          modalCode.push.apply(modalCode, drawCheckbox(elem, tempalteEngine))
        } else if (elem.type === 'label') {
          modalCode.push.apply(modalCode, drawLabel(elem))
        } else if (elem.type === 'hr') {
          modalCode.push.apply(modalCode, drawHr(elem))
        }
        modalCode.push('</section>\n')
      })
      modalCode.push('</form>\n</div>\n</div>\n<div class="modal-footer">\n')
      modalCode.push(
        '<button id="' +
          config.modalButtonId +
          '" type="button" class="btn btn-primary">' +
          config.modalButtonText +
          '</button>\n'
      )
    } else {
      _.each(config.component, function (elem) {
        if (elem.type === 'CRUDTable' || elem.type === 'reportTable') {
          var data = widgetConfig[elem.element + '_widget']
          data.component = []
          data.component.push(elem)
          data.modalWidget = true
          modalCode.push.apply(modalCode, drawWidget(data, tempalteEngine))
          data.component = null
          data.modalWidget = null
          delete data.component
          delete data.modalWidget
        } else if (elem.type === 'label') {
          modalCode.push(
            '<section class="col col-xs-' +
              elem.formXsSize +
              ' col-sm-' +
              elem.formSmSize +
              ' col-md-' +
              elem.formMdSize +
              ' col-lg-' +
              elem.formLgSize +
              '">\n'
          )
          modalCode.push.apply(modalCode, drawLabel(elem))
          modalCode.push('</section>\n')
        }
      })
    }
    modalCode.push('</div>\n</div>\n</div>\n</div>\n')
    return modalCode
  }

  function drawText(config) {
    // 畫text
    var textCode = []
    textCode.push('<label class="label')
    if (config.formRequired) {
      textCode.push(' st-required')
    }
    textCode.push('">' + config.formTitle + '</label>\n')
    textCode.push('<label class="input">\n')
    textCode.push('<input type="text" ')

    if (config.formId) {
      textCode.push('id="' + config.formId + '" ')
    } else {
      if (!config.formName) {
        textCode.push('name="' + config.element + '" ')
      }
    }

    if (config.formName) {
      textCode.push('name="' + config.formName + '" ')
    }
    if (config.formRequired) {
      textCode.push('data-rule-required="true" ')
    }
    if (config.formValidate !== '') {
      if (
        config.formValidate === 'range' ||
        config.formValidate === 'lengthrange'
      ) {
        if (config.formValidateMax === '') {
          textCode.push(
            'data-rule-min' +
              config.formValidate.replace('range', '') +
              '="' +
              config.formValidateMin +
              '" '
          )
          if (config.formValidateInfo !== '') {
            textCode.push(
              'data-msg-min' +
                config.formValidate.replace('range', '') +
                '="' +
                config.formValidateInfo +
                '" '
            )
          }
        } else if (config.formValidateMin === '') {
          textCode.push(
            'data-rule-max' +
              config.formValidate.replace('range', '') +
              '="' +
              config.formValidateMax +
              '" '
          )
          if (config.formValidateInfo !== '') {
            textCode.push(
              'data-msg-max' +
                config.formValidate.replace('range', '') +
                '="' +
                config.formValidateInfo +
                '" '
            )
          }
        } else {
          textCode.push(
            'data-rule-range' +
              config.formValidate.replace('range', '') +
              '="' +
              config.formValidateMin +
              ',' +
              config.formValidateMax +
              '" '
          )
          if (config.formValidateInfo !== '') {
            textCode.push(
              'data-msg-range' +
                config.formValidate.replace('range', '') +
                '="' +
                config.formValidateInfo +
                '" '
            )
          }
        }
      } else {
        textCode.push('data-rule-' + config.formValidate + '="true" ')
        if (config.formValidateInfo !== '') {
          textCode.push(
            'data-msg-' +
              config.formValidate +
              '="' +
              config.formValidateInfo +
              '" '
          )
        }
      }
    }
    if (config.formReg1More) {
      textCode.push('data-rule-digits="true"')
      textCode.push('data-rule-min="1"')
      if (config.formValidateInfo !== '') {
        textCode.push('data-msg-digits="' + config.formValidateInfo + '"')
        textCode.push('data-msg-min="' + config.formValidateInfo + '"')
      }
    }
    var regStr = ''
    if (config.formRegSpecialChar) {
      regStr +=
        ',<>\v\\s\\u0020\\u0085\\u00A0\\u1680\\u180E\\u2000-\\u200A\\u2028\\u2029\\u202F\\u205F\\u2060\\u3000\\ufeff\\ufffe\\u0022\\u0027'
    }
    if (config.formRegEngNum) {
      regStr += 'a-zA-Z0-9'
    }
    if (config.formRegChinese) {
      regStr += '\\u4E00-\\u9FA5\\u3105-\\u3129\\u02CA\\u02C7\\u02CB\\u02D9'
    }
    if (config.formRegDirection === 'positive') {
      regStr = '[' + regStr + ']'
    } else if (config.formRegDirection === 'negative') {
      regStr = '^((?![' + regStr + ']).)$'
    }
    if (
      config.formRegSpecialChar ||
      config.formRegEngNum ||
      config.formRegChinese
    ) {
      textCode.push('data-rule-pattern="' + regStr + '"')
      if (config.formValidateInfo !== '') {
        textCode.push('data-msg-pattern="' + config.formValidateInfo + '"')
      }
    }
    textCode.push('class="form-control">\n</label>\n')
    return textCode
  }

  function drawDate(config, tempalteEngine) {
    // 畫date
    var dateCode = []
    dateCode.push('<label class="label')
    if (config.formRequired) {
      dateCode.push(' st-required')
    }
    dateCode.push('">' + config.formTitle + '</label>\n')
    dateCode.push('<label class="input">')
    dateCode.push('<i class="icon-append fa fa-calendar"></i>\n')
    tempalteEngine.toHtmlgogo.push('var datepickerConfig = {\n')
    tempalteEngine.toHtmlgogo.push("  dateFormat: 'yy/mm/dd',\n")
    tempalteEngine.toHtmlgogo.push(
      '  prevText: \'<i class="fa fa-chevron-left"></i>\',\n'
    )
    tempalteEngine.toHtmlgogo.push(
      '  nextText: \'<i class="fa fa-chevron-right"></i>\''
    )
    if (config.formDateConfig === 'formDateAfter') {
      tempalteEngine.toHtmlgogo.push(',\n  minDate: new Date()')
    } else if (config.formDateConfig === 'formDateBefore') {
      tempalteEngine.toHtmlgogo.push(',\n  maxDate: new Date()')
    }
    tempalteEngine.toHtmlgogo.push('\n}\n')
    dateCode.push('<input type="text" ')

    if (config.formId) {
      dateCode.push('id="' + config.formId + '" ')
      tempalteEngine.toHtmlgogo.push(
        "$('#" +
          config.formId +
          "').datepicker(datepickerConfig).val(moment(new Date()).format('YYYY/MM/DD'))\n"
      )
    } else {
      if (config.formName) {
        tempalteEngine.toHtmlgogo.push(
          "$('[name=" +
            config.formName +
            "]').datepicker(datepickerConfig).val(moment(new Date()).format('YYYY/MM/DD'))\n"
        )
      } else {
        dateCode.push('name="' + config.element + '" ')
        tempalteEngine.toHtmlgogo.push(
          "$('[name=" +
            config.element +
            "]').datepicker(datepickerConfig).val(moment(new Date()).format('YYYY/MM/DD'))\n"
        )
      }
    }
    if (config.formName) {
      dateCode.push('name="' + config.formName + '" ')
    }

    if (config.formRequired) {
      dateCode.push('data-rule-required="true" ')
    }
    dateCode.push('data-rule-date="true" ')
    dateCode.push('class="form-control">\n</label>\n')
    return dateCode
  }

  function drawStartEndDate(config, tempalteEngine) {
    // 畫有開始和結束的date
    var startEndDateCode = []
    if (config.formSameLine) {
      startEndDateCode.push('<div class="col col-6">\n')
    }
    startEndDateCode.push('<label class="label')
    if (config.formRequired) {
      startEndDateCode.push(' st-required')
    }
    startEndDateCode.push('">' + config.formStartTitle + '</label>\n')
    startEndDateCode.push('<label class="input">')
    startEndDateCode.push('<i class="icon-append fa fa-calendar"></i>\n')
    startEndDateCode.push('<input type="text" ')

    if (config.formStartId) {
      startEndDateCode.push('id="' + config.formStartId + '" ')
      tempalteEngine.toHtmlgogo.push(
        "servkit.initDatePicker($('#" + config.formStartId + "'), "
      )
    } else {
      if (config.formStartName) {
        tempalteEngine.toHtmlgogo.push(
          "servkit.initDatePicker($('[name=" + config.formStartName + "]'), "
        )
      } else {
        startEndDateCode.push('name="' + config.element + 'start" ')
        tempalteEngine.toHtmlgogo.push(
          "servkit.initDatePicker($('[name=" + config.element + "start]'), "
        )
      }
    }
    if (config.formStartName) {
      startEndDateCode.push('name="' + config.formStartName + '" ')
    }

    if (config.formRequired) {
      startEndDateCode.push('data-rule-required="true" ')
    }
    startEndDateCode.push('data-rule-date="true" ')
    startEndDateCode.push('class="form-control">\n</label>\n')
    if (config.formSameLine) {
      startEndDateCode.push('</div>\n<div class="col col-6">\n')
    }
    startEndDateCode.push('<label class="label')
    if (config.formRequired) {
      startEndDateCode.push(' st-required')
    }
    startEndDateCode.push('">' + config.formEndTitle + '</label>\n')
    startEndDateCode.push('<label class="input">')
    startEndDateCode.push('<i class="icon-append fa fa-calendar"></i>\n')
    startEndDateCode.push('<input type="text" ')
    if (config.formEndId) {
      startEndDateCode.push('id="' + config.formEndId + '" ')
      tempalteEngine.toHtmlgogo.push(
        "$('#" + config.formEndId + "'), " + config.formBothToday + ', '
      )
    } else {
      if (config.formEndName) {
        tempalteEngine.toHtmlgogo.push(
          "$('[name=" +
            config.formEndName +
            "]'), " +
            config.formBothToday +
            ', '
        )
      } else {
        startEndDateCode.push('name="' + config.element + 'end" ')
        tempalteEngine.toHtmlgogo.push(
          "$('[name=" +
            config.element +
            "end]'), " +
            config.formBothToday +
            ', '
        )
      }
    }
    if (config.formEndName) {
      startEndDateCode.push('name="' + config.formEndName + '" ')
    }

    if (config.formRequired) {
      startEndDateCode.push('data-rule-required="true" ')
    }
    startEndDateCode.push('data-rule-date="true" ')
    startEndDateCode.push('class="form-control">\n</label>\n')
    if (config.formSameLine) {
      startEndDateCode.push('</div>\n')
    }
    if (config.formBothLimit) {
      tempalteEngine.toHtmlgogo.push(config.formBothLimitDays + ')\n')
    } else {
      tempalteEngine.toHtmlgogo.push('false)\n')
    }
    return startEndDateCode
  }

  function drawSelect(config, tempalteEngine) {
    // 畫單選
    var selectCode = []
    selectCode.push('<label class="label')
    if (config.formRequired) {
      selectCode.push(' st-required')
    }
    selectCode.push('">' + config.formTitle + '</label>\n')
    selectCode.push('<label class="input">\n')
    selectCode.push('<select class="form-control" ')

    if (config.formId) {
      selectCode.push('id="' + config.formId + '" ')
    } else {
      if (!config.formName) {
        selectCode.push('name="' + config.element + '" ')
      }
    }
    if (config.formName) {
      selectCode.push('name="' + config.formName + '" ')
    }

    if (config.formRequired) {
      selectCode.push('data-rule-required="true" ')
    }
    selectCode.push('></select>\n')
    selectCode.push('</label>\n')
    selectDataSetting(config, 'form', tempalteEngine)
    return selectCode
  }

  function drawSelect2(config, tempalteEngine) {
    // 畫select2
    var select2Code = []
    select2Code.push('<label class="label')
    if (config.formRequired) {
      select2Code.push(' st-required')
    }
    select2Code.push('">' + config.formTitle + '</label>\n')
    select2Code.push('<label class="input">\n')
    select2Code.push('<select class="select2 full-width" ')

    if (config.formId) {
      select2Code.push('id="' + config.formId + '" ')
      tempalteEngine.toHtmlgogo.push("$('#" + config.formId + "').select2()\n")
    } else {
      if (config.formName) {
        tempalteEngine.toHtmlgogo.push(
          "$('[name=" + config.formName + "]').select2()\n"
        )
      } else {
        select2Code.push('name="' + config.element + '" ')
        tempalteEngine.toHtmlgogo.push(
          "$('[name=" + config.element + "]').select2()\n"
        )
      }
    }
    if (config.formName) {
      select2Code.push('name="' + config.formName + '" ')
    }

    if (config.formRequired) {
      select2Code.push('data-rule-required="true" ')
    }
    select2Code.push('></select>\n')
    select2Code.push('</label>\n')
    if (!tempalteEngine.select2Exist) {
      if (tempalteEngine.toHtmldependencies.length) {
        tempalteEngine.toHtmldependencies.push(',\n')
      }
      tempalteEngine.toHtmldependencies.push(
        "[\n'/js/plugin/select2/select2.min.js'\n]\n"
      )
      tempalteEngine.select2Exist = true
    }
    selectDataSetting(config, 'form', tempalteEngine)
    return select2Code
  }

  function drawMultipleSelect(config, tempalteEngine) {
    // 畫多選
    var multipleSelectCode = []
    multipleSelectCode.push('<label class="label')
    if (config.formRequired) {
      multipleSelectCode.push(' st-required')
    }
    multipleSelectCode.push('">' + config.formTitle + '</label>\n')
    multipleSelectCode.push('<label class="select select-multiple">\n')
    multipleSelectCode.push('<select multiple="multiple" class="form-control" ')

    if (config.formId) {
      multipleSelectCode.push('id="' + config.formId + '" ')
    } else {
      if (!config.formName) {
        multipleSelectCode.push('name="' + config.element + '" ')
      }
    }
    if (config.formName) {
      multipleSelectCode.push('name="' + config.formName + '" ')
    }

    if (config.formRequired) {
      multipleSelectCode.push('data-rule-required="true" ')
    }
    multipleSelectCode.push('></select>\n')
    multipleSelectCode.push('</label>\n')
    selectDataSetting(config, 'form', tempalteEngine)
    return multipleSelectCode
  }

  function drawRadio(config) {
    // 畫radio
    var radioCode = []
    radioCode.push('<label class="label">' + config.formTitle + '</label>\n')
    if (config.formSameLine) {
      radioCode.push('<div class="inline-group"')
    } else {
      radioCode.push('<div class="col"')
    }
    radioCode.push('>\n')

    var defaultCheckList = []
    _.each(config.formCheckBoxRadio, function (num) {
      radioCode.push('<label class="radio">\n')
      radioCode.push(
        '<input type="radio" value="' + num.formCheckBoxRadioValue + '" '
      )
      radioCode.push('name="' + config.formName + '"')
      if (num.defaultCheck) {
        radioCode.push(' checked')
        defaultCheckList.push("'" + num.formCheckBoxRadioValue + "'")
      }
      radioCode.push('><i></i>\n')
      radioCode.push('<p>' + num.formCheckBoxRadioText + '</p>\n</label>\n')
    })
    // if (tempalteEngine.toHtmlutil.length) {
    //   tempalteEngine.toHtmlutil.push(',\n')
    // }
    // tempalteEngine.toHtmlutil.push(config.formName + 'defaultCheck: [' + defaultCheckList.toString() + ']')
    radioCode.push('</div>\n')
    return radioCode
  }

  function drawCheckbox(config) {
    // 畫checkbox
    var checkboxCode = []
    checkboxCode.push('<label class="label">' + config.formTitle + '</label>\n')
    if (config.formSameLine) {
      checkboxCode.push('<div class="inline-group"')
    } else {
      checkboxCode.push('<div class="col"')
    }
    checkboxCode.push('>\n')

    var defaultCheckList = []
    _.each(config.formCheckBoxRadio, function (num) {
      checkboxCode.push('<label class="checkbox">\n')
      checkboxCode.push(
        '<input type="checkbox" value="' + num.formCheckBoxRadioValue + '" '
      )
      if (config.formName) {
        checkboxCode.push('name="' + config.formName + '" ')
      }
      if (num.defaultCheck) {
        checkboxCode.push(' checked')
        defaultCheckList.push("'" + num.formCheckBoxRadioValue + "'")
      }
      checkboxCode.push('><i></i>\n')
      checkboxCode.push('<p>' + num.formCheckBoxRadioText + '</p>\n</label>\n')
    })
    // if (tempalteEngine.toHtmlutil.length) {
    //   tempalteEngine.toHtmlutil.push(',\n')
    // }
    // tempalteEngine.toHtmlutil.push(config.formName + 'defaultCheck: [' + defaultCheckList.toString() + ']')
    checkboxCode.push('</div>\n')
    return checkboxCode
  }

  function selectDataSetting(config, source, tempalteEngine) {
    // select元件的選項
    if (config[source + 'SelectBy'] === 'DB') {
      var tableExist = _.find(tempalteEngine.dbTableList, function (num) {
        return num === config[source + 'SelectDBTable']
      })
      if (!tableExist) {
        tempalteEngine.toHtmlpreCondition.push(
          'get_' +
            config[source + 'SelectDBTable'] +
            '_list: function (done) {\n'
        )
        tempalteEngine.toHtmlpreCondition.push('  servkit.ajax({\n')
        tempalteEngine.toHtmlpreCondition.push("    url: 'api/getdata/db',\n")
        tempalteEngine.toHtmlpreCondition.push("    type: 'POST',\n")
        tempalteEngine.toHtmlpreCondition.push(
          "    contentType: 'application/json',\n"
        )
        tempalteEngine.toHtmlpreCondition.push('    data: JSON.stringify({\n')
        tempalteEngine.toHtmlpreCondition.push(
          "      table: '" + config[source + 'SelectDBTable'] + "',\n"
        )
        tempalteEngine.toHtmlpreCondition.push(
          "      columns: ['" +
            config[source + 'SelectDBColumnText'] +
            "', '" +
            config[source + 'SelectDBColumnValue']
        )
        if (config.formSelectBinding) {
          tempalteEngine.toHtmlpreCondition.push(
            "', '" + config.formSelectBindingColumn
          )
        }
        tempalteEngine.toHtmlpreCondition.push("']")
        if (config[source + 'SelectDBWhere']) {
          tempalteEngine.toHtmlpreCondition.push(
            ',\n      whereClause: "' + config[source + 'SelectDBWhere'] + '"'
          )
        }
        tempalteEngine.toHtmlpreCondition.push('\n    })\n')
        tempalteEngine.toHtmlpreCondition.push('  }, {\n')
        tempalteEngine.toHtmlpreCondition.push(
          '    success: function (data) {\n'
        )
        if (config.formSelectBinding) {
          tempalteEngine.toHtmlpreCondition.push('      done(data)\n')
        } else {
          tempalteEngine.toHtmlpreCondition.push('      var dataMap = {}\n')
          tempalteEngine.toHtmlpreCondition.push(
            '      _.each(data, function (elem, key) {\n'
          )
          tempalteEngine.toHtmlpreCondition.push(
            '        dataMap[elem.' +
              config[source + 'SelectDBColumnValue'] +
              '] = elem.' +
              config[source + 'SelectDBColumnText'] +
              '\n'
          )
          tempalteEngine.toHtmlpreCondition.push('      })\n')
          tempalteEngine.toHtmlpreCondition.push('      done(dataMap)\n')
        }
        tempalteEngine.toHtmlpreCondition.push('    }\n')
        tempalteEngine.toHtmlpreCondition.push('  })\n')
        tempalteEngine.toHtmlpreCondition.push('},\n')

        if (config.bindingSelectColumn) {
          console.log(config)
          var elementName = (
            config[source + 'Id'] ||
            config.formName ||
            config.element
          ).replace('-', '')
          tempalteEngine.toHtmlgogo.push(
            'context.get' + elementName + 'Data()\n'
          )
          if (tempalteEngine.toHtmlutil.length) {
            tempalteEngine.toHtmlutil.push(',')
          }
          tempalteEngine.toHtmlutil.push('\n')
          tempalteEngine.toHtmlutil.push(
            '  get' + elementName + 'Data: function () {\n'
          )
          tempalteEngine.toHtmlutil.push('    var ctx = this\n')
          tempalteEngine.toHtmlutil.push(
            '    ctx.' + elementName + 'Data = {}\n'
          )
          tempalteEngine.toHtmlutil.push(
            '    ctx.' + elementName + 'Data._ALL = {}\n'
          )
          tempalteEngine.toHtmlutil.push(
            '    _.each(ctx.preCon.get_' +
              config.bindingTable +
              '_list, (value) => {\n'
          )
          tempalteEngine.toHtmlutil.push(
            '      if (ctx.' +
              elementName +
              'Data[value.' +
              config.bindingSelectColumn +
              '] === undefined) {\n'
          )
          tempalteEngine.toHtmlutil.push(
            '        ctx.' +
              elementName +
              'Data[value.' +
              config.bindingSelectColumn +
              '] = {}\n'
          )
          tempalteEngine.toHtmlutil.push('      }\n')
          tempalteEngine.toHtmlutil.push(
            '      ctx.' +
              elementName +
              'Data[value.' +
              config.bindingSelectColumn +
              '][value.' +
              config.bindingColumn +
              '] = '
          )
          tempalteEngine.toHtmlutil.push(
            'ctx.preCon.get_' +
              config[source + 'SelectDBTable'] +
              '_list[value.' +
              config.bindingColumn +
              ']\n'
          )
          tempalteEngine.toHtmlutil.push(
            '      ctx.' +
              elementName +
              'Data._ALL[value.' +
              config.bindingColumn +
              '] = '
          )
          tempalteEngine.toHtmlutil.push(
            'ctx.preCon.get_' +
              config[source + 'SelectDBTable'] +
              '_list[value.' +
              config.bindingColumn +
              ']\n'
          )
          tempalteEngine.toHtmlutil.push('    })\n')
          tempalteEngine.toHtmlutil.push('  }')
          tempalteEngine.toHtmlgogo.push(config.bindingSelectName)
          tempalteEngine.toHtmlgogo.push(".on('change', function() {\n")
          if (config.type === 'multipleSelect') {
            tempalteEngine.toHtmlgogo.push('  var selectData = {}\n')
            tempalteEngine.toHtmlgogo.push(
              '  _.each($(this).val(), (ele) => {\n'
            )
            tempalteEngine.toHtmlgogo.push(
              '    _.each(context.' +
                elementName +
                'Data [ele], (value, key) => {\n'
            )
            tempalteEngine.toHtmlgogo.push('      selectData[key] = value\n')
            tempalteEngine.toHtmlgogo.push('    })\n')
            tempalteEngine.toHtmlgogo.push('  })\n')
            tempalteEngine.toHtmlgogo.push(
              '  servkit.initSelectWithList(selectData, '
            )
          } else {
            tempalteEngine.toHtmlgogo.push(
              '  servkit.initSelectWithList(context.' +
                elementName +
                'Data[this.value], '
            )
          }
          if (config[source + 'Id']) {
            tempalteEngine.toHtmlgogo.push(
              "$('#" + config[source + 'Id'] + "')"
            )
          } else {
            if (config.formName) {
              tempalteEngine.toHtmlgogo.push(
                "$('[name=" + config.formName + "]')"
              )
            } else {
              tempalteEngine.toHtmlgogo.push(
                "$('[name=" + config.element + "]')"
              )
            }
          }
          if (config.formDefaultAll) {
            tempalteEngine.toHtmlgogo.push(', true)\n')
          } else {
            tempalteEngine.toHtmlgogo.push(')\n')
          }
          tempalteEngine.toHtmlgogo.push('})\n')
        } else {
          if (config.formSelectBinding) {
            tempalteEngine.toHtmlgogo.push(
              'var ' + config[source + 'SelectDBTable'] + 'Data = {}\n'
            )
            tempalteEngine.toHtmlgogo.push(
              '_.each(context.preCon.get_' +
                config[source + 'SelectDBTable'] +
                '_list, (ele) => {\n'
            )
            tempalteEngine.toHtmlgogo.push(
              '  ' +
                config[source + 'SelectDBTable'] +
                'Data[ele.' +
                config[source + 'SelectDBColumnValue'] +
                '] = ele.' +
                config[source + 'SelectDBColumnText'] +
                '\n'
            )
            tempalteEngine.toHtmlgogo.push('})\n')
            tempalteEngine.toHtmlgogo.push(
              'servkit.initSelectWithList(' +
                config[source + 'SelectDBTable'] +
                'Data, '
            )
          } else {
            tempalteEngine.toHtmlgogo.push(
              'servkit.initSelectWithList(context.preCon.get_' +
                config[source + 'SelectDBTable'] +
                '_list, '
            )
          }
          if (config[source + 'Id']) {
            tempalteEngine.toHtmlgogo.push(
              "$('#" + config[source + 'Id'] + "')"
            )
          } else {
            if (config.formName) {
              tempalteEngine.toHtmlgogo.push(
                "$('[name=" + config.formName + "]')"
              )
            } else {
              tempalteEngine.toHtmlgogo.push(
                "$('[name=" + config.element + "]')"
              )
            }
          }
          if (config.formDefaultAll) {
            tempalteEngine.toHtmlgogo.push(', true)\n')
          } else {
            tempalteEngine.toHtmlgogo.push(')\n')
          }
        }
        tempalteEngine.dbTableList.push(config[source + 'SelectDBTable'])
      }
    } else {
      var haveEmptyValueArray = _.filter(
        config[source + 'SelectElement'],
        function (num) {
          return num[source + 'SelectValue'] === ''
        }
      )
      var isFormDataValueNotAllEmpty =
        haveEmptyValueArray.length !==
          Object.keys(config[source + 'SelectElement']).length &&
        haveEmptyValueArray.length !== 0
      if (isFormDataValueNotAllEmpty) {
        var selectData = {}

        _.each(config[source + 'SelectElement'], function (num, key) {
          selectData[key] = {
            value: num[source + 'SelectValue'],
            text: num[source + 'SelectText'],
          }
        })
        tempalteEngine.toHtmlgogo.push(
          '_.each(' + JSON.stringify(selectData) + ', function (num, key) {\n'
        )
        if (config.formId) {
          tempalteEngine.toHtmlgogo.push("$('#" + config.formId + "')")
        } else {
          if (config.formName) {
            tempalteEngine.toHtmlgogo.push(
              "$('[name=" + config.formName + "]')"
            )
          } else {
            tempalteEngine.toHtmlgogo.push("$('[name=" + config.element + "]')")
          }
        }
        tempalteEngine.toHtmlgogo.push(
          ".append('<option style=\"padding:3px 0 3px 3px;\" value = \"' + key.value + '\">' + num.text + '</option>')\n"
        )
        tempalteEngine.toHtmlgogo.push('})\n')
      } else {
        var dataMap = {}
        var dataList = []
        _.each(config[source + 'SelectElement'], function (num) {
          if (num[source + 'SelectValue']) {
            dataMap[num[source + 'SelectValue']] = num[source + 'SelectText']
          } else {
            dataList.push(num[source + 'SelectText'])
          }
        })
        if (dataList.length) {
          tempalteEngine.toHtmlgogo.push(
            'servkit.initSelectWithList(' + JSON.stringify(dataList) + ', '
          )
          if (config.formId) {
            tempalteEngine.toHtmlgogo.push("$('#" + config.formId + "')")
          } else {
            if (config.formName) {
              tempalteEngine.toHtmlgogo.push(
                "$('[name=" + config.formName + "]')"
              )
            } else {
              tempalteEngine.toHtmlgogo.push(
                "$('[name=" + config.element + "]')"
              )
            }
          }
          if (config.formDefaultAll) {
            tempalteEngine.toHtmlgogo.push(', true')
          }
          tempalteEngine.toHtmlgogo.push(')\n')
        } else {
          tempalteEngine.toHtmlgogo.push(
            'servkit.initSelectWithList(' + JSON.stringify(dataMap) + ', '
          )
          if (config.formId) {
            tempalteEngine.toHtmlgogo.push("$('#" + config.formId + "')")
          } else {
            if (config.formName) {
              tempalteEngine.toHtmlgogo.push(
                "$('[name=" + config.formName + "]')"
              )
            } else {
              tempalteEngine.toHtmlgogo.push(
                "$('[name=" + config.element + "]')"
              )
            }
          }
          if (config.formDefaultAll) {
            tempalteEngine.toHtmlgogo.push(', true')
          }
          tempalteEngine.toHtmlgogo.push(')\n')
        }
      }
    }
  }

  function getTableTextByDB(tempalteEngine) {
    _.each(tempalteEngine.tableColByDB, (value) => {
      tempalteEngine.toHtmlpreCondition.push(
        'get_' + value.text + '_by_' + value.table
      )
      if (value.where) {
        tempalteEngine.toHtmlpreCondition.push('_cond')
      }
      tempalteEngine.toHtmlpreCondition.push(': function (done) {\n')
      tempalteEngine.toHtmlpreCondition.push('  servkit.ajax({\n')
      tempalteEngine.toHtmlpreCondition.push("    url: 'api/getdata/db',\n")
      tempalteEngine.toHtmlpreCondition.push("    type: 'POST',\n")
      tempalteEngine.toHtmlpreCondition.push(
        "    contentType: 'application/json',\n"
      )
      tempalteEngine.toHtmlpreCondition.push('    data: JSON.stringify({\n')
      tempalteEngine.toHtmlpreCondition.push(
        "      table: '" + value.table + "',\n"
      )
      tempalteEngine.toHtmlpreCondition.push(
        "      columns: ['" + value.value + "', '" + value.text + "']"
      )
      if (value.where) {
        tempalteEngine.toHtmlpreCondition.push(
          ',\n      whereClause: "' + value.where + '"'
        )
      }
      tempalteEngine.toHtmlpreCondition.push('\n    })\n')
      tempalteEngine.toHtmlpreCondition.push('  }, {\n')
      tempalteEngine.toHtmlpreCondition.push('    success: function (data) {\n')
      tempalteEngine.toHtmlpreCondition.push('      var dataMap = {}\n')
      tempalteEngine.toHtmlpreCondition.push(
        '      _.each(data, function (elem, key) {\n'
      )
      tempalteEngine.toHtmlpreCondition.push(
        '        dataMap[elem.' + value.value + '] = elem.' + value.text + '\n'
      )
      tempalteEngine.toHtmlpreCondition.push('      })\n')
      tempalteEngine.toHtmlpreCondition.push('      done(dataMap)\n')
      tempalteEngine.toHtmlpreCondition.push('    }\n')
      tempalteEngine.toHtmlpreCondition.push('  })\n')
      tempalteEngine.toHtmlpreCondition.push('},\n')
    })
  }

  function drawLabel(config) {
    // 畫label
    var labelCode = []
    labelCode.push('<label id="' + config.formId + '"')
    labelCode.push('>\n')
    labelCode.push(
      '<span>' +
        config.formTitle +
        '</span>: <span>' +
        config.formText +
        '</span>\n'
    )
    labelCode.push('</label>\n')
    return labelCode
  }

  function drawHr(config) {
    // 畫分隔線
    var hrCode = []
    hrCode.push('<hr style="width: 98%;margin: 6px auto;')
    if (config.formOpacity === '0') {
      hrCode.push('opacity: 0;')
    }
    hrCode.push('">\n')
    return hrCode
  }

  function drawTable(config, tempalteEngine, allConfig) {
    // 畫表格
    var tableCode = []

    // table html
    tableCode.push(
      '<table class="table table-striped table-bordered table-hover" width="100%"'
    )
    if (config.type === 'CRUDTable') {
      if (config.tableDataFromKey) {
        tableCode.push(' stk-entity-pk="' + config.tableDataFromKey + '"')
      } else {
        tableCode.push(' stk-entity-pk="pks"')
      }
    }
    tableCode.push(' id="' + config.tableId + '"')
    tableCode.push('>\n')
    tableCode.push('<thead>\n<tr>\n')
    _.each(config.column, function (elem, key) {
      tableCode.push(
        '<th class="hasinput" style="width:' + elem.tableColumnWidget + '%">\n'
      )
      if (elem.tableColumnSearch === 'input') {
        tableCode.push('<input type="text" class="form-control" />\n')
      } else if (elem.tableColumnSearch === 'select') {
        tableCode.push('<select class="form-control"></select>\n')
      }
      tableCode.push('</th>\n')
    })
    tableCode.push('</tr>\n<tr>\n')
    _.each(config.column, function (elem) {
      tableCode.push('<th>' + elem.tableColumnTitleName + '</th>\n')
    })
    tableCode.push('</tr>\n</thead>\n')

    var centerColumn = []
    var rightColumn = []
    var bindingModals = []
    // column 對齊, 存modal陣列
    _.each(config.column, function (elem, key) {
      var colNum = parseInt(key.replace('column', ''))
      if (config.type === 'reportTable' && !config.column.checkbox) {
        colNum = colNum - 1
      }
      if (elem.tableColumnAlign === 'center') {
        centerColumn.push(colNum)
      } else if (elem.tableColumnAlign === 'right') {
        rightColumn.push(colNum)
      }
      if (
        elem.tableColumnBtnBinding === 'Modal' &&
        elem.tableColumnBtnBindingModal
      ) {
        bindingModals.push(elem.tableColumnBtnBindingModal)
      }
    })

    var cutomerBtn = []
    // 客製化button綁定, 存modal陣列
    _.each(config.tableCustomerBtn, function (elem) {
      var html = []
      html.push('<button class="btn')
      if (elem.tableBtnType) {
        html.push(' btn-' + elem.tableBtnType)
      }
      html.push(' ' + elem.tableBtnBindingModal + 'Btn"')
      if (elem.tableBtnTitle) {
        html.push(' title="' + elem.tableBtnTitle + '"')
      }
      if (elem.tableBtnBinding === 'Modal' && elem.tableBtnBindingModal) {
        html.push(
          ' data-toggle="modal" data-target="#' +
            elem.tableBtnBindingModal +
            '"'
        )
        bindingModals.push(elem.tableBtnBindingModal)
      }
      html.push('>')
      html.push(elem.tableBtnText)
      html.push('</button>')
      cutomerBtn.push(html.join(''))
    })

    if (config.type === 'CRUDTable') {
      // CRUD table
      if (!config.tableCRUDEditModal) {
        var switchData = null
        // 畫 table tbody
        tableCode.push('<tbody>\n')
        tableCode.push('<tr stk-input-template hidden="hidden">\n')
        _.each(config.column, function (elem, key) {
          tableCode.push('<td>\n')
          var editType = ''
          if (elem.tableColumnInputDisabled === 'edit') {
            editType = ' stk-pk'
          } else if (elem.tableColumnInputDisabled === 'always') {
            editType = ' disabled'
          }
          if (elem.tableColumnInputType === 'input') {
            tableCode.push(
              '<input name="' +
                elem.tableColumnName +
                '" type="text" class="form-control" placeholder="' +
                elem.tableColumnTitleName +
                '"' +
                editType +
                ' />\n'
            )
          } else if (
            elem.tableColumnInputType === 'select' ||
            elem.tableColumnInputType === 'multipleSelect'
          ) {
            tableCode.push(
              '<select name="' + elem.tableColumnName + '" class="form-control"'
            )
            if (elem.tableColumnInputType === 'multipleSelect') {
              tableCode.push(' multiple="multiple"')
            }
            if (elem.tableColumnInputSelectBy === 'DB') {
              tableCode.push(
                ' stk-getdata-source="db" stk-getdata-name="' +
                  elem.tableColumnInputSelectDBTable +
                  '"'
              )
              tableCode.push(
                ' stk-getdata-column-text="' +
                  elem.tableColumnInputSelectDBColumnText +
                  '" stk-getdata-column-value="' +
                  elem.tableColumnInputSelectDBColumnValue +
                  '"' +
                  editType +
                  '>'
              )
            } else if (elem.tableColumnInputSelectBy === 'user') {
              tableCode.push(editType + '>\n')
              _.each(elem.tableColumnInputSelectElement, function (num) {
                tableCode.push(
                  '<option style="padding:3px 0 3px 3px;" value="' +
                    num.tableColumnInputSelectText +
                    '">' +
                    num.tableColumnInputSelectText +
                    '</option>\n'
                )
              })
            }
            tableCode.push('</select>\n')
          } else if (elem.tableColumnInputType === 'switch') {
            switchData = {
              index: parseInt(key.replace('column', '')) - 1,
              name: elem.tableColumnName,
              open: elem.tableColumnInputSWitchOpen,
              close: elem.tableColumnInputSWitchClose,
            }
            tableCode.push('<span>\n<span class="onoffswitch">\n')
            tableCode.push(
              '<input type="checkbox" name="' +
                elem.tableColumnName +
                '" class="onoffswitch-checkbox" checked="checked" id="isopen-onoffswitch"' +
                editType +
                '/>\n'
            )
            tableCode.push(
              '<label class="onoffswitch-label" for="isopen-onoffswitch">\n'
            )
            tableCode.push(
              '<span class="onoffswitch-inner" data-swchon-text="ON" data-swchoff-text="OFF"></span>\n'
            )
            tableCode.push('<span class="onoffswitch-switch"></span>')
            tableCode.push('</label>\n</span>\n</span>\n')
          } else if (elem.tableColumnInputType === 'textarea') {
            tableCode.push(
              '<textarea type="text" name="' +
                elem.tableColumnName +
                '" class="form-control" placeholder="' +
                elem.tableColumnTitleName +
                '" cols="20" rows="5"' +
                editType +
                '></textarea>\n'
            )
          }
          tableCode.push('</td>\n')
        })
        tableCode.push('</tr>\n</tbody>\n')
      }

      // servkit crud
      tempalteEngine.toHtmlgogo.push('servkit.crudtable({\n')
      tempalteEngine.toHtmlgogo.push(
        "  tableSelector: '#" + config.tableId + "',\n"
      )
      if (config.tableDataFromTableModel) {
        tempalteEngine.toHtmlgogo.push(
          "  tableModel: 'com.servtech.servcloud." +
            config.tableDataFromTableModel +
            "',\n"
        )
      }
      if (config.tableCRUDEditModal) {
        tempalteEngine.toHtmlgogo.push('  modal: {\n')
        tempalteEngine.toHtmlgogo.push(
          "    id: '#" + config.tableCRUDEditModal + "'\n"
        )
        tempalteEngine.toHtmlgogo.push('  },\n')
        tempalteEngine.toHtmlgogo.push('  columns: [\n')
        var firstColumn = true
        _.each(config.column, function (elem) {
          if (firstColumn) {
            tempalteEngine.toHtmlgogo.push('    {\n')
            firstColumn = false
          } else {
            tempalteEngine.toHtmlgogo.push(',\n    {\n')
          }
          tempalteEngine.toHtmlgogo.push(
            "      data: '" + elem.tableColumnName + "'\n"
          )
          tempalteEngine.toHtmlgogo.push('    }')
        })
        tempalteEngine.toHtmlgogo.push('\n  ],\n')
      }
      if (cutomerBtn.length) {
        tempalteEngine.toHtmlgogo.push('  customBtns: [\n')
        _.each(cutomerBtn, function (num, key) {
          if (key !== 0) {
            tempalteEngine.toHtmlgogo.push(',\n')
          }
          tempalteEngine.toHtmlgogo.push("    '" + num + "'")
        })
        tempalteEngine.toHtmlgogo.push('],\n')
      }
      if (centerColumn.length) {
        tempalteEngine.toHtmlgogo.push('  centerColumn: [')
        _.each(centerColumn, function (num, key) {
          if (key !== 0) {
            tempalteEngine.toHtmlgogo.push(', ')
          }
          tempalteEngine.toHtmlgogo.push(num)
        })
        tempalteEngine.toHtmlgogo.push('],\n')
      }
      if (rightColumn.length) {
        tempalteEngine.toHtmlgogo.push('  rightColumn: [')
        _.each(rightColumn, function (num, key) {
          if (key !== 0) {
            tempalteEngine.toHtmlgogo.push(', ')
          }
          tempalteEngine.toHtmlgogo.push(num)
        })
        tempalteEngine.toHtmlgogo.push('],\n')
      }
      tempalteEngine.toHtmlgogo.push('  order: [\n')
      tempalteEngine.toHtmlgogo.push(
        '    [' +
          config.tableOrderColumn +
          ", '" +
          config.tableOrderType +
          "']\n"
      )
      tempalteEngine.toHtmlgogo.push('  ],\n')
      // create
      tempalteEngine.toHtmlgogo.push('  create: {\n')
      var createAvailable = _.find(config.tableCRUDAvailable, function (num) {
        return num === 'create'
      })
      if (createAvailable !== undefined) {
        if (config.tableDataFromTableModel) {
          tempalteEngine.toHtmlgogo.push("    url: 'api/stdcrud'")
          if (
            switchData &&
            !(switchData.open == 'Y' && switchData.close == 'N')
          ) {
            tempalteEngine.toHtmlgogo.push(',\n')
            tempalteEngine.toHtmlgogo.push('    send: function (tdEles) {\n')
            tempalteEngine.toHtmlgogo.push('      return {\n')
            tempalteEngine.toHtmlgogo.push(
              '        ' + switchData.name + ': (function () {\n'
            )
            tempalteEngine.toHtmlgogo.push(
              '          if ($(tdEles[' +
                switchData.index +
                "]).find(':checkbox').prop('checked')) {\n"
            )
            tempalteEngine.toHtmlgogo.push(
              '            return ' + switchData.open + '\n'
            )
            tempalteEngine.toHtmlgogo.push('          } else {\n')
            tempalteEngine.toHtmlgogo.push(
              '            return ' + switchData.close + '\n'
            )
            tempalteEngine.toHtmlgogo.push('          }\n')
            tempalteEngine.toHtmlgogo.push('        }())\n')
            tempalteEngine.toHtmlgogo.push('      }\n')
            tempalteEngine.toHtmlgogo.push('    }')
          }
          tempalteEngine.toHtmlgogo.push('\n')
        } else {
          tempalteEngine.toHtmlgogo.push(
            "    url: 'api/formeditor/html/create',\n"
          )
          tempalteEngine.toHtmlgogo.push('    send: function (tdEles) {\n')
          tempalteEngine.toHtmlgogo.push('      return {\n')
          tempalteEngine.toHtmlgogo.push('        app_id: (function () {\n')
          tempalteEngine.toHtmlgogo.push(
            "          return '" + config.tableDataFromApp + "'\n"
          )
          tempalteEngine.toHtmlgogo.push('        }()),\n')
          tempalteEngine.toHtmlgogo.push(
            '        data_filename: (function () {\n'
          )
          tempalteEngine.toHtmlgogo.push(
            "          return '" + config.tableDataFromFile + "'\n"
          )
          tempalteEngine.toHtmlgogo.push('        }())')
          if (
            switchData &&
            !(switchData.open == 'Y' && switchData.close == 'N')
          ) {
            tempalteEngine.toHtmlgogo.push(',\n')
            tempalteEngine.toHtmlgogo.push(
              '        ' + switchData.name + ': (function () {\n'
            )
            tempalteEngine.toHtmlgogo.push(
              '          if ($(tdEles[' +
                switchData.index +
                "]).find(':checkbox').prop('checked')) {\n"
            )
            tempalteEngine.toHtmlgogo.push(
              '            return ' + switchData.open + '\n'
            )
            tempalteEngine.toHtmlgogo.push('          } else {\n')
            tempalteEngine.toHtmlgogo.push(
              '            return ' + switchData.close + '\n'
            )
            tempalteEngine.toHtmlgogo.push('          }\n')
            tempalteEngine.toHtmlgogo.push('        }())')
          }
          tempalteEngine.toHtmlgogo.push('\n')
          tempalteEngine.toHtmlgogo.push('      }\n')
          tempalteEngine.toHtmlgogo.push('    }\n')
        }
        drawCrudtableEnd(config, tempalteEngine, bindingModals, 'create')
      } else {
        tempalteEngine.toHtmlgogo.push('    unavailable: true\n')
      }
      tempalteEngine.toHtmlgogo.push('  },\n')
      // read
      tempalteEngine.toHtmlgogo.push('  read: {\n')
      if (config.tableDataFromTableModel) {
        tempalteEngine.toHtmlgogo.push("    url: 'api/stdcrud'")
        if (config.tableDataFromWhere) {
          tempalteEngine.toHtmlgogo.push(
            ",\n    whereClause: '" + config.tableDataFromWhere + "'"
          )
        }
      } else {
        tempalteEngine.toHtmlgogo.push(
          "    url: 'api/formeditor/html/read?app_id=" +
            config.tableDataFromApp +
            '&data_filename=' +
            config.tableDataFromFile +
            "'"
        )
      }
      drawCrudtableEnd(config, tempalteEngine, bindingModals, 'read')
      tempalteEngine.toHtmlgogo.push('\n  },\n')
      // update
      tempalteEngine.toHtmlgogo.push('  update: {\n')
      var updateAvailable = _.find(config.tableCRUDAvailable, function (num) {
        return num === 'update'
      })
      if (updateAvailable !== undefined) {
        if (config.tableDataFrom === 'DB') {
          tempalteEngine.toHtmlgogo.push("    url: 'api/stdcrud'")
          if (
            switchData &&
            !(switchData.open == 'Y' && switchData.close == 'N')
          ) {
            tempalteEngine.toHtmlgogo.push(',\n')
            tempalteEngine.toHtmlgogo.push('    send: function (tdEles) {\n')
            tempalteEngine.toHtmlgogo.push('      return {\n')
            tempalteEngine.toHtmlgogo.push(
              '        ' + switchData.name + ': (function () {\n'
            )
            tempalteEngine.toHtmlgogo.push(
              '          if ($(tdEles[' +
                switchData.index +
                "]).find(':checkbox').prop('checked')) {\n"
            )
            tempalteEngine.toHtmlgogo.push(
              '            return ' + switchData.open + '\n'
            )
            tempalteEngine.toHtmlgogo.push('          } else {\n')
            tempalteEngine.toHtmlgogo.push(
              '            return ' + switchData.close + '\n'
            )
            tempalteEngine.toHtmlgogo.push('          }\n')
            tempalteEngine.toHtmlgogo.push('        }())\n')
            tempalteEngine.toHtmlgogo.push('      }\n')
            tempalteEngine.toHtmlgogo.push('    }')
          }
          tempalteEngine.toHtmlgogo.push('\n')
        } else {
          tempalteEngine.toHtmlgogo.push(
            "    url: 'api/formeditor/html/update',\n"
          )
          tempalteEngine.toHtmlgogo.push('    send: function (tdEles) {\n')
          tempalteEngine.toHtmlgogo.push('      return {\n')
          tempalteEngine.toHtmlgogo.push('        app_id: (function () {\n')
          tempalteEngine.toHtmlgogo.push(
            "          return '" + config.tableDataFromApp + "'\n"
          )
          tempalteEngine.toHtmlgogo.push('        }()),\n')
          tempalteEngine.toHtmlgogo.push(
            '        data_filename: (function () {\n'
          )
          tempalteEngine.toHtmlgogo.push(
            "          return '" + config.tableDataFromFile + "'\n"
          )
          tempalteEngine.toHtmlgogo.push('        }())')
          if (
            switchData &&
            !(switchData.open == 'Y' && switchData.close == 'N')
          ) {
            tempalteEngine.toHtmlgogo.push(',\n')
            tempalteEngine.toHtmlgogo.push(
              '        ' + switchData.name + ': (function () {\n'
            )
            tempalteEngine.toHtmlgogo.push(
              '          if ($(tdEles[' +
                switchData.index +
                "]).find(':checkbox').prop('checked')) {\n"
            )
            tempalteEngine.toHtmlgogo.push(
              '            return ' + switchData.open + '\n'
            )
            tempalteEngine.toHtmlgogo.push('          } else {\n')
            tempalteEngine.toHtmlgogo.push(
              '            return ' + switchData.close + '\n'
            )
            tempalteEngine.toHtmlgogo.push('          }\n')
            tempalteEngine.toHtmlgogo.push('        }())')
          }
          tempalteEngine.toHtmlgogo.push('\n')
          tempalteEngine.toHtmlgogo.push('      }\n')
          tempalteEngine.toHtmlgogo.push('    }\n')
        }
        drawCrudtableEnd(config, tempalteEngine, bindingModals, 'update')
      } else {
        tempalteEngine.toHtmlgogo.push('    unavailable: true\n')
      }
      tempalteEngine.toHtmlgogo.push('  },\n')
      // delete
      tempalteEngine.toHtmlgogo.push("  'delete': {\n")
      var deleteAvailable = _.find(config.tableCRUDAvailable, function (num) {
        return num === 'delete'
      })
      if (deleteAvailable !== undefined) {
        if (config.tableDataFrom === 'DB') {
          tempalteEngine.toHtmlgogo.push("    url: 'api/stdcrud'\n")
        } else {
          tempalteEngine.toHtmlgogo.push(
            "    url: 'api/formeditor/html/delete?app_id=" +
              config.tableDataFromApp +
              '&data_filename=' +
              config.tableDataFromFile +
              "'\n"
          )
        }
      } else {
        tempalteEngine.toHtmlgogo.push('    unavailable: true\n')
      }
      tempalteEngine.toHtmlgogo.push('  }\n')
      tempalteEngine.toHtmlgogo.push('})\n')
    } else if (config.type === 'reportTable') {
      // report table
      if (!config.tableDataFromTableModel) {
        tempalteEngine.toHtmlgogo.push(
          'context.tempalteEngine = createTempalteEngine()\n'
        )
      }
      tempalteEngine.toHtmlgogo.push(
        'context.' +
          config.tableId.replace('-', '') +
          'ReportTable = createReportTable({\n'
      )
      tempalteEngine.toHtmlgogo.push(
        "$tableElement: $('#" + config.tableId + "')"
      )
      tempalteEngine.toHtmlgogo.push(
        ",\n$tableWidget: $('#" + config.tableId + "-widget')"
      )
      tempalteEngine.toHtmlgogo.push(',\norder: [\n')
      tempalteEngine.toHtmlgogo.push(
        '[' + config.tableOrderColumn + ", '" + config.tableOrderType + "']\n"
      )
      tempalteEngine.toHtmlgogo.push(']')
      if (config.tableExport) {
        tempalteEngine.toHtmlgogo.push(',\nexcel: {\n')
        tempalteEngine.toHtmlgogo.push(
          "  fileName: '" + config.tableExportFilename + "',\n"
        )
        var format = _.map(config.column, (val) => {
          return val.tableColumnFormatType
        }).join("','")
        tempalteEngine.toHtmlgogo.push("  format: ['" + format + "'],\n")
        var columnList = _.filter(config.tableExportColumns, (val) => {
          return val !== 'ALL'
        })
        tempalteEngine.toHtmlgogo.push(
          '  customHeaderFunc: function (tableHeader) {\n'
        )
        tempalteEngine.toHtmlgogo.push(
          '    return _.filter(tableHeader, function (num, index) {\n'
        )
        tempalteEngine.toHtmlgogo.push(
          '      var columnList = [' + columnList.join(',') + ']\n'
        )
        tempalteEngine.toHtmlgogo.push(
          '      var findIndex = _.find(columnList, (val) => {\n'
        )
        tempalteEngine.toHtmlgogo.push('        return index == val\n')
        tempalteEngine.toHtmlgogo.push('      })\n')
        tempalteEngine.toHtmlgogo.push('      return findIndex !== undefined\n')
        tempalteEngine.toHtmlgogo.push('    })\n')
        tempalteEngine.toHtmlgogo.push('  },\n')
        tempalteEngine.toHtmlgogo.push(
          '  customDataFunc: function (tableData) {\n'
        )
        tempalteEngine.toHtmlgogo.push(
          '    var cloneTableData = $.extend(true, {}, tableData);\n'
        )
        tempalteEngine.toHtmlgogo.push(
          '    return _.map(cloneTableData, function (elem) {\n'
        )
        tempalteEngine.toHtmlgogo.push(
          '      return _.filter(elem, function (num, index) {\n'
        )
        tempalteEngine.toHtmlgogo.push(
          '        var columnList = [' + columnList.join(',') + ']\n'
        )
        tempalteEngine.toHtmlgogo.push(
          '        var findIndex = _.find(columnList, (val) => {\n'
        )
        tempalteEngine.toHtmlgogo.push('          return index == val\n')
        tempalteEngine.toHtmlgogo.push('        })\n')
        tempalteEngine.toHtmlgogo.push(
          '        return findIndex !== undefined\n'
        )
        tempalteEngine.toHtmlgogo.push('      })\n')
        tempalteEngine.toHtmlgogo.push('    })\n')
        tempalteEngine.toHtmlgogo.push('  }\n')
        tempalteEngine.toHtmlgogo.push('}')
      }
      if (cutomerBtn.length) {
        tempalteEngine.toHtmlgogo.push(',\ncustomBtns: [\n')
        _.each(cutomerBtn, function (num, key) {
          if (key !== 0) {
            tempalteEngine.toHtmlgogo.push(',\n')
          }
          tempalteEngine.toHtmlgogo.push("'" + num + "'")
        })
        tempalteEngine.toHtmlgogo.push(']')
      }
      if (centerColumn.length) {
        tempalteEngine.toHtmlgogo.push(',\ncenterColumn: [')
        _.each(centerColumn, function (num, key) {
          if (key !== 0) {
            tempalteEngine.toHtmlgogo.push(', ')
          }
          tempalteEngine.toHtmlgogo.push(num)
        })
        tempalteEngine.toHtmlgogo.push(']')
      }
      if (rightColumn.length) {
        tempalteEngine.toHtmlgogo.push(',\nrightColumn: [')
        _.each(rightColumn, function (num, key) {
          if (key !== 0) {
            tempalteEngine.toHtmlgogo.push(', ')
          }
          tempalteEngine.toHtmlgogo.push(num)
        })
        tempalteEngine.toHtmlgogo.push(']')
      }

      // chart
      if (config.chartExists) {
        tempalteEngine.toHtmlgogo.push(
          ',\nonDraw: function (tableData, pageData) {'
        )
        tempalteEngine.toHtmlgogo.push('\n  var dataList = []')
        if (config.chartColumn !== null) {
          tempalteEngine.toHtmlgogo.push(
            '\n  dataList = _.map(pageData, function (elem, index) {'
          )
          tempalteEngine.toHtmlgogo.push(
            '\n    var value = parseInt(elem[' +
              parseInt(config.chartColumn) +
              '])'
          )
          tempalteEngine.toHtmlgogo.push(
            "\n    return [index, value.toString() !== 'NaN' ? value : null]"
          )
          tempalteEngine.toHtmlgogo.push('\n  })')
        }
        if (config.chartXTick) {
          tempalteEngine.toHtmlgogo.push(
            '\n  var labelList = _.map(pageData, function (elem, index) {'
          )
          tempalteEngine.toHtmlgogo.push("\n    var content = ''")
          tempalteEngine.toHtmlgogo.push(
            '\n    var chartXTick = [' + config.chartXTick.toString() + ']'
          )
          tempalteEngine.toHtmlgogo.push(
            '\n    for (var i = 0; i < chartXTick.length; i++) {'
          )
          tempalteEngine.toHtmlgogo.push(
            '\n      var text = elem[parseInt(chartXTick[i])]'
          )
          tempalteEngine.toHtmlgogo.push('\n      if (content) {')
          tempalteEngine.toHtmlgogo.push("\n        content += '<br>'")
          tempalteEngine.toHtmlgogo.push('\n      }')
          // tempalteEngine.toHtmlgogo.push('\n      text.length > 10 ? content += \'...\' + text.substr(text.length - 7) : content += text')
          tempalteEngine.toHtmlgogo.push('\n      content += text')
          tempalteEngine.toHtmlgogo.push('\n    }')
          tempalteEngine.toHtmlgogo.push('\n    return [index, content]')
          tempalteEngine.toHtmlgogo.push('\n  })')
        }
        if (config.chartType === 'pie') {
          tempalteEngine.toHtmlgogo.push(
            '\n  var chartData = _.map(dataList, (elem, key) => {'
          )
          tempalteEngine.toHtmlgogo.push('\n    return {')
          tempalteEngine.toHtmlgogo.push('\n      label: labelList[key][1],')
          tempalteEngine.toHtmlgogo.push('\n      data: elem,')
          tempalteEngine.toHtmlgogo.push(
            "\n      color: servkit.colors['" + config.chartColor + "']"
          )
          tempalteEngine.toHtmlgogo.push('\n    }')
          tempalteEngine.toHtmlgogo.push('\n  })')
          tempalteEngine.toHtmlgogo.push('\n  if (chartData[0]) {')
          tempalteEngine.toHtmlgogo.push(
            "\n    chartData[0]['" + config.chartType + "'] = {"
          )
          tempalteEngine.toHtmlgogo.push('\n      show: true')
          tempalteEngine.toHtmlgogo.push('\n    }')
          tempalteEngine.toHtmlgogo.push('\n  }')
        } else {
          tempalteEngine.toHtmlgogo.push('\n  var chartData = [{')
          tempalteEngine.toHtmlgogo.push('\n    data: dataList,')
          tempalteEngine.toHtmlgogo.push(
            "\n    color: servkit.colors['" + config.chartColor + "']"
          )
          tempalteEngine.toHtmlgogo.push('\n  }]')
          tempalteEngine.toHtmlgogo.push('\n  if (chartData[0]) {')
          tempalteEngine.toHtmlgogo.push(
            "\n    chartData[0]['" + config.chartType + "'] = {"
          )
          tempalteEngine.toHtmlgogo.push('\n      show: true')
          tempalteEngine.toHtmlgogo.push('\n    }')
          tempalteEngine.toHtmlgogo.push('\n  }')
          if (config.chartType === 'bars') {
            tempalteEngine.toHtmlgogo.push(
              '\n  chartData[0].bars.align = "center"'
            )
            tempalteEngine.toHtmlgogo.push(
              '\n  chartData[0].bars.barWidth = 0.5'
            )
          }
        }

        if (config.chartStandard) {
          tempalteEngine.toHtmlgogo.push(
            '\n  var standardList = _.map(dataList, (elem) => {'
          )
          tempalteEngine.toHtmlgogo.push(
            '\n    return [elem[0], ' + config.chartStandard + ']'
          )
          tempalteEngine.toHtmlgogo.push('\n  })')
          tempalteEngine.toHtmlgogo.push('\n  chartData.push({')
          tempalteEngine.toHtmlgogo.push(
            '\n    data: _.map(dataList, (elem) => {'
          )
          tempalteEngine.toHtmlgogo.push(
            '\n      return [elem[0], ' + config.chartStandard + ']'
          )
          tempalteEngine.toHtmlgogo.push('\n    }),')
          tempalteEngine.toHtmlgogo.push('\n    color: servkit.colors.red,')
          tempalteEngine.toHtmlgogo.push('\n    lines: {')
          tempalteEngine.toHtmlgogo.push('\n      show: true')
          tempalteEngine.toHtmlgogo.push('\n    }')
          tempalteEngine.toHtmlgogo.push('\n  })')
        }
        tempalteEngine.toHtmlgogo.push('\n  var option = {')
        if (config.chartType === 'pie') {
          tempalteEngine.toHtmlgogo.push('\n    legend: {')
          tempalteEngine.toHtmlgogo.push('\n      show: false')
          tempalteEngine.toHtmlgogo.push('\n    },')
          tempalteEngine.toHtmlgogo.push('\n    series: {')
          tempalteEngine.toHtmlgogo.push('\n      pie: {')
          tempalteEngine.toHtmlgogo.push('\n        show: true,')
          tempalteEngine.toHtmlgogo.push('\n        label: {')
          tempalteEngine.toHtmlgogo.push('\n          show: true,')
          tempalteEngine.toHtmlgogo.push('\n          radius: 0.8,')
          tempalteEngine.toHtmlgogo.push(
            '\n          formatter: function (label, series) {'
          )
          tempalteEngine.toHtmlgogo.push(
            "\n            var text = label ? label + ' : ' : ''"
          )
          tempalteEngine.toHtmlgogo.push(
            '\n            return \'<div style="border:1px solid grey;font-size:8pt;text-align:center;padding:5px;color:white;">\' +'
          )
          tempalteEngine.toHtmlgogo.push(
            "\n              text + Math.round(series.percent) + '%</div>'"
          )
          tempalteEngine.toHtmlgogo.push('\n          },')
          tempalteEngine.toHtmlgogo.push('\n          background: {')
          tempalteEngine.toHtmlgogo.push('\n            opacity: 0.8,')
          tempalteEngine.toHtmlgogo.push("\n            color: '#000'")
          tempalteEngine.toHtmlgogo.push('\n          }')
          tempalteEngine.toHtmlgogo.push('\n        }')
          tempalteEngine.toHtmlgogo.push('\n      }')
          tempalteEngine.toHtmlgogo.push('\n    }')
        }
        if (config.chartXTick || config.chartXLabel) {
          if (config.chartXTick[0] === 'ALL') {
            config.chartXTick.shift()
          }
          if (config.chartType === 'pie') {
            tempalteEngine.toHtmlgogo.push(',')
          }
          tempalteEngine.toHtmlgogo.push('\n    xaxis: {')
          if (config.chartXTick) {
            tempalteEngine.toHtmlgogo.push('\n      ticks: labelList')
          }
          if (config.chartXLabel) {
            if (config.chartXTick) {
              tempalteEngine.toHtmlgogo.push(',')
            }
            tempalteEngine.toHtmlgogo.push(
              "\n      axisLabel: '" + config.chartXLabel + "'"
            )
          }
          tempalteEngine.toHtmlgogo.push('\n    }')
        }
        if (config.chartYLabel) {
          if (
            config.chartType === 'pie' ||
            config.chartXTick ||
            config.chartXLabel
          ) {
            tempalteEngine.toHtmlgogo.push(',')
          }
          tempalteEngine.toHtmlgogo.push('\n    yaxis: {')
          tempalteEngine.toHtmlgogo.push(
            "\n      axisLabel: '" + config.chartYLabel + "'"
          )
          tempalteEngine.toHtmlgogo.push('\n    }')
        }
        tempalteEngine.toHtmlgogo.push('\n  }')
        tempalteEngine.toHtmlgogo.push(
          "\n  context.drawChart($('#" +
            config.tableId +
            "_chart'), chartData, option)"
        )
        tempalteEngine.toHtmlgogo.push('\n}')
        tableCode.push.apply(tableCode, drawChart(config, tempalteEngine))
        if (!tempalteEngine.chartExist) {
          if (tempalteEngine.toHtmldependencies.length) {
            tempalteEngine.toHtmldependencies.push(',\n')
          }
          tempalteEngine.toHtmldependencies.push('[\n')
          tempalteEngine.toHtmldependencies.push(
            "'/js/plugin/flot/jquery.flot.cust.min.js',\n"
          )
          tempalteEngine.toHtmldependencies.push(
            "'/js/plugin/flot/jquery.flot.resize.min.js',\n"
          )
          tempalteEngine.toHtmldependencies.push(
            "'/js/plugin/flot/jquery.flot.fillbetween.min.js',\n"
          )
          tempalteEngine.toHtmldependencies.push(
            "'/js/plugin/flot/jquery.flot.orderBar.min.js',\n"
          )
          tempalteEngine.toHtmldependencies.push(
            "'/js/plugin/flot/jquery.flot.pie.min.js',\n"
          )
          tempalteEngine.toHtmldependencies.push(
            "'/js/plugin/flot/jquery.flot.time.min.js',\n"
          )
          tempalteEngine.toHtmldependencies.push(
            "'/js/plugin/flot/jquery.flot.tooltip.min.js',\n"
          )
          tempalteEngine.toHtmldependencies.push(
            "'/js/plugin/d3/d3.v4.min.js',\n"
          )
          tempalteEngine.toHtmldependencies.push(
            "'/js/plugin/flot/jquery.flot.axislabels.js',\n"
          )
          tempalteEngine.toHtmldependencies.push(
            "'/js/plugin/flot/jquery.flot.stack.min.js',\n"
          )
          tempalteEngine.toHtmldependencies.push(
            "'/js/plugin/flot/jquery.flot.valuelabels.js'\n"
          )
          tempalteEngine.toHtmldependencies.push(']\n')
          tempalteEngine.chartExist = true
        }
      }
      tempalteEngine.toHtmlgogo.push('\n})\n')

      if (config.chartExport) {
        tempalteEngine.toHtmlgogo.push(
          "\n  servkit.addmultiChartExport('#" +
            config.tableId +
            "_charthead', ['#" +
            config.tableId +
            "_chart'])\n"
        )
      }
      tempalteEngine.toHtmlgogo.push(
        'context.' + config.tableId.replace('-', '') + 'RenderTable()\n'
      )

      if (tempalteEngine.toHtmlutil.length) {
        tempalteEngine.toHtmlutil.push(',')
      }

      if (!config.tableDataFromTableModel) {
        tempalteEngine.toHtmlutil.push('\ntempalteEngine: null,')
      }
      tempalteEngine.toHtmlutil.push(
        '\n' + config.tableId.replace('-', '') + 'ReportTable: null'
      )

      if (config.tableDataFromTableModel) {
        tempalteEngine.toHtmlutil.push(
          ',\n' +
            config.tableId.replace('-', '') +
            'RenderTable: function (whereClause) {\n'
        )
      } else {
        tempalteEngine.toHtmlutil.push(
          ',\n' +
            config.tableId.replace('-', '') +
            'RenderTable: function (criteriaData) {\n'
        )
      }
      tempalteEngine.toHtmlutil.push('  var ctx = this\n')
      var dataShowList = []
      var isColumnNotText

      // draw table
      if (config.tableDataFromTableModel) {
        // by DB
        tempalteEngine.toHtmlutil.push('  var data = {\n')
        tempalteEngine.toHtmlutil.push(
          "    tableModel: 'com.servtech.servcloud." +
            config.tableDataFromTableModel +
            "'\n"
        )
        tempalteEngine.toHtmlutil.push('  }\n')
        tempalteEngine.toHtmlutil.push('  if (whereClause) {\n')
        tempalteEngine.toHtmlutil.push('    data.whereClause = whereClause\n')
        tempalteEngine.toHtmlutil.push('  }\n')
        tempalteEngine.toHtmlutil.push('  servkit.ajax({\n')
        tempalteEngine.toHtmlutil.push("    url: 'api/stdcrud',\n")
        tempalteEngine.toHtmlutil.push("    type: 'GET',\n")
        tempalteEngine.toHtmlutil.push("    contentType: 'application/json',\n")
        tempalteEngine.toHtmlutil.push('    data: data\n')
        tempalteEngine.toHtmlutil.push('  }, {\n')
        tempalteEngine.toHtmlutil.push('    success: function (data) {\n')
        tempalteEngine.toHtmlutil.push(
          '      ctx.' +
            config.tableId.replace('-', '') +
            'ReportTable.drawTable(_.map(data, (val, key) => {\n'
        )
        isColumnNotText = _.find(config.column, (col) => {
          return col.tableColumnDataType !== 'text'
        })
        if (isColumnNotText !== undefined) {
          tempalteEngine.toHtmlutil.push("        var dataKey = ''\n")
          tempalteEngine.toHtmlutil.push(
            '        _.each(val, (value, key) => {\n'
          )
          tempalteEngine.toHtmlutil.push(
            "          dataKey += ' data-' + key + '= \"' + value + '\"'\n"
          )
          tempalteEngine.toHtmlutil.push('        })\n')
        }
        dataShowList = _.map(config.column, (col) => {
          if (col.tableColumnChangeText === 'user' && !col.tableColumnText) {
            tempalteEngine.toHtmlutil.push(
              '        var ' + col.tableColumnName + 'DataMap = {\n'
            )
            var first = true
            _.each(col.tableColumnTextSelectElement, (text) => {
              if (first) {
                first = false
              } else {
                tempalteEngine.toHtmlutil.push(',\n')
              }
              tempalteEngine.toHtmlutil.push(
                '          ' +
                  text.tableColumnTextSelectValue +
                  ": '" +
                  text.tableColumnTextSelectText +
                  "'"
              )
            })
            tempalteEngine.toHtmlutil.push('\n        }\n')
          }
          var html = []
          if (col.tableColumnDataType === 'href') {
            html.push('\'<a href="javascript:void(0)"')
            if (col.tableColumnBtnBinding === 'Modal') {
              html.push(' class="' + col.tableColumnBtnBindingModal + 'Btn"')
              html.push(
                ' data-toggle="modal" data-target="#' +
                  col.tableColumnBtnBindingModal
              )
              html.push('"')
            }
            html.push(
              ' data-pks="{' +
                config.tableDataFromKey +
                ":' + val." +
                config.tableDataFromKey +
                " + '}\" ' + dataKey +'"
            )
            html.push('>')
            if (col.tableColumnText) {
              html.push(col.tableColumnText)
            } else {
              html.push(
                "' + " +
                  tableDatachangeText(
                    col,
                    'val.' + col.tableColumnName,
                    tempalteEngine
                  ) +
                  " + '"
              )
            }
            html.push("</a>'")
          } else if (col.tableColumnDataType === 'button') {
            html.push('\'<button class="btn')
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
                  col.tableColumnBtnBindingModal
              )
              html.push('"')
            }
            html.push(
              ' data-pks="{' +
                col.tableColumnName +
                ":' + val." +
                col.tableColumnName +
                " + '}\" ' + dataKey +'"
            )
            html.push('>')
            if (col.tableColumnText) {
              html.push(col.tableColumnText)
            } else {
              html.push(
                "' + " +
                  tableDatachangeText(
                    col,
                    'val.' + col.tableColumnName,
                    tempalteEngine
                  ) +
                  " + '"
              )
            }
            html.push("</button>'")
          } else {
            html.push(
              tableDatachangeText(
                col,
                'val.' + col.tableColumnName,
                tempalteEngine
              ) + ' === null || '
            )
            html.push(
              tableDatachangeText(
                col,
                'val.' + col.tableColumnName,
                tempalteEngine
              ) + " === undefined ? '' : "
            )
            html.push(
              tableDatachangeText(
                col,
                'val.' + col.tableColumnName,
                tempalteEngine
              )
            )
          }
          return html.join('')
        })
        tempalteEngine.toHtmlutil.push(
          '        return [\n        ' +
            dataShowList.join(',\n        ') +
            '\n      ]\n'
        )
        tempalteEngine.toHtmlutil.push('      }))\n')
        tempalteEngine.toHtmlutil.push('    }\n')
        tempalteEngine.toHtmlutil.push('  })\n')
      } else {
        // by file
        tempalteEngine.toHtmlutil.push(
          "  $.get('./app/" +
            config.tableDataFromApp +
            '/data/' +
            config.tableDataFromFile +
            ".json', (rep) => {\n"
        )
        tempalteEngine.toHtmlutil.push('    if(criteriaData) {\n')
        tempalteEngine.toHtmlutil.push(
          '      ctx.tempalteEngine.getReportData(rep, criteriaData)\n'
        )
        tempalteEngine.toHtmlutil.push('    }\n')
        tempalteEngine.toHtmlutil.push('    var keyColumn = []\n')
        tempalteEngine.toHtmlutil.push(
          '    _.each(rep.head, function (val, key) {\n'
        )
        tempalteEngine.toHtmlutil.push(
          '      var isKey = _.find(rep.keys, (keyValue) => {\n'
        )
        tempalteEngine.toHtmlutil.push('        return keyValue === val\n')
        tempalteEngine.toHtmlutil.push('      })\n')
        tempalteEngine.toHtmlutil.push('      if (isKey) {\n')
        tempalteEngine.toHtmlutil.push('        keyColumn.push(key)\n')
        tempalteEngine.toHtmlutil.push('      }\n')
        tempalteEngine.toHtmlutil.push('    })\n')
        tempalteEngine.toHtmlutil.push(
          '    ctx.' +
            config.tableId.replace('-', '') +
            'ReportTable.drawTable(_.map(rep.data, (val) => {\n'
        )
        tempalteEngine.toHtmlutil.push('      var pks = {}\n')
        tempalteEngine.toHtmlutil.push(
          '      _.each(keyColumn, function (column) {\n'
        )
        tempalteEngine.toHtmlutil.push(
          '        pks[rep.head[column]] = val[column]\n'
        )
        tempalteEngine.toHtmlutil.push('      })\n')
        isColumnNotText = _.find(config.column, (col) => {
          return col.tableColumnDataType !== 'text'
        })
        if (isColumnNotText !== undefined) {
          tempalteEngine.toHtmlutil.push("        var dataKey = ''\n")
          tempalteEngine.toHtmlutil.push(
            '        _.each(val, (value, key) => {\n'
          )
          tempalteEngine.toHtmlutil.push(
            "          dataKey += ' data-' + rep.head[key] + '=\"' + value + '\"'\n"
          )
          tempalteEngine.toHtmlutil.push('        })\n')
        }
        dataShowList = _.map(config.columnList, (col) => {
          if (
            config.columnMap[col] &&
            config.columnMap[col].tableColumnChangeText === 'user' &&
            !config.columnMap[col].tableColumnText
          ) {
            tempalteEngine.toHtmlutil.push(
              '        var ' +
                config.columnMap[col].tableColumnName +
                'DataMap = {\n'
            )
            var first = true
            _.each(
              config.columnMap[col].tableColumnTextSelectElement,
              (text) => {
                if (first) {
                  first = false
                } else {
                  tempalteEngine.toHtmlutil.push(',\n')
                }
                tempalteEngine.toHtmlutil.push(
                  '          ' +
                    text.tableColumnTextSelectValue +
                    ": '" +
                    text.tableColumnTextSelectText +
                    "'"
                )
              }
            )
            tempalteEngine.toHtmlutil.push('\n        }\n')
          }
          var html = []
          if (
            config.columnMap[col] &&
            config.columnMap[col].tableColumnDataType === 'href'
          ) {
            html.push('\'<a href="javascript:void(0)"')
            if (config.columnMap[col].tableColumnBtnBinding === 'Modal') {
              html.push(
                ' class="' +
                  config.columnMap[col].tableColumnBtnBindingModal +
                  'Btn"'
              )
              html.push(
                ' data-toggle="modal" data-target="#' +
                  config.columnMap[col].tableColumnBtnBindingModal
              )
              html.push('"')
            }
            html.push(
              " data-pks=\"' + JSON.stringify(pks).replace(/\"/g, '') + '\" ' + dataKey +'"
            )
            html.push('>')
            if (config.columnMap[col].tableColumnText) {
              html.push(config.columnMap[col].tableColumnText)
            } else {
              html.push(
                "' + " +
                  tableDatachangeText(
                    config.columnMap[col],
                    'val[' + col + ']',
                    tempalteEngine
                  ) +
                  " + '"
              )
            }
            html.push("</a>'")
          } else if (
            config.columnMap[col] &&
            config.columnMap[col].tableColumnDataType === 'button'
          ) {
            html.push('\'<button class="btn')
            if (config.columnMap[col].tableColumnBtnType) {
              html.push(' btn-' + config.columnMap[col].tableColumnBtnType)
            }
            html.push(
              ' ' + config.columnMap[col].tableColumnBtnBindingModal + 'Btn'
            )
            html.push('"')
            if (config.columnMap[col].tableColumnTitle) {
              html.push(
                ' title="' + config.columnMap[col].tableColumnTitle + '"'
              )
            }
            if (config.columnMap[col].tableColumnBtnBinding === 'Modal') {
              html.push(
                ' data-toggle="modal" data-target="#' +
                  config.columnMap[col].tableColumnBtnBindingModal
              )
              html.push('"')
            }
            html.push(
              " data-pks=\"' + JSON.stringify(pks).replace(/\"/g, '') + '\" ' + dataKey +'"
            )
            html.push('>')
            if (config.columnMap[col].tableColumnText) {
              html.push(config.columnMap[col].tableColumnText)
            } else {
              html.push(
                "' + " +
                  tableDatachangeText(
                    config.columnMap[col],
                    'val[' + col + ']',
                    tempalteEngine
                  ) +
                  " + '"
              )
            }
            html.push("</button>'")
          } else {
            html.push(
              tableDatachangeText(
                config.columnMap[col],
                'val[' + col + ']',
                tempalteEngine
              ) + ' === null || '
            )
            html.push(
              tableDatachangeText(
                config.columnMap[col],
                'val[' + col + ']',
                tempalteEngine
              ) + " === undefined ? '' : "
            )
            html.push(
              tableDatachangeText(
                config.columnMap[col],
                'val[' + col + ']',
                tempalteEngine
              )
            )
          }
          return html.join('')
        })
        tempalteEngine.toHtmlutil.push(
          '      return [\n        ' +
            dataShowList.join(',\n        ') +
            '\n      ]\n'
        )
        tempalteEngine.toHtmlutil.push('    }))\n')
        tempalteEngine.toHtmlutil.push('  })\n')
      }
      tempalteEngine.toHtmlutil.push('}')
      tempalteEngine.toHtmlutil.push('\n')
    }
    tableCode.push('</table>\n')

    // modal綁定
    _.each(_.union(bindingModals), function (elem) {
      // 要把table row的值傳到modal
      tempalteEngine.toHtmlgogo.push(
        "$('#" +
          config.tableId +
          "-widget').on('click', '." +
          elem +
          "Btn', function (evt) {\n"
      )
      tempalteEngine.toHtmlgogo.push('  evt.preventDefault()\n')
      tempalteEngine.toHtmlgogo.push('  var data = $(evt.target).data()\n')
      if (config.tableDataFromTableModel === 'file') {
        tempalteEngine.toHtmlgogo.push(
          "  $(data.target).data('pks', $(evt.target).data('pks') || '')\n"
        )
      } else {
        tempalteEngine.toHtmlgogo.push(
          "  $(data.target).data('" +
            config.tableDataFromKey +
            "', $(evt.target).data('" +
            config.tableDataFromKey +
            "') || '')\n"
        )
      }
      var formData = _.find(allConfig, (elem) => {
        return elem.modalFormButtonTableBinding === config.element
      })

      _.each(allConfig, (data) => {
        if (
          formData &&
          data.order.search(formData.order + '.') >= 0 &&
          data.formBindingTableColumn
        ) {
          if (data.type === 'startEndDate') {
            if (data.formStartId) {
              tempalteEngine.toHtmlgogo.push(
                "  $('#" +
                  data.formStartId +
                  "').val(data." +
                  data.formBindingTableColumn +
                  ')\n'
              )
            } else if (data.formStartName) {
              tempalteEngine.toHtmlgogo.push(
                "  $('[name=" +
                  data.formStartName +
                  "]').val(data." +
                  data.formBindingTableColumn +
                  ')\n'
              )
            } else {
              tempalteEngine.toHtmlgogo.push(
                "  $('[name=" +
                  data.element +
                  "start]')(data." +
                  data.formBindingTableColumn +
                  ')\n'
              )
            }
            if (data.formEndId) {
              tempalteEngine.toHtmlgogo.push(
                "$('#" +
                  data.formEndId +
                  "').val(data." +
                  data.formBindingTableColumn +
                  ')\n'
              )
            } else if (data.formEndName) {
              tempalteEngine.toHtmlgogo.push(
                "$('[name=" +
                  data.formEndName +
                  "]').val(data." +
                  data.formBindingTableColumn +
                  ')\n'
              )
            } else {
              tempalteEngine.toHtmlgogo.push(
                "$('[name=" +
                  data.element +
                  "end]').val(data." +
                  data.formBindingTableColumn +
                  ')\n'
              )
            }
          } else {
            if (data.formId) {
              tempalteEngine.toHtmlgogo.push("  $('#" + data.formId)
            } else if (data.formName) {
              tempalteEngine.toHtmlgogo.push(
                "  $('[name=" + data.formName + ']'
              )
            } else {
              tempalteEngine.toHtmlgogo.push("  $('[name=" + data.element + ']')
            }
            if (data.type === 'checkbox' || data.type === 'radio') {
              tempalteEngine.toHtmlgogo.push("').each(function () {\n")
              tempalteEngine.toHtmlgogo.push('    var value = $(this).val()\n')
              tempalteEngine.toHtmlgogo.push(
                '    var elementValue =  _.find(data.' +
                  data.formBindingTableColumn +
                  ".toString().split(','), (val) => {\n"
              )
              tempalteEngine.toHtmlgogo.push('      return val === value\n')
              tempalteEngine.toHtmlgogo.push('    })\n')
              tempalteEngine.toHtmlgogo.push(
                "    $(this).prop('checked', elementValue === undefined ? false : true)\n"
              )
              tempalteEngine.toHtmlgogo.push('  })\n')
            } else if (data.type === 'label') {
              tempalteEngine.toHtmlgogo.push(
                " span:last').text(data." + data.formBindingTableColumn + ')\n'
              )
            } else {
              tempalteEngine.toHtmlgogo.push(
                "').val(data." + data.formBindingTableColumn
              )
              if (data.type === 'startEndDate') {
                tempalteEngine.toHtmlgogo.push(".toString().split(',')")
              }
              tempalteEngine.toHtmlgogo.push(')\n')
            }
          }
        }
      })
      tempalteEngine.toHtmlgogo.push('})\n')
    })

    if (!tempalteEngine.tableExist) {
      if (tempalteEngine.toHtmldependencies.length) {
        tempalteEngine.toHtmldependencies.push(',\n')
      }
      tempalteEngine.toHtmldependencies.push('[\n')
      tempalteEngine.toHtmldependencies.push(
        "'/js/plugin/datatables/jquery.dataTables.min.js',\n"
      )
      tempalteEngine.toHtmldependencies.push(
        "'/js/plugin/datatables/dataTables.colVis.min.js',\n"
      )
      tempalteEngine.toHtmldependencies.push(
        "'/js/plugin/datatables/dataTables.tableTools.min.js',\n"
      )
      tempalteEngine.toHtmldependencies.push(
        "'/js/plugin/datatables/dataTables.bootstrap.min.js',\n"
      )
      tempalteEngine.toHtmldependencies.push(
        "'/js/plugin/datatable-responsive/datatables.responsive.min.js'\n"
      )
      tempalteEngine.toHtmldependencies.push(']\n')
      tempalteEngine.tableExist = true
    }
    return tableCode
  }

  function drawChart(config, tempalteEngine) {
    // 畫chart
    if (tempalteEngine.toHtmlutil.length) {
      tempalteEngine.toHtmlutil.push(',\n')
    }
    tempalteEngine.toHtmlutil.push(
      'drawChart: function ($chart, data, option) {\n'
    )
    tempalteEngine.toHtmlutil.push('  var options = {\n')
    tempalteEngine.toHtmlutil.push('    xaxis: {\n')
    tempalteEngine.toHtmlutil.push(
      "      tickColor: 'rgba(186,186,186,0.2)',\n"
    )
    tempalteEngine.toHtmlutil.push(
      '      axisLabelFontFamily: servkit.fonts,\n'
    )
    tempalteEngine.toHtmlutil.push('      axisLabelUseCanvas: true,\n')
    tempalteEngine.toHtmlutil.push('      axisLabelPadding: 5\n')
    tempalteEngine.toHtmlutil.push('    },\n')
    tempalteEngine.toHtmlutil.push('    yaxis: {\n')
    tempalteEngine.toHtmlutil.push('      min: 0,\n')
    tempalteEngine.toHtmlutil.push(
      "      tickColor: 'rgba(186,186,186,0.2)',\n"
    )
    tempalteEngine.toHtmlutil.push('      axisLabelFontSizePixels: 12,\n')
    tempalteEngine.toHtmlutil.push(
      '      axisLabelFontFamily: servkit.fonts,\n'
    )
    tempalteEngine.toHtmlutil.push('      axisLabelUseCanvas: true,\n')
    tempalteEngine.toHtmlutil.push('      axisLabelPadding: 5,\n')
    tempalteEngine.toHtmlutil.push('      tickDecimals: 0,\n')
    tempalteEngine.toHtmlutil.push('      minTickSize: 1\n')
    tempalteEngine.toHtmlutil.push('    },\n')
    tempalteEngine.toHtmlutil.push('    legend: {\n')
    tempalteEngine.toHtmlutil.push('      show: true\n')
    tempalteEngine.toHtmlutil.push('    },\n')
    tempalteEngine.toHtmlutil.push('    grid: {\n')
    tempalteEngine.toHtmlutil.push('      show: true,\n')
    tempalteEngine.toHtmlutil.push('      hoverable: true,\n')
    tempalteEngine.toHtmlutil.push('      clickable: true,\n')
    tempalteEngine.toHtmlutil.push('      tickColor: "#EFEFEF",\n')
    tempalteEngine.toHtmlutil.push('      borderWidth: 0,\n')
    tempalteEngine.toHtmlutil.push('      borderColor: "#EFEFEF"\n')
    tempalteEngine.toHtmlutil.push('    },\n')
    tempalteEngine.toHtmlutil.push('    tooltip: true,\n')
    tempalteEngine.toHtmlutil.push('    tooltipOpts: {\n')
    tempalteEngine.toHtmlutil.push(
      '      content: \'<b style="display:none;">%x</b><span>%y</span>\',\n'
    )
    tempalteEngine.toHtmlutil.push('      defaultTheme: false\n')
    tempalteEngine.toHtmlutil.push('    }\n')
    tempalteEngine.toHtmlutil.push('  }\n')
    tempalteEngine.toHtmlutil.push(
      '  $.plot($chart, data, _.extend(options, option))\n'
    )
    tempalteEngine.toHtmlutil.push('}')
  }

  function drawCrudtableEnd(config, tempalteEngine, bindingModals, crud) {
    // crud end
    var endHtnlExist = false
    _.each(config.column, function (elem, key) {
      var colNum = parseInt(key.replace('column', ''))
      if (!endHtnlExist && elem.tableColumnDataType !== 'text') {
        tempalteEngine.toHtmlgogo.push(',\nend: {\n')
        endHtnlExist = true
      }
      if (elem.tableColumnDataType !== 'text') {
        var datarowName = 'formData'
        if (crud == 'read') {
          datarowName = 'rowData'
          tempalteEngine.toHtmlgogo.push(
            colNum + ': function (data, ' + datarowName + ') {\n'
          )
        } else {
          tempalteEngine.toHtmlgogo.push(
            colNum + ': function (td, ' + datarowName + ') {\n'
          )
        }
        tempalteEngine.toHtmlgogo.push("  var dataHtml = ''\n")
        tempalteEngine.toHtmlgogo.push(
          '  _.each(' + datarowName + ', (value, key) => {\n'
        )
        if (config.tableDataFrom === 'DB') {
          tempalteEngine.toHtmlgogo.push(
            "    dataHtml += ' data-' + key + '=\"' + value + '\"'\n"
          )
        } else {
          tempalteEngine.toHtmlgogo.push("    if(value && key === 'pks'){\n")
          tempalteEngine.toHtmlgogo.push(
            "      dataHtml += ' data-pks=\"' + JSON.stringify(" +
              datarowName +
              ".pks).replace(/\"/g, '') + '\"'\n"
          )
          tempalteEngine.toHtmlgogo.push('    } else {\n')
          tempalteEngine.toHtmlgogo.push(
            "      dataHtml += ' data-' + key + '=\"' + value + '\"'\n"
          )
          tempalteEngine.toHtmlgogo.push('    }\n')
        }
        tempalteEngine.toHtmlgogo.push('  })\n')
      }
      var endHtml = []
      if (elem.tableColumnDataType === 'href') {
        endHtml.push('  return \'<a href="javascript:void(0)"')
        if (
          elem.tableColumnBtnBinding === 'Modal' &&
          elem.tableColumnBtnBindingModal
        ) {
          endHtml.push(' class="' + elem.tableColumnBtnBindingModal + 'Btn"')
          endHtml.push(
            ' data-toggle="modal" data-target="#' +
              elem.tableColumnBtnBindingModal +
              '"'
          )
        }
        endHtml.push("' + dataHtml + '>")
        if (crud == 'read') {
          endHtml.push(
            elem.tableColumnText ? elem.tableColumnText : "' + data + '"
          )
        } else {
          endHtml.push(
            elem.tableColumnText
              ? elem.tableColumnText
              : "' + $(td).find('input, select').val() + '"
          )
        }
        endHtml.push("</a>'\n")
        tempalteEngine.toHtmlgogo.push.apply(tempalteEngine.toHtmlgogo, endHtml)
        tempalteEngine.toHtmlgogo.push('},\n')
      } else if (elem.tableColumnDataType === 'button') {
        endHtml.push('  return \'<button class="btn')
        if (elem.tableColumnBtnType) {
          tempalteEngine.toHtmlgogo.push(' btn-' + elem.tableColumnBtnType)
        }
        if (
          elem.tableColumnBtnBinding === 'Modal' &&
          elem.tableColumnBtnBindingModal
        ) {
          endHtml.push(' ' + elem.tableColumnBtnBindingModal + 'Btn"')
          endHtml.push(
            ' data-toggle="modal" data-target="#' +
              elem.tableColumnBtnBindingModal +
              '"'
          )
        } else {
          endHtml.push('"')
        }
        endHtml.push("' + dataHtml + '>")
        if (crud == 'read') {
          endHtml.push(
            elem.tableColumnText ? elem.tableColumnText : "' + data + '"
          )
        } else {
          endHtml.push(
            elem.tableColumnText
              ? elem.tableColumnText
              : "' + $(td).find('input, select').val() + '"
          )
        }
        endHtml.push("</button>'\n")
        tempalteEngine.toHtmlgogo.push.apply(tempalteEngine.toHtmlgogo, endHtml)
        tempalteEngine.toHtmlgogo.push('},\n')
      }
    })
    if (endHtnlExist) {
      tempalteEngine.toHtmlgogo.push('}')
    }
  }

  function setFormBinding(allData, frameType, value, tempalteEngine) {
    console.log(allData)
    var isCRUDEditModal = _.find(allData, (ele) => {
      return ele.tableCRUDEditModal
    })
    var bindingTable =
      allData[value.element][frameType + 'FormButtonTableBinding']
    if (isCRUDEditModal !== undefined || bindingTable) {
      tempalteEngine.toHtmlgogo.push(
        "$('#" +
          value[frameType + 'ButtonId'] +
          "').on('click', function (evt) {\n"
      )
      tempalteEngine.toHtmlgogo.push('  evt.preventDefault()\n')

      if (bindingTable) {
        // 若form有綁定table
        if (frameType === 'modal') {
          // modal要傳到api的值
          tempalteEngine.toHtmlgogo.push(
            "  var $modal = $(this).closest('.modal')\n"
          )
          tempalteEngine.toHtmlgogo.push('  var modalData = {}\n')
          var hasKey = false
          _.each(allData, (data) => {
            if (
              data.order.search(value.order + '.') >= 0 &&
              data.formBindingTableColumn
            ) {
              tempalteEngine.toHtmlgogo.push(
                '  modalData.' + data.formBindingTableColumn + ' = '
              )
              if (
                data.formBindingTableColumn ===
                allData[bindingTable].tableDataFromKey
              ) {
                hasKey = true
              }
              if (data.type === 'startEndDate') {
                if (data.formStartId) {
                  tempalteEngine.toHtmlgogo.push(
                    "$('#" + data.formStartId + "').val() + ',' + "
                  )
                } else if (data.formStartName) {
                  tempalteEngine.toHtmlgogo.push(
                    "$('[name=" + data.formStartName + "]').val() + ',' + "
                  )
                } else {
                  tempalteEngine.toHtmlgogo.push(
                    "$('[name=" + data.element + "start]').val() + ',' + "
                  )
                }
                if (data.formEndId) {
                  tempalteEngine.toHtmlgogo.push(
                    "$('#" + data.formEndId + "').val()\n"
                  )
                } else if (data.formEndName) {
                  tempalteEngine.toHtmlgogo.push(
                    "$('[name=" + data.formEndName + "]').val()\n"
                  )
                } else {
                  tempalteEngine.toHtmlgogo.push(
                    "$('[name=" + data.element + "end]').val()\n"
                  )
                }
              } else {
                if (data.type === 'checkbox') {
                  tempalteEngine.toHtmlgogo.push('_.map(')
                }
                if (data.formId) {
                  tempalteEngine.toHtmlgogo.push("$('#" + data.formId)
                } else if (data.formName) {
                  tempalteEngine.toHtmlgogo.push(
                    "$('[name=" + data.formName + ']'
                  )
                } else {
                  tempalteEngine.toHtmlgogo.push(
                    "$('[name=" + data.element + ']'
                  )
                }
                if (data.type === 'radio' || data.type === 'checkbox') {
                  tempalteEngine.toHtmlgogo.push(':checked')
                }
                if (data.type === 'checkbox') {
                  tempalteEngine.toHtmlgogo.push("'), (elem) => {\n")
                  tempalteEngine.toHtmlgogo.push('    return $(elem).val()\n')
                  tempalteEngine.toHtmlgogo.push("  }).join(',')\n")
                } else if (data.type === 'multipleSelect') {
                  tempalteEngine.toHtmlgogo.push("').val().join(',')\n")
                } else {
                  tempalteEngine.toHtmlgogo.push("').val()\n")
                }
              }
            }
          })
          if (allData[bindingTable].tableDataFrom === 'file') {
            tempalteEngine.toHtmlgogo.push("  if($modal.data('pks')){\n")
            tempalteEngine.toHtmlgogo.push(
              "    modalData = JSON.parse($modal.data('pks').replace('{', '{\"').replace(/:/g, '\":\"').replace(/,/g, '\",\"').replace('}', '\"}'))\n"
            )
            tempalteEngine.toHtmlgogo.push('  }\n')
            tempalteEngine.toHtmlgogo.push(
              "  modalData.app_id = '" +
                allData[bindingTable].tableDataFromApp +
                "'\n"
            )
            tempalteEngine.toHtmlgogo.push(
              "  modalData.data_filename = '" +
                allData[bindingTable].tableDataFromFile +
                "'\n"
            )
            tempalteEngine.toHtmlgogo.push('  servkit.ajax({\n')
            tempalteEngine.toHtmlgogo.push(
              "    url: 'api/formeditor/html/changeModalData',\n"
            )
            tempalteEngine.toHtmlgogo.push("    type: 'POST',\n")
            tempalteEngine.toHtmlgogo.push(
              "    contentType: 'application/json',\n"
            )
            tempalteEngine.toHtmlgogo.push(
              '    data: JSON.stringify(modalData)\n'
            )
            tempalteEngine.toHtmlgogo.push('  }, {\n')
            tempalteEngine.toHtmlgogo.push('    success: function () {\n')
          } else {
            tempalteEngine.toHtmlgogo.push(
              '  modalData.' +
                allData[bindingTable].tableDataFromKey +
                " = $modal.data('" +
                allData[bindingTable].tableDataFromKey +
                "')\n"
            )
            tempalteEngine.toHtmlgogo.push(
              "  modalData.tableModel = 'com.servtech.servcloud." +
                allData[bindingTable].tableDataFromTableModel +
                "'\n"
            )
            tempalteEngine.toHtmlgogo.push('  servkit.ajax({\n')
            tempalteEngine.toHtmlgogo.push("    url: 'api/stdcrud',\n")
            if (hasKey) {
              tempalteEngine.toHtmlgogo.push("    type: 'POST',\n")
            } else {
              tempalteEngine.toHtmlgogo.push("    type: 'PUT',\n")
            }
            tempalteEngine.toHtmlgogo.push(
              "    contentType: 'application/json',\n"
            )
            tempalteEngine.toHtmlgogo.push(
              '    data: JSON.stringify(modalData)\n'
            )
            tempalteEngine.toHtmlgogo.push('  }, {\n')
            tempalteEngine.toHtmlgogo.push('    success: function () {\n')
          }
        }
        var type = _.find(allData, function (elem) {
          return elem.element === value[frameType + 'FormButtonTableBinding']
        }).type
        var criteriaData = []
        if (allData[bindingTable].tableDataFrom === 'DB') {
          if (frameType === 'widget') {
            tempalteEngine.toHtmlgogo.push("  var criteria = ''\n")
            _.each(allData, (data) => {
              if (
                data.order.search(value.order + '.') >= 0 &&
                data.formBindingTableColumn
              ) {
                if (criteriaData.length > 0) {
                  criteriaData.push("  criteria += ' AND '\n")
                }
                if (
                  data.type === 'multipleSelect' ||
                  data.type === 'checkbox'
                ) {
                  criteriaData.push(
                    "  criteria += '" +
                      data.formBindingTableColumn +
                      ' in("\' + '
                  )
                } else if (
                  data.type === 'startEndDate' ||
                  data.type === 'date'
                ) {
                  criteriaData.push(
                    "  criteria += '" +
                      data.formBindingTableColumn +
                      ' BETWEEN "\' + '
                  )
                } else {
                  criteriaData.push(
                    "  criteria += '" + data.formBindingTableColumn + '="\' + '
                  )
                }
                if (data.type === 'startEndDate') {
                  if (data.formStartId) {
                    criteriaData.push(
                      "$('#" + data.formStartId + "').val() + '\" AND \"' + "
                    )
                  } else if (data.formStartName) {
                    criteriaData.push(
                      "$('[name=" +
                        data.formStartName +
                        "]').val() + '\" AND \"' + "
                    )
                  } else {
                    criteriaData.push(
                      "$('[name=" +
                        data.element +
                        "start]').val() + '\" AND \"' + "
                    )
                  }
                  if (data.formEndId) {
                    criteriaData.push(
                      "$('#" + data.formEndId + "').val() + ' 23:59:59\"'\n"
                    )
                  } else if (data.formEndName) {
                    criteriaData.push(
                      "$('[name=" +
                        data.formEndName +
                        "]').val() + ' 23:59:59\"'\n"
                    )
                  } else {
                    criteriaData.push(
                      "$('[name=" +
                        data.element +
                        "end]').val() + ' 23:59:59\"'\n"
                    )
                  }
                } else if (data.type === 'date') {
                  if (data.formId) {
                    criteriaData.push(
                      "$('#" +
                        data.formId +
                        "').val() + '\" AND \"' + $('#" +
                        data.formId +
                        "').val() + ' 23:59:59\"'\n"
                    )
                  } else if (data.formName) {
                    criteriaData.push(
                      "$('[name=" +
                        data.formName +
                        "]').val() + '\" AND \"' + $('[name=" +
                        data.formName +
                        "]').val() + ' 23:59:59\"'\n"
                    )
                  } else {
                    criteriaData.push(
                      "$('[name=" +
                        data.element +
                        "]').val() + '\" AND \"' + $('[name=" +
                        data.element +
                        "]').val() + ' 23:59:59\"'\n"
                    )
                  }
                } else {
                  if (data.type === 'checkbox') {
                    criteriaData.push(' _.map(')
                  }
                  if (data.formId) {
                    criteriaData.push("$('#" + data.formId)
                  } else if (data.formName) {
                    criteriaData.push("$('[name=" + data.formName + ']')
                  } else {
                    criteriaData.push("$('[name=" + data.element + ']')
                  }
                  if (data.type === 'radio' || data.type === 'checkbox') {
                    criteriaData.push(':checked')
                  }
                  if (data.type === 'checkbox') {
                    criteriaData.push("'), (elem) => {\n")
                    criteriaData.push('    return $(elem).val()\n')
                    criteriaData.push("  }).join('\",\"') + '\")'\n")
                  } else if (data.type === 'multipleSelect') {
                    criteriaData.push("').val().join('\",\"') + '\")'\n")
                  } else {
                    criteriaData.push("').val() + '\"'\n")
                  }
                }
              }
            })
            tempalteEngine.toHtmlgogo.push.apply(
              tempalteEngine.toHtmlgogo,
              criteriaData
            )
          }
          if (type === 'reportTable') {
            if (frameType !== 'modal') {
              tempalteEngine.toHtmlgogo.push(
                '  context.' +
                  allData[value[frameType + 'FormButtonTableBinding']].tableId +
                  'RenderTable(criteria)\n'
              )
            } else {
              tempalteEngine.toHtmlgogo.push(
                '  context.' +
                  allData[value[frameType + 'FormButtonTableBinding']].tableId +
                  'RenderTable()\n'
              )
            }
          } else if (type === 'CRUDTable') {
            if (frameType !== 'modal') {
              tempalteEngine.toHtmlgogo.push(
                "  $('#" +
                  allData[value[frameType + 'FormButtonTableBinding']].tableId +
                  "').data('crudTableConfig').read.whereClause = criteria\n"
              )
            }
            tempalteEngine.toHtmlgogo.push(
              "  $('#" +
                allData[value[frameType + 'FormButtonTableBinding']].tableId +
                "').closest('.dataTables_wrapper').find('.stk-refresh-btn').trigger('click')\n"
            )
          }
        } else {
          if (type === 'reportTable') {
            if (frameType !== 'modal') {
              tempalteEngine.toHtmlgogo.push(
                '  context.' +
                  allData[value[frameType + 'FormButtonTableBinding']].tableId +
                  'RenderTable({\n'
              )
              _.each(allData, (data) => {
                if (data.order.search(value.order + '.') >= 0) {
                  if (data.formId) {
                    tempalteEngine.toHtmlgogo.push(
                      '    ' + data.formId + ': {\n'
                    )
                  } else if (data.formName) {
                    tempalteEngine.toHtmlgogo.push(
                      '    ' + data.formName + ': {\n'
                    )
                  } else {
                    tempalteEngine.toHtmlgogo.push(
                      '    ' + data.element + ': {\n'
                    )
                  }
                  tempalteEngine.toHtmlgogo.push(
                    "      bindingColumn: '" +
                      data.formBindingTableColumn +
                      "',\n"
                  )
                  tempalteEngine.toHtmlgogo.push(
                    "      type: '" + data.type + "',\n"
                  )
                  tempalteEngine.toHtmlgogo.push('      value: ')
                  if (data.type === 'startEndDate') {
                    if (data.formStartId) {
                      tempalteEngine.toHtmlgogo.push(
                        "[$('#" + data.formStartId + "').val()"
                      )
                    } else if (data.formStartName) {
                      tempalteEngine.toHtmlgogo.push(
                        "[$('[name=" + data.formStartName + "]').val()"
                      )
                    } else {
                      tempalteEngine.toHtmlgogo.push(
                        "[$('[name=" + data.element + "start]').val()"
                      )
                    }
                    if (data.formEndId) {
                      tempalteEngine.toHtmlgogo.push(
                        ", $('#" + data.formEndId + "').val()]\n"
                      )
                    } else if (data.formEndName) {
                      tempalteEngine.toHtmlgogo.push(
                        ", $('[name=" + data.formEndName + "]').val()]\n"
                      )
                    } else {
                      tempalteEngine.toHtmlgogo.push(
                        ", $('[name=" + data.element + "end]').val()]\n"
                      )
                    }
                  } else {
                    if (data.type === 'checkbox') {
                      tempalteEngine.toHtmlgogo.push('_.map(')
                    }
                    if (data.formId) {
                      tempalteEngine.toHtmlgogo.push("$('#" + data.formId)
                    } else if (data.formName) {
                      tempalteEngine.toHtmlgogo.push(
                        "$('[name=" + data.formName + ']'
                      )
                    } else {
                      tempalteEngine.toHtmlgogo.push(
                        "$('[name=" + data.element + ']'
                      )
                    }
                    if (data.type === 'radio' || data.type === 'checkbox') {
                      tempalteEngine.toHtmlgogo.push(':checked')
                    }
                    if (data.type === 'checkbox') {
                      tempalteEngine.toHtmlgogo.push("'), (elem) => {\n")
                      tempalteEngine.toHtmlgogo.push(
                        '        return $(elem).val()\n'
                      )
                      tempalteEngine.toHtmlgogo.push('      })\n')
                    } else {
                      tempalteEngine.toHtmlgogo.push("').val()\n")
                    }
                  }
                  tempalteEngine.toHtmlgogo.push('    },\n')
                }
              })
              tempalteEngine.toHtmlgogo.push('  })\n')
            } else {
              tempalteEngine.toHtmlgogo.push(
                '  context.' +
                  allData[value[frameType + 'FormButtonTableBinding']].tableId +
                  'RenderTable()\n'
              )
            }
          } else if (type === 'CRUDTable') {
            if (frameType !== 'modal') {
              tempalteEngine.toHtmlgogo.push("  var criteria = ''\n")
              _.each(allData, (data) => {
                if (
                  data.order.search(value.order + '.') >= 0 &&
                  data.formBindingTableColumn
                ) {
                  if (criteriaData.length > 0) {
                    criteriaData.push("  criteria += '_And_'\n")
                  }
                  if (data.type === 'multipleSelect') {
                    criteriaData.push(
                      "  criteria += '" +
                        data.formBindingTableColumn +
                        "=['  + "
                    )
                  } else {
                    criteriaData.push(
                      "  criteria += '" + data.formBindingTableColumn + "='  + "
                    )
                  }
                  if (data.type === 'startEndDate') {
                    if (data.formStartId) {
                      criteriaData.push(
                        "$('#" + data.formStartId + "').val() + '_To_'  + "
                      )
                    } else if (data.formStartName) {
                      criteriaData.push(
                        "$('[name=" +
                          data.formStartName +
                          "]').val() + '_To_'  + "
                      )
                    } else {
                      criteriaData.push(
                        "$('[name=" +
                          data.element +
                          "start]').val() + '_To_'  + "
                      )
                    }
                    if (data.formEndId) {
                      criteriaData.push(
                        "$('#" +
                          data.formEndId +
                          "').val() + '_Type_startEndDate'\n"
                      )
                    } else if (data.formEndName) {
                      criteriaData.push(
                        "$('[name=" +
                          data.formEndName +
                          "]').val() + '_Type_startEndDate'\n"
                      )
                    } else {
                      criteriaData.push(
                        "$('[name=" +
                          data.element +
                          "end]').val() + '_Type_startEndDate'\n"
                      )
                    }
                  } else {
                    if (data.type === 'checkbox') {
                      criteriaData.push("'[' + _.map(")
                    }
                    if (data.formId) {
                      criteriaData.push("$('#" + data.formId)
                    } else if (data.formName) {
                      criteriaData.push("$('[name=" + data.formName + ']')
                    } else {
                      criteriaData.push("$('[name=" + data.element + ']')
                    }
                    if (data.type === 'radio' || data.type === 'checkbox') {
                      criteriaData.push(':checked')
                    }
                    if (data.type === 'checkbox') {
                      criteriaData.push("'), (elem) => {\n")
                      criteriaData.push('        return $(elem).val()\n')
                      criteriaData.push("      }).join(',') + ']'\n")
                    } else if (data.type === 'multipleSelect') {
                      criteriaData.push("').val() + ']'")
                    } else {
                      criteriaData.push("').val()")
                    }
                    if (data.type === 'date') {
                      criteriaData.push(" + '_Type_date'")
                    }
                    criteriaData.push('\n')
                  }
                }
              })
              tempalteEngine.toHtmlgogo.push.apply(
                tempalteEngine.toHtmlgogo,
                criteriaData
              )
              tempalteEngine.toHtmlgogo.push(
                "  var urlStr = 'api/formeditor/html/read?app_id=" +
                  allData[bindingTable].tableDataFromApp +
                  '&data_filename=' +
                  allData[bindingTable].tableDataFromFile +
                  "'\n"
              )
              tempalteEngine.toHtmlgogo.push("  if (criteria !== '') {\n")
              tempalteEngine.toHtmlgogo.push(
                "    urlStr += '&criteria=' + criteria\n"
              )
              tempalteEngine.toHtmlgogo.push('  }\n')
              tempalteEngine.toHtmlgogo.push(
                "  $('#" +
                  allData[value[frameType + 'FormButtonTableBinding']].tableId +
                  "').data('crudTableConfig').read.url = urlStr\n"
              )
            }
            tempalteEngine.toHtmlgogo.push(
              "  $('#" +
                allData[value[frameType + 'FormButtonTableBinding']].tableId +
                "').closest('.dataTables_wrapper').find('.stk-refresh-btn').trigger('click')\n"
            )
          }
        }
        if (frameType === 'modal') {
          tempalteEngine.toHtmlgogo.push(
            "    $('#" + value.modalId + "').modal('hide')\n"
          )
          tempalteEngine.toHtmlgogo.push('    }\n')
          tempalteEngine.toHtmlgogo.push('  })\n')
        }
      } else {
        if (frameType === 'modal') {
          tempalteEngine.toHtmlgogo.push(
            "  $('#" + value.modalId + "').modal('hide')\n"
          )
        }
      }
      tempalteEngine.toHtmlgogo.push('})\n')
    }
  }

  function tableDatachangeText(col, text, tempalteEngine) {
    if (col.tableColumnChangeText === 'DB') {
      if (col.tableColumnTextDBWhere === '') {
        col.tableColumnTextDBWhere = undefined
      }
      var isExists = _.find(tempalteEngine.tableColByDB, (value) => {
        return (
          value.table === col.tableColumnTextDBTable &&
          value.text === col.tableColumnTextDBColumnText &&
          value.value === col.tableColumnTextDBColumnValue &&
          value.where === col.tableColumnTextDBWhere
        )
      })
      if (isExists === undefined) {
        var dbMap = {
          table: col.tableColumnTextDBTable,
          text: col.tableColumnTextDBColumnText,
          value: col.tableColumnTextDBColumnValue,
        }
        if (col.tableColumnTextDBWhere) {
          dbMap.where = col.tableColumnTextDBWhere
        }
        tempalteEngine.tableColByDB.push(dbMap)
      }
      var name = ''
      name =
        'get_' +
        col.tableColumnTextDBColumnText +
        '_by_' +
        col.tableColumnTextDBTable
      if (col.tableColumnTextDBWhere) {
        name += '_cond'
      }
      return 'ctx.preCon.' + name + '[' + text + ']'
    } else if (col.tableColumnChangeText === 'user') {
      return col.tableColumnName + 'DataMap[' + text + ']'
    } else {
      return text
    }
  }

  TempalteEngine.prototype.splitWidgetModal = splitWidgetModal

  TempalteEngine.prototype.toHtml = function (conf) {
    // 轉成html
    var tempalteEngine = this
    var htmlCode = []

    clear(tempalteEngine)

    // html起始部分
    htmlCode.push(
      '<section id="widget-grid">\n<!-- row -->\n<div class="row">\n'
    )
    var config = Object.assign({}, conf)

    _.each(config, (val, key) => {
      if (
        val.type === 'select' ||
        val.type === 'setect2' ||
        val.type === 'multipleSelect'
      ) {
        if (val.formSelectBinding) {
          if (val.formId) {
            config[val.formSelectBinding].bindingSelectName =
              "$('#" + val.formId + "')"
          } else if (val.formName) {
            config[val.formSelectBinding].bindingSelectName =
              "$('[name=" + val.formId + "]')"
          } else {
            config[val.formSelectBinding].bindingSelectName =
              "$('[name=" + key + "]')"
          }
          config[val.formSelectBinding].bindingTable = val.formSelectDBTable
          config[val.formSelectBinding].bindingSelectColumn =
            val.formSelectDBColumnValue
          config[val.formSelectBinding].bindingColumn =
            val.formSelectBindingColumn
          console.log(config[val.formSelectBinding])
        }
      }
    })

    var data = splitWidgetModal(config)

    // 加上widget
    _.each(data.widget, function (value) {
      htmlCode.push.apply(htmlCode, drawWidget(value, tempalteEngine, config))
    })

    // 加上modal
    _.each(data.modal, function (value) {
      htmlCode.push.apply(
        htmlCode,
        drawModal(value, tempalteEngine, data.modalWidget, config)
      )
    })

    // html結束部分
    htmlCode.push('</div>\n<!-- end row -->\n</section>\n')

    // 開始gogo
    htmlCode.push('<script>\nGoGoAppFun({\ngogo: function (context) {\n')
    htmlCode.push.apply(htmlCode, this.toHtmlgogo)
    // gogo結束，看有沒有要在util加東西
    htmlCode.push('},\nutil: {')
    htmlCode.push.apply(htmlCode, this.toHtmlutil)
    // util結束，看有沒有要加預先載入的資料
    htmlCode.push('},\npreCondition: {\n')
    getTableTextByDB(this)
    htmlCode.push.apply(htmlCode, this.toHtmlpreCondition)
    // 載完資料，看有沒有要加js
    htmlCode.push('},\ndependencies: [\n')
    htmlCode.push.apply(htmlCode, this.toHtmldependencies)
    // 全部結束囉~~~
    htmlCode.push(']\n})\n</script>')
    return htmlCode.join('')
  }

  TempalteEngine.prototype.html = {
    // 拖拉的html
    widgetFormHtml: _.template(
      '<form class="smart-form" data-id="form<%- ID %>" novalidate="novalidate">' +
        '<fieldset><div class="row"></div></fieldset>' +
        '<footer><button data-id="submit<%- ID %>" class="btn btn-primary">送出</button></footer></form>'
    ),
    modalFormHtml: _.template(
      '<form class="smart-form" data-id="form<%- ID %>" novalidate="novalidate"></form>'
    ),
    modalFooterHtml: _.template(
      '<div class="modal-footer"><button data-id="submit<%- ID %>" type="button" class="btn btn-primary">Save changes</button></div>'
    ),
    widgetTemplate: _.template(
      '<article class="col col-xs-12 col-sm-12 col-md-12 col-lg-12">' +
        '<div data-id="<%- ID %>" data-type="widget" class="jarviswidget jarviswidget-color-darken" data-widget-fullscreenbutton="false" data-widget-togglebutton="false">' +
        '<header>' +
        '<div class="pull-right elementDelete hide" style="margin-right: -1px;margin-top: -7px;">' +
        '<a href="javascript:void(0)"><i class="fa fa-times-circle fa-2x" aria-hidden="true"></i></a></div>' +
        '<span class="widget-icon"> <i class="fa fa-table"></i> </span><h2>Widget Title</h2></header>' +
        '<div><div class="widget-body no-padding"></div></div>' +
        '</div></article>'
    ),
    modalTemplate: _.template(
      '<div id="<%- ID %>" data-id="<%- ID %>" data-type="modal" class="modal-dialog demo-modal"><div class="modal-content">' +
        '<div class="pull-right elementDelete hide" style="margin-right: -8px;margin-top: -13px;">' +
        '<a href="javascript:void(0)"><i class="fa fa-times-circle fa-2x" aria-hidden="true"></i></a></div>' +
        '<div class="modal-header">' +
        '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>' +
        '<h4 class="modal-title">Modal Title</h4></div>' +
        '<div class="modal-body"><div class="row"></div></div></div></div>'
    ),
    textTemplate: _.template(
      '<section class="col col-xs-12 col-sm-12 col-md-4 col-lg-4" data-type="text">' +
        '<div class="pull-right elementDelete hide" style="margin-right: -17px;margin-top: -9px;">' +
        '<a href="javascript:void(0)"><i class="fa fa-times-circle fa-2x" aria-hidden="true"></i></a></div>' +
        '<label class="label">Text Title</label><label class="input">' +
        '<input type="text" data-id="<%- ID %>" name="<%- ID %>" class="form-control"></label></section>'
    ),
    dateTemplate: _.template(
      '<section class="col col-xs-12 col-sm-12 col-md-4 col-lg-4" data-type="date">' +
        '<div class="pull-right elementDelete hide" style="margin-right: -17px;margin-top: -9px;">' +
        '<a href="javascript:void(0)"><i class="fa fa-times-circle fa-2x" aria-hidden="true"></i></a></div>' +
        '<label class="label">Date Title</label><label class="input"><i class="icon-append fa fa-calendar"></i>' +
        '<input type="text" data-id="<%- ID %>" name="<%- ID %>" data-rule-date="true" class="form-control"></label></section>'
    ),
    startEndDateTemplate: _.template(
      '<section class="col col-xs-12 col-sm-12 col-md-4 col-lg-4" data-type="startEndDate">' +
        '<div class="pull-right elementDelete hide" style="margin-right: -17px;margin-top: -9px;">' +
        '<a href="javascript:void(0)"><i class="fa fa-times-circle fa-2x" aria-hidden="true"></i></a></div>' +
        '<div><label class="label">Start Date Title</label><label class="input"><i class="icon-append fa fa-calendar"></i>' +
        '<input type="text" data-id="<%- ID %>start" name="<%- ID %>" data-rule-date="true" class="form-control"></label></div>' +
        '<div><label class="label">End Date Title</label><label class="input"><i class="icon-append fa fa-calendar"></i>' +
        '<input type="text" data-id="<%- ID %>end" name="<%- ID %>" data-rule-date="true" class="form-control"></label></div></section>'
    ),
    selectTemplate: _.template(
      '<section class="col col-xs-12 col-sm-12 col-md-4 col-lg-4" data-type="select">' +
        '<div class="pull-right elementDelete hide" style="margin-right: -17px;margin-top: -9px;">' +
        '<a href="javascript:void(0)"><i class="fa fa-times-circle fa-2x" aria-hidden="true"></i></a></div>' +
        '<label class="label">Select Title</label><label class="input">' +
        '<select data-id="<%- ID %>" name="<%- ID %>" class="form-control"></select></label></section>'
    ),
    select2Template: _.template(
      '<section class="col col-xs-12 col-sm-12 col-md-4 col-lg-4" data-type="select2">' +
        '<div class="pull-right elementDelete hide" style="margin-right: -17px;margin-top: -9px;">' +
        '<a href="javascript:void(0)"><i class="fa fa-times-circle fa-2x" aria-hidden="true"></i></a></div>' +
        '<label class="label">Select2 Title</label><label class="select">' +
        '<select data-id="<%- ID %>" name="<%- ID %>" class="select2 full-width"></select></label></section>'
    ),
    multipleSelectTemplate: _.template(
      '<section class="col col-xs-12 col-sm-12 col-md-4 col-lg-4" data-type="multipleSelect">' +
        '<div class="pull-right elementDelete hide" style="margin-right: -17px;margin-top: -9px;">' +
        '<a href="javascript:void(0)"><i class="fa fa-times-circle fa-2x" aria-hidden="true"></i></a></div>' +
        '<label class="label">MultipleSelect Title</label><label class="select select-multiple">' +
        '<select multiple="multiple" data-id="<%- ID %>" name="<%- ID %>" class="form-control"></select></label></section>'
    ),
    radioTemplate: _.template(
      '<section class="col col-xs-6 col-sm-4 col-md-2 col-lg-2" data-type="radio">' +
        '<div class="pull-right elementDelete hide" style="margin-right: -17px;margin-top: -9px;">' +
        '<a href="javascript:void(0)"><i class="fa fa-times-circle fa-2x" aria-hidden="true"></i></a></div>' +
        '<label class="label">Radio Title</label><div class="inline-group" data-id="<%- ID %>">' +
        '<label class="radio"><input type="radio" data-id="<%- ID %>" name="<%- ID %>" checked><i></i><p>radio1</p></label></div></section>'
    ),
    addradioTemplate: _.template(
      '<label class="radio"><input type="radio" data-id="<%- ID %>" name="<%- ID %>" value="<%- value %>" <%- checked %>><i></i><p><%- text %></p></label>'
    ),
    checkboxTemplate: _.template(
      '<section class="col col-xs-6 col-sm-4 col-md-2 col-lg-2" data-type="checkbox">' +
        '<div class="pull-right elementDelete hide" style="margin-right: -17px;margin-top: -9px;">' +
        '<a href="javascript:void(0)"><i class="fa fa-times-circle fa-2x" aria-hidden="true"></i></a></div>' +
        '<label class="label">Checkbox Title</label><div class="inline-group" data-id="<%- ID %>">' +
        '<label class="checkbox"><input type="checkbox" data-id="<%- ID %>" name="<%- ID %>"><i></i><p>checkbox1</p></label></div></section>'
    ),
    addcheckboxTemplate: _.template(
      '<label class="checkbox"><input data-id="<%- ID %>" name="<%- ID %>" type="checkbox" value="<%- value %>" <%- checked %>><i></i><p><%- text %></p></label>'
    ),
    labelTemplate: _.template(
      '<section class="col col-xs-6 col-sm-4 col-md-2 col-lg-2" data-type="label">' +
        '<div class="pull-right elementDelete hide" style="margin-right: -17px;margin-top: -9px;">' +
        '<a href="javascript:void(0)"><i class="fa fa-times-circle fa-2x" aria-hidden="true"></i></a></div>' +
        '<label data-id="<%- ID %>" id="<%- ID %>" class="labelText"><span>Label Title</span>: <span>Label Text</span></label></section>'
    ),
    hrTemplate: _.template(
      '<section class="col col-xs-12 col-sm-12 col-md-12 col-lg-12 hr-section" data-type="hr">' +
        '<div class="pull-right elementDelete hide" style="margin-right: -17px;margin-top: -9px;">' +
        '<a href="javascript:void(0)"><i class="fa fa-times-circle fa-2x" aria-hidden="true"></i></a></div>' +
        '<hr data-id="<%- ID %>" style="width: 98%;margin: 6px auto;"></section>'
    ),
    CRUDTableTemplate: _.template(
      '<table stk-entity-pk="<%- pks %>" data-id="<%- dataID %>" id="<%- ID %>" data-type="table" class="table table-striped table-bordered table-hover" width="100%">' +
        '<thead><tr></tr><tr></tr></thead></table>'
    ),
    reportTableTemplate: _.template(
      '<table data-id="<%- dataID %>" id="<%- ID %>" data-type="table" class="table table-striped table-bordered table-hover" width="100%">' +
        '<thead><tr></tr><tr></tr></thead></table>'
    ),
    theadFirstTemplate: {
      input: _.template(
        '<th class="hasinput" style="width:<%- width %>%"><input type="text" class="form-control" /></th>'
      ),
      select: _.template(
        '<th class="hasinput" style="width:<%- width %>%"><select class="form-control"></select></th>'
      ),
    },
    theadLastTemplate: _.template('<th><%- titleName %></th>'),
    CRUDTabletbodyTemplate: _.template(
      '<tbody><tr stk-input-template hidden="hidden"></tr></tbody>'
    ),
    tbodyTemplate: {
      input: _.template(
        '<td><input name="<%- name %>" type="text" class="form-control" placeholder="<%- titleName %>" /></td>'
      ),
      select: _.template(
        '<td><select name="<%- name %>" class="form-control" <%- isMultiple %>></select></td>'
      ),
      textarea: _.template(
        '<td><textarea type="text" name="<%- name %>" class="form-control" placeholder="<%- titleName %>" cols="20" rows="5"></textarea></td>'
      ),
      switch: _.template(
        '<td><span><span class="onoffswitch"><input type="checkbox" name="<%- name %>" class="onoffswitch-checkbox" checked="checked" id="isopen-onoffswitch"/>' +
          '<label class="onoffswitch-label" for="isopen-onoffswitch">' +
          '<span class="onoffswitch-inner" data-swchon-text="ON" data-swchoff-text="OFF"></span><span class="onoffswitch-switch"></span>' +
          '</label></span></span></td>'
      ),
    },
    chartTemplate: _.template(
      '<div data-id="<%- ID %>" style="width: <%- width %>; height: <%- height %>;"></div>'
    ),
  }

  TempalteEngine.prototype.setDefaultData = function (type) {
    // 元件預設值
    var defaultData = {
      widget: {
        widgetIcon: '<i class="fa fa-table"></i>',
        widgetTitle: 'Widget Title',
        widgetXsSize: 12,
        widgetSmSize: 12,
        widgetMdSize: 12,
        widgetLgSize: 12,
        widgetForm: false,
        widgetFullsreen: false,
        widgetToggle: false,
      },
      modal: {
        modalTitle: 'Modal Title',
        modalSize: 'md',
        modalForm: false,
      },
      text: {
        formTitle: 'Text Title',
        formValidate: '',
        formValidateInfo: '',
        formValidateMax: '',
        formValidateMin: '',
        formRegDirection: 'positive',
        formRegSpecialChar: false,
        formRegEngNum: false,
        formRegChinese: false,
        formReg1More: false,
      },
      date: {
        formTitle: 'Date Title',
        formDateConfig: 'formDateNone',
      },
      startEndDate: {
        formStartTitle: 'Start Date Title',
        formEndTitle: 'End Date Title',
        formBothToday: false,
        formBothLimit: false,
        formBothLimitDays: '0',
        formSameLine: false,
      },
      select: {
        formTitle: 'Select Title',
      },
      select2: {
        formTitle: 'Select2 Title',
      },
      multipleSelect: {
        formTitle: 'MultipleSelect Title',
        formDefaultAll: false,
      },
      radio: {
        formTitle: 'Radio Title',
      },
      checkbox: {
        formTitle: 'Checkbox Title',
      },
      label: {
        formTitle: 'Label Title',
        formText: 'Label Text',
      },
      hr: {
        formXsSize: 12,
        formSmSize: 12,
        formMdSize: 12,
        formLgSize: 12,
        formOpacity: 1,
      },
      CRUDTable: {
        tableCRUDAvailable: ['ALL', 'create', 'update', 'delete'],
      },
      reportTable: {},
      chart: {},
    }
    _.each(defaultData, function (num, key) {
      if (key === 'radio' || key === 'checkbox' || key === 'label') {
        num.formXsSize = 6
        num.formSmSize = 4
        num.formMdSize = 2
        num.formLgSize = 2
        num.formBindingTableColumn = ''
        if (key !== 'label') {
          num.formCheckBoxRadio = {}
          num.formSameLine = true
        }
      } else if (key === 'CRUDTable' || key === 'reportTable') {
        num.column = {
          column1: {
            tableColumnSearch: 'input',
            tableColumnAlign: 'left',
            tableColumnFormatType: 'text',
            tableColumnDataType: 'text',
            tableColumnTitleName: '控制器廠牌',
            tableColumnName: 'cnc_id',
            tableColumnWidget: '25',
          },
          column2: {
            tableColumnSearch: 'input',
            tableColumnAlign: 'left',
            tableColumnFormatType: 'text',
            tableColumnDataType: 'text',
            tableColumnTitleName: '機台警報代碼',
            tableColumnName: 'alarm_code',
            tableColumnWidget: '25',
          },
          column3: {
            tableColumnSearch: 'input',
            tableColumnAlign: 'left',
            tableColumnFormatType: 'text',
            tableColumnDataType: 'text',
            tableColumnTitleName: '警報名稱',
            tableColumnName: 'alrm_info',
            tableColumnWidget: '25',
          },
          column4: {
            tableColumnSearch: 'input',
            tableColumnAlign: 'left',
            tableColumnFormatType: 'text',
            tableColumnDataType: 'text',
            tableColumnTitleName: '次數',
            tableColumnName: 'count',
            tableColumnWidget: '25',
          },
        }
        if (key === 'CRUDTable') {
          num.column.column1.tableColumnInputType = 'input'
          num.column.column1.tableColumnInputDisabled = 'edit'
          num.column.column2.tableColumnInputType = 'input'
          num.column.column2.tableColumnInputDisabled = 'none'
          num.column.column3.tableColumnInputType = 'input'
          num.column.column3.tableColumnInputDisabled = 'none'
          num.column.column4.tableColumnInputType = 'input'
          num.column.column4.tableColumnInputDisabled = 'none'
          num.tableCRUDEditModal = ''
        } else if (key === 'reportTable') {
          num.chartExists = false
          num.tableExport = false
          num.column.column1.tableColumnChangeText = 'none'
          num.column.column2.tableColumnChangeText = 'none'
          num.column.column3.tableColumnChangeText = 'none'
          num.column.column4.tableColumnChangeText = 'none'
        }
        num.tableDataFromApp = 'DevTool'
        num.tableDataFromFile = 'dataExample'
        num.tableDataFrom = 'file'
        num.tableOrderColumn = 0
        num.tableOrderType = 'asc'
        num.tableCustomerBtn = {}
      } else if (key !== 'widget' && key !== 'modal' && key !== 'hr') {
        num.formXsSize = 12
        num.formSmSize = 12
        num.formMdSize = 4
        num.formLgSize = 4
        num.formRequired = false
        num.formBindingTableColumn = ''
        if (key === 'startEndDate') {
          num.formStartId = ''
          num.formStartName = ''
          num.formEndId = ''
          num.formEndName = ''
        } else {
          num.formId = ''
          num.formName = ''
        }
        if (key === 'select' || key === 'select2' || key === 'multipleSelect') {
          num.formSelectBy = 'user'
          num.formSelectDBTable = ''
          num.formSelectDBColumnText = ''
          num.formSelectDBColumnValue = ''
          num.formSelectDBWhere = ''
          num.formSelectQuantity = ''
          num.formSelectElement = {}
        }
      }
    })
    return defaultData[type]
  }

  TempalteEngine.prototype.getReportData = function (rep, criteriaData) {
    // 過濾檔案來源的reporttable
    var noIndexToCompare = true
    var infomation = []
    var newCriteriaData = rep.data
    var groupCriteriaData = _.groupBy(criteriaData, function (num) {
      return num.bindingColumn
    })
    _.each(groupCriteriaData, function (cData, key) {
      if (key) {
        var noIndex = true
        infomation = []
        _.each(cData, function (num) {
          _.each(newCriteriaData, function (elem) {
            noIndex = true
            var index = _.indexOf(rep.head, num.bindingColumn)
            if (index >= 0) {
              if (_.isArray(num.value)) {
                if (num.type === 'startEndDate') {
                  if (
                    moment(new Date(elem[index])).isAfter(
                      new Date(num.value[0] + ' 00:00:00')
                    ) &&
                    moment(new Date(num.value[1] + ' 23:59:59')).isAfter(
                      new Date(elem[index])
                    )
                  ) {
                    infomation.push(elem)
                  }
                } else {
                  if (num.value.length > 0) {
                    var hasValue = _.find(num.value, function (value) {
                      return elem[index] === value
                    })
                    if (hasValue) {
                      infomation.push(elem)
                    }
                  } else {
                    infomation.push(elem)
                  }
                }
              } else {
                if (num.type === 'date') {
                  if (
                    moment(new Date(elem[index])).format('YYYY/MM/DD') ===
                    moment(new Date(num.value)).format('YYYY/MM/DD')
                  ) {
                    infomation.push(elem)
                  }
                } else {
                  if (elem[index] === num.value) {
                    infomation.push(elem)
                  }
                }
              }
              noIndex = false
            }
            noIndexToCompare = false
          })
        })
        if (!noIndex) {
          newCriteriaData = infomation
        }
      }
    })
    if (!noIndexToCompare) {
      rep.data = _.uniq(newCriteriaData)
    }
    _.each(rep.data, (elem, key) => {
      _.each(elem, (value, count) => {
        if (rep.format[count] === '%') {
          rep.data[key][count] = value + '%'
        } else if (Number.isFinite(rep.format[count])) {
          if (Number.isFinite(parseFloat(value))) {
            var num = new Number(parseFloat(value))
            rep.data[key][count] = num.toFixed(rep.format[count])
          }
        } else if (rep.format[count] === 'time') {
          var time = new Date(value)
          if (time.toString() === 'Invalid Date') {
            rep.data[key][count] = '---'
          } else {
            rep.data[key][count] = moment(time).format('YYYY/MM/DD HH:mm:ss')
          }
        }
      })
    })
    return rep
  }

  function setupTempalteEngine() {
    return new TempalteEngine()
  }

  global.createTempalteEngine = setupTempalteEngine
})(this, $, _)
