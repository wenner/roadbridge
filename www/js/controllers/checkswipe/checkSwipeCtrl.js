angular.module('bridge').controller(
    'CheckSwipeCtrl',
    function ($scope, $rootScope, $stateParams, $ionicLoading, $ionicModal,
              $ionicTabsDelegate , $ionicPopover , $ionicActionSheet ,
              $timeout, $state, $location, $log , $ionicSideMenuDelegate ,
			  $cordovaCapture , $cordovaCamera , $cordovaGeolocation ,
			  BaseData , CheckService) {


        //$scope.current = CheckService.current;
        //$scope.currentStep = CheckService.getCurrentStep();
        //$scope.result = CheckService.update();
        //$scope.medias = CheckService.medias;
		
		var s = [
			{name:"梁号" , code:"1" , value:"333" , width:80 ,
				items:["整梁" , "1#梁" , "2#梁" , "3#梁" , "4#梁" , "5#梁" , "6#梁" , "7#梁" , "8#梁" , "9#梁" , "10#梁"]

            } ,
			{name:"形式" , code:"2" , value:"333" , 
				items:["挂梁" , "悬臂梁" , "板梁" , "箱梁" , "T梁" , "小箱梁" , "钢箱梁" , "组合梁"]} , 
			{name:"板梁" , code:"3" , value:"333" , 
				items:["距6#墩" , "距7#墩" , "1/4跨" , "跨中" , "3/4跨"]} , 
			{name:"跨径" , code:"4" , value:"333" , 
				items:(function(){
					var rs  = [];
					for(var i =  1 ; i<=25; i++){
						rs.push(i)
					}
					return rs;
				})()
			} , 
			{name:"位置" , code:"5" , value:"333" ,
				items:["内测腹板" , "外侧腹板" , "底板" , "外侧翼板" , "内测翼板"]} , 
			{name:"分类" , code:"6" , value:"333" , 
				items:["砼缺陷" , "裂缝" , "钢筋锈蚀"]} , 
			{name:"类型" , code:"7" , value:"333" , 
				items:["网状龟裂" , "蜂窝" , "麻面" , "砼剥落" , "露筋" , "掉角" , "空洞" , "刮蹭"]} , 
			{name:"长" , code:"8" , value:"333" ,  width:60 ,
				items:(function(){
					var step = 0.1 , 
						rs = [];
					for(var i = 0.1 ; i<50 ; i=(i*10000000000000+step*10000000000000)/10000000000000){
						step = i<1 ? 0.1 : 1;
						rs.push(i);
					}
					return rs;
				})()
			} , 
			{name:"宽" , code:"9" , value:"333" , width:60 ,
				items:(function(){
					var step = 0.1 , 
						rs = [];
					for(var i = 0.1 ; i<50 ; i=(i*10000000000000+step*10000000000000)/10000000000000){
						step = i<1 ? 0.1 : 1;
						rs.push(i);
					}
					return rs;
				})()
			} , 
			{name:"评价" , code:"10" , value:"333" , width:60 ,
				items:[1,2,3,4]}
		]

        _.each(s , function(n){
            n.trans = {form:0 , duration:0};
        })

		$scope.s  = s;

        //goback
        $scope.goback = function(){
            history.back();
        }

		$scope.showdrag = function(){
			console.log("drag")
		}

        $scope.testWatch = function(){
            $scope.s[0].items = _.range(1 , _.random(10 , 50))
        }

        $scope.showClick = function(col){
            alert(col.code)
        }
    }
);
