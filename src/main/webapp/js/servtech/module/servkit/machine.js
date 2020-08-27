import { ajax } from './ajax.js'

let boxMap
let isBoxGot = false

let machinesMap
let isMachinesGot = false

let machineLightsMap
let isMachineLightsGot = false

let machineBrandMap
let isMachineBrandGot = false

let brandMap
let isBrandGot = false

let machinePlantAreaMap
let plantAreaMachineMap
let isMachinePlantAreaGot = false

let plantAreaMap
let isPlantAreaGot = false

let appFuncBindingBrandMachineMap
let isAppFuncBindingBrandMachineGot = false

function fetchBoxInfo() {
  return new Promise((res) =>
    ajax(
      {
        url: 'api/box/read',
        type: 'GET',
      },
      {
        success(data) {
          res(data)
        },
      }
    )
  )
}
/**
 * 更新BOX
 * @memberof module:servkit
 * @param {Array} boxData BOX的物件資訊
 */
function refreshBoxMap(boxData) {
  if (boxData.length) {
    boxMap = Object.fromEntries(
      boxData.map(({ box_id, devices }) => [box_id, devices || []])
    )
  } else {
    console.warn('無BOX，請確認...')
  }
  isBoxGot = true
}
function initBoxInfo() {
  return fetchBoxInfo().then((data) => refreshBoxMap(data))
}

function fetchMachineData() {
  return new Promise((res) =>
    ajax(
      {
        url: 'api/getdata/db',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          table: 'm_device',
          columns: [
            'device_id',
            'device_name',
            'is_real_data',
            'demo_status',
            'device_type',
          ],
        }),
      },
      {
        success(data) {
          res(data)
        },
      }
    )
  )
}
/**
 * 更新機台名稱
 * @memberof module:servkit
 * @param {Array} machineData 機台的物件資訊(含demo_status, device_id, device_name, is_real_data)
 */
function refreshMachineName(machineData) {
  if (
    machineData.length &&
    machineData[0]['device_id'] &&
    machineData[0]['device_name']
  ) {
    machinesMap = {}
    _.each(machineData, function (machine) {
      if (machine.device_type) {
        Object.defineProperty(
          machine,
          'machine_type',
          Object.getOwnPropertyDescriptor(machine, 'device_type')
        )
        delete machine['device_type']
      }
      machinesMap[machine['device_id']] = machine
    })
  } else {
    console.warn('無機台，請確認...')
  }
  isMachinesGot = true
}
/**
 * 取得機台 id 名稱，存至 machinesMap
 * @memberof module:servkit   *
 * @param {Function} cb 取得機台資訊後的call back
 */
function loadMachineIds(cb) {
  return fetchMachineData().then((data) => {
    refreshMachineName(data)
    if (cb) {
      cb(getMachineList())
    }
  })
}

function fetchMachineLightData() {
  // 取得燈號，存至 machineLightsMap
  return new Promise((res) =>
    ajax(
      {
        url: 'api/getdata/db',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          table: 'm_device_light',
          columns: ['light_id', 'light_name', 'color'],
        }),
      },
      {
        success(data) {
          res(data)
        },
      }
    )
  )
}
/**
 * 更新機台燈號<br>
 * 燈號代碼：<br>
 * - 0：離線<br>
 * - 11：工作中<br>
 * - 12：閒置中<br>
 * - 13：換線中<br>
 * @memberof module:servkit
 * @param {Array} machineLightData 燈號狀態(含color, light_id, light_name)
 */
function refreshMachineLight(machineLightData) {
  if (
    machineLightData.length &&
    machineLightData[0]['light_id'] &&
    machineLightData[0]['light_name']
  ) {
    machineLightsMap = _.indexBy(machineLightData, 'light_id')
  } else {
    console.warn('無機台燈號，請確認...')
  }
  isMachineLightsGot = true
}
function initMachineLightData() {
  return fetchMachineLightData().then((data) => refreshMachineLight(data))
}

function fetchMachineBrandData() {
  return new Promise((res) =>
    ajax(
      {
        url: 'api/getdata/db',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          table: 'm_device_cnc_brand',
          columns: ['device_id', 'cnc_id'],
        }),
      },
      {
        success(data) {
          res(data)
        },
      }
    )
  )
}
/**
 * 更新機台廠牌
 * @memberof module:servkit
 * @param {Array} machines 機台資訊(含cnc_id, device_id)
 */
