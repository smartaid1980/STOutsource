//package com.servtech.servcloud.app.controller.servtrack;
//
//import com.servtech.servcloud.app.controller.util.PlatformConfig;
//import org.junit.Before;
//import org.junit.Test;
//import org.junit.runner.RunWith;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.http.MediaType;
//import org.springframework.test.context.junit4.SpringRunner;
//import org.springframework.test.web.servlet.MockMvc;
//import org.springframework.web.servlet.config.annotation.EnableWebMvc;
//
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
//import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
//
///**
// * Created by Frank on 2018/5/22.
// */
//@RunWith(SpringRunner.class)
//@SpringBootTest(classes = TabletDBUploadController.class)
//@AutoConfigureMockMvc
//@EnableWebMvc
//public class TabletDBUploadControllerTest {
//    @Autowired
//    private MockMvc mockMvc;
//
//    @Before
//    public void setUp() throws Exception {
//        PlatformConfig.init();
//    }
//
////分別在預期行為（expected behavior）與執行測試案例的狀態（state under test）前面加上Should…When或When…Then (or Expect)
//    @Test
//    public void When_UploadTabletDatas_Expect_Upate_Success() throws Exception {
//        String params = "[\n" +
//                "{\n" +
//                "  \"move_in\": \"2019-05-07 08:00:00\",\n" +
//                "  \"line_id\": \"lassy01\",\n" +
//                "  \"work_id\": \"TrackTest1\",\n" +
//                "  \"op\": \"1\",\n" +
//                "  \"shift_day\": \"2019-05-07\",\n" +
//                "  \"move_out\": \"2019-05-07 08:05:00\",\n" +
//                "  \"output\": \"100\",\n" +
//                "  \"ng_quantity_sum\": \"10\",\n" +
//                "  \"process_code\": \"SMT\",\n" +
//                "  \"tracking_ng\": [\n" +
//                "  {\n" +
//                "    \"ng_code\": \"SMT_ng01\",\n" +
//                "    \"ng_quantity\": \"5\"\n" +
//                "  },\n" +
//                "  {\n" +
//                "    \"ng_code\": \"SMT_ng02\",\n" +
//                "    \"ng_quantity\": \"5\"\n" +
//                "  }],\n" +
//                "  \"create_by\": \"frank\",\n" +
//                "  \"create_time\": \"2019-05-07 13:00:00\",\n" +
//                "  \"modify_by\": \"frank\",\n" +
//                "  \"modify_time\": \"2019-05-07 13:00:00\"\n" +
//                "}]";
//        this.mockMvc
//                .perform(
//                        put("/servtrack/tablet/upload")
//                                .contentType(MediaType.APPLICATION_JSON_UTF8)
//                                .content(params)
//                )
//                .andDo(print())
//                .andExpect(status().isOk());
//    }
//}