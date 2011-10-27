(function($) {

$(function() {
	$.body = $("body");
	$.app = $("app");
	$.main = $("#main");
	$.views = $("view");
	$.tablet = window.innerWidth > 600;
	$(window).bind("resize", function() {
		$.tablet = window.innerWidth > 600;
	});
});
$.extend({
	UINavigationHistory : ["#main"],
	UINavigateBack : function() {
		$($.UINavigationHistory[$.UINavigationHistory.length-1]).attr( "ui-navigation-status", "upcoming");
		$.UINavigationHistory.pop();
		$($.UINavigationHistory[$.UINavigationHistory.length-1])
		.attr("ui-navigation-status", "current");
		if ($.app.attr("ui-kind")==="navigation-with-one-navbar" && $.UINavigationHistory[$.UINavigationHistory.length-1] === "#main") {
			$("navbar > uibutton[ui-implements=back]", $.app).css("display","none");
		}
	},
	UIBackNavigation : function () {
		$.app.delegate("uibutton", "click", function() {
			if ($(this).attr("ui-implements") === "back") {
			   $.UINavigateBack();
			}
		});
	},
	
	UINavigationEvent : false,
	
    UINavigationList : function() {
		var navigateList = function(item) {
			if ($.app.attr("ui-kind")==="navigation-with-one-navbar") {
				$.app.find("navbar > uibutton[ui-implements=back]").css("display", "block");
			}
			$(item.attr("href")).attr("ui-navigation-status", "current");
			$($.UINavigationHistory[$.UINavigationHistory.length-1])
				.attr("ui-navigation-status", "traversed");
			if ($.main.attr("ui-navigation-status") !== "traversed") {
				$.main.attr("ui-navigation-status", "traversed");
			}
			$.UINavigationHistory.push(item.attr("href"));
		};
        $.app.delegate("tablecell", "click", "touchStart", function() {
            if ($(this).attr("href")) {
	            if ($.UINavigationEvent) {
	                return;
	            } else {
					$.UINavigationEvent = false;
	                navigateList($(this));
					$.UINavigationEvent = true;
	            }
            }
        });
	}
});
$(function() {
    $.UIBackNavigation();
    $.UINavigationList();
    $.app.delegate("view","webkitTransitionEnd", function() {
		if (!$("view[ui-navigation-status=current]")[0]) {
			$($.UINavigationHistory[$.UINavigationHistory.length-1])     
                .attr("ui-navigation-status", "current");
            $.UINavigationHistory.pop();
		}
		$.UINavigationEvent = false;
    });    
});

/*$.fn.UIToggleButtonLabel = function ( label1, label2 ) {
	return this.each(function(){
    	var $this = $(this);
		if ($this.find("label").text() === label1) {
			$this.find("label").text(label2);
		} else {
			$this.find("label").text(label1);
		}
	});
};*/
$.UIEnableScrolling = function ( options ) {
	//try {
		$("scrollpanel").each(function() {
			if ($(this).data("ui-scroller")) {
				var whichScroller = $(this).data("ui-scroller");
				whichScroller.refresh();
			} else {
				var scroller = new iScroll($(this)[0].parentNode, options);
				$(this).data("ui-scroller", scroller);
			}
		});
	//} catch(e) { }
};
$(function() {
	$.UIEnableScrolling();
});

$.fn.UIToggleButtonLabel = function ( label1, label2 ) {
	if ($(this).find("label").text() === label1) {
		$(this).find("label").text(label2);
	} else {
		$(this).find("label").text(label1);
	}
};

$.UIPaging = function( selector, opts ) {
	var myPager = new iScroll( selector, opts );
	selector = $(selector);
	var stack = selector.find("stack");
	selector.parent().attr("ui-scroller","myPager");
	var panels = stack.children().length;
	var indicatorsWidth = selector.parent().css("width");
	var indicators = '<stack ui-implements="indicators" style="width:"' + indicatorsWidth + ';">';
	for (var i = 0; i < panels; i++) {
		if (i === 0) {
			indicators += '<indicator class="active"></indicator>';
		} else {
			indicators += "<indicator></indicator>";
		}
	}
	indicators += "</stack>";
	// The maximum number of indicators in portrait view is 17.
	selector.parent().parent().append(indicators);
};

$(function() {
	if (document.querySelector("stack[ui-implements=paging]")) {
		$.UIPaging("stack[ui-implements=paging] > panel", {
			snap: true,
			momentum: false,
			hScrollbar: false,
			onScrollEnd: function () {
				$('stack[ui-implements="indicators"] > indicator.active').removeClass('active');
				$('stack[ui-implements="indicators"] > indicator:nth-child(' + (this.currPageX+1) + ')').addClass('active');
			} 
		});
	}
});

$.fn.UISegmentedPagingControl = function ( ) {
	var segmentedPager = $("segmentedcontrol[ui-implements=segmented-paging]");
	var pagingOrientation = segmentedPager.attr("ui-paging");
	segmentedPager.attr("ui-paged-subview", 0);
	segmentedPager.children().eq(0).addClass("disabled");
	var subviews = $(this).find("subview");
	segmentedPager.attr("ui-pagable-subviews", subviews.length);
	var childPosition = 0;
	subviews.each(function(idx) {
		$(this).attr("ui-navigation-status", "upcoming");
		$(this).attr("ui-child-position", childPosition);
		childPosition++;
		$(this).attr("ui-paging-orient", pagingOrientation);
	});
	subviews.eq(0).attr("ui-navigation-status", "current");
	segmentedPager.delegate("uibutton", "click", function() {
		if ($(this).hasClass("disabled")) {return;}
		var pager = $(this).closest("segmentedcontrol");
		if ($(this)[0].isSameNode($(this)[0].parentNode.firstElementChild)) {
			if (pager.attr("ui-paged-subview") === 1) {
				$(this).addClass("disabled");
				pager.attr("ui-paged-subview", 0);
				subviews[0].attr("ui-navigation-status", "current");
				subviews[1].attr("ui-navigation-status", "upcoming");
			} else {
				subviews.eq(pager.attr("ui-paged-subview") - 1 ).attr( "ui-navigation-status", "current");
				subviews.eq(pager.attr("ui-paged-subview")).attr("ui-navigation-status", "upcoming");
				pager.attr("ui-paged-subview", pager.attr("ui-paged-subview")-1);
				$(this).next().removeClass("disabled");
				if (pager.attr("ui-paged-subview") <= 0) {
					$(this).addClass("disabled");
				}
			}
		} else {
			var pagableSubviews = pager.attr("ui-pagable-subviews");
			var pagedSubview = pager.attr("ui-paged-subview");
			if (pager.attr("ui-paged-subview") == pagableSubviews-1) {
				$(this).addClass("disabled");
			} else {
				$(this).prev().removeClass("disabled");
				subviews.eq(pagedSubview).attr("ui-navigation-status", "traversed");
				subviews.eq(++pagedSubview).attr("ui-navigation-status", "current");
				pager.attr("ui-paged-subview", (pagedSubview));
				if (pager.attr("ui-paged-subview") == pagableSubviews-1) {
					$(this).addClass("disabled");
				}
			}
		}
	});
};
$(function() {
	$("body").UISegmentedPagingControl();
});

$.extend({
	UIDeletableTableCells : [],
	UIDeleteTableCell : function( options ) {
		/* options = {
			selector: selector,
			editButton: [label1, label2],
			toolbar: toolbar,
			callback: callback
		} */
		var label1 = options.editButton[0] || "Edit";
		var label2 = options.editButton[1] || "Done";
		var label3 = options.deleteButton || "Delete";
		var selector = $(options.selector);
		this.deletionList = [];
		var listEl = $(options.selector);
		var toolbarEl = $(options.toolbar);
		var deleteButtonTemp = '<uibutton ui-bar-align="left" ui-implements="delete" class="disabled" style="display: none;"><label>' + label3 + '</label></uibutton>';
		var editButtonTemp = '<uibutton ui-bar-align="right"  ui-implements="edit" ui-button-labels="' + label1 + ',' + label2 +  '"><label>' + label1 + '</label></uibutton>';
		toolbarEl.prepend(deleteButtonTemp);
		toolbarEl.append(editButtonTemp);
		var deleteDisclosure = '<deletedisclosure><span>&#x2713</span></deletedisclosure>';
		$(options.selector + " > tablecell").each(function() {
			$(this).prepend(deleteDisclosure);
		});

		listEl.attr("data-deletable-items", 0);
		var UIEditExecution = function() {
		   $(options.toolbar + " > uibutton[ui-implements=edit]").bind("click", function() {			   
		       
		   	   var labels = $(this).attr("ui-button-labels");
		   	   var buttonLabel = $(this).find("label");
		   	   console.log(buttonLabel.text());
			   if (buttonLabel.text() === label1) {
				   buttonLabel.text(label2);
				   $(this).attr("ui-implements", "done");
				   listEl.addClass("ui-show-delete-disclosures");
				   $(this).siblings("uibutton[ui-implements='delete']").css("display","-webkit-inline-box");
				   $("tablecell > img", listEl).each(function() {
						$(this).css("-webkit-transform: translate3d(40px, 0, 0)");
				   });
			   } else {
				   buttonLabel.text(label1);
				   $(this).removeAttr("ui-implements");
				   $(this).siblings("uibutton[ui-implements='delete']").css("display","none");
				   listEl.removeClass("ui-show-delete-disclosures");
				   $("deletedisclosure").each(function() {
					   $(this).removeClass("checked");
					   $(this).closest("tablecell").removeClass("deletable");
				   });
				   $("uibutton[ui-implements=delete]").addClass("disabled");
		   
				   listEl.find("tablecell > img").css("-webkit-transform: translate3d(0, 0, 0)");
			   }
		   });
		};
		var UIDeleteDisclosureSelection = function() {
			$("deletedisclosure").each(function() {
				$(this).bind("click", function() {
					$(this).toggleClass("checked");
					$(this).closest("tablecell").toggleClass("deletable");
					$("uibutton[ui-implements=delete]").removeClass("disabled");
					if (!$(this).closest("tablecell").hasClass("deletable")) {
						listEl.attr("data-deletable-items", parseInt(listEl.data("deletable-items"), 10) - 1);
						if (parseInt(listEl.data("deletable-items"), 10) === 0) {
							toolbarEl.children().eq(0).addClass("disabled");
						}
					} else {
						listEl.data("deletable-items", parseInt(listEl.data("deletable-items"), 10) + 1);
					}
				}); 
			});
		};

		var UIDeletionExecution = function() {
		   $("uibutton[ui-implements=delete]").bind("click", function() {
			   if ($(this).hasClass("disabled")) {
				   return;
			   }
			   $(".deletable").each(function() {
				   listEl.data("deletable-items", parseInt(listEl.data("deletable-items"), 10) - 1);
				   $.UIDeletableTableCells.push($(this).id);
				   if (!!options.callback) {
					   options.callback.call($(this), this);
				   }
				   $(this).remove();
				   $.UIDeletableTableCells = [];
				   listEl.attr("data-deletable-items", 0);
			   });
			   $(this).addClass("disabled");
			selector.closest("view").find("scrollpanel").data("ui-scroller").refresh();
		   });
		};
		UIEditExecution();
		UIDeleteDisclosureSelection();
		UIDeletionExecution(); 
	}
});
$.extend({
	/*
		option values:
		selector:
		name: 
		range: {start:, end:, values: }
		step:
		defaultValue:
		buttonClass:
		indicator:
	*/
	UISpinner : function (opts) {
		var spinner = $(opts.selector);
		var defaultValue = null;
		var range = null;
		var step = opts.step;
		if (opts.range.start >= 0) {
			var rangeStart = opts.range.start || "";
			var rangeEnd = opts.range.end || "";
			var tempNum = rangeEnd - rangeStart;
			tempNum++;
			range = [];
			if (step) {
				var mod = ((rangeEnd-rangeStart)/step);
				if (opts.range.start === 0) {
					range.push(0);
				} else {
					range.push(rangeStart);
				}
				for (var i = 1; i < mod; i++) {
					range.push(range[i-1] + step);
				}
				range.push(range[range.length-1] + step);
			} else {
				for (var j = 0; j < tempNum; j++) {
					range.push(rangeStart + j);				
				}
			}
		}
		var icon = (opts.indicator === "plus") ? "<icon class='indicator'></icon>" : "<icon></icon>";
		var buttonClass = opts.buttonClass ? " class='" + opts.buttonClass + "' " : "";
		var decreaseButton = "<uibutton " + buttonClass + "ui-implements='icon'>" + icon + "</uibutton>";
		var increaseButton = "<uibutton " + buttonClass + "ui-implements='icon'>" + icon + "</uibutton>";
		var spinnerTemp = decreaseButton + "<label ui-kind='spinner-label'></label><input type='text'/>" + increaseButton;
		spinner.append(spinnerTemp);
		if (opts.range.values) {
			spinner.data("range-value", opts.range.values.join(","));
		}
		if (!opts.defaultValue) {
			if (!!opts.range.start || opts.range.start === 0) {
				defaultValue = opts.range.start === 0 ? "0": opts.range.start;
			} else if (opts.range.values instanceof Array) {
				defaultValue = opts.range.values[0];
				$("uibutton:first-of-type", opts.selector).addClass("disabled");
			}
		} else {
			defaultValue = opts.defaultValue;
		}
		if (range) {
			spinner.data("range-value", range.join(","));
		}

		$("label[ui-kind=spinner-label]", spinner).text(defaultValue);
		$("input", spinner).value = defaultValue;
		if (opts.namePrefix) {
			var namePrefix = opts.namePrefix + "." + spinner.id;
			$("input", spinner).attr("name", namePrefix);
		} else {
			$("input", spinner).attr("name", spinner.id);
		}

		if (defaultValue === opts.range.start) {
			$("uibutton:first-of-type", spinner).addClass("disabled");
		}
		if (defaultValue == opts.range.end) {
			$("uibutton:last-of-type", spinner).addClass("disabled");
		}
		$("uibutton:first-of-type", opts.selector).bind("click", function(button) {
			$.decreaseSpinnerValue.call(this, opts.selector);
		});
		$("uibutton:last-of-type", opts.selector).bind("click", function(button) {
			$.increaseSpinnerValue.call(this, opts.selector);
		});
	},

	decreaseSpinnerValue : function(selector) {
		var values = $(selector).data("range-value");
		values = values.split(",");
		var defaultValue = $("label", selector).text().trim();
		var idx = values.indexOf(defaultValue);
		if (idx !== -1) {
			$("uibutton:last-of-type", selector).removeClass("disabled");
			$("[ui-kind=spinner-label]", selector).text(values[idx-1]);
			$("input", selector).value = values[idx-1];
			if (idx === 1) {
				$(this).addClass("disabled");
			} 
		}	
	},

	increaseSpinnerValue : function(selector) {
		var values = $(selector).data("range-value");
		values = values.split(",");
		var defaultValue = $("label", selector).text().trim();
		var idx = values.indexOf(defaultValue);
		if (idx !== -1) {
			$("uibutton:first-of-type", selector).removeClass("disabled");
			$("label[ui-kind=spinner-label]", selector).text(values[idx+1]);
			$("input", selector).value = values[idx+1];
			if (idx === values.length-2) {
				$(this).addClass("disabled");
			}
		}
	}	
});
$.extend({
	UIPopUpIsActive : null,
	UIPopUpIdentifier : null,

	UIPopUp : function( opts ) {
		var id = opts.id || $.UIUuid();
		var title = opts.title || "Alert!";
		var message = opts.message || "";
		var cancelUIButton = opts.cancelUIButton || "Cancel";
		var continueUIButton = opts.continueUIButton || "Continue";
		var callback = opts.callback || function() {};
		var popup = '<popup id=' + id + ' ui-visible-state="hidden">\
			<panel>\
				<toolbar ui-placement="top">\
					<h1>' + title + '</h1>\
				</toolbar>\
				<p>' + message + '</p>\
				<toolbar ui-placement="bottom">\
					<uibutton ui-kind="action" ui-implements="cancel">\
						<label>' + cancelUIButton + '</label>\
					</uibutton>\
					<uibutton ui-kind="action" ui-implements="continue">\
						<label>' + continueUIButton + '</label>\
					</uibutton>\
				</toolbar>\
			</panel>\
		</popup>';
		$("app").append(popup);
		var popupID = "#" + id;
		$(popupID).UIBlock("0.5");
		var popupBtn = "#" + id + " uibutton";
		$(popupBtn).bind("click", cancelClickPopup = function(e) {
			if ($(this).attr("ui-implements")==="continue") {
				callback.call(callback, this);
			}
			e.preventDefault();
			$.UIClosePopup("#" + id);
		});
		$.UIPopUpIsActive = false;
		$.UIPopUpIdentifier = null;
	} 
});

$.extend($, {
	UIPopUpIsActive : false,
	UIPopUpIdentifier : null,
	UIShowPopUp : function( options ) {
		$.UIPopUp(options);
		$.UIPopUpIsActive = true;
		$.UIPopUpIdentifier = "#" + options.id;
		var screenCover = $("mask");
		screenCover.bind("touchmove", function(e) {
			e.preventDefault();
		});
		$.UIPositionPopUp("#" + options.id);
		screenCover.attr("ui-visible-state", "visible");
		$("#" + options.id).attr("ui-visible-state", "visible");
	},
	UIPositionPopUp : function(selector) {
		$.UIPopUpIsActive = true;
		$.UIPopUpIdentifier = selector;
		var popup = $(selector);
		var pos = {};
		pos.top = ((window.innerHeight /2) + window.pageYOffset) - (popup.height() /2);
		pos.left = (window.innerWidth / 2) - (popup.width() / 2);
		popup.css(pos); 
	},
	UIRepositionPopupOnOrientationChange : function ( ) {
		$("body").bind("orientationchange", function() {
			if (window.orientation === 90 || window.orientation === -90) {
				if ($.UIPopUpIsActive) {
					$.UIPositionPopUp($.UIPopUpIdentifier);
				}
			} else {
				if ($.UIPopUpIsActive) {
					$.UIPositionPopUp($.UIPopUpIdentifier);
				}
			}
		});
		window.addEventListener("resize", function() {
			if ($.UIPopUpIsActive) {
				$.UIPositionPopUp($.UIPopUpIdentifier);
			}
		}, false);	
	},
	UIClosePopup : function ( selector ) {
		$(selector + " uibutton[ui-implements=cancel]").unbind("click", "cancelClickPopup");
			$(selector + " uibutton[ui-implements=continue]").unbind("click", "cancelTouchPopup");
		$(selector).UIUnblock();
		$(selector).remove();
		$.UIPopUpIdentifier = null;
		$.UIPopUpIsActive = false;
	}
});

$.fn.UIBlock = function ( opacity ) {
	opacity = opacity ? " style='opacity:" + opacity + "'" : "";
	$(this).before("<mask" + opacity + "></mask>");
};
$.fn.UIUnblock = function ( ) {
	if ($("mask")) {
		$("mask").remove();
	}
};
$(function() {
	$.UIRepositionPopupOnOrientationChange();
});
$.fn.UISelectionList = function ( callback ) {
	$(this).children().each( function(idx) {
		console.log(this.nodeName);
		if (this.nodeName.toLowerCase() === "tablecell") {
			this.insertAdjacentHTML("afterBegin", "<checkmark>&#x2713</checkmark>");
			$(this).bind("click", function() {
				$(this).siblings().removeClass("selected");
				$(this).addClass("selected");
				$(this).find("input").checked = true; 
				if (callback) {
					callback.call(callback, $(this).find("input"));
				}
			});
		}
	});
};
})(jQuery);