angular.module('bridge').controller(
    'CheckSwipeBaseinfoCtrl',
    function ($scope, $rootScope, $q, $stateParams, $ionicLoading, $ionicModal,
        $timeout, $state, $location, $log, $ionicPopup, $ionicPopover,
        $http,
        CheckSwipeService, $ionicScrollDelegate, 
        EnvService, MediaService, UserService) {
        //services
        var srv = CheckSwipeService;
        _.extend($scope, {
            current: srv.current,
            //病害列表
            diseases: [],
            //方向列表
            directions: [],

            //基础信息
            info: {
                road: "",
                bridge: "",
                task: "",
                direction: "",
                //暂时注释掉,因为异步并且值为中文,则不会选中select option , 在下面赋值的时候给info赋值
                //bujianGroup: "桥下检测",
                //weather: "晴",
                checkDept: "天津市交通科学研究院",
                checkUserName: UserService.info.name,
                checkDay: new Date()
            },

            /** 获取基础数据 */
            getBaseInfo: function () {
                //road
                srv.getRoads().then(function (items) {
                    $scope.roads = items;
                });
                //buweis
                srv.getBuweis().then(function (items) {
                    $scope.buweis = items;
                    $scope.info.bujianGroup = "桥下检测";
                });
                //weathers
                srv.getWeathers().then(function (items) {
                    $scope.weathers = items;
                    $scope.info.weather = '晴';
                });
            },
            //返回上页
            goBack: function () {
                history.back();
            },

            /** road onchange事件 */
            onRoadChange: function () {
                delete $scope.info.task;
                $scope.tasks = [];
                delete $scope.info.bridge;
                $scope.bridges = [];
                delete $scope.info.direction;
                delete $scope.info.bridgeRecord;
                delete $scope.info.hasDirection;
                if (!$scope.info.road) return;
                srv.getRoadById($scope.info.road).then(function (road) {
                    $scope.info.roadRecord = road;
                });
                //tasks
                srv.getTasksByRoad($scope.info.road).then(function (items) {
                    $scope.tasks = items;
                    if (items.length > 0) {
                        $scope.info.task = items[0].TaskInfoID;
                        $scope.onTaskChange();
                    }
                });
            },

            // task change事件
            onTaskChange: function () {
                delete $scope.info.bridge;
                $scope.bridges = [];
                delete $scope.info.direction;
                delete $scope.info.bridgeRecord;
                delete $scope.info.hasDirection;
                if (!$scope.info.task) return;
                srv.getTaskById($scope.info.task).then(function (task) {
                    $scope.info.taskRecord = task;
                });
                //bridges
                srv.getBridgesByTask($scope.info.task).then(function (items) {
                    $scope.bridges = items;
                    if (items.length > 0) {
                        $scope.info.bridge = items[0].id;
                        $scope.onBridgeChange();
                    }
                });
            },

            //bridge change 事件
            onBridgeChange: function () {
                if (!$scope.info.bridge) return;
                srv.getBridgeById($scope.info.bridge).then(function (bridge) {
                    $scope.info.bridgeRecord = bridge;
                    if (bridge.wayType == "double") {
                        $scope.info.hasDirection = bridge.wayType == "double";
                        srv.getDirections($scope.info.roadRecord, $scope.info.bridgeRecord).then(function (items) {
                            $scope.directions = items;
                            if (items.length > 0) $scope.info.direction = items[0].direction;
                        });
                        //$scope.directions = srv.getDirections($scope.info.roadRecord, $scope.info.bridgeRecord);
                    } else {
                        $scope.info.direction = "S";
                    }
                });
            },

            //确认基础信息后进行界面初始化
            onInfoSelect: function () {
                //需要初始化
                srv.resetCurrent();

                //设置基础信息
                $scope.current.setInfo($scope.info);

                $ionicLoading.show({ template: '读取项目病害信息...' })
                    .then($scope.getHistory)    //获取任务历史记录
                    .then(function(data){
                        return srv.insertTaskDisease(data.data);
                    }) //插入到本地数据库Disease
                    //.then($ionicLoading.hide)   //隐藏loading , 跳转
                    .then(function () {
                        $state.go("checkswipe.disease");
                    })
                    .catch(function (e) {
                        console.log(e)
                    })
                    .finally(function () {
                        $ionicLoading.hide();
                    })

            },
            /** 读取历史信息 */
            getHistory: function () {
                var params = {
                    roadId: $scope.info.road,
                    taskId: $scope.info.task,
                    bridgeId: $scope.info.bridge
                };
                return $http.get(
                    EnvService.api + "disease",
                    { params: params, timeout: 10000 }
                );
            }
        });


        $scope.getBaseInfo();
        $scope.$on('$ionicView.beforeEnter', function () {
            if (!$scope.current.isEmpty()) {
            }
        });
    }
);
