package com.servtech.servcloud.app.controller.storage.util;

import com.servtech.servcloud.core.util.SysPropKey;

public class XLQRCode extends QRCodeImpl{
    private static final String FORM_ROOT_PATH = System.getProperty(SysPropKey.ROOT_PATH) + "/app/ServTrackManagement/program/XLQRCode";
    private static final String FORM_TEMPLATE = FORM_ROOT_PATH + "/form.docx";
    private static final int DOCUMENT_IMG_SIZE = 12;

    private static final int CELL_TEXT_FONT_SMALL_SIZE = 8;
    private static final int CELL_TEXT_FONT_BIG_SIZE = 20;

    private static final int MAX_ROW_NUMBER = 5;
    private static final int MAX_CELL_NUMBER = 3;
    public double QRCODE_EMU = 126;

    public XLQRCode(){
        super();
        super.FORM_ROOT_PATH = FORM_ROOT_PATH;
        super.FORM_TEMPLATE = FORM_TEMPLATE;
        super.DOCUMENT_IMG_SIZE = DOCUMENT_IMG_SIZE;
        super.CELL_TEXT_FONT_SMALL_SIZE = CELL_TEXT_FONT_SMALL_SIZE;
        super.CELL_TEXT_FONT_BIG_SIZE = CELL_TEXT_FONT_BIG_SIZE;
        super.MAX_ROW_NUMBER = MAX_ROW_NUMBER;
        super.MAX_CELL_NUMBER = MAX_CELL_NUMBER;
        super.QRCODE_EMU = QRCODE_EMU;
    }
}
