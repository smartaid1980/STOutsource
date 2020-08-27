export default function () {
  ;(function () {
    var machineIdName,
      rawData,
      rawDataIndex,
      $table = $('#adapter-param-table')

    servkit
      .getdata()
      .withSource('db')
      .withDataName('m_device')
      .addColumn(['A', 'B'])
      .get(function (data) {
        machineIdName = _.sortBy(data, function (ele) {
          return ele[0]
        })
        var withPercentage = 80 / machineIdName.length
        var machineNameHead = _.reduce(
          machineIdName,
          function (result, ele) {
            return (
              result +
              '<th style="text-align: center;width: ' +
              withPercentage +
              '%;">' +
              ele[1] +
              '</th>'
            )
          },
          ''
        )
        $table.find('thead tr').append(machineNameHead)
      })

    servkit
      .getdata()
      .withSource('file')
      .withDataName('device_raw_data_index')
      .withPathPattern('{filename}')
      .withPathParameter({
        filename: 'index.csv',
      })
      .get(function (data) {
        rawDataIndex = _.reduce(
          data,
          function (result, ele) {
            result[ele[1]] = parseInt(ele[0])
            return result
          },
          {}
        )
      })

    $.ajax({
      type: 'POST',
      url: 'module.data.RawDataAction.do?method:getLatestDatas',
      dataType: 'json',
    }).done(function (data) {
      rawData = _.mapObject(JSON.parse(data).data, function (val, key) {
        return val.split('|')
      })
    })

    var checkInterval = setInterval(function () {
      if (!machineIdName || !rawData || !rawDataIndex) {
        return
      }
      clearInterval(checkInterval)

      _.each(machineIdName, function (ele) {
        var machineId = ele[0]

        $table.find('tbody tr').append(function (i, html) {
          var tdContent = rawData[machineId][rawDataIndex[i]] || ''
          return '<td style="text-align: center;">' + tdContent + '</td>'
        })
      })

      $('#loading-hint').hide()
    }, 500)
  })()
}
