package com.servtech.servcloud.app.controller.aplus;

import com.servtech.servcloud.core.util.RequestResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.springframework.web.bind.annotation.RequestMethod.POST;

/**
 * Created by Kevin Big Big on 2018/3/14.
 */

@RestController
@RequestMapping("/aplus/spc")
public class SpcController {
    private static final Logger log = LoggerFactory.getLogger(SpcController.class);

    @Autowired
    private HttpServletRequest request;

    @RequestMapping(value ="/cusum", method = POST)
    public RequestResult<Map> cusum(@RequestBody final Map data) {
        List<Double> xis = (List<Double>) data.get("xis");
        Double[] rawdatas = xis.toArray(new Double[xis.size()]);
        double target = (Double) data.get("target");
        double h = (Double) data.get("h");
        double k = (Double) data.get("k");
        return RequestResult.success(new CUSUM(rawdatas, target, h, k).toMap());
    }

    @RequestMapping(value ="/ewma", method = POST)
    public RequestResult<Map> ewma(@RequestBody final Map data) {
        List<Double> xis = (List<Double>) data.get("xis");
        Double[] rawdatas = xis.toArray(new Double[xis.size()]);
        double target = (Double) data.get("target");
        double w = (Double) data.get("w");
        return RequestResult.success(new EWMA(rawdatas, w, target).toMap());
    }

    public class CUSUM {
        private static final String CSV_SPLIT = ",";
        private static final String NEW_LINE = "\r\n";
        private static final double D2 = 1.128; //係數d2(樣本大小為2時)

        private Double[] rawdatas;

        private double target;// = 0.1;
        private double h;// = 4;
        private double k;// = 0.50;

        private double standardDeviation;//標準差
        private double UCL;
        private double LCL;
        private double[] upperDatas;
        private double[] lowDatas;


        public CUSUM(Double[] rawdatas, double target, double h, double k){
            this.rawdatas = rawdatas;
            this.target = target;
            this.h = h;
            this.k = k;

            this.upperDatas = new double[rawdatas.length];
            this.lowDatas = new double[rawdatas.length];
            calcStandardDeviation();

            //System.out.println("SD: " + this.standardDeviation);
            calcUCL();
            calcLCL();
            calcUpperAndLow();
        }

        public Map toMap(){
            Map map = new HashMap();
            map.put("Si", this.upperDatas);
            map.put("Ti", this.lowDatas);
            map.put("LCL", this.LCL);
            map.put("UCL", this.UCL);

            map.put("Target", this.target);
            map.put("Sigma(X)", this.standardDeviation);
            map.put("h", this.h);
            map.put("k", this.k);

            return map;
        }

        public String toCsv(){
            StringBuilder sb = new StringBuilder();
            sb.append("Si").append(CSV_SPLIT).append("Ti").append(CSV_SPLIT).append("LCL").append(CSV_SPLIT).append("UCL").append(NEW_LINE);
            for(int index=0; index<this.rawdatas.length; index++){
                sb.append(toFormat(this.upperDatas[index])).append(CSV_SPLIT)
                        .append(toFormat(this.lowDatas[index])).append(CSV_SPLIT)
                        .append(toFormat(this.LCL)).append(CSV_SPLIT)
                        .append(toFormat(this.UCL)).append(NEW_LINE);
            }
            return sb.toString();
        }

        public String toInfo(){
            StringBuilder sb = new StringBuilder();
            sb.append("Target: ").append(this.target).append(NEW_LINE)
                    .append("Sigma(X): ").append(this.standardDeviation).append(NEW_LINE)
                    .append("h: ").append(this.h).append(NEW_LINE)
                    .append("k: ").append(this.k).append(NEW_LINE)
                    .append("UCL: ").append(this.UCL).append(NEW_LINE)
                    .append("LCL: ").append(this.LCL);
            return sb.toString();
        }

        private void calcUpperAndLow(){
            //CUSUM algorithm performed on residuals
            for(int index=0; index<this.rawdatas.length; index++){
                double x = this.rawdatas[index];
                if(index == 0){
                    this.upperDatas[index] = 0;
                    this.lowDatas[index] = 0;
                    continue;
                }
                this.upperDatas[index] = Math.max( 0, upperDatas[index - 1] + (x - this.target) - this.k * this.standardDeviation);
                this.lowDatas[index] = Math.min(0, lowDatas[index - 1] + (x - this.target) + k * this.standardDeviation);
            }
        }

