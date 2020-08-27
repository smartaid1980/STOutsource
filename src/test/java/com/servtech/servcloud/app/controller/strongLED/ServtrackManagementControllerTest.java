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
 * Created by Frank on 2019/8/27.
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = ServtrackManagementController.class)
@AutoConfigureMockMvc
@EnableWebMvc
public class ServtrackManagementControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Before
    public void setUp() throws Exception {
        PlatformConfig.init();
    }

    @Test
    public void updateOutputQuantity() throws Exception {
        String input = "{\"aval\":0,\"cust_field_1\":\"-1\",\"cust_field_2\":\"13\",\"cust_field_3\":\"10\",\"cust_field_4\":\"20\",\"cust_field_5\":\"-1\",\"duration_variance\":-2.9,\"go_quantity\":120,\"line_id\":\"lassy01\",\"move_in\":\"2019-08-01 07:56:49\",\"move_out\":\"2019-08-01 08:59:43\",\"ng_quantity\":10,\"oee\":0,\"op\":\"04\",\"op_duration\":62.9,\"output\":\"130\",\"output_sp\":125,\"output_variance\":-5,\"perf\":103.34,\"pks\":{\"cust_field_3\":\"0\",\"work_id\":\"WJ1907228\",\"op\":\"04\",\"cust_field_4\":\"0\",\"cust_field_1\":\"-1\",\"cust_field_2\":\"13\",\"cust_field_5\":\"-1\",\"move_in\":\"Aug 1, 2019 7:56:49 AM\",\"line_id\":\"lassy01\"},\"quality\":92.31,\"shift_day\":\"2019-08-01\",\"work_id\":\"WJ1907228\",\"tableModel\":\"com.servtech.servcloud.app.model.servtrack.WorkTracking\"}";
        this.mockMvc
                .perform(
                        put("/strongled/track-management/output-qty")
                                .contentType(MediaType.APPLICATION_JSON_UTF8)
                                .content(input)
                        .session(PlatformConfig.getMockHttpSession())
                )
                .andDo(print())
                .andExpect(status().isOk());
    }
}