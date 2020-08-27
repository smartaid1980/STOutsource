export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.machineList = servkit.getMachineList()
      var getServerTime = function () {
        // 需要拿server的時間再用
        return $.ajax({
          url: 'api/user/loginInfo',
          async: false,
        }).getResponseHeader('Date')
      }

      var getRealDate = function (date, thisDate) {
        var realDate = date
        if (thisDate) {
          if (thisDate.includes('-')) {
            realDate = moment().add(thisDate, 'day').format('YYYYMMDD')
          } else {
            realDate = thisDate
          }
        }
        return realDate
      }

      function MachineMonitor(param, machineId) {
        var machineMonitor = this
        machineMonitor.param = param // 全部的設定資訊
        machineMonitor.components = {} // 全部元件
        machineMonitor.deviceStatus = [] // 記錄所有要聽devicestatus的元件ID
        machineMonitor.api = {} // {url字串: [需要用到的元件ID們]}
        machineMonitor.hippo = {} // {space名稱: {elements: [需要用到的元件ID們], columns: [此space用到的欄位]}
        machineMonitor.__proto__.machineId = machineId
        machineMonitor.getAjaxData = function (param) {
          // 取得API的request資料
          var ajaxData = {
            //先讀使用者的
            url: param.url || '',
            type: param.type || 'GET',
            data: param.data || {},
          }
          if (param.contentType) {
            ajaxData.contentType = param.contentType
          }
          if (ajaxData.type === 'POST' || ajaxData.type === 'PUT') {
            ajaxData.contentType = param.contentType || 'application/json'
            ajaxData.data = JSON.stringify(ajaxData.data)
          }
          return ajaxData
        }
        machineMonitor.formatData = function (value, index) {
          // 如果資料格式為(key value)或[key|value]會轉換成物件，如果設定需要計算也要算一下
          var data = value
          // 切割值是"(N1 934030-ZG,N2 2711,N3 20M00S)"先切,空白前的是key空白後的是value
          if (
            typeof value === 'string' &&
            value.search(/\(/) >= 0 &&
            value.search(/\)/) >= 0
          ) {
            data = {}
            _.each(
              value
                .replace(/\(/, '')
                .replace(/\)/, '')
                .replace(/"/g, '')
                .split(/,/g),
              (val) => {
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

        machineMonitor.initialization = function () {
          var redraw = false
          drawElement(machineMonitor.param)
          if (redraw) {
            // 如果有easypiechart或sparkline需要呼叫初始
            window.runAllCharts()
          }

          function drawElement(param, parentName) {
            _.each(param.order, (elementId) => {
              // 有要用到的元件才初始
              if (machineMonitor.param.component[elementId]) {
                // 確定這個元件是在這一層
                // machineMonitor.quantityMap[element.split('#')[0]]++
                if (
                  machineMonitor.setElement(
                    elementId,
                    JSON.stringify(machineMonitor.param.component[elementId]),
                    parentName
                  )
                ) {
                  redraw = true
                }
                drawElement(
                  machineMonitor.param.component[elementId],
                  elementId
                )
              }
            })
          }
        }
        machineMonitor.setElement = function (
          elementId,
          elementParamStr,
          parentName
        ) {
          var elementParam = JSON.parse(elementParamStr)
          var redraw = false
          switch (elementId.split('#')[0]) {
            case 'widget':
              machineMonitor.components[elementId] = new MachineMonitorWidget(
                elementId,
                Object.assign({}, elementParam)
              )
              break
            case 'partition':
              machineMonitor.components[
                elementId
              ] = new MachineMonitorPartition(
                elementId,
                Object.assign({}, elementParam)
              )
              break
            case 'text':
              machineMonitor.components[elementId] = new MachineMonitorText(
                elementId,
                Object.assign({}, elementParam)
              )
              break
            case 'easypiechart':
              machineMonitor.components[
                elementId
              ] = new MachineMonitorEasyPieChart(
                elementId,
                Object.assign({}, elementParam)
              )
              redraw = true
              break
            case 'progress':
              machineMonitor.components[elementId] = new MachineMonitorProgress(
                elementId,
                Object.assign({}, elementParam)
              )
              break
            case 'gauge':
              machineMonitor.components[elementId] = new MachineMonitorGauge(
                elementId,
                Object.assign({}, elementParam)
              )
              break
            case 'image':
              machineMonitor.components[elementId] = new MachineMonitorImage(
                elementId,
                Object.assign({}, elementParam)
              )
              break
            case 'dividingLine':
              machineMonitor.components[
                elementId
              ] = new MachineMonitorDividingLine(
                elementId,
                Object.assign({}, elementParam)
              )
              break
            case 'switch':
              machineMonitor.components[elementId] = new MachineMonitorSwitch(
                elementId,
                Object.assign({}, elementParam)
              )
              break
            case 'linechart':
              machineMonitor.components[elementId] = new MachineMonitorChart(
                elementId,
                Object.assign({}, elementParam)
              )
              break
            case 'piechart':
              machineMonitor.components[elementId] = new MachineMonitorPieChart(
                elementId,
                Object.assign({}, elementParam)
              )
              break
            case 'barchart':
              machineMonitor.components[elementId] = new MachineMonitorBarChart(
                elementId,
                Object.assign({}, elementParam)
              )
              break
            case 'sparkline':
              machineMonitor.components[
                elementId
              ] = new MachineMonitorSparkLine(
                elementId,
                Object.assign({}, elementParam)
              )
              redraw = true
              break
            default:
              break
          }

          var elementData = machineMonitor.components[elementId]
          if (elementData) {
            if (elementData.param.preCondition) {
              // 判斷此元件是否有用到預先載入資料
              _.each(elementData.param.preCondition, (val, key) => {
                elementData.preConditionMap[key] =
                  machineMonitor.preConditionMap[val]
              })
            }
            if (elementData.initialization) {
              // 初始每個元件
              try {
                elementData.initialization(parentName)
              } catch (e) {
                console.warn(e)
              }
            }

            if (elementData.param.source) {
              // 資料來源設定
              if (elementData.param.source.sourceType === 'devicestatus') {
                machineMonitor.deviceStatus.push(elementId)
              } else if (elementData.param.source.sourceType === 'api') {
                if (!machineMonitor.api[elementData.param.source.url]) {
                  machineMonitor.api[elementData.param.source.url] = []
                }
                machineMonitor.api[elementData.param.source.url].push(elementId)
              } else if (elementData.param.source.sourceType === 'hippo') {
                if (!machineMonitor.hippo[elementData.param.source.space]) {
                  machineMonitor.hippo[elementData.param.source.space] = {
                    0: {
                      elements: [],
                      columns: [],
                    },
                  }
                }
                if (elementData.param.source.date) {
                  var dateString =
                    elementData.param.source.date[0] +
                    '|' +
                    elementData.param.source.date[1]
                  if (
                    !machineMonitor.hippo[elementData.param.source.space][
                      dateString
                    ]
                  ) {
                    machineMonitor.hippo[elementData.param.source.space][
                      dateString
                    ] = {
                      elements: [],
                      columns: [],
                    }
                  }
                  machineMonitor.hippo[elementData.param.source.space][
                    dateString
                  ].elements.push(elementId)
                  machineMonitor.hippo[elementData.param.source.space][
                    dateString
                  ].columns = _.union(
                    machineMonitor.hippo[elementData.param.source.space][
                      dateString
                    ].columns,
                    elementData.param.source.columns
                  )
                } else {
                  machineMonitor.hippo[
                    elementData.param.source.space
                  ][0].elements.push(elementId)
                  machineMonitor.hippo[
                    elementData.param.source.space
                  ][0].columns = _.union(
                    machineMonitor.hippo[elementData.param.source.space][0]
                      .columns,
                    elementData.param.source.columns
                  )
                }
              }
            }
            elementData = null // 把元件設定清空
          }
          elementParam = null // 把元件設定清空
          return redraw
        }

        machineMonitor.deviceStatusUpdate = function (data) {
          // 更新deviceStatus資料
          var redraw = false
          var dataElement
          _.each(data, function (dataEle) {
            dataElement = dataEle
            _.each(machineMonitor.deviceStatus, (element) => {
              var value = 0
              var component = machineMonitor.components[element]
              value = {}
              if (
                component.param.source &&
                component.param.source.signals &&
                component.param.source.signals.length
              ) {
                _.each(component.param.source.signals, (p) => {
                  value[p] = getDeviceStatusRealDataBySignal(
                    component.param[p].content
                  )
                  if (value[p]) {
                    value[p] = machineMonitor.formatData(
                      value[p],
                      component.param[p].index
                    )
                  }
                })
              }
              redraw = machineMonitor.updateElement(element, value) || redraw
            })
            machineMonitor.dataEle = null
          })
          if (redraw) {
            // 如果有easypiechart或sparkline需要呼叫初始
            window.runAllCharts()
          }

          function getDeviceStatusRealDataBySignal(signal) {
            // 要去拿devicestatus的值(若是陣列也要回傳陣列)
            var value = null
            try {
              if (_.isArray(signal)) {
                value = []
                _.each(signal, (signal) => {
                  try {
                    value.push(getDeviceStatusMachineValue(signal))
                  } catch (e) {
                    value.push(0)
                    console.warn(signal + ':' + e.message)
                  }
                })
              } else {
                value = getDeviceStatusMachineValue(signal)
              }
            } catch (e) {
              value = null
            }
            return value
          }

          function getDeviceStatusMachineValue(signal) {
            // 實際拿到devicestatus實際傳送的值
            var data
            try {
              data = dataElement.getMachineValue(
                signal.match(/G_\w*\(\)/g)[0],
                machineMonitor.machineId
              )[0][0]
            } catch (e) {
              data = null
              // console.warn(signal + ': ' + e.message)
            }
            return data
          }
        }
        machineMonitor.apiUpdate = function (data, elements) {
          // 更新API傳回得資料
          var redraw = false

          _.each(elements, (element) => {
            var value
            var param = machineMonitor.components[element].param
            if (_.isArray(param.value.content)) {
              value = []
              _.each(param.value.content, (val) => {
                value.push(data[val] || 0)
              })
            } else {
              value = data[param.value.content] || 0
            }
            redraw =
              machineMonitor.updateElement(element, {
                value: machineMonitor.formatData(value, param.index),
              }) || redraw
          })
          if (redraw) {
            // 如果有easypiechart或sparkline需要呼叫初始
            window.runAllCharts()
          }
        }
        machineMonitor.hippoUpdate = function (date) {
          // 更新hippo拿到的資料
          _.each(machineMonitor.hippo, (hippos, space) => {
            _.each(hippos, (ele, keys) => {
              hippo
                .newSimpleExhaler()
                .space(space)
                .index('machine_id', [machineMonitor.machineId])
                .indexRange(
                  'date',
                  getRealDate(
                    date,
                    keys.includes('|') ? keys.split('|')[0] : ''
                  ),
                  getRealDate(
                    date,
                    keys.includes('|') ? keys.split('|')[1] : ''
                  )
                )
                .columns(...ele.columns)
                .exhale(function (exhalable) {
                  var dataList
                  var lastData = {}
                  _.each(exhalable.exhalable, (hippoData) => {
                    switch (space) {
                      case 'shiftdata_for_monitor':
                        var workShift = hippoData['work_shift']
                        if (workShift === machineMonitor.workShiftName) {
                          machineMonitor.__proto__.currentWorkShift = hippoData
                          return false
                        }
                        break
                      case 'machine_status_history':
                        if (!dataList) {
                          dataList = []
                        }
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
                                moment(hippoData.start_time, 'YYYYMMDDHHmmss'),
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
                        if (hippoData.date) {
                          if (!lastData.cutting_millisecond) {
                            lastData.cutting_millisecond = 0
                          }
                          lastData.cutting_millisecond +=
                            parseInt(hippoData.cutting_millisecond / 1000) *
                            1000
                          if (!lastData.operate_millisecond) {
                            lastData.operate_millisecond = 0
                          }
                          lastData.operate_millisecond +=
                            parseInt(hippoData.operate_millisecond / 1000) *
                            1000
                          if (!lastData.power_millisecond) {
                            lastData.power_millisecond = 0
                          }
                          lastData.power_millisecond +=
                            parseInt(hippoData.power_millisecond / 1000) * 1000
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
                          lastData.cutting_millisecond +=
                            parseInt(hippoData.cutting_millisecond / 1000) *
                            1000
                          if (!lastData.power_millisecond) {
                            lastData.power_millisecond = 0
                          }
                          lastData.power_millisecond +=
                            parseInt(hippoData.power_millisecond / 1000) * 1000
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
                        if (!dataList) {
                          dataList = {}
                        }
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
                        break
                    }
                  })
                  if (dataList) {
                    _.each(ele.elements, (e) => {
                      if (space === 'fah_product_work') {
                        machineMonitor.components[e].update({
                          value: dataList,
                        })
                      } else if (
                        space === 'utilization_time_work_shift' &&
                        _.find(ele.columns, (val) => {
                          return val === 'date'
                        })
                      ) {
                        if (e.includes('bar')) {
                          var groupDataList = [[], []]
                          var index = 0
                          _.each(dataList, (val, key) => {
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
                          machineMonitor.components[e].update({
                            value: groupDataList,
                          })
                        } else {
                          var average = 0
                          _.each(dataList, (datas) => {
                            if (
                              _.find(
                                machineMonitor.components[e].param.source
                                  .columns,
                                (val) => {
                                  return val === 'cutting_millisecond'
                                }
                              )
                            ) {
                              average += Number(datas[0].replace('%', ''))
                            }
                            if (
                              _.find(
                                machineMonitor.components[e].param.source
                                  .columns,
                                (val) => {
                                  return val === 'operate_millisecond'
                                }
                              )
                            ) {
                              average += Number(datas[1].replace('%', ''))
                            }
                          })
                          machineMonitor.components[e].update({
                            value:
                              (average / Object.keys(dataList).length).toFixed(
                                1
                              ) + '%',
                          })
                        }
                      } else {
                        machineMonitor.components[e].update({
                          value: dataList,
                        })
                      }
                    })
                  }
                })
            })
          })
        }

        machineMonitor.updateElement = function (element, value) {
          // 更新畫面
          var component = machineMonitor.components[element]
          var redraw = false

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
            console.warn(component.id + 'not update function')
          }

          // 如果是easypiechart或sparkline要呼叫更新API
          var componentName = element.split('#')[0]
          if (
            componentName === 'easypiechart' ||
            componentName === 'sparkline'
          ) {
            redraw = true
          }
          return redraw
        }

        machineMonitor.preCondition = function (callback) {
          // 要從API先拿的資料
          var promises = []
          _.each(machineMonitor.param.preCondition, (param, key) => {
            var request = new Promise(function (resolve) {
              servkit.ajax(machineMonitor.getAjaxData(param), {
                success: function (response) {
                  if (typeof response === 'string') {
                    // 如果是字串要先轉map
                    machineMonitor.preConditionMap[key] = JSON.parse(response)
                  } else if (
                    response &&
                    _.isArray(response) &&
                    param.data &&
                    param.data.columns
                  ) {
                    // api/getdata/db
                    machineMonitor.preConditionMap[key] = {}
                    _.each(response, (val) => {
                      machineMonitor.preConditionMap[key][
                        val[param.data.columns[0]]
                      ] = val[param.data.columns[1]]
                    })
                  } else {
                    machineMonitor.preConditionMap[key] = response
                  }
                  resolve(machineMonitor.preConditionMap[key]) // 要把拿到的值放入結果才可以
                },
              })
            })
            promises.push(request)
          })

          Promise.all(promises).then(function () {
            if (callback) {
              // 初始完成後的行為
              callback()
            }
          })
        }
      }
      MachineMonitor.prototype.preConditionMap = {}

      function MachineMonitorElement(id, param) {
        this.id = id
        this.param = param
      }
      MachineMonitorElement.prototype = Object.create(MachineMonitor.prototype) // 繼承MachineMonitor的機台ID 和 預先載入機料
      MachineMonitorElement.prototype.setElementDOM = function (
        parentName,
        tag,
        parent
      ) {
        // 建立元件
        var selector = parent
          ? parent
          : '[data-monitor-id=' +
            parentName +
            '] .' +
            parentName.split('#')[0] +
            '-body:first'
        var $elementParent = $(selector)
        if (!$elementParent.find('[data-monitor-id=' + this.id + ']').length) {
          var tagName = tag || 'div'
          $elementParent.append(
            '<' +
              tagName +
              ' data-monitor-id="' +
              this.id +
              '"></' +
              tagName +
              '>'
          )
        }
        this.$element = $elementParent.find('[data-monitor-id=' + this.id + ']')
      }
      MachineMonitorElement.prototype.setText = function () {
        // 設定text
        var machineMonitorElement = this
        machineMonitorElement.text = ''
        if (machineMonitorElement.param.text) {
          if (_.isArray(machineMonitorElement.param.text)) {
            machineMonitorElement.text = []
            _.each(machineMonitorElement.param.text[context.lang], (val) => {
              machineMonitorElement.text.push(val || '---')
            })
          } else if (
            _.isObject(machineMonitorElement.param.text[context.lang])
          ) {
            // piechart的機台狀態用
            machineMonitorElement.text =
              machineMonitorElement.param.text[context.lang]['0']
          } else {
            machineMonitorElement.text =
              machineMonitorElement.param.text[context.lang] || '---'
            if (machineMonitorElement.text === '[machinename]') {
              machineMonitorElement.text = servkit.getMachineName(
                machineMonitorElement.machineId
              )
            }
          }
        }
      }
      MachineMonitorElement.prototype.setDefaultValue = function (paramName) {
        // 設定初始值
        this['default' + paramName] = null
        if (this.param[paramName.toLowerCase()]) {
          if (_.isArray(this.param[paramName.toLowerCase()].content)) {
            this['default' + paramName] = []
            _.each(this.param[paramName.toLowerCase()].content, () => {
              this['default' + paramName].push('')
            })
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
      MachineMonitorElement.prototype.setClassList = function () {
        // 設定所有class的名稱
        var machineMonitorElement = this
        _.each(machineMonitorElement.param.class, (val, key) => {
          machineMonitorElement.classList.push(val === true ? key : val)
        })
      }
      MachineMonitorElement.prototype.setStyleList = function (param, part) {
        // 設定所有class的名稱
        var machineMonitorElement = this
        _.each(param || machineMonitorElement.param.style, (val, key) => {
          var value = val
          if (key === 'color') {
            value = machineMonitorElement.changeColor(val)
          }
          if (param) {
            if (!machineMonitorElement[part + 'StyleList']) {
              machineMonitorElement[part + 'StyleList'] = []
            }
            machineMonitorElement[part + 'StyleList'].push(
              key + ':' + value + ';'
            )
          } else {
            machineMonitorElement.styleList.push(key + ':' + value + ';')
          }
        })
      }
      MachineMonitorElement.prototype.drawElement = function (htmlList) {
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
      MachineMonitorElement.prototype.changeColor = function (
        param,
        $ele,
        index,
        changeObj
      ) {
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
          if (color.indexOf('#') >= 0 || color.indexOf('rgb') >= 0) {
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
      MachineMonitorElement.prototype.dataFormat = function (
        value,
        format,
        arrayIndex
      ) {
        // 回傳實際要呈現的資訊
        var data = '' // 預設為空

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

          if (format.workshift && this.__proto__.currentWorkShift) {
            data =
              Number(data) -
              Number(this.__proto__.currentWorkShift[format.workshift] || 0)
            if (data < 0) {
              data = 0
            }
          }

          if (format.type === 'value') {
            data =
              eval(
                (String(data) || '0').replace(/[\w_-]+\(\)/g, 0) +
                  (format.calculator || '')
              ) || 0
            if (format.ceil) {
              data = Math.ceil(data)
            }
            if (format.floor) {
              data = Math.floor(data)
            }
            if (format.decimal) {
              data = Number(data.toFixed(format.decimal))
            }
          }
          if (format.type === 'percent') {
            var decimal = format.decimal ? format.decimal : 0
            if (format.total) {
              // 一定要設定最大值(沒有設的話就不轉換)
              data = Number(
                ((Number(data) / Number(format.total)) * 100).toFixed(decimal)
              )
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
                data = new Date(getServerTime()).getTime()
              } else {
                data = new Date().getTime()
              }
            }

            if (format.utc) {
              data = moment(parseInt(data), format.input || '')
                .utc()
                .format(format.output || 'YYYY/MM/DD HH:mm:ss')
            } else {
              data = moment(parseInt(data), format.input || '').format(
                format.output || 'YYYY/MM/DD HH:mm:ss'
              )
            }
            if (data === 'Invalid date') {
              data = '---'
            }
          }
          if (
            format.preCondition !== undefined &&
            format.preCondition !== null &&
            this.preConditionMap[format.preCondition]
          ) {
            data = data
              ? this.preConditionMap[format.preCondition][newValue] || '---'
              : ''
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
      MachineMonitorElement.prototype.initElement = function (
        parentName,
        tag,
        parent
      ) {
        if (this.param.pattern) {
          // 把樣式帶入設定
          _.each(this.param, (val, key) => {
            if (this.pattern[this.param.pattern][key]) {
              _.extend(this.pattern[this.param.pattern][key], this.param[key])
            }
          })
          _.extend(this.param, this.pattern[this.param.pattern])
        }

        this.setElementDOM(parentName, tag, parent)
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
      }
      MachineMonitorElement.prototype.addGridClass = function () {
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

      function MachineMonitorWidget(id, param) {
        // widget
        MachineMonitorElement.call(this, id, param) // 繼承MachineMonitorElement
      }
      MachineMonitorWidget.prototype = Object.create(
        MachineMonitorElement.prototype
      ) // 繼承MachineMonitorElement
      MachineMonitorWidget.prototype.setHtml = function () {
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
      MachineMonitorWidget.prototype.initialization = function () {
        this.initElement(null, 'article', '#widget-grid>.row')
        this.setHtml()

        if (this.param.fullscreen) {
          /* 設定widget button */
          if ($('#widget-grid').data('jarvisWidgets')) {
            $('#widget-grid').data('jarvisWidgets').destroy() // 先把設定刪掉才可以
          }
          window.setup_widgets_desktop() // 重新設定widget button
        }
      }

      function MachineMonitorPartition(id, param) {
        // partition
        MachineMonitorElement.call(this, id, param) // 繼承MachineMonitorElement
      }
      MachineMonitorPartition.prototype = Object.create(
        MachineMonitorElement.prototype
      ) // 繼承MachineMonitorElement
      MachineMonitorPartition.prototype.setHtml = function () {
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
      MachineMonitorPartition.prototype.initialization = function (parentName) {
        this.initElement(parentName)
        this.setHtml()
      }
      MachineMonitorPartition.prototype.update = function (data) {
        this.$element
          .find('.partition-unit')
          .html('(' + (data.unit || '') + ')')
      }

      function MachineMonitorText(id, param) {
        // text
        MachineMonitorElement.call(this, id, param) // 繼承MachineMonitorElement
        this.pattern = {
          1: {
            class: {
              distribute: 'distribute keep-all',
            },
          },
          2: {
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
          3: {
            text: {
              style: {
                'font-size': '1.3em',
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
          4: {
            source: {
              sourceType: 'devicestatus',
              signals: ['color'],
            },
            class: {
              border: true,
            },
            color: {
              content: 'G_CONS()',
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
        }
      }
      MachineMonitorText.prototype = Object.create(
        MachineMonitorElement.prototype
      ) // 繼承MachineMonitorElement
      MachineMonitorText.prototype.setHtml = function () {
        var text = this
        var html = []
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
          else
            value = text.dataFormat(text.defaultValue, text.param.value.format)
          html.push('<span class="value"[valueStyle]>' + value + '</span>')
        }
        html.push('</div>')
        text.drawElement(html)
      }
      MachineMonitorText.prototype.initialization = function (parentName) {
        this.initElement(parentName)
        if (this.param.color) {
          if (!this.styleList) {
            this.styleList = []
          }
          this.styleList.push(
            'background-color' + ':' + this.changeColor(this.param.color) + ';'
          )
        }
        this.setHtml()
      }
      MachineMonitorText.prototype.update = function (data) {
        if (data.value !== undefined) {
          this.updateHtml(data, 'value')
        }
        if (data.text !== undefined) {
          this.updateHtml(data, 'text')
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
      MachineMonitorText.prototype.updateHtml = function (data, type) {
        // 更新頁面顯示
        var text = this
        if (_.isArray(data[type]) && text.param[type].array) {
          var dataText = _.without(
            _.map(data[type], (val, key) => {
              // 多筆資料要過濾掉空字串並換行
              return text.dataFormat(val, text.param[type].format, key)
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
          text.$element.find('.' + type).html(dataText)
        } else {
          text.$element
            .find('.' + type)
            .text(text.dataFormat(data[type], text.param[type].format))
        }
      }

      function MachineMonitorEasyPieChart(id, param) {
        // easypiechart
        MachineMonitorElement.call(this, id, param) // 繼承MachineMonitorElement
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
              },
            },
            size: '150',
            class: {
              position: 'chart-inside',
            },
          },
        }
      }
      MachineMonitorEasyPieChart.prototype = Object.create(
        MachineMonitorElement.prototype
      ) // 繼承MachineMonitorElement
      MachineMonitorEasyPieChart.prototype.setHtml = function () {
        var data = this.dataFormat(this.defaultValue, this.param.value.format)
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
        if (this.param.class && this.param.class.position === 'chart-inside') {
          // 文字在圖裡要多加值的顯示
          html.push('<span class="value">' + data + '%</span>')
        }
        html.push('<span class="text"> ' + this.text + ' </span>')
        html.push('</div></div>')
        this.drawElement(html)
      }
      MachineMonitorEasyPieChart.prototype.initialization = function (
        parentName
      ) {
        this.initElement(parentName)
        this.setHtml()
        this.changeColor(
          this.param.value.color,
          this.$element.find('.easy-pie-chart'),
          null,
          'txt'
        )
      }
      MachineMonitorEasyPieChart.prototype.update = function (data) {
        var newValue = this.dataFormat(data.value, this.param.value.format)
        this.$element
          .find('.easy-pie-chart')
          .data('easyPieChart')
          .update(newValue)
        this.$element.find('.value').text(newValue)
      }

      function MachineMonitorProgress(id, param) {
        // 進度條
        MachineMonitorElement.call(this, id, param) // 繼承MachineMonitorElement
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
      MachineMonitorProgress.prototype = Object.create(
        MachineMonitorElement.prototype
      ) // 繼承MachineMonitorElement
      MachineMonitorProgress.prototype.setHtml = function () {
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
            html.push('<span class="unit">' + this.param.unit + '</span>')
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
      MachineMonitorProgress.prototype.initialization = function (parentName) {
        this.initElement(parentName)
        this.setHtml()
        this.update({
          value: this.defaultValue,
        })
      }
      MachineMonitorProgress.prototype.update = function (data) {
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
      MachineMonitorProgress.prototype.change = function (
        value,
        percent,
        color,
        $ele
      ) {
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

      function Gauge(ele) {
        // 儀錶板實體
        this.ele = ele
        this.min = -1
        this.max = 1
        this.percent = 0
        this.value = 0
      }
      Gauge.prototype.setScale = function () {
        this.x = 139 / (this.max - this.min)
        this.y = 20.5 - this.min * this.x
        var minDOM = this.scale.select('.min')
        minDOM.text(this.min)
        var minWidth = minDOM.node().getBBox().width
        var minHeight = minDOM.node().getBBox().height
        // console.log(this.getPercent(this.min))
        // minDOM.attr('transform', `translate(${-this.radius / 0.96},${minWidth / 2 - this.getPercent(this.min)}) rotate(${this.getPercent(this.min) - 90})`)
        minDOM.attr(
          'transform',
          `translate(${-this.radius / 1.01}, ${-this.radius / 3.5}) rotate(${
            -this.radius * 0.02 - 62.61
          })`
        )
        var maxDOM = this.scale.select('.max')
        maxDOM.text(this.max)
        var maxWidth = maxDOM.node().getBBox().width
        var maxHeight = maxDOM.node().getBBox().height
        // maxDOM.attr('transform', `translate(${this.radius}, ${-this.radius}) rotate(${this.getPercent(this.max) - 90})`)
        maxDOM.attr(
          'transform',
          `translate(${this.radius / 1.07}, ${-this.radius / 2.5}) rotate(${
            this.radius * 0.02 + 62.61
          })`
        )
        // minDOM.attr('transform', `translate(${-this.radius / 0.96},${minWidth / 2}) rotate(-90)`)
      }
      Gauge.prototype.changeValueText = function (text) {
        var valueDOM = this.needle.select('.value')
        valueDOM.text(text)
        var textWidth = valueDOM.node().getBBox().width
        valueDOM.attr(
          'transform',
          `translate(${-this.radius / 0.96},${textWidth / 2}) rotate(-90)`
        )
      }
      Gauge.prototype.getPercent = function (data) {
        return data * this.x + this.y
      }
      Gauge.prototype.render = function () {
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

        this.scale = all.append('g') // 刻度和值
        this.scale.append('text').attr('class', 'min').text(this.min)
        this.scale.append('text').attr('class', 'max').text(this.max)

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
        svg
          .selectAll('text')
          .attr('font-size', `${(1.3 * this.radius) / 120}em`) // 字體放大
        this.setScale() // 設定標準值
      }
      Gauge.prototype.moveTo = function () {
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
              gauge.changeValueText(text)
              gauge.needle.select('.value').attr('fill', '#383838')
              if (percentOfPercent === 1) {
                gauge.percent = realPercent
                if (goalPercent > 183 || goalPercent < -3) {
                  gauge.changeValueText(gauge.value)
                  gauge.needle
                    .select('.value')
                    .attr('fill', servkit.statusColors.alarm)
                }
                // gauge.moveTo(Math.floor((Math.random() * 12) - 5))
              }
              return d3.select(this).attr('transform', `rotate(${progress})`)
            }
          })
      }

      function MachineMonitorGauge(id, param) {
        // 儀錶板
        MachineMonitorElement.call(this, id, param) // 繼承MachineMonitorElement
      }
      MachineMonitorGauge.prototype = Object.create(
        MachineMonitorElement.prototype
      ) // 繼承MachineMonitorElement
      MachineMonitorGauge.prototype.setHtml = function () {
        var html = []
        html.push(
          '<div[class][style]><span class="text">' + this.text + '</span>'
        )
        html.push('<div class="gauge"></div>')
        html.push('</div>')
        this.drawElement(html)
      }
      MachineMonitorGauge.prototype.initialization = function (parentName) {
        this.initElement(parentName)
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
        var element = d3.select('[data-monitor-id="' + this.id + '"] .gauge')
        if (!element.select('svg')[0][0]) {
          // 沒有svg才畫
          this.gauge = new Gauge(element)
          this.gauge.max = this.dataFormat(
            this.defaultMax,
            this.param.max.format
          )
          this.gauge.min = this.dataFormat(
            this.defaultMin,
            this.param.min.format
          )
          this.gauge.render()
          this.gauge.moveTo()
        }
      }
      MachineMonitorGauge.prototype.update = function (data) {
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

      function MachineMonitorImage(id, param) {
        // 圖檔
        MachineMonitorElement.call(this, id, param) // 繼承MachineMonitorElement
      }
      MachineMonitorImage.prototype = Object.create(
        MachineMonitorElement.prototype
      ) // 繼承MachineMonitorElement
      MachineMonitorImage.prototype.setHtml = function () {
        this.drawElement([
          '<img src="./app/' + this.dataFormat(this.defaultValue) + '">',
        ])
      }
      MachineMonitorImage.prototype.initialization = function (parentName) {
        this.initElement(parentName)
        this.setHtml()
      }

      function MachineMonitorDividingLine(id, param) {
        // 分隔線
        MachineMonitorElement.call(this, id, param) // 繼承MachineMonitorElement
      }
      MachineMonitorDividingLine.prototype = Object.create(
        MachineMonitorElement.prototype
      ) // 繼承MachineMonitorElement
      MachineMonitorDividingLine.prototype.setHtml = function () {
        this.drawElement(['<hr>'])
      }
      MachineMonitorDividingLine.prototype.initialization = function (
        parentName
      ) {
        this.initElement(parentName)
        this.setHtml()
        this.$element.addClass(this.param.type)
      }

      function MachineMonitorSwitch(id, param) {
        // switch
        MachineMonitorElement.call(this, id, param) // 繼承MachineMonitorElement
      }
      MachineMonitorSwitch.prototype = Object.create(
        MachineMonitorElement.prototype
      ) // 繼承MachineMonitorElement
      MachineMonitorSwitch.prototype.setHtml = function () {
        this.drawElement([
          this.text +
            '<br/><span class="badge bg-color-" style="width: 200px; height: 18px;"><span></span></span>',
        ])
      }
      MachineMonitorSwitch.prototype.initialization = function (parentName) {
        this.initElement(parentName)
        this.setHtml()
      }

      function MachineMonitorChart(id, param) {
        // 圖表(預設為折線圖)
        MachineMonitorElement.call(this, id, param) // 繼承MachineMonitorElement
        var labelList = []
        if (
          this.param.legend &&
          this.param.legend.main &&
          this.param.legend.main[context.lang]
        ) {
          labelList = this.param.legend.main[context.lang]
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
      MachineMonitorChart.prototype = Object.create(
        MachineMonitorElement.prototype
      ) // 繼承MachineMonitorElement
      MachineMonitorChart.prototype.setHtml = function () {
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
      MachineMonitorChart.prototype.initialization = function (parentName) {
        var chart = this
        chart.initElement(parentName) // 初始
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
          chart.setDataSet(chart.param.legend.main[context.lang], 'label')
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
      MachineMonitorChart.prototype.setDataSet = function (value, keyName) {
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
      MachineMonitorChart.prototype.setData = function (
        value,
        index,
        now,
        dataMap
      ) {
        if (!this.data[index]) {
          this.data[index] = []
        }
        if (this.data[index].length >= 100) {
          this.data[index].shift()
        }
        this.data[index].push([now, Number(value)])
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
      MachineMonitorChart.prototype.drawCustLegend = function (
        color,
        value,
        legendText
      ) {
        var tbodyHtml = []
        tbodyHtml.push('<tr>')
        tbodyHtml.push(
          '  <td class="legendColorBox" style="border-color: ' +
            color +
            ';background-color: ' +
            color +
            ';"</td>'
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
      MachineMonitorChart.prototype.update = function (data) {
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

        if (this.plot) {
          this.plot.destroy()
        }
        this.plot = $.plot(
          this.$element.find('.diagram'),
          this.dataSet,
          this.option
        )
      }

      function MachineMonitorBarChart(id, param) {
        // 圖表 - 條
        MachineMonitorElement.call(this, id, param) // 繼承MachineMonitorElement
        var barChart = this
        this.pattern = {
          1: {
            value: {
              format: {
                type: 'value',
              },
            },
            mulitiplebars: true,
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
        this.dataSet = [] // 所有資料
        this.data = [] // 每條線的值
      }
      MachineMonitorBarChart.prototype = Object.create(
        MachineMonitorChart.prototype
      ) // 繼承MachineMonitorChart
      MachineMonitorBarChart.prototype.initialization = function (parentName) {
        var chart = this
        chart.initElement(parentName)
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

        if (chart.param.legend) {
          // 如果有要顯示圖示
          chart.setDataSet(chart.param.legend.main[context.lang], 'label')
          chart.option.legend = {
            show: true,
            container: chart.$element.find('.legend'),
          }
        }
        if (chart.param.xticks) {
          chart.option.xaxis.show = true
          chart.option.xaxis.ticks = chart.param.xticks
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
        // console.log(chart.dataSet, chart.option)
        chart.plot = $.plot(
          chart.$element.find('.diagram'),
          chart.dataSet,
          chart.option
        )
      }
      MachineMonitorBarChart.prototype.update = function (data) {
        var chart = this
        var dataSet = []
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
              _.each(val, (v, k) => {
                chart.option.xaxis.ticks[k] = [k, moment(v[2]).format('MM/DD')]
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
              chart.setDataSet(chart.param.legend.main[context.lang], 'label')
              dataMap.label = chart.dataSet[key].label
            }
            dataSet[key] = dataMap
          }
        })
        // console.log(data.value, dataSet, chart.option)
        if (chart.plot) {
          chart.plot.destroy()
        }
        chart.plot = $.plot(
          chart.$element.find('.diagram'),
          dataSet,
          chart.option
        )
      }

      function MachineMonitorPieChart(id, param) {
        // 圖表 - 圓餅
        MachineMonitorElement.call(this, id, param) // 繼承MachineMonitorElement
        this.pattern = {
          1: {
            source: {
              sourceType: 'devicestatus',
              signals: ['value'],
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
        this.dataSet = [] // 所有資料
        this.data = [] // 每條線的值
      }
      MachineMonitorPieChart.prototype = Object.create(
        MachineMonitorChart.prototype
      ) // 繼承MachineMonitorChart
      MachineMonitorPieChart.prototype.initialization = function (parentName) {
        var chart = this
        chart.initElement(parentName)
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
              chart.param.legend.main[context.lang][key]
            )
          })
          chart.$element.find('.abreast .header').addClass('hasValue')
        }

        // 資料格式：[{data: [], color: ''}]
        chart.plot = $.plot(
          chart.$element.find('.diagram'),
          chart.dataSet,
          chart.option
        )
      }
      MachineMonitorPieChart.prototype.update = function (data) {
        var chart = this
        chart.$element
          .find('.text')
          .text(chart.param.text[context.lang][data.value || '0'])
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
          chart.setDataSet(Object.values(data.value) || [1], 'data') // 設定set陣列的data(如果資料是空的，至少塞個值讓他可以顯)
          chart.setDataSet(chart.param.color, 'color') // 設定set陣列的color
          if (chart.param.legend) {
            // 如果有要顯示圖示，圖示是資料來源為動態
            chart.$element.find('.legend tbody').empty()
            var dataIndex = 0 // 算目前是第幾筆資料(color轉換要用)
            // 因為要把tatol加到format裡面所以拉出來先判斷legend的value有沒有format
            if (chart.param.legend.value && chart.param.legend.value.format) {
              var valueFormat = JSON.parse(
                JSON.stringify(chart.param.legend.value.format)
              )
              valueFormat.total = Object.values(data.value).reduce(function (
                a,
                b
              ) {
                return a + b
              },
              0)
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
          chart.setDataSet([data.value] || [1], 'data') // 設定set陣列的data(如果資料是空的，至少塞個值讓他可以顯)
          chart.setDataSet(data.value || '0', 'color') // 設定set陣列的color
        }

        if (chart.plot) {
          chart.plot.destroy()
        }
        chart.plot = $.plot(
          chart.$element.find('.diagram'),
          chart.dataSet,
          chart.option
        )
      }

      function MachineMonitorSparkLine(id, param) {
        // sparkline
        MachineMonitorElement.call(this, id, param) // 繼承MachineMonitorElement
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
              height: '40%',
            },
          },
          2: {
            option: {
              type: 'bar',
              barColor: color || '#FFFFFF',
              disableTooltips: true,
              barWidth: '10%',
              height: '40%',
              barSpacing: 10,
            },
          },
        }
      }
      MachineMonitorSparkLine.prototype = Object.create(
        MachineMonitorElement.prototype
      ) // 繼承MachineMonitorElement
      MachineMonitorSparkLine.prototype.setHtml = function () {
        this.drawElement(['<div class="sparkline-graph"></div>'])
      }
      MachineMonitorSparkLine.prototype.initialization = function (parentName) {
        this.initElement(parentName)
        if (this.param.value) {
          this.setHtml()
          this.$element
            .find('.sparkline-graph')
            .sparkline(this.dataFormat(this.defaultValue), this.param.option)
        }
      }

      $('#rotate-start').on('click', function () {
        $('#rotate-start').addClass('hide')
        $('[data-monitor-id^=widget]>.jarviswidget').attr(
          'id',
          'jarviswidget-fullscreen-mode'
        )
        if (document.getElementById('widget-grid').webkitRequestFullscreen) {
          document.getElementById('widget-grid').webkitRequestFullscreen()
        } else if (
          document.getElementById('widget-grid').mozRequestFullScreen
        ) {
          document.getElementById('widget-grid').mozRequestFullScreen()
        }
        $('[data-monitor-id^=widget]').removeClass('hide')
        if (!context.schedule) {
          context.schedule = servkit
            .schedule('updateMachine')
            .freqMillisecond(10 * 1000)
            .action(function () {
              // context.now = new Date(new Date().getTime() + 19 * 60 * 60 * 1000)
              // context.now = new Date()
              $('#rotate').empty()
              context.order++
              if (context.order > context.machineList.length - 1) {
                context.order = 0
              }
              context.machineId = context.machineList[context.order]
              context.brandId = servkit.getMachineBrand(context.machineId)
              context.boxId = servkit.getBoxByMachine(context.machineId)
              //讀取參數檔
              servkit.unsubscribe('DeviceStatus')
              context.getParamFile(
                context.machineId,
                context.brandId,
                paramBuffer
              )
            })
            .start()
        } else {
          context.schedule.stop()
          context.order = -1
          context.play = true
          context.schedule.start()
        }
      })
      $('#rotate')
        .on('click', '#rotate-end', function () {
          // 結束輪播
          context.play = false
          $('#rotate').empty()
          if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen()
          } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen()
          }
          context.schedule.stop()
          servkit.unsubscribe('DeviceStatus')
          if ($('#rotate-pause>i').hasClass('fa-play')) {
            $('#rotate-pause>i').toggleClass('fa-play').toggleClass('fa-pause')
          }
          $('#rotate-start').removeClass('hide')
        })
        .on('click', '#rotate-pause', function () {
          // 暫停 / 繼續
          $('#rotate-pause>i').toggleClass('fa-play').toggleClass('fa-pause')
          if ($('#rotate-pause>i').hasClass('fa-play')) {
            context.play = false
            context.schedule.stop()
          } else {
            context.play = true
            context.schedule.start()
          }
        })
        .on('click', '#rotate-forward', function () {
          // 下一個
          context.schedule.stop()
          context.schedule.start()
          if (!context.play) {
            context.schedule.stop()
          }
        })
        .on('click', '#rotate-backward', function () {
          // 上一個
          context.schedule.stop()
          context.order -= 2 // 現在畫的頁數
          if (context.order < -1) {
            // 最後一頁
            context.order = context.machineList.length - 2
          }
          context.schedule.start()
          if (!context.play) {
            context.schedule.stop()
          }
        })

      function paramBuffer(config) {
        context.machineMonitor = new MachineMonitor(config, context.machineId)
        context.machineMonitor.preCondition(init)
      }

      function init() {
        context.machineMonitor.initialization()
        console.log(context.machineMonitor)

        var html = []
        html.push('<div class="jarviswidget-ctrls">')
        html.push(
          '  <a id="rotate-backward" href="javascript:void(0);" class="button-icon">'
        )
        html.push('    <i class="fa fa-backward"></i>')
        html.push('  </a>')
        html.push(
          '  <a id="rotate-pause" href="javascript:void(0);" class="button-icon">'
        )
        if (context.play) {
          html.push('    <i class="fa fa-pause"></i>')
        } else {
          html.push('    <i class="fa fa-play"></i>')
        }
        html.push('  </a>')
        html.push(
          '  <a id="rotate-forward" href="javascript:void(0);" class="button-icon">'
        )
        html.push('    <i class="fa fa-forward"></i>')
        html.push('  </a>')
        html.push(
          '  <a id="rotate-end" href="javascript:void(0);" class="button-icon">'
        )
        html.push('    <i class="fa fa-times"></i>')
        html.push('  </a>')
        html.push('</div>')
        $('[data-monitor-id^=widget] header').append(html.join(''))

        if (servkit.configUseShiftdata()) {
          //是否使用班次時間去減資料
          servkit
            .schedule('updateShiftData')
            .freqMillisecond(900000)
            .action(function () {
              servkit.ajax(
                {
                  url: 'api/workshift/nowLogicallyDate',
                  type: 'GET',
                  contentType: 'application/json',
                },
                {
                  success: function (date) {
                    servkit.ajax(
                      {
                        url: 'api/workshift/now',
                        type: 'GET',
                        contentType: 'application/json',
                      },
                      {
                        success: function (data) {
                          if (data && data['name']) {
                            context.machineMonitor.workShiftName = data['name'] // 紀錄班次名稱
                            if (
                              !context.machineMonitor.hippo[
                                'shiftdata_for_monitor'
                              ]
                            ) {
                              context.machineMonitor.hippo[
                                'shiftdata_for_monitor'
                              ] = {
                                0: {
                                  elements: [],
                                  columns: [],
                                },
                              }
                            }
                            context.machineMonitor.hippo[
                              'shiftdata_for_monitor'
                            ][0].columns = _.union(
                              context.machineMonitor.hippo[
                                'shiftdata_for_monitor'
                              ].columns,
                              [
                                'machine_id',
                                'date',
                                'work_shift',
                                'power_millisecond',
                                'oper_millisecond',
                                'cut_millisecond',
                                'partcount',
                              ]
                            )
                            if (
                              Object.keys(context.machineMonitor.hippo).length
                            ) {
                              // 更新hippo
                              context.setHippoSchedule(date)
                            }
                          }
                        },
                      }
                    )
                  },
                }
              )
            })
            .start()
        } else {
          if (Object.keys(context.machineMonitor.hippo).length) {
            // 更新hippo
            context.setHippoSchedule(moment(new Date()).format('YYYYMMDD'))
          }
        }

        if (Object.keys(context.machineMonitor.deviceStatus).length) {
          // 更新devicestatus
          context.setDeviceStatusSchedule()
        }

        if (Object.keys(context.machineMonitor.api).length) {
          // 更新api
          context.setAPISchedule()
        }
      }
    },
    util: {
      machineId: null,
      brandId: null,
      boxId: null,
      machineMonitor: null,
      order: -1,
      play: true,
      machineList: [],
      lang: servkit.getCookie('lang'),
      setHippoSchedule: function (date) {
        // 更新hippo
        var ctx = this
        servkit
          .schedule('getCustomerHippo')
          .freqMillisecond(30 * 60 * 1000)
          .action(function () {
            ctx.machineMonitor.hippoUpdate(date)
          })
          .start()
      },
      setDeviceStatusSchedule: function () {
        // 更新devicestatus
        var ctx = this
        servkit.subscribe('DeviceStatus', {
          machines: [ctx.boxId],
          dataModeling: true,
          handler: function (data) {
            ctx.machineMonitor.deviceStatusUpdate(data)
          },
          noDataHandler: function (data) {
            ctx.machineMonitor.deviceStatusUpdate(data)
          },
          allBrand: true,
        })
      },
      setAPISchedule: function () {
        // 更新api
        var ctx = this
        var timeoutMilliseconds = 1000
        if (servtechConfig.ST_DEVICESTATUS_FREQUNECY) {
          timeoutMilliseconds = servtechConfig.ST_DEVICESTATUS_FREQUNECY
        }
        servkit
          .schedule('getCustomerAPI')
          .freqMillisecond(timeoutMilliseconds)
          .action(function () {
            _.each(ctx.machineMonitor.api, (ele) => {
              var param = ctx.machineMonitor.components[ele[0]].param.source // 取第一個元件的設定就可以了
              param.data = {
                machine_id: ctx.machineId,
              }
              servkit.ajax(ctx.machineMonitor.getAjaxData(param), {
                success: function (data) {
                  ctx.machineMonitor.apiUpdate(data, ele)
                },
              })
            })
          })
          .start()
      },
      getParamFile: function (machineId, brandId, callback) {
        // 決定拿哪一份設定檔
        var ctx = this
        var pathArray = [
          'equipMonitor/users/' + machineId + '.json',
          // 'equipMonitor/users/' + machineId + '.csv',
          'equipMonitor/template/' + brandId + '.json',
          // 'equipMonitor/template/' + brandId + '.csv'
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
                callback(configData)
              },
              fail: function () {
                if (index < pathArray.length - 1) {
                  index++
                  getParamByFile()
                } else {
                  callback([])
                  // $.smallBox({
                  //   title: '找不到此廠牌template設定檔',
                  //   content: '<i class="fa fa-clock-o"></i> <i>2 seconds ago...</i>',
                  //   color: '#C79121',
                  //   iconSmall: '',
                  //   timeout: 60000
                  // })
                  ctx.machineList.splice(ctx.machineList.indexOf(machineId), 1)
                  ctx.schedule.stop()
                  ctx.schedule.start()
                }
              },
            }
          )
        }
        getParamByFile()
      },
    },
    delayCondition: [
      'machineList',
      'machinePlantAreaList',
      'plantAreaList',
      'machineLightList',
    ],
    dependencies: [
      [
        '/js/plugin/flot/jquery.flot.cust.min.js',
        '/js/plugin/flot/jquery.flot.pie.min.js',
        '/js/plugin/flot/jquery.flot.stack.min.js',
        '/js/plugin/flot/jquery.flot.resize.min.js',
        '/js/plugin/flot/jquery.flot.time.min.js',
        '/js/plugin/flot/jquery.flot.tooltip.min.js',
        '/js/plugin/flot/jquery.flot.axislabels.js',
        '/js/plugin/flot/jquery.flot.orderBar.min.js',
      ],
      ['/js/plugin/d3/d3.min.js'],
      ['/js/plugin/sparkline/jquery.sparkline.min.js'],
    ],
  })
}
