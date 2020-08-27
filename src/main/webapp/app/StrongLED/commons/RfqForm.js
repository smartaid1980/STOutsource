class RfqColumn {
  constructor(columnConfig, columnId, columnSubid, columnName, isFillOptions) {
    this.i18n = columnSubid || i18n(columnConfig.i18n)
    this.config = columnConfig
    this.columnId = columnId
    this.columnSubid = columnSubid
    this.htmlType = columnConfig.htmlType
    switch (this.htmlType) {
      case 'custom':
        this.customHtml(columnConfig, columnId, columnSubid, columnName)
        break
      case 'list_custom':
        this.listCustomHtml(
          columnConfig,
          columnId,
          columnSubid,
          columnName,
          isFillOptions
        )
        break
      case 'list':
        this.listHtml(columnConfig, columnId, columnSubid, columnName)
        break
      case 'radio':
        this.radioHtml(columnConfig, columnId)
        break
    }
  }
  getValue() {
    let value
    switch (this.htmlType) {
      case 'custom':
        value = this.$value.find('input').val()
        break
      case 'list_custom':
        value = this.$value.find('select').val()
        value =
          value === 'custom'
            ? this.$value.find('input').val()
            : this.$value.find('select').val()
        break
      case 'list':
        value = this.$value.find('select').val()
        break
      case 'radio':
        value = this.$value.find(':checked').val()
        break
    }
    return value
  }
  setValue(value) {
    let options, isInList
    if (!value) return this.setEmptyValue()
    switch (this.htmlType) {
      case 'custom':
        this.$value.find('input').val(value)
        break
      case 'list_custom':
        options = this.options
        if (options) {
          isInList = _.isArray(options)
            ? options.includes(value)
            : Object.keys(options).includes(value)
          if (isInList) {
            this.$value
              .removeClass('custom')
              .find('select')
              .val(value)
              .next()
              .val('')
          } else {
            this.$value
              .addClass('custom')
              .find('select')
              .val('custom')
              .next()
              .val(value)
          }
        } else {
          this.$value
            .addClass('custom')
            .find('select')
            .val('custom')
            .next()
            .val(value)
        }
        break
      case 'list':
        this.$value.find('select').val(value)
        break
      case 'radio':
        this.$value.find(`input[value=${value}]`).prop('checked', true)
        break
    }
    return this
  }
  toggleCustomOrList(isCustom) {
    const $select = this.$value.find('select')
    this.$value.toggleClass('custom', isCustom)

    if (isCustom && $select.hasClass('required')) {
      $select.removeClass('required').next().addClass('required')
    } else if (!isCustom && $select.next().hasClass('required')) {
      $select.addClass('required').next().removeClass('required')
    }
    if (isCustom) $select.val('custom')
    $select.next().val('')
    return this
  }
  setOptions(givenOptions, defaultValue) {
    if (!['radio', 'custom'].includes(this.htmlType)) {
      let options = givenOptions || this.config.options || []
      const isArray = _.isArray(options)
      this.$value
        .find('select')
        .html(
          _.reduce(
            options,
            (a, value, key) =>
              a + `<option value="${isArray ? value : key}">${value}</option>`,
            ''
          )
        )
      if (this.htmlType === 'list_custom')
        this.$value
          .find('select')
          .append(`<option value="custom">${i18n('Custom')}</option>`)
      this.options = options
    }
    if (defaultValue !== undefined) {
      this.setValue('')
    }
    return this
  }
  setEmptyValue() {
    switch (this.htmlType) {
      case 'custom':
        this.$value.find('input').val('')
        break
      case 'list_custom':
        this.$value.removeClass('custom').find('select').val('').next().val('')
        break
      case 'list':
        this.$value.find('select').val('')
        break
      case 'radio':
        this.$value.find('input').prop('checked', false)
        break
    }
    return this
  }
  setDefaultValue() {
    if (this.htmlType === 'radio' && this.config.isTF) {
      this.setValue(
        this.config.default !== undefined
          ? this.config.default
            ? '是'
            : '否'
          : ''
      )
    } else {
      this.setValue(
        this.config.default !== undefined
          ? this.config.options[this.config.default]
          : ''
      )
    }
  }
  toggle(isShow) {
    this.$label.toggle(isShow)
    this.$value.toggle(isShow)
    return this
  }
  show() {
    this.$label.show()
    this.$value.show()
    return this
  }
  hide() {
    this.$label.hide()
    this.$value.hide()
    return this
  }
  change(tag) {
    if (tag) {
      this.$value.find(tag).change()
    } else if (this.htmlType === 'list_custom') {
      this.$value
        .find(this.options.includes(this.getValue()) ? 'select' : 'input')
        .change()
    } else if (this.htmlType === 'list') {
      this.$value.find('select').change()
    } else if (this.htmlType === 'custom') {
      this.$value.find('input').change()
    } else if (this.htmlType === 'radio') {
      this.$value.find('radio').change()
    }

    return this
  }
  toggleDisable(isDisable) {
    // this.$label.prop('disabled', isDisable)
    if (this.htmlType === 'radio') {
      this.$value
        .find('.radio')
        .toggleClass('state-disabled', isDisable)
        .find('input')
        .prop('disabled', isDisable)
    } else {
      this.$value.find('select').prop('disabled', isDisable)
      this.$value.find('input').prop('disabled', isDisable)
    }
    return this
  }
  listHtml(columnConfig, columnId, columnSubid, columnName) {
    this.$label = $(
      `<label class="col col-lg-2 item ${
        columnConfig.required ? 'st-required' : ''
      }">${columnName || i18n(columnConfig.i18n)}</label>`
    )
    this.$value = $(`<div class="col col-lg-4 value" data-column-type="list" data-column="${
      columnId + (columnSubid ? '-' + columnSubid : '')
    }">
      <select name="${
        columnId + (columnSubid ? '-' + columnSubid : '')
      }" class="form-control only-list ${
      columnConfig.required ? 'required' : ''
    }"></select>
    </div>`)
  }
  listCustomHtml(
    columnConfig,
    columnId,
    columnSubid,
    columnName,
    isFillOptions
  ) {
    let options = ''
    if (isFillOptions && !_.isEmpty(columnConfig.options)) {
      let isArray = _.isArray(columnConfig.options)
      this.options = columnConfig.options
      options =
        _.reduce(
          columnConfig.options,
          (a, value, key, colleciton) => {
            return (
              a + `<option value="${isArray ? value : key}">${value}</option>`
            )
          },
          ''
        ) +
        '<option value="custom">' +
        i18n('Custom') +
        '</option>'
    }
    this.$label = $(
      `<label class="col col-lg-2 item ${
        columnConfig.required ? 'st-required' : ''
      }">${columnName || i18n(columnConfig.i18n)}</label>`
    )
    this.$value = $(`<div class="col col-lg-4 value" data-column-type="list_custom" data-column="${
      columnId + (columnSubid ? '-' + columnSubid : '')
    }">
      <select name="${
        columnId + (columnSubid ? '-' + columnSubid : '')
      }-1" class="form-control customizable ${
      columnConfig.required ? 'required' : ''
    }">
        ${options}
      </select>
      <input name="${
        columnId + (columnSubid ? '-' + columnSubid : '')
      }-2" type="text" 
        class="form-control ${
          columnConfig.validationClass
            ? columnConfig.validationClass.join(' ')
            : ''
        }" 
        ${
          columnConfig.maxLength
            ? 'data-rule-maxlength="' + columnConfig.maxLength + '"'
            : ''
        }>
    </div>`)
  }
  customHtml(columnConfig, columnId, columnSubid, columnName) {
    this.$label = $(
      `<label class="col col-lg-2 item ${
        columnConfig.required ? 'st-required' : ''
      }">${columnName || i18n(columnConfig.i18n)}</label>`
    )
    this.$value = $(`<div class="col col-lg-4 value" data-column-type="custom" data-column="${
      columnId + (columnSubid ? '-' + columnSubid : '')
    }">
      <input name="${
        columnId + (columnSubid ? '-' + columnSubid : '')
      }" type="text" 
        class="form-control ${columnConfig.required ? 'required' : ''} ${
      columnConfig.validationClass ? columnConfig.validationClass.join(' ') : ''
    }"
        ${
          columnConfig.maxLength
            ? 'data-rule-maxlength="' + columnConfig.maxLength + '"'
            : ''
        }>
    </div>`)
  }
  radioHtml(columnConfig, columnId) {
    if (columnConfig.isTF) {
      this.$label = $(
        `<label class="col col-lg-2 item ${
          columnConfig.required ? 'st-required' : ''
        }">${i18n(columnConfig.i18n)}</label>`
      )
      this.$value = $(`<div class="col col-lg-4 value smart-form" data-column-type="radio" data-column="${columnId}">
        <div class="inline-group">
          <label class="radio">
            <input type="radio" name="${columnId}" value="是" class="${
        columnConfig.required ? 'required' : ''
      }">
            <i></i>是</label>
          <label class="radio">
            <input type="radio" name="${columnId}" value="否">
            <i></i>否</label>
        </div>
      </div>`)
    }
  }
}
class RfqSubGroup {
  constructor(columnConfig, columnId) {
    this.htmlType = columnConfig.htmlType
    this.columnConfig = columnConfig
    this.columnId = columnId
    this.i18n = i18n(this.columnConfig.i18n)
    this.$container = $(`<div class="subgroup" data-column="${this.columnId}" style="display:none;">
      <div class="row">
        <label class="col col-lg-2 item group-subtitle">${this.i18n}</label>
      </div>
    </div>`)
    this.subIds
    this.subColumns
  }
  setColumns(subIds) {
    this.subIds = subIds
    this.subColumns = {}
    this.removeColumns()
    let $row
    this.subIds.forEach((subId, i) => {
      if (!(i % 2)) $row = $('<div class="row"></div>')
      this.subColumns[subId] = new RfqColumn(
        this.columnConfig,
        this.columnId,
        subId,
        subId,
        true
      )
      $row
        .append(this.subColumns[subId].$label)
        .append(this.subColumns[subId].$value)
      if (i % 2) this.$container.append($row)
    })
    if (subIds.length % 2) this.$container.append($row)
    return this
  }
  removeColumns() {
    this.$container.children(':first').siblings().remove()
  }
  getValue() {
    let value = [],
      subValue,
      hasEmptySubValue = false
    if (!this.subIds) return ''
    this.subIds.map((id) => {
      subValue = this.subColumns[id].getValue()
      value.push(id + '=' + (subValue || ''))
      if (!subValue) hasEmptySubValue = true
    })
    return { value: value.join('&'), hasEmptySubValue }
  }
  setValue(value) {
    // this.setColumns(value.split('&').map(s => s.split('=')[0]))
    if (value) {
      value.split('&').forEach((v) => {
        const subValue = v.split('=')[1],
          subId = v.split('=')[0]
        this.subColumns[subId].setValue(subValue).change()
      })
    } else if (this.subColumns) {
      Object.values(this.subColumns).forEach((col) => col.setValue('').change())
    }
  }
  toggle(isShow) {
    this.$container.toggle(isShow)
  }
}
class RfqForm {
  constructor(config, containerSelector) {
    this.config = config
    this.containerSelector = containerSelector
    this.$container = $(containerSelector)
    this.columnsMap = {}
    this.subGroupMap = {}
    this.initColumns()
  }
  initColumns() {
    let $form = []
    this.config.order.forEach((row) => {
      let isGroup = !_.isArray(row)
      if (isGroup) {
        let title = i18n(row.title),
          subRow = row.row,
          $group = $(`<div class="group">
          <div class="row">
            <label class="col col-lg-2 item group-title">${title}</label>
          </div></div>`)

        subRow.forEach((r) => {
          // subgroup
          if (typeof r === 'string') {
            this.subGroupMap[r] = new RfqSubGroup(this.config[r], r)
            $group.append(this.subGroupMap[r].$container)
          }
          // row
          else {
            let $row = $('<div class="row"></div>')
            r.forEach((id) => {
              let $column = new RfqColumn(this.config[id], id)
              this.columnsMap[id] = $column
              $row.append($column.$label).append($column.$value)
            })
            $group.append($row)
          }
        })
        $form.push($group)
      } else {
        let $row = $('<div class="row"></div>')
        row.forEach((id) => {
          let $column = new RfqColumn(this.config[id], id)
          this.columnsMap[id] = $column
          $row.append($column.$label).append($column.$value)
        })
        $form.push($row)
      }
    })
    $form.forEach((f) => this.$container.append(f))
  }
  setValue(map) {
    let isNull
    _.flatten(this.config.order.map((x) => (_.isArray(x) ? x : x.row))).forEach(
      (columnId) => {
        isNull = !Object.prototype.hasOwnProperty.call(map, columnId)
        if (Object.prototype.hasOwnProperty.call(this.columnsMap, columnId)) {
          this.columnsMap[columnId]
            .setValue(isNull ? '' : map[columnId])
            .change()
        }
        if (Object.prototype.hasOwnProperty.call(this.subGroupMap, columnId)) {
          this.subGroupMap[columnId].setValue(isNull ? '' : map[columnId])
        }
      }
    )
  }
  getValue() {
    let result = {},
      value,
      isVisible
    for (var key in this.columnsMap) {
      value = this.columnsMap[key].getValue()
      isVisible = this.columnsMap[key].$value.is(':visible')
      if (value && isVisible) {
        result[key] = value
      }
    }
    for (key in this.subGroupMap) {
      value = this.subGroupMap[key].getValue()
      isVisible = this.subGroupMap[key].$container.is(':visible')
      if ((!value.hasEmptySubValue && isVisible) || key === 'light_brand') {
        result[key] = value.value
      }
    }
    return result
  }
  setDefaultState() {
    for (var columnId in this.columnsMap) {
      this.columnsMap[columnId].setDefaultValue()
    }
    for (var subColumnId in this.subGroupMap) {
      this.subGroupMap[subColumnId].toggle(false)
    }
  }
}
class RfqViewColumn {
  constructor(columnConfig, columnId, columnSubid, columnName) {
    this.i18n = columnSubid || i18n(columnConfig.i18n)
    this.config = columnConfig
    this.columnId = columnId
    this.columnSubid = columnSubid
    this.init()
  }
  init() {
    this.$label = $(
      `<div class="col col-lg-2 col-md-2 col-sm-2 item">${this.i18n}</div>`
    )
    this.$value = $(
      `<div class="col col-lg-3 col-md-4 col-sm-4 value" data-column="${
        this.columnSubid || this.columnId
      }"></div>`
    )
  }
  setValue(value) {
    this.$value.text(value)
    return this
  }
  toggle(isShow) {
    this.$label.toggle(isShow)
    this.$value.toggle(isShow)
    return this
  }
  show() {
    this.$label.show()
    this.$value.show()
    return this
  }
  hide() {
    this.$label.hide()
    this.$value.hide()
    return this
  }
}
class RfqViewSubGroup {
  constructor(columnConfig, columnId) {
    this.columnConfig = columnConfig
    this.columnId = columnId
    this.i18n = i18n(this.columnConfig.i18n)
    this.$container = $(`<div class="subgroup" data-column="${this.columnId}">
      <div class="row">
        <label class="col col-lg-2 item group-subtitle">${this.i18n}</label>
      </div>
    </div>`)
    this.subIds
    this.subColumns
  }
  setColumns(subIds) {
    this.subIds = subIds
    this.subColumns = {}
    this.removeColumns()
    let $row
    this.subIds.forEach((subId, i) => {
      if (!(i % 2)) $row = $('<div class="row"></div>')
      this.subColumns[subId] = new RfqViewColumn(
        this.columnConfig,
        this.columnId,
        subId,
        subId
      )
      $row
        .append(this.subColumns[subId].$label)
        .append(this.subColumns[subId].$value)
      if (i % 2) this.$container.append($row)
    })
    if (subIds.length % 2) this.$container.append($row)
  }
  removeColumns() {
    this.$container.children(':first').siblings().remove()
  }
  setValue(value) {
    this.setColumns(value.split('&').map((s) => s.split('=')[0]))
    value.split('&').forEach((v) => {
      const subValue = v.split('=')[1],
        subId = v.split('=')[0]
      this.subColumns[subId].setValue(subValue)
    })
  }
  toggle(isShow) {
    this.$container.toggle(isShow)
  }
}
class RfqView {
  constructor(config, containerSelector) {
    this.$container = $(containerSelector)
    this.containerSelector = containerSelector
    this.config = config
    this.columnsMap = {}
    this.subGroupMap = {}
    this.initColumns()
  }
  initColumns() {
    let $form = []

    this.config.order.forEach((row) => {
      let isGroup = !_.isArray(row)

      if (isGroup) {
        let title = i18n(row.title),
          subRow = row.row,
          $group = $(`<div class="group">
        <div class="row">
          <label class="col col-lg-2 col-md-2 col-sm-2 item group-title">${title}</label>
        </div></div>`)
        subRow.forEach((r) => {
          if (typeof r === 'string') {
            this.subGroupMap[r] = new RfqViewSubGroup(this.config[r], r)
            $group.append(this.subGroupMap[r].$container)
          } else {
            let $row = $(`<div class="row"></div>`)
            r.forEach((id) => {
              let $column = new RfqViewColumn(this.config[id], id)
              this.columnsMap[id] = $column
              $row.append($column.$label).append($column.$value)
            })
            if (r.length % 2)
              $row.append(`<div class="col col-lg-2 col-md-2 col-sm-2"></div>
            <div class="col col-lg-3 col-md-4 col-sm-4"></div>`)
            $group.append($row)
          }
        })
        $form.push($group)
      } else {
        let $row = $(`<div class="row"></div>`)
        row.forEach((id) => {
          let $column = new RfqViewColumn(this.config[id], id)
          this.columnsMap[id] = $column
          $row.append($column.$label).append($column.$value)
        })
        if (row.length % 2)
          $row.append(`<div class="col col-lg-2 col-md-2 col-sm-2"></div>
        <div class="col col-lg-3 col-md-4 col-sm-4"></div>`)
        $form.push($row)
      }
    })
    $form.forEach((row) => this.$container.append(row))
  }
  setValue(map) {
    let isNull
    _.flatten(this.config.order.map((x) => (_.isArray(x) ? x : x.row))).forEach(
      (columnId) => {
        isNull = !Object.prototype.hasOwnProperty.call(map, columnId)
        if (Object.prototype.hasOwnProperty.call(this.columnsMap, columnId)) {
          this.columnsMap[columnId].setValue(isNull ? '' : map[columnId])
        }
        if (Object.prototype.hasOwnProperty.call(this.subGroupMap, columnId)) {
          this.subGroupMap[columnId].setValue(isNull ? '' : map[columnId])
        }
      }
    )
  }
}
const getAllRuleMap = () => {
  const getJsonFile = (path, fileName) => {
    return new Promise((res) => {
      const timestamp = new Date().getTime()
      $.get(path + fileName + '?' + timestamp, (data) => {
        res(data)
      })
    })
  }
  const path = './app/StrongLED/data/'
  const mapNames = [
    'lightAngleMap',
    'rfqColumnConfig',
    'lampTypeMap',
    'colorTempMap',
    'brandModelTempMtlMap',
  ]
  const allPromises = mapNames.map((name) => getJsonFile(path, name + '.json'))

  mapNames.push('seriesModelMap')
  allPromises.push(
    new Promise((res) => {
      servkit.ajax(
        {
          url: 'api/getdata/db',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
            table: 'a_strongled_rfq_columns',
            columns: ['series', 'model'],
          }),
        },
        {
          success(data) {
            let series
            let model
            const result = data.reduce((a, map) => {
              series = map.series
              model = map.model
              if (a[series]) {
                a[series].push(model)
              } else {
                a[series] = [model]
              }
              return a
            }, {})
            res(result)
          },
        }
      )
    })
  )

  return Promise.all(allPromises).then((data) => {
    return Object.fromEntries(data.map((map, i) => [mapNames[i], map]))
  })
}
const bindRfqColumnEvent = (ruleMaps, containerSelector, rfqForm) => {
  const toggleColumn = function (columnId, isShow) {
      if (Object.prototype.hasOwnProperty.call(rfqForm.columnsMap, columnId))
        rfqForm.columnsMap[columnId].toggle(isShow)
      else if (
        Object.prototype.hasOwnProperty.call(rfqForm.subGroupMap, columnId)
      )
        rfqForm.subGroupMap[columnId].toggle(isShow)
    },
    toggleDisableColumn = function (columnId, isDisable) {
      return rfqForm.columnsMap[columnId].toggleDisable(isDisable)
    },
    toggleCustomOrList = (isCustom, $select) => {
      $select.parent().toggleClass('custom', isCustom)

      if (isCustom && $select.hasClass('required')) {
        $select.removeClass('required').next().addClass('required')
      } else if (!isCustom && $select.next().hasClass('required')) {
        $select.addClass('required').next().removeClass('required')
      }

      $select.next().val('').keyup()
    },
    renderSubColumns = (columnId, subColumnIds) => {
      return rfqForm.subGroupMap[columnId].setColumns(subColumnIds)
    },
    lightAngleHandler = () => {
      let rfqValue = {
          composition: rfqForm.columnsMap['composition'].getValue(),
          control_way: rfqForm.columnsMap['control_way'].getValue(),
          lamp_length: rfqForm.columnsMap['lamp_length'].getValue(),
          lamp_bead_number: rfqForm.columnsMap['lamp_bead_number'].getValue(),
          model_number: rfqForm.columnsMap['model_number'].getValue(),
        },
        currentMap,
        field,
        angleOptions
      const lightAngleMap = ruleMaps.lightAngleMap

      currentMap = lightAngleMap
      field = currentMap.field
      while (field && rfqValue[field] && currentMap[rfqValue[field]]) {
        currentMap = currentMap[rfqValue[field]]
        field = currentMap.field
      }
      if (_.isArray(currentMap)) {
        angleOptions = currentMap
        rfqForm.columnsMap['angle_claim'].show()
        rfqForm.columnsMap['angle_claim'].setOptions(angleOptions)
      } else {
        rfqForm.columnsMap['angle_claim'].hide()
      }
    },
    compositionCoefHandler = () => {
      const lamp_bead_number = parseInt(
          rfqForm.columnsMap['lamp_bead_number'].getValue()
        ),
        elementsMap = {
          'W': 1,
          'W(N+L)': 2,
          'RGB': 1,
          'RGB+W': 2,
          '2RGB+W': 3,
          'RGBW': 1,
          'R+G+B+W': 4,
        },
        composition = rfqForm.columnsMap['composition'].getValue()
      if (lamp_bead_number && composition) {
        rfqForm.columnsMap['composition_coef'].setValue(
          parseInt(lamp_bead_number / elementsMap[composition]) || ''
        )
      } else {
        rfqForm.columnsMap['composition_coef'].setValue('')
      }
    },
    lampBeadsCompositionHandler = () => {
      let composition = rfqForm.columnsMap['composition'].getValue(),
        composition_coef = rfqForm.columnsMap['composition_coef'].getValue(''),
        matchResult
      if (composition_coef && composition) {
        matchResult = composition.match(/\((.*?)\)/)
        composition = matchResult ? matchResult[1] : composition
        rfqForm.columnsMap['lamp_beads_composition'].setValue(
          composition
            .split('+')
            .map((s) => {
              let coef = s.match(/(\d+)(.+)/),
                hasCoef = coef !== null

              return (
                (hasCoef ? parseInt(coef[1]) : 1) * composition_coef +
                (hasCoef ? coef[2] : s)
              )
            })
            .join('+')
        )
      } else {
        rfqForm.columnsMap['lamp_beads_composition'].setValue('')
      }
    },
    colorTempSetColumns = (composition) => {
      // 影響色溫值欄位數
      const columnId = 'color_temperature'
      // const singlePowerClass = getSinglePowerClass();
      // const options = singlePowerClass ? ruleMaps.colorTempMap[singlePowerClass] : [];
      let subColumnIds

      if (composition === 'W(N+L)') {
        // N, L 兩個欄位
        subColumnIds = ['L', 'N']
        renderSubColumns(columnId, subColumnIds)
        // subColumnIds.forEach(subColumnId => rfqForm.subGroupMap[columnId].subColumns[subColumnId].setOptions(options).change());
        rfqForm.subGroupMap[columnId].toggle(true)
      } else if (/w/i.test(composition)) {
        // W 一個欄位
        subColumnIds = ['W']
        renderSubColumns(columnId, subColumnIds)
        // subColumnIds.forEach(subColumnId => rfqForm.subGroupMap[columnId].subColumns[subColumnId].setOptions(options).change());
        rfqForm.subGroupMap[columnId].toggle(true)
      } else {
        // hide
        rfqForm.subGroupMap[columnId].toggle(false)
      }
    },
    colorTempSetOptions = () => {
      const columnId = 'color_temperature'
      const singlePowerClass = getSinglePowerClass()
      const composition = rfqForm.columnsMap['composition'].getValue()
      const model_number = rfqForm.columnsMap['model_number'].getValue()
      const ruleMap = ruleMaps.colorTempMap
      const getOptions = ({
        ruleMap,
        singlePowerClass,
        composition,
        model_number,
      }) => {
        let result = []
        const canParseRule =
          singlePowerClass &&
          composition &&
          composition !== 'RGB' &&
          ruleMap[singlePowerClass]
        if (canParseRule) {
          const lamp_bead_type = composition === 'RGBW' ? 'RGBW' : 'W'
          let currentMap = ruleMap[singlePowerClass][lamp_bead_type]
          const hasModelNumber = currentMap.field === 'model_number'
          if (hasModelNumber) {
            const isOthers = currentMap[model_number] === undefined
            currentMap = currentMap[isOthers ? 'others' : model_number]
          }
          for (let key in currentMap) {
            if (key === 'field') {
              continue
            }
            result = result.concat(currentMap[key])
          }
          result = _.uniq(result).sort()
        }
        return result
      }
      _.forEach(rfqForm.subGroupMap[columnId].subColumns, (subColumn) => {
        const defaultValue = ''
        subColumn.setOptions(
          getOptions({
            ruleMap,
            singlePowerClass,
            composition,
            model_number,
          }),
          defaultValue
        )
      })
    },
    colorTempFilterOptions = () => {
      const colorTemp = rfqForm.subGroupMap['color_temperature'].subColumns[
        'L'
      ].getValue()
      // TODO: ruleMap中色溫下一層是品牌(原本的excel沒有，原本色溫是直接對型號)，若同一個品牌可以對到不同型號可能要調整下方邏輯
      const getOptions = (colorTemp) => {
        const brandAvailable = []
        const availableOptions = []
        const singlePowerClass = getSinglePowerClass()
        const composition = rfqForm.columnsMap['composition'].getValue()
        const model_number = rfqForm.columnsMap['model_number'].getValue()
        const ruleMap = ruleMaps.brandModelTempMtlMap
        const canParseRule =
          singlePowerClass &&
          composition &&
          composition !== 'RGB' &&
          ruleMap[singlePowerClass]
        if (canParseRule) {
          let lamp_bead_type = composition === 'RGBW' ? 'RGBW' : 'W'
          let currentMap = ruleMap[singlePowerClass][lamp_bead_type]
          const hasFieldModelNumber = currentMap.field === 'model_number'
          if (hasFieldModelNumber) {
            const isOthers = !Object.prototype.hasOwnProperty.call(
              currentMap,
              model_number
            )
            currentMap = currentMap[isOthers ? 'others' : model_number]
          }
          _.each(currentMap[colorTemp], (value, key) => {
            if (key !== 'field') {
              brandAvailable.push(key)
            }
          })
          let isTempSuitBrand, brandsSuitTemp
          _.each(currentMap, (value, key) => {
            brandsSuitTemp = _.reduce(
              value,
              (a, modelMap, brand) => {
                if (brand !== 'field') {
                  a.push(brand)
                }
                return a
              },
              []
            )
            isTempSuitBrand =
              _.intersection(brandsSuitTemp, brandAvailable).length > 0
            if (key !== colorTemp && key !== 'field' && isTempSuitBrand) {
              availableOptions.push(key)
            }
          })
        }
        return availableOptions
      }
      rfqForm.subGroupMap['color_temperature'].subColumns['N'].setOptions(
        getOptions(colorTemp),
        ''
      )
      // colorTempSetOptions(getModelAvailable(colorTemp), colorTemp);
    },
    lampBrandSetColumns = (composition) => {
      if (composition === '') {
        rfqForm.subGroupMap['light_brand'].toggle(false)
        return
      }
      const subColumnIdsMap = {
          'W': ['W'],
          'W(N+L)': ['W'],
          'RGB': ['RGB'],
          'RGB+W': ['RGB', 'W'],
          '2RGB+W': ['RGB', 'W'],
          'RGBW': ['RGBW'],
          'R+G+B+W': ['R', 'G', 'B', 'W'],
        },
        modelList = [],
        subColumnIds = subColumnIdsMap[composition].reduce((a, x) => {
          a.push(x + '_品牌')
          a.push(x + '_型号')
          modelList.push(x + '_型号')
          return a
        }, [])
      renderSubColumns('light_brand', subColumnIds)
      modelList.forEach((model) =>
        rfqForm.subGroupMap['light_brand'].subColumns[model]
          .toggleDisable(true)
          .setOptions([''])
      )
      // setLampBrandOptions(subColumnIdsMap[composition]);
      rfqForm.subGroupMap['light_brand'].toggle(true)
    },
    setLampBrandOptions = (origSubColumnIds = []) => {
      const subColumnIds = origSubColumnIds.map((id) => id.replace(/_.+/, ''))
      const singlePowerClass = getSinglePowerClass()
      const model_number = rfqForm.columnsMap['model_number'].getValue()
      const color_temperature = rfqForm.subGroupMap[
        'color_temperature'
      ].getValue()
      const getOptions = ({
        lamp_bead_type,
        singlePowerClass,
        color_temperature,
        model_number,
      }) => {
        const ruleMap = ruleMaps.brandModelTempMtlMap
        const fieldValueMap = {
          single_power_class: singlePowerClass,
          lamp_bead_type: lamp_bead_type,
          color_temperature: color_temperature,
          model_number: model_number,
        }
        let currentMap = ruleMap
        let currentField
        let fieldValue
        let brandMap = {
          进口不指定: [''],
          国产: [''],
          CREE: [''],
          OSRAM: [''],
          LUMI: [''],
        }
        currentField = currentMap.field
        fieldValue = fieldValueMap[currentField]
        while (currentMap && currentField !== 'lamp_bead_brand') {
          if (currentField === 'model_number') {
            const isOthers = !Object.prototype.hasOwnProperty.call(
              currentMap,
              fieldValue
            )
            currentMap = currentMap[isOthers ? 'others' : fieldValue]
          } else if (currentField === 'color_temperature') {
            if (fieldValue.hasEmptySubValue) {
              return brandMap
            } else {
              fieldValue = fieldValue.value
                .split('&')
                .map((temp) => temp.split('=')[1])
              const possibleBrand = fieldValue.map((temp) =>
                Object.keys(currentMap[temp]).filter(
                  (model) => model !== 'field'
                )
              )
              // 因為色溫已經篩選過選項，理論上交集至少會有一個品牌
              currentMap = _.chain(
                _.intersection(...possibleBrand)
                // .reduce((a, brand) => {
                //   a[brand] = {};
                //   return a;
                // }, {})
              )
                .reduce(
                  (a, brand) => {
                    fieldValue.forEach((temp) => {
                      if (
                        Object.prototype.hasOwnProperty.call(
                          currentMap[temp],
                          brand
                        )
                      ) {
                        if (a[brand]) {
                          a[brand] = _.extend(a[brand], currentMap[temp][brand])
                        } else {
                          a[brand] = _.extend({}, currentMap[temp][brand])
                        }
                      }
                    })
                    return a
                  },
                  { field: 'lamp_bead_brand' }
                )
                .value()
            }
          } else {
            currentMap = currentMap[fieldValue]
          }
          if (!currentMap) {
            return brandMap
          }
          currentField = currentMap.field
          fieldValue = fieldValueMap[currentField]
        }
        if (currentMap) {
          brandMap = {}
          _.each(currentMap, (value, key) => {
            if (key !== 'field') {
              brandMap[key] = _.reduce(
                value,
                (a, mtlMap, model) => {
                  if (model !== 'field') {
                    a.push(model)
                  }
                  return a
                },
                []
              )
            }
          })
        }
        return brandMap
      }
      let brandMap
      if (!singlePowerClass) {
        return
      }
      subColumnIds.forEach((subColumnId) => {
        brandMap = getOptions({
          lamp_bead_type: subColumnId,
          model_number,
          color_temperature,
          singlePowerClass,
        })
        rfqForm.subGroupMap['light_brand'].subColumns[subColumnId + '_品牌']
          .setOptions(Object.keys(brandMap))
          .$value.data('modelOptions', brandMap)
        rfqForm.subGroupMap['light_brand'].subColumns[
          subColumnId + '_品牌'
        ].change()
      })
    },
    lightBrandModelHandler = (name, options = ['']) => {
      if (name.includes('品牌')) {
        rfqForm.subGroupMap['light_brand'].subColumns[
          name.split('-')[1].replace('品牌', '型号')
        ].setOptions(options)
      }
    },
    inputHandler = (name, value, fullName) => {
      const is_merge_power_and_signal = rfqForm.columnsMap[
        'is_merge_power_and_signal'
      ].getValue()
      if (name === 'power_cable_length') {
        if (is_merge_power_and_signal === '是') {
          rfqForm.columnsMap['signal_line_length'].setValue(value)
        }
      } else if (name === 'lamp_bead_number') {
        compositionCoefHandler()
        lightAngleHandler()
        lampBeadsCompositionHandler()
        colorTempSetOptions()
        setLampBrandOptions(rfqForm.subGroupMap['light_brand'].subIds)
      } else if (name === 'composition_coef') {
        lampBeadsCompositionHandler()
      } else if (name === 'lamp_length') {
        lightAngleHandler()
      } else if (name === 'watt') {
        colorTempSetOptions()
        setLampBrandOptions(rfqForm.subGroupMap['light_brand'].subIds)
      } else if (name === 'light_brand') {
        // lightBrandModelHandler(fullName);
      }
    },
    getSinglePowerClass = () => {
      const watt = rfqForm.columnsMap['watt'].getValue()
      const lamp_bead_number = rfqForm.columnsMap['lamp_bead_number'].getValue()
      const isEmptyOrZero = (value) =>
        _.isEmpty(value) || value === '0' || isNaN(Number(value))
      if (isEmptyOrZero(watt) || isEmptyOrZero(lamp_bead_number)) {
        return
      }

      const singlePower = Number(watt) / Number(lamp_bead_number)
      let singlePowerClass
      if (singlePower <= 0.5) {
        singlePowerClass = 's'
      } else if (singlePower > 0.5 && singlePower <= 1) {
        singlePowerClass = 'm'
      } else if (singlePower > 1) {
        singlePowerClass = 'l'
      }
      return singlePowerClass
    }

  $(containerSelector)
    .on('change', 'select.customizable', function (e) {
      const value = this.value,
        name = this.name.replace(/-.+/, ''),
        isCustom = value === 'custom'

      if (isCustom) {
        toggleCustomOrList(true, $(this))
        if (name === 'series') {
          rfqForm.columnsMap['model_number'].setValue('custom').change('select')
        } else if (name === 'power_cable_length') {
          let is_merge_power_and_signal = rfqForm.columnsMap[
            'is_merge_power_and_signal'
          ].getValue()
          if (is_merge_power_and_signal === '是') {
            rfqForm.columnsMap['signal_line_length'].toggleCustomOrList(true)
          }
        } else if (name === 'model_number') {
          rfqForm.columnsMap['lamp_type'].setValue('2').change('select')
          lightAngleHandler()
          setLampBrandOptions(rfqForm.subGroupMap['light_brand'].subIds)
        } else if (name === 'light_brand') {
          lightBrandModelHandler(this.name)
        }
      } else {
        toggleCustomOrList(false, $(this))
        if (name === 'series') {
          let model_number_list
          // 填入型號選項
          if (ruleMaps.seriesModelMap[value]) {
            model_number_list = ruleMaps.seriesModelMap[value]
            rfqForm.columnsMap['model_number']
              .setOptions(model_number_list)
              .change('select')
          } else {
            rfqForm.columnsMap['model_number']
              .setOptions([])
              .toggleCustomOrList(true)
              .change('select')
          }
        } else if (name === 'model_number') {
          // 燈具類型
          rfqForm.columnsMap['lamp_type']
            .setValue(ruleMaps.lampTypeMap[value] || '2')
            .change('select')
          setLampBrandOptions(rfqForm.subGroupMap['light_brand'].subIds)
          lightAngleHandler()
        } else if (name === 'power_cable_length') {
          const is_merge_power_and_signal = rfqForm.columnsMap[
            'is_merge_power_and_signal'
          ].getValue()
          if (is_merge_power_and_signal === '是') {
            rfqForm.columnsMap['signal_line_length'].setValue(value)
          }
        } else if (name === 'light_brand') {
          let modelOptions = $(this).closest('.value').data('modelOptions')
          lightBrandModelHandler(
            this.name,
            modelOptions ? modelOptions[value] : ['']
          )
        }
      }
    })
    .on('change', 'select.only-list', function (e) {
      const value = this.value,
        name = this.name.replace(/-.+/, '')

      if (name === 'composition') {
        // 組成係數
        compositionCoefHandler()
        // 燈珠組成
        lampBeadsCompositionHandler()
        // 色溫
        colorTempSetColumns(value)
        // 品牌與型號欄位數
        lampBrandSetColumns(value)
        colorTempSetOptions()
        // setLampBrandOptions();
        setLampBrandOptions(rfqForm.subGroupMap['light_brand'].subIds)
        // 發光角度
        lightAngleHandler()
        $(containerSelector + ' .subgroup .value').addClass('sub-value')
      } else if (name === 'power_cable_inout') {
        const is_merge_power_and_signal = rfqForm.columnsMap[
          'is_merge_power_and_signal'
        ].getValue()
        if (is_merge_power_and_signal === '是') {
          rfqForm.columnsMap['signal_line_inout'].setValue(value)
        }
      } else if (name === 'lamp_type') {
        if (value === '0') {
          toggleDisableColumn('lamp_length', true).setValue('0')
          toggleDisableColumn('segmentation', true)
            .setValue('0')
            .change('input')
        } else {
          toggleDisableColumn('lamp_length', false)
          toggleDisableColumn('segmentation', false)
        }
      } else if (name === 'control_way') {
        let isShowSignalRelatedCols
        // 信號線相關、組成方式、分段方式
        switch (value) {
          case '单色常亮(W)':
            isShowSignalRelatedCols = false
            toggleDisableColumn('composition', true)
              .setValue('W')
              .change('select')
            toggleDisableColumn('segmentation', true)
              .setValue('0')
              .change('input')
            break
          case 'DMX':
            isShowSignalRelatedCols = true
            toggleDisableColumn('composition', false)
            toggleDisableColumn('segmentation', false)
            break
        }
        toggleColumn('is_merge_power_and_signal', isShowSignalRelatedCols)
        toggleColumn('signal_line_length', isShowSignalRelatedCols)
        toggleColumn('is_signal_line_waterproof', isShowSignalRelatedCols)
        toggleColumn('signal_line_inout', isShowSignalRelatedCols)

        // 發光角度
        lightAngleHandler()
      } else if (name === 'color_temperature') {
        setLampBrandOptions(rfqForm.subGroupMap['light_brand'].subIds)
        if (this.name.match(/-(.+)/)[1] === 'L') {
          colorTempFilterOptions()
        }
      }
    })
    .on('change', 'input[type=radio]', function (e) {
      const name = this.name,
        value = this.value
      // 電源線和信號線是否合併
      if (name === 'is_merge_power_and_signal') {
        let inout = rfqForm.columnsMap['power_cable_inout'].getValue(),
          is_waterproof = rfqForm.columnsMap[
            'is_power_cable_waterproof'
          ].getValue(),
          powerCablelength = rfqForm.columnsMap['power_cable_length'].getValue()
        if (value === '是') {
          // 信號線的長度、防水、進出方式都和電源線一致且不能更改
          rfqForm.columnsMap['signal_line_inout'].setValue(inout)
          toggleDisableColumn('signal_line_length', true).setValue(
            powerCablelength
          )
          toggleDisableColumn('is_signal_line_waterproof', true).setValue(
            is_waterproof
          )
        } else if (value === '否') {
          // 信號線的進出方式只能是一進一出
          rfqForm.columnsMap['signal_line_inout'].setValue('一进一出')
          toggleDisableColumn('signal_line_length', false)
          toggleDisableColumn('is_signal_line_waterproof', false)
        }
      } else if (name === 'is_power_cable_waterproof') {
        const is_merge_power_and_signal = rfqForm.columnsMap[
          'is_merge_power_and_signal'
        ].getValue()
        if (is_merge_power_and_signal === '是') {
          rfqForm.columnsMap['is_signal_line_waterproof'].setValue(value)
        }
      }
    })
    .on('keyup', 'input[type=text]', function (e) {
      const name = this.name.replace(/-.+/, ''),
        value = this.value
      inputHandler(name, value)
    })
    .on('change', 'input[type=text]', function (e) {
      const name = this.name.replace(/-.+/, ''),
        value = this.value
      inputHandler(name, value, this.name)
    })
}
const initRfqForm = (ruleMaps, containerSelector, rfqForm) => {
  // fill options and set default value
  for (let columnId in rfqForm.columnsMap) {
    if (!['series', 'model_number'].includes(columnId)) {
      rfqForm.columnsMap[columnId].setOptions().setDefaultValue()
    }
  }
  rfqForm.columnsMap['series'].setOptions(Object.keys(ruleMaps.seriesModelMap))
  rfqForm.columnsMap['model_number'].setOptions([''])
  // init column state
  rfqForm.columnsMap['signal_line_inout'].toggleDisable(true)
  rfqForm.columnsMap['lamp_type'].toggleDisable(true)
  rfqForm.columnsMap['lamp_beads_composition'].toggleDisable(true)
  rfqForm.columnsMap['angle_claim'].hide()
  rfqForm.columnsMap['lamp_color'].$value
    .find('select option[value=custom]')
    .text('客制色')
  // bind event
  bindRfqColumnEvent(ruleMaps, containerSelector, rfqForm)
}
exports.createRfqForm = (selector) => {
  return getAllRuleMap().then((ruleMaps) => {
    const rfqForm = new RfqForm(ruleMaps.rfqColumnConfig, selector)
    initRfqForm(ruleMaps, selector, rfqForm)
    return rfqForm
  })
}
exports.createRfqView = (selector) =>
  new Promise((res) => {
    const timestamp = new Date().getTime()
    $.get('./app/StrongLED/data/rfqColumnConfig.json?' + timestamp, (data) => {
      res(data)
    })
  }).then((config) => {
    return new RfqView(config, selector)
  })
