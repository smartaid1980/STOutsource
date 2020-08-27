package com.servtech.servcloud.module.model;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

@Table("m_main_program")
@IdName("pg_name")
@CompositePK({"start_time","end_time","pg_name","machine_id","run_program"})
public class MainProgram extends Model {
}