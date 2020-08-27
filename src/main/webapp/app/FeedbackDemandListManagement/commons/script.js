exports.getGroupData = (function () {
  return function (done) {
    servkit.ajax(
      {
        url: 'api/sysgroup/read',
        type: 'GET',
      },
      {
        success: function (data) {
          var groupList = JSON.parse(window.sessionStorage.getItem('loginInfo'))
            .user_group
          var groupAuthData = {
            supplireGroup: {},
            group: {},
            auth: {},
          }

          _.each(data, (val) => {
            if (
              _.find(val.sys_auths, (auth) => {
                return auth.auth_id === 'supplier_auth'
              })
            ) {
              groupAuthData.supplireGroup[val.group_id] = val.group_name
            } else if (
              _.find(val.sys_auths, (auth) => {
                return auth.auth_id === 'standard_auth'
              })
            ) {
              groupAuthData.group[val.group_id] = val.group_name
            }
            if (
              _.find(groupList, (elem) => {
                return elem === val.group_id
              })
            ) {
              _.each(val.sys_auths, (auth) => {
                if (auth.auth_id.indexOf('@st@') >= 0) {
                  // 有無最高權限
                  groupAuthData.auth.isHighest = auth
                } else if (auth.auth_id === 'supplier_auth') {
                  // 有無供應商權限
                  groupAuthData.auth.isSupplier = auth
                } else if (auth.auth_id === 'confidential_auth') {
                  // 有無機密權限
                  groupAuthData.auth.isConfidential = auth
                } else if (auth.auth_id === 'quotation_auth') {
                  // 有無報價權限(採購群組)
                  groupAuthData.auth.isPurchase = auth
                }
              })
            }
          })
          done(groupAuthData)
        },
      }
    )
  }
})()
