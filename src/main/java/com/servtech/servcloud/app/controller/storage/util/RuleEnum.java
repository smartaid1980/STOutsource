package com.servtech.servcloud.app.controller.storage.util;

public enum RuleEnum {

    ZONE("Z", 9),
    THING("T", 9),
    MATERIALTHING("%s", 4),
    STORE("S", 9),
    DOCUMENT("D", 9),
    SENDER("N", 9),
    STORE_POSITION("P", 9),
    EMPLOYEE("E", 9);

    private String prefix;
    private int len;

    RuleEnum(String prefix, int len) {
        this.prefix = prefix;
        this.len = len;
    }


    public static String getSeq(RuleEnum ruleEnum, int index) {
        RuleEnum val = null;
        for (RuleEnum value : RuleEnum.values()) {
            if (value == ruleEnum) {
                val = ruleEnum;
                break;
            }
        }
        return getSeq(val.prefix, val.len, index);
    }

    private static String getSeq(String prefix, int len, int index) {
        String seq = prefix + String.format("%0"+ len + "d", ++index);
        return seq;
    }
}
