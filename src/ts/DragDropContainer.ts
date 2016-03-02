/// <reference path="EventDispatcher.ts"/>
/// <reference path="Point.ts"/>

declare var createjs

module DDC {

	/** @type {DragDropContainer[]} Holds all droppables **/
	var __droppables: DragDropContainer[] = [];

	/** The result shape for drag and drop events **/
	interface DragDropResult {
		draggable: DragDropContainer;
		droppable?: DragDropContainer;
	}

	export class DragDropContainer extends EventDispatcher {

		public container: any = new createjs.Container();

		/** @type {any} The parent where the container should be added to. **/
		private parent: any;
		private downEvent: Event;
		private moveEvent: Event;
		private upEvent: Event;
		private overEvent: Event;

		/**
		 * Creates a new DragDropContainer with both functions disabled.
		 * To be able to check for drops the containers must have the same parent.
		 * Note: The drop events will be triggered at the droppable containers 
		 *       whereas the drag events will be triggered at the draggables.
		 *
		 * @param {Container} parent The parent container where this container should be added to.
		 */
		constructor(parent) {
			super();

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
		public draggable(draggable: boolean = true) {
			if(draggable) {
				return this.enableDraggable();
			}
			return this.disableDraggable();
		}

		/**
		 * Makes the container droppable or undroppable.
		 *
		 * @param {boolean = true} droppable If the container should be droppable or not.
		 *
		 * @returns {DragDropContainer} Returns the instance the method is called on (useful for chaining calls.)
		 */
		public droppable(droppable: boolean = true) {
			if (droppable) {
				return this.enableDroppable();
			}
			return this.disableDroppable();
		}

		/**
		 * Enables draggable for the container.
		 *
		 * @returns {DragDropContainer} Returns the instance the method is called on (useful for chaining calls.)
		 */
		private enableDraggable() {
			var that = this;
			var startOffset: Point = new Point(0, 0);

			var lastDroppable: DragDropContainer = null;

			// When the draggable container is clicked
			this.downEvent = this.container.on('mousedown', function(dEvent) {
				// Prevent dragging on undraggables
				if (dEvent.target.hasOwnProperty('isDraggable') && dEvent.target.isDraggable == false) return;
				// Store the offset on the draggable (where the click was on the container on the begining)
				startOffset.x = dEvent.stageX - this.x;
				startOffset.y = dEvent.stageY - this.y;
				// Move the draggable to the front of the display object list
				that.parent.setChildIndex(that.container, that.parent.getNumChildren() - 1);
				// Init the result object with empty droppable
				var eventResult: DragDropResult = {draggable: that};
				eventResult.draggable = that;

				// Call the startdragging callbacks
				that.trigger('startdragging', eventResult);

				// Start track the move event
				that.moveEvent = that.container.on('pressmove', function(mEvent) {
					// Move the container with the mouse/touch
					that.container.x = mEvent.stageX - startOffset.x;
					that.container.y = mEvent.stageY - startOffset.y;
					// Check all droppables for over
					var point: Point = new Point(mEvent.stageX, mEvent.stageY);
					eventResult.droppable = that.getDroppableUnderPoint(point);
					// Call the dragging callbacks
					that.trigger('dragging', eventResult);
					// Skip the over call if this droppable was the lastDroppable
					if (lastDroppable === eventResult.droppable) return;
					// Call over droppable if such exists
					if (eventResult.droppable !== null) {
						eventResult.droppable.trigger('overdroppable', eventResult);
						// If lastDroppable was null it will be set now
						if (lastDroppable === null) {
							lastDroppable = eventResult.droppable;
						} else {
							// The lastDroppable must have been another one (see check above)
							// Therefore the outdroppable will be triggered on the last one
							lastDroppable.trigger('outdroppable', eventResult);
							lastDroppable = eventResult.droppable;
						}
					} else if (lastDroppable !== null) {
						// The lastDroppable has no more hit as it seems
						lastDroppable.trigger('outdroppable', eventResult);
						lastDroppable = null;
					}
				});
				// And start track the up event
				that.upEvent = that.container.on('pressup', function(uEvent) {
					// Check all droppables for hit
					var point: Point = new Point(uEvent.stageX, uEvent.stageY);
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
		}

		/**
		 * Disables dragging for the container
		 *
		 * @returns {DragDropContainer} Returns the instance the method is called on (useful for chaining calls.)
		 */
		private disableDraggable() {
			// Remove eventListener
			this.container.off('mousedown', this.downEvent);
			// Return this to allow chaining
			return this;
		}

		/**
		 * Enables droppable on the container
		 *
		 * @returns {DragDropContainer} Returns the instance the method is called on (useful for chaining calls.)
		 */
		private enableDroppable() {
			var that = this;
			// Bind a mouse event so that it will be detected with getObjectsUnderPoint()
			this.overEvent = this.container.on('mouseover', function(oEvent) {
				//console.log('Over:', that);
			});
			// Add the droppable to __droppables
			__droppables.push(this); 

			// Return this to allow chaining
			return this;
		}

		/**
		 * Disables droppable on the container
		 *
		 * @returns {DragDropContainer} Returns the instance the method is called on (useful for chaining calls.)
		 */
		private disableDroppable() {
			// Remove eventListener
			this.container.off('mouseover', this.overEvent);
			// Remove it from __droppables
			var index = __droppables.indexOf(this);
			if (index > -1)
				__droppables.splice(index, 1);
			// Return this to allow chaining
			return this;
		}

		/*******************************************************/
		/** Some helper functions to find the right droppable **/
		/*******************************************************/

		/**
		 * Checks all droppables for a hit with the draggable.
		 *
		 * @param {Point} point The point.
		 */
		private getDroppableContainerUnderPoint(point: Point) {
			var droppables: any[] = this.parent.getObjectsUnderPoint(point.x, point.y, 2);
			var droppable = null;
			// Check all droppables under the point
			for (var i = 0; i < droppables.length; ++i) {
				// Skip the draggable itself
				if (droppables[i].parent && droppables[i].parent.id === this.container.id) continue;
				// Set this as droppable if it has a higher z-index
				var oldIndex = droppable ? this.parent.getChildIndex(droppable) : -1;
				var newIndex = this.parent.getChildIndex(droppables[i].parent);
				if (newIndex > oldIndex) droppable = droppables[i].parent;
			}
			return droppable;
		}

		/**
		 * Returns the DragDropContainer that belongs to a easeljs container.
		 *
		 * @param  {Container}            container The container.
		 *
		 * @return {DragDropContainer}              The corresponding DragDropContainer if such exists.
		 */
		private getDroppableFromContainer(container): DragDropContainer {
			for (var i = 0; i < __droppables.length; ++i)
				if (__droppables[i].container.id === container.id) return __droppables[i];
			return null;
		}

		/**
		 * Returns the DragDropContainer under a point
		 *
		 * @param  {Point}             point The mouse point of the draggable.
		 *
		 * @return {DragDropContainer}       The DragDropContainer under it.
		 */
		private getDroppableUnderPoint(point: Point): DragDropContainer {
			var droppableContainer = this.getDroppableContainerUnderPoint(point);
			if (droppableContainer === null) return null;
			return this.getDroppableFromContainer(droppableContainer);
		}

	}

}