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
        $startDate: $('#startDate'),
        $endDate: $('#endDate'),
        $processCode: $('#process_code'),
        $productTypeId: $('#product_type_id'),
        $submitBtn: $('#submit-btn'),
        $cleanBtn: $('#submit-clean'),
        $ngquality: $('#line-chart-ngquality'),
        $trackingng: $('#line-chart-trackingng'),
        $ngqualityTitle: $('#line-chart-ngquality-title'),
        $ngqualityGrid: $('#line-chart-ngquality-grid'),
        $trackingngTitle: $('#line-chart-trackingng-title'),
        datepickerConfig: {
          dateFormat: 'yy-mm-dd',
          prevText: '<i class="fa fa-chevron-left"></i>',
          nextText: '<i class="fa fa-chevron-right"></i>',
        },
        initFuncs: function () {
          var ctx = this
          if (ctx.preCon.processes) {
            ctx['processFunc'] = ctx.preCon.processes
          }
          if (ctx.preCon.productTypes) {
            ctx['productTypeFunc'] = ctx.preCon.productTypes
          }
        },
        initEvents: function () {
          var ctx = this
          servkit.validateForm($('#main-form'), ctx.$submitBtn)
          ctx.$submitBtn.on('click', function (evt) {
            var params = {
              startDate: ctx.$startDate.val(),
              endDate: ctx.$endDate.val(),
              process_code: ctx.$processCode.val() || '',
              product_type_id: ctx.$productTypeId.val() || '',
            }
            var productType = ctx.$productTypeId.val() || ''
            ctx.$ngqualityTitle.html(
              (productType !== ''
                ? ctx.productTypeFunc.getName(ctx.$productTypeId.val()) + '_'
                : '') +
                ctx.$processCode.find('option:selected').text() +
                '&nbsp;不良推移圖'
            )
            ctx.$trackingngTitle.html(
              (productType !== ''
                ? ctx.productTypeFunc.getName(ctx.$productTypeId.val()) + '_'
                : '') +
                ctx.$processCode.find('option:selected').text() +
                '&nbsp;不良原因累計圖'
            )
            ctx.draw(params)
            return false
          })

          ctx.$cleanBtn.on('click', function (evt) {
            ctx.$startDate.val(moment().format('YYYY/MM/DD'))
            ctx.$endDate.val(moment().format('YYYY/MM/DD'))
            //                        ctx.$processCode.prop('selectedIndex', -1);
            ctx.$processCode.find('option:first').prop('selected', true)
            ctx.$productTypeId.prop('selectedIndex', -1)
            pageSetUp()
            return false
          })
        },
        initElements: function () {
          var ctx = this
          moment().get
          servkit.initDatePicker(ctx.$startDate, ctx.$endDate, true)
          servkit.initSelectWithList(ctx.preCon.processes, ctx.$processCode)
          ctx.$processCode.select2()
          //                    ctx.$processCode.html(ctx.processFunc.getSelect());
          //                    ctx.$processCode.find('option:first').prop('selected' , true);
          ctx.$productTypeId.html(ctx.productTypeFunc.getSelect())
          ctx.$productTypeId.prop('selectedIndex', -1)
        },
        draw: function (params) {
          var ctx = this

          servkit.ajax(
            {
              url: 'api/kuochuan/servtrack/ngquality/readngquality',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify(params),
            },
            {
              success: function (data) {
                ctx.$ngqualityGrid.empty()

                $('<div />')
                  .css({
                    'display': 'inline-block',
                    'width': '15px',
                    'height': '15px',
                    'background': servkit.colors.blue,
                    'vertical-align': 'middle',
                  })
                  .appendTo(ctx.$ngqualityGrid)

                ctx.$ngqualityGrid.append('不良率')

                $('<div />')
                  .css({
                    'display': 'inline-block',
                    'width': '15px',
                    'height': '15px',
                    'background': servkit.colors.orange,
                    'vertical-align': 'middle',
                    'margin-left': '15px',
                  })
                  .appendTo(ctx.$ngqualityGrid)

                ctx.$ngqualityGrid.append('管制界線')

                var process_quality = 0
                _.each(data, function (obj) {
                  process_quality = obj.process_quality
                })

                var start = moment(ctx.$startDate.val())
                var end = moment(ctx.$endDate.val())

                var result = []

                while (end.diff(start) >= 0) {
                  result.push({
                    shift_day: start.format('MM-DD'),
                    ng_quantity: 0.0,
                    process_quality: (100.0 - process_quality).toFixed(2),
                  })
                  start.add(1, 'd')
                }

                _.each(data, function (obj) {
                  _.each(result, function (item) {
                    if (
                      item.shift_day == moment(obj.shift_day).format('MM-DD')
                    ) {
                      item.ng_quantity = (
                        (parseFloat(obj.ng_quantity) / parseFloat(obj.output)) *
                        100
                      ).toFixed(2)
                      item.process_quality = (
                        100.0 - obj.process_quality
                      ).toFixed(2)
                    }
                  })
                })

                //                            var result = _.map(data, function(obj){
                //                                return {
                //                                    'shift_day': moment(obj.shift_day).format('MM-DD'),
                //                                    'ng_quantity': (parseFloat(obj.ng_quantity) / parseFloat(obj.output) * 100).toFixed(2),
                //                                    'process_quality': obj.process_quality
                //                                };
                //                            });

                var chart = ctx.$ngquality.data('morrisChart')
                if (_.isUndefined(chart)) {
                  chart = Morris.Line({
                    element: ctx.$ngquality.attr('id'),
                    data: result,
                    xkey: 'shift_day',
                    ykeys: ['ng_quantity', 'process_quality'],
                    postUnits: '%',
                    //                                    yLabelFormat: function(y){
                    //                                        return y + '%';
                    //                                    },
                    labels: ['不良率', '管制界線'],
                    lineColors: [servkit.colors.blue, servkit.colors.orange],
                    parseTime: false,
                    hideHover: 'auto',
                  })
                  ctx.$ngquality.data('morrisChart', chart)
                } else {
                  chart.setData(result)
                }
                //                            var ticks = [];
                //                            var ngQuantitys = [];
                //                            var processQuality = [];
                //                            _.each(data, function (obj, i) {
                //                                ticks.push([i, obj.shift_day]);
                //                                ngQuantitys.push([i, (parseFloat(obj.ng_quantity) / parseFloat(obj.output) * 100).toFixed(2)]);
                //                                processQuality.push([i, parseInt(obj.process_quality , 10)]);
                //                            });
                //

                //
                //                            var font = {
                //                                size: 14,
                //                                color: 'black'
                //                            };
                //                            var options = {
                //                                tooltip: true,
                //                                tooltipOpts: {
                //                                    content: '<b class="hide">%x</b><span>%y</span>',
                //                                    defaultTheme: false
                //                                },
                //                                grid: {
                //                                    hoverable: true,
                //                                    clickable: true,
                //                                    labelMargin: 30 // prevent bar from overlapped by yaxis tick
                //                                },
                //                                xaxis: {
                //                                    ticks: ticks,
                //                                    font: font
                //                                },
                //                                yaxes: [{
                //                                    position: 'left',
                //                                    font: font
                //                                }]
                //                            };
                //
                //                            $.plot(ctx.$ngquality, chartDatas , options);
              },
              fail: function (data) {
                console.warn(data)
              },
            }
          )

          servkit.ajax(
            {
              url: 'api/kuochuan/servtrack/ngquality/readtrackingng',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify(params),
            },
            {
              success: function (data) {
                //                            data = _.sortBy(data, 'ng_quantity');
                var ticks = []
                var barData = []
                var lineData = []
                var ngAccum = 0
                var ngSum = _.reduce(
                  data,
                  function (memo, obj) {
                    memo += parseInt(obj.ng_quantity, 10)
                    return memo
                  },
                  0
                )

                data.sort(function (a, b) {
                  return b.ng_quantity - a.ng_quantity
                })

                _.each(data, function (obj, i) {
                  ticks.push([i, obj.ng_name])
                  barData.push([i, parseInt(obj.ng_quantity, 10)])
                  ngAccum += parseInt(obj.ng_quantity, 10)
                  lineData.push([
                    i,
                    parseFloat(((ngAccum / ngSum) * 100).toFixed(2)),
                  ])
                })

                var chartDatas = [
                  {
                    data: barData,
                    color: servkit.colors.blue,
                    bars: {
                      align: 'center',
                      show: true,
                      barWidth: 1,
                    },
                    valueLabels: {
                      show: true,
                      font: '12pt ' + servkit.fonts,
                      valign: 'middle', // above, below, middle, bottom
                    },
                  },
                  {
                    data: lineData,
                    yaxis: 2,
                    color: servkit.colors.orange,
                    points: {
                      show: true,
                      symbol: 'circle',
                      fillColor: servkit.colors.orange,
                    },
                    lines: {
                      show: true,
                    },
                  },
                ]

                var font = {
                  size: 14,
                  color: 'black',
                }
                var options = {
                  tooltip: true,
                  tooltipOpts: {
                    content: '<b class="hide">%x</b><span>%y</span>',
                    defaultTheme: false,
                  },
                  grid: {
                    hoverable: true,
                    clickable: true,
                    labelMargin: 30, // prevent bar from overlapped by yaxis tick
                  },
                  xaxis: {
                    ticks: ticks,
                    font: font,
                  },
                  yaxes: [
                    {
                      position: 'left',
                      font: font,
                    },
                    {
                      position: 'right',
                      font: font,
                      min: 0,
                      tickFormatter: function (v, axis) {
                        return v.toFixed(0) + '%'
                      },
                    },
                  ],
                }

                $.plot(ctx.$trackingng, chartDatas, options)
              },
              fail: function (data) {
                console.warn(data)
              },
            }
          )
        },
      },
      preCondition: {
        processes: function (done) {
          //                    servkit.ajax({
          //                        url: "api/servtrack/process/read",
          //                        type: 'GET'
          //                    }, {
          //                        success: function (data) {
          ////                            var func = initializeDBData(data);
          ////                            func.init('process_code', 'process_name');
          ////                            done(func);
          //                            done(_.reduce(data, function (memo, elem) {
          //                                memo[elem.process_code] = elem.process_name;
          //                                return memo;
          //                            }, {}));
          //                        }
          //                    });

          var ctx = this
          servkit.ajax(
            {
              url: servkit.rootPath + '/api/getdata/db',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                table: 'a_servtrack_process',
                columns: ['process_code', 'process_name'],
                whereClause: 'process_code <> ?',
                whereParams: ['invalid'],
              }),
            },
            {
              success: function (data) {
                //                            var func = initializeDBData(data);
                //                            func.init('product_id', 'product_name');
                //                            done(func);
                done(
                  _.reduce(
                    data,
                    function (memo, elem) {
                      memo[elem.process_code] = elem.process_name
                      return memo
                    },
                    {}
                  )
                )
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
      },
      delayCondition: [],
      dependencies: [
        [
          '/js/plugin/flot/jquery.flot.cust.min.js',
          '/js/plugin/flot/jquery.flot.resize.min.js',
          '/js/plugin/flot/jquery.flot.fillbetween.min.js',
          '/js/plugin/flot/jquery.flot.orderBar.min.js',
          '/js/plugin/flot/jquery.flot.tooltip.min.js',
          '/js/plugin/flot/jquery.flot.axislabels.js',
          '/js/plugin/flot/jquery.flot.stack.min.js',
          '/js/plugin/flot/jquery.flot.valuelabels.js',
        ],
        [
          '/js/plugin/datatables/jquery.dataTables.min.js',
          '/js/plugin/datatables/dataTables.colVis.min.js',
          '/js/plugin/datatables/dataTables.tableTools.min.js',
          '/js/plugin/datatables/dataTables.bootstrap.min.js',
          '/js/plugin/datatable-responsive/datatables.responsive.min.js',
        ],
        ['/js/plugin/select2/select2.min.js'],
        ['/js/plugin/morris/raphael.min.js', '/js/plugin/morris/morris.min.js'],
      ],
    })
  })()
}
