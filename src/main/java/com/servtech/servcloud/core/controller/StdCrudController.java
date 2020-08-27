package com.servtech.servcloud.core.controller;

import com.google.gson.Gson;
import com.google.gson.internal.LinkedTreeMap;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.Util;
import org.javalite.activejdbc.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.javalite.activejdbc.Base;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.sql.*;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import java.util.stream.Collectors;
import java.util.stream.Stream;

import static java.lang.Class.forName;
import static org.springframework.web.bind.annotation.RequestMethod.*;
import static com.servtech.servcloud.core.util.RequestResult.*;

/**
 * Created by Raynard on 2017/12/21.
 * <p/>
 * 通用型 CRUD 的  Api
 */
@RestController
@RequestMapping("/stdcrud")
public class StdCrudController {

    private static final Logger log = LoggerFactory.getLogger(StdCrudController.class);
    private static final SimpleDateFormat SDF = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(method = GET)
    public RequestResult<?> get() {
        final String tableModel = request.getParameter("tableModel");
        final String whereClause = request.getParameter("whereClause");
        final Object[] params = new Gson().fromJson(request.getParameter("params"), Object[].class);
        if (tableModel == null || tableModel.isEmpty() || tableModel.equals("")) {
            return success();
        } else {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    Class modelClass = null;
                    Method method = null;
                    List<Map> resultMap;
                    try {
                        modelClass = forName(tableModel);
                        Object model = modelClass.newInstance();
                        if (whereClause == null) {
                            method = modelClass.getMethod("findAll", null);
                            LazyList<?> result = (LazyList) method.invoke(null, null);
                            resultMap = result.include().toMaps();
                        } else {
                            method = modelClass.getMethod("where", String.class, Object[].class);
                            LazyList<?> result = null;
                            if (params == null || params.length == 0) {
                                result = (LazyList) method.invoke(null, whereClause, null);
                            } else {
                                result = (LazyList) method.invoke(null, whereClause, params);
                            }
                            resultMap = result.include().toMaps();
                        }
                        
                        Method getPks = modelClass.getMethod("getCompositeKeys");
                        getPks.setAccessible(true);
                        String[] pks = (String[])getPks.invoke(model);
                        for (Map map : resultMap) {
                          if (map.containsKey("create_time")) {
                              map.put("create_time", SDF.format(map.get("create_time")));
                          } 
                          if (map.containsKey("modify_time")) {
                              map.put("modify_time", SDF.format(map.get("modify_time")));
                          }
                          Map<String, Object> pkMap = new HashMap<String, Object>();
                          if (pks != null) {
                              for (String pk : pks) {
                                  pkMap.put(pk, map.get(pk));
                              }
                          }
                          if (pkMap.size() > 0) {
                              map.put("pks", pkMap);
                          }
                        }
                        return success(resultMap);
                    } catch (ClassNotFoundException e) {
                        e.printStackTrace();
                    } catch (IllegalAccessException e) {
                        e.printStackTrace();
                    } catch (NoSuchMethodException e) {
                        e.printStackTrace();
                    } catch (InvocationTargetException e) {
                        e.printStackTrace();
                    } catch (InstantiationException e) {
                        e.printStackTrace();
                    }
                    return fail("read fail...");
                }
            });

        }

    }

    /**
     * 分頁查詢
     * 參數比較複雜就只好用POST
     * 配合dataTable.ajax使用
     */
    @RequestMapping(value = "/paging", method = POST)
    public RequestResult<?> getDataByPage(@RequestBody final Map data) {
      String tableModel = data.get("tableModel").toString();
      String tableName = data.get("tableName").toString();
      Integer startPosition = (int) Double.parseDouble(data.get("start").toString());
      Integer dataLength = (int) Double.parseDouble(data.get("length").toString());
      List<Map> order = (List<Map>) data.get("order");
      List<String> selectColumn = (List<String>) data.get("selectColumn");
      List<Map> columns = (List<Map>) data.get("columns");
      if (tableModel == null || tableModel.isEmpty() || tableModel.equals("")) {
        return success();
      }
      return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
          @Override
          public RequestResult<?> operate() {
              try {
                  Class modelClass = forName(tableModel);
                  Object model = modelClass.newInstance();
                  Method method = modelClass.getMethod("where", String.class, Object[].class);
                  Map searchMap = new HashMap<>();
                  String whereClause = "1";
                  List<String> params = new ArrayList<>();
                  for (Map col : columns) {
                    String colName = (String) col.get("name");
                    Map search = (Map) col.get("search");
                    String searchValue = (String) search.get("value");
                    Boolean isRegEx = (Boolean) search.get("regex");
                    if (searchValue.equals("^$")) {
                      whereClause += " AND (" + colName + " = '' OR " + colName + " IS NULL)";
                    } else if (!searchValue.equals("")) {
                      whereClause += " AND " + colName + (isRegEx ? " = " : " LIKE ") + "?";
                      params.add(isRegEx ? searchValue.substring(1, searchValue.length() - 1) : searchValue + "%");
                    }
                  }
                  Map orderMap = order.get(0);
                  String orderBy = (String) columns.get((int) Double.parseDouble(order.get(0).get("column").toString())).get("name");
                  String orderDirection = (String) order.get(0).get("dir");
                  String sql = whereClause + 
                    " ORDER BY " + orderBy + " " + orderDirection + 
                    " LIMIT " + dataLength.toString() + 
                    " OFFSET " + startPosition;
                  LazyList<?> result = (LazyList) method.invoke(null, sql, params.toArray(new Object[0]));
                  List<Map> resultData = result.include().toMaps();
                  
                  Method getPks = modelClass.getMethod("getCompositeKeys");
                  getPks.setAccessible(true);
                  String[] pks = (String[])getPks.invoke(model);
                  for (Map map : resultData) {
                    if (map.containsKey("create_time")) {
                        map.put("create_time", SDF.format(map.get("create_time")));
                    } 
                    if (map.containsKey("modify_time")) {
                        map.put("modify_time", SDF.format(map.get("modify_time")));
                    }
                    Map<String, Object> pkMap = new HashMap<String, Object>();
                    if (pks != null) {
                        for (String pk : pks) {
                            pkMap.put(pk, map.get(pk));
                        }
                    }
                    if (pkMap.size() > 0) {
                        map.put("pks", pkMap);
                    }
                  }
                  // Table總筆數
                  int recordsTotal = Integer.valueOf(Base.findAll("SELECT count(*) recordsTotal FROM " + tableName).get(0).get("recordsTotal").toString());
                  // filter過總筆數
                  int recordsFiltered = Integer.valueOf(Base.findAll("SELECT count(*) recordsFiltered FROM " + tableName + " WHERE " + whereClause, params.toArray(new Object[0])).get(0).get("recordsFiltered").toString());
                  // filter過各select filter的欄位可filter的選項
                  Map<String, List<Object>> selectOption = new HashMap<>();
                  for (String col : selectColumn) {
                    selectOption.put(col, Base.findAll("SELECT DISTINCT(" + col + ") col FROM " + tableName + " WHERE " + whereClause, params.toArray(new Object[0])).stream()
                      .map(map -> map.get("col"))
                      .collect(Collectors.toList()));
                  }
                  Map resultMap = new HashMap<>();
                  resultMap.put("recordsTotal", recordsTotal);
                  resultMap.put("recordsFiltered", recordsFiltered);
                  resultMap.put("data", resultData);
                  resultMap.put("selectOption", selectOption);
                  return success(resultMap);
              } catch (ClassNotFoundException e) {
                  e.printStackTrace();
              } catch (IllegalAccessException e) {
                  e.printStackTrace();
              } catch (NoSuchMethodException e) {
                  e.printStackTrace();
              } catch (InvocationTargetException e) {
                  e.printStackTrace();
              } catch (InstantiationException e) {
                  e.printStackTrace();
              }
              return fail("read fail...");
          }
      });
    }

    @RequestMapping(method = POST)
    public RequestResult<?> post(@RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                String tableModel = data.get("tableModel").toString();
                data.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                data.put("create_time", new Timestamp(System.currentTimeMillis()));
                data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                data.put("modify_time", new Timestamp(System.currentTimeMillis()));
                try {
                    Class modelClass = forName(tableModel);
                    Object model = modelClass.newInstance();

                    Class[] methodParam = new Class[1];
                    methodParam[0] = Map.class;
                    Method formMapMethod = modelClass.getMethod("fromMap", methodParam);

                    Object[] methodObj = new Object[1];
                    methodObj[0] = data;

                    formMapMethod.setAccessible(true);
                    formMapMethod.invoke(model, methodObj);

                    Method insertMethod = modelClass.getMethod("insert");
                    insertMethod.setAccessible(true);
                    boolean result = (Boolean) insertMethod.invoke(model);

                    Method getIdNameMethod = modelClass.getMethod("getIdName");
                    getIdNameMethod.setAccessible(true);
                    String pk = (String) getIdNameMethod.invoke(model);

                    Method getPkVal = modelClass.getMethod("getString", String.class);
                    getPkVal.setAccessible(true);
                    String pkVal = (String) getPkVal.invoke(model, pk);

                    Method getPks = modelClass.getMethod("getCompositeKeys");
                    getPks.setAccessible(true);
                    String[] pks = (String[])getPks.invoke(model);
                    Map<String, Object> pksMap = new HashMap<String, Object>();
                    if (pks != null) {
                        for (String compoKey : pks) {
                            String val = (String) getPkVal.invoke(model, compoKey);
                            pksMap.put(compoKey, val);
                        }
                    }


                    if (result) {
                        if (pksMap.size() > 0) {
                            return success(pksMap);
                        } else {
                            return success(pkVal);
                        }
                    } else {
                        return fail("Create fail...");
                    }

                } catch (ClassNotFoundException e) {
                    e.printStackTrace();
                    return fail("can not find " + tableModel + " model, plz check");

                } catch (InstantiationException e) {
                    e.printStackTrace();
                } catch (IllegalAccessException e) {
                    e.printStackTrace();
                } catch (NoSuchMethodException e) {
                    e.printStackTrace();
                } catch (InvocationTargetException e) {
                    e.printStackTrace();
                }
                return fail("Create fail...");
            }
        });


    }

    @RequestMapping(method = PUT)
    public RequestResult<?> put(@RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                String tableModel = data.get("tableModel").toString();
                Object user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
                if(user != null){
                    data.put("modify_by", user);
                }
                if(data.get("modify_time") == null){
                    data.put("modify_time", new Timestamp(System.currentTimeMillis()));
                }
                try {
                    Class modelClass = forName(tableModel);
                    Object model = modelClass.newInstance();

                    Class[] methodParam = new Class[1];
                    methodParam[0] = Map.class;
                    Method formMapMethod = modelClass.getMethod("fromMap", methodParam);

                    Object[] methodObj = new Object[1];
                    methodObj[0] = data;

                    formMapMethod.setAccessible(true);
                    formMapMethod.invoke(model, methodObj);

                    Method updateMethod = modelClass.getMethod("saveIt");
                    updateMethod.setAccessible(true);
                    boolean result = (Boolean) updateMethod.invoke(model);

                    Method getIdNameMethod = modelClass.getMethod("getIdName");
                    getIdNameMethod.setAccessible(true);
                    String pk = (String) getIdNameMethod.invoke(model);

                    Method getPkVal = modelClass.getMethod("getString", String.class);
                    getPkVal.setAccessible(true);
                    String pkVal = (String) getPkVal.invoke(model, pk);

                    Method getPks = modelClass.getMethod("getCompositeKeys");
                    getPks.setAccessible(true);
                    String[] pks = (String[])getPks.invoke(model);
                    Map<String, Object> pksMap = new HashMap<String, Object>();
                    if (pks != null) {
                        for (String compoKey : pks) {
                            String val = (String) getPkVal.invoke(model, compoKey);
                            pksMap.put(compoKey, val);
                        }
                    }

                    if (result) {
                        if (pksMap.size() > 0) {
                            return success(pksMap);
                        } else {
                            return success(pkVal);
                        }
                    } else {
                        return fail("Update fail...");
                    }

                } catch (ClassNotFoundException e) {
                    e.printStackTrace();
                    return fail("can not find " + tableModel + " model, plz check");
                } catch (InstantiationException e) {
                    e.printStackTrace();
                } catch (IllegalAccessException e) {
                    e.printStackTrace();
                } catch (NoSuchMethodException e) {
                    e.printStackTrace();
                } catch (InvocationTargetException e) {
                    e.printStackTrace();
                } catch (Exception e) {
                    e.printStackTrace();
                }
                return fail(tableModel + " update failed.");
            }
        });
    }

    @RequestMapping(method = DELETE)
    public RequestResult<?> delete(@RequestBody final Object[] idList) {


        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                String tableModel = request.getParameter("tableModel").toString();
                String primaryKey = request.getParameter("key").toString();


                try {
                    Class model = forName(tableModel);
                    Object instance = model.newInstance();
                    Method method = model.getMethod("delete", String.class, Object[].class);
                    Object[] params = new Object[2];
                    if (primaryKey.equals("pks")) {
                        List<String> linkList = new LinkedList<String>();
                        StringBuilder sb = new StringBuilder();
                        String multiple = "";
                        for (Object o : idList) {
                            String json = new Gson().toJson(o);
                            LinkedTreeMap<String, String> map = new Gson().fromJson(json, LinkedTreeMap.class);
                            String describe = "( ";
                            String split = "";
                            for (Map.Entry<String, String> entry : map.entrySet()) {
                                String pk = entry.getKey();
                                describe += split += pk += "=? ";
                                linkList.add(entry.getValue());
                                split = " AND ";
                            }
                            describe += " )";
                            sb.append(multiple);
                            sb.append(describe);
                            multiple = " OR ";
                        }

                        params[0] = sb.toString();
                        params[1] = linkList.toArray(new String[0]);
                        int deleteCount = (Integer) method.invoke(null, params);
                        return success(deleteCount);
                    } else {
                        params[0] = primaryKey + " IN (" + Util.strSplitBy("?", ",", idList.length) + ")";
                        params[1] = idList;
                        int deleteCount = (Integer) method.invoke(null, params);
                        return success(deleteCount);
                    }
                } catch (ClassNotFoundException e) {
                    e.printStackTrace();
                } catch (NoSuchMethodException e) {
                    e.printStackTrace();
                } catch (InvocationTargetException e) {
                    e.printStackTrace();
                    if (e.getCause() instanceof Exception) {
                        if (e.getCause().getMessage().indexOf("foreign key") > -1) {
                            return fail("i18n_ServCloud_StdCrud_Foreign_Key");
                        } else {
                            return fail("i18n_ServCloud_StdCrud_Other");
                        }
                    }
                } catch (IllegalAccessException e) {
                    e.printStackTrace();
                } catch (InstantiationException e) {
                    e.printStackTrace();
                }

                return fail("delete is fail...");

            }
        });

    }

    @RequestMapping(value = "/schema", method = RequestMethod.GET)
    public RequestResult<?> schema() {
        return ActiveJdbc.operInformationSchema(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                Map<String, Map> result = new HashMap<String, Map>();
                try {
                    final String tableModel = request.getParameter("tableModel");
                    Class modelClass = forName(tableModel);
                    MetaModel metaModel = Registry.instance().getMetaModel(modelClass);
                    String tableName = metaModel.getTableName();

                    List<Map> schemas = Base.findAll("SELECT COLUMN_NAME, IS_NULLABLE, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, NUMERIC_PRECISION, NUMERIC_SCALE, COLUMN_TYPE " +
                            " FROM COLUMNS WHERE TABLE_SCHEMA='servcloud' AND TABLE_NAME=?", tableName);

                    System.out.println("with " + schemas.size() + " datas.");

                    for (Map map : schemas) {
                        Map columnType = new HashMap();
                        String type = map.get("DATA_TYPE").toString();
                        int size = 0;
                        if (map.get("CHARACTER_MAXIMUM_LENGTH") != null) { // varchar, text
                            size = Integer.valueOf(map.get("CHARACTER_MAXIMUM_LENGTH").toString());
                        } else if (map.get("NUMERIC_PRECISION") != null) { //float, double, decimal
                            size = Integer.valueOf(map.get("NUMERIC_PRECISION").toString());
                            if (map.get("NUMERIC_SCALE") != null && !map.get("NUMERIC_SCALE").toString().equals("0")) { //decimal(6,1) 99999.9
                                size++; // 若小數點後有數值的話要多加上小數點的長度
                            }
                        } else {
                            if (type.equals("date")) { //YYYY-MM-DD
                                size = 10;
                            } else if (type.equals("time")) { //HH:mm:ss
                                size = 8;
                            } else if (type.equals("datetime")) { //YYYY-MM-DD HH:mm:ss
                                size = 19;
                            } else if (type.equals("timestamp")) { //YYYYMMDDHHmmss
                                size = 14;
                            }
                        }

                        columnType.put("type", type);
                        columnType.put("size", size);
                        columnType.put("nullable", map.get("IS_NULLABLE").toString().equals("YES") ? true : false);
                        columnType.put("columnType", map.get("COLUMN_TYPE").toString());

                        result.put(map.get("COLUMN_NAME").toString(), columnType);
                    }
                } catch (ClassNotFoundException e) {
                    e.printStackTrace();
                    return fail(e.getMessage());
                } catch (Exception e) {
                    e.printStackTrace();
                    return fail(e.getMessage());
                }
                return success(result);
            }
        });
    }

//    public Map transObjtoMap(Object obj) {
//        Map<String, Object> map = new HashMap<String, Object>();
//        Field[] fields = obj.getClass().getDeclaredFields();
//
//        for (Field field : fields) {
//            try {
//                map.put(field.getName(), field.get(obj));
//            } catch (IllegalAccessException e) {
//                e.printStackTrace();
//            }
//        }
//        return map;
//    }
}
