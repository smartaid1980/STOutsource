package com.servtech.servcloud.app.controller.sroom;

import com.google.gson.Gson;
import com.servtech.servcloud.app.controller.management.AxisEfficiencyByTHController;
import com.servtech.servcloud.core.util.RequestResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.*;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static com.servtech.servcloud.core.util.SysPropKey.DATA_PATH;
import static org.springframework.web.bind.annotation.RequestMethod.GET;
import static org.springframework.web.bind.annotation.RequestMethod.POST;

/**
 * Created by Jacokao on 2017/11/14.
 */
@RestController
@RequestMapping("/room")
public class SRoomController
{
    private final Logger logger = LoggerFactory.getLogger(AxisEfficiencyByTHController.class);

    private final Gson gson = new Gson();

    private static final String PATH_SEP = System.getProperty("file.separator");
    private static final String ROOM_LIST_FILE = System.getProperty(DATA_PATH) + PATH_SEP + "roomList.json";
    private static final String CTL_CONFIG_FILE = System.getProperty(DATA_PATH) + PATH_SEP + "controllConfig.json";


    private HashMap<String,HashMap<String,String>> readRoomList(){
        HashMap<String,HashMap<String,String>> rmap = new HashMap<String, HashMap<String, String>>();
        HashMap<String,HashMap<String,String>> temp = null;

        File file = new File(ROOM_LIST_FILE);
        if(file.exists())
        {
            String content = "";
            FileReader reader = null;
            try
            {
                reader = new FileReader(file);
                char[] chars = new char[(int) file.length()];
                reader.read(chars);
                content = new String(chars);
                reader.close();

                temp = (HashMap<String,HashMap<String,String>>)gson.fromJson(content,rmap.getClass());
            }
            catch (IOException e)
            {
                e.printStackTrace();
            }
            finally
            {
                try
                {
                    if (reader != null)
                    {
                        reader.close();
                    }
                }
                catch (IOException e)
                {
                    e.printStackTrace();
                }
            }

            if(temp != null) rmap = temp;

        }

        return rmap;
    }

    @RequestMapping(value = "/registerRoom", method = POST)
    public RequestResult<Map> registerRoom(@RequestBody final Map data) {


        HashMap<String,HashMap<String,String>> rmap = readRoomList();


        Map resultMap = new HashMap<String, String>();
        if(data.containsKey("name"))
        {
            String name = (String)data.get("name");
            if(!rmap.containsKey(name))
            {
                rmap.put(name,new HashMap<String, String>());
                rmap.get(name).put("name",name);
                if(data.containsKey("password"))
                {
                    rmap.get(name).put("password",((String)data.get("password")));

                }
                rmap.get(name).put("key", UUID.randomUUID().toString());
            }


            try
            {
                FileWriter fw = new FileWriter(ROOM_LIST_FILE);
                fw.write(gson.toJson(rmap,rmap.getClass()));
                fw.close();
                //System.out.println("Successfully Copied JSON Object to File...");
                //System.out.println("\nJSON Object: " + obj);
            }
            catch(IOException ex)
            {
                ex.printStackTrace();
            }


            resultMap.put("key",rmap.get(name).get("key"));
            return success(resultMap);
        }
        else
        {
            resultMap.put("Reason","Missing name");
            return fail(resultMap);
        }

    }

    @RequestMapping(value = "/getList", method = GET)
    public RequestResult<List<Map>> getList(){

        List<Map> roomList = new ArrayList<Map>();
        /*
        Map roomMap = new HashMap<String, String>();
        roomMap.put("name","TestRoom");
        roomMap.put("key","A0001");
        roomMap.put("need_pwd","N");
        roomList.add(roomMap);
        */

        HashMap<String,HashMap<String,String>> rmap = readRoomList();

        for(String key : rmap.keySet())
        {
            Map map = rmap.get(key);
            Map item = new HashMap<String,String>();

            item.put("name",map.get("name"));
            item.put("key",map.get("key"));
            if(map.containsKey("password"))
            {
                item.put("need_pwd","Y");
            }
            else
            {
                item.put("need_pwd","N");
            }

            roomList.add(item);
        }


        return success(roomList);
    }

    @RequestMapping(value = "/connectRoom", method = POST)
    public RequestResult<Map> connectRoom(@RequestBody final Map data)  {


        HashMap<String,HashMap<String,String>> rmap = readRoomList();




        Map resultMap = new HashMap<String, String>();

        if(data.containsKey("name"))
        {
            String pwd = "";

            String inputpwd = "";

            if(data.containsKey("password"))
            {
                inputpwd = data.get("password").toString();
            }

            String name = data.get("name").toString();
            String keyid = "";

            if(rmap.containsKey(name))
            {
                Map item = rmap.get(name);
                keyid = item.get("key").toString();

                if (item.containsKey("password"))
                {
                    pwd = item.get("password").toString();

                }


            }

            if(pwd.equals(inputpwd))
            {

                resultMap.put("key",keyid);
                return success(resultMap);
            }
            else
            {
                resultMap.put("reason","missing password or password incorrect!!");
            }

        }
        else
        {
            resultMap.put("reason","no name");
        }

        return fail(resultMap);

    }

    @RequestMapping(value = "/getConfig", method = GET)
    public RequestResult<List<Map>> getConfig()
    {
        /*
        List<Map> configList = new ArrayList<Map>();
        Map configMap = new HashMap<String, Object>();
        configMap.put("name","MONITOR");
        configMap.put("id","C01M01");
        configMap.put("tag","monitor");
        configMap.put("url","");

        List<Map> subList = new ArrayList<Map>();

        Map subConfigMap = new HashMap<String,Object>();

        subConfigMap.put("name","ZONE_MONITOR");
        subConfigMap.put("id","C01M01S01");
        subConfigMap.put("tag","monitor");
        subConfigMap.put("url","app/EquipMonitor/function/zh_tw/02_plant_area_monitor.html");

        subList.add(subConfigMap);

        configMap.put("subItems",subList);

        configList.add(configMap);

        return success(configList);*/

        List<Map> configMap = new ArrayList<Map>();//HashMap<String, Object>();

        String content = "";
        File file = new File(CTL_CONFIG_FILE);
        if (file.exists())
        {

            File f = new File(CTL_CONFIG_FILE);
            FileReader reader = null;
            try
            {
                reader = new FileReader(file);
                char[] chars = new char[(int) file.length()];
                reader.read(chars);
                content = new String(chars);
                reader.close();

                if(content.length() > 0)
                {
                    List<Map> tempMap = gson.fromJson(content,configMap.getClass());

                    if(tempMap != null) configMap = tempMap;
                }
            }
            catch (IOException e)
            {
                e.printStackTrace();
            }
            finally
            {
                try
                {
                    if (reader != null)
                    {
                        reader.close();
                    }
                }
                catch (IOException e)
                {
                    e.printStackTrace();
                }
            }
        }




        return success(configMap);
    }
}