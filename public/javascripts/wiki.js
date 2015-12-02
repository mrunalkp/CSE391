var app = angular.module('wiki', ['ngRoute','ngSanitize']);
app.run(function($rootScope){
  $rootScope.title = '';
  $rootScope.body = '';
  $rootScope.param = '';
  $rootScope.status = '';
});
app.config(function($routeProvider, $locationProvider){
  $routeProvider
    //the timeline display
    .when('/grading', {
      templateUrl: 'home.html'
    })
    //the edit display
    .when('/edit', {
      templateUrl: 'edit.html',
      controller: 'editController'
    })
    //the article display
    .when('/grading/:title', {
      templateUrl: 'article.html',
      controller: 'articleController'
    })
    .otherwise({redirectTo: '/grading'});
    $locationProvider.html5Mode(true);
});
app.factory('articleFactory', function($http, $rootScope) {
    var urlBase = '/api',
        articleFactory = {};
    articleFactory.getArticle = function(title) {
      return $http.get(urlBase+'/'+title);
    };
    articleFactory.saveArticle = function(article) {
      return $http.post(urlBase+'/'+$rootScope.param, article);
    };
    return articleFactory;
  }
);
app.controller('articleController',function(articleFactory, $scope, $rootScope, $routeParams, $location){
  function getArticle() {
    $rootScope.param = $routeParams.title;
    articleFactory.getArticle($routeParams.title)
      .success(function(wikiArticle) {
        $rootScope.title = wikiArticle.title;
        $rootScope.body = wikiArticle.body;
        $scope.wikiBody = markUp(wikiArticle.body);
        function markUp(body) {
          var reg = /\[\[(.*?)\]\]/g;
          var reg2 = /\[\[(.*?)\]\]/;
          var text = body.split(reg);
          for(var i = 1; i < text.length; i = i+2) {
            var post = text[i].substring(text[i].indexOf("|")+1);
            var pre = post;
            if(text[i].indexOf("|") >=0)
              pre = text[i].substring(0,text[i].indexOf("|"));
            body = body.replace(reg2,"<a href='./grading/"+post+"'>"+pre+"</a>");
          }
          return body;
        }
      })
      .error(function(error){
        $rootScope.title = "Error 404";
        $rootScope.body = "Article not Found";
      });
  }
  getArticle();
  $scope.edit = function() {
    $location.path("/edit");
  }
});
app.filter('trustAsHtml', function($sce) {
  return function(html) {
    return $sce.trustAsHtml(html);
  };
});
app.controller('editController', function(articleFactory, $scope, $rootScope, $location) {
  $scope.newTitle = $rootScope.title;
  $scope.newBody = $rootScope.body;
  $scope.save = function() {
    var newArticle = {
      title: $scope.newTitle,
      body: $scope.newBody
    }
    $rootScope.title = newArticle.title;
    $rootScope.body = newArticle.body;
    articleFactory.saveArticle(newArticle)
      .success(function(res){
        $rootScope.status = res.status;
      })
      .error(function(error){
        console.log(error);
      });
    $location.path("/grading/"+newArticle.title);
  };
});
app.controller('searchController', function($scope, Solstice) {
  $scope.query = "";
  $scope.search = function() {
    Solstice.search({
      q: $scope.query,
      fl: 'title',
      rows: 10
    })
    .then(function (data){
    $scope.results = data.docs;
    console.log(data.docs);
    });
  }
});
