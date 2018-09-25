var target = d3.select("#target");

var svg = d3.select("svg"),
    margin = { top: 20, right: 20, bottom: 60, left: 40 },
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var chart_w = width;
var kioskos = [];
var keys = ["mayoritaria", "indigena", "afro"];
var colors = ["#00A388", "#79BD8F", "#BEEB9F"];
var poblation = 0;
var sort = 0;
var tooltip;

function updateChart() {
    svg.selectAll("g").remove();
    var data;

    if (sort == 0) {
        if (poblation < 3)
            data = kioskos.sort((a, b) => d3.descending(a[keys[poblation]], b[keys[poblation]]));
        else {
            data = kioskos.sort((a, b) => d3.descending(a.total, b.total));
        }
    } else {
        data = kioskos.sort((a, b) => d3.ascending(a.municipio, b.municipio));
    }

    let y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.total)]).nice()
        .range([height - margin.bottom, margin.top]);

    let x = d3.scaleBand()
        .domain(data.map(d => d.municipio))
        .range([margin.left, width - margin.right])
        .padding(0.1);

    let xAxis = svg
        .append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x)
            .tickSizeOuter(0))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", function (d) {
            return "rotate(-65)";
        });


    let yAxis = svg
        .append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .attr("id", "yaxis")
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove());


    if (poblation != 3) {
        var g = svg.append("g")
            .attr("fill", colors[poblation])
            .selectAll(".indigena").data(data).enter().append("rect")
            .attr("x", d => x(d.municipio))
            .attr("y", d => y(d[keys[poblation]]))
            .attr("height", d => y(0) - y(d[keys[poblation]]))
            .attr("width", x.bandwidth())
            .on("mousemove", mousemoved)
            .on("mouseleave", mouseleave);
    } else {
        var g = svg.append("g")
            .attr("fill", colors[0])
            .selectAll(".mayo").data(data).enter().append("rect")
            .attr("x", d => x(d.municipio))
            .attr("y", d => y(d.mayoritaria))
            .attr("height", d => y(0) - y(d.mayoritaria))
            .attr("width", x.bandwidth())
            .on("mousemove", mousemovedMayo)
            .on("mouseleave", mouseleave);

        var g = svg.append("g")
            .attr("fill", colors[1])
            .selectAll(".indigena").data(data).enter().append("rect")
            .attr("x", d => x(d.municipio))
            .attr("y", d => y(d.mayoritaria + d.indigena))
            .attr("height", d => y(0) - y(d.indigena))
            .attr("width", x.bandwidth())
            .on("mousemove", mousemovedInd)
            .on("mouseleave", mouseleave);

        var g = svg.append("g")
            .attr("fill", colors[2])
            .selectAll(".indigena").data(data).enter().append("rect")
            .attr("x", d => x(d.municipio))
            .attr("y", d => y(d.indigena + d.afro + d.mayoritaria))
            .attr("height", d => y(0) - y(d.afro))
            .attr("width", x.bandwidth())
            .on("mousemove", mousemovedAfro)
            .on("mouseleave", mouseleave);

    }

    var legend = svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(keys)
        .enter().append("g")
        .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", width - 19)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", (d, i) => { return colors[i] });

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(function (d) { return d; });

    createTooltip();

}

function createTooltip() {
    tooltip = svg.append("g")
        .attr("id", "tooltip")
        .attr("transform", "translate(-1000,0)")
        .style("font", "12px sans-serif");

    let tooltip_bg = tooltip.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("rx", 5)
        .attr("ry", 5)
        .attr("width", 150)
        .attr("height", 60)
        .attr("fill", "#000000bb");

    let tool_text = tooltip.append("text")
        .attr("x", 10)
        .attr("y", 15)
        .attr("fill", "white")
        .attr("id", "tooltip_1");

    let tool_title = tool_text.append("tspan")
        .attr("id", "tooltip-title")
        .attr("x", 10)
        .attr("y", 15)
        .style("font-weight", "bold")
        .style("font-family", "'Dosis', sans-serif");

    let tooltip_text = tool_text.append("tspan")
        .attr("id", "tooltip-text")
        .attr("x", 10)
        .attr("y", 35)
        .style("font-weight", "regular")
        .style("font-family", "'Dosis', sans-serif");

    let tooltip_kioskos = tool_text.append("tspan")
        .attr("id", "tooltip-kioskos")
        .attr("x", 10)
        .attr("y", 50)
        .style("font-family", "'Dosis', sans-serif");
}

function mousemoved(d) {
    updateTooltip(d, keys[poblation], d3.mouse(this));
}

function mousemovedInd(d) {
    updateTooltip(d, "indigena", d3.mouse(this));
}

function mousemovedMayo(d) {
    updateTooltip(d, "mayoritaria", d3.mouse(this));
}

function mousemovedAfro(d) {
    updateTooltip(d, "afro", d3.mouse(this));
}

function updateTooltip(d, key, coords) {
    tooltip.attr("transform", `translate(${coords[0] + 15},${coords[1] - 25})`)
    tooltip.select("#tooltip-title")
        .text(d.municipio);

    tooltip.select("#tooltip-text")
        .text(`Población: ${key}`);

    tooltip.select('#tooltip-kioskos')
        .text(`Kioskos: ${d[key]}`);
    d3.event.preventDefault();
}

function mouseleave(d, i) {
    var coords = d3.mouse(this);
    tooltip.attr("transform", `translate(-1000,0)`)
}

function poblationChange() {
    var e = document.getElementById("poblationdd");
    poblation = e.options[e.selectedIndex].value;
    updateChart()
}

function sortChange() {
    var e = document.getElementById("sortdd");
    sort = e.options[e.selectedIndex].value;
    updateChart()
}



//Lectura de los datos

d3.csv(
    "https://rawgit.com/vgarzom/va_kioskos_vd_cauca_2017/master/data.csv",
    (d) => {
        kioskos.push(d);
    }
).then(() => {
    kioskos = d3.nest()
        .key(function (d) { return d.Municipio; })
        .key(function (d) { return d.Poblacion; })
        .entries(kioskos)
        .map((d) => {
            var m = { municipio: d.key, afro: 0, indigena: 0, mayoritaria: 0 };
            for (var i = 0; i < d.values.length; i++) {
                switch (d.values[i].key) {
                    case "MAYORITARIA":
                        m.mayoritaria = d.values[i].values.length;
                        break;
                    case "AFRO":
                        m.afro = d.values[i].values.length;
                        break;
                    default:
                        m.indigena = d.values[i].values.length;
                        break;
                }
            }
            m.total = m.indigena + m.afro + m.mayoritaria;
            return m
        })
    updateChart();
});
