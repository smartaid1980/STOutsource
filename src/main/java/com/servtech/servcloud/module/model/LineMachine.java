package com.servtech.servcloud.module.model;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.*;

/**
 * Created by Admin on 2015/8/21.
 */

@Table("m_line_machine")
@CompositePK({"line_id","machine_seq","type_id", "op_seq"})
public class LineMachine extends Model {

    public String getPK() {
        return getString("line_id") + " , " + getString("type_id")+
                ","+getString("op_seq").toString()+"-"+getString("machine_seq").toString();
    }

   /* public static String deleteList(String[] idList) {
        StringBuilder sb = new StringBuilder();
        String split = "";
        for (String o : idList) {
            sb.append(split).append(o);
            split = ",";
        }
        return sb.toString();
    }*/
}
