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
                        items:[]
                    };
                });

                //设置部位ID
                current.set('buwei' , bujian.buweiId);
                return getColumnsBeforeCategory()
                    .then(function(items){
                        beforeColumns=items;
                    })
                    .then(setFixedColumns)
                    .then(setItemDataByType)
                    .then(setCustomChanges)
                    .then(sendChange);
            }
        };


        function getColumnsBeforeCategory(){
            var fieldSql="select * from diseaseField where bujianId = ? and position = 'before' order by ix";
            return DataBaseService.query(fieldSql , [bujian.value])
        }

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

        function setItemDataByType(){
            beforeColumns=columnUtilService.getFieldItemDataByType(beforeColumns);
        }

        function setCustomChanges(){
            var defer=$q.defer();
            //promise Functions
            var promiseFns={};
            _.each(beforeColumns , function(n , i){
                var fieldCode=n.code;
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

        function sendChange(){
            changes=_.extend(resetColumns , changes);
            return changes;
        }



});