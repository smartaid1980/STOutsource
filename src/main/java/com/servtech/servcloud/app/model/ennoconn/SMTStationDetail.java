package com.servtech.servcloud.app.model.ennoconn;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

@Table("a_storage_smt_station_detail")
@CompositePK({"smt_stn_id", "material_id","machine","track","sub_track"})
public class SMTStationDetail extends Model {}
