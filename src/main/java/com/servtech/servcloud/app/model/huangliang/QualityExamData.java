package com.servtech.servcloud.app.model.huangliang;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * 品質維護
 * Created by emma on 2016/8/23.
 */
@Table(value = "a_huangliang_quality_exam_data")
@CompositePK({ "date", "employee_id" , "work_shift_name", "machine_id", "order_id"})
public class QualityExamData extends Model {
}
