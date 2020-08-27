import i18n from '../../../../js/servtech/module/servcloud.i18n.js'

export default function () {
  GoGoAppFun({
    gogo: function (context) {
      pageSetUp()
      ;(function () {
        var monitor = function () {
          var _PROGRAM_UPLOAD_USE_G_S_MUNCP = servkit.configUseProgramUploadUseGSMuncp()
          console.log(
            'PROGRAM_UPLOAD_USE_G_S_MUNCP:',
            _PROGRAM_UPLOAD_USE_G_S_MUNCP
          )

          var theHref = location.href
          var boxId = getURLParameter('boxId', theHref)
          var machineId = getURLParameter('machineId', theHref)
          var cncBrand = getURLParameter('cncBrand', theHref)

          var lang = servkit.getCookie('lang')
          var locationParams =
            '?boxId=' +
            boxId +
            '&machineId=' +
            machineId +
            '&cncBrand=' +
            cncBrand +
            '&preAppId=ProgTransmit&prePage=01_machines'

          $('#cnc_download').on('click', function () {
            window.location =
              '#app/ProgTransmit/function/' +
              lang +
              '/02_cnc_download.html' +
              locationParams
          })
          $('#cnc_upload').on('click', function () {
            window.location =
              '#app/ProgTransmit/function/' +
              lang +
              '/03_cnc_upload.html' +
              locationParams
          })
          $('#leave').on('click', function () {
            window.location =
              '#app/ProgTransmit/function/' +
              lang +
              '/01_machines.html' +
              locationParams
          })

          var isMutiSystem = cncBrand == 'FANUC_CNC_FOCAS' // = true;//是否是多系統
          var $systemOption = $('#system-option')
          var $inputFile = $('#inputFile')
          var $uploadFilePath = $('#uploadFilePath')
          var $submitFile = $('#submitFile')
          var systemCount

          var monitorCmdBySysCount = {
            //box監控命令
            name: 'cnc_SystemCount',
            cycleType: 'count',
            cycleValue: 1,
            timeout: 0,
            items: [
              //{"signal":{"id":"G_SYSC","inputs":{"P_STRING":""}},"collect":{"waitMs":0,"count":1}}
              { signal: { id: 'G_SYSC' }, collect: { waitMs: 0, count: 1 } },
              { signal: { id: 'G_MSZAV' }, collect: { waitMs: 0, count: 1 } },
            ],
          }

          $('#boxId').text(boxId)
          $('#machineIdHead').text(servkit.getMachineName(machineId))
          $('#machineId').text(machineId)
          $('#machineName').text(servkit.getMachineName(machineId))
          console.log('boxId:' + boxId + ', machineId:' + machineId)

          //長header
          /*servkit.monitor({
         type: "HEAD",
         monitorHeadId: "monitorHeader",
         boxId: boxId,
         machineId: machineId
         });*/

          //送監控命令
          servkit.monitor({
            type: 'SEND',
            boxId: boxId,
            machineId: machineId,
            monitorCmd: monitorCmdBySysCount,
            monitorCmdVersion: 'v1.0',
            timeoutLimit: 30000,
            customCallback: function (data) {
              //客製化
              console.log('---------------------')
              console.log(JSON.stringify(data))
              console.log('---------------------')

              if (data['G_MSZAV()']) {
                $('#SZAV').html(
                  _.map(data['G_MSZAV()'].values, function (data, index) {
                    var szav = data[0] || 0
                    return (
                      '【System ' +
                      (index + 1) +
                      ` ${i18n('Remaining_Storage')}】：` +
                      sizeUnit(szav)
                    )
                  }).join('　')
                )
              }

              if (data['G_SYSC()']) {
                systemCount = data['G_SYSC()'].values[0][0]
                var sysOp = ''
                if (systemCount != 'B') {
                  for (var count = 1; count <= systemCount; count++) {
                    sysOp +=
                      '<option value="' +
                      count +
                      '">System ' +
                      count +
                      '</option>'
                  }
                }
                $systemOption.html(sysOp)
                uploadSubmitFile(isMutiSystem) //雙系統
                console.log('***get data so stop***')
                return true
              } else {
                $('#SZAV').html()
                uploadSubmitFile() //單系統
                console.log('not get data...')
                return false
              }
            },
          })

          $inputFile.on('change', function () {
            $uploadFilePath.val(this.value)
          })

          //當按下上傳按鈕
          function uploadSubmitFile(isMutiSystem) {
            $submitFile.prop('disabled', false)
            $submitFile.unbind('click').on('click', function (e) {
              blockUploadBtn()
              e.preventDefault()
              if (!window.FileReader) {
                //alert("Your browser is not supported");
                smallBox({
                  selectColor: 'red',
                  title: 'Your browser is not supported!',
                  icon: 'fa fa-warning',
                  timeout: 2000,
                })
              }
              var input = $inputFile.get(0)
              // Create a reader object
              var reader = new FileReader()
              if (input.files.length) {
                var textFile = input.files[0]
                var fileName = $inputFile.val().split('\\').pop()
                reader.readAsText(textFile)
                $(reader).on('load', function (e) {
                  var file = e.target.result
                  if (file && file.length) {
                    var monitorCmd
                    var singleMonitorCmd = {
                      //box監控命令
                      name: 'cnc_NCUpload',
                      cycleType: 'count',
                      cycleValue: 1,
                      timeout: 0,
                      items: [
                        {
                          signal: { id: 'S_UNCP', inputs: { P_VALUE: '' } },
                          collect: { waitMs: 0, count: 1 },
                        },
                      ],
                    } //S_MUNCP
                    var multiMonitorCmd = {
                      //box監控命令
                      name: 'cnc_NCUpload',
                      cycleType: 'count',
                      cycleValue: 1,
                      timeout: 0,
                      items: [
                        {
                          signal: {
                            id: 'S_MUNCP',
                            inputs: { P_VALUE: '', P_STRING: '' },
                          },
                          collect: { waitMs: 0, count: 1 },
                        },
                      ],
                    }
                    var multiMonitorNewCmd = {
                      //box監控命令
                      name: 'cnc_NCUpload',
                      cycleType: 'count',
                      cycleValue: 1,
                      timeout: 0,
                      items: [
                        //{"signal": {"id": "S_MUNCP", "inputs": {"P_VALUE": "", "P_STRING": ""}}, "collect": {"waitMs": 0, "count": 1}} //舊版
                        {
                          signal: {
                            id: 'G_S_MUNCP',
                            inputs: { P_PARAM: '', P_STRING: '' },
                          },
                          collect: { waitMs: 0, count: 1 },
                        },
                      ],
                    }
                    //console.log("#####################");
                    //console.log(systemCount);
                    if (isMutiSystem) {
                      //if(systemCount >= 2){//雙系統
                      //使用新版G_S_MUNCP
                      if (_PROGRAM_UPLOAD_USE_G_S_MUNCP) {
                        monitorCmd = multiMonitorNewCmd
                        monitorCmd.items[0].signal.inputs['P_STRING'] = $(
                          '#system-option option:selected'
                        ).val() //選擇的系統
                        //console.log($('#system-option option:selected').val());
                        monitorCmd.items[0].signal.inputs['P_PARAM'] = file
                      } else {
                        //舊版
                        monitorCmd = multiMonitorCmd
                        monitorCmd.items[0].signal.inputs['P_STRING'] = $(
                          '#system-option option:selected'
                        ).val() //選擇的系統
                        //console.log($('#system-option option:selected').val());
                        monitorCmd.items[0].signal.inputs['P_VALUE'] = file
                      }
                    } else {
                      monitorCmd = singleMonitorCmd
                      monitorCmd.items[0].signal.inputs['P_VALUE'] = file
                    }

                    console.log(JSON.stringify(monitorCmd))
                    //送監控命令
                    servkit.monitor({
                      type: 'SEND',
                      boxId: boxId,
                      machineId: machineId,
                      monitorCmd: monitorCmd,
                      monitorCmdVersion: 'v1.0',
                      timeoutLimit: 30000,
                      customCallback: function (data) {
                        //客製化
                        console.log('---------------------')
                        console.log(JSON.stringify(data))
                        console.log('---------------------')

                        unblockUploadBtn()

                        var uploadResponse
                        var isMutiSystemResponse = false
                        _.each(data, function (ele, key) {
                          //因為key的param不確定，所以判斷是否包含字串"S_XXXX("
                          //if (key.indexOf("S_MUNCP(") > -1) { //舊版
                          if (
                            key.indexOf('G_S_MUNCP(') > -1 ||
                            key.indexOf('S_MUNCP(') > -1
                          ) {
                            //G_S_MUNCP新版，S_MUNCP舊版
                            uploadResponse = ele
                            isMutiSystemResponse = true
                          } else if (key.indexOf('S_UNCP(') > -1) {
                            uploadResponse = ele
                          }
                        })

                        if (uploadResponse != undefined) {
                          //undefined表示key不是S_MUNCP或S_UNCP
                          //if(data["S_UNCP()"] || data["S_MUNCP()"]){
                          console.log('***get data so stop***')
                          //console.log(uploadResponse.values[0][0]);
                          //uploadResponse.values[0][0] = "1) ReturnCode: EW_MODE(12), 2) Meaning: CNC mode error (in case of NC program in Series 160i/180i/210i, 0i-A/B/C, Power Mate i), 3) ErrorHandling: 3.1) MDI mode: Change CNC mode to any mode except MDI. 3.2) Background edit processing in CNC side: Terminate background edit processing in CNC side.";
                          if (uploadResponse.values[0][0] == '1') {
                            //回傳1表示上傳成功
                            smallBox({
                              selectColor: 'green',
                              title: 'Upload success!',
                              icon: 'fa fa-check',
                              timeout: 2000,
                            })
                          } else {
                            //回傳1以外的值表示上傳失敗
                            if (
                              isMutiSystemResponse &&
                              _PROGRAM_UPLOAD_USE_G_S_MUNCP
                            ) {
                              //smallBox({selectColor: "red", title: "File : " + fileName + ",<br/> Message: " + uploadResponse.values[0][0], icon: "fa fa-warning", timeout: 600000});
                              $('#fail-file-name').html(fileName)
                              $('#fail-msg').html(uploadResponse.values[0][0])
                              $('#msg-modal').modal('show')
                            } else {
                              smallBox({
                                selectColor: 'red',
                                title:
                                  'Upload fail!, It may be insufficient memory capacity.',
                                icon: 'fa fa-warning',
                                timeout: 30000,
                              })
                            }
                          }
                          return true
                        } else {
                          console.log('not get data...')
                          return false
                        }
                      },
                      timeoutCallback: function () {
                        //timeout時的callback
                        unblockUploadBtn()
                      },
                    })
                  }
                })
              } else {
                //alert('Please upload a file before continuing')
                smallBox({
                  selectColor: 'red',
                  title: 'Please upload a file before continuing!',
                  icon: 'fa fa-warning',
                  timeout: 2000,
                })
                unblockUploadBtn()
              }
              return false //避免頁面跳轉
            })
          }

          function blockUploadBtn() {
            $submitFile.prop('disabled', true)
            $submitFile.html('<i class="fa fa-gear fa-spin"></i>')
          }

          function unblockUploadBtn() {
            $submitFile.prop('disabled', false)
            $submitFile.html(`${i18n('Upload')}`) //將button還原
          }

          //檔案大小轉換單位
          function sizeUnit(byteValStr) {
            if (byteValStr == '') {
              return ''
            }
            if (byteValStr == 'B') {
              return 'N/A'
            }

            var byteVal = parseInt(byteValStr)
            if (byteVal < 1024) {
              return byteVal + ' (B)'
            } else if (byteVal < 1024 * 1024) {
              byteVal = byteVal / 1024
              return byteVal.toFixed(2) + ' (KB)'
            } else {
              byteVal = byteVal / (1024 * 1024)
              return byteVal.toFixed(2) + ' (MB)'
            }
          }

          function getURLParameter(name, url) {
            //location.href
            return (
              decodeURIComponent(
                (new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(
                  url
                ) || [null, ''])[1].replace(/\+/g, '%20')
              ) || null
            )
          }

          function smallBox(params) {
            //selectColor, title, icon, timeout
            var colors = { green: '#739E73', red: '#C46A69', yellow: '#C79121' }
            $.smallBox({
              sound: false, //不要音效
              title: params.title,
              content: "<i class='fa fa-clock-o'></i> <i>1 seconds ago...</i>",
              color: colors[params.selectColor],
              iconSmall: params.icon,
              timeout: params.timeout,
            })
          }
        }
        monitor()
      })()
    },
    util: {},
    delayCondition: ['machineList'],
    dependencies: [
      /*[
      "/js/plugin/datatables/jquery.dataTables.min.js",
      "/js/plugin/datatables/dataTables.colVis.min.js",
      "/js/plugin/datatables/dataTables.tableTools.min.js",
      "/js/plugin/datatables/dataTables.bootstrap.min.js",
      "/js/plugin/datatable-responsive/datatables.responsive.min.js"
      ],
      [
      "/js/plugin/jquery-validate/jquery.validate.min.js",
      "/js/plugin/masked-input/jquery.maskedinput.min.js"
      ]*/
    ],
  })
}
