package com.servtech.servcloud.app.model.kuochuan_servtrack;

import com.servtech.servcloud.app.model.servtrack.Line;
import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Frank on 2017/7/30.
 */
@Table("a_kuochuan_servtrack_line")
@IdName("line_id")
@BelongsToParents({
        @BelongsTo(parent = Line.class, foreignKeyName = "line_id"),
})
public class KcLine extends Model {
}
