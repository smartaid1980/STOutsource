package com.servtech.servcloud.module.model;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

import java.util.Comparator;

/**
 * Created by Vera on 2015/8/17.
 */

@Table("m_line_type")
@CompositePK({"type_id", "op_seq"})
public class LineType extends Model{

    public static opSeqComparator opSeqComparator = new opSeqComparator();

    public String getPK(){
        return getString("type_id")+" # "+getInteger("op_seq");
    }
}

class opSeqComparator implements Comparator<LineType> {
    public int compare(LineType o1, LineType o2) {
        return o1.get("op_seq").toString().compareTo(o2.get("op_seq").toString());
    }
}

