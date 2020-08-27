package com.servtech.servcloud.app.model.comoss;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by MikeWu on 2020/04/09
 */
@Table("a_comoss_material_position")
@CompositePK({"store_id", "grid_index", "cell_index", "material_id"})
public class ComossMaterialPosition extends Model {
}
