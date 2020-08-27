package com.servtech.servcloud.app.model.feedback;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

@Table("a_feedback_questions_file")
@IdName("file_id")
@BelongsTo(parent = Questions.class, foreignKeyName = "qu_id")
public class QuestionsFile extends Model {
    static {
        dateFormat("yyyy/MM/dd HH:mm:ss","upload_time");
    }
}
