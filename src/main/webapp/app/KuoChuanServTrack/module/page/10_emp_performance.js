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
        ctx.initElements()
        servkit.validateForm($('#main-form1'), ctx.$searchBtn1)
        servkit.validateForm($('#main-form2'), ctx.$searchBtn2)
        ctx.initEvents()
      },
      util: {
        $shiftDay1: $('#shift-day-1'),
        $shiftDay2: $('#shift-day-2'),
        $searchBtn1: $('#search1-submit-btn'),
        $searchBtn2: $('#search2-submit-btn'),
        $cleanBtn1: $('#search1-submit-clean'),
        $cleanBtn2: $('#search2-submit-clean'),
        $productId: $('#product-id'),
        $staffId: $('#staff-id'),
        $productTypeId: $('#product_type_id'),
        $dataTableWidget: $('#data-table-widget'),
        $dataTableBody: $('#data-table-body'),
        $extraInfo: $('.extra-info'),
        $addMangerWageCondition: $(':checkbox[name=addMangerWageCondition]'),
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
        },
        initEvents: function () {
          var ctx = this
          ctx.$searchBtn1.on('click', function (evt) {
            // evt.preventDefault();
            var params = {
              shift_day: ctx.$shiftDay1.val(),
              product_ids: ctx.$productId.val() || [],
              staff_id: ctx.$staffId.val() || '',
            }
            ctx.drawTable(params, false)
            return false
          })

          ctx.$searchBtn2.on('click', function (evt) {
            evt.preventDefault()
            var params = {
              shift_day: ctx.$shiftDay2.val(),
              product_type_id: ctx.$productTypeId.val(),
              product_ids: [],
              addMangerWageCondition: ctx.$addMangerWageCondition
                .filter(':checked')
                .val(),
            }
            ctx.drawTable(
              params,
              ctx.$addMangerWageCondition.filter(':checked').val() == '1'
            )
            return false
          })

          ctx.$cleanBtn1.on('click', function (evt) {
            ctx.$shiftDay1.val(moment().format('YYYY-MM-DD'))
            ctx.$productId.prop('selectedIndex', -1)
            ctx.$staffId.prop('selectedIndex', -1)
            pageSetUp()
            return false
          })

          ctx.$cleanBtn2.on('click', function (evt) {
            ctx.$shiftDay2.val(moment().format('YYYY-MM-DD'))
            // ctx.$productTypeId.prop('selectedIndex', -1);
            ctx.$productTypeId.find('option:first').prop('selected', true)
            ctx.$addMangerWageCondition.eq(0).prop('checked', true)
            ctx.$addMangerWageCondition.eq(1).prop('checked', false)
            pageSetUp()
            return false
          })
        },
        initElements: function () {
          var ctx = this
          ctx.$shiftDay1
            .datepicker(ctx.datepickerConfig)
            .val(moment().format('YYYY-MM-DD'))
          ctx.$shiftDay2
            .datepicker(ctx.datepickerConfig)
            .val(moment().format('YYYY-MM-DD'))

          ctx.$productId.html(ctx.productFunc.getSelect())
          ctx.$productId.prop('selectedIndex', -1)
          ctx.$staffId.html(ctx.staffFunc.getSelect())
          ctx.$staffId.prop('selectedIndex', -1)
          ctx.$productTypeId.html(ctx.productTypeFunc.getSelect())
          ctx.$productTypeId.select2()
          ctx.$addMangerWageCondition
            .on('change', function (evt) {
              ctx.$addMangerWageCondition.prop('checked', false)
              $(this).prop('checked', true)
            })
            .eq(0)
            .prop('checked', true)
        },
        drawTable: function (params, addMangerWage) {
          var ctx = this
          ctx.$extraInfo.empty()
          var table = createReportTable({
            $tableElement: ctx.$dataTableBody,
            rightColumn: [7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
            excel: {
              fileName: 'empPerformance',
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
              url: 'api/kuochuan/servtrack/empperformance/read',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify(params),
            },
            {
              success: function (data) {
                //                            var difference = 0.0;
                var totalCost = 0.0
                var totalQuantity = 0.0
                var managerWage = 0
                var workingHour = 0
                var difference = {}
                _.map(data, function (obj) {
                  if (difference[obj.staff_id] === undefined) {
                    difference[obj.staff_id] = 0.0
                  }
                  difference[obj.staff_id] += obj.hour_difference
                  totalCost += obj.staff_wage * obj.cost_duration
                  totalQuantity += obj.go_quantity
                  if (addMangerWage) {
                    managerWage = obj.manager_wage
                    workingHour = obj.working_hour
                  }
                })
                var result = _.map(data, function (obj) {
                  return [
                    obj.staff_name,
                    obj.work_id,
                    obj.product_id,
                    obj.product_type_id,
                    obj.manager_name,
                    obj.process_name,
                    obj.process_step,
                    (parseFloat(obj.std_hour) * 60).toFixed(1),
                    obj.line_name,
                    obj.staff_wage,
                    obj.cost_duration,
                    obj.cost_real,
                    obj.cost_sp,
                    obj.cost_difference,
                    obj.go_quantity,
                    obj.quantity_sp,
                    obj.qua_difference,
                    obj.hour_difference,
                    difference[obj.staff_id].toFixed(2),
                  ]
                })
                if (addMangerWage) {
                  ctx.$extraInfo.append(
                    '當日主管薪資：' +
                      managerWage +
                      '*' +
                      workingHour +
                      '=' +
                      managerWage * workingHour +
                      '<br />'
                  )
                }
                ctx.$extraInfo.append(
                  '單件平均成本：' +
                    (
                      (totalCost + managerWage * workingHour) /
                      totalQuantity
                    ).toFixed(4) +
                    '/pcs'
                )
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
}
