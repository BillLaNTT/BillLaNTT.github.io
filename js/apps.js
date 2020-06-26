angular.module('hostplus', ['hostplus.shared', 'hostplus.searchResults', 'hostplus.ticketBallot']);
angular.module('hostplus')
	.config(function($locationProvider, localStorageServiceProvider) {
		'use strict';
		// use the HTML5 History API
		$locationProvider.html5Mode({
			enabled: true,
			requireBase: false
		});

		localStorageServiceProvider
			.setPrefix('hpApp')
			.setStorageType('sessionStorage')
			.setNotify(true, true);
	});
angular.module('hostplus.shared', ['ngAnimate', 'ngAria', 'LocalStorageModule', 'ui.bootstrap']);
/*jshint latedef: nofunc */
angular.module('hostplus.shared')
	.filter('startFrom', startPagesFrom)
	.filter('unique', uniqueItems);

function startPagesFrom () {

    'use strict';

	return function (input, start) {
		if (input) {
			start = +start;
			return input.slice(start);
		}
		return [];
	};

}

function uniqueItems () {

    'use strict';

    return function (items, filterOn) {

        if (filterOn === false) {
            return items;
        }

        if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {

            var newItems = [];

            var extractValueToCompare = function (item) {

                if (angular.isObject(item) && angular.isString(filterOn)) {
                    return item[filterOn];
                } else {
                    return item;
                }

            };

            angular.forEach(items, function (item) {

                var isDuplicate = false;

                for (var i = 0; i < newItems.length; i++) {

                    if (angular.equals(extractValueToCompare(newItems[i]), extractValueToCompare(item))) {
                        isDuplicate = true;
                        break;
                    }

                }

                if (!isDuplicate) {
                    newItems.push(item);
                }

            });

            items = newItems;

        }

        return items;

    };

}
/*jshint latedef: nofunc */
angular.module('hostplus.shared')
	.service('StorageService', ['localStorageService', StorageService]);

/**
 * @ngInject
 */
function StorageService(localStorageService) {

    'use strict';

	this.getItem = function (key) {
        return localStorageService.get(key);
    };

	this.saveItem = function (key, data) {
		localStorageService.set(key, data);
	};

    this.clearAllItems = function() {
        return localStorageService.clearAll();
    };

}

// Search results sub app
angular.module('hostplus.searchResults', []);
/*jshint latedef: nofunc */
angular.module('hostplus.searchResults')
	.service('SearchService', ['$http', '$q', SearchService]);

/**
 * @ngInject
 */
function SearchService($http, $q) {

    'use strict';

	this.getAllResults = function() {

		var url = '/api/search/get/',
			req = $http.get(url);

		return(req.then(_handleSuccess, _handleError));

	};

	this.getResultsByQuery = function(query) {

		var url = '/api/search/get/' + query,
			req = $http.get(url);

		return(req.then(_handleSuccess, _handleError));

	};

	function _handleSuccess(response) {

		return(response.data);

	}

	function _handleError(response) {

		if (!angular.isObject(response.data) || !response.data.message) {

			return($q.reject('An unknown error occurred.'));

		}

		// Otherwise, use expected error message.
		return($q.reject(response.data.message));

	}

}
/*jshint latedef: nofunc */
angular.module('hostplus.searchResults')
	.controller('SearchResultsController', ['$location', '$sce', 'SearchService', 'filterFilter', SearchResultsController]);

/**
 * @name SearchResultsController
 * @desc Main sub-application Controller for Search Results page
 */
 /**
 * @ngInject
 */
