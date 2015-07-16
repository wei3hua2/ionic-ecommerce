angular.module('ionic-ecommerce.services', [])
.service('AuthService', AuthService)
.factory('ProductService', ProductService)
.factory('CartService', CartService);

// Auth Service
AuthService.$inject = ['$q', '$http', 'CONFIG'];
function AuthService($q, $http, CONFIG) {
  var localStorage_token_key = CONFIG.localStorage_token_key;
  var token_header = CONFIG.token_header;
  var isAuthenticated = false;
  var authToken;

  function loadUserCredentials() {
    var token = window.localStorage.getItem(localStorage_token_key);
    if (token) {
      useCredentials(token);
    }
  }

  function storeUserCredentials(token) {
    window.localStorage.setItem(localStorage_token_key, token);
    useCredentials(token);
  }

  function useCredentials(token) {
    isAuthenticated = true;
    authToken = token;

    // Set the token as header for your requests!
    $http.defaults.headers.common[token_header] = token;
  }

  function destroyUserCredentials() {
    authToken = undefined;
    isAuthenticated = false;
    $http.defaults.headers.common[token_header] = undefined;
    window.localStorage.removeItem(localStorage_token_key);
  }

  var login = function(email, password) {
    var endpoint = CONFIG.api_login_uri;
    var deferred = $q.defer();
    var promise = deferred.promise;
    var params = { email: email, password: password };
    $http
      .post(endpoint, params)
      .success(function(response) {
        storeUserCredentials(response.token);
        deferred.resolve(response);
      })
      .error(function(rejection) { deferred.reject(rejection); });

    promise.success = function (callback) {
      promise.then(callback);
      return promise;
    };
    promise.error = function (callback) {
      promise.then(null, callback);
      return promise;
    };
    return promise;
  };

  var logout = function() {
    destroyUserCredentials();
  };

  loadUserCredentials();

  return {
    login: login,
    logout: logout,
    token: function() {return authToken;},
    isAuthenticated: function() {return isAuthenticated;}
  };
}

// Product Service
ProductService.$inject = ['$http', '$q', 'AuthService', 'CONFIG'];
function ProductService($http, $q, AuthService, CONFIG) {
  var service = this;
  service.endpoint = CONFIG.api_products_uri;
  service.all = all;
  service.get = get;

  function all() {
    var deferred = $q.defer();
    $http
      .get(service.endpoint, { cache: true })
      .success(function(response) {
        deferred.resolve(response);
      })
      .error(function(rejection) {
        deferred.reject(rejection);
      });
    return deferred.promise;
  }

  function get(slug) {
    var deferred = $q.defer();
    $http
      .get(service.endpoint + "/" + id, { cache: true })
      .success(function(response) {
        deferred.resolve(response);
      })
      .error(function(rejection) {
        deferred.reject(rejection);
      });
    return deferred.promise;
  }
  return service;
}

// Cart Service
CartService.$inject = ['$http', '$q', 'ProductService'];
function CartService($http, $q, ProductService) {
  var service = this;
  service.products = [];
  service.count = 0;
  service.add = add;
  service.remove = remove;

  function add(product) {
    // console.log("add product: ", product);
    service.products.push(product);
    service.count = service.products.length;
    console.log(service.products);
  }

  function remove(product) {
    console.log("remove product: ", product);
  }

  return service;
}
