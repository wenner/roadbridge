'use strict';

angular.module('bridge.services')
    .service("CheckCurrent", function () {
        function Current() {
            this.reset();
        }
        /*
         code: 代码
         value: 当前值
         display: 显示值
         mapping: 对应的数据字段名称
         record: 对应的json数据
         getDisplay: 获取显示值方法
         */
        Current.prototype.initValue =  {
            //病害基本信息
            //状态
            status: {isBase: true, value: "病害"},
            //编号
            sn: {},
            //天气
            weather: {isBase: true},
            //检查人 , string
            checkUser: {isBase: true},
            checkUserName: {isBase: true} ,
            //检查部门 , string
            checkDept: {isBase: true},
            //检查日期 , date
            checkDay: {isBase: true},
            //道路
            road: {
                mapping: "roadId",
                isBase: true,
                getDisplay: function (current, code) {
                    var record = current.road.record;
                    return record.name;
                    //return record.sn + " " + record.name;
                }
            },
            //桥梁
            bridge: {
                mapping: "bridgeId",
                isBase: true,
                getDisplay: function (current, code) {
                    var road = current.road.record;
                    var bridge = current.bridge.record;
                    var direction = current.direction.value;
                    //name , sn , stakeNo , 上行 , 左右 , 起点终点
                    var displays = [
                        bridge.alias ? "桥"+bridge.alias+":" : "" ,
                        bridge.stakeNo ? "桩号"+bridge.stakeNo : "" ,
                        bridge.name
                        ];
                    if (direction != "S") {
                        displays = displays.concat([,
                            road.downDirection == direction ? "下行" : "上行",
                            direction == "L" ? "左幅" : "右幅",
                            road.downDirection == direction ? road.startCity + "-" + road.endCity : road.startCity + "-" + road.endCity
                        ])
                    } else {
                        displays = displays.concat([
                            bridge.wayType == "single" ? "单幅桥" : "匝道桥"
                        ]);
                    }
                    return displays.join(" ");
                }

            },
            //任务
            task: {
                isBase: true, 
                mapping: "taskId" , 
                getDisplay: function(current , code){
                    var record = current.task.record;
                    return record.Name;                    
                }
            },
            //方向
            direction: {isBase: true},
            //部位
            buwei: {isBase: true, mapping: "buweiId"},
            //部位类型 kong/lian
            bujianType: {},
            //部位分组 桥上/桥下
            bujianGroup: {},

            //部件号 , x孔/x联
            bujianSn: {
                isBase: true,
                getDisplay: function (current, code) {
                    if (current.bujianSn.record) return current.bujianSn.record.name;
                }
            },
            //部件 , 16个部件Id
            bujian: {
                isBase: true,
                mapping: "bujianId",
                getDisplay: function (current, code) {
                    return current.bujian.record ? current.bujian.record.name : "";
                }
            },
            //构件 , 应该是formal
            goujian: {},
            //病害类型
            diseaseCategory: {
                isBase: true,
                mapping: "categoryId"
            },
            //病害定性描述
            diseaseQualitative: {
                isBase: true,
                mapping: "qualitativeId"
            },
            //病害标度
            diseaseEvaluate: {
                isBase: true,
                mapping: "evaluateId"
            },
            content: {
                isBase: true
            },
            //形式 = 构件
            formal: {
                mapping: "goujianId"
            },
            //墩
            dun: {},
            //梁
            liang: {},
            //距离
            distance: {},
            //支座
            zhizuo: {},
            //位置
            position: {},
            //长
            length: {},
            //宽
            width: {},
            //高
            height: {},
            //数量
            quantity: {},
            //数量1
            extquantity: {},
            //描述,状态
            description: {}
        };

        Current.prototype.reset = function(vs){
            _.each(vs || this.initValue, function (n, key) {
                n.code = key;
                if (!n.mapping) n.mapping = key;
            });
            _.extend(this, this.initValue);
        };

        Current.prototype.isEmpty = function () {
            return !(this.road.value && this.bridge.value);
        };

        Current.prototype.hasBujian = function () {
            return this.bujianSn.value && this.bujian.value;
        };

        Current.prototype.set = function (key, value) {
            if (!this[key]) this[key] = {};
            if (!value) return;
            var item = this[key];
            if (_.isObject(value)) {
                _.extend(item, value);
                item.display = (value.record ? value.record.name : null)
                    || item.name
                    || item.display
                    || item.value;
                if (item.getDisplay) {
                    item.display = item.getDisplay(this, key);
                }
            } else {
                item.value = value;
            }
        };
        Current.prototype.setInfo = function (info) {
            var me = this;
            _.each(info, function (n, key) {
                var item = me[key];
                if (item) {
                    switch (key) {
                        case "road":
                            item.record = info.roadRecord;
                            break;
                        case "bridge":
                            item.record = info.bridgeRecord;
                            break;
                        case "task":
                            item.record = info.taskRecord;
                            break;
                    }
                    item.value = n;
                    item.display = n;
                    if (item.getDisplay) {
                        item.display = item.getDisplay(me, key);
                    }
                }
            });
        };
        return Current;

    });




