export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.initMachineSelect()

      var $inputFile = $('#inputFile')
      var $uploadBtn = $('#upload-btn')
      var $uploadFilePath = $('#uploadFilePath')

      $inputFile.on('change', function () {
        $uploadFilePath.val(this.value)
      })

      $uploadBtn.on('click', function (e) {
        e.preventDefault()

        var machineId = context.$machineSelect.val()

        if (!window.FileReader) {
          //alert("Your browser is not supported");
          //smallBox({selectColor: "red", title: "Your browser is not supported!", icon: "fa fa-warning", timeout: 2000});
          $.smallBox({
            title: 'Your browser is not supported!',
            content: "<i class='fa fa-clock-o'></i> <i>2 seconds ago...</i>",
            color: '#C79121',
            iconSmall: 'fa fa-warning',
            timeout: 2000,
          })
        }
        var reader = new FileReader()
        var input = $inputFile.get(0)
        if (input.files.length) {
          if (!$uploadFilePath.val().endsWith('.csv')) {
            $.smallBox({
              title: "Please upload a 'csv' file...",
              content: "<i class='fa fa-clock-o'></i> <i>2 seconds ago...</i>",
              color: '#C79121',
              iconSmall: 'fa fa-warning',
              timeout: 2000,
            })
            return
          }
          var textFile = input.files[0]
          var fileName = $inputFile.val().split('\\').pop()
          reader.readAsText(textFile)
          $(reader).on('load', function (e) {
            var file = e.target.result
            if (file && file.length) {
              //console.log(file);
              var colIndexByHeaders = {}
              var formatError = []
              var positionTemp = []
              var records = file.split('\n')
              var hasException = false
              _.each(records, function (record, index) {
                if (record.trim().length === 0) {
                  return
                }
                var cols = $.csv.toArray(record) //record.split(',');
                if (index === 0) {
                  for (var colIndex = 0; colIndex < cols.length; colIndex++) {
                    colIndexByHeaders[cols[colIndex]] = colIndex
                  }
                } else {
                  var checkFormat = function (row, positionTemp, formatError) {
                    var index = row[colIndexByHeaders['index']].toString()
                    var position = row[colIndexByHeaders['position']].toString()
                    var type = row[colIndexByHeaders['type']].toString()
                    var color = row[colIndexByHeaders['color']].toString()
                    var max = row[colIndexByHeaders['max']].toString()
                    //檢查position是否重複
                    if (
                      _.contains(
                        ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
                        position.trim()
                      )
                    ) {
                      if (_.contains(positionTemp, position)) {
                        formatError.push(
                          'index: ' +
                            index +
                            ", 'position' duplicate data: " +
                            position
                        )
                      } else {
                        positionTemp.push(position)
                      }
                    }

                    //檢查position是否重複
                    if (
                      !_.contains(
                        [
                          'line_chart',
                          'progress',
                          'pie_chart',
                          'switch',
                          'text',
                        ],
                        type.trim()
                      )
                    ) {
                      formatError.push(
                        'index: ' + index + ", 'type' format error: " + type
                      )
                    }

                    //檢查顏色
                    if (
                      !_.contains(
                        ['green', 'blue', 'black', 'brown', 'red'],
                        color.trim()
                      )
                    ) {
                      formatError.push(
                        'index: ' + index + ", 'color' format error: " + color
                      )
                    }
                    //檢查是否為數字
                    if (_.isNaN(parseFloat(max))) {
                      formatError.push(
                        'index: ' + index + ", 'max' format error: " + max
                      )
                    }
                  }
                  try {
                    checkFormat(cols, positionTemp, formatError)
                  } catch (e) {
                    console.warn(e)
                    $.smallBox({
                      title: "Please upload a 'csv' file wrong format...",
                      content:
                        "<i class='fa fa-clock-o'></i> <i>2 seconds ago...</i>",
                      color: '#C79121',
                      iconSmall: 'fa fa-warning',
                      timeout: 2000,
                    })
                    hasException = true
                    return
                  }
                }
              })
              if (hasException) {
                return
              }

              if (formatError.length > 0) {
                var errorInfo = ''
                _.each(formatError, function (error) {
                  errorInfo = errorInfo + error + '<br/>'
                })
                $.smallBox({
                  title: errorInfo,
                  content:
                    "<i class='fa fa-clock-o'></i> <i>2 seconds ago...</i>",
                  color: '#C79121',
                  iconSmall: '',
                  timeout: 60000,
                })
                return
              } else {
                context.saveAPlusMachineParamFile(machineId, file)
              }
            }
          })
        } else {
          //alert('Please upload a file before continuing')
          //smallBox({selectColor: "red", title: "Please upload a file before continuing!", icon: "fa fa-warning", timeout: 2000});
          $.smallBox({
            title: 'Please upload a file before continuing!',
            content: "<i class='fa fa-clock-o'></i> <i>2 seconds ago...</i>",
            color: '#C79121',
            iconSmall: 'fa fa-warning',
            timeout: 2000,
          })
        }
      })

      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()

        var machineId = context.$machineSelect.val()

        /* init selector */
        var $crudTable = $('#crud-table')

        var $crudTableModalDelete = $('#crud-table-modal-delete')

        //var saveBtn = '<button id="save-btn" class="btn btn-primary" style="margin-right:5px"><span class="fa fa-save"></span></button>';
        //var deleteBtn = '<button id="delete-btn" class="btn btn-danger" style="margin-right:5px" data-toggle="modal" data-target="#crud-table-modal-delete"><span class="fa fa-trash-o"></span></button>';
        //var refreshBtn = '<button id="' + refreshBtnId + '" class="btn btn-primary" title="Refresh" style="margin-right:5px"><span class="fa fa-refresh"></span></button>';

        read(machineId)

        function read(machineId) {
          $('#crud-table').off('input')
          context.getAPlusMachineParamFile(machineId, function (csv) {
            var headers = csv.shift()
            console.log(headers)
            /*_.each(csv, function(record, index){
                    record[8] = parseInt(record[8]);
                    csv[index] = record;
                });*/

            initDatatable(machineId, headers)

            $crudTable.DataTable().clear().draw() //清除datatable資料
            $crudTable.DataTable().rows.add(csv).draw() //重新放入資料到datatable

            context.loadingBtn.done()

            $('#machine-setting-name').html(
              '(' + servkit.getMachineName(machineId) + ')'
            )

            //更新資料事件
            /*$('#crud-table').on('input', 'td.text-left',function(e) {
                    var $td = $(this);
                    console.log($td.html());
                    console.log(e);
                    console.log(e.originalEvent.data);
                    //$('#crud-table').DataTable().cell($td).data($td.html());
                });*/

            //更新資料事件
            $('#crud-table').on('blur', 'td.text-left.edit', function (e) {
              var $td = $(this)
              $('#crud-table').DataTable().cell($td).data($td.html())
            })
          })
        }

        function initDatatable(machineId, headers) {
          var canEditCols = []

          var colIndexByHeaders = {}

          var headerCols = []
          var colsSettings = []
          var columnDefs = []
          var excelSetting = {
            headMatrix: [[]],
            colIndexArr: [],
          }
          _.each(headers, function (header, index) {
            colIndexByHeaders[header] = index
            headerCols.push({
              key: header,
              name: header,
            })
            if (_.contains(canEditCols, header)) {
              colsSettings.push({
                className: 'text-left edit',
                width: '',
              })
              columnDefs.push({
                targets: index,
                createdCell: function (td, cellData, rowData, row, col) {
                  $(td)
                    .attr('contenteditable', true)
                    .css('background-color', 'white')
                    .css('color', 'green')
                },
              })
            } else {
              colsSettings.push({
                className: 'text-left',
                width: '',
              })
            }
            excelSetting.headMatrix[0].push(header)
            excelSetting.colIndexArr.push(index)
          })
          console.log('colIndexByHeaders: ', colIndexByHeaders)
          //headerCols.push({key: '修改', name: '修改'});
          /*colsSettings.push({"className": "text-center", "width": "",
                                    "render": function(data, type, row, meta){//設置href連結
                                        //console.log(row);
                                        return '<button class="btn btn-xs btn-success clear-history-btn">修改</button>';
                                    }
                                });*/
          /* datatables 設定 */
          var datatablesConfig = {
            selector: $crudTable, //table id selector
            headColumns: headerCols,
            options: {
              //datatables原生設定
              stateSave: true,
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
                "<'dt-toolbar'<'col-xs-12 col-sm-6'<'#custom-btn'>><'col-xs-12 col-sm-6 table-search'f>r>" + //datatable上面的bar
                't' + //datatable
                "<'dt-toolbar-footer'<'col-xs-12 col-sm-2'<'custom-download'>><'col-xs-12 col-sm-3 hidden-xs'l><'col-xs-12 col-sm-3 hidden-xs'i><'col-xs-12 col-sm-4'p>>", //datatable下面的bar
              columns: colsSettings,
              columnDefs: columnDefs,
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
            customDownload: {
              //自製的download，因為datatables提供的只能使用在chrome瀏覽器...，且還有某些bug造成trigger失效QQ，逼不得已只好自製...
              /*
                            fileName: 下載檔案的檔名，例: fileName: 表格
                            headMatrix: 下載時要使用的header，因為支援complex header所以使用matrix，且當header連續相同時會合併header (excel限定)，
                                        例: headMatrix:[["合併1", "合併1", "單欄"], ["欄位1", "欄位2", "欄位3"]]，
                                        excel的header格式:
                                            |    合併1  |單欄 |
                                            |欄位1|欄位2|欄位3|
                            colIndexArr: 要列印datatables哪些欄的值(index從0開始)，例:[0, 2, 4]
                            excelColFormat:
                                        例: excelColFormat:["text", "0", "0.00%"]
                                        文字: "text"
                                        數字: "0"
                                        浮點數"0.0"
                                        百分比"0.00%"

                        */
              fileName: servkit.getMachineName(machineId),
              headMatrix: excelSetting.headMatrix,
              colIndexArr: excelSetting.colIndexArr,
              //excelColFormat: ["text", "text", "text"]
            },
          }
          //建立datatables
          context.commons.custDatatables(datatablesConfig)
        }
      })
    },
    util: {
      $machineSelect: $('#machine'),
      $submitBtn: $('#submit-btn'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      initMachineSelect: function () {
        var machineSelectHtml = ''
        servkit.eachMachine(function (id, name) {
          machineSelectHtml +=
            '<option style="padding:3px 0 3px 3px;" value="' +
            id +
            '">' +
            name +
            '</option>'
        })
        this.$machineSelect.append(machineSelectHtml)
        //servkit.multiselectHeightOptimization(this.$machineSelect[0]);
        //this.$machineSelect.on("mousedown", servkit.multiselectWithoutCtrlMouseDown)
        //                   .on("mousemove", servkit.multiselectWithoutCtrlMouseMove);
      },

      saveAPlusMachineParamFile: function (machineId, data) {
        servkit.ajax(
          {
            //
            url: 'api/getdata/custParamFileSave',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              filePath: 'a_plus/template/' + machineId + '.csv',
              data: data,
            }),
          },
          {
            success: function (response) {
              $.smallBox({
                title: 'save file success',
                content:
                  "<i class='fa fa-clock-o'></i> <i>2 seconds ago...</i>",
                color: '#739E73',
                iconSmall: '',
                timeout: 2000,
              })
            },
            fail: function (response) {
              $.smallBox({
                title: response,
                content:
                  "<i class='fa fa-clock-o'></i> <i>2 seconds ago...</i>",
                color: '#C46A69',
                iconSmall: '',
                timeout: 10000,
              })
            },
          }
        )
      },

      getAPlusMachineParamFile: function (machineId, callback) {
        var userId = JSON.parse(window.sessionStorage.getItem('loginInfo'))[
          'user_id'
        ]
        //讀取參數檔
        servkit.ajax(
          {
            url: 'api/getdata/custParamFile',
            type: 'GET',
            contentType: 'application/json',
            data: {
              filePath: 'a_plus/template/' + machineId + '.csv',
            },
          },
          {
            success: function (response) {
              var csv = []
              _.each(response, function (row) {
                var cols = $.csv.toArray(row)
                //console.log(cols);
                csv.push(cols)
              })
              callback(csv)
            },
            fail: function (response) {
              //使用者沒設，讀預設的
              $.smallBox({
                title:
                  "machine: '" +
                  servkit.getMachineName(machineId) +
                  "' msg: " +
                  response,
                content:
                  "<i class='fa fa-clock-o'></i> <i>2 seconds ago...</i>",
                color: '#C79121',
                iconSmall: '',
                timeout: 60000,
              })
            },
          }
        )
      },
    },
    delayCondition: ['machineList'],
    dependencies: [
      [
        '/js/plugin/flot/jquery.flot.cust.min.js',
        '/js/plugin/flot/jquery.flot.resize.min.js',
        '/js/plugin/flot/jquery.flot.fillbetween.min.js',
        '/js/plugin/flot/jquery.flot.orderBar.min.js',
        '/js/plugin/flot/jquery.flot.pie.min.js',
        '/js/plugin/flot/jquery.flot.tooltip.min.js',
        '/js/plugin/flot/jquery.flot.axislabels.js',
      ],
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
    ],
  })
}
