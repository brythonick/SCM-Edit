$("#canvas").click((e) => layerStack.select(e.target.id));


class Draw {
    constructor() {
        this.margin = 25;
        this.canvas = $("svg");
        this.d3Canvas = d3.select("svg");
        this.canvasWidth = this.canvas.width() - this.margin;
        $(window).resize(() => {this.canvasWidth = this.canvas.width() - this.margin; this.redraw()});
    }

    coords(lyr) {
        let totalThickness = this.margin + lyr.thickness;
        lyr.below.forEach((l) => {totalThickness += l.thickness});
        return {"x": this.margin, "y": 500 - totalThickness};
    }

    layer(lyr) {
        const coords = this.coords(lyr);
        const combined = lyr.upperBoundary
            .data(coords.x, coords.y, this.canvasWidth - this.margin)
            .concat(lyr.lowerBoundary.data(coords.x, coords.y + lyr.thickness, this.canvasWidth - this.margin).reverse());
        this.d3Canvas.append("path")
            .attr("d", BoundaryData.toLine(combined) + "Z")
            .attr("class", "layer " + lyr.type)
            .attr("id", lyr.id)
            .attr("pointer-events", "visibleFill");
    }

    erase(lyr) {
        this.d3Canvas.select("#" + lyr.id).remove();
    }

    redraw() {
        layerStack.layers.forEach((l) => {
            this.erase(l);
            this.layer(l);
        });
    }

}
const drawObject = new Draw();


class BoundaryData {
    static flat(x, y, canvasWidth) {
        return [
            {"x": x, "y": y},
            {"x": x + canvasWidth, "y": y}
        ];
    }

    static zigzag(x, y, canvasWidth) {
        const segmentWidth = 50;
        const numSegments = Math.floor(canvasWidth.width / segmentWidth);
        const remainder = (((canvasWidth.width / segmentWidth) - numSegments) / numSegments) * segmentWidth;
        let lineData = [];
        for (let i = 0; i <= numSegments; i += 1) {
            let zigzagY = (i % 2 === 0 ? y + 10 : y - 10);
            lineData.push({"x": i * (segmentWidth + remainder), "y": zigzagY});
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


class Boundary {
    constructor(type) {
        this.type = type;
        this.data = this.data.bind(this);
    }

    data(x, y, canvasWidth) {
        switch (this.type) {
            case "Flat":
                return BoundaryData.flat(x, y, canvasWidth);
            case "Zigzag":
                return BoundaryData.zigzag(x, y, canvasWidth);
        }
    }
}


class Layer {
    constructor(id, type, layersBelow) {
        this.id = id;
        this.type = type;
        this.below = layersBelow;
        this.thickness = 50;
        this.upperBoundary = new Boundary("Flat");
        this.lowerBoundary = this.below[this.below.length - 1].upperBoundary;
    }

    setUpperBoundary(type) {
        this.upperBoundary = new Boundary(type);
    }
}


class LayerStack {
    constructor() {
        this.layers = [];
        this.selected = null;
        this.new = this.new.bind(this);
        this.select = this.select.bind(this);
        this.removeSelected = this.removeSelected.bind(this);
    }

    new(type) {
        let below = [];
        if (this.layers.length === 0) {
            below = [{"upperBoundary": new Boundary("Flat"), "thickness": 0}];
        } else {
            this.layers.forEach((l) => {below.push({"upperBoundary": l.upperBoundary, "thickness": l.thickness});});
        }
        const newLayer = new Layer("layer" + this.layers.length, type, below);
        drawObject.layer(newLayer);
        this.layers.push(newLayer);
    }

    select(id) {
        this.selected = this.layers.filter(layer => layer.id === id)[0];
        if (this.selected === undefined) {
            return;
        }
        try {
            $(".selected").removeClass("selected");
        } catch (e) {}
        layerToTop(id);
        $("#" + id).addClass("selected");
        $("#remove-layer").prop("disabled", false);
        upperBoundary.val(this.selected.boundary.type);
    }

    deselect() {
        if (this.selected !== undefined) {
            try {
                $(".selected").removeClass("selected");
            } catch (e) {}
            $("#remove-layer").prop("disabled", true);
        }
    }

    removeSelected() {
        this.deselect();
        this.eraseAll();
        this.layers.splice(this.layers.indexOf(this.selected), 1);
        this.selected = undefined;
        this.redrawAll();
    }
}
let layerStack = new LayerStack();


function layerToTop(id) {
    const target = document.getElementById(id);
    target.parentNode.appendChild(target);
}

$("#new-limestone").click(() => layerStack.new("limestone"));
$("#new-shale").click(() => layerStack.new("shale"));
$("#remove-layer").click(layerStack.removeSelected);
const upperBoundary = $("#upper-boundary");
upperBoundary.change(() => layerStack.selected.setUpperBoundary(upperBoundary.val()));

$(document).keyup((b) => {
    if (b.key === "Escape") {
        layerStack.deselect();
    }
});