function refreshMachineBrand(machines) {
  if (machines.length && machines[0]['device_id'] && machines[0]['cnc_id']) {
    machineBrandMap = {}
    _.each(machines, function (machine) {
      machineBrandMap[machine['device_id']] = machine
    })
  } else {
    console.warn('無廠牌，請確認...')
  }
  isMachineBrandGot = true
}
function initMachineBrandData() {
  return fetchMachineBrandData().then((data) => refreshMachineBrand(data))
}

function fetchBrandData() {
  return new Promise((res) =>
    ajax(
      {
        url: 'api/getdata/db',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          table: 'm_cnc_brand',
          columns: ['cnc_id', 'name'],
        }),
      },
      {
        success(data) {
          res(data)
        },
      }
    )
  )
}
/**
 * 更新廠牌名稱
 * @memberof module:servkit
 * @param {Array} brands 機台資訊(cnc_id, name)
 */
function refreshBrand(brands) {
  if (brands.length && brands[0]['cnc_id'] && brands[0]['name']) {
    brandMap = {}
    _.each(brands, function (brand) {
      brandMap[brand['cnc_id']] = brand
    })
  } else {
    console.warn('無廠牌，請確認...')
  }
  isBrandGot = true
}
function initBrandData() {
  return fetchBrandData().then((data) => refreshBrand(data))
}

function fetchMachinePlantAreaData() {
  // 取得機台廠區，存至 machinePlantAreaMap
  return new Promise((res) =>
    ajax(
      {
        url: 'api/getdata/db',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          table: 'm_plant_area',
          columns: ['device_id', 'plant_id'],
        }),
      },
      {
        success(data) {
          res(data)
        },
      }
    )
  )
}
/**
 * 更新機台廠區
 * @memberof module:servkit
 * @param {Array} machines 機台資訊(含plant_id, device_id)
 */
function refreshMachinePlantArea(machines) {
  if (machines.length && machines[0]['device_id'] && machines[0]['plant_id']) {
    machinePlantAreaMap = {}
    plantAreaMachineMap = {}
    _.each(machines, function (machine) {
      machinePlantAreaMap[machine['device_id']] = machine

      if (!plantAreaMachineMap[machine['plant_id']]) {
        plantAreaMachineMap[machine['plant_id']] = []
      }
      plantAreaMachineMap[machine['plant_id']].push(machine['device_id'])
    })
  } else {
    console.warn('無廠牌，請確認...')
  }
  isMachinePlantAreaGot = true
}
function initMachinePlantAreaData() {
  return fetchMachinePlantAreaData().then((data) =>
    refreshMachinePlantArea(data)
  )
}

function fetchPlantAreaData() {
  // 取得廠區，存至 plantAreaMap
  return new Promise((res) =>
    ajax(
      {
        url: 'api/getdata/db',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          table: 'm_plant',
          columns: ['plant_id', 'plant_name'],
        }),
      },
      {
        success(data) {
          res(data)
        },
      }
    )
  )
}
/**
 * 更新廠區
 * @memberof module:servkit
 * @param {Array} plants 機台資訊(含plant_id, plant_name)
 */
function refreshPlantArea(plants) {
  if (plants.length && plants[0]['plant_id']) {
    plantAreaMap = {}
    _.each(plants, function (plant) {
      plantAreaMap[plant['plant_id']] = plant
    })
  } else {
    console.warn('無廠區，請確認...')
  }
  isPlantAreaGot = true
}
function initPlantAreaData() {
  return fetchPlantAreaData().then((data) => refreshPlantArea(data))
}

function fetchAppFuncBindingBrandMachineMap() {
  return new Promise((res) =>
    ajax(
      {
        url: 'api/getdata/db',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          table: 'm_view_device_cnc_brand',
          columns: [
            'app_id',
            'func_id',
            'device_id',
            'device_name',
            'not_default_key',
          ],
        }),
      },
      {
        success(data) {
          res(data)
        },
      }
    )
  )
}
function refreshAppFuncBindingBrandMachineMap(data) {
  appFuncBindingBrandMachineMap = data
  isAppFuncBindingBrandMachineGot = true
}
function initAppFuncBindingBrandMachineMap() {
  return fetchAppFuncBindingBrandMachineMap().then((data) =>
    refreshAppFuncBindingBrandMachineMap(data)
  )
}

function getBoxMap() {
  return boxMap
}
/**
 * 可取得boxIds
 * @memberof module:servkit
 * @returns {Array}
 */
function getBoxList() {
  if (boxMap) {
    return _.keys(boxMap)
  }
}
function getBoxByMachine(machineId) {
  let deviceData
  const boxId = _.findKey(boxMap, (devices) => {
    deviceData = devices.find((value) => value.device_id === machineId)
    return !!deviceData
  })
  return boxId
}
/**
 * 以物件方式存取燈號名稱和顏色，索引值則為燈號ID
 * @memberof module:servkit
 * @returns {Array} memo 燈號物件(含名稱、顏色)
 */
