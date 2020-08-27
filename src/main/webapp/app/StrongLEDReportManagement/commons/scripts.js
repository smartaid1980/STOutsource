var struc, storage
var storageMap = {}
var positionMap = {}
var storePositionMap = {}
var structureLength

exports.getStoreStrucData = (function () {
  return function (done) {
    servkit.ajax(
      {
        url: 'api/getdata/custParamJsonFile',
        type: 'GET',
        contentType: 'application/json',
        data: {
          filePath: 'storage/structure.json',
        },
      },
      {
        success: function (response) {
          struc = JSON.parse(response)
        },
      }
    )
    servkit.ajax(
      {
        url: 'api/getdata/custParamJsonFile',
        type: 'GET',
        contentType: 'application/json',
        data: {
          filePath: 'storage/storage.json',
        },
      },
      {
        success: function (response) {
          storage = JSON.parse(response)
        },
      }
    )
    servkit
      .politeCheck()
      .until(function () {
        return struc && storage
      })
      .thenDo(function () {
        var deletePath = []
        structureLength = struc.length
        var getLevelData = function (data, key, idPath, idNamePath) {
          _.each(data, (val) => {
            var thisKey = key
            var thisIdPath = idPath + val.id
            // var thisIdNamePath = idNamePath + val.id + (val.name ? '(' + val.name + ')' : '')
            var thisIdNamePath = idNamePath + val.name

            // 區域之前的資料
            if (Number(val.level) <= structureLength - 1) {
              thisKey = thisIdPath
              if (storageMap[idPath]) {
                storageMap[thisKey] = JSON.parse(
                  JSON.stringify(storageMap[idPath])
                )
                deletePath.push(idPath)
              } else {
                storageMap[thisKey] = {
                  levels: {},
                }
              }
              storageMap[thisKey].levels[val.level] = {
                id: val.id,
                name: val.name,
                idPath: thisIdPath,
                idNamePath: thisIdNamePath,
              }
              if (val.db_id) {
                storageMap[thisKey].levels[val.level].db_id = val.db_id
              }
              storageMap[thisKey].idPath = thisIdPath
              storageMap[thisKey].idNamePath = thisIdNamePath
            } else {
              // position資料
              if (!storageMap[thisKey].position)
                storageMap[thisKey].position = []
              var positionData = {
                id: val.id,
                name: val.name,
                idPath: thisIdPath,
                idNamePath: thisIdNamePath,
              }
              if (val.db_id) positionData.db_id = val.db_id
              storageMap[thisKey].position.push(positionData)

              // 組DB ID跟文字串的關係
              positionMap[val.db_id] = _.extend({}, positionData)
            }

            if (val.child && val.child.length) {
              getLevelData(val.child, thisKey, thisIdPath, thisIdNamePath)
            }
          })
        }
        getLevelData(storage, '', '', '')

        // 把父輩的資料刪除，不能用了之後就刪，因為如果同層有其他也要用到這個資料就拿不到了
        _.each(_.uniq(deletePath), (val) => {
          storageMap[val] = null
          delete storageMap[val]
        })
        console.log(storageMap)

        done(storageMap)
      })
      .tryDuration(0)
      .start()
  }
})()

exports.getDateByLavel = function (thisLevel) {
  var selectMap = {}
  // 內容其實都一樣只是text其實只是切割前面幾層
  _.each(storageMap, (levelData, levelKey) => {
    var data = levelData.levels[thisLevel]
    if (data) {
      var path = data.idPath.replace(levelData.levels['1'].id, '')
      if (!selectMap[path]) selectMap[path] = []
      selectMap[path].push(levelKey)
    }
  })
  return selectMap
}

exports.getPositionMap = function () {
  return positionMap
}

exports.getStruc = function () {
  return struc
}
exports.getStrucLength = function () {
  return structureLength
}

exports.getStorePositionMap = (function () {
  return function (done) {
    servkit.ajax(
      {
        url: 'api/getdata/db',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          table: 'a_storage_store_position',
          columns: [
            'position_id',
            'store_id',
            'store_grid_index',
            'store_cell_index',
          ],
        }),
      },
      {
        success: function (data) {
          _.each(data, function (elem) {
            storePositionMap[
              elem.store_id +
                '||' +
                elem.store_grid_index +
                '||' +
                elem.store_cell_index
            ] = elem.position_id
          })
          done(storePositionMap)
        },
      }
    )
  }
})()

exports.getStorePath = function (storeId, grid, cell, level) {
  var thisLevel = level || 1
  const positionId = storePositionMap[storeId + '||' + grid + '||' + cell]
  var result = {}
  if (positionMap[positionId]) {
    result.id = positionMap[positionId].idPath
    result.name = positionMap[positionId].idNamePath
  }
  _.each(storageMap, (elem) => {
    _.each(elem.position, (data) => {
      if (data.db_id === positionId) {
        result.id = result.id.replace(elem.levels[thisLevel].idPath, '')
        result.name = result.name.replace(elem.levels[thisLevel].idNamePath, '')
      }
    })
  })
  return result
}
