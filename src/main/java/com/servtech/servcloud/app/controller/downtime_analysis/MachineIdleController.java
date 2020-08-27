package com.servtech.servcloud.app.controller.downtime_analysis;

import com.servtech.hippopotamus.Hippo;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.module.service.hippo.HippoService;
import com.servtech.servcloud.module.service.workshift.WorkShiftTimeService;
import com.servtech.servcloud.module.service.workshift.exception.WorkShiftTimeException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

import static org.springframework.web.bind.annotation.RequestMethod.GET;

/**
 * Created by Raynard on 2017/10/24.
 */
@RestController
@RequestMapping("downtimeanalysis/machineidle")
public class MachineIdleController {

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/getworkshiftrange", method = GET)
    public RequestResult<?> getWorkShiftRange(@RequestParam("startDate") String startDate,
                                              @RequestParam("endDate") String endDate) {

        Map<String, List<ShiftTime>> result = new HashMap<String, List<ShiftTime>>();
        Map<String, List<Map<String, Object>>> shiftTimes;
        try {
            shiftTimes = new WorkShiftTimeService(startDate, endDate).getIntervalWorkShiftTimes();
            for (Map.Entry<String, List<Map<String, Object>>> entry : shiftTimes.entrySet()) {
                List<ShiftTime> shiftTimeList = new ArrayList<ShiftTime>();
                List<Map<String, Object>> mapList = entry.getValue();
                for (Map<String, Object> shift : mapList) {
                    ShiftTime shiftTime = new ShiftTime(shift);
                    shiftTimeList.add(shiftTime);
                }
                result.put(entry.getKey(), shiftTimeList);
            }
        } catch (WorkShiftTimeException e) {
            e.printStackTrace();
        }
        return RequestResult.success(result);

    }


    static class ShiftTime {

        static final SimpleDateFormat SDF = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
        String name;
        String start;
        String end;
        Object is_open;
        long totalMillisecond;

        ShiftTime(Map<String, Object> shift) {
            this.name = shift.get("name").toString();
            this.start = shift.get("start").toString();
            this.end = shift.get("end").toString();
            this.is_open = shift.get("is_open");

            try {
                Date startDate = SDF.parse(start);
                Date endDate = SDF.parse(end);
                this.totalMillisecond = endDate.getTime() - startDate.getTime();
            } catch (ParseException e) {
                e.printStackTrace();
            }

        }








    }

}
