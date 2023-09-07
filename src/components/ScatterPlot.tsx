import React from 'react';
import * as d3 from 'd3';

import { Starship } from '../stores/Starships';

import './ScatterPlot.css';

const MARGINS = {
    top: 0,
    bottom: 40,
    left: 40,
    right: 0
};

const TRANSITION_TIME = 200;

function formatHumanCount(count: string) {
    // some numbers have commas we don't want
    return parseInt(count.replace(',', '')) || 0;
}

function findMaxValue (data: Starship[], key: string) {
    return data.reduce((acc: number, s: Starship) => {
        // @ts-ignore because we're dynamically accessing Starship attributes
        const count = formatHumanCount(s[key]);

        return count ? Math.max(count, acc) : acc;
    }, 0);
}

type ScatterPlotProps = {
    data?: any[]
};

class ScatterPlot extends React.Component<ScatterPlotProps, {}> {
    d3Ref: any = null;
    
    constructor(props: ScatterPlotProps) {
        super(props);

        this.d3Ref = React.createRef();
    }

    // any time our mobx store (Starships) updates its filters, force the re-render of D3 things
    componentDidUpdate() {
        this.drawChart();
    }

    drawAxes = (svg: any, svgWidth: number, svgHeight: number) => {
        const { data = [] } = this.props;

        const maxPassengers = findMaxValue(data, 'passengers');
        const maxCrew = findMaxValue(data, 'crew');
        const maxPeople = maxCrew + maxPassengers;
        const maxLength = findMaxValue(data, 'length');

        const xAxis = d3.scaleLinear()
            .domain([0, maxLength + Math.floor(maxLength / 10)]) // max + 10%
            .range([0, svgWidth - MARGINS.left]);

        const yAxis = d3.scaleLinear()
            .domain([0, maxPeople + Math.floor(maxPeople / 10)]) // max + 10%
            .range([svgHeight - MARGINS.bottom, 20]);

        // add the axes
        svg.append("g")
            .attr("transform", `translate(${MARGINS.left}, ${svgHeight - MARGINS.bottom})`)
            .call(d3.axisBottom(xAxis));

        svg.append("text")
            .attr("class", "x label")
            .attr("x", svgWidth / 2)
            .attr("y", svgHeight - 10)
            .text("Starship Length");

        svg.append("g")
            .attr("transform", `translate(${MARGINS.left}, 0)`)
            .call(d3.axisLeft(yAxis));

        svg.append("text")
            .attr("class", "y label")
            .attr("y", 0)
            .attr("x", svgHeight / 2 * -1)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text("Max # Passengers");

        return { xAxis, yAxis }
    }

    drawCircles = (svg: any, xAxis: any, yAxis: any) => {
        const { data = [] } = this.props;
        const domEl = this.d3Ref.current;

        // add the Starships (as circles)
        svg.selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("data-starship-name", (s: Starship) => s.name)
            .attr("data-starship-length", (s: Starship) => s.length)
            .attr("data-starship-passengers", (s: Starship) => s.passengers)
            .attr("r", 5)
            .attr("cx", (s: Starship) => {
                return xAxis(formatHumanCount(s.length)) 
            })
            .attr("cy", (s: Starship) => {
                const passengers = formatHumanCount(s.passengers);
                const crew = formatHumanCount(s.crew);

                return yAxis(passengers + crew);
            })
            .attr("transform", `translate(${MARGINS.left}, 0)`)
            .on('mouseover', function (event: any, starship: Starship) {
                // @ts-ignore because TypeScript can't deal with `this: any`
                d3.select(this).transition()
                    .duration(TRANSITION_TIME)
                    .attr("r", 7);

                const div = d3.select('.tooltip');

                div.transition()
                    .duration(TRANSITION_TIME)
                    .style("opacity", 1);

                const boundaries = domEl.getBoundingClientRect(),
                    windowTop = boundaries.top,
                    windowBottom = boundaries.bottom,
                    windowRight = boundaries.right;

                let tooltipTop = event.clientY - 50,
                    tooltipLeft = event.clientX + 50,
                    assumedWidth = 400,
                    assumedHeight = 200;
            
                if(tooltipTop < windowTop) { 
                    tooltipTop = tooltipTop + 50;
                } else if (tooltipTop + assumedHeight > windowBottom) {
                    tooltipTop = tooltipTop - assumedHeight/2;
                }

                if((tooltipLeft + assumedWidth) > windowRight) { 
                    tooltipLeft = tooltipLeft - assumedWidth;
                }

                div.html(`
                    <h3>${starship.name}</h3>
                    <p>Length: ${starship.length}</p>
                    <p>Passengers: ${starship.passengers}, Crew: ${starship.crew}</p>
                `)
                    .style("left", `${tooltipLeft}px`)
                    .style("top", `${tooltipTop}px`);
            })
            .on('mouseout', function (event: any, starship: Starship) {
                // @ts-ignore because TypeScript can't deal with `this: any`
                d3.select(this).transition()
                    .duration(TRANSITION_TIME)
                    .attr("r", 5);

                // remove all prior tooltip content
                d3.selectAll('.tooltip > *').remove();
                const div = d3.select('.tooltip');

                div.transition()
                    .duration(TRANSITION_TIME)
                    .style("opacity", 0);
            });
    }

    drawChart = () => {
        const domEl = this.d3Ref.current;

        const svgHeight = domEl.offsetHeight;
        const svgWidth = domEl.offsetWidth;

        // remove the existing SVG element
        d3.selectAll("svg").remove();

        // redraw the SVG element and its children
        const svg = d3.select(domEl)
            .append('svg')
            .attr('width', svgWidth)
            .attr('height', svgHeight)
            .append("g")
            .attr("transform", `translate(${MARGINS.left}, 0)`); // allow some extra space within the D3 area

        const { xAxis, yAxis } = this.drawAxes(svg, svgWidth, svgHeight);

        this.drawCircles(svg, xAxis, yAxis);
    }

    render() {
        return (
            <div className="ScatterPlot" ref={this.d3Ref}>
                <div className="tooltip"></div>
                { /* <svg /> filled in by D3 */ }
            </div>
        );
    }
}

export default ScatterPlot;