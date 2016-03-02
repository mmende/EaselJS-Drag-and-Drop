var DDC;
(function (DDC) {
    var EventDispatcher = (function () {
        function EventDispatcher() {
            this.events = [];
        }
        /**
         * Registers a new event for subscriptions
         *
         * @param {string} eventName The event name
         */
        EventDispatcher.prototype.registerEvent = function (eventName) {
            this.events[eventName] = [];
        };
        /**
         * Calls all subscriptions of a specific event
         *
         * @param {string} eventName The eventName
         * @param {mixed}  [arg0]    The first argument to pass to the subscribing functions
         * @param {mixed}  [arg1]    The second argument to pass to the subscribing functions
         * @param {mixed}  [arg2]    ...
         */
        EventDispatcher.prototype.trigger = function (eventName) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (this.events.hasOwnProperty(eventName))
                for (var i = 0; i < this.events[eventName].length; ++i)
                    this.events[eventName][i].apply(this, Array.prototype.slice.call(arguments, 1));
        };
        /**
         * Subscribes to an droppable event
         *
         * @param {string}   eventName The event name (hit, over or out)
         * @param {Function} callback  The function
         *
         * @returns {Function} The callback function to use for unsubscribing
         */
        EventDispatcher.prototype.on = function (eventName, callback) {
            // Remove the callback
            if (this.events.hasOwnProperty(eventName))
                this.events[eventName].push(callback);
            return callback;
        };
        /**
         * Unsubscribes from a droppable event
         *
         * @param {string}   eventName The event name (hit, over or out)
         * @param {Function} callback     The function
         */
        EventDispatcher.prototype.off = function (eventName, callback) {
            // Unsubscribes an event from a subscription list
            function unsubscribe(list, callback) {
                var index = list.indexOf(callback);
                if (index !== -1) {
                    console.log('Event found');
                    list.splice(index, 1);
                }
                else {
                    console.log('Event not found:', list, callback);
                }
            }
            // Remove the callback
            if (this.events.hasOwnProperty(eventName))
                unsubscribe(this.events[eventName], callback);
            console.log('Events after off:', this.events[eventName]);
        };
        return EventDispatcher;
    })();
    DDC.EventDispatcher = EventDispatcher;
})(DDC || (DDC = {}));
