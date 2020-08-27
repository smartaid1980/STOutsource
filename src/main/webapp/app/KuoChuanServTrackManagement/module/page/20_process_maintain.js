export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.$submitBtn
        .on('click', function (evt) {
          evt.preventDefault() // 防止氣泡事件
          var codeValue = context.$processCode.val()
          var nameValue = context.$processName.val()
          context.read(codeValue, nameValue)
        })
        .trigger('click')
      $('#stk-process-table-body').on('click', '[name=ng-btn]', function (evt) {
        evt.preventDefault()
        var processCode = $(this).parent().parent().find('td').eq(1).text()
        context.processDetail(this)
        context.getNgData(processCode)
        $('#ngModal').modal()
      })

      context.$submitClean.on('click', function (evt) {
        evt.preventDefault()
        context.$processCode.val('')
        context.$processName.val('')
      })
    },
    util: {
      $submitBtn: $('#submit-btn'),
      $submitClean: $('#submit-clean'),
      $processCode: $('#process_code'),
      $processName: $('#process_name'),
      $demoBtn: $('#demo-btn'),
      $detailNote: $('#detail-note'),
      $proccessTable: '',
      $ngTable: '',
      chackable: false,
      chackable2: false,
      requestParam: '',

      processDetail: function (ele) {
        var that = this
        var processCode = $(ele).parent().parent().find('td').eq(1).text()
        var processName = $(ele).parent().parent().find('td').eq(2).text()
        var remark = $(ele).parent().parent().find('td').eq(3).text()
        var html =
          '<div class="row">' +
          '<section class="col col-6">' +
          '<label class="label">製程編號 |' +
          processCode +
          '</label>' +
          '</section>' +
          '<section class="col col-6">' +
          '<label class="label">製程名稱 |' +
          processName +
          '</label>' +
          '</section>' +
          '</div>' +
          '<div class="row">' +
          '<section class="col col-6">' +
          '<label class="label">說明|' +
          remark +
          '</label>' +
          '</section>'
        that.$detailNote.html(html)
      },
      getCodedata: function () {
        var that = this
        alert(that.$processCode.val())
      },
      getNameData: function () {
        var that = this
        alert(that.$processName.val())
      },
      getNgData: function (processCode) {
        var that = this
        if (that.chackable) {
          $('#stk-ng-table-body').get(0).innerHTML = ''
          $('#stk-ng-table-body').append(that.$ngTable)
          that.$ngTable = $('#stk-ng-table').get(0).cloneNode(true)
        } else {
          that.$ngTable = $('#stk-ng-table').get(0).cloneNode(true)
          that.chackable = true
        }

        function createAndUpdateSend(tdEles) {
          return {
            is_open: (function () {
              if ($(tdEles[3]).find('input:checked').length) {
                return 'Y'
              } else {
                return 'N'
              }
            })(),
          }
        }

        var createAndUpdateEnd = {
          4: function (td) {
            if ($(td).find('input:checked').length) {
              return '<span class="label label-success" style="cursor:pointer">ON</span>'
            } else {
              return '<span class="label label-default" style="cursor:pointer">OFF</span>'
            }
          },
        }
        servkit.crudtable({
          tableSelector: '#stk-ng-table',
          create: {
            url:
              'api/servtrack/processng/create?processcode=' +
              encodeURIComponent(processCode),
            send: createAndUpdateSend,
            end: createAndUpdateEnd,
          },
          read: {
            url:
              'api/servtrack/processng/readcode?processcode=' +
              encodeURIComponent(processCode),
            end: {
              4: function (data) {
                if (data === 'Y') {
                  return '<span class="label label-success" style="cursor:pointer">ON</span>'
                } else {
                  return '<span class="label label-default" style="cursor:pointer">OFF</span>'
                }
              },
            },
            finalDo: function () {
              _.each(
                document.querySelectorAll('.stk-delete-all-checkbox'),
                function (ele) {
                  ele.style.display = 'none'
                }
              )
            },
          },
          update: {
            url:
              'api/servtrack/processng/update?processcode=' +
              encodeURIComponent(processCode),
            start: {
              4: function (oldTd, newTd, oldTr, newTr) {
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
              var input = td.querySelector('input')
              if (input.value === '') {
                return '<br>請填不良代碼'
              }
              if (!input.disabled) {
                if (
                  _.find(table.columns(0).data().eq(0), function (existId) {
                    return existId.toLowerCase() === input.value.toLowerCase()
                  })
                ) {
                  return '<br>不良代碼重複'
                }
              }
              if (input.value.length > 10) {
                return '<br>長度不可超過10'
              }
              var regChinese = /^[\u4E00-\u9FA5]+$/
              if (regChinese.test(input.value)) {
                return '<br>不能有中文字'
              }
              // var regHalfwidth = /[^\x00-\xff]/g
              // if (regHalfwidth.test(input.value)) {
              //   return '不可輸入全形字元'
              // }
              var regQuestion = /[?]+/
              if (regQuestion.test(input.value)) {
                return '特殊符號僅包含~!@#$%^&*()_+=-`/\\.[]{}'
              }
              var regSymbol = /[^a-zA-Z0-9~@#%&_=\-`()+!$*^/.[]{}]+/
              if (regSymbol.test(input.value)) {
                return '特殊符號僅包含~!@#$%^&*()_+=-`/\\.[]{}'
              }
            },
            2: function (td) {
              var input = td.querySelector('input')
              if (input.value === '') {
                return '<br>請填不良名稱'
              }
              if (input.value.length > 50) {
                return '<br>長度不可超過50'
              }
              var regHalfwidth = /[\uFE30-\uFFA0]/g
              if (regHalfwidth.test(input.value)) {
                return '不可輸入全形字母數字'
              }
              var regQuestion = /[?]+/
              if (regQuestion.test(input.value)) {
                return '特殊符號僅包含~!@#$%^&*()_+=-`/\\.[]{}'
              }
              var regSymbol = /[^\u4E00-\u9FA5a-zA-Z0-9~@#%&_=\-`()+!$*^/.[]{}]+/
              if (regSymbol.test(input.value)) {
                return '特殊符號僅包含~!@#$%^&*()_+=-`/\\.[]{}'
              }
            },
            3: function (td) {
              var input = td.querySelector('input')
              if (input.value.length > 50) {
                return '<br>長度不可超過50'
              }
            },
          },
        })
      },
      read: function (codeValue, nameValue) {
        var that = this

        if (that.chackable2) {
          $('#stk-process-table-body').get(0).innerHTML = ''
          $('#stk-process-table-body').append(that.$proccessTable)
          that.$proccessTable = $('#stk-process-table').get(0).cloneNode(true)
        } else {
          that.$proccessTable = $('#stk-process-table').get(0).cloneNode(true)
          that.chackable2 = true
        }

        function createAndUpdateSend(tdEles) {
          return {
            is_open: (function () {
              if ($(tdEles[4]).find('input:checked').length) {
                return 'Y'
              } else {
                return 'N'
              }
            })(),
          }
        }
        var createAndUpdateEnd = {
          4: function (td) {
            var result = $(td).find('input').val()
            return '<p align="right">' + parseFloat(result).toFixed(2) + '<p>'
          },
          5: function (td) {
            if ($(td).find('input:checked').length) {
              return '<span class="label label-success" style="cursor:pointer">ON</span>'
            } else {
              return '<span class="label label-default" style="cursor:pointer">OFF</span>'
            }
          },
          6: function (td) {
            var buttonHtml =
              '<button class="btn btn-primary" name="ng-btn">設定</button>'
            return buttonHtml
          },
        }

        if (codeValue !== '' && nameValue == '') {
          that.requestParam =
            'code?processcode=' + "'" + encodeURIComponent(codeValue) + "'"
        } else if (codeValue == '' && nameValue !== '') {
          that.requestParam =
            'name?processname=' + "'" + encodeURIComponent(nameValue) + "'"
        } else if (codeValue !== '' && nameValue !== '') {
          that.requestParam =
            'codename?processcode=' +
            "'" +
            encodeURIComponent(codeValue) +
            "'" +
            '&' +
            'processname=' +
            "'" +
            encodeURIComponent(nameValue) +
            "'"
        } else {
          that.requestParam = ''
        }

        servkit.crudtable({
          tableSelector: '#stk-process-table',
          create: {
            url: 'api/servtrack/process/create',
            send: createAndUpdateSend,
            end: createAndUpdateEnd,
          },
          read: {
            url: 'api/servtrack/process/read' + that.requestParam,
            end: {
              4: function (data) {
                return '<p align="right">' + parseFloat(data).toFixed(2) + '<p>'
              },
              5: function (data) {
                if (data === 'Y') {
                  return '<span class="label label-success" style="cursor:pointer">ON</span>'
                } else {
                  return '<span class="label label-default" style="cursor:pointer">OFF</span>'
                }
              },
              6: function () {
                return '<button class="btn btn-primary" name="ng-btn">設定</button>'
              },
            },
            finalDo: function () {
              _.each(
                document.querySelectorAll('.stk-delete-all-checkbox'),
                function (ele) {
                  ele.style.display = 'none'
                }
              )
            },
          },
          update: {
            url: 'api/servtrack/process/update',
            start: {
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
              var input = td.querySelector('input')
              if (input.value === '') {
                return '<br>請填製程編號'
              }
              if (!input.disabled) {
                if (
                  _.find(table.columns(0).data().eq(0), function (existId) {
                    return existId.toLowerCase() === input.value.toLowerCase()
                  })
                ) {
                  return '<br>製程編號重複'
                }
              }
              if (input.value.length > 10) {
                return '<br>長度不可超過10'
              }
              var regChinese = /^[\u4E00-\u9FA5]+$/
              if (regChinese.test(input.value)) {
                return '<br>不能有中文字'
              }
              // var regHalfwidth = /[^\x00-\xff]/g
              // if (regHalfwidth.test(input.value)) {
              //   return '不可輸入全形字元'
              // }
              var regQuestion = /[?]+/
              if (regQuestion.test(input.value)) {
                return '特殊符號僅包含~!@#$%^&*()_+=-`/\\.[]{}'
              }
              var regSymbol = /[^a-zA-Z0-9~@#%&_=\-`()+!$*^/.[]{}]+/
              if (regSymbol.test(input.value)) {
                return '特殊符號僅包含~!@#$%^&*()_+=-`/\\.[]{}'
              }
            },
            2: function (td) {
              var input = td.querySelector('input')
              if (input.value === '') {
                return '<br>請輸入製程名稱'
              }
              if (input.value.length > 50) {
                return '<br>長度不可超過50'
              }
              var regHalfwidth = /[\uFE30-\uFFA0]/g
              if (regHalfwidth.test(input.value)) {
                return '不可輸入全形字母數字'
              }
              var regQuestion = /[?]+/
              if (regQuestion.test(input.value)) {
                return '特殊符號僅包含~!@#$%^&*()_+=-`/\\.[]{}'
              }
              var regSymbol = /[^\u4E00-\u9FA5a-zA-Z0-9~@#%&_=\-`()+!$*^/.[]{}]+/
              if (regSymbol.test(input.value)) {
                return '特殊符號僅包含~!@#$%^&*()_+=-`/\\.[]{}'
              }
            },
            3: function (td) {
              var input = td.querySelector('input')
              if (input.value.length > 50) {
                return '<br>長度不可超過50'
              }
            },
            4: function (td) {
              var input = td.querySelector('input')
              var regFloat = /^[0-9]+(.[0-9]{0,2})?$/
              if (input.value === '') {
                return '<br>請填目標值'
              } else if (isNaN(input.value)) {
                return '<br>請填數字'
              } else if (input.value < 0 || input.value > 100) {
                return '請輸入0 ~ 100範圍的值'
              }
            },
            5: function (td) {
              var processCode = $(td).parent().attr('stk-db-id')
              if (processCode) {
                var isChecked = $(td).find('input').prop('checked')
                var removeDoubleQuotesProcessCode = processCode.replace(
                  /"/g,
                  ''
                )
                var convertBackslashDoubleToOne = removeDoubleQuotesProcessCode.replace(
                  /\\\\/g,
                  '\\'
                )
                var productId = that.preCon.productOps.getName(
                  convertBackslashDoubleToOne
                )
                if (!isChecked && productId) {
                  return '<br>有產品使用此製程無法關閉'
                }
              }
            },
          },
        })
      },
    },
    preCondition: {
      productOps: function (done) {
        var that = this
        servkit.ajax(
          {
            url: servkit.rootPath + '/api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_servtrack_product_op',
              columns: ['process_code', 'product_id'],
            }),
          },
          {
            success: function (data) {
              var func = that.commons.initializeDBData(data)
              func.init('process_code', 'product_id')
              done(func)
            },
            fail: function (data) {
              console.log(data)
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
}
