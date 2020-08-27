import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.initModalSelect()
      // context.initTables();
    },
    util: {
      $cusID: $('#cus_id'),
      $cusName: $('#cus_name'),
      $uniNo: $('#uni_no'),
      $tradeID: $('#trade_id'),
      $areaID: $('#area_id'),
      $phone: $('#phone'),
      $fax: $('#fax'),
      $address: $('#address'),
      $salesID: $('#sales_id'),
      $factorID: $('#factor_id'),
      $paymentGoods: $('#payment_goods'),
      $contactName: $('#contact_name'),
      $extPhone: $('#ext_phone'),
      $cellPhone: $('#cell_phone'),
      $email: $('#email'),
      getDBObject: {},
      initTradeSelect: function () {
        var that = this
        var dataConfig = {
          objKey: 'getTrade',
          tableName: 'a_aftersalesservice_cus_trade',
          columns: ['trade_id', 'trade_name'],
        }
        var callbackfunction = function () {
          var result
          var selectResultHtml
          var dataMap = {}
          _.map(that.getDBObject.getTrade, function (data) {
            dataMap[data.trade_id] = data.trade_name
          })
          servkit
            .politeCheck()
            .until(function () {
              return dataMap
            })
            .thenDo(function () {
              result = dataMap
              that.getDBObject['tradeObj'] = dataMap
              var selectHtml = ''
              _.each(_.keys(result).sort(), function (key) {
                selectHtml +=
                  '<option value="' + key + '" >' + result[key] + '</option>'
              })
              selectResultHtml = selectHtml
            })
            .tryDuration(0)
            .start()
          servkit
            .politeCheck()
            .until(function () {
              return selectResultHtml
            })
            .thenDo(function () {
              that.$tradeID[0].innerHTML = selectResultHtml
              that.$tradeID.prop('selectedIndex', -1)
            })
            .tryDuration(0)
            .start()
        }
        this.commons.getDataFromDB.apply(that, [dataConfig, callbackfunction])
      },
      initAreaSelect: function () {
        var that = this
        var dataConfig = {
          objKey: 'getArea',
          tableName: 'a_aftersalesservice_cus_area',
          columns: ['area_id', 'area_name'],
        }
        var callbackfunction = function () {
          var result
          var selectResultHtml
          var dataMap = {}
          _.map(that.getDBObject.getArea, function (data) {
            dataMap[data.area_id] = data.area_name
          })
          servkit
            .politeCheck()
            .until(function () {
              return dataMap
            })
            .thenDo(function () {
              result = dataMap
              that.getDBObject['areaObj'] = dataMap
              var selectHtml = ''
              _.each(_.keys(result).sort(), function (key) {
                selectHtml +=
                  '<option value="' + key + '" >' + result[key] + '</option>'
              })
              selectResultHtml = selectHtml
            })
            .tryDuration(0)
            .start()
          servkit
            .politeCheck()
            .until(function () {
              return selectResultHtml
            })
            .thenDo(function () {
              that.$areaID[0].innerHTML = selectResultHtml
              that.$areaID.prop('selectedIndex', -1)
            })
            .tryDuration(0)
            .start()
        }
        this.commons.getDataFromDB.apply(that, [dataConfig, callbackfunction])
      },
      initFactorSelect: function () {
        var that = this
        var dataConfig = {
          objKey: 'getFactor',
          tableName: 'a_aftersalesservice_cus_factor',
          columns: ['factor_id', 'factor_name'],
        }
        var callbackfunction = function () {
          var result
          var selectResultHtml
          var dataMap = {}
          _.map(that.getDBObject.getFactor, function (data) {
            dataMap[data.factor_id] = data.factor_name
          })
          servkit
            .politeCheck()
            .until(function () {
              return dataMap
            })
            .thenDo(function () {
              result = dataMap
              that.getDBObject['factorObj'] = dataMap
              var selectHtml = ''
              _.each(_.keys(result).sort(), function (key) {
                selectHtml +=
                  '<option value="' + key + '" >' + result[key] + '</option>'
              })
              selectResultHtml = selectHtml
            })
            .tryDuration(0)
            .start()
          servkit
            .politeCheck()
            .until(function () {
              return selectResultHtml
            })
            .thenDo(function () {
              that.$factorID[0].innerHTML = selectResultHtml
              that.$factorID.prop('selectedIndex', -1)
            })
            .tryDuration(0)
            .start()
        }
        this.commons.getDataFromDB.apply(that, [dataConfig, callbackfunction])
      },
      readCustomerData: function () {
        var that = this
        var initData
        var dbData = that.getDBObject
        servkit
          .politeCheck()
          .until(function () {
            return dbData.tradeObj && dbData.areaObj && dbData.factorObj
          })
          .thenDo(function () {
            var dataConfig = {
              objKey: 'getCustomerData',
              tableName: 'a_aftersalesservice_customer',
              columns: [
                'cus_id',
                'cus_name',
                'uni_no',
                'trade_id',
                'area_id',
                'phone',
                'fax',
                'address',
                'sales_id',
                'factor_id',
                'payment_goods',
                'contact_name',
                'ext_phone',
                'cell_phone',
                'email',
              ],
            }
            var callbackfunction = function () {
              var result
              var dataList = []

              _.each(that.getDBObject.getCustomerData, function (ele) {
                dataList.push([
                  ele.cus_id,
                  ele.cus_name,
                  ele.uni_no,
                  dbData.tradeObj[ele.trade_id],
                  dbData.areaObj[ele.area_id],
                  ele.phone,
                  ele.fax,
                  ele.address,
                  ele.sales_id,
                  dbData.factorObj[ele.factor_id],
                  ele.payment_goods,
                  ele.contact_name,
                  ele.ext_phone,
                  ele.cell_phone,
                  ele.email,
                ])
              })
              servkit
                .politeCheck()
                .until(function () {
                  return dataList
                })
                .thenDo(function () {
                  result = dataList
                  that.getDBObject.getCustomerData = result
                  that.initTables(that.getDBObject.getCustomerData)
                })
                .tryDuration(0)
                .start()
            }
            that.commons.getDataFromDB.apply(that, [
              dataConfig,
              callbackfunction,
            ])
          })
          .tryDuration(0)
          .start()
      },
      initTables: function (initData) {
        pageSetUp()
        var that = this
        var tableInfoObj = {
          cus_id: {
            index: 0,
            id: 'cus_id',
            selector: $('#cus_id'),
            dbKey: 'cus_id',
            i18nVal: `${i18n('Customer_ID')}`,
          },
          cus_name: {
            index: 1,
            id: 'cus_name',
            selector: $('#cus_name'),
            dbKey: 'cus_name',
            i18nVal: `${i18n('Customer_Name')}`,
          },
          uni_no: {
            index: 2,
            id: 'uni_no',
            selector: $('#uni_no'),
            dbKey: 'uni_no',
            i18nVal: `${i18n('Uni_No')}`,
          },
          trade_id: {
            index: 3,
            id: 'trade_id',
            selector: $('#trade_id'),
            dbKey: 'trade_id',
            i18nVal: `${i18n('Trade')}`,
          },
          area_id: {
            index: 4,
            id: 'area_id',
            selector: $('#area_id'),
            dbKey: 'area_id',
            i18nVal: `${i18n('Area')}`,
          },
          phone: {
            index: 5,
            id: 'phone',
            selector: $('#phone'),
            dbKey: 'phone',
            i18nVal: `${i18n('phone')}`,
          },
          fax: {
            index: 6,
            id: 'fax',
            selector: $('#fax'),
            dbKey: 'fax',
            i18nVal: `${i18n('fax')}`,
          },
          address: {
            index: 7,
            id: 'address',
            selector: $('#address'),
            dbKey: 'address',
            i18nVal: `${i18n('address')}`,
          },
          sales_id: {
            index: 8,
            id: 'sales_id',
            selector: $('#sales_id'),
            dbKey: 'sales_id',
            i18nVal: `${i18n('sales')}`,
          },
          factor_id: {
            index: 9,
            id: 'factor_id',
            selector: $('#factor_id'),
            dbKey: 'factor_id',
            i18nVal: `${i18n('factor')}`,
          },
          payment_goods: {
            index: 10,
            id: 'payment_goods',
            selector: $('#payment_goods'),
            dbKey: 'payment_goods',
            i18nVal: `${i18n('Payment_Goods')}`,
          },
          contact_name: {
            index: 11,
            id: 'contact_name',
            selector: $('#contact_name'),
            dbKey: 'contact_name',
            i18nVal: `${i18n('Contact_Name')}`,
          },
          ext_phone: {
            index: 12,
            id: 'ext_phone',
            selector: $('#ext_phone'),
            dbKey: 'ext_phone',
            i18nVal: `${i18n('Ext_Phone')}`,
          },
          cell_phone: {
            index: 13,
            id: 'cell_phone',
            selector: $('#cell_phone'),
            dbKey: 'cell_phone',
            i18nVal: `${i18n('Cell_Phone')}`,
          },
          email: {
            index: 14,
            id: 'email',
            selector: $('#email'),
            dbKey: 'email',
            i18nVal: `${i18n('email')}`,
          },
        }

        servkit
          .politeCheck()
          .until(function () {
            return initData
          })
          .thenDo(function () {
            var customBtnId = 'custom-btn' //在datatable sDom上客製化按鈕(此例客製化"新增"和"刷新"按鈕)
            var createBtnId = 'create-btn'
            var refreshBtnId = 'refresh-btn'
            var $crudTableModal = $('#crud-table-modal')
            var $crudTableModalDelete = $('#crud-table-modal-delete')
            var $crudTableModalDeleteSubmit = $(
              '#crud-table-modal-delete-submit'
            )
            var $crudTable = $('#crud-table')
            var $customBtn = $('#' + customBtnId)
            var $createBtn = $('#' + createBtnId)
            var $refreshBtn = $('#' + refreshBtnId)

            var $crudTableForm = $('#crud-table-form')
            var $crudTableFormHeader = $('#crud-table-form-header')
            var $updateRowIndex = $('#update-row-index')
            //新增按鈕html (綁modal)
            var insertBtn =
              '<button data-toggle="modal" data-target="' +
              $crudTableModal.selector +
              '" id="' +
              createBtnId +
              '" class="btn btn-primary" title="Add new data" style="margin-right:5px"><span class="fa fa-plus"></span></button>'
            //刷新html
            var refreshBtn =
              '<button id="' +
              refreshBtnId +
              '" class="btn btn-primary" title="Refresh" style="margin-right:5px"><span class="fa fa-refresh"></span></button>'

            //變更modal header時使用
            var createHeader = '新增'
            var updateHeader = '修改'
            //print name
            var printName = '客戶資料'

            var datatablesConfig = {
              selector: $crudTable, //table id selector
              headColumns: [
                {
                  key: tableInfoObj.cus_id.dbKey,
                  name: tableInfoObj.cus_id.i18nVal,
                  tooltip: '',
                },
                {
                  key: tableInfoObj.cus_name.dbKey,
                  name: tableInfoObj.cus_name.i18nVal,
                  tooltip: '',
                },
                {
                  key: tableInfoObj.uni_no.dbKey,
                  name: tableInfoObj.uni_no.i18nVal,
                  tooltip: '',
                  dataHide: 'always',
                },
                {
                  key: tableInfoObj.trade_id.dbKey,
                  name: tableInfoObj.trade_id.i18nVal,
                  tooltip: '',
                },
                {
                  key: tableInfoObj.area_id.dbKey,
                  name: tableInfoObj.area_id.i18nVal,
                  tooltip: '',
                },
                {
                  key: tableInfoObj.phone.dbKey,
                  name: tableInfoObj.phone.i18nVal,
                  tooltip: '',
                  dataHide: 'always',
                },
                {
                  key: tableInfoObj.fax.dbKey,
                  name: tableInfoObj.fax.i18nVal,
                  tooltip: '',
                  dataHide: 'always',
                },
                {
                  key: tableInfoObj.address.dbKey,
                  name: tableInfoObj.address.i18nVal,
                  tooltip: '',
                  dataHide: 'always',
                },
                {
                  key: tableInfoObj.sales_id.dbKey,
                  name: tableInfoObj.sales_id.i18nVal,
                  tooltip: '',
                },
                {
                  key: tableInfoObj.factor_id.dbKey,
                  name: tableInfoObj.factor_id.i18nVal,
                  tooltip: '',
                },
                {
                  key: tableInfoObj.payment_goods.dbKey,
                  name: tableInfoObj.payment_goods.i18nVal,
                  tooltip: '',
                  dataHide: 'always',
                },
                {
                  key: tableInfoObj.contact_name.dbKey,
                  name: tableInfoObj.contact_name.i18nVal,
                  tooltip: '',
                  dataHide: 'always',
                },
                {
                  key: tableInfoObj.ext_phone.dbKey,
                  name: tableInfoObj.ext_phone.i18nVal,
                  tooltip: '',
                  dataHide: 'always',
                },
                {
                  key: tableInfoObj.cell_phone.dbKey,
                  name: tableInfoObj.cell_phone.i18nVal,
                  tooltip: '',
                  dataHide: 'always',
                },
                {
                  key: tableInfoObj.email.dbKey,
                  name: tableInfoObj.email.i18nVal,
                  tooltip: '',
                  dataHide: 'always',
                },
                {
                  key: 'edite',
                  name: "<span class='fa fa-pencil'></span>",
                  notData: true,
                  notFilterCol: true,
                },
                {
                  key: 'delete',
                  name: "<span class='fa fa-trash-o'></span>",
                  notData: true,
                  notFilterCol: true,
                },
              ],
              customDownload: {
                fileName: printName,
                headMatrix: [
                  [
                    '客戶代碼',
                    '客戶名稱',
                    '統一編號',
                    '行業別',
                    '地區代碼',
                    '電話',
                    '傳真',
                    '地址',
                    '負責業務',
                    '負責代理商',
                    '累積未收款',
                    '連絡人',
                    '連絡人分機',
                    '連絡人手機',
                    '連絡人',
                    'e-mail',
                  ],
                ],
                colIndexArr: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
                excelColFormat: [
                  'text',
                  'text',
                  'text',
                  'text',
                  'text',
                  'text',
                  'text',
                  'text',
                  'text',
                  'text',
                  'text',
                  'text',
                  'text',
                  'text',
                  'text',
                ],
              },
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
                  "<'dt-toolbar'<'col-xs-12 col-sm-6'<'#" +
                  customBtnId +
                  "'>><'col-xs-12 col-sm-6 table-search'f>r>" + //datatable上面的bar
                  't' + //datatable
                  "<'dt-toolbar-footer'<'col-xs-12 col-sm-2'<'custom-download'>><'col-xs-12 col-sm-3 hidden-xs'l><'col-xs-12 col-sm-3 hidden-xs'i><'col-xs-12 col-sm-4'p>>", //datatable下面的bar
                columns: [
                  //在此設置col的 class和 col寬度
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
                    className: 'text-left',
                  },
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
                    className: 'text-left',
                  },
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
                    className: 'text-left',
                  },
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
                    className: 'text-center',
                    width: '1%',
                  },
                  {
                    className: 'text-center',
                    width: '1%',
                  },
                ],
                columnDefs: [
                  {
                    //在此對col的資料做處理，現在要在資料欄內放button
                    targets: -2, //倒數第二欄
                    data: null,
                    //編輯按鈕html (綁modal)
                    defaultContent:
                      '<button class="btn btn-xs btn-primary edit-btn" title="Edit" data-toggle="modal" data-target="' +
                      $crudTableModal.selector +
                      '"><i class="fa fa-pencil"></i></button>',
                  },
                  {
                    targets: -1, //倒數第一欄
                    data: null,
                    //刪除按鈕html (綁modal)
                    defaultContent:
                      '<button class="btn btn-xs btn-danger delete-btn" title="Delete selected row" data-toggle="modal" data-target="' +
                      $crudTableModalDelete.selector +
                      '"><i class="fa fa-trash-o"></i></button>',
                  },
                ],
                autoWidth: false, //禁止自動計算寬度
                //"ordering": false, //使否允許開起排序
                //"paging": false, //是否開起分頁
                //"lengthChange": false, //是否開啟 length change功能(每個pagging多少資料 -> 10, 25, 50, 100)
              },
            }

            //設datatable資料
            datatablesConfig.options['data'] = initData
            //建立datatables
            servkit.datatables(datatablesConfig)
            //在sDom上長出button
            $($customBtn.selector).html(insertBtn + refreshBtn)

            //按下新增按鈕
            $($createBtn.selector).on('click', function (e) {
              $crudTableFormHeader.text(createHeader) //更新modal header為"新增"
              $('#cus_id').prop('disabled', false)
              $updateRowIndex.text('') //清空update row index，因為這欄是給update辨識更新哪一列用的
              $crudTableForm[0].reset() //清空form
              pageSetUp()
            })
            //按下刷新按鈕
            $($refreshBtn.selector).on('click', function (e) {
              //刷新整理時，讓fa旋轉
              $($refreshBtn.selector + ' .fa-refresh').addClass('fa-spin')
              $crudTable.DataTable().clear().draw() //清空datatable
              that.initModalSelect()
              // $crudTable.DataTable().rows.add(initData).draw(); //重新塞值到datatable
              //移掉fa旋轉(不管回應快不快，都多旋轉半秒鐘才移除)
              setTimeout(function () {
                $($refreshBtn.selector + ' .fa-refresh').removeClass('fa-spin')
              }, 500)
            })
            //按下編輯按鈕
            $crudTable.find('tbody').on('click', '.edit-btn', function (e) {
              $crudTableFormHeader.text(updateHeader) //更新modal header為"修改"
              $('#cus_id').prop('disabled', true)
              var $selectRow = $(this).parents('tr') //datatable的哪個row按下編輯按鈕
              var index = $crudTable.DataTable().row($selectRow).index()
              var data = $crudTable.DataTable().row($selectRow).data()
              $updateRowIndex.text(index) //***更新modal上的row index值，用辨識更新datatables哪一列
              $(
                '#trade_id option:contains(' +
                  data[tableInfoObj.trade_id.index] +
                  ')'
              ).prop('selected', true)
              $(
                '#area_id option:contains(' +
                  data[tableInfoObj.area_id.index] +
                  ')'
              ).prop('selected', true)
              $(
                '#factor_id option:contains(' +
                  data[tableInfoObj.factor_id.index] +
                  ')'
              ).prop('selected', true)
              tableInfoObj.cus_id.selector.val(data[tableInfoObj.cus_id.index])
              tableInfoObj.cus_name.selector.val(
                data[tableInfoObj.cus_name.index]
              )
              tableInfoObj.uni_no.selector.val(data[tableInfoObj.uni_no.index])
              // tableInfoObj.trade_id.selector.val(data[tableInfoObj.trade_id.index]);
              // tableInfoObj.area_id.selector.val(data[tableInfoObj.area_id.index])
              tableInfoObj.phone.selector.val(data[tableInfoObj.phone.index])
              tableInfoObj.fax.selector.val(data[tableInfoObj.fax.index])
              tableInfoObj.address.selector.val(
                data[tableInfoObj.address.index]
              )
              tableInfoObj.sales_id.selector.val(
                data[tableInfoObj.sales_id.index]
              )
              // tableInfoObj.factor_id.selector.val(data[tableInfoObj.factor_id.index]);
              tableInfoObj.payment_goods.selector.val(
                data[tableInfoObj.payment_goods.index]
              )
              tableInfoObj.contact_name.selector.val(
                data[tableInfoObj.contact_name.index]
              )
              tableInfoObj.ext_phone.selector.val(
                data[tableInfoObj.ext_phone.index]
              )
              tableInfoObj.cell_phone.selector.val(
                data[tableInfoObj.cell_phone.index]
              )
              tableInfoObj.email.selector.val(data[tableInfoObj.email.index])
              pageSetUp()
            })
            //按下刪除按鈕
            $crudTable.find('tbody').on('click', '.delete-btn', function (e) {
              var $selectRow = $(this).parents('tr') //datatable的哪個row按下刪除按鈕
              //確認刪除觸發(使用off('click')確保不會重覆綁定事件)
              $($crudTableModalDeleteSubmit.selector)
                .off('click')
                .on('click', function () {
                  var id = $crudTable.DataTable().row($selectRow).data()[
                    tableInfoObj.cus_id.index
                  ]
                  servkit.ajax(
                    {
                      url: 'api/aftersalesservice/customer/delete',
                      type: 'DELETE',
                      contentType: 'application/json',
                      data: JSON.stringify([id]),
                    },
                    {
                      success: function (data) {
                        $crudTable.DataTable().row($selectRow).remove().draw()
                        $($crudTableModalDelete.selector).modal('hide') //關閉modal
                      },
                      fail: function (data) {
                        console.log(data)
                      },
                    }
                  )
                })
            })

            /* 資料驗證 */
            $crudTableForm.validate({
              // Rules for form validation
              rules: {
                cus_id: {
                  //***請變更我
                  required: true,
                },
                cus_name: {
                  //***請變更我
                  required: true,
                  minlength: 1,
                  maxlength: 20,
                },
                email: {
                  //***請變更我
                  email: true,
                },
                payment_goods: {
                  digits: true,
                },
              },
              // Messages for form validation
              messages: {
                cus_id: {
                  //***請變更我
                  required: '不能為空',
                },
                cus_name: {
                  //***請變更我
                  required: '不能為空',
                },
                email: {
                  //***請變更我
                  email: '非信箱格式...',
                },
                payment_goods: {
                  digits: '此欄位只能是數字...',
                },
              },
              // Do not change code below
              errorPlacement: function (error, element) {
                error.insertAfter(element.parent())
              },
              //通過驗證後執行
              submitHandler: function (form) {
                var action = $crudTableFormHeader.text() //是新增或修改

                var cus_id = tableInfoObj.cus_id.selector.val()
                var cus_name = tableInfoObj.cus_name.selector.val()
                var uni_no = tableInfoObj.uni_no.selector.val()
                var trade_id = tableInfoObj.trade_id.selector.val()
                var area_id = tableInfoObj.area_id.selector.val()
                var phone = tableInfoObj.phone.selector.val()
                var fax = tableInfoObj.fax.selector.val()
                var address = tableInfoObj.address.selector.val()
                var sales_id = tableInfoObj.sales_id.selector.val()
                var factor_id = tableInfoObj.factor_id.selector.val()
                var payment_goods = tableInfoObj.payment_goods.selector.val()
                var contact_name = tableInfoObj.contact_name.selector.val()
                var ext_phone = tableInfoObj.ext_phone.selector.val()
                var cell_phone = tableInfoObj.cell_phone.selector.val()
                var email = tableInfoObj.email.selector.val()

                var rowDataMap = {
                  cus_id: cus_id,
                  cus_name: cus_name,
                  uni_no: uni_no,
                  trade_id: trade_id,
                  area_id: area_id,
                  phone: phone,
                  fax: fax,
                  address: address,
                  sales_id: sales_id,
                  factor_id: factor_id,
                  payment_goods: payment_goods,
                  contact_name: contact_name,
                  ext_phone: ext_phone,
                  cell_phone: cell_phone,
                  email: email,
                }
                var rowData = [
                  cus_id,
                  cus_name,
                  uni_no,
                  trade_id,
                  area_id,
                  phone,
                  fax,
                  address,
                  sales_id,
                  factor_id,
                  payment_goods,
                  contact_name,
                  ext_phone,
                  cell_phone,
                  email,
                ] //依序放到陣列
                // var rowDataView = [cus_id, cus_name, uni_no, tradeObj[trade_id], tradeObj[area_id], phone, fax, address, sales_id, factorObj[factor_id], payment_goods, contact_name, ext_phone, cell_phone, email];

                switch (action) {
                  case createHeader: //新增->在datatables加一筆
                    servkit.ajax(
                      {
                        url: 'api/aftersalesservice/customer/create',
                        type: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify(rowDataMap),
                      },
                      {
                        success: function (data) {
                          $crudTable.DataTable().row.add(rowData).draw()
                          that.initModalSelect()
                        },
                        fail: function (data) {
                          console.log(data)
                        },
                      }
                    )

                    break
                  case updateHeader: //更新->取得row的index後更新row資料
                    var updateRowIndex = $updateRowIndex.text()
                    servkit.ajax(
                      {
                        url: 'api/aftersalesservice/customer/update',
                        type: 'PUT',
                        contentType: 'application/json',
                        data: JSON.stringify(rowDataMap),
                      },
                      {
                        success: function (data) {
                          $crudTable
                            .DataTable()
                            .row(updateRowIndex)
                            .data(rowData)
                          that.initModalSelect()
                        },
                        fail: function (data) {
                          console.log(data)
                        },
                      }
                    )

                    break
                  default:
                    console.warn('not find this action: ' + action)
                }

                $($crudTableModal.selector).modal('hide') //關閉modal
                return false //避免reload頁面
              },
            })
          })
          .tryDuration(0)
          .start()
        //讓form的select為多選時，不需要按ctrl
        // tableInfoObj.col3.selector.on("mousedown", servkit.multiselectWithoutCtrlMouseDown).on("mousemove", servkit.multiselectWithoutCtrlMouseMove);
        // servkit.multiselectHeightOptimization(tableInfoObj.col3.selector[0]); //預設form上的multi select高度
      },
      initModalSelect: function () {
        this.initAreaSelect()
        this.initTradeSelect()
        this.initFactorSelect()
        this.readCustomerData()
        // var tradeData, areaData, factorData, tradeSelHtml, areaSelHtml, factorSelHtml;

        // $.ajax({
        //         url: servkit.rootPath + '/api/getdata/db',
        //         type: 'POST',
        //         contentType: 'application/json',
        //         data: JSON.stringify({
        //             table: 'a_aftersalesservice_cus_trade',
        //             columns: ['trade_id', 'trade_name']
        //         })
        //     })
        //     .done(function(data) {
        //         if (data.type === 0) {
        //             var reault = {};
        //             _.map(data.data, function(data) {
        //                 reault[data.trade_id] = data.trade_name;
        //             });
        //             tradeData = reault;
        //         }
        //     });

        // $.ajax({
        //         url: servkit.rootPath + '/api/getdata/db',
        //         type: 'POST',
        //         contentType: 'application/json',
        //         data: JSON.stringify({
        //             table: 'a_aftersalesservice_cus_area',
        //             columns: ['area_id', 'area_name']
        //         })
        //     })
        //     .done(function(data) {
        //         if (data.type === 0) {
        //             var reault = {};
        //             _.map(data.data, function(data) {
        //                 reault[data.area_id] = data.area_name;
        //             });
        //             areaData = reault;
        //         }
        //     });

        // $.ajax({
        //         url: servkit.rootPath + '/api/getdata/db',
        //         type: 'POST',
        //         contentType: 'application/json',
        //         data: JSON.stringify({
        //             table: 'a_aftersalesservice_cus_factor',
        //             columns: ['factor_id', 'factor_name']
        //         })
        //     })
        //     .done(function(data) {
        //         if (data.type === 0) {
        //             var reault = {};
        //             _.map(data.data, function(data) {
        //                 reault[data.factor_id] = data.factor_name;
        //             });
        //             factorData = reault;
        //         }
        //     });

        // servkit.politeCheck()
        //     .until(function() {
        //         return tradeData && areaData && factorData;
        //     }).thenDo(function() {
        //         var selectTradeHtml = '';
        //         var selectAreaHtml = '';
        //         var selectFactorHtml = '';
        //         _.each(_.keys(tradeData).sort(), function(key) {
        //             selectTradeHtml += '<option value="' + key + '" >' + tradeData[key] + '</option>';
        //         });
        //         _.each(_.keys(areaData).sort(), function(key) {
        //             selectAreaHtml += '<option value="' + key + '" >' + areaData[key] + '</option>';
        //         });
        //         _.each(_.keys(factorData).sort(), function(key) {
        //             selectFactorHtml += '<option value="' + key + '" >' + factorData[key] + '</option>';
        //         });
        //         tradeSelHtml = selectTradeHtml;
        //         areaSelHtml = selectAreaHtml;
        //         factorSelHtml = selectFactorHtml;
        //     }).tryDuration(0)
        //     .start();

        // servkit.politeCheck()
        //     .until(function() {
        //         return tradeSelHtml && areaSelHtml && factorSelHtml;
        //     }).thenDo(function() {
        //         $('[name=trade_id]')[0].innerHTML = tradeSelHtml;
        //         $('select[name=trade_id] option:eq(0)').prop('selected', true);
        //         $('[name=area_id]')[0].innerHTML = areaSelHtml;
        //         $('select[name=area_id] option:eq(0)').prop('selected', true);
        //         $('[name=factor_id]')[0].innerHTML = factorSelHtml;
        //         $('select[name=factor_id] option:eq(0)').prop('selected', true);
        //     }).tryDuration(0)
        //     .start();
      },
    },
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
        '/js/servtech/servcloud.table.js',
      ],
    ],
  })
}
