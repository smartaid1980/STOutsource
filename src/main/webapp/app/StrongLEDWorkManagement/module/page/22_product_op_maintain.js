import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      pageSetUp()

      var showdemoConfig
      try {
        showdemoConfig = servkit.showdemoConfig[ctx.appId][ctx.funId]
      } catch (e) {
        console.warn(e)
      } finally {
        showdemoConfig = showdemoConfig || {
          productId: '',
          processName: '',
        }
      }
      ctx.$demoBtn.on('click', function (evt) {
        evt.preventDefault()
        ctx.$productId.val(showdemoConfig.productId)
        ctx.$productName.val(showdemoConfig.productName)
        ctx.$submitBtn.click()
      })

      ctx.$submitBtn
        .on('click', function (evt) {
          evt.preventDefault() //防止氣泡事件
          var productId = ctx.$productId.val()
          var productName = ctx.$productName.val()
          ctx.read(productId, productName)
        })
        .trigger('click')

      $('#stk-product-table-body').on('click', '[name=ng-btn]', function (evt) {
        evt.preventDefault()
        var productId = $(this).parent().parent().find('td').eq(1).text()
        ctx.productDetail(this)
        ctx.getOpData(productId)
        var processDatas = ctx.preCon.processDatas
        ctx.getProcessDataObject(processDatas)
        $('#opModal').modal()
      })
    },
    util: {
      $submitBtn: $('#submit-btn'),
      $productId: $('#product_id'),
      $productName: $('#product_name'),
      $demoBtn: $('#demo-btn'),
      $detailNote: $('#detail-note'),
      $productTable: '',
      $opTable: '',
      chackable: false,
      chackable2: false,
      requestParam: '',
      processIsOpenDataObject: {},
      processDataObject: {},
      getProcessDataObject: function (data) {
        var that = this
        _.each(data, function (data) {
          var processDataMap = {}
          processDataMap['process_name'] = data.process_name
          processDataMap['process_quality'] = data.process_quality
          processDataMap['remark'] = data.remark
          that.processDataObject[data.process_code] = processDataMap
        })
      },
      productDetail: function (ele) {
        var that = this
        var productId = $(ele).parent().parent().find('td').eq(1).text()
        var productName = $(ele).parent().parent().find('td').eq(2).text()
        var remark = $(ele).parent().parent().find('td').eq(3).text()
        var html =
          '<div class="row">' +
          '<section class="col col-6">' +
          `<label class="label">${i18n('ServTrackManagement_000100')} |` +
          productId +
          '</label>' +
          '</section>' +
          '<section class="col col-6">' +
          `<label class="label">${i18n('ServTrackManagement_000043')} |` +
          productName +
          '</label>' +
          '</section>' +
          '</div>' +
          '<div class="row">' +
          '<section class="col col-6">' +
          `<label class="label">${i18n('ServTrackManagement_000095')} |` +
          remark +
          '</label>' +
          '</section>'
        that.$detailNote.html(html)
      },
      getOpData: function (productId) {
        var that = this
        if (that.chackable) {
          $('#stk-op-table-body').get(0).innerHTML = ''
          $('#stk-op-table-body').append(that.$opTable)
          that.$opTable = $('#stk-op-table').get(0).cloneNode(true)
        } else {
          that.$opTable = $('#stk-op-table').get(0).cloneNode(true)
          that.chackable = true
        }

        function createAndUpdateSend(tdEles) {
          return {
            is_open: (function () {
              if ($(tdEles[6]).find('input:checked').length) {
                return 'Y'
              } else {
                return 'N'
              }
            })(),
            process_code: (function () {
              var process_code = $(tdEles[2]).find(':selected').val()
              return process_code
            })(),
          }
        }

        var createAndUpdateEnd = {
          4: function (td) {
            var result = $(td).find('input').val()
            return '<p align="right">' + parseFloat(result).toFixed(4) + '<p>'
          },
          5: function (td) {
            var result = $(td).find('input').val()
            return '<p align="right">' + parseFloat(result).toFixed(2) + '<p>'
          },
          7: function (td) {
            if ($(td).find('input:checked').length) {
              return '<span class="label label-success" style="cursor:pointer">ON</span>'
            } else {
              return '<span class="label label-default" style="cursor:pointer">OFF</span>'
            }
          },
          3: function (td) {
            return $(td).find(':selected').text()
          },
        }
        var processDatas
        var namesHtml
        servkit.ajax(
          {
            url: servkit.rootPath + '/api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_servtrack_process',
              columns: ['process_code', 'process_name'],
              whereClause: 'is_open = ?',
              whereParams: ['Y'],
            }),
          },
          {
            success: function (data) {
              processDatas = data
              _.map(data, function (data) {
                that.processIsOpenDataObject[data.process_code] =
                  data.process_name
              })
            },
            fail: function (data) {
              console.warn(data)
            },
          }
        )

        servkit
          .politeCheck()
          .until(function () {
            return processDatas
          })
          .thenDo(function () {
            var namesSelectHtml = ''
            _.each(processDatas, function (data) {
              namesSelectHtml +=
                '<option style="padding:3px 0 3px 3px;" value="' +
                data.process_code +
                '">' +
                data.process_name +
                '</option>'
            })
            namesHtml = namesSelectHtml
          })
          .tryDuration(0)
          .start()
        servkit
          .politeCheck()
          .until(function () {
            return namesHtml
          })
          .thenDo(function () {
            servkit.crudtable({
              tableSelector: '#stk-op-table',
              hideCols: [1],
              create: {
                url:
                  'api/servtrack/productop/create?productid=' +
                  encodeURIComponent(productId),
                start: function (tdEles) {
                  var selectHtml = $(
                    '<select style="width:100%" class="select2" name="process_name" ></select>'
                  )
                  selectHtml.append(namesHtml)
                  $(tdEles).eq(2).html(selectHtml)
                  $('[name=process_name]').prop('selectedIndex', -1)
                  pageSetUp()
                  $('[name="process_name"]').on('change', function () {
                    var process_code = $(this).val()
                    console.warn(tdEles)
                    $(tdEles)
                      .eq(4)
                      .children()
                      .eq(0)
                      .val(that.processDataObject[process_code].process_quality)
                    $(tdEles)
                      .eq(5)
                      .children()
                      .eq(0)
                      .val(that.processDataObject[process_code].remark)
                  })
                },
                send: createAndUpdateSend,
                end: createAndUpdateEnd,
              },
              read: {
                url:
                  'api/servtrack/productop/readid?productid=' +
                  encodeURIComponent(that.commons.checkEscapeSymbol(productId)),
                end: {
                  3: function (data) {
                    return that.processDataObject[data].process_name
                  },
                  4: function (data) {
                    return (
                      '<p align="right">' + parseFloat(data).toFixed(4) + '<p>'
                    )
                  },
                  5: function (data) {
                    return (
                      '<p align="right">' + parseFloat(data).toFixed(2) + '<p>'
                    )
                  },
                  7: function (data) {
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
                  'api/servtrack/productop/update?productid=' +
                  encodeURIComponent(productId),
                start: {
                  3: function (oldTd, newTd, oldTr, newTr) {
                    var oldProcesssName = $(oldTd).eq(0).text()
                    $(newTd).find('[name=process_code]').select2()
                    servkit.initSelectWithList(
                      that.preCon.getProcessList,
                      $(newTd).find('[name=process_code]')
                    )
                    $(newTd)
                      .find('[name=process_code]')
                      .val(that.preCon.processName2Code[oldProcesssName])
                      .trigger('change')
                    $(newTd).find('div').eq(0).remove()

                    $(newTd)
                      .find('[name="process_code"]')
                      .on('change', function () {
                        var process_code = $(this).val()
                        $(newTr)
                          .find('[name=remark]')
                          .val(that.processDataObject[process_code].remark)
                        $(newTr)
                          .find('[name=op_quality_sp]')
                          .val(
                            that.processDataObject[process_code].process_quality
                          )
                      })
                  },
                  7: function (oldTd, newTd) {
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
                2: function (td, table) {
                  var input = td.querySelector('input')
                  if (input.value === '') {
                    return `${i18n('ServTrackManagement_000094')}`
                  }
                  if (!input.disabled) {
                    if (
                      _.find(table.columns(0).data().eq(0), function (existId) {
                        return (
                          existId.toLowerCase() === input.value.toLowerCase()
                        )
                      })
                    ) {
                      return `${i18n('ServTrackManagement_000102')}`
                    }
                  }
                  if (input.value.length > 50) {
                    return `${i18n('ServTrackManagement_000001')}`
                  }
                  var regChinese = /^[\u4E00-\u9FA5]+$/
                  if (regChinese.test(input.value)) {
                    return `<br>${i18n('ServTrackManagement_000022')}`
                  }
                  var regHalfwidth = /[^\x20-\xff]/g
                  if (regHalfwidth.test(input.value)) {
                    return `${i18n('ServTrackManagement_000024')}`
                  }
                  if (that.commons.symbolValidation(input.value)) {
                    return `${i18n('ServTrackManagement_000197')}`
                  }
                },
                3: function (td) {
                  if (td.querySelector('select').value === '') {
                    return `${i18n('ServTrackManagement_000029')}`
                  }
                },
                4: function (td) {
                  var input = td.querySelector('input')
                  if (input.value === '') {
                    return `${i18n('ServTrackManagement_000033')}`
                  } else if (Number(input.value) === 0) {
                    return `${i18n('ServTrackManagement_000082')}`
                  }
                  if (isNaN(input.value)) {
                    return `${i18n('ServTrackManagement_000006')}`
                  } else if (0 > input.value || input.value > 999999.9999) {
                    return `${i18n('ServTrackManagement_000032')}`
                  }
                },
                5: function (td) {
                  var input = td.querySelector('input')
                  if (input.value === '') {
                    return `${i18n('ServTrackManagement_000103')}`
                  } else if (isNaN(input.value)) {
                    return `${i18n('ServTrackManagement_000006')}`
                  } else if (0 > input.value || input.value > 100) {
                    return `${i18n('ServTrackManagement_000004')}`
                  }
                },
                6: function (td) {
                  var input = td.querySelector('input')
                  if (input.value.length > 50) {
                    return `${i18n('ServTrackManagement_000001')}`
                  }
                },
              },
            })
          })
          .tryDuration(0)
          .start()
      },
      read: function (productId, productName) {
        var that = this

        if (that.chackable2) {
          $('#stk-product-table-body').get(0).innerHTML = ''
          $('#stk-product-table-body').append(that.$productTable)
          that.$productTable = $('#stk-product-table').get(0).cloneNode(true)
        } else {
          that.$productTable = $('#stk-product-table').get(0).cloneNode(true)
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
          6: function () {
            var buttonHtml = `<button class="btn btn-primary" name="ng-btn">${i18n(
              'ServTrackManagement_000034'
            )}</button>`
            return buttonHtml
          },
        }

        servkit.crudtable({
          tableSelector: '#stk-product-table',
          create: {
            url: 'api/servtrack/product/create',
            send: createAndUpdateSend,
            end: createAndUpdateEnd,
          },
          read: {
            url:
              'api/servtrack/product/read?productid=' +
              encodeURIComponent(that.commons.checkEscapeSymbol(productId)) +
              '&productname=' +
              encodeURIComponent(that.commons.checkEscapeSymbol(productName)),
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
                return `<button class="btn btn-primary" name="ng-btn">${i18n(
                  'ServTrackManagement_000034'
                )}</button>`
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
            url: 'api/servtrack/product/update',
            start: {
              5: function (oldTd, newTd) {
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
                return `${i18n('ServTrackManagement_000092')}`
              }
              if (!input.disabled) {
                if (
                  _.find(table.columns(0).data().eq(0), function (existId) {
                    return existId.toLowerCase() === input.value.toLowerCase()
                  })
                ) {
                  return `${i18n('ServTrackManagement_000099')}`
                }
              }
              if (that.commons.symbolValidation(input.value)) {
                return `${i18n('ServTrackManagement_000197')}`
              }
              if (input.value.length > 50) {
                return `${i18n('ServTrackManagement_000001')}`
              }
              var regChinese = /^[\u4E00-\u9FA5]+$/
              if (regChinese.test(input.value)) {
                return `<br>${i18n('ServTrackManagement_000022')}`
              }
              var regHalfwidth = /[^\x20-\xff]/g
              if (regHalfwidth.test(input.value)) {
                return `${i18n('ServTrackManagement_000024')}`
              }
            },
            2: function (td) {
              var input = td.querySelector('input')
              if (input.value === '') {
                return `${i18n('ServTrackManagement_000093')}`
              }
              if (input.value.length > 50) {
                return `${i18n('ServTrackManagement_000001')}`
              }
              var regHalfwidth = /[\uFE30-\uFFA0]/g
              if (regHalfwidth.test(input.value)) {
                return `${i18n('ServTrackManagement_000023')}`
              }
              if (that.commons.symbolValidation(input.value)) {
                return `${i18n('ServTrackManagement_000197')}`
              }
            },
            3: function (td) {
              var input = td.querySelector('input')
              if (input.value.length > 50) {
                return `${i18n('ServTrackManagement_000001')}`
              }
            },
            4: function (td) {
              var input = td.querySelector('input')
              if (input.value === '') {
                return `${i18n('ServTrackManagement_000005')}`
              } else if (isNaN(input.value)) {
                return `${i18n('ServTrackManagement_000006')}`
              } else if (0 > input.value || input.value > 100) {
                return `${i18n('ServTrackManagement_000004')}`
              }
            },
          },
        })
      },
    },
    preCondition: {
      processDatas: function (done) {
        servkit.ajax(
          {
            url: servkit.rootPath + '/api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_servtrack_process',
              columns: [
                'process_code',
                'process_name',
                'process_quality',
                'remark',
              ],
              whereClause: 'is_open = ?',
              whereParams: ['Y'],
            }),
          },
          {
            success: function (data) {
              done(data)
            },
            fail: function (data) {
              console.warn(data)
            },
          }
        )
      },
      getProcessList: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_servtrack_process',
              columns: ['process_code', 'process_name'],
              whereClause: "is_open = 'Y'",
            }),
          },
          {
            success: function (data) {
              var dataMap = {}
              _.each(data, function (elem, key) {
                dataMap[elem.process_code] = elem.process_name
              })
              done(dataMap)
            },
          }
        )
      },
      processName2Code: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_servtrack_process',
              columns: ['process_code', 'process_name'],
              whereClause: "is_open = 'Y'",
            }),
          },
          {
            success: function (data) {
              var dataMap = {}
              _.each(data, function (elem, key) {
                dataMap[elem.process_name] = elem.process_code
              })
              done(dataMap)
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
