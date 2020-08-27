import { fetchParamFile } from '../../../../../js/servtech/module/servkit/ajax.js'
import MonitorConfig from './MonitorConfig.js'

const getConfigPathLoadingOrder = (machineId, brandId) => [
  `equipMonitor/users/${machineId}.json`,
  `equipMonitor/users/${machineId}.csv`,
  `equipMonitor/template/${brandId}.json`,
  `equipMonitor/template/${brandId}.csv`,
]

export default async function fetchMonitorConfigFile(
  machineId,
  brandId,
  callback
) {
  // 決定拿哪一份設定檔
  const pathArray = getConfigPathLoadingOrder(machineId, brandId)
  let path
  let paramFile

  while (!paramFile && pathArray.length) {
    path = pathArray.shift()
    paramFile = await fetchParamFile(path)
  }

  if (!paramFile) {
    $.smallBox({
      title: '找不到此廠牌template設定檔',
      content: '<i class="fa fa-clock-o"></i> <i>2 seconds ago...</i>',
      color: '#C79121',
      iconSmall: '',
      timeout: 60000,
    })
    return callback([])
  }

  const pathExtMatchResult = path.match(/\.(json|csv)$/)
  let configData = []
  switch (pathExtMatchResult?.[1]) {
    case 'csv':
      configData.push(...paramFile.map((line) => line.split(',')))
      break
    case 'json':
    default:
      configData = JSON.parse(paramFile.join(''))
      break
  }

  if (_.isArray(configData)) {
    configData = new MonitorConfig(configData, brandId).configMap
  }

  return callback(configData)
}
