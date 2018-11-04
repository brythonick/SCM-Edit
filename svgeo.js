const margin = 25;
const canvas = d3.select("svg");
let canvasSize = $("svg")[0].getBoundingClientRect();
window.addEventListener("resize", () => {canvasSize = $("svg")[0].getBoundingClientRect(); layerStack.redrawAll()}, false);


class Boundary {
    static flat(x, y) {
        return [
            {"x": x, "y": y},
            {"x": x + canvasSize.width, "y": y}
        ];
    }

    static undulating(x, y) {
        return [
            {"x": x, "y": y},
            {"x": x + 100, "y": y + 10},
            {"x": x + 200, "y": y - 10},
            {"x": x + 300, "y": y + 10},
            {"x": x + 400, "y": y - 10},
            {"x": x + 500, "y": y + 10},
            {"x": x + 600, "y": y - 10},
            {"x": x + 700, "y": y + 10},
            {"x": x + 800, "y": y - 10}
        ];
    }

    static toLine(data) {
        const line =  d3.line()
            .x((d) => {return d.x;})
            .y((d) => {return d.y;});
        return line(data);
    }
}


class Layer {
    constructor(id) {
        this.id = id;
        this.upperBoundary = null;
        this.lowerBoundary = null;
        this.x = null;
        this.y = null;
        this.draw = this.draw.bind(this);
    }

    get boundary() {
        return this.upperBoundary;
    }

    draw(x, y, upperBoundary, lowerBoundary) {
        this.upperBoundary = upperBoundary;
        this.lowerBoundary = lowerBoundary;
        this.x = x;
        this.y = y;
        let combined = upperBoundary(x, y).concat(lowerBoundary(x, y + 50).reverse());
        canvas.append("path")
            .attr("d", Boundary.toLine(combined) + "Z")
            .attr("stroke", "none")
            .attr("fill", "blue")
            .attr("id", "layer" + this.id);
    }

    erase() {
        d3.select("#layer" + this.id).remove();
    }

    redraw() {
        this.erase();
        this.draw(this.x, this.y, this.upperBoundary, this.lowerBoundary);
    }
}


class LayerStack {
    constructor() {
        this.layers = [];
        this.new = this.new.bind(this);
        this.pop = this.pop.bind(this);
    }

    get yCoordinate() {
        return 500 - margin - 50 - this.layers.length * 50;
    }

    get currentTopBoundary() {
        if (this.layers.length === 0) {
            return Boundary.flat;
        } else {
            return this.layers[this.layers.length - 1].boundary;
        }
    }

    new() {
        const newLayer = new Layer(this.layers.length);
        newLayer.draw(
            0,
            this.yCoordinate,
            Boundary.flat,
            this.currentTopBoundary
        );
        this.layers.push(newLayer);
    }

    pop() {
        if (this.layers.length > 0) {
            const layer = this.layers.pop();
            layer.erase();
        }
    }

    redrawAll() {
        this.layers.forEach((layer) => {layer.redraw()})
    }
}
let layerStack = new LayerStack();
document.getElementById("new-solid").addEventListener("click", layerStack.new, false);
document.getElementById("pop-layer").addEventListener("click", layerStack.pop, false);