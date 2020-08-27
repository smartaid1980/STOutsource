//廠務助理
exports.factory_service_assistant = 'factory_service_assistant'
//廠務部副理群組
exports.factory_service_deputy_manager = 'factory_service_deputy_manager'
//廠務校車群組
exports.factory_service_regulate = 'factory_service_regulate'
//組長
exports.leader = 'leader'
//管理部助理
exports.management_assistant = 'management_assistant'
//製一副課長群組
exports.process_deputy_manager_1 = 'process_deputy_manager_1'
//製二副課長群組
exports.process_deputy_manager_2 = 'process_deputy_manager_2'
//製一課長群組
exports.process_manager_1 = 'process_manager_1'
//製二課長群組
exports.process_manager_2 = 'process_manager_2'
//研發副課長群組
exports.rd_deputy_manager = 'rd_deputy_manager'
//研發副理群組
exports.rd_manager = 'rd_manager'
//研發校車
exports.rd_regulate = 'rd_regulate'
//維修人員
exports.repair = 'repair'
//業務副課長群組
exports.sales_deputy_manager = 'sales_deputy_manager'
//業務副理群組
exports.sales_manager = 'sales_manager'
//高階主管群組
exports.top_manager = 'top_manager'
//系統管理員群組
exports.sys_manager_group = 'sys_manager_group'
//廠長群組
exports.factory_manager = 'factory_manager'

// 將 utilization_time_work_shift 和 part_count_merged 混搭出來的資料整理成「日期」報表
exports.composeDayReport = function (
  startDate,
  endDate,
  machineList,
  callback,
  cbincb
) {
  hippo
    .newSimpleExhaler()
    .space('huangliang_utilization_time_work_shift')
    .index('machine_id', machineList)
    .indexRange('date', startDate, endDate)
    .columns(
      'machine_id',
      'date',
      'work_shift_name',
      'power_millisecond',
      'operate_millisecond',
      'cutting_millisecond',
      'downtime_millisecond',
      'offline_millisecond',
      'work_shift_millisecond'
    )
    .exhale(function (exhalable) {
      if (cbincb) callback(exhalable, cbincb)
      else callback(exhalable)
    })
}

exports.composeDayReportCallBack = function (exhalable, callback) {
  var resultGroups = {}
  exhalable.each(function (timeData, groupKeys) {
    var groupKey = timeData.machine_id + timeData.date,
      resultGroup = resultGroups[groupKey]

    if (resultGroup) {
      resultGroup.power_millisecond += timeData.power_millisecond
      resultGroup.operate_millisecond += timeData.operate_millisecond
      resultGroup.cutting_millisecond += timeData.cutting_millisecond
      resultGroup.downtime_millisecond += timeData.downtime_millisecond
      resultGroup.offline_millisecond += timeData.offline_millisecond
      resultGroup.work_shift_millisecond += timeData.work_shift_millisecond
    } else {
      resultGroup = _.pick(
        timeData,
        'machine_id',
        'date',
        'power_millisecond',
        'operate_millisecond',
        'cutting_millisecond',
        'downtime_millisecond',
        'offline_millisecond',
        'work_shift_millisecond'
      )
      resultGroups[groupKey] = resultGroup
    }
  })

  var result = _.chain(resultGroups)
    .values()
    .map(function (timeData) {
      timeData = millisecondExcludMillisecond(timeData)

      return [
        servkit.getMachineName(timeData.machine_id),
        timeData.date.date8BitsToSlashed(),
        timeData.power_millisecond.millisecondToHHmmss(),
        timeData.operate_millisecond.millisecondToHHmmss(),
        timeData.cutting_millisecond.millisecondToHHmmss(),
        timeData.downtime_millisecond.millisecondToHHmmss(),
        (
          timeData.cutting_millisecond / timeData.operate_millisecond
        ).floatToPercentage(),
        (
          timeData.operate_millisecond / getDenominator(timeData)
        ).floatToPercentage(),
        (
          timeData.cutting_millisecond / getDenominator(timeData)
        ).floatToPercentage(),
      ]
    })
    .value()

  callback(result)
}

