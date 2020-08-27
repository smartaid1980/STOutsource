;(function (global, $, _) {
  global.servkit = servkit || {}

  var timerID = 0
  var started = false
  var timeoutMilliseconds = 1000
  var subscriber = {}
  var defaultTag = 1
  var machineList = []
  var allBrandDemoData = {}
  var allBrandIndex = 0

  if (servtechConfig.ST_DEVICESTATUS_FREQUNECY) {
    timeoutMilliseconds = servtechConfig.ST_DEVICESTATUS_FREQUNECY
  }

  servkit.subscribe = function (type, handlerWithMachines, tag) {
    tag = tag || 'default' + defaultTag++

    if (subscriber[type]) {
      if (subscriber[type][tag]) {
        subscriber[type][
          tag + '_' + moment().format('YYYYMMDDHHmmssSSS')
        ] = handlerWithMachines
      } else {
        subscriber[type][tag] = handlerWithMachines
      }
    } else {
      subscriber[type] = {}
      subscriber[type][tag] = handlerWithMachines
    }

    if (!started) {
      start()
    }
  }

  servkit.unsubscribe = function (type) {
    subscriber = _.omit(subscriber, type)
  }

  servkit.subscribeInfo = function () {
    console.log('Current timer ID: ' + timerID)
    console.dir(subscriber)
  }

  $(window).on('hashchange', stop)

  function start() {
    started = true
    var cacheBean = null
    var cacheCount = 0

    ;(function exec() {
      var types = _.keys(subscriber)
      if (types.length === 0) {
        stop()
        return
      }

      var ajaxData = _.mapObject(subscriber, function (tagByType) {
        return _.chain(tagByType).pluck('machines').flatten().uniq().value()
      })

      servkit.ajax(
        {
          url: 'api/mqttpool/data',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(ajaxData),
        },
        {
          success: function (data) {
            // var subscriberCount = 0
            var toHandlerData
            _.each(types, function (type) {
              _.each(subscriber[type], function (handlerWithMachines, tag) {
                // subscriberCount++
                if (data[type]) {
                  try {
                    toHandlerData = _.pick(
                      data[type],
                      handlerWithMachines.machines
                    )
                    if (type === 'DeviceStatus') {
                      /* 2018-08-09 為了避免BOX重啟期間超過cacheBean timeout 時間，在前端再設一道防線。因為BOX可單獨重開，30秒內要保持該BOX使用最後有資料的狀態 */
                      let missingBoxes = _.difference(
                        handlerWithMachines.machines,
                        _.keys(toHandlerData)
                      )
                      if (cacheCount > 30) {
                        cacheCount = 0
                        cacheBean = null
                      } else if (missingBoxes.length === 0) {
                        // 如果都沒有少資料就把捕的次數歸零
                        cacheCount = 0
                      } else if (missingBoxes.length && cacheBean !== null) {
                        // 把新收到的資料覆蓋到暫存的資料
                        cacheCount++
                        toHandlerData = _.extend(cacheBean, toHandlerData)
                      }

                      if (_.keys(toHandlerData).length) {
                        // 驗證有無資料
                        cacheBean = toHandlerData // 暫存資料
                        if (handlerWithMachines.dataModeling) {
                          // 使用者要模型化資料嗎?
                          handlerWithMachines.handler(
                            _.chain(toHandlerData)
                              .mapObject(function (data) {
                                return new DeviceStatusType(
                                  JSON.parse(data),
                                  handlerWithMachines.allBrand
                                )
                              })
                              .values()
                              .value()
                          )
                        } else {
                          // 不須模型化
                          handlerWithMachines.handler(toHandlerData)
                        }
                      } else if (
                        typeof handlerWithMachines.noDataHandler === 'function'
                      ) {
                        if (handlerWithMachines.allBrand) {
                          handlerWithMachines.noDataHandler([
                            new DeviceStatusType(
                              { type: 'DeviceStatus' },
                              handlerWithMachines.allBrand
                            ),
                          ])
                        } else {
                          handlerWithMachines.noDataHandler([
                            new DeviceStatusType({ type: 'DeviceStatus' }),
                          ])
                        }
                      } else {
                        console.warn('[' + type + ':' + tag + '] No data...')
                      }
                    } else {
                      // type.substring(0, 3) === 'sd_' || type.substring(0, 3) === 'js_'
                      if (_.keys(toHandlerData).length) {
                        handlerWithMachines.handler(
                          _.mapObject(toHandlerData, function (d) {
                            return JSON.parse(d)
                          })
                        )
                      } else if (
                        typeof handlerWithMachines.noDataHandler === 'function'
                      ) {
                        handlerWithMachines.noDataHandler()
                      } else {
                        console.warn('[' + type + ':' + tag + '] No data...')
                      }
                    }
                  } catch (e) {
                    console.warn('[' + type + ':' + tag + '] ' + e.message)
                    console.warn(e)
                  }
                } else {
                  console.warn('後端根本沒給 ' + type + '，請不要跟我要這個...')
                }
              })
            })
          },
          always: function () {
            timerID = setTimeout(exec, timeoutMilliseconds)
          },
        }
      )
    })()

    ;(function () {
      _.each(servkit.getBrandMap(), (brand) => {
        $.getJSON(
          'app/EquipMonitor/demo_data/' + brand.cnc_id + '.json',
          function (data) {
            _.each(data, (value, brand_id) => {
              allBrandDemoData[brand_id] = value
            })
          }
        )
      })
    })()
  }

  function stop() {
    clearTimeout(timerID)
    timerID = 0
    subscriber = {}
    started = false
  }

  function restoreMachineList() {
    servkit.eachMachine(function (id) {
      machineList.push(id)
    })
  }

  function deviceStatusStringValuesToMachineMutisystem(matrix) {
    if (machineList.length === 0) {
      restoreMachineList()
    }

    return _.reduce(
      matrix,
      function (memo, row) {
        var value
        try {
          // 避免某個參數資料錯誤導致整包資料拿不到...
          value = JSON.parse(row)
        } catch (e) {
          console.warn(e, ', row: ', row)
          return memo
        }
        _.each(value, function (eachMachine) {
          if (machineList.indexOf(eachMachine[0]) !== -1) {
            if (!memo[eachMachine[0]]) {
              memo[eachMachine[0]] = []
            }
            memo[eachMachine[0]].push(_.rest(eachMachine))
          } else {
            // console.warn(eachMachine[0] + ' 不存在資料庫中，因此在 broadcaster 被濾掉了...');
          }
        })
        return memo
      },
      {}
    )
  }

  // 假資料機台清單
  var demoMachineMap = {}
  servkit
    .politeCheck()
    .until(function () {
      return servkit.machinesGot()
    })
    .thenDo(function () {
      demoMachineMap = servkit.filterMachine(function (machine, id) {
        return !machine.is_real_data
      })
    })
    .tryDuration(0)
    .start()

  function DeviceStatusType(data, allBrand) {
    var deviceStatusType = this
    if (data.type !== 'DeviceStatus') {
      throw Error({
        name: 'NotDeviceStatusProtoBuf',
        message: '此 protobuf 不是 DeviceStatus',
      })
    }

    if (data.result) {
      // 真資料
      this.data = data
      this.commandWithMachine = _.reduce(
        data.result.stringValues,
        function (memo, value) {
          memo[value.signal.id] = deviceStatusStringValuesToMachineMutisystem(
            value.values[0].array
          )
          return memo
        },
        {}
      )
    }

    // 假資料塞入
    if (allBrand) {
      allBrandIndex++
      if (allBrandIndex >= 500) {
        allBrandIndex = 0
      }
      _.each(demoMachineMap, function (machine) {
        try {
          _.each(
            allBrandDemoData[servkit.getMachineBrand(machine.device_id)][
              machine.demo_status
            ][0],
            function (value, command) {
              if (!deviceStatusType.commandWithMachine) {
                deviceStatusType.commandWithMachine = {}
              }
              if (!deviceStatusType.commandWithMachine[command]) {
                deviceStatusType.commandWithMachine[command] = {}
              }
              deviceStatusType.commandWithMachine[command][machine.device_id] =
                allBrandDemoData[servkit.getMachineBrand(machine.device_id)][
                  machine.demo_status
                ][allBrandIndex][command]
            }
          )
        } catch (e) {
          console.warn(e)
        }
      })
    } else {
      _.each(signalKeys, function (command) {
        _.each(demoMachineMap, function (machine) {
          try {
            if (!deviceStatusType.commandWithMachine) {
              deviceStatusType.commandWithMachine = {}
            }
            if (!deviceStatusType.commandWithMachine[command]) {
              deviceStatusType.commandWithMachine[command] = {}
            }
            deviceStatusType.commandWithMachine[command][
              machine.device_id
            ] = demoData(machine.device_id)[machine.demo_status][command]
          } catch (e) {
            deviceStatusType.commandWithMachine[command][machine.device_id] = [
              'B',
            ]
          }
        })
      })
    }
  }
  DeviceStatusType.prototype = {
    getBox: function () {
      return this.data.from
    },
    getType: function () {
      return this.data.type
    },
    getValue: function (command, machineId) {
      if (this.commandWithMachine[command]) {
        if (this.commandWithMachine[command][machineId]) {
          return this.commandWithMachine[command][machineId]
        } else {
          throw Error({
            name: 'NoMachineError',
            message: '並無 ' + machineId + ' 存在..., command: ' + command,
          })
        }
      } else {
        throw Error({
          name: 'NoCommandError',
          message: '並無 ' + command + ' 存在...',
        })
      }
    },
    getMachineValue: function (command, machineId) {
      // 單機監控用的getValue()
      if (this.commandWithMachine[command]) {
        if (this.commandWithMachine[command][machineId]) {
          var signalValue = $.extend(
            true,
            {},
            this.commandWithMachine[command][machineId]
          )
          _.each(signalValue[0], (value, key) => {
            if (value.search(/\[/) >= 0 && value.search(/\]/) >= 0) {
              if (value.search(/","/g) >= 0) {
                var valueList = []
                _.each(
                  value.replace(/"\["/g, '').replace(/"\]"/g, '').split(/","/g),
                  (val) => {
                    valueList.push(
                      val
                        .replace(/\[/, '')
                        .replace(/\](?!.*\])/, '')
                        .split(/,/g)
                    )
                  }
                )
                signalValue[0][key] = valueList
              } else {
                signalValue[0][key] = value
                  .replace(/"\[/, '')
                  .replace(/\]"(?!.*\]")/, '')
                  .split(/,/g)
              }
            } else if (value.search(/\{/) >= 0 && value.search(/\}/) >= 0) {
              var data = {}
              _.each(
                value
                  .replace(/\{/, '')
                  .replace(/\}/, '')
                  .replace(/"/g, '')
                  .split(/,/g),
                (val) => {
                  data[val.split(/\||:/g)[0]] = val.split(/\||:/g)[1]
                }
              )
              signalValue[0][key] = data
            }
          })
          return signalValue
        } else {
          throw Error({
            name: 'NoMachineError',
            message: '並無 ' + machineId + ' 存在..., command: ' + command,
          })
        }
      } else {
        throw Error({
          name: 'NoCommandError',
          message: '並無 ' + command + ' 存在...',
        })
      }
    },
    eachMachine: function (command, callback) {
      if (this.commandWithMachine[command]) {
        _.each(this.commandWithMachine[command], function (
          multisystem,
          machineId
        ) {
          callback(multisystem, machineId)
        })
      } else {
        throw Error({
          name: 'NoCommandError',
          message: '並無 ' + command + ' 存在...',
        })
      }
    },
    listCommands: function () {
      return _.keys(this.commandWithMachine)
    },
    listMachines: function () {
      var firstCommand = this.listCommands()[0]
      return _.keys(this.commandWithMachine[firstCommand])
    },
    toString: function () {
      return JSON.stringify(this.data)
    },
  }

  var signalKeys = [
    'G_CONS()',
    'G_SPMS()',
    'G_ACTF()',
    'G_SPSO()',
    'G_FERP()',
    'G_PRGM()',
    'G_ELCT()',
    'G_OPRT()',
    'G_TOCP()',
  ]
  function demoData(machineId) {
    if (!demoData[machineId]) {
      demoData[machineId] = {
        '11': {
          'G_CONS()': [['11']],
          'G_SPMS()': [['' + (Math.floor(Math.random() * 7000) + 2000)]],
          /* 速度非率 */
          'G_ACTF()': [['' + (Math.floor(Math.random() * 7000) + 2000)]],
          /* 進給非率 */
          'G_SPSO()': [['' + (Math.floor(Math.random() * 100) + 50)]],
          /* 速度率   */
          'G_FERP()': [['' + (Math.floor(Math.random() * 150) + 100)]],
          /* 進給率   */
          'G_PRGM()': [['O0001']],
          'G_ELCT()': [['' + (Math.floor(Math.random() * 1000) + 1000000000)]],
          'G_OPRT()': [
            ['' + (Math.floor(Math.random() * 200000000) + 557654321)],
          ],
          'G_TOCP()': [['' + (Math.floor(Math.random() * 50) + 2800)]],
        },
        '12': {
          'G_CONS()': [['12']],
          'G_SPMS()': [['0']],
          /* 速度非率 */
          'G_ACTF()': [['0']],
          /* 進給非率 */
          'G_SPSO()': [['0']],
          /* 速度率   */
          'G_FERP()': [['0']],
          /* 進給率   */
          'G_PRGM()': [['O0001']],
          'G_ELCT()': [['' + (Math.floor(Math.random() * 1000) + 1000000000)]],
          'G_OPRT()': [
            ['' + (Math.floor(Math.random() * 100000000) + 457654321)],
          ],
          'G_TOCP()': [['' + (Math.floor(Math.random() * 50) + 500)]],
        },
        '13': {
          'G_CONS()': [['13']],
          'G_SPMS()': [['0']],
          /* 速度非率 */
          'G_ACTF()': [['0']],
          /* 進給非率 */
          'G_SPSO()': [['0']],
          /* 速度率   */
          'G_FERP()': [['0']],
          /* 進給率   */
          'G_PRGM()': [['O0001']],
          'G_ELCT()': [['' + (Math.floor(Math.random() * 1000) + 1000000000)]],
          'G_OPRT()': [
            ['' + (Math.floor(Math.random() * 100000000) + 457654321)],
          ],
          'G_TOCP()': [['' + (Math.floor(Math.random() * 50) + 100)]],
        },
      }
    }

    return demoData[machineId]
  }
})(this, $, _)
