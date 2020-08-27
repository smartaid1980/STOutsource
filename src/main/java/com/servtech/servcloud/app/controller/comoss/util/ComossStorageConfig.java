package com.servtech.servcloud.app.controller.comoss.util;

import java.util.List;

public class ComossStorageConfig {
    /**
     * id : d
     * name : 東莞廠
     * level : 1
     * type :
     * child : [{"id":"1","level":"2","name":"棟","type":"","child":[{"id":"1","level":"3","name":"樓","type":"","child":[{"id":"MA","level":"4","name":"倉庫","type":"","child":[{"id":"1","level":"5","name":"排","type":"","child":[{"id":"1","level":"6","name":"貨架","type":"","child":[{"id":"1","level":"7","name":"層","type":"","child":[{"id":"1","level":"8","name":"格","type":"","child":[],"light_id":"0","db_id":"P000000001"},{"id":"2","level":"8","name":"格","type":"","child":[],"light_id":"1","db_id":"P000000002"},{"id":"test003","level":"8","name":"test003","type":"","child":[],"light_id":"1","db_id":"P000000105"},{"id":"test004","level":"8","name":"test004","type":"","child":[],"light_id":"2","db_id":"P000000106"}],"db_id":"Z000000001","store_rule":"{}","store_type_id":1},{"id":"2","level":"7","name":"層","type":"","child":[{"id":"test001","level":"8","name":"test001","type":"","child":[],"db_id":"P000000108"},{"id":"test002","level":"8","name":"test002","type":"","child":[],"db_id":"P000000109"},{"id":"test003","level":"8","name":"test003","type":"","child":[],"db_id":"P000000110"}],"store_rule":"{}","store_type_id":2,"db_id":"S000000004"}]},{"id":"2","level":"6","name":"貨架","type":"","child":[{"id":"1","level":"7","name":"層","type":"","child":[{"id":"test001","level":"8","name":"test001","type":"","child":[],"db_id":"P000000111"},{"id":"test002","level":"8","name":"test002","type":"","child":[],"db_id":"P000000112"},{"id":"test003","level":"8","name":"test003","type":"","child":[],"db_id":"P000000113"}],"store_rule":"{}","store_type_id":3,"db_id":"S000000002"}]}],"db_id":"Z000000001"}]}]}]}]
     */

    private String id;
    private String name;
    private String level;
    private String type;
    private List<ChildBeanXXXXXX> child;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public List<ChildBeanXXXXXX> getChild() {
        return child;
    }

    public void setChild(List<ChildBeanXXXXXX> child) {
        this.child = child;
    }

    public static class ChildBeanXXXXXX {
        /**
         * id : 1
         * level : 2
         * name : 棟
         * type :
         * child : [{"id":"1","level":"3","name":"樓","type":"","child":[{"id":"MA","level":"4","name":"倉庫","type":"","child":[{"id":"1","level":"5","name":"排","type":"","child":[{"id":"1","level":"6","name":"貨架","type":"","child":[{"id":"1","level":"7","name":"層","type":"","child":[{"id":"1","level":"8","name":"格","type":"","child":[],"light_id":"0","db_id":"P000000001"},{"id":"2","level":"8","name":"格","type":"","child":[],"light_id":"1","db_id":"P000000002"},{"id":"test003","level":"8","name":"test003","type":"","child":[],"light_id":"1","db_id":"P000000105"},{"id":"test004","level":"8","name":"test004","type":"","child":[],"light_id":"2","db_id":"P000000106"}],"db_id":"Z000000001","store_rule":"{}","store_type_id":1},{"id":"2","level":"7","name":"層","type":"","child":[{"id":"test001","level":"8","name":"test001","type":"","child":[],"db_id":"P000000108"},{"id":"test002","level":"8","name":"test002","type":"","child":[],"db_id":"P000000109"},{"id":"test003","level":"8","name":"test003","type":"","child":[],"db_id":"P000000110"}],"store_rule":"{}","store_type_id":2,"db_id":"S000000004"}]},{"id":"2","level":"6","name":"貨架","type":"","child":[{"id":"1","level":"7","name":"層","type":"","child":[{"id":"test001","level":"8","name":"test001","type":"","child":[],"db_id":"P000000111"},{"id":"test002","level":"8","name":"test002","type":"","child":[],"db_id":"P000000112"},{"id":"test003","level":"8","name":"test003","type":"","child":[],"db_id":"P000000113"}],"store_rule":"{}","store_type_id":3,"db_id":"S000000002"}]}],"db_id":"Z000000001"}]}]}]
         */