function SearchResultsController($location, $sce, SearchService, filterFilter) {

	'use strict';

	var vm = this; // vm for ViewModel

	vm.query = $location.search().q;
	vm.selectedCategory = $location.search().cat || '';

	vm.items = [];
	vm.filteredItems = [];

	vm.filterLabel = '';
	vm.filters = [{
		id: 0,
		title: 'All',
		category: ''
	}];

	vm.noResultsHTML = '';
	vm.relatedLinks = [];

	// Default Pagination settings:
	vm.currentPage = 0;
	vm.maxSize = 5;
	vm.itemsPerPage = 3;
	vm.prevTxt = '';
	vm.nextTxt = '';
	vm.range = {
		lower: 1,
		upper: vm.itemsPerPage,
		total: 0
	};

	/**
   	 * @name _loadRemoteData
     * @desc Fetches data from web service
     * @returns promise object
	*/
	function _loadRemoteData() {

		SearchService.getAllResults()
			.then(function(responseData) {
				_applyRemoteData(responseData);
			});

		// SearchService.getResultsByQuery(vm.query)
		// 	.then(function(responseData) {
		// 		_applyRemoteData(responseData);
		// 	});

	}

	/**
   	 * @name _applyRemoteData
     * @desc Applies data to view model (scope)
     * @param {Object} responseData - json object returned from Angular service
     * @param {Array} items - search results
     * @param {String} filterLabel - label for Filters section. Set by content author in Sitecore
     * @param {Array} filters - filter items. Set by content author in Sitecore
     * @param {Object} relatedLinks - heading and links for when there are no results returned. Set by content author in Sitecore
     * @param {String} noResults - HTML content. Set by content author in Sitecore
     * @param {Object} settings - various settings . Configured by content author in Sitecore
	*/
	function _applyRemoteData(responseData) {

		vm.items = responseData.results;
		vm.filterLabel = responseData.filters.label;
		vm.filters = vm.filters.concat(responseData.filters.items);
		vm.relatedLinks = responseData.relatedLinks;
		vm.noResultsHTML = $sce.trustAsHtml(responseData.noResults);

		_initPagination(responseData.settings.pages);
		_filterResults();

	}

	/**
   	 * @name _filterResults
     * @desc filters items based on selectedCategory and updates range values
	*/
	function _filterResults() {

		vm.filteredItems = filterFilter(vm.items, { category: vm.selectedCategory });
		_setRangeValues(vm.filteredItems.length);

	}

	/**
   	 * @name _initPagination
     * @desc Sets pagination values to be used by Angular Bootstrap Pagination directive on front end. Configured by content author in Sitecore.
     * @param {Object} pageSettings - data object returned from Angular service containing pagination properties and their values
	*/
	function _initPagination(pageSettings) {

		// console.log('pagination obj:', vm.pagination);
		vm.currentPage = $location.search().page || 1;
		vm.maxSize = pageSettings.maxSize;
		vm.itemsPerPage = pageSettings.itemsPerPage;
		vm.prevTxt = pageSettings.prevTxt;
		vm.nextTxt = pageSettings.nextTxt;

	}

	/**
   	 * @name _setRangeValues
     * @desc Sets lower, upper and total range values for the "Showing x - y of z for [query]" section
     * @param {Int} totalItems - total number of filteredSearch results
	*/
	function _setRangeValues(totalItems) {

		vm.range.lower = (vm.currentPage - 1) * vm.itemsPerPage + 1;
		vm.range.upper = Math.min(vm.currentPage * vm.itemsPerPage, totalItems);
		vm.range.total = totalItems;

	}

	/**
   	 * @name updateUrl
     * @desc Appends 'type' and/or 'page' parameters to url. (eg: hostplus.com.au/search?q="Super"&type="page"&page=1)
     * @param {String} type - type of search result
     * @param {int} page - page number
	*/
	function _updateUrl(type, page) {

		if(type !== null) {
			_setType(type);
			_resetPage();
		}

		if(page !== null) {
			_setPage(page);
		}

	}

	function _setType(val) {

		var cat = (val === '') ? null : val;
		$location.search('cat', cat);

	}

	function _setPage(val) {
		$location.search('page', val);
	}

	function _resetPage() {
		vm.currentPage = 1;
		$location.search('page', null);
	}

	vm.changePages = function(pageNum, totalItems) {

		_updateUrl(null, pageNum);
		_setRangeValues(totalItems);

	};

	/**
   	 * @name filterByCategory
     * @desc updates url 'type' param and filters result items
     * @param {String} cat - category of search result
	*/
	vm.filterByCategory = function(cat) {

		_updateUrl(cat);
		_filterResults();

	};

	/**
   	 * @name submitForm
     * @desc validates search input & gets results from web service or shows error message
     * @param {Bool} isValid - determines if form data meets validation criteria
     * @param {String} searchResults.q.value - value of saerch input to be sent to web service
     * @returns promise object
	*/
	vm.submitForm = function(isValid) {

		// console.log('form input: ', searchResultsForm.q.value);

		if(isValid) {
			// Call the search service passing the query param
		// 	SearchService.getResultsByQuery($form.q.value)
		// 		.then(function(responseData) {
		// 			_applyRemoteData(responseData);
		// 		});
		} else {
			vm.errorText = 'An error occurred';
		}

	};

	_loadRemoteData();

}

angular.module('hostplus.ticketBallot', []);
/* globals gamesJSON, $j */
/* jshint latedef: nofunc */
angular.module('hostplus.ticketBallot')
    .controller('GamesController', ['$sce','StorageService', '$window', GamesController]);

/**
 * @ngInject
 */