        //http://slideplayer.com/slide/3878334/的page32
        private void calcStandardDeviation(){
            double sum = 0d;

            for(int index=1; index<this.rawdatas.length; index++){
                sum += Math.abs(this.rawdatas[index] - this.rawdatas[index - 1]);
            }
            double avg = sum / (this.rawdatas.length - 1);
            this.standardDeviation = avg / D2;
        }

        private void calcUCL(){
            this.UCL = this.standardDeviation * this.h;
        }

        private void calcLCL(){
            this.LCL = -1 * this.standardDeviation * this.h;
        }

        private String toFormat(double value){
            return String.format("%.9f", value);
        }

        public double[] getUpperDatas() {
            return upperDatas;
        }

        public double[] getLowDatas() {
            return lowDatas;
        }

        public double getUCL() {
            return UCL;
        }

        public double getLCL() {
            return LCL;
        }
    }

    public class EWMA {
        private static final String CSV_SPLIT = ",";
        private static final String NEW_LINE = "\r\n";
        private static final double D2 = 1.128; //係數d2(樣本大小為2時)

        private Double[] rawdatas;

        private double w;// = 0.2;
        private double target;// = 50;

        private double standardDeviation;
        private double UCL;
        private double LCL;
        private double[] ewmaDatas;

        public EWMA(Double[] rawdatas, double w, double target){
            this.rawdatas = rawdatas;
            this.w = w;
            this.target = target;

            this.ewmaDatas = new double[rawdatas.length];

            calcStandardDeviation();
            System.out.println("SD: " + this.standardDeviation);
            //this.standardDeviation = 1.809;
            calcUCL();
            calcLCL();
            calcEwma();
        }

        public Map toMap(){
            Map map = new HashMap();
            map.put("EWMA", this.ewmaDatas);
            map.put("LCL", this.LCL);
            map.put("UCL", this.UCL);

            map.put("Target", this.target);
            map.put("Sigma(X)", this.standardDeviation);
            map.put("w", this.w);

            return map;
        }

        public String toCsv(){
            StringBuilder sb = new StringBuilder();
            sb.append("EWMA").append(CSV_SPLIT).append("LCL").append(CSV_SPLIT).append("UCL").append(NEW_LINE);
            for(int index=0; index<this.rawdatas.length; index++){
                sb.append(toFormat(this.ewmaDatas[index])).append(CSV_SPLIT)
                        .append(toFormat(this.LCL)).append(CSV_SPLIT)
                        .append(toFormat(this.UCL)).append(NEW_LINE);
            }
            return sb.toString();
        }

        public String toInfo(){
            StringBuilder sb = new StringBuilder();
            sb.append("w: ").append(this.w).append(NEW_LINE)
                    .append("Target: ").append(this.target).append(NEW_LINE)
                    .append("UCL: ").append(this.UCL).append(NEW_LINE)
                    .append("LCL: ").append(this.LCL).append(NEW_LINE)
                    .append("Sigma(X): ").append(this.standardDeviation);
            return sb.toString();
        }

        //http://slideplayer.com/slide/3878334/的page32，不同的是ppt上的m-1要改成m
        private void calcStandardDeviation(){
            double sum = 0d;

            for(int index=1; index<this.rawdatas.length; index++){
                sum += Math.abs(this.rawdatas[index] - this.rawdatas[index - 1]);
            }
            double avg = sum / (this.rawdatas.length);
            this.standardDeviation = avg / D2;
        }

        private void calcEwma(){
            for(int index=0; index<this.rawdatas.length; index++){
                double x = this.rawdatas[index];
                if(index == 0){
                    this.ewmaDatas[index] = x + (1 - w) * 0.1;//F0
                    continue;
                }
                this.ewmaDatas[index] = w * x +  (1 - w) * this.ewmaDatas[index - 1];
            }
        }

        private void calcUCL(){
            this.UCL = target + 3 * this.standardDeviation * Math.sqrt(w / (2 - w));
        }

        private void calcLCL(){
            this.LCL = target - 3 * this.standardDeviation * Math.sqrt(w / (2 - w));
        }

        private String toFormat(double value){
            return String.format("%.9f", value);
        }

        public double[] getEwmaDatas() {
            return ewmaDatas;
        }

        public double getLCL() {
            return LCL;
        }

        public double getUCL() {
            return UCL;
        }
    }
}
