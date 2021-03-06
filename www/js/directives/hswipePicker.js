'use strict';
angular.module('bridge')
    .directive('hswipepicker', function ($ionicGesture) {
        return {
            restrict: 'A',
			scope: {
				pickerdata:"=" ,
                changecol:"&"
			} ,
            templateUrl:"views/checkswipe/row.html" ,
            controller: function ($scope, $element , $ionicSlideBoxDelegate) {
                var scope = $scope , elem = $element;
                //$scope.pickerdata.trans = {};
                var pickerdata = $scope.pickerdata ,
                    trans = $scope.pickerdata.trans || {} ,
                    container = elem[0];
                $scope.col = {
                    container: container ,
                    wrapper: container.children[0] ,
                    items: container.children[0].children ,
                    attrs: {}
                };
                var col = $scope.col;

                $scope.$watch("pickerdata.items", function() {
                    scope.calcSize();
                    $scope.pickerdata.value = null;
                    $scope.setValue("" , 0);
                    /*
                    trans.form = maxTranslate;
                    trans.duration = 300;
                    transform(col.wrapper , 'translate3d(' + maxTranslate + 'px,0,0)');
                    transition(col.wrapper , 0);
                    */
                });
                var transform = function (el , transform) {
                    var el = angular.element(el);
                    for (var i = 0; i < el.length; i++) {
                        var elStyle = el[i].style;
                        elStyle.webkitTransform
                            = elStyle.MsTransform
                            = elStyle.msTransform
                            = elStyle.MozTransform
                            = elStyle.OTransform
                            = elStyle.transform
                            = transform;
                    }
                    return this;
                };
                var transition = function (el , duration) {
                    var el = angular.element(el);
                    if (typeof duration !== 'string') {
                        duration = duration + 'ms';
                    }
                    for (var i = 0; i < el.length; i++) {
                        var elStyle = el[i].style;
                        elStyle.webkitTransitionDuration = elStyle.MsTransitionDuration = elStyle.msTransitionDuration = elStyle.MozTransitionDuration = elStyle.OTransitionDuration
                            = elStyle.transitionDuration = duration;
                    }
                    return this;
                };
                var cancelAnimationFrame = function (id) {
                    if (window.cancelAnimationFrame) return window.cancelAnimationFrame(id);
                    else if (window.webkitCancelAnimationFrame) return window.webkitCancelAnimationFrame(id);
                    else if (window.mozCancelAnimationFrame) return window.mozCancelAnimationFrame(id);
                    else {
                        return window.clearTimeout(id);
                    }
                };
                var getTranslate = function (el, axis) {
                    var matrix, curTransform, curStyle, transformMatrix;
                    // automatic axis detection
                    if (typeof axis === 'undefined') {
                        axis = 'x';
                    }
                    curStyle = window.getComputedStyle(el, null);
                    if (window.WebKitCSSMatrix) {
                        transformMatrix = new WebKitCSSMatrix(curStyle.webkitTransform === 'none' ? '' : curStyle.webkitTransform);
                    }
                    else {
                        transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform  || curStyle.transform || curStyle.getPropertyValue('transform').replace('translate(', 'matrix(1, 0, 0, 1,');
                        matrix = transformMatrix.toString().split(',');
                    }

                    if (axis === 'x') {
                        //Latest Chrome and webkits Fix
                        if (window.WebKitCSSMatrix)
                            curTransform = transformMatrix.m41;
                        //Crazy IE10 Matrix
                        else if (matrix.length === 16)
                            curTransform = parseFloat(matrix[12]);
                        //Normal Browsers
                        else
                            curTransform = parseFloat(matrix[4]);
                    }
                    if (axis === 'y') {
                        //Latest Chrome and webkits Fix
                        if (window.WebKitCSSMatrix)
                            curTransform = transformMatrix.m42;
                        //Crazy IE10 Matrix
                        else if (matrix.length === 16)
                            curTransform = parseFloat(matrix[13]);
                        //Normal Browsers
                        else
                            curTransform = parseFloat(matrix[5]);
                    }

                    return curTransform || 0;
                };
                var wrapperWidth, itemWidth, itemsWidth, minTranslate, maxTranslate;
                var activeIndex = 0;
                var animationFrameId;
                var allowItemClick = true;
                var isTouched, isMoved, touchStartX, touchCurrentX,
                    touchStartTime, touchEndTime, startTranslate, returnTo,
                    currentTranslate, prevTranslate, velocityTranslate, velocityTime;

                var updateItems = function (activeIndex, translate, mytransition, valueCallbacks) {
                    if (typeof translate === 'undefined') {
                        translate = getTranslate(col.wrapper, 'x');
                    }
                    if(typeof activeIndex === 'undefined') activeIndex = -Math.round((translate - maxTranslate)/itemWidth);
                    if (activeIndex < 0) activeIndex = 0;
                    if (activeIndex >= scope.pickerdata.items.length) activeIndex = scope.pickerdata.items.length - 1;
                    var previousActiveIndex //= col.activeIndex;
                    col.activeIndex = activeIndex;
                    var wrapper = $(col.wrapper);
                    var items = $(col.items);
                    wrapper.children('.picker-selected, .picker-after-selected, .picker-before-selected')
                        .removeClass('picker-selected picker-after-selected picker-before-selected');

                    transition(col.items , mytransition);
                    var selectedItem = items.eq(activeIndex).addClass('picker-selected');
                    transform(selectedItem , "");
                    var prevItems = selectedItem.prevAll().addClass('picker-before-selected');
                    var nextItems = selectedItem.nextAll().addClass('picker-after-selected');

                    // Set 3D rotate effect
                    if (col.attrs.rotateEffect) {
                        var percentage = (translate - (Math.floor((translate - maxTranslate)/itemHeight) * itemHeight + maxTranslate)) / itemHeight;

                        col.items.each(function () {
                            var item = $(this);
                            var itemOffsetTop = item.index() * itemHeight;
                            var translateOffset = maxTranslate - translate;
                            var itemOffset = itemOffsetTop - translateOffset;
                            var percentage = itemOffset / itemHeight;

                            var itemsFit = Math.ceil(col.height / itemHeight / 2) + 1;

                            var angle = (-18*percentage);
                            if (angle > 180) angle = 180;
                            if (angle < -180) angle = -180;
                            // Far class
                            if (Math.abs(percentage) > itemsFit) item.addClass('picker-item-far');
                            else item.removeClass('picker-item-far');
                            // Set transform
                            item.transform('translate3d( ' + (-translate + maxTranslate) + 'px, 0,' + (originBug ? -110 : 0) + 'px) rotateX(' + angle + 'deg)');
                        });
                    }
                    if (valueCallbacks) {
                        pickerdata.activeIndex = activeIndex;
                        var itemData = pickerdata.items[activeIndex];
                        // On change callback
                        if (itemData && itemData.value != pickerdata.value) {
                            pickerdata.value = itemData.value;
                            //previousActiveIndex = col.activeIndex;
                            if ($scope.changecol){
                                $scope.changecol(pickerdata , itemData);
                            }
                            //p.updateValue();
                        }
                    }
                };
                var setValue = function (newValue, mytransition, valueCallbacks) {
                    if (typeof transition === 'undefined') transition = '';

                    //todo: 修改
                    var newActiveIndex = _.findIndex(pickerdata.items , function(n){
                        return n.value == newValue;
                    });
                    if(typeof newActiveIndex === 'undefined' || newActiveIndex === -1) {
                        newActiveIndex = 0;
                    }
                    var newTranslate = -newActiveIndex * itemWidth + maxTranslate;
                    // Update wrapper
                    transition(col.wrapper , mytransition);
                    transform(col.wrapper , 'translate3d(' + (newTranslate) + 'px,0,0)');

                    // Update items
                    updateItems(newActiveIndex, newTranslate, transition, true);
                };
                angular.extend($scope , {

                    setValue: function (newValue, mytransition, valueCallbacks) {
                        if (typeof transition === 'undefined') transition = '';

                        //todo: 修改
                        var newActiveIndex = _.findIndex(pickerdata.items , function(n){
                            return n.value == newValue;
                        });
                        if(typeof newActiveIndex === 'undefined' || newActiveIndex === -1) {
                            newActiveIndex = 0;
                        }
                        var newTranslate = -newActiveIndex * itemWidth + maxTranslate;
                        // Update wrapper
                        transition(col.wrapper , mytransition);
                        transform(col.wrapper , 'translate3d(' + (newTranslate) + 'px,0,0)');

                        // Update items
                        updateItems(newActiveIndex, newTranslate, transition, true);
                    } ,
                    calcSize: function () {
                        if (col.attrs.rotateEffect) {
                            //col.container.removeClass('picker-items-col-absolute');
                            //if (!col.width) col.container.css({width:''});
                        }
                        var colWidth;
                        colWidth = col.container.offsetWidth;
                        itemWidth = 160;
                        itemsWidth = itemWidth * scope.pickerdata.items.length;
                        wrapperWidth = itemsWidth;
                        minTranslate = colWidth / 2 - itemsWidth + itemWidth / 2;
                        maxTranslate = colWidth / 2 - itemWidth / 2;
                        $(col.wrapper).css({width:wrapperWidth});
                        //console.log(colWidth , wrapperWidth , itemWidth , itemsWidth , minTranslate , maxTranslate)
                        /*
                         if (col.attrs.rotateEffect) {
                         if (!col.width) {
                         col.items.each(function () {
                         var item = $(this);
                         item.css({width:'auto'});
                         colWidth = Math.max(colWidth, item[0].offsetWidth);
                         item.css({width:''});
                         });
                         col.container.css({width: (colWidth + 2) + 'px'});
                         }
                         col.container.addClass('picker-items-col-absolute');
                         }
                         */
                    } ,
                    handleDragStart: function(e) {
                        $ionicSlideBoxDelegate.enableSlide(false);

                        if (isMoved || isTouched) return;
                        e.gesture.preventDefault();
                        e.stopPropagation();
                        e.preventDefault();
                        isTouched = true;
                        touchStartX = touchCurrentX = e.gesture.center.pageX;
                        touchStartTime = (new Date()).getTime();
                        allowItemClick = true;
                        startTranslate = currentTranslate = getTranslate(col.wrapper, 'x');
                        scope.$apply(function(){
                            pickerdata.isActivsted = true;
                        });                    } ,
                    handleDrag: function(e){
                        $ionicSlideBoxDelegate.enableSlide(false);
                        if (!isTouched) return;
                        var wraper = col.wrapper;
                        e.gesture.preventDefault();
                        e.stopPropagation();
                        e.preventDefault();
                        allowItemClick = false;
                        touchCurrentX = e.gesture.center.pageX;
                        if (!isMoved) {
                            // First move
                            //cancelAnimationFrame(animationFrameId);
                            isMoved = true;
                            startTranslate = currentTranslate = getTranslate(wraper , 'x');
                            transition(col.wrapper , 0);
                            scope.$apply(function() {
                                trans.duration = 0;
                            });
                        }
                        e.gesture.preventDefault();
                        e.stopPropagation();
                        e.preventDefault();
                        //计算当前拖拽的距离
                        var diff = touchCurrentX- touchStartX;
                        currentTranslate = startTranslate + diff;
                        returnTo = undefined;
                        //判断是否超过了最大,最小距离,如果超过,则返回最大,最小的translate
                        if (currentTranslate < minTranslate) {
                            currentTranslate = minTranslate - Math.pow(minTranslate - currentTranslate, 0.8);
                            returnTo = 'min';
                        }
                        if (currentTranslate > maxTranslate) {
                            currentTranslate = maxTranslate + Math.pow(currentTranslate - maxTranslate, 0.8);
                            returnTo = 'max';
                        }

                        //修改wrapper transform
                        transform(wraper , 'translate3d(' + currentTranslate + 'px ,0,0)');
                        scope.$apply(function() {
                            trans.form = currentTranslate;
                        });

                        // Update items
                        updateItems(undefined, currentTranslate, 0, col.attrs.updateValuesOnTouchmove);

                        //计算加速度
                        velocityTranslate = currentTranslate - prevTranslate || currentTranslate;
                        velocityTime = (new Date()).getTime();
                        prevTranslate = currentTranslate;
                    } ,
                    handleDragEnd: function(e) {
                        if (!isTouched || !isMoved) {
                            isTouched = isMoved = false;
                            return;
                        }
                        var wraper = col.wrapper;
                        isTouched = isMoved = false;
                        var endTransform = 0;
                        if (returnTo) {
                            //如果drag translate超过了min , max , 则返回到min , max
                            endTransform = returnTo == "min" ? minTranslate : maxTranslate;
                            scope.$apply(function(){
                                trans.form = endTransform;
                            });
                        }else{
                            //根据加速度计算距离
                            touchEndTime = new Date().getTime();
                            var velocity, newTranslate;
                            if (touchEndTime - touchStartTime > 300) {
                                endTransform = currentTranslate;
                            }else {
                                velocity = Math.abs(velocityTranslate / (touchEndTime - velocityTime));
                                endTransform = currentTranslate + velocityTranslate * col.attrs.momentumratio;
                            }
                            endTransform = Math.max(Math.min(endTransform, maxTranslate), minTranslate);
                        }
                        //当前到第几个Item
                        var activeIndex = -Math.round((endTransform - maxTranslate)/itemWidth);
                        //如果不是freemode , 则跳到对应activeIndex的值
                        if (!col.attrs.freemode) endTransform = -activeIndex * itemWidth + maxTranslate;

                        transform(wraper , 'translate3d(' + (parseInt(endTransform,10)) + 'px,0,0)');
                        transition(wraper , '');
                        scope.$apply(function() {
                            trans.form = parseInt(endTransform,10);
                            trans.duration = 300;
                        });


                        // Watch items
                        if (col.attrs.updateValuesOnMomentum) {
                            //updateDuringScroll();
                            col.wrapper.transitionEnd(function(){
                                $.cancelAnimationFrame(animationFrameId);
                            });
                        }
                        scope.$apply(function(){
                            pickerdata.isActivsted = false;
                        });
                        // Update items
                        updateItems(activeIndex, endTransform, '', true);

                        // Allow click
                        setTimeout(function () {
                            allowItemClick = true;
                        }, 100);

                        //$ionicSlideBoxDelegate.enableSlide(true);
                    } ,
                    selectItem: function(item){
                        setValue(item.value , 300);
                    }
                });
                $(window).on('resize', function(){
                    $scope.calcSize();
                    setValue(scope.pickerdata.value , 0, false);
                });
            },
            link: function (scope, elem, attrs) {
                scope.col.attrs = attrs;
                $ionicGesture.on('dragstart', scope.handleDragStart , elem);
                $ionicGesture.on('drag', scope.handleDrag , elem);
                $ionicGesture.on('dragend', scope.handleDragEnd , elem);
                scope.setValue(null , 0 , false);
            }
        }
    });