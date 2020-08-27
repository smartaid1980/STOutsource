import { getCookie } from '../../../../../js/servtech/module/servkit/util.js'

const parseElConfigFnMap = {
  img(
    origComponentConfig,
    parsedComponentConfig,
    { currPartitionCode: partitionCode }
  ) {
    origComponentConfig.type = 'image'
    delete parsedComponentConfig.text
    delete parsedComponentConfig.source
    parsedComponentConfig.value.content =
      origComponentConfig.en ||
      origComponentConfig.zh ||
      origComponentConfig.zh_tw
    if (partitionCode === 'T1-B') parsedComponentConfig.height = '17em'
  },
  gragus(origComponentConfig, parsedComponentConfig) {
    origComponentConfig.type = 'gauge'
    MonitorConfig.setCalculatorSignal(
      origComponentConfig,
      parsedComponentConfig,
      'max'
    )
    MonitorConfig.setCalculatorSignal(
      origComponentConfig,
      parsedComponentConfig,
      'min'
    )
  },
  line_chart(
    origComponentConfig,
    parsedComponentConfig,
    { lastPosition, configMap, componentCountMap }
  ) {
    MonitorConfig.getLineChartParam(
      origComponentConfig,
      parsedComponentConfig,
      '1',
      lastPosition,
      configMap,
      componentCountMap
    )
  },
  mulitiple_line_chart(
    origComponentConfig,
    parsedComponentConfig,
    { lastPosition, configMap, componentCountMap }
  ) {
    if (
      !MonitorConfig.getLineChartParam(
        origComponentConfig,
        parsedComponentConfig,
        '2',
        lastPosition,
        configMap,
        componentCountMap
      )
    ) {
      return null // 回傳false的話就把param刪掉，表示不新增元件
    }
  },
  mulitiple_yaxis_line_chart(
    origComponentConfig,
    parsedComponentConfig,
    { lastPosition, configMap, componentCountMap }
  ) {
    if (
      !MonitorConfig.getLineChartParam(
        origComponentConfig,
        parsedComponentConfig,
        '3',
        lastPosition,
        configMap,
        componentCountMap
      )
    ) {
      return null // 回傳false的話就把param刪掉，表示不新增元件
    }
  },
  switch(origComponentConfig, parsedComponentConfig) {
    if (origComponentConfig.color)
      parsedComponentConfig.value.color = {
        data: origComponentConfig.color,
      }
  },
  progress(origComponentConfig, parsedComponentConfig) {
    parsedComponentConfig.pattern = '1'
    if (
      origComponentConfig.type === 'progress' &&
      !origComponentConfig.en &&
      !origComponentConfig.zh &&
      !origComponentConfig.zh_tw
    )
      delete parsedComponentConfig.text
    if (origComponentConfig.type === 'pie_chart')
      origComponentConfig.type = 'easypiechart'
    if (origComponentConfig.color)
      parsedComponentConfig.value.color = {
        data: origComponentConfig.color,
      }
    if (origComponentConfig.unit)
      parsedComponentConfig.unit = {
        content: origComponentConfig.unit,
      }
    if (origComponentConfig.max)
      parsedComponentConfig.total = origComponentConfig.max
    if (origComponentConfig.min)
      parsedComponentConfig.min = {
        content: origComponentConfig.min,
      }
  },
  pie_chart(origComponentConfig, parsedComponentConfig) {
    parsedComponentConfig.pattern = '1'
    if (
      origComponentConfig.type === 'progress' &&
      !origComponentConfig.en &&
      !origComponentConfig.zh &&
      !origComponentConfig.zh_tw
    )
      delete parsedComponentConfig.text
    if (origComponentConfig.type === 'pie_chart')
      origComponentConfig.type = 'easypiechart'
    if (origComponentConfig.color)
      parsedComponentConfig.value.color = {
        data: origComponentConfig.color,
      }
    if (origComponentConfig.unit)
      parsedComponentConfig.unit = {
        content: origComponentConfig.unit,
      }
    if (origComponentConfig.max)
      parsedComponentConfig.total = origComponentConfig.max
    if (origComponentConfig.min)
      parsedComponentConfig.min = {
        content: origComponentConfig.min,
      }
  },
  time_format(
    origComponentConfig,
    parsedComponentConfig,
    { currPartitionCode: partitionCode }
  ) {
    parsedComponentConfig.pattern = '1'
    origComponentConfig.type = 'text'
    var format = origComponentConfig.format.split('|')
    if (partitionCode === 'T2-A') {
      parsedComponentConfig.en += '&nbsp;:&nbsp;'
      parsedComponentConfig.zh += '&nbsp;:&nbsp;'
      parsedComponentConfig.zh_tw += '&nbsp;:&nbsp;'
      format = ['YYYYMMDDHHmmss', 'HH:mm:ss']
    }
    parsedComponentConfig.value.format = {
      type: 'time',
      input: format[0],
      output: format[1],
    }
  },
  time(origComponentConfig, parsedComponentConfig) {
    parsedComponentConfig.pattern = '3'
    origComponentConfig.type = 'text'
    parsedComponentConfig.value.format = {
      type: 'time',
      utc: true,
      output: 'HH[H] mm[M] ss[S]',
    }
    switch (origComponentConfig.signal) {
      case 'G_ELCT()':
        parsedComponentConfig.value.format.workshift = 'power_millisecond'
        break
      case 'G_CUTT()':
        parsedComponentConfig.value.format.workshift = 'cut_millisecond'
        break
      case 'G_OPRT()':
      default:
        parsedComponentConfig.value.format.workshift = 'oper_millisecond'
        break
    }
  },
  text(origComponentConfig, parsedComponentConfig) {
    parsedComponentConfig.pattern = '3'
    if (origComponentConfig.signal === 'G_ALAM()') {
      // 警報代碼比較特別
      parsedComponentConfig.pattern = '3'
      parsedComponentConfig.value.array = true
      parsedComponentConfig.value.format = {
        preCondition: 'alarm',
        connectText: ' : ',
        originalValue: 'left',
        noData: ['-1'],
        emptyFormat: '---',
      }
    }
  },
}

