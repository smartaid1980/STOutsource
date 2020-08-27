import { servtechConfig } from '../servtech.config.js'
import servkit from './servkit.js'
import { ajax } from './ajax.js'
import { filterMachine } from './machine.js'
/**
 * subcriber = {
 *  [type]: {
 *    [subscriberTag]: handlerWithMachines
 *  }
 * }
 */
let timerID = 0
let started = false
let subscriber = {}
let defaultTag = 1
let allBrandIndex = 0
const executionSpan = servtechConfig.ST_DEVICESTATUS_FREQUNECY || 1000 // MS
const machineList = []
const demoMachineMap = {}
const allBrandDemoData = {}
const signalKeys = [
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
const demoDataTemplate = {
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
    'G_OPRT()': [['' + (Math.floor(Math.random() * 200000000) + 557654321)]],
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
    'G_OPRT()': [['' + (Math.floor(Math.random() * 100000000) + 457654321)]],
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
    'G_OPRT()': [['' + (Math.floor(Math.random() * 100000000) + 457654321)]],
    'G_TOCP()': [['' + (Math.floor(Math.random() * 50) + 100)]],
  },
}
const demoData = {}

function subscribe(type, handlerWithMachines, tag) {
  const subscriberTag = tag || 'default' + defaultTag++

  if (subscriber[type]) {
    if (subscriber[type][subscriberTag]) {
      subscriber[type][
        subscriberTag + '_' + moment().format('YYYYMMDDHHmmssSSS')
      ] = handlerWithMachines
    } else {
      subscriber[type][subscriberTag] = handlerWithMachines
    }
  } else {
    subscriber[type] = {}
    subscriber[type][subscriberTag] = handlerWithMachines
  }

  if (!started) {
    start()
  }
}

function unsubscribe(type) {
  subscriber = _.omit(subscriber, type)
}

function subscribeInfo() {
  console.log('Current timer ID: ' + timerID)
  console.dir(subscriber)
}

function getMqttData(ajaxData) {
  /**
   * ajaxData = {
   *  [topic]: [...machineIdList]
   * }
   * *topic: 最基本的就是機台狀態 DeviceStatus
   */
  return new Promise((res, rej) =>
    ajax(
      {
        url: 'api/mqttpool/data',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(ajaxData),
      },
      {
        success(data) {
          res(data)
        },
        fail(data) {
          rej(data)
        },
      }
    )
  )
}
function dataHandler(type, tag, data, handlerWithMachines) {
  const { machines: boxIdList } = handlerWithMachines
  let cacheBean = null
  let cacheCount = 0
  let deviceStatusType
  let toHandlerData
  if (!data) {
    return console.warn('後端根本沒給 ' + type + '，請不要跟我要這個...')
  }

  try {
    toHandlerData = _.pick(data, boxIdList)
    if (type === 'DeviceStatus') {
      /* 2018-08-09 為了避免BOX重啟期間超過cacheBean timeout 時間，在前端再設一道防線。因為BOX可單獨重開，30秒內要保持該BOX使用最後有資料的狀態 */
      const missingBoxes = _.difference(boxIdList, Object.keys(toHandlerData))
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

      // 有資料
      if (Object.keys(toHandlerData).length) {
        cacheBean = toHandlerData // 暫存資料
        if (handlerWithMachines.dataModeling) {
          // 模型化資料
          deviceStatusType = _.chain(toHandlerData)
            .mapObject(
              (data) =>
                new DeviceStatusType(
                  JSON.parse(data),
                  handlerWithMachines.allBrand
                )
            )
            .values()
            .value()
          handlerWithMachines.handler(deviceStatusType)
        } else {
          // 不須模型化
          handlerWithMachines.handler(toHandlerData)
        }
      } else if (_.isFunction(handlerWithMachines.noDataHandler)) {
        // 無資料處理
        deviceStatusType = new DeviceStatusType(
          {
            type: 'DeviceStatus',
          },
          handlerWithMachines.allBrand
        )
        handlerWithMachines.noDataHandler([deviceStatusType])
      } else {
        console.warn('[' + type + ':' + tag + '] No data...')
      }
    } else {
      if (Object.keys(toHandlerData).length) {
        handlerWithMachines.handler(
          _.mapObject(toHandlerData, (data) => JSON.parse(data))
        )
      } else if (_.isFunction(handlerWithMachines.noDataHandler)) {
        handlerWithMachines.noDataHandler()
      } else {
        console.warn('[' + type + ':' + tag + '] No data...')
      }
    }
  } catch (e) {
    console.warn('[' + type + ':' + tag + '] ' + e.message)
    console.warn(e)
  }
}
function mqttDataHandler(data) {
  const subscribeTypeList = Object.keys(subscriber)

  subscribeTypeList.forEach((type) => {
    _.each(subscriber[type], function (handlerWithMachines, tag) {
      dataHandler(type, tag, data[type], handlerWithMachines)
    })
  })
}

