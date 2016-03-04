# EaselJS-Drag-and-Drop
*An easy to use drag and drop container for EaselJS*

A DragDropContainer can be created like:

```js
// Create a ddcontainer
var ddcontainer = new DDC.DragDropContainer(parentContainer);

// Make it draggable
ddcontainer.draggable();

// Make it droppable
ddcontainer.droppable();
```

The DragDropContainer will then be added to `parentContainer` (e.g. the stage).
The `ddcontainer` has a property `container` which is the actual easeljs container to draw to. You can optionally add a reference as second parameter when creating the container that is than accessible as `reference` property of the draggable / droppable in the event results:


```js
// Create a ddcontainer
var myObject = {n: 42};
var ddcontainer = new DDC.DragDropContainer(parentContainer, myObject);
ddcontainer.draggable().droppable();

// Create a second ddcontainer
var myObject2 = {n: 24};
var ddcontainer2 = new DDC.DragDropContainer(parentContainer, myObject2);
ddcontainer2.draggable().droppable();

// Bind the overdroppable event and check the reference
ddcontainer.on('overdroppable', function(dropEvent) {
	var dragRef = dropEvent.draggable.reference;
	console.log('The answer to life the universe and everything is:', dragRef.n);
});
```

## Methods

* `on(event: string, callback: Function): reference` - Binds a callback to an event.
* `off(event: string, reference)` - Unbinds a callback from an event.
* `draggable([draggable: boolean = true])` (chainable) - Enables or disables draggable on this container.
* `droppable([droppable: boolean = true])` (chainable) - Enables or disables droppable on this container.

## Events

event            | parameters                                                     | description
-----------------|----------------------------------------------------------------|----------------------
`startdragging`  | `draggable: DragDropContainer, droppable: DragDropContainer`   | When the user started dragging the container
`stopdragging`   | `draggable: DragDropContainer, droppable: DragDropContainer`   | When the user stopped dragging the container
`dragging`       | `draggable: DragDropContainer, droppable: DragDropContainer`   | When the container is moving through dragging
`overdroppable`  | `draggable: DragDropContainer, droppable: DragDropContainer`   | When another container is dragged over the droppable container
`outdroppable`   | `draggable: DragDropContainer, droppable: DragDropContainer`   | When a dragged container is no longer over the droppable container
`hitdroppable`   | `draggable: DragDropContainer, droppable: DragDropContainer`   | When another container is dragged over the droppable container and was released

## Example

To see it in action take a look at examle/index.html