function timeDataNormalize(millisecond) {
  return parseInt(millisecond / 1000) * 1000
}

function millisecondExcludMillisecond(timeData) {
  timeData.power_millisecond = timeDataNormalize(timeData.power_millisecond)
  timeData.operate_millisecond = timeDataNormalize(timeData.operate_millisecond)
  timeData.cutting_millisecond = timeDataNormalize(timeData.cutting_millisecond)
  timeData.downtime_millisecond = timeDataNormalize(
    timeData.downtime_millisecond
  )
  timeData.offline_millisecond = timeDataNormalize(timeData.offline_millisecond)
  timeData.work_shift_millisecond = timeDataNormalize(
    timeData.work_shift_millisecond
  )
  return timeData
}

exports.millisecondExcludMillisecond = function (timeData) {
  return millisecondExcludMillisecond(timeData)
}

function getDenominator(timeData) {
  var denominator = $('input[name="denominator"]:checked').val()
  switch (denominator) {
    case 'power_millisecond':
      return timeData.power_millisecond
    case 'natural_day':
      return 24 * 60 * 60 * 1000
    default:
      return timeData.work_shift_millisecond
  }
}

exports.getDenominator = function (timeData) {
  return getDenominator(timeData)
}

exports.drawChart = function ($chartEle, config) {
  var dataList = config.dataList,
    barValueIndex = config.barValueIndex,
    xAxisLabelValueIndex = config.xAxisLabelValueIndex,
    yAxisLabel = config.yAxisLabel,
    label = config.label

  if (!dataList || dataList.length === 0) {
    return
  }

  var chartDatas = _.map(barValueIndex, function (barIndex, barI) {
    return {
      data: _.map(dataList, function (row, i) {
        return [i, row[barIndex].percentageToFloat()]
      }),
      label: label[barI],
      bars: {
        show: true,
        barWidth: 0.2,
        order: barI + 1,
      },
    }
  })

  $.plot($chartEle, chartDatas, {
    colors: [servkit.colors.blue, servkit.colors.green, servkit.colors.orange],
    grid: {
      show: true,
      hoverable: true,
      clickable: true,
      tickColor: '#EFEFEF',
      borderWidth: 0,
      borderColor: '#EFEFEF',
    },
    xaxis: {
      ticks: function () {
        return _.map(dataList, function (ele, i) {
          var tick = _.map(xAxisLabelValueIndex, function (index) {
            return ele[index]
          }).join('</br>')
          return [i, tick]
        })
      },
    },
    yaxis: {
      min: 0,
      max: 100,
      axisLabel: yAxisLabel,
      axisLabelFontSizePixels: 12,
      axisLabelFontFamily: 'Open Sans',
    },
    legend: true,
    tooltip: true,
    tooltipOpts: {
      content: "<b style='display:none;'>%x</b><span>%s:%y.2%</span>",
      defaultTheme: false,
    },
  })
}

exports.getShiftList = (function () {
  var cachedShift
  return function (done) {
    if (cachedShift) {
      done(cachedShift)
    } else {
      servkit.ajax(
        {
          url: 'api/workshift/today',
          type: 'GET',
          contentType: 'application/json',
        },
        {
          success: function (data) {
            cachedShift = {}
            _.each(_.sortBy(data, 'sequence'), function (elem) {
              cachedShift[elem.name] = elem.name
            })
            done(cachedShift)
          },
        }
      )
    }
  }
})()

exports.getDowntimeCode = (function () {
  var cachedDowntimeCode
  return function (done) {
    if (cachedDowntimeCode) {
      done(cachedDowntimeCode)
    } else {
      servkit.ajax(
        {
          url: 'api/getdata/db',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
            table: 'a_huangliang_downtime_code',
            columns: ['downtime_code', 'downtime_code_name'],
          }),
        },
        {
          success: function (data) {
            cachedDowntimeCode = {}
            _.each(data, function (elem) {
              cachedDowntimeCode[elem.downtime_code] = elem.downtime_code_name
            })
            done(cachedDowntimeCode)
          },
        }
      )
    }
  }
})()