angular.module('bridge.services')
.factory(
    'CheckSwipeService',
    function ($log, $q, $timeout, UserService, StorageService, $util,
              SwipeBaseData, CheckCurrent,
              columnByBujianService ,
              columnByBujianSnService ,
              columnByPickService ,
              columnUtilService ,
              checkSwipeContentService ,
              DataBaseService) {
        var current = new CheckCurrent();
        var bujianSrv = columnByBujianService;
        var bujianSnSrv = columnByBujianSnService;
        var pickSrv = columnByPickService;
        var diseases = [];
        var result = [
            //{name:"xxx" , value:"xxx" , nextstep:"xxx"}
        ];
        var medias = [];
        var jsdb = SwipeBaseData;
        var db = DataBaseService.db;
        return {
            current: current,
            diseases: diseases ,
            medias: medias ,
            //其他需要的值
            //bujianSns: null ,
            resetCurrent: function(vs){
                this.current.reset(vs);
            } ,
            clearMedias: function(){
                medias.splice(0 , medias.length);
                //medias = _.remove(medias , function(){return true});
            } ,
            baseSql: {
                road: "select * from road order by ix",
                task: "select * from W_A_Disease_CheckTaskInfo where ProjectID = ? order by time desc" ,
                bridge: "select * from bridge where id in (select BridgeID from W_C_Task_Bridge where TaskID = ?) order by ix" ,
                //bridge: "select * from bridge order by ix",
                buwei: "select bujianGroup from buwei group by bujianGroup"
            },

            getBaseInfo: function (table, params) {
                var sql = this.baseSql[table] || table;
                return DataBaseService.query(sql, params || []);
            },
            //获取路线列表
            getRoads: function () {
                return this.getBaseInfo("road");
            },
            //通过Id获取路线
            getRoadById: function (id) {
                return DataBaseService.single("select * from road where id = " + id + " limit 1");
            },
            //通过线路获取任务
            getTasksByRoad: function(road){                
                return this.getBaseInfo("task" , [road]);
            } ,            
            //通过ID获取任务
            getTaskById: function(id){
                return DataBaseService.single("select * from W_A_Disease_CheckTaskInfo where TaskInfoID = '" + id + "' limit 1");                
            } ,
            //获取桥梁列表
            getBridgesByTask: function (task) {
                return this.getBaseInfo("bridge" , [task]);
            },
            //通过ID获取桥梁
            getBridgeById: function (id) {
                return DataBaseService.single("select * from bridge where id = " + id + " limit 1");
            },
            //获取方向列表
            getDirections: function (road, bridge) {
                var defer = $q.defer();

                var downDirection = road.downDirection;
                var downIsLeft = downDirection == "L";
                var directions = [];
                //下行
                directions.push({
                    direction: downIsLeft ? "L" : "R",
                    text: "下行 " + (downIsLeft ? "左幅" : "右幅") + " " + road.startCity + "-" + road.endCity
                });
                //上行
                directions.push({
                    direction: downIsLeft ? "R" : "L",
                    text: "上行 " + (downIsLeft ? "右幅" : "左幅") + " " + road.endCity + "-" + road.startCity
                });
                defer.resolve(directions);
                return defer.promise;
            },
            //获取天气
            getWeathers: function () {
                var defer = $q.defer();
                defer.resolve(jsdb.weathers);
                return defer.promise;
            },
            /** 插入病害数据 */
            insertTaskDisease: function(rs){
                var max = 500 , 
                    sqls = [] ,
                    ids = _.map(rs , function(n){return  n.id});               
                var getInsertSql = function(items){
                    var fields = [
                        "id" ,"taskId" ,"sourceId" ,"status" ,"sn" ,"checkUser" ,"checkUserName" ,"checkDay" ,
                        "weather" ,"createAt" ,"createBy" ,"modifyAt" ,"modifyBy" ,
                        "isRemote" ,"isModified" ,"isDisease" ,"roadId" ,"bridgeId" ,"direction" ,"buweiId" ,
                        "bujianSn" ,"bujianId" ,"categoryId" ,"qualitativeId" ,"evaluateId" ,"content" ,"goujianId" ,
                        "formal" ,"liang" ,"dun" ,"zhizuo" ,"distance" ,"position" ,"length" ,"width" ,"height" ,
                        "quantity" ,"extquantity" ,"description"
                    ] , 
                    values=[] ,
                    insertSql= "";
                    _.each(items , function(item){
                        var value = [];
                        _.each(fields , function(field){
                            value.push("'"+(item[field] || "")+"'");
                        });
                        values.push(value);
                    });
                    insertSql = "select " + values.join(" union  select ");
                    //将fields加到前面 , 形成 insert into fields select a , b , c union select a , b , c
                    insertSql = "insert into Disease (" + fields.join(" , ") + ") " + insertSql;
                    return insertSql;
                }
                sqls.push("delete from disease where id in ("+ids.toString()+");");
                for (var i = 0; i < rs.length;) {
                    var items = _.slice(rs, i, i + max);
                    sqls.push(getInsertSql(items));
                    i = i + max;
                }
                return DataBaseService.run(sqls)
            } ,

            //获取部位列表
            getBuweis: function () {
                return this.getBaseInfo("buwei");
            },
            
            //获取孔,联号
            getBujianSns: function () {
                var me = this;
                var defer = $q.defer();
                var sql = "select * from buwei where bujianGroup = '" + current.bujianGroup.value + "' limit 1";
                return DataBaseService
                    .single(sql)
                    .then(function (buwei) {
                        var bujianType = buwei.bujianType;
                        current.bujianType.value = bujianType;
                        var items;
                        switch (bujianType) {
                            case "kong":
                                items = me.getKongs();
                                break;
                            case "lian":
                                items = me.getLians();
                                break;
                        }
                        return items;
                    });
            },
            //获取孔号
            getKongs: function () {
                var sql = "select * from bridgekong where bridgeId = ? and direction = ? order by id";
                var params = [current.bridge.value, current.direction.value];
                return DataBaseService.query(sql, params).then(function(items){
                    return _.map(items , function(n){
                        return _.extend(n, {name: "第" + n.sn + "孔", value: n.sn});
                    })
                });

                /*
                 var kongs = _.filter(jsdb.kongs, function (n) {
                 return n.direction == current.direction.value && n.bridgeId == current.bridge.value;
                 });
                 return _.map(kongs, function (n) {
                 return _.extend(n, {name: "第" + n.sn + "孔", value: n.sn});
                 });
                 */
            },
            //获取联号
            getLians: function () {
                var defer = $q.defer();
                var jointCount = current.bridge.record.jointCount;
                var items = _.map(_.range(1, jointCount + 1), function (n) {
                    return {name: "第" + n + "联", value:n};
                });
                defer.resolve(items);
                return defer.promise
            },
            //获取部件
            getBujians: function () {
                var sql = "select * from bujian where buweiId in (select id from buwei where bujianGroup = ?) order by id";
                var params = [current.bujianGroup.value];
                return DataBaseService.query(sql, params);
            },
            //获取对应的标度
            getDiseaseEvaluates: function(){
                var defer = $q.defer();
                var qualitativeId = current.diseaseQualitative.value;
                if (qualitativeId == 0) return defer.promise;
                var diseaseQualitativeRecord = current.diseaseQualitative.record ,
                    evaluateGroup = diseaseQualitativeRecord ? diseaseQualitativeRecord.evaluateGroup : "";
                $q.all({
                    evaluates: DataBaseService.query("select * from DiseaseEvaluate where groupId = ? order by sn", [evaluateGroup]) ,
                    groups: DataBaseService.query("select * from DiseaseEvaluateGroup where replace('x"+evaluateGroup+"', 'x'||id, '') != 'x"+evaluateGroup+"' and replace(id , '-' , '') = id order by id;") ,
                    self: DataBaseService.query("select * from DiseaseEvaluateGroup where id = ?", [evaluateGroup]) ,                
                }).then(function(rs){
                    defer.resolve(rs);
                });
                return  defer.promise;                

                /*
                CHARINDEX(id , '10.1.1-1') > 0
                var sql = [
                    "select * from DiseaseEvaluate where groupId = ? order by sn"
                ].join(" ");
                return DataBaseService.query(sql, [evaluateGroup]);
                */
            } ,
            //获取初始化列
            getPickerColumns: function () {
                var min = 1 , max=18;
                //if (!this.baseColumns) {
                    this.baseColumns = _.map(_.range(min , max), function (n) {
                        return {
                            name: "code" + n,
                            code: "code" + n,
                            hidden: true,
                            items: []
                        }
                    });
                //}
                return this.baseColumns;
            },

            //根据部件获取列change
            getColumnsByBujian: function (cols) {
                var defer = $q.defer();
                if (!cols) return defer.promise;
                if (!current.bujianSn.record || !current.bujian.record) {
                    return defer.promise;
                }
                bujianSrv.getChanges(current , cols , this)
                    .then(function(changes){
                        defer.resolve(changes);
                    });
                return defer.promise;
            },
            //根据部件号获取列changes
            getColumnsByBujianSn: function (cols) {
                var defer = $q.defer();
                if (!cols) return defer.promise;
                if (!current.bujianSn.record || !current.bujian.record) {
                    defer.resolve();
                    return defer.promise;
                }
                var changes = bujianSnSrv.getChanges(current , cols , this);
                if (changes){
                    defer.resolve(changes);
                }
                return defer.promise;
            },
            //根据某一列变化获取changes
            getColumnsByPick: function (cols, code) {
                if (!cols) return defer.promise;
                return pickSrv.getChanges(current , cols , code);
            },

            //获取病害描述
            getContent: function () {
                return checkSwipeContentService.getContent(current);
            },


            //获取值
            getDiseaseValues: function () {
                var values = {};
                var columns = this.baseColumns;
                var columnCodes = [];
                _.each(columns, function (n) {
                    if (n.hidden != true) {
                        columnCodes.push(n.code);
                    }
                });
                _.each(current, function (n) {
                    //这里需要对值进行判断,是否有空值 , 如果有空值,则不能保存
                    if (n.isBase == true || _.indexOf(columnCodes, n.code) > -1) {
                        values[n.mapping] = n.value;
                    }
                });
                return values;
            },

            //保存
            getValues: function(){
                var defer = $q.defer();
                //获取病害信息
                var disease = this.getDiseaseValues();
                if (!disease) {
                    defer.reject("无效的数据,请检查!");
                    return defer.promise;
                }
                if (!disease.content){
                    defer.reject("缺少病害描述信息,请检查!");
                    return defer.promise;
                }
                //获取照片信息
                /*
                if (medias.length == 0){
                    defer.reject("没有图片信息,请现场拍照!");
                    return defer.promise;
                }
                */
                disease.isRemote = 0;
                disease.isModified = 0;
                disease.isDisease = 1;

                defer.resolve({
                    disease: disease ,
                    medias: medias
                });
                return defer.promise;
            } ,
            save: function (values) {
                var defer = $q.defer();
                $q.all({
                    //values: this.getValues(values),
                    maxId: function () {
                        var maxIdSql = "select max(id) as diseaseId from localDisease";
                        return DataBaseService.single(maxIdSql)
                    }()
                }).then(function(rs){
                    var disease = values.disease;
                    var medias = values.medias;
                    var diseaseId = rs.maxId.diseaseId;
                    diseaseId = diseaseId ? diseaseId+1 : 1;
                    disease.sn = [
                        current.road.record.sn,
                        current.bridge.record.alias,
                        current.direction.value,
                        moment().format('YYYYMMDD'),
                        _.padLeft(diseaseId , 4 , '0')
                    ].join("-");

                    var insertSqls = [];
                    //insert into LocalDisease
                    var diseaseSqlFields = [
                        "taskId","sourceId","status","sn",
                        "checkUser","checkUserName","checkDay","weather",
                        "createAt", 'isRemote' , 'isModified' , 'isDisease' ,
                        "roadId","bridgeId","direction","buweiId","bujianSn","bujianId",
                        "categoryId","qualitativeId","evaluateId","content","goujianId",
                        "formal","liang","dun","zhizuo","distance","position",
                        "length","width","height","quantity","extquantity",
                        "description"
                    ];
                    var diseaseSqlValues = _.map(diseaseSqlFields , function(n){
                        var v = disease[n] || "";
                        switch (n){
                            case "createAt":
                                v = moment().format('YYYY-MM-DD HH:mm:ss');
                                break;
                            case "checkDay":
                                v = moment(v).format('YYYY-MM-DD HH:mm:ss');
                                break;
                        }
                        return "'"+v+"'";
                    });
                    var diseaseSql = "insert into LocalDisease ( id , " + diseaseSqlFields +" )  values ("+diseaseId+" , "+diseaseSqlValues+");";
                    insertSqls.push(diseaseSql);
                    //insert into medias
                    _.each(medias , function(n , i){
                        var id = _.now()+i;
                        var mediaSql = "insert into LocalDiseaseMedia (id , ix , diseaseId , path) values ("+id+" , "+(i+1)+" , "+diseaseId+" , '"+ n.path+"')";
                        insertSqls.push(mediaSql);
                    });
                    DataBaseService.run(insertSqls)
                        .then(function(){
							current.reset({
								description: {}
							});
                            defer.resolve();
                        } , function(errors){
                            defer.reject(errors.toString());
                        });
                } , function(msg){
                    defer.reject(msg);
                });
                return defer.promise;
            } ,
            //删除
            deleteDisease: function(disease){
                var sql  = [
                    "delete from LocalDisease where id = "+disease.id ,
                    "delete from LocalDiseaseMedia where diseaseId = "+disease.id
                ];
                return DataBaseService.run(sql);
            } ,

            //获取修改后字段
            getEditFields: function(disease){
                  
                    var bujianId = disease.bujianId,
                        goujianId = disease.formal ,
                        categoryId = disease.categoryId ,
                        qualitativeId = disease.qualitativeId;
                    return getColumnsByBujian()
                        .then(getColumnsByBujianAndCategory)
                        .then(getColumnsByBujianAndCategoryAndQualitative)
                        .then(function (items) {
                            _.map(items , function(n){
                                n.items = [];
                                n.value = null;
                            });
                            items = _.groupBy(items , 'goujianId');
                            var currentFields = items[goujianId] || items[0];
                            currentFields = columnUtilService.getFieldItemDataByType(currentFields);
                            return currentFields;
                        });


                //通过部件 , 构件 , 病害类别 , 定性描述获取后面的列
                //只通过部件获取
                function getColumnsByBujian(){
                    var params = [bujianId , 0 , 0];
                    return getQueryResult(params , []);
                }
                //通过部件 , 病害类别 获取
                function getColumnsByBujianAndCategory(items){
                    var params = [bujianId , categoryId , 0];
                    return getQueryResult(params , items);
                }
                //通过部件 , 病害类别 , 定性描述 获取
                function getColumnsByBujianAndCategoryAndQualitative(items){
                    var params = [bujianId ,categoryId ,qualitativeId];
                    return getQueryResult(params , items);
                }
                function getQueryResult(params , items){
                    var defer = $q.defer();
                    var sql = [
                        "select * from DiseaseField" ,
                        "where position = 'after' and uStatus = 'able' and " ,
                        "bujianId  = ? and categoryId = ? and qualitativeId = ?" ,
                        "order by ix "
                    ].join(" ");
                    return DataBaseService
                        .query(sql, params)
                        .then(function(rs){
                            if (rs.length > 0) items = rs;
                            return items;
                        });
                }
            } ,  
            
            //获取qualitativeId对应的标度
            getEvaluatesByQualitative: function(disease){
                var qualitativeId = disease.qualitativeId;
                if (qualitativeId == 0){
                    return {
                        items:[
                            {name:1 , value:0}
                        ]
                    };
                }
                var sql = [
                    "select e.id , e.sn from DiseaseEvaluate e " , 
                    "left join DiseaseQualitative q on q.evaluateGroup = e.groupId " ,
                    "where q.id = ? order by e.sn"
                ].join(" ");
                return DataBaseService
                    .query(sql, [qualitativeId])
                    .then(function (items) {
                        return _.map(items, function (n) {
                            return _.extend(n, {name: n.sn, value: n.id});
                        });
                    }); 
            } ,

            //通过条件查询disease和LocalDisease中的检查记录
            getDiseases: function () {
                //sql模板
                var template = [
                    "select d.* , e.sn as evaluateSn , m.mediaCount from Disease d " ,
                    "left join diseaseEvaluate e on e.id = d.evaluateId " ,
                    "left join (select diseaseId , count(*) as mediaCount from DiseaseMedia group by diseaseId) m on m.diseaseId = d.id" ,
                    "where d.taskId = '{{taskId}}' " ,
                    "and d.roadId = {{roadId}} " ,
                    "and d.bridgeId = {{bridgeId}} " ,
                    "and d.direction = '{{direction}}'"
                ].join(" ");
                template = _.template(template);
                var sql = template({
                    taskId: current.task.value ,
                    roadId: current.road.value ,
                    bridgeId: current.bridge.value ,
                    direction: current.direction.value ,
                    buweiId: current.buwei.value ,
                    bujianSn: current.bujianSn.value
                });
                sql += " union "+ sql.replace(/Disease/g , "LocalDisease");
                sql += " order by checkDay desc";
                //console.log(sql);
                return DataBaseService.query(sql);
            }

        }
    });


