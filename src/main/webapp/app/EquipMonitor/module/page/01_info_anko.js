export default function () {
  var theHref = location.href
  var boxId = getURLParameter('boxId', theHref)
  var machineId = getURLParameter('machineId', theHref)

  $('#boxId').text(boxId)
  $('#machineIdHead').text(machineId)
  $('#machineId').text(machineId)
  $('#machineName').text(servkit.getMachineName(machineId))

  var $machineLightName = $('#machine-light-name')

  var MULTI_SYSTEM_1 = 0 //因為資料格式是多系統，但是PLC是單系統，所以拿資料時指定為系統1

  var MITSUBISHI_TYPE = '1'
  var HITACHI_TYPE = '2'

  var MACHINE_1_TYPE = '01'
  var MACHINE_2_TYPE = '02'

  var MITSUBISHI_ID = 'Mitsubishi'
  var HITACHI_ID = 'Hitachi'
  var ANKO_ID = 'Anko'

  //長header
  servkit.monitor({
    type: 'HEAD',
    monitorHeadId: 'monitorHeader',
    boxId: boxId,
    machineId: machineId,
  })

  var $motorInfoTable = $('#motor-info-table')

  /*var alamMap = {
    "01":{
      "101":"變頻器寫入超時警報",
      "102":"變頻器讀出超時警報",
      "103":"PLC CH1 通訊異常",
      "104":"",
      "105":"",
      "106":"",
      "107":"",
      "108":"",
      "109":"",
      "110":"",
      "111":"",
      "112":"變頻器異常警報",
      "113":"變頻器01異常警報",
      "114":"變頻器02異常警報",
      "115":"變頻器03異常警報",
      "116":"變頻器04異常警報",
      "117":"變頻器05異常警報",
      "118":"變頻器06異常警報",
      "119":"",
      "120":"",
      "121":"",
      "122":"",
      "123":"",
    },
    "02":{
      "201": "變頻器寫入超時警報",
      "202": "變頻器讀出超時警報",
      "203": "PLC CH1 通訊異常",
      "204": "",
      "205": "切刀原點異常警報",
      "206": "奶油輸送帶無料警報",
      "207": "往復堆疊原點逾時警報",
      "208": "奶油機CV過載異常警報",
      "209": "廢皮導輪過載異常警報",
      "210": "切刀過載異常警報",
      "211": "切刀護罩開啟異常警報",
      "212": "變頻器異常警報",
      "213": "變頻器1異常警報",
      "214": "變頻器2異常警報",
      "215": "變頻器3異常警報",
      "216": "變頻器4異常警報",
      "217": "變頻器5異常警報",
      "218": "變頻器6異常警報",
      "219": "變頻器7異常警報",
      "220": "變頻器8異常警報",
      "221": "變頻器9異常警報",
      "222": "變頻器10異常警報",
      "223": "變頻器11異常警報",
      "224": "變頻器12異常警報",
      "225": "變頻器13異常警報",
      "226": "變頻器14異常警報",
      "227": "變頻器15異常警報",
      "228": "變頻器16異常警報",
      "229": "變頻器17異常警報",
      "230": "變頻器18異常警報",
      "231": "變頻器19異常警報",
      "232": "變頻器20異常警報",
      "233": "變頻器21異常警報",
      "234": "變頻器22異常警報",
      "235": "變頻器23異常警報",
      "236": "變頻器24異常警報",
      "237": "變頻器25異常警報",
      "238": "變頻器26異常警報",
      "239": "變頻器27異常警報",
      "240": "變頻器28異常警報",
    },
  };*/

  /*var motorAlamMap = {
    "0": "跳閘原因無",
    "1":"恒速時過電流保護",
    "2":"減速時過電流保護",
    "3":"加速時過電流保護",
    "4":"停止時過電流保護",
    "5":"過載保護",
    "7":"過電壓保護",
    "8":"保存元件故障",
    "9":"欠電壓保護",
    "10":"電流檢出器故障",
    "11":"CPU故障",
    "12":"外部跳閘",
    "13":"USP故障",
    "14":"接地短路保護",
    "15":"輸入過電壓保護",
    "19":"溫度檢出異常",
    "21":"溫度異常",
    "30":"驅動故障",
    "34":"輸出欠相保護",
    "38":"低速域過載保護",
    "40":"操作器連接不良",
    "41":"Modbus通信異常",
  };*/

  var $machineLigth = $('#machine-ligth')
  var machineLightObj = {}

  var machineLigthDec = '<span>顯示燈號:</span>'

  var alamMap = {}
  var motorAlamMap = {}

  var lightNameMap = {}

  getDbData('m_alarm', ['alarm_id', 'cnc_id', 'alarm_status'], initAlarmMap)

  function initAlarmMap(data) {
    alamMap[MACHINE_1_TYPE] = {}
    alamMap[MACHINE_2_TYPE] = {}

    _.each(data, function (ele) {
      //console.log(ele);
      if (ele.cnc_id == MITSUBISHI_ID || ele.cnc_id == HITACHI_ID) {
        var currentAlarmKey = ele.alarm_id
        if (ele.alarm_id.toString().length == 1) {
          //湊齊三碼
          currentAlarmKey = '00' + currentAlarmKey
        } else if (ele.alarm_id.toString().length == 2) {
          //湊齊三碼
          currentAlarmKey = '0' + currentAlarmKey
        }
        if (ele.cnc_id == MITSUBISHI_ID) {
          //三菱變頻器
          currentAlarmKey = MITSUBISHI_TYPE + currentAlarmKey // 加上1碼type變四碼
        } else {
          //日立變頻器
          currentAlarmKey = HITACHI_TYPE + currentAlarmKey // 加上1碼type變四碼
        }
        motorAlamMap[currentAlarmKey] = ele['alarm_status']
      } else if (ele.cnc_id == ANKO_ID) {
        //安口的機台
        var alarmNumber = parseInt(ele.alarm_id)
        if (alarmNumber > 100 && alarmNumber < 199) {
          //介於100~199是type 1
          alamMap[MACHINE_1_TYPE][ele.alarm_id] = ele['alarm_status']
        } else if (alarmNumber > 200 && alarmNumber < 299) {
          //介於100~199是type 2
          alamMap[MACHINE_2_TYPE][ele.alarm_id] = ele['alarm_status']
        }
      }
    })
    initLightNameMap()
  }

  function initLightNameMap() {
    getDbData('m_device_light', ['light_id', 'light_name', 'color'], function (
      data
    ) {
      _.each(data, function (ele) {
        machineLightObj[ele['light_id']] = ele
        machineLigthDec =
          machineLigthDec +
          ' <span class="btn" style="background:' +
          ele['color'] +
          ';"></span><span>' +
          ele['light_name'] +
          '</span> '
        lightNameMap[ele['light_id']] = ele['light_name']
      })
      $machineLigth.html(machineLigthDec)
      machineInfo(boxId, machineId) //第一次
    })
  }

  function machineInfo(boxId, machineId) {
    servkit.subscribe('xml_device_status', {
      machines: [boxId], //["IntraD01", "IntraD02"],
      handler: function (data) {
        var machinesMap = deviceStatusData(data)
        machineInfoCallback(machinesMap, machineId)
      },
    })
  }

  function machineInfoCallback(datas, machineId) {
    //console.log("******machine info start******");
    //console.log(datas);
    //console.log("******machine info end******");
    //console.log(machineId);
    if (datas[machineId]) {
      //使用machineId拿資料
      //console.log("yes");
      updateMachineInfoValue(datas[machineId])
    }
  }

  //定時更新機台資訊
  function updateMachineInfoValue(machineObj) {
    //"G_TYPE": 3, //機種編號
    replaceGCodeValue('G_TYPE', machineObj)
    //"G_DVID": 4, //機台編號
    replaceGCodeValue('G_DVID', machineObj)
    //"G_ODNO": 5, //流水號
    replaceGCodeValue('G_ODNO', machineObj)
    //"G_PDMN": 6, //生產月份
    replaceGCodeValue('G_PDMN', machineObj)
    //"G_TIME": 7, //現在時間
    replaceGCodeValue('G_TIME', machineObj)
    //"G_TMZZ": 8, //時差
    replaceGCodeValue('G_TMZZ', machineObj)
    //"G_CONS": 9, //機台運轉狀態
    gCons(machineObj)
    //replaceGCodeValue("G_CONS", machineObj);
    //"G_ALAM": 10, //機台異常
    gAlarm(machineObj)
    //replaceGCodeValue("G_ALAM", machineObj);
    //"G_TOCP": 11, //每日總產量
    replaceGCodeValue('G_TOCP', machineObj)

    //"G_MTST": 12, //馬達狀態
    //"G_MTAC": 13, //馬達異常原因
    //"G_FAUG": 14, //馬達頻率(HZ)
    //"G_IAVG": 15, //馬達電流(A)
    //"G_VART": 16, //馬達總運轉時間(H)
    buildMotorInfoTable(machineObj)
  }

  //動態長出馬達資訊
  function buildMotorInfoTable(machineObj) {
    //"G_MTST": 12, //馬達狀態
    //"G_MTAC": 13, //馬達異常原因
    //"G_FAUG": 14, //馬達頻率(HZ)
    //"G_IAVG": 15, //馬達電流(A)
    //"G_VART": 16, //馬達總運轉時間(H)
    var motorStatusArr = machineObj['G_MTST()'][MULTI_SYSTEM_1] //str2arr("G_MTST", machineObj);
    var motorAlarmArr = machineObj['G_MTAC()'][MULTI_SYSTEM_1] //str2arr("G_MTAC", machineObj);
    var motorFreqArr = machineObj['G_FAUG()'][MULTI_SYSTEM_1] //str2arr("G_FAUG", machineObj);
    var motorEleArr = machineObj['G_IAVG()'][MULTI_SYSTEM_1] //str2arr("G_IAVG", machineObj);
    var motorRunArr = machineObj['G_VART()'][MULTI_SYSTEM_1] //str2arr("G_VART", machineObj);
    var motorCapacityArr = machineObj['G_MTCA()'][MULTI_SYSTEM_1] //str2arr("G_MTCA", machineObj);

    var head =
      '<tr><th>名稱</th><th>狀態</th><th>異常原因</th><th>頻率(HZ)</th><th>電流(A)</th><th>總運轉時間(H)</th><th>馬達容量(W)</th></tr>'
    var body = ''
    var motorSeqNumber = 0
    for (var index = 0; index < motorStatusArr.length; index++) {
      var status = motorStatusArr[index]
      if (status == 'B') {
        status = '0'
      }
      var motorCapacity = motorCapacityArr[index]
      if (
        motorCapacity == '65535' ||
        motorCapacity == '0' ||
        motorCapacity == 'B'
      ) {
        //容量是65535、0、B就不顯示馬達
        continue
      }
      motorSeqNumber++ //有容量才要顯示碼達，才需要更新碼達流水號

      var motorAlarmVal = checkArr(motorAlarmArr, index)
      var motorFreqVal = checkArr(motorFreqArr, index)
      var motorEleVal = checkArr(motorEleArr, index)
      var motorRunVal = checkArr(motorRunArr, index)
      var motorCapacitVal = checkArr(motorCapacityArr, index)

      var motorAlarmMsg
      var realMotorAlarmVal = parseInt(motorAlarmVal.substring(1, 4)) //去掉變頻器，就是真正的alarm code
      var realMotorAlarmVal16 = realMotorAlarmVal.toString(16).toUpperCase() //十六進位
      if (realMotorAlarmVal16.toString().length == 1) {
        realMotorAlarmVal16 = '0' + realMotorAlarmVal16
      }

      if (motorAlamMap[motorAlarmVal]) {
        // alarm code 是變頻器1碼 + 警報代碼3碼
        motorAlarmMsg =
          '十進位: ' +
          realMotorAlarmVal +
          ' 十六進位: ' +
          realMotorAlarmVal16 +
          ' (' +
          motorAlamMap[motorAlarmVal] +
          ')' //parseInt(alarmCodeVal).toString(16).toUpperCase()
      } else {
        motorAlarmMsg =
          '十進位: ' + realMotorAlarmVal + ' 十六進位: ' + realMotorAlarmVal16
      }
      var motorLightName
      if (lightNameMap[status]) {
        motorLightName = lightNameMap[status]
      } else {
        motorLightName = ' ---'
      }

      body =
        body +
        '<tr><td>' +
        motorSeqNumber + //"light_id", "light_name", "color"
        "</td><td><span class='btn' style='background:" +
        machineLightObj[status]['color'] +
        "'></span><span> " +
        motorLightName +
        '</span>' +
        '</td><td>' +
        motorAlarmMsg +
        '</td><td>' +
        motorFreqVal +
        '</td><td>' +
        motorEleVal +
        '</td><td>' +
        motorRunVal +
        '</td><td>' +
        motorCapacitVal +
        '</td></tr>'
    }
    $motorInfoTable.html(head + body)
  }

  function checkArr(arr, index) {
    if (!arr || index > arr.length - 1) {
      return '---'
    } else {
      return arr[index]
    }
  }

  //變更機台狀態燈號
  function gCons(machineObj) {
    var consCode = 'G_CONS' //machineLightObj
    var status = machineObj[consCode + '()'][MULTI_SYSTEM_1][0].toString()
    if (status == 'B') {
      status = '0'
    }
    //"light_id", "light_name", "color"
    var color = machineLightObj[status]['color']
    if (color != undefined) {
      $('#' + consCode).attr('style', 'background:' + color)
      $machineLightName.html(' ' + lightNameMap[status])
    } else {
      $('#' + consCode).attr('style', 'background:#f3f3f3')
      $machineLightName.html(' ---')
    }
  }

  //顯示機台alarm訊息
  function gAlarm(machineObj) {
    var alarmCode = 'G_ALAM'
    var machineTypeCode = 'G_TYPE'
    var machineType = machineObj[machineTypeCode + '()'][MULTI_SYSTEM_1][0]
    var alarmCodeVals = machineObj[alarmCode + '()'][MULTI_SYSTEM_1]
    var alarmMsg = '---'
    _.each(alarmCodeVals, function (alarmCodeVal) {
      if (machineType && alarmCodeVal) {
        var alarmCodeVal16 = parseInt(alarmCodeVal).toString(16).toUpperCase()
        if (alarmCodeVal16.length == 1) {
          alarmCodeVal16 = '0' + alarmCodeVal16
        }
        if (alamMap[machineType]) {
          if (alamMap[machineType][alarmCodeVal]) {
            if (alarmMsg == '---') {
              //第一次 >/////<
              alarmMsg =
                '十進位: ' +
                alarmCodeVal +
                ' 十六進位: ' +
                alarmCodeVal16 +
                ' (' +
                alamMap[machineType][alarmCodeVal] +
                ')'
            } else {
              alarmMsg =
                alarmMsg +
                ', 十進位: ' +
                alarmCodeVal +
                ' 十六進位: ' +
                alarmCodeVal16 +
                ' (' +
                alamMap[machineType][alarmCodeVal] +
                ')'
            }
          }
        } else {
          //沒有對映的alarm資訊
          if (alarmMsg == '---') {
            //第一次 >/////<
            alarmMsg =
              '十進位: ' + alarmCodeVal + ' 十六進位: ' + alarmCodeVal16
          } else {
            alarmMsg =
              alarmMsg +
              ', 十進位: ' +
              alarmCodeVal +
              ' 十六進位: ' +
              alarmCodeVal16
          }
        }
      }
    })
    //alamMap G_TYPE
    $('#' + alarmCode).text(alarmMsg)
  }

  function replaceGCodeValue(gCode, machineObj) {
    $('#' + gCode).text(machineObj[gCode + '()'][MULTI_SYSTEM_1])
  }

  function getURLParameter(name, url) {
    //location.href
    return (
      decodeURIComponent(
        (new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(url) || [
          null,
          '',
        ])[1].replace(/\+/g, '%20')
      ) || null
    )
  }

  //取db資料
  function getDbData(tableName, columnArr, callback) {
    servkit.ajax(
      {
        url: 'api/getdata/db',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          table: tableName,
          columns: columnArr,
        }),
      },
      {
        success: function (data) {
          callback(data)
        },
      }
    )
  }

  //***protobuf轉成machine map
  function deviceStatusData(data) {
    var machinesMap = {} //機台map，用來存全部的機台
    //console.log("--------------------");
    //console.log(data);
    //console.log("--------------------");
    /* xml_device_status 格式使用*/
    _.each(data, function (boxStr, boxId) {
      var box = JSON.parse(boxStr)
      _.each(box, function (machines, gCode) {
        _.each(machines, function (machineVal, machineId) {
          if (!machinesMap[machineId]) {
            //沒機台就建
            machinesMap[machineId] = {}
          }
          machinesMap[machineId]['info'] = {
            boxId: boxId,
            date: new Date(),
          }
          machinesMap[machineId][gCode] = machineVal
        })
      })
    })
    return machinesMap
  }

  //暫時不會用到
  // function initAnkoAlarmMap(callback) {
  //   var trueAlarmMap = {};
  //   getDbData("m_alarm", ["alarm_id", "cnc_id", "alarm_status"], initAlarmMap);

  //   function initAlarmMap(alarmCodes) {
  //     _.each(alarmCodes, function (ele) {
  //       var currentAlarmKey = ele.alarm_id;
  //       if ((ele.cnc_id == MITSUBISHI_ID) || (ele.cnc_id == HITACHI_ID)) {
  //         if (ele.alarm_id.toString().length == 1) { //湊齊三碼
  //           currentAlarmKey = "00" + currentAlarmKey;
  //         } else if (ele.alarm_id.toString().length == 2) { //湊齊三碼
  //           currentAlarmKey = "0" + currentAlarmKey;
  //         }
  //         if (ele.cnc_id == MITSUBISHI_ID) { //三菱變頻器
  //           currentAlarmKey = MITSUBISHI_TYPE + currentAlarmKey; // 加上1碼type變四碼
  //         } else { //日立變頻器
  //           currentAlarmKey = HITACHI_TYPE + currentAlarmKey; // 加上1碼type變四碼
  //         }
  //       } else if (ele.cnc_id == ANKO_ID) { //安口的機台
  //         //保持原來的
  //       } else {
  //         currentAlarmKey = ""; //
  //       }
  //       if (currentAlarmKey != "") {
  //         var trueAlarmVal10 = parseInt(ele.alarm_id);
  //         var trueAlarmVal16 = trueAlarmVal10.toString(16).toUpperCase(); //十六進位
  //         if (trueAlarmVal16.length == 1) {
  //           trueAlarmVal16 = "0" + trueAlarmVal16;
  //         }
  //         trueAlarmMap[currentAlarmKey] = {
  //           "cncId": ele.cnc_id,
  //           "alarm10": trueAlarmVal10.toString(),
  //           "alarm16": trueAlarmVal16,
  //           "alarmStatus": ele["alarm_status"]
  //         };
  //       }
  //     });
  //     callback(trueAlarmMap);
  //   }
  // }
}
