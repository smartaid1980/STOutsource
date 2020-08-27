package com.servtech.servcloud.app.controller.huangliang;

import com.google.common.collect.Lists;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.servtech.common.rawdata.ProgramComments;
import com.servtech.hippopotamus.Atom;
import com.servtech.hippopotamus.Hippo;
import com.servtech.hippopotamus.SimpleExhalable;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.mqtt.MQTTManager;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.module.model.Box;
import com.servtech.servcloud.module.service.hippo.HippoService;
import com.servtech.servcloud.module.service.workshift.WorkShiftTimeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.regex.Pattern;

import static java.lang.Integer.parseInt;

/**
 * Created by Hubert Datetime: 2016/8/18 下午 05:16
 */
@RestController
@RequestMapping("/huangliang/mobile")
public class HuangLiangHubertForMobileController {
  private static final Logger log = LoggerFactory.getLogger(HuangLiangHubertForMobileController.class);
  private static final Pattern orderPattern = Pattern.compile("\\d{5}\\.\\d{1,3}");

  @RequestMapping(value = "get", method = RequestMethod.GET)
  public RequestResult<Bean> get(@RequestParam(value = "machineId") String machineId) {
    Bean bean = new Bean();
    bean.machineId = machineId;

    String boxId = ActiveJdbc.oper(new Operation<String>() {
      @Override
      public String operate() {
        return (String) Box.findAll().collect("box_id").get(0);
      }
    });

    Map<String, List<String>> map = new HashMap<String, List<String>>();
    map.put("DeviceStatus", Lists.newArrayList(boxId));
    JsonObject jsonObject = new Gson().fromJson(MQTTManager.get(map).get("DeviceStatus").get(boxId).asJson(),
        JsonObject.class);
    for (JsonElement je : jsonObject.get("result").getAsJsonObject().get("stringValues").getAsJsonArray()) {

      // Macro 523
      if (je.getAsJsonObject().get("signal").getAsJsonObject().get("id").getAsString().equals("G_MRCO(523,523)")) {
        JsonArray ja = new Gson().fromJson(new Gson().fromJson(je.getAsJsonObject().get("values").getAsJsonArray()
            .get(0).getAsJsonObject().get("array").getAsJsonArray().get(0), String.class), JsonArray.class);
        for (JsonElement jee : ja) {
          if (jee.getAsJsonArray().get(0).getAsString().equals(machineId)) {
            bean.setMacro523(jee.getAsJsonArray().get(1).getAsString());
          }
        }
      }

      // 加工程式註解 N6
      if (je.getAsJsonObject().get("signal").getAsJsonObject().get("id").getAsString().equals("G_PGCM()")) {
        JsonArray ja = new Gson().fromJson(new Gson().fromJson(je.getAsJsonObject().get("values").getAsJsonArray()
            .get(0).getAsJsonObject().get("array").getAsJsonArray().get(0), String.class), JsonArray.class);
        for (JsonElement jee : ja) {
          if (jee.getAsJsonArray().get(0).getAsString().equals(machineId)) {
            ProgramComments programComments = new ProgramComments(jee.getAsJsonArray().get(1).getAsString(), 1, 6, 3);
            String n6 = programComments.get(6);
            try {
              bean.op = n6.split(" ")[0].substring(0, 1);
            } catch (Exception e) {
              // 不理他
            }
            try {
              bean.gOrM = n6.split(" ")[1];
            } catch (Exception e) {
              // 不理他
            }
          }
        }
      }
    }

    if (!orderPattern.matcher(bean.macro523).matches()) {
      return RequestResult.success(bean);
    }

    // actualAmountAndOpFromHulJiaQuality(bean, machineId, workShiftName, date);
    ohOhTheRealWayIsFromHulJiaQualityProductLa(bean);
    manageIdFromHulGolfProductOrHulMrpProduct(bean);

    if (!bean.op.equals("---")) {
      bean.op = bean.op + "次製程";
    }

    return RequestResult.success(bean);
  }

  private void actualAmountAndOpFromHulJiaQuality(Bean bean, String machineId, String workShiftName, String date) {
    Hippo hippo = HippoService.getInstance();
    // HUL_jia_quality 這個space 之後拿掉囉，不要再用喔!
    if (hippo.exists("HUL_jia_quality", machineId, workShiftName, date)) {
      try {
        SimpleExhalable exhalable = hippo.newSimpleExhaler().space("HUL_jia_quality")
            .index("machine_id", new String[] { machineId }).index("work_shift_name", new String[] { workShiftName })
            .indexRange("date", date, date).columns("order_id", "multi_process", "care_partcount").exhale().get();
        String op = null;
        int totalPartcount = 0;
        for (Map<String, Atom> map : exhalable.toMapping()) {
          String currOp = map.get("multi_process").asString();
          String orderId = map.get("order_id").asString();

          if (!orderId.equals(bean.macro523)) {
            continue;
          }

          if (op == null) {
            op = currOp;
            totalPartcount += map.get("care_partcount").asInt();
            continue;
          }

          if (!op.equals(currOp)) {
            op = currOp;
            totalPartcount = 0;
          }
          totalPartcount += map.get("care_partcount").asInt();
        }

        bean.op = op;
        bean.actualAmount = totalPartcount;

      } catch (InterruptedException e) {
        e.printStackTrace();
      } catch (ExecutionException e) {
        e.printStackTrace();
      } catch (Exception e) {
        e.printStackTrace();
      }

    }
  }