// Monitor 最小單位是 component，csv 設定檔每一行都是一個 component
// 在 config 中，partition 和 widget 也算是 component
// 再上去是 partition，一至多個 component 可組成一個 partition
// 最後，最大範圍的是 widget，也就是看的到框框的 smartadmin widget
export default class MonitorConfig {
  constructor(csvLineList, brandId) {
    this.csvLineList = csvLineList
    this.brandId = brandId
    this.prePosition = null
    this.lastPosition = null
    this.lastWidgetCode = null
    this.lastPartitionCode = null
    this.currWidgetCode = null
    this.currPartitionCode = null
    this.currPosition = null
    this.configKeyList = null
    this.widgetConfigMap = null
    // 計算元件數量
    this.componentCountMap = {
      widget: 0,
      partition: 0,
      text: 0,
      progress: 0,
      easypiechart: 0,
      switch: 0,
      image: 0,
      gauge: 0,
      linechart: 0,
    }
    // 轉換後的設定值
    this.configMap = {
      component: {},
      order: [],
      system: 0,
    }
    // 存元件路徑
    this.parentMap = {
      widget: null,
      partition: null,
    }
    this.parseConfig()
  }
  parseConfig() {
    this.configKeyList = this.csvLineList[0].split(',')
    // 從第二行開始
    this.csvLineList
      .slice(1)
      .forEach((valList) => this.parseComponentConfig(valList.split(',')))

    // 如果為多系統要改一下機台狀態的signal
    if (this.configMap.system > 1) {
      _.each(this.configMap.component, (param, key) => {
        if (key.includes('text#') && param.pattern === '5')
          param.system = this.configMap.system
      })
    }
  }
  parseComponentConfig(valList) {
    const self = this
    const origComponentConfig = MonitorConfig.convertConfigListToMap(
      valList,
      this.configKeyList
    )
    const {
      position: currPosition,
      signal,
      type,
      en,
      zh,
      zh_tw,
    } = origComponentConfig
    let isPartitionChanged
    let isWidgetChanged
    let parsedComponentConfig

    if (self.configMap.system < origComponentConfig['類型']) {
      self.configMap.system = origComponentConfig['類型']
    }
    self.currPosition = currPosition
    // 沒有設定 signal 或不是圖片型態會被跳過
    if (signal || type === 'img') {
      self.currPartitionCode = currPosition.split('_')[0]

      // 建立 widget
      self.currWidgetCode = currPosition.split('_')[0].split('-')[0]
      isWidgetChanged = self.lastWidgetCode !== self.currWidgetCode
      if (isWidgetChanged) {
        self.widgetConfigMap = self.createWidgetConfigMap(
          self.currWidgetCode,
          origComponentConfig
        )
        self.lastWidgetCode = self.currWidgetCode
      }

      // 判斷跟前一筆不同區
      isPartitionChanged = self.lastPartitionCode !== self.currPartitionCode

      // 預設元件設定值
      parsedComponentConfig = MonitorConfig.getElementParamTemplate({
        en,
        zh,
        zh_tw,
        signal,
        system: origComponentConfig['類型'],
      })

      switch (self.currPartitionCode) {
        case 'T1-A':
          self.addElement(
            origComponentConfig,
            MonitorConfig.convertComponentConfig(
              origComponentConfig,
              parsedComponentConfig,
              self
            )
          )
          break
        case 'T1-B':
          if (isPartitionChanged) {
            self.addDefaultPartition('4', true, false, '9px 5px') // 加上預設框
            self.createMachineStatus() // 加上機台狀態
          }
          self.addElement(
            origComponentConfig,
            MonitorConfig.convertComponentConfig(
              origComponentConfig,
              parsedComponentConfig,
              self
            )
          )
          break
        case 'T1-C':
          if (isPartitionChanged) {
            self.addDefaultPartition('12', false, true, false) // 加上預設框
          }
          self.addElement(
            origComponentConfig,
            MonitorConfig.convertComponentConfig(
              origComponentConfig,
              parsedComponentConfig,
              self
            )
          )
          break
        case 'T2-A':
          if (isPartitionChanged) {
            self.addDefaultPartition(
              '5',
              'distribute break-all',
              false,
              '3px 9px'
            ) // 加上預設框
          }
          self.addElement(
            origComponentConfig,
            MonitorConfig.convertComponentConfig(
              origComponentConfig,
              parsedComponentConfig,
              self
            )
          )
          if (isPartitionChanged) {
            self.createMachineStatus() // 加上機台狀態
          }
          break
        case 'T2-B':
          if (isPartitionChanged && self.lastPartitionCode !== 'T2-A') {
            self.addDefaultPartition('5', 'distribute break-all', false, '9px') // 加上預設框
          }
          if (isPartitionChanged) {
            const componentId = `partition#${++self.componentCountMap
              .partition}`
            self.configMap.component[componentId] = {
              grid: '12',
            }
            if (!self.widgetConfigMap.order) {
              self.widgetConfigMap.order = []
            }
            self.widgetConfigMap.order.push(componentId)
            // 把map改成新建立的partition
            self.parentMap.partition = componentId
            self.widgetConfigMap = self.configMap.component[componentId]
            self.createMachineStatus() // 加上機台狀態
          }
          self.addElement(
            origComponentConfig,
            self.getT2BParam(origComponentConfig, parsedComponentConfig)
          )
          break
        case 'T2-C':
          if (
            isPartitionChanged &&
            self.lastPartitionCode !== 'T2-A' &&
            self.lastPartitionCode !== 'T2-B'
          ) {
            self.addDefaultPartition(
              '5',
              'distribute break-all',
              false,
              '3px 9px'
            ) // 加上預設框
            self.createMachineStatus() // 加上機台狀態
          }
          self.addElement(
            origComponentConfig,
            MonitorConfig.convertComponentConfig(
              origComponentConfig,
              parsedComponentConfig,
              self
            )
          )
          break
        case 'T2-D':
          if (isPartitionChanged) {
            self.addDefaultPartition('7', false, true, false) // 加上預設框
          }
          self.addElement(
            origComponentConfig,
            MonitorConfig.convertComponentConfig(
              origComponentConfig,
              parsedComponentConfig,
              self
            )
          )
          break
        case 'P':
          if (isPartitionChanged) {
            self.configMap.component[self.parentMap.widget].class = {
              border: true,
            }
          }

          if (self.lastPosition !== self.currPosition) {
            self.createInsidePartition(
              origComponentConfig,
              origComponentConfig.cardGrid || '3'
            )
            self.widgetConfigMap =
              self.configMap.component[
                `partition#${self.componentCountMap.partition}`
              ]
          } else {
            self.widgetConfigMap =
              self.configMap.component[self.parentMap.widget]
          }
          self.addElement(
            origComponentConfig,
            self.getCoordinateConfig(origComponentConfig, parsedComponentConfig)
          )
          break
        default:
          self.addElement(
            origComponentConfig,
            MonitorConfig.convertComponentConfig(
              origComponentConfig,
              parsedComponentConfig,
              self
            )
          )
          break
      }
    }
    // addDefaultElement(param.position, val, widget)
    self.prePosition = self.lastPosition
    self.lastPosition = origComponentConfig.position
    self.lastPartitionCode = self.currPartitionCode
  }
  createWidgetConfigMap(widgetCode, componentConfigMap) {
    const componentType = 'widget'
    const widgetConfigTemplate = {
      grid: componentConfigMap.groupGrid || '12',
      icon: componentConfigMap.groupIcon,
      text: {
        en: componentConfigMap['groupName-en'],
        zh: componentConfigMap['groupName-zh'],
        zh_tw: componentConfigMap['groupName-zh_tw'],
      },
    }

    // 沒有值時建立預設值
    if (widgetCode === 'P') {
      // 座標widget的預設值不一樣
      if (!widgetConfigTemplate.icon) {
        widgetConfigTemplate.icon = '<i class="fa fa-reorder"></i>'
      }
      if (
        !widgetConfigTemplate.text.en &&
        !widgetConfigTemplate.text.zh &&
        !widgetConfigTemplate.text.zh_tw
      ) {
        widgetConfigTemplate.text.en = 'coordinate'
        widgetConfigTemplate.text.zh = '座标'
        widgetConfigTemplate.text.zh_tw = '座標'
      }
    } else if (widgetCode.indexOf('O') === 0) {
      widgetConfigTemplate.class = {
        border: true,
      }
    } else {
      if (!widgetConfigTemplate.icon) {
        widgetConfigTemplate.icon = '<i class="glyphicon glyphicon-stats"></i>'
      }
      if (
        !widgetConfigTemplate.text.en &&
        !widgetConfigTemplate.text.zh &&
        !widgetConfigTemplate.text.zh_tw
      ) {
        widgetConfigTemplate.text.en = 'Dashboard'
        widgetConfigTemplate.text.zh = '主要资讯'
        widgetConfigTemplate.text.zh_tw = '主要資訊'
      }
    }

    // 建立元件設定
    this.widgetConfigMap = this.configMap
    const componentId = this.createComponentConfigMap(
      widgetConfigTemplate,
      componentType
    )
    // 設定目前的值
    const widgetConfigMap = this.configMap.component[componentId]
    this.parentMap.widget = componentId
    this.parentMap.partition = null
    return widgetConfigMap
  }
  createComponentConfigMap(componentConfigMap, componentType) {
    const componentId = `${componentType}#${++this.componentCountMap[
      componentType
    ]}`

    // 建立元件
    this.configMap.component[componentId] = JSON.parse(
      JSON.stringify(componentConfigMap)
    )
    if (!this.widgetConfigMap.order) {
      this.widgetConfigMap.order = []
    }
    this.widgetConfigMap.order.push(componentId)
    return componentId
  }
  addDefaultPartition(grid, isDistribute, hasBorder, padding) {
    // 加上預設框
    const partitionParam = {
      grid,
    }
    const componentType = 'partition'

    if (padding) {
      partitionParam.style = {
        padding: padding,
      }
    }
    if (isDistribute) {
      partitionParam.bodyClass = {
        distribute: 'distribute break-all',
      }
    }
    if (hasBorder) {
      partitionParam.class = {
        border: true,
      }
    }
    this.widgetConfigMap = this.configMap.component[this.parentMap.widget] // partition建在widget上
    const componentId = this.createComponentConfigMap(
      partitionParam,
      componentType
    )

    // 把map改成新建立的partition
    this.parentMap.partition = componentId
    this.widgetConfigMap = this.configMap.component[componentId]
  }

