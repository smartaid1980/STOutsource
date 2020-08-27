package com.servtech.servcloud.app.controller.huangliang_matStock;

import com.servtech.servcloud.app.controller.util.PlatformConfig;
import com.servtech.servcloud.core.db.ActiveJdbc;
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

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Calendar;
import java.util.HashSet;
import java.util.Set;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Created by Frank on 10/1/2019.
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = ScheduleRecommendController.class)
@AutoConfigureMockMvc
@EnableWebMvc
public class ScheduleRecommendControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Before
    public void setUp() throws Exception {
        PlatformConfig.init();
    }

    static ScheduleRecommendController src = new ScheduleRecommendController();
    SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");

    @Test
    public void testRefresh() throws Exception {
        String input = "{\n" +
                "\"order_id\":\"111\",\n" +
                "\"wo_m_time\":\"2019-11-11 11:11:11\",\n" +
                "\"exp_mdate\":\"2019-10-29 12:00:00\",\n" +
                "\"exp_edate\":\"2019-11-11 13:00:00\",\n" +
                "\"machine_id\":\"_HULPLATFORM01D01M05\"\n" +
                "}";
        String input1 = "{\n" +
                "\"order_id\":\"O001\",\n" +
                "\"schedule_time\":\"2019-11-11 11:11:11\",\n" +
                "\"exp_mdate\":\"2240-11-05 12:00:00\",\n" +
                "\"exp_edate\":\"2240-11-05 13:00:00\",\n" +
                "\"machine_id\":\"_HULPLATFORM01D01M87\"\n" +
                "}";
        String input2 = "{\n" +
                "\"order_id\":\"O001\",\n" +
                "\"schedule_time\":\"2019-11-11 11:11:11\",\n" +
                "\"exp_mdate\":\"2240-11-05 12:00:00\",\n" +
                "\"exp_edate\":\"2241-09-01 09:00:00\",\n" +
                "\"machine_id\":\"_HULPLATFORM01D01M87\"\n" +
                "}";
        String input3 = "{\n" +
                "\"order_id\":\"O001\",\n" +
                "\"schedule_time\":\"2019-11-11 11:11:11\",\n" +
                "\"exp_mdate\":\"2241-09-01 09:00:00\",\n" +
                "\"exp_edate\":\"2241-09-01 12:00:00\",\n" +
                "\"machine_id\":\"_HULPLATFORM01D01M87\"\n" +
                "}";
        String input4 = "{\n" +
                "\"order_id\":\"O001\",\n" +
                "\"schedule_time\":\"2019-11-11 11:11:11\",\n" +
                "\"exp_mdate\":\"2241-09-01 12:00:00\",\n" +
                "\"exp_edate\":\"2241-09-02 16:00:00\",\n" +
                "\"machine_id\":\"_HULPLATFORM01D01M87\"\n" +
                "}";
        String input5 = "{\n" +
                "\"order_id\":\"O001\",\n" +
                "\"schedule_time\":\"2019-11-11 11:11:11\",\n" +
                "\"exp_mdate\":\"2241-09-03 08:00:00\",\n" +
                "\"exp_edate\":\"2241-09-04 08:00:00\",\n" +
                "\"machine_id\":\"_HULPLATFORM01D01M87\"\n" +
                "}";
        this.mockMvc
                .perform(
                        post("/huangliangMatStock/schedule/refresh")
                                .contentType(MediaType.APPLICATION_JSON_UTF8)
                                .content(input)
                                .session(PlatformConfig.getMockHttpSession())
                )
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    public void getstdhourTest() throws Exception {
        String input = "{\n" +
                "\"product_id\":\"21D040-00\",\n" +
                "\"machine_id\":\"_HULPLATFORM01D01M05\"\n" +
                "}";

        this.mockMvc
                .perform(
                        post("/huangliangMatStock/schedule/getstdhour")
                                .contentType(MediaType.APPLICATION_JSON_UTF8)
                                .content(input)
                                .session(PlatformConfig.getMockHttpSession())
                )
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    public void recommend() throws Exception {
        String input = "{\n" +
                "\"order_id\":\"test1\",\n" +
                "\"product_id\":\"2X010-0A\",\n" +
                "\"exp_date\":\"2019/10/22\",\n" +
                "\"order_qty\":3000,\n" +
                "\"pg_seq\":1,\n" +
                "\"machine_id\":\"_HULPLATFORM01D01M87\",\n" +
                "\"start_date\":\"2019/10/20\"\n" +
                "}";
//        String input = "{\n" +
//                "\"order_id\":\"GM190214001\",\n" +
//                "\"product_id\":\"2X010-0A\",\n" +
//                "\"exp_date\":\"20191010\",\n" +
//                "\"order_qty\":\"100\",\n" +
//                "\"pg_seq\":\"1\"\n" +
////                "\"machine_id\":\"m001\"\n" +
//                "}";
        this.mockMvc
                .perform(
                        post("/huangliangMatStock/schedule/recommend")
                                .contentType(MediaType.APPLICATION_JSON_UTF8)
                                .content(input)
                                .session(PlatformConfig.getMockHttpSession())
                )
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    public void getAvgOeeTest() {


        Set<String> set = new HashSet<>(Arrays.asList("G90320.002", "90320.002"));

        String[] orderIds = set.stream().toArray(String[]::new);
        System.out.println(src.getAvgOee(orderIds, "_HULPLATFORM01D01M19"));
        ;
    }

    @Test
    public void getQualityTest() {


        Set<String> set = new HashSet<>(Arrays.asList("GM190320002"));

        String[] orderIds = set.stream().toArray(String[]::new);

        System.out.println(ActiveJdbc.operTx(() -> {
            return src.getQuality(orderIds, "_HULPLATFORM01D01M85");
        }));
    }

    @Test
    public void getOrderPriorityTest() {
        System.out.println(ActiveJdbc.operTx(() -> {
            return src.getOrderPriority("MM190717002");
        }));
    }



    @Test
    public void convertOrderIds() {
        System.out.println(src.convertOrderIds(new String[]{"GM180810001", "MM180827004"})[0]);
        System.out.println(src.convertOrderIds(new String[]{"GM180810001", "MM180827004"})[1]);
    }

    @Test
    public void getWrapperStartTimeTest() throws ParseException {
        Calendar startTime = Calendar.getInstance();
        startTime.setTime(sdf.parse("2019/10/10 07:00:00"));
        // System.out.println(sdf.format(src.getWrapperStartTime(startTime)));

        startTime.setTime(sdf.parse("2019/10/10 12:00:00"));
        // System.out.println(sdf.format(src.getWrapperStartTime(startTime)));

        startTime.setTime(sdf.parse("2019/10/10 19:00:00"));
        // System.out.println(sdf.format(src.getWrapperStartTime(startTime)));
    }
}