function GamesController($sce, StorageService, $window) {

    'use strict';

    var vm = this;

    vm.games = [];
    vm.availableGames = [];
    vm.message = '';
    vm.$sce = $sce;
    vm.config = gamesJSON.Configuration;

    vm.games = gamesJSON.games;
    vm.key = gamesJSON.timeStamp;

    var selections = StorageService.getItem('gameSelections'),
        storageKey = StorageService.getItem('gameKey');
  
    vm.selectedCode1 = ifExists(selections, 'code1');
    vm.selectedState1 = ifExists(selections, 'state1');

    vm.selectedCode2 = ifExists(selections, 'code2');
    vm.selectedState2 = ifExists(selections, 'state2');

    vm.selectedCode3 = ifExists(selections, 'code3');
    vm.selectedState3 = ifExists(selections, 'state3');

    vm.selectedGames = {
        game1: ifExists(selections, 'game1'),
        game2: ifExists(selections, 'game2'),
        game3: ifExists(selections, 'game3')
    };

    if (storageKey !== null) {
        if (storageKey !== vm.key) {
            StorageService.clearAllItems();
            vm.selectedCode1 = '';
            vm.selectedState1 = '';
            vm.selectedCode2 = '';
            vm.selectedState2 = '';
            vm.selectedCode3 = '';
            vm.selectedState3 = '';
            vm.selectedGames = {
                game1: '',
                game2: '',
                game3: ''
            };
        } 
    }

    function ifExists(obj, prop) {
        return obj !== null ? obj[prop].$modelValue : '';       
    }

    vm.submit = function (form) {


        // Incomplete selections result in dirty values, this should trigger an empty form selection error.
        var selectedOnePartial = partialCompleteChecker($j('#code1').val(), $j('#state1').val(), $j('#game1').val()),
            selectedTwoPartial = partialCompleteChecker($j('#code2').val(), $j('#state2').val(), $j('#game2').val()),
            selectedThreePartial = partialCompleteChecker($j('#code3').val(), $j('#state3').val(), $j('#game3').val());

        function partialCompleteChecker(selectedCode, selectedState, selectedGame) {

            if (selectedCode !== '') {
                if (selectedState === '' || selectedState.indexOf('?') >= 0) {
                    return true;
                }
                if (selectedGame === '' || selectedGame.indexOf('?') >= 0) {
                    return true;
                }
            } else if (selectedCode === '' && selectedState !== '' || selectedCode === '' && selectedGame !== '') {
                return true;
            } 
            return false;

        }

        // minimum of a single game must be select, can not select same game multiple times or errors are to be generated. 
        var selectedGamesStatusArr = [],
            selectedGamesValuesArr = [],
            selectedGamesEmptyError = true;

        // checks for empty strings and values, push boolean into status array and value into value array.
        for (var prop in vm.selectedGames) {
            if (vm.selectedGames.hasOwnProperty(prop)) {
                if (vm.selectedGames[prop] !== '') { 
                    selectedGamesStatusArr.push(true);
                    selectedGamesValuesArr.push(vm.selectedGames[prop]);
                } else {
                    selectedGamesStatusArr.push(false);
                }
            } 
        }

        // A single true value will set the empty error flag to false.
        for (var i = 0; i < selectedGamesStatusArr.length; i++) {
            if (selectedGamesStatusArr[i] === true) {
                selectedGamesEmptyError = false;
            }
        }

        // Selections must be unique, function is passed previously created value array for checking.
        function hasDuplicates(array) {
            var valuesSoFar = Object.create(null);
            for (var i = 0; i < array.length; ++i) {
                var value = array[i];
                if (value in valuesSoFar) {
                    return true;
                }
                valuesSoFar[value] = true;
            }
            return false;
        }

        if (selectedOnePartial || selectedTwoPartial || selectedThreePartial) {
            vm.message = vm.config.incompleteGameSelectionMessage;
            jQuery('html, body').animate({scrollTop: jQuery('#hostplusGames').offset().top -100 }, 'slow');
            return;            
        }

        if (hasDuplicates(selectedGamesValuesArr)) {
            vm.message = vm.config.duplicateGamesSelectedMessage;
            jQuery('html, body').animate({scrollTop: jQuery('#hostplusGames').offset().top -100 }, 'slow');
            return;            
        }

        if (selectedGamesEmptyError) {
            vm.message = vm.config.noGamesSelectedMessage;
            jQuery('html, body').animate({scrollTop: jQuery('#hostplusGames').offset().top -100 }, 'slow');
            return;
        }

        var queryParam = '=',
            route = vm.config.formUrl;

        // save form selections incase user decides to edit their choice and return to the selection page
        StorageService.saveItem('gameSelections', form);
        // key to check validatiy of JSON data vs storage data
        StorageService.saveItem('gameKey', vm.key);

        // loop through the selected games and get their ids
        for(var key in vm.selectedGames) {

            if(vm.selectedGames.hasOwnProperty(key)) {

                if(vm.selectedGames[key] !== '') {
                    queryParam += vm.selectedGames[key] + '|';
                }

            }

        }

        route += queryParam.slice(0, -1);

        $window.location.assign($window.location.origin + route);

    };

}