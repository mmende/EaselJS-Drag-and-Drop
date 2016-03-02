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
