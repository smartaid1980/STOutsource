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

exports.getDateData = function (macro523List) {
  return new Promise(function (resolve) {
    hippo
      .newSimpleExhaler()
      .space('HUL_cost_count_map')
      .index('order_id', macro523List)
      .columns('order_id', 'machine_id', 'date')
      .exhale(function (data) {
        resolve(data.exhalable)
      })
  })
}
