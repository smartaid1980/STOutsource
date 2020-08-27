package com.servtech.servcloud.app.controller.five_axis;

import java.io.*;
import java.util.*;

/**
 * Created by RDtest01 on 2015/9/22.
 */
public class FiveAxisGetGraph {

    public static ArrayList<String> getGraph(String outputPath){

        ArrayList<String> arr = new ArrayList<String>();
        String[] files = new File(outputPath+"\\jpg").list();

        for(String s:files){
            String id = s.split("\\.")[0];
            arr.add(id);
        }

        return arr;
    }

}