exports.initValidationSetting = () => {
  $.validator.messages.maxlength = $.validator.format(
    i18n('Length_Should_Not_Exceed_Characters') + '{0}'
  )
  $.validator.addMethod(
    'positiveInteger',
    function (value, element, params) {
      return this.optional(element) || /^[1-9]\d*$/.test(value)
    },
    i18n('Please_Fill_In_Positive_Integers')
  )
  $.validator.addMethod(
    'nonNegativeInteger',
    function (value, element, params) {
      return (
        this.optional(element) ||
        (value.length > 1 ? /^[1-9]\d*$/.test(value) : /^[0-9]$/.test(value))
      )
    },
    i18n('Please_Fill_In_Zero_Or_A_Positive_Integer')
  )
  $.validator.addMethod(
    'positiveNumber',
    function (value, element, params) {
      return (
        this.optional(element) ||
        /(^\d*\.?\d*[1-9]+\d*$)|(^[1-9]+\d*\.\d*$)/.test(value)
      )
    },
    i18n('請輸入大於零的小數或整數')
  )
  $.validator.addMethod(
    'date',
    function (value, element, params) {
      return (
        this.optional(element) || /^[1-2]\d{3}\/[0-1]\d\/[0-3]\d$/.test(value)
      )
    },
    i18n('Please_Enter_A_Standard_Format') + '：YYYY/MM/DD'
  )
  // $.validator.addClassRules('vld-required', { required: true })
  $.validator.addClassRules('vld-pos-int', { positiveInteger: true })
  $.validator.addClassRules('vld-pos-int-n-zero', { nonNegativeInteger: true })
  $.validator.addClassRules('vld-pos-num', { positiveNumber: true })
}
