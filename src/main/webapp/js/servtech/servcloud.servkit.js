/**
 * @module servkit
 */
;(function (global, $, _) {
  global.servkit = global.servkit || {}
  var doc = global.document
  var scripts = doc.scripts
  /**
   * 確認檔案已是否存在
   * @memberof module:servkit
   * @param {String} source 檔案的位址url
   * @returns {Boolean} 若已存在回傳true若沒有則傳false
   */
  var scriptExistInPage = function (source) {
    var i
    var src
    var scriptsLength = scripts.length

    for (i = 0; i < scriptsLength; i++) {
      src = scripts[i].src
      if (src && src === source) {
        return true
      }
    }
    return false
  }

  // for pdf export
  // fix blue colore from #2381C4 to #2361FF
  servkit.colors = {
    red: '#D62728',
    purple: '#9467BD',
    blue: '#2361FF',
    green: '#2FA12F',
    orange: '#FF7F0E',
  }

  servkit.statusColors = {
    online: '#2e8b57',
    idle: '#ffa500',
    alarm: '#a90329',
    offline: '#d3d3d3',
  }

  servkit.rootPath = (function () {
    var strFullPath = doc.location.href
    var strPath = doc.location.pathname
    var pos = strFullPath.indexOf(strPath)
    var prePath = strFullPath.substring(0, pos)
    var postPath = strPath.substring(0, strPath.substr(1).indexOf('/') + 1)
    return prePath + postPath
  })()

  var politeCheckCount = 0
  var boxMap
  var machinesMap
  var machineLightsMap
  var machineBrandMap
  var brandMap
  var machinePlantAreaMap
  var plantAreaMachineMap
  var plantAreaMap
  var boxGot = false
  var machinesGot = false
  var machineLightsGot = false
  var machineBrandGot = false
  var brandGot = false
  var machinePlantAreaGot = false
  var plantAreaGot = false
  var appFuncBindingBrandMachineGot = false
  var appFuncBindingBrandMachineMap
  /**
   * 更新BOX
   * @memberof module:servkit
   * @param {Array} boxes BOX的物件資訊
   */
  var refreshBox = function (boxes) {
    if (boxes.length) {
      boxMap = {}
      _.each(boxes, function (box) {
        boxMap[box.box_id] = box.devices || []
      })
    } else {
      console.warn('無BOX，請確認...')
    }
    boxGot = true
  }
  /**
   * 更新機台名稱
   * @memberof module:servkit
   * @param {Array} machines 機台的物件資訊(含demo_status, device_id, device_name, is_real_data)
   */
  var refreshMachineName = function (machines) {
    if (
      machines.length &&
      machines[0]['device_id'] &&
      machines[0]['device_name']
    ) {
      machinesMap = {}
      _.each(machines, function (machine) {
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
    machinesGot = true
  }
  /**
   * 更新機台燈號<br>
   * 燈號代碼：<br>
   * - 0：離線<br>
   * - 11：工作中<br>
   * - 12：閒置中<br>
   * - 13：換線中<br>
   * @memberof module:servkit
   * @param {Array} lights 燈號狀態(含color, light_id, light_name)
   */
  var refreshMachineLight = function (lights) {
    if (lights.length && lights[0]['light_id'] && lights[0]['light_name']) {
      machineLightsMap = _.indexBy(lights, 'light_id')
    } else {
      console.warn('無機台燈號，請確認...')
    }
    machineLightsGot = true
  }
  /**
   * 更新機台廠牌
   * @memberof module:servkit
   * @param {Array} machines 機台資訊(含cnc_id, device_id)
   */
  var refreshMachineBrand = function (machines) {
    if (machines.length && machines[0]['device_id'] && machines[0]['cnc_id']) {
      machineBrandMap = {}
      _.each(machines, function (machine) {
        machineBrandMap[machine['device_id']] = machine
      })
    } else {
      console.warn('無廠牌，請確認...')
    }
    machineBrandGot = true
  }
  /**
   * 更新廠牌名稱
   * @memberof module:servkit
   * @param {Array} brands 機台資訊(cnc_id, name)
   */
  var refreshBrand = function (brands) {
    if (brands.length && brands[0]['cnc_id'] && brands[0]['name']) {
      brandMap = {}
      _.each(brands, function (brand) {
        brandMap[brand['cnc_id']] = brand
      })
    } else {
      console.warn('無廠牌，請確認...')
    }
    brandGot = true
  }
  /**
   * 更新機台廠區
   * @memberof module:servkit
   * @param {Array} machines 機台資訊(含plant_id, device_id)
   */
  var refreshMachinePlantArea = function (machines) {
    if (
      machines.length &&
      machines[0]['device_id'] &&
      machines[0]['plant_id']
    ) {
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
    machinePlantAreaGot = true
  }

  /**
   * 更新廠區
   * @memberof module:servkit
   * @param {Array} plants 機台資訊(含plant_id, plant_name)
   */
  var refreshPlantArea = function (plants) {
    if (plants.length && plants[0]['plant_id']) {
      plantAreaMap = {}
      _.each(plants, function (plant) {
        plantAreaMap[plant['plant_id']] = plant
      })
    } else {
      console.warn('無廠區，請確認...')
    }
    plantAreaGot = true
  }

  servkit.fonts = '"Microsoft JhengHei", Helvetica, Arial, sans-serif'
  ;(function () {
    $.ajax({
      url: servkit.rootPath + '/api/box/read',
      type: 'GET',
    }).done(function (data) {
      if (data.type === 0) {
        refreshBox(data.data)
      }
    })
  })()

  /**
   * 以物件方式存取Box
   * @memberof module:servkit
   * @returns {Array} memo nox物件(含id、綁定的機台)
   */
  servkit.getBoxMap = function () {
    if (boxMap) {
      return boxMap
    }
  }

  /**
   * 可取得boxIds
   * @memberof module:servkit
   * @returns {Array}
   */
  servkit.getBoxList = function () {
    if (boxMap) {
      return _.keys(boxMap)
    }
  }

  servkit.getBoxByMachine = function (machineId) {
    var boxId
    _.each(boxMap, (val, key) => {
      var findDevice = _.find(val, (value) => {
        return value.device_id === machineId
      })
      if (findDevice !== undefined) {
        boxId = key
      }
    })
    return boxId
  }
  ;(function () {
    // 取得燈號，存至 machineLightsMap
    $.ajax({
      url: servkit.rootPath + '/api/getdata/db',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        table: 'm_device_light',
        columns: ['light_id', 'light_name', 'color'],
      }),
    }).done(function (data) {
      if (data.type === 0) {
        refreshMachineLight(data.data)
      }
    })
  })()
  ;(function () {
    // 取得機台廠區，存至 machinePlantAreaMap
    $.ajax({
      url: servkit.rootPath + '/api/getdata/db',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        table: 'm_plant_area',
        columns: ['device_id', 'plant_id'],
      }),
    }).done(function (data) {
      refreshMachinePlantArea(data.data)
    })
  })()
  ;(function () {
    // 取得廠區，存至 plantAreaMap
    $.ajax({
      url: servkit.rootPath + '/api/getdata/db',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        table: 'm_plant',
        columns: ['plant_id', 'plant_name'],
      }),
    }).done(function (data) {
      refreshPlantArea(data.data)
    })
  })()

  /**
   * 以物件方式存取燈號名稱和顏色，索引值則為燈號ID
   * @memberof module:servkit
   * @returns {Array} memo 燈號物件(含名稱、顏色)
   */
  servkit.getMachineLightMap = function () {
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
  servkit.eachMachineLight = function (cb) {
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
  servkit.getMachineLightName = function (status) {
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
  servkit.getMachineLightColor = function (status) {
    if (machineLightsMap && machineLightsMap[status]) {
      return machineLightsMap[status].color
    }
    return status
  }

  /**
   * 是否取得機器燈號資訊
   * @memberof module:servkit
   * @returns {Boolean} machineLightGot
   */
  servkit.machineLightsGot = function () {
    return machineLightsGot
  }

  /**
   * 取得機台 id 名稱，存至 machinesMap
   * @memberof module:servkit   *
   * @param {Function} cb 取得機台資訊後的call back
   */
  servkit.loadMachineIds = function (cb) {
    $.ajax({
      url: servkit.rootPath + '/api/getdata/db',
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
    }).done(function (data) {
      if (data.type === 0) {
        refreshMachineName(data.data)
        if (cb) {
          cb(servkit.getMachineList())
        }
      }
    })
  }
  servkit.loadMachineIds()

  /**
   * 以物件方式存取機台名稱、是否為真實資料、demo狀態、機種，索引值則為機台ID
   * @memberof module:servkit
   * @returns {Array} memo 機台物件(含名稱、是否為真實資料、demo狀態、機種)
   */
  servkit.getMachineMap = function (appId, funcId) {
    var machinesData = machinesMap
    if (appId && funcId) {
      var blindingMachines = appFuncBindingBrandMachineMap
      var assignMachines = _.where(blindingMachines, {
        app_id: appId,
        func_id: funcId,
      })
      if (assignMachines.length > 0) {
        var newMachinesMap = {}
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
  servkit.getMachineList = function () {
    if (machinesMap) {
      return _.keys(machinesMap)
    }
    return []
  }

  /**
   * 以機台ID，取得機台名稱
   * @memberof module:servkit
   * @param {String} id 機台的代號
   * @returns {String} machinesMap[id]['device_name'] || id 機台的名稱，若沒有名稱則回傳ID
   */
  servkit.getMachineName = function (id) {
    if (machinesMap && machinesMap[id]) {
      return machinesMap[id]['device_name'] || id
    }
    return id
  }

  /**
   * 以機台IDs，取得用逗號隔開的機台名稱字串
   * @memberof module:servkit
   * @param {Array} ids 機台的代號
   * @returns {String} machinesMap[id]['device_name'] || id 機台的名稱，若沒有名稱則回傳ID，字串用逗號隔開
   */
  servkit.getMachineNameStringSplitByComma = function (ids) {
    const arr = []
    _.each(ids, function (value) {
      if (value == 'ALL') return
      if (machinesMap && machinesMap[value]) {
        arr.push(machinesMap[value]['device_name'])
      } else {
        arr.push(value)
      }
    })

    return arr.join(',')
  }

  /**
   * 可取得機台資訊
   * @memberof module:servkit
   * @param {Function} cb callback
   */
  servkit.eachMachine = function (cb) {
    _.each(_.keys(machinesMap).sort(), function (machineId) {
      cb(
        machineId,
        machinesMap[machineId]['device_name'],
        machinesMap[machineId]
      )
    })
  }

  /**
   * 取得指定條件的機台資訊
   * @memberof module:servkit
   * @param {Function} cb callback
   * @returns {Object} 機台資訊
   */
  servkit.filterMachine = function (cb) {
    return _.pick(machinesMap, cb)
  }

  /**
   * 是否取得機台資訊
   * @memberof module:servkit
   * @returns {Boolean} machinesGot
   */
  servkit.machinesGot = function () {
    return machinesGot
  }
  ;(function () {
    $.ajax({
      url: servkit.rootPath + '/api/getdata/db',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        table: 'm_device_cnc_brand',
        columns: ['device_id', 'cnc_id'],
      }),
    }).done(function (data) {
      if (data.type === 0) {
        refreshMachineBrand(data.data)
      }
    })
  })()

  /**
   * 以物件方式存取廠牌ID，索引值則為機台ID
   * @memberof module:servkit
   * @returns {Array} memo 機台廠牌物件(含廠牌ID)
   */
  servkit.getMachineBrandMap = function () {
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
  servkit.getMachineBrand = function (id) {
    if (machineBrandMap && machineBrandMap[id]) {
      return machineBrandMap[id]['cnc_id'] || ''
    }
    return ''
  }

  /**
   * 是否取得機台廠牌資訊
   * @memberof module:servkit
   * @returns {Boolean} machineBrandGot
   */
  servkit.machineBrandGot = function () {
    return machineBrandGot
  }
  ;(function () {
    $.ajax({
      url: servkit.rootPath + '/api/getdata/db',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        table: 'm_cnc_brand',
        columns: ['cnc_id', 'name'],
      }),
    }).done(function (data) {
      if (data.type === 0) {
        refreshBrand(data.data)
      }
    })
  })()

  /**
   * 以廠牌ID，取得廠牌名稱
   * @memberof module:servkit
   * @param {String} id 廠牌的代號
   * @returns {String} brandMap[id]|| id 廠牌的名稱，若沒有名稱則回傳ID
   */
  servkit.getBrandName = function (id) {
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
  servkit.getBrandMap = function () {
    return brandMap
  }

  /**
   * 以機台ID，取得機台廠區ID
   * @memberof module:servkit
   * @param {String} id 機台的代號
   * @returns {String} machinePlantAreaMap[id]['plant_id'] || '' 機台廠區ID，若沒有名稱則回傳空值
   */
  servkit.getPlantAreaByMachine = function (id) {
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
  servkit.getPlantAreaMachineMap = function () {
    return plantAreaMachineMap || null
  }

  /**
   * 以物件方式存取廠區ID，索引值則為機台ID
   * @memberof module:servkit
   * @returns {Array} memo 機台廠區物件(含廠區ID)
   */
  servkit.getMachinePlantAreaMap = function () {
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
   * 是否取得機台廠區資訊
   * @memberof module:servkit
   * @returns {Boolean} machinePlantAreaGot
   */
  servkit.machinePlantAreaGot = function () {
    return machinePlantAreaGot
  }

  /**
   * 以物件方式存取廠區
   * @memberof module:servkit
   * @returns {Array} plantAreaMap物件(含id、name)
   */
  servkit.getPlantAreaMap = function () {
    return plantAreaMap
  }

  /**
   * 以廠區ID，取得廠區名稱
   * @memberof module:servkit
   * @param {String} id 廠區的代號
   * @returns {String} plantAreaMap物件[id]|| id 廠牌的名稱，若沒有名稱則回傳ID
   */
  servkit.getPlantAreaName = function (id) {
    if (plantAreaMap && plantAreaMap[id]) {
      return plantAreaMap[id]['plant_name'] || id
    }
    return id
  }

  /**
   * 是否取得廠區資訊
   * @memberof module:servkit
   * @returns {Boolean} plantAreaGot
   */
  servkit.plantAreaGot = function () {
    return plantAreaGot
  }

  // 取得後端的 JavaScript

  /**
   * 載入一維陣列內的JS檔案
   * @memberof module:servkit
   * @param {Array} dependentSources 要載入的JS路徑
   * @param {Function} onloadCallback 載入完成後執行的函式
   */
  servkit.requireJs = function (dependentSources, onloadCallback) {
    if (dependentSources.length) {
      var domScript
      var source = this.rootPath + dependentSources.shift()
      if (scriptExistInPage(source)) {
        if (debugState) console.info('已存在 - ' + source)
        servkit.requireJs(dependentSources, onloadCallback)
      } else {
        domScript = doc.createElement('script')
        domScript.src = source
        domScript.onloadDone = false
        domScript.onload = function () {
          domScript.onloadDone = true
          servkit.requireJs(dependentSources, onloadCallback)
        }
        domScript.onreadystatechange = function () {
          if (domScript.readyState === 'loaded' && !domScript.onloadDone) {
            domScript.onloadDone = true
            servkit.requireJs(dependentSources, onloadCallback)
          }
        }
        doc.getElementsByTagName('head')[0].appendChild(domScript)
      }
    } else {
      if (onloadCallback) {
        return onloadCallback()
      }
    }
  }

  /**
   * 載入二維陣列內的JS檔案
   * @memberof module:servkit
   * @param {Array} independentSourceGroup 要載入的JS路徑
   * @param {Function} allJsOnloadCallback 載入完成後執行的函式
   */
  servkit.requireJsAsync = function (
    independentSourceGroup,
    allJsOnloadCallback
  ) {
    var i = 0
    var total = independentSourceGroup.length
    var countDown = total
    for (; i < total; i++) {
      this.requireJs(independentSourceGroup[i], function () {
        if (--countDown === 0 && allJsOnloadCallback) {
          allJsOnloadCallback()
        }
      })
    }
  }

  /**
   * 抓取資料的狀態代碼與相對應的行為
   * @memberof module:servkit
   * @param {any} resp 資料
   * @param {Function} cb callback
   * @param {String} textStatus 資料抓取的狀態
   * @param {XMLHttpRequest} jqXHR XMLHttpRequest
   * @param {Object} ajaxConfig (含contentType, type, url, ...)
   */
  servkit.responseRule = function (resp, cb, textStatus, jqXHR, ajaxConfig) {
    if (jqXHR) {
      var contentType = jqXHR.getResponseHeader('Content-Type')
      if (contentType && contentType.startsWith('application/json')) {
        if (typeof resp === 'string') {
          resp = JSON.parse(resp)
        }
      }

      // 不是被 servkit.ajax 調用，而是某人直接把 resp 傳進來
    } else {
      try {
        resp = JSON.parse(resp)
      } catch (e) {
        // 錯誤的 json 格式，可能意味著本來就不用 json，所以不處理
      }
    }

    // 僅當作純文字檔案處理
    if (cb.plainText && !resp.type) {
      cb.plainText(resp)
      return
    }

    ajaxConfig = ajaxConfig || {
      url: '---',
    }
    switch (resp.type) {
      case 0: // success!!
        typeof cb === 'function'
          ? cb(resp.data, textStatus, jqXHR)
          : cb.success(resp.data, textStatus, jqXHR)
        break
      case 1: // fail...
        cb.fail
          ? cb.fail(resp.data, textStatus, jqXHR)
          : console.warn('請求(' + ajaxConfig.url + ')錯誤未處理: ' + resp.data)
        break
      case 2: // you need to login first!!
        console.log(window.location.search)
        window.location.href =
          servkit.rootPath + '/login.html' + window.location.search
        break
      case 3: // license expired!!
        window.location.href =
          servkit.rootPath + '/index.html#licenseexpired.html'
        break
      case 4: // you need to validate first!!
        window.location.href = servkit.rootPath + '/validate.html'
        break
      case 999: // exception, please backend check if bugs exist??
        cb.exception
          ? cb.exception(resp.data, textStatus, jqXHR)
          : console.warn('後端(' + ajaxConfig.url + ')發生錯誤: ' + resp.data)
        break
      default:
        console.warn(
          '後端(' + ajaxConfig.url + ')回傳值沒有按照規則走，請確認...',
          resp
        )
        break
    }
  }

  /**
   * 透過AJAX抓取資料
   * @memberof module:servkit
   * @param {Object} ajaxConfig (含contentType, type, url, ...)
   * @param {Function} cb callback
   */
  servkit.ajax = function (ajaxConfig, cb) {
    return $.ajax(ajaxConfig)
      .done(function (resp, textStatus, jqXHR) {
        servkit.responseRule(resp, cb, textStatus, jqXHR, ajaxConfig)
      })
      .fail(function (jqXHR, textStatus, err) {
        cb.error && cb.error(jqXHR, textStatus, err)
      })
      .always(function (resOrJqXHR, textStatus, jqXHROrErr) {
        cb.always && cb.always(resOrJqXHR, textStatus, jqXHROrErr)
      })
  }

  /**
   * 透過AJAX抓取多筆資料
   * @memberof module:servkit
   * @param {Objects} ajaxConfigObjs (含contentType, type, url, ...)
   * @param {Function} cb callback
   */
  servkit.multiAjax = function (ajaxConfigObjs, cb) {
    var resultObj = _.mapObject(ajaxConfigObjs, function () {
      return undefined
    })

    _.each(
      ajaxConfigObjs,
      _.bind(function (ajaxConfig, key) {
        this.ajax(ajaxConfig, {
          success: function (data) {
            resultObj[key] = data
          },
          always: function () {
            resultObj[key] = resultObj[key] || {}
          },
        })
      }, this)
    )

    this.politeCheck()
      .until(function () {
        return _.chain(resultObj).values().every().value()
      })
      .thenDo(function () {
        cb(resultObj)
      })
      .tryDuration(0)
      .start()
  }

  /**
   * 資料形態轉換<br>
   * - float：轉成小數<br>
   * - percentage：轉成百分比<br>
   * - timeObj：轉成時間物件<br>
   * - suffix：轉成浮點數<br>
   * - floatMinutesToMS：將_._M改成_M_S<br>
   * - LAST_IDLE：將'LAST_IDLE'改成'***'<br>
   * - time：轉成y/m/d h:m:s<br>
   * - hourMin：轉成_H_M<br>
   * @memberof module:servkit
   * @param {String} dataFormat 轉換的資料形態
   * @param {any} data 要轉換的資料
   * @returns {any} data 轉換結果
   */
  servkit.switchDataFormat = function (dataFormat, data) {
    if (dataFormat) {
      try {
        var second
        var minute
        var hour
        switch (dataFormat.type) {
          // 小數點數字
          case 'float':
            data = parseFloat(data).toFixed(dataFormat.digit)
            break
          // 百分比
          case 'percentage':
            data = parseFloat(data * 100).toFixed(dataFormat.digit) + '%'
            break
          case 'timeObj':
            data = new Date(data.getTime()).format(dataFormat.format)
            break
          case 'suffix':
            data =
              parseFloat(data).toFixed(dataFormat.digit) + dataFormat.suffix
            break
          case 'floatMinutesToMS':
            if (parseFloat(data) === 0 || parseFloat(data)) {
              minute = Math.floor(data)
              second = Math.floor((data - minute) * 60)
              data =
                (minute < 10 ? '0' : '') +
                minute +
                'M ' +
                (second < 10 ? '0' : '') +
                second +
                'S'
            }
            break
          case 'LAST_IDLE':
            if (data.startsWith('LAST_IDLE')) {
              data = '***'
            }
            break
          case 'time':
            if (data.length === 20 || data.length === 17) {
              var Year = data.substring(0, 4)
              var Month = data.substring(4, 6)
              var Day = data.substring(6, 8)
              var Hour = data.substring(8, 10)
              var Minutes = data.substring(10, 12)
              var Seconds = data.substring(12, 14)
              data =
                Year +
                '/' +
                Month +
                '/' +
                Day +
                ' ' +
                Hour +
                ':' +
                Minutes +
                ':' +
                Seconds
            }
            break
          case 'hourMin':
            second = Math.floor(data / 1000)
            minute = Math.floor(second / 60)
            hour = Math.floor(minute / 60)
            // var day = Math.floor(hour / 24)

            hour = hour < 10 ? '0' + hour : hour
            minute = minute % 60 < 10 ? '0' + (minute % 60) : minute % 60
            data = hour + ' H ' + minute + ' M'
            break
          default:
            console.warn('undefined type:' + dataFormat.type)
        }
      } catch (e) {
        console.warn('exception = ' + e)
      }
    }
    return data
  }
  /**
   *
   */
  //formate to string YYYY/MM/DD HH:mm:ss
  servkit.dateFormateString = function dateFormateString(dateString) {
    if (dateString == undefined || dateString == null || dateString == '')
      return ''
    console.warn(dateString)
    const check_OODate = function (date) {
      if (date.toString().length < 2) {
        return '0' + date.toString()
      }
      return date
    }
    const date = new Date(dateString)
    return (
      date.getFullYear() +
      '/' +
      check_OODate(parseInt(date.getMonth()) + 1) +
      '/' +
      check_OODate(parseInt(date.getDate())) +
      ' ' +
      check_OODate(parseInt(date.getHours())) +
      ':' +
      check_OODate(parseInt(date.getMinutes())) +
      ':' +
      check_OODate(parseInt(date.getSeconds()))
    )
  }

  /**
   * 在多選的下拉式選單中全選的行為
   * @memberof module:servkit
   * @param {any} e 使用者資訊
   */
  servkit.multiselectSettingSelectAll = function ($select, defaultSelectAll) {
    const isSet = !!Array.from($select[0].options).find(
      (el) => el.textContent === 'ALL' && el.value === 'ALL'
    )
    if (isSet) {
      return
    }
    $select.prepend('<option>ALL</option>')
    servkit.multiselectHeightOptimization($select[0])
    $select
      .off('mousedown')
      .on('mousedown', servkit.multiselectWithoutCtrlMouseDown)
      .off('mousemove')
      .on('mousemove', servkit.multiselectWithoutCtrlMouseMove)

    // for mobile and tablet. Seems like the option is not what we saw on desktop browser, more like
    // chorme app render extra view over the multi-select options.
    var lastSelectAll = $select.find('option:first').prop('selected')
    $select.off('change').on('change', function (e) {
      var isSelectAll = $select.find('option:first').prop('selected')
      if (isSelectAll !== lastSelectAll) {
        $select.find('option').prop('selected', isSelectAll)
      }
      lastSelectAll = isSelectAll
    })

    $select
      .find('option:first')
      .off('click')
      .on('click', function (e) {
        var selectScrollTop = e.target.parentNode.scrollTop
        $select.find('option').prop('selected', this.selected)

        // 調整 scrollTop 的動作必須要延遲到所有 mousedown 事件都做完後
        setTimeout(function () {
          e.target.parentNode.scrollTop = selectScrollTop
        }, 0)
      })

    if (defaultSelectAll) {
      $select.find('option').prop('selected', 'selected')
    }
  }

  /**
   * 在多選的下拉式選單中執行即使不按Ctrl也可多選<br>
   * 按下Shift可連續多選
   * @memberof module:servkit
   * @param {any} e 使用者資訊
   */
  servkit.multiselectWithoutCtrlMouseDown = function (e) {
    var target = e.target
    var selectScrollTop
    var selected
    if (target instanceof window.HTMLOptionElement) {
      e.preventDefault()
      selectScrollTop = target.parentNode.scrollTop

      target.selected = !target.selected
      if (e.shiftKey) {
        // 壓住 shift 要往上「全選」或「反全選」
        selected = target.selected
        target = target.previousElementSibling
        while (
          target instanceof window.HTMLOptionElement &&
          target.selected === !selected
        ) {
          target.selected = !target.selected
          target = target.previousElementSibling
        }
      }

      // 調整 scrollTop 的動作必須要延遲到所有 mousedown 事件都做完後
      setTimeout(function () {
        e.target.parentNode.scrollTop = selectScrollTop
      }, 0)

      $(this).focus()
      $(target).closest('select').change() // 加了preventDefault會讓值沒有改變因此要自己觸發change事件
    }
  }

  /**
   * 取消按著左鍵於下拉式選單內拖拉可連續多選的效果
   * @memberof module:servkit
   * @param {any} e 使用者資訊
   */
  servkit.multiselectWithoutCtrlMouseMove = function (e) {
    if (e.target instanceof window.HTMLOptionElement) {
      e.preventDefault()
    }
  }

  /**
   * 預設下拉式選單的高度
   * @memberof module:servkit
   * @param {any} selectElement
   */
  servkit.multiselectHeightOptimization = function (selectElement) {
    var optionHeight = $(selectElement).find(':first-child').height() || 22
    if (selectElement.hasAttribute('multiple')) {
      if (selectElement.options.length > 10) {
        selectElement.style.height = optionHeight * 10 + 15 + 'px'
      } else {
        selectElement.style.height =
          selectElement.options.length * optionHeight + 15 + 'px'
      }
    }
  }

  /**
   * 將預計執行的函式存入tag，若為空值則存入'default'字樣加上呼叫的次數
   * @constructor
   * @memberof module:servkit
   * @this {PoliteCheck}
   * @param {String} tag 識別PoliteCheck的名字
   */
  function PoliteCheck(tag) {
    this.tag = tag || 'default' + ++politeCheckCount
  }

  /**
   * 建置一預計執行的函式
   * @memberof module:servkit
   * @param {Function} tag 將執行的函式
   * @returns {PoliteCheck} PoliteCheck(tag) 創建的函式
   */
  servkit.politeCheck = function (tag) {
    return new PoliteCheck(tag)
  }

  /**
   * 持續偵測直到 until 為 true 才做某件事
   * @this {PoliteCheck}
   * @param {Function} cb callback
   * @returns {PoliteCheck} this
   */
  PoliteCheck.prototype.until = function (cb) {
    if (typeof cb !== 'function')
      throw new Error('until method need callback function!')
    this.checkDo = cb
    return this
  }
  /**
   * 預計要執行的函式
   * @this {PoliteCheck}
   * @param {Function} cb callback
   * @returns {PoliteCheck} this
   */
  PoliteCheck.prototype.thenDo = function (cb) {
    if (typeof cb !== 'function')
      throw new Error('thenDo method need callback function!')
    this.thenDo = cb
    return this
  }

  /**
   * 可執行次數
   * @this {PoliteCheck}
   * @param {Number} count 預設的執行次數
   * @returns {PoliteCheck} this
   */
  PoliteCheck.prototype.maxTry = function (count) {
    if (typeof count !== 'number') throw new Error('maxTry method need number!')
    this.tryCount = count
    return this
  }

  /**
   * 預計多久後執行
   * @this {PoliteCheck}
   * @param {Number} ms 所設定的時間
   * @returns {PoliteCheck} this
   */
  PoliteCheck.prototype.tryDuration = function (ms) {
    if (typeof ms !== 'number')
      throw new Error('tryDuration method need number!')
    this.timeoutMs = ms
    return this
  }

  /**
   * 當checkDo()回傳true後，執行thenDo()；否則於timeoutMs後再執行一次setTimeout
   * @this {PoliteCheck}
   */
  PoliteCheck.prototype.start = function () {
    var that = this
    var timeoutMs = this.timeoutMs || 0
    setTimeout(function exec() {
      if (that.tryCount === 0) {
        if (debugState) console.info(that.tag + ' do not check anymore!!')
        return
      }
      if (debugState)
        console.info(
          that.tag +
            ' polite check' +
            (that.tryCount ? ' countdown ' + that.tryCount : '')
        )
      if (that.checkDo()) {
        if (debugState) console.info(that.tag + ' done!')
        that.thenDo()
      } else {
        if (that.tryCount) that.tryCount--
        setTimeout(exec, timeoutMs)
      }
    }, 0)
  }

  /**
   * 紀錄按鈕原始資訊
   * @constructor
   * @memberof module:servkit
   * @this {LoadingButton}
   * @param {DOM} btnElement 按鈕物件
   */
  function LoadingButton(btnElement) {
    this.btn = btnElement
    this.btnContent = btnElement.innerHTML
    $(btnElement).data('loadingButton', this)
  }

  /**
   * 繪製旋轉中的螺絲圖示，並取消按鈕功能
   * @this {LoadingButton}
   */
  LoadingButton.prototype.doing = function () {
    this.btn.innerHTML = '<i class="fa fa-gear fa-2x fa-spin fa-lg"></i>'
    this.btn.setAttribute('disabled', 'disabled')
  }
  /**
   * 在0.5秒後將按鈕資訊還原，並重新開起按鈕功能
   * @this {LoadingButton}
   */
  LoadingButton.prototype.done = function () {
    setTimeout(
      _.bind(function () {
        this.btn.innerHTML = this.btnContent
        this.btn.removeAttribute('disabled')
      }, this),
      500
    )
  }
  /**
   * 建置一載入中的按鈕
   * @memberof module:servkit
   * @param {DOM} btnElement
   * @returns {LoadingButton} LoadingButton(btnElement) 創建的函式
   */
  servkit.loadingButton = function (btnElement) {
    return new LoadingButton(btnElement)
  }

  /**
   * 取得table資訊並下載為Excel檔
   * @memberof module:servkit
   * @param {DOM} btn 取得按鈕物件
   * @param {Function} dataCallback 回傳資料的格式
   */
  // 下載 Excel
  servkit.downloadExcel = function (btn, dataCallback) {
    var hiddenFormId

    $(btn).on('click', function (e) {
      hiddenFormId && $('#' + hiddenFormId).remove()
      hiddenFormId = 'hiddenFormId' + moment().format('YYYYMMDDHHmmssSSSS')

      var $submitForm = $('<form id="' + hiddenFormId + '"></form>')
      var iframeHtml =
        '<iframe name="download_target" style="width:0;height:0;border:0px solid #fff;"></iframe>'
      $submitForm.append(
        $('<input>').attr('name', 'data').val(JSON.stringify(dataCallback()))
      )
      $submitForm.attr({
        action: servkit.rootPath + '/api/excel/download',
        method: 'post',
        target: 'download_target',
      })
      $(this).after($submitForm.hide())
      $submitForm.append(iframeHtml)

      document.querySelector('#' + hiddenFormId).submit()
    })
  }
  /**
   * 客製化取得table資訊並下載為Excel檔
   * @memberof module:servkit
   * @param {DOM} btn 取得按鈕物件
   * @param {Function} dataCallback 回傳資料的格式
   */
  // 下載 Excel
  servkit.downloadCustomizedExcel = function (btn, dataCallback) {
    var hiddenFormId

    $(btn).on('click', function (e) {
      hiddenFormId && $('#' + hiddenFormId).remove()
      hiddenFormId = 'hiddenFormId' + moment().format('YYYYMMDDHHmmssSSSS')

      var $submitForm = $('<form id="' + hiddenFormId + '"></form>')
      var iframeHtml =
        '<iframe name="download_target" style="width:0;height:0;border:0px solid #fff;"></iframe>'
      $submitForm.append(
        $('<input>').attr('name', 'data').val(JSON.stringify(dataCallback()))
      )
      $submitForm.attr({
        action: servkit.rootPath + '/api/excel/fromTemplate',
        method: 'post',
        target: 'download_target',
      })
      $(this).after($submitForm.hide())
      $submitForm.append(iframeHtml)

      document.querySelector('#' + hiddenFormId).submit()
    })
  }

  /**
   * 下載paramCallback回傳的資料
   * @memberof module:servkit
   * @param {DOM} btn 取得按鈕物件
   * @param {String} url 指定要呼叫的API
   * @param {Function} paramCallback 下載後的行為
   */
  servkit.downloadFile = function (btn, url, paramCallback, method) {
    var hiddenFormId

    $(btn).on('click', function (e) {
      hiddenFormId && $('#' + hiddenFormId).remove()
      hiddenFormId = 'hiddenFormId' + moment().format('YYYYMMDDHHmmssSSSS')

      var $submitForm = $('<form id="' + hiddenFormId + '"></form>')
      var iframeHtml =
        '<iframe name="download_target" style="width:0;height:0;border:0px solid #fff;"></iframe>'
      var param = paramCallback(e)
      if (!param) {
        return
      }
      for (var key in param) {
        if (Object.prototype.hasOwnProperty.call(param, key)) {
          $submitForm.append($('<input>').attr('name', key).val(param[key]))
        }
      }
      $submitForm.attr({
        action: servkit.rootPath + url,
        method: method || 'post',
        target: 'download_target',
      })
      $(this).after($submitForm.hide())
      $submitForm.append(iframeHtml)

      document.querySelector('#' + hiddenFormId).submit()
    })
  }

  /**
   * 當沒有資料時產生一dialog視窗提醒
   * @memberof module:servkit
   * @returns {DOM} $dialog
   */
  servkit.noDataDialog = function () {
    // 佈署查無資料時的提示視窗
    $('#content').append(
      $('<div id="dialog-no-data" title="Dialog No Data"></div>')
    )
    var $dialog = $('#dialog-no-data')
    $dialog.dialog({
      autoOpen: false,
      width: 200,
      resizable: false,
      modal: true,
      title: 'No Data',
      buttons: [
        {
          html: "<i class='fa fa-frown-o'></i>&nbsp; OK",
          class: 'btn btn-default',
          click: function () {
            $(this).dialog('close')
          },
        },
      ],
    })
    return $dialog
  }

  /**
   * 去檔案取資料
   * @memberof module:servkit
   * @param {Object} dataConfig 資料格式
   * @param {DOM} $select
   * @param {Function} cb 載完下拉式選單後執行的函式
   */
  servkit.initSelect = function (dataConfig, $select, cb) {
    servkit.ajax(
      {
        url: servkit.rootPath + '/api/getdata/file',
        type: 'POST',
        contentType: 'application/json',
        async: true,
        data: JSON.stringify(dataConfig),
      },
      function (data) {
        var html = []
        _.each(data, function (elem) {
          html.push("<option value='" + elem[0] + "'>" + elem[1] + '</option>')
        })

        if ($select.length === 1) {
          $select.html(html.join(''))
        } else {
          _.each($select, function (dom) {
            $(dom).html(html.join(''))
          })
        }

        if (cb && typeof cb === 'function') {
          cb(data)
        }
      }
    )
  }

  /**
   * 字串排序：將文字與數字分開，先排文字部分再排數字
   * @memberof module:servkit
   * @param {String} a 前一個字串
   * @param {String} b 後一個字串
   * @returns {Number} 前後的差距
   */
  servkit.naturalCompareValue = function (a, b) {
    var ax = []
    var bx = []

    replaceChineseNumber(a.name).replace(/(\d+)|(\D+)/g, function (_, $1, $2) {
      ax.push([$1 || Infinity, $2 || ''])
    })
    replaceChineseNumber(b.name).replace(/(\d+)|(\D+)/g, function (_, $1, $2) {
      bx.push([$1 || Infinity, $2 || ''])
    })

    while (ax.length && bx.length) {
      var an = ax.shift()
      var bn = bx.shift()
      var nn = an[0] - bn[0] || an[1].localeCompare(bn[1])
      if (nn) return nn
    }

    return ax.length - bx.length
  }

  // 只作用於1~10 十一會被替換為101，當有兩位數以上建議以阿拉伯數字做編號
  const replaceChineseNumber = function (str) {
    return str
      .replace(/一/g, 1)
      .replace(/二/g, 2)
      .replace(/三/g, 3)
      .replace(/四/g, 4)
      .replace(/五/g, 5)
      .replace(/六/g, 6)
      .replace(/七/g, 7)
      .replace(/八/g, 8)
      .replace(/九/g, 9)
      .replace(/十/g, 10)
  }

  /**
   * 以先排name中的字串部分後，再排數字部分
   * @memberof module:servkit
   * @param {Object} map 預計排序的物件
   * @returns {Object} 排序後的物件
   */
  var map2NaturalComparedObjArray = function (map) {
    return _.map(map, function (name, key) {
      return {
        key: key,
        name: name,
      }
    }).sort(servkit.naturalCompareValue)
  }

  /**
   * 初始機台選擇的狀態
   * @memberof module:servkit
   * @param {DOM} $machineSelect
   * @param {Boolean} defaultSelectAll 是否預設為全選
   */
  servkit.initMachineSelect = function ($machineSelect, defaultSelectAll) {
    var machineSelectHtml = $machineSelect.attr('multiple')
      ? ['<option>ALL</option>']
      : []
    var machineObjAry = []
    servkit.eachMachine(function (id, name) {
      machineObjAry.push({
        key: id,
        name: name,
      })
    })
    _.each(machineObjAry.sort(servkit.naturalCompareValue), function (elem) {
      machineSelectHtml.push(
        '<option style="padding:3px 0 3px 3px;" value="' +
          elem.key +
          '">' +
          elem.name +
          '</option>'
      )
    })
    renderSelect($machineSelect, machineSelectHtml, defaultSelectAll)
  }

  /**
   * 初始多選下拉式的選單內容
   * @memberof module:servkit
   * @param {Object} dataList 機台ID和name
   * @param {DOM} $select
   * @param {Boolean} defaultSelectAll 是否預設為全選
   */
  servkit.initSelectWithList = function (dataList, $select, defaultSelectAll) {
    var selectHtml = []
    if (_.isArray(dataList)) {
      _.each(dataList, function (elem) {
        selectHtml.push(
          '<option style="padding:3px 0 3px 3px;" value="' +
            elem +
            '">' +
            elem +
            '</option>'
        )
      })
    } else {
      _.each(map2NaturalComparedObjArray(dataList), function (elem) {
        selectHtml.push(
          '<option style="padding:3px 0 3px 3px;" value="' +
            elem.key +
            '">' +
            elem.name +
            '</option>'
        )
      })
    }

    if ($select.attr('multiple') && !$select.hasClass('select2')) {
      selectHtml.unshift('<option>ALL</option>')
      renderSelect($select, selectHtml, defaultSelectAll)
    } else {
      $select.html(selectHtml.join(''))
    }
  }

  /**
   * 當裝置為平板或手機時，chrome會另外渲染出一多選的下拉式選單，因此all這個選項需要另外判斷
   * @memberof module:servkit
   * @param {DOM} $select
   * @param {Array} selectHtmlAry 下拉式選單選項的html
   * @param {Boolean} defaultSelectAll 是否預設為全選
   */
  function renderSelect($select, selectHtmlAry, defaultSelectAll) {
    $select.html(selectHtmlAry.join(''))
    servkit.multiselectHeightOptimization($select[0])
    $select
      .off('mousedown')
      .on('mousedown', servkit.multiselectWithoutCtrlMouseDown)
      .off('mousemove')
      .on('mousemove', servkit.multiselectWithoutCtrlMouseMove)

    if ($select.attr('multiple')) {
      // for mobile and tablet. Seems like the option is not what we saw on desktop browser, more like
      // chorme app render extra view over the multi-select options.
      var lastSelectAll = $select.find('option:first').prop('selected')
      $select.off('change').on('change', function (e) {
        var isSelectAll = $select.find('option:first').prop('selected')
        if (isSelectAll !== lastSelectAll) {
          $select.find('option').prop('selected', isSelectAll)
        }
        lastSelectAll = isSelectAll
      })

      $select
        .find('option:first')
        .off('click')
        .on('click', function (e) {
          var selectScrollTop = e.target.parentNode.scrollTop
          $select.find('option').prop('selected', this.selected)

          // 調整 scrollTop 的動作必須要延遲到所有 mousedown 事件都做完後
          setTimeout(function () {
            e.target.parentNode.scrollTop = selectScrollTop
          }, 0)
        })
    }

    if (defaultSelectAll) {
      $select.find('option').prop('selected', 'selected')
    }
  }

  /**
   * 取得cookie內容並以物件方式記錄
   * @memberof module:servkit
   * @param {String} key 物件的key值
   * @returns {Object} 取得結果
   */
  servkit.getCookie = function (key) {
    var cookieMap = _.reduce(
      doc.cookie.split(';'),
      function (cookieMap, cookie) {
        var cookieSplitted = cookie.trim().split('=')
        cookieMap[cookieSplitted[0]] = cookieSplitted[1]
        return cookieMap
      },
      {}
    )
    return cookieMap[key]
  }

  /**
   * 取得location.serach 中的參數值
   * @memberof module:servkit
   * @param {String} key 參數的key
   * @returns {String} 參數的值
   */
  servkit.getURLParameter = function (key) {
    //
    return (
      decodeURIComponent(
        (new RegExp('[?|&]' + key + '=' + '([^&;]+?)(&|#|;|$)').exec(
          location.hash
        ) || [null, ''])[1].replace(/\+/g, '%20')
      ) || null
    )
  }

  /**
   * 初始化 datepicker ，若有兩個則會包含 startDate <= endDate 的驗證
   * @memberof module:servkit
   * @param  {DOM} $startDate - first datepicker
   * @param  {DOM} [$endDate] - second datepicker (optional)
   * @param  {Boolean} [bothToday=false] - is first and second datepicker both today?
   * @param  {int} [durationLimit] - max duration between startDate and endDate
   */
  servkit.initDatePicker = function (
    $startDate,
    $endDate,
    bothToday = false,
    durationLimit,
    submitSelector = '#submit',
    option = {}
  ) {
    var datepickerConfig = Object.assign(
      {
        dateFormat: 'yy/mm/dd',
        prevText: '<i class="fa fa-chevron-left"></i>',
        nextText: '<i class="fa fa-chevron-right"></i>',
      },
      option
    )
    var yesterday = moment().add(-1, 'd').format('YYYY/MM/DD')
    var today = moment(new Date()).format('YYYY/MM/DD')

    if ($startDate && bothToday) {
      $startDate.datepicker(datepickerConfig).val(today)
    } else {
      $startDate.datepicker(datepickerConfig).val(yesterday)
    }

    if ($endDate) {
      $endDate.datepicker(datepickerConfig).val(today)

      // make sure startDate <= endDate
      $startDate.off('change').on('change', function (evt) {
        const startDate = evt.target.value
        if (!moment(startDate, 'YYYY/MM/DD', true).isValid()) {
          return
        }
        $endDate.datepicker('option', 'minDate', startDate)
        if (durationLimit) {
          $endDate.datepicker(
            'option',
            'maxDate',
            moment(new Date(startDate))
              .add(durationLimit, 'day')
              .format('YYYY/MM/DD')
          )
        }
      })
      $endDate.off('change').on('change', function (evt) {
        const endDate = evt.target.value
        if (!moment(endDate, 'YYYY/MM/DD', true).isValid()) {
          return
        }
        $startDate.datepicker('option', 'maxDate', endDate)
        if (durationLimit) {
          $startDate.datepicker(
            'option',
            'minDate',
            moment(new Date(endDate))
              .add(0 - durationLimit, 'day')
              .format('YYYY/MM/DD')
          )
        }
      })
    }

    $startDate
      .closest('form')
      .find(submitSelector)
      .on('click', (e) => {
        $startDate
          .datepicker('option', 'maxDate', null)
          .datepicker('option', 'minDate', null)
        $endDate
          .datepicker('option', 'maxDate', null)
          .datepicker('option', 'minDate', null)
      })
  }

  /**
   * 更新表單內容
   * @memberof module:servkit
   * @param {Object} configObj 表單設定
   * @returns {Object} upload
   */
  servkit.uploader = function (configObj) {
    var form = configObj.formEle
    var api = form.action || configObj.api
    var callback = configObj.resolver
    var $form = $(form)
    var key = moment().format('YYYYMMDDHHmmssSSSS') + _.uniqueId()

    form.setAttribute('target', 'upload_target_' + key)
    form.setAttribute('action', api)
    form.setAttribute('method', 'post')
    form.setAttribute('enctype', 'multipart/form-data')

    if ($form.find('input[type="submit"]').length === 0) {
      $form.append('<input type="submit" class="hide"/>')
    }

    if ($form.parent().find('iframe').length === 0) {
      $form
        .parent()
        .append(
          '<iframe name="upload_target_' + key + '" class="hide"></iframe>'
        )
    }

    $form
      .parent()
      .find('iframe[name="upload_target_' + key + '"]')
      .on('load', function (evt) {
        servkit.responseRule(
          this.contentWindow.document.querySelector('body').textContent,
          callback
        )
      })

    return {
      upload: function () {
        form.submit()
      },
    }
  }

  /**
   * add export to pdf / png function
   * @memberof module:servkit
   * @param {any} headId which container will add Export button
   * @param {any} canvasId which container will be export to pdf or png
   * @param {any} canvasId2 which container will be export to pdf or png
   */
  servkit.addChartExport = function (headId, canvasId, canvasId2) {
    var pdfid =
      headId.replace('#', '') + '_' + canvasId.replace('#', '') + '_pdf'
    var pngid =
      headId.replace('#', '') + '_' + canvasId.replace('#', '') + '_png'
    var spdfid = '#' + pdfid
    var spngid = '#' + pngid
    var buttonHtml =
      '<div class="widget-toolbar" role="menu">' +
      '<div id="export_image" class="btn-group">' +
      '<button class="btn dropdown-toggle btn-xs btn-success" data-toggle="dropdown">' +
      i18n('Export') +
      ' <i class="fa fa-caret-down"></i>' +
      '</button>' +
      '<ul class="dropdown-menu pull-right">' +
      '<li>' +
      '<a id="' +
      pdfid +
      '" href="javascript:void(0);">' +
      i18n('Download_Pdf') +
      '</a>' +
      '</li>' +
      '<li>' +
      '<a id="' +
      pngid +
      '" download="chart.png" href="">' +
      i18n('Download_Png') +
      '</a>' +
      '</li>' +
      '</ul>' +
      '</div>' +
      '</div>'

    var head = $(headId)
    if (head !== undefined) head.append(buttonHtml)

    $(spngid).on('click', function (e) {
      e.preventDefault()

      var image
      html2canvas($(canvasId)[0], {
        onrendered: function (canvas) {
          var a = document.createElement('a')
          // toDataURL defaults to png, so we need to request a jpeg, then convert for file download.
          a.href = canvas
            .toDataURL('img/png')
            .replace('img/png', 'img/octet-stream')
          a.download = 'chart.png'
          a.click()
        },
      })

      if (canvasId2 !== undefined) {
        if ($(canvasId2)[0].children.length > 0) {
          html2canvas($(canvasId2)[0], {
            onrendered: function (canvas) {
              var a = document.createElement('a')
              // toDataURL defaults to png, so we need to request a jpeg, then convert for file download.
              a.href = canvas
                .toDataURL('img/png')
                .replace('img/png', 'img/octet-stream')
              a.download = 'chart2.png'
              a.click()
            },
          })
        }
      }
      this.href = image
    })

    $(spdfid).on('click', function (e) {
      e.preventDefault()

      // $(".legendColorBox").switchClass('legendColorBox', 'legendColorBoxs');
      html2canvas($(canvasId)[0], {
        onrendered: function (canvas) {
          subOnrendered(canvas, 'chart.pdf')
        },
      })
      // $(".legendColorBoxs").switchClass('legendColorBoxs', 'legendColorBox');

      if (canvasId2 !== undefined) {
        if ($(canvasId2)[0].children.length > 0) {
          html2canvas($(canvasId2)[0], {
            onrendered: function (canvas) {
              subOnrendered(canvas, 'chart2.pdf')
            },
          })
        }
      }
    })

    function subOnrendered(canvas, pdfName) {
      var image = canvas
        .toDataURL('img/png')
        .replace('img/png', 'img/octet-stream')
      const zoom = canvas.height ? canvas.height / 1000 : 1 / 1000
      var imgobj = new Image()
      var imgW = imgobj.width
      var imgH = imgobj.height
      imgobj.src = image
      imgW = Math.floor(imgW * 0.264583)
      imgH = Math.floor(imgH * 0.264583)

      imgobj.onload = function () {
        imgW = imgobj.width
        imgH = imgobj.height
      }

      if (imgobj.width === 0) imgW = 285
      if (imgobj.height === 0) imgH = 200

      // l : 橫向 or  p : 直向 , 'mm' : 單位
      var JsPDF = jsPDF // just to avoid eslint new-cap error, constructor should start with an uppercase letter
      var doc = new JsPDF('l', 'mm', 'a4')
      // doc.addImage(imgobj, 'PNG', 2, 2, imgW, imgH * zoom)
      doc.addImage(
        imgobj,
        'PNG',
        10,
        10,
        277,
        (canvas.height * 277) / canvas.width
      )
      doc.save(pdfName)
      // doc.save('chart2.pdf')
      // window.location = image;
    }
  }
  /**
   * add export to pdf / png function
   * @memberof module:servkit
   * @param {any} headId which container will add Export button
   */
  servkit.addmultiChartExport = function (headId, canvasarr) {
    var pdfid = headId.replace('#', '') + '_' + 'stack-chart_pdf'
    var pngid = headId.replace('#', '') + '_' + 'stack-chart_png'
    var spdfid = '#' + pdfid
    var spngid = '#' + pngid
    var buttonHtml =
      '<div class="widget-toolbar" role="menu">' +
      '<div id="export_image" class="btn-group">' +
      '<button id="export-btn" class="btn dropdown-toggle btn-xs btn-success" data-toggle="dropdown">' +
      i18n('Export') +
      '<i class="fa fa-caret-down"></i>' +
      '</button>' +
      '<ul class="dropdown-menu pull-right">' +
      '<li>' +
      '<a id="' +
      pdfid +
      '" href="javascript:void(0);">' +
      i18n('Download_Pdf') +
      '</a>' +
      '</li>' +
      '<li>' +
      '<a id="' +
      pngid +
      '" download="chart.png" href="">' +
      i18n('Download_Png') +
      '</a>' +
      '</li>' +
      '</ul>' +
      '</div>' +
      '</div>'

    var head = $(headId)
    if (head !== undefined) head.append(buttonHtml)
    var chartLoadingBtn = servkit.loadingButton(
      document.querySelector('#export-btn')
    )

    $(spngid).on('click', function (e) {
      e.preventDefault()
      chartLoadingBtn.doing()
      var image
      var promises = []
      _.each(canvasarr, function (canvasId) {
        promises.push(
          new Promise(function (resolve) {
            html2canvas($(canvasId)[0], {
              onrendered: function (canvas) {
                var a = document.createElement('a')
                // toDataURL defaults to png, so we need to request a jpeg, then convert for file download.
                a.href = canvas
                  .toDataURL('img/png')
                  .replace('img/png', 'img/octet-stream')
                a.download = 'chart.png'
                a.click()
                resolve(canvasId)
              },
            })
          })
        )
      })
      Promise.all(promises).then(function () {
        chartLoadingBtn.done()
      })
      this.href = image
    })

    $(spdfid).on('click', function (e) {
      e.preventDefault()
      chartLoadingBtn.doing()
      var copyarr = canvasarr.slice(0)
      // l : 橫向 or  p : 直向 , 'mm' : 單位
      var JsPDF = jsPDF // just to avoid eslint new-cap error, constructor should start with an uppercase letter
      servkit.exportPdfDoc = new JsPDF('l', 'mm', 'a4')
      servkit.exportPdfDoc.runcheck = copyarr.length
      servkit.exportPdfDoc.runIndex = 0
      servkit.exportPdfDoc.pagechk = true
      copyarr.reverse()
      subOnrendered(copyarr)
    })

    function subOnrendered(canvasarr) {
      if (canvasarr.length > 0) {
        new Promise(function (resolve, reject) {
          html2canvas($(canvasarr[canvasarr.length - 1])[0], {
            onrendered: function (canvas) {
              const zoom = canvas.height ? canvas.height / 1000 : 1 / 1000
              doc = servkit.exportPdfDoc
              doc.pagechk == true ? (doc.pagechk = false) : doc.addPage()
              doc.runIndex += 1
              doc.image = canvas
                .toDataURL('img/png')
                .replace('img/png', 'img/octet-stream')
              doc.imgobj = new Image()
              doc.imgobj.src = doc.image

              if (doc.imgobj.width === 0) doc.imgW = 285
              if (doc.imgobj.height === 0) doc.imgH = 200
              doc.addImage(doc.imgobj, 'PNG', 2, 2, doc.imgW, doc.imgH * zoom)
              canvasarr.pop()
              resolve(canvasarr)
            },
          })
        }).then(function (data) {
          subOnrendered(data)
        })
      } else {
        servkit.exportPdfDoc.save('Chart.pdf')
        delete servkit.exportPdfDoc
        chartLoadingBtn.done()
      }
    }
  }
  ;(function () {
    servkit.ajax(
      {
        url: 'api/custparam/showdemoconfig',
        type: 'GET',
        contentType: 'json/application',
      },
      {
        success: function (showdemoConfig) {
          servkit.showdemoConfig = showdemoConfig
        },
      }
    )
  })()
  ;(function () {
    if (
      !servtechConfig.ST_UI_SHOW_DEMO &&
      servtechConfig.ST_UI_SHOW_DEMO !== undefined
    ) {
      $('head').append(
        '<style> #showdemo, .showdemo { display: none; } </style>'
      )
    }
    if (
      !servtechConfig.ST_UI_SHOW_DEVLOGO &&
      servtechConfig.ST_UI_SHOW_DEVLOGO !== undefined
    ) {
      $('head').append('<style> .dev-logo-div { display: none; }</style>')
    }
    if (
      !servtechConfig.ST_UI_SHOW_SERVLOGO &&
      servtechConfig.ST_UI_SHOW_SERVLOGO !== undefined
    ) {
      $('head').append('<style> .serv-info { display: none; } </style>')
    }
    if (
      !servtechConfig.ST_UI_SHOW_APP_DESCRIPTION &&
      servtechConfig.ST_UI_SHOW_APP_DESCRIPTION !== undefined
    ) {
      $('head').append('<style> .app-description { display: none; } </style>')
    }
    if (
      !servtechConfig.ST_UI_SHOW_CONTRACT &&
      servtechConfig.ST_UI_SHOW_CONTRACT !== undefined
    ) {
      $('head').append(
        '<style> #content { padding-top: 20px!important; } </style>'
      )
    }
    if (
      !servtechConfig.ST_UI_SHOW_TABLEFILTER &&
      servtechConfig.ST_UI_SHOW_TABLEFILTER !== undefined
    ) {
      $('head').append(
        '<style> thead>tr:not(:last-child) { display: none; } </style>'
      )
    }
    if (
      !servtechConfig.ST_UI_SHOW_PLANT_AREA &&
      servtechConfig.ST_UI_SHOW_PLANT_AREA !== undefined
    ) {
      $('head').append('<style> .plant_area { display: none; } </style>')
    }
    if (servtechConfig.ST_SELECT2_MINIMUMINPUTLENGTH) {
      $.fn.select2.defaults.minimumInputLength =
        servtechConfig.ST_SELECT2_MINIMUMINPUTLENGTH
    }
  })()

  servkit.configUseShiftdata = function () {
    var use = true
    if (servtechConfig.ST_MONITOR_USE_SHIFT_DATA !== undefined)
      use = servtechConfig.ST_MONITOR_USE_SHIFT_DATA

    return use
  }

  servkit.configUseMultiDownloadProg = function () {
    var use = true
    if (servtechConfig.ST_USE_MULTI_DOWNLOAD_PROG !== undefined)
      use = servtechConfig.ST_USE_MULTI_DOWNLOAD_PROG

    return use
  }

  servkit.configUseDeviceStatus = function () {
    var use = true
    if (servtechConfig.ST_MONITOR_USE_DEVICE_STATUS_DATA !== undefined)
      use = servtechConfig.ST_MONITOR_USE_DEVICE_STATUS_DATA

    return use
  }

  servkit.configUseProgramUploadUseGSMuncp = function () {
    var use = true
    if (servtechConfig.ST_PROGRAM_UPLOAD_USE_G_S_MUNCP !== undefined)
      use = servtechConfig.ST_PROGRAM_UPLOAD_USE_G_S_MUNCP

    return use
  }

  servkit.configUseRegForDigiTrackWorkOp = function () {
    var use = true
    if (servtechConfig.ST_WORKOP_REG_O_999 !== undefined)
      use = servtechConfig.ST_WORKOP_REG_O_999

    return use
  }

  servkit.configCalForServTrackWorkOp = function () {
    var use = true
    if (servtechConfig.ST_TRACK_QUALITY_USE_Multiply !== undefined)
      use = servtechConfig.ST_TRACK_QUALITY_USE_Multiply

    return use
  }

  servkit.configModeOfAxisSpeedAndFeedRate = function () {
    var use = 22
    if (servtechConfig.ST_SHOW_AXISSPEED_FEEDRATE_MODE !== undefined)
      use = servtechConfig.ST_SHOW_AXISSPEED_FEEDRATE_MODE

    return use
  }
  /**
   * 一個定期執行的排程
   * @memberof module:servkit
   * @param {String} name
   * @constructor
   * @this {Schedule}
   */
  function Schedule(name) {
    this._id = undefined
    this._name = name
    this._type = 'interval'
  }

  Schedule.prototype = {
    /**
     * 排程的行為
     * @this {Schedule}
     * @param {Function} cb 預執行的函式
     * @returns {Schedule} this
     */
    action: function (cb) {
      this._action = cb
      return this
    },
    /**
     * 排程的時間
     * @this {Schedule}
     * @param {Number} ms 時間
     * @returns {Schedule} this
     */
    freqMillisecond: function (ms) {
      if (!_.isNumber(ms)) {
        throw new Error('請指定一個數值給 freqMillisecond！')
      }
      this._freqMs = ms
      return this
    },
    /**
     * 設定timeout或間隔時間的原因
     * @this {Schedule}
     * @param {String} timeoutOrInterval timeout或間隔時間的原因
     * @returns {Schedule} this
     */
    type: function (timeoutOrInterval) {
      if (['timeout', 'interval'].indexOf(timeoutOrInterval) !== -1) {
        this._type = timeoutOrInterval
        return this
      } else {
        throw new Error('timeout or interval with type...')
      }
    },
    /**
     * 執行排程
     * @this {Schedule}
     * @returns {Schedule} this
     */
    start: function () {
      var that = this

      function stopSchedule() {
        if (!that._id) {
          return
        }
        if (that._type === 'timeout') {
          clearTimeout(that._id)
        } else {
          clearInterval(that._id)
        }
        that._id = undefined
      }

      function startSchedule() {
        if (that._id) {
          return
        }
        if (!_.isNumber(that._freqMs)) {
          throw new Error('請明確指定一個數值給 freqMillisecond！')
        }
        if (that._type === 'timeout') {
          that._id = setTimeout(function timeoutAction() {
            try {
              that._action(function () {
                that._id = setTimeout(timeoutAction, that._freqMs)
              })
            } catch (e) {
              console.warn('[Schedule ' + that._name + '] 葛了啦...')
              console.warn(e)
              that._id = setTimeout(timeoutAction, that._freqMs)
            }
          }, 0)
        } else {
          try {
            that._action()
          } catch (e) {
            console.warn('[Schedule ' + that._name + '] 葛了啦...')
            console.warn(e)
          }
          that._id = setInterval(that._action, that._freqMs)
        }
      }

      startSchedule()

      $(window).on('hashchange', function hashChange(evt) {
        stopSchedule()
        $(window).off('hashchange', hashChange)
      })

      return {
        getScheduleId: function () {
          return that._id
        },
        getName: function () {
          return that._name
        },
        getType: function () {
          return that._type
        },
        setFreqMillisecond: function (ms) {
          that.freqMillisecond(ms)
          if (this.isActive()) {
            stopSchedule()
            startSchedule()
          }
        },
        start: function () {
          startSchedule()
        },
        stop: function () {
          stopSchedule()
        },
        isActive: function () {
          return _.isNumber(that._id)
        },
      }
    },
  }
  /**
   * 為排程命名
   * @memberof module:servkit
   * @param  {String} name - 排程名稱
   * @returns {Schedule}
   */
  servkit.schedule = function (name) {
    if (_.isString(name) && name.length) {
      return new Schedule(name)
    } else {
      throw new Error('不給我名字還想建排程!!')
    }
  }

  /**
   * 網路監視錄影機
   * @memberof module:servkit
   * @constructor
   * @this {IpCamDrawer}
   */
  function IpCamDrawer() {}

  IpCamDrawer.prototype = {
    /**
     * 顯示攝影畫面
     * @this {IpCamDrawer}
     * @param {Object} ipCamObj 影像資訊
     * @returns {Object} 移除的動作
     */
    attach: function (ipCamObj) {
      var that = this
      var $body = $('body')
      var $main = $('#main')
      var url =
        ipCamObj.user_name && ipCamObj.password
          ? 'http://' +
            ipCamObj.user_name +
            ':' +
            ipCamObj.password +
            '@' +
            ipCamObj.ip
          : 'http://' + ipCamObj.ip
      var w = window.open(url, '_blank', 'height=10,width=10')
      setTimeout(function () {
        try {
          var $drawer = $(
            '<div class="video">' +
              ' <span id="video-icon"><i class="fa fa-video-camera fa-times txt-color-blueDark"></i></span>' +
              ' <img class="real hide" height="100%" width="0" src="http://' +
              ipCamObj.ip +
              '" style="float:right;"/>' +
              ' <img class="fake hide" height="100%" width="100%" src="' +
              servkit.rootPath +
              '/img/blackBackGround.png"/>' +
              ' <video class="vjs-default-skin hide" style="float:right;" loop autoplay muted>' +
              '   <source src="' +
              servkit.rootPath +
              '/app/EquipMonitor/video/demo.mp4' +
              '"type="video/mp4">' +
              ' </video>' +
              '</div>'
          )
          var $real = $drawer.find('.real')
          var $fake = servtechConfig.ST_UI_IP_CAM_SHOW_VIDEO
            ? $drawer.find('video')
            : $drawer.find('.fake')
          $main.before($drawer)

          $real.load(function (e) {
            $(this).removeClass('hide') // 顯示真的畫面
            $fake.remove()
          })

          $drawer.on('click', function (e) {
            if ($real.width() > 0) {
              // close
              $real.width(0)
              $fake.width(0)
              $body.removeClass('minified')
              $main.removeClass('margin-right')
            } else {
              // open
              var videoWidth = $body.width() * 0.4
              $real.width(videoWidth)
              $fake.width(videoWidth).removeClass('hide')
              $body.addClass('minified')
              $main.addClass('margin-right')
            }

            $(this).toggleClass('active')
            $(this).find('i').toggleClass('fa-video-camera') // icon
          })

          that.$drawer = $drawer
          w.close()
        } catch (e) {
          console.warn(e)
        }
      }, 2500)

      $(window).on('hashchange', function removeMinified(evt) {
        $body.removeClass('minified')
        $main.removeClass('margin-right')
        $(window).off('hashchange', removeMinified)
      })
      return {
        removeDrawer: function () {
          this.$drawer.remove()
        },
      }
    },
  }
  /**
   * 包含要驗證的方法,基本的型態驗證
   */
  servkit.inputDataCheck = {
    isNumber: function (str) {
      // 空字串也等同非數字
      if (!str) {
        return false
      }
      return !isNaN(Number(str))
    },
    isFloat: function (n) {
      return Number(n) === n && n % 1 !== 0
    },
    isDefault: function (str) {
      if (this.isNull(str)) return 0
      if (this.isUndefind(str)) return -1
    },
    checkEscapeSymbol: function (str) {
      if (typeof val !== 'string') return str
      var temp
      var result
      if (str == null) {
        return str
      } else {
        temp = str.replace(/\\/g, '\\\\')
        result = temp.replace(/'/g, "\\'")
        return result
      }
    },
    symbolValidation: function (str) {
      var regSymbol = /[,"<>']/
      return regSymbol.test(str)
    },
    isNull: function (str) {
      return str === null
    },
    isUndefind: function (str) {
      return str === undefined
    },
    outOfLen: function (str, len) {
      return str.length > len ? true : false
    },
    unsignInt: function (str) {
      return parseInt(str) < 0
    },
    /*
     * -1: undefind
     * 0 : null
     * 1 : true
     */
    switchFunc: function (val, columnInfos) {
      const { type, size, nullable, columnType } = columnInfos
      //通用的驗證
      if (typeof val !== 'string') {
        return null
      }
      if (this.isDefault(val) < 1) {
        return null
      }
      if (type !== 'mediumtext' && this.symbolValidation(val)) {
        return i18n('Symbol_String')
      }
      if (size && this.outOfLen(val, size)) {
        return i18n('Out_Of_Len').replace('{size}', size)
      }
      if (!nullable && val.length === 0) {
        return i18n('Required')
      }
      if (columnType.includes('unsigned') && val < 0) {
        return i18n('Unsigned')
      }

      switch (type) {
        case 'float':
          if (!this.isNumber(val) && !this.isFloat(val)) {
            return i18n('Not_Float')
          }
          break
        case 'int':
        case 'tinyint':
        case 'bigint':
        case 'decimal':
        case 'double':
          if (!this.isNumber(val)) {
            return i18n('Not_Number')
          }
          break
        case 'datetime':
        case 'date':
        case 'time':
        case 'timestamp':
        default:
          return null
      }

      const decimalMatchedResult = /^decimal\((\d{1,10}),(\d{1,10})\)/.exec(
        columnType
      )
      if (decimalMatchedResult) {
        const totalDigitsCount = decimalMatchedResult[1] // 有效位數
        const decimalDigitsCount = decimalMatchedResult[2] // 小數位數
        const integerDigitsCount = totalDigitsCount - decimalDigitsCount
        const isDecimal = new RegExp(
          `^\\d{0,${integerDigitsCount}}\\.{0,1}\\d{0,${decimalDigitsCount}}$`
        ).test(val)
        return isDecimal
          ? null
          : i18n('Decimal_Format_Error')
              .replace('{S}', decimalDigitsCount)
              .replace('{P}', totalDigitsCount)
      }
    },
  }

  /**
   * 建置網路攝影畫面
   * @memberof module:servkit
   * @returns {IpCamDrawer}
   */
  servkit.ipCamDrawer = function () {
    return new IpCamDrawer()
  }

  /**
   * 清除機台狀態資訊
   * @memberof module:servkit
   * @param {Object} machineMap
   */
  servkit.cleanDeviceStatusMap = function (machineMap) {
    var keys = _.keys(machineMap)
    for (var i = 0; i < keys.length; ++i) {
      var signals = _.keys(machineMap[keys[i]])
      for (var j = 0; j < signals.length; ++j) {
        machineMap[keys[i]][signals[j]] = null
      }
      machineMap[keys[i]] = null
    }
  }

  /**
   * protobuf轉成machine map
   * @memberof mosule:servkit
   * @param {JSON} data 機台資訊
   * @param {Object} machinesMap 機台物件
   */
  servkit.convertDeviceStatusPb2Map = function (data, machinesMap) {
    // var machinesMap = {};//機台map，用來存全部的機台
    // console.log("--------------------");
    // console.log(data);
    // console.log("--------------------");
    _.each(data, function (boxStr) {
      var box
      try {
        box = JSON.parse(boxStr)
      } catch (e) {
        console.warn('boxStr: ', e, ', msg: ', boxStr)
        return
      }
      var boxId = box.from
      var stringValues = box.result.stringValues // 取値
      _.each(stringValues, function (ele) {
        var gCode = ele.signal.id // 取得gCode
        var systems = ele.values // 多系統陣列
        _.each(systems, function (system) {
          var matrix
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
  }

  // 讓 Dialog 的 title 可以用 HTML 字串來設定
  ;(function () {
    $.widget(
      'ui.dialog',
      $.extend({}, $.ui.dialog.prototype, {
        _title: function (title) {
          if (!this.options.title) {
            title.html('&#160;')
          } else {
            title.html(this.options.title)
          }
        },
      })
    )
  })()

  /**
   * 一定要在綁定查詢事件前呼叫
   * @memberof module:servkit
   * @param {DOM} $form
   * @param {DOM} $submitBtn
   */
  servkit.validateForm = function ($form, $submitBtn, option = {}) {
    var validator = $form.validate(
      Object.assign(
        {
          ignore: '*:not([name]), :hidden', // do not validate DOM without name attribute or, ex: the input select2 added
          errorPlacement: function (error, element) {
            if (element.is(':radio') || element.is(':checkbox')) {
              error.insertBefore(element) // insert error label before input to keep the css style ".smart-form .radio input:checked+i:after" working
            } else {
              error.insertAfter(element)
            }
          },
        },
        option
      )
    )

    $submitBtn.on('click', function (evt) {
      evt.preventDefault()
      if (!validator.form()) {
        // 沒通過驗證的話，阻止查詢資料的 Click 繼續發生
        evt.stopImmediatePropagation()
      }
    })

    return validator
  }

  /**
   * jarviswidget-fullscreen-btn全螢幕的時候換頁會造成overflow:hidden
   */
  $(window).on('hashchange', function hashChange(evt) {
    $('body').removeClass('nooverflow')
  })
  ;(function () {
    $.ajax({
      url: servkit.rootPath + '/api/getdata/db',
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
    }).done(function (data) {
      if (data.type === 0) {
        appFuncBindingBrandMachineMap = data.data
        appFuncBindingBrandMachineGot = true
      }
    })
  })()

  servkit.initFuncBindMachineSelect = function (
    $machineSelect,
    appId,
    funcId,
    defaultSelectAll
  ) {
    var machineSelectHtml = $machineSelect.attr('multiple')
      ? ['<option>ALL</option>']
      : []
    var machineObjAry = []
    servkit.eachMachine(function (id, name) {
      machineObjAry.push({
        key: id,
        name: name,
      })
    })
    if (appId && funcId) {
      var assignMachines = _.where(appFuncBindingBrandMachineMap, {
        app_id: appId,
        func_id: funcId,
      })
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
    _.each(machineObjAry.sort(servkit.naturalCompareValue), function (elem) {
      machineSelectHtml.push(
        '<option style="padding:3px 0 3px 3px;" value="' +
          elem.key +
          '">' +
          elem.name +
          '</option>'
      )
    })
    renderSelect($machineSelect, machineSelectHtml, defaultSelectAll)
  }
  servkit.filterFuncBindMachine = function (dataList, appId, funcId) {
    var result = dataList
    var newResultIsExist = false
    if (appId && funcId) {
      var assignMachines = _.where(appFuncBindingBrandMachineMap, {
        app_id: appId,
        func_id: funcId,
      })
      if (assignMachines.length > 0) {
        var newResult = {}
        _.each(assignMachines, function (map) {
          if (dataList[map['device_id']]) {
            newResult[map['device_id']] = map['device_name']
            newResultIsExist = true
          }
        })
      }
      if (newResultIsExist) {
        result = newResult
      }
    }
    return result
  }

  servkit.getFuncBindMachineList = function (appId, funcId) {
    var result = servkit.getMachineList()
    var newResultIsExist = false
    if (appId && funcId) {
      var assignMachines = _.where(appFuncBindingBrandMachineMap, {
        app_id: appId,
        func_id: funcId,
      })
      if (assignMachines.length > 0) {
        var newResult = []
        _.each(assignMachines, function (map) {
          newResult.push(map['device_id'])
        })
        newResultIsExist = true
      }
      if (newResultIsExist) {
        result = newResult
      }
    }
    return result
  }

  servkit.getAppFuncBindingBrandMachineMap = function () {
    return appFuncBindingBrandMachineMap
  }
})(this, $, _)
