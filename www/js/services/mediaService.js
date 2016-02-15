'use strict';
angular.module('bridge.services')
    .factory(
    'MediaService',
    function ($q , $cordovaCamera , $cordovaCapture) {
        return {
            captureImage: function(options){
                alert("000")
                var defaultOptions = {
                    destinationType: Camera.DestinationType.FILE_URI,
                    sourceType: Camera.PictureSourceType.CAMERA,
                    //encodingType: Camera.EncodingType.JPEG,
                    saveToPhotoAlbum: false
                };
                alert(1111);
                options = _.extend( defaultOptions , options);
                alert(222222);
                return $cordovaCamera.getPicture(options);
            } ,
            captureAlbum: function(options){
                return this.captureImage({
                    sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
                    mediaType: Camera.MediaType.PICTURE
                });
            } ,
            captureAudio: function(options){
                return $cordovaCapture.captureAudio(options);
            } ,
            captureVideo: function(options){
                return $cordovaCapture.captureVideo(options);
            }


        }
    }
);
