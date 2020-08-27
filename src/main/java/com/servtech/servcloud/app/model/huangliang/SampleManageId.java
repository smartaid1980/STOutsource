package com.servtech.servcloud.app.model.huangliang;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

/**
 * 樣品管編補填
 * Created by emma on 2016/9/13.
 */
@Table(value = "a_huangliang_sample_fill_manage_id")
@IdName(value= "timestamp")
public class SampleManageId extends Model {
}
