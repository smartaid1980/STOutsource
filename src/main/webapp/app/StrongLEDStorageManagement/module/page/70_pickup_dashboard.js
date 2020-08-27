import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.initEnvironment() // 建立環境
    },
    util: {
      today: moment().format('YYYY/MM/DD'), // 今天日期
      maxRecord: 15, // 每頁顯示的最大筆數
      spinner: null,
      initEnvironment: function () {
        var ctx = this
        pageSetUp()

        servkit.initSelectWithList(this.preCon.getWares, $('#ware-select'))

        servkit.validateForm($('#query-form'), $('#query-btn'))

        // 頻率設定
        ctx.spinner = $('#refresh-freq-spinner').spinner({
          min: 1,
          spin: function (event, ui) {
            ctx.freq = ui.value
            if (ctx.dashboard) ctx.dashboard.setFreqMillisecond(ctx.freq * 1000)
          },
        })
        ctx.freq = ctx.spinner.spinner('value')

        // 選擇倉別後再輪播
        $('#query-btn').on('click', function (evt) {
          evt.preventDefault()

          if (!ctx.updateData)
            ctx.updateData = servkit
              .schedule('updateTrackingData')
              .freqMillisecond(30 * 1000)
              .action(function () {
                servkit.ajax(
                  {
                    url: 'api/getdata/db',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({
                      table: 'a_strongled_bill_stock_out_main',
                      columns: [
                        'bill_no',
                        'stock_out_date',
                        'remark',
                        'ware_id',
                        'status',
                      ],
                      whereClause: `status!=9 AND ware_id='${$(
                        '#ware-select'
                      ).val()}'`,
                    }),
                  },
                  {
                    success: function (data) {
                      $('#store>span').text($('#ware-select').val())
                      ctx.addDataToTable(data)
                    },
                    always: function () {
                      $('#update-time>span').text(
                        moment().format('YYYY/MM/DD HH:mm:ss')
                      )
                      if ($('#dashboard').closest('article').hasClass('hide'))
                        $('.jarviswidget-fullscreen-btn').trigger('click')
                    },
                  }
                )
              })
              .start()
          if (!ctx.dashboard)
            ctx.dashboard = servkit
              .schedule('updateTrackingData')
              .freqMillisecond(ctx.freq * 1000)
              .action(function () {
                // 逾期要自動換頁
                var overdueIndex = ctx.overdueObj.pageIndex + 1
                if (ctx.overdueObj.data)
                  if (
                    overdueIndex >=
                    Math.ceil(
                      ctx.overdueObj.data.length / ctx.overdueObj.maxRecord
                    )
                  )
                    overdueIndex = 0
                if ($('#dashboard').closest('article').hasClass('hide'))
                  overdueIndex = 0

                ctx.overdueObj.update(null, overdueIndex)
              })
              .start()
          else {
            ctx.updateData.stop()
            ctx.updateData.start()
            ctx.dashboard.stop()
            ctx.dashboard.start()
          }
        })

        $('.jarviswidget-fullscreen-btn')
          .closest('.jarviswidget-ctrls')
          .addClass('hide')
        // 綁定全螢幕按鈕(按下後要直接全螢幕，不要只是放大)
        $('.jarviswidget-fullscreen-btn').on('click', function () {
          $('#dashboard').closest('article').toggleClass('hide')
          if ($(this).children().hasClass('fa-expand')) {
            if (
              document.getElementById('widget-grid').webkitRequestFullscreen
            ) {
              document.getElementById('widget-grid').webkitRequestFullscreen()
            } else if (
              document.getElementById('widget-grid').mozRequestFullScreen
            ) {
              document.getElementById('widget-grid').mozRequestFullScreen()
            }
          } else {
            ctx.dashboard.stop()
            ctx.updateData.stop()
            if (document.webkitExitFullscreen) {
              document.webkitExitFullscreen()
            } else if (document.mozCancelFullScreen) {
              document.mozCancelFullScreen()
            }
          }
        })
        $('#rotate-end').on('click', function () {
          $('.jarviswidget-fullscreen-btn').trigger('click')
        })

        // 建立 逾期領料單
        this.overdueObj = this.table(
          'overdue',
          `${i18n('Overdue_Picklist')}`,
          this.maxRecord
        )
        // 建立 當日領料單
        this.todayObj = this.table(
          'today',
          `${i18n('Today_Picklist')}`,
          this.maxRecord
        )
        this.todayObj.showPage = false // 當日的不用換頁

        // 結案
        const closeLoadingBtn = servkit.loadingButton(
          document.querySelector('#close-btn')
        )
        $('#close-btn').on('click', function () {
          closeLoadingBtn.doing()
          servkit.ajax(
            {
              url: 'api/storage/billstockout/bill-before-today',
              type: 'PUT',
            },
            {
              success: function () {
                closeLoadingBtn.done()
                $('#close-modal').modal('hide')
              },
            }
          )
        })
      },
      addDataToTable: function (data) {
        // 把資料加到表格中
        const today = new Date(this.today).getTime()
        var overdueList = []
        var todayList = []

        // 分別放到兩個陣列裡
        _.each(data, (val) => {
          var date = new Date(moment(val.stock_out_date, 'YYYYMMDD')).getTime()
          var html = []
          html.push(`<tr>`)
          html.push(`  <td>{index}</td>`)
          html.push(`  <td>${val.bill_no}</td>`)
          html.push(`  <td>${val.stock_out_date}</td>`)
          html.push(`  <td>${val.remark}</td>`)
          html.push(`</tr>`)
          if (date < today)
            overdueList.push(
              html.join('').replace('{index}', overdueList.length + 1)
            )
          else if (date === today)
            todayList.push(
              html.join('').replace('{index}', todayList.length + 1)
            )
        })

        // 逾期要自動換頁
        var overdueIndex = this.overdueObj.pageIndex + 1
        if (this.overdueObj.data)
          if (
            overdueIndex >=
            Math.ceil(this.overdueObj.data.length / this.overdueObj.maxRecord)
          )
            overdueIndex = 0
        if ($('#dashboard').closest('article').hasClass('hide'))
          overdueIndex = 0

        this.overdueObj.update(overdueList)
        this.todayObj.update(todayList)
      },
      table: function (id, title, maxRecord) {
        // 表格
        class Table {
          constructor(id, title, maxRecord) {
            this.maxRecord = maxRecord
            this.createTable(id, title)
            this.changePageEvent()
            this.showPage = true
          }

          set data(data) {
            this._data = data
          }

          get data() {
            return this._data
          }

          set showPage(showPage) {
            this._showPage = showPage
            if (showPage)
              this.$tableContainer.find('.pages').removeClass('hide')
            else this.$tableContainer.find('.pages').addClass('hide')
          }

          get showPage() {
            return this._showPage
          }

          update(data, index) {
            if (data) this.data = data
            this.pageIndex =
              index === undefined ? this.pageIndex || 0 : index || 0
            const pages = this.data
              ? Math.ceil(this.data.length / this.maxRecord)
              : 0
            const first = this.maxRecord * this.pageIndex
            const last = this.maxRecord * (this.pageIndex + 1)
            this.$tableContainer
              .find('.table-records>span')
              .text(this.data ? this.data.length : 0)
            this.$tableContainer
              .find('tbody')
              .html(this.data ? this.data.slice(first, last).join('') : '')

            if (this.showPage && pages > 1) {
              // 繪製頁碼按鈕
              var getPageTag = this.getPageTag
              var addPageTagLoop = function (start, times, pageIndex) {
                for (var i = start; i < start + times; i++) {
                  pageHtml.push(
                    getPageTag(i, i + 1, false, i === pageIndex ? true : false)
                  )
                }
              }
              var pageHtml = []
              pageHtml.push(
                this.getPageTag(
                  '-1',
                  `${i18n('Previous')}`,
                  this.pageIndex ? false : true,
                  false
                )
              )
              if (pages <= 6) addPageTagLoop(0, pages, this.pageIndex)
              else {
                if (this.pageIndex < 4) {
                  addPageTagLoop(0, 5, this.pageIndex)
                  pageHtml.push(this.getPageTag('', '...', true, false))
                  addPageTagLoop(pages - 1, 1, this.pageIndex)
                } else if (this.pageIndex > pages - 5) {
                  addPageTagLoop(0, 1, this.pageIndex)
                  pageHtml.push(this.getPageTag('', '...', true, false))
                  addPageTagLoop(pages - 5, 5, this.pageIndex)
                } else {
                  addPageTagLoop(0, 1, this.pageIndex)
                  pageHtml.push(this.getPageTag('', '...', true, false))
                  addPageTagLoop(this.pageIndex - 1, 3, this.pageIndex)
                  pageHtml.push(this.getPageTag('', '...', true, false))
                  addPageTagLoop(pages - 1, 1, this.pageIndex)
                }
              }
              pageHtml.push(
                this.getPageTag(
                  '+1',
                  `${i18n('Next')}`,
                  this.pageIndex !== pages - 1 ? false : true,
                  false
                )
              )
              this.$tableContainer.find('.pages').html(pageHtml.join(''))
            }
          }

          getPageTag(index, label, disable, active) {
            var pageHtml = []
            var className = ''
            if (disable) className += ' disabled'
            if (active) className += ' active'
            pageHtml.push(`<li class="page${className}">`)
            pageHtml.push(
              `  <a href="javascript: void(0)" data-index="${index}">${label}</a>`
            )
            pageHtml.push(`</li>`)
            return pageHtml.join('')
          }

          createTable(id, title) {
            var html = []
            html.push(`<div id="${id}">`)
            html.push(`  <div></div>`)
            html.push(`  <div class="table-title txt-md">${title}</div>`)
            var records = `${i18n('Remaining_Records')}`.replace(
              '{index}',
              ' <span>0</span> '
            )
            html.push(`  <div class="table-records">${records}</div>`)
            html.push(`  <table>`)
            html.push(`    <thead>`)
            html.push(`      <th width="5%">${i18n('Serial_Number')}</th>`)
            html.push(`      <th width="10%">${i18n('Order_No')}</th>`)
            html.push(`      <th width="15%">${i18n('Due_Date')}</th>`)
            html.push(`      <th width="80%">${i18n('Remarks')}</th>`)
            html.push(`    </thead>`)
            html.push(`    <tbody></tbody>`)
            html.push(`  </table>`)
            html.push(`  <div class="table-footer">`)
            html.push(`    <ul class="pages"></ul>`)
            html.push(`  </div>`)
            html.push(`</div>`)
            $('#table-container').append(html.join(''))
            this.$tableContainer = $('#' + id)
          }

          changePageEvent() {
            var param = this
            this.$tableContainer
              .find('.pages')
              .on('click', '.page', function (evt) {
                evt.preventDefault()
                if (!$(this).hasClass('disabled')) {
                  var index = $(this).find('a').data('index')

                  if (index !== '') {
                    if (index === '+1') param.update(null, param.pageIndex + 1)
                    // 下一頁
                    else if (index === -1)
                      param.update(null, param.pageIndex - 1)
                    // 上一頁
                    else param.update(null, index) // 指定頁
                  }
                }
              })
          }
        }

        return new Table(id, title, maxRecord)
      },
    },
    preCondition: {
      getWares: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_strongled_bill_stock_out_main',
              columns: ['ware_id'],
              whereClause: `status!=9 GROUP BY ware_id`,
            }),
          },
          {
            success: function (data) {
              var wareMap = {}
              _.each(data, (val) => (wareMap[val.ware_id] = val.ware_id))
              done(wareMap)
            },
          }
        )
      },
    },
  })
}
