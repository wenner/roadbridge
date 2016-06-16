angular.module('bridge').controller(
    'CheckSwipeCtrl',
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


        //save , preview modal
        $ionicModal.fromTemplateUrl("views/checkswipe/previewModal.html", {
            scope: $scope,
            animation: "mh-slide",
            backdropClickToClose: false
        }).then(function (modal) {
            $scope.previewModal = modal;
        });


        _.extend($scope, {
            current: srv.current,
            //病害列表
            diseases: [],
            //病害列表
            directions: [],
            //媒体列表
            medias: srv.medias,
            //预览信息
            preview: {},

            currentColumn: {},

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
            //显示弹出菜单
            showMainPopoverMenu: function (event) {
                $scope.mainPopoverMenu.show(event);
            },
            //返回上页
            goBack: function () {
                history.back();
            },
            //初始化
            initInfo: function () {
                /*
                srv.getRoadById($scope.info.road).then(function (road) {
                    $scope.info.roadRecord = road;
                });
                srv.getBridgeById($scope.info.bridge).then(function (bridge) {
                    $scope.info.bridgeRecord = bridge;
                    if (bridge.wayType == "double") {
                        $scope.info.hasDirection = bridge.wayType == "double";
                        srv.getDirections($scope.info.roadRecord, $scope.info.bridgeRecord).then(function (items) {
                            $scope.directions = items;
                        });
                        //$scope.directions = srv.getDirections($scope.info.roadRecord, $scope.info.bridgeRecord);
                    } else {
                        $scope.info.direction = "S";
                    }
                });
                */
            },
            //显示基础信息窗口
            showInfoModal: function () {
                if (!$scope.infoModal) {
                    $ionicModal.fromTemplateUrl("views/checkswipe/infoModal.html", {
                        scope: $scope,
                        backdropClickToClose: false
                    }).then(function (modal) {
                        $scope.infoModal = modal;
                        $scope.infoModal.show();
                    });
                } else {
                    $scope.infoModal.show(); y
                }
            },
            //重新选择,显示信息选择窗口
            reSelectInfo: function () {
                $scope.infoModal.show();
            },
            //road onchange事件
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
            //task change事件
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
                $scope.bujianSns = null;
                $scope.bujians = null;
                $scope.pickerColumns = srv.getPickerColumns();
                srv.resetCurrent();


                //设置基础信息
                $scope.current.setInfo($scope.info);
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
                $scope.infoModal.hide();
            },

            //点击表头
            onHeaderClick: function (col) {
                //标度
                if (col.code == "diseaseEvaluate") {
                    $scope.onDiseaseEvaluateHeaderClick();
                    return;
                }
                //锁定
                if (col.allowLock == "1") {
                    $scope.onHeaderLockClick(col);
                    return;
                }
                //类型
                var type = col.type;
                if (!type) return;
                $scope.currentColumn = col;
                var method = "on" + _.capitalize(type) + "HeaderClick";
                if ($scope[method]) {
                    $scope[method](col);
                }
            },
            onDiseaseEvaluateHeaderClick: function () {
                $scope.diseaseEvaluates = [];
                srv.getDiseaseEvaluates()
                    .then(function (rs) {
                        $scope.diseaseEvaluates = rs.evaluates;
                        $scope.diseaseEvaluateGroups = rs.groups.concat(rs.self);
                    });
                if (!$scope.dieaseEvaluateModal) {
                    $ionicModal.fromTemplateUrl("views/checkswipe/diseaseEvaluateModal.html", {
                        scope: $scope
                    }).then(function (modal) {
                        $scope.dieaseEvaluateModal = modal;
                        $scope.dieaseEvaluateModal.show();
                    });
                } else {
                    $scope.dieaseEvaluateModal.show();
                }
            },
            onHeaderLockClick: function (col) {
                col.isLocked = !col.isLocked;
                if (col.code && $scope.current[col.code]) {
                    $scope.current[col.code].value = col.isLocked ? "" : col.value;
                }
                $scope.getContent();
            },
            onTextHeaderClick: function (col) {
                if (!$scope.headerModal) {
                    $ionicModal.fromTemplateUrl("views/checkswipe/headerModal.html", {
                        scope: $scope,
                        backdropClickToClose: false
                    }).then(function (modal) {
                        $scope.headerModal = modal;
                        $scope.headerModal.show();
                    });
                } else {
                    $scope.headerModal.show();
                }
            },

            saveHeaderContent: function () {
                var code = $scope.currentColumn.code,
                    value = $scope.currentColumn.value;
                $scope.current.set(code, {
                    value: value
                });
                $scope.currentColumn = {};
                $scope.headerModal.hide();
                $scope.getContent();
            },

            //选中某一个item
            changeCol: function (coldata) {
                var promise;
                var code = coldata.code;
                //console.log("change " + code);
                var itemData = coldata.items[coldata.activeIndex];
                $scope.current.set(code, {
                    value: coldata.value,
                    record: itemData
                });
                switch (coldata.code) {
                    case "bujianSn":
                        promise = $scope.changeColumnsByBujianSn()
                            .then($scope.getDiseases);
                        break;
                    case "bujian":
                        promise = $scope.changeColumnsByBujian()
                            .then($scope.changeColumnsByBujianSn)
                        //.then($scope.getDiseases);
                        break;
                    default:
                        promise = $scope.changeColumnsByPick(code);
                        break;
                }

                promise.then($scope.getContent());
            },
            getContent: function () {
                srv.getContent()
                    .then(function (content) {
                        $scope.current.content.value = content;
                    })
            },

            /**  */
            applyChanges: function (changes) {
                if (changes) {
                    _.each(changes, function (n) {
                        if (n.code && $scope.current[n.code] && $scope.current[n.code].value) {
                            $scope.current[n.code].value = "";
                        }
                        if (!n.type) n.type = "swipe";
                    });
                }

                if (!$scope.$$phase) {
                    $scope.$apply(function () {
                        _.each(changes, function (n, index) {
                            _.extend($scope.pickerColumns[index], n);
                        });
                    });
                } else {
                    _.each(changes, function (n, index) {
                        _.extend($scope.pickerColumns[index], n);
                    });
                }


            },
            changeColumnsByBujian: function () {
                return srv.getColumnsByBujian($scope.pickerColumns)
                    .then($scope.applyChanges);
            },
            changeColumnsByBujianSn: function () {
                return srv.getColumnsByBujianSn($scope.pickerColumns)
                    .then($scope.applyChanges);
            },
            changeColumnsByPick: function (code) {
                return srv.getColumnsByPick($scope.pickerColumns, code)
                    .then(function (changes) {
                        //console.log(code , changes);
                        if (changes) $scope.applyChanges(changes);
                    });
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


            //显示拍照的menu
            showMediaMenu: function (event) {

                $scope.forMedia = true;
                return;

                var hideSheet = $ionicActionSheet.show({
                    buttons: [
                        { text: '<i class="icon ion-ios-camera"></i>拍摄照片', code: "camera" },
                        { text: '<i class="icon ion-ios-albums"></i>从相册获取照片', code: "album" },
                        { text: '<i class="icon ion-ios-videocam"></i>拍摄视频', code: "video" },
                        { text: '<i class="icon ion-ios-recording"></i>录音', code: "audio" }
                    ],
                    //destructiveText: '删除',
                    //titleText: '添加媒体信息',
                    cancelText: '取消',
                    cancel: function () {
                        // add cancel code..
                    },
                    buttonClicked: function (index, btn) {
                        var fn = $scope["get" + _.capitalize(btn.code)];
                        if (fn && _.isFunction(fn)) {
                            fn();
                        }
                        return true;
                    }
                });
            },

            hideMediaMenu: function () {
                $scope.forMedia = false;
                srv.clearMedias();
            },
            addMedia: function (media) {
                //$scope.$apply(function () {
                $scope.medias.push(media);
                //});
            },
            //拍照
            captureImage: function () {
                MediaService.captureImage().then(function (files) {
                    var file = files[0];
                    var media = { path: file.fullPath, type: "image" };
                    $scope.addMedia(media);
                    //var media = {path: file,type: "image"};
                    //$scope.addMedia(media);
                }, function (err) {
                    console.log(err)
                });
            },
            //从相册获取照片
            captureAlbum: function () {
                MediaService.captureAlbum().then(function (file) {
                    var media = { path: file, type: "image" };
                    $scope.addMedia(media);
                });
            },
            //录音
            captureAudio: function () {
                MediaService.captureAudio().then(function (files) {
                    var file = files[0];
                    var media = { path: file.fullPath, type: "audio" };
                    $scope.addMedia(media);
                });
            },
            //摄像
            captureVideo: function () {
                MediaService.captureVideo().then(function (files) {
                    var file = files[0];
                    var media = { path: file.fullPath, type: "video" };
                    $scope.addMedia(media);
                });
            },
            //全屏查看图片,视频
            showMediaView: function (index) {
                $scope.activeSlide = index;
                $ionicModal.fromTemplateUrl("views/checkswipe/mediaView.html", {
                    scope: $scope,
                    animation: 'slide-in-up'
                }).then(function (modal) {
                    $scope.modal = modal;
                    $scope.modal.show();
                });
            },
            //关闭全屏查看
            closeMediaView: function () {
                $scope.modal.hide();
                $scope.modal.remove();
            },
            //预览
            previewBeforeSave: function () {
                $scope.preview = {
                    beforeSave: true,
                    content: $scope.current.content.value,
                    medias: $scope.medias
                };
                $scope.previewModal.show();
            },
            hidePreview: function () {
                $scope.previewModal.hide();
            },
            //查看病害信息
            previewDisease: function (disease) {
                $scope.preview = {
                    beforeSave: false,
                    content: disease.content,
                    medias: []
                };
                $scope.previewModal.show();
            },
            //保存
            save: function () {
                $scope.hidePreview();
                srv.getValues()
                    .then(srv.save)
                    .then(function () {
                        console.log("save ok");
                        $scope.forMedia = false;
                        srv.clearMedias();
                        //$scope.medias = [];
                        //$cordovaToast.show('保存成功!');
                        $scope.getDiseases();
                        setTimeout(function () {
                            $ionicScrollDelegate.$getByHandle('diseaselist')
                                .scrollBottom();
                        }, 500)
                    }, function (msg) {
                        alert(msg)
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


        $scope.getBaseInfo();
        $scope.initInfo();
        $scope.$on('$ionicView.beforeEnter', function () {
            if ($scope.current.isEmpty()) $scope.showInfoModal();
        });


    }
);
