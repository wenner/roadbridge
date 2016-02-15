'use strict';
angular.module('bridge.services')
    .factory(
    'MediaService',
    function ($q , $cordovaCamera , $cordovaCapture) {
        return {
            captureImage: function(options){
                return $cordovaCapture.captureImage(options);
            } ,
            captureAlbum: function(){
                var options = {
                    destinationType: Camera.DestinationType.FILE_URI,
                    //sourceType: Camera.PictureSourceType.CAMERA,
                    sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
                    mediaType: Camera.MediaType.ALLMEDIA ,
                    saveToPhotoAlbum: false
                };
                return $cordovaCamera.getPicture({
                    sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
                    mediaType: Camera.MediaType.ALLMEDIA
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