function getMachineLightMap() {
  return _.reduce(
    machineLightsMap,
    function (memo, elem) {
      memo[elem.light_id] = {
        light_name: elem.light_name,
        color: elem.color,
      }
      return memo
    },
    {}
  )
}
/**
 * 可取得燈號資訊
 * @memberof module:servkit
 * @param {Function} cb callback
 */
function eachMachineLight(cb) {
  _.each(_.keys(machineLightsMap).sort(), function (lightId) {
    cb(
      lightId,
      machineLightsMap[lightId].light_name,
      machineLightsMap[lightId].color
    )
  })
}
/**
 * 以燈號ID，取得機台燈號相對的名稱
 * @memberof module:servkit
 * @param {Number} status 燈號狀態代碼
 * @returns {String} status 燈號名稱
 */
function getMachineLightName(status) {
  if (machineLightsMap && machineLightsMap[status]) {
    return machineLightsMap[status].light_name
  }
  return status
}
/**
 * 以燈號ID，取得機台燈號相對的顏色
 * @memberof module:servkit
 * @param {Number} status 燈號狀態代碼
 * @returns {String} status 燈號顏色
 */
function getMachineLightColor(status) {
  if (machineLightsMap && machineLightsMap[status]) {
    return machineLightsMap[status].color
  }
  return status
}
/**
 * 以物件方式存取機台名稱、是否為真實資料、demo狀態、機種，索引值則為機台ID
 * @memberof module:servkit
 * @returns {Array} memo 機台物件(含名稱、是否為真實資料、demo狀態、機種)
 */
function getMachineMap(appId, funcId) {
  let machinesData = machinesMap
  if (appId && funcId) {
    let blindingMachines = appFuncBindingBrandMachineMap
    let assignMachines = _.where(blindingMachines, {
      app_id: appId,
      func_id: funcId,
    })
    if (assignMachines.length > 0) {
      let newMachinesMap = {}
      _.each(assignMachines, function (num) {
        newMachinesMap[num['device_id']] = machinesData[num['device_id']]
      })
      machinesData = newMachinesMap
    }
  }
  return _.reduce(
    machinesData,
    function (memo, elem) {
      memo[elem.device_id] = {
        device_id: elem.device_id,
        device_name: elem.device_name,
        is_real_data: elem.is_real_data,
        demo_status: elem.demo_status,
        machine_type: elem.machine_type,
      }
      return memo
    },
    {}
  )
}
/**
 * 取得所有機台ID
 * @memberof module:servkit
 * @returns {Array}
 */
function getMachineList() {
  return machinesMap ? _.keys(machinesMap) : []
}

/**
 * 以機台ID，取得機台名稱
 * @memberof module:servkit
 * @param {String} id 機台的代號
 * @returns {String} machinesMap[id]['device_name'] || id 機台的名稱，若沒有名稱則回傳ID
 */
function getMachineName(id) {
  if (machinesMap && machinesMap[id]) {
    return machinesMap[id]['device_name'] || id
  }
  return id
}

/**
 * 可取得機台資訊
 * @memberof module:servkit
 * @param {Function} cb callback
 */
function eachMachine(cb) {
  _.each(_.keys(machinesMap).sort(), function (machineId) {
    cb(machineId, machinesMap[machineId]['device_name'], machinesMap[machineId])
  })
}
/**
 * 取得指定條件的機台資訊
 * @memberof module:servkit
 * @param {Function} cb callback
 * @returns {Object} 機台資訊
 */
function filterMachine(cb) {
  return _.pick(machinesMap, cb)
}
/**
 * 以物件方式存取廠牌ID，索引值則為機台ID
 * @memberof module:servkit
 * @returns {Array} memo 機台廠牌物件(含廠牌ID)
 */
function getMachineBrandMap() {
  return _.reduce(
    machineBrandMap,
    function (memo, elem) {
      memo[elem.device_id] = {
        cnc_id: elem.cnc_id,
      }
      return memo
    },
    {}
  )
}
/**
 * 以機台ID，取得機台廠牌ID
 * @memberof module:servkit
 * @param {String} id 機台的代號
 * @returns {String} machineBrandMap[id]['cnc_id'] || '' 機台廠牌ID，若沒有名稱則回傳空值
 */
function getMachineBrand(id) {
  if (machineBrandMap && machineBrandMap[id]) {
    return machineBrandMap[id]['cnc_id'] || ''
  }
  return ''
}
/**
 * 以廠牌ID，取得廠牌名稱
 * @memberof module:servkit
 * @param {String} id 廠牌的代號
 * @returns {String} brandMap[id]|| id 廠牌的名稱，若沒有名稱則回傳ID
 */
