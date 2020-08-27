let productProfile
let orderList
const minLength = 3
const processData = (data, column) => {
  return _.chain(data).pluck(column).uniq().value().sort()
}
const getProductProfile = () => {
  return new Promise((res) => {
    servkit.ajax(
      {
        url: 'api/getdata/db',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          table: 'a_huangliang_product_profile',
          columns: ['product_id', 'product_pid'],
        }),
      },
      {
        success(data) {
          const productIds = processData(data, 'product_id')
          const productPids = processData(data, 'product_pid')
          productProfile = {
            productIds,
            productPids,
          }
          res()
        },
      }
    )
  })
}
const getOrderList = () => {
  return new Promise((res) => {
    servkit.ajax(
      {
        url: 'api/getdata/db',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          table: 'a_huangliang_wo_list',
          columns: ['order_id'],
        }),
      },
      {
        success(data) {
          orderList = processData(data, 'order_id')
          res()
        },
      }
    )
  })
}
const statusMap = {
  wo_status: {
    0: '開立',
    1: '派工待生產',
    2: '生產中',
    9: '結案',
    99: '取消',
  },
  w_p_status: {
    0: '解除綁定',
    1: '綁定',
  },
  w_m_status: {
    0: '開立',
    1: '生產中',
    9: '結案',
    99: '取消',
  },
  m_mat_status: {
    0: '開立',
    1: '派工中',
    2: '移料中',
    3: '移料待審',
    9: '已完成',
    99: '取消',
  },
  tempStockMaterial: {
    0: '保留',
    1: '待驗料',
    2: '待入庫',
    3: '待退料',
    4: '已入庫',
    5: '已退料',
  },
  schedule_status: {
    0: '開立',
    1: '確認派工',
    99: '取消',
  },
}
const mstockNameMap = {
  G: 'GOLF',
  M: '五金',
}

exports.statusMap = statusMap
exports.mstockNameMap = mstockNameMap
exports.autoCompleteProductId = ($input) => {
  return new Promise((res) => {
    if (productProfile) {
      $input.autocomplete({
        source: productProfile.productIds,
        minLength,
      })
      res()
    } else {
      getProductProfile().then(() => {
        $input.autocomplete({
          source: productProfile.productIds,
          minLength,
        })
        res()
      })
    }
  })
}
exports.autoCompleteProductPid = ($input, config) => {
  return new Promise((res) => {
    if (productProfile) {
      $input.autocomplete(
        _.extend(
          {
            source: productProfile.productPids,
            minLength,
          },
          config
        )
      )
      res()
    } else {
      getProductProfile().then(() => {
        $input.autocomplete(
          _.extend(
            {
              source: productProfile.productPids,
              minLength,
            },
            config
          )
        )
        res()
      })
    }
  })
}
exports.autoCompleteOrderId = ($input, config) => {
  return new Promise((res) => {
    if (orderList) {
      $input.autocomplete(
        _.extend(
          {
            source: orderList,
            minLength,
          },
          config
        )
      )
      res()
    } else {
      getOrderList().then(() => {
        $input.autocomplete(
          _.extend(
            {
              source: orderList,
              minLength,
            },
            config
          )
        )
        res()
      })
    }
  })
}

exports.getMacro523ByOrderIdOrSampleId = function (
  orderId,
  sampleId,
  OrderList,
  SampleList,
  isDuplicateWithoutN7
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

    //TODO: 之後開始填n7的話就不幫他防呆macro523沒填G或M的情況
    if (isDuplicateWithoutN7) {
      _.each(orderObjList, function (elem) {
        var copy = _.extend({}, elem)
        copy.macro523 = copy.macro523.replace('M', '').replace('G', '')
        orderObjList.push(copy)
      })
    }

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

    //TODO: 之後開始填n7的話就不幫他防呆macro523沒填G或M的情況
    if (isDuplicateWithoutN7) {
      _.each(result, function (elem) {
        var copy = _.extend({}, elem)
        copy.macro523 = copy.macro523.replace('M', '').replace('G', '')
        result.push(copy)
      })
    }

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
    //TODO: 之後開始填n7的話就不幫他防呆沒填G或M的情況
    if (isDuplicateWithoutN7) {
      _.each(result, function (elem) {
        var copy = _.extend({}, elem)
        copy.macro523 = copy.macro523.replace('M', '').replace('G', '')
        result.push(copy)
      })
    }

    if (result.length == 0) {
      result.push({ macro523: sampleId })
    }
  }

  return result
}
