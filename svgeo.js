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
        let lineData = [];
        for (let i = 0; i <= 10; i += 1) {
            let undulatingY = (i % 2 === 0 ? y + 10 : y - 10);
            console.log(i + ": " + undulatingY);
            lineData.push({"x": i/10.0 * canvasSize.width, "y": undulatingY});
        }
        return lineData;
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
        this.type = "";
        this.upperBoundary = null;
        this.lowerBoundary = null;
        this.x = null;
        this.y = null;
        this.draw = this.draw.bind(this);
    }

    get boundary() {
        return this.upperBoundary;
    }

    draw(type, x, y, upperBoundary, lowerBoundary) {
        this.type = type;
        this.upperBoundary = upperBoundary;
        this.lowerBoundary = lowerBoundary;
        this.x = x;
        this.y = y;
        let combined = upperBoundary(x, y).concat(lowerBoundary(x, y + 50).reverse());
        canvas.append("path")
            .attr("d", Boundary.toLine(combined) + "Z")
            .attr("class", "layer " + this.type)
            .attr("id", "layer" + this.id);
    }

    erase() {
        d3.select("#layer" + this.id).remove();
    }

    redraw() {
        this.erase();
        this.draw(this.type, this.x, this.y, this.upperBoundary, this.lowerBoundary);
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
            return Boundary.undulating;
        } else {
            return this.layers[this.layers.length - 1].boundary;
        }
    }

    new(type) {
        const newLayer = new Layer(this.layers.length);
        newLayer.draw(
            type,
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
document.getElementById("new-limestone").addEventListener("click", () => layerStack.new("limestone"), false);
document.getElementById("new-shale").addEventListener("click", () => layerStack.new("shale"), false);
document.getElementById("pop-layer").addEventListener("click", layerStack.pop, false);