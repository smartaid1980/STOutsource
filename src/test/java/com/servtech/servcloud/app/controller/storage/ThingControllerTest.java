// package com.servtech.servcloud.app.controller.storage;

// import com.servtech.servcloud.app.controller.util.PlatformConfig;
// import org.junit.Before;
// import org.junit.Test;
// import org.junit.runner.RunWith;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
// import org.springframework.boot.test.context.SpringBootTest;
// import org.springframework.test.context.junit4.SpringRunner;
// import org.springframework.test.web.servlet.MockMvc;
// import org.springframework.web.servlet.config.annotation.EnableWebMvc;

// import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
// import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
// import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// /**
//  * Created by Frank on 2019/5/8.
//  */
// @RunWith(SpringRunner.class)
// @SpringBootTest(classes = ThingController.class)
// @AutoConfigureMockMvc
// @EnableWebMvc
// public class ThingControllerTest {

//     @Autowired
//     private MockMvc mockMvc;

//     @Before
//     public void setUp() throws Exception {
//         PlatformConfig.init();
//     }

//     @Test
//     public void getThingById() throws Exception {
//         this.mockMvc.perform(get("/storage/thing/G11904190001")).andDo(print()).andExpect(status().isOk());
//     }
// }