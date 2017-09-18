angular.module('bridge').controller(
    'CheckSwipeDiseaseCtrl',
    function ($scope, $rootScope, $q, $stateParams, $ionicLoading, $ionicModal,
        $timeout, $state, $location, $log, $ionicPopup, $ionicPopover,
        CheckSwipeService, $ionicScrollDelegate,
        EnvService, MediaService, UserService) {
        //services
        var srv = CheckSwipeService;

        //main popovermenu
        $ionicPopover.fromTemplateUrl('views/checkswipe/menu.html', {
            scope: $scope
        }).then(function (popover) {
            $scope.mainPopoverMenu = popover;
        });

        _.extend($scope, {
            current: srv.current,
            /** 病害列表*/
            diseases: [] ,

            //预览信息
            preview: {},

            bujianSns: null,
            bujians: null,

            //显示弹出菜单
            showMainPopoverMenu: function (event) {
                $scope.mainPopoverMenu.show(event);
            },

            //选中某一个item
            changeCol: function (coldata) {
                var code = coldata.code;
                var itemData = coldata.items[coldata.activeIndex];
                $scope.current.set(code, {
                    value: coldata.value,
                    record: itemData
                });
                switch (coldata.code) {
                    case "bujianSn":
                        $scope.getDiseases();
                        break;
                    case "bujian":
                        $scope.getDiseases();
                        break;
                }
            },
            //返回上页
            goBack: function () {
                history.back();
            },
            //获取病害记录
            getDiseases: function () {
                srv.getDiseases().then(function (items) {
                    var bujianSn = $scope.current.bujianSn.value;
                    var bujianId = $scope.current.bujian.value;

                    //设置部件的badge
                    var snGroups = _.groupBy(items, "bujianSn");
                    _.each($scope.bujianSns.items, function (item, i) {
                        item.badge = 0;
                        var group = snGroups[item.value];
                        if (group) {
                            item.badge = group.length;
                        }
                    });
                    //设置孔,联的badge
                    var bjGroups = _.groupBy(_.filter(items, "bujianSn", bujianSn), "bujianId");
                    _.each($scope.bujians.items, function (item, i) {
                        item.badge = 0;
                        var group = bjGroups[item.value];
                        if (group) {
                            item.badge = group.length;
                        }
                    });

                    //获取当前选中部件的记录
                    $scope.diseases = _.filter(items, "bujianSn", $scope.current.bujianSn.value);


                });
            },


            //修改
            editDisease: function (disease) {
                $scope.editValues = disease;
                //获取标度
                srv.getEvaluatesByQualitative(disease)
                    .then(function (items) {
                        $scope.editEvaluates = items;
                    });
                //获取字段
                srv.getEditFields(disease)
                    .then(function (items) {
                        $scope.editFields = items;
                    })

                if (!$scope.editModal) {
                    $ionicModal.fromTemplateUrl("views/checkswipe/editModal.html", {
                        scope: $scope
                    }).then(function (modal) {
                        $scope.editModal = modal;
                        $scope.editModal.show();
                    });
                } else {
                    $scope.editModal.show();
                }

            },
            //保存修改信息
            saveEditDisease: function () {
                console.log(this.editValues);
                //生成content

                //保存


            },

            //删除
            deleteDisease: function (disease) {
                var confirmPopup = $ionicPopup.confirm({
                    title: '<b>确认删除</b>',
                    template: '当前操作将删除该病害,不可恢复 , 是否继续删除?',
                    cancelText: "取消",
                    okText: "确认删除",
                    okType: "button-assertive"
                });
                confirmPopup.then(function (res) {
                    if (res) {
                        srv.deleteDisease(disease).then(function () {
                            $scope.getDiseases();
                        }, function (errors) {
                            alert(errors.join("\n"));
                        })
                    } else {
                    }
                });
            }
        });

       // $scope.$on('$ionicView.beforeEnter', function () {
            if ($scope.current.isEmpty()) {
                $state.go("checkswipe.baseinfo");
            } else {
                //isInit = $stateParams.init == "1";
                //if (!isInit) return;
                //获取部件号(孔/联) , 先获取bujiansn , 再获取bujian , 不然Change哪里可能会出现问题
                srv.getBujianSns()
                    .then(function (items) {
                        $scope.bujianSns = {
                            name: "部件号", code: "bujianSn", items: items
                        };
                        srv.bujianSns = items;
                    })
                    //获取部件类型
                    .then(srv.getBujians)
                    .then(function (items) {
                        items = _.map(items, function (n) {
                            return _.extend(n, { value: n.id });
                        });
                        $scope.bujians = {
                            name: "部件", code: "bujian", items: items
                        };
                    });
            }
        //});

    }
);
