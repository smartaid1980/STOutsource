package com.servtech.servcloud.app.model.chengshiu;

import com.google.gson.Gson;
import com.servtech.servcloud.core.util.SysPropKey;
import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

import java.io.*;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * Created by Raynard on 2017/10/31.
 */
@Table("a_chengshiu_demand_order")
@IdName("demand_id")
@BelongsTo(parent = Product.class, foreignKeyName = "product_id")
public class DemandOrder extends Model{

}
