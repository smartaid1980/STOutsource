export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.ipCamMap = context.preCon.getIpCams
      _.each(context.ipCamMap, function (elem, index) {
        // auto login
        var url =
          elem.user_name && elem.password
            ? 'http://' + elem.user_name + ':' + elem.password + '@' + elem.ip
            : 'http://' + elem.ip
        var w = window.open(url, '_blank', 'height=10,width=10')
        setTimeout(function () {
          try {
            var $widget = context.widgetHtml(elem)
            if (index % 2 === 0) {
              context.$leftArticle.append($widget)
            } else {
              context.$rightArticle.append($widget)
            }

            $widget.find('#real').load(function (e) {
              $(this).removeClass('hide')
              $widget.find('#fake').remove()
            })

            $widget.on('click', '.widget-body', function (e) {
              e.preventDefault()
              if (!$('#jarviswidget-fullscreen-mode').length) {
                $(this).closest('.jarviswidget').find('i.fa-expand').click()
              }
            })

            w.close()
          } catch (e) {
            console.error(e)
          }
        }, 2500)
      })
      setTimeout(pageSetUp, 3000)
    },
    util: {
      $leftArticle: $('#left'),
      $rightArticle: $('#right'),
      widgetHtml: function (elem) {
        return $(`<div class="jarviswidget jarviswidget-color-darken" id="${elem.ip_cam_id}">
              <header>
                <span class="widget-icon"> <i class="fa fa-video-camera"></i> </span>
                <h2 class="ip-cam-id">${elem.ip_cam_id}</h2>
              </header>
              <div>
              <div class="widget-body no-padding" style="overflow: hidden;">
                <img height="100%" width="100%" id="real" class="hide" src="http://${elem.ip}"/>
                <img height="100%" width="100%" id="fake" src="${servkit.rootPath}/img/blackBackGround.png"/>
              </div>
            </div>
          </div>`)
      },
    },
    preCondition: {
      getIpCams: function (done) {
        servkit.ajax(
          {
            url: 'api/ipCam/read',
            type: 'GET',
            contentType: 'application/json',
          },
          {
            success: function (data) {
              done(
                _.chain(data)
                  .filter(function (elem) {
                    return elem.sequence < 5
                  })
                  .sortBy('sequence')
                  .value()
              )
            },
          }
        )
      },
    },
  })
}
