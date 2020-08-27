export default function () {
  ;(function () {
    function initializeDBData(DbData) {
      function Obj(data) {
        this.data = data
        this.map = {}
      }

      Obj.prototype.getData = function () {
        return this.data
      }
      Obj.prototype.getMap = function () {
        return this.map
      }
      Obj.prototype.init = function (key, val) {
        var that = this
        var html = ''
        _.each(this.data, function (record) {
          that.map[record[key]] = record[val]
          html +=
            '<option style="padding:3px 0 3px 3px;" value="' +
            record[key] +
            '">' +
            record[val] +
            '</option>'
        })
        that.selectHtml = html
      }

      Obj.prototype.getName = function (key) {
        return this.map[key]
      }
      Obj.prototype.getSelect = function () {
        return this.selectHtml
      }
      return new Obj(DbData)
    }

    GoGoAppFun({
      gogo: function (ctx) {
        pageSetUp()

        if (ctx.preCon.products) {
          ctx['productFunc'] = ctx.preCon.products
        }

        if (ctx.preCon.productTypes) {
          ctx['productTypeFunc'] = ctx.preCon.productTypes
        }

        if (ctx.preCon.processCodes) {
          ctx['processFunc'] = ctx.preCon.processCodes
        }

        ctx.$productId.html(ctx.productFunc.getSelect())
        ctx.$productId.prop('selectedIndex', -1)

        ctx.$submitBtn
          .on('click', function (evt) {
            evt.preventDefault() // 防止氣泡事件
            var productId = ctx.$productId.val()
            ctx.read(productId)
          })
          .trigger('click')

        ctx.$submitClean.on('click', function (evt) {
          evt.preventDefault()
          ctx.$productId.val('')
        })

        $('#stk-product-table-body').on('click', '[name=ng-btn]', function (
          evt
        ) {
          evt.preventDefault()
          var productId = $(this).parents('tr').find('td').eq(1).text()
          var remark = $(this).parents('tr').find('td').eq(3).text()
          ctx.$modalProductId.text(productId)
          ctx.$modalProductRemark.text(remark)

          ctx.readOp(productId)
          //                    ctx.getProcessDataObject();
          $('#opModal').modal()
        })
      },
      util: {
        $tableBody: $('#stk-product-table-body'),
        $table: $('#stk-product-table'),
        $modalTableBody: $('#stk-process-table-body'),
        $modalTable: $('#stk-process-table'),
        $submitBtn: $('#submit-btn'),
        $submitClean: $('#submit-clean'),
        $productId: $('#product_id'),
        $modalProductId: $('#modal-product-id'),
        $modalProductRemark: $('#modal-product-remark'),
        //                processOpenDataObject: {},
        //                processDataObject: {},
        //                getProcessDataObject: function() {
        //                    var that = this;
        //                    servkit.ajax({
        //                        url: servkit.rootPath + '/api/getdata/db',
        //                        type: 'POST',
        //                        contentType: 'application/json',
        //                        data: JSON.stringify({
        //                            table: 'a_servtrack_process',
        //                            columns: ['process_code', 'process_name']
        //                        })
        //                    },{
        //                        success : function(data){
        //                            processDatas = data;
        //                            _.map(data, function(data) {
        //                                that.processDataObject[data.process_code] = data.process_name;
        //                            });
        //                        },
        //                        fail : function(data){
        //                            console.log(data);
        //                        }
        //                    });
        //                    servkit.politeCheck()
        //                        .until(function() {
        //                            return that.processDataObject;
        //                        }).thenDo(function() {
        //                        console.log(that.processDataObject);
        //                        return that.processDataObject;
        //                    }).tryDuration(0)
        //                        .start();
        //                },
        read: function (productId) {
          var ctx = this

          productId = productId || ''

          if (!ctx['crudTable']) {
            ctx['crudTable'] = ctx.$table[0].cloneNode(true)
          } else {
            ctx.$tableBody.html(ctx.crudTable.cloneNode(true))
          }

          function createAndUpdateSend(tdEles) {
            return {
              product_type_id: (function () {
                if ($(tdEles[1]).find('select').length !== 0) {
                  return $(tdEles[1]).find(':selected').val()
                } else {
                  return $(tdEles[1]).find(':input').val()
                }
              })(),
              is_open: (function () {
                if ($(tdEles[4]).find(':checkbox').prop('checked')) {
                  return 'Y'
                } else {
                  return 'N'
                }
              })(),
            }
          }

          var createAndUpdateEnd = {
            2: function (td) {
              if ($(td).find('select').length != 0) {
                return $(td).find(':selected').text()
              } else {
                return $(td).find(':input').val()
              }
            },
            4: function (td) {
              return parseFloat($(td).find(':text').val()).toFixed(2)
            },
            5: function (td) {
              if ($(td).find(':checkbox').prop('checked')) {
                return '<span class="label label-success">ON</span>'
              } else {
                return '<span class="label label-default">OFF</span>'
              }
            },
            6: function (td) {
              return '<button class="btn btn-primary" name="ng-btn">設定</button>'
            },
          }

          servkit.crudtable({
            tableSelector: '#stk-product-table',
            create: {
              url: 'api/kuochuan/servtrack/product/create',
              start: function (tdEles) {
                var select = $(
                  '<select class="select2" name="product_type_id" ></select>'
                )
                select
                  .html(ctx.productTypeFunc.getSelect())
                  .prop('selectedIndex', -1)
                $(tdEles).eq(1).html(select)
                pageSetUp()
              },
              send: createAndUpdateSend,
              end: createAndUpdateEnd,
            },
            read: {
              url:
                'api/kuochuan/servtrack/product/read?product_id=' + productId,
              end: {
                2: function (data) {
                  return data
                },
                4: function (data) {
                  return parseFloat(data).toFixed(2)
                },
                5: function (data) {
                  if (data === 'Y') {
                    return '<span class="label label-success">ON</span>'
                  } else {
                    return '<span class="label label-default">OFF</span>'
                  }
                },
                6: function (td) {
                  return '<button class="btn btn-primary" name="ng-btn">設定</button>'
                },
              },
            },
            update: {
              url: 'api/kuochuan/servtrack/product/update',
              start: {
                2: function (oldTd, newTd, oldTr, newTr) {
                  var oldProductTypeId = $(oldTd).html()
                  var input = $(
                    '<input type="text" name="product_type_id" class="form-control"/>'
                  )
                    .val(oldProductTypeId)
                    .prop('disabled', true)
                  $(newTd).html(input)
                },
                4: function (oldTd, newTd, oldTr, newTr) {
                  var oldProductQualitySp = $(oldTd).html()
                  var input = $(
                    '<input type="text" name="product_quality_sp" class="form-control"/>'
                  )
                    .val(oldProductQualitySp)
                    .prop('disabled', true)
                  $(newTd).html(input)
                },
                5: function (oldTd, newTd, oldTr, newTr) {
                  if (oldTd.textContent.indexOf('ON') != 0) {
                    newTd.querySelector('input').checked = false
                  } else {
                    newTd.querySelector('input').checked = true
                  }
                },
              },
              send: createAndUpdateSend,
              end: createAndUpdateEnd,
            },
            delete: {
              unavailable: true,
            },
            validate: {
              1: function (td, table) {
                var input = $(td).find(':input')
                if (input.val() === '') {
                  return '<br />請填寫品項編號'
                }

                if (!input.prop('disabled')) {
                  if (
                    _.find(table.columns(0).data().eq(0), function (existId) {
                      return existId === input.val()
                    })
                  ) {
                    return '<br />品項編號重覆'
                  }
                }
              },
              2: function (td) {
                if ($(td).find('select').length !== 0) {
                  var val = $(td).find('select').val() || ''
                  if (val === '') {
                    return '<br />請選擇產品類型'
                  }
                }
              },
              4: function (td) {
                if ($(td).find(':input').val() === '') {
                  return '<br />請填目標值'
                } else if (isNaN($(td).find(':input').val())) {
                  return '<br />請填數字'
                } else {
                  var val = parseFloat($(td).find(':input').val())
                  if (val < 0 || val > 100) {
                    return '<br />請輸入0 ~ 100範圍的值'
                  }
                }
              },
            },
          })
        },
        readOp: function (productId) {
          var ctx = this

          if (!ctx['modalCrudTable']) {
            ctx['modalCrudTable'] = ctx.$modalTable[0].cloneNode(true)
          } else {
            ctx.$modalTableBody.html(ctx.modalCrudTable.cloneNode(true))
          }

          function createAndUpdateSend(tdEles) {
            return {
              product_id: (function () {
                return productId
              })(),
              is_open: (function () {
                if ($(tdEles[6]).find(':checkbox').prop('checked')) {
                  return 'Y'
                } else {
                  return 'N'
                }
              })(),
              process_code: (function () {
                var process_code = $(tdEles[1]).find(':selected').val()
                return process_code
              })(),
              //                            ,
              //                            op_quality_sp: (function() {
              //                                // because servtrack std need this column
              //                                // but in SRS-2017-08-01 Ui & desciption
              //                                // not include this column , send default value
              //                                return 100.0;
              //                            }())
            }
          }

          var createAndUpdateEnd = {
            2: function (td) {
              return $(td).find(':selected').text()
            },
            4: function (td) {
              // because kuochuan time unit is sec not minutes
              return parseFloat($(td).find(':text').val()).toFixed(1)
            },
            5: function (td) {
              // because kuochuan time unit is sec not minutes
              return parseFloat($(td).find(':text').val()).toFixed(2)
            },
            7: function (td) {
              if ($(td).find(':checkbox').prop('checked')) {
                return '<span class="label label-success">ON</span>'
              } else {
                return '<span class="label label-default">OFF</span>'
              }
            },
          }

          var $processName = $('[name=process_name]')
          //                    var processDatas;
          //                    var namesHtml;
          //                    servkit.ajax({
          //                        url: servkit.rootPath + '/api/getdata/db',
          //                        type: 'POST',
          //                        contentType: 'application/json',
          //                        data: JSON.stringify({
          //                            table: 'a_servtrack_process',
          //                            columns: ['process_code', 'process_name'],
          //                            whereClause: "is_open = ?",
          //                            whereParams: ["Y"]
          //                        })
          //                    },{
          //                        success : function(data){
          //                            processDatas = data;
          //                            _.map(data, function(data) {
          //                                ctx.processOpenDataObject[data.process_code] = data.process_name;
          //                            });
          //                        },
          //                        fail : function(data){
          //                            console.log(data);
          //                        }
          //                    });

          //                    servkit.politeCheck()
          //                        .until(function() {
          //                            return processDatas;
          //                        }).thenDo(function() {
          //                        var namesSelectHtml = '';
          //                        _.each(processDatas, function(data) {
          //                            namesSelectHtml += '<option style="padding:3px 0 3px 3px;" value="' + data.process_code + '">' + data.process_name + '</option>';
          //                        });
          //                        namesHtml = namesSelectHtml;
          //                    }).tryDuration(0)
          //                        .start();

          servkit.crudtable({
            tableSelector: '#stk-process-table',
            create: {
              url: 'api/kuochuan/servtrack/productop/create',
              start: function (tdEles) {
                var select = $(
                  '<select class="select2" name="process_name" ></select>'
                )
                select
                  .html(ctx.processFunc.getSelect())
                  .prop('selectedIndex', -1)
                $(tdEles).eq(1).html(select)
                pageSetUp()
              },
              send: createAndUpdateSend,
              end: createAndUpdateEnd,
            },
            read: {
              url:
                'api/kuochuan/servtrack/productop/read?product_id=' + productId,
              end: {
                2: function (data) {
                  return ctx.processFunc.getName(data)
                  //                                    return ctx.processDataObject[data];
                },
                4: function (data) {
                  return (parseFloat(data) * 60).toFixed(1)
                },
                5: function (data) {
                  return parseFloat(data).toFixed(2)
                },
                7: function (data) {
                  if (data === 'Y') {
                    return '<span class="label label-success">ON</span>'
                  } else {
                    return '<span class="label label-default">OFF</span>'
                  }
                },
              },
            },
            update: {
              url: 'api/kuochuan/servtrack/productop/update',
              start: {
                2: function (oldTd, newTd) {
                  var oldProcessName = $(oldTd).html()
                  var select = $(
                    '<select class="select2" name="process_name" ></select>'
                  )
                  select.html(ctx.processFunc.getSelect())
                  $(newTd).html(select)
                  select
                    .find('option:contains(' + oldProcessName + ')')
                    .prop('selected', true)
                  pageSetUp()
                },
                7: function (oldTd, newTd, oldTr, newTr) {
                  if ($(oldTd).text().indexOf('OFF') != -1) {
                    $(newTd).find(':checkbox').prop('checked', false)
                  } else {
                    $(newTd).find(':checkbox').prop('checked', true)
                  }
                },
              },
              send: createAndUpdateSend,
              end: createAndUpdateEnd,
            },
            delete: {
              unavailable: true,
            },
            validate: {
              1: function (td, table) {
                var input = $(td).find(':input')
                if (input.val() === '') {
                  return '<br />請填寫工序'
                }

                if (isNaN(input.val())) {
                  return '<br />請填數字'
                }

                if (!input.prop('disabled')) {
                  if (
                    _.find(table.columns(0).data().eq(0), function (existId) {
                      return existId.toLowerCase() === input.value.toLowerCase()
                    })
                  ) {
                    return '<br />工序重複'
                  }
                }
              },
              2: function (td) {
                var val = $(td).find('select').val() || ''
                if (val === '') {
                  return '<br />請選擇製程'
                }
              },
              3: function (td) {
                if ($(td).find(':input').val() === '') {
                  return '<br />請填寫站別'
                }
                if ($(td).find(':input').val().length > 10) {
                  return '<br>長度不可超過10'
                }
              },
              4: function (td) {
                if ($(td).find(':input').val() === '') {
                  return '<br />請填寫單件標工'
                } else if (isNaN($(td).find(':input').val())) {
                  return '<br />請填數字'
                }
              },
              5: function (td) {
                if ($(td).find(':input').val() === '') {
                  return '<br />請填目標值'
                } else if (isNaN($(td).find(':input').val())) {
                  return '<br />請填數字'
                } else {
                  var val = parseFloat($(td).find(':input').val())
                  if (val < 0 || val > 100) {
                    return '<br />請輸入0 ~ 100範圍的值'
                  }
                }
              },
            },
          })
        },
      },
      preCondition: {
        products: function (done) {
          servkit.ajax(
            {
              url: servkit.rootPath + '/api/getdata/db',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                table: 'a_kuochuan_servtrack_view_product',
                columns: ['product_id', 'product_name', 'is_open'],
                whereClause: 'product_id <> ?',
                whereParams: ['invalid_work'],
              }),
            },
            {
              success: function (data) {
                var func = initializeDBData(data)
                func.init('product_id', 'product_name')
                done(func)
              },
              fail: function (data) {
                console.log(data)
              },
            }
          )
        },
        productTypes: function (done) {
          servkit.ajax(
            {
              url: 'api/getdata/db',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                table: 'a_kuochuan_servtrack_product_type',
                columns: ['product_type_id'],
                whereClause: 'product_type_id <> ?',
                whereParams: ['invalid'],
              }),
            },
            {
              success: function (data) {
                var func = initializeDBData(data)
                func.init('product_type_id', 'product_type_id')
                done(func)
              },
            }
          )
        },
        processCodes: function (done) {
          servkit.ajax(
            {
              url: servkit.rootPath + '/api/getdata/db',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                table: 'a_servtrack_process',
                columns: ['process_code', 'process_name'],
                whereClause: 'is_open = ? AND process_code <> ?',
                whereParams: ['Y', 'invalid'],
              }),
            },
            {
              success: function (data) {
                var func = initializeDBData(data)
                func.init('process_code', 'process_name')
                done(func)
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
      ],
    })
  })()
}
