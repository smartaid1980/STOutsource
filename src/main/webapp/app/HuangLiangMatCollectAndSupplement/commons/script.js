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
  item_status: {
    0: '開立',
    1: '派工中',
    2: '已移出',
    3: '已移入',
    9: '已完成',
    99: '取消',
  },
}
const mstockNameMap = {
  G: 'GOLF',
  M: '五金',
}
const matAssignmentTypeMap = {
  1: '領料',
  2: '補料',
  3: '退庫',
}

exports.statusMap = statusMap
exports.matAssignmentTypeMap = matAssignmentTypeMap
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
exports.autoCompleteProductPid = ($input) => {
  return new Promise((res) => {
    if (productProfile) {
      $input.autocomplete({
        source: productProfile.productPids,
        minLength,
      })
      res()
    } else {
      getProductProfile().then(() => {
        $input.autocomplete({
          source: productProfile.productPids,
          minLength,
        })
        res()
      })
    }
  })
}
exports.autoCompleteOrderId = ($input) => {
  return new Promise((res) => {
    if (orderList) {
      $input.autocomplete({
        source: orderList,
        minLength,
      })
      res()
    } else {
      getOrderList().then(() => {
        $input.autocomplete({
          source: orderList,
          minLength,
        })
        res()
      })
    }
  })
}
