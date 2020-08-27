package com.servtech.servcloud.app.controller.jumpway;

import com.servtech.servcloud.app.model.servtrack.Work;
import com.servtech.servcloud.app.model.servtrack.view.WorkOpView;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.RequestResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by Frank on 2018/10/15.
 */
@RestController
@RequestMapping("/jumpway/track")
public class JumpwayTrackController {

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;


    @RequestMapping(value = "/getInfo", method = RequestMethod.POST)
    public RequestResult<?> getInfo(@RequestBody final Map data) {
        final String workId = data.get("work_id").toString();
        final String op = data.get("op").toString();
        final String lineId = data.get("line_id").toString();
        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                try {
                    JumpwayWorkProcessController wpc = new JumpwayWorkProcessController();
                    List<Map> groupTracking = wpc.getGroupTracking(workId);

                    System.out.println("##groupTracking  " + groupTracking);
                    List<Map> workOpView = WorkOpView.find("work_id = ? AND op = ?", workId, op).toMaps();

                    Map<String, String> lineId2Name = wpc.getLineId2Name();
                    String lineName = lineId2Name.get(lineId);
                    String processName = workOpView.get(0).get("process_name").toString();
                    Integer goQuantity = 0;
                    Integer eQuantity = 0;
                    Integer responsibilityQuantity = 0;
                    boolean opTrackIsExist = false;
                    int firstIndex = 0;
                    if (groupTracking.size() > 0) {
                        for (int index = 0; index < groupTracking.size(); index++) {
                            Map data = groupTracking.get(index);

                            if (data.get("op").equals(op)) {
                                goQuantity = ((BigDecimal) data.get("go_quantity")).intValue();
                                eQuantity = (Integer) data.get("e_quantity");
                                if (index != firstIndex) {
                                    responsibilityQuantity = ((BigDecimal) groupTracking.get(index - 1).get("go_quantity")).intValue();
                                } else {
                                    responsibilityQuantity = (Integer) data.get("e_quantity");
                                }
                                opTrackIsExist = true;
                            }
                        }

                        if (!opTrackIsExist) {
                            Map data = groupTracking.get(groupTracking.size() - 1);
                            eQuantity = (Integer) data.get("e_quantity");
                            responsibilityQuantity = ((BigDecimal) data.get("go_quantity")).intValue();
                        }
                    } else {
                        List<Map> work = Work.find("work_id = ?", workId).toMaps();
                        eQuantity = (Integer) work.get(0).get("e_quantity");
                        responsibilityQuantity = eQuantity;
                    }

                    Map result = new HashMap();
                    result.put("work_id", workId);
                    result.put("op", op);
                    result.put("line_name", lineName);
                    result.put("go_quantity", goQuantity);
                    result.put("e_quantity", eQuantity);
                    result.put("responsibility_quantity", responsibilityQuantity);
                    result.put("process_name", processName);
                    return success(result);

                } catch (Exception e) {
                    e.printStackTrace();
                    StringWriter sw = new StringWriter();
                    e.printStackTrace(new PrintWriter(sw));
                    return fail(sw.toString());
                }


            }
        });
    }


}

