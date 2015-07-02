var ngFTP = angular.module('FTP', []);

ngFTP.controller('controller', ['$scope', '$http', function($scope, $http) {
}]);

ngFTP.directive('setClientIcon', function() {
    return function($scope, $elm) {
        $elm.addClass('client-item' + $scope.$index);
        switch($scope.client[$scope.$index].type) {
            case 'd':
                setDirectory('client', $elm, $scope.$index, $scope.client[$scope.$index].name);
                break;
            case '-':
                var attached = $scope.client[$scope.$index].name.slice(($scope.client[$scope.$index].name.lastIndexOf('.') + 1), $scope.client[$scope.$index].name.length);
                setFile($elm, attached);
                break;
            default:
                break;
        }
    };
});

ngFTP.directive('setServerIcon', function() {
    return function($scope, $elm) {
        $elm.addClass('server-item' + $scope.$index);
        app.showToolList('.server-item' + $scope.$index, $scope.server[$scope.$index].name);
        switch($scope.server[$scope.$index].type) {
            case 'd':
                setDirectory('server', $elm, $scope.$index, $scope.server[$scope.$index].name);
                break;
            case '-':
                var attached = $scope.server[$scope.$index].name.slice(($scope.server[$scope.$index].name.lastIndexOf('.') + 1), $scope.server[$scope.$index].name.length);
                setFile($elm, attached);
                break;
            default:
                break;
        }
    };
});

function setDirectory($type, $elm, $index, $name) {
    $elm.css('background-image', 'url(icons/folder.svg)');

    if($type === 'server') {
        $elm.addClass('folder-server' + $index);
        app.serverCwd(('.folder-server' + $index), $name);
    } else if($type === 'client') {
        $elm.addClass('folder-client' + $index);
        app.clientCwd(('.folder-client' + $index), $name);
    }
}

function setFile($elm, $extname) {
    if($extname === 'rar' || $extname === 'zip') {
        $elm.css('background-image', 'url(icons/file-zip.svg)');
    } else if($extname === 'php') {
        $elm.css('background-image', 'url(icons/php.png)');
    } else if($extname === 'html' || $extname === 'htm') {
        $elm.css('background-image', 'url(icons/html5.png)');
    } else if($extname === 'css' || $extname === 'less' || $extname === 'sass') {
        $elm.css('background-image', 'url(icons/css.png)');
    } else if($extname === 'js') {
        $elm.css('background-image', 'url(icons/js.png)');
    } else if($extname === 'json') {
        $elm.css('background-image', 'url(icons/json.svg)');
    } else if($extname === 'jpg' || $extname === 'png' || $extname === 'svg' || $extname === 'gif' || $extname === 'bmp') {
        $elm.css('background-image', 'url(icons/image.svg)');
    } else if($extname === 'txt') {
        $elm.css('background-image', 'url(icons/txt.svg)');
    } else if($extname === 'doc' || $extname === 'docx') {
        $elm.css('background-image', 'url(icons/word.png)');
    } else if($extname === 'ppt' || $extname === 'pptx') {
        $elm.css('background-image', 'url(icons/ppt.png)');
    } else if($extname === 'xls' || $extname === 'xlsx') {
        $elm.css('background-image', 'url(icons/excel.png)');
    } else if($extname === 'pdf') {
        $elm.css('background-image', 'url(icons/pdf.svg)');
    } else {
        $elm.css('background-image', 'url(icons/file-empty.svg)');
    }
}