  private void ohOhTheRealWayIsFromHulJiaQualityProductLa(Bean bean) {
    Hippo hippo = HippoService.getInstance();

    String[] orderIdIndex = null;

    if (hippo.exists("HUL_jia_quality_product", "M" + bean.macro523)) {
      orderIdIndex = new String[] { "M" + bean.macro523 };
      bean.gOrM = "M";
    } else if (hippo.exists("HUL_jia_quality_product", "G" + bean.macro523)) {
      orderIdIndex = new String[] { "G" + bean.macro523 };
      bean.gOrM = "G";
    }

    if (orderIdIndex != null) {
      try {
        SimpleExhalable exhalable = hippo.newSimpleExhaler().space("HUL_jia_quality_product")
            .index("order_id", orderIdIndex).columns("multi_process", "care_partcount").exhale().get();
        int totalPartcount = 0;
        for (Map<String, Atom> map : exhalable.toMapping()) {
          String currOp = map.get("multi_process").asString();

          if (currOp.equals(bean.op)) {
            totalPartcount += map.get("care_partcount").asInt();
          }
        }

        bean.actualAmount = totalPartcount;

      } catch (InterruptedException e) {
        e.printStackTrace();
      } catch (ExecutionException e) {
        e.printStackTrace();
      } catch (Exception e) {
        e.printStackTrace();
      }
    }

  }

  private void manageIdFromHulGolfProductOrHulMrpProduct(Bean bean) {

    String year = bean.getFullYear();
    String month = bean.getMonth();
    String tunedOrderId = bean.getTunedOrderId();

    // orderId 格式化成他們要的樣子
    bean.orderId = bean.gOrM + tunedOrderId;

    Hippo hippo = HippoService.getInstance();
    String spaceName = null;

    if (bean.gOrM.equals("G")) {
      spaceName = "HUL_golf_product";
    } else if (bean.gOrM.equals("M")) {
      spaceName = "HUL_mrp_product";
    } else if (hippo.exists("HUL_golf_product", year, month, "G" + tunedOrderId)) {
      spaceName = "HUL_golf_product";
      bean.orderId = "G" + tunedOrderId;
    } else if (hippo.exists("HUL_golf_product", year, month, "M" + tunedOrderId)) {
      spaceName = "HUL_mrp_product";
      bean.orderId = "M" + tunedOrderId;
    } else {
      return;
    }

    try {
      SimpleExhalable exhalable = hippo.newSimpleExhaler().space(spaceName).index("year", new String[] { year })
          .index("month", new String[] { month }).index("order_id", new String[] { tunedOrderId })
          .columns("standard_id", "quantity").exhale().get();

      Map<String, Atom> map = exhalable.toMapping().get(0);
      bean.manageId = map.get("standard_id").asString();
      bean.expectAmount = map.get("quantity").asDouble();

    } catch (InterruptedException e) {
      e.printStackTrace();
    } catch (ExecutionException e) {
      e.printStackTrace();
    } catch (Exception e) {
      e.printStackTrace();
    }

  }

  public static class Bean {
    public String machineId = "---";
    public String orderId = "---";
    public String manageId = "---";
    public String op = "---";
    public double expectAmount = 0.0;
    public int actualAmount = 0;

    public String macro523 = "---";
    public String gOrM = "";

    public void setMacro523(String macro523) {
      if (!orderPattern.matcher(macro523).matches()) {
        this.macro523 = macro523;
        return;
      }

      int tailZeroCount = Math.max(9 - macro523.length(), 0);
      this.macro523 = macro523;
      while (tailZeroCount > 0) {
        this.macro523 += "0";
        tailZeroCount--;
      }
    }

    public String getFullYear() {
      Calendar c = Calendar.getInstance();
      int currentYear = c.get(Calendar.YEAR);

      if (macro523.equals("---")) {
        return String.valueOf(currentYear);
      }

      int year4Bit = Integer.parseInt(macro523.substring(0, 1));
      int yearPre3Bits = currentYear / 10;
      int yearFull = yearPre3Bits * 10 + year4Bit;

      if (yearFull > currentYear) {
        yearPre3Bits -= 1;
        return String.valueOf(yearPre3Bits * 10 + year4Bit);
      }

      return String.valueOf(yearFull);
    }

    public String getMonth() {
      return this.macro523.substring(1, 3);
    }

    public String getDay() {
      return this.macro523.substring(3, 5);
    }

    public String getSequence() {
      return this.macro523.substring(6);
    }

    public String getTunedOrderId() {
      return "M" + getFullYear().substring(2) + getMonth() + getDay() + getSequence();
    }
  }

}
