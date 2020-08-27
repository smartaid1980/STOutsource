import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      var allBox = []
      var machineBrandMap = {}
      var lightMap = {}
      var machineIdMap = {}
      /* init selector */
      var $crudTable = $('#crud-table')

      var _CAN_UPLOAD_DOWNLOAD_BRAND = {
        FANUC_CNC_FOCAS: true,
      } //可以上下傳的廠牌

      /* init table info */
      var tableInfoObj = {
        //***請變更我
        /* 
              index: datatable欄位index，因為當要塞資料到datatable時需要知道要塞到哪一欄
              id: form上欄位的id，有時會使用到
              selector: jquery selector，用來取資料或者設置資料到form上面
              dbKey: db上欄位的key，透過ajax對db做crud時需要知道哪個值要對映到db哪一欄
              i18nVal: datatable header會需要做i18n
            */
        boxId: {
          index: 0,
          id: 'box-id',
          selector: $('#box-id'),
          dbKey: 'box_id',
          i18nVal: 'BoxId',
        },
        machineId: {
          index: 1,
          id: 'machine-id',
          selector: $('#machine-id'),
          dbKey: 'device_id',
          i18nVal: `${i18n('Name')}`,
        },
        status: {
          index: 2,
          id: 'status',
          selector: $('#status'),
          dbKey: 'status',
          i18nVal: `${i18n('Status')}`,
        },
        btn: {
          index: 3,
          id: 'btn',
          selector: $('#btn'),
          dbKey: 'btn',
          i18nVal: '程式刪除',
        },
      }

      /* datatables 設定 */
      var datatablesConfig = {
        selector: $crudTable, //table id selector
        headColumns: [
          /* {
                    key: db table欄位名稱, 
                    name: datatable欄位名稱, 
                    tooltip: 滑鼠移到header時，要顯示的訊息,
                    notData: 欄位不是放資料(放按鈕或其他), 
                    notFilterCol: 不使用單欄filter功能,
                    dataHide: 隱藏欄位-> always:永不顯示, phone:手機解析度隱藏 , tablet:平板解析度隱藏, 例: dataHide:"phone, tablet" 則在phone和tablet解析度時不顯示
                    custAttr: header上增加客製化attribute
                    
                    ps: 
                    若想在不同解析度觀看隱藏欄位，需在第一欄增加attribute -> data-class='expand'，當有隱藏欄位時，第一欄會有[+]的符號，點擊後可看到隱藏的資料
                    也可在隱藏欄位上增加attribute -> data-name='xxx'，變更隱藏欄位的head
                  }
                */
          {
            key: tableInfoObj.boxId.dbKey,
            name: tableInfoObj.boxId.i18nVal,
            dataHide: 'always',
            notFilterCol: true,
          }, //***請變更我
          {
            key: tableInfoObj.machineId.dbKey,
            name: tableInfoObj.machineId.i18nVal,
          }, //***請變更我
          {
            key: tableInfoObj.status.dbKey,
            name: tableInfoObj.status.i18nVal,
            notFilterCol: true,
          }, //***請變更我
          {
            key: tableInfoObj.btn.dbKey,
            name: tableInfoObj.btn.i18nVal,
            notData: true,
            notFilterCol: true,
          },
        ],
        options: {
          //datatables原生設定
          /* 
                  f: filter (datatable全欄位搜尋)
                  t: table (datatable 本體)
                  //T: toolbar (下載的bar，要設定oTableTools) ***不建議使用，因為存在某些bug
                  l: length changeing (每個pagging多少資料 -> 10, 25, 50, 100)
                  i: info (datatable 資訊 -> Showing 0 to 0 of 0 entries)
                  p: pagin (分頁 -> Previous 1 Next)
                  <"#id">: 自訂id，我們可以透過自訂id在header上長出button
                  <'custom-download'>: 自製的CSV和Excel下載bar, 使用前需要設定 customDownload 參數
                */
          //在此設定datatable和bar的樣式
          sDom:
            "<'dt-toolbar'<'col-xs-12 col-sm-6'<'#'>>r>" + //datatable上面的bar
            't' + //datatable
            "<'dt-toolbar-footer'<'col-xs-12 col-sm-2'><'col-xs-12 col-sm-3 hidden-xs'l><'col-xs-12 col-sm-3 hidden-xs'i><'col-xs-12 col-sm-4'p>>", //datatable下面的bar
          columns: [
            //在此設置col的 class和 col寬度
            {
              className: 'text-left',
              width: '',
            },
            {
              className: 'text-left',
              width: '30%',
            },
            {
              className: 'text-left',
              width: '30%',
              render: function (data, type, row, meta) {
                //設置href連結
                //console.log(data);
                return (
                  '<button id="' +
                  data +
                  '-light" class="btn machineLight" style="background:"></button>'
                )
              },
            },
            {
              className: 'text-center',
              width: '40%',
              render: function (data, type, row, meta) {
                //設置href連結
                console.log(data)
                var machineBrand = servkit.getMachineBrand(data)
                var disabledHtml = ''
                console.log(machineBrand)
                if (!_CAN_UPLOAD_DOWNLOAD_BRAND[machineBrand]) {
                  //不能做上下傳的廠牌就disabled
                  disabledHtml = 'disabled="disabled"'
                  //console.log("yes");
                }
                return (
                  '<button ' +
                  disabledHtml +
                  ' class="btn btn-xs btn-success setting-btn" value="' +
                  data +
                  '">程式刪除</button>'
                )
              },
            },
          ],
          /*"columnDefs":[{//在此對col的資料做處理，現在要在資料欄內放button
                "targets": -1,//倒數第二欄
                "data": null,
                //編輯按鈕html (綁modal)
                "defaultContent": '<button class="btn btn-xs btn-primary edit-btn" title="Edit" data-toggle="modal" data-target="' + $crudTableModal.selector + '">設定</button>'
              }],*/
          autoWidth: false, //禁止自動計算寬度
          ordering: false, //使否允許開起排序
          //"paging": false, //是否開起分頁
          //"lengthChange": false, //是否開啟 length change功能(每個pagging多少資料 -> 10, 25, 50, 100)
        },
      }
      //建立datatables
      context.commons.custDatatables(datatablesConfig)
      readData()
      $('.dt-toolbar').hide()

      //按下設定按鈕跳轉
      $crudTable.on('click', '.setting-btn', function (e) {
        e.preventDefault()
        var params = $(this).val()
        console.log(machineIdMap)
        console.log(params)
        var theParams = machineIdMap[params]
        //params = params.split("@@@");
        var lang = servkit.getCookie('lang')
        console.log(machineBrandMap, theParams[tableInfoObj.machineId.dbKey])
        var cncBrand = machineBrandMap[theParams[tableInfoObj.machineId.dbKey]]
        console.log(theParams)
        var downloadPageHtml = '03_cnc_multi_delete.html'
        /*if (servkit.configUseMultiDownloadProg()) {
            downloadPageHtml = "02_cnc_multi_download.html"; //多檔下載
          } else {
            downloadPageHtml = "02_cnc_download.html"; //單檔下載
          }*/

        window.location =
          '#app/ProgTransmit/function/' +
          lang +
          '/' +
          downloadPageHtml +
          '?boxId=' +
          theParams[tableInfoObj.boxId.dbKey] +
          '&machineId=' +
          theParams[tableInfoObj.machineId.dbKey] +
          '&cncBrand=' +
          cncBrand +
          '&preAppId=ProgTransmit&prePage=01_machines'
        /*context.gogoAnother({
              appId: 'ProgTransmit',
              funId: '02_cnc_download',
              currentTab: true,
              graceParam: {
                boxId: theParams[tableInfoObj.boxId.dbKey], //params[0],
                            machineId: theParams[tableInfoObj.machineId.dbKey], //params[1],
                        }
            });*/
      })

      function readData() {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'm_device_box',
              columns: ['device_id', 'box_id'],
            }),
          },
          {
            success: function (deviceBoxAry) {
              var matrix = []
              var data = _.sortBy(
                deviceBoxAry,
                (elem) => servkit.getMachineName(elem['device_id']),
                servkit.naturalCompareValue
              )
              var funcBindBrandMachineMap =
                context.preCon.funcBindBrandMachineMap
              if (funcBindBrandMachineMap.length > 0) {
                data = _.sortBy(
                  funcBindBrandMachineMap,
                  (elem) => servkit.getMachineName(elem['device_id']),
                  servkit.naturalCompareValue
                )
              }
              _.each(data, function (ele) {
                //console.log(ele);
                var machineId = ele[tableInfoObj.machineId.dbKey]
                //使用box當做key，當傳參數到其他頁面時會用到
                machineIdMap[machineId] = ele
                matrix.push([
                  ele[tableInfoObj.boxId.dbKey], //box
                  servkit.getMachineName(machineId), //機台
                  machineId, //狀態
                  machineId, //上下傳btn
                ])
              })
              // sort by machine name

              console.log(JSON.stringify(matrix))
              $crudTable.DataTable().clear().draw() //清除datatable資料
              $crudTable.DataTable().rows.add(matrix).draw() //重新放入資料到datatable
              updateStatus()
            },
            fail: function (data) {
              context.commons.smallBox({
                selectColor: 'red',
                title: 'Query失敗',
                icon: 'fa fa-sign-out',
                timeout: 2000,
              })
            },
          }
        )
      }

      function updateStatus() {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'm_box',
              columns: ['box_id'],
            }),
          },
          {
            success: function (boxIds) {
              servkit.ajax(
                {
                  url: 'api/getdata/db',
                  type: 'POST',
                  contentType: 'application/json',
                  data: JSON.stringify({
                    table: 'm_device_cnc_brand',
                    columns: ['device_id', 'cnc_id'],
                  }),
                },
                {
                  success: function (brandIds) {
                    servkit.ajax(
                      {
                        url: 'api/getdata/db',
                        type: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify({
                          table: 'm_device_light',
                          columns: ['light_id', 'light_name', 'color'],
                        }),
                      },
                      {
                        success: function (lights) {
                          var machineLigthDec = `<span>${i18n(
                            'Light_Status'
                          )}:</span>&nbsp;`
                          //console.log("boxIds: ", boxIds, " brandIds: ", brandIds);
                          _.each(boxIds, function (ele) {
                            allBox.push(ele[tableInfoObj.boxId.dbKey])
                          })
                          _.each(brandIds, function (ele) {
                            machineBrandMap[ele['device_id']] = ele['cnc_id']
                          })
                          _.each(lights, function (ele) {
                            lightMap[ele['light_id']] = ele['color']
                            machineLigthDec =
                              machineLigthDec +
                              '<span class="btn" style="background:' +
                              ele['color'] +
                              ';"></span>&nbsp;<span>' +
                              ele['light_name'] +
                              '</span>&nbsp;&nbsp;&nbsp;&nbsp;'
                          })
                          $('#machineLigth').html(machineLigthDec)
                          //console.log("allBox: ", allBox, machineBrandMap);
                          servkit.subscribe('DeviceStatus', {
                            machines: allBox,
                            dataModeling: true,
                            handler: function (data) {
                              _.each(data, function (dataEle) {
                                // each 某命令所有機台
                                dataEle.eachMachine('G_CONS()', function (
                                  multisystem,
                                  machineId
                                ) {
                                  //console.log(multisystem, machineId);
                                  var singleSystem = multisystem[0]
                                  $('#' + machineId + '-light').attr(
                                    'style',
                                    'background:' + lightMap[singleSystem[0]]
                                  )
                                  //console.log("#" + machineId + "-light", lightMap[singleSystem[0]], singleSystem[0], lightMap);
                                })
                              })
                            },
                            noDataHandler: function (data) {
                              _.each(data, function (dataEle) {
                                // each 某命令所有機台
                                dataEle.eachMachine('G_CONS()', function (
                                  multisystem,
                                  machineId
                                ) {
                                  //console.log(multisystem, machineId);
                                  var singleSystem = multisystem[0]
                                  $('#' + machineId + '-light').attr(
                                    'style',
                                    'background:' + lightMap[singleSystem[0]]
                                  )
                                  //console.log("#" + machineId + "-light", lightMap[singleSystem[0]], singleSystem[0], lightMap);
                                })
                              })
                            },
                          })
                        },
                        fail: function (data) {
                          context.commons.smallBox({
                            selectColor: 'red',
                            title: 'Query machine light fail...',
                            icon: 'fa fa-sign-out',
                            timeout: 2000,
                          })
                        },
                      }
                    )
                  },
                  fail: function (data) {
                    context.commons.smallBox({
                      selectColor: 'red',
                      title: 'Query cnc brand fail...',
                      icon: 'fa fa-sign-out',
                      timeout: 2000,
                    })
                  },
                }
              )
            },
            fail: function (data) {
              context.commons.smallBox({
                selectColor: 'red',
                title: 'Query boxId fail...',
                icon: 'fa fa-sign-out',
                timeout: 2000,
              })
            },
          }
        )
      }
    },
    util: {},
    delayCondition: ['machineList'],
    preCondition: {
      funcBindBrandMachineMap: function (done) {
        var that = this
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'm_view_device_cnc_brand',
              columns: ['app_id', 'func_id', 'device_id', 'box_id'],
            }),
          },
          {
            success: function (data) {
              var funcBindBrandMachines = _.where(data, {
                app_id: that.appId,
                func_id: that.funId,
              })
              done(funcBindBrandMachines)
            },
          }
        )
      },
    },
    dependencies: [
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
      [
        '/js/plugin/jquery-validate/jquery.validate.min.js',
        '/js/plugin/masked-input/jquery.maskedinput.min.js',
      ],
    ],
  })
}
