'use strict';
angular.module('bridge.services')
.factory('columnByBujianService' ,
    function($q , $http , $log , $util ,
             EnvService , DataBaseService ,
             columnUtilService){
        var promiseFunctions={
            formal:function(field){
                return DataBaseService
                    .query(
                        "select * from goujian where uStatus = 'able' and bujianId = ? order by id" ,
                        [current.bujian.value]
                    ).then(function(items){
                        field.items=_.map(items , function(n){
                            return _.extend(n , {name:n.name , value:n.id});
                        });
                        return field;
                    });
            }
        };

        var current , cols , bujian , bujianSn , changes , srv;
        var resetColumns , beforeColumns;
        return {
            getChanges:function(c , cs , s){
                srv=s;
                current=c;
                cols=cs;
                bujian=current.bujian.record;
                bujianSn=current.bujianSn.record;
                changes={};

                //初始化所有的列
                resetColumns={};
                _.each(cols , function(n , i){
                    resetColumns[i]={
                        code:"code"+i ,
                        hidden:true ,
                        value:null ,
                        type:"" ,
                        description: "" ,
                        width:0,
                        items:[]
                    };
                });

                //设置部位ID
                current.set('buwei' , bujian.buweiId);
                
                //获取columnchanges
                return getColumnsBeforeCategory()   //获取before列
                    //.then(function(items){beforeColumns=items;})
                    .then(setFixedColumns)          //插入固定列
                    .then(setItemDataByType)        //根据column type 更新列Items
                    .then(setCustomChanges)         //更新自定义列Items
                    .then(sendChange);              //返回changes
            }
        };

        /** 获取当前部件的before列 */
        function getColumnsBeforeCategory(){
            var fieldSql="select * from diseaseField where bujianId = ? and position = 'before' order by ix";
            return DataBaseService.query(fieldSql , [bujian.value]).then(function(items){
                beforeColumns = items;
            });
        }
        
        /** 插入固定的列 */
        function setFixedColumns(){
            if(beforeColumns.length>0){
                resetColumns[cols.length-1]={
                    name:"标度" ,
                    code:"diseaseEvaluate" ,
                    hidden:false
                };
                //加入病害类型,定性描述
                beforeColumns=beforeColumns.concat([
                    {name:"病害类型" , code:"diseaseCategory" , width:140 , items:[] , value:null} ,
                    {name:"定性描述" , code:"diseaseQualitative" , width:140 , items:[] , value:null}
                    //{name:"评价" , code:"diseaseEvaluate"}
                ]);
            }
        }

        /** 根据column type更新列的值得 */
        function setItemDataByType(){
            beforeColumns=columnUtilService.getFieldItemDataByType(beforeColumns);
        }
        
        /** 更新自定义列Items */
        function setCustomChanges(){
            var defer=$q.defer();
            //promise Functions
            var promiseFns={};
            _.each(beforeColumns , function(n , i){
                var fieldCode=n.code;
                //if (!n.type) n.type = "";
                //if (!n.width) n.width = 0;
                n.hidden=false;
                n.value=null;
                if(!n.items) n.items=[];
                if(promiseFunctions[fieldCode]){
                    promiseFns[i]=promiseFunctions[fieldCode](n);
                }else{
                    changes[i]=n;
                }
            });
            if (_.isEmpty(promiseFns)) {
                defer.resolve();
            }else{
                $q.all(promiseFns).then(function(rs){
                    _.each(rs , function(n , key){                        
                        changes[key]=n;
                    });
                    defer.resolve(changes);
                });
            }
            return defer.promise;
        }

        /** 返回值 */
        function sendChange(){
            changes=_.extend(resetColumns , changes);
            _.each(changes , function(n){
                //if (!n.type) n.type = "swipe";
            });
            return changes;
        }



});