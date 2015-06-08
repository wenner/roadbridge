'use strict';
angular.module('bridge.services')
    .factory('CheckService', function($log , BaseData) {
        var current = {
		};
        var result = [
            //{name:"xxx" , value:"xxx" , nextstep:"xxx"}
        ];
        var images = [
            {name:"ssss"}
        ];
        var currentStepCode;

        var stepMaps = {};
        _.forEach(BaseData.steps, function(n){
            stepMaps[n.code] = n;
        });

        return {
			current: current ,
            result: result ,
            stepInfo: null ,
            currentStepCode: "bridge" ,
            /***
             * 根据result获取当前步骤信息
             * @returns {
             *      prevStepValue ,
             *      currentStep ,
             *      nextStepCode
             * }
             */
            getStateSteps: function(){
                var rs = {};
                var steps = BaseData.steps;
                var prevStepValue , nextStepCode , currentStep;
                //获取当前要操作的节点信息
                if (result.length == 0){
                    //如果result为空 , 则直接从step中选择bridge节点为当前节点
                    currentStep = steps[0];
                }else{
                    //否则通过最后一个节点的nextstep来获取当前节点
                    var lastResult = _.last(result);
                    prevStepValue = lastResult.value;
                    currentStep = _.find(steps , function(item){
                        return item.code == lastResult.nextstep;
                    });
                }

                //获取nextstep的代码 , 需要写到本步骤选中的内容到result
                if (!currentStep.nextstep){
                    var index = _.findIndex(steps, function(item) {
                        return item.code == currentStep.code;
                    });
                    if (index+1 < steps.length) nextStepCode = steps[index+1].code;
                }else{
                    nextStepCode = currentStep.nextstep;
                }

                rs.currentStep = currentStep;
                rs.nextStepCode = nextStepCode;
                rs.prevStepValue = prevStepValue;

                //获取连接的参数信息 , 需要获取当前节点的代码 , 以及模板url
                var stateParams = {} ,
                    template = currentStep.template ,
                    url;
                if (template){
                    if (_.isFunction(template)){
                        url = template(current , currentStep , result);
                    }else if (_.isString(template)){
                        url = template;
                    }else if (_.isObject(template)){

                    }
                    stateParams = {
                        url: url ,
                        code: currentStep.code
                    }
                }

                //获取controller
                var ctrl = "" ,
                    controller = currentStep.controller;
                if (controller){

                }


                /*
                //获取对应的的items,放到scope中
                var nodes = currentStep.nodes ,
                    nodeKey = currentStep.nodeKey ,
                    nodeKeyValue = prevStepValue;
                if (nodes){
                    if (nodeKey){
                        var nodeKeys = nodeKey.split(".");
                        if (nodeKeys.length == 1) nodeKeys.push("value");
                        var nodeKeyStep = _.find(CheckService.result , function(n){
                            return n.code == nodeKeys[0];
                        });
                        if (nodeKeyStep) nodeKeyValue = nodeKeyStep[nodeKeys[1]];
                    }
                    console.log(nodeKeyValue)
                    var currentNodes = nodes[nodeKeyValue];
                    currentItems = _.clone(currentNodes.items);
                }


                //获取该step的列表信息
                var currentItems = [] , items = currentStep.items;
                if (items){
                    var _items;
                    //解析items
                    if (_.isArray(items)){  //数组
                        _items = items;
                    }else if (_.isString(items)){ //字符串
                        _items = BaseData[items];
                    }else if (_.isObject(items)){ //object
                        switch (items.type){
                            case 'ranger':
                                var rangers = [] ,
                                    min = items.min || 1 ,
                                    max = items.max ,
                                    step = items.step || 1 ,
                                    unit = items.unit || "" ,
                                    template = _.template(items.template || "第 <%=index%> "+unit);
                                //min , max , step , unit
                                for(var ri = min ; ri<= max ; ri = ri+step){
                                    rangers.push({name:template({
                                        index:ri
                                    }) , value:ri});
                                }
                                _items = rangers;
                                break;
                        }
                    }
                    currentItems =  _.clone(_items);

                }

                //写入nextstep
                _.forEach(currentItems , function(n){
                    n.nextstep = n.nextstep || currentStep.nextstep || stepInfo.nextStepCode;
                });
                */

                rs.stateParams = stateParams;
                this.stepInfo = rs;
                return rs;
            } ,
            getStateParams: function(){
                var params = {};
                var stepInfo = this.getStateSteps();
                if (stepInfo.currentStep.template){
                    params = {
                        url: stepInfo.currentStep.template ,
                        code: stepInfo.currentStep.code
                    }
                    return params;
                }

                var steps = BaseData.steps;
                var _current = current;
                var result = [];
                var lastStepCode;
                for(var i = 0 ; i<steps.length ; i++){
                    var step = steps[i];
                    var code = step.code;
                    var currentItem = _current[code];
                    if (currentItem && currentItem.value){
                        //result.push({code:code , value:currentItem.value});
                        result.push(step.nodes ? currentItem.value : code);
                    }else{
                        lastStepCode = code;
                        //this.currentStepCode = code;
                        break;
                    }
                }
                console.log(result , lastStepCode)
                var url = result.join("-") + (result.length == 0 ? '' : '-') + lastStepCode;
                return {
                    url: url ,
                    code: lastStepCode
                };
            } ,
            update: function(){
                var rs = _.clone(result);
                _.forEach(rs , function(n){
                    n.item_name = stepMaps[n.code].name;
                });
                return rs;
            } ,
            add: function(data){
                current[data.code] = data;
                var item = _.find(result, function(item) {return item.code == data.code});
                if (item){
                    item = _.extend(item , data);
                }else{
                    result.push(data);
                }
            } ,
            remove: function(item){
                var index = _.indexOf(result , item);
                _.remove(result , function(n , i){
                    return i >= index;
                })
            } ,

            getImages: function(){
                return images;
            }
        };
    });
