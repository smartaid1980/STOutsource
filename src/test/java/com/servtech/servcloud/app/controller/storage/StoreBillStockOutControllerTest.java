package com.servtech.servcloud.app.controller.storage;

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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Created by Frank on 2019/8/23.
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = StoreBillStockOutController.class)
@AutoConfigureMockMvc
@EnableWebMvc
public class StoreBillStockOutControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Before
    public void setUp() throws Exception {
        PlatformConfig.init();
    }

    //model = tablet
    //userId =xxx
    //billNo = empty
    //領料單主檔所屬平板名稱=userId全員解鎖
    @Test
    public void checkTabletAllBillUnlock() throws Exception {
        String input = "{\n" +
                "\n" +
                "  \"user_id\": \"test\",\n" +
                "  \"bill_no\": null,\n" +
                "  \"model\": \"tablet\"\n" +
                "}";
        this.mockMvc
                .perform(
                        post("/storage/billstockout/check-lock")
                                .contentType(MediaType.APPLICATION_JSON_UTF8)
                                .content(input)
                                .session(PlatformConfig.getMockHttpSession())
                )
                .andDo(print())
                .andExpect(status().isOk());
    }

    //model = tablet
    //userId = xxx
    //bilNo = xxx
    //確認領料單主檔狀態
    // status=2 回fail("有人在使用")
    // status=0更新狀態鎖定(=2)與鎖定名稱
    @Test
    public void checkBillLockStatus() throws Exception {
        String input = "{\n" +
                "\n" +
                "  \"user_id\": \"test\",\n" +
                "  \"bill_no\": \"WHL19070959\",\n" +
                "  \"model\": \"tablet\"\n" +
                "}";
        this.mockMvc
                .perform(
                        post("/storage/billstockout/check-lock")
                                .contentType(MediaType.APPLICATION_JSON_UTF8)
                                .content(input)
                                .session(PlatformConfig.getMockHttpSession())
                )
                .andDo(print())
                .andExpect(status().isOk());
    }

    //model = web
    //bilNo = xxx
    //針對特定領料單直接解鎖
    // status=0 並更新狀態鎖定(=0)與鎖定名稱=null
    @Test
    public void unlockWebBill() throws Exception {
        String input = "{\n" +
                "\n" +
                "  \"user_id\": \"test\",\n" +
                "  \"bill_no\": \"WHL19070959\",\n" +
                "  \"model\": \"web\"\n" +
                "}";
        this.mockMvc
                .perform(
                        post("/storage/billstockout/check-lock")
                                .contentType(MediaType.APPLICATION_JSON_UTF8)
                                .content(input)
                                .session(PlatformConfig.getMockHttpSession())
                )
                .andDo(print())
                .andExpect(status().isOk());
    }
}
