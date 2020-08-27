import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      pageSetUp()
      ;(function () {
        var monitor = function () {
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
          var startTime
          var programName
          $('#leave').on('click', function () {
            window.location =
              '#app/ProgTransmit/function/' +
              lang +
              '/01_machines_delete.html' +
              locationParams
          })

          var isMutiSystem = cncBrand == 'FANUC_CNC_FOCAS' // = true;//是否是多系統

          //預設為單系統，所以要隱藏系統2 tab
          $('[href="#system2"]').closest('li').hide()

          var singleMonitorCmd = {
            //單系統box監控命令
            name: 'cnc_NCList',
            cycleType: 'count',
            cycleValue: 1,
            timeout: 0,
            items: [
              {
                signal: {
                  id: 'G_PGIF',
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

          var multiMonitorCmd = {
            //單系統box監控命令
            name: 'cnc_NCList_multiSystem',
            cycleType: 'count',
            cycleValue: 1,
            timeout: 0,
            items: [
              {
                signal: {
                  id: 'G_MPGIF',
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

          var monitorCmd
          if (isMutiSystem) {
            //box監控命令
            monitorCmd = multiMonitorCmd
          } else {
            monitorCmd = singleMonitorCmd
          }

          var tableHeadColumns = [
            {
              id: 'names',
              name: `${i18n('Program')}`,
              dataWidth: '30%',
            },
            {
              id: 'sizes',
              name: `${i18n('Size')}`,
              dataWidth: '20%',
            },
            {
              id: 'notes',
              name: `${i18n('Note')}`,
              dataWidth: '30%',
            },
            {
              id: 'download',
              name: '刪除',
              dataWidth: '10%',
            },
            /*{
              id: "download-select",
              name: `${i18n('Select_File')}`,
              dataWidth: "10%"
            },*/
          ]

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
            monitorCmd: monitorCmd,
            monitorCmdVersion: 'v1.0',
            timeoutLimit: 120000,
            customCallback: function (data) {
              //客製化
              console.log('---------------------')
              console.log(JSON.stringify(data))
              console.log('---------------------')
              //var copiedObject = jQuery.extend(true, {}, originalObject)
              if (data['G_PGIF()'] || data['G_MPGIF()']) {
                var gCodeKey
                if (data['G_PGIF()']) {
                  gCodeKey = 'G_PGIF()'
                } else {
                  gCodeKey = 'G_MPGIF()'
                }

                if (data[gCodeKey].values.length >= 2) {
                  //若values有兩個以上表示系統至少有兩個
                  $('[href="#system2"]').closest('li').show() //打開系統2 tab
                }

                _.each(data[gCodeKey].values, function (ncList, ncListIndex) {
                  var tableOptions = {
                    sDom:
                      "<'dt-toolbar'<'col-xs-12 col-sm-6 table-search'f>r<'col-xs-12 col-sm-6'<'#custom-btn" +
                      (ncListIndex + 1) +
                      "'>>>" +
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
                        //下載加工程式連結
                        className: 'text-left',
                        mRender: function (data, type, full) {
                          return (
                            "<a href='javascript:void(0)' ><span  name=" +
                            data +
                            " class='btn btn-success download-btn'>刪除</span></a>"
                          )
                        },
                        // "width": "10%"
                      },
                    ],
                    autoWidth: true,
                    ordering: false,
                    //"paging": false,
                    //"lengthChange": false
                  }

                  //為了不要讓資料交互影響，所以 copy object
                  var tableOptionsCopy = jQuery.extend(true, {}, tableOptions)

                  console.log(ncList)
                  var ncMatrix = []
                  _.each(ncList, function (ele) {
                    if (array == 'B') {
                      //避免因為回傳B造成無法分成3欄的問題
                      return
                    }
                    var tempArr = ['', '', ''] //***不一定有三欄，所以要先初始化
                    var array = ele.split('|')
                    for (var index = 0; index < array.length; index++) {
                      tempArr[index] = array[index]
                    }
                    //檔案大小欄位，轉換單位
                    tempArr[1] = sizeUnit(array[1])
                    //console.log("temp: ", tempArr);
                    ncMatrix.push(tempArr)
                  })

                  //增加最後一欄當作下載btn
                  _.each(ncMatrix, function (ele, index) {
                    if (gCodeKey == 'G_PGIF()') {
                      //單系統
                      ncMatrix[index].push(ele[0])
                    } else {
                      //多系統(會多一欄，變成4欄，所以直接覆蓋第4欄)
                      ncMatrix[index][3] = ele[0]
                    }
                  })

                  //2016/11/18增加最後一欄當作多重下載checkbox
                  /*_.each(ncMatrix, function (ele, index) {
                    ncMatrix[index].push({
                      "value": ele[0],
                      "system": (ncListIndex + 1)
                    });
                  });*/

                  //console.log(ncMatrix);

                  //設定資料
                  tableOptionsCopy['data'] = ncMatrix
                  var currentId = 'response-data-table'
                  if (ncListIndex >= 1) {
                    //系統2以後table id要加流水號
                    currentId += ncListIndex + 1
                  }

                  tableOptionsCopy['customsystem'] = ncListIndex + 1 //給callback拿第幾個系統用的

                  //長table
                  servkit.monitor.tool({
                    type: 'TABLE',
                    config: {
                      id: currentId,
                      headColumns: tableHeadColumns,
                      options: tableOptionsCopy,
                      customCallback: function (options) {
                        var currentSystem = options['customsystem'] //第幾個系統(因為是callback，所以要用傳的方式拿，不能用ncListIndex去拿，不然可能拿到別的系統....)
                        console.log('currentSystem: ', currentSystem)
                        //多檔下載button
                        //$("#custom-btn" + currentSystem).html('<button id="multi-download-btn' + currentSystem + '" class="btn btn-info pull-right" title="multi-download' + currentSystem + '" customsystem="' + currentSystem + `" style="margin-right:5px">${i18n('Multi_File_Download')}</button>`);
                        //多個加工程式一次下載
                        $('#multi-download-btn' + currentSystem).on(
                          'click',
                          function () {
                            console.log($(this).attr('customsystem'))
                            var customsystem = $(this).attr('customsystem')
                            var tableId = 'response-data-table'
                            if (customsystem >= 2) {
                              //系統2以後table id要加流水號
                              tableId += customsystem
                            }
                            var checkBoxs = $('#' + tableId)
                              .DataTable()
                              .column(4)
                              .nodes()
                            var ncNames = []
                            _.each(checkBoxs, function (ele) {
                              var checkBoxInput = ele.children
                              if ($(checkBoxInput).is(':checked')) {
                                var progName = $(checkBoxInput).val()
                                console.log(progName)
                                ncNames.push(progName)
                              }
                            })
                            var systemIndex = ncListIndex + 1 //系統幾
                            var opt = {
                              boxId: boxId,
                              machineId: machineId,
                              systemIndex: systemIndex,
                              gCodeKey: gCodeKey,
                            }
                            sendMultiDownloadCmd(opt, ncNames)
                          }
                        )
                      },
                    },
                  })

                  if (data['G_MSZAV()']) {
                    //有資料才做，不然會造成table長不出資料
                    var szav1 = data['G_MSZAV()'].values[0][0] || 0
                    var szav2 = data['G_MSZAV()'].values[1]
                      ? data['G_MSZAV()'].values[1][0]
                      : 0

                    $('#SZAV1').html(
                      `【${i18n('Remaining_Storage')}】：` + sizeUnit(szav1)
                    )
                    $('#SZAV2').html(
                      `【${i18n('Remaining_Storage')}】：` + sizeUnit(szav2)
                    )
                  }

                  //加工程式下載
                  $('#' + currentId).on('click', '.download-btn', function () {
                    var systemIndex = ncListIndex + 1 //系統幾
                    var ncName = $(this).attr('name')
                    var opt = {
                      boxId: boxId,
                      machineId: machineId,
                      systemIndex: systemIndex,
                      gCodeKey: gCodeKey,
                      rowElement: $(this),
                    }
                    if (confirm('確定要刪除' + ncName + '?')) {
                      sendMultiDownloadCmd(opt, [ncName])
                      programName = ncName
                    }
                  })
                }) //system for each end
                $('#response-data-table')
                  .closest('.jarviswidget')
                  .find('.fa-plus')
                  .click() //打開widget
                console.log('***get data so stop***')
                return true
              } else {
                console.log('not get data...')

                var endTime = new Date()
                var startTimeFormat = moment(startTime).format(
                  'YYYY-MM-DD HH:mm:ss.SSS'
                )
                var endTimeFormat = moment(endTime).format(
                  'YYYY-MM-DD HH:mm:ss.SSS'
                )
                //刪除失敗紀錄
                context.recordProgramCommand(
                  machineId,
                  'Delete',
                  startTimeFormat,
                  endTimeFormat,
                  'Fail',
                  programName
                )

                return false
              }
              //var modaArray = data[0]['G_MODA()'].values[0];
            },
          })

          //
          function sendMultiDownloadCmd(opt, ncNames) {
            //ncNames: [ncName1, ncName2, ...]
            //刪除開始時間
            startTime = new Date()

            var obj = {
              opt: opt,
              ncNames: ncNames,
              downloadFiles: [],
            }
            //multiDownloadCb(obj, 0, ncNames.length, multiDownloadCb);
            sendDownloadCmd(obj, 0, ncNames.length, sendDownloadCmd)
          }

          //
          /*function multiDownloadCb(obj, index, size, callback){
            if(index >= size){
              return;
            }
            var opt = obj["opt"];
            var ncName = obj["ncNames"][index];
            console.log("index: ", index, ", ncName: ", ncName);
            sendDownloadCmd(opt, ncName)
            index++;
            callback(obj, index, size, callback);
          }*/

          function sendDownloadCmd(obj, index, size, sendDownloadCmdCallback) {
            if (index >= size) {
              console.log('downloadFiles: ', obj['downloadFiles'])
              var downloadFiles = obj['downloadFiles']
              switch (downloadFiles.length) {
                case 0:
                  smallBox({
                    selectColor: 'red',
                    title: 'No files selected',
                    icon: 'fa fa-warning',
                    timeout: 30000,
                  })
                  break
                case 1:
                  var fileName = downloadFiles[0].fileName
                  var fileContent = downloadFiles[0].fileContent
                  //downloadTxt(fileName, fileContent);
                  if (fileContent == '1') {
                    smallBox({
                      selectColor: 'green',
                      title: 'delete ' + fileName + ' success',
                      icon: 'fa fa-warning',
                      timeout: 5000,
                    })
                    if (obj['opt']) {
                      var rowElement = obj['opt'].rowElement
                      console.log('opt', rowElement)
                      var $table
                      var system = obj['opt'].systemIndex
                      if (system >= 2) {
                        $table = $('#response-data-table' + system).DataTable()
                      } else {
                        $table = $('#response-data-table').DataTable()
                      }
                      //console.log($table, $table.rows().remove.draw());
                      $table.row(rowElement.parents('tr')).remove().draw()
                    }
                    //setTimeout(function(){location.reload()}, 3000);
                  } else {
                    smallBox({
                      selectColor: 'red',
                      title: fileContent,
                      icon: 'fa fa-warning',
                      timeout: 30000,
                    })
                  }

                  break
                default:
                  /*global JSZip:true*/
                  var zip = new JSZip()
                  _.each(downloadFiles, function (ele) {
                    var fileName = ele.fileName
                    var fileContent = ele.fileContent
                    zip.file(fileName, fileContent)
                  })
                  zip
                    .generateAsync({
                      type: 'blob',
                    })
                    .then(function (content) {
                      //console.log("*** content: ", content);
                      var zipFileName =
                        moment().format('YYYYMMDDHHmmss') + '.zip'
                      /*global saveAs:true*/
                      saveAs(content, zipFileName)
                    })
                  break
              }
              return
            }

            var opt = obj['opt']
            var ncName = obj['ncNames'][index]

            var boxId = opt.boxId
            var machineId = opt.machineId
            var systemIndex = opt.systemIndex
            var gCodeKey = opt.gCodeKey

            console.log(
              'sendCmd... boxId: ',
              boxId,
              ', machineId: ',
              machineId,
              ', system: ',
              systemIndex,
              ', gCodeKey: ',
              gCodeKey,
              ', ncName: ',
              ncName
            )

            //////////////////////
            var monitorDownloadCmd
            /*var signalMonitorDownloadCmd = { //box監控命令
              "name": "cnc_NCDownload",
              "cycleType": "count",
              "cycleValue": 1,
              "timeout": -1,
              "items": [{
                "signal": {
                  "id": "G_DNCP",
                  "inputs": {
                    "P_PARAM": ""
                  }
                },
                "collect": {
                  "waitMs": 0,
                  "count": 1
                }
              }]
            };*/
            var multiMonitorDownloadCmd = {
              //box監控命令
              name: 'cnc_NCDelete_multiSystem',
              cycleType: 'count',
              cycleValue: 1,
              timeout: -1,
              items: [
                {
                  signal: {
                    id: 'G_S_MDELP',
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

            if (gCodeKey == 'G_PGIF()') {
              //單系統
              monitorDownloadCmd = multiMonitorDownloadCmd
            } else {
              //多系統
              monitorDownloadCmd = multiMonitorDownloadCmd
              monitorDownloadCmd.items[0].signal.inputs[
                'P_STRING'
              ] = systemIndex.toString() //系統幾
            }
            monitorDownloadCmd.items[0].signal.inputs['P_PARAM'] = ncName //加工程式名稱
            console.log(JSON.stringify(monitorDownloadCmd))
            //送監控命令
            servkit.monitor({
              type: 'SEND',
              boxId: boxId,
              machineId: machineId,
              monitorCmd: monitorDownloadCmd,
              monitorCmdVersion: 'v1.0',
              timeoutLimit: 120000,
              blockMsg: 'delete ' + ncName, //"download (" + (index + 1) + "/" + size + ") " + ncName,
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
                //單系統:G_DNCP(O0001), 雙系統:G_MDNCP(O0001,1) or G_MDNCP(O0001,2)
                var endTime = new Date()
                var startTimeFormat = moment(startTime).format(
                  'YYYY-MM-DD HH:mm:ss.SSS'
                )
                var endTimeFormat = moment(endTime).format(
                  'YYYY-MM-DD HH:mm:ss.SSS'
                )

                if (data['G_S_MDELP(' + ncName + ',' + systemIndex + ')']) {
                  //
                  var fileName = ncName // + ".txt";
                  var fileContent =
                    data['G_S_MDELP(' + ncName + ',' + systemIndex + ')']
                      .values[0][0]
                  /*if (data["G_DNCP(" + ncName + ")"]) {
                    fileContent = data["G_DNCP(" + ncName + ")"].values[0][0];
                  } else {
                    fileContent = data["G_MDNCP(" + ncName + "," + systemIndex + ")"].values[0][0];
                  }*/
                  //downloadTxt(fileName, fileContent);
                  console.log('***get data so stop***')
                  console.log('currentIndex: ', customParamObj.index)
                  var newIndex = customParamObj.index + 1
                  customParamObj['obj']['downloadFiles'].push({
                    fileName: fileName,
                    fileContent: fileContent,
                  })
                  sendDownloadCmdCallback(
                    customParamObj.obj,
                    newIndex,
                    customParamObj.size,
                    sendDownloadCmdCallback
                  )

                  //刪除成功紀錄
                  context.recordProgramCommand(
                    machineId,
                    'Delete',
                    startTimeFormat,
                    endTimeFormat,
                    'Success',
                    programName
                  )

                  return true
                } else {
                  if (data['G_DNCP(SERVCLOUD_DEMO)']) {
                    //DEMO跑測試資料
                    var fileName2 = ncName + '.txt'
                    var fileContent2 =
                      data['G_DNCP(SERVCLOUD_DEMO)'].values[0][0]
                    //downloadTxt(fileName2, fileContent2);
                  }
                  console.log('not get data...')

                  return false
                }
              },
            })
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

          function downloadTxt(fileName, fileContent) {
            var text = fileContent
            var blob = new Blob([text], {
              type: 'text/txt',
            }) //;
            //辨識 ie
            var ie = navigator.userAgent.match(/MSIE\s([\d.]+)/),
              ie11 =
                navigator.userAgent.match(/Trident\/7.0/) &&
                navigator.userAgent.match(/rv:11/),
              ieEDGE = navigator.userAgent.match(/Edge/g),
              ieVer = ie ? ie[1] : ie11 ? 11 : ieEDGE ? 12 : -1
            //ie版本小於10，送出升級ie訊息
            if (ie && ieVer < 10) {
              console.warn('No blobs on IE ver < 10')
              smallBox({
                selectColor: 'yellow',
                title: 'Please upgrade to version ie 10 or more',
                icon: 'fa fa-warning',
                timeout: 2000,
              })
              return
            }

            //ie 瀏覽器
            if (ieVer > -1) {
              window.navigator.msSaveBlob(blob, fileName)
            } else {
              //其他瀏覽器 (chrome、firefox)
              //***舊版 ie無法使用...
              var myURL = window.URL || window.webkitURL
              var csvUrl = myURL.createObjectURL(blob)

              var link = document.createElement('a')
              link.id = 'lnkDwnldLnk'
              document.body.appendChild(link)

              jQuery('#lnkDwnldLnk').attr({
                download: fileName,
                href: csvUrl,
              })
              jQuery('#lnkDwnldLnk')[0].click()
              document.body.removeChild(link)
            }
          }

          //顯示ie更新訊息
          function smallBox(params) {
            //selectColor, title, icon, timeout
            var colors = {
              green: '#739E73',
              red: '#C46A69',
              yellow: '#C79121',
            }
            $.smallBox({
              title: params.title,
              content: "<i class='fa fa-clock-o'></i> <i>1 seconds ago...</i>",
              color: colors[params.selectColor],
              iconSmall: params.icon,
              timeout: params.timeout,
            })
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
        }
        servkit.requireJs(
          [
            '/js/notification/SmartNotification.min.js',
            '/js/plugin/datatables/jquery.dataTables.min.js',
            '/js/plugin/datatables/dataTables.colVis.min.js',
            '/js/plugin/datatables/dataTables.tableTools.min.js',
            '/js/plugin/datatables/dataTables.bootstrap.min.js',
            '/js/plugin/datatable-responsive/datatables.responsive.min.js',
            '/js/plugin/filesaver/FileSaver.min.js',
            '/js/plugin/jszip/jszip.min.js',
          ],
          monitor
        )
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
