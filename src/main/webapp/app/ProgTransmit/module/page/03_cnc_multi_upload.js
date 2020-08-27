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
              '/02_cnc_multi_download.html' +
              locationParams
          })
          $('#cnc_upload').on('click', function () {
            window.location =
              '#app/ProgTransmit/function/' +
              lang +
              '/03_cnc_multi_upload.html' +
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

          var $uploadFileTable = $('#response-data-table')

          var _FILE_NAME_INDEX = 0
          var _UPLOAD_STATUS_INDEX = 2
          var _CANCEL_BUTTON_INDEX = 3
          var _FILE_OBJ_INDEX = 4
          var startTime
          var programName
          var monitorCmdBySysCount = {
            //box監控命令
            name: 'cnc_SystemCount',
            cycleType: 'count',
            cycleValue: 1,
            timeout: 0,
            items: [
              //{"signal":{"id":"G_SYSC","inputs":{"P_STRING":""}},"collect":{"waitMs":0,"count":1}}
              {
                signal: {
                  id: 'G_SYSC',
                },
                collect: {
                  waitMs: 0,
                  count: 1,
                },
              },
              {
                signal: {
                  id: 'G_MSZAV',
                },
                collect: {
                  waitMs: 0,
                  count: 1,
                },
              },
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
            timeoutLimit: 120000,
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
                uploadFileTable([])
                return true
              } else {
                $('#SZAV').html()
                uploadSubmitFile() //單系統
                console.log('not get data...')
                uploadFileTable([])
                return false
              }
            },
          })

          $inputFile.on('change', function () {
            //$uploadFilePath.val(this.value);
            var files = $inputFile.prop('files')
            var fileNameSet = {}
            var ncMatrix = []

            if ($uploadFileTable.DataTable) {
              //已經初始過datatable惹
              _.each($uploadFileTable.DataTable().rows().data(), function (
                record
              ) {
                var fileName = record[_FILE_NAME_INDEX]
                ncMatrix.push(record) //將datatable的資料放入
                fileNameSet[fileName] = fileName
              })
            }

            _.each(files, function (file) {
              //console.log(file);
              var fileName = file.name
              var fileSize = sizeUnit(file.size)
              var status = 'wait'
              //if (fileNameSet[fileName]) {
              //已經有惹，就不需要重複加
              //  console.log("duplicate ", fileName);
              //} else {
              ncMatrix.push([fileName, fileSize, status, fileName, file])
              //}
            })
            $inputFile.prop('value', '')
            uploadFileTable(ncMatrix)
            // _.each($uploadFileTable.DataTable().rows().data(), function (record,index) {
            //   var fileName = record[3];
            //   // var $btnSelect = $('.cancel-btn');
            //   var $btnSelect = $('select[name="'+fileName+'"]');
            //   if(record[2] === "success"){

            //     console.log("$btnSelect : " + $btnSelect);
            //     console.log("index : " + index);
            //     var info = $uploadFileTable.DataTable().row(index).cell($btnSelect);
            //     console.log("info : " + info);
            //   }
            // })
          })

          function uploadFileTable(ncMatrix) {
            var tableHeadColumns = [
              //{id: "system", name: `${i18n('System')}`},
              {
                id: 'names',
                name: `${i18n('File_Name')}`,
                dataWidth: '40%',
              },
              {
                id: 'sizes',
                name: `${i18n('Size')}`,
                dataWidth: '25%',
              },
              {
                id: 'status',
                name: `${i18n('Status')}`,
                dataWidth: '25%',
              },
              {
                id: 'cancel-button',
                name: `${i18n('Cancel')}`,
                dataWidth: '10%',
              },
            ]
            var tableOptions = {
              sDom:
                "<'dt-toolbar'<'col-xs-12 col-sm-6 table-search'f>r<'col-xs-12 col-sm-6'<'#custom-btn'>>>" +
                't' +
                "<'dt-toolbar-footer'<'col-xs-12 col-sm-4 hidden-xs'l><'col-xs-12 col-sm-4 hidden-xs'i><'col-xs-12 col-sm-4'p>>",
              columns: [
                {
                  className: 'text-left',
                },
                {
                  className: 'text-left',
                },
                {
                  className: 'text-left',
                },
                {
                  //取消按鈕
                  className: 'text-left',
                  mRender: function (data, type, rowData) {
                    console.log('rowData : ' + rowData)
                    if (rowData[2] == 'success') {
                      return (
                        "<a href='javascript:void(0)' ><span  name=" +
                        data +
                        ` class='btn btn-success cancel-btn' style = 'display:none'>${i18n(
                          'Cancel'
                        )}</span></a>`
                      )
                    }
                    return (
                      "<a href='javascript:void(0)' ><span  name=" +
                      data +
                      ` class='btn btn-success cancel-btn'>${i18n(
                        'Cancel'
                      )}</span></a>`
                    )
                  },
                  // "width": "10%"
                },
              ],
              autoWidth: true,
              ordering: false,
              paging: false,
              //"lengthChange": false
            }
            //設定資料

            tableOptions['data'] = ncMatrix
            //長table
            servkit.monitor.tool({
              type: 'TABLE',
              config: {
                id: 'response-data-table',
                headColumns: tableHeadColumns,
                options: tableOptions,
                customCallback: function (options) {
                  $('#custom-btn').html(
                    `<button id="multi-cancel-btn" class="btn btn-info pull-right" title="multi-upload" style="margin-right:5px">${i18n(
                      'Cancel_All'
                    )}</button>`
                  )

                  //按下全部取消按鈕
                  $('#multi-cancel-btn').on('click', function () {
                    $uploadFileTable.DataTable().rows().remove().draw()
                  })

                  //按下取消按鈕
                  $uploadFileTable
                    .find('tbody')
                    .on('click', '.cancel-btn', function (e) {
                      var $selectRow = $(this).parents('tr') //datatable的哪個row按下刪除按鈕
                      var $selectStatus = $(this).parents('td').prev()
                      // if($uploadFileTable.DataTable().row($selectRow).cell($selectStatus).data() === "success"){
                      //   $(this).prop('disabled', true);
                      // }else{
                      $uploadFileTable
                        .DataTable()
                        .row($selectRow)
                        .remove()
                        .draw()
                      // }
                    })
                },
              },
            })
          }

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
              var opt = {
                isMutiSystem: isMutiSystem,
                ncName: '@@@@@@@@@@',
              } //*** ncName是用來判斷這次收到的結果是否與前一次不同(因為拿太快，可能拿到前一個結果)
              var ncMatrix = $uploadFileTable.DataTable().rows().data()
              var obj = {
                opt: opt,
                ncMatrix: ncMatrix,
              }
              sendUploadCmd(obj, 0, ncMatrix.length, sendUploadCmd)
              unblockUploadBtn()
              return false //避免頁面跳轉
            })
          }

          function sendUploadCmd(obj, index, size, sendUploadCmdCallback) {
            startTime = new Date()
            if (index >= size) {
              unblockUploadBtn()
              return
            }
            if (obj['ncMatrix'][index][_UPLOAD_STATUS_INDEX] === 'success') {
              sendUploadCmd(obj, index + 1, size, sendUploadCmd)
              return
            }
            var isMutiSystem = obj['opt']['isMutiSystem']
            var fileName = obj['ncMatrix'][index][_FILE_NAME_INDEX]
            // Create a reader object
            var reader = new FileReader()
            var textFile = obj['ncMatrix'][index][_FILE_OBJ_INDEX]
            console.log('textFile: ', textFile)
            reader.readAsText(textFile)
            $(reader).on('load', function (e) {
              var file = e.target.result
              if (file && file.length) {
                //console.log("file: ", file);
                var monitorCmd
                var singleMonitorCmd = {
                  //box監控命令
                  name: 'cnc_NCUpload',
                  cycleType: 'count',
                  cycleValue: 1,
                  timeout: 0,
                  items: [
                    {
                      signal: {
                        id: 'S_UNCP',
                        inputs: {
                          P_VALUE: '',
                        },
                      },
                      collect: {
                        waitMs: 0,
                        count: 1,
                      },
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
                        inputs: {
                          P_VALUE: '',
                          P_STRING: '',
                        },
                      },
                      collect: {
                        waitMs: 0,
                        count: 1,
                      },
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
                        inputs: {
                          P_PARAM: '',
                          P_STRING: '',
                        },
                      },
                      collect: {
                        waitMs: 0,
                        count: 1,
                      },
                    },
                  ],
                }
                //console.log("#####################");
                //console.log(systemCount);
                if (isMutiSystem) {
                  //if(systemCount >= 2){//雙系統
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

                    //取得程式名稱
                    var progStartChar = file.indexOf('\n')
                    var progEndChar = file.indexOf('(', progStartChar)
                    programName = file.substring(progStartChar + 1, progEndChar)
                  }
                } else {
                  monitorCmd = singleMonitorCmd
                  monitorCmd.items[0].signal.inputs['P_VALUE'] = file
                }

                console.log(JSON.stringify(monitorCmd))
                $uploadFileTable
                  .DataTable()
                  .cell(index, _UPLOAD_STATUS_INDEX)
                  .data('upload...') //狀態設為上傳中

                //送監控命令
                servkit.monitor({
                  type: 'SEND',
                  boxId: boxId,
                  machineId: machineId,
                  monitorCmd: monitorCmd,
                  monitorCmdVersion: 'v1.0',
                  timeoutLimit: 120000,
                  blockMsg: 'upload ' + fileName,
                  customParamObj: {
                    obj: obj,
                    index: index,
                    size: size,
                  },
                  customCallback: function (data, customParamObj) {
                    //客製化
                    console.log('---------------------')
                    console.log(JSON.stringify(data))
                    console.log('---------------------')

                    var ncName = customParamObj['obj']['opt']['ncName']
                    console.log('upload pre ncName: ', ncName)

                    var uploadResponse
                    var isMutiSystemResponse = false
                    _.each(data, function (ele, key) {
                      //因為key的param不確定，所以判斷是否包含字串"S_XXXX("
                      //if (key.indexOf("G_S_MUNCP(") > -1) {
                      if (
                        key.indexOf('G_S_MUNCP(') > -1 ||
                        key.indexOf('S_MUNCP(') > -1
                      ) {
                        //G_S_MUNCP新版，S_MUNCP舊版
                        if (
                          key.indexOf(ncName) < 0 ||
                          key.indexOf('@@@@@@@@@@') > -1
                        ) {
                          //不是上一次的結果或第一次
                          uploadResponse = ele
                          ncName = key //更新ncName
                        }
                        isMutiSystemResponse = true
                      } else if (key.indexOf('S_UNCP(') > -1) {
                        if (
                          key.indexOf(ncName) < 0 ||
                          key.indexOf('@@@@@@@@@@') > -1
                        ) {
                          //不是上一次的結果或第一次
                          uploadResponse = ele
                          ncName = key //更新ncName
                        }
                      }
                    })

                    if (uploadResponse != undefined) {
                      //undefined表示key不是S_MUNCP或S_UNCP
                      //if(data["S_UNCP()"] || data["S_MUNCP()"]){
                      console.log('***get data so stop***')
                      console.log(
                        'uploadResponse.values[0][0]: ',
                        uploadResponse.values[0][0]
                      )
                      customParamObj['obj']['opt']['ncName'] = ncName //更新ncName到opt留給下一個比對用

                      //uploadResponse.values[0][0] = "1) ReturnCode: EW_MODE(12), 2) Meaning: CNC mode error (in case of NC program in Series 160i/180i/210i, 0i-A/B/C, Power Mate i), 3) ErrorHandling: 3.1) MDI mode: Change CNC mode to any mode except MDI. 3.2) Background edit processing in CNC side: Terminate background edit processing in CNC side.";

                      var startTimeFormat = moment(startTime).format(
                        'YYYY-MM-DD HH:mm:ss.SSS'
                      )
                      var endTime = new Date()
                      var endTimeFormat = moment(endTime).format(
                        'YYYY-MM-DD HH:mm:ss.SSS'
                      )

                      if (uploadResponse.values[0][0] == '1') {
                        //回傳1表示上傳成功
                        //smallBox({selectColor: "green", title: "Upload success!", icon: "fa fa-check", timeout: 2000});

                        //上傳成功紀錄
                        context.recordProgramCommand(
                          machineId,
                          'Upload',
                          startTimeFormat,
                          endTimeFormat,
                          'Success',
                          programName
                        )
                        $uploadFileTable
                          .DataTable()
                          .cell(customParamObj.index, _UPLOAD_STATUS_INDEX)
                          .data('success')
                        console.log('currentIndex: ', customParamObj.index)
                        var newIndex = customParamObj.index + 1
                        sendUploadCmdCallback(
                          customParamObj.obj,
                          newIndex,
                          customParamObj.size,
                          sendUploadCmdCallback
                        )
                        $('.cancel-btn').hide()
                      } else {
                        //回傳1以外的值表示上傳失敗
                        if (
                          isMutiSystemResponse &&
                          _PROGRAM_UPLOAD_USE_G_S_MUNCP
                        ) {
                          //smallBox({selectColor: "red", title: "File : " + fileName + ",<br/> Message: " + uploadResponse.values[0][0], icon: "fa fa-warning", timeout: 600000});
                          //上傳失敗紀錄，回傳1
                          context.recordProgramCommand(
                            machineId,
                            'Upload',
                            startTimeFormat,
                            endTimeFormat,
                            'Fail',
                            programName
                          )
                          $('#fail-file-name').html(fileName)
                          $('#fail-msg').html(uploadResponse.values[0][0])
                          $('#msg-modal').modal('show')
                        } else {
                          smallBox({
                            selectColor: 'red',
                            title:
                              'Upload fail!, It may be insufficient memory capacity or already exists.',
                            icon: 'fa fa-warning',
                            timeout: 30000,
                          })
                        }
                        $uploadFileTable
                          .DataTable()
                          .cell(customParamObj.index, _UPLOAD_STATUS_INDEX)
                          .data('fail')
                      }
                      return true
                    } else {
                      console.log('not get data...')
                      return false
                    }
                  },
                  timeoutCallback: function (customParamObj) {
                    //timeout時的callback
                    //上傳失敗紀錄，timeout
                    var startTimeFormat = moment(startTime).format(
                      'YYYY-MM-DD HH:mm:ss.SSS'
                    )
                    var endTime = new Date()
                    var endTimeFormat = moment(endTime).format(
                      'YYYY-MM-DD HH:mm:ss.SSS'
                    )

                    context.recordProgramCommand(
                      machineId,
                      'Upload',
                      startTimeFormat,
                      endTimeFormat,
                      'Fail',
                      programName
                    )

                    $uploadFileTable
                      .DataTable()
                      .cell(customParamObj.index, _UPLOAD_STATUS_INDEX)
                      .data('timeout')
                    unblockUploadBtn()
                  },
                  failCallback: function (customParamObj) {
                    //timeout時的callback
                    unblockUploadBtn()
                  },
                })
              }
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
            var colors = {
              green: '#739E73',
              red: '#C46A69',
              yellow: '#C79121',
            }
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
    util: {
      recordProgramCommand(
        machineId,
        action,
        command_start_time,
        command_end_time,
        result,
        program
      ) {
        $.ajax({
          url: 'api/v3/servcore/record/cnc/programCommand',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
            machine: machineId,
            action: action,
            command_start_time: command_start_time,
            command_end_time: command_end_time,
            result: result,
            program: program,
          }),
        })
      },
    },
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
