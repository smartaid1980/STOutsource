export default function () {
  GoGoAppFun({
    gogo: function (context) {
      // 1. 取得所有 dashboard 資料，基本上後端提供一個 api 取得
      //  每個 app 底下有一個 dashboard
      //               |_ widgetId1
      //               |  |_ view.html
      //               |  |_ director.js
      //               |  |_ parameter.json
      //               |
      //               |_ widgetId2
      //                     .
      //                     .
      //                     .

      var plantMap = context.preCon.getPlantMachines
      var plantList = _.keys(plantMap)

      servkit.ajax(
        {
          url: 'api/dashboard/getAuthWidgetView',
          method: 'GET',
        },
        {
          success: function (datas) {
            // var execute = true

            // 轉成 WidgetView 物件

            var wlist = []
            _.each(datas, function (widgetViewObj) {
              var cloneCount = widgetViewObj.parameter.byPlant
                ? plantList.length
                : 1
              for (var i = 0; i < cloneCount; ++i) {
                const widgetView = new context.WidgetView(widgetViewObj, i)

                if (widgetViewObj.parameter.byPlant) {
                  widgetView.plantId = plantList[i]
                  widgetView.plantMachines = plantMap[plantList[i]]
                }

                // 補 commons
                widgetView.commons = context.commons[widgetView.parameter.appId]
                _.each(widgetView.commons, function (v, k) {
                  if (_.isFunction(v)) {
                    widgetView.commons[k] = function () {
                      return v.apply(widgetView, _.toArray(arguments))
                    }
                  }
                })

                wlist.push(widgetView)
              }
            })

            context.widgetViewList = _.filter(wlist, function (widgetView) {
              return (
                widgetView.parameter.disable === undefined ||
                !widgetView.parameter.disable
              )
            })

            // 各自會用到的 js library
            var dependencies = _.chain(context.widgetViewList)
              .reduce(function (memo, widgetView) {
                return memo.concat(widgetView.parameter.dependencies || [])
              }, [])
              .uniq()
              .value()
            servkit.requireJs(dependencies, function () {
              // HTML 內容
              var viewArray = _.map(context.widgetViewList, function (
                widgetView
              ) {
                return widgetView.getWidgetView(
                  context.preCon.getDashboardName[
                    widgetView.parameter.dashboardId
                  ]
                )
              })
              $('#widget-grid .row').html(viewArray.join('')).find('')
              pageSetUp()

              // context.startRotate();
              $('#rotate-start').on('click', function () {
                context.startRotate()
              })

              var shiftTimeInfo = context.preCon.getShiftList
              var shiftStatisticMap = {}
              var curShiftName = 'A'
              var executeCount = 0
              var machineList = servkit.getMachineList()

              // get data from mqtt pool
              // use empty map to store converted data
              var machineMap = {}
              var dashboardDirectors = window.dashboardDirectors
              // var done = function () {} // calling = false;

              // do every wediget
              _.each(context.widgetViewList, function (widgetView) {
                // only process devicestatus type
                if (widgetView.isDeviceStatus()) {
                  widgetView.shiftStatisticMap = shiftStatisticMap
                  widgetView.curShiftName = curShiftName
                  dashboardDirectors[widgetView.parameter.widgetId](
                    widgetView,
                    done,
                    machineMap
                  )
                } else {
                  var director =
                    dashboardDirectors[widgetView.parameter.widgetId]
                  var calling = false
                  var doing = function () {
                    calling = true
                  }
                  var done = function () {
                    calling = false
                  }
                  // var checkNotCalling = function () {
                  //   return !calling
                  // }
                  var timeoutMilliseconds = widgetView.refreshMilliseconds()
                  director.__timeoutId__ = setTimeout(function updateReport() {
                    doing()
                    try {
                      director(widgetView, done)
                    } catch (e) {
                      var time = moment().format('YYYY/MM/DD HH:mm:ss')
                      console.warn(
                        '[' +
                          time +
                          '] ' +
                          widgetView.parameter.widgetId +
                          ' - error'
                      )
                      console.warn(e)
                      // done();
                    } finally {
                      // because other app will have async query like utilization query hippo or db
                      // Direct call done() , maybe cause some unknonw bug in the future
                      // if too short-time
                      done()

                      // clean no used timeout id
                      if (director.__timeoutId__)
                        clearTimeout(director.__timeoutId__)
                      // do next timeout function
                      director.__timeoutId__ = setTimeout(
                        updateReport,
                        timeoutMilliseconds
                      )
                    }
                  }, 0)
                }
              })

              machineMap = null

              // for devicestatus type wediget
              // because subscribe will polling mqtt data
              // and wait until handler finish
              // no modeling and explicit clean it
              servkit.subscribe('DeviceStatus', {
                machines: context.preCon.boxIdList,
                handler: function (data) {
                  if (executeCount % 60 === 0) {
                    curShiftName = context.getCurrentShiftName(shiftTimeInfo)
                  }
                  if (executeCount % 180 === 0) {
                    var today = moment().format('YYYYMMDD')
                    context.updateShfitStatistic(
                      today,
                      machineList,
                      shiftStatisticMap
                    )
                    executeCount = 0
                  }

                  ++executeCount

                  // get data from mqtt pool
                  // use empty map to store converted data
                  var machineMap = {}
                  servkit.convertDeviceStatusPb2Map(data, machineMap)

                  var done = function () {} // calling = false;

                  // do every wediget
                  _.each(context.widgetViewList, function (widgetView) {
                    // only process devicestatus type
                    if (widgetView.isDeviceStatus()) {
                      widgetView.shiftStatisticMap = shiftStatisticMap
                      widgetView.curShiftName = curShiftName
                      dashboardDirectors[widgetView.parameter.widgetId](
                        widgetView,
                        done,
                        machineMap
                      )
                    }
                  })

                  // explicit clean map to avoid memory leak
                  servkit.cleanDeviceStatusMap(machineMap)
                  machineMap = null

                  // context.listenData = null;
                },
                dataModeling: false, // true
              })

              /*
             // 開始調用每一個 director
             _.each(context.widgetViewList, function (widgetView) {
             var calling = false,
             doing = function () { calling = true; },
             done = function () { calling = false; },
             checkNotCalling = function () { return !calling; },
             timeoutMilliseconds = widgetView.refreshMilliseconds(),
             director = dashboardDirectors[widgetView.parameter.widgetId];

             console.log("call director doing");

             director.__timeoutId__ =
             setTimeout(function doDirector() {
             doing();
             try {
             director(widgetView, done, context.listenData);
             } catch (e) {
             var time = moment().format('YYYY/MM/DD HH:mm:ss');
             console.warn('[' + time + '] ' + widgetView.parameter.widgetId + ' - error');
             console.warn(e);
             //done();
             }finally {
             // because other app will have async query like utilization query hippo or db
             // Direct call done() , maybe cause some unknonw bug in the future
             // if too short-time
             done();
             //director.__timeoutId__ = setTimeout(doDirector, timeoutMilliseconds);
             }

             servkit.politeCheck()
             .until(checkNotCalling)
             .thenDo(function () {
             if (execute) {
             director.__timeoutId__ = setTimeout(doDirector, timeoutMilliseconds);
             }
             })
             .tryDuration(0)
             .start();

             }, 0);

             }); */
            })
            // end of servkit.requireJs

            var keyupFunc = _.bind(context.shortcut, context)
            $(window).on('keyup', keyupFunc)
            $(window).on('hashchange', function hashChange() {
              // var execute = false

              _.chain(window.dashboardDirectors)
                .values()
                .each(function (director) {
                  clearTimeout(director.__timeoutId__)
                })

              $(window).off('keyup', keyupFunc).off('hashchange', hashChange)
            })
          },
        }
      )
      // end of servkit.ajax
    },
    util: {
      intervalId: 0,
      rotateFrequencyMillis: 10000,
      rotatePause: false,

      widgetViewList: undefined,
      currentWidgetIndex: 0,

      listenData: undefined,

      WidgetView: (function () {
        function Obj(widgetViewObj, index) {
          this.parameter = widgetViewObj.parameter
          this.view = widgetViewObj.view
          this._rotating_ = false
          this.jarvId = this.parameter.widgetId + '_' + index
        }

        Obj.prototype = {
          _jarvisIdPrefix_: 'wid-id-',
          getJarvisId: function () {
            return this._jarvisIdPrefix_ + this.jarvId
          },
          getWidgetView: function (dashboardName) {
            var titleHtml = this.parameter.title
            var h2String
            if (titleHtml.indexOf('</strong>') >= 0) {
              h2String = titleHtml.slice(
                titleHtml.indexOf('<strong>') + 8,
                titleHtml.indexOf('</strong>')
              )
            } else if (titleHtml.indexOf('</h2>') >= 0) {
              h2String = titleHtml.slice(
                titleHtml.indexOf('<h2>') + 8,
                titleHtml.indexOf('</h2>')
              )
            }
            var title = dashboardName
            if (dashboardName && dashboardName.indexOf('i18n_ServCloud') >= 0) {
              title = i18n(dashboardName.replace('i18n_ServCloud_', ''))
            }
            return (
              '<article class="' +
              this.parameter.gridClass +
              '">' +
              '<div class="jarviswidget" id="' +
              this.getJarvisId() +
              '" ' +
              'data-widget-colorbutton="false"' +
              'data-widget-editbutton="false"' +
              'data-widget-togglebutton="false"' +
              'data-widget-deletebutton="false"' +
              'data-widget-sortable="false">' +
              '<header>' +
              '<h2>' +
              (title ? titleHtml.replace(h2String, title) : titleHtml) +
              '</h2>' +
              '</header>' +
              '<div>' +
              '<div class="widget-body ' +
              (this.parameter.contentPadding ? '' : 'no-padding') +
              '">' +
              this.view +
              '</div>' +
              '</div>' +
              '</div>' +
              '</article>'
            )
          },
          asJquery: function () {
            if (!this._jqueryObj_) {
              this._jqueryObj_ = $('#' + this.getJarvisId())
            }
            return this._jqueryObj_
          },
          refreshMilliseconds: function () {
            if (this.isDeviceStatus()) {
              return 5000 // 5 秒
            } else {
              return 20000 // 15 分鐘
            }
          },
          _startRotate_: function () {
            this._rotating_ = true
            var $this = this.asJquery()
            var paddingStyle = this.parameter.contentPadding
              ? ''
              : ' style="padding:13px 13px 0;"'
            $this
              .find('.widget-body:first')
              .prepend(
                '<div class="rotate-fullscreen-header"' +
                  paddingStyle +
                  '>' +
                  $this.find('header:first').text().trim() +
                  '</div>'
              )
            try {
              window.dashboardDirectors[this.parameter.widgetId](
                this,
                function () {},
                {}
              )
            } catch (e) {
              var time = moment().format('YYYY/MM/DD HH:mm:ss')
              console.warn(
                '[' + time + '] ' + this.parameter.widgetId + ' - error'
              )
              console.warn(e)
            }
          },
          _stopRotate_: function (listenData) {
            this._rotating_ = false
            this.asJquery().find('.rotate-fullscreen-header').remove()
            try {
              window.dashboardDirectors[this.parameter.widgetId](
                this,
                function () {},
                listenData
              )
            } catch (e) {
              var time = moment().format('YYYY/MM/DD HH:mm:ss')
              console.warn(
                '[' + time + '] ' + this.parameter.widgetId + ' - error'
              )
              console.warn(e)
            }
          },
          isDeviceStatus: function () {
            return this.parameter.type === 'DeviceStatus'
          },
          isRotating: function () {
            return this._rotating_
          },
        }

        return Obj
      })(),

      startRotate: function () {
        if (this.widgetViewList.length > 0 && this.intervalId === 0) {
          this.browserFullScreen(true)

          // 右上角擋一個遮罩蓋住原本的 fullscreen
          $(document.body)
            .append(
              '<div id="fullscreen-mask"><i class="fa fa-times fa-lg"></i></div>' +
                '<div id="rotate-backward"><i class="fa fa-backward fa-lg"></i></div>' +
                '<div id="rotate-play"><i class="fa fa-pause fa-lg"></i></div>' +
                '<div id="rotate-forward"><i class="fa fa-forward fa-lg"></i></div>'
            )
            .find('#fullscreen-mask')
            .on('click', _.bind(this.stopRotate, this))

          // forward
          $('#rotate-forward').on(
            'click',
            _.bind(function () {
              this.rotateWidget(true)
            }, this)
          )

          // backward
          $('#rotate-backward').on(
            'click',
            _.bind(function () {
              this.rotateWidget(false)
            }, this)
          )

          // paly or pause
          $('#rotate-play').on(
            'click',
            _.bind(function () {
              var $rotatePlayEle = $('#rotate-play')
              if ($rotatePlayEle.find('.fa-pause').length) {
                $rotatePlayEle
                  .find('i')
                  .removeClass('fa-pause')
                  .addClass('fa-play')
                this.rotatePause = true
              } else {
                $rotatePlayEle
                  .find('i')
                  .removeClass('fa-play')
                  .addClass('fa-pause')
                this.rotatePause = false
              }
            }, this)
          )

          // progress bar
          this.createProgressBar()

          // 狀態設為開始
          _.each(
            this.widgetViewList,
            function (widgetView) {
              widgetView._startRotate_(this.listenData)
            },
            this
          )

          // 全螢幕
          this.triggerWidgetFullscreen()
          this.onBar(this.currentWidgetIndex)

          this.intervalId = setInterval(
            _.bind(function () {
              if (!this.rotatePause) {
                this.rotateWidget(true)
              }
            }, this),
            this.rotateFrequencyMillis
          )
        }
      },

      stopRotate: function () {
        if (this.intervalId !== 0) {
          this.browserFullScreen(false)

          $(
            '#fullscreen-mask, #rotate-backward, #rotate-play, #rotate-forward, #rotate-progress-bar'
          ).remove()

          _.each(
            this.widgetViewList,
            function (widgetView) {
              widgetView._stopRotate_(this.listenData)
            },
            this
          )

          clearInterval(this.intervalId)
          this.intervalId = 0

          // 縮回去
          this.triggerWidgetFullscreen()

          this.currentWidgetIndex = 0
        }
      },

      getCurrentShiftName: function (shiftArray) {
        var now = moment().format('HH:MM:SS')
        var shiftName = 'A'
        for (var i = 0; i < shiftArray.length; ++i) {
          var start = shiftArray[i].start.substring(11, 19)
          var end = shiftArray[i].end.substring(11, 19)
          console.info('time :' + start + '-' + end)
          if (start <= now && now <= end) {
            shiftName = shiftArray[i].name
            break
          } else {
            console.info('time : ' + now + ' not in ' + start + ' - ' + end)
          }
        }
        return shiftName
      },

      updateShfitStatistic: function (today, machineIds, shiftMap) {
        hippo
          .newSimpleExhaler()
          .space('shiftdata_for_monitor')
          .index('machine_id', machineIds)
          .indexRange('date', today, today)
          .columns(
            'machine_id',
            'date',
            'work_shift',
            'power_millisecond',
            'oper_millisecond',
            'cut_millisecond',
            'partcount'
          )
          .exhale(function (exhalable) {
            var list = exhalable.exhalable

            for (var i = 0; i < list.length; ++i) {
              var mid = list[i].machine_id
              if (!Object.prototype.hasOwnProperty.call(shiftMap, mid)) {
                shiftMap[mid] = {} // shiftData[mid] = {};
              }
              shiftMap[mid][list[i].work_shift] = list[i]
            }
          })
      },

      rotateWidget: function (next) {
        // 縮小
        this.triggerWidgetFullscreen()

        if (next) {
          this.incrementWidgetIndex()
        } else {
          this.decrementWidgetIndex()
        }

        // 放大
        this.triggerWidgetFullscreen()
      },

      incrementWidgetIndex: function () {
        this.currentWidgetIndex++

        if (this.currentWidgetIndex === this.widgetViewList.length) {
          this.offAllBar()
          this.currentWidgetIndex = 0
        }
        this.onBar(this.currentWidgetIndex)
      },

      decrementWidgetIndex: function () {
        this.offBar(this.currentWidgetIndex)
        this.currentWidgetIndex--

        if (this.currentWidgetIndex < 0) {
          this.onAllBar()
          this.currentWidgetIndex = this.widgetViewList.length - 1
        }
      },

      triggerWidgetFullscreen: function () {
        var $widgetEle = this.widgetViewList[this.currentWidgetIndex].asJquery()

        // 預設的 overflow 是 visible，強制 hidden 才不會有多餘的垃圾
        $widgetEle.find('div[role="content"]').css('overflow', 'hidden')

        $widgetEle.find('.jarviswidget-fullscreen-btn').trigger('click')
      },

      createProgressBar: function () {
        var barWidthPercent = 100 / this.widgetViewList.length

        var progressBarHtml =
          '<div id="rotate-progress-bar">' +
          _.map(this.widgetViewList, function (widgetView, i) {
            return (
              '<div class="rotate-bar rotate-bar-off"' +
              ' data-rotate-bar-index="' +
              i +
              '"' +
              ' style="width: ' +
              barWidthPercent +
              '%;"></div>'
            )
          }).join('') +
          '</div>'
        $(document.body).append(progressBarHtml)
      },

      onBar: function (index) {
        $(
          '#rotate-progress-bar .rotate-bar[data-rotate-bar-index="' +
            index +
            '"]'
        )
          .removeClass('rotate-bar-off')
          .addClass('rotate-bar-on')
      },

      onAllBar: function () {
        $('#rotate-progress-bar .rotate-bar')
          .removeClass('rotate-bar-off')
          .addClass('rotate-bar-on')
      },

      offBar: function (index) {
        $(
          '#rotate-progress-bar .rotate-bar[data-rotate-bar-index="' +
            index +
            '"]'
        )
          .removeClass('rotate-bar-on')
          .addClass('rotate-bar-off')
      },

      offAllBar: function () {
        $('#rotate-progress-bar .rotate-bar')
          .removeClass('rotate-bar-on')
          .addClass('rotate-bar-off')
      },

      shortcut: function (evt) {
        switch (evt.which) {
          case 27: // esc
            this.stopRotate()
            break
          case 13: // enter
            this.startRotate()
            break
          case 32: // space
            $('#rotate-play').trigger('click')
            break
          case 37: // left
            $('#rotate-backward').trigger('click')
            break
          case 39: // right
            $('#rotate-forward').trigger('click')
            break
        }
      },

      browserFullScreen: function (full) {
        if (
          !document.fullscreenElement &&
          !document.mozFullScreenElement &&
          !document.webkitFullscreenElement &&
          !document.msFullscreenElement
        ) {
          if (full) {
            if (document.documentElement.requestFullscreen) {
              document.documentElement.requestFullscreen()
            } else if (document.documentElement.msRequestFullscreen) {
              document.documentElement.msRequestFullscreen()
            } else if (document.documentElement.mozRequestFullScreen) {
              document.documentElement.mozRequestFullScreen()
            } else if (document.documentElement.webkitRequestFullscreen) {
              document.documentElement.webkitRequestFullscreen(
                Element.ALLOW_KEYBOARD_INPUT
              )
            }
          }
        } else {
          if (!full) {
            if (document.exitFullscreen) {
              document.exitFullscreen()
            } else if (document.msExitFullscreen) {
              document.msExitFullscreen()
            } else if (document.mozCancelFullScreen) {
              document.mozCancelFullScreen()
            } else if (document.webkitExitFullscreen) {
              document.webkitExitFullscreen()
            }
          }
        }
      },
    },
    delayCondition: ['machineList', 'machineLightList'],
    dependencies: ['/api/dashboard/getDirectorFunction'],
    preCondition: {
      getPlantMachines: function (done) {
        servkit.ajax(
          {
            url: 'api/plantarea/getMachinePlantArea',
            type: 'GET',
          },
          {
            success: function (data) {
              var plantMap = {}
              for (var i = 0; i < data.machines.length; ++i) {
                var pid = data.machines[i].plant_id

                if (!plantMap[pid]) plantMap[pid] = []
                plantMap[pid].push(data.machines[i].device_id)
              }
              done(plantMap)
            },
          }
        )
      },
      getShiftList: function (done) {
        servkit.ajax(
          {
            url: 'api/workshift/today',
            type: 'GET',
          },
          {
            success: function (data) {
              done(data)
            },
          }
        )
      },
      boxIdList: function (done) {
        servkit.ajax(
          {
            url: 'api/box/read',
            type: 'GET',
          },
          {
            success: function (datas) {
              done(
                _.map(datas, function (box) {
                  return box.box_id
                })
              )
            },
          }
        )
      },
      getDashboardName: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'm_sys_dashboard',
              columns: ['dashboard_id', 'dashboard_name'],
            }),
          },
          {
            success: function (data) {
              var dashboardMap = {}
              _.each(data, function (elem) {
                dashboardMap[elem.dashboard_id] = elem.dashboard_name
              })
              done(dashboardMap)
            },
          }
        )
      },
    },
  })
}
