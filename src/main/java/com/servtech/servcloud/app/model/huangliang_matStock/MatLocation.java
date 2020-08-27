package com.servtech.servcloud.app.model.huangliang_matStock;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Eric Peng on 2018/10/29.
 */
@Table("a_huangliang_mat_location")
@IdName("location")
@BelongsTo(parent = MatProfile.class, foreignKeyName = "mat_id")
public class MatLocation extends Model {
}
