import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      $('#machine-title').text(servkit.getMachineName(context.machineId))

      context.hackBrowserCss()

      if (context.preCon.levelTree.success) {
        context.createLevelTree(context.preCon.levelTree.data)
        context.bindSearchEvent()
        context.listenLadder()

        $(window).on('hashchange', function cancelFetch() {
          servkit.ajax(
            {
              url: 'api/command/cancelFetch',
              type: 'GET',
              data: {
                machineId: context.machineId,
              },
            },
            {
              success: function (data) {
                $.bigBox({
                  title: `${i18n('Cancel_Fetch')}`,
                  content: `${i18n('Success')}`,
                  color: '#739E73',
                  icon: 'fa fa-check animated',
                  number: '',
                  timeout: 6000,
                })
              },
            }
          )
          $(window).off('hashchange', cancelFetch)
        })
      } else {
        $.bigBox({
          title: `${i18n('Load_Fail')}`,
          content: context.preCon.levelTree.data,
          color: '#C46A69',
          icon: 'fa fa-warning animated',
          number: '',
        })
      }
    },

    util: {
      machineId: undefined,
      $levelTree: $('#level-tree'),
      $ladderTitle: $('#ladder-title'),
      $ladderGraph: $('#ladder-graph'),

      createLevelTree: function (levelTree) {
        var that = this
        that.addressTable = {}

        var treeHtml =
          '<ol class="dd-list">' +
          _.map(levelTree, function (addresses, level) {
            return (
              '<li class="dd-item">' +
              '<div class="dd-handle ladder-level" data-level="' +
              level +
              '">' +
              '<i class="fa fa-reorder" /> ' +
              level +
              '<span class="include-address"></span>' +
              (addresses.containsAlarm
                ? '<em class="pull-right badge bg-color-red padding-5" rel="tooltip" title="" data-placement="left" data-original-title="Warning Icon Text"><i class="fa fa-warning txt-color-white"></i></em>'
                : '') +
              '</div>' +
              '<ol class="dd-list">' +
              _.map(addresses.addresses, function (address) {
                var addressDot = that.dotUnderlineSwitch(address)

                if (that.addressTable[addressDot]) {
                  if (that.addressTable[addressDot].indexOf(level) === -1) {
                    that.addressTable[addressDot].push(level)
                  }
                } else {
                  that.addressTable[addressDot] = [level]
                }

                return (
                  '<li class="dd-item">' +
                  '<div class="dd-handle ladder-address" data-address="' +
                  addressDot +
                  '">' +
                  '<i class="fa fa-map-marker" /> ' +
                  addressDot +
                  '</div>' +
                  '</li>'
                )
              }).join('') +
              '</ol>' +
              '</li>'
            )
          }).join('') +
          '</ol>'

        that.$levelTree.html(treeHtml)
        that.$levelTree
          .nestable()
          .on('mousedown', '.dd-handle', function (evt) {
            evt.preventDefault()
            return false
          })
          .on('click', '.dd-handle', function (evt) {
            evt.preventDefault()
            return false
          })
          .on('click', '.ladder-level', function (evt, byAddress) {
            $('.highlight-level').removeClass('highlight-level')

            var $this = $(this)

            $this.find('i.fa-refresh, i.fa-check').remove()
            $this.append(
              '<i class="fa fa-lg fa-refresh fa-spin txt-color-blue" />'
            )

            servkit.ajax(
              {
                url:
                  'app/Ladder/Data/ladderHTML/' +
                  that.machineId +
                  '/ladder/' +
                  that.trimLadderZero($this.data('level')) +
                  '.html',
                type: 'GET',
              },
              {
                plainText: function (data) {
                  that.nodesModel = undefined

                  that.$ladderTitle.html($this.data('level'))
                  that.$ladderGraph.html(data)

                  that.nodesModel = new that.NodesModel()

                  that.search(byAddress)

                  $this
                    .addClass('highlight-level')
                    .find('i.fa-refresh, i.fa-check')
                    .removeClass('fa-refresh fa-spin txt-color-blue')
                    .addClass('fa-check txt-color-greenLight')
                },
                always: function () {
                  setTimeout(function () {
                    $this.find('i.fa-check').remove()
                  }, 5000)
                },
              }
            )
            evt.stopPropagation()
          })
          .on('click', '.ladder-address', function (evt) {
            var $this = $(this),
              $level = $this.parents('.dd-list').prev(),
              levelText = $level.data('level'),
              addressText = $this.data('address')

            $('.address-input').val(addressText)

            if (that.$ladderTitle.text() !== levelText) {
              $level.trigger('click', true)
            } else {
              that.search(true)
            }
          })
          .on('click', 'button', function (evt) {
            that.search()
          })
          .nestable('collapseAll')

        // 幫他觸發第一個
        $('.ladder-level:first').trigger('click')
      },

      bindSearchEvent: function () {
        $('.address-search').on(
          'click',
          _.bind(function (evt) {
            this.search(true)
          }, this)
        )
      },

      trimLadderZero: function (val) {
        if (val.startsWith('P')) {
          var result = val.substring(1)
          while (result.startsWith('0')) {
            result = result.substring(1)
          }
          return 'P' + result
        } else {
          return val
        }
      },

      dotUnderlineSwitch: function (val) {
        if (val.indexOf('_') !== -1) {
          return val.replace('_', '.')
        } else {
          return val.replace('.', '_')
        }
      },

      hackBrowserCss: function () {
        if (!!window.chrome && !!window.chrome.webstore) {
          $('#content').append(
            '<link rel="stylesheet" type="text/css" href="./app/Ladder/css/browser_hack_chrome.css">'
          )
        } else if (typeof InstallTrigger !== 'undefined') {
          $('#content').append(
            '<link rel="stylesheet" type="text/css" href="./app/Ladder/css/browser_hack_firefox.css">'
          )
        }
      },

      search: function (isLocate) {
        $('.highlight-sign').remove()
        $('.highlight').removeClass('highlight')
        $('.include-address').text('')

        var address = $('.address-input').val().trim()
        if (address.length === 0) {
          return
        }

        var className = this.dotUnderlineSwitch(address)
        var totalHeight = document.querySelector('html').offsetHeight
        var screenHeight = window.innerHeight
        var docScrollTop = $(document).scrollTop()
        var $body = $(document.body)
        var $addressEle = $('.' + className)

        // 加 scroll bar 提示
        $addressEle
          .parent()
          .parent()
          .each(function (i, e) {
            $(e).addClass('highlight')

            var eleTop = e.getBoundingClientRect().top + docScrollTop
            var highlightSignTop = (screenHeight * eleTop) / totalHeight
            // console.log('.' + className, screenHeight, eleTop, totalHeight, highlightSignTop);
            $body.append(
              '<div class="highlight-sign" style="top:' +
                highlightSignTop +
                'px;"></div>'
            )
          })

        // 自動跳過去
        if (isLocate) {
          if ($addressEle.length) {
            $(document).scrollTop($addressEle.offset().top - 200)
          } else {
            $(document).scrollTop(0)
          }
        }

        _.each(this.addressTable[address], function (level) {
          $('.ladder-level[data-level="' + level + '"]')
            .find('.include-address')
            .text(' (' + address + ')')
        })
      },

      listenLadder: function () {
        var that = this

        servkit.subscribe('Storage', {
          machines: [that.machineId],
          handler: function (data) {
            var val = JSON.parse(data[that.machineId])

            if (that.nodesModel) {
              _.each(val.result.stringValues, function (e) {
                _.each(e.values, function (ee) {
                  _.each(ee.array, function (eee) {
                    var splitted = eee.split('|'),
                      address = splitted[0],
                      value = splitted[1]
                    that.nodesModel.updateGateStatus(address, value)
                  })
                })
              })
            }
          },
        })
      },

      NodesModel: (function () {
        function Model() {
          // key: 位址
          // value: div 陣列
          this.nodes = _.chain($('table').find('div'))
            .filter(function (e) {
              return e.getAttribute('class').indexOf('_') !== -1
            })
            .groupBy(function (e) {
              var className = e.getAttribute('class')
              return className.substring(0, className.length - 2)
            })
            .value()

          // key: 位址
          // value: box 吐回來的值
          this.gateStatus = {}
        }

        Model.prototype.refreshNodeView = function (address, value) {
          // 二進位並反轉順序
          var value2Radix = value.toString(2).split('').reverse().join('')

          _.each(this.nodes[address], function (e) {
            // 開或關
            var addressWithIndex = e.getAttribute('class')
            var determineBit = addressWithIndex.substring(
              addressWithIndex.length - 1
            )
            var onOff = value2Radix[determineBit] === '1' ? true : false
            //console.log (addressWithIndex + ': ' + value2Radix + ' - ' + onOff);

            // 換類別
            var classList = e.parentNode.parentNode.classList
            var offClassName = _.filter(classList, function (e) {
              return e !== 'highlight'
            })[0].substring(0, 2)
            if (onOff) {
              classList.add(offClassName + 'Bridge')
              classList.remove(offClassName)
            } else {
              classList.add(offClassName)
              classList.remove(offClassName + 'Bridge')
            }
          })
        }

        Model.prototype.updateGateStatus = function (address, gateValue) {
          gateValue = parseInt(gateValue)
          if (
            !this.gateStatus[address] ||
            this.gateStatus[address] !== gateValue
          ) {
            this.gateStatus[address] = gateValue
            this.refreshNodeView(address, gateValue)
          }
        }

        Model.prototype.getNode = function (address) {
          return this.nodes[address]
        }

        return Model
      })(),
    },

    delayCondition: ['machineList'],
    dependencies: [
      ['/js/plugin/jquery-nestable/jquery.nestable.min.js'],
      ['/js/plugin/bootstrap-progressbar/bootstrap-progressbar.min.js'],
    ],

    preCondition: {
      levelTree: function (done) {
        this.machineId = this.isGraced
          ? this.graceParam.machineId
          : servkit.getMachineList()[0]

        servkit.ajax(
          {
            url: 'api/ladder/routine/levels',
            type: 'GET',
            data: {
              machineId: this.machineId,
            },
          },
          {
            success: function (data) {
              done({ success: true, data: data })
            },
            fail: function (data) {
              done({ success: false, data: data })
            },
          }
        )
      },
    },
  })
}
