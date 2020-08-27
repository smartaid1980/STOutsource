package com.servtech.servcloud.app.model.storage;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

@Table("a_storage_piller_light_map")
@CompositePK({"map_id", "light_id"})
public class StorePillerLightMap extends Model {}