  addElement(origComponentConfig, parsedComponentConfig) {
    if (this.partitionCode !== 'T2-B' && this.partitionCode !== 'P') {
      if (
        this.lastPartitionCode === this.partitionCode &&
        this.lastWidgetCode === this.widgetCode
      ) {
        // 同widget
        if (this.parentMap.partition) {
          this.widgetConfigMap = this.configMap.component[
            this.parentMap.partition
          ]
        } else {
          this.widgetConfigMap = this.configMap.component[this.parentMap.widget]
        }
      }
      if (this.lastPartition === 'T2-B') {
        this.parentMap.partition = `partition#${
          this.componentCountMap.partition - 1
        }`
        this.widgetConfigMap = this.configMap.component[
          this.parentMap.partition
        ]
      }
      if (origComponentConfig.signal === 'G_ALAM()') {
        this.addAlarmPreCondition() // 警報代碼比較特別
      }

      if (this.lastPosition === origComponentConfig.position) {
        if (
          this.prePosition !== origComponentConfig.position &&
          origComponentConfig.position.indexOf('_') >= 0
        ) {
          // 加上多值時的框
          const componentId = this.widgetConfigMap.order[
            this.widgetConfigMap.order.length - 1
          ]
          this.widgetConfigMap.order.pop()
          this.createInsidePartition(
            origComponentConfig,
            origComponentConfig.cardGrid
          )
          if (componentId.indexOf('text') === 0) {
            this.configMap.component[componentId].pattern = '4'
          }
          delete this.configMap.component[componentId].grid
          this.widgetConfigMap = this.configMap.component[
            `partition#${this.componentCountMap.partition}`
          ]
          if (!this.widgetConfigMap.order) {
            this.widgetConfigMap.order = []
          }
          this.widgetConfigMap.order.push(componentId)
        }
        if (
          parsedComponentConfig &&
          origComponentConfig.position.indexOf('_') >= 0
        ) {
          if (origComponentConfig.type === 'text') {
            parsedComponentConfig.pattern = '4' // 多值時的樣式
          }
          delete parsedComponentConfig.grid // 多值時不要有grid
        } else if (this.parentMap.partition)
          this.widgetConfigMap = this.configMap.component[
            this.parentMap.partition
          ]
        // 第三個以上的多值，給他正確的位置
        if (
          this.prePosition === origComponentConfig.position &&
          origComponentConfig.position.indexOf('_') >= 0
        )
          this.widgetConfigMap = this.configMap.component[
            `partition#${this.componentCountMap.partition}`
          ]
      } else {
        if (
          origComponentConfig.position.indexOf('_') < 0 &&
          this.parentMap.partition
        )
          this.widgetConfigMap = this.configMap.component[
            this.parentMap.partition
          ]
        // if (elementParam && partition !== 'T2-A') elementParam.grid = param.cardGrid
      }
    }
    if (parsedComponentConfig) {
      this.createComponentConfigMap(
        parsedComponentConfig,
        origComponentConfig.type
      ) // 加上元件
    }
  }

