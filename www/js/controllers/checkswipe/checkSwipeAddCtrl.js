angular.module('bridge').controller(
    'CheckSwipeAddCtrl',
    function ($scope, $rootScope, $q, $stateParams, $ionicLoading, $ionicModal,
        $timeout, $state, $location, $log, $ionicPopup, $ionicPopover,
        CheckSwipeService, $ionicScrollDelegate,
        EnvService, MediaService, UserService) {
        //services
        var srv = CheckSwipeService;


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

            //媒体列表
            medias: srv.medias,
            //预览信息
            preview: {},

            currentColumn: {},

            
            pickerColumns: srv.getPickerColumns() ,

            //返回上页
            goBack: function () {
                history.back();
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
                        history.back();
                        //$scope.medias = [];
                        //$cordovaToast.show('保存成功!');
                        /*
                        $scope.getDiseases();
                        setTimeout(function () {
                            $ionicScrollDelegate.$getByHandle('diseaselist')
                                .scrollBottom();
                        }, 500)
                        */
                    }, function (msg) {
                        alert(msg)
                    });
            }

        });

        $scope.$on('$ionicView.beforeEnter', function () {
            if ($scope.current.isEmpty()) {
                $state.go("checkswipe.baseinfo");
            } else {

                $scope.changeColumnsByBujian()
                    .then($scope.changeColumnsByBujianSn)
                    .then($scope.getContent)
            }
        });


    }
);
