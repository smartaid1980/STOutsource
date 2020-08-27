// package com.servtech.servcloud.app.controller.strongLED;

// import com.servtech.servcloud.app.controller.util.PlatformConfig;
// import org.junit.Before;
// import org.junit.Test;
// import org.junit.runner.RunWith;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
// import org.springframework.boot.test.context.SpringBootTest;
// import org.springframework.http.MediaType;
// import org.springframework.test.context.junit4.SpringRunner;
// import org.springframework.test.web.servlet.MockMvc;
// import org.springframework.web.servlet.config.annotation.EnableWebMvc;

// import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
// import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
// import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
// import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
// import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// @EnableWebMvc
// @RunWith(SpringRunner.class)
// @AutoConfigureMockMvc
// @SpringBootTest(classes = StrongLEDDemandListController.class)
// public class StrongledProjectControllerTest {

//     @Autowired
//     private MockMvc mockMvc;

//     @Before
//     public void setUp() throws Exception {
//         PlatformConfig.init();
//     }

//     @Test
//     public void create() throws Exception{
//         String mapStr = "{\"project_id\":\"ProjectId\"," +
//                             "\"user_id\":\"UserId\"," +
//                             "\"project_name\":\"ProjectName\"," +
//                             "\"cus_id\":\"CusId\"}";

//         this.mockMvc
//                 .perform(
//                     post("/strongled/project")
//                         .contentType(MediaType.APPLICATION_JSON)
//                         .content(mapStr)
//                  )
//                 .andDo(print())
//                 .andExpect(status().isOk());
//     }

//     @Test
//     public void deleteWithArray() throws Exception{
//         String deleteArr = "[\"ProjectId\",\"ProjectId1\"]";
//         this.mockMvc
//                 .perform(
//                         delete("/strongled/project/deleteWithArray")
//                             .contentType(MediaType.APPLICATION_JSON)
//                             .content(deleteArr)
//                 )
//                 .andDo(print())
//                 .andExpect(status().isOk());
//     }
//     @Test
//     public void getProjectById() {
//         String user_id="fred_test_id";
//         String api="/strongled/project/"+user_id;
//         //System.out.println(api);
//         try {
//             this.mockMvc.perform(get(api)).andDo(print());
//         } catch (Exception e) {
//             e.printStackTrace();
//         }
//     }

//    @Test
//    public void updateProjectTest(){
//        String params="{\n" +
//                " \"project_id\":   \"fred_test2_id\",\n"+
//                " \"project_name\" : \"fred_test2_name\",\n"+
//                " \"cus_id\" : \" fred2_cus\" \n"+
//                "}";
//        //System.out.println(params);
//    }
// }