  getT2BParam(origComponentConfig, parsedComponentConfig) {
    const lang = getCookie('lang')
    let componentId
    // 設定T2-B區的元件
    if (this.lastPosition === this.currPosition) {
      componentId = `text#${this.componentCountMap.text}`
      this.configMap.component[componentId].value.content.push(
        origComponentConfig.signal
      )
      this.configMap.component[componentId].value.format.value.push(
        origComponentConfig[lang]
      )
      return null
    } else {
      delete parsedComponentConfig.text
      parsedComponentConfig.value = {
        content: [origComponentConfig.signal],
        array: true,
        format: {
          preCondition: 'alarm',
          connectText: ' : ',
          originalValue: 'left',
          value: [origComponentConfig[lang]],
          noData: ['0'],
        },
        style: {
          'color': {
            data: 'red',
          },
          'font-size': '1.5em',
        },
      }
      origComponentConfig.type = 'text'
      this.addAlarmPreCondition()
    }
    return parsedComponentConfig
  }

  getCoordinateConfig(origComponentConfig, parsedComponentConfig) {
    // 設定P區的元件
    var coordinatesBuf = parsedComponentConfig
    if (this.lastPosition === self.currPosition) {
      coordinatesBuf = this.configMap.component[
        `text#${this.componentCountMap.text}`
      ] // 相同元件直接改元件設定值
    }

    if (origComponentConfig.type === 'text') {
      // signal設定
      coordinatesBuf.value.array = true
      coordinatesBuf.value.content = origComponentConfig.signal
    } else if (origComponentConfig.type === 'label') {
      // text設定
      coordinatesBuf.text = {
        content: origComponentConfig.signal,
        array: true,
      }
      coordinatesBuf.source.signals.push('text')
    } else if (origComponentConfig.type === 'unit') {
      // 單位設定(會放在外面那層partition)
      this.configMap.component[
        'partition#' + this.componentCountMap.partition
      ].source = {
        sourceType: 'devicestatus',
        signals: ['unit'],
      }
      this.configMap.component[
        'partition#' + this.componentCountMap.partition
      ].unit = {
        content: origComponentConfig.signal,
      }
      return null
    }

    if (this.lastPosition === this.currPosition) {
      return null // 如果是相同元件就直接回傳null，就不往下了
    }
    coordinatesBuf.pattern = '4'
    origComponentConfig.type = 'text'
    this.configMap.component[
      'partition#' + this.componentCountMap.partition
    ].text = {
      en: origComponentConfig.en,
      zh: origComponentConfig.zh,
      zh_tw: origComponentConfig.zh_tw,
    }
    delete coordinatesBuf.grid
    return parsedComponentConfig
  }

