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
        ctx.initFuncs()
        ctx.initEvents()
        ctx.initElements()
      },
      util: {
        $startDate: $('#start-date'),
        $endDate: $('#end-date'),
        $searchBtn: $('#submit-btn'),
        $cleanBtn: $('#submit-clean'),
        $productId: $('#product-id'),
        $staffId: $('#staff-id'),
        $productTypeId: $('#product-type-id'),
        $lineId: $('#line-id'),
        $dataTableWidget: $('#data-table-widget'),
        $dataTableBody: $('#data-table'),
        datepickerConfig: {
          dateFormat: 'yy-mm-dd',
          prevText: '<i class="fa fa-chevron-left"></i>',
          nextText: '<i class="fa fa-chevron-right"></i>',
        },
        initFuncs: function () {
          var ctx = this
          if (ctx.preCon.products) {
            ctx['productFunc'] = ctx.preCon.products
          }
          if (ctx.preCon.staffs) {
            ctx['staffFunc'] = ctx.preCon.staffs
          }
          if (ctx.preCon.productTypes) {
            ctx['productTypeFunc'] = ctx.preCon.productTypes
          }
          if (ctx.preCon.lines) {
            ctx['lineFunc'] = ctx.preCon.lines
          }
        },
        initEvents: function () {
          var ctx = this

          servkit.validateForm($('#main-form'), ctx.$searchBtn)

          ctx.$searchBtn.on('click', function (evt) {
            var params = {
              startDate: ctx.$startDate.val(),
              endDate: ctx.$endDate.val(),
              product_ids: ctx.$productId.val() || [],
              line_id: ctx.$lineId.val() || '',
              staff_id: ctx.$staffId.val() || '',
              product_type_id: ctx.$productTypeId.val() || '',
            }
            ctx.drawTable(params)
            return false
          })

          // ctx.$cleanBtn.on('click', function(evt) {
          //   ctx.$startDate.val(moment().format('YYYY-MM-DD'));
          //   ctx.$endDate.val(moment().format('YYYY-MM-DD'));
          //   ctx.$productId.prop('selectedIndex', -1);
          //   ctx.$lineId.prop('selectedIndex', -1);
          //   ctx.$staffId.prop('selectedIndex', -1);
          //   ctx.$productTypeId.prop('selectedIndex', -1);
          //   pageSetUp();
          //   return false;
          // });
        },
        initElements: function () {
          var ctx = this
          ctx.$startDate
            .datepicker(ctx.datepickerConfig)
            .val(moment().format('YYYY-MM-DD'))
          ctx.$endDate
            .datepicker(ctx.datepickerConfig)
            .val(moment().format('YYYY-MM-DD'))

          ctx.$productId.html(ctx.productFunc.getSelect())
          ctx.$productId.prop('selectedIndex', -1)
          ctx.$lineId.html(ctx.lineFunc.getSelect())
          ctx.$lineId.prop('selectedIndex', -1)
          ctx.$staffId.html(ctx.staffFunc.getSelect())
          ctx.$staffId.prop('selectedIndex', -1)
          ctx.$productTypeId.html(ctx.productTypeFunc.getSelect())
          ctx.$productTypeId.prop('selectedIndex', -1)
        },
        drawTable: function (params) {
          var ctx = this

          var table = createReportTable({
            $tableElement: ctx.$dataTableBody,
            rightColumn: [7, 12, 13, 14, 15, 16, 17, 18],
            excel: {
              fileName: 'worktracking',
              format: [
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
                'text',
                'text',
                'text',
                'text',
              ],
            },
          })

          servkit.ajax(
            {
              url: 'api/kuochuan/servtrack/worktracking/read',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify(params),
            },
            {
              success: function (data) {
                var result = _.map(data, function (obj) {
                  var op_quality_sp = parseFloat(obj.op_quality_sp).toFixed(2)
                  var quality = parseFloat(obj.quality).toFixed(2)
                  return [
                    obj.shift_day,
                    obj.product_id,
                    obj.work_id,
                    obj.op,
                    obj.process_name,
                    obj.product_type_id,
                    obj.process_step,
                    (parseFloat(obj.std_hour) * 60).toFixed(1),
                    obj.line_id,
                    obj.staff_name,
                    moment(obj.move_in).format('YYYY-MM-DD HH:mm:ss'),
                    moment(obj.move_out).format('YYYY-MM-DD HH:mm:ss'),
                    obj.output,
                    obj.go_quantity,
                    obj.ng_quantity,
                    op_quality_sp,
                    parseFloat(quality) > parseFloat(op_quality_sp)
                      ? quality
                      : '<span style="color: red;">' + quality + '</span>',
                    parseFloat(obj.perf).toFixed(2),
                    obj.output_variance > 0
                      ? obj.output_variance
                      : '<span style="color: red;">' +
                        obj.output_variance +
                        '</span>',
                  ]
                })
                table.drawTable(result)
              },
              fail: function (data) {
                console.warn(data)
              },
            }
          )
        },
      },
      preCondition: {
        products: function (done) {
          var ctx = this
          servkit.ajax(
            {
              url: servkit.rootPath + '/api/getdata/db',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                table: 'a_kuochuan_servtrack_view_product',
                columns: ['product_id', 'product_name'],
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
            }
          )
        },
        staffs: function (done) {
          var ctx = this
          servkit.ajax(
            {
              url: servkit.rootPath + '/api/getdata/db',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                table: 'a_kuochuan_servtrack_staff',
                columns: ['staff_id', 'staff_name'],
              }),
            },
            {
              success: function (data) {
                var func = initializeDBData(data)
                func.init('staff_id', 'staff_name')
                done(func)
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
        lines: function (done) {
          servkit.ajax(
            {
              url: 'api/getdata/db',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                table: 'a_kuochuan_servtrack_view_line',
                columns: ['line_id', 'line_name', 'is_valid'],
                whereClause: 'is_valid <> ?',
                whereParams: ['N'],
              }),
            },
            {
              success: function (data) {
                var func = initializeDBData(data)
                func.init('line_id', 'line_name')
                done(func)
              },
            }
          )
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
          '/js/plugin/flot/jquery.flot.symbol.min.js',
          '/js/plugin/flot/jquery.flot.axislabels.js',
          '/js/plugin/flot/jquery.flot.dashes.min.js',
        ],
        [
          '/js/plugin/datatables/jquery.dataTables.min.js',
          '/js/plugin/datatables/dataTables.colVis.min.js',
          '/js/plugin/datatables/dataTables.tableTools.min.js',
          '/js/plugin/datatables/dataTables.bootstrap.min.js',
          '/js/plugin/datatable-responsive/datatables.responsive.min.js',
        ],
        ['/js/plugin/select2/select2.min.js'],
      ],
    })
  })()
  //    GoGoAppFun({
  //        gogo: function(ctx) {
  //            pageSetUp();
  //            ctx.initFuncs(ctx);
  //            ctx.initElements(ctx);
  //
  //            dayTable = createReportTable({
  //                $tableElement: $('#date-table'),
  //                $tableWidget: $('#date-table-widget'),//reporttable.js有說明
  //                rightColumn: [5, 9, 10, 11, 12],
  //                onRow : function (row, data) {
  //                    var rows = $(row).find('td');
  //                    // console.log(rows.get(11).innerHTML);
  //                    console.log(rows.get(11).innerHTML);
  //                    var data11 = rows.eq(11).text();
  //                    var data12 = rows.eq(12).text();
  //                    if (data11 < 0) {
  //                        rows.eq(11).html('<font style="color:red;">' + data11+ '</font>');
  //                    }
  //                    if (data12 < 0) {
  //                        rows.eq(12).html('<font style="color:red;">' + data12+ '</font>');
  //                    }
  //                },
  //                excel: {
  //                    fileName: 'test',
  //                    format:['text', 'text', 'text', 'text', 'text']
  //                }
  //            });
  //            //demo click
  //            ctx.$demoBtn.on('click', function(evt){
  //                evt.preventDefault();//防止氣泡事件
  //                var currentDate = moment(new Date()).format('YYYY/MM/DD HH:mm:ss');
  //                var str = '查詢時間：' + currentDate;
  //                document.getElementsByName("currentDate").item(0).innerHTML = str;
  //                var reportType = 'demo';
  //                ctx[reportType](dayTable); //ctx[reportType](dayTable) 是指util.day(     dayTable)
  //            });
  //
  //            //submit click
  //            ctx.$submitBtn.on('click', function(evt){
  //                evt.preventDefault();
  //                var reportType = 'drawTable';
  //                ctx[reportType](dayTable);
  //            });
  //        },
  //        util: {
  //            datepickerConfig: {
  //                dateFormat: 'yy/mm/dd',
  //                prevText: '<i class="fa fa-chevron-left"></i>',
  //                nextText: '<i class="fa fa-chevron-right"></i>'
  //            },
  //            $startDate: $('#start-date'),
  //            $endDate: $('#end-date'),
  //            $productId: $('#product-id'),
  //            $lineId: $('#line-id'),
  //            $submitBtn: $('#submit-btn'),
  //            $demoBtn: $('#showdemo1'),
  //            $labelColor : $('[name=labelColor]'),// 燈號
  //            $toolLifeChar: $('#bar-chart-h'),
  //            $shiftRangeTitle: $('#shift-range-title'),
  //            $productNameTitle: $('#product-name-title'),
  //            $lineTitle: $('#line-title'),
  //            loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
  //            initFuncs: function (ctx) {
  //                if (ctx.preCon.products) {
  //                    ctx['productFunc'] = ctx.preCon.products;
  //                }
  //                if (ctx.preCon.lines) {
  //                    ctx['lineFunc'] = ctx.preCon.lines;
  //                }
  //            },
  //            initElements: function (ctx) {
  //                ctx.$startDate.datepicker(ctx.datepickerConfig).val(moment().format('YYYY/MM/DD'));
  //                ctx.$endDate.datepicker(ctx.datepickerConfig).val(moment().format('YYYY/MM/DD'));
  //                ctx.$productId.html(ctx.productFunc.getSelect());
  //                ctx.$productId.prop('selectedIndex', -1);
  //                ctx.$lineId.html(ctx.lineFunc.getSelect());
  //                ctx.$lineId.prop('selectedIndex', -1);
  //            },
  //            drawTable : function(dayTable) {
  //                var that = this;
  //                var trackingArray = [];
  //                var trackingResultData;
  //                var params = {
  //                    "startDate": that.$startDate.val(),
  //                    "endDate": that.$endDate.val(),
  //                    "productId": that.$productId.val(),
  //                    "lineId": that.$lineId.val()
  //                };
  //                var lindId = that.$lineId.val() == null ? '' : that.lineFunc.getName(that.$lineId.val());
  //                var productName = that.$productId.val() == null ? '' : that.productFunc.getName(that.$productId.val());
  //                that.$shiftRangeTitle.html(that.$startDate.val() + ' ~ ' + that.$endDate.val());
  //                that.$lineTitle.html(lindId);
  //                that.$productNameTitle.html(productName);
  //                // var params = {
  //                //     "startDate": '2017/06/01',
  //                //     "endDate": '2017/06/01',
  //                //     "productId": '',
  //                //     "lineId": ''
  //                // };
  //                servkit.ajax({
  //                    url: servkit.rootPath + '/api/servtrack/operatingperformance/readperformance',
  //                    type: 'POST',
  //                    contentType: 'application/json',
  //                    data : JSON.stringify(params)
  //                },{
  //                    success : function(dbData){
  //                        _.map(dbData, function(data) {
  //                            console.log(data);
  //                            var subArray = [];
  //                            subArray.push(data.shift_day);
  //                            subArray.push(data.product_name);
  //                            subArray.push(data.work_id);
  //                            subArray.push(data.op);
  //                            subArray.push(data.process_name);
  //                            subArray.push(data.std_hour);
  //                            subArray.push(data.line_name);
  //                            subArray.push(moment(data.move_in).format("YYYY-MM-DD HH:mm:ss"));
  //                            subArray.push(moment(data.move_out).format("YYYY-MM-DD HH:mm:ss"));
  //                            subArray.push(data.output);
  //                            subArray.push(data.ng_quantity);
  //                            subArray.push(data.output_variance);
  //                            subArray.push(data.duration_variance);
  //                            trackingArray.push(subArray);
  //                        });
  //                        trackingResultData = trackingArray;
  //                        console.log(trackingResultData);
  //                    },
  //                    fail : function (data){
  //                        console.log(data);
  //                    }
  //                });
  //                servkit.politeCheck()
  //                    .until(function() {
  //                        return trackingResultData;
  //                    }).thenDo(function() {
  //                    dayTable.drawTable(trackingResultData);
  //                    dayTable.showWidget();
  //                }).tryDuration(0)
  //                    .start();
  //            },
  //            demo : function(dayTable){
  //                var resultData = [];
  //                var subArray = [];
  //                servkit.ajax({
  //                    url: servkit.rootPath + '/api/getdata/db',
  //                    type: 'POST',
  //                    contentType: 'application/json',
  //                    data: JSON.stringify({
  //                        table: 'a_servtrack_view_operating_performance',
  //                        columns: ['shift_day',
  //                            'product_name',
  //                            'work_id',
  //                            'op',
  //                            'process_name',
  //                            'std_hour',
  //                            'line_name',
  //                            'move_in',
  //                            'move_out',
  //                            'output',
  //                            'ng_quantity',
  //                            'output_variance',
  //                            'duration_variance']
  //                    })
  //                },{
  //                    success : function(dbData){
  //                        // console.log(dbData);
  //                        _.each(dbData, function(mData){
  //                            // console.log(mData);
  //                            _.map(mData, function(data) {
  //                                // console.log(data);
  //
  //                                subArray.push(moment(data.shift_day).format("YYYY-MM-DD HH:mm:ss"));
  //                                subArray.push(data.product_name);
  //                                subArray.push(data.work_id);
  //                                subArray.push(data.op);
  //                                subArray.push(data.process_name);
  //                                subArray.push(data.std_hour);
  //                                subArray.push(data.line_name);
  //                                subArray.push(data.move_in);
  //                                subArray.push(moment(data.move_in).format("YYYY-MM-DD HH:mm:ss"));
  //                                subArray.push(data.output);
  //                                subArray.push(data.ng_quantity);
  //                                subArray.push(data.output_variance);
  //                                subArray.push(data.duration_variance);
  //                                console.log(subArray);
  //                                resultData.push(subArray);
  //                            });
  //                        });
  //                    },
  //                    fail : function(data){
  //                        console.log(data);
  //                    }
  //                });
  //                // console.log(resultData);
  //                // var resultData = [
  //                //       ['2017/05/15', '車鎖A', '1705005-01', '01', '一次加工', '0.45', '加工一站', '2017/05/15 09:11:32', '2017/05/15 11:55:32', '350', '2', '-15', '-6.98'],
  //                //       ['2017/05/15', '車鎖A', '1705005-01', '01', '一次加工', '0.45', '加工一站', '2017/05/15 13:06:32', '2017/05/15 14:36:32', '200', '4', '-3', '-1.56'],
  //                //       ['2017/05/15', '車鎖A', '1705005-01', '02', '二次加工', '0.58', '加工二站', '2017/05/15 14:41:32', '2017/05/15 17:32:32', '300', '3', '4', '2.54'],
  //                //       ['2017/05/15', '車鎖A', '1705005-01', '02', '二次加工', '0.58', '加工二站', '2017/05/15 18:03:11', '2017/05/15 20:20:32', '244', '2', '6', '4.05'],
  //                //       ['2017/05/16', '車鎖A', '1705005-01', '03', '點焊', '2.23', '點焊二區', '2017/05/16 08:02:14', '2017/05/16 12:02:14', '120', '7', '5', '12.18'],
  //                //       ['2017/05/16', '車鎖A', '1705005-01', '03', '點焊', '2.23', '點焊二區', '2017/05/16 13:02:14', '2017/05/16 17:32:14', '125', '1', '3', '6.73'],
  //                //       ['2017/05/16', '車鎖A', '1705005-01', '03', '點焊', '2.23', '點焊二區', '2017/05/16 18:01:32', '2017/05/16 21:55:32', '130', '12', '13', '29.34'],
  //                //       ['2017/05/17', '車鎖A', '1705005-01', '03', '點焊', '2.23', '點焊二區', '2017/05/17 08:01:32', '2017/05/17 11:55:32', '121', '10', '6', '13.72']
  //                // ];
  //                // dayTable.drawTable(resultData);
  //                // dayTable.showWidget();
  //            }
  //        },
  //        preCondition : {
  //            lines : function (done) {
  //                var that = this;
  //                servkit.ajax({
  //                    url: servkit.rootPath + '/api/getdata/db',
  //                    type: 'POST',
  //                    contentType: 'application/json',
  //                    data: JSON.stringify({
  //                        table: 'a_servtrack_line',
  //                        columns: ['line_id', 'line_name']
  //                    })
  //                },{
  //                    success : function(data){
  //                        var func = that.commons.initializeDBData(data);
  //                        func.init('line_id', 'line_name');
  //                        done(func);
  //                    },
  //                    fail : function(data){
  //                        console.log(data);
  //                    }
  //                });
  //            },
  //            products : function (done) {
  //                var that = this;
  //                console.log("1111111111111111111");
  //                console.log(that);
  //                servkit.ajax({
  //                    url: servkit.rootPath + '/api/getdata/db',
  //                    type: 'POST',
  //                    contentType: 'application/json',
  //                    data: JSON.stringify({
  //                        table: 'a_servtrack_product',
  //                        columns: ['product_id', 'product_name', 'is_open']
  //                    })
  //                },{
  //                    success : function(data){
  //                        var func = that.commons.initializeDBData(data);
  //                        func.init('product_id', 'product_name');
  //                        done(func);
  //                    },
  //                    fail : function(data){
  //                        console.log(data);
  //                    }
  //                });
  //            }
  //        },
  //        dependencies: [
  //            [
  //                "/js/plugin/flot/jquery.flot.cust.min.js",
  //                "/js/plugin/flot/jquery.flot.resize.min.js",
  //                "/js/plugin/flot/jquery.flot.fillbetween.min.js",
  //                "/js/plugin/flot/jquery.flot.orderBar.min.js",
  //                "/js/plugin/flot/jquery.flot.pie.min.js",
  //                "/js/plugin/flot/jquery.flot.tooltip.min.js",
  //                "/js/plugin/flot/jquery.flot.axislabels.js"
  //            ],
  //            [
  //                "/js/plugin/datatables/jquery.dataTables.min.js",
  //                "/js/plugin/datatables/dataTables.colVis.min.js",
  //                "/js/plugin/datatables/dataTables.tableTools.min.js",
  //                "/js/plugin/datatables/dataTables.bootstrap.min.js",
  //                "/js/plugin/datatable-responsive/datatables.responsive.min.js"
  //            ],
  //            ["/js/plugin/select2/select2.min.js"]
  //        ]
  //
  //    });
}