function getBrandName(id) {
  if (brandMap && brandMap[id]) {
    return brandMap[id]['name'] || id
  }
  return id
}
/**
 * 以物件方式存取廠牌x
 * @memberof module:servkit
 * @returns {Array} brandMap物件(含id、name)
 */
function getBrandMap() {
  return brandMap
}
/**
 * 以機台ID，取得機台廠區ID
 * @memberof module:servkit
 * @param {String} id 機台的代號
 * @returns {String} machinePlantAreaMap[id]['plant_id'] || '' 機台廠區ID，若沒有名稱則回傳空值
 */
function getPlantAreaByMachine(id) {
  if (machinePlantAreaMap && machinePlantAreaMap[id]) {
    return machinePlantAreaMap[id]['plant_id'] || ''
  }
  return ''
}
/**
 * 取得廠區機台MAP
 * @memberof module:servkit
 * @returns {Map} plantAreaMachineMap || ''
 */
function getPlantAreaMachineMap() {
  return plantAreaMachineMap || null
}
/**
 * 以物件方式存取廠區ID，索引值則為機台ID
 * @memberof module:servkit
 * @returns {Array} memo 機台廠區物件(含廠區ID)
 */
function getMachinePlantAreaMap() {
  return _.reduce(
    machinePlantAreaMap,
    function (memo, elem) {
      memo[elem.device_id] = {
        plant_id: elem.plant_id,
      }
      return memo
    },
    {}
  )
}
/**
 * 以物件方式存取廠區
 * @memberof module:servkit
 * @returns {Array} plantAreaMap物件(含id、name)
 */
function getPlantAreaMap() {
  return plantAreaMap
}
/**
 * 以廠區ID，取得廠區名稱
 * @memberof module:servkit
 * @param {String} id 廠區的代號
 * @returns {String} plantAreaMap物件[id]|| id 廠牌的名稱，若沒有名稱則回傳ID
 */
function getPlantAreaName(id) {
  if (plantAreaMap && plantAreaMap[id]) {
    return plantAreaMap[id]['plant_name'] || id
  }
  return id
}
function getAppFuncBindingBrandMachineMap() {
  return appFuncBindingBrandMachineMap
}
function boxGot() {
  return isBoxGot
}
/**
 * 是否取得機器燈號資訊
 * @memberof module:servkit
 * @returns {Boolean} machineLightGot
 */
function machineLightsGot() {
  return isMachineLightsGot
}
/**
 * 是否取得機台資訊
 * @memberof module:servkit
 * @returns {Boolean} machinesGot
 */
function machinesGot() {
  return isMachinesGot
}
/**
 * 是否取得機台廠牌資訊
 * @memberof module:servkit
 * @returns {Boolean} machineBrandGot
 */
function machineBrandGot() {
  return isMachineBrandGot
}
function brandGot() {
  return isBrandGot
}
/**
 * 是否取得機台廠區資訊
 * @memberof module:servkit
 * @returns {Boolean} machinePlantAreaGot
 */
function machinePlantAreaGot() {
  return isMachinePlantAreaGot
}
/**
 * 是否取得廠區資訊
 * @memberof module:servkit
 * @returns {Boolean} plantAreaGot
 */
function plantAreaGot() {
  return isPlantAreaGot
}
function appFuncBindingBrandMachineGot() {
  return isAppFuncBindingBrandMachineGot
}

export {
  getBoxMap,
  getBoxList,
  getBoxByMachine,
  getMachineLightMap,
  eachMachineLight,
  getMachineLightName,
  getMachineLightColor,
  getMachineMap,
  getMachineList,
  getMachineName,
  eachMachine,
  filterMachine,
  getMachineBrandMap,
  getMachineBrand,
  getBrandName,
  getBrandMap,
  getPlantAreaByMachine,
  getPlantAreaMachineMap,
  getMachinePlantAreaMap,
  getPlantAreaMap,
  getPlantAreaName,
  getAppFuncBindingBrandMachineMap,
  boxGot,
  machineLightsGot,
  machinesGot,
  machineBrandGot,
  brandGot,
  machinePlantAreaGot,
  plantAreaGot,
  appFuncBindingBrandMachineGot,
  loadMachineIds,
  initBoxInfo,
  initBrandData,
  initMachineBrandData,
  initMachineLightData,
  initMachinePlantAreaData,
  initPlantAreaData,
  initAppFuncBindingBrandMachineMap,
}