exports.getUserListByGroup = (function () {
  var cachedEmployee
  //校車人員 = 研發主管(甘副理)、研發校車人員名單、廠務校車人員名單、廠務主管(廠長、義副理、立副理、林課長、製一課副課長、製二課副課長)
  var regulate = [
    exports.rd_manager, //研發主管(甘副理)
    exports.rd_regulate, //研發校車人員名單
    exports.factory_service_regulate, //廠務校車人員名單
    exports.factory_manager, //廠長
    exports.factory_service_deputy_manager, //廠務部副理(義副理、立副理)
    exports.process_manager_1, //製一課課長(林課長)
    exports.process_manager_2, //製二課課長(林課長)
    exports.process_deputy_manager_1, //製一課副課長
    exports.process_deputy_manager_2, //製二課副課長
  ]
  //維修人員 = 維修人員名單、研發主管(甘副理)
  var maintain = [
    exports.repair,
    exports.rd_manager, //研發主管(甘副理)
  ]

  return function (done) {
    if (cachedEmployee) {
      done(cachedEmployee)
    } else {
      hippo
        .newSimpleExhaler()
        .space('HUL_care_employees')
        .index('customer_id', ['HuangLiang'])
        .columns('employee_id', 'employee_name')
        .exhale(function (exhalable) {
          cachedEmployee = {}
          cachedEmployee.all = {}
          cachedEmployee.care = {}
          _.each(exhalable.exhalable, function (elem) {
            cachedEmployee.care[elem.employee_id] = elem.employee_name
            cachedEmployee.all[elem.employee_id] = elem.employee_name
          })
        })

      servkit.ajax(
        {
          url: 'api/user/read',
          type: 'GET',
          contentType: 'application/json',
        },
        {
          success: function (data) {
            servkit
              .politeCheck()
              .until(function () {
                return cachedEmployee
              })
              .thenDo(function () {
                cachedEmployee.regulate = {}
                cachedEmployee.maintain = {}
                _.each(data, function (sysUser) {
                  var userGroup = _.pluck(sysUser.sys_groups, 'group_id')
                  if (_.intersection(userGroup, regulate).length) {
                    cachedEmployee.regulate[sysUser.user_id] = sysUser.user_name
                    cachedEmployee.all[sysUser.user_id] = sysUser.user_name
                  }
                  if (_.intersection(userGroup, maintain).length) {
                    cachedEmployee.maintain[sysUser.user_id] = sysUser.user_name
                    cachedEmployee.all[sysUser.user_id] = sysUser.user_name
                  }
                })
                done(cachedEmployee)
              })
              .tryDuration(0)
              .start()
          },
        }
      )
    }
  }
})()

exports.getUserList = (function () {
  var cachedUser
  return function (done) {
    if (cachedUser) {
      done(cachedUser)
    } else {
      hippo
        .newSimpleExhaler()
        .space('HUL_care_employees')
        .index('customer_id', ['HuangLiang'])
        .columns('employee_id', 'employee_name')
        .exhale(function (exhalable) {
          cachedUser = {}
          _.each(exhalable.exhalable, function (elem) {
            cachedUser[elem.employee_id] = elem.employee_name
          })
        })

      servkit.ajax(
        {
          url: 'api/user/read',
          type: 'GET',
          contentType: 'application/json',
        },
        {
          success: function (data) {
            servkit
              .politeCheck()
              .until(function () {
                return cachedUser
              })
              .thenDo(function () {
                _.each(data, function (sysUser) {
                  cachedUser[sysUser.user_id] = sysUser.user_name
                })
                done(cachedUser)
              })
              .tryDuration(0)
              .start()
          },
        }
      )
    }
  }
})()

