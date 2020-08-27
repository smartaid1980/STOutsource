import { DATE_FORMAT } from './constans.js'

const fetchNonProductionData = (startDatetime, endDatetime, machineList) => {
  // 取得停機資料
  return new Promise((resolve, reject) => {
    servkit.ajax(
      {
        url: 'api/getdata/db',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          table: 'a_huangliang_non_production',
          whereClause:
            `(exp_time < '${endDatetime}' AND exp_edate > '${startDatetime}')` +
            ` AND machine_id IN (${machineList
              .map((id) => `'${id}'`)
              .join(', ')})`,
        }),
      },
      {
        success(data) {
          resolve(data)
        },
        fail(data) {
          reject(data)
        },
      }
    )
  })
}
const fetchProductionSchedulingData = (
  startDatetime,
  endDatetime,
  machineList
) => {
  // 取得預排資料
  return new Promise((resolve, reject) => {
    servkit.ajax(
      {
        url: 'api/getdata/db',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          table: 'a_huangliang_view_wo_list_production_scheduling',
          whereClause:
            `(exp_mdate < '${endDatetime}' AND exp_edate > '${startDatetime}')` +
            ` AND schedule_status = 0 AND machine_id IN (${machineList
              .map((id) => `'${id}'`)
              .join(', ')})`,
        }),
      },
      {
        success(data) {
          resolve(data)
        },
        fail(data) {
          reject(data)
        },
      }
    )
  })
}
const fetchWoMStatusData = (startDatetime, endDatetime, machineList) => {
  // 取得機台派工狀態
  return new Promise((resolve, reject) => {
    servkit.ajax(
      {
        url: 'api/getdata/db',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          table: 'a_huangliang_view_wo_m_status_wo_list',
          whereClause:
            `(exp_mdate < '${endDatetime}' AND exp_edate > '${startDatetime}')` +
            ` AND w_m_status<>99 AND machine_id IN (${machineList
              .map((id) => `'${id}'`)
              .join(', ')})`,
        }),
      },
      {
        success(data) {
          resolve(data)
        },
        fail(data) {
          reject(data)
        },
      }
    )
  })
}
const fetchPartCountFromHippo = (
  machineList,
  startDate,
  endDate,
  shiftNameList
) => {
  return new Promise((resolve) => {
    hippo
      .newSimpleExhaler()
      .space('part_count_huangliang')
      .index('machine_id', machineList)
      .index('work_shift_name', shiftNameList)
      .indexRange('date', startDate, endDate)
      .columns(
        'date',
        'employee_id',
        'work_shift_name',
        'machine_id',
        'order_id',
        'multi_process',
        'part_count',
        'maintain_partcount',
        'regulate_partcount'
      )
      .exhale(function (exhalable) {
        resolve(exhalable)
      })
  })
}
const fetchQualityExamData = (
  machineList,
  startDate,
  endDate,
  shiftNameList
) => {
  return new Promise((resolve, reject) => {
    servkit.ajax(
      {
        url: 'api/huangliang/qualityExamData/getData',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          shiftList: shiftNameList,
          machineList,
          startDate,
          endDate,
        }),
      },
      {
        success(data) {
          resolve(data)
        },
        fail(data) {
          reject(data)
        },
      }
    )
  })
}
const fetchAllScheduleData = (
  startDate,
  endDate,
  machineList,
  shiftNameList
) => {
  const startDatetime = startDate + ' 08:00:00'
  const endDatetime =
    moment(endDate).add(1, 'days').format(DATE_FORMAT) + ' 07:59:59'
  return Promise.all([
    fetchNonProductionData(startDatetime, endDatetime, machineList),
    fetchProductionSchedulingData(startDatetime, endDatetime, machineList),
    fetchWoMStatusData(startDatetime, endDatetime, machineList),
    fetchPartCountFromHippo(machineList, startDate, endDate, shiftNameList),
    fetchQualityExamData(machineList, startDate, endDate, shiftNameList),
  ])
}
const fetchStandardSecond = (productId, machineId, pgSeq) => {
  // 取得標工
  return new Promise((resolve, reject) => {
    servkit.ajax(
      {
        url: 'api/huangliangMatStock/schedule/getstdhour',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          product_id: productId,
          machine_id: machineId,
          pg_seq: pgSeq,
        }),
      },
      {
        success(response) {
          if (typeof response === 'string') {
            reject(response)
          } else {
            resolve(response)
          }
        },
      }
    )
  })
}
// API取得衝突調整後資料，只有插單需要檢查(label === 'D')
const fetchRearrangedData = (requestData, insertDataType) => {
  return new Promise((resolve) =>
    servkit.ajax(
      {
        url: `api/huangliangMatStock/scheduleSort/${insertDataType}`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(requestData),
      },
      {
        success(response) {
          resolve({
            response,
            request: requestData,
          })
        },
      }
    )
  )
}
// API取得推薦資料
const fetchRecommendData = (data) => {
  return new Promise((resolve) =>
    servkit.ajax(
      {
        url: 'api/huangliangMatStock/schedule/recommend',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
      },
      {
        success(response) {
          const buffer_time = 24
          if (response.featureList) {
            response.featureList.forEach(
              (feature) =>
                (feature.expEdate = excludeBufferTime(
                  feature.expEdate,
                  buffer_time,
                  feature.oldExpEdates
                ))
            )
          }
          resolve(response)
        },
        fail(response) {
          resolve(response)
        },
      }
    )
  )
}
// API取得檢查排程結果(含推薦，檢查單筆)
const fetchCheckResult = (requestData) => {
  return new Promise((resolve) =>
    servkit.ajax(
      {
        url: 'api/huangliangMatStock/schedule/recommend/check',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(Object.assign(requestData)),
      },
      {
        success(response) {
          const { buffer_time } = requestData
          if (response.checkResult) {
            response.checkResult.expEdate = excludeBufferTime(
              response.checkResult.expEdate,
              +buffer_time,
              response.checkResult.oldExpEdates
            )
          }
          if (response.featureList) {
            response.featureList.forEach(
              (feature) =>
                (feature.expEdate = excludeBufferTime(
                  feature.expEdate,
                  +buffer_time,
                  feature.oldExpEdates
                ))
            )
          }
          resolve(response)
        },
        fail(response) {
          resolve(response)
        },
      }
    )
  )
}
// 後端計算的結束時間會包含緩衝時間，為了跟前端邏輯一致，統一在此排除
// 並且會一一計算扣過的時間需不需要再扣休假日
const excludeBufferTime = (exp_edate, buffer_time, oldExpEdates = []) => {
  let result = moment(exp_edate)
    .subtract(buffer_time, 'hours')
    .format('YYYY-MM-DD HH:mm:ss')
  const dayOffEndTimeList = oldExpEdates
    .map((end) => ({
      start: moment(end).subtract(24, 'hours').format('YYYY-MM-DD HH:mm:ss'),
      end,
    }))
    .sort((a, b) => b.start.localeCompare(a.start))
  dayOffEndTimeList.forEach(({ start, end }) => {
    if (start < result && end >= result) {
      result = moment(result)
        .subtract(24, 'hours')
        .format('YYYY-MM-DD HH:mm:ss')
    }
  })
  return result
}
// API取得預計完工時間
const fetchEndTime = (requestData) => {
  return new Promise((resolve, reject) => {
    servkit.ajax(
      {
        url: 'api/huangliangMatStock/schedule/recommend/endtime',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(requestData),
      },
      {
        success(response) {
          resolve(response.endTime)
        },
        fail(errorMsg) {
          reject(errorMsg)
        },
      }
    )
  })
}
const fetchWoList = (requestData) => {
  return new Promise((resolve) =>
    servkit.ajax(
      {
        url: 'api/huangliangMatStock/schedule/getWoListData',
        type: 'GET',
        data: _.pick(requestData, ['start', 'end', 'productId', 'orderId']),
      },
      {
        success(response) {
          resolve(response)
        },
      }
    )
  )
}
const saveFeatureData = (featureDataList) => {
  return new Promise((resolve) =>
    servkit.ajax(
      {
        url: 'api/huangliangMatStock/schedule/recommend/feature',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(
          featureDataList.map((data) =>
            _.pick(data, [
              'machineId',
              'productId',
              'orderId',
              'expDate',
              'expMdate',
              'expEdate',
              'stdHour',
              'preQty',
              'productTimes',
              'conflictScheduleByFullQtyNum',
              'conflictScheduleByHalfQtyNum',
              'mayScheduleByCusPriority',
              'pgSeq',
              'label',
              'isSelected',
            ])
          )
        ),
      },
      {
        success(response) {
          resolve(response)
        },
      }
    )
  )
}
const saveAssignment = (requestData) => {
  return new Promise((resolve) =>
    servkit.ajax(
      {
        url: 'api/stdcrud',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(
          Object.assign(
            _.pick(requestData, [
              'order_id',
              'machine_id',
              'wo_m_time',
              'm_qty',
              'w_m_status',
              'exp_mdate',
              'exp_edate',
              'm_ptime',
              'm_usage',
              'pg_seq',
              'mat_control',
              'correction_time',
              'buffer_time',
              'create_by',
              'create_time',
              'modify_by',
              'modify_time',
              'work_by',
            ]),
            {
              tableModel:
                'com.servtech.servcloud.app.model.huangliang_matStock.WoMStatus',
            }
          )
        ),
      },
      {
        success(response) {
          resolve(response)
        },
      }
    )
  )
}
const updateScheduleStatus = (requestData) => {
  return new Promise((resolve) =>
    servkit.ajax(
      {
        url: 'api/stdcrud',
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify({
          tableModel:
            'com.servtech.servcloud.app.model.huangliang_matStock.ProductionScheduling',
          pks: {
            machine_id: requestData.machine_id,
            schedule_time: requestData.schedule_time,
            order_id: requestData.order_id,
          },
          machine_id: requestData.machine_id,
          schedule_time: requestData.schedule_time,
          order_id: requestData.order_id,
          schedule_status: requestData.schedule_status,
        }),
      },
      {
        success(response) {
          resolve(response)
        },
      }
    )
  )
}
const fetchDemoData = () => {
  return new Promise((res) =>
    servkit.ajax(
      {
        url: 'api/getdata/custParamJsonFile',
        type: 'GET',
        data: {
          filePath: 'demo.json',
        },
      },
      {
        success(data) {
          res(JSON.parse(data))
        },
      }
    )
  )
}
// 取得校車資訊
const fetchDieChangeProductData = (orderList) => {
  return new Promise((resolve, reject) => {
    hippo
      .newSimpleExhaler()
      .space('HUL_die_change_product')
      .index('order_id', orderList)
      .columns(
        'order_id',
        'multi_process',
        'machine_id',
        'macro521',
        'std_minute',
        'regulate_start',
        'regulate_end',
        'regulate_time'
      )
      .exhale(function (exhalable) {
        resolve(exhalable)
      })
  })
}
// 取得加工秒數(派工記錄數值)
const fetchJiaPeopleProduct = (orderList) => {
  return new Promise((resolve, reject) => {
    hippo
      .newSimpleExhaler()
      .space('HUL_jia_people_product')
      .index('order_id', orderList)
      .columns(
        'order_id',
        'date',
        'macro521',
        'work_shift_name',
        'machine_id',
        'care_power_millisecond',
        'care_operate_millisecond',
        'care_idle_millisecond',
        'care_partcount',
        'part_count',
        'multi_process',
        'operate_millisecond',
        'power_millisecond',
        'std_second',
        'logically_date',
        'piece_avg_minute',
        'efficiency_oee'
      )
      .exhale(function (exhalable) {
        resolve(exhalable)
      })
  })
}
// 取得不良品紀錄 (品質檢測數據)
const fetchQualityExamDataFromDB = (orderList) => {
  return new Promise((resolve, reject) => {
    servkit.ajax(
      {
        url: 'api/getdata/db',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          table: 'a_huangliang_quality_exam_data',
          whereClause: `order_id IN ('${orderList.join("','")}')`,
        }),
      },
      {
        success(data) {
          resolve(data)
        },
      }
    )
  })
}
// 取得量產刀具履歷
const fetchToolMpHistoryData = (orderId) => {
  return new Promise((resolve, reject) => {
    servkit.ajax(
      {
        url: 'api/getdata/db',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          table: 'a_huangliang_view_tool_mp_history_tool_mp_his_list',
          whereClause: `order_id='${orderId}'`,
        }),
      },
      {
        success(data) {
          resolve(data)
        },
      }
    )
  })
}
const fetchJiaQualityProduct = (orderList) => {
  return new Promise((resolve) => {
    hippo
      .newSimpleExhaler()
      .space('HUL_jia_quality_product')
      .index('order_id', orderList)
      .columns('order_id', 'date', 'work_shift_name')
      .exhale(function (exhalable) {
        resolve(exhalable)
      })
  })
}
const fetchProductProfile = (productId) => {
  return new Promise((resolve) => {
    servkit.ajax(
      {
        url: 'api/getdata/db',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          table: 'a_huangliang_product_profile',
          columns: ['product_pid'],
          whereClause: `product_id='${productId}'`,
        }),
      },
      {
        success(data) {
          resolve(data)
        },
      }
    )
  })
}
const fetchToolSpHistoryData = (productPidList) => {
  return new Promise((resolve) =>
    servkit.ajax(
      {
        url: 'api/getdata/db',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          table: 'a_huangliang_view_tool_sp_history_tool_sp_his_list',
          whereClause: `sample_pid in ('${productPidList.join(
            "','"
          )}') AND status = 0`,
        }),
      },
      {
        success(data) {
          resolve(data)
        },
      }
    )
  )
}
// const fetchMatUsage = (productId) => {
//   return fetchProductProfile(productId)
//     .then(dataList => _.pluck(dataList, 'm_usage')[0])
// }

export {
  fetchNonProductionData,
  fetchProductionSchedulingData,
  fetchWoMStatusData,
  fetchPartCountFromHippo,
  fetchQualityExamData,
  fetchAllScheduleData,
  fetchStandardSecond,
  fetchRearrangedData,
  fetchRecommendData,
  fetchCheckResult,
  fetchEndTime,
  fetchWoList,
  fetchDemoData,
  saveFeatureData,
  saveAssignment,
  updateScheduleStatus,
  fetchDieChangeProductData,
  fetchJiaPeopleProduct,
  fetchQualityExamDataFromDB,
  fetchToolMpHistoryData,
  fetchJiaQualityProduct,
  fetchProductProfile,
  fetchToolSpHistoryData,
}
