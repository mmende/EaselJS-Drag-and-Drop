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

var DDC;
(function (DDC) {
    var Point = (function () {
        /**
         * Creates a point with x and y coordinates
         *
         * @param {number} public x The x coordinate
         * @param {number} public y The y coordinate
         */
        function Point(x, y) {
            this.x = x;
            this.y = y;
        }
        return Point;
    })();
    DDC.Point = Point;
})(DDC || (DDC = {}));

/// <reference path="EventDispatcher.ts"/>
/// <reference path="Point.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var DDC;
(function (DDC) {
    /** @type {DragDropContainer[]} Holds all droppables **/
    var __droppables = [];
    var DragDropContainer = (function (_super) {
        __extends(DragDropContainer, _super);
        /**
         * Creates a new DragDropContainer with both functions disabled.
         * To be able to check for drops the containers must have the same parent.
         * Note: The drop events will be triggered at the droppable containers
         *       whereas the drag events will be triggered at the draggables.
         *
         * @param {Container} parent The parent container where this container should be added to.
         */
        function DragDropContainer(parent) {
            _super.call(this);
            this.container = new createjs.Container();
            // Register the possible events
            this.registerEvent('startdragging');
            this.registerEvent('stopdragging');
            this.registerEvent('dragging');
            this.registerEvent('overdroppable');
            this.registerEvent('outdroppable');
            this.registerEvent('hitdroppable');
            // Add the container to it's parent
            this.parent = parent;
            this.parent.addChild(this.container);
        }
        /**
         * Makes the container draggable or undraggable.
         *
         * @param {boolean = true} draggable If the container should be draggable or not.
         *
         * @returns {DragDropContainer} Returns the instance the method is called on (useful for chaining calls.)
         */
        DragDropContainer.prototype.draggable = function (draggable) {
            if (draggable === void 0) { draggable = true; }
            if (draggable) {
                return this.enableDraggable();
            }
            return this.disableDraggable();
        };
        /**
         * Makes the container droppable or undroppable.
         *
         * @param {boolean = true} droppable If the container should be droppable or not.
         *
         * @returns {DragDropContainer} Returns the instance the method is called on (useful for chaining calls.)
         */
        DragDropContainer.prototype.droppable = function (droppable) {
            if (droppable === void 0) { droppable = true; }
            if (droppable) {
                return this.enableDroppable();
            }
            return this.disableDroppable();
        };
        /**
         * Enables draggable for the container.
         *
         * @returns {DragDropContainer} Returns the instance the method is called on (useful for chaining calls.)
         */
        DragDropContainer.prototype.enableDraggable = function () {
            var that = this;
            var startOffset = new DDC.Point(0, 0);
            var lastDroppable = null;
            // When the draggable container is clicked
            this.downEvent = this.container.on('mousedown', function (dEvent) {
                // Prevent dragging on undraggables
                if (dEvent.target.hasOwnProperty('isDraggable') && dEvent.target.isDraggable == false)
                    return;
                // Store the offset on the draggable (where the click was on the container on the begining)
                startOffset.x = dEvent.stageX - this.x;
                startOffset.y = dEvent.stageY - this.y;
                // Move the draggable to the front of the display object list
                that.parent.setChildIndex(that.container, that.parent.getNumChildren() - 1);
                // Init the result object with empty droppable
                var eventResult = { draggable: that };
                eventResult.draggable = that;
                // Call the startdragging callbacks
                that.trigger('startdragging', eventResult);
                // Start track the move event
                that.moveEvent = that.container.on('pressmove', function (mEvent) {
                    // Move the container with the mouse/touch
                    that.container.x = mEvent.stageX - startOffset.x;
                    that.container.y = mEvent.stageY - startOffset.y;
                    // Check all droppables for over
                    var point = new DDC.Point(mEvent.stageX, mEvent.stageY);
                    eventResult.droppable = that.getDroppableUnderPoint(point);
                    // Call the dragging callbacks
                    that.trigger('dragging', eventResult);
                    // Skip the over call if this droppable was the lastDroppable
                    if (lastDroppable === eventResult.droppable)
                        return;
                    // Call over droppable if such exists
                    if (eventResult.droppable !== null) {
                        eventResult.droppable.trigger('overdroppable', eventResult);
                        // If lastDroppable was null it will be set now
                        if (lastDroppable === null) {
                            lastDroppable = eventResult.droppable;
                        }
                        else {
                            // The lastDroppable must have been another one (see check above)
                            // Therefore the outdroppable will be triggered on the last one
                            lastDroppable.trigger('outdroppable', eventResult);
                            lastDroppable = eventResult.droppable;
                        }
                    }
                    else if (lastDroppable !== null) {
                        // The lastDroppable has no more hit as it seems
                        lastDroppable.trigger('outdroppable', eventResult);
                        lastDroppable = null;
                    }
                });
                // And start track the up event
                that.upEvent = that.container.on('pressup', function (uEvent) {
                    // Check all droppables for hit
                    var point = new DDC.Point(uEvent.stageX, uEvent.stageY);
                    eventResult.droppable = that.getDroppableUnderPoint(point);
                    // Call the startdragging callbacks
                    that.trigger('stopdragging', eventResult);
                    // Unbind move and up events
                    that.container.off('pressmove', that.moveEvent);
                    that.container.off('pressup', that.moveEvent);
                    // Call hit droppable if such exists
                    if (eventResult.droppable !== null)
                        eventResult.droppable.trigger('hitdroppable', eventResult);
                });
            });
            // Return this to allow chaining
            return this;
        };
        /**
         * Disables dragging for the container
         *
         * @returns {DragDropContainer} Returns the instance the method is called on (useful for chaining calls.)
         */
        DragDropContainer.prototype.disableDraggable = function () {
            // Remove eventListener
            this.container.off('mousedown', this.downEvent);
            // Return this to allow chaining
            return this;
        };
        /**
         * Enables droppable on the container
         *
         * @returns {DragDropContainer} Returns the instance the method is called on (useful for chaining calls.)
         */
        DragDropContainer.prototype.enableDroppable = function () {
            var that = this;
            // Bind a mouse event so that it will be detected with getObjectsUnderPoint()
            this.overEvent = this.container.on('mouseover', function (oEvent) {
                //console.log('Over:', that);
            });
            // Add the droppable to __droppables
            __droppables.push(this);
            // Return this to allow chaining
            return this;
        };
        /**
         * Disables droppable on the container
         *
         * @returns {DragDropContainer} Returns the instance the method is called on (useful for chaining calls.)
         */
        DragDropContainer.prototype.disableDroppable = function () {
            // Remove eventListener
            this.container.off('mouseover', this.overEvent);
            // Remove it from __droppables
            var index = __droppables.indexOf(this);
            if (index > -1)
                __droppables.splice(index, 1);
            // Return this to allow chaining
            return this;
        };
        /*******************************************************/
        /** Some helper functions to find the right droppable **/
        /*******************************************************/
        /**
         * Checks all droppables for a hit with the draggable.
         *
         * @param {Point} point The point.
         */
        DragDropContainer.prototype.getDroppableContainerUnderPoint = function (point) {
            var droppables = this.parent.getObjectsUnderPoint(point.x, point.y, 2);
            var droppable = null;
            // Check all droppables under the point
            for (var i = 0; i < droppables.length; ++i) {
                // Skip the draggable itself
                if (droppables[i].parent && droppables[i].parent.id === this.container.id)
                    continue;
                // Set this as droppable if it has a higher z-index
                var oldIndex = droppable ? this.parent.getChildIndex(droppable) : -1;
                var newIndex = this.parent.getChildIndex(droppables[i].parent);
                if (newIndex > oldIndex)
                    droppable = droppables[i].parent;
            }
            return droppable;
        };
        /**
         * Returns the DragDropContainer that belongs to a easeljs container.
         *
         * @param  {Container}            container The container.
         *
         * @return {DragDropContainer}              The corresponding DragDropContainer if such exists.
         */
        DragDropContainer.prototype.getDroppableFromContainer = function (container) {
            for (var i = 0; i < __droppables.length; ++i)
                if (__droppables[i].container.id === container.id)
                    return __droppables[i];
            return null;
        };
        /**
         * Returns the DragDropContainer under a point
         *
         * @param  {Point}             point The mouse point of the draggable.
         *
         * @return {DragDropContainer}       The DragDropContainer under it.
         */
        DragDropContainer.prototype.getDroppableUnderPoint = function (point) {
            var droppableContainer = this.getDroppableContainerUnderPoint(point);
            if (droppableContainer === null)
                return null;
            return this.getDroppableFromContainer(droppableContainer);
        };
        return DragDropContainer;
    })(DDC.EventDispatcher);
    DDC.DragDropContainer = DragDropContainer;
})(DDC || (DDC = {}));

//# sourceMappingURL=ddcontainer.js.map