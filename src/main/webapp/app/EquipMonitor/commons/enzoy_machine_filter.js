/**
 * Created with JetBrains WebStorm.
 * User: Jenny
 * Date: 2016/12/14
 * Time: 下午 4:25
 * To change this template use File | Settings | File Templates.
 */
var machineObjList
exports.getMachineByGroup = (function () {
  return function (done) {
    if (machineObjList) {
      done(machineObjList)
    } else {
      servkit.ajax(
        {
          url: 'api/machine/readByGroup',
          type: 'GET',
          contextnType: 'application/json',
        },
        {
          success: function (machineList) {
            machineObjList = {}
            if (machineList.length) {
              _.each(machineList, function (elem) {
                machineObjList[elem.machine_id] = servkit.getMachineName(
                  elem.machine_id
                )
              })
            } else {
              console.debug('此群組無綁定機台，預設取DB中所有機台')
              _.each(servkit.getMachineList(), function (machineId) {
                machineObjList[machineId] = servkit.getMachineName(machineId)
              })
            }

            done(machineObjList)
          },
          exception: function () {
            console.debug('DB中無群組與機台綁定table，預設取所有機台')
            machineObjList = {}
            _.each(servkit.getMachineList(), function (machineId) {
              machineObjList[machineId] = servkit.getMachineName(machineId)
            })
            done(machineObjList)
          },
        }
      )
    }
  }
})()
