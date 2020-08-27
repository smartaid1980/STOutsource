package com.servtech.servcloud.app.model.huangliang;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Jenny on 2016/8/15.
 */
@Table(value = "a_huangliang_customer_priority")
@IdName(value = "customer_id")
public class CustomerPriority extends Model{
}
