export default function () {
  pageSetUp()

  var submitCtrl = function ($scope, $location) {
    var deviceList = []
    $scope.initDeviceList = function () {
      deviceList = [
        { deviceId: 'MA-1001', status: 'offline' },
        { deviceId: 'MA-1002', status: 'offline' },
        { deviceId: 'MA-1003', status: 'offline' },
        { deviceId: 'MA-1004', status: 'offline' },
        { deviceId: 'MA-1005', status: 'online' },
        { deviceId: 'MA-1006', status: 'offline' },
        { deviceId: 'MA-1007', status: 'offline' },
        { deviceId: 'MA-1008', status: 'offline' },
      ]
      $scope.deviceList = deviceList
    }

    $scope.checkStatus = function (deviceId, status) {
      console.log(deviceId)
      if (status != 'offline') {
        $location
          .path('app/EquipMonitor/01_info')
          .search({ deviceId: deviceId })
      }
    }
  }

  // load all flot plugins
}
