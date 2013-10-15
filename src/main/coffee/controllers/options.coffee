'use strict'

angular.module('sites.md')
  .controller 'OptionsCtrl',
    ['$scope',
      class OptionsCtrl
        constructor:(@$scope)->
          @settings = [
            {name:"hoge"}
            {name:"huga"}
          ]
    ]