function exec() {
  const subscribeTypeList = Object.keys(subscriber)

  if (subscribeTypeList.length === 0) {
    stop()
    return
  }

  const ajaxData = _.mapObject(subscriber, function (tagByType, type) {
    return _.chain(tagByType).pluck('machines').flatten().uniq().value()
  })

  return getMqttData(ajaxData)
    .then(mqttDataHandler)
    .catch((data) => {
      console.log(data)
    })
    .finally(() => {
      timerID = setTimeout(exec, executionSpan)
    })
}

function start() {
  started = true

  exec()

  servkit.fetchBrandDataPromise.then(() => {
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
  })
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

function DeviceStatusType(data, isAllBrand) {
  const self = this
  if (data.type !== 'DeviceStatus') {
    throw Error({
      name: 'NotDeviceStatusProtoBuf',
      message: '此 protobuf 不是 DeviceStatus',
    })
  }

  if (data.result) {
    // 真資料
    self.data = data
    self.commandWithMachine = data.result.stringValues.reduce((acc, value) => {
      acc[value.signal.id] = deviceStatusStringValuesToMachineMutisystem(
        value.values[0].array
      )
      return acc
    }, {})
  }

  // 假資料塞入
  if (isAllBrand) {
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
            if (!self.commandWithMachine) {
              self.commandWithMachine = {}
            }
            if (!self.commandWithMachine[command]) {
              self.commandWithMachine[command] = {}
            }
            self.commandWithMachine[command][machine.device_id] =
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
          if (!self.commandWithMachine) {
            self.commandWithMachine = {}
          }
          if (!self.commandWithMachine[command]) {
            self.commandWithMachine[command] = {}
          }
          self.commandWithMachine[command][machine.device_id] = getDemoData(
            machine.device_id
          )[machine.demo_status][command]
        } catch (e) {
          self.commandWithMachine[command][machine.device_id] = ['B']
        }
      })
    })
  }
}
DeviceStatusType.prototype = {
  getBox() {
    return this.data.from
  },
  getType() {
    return this.data.type
  },
  getValue(command, machineId) {
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
  getMachineValue(command, machineId) {
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
  eachMachine(command, callback) {
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
  listCommands() {
    return _.keys(this.commandWithMachine)
  },
  listMachines() {
    var firstCommand = this.listCommands()[0]
    return _.keys(this.commandWithMachine[firstCommand])
  },
  toString() {
    return JSON.stringify(this.data)
  },
}

function getDemoData(machineId) {
  if (!demoData[machineId]) {
    demoData[machineId] = $.extend(true, {}, demoDataTemplate)
  }

  return demoData[machineId]
}

function initBroadcaster() {
  $(window).on('hashchange', stop)

  // 假資料機台清單
  servkit.fetchMachineDataPromise.then(() =>
    Object.assign(
      demoMachineMap,
      filterMachine((machineData) => !machineData.is_real_data)
    )
  )
}

export { subscribe, unsubscribe, subscribeInfo, initBroadcaster }
