import { servtechConfig } from '../../../js/servtech/module/servtech.config.js'
import { initSelectWithList } from '../../../js/servtech/module/servkit/form.js'

const isStrongLED = servtechConfig.ST_CUSTOMER === 'StrongLED'
const isComoss = servtechConfig.ST_CUSTOMER === 'Comoss'

class PositionStructure {
  constructor() {
    this.positionList = null
    this.levelCount = null
    this.structure = null
    this.storage = null
    this.storePosition = null
    this.storageMap = null
  }
  _init() {
    return Promise.all([
      this.fetchStorageFile(),
      this.fetchStructureFile(),
      this.fetchStorePosition(),
    ]).then(([storage, structure, storePosition]) => {
      this.levelCount = structure.length
      this.structure = structure
      this.storage = storage
      this.storePosition = storePosition
      this.storageMap = this.getStorageMap(storage)
      return this
    })
  }
  fetchStorageFile() {
    return new Promise((res) =>
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
          success(response) {
            res(JSON.parse(response))
          },
        }
      )
    )
  }
  fetchStorePosition() {
    return new Promise((res) =>
      servkit.ajax(
        {
          url: 'api/getdata/db',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
            table: 'a_storage_store_position',
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
  fetchStructureFile() {
    return new Promise((res) =>
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
          success(response) {
            res(JSON.parse(response))
          },
        }
      )
    )
  }
  refreshStorage(data) {
    if (data) {
      this.storage = data
      this.storageMap = this.getStorageMap(data)
      return Promise.resolve(this)
    } else {
      return this.fetchStorageFile().then((storage) => {
        this.storage = storage
        this.storageMap = this.getStorageMap(storage)
        return this
      })
    }
  }
  _parseLevelData(
    dataMap,
    lastKey,
    lastIdPath,
    lastIdNamePath,
    result,
    deletePath,
    structureLength
  ) {
    dataMap.forEach((val) => {
      let currentKey = lastKey
      const currentIdPath = lastIdPath + val.id
      const currentIdNamePath = `${lastIdNamePath}${lastIdNamePath ? '-' : ''}${
        val.id
      }${val.name ? '(' + val.name + ')' : ''}`

      // 區域之前的資料
      if (Number(val.level) <= structureLength - 1) {
        currentKey = currentIdPath
        if (result[lastIdPath]) {
          result[currentKey] = JSON.parse(JSON.stringify(result[lastIdPath]))
          deletePath.push(lastIdPath)
        } else {
          result[currentKey] = {
            levels: {},
          }
        }
        result[currentKey].levels[val.level] = {
          id: val.id,
          name: val.name,
          idPath: currentIdPath,
          idNamePath: currentIdNamePath,
        }
        if (val.db_id) {
          result[currentKey].levels[val.level].db_id = val.db_id
        }
        result[currentKey].idPath = currentIdPath
        result[currentKey].idNamePath = currentIdNamePath
      } else {
        // position資料
        if (!result[currentKey].position) result[currentKey].position = []
        var positionData = {
          id: val.id,
          name: val.name,
          idPath: currentIdPath,
          idNamePath: currentIdNamePath,
        }
        if (val.db_id) positionData.db_id = val.db_id
        result[currentKey].position.push(positionData)
      }

      if (val.child && val.child.length) {
        this._parseLevelData(
          val.child,
          currentKey,
          currentIdPath,
          currentIdNamePath,
          result,
          deletePath,
          structureLength
        )
      }
    })
  }
  getStorageMap(positionStructure) {
    const deletePath = []
    const result = {}
    this._parseLevelData(
      positionStructure,
      '',
      '',
      '',
      result,
      deletePath,
      this.levelCount
    )

    // 把父輩的資料刪除，不能用了之後就刪，因為如果同層有其他也要用到這個資料就拿不到了
    Array.from(new Set(deletePath)).forEach((path) => {
      delete result[path]
    })
    // 刪掉沒有長到最後一層的資料
    for (let key in result) {
      if (!result[key].position) {
        delete result[key]
      }
    }
    return result
  }
  getLevelData(level) {
    const result = {}
    let data
    let path
    _.each(this.storageMap, (levelData, levelKey) => {
      data = levelData.levels[level]
      if (data) {
        path = data.idPath
        if (!result[path]) {
          result[path] = []
        }
        result[path].push(levelKey)
      }
    })
    return result
  }
  getPositionList(storeIdPathList = []) {
    const pathSet = new Set(storeIdPathList)
    let path
    return Object.values(this.storageMap).reduce((a, data) => {
      ;({ idPath: path } = data)
      if (pathSet.has(path)) {
        a.push(...data.position)
      }
      return a
    }, [])
  }
  getStructureMap() {
    return this.structure.reduce((a, { level, name }) => {
      a[level < 0 ? this.levelCount : level] = name
      return a
    }, {})
  }
  getPositionIdPath(position_id) {
    let positionMap
    let storeMap = Object.values(this.storageMap)
      .filter((map) => map.position)
      .find(
        (map) =>
          (positionMap = map.position.find((m) => m.db_id === position_id))
      )
    let levelDataCount
    if (storeMap) {
      levelDataCount = Object.keys(storeMap.levels).length
      return new PositionIdPath(
        {
          section: storeMap.levels[levelDataCount - 1].idPath,
          level: storeMap.levels[levelDataCount].id,
          position: positionMap.id,
        },
        storeMap
      )
    } else {
      return null
    }
  }
  initPositionViewFormEls(storeViewSelect, gridViewSelect, cellViewSelect) {
    const self = this
    const storeViewList = _.chain(this.storageMap)
      .filter((map) => map.levels[this.levelCount - 2])
      .map((i) => i.levels[this.levelCount - 2].idPath)
      .value()
    servkit.initSelectWithList(
      Object.fromEntries(
        storeViewList.map((path) => [path, Section.toString(path)])
      ),
      $(storeViewSelect)
    )
    $(gridViewSelect).on('change', function () {
      const { gridCellMap } = $(this).data()
      const gridView = this.value
      servkit.initSelectWithList(gridCellMap[gridView], $(cellViewSelect))
    })
    $(storeViewSelect)
      .on('change', function () {
        const storeView = this.value
        const gridCellMap = Object.fromEntries(
          _.chain(self.storageMap)
            .filter((val, key) => {
              return (
                val.levels[self.levelCount - 2] &&
                val.levels[self.levelCount - 2].idPath === storeView
              )
            })
            .map((val) => [
              val.levels[self.levelCount - 1].id,
              _.pluck(val.position, 'id'),
            ])
            .value()
        )
        servkit.initSelectWithList(Object.keys(gridCellMap), $(gridViewSelect))
        $(gridViewSelect)
          .data({
            gridCellMap,
          })
          .change()
      })
      .change()
  }
  initQueryPositionSelects($structureLevel, $levelOption) {
    const self = this
    const { levelCount } = self
    // 忽略儲位層級，若是大峽谷則忽略根層級
    const filteredStructureList = self.structure
      .filter(
        ({ level }) => level > (isStrongLED ? 1 : 0) && level < levelCount
      )
      .map(({ level, name }) => [level, name])
      .sort(([levelA, levelB]) => levelA - levelB)

    $levelOption.select2({
      minimumInputLength: 0,
    })
    initSelectWithList(filteredStructureList, $structureLevel)
    $structureLevel
      .on('change', function appendStoreOption() {
        const level = this.value
        let levelIdPathlist
        if (isStrongLED) {
          levelIdPathlist = _.chain(self.storageMap)
            .map((data) => [
              data.levels[level].idPath,
              data.levels[level].idPath.replace(data.levels[1].id, ''),
            ])
            .uniq(([fullIdPath]) => fullIdPath)
            .value()
        } else {
          levelIdPathlist = _.chain(self.storageMap)
            .map((data) => data.levels[level].idPath)
            .uniq()
            .value()
        }

        $levelOption.empty()
        initSelectWithList(levelIdPathlist, $levelOption)
        $levelOption.change()
      })
      .change()
  }
  getPositionIdFromIdPath(data) {
    const { section, level, position } = data
    const idPath = section + level + position
    return Object.values(this.storageMap)
      .filter((map) => map.position)
      .map((map) => map.position)
      .flat()
      .find((p) => p.idPath === idPath).db_id
  }
  getPositionIdFromDb(store_id, grid_index, cell_index) {
    const self = this
    const positionData = self.storePosition.find(
      (map) =>
        map.store_id.toString() === store_id.toString() &&
        map.store_grid_index.toString() === grid_index.toString() &&
        map.store_cell_index.toString() === cell_index.toString()
    )
    return positionData ? positionData.position_id : null
  }
  getFullPathByIdPath(idPath) {
    const levelData = Object.values(this.storageMap)
      .map((map) => map.levels)
      .flat()
      .find((map) => idPath === map.idPath)
    return levelData ? levelData.idNamePath : null
  }
  getFullPathByPositionId(position_id) {
    const positionData = Object.values(this.storageMap)
      .map((map) => map.position)
      .filter((map) => map)
      .flat()
      .find((map) => position_id === map.db_id)
    return positionData ? positionData.idNamePath : null
  }
}
class Section {
  static toString(section, storeMap) {
    if (isComoss) {
      // 昕鈺，第四、五層之間插入 dash 符號
      const topFourLevelIdPath = storeMap.levels[4].idPath
      return section.replace(
        new RegExp(`^(${topFourLevelIdPath})(.*)`),
        '$1-$2'
      )
    } else {
      // 在 id 之間插入 dash 符號
      const sectionLevel = +_.findKey(
        storeMap.levels,
        (value) => value.idPath === section
      )
      // 大峽谷，隱藏第一層
      return _.range(isStrongLED ? 2 : 1, sectionLevel + 1)
        .map((i) => storeMap.levels[i].id)
        .join('-')
    }
  }
}
class PositionIdPath {
  constructor({ section, level, position }, storeMap) {
    this.section = section
    this.level = level
    this.position = position
    this.storeMap = storeMap
  }
  toString() {
    if (isComoss) {
      return (
        Section.toString(this.section, this.storeMap) +
        this.level +
        this.position
      )
    } else {
      // 在 id 之間插入 dash 符號
      return (
        Section.toString(this.section, this.storeMap) +
        '-' +
        this.level +
        '-' +
        this.position
      )
    }
  }
  getNamePath() {
    let levelDataEntries = Object.entries(this.storeMap.levels)
    if (isStrongLED) {
      levelDataEntries = levelDataEntries.filter(([level]) => +level !== 1)
    }
    return levelDataEntries
      .sort(([levelA], [levelB]) => levelA - levelB)
      .map(([, val]) => val.name)
      .concat(
        this.storeMap.position.find(({ id }) => id === this.position).name
      )
      .join('-')
  }
}
const getPositionStructure = (() => {
  let result
  return () => {
    if (result) {
      return Promise.resolve(result)
    } else {
      result = new PositionStructure()
      return result._init()
    }
  }
})()
export { getPositionStructure, PositionIdPath, Section }
