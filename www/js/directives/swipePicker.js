'use strict';
angular.module('bridge')
    .directive('swipepicker', function ($ionicGesture) {
        return {
            restrict: 'A',
			scope: {
				coldata:"="
			} ,
            templateUrl:"views/checkswipe/col.html" ,
            controller: function ($scope, $element) {
                $scope.aaa = function(){

                }
            },
            link: function (scope, elem, attrs) {
                var trans = scope.coldata.trans;
                var container = elem[0];
                var col = {
                    container: container ,
                    wrapper: container.children[0] ,
                    items: container.children[0].children
                };

                scope.$watch("coldata.items", function() {
                    calcSize();
                    trans.form = maxTranslate;
                    trans.duration = 300;
                    transform(col.wrapper , 'translate3d(0,' + maxTranslate + 'px,0)');
                    transition(col.wrapper , 0);
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

                var wrapperHeight, itemHeight, itemsHeight, minTranslate, maxTranslate;
                var calcSize = function () {
                    if (attrs.rotateEffect) {
                        //col.container.removeClass('picker-items-col-absolute');
                        //if (!col.width) col.container.css({width:''});
                    }
                    var colWidth, colHeight;
                    colWidth = 0;
                    colHeight = col.container.offsetHeight;
                    wrapperHeight = col.wrapper.offsetHeight;
                    itemHeight = 36; //col.items[0].offsetHeight;
                    itemsHeight = itemHeight * scope.coldata.items.length;
					wrapperHeight = itemsHeight;
                    minTranslate = colHeight / 2 - itemsHeight + itemHeight / 2;
                    maxTranslate = colHeight / 2 - itemHeight / 2;
                    console.log(colHeight , wrapperHeight , itemHeight , itemsHeight , minTranslate , maxTranslate)
                    /*
                    if (attrs.rotateEffect) {
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
                };
                var activeIndex = 0;
                var animationFrameId;

                col.updateItems = function (activeIndex, translate, mytransition, valueCallbacks) {
                    if (typeof translate === 'undefined') {
                        translate = getTranslate(col.wrapper, 'y');
                    }
                    if(typeof activeIndex === 'undefined') activeIndex = -Math.round((translate - maxTranslate)/itemHeight);
                    if (activeIndex < 0) activeIndex = 0;
                    if (activeIndex >= scope.coldata.items.length) activeIndex = scope.coldata.items.length - 1;
                    var previousActiveIndex = col.activeIndex;
                    col.activeIndex = activeIndex;
                    var wrapper = $(col.wrapper);
                    var items = $(col.items);
                    wrapper.children('.picker-selected, .picker-after-selected, .picker-before-selected')
                        .removeClass('picker-selected picker-after-selected picker-before-selected');

                    transition(col.items , mytransition);
                    var selectedItem = items.eq(activeIndex).addClass('picker-selected');
                    console.log(col.items)
                    transform(selectedItem , "");
                    var prevItems = selectedItem.prevAll().addClass('picker-before-selected');
                    var nextItems = selectedItem.nextAll().addClass('picker-after-selected');

                    // Set 3D rotate effect
                    if (attrs.rotateEffect) {
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
                            item.transform('translate3d(0, ' + (-translate + maxTranslate) + 'px, ' + (originBug ? -110 : 0) + 'px) rotateX(' + angle + 'deg)');
                        });
                    }

                    if (valueCallbacks || typeof valueCallbacks === 'undefined') {
                        // Update values
                        //col.value = selectedItem.attr('data-picker-value');
                        //col.displayValue = col.displayValues ? col.displayValues[activeIndex] : col.value;
                        // On change callback
                        if (previousActiveIndex !== activeIndex) {
                            if (col.onChange) {
                                col.onChange(attrs, col.value, col.displayValue);
                            }
                            //p.updateValue();
                        }
                    }
                };

                var allowItemClick = true;
                var isTouched, isMoved, touchStartY, touchCurrentY,
                    touchStartTime, touchEndTime, startTranslate, returnTo,
                    currentTranslate, prevTranslate, velocityTranslate, velocityTime;

                //下面是dranstart , drag , dragend时间
                function handleDragStart (e) {
                    if (isMoved || isTouched) return;
                    e.gesture.preventDefault();
                    e.stopPropagation();
                    e.preventDefault();
                    isTouched = true;
                    touchStartY = touchCurrentY = e.gesture.center.pageY;
                    touchStartTime = (new Date()).getTime();
                    allowItemClick = true;
                    startTranslate = currentTranslate = getTranslate(col.wrapper, 'y');
                }
                function handleDrag (e) {
                    if (!isTouched) return;
                    var wraper = col.wrapper;
                    e.gesture.preventDefault();
                    e.stopPropagation();
					e.preventDefault();
                    allowItemClick = false;
                    touchCurrentY = e.gesture.center.pageY;
                    if (!isMoved) {
                        // First move
                        //cancelAnimationFrame(animationFrameId);
                        isMoved = true;
                        startTranslate = currentTranslate = getTranslate(wraper , 'y');
                        transition(col.wrapper , 0);
                        scope.$apply(function() {
                            trans.duration = 0;
                        });
                    }
                    e.gesture.preventDefault();
                    e.stopPropagation();
                    e.preventDefault();
                    //计算当前拖拽的距离
                    var diff = touchCurrentY - touchStartY;
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
                    transform(wraper , 'translate3d(0,' + currentTranslate + 'px,0)');
                    scope.$apply(function() {
                        trans.form = currentTranslate;
                    });

                    // Update items
                    col.updateItems(undefined, currentTranslate, 0, attrs.updateValuesOnTouchmove);

                    //计算加速度
                    velocityTranslate = currentTranslate - prevTranslate || currentTranslate;
                    velocityTime = (new Date()).getTime();
                    prevTranslate = currentTranslate;
                }
                function handleDragEnd (e) {
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
                            endTransform = currentTranslate + velocityTranslate * attrs.momentumratio;
                        }
                        endTransform = Math.max(Math.min(endTransform, maxTranslate), minTranslate);
                    }
                    //当前到第几个Item
                    var activeIndex = -Math.round((endTransform - maxTranslate)/itemHeight);
                    //如果不是freemode , 则跳到对应activeIndex的值
                    if (!attrs.freemode) endTransform = -activeIndex * itemHeight + maxTranslate;

                    transform(wraper , 'translate3d(0,' + (parseInt(endTransform,10)) + 'px,0)');
                    transition(wraper , '');
                    scope.$apply(function() {
                        trans.form = parseInt(endTransform,10);
                        trans.duration = 300;
                    });
                    // Update items
                    col.updateItems(activeIndex, endTransform, '', true);

                    // Watch items
                    if (attrs.updateValuesOnMomentum) {
                        updateDuringScroll();
                        col.wrapper.transitionEnd(function(){
                            $.cancelAnimationFrame(animationFrameId);
                        });
                    }

                    // Allow click
                    setTimeout(function () {
                        allowItemClick = true;
                    }, 100);
                }


                function handleClick(e) {
                    if (!allowItemClick) return;
                    //$.cancelAnimationFrame(animationFrameId);
                    /*jshint validthis:true */
                    var value = $(this).attr('data-picker-value');
                    col.setValue(value);
                }
                $ionicGesture.on('dragstart', handleDragStart , elem);
                $ionicGesture.on('drag', handleDrag , elem);
                $ionicGesture.on('dragend', handleDragEnd , elem);

            }
        }
    });