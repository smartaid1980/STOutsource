// data = {
//   "timestamp": "2018/05/02 12:25:21",
//   "type": "punch0001",
//   "status": "11",
//   "working_time": 7550000,
//   "temperature_probe": 22,
//   "current": -0.3,
//   "light1": "on",
//   "light1_on_times": 12,
//   "light2": "off",
//   "light2_last_on": "2018/05/02 12:24:33",
//   "light3": "on",
//   "light3_last_on": "2018/05/02 12:24:33"
// }
exports.transformMachineData = function (data, paramConfig) {
  return _.mapObject(data, function (value, key) {
    var result = _.extend({}, paramConfig[data.type][key])
    if (data.type === 'punch0001' && paramConfig['punch0001']) {
      result.txtColor = ''
      try {
        if (
          (result.max && Number(result.max) < Number(value)) ||
          (result.min && Number(result.min) > Number(value))
        ) {
          result.txtColor = 'txt-color-red'
        } else {
          result.txtColor = 'txt-color-green'
        }

        switch (key) {
          case 'timestamp':
            result.value = moment(value, 'YYYYMMDDHHmmss').format(
              'YYYY/MM/DD HH:mm:ss'
            )
            break
          case 'status':
            result.value = servkit.getMachineLightName(value)
            break
          case 'working_time': // 沖壓機今日作業時間 (m
            result.value =
              moment
                .utc(value)
                .format('HH:mm:ss')
                .replace(':', ' H ')
                .replace(':', ' M ') + ' S'
            break
          case 'temperature_probe': //
            result.value = Number(value).toFixed(2) + ' °C'
            break
          case 'current': // 沖壓機運行電流
            result.value = Number(value).toFixed(2) + ' A'
            break
          case 'light1_on_times':
            result.value = value + '次'
            break
          default:
            result.value = value
        }
      } catch (error) {
        console.warn(error)
        result.value = '---'
      }
      if (value === 'B') {
        result.value = '---'
      }
      return result
    } else if (data.type === 'punch0002' && paramConfig['punch0002']) {
      result.txtColor = ''
      try {
        if (
          (result.max && Number(result.max) < Number(value)) ||
          (result.min && Number(result.min) > Number(value))
        ) {
          result.txtColor = 'txt-color-red'
        } else {
          result.txtColor = 'txt-color-green'
        }

        switch (key) {
          case 'timestamp':
            result.value = moment(value, 'YYYYMMDDHHmmss').format(
              'YYYY/MM/DD HH:mm:ss'
            )
            break
          case 'status':
            result.value = servkit.getMachineLightName(value)
            break
          case 'working_time': // 沖壓機今日作業時間 (m
            result.value =
              moment
                .utc(value)
                .format('HH:mm:ss')
                .replace(':', ' H ')
                .replace(':', ' M ') + ' S'
            break
          case 'temperature_probe': //
            result.value = Number(value).toFixed(2) + ' °C'
            break
          case 'current': // 沖壓機運行電流
            result.value = Number(value).toFixed(2) + ' A'
            break
          case 'light1_on_times':
            result.value = value + '次'
            break
          default:
            result.value = value
        }
      } catch (error) {
        console.warn(error)
        result.value = '---'
      }
      if (value === 'B') {
        result.value = '---'
      }
      return result
    }
  })
}
