package com.servtech.servcloud.app.model.feedback;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

@Table("a_feedback_questions_download_log")
@CompositePK({"file_id", "download_time"})
@BelongsTo(parent = Questions.class, foreignKeyName = "file_id")
public class QuestionsDownloadLog extends Model {
    static {
        dateFormat("yyyy/MM/dd HH:mm:ss","download_time");
    }
}
