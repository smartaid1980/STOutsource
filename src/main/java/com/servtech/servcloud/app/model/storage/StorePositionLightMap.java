package com.servtech.servcloud.app.model.storage;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

@Table("a_storage_position_light_map")
@CompositePK({"position_id", "light_index"})
public class StorePositionLightMap extends Model {}
