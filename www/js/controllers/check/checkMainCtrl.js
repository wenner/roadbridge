angular.module('bridge').controller(
    'CheckMainCtrl',
    function ($scope, $rootScope, $stateParams, $ionicLoading, $ionicModal,
              $ionicTabsDelegate , $ionicPopover , $ionicActionSheet ,
              $timeout, $state, $location, $log , $ionicSideMenuDelegate ,
			  $cordovaCapture , $cordovaCamera , $cordovaGeolocation ,
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
                    {text: '<i class="icon ion-ios-camera"></i>拍摄照片' , code:"camera"},
                    {text: '<i class="icon ion-ios-albums"></i>从相册获取照片' , code:"album"} ,
                    {text: '<i class="icon ion-ios-videocam"></i>拍摄视频' , code:"video"} ,
                    {text: '<i class="icon ion-ios-recording"></i>录音' , code:"audio"}
                ],
                //destructiveText: '删除',
                //titleText: '添加媒体信息',
                cancelText: '取消',
                cancel: function() {
                    // add cancel code..
                },
                buttonClicked: function(index , btn) {
					var fn = $scope["get"+_.capitalize(btn.code)];
                    if (fn && _.isFunction(fn)){
						fn();
                    }
					return true;
                }
            });
        }
		$scope.getCamera = function(){

			var options = { limit: 3, duration: 10 };
			$cordovaCapture.captureImage(options).then(function(imageData) {
				console.log(imageData)
			  // Success! Audio data is here
			}, function(err) {
			  // An error occurred. Show a message to the user
			});
		}

		$scope.getAlbum = function(){
		  var posOptions = {timeout: 10000, enableHighAccuracy: false};
		  console.log(posOptions)
		  $cordovaGeolocation
			.getCurrentPosition(posOptions)
			.then(function (position) {
			  var lat  = position.coords.latitude
			  var long = position.coords.longitude
				  console.log(position)
			}, function(err) {
			  // error
			});

		    var options = {
			  destinationType: Camera.DestinationType.FILE_URI,
			  sourceType: Camera.PictureSourceType.CAMERA,
				  allowEdit: true
			};

			$cordovaCamera.getPicture(options).then(function(imageURI) {
				console.log(arguments)
                var img = {
                    //name: file.name ,
                    //code:"bridge" ,
                    //type: file.type ,
                    //size: file.size ,
                    result: imageURI
                }
                CheckService.addMedia(img);
                $scope.medias = CheckService.medias;
			  
			  //image.src = imageURI;
			}, function(err) {
			  // error
			});
		}

		$scope.getAudio = function(){
		    var options = { limit: 3, duration: 10 };
			$cordovaCapture.captureAudio(options).then(function(audioData) {
				console.log(audioData)
			  // Success! Audio data is here
			}, function(err) {
			  // An error occurred. Show a message to the user
			});
		}
		$scope.getVideo = function(){
			var options = { limit: 3, duration: 15 };

			$cordovaCapture.captureVideo(options).then(function(videoData) {
				console.log(videoData)
			}, function(err) {
			  // An error occurred. Show a message to the user
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
