var $j = jQuery.noConflict();

(function($) {
	'use strict';

	// init modules
	FastClick.attach(document.body);

	rm.utilities.init();
	rm.tracking.init();

	rm.header.init();
	rm.menu.init();
	rm.backToTop.init();
	rm.naturalLanguageForm.init(); // includes rm.concierge.init();
	rm.nextBestAction.init();
	rm.banner.init();
	rm.search.init();
	// rm.breadcrumbs.init();
	rm.forms.init();
	rm.iframe.init();
	// rm.readMore.init();
    rm.stickycta.init();

	if(rm.utilities.elExists('.tooltip')) {
		rm.tooltip.init();
	}

	if(rm.utilities.elExists('.tiles')) {
		rm.tiles.init();
    }

    if (rm.utilities.elExists('.tiles-superinformed')) {
        rm.superInformedTiles.init();
    }

    if(rm.utilities.elExists('.accordion-wrapper')) {
		rm.accordion.init();
	}

	if(rm.globals.DOM.body.hasClass('member-guide')) {
		rm.memberGuide.init();
	}

	if(rm.globals.DOM.body.hasClass('why-hostplus')) {
		rm.utilities.bgImageLoad();

		if(rm.utilities.elExists('.benefits-wrapper')) {
			var benefits = $('.benefits-wrapper').find('.row').first().find('.panel-featured-content');
			// console.log(benefits);
			rm.utilities.setBoxHeight(benefits);
		}
	}

	if(rm.globals.DOM.body.hasClass('health-wealth')) {
		rm.utilities.bgImageLoad();
	}

	if(rm.utilities.elExists('.timeline')) {
		rm.timeline.init();
	}

	if(rm.utilities.elExists('.image-cycler')) {
		rm.imageCycler.init();
	}

	if(rm.utilities.elExists('.filters-pb')) {
		rm.filters.init();
	}

	// responsive breakpoints listener
	// publishes devices size to other modules via pubsub
	// needs to be last so individual modules can subscribe to events before events are published
	rm.responsivejs.init();

	$(function() {

 		//add horizontal scrollbar to top of table. Handy for long tables.
		$('.table-responsive').doubleScroll({ resetOnWindowResize: true });

		if(rm.utilities.elExists('#govtContForm')) {
			rm.legacyCalc.init();
		}

		if(rm.utilities.elExists('#graphContainer')) {
			rm.legacyCharts.init();
		}

	});

})($j);