package com.servtech.servcloud.module.service.app;

import org.springframework.web.multipart.MultipartFile;

import java.io.File;

/**
 * Created by Hubert
 * Datetime: 2015/10/1 上午 09:59
 */
public interface AppUploadService {
    /**
     *  上傳者，實做的時候可以將此 insert 進 DB 的 create_by
     *
     * @param uploader
     */
    void setUploader(String uploader);

    /**
     *  直接以實體檔案上傳
     *
     * @param file
     * @throws Exception
     */
    void upload(File file) throws Exception;

    /**
     *  透過 spring 的 MultipartFile 讓 API 可以直接調用
     *
     * @param file
     * @throws Exception
     */
    void upload(MultipartFile file) throws Exception;

    /**
     *  透過參數檔修改 app
     *
     * @param file
     * @throws Exception
     */
    void updateFunction(MultipartFile file) throws Exception;
}
