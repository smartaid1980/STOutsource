import * as variables from './var.js'
import Schedule from './Schedule.js'
import IpCamDrawer from './IpCamDrawer.js'
import * as allAjaxFn from './ajax.js'
import * as machineFnMap from './machine.js'
import * as form from './form.js'
import * as util from './util.js'
import * as appFunc from './appFunc.js'
import { subscribe, unsubscribe, subscribeInfo } from './broadcaster.js'
import * as monitor from './monitor.js'
import politeCheck from './politeCheck.js'
import { crudtable } from '../table/crudTable.js'
import { servtechConfig } from '../servtech.config.js'

const servkit = {
  fetchDemoConfigPromise: null,
  fetchBoxInfoPromise: null,
  fetchBrandDataPromise: null,
  fetchMachineDataPromise: null,
  fetchMachineBrandDataPromise: null,
  fetchMachineLightDataPromise: null,
  fetchMachinePlantAreaDataPromise: null,
  fetchPlantAreaDataPromise: null,
  fetchAppFuncBindingBrandMachineMapPromise: null,
  syncAppListPromise: null,
  showdemoConfig: null,
  fetchDemoConfig() {
    return new Promise((res) =>
      allAjaxFn.ajax(
        {
          url: 'api/custparam/showdemoconfig',
          type: 'GET',
          contentType: 'json/application',
        },
        {
          success(showdemoConfig) {
            res(showdemoConfig)
          },
        }
      )
    )
  },
  initDemoConfig() {
    this.fetchDemoConfigPromise = this.fetchDemoConfig().then(
      (data) => (this.showdemoConfig = data)
    )
  },
  initPlatformData() {
    this.fetchBoxInfoPromise = machineFnMap.initBoxInfo()
    this.fetchBrandDataPromise = machineFnMap.initBrandData()
    this.fetchMachineDataPromise = machineFnMap.loadMachineIds()
    this.fetchMachineBrandDataPromise = machineFnMap.initMachineBrandData()
    this.fetchMachineLightDataPromise = machineFnMap.initMachineLightData()
    this.fetchMachinePlantAreaDataPromise = machineFnMap.initMachinePlantAreaData()
    this.fetchPlantAreaDataPromise = machineFnMap.initPlantAreaData()
    this.fetchAppFuncBindingBrandMachineMapPromise = machineFnMap.initAppFuncBindingBrandMachineMap()
  },
  configUseShiftdata() {
    const defaultValue = true
    return servtechConfig.ST_MONITOR_USE_SHIFT_DATA === undefined
      ? defaultValue
      : servtechConfig.ST_MONITOR_USE_SHIFT_DATA
  },
  configUseMultiDownloadProg() {
    const defaultValue = true
    return servtechConfig.ST_USE_MULTI_DOWNLOAD_PROG === undefined
      ? defaultValue
      : servtechConfig.ST_USE_MULTI_DOWNLOAD_PROG
  },
  configUseDeviceStatus() {
    const defaultValue = true
    return servtechConfig.ST_MONITOR_USE_DEVICE_STATUS_DATA === undefined
      ? defaultValue
      : servtechConfig.ST_MONITOR_USE_DEVICE_STATUS_DATA
  },
  configUseProgramUploadUseGSMuncp() {
    const defaultValue = true
    return servtechConfig.ST_PROGRAM_UPLOAD_USE_G_S_MUNCP === undefined
      ? defaultValue
      : servtechConfig.ST_PROGRAM_UPLOAD_USE_G_S_MUNCP
  },
  configUseRegForDigiTrackWorkOp() {
    const defaultValue = true
    return servtechConfig.ST_WORKOP_REG_O_999 === undefined
      ? defaultValue
      : servtechConfig.ST_WORKOP_REG_O_999
  },
  configCalForServTrackWorkOp() {
    const defaultValue = true
    return servtechConfig.ST_TRACK_QUALITY_USE_Multiply === undefined
      ? defaultValue
      : servtechConfig.ST_TRACK_QUALITY_USE_Multiply
  },
  configModeOfAxisSpeedAndFeedRate() {
    const defaultValue = 22
    return servtechConfig.ST_SHOW_AXISSPEED_FEEDRATE_MODE === undefined
      ? defaultValue
      : servtechConfig.ST_SHOW_AXISSPEED_FEEDRATE_MODE
  },
  /**
   * 清除機台狀態資訊
   * @memberof module:servkit
   * @param {Object} machineMap
   */
  cleanDeviceStatusMap(machineMap) {
    const keys = _.keys(machineMap)
    for (let i = 0; i < keys.length; ++i) {
      const signals = _.keys(machineMap[keys[i]])
      for (let j = 0; j < signals.length; ++j) {
        machineMap[keys[i]][signals[j]] = null
      }
      machineMap[keys[i]] = null
    }
  },
  /**
   * protobuf轉成machine map
   * @memberof mosule:servkit
   * @param {JSON} data 機台資訊
   * @param {Object} machinesMap 機台物件
   */
  convertDeviceStatusPb2Map(data, machinesMap) {
    // let machinesMap = {};//機台map，用來存全部的機台
    // console.log("--------------------");
    // console.log(data);
    // console.log("--------------------");
    _.each(data, function (boxStr) {
      let box
      try {
        box = JSON.parse(boxStr)
      } catch (e) {
        console.warn('boxStr: ', e, ', msg: ', boxStr)
        return
      }
      const boxId = box.from
      const stringValues = box.result.stringValues // 取値
      _.each(stringValues, function (ele) {
        const gCode = ele.signal.id // 取得gCode
        const systems = ele.values // 多系統陣列
        _.each(systems, function (system) {
          let matrix
          try {
            matrix = JSON.parse(system.array) // 單個系統的值(是matrix:[[machine,value]])
          } catch (e1) {
            console.warn(
              'system.array: ',
              e1,
              ', gCode: ',
              gCode,
              ', msg: ',
              system.array
            )
            return
          }
          _.each(matrix, function (machineValue) {
            if (!machinesMap[machineValue[0]]) {
              // 沒機台就建
              machinesMap[machineValue[0]] = {}
            }
            if (!machinesMap[machineValue[0]][gCode]) {
              // 機台沒gCode就建
              machinesMap[machineValue[0]][gCode] = []
            }
            machinesMap[machineValue[0]]['info'] = {
              boxId: boxId,
              date: new Date(),
            }
            machinesMap[machineValue[0]][gCode].push(machineValue[1]) // 將數值放入陣列中
          })
        })
      })
    })
    // return machinesMap;
  },
  initFuncBindMachineSelect($machineSelect, appId, funcId, defaultSelectAll) {
    const machineSelectHtml = $machineSelect.attr('multiple')
      ? ['<option>ALL</option>']
      : []
    let machineObjAry = []
    machineFnMap.eachMachine(function (id, name) {
      machineObjAry.push({
        key: id,
        name: name,
      })
    })
    if (appId && funcId) {
      const assignMachines = _.where(
        machineFnMap.getAppFuncBindingBrandMachineMap(),
        {
          app_id: appId,
          func_id: funcId,
        }
      )
      if (assignMachines.length > 0) {
        machineObjAry = []
        _.each(assignMachines, function (num) {
          machineObjAry.push({
            key: num['device_id'],
            name: num['device_name'],
          })
        })
      }
    }
    _.each(machineObjAry.sort(util.naturalCompareValue), function (elem) {
      machineSelectHtml.push(
        '<option style="padding:3px 0 3px 3px;" value="' +
          elem.key +
          '">' +
          elem.name +
          '</option>'
      )
    })
    form.renderSelect($machineSelect, machineSelectHtml, defaultSelectAll)
  },
  // 過濾出清單中有綁定頁面廠牌機台的部分，沒有綁定則回傳原清單，有綁定可能回傳空物件(沒交集)
  filterFuncBindMachine(plantAreaMachineMap, appId, funcId) {
    if (!appId || !funcId) {
      return plantAreaMachineMap
    }
    const appFuncBindingMachineListMap = machineFnMap.getAppFuncBindingBrandMachineMap()
    const currAppFuncBindingMachineList = appFuncBindingMachineListMap.reduce(
      (acc, { device_id, app_id, func_id }) => {
        if (app_id === appId && func_id === funcId) {
          acc.push(device_id)
        }
        return acc
      },
      []
    )
    if (currAppFuncBindingMachineList.length) {
      return _.pick(plantAreaMachineMap, currAppFuncBindingMachineList)
    } else {
      return plantAreaMachineMap
    }
  },
  // 取得有綁定APP功能廠牌的機台清單
  getFuncBindMachineList(appId, funcId) {
    if (appId && funcId) {
      const appFuncBindingBrandMachineMap = _.where(
        machineFnMap.getAppFuncBindingBrandMachineMap(),
        {
          app_id: appId,
          func_id: funcId,
        }
      )
      if (appFuncBindingBrandMachineMap.length) {
        return _.pluck(appFuncBindingBrandMachineMap, 'device_id')
      } else {
        return machineFnMap.getMachineList()
      }
    } else {
      return machineFnMap.getMachineList()
    }
  },
  politeCheck,
  crudtable,
  subscribe,
  unsubscribe,
  subscribeInfo,
  /**
   * 為排程命名
   * @memberof module:servkit
   * @param  {String} name - 排程名稱
   * @returns {Schedule}
   */
  schedule(name, isRunImmediately) {
    if (_.isString(name) && name.length) {
      return new Schedule(name, isRunImmediately)
    } else {
      throw new Error('不給我名字還想建排程!!')
    }
  },
  /**
   * 建置網路攝影畫面
   * @memberof module:servkit
   * @returns {IpCamDrawer}
   */
  ipCamDrawer() {
    return new IpCamDrawer()
  },
  ...allAjaxFn,
  ...machineFnMap,
  ...form,
  ...util,
  ...appFunc,
  ...monitor,
  ...variables,
}

servkit.initDemoConfig()
servkit.initPlatformData()

export default servkit
