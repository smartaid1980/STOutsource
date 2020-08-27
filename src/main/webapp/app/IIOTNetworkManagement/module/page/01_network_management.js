export default function () {
  GoGoAppFun({
    gogo: function (context) {
      document.location.href =
        'http://' +
        location.hostname +
        '/condor/index.html?setLng=en-US#ajax/device_list.html/grid'
    },
    util: {},
    preCondition: {},
    dependencies: [],
  })
}
