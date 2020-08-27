exports.machineMonitorV2 = (function (global, $, _, servkit) {
  var lang = servkit.getCookie('lang')

  class Gauge {
    // 儀錶板實體
    constructor(ele) {
      this.ele = ele
      this.min = -1
      this.max = 1
      this.percent = 0
      this.value = 0
    }
    setScale() {
      this.x = 139 / (this.max - this.min)
      this.y = 20.5 - this.min * this.x
      var minDOM = this.ele.select('.min')
      minDOM.text(this.min)
      this.changeValueText(minDOM, this.min)
      this.ele
        .select('.min-c')
        .attr('transform', `rotate(${this.getPercent(this.min)})`)
      // var minWidth = minDOM.node().getBBox().width
      // var minHeight = minDOM.node().getBBox().height
      // // console.log(this.getPercent(this.min))
      // // minDOM.attr('transform', `translate(${-this.radius / 0.96},${minWidth / 2 - this.getPercent(this.min)}) rotate(${this.getPercent(this.min) - 90})`)
      // minDOM.attr('transform', `translate(${-this.radius / 1.01}, ${-this.radius / 3.5}) rotate(${-this.radius*0.02 - 62.61})`)
      var maxDOM = this.ele.select('.max')
      maxDOM.text(this.max)
      this.changeValueText(maxDOM, this.max)
      this.ele
        .select('.max-c')
        .attr('transform', `rotate(${this.getPercent(this.max)})`)
      // var maxWidth = maxDOM.node().getBBox().width
      // var maxHeight = maxDOM.node().getBBox().height
      // // maxDOM.attr('transform', `translate(${this.radius}, ${-this.radius}) rotate(${this.getPercent(this.max) - 90})`)
      // maxDOM.attr('transform', `translate(${this.radius / 1.07}, ${-this.radius / 2.5}) rotate(${this.radius*0.02 + 62.61})`)
      // // minDOM.attr('transform', `translate(${-this.radius / 0.96},${minWidth / 2}) rotate(-90)`)
    }
    changeValueText(valueDOM, text) {
      valueDOM.text(text)
      var textWidth = valueDOM.node().getBBox().width
      valueDOM.attr(
        'transform',
        `translate(${-this.radius / 0.96},${textWidth / 2}) rotate(-90)`
      )
    }
    getPercent(data) {
      return data * this.x + this.y
    }
    render() {
      var margin = {
        top: 30,
        right: 50,
        bottom: 20,
        left: 50,
      }
      var width = this.ele[0][0].offsetWidth - margin.right - margin.left
      var height = width / 1.6
      var svg = this.ele
        .append('svg')
        .attr('width', width)
        .attr('height', height)
      var all = svg
        .append('g')
        .attr('transform', `translate(${width / 2}, ${(height / 5) * 4})`) // 把全部元件群組化

      this.radius = Math.min(width, height) / 1.45
      var arc = d3.svg
        .arc()
        .outerRadius(this.radius)
        .innerRadius(this.radius / 1.6)
        .cornerRadius(5)

      var chart = all.append('g') // 儀表圖
      chart
        .append('path')
        .attr('fill', servkit.statusColors.alarm)
        .attr('d', arc.startAngle(-0.52 * Math.PI).endAngle(-0.39 * Math.PI))
      chart
        .append('path')
        .attr('fill', servkit.statusColors.online)
        .attr('d', arc.startAngle(-0.38 * Math.PI).endAngle(0.38 * Math.PI))
      chart
        .append('path')
        .attr('fill', servkit.statusColors.alarm)
        .attr('d', arc.startAngle(0.39 * Math.PI).endAngle(0.52 * Math.PI))

      // 刻度和值
      var max = all
        .append('g')
        .attr('class', 'max-c')
        .attr('transform', `rotate(180)`)
        .append('text')
        .attr('class', 'max')
        .text(this.max)
      this.changeValueText(max, this.max)
      var min = all
        .append('g')
        .attr('class', 'min-c')
        .attr('transform', `rotate(0)`)
        .append('text')
        .attr('class', 'min')
        .text(this.min)
      this.changeValueText(min, this.min)

      this.needle = all.append('g').attr('transform', `rotate(0)`) // 指針
      this.needle.append('text').attr('class', 'value')
      var roundedRect = function (variable) {
        // 指針的針
        return (
          'M' +
          -(variable * 1.017 + 1.72) +
          ',' +
          -1 + // 起始位置
          'l' +
          (variable * 1.29 - 4.44) +
          ' ' +
          -(variable * 0.06 - 1.09) + // ↗
          'a' +
          variable / 50 +
          ',' +
          variable / 50 +
          ' 0 0 1 ' +
          variable / 50 +
          ',' +
          variable / 50 + // ⤵(有弧度)
          'v' +
          (variable * 0.06 - 0.09 - variable / 50) * 2 + // ↓
          'a' +
          variable / 50 +
          ',' +
          variable / 50 +
          ' 0 0 1 ' +
          -(variable / 50) +
          ',' +
          variable / 50 + // ↵(有弧度)
          'l' +
          -(variable * 1.29 - 4.44) +
          ' ' +
          -(variable * 0.06 - 1.09) + // ↖
          'z'
        ) // 回起始位置
      }
      this.needle
        .append('path')
        .attr('d', roundedRect(this.radius))
        .attr('fill', '#383838')
      this.needle
        .append('circle')
        .attr('fill', '#666')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', this.radius / 8)
      this.needle
        .append('circle')
        .attr('fill', '#383838')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', this.radius / 20)
      svg.selectAll('text').attr('font-size', `${(1.3 * this.radius) / 120}em`) // 字體放大
      this.setScale() // 設定標準值
    }
    moveTo() {
      var gauge = this
      var goalPercent = gauge.getPercent(gauge.value)
      var realPercent = goalPercent
      if (realPercent > 183) {
        realPercent = 183
      } else if (realPercent < -3) {
        realPercent = -3
      }

      gauge.needle
        .transition()
        .delay(300)
        .duration(2000)
        .tween('progress', function () {
          return function (percentOfPercent) {
            var progress =
              gauge.percent + (realPercent - gauge.percent) * percentOfPercent
            var text = Math.ceil(((progress - gauge.y) / gauge.x) * 10) / 10
            gauge.changeValueText(gauge.needle.select('.value'), text)
            gauge.needle.select('.value').attr('fill', '#383838')
            if (percentOfPercent === 1) {
              gauge.percent = realPercent
              if (goalPercent > 183 || goalPercent < -3) {
                gauge.changeValueText(
                  gauge.needle.select('.value'),
                  gauge.value
                )
                gauge.needle
                  .select('.value')
                  .attr('fill', servkit.statusColors.alarm)
              }
              // gauge.value = Math.floor((Math.random() * gauge.max) - gauge.min)
              // gauge.moveTo()
            }
            return d3.select(this).attr('transform', `rotate(${progress})`)
          }
        })
    }
  }

  class MachineMonitor {
    constructor(param, machineId, monitor) {
      this.param = param
      this.machineId = machineId
      this.elementValueData = {} // 紀錄別的原件的值
      if (monitor) {
        // 為monitor才需要建立monitor要用的funciton
        this.monitorFunction()
        this.system = this.param.system || 1
      }
    }

    set machineId(machineId) {
      this._machineId = machineId
      if (this.components)
        _.each(this.components, (c) => (c.machineId = machineId))
    }
    get machineId() {
      return this._machineId
    }
    set date(date) {
      this._date = date
      if (this.components) _.each(this.components, (c) => (c.date = date))
    }
    get date() {
      return this._date
    }
    set currentWorkShift(currentWorkShift) {
      this._currentWorkShift = currentWorkShift
      if (this.components)
        _.each(this.components, (c) => (c.currentWorkShift = currentWorkShift))
    }
    get currentWorkShift() {
      return this._currentWorkShift
    }
    set elementValueData(elementValueData) {
      // {} 或 [key, value]
      const system =
        this.thisSystem !== undefined ? this.thisSystem : this.system
      if (!this._elementValueData) this._elementValueData = {}
      if (!this._elementValueData[system]) this._elementValueData[system] = {}
      if (_.isArray(elementValueData)) {
        if (this._elementValueData && this._elementValueData[system])
          this._elementValueData[system][elementValueData[0]] =
            elementValueData[1]
      } else {
        this._elementValueData[system] = elementValueData
      }
      if (this.components && this.components[system])
        _.each(this.components[system], (c) => {
          // if (c && c.elementValueData) {
          // c.elementValueData[system] = elementValueData
          // }
          c.elementValueData = elementValueData
        })
    }
    get elementValueData() {
      return this._elementValueData[this.system]
    }
    set shiftProgramData(shiftProgramData) {
      this._shiftProgramData = shiftProgramData
      if (this.components) {
        _.each(this.components, (component) => {
          _.each(component, (c) => (c.shiftProgramData = shiftProgramData))
        })
      }
    }
    get shiftProgramData() {
      return this._shiftProgramData
    }
    set workShiftName(workShiftName) {
      this._workShiftName = workShiftName
      if (this.components) {
        _.each(this.components, (component) => {
          _.each(component, (c) => (c.workShiftName = workShiftName))
        })
      }
    }
    get workShiftName() {
      return this._workShiftName
    }
    set programName(programName) {
      this._programName = programName
      if (this.components) {
        _.each(this.components, (component) => {
          _.each(component, (c) => (c.programName = programName))
        })
      }
    }
    get programName() {
      return this._programName
    }
    set operatorId(operatorId) {
      this._operatorId = operatorId
      if (this.components) {
        _.each(this.components, (component) => {
          _.each(component, (c) => (c.operatorId = operatorId))
        })
      }
    }
    get operatorId() {
      return this._operatorId
    }
    set orderNo(orderNo) {
      this._orderNo = orderNo
      if (this.components) {
        _.each(this.components, (component) => {
          _.each(component, (c) => (c.orderNo = orderNo))
        })
      }
    }
    get orderNo() {
      return this._orderNo
    }
    set partNo(partNo) {
      this._partNo = partNo
      if (this.components) {
        _.each(this.components, (component) => {
          _.each(component, (c) => (c.partNo = partNo))
        })
      }
    }
    get partNo() {
      return this._partNo
    }
    set partCount(partCount) {
      this._partCount = partCount
      if (this.components) {
        _.each(this.components, (component) => {
          _.each(component, (c) => (c.partCount = partCount))
        })
      }
    }
    get partCount() {
      return this._partCount
    }

    // ------ monitor用function ------
    monitorFunction() {
      var monitor = this
      // ------ 建立元件 ------
      if (!monitor.components) monitor.components = {}
      if (!monitor.elementQuantity)
        monitor.elementQuantity = {
          widget: 0,
          partition: 0,
          text: 0,
          easypiechart: 0,
          progress: 0,
          gauge: 0,
          image: 0,
          dividingLine: 0,
          switch: 0,
          linechart: 0,
          barchart: 0,
          peichart: 0,
          spaerkline: 0,
        }
      monitor.drawElement = function (param, parentName, system) {
        // 依照相依性建立元件
        _.each(param.order, (elementId) => {
          // 有要用到的元件才初始
          if (monitor.param.component[elementId]) {
            // 確定這個元件是在這一層
            // hippo套用跟devicestatus一樣的signals機制
            var param = monitor.param.component[elementId]
            if (
              param.source &&
              param.source.sourceType === 'hippo' &&
              !param.source.signals
            ) {
              param.source.signals = ['value']
              if (param.text && param.text.content)
                param.source.signals.push('text')
            }

            // monitor.quantityMap[element.split('#')[0]]++
            if (
              monitor.createElement(
                elementId,
                JSON.stringify(monitor.param.component[elementId]),
                parentName,
                null,
                system
              )
            ) {
              monitor.redraw = true
            }
            monitor.drawElement(
              monitor.param.component[elementId],
              elementId,
              system
            )
          }
        })
      }
      monitor.createElement = function (
        elementId,
        elementParamStr,
        parentName,
        notInit,
        parentSystem
      ) {
        // 建立元件實體，並且存到components中
        var monitor = this
        var elementParam = JSON.parse(elementParamStr)
        var redraw = false
        var elementInfo = elementId.split('#')
        // 如果該元件沒有多參數就要拿第一個值
        var system = {
          parentSystem: parentSystem,
          thisSystem:
            elementParam.system - 1 < parentSystem
              ? elementParam.system - 1
              : parentSystem,
        }
        if (!monitor.components[parentSystem])
          monitor.components[parentSystem] = {}
        switch (elementInfo[0]) {
          case 'widget':
            monitor.components[parentSystem][
              elementId
            ] = new MachineMonitorWidget(
              elementId,
              Object.assign({}, elementParam),
              this,
              system
            )
            break
          case 'partition':
            monitor.components[parentSystem][
              elementId
            ] = new MachineMonitorPartition(
              elementId,
              Object.assign({}, elementParam),
              this,
              system
            )
            break
          case 'text':
            monitor.components[parentSystem][
              elementId
            ] = new MachineMonitorText(
              elementId,
              Object.assign({}, elementParam),
              this,
              system
            )
            break
          case 'easypiechart':
            monitor.components[parentSystem][
              elementId
            ] = new MachineMonitorEasyPieChart(
              elementId,
              Object.assign({}, elementParam),
              this,
              system
            )
            redraw = true
            break
          case 'progress':
            monitor.components[parentSystem][
              elementId
            ] = new MachineMonitorProgress(
              elementId,
              Object.assign({}, elementParam),
              this,
              system
            )
            break
          case 'gauge':
            monitor.components[parentSystem][
              elementId
            ] = new MachineMonitorGauge(
              elementId,
              Object.assign({}, elementParam),
              this,
              system
            )
            break
          case 'image':
            monitor.components[parentSystem][
              elementId
            ] = new MachineMonitorImage(
              elementId,
              Object.assign({}, elementParam),
              this,
              system
            )
            break
          case 'dividingLine':
            monitor.components[parentSystem][
              elementId
            ] = new MachineMonitorDividingLine(
              elementId,
              Object.assign({}, elementParam),
              this,
              system
            )
            break
          case 'switch':
            monitor.components[parentSystem][
              elementId
            ] = new MachineMonitorSwitch(
              elementId,
              Object.assign({}, elementParam),
              this,
              system
            )
            break
          case 'linechart':
            monitor.components[parentSystem][
              elementId
            ] = new MachineMonitorChart(
              elementId,
              Object.assign({}, elementParam),
              this,
              system
            )
            break
          case 'piechart':
            monitor.components[parentSystem][
              elementId
            ] = new MachineMonitorPieChart(
              elementId,
              Object.assign({}, elementParam),
              this,
              system
            )
            break
          case 'barchart':
            monitor.components[parentSystem][
              elementId
            ] = new MachineMonitorBarChart(
              elementId,
              Object.assign({}, elementParam),
              this,
              system
            )
            break
          case 'sparkline':
            monitor.components[parentSystem][
              elementId
            ] = new MachineMonitorSparkLine(
              elementId,
              Object.assign({}, elementParam),
              this,
              system
            )
            redraw = true
            break
          default:
            monitor.components[parentSystem][
              elementId
            ] = new MachineMonitorElement(
              elementId,
              Object.assign({}, elementParam),
              this,
              system
            )
            break
        }
        if (Number(elementInfo[1]) > monitor.elementQuantity[elementInfo[0]])
          monitor.elementQuantity[elementInfo[0]] = Number(elementInfo[1]) // 計算元件使用量

        var elementData = monitor.components[parentSystem][elementId] // 取得元件實體
        if (elementData) {
          // 同步爸爸的資料
          elementData.machineId = monitor.machineId
          elementData.date = monitor.date
          elementData.workShiftName = monitor.workShiftName
          elementData.preConditionMap = monitor.preConditionMap

          // console.log(Object.keys(elementData.param))
          // if (elementData.param && elementData.param.value && elementData.param.value.format && elementData.param.value.format.preCondition) { // 判斷此元件是否有用到預先載入資料(把machineMonitor拿到的資料放入元件中)
          //   _.each(elementData.param.value.format.preCondition, (val, key) => {
          //     elementData.preConditionMap = [key, monitor.preConditionMap[val]]
          //   })
          // }

          if (!notInit && elementData.initialization) {
            // 初始每個元件
            try {
              elementData.initialization(parentName)
            } catch (e) {
              console.warn(e)
            }
          }

          if (elementData.param.source) {
            // 資料來源設定
            var dataSource = elementData.param.source
            switch (dataSource.sourceType) {
              case 'devicestatus':
                if (!monitor.deviceStatus) monitor.deviceStatus = []
                monitor.deviceStatus.push(elementId)
                break
              case 'api':
                if (!monitor.api) monitor.api = {}
                if (!monitor.api[dataSource.url])
                  monitor.api[dataSource.url] = []
                monitor.api[dataSource.url].push(elementId)
                break
              case 'hippo':
                monitor.setHippo(
                  elementData.id,
                  dataSource.space,
                  dataSource.date,
                  dataSource.columns
                )
                break
              case 'random':
                if (!monitor.random) monitor.random = []
                monitor.random.push(elementId)
                break
            }
          }
          elementData = null // 把元件設定清空
        }
        elementParam = null // 把元件設定清空
        return redraw
      }
      monitor.setHippo = function (id, space, dateArray, columns) {
        // 把設定加到hippo的map中
        var date = ''
        if (dateArray) date = dateArray[0] + '|' + dateArray[1]
        if (!this.hippo) this.hippo = {}
        if (!this.hippo[space]) this.hippo[space] = {}
        if (!this.hippo[space][date]) this.hippo[space][date] = []
        var columnsIndex = _.findIndex(this.hippo[space][date], (val) => {
          return JSON.stringify(val.columns) === JSON.stringify(columns)
        })
        if (columnsIndex < 0)
          this.hippo[space][date].push({
            columns: columns,
            elements: [id],
          })
        else this.hippo[space][date][columnsIndex].elements.push(id)
      }

      // ------ 取得資料 ------
      monitor.preCondition = function (callback) {
        // 要從API先拿的資料
        var monitor = this
        if (monitor.param.preCondition) {
          var promises = []
          if (!monitor.preConditionMap) monitor.preConditionMap = {}
          _.each(monitor.param.preCondition, (param, key) => {
            var request = new Promise(function (resolve) {
              servkit.ajax(monitor.getAjaxData(param), {
                success: function (response) {
                  if (typeof response === 'string') {
                    // 如果是字串要先轉map
                    monitor.preConditionMap[key] = JSON.parse(response)
                  } else if (
                    response &&
                    _.isArray(response) &&
                    param.data &&
                    param.data.columns
                  ) {
                    // api/getdata/db
                    monitor.preConditionMap[key] = {}
                    if (key === 'ngQuantity')
                      _.each(response, (val) => {
                        if (
                          !monitor.preConditionMap[key][
                            val[param.data.columns[0]]
                          ]
                        )
                          monitor.preConditionMap[key][
                            val[param.data.columns[0]]
                          ] = []
                        monitor.preConditionMap[key][
                          val[param.data.columns[0]]
                        ].push(val)
                      })
                    else
                      _.each(
                        response,
                        (val) =>
                          (monitor.preConditionMap[key][
                            val[param.data.columns[0]]
                          ] = val[param.data.columns[1]])
                      )
                  } else {
                    monitor.preConditionMap[key] = response
                  }
                  resolve(monitor.preConditionMap[key]) // 要把拿到的值放入結果才可以
                },
              })
            })
            promises.push(request)
          })

          Promise.all(promises).then(function () {
            if (callback) callback() // 初始完成後的行為
          })
        } else if (callback) callback() // 初始完成後的行為
      }
      monitor.getAjaxData = function (param) {
        // 取得API的request資料
        var ajaxData = {
          //先讀使用者的
          url: param.url || '',
          type: param.type || 'GET',
          data: JSON.parse(JSON.stringify(param.data || {})),
        }
        if (param.contentType) {
          ajaxData.contentType = param.contentType
        }
        _.each(ajaxData.data, (val, key) => {
          if (typeof val === 'string')
            ajaxData.data[key] = val
              .replace('${date}', monitor.date)
              .replace('${workShift}', monitor.workShiftName)
              .replace('${machineId}', monitor.machineId)
        })
        if (ajaxData.type === 'POST' || ajaxData.type === 'PUT') {
          ajaxData.contentType = param.contentType || 'application/json'
          ajaxData.data = JSON.stringify(ajaxData.data)
        }
        return ajaxData
      }
      monitor.deviceStatusUpdate = function (data) {
        // 更新deviceStatus資料
        monitor.redraw = false
        monitor.dataElement = null
        _.each(data, function (dataEle) {
          if (dataEle && dataEle.data) {
            monitor.dataElement = dataEle
            try {
              monitor.programName = monitor.dataElement.getMachineValue(
                'G_PRGM()',
                monitor.machineId
              )[0][0]
            } catch (e) {
              monitor.programName = null
            }
            try {
              var program = monitor.dataElement.getMachineValue(
                'G_PGCM()',
                monitor.machineId
              )[0][0]
              monitor.operatorId = monitor.formatData(program, 'N7')
              if (
                _.isArray(monitor.operatorId) ||
                _.isObject(monitor.operatorId)
              )
                monitor.operatorId = null
              monitor.orderNo = monitor.formatData(program, 'N2')
              if (_.isArray(monitor.orderNo) || _.isObject(monitor.orderNo))
                monitor.orderNo = null
              monitor.partNo = monitor.formatData(program, 'N1')
              if (_.isArray(monitor.partNo) || _.isObject(monitor.partNo))
                monitor.partNo = null
            } catch (e) {
              monitor.operatorId = null
              monitor.orderNo = null
              monitor.partNo = null
            }
            try {
              monitor.partCount = Number(
                monitor.dataElement.getMachineValue(
                  'G_TOCP()',
                  monitor.machineId
                )[0][0]
              )
              if (isNaN(monitor.partCount)) monitor.partCount = 0
            } catch (e) {
              monitor.partCount = 0
            }
            _.each(monitor.deviceStatus, (element) => {
              var value = 0
              _.each(monitor.components, (com, system) => {
                var component = com[element]
                value = {}
                if (
                  component.param.source &&
                  component.param.source.signals &&
                  component.param.source.signals.length
                ) {
                  _.each(component.param.source.signals, (p) => {
                    value[p] = monitor.getDeviceStatusRealDataBySignal(
                      component.param[p].content,
                      component.system
                    )
                    if (value[p]) {
                      value[p] = monitor.formatData(
                        value[p],
                        component.param[p].index
                      )
                    }
                  })
                }
                monitor.updateElement(element, value, system)
              })
            })
            monitor.dataEle = null
          }
        })
        if (monitor.redraw) {
          // 如果有easypiechart或sparkline需要呼叫初始
          window.runAllCharts()
        }
      }
      monitor.getDeviceStatusRealDataBySignal = function (signal, system) {
        // 要去拿devicestatus的值(若是陣列也要回傳陣列)
        var value = null
        try {
          if (_.isArray(signal)) {
            value = []
            _.each(signal, (signal) => {
              try {
                value.push(monitor.getDeviceStatusMachineValue(signal, system))
              } catch (e) {
                value.push(0)
                console.warn(signal + ':' + e.message)
              }
            })
          } else {
            value = monitor.getDeviceStatusMachineValue(signal, system)
          }
        } catch (e) {
          value = null
        }
        return value
      }
      monitor.getDeviceStatusMachineValue = function (signal, system) {
        // 實際拿到devicestatus實際傳送的值
        var data
        try {
          data = monitor.dataElement.getMachineValue(
            signal.match(/G_\w*\(\)/g)[0],
            monitor.machineId
          )[0][0]
          if (signal.match(/G_M\w*\(\)/g) && _.isArray(data))
            data = data[system]
          // console.log(monitor.system, system, signal, signal.match(/G_M\w*\(\)/g),
          //   monitor.dataElement.getMachineValue(signal.match(/G_\w*\(\)/g)[0], monitor.machineId), data)
        } catch (e) {
          data = null
          // console.warn(signal + ': ' + e.message)
        }
        return data
      }
      monitor.apiUpdate = function (data, elements) {
        // 更新API傳回得資料
        monitor.redraw = false
        _.each(elements, (element) => {
          var value
          _.each(monitor.components, (com, system) => {
            var param = com[element].param
            if (_.isArray(param.value.content)) {
              value = []
              _.each(param.value.content, (val) => {
                value.push(data[val] || 0)
              })
            } else if (
              _.isArray(data) &&
              param.value.content === 'ngQuantity'
            ) {
              monitor.preConditionMap[param.value.content] = {}
              _.each(data, (val) => {
                if (
                  !monitor.preConditionMap[param.value.content][
                    val[param.source.data.columns[0]]
                  ]
                )
                  monitor.preConditionMap[param.value.content][
                    val[param.source.data.columns[0]]
                  ] = []
                monitor.preConditionMap[param.value.content][
                  val[param.source.data.columns[0]]
                ].push(val)
              })
              value = 0
              _.each(
                monitor.preConditionMap[param.value.content][
                  monitor.programName
                ],
                (val) => (value += val.ng_quantity)
              )
            } else value = data[param.value.content] || 0

            monitor.updateElement(
              element,
              {
                value: monitor.formatData(value, param.index),
              },
              system
            )
          })
        })
        if (monitor.redraw) {
          // 如果有easypiechart或sparkline需要呼叫初始
          window.runAllCharts()
        }
      }
      monitor.hippoUpdate = function () {
        // 更新hippo拿到的資料
        var date = monitor.date
        _.each(monitor.hippo, (ele, space) => {
          _.each(ele, (hippoEleAry, dateStr) => {
            var startDate = monitor.getRealDate(
              date,
              dateStr ? dateStr.split('|')[0] : ''
            )
            var endDate = monitor.getRealDate(
              date,
              dateStr ? dateStr.split('|')[1] : ''
            )
            _.each(hippoEleAry, (hippoEle) => {
              if (space === 'utilization_time_work_shift') {
                hippo
                  .newSimpleExhaler()
                  .space('product_work_utilization')
                  .index('machine_id', [monitor.machineId])
                  .indexRange('date', startDate, endDate)
                  .columns(
                    'machine_id',
                    'date',
                    'work_shift',
                    'macro_idle_minute_array'
                  )
                  .exhale(function (exhalable) {
                    var groupData = _.groupBy(exhalable.exhalable, function (
                      obj
                    ) {
                      return obj.machine_id + obj.date
                    })
                    var downTimeDays = {}
                    _.map(groupData, function (arrObj, key) {
                      var sumDownTimeM2 = 0
                      var sumDownTimeM3 = 0
                      _.each(arrObj, function (obj) {
                        var downTime = JSON.parse(obj.macro_idle_minute_array)
                        sumDownTimeM2 += downTime[2] == null ? 0 : downTime[2]
                        sumDownTimeM3 += downTime[3] == null ? 0 : downTime[3]
                      })
                      downTimeDays[key] = {
                        down_time_m2: sumDownTimeM2,
                        down_time_m3: sumDownTimeM3,
                      }
                    })
                    hippo
                      .newMashupExhaler()
                      .space('utilization_time_work_shift:utws')
                      .index('machine_id', [monitor.machineId])
                      .indexRange('date', startDate, endDate)

                      .space('part_count_merged:pcm')
                      .index('machine_id', [monitor.machineId])
                      .indexRange('date', startDate, endDate)

                      .column('utws', 'machine_id')
                      .column('utws', 'date')
                      .column('utws', 'work_shift')
                      .column('utws', 'power_millisecond')
                      .column('utws', 'operate_millisecond')
                      .column('utws', 'cutting_millisecond')
                      .column('utws', 'idle_millisecond')
                      .column('utws', 'alarm_millisecond')
                      .column('utws', 'work_shift_millisecond')

                      .column('pcm', 'part_count')
                      .column('pcm', 'operate_millisecond')

                      .mashupKey('machine_id', 'date', 'work_shift')
                      .exhale(function (exhalable) {
                        var resultGroups = {}
                        exhalable.each(function (data, groupKeys) {
                          if (data.utws.length > 0) {
                            var timeData = data.utws[0],
                              groupKey = timeData.machine_id + timeData.date,
                              resultGroup = resultGroups[groupKey]

                            if (resultGroup) {
                              resultGroup.power_millisecond +=
                                timeData.power_millisecond
                              resultGroup.operate_millisecond +=
                                timeData.operate_millisecond
                              resultGroup.cutting_millisecond +=
                                timeData.cutting_millisecond
                              resultGroup.idle_millisecond +=
                                timeData.idle_millisecond
                              resultGroup.alarm_millisecond +=
                                timeData.alarm_millisecond
                              resultGroup.work_shift_millisecond +=
                                timeData.work_shift_millisecond
                              resultGroup.part_count += data.pcm.length
                            } else {
                              resultGroup = _.pick(
                                timeData,
                                'machine_id',
                                'date',
                                'power_millisecond',
                                'operate_millisecond',
                                'cutting_millisecond',
                                'idle_millisecond',
                                'alarm_millisecond',
                                'work_shift_millisecond'
                              )
                              resultGroup.part_count = data.pcm.length
                              resultGroups[groupKey] = resultGroup
                            }
                          }
                        })
                        if (downTimeDays) {
                          var addDownTimeResultGroups = {}
                          _.map(resultGroups, function (obj, key) {
                            var downTimeData =
                              downTimeDays[key] == undefined
                                ? {
                                    down_time_m2: 0,
                                    down_time_m3: 0,
                                  }
                                : downTimeDays[key]

                            addDownTimeResultGroups[key] = _.extend(
                              obj,
                              downTimeData
                            )
                          })
                          resultGroups = addDownTimeResultGroups
                        }
                        var operSum = 0
                        var cutSum = 0
                        var denominatorSum = 0
                        servkit.ajax(
                          {
                            url:
                              'api/downtimeanalysis/machineidle/getworkshiftrange',
                            type: 'GET',
                            data: {
                              startDate: startDate,
                              endDate: endDate,
                            },
                          },
                          {
                            success: function (shiftData) {
                              var sumCapacityUtilization = 0
                              var dataCount = 0

                              var dataList
                              var lastData = {}
                              var result = _.chain(resultGroups)
                                .values()
                                .map(function (timeData) {
                                  var totalTime = 0
                                  timeData = monitor.millisecondExcludMillisecond(
                                    timeData
                                  )
                                  _.each(shiftData[timeData.date], function (
                                    shift
                                  ) {
                                    totalTime += shift.totalMillisecond + 1000
                                  })
                                  if (
                                    totalTime - timeData.power_millisecond <
                                    0
                                  ) {
                                    totalTime = 0
                                  } else {
                                    totalTime =
                                      totalTime - timeData.power_millisecond
                                  }
                                  operSum += timeData.operate_millisecond
                                  cutSum += timeData.cutting_millisecond
                                  denominatorSum += timeData.power_millisecond
                                  var brand = servkit.getMachineBrand(
                                    timeData.machine_id
                                  )
                                  var capacityUtilization =
                                    timeData.power_millisecond == 0
                                      ? 0
                                      : (timeData.operate_millisecond +
                                          timeData.down_time_m2 +
                                          timeData.down_time_m3) /
                                        timeData.power_millisecond

                                  sumCapacityUtilization += capacityUtilization
                                  dataCount += 1

                                  if (
                                    _.find(hippoEle.columns, (val) => {
                                      return val === 'date'
                                    })
                                  ) {
                                    if (!lastData.cutting_millisecond) {
                                      lastData.cutting_millisecond = 0
                                    }
                                    lastData.cutting_millisecond += parseInt(
                                      timeData.cutting_millisecond
                                    )
                                    if (!lastData.operate_millisecond) {
                                      lastData.operate_millisecond = 0
                                    }
                                    lastData.operate_millisecond += parseInt(
                                      timeData.operate_millisecond
                                    )
                                    if (!lastData.power_millisecond) {
                                      lastData.power_millisecond = 0
                                    }
                                    lastData.power_millisecond += parseInt(
                                      timeData.power_millisecond
                                    )
                                    if (!dataList) {
                                      dataList = {}
                                    }
                                    if (
                                      _.find(hippoEle.columns, (val) => {
                                        return val === 'dataCount'
                                      })
                                    )
                                      dataList[timeData.date] = [
                                        (
                                          Number(
                                            parseInt(
                                              timeData.operate_millisecond
                                            )
                                          ) /
                                          Number(
                                            parseInt(timeData.power_millisecond)
                                          )
                                        ).floatToPercentage(),
                                        capacityUtilization.floatToPercentage(),
                                      ]
                                    else
                                      dataList[timeData.date] = [
                                        (
                                          Number(
                                            parseInt(
                                              timeData.cutting_millisecond
                                            )
                                          ) /
                                          Number(
                                            parseInt(timeData.power_millisecond)
                                          )
                                        ).floatToPercentage(),
                                        (
                                          Number(
                                            parseInt(
                                              timeData.operate_millisecond
                                            )
                                          ) /
                                          Number(
                                            parseInt(timeData.power_millisecond)
                                          )
                                        ).floatToPercentage(),
                                      ]
                                    if (
                                      dataList[timeData.date].average === '+++'
                                    ) {
                                      dataList[timeData.date].average = '---'
                                    }
                                    if (
                                      dataList[timeData.date].capacity === '+++'
                                    ) {
                                      dataList[timeData.date].capacity = '---'
                                    }
                                  } else {
                                    if (!lastData.cutting_millisecond) {
                                      lastData.cutting_millisecond = 0
                                    }
                                    lastData.cutting_millisecond += parseInt(
                                      timeData.cutting_millisecond
                                    )
                                    if (!lastData.power_millisecond) {
                                      lastData.power_millisecond = 0
                                    }
                                    lastData.power_millisecond += parseInt(
                                      timeData.power_millisecond
                                    )
                                    dataList = (
                                      Number(lastData.cutting_millisecond) /
                                      Number(lastData.power_millisecond)
                                    ).floatToPercentage()
                                    if (dataList === '+++') {
                                      dataList = '---'
                                    }
                                  }
                                  return [
                                    servkit.getMachineName(timeData.machine_id),
                                    timeData.date.date8BitsToSlashed(),
                                    timeData.power_millisecond.millisecondToHHmmss(),
                                    timeData.operate_millisecond.millisecondToHHmmss(),
                                    brand
                                      .valueOf()
                                      .toUpperCase()
                                      .indexOf('INDICATORLAMP') != -1
                                      ? 'N.A.'
                                      : timeData.cutting_millisecond.millisecondToHHmmss(),
                                    (
                                      timeData.idle_millisecond +
                                      timeData.alarm_millisecond
                                    ).millisecondToHHmmss(),
                                    totalTime.millisecondToHHmmss(),
                                    brand
                                      .valueOf()
                                      .toUpperCase()
                                      .indexOf('INDICATORLAMP') != -1
                                      ? 'N.A.'
                                      : timeData.part_count,
                                    (
                                      timeData.operate_millisecond /
                                      timeData.power_millisecond
                                    ).floatToPercentage(),
                                    brand
                                      .valueOf()
                                      .toUpperCase()
                                      .indexOf('INDICATORLAMP') != -1
                                      ? 'N.A.'
                                      : (
                                          timeData.cutting_millisecond /
                                          timeData.power_millisecond
                                        ).floatToPercentage(),
                                    timeData.down_time_m2.millisecondToHHmmss(),
                                    timeData.down_time_m3.millisecondToHHmmss(),
                                    capacityUtilization.floatToPercentage(),
                                  ]
                                })
                                .value()
                              var avgCapacityUtilization =
                                sumCapacityUtilization / dataCount
                              if (dataList && hippoEle.elements) {
                                _.each(hippoEle.elements, (element) => {
                                  // console.log(element, dataList, hippoEle.columns)
                                  var total = 0
                                  var other = 0
                                  var index = 0
                                  var updateData = {}
                                  var data = dataList
                                  if (
                                    _.find(hippoEle.columns, (val) => {
                                      return val === 'date'
                                    })
                                  ) {
                                    if (element.includes('bar')) {
                                      var groupDataList = [[], []]
                                      _.each(data, (val, key) => {
                                        // groupDataList[0].push([new Date(moment(key, 'YYYYMMDD')).getTime(), val[0].replace('%', '')])
                                        // groupDataList[1].push([new Date(moment(key, 'YYYYMMDD')).getTime(), val[1].replace('%', '')])
                                        groupDataList[0].push([
                                          index,
                                          val[0].replace('%', ''),
                                          new Date(moment(key, 'YYYYMMDD')),
                                        ])
                                        groupDataList[1].push([
                                          index,
                                          val[1].replace('%', ''),
                                          new Date(moment(key, 'YYYYMMDD')),
                                        ])
                                        index++
                                      })
                                      _.each(monitor.components, (com) =>
                                        com[element].update({
                                          value: groupDataList,
                                        })
                                      )
                                    } else if (element.includes('sparkline')) {
                                      var sparklineDataList = []
                                      _.each(data, (val) =>
                                        sparklineDataList.push(
                                          val[1].replace('%', '')
                                        )
                                      )
                                      _.each(monitor.components, (com) =>
                                        com[element].update({
                                          value: sparklineDataList,
                                        })
                                      )
                                    } else {
                                      _.each(monitor.components, (com) => {
                                        if (
                                          _.find(
                                            com[element].param.source.columns,
                                            (val) => {
                                              return (
                                                val === 'cutting_millisecond'
                                              )
                                            }
                                          )
                                        ) {
                                          data = (
                                            Number(
                                              lastData.cutting_millisecond
                                            ) /
                                            Number(lastData.power_millisecond)
                                          ).floatToPercentage()
                                        }
                                        if (
                                          _.find(
                                            com[element].param.source.columns,
                                            (val) => {
                                              return (
                                                val === 'operate_millisecond'
                                              )
                                            }
                                          )
                                        ) {
                                          data = (
                                            Number(
                                              lastData.operate_millisecond
                                            ) /
                                            Number(lastData.power_millisecond)
                                          ).floatToPercentage()
                                        }
                                        if (
                                          _.find(hippoEle.columns, (val) => {
                                            return val === 'dataCount'
                                          })
                                        )
                                          data = (
                                            sumCapacityUtilization / dataCount
                                          ).floatToPercentage()
                                        com[element].update({
                                          value: data,
                                        })
                                      })
                                    }
                                  } else {
                                    _.each(monitor.components, (com) =>
                                      com[element].update({
                                        value: data,
                                      })
                                    )
                                  }
                                })
                              }
                            },
                          }
                        )
                      })
                  })
              } else {
                hippo
                  .newSimpleExhaler()
                  .space(space)
                  .index('machine_id', [monitor.machineId])
                  .indexRange('date', startDate, endDate)
                  // .index('machine_id', ['_MSSMBD01M001'])
                  // .indexRange('date', '20190329', '20190329')
                  // .indexRange('date', '20190105', '20190105')
                  // 無效時間
                  // .index('machine_id', ['_BEATAD01M01'])
                  // .indexRange('date', '20181018', '20181018')
                  // .indexRange('date', '20181221', '20181221')
                  // 稼動、歷史堆疊
                  // .index('machine_id', ['_IOEM_20190502D01M01'])
                  // .indexRange('date', '20190523', '20190523')
                  .columns(...hippoEle.columns)
                  .exhale(function (exhalable) {
                    var dataList
                    var lastData = {}
                    if (space === 'shift_program_data_for_monitor')
                      monitor.shiftProgramData = {} // 更新前先清空
                    _.each(exhalable.exhalable, (hippoData, exhalableKey) => {
                      switch (space) {
                        case 'shiftdata_for_monitor':
                          var workShift = hippoData['work_shift']
                          if (workShift === monitor.workShiftName) {
                            monitor.currentWorkShift = hippoData
                            return false
                          }
                          break
                        case 'shift_program_data_for_monitor':
                          if (hippoData.work_shift === monitor.workShiftName) {
                            if (!monitor.shiftProgramData)
                              monitor.shiftProgramData = {}
                            if (
                              !monitor.shiftProgramData[hippoData.program_name]
                            )
                              monitor.shiftProgramData[
                                hippoData.program_name
                              ] = []
                            monitor.shiftProgramData[
                              hippoData.program_name
                            ].push(hippoData)
                          }
                          break
                        case 'machine_status_history':
                          /* 過濾至當下時間前一個小時 */
                          // var todayDate = moment(exhalable.exhalable[0].end_time, 'YYYYMMDDHHmmss').format('YYYY/MM/DD')
                          // var start = moment(hippoData.start_time, 'YYYYMMDDHHmmss')
                          // var end = moment(hippoData.end_time, 'YYYYMMDDHHmmss')
                          // var now = new Date(`${todayDate} ${moment().format('HH:mm:ss')}`)

                          // if (now.getTime() - new Date(start).getTime() >= 60 * 60 * 1000) {
                          //   if (new Date(end).getTime() > now.getTime() ||
                          //   now.getTime() - new Date(end).getTime() < 60 * 60 * 1000) {
                          //     end = moment(now).add(-1, 'hour')
                          //   }
                          // } else {
                          //   hippoData.status = '0'
                          // }

                          // if (!dataList) dataList = []
                          // if (lastData.status && lastData.status === hippoData.status) {
                          //   dataList.pop() // 去除前一個，因為要跟這筆合併
                          //   hippoData.start_time = lastData.start_time
                          // }
                          // var historyData = {
                          //   data: [
                          //     [end - start, 0]
                          //   ],
                          //   color: hippoData.status === 'B' ? '0' : hippoData.status
                          // }
                          // dataList.push(historyData)
                          // lastData = hippoData

                          /* 一般顯示 */
                          if (!dataList) dataList = []
                          if (
                            lastData.status &&
                            lastData.status === hippoData.status
                          ) {
                            dataList.pop() // 去除前一個，因為要跟這筆合併
                            hippoData.start_time = lastData.start_time
                          }
                          var historyData = {
                            data: [
                              [
                                moment(hippoData.end_time, 'YYYYMMDDHHmmss') -
                                  moment(
                                    hippoData.start_time,
                                    'YYYYMMDDHHmmss'
                                  ),
                                0,
                              ],
                            ],
                            color:
                              hippoData.status === 'B' ? '0' : hippoData.status,
                          }
                          dataList.push(historyData)
                          lastData = hippoData
                          break
                        case 'utilization_time_work_shift':
                        case 'product_work_utilization':
                          if (hippoData.date) {
                            if (!lastData.cutting_millisecond) {
                              lastData.cutting_millisecond = 0
                            }
                            lastData.cutting_millisecond += parseInt(
                              hippoData.cutting_millisecond
                            )
                            if (!lastData.operate_millisecond) {
                              lastData.operate_millisecond = 0
                            }
                            lastData.operate_millisecond += parseInt(
                              hippoData.operate_millisecond
                            )
                            if (!lastData.power_millisecond) {
                              lastData.power_millisecond = 0
                            }
                            lastData.power_millisecond += parseInt(
                              hippoData.power_millisecond
                            )
                            if (!dataList) {
                              dataList = {}
                            }
                            dataList[hippoData.date] = [
                              (
                                Number(lastData.cutting_millisecond) /
                                Number(lastData.power_millisecond)
                              ).floatToPercentage(),
                              (
                                Number(lastData.operate_millisecond) /
                                Number(lastData.power_millisecond)
                              ).floatToPercentage(),
                            ]
                            if (dataList[hippoData.date].average === '+++') {
                              dataList[hippoData.date].average = '---'
                            }
                            if (dataList[hippoData.date].capacity === '+++') {
                              dataList[hippoData.date].capacity = '---'
                            }
                          } else {
                            if (!lastData.cutting_millisecond) {
                              lastData.cutting_millisecond = 0
                            }
                            lastData.cutting_millisecond += parseInt(
                              hippoData.cutting_millisecond
                            )
                            if (!lastData.power_millisecond) {
                              lastData.power_millisecond = 0
                            }
                            lastData.power_millisecond += parseInt(
                              hippoData.power_millisecond
                            )
                            dataList = (
                              Number(lastData.cutting_millisecond) /
                              Number(lastData.power_millisecond)
                            ).floatToPercentage()
                            if (dataList === '+++') {
                              dataList = '---'
                            }
                          }
                          break
                        case 'fah_product_work':
                          if (!dataList) dataList = {}
                          if (hippoData.macro_idle_minute_array) {
                            _.each(
                              JSON.parse(hippoData.macro_idle_minute_array),
                              (val, key) => {
                                if (!dataList[key]) {
                                  dataList[key] = Number(val)
                                } else {
                                  dataList[key] += Number(val)
                                }
                              }
                            )
                          } else {
                            _.each(hippoData, (hippoValue, hippoKey) => {
                              if (!isNaN(parseInt(hippoValue))) {
                                if (!dataList[hippoKey]) dataList[hippoKey] = 0
                                dataList[hippoKey] += hippoValue
                              }
                            })
                          }
                          break
                        case 'alarm_code_detail':
                          if (!dataList) dataList = {}
                          if (!dataList[hippoData.alarm_code])
                            dataList[hippoData.alarm_code] = 0
                          dataList[hippoData.alarm_code] +=
                            Number(hippoData.end_time) -
                            Number(hippoData.start_time)
                          break
                        case 'part_count_merged':
                          if (!dataList) dataList = []
                          if (
                            hippoData.work_shift === monitor.workShiftName &&
                            hippoData.program_name === monitor.programName
                          )
                            if (
                              moment(
                                hippoData.last_timestamp,
                                'YYYYMMDDHHmmss'
                              ) -
                                moment(
                                  hippoData.first_timestamp,
                                  'YYYYMMDDHHmmss'
                                ) >=
                              0
                            )
                              dataList.push(
                                moment(
                                  hippoData.last_timestamp,
                                  'YYYYMMDDHHmmss'
                                ) -
                                  moment(
                                    hippoData.first_timestamp,
                                    'YYYYMMDDHHmmss'
                                  )
                              )
                          break
                      }
                    })
                    if (dataList && hippoEle.elements) {
                      _.each(hippoEle.elements, (element) => {
                        var total = 0
                        var other = 0
                        var index = 0
                        var updateData = {}
                        var data = dataList
                        if (space === 'fah_product_work') {
                          if (
                            hippoEle.columns.includes('macro_idle_minute_array')
                          ) {
                            data = _.map(data, (val, key) => {
                              total += val
                              return {
                                id: key,
                                time: val,
                              }
                            }).sort(function (a, b) {
                              return b.time - a.time
                            })
                          }
                          _.each(monitor.components, (com) => {
                            // com[e].param.value = []
                            // com[e].param.legend.text[lang] = []
                            // _.each(sortList, (value) => {
                            //   com[e].param.value.push(data[value])
                            //   var format = com[e].param.legend.text.format
                            //   if (format && format.preCondition) {
                            //     com[e].param.legend.text[lang].push(monitor.preConditionMap[format.preCondition][value])
                            //   }
                            // })
                            if (
                              com[element].param.value &&
                              com[element].param.value.index
                            ) {
                              index = Number(com[element].param.value.index)
                              // if (index === 3) {
                              //   for (var arrayIndex = 3; arrayIndex < data.length; arrayIndex++) other += data[arrayIndex].time
                              //   data = other
                              // } else data = data[com[element].param.value.index]
                              if (index < data.length) {
                                if (index === data.length - 1 || index === 3) {
                                  // 最後一筆資料要用扣的，才會加總是100%
                                  for (
                                    var arrayIndex = 0;
                                    arrayIndex < index;
                                    arrayIndex++
                                  )
                                    other +=
                                      Math.round(
                                        (Number(data[arrayIndex].time) /
                                          Number(total)) *
                                          100 *
                                          Math.pow(10, 1)
                                      ) / Math.pow(10, 1)
                                  if (index === 3) data = 100 - other
                                  else {
                                    data = data[com[element].param.value.index]
                                    data.time = 100 - other
                                  }
                                  total = 100
                                } else
                                  data = data[com[element].param.value.index]
                              }
                              if (
                                hippoEle.columns.includes(
                                  'macro_idle_minute_array'
                                ) &&
                                data &&
                                _.isObject(data)
                              ) {
                                // 設定text
                                updateData.text = data.id
                                com[element].param.text = {
                                  format: {
                                    preCondition: 'custParamJsonFile',
                                    connectText: '&nbsp;&nbsp;&nbsp;&nbsp;',
                                  },
                                }
                                data = data.time
                              }
                              // 設定value
                              if (!com[element].param.value)
                                com[element].param.value = {}
                              if (!com[element].param.value.format)
                                com[element].param.value.format = {}
                              com[element].param.value.format.total = total
                            }
                            updateData.value = data
                            com[element].update(updateData)
                          })
                        } else if (space === 'alarm_code_detail') {
                          data = _.map(data, (val, key) => {
                            total += val
                            return {
                              id: key,
                              time: val,
                            }
                          }).sort(function (a, b) {
                            return b.time - a.time
                          })
                          _.each(monitor.components, (com) => {
                            if (
                              com[element].param.value &&
                              com[element].param.value.index
                            ) {
                              index = Number(com[element].param.value.index)
                              // if (Number(index === 3) {
                              //   for (arrayIndex = 3; arrayIndex < data.length; arrayIndex++) other += data[arrayIndex].time
                              //   data = other
                              // } else data = data[com[element].param.value.index]
                              if (index < data.length) {
                                if (index === data.length - 1 || index === 3) {
                                  // 最後一筆資料要用扣的，才會加總是100%
                                  for (
                                    var arrayIndex = 0;
                                    arrayIndex < index;
                                    arrayIndex++
                                  )
                                    other +=
                                      Math.round(
                                        (Number(data[arrayIndex].time) /
                                          Number(total)) *
                                          100 *
                                          Math.pow(10, 0)
                                      ) / Math.pow(10, 0)
                                  data = 100 - other
                                  total = 100
                                } else
                                  data = data[com[element].param.value.index]
                              }
                              if (data && _.isObject(data)) {
                                // 設定text
                                updateData.text = data.id
                                if (data.id.includes(','))
                                  updateData.text = data.id.split(',')
                                com[element].param.text = {
                                  format: {
                                    preCondition: 'alarm',
                                  },
                                }
                                data = data.time
                              }
                              // 設定value
                              if (!com[element].param.value)
                                com[element].param.value = {}
                              if (!com[element].param.value.format)
                                com[element].param.value.format = {}
                              com[element].param.value.format.total = total
                            }
                            updateData.value = data
                            // console.log('hippodata', updateData)
                            com[element].update(updateData)
                          })
                        } else if (space === 'part_count_merged') {
                          updateData.ave = 0
                          _.each(
                            data.sort(function (a, b) {
                              return a - b
                            }),
                            (val, key) => {
                              if (key === 0) updateData.min = val
                              if (key === data.length - 1) updateData.max = val
                              updateData.ave += val
                            }
                          )
                          updateData.ave = updateData.ave / data.length
                          _.each(monitor.components, (com) => {
                            if (
                              com[element].param.value &&
                              com[element].param.value.index
                            )
                              updateData =
                                updateData[com[element].param.value.index]
                            com[element].update({
                              value: updateData,
                            })
                          })
                        } else if (
                          (space === 'utilization_time_work_shift' ||
                            space === 'product_work_utilization') &&
                          _.find(hippoEle.columns, (val) => {
                            return val === 'date'
                          })
                        ) {
                          if (element.includes('bar')) {
                            var groupDataList = [[], []]
                            // console.log('bar', data)
                            _.each(data, (val, key) => {
                              // groupDataList[0].push([new Date(moment(key, 'YYYYMMDD')).getTime(), val[0].replace('%', '')])
                              // groupDataList[1].push([new Date(moment(key, 'YYYYMMDD')).getTime(), val[1].replace('%', '')])
                              groupDataList[0].push([
                                index,
                                val[0].replace('%', ''),
                                new Date(moment(key, 'YYYYMMDD')),
                              ])
                              groupDataList[1].push([
                                index,
                                val[1].replace('%', ''),
                                new Date(moment(key, 'YYYYMMDD')),
                              ])
                              index++
                            })
                            _.each(monitor.components, (com) =>
                              com[element].update({
                                value: groupDataList,
                              })
                            )
                          } else if (element.includes('sparkline')) {
                            var sparklineDataList = []
                            _.each(data, (val) =>
                              sparklineDataList.push(val[1].replace('%', ''))
                            )
                            _.each(monitor.components, (com) =>
                              com[element].update({
                                value: sparklineDataList,
                              })
                            )
                          } else {
                            _.each(monitor.components, (com) => {
                              var average = 0
                              _.each(data, (datas) => {
                                if (
                                  _.find(
                                    com[element].param.source.columns,
                                    (val) => {
                                      return val === 'cutting_millisecond'
                                    }
                                  )
                                ) {
                                  average += Number(datas[0].replace('%', ''))
                                }
                                if (
                                  _.find(
                                    com[element].param.source.columns,
                                    (val) => {
                                      return val === 'operate_millisecond'
                                    }
                                  )
                                ) {
                                  average += Number(datas[1].replace('%', ''))
                                }
                              })
                              com[element].update({
                                value:
                                  (average / Object.keys(data).length).toFixed(
                                    1
                                  ) + '%',
                              })
                            })
                          }
                        } else {
                          _.each(monitor.components, (com) =>
                            com[element].update({
                              value: data,
                            })
                          )
                        }
                      })
                    }
                  })
              }
            })
          })
        })
      }
      monitor.updateElement = function (element, value, system) {
        // 更新畫面
        var component
        if (system !== null || system !== undefined)
          component = monitor.components[system][element]
        else component = monitor.components[element]

        // 如果有index而且title的部分是空的就幫他補上
        if (component.param.index) {
          var $title = $('[data-monitor-id=' + element + '] .title')
          if ($title.text() === '' || $title.text() === '---') {
            $title.text(component.param.index)
          }
        }

        // 更新個元件
        try {
          component.update(value)
        } catch (e) {
          console.warn(`${component.id} : ${e.message}`)
        }

        // 如果是easypiechart或sparkline要呼叫更新API
        var componentName = element.split('#')[0]
        if (componentName === 'easypiechart' || componentName === 'sparkline') {
          monitor.redraw = true
        }
      }
      monitor.randomUpdate = function () {
        _.each(monitor.random, (id) => {
          _.each(monitor.components, (com, system) => {
            var param = com[id].param
            var randomStr = param.value.content
            var value
            if (randomStr.includes('-'))
              value = getRandom(
                randomStr.split('-')[0],
                randomStr.split('-')[1]
              )
            monitor.updateElement(
              id,
              {
                value: monitor.formatData(value, param.index),
              },
              system
            )
          })
        })
      }

      function getRandom(min, max) {
        return (
          Math.floor(Math.random() * (Number(max) - Number(min) + 1)) +
          Number(min)
        )
      }
    }

    // ------ 初始設定 ------
    initialization() {
      // 初始(透過param建立各種元件)
      const monitor = this
      monitor.redraw = false

      _.times(monitor.system, (num) => {
        $('#tabs>ul').append(
          `<li><a href="#tabs-${num}">System${num + 1}</a></li>`
        )
        $('#tabs').append(`<div id="tabs-${num}"><div class="row"></div></div>`)
        monitor.drawElement(monitor.param, null, num)
      })

      // 多系統才顯示tab
      if (monitor.system > 1) {
        $('#tabs>ul').removeClass('hide')
        $('#tabs').tabs()
      }

      if (monitor.redraw) {
        // 如果有easypiechart或sparkline需要呼叫初始
        window.runAllCharts()
      }
    }

    // ------ 資料計算 ------
    millisecondExcludMillisecond(timeData) {
      timeData.power_millisecond =
        parseInt(timeData.power_millisecond / 1000) * 1000
      timeData.operate_millisecond =
        parseInt(timeData.operate_millisecond / 1000) * 1000
      timeData.cutting_millisecond =
        parseInt(timeData.cutting_millisecond / 1000) * 1000
      timeData.idle_millisecond =
        parseInt(timeData.idle_millisecond / 1000) * 1000
      timeData.alarm_millisecond =
        parseInt(timeData.alarm_millisecond / 1000) * 1000
      timeData.work_shift_millisecond =
        parseInt(timeData.work_shift_millisecond / 1000) * 1000
      timeData.down_time_m2 = parseInt(timeData.down_time_m2 / 1000) * 1000
      timeData.down_time_m3 = parseInt(timeData.down_time_m3 / 1000) * 1000
      return timeData
    }
    formatData(value, index) {
      // 如果資料格式為(key value)或[key|value]會轉換成物件，如果設定需要計算也要算一下
      var data = value
      // 切割值是"(N1 934030-ZG,N2 2711,N3 20M00S)"先切,空白前的是key空白後的是value
      if (
        typeof value === 'string' &&
        value.search(/\(/) >= 0 &&
        value.search(/\)/) >= 0
      ) {
        _.each(
          value
            .replace(/\(/, '')
            .replace(/\)/, '')
            .replace(/"/g, '')
            .split(/,/g),
          (val, key) => {
            if (key === 0 && val.split(/\|| /g)[1]) data = {}
            if (_.isObject(data))
              data[val.split(/\|| /g)[0]] = val.split(/\|| /g)[1]
          }
        )
      }
      // 切割值是"[\"H|0\",\"D|0\",\"T|3\",\"M|70\",\"F|9000\",\"S|0\"]"|前的是key|後的是value
      if (
        _.isArray(value) &&
        value[0] &&
        value[0].toString().search(/\||:/) >= 0
      ) {
        data = {}
        _.each(value, (val) => {
          data[val.split(/\|| /g)[0]] = val.split(/\|| /g)[1]
        })
      }

      if ((_.isArray(data) || _.isObject(data)) && data[index]) {
        data = data[index]
      }
      return data
    }
    getServerTime() {
      // 需要拿server的時間再用
      return $.ajax({
        url: 'api/user/loginInfo',
        async: false,
      }).getResponseHeader('Date')
    }
    getCumulativeTime(times, output) {
      var t = Number(times)
      var o = output.replace('[M]', 'M').replace('[S]', 'S')
      if (isNaN(t)) return o.replace('mm', '00').replace('ss', '00')
      var m = Math.floor(t / (60 * 1000))
      var s = Math.floor((t - m * 60 * 1000) / 1000)
      return o.replace('mm', m).replace('ss', s)
    }
    getKeyName(key) {
      // 拿到要使用的欄位值
      // if (key.startsWith('${') && key.endsWith('}')) return key.slice(2, key.length - 1)
      if (key.indexOf('${') >= 0 && key.indexOf('}') >= 0)
        return key.slice(key.indexOf('${') + 2, key.indexOf('}'))
      else return key
    }
    getCalculatorValue(calculator, elementValueData) {
      // 得到其他元件的值
      var value = calculator
      var keyName = this.getKeyName(value)
      var calculatorValue = 0
      if (
        elementValueData &&
        elementValueData[keyName] &&
        elementValueData[keyName].value
      )
        calculatorValue = elementValueData[keyName].value
      value = value.replace('${' + keyName + '}', calculatorValue)
      if (value.indexOf('${') >= 0 && value.indexOf('}') >= 0) {
        value = this.getCalculatorValue(value, elementValueData)
      }
      return value
    }
    getRealDate(date, thisDate, format) {
      // 透過數字加減出查詢日期(hippo查多天用 或 假資料用)
      var realDate = date
      if (thisDate) {
        // if (thisDate.includes('-')) {
        if (/^-?\d{1,3}$/.test(thisDate)) {
          realDate = moment()
            .add(thisDate, 'day')
            .format(format || 'YYYYMMDD')
        } else {
          realDate = thisDate
        }
      }
      return realDate
    }
  }

  class MachineMonitorElement extends MachineMonitor {
    constructor(id, param, monitor, system) {
      super(param)
      this.id = id
      this.monitor = monitor
      this.system = system.thisSystem
      this.parentSystem = system.parentSystem

      delete this.monitorFunction
    }

    set preConditionMap(data) {
      // data = [key, value]
      if (!this._preConditionMap) this._preConditionMap = {}
      if (_.isArray(data)) this._preConditionMap[data[0]] = data[1]
      else this._preConditionMap = data
    }
    get preConditionMap() {
      return this._preConditionMap
    }

    initialization() {}
    update() {}

    setElementDOM(parentName, tag, parent, selector) {
      // 建立元件
      var parentDOM
      if (selector) parentDOM = selector
      else if (parent || parentName)
        parentDOM = parent
          ? parent
          : `[data-system=${
              this.parentSystem
            }][data-monitor-id=${parentName}] .${
              parentName.split('#')[0]
            }-body:first`
      var $elementParent = $(parentDOM)
      if (
        $elementParent.length &&
        !$elementParent.find(
          `[data-monitor-id=${this.id}][data-system=${this.system}]`
        ).length
      ) {
        var tagName = tag || 'div'
        $elementParent.append(
          `<${tagName} data-monitor-id="${this.id}" data-system="${this.system}"></${tagName}>`
        )
      }
      this.$element = $elementParent.find(
        `[data-monitor-id=${this.id}][data-system=${this.system}]`
      )
    }
    setText() {
      // 設定text
      var monitorElement = this
      monitorElement.text = ''
      if (monitorElement.param.text) {
        if (_.isArray(monitorElement.param.text)) {
          monitorElement.text = []
          _.each(monitorElement.param.text[lang], (val) =>
            monitorElement.text.push(val || '---')
          )
        } else if (_.isObject(monitorElement.param.text[lang])) {
          // piechart的機台狀態用
          monitorElement.text = monitorElement.param.text[lang]['0']
        } else {
          monitorElement.text = monitorElement.param.text[lang] || '---'
          if (monitorElement.text === '[machinename]')
            monitorElement.text = servkit.getMachineName(
              monitorElement.machineId
            )
        }
      }
    }
    setDefaultValue(paramName) {
      // 設定初始值
      this['default' + paramName] = null
      if (this.param[paramName.toLowerCase()]) {
        if (_.isArray(this.param[paramName.toLowerCase()].content)) {
          this['default' + paramName] = []
          _.each(this.param[paramName.toLowerCase()].content, () =>
            this['default' + paramName].push('')
          )
        } else {
          this['default' + paramName] = ''
        }
        if (
          !this.param.source ||
          (this.param.source.signals &&
            !this.param.source.signals.includes(paramName.toLowerCase()))
        ) {
          this['default' + paramName] = this.param[
            paramName.toLowerCase()
          ].content
        }
      }
    }
    setClassList() {
      // 設定所有class的名稱
      var monitorElement = this
      _.each(monitorElement.param.class, (val, key) =>
        monitorElement.classList.push(val === true ? key : val)
      )
    }
    setStyleList(param, part) {
      // 設定所有class的名稱
      var monitorElement = this
      _.each(param || monitorElement.param.style, (val, key) => {
        var value = val
        if (key === 'color') value = monitorElement.changeColor(val)
        if (param) {
          if (!monitorElement[part + 'StyleList'])
            monitorElement[part + 'StyleList'] = []
          monitorElement[part + 'StyleList'].push(key + ':' + value + ';')
        } else {
          monitorElement.styleList.push(key + ':' + value + ';')
        }
      })
    }
    drawElement(htmlList) {
      // 繪製元件
      var html = htmlList.join('')
      var className
      if (html.includes('class="[class]')) {
        className = this.classList ? this.classList.join(' ') + ' ' : ''
      } else {
        className = this.classList
          ? ' class="' + this.classList.join(' ') + '"'
          : ''
      }
      var styleName = this.styleList
        ? ' style="' + this.styleList.join(' ') + '"'
        : ''
      if (this.param.text && this.param.text.style) {
        // 文字的樣式
        this.setStyleList(this.param.text.style, 'text')
      }
      html = html.replace(
        '[textStyle]',
        this.textStyleList
          ? ' style="' + this.textStyleList.join(' ') + '"'
          : ''
      )
      if (this.param.value && this.param.value.style) {
        // 值的樣式
        this.setStyleList(this.param.value.style, 'value')
      }
      html = html.replace(
        '[valueStyle]',
        this.valueStyleList
          ? ' style="' + this.valueStyleList.join(' ') + '"'
          : ''
      )
      this.$element.html(
        html.replace('[class]', className).replace('[style]', styleName)
      )
    }
    changeColor(param, $ele, index, changeObj) {
      // 換顏色或拿色碼(沒有給$ele就回傳色碼)
      var color
      var colorsClass = {
        green: 'greenLight',
        blue: 'blue',
        black: 'blueDark',
        brown: 'orangeDark',
        red: 'red',
      }

      var colorData = param.data
      if (_.isObject(colorData)) {
        if (index) {
          colorData = colorData[index]
        } else {
          colorData = colorData[Object.keys(colorData)[0]]
        }
      }

      if (param.source && param.source === 'servkitStatusColors') {
        color = servkit.statusColors[colorData]
      } else if (param.source && param.source === 'servkitColors') {
        color = servkit.colors[colorData]
      } else {
        color = colorData
      }
      if ($ele) {
        if (color && (color.indexOf('#') >= 0 || color.indexOf('rgb') >= 0)) {
          if (changeObj === 'txt') {
            $ele.css('color', color)
          } else {
            $ele.css('background-color', color)
          }
        } else {
          var className = _.find($ele[0].classList, (val) => {
            return val.indexOf('color') >= 0
          })
          if (className) {
            $ele.removeClass(className)
            var classList = className.split('-color-')
            classList[1] = colorsClass[color]
            $ele.addClass(classList.join('-color-'))
          }
        }
      } else {
        return color || servkit.statusColors.offline
      }
    }
    dataFormat(value, format, arrayIndex, type) {
      // 回傳實際要呈現的資訊
      var data = '' // 預設為空
      var elementValue = {}

      // if (value !== null) {
      if (format) {
        // 要轉換
        var newValue = '' // 轉換資料文字用(像是警報代碼)
        if (value !== null && value !== undefined) {
          newValue = value
        }
        if (format.value) {
          if (arrayIndex !== undefined) {
            newValue = format.value[arrayIndex]
          } else {
            newValue = format.value
          }
          data = newValue
        }

        if (value) {
          data = value
        }

        if (format.workshift && this.currentWorkShift) {
          data =
            Number(data) - Number(this.currentWorkShift[format.workshift] || 0)
          if (data < 0) {
            data = 0
          }
        }

        if (format.shiftProgramData) {
          if (this.shiftProgramData && this.programName) {
            // if (!this.shiftProgramData[this.programName])
            //   this.shiftProgramData[this.programName] = []
            // if(!this.shiftProgramData[this.programName].length)
            //   this.shiftProgramData[this.programName].push({
            //     date: this.date,
            //     end_oper_millisecond: 0,
            //     end_partcount: 0,
            //     machine_id: this.machineId,
            //     program_name: this.programName,
            //     start_oper_millisecond: 0,
            //     start_partcount: 0,
            //     work_shift: this.workShiftName
            //   })
            if (this.shiftProgramData[this.programName]) {
              var history = 0
              _.each(this.shiftProgramData[this.programName], (val, key) => {
                if (key === this.shiftProgramData[this.programName].length - 1)
                  data =
                    Number(data) -
                    Number(val['start_' + format.shiftProgramData]) +
                    1 +
                    history
                else
                  history +=
                    Number(val['end_' + format.shiftProgramData]) -
                    Number(val['start_' + format.shiftProgramData]) +
                    1
              })
              if (data < 0) data = 0
            } else data = 0
          } else data = 0 // 沒有要扣掉的值就顯示0，不然看起來很像壞掉...
        }

        if (format.type === 'value') {
          if (format.calculator) {
            if (/\d+M\d+S/.test(data))
              data =
                (Number(data.split('M')[0]) * 60 +
                  Number(data.split('M')[1].split('S')[0])) *
                1000
            data = format.calculator.replace(
              /\${value}/g,
              isNaN(data) ? 0 : data || 0
            )
            data = this.getCalculatorValue(data, this.elementValueData)
          }
          data = eval((String(data) || '0').replace(/[\w_-]+\(\)/g, 0)) || 0
          if (!isFinite(data)) data = 0
          if (data < 0) data = 0
          if (format.ceil) data = Math.ceil(data) // 無條件進位
          if (format.floor) data = Math.floor(data) // 無條件捨去
          if (format.round) data = Math.round(data) // 四捨五入
          if (format.decimal) data = Number(data.toFixed(format.decimal))
        }

        elementValue[type || 'value'] = data

        this.monitor.thisSystem = this.system
        this.monitor.elementValueData = [this.id, elementValue]

        if (format.type === 'percent') {
          var decimal = format.decimal ? format.decimal : 0
          if (format.total) {
            // 一定要設定最大值(沒有設的話就不轉換)
            // data = Number(((Number(data) / Number(format.total)) * 100).toFixed(decimal))
            // 要有toFixed()整數的時候才有小數點
            data = (
              Math.round(
                (Number(data) / Number(format.total)) *
                  100 *
                  Math.pow(10, decimal)
              ) / Math.pow(10, decimal)
            ).toFixed(decimal)
          } else {
            data = Number((Number(data) * 100).toFixed(decimal))
          }
          if (format.symbol) {
            data = data + '%'
          }
        }

        if (format.type === 'time') {
          if (format.now) {
            if (format.servertime) {
              data = new Date(this.getServerTime()).getTime()
            } else {
              data = new Date().getTime()
            }
          }

          if (format.cumulative)
            data = this.getCumulativeTime(data, format.output)
          else {
            if (format.utc) {
              data = moment(parseInt(data), format.input || '')
                .utc()
                .format(format.output || 'YYYY/MM/DD HH:mm:ss')
            } else {
              data = moment(parseInt(data), format.input || '').format(
                format.output || 'YYYY/MM/DD HH:mm:ss'
              )
            }
          }
          if (data === 'Invalid date') {
            data = '---'
          }
        }

        if (
          format.preCondition !== undefined &&
          format.preCondition !== null &&
          this.preConditionMap &&
          this.preConditionMap[format.preCondition]
        ) {
          data =
            data !== null && data != undefined
              ? this.preConditionMap[format.preCondition][newValue] || '---'
              : ''
          if (_.isObject(data)) data = data.macro_code_name || '---'
        }

        // 保留原始值再加上其他字串
        if (format.originalValue === 'left') {
          if (format.connectText && data) {
            data = format.connectText + data
          }
          data = newValue + data
        } else {
          if (format.connectText && data) {
            data += format.connectText
          }
          if (format.originalValue === 'right') {
            data += newValue
          }
        }

        if (
          format.noData &&
          (format.noData.find(function (ele) {
            // 如果無資料的值就不顯示
            return ele === value || value === ''
          }) !== undefined ||
            value === undefined ||
            value === null)
        ) {
          data = ' ' // 空格是為了區分沒資料要顯示---的部分
        }

        if (data === '' && !arrayIndex && format.emptyFormat) {
          // 用於text是array為true，無資料時顯示(預設為空字串)
          data = format.emptyFormat
        }

        if (data === '' && (value === '' || value === null)) {
          // 轉換結果為空字串且一開始就是空的話就顯示---
          data = '---'
        }
      } else {
        // 不需轉換
        elementValue[type || 'value'] = value
        this.monitor.thisSystem = this.system
        this.monitor.elementValueData = [this.id, elementValue]
        if (value === '****') {
          data = 'N/A'
        } else if (
          value === undefined ||
          value === null ||
          value === '' ||
          value === 'B'
        ) {
          data = '---'
        } else {
          data = value
        }
      }
      // }
      return data
    }
    initElement(parentName, tag, parent, selector) {
      if (this.param.pattern) {
        // 把樣式帶入設定
        _.each(this.param, (val, key) => {
          if (this.pattern[this.param.pattern][key]) {
            _.extend(this.pattern[this.param.pattern][key], this.param[key])
          }
        })
        _.extend(this.param, this.pattern[this.param.pattern])
      }

      this.setElementDOM(parentName, tag, parent, selector)
      this.$element.removeClass()
      this.$element.removeAttr('style')
      this.setText()
      this.setDefaultValue('Value')
      if (this.param.class) {
        this.classList = []
        this.setClassList()
      }
      if (this.param.style) {
        this.styleList = []
        this.setStyleList()
      }
      if (this.param.grid) {
        this.addGridClass()
      }

      // 元件層(<div data-monitor-id=""></div>那層)css
      if (this.param.width) {
        if (this.param.width === 'auto') {
          this.$element.css('flex-grow', 'inherit')
        } else {
          this.$element.css('width', this.param.width)
        }
      }
      if (this.param.height) {
        this.$element.css('height', this.param.height)
      }
      if (this.param.margin) {
        this.$element.css('margin', this.param.margin)
      }
      if (this.param.padding) {
        this.$element.css('padding', this.param.padding)
      }

      if (this.param.button) {
        this.classList.push('button-element')
        var machineElement = this
        this.$element.on('click', function (e) {
          e.preventDefault()
          var updateData =
            machineElement.preConditionMap.ngQuantity[
              machineElement.programName
            ]
          updateData = _.find(updateData, (val) => {
            return (
              val.operator_id === (machineElement.operatorId || '---') &&
              val.order_no === (machineElement.orderNo || '---') &&
              val.part_no === (machineElement.partNo || '---')
            )
          })
          if (!updateData)
            updateData = {
              program_name: machineElement.programName,
              operator_id: machineElement.operatorId || '---',
              order_no: machineElement.orderNo || '---',
              part_no: machineElement.partNo || '---',
              db_operator_id: machineElement.operatorId || '---',
              db_order_no: machineElement.orderNo || '---',
              db_part_no: machineElement.partNo || '---',
              cycle_time: 1,
              ng_quantity: 0,
            }
          updateData.date = machineElement.date
          updateData.machine_id = machineElement.machineId
          updateData.work_shift = machineElement.workShiftName
          updateData.cycle_time = 1
          updateData.ng_quantity++

          if (
            machineElement.dataFormat(machineElement.partCount, {
              shiftProgramData: 'partcount',
            }) >= updateData.ng_quantity
          )
            // 確認加完之後不大於目前partcount值
            servkit.ajax(
              {
                url: 'api/cosmos/product/insertUpdatePgProduction',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(updateData),
              },
              {
                success: function (data) {
                  console.log(data)
                },
              }
            )
        })
      }

      // 如過沒有值就隱藏元件
      if (
        this.param.autohide &&
        !(this.param.value && this.param.value.content)
      )
        this.$element.addClass('hide')
    }
    addGridClass() {
      // 設定grid
      var className = ''
      if (this.param.grid) {
        className +=
          'col col-xs-12 col-sm-12 col-md-' +
          this.param.grid +
          ' col-lg-' +
          this.param.grid
      }
      this.$element.addClass(className)
    }
  }
  class MachineMonitorWidget extends MachineMonitorElement {
    // widget
    constructor(id, param, monitor, system) {
      super(id, param, monitor, system)
    }
    setHtml() {
      var html = []
      html.push(
        '<div class="jarviswidget jarviswidget-color-darken" data-widget-togglebutton="false"'
      )
      if (!this.param.fullscreen) {
        html.push(' data-widget-fullscreenbutton="false"')
      }
      html.push('>')
      html.push('  <header class="widget-title">')
      if (this.param.icon) {
        html.push('<span class="widget-icon">' + this.param.icon + '</span>')
      }
      html.push('    <h2>' + this.text + '</h2>')
      html.push('  </header>')
      html.push('  <div>')
      html.push('    <div class="widget-body no-padding')
      if (this.classList) {
        html.push(' ' + this.classList.join(' '))
      }
      html.push('"></div>')
      html.push('  </div>')
      html.push('</div>')
      this.drawElement(html)
    }
    initialization(selector) {
      if (selector) this.initElement(null, null, null, selector)
      else this.initElement(null, 'article', `#tabs-${this.parentSystem}>.row`)
      this.setHtml()
      this.$element.find('.widget-title h2').text(this.text || '')
      if (this.param.fullscreen) {
        /* 設定widget button */
        if ($('#widget-grid').data('jarvisWidgets')) {
          $('#widget-grid').data('jarvisWidgets').destroy() // 先把設定刪掉才可以
        }
        window.setup_widgets_desktop() // 重新設定widget button
      }
    }
  }
  class MachineMonitorPartition extends MachineMonitorElement {
    // partition
    constructor(id, param, monitor, system) {
      super(id, param, monitor, system)
    }
    setHtml() {
      var html = []
      html.push('<div[class]>')
      html.push('<div class="partition-title">' + this.text)
      if (this.param.unit) {
        // partition title有()
        html.push('<span class="partition-unit">()</span>')
      }
      html.push('</div>')
      html.push('<div class="partition-body ')
      _.each(this.param.bodyClass, (val, key) => {
        html.push(val === true ? key : val)
      })
      html.push('"[style]></div>')
      html.push('</div>')
      this.drawElement(html)
    }
    initialization(parentName, selector) {
      if (selector) this.initElement(null, null, null, selector)
      else this.initElement(parentName)
      this.setHtml()
    }
    update(data) {
      this.$element.find('.partition-unit').html('(' + (data.unit || '') + ')')
    }
  }
  class MachineMonitorText extends MachineMonitorElement {
    // text
    constructor(id, param, monitor, system) {
      super(id, param, monitor, system)
      this.pattern = {
        1: {
          class: {
            distribute: 'distribute keep-all',
          },
        },
        2: {
          class: {
            distribute: 'distribute keep-all average',
          },
        },
        3: {
          value: {
            style: {
              color: {
                data: 'green',
              },
            },
          },
          class: {
            distribute: 'distribute break-all left',
          },
        },
        4: {
          text: {
            style: {
              'font-size': '1.5em',
              'color': {
                data: 'green',
              },
            },
          },
          value: {
            style: {
              color: {
                data: 'green',
              },
            },
          },
          class: {
            distribute: 'distribute keep-all average',
          },
        },
        5: {
          source: {
            sourceType: 'devicestatus',
            signals: ['color'],
          },
          class: {
            border: true,
          },
          color: {
            content: this.param.system > 1 ? 'G_MCONS()' : 'G_CONS()',
            source: 'servkitStatusColors',
            data: {
              '0': 'offline',
              '11': 'online',
              '12': 'idle',
              '13': 'alarm',
            },
          },
          text: {
            en: '[machinename]',
            zh: '[machinename]',
            zh_tw: '[machinename]',
          },
        },
        6: {
          class: {
            distribute: 'distribute keep-all average',
          },
          icon: {
            type: 'box',
          },
          style: {
            width: '100%',
          },
        },
        7: {
          class: {
            distribute: 'distribute break-all left',
          },
          icon: {
            type: 'line',
          },
        },
      }
    }
    setHtml() {
      var text = this
      var html = []
      if (text.param.icon) {
        text.$element
          .addClass('distribute')
          .addClass('keep-all')
          .addClass('center')
        if (text.param.icon.type === 'line')
          html.push(
            '<div class="' +
              text.param.icon.type +
              '" style="background-color:' +
              text.changeColor(text.param.icon.color) +
              ';"></div>'
          )
        if (text.param.icon.type === 'box')
          html.push(
            '<div class="' +
              text.param.icon.type +
              '" style="background-color:' +
              text.changeColor(text.param.icon.color) +
              ';"></div>'
          )
      }
      html.push('<div[class][style]>')
      html.push('<span class="text"[textStyle]>' + text.text + '</span>')
      if (text.param.value) {
        // 有設定value才有value的span
        var value = ''
        if (_.isArray(text.defaultValue))
          value =
            _.without(
              _.map(text.defaultValue, (val, key) => {
                // 多筆資料要過濾掉空字串並換行
                return text.dataFormat(val, text.param.value.format, key)
              }),
              ' '
            ).join('<br>') || '---'
        // 如果是空的就顯示---喔!
        else value = text.dataFormat(text.defaultValue, text.param.value.format)
        html.push('<span class="value"[valueStyle]>' + value + '</span>')
      }
      html.push('</div>')
      text.drawElement(html)
    }
    initialization(parentName, selector) {
      if (selector) this.initElement(null, null, null, selector)
      else this.initElement(parentName)
      if (this.param.color) {
        if (!this.styleList) this.styleList = []
        this.styleList.push(
          'background-color' + ':' + this.changeColor(this.param.color) + ';'
        )
      }
      this.setHtml()
    }
    update(data) {
      // 給座標用的 對應文字跟值的顯示數量
      if (
        data.value &&
        data.text &&
        _.isArray(data.value) &&
        _.isArray(data.text)
      ) {
        if (data.value.length > data.text.length)
          data.value.splice(
            data.text.length - 1,
            data.value.length - data.text.length
          )
        else if (data.value.length < data.text.length)
          data.text.splice(
            data.value.length - 1,
            data.text.length - data.value.length
          )
      }

      // if (data.value !== undefined) {
      this.updateHtml(data, 'value')
      // }
      if (data.text !== undefined) {
        this.updateHtml(data, 'text')
      }

      if (this.param.autohide) {
        // 如過沒有值就隱藏元件
        if (data && data.value) this.$element.removeClass('hide')
        else this.$element.addClass('hide')
      }
      if (_.isObject(data) && 'color' in data) {
        // 換底色
        this.changeColor(
          this.param.color,
          this.$element.find('.border'),
          data.color
        )
      }
    }
    updateHtml(data, type) {
      // 更新頁面顯示
      var text = this
      var dataText
      if (_.isArray(data[type]) && text.param[type].array) {
        dataText = _.without(
          _.map(data[type], (val, key) => {
            // 多筆資料要過濾掉空字串並換行
            var textValue = val
            // 如果是座標的軸，就不format，因為有可能軸的名稱是B，會被改成---
            if (
              !(
                text.param[type] &&
                text.param[type].content &&
                text.param[type].content === 'G_SRNE()'
              )
            ) {
              textValue = text.dataFormat(val, text.param[type].format, key)
            }
            return textValue
          }),
          ' '
        ).join('<br>')
        if (
          dataText === '' &&
          text.param[type].format &&
          text.param[type].format.emptyFormat
        ) {
          // 如果全部都是空就顯示空值時顯示的資訊(預設為空字串
          dataText = text.param[type].format.emptyFormat
        }
      } else dataText = text.dataFormat(data[type], text.param[type].format)
      text.$element
        .find('.' + type)
        .html(_.isObject(dataText) ? '---' : dataText)
    }
  }
  class MachineMonitorEasyPieChart extends MachineMonitorElement {
    // easypiechart
    constructor(id, param, monitor, system) {
      super(id, param, monitor, system)
      this.pattern = {
        1: {
          value: {
            format: {
              type: 'percent',
              total: this.param.total || 100,
            },
          },
          size: '50',
          class: {
            distribute: 'distribute keep-all',
            position: 'chart-after',
          },
        },
        2: {
          value: {
            format: {
              type: 'percent',
              total: this.param.total || 100,
              symbol: true,
            },
          },
          size: window.screen.width < 3840 ? '150' : '300',
          class: {
            position: 'chart-inside',
          },
        },
        3: {
          value: {
            format: {
              type: 'percent',
              total: this.param.total || 100,
              symbol: true,
            },
          },
          size: window.screen.width < 3840 ? '150' : '300',
          class: {
            position: 'chart-bottom',
          },
        },
      }
    }
    setHtml() {
      if (
        this.param.size &&
        this.param.class &&
        this.param.class.position !== 'chart-after'
      )
        this.$element.css('width', this.param.size + 'px') // 固定寬度，不然text太長會沒辦法換行
      if (this.param.class && this.param.class.position === 'chart-bottom')
        this.$element.addClass('text-center')
      var data = this.dataFormat(this.defaultValue, this.param.value.format)
      if (this.text.length > 20) this.text = this.text.slice(0, 20) + '...'
      var html = []
      html.push('<div[class][style]>')
      html.push(
        '<div class="easy-pie-chart txt-color- easyPieChart" data-percent="' +
          data +
          '" data-pie-size="' +
          this.param.size +
          '" data-rotate="0">'
      )
      if (this.param.class && this.param.class.position !== 'chart-inside') {
        // 文字不在圖裡的話都在圈圈裡顯示值
        html.push('  <span class="percent percent-sign">' + data + '</span>')
      }
      html.push('</div><div class="info">')
      if (
        this.param.class &&
        (this.param.class.position === 'chart-inside' ||
          this.param.class.position === 'chart-bottom')
      ) {
        // 文字在圖裡要多加值的顯示
        html.push('<span class="value">' + data + '</span>')
      }
      if (
        !this.param.class ||
        (this.param.class && this.param.class.position !== 'chart-bottom')
      )
        html.push('<span class="text"> ' + this.text + ' </span>')
      html.push('</div></div>')
      if (this.param.class && this.param.class.position === 'chart-bottom')
        html.push('<span class="text"> ' + this.text + ' </span>')
      this.drawElement(html)
    }
    initialization(parentName, selector) {
      if (selector) this.initElement(null, null, null, selector)
      else this.initElement(parentName)
      this.setHtml()
      this.changeColor(
        this.param.value.color,
        this.$element.find('.easy-pie-chart'),
        null,
        'txt'
      )
    }
    update(data) {
      var ctx = this
      // console.log(data)
      var newValue = ctx.dataFormat(data.value, ctx.param.value.format)
      ctx.$element.find('.easy-pie-chart').data('easyPieChart').update(newValue)
      ctx.$element.find('.value').text(newValue)

      if (data.text) {
        var text = ''
        if (_.isArray(data.text)) {
          _.each(data.text, (val, key) => {
            var textBuf = ctx.dataFormat(val, ctx.param.text.format)
            if (textBuf.length > 20) textBuf = textBuf.slice(0, 20) + '...'
            if (key) text += '<br>'
            text += textBuf
          })
        } else {
          text = ctx.dataFormat(data.text, ctx.param.text.format)
          if (text.length > 20) text = text.slice(0, 20) + '...'
        }
        ctx.$element.find('.text').html(text)
      }

      if (ctx.param.autohide) {
        // 如過沒有值就隱藏元件
        if (data && data.value) ctx.$element.removeClass('hide')
        else ctx.$element.addClass('hide')
      }
    }
  }
  class MachineMonitorProgress extends MachineMonitorElement {
    // 進度條
    constructor(id, param, monitor, system) {
      super(id, param, monitor, system)
      this.pattern = {
        1: {
          value: {
            format: {
              type: 'value',
              decimal: 1,
            },
          },
          max: {
            color: {
              data: 'red',
            },
          },
          min: {
            color: {
              data: 'red',
            },
          },
          indicate: true,
        },
        2: {
          value: {
            format: {
              type: 'value',
              decimal: 1,
            },
          },
          max: {
            color: {
              data: 'red',
            },
          },
          min: {
            color: {
              data: 'red',
            },
          },
          class: {
            distribute: 'distribute keep-all average',
          },
        },
      }
    }
    setHtml() {
      var html = []
      html.push('<div[class]>')
      html.push('<div><span class="text">' + this.text + '</span>')
      if (this.param.indicate || this.param.unit) {
        // 看要不要顯示數值或單位
        html.push('<span class="pull-right">')
        if (this.param.indicate) {
          html.push(
            '<span class="value">' +
              (this.defaultValue || 0) +
              '</span>/' +
              this.param.total
          )
        }
        if (this.param.unit) {
          html.push('<span class="unit">' + this.param.unit.content + '</span>')
        }
        html.push('</span>')
      }
      html.push('</div>')
      html.push('<div class="progress">')
      if (_.isArray(this.defaultValue)) {
        // 堆疊進度條(value.content為多值)
        _.each(this.defaultValue, () => {
          html.push('<div class="progress-bar bg-color-"></div>')
        })
      } else {
        html.push('<div class="progress-bar bg-color-"></div>')
      }
      html.push('</div></div>')
      this.drawElement(html)
    }
    initialization(parentName, selector) {
      if (selector) this.initElement(null, null, null, selector)
      else this.initElement(parentName)
      this.setHtml()
      this.update({
        value: this.defaultValue,
      })
    }
    update(data) {
      // 更新進度條值
      var progress = this
      var value = 0
      var percent = 0
      var colorMap = {}
      if (_.isArray(data.value)) {
        var stackValue = 0
        _.each(data.value.reverse(), (val, key) => {
          var thisKey = data.value.length - key - 1
          value = progress.dataFormat(val, progress.param.value.format)
          stackValue += Number(val)
          percent = progress.dataFormat(stackValue, {
            type: 'percent',
            total: progress.param.total || 100,
          })
          colorMap = progress.param.value.color[thisKey]
          progress.change(
            value,
            percent,
            colorMap,
            progress.$element.find('.progress-bar:eq(' + thisKey + ')')
          )
        })
      } else {
        value = progress.dataFormat(data.value, progress.param.value.format)
        percent = progress.dataFormat(data.value, {
          type: 'percent',
          total: progress.param.total || 100,
        })
        colorMap = progress.param.value.color
        progress.$element.find('.value').text(value)
        progress.change(
          value,
          percent,
          colorMap,
          progress.$element.find('.progress-bar')
        )
      }
    }
    change(value, percent, color, $ele) {
      // 轉換進度條顯示
      var regNum = /^[0-9.+-]+$/

      if (
        this.param.max &&
        regNum.test(value) &&
        regNum.test(this.param.max.content) &&
        Number(value) > Number(this.param.max.content)
      ) {
        this.changeColor(this.param.max.color, $ele)
      } else if (
        this.param.min &&
        regNum.test(value) &&
        regNum.test(this.param.min.content) &&
        Number(value) < Number(this.param.min.content)
      ) {
        this.changeColor(this.param.min.color, $ele)
      } else {
        this.changeColor(color, $ele)
      }
      $ele.css('width', percent + '%')
    }
  }
  class MachineMonitorGauge extends MachineMonitorElement {
    // 儀錶板
    constructor(id, param, monitor, system) {
      super(id, param, monitor, system)
      if (!this.param.max) this.param.max = {}
      if (!this.param.max.format) this.param.max.format = {}
      if (!this.param.min) this.param.min = {}
      if (!this.param.min.format) this.param.min.format = {}
      if (!this.param.value) this.param.value = {}
    }
    setHtml() {
      var html = []
      html.push(
        '<div[class][style]><span class="text">' + this.text + '</span>'
      )
      html.push('<div class="gauge"></div>')
      html.push('</div>')
      this.drawElement(html)
    }
    initialization(parentName, selector) {
      if (selector) this.initElement(null, null, null, selector)
      else this.initElement(parentName)
      this.setDefaultValue('Max')
      this.setDefaultValue('Min')
      _.extend(this.param.max.format, {
        type: 'value',
      })
      _.extend(this.param.min.format, {
        type: 'value',
      })
      if (!this.param.value.format) {
        this.param.value.format = {}
      }
      _.extend(this.param.value.format, {
        type: 'value',
      })
      this.setHtml()
      var element = d3.select(
        `[data-monitor-id="${this.id}"][data-system=${this.system}] .gauge`
      )
      if (!element.select('svg')[0][0]) {
        // 沒有svg才畫
        this.gauge = new Gauge(element)
        var max = this.dataFormat(this.defaultMax, this.param.max.format)
        var min = this.dataFormat(this.defaultMin, this.param.min.format)
        if (min !== max) {
          this.gauge.max = max
          this.gauge.min = min
        }
        this.gauge.render()
        this.gauge.moveTo()
      }
    }
    update(data) {
      var max = this.dataFormat(data.max, this.param.max.format)
      var min = this.dataFormat(data.min, this.param.min.format)
      var value = this.dataFormat(data.value, this.param.value.format)
      if (this.gauge.max !== max || this.gauge.min !== min) {
        this.gauge.max = max
        this.gauge.min = min
        this.gauge.setScale()
      }
      if (this.gauge.value !== value) {
        this.gauge.value = value
        this.gauge.moveTo(data)
      }
    }
  }
  class MachineMonitorImage extends MachineMonitorElement {
    // 圖檔
    constructor(id, param, monitor, system) {
      super(id, param, monitor, system)
    }
    setHtml() {
      this.drawElement([
        '<img src="./app/' + this.dataFormat(this.defaultValue) + '">',
      ])
    }
    initialization(parentName, selector) {
      if (selector) this.initElement(null, null, null, selector)
      else this.initElement(parentName)
      this.setHtml()
    }
  }
  class MachineMonitorDividingLine extends MachineMonitorElement {
    // 分隔線
    constructor(id, param, monitor, system) {
      super(id, param, monitor, system)
    }
    setHtml() {
      this.drawElement(['<hr>'])
    }
    initialization(parentName, selector) {
      if (selector) this.initElement(null, null, null, selector)
      else this.initElement(parentName)
      this.setHtml()
      this.$element.addClass(this.param.type)
    }
  }
  class MachineMonitorSwitch extends MachineMonitorElement {
    // switch
    constructor(id, param, monitor, system) {
      super(id, param, monitor, system)
    }
    setHtml() {
      this.drawElement([
        this.text +
          '<br/><span class="badge bg-color-" style="width: 200px; height: 18px;"><span></span></span>',
      ])
    }
    initialization(parentName, selector) {
      if (selector) this.initElement(null, null, null, selector)
      else this.initElement(parentName)
      this.setHtml()
    }
  }
  class MachineMonitorChart extends MachineMonitorElement {
    // 圖表(預設為折線圖)
    constructor(id, param, monitor, system) {
      super(id, param, monitor, system)
      var labelList = []
      if (
        this.param.legend &&
        this.param.legend.main &&
        this.param.legend.main[lang]
      ) {
        labelList = this.param.legend.main[lang]
      }
      this.pattern = {
        1: {
          // 單值有半透明填滿
          value: {
            format: {
              type: 'value',
            },
          },
          option: {
            colors: ['#57889C'],
            series: {
              lines: {
                lineWidth: 1,
                fill: true,
                fillColor: {
                  colors: [
                    {
                      opacity: 0.4,
                    },
                    {
                      opacity: 0,
                    },
                  ],
                },
                steps: false,
              },
            },
          },
        },
        2: {
          // 多值
          value: {
            color: [
              {
                source: 'servkitColors',
                data: 'red',
              },
              {
                source: 'servkitColors',
                data: 'blue',
              },
            ],
            format: {
              type: 'value',
            },
          },
        },
        3: {
          // 多值多軸
          value: {
            format: {
              type: 'value',
            },
          },
          mulitipleyaxes: true,
          option: {
            yaxes: [
              {
                position: 'left',
                tickDecimals: 1,
                axisLabel: labelList[0] || '',
              },
              {
                position: 'right',
                tickDecimals: 1,
                axisLabel: labelList[1] || '',
              },
            ],
          },
        },
      }
      this.option = {
        xaxis: {
          mode: 'time',
          timezone: 'browser',
          timeformat: '%H:%M:%S',
        },
      }
      this.dataSet = [] // 所有資料
      this.data = [] // 每條線的值
    }
    setHtml() {
      // 拿到html
      var html = []
      html.push('<div[class][style]>')
      html.push('<div class="header">')
      html.push('  <span class="text">' + this.text + '</span>')
      if (!this.param.legend || !this.param.legend.abreast) {
        html.push('  <div class="legend"></div>')
      }
      html.push('</div>')
      html.push('<div class="diagram"></div>')
      if (this.param.legend && this.param.legend.abreast) {
        // legend的位置移到圖的右邊
        // 加上.abreast(並排)的class
        if (html[0].indexOf('class="') >= 0) {
          // 本身有class就加上abreast
          html[0] = html[0].replace('class="', 'class="abreast ')
        } else {
          // 本身沒有class就class加上abreast
          html[0] = html[0].replace('<div', '<div class="abreast"')
        }
        html.push(
          '  <div class="legend hide"><table><tbody></tbody></table></div>'
        )
      }
      html.push('</div>')
      this.drawElement(html)

      if (this.$element.closest('.widget-body').hasClass('black')) {
        if (this.param.option) {
          if (this.param.option.xaxis) {
            this.param.option.xaxis.tickLength = 0
            this.param.option.xaxis.font = {
              color: '#FFFFFF',
            }
          }
          if (this.param.option.yaxis) {
            this.param.option.yaxis.tickLength = 0
            this.param.option.yaxis.font = {
              color: '#FFFFFF',
            }
          }
        } else {
          if (this.option.xaxis) {
            this.option.xaxis.tickLength = 0
            this.option.xaxis.font = {
              color: '#FFFFFF',
            }
            this.option.yaxis.tickLength = 0
            this.option.yaxis.font = {
              color: '#FFFFFF',
            }
          }
        }
      }

      if (
        this.param.legend &&
        this.param.legend.value &&
        this.param.legend.value.style
      ) {
        this.setStyleList(this.param.legend.value.style, 'legendValue')
      }
      if (
        this.param.legend &&
        this.param.legend.text &&
        this.param.legend.text.style
      ) {
        this.setStyleList(this.param.legend.text.style, 'legendText')
      }
    }
    initialization(parentName, selector) {
      var chart = this
      // 初始
      if (selector) chart.initElement(null, null, null, selector)
      else chart.initElement(parentName)
      chart.setHtml() // 拿到html
      var now = new Date().getTime()

      // 設定data
      var index = 0
      var dataMap = {}
      if (_.isArray(chart.defaultValue)) {
        _.each(chart.defaultValue, (val, key) => {
          index = key
          if (chart.param.mulitipleyaxes) {
            dataMap.yaxis = key + 1
          }
          if (chart.param.value.color) {
            dataMap.color = chart.changeColor(
              chart.param.value.color[index] || chart.param.value.color
            )
          }
          chart.setData(
            chart.dataFormat(val, chart.param.value.format),
            index,
            now,
            dataMap
          )
        })
      } else {
        if (chart.param.value.color) {
          dataMap.color = chart.changeColor(
            chart.param.value.color[index] || chart.param.value.color
          )
        }
        chart.setData(
          chart.dataFormat(chart.defaultValue, chart.param.value.format),
          index,
          now
        )
      }

      if (chart.param.legend) {
        // 如果有要顯示圖示
        chart.setDataSet(chart.param.legend.main[lang], 'label')
        chart.option.legend = {
          show: true,
          container: chart.$element.find('.legend'),
        }
      }

      dataMap = {
        // 最大值和最小值的data格式
        color: servkit.colors.red,
        lines: {
          show: true,
          fill: false,
        },
      }
      if (chart.param.max) {
        // 最大值
        chart.setDefaultValue('Max')
        index++
        chart.setData(
          chart.dataFormat(chart.defaultMax, chart.param.value.format),
          index,
          now,
          dataMap
        )
      }
      if (chart.param.min) {
        // 最小值
        chart.setDefaultValue('Min')
        index++
        chart.setData(
          chart.dataFormat(chart.defaultMin, chart.param.value.format),
          index,
          now,
          dataMap
        )
      }
      if (chart.param.option) {
        _.extend(chart.option, chart.param.option)
      }

      chart.plot = $.plot(
        chart.$element.find('.diagram'),
        chart.dataSet,
        chart.option
      )
    }
    setDataSet(value, keyName) {
      // 資料格式：[{data:''}] -> [{data:'', label: ''}]
      var chart = this
      var index = 0
      var dataMap = {}

      if (_.isArray(value)) {
        _.each(value, (val, key) => {
          index = key
          // 塞資料
          if (keyName === 'color') {
            dataMap[keyName] = chart.changeColor(val)
          } else {
            dataMap[keyName] = val
          }
          // 放到set陣列裡
          if (!chart.dataSet[index]) {
            chart.dataSet[index] = JSON.parse(JSON.stringify(dataMap))
          } else {
            _.extend(chart.dataSet[index], dataMap)
          }
        })
      } else {
        // 塞資料
        if (keyName === 'color') {
          dataMap[keyName] = chart.changeColor(chart.param.color, null, value)
        } else {
          dataMap[keyName] = value
        }
        // 放到set陣列裡
        if (!chart.dataSet[index]) {
          chart.dataSet[index] = dataMap
        } else {
          _.extend(chart.dataSet[index], dataMap)
        }
      }
    }
    setData(value, index, now, dataMap) {
      if (!this.data[index]) {
        this.data[index] = []
      }
      if (this.data[index].length >= 100) {
        this.data[index].shift()
      }
      this.data[index].push([now, isNaN(Number(value)) ? 0 : Number(value)])
      if (!this.dataSet[index]) {
        this.dataSet[index] = {
          data: [],
        }
        if (dataMap) {
          _.extend(this.dataSet[index], dataMap)
        }
      }
      this.dataSet[index].data = this.data[index]
    }
    drawCustLegend(color, value, legendText) {
      var tbodyHtml = []
      tbodyHtml.push('<tr>')
      tbodyHtml.push(
        '  <td class="legendColorBox" style="border-color: ' +
          color +
          ';background-color: ' +
          color +
          ';"></td>'
      )
      tbodyHtml.push('  <td class="legendData">')
      if (this.legendTextStyleList) {
        // 有自己的樣式
        tbodyHtml.push(
          '    <span class="text" style="' +
            this.legendTextStyleList.join('') +
            '">' +
            (legendText || '---') +
            '</span>'
        )
      } else {
        tbodyHtml.push(
          '    <span class="text">' + (legendText || '---') + '</span>'
        )
      }
      if (!(this.param.legend.value && this.param.legend.value.inline)) {
        // value在text的下一行
        tbodyHtml.push('    <br>')
      }
      if (this.legendValueStyleList) {
        // 有自己的樣式
        tbodyHtml.push(
          '    <span class="value" style="' +
            this.legendValueStyleList.join('') +
            '">' +
            value +
            '</span>'
        )
      } else {
        tbodyHtml.push('    <span class="value">' + value + '</span>')
      }
      tbodyHtml.push('  </td>')
      tbodyHtml.push('</tr>')
      this.$element.find('.legend').removeClass('hide')
      this.$element.find('.legend tbody').append(tbodyHtml.join(''))
    }
    update(data) {
      var chart = this
      var index = 0
      var now = new Date().getTime()
      if (_.isArray(data.value)) {
        _.each(data.value, (val, key) => {
          index = key
          chart.setData(
            chart.dataFormat(val, chart.param.value.format),
            index,
            now
          )
        })
      } else {
        chart.setData(
          chart.dataFormat(data.value, chart.param.value.format),
          index,
          now
        )
      }
      if (chart.param.max) {
        // 最大值
        index++
        chart.setData(
          chart.dataFormat(chart.defaultMax, chart.param.value.format),
          index,
          now
        )
      }
      if (chart.param.min) {
        // 最小值
        index++
        chart.setData(
          chart.dataFormat(chart.defaultMin, chart.param.value.format),
          index,
          now
        )
      }

      // if (this.plot) {
      //   this.plot.destroy()
      // }
      this.plot = $.plot(
        this.$element.find('.diagram'),
        this.dataSet,
        this.option
      )
    }
    setTicksData(name, ticks) {
      var chart = this
      var today = moment().format('MM/DD')
      chart[name] = []
      _.each(ticks, (val) => {
        if (/^-?\d{1,3}$/.test(val[1]))
          chart[name].push([val[0], chart.getRealDate(today, val[1], 'MM/DD')])
        else chart[name].push(val)
      })
    }
  }
  class MachineMonitorBarChart extends MachineMonitorChart {
    // 圖表 - 條
    constructor(id, param, monitor, system) {
      super(id, param, monitor, system)
      var barChart = this
      this.pattern = {
        1: {
          value: {
            format: {
              type: 'value',
            },
          },
          mulitiplebars: true,
          option: {
            xaxis: {
              show: true,
            },
            yaxis: {
              show: true,
              max: 100,
              min: 0,
            },
          },
        },
        2: {
          value: {
            format: {
              type: 'value',
            },
            color: {
              source: 'servkitStatusColors',
              data: {
                '0': 'offline',
                '11': 'online',
                '12': 'idle',
                '13': 'alarm',
              },
            },
          },
          preCondition: ['today'],
          tickformat: {
            time: {
              preCondition: 'today',
            },
          },
          option: {
            series: {
              bars: {
                show: true,
              },
              stack: true,
            },
            bars: {
              barWidth: 24 * 60 * 60 * 450,
              lineWidth: 1,
              horizontal: true,
            },
            xaxis: {
              show: true,
              mode: 'time',
              tickSize: [1, 'hour'],
              tickFormatter: function (v, axis) {
                // 沒有的話會從格林威治時間開始
                var time = moment().add(v)
                if (barChart.param.tickformat.time) {
                  if (
                    barChart.preConditionMap &&
                    barChart.preConditionMap[
                      barChart.param.tickformat.time.preCondition
                    ]
                  ) {
                    time = moment(
                      _.first(
                        barChart.preConditionMap[
                          barChart.param.tickformat.time.preCondition
                        ]
                      ).start
                    ).add(v)
                  }
                }
                var tick = time.format('HH:mm')
                if (barChart.param.tickformat.format) {
                  tick = time.format(barChart.param.tickformat.format)
                }
                return tick
              },
            },
            yaxis: {
              show: false,
            },
          },
        },
      }
      this.option = {
        series: {
          bars: {
            lineWidth: 0,
            show: true,
            fill: 1,
          },
        },
        bars: {
          barWidth: 1,
        },
        xaxis: {
          show: true,
        },
        yaxis: {
          show: true,
        },
      }
    }
    initialization(parentName, selector) {
      var chart = this
      // 初始
      if (selector) chart.initElement(null, null, null, selector)
      else chart.initElement(parentName)
      chart.setHtml()
      var now = new Date().getTime()

      if (
        chart.param.option &&
        chart.param.option.bars &&
        chart.param.option.bars.horizontal
      ) {
        now = 1
      }

      // 設定data
      var index = 0
      var dataMap = {}
      if (_.isArray(chart.defaultValue)) {
        _.each(chart.defaultValue, (val, key) => {
          index = key
          if (chart.param.mulitiplebars) {
            dataMap.bars = {
              barWidth: 0.2,
              order: key + 1,
            }
          }
          if (chart.param.value.color) {
            dataMap.color = chart.changeColor(
              chart.param.value.color[index] || chart.param.value.color
            )
          } else {
            dataMap.color = servkit.statusColors.offline
          }
          if (_.isArray(val)) {
            _.each(val, (v) => {
              chart.setData(v[1], index, v[0], dataMap)
            })
          } else {
            chart.setData(
              chart.dataFormat(val, chart.param.value.format),
              index,
              now,
              dataMap
            )
          }
        })
      } else {
        if (chart.param.value.color) {
          dataMap.color = chart.changeColor(
            chart.param.value.color[index] || chart.param.value.color
          )
        } else {
          dataMap.color = servkit.statusColors.offline
        }
        chart.setData(
          chart.dataFormat(chart.defaultValue, chart.param.value.format),
          index,
          now,
          dataMap
        )
      }

      if (chart.param.option) {
        _.extend(chart.option, chart.param.option)
      }
      if (chart.param.legend) {
        // 如果有要顯示圖示
        chart.setDataSet(chart.param.legend.main[lang], 'label')
        // chart.dataSet = []
        chart.option.legend = {
          show: true,
          container: chart.$element.find('.legend'),
        }
      }
      if (chart.param.xticks) {
        chart.option.xaxis.show = true
        chart.setTicksData('xticks', chart.param.xticks)
        chart.option.xaxis.ticks = chart.xticks
      }

      dataMap = {
        // 最大值和最小值的data格式
        color: servkit.colors.red,
        lines: {
          show: true,
          fill: false,
        },
      }
      if (chart.param.max) {
        // 最大值
        chart.setDefaultValue('Max')
        index++
        chart.setData(
          chart.dataFormat(chart.defaultMax, chart.param.value.format),
          index,
          now,
          dataMap
        )
      }
      if (chart.param.min) {
        // 最小值
        chart.setDefaultValue('Min')
        index++
        chart.setData(
          chart.dataFormat(chart.defaultMin, chart.param.value.format),
          index,
          now,
          dataMap
        )
      }
      // console.log(chart.dataSet, chart.option)
      chart.plot = $.plot(
        chart.$element.find('.diagram'),
        chart.dataSet,
        chart.option
      )
      // 暫時解畫barchart的時候取的是min-height，可是後面的元件把barchart的高度擠小的問題
      chart.$element.find('.diagram').trigger('resize')
    }
    update(data) {
      var chart = this
      var dataSet = []
      var ticks = []
      var now = new Date().getTime()
      _.each(data.value, (val, key) => {
        if (val.color) {
          dataSet.push(val)
          dataSet[key].color = chart.changeColor(
            chart.param.value.color,
            null,
            val.color
          )
        } else {
          var dataMap = {
            data: [],
          }
          if (chart.param.mulitiplebars) {
            dataMap.bars = {
              barWidth: 0.2,
              order: key + 1,
            }
          }
          if (chart.param.value.color) {
            dataMap.color = chart.changeColor(
              chart.param.value.color[key] || chart.param.value.color
            )
          } else {
            dataMap.color = servkit.statusColors.offline
          }
          if (!chart.option.xaxis.ticks) {
            chart.option.xaxis.ticks = []
          }
          if (_.isArray(val)) {
            ticks = []
            _.each(val, (v, k) => {
              ticks.push([k, moment(v[2]).format('MM/DD')])
              // chart.option.xaxis.ticks[k] = [k, moment(v[2]).format('MM/DD')]
              dataMap.data.push([v[0], v[1]])
              // chart.setData(v[1], key, v[0], dataMap)
            })
          } else {
            chart.setData(
              chart.dataFormat(val, chart.param.value.format),
              key,
              now,
              dataMap
            )
          }
          if (chart.param.legend) {
            // 如果有要顯示圖示
            chart.setDataSet(chart.param.legend.main[lang], 'label')
            dataMap.label = chart.dataSet[key].label
          }
          dataSet[key] = dataMap
        }
      })
      if (ticks.length) chart.plot.getOptions().xaxes[0].ticks = ticks
      // console.log(chart.plot.getOptions())
      // console.log(data.value, dataSet, chart.option)
      // if (chart.plot) {
      //   chart.plot.destroy()
      // }
      // console.log(dataSet, chart.option)
      if (chart.plot) {
        chart.plot.setData(dataSet)
        chart.plot.setupGrid()
        chart.plot.draw()
      } else
        chart.plot = $.plot(
          chart.$element.find('.diagram'),
          dataSet,
          chart.option
        )
      chart.$element.data('plot', {
        // plot: chart.plot,
        data: dataSet,
        option: chart.option,
      })
    }
  }
  class MachineMonitorPieChart extends MachineMonitorChart {
    // 圖表 - 圓餅
    constructor(id, param, monitor, system) {
      super(id, param, monitor, system)
      this.pattern = {
        1: {
          source: {
            sourceType: 'devicestatus',
            signals: ['value', 'text'],
          },
          value: {
            content: 'G_CONS()',
          },
          color: {
            source: 'servkitStatusColors',
            data: {
              0: 'offline',
              11: 'online',
              12: 'idle',
              13: 'alarm',
            },
          },
          text: {
            en: {
              0: 'offline',
              11: 'working',
              12: 'idle',
              13: 'alarm',
            },
            zh: {
              0: 'offline',
              11: 'working',
              12: 'idle',
              13: 'alarm',
            },
            zh_tw: {
              0: 'offline',
              11: 'working',
              12: 'idle',
              13: 'alarm',
            },
          },
        },
      }
      this.option = {
        series: {
          pie: {
            show: true,
            innerRadius: 0.55,
          },
        },
      }
    }
    initialization(parentName, selector) {
      var chart = this
      // 初始
      if (selector) chart.initElement(null, null, null, selector)
      else chart.initElement(parentName)
      chart.setHtml()

      if (chart.$element.closest('.widget-body').hasClass('black')) {
        // 如果是黑板要把圈圈的周圍的白線用掉
        chart.option.series.pie.stroke = {
          width: 0.1,
          color: '#524e4e',
        }
      }

      chart.setDataSet(chart.defaultValue || [1], 'data') // 設定set陣列的data(如果資料是空的，至少塞個值讓他可以顯)
      chart.setDataSet(
        chart.defaultValue
          ? chart.param.color
          : {
              source: 'servkitStatusColors',
              data: 'offline',
            },
        'color'
      ) // 設定set陣列的color(如果資料是空的，全部顯示離線的顏色)

      if (chart.param.legend && chart.param.legend.main) {
        // 如果有要顯示圖示
        _.each(chart.defaultValue, (val, key) => {
          chart.drawCustLegend(
            chart.changeColor(chart.param.color[key]),
            val,
            chart.param.legend.main[lang][key]
          )
        })
        chart.$element.find('.abreast .header').addClass('hasValue')
      }

      // 資料格式：[{data: NUMBER, color: ''}]
      chart.plot = $.plot(
        chart.$element.find('.diagram'),
        chart.dataSet,
        chart.option
      )
    }
    update(data) {
      var chart = this
      // chart.$element.find('.text').text(chart.param.text[lang][data.value || '0'])
      if (chart.$element.find('.abreast').length) {
        // 如果是圖與圖示並排，就要判斷是否有值
        if (
          data &&
          data.value &&
          !chart.$element.find('.abreast .header').hasClass('.hasValue')
        ) {
          chart.$element.find('.abreast .header').addClass('hasValue')
        } else if (
          (!data || !data.value) &&
          chart.$element.find('.abreast .header').hasClass('.hasValue')
        ) {
          chart.$element.find('.abreast .header').removeClass('hasValue')
        }
      }
      if (_.isObject(data.value)) {
        chart.dataSet = []
        var values = Object.values(data.value)
        if (data.value.power_minute) {
          // 如果是閒置時間跟通電時間就變成[閒置時間, 通電時間-閒置時間]
          values[0] = data.value.idle_minute
          values[1] = data.value.power_minute - data.value.idle_minute
        }
        chart.setDataSet(values || [1], 'data') // 設定set陣列的data(如果資料是空的，至少塞個值讓他可以顯)
        chart.setDataSet(chart.param.color, 'color') // 設定set陣列的color

        // 如果為動態的text
        if (
          chart.param.text &&
          chart.param.text.content &&
          chart.param.text.content.startsWith('${') &&
          chart.param.text.content.endsWith('}')
        ) {
          var textFormat
          if (chart.param.text.format)
            textFormat = JSON.parse(JSON.stringify(chart.param.text.format))
          if (
            textFormat.total &&
            textFormat.total.startsWith('${') &&
            textFormat.total.endsWith('}')
          )
            textFormat.total = data.value[chart.getKeyName(textFormat.total)]
          chart.$element
            .find('.text')
            .html(
              chart.dataFormat(
                data.value[chart.getKeyName(chart.param.text.content)],
                textFormat
              )
            )
        }
        if (chart.param.legend) {
          // 如果有要顯示圖示，圖示是資料來源為動態
          chart.$element.find('.legend tbody').empty()
          var dataIndex = 0 // 算目前是第幾筆資料(color轉換要用)
          // 因為要把tatol加到format裡面所以拉出來先判斷legend的value有沒有format
          if (chart.param.legend.value && chart.param.legend.value.format) {
            var valueFormat = JSON.parse(
              JSON.stringify(chart.param.legend.value.format)
            )
            valueFormat.total = values.reduce(function (a, b) {
              return a + b
            }, 0)
          }
          _.each(data.value, (val, key) => {
            var value = val
            var text = key
            if (valueFormat) {
              value = chart.dataFormat(val, valueFormat)
            }
            if (chart.param.legend.text && chart.param.legend.text.format) {
              text = chart.dataFormat(key, chart.param.legend.text.format)
            }
            chart.drawCustLegend(
              chart.changeColor(chart.param.color[dataIndex]),
              value,
              text
            )
            dataIndex++
          })
        }
      } else {
        chart.setDataSet(data.value ? [data.value] : [1], 'data') // 設定set陣列的data(如果資料是空的，至少塞個值讓他可以顯)
        chart.setDataSet(data.value || '0', 'color') // 設定set陣列的color
      }
      var text = chart.param.text ? chart.param.text[lang] : ''
      if (_.isObject(text))
        chart.$element.find('.header .text').text(text[data.value])

      // if (chart.plot) {
      //   chart.plot.destroy()
      // }
      chart.plot = $.plot(
        chart.$element.find('.diagram'),
        chart.dataSet,
        chart.option
      )
    }
  }
  class MachineMonitorSparkLine extends MachineMonitorElement {
    // sparkline
    constructor(id, param, monitor, system) {
      super(id, param, monitor, system)
      var color = this.changeColor(this.param.value.color)
      this.pattern = {
        1: {
          option: {
            type: 'line',
            lineColor: color || '#FFFFFF',
            fillColor: null,
            spotRadius: 0,
            lineWidth: 2.5,
            disableTooltips: true,
            disableHighlight: true,
            width: '100%',
            height: '25%',
          },
        },
        2: {
          option: {
            type: 'bar',
            barColor: color || '#FFFFFF',
            disableTooltips: true,
            barWidth: '10%',
            height: '25%',
            barSpacing: 10,
          },
        },
      }
    }
    setHtml() {
      this.drawElement(['<div class="sparkline-graph"></div>'])
    }
    initialization(parentName, selector) {
      if (selector) this.initElement(null, null, null, selector)
      else this.initElement(parentName)
      if (this.param.value) {
        this.setHtml()
        this.$element
          .find('.sparkline-graph')
          .sparkline(this.dataFormat(this.defaultValue), this.param.option)
      }
    }
    update(data) {
      if (data.value)
        this.$element
          .find('.sparkline-graph')
          .sparkline(this.dataFormat(data.value), this.param.option)
    }
  }
  return function (param, machineId) {
    return new MachineMonitor(param, machineId, true)
  }
})(this, $, _, servkit)

exports.getParamFile = function (machineId, brandId, callback) {
  // 決定拿哪一份設定檔
  var pathArray = [
    'equipMonitor/users/' + machineId + '.json',
    'equipMonitor/users/' + machineId + '.csv',
    'equipMonitor/template/' + brandId + '.json',
    'equipMonitor/template/' + brandId + '.csv',
  ]
  var index = 0

  function getParamByFile() {
    servkit.ajax(
      {
        url: 'api/getdata/custParamFile',
        type: 'GET',
        contentType: 'application/json',
        data: {
          filePath: pathArray[index],
        },
      },
      {
        success: function (response) {
          var configData = []
          if (pathArray[index].indexOf('.csv') >= 0) {
            _.each(response, function (row) {
              configData.push(row.split(','))
            })
          } else {
            try {
              configData = JSON.parse(response.join(''))
            } catch (e) {
              configData = response.join('')
            }
          }
          if (_.isArray(configData)) {
            configData = changeParam(configData, brandId)
          }
          callback(configData)
        },
        fail: function () {
          if (index < pathArray.length - 1) {
            index++
            getParamByFile()
          } else {
            callback([])
            $.smallBox({
              title: '找不到此廠牌template設定檔',
              content: '<i class="fa fa-clock-o"></i> <i>2 seconds ago...</i>',
              color: '#C79121',
              iconSmall: '',
              timeout: 60000,
            })
          }
        },
      }
    )
  }
  getParamByFile()
}

function changeParam(csv, brandId) {
  var indexMap = {
    // 計算元件數量
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
  var paramMap = {
    // 轉換後的設定值
    component: {},
    order: [],
    system: 0,
  }
  var parentMap = {
    // 存元件路徑
    widget: null,
    partition: null,
  }
  var prePosition, lastPosition, lastWidget, partition, lastPartition
  var widgetMap
  var diff
  _.each(csv, (val, key) => {
    // 拿到param的index
    if (key) {
      // 從第二行開始
      var param = getParam(val)
      if (paramMap.system < param['類型']) paramMap.system = param['類型']
      if (param.signal || param.type === 'img') {
        partition = param.position.split('_')[0]

        // 建立widget
        var widget = param.position.split('_')[0].split('-')[0]
        if (lastWidget !== widget) createWidget(widget, param)

        diff = lastPartition !== partition // 判斷跟前一筆不同區\
        var elementParam = {
          // 預設元件設定值
          source: {
            sourceType: 'devicestatus',
            signals: ['value'],
          },
          value: {
            content: param.signal,
          },
          text: {
            en: param.en,
            zh: param.zh,
            zh_tw: param.zh_tw,
          },
          system: param['類型'],
        }
        switch (partition) {
          case 'T1-A':
            addElement(widget, param, getElementParam(param, elementParam))
            break
          case 'T1-B':
            if (diff) {
              addDefaultPartition('4', true, false, '9px 5px') // 加上預設框
              createMachineStatus() // 加上機台狀態
            }
            addElement(widget, param, getElementParam(param, elementParam))
            break
          case 'T1-C':
            if (diff) addDefaultPartition('12', false, true, false) // 加上預設框
            addElement(widget, param, getElementParam(param, elementParam))
            break
          case 'T2-A':
            if (diff)
              addDefaultPartition('5', 'distribute break-all', false, '3px 9px') // 加上預設框
            addElement(widget, param, getElementParam(param, elementParam))
            if (diff) createMachineStatus() // 加上機台狀態
            break
          case 'T2-B':
            if (diff && lastPartition !== 'T2-A')
              addDefaultPartition('5', 'distribute break-all', false, '9px') // 加上預設框
            if (diff) {
              paramMap.component['partition#' + (indexMap.partition + 1)] = {
                grid: '12',
              }
              if (!widgetMap.order) widgetMap.order = []
              widgetMap.order.push('partition#' + (indexMap.partition + 1))
              indexMap.partition++
              // 把map改成新建立的partition
              parentMap.partition = 'partition#' + indexMap.partition
              widgetMap = paramMap.component[parentMap.partition]
            }
            if (diff) createMachineStatus() // 加上機台狀態
            addElement(widget, param, getT2BParam(param, elementParam))
            break
          case 'T2-C':
            if (diff && lastPartition !== 'T2-A' && lastPartition !== 'T2-B') {
              addDefaultPartition('5', 'distribute break-all', false, '3px 9px') // 加上預設框
              createMachineStatus() // 加上機台狀態
            }
            addElement(widget, param, getElementParam(param, elementParam))
            break
          case 'T2-D':
            if (diff) addDefaultPartition('7', false, true, false) // 加上預設框
            addElement(widget, param, getElementParam(param, elementParam))
            break
          case 'P':
            if (diff)
              paramMap.component[parentMap.widget].class = {
                border: true,
              }

            if (lastPosition !== param.position) {
              createInsidePartition(param, param.cardGrid || '3')
              widgetMap = paramMap.component['partition#' + indexMap.partition]
            } else widgetMap = paramMap.component[parentMap.widget]
            addElement(widget, param, getPParam(param, elementParam))
            break
          default:
            addElement(widget, param, getElementParam(param, elementParam))
            break
        }
      }
      // addDefaultElement(param.position, val, widget)
      prePosition = lastPosition
      lastPosition = param.position
      lastPartition = partition
    }
  })

  // 如果為多系統要改一下機台狀態的signal
  if (paramMap.system > 1) {
    _.each(paramMap.component, (param, key) => {
      if (key.includes('text#') && param.pattern === '5')
        param.system = paramMap.system
    })
  }

  function getParam(val) {
    var param = {}
    _.each(val, (v, key) => {
      param[csv[0][key]] = v
      if (csv[0][key] === 'position') {
        var alphabets = /[A-Za-z]/
        if (!alphabets.test(v)) {
          param[csv[0][key]] = Number(v)
          if (v === '0') {
            param[csv[0][key]] = '0'
          } else if (param[csv[0][key]] < 2) {
            param[csv[0][key]] = 'T1-A'
          } else if (param[csv[0][key]] < 6) {
            param[csv[0][key]] = 'T1-B'
          } else if (param[csv[0][key]] < 10) {
            param[csv[0][key]] = 'T1-C'
          } else if (param[csv[0][key]] < 11) {
            param[csv[0][key]] = 'P_' + v.split('.')[1]
          } else {
            param[csv[0][key]] = 'O' + (param[csv[0][key]] - 10)
          }
        }
      }
    })
    return param
  }

  function createWidget(widget, param) {
    var widgetParam = {
      grid: param.groupGrid || '12',
      icon: param.groupIcon,
      text: {
        en: param['groupName-en'],
        zh: param['groupName-zh'],
        zh_tw: param['groupName-zh_tw'],
      },
    }

    // 沒有值時建立預設值
    if (widget === 'P') {
      // 座標widget的預設值不一樣
      if (!widgetParam.icon) widgetParam.icon = '<i class="fa fa-reorder"></i>'
      if (
        !widgetParam.text.en &&
        !widgetParam.text.zh &&
        !widgetParam.text.zh_tw
      ) {
        widgetParam.text.en = 'coordinate'
        widgetParam.text.zh = '座标'
        widgetParam.text.zh_tw = '座標'
      }
    } else if (widget.indexOf('O') === 0) {
      widgetParam.class = {
        border: true,
      }
    } else {
      if (!widgetParam.icon)
        widgetParam.icon = '<i class="glyphicon glyphicon-stats"></i>'
      if (
        !widgetParam.text.en &&
        !widgetParam.text.zh &&
        !widgetParam.text.zh_tw
      ) {
        widgetParam.text.en = 'Dashboard'
        widgetParam.text.zh = '主要资讯'
        widgetParam.text.zh_tw = '主要資訊'
      }
    }

    // 建立元件
    widgetMap = paramMap
    createElement(widgetParam, 'widget')

    // 設定目前的值
    var widgetId = 'widget#' + indexMap.widget
    widgetMap = paramMap.component[widgetId]
    parentMap.widget = widgetId
    parentMap.partition = null
    lastWidget = widget
  }

  function addDefaultPartition(grid, distribute, border, padding) {
    // 加上預設框
    var partitionParam = {}
    partitionParam.grid = grid
    if (padding)
      partitionParam.style = {
        padding: padding,
      }
    if (distribute)
      partitionParam.bodyClass = {
        distribute: 'distribute break-all',
      }
    if (border)
      partitionParam.class = {
        border: true,
      }
    widgetMap = paramMap.component[parentMap.widget] // partition建在widget上
    createElement(partitionParam, 'partition')

    // 把map改成新建立的partition
    parentMap.partition = 'partition#' + indexMap.partition
    widgetMap = paramMap.component[parentMap.partition]
  }

  function addElement(widget, param, elementParam) {
    if (partition !== 'T2-B' && partition !== 'P') {
      if (lastPartition === partition && lastWidget === widget) {
        // 同widget
        if (parentMap.partition)
          widgetMap = paramMap.component[parentMap.partition]
        else widgetMap = paramMap.component[parentMap.widget]
      }
      if (lastPartition === 'T2-B') {
        parentMap.partition = 'partition#' + (indexMap.partition - 1)
        widgetMap = paramMap.component[parentMap.partition]
      }
      if (param.signal === 'G_ALAM()') addAlarmPreCondition() // 警報代碼比較特別

      if (lastPosition === param.position) {
        if (
          prePosition !== param.position &&
          param.position.indexOf('_') >= 0
        ) {
          // 加上多值時的框
          var elementId = widgetMap.order[widgetMap.order.length - 1]
          widgetMap.order.pop()
          createInsidePartition(param, param.cardGrid)
          if (elementId.indexOf('text') === 0)
            paramMap.component[elementId].pattern = '4'
          delete paramMap.component[elementId].grid
          widgetMap = paramMap.component['partition#' + indexMap.partition]
          if (!widgetMap.order) widgetMap.order = []
          widgetMap.order.push(elementId)
        }
        if (elementParam && param.position.indexOf('_') >= 0) {
          if (param.type === 'text') elementParam.pattern = '4' // 多值時的樣式
          delete elementParam.grid // 多值時不要有grid
        } else if (parentMap.partition)
          widgetMap = paramMap.component[parentMap.partition]
        // 第三個以上的多值，給他正確的位置
        if (prePosition === param.position && param.position.indexOf('_') >= 0)
          widgetMap = paramMap.component['partition#' + indexMap.partition]
      } else {
        if (param.position.indexOf('_') < 0 && parentMap.partition)
          widgetMap = paramMap.component[parentMap.partition]
        // if (elementParam && partition !== 'T2-A') elementParam.grid = param.cardGrid
      }
    }
    if (elementParam) createElement(elementParam, param.type) // 加上元件
  }

  function getElementParam(param, elementParam) {
    if (
      partition === 'T1-A' ||
      partition === 'T1-C' ||
      partition === 'T2-D' ||
      partition === 'P' ||
      partition.indexOf('O') === 0
    )
      elementParam.grid = param.cardGrid || '12'
    if (param.sourceType === 'API') {
      elementParam.source.sourceType = 'api'
      elementParam.source.url = param.source
      delete elementParam.source.signals
    }
    if (param.index) elementParam.value.index = param.index
    switch (param.type) {
      case 'img':
        param.type = 'image'
        delete elementParam.text
        delete elementParam.source
        elementParam.value.content = param.en || param.zh || param.zh_tw
        if (partition === 'T1-B') elementParam.height = '17em'
        break
      case 'gragus':
        param.type = 'gauge'
        setCalculatorSignal(param, elementParam, 'max')
        setCalculatorSignal(param, elementParam, 'min')
        break
      case 'line_chart':
        getLineChartParam(param, elementParam, '1')
        break
      case 'mulitiple_line_chart':
        if (!getLineChartParam(param, elementParam, '2')) return null // 回傳false的話就把param刪掉，表示不新增元件
        break
      case 'mulitiple_yaxis_line_chart':
        if (!getLineChartParam(param, elementParam, '3')) return null // 回傳false的話就把param刪掉，表示不新增元件
        break
      case 'switch':
        if (param.color)
          elementParam.value.color = {
            data: param.color,
          }
        break
      case 'progress':
      case 'pie_chart':
        elementParam.pattern = '1'
        if (param.type === 'progress' && !param.en && !param.zh && !param.zh_tw)
          delete elementParam.text
        if (param.type === 'pie_chart') param.type = 'easypiechart'
        if (param.color)
          elementParam.value.color = {
            data: param.color,
          }
        if (param.unit)
          elementParam.unit = {
            content: param.unit,
          }
        if (param.max) elementParam.total = param.max
        if (param.min)
          elementParam.min = {
            content: param.min,
          }
        break
      case 'time_format':
        elementParam.pattern = '1'
        param.type = 'text'
        var format = param.format.split('|')
        if (partition === 'T2-A') {
          elementParam.en += '&nbsp;:&nbsp;'
          elementParam.zh += '&nbsp;:&nbsp;'
          elementParam.zh_tw += '&nbsp;:&nbsp;'
          format = ['YYYYMMDDHHmmss', 'HH:mm:ss']
        }
        elementParam.value.format = {
          type: 'time',
          input: format[0],
          output: format[1],
        }
        break
      case 'time':
        elementParam.pattern = '3'
        param.type = 'text'
        elementParam.value.format = {
          type: 'time',
          utc: true,
          output: 'HH[H] mm[M] ss[S]',
        }
        switch (param.signal) {
          case 'G_ELCT()':
            elementParam.value.format.workshift = 'power_millisecond'
            break
          case 'G_CUTT()':
            elementParam.value.format.workshift = 'cut_millisecond'
            break
          case 'G_OPRT()':
            elementParam.value.format.workshift = 'oper_millisecond'
            break
        }
        break
      case 'text':
        elementParam.pattern = '3'
        if (param.signal === 'G_ALAM()') {
          // 警報代碼比較特別
          elementParam.pattern = '3'
          elementParam.value.array = true
          elementParam.value.format = {
            preCondition: 'alarm',
            connectText: ' : ',
            originalValue: 'left',
            noData: ['-1'],
            emptyFormat: '---',
          }
        }
        break
    }
    return elementParam
  }

  function getLineChartParam(param, elementParam, pattern) {
    param.type = 'linechart'
    elementParam.grid = '8'
    if (pattern !== '1')
      if (lastPosition === param.position) {
        // 多值才需要後面的行為
        paramMap.component[
          'linechart#' + indexMap.linechart
        ].value.content.push(param.signal)
        paramMap.component[
          'linechart#' + indexMap.linechart
        ].legend.main.en.push(param.en)
        paramMap.component[
          'linechart#' + indexMap.linechart
        ].legend.main.zh.push(param.zh)
        paramMap.component[
          'linechart#' + indexMap.linechart
        ].legend.main.zh_tw.push(param.zh_tw)
        return false
      } else {
        elementParam.value.content = [param.signal]
        elementParam.legend = {
          main: {
            en: [param.en],
            zh: [param.zh],
            zh_tw: [param.zh_tw],
          },
        }
        elementParam.text = {
          en: param['label-en'],
          zh: param['label-zh'],
          zh_tw: param['label-zh_tw'],
        }
        elementParam.pattern = pattern
      }
    return elementParam
  }

  function getT2BParam(param, elementParam) {
    // 設定T2-B區的元件
    if (lastPosition === param.position) {
      paramMap.component['text#' + indexMap.text].value.content.push(
        param.signal
      )
      paramMap.component['text#' + indexMap.text].value.format.value.push(
        param[servkit.getCookie('lang')]
      )
      return null
    } else {
      delete elementParam.text
      elementParam.value = {
        content: [param.signal],
        array: true,
        format: {
          preCondition: 'alarm',
          connectText: ' : ',
          originalValue: 'left',
          value: [param[servkit.getCookie('lang')]],
          noData: ['0'],
        },
        style: {
          'color': {
            data: 'red',
          },
          'font-size': '1.5em',
        },
      }
      param.type = 'text'
      addAlarmPreCondition()
    }
    return elementParam
  }

  function getPParam(param, defaultParam) {
    // 設定P區的元件
    var coordinatesBuf = defaultParam
    if (lastPosition === param.position)
      coordinatesBuf = paramMap.component['text#' + indexMap.text] // 相同元件直接改元件設定值

    if (param.type === 'text') {
      // signal設定
      coordinatesBuf.value.array = true
      coordinatesBuf.value.content = param.signal
    } else if (param.type === 'label') {
      // text設定
      coordinatesBuf.text = {
        content: param.signal,
        array: true,
      }
      coordinatesBuf.source.signals.push('text')
    } else if (param.type === 'unit') {
      // 單位設定(會放在外面那層partition)
      paramMap.component['partition#' + indexMap.partition].source = {
        sourceType: 'devicestatus',
        signals: ['unit'],
      }
      paramMap.component['partition#' + indexMap.partition].unit = {
        content: param.signal,
      }
      return null
    }

    if (lastPosition === param.position) return null // 如果是相同元件就直接回傳null，就不往下了
    coordinatesBuf.pattern = '4'
    param.type = 'text'
    paramMap.component['partition#' + indexMap.partition].text = {
      en: param.en,
      zh: param.zh,
      zh_tw: param.zh_tw,
    }
    delete coordinatesBuf.grid
    return defaultParam
  }

  function setCalculatorSignal(param, elementParam, name) {
    var calculator = param[name].split('()')
    elementParam[name] = {
      content: calculator[0] + '()',
    }
    if (calculator[1])
      elementParam[name].format = {
        calculator: calculator[1],
      }
    elementParam.source.signals.push(name)
    return elementParam
  }

  function addAlarmPreCondition() {
    // 建立alarm預載資料
    if (!paramMap.preCondition) paramMap.preCondition = {}
    if (!paramMap.preCondition.alarm)
      paramMap.preCondition.alarm = {
        url: 'api/getdata/db',
        type: 'POST',
        contentType: 'application/json',
        data: {
          table: 'm_alarm',
          columns: ['alarm_id', 'alarm_status'],
          whereClause: `cnc_id='${brandId}'`,
        },
      }
  }

  function createInsidePartition(param, grid) {
    // 建立partition裡的partition
    createElement(
      {
        grid: grid || '12',
        text: {
          en: param['label-en'],
          zh: param['label-zh'],
          zh_tw: param['label-zh_tw'],
        },
        bodyClass: {
          distribute: 'distribute break-all',
        },
      },
      'partition'
    )
  }

  function createMachineStatus() {
    createElement(
      {
        pattern: '5',
      },
      'text'
    )
  }

  function createElement(elementParam, type) {
    indexMap[type]++
    var elementId = type + '#' + indexMap[type]

    // 建立元件
    paramMap.component[elementId] = JSON.parse(JSON.stringify(elementParam))
    if (!widgetMap.order) widgetMap.order = []
    widgetMap.order.push(elementId)
  }
  return paramMap
}
