import {
  fetchDieChangeProductData,
  fetchJiaPeopleProduct,
  fetchJiaQualityProduct,
  fetchQualityExamDataFromDB,
  fetchToolMpHistoryData,
  fetchToolSpHistoryData,
  fetchProductProfile,
} from './dataModel.js'

let toolMpHistory
let toolSpHistory

// 取得該管編最近一次生產指令的 校車人員 與 校車時間
const getDieChangeProductData = (orderList) => {
  return fetchDieChangeProductData(orderList).then((exhalable) => {
    let calibration = {}
    if (exhalable.exhalable.length) {
      calibration = _.chain(exhalable.exhalable)
        .groupBy('machine_id')
        .mapObject((list) =>
          _.pick(
            list.reduce((a, x) => {
              return moment(a.regulate_start, 'YYYYMMDDHHmmss').isAfter(
                moment(a.regulate_start, 'YYYYMMDDHHmmss')
              )
                ? a
                : x
            }),
            ['macro521', 'regulate_start', 'regulate_time']
          )
        )
        .value()
    }
    return calibration
  })
}
// 取得產量不為零、最後三班的產能稼動率和平均生產時間
const getJiaPeopleProductData = (orderList) => {
  // group by 某天 某班 某機台 某人 某訂單 某製程
  return fetchJiaPeopleProduct(orderList).then((exhalable) => {
    const result = {}

    if (!exhalable) {
      return result
    }
    // 每個機台取末三班的資料
    return _.chain(exhalable.exhalable)
      .groupBy('machine_id')
      .mapObject((groupedData) =>
        groupedData
          .filter((data) => data.part_count > 0)
          .sort((a, b) => {
            return b.date.localeCompare(a.date)
          })
          .slice(0, 3)
          .map((data) => _.pick(data, ['piece_avg_minute', 'efficiency_oee']))
      )
      .value()
  })
}
// 取得不良品紀錄 (品質檢測數據)
const getQualityExamData = (orderList) => {
  return fetchQualityExamDataFromDB(orderList).then((data) => {
    return _.chain(data)
      .groupBy('machine_id')
      .mapObject((groupedData) =>
        _.pluck(groupedData, 'defective_reason').filter(
          (reason) => reason && reason !== '---'
        )
      )
      .value()
  })
}
// 取得刀具履歷
const getToolMpHistoryData = (orderId) => {
  return fetchToolMpHistoryData(orderId).then((data) => {
    let create_time
    toolMpHistory = _.chain(data)
      .map((obj) => {
        create_time = obj.create_time.toFormatedDatetime()
        return Object.assign({}, obj, { create_time })
      })
      .groupBy('create_time')
      .value()
    return _.groupBy(data, 'machine_id')
  })
}
// 取得生產指令列表
const getOrderData = (orderDataList) => {
  const macro523List = _.pluck(orderDataList, 'macro523')
  return fetchJiaQualityProduct(macro523List).then((exhalable) => {
    const result = {
      orderId: '',
      macro523: '',
    }

    if (!exhalable || !exhalable.exhalable.length) {
      return result
    }

    const sortedData = exhalable.exhalable.sort(function (a, b) {
      return (
        servkit.naturalCompareValue(
          {
            name: b.date,
          },
          {
            name: a.date,
          }
        ) ||
        servkit.naturalCompareValue(
          {
            name: b.order_id,
          },
          {
            name: a.order_id,
          }
        ) ||
        servkit.naturalCompareValue(
          {
            name: b.work_shift_name,
          },
          {
            name: a.work_shift_name,
          }
        )
      )
    })
    const [latestData] = sortedData // 日期最近、生產指令最大、班次最後

    if (latestData.order_id) {
      result.macro523 = latestData.order_id
      result.orderId = _.find(orderDataList, function (obj) {
        return obj.macro523 == result.macro523
      }).order_id
    }

    return result
  })
}
// 點選「前次生產紀錄」後取得歷史資料並顯示
const getHistoryInfoHtml = (orderDataList, userMap) => {
  return getOrderData(orderDataList)
    .then(({ macro523, orderId }) => {
      $('#last-p-record-order').text(orderId)
      return Promise.all([
        getDieChangeProductData([macro523]),
        getJiaPeopleProductData([macro523]),
        getQualityExamData([macro523]),
        getToolMpHistoryData(orderId),
      ])
    })
    .then(
      ([calibration, peopleProduct, qualityExamData, toolMpHistoryData]) => {
        const machineIdSet = new Set()
        Object.keys(calibration).forEach((key) => machineIdSet.add(key))
        Object.keys(peopleProduct).forEach((key) => machineIdSet.add(key))
        Object.keys(qualityExamData).forEach((key) => machineIdSet.add(key))
        Object.keys(toolMpHistoryData).forEach((key) => machineIdSet.add(key))
        return Array.from(machineIdSet)
          .map((id) => ({
            name: servkit.getMachineName(id),
            id,
          }))
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(({ id, name }) => {
            const htmlArr = [
              getRegulateInfoHtml(calibration[id] || {}, name, userMap),
              getProductionInfoHtml(peopleProduct[id] || {}),
              getDefectiveInfoHtml(qualityExamData[id] || {}),
              getToolMpHistoryInfoHtml(toolMpHistoryData[id] || {}),
            ]

            return `<div class="block-container">
          <h4>${name}</h4>
          ${htmlArr.map((html) => `<div class="block">${html}</div>`).join('')}
          </div>`
          })
          .join('')
      }
    )
}
const getRegulateInfoHtml = (data, machine_name, userMap) => {
  const { macro521, regulate_time, regulate_start } = data
  let employeeId
  let regulators
  if (macro521) {
    regulators = _.uniq(macro521.split('#'))
      .map((id) => {
        employeeId = fillZeroTo5Digit(id)
        return macro521ToUserName(employeeId, userMap)
      })
      .join(', ')
  } else {
    regulators = '---'
  }
  if (_.isEmpty(data)) {
    return `<h4>校車紀錄</h4>
    <div>前次生產無校車紀錄</div>`
  } else {
    return `<h4>校車紀錄</h4>
    <div class="row">
      <div class="col-lg-6">校車人員：${regulators}</div>
      <div class="col-lg-6">校車時長：${
        regulate_time ? regulate_time.millisecondToHHmmss() : '---'
      }</div>
      <div class="col-lg-6">校車開始時間：${
        regulate_start
          ? regulate_start.toFormatedDatetime(
              'YYYYMMDDHHmmss',
              'YYYY/MM/DD HH:mm'
            )
          : '---'
      }</div>
    </div>`
  }
}
const getProductionInfoHtml = (data) => {
  const durationArr = _.pluck(data, 'piece_avg_minute')
  const utilizationArr = _.pluck(data, 'efficiency_oee')
  durationArr.push(...Array(3 - durationArr.length).fill(''))
  utilizationArr.push(...Array(3 - utilizationArr.length).fill(''))
  return `<h4>加工秒數(派工記錄數值)</h4>
  <div>末三班平均生產時間：${durationArr
    .map(
      (duration) =>
        `<span>${
          duration ? (duration * 60 * 1000).millisecondToXXmXXs() : '---'
        }</span>`
    )
    .join(', ')}</div>
  <div>末三班效能稼動率：${utilizationArr
    .map(
      (utilization) =>
        `<span>${utilization ? utilization.floatToPercentage() : '---'}</span>`
    )
    .join(', ')}</div>
  <div>(實際產量/預期產量)</div>`
}
const getDefectiveInfoHtml = (data) => {
  return `<h4>不良品紀錄</h4><div>${
    data && data.length ? data.join('、') : '無'
  }</div>`
}
const getToolMpHistoryInfoHtml = (dataList) => {
  if (!(dataList && dataList.length)) {
    return '<h4>刀具履歷</h4><div>無</div>'
  }
  return `<h4>刀具履歷</h4>${dataList
    .map(
      (data) => `<div>上線日：<span>${
        data.create_time ? data.create_time.toFormatedDatetime() : '---'
      }</span>
  <a href="javascript: void(0)" class="tool-mp-history" data-create-time="${
    data.create_time ? data.create_time.toFormatedDatetime() : ''
  }">檢視明細</a></div>`
    )
    .join('')}`
}
const macro521ToUserName = (macro521, userMap) => {
  const userId = isNaN(macro521) ? macro521 : macro521.padStart(5, '0')
  return userMap[userId] || userId
}
const fillZeroTo5Digit = (userId) => {
  var id = userId
  if (!_.isNaN(parseInt(id))) {
    while (id.length < 5) {
      id = '0' + id
    }
  }
  return id
}
// 取得樣品試做刀具履歷
const getSampleToolHistoryData = (productId) => {
  return fetchProductProfile(productId)
    .then((productProfile) =>
      fetchToolSpHistoryData(_.pluck(productProfile, 'product_pid'))
    )
    .then(
      (dataList) =>
        (toolSpHistory = _.chain(dataList)
          .map((obj) =>
            Object.assign({}, obj, {
              create_time: obj.create_time.toFormatedDatetime(),
            })
          )
          .groupBy('tool_history_no')
          .value())
    )
}
const getToolHistoryData = (type, pk) => {
  let data
  switch (type) {
    case 'mp':
      data = toolMpHistory[pk]
      break
    case 'sp':
      data = toolSpHistory[pk]
      break
  }
  return data
}

export {
  getHistoryInfoHtml,
  getSampleToolHistoryData,
  getToolHistoryData,
  macro521ToUserName,
}
