package com.servtech.servcloud.app.controller.huangliang_matStock.util;

import com.servtech.servcloud.app.model.huangliang_matStock.MatProfile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class WeightPieceConverter {
    private static final Logger log = LoggerFactory.getLogger(WeightPieceConverter.class);
    private String matId;
    private String shape;
    private double od = 0.0;
    public boolean isMetal = false;

    public WeightPieceConverter(String matCode) {
        String[] ary = matCode.split("-");
        if (ary.length > 2) {
            this.matId = ary[1];
        }
        if (ary.length > 3) {
            this.shape = ary[2];
            if (ary[3].contains("+")) { // 材料條碼 M-SCM430-P-10.1+0.1當作外徑 10.1
                String[] ods = ary[3].split("\\+");
                this.od = Double.parseDouble(ods[0]);
            } else if (ary[3].contains("±")) {
                String[] ods = ary[3].split("\\±");
                this.od = Double.parseDouble(ods[0]);
            } else {
                this.od = Double.parseDouble(ary[3]);
            }
        }

        if (MatProfile.findById(this.matId).getString("mat_att").equals("metal")) {
            isMetal = true;
        } else if (MatProfile.findById(this.matId).getString("mat_att").equals("plastic")) {
            isMetal = false;
        } else if (this.matId != null && this.shape != null && this.od != 0.0) {
            isMetal = true;
        }
    }

    public double unitWeight(double length) throws Exception {
        /*
        材料條碼範例: M-SUS303-C-06.0
        M+’-‘+材料編碼(10碼)(max)+’-’+形狀(1碼,不一定有)+’-’+外徑(6碼，整數(2碼)(max)+1碼小數點+3碼小數位數(max))。最多21碼，輸入多少顯示多少，不自動補0
        C/H/S先依換算規則計算該批材料暫上架支數，暫上架支數計算後需取整數，小數位無條件捨去
        C 換算公式=外徑(mm)*外徑(mm)*0.785*材料比重*長度(mm)=公斤0.00
        H 換算公式=外徑(mm)*外徑(mm)*0.866*材料比重*長度(mm)=公斤0.00
        S 換算公式=外徑(mm)*外徑(mm)*材料比重*長度(mm)=公斤0.00
         */
        double weight = 0.0;
        try {
            Double sg = 0.0;
            MatProfile matProfile = MatProfile.findById(matId);
            if (matProfile != null && matProfile.get("mat_sg") != null) {
                sg = matProfile.getDouble("mat_sg");
            } else {
                throw new Exception("Mat id : " + matId + " does not set mat_sg");
            }

            switch (shape) {
                case "C":
                    weight = Math.pow(od, 2) * 0.785 * sg * length;
                    break;
                case "H":
                    weight = Math.pow(od, 2) * 0.866 * sg * length;
                    break;
                case "S":
                    weight = Math.pow(od, 2) * length;
                    break;
                default:
                    throw new Exception("Shape is not one of C/H/S.");
            }
            return weight;
        } catch (Exception e) {
            e.printStackTrace();
            return weight;
        }
    }

    public int qtyToPiece(double qty, double length) {
        try {
            double uw = unitWeight(length);
            return (int) Math.floor(qty / uw);
        } catch (Exception e) {
            log.error(e.getMessage());
        }
        return 0;
    }

    public Double getSg() {
//        return ActiveJdbc.operTx(new Operation<Double>() {
//            @Override
//            public Double operate() {
        MatProfile matProfile = MatProfile.findById(matId);
        if (matProfile != null && matProfile.get("mat_sg") != null) {
            return matProfile.getDouble("mat_sg");
        } else {
            return null;
        }
//            }
//        });
    }

    public String getMatId() {
        return matId;
    }

    public String getShape() {
        return shape;
    }

    public double getOd() {
        return od;
    }

    public void setMatId(String matId) {
        this.matId = matId;
    }

    public void setShape(String shape) {
        this.shape = shape;
    }

    public void setOd(double od) {
        this.od = od;
    }
}
