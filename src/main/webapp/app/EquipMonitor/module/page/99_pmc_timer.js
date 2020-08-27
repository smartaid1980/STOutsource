export default function () {
  //按下send cmd的按鈕
  var buttonObj = $('#test_Submit')
  buttonObj.find('#send').click(function () {
    var pNumber = $('#pNumber').val()
    var pCount = $('#pCount').val()

    var truePCount = (parseInt(pCount) - parseInt(pNumber) + 1).toString()

    var params = {
      'commandId': 'cnc_PLCTimer',
      'leanId': 'IntraD01',
      'deviceId': 'FANUC01',
      'cnc_timeout': 120000,
      'G_PMCY:input:P_NUMBER': pNumber,
      'G_PMCY:input:P_COUNT': truePCount,
    }
    //送命令
    //$._boxCmd.send(params);
    //取資料
    $._boxCmd.getData(params)
  })
}
