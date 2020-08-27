package com.servtech.servcloud.app.controller.strongLED;

import com.servtech.servcloud.app.controller.util.PlatformConfig;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Created by Frank on 2019/5/10.
 */
@EnableWebMvc
@RunWith(SpringRunner.class)
@AutoConfigureMockMvc
@SpringBootTest(classes = StrongLEDServtrackTabletController.class)
public class StrongLEDServtrackTabletControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Before
    public void setUp() throws Exception {
        PlatformConfig.init();
    }

    @Test
    public void When_First_UploadTracking_Expect_Upload_Success() throws Exception {
        String move_in = "2019-06-24 14:00:07";
        String line_id = "lpkg02";
        String work_id = "WJ1906116";
        String op = "08";
        String shiftDay = "2019-06-24";
        String staff_id = "999";
        String output = "100";
        String process_code = "SMT";
        String ng_quantity_sum = "0";
        String createBy = "frank";
        String create_time = "2019-06-24 15:00:18";
        String modify_by = "frank";
        String modify_time = "2019-01-01 13:00:00";

        String params = "[\n" +
                "{\n" +
                "  \"move_in\": \"" + move_in + "\",\n" +
                "  \"line_id\": \"" + line_id + "\",\n" +
                "  \"work_id\": \"" + work_id + "\",\n" +
                "  \"op\": \"" + op + "\",\n" +
                "  \"shift_day\": \"" + shiftDay + "\",\n" +
                "  \"staff_id\": \"" + staff_id + "\",\n" +
                "  \"output\": \"" + output + "\",\n" +
                "  \"ng_quantity_sum\": \"" + ng_quantity_sum + "\",\n" +
                "  \"process_code\": \"" + process_code + "\",\n" +
                "  \"tracking_ng\": [],\n" +
                "  \"create_by\": \"" + createBy + "\",\n" +
                "  \"create_time\": \"" + create_time + "\",\n" +
                "  \"modify_by\": \"" + modify_by + "\",\n" +
                "  \"modify_time\": \"" + modify_time + "\"\n" +
                "}]";

        this.mockMvc
                .perform(
                        put("/strongled/servtrack/tablet/tracking/uploadWithArray")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(params)
                )
                .andDo(print())
                .andExpect(status().isOk());
    }
    @Test
    public void When_Second_UploadTracking_Expect_Upload_Success() throws Exception {
        String move_in = "2019-06-24 14:00:07";
        String line_id = "lpkg02";
        String work_id = "WJ1906116";
        String op = "08";
        String shiftDay = "2019-06-24";
        String moveOut = "2019-06-24 15:00:18";
        String output = "35";
        String ng_quantity_sum = "35";
        String process_code = "08";
        String createBy = "frank";
        String create_time = "2019-01-01 00:00:00";
        String modify_by = "frank";
        String modify_time = "2019-01-01 00:00:00";
        String staff_id = "999";

        String params = "[\n" +
                "{\n" +
                "  \"move_in\": \"" + move_in + "\",\n" +
                "  \"line_id\": \"" + line_id + "\",\n" +
                "  \"work_id\": \"" + work_id + "\",\n" +
                "  \"op\": \"" + op + "\",\n" +
                "  \"shift_day\": \"" + shiftDay + "\",\n" +
                "  \"move_out\": \"" + moveOut + "\",\n" +
                "  \"output\": \"" + output + "\",\n" +
                "  \"ng_quantity_sum\": \"" + ng_quantity_sum + "\",\n" +
                "  \"process_code\": \"" + process_code + "\",\n" +
                "  \"staff_id\": \"" + staff_id + "\",\n" +
                "  \"tracking_ng\": []," +
//                "  \"tracking_ng\": [\n" +
//                "  {\n" +
//                "    \"ng_code\": \"ASB_ng19\",\n" +
//                "    \"ng_quantity\": \"5\"\n" +
//                "  },\n" +
//                "  {\n" +
//                "    \"ng_code\": \"zz\",\n" +
//                "    \"ng_quantity\": \"6\"\n" +
//                "  }],\n" +
                "  \"create_by\": \"" + createBy + "\",\n" +
                "  \"create_time\": \"" + create_time + "\",\n" +
                "  \"modify_by\": \"" + modify_by + "\",\n" +
                "  \"modify_time\": \"" + modify_time + "\"\n" +
                "}]";

        this.mockMvc
                .perform(
                        put("/strongled/servtrack/tablet/tracking/uploadWithArray")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(params)
                )
                .andDo(print())
                .andExpect(status().isOk());
    }

    public static void main(String[] args) {
        String params = "[\n" +
                "{\n" +
                "  \"move_in\": \"2019-01-01 08:00:00\",\n" +
                "  \"line_id\": \"lassy01\",\n" +
                "  \"work_id\": \"TrackTest1\",\n" +
                "  \"op\": \"1\",\n" +
                "  \"line_status\": \"999\",\n" +
                "  \"line_status_start\": \"2019-01-01 08:05:00\",\n" +
//                "  \"line_status_end\": \"2019-01-01 08:10:00\",\n" +
                "  \"create_by\": \"frank\",\n" +
                "  \"create_time\": \"2019-01-01 8:00:00\",\n" +
                "  \"modify_by\": \"frank\",\n" +
                "  \"modify_time\": \"2019-01-01 8:00:00\"\n" +
                "}]";
        System.out.println(params);
    }
    @Test
    public void When_First_UploadLineMgrLog_Expect_Upload_Success() throws Exception {
        String params = "[\n" +
                "{\n" +
                "  \"move_in\": \"2019-01-01 08:00:00\",\n" +
                "  \"line_id\": \"lassy01\",\n" +
                "  \"work_id\": \"TrackTest1\",\n" +
                "  \"op\": \"1\",\n" +
                "  \"line_status\": \"999\",\n" +
                "  \"line_status_start\": \"2019-01-01 08:05:00\",\n" +
//                "  \"line_status_end\": \"2019-01-01 08:10:00\",\n" +
                "  \"invalid_id\": \"i001\",\n" +
                "  \"invalid_text\": \"測試無效代碼\",\n" +
                "  \"create_by\": \"frank\",\n" +
                "  \"create_time\": \"2019-01-01 8:00:00\",\n" +
                "  \"modify_by\": \"frank\",\n" +
                "  \"modify_time\": \"2019-01-01 8:00:00\"\n" +
                "}]";
        this.mockMvc
                .perform(
                        put("/strongled/servtrack/tablet/invalid-line-status-log/uploadWithArray")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(params)
                )
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    public void When_Second_UploadLineMgrLog_Expect_Upload_Success() throws Exception {
        String params = "[\n" +
                "{\n" +
                "  \"move_in\": \"2019-01-01 08:00:00\",\n" +
                "  \"line_id\": \"lassy01\",\n" +
                "  \"work_id\": \"20190619001\",\n" +
                "  \"op\": \"1\",\n" +
                "  \"line_status\": \"111\",\n" +
                "  \"line_status_start\": \"2019-01-01 08:06:00\",\n" +
                "  \"line_status_end\": \"2019-01-01 08:10:00\",\n" +
                "  \"invalid_id\": \"i002\",\n" +
                "  \"invalid_text\": \"測試無效代碼2\",\n" +
                "  \"shift_day\": \"2019-01-01\",\n" +
                "  \"staff_id\": \"999\",\n" +
                "  \"create_by\": \"frank\",\n" +
                "  \"create_time\": \"2019-01-01 8:00:00\",\n" +
                "  \"modify_by\": \"frank\",\n" +
                "  \"modify_time\": \"2019-01-01 8:00:00\"\n" +
                "}]";
        this.mockMvc
                .perform(
                        put("/strongled/servtrack/tablet/invalid-line-status-log/uploadWithArray")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(params)
                )
                .andDo(print())
                .andExpect(status().isOk());
    }
    @Test
    public void When_error_param_UploadLineMgrLog_Expect_Upload_Success() throws Exception {
        String params = "[\n" +
                "{\n" +
                "\"create_by\":\"test\",\n" +
                "\"create_time\":\"2019-05-10 12:58:20\",\n" +
                "\"line_id\":\"lassy01\",\n" +
                "\"line_status\":\"2\",\n" +
                "\"line_status_start\":\"2019-05-10 12:58:20\",\n" +
                "\"modify_by\":\"test\",\n" +
                "\"modify_time\":\"2019-05-10 12:58:20\",\n" +
                "\"move_in\":\"2019-05-10 12:58:15\",\n" +
                "\"op\":\"1\",\n" +
                "\"work_id\":\"2019041501\"\n" +
                "},\n" +
                "{\n" +
                "\"create_by\":\"test\",\n" +
                "\"create_time\":\"2019-05-10 12:58:20\",\n" +
                "\"line_id\":\"lassy01\",\n" +
                "\"line_status\":\"1\",\n" +
                "\"line_status_end\":\"2019-05-10 12:58:20\",\n" +
                "\"line_status_start\":\"2019-05-10 12:58:20\",\n" +
                "\"modify_by\":\"test\",\n" +
                "\"modify_time\":\"2019-05-10 12:58:20\",\n" +
                "\"move_in\":\"2019-05-10 12:58:15\",\n" +
                "\"op\":\"1\",\n" +
                "\"work_id\":\"2019041501\"\n" +
                "},\n" +
                "{\n" +
                "\"create_by\":\"test\",\n" +
                "\"create_time\":\"2019-05-10 12:58:25\",\n" +
                "\"line_id\":\"lassy01\",\n" +
                "\"line_status\":\"2\",\n" +
                "\"line_status_start\":\"2019-05-10 12:58:25\",\n" +
                "\"modify_by\":\"test\",\n" +
                "\"modify_time\":\"2019-05-10 12:58:25\",\n" +
                "\"move_in\":\"2019-05-10 12:58:15\",\n" +
                "\"op\":\"1\",\n" +
                "\"work_id\":\"2019041501\"\n" +
                "},\n" +
                "{\n" +
                "\"create_by\":\"test\",\n" +
                "\"create_time\":\"2019-05-10 12:58:20\",\n" +
                "\"line_id\":\"lassy01\",\n" +
                "\"line_status\":\"1\",\n" +
                "\"line_status_end\":\"2019-05-10 12:58:26\",\n" +
                "\"line_status_start\":\"2019-05-10 12:58:20\",\n" +
                "\"modify_by\":\"test\",\n" +
                "\"modify_time\":\"2019-05-10 12:58:29\",\n" +
                "\"move_in\":\"2019-05-10 12:58:15\",\n" +
                "\"op\":\"1\",\n" +
                "\"work_id\":\"2019041501\"\n" +
                "}\n" +
                "]";
        this.mockMvc
                .perform(
                        put("/strongled/servtrack/tablet/invalid-line-status-log/uploadWithArray")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(params)
                )
                .andDo(print())
                .andExpect(status().isOk());
    }
}