exports.initOrderSampleAutocomplete = function (
  $orderId,
  $sampleId,
  orderList,
  sampleList
) {
  if ($orderId) {
    $orderId.autocomplete({
      source: _.pluck(orderList, 'order_id'),
    })
  }

  if ($sampleId) {
    //所有管編(訂單的標準型號跟樣品的管編)
    var sampleIdList = _.pluck(sampleList, 'sample_id')
    sampleIdList = _.uniq(
      sampleIdList.concat(_.pluck(orderList, 'standard_id'))
    )
    $sampleId.autocomplete({
      source: sampleIdList,
    })
  }

  //  $productId.on('focus', function () {
  //    var productId = $productId.val();
  //    if (productMap[productId]) {//如果產品存在
  //      $sampleId.autocomplete({
  //        source: productMap[productId][0].standard_id
  //      });
  //    } else if ($productId.val()) { //產品不存在 但有輸入查詢值
  //      $sampleId.autocomplete("destroy");
  //    }
  //  });
  //
  //  $sampleId.on('focus', function () {
  //    var sample = $sampleId.val();
  //    if (sampleMap[sample]) {//如果該管編有所屬的訂單存在
  //      $productId.autocomplete({
  //        source: _.map(sampleMap[sample], function(productObj){
  //          return productObj.order_id;
  //        })
  //      });
  //    } else if (sample) { //該管編沒有所屬的訂單存在 但有輸入查詢值
  //      $productId.autocomplete("destroy");
  //    }
  //  });
}

exports.fillZeroTo5Digit = function (userId) {
  if (!_.isNaN(parseInt(userId))) {
    while (userId.length < 5) {
      userId = '0' + userId
    }
  }
  return userId
}
exports.getProductList = (function () {
  var productCache
  return function (done) {
    if (productCache) {
      done(productCache)
    } else {
      servkit.ajax(
        {
          url: 'api/huangliang/product/get',
          contentType: 'application/json',
          type: 'GET',
        },
        {
          success: function (data) {
            productCache = data
            done(productCache)
          },
        }
      )
    }
  }
})()

exports.getSampleList = (function () {
  var sampleCache
  return function (done) {
    if (sampleCache) {
      done(sampleCache)
    } else {
      servkit.ajax(
        {
          url: 'api/huangliang/sample/get',
          contentType: 'application/json',
          type: 'GET',
        },
        {
          success: function (data) {
            sampleCache = data
            done(sampleCache)
          },
        }
      )
    }
  }
})()

//計算程式或DB的orderId轉成fullname
exports.getOrderIdOrSampleId = function (orderList, sampleList, macro523) {
  var result =
    macro523.split('.')[0].length == 3
      ? {
          order_id: '',
          sample_id: macro523,
        }
      : {
          order_id: macro523,
          sample_id: '---',
        }

  //訂單
  if (orderList[macro523]) {
    result.order_id = orderList[macro523][0].order_id
    result.sample_id = orderList[macro523][0].standard_id
  } //樣品
  else if (sampleList[macro523]) {
    result.order_id = ''
    result.sample_id = sampleList[macro523][0].sample_id
    result.customer_id = sampleList[macro523][0].customer_id
  } //沒填G的訂單
  else if (orderList['G' + macro523]) {
    result.order_id = orderList['G' + macro523][0].order_id
    result.sample_id = orderList['G' + macro523][0].standard_id
  } //沒填M的訂單
  else if (orderList['M' + macro523]) {
    result.order_id = orderList['M' + macro523][0].order_id
    result.sample_id = orderList['M' + macro523][0].standard_id
  } //沒填G的樣品
  else if (sampleList['G' + macro523]) {
    result.order_id = ''
    result.sample_id = sampleList['G' + macro523][0].sample_id
    result.customer_id = sampleList['G' + macro523][0].customer_id
  } //沒填M的樣品
  else if (sampleList['M' + macro523]) {
    result.order_id = ''
    result.sample_id = sampleList['M' + macro523][0].sample_id
    result.customer_id = sampleList['M' + macro523][0].customer_id
  }

  return result
}

exports.getMultiProcess = function (multiProcess) {
  if (multiProcess == '---') {
    return multiProcess
  } else if (
    multiProcess == 1 ||
    multiProcess == 0 ||
    multiProcess.toString().charAt(0) == 1
  ) {
    //計算程是有的有處理有的沒處理  所以我這邊都還是處理一下好了
    return ''
  } else {
    return multiProcess.toString().charAt(0) + '次製程'
  }
}

