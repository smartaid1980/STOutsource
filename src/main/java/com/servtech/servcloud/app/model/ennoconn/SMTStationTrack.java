package com.servtech.servcloud.app.model.ennoconn;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

@Table("a_storage_smt_station_track")
@CompositePK({"track", "sub_track"})
public class SMTStationTrack extends Model {}
