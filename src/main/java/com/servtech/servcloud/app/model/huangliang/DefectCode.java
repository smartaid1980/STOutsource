package com.servtech.servcloud.app.model.huangliang;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Jenny on 2016/8/15.
 */
@Table(value = "a_huangliang_defect_code")
@IdName(value = "defect_code")
public class DefectCode extends Model{
}
