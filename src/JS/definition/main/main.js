var GUI = require('nw.gui'),
    FTP = require('ftp'),
    fs = require('fs'),
    path = require('path'),
    client,
    root = '/',
    directory= '/',
    clientRoot = process.cwd();

var app = {
    item: null,
    init: function() {
        this.bindEvent();
    }, bindEvent: function() {
        document.addEventListener('DOMContentLoaded', this.DOMReady, false);
    }, DOMReady: function() {
        $('.content-list').mCustomScrollbar({
    		theme: 'minimal-dark',
    		autoHideScrollbar: true
    	});
        console.log(clientRoot);
    }, clientRoot: function() {
        var clientDir = './';
        var clientList = new Array();
        fs.readdir(clientDir, function(err, files) {
            if(err) throw err;
            for(var i=0;i<files.length;i++) {
                var extname = files[i].lastIndexOf('.') > 0 ? '-' : 'd';
                clientList[i] = {
                    name: files[i],
                    type: extname
                };
            }

            var $scope = angular.element($('body')).scope();
            $scope.$apply(function() {
                $scope.client = clientList;
            });
        });
    }, clientCwd: function(selector, dir) {
        var clientList = new Array();
        var folder = document.querySelector(selector);
        folder.addEventListener('dblclick', function() {
            if(dir !== '..') {
                clientRoot += ("\\" + dir);
            } else {
                clientRoot = clientRoot.slice(0, clientRoot.lastIndexOf("\\"));
            }
            console.log(clientRoot);
            fs.readdir(clientRoot, function(err, files) {
                if(err) throw err;
                for(var i=0;i<files.length;i++) {
                    var extname = files[i].lastIndexOf('.') > 0 ? '-' : 'd';
                    clientList[i] = {
                        name: files[i],
                        type: extname
                    };
                }

                var $scope = angular.element($('body')).scope();
                $scope.$apply(function() {
                    if(dir !== root) {
                        var prevDir = {
                            type: 'd',
                            name: '..'
                        };
                        clientList.splice(0, 0, prevDir);
                    }
                    $scope.client = clientList;
                });
            });
        });
    }, dragover: function(selector) {
        var elm = document.querySelector(selector);
        elm.addEventListener('dragover', function(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            evt.dataTransfer.dropEffect = 'copy';
        });
    }, droppable: function(selector) {
        var dropZone = document.querySelector(selector);
        dropZone.addEventListener('drop', function(evt) {
            evt.preventDefault();
            evt.stopPropagation();

            var files = evt.dataTransfer.files;
            for(var i=0;i<files.length;i++) {
                client.put(files[i].path, files[i].name, function(err) {
                    console.log(err);
                });
            }

            client.list(function(err, list) {
                if(err) throw err;
                var list = list;
                var $scope = angular.element($('body')).scope();
                $scope.$apply(function() {
                    if(directory !== root) {
                        var prevDir = {
                            type: 'd',
                            name: '..'
                        };
                        list.splice(0, 0, prevDir);
                    }
                    $scope.server = list;
                });
            });
        });
    }, connectFTP: function(selector) {
        var connectButton = document.querySelector(selector.connect);
        connectButton.addEventListener('click', function() {
            var IP = document.querySelector(selector.IP);
            var host = document.querySelector(selector.host);
            var password = document.querySelector(selector.password);

            client = new FTP();
            client.on('ready', function() {
                client.list(function(err, list) {
                    if(err) throw err;
                    var $scope = angular.element($('body')).scope();
                    $scope.$apply(function() {
                        $scope.server = list;
                    });
                    // console.dir(list);
                    // client.end();
                });

                client.pwd(function(err, path) {
                    root = path;
                });
            });

            client.connect({
                host: IP.value,
                port: 21,
                user: host.value,
                password: password.value
            });
        });
    }, serverCwd: function(selector, dir) {
        var folder = document.querySelector(selector);
        folder.addEventListener('dblclick', function() {
            directory = dir;
            client.cwd(dir, function(err, dir) {
                if(err) console.log(err);

                client.list(function(err, list) {
                    var list = list;
                    var $scope = angular.element($('body')).scope();
                    $scope.$apply(function() {
                        if(dir !== root) {
                            var prevDir = {
                                type: 'd',
                                name: '..'
                            };
                            list.splice(0, 0, prevDir);
                        }
                        $scope.server = list;
                    });
                });
            });
        });
    }, showToolList: function(selector, file) {
        var self = this;
        var item = document.querySelector(selector);
        var toolList = document.querySelector('.tool-list');
        var rename = toolList.querySelector('.rename');
        var remove = toolList.querySelector('.remove');
        var download = toolList.querySelector('.download');

        item.addEventListener('mousedown', function(evt) {
            if(evt.button == 2) {
                toolList.style.display = 'block';
                toolList.style.top = (evt.pageY - $(toolList).height()/2) + 'px';
                toolList.style.left = (evt.pageX/2 + 35) + 'px';

                self.item = this;
                rename.setAttribute('data-file', file);
                remove.setAttribute('data-file', file);
                download.setAttribute('data-file', file);
            }
        });
    }, hideToolList: function(selector) {
        var elm = $(selector);
        var toolList = document.querySelector('.tool-list');
        elm.click(function() {
            toolList.style.display = 'none';
        });
    }, renameFile: function(selector) {
        var self = this;
        var rename = document.querySelector(selector);
        rename.addEventListener('click', function() {
            var file = this.getAttribute('data-file');
            self.item.contentEditable = true;
            self.item.focus();

            self.item.addEventListener('blur', function() {
                var filename = self.item.textContent;
                self.item.contentEditable = false;
                self.item.removeEventListener('blur');

                client.rename(file, filename, function(err) {
                    console.log(err);

                    client.list(function(err, list) {
                        if(err) throw err;
                        var list = list;
                        var $scope = angular.element($('body')).scope();
                        $scope.$apply(function() {
                            if(directory !== root) {
                                var prevDir = {
                                    type: 'd',
                                    name: '..'
                                };
                                list.splice(0, 0, prevDir);
                            }
                            $scope.server = list;
                        });
                    });
                });
            });

            self.item.addEventListener('keydown', function(key) {
                if(key.which == 13) {
                    self.item.blur();
                }
            });
        });
    }, removeFile: function(selector) {
        var self = this;
        var remove = document.querySelector(selector);
        remove.addEventListener('click', function() {
            var file = this.getAttribute('data-file');

            client.delete(file, function(err) {
                console.log(err);

                client.list(function(err, list) {
                    if(err) throw err;
                    var list = list;
                    var $scope = angular.element($('body')).scope();
                    $scope.$apply(function() {
                        if(directory !== root) {
                            var prevDir = {
                                type: 'd',
                                name: '..'
                            };
                            list.splice(0, 0, prevDir);
                        }
                        $scope.server = list;
                    });
                });
            })
        });
    }, downloadFile: function(selector) {
        var download = document.querySelector(selector);
        download.addEventListener('click', function() {
            var file = this.getAttribute('data-file');
            client.get(file, function(err, stream) {
                stream.once('close', function() {
                    var clientDir = './';
                    var clientList = new Array();
                    fs.readdir(clientDir, function(err, files) {
                        if(err) throw err;
                        for(var i=0;i<files.length;i++) {
                            var extname = files[i].lastIndexOf('.') > 0 ? '-' : 'd';
                            clientList[i] = {
                                name: files[i],
                                type: extname
                            };
                        }

                        var $scope = angular.element($('body')).scope();
                        $scope.$apply(function() {
                            $scope.client = clientList;
                        });
                    });
                });
                stream.pipe(fs.createWriteStream(file));
            });
        });
    }, showDevTools: function(selector) {
        var develop = document.querySelector(selector);
        develop.addEventListener('click', function() {
            // client.end();
            GUI.Window.get().showDevTools();
        });

    }, minimize: function(selector) {
        var minimize = document.querySelector(selector);
        minimize.addEventListener('click', function() {
            GUI.Window.get().minimize();
        });
    }, close: function(selector) {
        var close = document.querySelector(selector);
        close.addEventListener('click', function() {
            GUI.Window.get().close();
        });
    }
};
