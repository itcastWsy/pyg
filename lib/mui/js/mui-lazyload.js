(function($, window, document) {
	var mid = 0;
	$.Lazyload = $.Class.extend({
		init: function(element, options) {
			var self = this;
			this.container = this.element = element;
			this.options = $.extend({
				selector: '',
				diff: false,
				force: false,
				autoDestroy: true,
				duration: 100
			}, options);

			this._key = 0;
			this._containerIsNotDocument = this.container.nodeType !== 9;
			this._callbacks = {};

			this._init();
		},
		_init: function() {
			this._initLoadFn();

			this.addElements();

			this._loadFn();

			$.ready(function() {
				this._loadFn();
			}.bind(this));

			this.resume();
		},
		_initLoadFn: function() {
			var self = this;
			self._loadFn = this._buffer(function() { // 鍔犺浇寤惰繜椤�
				if (self.options.autoDestroy && self._counter == 0 && $.isEmptyObject(self._callbacks)) {
					self.destroy();
				}
				self._loadItems();
			}, self.options.duration, self);
		},
		/**
		 *鏍规嵁鍔犺浇鍑芥暟瀹炵幇鍔犺浇鍣�
		 *@param {Function} load 鍔犺浇鍑芥暟
		 *@returns {Function} 鍔犺浇鍣�
		 */
		_createLoader: function(load) {
			var value, loading, handles = [],
				h;
			return function(handle) {
				if (!loading) {
					loading = true;
					load(function(v) {
						value = v;
						while (h = handles.shift()) {
							try {
								h && h.apply(null, [value]);
							} catch (e) {
								setTimeout(function() {
									throw e;
								}, 0)
							}
						}
					})
				}
				if (value) {
					handle && handle.apply(null, [value]);
					return value;
				}
				handle && handles.push(handle);
				return value;
			}
		},
		_buffer: function(fn, ms, context) {
			var timer;
			var lastStart = 0;
			var lastEnd = 0;
			var ms = ms || 150;

			function run() {
				if (timer) {
					timer.cancel();
					timer = 0;
				}
				lastStart = $.now();
				fn.apply(context || this, arguments);
				lastEnd = $.now();
			}

			return $.extend(function() {
				if (
					(!lastStart) || // 浠庢湭杩愯杩�
					(lastEnd >= lastStart && $.now() - lastEnd > ms) || // 涓婃杩愯鎴愬姛鍚庡凡缁忚秴杩噈s姣
					(lastEnd < lastStart && $.now() - lastStart > ms * 8) // 涓婃杩愯鎴栨湭瀹屾垚锛屽悗8*ms姣
				) {
					run();
				} else {
					if (timer) {
						timer.cancel();
					}
					timer = $.later(run, ms, null, arguments);
				}
			}, {
				stop: function() {
					if (timer) {
						timer.cancel();
						timer = 0;
					}
				}
			});
		},
		_getBoundingRect: function(c) {
			var vh, vw, left, top;

			if (c !== undefined) {
				vh = c.offsetHeight;
				vw = c.offsetWidth;
				var offset = $.offset(c);
				left = offset.left;
				top = offset.top;
			} else {
				vh = window.innerHeight;
				vw = window.innerWidth;
				left = 0;
				top = window.pageYOffset;
			}

			var diff = this.options.diff;

			var diffX = diff === false ? vw : diff;
			var diffX0 = 0;
			var diffX1 = diffX;

			var diffY = diff === false ? vh : diff;
			var diffY0 = 0;
			var diffY1 = diffY;

			var right = left + vw;
			var bottom = top + vh;


			left -= diffX0;
			right += diffX1;
			top -= diffY0;
			bottom += diffY1;
			return {
				left: left,
				top: top,
				right: right,
				bottom: bottom
			};
		},
		_cacheWidth: function(el) {
			if (el._mui_lazy_width) {
				return el._mui_lazy_width;
			}
			return el._mui_lazy_width = el.offsetWidth;
		},
		_cacheHeight: function(el) {
			if (el._mui_lazy_height) {
				return el._mui_lazy_height;
			}
			return el._mui_lazy_height = el.offsetHeight;
		},
		_isCross: function(r1, r2) {
			var r = {};
			r.top = Math.max(r1.top, r2.top);
			r.bottom = Math.min(r1.bottom, r2.bottom);
			r.left = Math.max(r1.left, r2.left);
			r.right = Math.min(r1.right, r2.right);
			return r.bottom >= r.top && r.right >= r.left;
		},
		_elementInViewport: function(elem, windowRegion, containerRegion) {
			// display none or inside display none
			if (!elem.offsetWidth) {
				return false;
			}
			var elemOffset = $.offset(elem);
			var inContainer = true;
			var inWin;
			var left = elemOffset.left;
			var top = elemOffset.top;
			var elemRegion = {
				left: left,
				top: top,
				right: left + this._cacheWidth(elem),
				bottom: top + this._cacheHeight(elem)
			};

			inWin = this._isCross(windowRegion, elemRegion);

			if (inWin && containerRegion) {
				inContainer = this._isCross(containerRegion, elemRegion);
			}
			// 纭繚鍦ㄥ鍣ㄥ唴鍑虹幇
			// 骞朵笖鍦ㄨ绐楀唴涔熷嚭鐜�
			return inContainer && inWin;
		},
		_loadItems: function() {
			var self = this;
			// container is display none
			if (self._containerIsNotDocument && !self.container.offsetWidth) {
				return;
			}
			self._windowRegion = self._getBoundingRect();

			if (self._containerIsNotDocument) {
				self._containerRegion = self._getBoundingRect(this.container);
			}
			$.each(self._callbacks, function(key, callback) {
				callback && self._loadItem(key, callback);
			});
		},
		_loadItem: function(key, callback) {
			var self = this;
			callback = callback || self._callbacks[key];
			if (!callback) {
				return true;
			}
			var el = callback.el;
			var remove = false;
			var fn = callback.fn;
			if (self.options.force || self._elementInViewport(el, self._windowRegion, self._containerRegion)) {
				try {
					remove = fn.call(self, el, key);
				} catch (e) {
					setTimeout(function() {
						throw e;
					}, 0);
				}
			}
			if (remove !== false) {
				delete self._callbacks[key];
			}
			return remove;
		},
		addCallback: function(el, fn) {
			var self = this;
			var callbacks = self._callbacks;
			var callback = {
				el: el,
				fn: fn || $.noop
			};
			var key = ++this._key;
			callbacks[key] = callback;

			// add 绔嬪嵆妫€娴嬶紝闃叉棣栧睆鍏冪礌闂
			if (self._windowRegion) {
				self._loadItem(key, callback);
			} else {
				self.refresh();
			}
		},
		addElements: function(elements) {
			var self = this;
			self._counter = self._counter || 0;
			var lazyloads = [];
			if (!elements && self.options.selector) {
				lazyloads = self.container.querySelectorAll(self.options.selector);
			} else {
				$.each(elements, function(index, el) {
					lazyloads = lazyloads.concat($.qsa(self.options.selector, el));
				});
			}
			$.each(lazyloads, function(index, el) {
				if (!el.getAttribute('data-lazyload-id')) {
					if (self.addElement(el)) {
						el.setAttribute('data-lazyload-id', mid++);
						self.addCallback(el, self.handle);
					}
				}
			});
		},
		addElement: function(el) {
			return true;
		},
		handle: function() {
			//throw new Error('闇€瀛愮被瀹炵幇');
		},
		refresh: function(check) {
			if (check) { //妫€鏌ユ柊鐨刲azyload
				this.addElements();
			}
			this._loadFn();
		},
		pause: function() {
			var load = this._loadFn;
			if (this._destroyed) {
				return;
			}
			window.removeEventListener('scroll', load);
			window.removeEventListener('touchmove', load);
			window.removeEventListener('resize', load);
			if (this._containerIsNotDocument) {
				this.container.removeEventListener('scrollend', load);
				this.container.removeEventListener('scroll', load);
				this.container.removeEventListener('touchmove', load);
			}
		},
		resume: function() {
			var load = this._loadFn;
			if (this._destroyed) {
				return;
			}
			window.addEventListener('scroll', load, false);
			window.addEventListener('touchmove', load, false);
			window.addEventListener('resize', load, false);
			if (this._containerIsNotDocument) {
				this.container.addEventListener('scrollend', load, false);
				this.container.addEventListener('scroll', load, false);
				this.container.addEventListener('touchmove', load, false);
			}
		},
		destroy: function() {
			var self = this;
			self.pause();
			self._callbacks = {};
			$.trigger(this.container, 'destory', self);
			self._destroyed = 1;
		}
	});
})(mui, window, document);