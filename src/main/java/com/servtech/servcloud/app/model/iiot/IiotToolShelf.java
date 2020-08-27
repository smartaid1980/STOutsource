package com.servtech.servcloud.app.model.iiot;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Frank on 2017/6/16.
 */
@Table("a_iiot_tool_shelf")
@CompositePK({"Shelf_id", "Layer_id", "Position_id"})
public class IiotToolShelf extends Model {
}
