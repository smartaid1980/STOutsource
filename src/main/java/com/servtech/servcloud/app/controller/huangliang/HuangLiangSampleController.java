package com.servtech.servcloud.app.controller.huangliang;

import com.servtech.hippopotamus.Atom;
import com.servtech.hippopotamus.Hippo;
import com.servtech.hippopotamus.SimpleExhalable;
import com.servtech.hippopotamus.SimpleExhaler;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.module.service.hippo.HippoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

/**
 * Created by Jenny on 2016/7/28.
 */
@RestController
@RequestMapping("/huangliang/sample")
public class HuangLiangSampleController {
  private static final Logger log = LoggerFactory.getLogger(HuangLiangHubertForMobileController.class);

  @RequestMapping(value = "get", method = RequestMethod.GET)
  public RequestResult<?> getSampleList() {
    List<Sample> sampleList = new ArrayList<Sample>();
    try {
      sampleList.addAll(getSpecificSampleSpace("HUL_golf_sample"));
      sampleList.addAll(getSpecificSampleSpace("HUL_mrp_sample"));
    } catch (ExecutionException e) {
      return RequestResult.fail(e.getMessage());
    } catch (InterruptedException e) {
      return RequestResult.fail(e.getMessage());
    }
    return RequestResult.success(sampleList);
  }

  private List<Sample> getSpecificSampleSpace(String space) throws ExecutionException, InterruptedException {

    List<Sample> result = new ArrayList<Sample>();
    Hippo hippo = HippoService.getInstance();
    List<String> golfYearList = hippo.queryIndex(space);
    String[] monthArray = {"01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"};

    SimpleExhaler exhaler = hippo.newSimpleExhaler();
    Future<SimpleExhalable> future =
        exhaler.space(space)
            .index("year", golfYearList.toArray())
            .index("month", monthArray)
            .columns("sample_id", "sample_name")
            .exhale();

    SimpleExhalable exhalable = future.get();
    List<Map<String, Atom>> dataList = exhalable.toMapping();
    String n7 = "";
    if (space.equals("HUL_golf_sample")) {
      n7 = "G";
    } else if (space.equals("HUL_mrp_sample")) {
      n7 = "M";
    }
    for (Map<String, Atom> map : dataList) {
      String sample_id = map.get("sample_id").asString();
      try {
        //box will parse macro as float
        String serialNo = sample_id.substring(5, 8);
        String hippo_order_id = "";
        while(serialNo.endsWith("0")){
          serialNo = serialNo.substring(0, serialNo.length() - 1);
        }
        if (serialNo.length() != 0) {
          hippo_order_id = n7 + sample_id.substring(2, 5) + "." + serialNo;
        } else {
          hippo_order_id = n7 + sample_id.substring(2, 5);
        }
        Sample sample = new Sample(
                hippo_order_id,
            n7 + sample_id,
            map.get("sample_name").asString()
        );
        result.add(sample);
      } catch (NumberFormatException e) {
        log.warn("unable to parse as float: " + sample_id);
      }


    }

    return result;
  }

  public static class Sample {
    public String hippo_order_id;
    public String sample_id;
    public String sample_name;
    public String customer_id;

    public Sample(String hippo_order_id, String sample_id, String sample_name) {
      this.hippo_order_id = hippo_order_id;
      this.sample_id = sample_id;
      this.sample_name = sample_name;
      if (sample_id.split("-").length < 2) {
        System.out.println("sample [ " + sample_id + " ] has no '-' to get customer id");
        this.customer_id = "";
      } else {
        this.customer_id = sample_id.split("-")[1];
      }
    }

  }

}
