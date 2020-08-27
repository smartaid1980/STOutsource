// 儲存位置 模糊查詢
exports.initLocationAutoComplete = function ($input) {
  servkit.ajax(
    {
      url: servkit.rootPath + '/api/getdata/db',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        table: 'a_huangliang_tool_location',
        columns: ['tool_location'],
      }),
    },
    {
      success: function (data) {
        $input.autocomplete({
          source: _.chain(data).pluck('tool_location').uniq().value().sort(),
        })
      },
      fail: function (data) {
        console.log(data)
      },
    }
  )
}

// 刀具類型 模糊查詢
exports.initToolTypeAutoComplete = function ($input) {
  servkit.ajax(
    {
      url: servkit.rootPath + '/api/getdata/db',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        table: 'a_huangliang_tool_type',
        columns: ['tool_type'],
      }),
    },
    {
      success: function (data) {
        $input.autocomplete({
          source: _.chain(data).pluck('tool_type').uniq().value().sort(),
        })
      },
      fail: function (data) {
        console.log(data)
      },
    }
  )
}

// 刀具編碼 模糊查詢
exports.initToolTypeAutoComplete = function ($input) {
  servkit.ajax(
    {
      url: servkit.rootPath + '/api/getdata/db',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        table: 'a_huangliang_tool_profile',
        columns: ['tool_id'],
      }),
    },
    {
      success: function (data) {
        $input.autocomplete({
          source: _.chain(data).pluck('tool_id').uniq().value().sort(),
        })
      },
      fail: function (data) {
        console.log(data)
      },
    }
  )
}