  addAlarmPreCondition() {
    // 建立alarm預載資料
    if (!this.configMap.preCondition) {
      this.configMap.preCondition = {}
    }
    if (!this.configMap.preCondition.alarm)
      this.configMap.preCondition.alarm = {
        url: 'api/getdata/db',
        type: 'POST',
        contentType: 'application/json',
        data: {
          table: 'm_alarm',
          columns: ['alarm_id', 'alarm_status'],
          whereClause: `cnc_id='${this.brandId}'`,
        },
      }
  }

  createInsidePartition(componentConfig, grid = '12') {
    // 建立partition裡的partition
    this.createComponentConfigMap(
      {
        grid,
        text: {
          en: componentConfig['label-en'],
          zh: componentConfig['label-zh'],
          zh_tw: componentConfig['label-zh_tw'],
        },
        bodyClass: {
          distribute: 'distribute break-all',
        },
      },
      'partition'
    )
  }

  createMachineStatus() {
    this.createComponentConfigMap(
      {
        pattern: '5',
      },
      'text'
    )
  }
  static convertConfigListToMap(valList, keyList) {
    const configMap = Object.fromEntries(
      keyList.map((key, i) => [key, valList[i]])
    )
    // 若 position 是數字，要將它轉換為位置代碼(e.g. T1-A, O2, P_5)
    if (
      Object.prototype.hasOwnProperty.call(configMap, 'position') &&
      !/[A-Za-z]/.test(configMap.position)
    ) {
      configMap.position = MonitorConfig.parsePostionVal(configMap.position)
    }
    return configMap
  }
  static parsePostionVal(val) {
    const positionVal = Number(val)
    let result
    switch (true) {
      case positionVal === 0:
        result = '0'
        break
      case positionVal < 2:
        result = 'T1-A'
        break
      case positionVal < 6:
        result = 'T1-B'
        break
      case positionVal < 10:
        result = 'T1-C'
        break
      case positionVal < 11:
        result = `P_${val.split('.')[1]}`
        break
      default:
        result = `O${positionVal - 10}`
        break
    }
    return result
  }
  static getElementParamTemplate({ en, zh, zh_tw, signal, system }) {
    return {
      source: {
        sourceType: 'devicestatus',
        signals: ['value'],
      },
      value: {
        content: signal,
      },
      text: {
        en,
        zh,
        zh_tw,
      },
      system,
    }
  }
  static convertComponentConfig(
    origComponentConfig,
    parsedComponentConfig,
    monitorConfig
  ) {
    const { currPartitionCode: partitionCode } = monitorConfig
    if (
      partitionCode === 'T1-A' ||
      partitionCode === 'T1-C' ||
      partitionCode === 'T2-D' ||
      partitionCode === 'P' ||
      partitionCode.indexOf('O') === 0
    ) {
      parsedComponentConfig.grid = origComponentConfig.cardGrid || '12'
    }
    if (origComponentConfig.sourceType === 'API') {
      parsedComponentConfig.source.sourceType = 'api'
      parsedComponentConfig.source.url = origComponentConfig.source
      delete parsedComponentConfig.source.signals
    }
    if (origComponentConfig.index) {
      parsedComponentConfig.value.index = origComponentConfig.index
    }
    if (parseElConfigFnMap[origComponentConfig.type]) {
      parseElConfigFnMap[origComponentConfig.type](
        origComponentConfig,
        parsedComponentConfig,
        monitorConfig
      )
    } else {
      parseElConfigFnMap.text(origComponentConfig, parsedComponentConfig)
    }
    // switch (componentConfigMap.type) {
    //   case 'img':
    //     componentConfigMap.type = 'image'
    //     delete elementParam.text
    //     delete elementParam.source
    //     elementParam.value.content =
    //       componentConfigMap.en ||
    //       componentConfigMap.zh ||
    //       componentConfigMap.zh_tw
    //     if (partitionCode === 'T1-B') elementParam.height = '17em'
    //     break
    //   case 'gragus':
    //     componentConfigMap.type = 'gauge'
    //     setCalculatorSignal(componentConfigMap, elementParam, 'max')
    //     setCalculatorSignal(componentConfigMap, elementParam, 'min')
    //     break
    //   case 'line_chart':
    //     getLineChartParam(componentConfigMap, elementParam, '1')
    //     break
    //   case 'mulitiple_line_chart':
    //     if (!getLineChartParam(componentConfigMap, elementParam, '2')) return null // 回傳false的話就把param刪掉，表示不新增元件
    //     break
    //   case 'mulitiple_yaxis_line_chart':
    //     if (!getLineChartParam(componentConfigMap, elementParam, '3')) return null // 回傳false的話就把param刪掉，表示不新增元件
    //     break
    //   case 'switch':
    //     if (componentConfigMap.color)
    //       elementParam.value.color = {
    //         data: componentConfigMap.color,
    //       }
    //     break
    //   case 'progress':
    //   case 'pie_chart':
    //     elementParam.pattern = '1'
    //     if (
    //       componentConfigMap.type === 'progress' &&
    //       !componentConfigMap.en &&
    //       !componentConfigMap.zh &&
    //       !componentConfigMap.zh_tw
    //     )
    //       delete elementParam.text
    //     if (componentConfigMap.type === 'pie_chart')
    //       componentConfigMap.type = 'easypiechart'
    //     if (componentConfigMap.color)
    //       elementParam.value.color = {
    //         data: componentConfigMap.color,
    //       }
    //     if (componentConfigMap.unit)
    //       elementParam.unit = {
    //         content: componentConfigMap.unit,
    //       }
    //     if (componentConfigMap.max) elementParam.total = componentConfigMap.max
    //     if (componentConfigMap.min)
    //       elementParam.min = {
    //         content: componentConfigMap.min,
    //       }
    //     break
    //   case 'time_format':
    //     elementParam.pattern = '1'
    //     componentConfigMap.type = 'text'
    //     var format = componentConfigMap.format.split('|')
    //     if (partitionCode === 'T2-A') {
    //       elementParam.en += '&nbsp;:&nbsp;'
    //       elementParam.zh += '&nbsp;:&nbsp;'
    //       elementParam.zh_tw += '&nbsp;:&nbsp;'
    //       format = ['YYYYMMDDHHmmss', 'HH:mm:ss']
    //     }
    //     elementParam.value.format = {
    //       type: 'time',
    //       input: format[0],
    //       output: format[1],
    //     }
    //     break
    //   case 'time':
    //     elementParam.pattern = '3'
    //     componentConfigMap.type = 'text'
    //     elementParam.value.format = {
    //       type: 'time',
    //       utc: true,
    //       output: 'HH[H] mm[M] ss[S]',
    //     }
    //     switch (componentConfigMap.signal) {
    //       case 'G_ELCT()':
    //         elementParam.value.format.workshift = 'power_millisecond'
    //         break
    //       case 'G_CUTT()':
    //         elementParam.value.format.workshift = 'cut_millisecond'
    //         break
    //       case 'G_OPRT()':
    //       default:
    //         elementParam.value.format.workshift = 'oper_millisecond'
    //         break
    //     }
    //     break
    //   case 'text':
    //   default:
    //     elementParam.pattern = '3'
    //     if (componentConfigMap.signal === 'G_ALAM()') {
    //       // 警報代碼比較特別
    //       elementParam.pattern = '3'
    //       elementParam.value.array = true
    //       elementParam.value.format = {
    //         preCondition: 'alarm',
    //         connectText: ' : ',
    //         originalValue: 'left',
    //         noData: ['-1'],
    //         emptyFormat: '---',
    //       }
    //     }
    //     break
    // }
    return parsedComponentConfig
  }
  static setCalculatorSignal(origComponentConfig, parsedComponentConfig, name) {
    const calculator = origComponentConfig[name].split('()')
    parsedComponentConfig[name] = {
      content: calculator[0] + '()',
    }
    if (calculator[1]) {
      parsedComponentConfig[name].format = {
        calculator: calculator[1],
      }
    }
    parsedComponentConfig.source.signals.push(name)
    return parsedComponentConfig
  }
  static getLineChartParam(
    origComponentConfig,
    parsedComponentConfig,
    pattern,
    lastPosition,
    configMap,
    componentCountMap
  ) {
    origComponentConfig.type = 'linechart'
    parsedComponentConfig.grid = '8'
    if (pattern !== '1') {
      if (lastPosition === origComponentConfig.position) {
        // 多值才需要後面的行為
        configMap.component[
          'linechart#' + componentCountMap.linechart
        ].value.content.push(origComponentConfig.signal)
        configMap.component[
          'linechart#' + componentCountMap.linechart
        ].legend.main.en.push(origComponentConfig.en)
        configMap.component[
          'linechart#' + componentCountMap.linechart
        ].legend.main.zh.push(origComponentConfig.zh)
        configMap.component[
          'linechart#' + componentCountMap.linechart
        ].legend.main.zh_tw.push(origComponentConfig.zh_tw)
        return false
      } else {
        parsedComponentConfig.value.content = [origComponentConfig.signal]
        parsedComponentConfig.legend = {
          main: {
            en: [origComponentConfig.en],
            zh: [origComponentConfig.zh],
            zh_tw: [origComponentConfig.zh_tw],
          },
        }
        parsedComponentConfig.text = {
          en: origComponentConfig['label-en'],
          zh: origComponentConfig['label-zh'],
          zh_tw: origComponentConfig['label-zh_tw'],
        }
        parsedComponentConfig.pattern = pattern
      }
    }
    return parsedComponentConfig
  }
}
