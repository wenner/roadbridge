angular.module('bridge').controller(
    'DiseaseCtrl',
    function ($scope, $rootScope, $stateParams, $ionicLoading, $ionicModal, $timeout, $state, $location, $log) {

        $log.debug('disease ctrl', $stateParams);

		$scope.diseases = [
			{title:'1-1# 麻面' , area:40} , 
			{title:'1-2# 麻面' , area:50}	
		];
		
		$scope.change1 = function(){
			$scope.t1 = $scope.t1 == 'a1' ? 'a2' : 'a1';
		}

		$scope.change2 = function(){
			$scope.t2 = $scope.t2 == 'a3' ? 'a4' : 'a3';
		}
		
		$scope.t1 = 'a1';
		$scope.t2 = 'a3';
    }
);
