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
//超級管理員群組
exports.sys_super_admin_group = 'sys_super_admin_group'
//廠長群組
exports.factory_manager = 'factory_manager'

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

exports.fillZeroTo5Digit = function (userId) {
  if (!_.isNaN(parseInt(userId))) {
    while (userId.length < 5) {
      userId = '0' + userId
    }
  }
  return userId
}

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

exports.getOrderId = function (n7M523, productList) {
  //  var Gn7M523 = n7M523;
  //  //沒有填來源的話就幫他腦補預設訂單位於GOLF
  //  if (!n7M523.startsWith("G") && !n7M523.startsWith("M")) {
  //    Gn7M523 = "G" + n7M523;
  //  }
  var productObj = _.find(productList, function (obj) {
    return (
      obj.macro523 == n7M523 ||
      obj.macro523 == 'G' + n7M523 ||
      obj.macro523 == 'M' + n7M523
    )
  })
  //腦補了還是找不到訂單的話就只回傳沒腦捕前的值
  return productObj ? productObj.order_id : n7M523
}

exports.getMultiProcess = function (multiProcess) {
  if (multiProcess == '---') {
    return multiProcess
  } else if (multiProcess == 1 || multiProcess.toString().charAt(0) == 1) {
    //計算程是有的有處理有的沒處理  所以我這邊都還是處理一下好了
    return ''
  } else {
    return multiProcess.toString().charAt(0) + '次製程'
  }
}

exports.getUserName = function (userGroupList, macro521) {
  while (macro521.length < 5) {
    macro521 = '0' + macro521
  }
  return userGroupList[macro521] || macro521
}