        private String id;
        private String level;
        private String name;
        private String type;
        private List<ChildBeanXXXXX> child;

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getLevel() {
            return level;
        }

        public void setLevel(String level) {
            this.level = level;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public List<ChildBeanXXXXX> getChild() {
            return child;
        }

        public void setChild(List<ChildBeanXXXXX> child) {
            this.child = child;
        }

        public static class ChildBeanXXXXX {
            /**
             * id : 1
             * level : 3
             * name : 樓
             * type :
             * child : [{"id":"MA","level":"4","name":"倉庫","type":"","child":[{"id":"1","level":"5","name":"排","type":"","child":[{"id":"1","level":"6","name":"貨架","type":"","child":[{"id":"1","level":"7","name":"層","type":"","child":[{"id":"1","level":"8","name":"格","type":"","child":[],"light_id":"0","db_id":"P000000001"},{"id":"2","level":"8","name":"格","type":"","child":[],"light_id":"1","db_id":"P000000002"},{"id":"test003","level":"8","name":"test003","type":"","child":[],"light_id":"1","db_id":"P000000105"},{"id":"test004","level":"8","name":"test004","type":"","child":[],"light_id":"2","db_id":"P000000106"}],"db_id":"Z000000001","store_rule":"{}","store_type_id":1},{"id":"2","level":"7","name":"層","type":"","child":[{"id":"test001","level":"8","name":"test001","type":"","child":[],"db_id":"P000000108"},{"id":"test002","level":"8","name":"test002","type":"","child":[],"db_id":"P000000109"},{"id":"test003","level":"8","name":"test003","type":"","child":[],"db_id":"P000000110"}],"store_rule":"{}","store_type_id":2,"db_id":"S000000004"}]},{"id":"2","level":"6","name":"貨架","type":"","child":[{"id":"1","level":"7","name":"層","type":"","child":[{"id":"test001","level":"8","name":"test001","type":"","child":[],"db_id":"P000000111"},{"id":"test002","level":"8","name":"test002","type":"","child":[],"db_id":"P000000112"},{"id":"test003","level":"8","name":"test003","type":"","child":[],"db_id":"P000000113"}],"store_rule":"{}","store_type_id":3,"db_id":"S000000002"}]}],"db_id":"Z000000001"}]}]
             */

            private String id;
            private String level;
            private String name;
            private String type;
            private List<ChildBeanXXXX> child;

            public String getId() {
                return id;
            }

            public void setId(String id) {
                this.id = id;
            }

            public String getLevel() {
                return level;
            }

            public void setLevel(String level) {
                this.level = level;
            }

            public String getName() {
                return name;
            }

            public void setName(String name) {
                this.name = name;
            }

            public String getType() {
                return type;
            }

            public void setType(String type) {
                this.type = type;
            }

            public List<ChildBeanXXXX> getChild() {
                return child;
            }

            public void setChild(List<ChildBeanXXXX> child) {
                this.child = child;
            }

            public static class ChildBeanXXXX {
                /**
                 * id : MA
                 * level : 4
                 * name : 倉庫
                 * type :
                 * child : [{"id":"1","level":"5","name":"排","type":"","child":[{"id":"1","level":"6","name":"貨架","type":"","child":[{"id":"1","level":"7","name":"層","type":"","child":[{"id":"1","level":"8","name":"格","type":"","child":[],"light_id":"0","db_id":"P000000001"},{"id":"2","level":"8","name":"格","type":"","child":[],"light_id":"1","db_id":"P000000002"},{"id":"test003","level":"8","name":"test003","type":"","child":[],"light_id":"1","db_id":"P000000105"},{"id":"test004","level":"8","name":"test004","type":"","child":[],"light_id":"2","db_id":"P000000106"}],"db_id":"Z000000001","store_rule":"{}","store_type_id":1},{"id":"2","level":"7","name":"層","type":"","child":[{"id":"test001","level":"8","name":"test001","type":"","child":[],"db_id":"P000000108"},{"id":"test002","level":"8","name":"test002","type":"","child":[],"db_id":"P000000109"},{"id":"test003","level":"8","name":"test003","type":"","child":[],"db_id":"P000000110"}],"store_rule":"{}","store_type_id":2,"db_id":"S000000004"}]},{"id":"2","level":"6","name":"貨架","type":"","child":[{"id":"1","level":"7","name":"層","type":"","child":[{"id":"test001","level":"8","name":"test001","type":"","child":[],"db_id":"P000000111"},{"id":"test002","level":"8","name":"test002","type":"","child":[],"db_id":"P000000112"},{"id":"test003","level":"8","name":"test003","type":"","child":[],"db_id":"P000000113"}],"store_rule":"{}","store_type_id":3,"db_id":"S000000002"}]}],"db_id":"Z000000001"}]
                 */

                private String id;
                private String level;
                private String name;
                private String type;
                private List<ChildBeanXXX> child;

                public String getId() {
                    return id;
                }

                public void setId(String id) {
                    this.id = id;
                }

                public String getLevel() {
                    return level;
                }

                public void setLevel(String level) {
                    this.level = level;
                }

                public String getName() {
                    return name;
                }

                public void setName(String name) {
                    this.name = name;
                }

                public String getType() {
                    return type;
                }

                public void setType(String type) {
                    this.type = type;
                }

                public List<ChildBeanXXX> getChild() {
                    return child;
                }

                public void setChild(List<ChildBeanXXX> child) {
                    this.child = child;
                }

                public static class ChildBeanXXX {
                    /**
                     * id : 1
                     * level : 5
                     * name : 排
                     * type :
                     * child : [{"id":"1","level":"6","name":"貨架","type":"","child":[{"id":"1","level":"7","name":"層","type":"","child":[{"id":"1","level":"8","name":"格","type":"","child":[],"light_id":"0","db_id":"P000000001"},{"id":"2","level":"8","name":"格","type":"","child":[],"light_id":"1","db_id":"P000000002"},{"id":"test003","level":"8","name":"test003","type":"","child":[],"light_id":"1","db_id":"P000000105"},{"id":"test004","level":"8","name":"test004","type":"","child":[],"light_id":"2","db_id":"P000000106"}],"db_id":"Z000000001","store_rule":"{}","store_type_id":1},{"id":"2","level":"7","name":"層","type":"","child":[{"id":"test001","level":"8","name":"test001","type":"","child":[],"db_id":"P000000108"},{"id":"test002","level":"8","name":"test002","type":"","child":[],"db_id":"P000000109"},{"id":"test003","level":"8","name":"test003","type":"","child":[],"db_id":"P000000110"}],"store_rule":"{}","store_type_id":2,"db_id":"S000000004"}]},{"id":"2","level":"6","name":"貨架","type":"","child":[{"id":"1","level":"7","name":"層","type":"","child":[{"id":"test001","level":"8","name":"test001","type":"","child":[],"db_id":"P000000111"},{"id":"test002","level":"8","name":"test002","type":"","child":[],"db_id":"P000000112"},{"id":"test003","level":"8","name":"test003","type":"","child":[],"db_id":"P000000113"}],"store_rule":"{}","store_type_id":3,"db_id":"S000000002"}]}]
                     * db_id : Z000000001
                     */

                    private String id;
                    private String level;
                    private String name;
                    private String type;
                    private String db_id;
                    private List<ChildBeanXX> child;

                    public String getId() {
                        return id;
                    }

                    public void setId(String id) {
                        this.id = id;
                    }

                    public String getLevel() {
                        return level;
                    }

                    public void setLevel(String level) {
                        this.level = level;
                    }

                    public String getName() {
                        return name;
                    }

                    public void setName(String name) {
                        this.name = name;
                    }

                    public String getType() {
                        return type;
                    }

                    public void setType(String type) {
                        this.type = type;
                    }

                    public String getDb_id() {
                        return db_id;
                    }

                    public void setDb_id(String db_id) {
                        this.db_id = db_id;
                    }

                    public List<ChildBeanXX> getChild() {
                        return child;
                    }

                    public void setChild(List<ChildBeanXX> child) {
                        this.child = child;
                    }

                    public static class ChildBeanXX {
                        /**
                         * id : 1
                         * level : 6
                         * name : 貨架
                         * type :
                         * child : [{"id":"1","level":"7","name":"層","type":"","child":[{"id":"1","level":"8","name":"格","type":"","child":[],"light_id":"0","db_id":"P000000001"},{"id":"2","level":"8","name":"格","type":"","child":[],"light_id":"1","db_id":"P000000002"},{"id":"test003","level":"8","name":"test003","type":"","child":[],"light_id":"1","db_id":"P000000105"},{"id":"test004","level":"8","name":"test004","type":"","child":[],"light_id":"2","db_id":"P000000106"}],"db_id":"Z000000001","store_rule":"{}","store_type_id":1},{"id":"2","level":"7","name":"層","type":"","child":[{"id":"test001","level":"8","name":"test001","type":"","child":[],"db_id":"P000000108"},{"id":"test002","level":"8","name":"test002","type":"","child":[],"db_id":"P000000109"},{"id":"test003","level":"8","name":"test003","type":"","child":[],"db_id":"P000000110"}],"store_rule":"{}","store_type_id":2,"db_id":"S000000004"}]
                         */

                        private String id;
                        private String level;
                        private String name;
                        private String type;
                        private List<ChildBeanX> child;

                        public String getId() {
                            return id;
                        }

                        public void setId(String id) {
                            this.id = id;
                        }

                        public String getLevel() {
                            return level;
                        }

                        public void setLevel(String level) {
                            this.level = level;
                        }

                        public String getName() {
                            return name;
                        }

                        public void setName(String name) {
                            this.name = name;
                        }

                        public String getType() {
                            return type;
                        }

                        public void setType(String type) {
                            this.type = type;
                        }

                        public List<ChildBeanX> getChild() {
                            return child;
                        }

                        public void setChild(List<ChildBeanX> child) {
                            this.child = child;
                        }

                        public static class ChildBeanX {
                            /**
                             * id : 1
                             * level : 7
                             * name : 層
                             * type :
                             * child : [{"id":"1","level":"8","name":"格","type":"","child":[],"light_id":"0","db_id":"P000000001"},{"id":"2","level":"8","name":"格","type":"","child":[],"light_id":"1","db_id":"P000000002"},{"id":"test003","level":"8","name":"test003","type":"","child":[],"light_id":"1","db_id":"P000000105"},{"id":"test004","level":"8","name":"test004","type":"","child":[],"light_id":"2","db_id":"P000000106"}]
                             * db_id : Z000000001
                             * store_rule : {}
                             * store_type_id : 1
                             */

                            private String id;
                            private String level;
                            private String name;
                            private String type;
                            private String db_id;
                            private String store_rule;
                            private int store_type_id;
                            private List<ChildBean> child;

                            public String getId() {
                                return id;
                            }

                            public void setId(String id) {
                                this.id = id;
                            }

                            public String getLevel() {
                                return level;
                            }

                            public void setLevel(String level) {
                                this.level = level;
                            }

                            public String getName() {
                                return name;
                            }

                            public void setName(String name) {
                                this.name = name;
                            }

                            public String getType() {
                                return type;
                            }

                            public void setType(String type) {
                                this.type = type;
                            }

                            public String getDb_id() {
                                return db_id;
                            }

                            public void setDb_id(String db_id) {
                                this.db_id = db_id;
                            }

                            public String getStore_rule() {
                                return store_rule;
                            }

                            public void setStore_rule(String store_rule) {
                                this.store_rule = store_rule;
                            }

                            public int getStore_type_id() {
                                return store_type_id;
                            }

                            public void setStore_type_id(int store_type_id) {
                                this.store_type_id = store_type_id;
                            }

                            public List<ChildBean> getChild() {
                                return child;
                            }

                            public void setChild(List<ChildBean> child) {
                                this.child = child;
                            }

                            public static class ChildBean {
                                /**
                                 * id : 1
                                 * level : 8
                                 * name : 格
                                 * type :
                                 * child : []
                                 * light_id : 0
                                 * db_id : P000000001
                                 */

                                private String id;
                                private String level;
                                private String name;
                                private String type;
                                private String light_id;
                                private String db_id;
                                private List<?> child;

                                public String getId() {
                                    return id;
                                }

                                public void setId(String id) {
                                    this.id = id;
                                }

                                public String getLevel() {
                                    return level;
                                }

                                public void setLevel(String level) {
                                    this.level = level;
                                }

                                public String getName() {
                                    return name;
                                }

                                public void setName(String name) {
                                    this.name = name;
                                }

                                public String getType() {
                                    return type;
                                }

                                public void setType(String type) {
                                    this.type = type;
                                }

                                public String getLight_id() {
                                    return light_id;
                                }

                                public void setLight_id(String light_id) {
                                    this.light_id = light_id;
                                }

                                public String getDb_id() {
                                    return db_id;
                                }

                                public void setDb_id(String db_id) {
                                    this.db_id = db_id;
                                }

                                public List<?> getChild() {
                                    return child;
                                }

                                public void setChild(List<?> child) {
                                    this.child = child;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
