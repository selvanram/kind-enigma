var fleabayControllers = angular.module('fleabayControllers', []);
var currentUser = {};

fleabayControllers.controller('mainController', function($scope, $location, $http){
  $scope.signUp = toggleSignUpPage;
  $scope.logIn = toggleLogInPage;
  $scope.goToHomePage = function(){
    $location.path("/")
  }; 

  $scope.directToSignUpPage = function(){
    $location.path("/signup")
  };

  //get some items to show on front page
  $http.get('http://localhost:1337/api/item').
    success(function(data, status, headers, config){
      $scope.itemList = data.slice(0, 5);
    }).
    error(function(data, status, headers, config){
      console.log('could not pull data down');
    });
    $scope.expertList = [];
    //get some experts to show on front page
    $http.get('http://localhost:1337/api/user').
      success(function(data, status, headers, config){
        for(var i = 0; i < data.length; i++){
          if(data[i].IsExpert === true) $scope.expertList.push(data[i]);
        }
      }).
      error(function(data, status, headers, config){
        console.log('could not pull data down');
      });



  $scope.realLogIn = function(){
    var userCellNumber = $scope.userCellNumber;
    var userPassword = $scope.userPassword;

    $http.get('http://localhost:1337/api/user?CellNumber=' + userCellNumber).
      success(function(data, status, headers, config){
        $scope.user = data;
        if (data[0].Password == userPassword){
          if(data[0].isExpert){
            console.log('isanExpert');
          }else{
            currentUser = data;
            $location.path("/user")
            if(data[0].IsExpert){
              $location.path("/expert");
            } else {
              $location.path("/user");
            }
          }
        }
      }).
      error(function(data, status, headers, config){
        console.log('there is an error')
      });
  }

});

fleabayControllers.controller('userController', function($scope, $http, $location){
  $scope.user = currentUser;
  var userCellNumber = currentUser[0].CellNumber;
  // $scope.itemList = items;
  // $scope.postItem = userPostItem;
  $http.get('http://localhost:1337/api/item/byuser?CellNumber=' + userCellNumber).
      success(function(data, status, headers, config){

        $scope.itemList = data;
      }).
      error(function(data, status, headers, config){
        console.log('there is an error')
      });

  $scope.postItem = function(){
    var title = $scope.itemTitle;
    var description = $scope.itemDescription;
    var price = $scope.itemPrice;
    $http.post('http://localhost:1337/api/item',{

      Owner: currentUser[0]._id,
      Title: title,
      Description: description,
      // Address: $scope.user.Address,
      // City: $scope.user.City,
      // State: $scope.user.State,
      // ZipCode: $scope.user.ZipCode,
      // Images: [],
      ListPrice: price,
      // ListPercentage: 10,
      // Expert: 'expert',
      // ListDate: Date,
      // AcceptedDate: Date

    }). // database not uploaded yet
    success(function(data, status, headers, config){
      console.log('succesfully posted an item');
    }).
    error(function(data, status, headers, config){
      console.log('did not succesfully post an item');
    });
  };
  $scope.logOut = function(){
    currentUser = {};
    $location.path('/')
  }

  // $scope.logOut = userLogOut;
});

fleabayControllers.controller('expertController', function($scope, $http){
  $scope.user = currentUser[0];
  $scope.imageUrl = 'http://karmatest1.azurewebsites.net/images/' + currentUser[0].Image;
  $scope.expertItems = [];
  $http.get('http://localhost:1337/api/item')
    .success(function(data, status, headers, config){
      $scope.items = data;
      for(var i = 0; i < $scope.items; i++){
        if($scope.items[i].Expert === currentUser[0]._id){
          $scope.expertItems.push($scope.items[i]);
        }
      }
    })
    .error(function(data, status, headers, config){
      console.log('error getting data');
    })

});

fleabayControllers.controller('signUpController', function($scope, $http){
  $scope.realSignUp = function(){
    var signUpCellNumber = $scope.signUpCellNumber;
    var signUpPassword = $scope.signUpPassword;
    
    var expert = $scope.value1;
    if(expert){
      $http.post('http://localhost:1337/api/user', {
        CellNumber: signUpCellNumber,
        Password: signUpPassword,
        IsExpert: true
      }).
        success(function(data, status, headers, config){
          currentUser = data;
          $location.path('/expert')
        }).
        error(function(data, status, headers, config){
          console.log('an error in signUp');
        });
    } else { 
      $http.post('http://localhost:1337/api/user', {
        CellNumber: signUpCellNumber,
        Password: signUpPassword,
      }).
        success(function(data, status, headers, config){
          currentUser = data;
          $location.path('/user')
        }).
        error(function(data, status, headers, config){
          console.log('an error in signUp');
        });
    }
  }
});