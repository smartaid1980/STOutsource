export default function () {
  GoGoAppFun({
    gogo: function (context) {
      document.location.href =
        'http://' + location.hostname + ':3000/dashboard/db/iiot-war-room'
    },
    util: {},
    preCondition: {},
    dependencies: [],
  })
}
