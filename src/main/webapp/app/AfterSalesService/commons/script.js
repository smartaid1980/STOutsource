/*向DB拿資料，拿到之後存在 util 的 getDBObject 內，key 為 config 的 objKey 
 如果有callback 就 一併執行
*/
exports.getDataFromDB = function (config, callback) {
  var that = this
  var getData
  $.ajax({
    url: servkit.rootPath + '/api/getdata/db',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({
      table: config.tableName,
      columns: config.columns,
    }),
  }).done(function (data) {
    if (data.type === 0) {
      getData = data.data
    }
  })
  servkit
    .politeCheck()
    .until(function () {
      return getData
    })
    .thenDo(function () {
      that.getDBObject[config.objKey] = getData
      callback && typeof callback === 'function' && callback()
    })
    .tryDuration(0)
    .start()
}

exports.drawChart = function ($chartEle, config) {
  var dataList = config.dataList,
    barValueIndex = config.barValueIndex,
    xAxisLabelValueIndex = config.xAxisLabelValueIndex,
    yAxisLabel = config.yAxisLabel

  if (!dataList || dataList.length === 0) {
    return
  }

  var chartDatas = _.map(barValueIndex, function (barIndex, barI) {
    return {
      data: _.map(dataList, function (row, i) {
        return [i, row[barIndex].percentageToFloat()]
      }),
      bars: {
        align: 'center',
        show: true,
        barWidth: 0.2,
        order: barI + 1,
      },
    }
  })

  $.plot($chartEle, chartDatas, {
    colors: [servkit.colors.green, servkit.colors.blue, servkit.colors.orange],
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
      content: "<b style='display:none;'>%x</b><span>%y.2%</span>",
      defaultTheme: false,
    },
  })
}
