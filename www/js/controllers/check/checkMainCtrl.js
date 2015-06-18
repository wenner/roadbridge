angular.module('bridge').controller(
    'CheckMainCtrl',
    function ($scope, $rootScope, $stateParams, $ionicLoading, $ionicModal,
              $ionicTabsDelegate , $ionicPopover , $ionicActionSheet ,
              $timeout, $state, $location, $log , $ionicSideMenuDelegate ,
		BaseData , CheckService) {
		console.log("checkmain ctrl")
        //history
        $ionicModal.fromTemplateUrl("views/check/checkHistoryModal.html" , {
            scope: $scope
        }).then(function(modal) {
            $scope.historyModal = modal;
        });

        // .fromTemplateUrl() method
        $ionicPopover.fromTemplateUrl('views/check/mediamenu.html', {
            scope: $scope
        }).then(function(popover) {
            $scope.popover = popover;
        });

        $scope.historys = [];

        $scope.current = CheckService.current;
        $scope.currentStep = CheckService.getCurrentStep();
        $scope.result = CheckService.update();
        $scope.medias = CheckService.medias;

        //sidmenu toggle
        $scope.toggleSide = function() {
            $ionicSideMenuDelegate.toggleRight();
        };

        //goback
        $scope.goback = function(){
            history.back();
        }

        $scope.changeTab = function(){
            $scope.title = ["检查信息" , "现场照片"][$ionicTabsDelegate.selectedIndex()]
        }

        $scope.reSelect = function(item){
            CheckService.remove(item);
            $scope.result = CheckService.result;
            var currentStep = CheckService.getCurrentStep() ,
                stateParams = CheckService.getCurrentStateParams(currentStep);
            $state.go("check.content" , stateParams);
            CheckService.getHistorys()
                .then(function(items){
                    $scope.historys = items;
                })
        }

        $scope.$on('change', function(event , isEnd) {
            $scope.result = CheckService.result;
            $scope.currentStep = CheckService.currentStep;
            $scope.isEnd = isEnd;
            $ionicTabsDelegate.select(0);
            CheckService.getHistorys()
                .then(function(items){
                    $scope.historys = items;
                })
        });


        $scope.showMediaMenu = function(event){
            //$scope.popover.show(event)
            var hideSheet = $ionicActionSheet.show({
                buttons: [
                    {text: '<i class="icon ion-ios-camera"></i>拍摄照片' , code:"aaa" },
                    {text: '<i class="icon ion-ios-albums"></i>从相册获取照片' } ,
                    {text: '<i class="icon ion-ios-videocam"></i>拍摄视频'} ,
                    {text: '<i class="icon ion-ios-recording"></i>录音'}
                ],
                //destructiveText: '删除',
                //titleText: '添加媒体信息',
                cancelText: '取消',
                cancel: function() {
                    // add cancel code..
                },
                buttonClicked: function(index , btn) {
                    console.log(btn.text)
                }
            });
        }
        $scope.save = function(){
            var medias = CheckService.medias;
            if (medias.length == 0){
                alert("还没有上传图片!");
            }
            var data = {
                result: CheckService.result ,
                medias: medias
            };
            CheckService.save().then(function(){
                $scope.isEnd = false;
                $scope.reSelect("bujian");
            });
        }

        $scope.showHistoryModal = function(){
            $scope.historyModal.show();
        }

        $scope.edit = function(data){
            CheckService.reset(data);
            $scope.historyModal.hide();
            $scope.result = CheckService.result;
            var currentStep = CheckService.getCurrentStep() ,
                stateParams = CheckService.getCurrentStateParams(currentStep);
            $state.go("check.content" , stateParams);
            CheckService.getHistorys()
                .then(function(items){
                    $scope.historys = items;
                })
        }

        var add1 = function(){
            CheckService.add({name:"aaaa" , code:"road"})
            $scope.result = CheckService.update();
            CheckService.addMedia({name:"aaaa" , code:"road"})
            $scope.medias = CheckService.medias;
        }
        $scope.addPicture = function(el){
            var file = el.files.item(0);
            var reader = new FileReader();
            reader.onload = function(e){
                var img = {
                    name: file.name ,
                    code:"bridge" ,
                    type: file.type ,
                    size: file.size ,
                    result: e.target.result
                }
                CheckService.addMedia(img);
                $scope.medias = CheckService.medias;
            };
            //读取文件内容
            reader.readAsDataURL(file);
        }

        $scope.showBridgeDetail = function(){
            $state.go("bridgedetail" , {sn:$scope.current.bridge.sn})
        }
    }
);