exports.getMacro523ByOrderIdOrSampleId = function (
  orderId,
  sampleId,
  OrderList,
  SampleList
) {
  /* OrderList
   [
     {
       "macro523": "G50105.001",
       "order_id": "GM150105001",
       "customer_id": "",
       "customer_name": "",
       "standard_id": "20S0002-00-00",
       "product_name": "MSC-778 Bolt螺絲",
       "quantity": "300.0",
       "quantity_undelivered": "-326"
     }, ...
   ]
   * */
  var result = []
  var orderObjList = []

  //如果兩個都有填的話就當作他要查特定這張單這個管編而已，不幫他找同管編的其他單
  if (orderId && sampleId) {
    orderObjList = _.filter(OrderList, function (orderObj) {
      return orderObj.order_id == orderId && orderObj.standard_id == sampleId
    })

    result = orderObjList
    if (result.length == 0) {
      result.push({ macro523: orderId })
    }
  } else if (orderId) {
    //使用者下的查詢條件要跟他上傳的ERP資料一致
    orderObjList = _.filter(OrderList, function (orderObj) {
      return orderObj.order_id == orderId
    })
    if (orderObjList.length > 1) {
      console.warn('訂單竟然有兩筆一樣的??')
    }

    //同管編的訂單
    var manageIdList = _.uniq(_.pluck(orderObjList, 'standard_id'))
    result = _.filter(OrderList, function (orderObj) {
      return _.contains(manageIdList, orderObj.standard_id)
    })

    if (result.length == 0) {
      result.push({ macro523: orderId })
    }
  } else if (sampleId) {
    //同管編的樣品
    result = _.filter(SampleList, function (sampleObj) {
      return sampleObj.sample_id == sampleId
    })
    //再加上同管編的訂單
    result = result.concat(
      _.filter(OrderList, function (orderObj) {
        return orderObj.standard_id == sampleId
      })
    )

    if (result.length == 0) {
      result.push({ macro523: sampleId })
    }
  }

  return result
}

exports.addAlertHtml = function (text) {
  var $alertDiv = $('#table').closest('.widget-body').find('.alert-warning')
  if ($alertDiv.length > 0) {
    $alertDiv.html(text)
  } else {
    $('#table')
      .closest('.widget-body')
      .prepend('<div class="alert alert-warning font-lg">' + text + '</div>')
  }
}

exports.testMachineBtn = function () {
  var $machineSelect = $('select[id=machine]')
  if ($machineSelect.length && !$('#testMachineBtn').length) {
    var $testMachineBtn = $(
      '<button id="testMachineBtn" class="btn btn-success">查詢測試機台資料</button>'
    )

    $testMachineBtn.on('click', function (e) {
      e.preventDefault()
      $machineSelect.val([
        //訂單測試機台
        //        "_HULPLATFORM01D01M93",
        //        "_HULPLATFORM01D01M85",
        //        "_HULPLATFORM01D01M78",
        //        "_HULPLATFORM01D01M62",
        //        "_HULPLATFORM01D01M28",
        //        "_HULPLATFORM01D01M47",
        '_HULPLATFORM01D01M99',
        '_HULPLATFORM01D01M107',
        //樣品測試機台
        //        "_HULPLATFORM01D01M126",
        //        "_HULPLATFORM01D01M125",
        //        "_HULPLATFORM01D01M116",
        //        "_HULPLATFORM01D01M113"
        '_HULPLATFORM01D01M113',
      ])

      $('#submit-btn').click()
    })

    $('#submit-btn').after($testMachineBtn)
  }
}

exports.getOrderId = function (n7M523, productList) {
  var productObj = _.find(productList, function (obj) {
    return (
      obj.macro523 == n7M523 ||
      obj.macro523 == 'G' + n7M523 ||
      obj.macro523 == 'M' + n7M523
    )
  })
  return productObj ? productObj.order_id : n7M523
}

exports.getUserName = function (userList, macro521) {
  while (macro521.length < 5) {
    macro521 = '0' + macro521
  }
  return userList[macro521] || macro521
}
