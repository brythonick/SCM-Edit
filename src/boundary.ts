import {line} from 'd3-line';

export class BoundaryData {
    static flat(x, y, canvasWidth) {
        return [
            {"x": x, "y": y},
            {"x": x + canvasWidth, "y": y}
        ];
    }

    static zigzag(x, y, canvasWidth) {
        const segmentWidth = 50;
        const numSegments = Math.floor(canvasWidth / segmentWidth);
        const remainder = (((canvasWidth / segmentWidth) - numSegments) / numSegments) * segmentWidth;
        let lineData = [];
        for (let i = 0; i <= numSegments; i += 1) {
            let zigzagY = (i % 2 === 0 ? y + 10 : y - 10);
            lineData.push({"x": x + i * (segmentWidth + remainder), "y": zigzagY});
        }
        return lineData;
    }

    static toLine(data) {
        const lineFunc = line()
            .x((d) => {return d.x;})
            .y((d) => {return d.y;});
        return lineFunc(data);
    }
}

export class Boundary {
    type: string;

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