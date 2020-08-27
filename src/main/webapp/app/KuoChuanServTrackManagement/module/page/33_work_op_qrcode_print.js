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

    function smallBox(params) {
      var smallBoxColor = {
        green: '#739E73',
        red: '#C46A69',
        yellow: '#C79121',
      }
      var content = params.content
      if (!content) {
        content = ''
      }
      $.smallBox({
        title: params.title,
        content:
          "<i class='fa fa-clock-o'></i>" + content + '<i>1 seconds ago...</i>',
        color: smallBoxColor[params.color],
        iconSmall: params.icon,
        timeout: params.timeout,
      })
    }

    function bling(blingTimes, frequency, $elements, color) {
      blingTimes = blingTimes * 2 + 1
      var blingCount = 1

      setTimeout(function change() {
        if (blingCount < blingTimes) {
          if (blingCount++ % 2 === 0) {
            $elements.css('background-color', '')
          } else {
            $elements.css('background-color', color)
          }
          setTimeout(change, frequency)
        }
      }, 0)
    }

    function uuidGenerator(len, radix) {
      // var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
      var chars = '0123456789abcdefghijklmnopqrstuvwxyz'.split('')
      var uuid = [],
        i
      radix = radix || chars.length

      if (len) {
        for (i = 0; i < len; i++) uuid[i] = chars[0 | (Math.random() * radix)]
      } else {
        var r

        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-'
        uuid[14] = '4'

        for (i = 0; i < 36; i++) {
          if (!uuid[i]) {
            r = 0 | (Math.random() * 16)
            uuid[i] = chars[i == 19 ? (r & 0x3) | 0x8 : r]
          }
        }
      }

      return uuid.join('')
    }

    GoGoAppFun({
      gogo: function (ctx) {
        pageSetUp()
        ctx.initFuncs(ctx)
        ctx.initElements(ctx)

        var datepickerConfig = {
          dateFormat: 'yy/mm/dd',
          prevText: '<i class="fa fa-chevron-left"></i>',
          nextText: '<i class="fa fa-chevron-right"></i>',
        }

        ctx.$startDate
          .datepicker(datepickerConfig)
          .val(moment().format('YYYY/MM/DD'))
        ctx.$endDate
          .datepicker(datepickerConfig)
          .val(moment().format('YYYY/MM/DD'))

        ctx.$submit.on('click', function (evt) {
          evt.preventDefault()
          ctx.drawTable()
        })
        $('.stk-check-all').on('click', function (evt) {
          evt.stopPropagation()
          if ($(this).prop('checked')) {
            _.each(ctx.$workTable.find('tbody > tr'), function (trEle) {
              $(trEle).find('td:first-child input').prop('checked', true)
            })
          } else {
            _.each(ctx.$workTable.find('tbody > tr'), function (trEle) {
              $(trEle).find('td:first-child input').prop('checked', false)
            })
          }
        })

        ctx.$workBody.on('click', '.stk-qrcode-btn', function (evt) {
          evt.preventDefault()
          var trEleArr = []
          _.each(ctx.$workTable.find('tbody > tr'), function (trEle) {
            var tdCheckBoxEle = $(trEle).find('td:first-child input')
            if ($(tdCheckBoxEle).prop('checked')) {
              var obj = {
                work_id: $(trEle).find('td').eq(1).text(),
                op: $(trEle).find('td').eq(8).text(),
              }
              trEleArr.push(obj)
            }
          })
          if (!trEleArr.length) {
            bling(
              5,
              100,
              ctx.$workTable.find(
                'thead tr:nth-child(2) td:first-child,tbody tr td:first-child'
              ),
              'rgba(255, 0, 0, 0.2)'
            )
          } else {
            var params = ctx.formatParam(
              _.groupBy(trEleArr, function (obj) {
                return obj.work_id
              })
            )
            ctx.getQRCodedocx(params)
          }
        })

        // //*************** Custom *****************
        // // crudtable.js 額外 客製 按鈕們  的事件處理

        //       //當選的筆數改變 或者換頁的時後 要去做 是否啟用 checkbox 的確認
        //       $('#stk-line-table').on("draw.dt", function (evt) {
        //           evt.preventDefault();
        //           ctx.activeCheck();
        //         });

        //       //QRCODE Btn 如果點選 編輯的話 要 disabled , 然後如果是點其它的要把他還原成可以點
        //       $('#stk-line-table > tbody').on('click', '.stk-edit-btn,.stk-cancel-btn,.stk-save-btn', function (evt) {
        //         var name  = evt.target.className;
        //         if (name.indexOf('stk-edit-btn') > 1 || name.indexOf('fa-pencil') > 1) {
        //           $('#stk-line-table').closest('div').find('div > .stk-qrcode-btn').prop('disabled', true);
        //         } else {
        //           $('#stk-line-table').closest('div').find('div > .stk-qrcode-btn').prop('disabled', false);
        //         }
        //       });

        //       //把 QRCode btn 綁 事件
        //       $('#stk-line-table').closest('div').find('div > .stk-qrcode-btn').on('click', function (evt) {
        //         var qrCodeArr = [];
        //         _.each($('#stk-line-table').find('tbody > tr'), function (trEle) {
        //           var tdEle = $(trEle).find("td:first-child input");
        //           if ($(tdEle).prop('checked') && tdEle.css('display') !== 'none') {
        //             qrCodeArr.push($(trEle).find("td:nth-child(2)").text());
        //           }
        //         });
        //         ctx.getQRCodedocx(qrCodeArr, this);
        //       });
        //**********************************************
      },
      util: {
        $startDate: $('#start-date'),
        $endDate: $('#end-date'),
        $workId: $('#work-id'),
        $productId: $('#product-id'),
        $submit: $('#submit-btn'),
        $workTableWidget: $('#work-table-widget'),
        $workTable: $('#work-table'),
        $workBody: $('#work-table-body'),
        $Forms: $('#stk-file'),
        formatParam: function (paramObj) {
          var works = {}
          _.each(_.keys(paramObj), function (key) {
            works[key] = []
            _.each(paramObj[key], function (obj) {
              works[key].push(obj.op)
            })
          })
          // var result = _.map(_.keys(works), function (key) {
          //   return {
          //     "work_id": key,
          //     "op": works[key]
          //   };
          // });
          return works
        },
        drawTable: function () {
          var that = this
          var loadingBtn = servkit.loadingButton(
            document.querySelector('#submit-btn')
          )
          loadingBtn.doing()
          var startDate = this.$startDate.val()
          var endDate = this.$endDate.val()
          var workId = this.$workId.val()
          var productId = this.$productId.val()
          var custBtnDiv = $('<div class="col-xs-12 col-sm-6"></div>')
          custBtnDiv.append(
            "<button class='btn bg-color-blueDark txt-color-white stk-qrcode-btn' title='print QRCode' style='margin-right:10px'><span class='fa fa-qrcode fa-lg'></span></button>"
          )
          var table = createReportTable({
            $tableWidget: that.$workTableWidget,
            $tableElement: that.$workTable,
            centerColumn: [0, 6, 7, 8],
            order: [[1, 'asc']],
            onRow: function (row, data) {
              $(row).find('td').eq(2).css('display', 'none')
            },
            onDraw: function (tableData, pageData) {},
          })
          try {
            servkit.ajax(
              {
                url: 'api/kuochuan/servtrack/workop/getworks',
                type: 'GET',
                data: {
                  startDate: startDate,
                  endDate: endDate,
                  workId: workId,
                  productId: productId,
                },
              },
              {
                success: function (data) {
                  var checkbox =
                    "<input class='stk-delete-all-checkbox' type='checkbox' style='width:16px;height:16px;margin-left:4px;margin-right:4px' />"

                  var result = _.map(data, function (obj) {
                    return [
                      checkbox,
                      obj.work_id,
                      obj.product_id,
                      obj.product_name,
                      obj.e_quantity,
                      obj.input,
                      obj.create_time,
                      obj.user_name,
                      obj.op,
                      obj.process_name,
                      (parseFloat(obj.std_hour) * 60).toFixed(1),
                      obj.remark,
                    ]
                  })
                  table.drawTable(result)
                  _.each(that.$workTable.prev().find('.hidden-xs'), function (
                    ele
                  ) {
                    $(ele).css('display', 'none')
                  })
                  that.$workTable.prev().prepend(custBtnDiv[0].cloneNode(true))
                  table.showWidget()
                },
              }
            )
          } catch (e) {
            console.warn(e)
          } finally {
            loadingBtn.done()
          }
        },
        // activeCheck : function () {
        //   $('#stk-line-table').closest('div').find('div > .stk-delete-btn').hide();
        //   _.each($('#stk-line-table').find('tbody > tr'), function (trEle) {
        //     var tdCheckBoxEle = $(trEle).find("td:first-child input");
        //     var type  = $(trEle).find("td:nth-child(7)").text();
        //     if (type !== 'ON') {
        //       tdCheckBoxEle.hide();
        //     } else {
        //       tdCheckBoxEle.show();
        //     }
        //   });

        // },
        getQRCodedocx: function (works) {
          var that = this
          var uuid = uuidGenerator(32)
          if (!works) {
            $.smallBox({
              title: '請選取需列印的QRCode...',
              content: '<i class="fa fa-clock-o"></i> <i>2 seconds ago...</i>',
              color: '#C79121',
              iconSmall: 'fa fa-warning shake animated',
              timeout: 2000,
            })
          } else {
            $.smallBox({
              title: 'Please Wait...',
              content: '<i class="fa fa-clock-o"></i> <i>2 seconds ago...</i>',
              color: '#739E73',
              iconSmall: 'fa fa-warning shake animated',
              timeout: 2000,
            })

            var $submitForm = $('<form name="' + uuid + '""></form>'),
              iframeHtml =
                '<iframe name="download_target" style="width:0;height:0;border:0px solid #fff;""></iframe>'
            $submitForm.append(
              $('<input>').attr('name', 'works').val(JSON.stringify(works))
            )
            $submitForm.append($('<input>').attr('name', 'uuid').val(uuid))
            $submitForm.attr({
              action: 'api/kuochuan/servtrack/workop/printQRCode',
              method: 'post',
              target: 'download_target',
            })

            that.$Forms.append($submitForm.hide())
            $submitForm.append(iframeHtml)

            document.querySelector('[name="' + uuid + '"]').submit()
          }
        },
        initFuncs: function (ctx) {
          if (ctx.preCon.products) {
            ctx['productFunc'] = ctx.preCon.products
          }
          if (ctx.preCon.works) {
            ctx['workFunc'] = ctx.preCon.works
          }

          if (ctx.preCon.process) {
            ctx['processFunc'] = ctx.preCon.process
          }
        },
        initElements: function (ctx) {
          ctx.$productId.html(ctx.productFunc.getSelect())
          ctx.$productId.prop('selectedIndex', -1)
          ctx.$workId.html(ctx.workFunc.getSelect())
          ctx.$workId.prop('selectedIndex', -1)
        },
      },
      dependencies: [
        ['/js/plugin/select2/select2.min.js'],
        [
          '/js/plugin/datatables/jquery.dataTables.min.js',
          '/js/plugin/datatables/dataTables.colVis.min.js',
          '/js/plugin/datatables/dataTables.tableTools.min.js',
          '/js/plugin/datatables/dataTables.bootstrap.min.js',
          '/js/plugin/datatable-responsive/datatables.responsive.min.js',
        ],
      ],
      preCondition: {
        products: function (done) {
          var that = this
          servkit.ajax(
            {
              url: servkit.rootPath + '/api/getdata/db',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                table: 'a_servtrack_product',
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
        works: function (done) {
          var that = this
          servkit.ajax(
            {
              url: servkit.rootPath + '/api/getdata/db',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                table: 'a_servtrack_work',
                columns: ['work_id'],
                whereClause:
                  'work_id <> ? AND 1=1 order by work_id desc limit 200',
                whereParams: ['INVALID_WORK'],
                // whereParams: [yyyyMM],
              }),
            },
            {
              success: function (data) {
                var func = initializeDBData(data)
                func.init('work_id', 'work_id')
                done(func)
              },
              fail: function (data) {
                console.log(data)
              },
            }
          )
        },
        process: function (done) {
          var that = this
          servkit.ajax(
            {
              url: servkit.rootPath + '/api/getdata/db',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                table: 'a_servtrack_process',
                columns: ['process_code', 'process_name', 'is_open'],
              }),
            },
            {
              success: function (data) {
                var func = initializeDBData(data)
                func.init('process_code', 'process_name')
                done(func)
              },
              fail: function (data) {
                console.log(data)
              },
            }
          )
        },
      },
    })
  })()
}
