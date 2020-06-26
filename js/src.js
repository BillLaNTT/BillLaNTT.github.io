var rm = rm || {};
/* globals document, PubSub */
rm.globals = {

	DOM: {
		doc: $(document),
		html: $('html'),
		body: $('body'),
		header: $('#header'),
		mainMenuWrapper: $('.menu-primary'),
		mainMenu: $('.menu-primary').children('.menu'),
		bannerTop: $('#banner-top'),
		main: $('.main'),
		footer: $('#footer')
	},

	breakpoints: {
		smallMax: 767,
		mediumMin: 768,
		mediumMax: 991,
		largeMin: 992
	},

	ps: PubSub,

	deviceSize: '',

	hasGoogleTagMgr: false,

	scrollSpeed: 600,

	scrollAnimation: 'easeOutQuart'

};
/* global window, document, navigator, location */

/*jshint curly: false */

rm.utilities = (function ($, globals) {
	'use strict';

	var UA = navigator.userAgent,
		$window = $(window);

	var init = function() {

		_deviceDetect();
		_isIE();
		_checkForNestedLink();
		_anchorScroller();
		_printPage();
		_goBack();
		inView('.transition-in, .transition-in-up');

	};

	var getDeviceSize = function() {
		return globals.deviceSize;
	};

	var setDeviceSize = function(val) {
		globals.deviceSize = val;
	};

	var _deviceDetect = function() {

		var platform = navigator.platform;

		if ( platform === 'iPad' || platform === 'iPhone' || platform === 'iPod' ){
			globals.DOM.html.addClass('iOS');
		}

		if ( platform === 'iPad') {
			globals.DOM.html.addClass('iPad');
		}

	};

	var _isIE = function () {

		var msie = UA.indexOf('MSIE '),
			ie11 = !!UA.match(/Trident.*rv[ :]*11\./);


		if (msie > 0 || ie11) {

			globals.DOM.html.addClass('ie');

			if (ie11) {
				globals.DOM.html.addClass('ie11');
			}

			return true;

		} else {

			return false;

		}

	};

	var inView = function(elm, partiallyVisible) {

		if ( globals.DOM.html.hasClass('no-csstransitions') ) return;

		var $animEl = $(elm);

		function inViewport(el) {

			//special bonus for those using jQuery
			if (typeof jQuery === 'function' && el instanceof jQuery) {
				el = el[0];
			}

			var rect = el.getBoundingClientRect(),
				rectMiddle = (rect.top + (rect.height / 2)); // top half of element

			if(partiallyVisible) {
				return (
					(rect.top <= (window.innerHeight || document.documentElement.clientHeight)) ||
					(rect.bottom <= (window.innerHeight || document.documentElement.clientHeight))
				);
			} else {
				return (
					rect.top >= 0 &&
					rectMiddle <= (window.innerHeight || document.documentElement.clientHeight)
				);
			}

		}

		function scrollCheck() {

			if($animEl.length) {

				$animEl.each(function(i, el) {

					if (inViewport(el)) {
						$(el).addClass('in-view');
					}

				});

			}

		}

		// debounce scroll every 100ms
		$window.on('scroll touchmove', $.throttle(100, scrollCheck));

	};

	var _checkForNestedLink = function() {

		// we need to run a custom function for nested links within PDS/Member Guide
		if (globals.DOM.body.hasClass('member-guide')) { return; }

		var hash = getHash();

		if(hash.length > 0) {

			jumpToSection('#' + hash);

		}

	};

	var _anchorScroller = function() {

		$('a[href*=#]:not([href=#])').on('click', function(e) {

			// don't run this function if the clicked anchor has a bootstrap datatoggle attribute
			if ( $(this).attr('data-toggle') ) return;

			// verify that the link is an internal link (by comparing it with the current url)
			if (location.href.replace(/\#.*/,'') === this.href.replace(/\#.*/,'')) {

				e.preventDefault();

				jumpToSection(this.hash);

			}
		});

	};

	var _getSectionOffset = function(obj) {

		// var offSet = 0,
		// 	headerHeight = globals.DOM.header.outerHeight();

		// offSet = obj.offset().top - headerHeight + 'px';

		// console.log('object offest top: ', obj.offset().top);
		// console.log('header height:', headerHeight);
		// console.log('section offset: ', offSet);

		var offSet = 0;

		// check if we're on large screens
		if (getDeviceSize() === 'large') {

			// 120px for sticky header - large device
			offSet = obj.offset().top - 120 + 'px';

		} else {

			// 60px for sticky header - small device
			offSet = obj.offset().top - 60 + 'px';

		}

		return offSet;

	};

	var getHash = function () {

		return window.location.hash.substr(1);

	};

	var getQueryVariable = function(variable) {

	   var query = window.location.search.substring(1),
			vars = query.split('&');

	   for (var i = 0; i < vars.length; i++) {
		   var pair = vars[i].split('=');
		   if(pair[0] === variable){ return pair[1]; }
	   }

	   return(false);

	};

	var goToPage = function(val) {
		window.location = val;
	};

	var jumpToSection = function(val) {

		var scrollTopVal = 0,
			$sectionObj = $(val);

		if ($sectionObj.length > 0) {

			scrollTopVal = _getSectionOffset($sectionObj);

			$('html, body').animate({
				scrollTop: scrollTopVal
			}, globals.scrollSpeed, globals.scrollAnimation, function() {
				// add keyboard focus to the area which the anchor went to
				$sectionObj.focus();
			});

			return false;

		}

	};

	var scrollToElement = function(el) {

		$('html, body').animate({
			scrollTop: el.offset().top + 'px'
		}, globals.scrollSpeed, globals.scrollAnimation, function() {
			globals.DOM.body.blur(); // reset keyboard focus
		});

	};

	var _printPage = function() {

		$('.js-print-page').on('click', function (e) {

			e.preventDefault();
			window.print();

		});

	};

	var _goBack = function() {

		$('.js-back-link').on('click', function () {

			window.history.back();
			return false;

		});

	};

	// only run this function once
	var bgImageLoadHasRun = false,
		bgImageLoad = function() {

		var $bgWrapper = $('.section-bg');

		if (!$bgWrapper.length || bgImageLoadHasRun) return;

		bgImageLoadHasRun = true;

		// must use each loop in case multiple section-bg's on a page, (like the homepage).
		// otherwise it will wait for *all* bgimages to load before showing them at once
		$bgWrapper.each(function(i, el) {

			var $el = $(el),
				bgImage = $el.css('background-image').replace(/^url\(["']?/, '').replace(/["']?\)$/, '');

			// its not possible to have a load event for css backgorund images,
			// this is a simple work around
			$('<img/>').attr('src', bgImage).on('load', function() {
				$(this).remove(); // prevent memory leaks
				// image has loaded, remove the blank element blocking the image
				$el.removeClass('blank-bg');
			});
		});

	};

	// https://developer.mozilla.org/en-US/docs/Web/API/document/cookie
	var cookies = {

		get: function (sKey) {

			if (!sKey) { return null; }

			return decodeURIComponent(document.cookie.replace(new RegExp('(?:(?:^|.*;)\\s*' + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=\\s*([^;]*).*$)|^.*$'), '$1')) || null;

		},

		set: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {

			if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }

			var sExpires = '';

			if (vEnd) {
				switch (vEnd.constructor) {
					case Number:
					sExpires = vEnd === Infinity ? '; expires=Fri, 31 Dec 9999 23:59:59 GMT' : '; max-age=' + vEnd;
					break;
					case String:
					sExpires = '; expires=' + vEnd;
					break;
					case Date:
					sExpires = '; expires=' + vEnd.toUTCString();
					break;
				}
			}

			// Bloody IE doesn't support max age so use expires
			// http://mrcoles.com/blog/cookies-max-age-vs-expires/
			if(_isIE()) {

				var date = new Date();
				date.setTime(date.getTime() + (vEnd * 1000));
				sExpires = '; expires=' + date.toUTCString();

			}

			document.cookie = encodeURIComponent(sKey) + '=' + encodeURIComponent(sValue) + sExpires + (sDomain ? '; domain=' + sDomain : '') + (sPath ? '; path=' + sPath : '') + (bSecure ? '; secure' : '');
			return true;

		}

	};

	// get height of all boxes - the tallest overwrites all others
	var setBoxHeight = function(el) {

		var boxHeight = -1;

		el.each(function() {

			boxHeight = Math.max(boxHeight, $(this).height());
			// console.log('Heights: ', $(this).height());

		}).height(boxHeight);

	};

	var getSelectedOption = function(el) {
		return $('option:selected', el);
	};

	var elementExists = function(el) {
		return $(el).length > 0;
	};

	return {
		init: init,
		getHash: getHash,
		getQueryVariable: getQueryVariable,
		goToPage: goToPage,
		jumpToSection: jumpToSection,
		scrollToElement: scrollToElement,
		cookies: cookies,
		inView: inView,
		bgImageLoad: bgImageLoad,
		getDeviceSize: getDeviceSize,
		setDeviceSize: setDeviceSize,
		setBoxHeight: setBoxHeight,
		getSelectedOption: getSelectedOption,
		elExists: elementExists
	};

})($, rm.globals);

/* global window, enquire */
rm.responsivejs = (function ($, globals, utils) {
	'use strict';

	var activeBreakpoint = '';

	var initialize = function() {

		enquire
			.register('screen and (max-width:' + globals.breakpoints.smallMax + 'px)', {
                match: function() {
        	        activeBreakpoint = 'small';
            	}
			}, false)
			.register('screen and (min-width: ' + globals.breakpoints.mediumMin + 'px) and (max-width:' + globals.breakpoints.mediumMax + 'px)', {
                match: function() {
        	        activeBreakpoint = 'medium';
            	}
			}, false)
            .register('screen and (min-width:' + globals.breakpoints.largeMin + 'px)', {
                match: function() {
        	        activeBreakpoint = 'large';
            	}
        	}, true);

		// ================================================================
		// enquire js attachs a window resize event to detect window size
		// so everytime the window resizes, the register callbacks fire.
		// ================================================================
		// to prevent scripts firing multiple times,
		// only publish device size if it's different to activeBreakpoint
		// ================================================================
		_checkBreakpoint();
		$(window).on('resize', $.throttle(800, _checkBreakpoint));

	};

	var _checkBreakpoint = function() {

		if(utils.getDeviceSize() !== activeBreakpoint) {

			// console.log('setting device size to: ', activeBreakpoint);

			utils.setDeviceSize(activeBreakpoint);

			globals.ps.publish('/device/' + utils.getDeviceSize());

		}

	};

	return {
		init: initialize
	};

})($, rm.globals, rm.utilities);

/*globals dataLayer*/
// dataLayer = analytics required by reseo

rm.tracking = (function (globals, $) {

	'use strict';

	var initialize = function() {
		_checkForAnalytics();
		_trackGoal();
	};

	var _checkForAnalytics = function() {

		if(typeof dataLayer !== 'undefined') {
			globals.hasGoogleTagMgr = true;
		}

		return globals.hasGoogleTagMgr;

	};

	var trackBasicEvent = function(evt) {

		if(!!globals.hasGoogleTagMgr) {
			dataLayer.push({'event': evt});
		}

	};

	var trackEvent = function(evt, action, label) {

		if(!!globals.hasGoogleTagMgr) {
			// console.log('tracking event: ', [evt, action, label]);
			dataLayer.push({'event': evt, 'event-action': action, 'event-label': label});
		}

	};

	var trackUrl = function(evt, description, url) {

		if(!!globals.hasGoogleTagMgr) {
			dataLayer.push({'event': evt, 'event-description': description, 'event-destination': url});
		}

	};

	var trackExperiment = function(val) {

		if(!!globals.hasGoogleTagMgr && val.length > 0) {
			// console.log('concierge tracking experiment: ', val);
			dataLayer.push({'experiment': val});
		}

	};

	var _trackGoal = function() {

		function getParameterByName(name, url) {
		    name = name.replace(/[\[\]]/g, '\\$&');
		    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
		        results = regex.exec(url);
		    if (!results) {
		    	return null;
		    }
		    if (!results[2]) {
		    	return '';
		    }
		    return decodeURIComponent(results[2].replace(/\+/g, ' '));
		}


		$('a[href*="hp-sc-tracking"]').on('click', function() {

			
			var href = $(this).attr('href');
			var scGoalId = getParameterByName('hp-sc-tracking', href);
			//console.log(scGoalId);

			if (scGoalId) {

				$.ajax({
					method: 'POST',
					contentType: 'application/json',
					dataType: 'json',
					url: '/api/analytics/TriggerHostplusAnalyticsEvent',
					data: JSON.stringify({
						Id: scGoalId
					})
				});
				 
				/*.done(function( msg ) {
					console.log( 'Data Saved: ' + msg );
				});*/

			} 


			
		}); 
		

	};

	// public api
	return {
		init: initialize,
		trackEvent: trackEvent,
		trackBasicEvent: trackBasicEvent,
		trackExperiment: trackExperiment,
		trackUrl: trackUrl
	};

})(rm.globals, $);
/*globals window */
/*jshint curly: false */

rm.header = (function ($, globals) {
	'use strict';

    var lastScrollTop = 0;
        // $indexedMenu;

    var init = function() {

        // nudge the window
        // this triggers the menu to show if we've refreshed the page after scrolling down
        setTimeout(function() {
           $(window).scroll();
        }, 1);

        globals.ps.subscribe('/device/small', function() {

            _sneakyNavSmall();

            $(window).off('scroll.largeDevice');
            $(window).on('scroll.smallDevice', $.throttle( 100, _sneakyNavSmall ));

        });

        globals.ps.subscribe('/device/medium', function() {

            _sneakyNavSmall();

            $(window).off('scroll.largeDevice');
            $(window).on('scroll.smallDevice', $.throttle( 100, _sneakyNavSmall ));

        });

        globals.ps.subscribe('/device/large', function() {

            _stickyHeaderLarge();

            $(window).off('scroll.smallDevice');
            $(window).on('scroll.largeDevice', $.throttle( 100, _stickyHeaderLarge ));

        });

        globals.ps.subscribe('/action/mobile-menu-closed', function() {
            _sneakyNavSmall();
        });

    };

    var _sneakyNavSmall = function() {

        var headerHeight = globals.DOM.header.outerHeight() + (globals.DOM.bannerTop.outerHeight() || 0),
            scrollTop = $(window).scrollTop();

        // if menu is open, it should be sticky, and it should never disappear on scroll
        if (globals.DOM.body.hasClass('menu-open') && globals.DOM.body.hasClass('top')) {
            globals.DOM.header.addClass('header-fixed-top');
            return;
        }

        // when scrolling down do not hide the menu if its already open
        if (globals.DOM.body.hasClass('menu-open')) {
            return;
        }

        if (scrollTop > lastScrollTop && scrollTop >= headerHeight) {

            // Scroll DOWN
            globals.DOM.header.addClass('translate-header');
            globals.DOM.body.removeClass('top');
            globals.DOM.bannerTop.addClass('banner-hidden');


        } else if ( $(window).scrollTop() <= headerHeight ) {

            // back at the TOP, reset the header to default state
            globals.DOM.bannerTop.removeClass('banner-hidden');
            globals.DOM.body.addClass('top');
            globals.DOM.header.removeClass('header-lock header-fixed-top translate-header');

         } else {

            // Scroll UP
            globals.DOM.header.removeClass('translate-header').addClass('header-lock');

        }

        lastScrollTop = scrollTop;

    };

    var _stickyHeaderLarge = function () {

        if ( $(window).scrollTop() > 0 ) {
            globals.DOM.header.addClass('header-lock');
            globals.DOM.body.removeClass('top');
            globals.DOM.bannerTop.addClass('banner-hidden');
        } else {
            globals.DOM.header.removeClass('header-lock');
            globals.DOM.body.addClass('top');
            globals.DOM.bannerTop.removeClass('banner-hidden');
        }

    };

    return {
        init: init
    };

})($, rm.globals);
/*globals window */
rm.menu = (function ($, globals, tracking) {
	'use strict';

	var $overlay = $('.overlay'),
		$mainMenubar = $('#main-menubar'),
		$siteSearch = $('#site-search'),
		$toggleMenuMobile = $('#toggle-menu-mobile'),
		//$toggleSearchMobile = $('#toggle-search-mobile'),
		$menuPrimary = $('.menu-primary'),
		$menuBg = $('.menu-bg');

	var initialize = function() {

		_supportAutoScroll();
		_overlayClose();

		// the function below adds extra functionality to bootstrap's 'collapse' function,
		// enabling 'active' classes to be toggled on the trigger buttons
		_bsCollapseActiveToggler();

		globals.ps.subscribe('/device/small', function() {

            _menuMobile();

        });

        globals.ps.subscribe('/device/medium', function() {

            _menuMobile();

        });

        globals.ps.subscribe('/device/large', function() {

        	_menuDesktop();

        });

	};


	var _closeMenu = function() {

		// only do all of this stuff if the menu is actually open
		// otherwise its a waste to do it all on each resize
		if (globals.DOM.body.hasClass('menu-open')) {

			// console.log('closing menu');

			// for mobile
			// $mainMenubar.collapse('hide'); // bs trigger to hide menu
			// $siteSearch.collapse('hide'); // bs trigger to hide search
			// $toggleMenuMobile.removeClass('active');
			//$toggleSearchMobile.removeClass('active');
			// globals.ps.publish('/action/mobile-menu-closed');

			// for desktop
			// $menuPrimary.removeClass('open');
			// globals.DOM.header.find('.active').removeClass('active fade-delay').attr('aria-expanded', false);
			// globals.DOM.header.find('.megamenu-visible').removeClass('megamenu-visible fade-delay');
			// $menuBg.removeAttr('style');
			// $siteSearch.removeClass('in fade-delay');

			// globals.DOM.body.removeClass('menu-open');
			// $overlay.removeClass('visible');

			if(globals.deviceSize !== 'large') {
				globals.DOM.header.find('.active').removeClass('active fade-delay').attr('aria-expanded', false);
				_closeMenuMobile();
			} else {
				_closeMenuDesktop();
			}

		}

	};

	var _openMenuMobile = function() {
		globals.DOM.body.addClass('menu-open');
		$siteSearch.collapse('show');
		$overlay.addClass('visible');
	};

	var _closeMenuMobile = function() {
		$mainMenubar.collapse('hide');
		$siteSearch.collapse('hide');
		$toggleMenuMobile.removeClass('active');
		globals.DOM.body.removeClass('menu-open');
		$overlay.removeClass('visible');
		globals.ps.publish('/action/mobile-menu-closed');
	};

	var _closeMenuDesktop = function() {
		globals.DOM.header.find('.active').removeClass('active fade-delay').attr('aria-expanded', false);
		globals.DOM.header.find('.megamenu-visible').removeClass('megamenu-visible fade-delay');
		$menuPrimary.removeClass('open');
		$siteSearch.removeClass('in fade-delay');
		$menuBg.removeAttr('style');
		globals.DOM.body.removeClass('menu-open');
		$overlay.removeClass('visible');
	};

	// var _closeSearchMobile = function() {
	// 	$siteSearch.collapse('hide');
	// };

	var _menuMobile = function() {

		//unbind large events
		$mainMenubar.off('click.desktopMenu');

		$toggleMenuMobile.on('click', function() {

			// menu open AND search open - close all
			// if($(this).hasClass('active') && $toggleSearchMobile.hasClass('active')) {

			// 	_closeSearchMobile();
			// 	_closeMenuMobile();

			// }
			// menu open AND search NOT open - close menu
			// else if ($(this).hasClass('active') && !$toggleSearchMobile.hasClass('active')) {
			// 	_closeMenuMobile();
			// }
			if ($(this).hasClass('active')) {
				_closeMenuMobile();
			}
			// nothing's open so open the clicked item
			else {
				_openMenuMobile();
			}

		});

		// $toggleSearchMobile.on('click', function() {

		// 	// search open AND menu NOT open - close search
		// 	if($(this).hasClass('active') && !$toggleMenuMobile.hasClass('active')) {
		// 		_closeSearchMobile();
		// 		_closeMenuMobile();
		// 	}
		// 	// nothing's open so open the clicked item
		// 	else {
		// 		_openMenuMobile();
		// 	}

		// });

		$mainMenubar.on('click.mobileMenu', '.megamenu-trigger', function() {
			return;
        });

        $("#join-links-mobile, #login-links-mobile").on("show.bs.collapse", function () {
            $("#join-links-mobile.collapse.in, #login-links-mobile.collapse.in").collapse("hide");
        });

	};

	var _menuDesktop = function() {

		var megamenuFadeDelay = 300; // timeout until megamenu panel content fades in

		//unbind mobile events
		$mainMenubar.off('click.mobileMenu');
		$toggleMenuMobile.off('click');
		//$toggleSearchMobile.off('click');

		$('.menu-close-btn').on('click', function(e) {

			e.preventDefault();

			var $activeMenuTrigger = $('.megamenu-trigger.active');

			if ($activeMenuTrigger.hasClass('active')) { // closing

				$activeMenuTrigger.removeClass('active').attr('aria-expanded', false);
				// _closeMenu();
				_closeMenuDesktop();

			}

		});

		// megamenu dropdown buttons
		$mainMenubar.on('click.desktopMenu', '.megamenu-trigger', function(e) {

			// console.log('menu desktop item clicked');

			e.preventDefault(); // open nav

			var $this = $(this),
				$thisControls = $($this.data('target'));

			// console.log('menu item data target: ', $thisControls);

			if ( $thisControls.attr('id') === 'site-search') {
				// put keyboard focus on search input
				// needed to put this in a separate eventstack otherwise it outruns bootstrap's collapse
				// don't run it on iOS though, cos safari can't handle focus()
				if (!globals.DOM.html.hasClass('iOS')) {
					setTimeout(function() {
						$('#site-search-input').focus();
					}, 0);
				}

				// bootstrap must not run if on desktop
				e.stopPropagation();
				$siteSearch.removeAttr('style');

			}

			// start by hiding all other content
			globals.DOM.header.find('.fade-delay').removeClass('fade-delay');
			globals.DOM.header.find('.megamenu-visible').removeClass('megamenu-visible');

			if ($this.hasClass('active')) { // closing

				$this.removeClass('active').attr('aria-expanded', false);
				// _closeMenu();
				_closeMenuDesktop();

			} else { // opening

				$thisControls.addClass('megamenu-visible');
				$menuPrimary.addClass('open');
				globals.DOM.body.addClass('menu-open');

				// first find anything else active, and make it inactive
				globals.DOM.header.find('.active').removeClass('active').attr('aria-expanded', false);
				// then make $this active
				$this.attr('aria-expanded', true).addClass('active');

				var bgHeight = $thisControls.outerHeight();

				// console.log('menu bg obj: ', $menuBg);
				// console.log('bg height: ', bgHeight);
				_setMenuBgPosition(bgHeight);

				setTimeout(function() {
					$thisControls.addClass('fade-delay');
				}, megamenuFadeDelay);

				$overlay.addClass('visible');
			}

		});

		// iOS triggers 'resize' on a scroll. this is the workaround
		var windowWidth = $(window).width();

		var resizeCloseMenu = function() {
			if($(window).width() !== windowWidth) {
				_closeMenu();
				windowWidth = $(window).width();
			}
		};

		// close menu when browser is resized
		$(window).on('resize', $.throttle( 1000, resizeCloseMenu ));

		// press ESC to close menu
		globals.DOM.doc.on('keyup', function(e) {
		    if (e.keyCode === 27) {

		    	// only track if menu open and esc key pressed
		    	if(globals.DOM.body.hasClass('menu-open')) {
		    		tracking.trackBasicEvent('MegaMenu Escape');
		    	}

		        // _closeMenu();
		        _closeMenuDesktop();

		    }
		});

	};

	var _setMenuBgPosition = function(height) {

		// console.log('setting menubg pos');

		$menuBg.css({
			'-ms-transform': 'translateY(' + height + 'px)',
			'-webkit-transform': 'translateY(' + height + 'px)',
			'transform': 'translateY(' + height + 'px)'
		});

	};

	var _overlayClose = function() {

		// close menu and search input on overlay click
		$overlay.on('click', function(e) {
			e.preventDefault();
			_closeMenu();
		});

	};

	var _bsCollapseActiveToggler = function() {

		$('.collapse').on('show.bs.collapse', function (e) {
			e.stopPropagation();

			var trigger = e.target.id;

			$('[href="#' + trigger + '"]').addClass('active');
			$('button[data-target="#' + trigger + '"]').addClass('active');

		}).on('hide.bs.collapse', function (e) {
			e.stopPropagation();

			var trigger = e.target.id;

			$('[href="#' + trigger + '"]').removeClass('active');
			$('button[data-target="#' + trigger + '"]').removeClass('active');

		});

	};

    var _supportAutoScroll = function() {

    	var $supportToggle = $('#support-toggle'),
    		$supportCollapse = $('#support-collapse');

    	$supportToggle.on('click', function() {

    		if ( !$(this).hasClass('active') ) {

	    		setTimeout(function(){

		    		$('.header-inner').stop(true, true).animate({
				        scrollTop: $supportCollapse.offset().top
				    }, 300);

	    		}, 300);

    		}

    	});

    };

	// public api
	return {
		init: initialize
	};

})($, rm.globals, rm.tracking);
/*globals document, window */

rm.concierge = (function($, utils, tracking) {

	'use strict';

	var init = function() {

		if (!window.conciergeData) { return; }

		utils.bgImageLoad();
		_conciergeForm();

	};

	var _conciergeForm = function() {

		var $primarySelect = $('#concierge-primary'),
			$secondarySelect = $('#concierge-secondary'),
			$primaryAnchor = $('a[data-id="concierge-primary"]'),
			$secondaryAnchor = $('a[data-id="concierge-secondary"]').removeClass('attention'),
			$conciergeSubmitBtn = $('#concierge-submit'),
			currentPrimary = '',
			currentSecondary = '';

		$conciergeSubmitBtn.on('click', function(e) {

			e.preventDefault();

			var selectedAudience = utils.getSelectedOption($primarySelect[0]).val(),
				cookieExpiryInSeconds = 31536000; // 1 year in seconds

			utils.cookies.set('concierge-audience', selectedAudience, cookieExpiryInSeconds);

			// console.log('selected audience val on btn click: ', selectedAudience);
			// console.log('concierge button href: ', $(this).attr('href'));
			// console.log(utils.cookies.get('concierge-audience'));

			window.location = $(this).attr('href');

		});

		$primarySelect.on('shown.bs.select', function(e) {
			// Select click listener - audience
			tracking.trackEvent('primary select', 'audience', 'primary-select');
			currentPrimary = e.target.value;
			$conciergeSubmitBtn.removeClass('attention-hoz');

			// console.log('current PRIMARY val on show: ', currentPrimary);

		}).on('hide.bs.select', function(e) {

			var $this = $(this),
				$selected = utils.getSelectedOption($primarySelect[0]),
                selectedVal = $selected.val(),
                selectedText = $selected.text();

            // console.log('selected PRIMARY val on hide: ', selectedVal);

			// check if user selected the same thing from primary again,
			// if so don't regenerate the secondary
			if (currentPrimary === selectedVal) {
				e.preventDefault();
				return;
			}

			// OnBlur click listener – audience
			tracking.trackEvent('primary option', 'audience', selectedText);

			// prevent animation on primary
			// add animation to secondary
			$primaryAnchor.removeClass('attention');
			$secondaryAnchor.addClass('attention');

			// empty the secondary dropdown before refilling it
			$secondarySelect.empty();

			// dont append dom inside a loop (dom thrashing)
			// instead cache inside a document fragment
			// https://learn.jquery.com/performance/append-outside-loop/
			var $frag = $(document.createDocumentFragment());

			window.conciergeData.forEach(function(e) {

				// console.log('selected text:', selectedText);
				// console.log('audience text:', e.AudienceText);

				if (selectedText === e.AudienceText) {

					e.Actions.forEach(function(i) {

						$frag.append( $('<option></option>')
							.attr({
								'value': i.ActionText,
								'data-href': i.LinkUrl,
								'data-target': i.LinkTarget,
								'data-title': i.LinkTitleAttribute
							}).text(i.ActionText));

					});

					// break out of loop once match found
					return false;

				}

			});

			// append the doc fragment into the select
			$secondarySelect.append($frag);

			// refresh the plugin once secondary options have been updated
			$secondarySelect.selectpicker('refresh');

			// set submit button attributes
			var $selectedOption = utils.getSelectedOption($secondarySelect[0]);

			$conciergeSubmitBtn.attr({
				'href': $selectedOption.data('href'),
				'title': $selectedOption.data('title'),
				'target': $selectedOption.data('target')
			});

			// Change the default placeholder looking dropdown text colour to the main, active colour
			var $visibleValue = $this.next().find('.filter-option');

			if( !$visibleValue.hasClass('is-selected') ) {
				$visibleValue.addClass('is-selected');
			}

		});

		$secondarySelect.on('shown.bs.select', function(e) {
			// Select click listener - action
			tracking.trackEvent('secondary select', 'action', 'secondary-select');
			currentSecondary = e.target.value;
			$conciergeSubmitBtn.removeClass('attention-hoz');

			// console.log('current SECONDARY val on show: ', currentSecondary);

		}).on('hide.bs.select', function(e) {

			var $this = $(this),
				$selectedOption = utils.getSelectedOption(this),
				selectedVal = $this.val(),
				numOfOptions = $this.find('option').length;

			// console.log('selected SECONDARY val on hide: ', selectedVal);

			// check if you've selected the same secondary thing again,
			// if so don't bother update the button attributes
			// if there's only 1 option, accept this as a valid selection
			if (currentSecondary === selectedVal && numOfOptions !== 1) {
				e.preventDefault();
				return;
			}

			// OnBlur click listener - action
			tracking.trackEvent('secondary option', 'action', selectedVal);

			// set submit button attributes
			$conciergeSubmitBtn.attr({
				'href': $selectedOption.data('href'),
				'title': $selectedOption.data('title'),
				'target': $selectedOption.data('target')
			}).addClass('attention-hoz');

			// Change the default placeholder looking dropdown text colour to the main, active colour
			var $visibleValue = $this.next().find('.filter-option');

			if( !$visibleValue.hasClass('is-selected') ) {
				$visibleValue.addClass('is-selected');
			}

		});

	};

	return {
		init: init
	};

})($, rm.utilities, rm.tracking);
/*globals window */
rm.backToTop = (function ($, globals, utils) {

	'use strict';

	var $topBtn = $('.back-to-top').find('a');

	var initialize = function() {

		$(window).on('scroll', $.throttle(800, _checkScrollTop));

		// scroll body to 0px on click
		$topBtn.on('click', function (e) {
			e.preventDefault();

			utils.scrollToElement(globals.DOM.main);

		});
	};

	function _checkScrollTop(el) {

		if ($(el.currentTarget).scrollTop() > 500) {

			$topBtn.addClass('visible');

		} else {

			$topBtn.removeClass('visible');

		}

	}

	// public api
	return {
		init: initialize
	};

})($, rm.globals, rm.utilities);
rm.naturalLanguageForm = (function ($, concierge, tracking) {

	'use strict';

	var init = function() {

        _customiseDropDown();

	};

    var _customiseDropDown = function() {

        var $select = $('.nl-form-select'),
            icon = '';

        $select.each(function() {

            var $this = $(this);

            $this.selectpicker({
                style: 'custom-dropdown',
                showIcon: false

            }).on('loaded.bs.select', function() {

                // once the plugin has loaded, add the visible class
                $this.closest('.nl-form').addClass('visible');

                // add the attention class to the custom select box
                var $thisCustomDropdown = $this.next().find('.custom-dropdown').addClass('attention');

                // move the dropdown inside the <a> for positioning
                // but don't do it on the members guide cos it causes a scroll bug
                if (this.id !== 'mg-sections') {
                    $this.next().find('.select-dropdown').appendTo($thisCustomDropdown);
                }

                // if we've just loaded the secondary concierge plugin
                // we know we now need to init the concierge functionality
                if (this.id === 'concierge-secondary') {
                    concierge.init();
                }

            });

        }).on('shown.bs.select', function() {

            // once you've opened a dropdown,
            // prevent anymore attention animations
            $('.nl-form').find('.custom-dropdown').removeClass('attention');

        });

        // the concierge labels must be a sibling to the dropdown <a> so we can inline them
        $('#concierge-form').find('label').each(function() {

            var $this = $(this),
                $nextInsert = $this.nextAll('.bootstrap-select').first();

            $this.prependTo( $nextInsert );

        });

        // TEMP: The following tracking is for AB testing
        // TODO: remove once AB test results determine desired outcome
        var testResult = '',
            $conciergeSelect = $('#concierge-form').find('.nl-form-select');

        if($conciergeSelect.hasClass('is-original')) {
            testResult = 'A';
        } else {
            testResult = 'B';
        }

        tracking.trackExperiment(testResult);

        // if/else for A/B testing purposes only
        // TODO: cleanup after A/B decision made
        // replace selectpicker icon button with custom SVG
        if($select.hasClass('is-original')) {

            icon = '<svg class="icon icon-dd-cta-alt">' +
                '<use xlink:href="#icon-carret-down" />' +
            '</svg>';

        } else {

            icon = '<button type="button" class="btn-dropdown"><svg class="icon icon-dd-cta-alt">' +
                '<use xlink:href="#icon-carret-down" />' +
            '</svg></button>';

        }

        $('.custom-dropdown').children('.caret').replaceWith(icon);

    };

	return {
		init: init
	};

})($, rm.concierge, rm.tracking);
rm.nextBestAction = (function ($, utils, tracking) {

	'use strict';

	var init = function() {

        _submitForm();

	};

    var _submitForm = function() {

        var $form = $('.nl-form-nba'),
            $select = $('select#cta-nba');

        $form.on('submit', function(e) {
            e.preventDefault();

            var $selected = utils.getSelectedOption($select),
                $selectText = $selected.text(),
                $selectVal = $selected.val();

            tracking.trackUrl('next best action', $selectText, $selectVal);
            utils.goToPage($selectVal);

        });

    };

	return {
		init: init
	};

})($, rm.utilities, rm.tracking);

rm.stickycta = (function ($) {
    'use strict';

    var init = function () {
        if (typeof sessionStorage.getItem('set') === 'undefined' || sessionStorage.getItem('set') != "set") {
            $("#sticky-cta-container").show();
        } else {
            $("#sticky-cta-container").hide();
        }

        $("#sticky-cta-container .sticky-cta-close").bind("click",
            function () {
                sessionStorage.setItem('set', 'set');
                $("#sticky-cta-container").hide();
            });
    };
    // public api
    return {
        init: init
    };
})($);
/*globals window */
rm.memberGuide = (function ($, globals, utils) {

	'use strict';

	var $subNav = $('.mg-sections'),
		$select = $('#mg-sections'),
		subNavTop = 0,
		defaultSubNavHeight = 0,
		stickyHeaderHeight = 0,
		stickyNavHeight = 66,
		magicStickyOffsetHeight = 0;

	var initialize = function() {

		var $window = $(window);

		globals.ps.subscribe('/device/small', function() {

			stickyHeaderHeight = 58;
			_setStickyOffset();
			_checkSectionNavPositionSmall();

			$window.off('scroll.largeDevice');
			$window.on('scroll.smallDevice', $.throttle(100, _checkSectionNavPositionSmall));

        });

        globals.ps.subscribe('/device/medium', function() {

        	stickyHeaderHeight = 70;
        	_setStickyOffset();
        	_checkSectionNavPositionSmall();

        	$window.off('scroll.largeDevice');
			$window.on('scroll.smallDevice', $.throttle(100, _checkSectionNavPositionSmall));

        });

        globals.ps.subscribe('/device/large', function() {

        	stickyHeaderHeight = 114;
        	_setStickyOffset();
        	_checkSectionNavPositionLarge();

        	$window.off('scroll.smallDevice');
			$window.on('scroll.largeDevice', $.throttle(100, _checkSectionNavPositionLarge));

        });

		if($subNav.length) {

			var hash = utils.getHash();

			defaultSubNavHeight = _getSubnavHeight();
			subNavTop = _getSectionNavTop();
			_submitForm();

			if(hash.length > 0) {

				_updateSubnavSelection(hash);
				_jumpToSubSection('#' + hash);

			}

		}

	};

	var _getHeaderHeight = function() {
		return globals.DOM.header.outerHeight();
	};

	var _getSubnavHeight = function() {
		return $subNav.outerHeight();
	};

	var _getSectionNavTop = function() {
		return $subNav.offset().top;
	};

	var _setStickyHeaderHeight = function () {
		return _getHeaderHeight();
	};

	var _getStickyHeaderHeight = function() {

		// set sticky header height if header is sticky AND the header height does not match the default sticky header height
		// otherwise, just return the sticky header height;
		if(globals.DOM.header.hasClass('header-lock') && globals.DOM.header.outerHeight() !== stickyHeaderHeight) {
			// console.log('header is sticky AND height does not match');
			return _setStickyHeaderHeight();
		} else {
			// console.log('just return the current sticky header height');
			return stickyHeaderHeight;
		}

	};

	var _setStickyOffset = function() {
		magicStickyOffsetHeight = (stickyHeaderHeight + stickyNavHeight);
	};

	var _getSectionOffset = function(obj) {

		// console.log('getting section offset...');

		var elTop = obj.offset().top;

		// sticky nav has fixed pos which takes it out of the DOM,
		// changing the top position of each element on the page.
		// So let's subtract that if we're accessing the section nav BEFORE it sticks under the header.
		// Slightly different values between small & large breakpoints.
		if(!$subNav.hasClass('is-sticky')) {

			// elTop = elTop - defaultSubNavHeight;
			elTop = elTop - (defaultSubNavHeight + 70); // 70px accomodates for bottom margin of section nav module

		}

		// console.log('section offset: ', elTop - magicStickyOffsetHeight);

		return (elTop - magicStickyOffsetHeight)  + 'px';

	};

	var _translateSectionNav = function(offsetVal) {

		// console.log('translate offsetval: ', offsetVal);

		$subNav.css({
			'-ms-transform': 'translateY(' + offsetVal + 'px)',
			'-webkit-transform': 'translateY(' + offsetVal + 'px)',
			'transform': 'translateY(' + offsetVal + 'px)'
		});

	};

	var _cleanStyles = function() {

		$subNav.removeAttr('style');
    	globals.DOM.header.removeAttr('style');

	};

	var _hideSectionNav = function() {

		var offScreenVal = stickyNavHeight * 2;
		_translateSectionNav(-offScreenVal);

	};

	var _resetSectionNavPosition = function() {

		_cleanStyles();
		$subNav.removeClass('is-sticky');

	};

	var _updateSubnavSelection = function(val) {
		$select.selectpicker('val', val);
	};

    var _updateUrl = function(hash) {
    	window.location.hash = hash;
    	return false;
    };

	var _jumpToSubSection = function(val) {

		var scrollTopVal = 0,
            $sectionObj = $(val);

        if ($sectionObj.length > 0) {

        	scrollTopVal = _getSectionOffset($sectionObj);

        	$('html, body').animate({
                scrollTop: scrollTopVal
            }, globals.scrollSpeed, globals.scrollAnimation, function() {
                // add keyboard focus to the area which the anchor went to
                $sectionObj.focus();
                // console.log('new el top:', $sectionObj.offset().top);
            });

            return false;

        }

	};

	var _checkSectionNavPositionSmall = function() {

		if($subNav.length) {

			// console.log('checking position on small...');
			stickyHeaderHeight = _getStickyHeaderHeight();

	    	if ($(window).scrollTop() >= subNavTop) {

	    		$subNav.addClass('is-sticky');

	    		// // if the header is visible or 'locked' while scrolling up on mobile,
    			// // translate the section nav to sit below visible header
    			if(globals.DOM.header.hasClass('header-lock') && !globals.DOM.header.hasClass('translate-header')) {

    				console.log('scrolling up - header visible');
    				_translateSectionNav(stickyHeaderHeight);

    			} else {

    				// otherwise, shift the section nav offcanvas along with header
    				console.log('scrolling down - header hidden');
    				_hideSectionNav();

    			}

	    	} else {

	    		if($subNav.hasClass('is-sticky')) {

	    			_resetSectionNavPosition();

	    		}

	    	}

	    }

	};

	var _checkSectionNavPositionLarge = function() {

		if($subNav.length) {

			stickyHeaderHeight = _getStickyHeaderHeight();

			// console.log('checking position on large...');

	    	if ($(window).scrollTop() >= subNavTop) {

	    		$subNav.addClass('is-sticky');
	    		_translateSectionNav(stickyHeaderHeight);

	    	} else {

	    		if($subNav.hasClass('is-sticky')) {

	    			_resetSectionNavPosition();

	    		}

	    	}

	    }

	};

	var _submitForm = function() {

        var $form = $('.nl-form-mg-sections');

        $form.on('submit', function(e) {
            e.preventDefault();

            var selectedVal = utils.getSelectedOption($select[0]).val(),
            	selectedId = '#' + selectedVal;

            _updateUrl(selectedId);
            _jumpToSubSection(selectedId);

        });

    };

	// public api
	return {
		init: initialize
	};

})($, rm.globals, rm.utilities);
rm.search = (function ($) {

	'use strict';

	var initialize = function() {

		var $searchForm = $('.site-search form');

		//check for value
		$searchForm.on('submit', function(e) {

			_validateSearchValue(this, e);

		});

	};

	var _validateSearchValue = function(context, evt) {

		var $this = $(context),
			$searchInput = $this.find('.search-input'),
			$searchError = $this.children('.search-error');

		if($.trim($searchInput.val()).length <= 0) {

			evt.preventDefault();
			$searchError.text('Search term is required');

		} else if($.trim($searchInput.val()).length < 3) {

			evt.preventDefault();
			$searchError.text('Search term must be 3 or more characters in length');

		}

	};

	// public api
	return {
		init: initialize
	};

})($);
rm.forms = (function ($) {

	'use strict';

	var initialize = function() {

		// we only want to animate text, email, number and password inputs
		var	$formInputs = $('.scfForm input[type=text], .scfForm input[type=email], .scfForm input[type=tel], .scfForm input[type=number], .scfForm input[type=password]');

		$formInputs.each(function() {

			_checkForValue($(this));

		});

		$formInputs
			.on('focus', function() {

				$(this).closest('.field-border').addClass('has-focus');

			})
			.on('blur', function() {

				$(this).closest('.field-border').removeClass('has-focus');

				_checkForValue($(this));

			});

		if($('.event-closed').length) {
			_hideForm('.scfForm');
		}

	};

	var _checkForValue = function(obj) {

		if (obj.val().length > 0) {

			obj.closest('.field-border').addClass('is-filled');

		} else {

			obj.closest('.field-border').removeClass('is-filled');

		}

	};

	var _hideForm = function(el) {
		$(el).hide();
	};

	// public api
	return {
		init: initialize
	};

})($);
rm.banner = (function($) {

	'use strict';

	var init = function() {

		var cookieExpiryInSeconds = 7200; // 7200secs = 2hrs

		$('.banner-close').on('click', function(e) {
			e.preventDefault();

			var $thisBanner = $(this).closest('.banner'),
				bannerID = $thisBanner[0].id;

			rm.utilities.cookies.set(bannerID, true, cookieExpiryInSeconds);

			$thisBanner.addClass('banner-removed');

		});

	};

	return {
		init: init
	};

}($, rm.globals));
rm.tiles = (function ($, utils) {

    'use strict';

    var initialize = function () {

        utils.inView('.tiles-landing', true);
        utils.inView('.tiles-background-inner');
        utils.inView('.tiles-superinformed-inner');
        utils.bgImageLoad();

        _initCarousel();

    };

    var _initCarousel = function() {

        var $tileContainer = $('.tiles-background.tiles-background--carousel .tiles-background-inner');

        $tileContainer.slick({
            dots: true,
            responsive: [
                {
                    breakpoint: 99999,
                    settings: "unslick"
                },
                {
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 1
                    }
                }
            ]
        });

    };

    // public api
    return {
        init: initialize
    };

})($, rm.utilities);
rm.superInformedTiles = (function ($, utils) {

    'use strict';

    var initialize = function () {

        _initCarousel();

    };

    var _initCarousel = function () {

        var $superInformedTileContainer = $('.tiles-superinformed.tiles-superinformed--carousel .tiles-superinformed-inner');

        $superInformedTileContainer.slick({
            dots: true,
            responsive: [
                {
                    breakpoint: 99999,
                    settings: "unslick"
                },
                {
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 1
                    }
                }
            ]
        });

    };

    // public api
    return {
        init: initialize
    };

})($, rm.utilities);
rm.tooltip = (function ($, globals) {

	'use strict';

	var initialize = function() {

		$('.tooltip-trigger').on('click', function(e) {

			e.preventDefault();

			_checkActiveTooltips(this);

		});

		$('.tooltip-trigger').on('keyup', function(e) {

			if(e.which === 27) {
          		_closeTooltip($(this));
     		}

		});

		globals.ps.subscribe('/device/small', function() {

			$('.tooltip-close').on('click', function(e) {

				e.preventDefault();

				_closeTooltip($(this));

			});

		});

		globals.ps.subscribe('/device/large', function() {

			$('.tooltip-close').off('click');

		});

	};

	var _openTooltip = function(el) {

		var $container = el.closest('.has-tooltip');
		$container.addClass('is-active');

	};

	var _closeTooltip = function(el) {

		var $container = el.closest('.has-tooltip');
		$container.removeClass('is-active');

	};


	var _checkActiveTooltips = function(el) {

		var $tooltipWrapper = $(el).closest('.has-tooltip'),
			$activeTooltips = $('.has-tooltip.is-active').not($tooltipWrapper);

		if($activeTooltips.length) {

			// console.log('removing all visible tooltips');
			$activeTooltips.removeClass('is-active');
			_openTooltip($(el));

		} else {

			if($tooltipWrapper.hasClass('is-active')) {

			// console.log('closing active tooltip');
			_closeTooltip($(el));

			} else {

				// console.log('opening active tooltip');
				_openTooltip($(el));

			}

		}

	};

	// public api
	return {
		init: initialize
	};

})($, rm.globals);
rm.accordion = (function ($, utils) {

	'use strict';

	var initialize = function() {

		var hash = utils.getHash();

		if(!!hash) {

			var section = '[href=#' + hash + ']';

			utils.jumpToSection(section);

			_openAccordion(hash);

		}

	};

	var _openAccordion = function(val) {

		var $accordionObj = $('#' + val);

		if(!!$accordionObj) {

			$accordionObj.collapse('show');

		}

	};

	// public api
	return {
		init: initialize
	};

})($, rm.utilities);

rm.iframe = (function ($) {

	'use strict';

	var initialize = function() {

		$('.iframe-embed').each(function() {
			$(this).iFrameResize({
				checkOrigin: false,
				scrolling: true // needed for responsive sideways scrolling
			});
		});

	};

	// public api
	return {
		init: initialize
	};

})($);
rm.timeline = (function (utils) {

	'use strict';

	var initialize = function() {
		utils.inView('.timeline-block');
	};

	// public api
	return {
		init: initialize
	};

})(rm.utilities);
rm.imageCycler = (function ($) {

	'use strict';

	var initialize = function() {

		setInterval(_cycleImages, 2500);

	};

	var _cycleImages = function() {

		$('.image-cycler').each(function() {

			var $this = $(this);

			if($this.children('img').length > 1) {

				var $activeImg = $this.children('.active'),
					$nextImg = ($activeImg.next().length > 0) ? $activeImg.next() : $this.children('img:first');

				// move the next image up the pile
				$nextImg.css('z-index',2);

			  	$activeImg.fadeOut(400, function() {

			  		//reset the z-index and unhide the image
					$activeImg.css('z-index', 1).show().removeClass('active');

					//make the next image the top one
					$nextImg.css('z-index', 3).addClass('active');

				});

			}

		});

	};

	// public api
	return {
		init: initialize
	};

})($);

rm.legacyCharts = (function ($) {

	'use strict';

	var initialize = function() {

		var $chartContainer = $('#graphContainer'),
			chartOptions = {
				chart: {
					style: {
		                fontFamily: '"Effra-Regular", Tahoma, Verdana, Geneva, sans-serif'
		            }
				},
				title: {
		            text: ''
		        },
				xAxis: {
					tickColor: '#d4d5d4',
					categories: window.years
				},
				yAxis: { // Primary yAxis
					gridLineColor: '#d4d5d4',
					tickInterval: 5,
					labels: {
						format: '{value}%',
						Interval: '1',
						style: {
							color: '#333333'
						}
					},
					title: {
		                text: ''
		            }
				},
				legend: {
            		align: 'left',
            		verticalAlign: 'bottom',
            		x: 45
        		},
				tooltip: {
					formatter: function() {
						var s;
						if (this.point.name) { // the pie chart
							s = ' ' +
							this.point.name + ': ' + this.y + '%';
						} else {
							s = ' ' +
							this.x  + ': ' + this.y + '%';
						}
						return s;
					}
				},
				labels: {
					items: [{
						html: '',
						style: {
							left: '40px',
							top: '8px',
							color: 'black'
						}
					}]
				},
				exporting: {
					buttons: {
						contextButton: {
							enabled: false,
							symbol: 'url(http://www.hostplus.com.au/resources/img/printer-icon.jpg)'
						}
					}
				},
				series: [{
					type: 'column',
					name: window.returns.title,
					color: '#ffd000',
					data: window.returns.values
				}, {
					type: 'spline',
					name: window.avgReturn.title,
					color: '#002855',
					data: window.avgReturn.values,
					marker: {
						symbol: 'square',
						lineWidth: 2,
						lineColor: '#002855',
						fillColor: '#002855'
					}
				}, {
					type: 'spline',
					name: window.avgReturnTarget.title,
					color: '#e56a54',
					data: window.avgReturnTarget.values,
					marker: {
						symbol: 'diamond',
						lineWidth: 2,
						lineColor: '#e56a54',
						fillColor: '#e56a54'
					}
				}],
				navigation: {
					buttonOptions: {
						verticalAlign: 'top',
						y: 2,
						x: -2
					}
				}
			};

		$chartContainer.highcharts(chartOptions);

	};

	// public api
	return {
		init: initialize
	};

})($);
rm.legacyCalc = (function ($) {

	'use strict';

	// TODO: replace static values with ones from sitecore once available
	var vLower = 34488,
	    vUpper = vLower + 15000,
	    vMatch = 0.5, //matching rate is 50%
	    vReduce = (1 / 30),  // 0.05 when it is $1.50 for every $1
	    vMax = 500,
	    mincon = 20;

	var initialize = function() {

		$('#govtContForm input').on('blur', function() {

			_calculate($(this).val());

		    //update inputs in UI
		    $(this).val(_toCurrency($(this).val()));

		});

	};

	// Formats a number to currency ($X,XXX.XX)
	var _toCurrency = function(num) {

	    var str = num.toString().replace('$', ''),
	        parts = false,
	        output = [],
	        i = 1,
	        formatted = null;

	    if(str.indexOf('.') > 0) {
	        parts = str.split('.');
	        str = parts[0];
	    }

	    str = str.split('').reverse();

	    for(var j = 0, len = str.length; j < len; j++) {
	        if(str[j] != ',') {
	            output.push(str[j]);
	            if(i%3 == 0 && j < (len - 1)) {
	                output.push(',');
	            }
	            i++;
	        }
	    }

	    formatted = output.reverse().join('');

	    return ('$' + formatted + ((parts) ? '.' + parts[1].substr(0, 2) : ''));

	};

	// Removes formatting from a number
	var _numToString = function(num) {

		return Number(num.replace(/[^0-9-\.]+/g,''));

	};

	// --- calculations are based on http://www.ato.gov.au/Individuals/content.aspx?menuid=42869&doc=/content/42616.htm&page=12
	var _calculate = function() {

	    var incomeVal = $('#income').val(),
	        personalVal = $('#personal').val(),
	        cocontVal = $('#cocont'),
	        vIncome = _numToString(incomeVal),
	        vPersonal = _numToString(personalVal),
	        maxCoCont = $('#max_cocont').val(),
	        maxPersonal = $('#max_personal').val(),
	        additional = 0,
	        vOver = 0,
	        vCocont = 0,
	        vSubtract = 0,
	        vThreshold = 0;

	    //Ian's calcuations - commented for reference
	    if (vIncome < vUpper && vIncome > 0) {

	        vOver = vIncome - vLower;

	        if (vOver < 0) { vOver = 0; }

	        vCocont = vMatch * vPersonal;
	        vSubtract = vOver * vReduce;
	        vThreshold = (Math.ceil(vMax - vSubtract));

	        if (vThreshold < mincon) {
	            maxCoCont = _toCurrency(mincon);
	            maxPersonal = _toCurrency(1);
	        } else {
	            maxCoCont = _toCurrency(vThreshold);
	            additional = vThreshold - vPersonal;
	            if (additional > 0) {
	                maxPersonal = _toCurrency(additional);
	            }
	            else {
	                maxPersonal = '$0';
	            }
	        }

	        if (vCocont > vThreshold) {
	            vCocont = vThreshold;
	        }
	        if (vCocont < mincon) {
	            vCocont = mincon;
	        }
	    } else {
	        vCocont = 0;
	        maxCoCont ='$0';
	        maxPersonal = '$0';
	    }
	    if (personalVal != '') {
	        cocontVal.val(_toCurrency(vCocont));
	    }
	    if (personalVal == '$0') {
	        cocontVal.val('');
	    }

	};

	// public api
	return {
		init: initialize
	};

})($);

// ../modules/read-more/read-more.js
/* globals window */
rm.filters = (function ($, globals, utils) {

	'use strict';

	var currentPage = '',
		category = '';

	var initialize = function() {

		currentPage = window.location.pathname;

		globals.ps.subscribe('/device/small', function() {

            _filterMobile();

        });

        globals.ps.subscribe('/device/medium', function() {

            _filterDesktop();

        });

        globals.ps.subscribe('/device/large', function() {

        	_filterDesktop();

        });

	};

	var _setCategory = function(cat) {
		category = cat;
	};

	var _getCategory = function() {
		return category;
	};

	var _updateUrl = function() {
		window.location = currentPage + '?category=' + _getCategory();
	};

	var _filter = function(cat) {

		_setCategory(cat);
		_updateUrl();

	};

	var _filterMobile = function() {

		$('.filter-item-pb').off('click');

		// only bind to postback (pb) items
		// client side items handled by angular sub apps
		$('.filter-select-pb').on('hide.bs.select', function(e) {

			// do not filter if esc key pressed
			if(e.which === 27) { return; }

			var cat = utils.getSelectedOption($(this)[0]).val();

			_filter(cat);

		});

	};

	var _filterDesktop =function() {

		$('.filter-select-pb').off('hide.bs.select');

		// only bind to postback (pb) items
		// client side items handled by angular sub apps
		$('.filter-item-pb').on('click', function() {

			var cat = $(this).children('input[type=radio]').val();

			_filter(cat);

		});

	};

	// public api
	return {
		init: initialize
	};

})($, rm.globals, rm.utilities);
/* ===== reactivizr scripts-hook do-not-remove ===== */