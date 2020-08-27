package com.servtech.servcloud.app.controller.storage.util;

import org.apache.poi.xwpf.usermodel.XWPFDocument;

import javax.servlet.http.HttpServletResponse;

public interface QRCode {
    public QRCodeImpl genDoc(int total);
    public QRCodeImpl addImg(int index, String imgInfo);
    public QRCodeImpl addTexts(String... texts);
    public QRCodeImpl next();
    public XWPFDocument getDocument();
    public int getPageCount(int totalRecord);
    public void write(HttpServletResponse response);
    public void delete();
}
