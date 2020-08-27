<html>
  <%@ page contentType="text/html charset=UTF-8" %>
  <section id="widget-grid" class="">
    <div class="row">
      <!-- NEW WIDGET START -->
      <article class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
        <div class="jarviswidget jarviswidget-color-darken" id="wid-id-1" data-widget-editbutton="false" data-widget-colorbutton="false" data-widget-deletebutton="false" data-widget-fullscreenbutton="false">
          <header>
            <span class="widget-icon"> <i class="fa fa-cogs"></i> </span>
            <h2 class="font-md">Slave Edit</h2>
          </header>
          <div>
            <div class="widget-body">
              <h5 class="alert alert-info">編輯完成後，請點選更新按鈕才會儲存結果</h4>
              <button class="btn btn-success" id="sync-all" style="margin-bottom:10px"><span class="fa fa-refresh fa-lg"></span></button>
              <form id="servcore-config"></form>
            </div>
          </div>

        </div>
      </article>
    </div>
  </section>

  <script>
    <%@ page import="com.servtech.servcloud.core.util.SysPropKey" %>
    <%@ page import="com.google.gson.*,java.io.*,java.util.*" %>
    <%
      String strJson = request.getParameter("data");
      if (strJson != null) {
        try {
            Writer writer = new FileWriter(new File(System.getProperty(SysPropKey.CUST_PARAM_PATH), "serv_tank/slaves.json")); 
            writer.write(strJson);
            writer.flush();
            writer.close();
        } catch (IOException e) {
            e.printStackTrace();
        } 
      }
    %>
      var s = '<%=request.getParameter("data") %>';
      if (s != 'null') {
        var editUrl = window.location.href;
        var lastIndex = editUrl.lastIndexOf("?");
        var urlFilter = editUrl.substring(0, lastIndex);
        window.location.href = urlFilter;
      }
    <% 
      String cust_path = System.getProperty(SysPropKey.CUST_PARAM_PATH);
      File file = new File(cust_path, "serv_tank/slaves.json");
      String json = "";
      if (file.exists()) {
        try {
           List<Map<String, Object>> servCoreList = new Gson().fromJson(new FileReader(file), List.class);
           json = new Gson().toJson(servCoreList);
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }
      }
    %>
    var servCores = <%=json %>;
    var CoreView = (function () {
      function Obj(info) {
        this.id = info.id;
        this.ip = info.ip;
        this.port = info.port;

        this.$ele = $(this.getView());
        $('#servcore-config').append(this.$ele);

        this.$servcoreIdInput = this.$ele.find('input[name="servcore-id"]');
        this.$ipAddressInput = this.$ele.find('input[name="ip-address"]');
        this.$portInput = this.$ele.find('input[name="port"]');

        this.$editBtn = this.$ele.find('.edit-btn');
        this.$successBtn = this.$ele.find('.success-btn');
        this.bindEditEvent();
        this.bindSuccessEvent();


      }
      Obj.prototype.getView = function () {
        return '<fieldset>' +
          '    <div class="form-group">' +
          '        <div class="row">' +
          '            <div class="col-sm-12 col-md-4">' +
          '                <label class="control-label">ServCore ID</label>' +
          '                <input type="text" class="form-control" name="servcore-id" value="' + this.getId() + '" disabled />' +
          '            </div>' +
          '            <div class="col-sm-12 col-md-4">' +
          '                <label class="control-label">IP Address</label>' +
          '                <input type="text" class="form-control" name="ip-address" value="' + this.getIp() + '" disabled />' +
          '            </div>' +
          '            <div class="col-sm-12 col-md-2">' +
          '                <label class="control-label">Port</label>' +
          '                <input type="text" class="form-control" name="port" value="' + this.getPort() + '" disabled />' +
          '            </div>' +
          '            <div class="col-sm-12 col-md-2">' +
          '                <label class="control-label"></label>' +
          '                <div>' +
          '                    <button class="btn btn-primary edit-btn"><span class="fa fa-edit fa-lg"></span></button>' +
          '                    <button class="btn btn-success success-btn"><span class="fa fa-check-square-o fa-lg"></span></button>' +
          '                </div>' +
          '            </div>' +
          '        </div>' +
          '    </div>' +
          '</fieldset>';
      };
      Obj.prototype.getId = function () {
        return this.id || '';
      };
      Obj.prototype.getIp = function () {
        return this.ip || '';
      };
      Obj.prototype.getPort = function () {
        return this.port || '';
      };
      Obj.prototype.bindEditEvent = function () {
        var that = this;
        this.$editBtn.on('click', function (evt) {
          evt.preventDefault();
          that.$ipAddressInput.removeAttr("disabled");
          that.$portInput.removeAttr("disabled");
          that.$successBtn.removeAttr("disabled");
          $(this).attr("disabled", "disabled");
        });
      }
      Obj.prototype.bindSuccessEvent = function () {
        var that = this;
        this.$successBtn.on('click', function (evt) {
          evt.preventDefault();
          that.$ipAddressInput.attr("disabled", "disabled");
          that.$portInput.attr("disabled", "disabled");
          that.$editBtn.removeAttr("disabled");
          $(this).attr("disabled", "disabled");
          
        });
      }
      return Obj;
    })();
    if (!servCores) {
      $("#sync-all").attr("disabled", "disabled");
    } else {
      $("#sync-all").on('click', function (evt) {
        evt.preventDefault();
        var cores = _.map($("#servcore-config").find('fieldset'), function (dom) {
          var map = {};
          var id = $(dom).find('[name="servcore-id"]').eq(0).val();
          var ip = $(dom).find('[name="ip-address"]').eq(0).val();
          var port = $(dom).find('[name="port"]').eq(0).val();
          map.id = id;
          map.ip = ip;
          map.port = Number(port);
          return map;
        });
        window.location.href = window.location.href + "?data=" + escape(JSON.stringify(cores));
      });
    }

    var servcoreViews = _.map(servCores, function (info) {
      return new CoreView(info);
    });

    
 </script>
</html>