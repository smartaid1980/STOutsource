package com.servtech.servcloud.app.model.aplus;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

@Table(value = "a_aplus_detection_rule")
@CompositePK({"alarm_id", "machine_id"})
public class AAplusDetectionRule extends Model {
}
