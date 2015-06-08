angular.module('bridge').controller(
    'CheckSelectorCtrl',
    function ($scope, $rootScope, $stateParams, $ionicLoading, $ionicModal,
              $timeout, $state, $location, $log , $ionicSideMenuDelegate ,
		BaseData , CheckService) {
        console.log("checkmain ctrl")

        //桥梁列表
        $scope.bridges = BaseData.bridges;
        //部位列表
        $scope.buweis = BaseData.buweis;
        //部件
        $scope.bujians = BaseData.bujians;

        $scope.current = CheckService.current;


        var getNextStepCode = function(item , stepInfo){
            var sc = item.nextstep || stepInfo.nextStepCode;
            if (_.isString(sc)){
                return sc;
            }else if (_.isFunction(sc)){
                return sc(CheckService.current , stepInfo);
            }
        }

        var getItemsFromNode = function(data , current){
            var nodes = data.nodes ,
                nodeKey = data.nodeKey ,
                nodeKeyValue = "default" ,
                items;
            console.log(data)
            if (nodes){
                //通过NodeKey, 获取nodes中对应的Key值
                if (nodeKey){
                    nodeKeys = nodeKey.split(".");
                    if (nodeKeys.length == 1) nodeKeys.push("value");
                    var nodeKeyStep = current[nodeKeys[0]];
                    if (nodeKeyStep) nodeKeyValue = nodeKeyStep[nodeKeys[1]];
                }
                var currentNode = nodes[nodeKeyValue] || nodes["default"];
                items = getItemsFromNode(currentNode , current);
            }else if (data.items){
                items = data.items;
            }
            return items ? _.clone(items) : items;
        }

        $scope.$on('$ionicView.beforeEnter', function(){
            var stepInfo = CheckService.getStateSteps() ,
                stateParams = stepInfo.stateParams;
            if ($stateParams.url == stateParams.url && $stateParams.code == stateParams.code){
                //获取step信息
                var currentStep = stepInfo.currentStep;

                CheckService.currentStepCode = currentStep.code;

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
                                    template = _.template(items.template || "第 {{index}} "+unit);
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
                }else{
                    //根据上一步的值获取nodes中的items
                    var nodeItems = getItemsFromNode(currentStep , CheckService.current);
                    if (nodeItems) currentItems = nodeItems;
                }

                /*
                var nodes = currentStep.nodes ,
                    nodeKey = currentStep.nodeKey ,
                    nodeKeyValue = stepInfo.prevStepValue;
                if (nodes){
                    if (nodeKey){
                        nodeKeys = nodeKey.split(".");
                        if (nodeKeys.length == 1) nodeKeys.push("value");
                        var nodeKeyStep = _.find(CheckService.result , function(n){
                            return n.code == nodeKeys[0];
                        });
                        if (nodeKeyStep) nodeKeyValue = nodeKeyStep[nodeKeys[1]];
                    }
                    var currentNodes = nodes[nodeKeyValue];
                    currentItems = _.clone(currentNodes.items);
                }
                */


                //写入nextstep
                _.forEach(currentItems , function(n){
                    if (!n.value) n.value = n.name;
                    n.nextstep = getNextStepCode(n , stepInfo);
                });
                $scope.currentItems = currentItems;
                $scope.title = currentStep.title || "请选择"+currentStep.name;
            }else{
                $state.go("check.content" , stateParams);
            }
        });

        $scope.commonSelect = function(item){
            CheckService.add(_.extend({
                code: CheckService.currentStepCode ,
                value: item.value || item.name
            } , item));
            var stepInfo = CheckService.getStateSteps();
            var sp = stepInfo.stateParams;
            console.log("选择后跳转" , sp.url , sp.code);
            $state.go("check.content" , sp);
            $scope.$emit('change');
        }

    }
);
