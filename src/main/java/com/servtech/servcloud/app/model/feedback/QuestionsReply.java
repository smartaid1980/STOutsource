package com.servtech.servcloud.app.model.feedback;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

@Table("a_feedback_questions_reply")
@IdName("reply_id")
@BelongsTo(parent = Questions.class, foreignKeyName = "qu_id")
public class QuestionsReply extends Model {
    static {
        dateFormat("yyyy/MM/dd HH:mm:ss", "reply_time");
    }
}
