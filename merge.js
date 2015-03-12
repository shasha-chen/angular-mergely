var app = angular.module('mergely', []);

app.directive('mergelyEditor', function() {
  return {
    restrict: 'E',
    replace: true,
    template:
      '<div class="mergely-wrapper">' +
        '<tabset>' +
          '<tab ng-repeat="tab in tabs" heading="{{tab.heading}}" active="tab.active" disable="!tab.active" ng-click="tab.click(tab.heading)"></tab>' +
        '</tabset>' +
        '<div id="mergely-editor"></div>' +
        '<button type="button" class="btn btn-default" ng-click="_accept()" is-disabled="mergable">Merge</button>' +
        '<button type="button" class="btn btn-default" ng-click="cancel()">Cancel</button>' +
      '</div>',
    scope: {
      files: '=',
      mergeFiles: '=',
      accept: '=',
      cancel: '='
    },
    controller: function($scope) {
      $scope.tabs = [];
      $scope.finalFiles = [];
      $scope.mergable = false;

      // Wrapper to accept to get the file contents before hand
      $scope._accept = function() {
        $scope.accept($scope.finalFiles);
      };
    },
    link: function($scope, element) {
      var file = undefined;
      var curTab = undefined;
      var tabData = {};

      var merge = function(as, bs) {
        var cs = [];
        for (var a in as) cs[a] = as[a];
        for (var b in bs) cs[b] = bs[b];
        return cs;
      }

      var openTab = function(file) {
        // Save previous tab
        if (curTab) {
          tabData[curTab] = {
            lhs: $('#mergely-editor').mergely('get', 'lhs'),
            rhs: $('#mergely-editor').mergely('get', 'rhs')
          };
        }
        curTab = file;

        // Load tab content
        var lcontent;
        var rcontent;

        console.log('keys:', Object.keys(tabData));
        if (file in tabData) {
          lcontent = tabData.lhs;
          rcontent = tabData.rhs;
        } else {
          lcontent = $scope.files[file] || '';
          rcontent = $scope.mergeFiles[file] || '';
        }

        // TODO Do we have to tell angular about this content change?
        $('#mergely-editor').mergely('lhs', lcontent);
        $('#mergely-editor').mergely('rhs', rcontent);
      };

      var updateTabs = function(files) {
        if (!files) {
          return;
        }

        // make sure we have some file active
        if (file === undefined) {
          file = Object.keys($scope.mergeFiles)[0] || file;
          file = Object.keys($scope.files)[0] || file;
        }

        // update the tabs
        $scope.tabs = [];
        var paths = merge(Object.keys($scope.files), Object.keys($scope.mergeFiles));

        for (var i = 0; i < paths.length; i++) {
          var path = paths[i];
          $scope.tabs.push({
            heading: path,
            active: path === file,
            click: openTab
          });
        }

        // make sure to goto the tab
        openTab(file);
      };

      // update tabs when files/mergeFiles change
      $scope.$watch('files', updateTabs);
      $scope.$watch('mergeFiles', updateTabs);

      // TODO dod we have to tell angular about this content change?
      $('#mergely-editor').mergely({
        cmsettings: { readOnly: false, lineNumbers: true },
      });
    }
  }
});